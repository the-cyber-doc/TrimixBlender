// The Android app's version (android/app/build.gradle) and the F-Droid recipe's build
// (fdroid/com.dolphinslabs.trimixblender.yml) from package.json's version. Run by `npm version`
// (its "version" script, package.json) after it bumps package.json and before it commits and tags,
// so that the tag's commit holds them:
//   npm version 1.2.3   # or patch, minor, major; then: git push --follow-tags
// build.gradle holds the version as plain values, not computed, so that F-Droid's update checker
// can read it from the tag. versionCode: 1.2.3 → 10203.
//   node scripts/android-version.js --check v1.2.3   # CI, on a release: fails if the tag differs
import { readFileSync, writeFileSync } from 'node:fs';

export const GRADLE = 'android/app/build.gradle';
export const RECIPE = 'fdroid/com.dolphinslabs.trimixblender.yml';

/** versionCode of a version: major * 10000 + minor * 100 + patch (minor and patch below 100).
 * @param {string} version */
export function versionCode(version) {
	const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
	if (!m || +m[2] > 99 || +m[3] > 99) throw new Error(`version ${version}: expected x.y.z, y and z below 100`);
	return Math.max(1, +m[1] * 10000 + +m[2] * 100 + +m[3]);
}

/** build.gradle with this version, which must be higher than its current one (a store refuses a
 * versionCode that does not grow).
 * @param {string} gradle
 * @param {string} version */
export function setVersion(gradle, version) {
	const code = /^( +versionCode )(\d+)$/m;
	const name = /^( +versionName )"[^"]*"$/m;
	const current = code.exec(gradle)?.[2];
	if (!current || !name.test(gradle)) throw new Error(`${GRADLE}: no versionCode / versionName line`);
	if (versionCode(version) <= +current) throw new Error(`version ${version}: not higher than versionCode ${current}`);
	return gradle.replace(code, `$1${versionCode(version)}`).replace(name, `$1"${version}"`);
}

/** The F-Droid recipe with its (single) build and its current version set to this version, built
 * from the tag `npm version` makes.
 * @param {string} recipe
 * @param {string} version */
export function setRecipeVersion(recipe, version) {
	const code = versionCode(version);
	/** @type {[RegExp, string][]} */
	const fields = [
		[/^( {2}- versionName: ).*$/m, `$1${version}`],
		[/^( {4}versionCode: )\d+$/m, `$1${code}`],
		[/^( {4}commit: ).*$/m, `$1v${version}`],
		[/^(CurrentVersion: ).*$/m, `$1${version}`],
		[/^(CurrentVersionCode: )\d+$/m, `$1${code}`]
	];
	return fields.reduce((out, [field, value]) => {
		if (!field.test(out)) throw new Error(`${RECIPE}: no ${field.source} line`);
		return out.replace(field, value);
	}, recipe);
}

/** The version in build.gradle (its versionName), after checking its versionCode.
 * @param {string} gradle */
export function getVersion(gradle) {
	const version = /^ +versionName "([^"]*)"$/m.exec(gradle)?.[1] ?? '';
	const code = /^ +versionCode (\d+)$/m.exec(gradle)?.[1];
	if (String(versionCode(version)) !== code) throw new Error(`${GRADLE}: versionCode ${code} is not ${version}'s`);
	return version;
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const gradle = readFileSync(GRADLE, 'utf8');
	if (process.argv[2] === '--check') {
		const tag = (process.argv[3] ?? '').replace(/^v/, '');
		const version = getVersion(gradle);
		if (version !== tag) {
			console.error(`${GRADLE} has version ${version}, the tag is ${tag}: release with \`npm version ${tag}\``);
			process.exit(1);
		}
	} else {
		const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
		writeFileSync(GRADLE, setVersion(gradle, version));
		writeFileSync(RECIPE, setRecipeVersion(readFileSync(RECIPE, 'utf8'), version));
	}
}
