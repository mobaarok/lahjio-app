// Builds a release APK on this computer for testers: npm run apk
// 1. Uses Android Studio's Java and the Android SDK (no environment variables needed)
// 2. Creates the android/ folder with `expo prebuild` if it is missing
// 3. Runs Gradle, then copies the APK to apk/lahjio-<version>.apk
// The APK is signed with the debug key: fine for testers, not for the Play Store.
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
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

// The newest CMake in the SDK. CMake 3.22's ninja (1.10) can't create folders
// with paths over 260 characters, which react-native-reanimated's C++ build needs
// (the project path appears twice in them). Newer ninja (1.12+) can.
function newestCmake() {
  const cmakeRoot = join(sdkDir, "cmake");
  if (!existsSync(cmakeRoot)) return null;
  const toNumbers = (v) => v.split(".").map(Number);
  const versions = readdirSync(cmakeRoot)
    .filter((v) => /^\d+\.\d+\.\d+$/.test(v))
    .sort((a, b) => {
      const [x, y] = [toNumbers(a), toNumbers(b)];
      return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
    });
  return versions.length ? join(cmakeRoot, versions.at(-1)) : null;
}

// Gradle reads backslashes as escape characters, so paths use forward slashes
const toGradlePath = (path) => path.replace(/\\/g, "/");
const cmakeDir = newestCmake();
writeFileSync(
  join(androidDir, "local.properties"),
  `sdk.dir=${toGradlePath(sdkDir)}\n` + (cmakeDir ? `cmake.dir=${toGradlePath(cmakeDir)}\n` : "")
);
console.log(`Using CMake: ${cmakeDir ?? "Gradle's default"}`);

// Most phones are arm64; older cheap phones are armeabi-v7a. Skipping the
// emulator-only x86 builds makes the APK smaller and the build faster.
// Full path: some shells don't look in the current folder for programs
run(`"${join(androidDir, "gradlew.bat")}"`, ["assembleRelease", '"-PreactNativeArchitectures=arm64-v8a,armeabi-v7a"'], androidDir);

const { version } = JSON.parse(readFileSync(join(root, "app.json"), "utf8")).expo;
const built = join(androidDir, "app", "build", "outputs", "apk", "release", "app-release.apk");
mkdirSync(join(root, "apk"), { recursive: true });
const target = join(root, "apk", `lahjio-${version}.apk`);
copyFileSync(built, target);
console.log(`\nAPK ready: ${target}`);
