// The blend: how much O2, He and top-up gas to add, in that order, to turn what is in the
// cylinder into the target mix at the target pressure. Pure logic; every formula is in
// formulas.ts. All pressures are gauge, in bar.

import {
	REFERENCE_TEMPERATURE,
	Z_MAX_PRESSURE,
	Z_TEMPERATURES,
	absolute,
	freeGasVolume,
	moles,
	n2Fraction,
	pressure,
	solve2,
	solve3,
	type GasModel,
	type Mix
} from './formulas';

/** A gas the blender can take from: a bank, a booster-less decant cylinder or a compressor. */
export interface Source extends Mix {
	id: string;
	name: string;
	/** Gauge pressure of the source, bar: decanting cannot fill a cylinder above it. */
	pressure: number;
}

export type BlendKind = 'nitrox' | 'trimix';

export interface BlendInput {
	kind: BlendKind;
	target: Mix;
	/** Target gauge pressure, bar, at the 15 °C reference temperature (formulas.ts). */
	targetPressure: number;
	/** Cylinder water volume, L. */
	volume: number;
	start: Mix;
	/** Gauge pressure of the gas already in the cylinder, bar, read at `temperature`. */
	startPressure: number;
	/** Cylinder temperature while it is filled, K: REFERENCE_TEMPERATURE without compensation. */
	temperature: number;
	model: GasModel;
	o2Source?: Source;
	/** Ignored for nitrox. */
	heSource?: Source;
	topSource?: Source;
}

/** Where a part of the cylinder's content came from: the gases of the starting mix, or a source. */
export type Origin = 'startO2' | 'startHe' | 'startN2' | 'o2' | 'he' | 'top';
export const ORIGINS: readonly Origin[] = ['startO2', 'startHe', 'startN2', 'o2', 'he', 'top'];

export type Step = 'start' | 'o2' | 'he' | 'top';

/** The cylinder after one step. */
export interface Stage {
	step: Step;
	/** Gauge pressure read at the fill temperature after this step, bar. */
	pressure: number;
	/** Pressure added by this step, bar (0 for "start"). */
	added: number;
	/** Mix in the cylinder after this step. */
	mix: Mix;
	/** Fraction of the content, by amount of gas, from each origin (sums to 1; empty: all 0). */
	parts: Record<Origin, number>;
	/** Content relative to the full cylinder, by pressure: 1/3 at 100 bar of 300 (the bottle drawing). */
	fill: number;
}

export type BlendError =
	| { code: 'invalid'; field: InvalidField }
	| { code: 'missing-source'; role: 'o2' | 'he' | 'top' }
	/** The sources cannot make the target (e.g. top-up with He for a nitrox, or two identical sources). */
	| { code: 'impossible' }
	/** The start must be drained: too much of a gas, or already above the target. `drainTo`: the highest
	 * starting pressure (gauge, bar, at the fill temperature) that makes the blend possible. */
	| { code: 'drain'; excess: 'o2' | 'he' | 'pressure'; drainTo: number }
	/** A step needs a higher pressure than its source has (no booster). */
	| { code: 'source-pressure'; role: 'o2' | 'he' | 'top'; needed: number; available: number };

export type InvalidField = 'target' | 'targetPressure' | 'volume' | 'start' | 'startPressure' | 'temperature';

export type Warning = 'outside-fit';

export interface BlendPlan {
	ok: true;
	kind: BlendKind;
	/** start, o2, (he), top: the He step is left out of nitrox. */
	stages: Stage[];
	/** Free gas volume of the full cylinder, L at 1 bar and 15 °C. */
	freeGas: number;
	warnings: Warning[];
	sources: { o2: Source; he?: Source; top: Source };
}

export type BlendResult = BlendPlan | { ok: false; error: BlendError };

const validMix = (m: Mix) =>
	Number.isFinite(m.o2) && Number.isFinite(m.he) && m.o2 >= 0 && m.he >= 0 && m.o2 + m.he <= 1 + 1e-9;
const nonNegative = (x: number) => Number.isFinite(x) && x >= 0;

function invalidField(input: BlendInput): InvalidField | undefined {
	if (!validMix(input.target) || input.target.o2 <= 0) return 'target';
	if (!(input.targetPressure > 0) || !Number.isFinite(input.targetPressure)) return 'targetPressure';
	if (!(input.volume > 0) || !Number.isFinite(input.volume)) return 'volume';
	if (!validMix(input.start)) return 'start';
	if (!nonNegative(input.startPressure)) return 'startPressure';
	if (!(input.temperature > 0) || !Number.isFinite(input.temperature)) return 'temperature';
	return undefined;
}

