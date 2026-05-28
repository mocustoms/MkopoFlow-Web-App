import { Button } from "@heroui/react";
import { IconEdit, IconEye, IconTrash } from "../dashboard/icons";
import { useTranslation } from "../../context/LanguageContext";
import { fiscal } from "../../lib/fiscal";

const iconBtnClass =
  "min-h-8 min-w-8 p-1.5 text-brand-primary hover:bg-bg-surface";

type SettingsRowActionsProps = {
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  readOnly?: boolean;
  deleteDisabled?: boolean;
  confirmDeleteMessage?: string;
};

/** Icon action buttons for settings / customer data tables. */
export function SettingsRowActions({
  onEdit,
  onDelete,
  onView,
  readOnly,
  deleteDisabled,
  confirmDeleteMessage,
}: SettingsRowActionsProps) {
  const { t } = useTranslation();

  if (readOnly && !onView) {
    return <span className={`${fiscal.label} text-xs`}>—</span>;
  }

  function handleDelete() {
    if (!onDelete || deleteDisabled) return;
    const msg = confirmDeleteMessage ?? t("settings.table.confirmDelete");
    if (window.confirm(msg)) onDelete();
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-0.5">
      {onView && (
        <Button
          size="sm"
          variant="ghost"
          className={iconBtnClass}
          aria-label={t("common.view")}
          onPress={onView}
        >
          <IconEye size={16} />
        </Button>
      )}
      {!readOnly && onEdit && (
        <Button
          size="sm"
          variant="ghost"
          className={iconBtnClass}
          aria-label={t("common.edit")}
          onPress={onEdit}
        >
          <IconEdit size={16} />
        </Button>
      )}
      {!readOnly && onDelete && (
        <Button
          size="sm"
          variant="ghost"
          className={`${iconBtnClass} text-status-alert`}
          aria-label={t("common.delete")}
          isDisabled={deleteDisabled}
          onPress={handleDelete}
        >
          <IconTrash size={16} />
        </Button>
      )}
    </div>
  );
}

/** Icon edit button for table toolbars (single-record settings screens). */
export function SettingsEditIconButton({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  return (
    <Button
      variant="outline"
      size="sm"
      isIconOnly
      className="border-border-fiscal"
      aria-label={t("common.edit")}
      onPress={onPress}
    >
      <IconEdit size={16} />
    </Button>
  );
}
