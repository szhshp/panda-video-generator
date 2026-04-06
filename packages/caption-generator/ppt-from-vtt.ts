#!/usr/bin/env node
/**
 * One step after TTS: WebVTT → LLM → merge public/video/title.json (slides + narrationVttFile).
 * Then runs Remotion `PPT-Deck-Cover-Static` → output/video/cover.png (+ cover.jpg, same paths as Cover-Static).
 *
 *   pnpm ppt:from-vtt -- --vtt public/tts/audio.vtt
 *   pnpm ppt:from-vtt -- --vtt output/tts/audio.vtt --narration-vtt tts/audio.vtt
 *   pnpm ppt:from-vtt -- --vtt public/tts/audio.vtt --no-llm
 */

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import {
  access,
  copyFile,
  mkdir,
  readFile,
  writeFile,
} from 'fs/promises';
import { constants as fsConstants } from 'fs';
import { dirname, relative, resolve } from 'path';
import {
  captionLlmProviderLabel,
  getCaptionLlmConfig,
  loadCaptionLlmEnvFromDotenv,
} from './llm-config';
import { completeChatText } from './llm-chat';
import {
  type SlideDeck,
  TitleJsonForPptSchema,
} from '../../types/ppt';

loadCaptionLlmEnvFromDotenv();

// --- merge title.json (shallow) ---

async function readTitleRecord(path: string): Promise<Record<string, unknown>> {
  try {
    const raw: unknown = JSON.parse(await readFile(path, 'utf-8'));
    return raw !== null && typeof raw === 'object' && !Array.isArray(raw)
      ? { ...(raw as Record<string, unknown>) }
      : {};
  } catch {
    return {};
  }
}

async function mergeTitleJsonWithSlideTiming(
  filePath: string,
  deck: SlideDeck,
  patch: Record<string, unknown>,
): Promise<void> {
  const next = { ...(await readTitleRecord(filePath)), ...patch };
  if (deck.slideStartSec && deck.slideStartSec.length === deck.slides.length) {
    next.slideStartSec = deck.slideStartSec;
  } else {
    delete next.slideStartSec;
  }
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(next, null, 2)}\n`, 'utf-8');
}

// --- WebVTT cues ---

type VttCue = { startMs: number; endMs: number; text: string };

function parseTimestampLine(line: string): { startMs: number; endMs: number } | null {
  const timeMatch = line.match(
    /(\d{2}):(\d{2}):(\d{2})\.(\d{3})\s+-->\s+(\d{2}):(\d{2}):(\d{2})\.(\d{3})/,
  );
  if (!timeMatch) return null;
  const startMs =
    parseInt(timeMatch[1]!, 10) * 3600000 +
    parseInt(timeMatch[2]!, 10) * 60000 +
    parseInt(timeMatch[3]!, 10) * 1000 +
    parseInt(timeMatch[4]!, 10);
  const endMs =
    parseInt(timeMatch[5]!, 10) * 3600000 +
    parseInt(timeMatch[6]!, 10) * 60000 +
    parseInt(timeMatch[7]!, 10) * 1000 +
    parseInt(timeMatch[8]!, 10);
  return { startMs, endMs };
}

function parseWebVttCues(vtt: string): VttCue[] {
  const cues: VttCue[] = [];
  const blocks = vtt.replace(/\r\n/g, '\n').split(/\n\n+/);
  for (const block of blocks) {
    const lines = block
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    if (lines.length < 2) continue;
    if (lines[0] === 'WEBVTT' || lines[0]!.startsWith('NOTE')) continue;
    let idx = 0;
    if (/^\d+$/.test(lines[0]!)) idx = 1;
    if (idx >= lines.length) continue;
    const ts = parseTimestampLine(lines[idx]!);
    if (!ts) continue;
    const text = lines.slice(idx + 1).join('\n').trim();
    if (!text) continue;
    cues.push({ ...ts, text });
  }
  return cues;
}

// --- LLM JSON ---

function stripJsonFence(raw: string): string {
  const m = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  return m ? m[1]!.trim() : raw.trim();
}

function parseSlideDeckFromModel(raw: string, label: string): SlideDeck {
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripJsonFence(raw));
  } catch {
    throw new SyntaxError(
      `Model returned non-JSON (${label}). First 200 chars: ${raw.slice(0, 200)}`,
    );
  }
  const o = parsed as Record<string, unknown>;
  try {
    const deck = TitleJsonForPptSchema.parse({
      title: typeof o.title === 'string' ? o.title : '',
      subtitle: typeof o.subtitle === 'string' ? o.subtitle : '',
      slides: Array.isArray(o.slides) ? o.slides : [],
      slideStartSec: o.slideStartSec,
    });
    if (!deck.title.trim() || deck.slides.length === 0) {
      throw new Error('need non-empty title and at least one slide');
    }
    return deck;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Invalid deck from ${label}: ${msg}`);
  }
}

