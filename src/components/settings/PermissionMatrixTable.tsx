import { Table } from "@heroui/react";
import {
  buildPermissionMatrixRows,
  emptyPermissionFlags,
  getDescendantLeafKeys,
  getLeafResourceKeys,
  PERMISSION_ACTIONS,
  type PermissionAction,
  type PermissionFlags,
  type PermissionMatrixRow,
} from "@mkopoflow/shared";
import { useMemo, useRef, useEffect } from "react";
import { useTranslation } from "../../context/LanguageContext";
import { fiscal } from "../../lib/fiscal";
import { IconChevron } from "../dashboard/icons";

const ACTION_TO_FLAG: Record<PermissionAction, keyof PermissionFlags> = {
  add: "canAdd",
  edit: "canEdit",
  view: "canView",
  delete: "canDelete",
  printExcel: "canPrintExcel",
  printPdf: "canPrintPdf",
};

const GLOBAL_ROW_KEY = "__global_select_all__";

type BulkScope =
  | { action: PermissionAction }
  | { allActions: true };

type PermissionMatrixTableProps = {
  permissions: Record<string, PermissionFlags>;
  onChange: (resourceKey: string, action: PermissionAction, value: boolean) => void;
  onBulkChange: (resourceKeys: string[], value: boolean, scope: BulkScope) => void;
  expandedKeys: Set<string>;
  onToggleExpand: (key: string) => void;
  readOnly?: boolean;
};

type MatrixRow = PermissionMatrixRow & {
  id: string;
  flags?: PermissionFlags;
  isGlobalSelectRow?: boolean;
};

function checkboxState(
  resourceKeys: string[],
  permissions: Record<string, PermissionFlags>,
  scope: BulkScope,
): { checked: boolean; indeterminate: boolean } {
  if (resourceKeys.length === 0) return { checked: false, indeterminate: false };

  if ("allActions" in scope) {
    const allOn = resourceKeys.every((key) => {
      const flags = permissions[key];
      return (
        flags &&
        PERMISSION_ACTIONS.every((a: PermissionAction) => flags[ACTION_TO_FLAG[a]])
      );
    });
    const someOn = resourceKeys.some((key) => {
      const flags = permissions[key];
      return (
        flags && PERMISSION_ACTIONS.some((a: PermissionAction) => flags[ACTION_TO_FLAG[a]])
      );
    });
    return { checked: allOn, indeterminate: someOn && !allOn };
  }

  const allOn = resourceKeys.every(
    (key) => permissions[key]?.[ACTION_TO_FLAG[scope.action]] === true,
  );
  const someOn = resourceKeys.some(
    (key) => permissions[key]?.[ACTION_TO_FLAG[scope.action]] === true,
  );
  return { checked: allOn, indeterminate: someOn && !allOn };
}

function SelectAllCheckbox({
  resourceKeys,
  scope,
  permissions,
  readOnly,
  ariaLabel,
  onBulkChange,
}: {
  resourceKeys: string[];
  scope: BulkScope;
  permissions: Record<string, PermissionFlags>;
  readOnly?: boolean;
  ariaLabel: string;
  onBulkChange: PermissionMatrixTableProps["onBulkChange"];
}) {
  const ref = useRef<HTMLInputElement>(null);
  const { checked, indeterminate } = checkboxState(resourceKeys, permissions, scope);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      className="h-4 w-4 accent-[var(--brand-accent)]"
      checked={checked}
      disabled={readOnly || resourceKeys.length === 0}
      aria-label={ariaLabel}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onBulkChange(resourceKeys, e.target.checked, scope)}
    />
  );
}

