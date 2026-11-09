// Profile, language, feedback and logout
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { router, type Href } from "expo-router";
import { signOut, updateProfile } from "firebase/auth";
import { useState, type ComponentProps } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Screen } from "@/components/Screen";
import { Alert, Button, Card, Field, PageHeader } from "@/components/ui";
import { colors, spacing } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import type { MessageKey } from "@/i18n/messages";
import { sendFeedback } from "@/lib/account";
import { authErrorKey } from "@/lib/authErrors";
import { auth } from "@/lib/firebase";

type IconName = ComponentProps<typeof Ionicons>["name"];

const links: { href: Href; key: MessageKey; icon: IconName }[] = [
  { href: "/progress", key: "nav.progress", icon: "stats-chart-outline" },
  { href: "/quiz", key: "nav.quiz", icon: "help-circle-outline" },
  { href: "/privacy", key: "footer.privacy", icon: "lock-closed-outline" },
  { href: "/terms", key: "footer.terms", icon: "document-text-outline" },
];

export default function AccountScreen() {
  const { user, refreshUser } = useAuth();
  const { t, num } = useLocale();

  const [name, setName] = useState(user?.displayName ?? "");
  const [feedback, setFeedback] = useState("");
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [busy, setBusy] = useState<"" | "name" | "feedback">("");

  if (!user) return null; // the root layout moves logged-out learners away

  // Runs one action at a time and shows its result
  async function run(action: "name" | "feedback", task: () => Promise<void>, successKey: MessageKey) {
    setBusy(action);
    setMessage(null);
    try {
      await task();
      setMessage({ tone: "success", text: t(successKey) });
    } catch (err) {
      setMessage({ tone: "error", text: t(authErrorKey(err)) });
    } finally {
      setBusy("");
    }
  }

  function saveName() {
    if (!user) return;
    run(
      "name",
      async () => {
        await updateProfile(user, { displayName: name.trim() });
        refreshUser();
      },
      "account.nameSaved"
    );
  }

  function submitFeedback() {
    if (!user || !feedback.trim()) return;
    run(
      "feedback",
      async () => {
        await sendFeedback(user, feedback);
        setFeedback("");
      },
      "account.feedbackSent"
    );
  }

  const version = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <Screen>
      <PageHeader title={t("nav.account")} subtitle={user.email ?? ""} />

      {message ? <Alert tone={message.tone}>{message.text}</Alert> : null}

      <Card style={styles.links}>
        {links.map((link, i) => (
          <Pressable
            key={link.key}
            accessibilityRole="button"
            onPress={() => router.push(link.href)}
            style={({ pressed }) => [styles.link, i > 0 && styles.linkBorder, pressed && styles.linkPressed]}
          >
            <Ionicons name={link.icon} size={20} color={colors.primaryDark} />
            <Text style={styles.linkText}>{t(link.key)}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
          </Pressable>
        ))}
        <Pressable
          accessibilityRole="link"
          onPress={() => Linking.openURL("https://lahjio.app")}
          style={({ pressed }) => [styles.link, styles.linkBorder, pressed && styles.linkPressed]}
        >
          <Ionicons name="globe-outline" size={20} color={colors.primaryDark} />
          <Text style={styles.linkText}>{t("account.website")}</Text>
          <Ionicons name="open-outline" size={18} color={colors.textFaint} />
        </Pressable>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.label}>{t("language.label")}</Text>
        <LanguageSwitcher />
      </Card>

      <Card style={styles.section}>
        <Field label={t("account.name")} value={name} onChangeText={setName} autoComplete="name" />
        <Button
          title={t("account.saveName")}
          variant="secondary"
          loading={busy === "name"}
          disabled={!name.trim()}
          onPress={saveName}
        />
      </Card>

      <Card style={styles.section}>
        <Field
          label={t("account.feedback")}
          hint={t("account.feedbackHint")}
          value={feedback}
          onChangeText={setFeedback}
          multiline
          maxLength={2000}
        />
        <Button
          title={t("account.send")}
          loading={busy === "feedback"}
          disabled={!feedback.trim()}
          onPress={submitFeedback}
        />
      </Card>

      <Button
        title={t("account.logout")}
        size="lg"
        variant="secondary"
        icon={<Ionicons name="log-out-outline" size={20} color={colors.text} />}
        onPress={() => signOut(auth)}
      />

      <View>
        <Text style={styles.version}>{t("account.version", { version: num(version) })}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  links: { overflow: "hidden" },
  link: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: 14 },
  linkBorder: { borderTopWidth: 1, borderTopColor: colors.divider },
  linkPressed: { backgroundColor: colors.background },
  linkText: { flex: 1, fontSize: 16, fontWeight: "500", color: colors.text },
  section: { padding: spacing.xl, gap: spacing.md },
  label: { fontSize: 14, fontWeight: "500", color: colors.textBody },
  version: { textAlign: "center", fontSize: 12, color: colors.textFaint },
});
