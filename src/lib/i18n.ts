// The app's languages. English is the default and the reference (locales/en.ts); the language
// is a preference (Menu, saved on the device), never guessed from the browser.
// The texts in use are `t`, a live binding: setLocale() replaces it, and the root layout renders
// the whole app again (a {#key} on the language), so components read `t` without any reactivity.

import { de } from './locales/de';
import { en, type Dict } from './locales/en';
import { es } from './locales/es';
import { fr } from './locales/fr';
import { it } from './locales/it';
import { ja } from './locales/ja';
import { nl } from './locales/nl';
import { zh } from './locales/zh';
import { setDecimalSeparator } from './units';

export type { Dict };

export interface LocaleInfo {
	/** ISO 639-1 language code, also the <html lang>. */
	code: string;
	/** The language's own name. */
	name: string;
	/** The flag shown in the menu (Flag.svelte): ISO 3166 country code. */
	flag: 'gb' | 'fr' | 'de' | 'es' | 'it' | 'nl' | 'jp' | 'cn';
	/** Decimal separator of the numbers shown (typing accepts both). */
	decimal: '.' | ',';
	texts: Dict;
}

/** In the menu's order. */
export const LOCALES = [
	{ code: 'en', name: 'English', flag: 'gb', decimal: '.', texts: en },
	{ code: 'fr', name: 'Français', flag: 'fr', decimal: ',', texts: fr },
	{ code: 'de', name: 'Deutsch', flag: 'de', decimal: ',', texts: de },
	{ code: 'es', name: 'Español', flag: 'es', decimal: ',', texts: es },
	{ code: 'it', name: 'Italiano', flag: 'it', decimal: ',', texts: it },
	{ code: 'nl', name: 'Nederlands', flag: 'nl', decimal: ',', texts: nl },
	{ code: 'ja', name: '日本語', flag: 'jp', decimal: '.', texts: ja },
	{ code: 'zh', name: '简体中文', flag: 'cn', decimal: '.', texts: zh }
] as const satisfies readonly LocaleInfo[];

export type Locale = (typeof LOCALES)[number]['code'];

export const LOCALE_CODES: readonly Locale[] = LOCALES.map((l) => l.code);

export const DEFAULT_LOCALE: Locale = 'en';

export const localeInfo = (code: Locale): LocaleInfo => LOCALES.find((l) => l.code === code)!;

/** The texts of the current language. */
export let t: Dict = en;
let current: Locale = DEFAULT_LOCALE;

export const locale = (): Locale => current;

/** Switches the texts, the numbers' decimal separator and the page's language. Returns `code`. */
export function setLocale(code: Locale, doc: Pick<Document, 'documentElement'> | undefined = globalThis.document) {
	const info = localeInfo(code);
	current = code;
	t = info.texts;
	setDecimalSeparator(info.decimal);
	if (doc) doc.documentElement.lang = code;
	return code;
}

/** A text's {placeholders} replaced by their values: fill('{a} of {b}', { a: 1, b: 2 }) → "1 of 2". */
export function fill(text: string, values: Record<string, string | number>): string {
	return text.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

/** A text cut at its {placeholders}, each part marked as text or value: for markup around the
 * values (a value kept on one line, a file name as code). */
export function split(text: string, values: Record<string, string>): { text: string; value: boolean }[] {
	return text
		.split(/(\{\w+\})/)
		.filter((part) => part !== '')
		.map((part) => {
			const key = /^\{(\w+)\}$/.exec(part)?.[1];
			return key !== undefined && key in values ? { text: values[key], value: true } : { text: part, value: false };
		});
}

/** The {placeholders} of a text, sorted: each translation must have the same as English. */
export const placeholders = (text: string): string[] => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
