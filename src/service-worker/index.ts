// Service worker: the whole app works offline. It has no server data: everything it needs
// is the build itself.
// - App shell (build output, static files, "/"): precached per version, cache first.
// - Page loads (index.html, or its folder): network first (a new version shows at once when
//   online), else the cached shell. Pages are in the hash: there is no other page to load.
// - Anything else: not handled.
// A new version activates at once and deletes the old cache; the page shows "Reload"
// ($lib/UpdateBanner.svelte). Type-checked with its own tsconfig.json (WebWorker types).
import { version } from '$app/env';
import { assets, immutable } from '$app/manifest';
import { self as sw } from '$app/service-worker';

const SHELL = `shell-${version}`;
// The folder the app is published in (whatever it is): the service worker's own, next to index.html.
const ROOT = new URL('.', sw.location.href).pathname;
const ASSETS = new Set([...immutable, ...assets].map((file) => new URL(file.path, sw.location.href).pathname));

sw.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(SHELL)
			.then((cache) => cache.addAll([...ASSETS, ROOT]))
			.then(() => sw.skipWaiting())
	);
});

sw.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			for (const key of await caches.keys()) {
				if (key.startsWith('shell-') && key !== SHELL) await caches.delete(key);
			}
			await sw.clients.claim();
		})()
	);
});

// ignoreVary: a module script requested with an Origin header must still match its cached copy.
const SHELL_MATCH = { cacheName: SHELL, ignoreVary: true };

sw.addEventListener('fetch', (event) => {
	const request = event.request;
	const url = new URL(request.url);
	if (request.method !== 'GET' || url.origin !== sw.location.origin) return;
	if (ASSETS.has(url.pathname)) event.respondWith(cacheFirst(request));
	else if (request.mode === 'navigate') event.respondWith(page(request));
});

async function cacheFirst(request: Request): Promise<Response> {
	return (await caches.match(request, SHELL_MATCH)) ?? fetch(request);
}

async function page(request: Request): Promise<Response> {
	try {
		return await fetch(request);
	} catch (e) {
		return (await caches.match(ROOT, SHELL_MATCH)) ?? Promise.reject(e);
	}
}
