import { defineConfig } from '@playwright/test';

// The store screenshots (`npm run screenshots`, see APPSTORE.md): not a test suite. The production
// build, each area of the app (Available gases, Target mix, Mix to do) for a nitrox and a trimix
// blend, in every language, at the sizes the stores ask for. Written where fastlane uploads them
// from (tests/screenshots/store.spec.ts).
const PORT = 4185;

export default defineConfig({
	testDir: 'tests/screenshots',
	reporter: 'list',
	fullyParallel: true,
	use: { baseURL: `http://localhost:${PORT}/`, serviceWorkers: 'block', colorScheme: 'light' },
	webServer: {
		command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
		port: PORT,
		reuseExistingServer: false,
		timeout: 120_000
	}
});
