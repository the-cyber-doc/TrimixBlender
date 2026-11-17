// The store listings' texts, from their single source fastlane/listings.json: for each language,
// its title, short description and full description (an array of lines), and its locale code in
// each store. `npm run listings` writes them where each store's tools read them (APPSTORE.md):
//   Google Play: fastlane/metadata/android/<play>/title.txt, short_description.txt, full_description.txt
//   App Store:   fastlane/metadata/ios/<apple>/name.txt, description.txt (its subtitle, keywords and
//                promotional text are App Store only, written by hand there)
//   F-Droid reads Google Play's, from the sources at the release's tag.
// Never edit the written files: scripts/store-listings.test.js fails when they differ from the JSON.
//   node scripts/store-listings.js           # writes them
//   node scripts/store-listings.js --check   # fails if one differs
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

export const SOURCE = 'fastlane/listings.json';

/** Length limits, in characters, the strictest of the stores that show the text: title 30 (Play,
 * App Store; F-Droid 50), short description 80 (Play, F-Droid's summary), full description 4000
 * (all three). */
export const LIMITS = { title: 30, short_description: 80, full_description: 4000 };

/** @typedef {{ app: string, play: string, apple: string, title: string,
 *   short_description: string, full_description: string[] }} Listing */

/** The problems of the listings: missing or too long texts, a description that does not start with
 * the short description's first sentence (No account, no ads, no tracker.), a language twice.
 * @param {Record<string, any>[]} listings the JSON, not checked yet */
export function check(listings) {
	const problems = [];
	const seen = new Set();
	for (const listing of listings) {
		const { app } = listing;
		if (seen.has(app)) problems.push(`${app}: twice`);
		seen.add(app);
		for (const key of ['app', 'play', 'apple', 'title', 'short_description']) {
			if (typeof listing[key] !== 'string' || !listing[key].trim()) problems.push(`${app}: no ${key}`);
		}
		if (!Array.isArray(listing.full_description)) {
			problems.push(`${app}: full_description is not an array of lines`);
			continue;
		}
		/** @type {Record<string, any>} */
		const texts = { ...listing, full_description: listing.full_description.join('\n') };
		for (const [key, limit] of Object.entries(LIMITS)) {
			const length = [...(texts[key] ?? '')].length;
			if (length > limit) problems.push(`${app}: ${key} has ${length} characters, at most ${limit}`);
		}
		const pitch = /^.*?[.。]/u.exec(listing.short_description ?? '')?.[0];
		if (!pitch || listing.full_description[0] !== pitch) {
			problems.push(`${app}: full_description does not start with the short description's first sentence`);
		}
	}
	return problems;
}

/** Every file to write, path → content (one line feed at the end).
 * @param {Listing[]} listings */
export function files(listings) {
	/** @type {Record<string, string>} */
	const out = {};
	for (const l of listings) {
		const full = l.full_description.join('\n');
		const texts = {
			[`android/${l.play}/title.txt`]: l.title,
			[`android/${l.play}/short_description.txt`]: l.short_description,
			[`android/${l.play}/full_description.txt`]: full,
			[`ios/${l.apple}/name.txt`]: l.title,
			[`ios/${l.apple}/description.txt`]: full
		};
		for (const [path, text] of Object.entries(texts)) out[`fastlane/metadata/${path}`] = text + '\n';
	}
	return out;
}

/** The listings in fastlane/listings.json, after checking them. */
export function load() {
	/** @type {Listing[]} */
	const listings = JSON.parse(readFileSync(SOURCE, 'utf8'));
	const problems = check(listings);
	if (problems.length) throw new Error(`${SOURCE}:\n  ${problems.join('\n  ')}`);
	return listings;
}

/** The written files that differ from the listings (missing or other content). */
export function stale() {
	return Object.entries(files(load()))
		.filter(([path, text]) => {
			try {
				return readFileSync(path, 'utf8') !== text;
			} catch {
				return true;
			}
		})
		.map(([path]) => path);
}

if (import.meta.url === `file://${process.argv[1]}`) {
	if (process.argv[2] === '--check') {
		const paths = stale();
		if (paths.length) {
			console.error(`Not as in ${SOURCE} (run npm run listings):\n  ${paths.join('\n  ')}`);
			process.exit(1);
		}
	} else {
		for (const [path, text] of Object.entries(files(load()))) {
			mkdirSync(dirname(path), { recursive: true });
			writeFileSync(path, text);
		}
	}
}
