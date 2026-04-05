/**
 * Cross-platform (Windows / macOS / Linux): pick a random media file in a dir and rename to 0.<ext>.
 * If 0.<ext> exists, rename it to 0-YYYYMMDD-HHMMSS-<pid>.<ext> first.
 *
 * Usage: node scripts/shuffle-bg-asset.mjs <video|bgm|ppt-bg>
 * Env: VIDEO_DIR, BGM_DIR, PPT_BG_DIR — optional overrides (relative to repo root if not absolute).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");

const BLUE = "\x1b[0;34m";
const YELLOW = "\x1b[1;33m";
const NC = "\x1b[0m";

function timestamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-` +
    `${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}-` +
    `${process.pid}`
  );
}

function resolveDir(envKey, defaultRel) {
  const raw = process.env[envKey] ?? defaultRel;
  return path.isAbsolute(raw)
    ? path.normalize(raw)
    : path.join(projectRoot, raw);
}

function listFilesWithExt(dir, ext) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    if (/** @type {NodeJS.ErrnoException} */ (e).code === "ENOENT") return [];
    throw e;
  }
  const suffix = `.${ext.toLowerCase()}`;
  return entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(suffix))
    .map((e) => path.join(dir, e.name));
}

const KINDS = {
  video: {
    dirEnv: "VIDEO_DIR",
    defaultRel: "public/video",
    ext: "mp4",
    emoji: "🎬",
    label: "shuffle-bg-videos",
  },
  bgm: {
    dirEnv: "BGM_DIR",
    defaultRel: "public/bgm",
    ext: "mp3",
    emoji: "🎵",
    label: "shuffle-bgm",
  },
  "ppt-bg": {
    dirEnv: "PPT_BG_DIR",
    defaultRel: "public/image/ppt-bg",
    ext: "png",
    emoji: "🖼️",
    label: "shuffle-ppt-bg",
  },
};

function main() {
  const kind = process.argv[2];
  const spec = KINDS[/** @type {keyof typeof KINDS} */ (kind)];
  if (!spec) {
    console.error("Usage: node scripts/shuffle-bg-asset.mjs <video|bgm|ppt-bg>");
    process.exit(1);
  }

  const dir = resolveDir(spec.dirEnv, spec.defaultRel);
  const ext = spec.ext;
  const emoji = spec.emoji;
  const label = spec.label;

  fs.mkdirSync(dir, { recursive: true });

  const zeroPath = path.join(dir, `0.${ext}`);
  if (fs.existsSync(zeroPath)) {
    fs.renameSync(zeroPath, path.join(dir, `0-${timestamp()}.${ext}`));
  }

  const candidates = listFilesWithExt(dir, ext);
  if (candidates.length === 0) {
    console.log(`${YELLOW}⚠️  ${label}: no .${ext} in ${dir} — skip${NC}`);
    return;
  }

  const idx = Math.floor(Math.random() * candidates.length);
  const picked = candidates[idx];
  const base = path.basename(picked);
  fs.renameSync(picked, zeroPath);

  console.log(`${BLUE}${emoji} New 0.${ext} ← ${base}${NC}`);
}

main();
