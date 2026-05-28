import { customerCategorySchema } from "@mkopoflow/shared";
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
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../context/LanguageContext";
import { useAppToast } from "../../hooks/useAppToast";
import { useCan, useSettingsToken } from "../../hooks/useSettingsToken";
import { filterTableRows, joinSearchParts } from "../../lib/filter-table-rows";
import { fiscal } from "../../lib/fiscal";
import { settingsApi, type CustomerCategory } from "../../lib/settings-api";
import { DashboardLayout } from "../../layouts/DashboardLayout";

function accountOptionLabel(code: string, name: string) {
  return `${code} — ${name}`;
}

export function CustomerGroupsPage() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const token = useSettingsToken();
  const canAdd = useCan("customers.groups", "add");
  const canEdit = useCan("customers.groups", "edit");
  const canDelete = useCan("customers.groups", "delete");
  const queryClient = useQueryClient();
  const appToast = useAppToast();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CustomerCategory | null>(null);
  const [name, setName] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [receivableAccountId, setReceivableAccountId] = useState("");
  const [liabilityAccountId, setLiabilityAccountId] = useState("");

  const query = useQuery({
    queryKey: ["settings", "customer-categories"],
    queryFn: () => settingsApi.customerCategories.list(token!),
    enabled: !!token,
  });

  const accountsQuery = useQuery({
    queryKey: ["settings", "chart-of-accounts"],
    queryFn: () => settingsApi.chartOfAccounts.list(token!),
    enabled: !!token,
  });

  const assetAccounts = useMemo(
    () => (accountsQuery.data ?? []).filter((a) => a.isActive && a.accountType === "ASSET"),
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
          row.name,
          row.receivableAccountLabel,
          row.liabilityAccountLabel,
          row.isDefault ? t("settings.customerCategories.defaultYes") : "",
        ),
      ),
    [query.data, search, t],
  );

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["settings", "customer-categories"] });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const parsed = customerCategorySchema.safeParse({
        name,
        isDefault,
        receivableAccountId,
        liabilityAccountId,
      });
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? t("common.invalidInput"));
      }
      if (editing) {
        return settingsApi.customerCategories.update(token!, editing.id, parsed.data);
      }
      return settingsApi.customerCategories.create(token!, parsed.data);
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
    mutationFn: (id: string) => settingsApi.customerCategories.remove(token!, id),
    onSuccess: () => {
      invalidate();
      appToast.deleted();
    },
    onError: (err: Error) => appToast.error(err.message),
  });

  function pickDefaultAccounts() {
    const recv =
      assetAccounts.find((a) => a.code === "1200") ??
      assetAccounts.find((a) => a.code === "1210") ??
      assetAccounts[0];
    const liab =
      liabilityAccounts.find((a) => a.code === "2110") ??
      liabilityAccounts.find((a) => a.code === "2100") ??
      liabilityAccounts[0];
    setReceivableAccountId(recv?.id ?? "");
    setLiabilityAccountId(liab?.id ?? "");
  }

  function openCreate() {
    setEditing(null);
    setName("");
    setIsDefault((query.data ?? []).length === 0);
    pickDefaultAccounts();
    setModalOpen(true);
  }

  function openEdit(row: CustomerCategory) {
    setEditing(row);
    setName(row.name);
    setIsDefault(row.isDefault);
    setReceivableAccountId(row.receivableAccountId);
    setLiabilityAccountId(row.liabilityAccountId);
    setModalOpen(true);
  }

  const empty = (query.data ?? []).length === 0;
  const noResults = !empty && filtered.length === 0;
  const canSaveAccounts = assetAccounts.length > 0 && liabilityAccounts.length > 0;
  const pageTitle = t("nav.customerGroups");

  return (
    <DashboardLayout onSignOut={logout} title={pageTitle}>
      <SettingsPageShell
        title={pageTitle}
        loading={query.isLoading || accountsQuery.isLoading}
        error={query.error?.message ?? accountsQuery.error?.message}
        readOnly={!canAdd && !canEdit && !canDelete}
      >
        <SettingsContentTable
          search={search}
          onSearchChange={setSearch}
          onAdd={canAdd && canSaveAccounts ? openCreate : undefined}
          addLabel={t("settings.customerCategories.addCategory")}
          showAdd={canAdd}
          totalCount={query.data?.length}
          filteredCount={filtered.length}
          empty={empty || noResults}
          emptyMessage={
            empty
              ? canSaveAccounts
                ? t("settings.customerCategories.noCategories")
                : t("settings.customerCategories.needAccounts")
              : t("settings.table.noResults")
          }
        >
          <SettingsDataTable
            ariaLabel={pageTitle}
            items={filtered}
            columns={[
              {
                key: "name",
                header: t("settings.customerCategories.categoryName"),
                isRowHeader: true,
                cellClassName: fiscal.heading,
                render: (row) => row.name,
              },
              {
                key: "isDefault",
                header: t("settings.customerCategories.isDefault"),
                render: (row) =>
                  row.isDefault ? (
                    <FiscalChip variant="accent">
                      {t("settings.customerCategories.defaultYes")}
                    </FiscalChip>
                  ) : (
                    <span className="fiscal-label">—</span>
                  ),
              },
              {
                key: "receivable",
                header: t("settings.customerCategories.receivableAccount"),
                cellClassName: fiscal.label,
                render: (row) => row.receivableAccountLabel,
              },
              {
                key: "liability",
                header: t("settings.customerCategories.liabilityAccount"),
                cellClassName: fiscal.label,
                render: (row) => row.liabilityAccountLabel,
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
          title={
            editing
              ? t("settings.customerCategories.editCategory")
              : t("settings.customerCategories.addCategory")
          }
          onSubmit={() => saveMutation.mutate()}
          isPending={saveMutation.isPending}
          submitLabel={editing ? t("common.update") : t("common.add")}
          readOnly={editing ? !canEdit : !canAdd}
        >
          <form
            className="grid gap-3 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              saveMutation.mutate();
            }}
          >
            <SettingsTextField
              id="categoryName"
              className="sm:col-span-2"
              label={t("settings.customerCategories.categoryName")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <SettingsSelectField
              id="receivableAccount"
              className="sm:col-span-2"
              label={t("settings.customerCategories.receivableAccount")}
              selectClassName={fiscal.select}
              value={receivableAccountId}
              onChange={(e) => setReceivableAccountId(e.target.value)}
            >
              <option value="">{t("settings.customerCategories.selectAccount")}</option>
              {assetAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {accountOptionLabel(a.code, a.name)}
                </option>
              ))}
            </SettingsSelectField>
            <SettingsSelectField
              id="liabilityAccount"
              className="sm:col-span-2"
              label={t("settings.customerCategories.liabilityAccount")}
              selectClassName={fiscal.select}
              value={liabilityAccountId}
              onChange={(e) => setLiabilityAccountId(e.target.value)}
            >
              <option value="">{t("settings.customerCategories.selectAccount")}</option>
              {liabilityAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {accountOptionLabel(a.code, a.name)}
                </option>
              ))}
            </SettingsSelectField>
            <label className={`flex items-center gap-2 sm:col-span-2 ${fiscal.label}`}>
              <input
                type="checkbox"
                checked={isDefault}
                disabled={editing?.isDefault && (query.data?.length ?? 0) <= 1}
                onChange={(e) => setIsDefault(e.target.checked)}
              />
              {t("settings.customerCategories.isDefault")}
            </label>
          </form>
        </SettingsFormModal>
      </SettingsPageShell>
    </DashboardLayout>
  );
}
