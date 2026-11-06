import { describe, expect, it } from 'vitest';
import { ambientFromDepth, depthFromAmbient } from './formulas';
import {
	DEFAULT_TARGET,
	setDepth,
	setEnd,
	setHe,
	setKind,
	setMod,
	setO2,
	setPpo2,
	targetMix,
	view,
	type Target
} from './target';

const m = (d: number) => ambientFromDepth(d, 'm');
const trimix: Target = { kind: 'trimix', o2: 0.21, he: 0.35, ppo2: 1.4, depth: m(60) };

describe('target mix', () => {
	it('defaults to EAN32 at PPO2 1.4, no depth', () => {
		const v = view(DEFAULT_TARGET, true);
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
		expect(view(t, true).end).toBeNull();
		expect(targetMix(setKind(t, 'trimix'))).toEqual({ o2: 0.21, he: 0.35 });
	});

	it('links %O2, MOD and PPO2', () => {
		let t = setO2(DEFAULT_TARGET, 0.36);
		expect(depthFromAmbient(view(t, true).mod, 'm')).toBeCloseTo(28.89, 2);
		t = setMod(t, m(40));
		expect(t.o2).toBeCloseTo(0.28, 12);
		t = setPpo2(t, 1.6); // MOD kept at 40 m
		expect(t.o2).toBeCloseTo(0.32, 12);
		expect(depthFromAmbient(view(t, true).mod, 'm')).toBeCloseTo(40, 10);
	});

	it('links %He and END at the depth', () => {
		const v = view(trimix, true);
		expect(depthFromAmbient(v.end!, 'm')).toBeCloseTo(35.5, 10);
		expect(v.at).toBe(m(60));
		expect(v.pp.he).toBeCloseTo(2.45, 12);
		expect(v.pp.n2).toBeCloseTo(3.08, 12);
		let t = setEnd(trimix, m(30), true);
		expect(t.he).toBeCloseTo(1 - 4 / 7, 12);
		t = setHe(t, 0.5);
		expect(depthFromAmbient(view(t, true).end!, 'm')).toBeCloseTo(25, 10);
		// N2 only: END changes with %O2 too.
		const n2Only = setEnd(trimix, m(30), false);
		expect(depthFromAmbient(view(n2Only, false).end!, 'm')).toBeCloseTo(30, 10);
		expect(view(setO2(n2Only, 0.18), false).end).not.toBeCloseTo(m(30), 3);
	});

	it('recomputes the END when the depth changes; ignores END without a depth', () => {
		const t = setDepth(trimix, m(50));
		expect(depthFromAmbient(view(t, true).end!, 'm')).toBeCloseTo(29, 10);
		const none = setDepth(trimix, null);
		expect(view(none, true).end).toBeNull();
		expect(setEnd(none, m(30), true)).toBe(none);
	});

	it('reports impossible mixes and warnings', () => {
		expect(view({ ...trimix, o2: 0 }, true).errors).toContain('o2');
		expect(view({ ...trimix, o2: 1.2, he: 0 }, true).errors).toContain('o2');
		expect(view({ ...trimix, he: -0.1 }, true).errors).toContain('he');
		expect(view({ ...trimix, he: 1 }, true).errors).toContain('he');
		const sum = view({ ...trimix, o2: 0.5, he: 0.6 }, true);
		expect(sum.errors).toContain('sum');
		expect(sum.valid).toBe(false);
		expect(view({ ...trimix, ppo2: 0 }, true).errors).toContain('ppo2');
		expect(view({ ...trimix, depth: m(70) }, true).warnings).toEqual(['depth-beyond-mod']);
		const hypoxic = view({ ...trimix, o2: 0.1, he: 0.7, depth: m(100) }, true);
		expect(hypoxic.warnings).toEqual(['hypoxic']);
		expect(hypoxic.errors).toEqual([]);
		expect(hypoxic.valid).toBe(true);
	});
});
