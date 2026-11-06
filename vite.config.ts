import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

// Where the browser sees the app: '' (the domain's root, default) or e.g. '/blender'
// (a subfolder; the Docker image's BASE_PATH build argument). Build time only.
const BASE_PATH = (process.env.BASE_PATH ?? '').replace(/\/$/, '');
if (!/^(\/[\w.~-]+)*$/.test(BASE_PATH)) throw new Error(`BASE_PATH must look like /blender, not ${BASE_PATH}`);

// Shown on the About page. CI and the Docker image pass APP_VERSION / APP_COMMIT;
// elsewhere they come from package.json and git, if there is one.
function git(command: string): string | undefined {
	try {
		return execSync(`git ${command}`, { stdio: ['ignore', 'pipe', 'ignore'] })
			.toString()
			.trim();
	} catch {
		return undefined;
	}
}
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
const APP_VERSION = (process.env.APP_VERSION || pkg.version).replace(/^v/, '');
const commit = process.env.APP_COMMIT;
const APP_COMMIT = commit ? commit.slice(0, 7) : (git('rev-parse --short HEAD') ?? 'unknown');

export default defineConfig({
	define: {
		__BASE_PATH__: JSON.stringify(BASE_PATH),
		__APP_VERSION__: JSON.stringify(APP_VERSION),
		__APP_BUILD__: JSON.stringify(APP_COMMIT),
		__BUILD_DATE__: JSON.stringify(new Date().toISOString())
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
