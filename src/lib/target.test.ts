import { describe, expect, it } from 'vitest';
import { ambientFromDepth, depthFromAmbient } from './formulas';
import {
	DEFAULT_TARGET,
	setDensity,
	setDepth,
	setEnd,
	setHe,
	setKind,
	setMod,
	setO2,
	setPpo2,
	targetMix,
	view,
	type Target,
	type ViewPreferences
} from './target';

const m = (d: number) => ambientFromDepth(d, 'm');
const P: ViewPreferences = { o2Narcotic: true, depth: 'm', model: 'ideal' };
const N2_ONLY: ViewPreferences = { ...P, o2Narcotic: false };
const trimix: Target = { kind: 'trimix', o2: 0.21, he: 0.35, ppo2: 1.4, depth: m(60) };

describe('target mix', () => {
	it('defaults to EAN32 at PPO2 1.4, no depth', () => {
		const v = view(DEFAULT_TARGET, P);
		expect(depthFromAmbient(v.mod, 'm')).toBeCloseTo(33.75, 10);
		expect(v.end).toBeNull();
		expect(v.n2).toBeCloseTo(0.68, 12);
		expect(v.at).toBe(v.mod); // partial pressures at the MOD without a depth
		expect(v.pp.o2).toBeCloseTo(1.4, 12);
		expect(v.errors).toEqual([]);
		expect(v.warnings).toEqual([]);
		expect(v.valid).toBe(true);
	});

	it('has no helium for nitrox, keeping it for trimix', () => {
		const t = setKind({ ...trimix }, 'nitrox');
		expect(targetMix(t)).toEqual({ o2: 0.21, he: 0 });
		expect(view(t, P).end).toBeNull();
		expect(targetMix(setKind(t, 'trimix'))).toEqual({ o2: 0.21, he: 0.35 });
	});

	it('links %O2, MOD and PPO2', () => {
		let t = setO2(DEFAULT_TARGET, 0.36);
		expect(depthFromAmbient(view(t, P).mod, 'm')).toBeCloseTo(28.89, 2);
		t = setMod(t, m(40));
		expect(t.o2).toBeCloseTo(0.28, 12);
		t = setPpo2(t, 1.6); // MOD kept at 40 m
		expect(t.o2).toBeCloseTo(0.32, 12);
		expect(depthFromAmbient(view(t, P).mod, 'm')).toBeCloseTo(40, 10);
	});

	it('links %He and END at the depth', () => {
		const v = view(trimix, P);
		expect(depthFromAmbient(v.end!, 'm')).toBeCloseTo(35.5, 10);
		expect(v.at).toBe(m(60));
		expect(v.pp.he).toBeCloseTo(2.45, 12);
		expect(v.pp.n2).toBeCloseTo(3.08, 12);
		let t = setEnd(trimix, m(30), true);
		expect(t.he).toBeCloseTo(1 - 4 / 7, 12);
		t = setHe(t, 0.5);
		expect(depthFromAmbient(view(t, P).end!, 'm')).toBeCloseTo(25, 10);
		// N2 only: END changes with %O2 too.
		const n2Only = setEnd(trimix, m(30), false);
		expect(depthFromAmbient(view(n2Only, N2_ONLY).end!, 'm')).toBeCloseTo(30, 10);
		expect(view(setO2(n2Only, 0.18), N2_ONLY).end).not.toBeCloseTo(m(30), 3);
	});

	it('recomputes the END when the depth changes; ignores END without a depth', () => {
		const t = setDepth(trimix, m(50));
		expect(depthFromAmbient(view(t, P).end!, 'm')).toBeCloseTo(29, 10);
		const none = setDepth(trimix, null);
		expect(view(none, P).end).toBeNull();
		expect(setEnd(none, m(30), true)).toBe(none);
	});

	it('gives the gas density at the depth, with the ceilings', () => {
		// 21/35 at 60 m: 7 bar × 20.446 g/mol / (R × 273.15 K) = 6.30 g/l, above the 6.2 maximum.
		const v = view(trimix, P);
		expect(v.density.value).toBeCloseTo(6.302, 3);
		expect(v.warnings).toEqual(['depth-beyond-mod', 'density-maximum']);
		expect(depthFromAmbient(v.density.recommendedDepth, 'm')).toBeCloseTo(47.8, 1);
		expect(depthFromAmbient(v.density.maximumDepth, 'm')).toBeCloseTo(58.9, 1);
		// 40 % He: 5.93 g/l, above the recommended 5.2 only.
		const more = view({ ...trimix, he: 0.4, ppo2: 1.6 }, P);
		expect(more.density.value).toBeCloseTo(5.932, 3);
		expect(more.warnings).toEqual(['density-recommended']);
		// 10/70: light enough (hypoxic only).
		expect(view({ ...trimix, o2: 0.1, he: 0.7, ppo2: 1.6 }, P).warnings).toEqual(['hypoxic']);
		// No depth: the density at the MOD, no warning.
		const nitrox = view(DEFAULT_TARGET, P);
		expect(nitrox.density.value).toBeCloseTo(5.642, 3);
		expect(nitrox.warnings).toEqual([]);
		// Real gases: within 1 %.
		expect(view(trimix, { ...P, model: 'real' }).density.value).toBeCloseTo(6.3, 1);
	});

	it('links %He, END and gas density at the depth', () => {
		// Density typed: He follows, END follows He.
		const t = setDensity(trimix, 5.2, P);
		expect(t.o2).toBe(0.21);
		expect(t.he).toBeCloseTo(0.499, 3);
		const v = view(t, P);
		expect(v.density.value).toBeCloseTo(5.2, 10);
		expect(depthFromAmbient(v.end!, 'm')).toBeCloseTo(25.08, 2);
		// END typed: He and density follow.
		const fromEnd = setEnd(trimix, m(30), true);
		// He = 1 − 4/7 = 42.9 %: M = 18.559 g/mol, 7 bar × 18.559 / (R × 273.15 K) = 5.721 g/l.
		expect(view(fromEnd, P).density.value).toBeCloseTo(5.721, 3);
		expect(view(setDensity(fromEnd, view(fromEnd, P).density.value, P), P).end).toBeCloseTo(m(30), 10);
		// Real gases and feet.
		const real = { ...P, model: 'real' as const };
		expect(view(setDensity(trimix, 6, real), real).density.value).toBeCloseTo(6, 10);
		const ft = { ...P, depth: 'ft' as const };
		const deep = { ...trimix, depth: ambientFromDepth(198, 'ft') };
		expect(view(setDensity(deep, 5.5, ft), ft).density.value).toBeCloseTo(5.5, 10);
	});

	it('ignores a density without a depth', () => {
		const none = setDepth(trimix, null);
		expect(setDensity(none, 5.2, P)).toBe(none);
	});

	it('gives the density ceilings in feet (33 ft per atm)', () => {
		const v = view({ ...trimix, depth: ambientFromDepth(198, 'ft') }, { ...P, depth: 'ft' });
		// 7 atm = 7.093 bar: 6.39 g/l.
		expect(v.density.value).toBeCloseTo(6.386, 3);
		expect(depthFromAmbient(v.density.maximumDepth, 'ft')).toBeCloseTo(191.3, 1);
	});

	it('reports impossible mixes and warnings', () => {
		expect(view({ ...trimix, o2: 0 }, P).errors).toContain('o2');
		expect(view({ ...trimix, o2: 1.2, he: 0 }, P).errors).toContain('o2');
		expect(view({ ...trimix, he: -0.1 }, P).errors).toContain('he');
		expect(view({ ...trimix, he: 1 }, P).errors).toContain('he');
		const sum = view({ ...trimix, o2: 0.5, he: 0.6 }, P);
		expect(sum.errors).toContain('sum');
		expect(sum.valid).toBe(false);
		expect(view({ ...trimix, ppo2: 0 }, P).errors).toContain('ppo2');
		expect(view({ ...trimix, depth: m(70) }, P).warnings).toEqual(['depth-beyond-mod', 'density-maximum']);
		const hypoxic = view({ ...trimix, o2: 0.1, he: 0.7, depth: m(100) }, P);
		expect(hypoxic.warnings).toEqual(['hypoxic', 'density-recommended']);
		expect(hypoxic.errors).toEqual([]);
		expect(hypoxic.valid).toBe(true);
	});
});
