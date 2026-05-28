
import {
  SettingsSelectField,
  SettingsTextField,
} from "../../components/settings/settings-fields";
import { chartOfAccountSchema } from "@mkopoflow/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { FiscalChip } from "../../components/fiscal/FiscalChip";
import { SettingsContentTable } from "../../components/settings/SettingsContentTable";
import { SettingsDataTable } from "../../components/settings/SettingsDataTable";
import { SettingsFormModal } from "../../components/settings/SettingsFormModal";
import { SettingsPageShell } from "../../components/settings/SettingsPageShell";
import { SettingsRowActions } from "../../components/settings/SettingsRowActions";
import { useTranslation } from "../../context/LanguageContext";
import { useAppToast } from "../../hooks/useAppToast";
import { useCan, useSettingsToken } from "../../hooks/useSettingsToken";
import { filterTableRows, joinSearchParts } from "../../lib/filter-table-rows";
import { fiscal } from "../../lib/fiscal";
import { settingsApi, type ChartOfAccount } from "../../lib/settings-api";

export function ChartOfAccountsPage() {
  const { t } = useTranslation();
  const token = useSettingsToken();
  const canAdd = useCan("financing.chartOfAccounts", "add");
  const canEdit = useCan("financing.chartOfAccounts", "edit");
  const queryClient = useQueryClient();
  const appToast = useAppToast();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState("ASSET");
  const [editing, setEditing] = useState<ChartOfAccount | null>(null);

  const accountTypes = [
    { value: "ASSET", label: t("financing.chartOfAccounts.asset") },
    { value: "LIABILITY", label: t("financing.chartOfAccounts.liability") },
    { value: "REVENUE", label: t("financing.chartOfAccounts.revenue") },
    { value: "EXPENSE", label: t("financing.chartOfAccounts.expense") },
  ] as const;

  const query = useQuery({
    queryKey: ["settings", "chart-of-accounts"],
    queryFn: () => settingsApi.chartOfAccounts.list(token!),
    enabled: !!token,
  });

  const filtered = useMemo(
    () =>
      filterTableRows(query.data ?? [], search, (row) =>
        joinSearchParts(
          row.code,
          row.name,
          row.accountType,
          row.isSystem ? t("common.system") : t("common.custom"),
        ),
      ),
    [query.data, search, t],
  );

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["settings", "chart-of-accounts"] });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const parsed = chartOfAccountSchema.safeParse({
        code,
        name,
        accountType,
        isActive: editing?.isActive ?? true,
      });
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? t("common.invalidInput"));
      }
      if (editing) {
        return settingsApi.chartOfAccounts.update(token!, editing.id, parsed.data);
      }
      return settingsApi.chartOfAccounts.create(token!, parsed.data);
    },
    onSuccess: () => {
      const wasEdit = !!editing;
      setModalOpen(false);
      setEditing(null);
      setCode("");
      setName("");
      invalidate();
      wasEdit ? appToast.updated() : appToast.created();
    },
    onError: (err: Error) => appToast.error(err.message),
  });

  function openCreate() {
    setEditing(null);
    setCode("");
    setName("");
    setAccountType("ASSET");
    setModalOpen(true);
  }

  function openEdit(row: ChartOfAccount) {
    if (row.isSystem) return;
    setEditing(row);
    setCode(row.code);
    setName(row.name);
    setAccountType(row.accountType);
    setModalOpen(true);
  }

  const empty = (query.data ?? []).length === 0;
  const noResults = !empty && filtered.length === 0;
  const selectClass = fiscal.select;

  return (
    <SettingsPageShell
      title={t("financing.chartOfAccounts.title")}
      loading={query.isLoading}
      error={query.error?.message}
      readOnly={!canAdd && !canEdit}
    >
      <SettingsContentTable
        search={search}
        onSearchChange={setSearch}
        onAdd={canAdd ? openCreate : undefined}
        addLabel={t("financing.chartOfAccounts.addAccount")}
        showAdd={canAdd}
        totalCount={query.data?.length}
        filteredCount={filtered.length}
        empty={empty || noResults}
        emptyMessage={t("settings.table.noResults")}
      >
        <SettingsDataTable
          ariaLabel={t("financing.chartOfAccounts.title")}
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
              key: "type",
              header: t("common.type"),
              cellClassName: fiscal.label,
              render: (row) => row.accountType,
            },
            {
              key: "source",
              header: t("common.source"),
              render: (row) => (
                <FiscalChip variant={row.isSystem ? "accent" : "success"}>
                  {row.isSystem ? t("common.system") : t("common.custom")}
                </FiscalChip>
              ),
            },
            {
              key: "actions",
              header: t("common.actions"),
              align: "end",
              render: (row) => (
                <SettingsRowActions
                  readOnly={!canEdit || row.isSystem}
                  onEdit={canEdit && !row.isSystem ? () => openEdit(row) : undefined}
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
          editing
            ? t("financing.chartOfAccounts.editAccount")
            : t("financing.chartOfAccounts.addAccount")
        }
        onSubmit={() => saveMutation.mutate()}
        isPending={saveMutation.isPending}
        submitLabel={editing ? t("common.update") : t("common.add")}
      >
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
        >
          <SettingsTextField
            id="acctCode"
            label={t("common.code")}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <SettingsTextField
            id="acctName"
            label={t("financing.chartOfAccounts.accountName")}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <SettingsSelectField
            id="acctType"
            className="sm:col-span-2"
            label={t("common.type")}
            selectClassName={selectClass}
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
          >
            {accountTypes.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </SettingsSelectField>
        </form>
      </SettingsFormModal>
    </SettingsPageShell>
  );
}
