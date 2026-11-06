// =====================================================================================
//  formulas.ts: EVERY physical and diving formula used by the app, in one file to audit.
// =====================================================================================
//
// Nothing else in the app computes physics: blend.ts, target.ts and units.ts only call
// these functions. Each formula says what it computes, how, and where it comes from
// ([id] = an entry of references.ts, listed with full citations on the About page).
//
// Internal units (the UI converts to the user's preferences, units.ts):
//   pressure      bar. "gauge" = what a cylinder gauge reads (0 = empty, open to the air);
//                 "absolute" = gauge + atmosphere. Physics uses absolute pressure.
//   temperature   kelvin (K)
//   volume        litre (L): a cylinder's water (internal) volume
//   amount        mol
//   fractions     0..1 (0.32 = 32 %)
//   ambient       "ambient pressure" at depth, in bar (metric) or atm (imperial): see
//                 ambientFromDepth. Depths (target depth, MOD, END) are kept as ambient
//                 pressures, so the diving formulas need no depth unit at all.

import { Z_COEFFICIENTS } from './compressibility-coefficients';

// -------------------------------------------------------------------------------------
// Constants
// -------------------------------------------------------------------------------------

/** Molar gas constant R in L·bar/(mol·K): 8.314 462 618 J/(mol·K) × (1 L·bar = 100 J). [codata-2018] */
export const R = 0.08314462618;

/** Standard atmosphere, in bar: 101.325 kPa. [nist-sp811]
 * Used to turn gauge readings into absolute pressure (a gauge reads 0 at the surface). */
export const ATMOSPHERE = 1.01325;

/** 0 °C in kelvin. [nist-sp811] */
export const ZERO_CELSIUS = 273.15;

/** Reference temperature of a cylinder's rated pressure: 15 °C. [iso-10286]
 * With temperature compensation on, the target pressure is the pressure the cylinder
 * settles at once back at 15 °C. Without it, the whole blend is computed at 15 °C. */
export const REFERENCE_TEMPERATURE = ZERO_CELSIUS + 15;

/** Air as divers count it: 21 % O2, 79 % N2 (argon and the rest counted as N2). [noaa-6]
 * (Dry air is 20.95 % O2; the rounding is the usual diving convention.) */
export const AIR: Mix = { o2: 0.21, he: 0 };

/** The fraction of N2 in air, used by the "N2 only" END formula. */
export const AIR_N2 = 1 - AIR.o2;

// -------------------------------------------------------------------------------------
// Gas mixes
// -------------------------------------------------------------------------------------

/** A breathing gas: fractions of O2 and He; the rest is N2. */
export interface Mix {
	o2: number;
	he: number;
}

/** Fraction of nitrogen: whatever is not O2 or He. fO2 + fHe + fN2 = 1. */
export const n2Fraction = (mix: Mix): number => 1 - mix.o2 - mix.he;

// -------------------------------------------------------------------------------------
// Pressure: gauge ↔ absolute, depth ↔ ambient pressure
// -------------------------------------------------------------------------------------

/** Absolute pressure from a gauge reading: P_abs = P_gauge + 1 atm. [usn-rev7, ch. 2] */
export const absolute = (gauge: number): number => gauge + ATMOSPHERE;

/** Gauge reading from an absolute pressure: P_gauge = P_abs − 1 atm. [usn-rev7, ch. 2] */
export const gauge = (absolutePressure: number): number => absolutePressure - ATMOSPHERE;

/** Seawater depth that adds one unit of ambient pressure, per depth unit. [usn-rev7, ch. 2]
 * Metric divers count 10 m of seawater per bar, imperial divers 33 ft of seawater per atm:
 * each formula below is the one taught in that unit system (MOD of EAN32 at 1.4 is
 * 33.8 m in metres, 111 ft in feet). */
export const DEPTH_PER_ATMOSPHERE = { m: 10, ft: 33 } as const;
export type DepthUnit = keyof typeof DEPTH_PER_ATMOSPHERE;

/** Ambient (absolute) pressure at a depth: P = 1 + D / 10 (m, bar) or 1 + D / 33 (ft, atm).
 * The surface counts as exactly 1, as in every dive table and dive computer. [usn-rev7, ch. 2] */
