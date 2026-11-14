// "Continue with Google", shown above the email form on the login and signup
// screens, with an "or with email" line under it. Shows nothing where Google
// sign-in can't work (Expo Go). After login, the root layout opens home.
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/constants/theme";
import { useLocale } from "@/context/LocaleContext";
import { authErrorKey } from "@/lib/authErrors";
import { googleSignInAvailable, signInWithGoogle } from "@/lib/googleSignIn";
import { Button } from "./ui";

// onError gets a translated message, or "" to clear the old one
export function GoogleButton({ onError }: { onError: (message: string) => void }) {
  const { t } = useLocale();
  const [loading, setLoading] = useState(false);

  if (!googleSignInAvailable) return null;

  async function handlePress() {
    onError("");
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      onError(t(authErrorKey(err)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        title={loading ? t("auth.googleOpening") : t("auth.google")}
        variant="secondary"
        size="lg"
        loading={loading}
        icon={<Ionicons name="logo-google" size={20} color="#EA4335" />}
        onPress={handlePress}
      />
      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>{t("auth.orEmail")}</Text>
        <View style={styles.line} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  divider: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  line: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  dividerText: { fontSize: 13, color: colors.textMuted },
});
