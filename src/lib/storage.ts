// What the app remembers on this device (localStorage): the preferences and the last blend.
// Saved data is checked field by field on load: anything missing, of the wrong type or from
// an older version falls back to its default, so a bad entry never breaks the app.

import { REFERENCE_TEMPERATURE, type Mix } from './formulas';
import { DEFAULT_GASES, validGas, type Gas } from './gases';
import { LOCALE_CODES } from './i18n';
import { DEFAULT_TARGET, type Target } from './target';
import { DEFAULT_PREFERENCES, type Preferences } from './units';

export type SectionId = 'gases' | 'target' | 'mix';

export interface MixToDo {
	start: Mix;
	/** Gauge, bar. */
	startPressure: number;
	/** Water volume, L. */
	volume: number;
	/** Gauge, bar. */
	targetPressure: number;
	compensate: boolean;
	/** Fill temperature, K (used when `compensate`). */
	temperature: number;
	/** Chosen source per role (a gas ID); absent: automatic. */
	sources: { o2?: string; he?: string; top?: string };
}

export interface AppState {
	gases: Gas[];
	target: Target;
	mix: MixToDo;
	open: Record<SectionId, boolean>;
}

export const DEFAULT_MIX: MixToDo = {
	start: { o2: 0.21, he: 0 },
	startPressure: 0,
	volume: 12,
	targetPressure: 200,
	compensate: false,
	temperature: REFERENCE_TEMPERATURE + 20,
	sources: {}
};

export const defaultState = (): AppState =>
	structuredClone({
		gases: DEFAULT_GASES,
		target: DEFAULT_TARGET,
		mix: DEFAULT_MIX,
		open: { gases: true, target: true, mix: true }
	});

export const STATE_KEY = 'blender.state';
export const PREFERENCES_KEY = 'blender.preferences';

type Json = Record<string, unknown>;
const isObject = (v: unknown): v is Json => typeof v === 'object' && v !== null && !Array.isArray(v);
const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/** Each field of `defaults` from `saved` when it has the same type (a finite number for numbers), else the default. */
function pick<T extends object>(defaults: T, saved: unknown): T {
	const out = { ...defaults };
	if (!isObject(saved)) return out;
	for (const key of Object.keys(defaults) as (keyof T)[]) {
		const value = saved[key as string];
		const fallback = defaults[key];
		if (typeof fallback === 'number' ? finite(value) : typeof value === typeof fallback) out[key] = value as T[keyof T];
	}
	return out;
}

/** One of `allowed`, else the default. */
const oneOf = <T>(value: unknown, allowed: readonly T[], fallback: T): T =>
	allowed.includes(value as T) ? (value as T) : fallback;

export function parsePreferences(saved: unknown): Preferences {
	const p = pick(DEFAULT_PREFERENCES, saved);
	return {
		temperature: oneOf(p.temperature, ['C', 'F'], DEFAULT_PREFERENCES.temperature),
		pressure: oneOf(p.pressure, ['bar', 'psi'], DEFAULT_PREFERENCES.pressure),
		volume: oneOf(p.volume, ['l', 'cuft'], DEFAULT_PREFERENCES.volume),
		depth: oneOf(p.depth, ['m', 'ft'], DEFAULT_PREFERENCES.depth),
		model: oneOf(p.model, ['real', 'ideal'], DEFAULT_PREFERENCES.model),
		o2Narcotic: p.o2Narcotic,
		language: oneOf(p.language, LOCALE_CODES, DEFAULT_PREFERENCES.language)
	};
}

function parseGases(saved: unknown): Gas[] {
	if (!Array.isArray(saved)) return structuredClone(DEFAULT_GASES);
	const template: Gas = { id: '', name: '', o2: 0, he: 0, pressure: 0, used: true };
	const gases = saved
		.map((g) => pick(template, g))
		.filter((g, i, all) => g.id !== '' && validGas(g) && all.findIndex((other) => other.id === g.id) === i);
	return gases;
}

export function parseState(saved: unknown): AppState {
	const defaults = defaultState();
	if (!isObject(saved)) return defaults;
	const t = pick(defaults.target, saved.target);
	const savedTarget = isObject(saved.target) ? saved.target : {};
	const target: Target = {
		...t,
		kind: oneOf(t.kind, ['nitrox', 'trimix'], defaults.target.kind),
		depth: finite(savedTarget.depth) ? savedTarget.depth : null
	};
	const m = pick(defaults.mix, saved.mix);
	const savedMix = isObject(saved.mix) ? saved.mix : {};
	const sources = pick({ o2: '', he: '', top: '' }, savedMix.sources);
	const mix: MixToDo = {
		...m,
		start: pick(defaults.mix.start, savedMix.start),
		sources: Object.fromEntries(Object.entries(sources).filter(([, id]) => id !== ''))
	};
	return { gases: parseGases(saved.gases), target, mix, open: pick(defaults.open, saved.open) };
}

/** The browser's localStorage; null where there is none or it is blocked (reading it can throw). */
export function browserStorage(): Storage | null {
	try {
		return globalThis.localStorage ?? null;
	} catch {
		return null;
	}
}

/** Reads a saved entry: undefined when absent, unreadable or storage is blocked (private mode). */
export function load(key: string, storage: Pick<Storage, 'getItem'> | null = browserStorage()): unknown {
	try {
		const text = storage?.getItem(key);
		return text ? JSON.parse(text) : undefined;
	} catch {
		return undefined;
	}
}

/** Saves an entry; silently does nothing when storage is blocked or full. */
export function save(key: string, value: unknown, storage: Pick<Storage, 'setItem'> | null = browserStorage()) {
	try {
		storage?.setItem(key, JSON.stringify(value));
	} catch {
		// storage blocked or full: kept for this visit only
	}
}
