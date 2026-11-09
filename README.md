# Lahjio for Android

Learn Saudi Arabic in your own language: the Android app of [lahjio.app](https://lahjio.app),
built with Expo (React Native) and TypeScript. It shares the website's Firebase project,
so progress is the same on both.

## Run it on your phone

1. Install **Expo Go** from the Play Store.
2. Copy `.env.example` to `.env` and fill in the Firebase web config (same values as the website).
3. Install and start:

   ```bash
   npm install
   npm start
   ```

4. Scan the QR code with Expo Go. Phone and computer must be on the same Wi-Fi.

## Checks

```bash
npm run typecheck
npm run lint
npm run check:i18n
npm run doctor
```

See `CLAUDE.md` for how the code is organised and how to test with the local Firebase emulators.
