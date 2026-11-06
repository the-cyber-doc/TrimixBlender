import { expect, test, type Page } from '@playwright/test';

/** Opens the app and waits until its service worker controls the page. */
async function controlled(page: Page) {
	await page.goto('./');
	await page.evaluate(() => navigator.serviceWorker.ready);
	await page.reload();
	await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
}

test('installable: manifest and icons', async ({ page, request }) => {
	await page.goto('./');
	const manifest = await (await request.get('manifest.webmanifest')).json();
	expect(manifest).toMatchObject({ name: 'Trimix Blender', start_url: './', display: 'standalone' });
	for (const icon of manifest.icons) expect((await request.get(icon.src)).ok()).toBe(true);
});

test('works offline after the first visit, on every page', async ({ page, context }) => {
	await controlled(page);
	await context.setOffline(true);
	await page.reload();
	await expect(page.getByTestId('sticker')).toBeVisible();
	await page.goto('about');
	await expect(page.getByRole('heading', { name: 'References' })).toBeVisible();
	await page.goto('preferences');
	await expect(page.getByRole('heading', { name: 'Preferences' })).toBeVisible();
});

test('offers to reload when a new version takes over', async ({ page }) => {
	await controlled(page);
	await expect(page.getByTestId('update-banner')).toHaveCount(0);
	// What the browser does when a new service worker activates (skipWaiting + clients.claim).
	await page.evaluate(() => navigator.serviceWorker.dispatchEvent(new Event('controllerchange')));
	const banner = page.getByTestId('update-banner');
	await expect(banner).toContainText('A new version');
	await banner.getByRole('button', { name: 'Later' }).click();
	await expect(banner).toHaveCount(0);
	await page.evaluate(() => navigator.serviceWorker.dispatchEvent(new Event('controllerchange')));
	await Promise.all([page.waitForEvent('load'), page.getByRole('button', { name: 'Reload' }).click()]);
});
