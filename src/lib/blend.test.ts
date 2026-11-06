import { describe, expect, it } from 'vitest';
import { blend, blendWith, candidates, type BlendInput, type BlendPlan, type BlendResult, type Source } from './blend';
import { AIR, REFERENCE_TEMPERATURE, celsiusToKelvin, moles } from './formulas';

const O2: Source = { id: 'o2', name: 'O2', o2: 1, he: 0, pressure: 200 };
const HE: Source = { id: 'he', name: 'He', o2: 0, he: 1, pressure: 200 };
const AIR_300: Source = { id: 'air', name: 'Air', ...AIR, pressure: 300 };
const AIR_200: Source = { id: 'air-200', name: 'Air', ...AIR, pressure: 200 };

/** An empty 12 L cylinder (air at gauge 0), filled to 200 bar at 15 °C, real gases. */
const input = (over: Partial<BlendInput> = {}): BlendInput => ({
	kind: 'nitrox',
	target: { o2: 0.32, he: 0 },
	targetPressure: 200,
	volume: 12,
	start: AIR,
	startPressure: 0,
	temperature: REFERENCE_TEMPERATURE,
	model: 'real',
	o2Source: O2,
	heSource: HE,
	topSource: AIR_300,
	...over
});

function ok(result: BlendResult): BlendPlan {
	if (!result.ok) throw new Error(`blend failed: ${JSON.stringify(result.error)}`);
	return result;
}
const pressures = (plan: BlendPlan) => plan.stages.map((s) => s.pressure);

/** The plan's final content, gas by gas, equals the target at the target pressure (15 °C). */
function expectOnTarget(i: BlendInput, plan: BlendPlan) {
	const final = plan.stages[plan.stages.length - 1];
	const he = i.kind === 'trimix' ? i.target.he : 0;
	expect(final.mix.o2).toBeCloseTo(i.target.o2, 9);
	expect(final.mix.he).toBeCloseTo(he, 9);
	const n = moles(final.pressure, i.temperature, i.volume, final.mix, i.model);
	expect(n).toBeCloseTo(moles(i.targetPressure, REFERENCE_TEMPERATURE, i.volume, i.target, i.model), 8);
	const parts = Object.values(final.parts).reduce((a, b) => a + b, 0);
	expect(parts).toBeCloseTo(1, 12);
	expect(final.fill).toBe(1);
}

describe('air', () => {
	it('is a plain top-up with air: nothing else added', () => {
		const i = input({ target: AIR, model: 'ideal' });
		const plan = ok(blend(i));
		expect(plan.stages.map((s) => s.step)).toEqual(['start', 'o2', 'top']);
		expect(plan.stages[1].added).toBeCloseTo(0, 9);
		expect(plan.stages[2].pressure).toBeCloseTo(200, 9);
		// The rest: the 1 atm of air an empty cylinder holds.
		expect(plan.stages[2].parts.top).toBeCloseTo(200 / 201.01325, 9);
		expectOnTarget(i, plan);
	});

	it('draws an empty cylinder empty', () => {
		const plan = ok(blend(input({ target: AIR })));
		expect(plan.stages[0].pressure).toBeCloseTo(0, 9);
		expect(plan.stages[0].fill).toBe(0);
		expect(Object.values(plan.stages[0].parts).every((p) => p === 0)).toBe(true);
	});
});

