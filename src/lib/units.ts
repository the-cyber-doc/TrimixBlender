// The user's units: conversions between the internal units (formulas.ts) and the display,
// and number formatting. The conversion factors themselves are in formulas.ts.

import {
	BAR_PER_PSI,
	LITRES_PER_CUBIC_FOOT,
	ambientFromDepth,
	celsiusToKelvin,
	depthFromAmbient,
	fahrenheitToKelvin,
	kelvinToCelsius,
	kelvinToFahrenheit,
	type DepthUnit,
	type GasModel
} from './formulas';

export type TemperatureUnit = 'C' | 'F';
export type PressureUnit = 'bar' | 'psi';
export type VolumeUnit = 'l' | 'cuft';

export interface Preferences {
	temperature: TemperatureUnit;
	pressure: PressureUnit;
	volume: VolumeUnit;
	depth: DepthUnit;
	model: GasModel;
	/** END counts O2 as narcotic (default) or N2 only. */
	o2Narcotic: boolean;
}

export const DEFAULT_PREFERENCES: Preferences = {
	temperature: 'C',
	pressure: 'bar',
	volume: 'l',
	depth: 'm',
	model: 'real',
	o2Narcotic: true
};

export const UNIT_LABELS = {
	temperature: { C: '°C', F: '°F' },
	pressure: { bar: 'bar', psi: 'psi' },
	volume: { l: 'l', cuft: 'cu ft' },
	depth: { m: 'm', ft: 'ft' }
} as const;

/** A quantity's conversions: internal value ↔ the number shown, its unit and its decimals. */
export interface Quantity {
	toDisplay: (internal: number) => number;
	fromDisplay: (shown: number) => number;
	unit: string;
	decimals: number;
}

/** Pressure, internal bar. */
export function pressureQuantity(p: Preferences): Quantity {
	return p.pressure === 'psi'
		? { toDisplay: (b) => b / BAR_PER_PSI, fromDisplay: (v) => v * BAR_PER_PSI, unit: 'psi', decimals: 0 }
		: { toDisplay: (b) => b, fromDisplay: (v) => v, unit: 'bar', decimals: 1 };
}

/** Cylinder (water) volume, internal L. */
export function volumeQuantity(p: Preferences): Quantity {
	return p.volume === 'cuft'
		? {
				toDisplay: (l) => l / LITRES_PER_CUBIC_FOOT,
				fromDisplay: (v) => v * LITRES_PER_CUBIC_FOOT,
				unit: 'cu ft',
				decimals: 2
			}
		: { toDisplay: (l) => l, fromDisplay: (v) => v, unit: 'l', decimals: 1 };
}

/** Free gas volume, internal L: whole litres or cubic feet. */
export function gasVolumeQuantity(p: Preferences): Quantity {
	return { ...volumeQuantity(p), decimals: p.volume === 'cuft' ? 1 : 0 };
}

/** Temperature, internal K. */
export function temperatureQuantity(p: Preferences): Quantity {
	return p.temperature === 'F'
		? { toDisplay: kelvinToFahrenheit, fromDisplay: fahrenheitToKelvin, unit: '°F', decimals: 0 }
		: { toDisplay: kelvinToCelsius, fromDisplay: celsiusToKelvin, unit: '°C', decimals: 0 };
}

/** Depth, internal ambient pressure (formulas.ts ambientFromDepth). */
export function depthQuantity(p: Preferences): Quantity {
	return {
		toDisplay: (a) => depthFromAmbient(a, p.depth),
		fromDisplay: (d) => ambientFromDepth(d, p.depth),
		unit: p.depth,
		decimals: p.depth === 'ft' ? 0 : 1
	};
}

/** A fraction as a percentage (0.32 → 32). */
export const PERCENT: Quantity = { toDisplay: (f) => f * 100, fromDisplay: (v) => v / 100, unit: '%', decimals: 1 };

/** A gas density, g/l (the literature's unit, whatever the preferences). */
export const DENSITY: Quantity = { toDisplay: (v) => v, fromDisplay: (v) => v, unit: 'g/l', decimals: 2 };

/** A partial pressure (bar or ata, as the PPO2 limit). */
export const PARTIAL_PRESSURE: Quantity = { toDisplay: (v) => v, fromDisplay: (v) => v, unit: '', decimals: 2 };

/** Rounds to `decimals` and drops trailing zeros (32.0 → "32", 1.40 → "1.4"); "-0" never shows. */
export function formatNumber(value: number, decimals: number): string {
	if (!Number.isFinite(value)) return '–';
	const text = value.toFixed(decimals);
	const trimmed = decimals > 0 ? text.replace(/\.?0+$/, '') : text;
	return trimmed === '-0' ? '0' : trimmed;
}

/** An internal value as shown, with its unit: "200 bar", "32 %". */
export function format(q: Quantity, internal: number, withUnit = true): string {
	const text = formatNumber(q.toDisplay(internal), q.decimals);
	return withUnit && q.unit ? `${text} ${q.unit}` : text;
}

/** The value rounded down to what is shown (internal units): a drain-down pressure must not be
 * rounded above what works. */
export function roundDown(q: Quantity, internal: number): number {
	const factor = 10 ** q.decimals;
	return q.fromDisplay(Math.floor(q.toDisplay(internal) * factor + 1e-9) / factor);
}

/** An internal value rounded down, as shown with its unit. */
export const formatDown = (q: Quantity, internal: number): string => format(q, roundDown(q, internal));

/** Parses what the user typed ("32", "32,5", " 1.4 "); NaN when it is not a number. */
export function parseNumber(text: string): number {
	const cleaned = text.trim().replace(',', '.');
	return cleaned === '' ? NaN : Number(cleaned);
}
