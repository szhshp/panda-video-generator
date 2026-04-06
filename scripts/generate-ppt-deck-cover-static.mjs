/**
 * Writes props from `public/video/title.json` and runs Remotion still `PPT-Deck-Cover-Static`
 * → `output/video/cover.png` (+ `cover.jpg`). Same filenames as Cover-Static. Used by `ppt:from-vtt` and manually.
 */
import fs from "node:fs";
import path from "node:path";
import { generatePptDeckCoverStaticAndJpg } from "./lib/generate-remotion-cover.mjs";
import { projectRoot } from "./lib/project-root.mjs";
import { writePptDeckCoverPropsFromTitle } from "./lib/render-props.mjs";

const TITLE_JSON = path.join(
  projectRoot,
  process.env.VIDEO_PUBLIC_DIR?.trim() || "public/video",
  "title.json",
);
const PROPS_PATH = path.join(
  projectRoot,
  "output",
  "video",
  "cover-ppt-props.json",
);

if (!fs.existsSync(TITLE_JSON)) {
  console.error(`No ${TITLE_JSON}`);
  process.exit(1);
}

if (!writePptDeckCoverPropsFromTitle(TITLE_JSON, PROPS_PATH)) {
  console.error("title.json missing non-empty `title` for PPT cover static frame");
  process.exit(1);
}

generatePptDeckCoverStaticAndJpg(PROPS_PATH, {
  label: "PPT-Deck cover (static)",
});

fs.rmSync(PROPS_PATH, { force: true });
