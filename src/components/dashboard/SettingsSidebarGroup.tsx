import { Button } from "@heroui/react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "../../context/LanguageContext";
import { settingsNavPaths } from "../../lib/settings-nav";
import { fiscal } from "../../lib/fiscal";
import { IconChevron, IconSettings } from "./icons";

type SettingsSidebarGroupProps = {
  onNavigate?: () => void;
};

const navBtnBase = `h-auto min-h-0 ${fiscal.sidebarLink}`;

export function SettingsSidebarGroup({ onNavigate }: SettingsSidebarGroupProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const isSettingsActive = pathname.startsWith("/settings");
  const [open, setOpen] = useState(isSettingsActive);

  useEffect(() => {
    if (isSettingsActive) setOpen(true);
  }, [isSettingsActive]);

  function goTo(path: string) {
    navigate(path);
    onNavigate?.();
  }

  return (
    <div className="flex flex-col gap-0.5">
      <Button
        variant="ghost"
        fullWidth
        className={
          isSettingsActive
            ? `justify-between gap-2 ${navBtnBase} ${fiscal.sidebarLinkActive}`
            : `justify-between gap-2 ${navBtnBase}`
        }
        onPress={() => {
          if (!open) {
            setOpen(true);
            if (!isSettingsActive) goTo("/settings/company");
          } else {
            setOpen(false);
          }
        }}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className={fiscal.sidebarIcon}>
            <IconSettings size={18} />
          </span>
          <span className="text-sm">{t("nav.settings")}</span>
        </span>
        <IconChevron
          size={16}
          className={`shrink-0 text-sidebar-muted transition-transform ${open ? "rotate-90" : ""}`}
        />
      </Button>

      {open && (
        <div className={`ml-3 flex flex-col gap-0.5 border-l ${fiscal.sidebarBorder} py-0.5 pl-2`}>
          {settingsNavPaths.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Button
                key={item.path}
                variant="ghost"
                fullWidth
                size="sm"
                className={
                  isActive
                    ? `justify-start ${fiscal.sidebarLinkActive}`
                    : `justify-start ${fiscal.sidebarLinkMuted}`
                }
                onPress={() => goTo(item.path)}
              >
                <span className="truncate text-left text-xs">
                  {t(item.key)}
                </span>
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}
