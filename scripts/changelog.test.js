import { describe, expect, it } from 'vitest';
import { LIMIT, check, files, load, releaseProblem, stale } from './changelog.js';

const listing = {
	app: 'en',
	play: 'en-US',
	apple: 'en-US',
	fdroid: 'en-US',
	title: 'Trimix Blender',
	short_description: 'No account, no ads, no tracker.',
	full_description: ['No account, no ads, no tracker.']
};
const fr = { ...listing, app: 'fr', play: 'fr-FR', apple: 'fr-FR', fdroid: 'fr-FR' };

describe('changelog', () => {
	it('checks the versions and the texts', () => {
		const entry = { version: '1.1.0', en: ['New.'], fr: ['Nouveau.'] };
		const older = { version: '1.0.0', en: ['First.'], fr: ['Première.'] };
		expect(check([entry, older], ['en', 'fr'])).toEqual([]);
		expect(check([older, entry], ['en', 'fr'])).toEqual(['1.1.0: not older than the version above it']);
		expect(check([older, older], ['en', 'fr'])).toEqual(['1.0.0: not older than the version above it']);
		expect(check([{ ...entry, version: 'v1.1' }], ['en', 'fr'])).toEqual([
			'version v1.1: expected x.y.z, y and z below 100'
		]);
		expect(check([{ ...entry, de: ['Neu.'] }], ['en', 'fr'])).toEqual(['1.1.0: unknown language de']);
		expect(check([{ ...entry, fr: undefined }], ['en', 'fr'])).toEqual(['1.1.0: fr is not an array of lines']);
		expect(check([{ ...entry, fr: [] }], ['en', 'fr'])).toEqual(['1.1.0: fr is not an array of lines']);
		expect(check([{ ...entry, fr: [' '] }], ['en', 'fr'])).toEqual(['1.1.0: fr is not an array of lines']);
		expect(check([{ ...entry, fr: ['x'.repeat(LIMIT - 2), 'y'] }], ['en', 'fr'])).toEqual([]);
		expect(check([{ ...entry, fr: ['x'.repeat(LIMIT - 1), 'y'] }], ['en', 'fr'])).toEqual([
			'1.1.0: fr has 501 characters, at most 500'
		]);
	});

	it('writes each store its files: every version for Android, the newest for the App Store', () => {
		const changelog = [
			{ version: '1.2.3', en: ['New.', 'Fixed.'], fr: ['Nouveau.', 'Corrigé.'] },
			{ version: '1.0.0', en: ['First.'], fr: ['Première.'] }
		];
		expect(files(changelog, [listing, fr])).toEqual({
			'fastlane/metadata/android/en-US/changelogs/10203.txt': 'New.\nFixed.\n',
			'fastlane/metadata/fdroid/en-US/changelogs/10203.txt': 'New.\nFixed.\n',
			'fastlane/metadata/ios/en-US/release_notes.txt': 'New.\nFixed.\n',
			'fastlane/metadata/android/fr-FR/changelogs/10203.txt': 'Nouveau.\nCorrigé.\n',
			'fastlane/metadata/fdroid/fr-FR/changelogs/10203.txt': 'Nouveau.\nCorrigé.\n',
			'fastlane/metadata/ios/fr-FR/release_notes.txt': 'Nouveau.\nCorrigé.\n',
			'fastlane/metadata/android/en-US/changelogs/10000.txt': 'First.\n',
			'fastlane/metadata/fdroid/en-US/changelogs/10000.txt': 'First.\n',
			'fastlane/metadata/android/fr-FR/changelogs/10000.txt': 'Première.\n',
			'fastlane/metadata/fdroid/fr-FR/changelogs/10000.txt': 'Première.\n'
		});
	});

	it('releases only a version whose notes come first', () => {
		const changelog = [
			{ version: '1.1.0', en: ['New.'] },
			{ version: '1.0.0', en: ['First.'] }
		];
		expect(releaseProblem(changelog, '1.1.0')).toBeUndefined();
		expect(releaseProblem(changelog, '1.0.0')).toBe(
			'fastlane/changelog.json: no notes for 1.0.0 as its first entry (newest first)'
		);
		expect(releaseProblem([], '1.0.0')).toMatch(/no notes for 1\.0\.0/);
	});

	it('has the repository files as in fastlane/changelog.json', () => {
		expect(load().changelog.length).toBeGreaterThan(0);
		expect(stale()).toEqual([]);
	});
});
