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

## Status (2026-11-10)

First version built and tested in the browser against the local emulators:
welcome, email login/signup/password reset, home (streak, XP, goal, next lesson,
word of the day), courses, course, lesson (learn, quiz, results), word library,
flashcard practice (4 modes), quiz (guests can play), progress, account (language,
name, feedback, logout), privacy and terms.

- 2026-11-09: the owner opened the app on their phone with Expo Go (it loads).
  Their feedback on each screen hasn't come in yet.
- 2026-11-10: first APK built with `npm run apk`: `apk/lahjio-1.0.0.apk` (49 MB,
  Android 7.0+, signed with the debug key). Not yet installed and tested on the phone.

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
- `npm run start:tunnel`: the same through an internet tunnel (`@expo/ngrok`), for
  when the phone can't reach the computer directly. Slower and uses mobile data.
- `npm run android`: dev server that opens the Android emulator
- `npm run android:build`: builds and installs a native debug app on a plugged-in phone
  or emulator (needed later for Google login)
- `npm run apk`: release APK for testers (see "Building an APK")
- `npm run typecheck`, `npm run lint`, `npm run check:i18n`, `npm run doctor`.
  Run all four before saying work is done.
- `npx expo export --platform android`: bundles the app without a phone (a quick
  build check; delete `dist/` after)

### Testing on the owner's phone (Expo Go)

The owner's laptop gets internet from their phone's hotspot, so phone and laptop are
on the same network, with the phone as the hotspot. Expo Go only connected after the owner:

1. Set the hotspot Wi-Fi to **Private** in Windows network settings
2. Allowed `C:\Program Files\nodejs\node.exe` through Windows Firewall on Private networks
3. Started the server with the laptop's Wi-Fi address in the QR code, because Expo
   otherwise picks the laptop's own hotspot adapter (192.168.137.1):
   `$env:REACT_NATIVE_PACKAGER_HOSTNAME="10.142.82.91"; npm start` (PowerShell).
   The address can change; check it with `Get-NetIPAddress -InterfaceAlias Wi-Fi`.

A quick check: with the server running, `http://<address>:8081` should load in the
phone's browser. The error "java.io.IOException: Failed to download remote update"
in Expo Go means the phone can't reach the server.

### Building an APK

`npm run apk` (`scripts/build-apk.mjs`) builds on this laptop for free:

- Uses Android Studio's Java (`C:\Program Files\Android\Android Studio\jbr`, Java 21)
  and the SDK in `%LOCALAPPDATA%\Android\Sdk`. JAVA_HOME and ANDROID_HOME are not set
  in Windows, so the script sets them for the build.
- Creates `android/` with `expo prebuild` if it's missing (`android/` is generated and
  not in git; after changing `app.json` or adding a native package, delete it, or run
  `npx expo prebuild --clean`).
- Writes `android/local.properties` with forward slashes. Backslashes made Gradle fail with
  "The filename, directory name, or volume label syntax is incorrect".
- Also sets `cmake.dir` to the newest CMake in the SDK (4.1.2). With Gradle's default
  CMake 3.22.1, its ninja 1.10 failed in `react-native-reanimated` (pulled in by Expo
  Router) with `ninja: error: mkdir(...): No such file or directory`: the C++ object
  folders contain the project path twice and pass Windows' 260-character limit. Ninja
  1.12 handles long paths. If a C++ build fails after switching CMake, delete the
  `node_modules/*/android/.cxx` folders and build again.
- Runs `gradlew.bat` by its full path; some shells don't look in the current folder.
- Builds only arm64-v8a and armeabi-v7a (real phones), then copies the APK to
  `apk/lahjio-<version>.apk` (ignored by git). Gradle's own output is
  `android/app/build/outputs/apk/release/app-release.apk`.
- The APK is signed with the **debug key**: fine to install and share with testers,
  not for the Play Store (that needs an upload key, made when publishing).
- A full build takes about 20 to 25 minutes on this laptop. The first one also downloads
  Gradle and about 2 GB of libraries; on the hotspot that once failed with "Got socket exception" while downloading
  `react-android-0.88.1-release.aar`. Downloaded files stay cached in `%USERPROFILE%\.gradle`,
  so just run it again. Gradle installed the NDK 27.1 and SDK platform 37 it needed by itself.
- Cloud option: `npx eas-cli build -p android --profile preview` (needs an Expo account
  and the `.env` values added as EAS environment variables; free tier has limits).

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

## Laptop setup (checked 2026-11-10)

Everything needed to build is installed: Node 24, Git, Android Studio with Java 21,
SDK platforms 33/36/37, build-tools 35 to 37, NDK 27.1 to 30, CMake 3.22 and 4.1,
platform-tools (adb), licenses accepted, Windows long paths on, about 35 GB free.
`java` and `adb` are not on PATH, which is fine because the scripts don't need them.

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

## Expo Router notes

- Logged-out learners must land on `/welcome`: `Stack.Protected` needs `redirectTo`.
  Without it Expo Router sent them to a group with no index ("page not found") or to `/quiz`.
- Auth screens live at the app root, not in an `(auth)` group, for the same reason.
- `useAnimatedValue` doesn't exist in react-native-web; `Flashcard` uses
  `useState(() => new Animated.Value(...))` so the browser test still works.

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
