// After `vite build`: makes build/index.html relative to its own folder, so the build can be
// published in any folder of any web server, chosen after the build. With APP_TARGET=native
// (vite.config.ts): build-native/, the files inside the Android and iOS apps, which have no
// precompressed copies and no service worker (never registered there: removed).
//
// With hash routing (vite.config.ts) SvelteKit finds the app's folder at run time, and every
// script fetches what it needs from there, except index.html itself: SvelteKit writes its
// <link> tags and the boot script's import() calls as absolute paths ("/_app/…"). This turns them
// into "./_app/…", updates the boot script's hash in the page's Content-Security-Policy (its
// text changed), and writes the precompressed copies (.gz, .br) again.
import { createHash } from 'node:crypto';
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { brotliCompressSync, constants, gzipSync } from 'node:zlib';
import { parse } from 'parse5';

/** The text of each inline script of the page, as written (what a CSP hash covers), found by an
 * HTML parser as a browser would: any case of <script>, with attributes, `</script >`…
 * @param {string} html */
export function inlineScripts(html) {
	/** @type {string[]} */
	const scripts = [];
	/** @param {any} node a parse5 node */
	const walk = (node) => {
		const location = node.sourceCodeLocation;
		if (node.nodeName === 'script' && !node.attrs.some((/** @type {any} */ a) => a.name === 'src')) {
			// No end tag (a page cut short): the script runs to the end of the page.
			scripts.push(html.slice(location.startTag.endOffset, location.endTag?.startOffset ?? html.length));
		}
		for (const child of node.childNodes ?? []) walk(child);
	};
	walk(parse(html, { sourceCodeLocationInfo: true }));
	return scripts;
}

/** The page with relative paths and its CSP's script hashes updated.
 * @param {string} html */
export function makeRelative(html) {
	const relative = html.replaceAll('"/_app/', '"./_app/');
	const hash = (/** @type {string} */ script) => `'sha256-${createHash('sha256').update(script).digest('base64')}'`;
	const before = inlineScripts(html).map(hash);
	const after = inlineScripts(relative).map(hash);
	let out = relative;
	before.forEach((old, i) => (out = out.replace(old, after[i])));
	if (/(href|src)="\/(?!\/)/.test(out) || out.includes('"/_app/')) {
		throw new Error('index.html still has absolute paths');
	}
	return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const native = process.env.APP_TARGET === 'native';
	const folder = native ? 'build-native' : 'build';
	const file = new URL(`../${folder}/index.html`, import.meta.url);
	const html = makeRelative(readFileSync(file, 'utf8'));
	writeFileSync(file, html);
	if (native) {
		rmSync(new URL(`../${folder}/service-worker.js`, import.meta.url), { force: true });
	} else {
		writeFileSync(`${file.pathname}.gz`, gzipSync(html, { level: 9 }));
		writeFileSync(
			`${file.pathname}.br`,
			brotliCompressSync(html, { params: { [constants.BROTLI_PARAM_QUALITY]: constants.BROTLI_MAX_QUALITY } })
		);
	}
	console.log(`${folder}/index.html: relative paths`);
}
