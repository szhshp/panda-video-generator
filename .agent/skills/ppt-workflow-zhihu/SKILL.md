---
name: ppt-workflow-zhihu
description: >-
  Runs the repo’s Zhihu → TTS → PPT deck pipeline (spider, Edge TTS, LLM slides
  from WebVTT, Remotion `PPT-Deck`). Use when the user wants a PPT/video deck from a
  Zhihu question URL, asks to run ppt:from-vtt, refresh title.json slides, or
  debug narration timing, captions, or slide sync.
---

# PPT workflow (Zhihu → `PPT-Deck`)

## Preconditions

- Run all `pnpm` / CLI steps from the **monorepo root** (`.env` is loaded from repo root per project rules).
- `.env` must include LLM keys used by `packages/caption-generator` (e.g. DeepSeek) for **video script** and **`ppt:from-vtt`**.
- **ffmpeg** on PATH for `pnpm tts`.
- Zhihu spider needs a browser (local GUI or CI with Chromium + display).

## End-to-end checklist (manual)

Execute in order from repo root:

1. **Crawl + video script + estimated VTT**
   ```bash
   pnpm spider:zhihu -- "https://www.zhihu.com/question/<id>"
   ```
   Writes: `output/spider/output.json`, `input.txt`, `captions.vtt`, `title.json` (title only), mirrors title to `public/video/title.json`.

2. **TTS + sync to `public/`**
   ```bash
   pnpm tts
   ```
   Writes: `output/tts/audio.mp3`, `audio.vtt`; syncs `public/tts/` (and title/captions per `sync-outputs-to-public`).

3. **LLM deck + merge `title.json`**
   ```bash
   pnpm ppt:from-vtt -- --vtt public/tts/audio.vtt --narration-vtt tts/audio.vtt
   ```

4. **Preserve slides for later sync** (optional but recommended if you run `pnpm tts` again):
   ```bash
   cp public/video/title.json output/spider/title.json
   ```

## What each step owns

| Step | Main outputs |
|------|----------------|
| `spider:zhihu` | `output/spider/input.txt`, `captions.vtt` (estimate from script), minimal `title.json` |
| `pnpm tts` | `output/tts/audio.mp3`, `audio.vtt` (real timeline), `public/tts/*` |
| `ppt:from-vtt` | Updates `public/video/title.json`: `slides`, `slideStartSec`, `narrationVttFile` |

## Remotion

- Composition id: **`PPT-Deck`** in `src/remotion/Root.tsx`.
- Implementation: `src/remotion/compositions/ppt-deck.tsx` (kebab-case filename).
- `title.json` is loaded via `staticFile` with **no-store** fetch in metadata (refresh preview after regenerating JSON).
- Slide body uses **`types/ppt.ts`** (timing, `slideStartSec`, `PPT_DECK_MAX_CONTENT_WIDTH_PX`).
- Burn-in captions: `Content` overlay with `captionLayout="bottom"`, TTS VTT path from `title.json` (`narrationVttFile`).

## Important paths (`types/paths.ts` → `REMOTION_PATHS`)

- `VIDEO_TITLE_JSON` → `video/title.json`
- `TTS_VTT` / `TTS_AUDIO` → `tts/audio.vtt`, `tts/audio.mp3`
- `PPT_DECK_BG` → `image/ppt-bg.png`
- `TRADEMARK_LOGO` → `logo/logo.png` (optional lockup / Cover parity in `PPT-Deck`)

## LLM slide generation

- CLI: `packages/caption-generator/ppt-from-vtt.ts`
- Script: `pnpm ppt:from-vtt`
- Input VTT must live under **`public/`** (or spider canonical path with `--narration-vtt`); `--narration-vtt` is **web path** (e.g. `tts/audio.vtt`), not filesystem.
- **`--no-llm`**: heuristic cue-per-slide (no API).

## Pitfalls

- **`pnpm tts` sync** can overwrite `public/video/title.json` with a **title-only** object — run `ppt:from-vtt` again **or** copy a backup with `slides` back into `public/video/title.json`.
- Do not mix **spider estimate** `captions.vtt` timing with **TTS** audio for burn-in; use **`public/tts/audio.vtt`** (or path set in `title.json`) for **`PPT-Deck`**.
- Full **video render** (not PPT-only): `pnpm pipeline:zhihu-video -- <url>` or `pnpm render:video` after TTS (org policy may restrict public deploy).

## Related code (for edits)

- `packages/spider/zhihu/cli-zhihu-video-prep.ts` — crawl + script + `captions.vtt`
- `packages/caption-generator/ppt-from-vtt.ts` — VTT → LLM → `title.json`
- `src/remotion/compositions/ppt-deck.tsx` — deck layout, bg, trademark, BGM/TTS
- `src/remotion/compositions/Content.tsx` — caption colors, `captionMaxWidthPx`, bottom layout

## See also

- **`.agent/skills/url-to-video-pipeline/SKILL.md`** — standard Video composition pipeline (no `ppt:from-vtt`).
- **`.agent/skills/spider/SKILL.md`**, **`.agent/skills/tts-node/SKILL.md`**, **`.agent/skills/remotion-render/SKILL.md`**
