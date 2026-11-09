// The logged-in learner's progress, loaded once and shared with every screen.
// Changes show on screen right away and are saved to Firestore in the background.
// error holds a message key for useLocale().t().
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { MessageKey } from "@/i18n/messages";
import {
  loadProgress,
  nextEntry,
  nextProfile,
  saveAnswer,
  saveDailyGoal,
  saveLessonResult,
  XP_CORRECT,
  XP_LESSON,
  XP_WRONG,
  type LoadedProgress,
} from "@/lib/progress";
import { useAuth } from "./AuthContext";

interface ProgressValue extends LoadedProgress {
  loading: boolean;
  error: MessageKey | null;
  clearError: () => void;
  recordAnswer: (itemId: string, correct: boolean) => Promise<void>;
  completeLesson: (courseId: string, lessonId: string, score: number) => Promise<void>;
  setDailyGoal: (goal: number) => Promise<void>;
}

const emptyProgress: LoadedProgress = { progress: {}, lessonProgress: {}, profile: null };

const ProgressContext = createContext<ProgressValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [data, setData] = useState<LoadedProgress & { uid: string | null }>({
    uid: null,
    ...emptyProgress,
  });
  const [error, setError] = useState<MessageKey | null>(null);

  useEffect(() => {
    if (!user) return; // logged out: nothing to load
    let ignore = false;

    loadProgress(user.uid)
      .then((loaded) => {
        if (!ignore) setData({ uid: user.uid, ...loaded });
      })
      .catch(() => {
        if (ignore) return;
        setData({ uid: user.uid, ...emptyProgress });
        setError("error.progressLoad");
      });

    return () => {
      ignore = true;
    };
  }, [user]);

  // Only use the data if it belongs to the user who is logged in now
  const ready = Boolean(user) && data.uid === user?.uid;
  const current = ready ? data : emptyProgress;

  async function recordAnswer(itemId: string, correct: boolean) {
    if (!ready || !user) return; // guests can play, but nothing is saved
    const now = Date.now();
    const entry = nextEntry(data.progress[itemId], correct, now);
    const xpGained = correct ? XP_CORRECT : XP_WRONG;
    const newProfile = nextProfile(data.profile, { answers: 1, xp: xpGained }, now);

    setData((prev) => ({
      ...prev,
      progress: { ...prev.progress, [itemId]: entry },
      profile: { ...prev.profile, ...newProfile },
    }));

    try {
      await saveAnswer(user.uid, itemId, entry, data.profile, newProfile, xpGained);
    } catch {
      setError("error.progressSave");
    }
  }

  async function completeLesson(courseId: string, lessonId: string, score: number) {
    if (!ready || !user) return;
    const bestScore = Math.max(data.lessonProgress[lessonId]?.best_score ?? 0, score);
    const newProfile = nextProfile(data.profile, { xp: XP_LESSON }, Date.now());

    setData((prev) => ({
      ...prev,
      lessonProgress: {
        ...prev.lessonProgress,
        [lessonId]: { course_id: courseId, status: "completed", best_score: bestScore },
      },
      profile: { ...prev.profile, ...newProfile },
    }));

    try {
      await saveLessonResult(user.uid, courseId, lessonId, bestScore, data.profile, newProfile, XP_LESSON);
    } catch {
      setError("error.lessonSave");
    }
  }

  async function setDailyGoal(goal: number) {
    if (!ready || !user) return;
    setData((prev) => ({ ...prev, profile: { ...prev.profile, daily_goal: goal } }));
    try {
      await saveDailyGoal(user.uid, goal);
    } catch {
      setError("error.goalSave");
    }
  }

  const value: ProgressValue = {
    loading: Boolean(user) && !ready,
    error,
    clearError: () => setError(null),
    progress: current.progress,
    lessonProgress: current.lessonProgress,
    profile: current.profile,
    recordAnswer,
    completeLesson,
    setDailyGoal,
  };

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressValue {
  const context = useContext(ProgressContext);
  if (!context) throw new Error("useProgress must be used inside <ProgressProvider>");
  return context;
}
