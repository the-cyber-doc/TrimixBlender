// The bottle drawing's content: one coloured band per origin of the gas, stacked from the
// bottom, as tall as its share of the full cylinder (by pressure). Colours are fixed: they
// do not change with the light or dark theme.

import { ORIGINS, type Origin, type Stage } from './blend';

export const GAS_COLORS = {
	O2: '#2f9e44', // green
	He: '#8b5a2b', // brown
	N2: '#111111', // black
	Air: '#1c6dd0', // blue: the top-up gas
	empty: '#ffffff' // white
} as const;

/** Text over each band: white on all four gas colours (contrast ≥ 4.5:1). */
export const BAND_TEXT = '#ffffff';

export type Band = 'O2' | 'He' | 'N2' | 'Air';

/** The band an origin is drawn in: the cylinder's own gases by gas, the sources by role. */
export const BAND: Record<Origin, Band> = {
	startO2: 'O2',
	startHe: 'He',
	startN2: 'N2',
	o2: 'O2',
	he: 'He',
	top: 'Air'
};

export interface Segment {
	origin: Origin;
	band: Band;
	color: string;
	/** Share of the content (0..1). */
	share: number;
	/** Bottom and height, as fractions of the bottle's inside (0 = bottom, 1 = full). */
	bottom: number;
	height: number;
}

/** Below this share, a part is not drawn. */
const MIN_SHARE = 1e-6;

export function segments(stage: Stage): Segment[] {
	const out: Segment[] = [];
	let bottom = 0;
	for (const origin of ORIGINS) {
		const share = stage.parts[origin];
		if (share < MIN_SHARE) continue;
		const height = share * stage.fill;
		out.push({ origin, band: BAND[origin], color: GAS_COLORS[BAND[origin]], share, bottom, height });
		bottom += height;
	}
	return out;
}

/** The legend: each band's total share of the content (O2, He, N2, Air), in that order, without empty ones. */
export function legend(stage: Stage): { band: Band; share: number; color: string }[] {
	const totals: Record<Band, number> = { O2: 0, He: 0, N2: 0, Air: 0 };
	for (const origin of ORIGINS) totals[BAND[origin]] += stage.parts[origin];
	return (Object.keys(totals) as Band[])
		.filter((band) => totals[band] >= MIN_SHARE)
		.map((band) => ({ band, share: totals[band], color: GAS_COLORS[band] }));
}
