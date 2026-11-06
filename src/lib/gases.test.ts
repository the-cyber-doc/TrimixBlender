import { describe, expect, it } from 'vitest';
import { DEFAULT_GASES, mixName, newGas, validGas } from './gases';

describe('gases', () => {
	it('defaults to O2 200, He 200, Air 200 and Air 300 bar', () => {
		expect(DEFAULT_GASES.map((g) => `${g.name} ${g.pressure}`)).toEqual(['O2 200', 'He 200', 'Air 200', 'Air 300']);
		expect(DEFAULT_GASES.every((g) => g.used && validGas(g))).toBe(true);
	});

	it('names mixes', () => {
		expect(mixName({ o2: 1, he: 0 })).toBe('O2');
		expect(mixName({ o2: 0, he: 1 })).toBe('He');
		expect(mixName({ o2: 0.21, he: 0 })).toBe('Air');
		expect(mixName({ o2: 0.32, he: 0 })).toBe('Nx32');
		expect(mixName({ o2: 0.185, he: 0.45 })).toBe('Tx18.5/45');
		expect(mixName({ o2: 0.21, he: 0.79 })).toBe('Heliox 21/79');
	});

	it('validates gases', () => {
		expect(validGas({ o2: 0.5, he: 0.5, pressure: 0 })).toBe(true);
		expect(validGas({ o2: 0.6, he: 0.5, pressure: 200 })).toBe(false);
		expect(validGas({ o2: -0.1, he: 0, pressure: 200 })).toBe(false);
		expect(validGas({ o2: 0.21, he: 1.1, pressure: 200 })).toBe(false);
		expect(validGas({ o2: NaN, he: 0, pressure: 200 })).toBe(false);
		expect(validGas({ o2: 0.21, he: 0, pressure: -1 })).toBe(false);
		expect(validGas({ o2: 0.21, he: 0, pressure: NaN })).toBe(false);
	});

	it('adds gases with unique IDs', () => {
		const a = newGas([]);
		expect(a).toMatchObject({ id: 'gas-1', name: 'Air', o2: 0.21, pressure: 200, used: true });
		expect(newGas([a]).id).toBe('gas-2');
		expect(newGas([{ ...a, id: 'gas-2' }]).id).toBe('gas-3');
	});
});
