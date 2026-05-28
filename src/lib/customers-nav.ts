export const customersNavPaths = [
  { key: "nav.customerList", path: "/customers" },
  { key: "nav.customerGroups", path: "/customers/groups" },
] as const;

export function getCustomersPageKey(pathname: string): string | null {
  const sorted = [...customersNavPaths].sort((a, b) => b.path.length - a.path.length);
  const item = sorted.find(
    (i) => pathname === i.path || pathname.startsWith(`${i.path}/`),
  );
  return item?.key ?? null;
}

export function isCustomersSectionActive(pathname: string): boolean {
  return pathname === "/customers" || pathname.startsWith("/customers/");
}
