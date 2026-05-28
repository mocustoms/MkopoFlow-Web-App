import { Label } from "@heroui/react";
import {
  SettingsSelectField,
  SettingsTextAreaField,
  SettingsTextField,
} from "../../components/settings/settings-fields";
import { companySettingsSchema } from "@mkopoflow/shared";
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
import { settingsApi } from "../../lib/settings-api";

const LOGO_MAX_BYTES = 200_000;

export function CompanySettingsPage() {
  const { t } = useTranslation();
  const token = useSettingsToken();
  const isAdmin = useIsAdmin();
  const queryClient = useQueryClient();
  const appToast = useAppToast();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [businessRegistrationNo, setBusinessRegistrationNo] = useState("");
  const [defaultCurrencyId, setDefaultCurrencyId] = useState("");

  const query = useQuery({
    queryKey: ["settings", "company"],
    queryFn: () => settingsApi.company.get(token!),
    enabled: !!token,
  });

  const currenciesQuery = useQuery({
    queryKey: ["settings", "currencies"],
    queryFn: () => settingsApi.currencies.list(token!),
    enabled: !!token && modalOpen,
  });

  const activeCurrencies = useMemo(
    () => (currenciesQuery.data ?? []).filter((c) => c.isActive),
    [currenciesQuery.data],
  );

  const tableRows = useMemo(() => {
    if (!query.data) return [];
    return [
      {
        id: "company",
        name: query.data.name,
        slug: query.data.slug,
        phone: query.data.phone ?? "—",
        email: query.data.email ?? "—",
        defaultCurrency: query.data.defaultCurrencyLabel,
        logoUrl: query.data.logoUrl,
      },
    ];
  }, [query.data]);

  const filtered = useMemo(
    () =>
      filterTableRows(tableRows, search, (row) =>
        joinSearchParts(row.name, row.slug, row.phone, row.email, row.defaultCurrency),
      ),
    [tableRows, search],
  );

  const mutation = useMutation({
    mutationFn: () => {
      const parsed = companySettingsSchema.safeParse({
        name,
        logoUrl: logoUrl ?? "",
        phone,
        email,
        address,
        businessRegistrationNo,
        defaultCurrencyId: defaultCurrencyId || null,
      });
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? t("common.invalidInput"));
      }
      return settingsApi.company.update(token!, parsed.data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["settings", "company"], data);
      queryClient.invalidateQueries({ queryKey: ["settings", "currencies"] });
      setModalOpen(false);
      appToast.settingsSaved();
    },
    onError: (err: Error) => appToast.error(err.message),
  });

  function loadFormFromData() {
    if (!query.data) return;
    setName(query.data.name);
    setSlug(query.data.slug);
    setLogoUrl(query.data.logoUrl ?? null);
    setPhone(query.data.phone ?? "");
    setEmail(query.data.email ?? "");
    setAddress(query.data.address ?? "");
    setBusinessRegistrationNo(query.data.businessRegistrationNo ?? "");
    setDefaultCurrencyId(query.data.defaultCurrencyId ?? "");
  }

  function openEdit() {
    loadFormFromData();
    setModalOpen(true);
  }

  function handleLogoFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      appToast.error(t("settings.company.logoInvalidType"));
      return;
    }
    if (file.size > LOGO_MAX_BYTES) {
      appToast.error(t("settings.company.logoTooLarge"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogoUrl(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  }

  const empty = !query.data;
  const noResults = !empty && filtered.length === 0;
  const selectClass = fiscal.select;

  return (
    <SettingsPageShell
      title={t("settings.company.title")}
      loading={query.isLoading}
      error={query.error?.message}
      readOnly={!isAdmin}
    >
      <SettingsContentTable
        search={search}
        onSearchChange={setSearch}
        showAdd={false}
        totalCount={tableRows.length}
        filteredCount={filtered.length}
        empty={empty || noResults}
        emptyMessage={t("settings.table.noResults")}
      >
        <SettingsDataTable
          ariaLabel={t("settings.company.title")}
          items={filtered}
          columns={[
            {
              key: "logo",
              header: t("settings.company.logo"),
              render: (row) =>
                row.logoUrl ? (
                  <img
                    src={row.logoUrl}
                    alt=""
                    className="h-10 w-10 rounded border border-border-fiscal object-contain"
                  />
                ) : (
                  <span className={`${fiscal.label} text-xs`}>—</span>
                ),
            },
            {
              key: "name",
              header: t("settings.company.companyName"),
              isRowHeader: true,
              cellClassName: fiscal.heading,
              render: (row) => row.name,
            },
            {
              key: "phone",
              header: t("common.phone"),
              cellClassName: fiscal.label,
              render: (row) => row.phone,
            },
            {
              key: "email",
              header: t("common.email"),
              cellClassName: fiscal.label,
              render: (row) => row.email,
            },
            {
              key: "defaultCurrency",
              header: t("settings.company.defaultCurrency"),
              cellClassName: fiscal.figure,
              render: (row) => row.defaultCurrency,
            },
            {
              key: "actions",
              header: t("common.actions"),
              align: "end",
              render: () => (
                <SettingsRowActions readOnly={!isAdmin} onEdit={openEdit} />
              ),
            },
          ]}
        />
      </SettingsContentTable>

      <SettingsFormModal
        isOpen={modalOpen}
        onOpenChange={setModalOpen}
        title={t("settings.company.editProfile")}
        onSubmit={() => mutation.mutate()}
        isPending={mutation.isPending}
        submitLabel={t("common.saveChanges")}
      >
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label>{t("settings.company.logo")}</Label>
            <div className="flex flex-wrap items-center gap-4">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt=""
                  className="h-16 w-16 rounded border border-border-fiscal object-contain"
                />
              ) : (
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded border border-dashed ${fiscal.border} ${fiscal.label} text-xs`}
                >
                  {t("settings.company.noLogo")}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept="image/*"
                  className="text-sm"
                  onChange={(e) => handleLogoFile(e.target.files?.[0])}
                />
                {logoUrl && (
                  <button
                    type="button"
                    className={`${fiscal.link} text-left text-xs`}
                    onClick={() => setLogoUrl(null)}
                  >
                    {t("settings.company.removeLogo")}
                  </button>
                )}
              </div>
            </div>
          </div>

          <SettingsTextField
            id="companyName"
            className="sm:col-span-2"
            label={t("settings.company.companyName")}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <SettingsTextField
            id="companyPhone"
            label={t("common.phone")}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <SettingsTextField
            id="companyEmail"
            label={t("common.email")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <SettingsTextAreaField
            id="companyAddress"
            className="sm:col-span-2"
            label={t("settings.company.address")}
            value={address}
            rows={2}
            onChange={(e) => setAddress(e.target.value)}
          />

          <SettingsTextField
            id="companyRegNo"
            label={t("settings.company.businessRegistrationNo")}
            value={businessRegistrationNo}
            onChange={(e) => setBusinessRegistrationNo(e.target.value)}
          />

          <SettingsTextField
            id="companySlug"
            label={t("settings.company.companyCode")}
            value={slug}
            disabled
          />

          <SettingsSelectField
            id="defaultCurrency"
            className="sm:col-span-2"
            label={t("settings.company.defaultCurrency")}
            selectClassName={selectClass}
            value={defaultCurrencyId}
            onChange={(e) => setDefaultCurrencyId(e.target.value)}
          >
            <option value="">{t("settings.company.selectCurrency")}</option>
            {activeCurrencies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.symbol})
                {c.isDefault ? ` — ${t("settings.currencies.defaultYes")}` : ""}
              </option>
            ))}
          </SettingsSelectField>
        </form>
      </SettingsFormModal>
    </SettingsPageShell>
  );
}
