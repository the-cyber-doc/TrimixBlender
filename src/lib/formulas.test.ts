import { describe, expect, it } from 'vitest';
import {
	AIR,
	ATMOSPHERE,
	REFERENCE_TEMPERATURE,
	absolute,
	ambientFromDepth,
	celsiusToKelvin,
	depthFromAmbient,
	endAmbient,
	fahrenheitToKelvin,
	freeGasVolume,
	gauge,
	heliumForEnd,
	kelvinToCelsius,
	kelvinToFahrenheit,
	mixZ,
	modAmbient,
	moles,
	n2Fraction,
	o2ForMod,
	partialPressure,
	pressure,
	pureZ,
	solve2,
	solve3,
	BAR_PER_PSI,
	LITRES_PER_CUBIC_FOOT
} from './formulas';
import { readFileSync } from 'node:fs';

const T15 = REFERENCE_TEMPERATURE;

describe('pressure and depth', () => {
	it('converts gauge and absolute pressure', () => {
		expect(absolute(200)).toBeCloseTo(201.01325, 10);
		expect(gauge(absolute(123.4))).toBeCloseTo(123.4, 10);
		expect(gauge(ATMOSPHERE)).toBe(0);
	});

	it('uses 10 m per bar and 33 ft per atm', () => {
		expect(ambientFromDepth(0, 'm')).toBe(1);
		expect(ambientFromDepth(30, 'm')).toBe(4);
		expect(ambientFromDepth(99, 'ft')).toBe(4);
		expect(depthFromAmbient(4, 'm')).toBe(30);
		expect(depthFromAmbient(4, 'ft')).toBe(99);
	});
});

describe("Dalton's law", () => {
	it('gives partial pressures', () => {
		expect(partialPressure(0.21, 5)).toBeCloseTo(1.05, 10);
	});

	it('gives the MOD of EAN32 at PPO2 1.4: 33.75 m, 111 ft', () => {
		const mod = modAmbient(0.32, 1.4);
		expect(depthFromAmbient(mod, 'm')).toBeCloseTo(33.75, 10);
		expect(depthFromAmbient(mod, 'ft')).toBeCloseTo(111.375, 10);
		expect(o2ForMod(mod, 1.4)).toBeCloseTo(0.32, 12);
	});

	it('gives the best mix for 40 m at 1.4: 28 %', () => {
		expect(o2ForMod(ambientFromDepth(40, 'm'), 1.4)).toBeCloseTo(0.28, 12);
	});

	it('gives the END of 21/35 at 60 m', () => {
		const at60 = ambientFromDepth(60, 'm');
		// O2 narcotic: 7 bar × 0.65 = 4.55 bar → 35.5 m
		expect(depthFromAmbient(endAmbient({ o2: 0.21, he: 0.35 }, at60, true), 'm')).toBeCloseTo(35.5, 10);
		// N2 only: 7 bar × 0.44 / 0.79 = 3.899 bar → 28.99 m
		expect(depthFromAmbient(endAmbient({ o2: 0.21, he: 0.35 }, at60, false), 'm')).toBeCloseTo(28.987, 3);
		// Air: END = depth either way
		expect(endAmbient(AIR, at60, true)).toBeCloseTo(at60, 12);
		expect(endAmbient(AIR, at60, false)).toBeCloseTo(at60, 12);
	});

	it('inverts the END for helium', () => {
		const at = ambientFromDepth(60, 'm');
		for (const narcotic of [true, false]) {
			const end = endAmbient({ o2: 0.18, he: 0.45 }, at, narcotic);
			expect(heliumForEnd(end, at, 0.18, narcotic)).toBeCloseTo(0.45, 12);
		}
	});

	it('has nitrogen as the rest', () => {
		expect(n2Fraction({ o2: 0.21, he: 0.35 })).toBeCloseTo(0.44, 12);
	});
});

