import {
  autocodeRuleSchema,
  previewAutocode,
  type AutocodeIncludeDate,
} from "@mkopoflow/shared";
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
import { settingsApi, type AutocodeRule } from "../../lib/settings-api";

const INCLUDE_DATE_OPTIONS: AutocodeIncludeDate[] = ["NONE", "YEAR", "YEAR_MONTH"];

export function AutocodePage() {
  const { t } = useTranslation();
  const token = useSettingsToken();
  const isAdmin = useIsAdmin();
  const queryClient = useQueryClient();
  const appToast = useAppToast();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AutocodeRule | null>(null);
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [separator, setSeparator] = useState("");
  const [sequencePadding, setSequencePadding] = useState("5");
  const [nextSequence, setNextSequence] = useState("1");
  const [includeDate, setIncludeDate] = useState<AutocodeIncludeDate>("NONE");
  const [isActive, setIsActive] = useState(true);

  const query = useQuery({
    queryKey: ["settings", "autocode"],
    queryFn: () => settingsApi.autocode.list(token!),
    enabled: !!token,
  });

  const filtered = useMemo(
    () =>
      filterTableRows(query.data ?? [], search, (row) =>
        joinSearchParts(
          t(`settings.autocode.modules.${row.module}`),
          row.prefix,
          row.suffix ?? "",
          row.preview,
          row.isActive ? t("common.active") : t("common.inactive"),
        ),
      ),
    [query.data, search, t],
  );

  const livePreview = useMemo(() => {
    const padding = Number.parseInt(sequencePadding, 10);
    const next = Number.parseInt(nextSequence, 10);
    if (!Number.isFinite(padding) || padding < 1 || !Number.isFinite(next) || next < 1) {
      return "—";
    }
    return previewAutocode(
      {
        prefix: prefix || "—",
        suffix: suffix || null,
        separator,
        sequencePadding: padding,
        includeDate,
      },
      next,
    );
  }, [prefix, suffix, separator, sequencePadding, nextSequence, includeDate]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["settings", "autocode"] });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      const parsed = autocodeRuleSchema.safeParse({
        prefix,
        suffix: suffix || null,
        separator,
        sequencePadding,
        nextSequence,
        includeDate,
        isActive,
      });
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? t("common.invalidInput"));
      }
      return settingsApi.autocode.update(token!, editing.module, parsed.data);
    },
    onSuccess: () => {
      setModalOpen(false);
      setEditing(null);
      invalidate();
      appToast.updated();
    },
    onError: (err: Error) => appToast.error(err.message),
  });

  function openEdit(row: AutocodeRule) {
    setEditing(row);
    setPrefix(row.prefix);
    setSuffix(row.suffix ?? "");
    setSeparator(row.separator);
    setSequencePadding(String(row.sequencePadding));
    setNextSequence(String(row.nextSequence));
    setIncludeDate(row.includeDate);
    setIsActive(row.isActive);
    setModalOpen(true);
  }

  const empty = (query.data ?? []).length === 0;
  const noResults = !empty && filtered.length === 0;

  return (
    <SettingsPageShell
      title={t("settings.autocode.title")}
      loading={query.isLoading}
      error={query.error?.message}
      readOnly={!isAdmin}
    >
      <SettingsContentTable
        search={search}
        onSearchChange={setSearch}
        showAdd={false}
        totalCount={query.data?.length}
        filteredCount={filtered.length}
        empty={empty || noResults}
        emptyMessage={t("settings.autocode.noRules")}
      >
        <SettingsDataTable
          ariaLabel={t("settings.autocode.title")}
          items={filtered}
          columns={[
            {
              key: "module",
              header: t("settings.autocode.module"),
              isRowHeader: true,
              cellClassName: fiscal.heading,
              render: (row) => t(`settings.autocode.modules.${row.module}`),
            },
            {
              key: "preview",
              header: t("settings.autocode.preview"),
              cellClassName: fiscal.figure,
              render: (row) => row.preview,
            },
            {
              key: "pattern",
              header: t("settings.autocode.pattern"),
              cellClassName: fiscal.label,
              render: (row) =>
                joinSearchParts(row.prefix, row.separator, row.suffix ?? "", String(row.sequencePadding)),
            },
            {
              key: "next",
              header: t("settings.autocode.nextSequence"),
              cellClassName: fiscal.label,
              render: (row) => String(row.nextSequence),
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
                <SettingsRowActions readOnly={!isAdmin} onEdit={() => openEdit(row)} />
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
            ? t("settings.autocode.editRule", {
                module: t(`settings.autocode.modules.${editing.module}`),
              })
            : ""
        }
        onSubmit={() => saveMutation.mutate()}
        isPending={saveMutation.isPending}
        submitLabel={t("common.save")}
        readOnly={!isAdmin}
      >
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
        >
          <p className={`sm:col-span-2 ${fiscal.label} text-sm`}>
            {t("settings.autocode.livePreview")}:{" "}
            <span className={fiscal.figure}>{livePreview}</span>
          </p>
          <SettingsTextField
            id="autocodePrefix"
            label={t("settings.autocode.prefix")}
            value={prefix}
            onChange={(e) => setPrefix(e.target.value.toUpperCase())}
          />
          <SettingsTextField
            id="autocodeSuffix"
            label={t("settings.autocode.suffix")}
            value={suffix}
            onChange={(e) => setSuffix(e.target.value.toUpperCase())}
          />
          <SettingsTextField
            id="autocodeSeparator"
            label={t("settings.autocode.separator")}
            value={separator}
            onChange={(e) => setSeparator(e.target.value)}
          />
          <SettingsSelectField
            id="autocodeIncludeDate"
            label={t("settings.autocode.includeDate")}
            selectClassName={fiscal.select}
            value={includeDate}
            onChange={(e) => setIncludeDate(e.target.value as AutocodeIncludeDate)}
          >
            {INCLUDE_DATE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {t(`settings.autocode.includeDateOptions.${opt}`)}
              </option>
            ))}
          </SettingsSelectField>
          <SettingsTextField
            id="autocodePadding"
            label={t("settings.autocode.sequencePadding")}
            type="number"
            min={1}
            max={10}
            value={sequencePadding}
            onChange={(e) => setSequencePadding(e.target.value)}
          />
          <SettingsTextField
            id="autocodeNext"
            label={t("settings.autocode.nextSequence")}
            type="number"
            min={1}
            value={nextSequence}
            onChange={(e) => setNextSequence(e.target.value)}
          />
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
