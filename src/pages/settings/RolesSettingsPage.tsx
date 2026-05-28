import {
  allPermissionFlagsTrue,
  emptyPermissionFlags,
  tenantRoleSchema,
  type PermissionAction,
} from "@mkopoflow/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { FiscalChip } from "../../components/fiscal/FiscalChip";
import { PermissionMatrixTable } from "../../components/settings/PermissionMatrixTable";
import { SettingsContentTable } from "../../components/settings/SettingsContentTable";
import { SettingsDataTable } from "../../components/settings/SettingsDataTable";
import { SettingsFormModal } from "../../components/settings/SettingsFormModal";
import { SettingsPageShell } from "../../components/settings/SettingsPageShell";
import { SettingsRowActions } from "../../components/settings/SettingsRowActions";
import {
  SettingsTextAreaField,
  SettingsTextField,
} from "../../components/settings/settings-fields";
import { useTranslation } from "../../context/LanguageContext";
import { useAppToast } from "../../hooks/useAppToast";
import { useCan, useSettingsToken } from "../../hooks/useSettingsToken";
import { filterTableRows, joinSearchParts } from "../../lib/filter-table-rows";
import { fiscal } from "../../lib/fiscal";
import {
  mapToPermissions,
  mergeRolePermissions,
  permissionsToMap,
} from "../../lib/role-permissions";
import { settingsApi, type TenantRole } from "../../lib/settings-api";

const DEFAULT_EXPANDED = new Set(["customers", "financing", "settings"]);

