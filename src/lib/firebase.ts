// Firebase setup for Android (and iOS). The app uses the same Firebase project
// ("lahjio") as the website, so learners see the same account, streak and
// progress on both. firebase.web.ts is the version used in a browser.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth, type Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { connectEmulators, firebaseConfig } from "./firebaseConfig";

// Fast Refresh can load this file twice; reuse the app instead of crashing
const isFirstLoad = getApps().length === 0;
export const app = isFirstLoad ? initializeApp(firebaseConfig) : getApp();

// AsyncStorage keeps the learner logged in after the app is closed
function createAuth(): Auth {
  if (!isFirstLoad) return getAuth(app);
  return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
}

export const auth = createAuth();
export const db = getFirestore(app);

if (isFirstLoad) connectEmulators(auth, db);
