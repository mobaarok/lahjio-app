// Turns a Firebase error into a message key for useLocale().t()
import type { MessageKey } from "@/i18n/messages";

const keys: Record<string, MessageKey> = {
  "auth/email-already-in-use": "auth.emailInUse",
  "auth/invalid-email": "auth.invalidEmail",
  "auth/missing-email": "auth.missingEmail",
  "auth/missing-password": "auth.wrongLogin",
  "auth/weak-password": "auth.weakPassword",
  "auth/invalid-credential": "auth.wrongLogin",
  "auth/user-not-found": "auth.wrongLogin",
  "auth/wrong-password": "auth.wrongLogin",
  "auth/user-disabled": "auth.disabled",
  "auth/too-many-requests": "auth.tooMany",
  "auth/network-request-failed": "auth.network",
  "auth/requires-recent-login": "auth.recentLogin",
};

export function authErrorKey(error: unknown): MessageKey {
  const code = (error as { code?: string } | null)?.code ?? "";
  return keys[code] ?? "auth.unknown";
}