describe('compressibility', () => {
	const R = 0.0831446261815324;
	/** Every NIST point within the fit's range, against the fit. */
	for (const gas of ['O2', 'N2', 'He'] as const) {
		it(`matches the NIST data for ${gas} within 0.11 %`, () => {
			const rows = readFileSync(new URL(`../../scripts/nist/${gas}.tsv`, import.meta.url), 'utf8')
				.trim()
				.split('\n')
				.map((l) => l.split('\t').map(Number))
				.filter(([, P]) => P <= 351);
			expect(rows.length).toBeGreaterThan(300);
			for (const [T, P, rho] of rows) {
				const z = P / (rho * R * T);
				expect(Math.abs(pureZ(gas, P, T) - z) / z).toBeLessThan(0.0011);
			}
		});
	}

	it('gives the known Z at 200 bar and 15 °C', () => {
		expect(pureZ('He', 201, T15)).toBeCloseTo(1.0975, 3);
		expect(pureZ('O2', 201, T15)).toBeCloseTo(0.9313, 3);
		expect(pureZ('N2', 201, T15)).toBeCloseTo(1.0485, 3);
	});

	it('mixes by Amagat (mole-fraction average), Z = 1 for ideal gases', () => {
		const mix = { o2: 0.21, he: 0.35 };
		const expected = 0.21 * pureZ('O2', 150, T15) + 0.35 * pureZ('He', 150, T15) + 0.44 * pureZ('N2', 150, T15);
		expect(mixZ(mix, 150, T15, 'real')).toBeCloseTo(expected, 12);
		expect(mixZ(mix, 150, T15, 'ideal')).toBe(1);
	});
});

describe('amount of gas', () => {
	it('follows PV = nRT for ideal gases', () => {
		expect(moles(200, T15, 12, AIR, 'ideal')).toBeCloseTo((201.01325 * 12) / (0.08314462618 * T15), 10);
		expect(pressure(moles(200, T15, 12, AIR, 'ideal'), T15, 12, AIR, 'ideal')).toBeCloseTo(200, 9);
	});

	it('round-trips real-gas pressure', () => {
		for (const mix of [AIR, { o2: 1, he: 0 }, { o2: 0, he: 1 }, { o2: 0.18, he: 0.45 }]) {
			for (const p of [0, 50, 200, 300]) {
				const n = moles(p, 300, 11.1, mix, 'real');
				expect(pressure(n, 300, 11.1, mix, 'real')).toBeCloseTo(p, 8);
			}
		}
	});

	it('puts less helium than ideal in a cylinder at 200 bar', () => {
		const he = { o2: 0, he: 1 };
		expect(moles(200, T15, 12, he, 'real') / moles(200, T15, 12, he, 'ideal')).toBeCloseTo(1 / 1.0975, 3);
	});

	it('gives free gas volume = water volume × gauge pressure for ideal gases', () => {
		expect(freeGasVolume(200, T15, 12, AIR, 'ideal')).toBeCloseTo(2400, 8);
		expect(freeGasVolume(200, T15, 12, AIR, 'real')).toBeLessThan(2400); // air's Z > 1 at 200 bar
	});
});

describe('linear systems', () => {
	it('solves 3×3 and 2×2 systems', () => {
		const x = solve3(
			[
				[2, 1, -1],
				[-3, -1, 2],
				[-2, 1, 2]
			],
			[8, -11, -3]
		)!;
		expect(x[0]).toBeCloseTo(2, 12);
		expect(x[1]).toBeCloseTo(3, 12);
		expect(x[2]).toBeCloseTo(-1, 12);
		const y = solve2(
			[
				[1, 2],
				[3, 4]
			],
			[5, 6]
		)!;
		expect(y[0]).toBeCloseTo(-4, 12);
		expect(y[1]).toBeCloseTo(4.5, 12);
	});

	it('returns null for singular systems', () => {
		expect(
			solve3(
				[
					[1, 1, 1],
					[1, 1, 1],
					[0, 0, 1]
				],
				[1, 2, 3]
			)
		).toBeNull();
		expect(
			solve2(
				[
					[1, 1],
					[1, 1]
				],
				[1, 2]
			)
		).toBeNull();
	});
});

describe('units', () => {
	it('converts as NIST SP 811', () => {
		expect(3000 * BAR_PER_PSI).toBeCloseTo(206.84, 2);
		expect(80 * LITRES_PER_CUBIC_FOOT).toBeCloseTo(2265.35, 2);
		expect(celsiusToKelvin(15)).toBeCloseTo(288.15, 12);
		expect(kelvinToCelsius(288.15)).toBeCloseTo(15, 12);
		expect(kelvinToFahrenheit(celsiusToKelvin(15))).toBeCloseTo(59, 12);
		expect(kelvinToFahrenheit(celsiusToKelvin(-40))).toBeCloseTo(-40, 12);
		expect(fahrenheitToKelvin(212)).toBeCloseTo(373.15, 12);
	});
});
