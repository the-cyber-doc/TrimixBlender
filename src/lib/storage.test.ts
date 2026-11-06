import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_PREFERENCES } from './units';
import { browserStorage, defaultState, load, parsePreferences, parseState, save } from './storage';

describe('preferences', () => {
	it('falls back to the defaults', () => {
		expect(parsePreferences(undefined)).toEqual(DEFAULT_PREFERENCES);
		expect(parsePreferences({ pressure: 'kPa', volume: 3, o2Narcotic: 'yes' })).toEqual(DEFAULT_PREFERENCES);
	});

	it('keeps valid saved values', () => {
		const imperial = {
			temperature: 'F',
			pressure: 'psi',
			volume: 'cuft',
			depth: 'ft',
			model: 'ideal',
			o2Narcotic: false
		};
		expect(parsePreferences(imperial)).toEqual(imperial);
	});
});

describe('state', () => {
	it('falls back to the defaults', () => {
		expect(parseState(undefined)).toEqual(defaultState());
		expect(parseState([])).toEqual(defaultState());
		expect(parseState({ gases: 'x', target: 1, mix: null })).toEqual(defaultState());
	});

	it('returns fresh copies', () => {
		const a = defaultState();
		a.gases[0].pressure = 1;
		expect(defaultState().gases[0].pressure).toBe(200);
	});

	it('keeps valid saved values, drops the rest', () => {
		const saved = {
			gases: [
				{ id: 'a', name: 'Nx32', o2: 0.32, he: 0, pressure: 230, used: false },
				{ id: 'a', name: 'duplicate', o2: 0.32, he: 0, pressure: 230, used: false },
				{ id: '', name: 'no id', o2: 0.32, he: 0, pressure: 230, used: true },
				{ id: 'b', name: 'bad', o2: 0.9, he: 0.9, pressure: 230, used: true },
				'junk'
			],
			target: { kind: 'trimix', o2: 0.18, he: 0.45, ppo2: 1.3, depth: 5 },
			mix: {
				start: { o2: 0.32, he: 'x' },
				startPressure: 50,
				volume: Infinity,
				targetPressure: 230,
				compensate: true,
				temperature: 300,
				sources: { o2: 'a', he: 5 }
			},
			open: { gases: false, target: 'no' }
		};
		const state = parseState(saved);
		expect(state.gases).toEqual([saved.gases[0]]);
		expect(state.target).toEqual(saved.target);
		expect(state.mix).toEqual({
			start: { o2: 0.32, he: 0 },
			startPressure: 50,
			volume: 12,
			targetPressure: 230,
			compensate: true,
			temperature: 300,
			sources: { o2: 'a' }
		});
		expect(state.open).toEqual({ gases: false, target: true, mix: true });
	});

	it('checks the target kind and depth', () => {
		const state = parseState({ target: { kind: 'heliox', depth: 'deep' } });
		expect(state.target.kind).toBe('nitrox');
		expect(state.target.depth).toBeNull();
	});
});

describe('storage', () => {
	const memory = () => {
		const data = new Map<string, string>();
		return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) };
	};

	it('saves and loads JSON', () => {
		const s = memory();
		save('k', { a: 1 }, s);
		expect(load('k', s)).toEqual({ a: 1 });
		expect(load('missing', s)).toBeUndefined();
	});

	it('survives blocked or broken storage', () => {
		const broken = {
			getItem: () => {
				throw new Error('blocked');
			},
			setItem: () => {
				throw new Error('full');
			}
		};
		expect(load('k', broken)).toBeUndefined();
		expect(() => save('k', 1, broken)).not.toThrow();
		expect(load('k', { getItem: () => '{not json' })).toBeUndefined();
		expect(load('k', null)).toBeUndefined();
		expect(() => save('k', 1, null)).not.toThrow();
	});

	it("uses the browser's localStorage, if any", () => {
		const s = memory();
		vi.stubGlobal('localStorage', s);
		expect(browserStorage()).toBe(s);
		save('k', 2);
		expect(load('k')).toBe(2);
		vi.stubGlobal('localStorage', undefined);
		expect(browserStorage()).toBeNull();
		Object.defineProperty(globalThis, 'localStorage', {
			configurable: true,
			get() {
				throw new Error('SecurityError');
			}
		});
		expect(browserStorage()).toBeNull();
		vi.unstubAllGlobals();
	});
});
