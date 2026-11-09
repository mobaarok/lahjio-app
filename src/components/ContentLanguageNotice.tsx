// Tells Hindi and Urdu learners that lessons are in English for now
import { useLocale } from "@/context/LocaleContext";
import { LOCALES } from "@/i18n/locales";
import { Alert } from "./ui";

export function ContentLanguageNotice() {
  const { t, locale, contentLocale } = useLocale();
  if (locale === contentLocale) return null;

  const language = LOCALES.find((l) => l.code === locale)?.label ?? "";
  return <Alert tone="info">{t("contentLang.notice", { language })}</Alert>;
}
