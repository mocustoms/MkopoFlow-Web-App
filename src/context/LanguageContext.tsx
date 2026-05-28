import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getLocaleLabel, translate, type Locale } from "../i18n/translate.js";

const STORAGE_KEY = "mkopoflow.locale";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  localeLabel: (loc: Locale) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLocale(): Locale | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "en" || raw === "sw") return raw;
  } catch {
    /* ignore */
  }
  return null;
}

export function resolveInitialLocale(): Locale {
  const stored = readStoredLocale();
  if (stored) return stored;
  if (typeof navigator !== "undefined") {
    const lang = navigator.language.toLowerCase();
    if (lang.startsWith("sw")) return "sw";
  }
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => resolveInitialLocale());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((l) => (l === "en" ? "sw" : "en"));
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(locale, key, params),
    [locale],
  );

  const localeLabel = useCallback((loc: Locale) => getLocaleLabel(loc, locale), [locale]);

  const value = useMemo(
    () => ({ locale, setLocale, toggleLocale, t, localeLabel }),
    [locale, setLocale, toggleLocale, t, localeLabel],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}

/** Shorthand for translate function */
export function useTranslation() {
  const { t, locale, setLocale, toggleLocale, localeLabel } = useLanguage();
  return { t, locale, setLocale, toggleLocale, localeLabel };
}
