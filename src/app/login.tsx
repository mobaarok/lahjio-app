import { Link } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { AuthForm } from "@/components/AuthForm";
import { Alert, Button, Field } from "@/components/ui";
import { colors } from "@/constants/theme";
import { useLocale } from "@/context/LocaleContext";
import { authErrorKey } from "@/lib/authErrors";
import { auth } from "@/lib/firebase";

export default function LoginScreen() {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // After login, the root layout shows the home screen by itself
  async function handleSubmit() {
    setError("");
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      setError(t(authErrorKey(err)));
      setLoading(false);
    }
  }

  return (
    <AuthForm title={t("login.title")} subtitle={t("login.subtitle")}>
      {error ? <Alert>{error}</Alert> : null}
      <Alert tone="info">{t("auth.googleSoon")}</Alert>

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
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        onSubmitEditing={handleSubmit}
      />

      <Link href="/forgot-password" style={styles.link}>
        {t("login.forgot")}
      </Link>

      <Button
        title={loading ? t("login.loading") : t("nav.login")}
        size="lg"
        loading={loading}
        disabled={!email || !password}
        onPress={handleSubmit}
      />

      <Text style={styles.footer}>
        {t("login.new")}{" "}
        <Link href="/signup" replace style={styles.link}>
          {t("login.signupLink")}
        </Link>
      </Text>
    </AuthForm>
  );
}

const styles = StyleSheet.create({
  link: { color: colors.primaryDark, fontWeight: "600" },
  footer: { textAlign: "center", color: colors.textMuted },
});