export const ambientFromDepth = (depth: number, unit: DepthUnit): number => 1 + depth / DEPTH_PER_ATMOSPHERE[unit];

/** Depth at an ambient pressure: the inverse of ambientFromDepth, D = (P − 1) × 10 (or × 33). */
export const depthFromAmbient = (ambient: number, unit: DepthUnit): number =>
	(ambient - 1) * DEPTH_PER_ATMOSPHERE[unit];

// -------------------------------------------------------------------------------------
// Dalton's law: partial pressures, MOD, END
// -------------------------------------------------------------------------------------

/** Partial pressure of one gas of a mix: PPx = fx × P_ambient (Dalton's law). [dalton-1802, usn-rev7]
 * Used for PPO2, PPHe and PPN2 at the target depth. */
export const partialPressure = (fraction: number, ambient: number): number => fraction * ambient;

/** Maximum operating depth, as an ambient pressure: the depth where PPO2 reaches its limit.
 *   PPO2_max = fO2 × P_MOD  ⇒  P_MOD = PPO2_max / fO2.          [dalton-1802, noaa-6]
 * In depth: MOD = 10 × (PPO2_max / fO2 − 1) m, or 33 × (…) ft (depthFromAmbient). */
export const modAmbient = (o2: number, ppo2: number): number => ppo2 / o2;

/** The O2 fraction whose MOD is the given ambient pressure: the inverse, fO2 = PPO2_max / P_MOD. [noaa-6]
 * ("Best mix" for a depth.) */
export const o2ForMod = (modPressure: number, ppo2: number): number => ppo2 / modPressure;

/** Equivalent narcotic depth (END), as an ambient pressure: the depth at which air would be as
 * narcotic as the mix at the given depth. Helium is not narcotic. [usn-rev7, bennett-elliott]
 *
 * Generalises the US Navy's equivalent air depth (EAD = (D + 33) × fN2 / 0.79 − 33, ch. 13):
 * the narcotic partial pressure of the mix at depth must equal that of air at the END:
 *   - O2 narcotic (default): narcotic gases are N2 + O2, i.e. 1 − fHe in the mix and 1 in air:
 *         P_END × 1 = P × (1 − fHe)              ⇒  P_END = P × (1 − fHe)
 *   - N2 only: narcotic gas is N2, i.e. fN2 in the mix and 0.79 in air:
 *         P_END × 0.79 = P × fN2                 ⇒  P_END = P × fN2 / 0.79
 * In depth: END = 10 × (P_END − 1) m (or 33 × … ft). */
export function endAmbient(mix: Mix, ambient: number, o2Narcotic: boolean): number {
	const narcotic = o2Narcotic ? 1 - mix.he : n2Fraction(mix) / AIR_N2;
	return ambient * narcotic;
}

/** The He fraction that gives a wanted END at a depth, for a given O2 fraction: endAmbient solved for fHe.
 *   - O2 narcotic:  P_END = P × (1 − fHe)            ⇒  fHe = 1 − P_END / P
 *   - N2 only:      P_END = P × (1 − fO2 − fHe)/0.79 ⇒  fHe = 1 − fO2 − 0.79 × P_END / P
 * [usn-rev7, bennett-elliott] */
export function heliumForEnd(endPressure: number, ambient: number, o2: number, o2Narcotic: boolean): number {
	return o2Narcotic ? 1 - endPressure / ambient : 1 - o2 - (AIR_N2 * endPressure) / ambient;
}

// -------------------------------------------------------------------------------------
// Real gases: compressibility factor Z
// -------------------------------------------------------------------------------------
//
// The ideal gas law PV = nRT is wrong by several percent at blending pressures: at 200 bar
// and 15 °C helium's Z is 1.097 (it takes up 9.7 % more room than an ideal gas), oxygen's
// 0.931 and nitrogen's 1.049 [nist-webbook]. Ignoring this gives trimix several percent
// off target. The real-gas law is PV = Z nRT, with Z = Z(P, T, gas). [poling-2001]
//
// Z of each pure gas is a polynomial fitted (least squares) to NIST reference data: the
// WebBook's densities for O2, N2 and He, which evaluate each gas's reference equation of
// state [nist-webbook, schmidt-wagner-1985, span-2000, ortiz-vega-he]:
//
//     Z(P, T) = 1 + Σ_{i=1..4} Σ_{j=0..2}  c[i−1][j] × (P / 100 bar)^i × ((T − 288.15 K) / 100 K)^j
//
// P absolute. Valid for 1..351 bar and −10..+60 °C, where it matches the NIST data within
// 0.11 % (O2), 0.08 % (N2) and 0.01 % (He). The data (scripts/nist/), the download
// (scripts/fetch-nist.sh) and the fit (scripts/fit-compressibility.js, which writes
// compressibility-coefficients.ts) are all in the repository, so the fit can be checked
// and redone.
//
// (Van der Waals' equation, with handbook constants, was rejected: its helium Z at 200 bar
// and 15 °C is about 1.19, as far from the real 1.097 as the ideal gas law is.)

