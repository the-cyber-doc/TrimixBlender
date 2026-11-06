// @vitest-environment happy-dom
import { flushSync } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

describe('app state', () => {
	it('loads from storage and saves every change', async () => {
		const data = new Map<string, string>([['blender.preferences', JSON.stringify({ pressure: 'psi' })]]);
		vi.stubGlobal('localStorage', {
			getItem: (k: string) => data.get(k) ?? null,
			setItem: (k: string, v: string) => data.set(k, v)
		});
		const { app, persist, preferences } = await import('./app.svelte');
		expect(preferences.pressure).toBe('psi');
		const cleanup = $effect.root(() => persist());
		flushSync();
		app.mix.targetPressure = 230;
		preferences.volume = 'cuft';
		flushSync();
		expect(JSON.parse(data.get('blender.state')!).mix.targetPressure).toBe(230);
		expect(JSON.parse(data.get('blender.preferences')!).volume).toBe('cuft');
		cleanup();
		vi.unstubAllGlobals();
	});
});
