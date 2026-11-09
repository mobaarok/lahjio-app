// First screen for learners who are not logged in
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/ui";
import { colors, radius, spacing } from "@/constants/theme";
import { useLocale } from "@/context/LocaleContext";

export default function WelcomeScreen() {
  const { t } = useLocale();

  return (
    <Screen edges={["top", "bottom"]} contentStyle={styles.screen}>
      <View style={styles.hero}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>ل</Text>
        </View>
        <Text style={styles.brand}>Lahjio</Text>
        <Text style={styles.title}>{t("welcome.title")}</Text>
        <Text style={styles.subtitle}>{t("welcome.subtitle")}</Text>
      </View>

      <View style={styles.language}>
        <Text style={styles.languageLabel}>{t("language.label")}</Text>
        <LanguageSwitcher />
      </View>

      <View style={styles.actions}>
        <Button title={t("landing.ctaStart")} size="lg" onPress={() => router.push("/signup")} />
        <Button title={t("nav.login")} size="lg" variant="secondary" onPress={() => router.push("/login")} />
        <Button title={t("welcome.guest")} variant="ghost" onPress={() => router.push("/quiz")} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, justifyContent: "space-between", gap: spacing.xxl },
  hero: { alignItems: "center", marginTop: spacing.xxl * 2 },
  logo: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { color: colors.white, fontSize: 38, fontWeight: "700" },
  brand: { marginTop: spacing.md, fontSize: 30, fontWeight: "800", color: colors.primaryDark },
  title: { marginTop: spacing.lg, fontSize: 24, fontWeight: "700", color: colors.text, textAlign: "center" },
  subtitle: { marginTop: spacing.sm, fontSize: 16, color: colors.textMuted, textAlign: "center", lineHeight: 22 },
  language: { gap: spacing.sm, alignItems: "center" },
  languageLabel: { fontSize: 14, color: colors.textMuted },
  actions: { gap: spacing.sm },
});