export type Gas = keyof typeof Z_COEFFICIENTS;

/** Highest absolute pressure, in bar, covered by the compressibility fit. */
export const Z_MAX_PRESSURE = 351;
/** Temperature range, in K, covered by the compressibility fit. */
export const Z_TEMPERATURES = [ZERO_CELSIUS - 10, ZERO_CELSIUS + 60] as const;

/** Z of a pure gas at an absolute pressure (bar) and temperature (K): the polynomial above. */
export function pureZ(gas: Gas, absolutePressure: number, temperature: number): number {
	const p = absolutePressure / 100;
	const t = (temperature - 288.15) / 100;
	let z = 1;
	Z_COEFFICIENTS[gas].forEach((row, i) => {
		z += p ** (i + 1) * (row[0] + row[1] * t + row[2] * t * t);
	});
	return z;
}

/** The model of a calculation: the real-gas law (default), or the ideal gas law (Z = 1, the classic
 * partial-pressure method of the training manuals [noaa-6]). */
export type GasModel = 'real' | 'ideal';

/** Z of a mix: Amagat's law of additive volumes, Z_mix = Σ x_i × Z_i(P, T), each pure gas taken at the
 * mix's total pressure and temperature [poling-2001, ch. 5]. Z = 1 for the ideal gas model. */
export function mixZ(mix: Mix, absolutePressure: number, temperature: number, model: GasModel): number {
	if (model === 'ideal') return 1;
	return (
		mix.o2 * pureZ('O2', absolutePressure, temperature) +
		mix.he * pureZ('He', absolutePressure, temperature) +
		n2Fraction(mix) * pureZ('N2', absolutePressure, temperature)
	);
}

/** Amount of gas (mol) in a cylinder of `volume` L at a gauge pressure and a temperature:
 * the real-gas law solved for n, n = P_abs × V / (Z × R × T). [poling-2001]
 * Includes the atmosphere left in an "empty" cylinder (gauge 0). */
export function moles(gaugePressure: number, temperature: number, volume: number, mix: Mix, model: GasModel): number {
	const p = absolute(gaugePressure);
	return (p * volume) / (mixZ(mix, p, temperature, model) * R * temperature);
}

/** Gauge pressure of `amount` mol of a mix in a cylinder of `volume` L at a temperature: the
 * inverse of moles(), P_abs = Z(P_abs) × nRT / V. Z depends on P, so this is solved by Newton's
 * method on f(P) = P − Z(P) × nRT/V, starting from the ideal gas pressure, with dZ/dP taken
 * numerically. Z varies slowly with P (|dZ/dP| × nRT/V < 0.3 here), so it converges in a few
 * steps to well below 1e-9 bar. */
export function pressure(amount: number, temperature: number, volume: number, mix: Mix, model: GasModel): number {
	const ideal = (amount * R * temperature) / volume;
	let p = ideal;
	for (let step = 0; step < 50; step++) {
		const f = (q: number) => q - mixZ(mix, q, temperature, model) * ideal;
		const h = 1e-4;
		const slope = (f(p + h) - f(p - h)) / (2 * h);
		const next = p - f(p) / slope;
		const done = Math.abs(next - p) < 1e-10;
		p = next;
		if (done) break;
	}
	return gauge(p);
}

/** Free gas volume (L) a cylinder delivers down to an empty gauge: the gas above the atmosphere it
 * keeps, expanded to 1 bar at the given temperature:
 *   V_free = (n(P) − n(0 gauge)) × R × T / 1 bar
 * With the ideal gas law this is the familiar water volume × gauge pressure (12 L × 200 bar = 2400 L). */
