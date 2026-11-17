import { describe, expect, it } from 'vitest';
import changelog from '../../fastlane/changelog.json';
import { releases } from './changelog';
import { LOCALE_CODES } from './i18n';

describe('changelog', () => {
	it("gives every version's notes in the language asked for", () => {
		const entries = [
			{ version: '1.1.0', en: ['New.'], fr: ['Nouveau.'] },
			{ version: '1.0.0', en: ['First.'], fr: ['Première.'] }
		] as unknown as Parameters<typeof releases>[1];
		expect(releases('fr', entries)).toEqual([
			{ version: '1.1.0', lines: ['Nouveau.'] },
			{ version: '1.0.0', lines: ['Première.'] }
		]);
	});

	it("has every version in each of the app's languages", () => {
		expect(releases('en').at(-1)).toEqual({ version: '1.0.0', lines: ['Initial release.'] });
		for (const entry of changelog) {
			expect(Object.keys(entry).sort(), entry.version).toEqual(['version', ...LOCALE_CODES].sort());
		}
		for (const code of LOCALE_CODES) {
			for (const release of releases(code))
				expect(release.lines.length, `${release.version} ${code}`).toBeGreaterThan(0);
		}
	});
});
