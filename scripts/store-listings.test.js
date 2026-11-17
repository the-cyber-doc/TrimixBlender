import { describe, expect, it } from 'vitest';
import { LIMITS, check, files, load, stale } from './store-listings.js';

const listing = {
	app: 'en',
	play: 'en-US',
	apple: 'en-US',
	title: 'Trimix Blender',
	short_description: 'No account, no ads, no tracker. Blending.',
	full_description: ['No account, no ads, no tracker.', '', 'Blending.']
};

describe('store listings', () => {
	it('checks the texts', () => {
		expect(check([listing])).toEqual([]);
		expect(check([listing, listing])).toEqual(['en: twice']);
		expect(check([{ ...listing, title: ' ' }])).toEqual(['en: no title']);
		expect(check([{ ...listing, title: 'x'.repeat(LIMITS.title + 1) }])).toEqual([
			'en: title has 31 characters, at most 30'
		]);
		expect(check([{ ...listing, full_description: 'text' }])).toEqual([
			'en: full_description is not an array of lines'
		]);
		expect(check([{ ...listing, full_description: ['Blending.'] }])).toEqual([
			"en: full_description does not start with the short description's first sentence"
		]);
		expect(check([{ ...listing, short_description: undefined }])).toContain('en: no short_description');
	});

	it('writes each store its files', () => {
		const out = files([listing]);
		const full = 'No account, no ads, no tracker.\n\nBlending.\n';
		expect(out).toEqual({
			'fastlane/metadata/android/en-US/title.txt': 'Trimix Blender\n',
			'fastlane/metadata/android/en-US/short_description.txt': 'No account, no ads, no tracker. Blending.\n',
			'fastlane/metadata/android/en-US/full_description.txt': full,
			'fastlane/metadata/ios/en-US/name.txt': 'Trimix Blender\n',
			'fastlane/metadata/ios/en-US/description.txt': full
		});
	});

	it('has the repository files as in fastlane/listings.json', () => {
		expect(load()).toHaveLength(8);
		expect(stale()).toEqual([]);
	});
});
