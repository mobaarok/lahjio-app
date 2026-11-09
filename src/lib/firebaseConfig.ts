// Firebase settings shared by the phone (firebase.ts) and web (firebase.web.ts) setups.
// Values come from .env. EXPO_PUBLIC_* values are built into the app; they are
// public identifiers, not secrets (Firestore rules protect the data).
import type { Auth } from "firebase/auth";
import { connectAuthEmulator } from "firebase/auth";
import { connectFirestoreEmulator, type Firestore } from "firebase/firestore";

// Local testing: EXPO_PUBLIC_USE_EMULATORS=true uses the fake Firebase that
// the website project runs on this computer (npm run emulators in lahjio-beta),
// so tests never touch real users or data.
export const useEmulators = process.env.EXPO_PUBLIC_USE_EMULATORS === "true";

// The Android emulator reaches the computer at 10.0.2.2; a real phone needs
// the computer's Wi-Fi address. Set EXPO_PUBLIC_EMULATOR_HOST for those.
const emulatorHost = process.env.EXPO_PUBLIC_EMULATOR_HOST || "127.0.0.1";

export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: useEmulators ? "demo-lahjio" : process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export function connectEmulators(auth: Auth, db: Firestore): void {
  if (!useEmulators) return;
  connectAuthEmulator(auth, `http://${emulatorHost}:9099`, { disableWarnings: true });
  connectFirestoreEmulator(db, emulatorHost, 8080);
}
