import { test, type Page } from '@playwright/test';
import { mkdirSync, readFileSync, rmSync, symlinkSync } from 'node:fs';
import { relative } from 'node:path';

// Store screenshots (playwright.screenshots.config.ts, `npm run screenshots`): for each language,
// device and blend (nitrox, trimix), one screenshot per area of the app, that area open and the
// others closed. Written into fastlane's folders (APPSTORE.md), a phone and the tablets for each store:
//   Google Play: fastlane/metadata/android/<locale>/images/phoneScreenshots/, sevenInchScreenshots/,
//                tenInchScreenshots/ (links to the iPad's)
//   App Store:   fastlane/screenshots/ios/<locale>/ (iPhone 6.9" and iPad 13", told apart by size)
//   F-Droid reads Google Play's, from the sources at the release's tag.
// A link is a relative symlink, not a copy (fastlane follows them; `cp -rL` copies what they point to).

/** The app's language, and its locale code in each store (fastlane/listings.json). */
type Language = { app: string; play: string; apple: string };
const LANGUAGES: Language[] = JSON.parse(readFileSync('fastlane/listings.json', 'utf8'));

const play = (folder: string) => (l: Language) => `fastlane/metadata/android/${l.play}/images/${folder}`;
const apple = (l: Language) => `fastlane/screenshots/ios/${l.apple}`;

/** Viewport × scale = the image, written in the first folder and linked from the others: App Store
 * iPhone 6.9" 1320 × 2868 and iPad 13" 2064 × 2752 (the sizes App Store Connect requires); Google
 * Play phone 1320 × 2640, the iPhone's view cut to the 2:1 Play accepts at most (the iPhone's is
 * 2.17:1), and 7" tablet 1200 × 1920 (a 600 × 960 dp tablet); Play's 10" tablet is the iPad. */
const DEVICES = [
	{
		name: 'android',
		width: 440,
		height: 880,
		scale: 3,
		folders: [play('phoneScreenshots')]
	},
	{
		name: 'tablet',
		width: 600,
		height: 960,
		scale: 2,
		folders: [play('sevenInchScreenshots')]
	},
	{ name: 'iphone', width: 440, height: 956, scale: 3, folders: [apple] },
	{
		name: 'ipad',
		width: 1032,
		height: 1376,
		scale: 2,
		folders: [apple, play('tenInchScreenshots')]
	}
];

const AREAS = ['gases', 'target', 'mix'] as const;

/** The blends shown: typed in the fields, as a user would. */
const BLENDS = {
	nitrox: { kind: 0, fields: { depth: '30', 'target-o2': '32', 'start-o2': '32', 'start-pressure': '50' } },
	trimix: {
		kind: 1,
		fields: {
			depth: '50',
			'target-o2': '18',
			'target-he': '45',
			'start-o2': '18',
			'start-he': '45',
			'start-pressure': '40'
		}
	}
} as const;

/** Links `file` in the folder `link` to the same file in `target`: a relative symlink. */
function link(target: string, folder: string, file: string) {
	mkdirSync(folder, { recursive: true });
	rmSync(`${folder}/${file}`, { force: true });
	symlinkSync(relative(folder, `${target}/${file}`), `${folder}/${file}`);
}

/** Opens one area (by its position) and closes the others. */
async function showArea(page: Page, index: number) {
	const areas = page.locator('section.area');
	for (let i = 0; i < 3; i++) {
		const area = areas.nth(i);
		const open = (await area.locator('button.arrow[aria-expanded="true"]').count()) > 0;
		if (i !== index && open) await area.locator('button.arrow').click();
		if (i === index && !open) await area.locator('button.expand').click();
	}
}

test.describe.configure({ mode: 'parallel' });

for (const device of DEVICES) {
	for (const language of LANGUAGES) {
		test(`${device.name} ${language.app}`, async ({ browser }) => {
			const context = await browser.newContext({
				viewport: { width: device.width, height: device.height },
				deviceScaleFactor: device.scale,
				isMobile: true,
				hasTouch: true,
				colorScheme: 'light',
				serviceWorkers: 'block'
			});
			const page = await context.newPage();
			await page.addInitScript((code) => {
				if (!localStorage.getItem('blender.preferences'))
					localStorage.setItem('blender.preferences', JSON.stringify({ language: code }));
			}, language.app);
			await page.goto('./');
			await page.locator(`html[lang="${language.app}"]`).waitFor();
			let n = 1;
			for (const [kind, blend] of Object.entries(BLENDS)) {
				await showArea(page, 1);
				await page.locator('fieldset.kind input[type="radio"]').nth(blend.kind).check();
				for (const [id, value] of Object.entries(blend.fields)) {
					await showArea(page, id.startsWith('start') ? 2 : 1);
					await page.getByTestId(id).fill(value);
					await page.getByTestId(id).blur();
				}
				for (const [index, area] of AREAS.entries()) {
					await showArea(page, index);
					// The blend's result in view: the bottles from the top of the screen (under the header).
					await page.evaluate((mix) => {
						const bottles = document.querySelector('.bottles');
						const header = document.querySelector('header')!.getBoundingClientRect().height;
						const top = mix && bottles ? bottles.getBoundingClientRect().top + window.scrollY - header - 16 : 0;
						window.scrollTo(0, top);
					}, area === 'mix');
					const file = `${n++}_${device.name}-${area}-${kind}.png`;
					const [first, ...others] = device.folders.map((folder) => folder(language));
					await page.screenshot({ path: `${first}/${file}`, animations: 'disabled', caret: 'hide' });
					for (const folder of others) link(first, folder, file);
				}
			}
			await context.close();
		});
	}
}
