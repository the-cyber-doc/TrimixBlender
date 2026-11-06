import { expect, test } from '@playwright/test';

// The About page, opened directly by its link (./#/about), as from a bookmark: the first load
// of the page, wherever the app is published. (Not after another page: changing the hash while
// the app is still starting is a race no user can run into.)

test('the About page: the app, its version, links and copyright, then how it calculates', async ({ page }) => {
	await page.goto('./#/about');
	const card = page.locator('.about');
	// Right below "About": the icon and the name.
	await expect(card.locator('h1 + p.app')).toContainText('Trimix Blender');
	await expect(card.locator('p.app img')).toHaveAttribute('src', /favicon\.svg$/);
	await expect(page.getByRole('link', { name: 'Source code on GitHub' })).toHaveAttribute(
		'href',
		'https://github.com/the-cyber-doc/TrimixBlender'
	);
	await expect(page.getByRole('link', { name: 'Docker image on Docker Hub' })).toHaveAttribute(
		'href',
		'https://hub.docker.com/r/thecyberdoc/trimix-blender'
	);
	await expect(page.getByTestId('copyright')).toHaveText(
		/^©\s+\d{4}\s+the-cyber-doc\s+·\s+Licensed under the GNU GPL v3$/
	);
	// "How it calculates" and "References" last, in that order.
	const headings = await card.locator('h2').allTextContents();
	expect(headings).toEqual(['How it calculates', 'References']);
	const copyright = (await page.getByTestId('copyright').boundingBox())!;
	const how = (await page.getByRole('heading', { name: 'How it calculates' }).boundingBox())!;
	expect(how.y).toBeGreaterThan(copyright.y);
});

test('the About page cites the gas density sources', async ({ page }) => {
	await page.goto('./#/about');
	// A release build (its git tag) shows its version; any other build "dev" and its ID.
	await expect(page.getByTestId('version')).toHaveText(/^Version (\d+\.\d+\.\d+\S*|dev \(build \S+\))$/);
	await expect(page.getByText('Anthony, G. & Mitchell, S.J. (2016)')).toBeVisible();
	await expect(page.getByText('Warkander, D.E.')).toBeVisible();
	await expect(page.getByText('Doolette, D.J. & Mitchell, S.J. (2011)')).toBeVisible();
	await expect(page.getByText('Standard atomic weights of the elements 2021')).toBeVisible();
});