describe('nitrox', () => {
	it('matches the partial-pressure method with ideal gases (EAN32, 200 bar, empty)', () => {
		// a + x = 200, a + 0.21 x = 201.01325 × 0.32 − 1.01325 × 0.21 (absolute: the empty
		// cylinder holds 1 atm of air)  ⇒  a = 27.989 bar of O2 (textbook, gauge only: 27.85).
		const i = input({ model: 'ideal' });
		const plan = ok(blend(i));
		expect(pressures(plan)[1]).toBeCloseTo(27.989, 3);
		expect(plan.stages[2].added).toBeCloseTo(172.011, 3);
		expect(plan.freeGas).toBeCloseTo(2400, 6);
		expectOnTarget(i, plan);
	});

	it('needs less O2 pressure with real gases (O2 is more compressible)', () => {
		const ideal = ok(blend(input({ model: 'ideal' })));
		const real = ok(blend(input()));
		expect(real.stages[1].pressure).toBeLessThan(ideal.stages[1].pressure);
		expect(real.stages[1].pressure).toBeGreaterThan(24);
		expectOnTarget(input(), real);
	});

	it('tops up an existing nitrox', () => {
		const i = input({ start: { o2: 0.32, he: 0 }, startPressure: 50, target: { o2: 0.36, he: 0 } });
		const plan = ok(blend(i));
		expect(pressures(plan)[0]).toBeCloseTo(50, 8);
		expect(plan.stages[1].added).toBeGreaterThan(0);
		expect(plan.stages[0].parts.startO2).toBeCloseTo(0.32, 9);
		expect(plan.stages[0].parts.startN2).toBeCloseTo(0.68, 9);
		expectOnTarget(i, plan);
	});

	it('ignores the helium of the target and the helium source', () => {
		const plan = ok(blend(input({ target: { o2: 0.32, he: 0.2 }, heSource: undefined })));
		expect(plan.stages[2].mix.he).toBe(0);
		expect(plan.sources.he).toBeUndefined();
	});

	it('compensates for temperature: higher pressures while warm, the target once at 15 °C', () => {
		const warm = input({ model: 'ideal', temperature: celsiusToKelvin(35) });
		const plan = ok(blend(warm));
		// Ideal gas: P_abs scales with T. 201.01325 × 308.15 / 288.15 − 1.01325 = 213.952 bar.
		expect(pressures(plan)[2]).toBeCloseTo(213.952, 3);
		expectOnTarget(warm, plan);
		const real = input({ temperature: celsiusToKelvin(35) });
		expectOnTarget(real, ok(blend(real)));
	});
});

describe('trimix', () => {
	it('matches the partial-pressure method with ideal gases (21/35, 200 bar, empty)', () => {
		// He: 201.01325 × 0.35 = 70.355 bar; O2 and air: a + x = 129.645, a + 0.21 x = 42.
		const i = input({ kind: 'trimix', target: { o2: 0.21, he: 0.35 }, model: 'ideal' });
		const plan = ok(blend(i));
		expect(plan.stages.map((s) => s.step)).toEqual(['start', 'o2', 'he', 'top']);
		expect(pressures(plan)[1]).toBeCloseTo(18.702, 3);
		expect(plan.stages[2].added).toBeCloseTo(70.355, 3);
		expect(pressures(plan)[3]).toBeCloseTo(200, 8);
		// By amount of gas: 70.355 of 89.057 + 1.013 bar (the empty cylinder's air).
		expect(plan.stages[2].parts.he).toBeCloseTo(70.355 / 90.07, 3);
		expectOnTarget(i, plan);
	});

	it('differs from the ideal plan with real gases, and hits the target', () => {
		const ideal = ok(blend(input({ kind: 'trimix', target: { o2: 0.21, he: 0.35 }, model: 'ideal' })));
		const i = input({ kind: 'trimix', target: { o2: 0.21, he: 0.35 } });
		const real = ok(blend(i));
		// The ideal plan, followed with real gases, would miss: different pressures.
		expect(Math.abs(real.stages[1].pressure - ideal.stages[1].pressure)).toBeGreaterThan(0.3);
		expect(Math.abs(real.stages[2].pressure - ideal.stages[2].pressure)).toBeGreaterThan(0.3);
		expectOnTarget(i, real);
	});

	it('tops up an existing trimix', () => {
		const i = input({
			kind: 'trimix',
			start: { o2: 0.18, he: 0.45 },
			startPressure: 60,
			target: { o2: 0.18, he: 0.45 },
			targetPressure: 230
		});
		const plan = ok(blend(i));
		expect(plan.stages[0].parts.startHe).toBeCloseTo(0.45, 9);
		expectOnTarget(i, plan);
	});

	it('tops up with nitrox 32 instead of air', () => {
		const nx32: Source = { id: 'nx', name: 'Nx32', o2: 0.32, he: 0, pressure: 250 };
		const i = input({ kind: 'trimix', target: { o2: 0.3, he: 0.3 }, topSource: nx32 });
		const plan = ok(blend(i));
		expect(plan.sources.top).toBe(nx32);
		expectOnTarget(i, plan);
	});

	it('blends a hypoxic trimix (10/70)', () => {
		const i = input({ kind: 'trimix', target: { o2: 0.1, he: 0.7 } });
		expectOnTarget(i, ok(blend(i)));
	});

	it('has no warning inside the fitted range, one outside it (real gases only)', () => {
		expect(ok(blend(input({ kind: 'trimix', target: { o2: 0.21, he: 0.35 } }))).warnings).toEqual([]);
		const high = input({ targetPressure: 360, topSource: { ...AIR_300, pressure: 400 } });
		expect(ok(blend(high)).warnings).toEqual(['outside-fit']);
		expect(ok(blend({ ...high, model: 'ideal' })).warnings).toEqual([]);
		expect(ok(blend(input({ temperature: celsiusToKelvin(70) }))).warnings).toEqual(['outside-fit']);
		expect(ok(blend(input({ temperature: celsiusToKelvin(-20) }))).warnings).toEqual(['outside-fit']);
	});
});

