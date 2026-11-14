// "Continue with Google" in the browser build, used for testing on a computer.
// Uses Firebase's popup, the same way the website does. Metro picks this file
// instead of googleSignIn.ts on web.
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./firebase";

export const googleSignInAvailable = true;

// Returns false if the learner closed the popup
export async function signInWithGoogle(): Promise<boolean> {
  try {
    await signInWithPopup(auth, new GoogleAuthProvider());
    return true;
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return false;
    throw error;
  }
}

// Firebase's signOut() is enough in the browser
export async function signOutOfGoogle(): Promise<void> {}
