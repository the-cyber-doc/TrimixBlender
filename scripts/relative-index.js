// After `vite build`: makes build/index.html relative to its own folder, so the build can be
// published in any folder of any web server, chosen after the build.
//
// With hash routing (vite.config.ts) SvelteKit finds the app's folder at run time, and every
// script fetches what it needs from there, except index.html itself: SvelteKit writes its
// <link> tags and the boot script's import() calls as absolute paths ("/_app/…"). This turns them
// into "./_app/…", updates the boot script's hash in the page's Content-Security-Policy (its
// text changed), and writes the precompressed copies (.gz, .br) again.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { brotliCompressSync, constants, gzipSync } from 'node:zlib';

/** The page with relative paths and its CSP's script hashes updated.
 * @param {string} html */
export function makeRelative(html) {
	const relative = html.replaceAll('"/_app/', '"./_app/');
	const hash = (/** @type {string} */ script) => `'sha256-${createHash('sha256').update(script).digest('base64')}'`;
	const before = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => hash(m[1]));
	const after = [...relative.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => hash(m[1]));
	let out = relative;
	before.forEach((old, i) => (out = out.replace(old, after[i])));
	if (/(href|src)="\/(?!\/)/.test(out) || out.includes('"/_app/')) {
		throw new Error('index.html still has absolute paths');
	}
	return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const file = new URL('../build/index.html', import.meta.url);
	const html = makeRelative(readFileSync(file, 'utf8'));
	writeFileSync(file, html);
	writeFileSync(`${file.pathname}.gz`, gzipSync(html, { level: 9 }));
	writeFileSync(
		`${file.pathname}.br`,
		brotliCompressSync(html, { params: { [constants.BROTLI_PARAM_QUALITY]: constants.BROTLI_MAX_QUALITY } })
	);
	console.log('build/index.html: relative paths');
}
