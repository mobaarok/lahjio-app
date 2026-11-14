// "Continue with Google" on Android (and iOS). googleSignIn.web.ts is the
// browser version.
//
// How it works: Google's own account picker gives us an ID token, and Firebase
// signs in with it, so the learner gets the same Firebase account as on the
// website. Needs a development build or APK: Expo Go doesn't contain the
// native Google Sign-In code, so the button is hidden there.
import { isRunningInExpoGo } from "expo";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "./firebase";

// The "Web client ID" from Firebase Console > Authentication > Google.
// Firebase only accepts tokens made for this client, even on Android.
const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

export const googleSignInAvailable = !isRunningInExpoGo() && Boolean(webClientId);

// The library is loaded only when it's used: importing it in Expo Go would
// crash the app, because its native part is missing there.
async function loadGoogleSignIn() {
  const lib = await import("@react-native-google-signin/google-signin");
  lib.GoogleSignin.configure({ webClientId });
  return lib;
}

// Throws an error with a Firebase-style code, so authErrorKey() can translate it
function fail(code: string): never {
  throw Object.assign(new Error(code), { code });
}

// Opens Google's account picker and turns the answer into a Firebase
// credential. Returns null if the learner closed the picker.
async function pickGoogleAccount() {
  const { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } = await loadGoogleSignIn();

  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) return null;

    const { idToken } = response.data;
    if (!idToken) fail("auth/google-no-token");
    return GoogleAuthProvider.credential(idToken);
  } catch (error) {
    if (!isErrorWithCode(error)) throw error;
    if (error.code === statusCodes.SIGN_IN_CANCELLED) return null;
    if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) fail("auth/google-play-services");
    // Code "10" (DEVELOPER_ERROR) means Firebase doesn't know this app's
    // SHA-1 fingerprint, or the package name doesn't match
    console.warn("Google sign-in failed:", error.code, error.message);
    throw error;
  }
}

// Returns false if the learner closed the account picker
export async function signInWithGoogle(): Promise<boolean> {
  const credential = await pickGoogleAccount();
  if (!credential) return false;
  await signInWithCredential(auth, credential);
  return true;
}

// Called on logout, so the next login shows the account picker again
// instead of reusing the last Google account
export async function signOutOfGoogle(): Promise<void> {
  if (!googleSignInAvailable) return;
  try {
    const { GoogleSignin } = await loadGoogleSignIn();
    await GoogleSignin.signOut();
  } catch {
    // Not signed in with Google: nothing to do
  }
}
