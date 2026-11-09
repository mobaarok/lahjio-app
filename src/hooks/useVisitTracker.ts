// Saves a visit when a logged-in learner opens the app, and a heartbeat every
// 3 minutes while it's on screen ("online now" in Admin > Analytics).
import { useEffect } from "react";
import { AppState } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import { useProgress } from "@/context/ProgressContext";
import { recordHeartbeat, recordVisit } from "@/lib/account";

const HEARTBEAT_MS = 3 * 60 * 1000;

export function useVisitTracker(): void {
  const { user } = useAuth();
  const { locale, ready } = useLocale();
  const { loading: progressLoading } = useProgress();

  // Waits until progress has loaded: writing users/{uid} while it is being
  // read makes Firestore return only the fields written here (no XP or streak)
  useEffect(() => {
    if (!user || !ready || progressLoading) return;
    recordVisit(user, locale).catch(() => {});
  }, [user, locale, ready, progressLoading]);

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;

    const timer = setInterval(() => {
      // Only count the learner as online while the app is in front
      if (AppState.currentState === "active") recordHeartbeat(uid).catch(() => {});
    }, HEARTBEAT_MS);

    // Coming back to the app counts as being online too
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") recordHeartbeat(uid).catch(() => {});
    });

    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, [user]);
}
