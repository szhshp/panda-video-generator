/**
 * Shared PPT-Deck visuals: canvas tokens, geometric backdrop, top-left lockup.
 */
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
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
  /**
   * Global composition frame where this stage’s drift timeline starts at 0 (e.g. main segment: first frame after cover).
   * Omit for opening cover / standalone use — uses composition frame from 0.
   */
  sequenceFrom?: number;
};

/**
 * PPT-style layered backdrop: dark left reading band + diagonal slices on the right.
 */
export const PptDeckGeometricBackdrop: React.FC<PptDeckGeometricBackdropProps> = ({
  svgIdPrefix = "ppt-deck-backdrop",
  sequenceFrom = 0,
}) => {
  const globalFrame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const w = Math.max(1, width);
  const h = Math.max(1, height);
  const uid = svgIdPrefix;

  // Background layers drift along 3 axis directions (120° apart). Base cycle ~5s at speed 1.
  const DRIFT_SPEED = 0.3;
  const LOOP_FRAMES = Math.max(
    48,
    Math.round((fps * 5) / DRIFT_SPEED),
  );
  const phaseFrame = Math.max(0, globalFrame - sequenceFrom);
  const u = ((phaseFrame % LOOP_FRAMES) / LOOP_FRAMES) * Math.PI * 2;
  /** Larger = more travel per layer; cycle length unchanged (`DRIFT_SPEED`). */
  const ampFrac = 0.036;
  const m = Math.min(w, h);
  const amp = m * ampFrac;
  const s3 = Math.sqrt(3) / 2;
  /** Unit vectors ~120° apart — each layer slides on its own axis. */
  const driftDirs = [
    { x: 1, y: 0 },
    { x: -0.5, y: s3 },
    { x: -0.5, y: -s3 },
  ] as const;
  const drift = (i: number) => {
    const k = Math.sin(u + (i * 2 * Math.PI) / 3);
    const { x, y } = driftDirs[i]!;
    return { tx: x * amp * k, ty: y * amp * k };
  };
  const d0 = drift(0);
  const d1 = drift(1);
  const d2 = drift(2);

  /** Scale up with amplitude so clips stay flush when displacement is larger. */
  const coverScale = Math.max(1.045, 1 + (2.35 * amp) / m);
  const cx = w / 2;
  const cy = h / 2;
  const coverT = (tx: number, ty: number) =>
    `translate(${cx},${cy}) translate(${tx},${ty}) scale(${coverScale}) translate(${-cx},${-cy})`;

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
          <clipPath id={`${uid}-viewport`}>
            <rect x={0} y={0} width={w} height={h} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${uid}-viewport)`}>
          <g transform={coverT(d0.tx, d0.ty)}>
            <rect width={w} height={h} fill={`url(#${uid}-base)`} />
          </g>
          <g transform={coverT(d1.tx, d1.ty)}>
            <polygon
              points={`${w * 0.4},0 ${w},0 ${w},${h} ${w * 0.14},${h}`}
              fill={`url(#${uid}-slice-a)`}
            />
            <line
              x1={w * 0.4}
              y1={0}
              x2={w * 0.14}
              y2={h}
              stroke="rgba(255,255,255,0.07)"
              strokeWidth={Math.max(1, w * 0.001)}
            />
          </g>
          <g transform={coverT(d2.tx, d2.ty)}>
            <polygon
              points={`${w * 0.55},0 ${w * 0.72},0 ${w * 0.38},${h} ${w * 0.2},${h}`}
              fill={`url(#${uid}-slice-b)`}
            />
          </g>
        </g>
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
