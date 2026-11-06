import { describe, expect, it } from 'vitest';
import { blend, type BlendPlan } from './blend';
import { legend, segments, GAS_COLORS } from './bottle';
import { AIR, REFERENCE_TEMPERATURE } from './formulas';

const plan = blend({
	kind: 'trimix',
	target: { o2: 0.21, he: 0.35 },
	targetPressure: 300,
	volume: 12,
	start: { o2: 0.18, he: 0.45 },
	startPressure: 100,
	temperature: REFERENCE_TEMPERATURE,
	model: 'ideal',
	o2Source: { id: 'o2', name: 'O2', o2: 1, he: 0, pressure: 300 },
	heSource: { id: 'he', name: 'He', o2: 0, he: 1, pressure: 300 },
	topSource: { id: 'air', name: 'Air', ...AIR, pressure: 300 }
}) as BlendPlan;

describe('bottle drawing', () => {
	it('fills the current bottle to its share of the target pressure', () => {
		const start = plan.stages[0];
		expect(start.fill).toBeCloseTo(100 / 300, 9); // 100 bar of 300: 1/3
		const s = segments(start);
		expect(s.map((x) => x.band)).toEqual(['O2', 'He', 'N2']);
		expect(s.map((x) => x.share.toFixed(2))).toEqual(['0.18', '0.45', '0.37']);
		expect(s[0].bottom).toBe(0);
		expect(s[1].bottom).toBeCloseTo(s[0].height, 12);
		const top = s[2].bottom + s[2].height;
		expect(top).toBeCloseTo(1 / 3, 9);
	});

	it('stacks the added gases on top, full at the end', () => {
		const final = segments(plan.stages[3]);
		expect(final.map((x) => x.origin)).toEqual(['startO2', 'startHe', 'startN2', 'o2', 'he', 'top']);
		expect(final.map((x) => x.color)).toEqual([
			GAS_COLORS.O2,
			GAS_COLORS.He,
			GAS_COLORS.N2,
			GAS_COLORS.O2,
			GAS_COLORS.He,
			GAS_COLORS.Air
		]);
		const last = final[final.length - 1];
		expect(last.bottom + last.height).toBeCloseTo(1, 12);
	});

	it('sums the legend by band', () => {
		const l = legend(plan.stages[1]);
		expect(l.map((x) => x.band)).toEqual(['O2', 'He', 'N2']);
		expect(l.reduce((a, x) => a + x.share, 0)).toBeCloseTo(1, 12);
		expect(legend(plan.stages[3]).map((x) => x.band)).toEqual(['O2', 'He', 'N2', 'Air']);
	});
});
