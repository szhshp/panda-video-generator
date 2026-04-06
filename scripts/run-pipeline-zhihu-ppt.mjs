/**
 * Zhihu question URL → spider → TTS → ppt:from-vtt → Remotion `PPT-Deck` (+ cover).
 */
import fs from "node:fs";
import path from "node:path";
import { projectRoot } from "./lib/project-root.mjs";
import { run } from "./lib/run-cmd.mjs";

const BLUE = "\x1b[0;34m";
const GREEN = "\x1b[0;32m";
const RED = "\x1b[0;31m";
const YELLOW = "\x1b[1;33m";
const NC = "\x1b[0m";

function resolvePath(relOrAbs) {
  if (path.isAbsolute(relOrAbs)) return relOrAbs;
  return path.join(projectRoot, relOrAbs);
}

const argv = process.argv.slice(2).filter((a) => a !== "--");
const zhiHuUrl = argv[0];

if (!zhiHuUrl) {
  console.log(`${RED}❌ Error: Please provide a Zhihu question URL${NC}`);
  console.log("Usage: pnpm pipeline:zhihu-ppt -- <zhihu_url>");
  process.exit(1);
}

const urlOk = /^https:\/\/www\.zhihu\.com\/question\//.test(zhiHuUrl);
if (!urlOk) {
  console.log(`${RED}❌ Error: Invalid Zhihu URL format${NC}`);
  console.log("Expected format: https://www.zhihu.com/question/<question_id>");
  process.exit(1);
}

const SPIDER_OUTPUT_DIR = resolvePath(
  process.env.SPIDER_OUTPUT_DIR ?? "output/spider",
);

console.log(`${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}`);
console.log(`${BLUE}🎬 Pipeline: Zhihu → PPT-Deck${NC}`);
console.log(`${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}`);
console.log("");

console.log(`${YELLOW}📝 Step 1/4: Zhihu spider + script…${NC}`);
console.log(`URL: ${zhiHuUrl}`);
console.log("");

if (
  run("node", [
    path.join(projectRoot, "scripts", "run-spider-zhihu.mjs"),
    zhiHuUrl,
  ]) !== 0
) {
  console.log(`${RED}❌ Step 1 failed: Zhihu spider${NC}`);
  process.exit(1);
}

console.log("");
console.log(`${GREEN}✅ Step 1 done${NC}`);
console.log("");

console.log(`${YELLOW}🎙️  Step 2/4: TTS + sync to public/…${NC}`);
if (run("node", [path.join(projectRoot, "scripts", "run-tts.mjs")]) !== 0) {
  console.log(`${RED}❌ Step 2 failed: TTS${NC}`);
  process.exit(1);
}

console.log("");
console.log(`${GREEN}✅ Step 2 done${NC}`);
console.log("");

console.log(`${YELLOW}📊 Step 3/4: ppt:from-vtt (LLM slides → title.json)…${NC}`);
const pptCli = path.join("packages", "caption-generator", "ppt-from-vtt.ts");
if (
  run("pnpm", [
    "exec",
    "tsx",
    pptCli,
    "--vtt",
    "public/tts/audio.vtt",
    "--narration-vtt",
    "tts/audio.vtt",
  ]) !== 0
) {
  console.log(`${RED}❌ Step 3 failed: ppt:from-vtt${NC}`);
  process.exit(1);
}

console.log("");
console.log(`${GREEN}✅ Step 3 done${NC}`);
console.log("");

console.log(`${YELLOW}🎬 Step 4/4: Remotion PPT-Deck + cover…${NC}`);
if (
  run("node", [
    path.join(projectRoot, "scripts", "run-render-composition.mjs"),
    "PPT-Deck",
  ]) !== 0
) {
  console.log(`${RED}❌ Step 4 failed: render PPT-Deck${NC}`);
  process.exit(1);
}

const publicTitle = path.join(projectRoot, "public", "video", "title.json");
const spiderTitle = path.join(SPIDER_OUTPUT_DIR, "title.json");
if (fs.existsSync(publicTitle)) {
  try {
    fs.mkdirSync(path.dirname(spiderTitle), { recursive: true });
    fs.copyFileSync(publicTitle, spiderTitle);
    console.log(
      `${GREEN}📋 Copied public/video/title.json → ${path.relative(projectRoot, spiderTitle)} (preserves slides for later TTS)${NC}`,
    );
  } catch (e) {
    console.log(
      `${YELLOW}⚠️  Could not copy title.json to spider dir: ${e}${NC}`,
    );
  }
}

console.log("");
console.log(`${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}`);
console.log(`${GREEN}✅ Zhihu PPT pipeline finished${NC}`);
console.log(`${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}`);
console.log("");
console.log(`${BLUE}📁 Outputs:${NC}`);
console.log("  - Video: output/video/video.mp4");
console.log("  - Cover: output/video/cover.png, output/video/cover.jpg");
console.log("  - Deck meta: public/video/title.json");
console.log("");