/** Moles to take from each source (He 0 for nitrox), for a given starting pressure; null if the
 * sources cannot make the target at all. Amounts may be negative: see blend(). */
function amounts(input: BlendInput, startPressure: number, o2: Source, he: Source | undefined, top: Source) {
	const { target, start, temperature, volume, model } = input;
	// Target content at the reference temperature; start content as read at the fill temperature.
	const nTarget = moles(input.targetPressure, REFERENCE_TEMPERATURE, volume, target, model);
	const nStart = moles(startPressure, temperature, volume, start, model);
	const needO2 = nTarget * target.o2 - nStart * start.o2;
	const needHe = nTarget * target.he - nStart * start.he;
	const needAll = nTarget - nStart;
	if (he) {
		const x = solve3(
			[
				[o2.o2, he.o2, top.o2],
				[o2.he, he.he, top.he],
				[1, 1, 1]
			],
			[needO2, needHe, needAll]
		);
		return x && { o2: x[0], he: x[1], top: x[2], nStart, nTarget, helium: 0 };
	}
	const x = solve2(
		[
			[o2.o2, top.o2],
			[1, 1]
		],
		[needO2, needAll]
	);
	if (!x) return null;
	// Nitrox: the helium left in the cylinder or brought by a source stays, in place of N2.
	const helium = nStart * start.he + x[0] * o2.he + x[1] * top.he;
	return { o2: x[0], he: 0, top: x[1], nStart, nTarget, helium };
}

type Amounts = NonNullable<ReturnType<typeof amounts>>;
/** Below this many moles (relative to the target's content), an amount counts as 0. */
const EPSILON = 1e-9;
/** Helium a nitrox may contain: 0.5 %, within a helium analyser's accuracy. An "empty" trimix
 * cylinder still holds 1 atm of its gas: about 0.2 % He once filled to 200 bar. */
export const NITROX_HELIUM_TOLERANCE = 0.005;
const negative = (a: Amounts) => {
	const tolerance = -EPSILON * a.nTarget;
	if (a.o2 < tolerance) return 'o2';
	if (a.he < tolerance || a.helium > NITROX_HELIUM_TOLERANCE * a.nTarget) return 'he';
	if (a.top < tolerance) return 'pressure';
	return undefined;
};

/** The blend plan, or why it cannot be done. */
export function blend(input: BlendInput): BlendResult {
	const field = invalidField(input);
	if (field) return { ok: false, error: { code: 'invalid', field } };
	const trimix = input.kind === 'trimix';
	const target = trimix ? input.target : { ...input.target, he: 0 };
	const plan = { ...input, target };
	const { o2Source: o2, topSource: top } = input;
	const he = trimix ? input.heSource : undefined;
	if (!o2) return { ok: false, error: { code: 'missing-source', role: 'o2' } };
	if (trimix && !he) return { ok: false, error: { code: 'missing-source', role: 'he' } };
	if (!top) return { ok: false, error: { code: 'missing-source', role: 'top' } };

	const found = amounts(plan, input.startPressure, o2, he, top);
	if (!found) return { ok: false, error: { code: 'impossible' } };
	const excess = negative(found);
	if (excess) return drain(plan, excess, o2, he, top);

	// The steps, in order: O2, then He, then the top-up gas.
	const { temperature, volume, model } = plan;
	const a = { o2: Math.max(0, found.o2), he: Math.max(0, found.he), top: Math.max(0, found.top) };
	const s = plan.start;
	const startParts = {
		startO2: found.nStart * s.o2,
		startHe: found.nStart * s.he,
		startN2: found.nStart * n2Fraction(s)
	};
	const steps: { step: Step; added: Partial<Record<'o2' | 'he' | 'top', number>> }[] = [
		{ step: 'start', added: {} },
		{ step: 'o2', added: { o2: a.o2 } },
		...(trimix ? [{ step: 'he' as const, added: { o2: a.o2, he: a.he } }] : []),
		{ step: 'top', added: { o2: a.o2, he: a.he, top: a.top } }
	];
	const raw = steps.map(({ step, added }) => {
		const parts: Record<Origin, number> = { ...startParts, o2: added.o2 ?? 0, he: added.he ?? 0, top: added.top ?? 0 };
		const total = found.nStart + parts.o2 + parts.he + parts.top;
		const gasO2 = parts.startO2 + parts.o2 * o2.o2 + parts.he * (he?.o2 ?? 0) + parts.top * top.o2;
		const gasHe = parts.startHe + parts.o2 * o2.he + parts.he * (he?.he ?? 0) + parts.top * top.he;
		const mix = { o2: gasO2 / total, he: gasHe / total };
		return { step, parts, total, mix, pressure: pressure(total, temperature, volume, mix, model) };
	});
	const final = raw[raw.length - 1].pressure;
	const stages: Stage[] = raw.map((r, i) => ({
		step: r.step,
		pressure: r.pressure,
		added: i === 0 ? 0 : r.pressure - raw[i - 1].pressure,
		mix: r.mix,
		// An empty cylinder holds only air at gauge 0: drawn empty, no parts.
		parts: Object.fromEntries(ORIGINS.map((o) => [o, r.pressure > 1e-9 ? r.parts[o] / r.total : 0])) as Record<
			Origin,
			number
		>,
		fill: Math.max(0, r.pressure) / final
	}));

	// No booster: each source must be above the pressure the cylinder reaches with its gas.
	const roles = [
		{ role: 'o2' as const, source: o2, amount: a.o2, stage: stages[1] },
		...(he ? [{ role: 'he' as const, source: he, amount: a.he, stage: stages[2] }] : []),
		{ role: 'top' as const, source: top, amount: a.top, stage: stages[stages.length - 1] }
	];
	for (const { role, source, amount, stage } of roles) {
		if (amount > EPSILON * found.nTarget && stage.pressure > source.pressure + 1e-9) {
			return {
				ok: false,
				error: { code: 'source-pressure', role, needed: stage.pressure, available: source.pressure }
			};
		}
	}

	const warnings: Warning[] = [];
	const highest = Math.max(absolute(input.targetPressure), absolute(final));
	if (
		model === 'real' &&
		(highest > Z_MAX_PRESSURE || temperature < Z_TEMPERATURES[0] || temperature > Z_TEMPERATURES[1])
	) {
		warnings.push('outside-fit');
	}
	return {
		ok: true,
		kind: input.kind,
		stages,
		freeGas: freeGasVolume(input.targetPressure, REFERENCE_TEMPERATURE, volume, target, model),
		warnings,
		sources: { o2, he, top }
	};
}

