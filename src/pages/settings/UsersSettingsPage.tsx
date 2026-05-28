import { Label } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { FiscalChip } from "../../components/fiscal/FiscalChip";
import { SettingsContentTable } from "../../components/settings/SettingsContentTable";
import { SettingsDataTable } from "../../components/settings/SettingsDataTable";
import { SettingsFormModal } from "../../components/settings/SettingsFormModal";
import { SettingsPageShell } from "../../components/settings/SettingsPageShell";
import { SettingsRowActions } from "../../components/settings/SettingsRowActions";
import { SettingsSelectField } from "../../components/settings/settings-fields";
import { useTranslation } from "../../context/LanguageContext";
import { useAppToast } from "../../hooks/useAppToast";
import { useCan, useSettingsToken } from "../../hooks/useSettingsToken";
import { filterTableRows, joinSearchParts } from "../../lib/filter-table-rows";
import { branchesApi } from "../../lib/branches-api";
import { fiscal } from "../../lib/fiscal";
import { settingsApi, type TenantUser } from "../../lib/settings-api";

export function UsersSettingsPage() {
  const { t } = useTranslation();
  const token = useSettingsToken();
  const canEditUsers = useCan("settings.users", "edit");
  const queryClient = useQueryClient();
  const appToast = useAppToast();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TenantUser | null>(null);
  const [branchIds, setBranchIds] = useState<string[]>([]);
  const [tenantRoleId, setTenantRoleId] = useState<string>("");

  const query = useQuery({
    queryKey: ["settings", "users"],
    queryFn: () => settingsApi.users.list(token!),
    enabled: !!token,
  });

  const branchesQuery = useQuery({
    queryKey: ["branches"],
    queryFn: () => branchesApi.list(token!),
    enabled: !!token && modalOpen,
  });

  const rolesQuery = useQuery({
    queryKey: ["settings", "roles"],
    queryFn: () => settingsApi.roles.list(token!),
    enabled: !!token && modalOpen,
  });

  const activeBranches = useMemo(
    () => (branchesQuery.data ?? []).filter((b) => b.isActive),
    [branchesQuery.data],
  );

  function roleLabel(role: string) {
    if (role === "ADMIN") return t("roles.admin");
    if (role === "LOAN_OFFICER") return t("roles.loanOfficer");
    return t("roles.viewer");
  }

  function branchLabels(user: TenantUser) {
    return user.branches.map((b) => `${b.code} — ${b.name}`);
  }

  function displayRole(user: TenantUser) {
    return user.tenantRole?.name ?? roleLabel(user.role);
  }

  const filtered = useMemo(
    () =>
      filterTableRows(query.data ?? [], search, (user) =>
        joinSearchParts(
          user.name,
          user.email,
          displayRole(user),
          user.tenantRole?.code,
          ...branchLabels(user),
        ),
      ),
    [query.data, search, t],
  );

  const activeRoles = useMemo(
    () => (rolesQuery.data ?? []).filter((r) => r.isActive),
    [rolesQuery.data],
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      await settingsApi.users.updateRole(
        token!,
        editing.id,
        tenantRoleId || null,
      );
      return settingsApi.users.updateBranches(token!, editing.id, branchIds);
    },
    onSuccess: () => {
      setModalOpen(false);
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ["settings", "users"] });
      appToast.updated();
    },
    onError: (err: Error) => appToast.error(err.message),
  });

  function openEdit(user: TenantUser) {
    setEditing(user);
    setBranchIds(user.branchIds);
    setTenantRoleId(user.tenantRoleId ?? "");
    setModalOpen(true);
  }

  function openView(user: TenantUser) {
    setEditing(user);
    setModalOpen(true);
  }

  function toggleBranch(branchId: string, checked: boolean) {
    setBranchIds((current) => {
      if (checked) return current.includes(branchId) ? current : [...current, branchId];
      return current.filter((id) => id !== branchId);
    });
  }

  const empty = (query.data ?? []).length === 0;
  const noResults = !empty && filtered.length === 0;
  const readOnlyModal = !canEditUsers;

  return (
    <SettingsPageShell
      title={t("settings.users.title")}
      loading={query.isLoading}
      error={query.error?.message}
    >
      <SettingsContentTable
        search={search}
        onSearchChange={setSearch}
        showAdd={false}
        totalCount={query.data?.length}
        filteredCount={filtered.length}
        empty={empty || noResults}
        emptyMessage={empty ? t("settings.users.noUsers") : t("settings.table.noResults")}
      >
        <SettingsDataTable
          ariaLabel={t("settings.users.title")}
          items={filtered}
          columns={[
            {
              key: "name",
              header: t("common.name"),
              isRowHeader: true,
              cellClassName: fiscal.heading,
              render: (user) => user.name ?? "—",
            },
            {
              key: "email",
              header: t("common.email"),
              cellClassName: fiscal.label,
              render: (user) => user.email,
            },
            {
              key: "role",
              header: t("common.role"),
              render: (user) => (
                <FiscalChip variant={user.role === "ADMIN" ? "accent" : "success"}>
                  {displayRole(user)}
                </FiscalChip>
              ),
            },
            {
              key: "branches",
              header: t("settings.users.branches"),
              render: (user) =>
                user.branches.length === 0 ? (
                  <span className={fiscal.label}>—</span>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {user.branches.map((b) => (
                      <FiscalChip key={b.id} variant="success">
                        {b.code}
                      </FiscalChip>
                    ))}
                  </div>
                ),
            },
            {
              key: "actions",
              header: t("common.actions"),
              align: "end",
              render: (user) => (
                <SettingsRowActions
                  readOnly={!canEditUsers}
                  onView={!canEditUsers ? () => openView(user) : undefined}
                  onEdit={canEditUsers ? () => openEdit(user) : undefined}
                />
              ),
            },
          ]}
        />
      </SettingsContentTable>

      <SettingsFormModal
        isOpen={modalOpen}
        onOpenChange={setModalOpen}
        title={
          readOnlyModal
            ? t("settings.users.viewUser")
            : t("settings.users.editUser")
        }
        readOnly={readOnlyModal}
        onSubmit={readOnlyModal ? undefined : () => saveMutation.mutate()}
        isPending={saveMutation.isPending}
        submitLabel={t("common.save")}
      >
        {editing && (
          <div className="flex flex-col gap-3">
            <dl className="grid gap-3">
              <div>
                <Label>{t("common.name")}</Label>
                <p className={`${fiscal.heading} mt-1 text-sm`}>{editing.name ?? "—"}</p>
              </div>
              <div>
                <Label>{t("common.email")}</Label>
                <p className={`${fiscal.label} mt-1 text-sm`}>{editing.email}</p>
              </div>
              <div>
                <Label>{t("common.role")}</Label>
                <p className={`${fiscal.label} mt-1 text-sm`}>
                  {editing.tenantRole?.name ?? roleLabel(editing.role)}
                </p>
              </div>
            </dl>

            {readOnlyModal ? (
              <div>
                <Label>{t("settings.users.branches")}</Label>
                {editing.branches.length === 0 ? (
                  <p className={`${fiscal.label} mt-1 text-sm`}>—</p>
                ) : (
                  <ul className={`${fiscal.label} mt-1 list-inside list-disc text-sm`}>
                    {editing.branches.map((b) => (
                      <li key={b.id}>
                        {b.code} — {b.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <>
                <SettingsSelectField
                  id="userRole"
                  label={t("settings.users.userRole")}
                  value={tenantRoleId}
                  onChange={(e) => setTenantRoleId(e.target.value)}
                >
                  <option value="">{t("settings.users.selectRole")}</option>
                  {activeRoles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </SettingsSelectField>
                <div className="flex flex-col gap-1.5">
                  <Label>{t("settings.users.branches")}</Label>
                  <div className={`max-h-56 overflow-y-auto rounded-md ${fiscal.border} p-3`}>
                    {activeBranches.length === 0 ? (
                      <p className={`${fiscal.label} text-sm`}>—</p>
                    ) : (
                      <div className="grid gap-2">
                        {activeBranches.map((b) => (
                          <label
                            key={b.id}
                            className={`flex items-center gap-2 text-sm ${fiscal.label}`}
                          >
                            <input
                              type="checkbox"
                              checked={branchIds.includes(b.id)}
                              onChange={(e) => toggleBranch(b.id, e.target.checked)}
                            />
                            <span>
                              {b.code} — {b.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className={`${fiscal.label} text-xs`}>
                    {t("settings.users.branchesHint")}
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </SettingsFormModal>
    </SettingsPageShell>
  );
}
