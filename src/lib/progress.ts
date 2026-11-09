// Learner progress: spaced repetition, XP, streaks and the daily goal.
// Same rules and same Firestore fields as the website's lib/progress.js, so
// progress made in the app shows on the website and the other way round.
import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  serverTimestamp,
  setDoc,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { dayKey } from "./format";
import type { LessonProgressMap, Profile, ProgressEntry, ProgressMap } from "./types";

const MINUTE = 60 * 1000;
export const DAY = 24 * 60 * MINUTE;

// Days until the next review for each box. A correct answer moves a word up
// one box; a wrong answer sends it back to box 0.
const REVIEW_DAYS = [0, 1, 3, 7, 14, 30];

export const XP_CORRECT = 10;
export const XP_WRONG = 2;
export const XP_LESSON = 50;
export const DEFAULT_DAILY_GOAL = 20; // answers per day

export interface LoadedProgress {
  progress: ProgressMap;
  lessonProgress: LessonProgressMap;
  profile: Profile | null;
}

function toMillis(value: unknown): number | null {
  return value instanceof Timestamp ? value.toMillis() : null;
}

export async function loadProgress(uid: string): Promise<LoadedProgress> {
  const [progress, lessons, profile] = await Promise.all([
    getDocs(collection(db, "users", uid, "progress")),
    getDocs(collection(db, "users", uid, "lesson_progress")),
    getDoc(doc(db, "users", uid)),
  ]);

  const progressMap: ProgressMap = {};
  progress.forEach((d) => {
    const data = d.data();
    progressMap[d.id] = {
      known: data.known === true,
      box: data.box ?? (data.known ? 1 : 0), // older entries have no box
      times_correct: data.times_correct ?? 0,
      times_wrong: data.times_wrong ?? 0,
      next_review_at: toMillis(data.next_review_at),
    };
  });

  const lessonMap: LessonProgressMap = {};
  lessons.forEach((d) => {
    const data = d.data();
    lessonMap[d.id] = {
      course_id: data.course_id,
      status: data.status,
      best_score: data.best_score ?? 0,
    };
  });

  return {
    progress: progressMap,
    lessonProgress: lessonMap,
    profile: profile.exists() ? (profile.data() as Profile) : null,
  };
}

export function isDue(entry: ProgressEntry | undefined, now: number): boolean {
  return Boolean(entry) && (entry?.next_review_at ?? 0) <= now;
}

export function nextEntry(entry: ProgressEntry | undefined, correct: boolean, now: number): ProgressEntry {
  const box = correct ? Math.min((entry?.box ?? 0) + 1, REVIEW_DAYS.length - 1) : 0;
  return {
    known: correct,
    box,
    times_correct: (entry?.times_correct ?? 0) + (correct ? 1 : 0),
    times_wrong: (entry?.times_wrong ?? 0) + (correct ? 0 : 1),
    // Wrong answers come back after 10 minutes
    next_review_at: now + (correct ? REVIEW_DAYS[box] * DAY : 10 * MINUTE),
  };
}

// Streak grows when you learn on consecutive days, and resets after a missed day
export function nextProfile(
  profile: Profile | null,
  { answers = 0, xp = 0 }: { answers?: number; xp?: number },
  now: number
): Required<Profile> {
  const today = dayKey(new Date(now));
  const yesterday = dayKey(new Date(now - DAY));
  const last = profile?.last_active_date;
  const streak =
    last === today
      ? (profile?.current_streak ?? 1)
      : last === yesterday
        ? (profile?.current_streak ?? 0) + 1
        : 1;

  return {
    current_streak: streak,
    longest_streak: Math.max(profile?.longest_streak ?? 0, streak),
    last_active_date: today,
    today_key: today,
    today_count: (profile?.today_key === today ? (profile?.today_count ?? 0) : 0) + answers,
    xp: (profile?.xp ?? 0) + xp,
    daily_goal: profile?.daily_goal ?? DEFAULT_DAILY_GOAL,
  };
}

// Answers done today, which resets to 0 on a new day
export function todayCount(profile: Profile | null, now: number): number {
  return profile?.today_key === dayKey(new Date(now)) ? (profile?.today_count ?? 0) : 0;
}

// Streak to show: a streak is lost once a whole day is missed
export function liveStreak(profile: Profile | null, now: number): number {
  const last = profile?.last_active_date;
  if (last === dayKey(new Date(now)) || last === dayKey(new Date(now - DAY))) {
    return profile?.current_streak ?? 0;
  }
  return 0;
}

// Fields saved on users/{uid}. XP uses increment() so the app and the website
// open at the same time can't overwrite each other's points.
function profileWrite(oldProfile: Profile | null, newProfile: Profile, xpGained: number) {
  return {
    ...newProfile,
    xp: increment(xpGained),
    last_active_at: serverTimestamp(),
    ...(oldProfile ? {} : { created_at: serverTimestamp() }),
  };
}

export async function saveAnswer(
  uid: string,
  itemId: string,
  entry: ProgressEntry,
  oldProfile: Profile | null,
  newProfile: Profile,
  xpGained: number
): Promise<void> {
  // A batch saves both documents together, or neither
  const batch = writeBatch(db);
  batch.set(
    doc(db, "users", uid, "progress", String(itemId)),
    {
      known: entry.known,
      box: entry.box,
      times_correct: entry.times_correct,
      times_wrong: entry.times_wrong,
      next_review_at: Timestamp.fromMillis(entry.next_review_at ?? Date.now()),
      last_seen_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    },
    { merge: true }
  );
  batch.set(doc(db, "users", uid), profileWrite(oldProfile, newProfile, xpGained), { merge: true });
  await batch.commit();
}

export async function saveLessonResult(
  uid: string,
  courseId: string,
  lessonId: string,
  bestScore: number,
  oldProfile: Profile | null,
  newProfile: Profile,
  xpGained: number
): Promise<void> {
  const batch = writeBatch(db);
  batch.set(
    doc(db, "users", uid, "lesson_progress", lessonId),
    {
      course_id: courseId,
      status: "completed",
      best_score: bestScore,
      completed_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    },
    { merge: true }
  );
  batch.set(doc(db, "users", uid), profileWrite(oldProfile, newProfile, xpGained), { merge: true });
  await batch.commit();
}

export function saveDailyGoal(uid: string, goal: number): Promise<void> {
  return setDoc(doc(db, "users", uid), { daily_goal: goal }, { merge: true });
}
