import { expect, test, type Page } from '@playwright/test';

/** Types a value into a field, as a user would. */
async function type(page: Page, testid: string, value: string) {
	const field = page.getByTestId(testid);
	await field.fill(value);
	await field.blur();
}

test.beforeEach(async ({ page }) => {
	await page.goto('/');
});

test('nitrox: %O2, MOD and PPO2 are linked', async ({ page }) => {
	await expect(page.getByTestId('mod')).toHaveValue('33.8'); // EAN32 at 1.4
	await type(page, 'target-o2', '36');
	await expect(page.getByTestId('mod')).toHaveValue('28.9');
	await type(page, 'mod', '40');
	await expect(page.getByTestId('target-o2')).toHaveValue('28');
	await type(page, 'ppo2', '1.6');
	await expect(page.getByTestId('target-o2')).toHaveValue('32');
	await expect(page.getByTestId('mod')).toHaveValue('40');
	await expect(page.getByTestId('n2')).toHaveText('N2: 68 %');
});

test('nitrox blend: three bottles and the Nx sticker', async ({ page }) => {
	await expect(page.getByTestId('sticker')).toHaveText(/^Nx: 32\s*\|\s*2\d\.\d bar\s*\|\s*200 bar$/);
	await expect(page.getByTestId('bottle-he')).toHaveCount(0);
	await expect(page.getByTestId('bottle-o2').getByTestId('added')).toContainText('O2');
	await expect(page.getByTestId('free-gas')).toHaveText(/^2\d{3} l$/);
});

test('air blend: only air added', async ({ page }) => {
	await type(page, 'target-o2', '21');
	await expect(page.getByTestId('bottle-o2').getByTestId('added')).toHaveText('+0 bar O2');
	await expect(page.getByTestId('sticker')).toHaveText(/^Nx: 21\s*\|\s*0 bar\s*\|\s*200 bar$/);
});

test('trimix: %He and END are linked, four bottles and the Tx sticker', async ({ page }) => {
	await page.getByLabel('Trimix').check();
	await expect(page.getByTestId('end')).toBeDisabled(); // no depth yet
	await type(page, 'depth', '60');
	await type(page, 'target-o2', '21');
	await type(page, 'target-he', '35');
	await expect(page.getByTestId('end')).toHaveValue('35.5');
	await type(page, 'end', '30');
	await expect(page.getByTestId('target-he')).toHaveValue('42.9');
	await type(page, 'target-he', '35');
	await expect(page.getByTestId('bottle-he')).toBeVisible();
	await expect(page.getByTestId('sticker')).toHaveText(/^Tx: 21\/35\s*\|.*bar\s*\|.*bar\s*\|\s*200 bar$/);
	const reminder = page.getByTestId('reminder');
	await expect(reminder).toContainText('Tx21/35');
	await expect(reminder).toContainText('PPHe');
	await expect(reminder).toContainText('2.45');
	// Bottles: the top-up as Air, in blue; He in brown.
	await expect(page.getByTestId('bottle-top').locator('[data-band="Air"]')).toHaveAttribute('fill', '#1c6dd0');
	await expect(page.getByTestId('bottle-he').locator('[data-band="He"]')).toHaveAttribute('fill', '#8b5a2b');
});

test('the bottle fills in proportion to the target pressure', async ({ page }) => {
	await type(page, 'target-pressure', '300');
	await type(page, 'start-pressure', '100');
	const bands = page.getByTestId('bottle-start').locator('rect[data-band]');
	const heights = await bands.evaluateAll((rects) => rects.map((r) => Number(r.getAttribute('height'))));
	const total = heights.reduce((a, b) => a + b, 0);
	expect(total / 188).toBeCloseTo(1 / 3, 2);
});

test('impossible mix: an error, and the drain-down pressure to apply', async ({ page }) => {
	await type(page, 'start-o2', '50');
	await type(page, 'start-pressure', '100');
	const error = page.getByTestId('blend-error');
	await expect(error).toContainText('too much O2');
	await expect(page.getByTestId('sticker')).toHaveCount(0);
	await error.getByRole('button', { name: /Set the cylinder to/ }).click();
	await expect(error).toHaveCount(0);
	await expect(page.getByTestId('sticker')).toBeVisible();
});

test('impossible even from empty: hypoxic nitrox', async ({ page }) => {
	await type(page, 'target-o2', '15');
	await expect(page.getByTestId('blend-error')).toContainText('cannot be made');
});

test('add, edit, disable and remove gases', async ({ page }) => {
	await page.getByRole('checkbox', { name: 'Use O2' }).uncheck();
	await expect(page.getByTestId('blend-error')).toContainText('No O2 gas');
	await page.getByRole('checkbox', { name: 'Use O2' }).check();
	await expect(page.getByTestId('blend-error')).toHaveCount(0);
	await page.getByRole('button', { name: 'Add a gas' }).click();
	await expect(page.getByTestId('gas')).toHaveCount(5);
	const last = page.getByTestId('gas').last();
	// The name follows the mix while it is the mix's own.
	await last.getByLabel('O2').fill('32');
	await expect(last.getByLabel('Name')).toHaveValue('Nx32');
	await last.getByLabel('He').fill('20');
	await expect(last.getByLabel('Name')).toHaveValue('Tx32/20');
	await last.getByRole('button', { name: /Remove/ }).click();
	await expect(page.getByTestId('gas')).toHaveCount(4);
});

