import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { execSync } from 'node:child_process';

// Where the browser sees the app: '' (the domain's root, default) or e.g. '/blender'
// (a subfolder; the Docker image's BASE_PATH build argument). Build time only.
const BASE_PATH = (process.env.BASE_PATH ?? '').replace(/\/$/, '');
if (!/^(\/[\w.~-]+)*$/.test(BASE_PATH)) throw new Error(`BASE_PATH must look like /blender, not ${BASE_PATH}`);

// Shown on the About page. CI and the Docker image pass APP_VERSION / APP_COMMIT (the image's
// build context has no .git); elsewhere they come from git, if there is one.
function git(command: string): string | undefined {
	try {
		return execSync(`git ${command}`, { stdio: ['ignore', 'pipe', 'ignore'] })
			.toString()
			.trim();
	} catch {
		return undefined;
	}
}
// The version is the git tag of the commit built (v1.2.3 → 1.2.3), only for a clean checkout
// of that tag; any other build is "dev", identified by its commit (the About page).
const dirty = git('status --porcelain') ? '-dirty' : '';
const tag = dirty ? undefined : git('describe --tags --exact-match');
const APP_VERSION = (process.env.APP_VERSION || tag || 'dev').replace(/^v/, '');
const BUILD_DATE = new Date().toISOString();
const commit = process.env.APP_COMMIT;
// The build's ID: its commit. A full SHA (CI) is shortened; "abc1234-dirty" (tools/docker-dev.sh)
// is kept. Without git (a copy of the sources): the build's time, 20261106T1435.
const head = git('rev-parse --short HEAD');
const APP_COMMIT = commit
	? commit.replace(/^([0-9a-f]{7})[0-9a-f]{33}$/, '$1')
	: head
		? head + dirty
		: BUILD_DATE.replace(/[-:]/g, '').slice(0, 13);

export default defineConfig({
	define: {
		__BASE_PATH__: JSON.stringify(BASE_PATH),
		__APP_VERSION__: JSON.stringify(APP_VERSION),
		__APP_BUILD__: JSON.stringify(APP_COMMIT),
		__BUILD_DATE__: JSON.stringify(BUILD_DATE)
	},
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries.
				runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
			},
			// Static SPA shell: no server at all. nginx serves the files (.gz next to each).
			adapter: adapter({ pages: 'build', assets: 'build', fallback: 'index.html', precompress: true }),
			// Registered by the app, in production builds only ($lib/pwa.ts).
			serviceWorker: { register: false },
			// Absolute asset paths: the service worker serves the cached "/" for any URL offline.
			paths: { relative: false, base: BASE_PATH as '' | `/${string}` },
			// Script policy in a <meta>, with the hash of SvelteKit's inline boot script.
			csp: { mode: 'hash', directives: { 'script-src': ['self'] } }
		})
	],
	// Unit tests: Svelte's browser build (the server build never runs effects); the
	// *.svelte.test.ts files run in happy-dom (their docblock), compiled for the browser.
	resolve: process.env.VITEST ? { conditions: ['browser'] } : undefined,
	test: {
		include: ['src/**/*.test.ts'],
		// Every logic module (.ts) at 100 %: components are thin and covered by Playwright (tests/).
		coverage: {
			provider: 'v8',
			include: ['src/**/*.ts'],
			exclude: ['src/**/*.test.ts', 'src/**/*.d.ts', 'src/service-worker/**'],
			reporter: ['text-summary', 'text'],
			thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 }
		}
	}
});
