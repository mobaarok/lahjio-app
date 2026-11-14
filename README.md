# Lahjio for Android

Learn Saudi Arabic in your own language: the Android app of [lahjio.com](https://lahjio.com),
built with Expo (React Native) and TypeScript. It shares the website's Firebase project,
so progress is the same on both.

## Screenshots

Version 1, in Bangla (the app is also in English, Hindi and Urdu).

<table>
  <tr>
    <td align="center"><img src="docs/screenshots/01-welcome.png" width="200" alt="Welcome screen"><br>Welcome</td>
    <td align="center"><img src="docs/screenshots/02-home.png" width="200" alt="Home with streak, XP, daily goal and next lesson"><br>Home</td>
    <td align="center"><img src="docs/screenshots/03-courses.png" width="200" alt="List of courses with progress"><br>Courses</td>
  </tr>
  <tr>
    <td align="center"><img src="docs/screenshots/04-course.png" width="200" alt="A course with finished, open and locked lessons"><br>Course</td>
    <td align="center"><img src="docs/screenshots/05-lesson.png" width="200" alt="Learning a phrase in a lesson, with audio and a tip"><br>Lesson</td>
    <td align="center"><img src="docs/screenshots/06-quiz.png" width="200" alt="Listening quiz question"><br>Quiz</td>
  </tr>
  <tr>
    <td align="center"><img src="docs/screenshots/07-practice.png" width="200" alt="Practice modes: review, new, hard and all words"><br>Practice</td>
    <td align="center"><img src="docs/screenshots/08-flashcard.png" width="200" alt="Flashcard showing the meaning"><br>Flashcard</td>
    <td align="center"><img src="docs/screenshots/09-words.png" width="200" alt="Word library with search and topic filters"><br>Word library</td>
  </tr>
  <tr>
    <td align="center"><img src="docs/screenshots/10-progress.png" width="200" alt="Progress: XP, streak, daily goal and word mastery"><br>Progress</td>
    <td></td>
    <td></td>
  </tr>
</table>

## Run it on your phone

1. Install **Expo Go** from the Play Store.
2. Copy `.env.example` to `.env` and fill in the Firebase web config (same values as the website).
3. Install and start:

   ```bash
   npm install
   npm start
   ```

4. Scan the QR code with Expo Go. Phone and computer must be on the same Wi-Fi
   (or use `npm run start:tunnel`).

## Build an APK

```bash
npm run apk
```

The APK is saved to `apk/lahjio-<version>.apk`. See `CLAUDE.md` for details.

## Checks

```bash
npm run typecheck
npm run lint
npm run check:i18n
npm run doctor
```

See `CLAUDE.md` for how the code is organised and how to test with the local Firebase emulators.
