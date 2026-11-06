import { expect, test } from '@playwright/test';

const section = (page: import('@playwright/test').Page, title: string) =>
	page.locator('section.area').filter({ has: page.getByRole('heading', { name: title }) });

test('areas collapse with their arrow only, and expand with a click anywhere', async ({ page }) => {
	await page.goto('/');
	const gases = section(page, 'Available gases');
	// Expanded: a click in the content does not collapse it.
	await gases.getByText('Check the gases').click();
	await expect(gases.getByRole('button', { name: 'Collapse Available gases' })).toHaveAttribute(
		'aria-expanded',
		'true'
	);
	// The arrow collapses it.
	await gases.getByRole('button', { name: 'Collapse Available gases' }).click();
	await expect(gases.getByText('Check the gases')).toBeHidden();
	await expect(gases.getByText('4 of 4 in use')).toBeVisible();
	// A click anywhere on the collapsed area expands it.
	await gases.getByText('4 of 4 in use').click();
	await expect(gases.getByText('Check the gases')).toBeVisible();
});

test('the menu at the top right opens About and Preferences', async ({ page }) => {
	await page.goto('/');
	const menu = page.getByRole('button', { name: 'Menu' });
	const box = await menu.boundingBox();
	expect(box!.x + box!.width).toBeGreaterThan((page.viewportSize()!.width * 3) / 4);
	await menu.click();
	await page.getByRole('menuitem', { name: 'About' }).click();
	await expect(page.getByRole('heading', { name: 'References' })).toBeVisible();
	await expect(page.getByText('Dalton, J. (1802)')).toBeVisible();
	await expect(page.getByRole('menu')).toBeHidden();
	await menu.click();
	await page.keyboard.press('Escape');
	await expect(page.getByRole('menu')).toBeHidden();
	await menu.click();
	await page.getByRole('menuitem', { name: 'Preferences' }).click();
	await expect(page.getByRole('heading', { name: 'Preferences' })).toBeVisible();
	await menu.click();
	await page.mouse.click(5, page.viewportSize()!.height - 5); // outside the menu
	await expect(page.getByRole('menu')).toBeHidden();
});

test('the page fits narrow screens', async ({ page }) => {
	await page.goto('/');
	const width = await page.evaluate(() => document.documentElement.scrollWidth);
	expect(width).toBeLessThanOrEqual(page.viewportSize()!.width);
	await expect(page.getByTestId('bottle-top')).toBeVisible();
});
