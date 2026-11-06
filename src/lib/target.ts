// The target mix and its linked fields: %O2 ↔ MOD ↔ PPO2, %He ↔ END. Only %O2, %He,
// the PPO2 limit and the depth are stored; MOD and END are always derived from them,
// and editing one of them changes the stored fraction instead. The formulas are in formulas.ts.

import { endAmbient, heliumForEnd, modAmbient, n2Fraction, o2ForMod, partialPressure, type Mix } from './formulas';
import type { BlendKind } from './blend';

export interface Target {
	kind: BlendKind;
	/** Fractions 0..1. `he` is kept while nitrox is selected (back when switching to trimix). */
	o2: number;
	he: number;
	/** PPO2 limit for the MOD, bar. */
	ppo2: number;
	/** Target depth as an ambient pressure (formulas.ts), or null: no END then. */
	depth: number | null;
}

export const DEFAULT_TARGET: Target = { kind: 'nitrox', o2: 0.32, he: 0, ppo2: 1.4, depth: null };

/** The mix actually blended: no helium for nitrox. */
export const targetMix = (t: Target): Mix => ({ o2: t.o2, he: t.kind === 'trimix' ? t.he : 0 });

export type TargetProblem = 'o2' | 'he' | 'sum' | 'ppo2' | 'depth-beyond-mod' | 'hypoxic';

export interface TargetView {
	mix: Mix;
	n2: number;
	/** MOD as an ambient pressure. */
	mod: number;
	/** END as an ambient pressure; null without a depth, or for nitrox. */
	end: number | null;
	/** Where the partial pressures are given: the depth, else the MOD (ambient pressure). */
	at: number;
	pp: { o2: number; he: number; n2: number };
	/** No blend with these. */
	errors: TargetProblem[];
	warnings: TargetProblem[];
	valid: boolean;
}

/** Below this O2 fraction a mix cannot be breathed at the surface (hypoxic): a warning. [noaa-6] */
export const HYPOXIC_O2 = 0.18;

export function view(t: Target, o2Narcotic: boolean): TargetView {
	const mix = targetMix(t);
	const n2 = n2Fraction(mix);
	const mod = modAmbient(mix.o2, t.ppo2);
	const end = t.kind === 'trimix' && t.depth !== null ? endAmbient(mix, t.depth, o2Narcotic) : null;
	const at = t.depth ?? mod;
	const errors: TargetProblem[] = [];
	if (!(mix.o2 > 0 && mix.o2 <= 1)) errors.push('o2');
	if (!(mix.he >= 0 && mix.he < 1)) errors.push('he');
	if (n2 < -1e-9) errors.push('sum');
	if (!(t.ppo2 > 0)) errors.push('ppo2');
	const warnings: TargetProblem[] = [];
	if (t.depth !== null && t.depth > mod + 1e-9) warnings.push('depth-beyond-mod');
	if (mix.o2 < HYPOXIC_O2) warnings.push('hypoxic');
	return {
		mix,
		n2,
		mod,
		end,
		at,
		pp: { o2: partialPressure(mix.o2, at), he: partialPressure(mix.he, at), n2: partialPressure(n2, at) },
		errors,
		warnings,
		valid: errors.length === 0
	};
}

/** %O2 typed: the MOD follows (derived). */
export const setO2 = (t: Target, o2: number): Target => ({ ...t, o2 });

/** MOD typed (ambient pressure): %O2 = PPO2 / P_MOD. */
export const setMod = (t: Target, mod: number): Target => ({ ...t, o2: o2ForMod(mod, t.ppo2) });

/** PPO2 limit typed: the MOD is kept, %O2 follows. */
export const setPpo2 = (t: Target, ppo2: number): Target => ({
	...t,
	ppo2,
	o2: o2ForMod(modAmbient(t.o2, t.ppo2), ppo2)
});

/** %He typed: the END follows (derived). */
export const setHe = (t: Target, he: number): Target => ({ ...t, he });

/** END typed (ambient pressure): %He follows. Needs a depth (no END without one). */
export const setEnd = (t: Target, end: number, o2Narcotic: boolean): Target =>
	t.depth === null ? t : { ...t, he: heliumForEnd(end, t.depth, t.o2, o2Narcotic) };

export const setDepth = (t: Target, depth: number | null): Target => ({ ...t, depth });

export const setKind = (t: Target, kind: BlendKind): Target => ({ ...t, kind });
