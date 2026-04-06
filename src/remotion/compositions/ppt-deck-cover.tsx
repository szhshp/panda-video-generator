/**
 * PPT-Deck opening: same visual language as the former motion intro (geometric bg + accent bar + titles), held static — no raster image.
 */
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import {
  PPT_DECK_CANVAS_BG,
  PPT_SLIDE_FONT_FAMILY,
  PPT_SLIDE_TEXT_SHADOW,
  PptDeckCornerLockup,
  PptDeckGeometricBackdrop,
} from "./ppt-deck-chrome";

export type PptDeckCoverProps = {
  title: string;
  subtitle?: string;
};

export const PptDeckCover: React.FC<PptDeckCoverProps> = ({
  title,
  subtitle,
}) => {
  const { width, height } = useVideoConfig();
  const sub = subtitle?.trim();
  const minDim = Math.min(width, height);
  /** As large as practical without routine clipping on 720p; scales with resolution. */
  const titleSize = Math.max(
    44,
    Math.min(
      Math.round(minDim * 0.155),
      Math.round(width * 0.1),
      132,
    ),
  );
  const subtitleSize = Math.min(
    Math.max(Math.round(titleSize * 0.44), 22),
    52,
  );
  const accentW = Math.max(6, Math.round(titleSize * 0.072));
  const rowGap = Math.round(12 + titleSize * 0.08);

  return (
    <AbsoluteFill style={{ backgroundColor: PPT_DECK_CANVAS_BG }}>
      <PptDeckGeometricBackdrop svgIdPrefix="ppt-deck-cover-bg" />
      <AbsoluteFill
        style={{
          zIndex: 1,
          justifyContent: "center",
          alignItems: "flex-start",
          padding: `${Math.round(minDim * 0.09)}px ${Math.round(minDim * 0.065)}px ${Math.round(minDim * 0.06)}px ${Math.round(minDim * 0.065)}px`,
          fontFamily: PPT_SLIDE_FONT_FAMILY,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: width - Math.round(minDim * 0.13) * 2,
            display: "flex",
            flexDirection: "row",
            alignItems: "stretch",
            gap: rowGap,
          }}
        >
          <div
            style={{
              width: accentW,
              flexShrink: 0,
              borderRadius: 3,
              background:
                "linear-gradient(180deg, #7dd3fc 0%, #2563eb 55%, #1d4ed8 100%)",
              opacity: 1,
              boxShadow: "0 0 20px rgba(56, 189, 248, 0.35)",
            }}
            aria-hidden
          />
          <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
            <div
              style={{
                fontSize: titleSize,
                fontWeight: 700,
                lineHeight: 1.08,
                color: "#f8fafc",
                letterSpacing: -0.03,
                whiteSpace: "pre-wrap",
                textShadow: PPT_SLIDE_TEXT_SHADOW,
              }}
            >
              {title}
            </div>
            {sub ? (
              <div
                style={{
                  marginTop: Math.round(10 + titleSize * 0.12),
                  fontSize: subtitleSize,
                  fontWeight: 500,
                  lineHeight: 1.35,
                  color: "#94a3b8",
                  whiteSpace: "pre-wrap",
                  textShadow: PPT_SLIDE_TEXT_SHADOW,
                }}
              >
                {sub}
              </div>
            ) : null}
          </div>
        </div>
      </AbsoluteFill>
      <PptDeckCornerLockup />
    </AbsoluteFill>
  );
};
