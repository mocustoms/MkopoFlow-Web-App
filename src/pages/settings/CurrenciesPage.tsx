
import { SettingsTextField } from "../../components/settings/settings-fields";
import { currencySchema } from "@mkopoflow/shared";
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
import { useIsAdmin, useSettingsToken } from "../../hooks/useSettingsToken";
import { filterTableRows, joinSearchParts } from "../../lib/filter-table-rows";
import { fiscal } from "../../lib/fiscal";
import { settingsApi, type TenantCurrency } from "../../lib/settings-api";

export function CurrenciesPage() {
  const { t } = useTranslation();
  const token = useSettingsToken();
  const isAdmin = useIsAdmin();
  const queryClient = useQueryClient();
  const appToast = useAppToast();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TenantCurrency | null>(null);
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const query = useQuery({
    queryKey: ["settings", "currencies"],
    queryFn: () => settingsApi.currencies.list(token!),
    enabled: !!token,
  });

  const filtered = useMemo(
    () =>
      filterTableRows(query.data ?? [], search, (row) =>
        joinSearchParts(
          row.name,
          row.symbol,
          row.isDefault ? t("settings.currencies.defaultYes") : "",
          row.isActive ? t("common.active") : t("common.inactive"),
        ),
      ),
    [query.data, search, t],
  );

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["settings", "currencies"] });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const parsed = currencySchema.safeParse({ name, symbol, isDefault, isActive });
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? t("common.invalidInput"));
      }
      if (editing) {
        return settingsApi.currencies.update(token!, editing.id, parsed.data);
      }
      return settingsApi.currencies.create(token!, parsed.data);
    },
    onSuccess: () => {
      const wasEdit = !!editing;
      setModalOpen(false);
      setEditing(null);
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["settings", "company"] });
      wasEdit ? appToast.updated() : appToast.created();
    },
    onError: (err: Error) => appToast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => settingsApi.currencies.remove(token!, id),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["settings", "company"] });
      appToast.deleted();
    },
    onError: (err: Error) => appToast.error(err.message),
  });

  function openCreate() {
    setEditing(null);
    setName("");
    setSymbol("");
    setIsDefault((query.data ?? []).length === 0);
    setIsActive(true);
    setModalOpen(true);
  }

  function openEdit(row: TenantCurrency) {
    setEditing(row);
    setName(row.name);
    setSymbol(row.symbol);
    setIsDefault(row.isDefault);
    setIsActive(row.isActive);
    setModalOpen(true);
  }

  const empty = (query.data ?? []).length === 0;
  const noResults = !empty && filtered.length === 0;

  return (
    <SettingsPageShell
      title={t("settings.currencies.title")}
      loading={query.isLoading}
      error={query.error?.message}
      readOnly={!isAdmin}
    >
      <SettingsContentTable
        search={search}
        onSearchChange={setSearch}
        onAdd={isAdmin ? openCreate : undefined}
        addLabel={t("settings.currencies.addCurrency")}
        showAdd={isAdmin}
        totalCount={query.data?.length}
        filteredCount={filtered.length}
        empty={empty || noResults}
        emptyMessage={
          empty ? t("settings.currencies.noCurrencies") : t("settings.table.noResults")
        }
      >
        <SettingsDataTable
          ariaLabel={t("settings.currencies.title")}
          items={filtered}
          columns={[
            {
              key: "name",
              header: t("settings.currencies.currencyName"),
              isRowHeader: true,
              cellClassName: fiscal.heading,
              render: (row) => row.name,
            },
            {
              key: "symbol",
              header: t("settings.currencies.symbol"),
              cellClassName: fiscal.figure,
              render: (row) => row.symbol,
            },
            {
              key: "isDefault",
              header: t("settings.currencies.isDefault"),
              render: (row) =>
                row.isDefault ? (
                  <FiscalChip variant="accent">{t("settings.currencies.defaultYes")}</FiscalChip>
                ) : (
                  <span className="fiscal-label">—</span>
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
            ? t("settings.currencies.editCurrency")
            : t("settings.currencies.addCurrency")
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
            id="currencyName"
            className="sm:col-span-2"
            label={t("settings.currencies.currencyName")}
            value={name}
            placeholder="Tanzanian Shilling"
            onChange={(e) => setName(e.target.value)}
          />
          <SettingsTextField
            id="currencySymbol"
            label={t("settings.currencies.symbol")}
            value={symbol}
            placeholder="TZS"
            maxLength={8}
            onChange={(e) => setSymbol(e.target.value)}
          />
          <div className="flex flex-col justify-end gap-2 sm:col-span-2">
            <label className={`flex items-center gap-2 ${fiscal.label}`}>
              <input
                type="checkbox"
                checked={isDefault}
                disabled={editing?.isDefault && (query.data?.length ?? 0) <= 1}
                onChange={(e) => setIsDefault(e.target.checked)}
              />
              {t("settings.currencies.isDefault")}
            </label>
            <label className={`flex items-center gap-2 ${fiscal.label}`}>
              <input
                type="checkbox"
                checked={isActive}
                disabled={editing?.isDefault && isActive}
                onChange={(e) => {
                  const next = e.target.checked;
                  setIsActive(next);
                  if (!next) setIsDefault(false);
                }}
              />
              {t("settings.currencies.statusActive")}
            </label>
          </div>
        </form>
      </SettingsFormModal>
    </SettingsPageShell>
  );
}
