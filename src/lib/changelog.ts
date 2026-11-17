// The release notes shown on the About page, newest first, from fastlane/changelog.json: the same
// texts as the stores' and the GitHub release's (scripts/changelog.js, which checks that every
// version has every language).
import changelog from '../../fastlane/changelog.json';
import type { Locale } from './i18n';

export interface Release {
	version: string;
	lines: string[];
}

type Entry = { version: string } & Record<Locale, string[]>;

/** Every version's notes in this language. */
export function releases(code: Locale, entries: readonly Entry[] = changelog as Entry[]): Release[] {
	return entries.map((entry) => ({ version: entry.version, lines: entry[code] }));
}
