import { expect, test } from '@playwright/test';

test('English by default; the language entry, first in the menu, opens the list of languages', async ({ page }) => {
	await page.goto('./');
	await expect(page.locator('html')).toHaveAttribute('lang', 'en');
	await page.getByRole('button', { name: 'Menu' }).click();
	// First entry: the flag and the code of the current language, before Blender.
	const items = page.getByRole('menu').first().locator(':scope > li');
	await expect(items.first().getByTestId('language')).toHaveText('EN');
	await expect(items.nth(1)).toHaveText('Blender');
	await expect(page.getByTestId('language').locator('svg.flag')).toBeVisible();
	// A click opens the box of languages, the current one checked.
	const list = page.getByRole('menu', { name: 'Language' });
	await expect(list).toBeHidden();
	await page.getByTestId('language').click();
	await expect(list.getByRole('menuitemradio')).toHaveText([
		'EN English',
		'FR Français',
		'DE Deutsch',
		'ES Español',
		'IT Italiano',
		'NL Nederlands',
		'JA 日本語',
		'ZH 简体中文'
	]);
	await expect(list.getByRole('menuitemradio', { name: /English/ })).toHaveAttribute('aria-checked', 'true');
	await expect(list.locator('svg.flag')).toHaveCount(8);

	// French: the texts, the decimal comma (shown and typed), the page language.
	await list.getByRole('menuitemradio', { name: /Français/ }).click();
	await expect(page.getByRole('menu')).toBeHidden();
	await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
	await expect(page.getByRole('heading', { name: 'Gaz disponibles' })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Mélange à faire' })).toBeVisible();
	await expect(page.getByTestId('mod')).toHaveValue('33,8');
	await page.getByTestId('target-o2').fill('30,5');
	await page.getByTestId('target-o2').blur();
	await expect(page.getByTestId('target-o2')).toHaveValue('30,5');
	await expect(page.getByTestId('sticker')).toHaveText(/^Nx: 30,5\s*\|/);

	// Kept after a reload, and in the other pages.
	await page.reload();
	await expect(page.getByRole('heading', { name: 'Mélange cible' })).toBeVisible();
	await page.getByRole('button', { name: 'Menu' }).click();
	await expect(page.getByTestId('language')).toHaveText('FR');
	await page.getByRole('menuitem', { name: 'Préférences' }).click();
	await expect(page.getByRole('heading', { name: 'Préférences' })).toBeVisible();

	// Back to English.
	await page.getByRole('button', { name: 'Menu' }).click();
	await page.getByTestId('language').click();
	await page.getByRole('menuitemradio', { name: /English/ }).click();
	await expect(page.getByRole('heading', { name: 'Preferences' })).toBeVisible();
	await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

for (const code of ['fr', 'de', 'es', 'it', 'nl', 'ja', 'zh']) {
	test(`${code}: fits a phone screen`, async ({ page }) => {
		// Saved before the app starts (it saves its preferences once started).
		await page.addInitScript((language) => {
			if (!localStorage.getItem('blender.preferences'))
				localStorage.setItem('blender.preferences', JSON.stringify({ language }));
		}, code);
		await page.setViewportSize({ width: 360, height: 780 });
		await page.goto('./');
		await expect(page.locator('html')).toHaveAttribute('lang', code);
		await page.getByRole('radio').nth(1).check(); // Trimix
		await expect(page.getByTestId('bottle-he')).toBeVisible();
		const width = await page.evaluate(() => document.documentElement.scrollWidth);
		expect(width).toBeLessThanOrEqual(360);
	});
}
