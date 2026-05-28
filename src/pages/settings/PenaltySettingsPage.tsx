
import {
  SettingsSelectField,
  SettingsTextField,
} from "../../components/settings/settings-fields";
import { penaltySettingsSchema } from "@mkopoflow/shared";
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

export function PenaltySettingsPage() {
  const { t } = useTranslation();
  const token = useSettingsToken();
  const canEdit = useCan("settings.penalties", "edit");
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [graceDays, setGraceDays] = useState("0");
  const [penaltyType, setPenaltyType] = useState("PERCENTAGE");
  const [rateOrAmount, setRateOrAmount] = useState("5");
  const appToast = useAppToast();

  const query = useQuery({
    queryKey: ["settings", "penalties"],
    queryFn: () => settingsApi.penalties.get(token!),
    enabled: !!token,
  });

  const tableRows = useMemo(() => {
    if (!query.data) return [];
    const typeLabel =
      query.data.penaltyType === "PERCENTAGE"
        ? t("settings.penalties.penaltyPercent")
        : t("settings.penalties.penaltyFlat");
    const amountLabel =
      query.data.penaltyType === "PERCENTAGE"
        ? `${query.data.rateOrAmount}%`
        : String(query.data.rateOrAmount);
    return [
      {
        id: "penalties",
        enabled: query.data.enabled ? t("common.yes") : t("common.no"),
        graceDays: String(query.data.graceDays),
        typeLabel,
        amountLabel,
      },
    ];
  }, [query.data, t]);

  useEffect(() => {
    if (query.data) {
      setEnabled(query.data.enabled);
      setGraceDays(String(query.data.graceDays));
      setPenaltyType(query.data.penaltyType);
      setRateOrAmount(String(query.data.rateOrAmount));
    }
  }, [query.data]);

  const filtered = useMemo(
    () =>
      filterTableRows(tableRows, search, (row) =>
        joinSearchParts(row.enabled, row.graceDays, row.typeLabel, row.amountLabel),
      ),
    [tableRows, search],
  );

  const mutation = useMutation({
    mutationFn: () => {
      const parsed = penaltySettingsSchema.safeParse({
        enabled,
        graceDays,
        penaltyType,
        rateOrAmount,
      });
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? t("common.invalidInput"));
      }
      return settingsApi.penalties.update(token!, parsed.data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["settings", "penalties"], data);
      setModalOpen(false);
      appToast.settingsSaved();
    },
    onError: (err: Error) => appToast.error(err.message),
  });

  function openEdit() {
    if (query.data) {
      setEnabled(query.data.enabled);
      setGraceDays(String(query.data.graceDays));
      setPenaltyType(query.data.penaltyType);
      setRateOrAmount(String(query.data.rateOrAmount));
    }
    setModalOpen(true);
  }

  const selectClass = fiscal.select;
  const empty = !query.data;
  const noResults = !empty && filtered.length === 0;

  return (
    <SettingsPageShell
      title={t("settings.penalties.title")}
      loading={query.isLoading}
      error={query.error?.message}
      readOnly={!canEdit}
    >
      <SettingsContentTable
        search={search}
        onSearchChange={setSearch}
        onAdd={canEdit ? openEdit : undefined}
        addLabel={t("settings.penalties.addPenalties")}
        showAdd={canEdit}
        totalCount={tableRows.length}
        filteredCount={filtered.length}
        empty={empty || noResults}
        emptyMessage={t("settings.table.noResults")}
      >
        <SettingsDataTable
          ariaLabel={t("settings.penalties.title")}
          items={filtered}
          columns={[
            {
              key: "status",
              header: t("common.status"),
              isRowHeader: true,
              cellClassName: fiscal.heading,
              render: (row) => row.enabled,
            },
            {
              key: "graceDays",
              header: t("settings.penalties.graceDays"),
              cellClassName: fiscal.label,
              render: (row) => row.graceDays,
            },
            {
              key: "type",
              header: t("settings.penalties.penaltyType"),
              cellClassName: fiscal.label,
              render: (row) => row.typeLabel,
            },
            {
              key: "value",
              header: t("common.value"),
              cellClassName: fiscal.figure,
              render: (row) => row.amountLabel,
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
        title={t("common.edit")}
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
          <label className={`flex items-center gap-2 sm:col-span-2 ${fiscal.label}`}>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
            {t("settings.penalties.enablePenalties")}
          </label>
          <SettingsTextField
            id="graceDays"
            label={t("settings.penalties.graceDays")}
            type="number"
            min={0}
            value={graceDays}
            disabled={!enabled}
            onChange={(e) => setGraceDays(e.target.value)}
          />
          <SettingsSelectField
            id="penaltyType"
            label={t("settings.penalties.penaltyType")}
            selectClassName={selectClass}
            disabled={!enabled}
            value={penaltyType}
            onChange={(e) => setPenaltyType(e.target.value)}
          >
            <option value="PERCENTAGE">{t("settings.penalties.penaltyPercent")}</option>
            <option value="FLAT">{t("settings.penalties.penaltyFlat")}</option>
          </SettingsSelectField>
          <SettingsTextField
            id="rateOrAmount"
            className="sm:col-span-2"
            label={
              penaltyType === "PERCENTAGE"
                ? t("settings.penalties.penaltyRate")
                : t("settings.penalties.penaltyFlatAmount")
            }
            type="number"
            min={0}
            value={rateOrAmount}
            disabled={!enabled}
            onChange={(e) => setRateOrAmount(e.target.value)}
          />
        </form>
      </SettingsFormModal>
    </SettingsPageShell>
  );
}
