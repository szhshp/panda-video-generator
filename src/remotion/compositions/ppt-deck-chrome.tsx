/**
 * Shared PPT-Deck visuals: canvas tokens, geometric backdrop, top-left lockup.
 */
import React from "react";
import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/fonts";
import { defaultMyCompProps } from "../../../types/constants";
import { REMOTION_PATHS } from "../../../types/paths";

export const PPT_SLIDE_FONT_FAMILY = "dingliesongtypeface";

loadFont({
  family: PPT_SLIDE_FONT_FAMILY,
  url: staticFile("fonts/dingliesongtypeface.ttf"),
}).catch((err) => {
  console.error("Failed to load PPT deck font:", err);
});

export const PPT_DECK_CANVAS_BG = "#020617";

export const PPT_SLIDE_TEXT_SHADOW =
  "0 1px 2px rgba(0, 0, 0, 0.9), 0 0 32px rgba(0, 0, 0, 0.4)";

export type PptDeckGeometricBackdropProps = {
  /** Unique SVG gradient id prefix when multiple instances could mount together. */
  svgIdPrefix?: string;
};

/**
 * PPT-style layered backdrop: dark left reading band + diagonal slices on the right.
 */
export const PptDeckGeometricBackdrop: React.FC<PptDeckGeometricBackdropProps> = ({
  svgIdPrefix = "ppt-deck-backdrop",
}) => {
  const { width, height } = useVideoConfig();
  const w = Math.max(1, width);
  const h = Math.max(1, height);
  const uid = svgIdPrefix;

  return (
    <AbsoluteFill
      style={{
        zIndex: 0,
        pointerEvents: "none",
        backgroundColor: "#020617",
      }}
    >
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
      >
        <defs>
          <linearGradient
            id={`${uid}-base`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#020617" />
            <stop offset="45%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>
          <linearGradient
            id={`${uid}-slice-a`}
            x1="100%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.5" />
            <stop offset="55%" stopColor="#2563eb" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#0c4a6e" stopOpacity="0.12" />
          </linearGradient>
          <linearGradient id={`${uid}-slice-b`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.18" />
          </linearGradient>
        </defs>
        <rect width={w} height={h} fill={`url(#${uid}-base)`} />
        <polygon
          points={`${w * 0.4},0 ${w},0 ${w},${h} ${w * 0.14},${h}`}
          fill={`url(#${uid}-slice-a)`}
        />
        <polygon
          points={`${w * 0.55},0 ${w * 0.72},0 ${w * 0.38},${h} ${w * 0.2},${h}`}
          fill={`url(#${uid}-slice-b)`}
        />
        <line
          x1={w * 0.4}
          y1={0}
          x2={w * 0.14}
          y2={h}
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={Math.max(1, w * 0.001)}
        />
      </svg>
    </AbsoluteFill>
  );
};

/**
 * Top-left lockup: muted logo + product title (matches legacy Cover corner row).
 */
export const PptDeckCornerLockup: React.FC = () => {
  const { width, height } = useVideoConfig();
  const logoSize = Math.min(width, height) * 0.1;
  const iconPx = logoSize / 2;

  return (
    <div
      style={{
        position: "absolute",
        top: 28,
        left: 10,
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
          fontFamily: PPT_SLIDE_FONT_FAMILY,
          fontSize: 38,
          fontWeight: "bold",
          lineHeight: 1.2,
          color: "#f1f5f9",
        }}
      >
        {defaultMyCompProps.title}
      </h2>
    </div>
  );
};
