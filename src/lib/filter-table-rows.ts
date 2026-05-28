/** Client-side table search across string values from a row. */
export function filterTableRows<T>(
  rows: T[],
  query: string,
  getSearchText: (row: T) => string,
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter((row) => getSearchText(row).toLowerCase().includes(q));
}

export function joinSearchParts(...parts: (string | number | boolean | null | undefined)[]): string {
  return parts
    .filter((p) => p != null && p !== "")
    .map(String)
    .join(" ");
}