export function freeGasVolume(gaugePressure: number, temperature: number, volume: number, mix: Mix, model: GasModel) {
	const available = moles(gaugePressure, temperature, volume, mix, model) - moles(0, temperature, volume, mix, model);
	return available * R * temperature;
}

// -------------------------------------------------------------------------------------
// Blending: the amount of each gas to add (used by blend.ts)
// -------------------------------------------------------------------------------------
//
// Partial-pressure blending, written in moles so that it holds for real gases [noaa-6,
// poling-2001]. What is added from each source must make up, gas by gas, the difference
// between the target content and what is already in the cylinder:
//
//     Σ_k a_k × fO2_k = n_target × fO2_target − n_start × fO2_start    (O2)
//     Σ_k a_k × fHe_k = n_target × fHe_target − n_start × fHe_start    (He)
//     Σ_k a_k         = n_target − n_start                             (all gas: N2 follows)
//
// with a_k the moles taken from source k (oxygen, helium, top-up gas). With the ideal gas
// law and pure O2 and He, this is the textbook rule "P_O2 added = P_target × fO2_target −
// P_start × fO2_start − P_air × 0.21" [noaa-6]. Each a_k must be ≥ 0: gas can only be added.

/** Solves the 3×3 linear system A x = b by Cramer's rule (null when the determinant is 0: the
 * sources cannot make independent amounts of O2, He and N2, e.g. two identical gases). */
export function solve3(A: readonly (readonly number[])[], b: readonly number[]): [number, number, number] | null {
	const det = (m: readonly (readonly number[])[]) =>
		m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
		m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
		m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
	const d = det(A);
	if (Math.abs(d) < 1e-12) return null;
	const column = (c: number) => A.map((row, r) => row.map((v, i) => (i === c ? b[r] : v)));
	return [det(column(0)) / d, det(column(1)) / d, det(column(2)) / d];
}

/** Solves the 2×2 linear system A x = b by Cramer's rule (nitrox: O2 and top-up only, no helium). */
export function solve2(A: readonly (readonly number[])[], b: readonly number[]): [number, number] | null {
	const d = A[0][0] * A[1][1] - A[0][1] * A[1][0];
	if (Math.abs(d) < 1e-12) return null;
	return [(b[0] * A[1][1] - A[0][1] * b[1]) / d, (A[0][0] * b[1] - b[0] * A[1][0]) / d];
}

// -------------------------------------------------------------------------------------
// Gas density at depth
// -------------------------------------------------------------------------------------
//
// Denser gas is harder to breathe: airway resistance and the work of breathing rise with
// density, ventilation falls, and CO2 builds up (hypercapnia), which raises the risk of
// narcosis, oxygen toxicity and loss of consciousness [doolette-mitchell-2011]. Divers in a
// wet chamber at 6.8 ATA on air (8.8 g/L) retained CO2 with severe dysfunction and minimal
// warning symptoms [warkander-1990]. In rebreather test dives, failures from CO2 retention
// rose sharply above 6 g/L, hence the recommended ceilings [anthony-mitchell-2016]:
//   - 5.2 g/L: recommended maximum (air at about 31 m / 100 ft)
//   - 6.2 g/L: absolute maximum (air at about 39 m / 125 ft)
//
// Density of a gas (real-gas law, ρ = n·M / V):
//     ρ = P × M_mix / (Z × R × T)                                  [poling-2001]
// with M_mix = Σ x_i M_i the mix's molar mass [iupac-2021]. The literature tabulates densities
// at 0 °C (air: 1.293 g/L at 1 atm) and scales them with the absolute pressure at depth
// [doolette-mitchell-2011, anthony-mitchell-2016], so the ceilings above are on that basis:
// the app uses T = 0 °C as well. (At these pressures, below 30 bar, Z is within 1 % of 1.)

/** Molar masses, g/mol, from the IUPAC standard atomic weights (O 15.999, N 14.007, He 4.0026). [iupac-2021] */
export const MOLAR_MASS = { O2: 31.998, N2: 28.014, He: 4.0026 } as const;

