// The app's side of the PWA (the service worker is src/service-worker/).

import { url } from './base';

const UPDATE_CHECK_MS = 60 * 60 * 1000;

/** Production builds only (SvelteKit's automatic registration is off, see vite.config.ts).
 * In development, removes a service worker left by an earlier production test instead. */
export function registerServiceWorker(
	dev: boolean,
	container: ServiceWorkerContainer | undefined = navigator.serviceWorker
) {
	if (!container) return;
	if (dev) {
		container.getRegistrations().then((all) => all.forEach((registration) => registration.unregister()));
	} else {
		container.register(url('/service-worker.js'), { scope: url('/') }).then(checkForUpdates, (e) => console.error(e));
	}
}

/** The browser looks for a new service worker only when a page loads: an installed app is
 * resumed instead. So: when the app comes back to the foreground, and every hour while open. */
export function checkForUpdates(registration: ServiceWorkerRegistration) {
	const check = () => registration.update().catch(() => {}); // offline: next time
	document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && check());
	setInterval(check, UPDATE_CHECK_MS);
}

/** Calls `listener` when a new version of the app took over (its service worker activates at once):
 * the page still runs the old code until reloaded. Not on the first install. Returns an unsubscribe. */
export function onAppUpdated(
	listener: () => void,
	container: ServiceWorkerContainer | undefined = navigator.serviceWorker
): () => void {
	if (!container) return () => {};
	let controlled = !!container.controller;
	const changed = () => {
		if (controlled) listener();
		controlled = true;
	};
	container.addEventListener('controllerchange', changed);
	return () => container.removeEventListener('controllerchange', changed);
}
