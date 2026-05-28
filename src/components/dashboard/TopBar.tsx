import { Avatar, Breadcrumbs, Button, Dropdown, Separator } from "@heroui/react";
import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";
import { LanguageToggle } from "../LanguageToggle";
import { ThemeToggle } from "../ThemeToggle";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../context/LanguageContext";
import { fiscal } from "../../lib/fiscal";
import { IconMenu } from "./icons";

type TopBarProps = {
  onSignOut: () => void;
  onMenuPress: () => void;
  title?: string;
  breadcrumb?: ReactNode;
};

export function TopBar({
  onSignOut,
  onMenuPress,
  title,
  breadcrumb,
}: TopBarProps) {
  const { auth } = useAuth();
  const { t } = useTranslation();
  const displayTitle = title ?? t("nav.dashboard");
  const displayName = auth?.user.name ?? auth?.user.email ?? "User";
  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const roleLabel =
    auth?.user.role === "ADMIN"
      ? t("roles.admin")
      : auth?.user.role === "LOAN_OFFICER"
        ? t("roles.loanOfficer")
        : t("roles.viewer");

  return (
    <header
      className={`${fiscal.panel} flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border-fiscal px-4 py-3 sm:gap-4 lg:px-6`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Button
          variant="outline"
          isIconOnly
          aria-label="Open menu"
          className="shrink-0 border-border-fiscal lg:hidden"
          onPress={onMenuPress}
        >
          <IconMenu size={20} />
        </Button>

        <div className="min-w-0 lg:hidden">
          <p className={`${fiscal.heading} truncate text-sm`}>{displayTitle}</p>
        </div>

        {breadcrumb ?? (
          <Breadcrumbs className="hidden min-w-0 lg:flex">
            <Breadcrumbs.Item>
              <RouterLink to="/" className={fiscal.link}>
                {t("common.home")}
              </RouterLink>
            </Breadcrumbs.Item>
            <Breadcrumbs.Item className={fiscal.heading}>{displayTitle}</Breadcrumbs.Item>
          </Breadcrumbs>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <ThemeToggle />
        <LanguageToggle />

        <Separator orientation="vertical" className="hidden h-8 bg-border-fiscal sm:block" />

        <Dropdown>
          <Dropdown.Trigger
            aria-label={t("common.profileMenu")}
            className="rounded-full border-0 bg-transparent p-0 outline-none"
          >
            <Avatar
              size="sm"
              className="border border-border-fiscal bg-brand-accent text-sidebar-fg"
            >
              <Avatar.Fallback className={fiscal.badge}>{initials}</Avatar.Fallback>
            </Avatar>
          </Dropdown.Trigger>
          <Dropdown.Popover placement="bottom end" className="min-w-[12rem]">
            <div className="border-b border-border-fiscal px-3 py-2.5">
              <p className={`${fiscal.heading} truncate text-sm leading-tight`}>{displayName}</p>
              <p className={`${fiscal.label} text-xs`}>{roleLabel}</p>
            </div>
            <Dropdown.Menu
              onAction={(key) => {
                if (key === "sign-out") onSignOut();
              }}
            >
              <Dropdown.Item id="sign-out" textValue={t("common.signOut")}>
                {t("common.signOut")}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      </div>
    </header>
  );
}
