// Checks a built dist/: every local file the page or its CSS names exists, nothing loads from another
// origin, the share card, favicon and sitemap are in place, the page carries nothing private, and the
// first view stays within its weight budget. Lists the facts still to come from Chris.
// Usage: node scripts/build.mjs && node scripts/check.mjs
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { TODOS } from '../src/content.mjs';

const DIST = path.resolve(import.meta.dirname, '../dist');
const html = readFileSync(path.join(DIST, 'index.html'), 'utf8');
const problems = [];

// Everything the browser loads by itself: src, srcset, stylesheet/preload/icon/manifest hrefs, scripts.
const loads = new Set();
for (const m of html.matchAll(/\ssrc="([^"]+)"/g)) loads.add(m[1]);
for (const m of html.matchAll(/\ssrcset="([^"]+)"/g)) for (const part of m[1].split(',')) loads.add(part.trim().split(/\s+/)[0]);
for (const m of html.matchAll(/<link[^>]+rel="(?:stylesheet|preload|icon|apple-touch-icon|manifest)"[^>]*>/g)) loads.add(/href="([^"]+)"/.exec(m[0])[1]);
const cssFile = /rel="stylesheet" href="([^"]+)"/.exec(html)[1];
const css = readFileSync(path.join(DIST, cssFile), 'utf8');
for (const m of css.matchAll(/url\(([^)]+)\)/g)) loads.add(m[1].replace(/^['"]|['"]$/g, ''));

for (const u of loads) {
	if (!u.startsWith('/')) {
		problems.push(`loads from outside the site: ${u}`);
		continue;
	}
	if (!existsSync(path.join(DIST, u))) problems.push(`missing file: ${u}`);
}
if (/\sstyle="/.test(html)) problems.push('an inline style attribute, which the Content-Security-Policy blocks');
if (/fonts\.(googleapis|gstatic)\.com/.test(html + css)) problems.push('page still names Google Fonts');

for (const f of ['og:title', 'og:description', 'og:image', 'og:url', 'twitter:card', 'twitter:image']) {
	if (!html.includes(`"${f}"`)) problems.push(`missing <meta> ${f}`);
}
const og = /property="og:image" content="https:\/\/chrisjowen\.net(\/[^"]+)"/.exec(html);
if (!og || !existsSync(path.join(DIST, og[1]))) problems.push('og:image does not point at a built file');
for (const f of ['favicon.ico', 'favicon.svg', 'apple-touch-icon.png', 'robots.txt', 'sitemap.xml', 'site.webmanifest']) {
	if (!existsSync(path.join(DIST, f))) problems.push(`missing ${f}`);
}
if (!readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8').includes('<loc>https://chrisjowen.net/</loc>')) problems.push('sitemap.xml does not list https://chrisjowen.net/');

// Only distilled CV content belongs here: no CV file, phone number or personal email.
if (/cv-20\d\d|\.pdf"|hotmail|gmail|mailto:|\+65|(?<![\w/-])[689]\d{3}[\s-]?\d{4}(?![\w/])/.test(html)) problems.push('page names a CV file, phone number or email address');

// Unknown facts stay out of the rendered page, as TODO comments only.
if (/>\s*TODO|class="todo"/i.test(html)) problems.push('a TODO is visible on the page');
const marked = [...html.matchAll(/<!-- TODO\(chris\): (.*?) -->/g)].map((m) => m[1]);
if (marked.length !== TODOS.length) problems.push(`the page marks ${marked.length} TODOs but src/content.mjs lists ${TODOS.length}`);

// The first view: HTML, CSS, JS, the font and the logos.
const KB = (f) => statSync(path.join(DIST, f)).size / 1024;
const first = [
	'index.html',
	cssFile,
	/<script type="module" src="([^"]+)"/.exec(html)[1],
	...[...html.matchAll(/rel="preload" href="([^"]+)"/g)].map((m) => m[1]),
	...[...html.matchAll(/<img src="(\/assets\/logo-[^"]+)"/g)].map((m) => m[1])
].reduce((sum, f) => sum + KB(f), 0);
if (first > 250) problems.push(`first view weighs ${first.toFixed(0)} KB, over the 250 KB budget`);

if (problems.length) {
	console.error(problems.map((p) => `✗ ${p}`).join('\n'));
	process.exit(1);
}
console.log(`✓ ${loads.size} local files present, no outside loads, share card and favicon in place, first view ${first.toFixed(0)} KB`);
console.log(`  ${TODOS.length} facts still to come from Chris (TODO comments in the page):\n${TODOS.map((t) => `  - ${t}`).join('\n')}`);
