
import { SettingsTextField } from "../../components/settings/settings-fields";
import { financialYearSchema } from "@mkopoflow/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
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
import { settingsApi, type FinancialYear } from "../../lib/settings-api";

function formatDate(iso: string, locale: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(locale === "sw" ? "sw-TZ" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function FinancialYearSettingsPage() {
  const { t, locale } = useTranslation();
  const token = useSettingsToken();
  const isAdmin = useIsAdmin();
  const queryClient = useQueryClient();
  const appToast = useAppToast();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editing, setEditing] = useState<FinancialYear | null>(null);

  const query = useQuery({
    queryKey: ["settings", "financial-year"],
    queryFn: () => settingsApi.financialYear.list(token!),
    enabled: !!token,
  });

  const filtered = useMemo(
    () =>
      filterTableRows(query.data ?? [], search, (row) =>
        joinSearchParts(row.name, row.startDate, row.endDate),
      ),
    [query.data, search],
  );

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["settings", "financial-year"] });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const parsed = financialYearSchema.safeParse({ name, startDate, endDate });
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? t("common.invalidInput"));
      }
      if (editing) {
        return settingsApi.financialYear.update(token!, editing.id, parsed.data);
      }
      return settingsApi.financialYear.create(token!, parsed.data);
    },
    onSuccess: () => {
      const wasEdit = !!editing;
      setModalOpen(false);
      setEditing(null);
      setName("");
      setStartDate("");
      setEndDate("");
      invalidate();
      wasEdit ? appToast.updated() : appToast.created();
    },
    onError: (err: Error) => appToast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => settingsApi.financialYear.remove(token!, id),
    onSuccess: () => {
      invalidate();
      appToast.deleted();
    },
    onError: (err: Error) => appToast.error(err.message),
  });

  function openCreate() {
    const year = new Date().getFullYear();
    setEditing(null);
    setName(`FY ${year}`);
    setStartDate(`${year}-01-01`);
    setEndDate(`${year}-12-31`);
    setModalOpen(true);
  }

  function openEdit(row: FinancialYear) {
    setEditing(row);
    setName(row.name);
    setStartDate(row.startDate);
    setEndDate(row.endDate);
    setModalOpen(true);
  }

  const empty = (query.data ?? []).length === 0;
  const noResults = !empty && filtered.length === 0;

  return (
    <SettingsPageShell
      title={t("settings.financialYear.title")}
      loading={query.isLoading}
      error={query.error?.message}
      readOnly={!isAdmin}
    >
      <SettingsContentTable
        search={search}
        onSearchChange={setSearch}
        onAdd={isAdmin ? openCreate : undefined}
        addLabel={t("settings.financialYear.addYear")}
        showAdd={isAdmin}
        totalCount={query.data?.length}
        filteredCount={filtered.length}
        empty={empty || noResults}
        emptyMessage={
          empty ? t("settings.financialYear.noYears") : t("settings.table.noResults")
        }
      >
        <SettingsDataTable
          ariaLabel={t("settings.financialYear.title")}
          items={filtered}
          columns={[
            {
              key: "name",
              header: t("settings.financialYear.yearName"),
              isRowHeader: true,
              cellClassName: fiscal.heading,
              render: (row) => row.name,
            },
            {
              key: "startDate",
              header: t("settings.financialYear.startDate"),
              cellClassName: fiscal.figure,
              render: (row) => formatDate(row.startDate, locale),
            },
            {
              key: "endDate",
              header: t("settings.financialYear.endDate"),
              cellClassName: fiscal.figure,
              render: (row) => formatDate(row.endDate, locale),
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
          editing ? t("settings.financialYear.editYear") : t("settings.financialYear.addYear")
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
            id="fyName"
            className="sm:col-span-2"
            label={t("settings.financialYear.yearName")}
            value={name}
            placeholder="FY 2026"
            onChange={(e) => setName(e.target.value)}
          />
          <SettingsTextField
            id="fyStart"
            label={t("settings.financialYear.startDate")}
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <SettingsTextField
            id="fyEnd"
            label={t("settings.financialYear.endDate")}
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </form>
      </SettingsFormModal>
    </SettingsPageShell>
  );
}
