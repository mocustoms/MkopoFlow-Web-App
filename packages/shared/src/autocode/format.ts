export const AUTOCODE_MODULES = ["CUSTOMER", "LOAN", "EXPENSE", "USER", "BRANCH"] as const;
export type AutocodeModule = (typeof AUTOCODE_MODULES)[number];

export const AUTOCODE_INCLUDE_DATES = ["NONE", "YEAR", "YEAR_MONTH"] as const;
export type AutocodeIncludeDate = (typeof AUTOCODE_INCLUDE_DATES)[number];

export type AutocodeFormatInput = {
  prefix: string;
  suffix?: string | null;
  separator?: string;
  sequencePadding: number;
  includeDate?: AutocodeIncludeDate;
};

export function dateSegment(includeDate: AutocodeIncludeDate, asOf: Date): string | null {
  if (includeDate === "NONE") return null;
  const year = asOf.getFullYear();
  if (includeDate === "YEAR") return String(year);
  const month = String(asOf.getMonth() + 1).padStart(2, "0");
  return `${year}${month}`;
}

/** Build a document code from rule parts and sequence number. */
export function formatAutocode(
  input: AutocodeFormatInput,
  sequence: number,
  asOf: Date = new Date(),
): string {
  const separator = input.separator ?? "";
  const parts: string[] = [input.prefix.trim()];
  const datePart = dateSegment(input.includeDate ?? "NONE", asOf);
  if (datePart) parts.push(datePart);
  parts.push(String(sequence).padStart(input.sequencePadding, "0"));
  const suffix = input.suffix?.trim();
  if (suffix) parts.push(suffix);
  return parts.join(separator);
}

export function previewAutocode(input: AutocodeFormatInput, nextSequence = 1): string {
  return formatAutocode(input, nextSequence);
}