/** Molar mass of a mix, g/mol: M = fO2 × M_O2 + fHe × M_He + fN2 × M_N2. Air (21/79): 28.85 g/mol. */
export const molarMass = (mix: Mix): number =>
	mix.o2 * MOLAR_MASS.O2 + mix.he * MOLAR_MASS.He + n2Fraction(mix) * MOLAR_MASS.N2;

/** Temperature of the density figures: 0 °C, as the literature's tables and ceilings. [doolette-mitchell-2011] */
export const DENSITY_TEMPERATURE = ZERO_CELSIUS;

/** Recommended and absolute maximum density of a breathing gas at depth, g/L. [anthony-mitchell-2016] */
export const DENSITY_LIMITS = { recommended: 5.2, maximum: 6.2 } as const;

/** An ambient pressure (formulas above: bar for depths in metres, atm for feet) in bar. [nist-sp811] */
export const ambientInBar = (ambient: number, unit: DepthUnit): number =>
	unit === 'ft' ? ambient * ATMOSPHERE : ambient;

/** Density of a mix, g/L, at an absolute pressure (bar) and temperature (K): ρ = P × M / (Z × R × T).
 * (R in L·bar/(mol·K) and M in g/mol give g/L.) [poling-2001, iupac-2021] */
export function gasDensity(mix: Mix, absolutePressure: number, temperature: number, model: GasModel): number {
	return (absolutePressure * molarMass(mix)) / (mixZ(mix, absolutePressure, temperature, model) * R * temperature);
}

/** The absolute pressure (bar) at which a mix reaches a density: gasDensity solved for P,
 * P = ρ × Z(P) × R × T / M. Z depends on P, so this iterates P ← ρ Z(P) R T / M from the ideal
 * gas value; Z is within 1 % of 1 here, so each step gains about two digits. */
export function pressureForDensity(density: number, mix: Mix, temperature: number, model: GasModel): number {
	const ideal = (density * R * temperature) / molarMass(mix);
	let p = ideal;
	for (let step = 0; step < 50; step++) {
		const next = ideal * mixZ(mix, p, temperature, model);
		const done = Math.abs(next - p) < 1e-12;
		p = next;
		if (done) break;
	}
	return p;
}

/** The He fraction that gives a wanted density at an absolute pressure (bar), for a given O2 fraction:
 * gasDensity solved for fHe. The molar mass the density needs is M = ρ × Z × R × T / P, and
 *   M = fO2 × M_O2 + fHe × M_He + (1 − fO2 − fHe) × M_N2   (He replaces N2)
 *   ⇒ fHe = (fO2 × M_O2 + (1 − fO2) × M_N2 − M) / (M_N2 − M_He).      [iupac-2021, poling-2001]
 * Z depends on fHe: iterated from Z = 1 (it varies by less than 1 % at these pressures). */
export function heliumForDensity(
	density: number,
	absolutePressure: number,
	o2: number,
	temperature: number,
	model: GasModel
): number {
	const heliox = o2 * MOLAR_MASS.O2 + (1 - o2) * MOLAR_MASS.N2;
	let he = 0;
	for (let step = 0; step < 50; step++) {
		const z = mixZ({ o2, he }, absolutePressure, temperature, model);
		const needed = (density * z * R * temperature) / absolutePressure;
		const next = (heliox - needed) / (MOLAR_MASS.N2 - MOLAR_MASS.He);
		const done = Math.abs(next - he) < 1e-12;
		he = next;
		if (done) break;
	}
	return he;
}

// -------------------------------------------------------------------------------------
// Unit conversions [nist-sp811]
// -------------------------------------------------------------------------------------

/** 1 psi = 6.894 757 kPa = 0.068 947 57 bar. */
export const BAR_PER_PSI = 0.06894757;
/** 1 ft³ = 28.316 846 592 L (exact). */
export const LITRES_PER_CUBIC_FOOT = 28.316846592;

export const celsiusToKelvin = (c: number): number => c + ZERO_CELSIUS;
export const kelvinToCelsius = (k: number): number => k - ZERO_CELSIUS;
/** °F = °C × 9/5 + 32. */
export const kelvinToFahrenheit = (k: number): number => kelvinToCelsius(k) * 1.8 + 32;
/** °C = (°F − 32) × 5/9. */
export const fahrenheitToKelvin = (f: number): number => celsiusToKelvin((f - 32) / 1.8);
