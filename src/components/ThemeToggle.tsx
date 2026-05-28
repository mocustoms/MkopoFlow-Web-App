import { Button } from "@heroui/react";
import { useTranslation } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { fiscal } from "../lib/fiscal";
import { IconMoon, IconSun } from "./dashboard/icons";

type ThemeToggleProps = {
  /** Compact icon-only for top bar; full label on auth screens */
  variant?: "icon" | "labeled";
  className?: string;
};

export function ThemeToggle({ variant = "icon", className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === "dark";
  const label = isDark ? t("theme.light") : t("theme.dark");

  if (variant === "labeled") {
    return (
      <Button
        variant="outline"
        size="sm"
        className={`${fiscal.badge} border-border-fiscal ${className ?? ""}`}
        onPress={toggleTheme}
        aria-label={label}
      >
        <span className="flex items-center gap-2">
          {isDark ? <IconSun size={16} /> : <IconMoon size={16} />}
          {label}
        </span>
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      isIconOnly
      size="sm"
      className={`border-border-fiscal ${className ?? ""}`}
      onPress={toggleTheme}
      aria-label={label}
    >
      {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
    </Button>
  );
}
