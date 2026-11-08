import { afterEach, describe, expect, it } from 'vitest';
import {
	DEFAULT_LOCALE,
	LOCALES,
	LOCALE_CODES,
	fill,
	locale,
	localeInfo,
	placeholders,
	setLocale,
	split,
	t
} from './i18n';
import { en } from './locales/en';
import { format, PERCENT } from './units';

afterEach(() => setLocale('en', undefined));

/** Every text of a dictionary, by its path ("menu.about"). */
function texts(dict: object, prefix = ''): Record<string, unknown> {
	const out: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(dict)) {
		if (typeof value === 'object' && value !== null) Object.assign(out, texts(value, `${prefix}${key}.`));
		else out[`${prefix}${key}`] = value;
	}
	return out;
}

describe('languages', () => {
	it('English first and by default, eight languages with distinct codes', () => {
		expect(DEFAULT_LOCALE).toBe('en');
		expect(LOCALE_CODES).toEqual(['en', 'fr', 'de', 'es', 'it', 'nl', 'ja', 'zh']);
		expect(locale()).toBe('en');
		expect(t).toBe(en);
	});

	const reference = texts(en);
	for (const info of LOCALES) {
		it(`${info.code}: every English text, translated, with the same {placeholders}`, () => {
			const translated = texts(info.texts);
			expect(Object.keys(translated)).toEqual(Object.keys(reference));
			for (const [path, text] of Object.entries(translated)) {
				expect(typeof text, path).toBe('string');
				expect((text as string).trim(), path).not.toBe('');
				expect(placeholders(text as string), path).toEqual(placeholders(reference[path] as string));
			}
		});
	}

	it('translations are not left in English (except short shared words)', () => {
		const same = (code: string) =>
			Object.entries(texts(localeInfo(code as 'fr').texts)).filter(
				([path, text]) => text === reference[path] && (text as string).replace(/\{\w+\}/g, '').length > 12
			);
		for (const code of LOCALE_CODES.filter((c) => c !== 'en')) expect(same(code), code).toEqual([]);
	});

	it('switches the texts, the decimal separator and the page language', () => {
		const doc = { documentElement: { lang: 'en' } } as unknown as Document;
		expect(setLocale('de', doc)).toBe('de');
		expect(locale()).toBe('de');
		expect(t.menu.language).toBe('Sprache');
		expect(doc.documentElement.lang).toBe('de');
		expect(format(PERCENT, 0.325)).toBe('32,5 %');
		setLocale('zh', doc);
		expect(format(PERCENT, 0.325)).toBe('32.5 %');
		expect(t.menu.language).toBe('语言');
		// Without a document (unit tests, prerendering): only the texts.
		expect(setLocale('fr', undefined)).toBe('fr');
		expect(t.menu.language).toBe('Langue');
		// The default: the page's document.
		expect(setLocale('en')).toBe('en');
	});
});

describe('placeholders', () => {
	it('fills them, leaving unknown ones', () => {
		expect(fill('{used} of {total} in use', { used: 3, total: 4 })).toBe('3 of 4 in use');
		expect(fill('{a} and {b}', { a: 'x' })).toBe('x and {b}');
	});

	it('splits a text at its values', () => {
		expect(split('Recommended ≤ {density} down to {depth};', { density: '5.2 g/l', depth: '30 m' })).toEqual([
			{ text: 'Recommended ≤ ', value: false },
			{ text: '5.2 g/l', value: true },
			{ text: ' down to ', value: false },
			{ text: '30 m', value: true },
			{ text: ';', value: false }
		]);
		expect(split('{file}', { file: 'a.ts' })).toEqual([{ text: 'a.ts', value: true }]);
		expect(split('{unknown}!', {})).toEqual([
			{ text: '{unknown}', value: false },
			{ text: '!', value: false }
		]);
	});

	it('lists them sorted', () => {
		expect(placeholders('{b} {a} {b}')).toEqual(['a', 'b', 'b']);
		expect(placeholders('none')).toEqual([]);
	});
});
