// Builds a release APK on this computer for testers: npm run apk
// 1. Uses Android Studio's Java and the Android SDK (no environment variables needed)
// 2. Creates the android/ folder with `expo prebuild` if it is missing
// 3. Runs Gradle, then copies the APK to apk/lahjio-<version>.apk
// The APK is signed with the debug key: fine for testers, not for the Play Store.
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const root = process.cwd();
const androidDir = join(root, "android");
const localAppData = process.env.LOCALAPPDATA ?? join(homedir(), "AppData", "Local");

const javaHome =
  process.env.JAVA_HOME ?? "C:\\Program Files\\Android\\Android Studio\\jbr";
const sdkDir = process.env.ANDROID_HOME ?? join(localAppData, "Android", "Sdk");

for (const [name, path] of [["Java (Android Studio jbr)", join(javaHome, "bin", "java.exe")], ["Android SDK", sdkDir]]) {
  if (!existsSync(path)) {
    console.error(`${name} not found at ${path}. Install Android Studio, or set JAVA_HOME / ANDROID_HOME.`);
    process.exit(1);
  }
}

const env = { ...process.env, JAVA_HOME: javaHome, ANDROID_HOME: sdkDir, NODE_ENV: "production" };

function run(command, args, cwd) {
  console.log(`\n> ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, { cwd, env, stdio: "inherit", shell: true });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (!existsSync(androidDir)) run("npx", ["expo", "prebuild", "--platform", "android", "--no-install"], root);

// Gradle reads backslashes as escape characters, so the path uses forward slashes
writeFileSync(join(androidDir, "local.properties"), `sdk.dir=${sdkDir.replace(/\\/g, "/")}\n`);

// Most phones are arm64; older cheap phones are armeabi-v7a. Skipping the
// emulator-only x86 builds makes the APK smaller and the build faster.
run("gradlew.bat", ["assembleRelease", '"-PreactNativeArchitectures=arm64-v8a,armeabi-v7a"'], androidDir);

const { version } = JSON.parse(readFileSync(join(root, "app.json"), "utf8")).expo;
const built = join(androidDir, "app", "build", "outputs", "apk", "release", "app-release.apk");
mkdirSync(join(root, "apk"), { recursive: true });
const target = join(root, "apk", `lahjio-${version}.apk`);
copyFileSync(built, target);
console.log(`\nAPK ready: ${target}`);
