import { describe, expect, it, vi } from 'vitest';
import { REFERENCES } from './references';

describe('references', () => {
	it('has unique IDs, each cited in formulas.ts', async () => {
		const { readFileSync } = await import('node:fs');
		const source = readFileSync(new URL('./formulas.ts', import.meta.url), 'utf8');
		const ids = REFERENCES.map((r) => r.id);
		expect(new Set(ids).size).toBe(ids.length);
		for (const id of ids) expect(source).toContain(id);
	});
});

describe('build constants', () => {
	it('come from vite.config.ts', async () => {
		vi.stubGlobal('__BASE_PATH__', '/blender');
		vi.stubGlobal('__APP_VERSION__', '1.2.3');
		vi.stubGlobal('__APP_BUILD__', 'abc1234');
		vi.stubGlobal('__BUILD_DATE__', '2026-11-06T00:00:00Z');
		const { url } = await import('./base');
		const about = await import('./about');
		expect(url('/about')).toBe('/blender/about');
		expect(about).toMatchObject({ APP_VERSION: '1.2.3', APP_BUILD: 'abc1234', BUILD_DATE: '2026-11-06T00:00:00Z' });
		const layout = await import('../routes/+layout');
		expect(layout.ssr).toBe(false);
		vi.unstubAllGlobals();
	});

	it('shows a release by its version, any other build as dev with its ID', async () => {
		const { versionLabel } = await import('./about');
		expect(versionLabel('1.2.3', 'abc1234')).toBe('1.2.3');
		expect(versionLabel('dev', 'abc1234-dirty')).toBe('dev (build abc1234-dirty)');
	});
});
