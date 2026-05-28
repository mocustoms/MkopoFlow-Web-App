import { Button, Chip, Separator } from "@heroui/react";
import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "../../context/LanguageContext";
import { fiscal } from "../../lib/fiscal";
import {
  IconDashboard,
  IconExpense,
  IconLoan,
  IconRepayment,
} from "./icons";
import { CustomersSidebarGroup } from "./CustomersSidebarGroup";
import { FinancingSidebarGroup } from "./FinancingSidebarGroup";
import { SettingsSidebarGroup } from "./SettingsSidebarGroup";

type NavItem = {
  labelKey: string;
  path?: string;
  icon: ReactNode;
  soon?: boolean;
};

const navItems: NavItem[] = [
  { labelKey: "nav.dashboard", path: "/", icon: <IconDashboard size={18} /> },
  { labelKey: "nav.loans", icon: <IconLoan size={18} />, soon: true },
  { labelKey: "nav.repayments", icon: <IconRepayment size={18} />, soon: true },
  { labelKey: "nav.expenses", icon: <IconExpense size={18} />, soon: true },
];

const navBtnBase = `h-auto min-h-0 justify-start gap-3 ${fiscal.sidebarLink}`;

type SidebarNavProps = {
  onNavigate?: () => void;
};

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useTranslation();

  function goTo(path: string) {
    navigate(path);
    onNavigate?.();
  }

  return (
    <>
      <div className={`border-b ${fiscal.sidebarBorder} px-5 py-5 lg:py-6`}>
        <p className={`${fiscal.sidebarTitle} text-lg font-medium`}>
          {t("common.appName")}
        </p>
        <p className={`${fiscal.sidebarSubtitle} mt-1 text-sm`}>
          {t("common.tagline")}
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = item.path != null && pathname === item.path;
          const label = t(item.labelKey);

          if (item.soon || !item.path) {
            return (
              <Button
                key={item.labelKey}
                variant="ghost"
                fullWidth
                isDisabled
                className={`justify-between ${fiscal.sidebarLinkMuted}`}
              >
                <span className="flex items-center gap-3">
                  <span className={fiscal.sidebarIcon}>{item.icon}</span>
                  <span>{label}</span>
                </span>
                <Chip
                  size="sm"
                  variant="soft"
                  className={`${fiscal.badge} border ${fiscal.sidebarBorder} bg-[var(--sidebar-hover)] text-sidebar-muted`}
                >
                  {t("common.soon")}
                </Chip>
              </Button>
            );
          }

          return (
            <Button
              key={item.labelKey}
              variant="ghost"
              fullWidth
              className={isActive ? `${navBtnBase} ${fiscal.sidebarLinkActive}` : navBtnBase}
              onPress={() => goTo(item.path!)}
            >
              <span className={fiscal.sidebarIcon}>{item.icon}</span>
              {label}
            </Button>
          );
        })}

        <CustomersSidebarGroup onNavigate={onNavigate} />
        <FinancingSidebarGroup onNavigate={onNavigate} />
        <SettingsSidebarGroup onNavigate={onNavigate} />
      </nav>

      <Separator className="bg-[var(--sidebar-border)]" />

      <p className={`${fiscal.sidebarSubtitle} px-5 py-4 text-xs`}>
        {t("common.footerModules")}
      </p>
    </>
  );
}
