import { en } from "./locales/en.js";
import { sw } from "./locales/sw.js";

export type Locale = "en" | "sw";

const dictionaries = { en, sw } as const;

export function getNestedValue(obj: unknown, path: string): string | undefined {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : undefined;
}

export function translate(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>,
): string {
  const template =
    getNestedValue(dictionaries[locale], key) ??
    getNestedValue(dictionaries.en, key) ??
    key;

  if (!params) return template;

  return template.replace(/\{\{(\w+)\}\}/g, (_, name: string) => {
    const value = params[name];
    return value !== undefined ? String(value) : `{{${name}}}`;
  });
}

export function getLocaleLabel(locale: Locale, displayLocale: Locale): string {
  return translate(displayLocale, `language.${locale}`);
}