describe('impossible mixes', () => {
	it('fails on too much O2 in the cylinder, with the drain-down pressure that works', () => {
		const i = input({ start: { o2: 0.5, he: 0 }, startPressure: 100 });
		const result = blend(i);
		expect(result.ok).toBe(false);
		if (result.ok || result.error.code !== 'drain') throw new Error('expected drain');
		expect(result.error.excess).toBe('o2');
		const drainTo = result.error.drainTo;
		expect(drainTo).toBeGreaterThan(0);
		expect(drainTo).toBeLessThan(100);
		// Drained to that pressure, the blend works without adding O2; a bit above, it does not.
		const drained = ok(blend({ ...i, startPressure: drainTo }));
		expect(drained.stages[1].added).toBeCloseTo(0, 4);
		expect(blend({ ...i, startPressure: drainTo + 0.5 }).ok).toBe(false);
	});

	it('fails on too much helium in the cylinder', () => {
		const result = blend(
			input({ kind: 'trimix', target: { o2: 0.21, he: 0.35 }, start: { o2: 0.1, he: 0.7 }, startPressure: 150 })
		);
		expect(result).toMatchObject({ ok: false, error: { code: 'drain', excess: 'he' } });
	});

	it('fails when the cylinder is already above the target pressure', () => {
		const result = blend(input({ target: AIR, startPressure: 220 }));
		expect(result).toMatchObject({ ok: false, error: { code: 'drain', excess: 'pressure' } });
		if (!result.ok && result.error.code === 'drain') expect(result.error.drainTo).toBeCloseTo(200, 6);
	});

	it('fails on a nitrox with helium in the cylinder: drain it to (almost) empty', () => {
		const i = input({ start: { o2: 0.21, he: 0.35 }, startPressure: 50, model: 'ideal' });
		const result = blend(i);
		if (result.ok || result.error.code !== 'drain') throw new Error('expected drain');
		expect(result.error.excess).toBe('he');
		// At most 0.5 % He once full: (P + 1.013) × 0.35 ≤ 0.005 × 201.013 ⇒ P ≤ 1.858 bar.
		expect(result.error.drainTo).toBeCloseTo(1.858, 2);
		const drained = ok(blend({ ...i, startPressure: result.error.drainTo }));
		expect(drained.stages[2].mix.he).toBeCloseTo(0.005, 4);
		// Empty: the 1 atm of trimix left is fine.
		expect(blend({ ...i, startPressure: 0 }).ok).toBe(true);
	});

	it('fails when even an empty cylinder cannot be made into the target', () => {
		// 15 % O2 from O2 and air, with no helium: O2 can only be added, never removed.
		expect(blend(input({ target: { o2: 0.15, he: 0 } }))).toEqual({ ok: false, error: { code: 'impossible' } });
		// ...also with gas in the cylinder.
		expect(blend(input({ target: { o2: 0.15, he: 0 }, startPressure: 50 }))).toEqual({
			ok: false,
			error: { code: 'impossible' }
		});
	});

	it('fails when the sources cannot make the mix', () => {
		// Topping up with O2 as well: O2 and top-up are the same gas.
		expect(blend(input({ topSource: O2 }))).toEqual({ ok: false, error: { code: 'impossible' } });
		expect(blend(input({ kind: 'trimix', target: { o2: 0.21, he: 0.35 }, topSource: O2 }))).toEqual({
			ok: false,
			error: { code: 'impossible' }
		});
		// A nitrox topped up with trimix brings helium in.
		const tx: Source = { id: 'tx', name: 'Tx', o2: 0.21, he: 0.35, pressure: 300 };
		expect(blend(input({ topSource: tx }))).toEqual({ ok: false, error: { code: 'impossible' } });
		expect(blend(input({ topSource: tx, start: { o2: 0.21, he: 0.1 }, startPressure: 10 }))).toEqual({
			ok: false,
			error: { code: 'impossible' }
		});
	});

	it('fails when a source has too little pressure (no booster)', () => {
		const lowO2 = { ...O2, pressure: 20 };
		expect(blend(input({ o2Source: lowO2, target: { o2: 0.4, he: 0 } }))).toMatchObject({
			ok: false,
			error: { code: 'source-pressure', role: 'o2', available: 20 }
		});
		expect(
			blend(input({ kind: 'trimix', target: { o2: 0.21, he: 0.35 }, heSource: { ...HE, pressure: 50 } }))
		).toMatchObject({ ok: false, error: { code: 'source-pressure', role: 'he' } });
		expect(blend(input({ targetPressure: 230, topSource: AIR_200 }))).toMatchObject({
			ok: false,
			error: { code: 'source-pressure', role: 'top', available: 200 }
		});
		// A source not used at all may be empty.
		expect(blend(input({ target: AIR, o2Source: { ...O2, pressure: 0 } })).ok).toBe(true);
	});

	it('fails on missing sources', () => {
		expect(blend(input({ o2Source: undefined }))).toEqual({ ok: false, error: { code: 'missing-source', role: 'o2' } });
		expect(blend(input({ kind: 'trimix', heSource: undefined }))).toEqual({
			ok: false,
			error: { code: 'missing-source', role: 'he' }
		});
		expect(blend(input({ topSource: undefined }))).toEqual({
			ok: false,
			error: { code: 'missing-source', role: 'top' }
		});
	});

	it('rejects invalid inputs', () => {
		const field = (over: Partial<BlendInput>) => {
			const r = blend(input(over));
			return !r.ok && r.error.code === 'invalid' ? r.error.field : undefined;
		};
		expect(field({ target: { o2: 0.6, he: 0.6 } })).toBe('target');
		expect(field({ target: { o2: 0, he: 0 } })).toBe('target');
		expect(field({ target: { o2: NaN, he: 0 } })).toBe('target');
		expect(field({ target: { o2: 0.3, he: -0.1 } })).toBe('target');
		expect(field({ targetPressure: 0 })).toBe('targetPressure');
		expect(field({ targetPressure: Infinity })).toBe('targetPressure');
		expect(field({ volume: -1 })).toBe('volume');
		expect(field({ volume: Infinity })).toBe('volume');
		expect(field({ start: { o2: 1.2, he: 0 } })).toBe('start');
		expect(field({ startPressure: -5 })).toBe('startPressure');
		expect(field({ startPressure: NaN })).toBe('startPressure');
		expect(field({ temperature: 0 })).toBe('temperature');
		expect(field({ temperature: NaN })).toBe('temperature');
	});
});

