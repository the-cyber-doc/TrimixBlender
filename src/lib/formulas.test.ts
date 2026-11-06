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
import {
	DENSITY_LIMITS,
	DENSITY_TEMPERATURE,
	MOLAR_MASS,
	ambientInBar,
	gasDensity,
	heliumForDensity,
	molarMass,
	pressureForDensity
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

describe('gas density', () => {
	const T0 = DENSITY_TEMPERATURE;
	const atDepth = (
		mix: { o2: number; he: number },
		depth: number,
		unit: 'm' | 'ft',
		model: 'real' | 'ideal' = 'ideal'
	) => gasDensity(mix, ambientInBar(ambientFromDepth(depth, unit), unit), T0, model);

	it('uses the IUPAC molar masses', () => {
		expect(MOLAR_MASS).toEqual({ O2: 31.998, N2: 28.014, He: 4.0026 });
		expect(molarMass(AIR)).toBeCloseTo(28.851, 3);
		expect(molarMass({ o2: 0, he: 1 })).toBe(4.0026);
		expect(molarMass({ o2: 0.21, he: 0.35 })).toBeCloseTo(20.4467, 4);
	});

	it('gives air 1.29 g/l at 1 atm and 0 °C, as the literature (1.293 g/l with argon)', () => {
		const air = gasDensity(AIR, ATMOSPHERE, T0, 'ideal');
		expect(air).toBeCloseTo(1.287, 3);
		// Within 0.5 %: the 21/79 convention counts argon (heavier) as nitrogen.
		expect(Math.abs(air - 1.293) / 1.293).toBeLessThan(0.005);
	});

	it("matches DAN's example: EAN32 at 110 fsw ≈ 5.6 g/l", () => {
		expect(atDepth({ o2: 0.32, he: 0 }, 110, 'ft')).toBeCloseTo(5.66, 2);
	});

	it('scales with the absolute pressure: air at 4 atm ≈ 1.293 × 4 = 5.17 g/l', () => {
		expect(atDepth(AIR, 99, 'ft') / gasDensity(AIR, ATMOSPHERE, T0, 'ideal')).toBeCloseTo(4, 12);
	});

	it('is lower with helium', () => {
		expect(atDepth({ o2: 0.21, he: 0.35 }, 60, 'm')).toBeCloseTo(6.302, 3);
		expect(atDepth({ o2: 0.21, he: 0.35 }, 60, 'm')).toBeLessThan(atDepth(AIR, 60, 'm'));
	});

	it('barely changes with real gases at depth (Z within 1 % of 1)', () => {
		const ideal = atDepth({ o2: 0.18, he: 0.45 }, 90, 'm');
		const real = atDepth({ o2: 0.18, he: 0.45 }, 90, 'm', 'real');
		expect(Math.abs(real - ideal) / ideal).toBeLessThan(0.01);
		expect(real).not.toBe(ideal);
	});

	it('puts the ceilings for air at about 31 m and 39 m', () => {
		const at = (density: number) => depthFromAmbient(pressureForDensity(density, AIR, T0, 'ideal'), 'm');
		expect(DENSITY_LIMITS).toEqual({ recommended: 5.2, maximum: 6.2 });
		expect(at(5.2)).toBeCloseTo(30.93, 2);
		expect(at(6.2)).toBeCloseTo(38.81, 2);
	});

	it('inverts the density for real gases', () => {
		for (const mix of [AIR, { o2: 0.1, he: 0.7 }, { o2: 0.5, he: 0 }]) {
			const p = pressureForDensity(6.2, mix, T0, 'real');
			expect(gasDensity(mix, p, T0, 'real')).toBeCloseTo(6.2, 10);
		}
	});

	it('gives the helium for a wanted density (He replaces N2)', () => {
		// 21 % O2 at 7 bar, 5.2 g/l: M = 5.2 × R × 273.15 / 7 = 16.871 g/mol
		// ⇒ fHe = (0.21 × 31.998 + 0.79 × 28.014 − 16.871) / (28.014 − 4.0026) = 0.4990.
		expect(heliumForDensity(5.2, 7, 0.21, T0, 'ideal')).toBeCloseTo(0.499, 3);
		for (const model of ['ideal', 'real'] as const) {
			for (const [o2, he, p] of [
				[0.21, 0.35, 7],
				[0.1, 0.7, 16],
				[0.32, 0, 4.4]
			]) {
				const density = gasDensity({ o2, he }, p, T0, model);
				expect(heliumForDensity(density, p, o2, T0, model)).toBeCloseTo(he, 10);
			}
		}
	});

	it('converts ambient atm to bar for feet', () => {
		expect(ambientInBar(4, 'm')).toBe(4);
		expect(ambientInBar(4, 'ft')).toBeCloseTo(4.053, 12);
	});
});
