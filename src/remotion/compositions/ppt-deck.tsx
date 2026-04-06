/**
 * `PPT-Deck` composition module. File name is kebab-case so the path is unique on case-insensitive volumes
 * (avoids editor/tsserver confusion after PascalCase vs mixed-case renames).
 */
import React from "react";
import {
  AbsoluteFill,
  Easing,
  Html5Audio,
  interpolate,
  Sequence,
  Series,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  computePPTDeckCoverFrames,
  computePPTDeckMainContentFrames,
  computeVttSyncedSlideDurationFrames,
  computePPTDeckWrapperFramesAfter,
  computePPTDeckWrapperFramesBefore,
  computeSlideDurationFrames,
  type PptSlidePage,
  type SlideDeck,
  DEFAULT_PPT_TIMING,
  PPT_DECK_MAX_CONTENT_WIDTH_PX,
} from "../../../types/ppt";
import { REMOTION_PATHS } from "../../../types/paths";
import { TitleSequence } from "./Intro";
import { Content } from "./Content";
import { PptDeckCover } from "./ppt-deck-cover";
import {
  PPT_DECK_CANVAS_BG,
  PPT_SLIDE_FONT_FAMILY,
  PPT_SLIDE_TEXT_SHADOW,
  PptDeckCornerLockup,
  PptDeckGeometricBackdrop,
} from "./ppt-deck-chrome";

const BGM_STATIC = "bgm/0.mp3";

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

/** Strip leading list markers so bullets render with a single `•`. */
function stripBulletPrefix(text: string): string {
  return text.replace(/^[-*•]\s+/, "").trim();
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

const PptSlideDeckLayout: React.FC<{
  slide: PptSlidePage;
  durationInFrames: number;
  /** Main title color */
  titleColor?: string;
  /** Subtitle + bullet body color */
  bodyColor?: string;
  /** Shown in corner; seconds from main-segment start (same origin as TTS / burn-in captions). */
  narrationTimeLabel?: string;
}> = ({
  slide,
  durationInFrames,
  titleColor = "#f1f5f9",
  bodyColor = "#94a3b8",
  narrationTimeLabel,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const t = DEFAULT_PPT_TIMING;
    const staggerFrames = Math.max(1, Math.round(t.lineStaggerSeconds * fps));
    const slideFadeIn = t.slideFadeInFrames;
    const lineFadeIn = t.lineFadeInFrames;
    const slideFadeOut = t.slideFadeOutFrames;
    const title = slide.title.trim();
    const subtitle = slide.subtitle.trim() || undefined;
    const bullets = slide.items.map((item) => stripBulletPrefix(item));
    const baseBulletLine = subtitle ? 2 : 1;

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

    const lineRevealOpacity = (lineIndex: number) => {
      const from = lineIndex * staggerFrames;
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
      return shellOpacity * lineOp;
    };

    const titleSize = 56;
    const subtitleSize = 24;
    const bulletSize = 30;
    const bulletGap = 14;

    return (
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "96px 96px 72px 96px",
          fontFamily: PPT_SLIDE_FONT_FAMILY,
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
              color: "rgba(241, 245, 249, 0.5)",
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
            textAlign: "left",
          }}
        >
          {title ? (
            <div
              style={{
                marginBottom: subtitle ? 10 : bullets.length ? 28 : 0,
                opacity: lineRevealOpacity(0),
              }}
            >
              <div
                style={{
                  fontSize: titleSize,
                  fontWeight: 700,
                  lineHeight: 1.15,
                  color: titleColor,
                  letterSpacing: -0.02,
                  whiteSpace: "pre-wrap",
                  textShadow: PPT_SLIDE_TEXT_SHADOW,
                }}
              >
                {title}
              </div>
            </div>
          ) : null}
          {subtitle ? (
            <div
              style={{
                marginBottom: bullets.length ? 36 : 0,
                opacity: lineRevealOpacity(1),
              }}
            >
              <div
                style={{
                  fontSize: subtitleSize,
                  fontWeight: 500,
                  lineHeight: 1.4,
                  color: bodyColor,
                  whiteSpace: "pre-wrap",
                  textShadow: PPT_SLIDE_TEXT_SHADOW,
                }}
              >
                {subtitle}
              </div>
            </div>
          ) : null}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: bulletGap,
            }}
          >
            {bullets.map((b, i) => {
              const lineIndex = baseBulletLine + i;
              return (
                <div
                  key={`${lineIndex}-${b.slice(0, 32)}`}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 14,
                    opacity: lineRevealOpacity(lineIndex),
                  }}
                >
                  <span
                    style={{
                      fontSize: bulletSize,
                      lineHeight: 1.45,
                      color: bodyColor,
                      flexShrink: 0,
                      marginTop: 2,
                      textShadow: PPT_SLIDE_TEXT_SHADOW,
                    }}
                    aria-hidden
                  >
                    •
                  </span>
                  <div
                    style={{
                      fontSize: bulletSize,
                      fontWeight: 400,
                      lineHeight: 1.45,
                      color: bodyColor,
                      whiteSpace: "pre-wrap",
                      flex: 1,
                      textShadow: PPT_SLIDE_TEXT_SHADOW,
                    }}
                  >
                    {b}
                  </div>
                </div>
              );
            })}
          </div>
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
    <AbsoluteFill style={{ backgroundColor: PPT_DECK_CANVAS_BG }}>
      <Series>
        <Series.Sequence durationInFrames={coverFrames} premountFor={fps}>
          <PptDeckCover
            title={deck.title}
            subtitle={deck.subtitle.trim() || undefined}
          />
        </Series.Sequence>
        <Series.Sequence durationInFrames={mainFrames} premountFor={fps}>
          <AbsoluteFill style={{ backgroundColor: PPT_DECK_CANVAS_BG }}>
            <PptDeckGeometricBackdrop sequenceFrom={coverFrames} />
            <AbsoluteFill style={{ zIndex: 1 }}>
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
                        <PptSlideDeckLayout
                          slide={slide}
                          durationInFrames={d}
                          narrationTimeLabel={narrationTimeLabel}
                        />
                      </Series.Sequence>
                    );
                  });
                })()}
                {padFrames > 0 ? (
                  <Series.Sequence durationInFrames={padFrames}>
                    <AbsoluteFill style={{ zIndex: 1 }}>
                      <PptDeckGeometricBackdrop
                        svgIdPrefix="ppt-deck-pad-bg"
                        sequenceFrom={coverFrames}
                      />
                    </AbsoluteFill>
                  </Series.Sequence>
                ) : null}
              </Series>
            </AbsoluteFill>
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
            <PptDeckCornerLockup />
          </AbsoluteFill>
        </Series.Sequence>
        <Series.Sequence durationInFrames={logoFrames} premountFor={fps}>
          <AbsoluteFill style={{ backgroundColor: PPT_DECK_CANVAS_BG }}>
            <Html5Audio
              src={staticFile(REMOTION_PATHS.AUDIO_INTRO)}
              volume={0.6}
              name="Logo Sound"
            />
            <TitleSequence endCardOnDark />
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
            captionFillColor="#93c5fd"
            captionStrokeColor="#0f172a"
            captionMaxWidthPx={PPT_DECK_MAX_CONTENT_WIDTH_PX}
          />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
