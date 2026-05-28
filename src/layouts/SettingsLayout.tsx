import { Breadcrumbs } from "@heroui/react";
import { useEffect, useState } from "react";
import { Link as RouterLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { MobileNav } from "../components/dashboard/MobileNav";
import { Sidebar } from "../components/dashboard/Sidebar";
import { TopBar } from "../components/dashboard/TopBar";
import { useTranslation } from "../context/LanguageContext";
import { getSettingsPageKey } from "../lib/settings-nav";
import { fiscal } from "../lib/fiscal";

type SettingsLayoutProps = {
  onSignOut: () => void;
};

export function SettingsLayout({ onSignOut }: SettingsLayoutProps) {
  const { pathname } = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { t } = useTranslation();
  const pageKey = getSettingsPageKey(pathname);
  const pageTitle = pageKey ? t(pageKey) : t("nav.settings");

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    function onResize() {
      if (window.matchMedia("(min-width: 1024px)").matches) {
        setMobileNavOpen(false);
      }
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (pathname === "/settings" || pathname === "/settings/") {
    return <Navigate to="/settings/company" replace />;
  }

  return (
    <div
      className={`flex h-screen overflow-hidden ${fiscal.bgSurface} ${fiscal.fontSans} text-brand-primary`}
    >
      <Sidebar />
      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <TopBar
          onSignOut={onSignOut}
          onMenuPress={() => setMobileNavOpen(true)}
          breadcrumb={
            <Breadcrumbs className="hidden min-w-0 lg:flex">
              <Breadcrumbs.Item>
                <RouterLink to="/" className={fiscal.link}>
                  {t("common.home")}
                </RouterLink>
              </Breadcrumbs.Item>
              <Breadcrumbs.Item>
                <RouterLink to="/settings/company" className={fiscal.link}>
                  {t("nav.settings")}
                </RouterLink>
              </Breadcrumbs.Item>
              <Breadcrumbs.Item className={fiscal.heading}>{pageTitle}</Breadcrumbs.Item>
            </Breadcrumbs>
          }
          title={pageTitle}
        />

        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="w-full min-w-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
