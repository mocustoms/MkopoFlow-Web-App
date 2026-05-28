import { Button } from "@heroui/react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "../../context/LanguageContext";
import { customersNavPaths, isCustomersSectionActive } from "../../lib/customers-nav";
import { fiscal } from "../../lib/fiscal";
import { IconChevron, IconUsers } from "./icons";

type CustomersSidebarGroupProps = {
  onNavigate?: () => void;
};

const navBtnBase = `h-auto min-h-0 ${fiscal.sidebarLink}`;

export function CustomersSidebarGroup({ onNavigate }: CustomersSidebarGroupProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const isCustomersActive = isCustomersSectionActive(pathname);
  const [open, setOpen] = useState(isCustomersActive);

  useEffect(() => {
    if (isCustomersActive) setOpen(true);
  }, [isCustomersActive]);

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
          isCustomersActive
            ? `justify-between gap-2 ${navBtnBase} ${fiscal.sidebarLinkActive}`
            : `justify-between gap-2 ${navBtnBase}`
        }
        onPress={() => {
          if (!open) {
            setOpen(true);
            if (!isCustomersActive) goTo("/customers");
          } else {
            setOpen(false);
          }
        }}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className={fiscal.sidebarIcon}>
            <IconUsers size={18} />
          </span>
          <span className="text-sm">{t("nav.customers")}</span>
        </span>
        <IconChevron
          size={16}
          className={`shrink-0 text-sidebar-muted transition-transform ${open ? "rotate-90" : ""}`}
        />
      </Button>

      {open && (
        <div className={`ml-3 flex flex-col gap-0.5 border-l ${fiscal.sidebarBorder} py-0.5 pl-2`}>
          {customersNavPaths.map((item) => {
            const isActive =
              item.path === "/customers"
                ? pathname === "/customers"
                : pathname === item.path || pathname.startsWith(`${item.path}/`);
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
