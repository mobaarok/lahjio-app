// The "firebase/auth" package ships its React Native build (which has
// getReactNativePersistence) without matching TypeScript types, so the editor
// can't see the function even though it exists at runtime. This adds the type.
import type { Persistence, ReactNativeAsyncStorage } from "firebase/auth";

declare module "firebase/auth" {
  export function getReactNativePersistence(storage: ReactNativeAsyncStorage): Persistence;
}
