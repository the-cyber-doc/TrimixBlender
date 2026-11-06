// The build's version, commit and date (vite.config.ts), for the About page.

export const APP_VERSION: string = __APP_VERSION__;
export const APP_BUILD: string = __APP_BUILD__;
export const BUILD_DATE: string = __BUILD_DATE__;

/** What the About page shows: the release's version (its git tag) for a release build,
 * else "dev" and the build's ID (its commit). */
export function versionLabel(version: string, build: string): string {
	return version === 'dev' ? `dev (build ${build})` : version;
}
