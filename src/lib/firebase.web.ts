// Firebase setup when the app runs in a browser (npx expo start --web), used
// for quick testing on a computer. Metro picks this file instead of
// firebase.ts on web, because the browser keeps the login in its own storage.
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { connectEmulators, firebaseConfig } from "./firebaseConfig";

const isFirstLoad = getApps().length === 0;
export const app = isFirstLoad ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

if (isFirstLoad) connectEmulators(auth, db);
