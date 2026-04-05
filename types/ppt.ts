import { z } from "zod";

/** Max width (px) for PPT slide copy and burn-in captions in `PPT-Deck` composition module. */
export const PPT_DECK_MAX_CONTENT_WIDTH_PX = 800;

/**
 * Validate optional per-slide VTT sync times; drop if invalid (`PPT-Deck` falls back to animation-based lengths).
 */
export function normalizeDeckSlideStartSec(
  slideCount: number,
  slideStartSec: unknown,
): number[] | undefined {
  if (!Array.isArray(slideStartSec) || slideStartSec.length !== slideCount) {
    return undefined;
  }
  const nums = slideStartSec.map((x) =>
    typeof x === "number" ? x : Number(x),
  );
  if (nums.length === 0) return undefined;
  if (nums.some((n) => !Number.isFinite(n) || n < 0)) {
    return undefined;
  }
  for (let i = 1; i < nums.length; i++) {
    if (nums[i]! < nums[i - 1]!) {
      return undefined;
    }
  }
  return nums;
}

/**
 * Frame count per slide when switching by VTT timeline (main segment, narration t=0).
 */
export function computeVttSyncedSlideDurationFrames(
  slideStartSec: number[],
  narrationEndSec: number,
  fps: number,
): number[] {
  const n = slideStartSec.length;
  if (n === 0) return [];
  const endSec = Math.max(narrationEndSec, slideStartSec[n - 1] ?? 0);
  const frames: number[] = [];
  for (let i = 0; i < n; i++) {
    const segmentEnd =
      i < n - 1 ? slideStartSec[i + 1]! : endSec;
    const sec = Math.max(0, segmentEnd - slideStartSec[i]!);
    frames.push(Math.max(1, Math.ceil(sec * fps)));
  }
  return frames;
}

/**
 * `public/video/title.json` (and spider copy): title for legacy comps + optional `slides` for `PPT-Deck`.
 */
export const TitleJsonForPptSchema = z
  .object({
    title: z.string(),
    subtitle: z.string().optional(),
    slides: z.array(z.string()).optional(),
    /** Start time in seconds (narration / VTT t=0) when each slide becomes active; same length as slides. */
    slideStartSec: z.array(z.number()).optional(),
    narrationVttFile: z.string().optional(),
    narrationVtt: z.string().optional(),
  })
  .transform((o) => {
    const slides = Array.isArray(o.slides) ? o.slides : [];
    const slideStartSec = normalizeDeckSlideStartSec(slides.length, o.slideStartSec);
    return {
      title: o.title,
      subtitle: (o.subtitle ?? "").trim(),
      slides,
      slideStartSec,
      narrationVttFile:
        o.narrationVttFile?.trim() === undefined || o.narrationVttFile.trim() === ""
          ? undefined
          : o.narrationVttFile.trim(),
      narrationVtt:
        o.narrationVtt?.trim() === undefined || o.narrationVtt.trim() === ""
          ? undefined
          : o.narrationVtt.trim(),
    };
  });

export type SlideDeck = z.infer<typeof TitleJsonForPptSchema>;

/** Last cue end time in seconds (0 if no valid timestamps found). */
export function getWebVttDurationSeconds(vtt: string): number {
  let maxEndMs = 0;
  for (const line of vtt.split("\n")) {
    const timeMatch = line.match(
      /(\d{2}):(\d{2}):(\d{2})\.(\d{3})\s+-->\s+(\d{2}):(\d{2}):(\d{2})\.(\d{3})/,
    );
    if (timeMatch) {
      const endMs =
        parseInt(timeMatch[5]!, 10) * 3600000 +
        parseInt(timeMatch[6]!, 10) * 60000 +
        parseInt(timeMatch[7]!, 10) * 1000 +
        parseInt(timeMatch[8]!, 10);
      maxEndMs = Math.max(maxEndMs, endMs);
    }
  }
  return maxEndMs / 1000;
}

export type PptSegment = {
  text: string;
  isHeading: boolean;
};

export const DEFAULT_PPT_TIMING = {
  charSeconds: 0.11,
  minSlideSeconds: 2.6,
  introHoldSeconds: 2.2,
  lineStaggerSeconds: 0.34,
  lineFadeInFrames: 18,
  slideFadeInFrames: 12,
  slideFadeOutFrames: 20,
} as const;

export type PptTiming = typeof DEFAULT_PPT_TIMING;

