import { Alert, Card, Description, Spinner } from "@heroui/react";
import type { ReactNode } from "react";
import { useTranslation } from "../../context/LanguageContext";
import { fiscal } from "../../lib/fiscal";

const cardClass = "border border-border-fiscal shadow-none";

type SettingsPageShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
  loading?: boolean;
  error?: string | null;
  actions?: ReactNode;
  readOnly?: boolean;
};

export function SettingsPageShell({
  title,
  description,
  children,
  loading,
  error,
  actions,
  readOnly,
}: SettingsPageShellProps) {
  const { t } = useTranslation();

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className={`${fiscal.heading} text-xl`}>{title}</h1>
          {description ? (
            <Description className={`${fiscal.label} mt-1 text-sm`}>{description}</Description>
          ) : null}
        </div>
        {actions}
      </div>

      {readOnly && (
        <Alert className={cardClass}>
          <Alert.Title>{t("common.viewOnly")}</Alert.Title>
          <Alert.Description>{t("common.viewOnlySettings")}</Alert.Description>
        </Alert>
      )}

      {error && (
        <Alert status="danger" className={cardClass}>
          <Alert.Description>{error}</Alert.Description>
        </Alert>
      )}

      {loading ? (
        <Card className={`${cardClass} flex items-center justify-center py-16`}>
          <Spinner size="lg" />
        </Card>
      ) : (
        <Card className={`${cardClass} w-full p-4 sm:p-6`}>{children}</Card>
      )}
    </div>
  );
}
