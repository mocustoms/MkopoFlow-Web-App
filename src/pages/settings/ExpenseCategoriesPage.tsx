import { expenseCategorySchema } from "@mkopoflow/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { FiscalChip } from "../../components/fiscal/FiscalChip";
import { SettingsContentTable } from "../../components/settings/SettingsContentTable";
import { SettingsDataTable } from "../../components/settings/SettingsDataTable";
import { SettingsFormModal } from "../../components/settings/SettingsFormModal";
import { SettingsPageShell } from "../../components/settings/SettingsPageShell";
import { SettingsRowActions } from "../../components/settings/SettingsRowActions";
import {
  SettingsSelectField,
  SettingsTextField,
} from "../../components/settings/settings-fields";
import { useTranslation } from "../../context/LanguageContext";
import { useAppToast } from "../../hooks/useAppToast";
import { useIsAdmin, useSettingsToken } from "../../hooks/useSettingsToken";
import { filterTableRows, joinSearchParts } from "../../lib/filter-table-rows";
import { fiscal } from "../../lib/fiscal";
import { settingsApi, type ExpenseCategory } from "../../lib/settings-api";

function accountOptionLabel(code: string, name: string) {
  return `${code} — ${name}`;
}

export function ExpenseCategoriesPage() {
  const { t } = useTranslation();
  const token = useSettingsToken();
  const isAdmin = useIsAdmin();
  const queryClient = useQueryClient();
  const appToast = useAppToast();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ExpenseCategory | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [expenseAccountId, setExpenseAccountId] = useState("");
  const [liabilityAccountId, setLiabilityAccountId] = useState("");

  const query = useQuery({
    queryKey: ["settings", "expense-categories"],
    queryFn: () => settingsApi.expenseCategories.list(token!),
    enabled: !!token,
  });

  const accountsQuery = useQuery({
    queryKey: ["settings", "chart-of-accounts"],
    queryFn: () => settingsApi.chartOfAccounts.list(token!),
    enabled: !!token,
  });

  const expenseAccounts = useMemo(
    () => (accountsQuery.data ?? []).filter((a) => a.isActive && a.accountType === "EXPENSE"),
    [accountsQuery.data],
  );

  const liabilityAccounts = useMemo(
    () => (accountsQuery.data ?? []).filter((a) => a.isActive && a.accountType === "LIABILITY"),
    [accountsQuery.data],
  );

  const filtered = useMemo(
    () =>
      filterTableRows(query.data ?? [], search, (row) =>
        joinSearchParts(
          row.code,
          row.name,
          row.description,
          row.expenseAccountLabel,
          row.liabilityAccountLabel,
          row.isActive ? t("common.active") : t("common.inactive"),
        ),
      ),
    [query.data, search, t],
  );

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["settings", "expense-categories"] });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const parsed = expenseCategorySchema.safeParse({
        name,
        description: description || null,
        isActive,
        expenseAccountId,
        liabilityAccountId,
      });
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? t("common.invalidInput"));
      }
      if (editing) {
        return settingsApi.expenseCategories.update(token!, editing.id, parsed.data);
      }
      return settingsApi.expenseCategories.create(token!, parsed.data);
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
    mutationFn: (id: string) => settingsApi.expenseCategories.remove(token!, id),
    onSuccess: () => {
      invalidate();
      appToast.deleted();
    },
    onError: (err: Error) => appToast.error(err.message),
  });

  function pickDefaultAccounts() {
    const expense =
      expenseAccounts.find((a) => a.code === "5000") ?? expenseAccounts[0];
    const liability =
      liabilityAccounts.find((a) => a.code === "2150") ??
      liabilityAccounts.find((a) => a.code === "2110") ??
      liabilityAccounts[0];
    setExpenseAccountId(expense?.id ?? "");
    setLiabilityAccountId(liability?.id ?? "");
  }

  function openCreate() {
    setEditing(null);
    setName("");
    setDescription("");
    setIsActive(true);
    pickDefaultAccounts();
    setModalOpen(true);
  }

  function openEdit(cat: ExpenseCategory) {
    setEditing(cat);
    setName(cat.name);
    setDescription(cat.description ?? "");
    setIsActive(cat.isActive);
    setExpenseAccountId(cat.expenseAccountId);
    setLiabilityAccountId(cat.liabilityAccountId);
    setModalOpen(true);
  }

  const empty = (query.data ?? []).length === 0;
  const noResults = !empty && filtered.length === 0;
  const canSaveAccounts = expenseAccounts.length > 0 && liabilityAccounts.length > 0;

  return (
    <SettingsPageShell
      title={t("settings.expenseCategories.title")}
      loading={query.isLoading || accountsQuery.isLoading}
      error={query.error?.message ?? accountsQuery.error?.message}
      readOnly={!isAdmin}
    >
      <SettingsContentTable
        search={search}
        onSearchChange={setSearch}
        onAdd={isAdmin && canSaveAccounts ? openCreate : undefined}
        addLabel={t("settings.expenseCategories.addCategory")}
        showAdd={isAdmin}
        totalCount={query.data?.length}
        filteredCount={filtered.length}
        empty={empty || noResults}
        emptyMessage={
          empty
            ? canSaveAccounts
              ? t("settings.expenseCategories.noCategories")
              : t("settings.expenseCategories.needAccounts")
            : t("settings.table.noResults")
        }
      >
        <SettingsDataTable
          ariaLabel={t("settings.expenseCategories.title")}
          items={filtered}
          columns={[
            {
              key: "code",
              header: t("settings.expenseCategories.code"),
              cellClassName: fiscal.figure,
              render: (row) => row.code,
            },
            {
              key: "name",
              header: t("settings.expenseCategories.expenseName"),
              isRowHeader: true,
              cellClassName: fiscal.heading,
              render: (row) => row.name,
            },
            {
              key: "description",
              header: t("common.description"),
              cellClassName: fiscal.label,
              render: (row) => row.description ?? "—",
            },
            {
              key: "expenseAccount",
              header: t("settings.expenseCategories.expenseAccount"),
              cellClassName: fiscal.label,
              render: (row) => row.expenseAccountLabel,
            },
            {
              key: "liabilityAccount",
              header: t("settings.expenseCategories.liabilityAccount"),
              cellClassName: fiscal.label,
              render: (row) => row.liabilityAccountLabel,
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
                  readOnly={!isAdmin}
                  onEdit={() => openEdit(row)}
                  onDelete={() => deleteMutation.mutate(row.id)}
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
            ? t("settings.expenseCategories.editCategory")
            : t("settings.expenseCategories.addCategory")
        }
        onSubmit={() => saveMutation.mutate()}
        isPending={saveMutation.isPending}
        submitLabel={editing ? t("common.update") : t("common.add")}
        readOnly={!isAdmin}
      >
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
        >
          {editing && (
            <SettingsTextField
              id="expenseCode"
              className="sm:col-span-2"
              label={t("settings.expenseCategories.code")}
              value={editing.code}
              disabled
            />
          )}
          <SettingsTextField
            id="expenseName"
            className="sm:col-span-2"
            label={t("settings.expenseCategories.expenseName")}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <SettingsTextField
            id="expenseDesc"
            className="sm:col-span-2"
            label={t("common.description")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <SettingsSelectField
            id="expenseAccount"
            className="sm:col-span-2"
            label={t("settings.expenseCategories.expenseAccount")}
            selectClassName={fiscal.select}
            value={expenseAccountId}
            onChange={(e) => setExpenseAccountId(e.target.value)}
          >
            <option value="">{t("settings.expenseCategories.selectAccount")}</option>
            {expenseAccounts.map((a) => (
              <option key={a.id} value={a.id}>
                {accountOptionLabel(a.code, a.name)}
              </option>
            ))}
          </SettingsSelectField>
          <SettingsSelectField
            id="liabilityAccount"
            className="sm:col-span-2"
            label={t("settings.expenseCategories.liabilityAccount")}
            selectClassName={fiscal.select}
            value={liabilityAccountId}
            onChange={(e) => setLiabilityAccountId(e.target.value)}
          >
            <option value="">{t("settings.expenseCategories.selectAccount")}</option>
            {liabilityAccounts.map((a) => (
              <option key={a.id} value={a.id}>
                {accountOptionLabel(a.code, a.name)}
              </option>
            ))}
          </SettingsSelectField>
          <label className={`flex items-center gap-2 sm:col-span-2 ${fiscal.label}`}>
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
