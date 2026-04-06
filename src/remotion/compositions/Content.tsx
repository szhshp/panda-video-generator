import React, { useState, useEffect, useCallback } from 'react';
import {
	AbsoluteFill,
	useCurrentFrame,
	useVideoConfig,
	staticFile,
	useDelayRender,
	Html5Audio,
	interpolate,
	spring,
} from 'remotion';
import { loadFont } from '@remotion/fonts';
import { REMOTION_PATHS } from '../../../types/paths';
import { parseVttToCaptions, type VttCaption } from '../vtt-captions';
import { WatermarkText } from './WatermarkText';

// Load custom font for captions
loadFont({
	family: 'dingliesongtypeface',
	url: staticFile('fonts/dingliesongtypeface.ttf'),
}).catch((err) => {
	console.error('Failed to load font:', err);
});

async function fetchVttText(primaryPath: string, fallbackPath: string): Promise<string> {
	for (const path of [primaryPath, fallbackPath]) {
		try {
			const response = await fetch(staticFile(path));
			if (!response.ok) continue;
			const text = await response.text();
			if (text.trim().startsWith('WEBVTT')) return text;
		} catch {
			continue;
		}
	}
	throw new Error(`Failed to load WebVTT from ${primaryPath} or ${fallbackPath}`);
}

const BGM_STATIC = 'bgm/0.mp3';

// BGM is versioned at public/bgm/0.mp3. Optional: `pnpm shuffle:bgm` before render.

interface ContentProps {
	audioFile?: string;
	/** On-screen captions; default TTS VTT (aligned with audio). Override e.g. SPIDER_CAPTIONS_VTT for estimate-only preview. Ignored when `captionVttInline` is set. */
	captionVttFile?: string;
	/** Raw WebVTT (e.g. from `title.json` `narrationVtt`). When set, no fetch for `captionVttFile`. */
	captionVttInline?: string;
	/** When false, omit TTS track (e.g. captions-only overlay on `PPT-Deck`). Default true. */
	includeTtsAudio?: boolean;
	/** When false, omit background music. Default true. */
	includeBgm?: boolean;
	/** When false, omit bottom watermark. Default true. */
	includeWatermark?: boolean;
	/** Caption placement; `PPT-Deck` uses `bottom` so slides stay readable. */
	captionLayout?: 'center' | 'bottom';
	/** Multiplier on base caption font size (e.g. 0.52 for smaller `PPT-Deck` burn-in). */
	captionFontScale?: number;
	/** Main caption text color (foreground layer). Default white for video-on-dark. */
	captionFillColor?: string;
	/** Stroke color for caption outline (`-webkit-text-stroke`). Default black for light text. */
	captionStrokeColor?: string;
	/** Max caption box width (px) when `captionLayout` is `bottom`. Default 960. */
	captionMaxWidthPx?: number;
}

