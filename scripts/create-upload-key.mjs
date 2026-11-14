// Creates the upload key that signs Play Store builds: npm run upload-key
// Run it once, in your own terminal: Java's keytool asks you for a password
// and your name. The key is saved as keys/lahjio-upload.jks (never in git).
// See keys/README.md for what to do next and how to keep the key safe.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const javaHome = process.env.JAVA_HOME ?? "C:\\Program Files\\Android\\Android Studio\\jbr";
const keytool = join(javaHome, "bin", "keytool.exe");
const keyFile = join(process.cwd(), "keys", "lahjio-upload.jks");

if (!existsSync(keytool)) {
  console.error(`keytool not found at ${keytool}. Install Android Studio, or set JAVA_HOME.`);
  process.exit(1);
}
// Never overwrite: a lost or replaced upload key means asking Google for a reset
if (existsSync(keyFile)) {
  console.error(`${keyFile} already exists. Keep using it; don't make a new one.`);
  process.exit(1);
}

// RSA 2048, valid for about 27 years (Google asks for at least 25)
const args = ["-genkeypair", "-v", "-storetype", "PKCS12", "-keystore", keyFile, "-alias", "upload",
  "-keyalg", "RSA", "-keysize", "2048", "-validity", "10000"];
const result = spawnSync(keytool, args, { stdio: "inherit" });
if (result.status !== 0) process.exit(result.status ?? 1);

console.log(`\nUpload key saved: ${keyFile}`);
console.log("Next: write the password into keys/upload-key.properties and back up both files (keys/README.md).");
