// Languages the app interface can be shown in. Same list as the website
// (lahjio/src/i18n/locales.js), so a learner sees the same choices on both.
//
// content: which language lessons and word meanings are shown in. Hindi and
//   Urdu have their own interface text but no lesson translations yet, so
//   they use the English content and see courses ticked for English learners.
// rtl: right-to-left script (Urdu).
export type LocaleCode = "bn" | "en" | "hi" | "ur";
export type ContentLanguage = "bn" | "en";

export interface Locale {
  code: LocaleCode;
  label: string;
  digits: string | null;
  content: ContentLanguage;
  rtl: boolean;
}

export const LOCALES: Locale[] = [
  { code: "bn", label: "বাংলা", digits: "০১২৩৪৫৬৭৮৯", content: "bn", rtl: false },
  { code: "en", label: "English", digits: null, content: "en", rtl: false },
  { code: "hi", label: "हिन्दी", digits: null, content: "en", rtl: false },
  { code: "ur", label: "اردو", digits: null, content: "en", rtl: true },
];

export const DEFAULT_LOCALE: LocaleCode = "bn";

export function isLocaleCode(value: unknown): value is LocaleCode {
  return LOCALES.some((l) => l.code === value);
}

// The content language for an interface language, e.g. "hi" -> "en"
export function contentLanguage(code: LocaleCode): ContentLanguage {
  return LOCALES.find((l) => l.code === code)?.content ?? "bn";
}
