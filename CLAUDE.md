# Lahjio Android app

The Android app of Lahjio, which teaches Saudi Arabic to Bangla-speaking expats in
Saudi Arabia. It's the phone version of the website https://lahjio.app and uses the
**same Firebase project (`lahjio`)**, so a learner's account, XP, streak and progress
are the same in the app and on the website.

- Code: https://github.com/mobaarok/lahjio-app (branch `main`)
- Website code: https://github.com/mobaarok/lahjio, local folder `../lahjio-beta`.
  Its `CLAUDE.md` describes the product, the Firestore data and the roadmap; read it
  when you need that context. The admin dashboard stays on the website only.
- Read `AGENTS.md` too: Expo's own rules (check the versioned Expo docs, use
  `npx expo install`, never edit `android/` by hand).

## Status (2026-11-09)

First version built and tested in the browser against the local emulators:
welcome, email login/signup/password reset, home (streak, XP, goal, next lesson,
word of the day), courses, course, lesson (learn, quiz, results), word library,
flashcard practice (4 modes), quiz (guests can play), progress, account (language,
name, feedback, logout), privacy and terms.

**Not tested on a real phone yet.** The owner tests with Expo Go first.

Not done yet:
- **Google login.** Needs a development build with `@react-native-google-signin/google-signin`,
  an Android app in Firebase Console with the SHA-1 fingerprint. Email login works.
- App icon and splash are Expo's defaults. Needs Lahjio artwork.
- Urdu shows Urdu text but the layout stays left to right (`I18nManager.forceRTL`
  needs an app restart; decide later).
- No offline progress queue: content works offline after the first load, but
  answers made offline are only kept by Firestore's in-memory cache.
- Play Store: needs the $25 Google Play developer account (owner), app signing
  and a store listing.

## Stack

- Expo SDK 58, React Native 0.88, React 19, **TypeScript** (strict)
- Expo Router (file-based routes in `src/app/`)
- Firebase JS SDK (`firebase` 13): Auth with AsyncStorage persistence, Firestore.
  The JS SDK works in Expo Go; no `google-services.json` is needed for it.
- `expo-speech` reads Arabic aloud (ar-SA voice); `expo-audio` plays recordings
- Styling: `StyleSheet` with the colours in `src/constants/theme.ts` (the website's
  emerald/slate Tailwind palette)

## Commands

- `npm start`: dev server; scan the QR code with **Expo Go** on the phone
- `npm run android`: same, opening the Android emulator
- `npm run typecheck`, `npm run lint`, `npm run check:i18n`, `npm run doctor`.
  Run all four before saying work is done.
- `npx expo export --platform android`: bundles the app without a phone (a quick
  build check; delete `dist/` after)
- APK for testers: `npx eas-cli build -p android --profile preview` (cloud, free tier
  has limits) or `npx expo run:android --variant release` (local, uses Android Studio's SDK)

### Testing logged-in screens safely

Use the website project's local emulators, never the real database:

1. In `../lahjio-beta`: `npm run emulators` (background), then `npm run seed:emulators`
   (test accounts are listed in its `scripts/seed-emulators.mjs`). The seed has items
   but no courses; add a test course to the emulator if lessons need testing.
2. Here: the `.claude/launch.json` config `lahjio-app-web-emulators` runs the app in a
   browser on port 8091 with `EXPO_PUBLIC_USE_EMULATORS=true`.
3. On the Android emulator also set `EXPO_PUBLIC_EMULATOR_HOST=10.0.2.2` (a real phone:
   the computer's Wi-Fi IP).

## Config

`.env` (not in git) holds the Firebase web config as `EXPO_PUBLIC_FIREBASE_*`, copied
from the website's `.env`. `.env.example` lists the names. These values are public
identifiers built into the app; Firestore rules protect the data. EAS cloud builds
don't see `.env`, so add the same values as EAS environment variables before using them.

## How the code is organised

- `src/app/`: screens (Expo Router). `_layout.tsx` holds the providers and the stack;
  `Stack.Protected` shows learner screens only when logged in (`redirectTo="/welcome"`)
  and welcome/login/signup only when logged out. `(tabs)/` is the bottom tab bar:
  home (`index`), courses, words, practice, account. `quiz`, `privacy` and `terms`
  are open to guests.
- `src/components/`: `ui.tsx` (Button, Card, PressableCard, Field, Chip, Badge, Alert,
  ProgressBar, Loading, ErrorState, EmptyState, ArabicText), `Screen`, `QuizRunner`,
  `Flashcard`, `WordCard`, `ResultScreen`, `AudioButton`, `ChipRow`, `LanguageSwitcher`
- `src/context/`: providers with their hooks in the same file: `useAuth`, `useLocale`,
  `useContent`, `useProgress`
- `src/lib/`: logic without UI, ported from the website's `src/lib/`:
  `progress.ts` (spaced repetition, XP, streaks), `courses.ts`, `quiz.ts`, `content.ts`
  (cached in AsyncStorage by `meta/content.version`), `speak.ts`, `account.ts`
  (feedback, visit tracking), `format.ts`, `types.ts` (Firestore document shapes),
  `firebase.ts` (phone) and `firebase.web.ts` (browser testing)
- `src/i18n/`: `locales.ts` and `messages/{bn,en,hi,ur}.ts`, copied from the website.
  Keys under "Android app only" exist only here.

## Keeping the app and the website in step

They share Firestore, so they must agree on the data:

- Progress rules (`REVIEW_DAYS`, XP values, streak logic) and field names in
  `src/lib/progress.ts` must match the website's `src/lib/progress.js`. Change both together.
- When the website adds message keys the app needs, copy them into all four files here.
- Only published content reaches learners; queries must filter `status == "published"`.
- Never write `plan` on `users/{uid}` from the app (rules reject it; payments come
  from a server later).
- `useVisitTracker` waits for progress to load before writing `users/{uid}`; writing
  while it is read made Firestore return a profile without XP or streak.

## Conventions

- TypeScript strict, function components and hooks, `@/` imports for `src/`
- Never hard-code learner text: add a key to all four message files and use `t()`
- Show numbers with `num()`; meanings with `meaningOf()` / `pronunciationOf()`
- Don't call `Date.now()` or `Math.random()` while rendering (React Compiler lint);
  use `useNow()` or do it in event handlers
- Keep components small and commented. The owner is learning and wants code
  others can follow.

## Working with the owner

- They build step by step and test each step on their phone before moving on.
- Ask before pushing, publishing builds, or writing to the real Firestore database.
- Never sign in to the real Firebase project with the owner's credentials; test with
  the emulators. The owner does Firebase Console, Google Play and GitHub settings steps.
