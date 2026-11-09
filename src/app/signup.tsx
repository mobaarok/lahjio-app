import { Link } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { AuthForm } from "@/components/AuthForm";
import { Alert, Button, Field } from "@/components/ui";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import { authErrorKey } from "@/lib/authErrors";
import { auth } from "@/lib/firebase";

export default function SignupScreen() {
  const { t } = useLocale();
  const { refreshUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError("");
    if (password !== confirm) {
      setError(t("signup.mismatch"));
      return;
    }

    try {
      setLoading(true);
      const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
      // The name shows in the home screen greeting
      if (name.trim()) {
        await updateProfile(user, { displayName: name.trim() });
        refreshUser();
      }
    } catch (err) {
      setError(t(authErrorKey(err)));
      setLoading(false);
    }
  }

  return (
    <AuthForm title={t("signup.title")} subtitle={t("signup.subtitle")}>
      {error ? <Alert>{error}</Alert> : null}

      <Field label={t("account.name")} value={name} onChangeText={setName} autoComplete="name" textContentType="name" />
      <Field
        label={t("auth.email")}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <Field
        label={t("auth.password")}
        hint={t("signup.passwordHint")}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <Field
        label={t("signup.confirm")}
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        onSubmitEditing={handleSubmit}
      />

      <Button
        title={loading ? t("signup.loading") : t("signup.button")}
        size="lg"
        loading={loading}
        disabled={!email || password.length < 6 || !confirm}
        onPress={handleSubmit}
      />

      <Text style={styles.small}>
        {t("signup.agree")}{" "}
        <Link href="/privacy" style={styles.underline}>
          {t("footer.privacy")}
        </Link>
      </Text>
      <Text style={styles.footer}>
        {t("signup.haveAccount")}{" "}
        <Link href="/login" replace style={styles.link}>
          {t("nav.login")}
        </Link>
      </Text>
    </AuthForm>
  );
}

const styles = StyleSheet.create({
  link: { color: colors.primaryDark, fontWeight: "600" },
  underline: { textDecorationLine: "underline" },
  small: { textAlign: "center", fontSize: 12, color: colors.textMuted },
  footer: { textAlign: "center", color: colors.textMuted },
});