export function PermissionMatrixTable({
  permissions,
  onChange,
  onBulkChange,
  expandedKeys,
  onToggleExpand,
  readOnly,
}: PermissionMatrixTableProps) {
  const { t } = useTranslation();
  const allLeafKeys = useMemo(() => getLeafResourceKeys(), []);

  const dataRows = useMemo<MatrixRow[]>(
    () =>
      buildPermissionMatrixRows(expandedKeys).map((row: PermissionMatrixRow) => ({
        ...row,
        id: row.key,
        flags: row.isLeaf
          ? { ...emptyPermissionFlags(), ...permissions[row.key] }
          : undefined,
      })),
    [expandedKeys, permissions],
  );

  const rows = useMemo<MatrixRow[]>(
    () => [
      {
        key: GLOBAL_ROW_KEY,
        id: GLOBAL_ROW_KEY,
        labelKey: "permissions.selectAllGlobal",
        depth: 0,
        hasChildren: false,
        isLeaf: false,
        isGlobalSelectRow: true,
      },
      ...dataRows,
    ],
    [dataRows],
  );

  const actionLabels: Record<PermissionAction, string> = {
    add: t("permissions.columns.add"),
    edit: t("permissions.columns.edit"),
    view: t("permissions.columns.view"),
    delete: t("permissions.columns.delete"),
    printExcel: t("permissions.columns.printExcel"),
    printPdf: t("permissions.columns.printPdf"),
  };

  return (
    <div className={fiscal.tableWrap}>
      <Table aria-label={t("settings.roles.permissionMatrix")} variant="secondary" className="w-full min-w-0">
        <Table.ScrollContainer>
          <Table.Content className={fiscal.table}>
            <Table.Header>
              <Table.Column id="module" isRowHeader className="min-w-[12rem]">
                {t("permissions.columns.module")}
              </Table.Column>
              {PERMISSION_ACTIONS.map((action: PermissionAction) => (
                <Table.Column key={action} id={action} className="text-center whitespace-nowrap">
                  {actionLabels[action]}
                </Table.Column>
              ))}
            </Table.Header>
            <Table.Body items={rows}>
              {(row: MatrixRow) => (
                <Table.Row
                  id={row.id}
                  className={row.isGlobalSelectRow ? "bg-bg-surface/80" : undefined}
                >
                  <Table.Cell className={fiscal.heading}>
                    {row.isGlobalSelectRow ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <SelectAllCheckbox
                          resourceKeys={allLeafKeys}
                          scope={{ allActions: true }}
                          permissions={permissions}
                          readOnly={readOnly}
                          ariaLabel={t("permissions.selectAllGlobalAllActions")}
                          onBulkChange={onBulkChange}
                        />
                        <span className="text-sm font-semibold">{t("permissions.selectAllGlobal")}</span>
                      </div>
                    ) : (
                      <div
                        className="flex flex-wrap items-center gap-2"
                        style={{ paddingLeft: `${row.depth * 1.25}rem` }}
                      >
                        {row.hasChildren ? (
                          <>
                            <button
                              type="button"
                              className={`inline-flex shrink-0 rounded p-0.5 ${fiscal.link}`}
                              aria-expanded={expandedKeys.has(row.key)}
                              aria-label={t("permissions.expandModule")}
                              onClick={() => onToggleExpand(row.key)}
                            >
                              <IconChevron
                                size={14}
                                className={`transition-transform ${expandedKeys.has(row.key) ? "rotate-90" : ""}`}
                              />
                            </button>
                            <SelectAllCheckbox
                              resourceKeys={getDescendantLeafKeys(row.key)}
                              scope={{ allActions: true }}
                              permissions={permissions}
                              readOnly={readOnly}
                              ariaLabel={t("permissions.selectAllModuleAllActions", {
                                module: t(row.labelKey),
                              })}
                              onBulkChange={onBulkChange}
                            />
                          </>
                        ) : (
                          <span className="inline-block w-[1.125rem] shrink-0" aria-hidden />
                        )}
                        {row.isLeaf && (
                          <SelectAllCheckbox
                            resourceKeys={[row.key]}
                            scope={{ allActions: true }}
                            permissions={permissions}
                            readOnly={readOnly}
                            ariaLabel={t("permissions.selectAllSubmodule", {
                              module: t(row.labelKey),
                            })}
                            onBulkChange={onBulkChange}
                          />
                        )}
                        <span className={row.isLeaf ? "text-sm" : "text-sm font-medium"}>
                          {row.isLeaf ? (
                            <>
                              <span className={`${fiscal.label} mr-1 text-xs font-normal`}>
                                {t("permissions.selectAllSubmoduleLabel")}:
                              </span>
                              {t(row.labelKey)}
                            </>
                          ) : (
                            <>
                              <span className={`${fiscal.label} mr-1 text-xs font-normal`}>
                                {t("permissions.selectAllModuleLabel")}:
                              </span>
                              {t(row.labelKey)}
                            </>
                          )}
                        </span>
                      </div>
                    )}
                  </Table.Cell>
                  {PERMISSION_ACTIONS.map((action: PermissionAction) => (
                    <Table.Cell key={action} className="text-center">
                      {row.isGlobalSelectRow ? (
                        <SelectAllCheckbox
                          resourceKeys={allLeafKeys}
                          scope={{ action }}
                          permissions={permissions}
                          readOnly={readOnly}
                          ariaLabel={t("permissions.selectAllGlobalAction", {
                            action: actionLabels[action],
                          })}
                          onBulkChange={onBulkChange}
                        />
                      ) : row.hasChildren ? (
                        <SelectAllCheckbox
                          resourceKeys={getDescendantLeafKeys(row.key)}
                          scope={{ action }}
                          permissions={permissions}
                          readOnly={readOnly}
                          ariaLabel={t("permissions.selectAllModuleAction", {
                            module: t(row.labelKey),
                            action: actionLabels[action],
                          })}
                          onBulkChange={onBulkChange}
                        />
                      ) : row.isLeaf && row.flags ? (
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-[var(--brand-accent)]"
                          checked={row.flags[ACTION_TO_FLAG[action]]}
                          disabled={readOnly}
                          aria-label={`${t(row.labelKey)} — ${actionLabels[action]}`}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => onChange(row.key, action, e.target.checked)}
                        />
                      ) : (
                        <span className={fiscal.label}>—</span>
                      )}
                    </Table.Cell>
                  ))}
                </Table.Row>
              )}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
    </div>
  );
}
