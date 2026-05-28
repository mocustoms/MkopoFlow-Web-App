import { loanTypeSchema } from "@mkopoflow/shared";
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
  SettingsTextAreaField,
  SettingsTextField,
} from "../../components/settings/settings-fields";
import { useTranslation } from "../../context/LanguageContext";
import { useAppToast } from "../../hooks/useAppToast";
import { useCan, useSettingsToken } from "../../hooks/useSettingsToken";
import { filterTableRows, joinSearchParts } from "../../lib/filter-table-rows";
import { fiscal } from "../../lib/fiscal";
import { settingsApi, type LoanType } from "../../lib/settings-api";

export function LoanTypesSettingsPage() {
  const { t } = useTranslation();
  const token = useSettingsToken();
  const canAdd = useCan("settings.loans", "add");
  const canEdit = useCan("settings.loans", "edit");
  const canDelete = useCan("settings.loans", "delete");
  const queryClient = useQueryClient();
  const appToast = useAppToast();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<LoanType | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("MONTHLY");
  const [isActive, setIsActive] = useState(true);

  const frequencies = [
    { value: "DAILY", label: t("settings.loans.freqDaily") },
    { value: "WEEKLY", label: t("settings.loans.freqWeekly") },
    { value: "BIWEEKLY", label: t("settings.loans.freqBiweekly") },
    { value: "MONTHLY", label: t("settings.loans.freqMonthly") },
  ] as const;

  const frequencyLabel = (value: string) =>
    frequencies.find((f) => f.value === value)?.label ?? value;

  const query = useQuery({
    queryKey: ["settings", "loan-types"],
    queryFn: () => settingsApi.loanTypes.list(token!),
    enabled: !!token,
  });

  const filtered = useMemo(
    () =>
      filterTableRows(query.data ?? [], search, (row) =>
        joinSearchParts(
          row.code,
          row.name,
          row.description,
          frequencyLabel(row.paymentFrequency),
          row.isActive ? t("common.active") : t("common.inactive"),
        ),
      ),
    [query.data, search, t],
  );

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["settings", "loan-types"] });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const parsed = loanTypeSchema.safeParse({
        name,
        description: description || null,
        paymentFrequency: frequency,
        isActive,
      });
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? t("common.invalidInput"));
      }
      if (editing) {
        return settingsApi.loanTypes.update(token!, editing.id, parsed.data);
      }
      return settingsApi.loanTypes.create(token!, parsed.data);
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
    mutationFn: (id: string) => settingsApi.loanTypes.remove(token!, id),
    onSuccess: () => {
      invalidate();
      appToast.deleted();
    },
    onError: (err: Error) => appToast.error(err.message),
  });

  function openCreate() {
    setEditing(null);
    setName("");
    setDescription("");
    setFrequency("MONTHLY");
    setIsActive(true);
    setModalOpen(true);
  }

  function openEdit(row: LoanType) {
    setEditing(row);
    setName(row.name);
    setDescription(row.description ?? "");
    setFrequency(row.paymentFrequency);
    setIsActive(row.isActive);
    setModalOpen(true);
  }

  const empty = (query.data ?? []).length === 0;
  const noResults = !empty && filtered.length === 0;
  const selectClass = fiscal.select;

  return (
    <SettingsPageShell
      title={t("settings.loans.title")}
      loading={query.isLoading}
      error={query.error?.message}
      readOnly={!canAdd && !canEdit && !canDelete}
    >
      <SettingsContentTable
        search={search}
        onSearchChange={setSearch}
        onAdd={canAdd ? openCreate : undefined}
        addLabel={t("settings.loans.addLoanType")}
        showAdd={canAdd}
        totalCount={query.data?.length}
        filteredCount={filtered.length}
        empty={empty || noResults}
        emptyMessage={empty ? t("settings.loans.noLoanTypes") : t("settings.table.noResults")}
      >
        <SettingsDataTable
          ariaLabel={t("settings.loans.title")}
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
              key: "frequency",
              header: t("settings.loans.paymentFrequency"),
              cellClassName: fiscal.label,
              render: (row) => frequencyLabel(row.paymentFrequency),
            },
            {
              key: "description",
              header: t("common.description"),
              cellClassName: fiscal.label,
              render: (row) => row.description ?? "—",
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
        title={
          editing ? t("settings.loans.editLoanType") : t("settings.loans.addLoanType")
        }
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
              id="loanTypeCode"
              label={t("common.code")}
              value={editing.code}
              disabled
            />
          )}
          <SettingsTextField
            id="loanTypeName"
            label={t("settings.loans.loanTypeName")}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <SettingsSelectField
            id="loanTypeFrequency"
            label={t("settings.loans.paymentFrequency")}
            selectClassName={selectClass}
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
          >
            {frequencies.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </SettingsSelectField>
          <SettingsTextAreaField
            id="loanTypeDescription"
            label={t("common.description")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