const VTT_SLIDES_SYSTEM = `你只输出合法 JSON。禁止 markdown 代码块，禁止解释。

输入：WebVTT 字幕条（带时间的对白）。你的任务**不是**给对白做字幕，而是做**讲纲级**的**deck 标题**：制片人在**演讲大纲**里会用的那种高层**标签**——语言一致、事实与意图一致，**不得捏造新论断**。

**title 与 subtitle（视频封面 / deck 页眉）：**
- 若用户消息里已有**非空标题**，JSON 的 **"title"** **必须**与该字符串保持**同一主题与论点**。**禁止**改框架、换话题名、杜撰新主题（例如不要把关于「大脑是否萎缩」的问题改成「精神健康风险概览」这类不同焦点）。仅允许：**缩短**篇幅、**收紧**措辞、适度**吸睛钩子**（如对比、标点、一个利落短句）——**语义与指称不变**。
- **"subtitle"**：若已有副标题则同样规则——**就地润色**或缩短；确不需要可用 ""。若用户未给副标题，可输出与主题一致的**简短**可选副标题，或 ""。
- 若用户说明**没有**现成标题，则仅从字幕条提炼**一条**简短吸睛标题（仍须属实，禁止标题党假话）。

与逐字稿脱钩（严格）：
- **禁止**复用某条 cue 的整句或大段原文。**禁止**模仿语速节奏、连接词、或 cue 的列举顺序。
- 中文：避免任何在任一 cue 中**原样出现**的 **5 个及以上连续字**的子串（专名、数字、固定术语除外）。用**不同措辞**改写（近义词、更短复合词、类目名）。
- 优先**抽象名、对概念**（如 消费 / 创造）、**阶段名**（困境 / 转机 / 做法）、**动宾短搭配**——不要照搬说话人的字句。
- 每张幻灯仍须**如实覆盖**其跨度内的 cues；先在脑中把**一组 cues**压成**一个章节意**，再写入该张的 **"title"** 字段，尽量 **≤12 字**（若可）。

幻灯版式（画面尽量干净）：
- **slides** 为对象数组。**每个**对象形如：\`{ "title": string, "subtitle": string, "items": string[] }\`。
- **subtitle**（每张幻灯）：幻灯内副标题；不需要则填 **""**。
- **items**：**仅**要点 bullet 字符串数组（不要 "# "、不要 \`<br>\`）。**2–5** 条；**禁止**少于 2 或多于 5。语言与 cues 一致，措辞脱钩。
- **items** 中每条：中文 **6–20 字**（计汉字）；非中文 **6–20 个字符**（含空格）——紧凑短语，**禁止**长句与 echo cue。
- **少而宽**的幻灯胜过按 VTT 节拍切很多张 echo 的幻灯。主题相同的 cues 要合并。

Schema:
{
  "title": string,
  "subtitle": string,
  "slides": [
    { "title": string, "subtitle": string, "items": string[] }
  ],
  "slideStartSec": number[]
}

slideStartSec（必填）：长度与 slides 相同。slideStartSec[i] = 从 WebVTT 起点起第 i 张幻灯出现的秒数——取该幻灯所覆盖的**第一条 cue 的起始时间**（来自列表）。slideStartSec[0] = 0；非递减；可用小数。

禁止 markdown 代码块。**禁止**在 slides 里用 "# " 或 " <br> "；只用上述结构化 **items** 数组。`;

