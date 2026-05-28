export function formatKES(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `Ksh ${(amount / 1_000_000_000).toFixed(2)}B`;
  }
  if (amount >= 1_000_000) {
    return `Ksh ${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `Ksh ${(amount / 1_000).toFixed(0)}K`;
  }
  return `Ksh ${amount.toLocaleString("en-KE")}`;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
