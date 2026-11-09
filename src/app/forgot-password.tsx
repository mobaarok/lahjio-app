// Firebase emails a link to choose a new password
import { router } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import { AuthForm } from "@/components/AuthForm";
import { Alert, Button, Field } from "@/components/ui";
import { useLocale } from "@/context/LocaleContext";
import { authErrorKey } from "@/lib/authErrors";
import { auth } from "@/lib/firebase";

export default function ForgotPasswordScreen() {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError("");
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
    } catch (err) {
      // Don't reveal whether an account exists for this email
      if ((err as { code?: string }).code === "auth/user-not-found") setSent(true);
      else setError(t(authErrorKey(err)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthForm title={t("reset.title")} subtitle={t("reset.subtitle")}>
      {sent ? (
        <Alert tone="success">{t("reset.sent")}</Alert>
      ) : (
        <>
          {error ? <Alert>{error}</Alert> : null}
          <Field
            label={t("auth.email")}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onSubmitEditing={handleSubmit}
          />
          <Button
            title={loading ? t("reset.sending") : t("reset.button")}
            size="lg"
            loading={loading}
            disabled={!email}
            onPress={handleSubmit}
          />
        </>
      )}
      <Button title={`← ${t("reset.back")}`} variant="ghost" onPress={() => router.back()} />
    </AuthForm>
  );
}
