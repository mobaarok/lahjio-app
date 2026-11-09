import { router } from "expo-router";
import { Screen } from "@/components/Screen";
import { Button, EmptyState } from "@/components/ui";
import { useLocale } from "@/context/LocaleContext";

export default function NotFoundScreen() {
  const { t } = useLocale();
  return (
    <Screen edges={["top", "bottom"]}>
      <EmptyState title={t("notFound.title")}>{t("notFound.text")}</EmptyState>
      <Button title={t("common.goHome")} onPress={() => router.replace("/")} />
    </Screen>
  );
}
