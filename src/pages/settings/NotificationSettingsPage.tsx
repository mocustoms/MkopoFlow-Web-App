import { SettingsEditIconButton } from "../../components/settings/SettingsRowActions";
import { SettingsTextField } from "../../components/settings/settings-fields";
import { notificationSettingsSchema } from "@mkopoflow/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { SettingsContentTable } from "../../components/settings/SettingsContentTable";
import { SettingsDataTable } from "../../components/settings/SettingsDataTable";
import { SettingsFormModal } from "../../components/settings/SettingsFormModal";
import { SettingsPageShell } from "../../components/settings/SettingsPageShell";
import { useTranslation } from "../../context/LanguageContext";
import { useAppToast } from "../../hooks/useAppToast";
import { useIsAdmin, useSettingsToken } from "../../hooks/useSettingsToken";
import { filterTableRows, joinSearchParts } from "../../lib/filter-table-rows";
import { fiscal } from "../../lib/fiscal";
import { settingsApi } from "../../lib/settings-api";

export function NotificationSettingsPage() {
  const { t } = useTranslation();
  const token = useSettingsToken();
  const isAdmin = useIsAdmin();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [smsProvider, setSmsProvider] = useState("");
  const [smsSenderId, setSmsSenderId] = useState("");
  const [reminderHours, setReminderHours] = useState("24");
  const [alertOnRisk, setAlertOnRisk] = useState(true);
  const appToast = useAppToast();

  const query = useQuery({
    queryKey: ["settings", "notifications"],
    queryFn: () => settingsApi.notifications.get(token!),
    enabled: !!token,
  });

  const tableRows = useMemo(() => {
    if (!query.data) return [];
    return [
      {
        id: "sms",
        item: t("settings.notifications.enableSms"),
        value: query.data.smsEnabled ? t("common.enabled") : t("common.disabled"),
      },
      {
        id: "provider",
        item: t("settings.notifications.smsProvider"),
        value: query.data.smsProvider || "—",
      },
      {
        id: "sender",
        item: t("settings.notifications.senderId"),
        value: query.data.smsSenderId || "—",
      },
      {
        id: "reminder",
        item: t("settings.notifications.reminderHours"),
        value: String(query.data.reminderHoursBeforeDue),
      },
      {
        id: "alert",
        item: t("settings.notifications.alertOnRisk"),
        value: query.data.alertOnRiskClassification ? t("common.yes") : t("common.no"),
      },
    ];
  }, [query.data, t]);

  useEffect(() => {
    if (query.data) {
      setSmsEnabled(query.data.smsEnabled);
      setSmsProvider(query.data.smsProvider ?? "");
      setSmsSenderId(query.data.smsSenderId ?? "");
      setReminderHours(String(query.data.reminderHoursBeforeDue));
      setAlertOnRisk(query.data.alertOnRiskClassification);
    }
  }, [query.data]);

  const filtered = useMemo(
    () => filterTableRows(tableRows, search, (row) => joinSearchParts(row.item, row.value)),
    [tableRows, search],
  );

  const mutation = useMutation({
    mutationFn: () => {
      const parsed = notificationSettingsSchema.safeParse({
        smsEnabled,
        smsProvider: smsProvider || undefined,
        smsSenderId: smsSenderId || undefined,
        reminderHoursBeforeDue: reminderHours,
        alertOnRiskClassification: alertOnRisk,
      });
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? t("common.invalidInput"));
      }
      return settingsApi.notifications.update(token!, parsed.data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["settings", "notifications"], data);
      setModalOpen(false);
      appToast.settingsSaved();
    },
    onError: (err: Error) => appToast.error(err.message),
  });

  function openEdit() {
    if (query.data) {
      setSmsEnabled(query.data.smsEnabled);
      setSmsProvider(query.data.smsProvider ?? "");
      setSmsSenderId(query.data.smsSenderId ?? "");
      setReminderHours(String(query.data.reminderHoursBeforeDue));
      setAlertOnRisk(query.data.alertOnRiskClassification);
    }
    setModalOpen(true);
  }

  const empty = tableRows.length === 0;
  const noResults = !empty && filtered.length === 0;

  return (
    <SettingsPageShell
      title={t("settings.notifications.title")}
      loading={query.isLoading}
      error={query.error?.message}
      readOnly={!isAdmin}
    >
      <SettingsContentTable
        search={search}
        onSearchChange={setSearch}
        showAdd={false}
        toolbarExtra={isAdmin ? <SettingsEditIconButton onPress={openEdit} /> : undefined}
        totalCount={tableRows.length}
        filteredCount={filtered.length}
        empty={empty || noResults}
        emptyMessage={t("settings.table.noResults")}
      >
        <SettingsDataTable
          ariaLabel={t("settings.notifications.title")}
          items={filtered}
          columns={[
            {
              key: "item",
              header: t("common.item"),
              isRowHeader: true,
              cellClassName: fiscal.heading,
              render: (row) => row.item,
            },
            {
              key: "value",
              header: t("common.value"),
              cellClassName: fiscal.label,
              render: (row) => row.value,
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
              checked={smsEnabled}
              onChange={(e) => setSmsEnabled(e.target.checked)}
            />
            {t("settings.notifications.enableSms")}
          </label>
          <SettingsTextField
            id="smsProvider"
            label={t("settings.notifications.smsProvider")}
            placeholder={t("settings.notifications.smsProviderPlaceholder")}
            value={smsProvider}
            disabled={!smsEnabled}
            onChange={(e) => setSmsProvider(e.target.value)}
          />
          <SettingsTextField
            id="smsSenderId"
            label={t("settings.notifications.senderId")}
            value={smsSenderId}
            disabled={!smsEnabled}
            onChange={(e) => setSmsSenderId(e.target.value)}
          />
          <SettingsTextField
            id="reminderHours"
            className="sm:col-span-2"
            label={t("settings.notifications.reminderHours")}
            type="number"
            min={1}
            max={168}
            value={reminderHours}
            onChange={(e) => setReminderHours(e.target.value)}
          />
          <label className={`flex items-center gap-2 sm:col-span-2 ${fiscal.label}`}>
            <input
              type="checkbox"
              checked={alertOnRisk}
              onChange={(e) => setAlertOnRisk(e.target.checked)}
            />
            {t("settings.notifications.alertOnRisk")}
          </label>
        </form>
      </SettingsFormModal>
    </SettingsPageShell>
  );
}
