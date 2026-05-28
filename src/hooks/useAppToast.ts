import { toast } from "@heroui/react";
import { useCallback } from "react";
import { useTranslation } from "../context/LanguageContext";

export function useAppToast() {
  const { t } = useTranslation();

  const success = useCallback(
    (message?: string) => toast.success(message ?? t("toast.success")),
    [t],
  );

  const error = useCallback(
    (message?: string) => toast.danger(message ?? t("toast.error")),
    [t],
  );

  const info = useCallback(
    (message?: string) => toast.info(message ?? t("toast.info")),
    [t],
  );

  const warning = useCallback(
    (message?: string) => toast.warning(message ?? t("toast.warning")),
    [t],
  );

  const settingsSaved = useCallback(() => toast.success(t("toast.settingsSaved")), [t]);

  const created = useCallback(() => toast.success(t("toast.created")), [t]);

  const updated = useCallback(() => toast.success(t("toast.updated")), [t]);

  const deleted = useCallback(() => toast.success(t("toast.deleted")), [t]);

  return {
    success,
    error,
    info,
    warning,
    settingsSaved,
    created,
    updated,
    deleted,
  };
}
