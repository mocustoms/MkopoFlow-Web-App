import {
  SettingsSelectField,
  SettingsTextAreaField,
  SettingsTextField,
} from "../../components/settings/settings-fields";
import { interestSettingsSchema } from "@mkopoflow/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
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
import { settingsApi } from "../../lib/settings-api";

export function InterestSettingsPage() {
  const { t } = useTranslation();
  const token = useSettingsToken();
  const canEdit = useCan("settings.interest", "edit");
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [method, setMethod] = useState("REDUCING_BALANCE");
  const [rate, setRate] = useState("24");
  const [notes, setNotes] = useState("");
  const appToast = useAppToast();

  const interestMethods = [
    { value: "REDUCING_BALANCE", label: t("settings.interest.reducingBalance") },
    { value: "FIXED_FLAT", label: t("settings.interest.fixedFlat") },
    { value: "CUSTOM", label: t("settings.interest.customFormula") },
  ] as const;

  const query = useQuery({
    queryKey: ["settings", "interest"],
    queryFn: () => settingsApi.interest.get(token!),
    enabled: !!token,
  });

  const methodLabel = (value: string) =>
    interestMethods.find((m) => m.value === value)?.label ?? value;

  const tableRows = useMemo(() => {
    if (!query.data) return [];
    return [
      {
        id: "interest",
        method: methodLabel(query.data.defaultInterestMethod),
        rate: `${query.data.defaultAnnualRatePct}%`,
      },
    ];
  }, [query.data, t]);

  useEffect(() => {
    if (query.data) {
      setMethod(query.data.defaultInterestMethod);
      setRate(String(query.data.defaultAnnualRatePct));
      setNotes(query.data.customFormulaNotes ?? "");
    }
  }, [query.data]);

  const filtered = useMemo(
    () =>
      filterTableRows(tableRows, search, (row) => joinSearchParts(row.method, row.rate)),
    [tableRows, search],
  );

  const mutation = useMutation({
    mutationFn: () => {
      const parsed = interestSettingsSchema.safeParse({
        defaultInterestMethod: method,
        defaultAnnualRatePct: rate,
        customFormulaNotes: notes || undefined,
      });
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? t("common.invalidInput"));
      }
      return settingsApi.interest.update(token!, parsed.data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["settings", "interest"], data);
      setModalOpen(false);
      appToast.settingsSaved();
    },
    onError: (err: Error) => appToast.error(err.message),
  });

  function openEdit() {
    if (query.data) {
      setMethod(query.data.defaultInterestMethod);
      setRate(String(query.data.defaultAnnualRatePct));
      setNotes(query.data.customFormulaNotes ?? "");
    }
    setModalOpen(true);
  }

  const selectClass = fiscal.select;
  const empty = !query.data;
  const noResults = !empty && filtered.length === 0;

  return (
    <SettingsPageShell
      title={t("settings.interest.title")}
      loading={query.isLoading}
      error={query.error?.message}
      readOnly={!canEdit}
    >
      <SettingsContentTable
        search={search}
        onSearchChange={setSearch}
        onAdd={canEdit ? openEdit : undefined}
        addLabel={t("settings.interest.addInterest")}
        showAdd={canEdit}
        totalCount={tableRows.length}
        filteredCount={filtered.length}
        empty={empty || noResults}
        emptyMessage={t("settings.table.noResults")}
      >
        <SettingsDataTable
          ariaLabel={t("settings.interest.title")}
          items={filtered}
          columns={[
            {
              key: "method",
              header: t("settings.interest.interestMethod"),
              isRowHeader: true,
              cellClassName: fiscal.heading,
              render: (row) => row.method,
            },
            {
              key: "rate",
              header: t("settings.interest.annualRate"),
              cellClassName: fiscal.figure,
              render: (row) => row.rate,
            },
            {
              key: "actions",
              header: t("common.actions"),
              align: "end",
              render: () => (
                <SettingsRowActions
                  readOnly={!canEdit}
                  onEdit={canEdit ? openEdit : undefined}
                />
              ),
            },
          ]}
        />
      </SettingsContentTable>

      <SettingsFormModal
        isOpen={modalOpen}
        onOpenChange={setModalOpen}
        title={t("settings.interest.editInterest")}
        onSubmit={() => mutation.mutate()}
        isPending={mutation.isPending}
        submitLabel={t("common.save")}
      >
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <SettingsSelectField
            id="interestMethod"
            className="sm:col-span-2"
            label={t("settings.interest.interestMethod")}
            selectClassName={selectClass}
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            {interestMethods.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </SettingsSelectField>
          <SettingsTextField
            id="annualRate"
            label={t("settings.interest.annualRate")}
            type="number"
            min={0}
            step="0.01"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />
          {method === "CUSTOM" && (
            <SettingsTextAreaField
              id="customNotes"
              className="sm:col-span-2"
              label={t("settings.interest.customNotes")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          )}
        </form>
      </SettingsFormModal>
    </SettingsPageShell>
  );
}
