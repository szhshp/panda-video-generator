import React from "react";
import { Composition, Still, staticFile } from "remotion";
import { Intro } from "./compositions/Intro";
import { IntroVertical } from "./compositions/IntroVertical";
import {
  COMP_NAME,
  defaultMyCompProps,
  DURATION_IN_FRAMES,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from "../../types/constants";
import { REMOTION_PATHS } from "../../types/paths";
import { Content } from "./compositions/Content";
import { ContentVertical } from "./compositions/ContentVertical";
import { Video } from "./compositions/Video";
import { VideoVertical } from "./compositions/VideoVertical";
import { Cover, CoverProps } from "./compositions/Cover";
import { PPTDeck } from "./compositions/ppt-deck";
import {
  TitleJsonForPptSchema,
  computePptDurationInFrames,
  getWebVttDurationSeconds,
  DEFAULT_PPT_TIMING,
  type SlideDeck,
} from "../../types/ppt";

const DEFAULT_SLIDE_DECK: SlideDeck = TitleJsonForPptSchema.parse({
  title: "示例",
  subtitle: "在 public/video/title.json 填写 title、subtitle、slides",
  slides: ["# 第一页 <br> slides 为字符串数组，每页用 <br> 分行"],
});

/** Avoid stale public/ JSON in Studio after file edits (browser HTTP cache). */
async function fetchStaticJson(url: string): Promise<unknown> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`fetch ${url}: HTTP ${res.status}`);
  }
  return res.json();
}

async function fetchStaticText(url: string): Promise<string> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`fetch ${url}: HTTP ${res.status}`);
  }
  return res.text();
}

