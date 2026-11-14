// Builds the Android app on this computer.
//   npm run apk -> apk/lahjio-<version>.apk for testers, signed with the debug key
//   npm run aab -> apk/lahjio-<version>-<versionCode>.aab for Google Play,
//                  signed with your upload key (see keys/README.md)
// 1. Uses Android Studio's Java and the Android SDK (no environment variables needed)
// 2. Creates the android/ folder with `expo prebuild` if it is missing
// 3. Runs Gradle, then copies the result to apk/
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const root = process.cwd();
const forPlayStore = process.argv.includes("--aab");
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

// The Play Store build is signed with the upload key. Its password is read from
// keys/upload-key.properties (never in git) and handed to Gradle through
// environment variables, so it doesn't show up in the build log.
if (forPlayStore) {
  const keysDir = join(root, "keys");
  const propsFile = join(keysDir, "upload-key.properties");
  if (!existsSync(propsFile)) {
    console.error(`Missing ${propsFile}. Create the upload key first: see keys/README.md`);
    process.exit(1);
  }
  const props = {};
  for (const line of readFileSync(propsFile, "utf8").split(/\r?\n/)) {
    const at = line.indexOf("=");
    if (at > 0 && !line.trim().startsWith("#")) props[line.slice(0, at).trim()] = line.slice(at + 1).trim();
  }
  const storeFile = join(keysDir, props.storeFile ?? "lahjio-upload.jks");
  if (!existsSync(storeFile) || !props.storePassword) {
    console.error(`The upload key or its password is missing (${storeFile}). See keys/README.md`);
    process.exit(1);
  }
  const signing = {
    "store.file": storeFile.replace(/\\/g, "/"),
    "store.password": props.storePassword,
    "key.alias": props.keyAlias ?? "upload",
    // A PKCS12 key store (keytool's default) uses one password for both
    "key.password": props.keyPassword ?? props.storePassword,
  };
  for (const [name, value] of Object.entries(signing)) {
    env[`ORG_GRADLE_PROJECT_android.injected.signing.${name}`] = value;
  }
}

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
const task = forPlayStore ? "bundleRelease" : "assembleRelease";
run(`"${join(androidDir, "gradlew.bat")}"`, [task, '"-PreactNativeArchitectures=arm64-v8a,armeabi-v7a"'], androidDir);

const { version, android } = JSON.parse(readFileSync(join(root, "app.json"), "utf8")).expo;
const outputs = join(androidDir, "app", "build", "outputs");
mkdirSync(join(root, "apk"), { recursive: true });
if (forPlayStore) {
  // Google Play needs a higher versionCode (app.json) for every upload
  const target = join(root, "apk", `lahjio-${version}-${android.versionCode}.aab`);
  copyFileSync(join(outputs, "bundle", "release", "app-release.aab"), target);
  console.log(`\nAAB ready for Google Play: ${target}`);
} else {
  const target = join(root, "apk", `lahjio-${version}.apk`);
  copyFileSync(join(outputs, "apk", "release", "app-release.apk"), target);
  console.log(`\nAPK ready: ${target}`);
}