export function RolesSettingsPage() {
  const { t } = useTranslation();
  const token = useSettingsToken();
  const canAdd = useCan("settings.roles", "add");
  const canEdit = useCan("settings.roles", "edit");
  const canDelete = useCan("settings.roles", "delete");
  const queryClient = useQueryClient();
  const appToast = useAppToast();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TenantRole | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [permissionMap, setPermissionMap] = useState(permissionsToMap([]));
  const [expandedKeys, setExpandedKeys] = useState(DEFAULT_EXPANDED);

  const query = useQuery({
    queryKey: ["settings", "roles"],
    queryFn: () => settingsApi.roles.list(token!),
    enabled: !!token,
  });

  const filtered = useMemo(
    () =>
      filterTableRows(query.data ?? [], search, (row) =>
        joinSearchParts(
          row.code,
          row.name,
          row.description,
          row.isSystem ? t("common.system") : t("settings.roles.custom"),
          row.isActive ? t("common.active") : t("common.inactive"),
        ),
      ),
    [query.data, search, t],
  );

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["settings", "roles"] });

  const isSystem = editing?.isSystem ?? false;
  const modalReadOnly = editing ? !canEdit : !canAdd;

  const saveMutation = useMutation({
    mutationFn: async () => {
      const parsed = tenantRoleSchema.safeParse({
        name,
        code: code.toUpperCase().replace(/[^A-Z0-9_]/g, "_"),
        description: description || null,
        isActive,
        permissions: mapToPermissions(permissionMap),
      });
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? t("common.invalidInput"));
      }
      if (editing) {
        return settingsApi.roles.update(token!, editing.id, parsed.data);
      }
      return settingsApi.roles.create(token!, parsed.data);
    },
    onSuccess: () => {
      const wasEdit = !!editing;
      setModalOpen(false);
      setEditing(null);
      invalidate();
      wasEdit ? appToast.updated() : appToast.created();
    },
    onError: (err: Error) => appToast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => settingsApi.roles.remove(token!, id),
    onSuccess: () => {
      invalidate();
      appToast.deleted();
    },
    onError: (err: Error) => appToast.error(err.message),
  });

  function suggestCodeFromName(value: string) {
    const next = value
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "_")
      .replace(/[^A-Z0-9_]/g, "")
      .slice(0, 32);
    if (next && /^[A-Z]/.test(next)) setCode(next);
    else if (next) setCode(`R_${next}`.slice(0, 32));
  }

  function openCreate() {
    setEditing(null);
    setName("");
    setCode("");
    setDescription("");
    setIsActive(true);
    setPermissionMap(permissionsToMap(mergeRolePermissions([])));
    setExpandedKeys(new Set(DEFAULT_EXPANDED));
    setModalOpen(true);
  }

  function openEdit(row: TenantRole) {
    setEditing(row);
    setName(row.name);
    setCode(row.code);
    setDescription(row.description ?? "");
    setIsActive(row.isActive);
    setPermissionMap(permissionsToMap(row.permissions));
    setExpandedKeys(new Set(DEFAULT_EXPANDED));
    setModalOpen(true);
  }

  function handlePermissionChange(resourceKey: string, action: PermissionAction, value: boolean) {
    const flagKey =
      action === "add"
        ? "canAdd"
        : action === "edit"
          ? "canEdit"
          : action === "view"
            ? "canView"
            : action === "delete"
              ? "canDelete"
              : action === "printExcel"
                ? "canPrintExcel"
                : "canPrintPdf";
    setPermissionMap((prev) => ({
      ...prev,
      [resourceKey]: {
        ...emptyPermissionFlags(),
        ...prev[resourceKey],
        [flagKey]: value,
      },
    }));
  }

  function handleBulkPermissionChange(
    resourceKeys: string[],
    value: boolean,
    scope: { action: PermissionAction } | { allActions: true },
  ) {
    setPermissionMap((prev) => {
      const next = { ...prev };
      for (const resourceKey of resourceKeys) {
        if ("allActions" in scope) {
          next[resourceKey] = value ? allPermissionFlagsTrue() : emptyPermissionFlags();
        } else {
          const flagKey =
            scope.action === "add"
              ? "canAdd"
              : scope.action === "edit"
                ? "canEdit"
                : scope.action === "view"
                  ? "canView"
                  : scope.action === "delete"
                    ? "canDelete"
                    : scope.action === "printExcel"
                      ? "canPrintExcel"
                      : "canPrintPdf";
          next[resourceKey] = {
            ...emptyPermissionFlags(),
            ...next[resourceKey],
            [flagKey]: value,
          };
        }
      }
      return next;
    });
  }

  function toggleExpand(key: string) {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const empty = (query.data ?? []).length === 0;
  const noResults = !empty && filtered.length === 0;

  return (
    <SettingsPageShell
      title={t("settings.roles.title")}
      loading={query.isLoading}
      error={query.error?.message}
      readOnly={!canAdd && !canEdit && !canDelete}
    >
      <SettingsContentTable
        search={search}
        onSearchChange={setSearch}
        onAdd={canAdd ? openCreate : undefined}
        addLabel={t("settings.roles.addRole")}
        showAdd={canAdd}
        totalCount={query.data?.length}
        filteredCount={filtered.length}
        empty={empty || noResults}
        emptyMessage={empty ? t("settings.roles.noRoles") : t("settings.table.noResults")}
      >
        <SettingsDataTable
          ariaLabel={t("settings.roles.title")}
          items={filtered}
          columns={[
            {
              key: "name",
              header: t("settings.roles.roleName"),
              isRowHeader: true,
              cellClassName: fiscal.heading,
              render: (row) => row.name,
            },
            {
              key: "code",
              header: t("settings.roles.roleCode"),
              cellClassName: fiscal.figure,
              render: (row) => row.code,
            },
            {
              key: "description",
              header: t("common.description"),
              cellClassName: fiscal.label,
              render: (row) => row.description ?? "—",
            },
            {
              key: "type",
              header: t("common.type"),
              render: (row) => (
                <FiscalChip variant={row.isSystem ? "accent" : "neutral"}>
                  {row.isSystem ? t("common.system") : t("settings.roles.custom")}
                </FiscalChip>
              ),
            },
            {
              key: "status",
              header: t("common.status"),
              render: (row) => (
                <FiscalChip variant={row.isActive ? "success" : "accent"}>
                  {row.isActive ? t("common.active") : t("common.inactive")}
                </FiscalChip>
              ),
            },
            {
              key: "actions",
              header: t("common.actions"),
              align: "end",
              render: (row) => (
                <SettingsRowActions
                  readOnly={!canEdit && !canDelete}
                  onEdit={canEdit ? () => openEdit(row) : undefined}
                  onDelete={
                    canDelete && !row.isSystem
                      ? () => deleteMutation.mutate(row.id)
                      : undefined
                  }
                  deleteDisabled={row.isSystem}
                  confirmDeleteMessage={t("settings.roles.confirmDelete")}
                />
              ),
            },
          ]}
        />
      </SettingsContentTable>

      <SettingsFormModal
        isOpen={modalOpen}
        onOpenChange={setModalOpen}
        size="2xl"
        bodyClassName="max-h-[min(70vh,42rem)]"
        title={
          editing ? t("settings.roles.editRole") : t("settings.roles.addRole")
        }
        onSubmit={() => saveMutation.mutate()}
        isPending={saveMutation.isPending}
        submitLabel={editing ? t("common.update") : t("common.add")}
        readOnly={modalReadOnly}
      >
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <SettingsTextField
              id="roleName"
              label={t("settings.roles.roleName")}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!editing) suggestCodeFromName(e.target.value);
              }}
              disabled={modalReadOnly}
            />
            <SettingsTextField
              id="roleCode"
              label={t("settings.roles.roleCode")}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              disabled={modalReadOnly || isSystem}
            />
            <SettingsTextAreaField
              id="roleDescription"
              className="sm:col-span-2"
              label={t("common.description")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("common.optional")}
              disabled={modalReadOnly}
            />
            <label className={`flex items-center gap-2 sm:col-span-2 ${fiscal.label}`}>
              <input
                type="checkbox"
                checked={isActive}
                disabled={modalReadOnly}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              {t("common.active")}
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <p className={`${fiscal.heading} text-sm`}>{t("settings.roles.permissionMatrix")}</p>
            <PermissionMatrixTable
              permissions={permissionMap}
              onChange={handlePermissionChange}
              onBulkChange={handleBulkPermissionChange}
              expandedKeys={expandedKeys}
              onToggleExpand={toggleExpand}
              readOnly={modalReadOnly}
            />
          </div>
        </form>
      </SettingsFormModal>
    </SettingsPageShell>
  );
}
