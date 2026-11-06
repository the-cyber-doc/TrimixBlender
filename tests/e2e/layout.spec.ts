import { expect, test } from '@playwright/test';

const section = (page: import('@playwright/test').Page, title: string) =>
	page.locator('section.area').filter({ has: page.getByRole('heading', { name: title }) });

test('areas collapse with their arrow only, and expand with a click anywhere', async ({ page }) => {
	await page.goto('./');
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
	await page.goto('./');
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
	await page.goto('./');
	const width = await page.evaluate(() => document.documentElement.scrollWidth);
	expect(width).toBeLessThanOrEqual(page.viewportSize()!.width);
	await expect(page.getByTestId('bottle-top')).toBeVisible();
});

/** The bottom edge of each step's drawing, by step. */
async function bottleBottoms(page: import('@playwright/test').Page) {
	const out: Record<string, { top: number; bottom: number }> = {};
	for (const step of ['start', 'o2', 'he', 'top']) {
		const svg = page.getByTestId(`bottle-${step}`).locator('svg');
		if ((await svg.count()) === 0) continue;
		const box = (await svg.boundingBox())!;
		out[step] = { top: box.y, bottom: box.y + box.height };
	}
	return out;
}

test('the bottles stand on one line, whatever their captions and legends', async ({ page }) => {
	await page.goto('./');
	await page.getByLabel('Trimix').check();
	for (const [id, v] of [
		['target-o2', '21'],
		['target-he', '35'],
		['start-pressure', '50']
	]) {
		await page.getByTestId(id).fill(v);
		await page.getByTestId(id).blur();
	}
	await expect(page.getByTestId('bottle-top')).toBeVisible();
	const b = await bottleBottoms(page);
	const phone = page.viewportSize()!.width <= 640;
	// Desktop: all four on one line. Phone: steps 1–2, then 3–4 below.
	const lines = phone
		? [
				['start', 'o2'],
				['he', 'top']
			]
		: [['start', 'o2', 'he', 'top']];
	for (const line of lines) {
		for (const step of line) expect(Math.abs(b[step].bottom - b[line[0]].bottom)).toBeLessThan(1);
	}
	if (phone) expect(b.he.top).toBeGreaterThan(b.start.bottom);
	// Nitrox: three steps, one line on every screen.
	await page.getByLabel('Nitrox').check();
	await expect(page.getByTestId('bottle-he')).toHaveCount(0);
	const n = await bottleBottoms(page);
	expect(Math.abs(n.top.bottom - n.start.bottom)).toBeLessThan(1);
	expect(Math.abs(n.o2.bottom - n.start.bottom)).toBeLessThan(1);
});

test('the filling temperature sits next to its checkbox on desktop, below it on phones', async ({ page }) => {
	await page.goto('./');
	await page.getByTestId('compensate').check();
	const box = (await page.getByTestId('compensate').boundingBox())!;
	const field = (await page.getByTestId('temperature').boundingBox())!;
	const centre = box.y + box.height / 2;
	if (page.viewportSize()!.width > 640) {
		// Same line: the checkbox is level with the input, to its left.
		expect(centre).toBeGreaterThan(field.y);
		expect(centre).toBeLessThan(field.y + field.height);
		expect(field.x).toBeGreaterThan(box.x + box.width);
	} else {
		expect(field.y).toBeGreaterThan(box.y + box.height);
	}
});
