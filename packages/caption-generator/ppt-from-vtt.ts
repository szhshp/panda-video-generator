#!/usr/bin/env node
/**
 * One step after TTS: WebVTT → LLM → merge public/video/title.json (slides + narrationVttFile).
 *
 *   pnpm ppt:from-vtt -- --vtt public/tts/audio.vtt
 *   pnpm ppt:from-vtt -- --vtt output/tts/audio.vtt --narration-vtt tts/audio.vtt
 *   pnpm ppt:from-vtt -- --vtt public/tts/audio.vtt --no-llm
 */

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

type SlideDeck = {
  title: string;
  subtitle: string;
  slides: string[];
  /** Seconds from VTT t=0 when each slide should appear; same length as slides. */
  slideStartSec?: number[];
};

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
  const title = typeof o.title === 'string' ? o.title : '';
  const subtitle = typeof o.subtitle === 'string' ? o.subtitle : '';
  const slides = Array.isArray(o.slides)
    ? o.slides.filter((s): s is string => typeof s === 'string')
    : [];
  if (!title || slides.length === 0) {
    throw new Error(`Invalid deck: need title and slides`);
  }
  let slideStartSec: number[] | undefined;
  const rawStarts = o.slideStartSec;
  if (Array.isArray(rawStarts) && rawStarts.length === slides.length) {
    const nums = rawStarts.map((x) =>
      typeof x === 'number' ? x : Number(x),
    );
    if (
      nums.every((n) => Number.isFinite(n) && n >= 0) &&
      nums.every((n, i) => i === 0 || n >= nums[i - 1]!)
    ) {
      const off = nums[0]!;
      slideStartSec =
        off === 0 ? nums : nums.map((t) => +(t - off).toFixed(3));
    }
  }
  return { title, subtitle, slides, slideStartSec };
}

const VTT_SLIDES_SYSTEM = `You output only valid JSON. No markdown fences, no explanation.

Input: WebVTT cues (time-coded dialogue). Your job is **not** to subtitle that dialogue. Build **deck titles**: high-level **labels** a producer would put in a **talk outline** — same language, same facts and intent, **no new invented claims**.

De-couple from the transcript (strict):
- **Never** reuse cue lines or long fragments. Do **not** copy sentence rhythm, connective words, or list order from cues.
- For Chinese: avoid any substring of **5+ consecutive characters** that appears **verbatim** in any cue (except proper nouns, numbers, or fixed terms). Rewrite with **different vocabulary** (synonyms, shorter compounds, category names).
- Prefer **abstract nouns, contrasts** (e.g. 消费 / 创造), **stage names** (困境 / 转机 / 做法), **one verb + object** pairs — not what the speaker said word-for-word.
- Each slide should still **truthfully cover** the cues it spans; mentally compress a **block of cues** into **one chapter idea**, then name that idea in **≤12 characters** for the "# " line when possible.

Slide shape (keep screens quiet):
- **Every** slide MUST use: **"# " + title** then **at least two** " <br> " lines — **sub-points** (short outline bullets), same language, still de-coupled from cue wording.
- Each sub line: **2–14 Chinese characters** (or equally short in other languages). **No** long sentences; **no** cue echo. **Never** more than **four** " <br> " lines total per slide (title + 3 subs max).
- **Fewer, wider slides** beats many slides that echo the VTT beat-by-beat. Merge cues that share one theme.

Schema:
{
  "title": string,
  "subtitle": string,
  "slides": string[],
  "slideStartSec": number[]
}

slideStartSec (required): same length as slides. slideStartSec[i] = seconds from WebVTT start when slide i appears — use the **start time of the first cue** this slide covers (from the listing). slideStartSec[0] = 0; non-decreasing; decimals OK.

Formatting: join lines with " <br> " only (title line then ≥2 sub lines); no markdown fences.`;

async function slideDeckFromVttWithLlm(vttText: string): Promise<SlideDeck> {
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

  const llm = getCaptionLlmConfig();
  const raw = await completeChatText({
    llm,
    system: VTT_SLIDES_SYSTEM,
    user: `WebVTT cues:\n\n${block}\n\nFinal check: each slide has "# " title plus **at least two** " <br> " sub lines (outline bullets only); no subtitle-only slides; paraphrase so lines would not match cue text in a long-substring search (except proper nouns / numbers).`,
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
  const slides = cues.map((c) =>
    c.text
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .join(' <br> '),
  );
  const title =
    titleHint?.trim() ||
    cues[0]!.text.replace(/\n/g, ' ').slice(0, 24).trim() ||
    'Untitled';
  const t0 = cues[0]!.startMs / 1000;
  const slideStartSec = cues.map((c) => +(c.startMs / 1000 - t0).toFixed(3));
  return { title, subtitle: '', slides, slideStartSec };
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

  const deck = hasFlag('--no-llm')
    ? slideDeckHeuristic(vttText, titleHint)
    : await slideDeckFromVttWithLlm(vttText);

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
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
