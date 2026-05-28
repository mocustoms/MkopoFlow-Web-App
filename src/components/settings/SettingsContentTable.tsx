import { Button, Input, TextField } from "@heroui/react";
import type { ReactNode } from "react";
import { useTranslation } from "../../context/LanguageContext";
import { fiscal } from "../../lib/fiscal";

type SettingsContentTableProps = {
  children: ReactNode;
  search: string;
  onSearchChange: (value: string) => void;
  onAdd?: () => void;
  addLabel?: string;
  showAdd?: boolean;
  toolbarExtra?: ReactNode;
  totalCount?: number;
  filteredCount?: number;
  empty?: boolean;
  emptyMessage: string;
};

export function SettingsContentTable({
  children,
  search,
  onSearchChange,
  onAdd,
  addLabel,
  showAdd = true,
  toolbarExtra,
  totalCount,
  filteredCount,
  empty,
  emptyMessage,
}: SettingsContentTableProps) {
  const { t } = useTranslation();
  const showCount =
    totalCount != null && filteredCount != null && (search.trim() !== "" || filteredCount !== totalCount);

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-1 sm:max-w-md">
          <TextField
            aria-label={t("settings.table.search")}
            className="w-full"
            fullWidth
          >
            <Input
              type="search"
              fullWidth
              placeholder={t("settings.table.search")}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </TextField>
          {showCount && (
            <p className={`${fiscal.label} text-xs`}>
              {t("settings.table.showingCount", {
                shown: String(filteredCount),
                total: String(totalCount),
              })}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {toolbarExtra}
          {showAdd && onAdd && (
            <Button onPress={onAdd}>{addLabel ?? t("common.add")}</Button>
          )}
        </div>
      </div>

      {empty ? (
        <p className={`${fiscal.label} py-8 text-center text-sm`}>{emptyMessage}</p>
      ) : (
        <div className={fiscal.tableWrap}>{children}</div>
      )}
    </div>
  );
}
