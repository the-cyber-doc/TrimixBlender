// Browser tests only (playwright.config.ts): a plain static web server that publishes build/
// in a folder chosen after the build, as anyone would by copying it there. No rewrites, no
// fallback page: what a folder on any web server does.
//   node scripts/serve-folder.js <port> <folder>     e.g. 4184 /any/deep/folder
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const [port, folder] = [Number(process.argv[2]), process.argv[3].replace(/\/$/, '')];
const root = new URL('../build', import.meta.url).pathname;
/** @type {Record<string, string>} */
const TYPES = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript',
	'.css': 'text/css',
	'.json': 'application/json',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.webmanifest': 'application/manifest+json',
	'.txt': 'text/plain'
};

createServer((request, response) => {
	const path = decodeURIComponent(new URL(request.url ?? '/', 'http://x').pathname);
	if (path === folder) {
		response.writeHead(301, { Location: `${folder}/` }).end();
		return;
	}
	if (!path.startsWith(`${folder}/`)) {
		response.writeHead(404).end();
		return;
	}
	let file = join(root, normalize(path.slice(folder.length)));
	if (!file.startsWith(root)) return void response.writeHead(403).end();
	if (path.endsWith('/')) file = join(file, 'index.html');
	try {
		if (!statSync(file).isFile()) throw new Error('not a file');
	} catch {
		response.writeHead(404).end();
		return;
	}
	response.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
	createReadStream(file).pipe(response);
}).listen(port, '127.0.0.1', () => console.log(`build/ at http://localhost:${port}${folder}/`));
