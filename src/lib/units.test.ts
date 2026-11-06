import { describe, expect, it } from 'vitest';
import { REFERENCE_TEMPERATURE, ambientFromDepth } from './formulas';
import {
	DEFAULT_PREFERENCES,
	DENSITY,
	PARTIAL_PRESSURE,
	PERCENT,
	depthQuantity,
	format,
	formatDown,
	formatNumber,
	gasVolumeQuantity,
	parseNumber,
	pressureQuantity,
	roundDown,
	temperatureQuantity,
	volumeQuantity,
	type Preferences
} from './units';

const metric = DEFAULT_PREFERENCES;
const imperial: Preferences = { ...metric, temperature: 'F', pressure: 'psi', volume: 'cuft', depth: 'ft' };

describe('units', () => {
	it('shows metric values', () => {
		expect(format(pressureQuantity(metric), 200)).toBe('200 bar');
		expect(format(pressureQuantity(metric), 27.98)).toBe('28 bar');
		expect(format(pressureQuantity(metric), 27.94)).toBe('27.9 bar');
		expect(format(volumeQuantity(metric), 12)).toBe('12 l');
		expect(format(gasVolumeQuantity(metric), 2400.4)).toBe('2400 l');
		expect(format(temperatureQuantity(metric), REFERENCE_TEMPERATURE)).toBe('15 °C');
		expect(format(depthQuantity(metric), ambientFromDepth(33.75, 'm'))).toBe('33.8 m');
		expect(format(PERCENT, 0.32)).toBe('32 %');
		expect(format(PARTIAL_PRESSURE, 1.4)).toBe('1.4');
		expect(format(DENSITY, 6.3021)).toBe('6.3 g/l');
		expect(DENSITY.fromDisplay(5.2)).toBe(5.2);
		expect(format(PERCENT, 0.32, false)).toBe('32');
	});

	it('shows imperial values', () => {
		expect(format(pressureQuantity(imperial), 206.8427)).toBe('3000 psi');
		expect(format(volumeQuantity(imperial), 11.1)).toBe('0.39 cu ft');
		expect(format(gasVolumeQuantity(imperial), 2265.35)).toBe('80 cu ft');
		expect(format(temperatureQuantity(imperial), REFERENCE_TEMPERATURE)).toBe('59 °F');
		expect(format(depthQuantity(imperial), ambientFromDepth(111.4, 'ft'))).toBe('111 ft');
	});

	it('converts what the user types back', () => {
		for (const prefs of [metric, imperial]) {
			for (const q of [
				pressureQuantity(prefs),
				volumeQuantity(prefs),
				temperatureQuantity(prefs),
				depthQuantity(prefs)
			]) {
				expect(q.fromDisplay(q.toDisplay(123.456))).toBeCloseTo(123.456, 9);
			}
		}
		expect(PERCENT.fromDisplay(32)).toBeCloseTo(0.32, 12);
		expect(PARTIAL_PRESSURE.fromDisplay(1.4)).toBe(1.4);
	});

	it('formats numbers', () => {
		expect(formatNumber(1.4, 2)).toBe('1.4');
		expect(formatNumber(32, 1)).toBe('32');
		expect(formatNumber(-0.01, 1)).toBe('0');
		expect(formatNumber(-3.26, 1)).toBe('-3.3');
		expect(formatNumber(1500, 0)).toBe('1500');
		expect(formatNumber(NaN, 1)).toBe('–');
		expect(formatNumber(Infinity, 1)).toBe('–');
	});

	it('rounds a drain pressure down', () => {
		expect(formatDown(pressureQuantity(metric), 27.99)).toBe('27.9 bar');
		expect(formatDown(pressureQuantity(metric), 28)).toBe('28 bar');
		expect(formatDown(pressureQuantity(imperial), 100)).toBe('1450 psi');
		expect(roundDown(pressureQuantity(metric), 27.99)).toBeCloseTo(27.9, 12);
	});

	it('parses numbers', () => {
		expect(parseNumber(' 32,5 ')).toBe(32.5);
		expect(parseNumber('1.4')).toBe(1.4);
		expect(parseNumber('')).toBeNaN();
		expect(parseNumber('abc')).toBeNaN();
	});
});
