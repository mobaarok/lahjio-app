// Checks that every text key used in the code exists in every language file,
// and that the language files have the same keys. Run: npm run check:i18n
// (Node 22.18+ reads the .ts message files directly.)
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import bn from "../src/i18n/messages/bn.ts";
import en from "../src/i18n/messages/en.ts";
import hi from "../src/i18n/messages/hi.ts";
import ur from "../src/i18n/messages/ur.ts";

const languages = { bn, en, hi, ur };

// Keys built from variables in the code, e.g. t(`level.${course.level}`)
const dynamicKeys = [
  ...["ar-bn", "bn-ar", "listen"].map((k) => `quiz.prompt.${k}`),
  ...["all", "word", "phrase"].map((k) => `type.${k}`),
  ...["beginner", "intermediate", "advanced"].map((k) => `level.${k}`),
  ...["word", "phrase", "topic", "mixed", "reading"].map((k) => `courseType.${k}`),
  ...["due", "new", "hard", "all"].flatMap((k) => [`practice.mode.${k}`, `practice.mode.${k}Text`]),
];

function sourceFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === "i18n" ? [] : sourceFiles(path);
    return /\.tsx?$/.test(name) ? [path] : [];
  });
}

// Static keys: t("x.y"), key: "nav.home", and quoted "group.key" strings in typed spots
const usedKeys = new Set(dynamicKeys);
const patterns = [
  /\bt\(\s*"([\w.-]+)"/g,
  /key:\s*"([\w.-]+)"/g,
  /"((?:auth|error|privacy|terms)\.\w+)"/g,
];
for (const file of sourceFiles("src")) {
  const text = readFileSync(file, "utf8");
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) usedKeys.add(match[1]);
  }
}

let problems = 0;
for (const [code, messages] of Object.entries(languages)) {
  const missing = [...usedKeys].filter((key) => !(key in messages));
  if (missing.length) {
    problems += missing.length;
    console.log(`${code}: missing ${missing.length} keys:\n  ${missing.join("\n  ")}`);
  }
}
// Every language must have exactly the same keys as English
const onlyIn = (a, b) => Object.keys(a).filter((key) => !(key in b));
for (const [code, messages] of Object.entries(languages)) {
  if (code === "en") continue;
  for (const [name, keys] of [[`${code} only`, onlyIn(messages, en)], [`missing in ${code}`, onlyIn(en, messages)]]) {
    if (keys.length) {
      problems += keys.length;
      console.log(`${name}: ${keys.join(", ")}`);
    }
  }
}

console.log(problems ? `${problems} problems found.` : `All ${usedKeys.size} keys are translated in ${Object.keys(languages).join(", ")}.`);
process.exit(problems ? 1 : 0);
