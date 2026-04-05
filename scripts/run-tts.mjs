/**
 * TTS: narration → audio.mp3 + audio.vtt, then sync to public/.
 */
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { projectRoot } from "./lib/project-root.mjs";
import { hasFfmpeg, run } from "./lib/run-cmd.mjs";

dotenv.config({ path: path.join(projectRoot, ".env") });

const BLUE = "\x1b[0;34m";
const GREEN = "\x1b[0;32m";
const RED = "\x1b[0;31m";
const NC = "\x1b[0m";

function resolvePath(relOrAbs) {
  if (path.isAbsolute(relOrAbs)) return relOrAbs;
  return path.join(projectRoot, relOrAbs);
}

const SPIDER_OUTPUT_DIR = resolvePath(
  process.env.SPIDER_OUTPUT_DIR ?? "output/spider",
);
const TTS_OUTPUT_DIR = resolvePath(
  process.env.TTS_OUTPUT_DIR ?? "output/tts",
);
const TTS_INPUT_FILE =
  process.env.TTS_INPUT_FILE ??
  path.join(SPIDER_OUTPUT_DIR, "input.txt");

console.log(`${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}`);
console.log(`${BLUE}🎙️  TTS (Edge-TTS, Node)${NC}`);
console.log(`${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}`);
console.log("");
console.log(`${BLUE}Input: ${TTS_INPUT_FILE}${NC}`);
console.log(`${BLUE}Output dir: ${TTS_OUTPUT_DIR}${NC}`);
console.log(`${BLUE}After: sync-outputs-to-public → public/${NC}`);
console.log("");

if (!fs.existsSync(TTS_INPUT_FILE)) {
  console.log(`${RED}❌ Error: Input file not found: ${TTS_INPUT_FILE}${NC}`);
  process.exit(1);
}

if (!hasFfmpeg()) {
  console.log(
    `${RED}❌ Error: ffmpeg is required (merge / atempo). Install on PATH (e.g. brew install ffmpeg).${NC}`,
  );
  process.exit(1);
}

const cliPath = path.join("packages", "tts-node", "src", "cli.ts");
if (run("pnpm", ["exec", "tsx", cliPath, TTS_INPUT_FILE, TTS_OUTPUT_DIR]) !== 0) {
  console.log(`${RED}❌ Failed to generate audio${NC}`);
  process.exit(1);
}

const mp3Out = path.join(TTS_OUTPUT_DIR, "audio.mp3");
const vttOut = path.join(TTS_OUTPUT_DIR, "audio.vtt");
if (!fs.existsSync(mp3Out) || !fs.existsSync(vttOut)) {
  console.log(
    `${RED}❌ Error: Audio files not found in ${TTS_OUTPUT_DIR}${NC}`,
  );
  process.exit(1);
}

if (run("node", [path.join(projectRoot, "scripts", "sync-outputs-to-public.mjs")]) !== 0) {
  process.exit(1);
}

console.log("");
console.log(
  `${GREEN}✅ TTS done: ${mp3Out}, ${vttOut} (synced under public/)${NC}`,
);
