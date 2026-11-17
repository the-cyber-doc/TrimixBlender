// The release notes, from their single source fastlane/changelog.json: one entry per version, newest
// first, with its lines in each language of the listings (fastlane/listings.json, `app` codes).
// `npm run listings` writes them where each store's tools read them (APPSTORE.md):
//   Google Play: fastlane/metadata/android/<play>/changelogs/<versionCode>.txt (every version)
//   F-Droid:     fastlane/metadata/fdroid/<fdroid>/changelogs/<versionCode>.txt (fdroiddata's names);
//                F-Droid reads the Android ones from the tag
//   App Store:   fastlane/metadata/ios/<apple>/release_notes.txt (the newest version only)
// The GitHub release takes the English lines (ci-cd.yml, "Release notes"), the About page every
// version in the app's language (src/lib/changelog.ts).
// Never edit the written files: scripts/changelog.test.js fails when they differ from the JSON.
//   node scripts/changelog.js            # writes them
//   node scripts/changelog.js --check    # fails if one differs
//   node scripts/changelog.js --release  # `npm version`: fails without notes for package.json's
//                                        # version, as the newest entry; then writes them
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { versionCode } from './android-version.js';
import { load as loadListings } from './store-listings.js';

export const SOURCE = 'fastlane/changelog.json';

/** Length limit of one version's notes, in characters: Google Play's (F-Droid recommends the
 * same; the App Store takes 4000). */
export const LIMIT = 500;

/** A version and its lines in each language: { version, en: [...], fr: [...], ... }.
 * @typedef {{ version: string, [language: string]: any }} Entry */
/** @typedef {import('./store-listings.js').Listing} Listing */

/** The notes of one language: their lines. @param {string[]} lines */
export const text = (lines) => lines.join('\n');

/** The problems of the changelog: a version that is not x.y.z or not older than the one above it,
 * a language missing, unknown, empty or too long.
 * @param {Record<string, any>[]} changelog the JSON, not checked yet
 * @param {string[]} languages the listings' `app` codes */
export function check(changelog, languages) {
	const problems = [];
	let previous = Infinity;
	for (const entry of changelog) {
		const { version } = entry;
		let code;
		try {
			code = versionCode(version);
		} catch (error) {
			problems.push(/** @type {Error} */ (error).message);
			continue;
		}
		if (code >= previous) problems.push(`${version}: not older than the version above it`);
		previous = code;
		for (const key of Object.keys(entry)) {
			if (key !== 'version' && !languages.includes(key)) problems.push(`${version}: unknown language ${key}`);
		}
		for (const language of languages) {
			const lines = entry[language];
			if (!Array.isArray(lines) || !lines.length || lines.some((l) => typeof l !== 'string' || !l.trim())) {
				problems.push(`${version}: ${language} is not an array of lines`);
				continue;
			}
			const length = [...text(lines)].length;
			if (length > LIMIT) problems.push(`${version}: ${language} has ${length} characters, at most ${LIMIT}`);
		}
	}
	return problems;
}

/** Every file to write, path → content (one line feed at the end).
 * @param {Entry[]} changelog
 * @param {Listing[]} listings */
export function files(changelog, listings) {
	/** @type {Record<string, string>} */
	const out = {};
	for (const [i, entry] of changelog.entries()) {
		const code = versionCode(entry.version);
		for (const l of listings) {
			const notes = text(entry[l.app]) + '\n';
			out[`fastlane/metadata/android/${l.play}/changelogs/${code}.txt`] = notes;
			out[`fastlane/metadata/fdroid/${l.fdroid}/changelogs/${code}.txt`] = notes;
			if (i === 0) out[`fastlane/metadata/ios/${l.apple}/release_notes.txt`] = notes;
		}
	}
	return out;
}

/** The changelog in fastlane/changelog.json, after checking it, and the listings. */
export function load() {
	const listings = loadListings();
	/** @type {Entry[]} */
	const changelog = JSON.parse(readFileSync(SOURCE, 'utf8'));
	const problems = check(
		changelog,
		listings.map((l) => l.app)
	);
	if (problems.length) throw new Error(`${SOURCE}:\n  ${problems.join('\n  ')}`);
	return { changelog, listings };
}

/** The written files that differ from the changelog (missing or other content). */
export function stale() {
	const { changelog, listings } = load();
	return Object.entries(files(changelog, listings))
		.filter(([path, content]) => {
			try {
				return readFileSync(path, 'utf8') !== content;
			} catch {
				return true;
			}
		})
		.map(([path]) => path);
}

/** Why `version` cannot be released with this changelog, or undefined.
 * @param {Entry[]} changelog
 * @param {string} version */
export function releaseProblem(changelog, version) {
	if (changelog[0]?.version === version) return undefined;
	return `${SOURCE}: no notes for ${version} as its first entry (newest first)`;
}

/** Writes every file. */
export function write() {
	const { changelog, listings } = load();
	for (const [path, content] of Object.entries(files(changelog, listings))) {
		mkdirSync(dirname(path), { recursive: true });
		writeFileSync(path, content);
	}
	return changelog;
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const mode = process.argv[2];
	if (mode === '--check') {
		const paths = stale();
		if (paths.length) {
			console.error(`Not as in ${SOURCE} (run npm run listings):\n  ${paths.join('\n  ')}`);
			process.exit(1);
		}
	} else if (mode === '--release') {
		const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
		const problem = releaseProblem(load().changelog, version);
		if (problem) {
			console.error(problem);
			process.exit(1);
		}
		write();
	} else {
		write();
	}
}
