import { defineConfig, devices } from '@playwright/test';

// Browser tests, on the production build (npm run build && npm run preview).
// tests/e2e: the pages, service workers blocked. tests/pwa: the service worker itself
// (offline, update banner).
// Not 4173 (`npm run preview`'s default): a preview started by hand would be taken for the test build.
const PORT = 4183;
// The Docker image instead (e.g. E2E_BASE_URL=http://localhost:18080): no server of our own.
const EXTERNAL = process.env.E2E_BASE_URL;

export default defineConfig({
	testDir: 'tests',
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
	use: { baseURL: EXTERNAL ?? `http://localhost:${PORT}`, trace: 'retain-on-failure' },
	projects: [
		{
			name: 'chromium',
			testDir: 'tests/e2e',
			use: { ...devices['Desktop Chrome'], serviceWorkers: 'block' }
		},
		{
			name: 'mobile',
			testDir: 'tests/e2e',
			testMatch: 'layout.spec.ts',
			use: { ...devices['Pixel 7'], serviceWorkers: 'block' }
		},
		{
			name: 'pwa',
			testDir: 'tests/pwa',
			use: { ...devices['Desktop Chrome'] }
		}
	],
	webServer: EXTERNAL
		? undefined
		: {
				command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
				port: PORT,
				reuseExistingServer: !process.env.CI,
				timeout: 120_000
			}
});
