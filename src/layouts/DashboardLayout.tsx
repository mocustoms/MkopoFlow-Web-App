import { useEffect, useState, type ReactNode } from "react";
import { MobileNav } from "../components/dashboard/MobileNav";
import { Sidebar } from "../components/dashboard/Sidebar";
import { TopBar } from "../components/dashboard/TopBar";
import { fiscal } from "../lib/fiscal";

type DashboardLayoutProps = {
  children: ReactNode;
  onSignOut: () => void;
  title?: string;
};

export function DashboardLayout({ children, onSignOut, title }: DashboardLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
          title={title}
        />
        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