describe('choosing the sources', () => {
	const gases = [AIR_300, HE, O2, AIR_200];
	const { o2Source: _o2, heSource: _he, topSource: _top, ...rest } = input();

	it('sorts candidates per role, lowest pressure first', () => {
		const nx50: Source = { id: 'nx50', name: 'Nx50', o2: 0.5, he: 0, pressure: 150 };
		const all = candidates([...gases, nx50]);
		expect(all.o2.map((g) => g.id)).toEqual(['nx50', 'o2']);
		expect(all.he.map((g) => g.id)).toEqual(['he']);
		expect(all.top.map((g) => g.id)).toEqual(['nx50', 'air-200', 'air']);
	});

	it('saves the 300 bar bank when 200 bar is enough, uses it when not', () => {
		expect(ok(blendWith(rest, gases)).sources.top.id).toBe('air-200');
		expect(ok(blendWith({ ...rest, targetPressure: 230 }, gases)).sources.top.id).toBe('air');
	});

	it('keeps a chosen source, and falls back to automatic for an unknown one', () => {
		expect(ok(blendWith(rest, gases, { top: 'air' })).sources.top.id).toBe('air');
		expect(ok(blendWith(rest, gases, { top: 'gone' })).sources.top.id).toBe('air-200');
		expect(blendWith({ ...rest, targetPressure: 230 }, gases, { top: 'air-200' })).toMatchObject({
			ok: false,
			error: { code: 'source-pressure', role: 'top' }
		});
	});

	it('picks helium for trimix only', () => {
		const tx = { ...rest, kind: 'trimix' as const, target: { o2: 0.21, he: 0.35 } };
		expect(ok(blendWith(tx, gases)).sources.he?.id).toBe('he');
		expect(ok(blendWith(rest, gases)).sources.he).toBeUndefined();
	});

	it('reports a missing source', () => {
		expect(blendWith(rest, [AIR_300])).toEqual({ ok: false, error: { code: 'missing-source', role: 'o2' } });
	});
});
