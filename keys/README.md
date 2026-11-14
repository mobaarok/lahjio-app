# Upload key (Google Play)

Play Store builds (`npm run aab`) are signed with your **upload key**. Google then
re-signs the app for users with its own app signing key (Play App Signing).
Everything in this folder except this README stays out of git.

## Create it once

1. In a terminal in the project folder, run `npm.cmd run upload-key`.
2. `keytool` asks for a **password** (twice) and for your name, organisation, city
   and country. Use a strong password and write it down somewhere safe.
   It creates `keys/lahjio-upload.jks`.
3. Create `keys/upload-key.properties` with this content, using your password:

   ```
   storeFile=lahjio-upload.jks
   keyAlias=upload
   storePassword=YOUR_PASSWORD
   ```

4. **Back up both files** (`lahjio-upload.jks` and `upload-key.properties`), for
   example to Google Drive and a USB stick. If you lose the key, Google can reset
   it, but that takes days and needs Play Console support.

## Build for Google Play

1. Raise `expo.android.versionCode` in `app.json` by 1 for every upload
   (Play rejects a number it has seen before).
2. `npm.cmd run aab` builds `apk/lahjio-<version>-<versionCode>.aab`.
3. Upload that file in Play Console.

## Google login

After the first upload, copy the two SHA-1 fingerprints from **Play Console > Test
and release > App integrity > App signing** (app signing key and upload key) and add
both in **Firebase > Project settings > Lahjio Android > Add fingerprint**.
Without them, Google login fails in the Play Store version.
