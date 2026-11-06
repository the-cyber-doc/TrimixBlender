import { defineConfig, devices } from '@playwright/test';

// Browser tests, on the production build. tests/e2e: the pages, service workers blocked.
// tests/pwa: the service worker itself (offline, update banner). Each runs twice: at a server's
// root (`vite preview`), and with the build copied into a folder of a plain web server
// (scripts/serve-folder.js): the app works in any folder, chosen after the build.
// Not 4173 (`npm run preview`'s default): a preview started by hand would be taken for the test build.
const PORT = 4183;
const FOLDER_PORT = 4184;
const FOLDER = '/any/deep/folder';
// The Docker image instead (tools/test-e2e-stack.sh, e.g. E2E_BASE_URL=http://localhost:8090/blender/):
// no server of our own. The tests use URLs relative to it ('./', './#/about').
const EXTERNAL = process.env.E2E_BASE_URL?.replace(/\/?$/, '/');

const projects = (name: string, baseURL: string) => [
	{
		name: `${name}chromium`,
		testDir: 'tests/e2e',
		use: { ...devices['Desktop Chrome'], serviceWorkers: 'block' as const, baseURL }
	},
	{
		name: `${name}mobile`,
		testDir: 'tests/e2e',
		testMatch: 'layout.spec.ts',
		use: { ...devices['Pixel 7'], serviceWorkers: 'block' as const, baseURL }
	},
	{ name: `${name}pwa`, testDir: 'tests/pwa', use: { ...devices['Desktop Chrome'], baseURL } }
];

export default defineConfig({
	testDir: 'tests',
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
	use: { trace: 'retain-on-failure' },
	projects: EXTERNAL
		? projects('', EXTERNAL)
		: [
				...projects('', `http://localhost:${PORT}/`),
				...projects('folder-', `http://localhost:${FOLDER_PORT}${FOLDER}/`)
			],
	webServer: EXTERNAL
		? undefined
		: [
				{
					command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
					port: PORT,
					reuseExistingServer: !process.env.CI,
					timeout: 120_000
				},
				// After the build above (web servers start in order).
				{
					command: `node scripts/serve-folder.js ${FOLDER_PORT} ${FOLDER}`,
					port: FOLDER_PORT,
					reuseExistingServer: !process.env.CI
				}
			]
});
