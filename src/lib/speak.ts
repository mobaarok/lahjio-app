// Audio: plays a word's own recording, or reads it aloud with the phone's
// text-to-speech voice (Arabic, Saudi if the phone has it).
//
// Items store the recording in Firestore's "audio" field, usually as a path on
// the website, e.g. "audio/s7-d1-01.mp3" -> https://lahjio.app/audio/s7-d1-01.mp3.
// A full link ("https://...") is used as it is.
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";
import * as Speech from "expo-speech";
import type { Item } from "./types";

const SITE_URL = "https://lahjio.app";

// If a recording hasn't started within this time (bad link, slow or no
// internet), the phone's voice reads the word instead
const LOAD_TIMEOUT_MS = 4000;

let player: AudioPlayer | null = null; // the recording playing now, if any
let cancelFallback: (() => void) | null = null; // stops the pending fallback check
let arabicVoice: Promise<string | null> | null = null;
let audioModeSet = false;

export function audioUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path.replace(/^http:\/\//i, "https://");
  return `${SITE_URL}/${path.replace(/^\/+/, "")}`;
}

// Finds an Arabic voice once per app start: Saudi (ar-SA) first, else any Arabic
function findArabicVoice(): Promise<string | null> {
  arabicVoice ??= Speech.getAvailableVoicesAsync()
    .then((voices) => {
      const arabic = voices.filter((v) => v.language.toLowerCase().startsWith("ar"));
      const saudi = arabic.find((v) => v.language.toLowerCase().replace("_", "-").endsWith("sa"));
      return (saudi ?? arabic[0])?.identifier ?? null;
    })
    .catch(() => null);
  return arabicVoice;
}

// Lets recordings play even when an iPhone's silent switch is on (Android ignores it)
function ensureAudioMode(): void {
  if (audioModeSet) return;
  audioModeSet = true;
  setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
}

export function stopAudio(): void {
  cancelFallback?.();
  cancelFallback = null;
  if (player) {
    player.pause();
    player.remove(); // frees the native player
    player = null;
  }
  Speech.stop();
}

// Plays a word: its recording if it has one, else the phone's voice
export function playWord(item: Pick<Item, "arabic" | "audio">): void {
  stopAudio();

  if (item.audio) {
    playRecording(audioUrl(item.audio), item.arabic);
    return;
  }
  speakArabic(item.arabic);
}

function playRecording(url: string, fallbackText: string): void {
  ensureAudioMode();

  let current: AudioPlayer;
  try {
    current = createAudioPlayer(url);
  } catch {
    speakArabic(fallbackText);
    return;
  }
  player = current;

  let settled = false;
  // Runs once: the recording started, failed, or took too long
  const settle = (useVoice: boolean) => {
    if (settled) return;
    settled = true;
    clearTimeout(timer);
    subscription.remove();
    if (cancelFallback === cancel) cancelFallback = null;
    if (useVoice && player === current) {
      current.remove();
      player = null;
      speakArabic(fallbackText);
    }
  };
  const cancel = () => settle(false);

  const subscription = current.addListener("playbackStatusUpdate", (status) => {
    if (status.error) settle(true); // missing file or no internet
    else if (status.playing || status.didJustFinish) settle(false); // it worked
  });
  const timer = setTimeout(() => settle(true), LOAD_TIMEOUT_MS);
  cancelFallback = cancel;

  current.play();
}

export async function speakArabic(text: string): Promise<void> {
  const voice = await findArabicVoice();
  // Some phones list no voices but still speak Arabic, so try anyway
  Speech.speak(text, { language: "ar-SA", rate: 0.8, ...(voice ? { voice } : {}) });
}