// Parse VTT file to get the last caption's end time (duration)
async function getAudioDurationFromVtt(vttFile: string): Promise<number> {
  try {
    const vttContent = await fetchStaticText(staticFile(vttFile));
    return getWebVttDurationSeconds(vttContent);
  } catch (e) {
    console.error('Failed to parse VTT file for duration:', e);
    return 0;
  }
}

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id={COMP_NAME}
        component={Intro}
        durationInFrames={DURATION_IN_FRAMES}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={defaultMyCompProps}
      />
      <Composition
        id="PPT-Deck"
        component={PPTDeck}
        calculateMetadata={async ({
          props,
        }: {
          props: {
            titleJsonFile?: string;
            deck?: SlideDeck;
            narrationEndSec?: number;
            showSlideNarrationTime?: boolean;
          };
        }) => {
          const titleJsonFile =
            props.titleJsonFile ?? REMOTION_PATHS.VIDEO_TITLE_JSON;
          const raw = await fetchStaticJson(staticFile(titleJsonFile));
          const deck = TitleJsonForPptSchema.parse(raw);
          let narrationEndSec: number | undefined;
          if (deck.narrationVtt) {
            narrationEndSec = getWebVttDurationSeconds(deck.narrationVtt);
          } else if (deck.narrationVttFile) {
            const vttText = await fetchStaticText(
              staticFile(deck.narrationVttFile),
            );
            narrationEndSec = getWebVttDurationSeconds(vttText);
          }
          const durationInFrames = computePptDurationInFrames(
            deck,
            VIDEO_FPS,
            DEFAULT_PPT_TIMING,
            narrationEndSec,
          );
          return {
            durationInFrames,
            props: {
              ...props,
              deck,
              titleJsonFile,
              narrationEndSec:
                narrationEndSec != null && Number.isFinite(narrationEndSec)
                  ? narrationEndSec
                  : undefined,
            },
          };
        }}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={{
          titleJsonFile: REMOTION_PATHS.VIDEO_TITLE_JSON,
          deck: DEFAULT_SLIDE_DECK,
          narrationEndSec: undefined,
          showSlideNarrationTime: false,
        }}
      />
      <Composition
        id="Video"
        component={Video}
        calculateMetadata={async ({ props }: { props: { title?: string; audioFile?: string; vttFile?: string; captionVttFile?: string; orientation?: 'vertical' | 'horizontal' } }) => {
          // Get audio duration automatically from VTT file
          const vttFile = props.vttFile || REMOTION_PATHS.TTS_VTT;
          const audioDurationInSeconds = await getAudioDurationFromVtt(vttFile);
          // Sequence 0: Cover (0.5 seconds) + Sequence 1: Intro (thirdTitleDuration 3.5s + sequenceDuration 4s = 7.5 seconds) + Sequence 3: Content (audio duration + 2 seconds tail extension)
          const COVER_DURATION_SECONDS = 0.5;
          const SEQ1_DURATION_SECONDS = 7.5;
          const CONTENT_TAIL_EXTENSION_SECONDS = 2;
          const totalDurationInSeconds = COVER_DURATION_SECONDS + SEQ1_DURATION_SECONDS + audioDurationInSeconds + CONTENT_TAIL_EXTENSION_SECONDS;
          const durationInFrames = Math.ceil(totalDurationInSeconds * VIDEO_FPS);

          return {
            durationInFrames,
            fps: VIDEO_FPS,
            width: VIDEO_WIDTH,
            height: VIDEO_HEIGHT,
          };
        }}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={{
          title: defaultMyCompProps.title,
          audioFile: REMOTION_PATHS.TTS_AUDIO,
          vttFile: REMOTION_PATHS.TTS_VTT,
          captionVttFile: REMOTION_PATHS.TTS_VTT,
          orientation: "horizontal",
        }}
      />
      <Composition
        id="Content"
        component={Content}
        calculateMetadata={async ({ props }: { props: { audioFile?: string; vttFile?: string; captionVttFile?: string; title?: string; coverImage?: string; coverBackgroundColor?: string; coverGradientColors?: string[]; coverGradientDirection?: 'horizontal' | 'vertical' | 'diagonal' } }) => {
          // Get audio duration automatically from VTT file
          const vttFile = props.vttFile || REMOTION_PATHS.TTS_VTT;
          const audioDurationInSeconds = await getAudioDurationFromVtt(vttFile);
          // Add delay for Intro animation and title/cover display (2.75 seconds)
          const TITLE_DELAY_SECONDS = 2.75;
          const totalDurationInSeconds = audioDurationInSeconds + TITLE_DELAY_SECONDS;
          const durationInFrames = Math.ceil(totalDurationInSeconds * VIDEO_FPS);

          return {
            durationInFrames,
            fps: VIDEO_FPS,
            width: VIDEO_WIDTH,
            height: VIDEO_HEIGHT,
          };
        }}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={{
          audioFile: REMOTION_PATHS.TTS_AUDIO,
          vttFile: REMOTION_PATHS.TTS_VTT,
          captionVttFile: REMOTION_PATHS.TTS_VTT,
          title: undefined,
          coverImage: undefined,
          coverBackgroundColor: undefined,
          coverGradientColors: undefined,
          coverGradientDirection: undefined,
        }}
      />
      {/* Vertical versions */}
      <Composition
        id="Intro-Vertical"
        component={IntroVertical}
        durationInFrames={DURATION_IN_FRAMES}
        fps={VIDEO_FPS}
        width={1080}
        height={1920}
        defaultProps={defaultMyCompProps}
      />
      <Composition
        id="Video-Vertical"
        component={VideoVertical}
        calculateMetadata={async ({ props }: { props: { title?: string; audioFile?: string; vttFile?: string; captionVttFile?: string } }) => {
          // Get audio duration automatically from VTT file
          const vttFile = props.vttFile || REMOTION_PATHS.TTS_VTT;
          const audioDurationInSeconds = await getAudioDurationFromVtt(vttFile);
          // Sequence 0: Cover (0.5 seconds) + Sequence 1: Intro (thirdTitleDuration 3.5s + sequenceDuration 4s = 7.5 seconds) + Sequence 3: Content (audio duration + 2 seconds tail extension)
          const COVER_DURATION_SECONDS = 0.5;
          const SEQ1_DURATION_SECONDS = 7.5;
          const CONTENT_TAIL_EXTENSION_SECONDS = 2;
          const totalDurationInSeconds = COVER_DURATION_SECONDS + SEQ1_DURATION_SECONDS + audioDurationInSeconds + CONTENT_TAIL_EXTENSION_SECONDS;
          const durationInFrames = Math.ceil(totalDurationInSeconds * VIDEO_FPS);

          return {
            durationInFrames,
            fps: VIDEO_FPS,
            width: 1080,
            height: 1920,
          };
        }}
        fps={VIDEO_FPS}
        width={1080}
        height={1920}
        defaultProps={{
          title: defaultMyCompProps.title,
          audioFile: REMOTION_PATHS.TTS_AUDIO,
          vttFile: REMOTION_PATHS.TTS_VTT,
          captionVttFile: REMOTION_PATHS.TTS_VTT,
        }}
      />
      <Composition
        id="Content-Vertical"
        component={ContentVertical}
        calculateMetadata={async ({ props }: { props: { audioFile?: string; vttFile?: string; captionVttFile?: string } }) => {
          // Get audio duration automatically from VTT file
          const vttFile = props.vttFile || REMOTION_PATHS.TTS_VTT;
          const audioDurationInSeconds = await getAudioDurationFromVtt(vttFile);
          // Add delay for Intro animation and title/cover display (2.75 seconds)
          const TITLE_DELAY_SECONDS = 2.75;
          const totalDurationInSeconds = audioDurationInSeconds + TITLE_DELAY_SECONDS;
          const durationInFrames = Math.ceil(totalDurationInSeconds * VIDEO_FPS);

          return {
            durationInFrames,
            fps: VIDEO_FPS,
            width: 1080,
            height: 1920,
          };
        }}
        fps={VIDEO_FPS}
        width={1080}
        height={1920}
        defaultProps={{
          audioFile: REMOTION_PATHS.TTS_AUDIO,
          vttFile: REMOTION_PATHS.TTS_VTT,
          captionVttFile: REMOTION_PATHS.TTS_VTT,
        }}
      />
      <Composition
        id="Cover"
        component={Cover}
        durationInFrames={VIDEO_FPS}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={{
          title: defaultMyCompProps.title,
          contentTitle: "这里是实际内容的标题",
        } as CoverProps}
      />
      {/* Still version for cover image generation */}
      <Still
        id="Cover-Still"
        component={Cover}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={{
          title: defaultMyCompProps.title,
          contentTitle: "这里是实际内容的标题",
        } as CoverProps}
      />
    </>
  );
};
