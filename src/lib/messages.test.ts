import { afterEach, describe, expect, it } from 'vitest';
import { setLocale } from './i18n';
import { blendErrorText, targetText, warningText } from './messages';
import { DEFAULT_PREFERENCES } from './units';

const p = DEFAULT_PREFERENCES;

afterEach(() => setLocale('en', undefined));

describe('messages', () => {
	it('explains every blend error', () => {
		expect(blendErrorText({ code: 'invalid', field: 'volume' }, p)).toBe('Check the cylinder volume.');
		expect(blendErrorText({ code: 'missing-source', role: 'top' }, p)).toContain('No top-up gas');
		expect(blendErrorText({ code: 'impossible' }, p)).toContain('cannot be made');
		expect(blendErrorText({ code: 'drain', excess: 'o2', drainTo: 37.46 }, p)).toBe(
			'There is too much O2 in the cylinder for this mix. Drain it down to 37.4 bar first.'
		);
		expect(blendErrorText({ code: 'drain', excess: 'he', drainTo: 0 }, p)).toContain('Empty it first.');
		expect(blendErrorText({ code: 'drain', excess: 'pressure', drainTo: 200 }, { ...p, pressure: 'psi' })).toContain(
			'2900 psi'
		);
		expect(blendErrorText({ code: 'source-pressure', role: 'o2', needed: 48.2, available: 20 }, p)).toBe(
			'The O2 gas (20 bar) is below the 48.2 bar this step reaches: use a fuller source or a booster.'
		);
	});

	it('has a text for every warning and target problem', () => {
		expect(warningText('outside-fit')).toContain('350 bar');
		expect(targetText('density-recommended')).toContain('5.2 g/l');
		expect(targetText('density-maximum')).toContain('6.2 g/l');
	});

	it('speaks the current language, with its decimal separator', () => {
		setLocale('fr', undefined);
		expect(blendErrorText({ code: 'drain', excess: 'o2', drainTo: 37.46 }, p)).toBe(
			"Il y a trop d'O2 dans le bloc pour ce mélange. Videz-le d’abord jusqu’à 37,4 bar."
		);
		expect(targetText('hypoxic')).toBe('Mélange hypoxique : non respirable en surface.');
		setLocale('ja', undefined);
		// No space between the sentences in Japanese.
		expect(blendErrorText({ code: 'drain', excess: 'he', drainTo: 0 }, p)).toBe(
			'このガスにはタンク内のHeが多すぎます。まず空にしてください。'
		);
	});
});
