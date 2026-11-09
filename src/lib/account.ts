// Account actions and usage notes for Admin > Analytics on the website.
// Same documents the website writes (see lahjio/src/lib/activity.js).
import type { User } from "firebase/auth";
import { addDoc, collection, doc, serverTimestamp, setDoc, Timestamp } from "firebase/firestore";
import { db } from "./firebase";
import { dayKey } from "./format";

export function sendFeedback(user: User, message: string) {
  return addDoc(collection(db, "feedback"), {
    uid: user.uid,
    email: user.email ?? "",
    message: message.trim(),
    source: "android",
    created_at: serverTimestamp(),
  });
}

// The phone's time zone, e.g. "Asia/Riyadh". Shown as a country in the admin.
function timeZone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
  } catch {
    return null;
  }
}

function markActiveToday(uid: string) {
  const day = dayKey();
  return setDoc(doc(db, "activity", `${uid}_${day}`), { uid, day });
}

// Called when a logged-in learner opens the app (and when they change language)
export async function recordVisit(user: User, locale: string): Promise<void> {
  const signedUp = Date.parse(user.metadata?.creationTime ?? "");

  await Promise.all([
    setDoc(
      doc(db, "users", user.uid),
      {
        name: user.displayName ?? null,
        email: user.email ?? null,
        locale,
        time_zone: timeZone(),
        last_seen_at: serverTimestamp(),
        ...(Number.isNaN(signedUp) ? {} : { signed_up_at: Timestamp.fromMillis(signedUp) }),
      },
      { merge: true }
    ),
    markActiveToday(user.uid),
  ]);
}

// Called every few minutes while the app is on screen, for "online now"
export async function recordHeartbeat(uid: string): Promise<void> {
  await Promise.all([
    setDoc(doc(db, "users", uid), { last_seen_at: serverTimestamp() }, { merge: true }),
    markActiveToday(uid),
  ]);
}
