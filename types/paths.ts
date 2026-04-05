/**
 * App-level paths (Next.js, Remotion, automations).
 * Crawl + default narration layout: `@panda-video-generator/spider/paths`, `@panda-video-generator/caption-generator/paths`.
 */

export {
  getSpiderOutputDir,
  getSpiderOutputJsonPath,
  getSpiderTitleJsonPath,
} from '@panda-video-generator/spider/paths';

export { getTtsInputFile, getSpiderNarrationPath } from '@panda-video-generator/caption-generator/paths';

// Output directories
export const OUTPUT_DIRS = {
  TTS: 'output/tts',
  SPIDER: 'output/spider',
  VIDEO: 'output/video',
} as const;

// Public directories (for Remotion access)
export const PUBLIC_DIRS = {
  TTS: 'public/tts',
  SPIDER: 'public/spider',
  VIDEO: 'public/video',
  AUDIO: 'public/audio',
  OUT: 'public/out',
} as const;

// TTS file paths (defaults when env vars are unset)
export const TTS_PATHS = {
  INPUT: `${OUTPUT_DIRS.TTS}/input.txt`,
  AUDIO_MP3: `${OUTPUT_DIRS.TTS}/audio.mp3`,
  AUDIO_VTT: `${OUTPUT_DIRS.TTS}/audio.vtt`,
  // Public paths for Remotion
  PUBLIC_AUDIO_MP3: `${PUBLIC_DIRS.TTS}/audio.mp3`,
  PUBLIC_AUDIO_VTT: `${PUBLIC_DIRS.TTS}/audio.vtt`,
} as const;

/** Directory for TTS artifacts (audio.mp3, audio.vtt). Override: `TTS_OUTPUT_DIR`. */
export function getTtsOutputDir(): string {
  const v = process.env.TTS_OUTPUT_DIR?.trim();
  return v && v.length > 0 ? v : OUTPUT_DIRS.TTS;
}

/** Where Remotion reads mp3/vtt (sync target). Override: `TTS_PUBLIC_DIR`. */
export function getTtsPublicDir(): string {
  const v = process.env.TTS_PUBLIC_DIR?.trim();
  return v && v.length > 0 ? v : PUBLIC_DIRS.TTS;
}

export function getTtsAudioMp3Path(): string {
  return `${getTtsOutputDir()}/audio.mp3`;
}

export function getTtsAudioVttPath(): string {
  return `${getTtsOutputDir()}/audio.vtt`;
}

export function getTtsPublicAudioMp3Path(): string {
  return `${getTtsPublicDir()}/audio.mp3`;
}

export function getTtsPublicAudioVttPath(): string {
  return `${getTtsPublicDir()}/audio.vtt`;
}

// Spider file paths (static fallbacks; prefer `getSpiderOutputDir()` when respecting env)
export const SPIDER_PATHS = {
  OUTPUT_DIR: OUTPUT_DIRS.SPIDER,
  DEBUG_DIR: OUTPUT_DIRS.SPIDER,
} as const;

// Video file paths
export const VIDEO_PATHS = {
  VIDEO_MP4: `${OUTPUT_DIRS.VIDEO}/video.mp4`,
  COVER_JPG: `${OUTPUT_DIRS.VIDEO}/cover.jpg`,
  COVER_PNG: `${OUTPUT_DIRS.VIDEO}/cover.png`,
  // Public paths for Remotion (synced from getSpiderTitleJsonPath() during render)
  PUBLIC_TITLE_JSON: `${PUBLIC_DIRS.VIDEO}/title.json`,
} as const;

// Remotion static file paths (relative to public directory)
export const REMOTION_PATHS = {
  TTS_AUDIO: 'tts/audio.mp3',
  /** TTS-aligned timeline; use for composition duration with `audio.mp3`. */
  TTS_VTT: 'tts/audio.vtt',
  /** Character-based estimate only — does not match TTS audio timing. Prefer TTS_VTT for burn-in. */
  SPIDER_CAPTIONS_VTT: 'spider/captions.vtt',
  /** Title + optional `slides` for `PPT-Deck`; same file other comps use for `title`. */
  VIDEO_TITLE_JSON: 'video/title.json',
  /** Full-frame slide background for `PPT-Deck` (under slide text, above outer fill). */
  PPT_DECK_BG: 'image/ppt-bg.png',
  /** Corner mark in `PPT-Deck` (same asset as `Logo` composition). */
  TRADEMARK_LOGO: 'logo/logo.png',
  AUDIO_INTRO: 'audio/intro.mp3',
  AUDIO_INTRO_TYPEWRITER: 'audio/intro_typewriter.mp3',
} as const;

// Automation upload paths (title defaults to spider dir; override with SPIDER_OUTPUT_DIR in env)
export const UPLOAD_PATHS = {
  DEFAULT_VIDEO: VIDEO_PATHS.VIDEO_MP4,
  DEFAULT_TITLE_JSON: `${OUTPUT_DIRS.SPIDER}/title.json`,
  DEFAULT_COVER: VIDEO_PATHS.COVER_JPG,
} as const;