export const Content: React.FC<ContentProps> = ({
	audioFile = REMOTION_PATHS.TTS_AUDIO,
	// TTS WebVTT matches audio.mp3; spider/captions.vtt is estimate-only (see types/paths.ts).
	captionVttFile = REMOTION_PATHS.TTS_VTT,
	captionVttInline,
	includeTtsAudio = true,
	includeBgm = true,
	includeWatermark = true,
	captionLayout = 'center',
	captionFontScale = 1,
	captionFillColor = '#FFFFFF',
	captionStrokeColor = '#000000',
	captionMaxWidthPx = 960,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const [captions, setCaptions] = useState<VttCaption[]>([]);
	const [vttLoaded, setVttLoaded] = useState(false);
	const { delayRender, continueRender, cancelRender } = useDelayRender();
	const [handle] = useState(() => delayRender());

	const fetchAndProcessVtt = useCallback(async () => {
		try {
			const inline = captionVttInline?.trim();
			if (inline) {
				if (!inline.startsWith('WEBVTT')) {
					throw new Error('Invalid WebVTT (captionVttInline)');
				}
				setCaptions(parseVttToCaptions(inline));
				setVttLoaded(true);
				return;
			}
			const fallback =
				captionVttFile === REMOTION_PATHS.TTS_VTT
					? REMOTION_PATHS.SPIDER_CAPTIONS_VTT
					: REMOTION_PATHS.TTS_VTT;
			const vttContent = await fetchVttText(captionVttFile, fallback);
			const parsedCaptions = parseVttToCaptions(vttContent);
			setCaptions(parsedCaptions);
			setVttLoaded(true);
		} catch (e) {
			console.error('Failed to load VTT file:', e);
			cancelRender(e);
		}
	}, [captionVttInline, captionVttFile, cancelRender]);

	useEffect(() => {
		fetchAndProcessVtt();
	}, [fetchAndProcessVtt]);

	// Continue render after VTT is loaded
	useEffect(() => {
		if (vttLoaded) {
			continueRender(handle);
		}
	}, [vttLoaded, continueRender, handle]);

	// Calculate current time in seconds
	// When used in Sequence, frame starts from 0, which is correct for captions
	const currentTimeMs = (frame / fps) * 1000;

	// Find current caption
	const currentCaption = captions.length > 0 ? captions.find(
		caption => currentTimeMs >= caption.startMs && currentTimeMs < caption.endMs
	) : null;

	// Calculate audio end time (last caption's end time)
	const audioEndMs = captions.length > 0
		? Math.max(...captions.map(c => c.endMs))
		: 0;

	// Calculate BGM fade out volume
	// Fade out starts 2 seconds before audio ends
	const fadeOutDurationMs = 2000; // 2 seconds fade out
	const fadeOutStartMs = audioEndMs - fadeOutDurationMs;
	// Duck BGM under TTS (0–1). Lower = quieter bed; fade-out still scales from this base.
	const bgmBaseVolume = 0.15;

	let bgmVolume = bgmBaseVolume;
	if (
		includeBgm &&
		audioEndMs > 0 &&
		currentTimeMs >= fadeOutStartMs
	) {
		// Fade out from bgmBaseVolume to 0 over fadeOutDurationMs
		const fadeOutProgress = (currentTimeMs - fadeOutStartMs) / fadeOutDurationMs;
		bgmVolume = interpolate(
			fadeOutProgress,
			[0, 1],
			[bgmBaseVolume, 0],
			{
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			}
		);
	}

	// Calculate caption font size based on text length
	const calculateCaptionFontSize = (text: string): number => {
		// Count characters (excluding spaces and newlines for calculation)
		const charCount = text.replace(/\s/g, '').length;

		// If more than 50 characters, use smaller font size
		const base = charCount > 50 ? 52 : 80;
		return Math.round(base * captionFontScale);
	};

	const captionBottom = captionLayout === 'bottom';
	const strokePx = Math.max(2, Math.round(6 * captionFontScale));

	// Dancing lines animation - slow, smooth movement
	// const lineSpeed = 0.05; // Very slow movement speed
	// const lineOffset1 = frame * lineSpeed;
	// const lineOffset2 = frame * lineSpeed * 0.7; // Different speed for variety
	// const lineOffset3 = frame * lineSpeed * 1.3;

	// Wave amplitude and frequency for dancing effect
	// const waveAmplitude = 50; // Increased amplitude for better visibility
	// const waveFrequency = 0.015; // Slightly lower frequency for smoother waves

	// Generate dancing line paths using SVG
	// const generateWavePath = (offset: number, amplitude: number, frequency: number, yPosition: number) => {
	// 	const points: string[] = [];
	// 	const width = 1920; // Video width
	// 	const steps = 100;

	// 	for (let i = 0; i <= steps; i++) {
	// 		const x = (i / steps) * width;
	// 		const y = yPosition + Math.sin((x * frequency) + offset) * amplitude;
	// 		points.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
	// 	}

	// 	return points.join(' ');
	// };

	// Calculate animation for current caption (gather effect)
	let scale = 1;
	let opacity = 1;
	let translateX = 0;
	let letterSpacing = 0;

	if (currentCaption) {
		const captionStartMs = currentCaption.startMs;
		const captionDurationMs = currentCaption.endMs - captionStartMs;
		const animationDurationMs = Math.min(500, captionDurationMs * 0.3); // Animation takes 500ms or 30% of caption duration
		const timeSinceStart = currentTimeMs - captionStartMs;

		if (timeSinceStart >= 0 && timeSinceStart < animationDurationMs) {
			// Calculate relative frame for this caption's animation
			const relativeFrame = Math.floor((timeSinceStart / 1000) * fps);
			const animationDurationFrames = Math.ceil((animationDurationMs / 1000) * fps);

			// Spring animation for smooth gather effect
			const springProgress = spring({
				fps,
				frame: relativeFrame,
				config: {
					damping: 200,
				},
				durationInFrames: animationDurationFrames,
			});

			// Scale: start from 1.2, end at 1.0 (zoom in effect)
			// Keep container width fixed, only scale visually
			scale = interpolate(springProgress, [0, 1], [1.2, 1], {
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			});

			// Opacity: start from 0, end at 1
			opacity = interpolate(springProgress, [0, 1], [0, 1], {
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			});

			// Horizontal gather: start from spread out, end at center (tighter on bottom layout)
			const gatherPx = captionBottom ? 48 : 100;
			translateX = interpolate(springProgress, [0, 1], [gatherPx, 0], {
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			});

			// Letter spacing: start from spread out, end at normal (gather effect)
			letterSpacing = interpolate(springProgress, [0, 1], [8, 0], {
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			});
		}
	}

	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'transparent',
				pointerEvents: 'none',
			}}
		>
			{/* Audio track */}
			{includeTtsAudio ? (
				<Html5Audio
					src={staticFile(audioFile)}
					volume={1}
					name="TTS Audio"
				/>
			) : null}

			{/* Background music */}
			{includeBgm ? (
				<Html5Audio
					src={staticFile(BGM_STATIC)}
					volume={bgmVolume}
					loop
					name="Background Music"
				/>
			) : null}

			{/* Dancing lines - slow animated background decoration */}
			{/* <svg
			style={{
				position: 'absolute',
				top: 0,
				left: 0,
				width: '100%',
				height: '100%',
				pointerEvents: 'none',
				zIndex: 1,
			}}
		> */}
			{/* Top dancing line */}
			{/* <path
				d={generateWavePath(lineOffset1, waveAmplitude, waveFrequency, 200)}
				stroke="rgba(0, 0, 0, 0.05)"
				strokeWidth="5"
				fill="none"
				strokeLinecap="round"
			/> */}
			{/* Middle dancing line */}
			{/* <path
				d={generateWavePath(lineOffset2, waveAmplitude * 0.8, waveFrequency * 1.2, 540)}
				stroke="rgba(0, 0, 0, 0.05)"
				strokeWidth="4.5"
				fill="none"
				strokeLinecap="round"
			/> */}
			{/* Bottom dancing line */}
			{/* <path
				d={generateWavePath(lineOffset3, waveAmplitude * 1.2, waveFrequency * 0.8, 880)}
				stroke="rgba(0, 0, 0, 0.05)"
				strokeWidth="4"
				fill="none"
				strokeLinecap="round"
			/> */}
			{/* Additional subtle lines */}
			{/* <path
				d={generateWavePath(lineOffset1 * 0.5, waveAmplitude * 0.6, waveFrequency * 1.5, 350)}
				stroke="rgba(0, 0, 0, 0.05)"
				strokeWidth="3.5"
				fill="none"
				strokeLinecap="round"
			/> */}
			{/* <path
				d={generateWavePath(lineOffset2 * 1.5, waveAmplitude * 0.7, waveFrequency * 0.9, 730)}
				stroke="rgba(0, 0, 0, 0.05)"
				strokeWidth="3.5"
				fill="none"
				strokeLinecap="round"
			/> */}
			{/* </svg> */}

			{/* Current caption display */}
			{currentCaption && (
				<div
					style={{
						position: 'absolute',
						...(captionBottom
							? {
								bottom: '0',
								left: '50%',
								transform: `translate(calc(-50% + ${translateX}px), 0) scale(${scale})`,
								transformOrigin: 'center bottom',
								width: '88%',
								maxWidth: captionMaxWidthPx,
								padding: '10px 28px',
							}
							: {
								top: '50%',
								left: '50%',
								transform: `translate(calc(-50% + ${translateX}px), -50%) scale(${scale})`,
								transformOrigin: 'center center',
								width: '80%',
								maxWidth: '80vw',
								padding: '20px 40px',
							}),
						fontSize: calculateCaptionFontSize(currentCaption.text),
						fontWeight: 'bold',
						textAlign: 'center',
						fontFamily: 'dingliesongtypeface',
						whiteSpace: 'pre-line',
						zIndex: 10,
						opacity
					}}
				>
					{/* Caption text with letter spacing animation for gather effect */}
					<div
						style={{
							position: 'relative',
							letterSpacing: `${letterSpacing}px`,
						}}
					>
						{/* Background layer - black stroke for border */}
						<div
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
								width: '100%',
								color: 'transparent',
								WebkitTextStroke: `${strokePx}px ${captionStrokeColor}`,
								paintOrder: 'stroke fill',
							}}
						>
							{currentCaption.text}
						</div>
						{/* Foreground layer - fill color */}
						<div
							style={{
								position: 'relative',
								color: captionFillColor,
							}}
						>
							{currentCaption.text}
						</div>
					</div>
				</div>
			)}

			{/* Attribution: GitHub + project name, left bottom */}
			{includeWatermark ? <WatermarkText style="content" /> : null}
		</AbsoluteFill>
	);
};
