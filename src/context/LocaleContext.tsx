// The interface language and the translation helpers, shared through useLocale():
//   t("nav.home")                    -> "হোম" or "Home"
//   t("words.found", { count: 3 })   -> fills {count} in the message
//   num(42)                          -> "৪২" in Bangla, "42" in English
//   meaningOf(item), pronunciationOf(item), noteOf(item), localized(course, "title")
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  DEFAULT_LOCALE,
  isLocaleCode,
  LOCALES,
  type ContentLanguage,
  type LocaleCode,
} from "@/i18n/locales";
import { messages, type MessageKey } from "@/i18n/messages";
import { readString, writeString } from "@/lib/storage";
import type { Item } from "@/lib/types";

const STORAGE_KEY = "lahjio-locale";

type Vars = Record<string, string | number>;

interface LocaleValue {
  locale: LocaleCode;
  contentLocale: ContentLanguage;
  rtl: boolean;
  ready: boolean;
  setLocale: (code: LocaleCode) => void;
  t: (key: MessageKey, vars?: Vars) => string;
  num: (value: number | string) => string;
  meaningOf: (item: Item) => string;
  pronunciationOf: (item: Item) => string;
  noteOf: (item: Item) => string;
  localized: (object: object | null | undefined, field: string) => string;
}

const LocaleContext = createContext<LocaleValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);

  // Load the language saved on the phone
  useEffect(() => {
    readString(STORAGE_KEY).then((saved) => {
      if (isLocaleCode(saved)) setLocaleState(saved);
      setReady(true);
    });
  }, []);

  const setLocale = useCallback((code: LocaleCode) => {
    setLocaleState(code);
    writeString(STORAGE_KEY, code);
  }, []);

  const value = useMemo<LocaleValue>(() => {
    const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];
    // Language of lessons and meanings; Hindi and Urdu use English for now
    const contentLocale = current.content;

    // Looks up a message, falling back to English, then to the key itself
    const t = (key: MessageKey, vars: Vars = {}) => {
      const text = messages[locale]?.[key] ?? messages.en[key] ?? key;
      return text.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? ""));
    };

    // Numbers in the language's own digits
    const num = (n: number | string) => {
      const digits = current.digits;
      return digits ? String(n).replace(/\d/g, (d) => digits[Number(d)]) : String(n);
    };

    // English falls back to Bangla when an item has no English yet
    const meaningOf = (item: Item) =>
      contentLocale === "en" ? item.english || item.bangla : item.bangla;

    const pronunciationOf = (item: Item) =>
      (contentLocale === "en"
        ? item.en_transliteration || item.bn_transliteration
        : item.bn_transliteration) ?? "";

    // No fallback: a Bangla note doesn't help an English learner
    const noteOf = (item: Item) => (contentLocale === "en" ? item.note_en : item.note_bn) || "";

    // Reads title_en or title_bn (by content language), falling back to the other
    const localized = (object: object | null | undefined, field: string) => {
      const record = (object ?? {}) as Record<string, unknown>;
      const pick = (suffix: string) => record[`${field}_${suffix}`];
      return String(pick(contentLocale) || pick("bn") || pick("en") || "");
    };

    return {
      locale,
      contentLocale,
      rtl: current.rtl,
      ready,
      setLocale,
      t,
      num,
      meaningOf,
      pronunciationOf,
      noteOf,
      localized,
    };
  }, [locale, ready, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleValue {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used inside <LocaleProvider>");
  return context;
}
