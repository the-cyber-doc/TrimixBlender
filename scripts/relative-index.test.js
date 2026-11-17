import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { inlineScripts, makeRelative } from './relative-index.js';

const sha = (/** @type {string} */ s) => `'sha256-${createHash('sha256').update(s).digest('base64')}'`;
const script = `\n\timport("/_app/immutable/entry/start.js").then((kit) => kit.start());\n`;
const page = `<head><meta http-equiv="content-security-policy" content="script-src 'self' ${sha(script)}">
<link href="/_app/immutable/entry/start.js" rel="modulepreload"><link rel="icon" href="./favicon.svg"></head>
<body><script>${script}</script></body>`;

describe('relative index.html', () => {
	it('makes the paths relative and updates the script hash', () => {
		const out = makeRelative(page);
		expect(out).toContain('href="./_app/immutable/entry/start.js"');
		expect(out).toContain('import("./_app/immutable/entry/start.js")');
		expect(out).not.toContain('"/_app/');
		const relativeScript = script.replace('"/_app/', '"./_app/');
		expect(out).toContain(sha(relativeScript));
		expect(out).not.toContain(sha(script));
	});

	it('finds the inline scripts as a browser does, whatever their case and attributes', () => {
		expect(
			inlineScripts(
				'<head><SCRIPT type="module">a()</SCRIPT ><script src="/x.js"></script></head>' +
					'<body><script nonce="n">\n</b>\n</script><Script>c()'
			)
		).toEqual(['a()', '\n</b>\n', 'c()']);
		expect(inlineScripts('<p>no script</p>')).toEqual([]);
	});

	it('refuses a page with other absolute paths left', () => {
		expect(() => makeRelative(page.replace('./favicon.svg', '/favicon.svg'))).toThrow('absolute paths');
	});
});