/** Too much of a gas (or of everything) in the cylinder: the highest starting pressure that works,
 * found by bisection. Every amount is a monotonic function of the starting pressure (less gas in
 * the cylinder leaves more to add of each), so the pressures that work are an interval [0, P]. */
function drain(
	input: BlendInput,
	excess: 'o2' | 'he' | 'pressure',
	o2: Source,
	he: Source | undefined,
	top: Source
): BlendResult {
	// The amounts exist (blend() checked them at the start pressure): only their sign changes here.
	const works = (p: number) => !negative(amounts(input, p, o2, he, top) as Amounts);
	if (!works(0)) return { ok: false, error: { code: 'impossible' } };
	let low = 0;
	let high = input.startPressure;
	for (let i = 0; i < 60; i++) {
		const mid = (low + high) / 2;
		if (works(mid)) low = mid;
		else high = mid;
	}
	return { ok: false, error: { code: 'drain', excess, drainTo: low } };
}

/** Each role's possible sources among the gases in use: O2 = enriched, helium-free gases;
 * He = gases with helium; top-up = any gas but pure O2 or pure He. Lowest pressure first. */
export function candidates(gases: readonly Source[]) {
	const byPressure = [...gases].sort((a, b) => a.pressure - b.pressure);
	return {
		o2: byPressure.filter((g) => g.he === 0 && g.o2 > 0.21 + 1e-9),
		he: byPressure.filter((g) => g.he > 0),
		top: byPressure.filter((g) => g.o2 < 1 && g.he < 1)
	};
}

/** The blend with the sources picked automatically, unless `chosen` fixes one: the first combination
 * that works, saving the higher-pressure banks (lowest pressure first); else the last one's error.
 * With no candidate for a role, blend() reports the missing source. */
export function blendWith(
	input: Omit<BlendInput, 'o2Source' | 'heSource' | 'topSource'>,
	gases: readonly Source[],
	chosen: { o2?: string; he?: string; top?: string } = {}
): BlendResult {
	const all = candidates(gases);
	const pick = (role: 'o2' | 'he' | 'top'): (Source | undefined)[] => {
		const fixed = chosen[role] && gases.find((g) => g.id === chosen[role]);
		if (fixed) return [fixed];
		return all[role].length ? all[role] : [undefined];
	};
	const heList = input.kind === 'trimix' ? pick('he') : [undefined];
	let result: BlendResult = { ok: false, error: { code: 'impossible' } };
	for (const o2Source of pick('o2'))
		for (const heSource of heList)
			for (const topSource of pick('top')) {
				result = blend({ ...input, o2Source, heSource, topSource });
				if (result.ok) return result;
			}
	return result;
}
