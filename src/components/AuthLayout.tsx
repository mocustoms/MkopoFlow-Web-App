import { Card } from "@heroui/react";
import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";
import { useTranslation } from "../context/LanguageContext";
import { fiscal } from "../lib/fiscal";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  const { t } = useTranslation();

  return (
    <div
      className={`relative flex min-h-screen flex-col items-center justify-center ${fiscal.bgSurface} ${fiscal.fontSans} px-4 py-8 sm:px-6 sm:py-12`}
    >
      <div className="absolute right-4 top-4 flex gap-2 sm:right-6 sm:top-6">
        <LanguageToggle variant="buttons" />
        <ThemeToggle variant="labeled" />
      </div>

      <div className="mb-6 text-center sm:mb-8">
        <p className={`${fiscal.label} text-xs uppercase tracking-wider`}>
          {t("common.platformTagline")}
        </p>
        <h1 className={`${fiscal.heading} mt-1 text-2xl sm:text-3xl`}>{t("common.appName")}</h1>
      </div>

      <Card className="w-full max-w-md border border-border-fiscal shadow-none">
        <Card.Header className="border-b border-border-fiscal">
          <Card.Title className={fiscal.heading}>{title}</Card.Title>
          <Card.Description className={fiscal.label}>{subtitle}</Card.Description>
        </Card.Header>
        <Card.Content className="py-4">{children}</Card.Content>
        {footer && (
          <Card.Footer className="flex flex-col gap-2 border-t border-border-fiscal">
            {footer}
          </Card.Footer>
        )}
      </Card>

      <p className={`${fiscal.label} mt-6 text-sm`}>
        <RouterLink to="/login" className={fiscal.link}>
          {t("auth.backToSignIn")}
        </RouterLink>
      </p>
    </div>
  );
}

export function AuthLink({
  to,
  children,
}: {
  to: string;
  children: ReactNode;
}) {
  return (
    <RouterLink to={to} className={`${fiscal.link} text-sm`}>
      {children}
    </RouterLink>
  );
}
