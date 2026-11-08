import { test, type Page } from '@playwright/test';

// Store screenshots (playwright.screenshots.config.ts, `npm run screenshots`): for each language,
// device and blend (nitrox, trimix), one screenshot per area of the app, that area open and the
// others closed. Written into fastlane's folders (APPSTORE.md):
//   Google Play: fastlane/metadata/android/<locale>/images/phoneScreenshots/
//   App Store:   fastlane/screenshots/ios/<locale>/ (iPhone 6.9" and iPad 13", told apart by size)

/** The app's language, and its locale code in each store. */
const LANGUAGES = [
	{ code: 'en', play: 'en-US', apple: 'en-US' },
	{ code: 'fr', play: 'fr-FR', apple: 'fr-FR' },
	{ code: 'de', play: 'de-DE', apple: 'de-DE' },
	{ code: 'es', play: 'es-ES', apple: 'es-ES' },
	{ code: 'it', play: 'it-IT', apple: 'it' },
	{ code: 'nl', play: 'nl-NL', apple: 'nl-NL' },
	{ code: 'ja', play: 'ja-JP', apple: 'ja' },
	{ code: 'zh', play: 'zh-CN', apple: 'zh-Hans' }
];

/** Viewport × scale = the image: Google Play phone 1080 × 1920 (at most 2:1); App Store iPhone
 * 6.9" 1320 × 2868 and iPad 13" 2064 × 2752 (the sizes App Store Connect requires). */
const DEVICES = [
	{ name: 'android', store: 'play', width: 360, height: 640, scale: 3, mobile: true },
	{ name: 'iphone', store: 'apple', width: 440, height: 956, scale: 3, mobile: true },
	{ name: 'ipad', store: 'apple', width: 1032, height: 1376, scale: 2, mobile: true }
] as const;

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

function path(device: (typeof DEVICES)[number], language: (typeof LANGUAGES)[number], file: string) {
	return device.store === 'play'
		? `fastlane/metadata/android/${language.play}/images/phoneScreenshots/${file}`
		: `fastlane/screenshots/ios/${language.apple}/${file}`;
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
		test(`${device.name} ${language.code}`, async ({ browser }) => {
			const context = await browser.newContext({
				viewport: { width: device.width, height: device.height },
				deviceScaleFactor: device.scale,
				isMobile: device.mobile,
				hasTouch: device.mobile,
				colorScheme: 'light',
				serviceWorkers: 'block'
			});
			const page = await context.newPage();
			await page.addInitScript((code) => {
				if (!localStorage.getItem('blender.preferences'))
					localStorage.setItem('blender.preferences', JSON.stringify({ language: code }));
			}, language.code);
			await page.goto('./');
			await page.locator(`html[lang="${language.code}"]`).waitFor();
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
					await page.screenshot({ path: path(device, language, file), animations: 'disabled', caret: 'hide' });
				}
			}
			await context.close();
		});
	}
}