test('temperature compensation, units from the preferences, kept after a reload', async ({ page }) => {
	await page.getByRole('button', { name: 'Menu' }).click();
	await page.getByRole('menuitem', { name: 'Preferences' }).click();
	await page.getByLabel('°F').check();
	await page.getByLabel('psi').check();
	await page.getByLabel('cu ft').check();
	await page.getByLabel('ft', { exact: true }).check();
	await page.goto('/');
	await expect(page.getByTestId('target-pressure')).toHaveValue('2901');
	await expect(page.getByTestId('mod')).toHaveValue('111');
	await expect(page.getByTestId('volume')).toHaveValue('0.42');
	await page.getByTestId('compensate').check();
	await expect(page.getByText('Cylinder temperature while filling (°F)')).toBeVisible();
	await expect(page.getByTestId('temperature')).toHaveValue('95');
	const before = await page.getByTestId('bottle-top').getByTestId('total').textContent();
	await type(page, 'temperature', '50');
	await expect(page.getByTestId('bottle-top').getByTestId('total')).not.toHaveText(before!);
	await page.reload();
	await expect(page.getByTestId('compensate')).toBeChecked();
	await expect(page.getByTestId('temperature')).toHaveValue('50');
	await expect(page.getByTestId('sticker')).toContainText('psi');
});

test('gas density: at the MOD without a depth, with its ceilings', async ({ page }) => {
	// EAN32 at its MOD (33.8 m): about 5.65 g/l; no warning without a target depth.
	await expect(page.getByTestId('density-value')).toHaveText(/^5\.6\d? g\/l$/);
	await expect(page.getByTestId('density')).toContainText('Gas density at the MOD (33.8 m)');
	await expect(page.getByTestId('density-limits')).toContainText('Recommended ≤ 5.2 g/l down to');
	await expect(page.getByTestId('density-limits')).toContainText('maximum 6.2 g/l at');
	await expect(page.getByText('Gas density at the target depth is above')).toHaveCount(0);
	await expect(page.getByTestId('reminder-density')).toHaveText(/^5\.6\d? g\/l$/);
});

test('gas density: warnings at the target depth, lower with more helium', async ({ page }) => {
	await page.getByLabel('Trimix').check();
	await type(page, 'depth', '60');
	await type(page, 'target-o2', '21');
	await type(page, 'target-he', '35');
	// 21/35 at 60 m: 6.3 g/l, above the 6.2 maximum.
	await expect(page.getByTestId('target-density')).toHaveValue(/^6\.3\d?$/);
	await expect(page.getByText('above the 6.2 g/l absolute maximum')).toBeVisible();
	await expect(page.getByTestId('reminder-density')).toHaveText(/^6\.3\d? g\/l$/);
	// 40 % He: about 5.9 g/l, above the recommended 5.2 only.
	await type(page, 'target-he', '40');
	await expect(page.getByText('above the recommended 5.2 g/l')).toBeVisible();
	await expect(page.getByText('above the 6.2 g/l absolute maximum')).toHaveCount(0);
	// 55 % He: below both.
	await type(page, 'target-he', '55');
	await expect(page.getByText(/Gas density at the target depth is above/)).toHaveCount(0);
});

test('gas density ceilings follow the depth unit', async ({ page }) => {
	await page.getByRole('button', { name: 'Menu' }).click();
	await page.getByRole('menuitem', { name: 'Preferences' }).click();
	await page.getByLabel('ft', { exact: true }).check();
	await page.goto('/');
	const limits = page.getByTestId('density-limits');
	await expect(limits).toContainText(/down to \d+ ft/);
	await expect(limits).toContainText(/6\.2 g\/l at \d+ ft/);
});

test('the About page cites the gas density sources', async ({ page }) => {
	await page.goto('/about');
	await expect(page.getByText('Anthony, G. & Mitchell, S.J. (2016)')).toBeVisible();
	await expect(page.getByText('Warkander, D.E.')).toBeVisible();
	await expect(page.getByText('Doolette, D.J. & Mitchell, S.J. (2011)')).toBeVisible();
	await expect(page.getByText('Standard atomic weights of the elements 2021')).toBeVisible();
});

test('trimix: %He, END and gas density are linked', async ({ page }) => {
	await page.getByLabel('Trimix').check();
	// No depth: END and density disabled, the ceilings shown under the density.
	await expect(page.getByTestId('target-density')).toBeDisabled();
	await expect(page.getByTestId('target-density')).toHaveValue('');
	const note = page.getByTestId('density-limits');
	await expect(note).toContainText('Recommended ≤ 5.2 g/l down to');
	await expect(note).not.toContainText('Anthony');
	await type(page, 'depth', '60');
	await type(page, 'target-o2', '21');
	await expect(page.getByTestId('target-density')).toBeEnabled();
	// He → END and density.
	await type(page, 'target-he', '35');
	await expect(page.getByTestId('end')).toHaveValue('35.5');
	await expect(page.getByTestId('target-density')).toHaveValue(/^6\.3\d?$/);
	// Density → He and END (O2 kept).
	await type(page, 'target-density', '5.2');
	await expect(page.getByTestId('target-he')).toHaveValue(/^(49\.\d|50(\.\d)?)$/);
	await expect(page.getByTestId('end')).toHaveValue(/^2[45]\.\d$/);
	await expect(page.getByTestId('target-o2')).toHaveValue('21');
	await expect(page.getByTestId('target-density')).toHaveValue('5.2');
	// END → He and density.
	await type(page, 'end', '30');
	await expect(page.getByTestId('target-he')).toHaveValue('42.9');
	await expect(page.getByTestId('target-density')).toHaveValue(/^5\.7\d?$/);
	// Removing the depth disables both again.
	await type(page, 'depth', '');
	await expect(page.getByTestId('target-density')).toBeDisabled();
	await expect(page.getByTestId('end')).toBeDisabled();
});
