import { afterEach, describe, expect, it, vi } from 'vitest';
import { url } from './base';
import { checkForUpdates, onAppUpdated, registerServiceWorker } from './pwa';

vi.stubGlobal('__BASE_PATH__', '');

/** A fake ServiceWorkerContainer: enough of it for pwa.ts. */
function container(controller: object | null = null) {
	const listeners = new Set<() => void>();
	const registration = { update: vi.fn(() => Promise.resolve()), unregister: vi.fn() };
	return {
		controller,
		registration,
		register: vi.fn(() => Promise.resolve(registration)),
		getRegistrations: vi.fn(() => Promise.resolve([registration])),
		addEventListener: (_: string, l: () => void) => listeners.add(l),
		removeEventListener: (_: string, l: () => void) => listeners.delete(l),
		fire: () => listeners.forEach((l) => l()),
		listeners
	};
}
const as = (c: ReturnType<typeof container>) => c as unknown as ServiceWorkerContainer;

afterEach(() => {
	vi.useRealTimers();
	vi.unstubAllGlobals();
	vi.stubGlobal('__BASE_PATH__', '');
});

describe('service worker registration', () => {
	it('registers in production', async () => {
		const c = container();
		vi.stubGlobal('document', { addEventListener: vi.fn(), visibilityState: 'visible' });
		registerServiceWorker(false, as(c));
		expect(c.register).toHaveBeenCalledWith(url('/service-worker.js'), { scope: url('/') });
		await Promise.resolve();
	});

	it('logs a failed registration', async () => {
		const c = container();
		c.register.mockImplementation(() => Promise.reject(new Error('no')));
		const error = vi.spyOn(console, 'error').mockImplementation(() => {});
		registerServiceWorker(false, as(c));
		await new Promise((r) => setTimeout(r));
		expect(error).toHaveBeenCalled();
		error.mockRestore();
	});

	it('unregisters in development', async () => {
		const c = container();
		registerServiceWorker(true, as(c));
		await new Promise((r) => setTimeout(r));
		expect(c.registration.unregister).toHaveBeenCalled();
	});

	it('does nothing without service workers', () => {
		expect(() => registerServiceWorker(false, undefined)).not.toThrow();
		vi.stubGlobal('navigator', {});
		expect(() => registerServiceWorker(false)).not.toThrow();
	});
});

describe('update checks', () => {
	it('checks when the app comes back and every hour, even offline', async () => {
		vi.useFakeTimers();
		let onVisible = () => {};
		const doc = { visibilityState: 'hidden', addEventListener: (_: string, l: () => void) => (onVisible = l) };
		vi.stubGlobal('document', doc);
		const registration = { update: vi.fn(() => Promise.reject(new Error('offline'))) };
		checkForUpdates(registration as unknown as ServiceWorkerRegistration);
		onVisible();
		expect(registration.update).not.toHaveBeenCalled();
		doc.visibilityState = 'visible';
		onVisible();
		expect(registration.update).toHaveBeenCalledTimes(1);
		vi.advanceTimersByTime(60 * 60 * 1000);
		expect(registration.update).toHaveBeenCalledTimes(2);
	});
});

describe('new version', () => {
	it('tells when a new service worker takes over a controlled page', () => {
		const c = container({});
		const listener = vi.fn();
		const stop = onAppUpdated(listener, as(c));
		c.fire();
		expect(listener).toHaveBeenCalledTimes(1);
		stop();
		expect(c.listeners.size).toBe(0);
	});

	it('not on the first install', () => {
		const c = container(null);
		const listener = vi.fn();
		onAppUpdated(listener, as(c));
		c.fire();
		expect(listener).not.toHaveBeenCalled();
		c.fire();
		expect(listener).toHaveBeenCalledTimes(1);
	});

	it('does nothing without service workers', () => {
		const stop = onAppUpdated(() => {}, undefined);
		expect(() => stop()).not.toThrow();
	});
});
