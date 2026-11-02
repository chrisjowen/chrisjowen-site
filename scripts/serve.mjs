// Serves dist/ locally, much as nginx does in production.
// Usage: npm run build && node scripts/serve.mjs [port=4790]   (127.0.0.1 only)
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const PORT = +(process.argv[2] ?? 4790);
const TYPES = {
	'.html': 'text/html; charset=utf-8',
	'.png': 'image/png',
	'.webp': 'image/webp',
	'.jpg': 'image/jpeg',
	'.svg': 'image/svg+xml',
	'.ico': 'image/x-icon',
	'.webmanifest': 'application/manifest+json',
	'.css': 'text/css; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.woff2': 'font/woff2',
	'.txt': 'text/plain; charset=utf-8',
	'.xml': 'application/xml'
};

createServer((req, res) => {
	const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
	const file = path.join(ROOT, url.endsWith('/') ? `${url}index.html` : url);
	let st;
	try {
		if (!file.startsWith(ROOT + path.sep)) throw new Error('outside');
		st = statSync(file);
		if (!st.isFile()) throw new Error('not a file');
	} catch {
		res.writeHead(404, { 'Content-Type': TYPES['.html'] });
		createReadStream(path.join(ROOT, '404.html')).pipe(res);
		return;
	}
	const ext = path.extname(file);
	const head = {
		'Content-Type': TYPES[ext] ?? 'application/octet-stream',
		'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
	};
	res.writeHead(200, { ...head, 'Content-Length': st.size });
	if (req.method === 'HEAD') return res.end();
	createReadStream(file).pipe(res);
}).listen(PORT, '127.0.0.1', () => console.log(`chrisjowen.net on http://127.0.0.1:${PORT}/`));
