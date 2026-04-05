/**
 * `PPT-Deck` composition module. File name is kebab-case so the path is unique on case-insensitive volumes
 * (avoids editor/tsserver confusion after PascalCase vs mixed-case renames).
 */
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Html5Audio,
  Img,
  interpolate,
  Sequence,
  Series,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  computePPTDeckCoverFrames,
  computePPTDeckIntroFrames,
  computePPTDeckMainContentFrames,
  computeVttSyncedSlideDurationFrames,
  computePPTDeckWrapperFramesAfter,
  computePPTDeckWrapperFramesBefore,
  computeSlideDurationFrames,
  parseSlideSegments,
  type SlideDeck,
  type PptSegment,
  DEFAULT_PPT_TIMING,
  PPT_DECK_MAX_CONTENT_WIDTH_PX,
} from "../../../types/ppt";
import { REMOTION_PATHS } from "../../../types/paths";
import { defaultMyCompProps } from "../../../types/constants";
import { loadFont } from "@remotion/fonts";
import { Intro, TitleSequence } from "./Intro";
import { Cover } from "./Cover";
import { Content } from "./Content";

/** Same face as Cover / Intro titles; slide font sizes unchanged. */
const SLIDE_FONT_FAMILY = "dingliesongtypeface";

loadFont({
  family: SLIDE_FONT_FAMILY,
  url: staticFile("fonts/dingliesongtypeface.ttf"),
}).catch((err) => {
  console.error("Failed to load slide font:", err);
});

const BGM_STATIC = "bgm/0.mp3";

// Slide backdrop is `public/image/ppt-bg/0.png`. Optional: `pnpm shuffle:ppt-bg` before render.

const pptDeckBgStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const PptSlideBackground: React.FC = () => (
  <Img
    src={staticFile(REMOTION_PATHS.PPT_DECK_BG)}
    style={pptDeckBgStyle}
    alt=""
  />
);

/**
 * Top-left lockup matching `Cover`: greyed logo + `defaultMyCompProps.title`
 * (same opacity and logo scale as Cover’s corner row).
 */
const PPTDeckTrademark: React.FC = () => {
  const { width, height } = useVideoConfig();
  const logoSize = Math.min(width, height) * 0.1;
  const iconPx = logoSize / 2;

  return (
    <div
      style={{
        position: "absolute",
        top: 28,
        left: 216,
        zIndex: 20,
        pointerEvents: "none",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        opacity: 0.3,
        maxWidth: "min(520px, 42vw)",
      }}
    >
      <Img
        src={staticFile(REMOTION_PATHS.TRADEMARK_LOGO)}
        alt=""
        style={{
          width: iconPx,
          height: iconPx,
          objectFit: "contain",
          margin: 8,
          flexShrink: 0,
        }}
      />
      <h2
        style={{
          margin: 0,
          fontFamily: SLIDE_FONT_FAMILY,
          fontSize: 38,
          fontWeight: "bold",
          lineHeight: 1.2,
        }}
      >
        {defaultMyCompProps.title}
      </h2>
    </div>
  );
};

/** Elapsed seconds from start of main segment (TTS / captions t≈0), for VTT sync. */
function formatNarrationRange(startSec: number, endSec: number): string {
  const fmt = (t: number) => {
    const x = Math.max(0, t);
    const m = Math.floor(x / 60);
    const s = x - m * 60;
    if (m === 0) {
      return `${s.toFixed(1)}s`;
    }
    const pad = s < 10 ? "0" : "";
    return `${m}:${pad}${s.toFixed(1)}`;
  };
  return `${fmt(startSec)} – ${fmt(endSec)}`;
}

const PPTDeckBgm: React.FC<{ durationInFrames: number }> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTimeMs = (frame / fps) * 1000;
  const mainDurationMs = (durationInFrames / fps) * 1000;
  const fadeOutDurationMs = 2000;
  const fadeOutStartMs = Math.max(0, mainDurationMs - fadeOutDurationMs);
  const bgmBaseVolume = 0.15;
  let bgmVolume = bgmBaseVolume;
  if (mainDurationMs > 0 && currentTimeMs >= fadeOutStartMs) {
    const fadeOutProgress =
      (currentTimeMs - fadeOutStartMs) / fadeOutDurationMs;
    bgmVolume = interpolate(
      fadeOutProgress,
      [0, 1],
      [bgmBaseVolume, 0],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      },
    );
  }
  return (
    <Html5Audio
      src={staticFile(BGM_STATIC)}
      volume={bgmVolume}
      loop
      name="Background Music"
    />
  );
};

