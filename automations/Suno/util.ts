import path from "path";
import { existsSync } from "fs";
import { getAuthFilePath } from "../utils/login-helper";

// Auth
export const SUNO_AUTH_FILE = getAuthFilePath("suno");
export const SUNO_AUTH_EXISTS = existsSync(SUNO_AUTH_FILE);

// Clip name
export function getClipName(): string {
  const fromEnv = process.env.CLIP_NAME || "AXkvirnntkvowk";
  if (fromEnv) return fromEnv;

  const audioPath = process.env.AUDIO_PATH;
  if (audioPath) return path.parse(audioPath).name;

  const guess = path.join(process.env.HOME!, "Desktop/AXkvirnntkvowk.mp3");
  if (existsSync(guess)) return path.parse(guess).name;

  return "AXkvirnntkvowk.mp3";
}

// Audio file path
export function getAudioPath(): string {
  const fromEnv = process.env.AUDIO_PATH;
  if (fromEnv) return fromEnv;

  const desktop = path.join(process.env.HOME!, "Desktop");
  for (const ext of [".mp3", ".m4a", ".wav", ".flac"]) {
    const guess = path.join(desktop, `Clover-4${ext}`);
    if (existsSync(guess)) return guess;
  }
  return path.join(desktop, "AXkvirnntkvowk.mp3");
}

// Song description/style
export function getSongDescription(): string {
  return (
    process.env.SONG_DESCRIPTION ?? "D major guitar instrumental"
  ).replace(/\\n/g, "\n");
}

// Song lyrics
export function getSongLyrics(): string | undefined {
  return process.env.SONG_LYRICS?.replace(/\\n/g, "\n");
}
