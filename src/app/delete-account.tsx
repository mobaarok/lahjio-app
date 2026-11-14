// "Delete account": a soft delete, the same as on the website. It marks the
// profile with is_deleted (see markAccountDeleted) and logs out; after that,
// AuthProvider refuses to log this account in again. Nothing is removed from
// Firestore, and the Firebase login itself stays.
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { Screen } from "@/components/Screen";
import { Alert, Button, Card } from "@/components/ui";
import { colors, spacing } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import { markAccountDeleted } from "@/lib/account";
import { authErrorKey } from "@/lib/authErrors";
import { auth } from "@/lib/firebase";
import { signOutOfGoogle } from "@/lib/googleSignIn";

export default function DeleteAccountScreen() {
  const { user } = useAuth();
  const { t } = useLocale();
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  if (!user) return null; // the root layout moves logged-out learners away

  async function handleDelete() {
    if (!user) return;
    setError("");
    setDeleting(true);
    try {
      await markAccountDeleted(user.uid);
    } catch (err) {
      // Saving failed: say so and stay logged in
      setError(t(authErrorKey(err)));
      setDeleting(false);
      return;
    }
    // Logged out, the root layout shows the welcome screen
    await signOutOfGoogle();
    await signOut(auth);
  }

  return (
    <Screen edges={["bottom"]}>
      <Card style={styles.card}>
        <Text style={styles.title}>{t("account.delete")}</Text>
        <Text style={styles.text}>{t("account.deleteText")}</Text>

        {error ? <Alert>{error}</Alert> : null}

        <Button
          title={deleting ? t("account.deleting") : t("account.deleteConfirm")}
          variant="danger"
          size="lg"
          disabled={deleting}
          onPress={handleDelete}
        />
        <Button
          title={t("account.deleteCancel")}
          variant="secondary"
          size="lg"
          disabled={deleting}
          onPress={() => router.back()}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.xl, gap: spacing.lg, borderColor: colors.redBorder, backgroundColor: colors.redSoft },
  title: { fontSize: 18, fontWeight: "700", color: colors.red },
  text: { fontSize: 15, lineHeight: 22, color: colors.red },
});
