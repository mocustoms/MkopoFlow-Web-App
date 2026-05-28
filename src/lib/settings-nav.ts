export const settingsNavPaths = [
  { key: "settings.nav.company", path: "/settings/company" },
  { key: "settings.nav.currencies", path: "/settings/currencies" },
  { key: "settings.nav.financialYear", path: "/settings/financial-year" },
  { key: "settings.nav.expenseCategories", path: "/settings/expense-categories" },
  { key: "settings.nav.autocode", path: "/settings/autocode" },
  { key: "settings.nav.interest", path: "/settings/interest" },
  { key: "settings.nav.loans", path: "/settings/loans" },
  { key: "settings.nav.penalties", path: "/settings/penalties" },
  { key: "settings.nav.classification", path: "/settings/classification" },
  { key: "settings.nav.notifications", path: "/settings/notifications" },
  { key: "settings.nav.branches", path: "/settings/branches" },
  { key: "settings.nav.roles", path: "/settings/roles" },
  { key: "settings.nav.users", path: "/settings/users" },
] as const;

export function getSettingsPageKey(pathname: string): string | null {
  const item = settingsNavPaths.find(
    (i) => pathname === i.path || pathname.startsWith(`${i.path}/`),
  );
  return item?.key ?? null;
}
