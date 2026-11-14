// "This account was deleted, so you can't log in with it." Shown on the
// welcome, login and signup screens after a deleted account tried to log in
// (AuthProvider logs it out again). Shows nothing otherwise.
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import { Alert } from "./ui";

export function DeletedNotice() {
  const { deletedSignIn } = useAuth();
  const { t } = useLocale();
  return deletedSignIn ? <Alert>{t("account.deletedNotice")}</Alert> : null;
}
