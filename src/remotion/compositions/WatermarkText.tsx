import React, { type CSSProperties } from 'react';
import { REMOTION_SANS_FONT_FAMILY } from '../sans-font-family';

const fontFamily = REMOTION_SANS_FONT_FAMILY;

/** GitHub mark only (official path); inherits `color` via currentColor. */
const GitHubMark: React.FC<{ size: number }> = ({ size }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 98 96"
		aria-hidden
		style={{ flexShrink: 0 }}
	>
		<path
			fill="currentColor"
			fillRule="evenodd"
			clipRule="evenodd"
			d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.225-22.243-5.546-22.243-24.705 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 19.216-11.416 23.443-22.124 24.659 1.735 1.49 3.316 4.391 3.316 8.867 0 6.398-.08 11.546-.08 13.19 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
		/>
	</svg>
);

/** `cover`: intro / cover card (light background). `content`: narration over dark video. */
export type WatermarkTextStylePreset = 'content' | 'cover';

export type WatermarkTextProps = {
	style?: WatermarkTextStylePreset;
};

type VariantConfig = {
	row: Pick<
		CSSProperties,
		'gap' | 'fontSize' | 'color' | 'fontWeight' | 'letterSpacing'
	>;
	/** cover: centered in frame. content: left-bottom corner */
	placement: 'center' | 'corner';
	corner?: Pick<CSSProperties, 'left' | 'bottom'>;
	githubMarkSize: number;
	showChinese: boolean;
	dotOpacity: number;
};

const VARIANTS: Record<WatermarkTextStylePreset, VariantConfig> = {
	cover: {
		row: {
			gap: '12px',
			fontSize: '28px',
			color: 'rgba(23, 23, 23, 0.4)',
			fontWeight: 400,
			letterSpacing: 'normal',
		},
		placement: 'center',
		githubMarkSize: 32,
		showChinese: true,
		dotOpacity: 0.75,
	},
	content: {
		row: {
			gap: '10px',
			fontSize: '24px',
			color: 'rgba(255, 255, 255, 0.27)',
			fontWeight: 500,
			letterSpacing: '0.01em',
		},
		placement: 'corner',
		corner: { left: '40px', bottom: '40px' },
		githubMarkSize: 28,
		showChinese: false,
		dotOpacity: 0.85,
	},
};

const ROW_BASE: CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'flex-start',
	fontFamily,
	textAlign: 'left',
	whiteSpace: 'nowrap',
};

const COVER_OUTER: CSSProperties = {
	position: 'absolute',
	inset: 0,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	marginTop: '432px',
	zIndex: 15,
	pointerEvents: 'none',
};

const CORNER_OUTER: CSSProperties = {
	position: 'absolute',
	zIndex: 15,
	pointerEvents: 'none',
};

/** GitHub mark + project name (EN / CN) */
export const WatermarkText: React.FC<WatermarkTextProps> = ({
	style: preset = 'cover',
}) => {
	const v = VARIANTS[preset];
	const row = <div style={{ ...ROW_BASE, ...v.row }}>
		<GitHubMark size={v.githubMarkSize} />
		<span>
			Panda Video Generator
			{v.showChinese && (
				<>
					<span style={{ margin: '0 0.4em', opacity: v.dotOpacity }}>·</span>
					熊猫视频自动化引擎
				</>
			)}
		</span>
	</div>;

	if (v.placement === 'center') {
		return <div style={COVER_OUTER}>{row}</div>;
	}

	return (
		<div style={{ ...CORNER_OUTER, ...v.corner }}>
			{row}
		</div>
	);
};
