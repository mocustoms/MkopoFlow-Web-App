export const financingNavPaths = [
  { key: "financing.nav.chartOfAccounts", path: "/financing/chart-of-accounts" },
] as const;

export function getFinancingPageKey(pathname: string): string | null {
  const item = financingNavPaths.find(
    (i) => pathname === i.path || pathname.startsWith(`${i.path}/`),
  );
  return item?.key ?? null;
}

export function isFinancingSectionActive(pathname: string): boolean {
  return pathname === "/financing" || pathname.startsWith("/financing/");
}