/** Split slide string by <br>; heading if first raw line starts with # */
export function parseSlideSegments(slide: string): PptSegment[] {
  const rawParts = slide
    .split(/<br\s*\/?>/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return rawParts.map((raw) => {
    const isHeading = /^#+\s/.test(raw);
    const text = raw.replace(/^#+\s*/, "").trim();
    return { text, isHeading };
  });
}

function computeSlideDurationFramesFromSegments(
  segments: PptSegment[],
  fps: number,
  opts: PptTiming,
  intro: boolean,
): number {
  const n = Math.max(1, segments.length);
  const charCount = segments.reduce((acc, s) => acc + s.text.length, 0);
  const staggerSec = (n - 1) * opts.lineStaggerSeconds;
  const lineFadeSec = opts.lineFadeInFrames / fps;
  const slideFadeInSec = opts.slideFadeInFrames / fps;
  const slideFadeOutSec = opts.slideFadeOutFrames / fps;
  const readScale = intro ? 0.55 : 1;
  const holdSec = Math.max(
    intro ? opts.introHoldSeconds : opts.minSlideSeconds * 0.45,
    charCount * opts.charSeconds * readScale,
  );
  const revealEndSec = staggerSec + lineFadeSec;
  const totalSec =
    Math.max(slideFadeInSec, revealEndSec) + holdSec + slideFadeOutSec;
  return Math.max(
    Math.ceil(totalSec * fps),
    Math.ceil(opts.minSlideSeconds * fps),
  );
}

export function computeIntroDurationFrames(
  deck: SlideDeck,
  fps: number,
  opts: PptTiming = DEFAULT_PPT_TIMING,
): number {
  const segments: PptSegment[] = [
    { text: deck.title, isHeading: true },
  ];
  if (deck.subtitle.trim()) {
    segments.push({ text: deck.subtitle, isHeading: false });
  }
  return computeSlideDurationFramesFromSegments(segments, fps, opts, true);
}

export function computeSlideDurationFrames(
  slide: string,
  fps: number,
  opts: PptTiming = DEFAULT_PPT_TIMING,
): number {
  const segments = parseSlideSegments(slide);
  return computeSlideDurationFramesFromSegments(segments, fps, opts, false);
}

export function computePptTotalFrames(
  deck: SlideDeck,
  fps: number,
  opts: PptTiming = DEFAULT_PPT_TIMING,
): number {
  const intro = computeIntroDurationFrames(deck, fps, opts);
  const slides = deck.slides.reduce(
    (sum, s) => sum + computeSlideDurationFrames(s, fps, opts),
    0,
  );
  return intro + slides;
}

/**
 * Match `Video.tsx`: cover + animated intro before slide body (no background clip in `PPT-Deck`).
 */
export const PPT_VIDEO_WRAPPER = {
  coverSeconds: 0.5,
  introSeconds: 3.5,
  logoEndingSeconds: 4,
} as const;

export function computePPTDeckCoverFrames(fps: number): number {
  return Math.ceil(PPT_VIDEO_WRAPPER.coverSeconds * fps);
}

export function computePPTDeckIntroFrames(fps: number): number {
  return Math.ceil(PPT_VIDEO_WRAPPER.introSeconds * fps);
}

export function computePPTDeckWrapperFramesBefore(fps: number): number {
  return computePPTDeckCoverFrames(fps) + computePPTDeckIntroFrames(fps);
}

export function computePPTDeckWrapperFramesAfter(fps: number): number {
  return Math.ceil(PPT_VIDEO_WRAPPER.logoEndingSeconds * fps);
}

/** Sum of slide timings only (no title.json title/subtitle intro card — that is Cover + Intro). */
export function computePptSlidesTotalFrames(
  deck: SlideDeck,
  fps: number,
  opts: PptTiming = DEFAULT_PPT_TIMING,
): number {
  return deck.slides.reduce(
    (sum, s) => sum + computeSlideDurationFrames(s, fps, opts),
    0,
  );
}

/** Extra frames after last VTT cue when narration drives total duration. */
export const PPT_NARRATION_TAIL_FRAMES = 18;

/**
 * Middle section duration: slide animations vs narration length (aligned with VTT after wrapper-before).
 */
export function computePPTDeckMainContentFrames(
  deck: SlideDeck,
  fps: number,
  opts: PptTiming = DEFAULT_PPT_TIMING,
  narrationEndSec?: number | null,
): number {
  const slidesFrames = computePptSlidesTotalFrames(deck, fps, opts);
  let narrationFrames = 0;
  if (
    narrationEndSec != null &&
    Number.isFinite(narrationEndSec) &&
    narrationEndSec > 0
  ) {
    narrationFrames =
      Math.ceil(narrationEndSec * fps) + PPT_NARRATION_TAIL_FRAMES;
  }

  const synced =
    deck.slideStartSec != null &&
    deck.slideStartSec.length === deck.slides.length &&
    deck.slideStartSec.length > 0 &&
    narrationEndSec != null &&
    Number.isFinite(narrationEndSec) &&
    narrationEndSec > 0;

  if (synced) {
    const vttSum = computeVttSyncedSlideDurationFrames(
      deck.slideStartSec!,
      narrationEndSec,
      fps,
    ).reduce((a, b) => a + b, 0);
    const inner = Math.max(vttSum, narrationFrames, slidesFrames);
    return Math.max(inner, 1);
  }

  const inner = Math.max(slidesFrames, narrationFrames);
  return Math.max(inner, 1);
}

export function computePptDurationInFrames(
  deck: SlideDeck,
  fps: number,
  opts: PptTiming = DEFAULT_PPT_TIMING,
  narrationEndSec?: number | null,
): number {
  const before = computePPTDeckWrapperFramesBefore(fps);
  const after = computePPTDeckWrapperFramesAfter(fps);
  const main = computePPTDeckMainContentFrames(deck, fps, opts, narrationEndSec);
  return before + main + after;
}
