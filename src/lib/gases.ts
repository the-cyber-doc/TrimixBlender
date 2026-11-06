// The registered source gases (Available gases section) and their labels.

import { formatNumber } from './units';
import type { Source } from './blend';
import type { Mix } from './formulas';

/** A registered gas: a source the blend may use when `used` is checked. */
export interface Gas extends Source {
	used: boolean;
}

export const DEFAULT_GASES: Gas[] = [
	{ id: 'o2', name: 'O2', o2: 1, he: 0, pressure: 200, used: true },
	{ id: 'he', name: 'He', o2: 0, he: 1, pressure: 200, used: true },
	{ id: 'air-200', name: 'Air', o2: 0.21, he: 0, pressure: 200, used: true },
	{ id: 'air-300', name: 'Air', o2: 0.21, he: 0, pressure: 300, used: true }
];

/** A short name for a mix, as divers write it: "O2", "He", "Air", "Nx32", "Tx18/45", "Heliox 21/79". */
export function mixName(mix: Mix): string {
	const o2 = formatNumber(mix.o2 * 100, 1);
	const he = formatNumber(mix.he * 100, 1);
	if (mix.o2 >= 1 - 1e-9) return 'O2';
	if (mix.he >= 1 - 1e-9) return 'He';
	if (mix.he === 0) return Math.abs(mix.o2 - 0.21) < 1e-9 ? 'Air' : `Nx${o2}`;
	if (mix.o2 + mix.he >= 1 - 1e-9) return `Heliox ${o2}/${he}`;
	return `Tx${o2}/${he}`;
}

/** A gas's fields as typed: fractions 0..1, pressure ≥ 0, O2 + He ≤ 100 %. */
export function validGas(g: Pick<Gas, 'o2' | 'he' | 'pressure'>): boolean {
	const ok = (f: number) => Number.isFinite(f) && f >= 0 && f <= 1;
	return ok(g.o2) && ok(g.he) && g.o2 + g.he <= 1 + 1e-9 && Number.isFinite(g.pressure) && g.pressure >= 0;
}

/** A new gas (Add): air at 200 bar, with an ID unique in the list. */
export function newGas(existing: readonly Gas[]): Gas {
	let n = existing.length + 1;
	while (existing.some((g) => g.id === `gas-${n}`)) n++;
	return { id: `gas-${n}`, name: 'Air', o2: 0.21, he: 0, pressure: 200, used: true };
}