type ExistingDeckMeta = { title?: string; subtitle?: string };

async function loadExistingDeckMeta(
  outPath: string,
  cwd: string,
): Promise<ExistingDeckMeta> {
  const pub = await readTitleRecord(outPath);
  let title = typeof pub.title === 'string' ? pub.title.trim() : '';
  let subtitle = typeof pub.subtitle === 'string' ? pub.subtitle.trim() : '';
  if (!title) {
    const spiderDir = resolve(
      cwd,
      process.env.SPIDER_OUTPUT_DIR?.trim() || 'output/spider',
    );
    const sp = await readTitleRecord(resolve(spiderDir, 'title.json'));
    if (typeof sp.title === 'string' && sp.title.trim()) {
      title = sp.title.trim();
    }
    if (!subtitle && typeof sp.subtitle === 'string' && sp.subtitle.trim()) {
      subtitle = sp.subtitle.trim();
    }
  }
  return {
    ...(title ? { title } : {}),
    ...(subtitle ? { subtitle } : {}),
  };
}

async function slideDeckFromVttWithLlm(
  vttText: string,
  existingMeta: ExistingDeckMeta,
): Promise<SlideDeck> {
  const cues = parseWebVttCues(vttText);
  if (cues.length === 0) {
    throw new Error('No cues in WebVTT');
  }
  const block = cues
    .map((c, i) => {
      const s = (c.startMs / 1000).toFixed(1);
      const e = (c.endMs / 1000).toFixed(1);
      return `[${i + 1}] ${s}s – ${e}s\n${c.text}`;
    })
    .join('\n\n');

  const existingTitle = existingMeta.title?.trim() ?? '';
  const existingSubtitle = existingMeta.subtitle?.trim() ?? '';
  const metaBlock =
    existingTitle.length > 0
      ? `Existing deck metadata (same topic — shorten / 吸睛 only; do not change angle):\n- title: ${existingTitle}\n- subtitle: ${existingSubtitle || '(empty)'}\n\n`
      : 'Existing deck metadata: **no title** — derive one short hook title from cues only (factual).\n\n';

  const llm = getCaptionLlmConfig();
  const raw = await completeChatText({
    llm,
    system: VTT_SLIDES_SYSTEM,
    user: `${metaBlock}WebVTT cues:\n\n${block}\n\nFinal check: **slides** 的每个元素都是 \`{ title, subtitle, items }\`，**items** 含 **2–5** 条字符串；**每条** **6–20** 字（中文计汉字）或 **6–20** 字符（非中文含空格）。顶层 **title** / **subtitle** 遵守封面规则；每张的 **subtitle** 可为 ""。`,
    taskLabel: 'PPT slides from VTT',
  });
  if (raw == null) {
    throw new Error(`Empty response from ${captionLlmProviderLabel(llm)}`);
  }
  return parseSlideDeckFromModel(raw, captionLlmProviderLabel(llm));
}

