// The app's icons, from static/favicon.svg, rendered by Playwright's Chromium: no image tool to
// install. Run after changing the SVG:
//   npm run icons
// PWA (static/icons/): "any" icons keep the transparent corners; "maskable" and Apple icons get
// a solid background, the artwork inside the 80 % safe zone (the OS crops the rest).
// Android (android/app/src/main/res/): the adaptive icon is the bottle alone (foreground) on the
// favicon's blue (background colour, ic_launcher_background.xml), inside the 66 dp safe circle
// of its 108 dp; plus the square and round icons of older Android versions.
// iOS (ios/App/App/Assets.xcassets/): the 1024 px icon, opaque (iOS rounds the corners), and
// the launch screen, the icon on the page's background, light and dark.
import { readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const svg = readFileSync(new URL('../static/favicon.svg', import.meta.url), 'utf8');
const BACKGROUND = '#f3f5f7'; // --bg (app.css), also the manifest's background_color
const BACKGROUND_DARK = '#121417'; // --bg, dark theme
const BLUE = '#0b6e99'; // the favicon's square
// The favicon without its blue square: the bottle, for icons whose background is the blue.
const bottle = svg.replace(/<rect x="2" y="2" width="60" height="60" rx="14" fill="#0b6e99"\/>/, '');
if (bottle === svg) throw new Error('favicon.svg: its blue square was not found');

const RES = '../android/app/src/main/res/';
const IOS = '../ios/App/App/Assets.xcassets/';
const DENSITIES = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };

/** @typedef {{ file: string, size: number, art?: number, background?: string, image?: string, round?: boolean }} Icon
 * `art`: the artwork's share of the icon's width (1: all of it). */
/** @type {Icon[]} */
const ICONS = [
	{ file: '../static/icons/icon-192.png', size: 192 },
	{ file: '../static/icons/icon-512.png', size: 512 },
	{ file: '../static/icons/icon-maskable-512.png', size: 512, art: 0.7, background: BACKGROUND },
	{ file: '../static/icons/apple-touch-icon.png', size: 180, art: 0.7, background: BACKGROUND }, // no transparency
	...Object.entries(DENSITIES).flatMap(([density, scale]) => [
		{ file: `${RES}mipmap-${density}/ic_launcher.png`, size: 48 * scale },
		{
			file: `${RES}mipmap-${density}/ic_launcher_round.png`,
			size: 48 * scale,
			background: BLUE,
			image: bottle,
			round: true
		},
		{ file: `${RES}mipmap-${density}/ic_launcher_foreground.png`, size: 108 * scale, art: 0.65, image: bottle }
	]),
	{ file: `${IOS}AppIcon.appiconset/AppIcon-512@2x.png`, size: 1024, background: BLUE, image: bottle },
	{ file: `${IOS}Splash.imageset/splash.png`, size: 2732, art: 0.1, background: BACKGROUND },
	{ file: `${IOS}Splash.imageset/splash-dark.png`, size: 2732, art: 0.1, background: BACKGROUND_DARK }
];

const browser = await chromium.launch();
const page = await browser.newPage();
for (const { file, size, art = 1, background = 'transparent', image = svg, round = false } of ICONS) {
	const side = Math.round(size * art);
	await page.setViewportSize({ width: size, height: size });
	await page.setContent(
		`<body style="margin:0;display:grid;place-items:center;width:${size}px;height:${size}px;` +
			`background:${round ? 'transparent' : background}">` +
			(round
				? `<div style="display:grid;place-items:center;width:100%;height:100%;border-radius:50%;background:${background}">`
				: '') +
			`<div style="width:${side}px;height:${side}px">${image.replace('<svg ', '<svg width="100%" height="100%" ')}</div>` +
			(round ? '</div>' : '') +
			'</body>'
	);
	const path = new URL(file, import.meta.url).pathname;
	await page.screenshot({ path, omitBackground: background === 'transparent' || round });
	console.log(path.replace(new URL('..', import.meta.url).pathname, ''));
}
await browser.close();
