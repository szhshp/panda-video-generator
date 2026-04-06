/**
 * Shared Remotion stills; both write the same artifacts:
 * - Cover-Static (legacy white card)
 * - PPT-Deck-Cover-Static (PPT typography) → output/video/cover.png (+ ffmpeg → cover.jpg)
 * Optional fallback: first frame of an existing MP4 → cover.jpg.
 */
import fs from "node:fs";
import path from "node:path";
import { projectRoot } from "./project-root.mjs";
import { hasFfmpeg, run } from "./run-cmd.mjs";

const GREEN = "\x1b[0;32m";
const YELLOW = "\x1b[1;33m";
const NC = "\x1b[0m";

const REMOTION_ENTRY = path.join(projectRoot, "src/remotion/index.ts");

export function coverArtifactPaths() {
  const dir = path.join(projectRoot, "output", "video");
  return {
    COVER_PNG: path.join(dir, "cover.png"),
    COVER_JPG: path.join(dir, "cover.jpg"),
  };
}

function tryStill(coverPng, propsFilePath) {
  const args = [
    "exec",
    "remotion",
    "still",
    REMOTION_ENTRY,
    "Cover-Static",
    coverPng,
  ];
  if (propsFilePath && fs.existsSync(propsFilePath)) {
    args.push(`--props=${propsFilePath}`);
  }
  return run("pnpm", args) === 0;
}

function tryPptDeckCoverStatic(outPng, propsFilePath) {
  const args = [
    "exec",
    "remotion",
    "still",
    REMOTION_ENTRY,
    "PPT-Deck-Cover-Static",
    outPng,
  ];
  if (propsFilePath && fs.existsSync(propsFilePath)) {
    args.push(`--props=${propsFilePath}`);
  }
  return run("pnpm", args) === 0;
}

/**
 * @param {string | undefined} propsFile - render-props.json when present
 * @param {{ label?: string }} [opts] - default "Cover image"
 * @returns {{ pngOk: boolean, jpgOk: boolean }}
 */
export function generateCoverStillAndJpg(propsFile, opts = {}) {
  const { COVER_PNG, COVER_JPG } = coverArtifactPaths();
  fs.mkdirSync(path.dirname(COVER_PNG), { recursive: true });

  const label = opts.label ?? "Cover image";
  console.log("");
  console.log(`${YELLOW}🖼️  ${label}...${NC}`);

  let pngOk = false;
  if (propsFile && fs.existsSync(propsFile)) {
    if (tryStill(COVER_PNG, propsFile)) {
      console.log(`${GREEN}✅ Cover PNG: ${COVER_PNG}${NC}`);
      pngOk = true;
    }
  }
  if (!pngOk && tryStill(COVER_PNG, undefined)) {
    console.log(`${GREEN}✅ Cover PNG: ${COVER_PNG}${NC}`);
    pngOk = true;
  }

  let jpgOk = false;
  if (pngOk && hasFfmpeg()) {
    if (
      run("ffmpeg", [
        "-i",
        COVER_PNG,
        "-frames:v",
        "1",
        "-update",
        "1",
        "-q:v",
        "2",
        COVER_JPG,
        "-y",
        "-loglevel",
        "warning",
      ]) === 0
    ) {
      console.log(`${GREEN}✅ Cover JPG: ${COVER_JPG}${NC}`);
      jpgOk = true;
    }
  }

  return { pngOk, jpgOk };
}

/**
 * Same outputs as {@link generateCoverStillAndJpg} (`cover.png` / `cover.jpg`), using `PPT-Deck-Cover-Static`.
 * @param {string | undefined} propsFile - JSON with `{ title, subtitle? }`
 * @param {{ label?: string }} [opts]
 * @returns {{ pngOk: boolean, jpgOk: boolean }}
 */
export function generatePptDeckCoverStaticAndJpg(propsFile, opts = {}) {
  const { COVER_PNG, COVER_JPG } = coverArtifactPaths();
  fs.mkdirSync(path.dirname(COVER_PNG), { recursive: true });

  const label = opts.label ?? "Cover image (PPT-Deck)";
  console.log("");
  console.log(`${YELLOW}🖼️  ${label}...${NC}`);

  let pngOk = false;
  if (propsFile && fs.existsSync(propsFile)) {
    if (tryPptDeckCoverStatic(COVER_PNG, propsFile)) {
      console.log(`${GREEN}✅ Cover PNG: ${COVER_PNG}${NC}`);
      pngOk = true;
    }
  }
  if (!pngOk && tryPptDeckCoverStatic(COVER_PNG, undefined)) {
    console.log(`${GREEN}✅ Cover PNG: ${COVER_PNG}${NC}`);
    pngOk = true;
  }

  let jpgOk = false;
  if (pngOk && hasFfmpeg()) {
    if (
      run("ffmpeg", [
        "-i",
        COVER_PNG,
        "-frames:v",
        "1",
        "-update",
        "1",
        "-q:v",
        "2",
        COVER_JPG,
        "-y",
        "-loglevel",
        "warning",
      ]) === 0
    ) {
      console.log(`${GREEN}✅ Cover JPG: ${COVER_JPG}${NC}`);
      jpgOk = true;
    }
  }

  return { pngOk, jpgOk };
}

/**
 * @param {string} mp4Path - rendered video path
 * @returns {boolean}
 */
export function generateCoverJpgFromMp4(mp4Path) {
  const { COVER_JPG } = coverArtifactPaths();
  if (!hasFfmpeg()) return false;
  if (!mp4Path || !fs.existsSync(mp4Path)) return false;
  console.log(
    `${YELLOW}⚠️  Remotion still failed, trying ffmpeg from first frame...${NC}`,
  );
  if (
    run("ffmpeg", [
      "-ss",
      "0",
      "-i",
      mp4Path,
      "-vframes",
      "1",
      COVER_JPG,
      "-y",
      "-loglevel",
      "warning",
    ]) === 0
  ) {
    console.log(`${GREEN}✅ Cover JPG: ${COVER_JPG}${NC}`);
    return true;
  }
  return false;
}