export type PPTDeckProps = {
  deck: SlideDeck;
  /** Set by `calculateMetadata`; unused in layout. */
  titleJsonFile?: string;
  /** Narration length in seconds (from VTT), passed from `calculateMetadata` so slide padding matches duration. */
  narrationEndSec?: number;
  /** When true, each slide shows a corner range aligned with narration / captions (main segment t=0). */
  showSlideNarrationTime?: boolean;
};

const StaggeredSegments: React.FC<{
  segments: PptSegment[];
  durationInFrames: number;
  /** Heading lines (# / intro title); default slate-900 */
  headingColor?: string;
  /** Non-heading lines; default slate-600 */
  bodyColor?: string;
  /** When true, heading uses same size/weight as body (e.g. cover title vs subtitle). */
  headingMatchBodyTypography?: boolean;
  /** Shown in corner; seconds from main-segment start (same origin as TTS / burn-in captions). */
  narrationTimeLabel?: string;
}> = ({
  segments,
  durationInFrames,
  headingColor = "#0f172a",
  bodyColor = "#334155",
  headingMatchBodyTypography = false,
  narrationTimeLabel,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const t = DEFAULT_PPT_TIMING;
    const staggerFrames = Math.max(1, Math.round(t.lineStaggerSeconds * fps));
    const slideFadeIn = t.slideFadeInFrames;
    const lineFadeIn = t.lineFadeInFrames;
    const slideFadeOut = t.slideFadeOutFrames;

    const shellOpacity =
      interpolate(
        frame,
        [0, slideFadeIn],
        [0, 1],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.inOut(Easing.quad),
        },
      ) *
      interpolate(
        frame,
        [durationInFrames - slideFadeOut, durationInFrames],
        [1, 0],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.inOut(Easing.quad),
        },
      );

    return (
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: 72,
          fontFamily: SLIDE_FONT_FAMILY,
        }}
      >
        {narrationTimeLabel ? (
          <div
            style={{
              position: "absolute",
              top: 28,
              right: 36,
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: 0.02,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              color: "rgba(15, 23, 42, 0.45)",
              pointerEvents: "none",
              zIndex: 5,
            }}
            title="相对口播起点（与 TTS / 字幕时间轴一致）"
          >
            {narrationTimeLabel}
          </div>
        ) : null}
        <div
          style={{
            maxWidth: PPT_DECK_MAX_CONTENT_WIDTH_PX,
            width: "100%",
          }}
        >
          {segments.map((seg, i) => {
            const from = i * staggerFrames;
            const lineOp = interpolate(
              frame - from,
              [0, lineFadeIn],
              [0, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.out(Easing.quad),
              },
            );
            const opacity = shellOpacity * lineOp;
            const bodySize = 40;
            const bodyWeight = 400;
            const headingSize = headingMatchBodyTypography ? bodySize : 62;
            const headingWeight = headingMatchBodyTypography ? bodyWeight : 700;
            return (
              <div
                key={`${i}-${seg.text.slice(0, 24)}`}
                style={{
                  marginBottom:
                    seg.isHeading && !headingMatchBodyTypography ? 32 : 20,
                  opacity,
                }}
              >
                <div
                  style={{
                    fontSize: seg.isHeading ? headingSize : bodySize,
                    fontWeight: seg.isHeading ? headingWeight : bodyWeight,
                    lineHeight: 1.35,
                    color: seg.isHeading ? headingColor : bodyColor,
                    textAlign: "center",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {seg.text}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    );
  };

export const PPTDeck: React.FC<PPTDeckProps> = ({
  deck,
  narrationEndSec,
  showSlideNarrationTime = false,
}) => {
  const { fps } = useVideoConfig();
  const coverFrames = computePPTDeckCoverFrames(fps);
  const introFrames = computePPTDeckIntroFrames(fps);
  const logoFrames = computePPTDeckWrapperFramesAfter(fps);
  const wrapperBefore = computePPTDeckWrapperFramesBefore(fps);
  const mainFrames = computePPTDeckMainContentFrames(
    deck,
    fps,
    DEFAULT_PPT_TIMING,
    narrationEndSec,
  );
  const vttSynced =
    deck.slideStartSec != null &&
    deck.slideStartSec.length === deck.slides.length &&
    narrationEndSec != null &&
    Number.isFinite(narrationEndSec) &&
    narrationEndSec > 0;
  const vttSlideFrames =
    vttSynced && deck.slideStartSec
      ? computeVttSyncedSlideDurationFrames(
        deck.slideStartSec,
        narrationEndSec,
        fps,
      )
      : null;
  const slidesSum = vttSlideFrames
    ? vttSlideFrames.reduce((a, b) => a + b, 0)
    : deck.slides.reduce(
      (sum, s) => sum + computeSlideDurationFrames(s, fps, DEFAULT_PPT_TIMING),
      0,
    );
  const padFrames = Math.max(0, mainFrames - slidesSum);
  const hasNarration =
    Boolean(deck.narrationVtt?.trim()) ||
    Boolean(deck.narrationVttFile?.trim());

  return (
    <AbsoluteFill style={{ backgroundColor: "#f8fafc" }}>
      <Series>
        <Series.Sequence durationInFrames={coverFrames} premountFor={fps}>
          <Cover contentTitle={deck.title} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={introFrames} premountFor={fps}>
          <Intro title={deck.title} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={mainFrames} premountFor={fps}>
          <AbsoluteFill style={{ backgroundColor: "#f8fafc" }}>
            <PptSlideBackground />
            <Series>
              {(() => {
                let cumFrames = 0;
                return deck.slides.map((slide, idx) => {
                  const d =
                    vttSlideFrames != null
                      ? vttSlideFrames[idx]!
                      : computeSlideDurationFrames(
                        slide,
                        fps,
                        DEFAULT_PPT_TIMING,
                      );
                  let startSec: number;
                  let endSec: number;
                  if (
                    vttSlideFrames != null &&
                    deck.slideStartSec != null
                  ) {
                    startSec = deck.slideStartSec[idx]!;
                    endSec =
                      idx + 1 < deck.slideStartSec.length
                        ? deck.slideStartSec[idx + 1]!
                        : narrationEndSec ?? startSec;
                  } else {
                    startSec = cumFrames / fps;
                    endSec = (cumFrames + d) / fps;
                    cumFrames += d;
                  }
                  const narrationTimeLabel = showSlideNarrationTime
                    ? formatNarrationRange(startSec, endSec)
                    : undefined;
                  return (
                    <Series.Sequence
                      key={`slide-${idx}`}
                      durationInFrames={d}
                      premountFor={fps}
                    >
                      <StaggeredSegments
                        segments={parseSlideSegments(slide)}
                        durationInFrames={d}
                        narrationTimeLabel={narrationTimeLabel}
                      />
                    </Series.Sequence>
                  );
                });
              })()}
              {padFrames > 0 ? (
                <Series.Sequence durationInFrames={padFrames}>
                  <AbsoluteFill style={{ backgroundColor: "#f8fafc" }}>
                    <PptSlideBackground />
                  </AbsoluteFill>
                </Series.Sequence>
              ) : null}
            </Series>
            <Sequence durationInFrames={mainFrames}>
              <Html5Audio
                src={staticFile(REMOTION_PATHS.TTS_AUDIO)}
                volume={1}
                name="TTS Narration"
              />
            </Sequence>
            <Sequence durationInFrames={mainFrames}>
              <PPTDeckBgm durationInFrames={mainFrames} />
            </Sequence>
            <PPTDeckTrademark />
          </AbsoluteFill>
        </Series.Sequence>
        <Series.Sequence durationInFrames={logoFrames} premountFor={fps}>
          <AbsoluteFill className="bg-white">
            <Html5Audio
              src={staticFile(REMOTION_PATHS.AUDIO_INTRO)}
              volume={0.6}
              name="Logo Sound"
            />
            <TitleSequence />
          </AbsoluteFill>
        </Series.Sequence>
      </Series>
      {hasNarration ? (
        <Sequence from={wrapperBefore} durationInFrames={mainFrames}>
          <Content
            captionVttInline={deck.narrationVtt?.trim() || undefined}
            captionVttFile={
              deck.narrationVttFile?.trim() || REMOTION_PATHS.TTS_VTT
            }
            includeTtsAudio={false}
            includeBgm={false}
            includeWatermark={false}
            captionLayout="bottom"
            captionFontScale={0.4}
            captionFillColor="#64748b"
            captionStrokeColor="#f1f5f9"
            captionMaxWidthPx={PPT_DECK_MAX_CONTENT_WIDTH_PX}
          />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
