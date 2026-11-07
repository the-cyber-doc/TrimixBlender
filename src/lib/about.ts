// What the About page shows about this build (set at build time, vite.config.ts), and where
// the project lives.

export const APP_VERSION: string = __APP_VERSION__;
export const APP_BUILD: string = __APP_BUILD__;
export const BUILD_DATE: string = __BUILD_DATE__;
/** The Android / iOS app (capacitor.config.ts): its files are inside the app, so no service
 * worker and no update banner; a new version comes from the app's store. */
export const NATIVE: boolean = __APP_NATIVE__;

/** What the About page shows: the release's version (its git tag) for a release build,
 * else "dev" and the build's ID (its commit). */
export function versionLabel(version: string, build: string): string {
	return version === 'dev' ? `dev (build ${build})` : version;
}

export const GITHUB_URL = 'https://github.com/the-cyber-doc/TrimixBlender';
export const LICENSE_URL = `${GITHUB_URL}/blob/main/LICENSE`;
/** The image published by the CI on each release (.github/workflows/ci-cd.yml). */
export const DOCKER_URL = 'https://hub.docker.com/r/thecyberdoc/trimix-blender';
export const COPYRIGHT_HOLDER = 'the-cyber-doc';
