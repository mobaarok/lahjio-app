// Audio: plays a word's own recording, or reads it aloud with the phone's
// text-to-speech voice (Arabic, Saudi if the phone has it).
import { createAudioPlayer, type AudioPlayer } from "expo-audio";
import * as Speech from "expo-speech";
import type { Item } from "./types";

// Items can store a relative path ("/audio/x.mp3") that works on the website.
// In the app, those paths are read from the live site.
const SITE_URL = "https://lahjio.app";

let player: AudioPlayer | null = null; // the recording playing now, if any
let arabicVoice: Promise<string | null> | null = null;

function audioUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
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

export function stopAudio(): void {
  player?.pause();
  player?.remove();
  player = null;
  Speech.stop();
}

// Plays a word. Returns false only when the phone has no Arabic voice and the
// word has no recording, so the button can show that.
export async function playWord(item: Pick<Item, "arabic" | "audio">): Promise<boolean> {
  stopAudio();

  if (item.audio) {
    try {
      player = createAudioPlayer(audioUrl(item.audio));
      player.play();
      return true;
    } catch {
      player = null; // bad link: fall back to the voice
    }
  }

  return speakArabic(item.arabic);
}

export async function speakArabic(text: string): Promise<boolean> {
  const voice = await findArabicVoice();
  // Some phones list no voices but still speak Arabic, so try anyway
  Speech.speak(text, { language: "ar-SA", rate: 0.8, ...(voice ? { voice } : {}) });
  return true;
}
