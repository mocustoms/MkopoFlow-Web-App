import { Label } from "@heroui/react";
import {
  SettingsSelectField,
  SettingsTextField,
} from "../../components/settings/settings-fields";
import { classificationRuleSchema } from "@mkopoflow/shared";
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
import { settingsApi, type ClassificationRule } from "../../lib/settings-api";

const CLASSIFICATION_CODES = [
  "CURRENT",
  "WATCH",
  "SUB_STANDARD",
  "DOUBTFUL",
  "LOSS",
] as const;

type RuleRow = {
  code: string;
  label: string;
  minDaysPastDue: string;
  maxDaysPastDue: string;
  provisionRatePct: string;
  sortOrder: string;
};

function toRows(rules: ClassificationRule[]): RuleRow[] {
  return rules.map((r) => ({
    code: r.code,
    label: r.label,
    minDaysPastDue: String(r.minDaysPastDue),
    maxDaysPastDue: r.maxDaysPastDue != null ? String(r.maxDaysPastDue) : "",
    provisionRatePct: r.provisionRatePct != null ? String(r.provisionRatePct) : "",
    sortOrder: String(r.sortOrder),
  }));
}

export function ClassificationSettingsPage() {
  const { t } = useTranslation();
  const token = useSettingsToken();
  const canAdd = useCan("settings.classification", "add");
  const canEdit = useCan("settings.classification", "edit");
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<RuleRow[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<RuleRow | null>(null);
  const appToast = useAppToast();

  const query = useQuery({
    queryKey: ["settings", "classification"],
    queryFn: () => settingsApi.classification.list(token!),
    enabled: !!token,
  });

  useEffect(() => {
    if (query.data?.length) setRows(toRows(query.data));
  }, [query.data]);

  const filtered = useMemo(
    () =>
      filterTableRows(rows, search, (row) =>
        joinSearchParts(
          row.code,
          row.label,
          row.minDaysPastDue,
          row.maxDaysPastDue,
          row.provisionRatePct,
        ),
      ),
    [rows, search],
  );

  const mutation = useMutation({
    mutationFn: (nextRows: RuleRow[]) => {
      const payload = nextRows.map((r) => {
        const parsed = classificationRuleSchema.safeParse({
          code: r.code,
          label: r.label,
          minDaysPastDue: r.minDaysPastDue,
          maxDaysPastDue: r.maxDaysPastDue === "" ? null : r.maxDaysPastDue,
          provisionRatePct: r.provisionRatePct === "" ? null : r.provisionRatePct,
          sortOrder: r.sortOrder,
        });
        if (!parsed.success) {
          throw new Error(parsed.error.issues[0]?.message ?? t("common.invalidInput"));
        }
        return parsed.data;
      });
      return settingsApi.classification.replace(token!, payload);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["settings", "classification"], data);
      setRows(toRows(data));
      setModalOpen(false);
      setEditIndex(null);
      setDraft(null);
      appToast.settingsSaved();
    },
    onError: (err: Error) => appToast.error(err.message),
  });

  const unusedCodes = useMemo(
    () => CLASSIFICATION_CODES.filter((code) => !rows.some((row) => row.code === code)),
    [rows],
  );

  function openCreate() {
    const nextCode = unusedCodes[0];
    if (!nextCode) {
      appToast.error(t("settings.classification.allBucketsAdded"));
      return;
    }
    setEditIndex(null);
    setDraft({
      code: nextCode,
      label: "",
      minDaysPastDue: "0",
      maxDaysPastDue: "",
      provisionRatePct: "",
      sortOrder: String(rows.length + 1),
    });
    setModalOpen(true);
  }

  function openEdit(index: number) {
    const row = rows[index];
    if (!row) return;
    setEditIndex(index);
    setDraft({ ...row });
    setModalOpen(true);
  }

  function saveDraft() {
    if (!draft) return;
    const next =
      editIndex == null ? [...rows, draft] : rows.map((row, i) => (i === editIndex ? draft : row));
    mutation.mutate(next);
  }

  function updateDraft(field: keyof RuleRow, value: string) {
    setDraft((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  const empty = rows.length === 0;
  const noResults = !empty && filtered.length === 0;

  return (
    <SettingsPageShell
      title={t("settings.classification.title")}
      loading={query.isLoading}
      error={query.error?.message}
      readOnly={!canAdd && !canEdit}
    >
      <SettingsContentTable
        search={search}
        onSearchChange={setSearch}
        onAdd={canAdd && unusedCodes.length > 0 ? openCreate : undefined}
        addLabel={t("settings.classification.addClassification")}
        showAdd={canAdd}
        totalCount={rows.length}
        filteredCount={filtered.length}
        empty={empty || noResults}
        emptyMessage={t("settings.table.noResults")}
      >
        <SettingsDataTable
          ariaLabel={t("settings.classification.title")}
          items={filtered.map((row) => ({ ...row, id: row.code }))}
          columns={[
            {
              key: "bucket",
              header: t("settings.classification.bucket"),
              cellClassName: `${fiscal.badge} text-xs uppercase`,
              render: (row) => row.code.replace("_", " "),
            },
            {
              key: "label",
              header: t("settings.classification.label"),
              isRowHeader: true,
              cellClassName: fiscal.heading,
              render: (row) => row.label,
            },
            {
              key: "minDays",
              header: t("settings.classification.minDays"),
              cellClassName: fiscal.label,
              render: (row) => row.minDaysPastDue,
            },
            {
              key: "maxDays",
              header: t("settings.classification.maxDays"),
              cellClassName: fiscal.label,
              render: (row) => row.maxDaysPastDue || "—",
            },
            {
              key: "provision",
              header: t("settings.classification.provisionPct"),
              cellClassName: fiscal.label,
              render: (row) => row.provisionRatePct || "—",
            },
            {
              key: "actions",
              header: t("common.actions"),
              align: "end",
              render: (row) => {
                const index = rows.findIndex((r) => r.code === row.code);
                return (
                  <SettingsRowActions
                    readOnly={!canEdit}
                    onEdit={canEdit && index >= 0 ? () => openEdit(index) : undefined}
                  />
                );
              },
            },
          ]}
        />
      </SettingsContentTable>
      <SettingsFormModal
        isOpen={modalOpen}
        onOpenChange={setModalOpen}
        title={editIndex == null ? t("settings.classification.addClassification") : t("common.edit")}
        onSubmit={saveDraft}
        isPending={mutation.isPending}
        submitLabel={t("common.save")}
      >
        {draft && (
          <form
            className="grid gap-3 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              saveDraft();
            }}
          >
            {editIndex == null ? (
              <SettingsSelectField
                id="ruleCode"
                className="sm:col-span-2"
                label={t("settings.classification.bucket")}
                selectClassName={fiscal.select}
                value={draft.code}
                onChange={(e) => updateDraft("code", e.target.value)}
              >
                {unusedCodes.map((code) => (
                  <option key={code} value={code}>
                    {code.replace("_", " ")}
                  </option>
                ))}
              </SettingsSelectField>
            ) : (
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label>{t("settings.classification.bucket")}</Label>
                <p className={`${fiscal.badge} text-xs uppercase`}>{draft.code.replace("_", " ")}</p>
              </div>
            )}
            <SettingsTextField
              id="ruleLabel"
              className="sm:col-span-2"
              label={t("settings.classification.label")}
              value={draft.label}
              onChange={(e) => updateDraft("label", e.target.value)}
            />
            <SettingsTextField
              id="ruleMin"
              label={t("settings.classification.minDays")}
              type="number"
              value={draft.minDaysPastDue}
              onChange={(e) => updateDraft("minDaysPastDue", e.target.value)}
            />
            <SettingsTextField
              id="ruleMax"
              label={t("settings.classification.maxDays")}
              type="number"
              placeholder="∞"
              value={draft.maxDaysPastDue}
              onChange={(e) => updateDraft("maxDaysPastDue", e.target.value)}
            />
            <SettingsTextField
              id="ruleProv"
              className="sm:col-span-2"
              label={t("settings.classification.provisionPct")}
              type="number"
              value={draft.provisionRatePct}
              onChange={(e) => updateDraft("provisionRatePct", e.target.value)}
            />
          </form>
        )}
      </SettingsFormModal>
    </SettingsPageShell>
  );
}
