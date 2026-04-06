import { z } from "zod";
import {
  AbsoluteFill,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  staticFile,
  useDelayRender,
  Html5Audio,
} from "remotion";
import { CompositionProps } from "../../../types/constants";
import { REMOTION_PATHS } from "../../../types/paths";
import { Logo } from "./Logo";
import { loadFont } from "@remotion/fonts";
import { Rings } from "./Rings";
import { useState, useEffect, useCallback } from "react";
import { WatermarkText } from "./WatermarkText";
import { REMOTION_SANS_FONT_FAMILY } from "../sans-font-family";

const fontFamily = REMOTION_SANS_FONT_FAMILY;

// Load custom font for first title
loadFont({
  family: "dingliesongtypeface",
  url: staticFile("fonts/dingliesongtypeface.ttf"),
}).catch((err) => {
  console.error('Failed to load font:', err);
});

// TitleSequence component with logo - exported for use at the end of video
export const TitleSequence: React.FC<{ endCardOnDark?: boolean }> = ({
  endCardOnDark = false,
}) => {
  const sequenceFrame = useCurrentFrame(); // Relative frame within Sequence
  const { fps } = useVideoConfig();

  const transitionStart = 1 * fps; // Start transition after 1 second
  const transitionDuration = 0.5 * fps; // Transition duration 0.5 seconds
  const sequenceDuration = 4 * fps; // Total: 4 seconds (extended for longer logo display)

  // Fixed text for h2 between logo
  const fixedTitle = "熊猫智研社";

  // Logo scale animation: from small (0.2) to normal size (1.0)
  // Animation duration: first 0.8 seconds, then stay at normal size
  const logoScaleDuration = 0.8 * fps;
  const logoScale = interpolate(
    sequenceFrame,
    [0, logoScaleDuration],
    [0.2, 1.0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // Title animation: fade in and move from top to bottom
  const titleFadeInDuration = 0.5 * fps;
  const titleStartDelay = logoScaleDuration; // Start after logo finishes scaling
  const titleFadeInStart = titleStartDelay;
  const titleFadeInEnd = titleStartDelay + titleFadeInDuration;

  const titleFadeInOpacity = interpolate(
    sequenceFrame,
    [titleFadeInStart, titleFadeInEnd],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const titleMoveY = interpolate(
    sequenceFrame,
    [titleFadeInStart, titleFadeInEnd],
    [-50, 0], // Move from -50px (above) to 0 (final position)
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // Fade out all content at the end
  const fadeOutDuration = 0.5 * fps;
  const fadeOutStart = sequenceDuration - fadeOutDuration;
  const overallOpacity = interpolate(
    sequenceFrame,
    [fadeOutStart, sequenceDuration - 1],
    [1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // Rings animation (keep the original outProgress for rings)
  const logoOut = spring({
    fps,
    frame: sequenceFrame,
    config: {
      damping: 200,
    },
    durationInFrames: transitionDuration,
    delay: transitionStart,
  });

  return (
    <div style={{ opacity: overallOpacity }}>
      <Rings outProgress={logoOut}></Rings>
      <AbsoluteFill className="justify-center items-center" style={{ flexDirection: 'column' }}>
        <Logo scale={logoScale}></Logo>
        <div
          style={{
            opacity: titleFadeInOpacity,
            transform: `translateY(${titleMoveY}px)`,
          }}
        >
          <h4
            className="text-[70px] font-bold"
            style={{
              fontFamily,
              width: '80%',
              maxWidth: '80%',
              whiteSpace: 'nowrap',
              textAlign: 'center',
              marginTop: '40px',
              color: endCardOnDark ? '#f1f5f9' : '#000000',
            }}
          >
            {fixedTitle}
          </h4>
        </div>
      </AbsoluteFill>
      <WatermarkText style={endCardOnDark ? 'content' : 'cover'} />
    </div>
  );
};

export const Intro = ({ title }: z.infer<typeof CompositionProps>) => {
  const { fps } = useVideoConfig();
  const [jsonTitle, setJsonTitle] = useState<string | null>(null);
  const [titleLoaded, setTitleLoaded] = useState(false);
  const { delayRender, continueRender } = useDelayRender();
  const [handle] = useState(() => delayRender());

  // Always load title from title.json (must be in public/video/title.json)
  // This ensures we always use the latest title from the file system
  const fetchTitleFromJson = useCallback(async () => {
    try {
      // Use staticFile to access files in public directory
      const response = await fetch(staticFile(REMOTION_PATHS.VIDEO_TITLE_JSON));
      if (!response.ok) {
        console.warn(`title.json not found at ${REMOTION_PATHS.VIDEO_TITLE_JSON}, using prop title as fallback`);
        setTitleLoaded(true);
        return;
      }
      const data = await response.json();
      if (data.title) {
        setJsonTitle(data.title);
        console.log('Loaded title from title.json:', data.title);
      } else {
        console.warn('title.json exists but has no title field, using prop title as fallback');
      }
      setTitleLoaded(true);
    } catch (e) {
      console.error('Failed to load title.json:', e);
      setTitleLoaded(true); // Still continue even if failed
    }
  }, []);

  useEffect(() => {
    fetchTitleFromJson();
  }, [fetchTitleFromJson]);

  useEffect(() => {
    if (titleLoaded) {
      continueRender(handle);
    }
  }, [titleLoaded, continueRender, handle]);

  const thirdTitleDuration = 3.5 * fps; // First title: 2s typewriter + 1s hold + 0.5s fade = 3.5s total

  // First title component with typewriter effect
  const FirstTitle: React.FC<{ title: string }> = ({ title }) => {
    const sequenceFrame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Typewriter effect: finish within 2 seconds
    const typewriterDuration = 2 * fps; // 2 seconds for typing
    const typewriterSpeed = title.length / 2; // Characters per second (dynamic based on title length)
    const charactersPerFrame = typewriterSpeed / fps;
    const visibleCharacters = Math.min(
      Math.floor(sequenceFrame * charactersPerFrame),
      title.length
    );
    const displayText = title.slice(0, visibleCharacters);
    const isTypingComplete = sequenceFrame >= typewriterDuration;

    // Cursor blink animation (only show while typing, within first 2 seconds)
    const cursorBlinkSpeed = 2; // Blinks per second
    const cursorOpacity = sequenceFrame < typewriterDuration && !isTypingComplete
      ? interpolate(
        sequenceFrame % (fps / cursorBlinkSpeed),
        [0, fps / cursorBlinkSpeed / 2, fps / cursorBlinkSpeed],
        [1, 1, 0],
        {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }
      )
      : 0;

    // Fade out in the last 0.5 seconds (from 3s to 3.5s)
    const fadeOutDuration = 0.5 * fps;
    const fadeOutStart = thirdTitleDuration - fadeOutDuration; // Start fade at 3 seconds

    const opacity = interpolate(
      sequenceFrame,
      [fadeOutStart, thirdTitleDuration - 1],
      [1, 0],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      }
    );

    return (
      <AbsoluteFill className="justify-center items-center">
        <h1
          className="text-[70px] font-bold"
          style={{
            fontFamily: "dingliesongtypeface",
            width: '80%',
            maxWidth: '80%',
            textAlign: 'center',
            padding: '0 40px',
            opacity,
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            whiteSpace: 'pre-line',
          }}
        >
          {displayText}
          {!isTypingComplete && (
            <span
              style={{
                opacity: cursorOpacity,
                marginLeft: '4px',
                fontWeight: 'bold',
              }}
            >
              |
            </span>
          )}
        </h1>
      </AbsoluteFill>
    );
  };

  return (
    <AbsoluteFill className="bg-white">
      {/* Third title sequence - now first */}
      {/* Use jsonTitle from file for first title, fallback to prop title */}
      <Sequence durationInFrames={thirdTitleDuration}>
        {/* Typewriter sound effect */}
        <Html5Audio
          src={staticFile(REMOTION_PATHS.AUDIO_INTRO_TYPEWRITER)}
          volume={0.6}
          name="Typewriter Sound"
        />
        {(jsonTitle || title) && <FirstTitle title={jsonTitle || title || ''} />}
      </Sequence>
    </AbsoluteFill>
  );
};
