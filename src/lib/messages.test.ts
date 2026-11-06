import { describe, expect, it } from 'vitest';
import { blendErrorText, TARGET_TEXT, WARNING_TEXT } from './messages';
import { DEFAULT_PREFERENCES } from './units';

const p = DEFAULT_PREFERENCES;

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
		expect(Object.keys(WARNING_TEXT)).toEqual(['outside-fit']);
		expect(Object.values(TARGET_TEXT).every((t) => t.length > 0)).toBe(true);
	});
});
