import { customerSchema } from "@mkopoflow/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { FiscalChip } from "../../components/fiscal/FiscalChip";
import { SettingsContentTable } from "../../components/settings/SettingsContentTable";
import { SettingsDataTable } from "../../components/settings/SettingsDataTable";
import { SettingsFormModal } from "../../components/settings/SettingsFormModal";
import { SettingsPageShell } from "../../components/settings/SettingsPageShell";
import { SettingsRowActions } from "../../components/settings/SettingsRowActions";
import { SettingsTextField } from "../../components/settings/settings-fields";
import { useTranslation } from "../../context/LanguageContext";
import { useAppToast } from "../../hooks/useAppToast";
import { useCan, useSettingsToken } from "../../hooks/useSettingsToken";
import { filterTableRows, joinSearchParts } from "../../lib/filter-table-rows";
import { customersApi, type Customer } from "../../lib/customers-api";
import { fiscal } from "../../lib/fiscal";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { useAuth } from "../../context/AuthContext";

export function CustomersPage() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const token = useSettingsToken();
  const canAdd = useCan("customers.list", "add");
  const canEdit = useCan("customers.list", "edit");
  const canDelete = useCan("customers.list", "delete");
  const canManage = canAdd || canEdit || canDelete;
  const queryClient = useQueryClient();
  const appToast = useAppToast();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [isActive, setIsActive] = useState(true);

  const query = useQuery({
    queryKey: ["customers"],
    queryFn: () => customersApi.list(token!),
    enabled: !!token,
  });

  const filtered = useMemo(
    () =>
      filterTableRows(query.data ?? [], search, (row) =>
        joinSearchParts(
          row.code,
          row.name,
          row.phone,
          row.nationalId,
          row.isActive ? t("common.active") : t("common.inactive"),
        ),
      ),
    [query.data, search, t],
  );

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["customers"] });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const parsed = customerSchema.safeParse({ name, phone, nationalId, isActive });
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? t("common.invalidInput"));
      }
      if (editing) {
        return customersApi.update(token!, editing.id, parsed.data);
      }
      return customersApi.create(token!, parsed.data);
    },
    onSuccess: () => {
      const wasEdit = !!editing;
      setModalOpen(false);
      setEditing(null);
      setName("");
      setPhone("");
      setNationalId("");
      setIsActive(true);
      invalidate();
      wasEdit ? appToast.updated() : appToast.created();
    },
    onError: (err: Error) => appToast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customersApi.remove(token!, id),
    onSuccess: () => {
      invalidate();
      appToast.deleted();
    },
    onError: (err: Error) => appToast.error(err.message),
  });

  function openCreate() {
    setEditing(null);
    setName("");
    setPhone("");
    setNationalId("");
    setIsActive(true);
    setModalOpen(true);
  }

  function openEdit(row: Customer) {
    setEditing(row);
    setName(row.name);
    setPhone(row.phone);
    setNationalId(row.nationalId);
    setIsActive(row.isActive);
    setModalOpen(true);
  }

  const empty = (query.data ?? []).length === 0;
  const noResults = !empty && filtered.length === 0;

  return (
    <DashboardLayout onSignOut={logout} title={t("nav.customerList")}>
      <SettingsPageShell
        title={t("nav.customerList")}
        loading={query.isLoading}
        error={query.error?.message}
        readOnly={!canManage}
      >
        <SettingsContentTable
          search={search}
          onSearchChange={setSearch}
          onAdd={canAdd ? openCreate : undefined}
          addLabel={t("customers.addCustomer")}
          showAdd={canAdd}
          totalCount={query.data?.length}
          filteredCount={filtered.length}
          empty={empty || noResults}
          emptyMessage={
            empty ? t("customers.noCustomers") : t("settings.table.noResults")
          }
        >
          <SettingsDataTable
            ariaLabel={t("customers.title")}
            items={filtered}
            columns={[
              {
                key: "code",
                header: t("customers.code"),
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
                key: "phone",
                header: t("common.phone"),
                cellClassName: fiscal.label,
                render: (row) => row.phone,
              },
              {
                key: "nationalId",
                header: t("customers.nationalId"),
                cellClassName: fiscal.label,
                render: (row) => row.nationalId,
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
          title={editing ? t("customers.editCustomer") : t("customers.addCustomer")}
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
                id="customerCode"
                label={t("customers.code")}
                value={editing.code}
                disabled
              />
            )}
            <SettingsTextField
              id="customerName"
              label={t("common.name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <SettingsTextField
              id="customerPhone"
              label={t("common.phone")}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <SettingsTextField
              id="customerNationalId"
              label={t("customers.nationalId")}
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
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
    </DashboardLayout>
  );
}
