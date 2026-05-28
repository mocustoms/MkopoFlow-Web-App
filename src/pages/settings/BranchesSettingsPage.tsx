import { branchSchema } from "@mkopoflow/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { FiscalChip } from "../../components/fiscal/FiscalChip";
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
import { branchesApi, type Branch } from "../../lib/branches-api";
import { fiscal } from "../../lib/fiscal";

export function BranchesSettingsPage() {
  const { t } = useTranslation();
  const token = useSettingsToken();
  const canAdd = useCan("settings.branches", "add");
  const canEdit = useCan("settings.branches", "edit");
  const canDelete = useCan("settings.branches", "delete");
  const queryClient = useQueryClient();
  const appToast = useAppToast();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [isActive, setIsActive] = useState(true);

  const query = useQuery({
    queryKey: ["branches"],
    queryFn: () => branchesApi.list(token!),
    enabled: !!token,
  });

  const filtered = useMemo(
    () =>
      filterTableRows(query.data ?? [], search, (row) =>
        joinSearchParts(
          row.code,
          row.name,
          row.address,
          row.phone,
          row.isActive ? t("common.active") : t("common.inactive"),
        ),
      ),
    [query.data, search, t],
  );

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["branches"] });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const parsed = branchSchema.safeParse({
        name,
        address: address || null,
        phone: phone || null,
        isActive,
      });
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? t("common.invalidInput"));
      }
      if (editing) {
        return branchesApi.update(token!, editing.id, parsed.data);
      }
      return branchesApi.create(token!, parsed.data);
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
    mutationFn: (id: string) => branchesApi.remove(token!, id),
    onSuccess: () => {
      invalidate();
      appToast.deleted();
    },
    onError: (err: Error) => appToast.error(err.message),
  });

  function openCreate() {
    setEditing(null);
    setName("");
    setAddress("");
    setPhone("");
    setIsActive(true);
    setModalOpen(true);
  }

  function openEdit(row: Branch) {
    setEditing(row);
    setName(row.name);
    setAddress(row.address ?? "");
    setPhone(row.phone ?? "");
    setIsActive(row.isActive);
    setModalOpen(true);
  }

  const empty = (query.data ?? []).length === 0;
  const noResults = !empty && filtered.length === 0;

  return (
    <SettingsPageShell
      title={t("settings.branches.title")}
      loading={query.isLoading}
      error={query.error?.message}
      readOnly={!canAdd && !canEdit && !canDelete}
    >
      <SettingsContentTable
        search={search}
        onSearchChange={setSearch}
        onAdd={canAdd ? openCreate : undefined}
        addLabel={t("settings.branches.addBranch")}
        showAdd={canAdd}
        totalCount={query.data?.length}
        filteredCount={filtered.length}
        empty={empty || noResults}
        emptyMessage={empty ? t("settings.branches.noBranches") : t("settings.table.noResults")}
      >
        <SettingsDataTable
          ariaLabel={t("settings.branches.title")}
          items={filtered}
          columns={[
            {
              key: "code",
              header: t("common.code"),
              cellClassName: fiscal.figure,
              render: (row) => row.code,
            },
            {
              key: "name",
              header: t("common.name"),
              isRowHeader: true,
              cellClassName: fiscal.heading,
              render: (row) => row.name,
            },
            {
              key: "phone",
              header: t("common.phone"),
              cellClassName: fiscal.label,
              render: (row) => row.phone ?? "—",
            },
            {
              key: "address",
              header: t("settings.company.address"),
              cellClassName: fiscal.label,
              render: (row) => row.address ?? "—",
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
                  onDelete={canDelete ? () => deleteMutation.mutate(row.id) : undefined}
                />
              ),
            },
          ]}
        />
      </SettingsContentTable>

      <SettingsFormModal
        isOpen={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? t("settings.branches.editBranch") : t("settings.branches.addBranch")}
        onSubmit={() => saveMutation.mutate()}
        isPending={saveMutation.isPending}
        submitLabel={editing ? t("common.update") : t("common.add")}
        readOnly={editing ? !canEdit : !canAdd}
      >
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
        >
          {editing && (
            <SettingsTextField
              id="branchCode"
              label={t("common.code")}
              value={editing.code}
              disabled
            />
          )}
          <SettingsTextField
            id="branchName"
            label={t("common.name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <SettingsTextField
            id="branchPhone"
            label={t("common.phone")}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("common.optional")}
          />
          <SettingsTextAreaField
            id="branchAddress"
            label={t("settings.company.address")}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={t("common.optional")}
          />
          <label className={`flex items-center gap-2 ${fiscal.label}`}>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            {t("common.active")}
          </label>
        </form>
      </SettingsFormModal>
    </SettingsPageShell>
  );
}