function slideDeckHeuristic(vttText: string, titleHint?: string): SlideDeck {
  const cues = parseWebVttCues(vttText);
  if (cues.length === 0) throw new Error('No cues in WebVTT');
  const slides = cues.map((c) => {
    const lines = c.text
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => s.replace(/^#+\s*/, '').trim())
      .filter(Boolean);
    const lineTitle = lines[0] ?? '…';
    const rest = lines.slice(1);
    let items: string[];
    if (rest.length >= 2) {
      items = rest.slice(0, 5);
    } else if (rest.length === 1) {
      const one = rest[0]!;
      items = [one, one];
    } else {
      items = [lineTitle || '…', '…'];
    }
    return { title: lineTitle, subtitle: '', items };
  });
  const title =
    titleHint?.trim() ||
    cues[0]!.text.replace(/\n/g, ' ').slice(0, 24).trim() ||
    'Untitled';
  const t0 = cues[0]!.startMs / 1000;
  const slideStartSec = cues.map((c) => +(c.startMs / 1000 - t0).toFixed(3));
  return TitleJsonForPptSchema.parse({
    title,
    subtitle: '',
    slides,
    slideStartSec,
  });
}

// --- CLI ---

function argValue(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  if (i === -1) return undefined;
  return process.argv[i + 1];
}

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

function inferNarrationVttFile(vttFsPath: string, cwd: string): string {
  const abs = resolve(cwd, vttFsPath);
  const pub = resolve(cwd, 'public');
  const rel = relative(pub, abs);
  if (rel.startsWith('..') || rel === '') {
    throw new Error(
      'VTT outside public/. Use --narration-vtt tts/audio.vtt after syncing under public/tts/.',
    );
  }
  return rel.replace(/\\/g, '/');
}

/** Remotion only serves under public/; mirror spider output so PPT always matches latest crawl. */
async function mirrorSpiderCaptionsVttToPublic(
  vttPath: string,
  cwd: string,
): Promise<void> {
  const spiderDir = resolve(
    cwd,
    process.env.SPIDER_OUTPUT_DIR?.trim() || 'output/spider',
  );
  const canonical = resolve(spiderDir, 'captions.vtt');
  if (resolve(vttPath) !== resolve(canonical)) {
    return;
  }
  const destDir = resolve(cwd, 'public/spider');
  const dest = resolve(destDir, 'captions.vtt');
  await mkdir(destDir, { recursive: true });
  await copyFile(vttPath, dest);
  console.log(`Synced ${canonical} → public/spider/captions.vtt`);
}

async function main(): Promise<void> {
  const vttArg = argValue('--vtt');
  if (!vttArg?.trim()) {
    console.error(
      'pnpm ppt:from-vtt -- --vtt public/tts/audio.vtt [--no-llm] [--title "…"]',
    );
    process.exit(1);
  }

  const cwd = process.cwd();
  const vttPath = resolve(cwd, vttArg.trim());
  try {
    await access(vttPath, fsConstants.R_OK);
  } catch {
    console.error(`VTT not found: ${vttPath}`);
    process.exit(1);
  }

  await mirrorSpiderCaptionsVttToPublic(vttPath, cwd);

  const vttText = await readFile(vttPath, 'utf-8');
  const outPath = resolve(cwd, argValue('--out')?.trim() || 'public/video/title.json');
  const narrationVttArg = argValue('--narration-vtt')?.trim();
  let narrationVttFile: string;
  try {
    narrationVttFile =
      narrationVttArg ?? inferNarrationVttFile(vttArg.trim(), cwd);
  } catch (e) {
    const spiderDir = resolve(
      cwd,
      process.env.SPIDER_OUTPUT_DIR?.trim() || 'output/spider',
    );
    const canonical = resolve(spiderDir, 'captions.vtt');
    if (resolve(vttPath) === resolve(canonical)) {
      narrationVttFile = 'spider/captions.vtt';
    } else {
      console.error(e instanceof Error ? e.message : e);
      process.exit(1);
    }
  }
  const titleHint = argValue('--title')?.trim();

  const existingMeta = await loadExistingDeckMeta(outPath, cwd);

  const deck = hasFlag('--no-llm')
    ? slideDeckHeuristic(vttText, titleHint)
    : await slideDeckFromVttWithLlm(vttText, existingMeta);

  await mergeTitleJsonWithSlideTiming(outPath, deck, {
    title: titleHint ?? deck.title,
    subtitle: deck.subtitle,
    slides: deck.slides,
    narrationVttFile,
  });
  console.log(
    `Updated ${outPath} (slides + narrationVttFile=${narrationVttFile}` +
    (deck.slideStartSec?.length === deck.slides.length
      ? ' + slideStartSec[] for VTT sync'
      : '') +
    ')',
  );

  const coverStaticScript = resolve(cwd, 'scripts/generate-ppt-deck-cover-static.mjs');
  if (existsSync(coverStaticScript)) {
    const r = spawnSync(process.execPath, [coverStaticScript], {
      cwd,
      stdio: 'inherit',
      env: { ...process.env },
    });
    if (r.status !== 0) {
      console.warn(
        'PPT-Deck cover static failed (run from repo root with pnpm install). Non-fatal.',
      );
    }
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
