import { Button } from "@heroui/react";
import { useTranslation } from "../context/LanguageContext";
import type { Locale } from "../i18n/translate";
import { fiscal } from "../lib/fiscal";

type LanguageToggleProps = {
  variant?: "chip" | "buttons";
  className?: string;
};

export function LanguageToggle({ variant = "chip", className }: LanguageToggleProps) {
  const { locale, setLocale, localeLabel, t } = useTranslation();

  if (variant === "buttons") {
    return (
      <div className={`flex gap-1 ${className ?? ""}`}>
        {(["en", "sw"] as const satisfies readonly Locale[]).map((loc) => (
          <Button
            key={loc}
            size="sm"
            variant={locale === loc ? "primary" : "outline"}
            className={`${fiscal.badge} min-w-0 px-2.5`}
            onPress={() => setLocale(loc)}
            aria-label={localeLabel(loc)}
          >
            {loc === "en" ? "EN" : "SW"}
          </Button>
        ))}
      </div>
    );
  }

  const nextLocale: Locale = locale === "en" ? "sw" : "en";

  return (
    <Button
      variant="outline"
      size="sm"
      className={`${fiscal.badge} min-w-0 border-border-fiscal px-2.5 ${className ?? ""}`}
      onPress={() => setLocale(nextLocale)}
      aria-label={t("language.switchTo")}
    >
      {locale === "en" ? "EN" : "SW"}
    </Button>
  );
}
