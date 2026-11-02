// Builds the static site into dist/: screenshots to responsive WebP, fonts self-hosted, the favicon and
// share card drawn from the Outfit glyphs, every asset content-hashed under /assets/ so it can be
// cached for good, and the page rendered to plain HTML.
// Usage: node scripts/build.mjs
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import opentype from 'opentype.js';
import sharp from 'sharp';
import { ICONS, LANGS, LOGOS, SITE } from '../src/content.mjs';
import { render, renderNotFound } from '../src/page.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');
const require = createRequire(import.meta.url);

const hash = (buf) => createHash('sha256').update(buf).digest('hex').slice(0, 10);

/** Writes buf as /assets/<name>.<hash>.<ext> and returns its public path. */
async function emit(name, ext, buf) {
	const rel = `/assets/${name}.${hash(buf)}.${ext}`;
	await writeFile(path.join(DIST, rel), buf);
	return rel;
}

/** WebP at each width up to the source's own; returns what an <img> needs. */
async function webp(file, name, widths, quality = 80) {
	const src = sharp(path.join(ROOT, file));
	const { width, height } = await src.metadata();
	const sizes = [...new Set(widths.map((w) => Math.min(w, width)))];
	const out = [];
	for (const w of sizes) out.push({ w, url: await emit(`${name}-${w}`, 'webp', await src.clone().resize({ width: w }).webp({ quality, effort: 6 }).toBuffer()) });
	const biggest = out.at(-1);
	return {
		src: out[0].url,
		srcset: out.map((o) => `${o.url} ${o.w}w`).join(', '),
		width: biggest.w,
		height: Math.round((height * biggest.w) / width)
	};
}

// ---------- the //CO mark and the share card, drawn as paths from Outfit's glyphs ----------

const fonts = {};
function font(weight) {
	if (!fonts[weight]) {
		const buf = readFileSync(require.resolve(`@fontsource/outfit/files/outfit-latin-${weight}-normal.woff`));
		fonts[weight] = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length));
	}
	return fonts[weight];
}

/**
 * Lays out runs of text on one baseline from x and returns SVG paths and the end x.
 * A run is [text, fill, { weight, oblique }].
 */
function line(runs, x, y, size) {
	let out = '';
	for (const [text, fill, { weight = 700, oblique = false } = {}] of runs) {
		const f = font(weight);
		const d = f.getPath(text, x, y, size).toPathData(2);
		// The site's logo sets the slashes in italic; Outfit has no italic, so slant them as the browser does.
		const t = oblique ? ` transform="translate(${x} ${y}) skewX(-14) translate(${-x} ${-y})"` : '';
		out += `<path d="${d}" fill="${fill}"${t}/>`;
		x += f.getAdvanceWidth(text, size) + (oblique ? size * 0.04 : 0);
	}
	return { svg: out, x };
}
const width = (runs, size) => line(runs, 0, 0, size).x;

const NAVY = '#080d1a';
const AMBER = '#f8a61c';
const WHITE = '#f2f4f8';
const MARK = [['//', AMBER, { oblique: true }], ['CO', WHITE]];

/** The square //CO icon at any size; `round` gives it the favicon's rounded corners. */
function iconSvg(round) {
	const size = 13.5;
	const w = width(MARK, size);
	const { svg } = line(MARK, (32 - w) / 2 - 0.3, 20.8, size);
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32"${round ? ' rx="7"' : ''} fill="${NAVY}"/>${svg}</svg>\n`;
}

/** A 1200×630 Open Graph card: the mark, the greeting, the positioning and the address. */
function ogSvg() {
	const pad = 88;
	const mark = line(MARK, pad, 128, 46).svg;
	const hi = line([["Hey, I'm ", WHITE], ['Chris Owen', AMBER], ['!', WHITE]], pad, 318, 92).svg;
	const sub1 = line([['Software architect in Singapore.', '#c8cedb', { weight: 300 }]], pad, 400, 38).svg;
	const sub2 = line([['AI platforms and agentic engineering.', '#c8cedb', { weight: 300 }]], pad, 452, 38).svg;
	const site = line([['chrisjowen.net', '#8b95aa', { weight: 500 }]], pad, 560, 28).svg;
	let squiggle = `M${pad} 508`;
	for (let i = 1; i <= 16; i++) squiggle += ` L${pad + i * 7.5} ${i % 2 ? 500 : 508}`;
	return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="${NAVY}"/>
<circle cx="1110" cy="96" r="250" fill="#0d162b"/>
<circle cx="1110" cy="96" r="150" fill="#131e3a"/>
${mark}${hi}${sub1}${sub2}
<path d="${squiggle}" fill="none" stroke="${AMBER}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
${site}
</svg>`;
}

/** A .ico holding one PNG, which every browser since IE Vista reads. */
function ico(png, size) {
	const head = Buffer.alloc(22);
	head.writeUInt16LE(0, 0);
	head.writeUInt16LE(1, 2); // icon
	head.writeUInt16LE(1, 4); // one image
	head.writeUInt8(size, 6);
	head.writeUInt8(size, 7);
	head.writeUInt16LE(1, 10); // colour planes
	head.writeUInt16LE(32, 12); // bits per pixel
	head.writeUInt32LE(png.length, 14);
	head.writeUInt32LE(22, 18);
	return Buffer.concat([head, png]);
}

// ---------- the build ----------

// fontsource's latin subset
const LATIN = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';

// Applies a saved theme before first paint.
const THEME_SCRIPT = `try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`;

const SCREENSHOTS = ['wh-home.png', 'wh-home-dark.png', 'docket-open.png', 'improve-overview.webp'];

async function main() {
	await rm(DIST, { recursive: true, force: true });
	await mkdir(path.join(DIST, 'assets'), { recursive: true });
	const urls = new Map();

	// Font: Outfit, variable weight, latin
	urls.set('font:outfit', await emit('outfit', 'woff2', await readFile(require.resolve('@fontsource-variable/outfit/files/outfit-latin-wght-normal.woff2'))));
	const face = `@font-face { font-family: 'Outfit'; font-style: normal; font-display: swap; font-weight: 100 900; src: url(${urls.get('font:outfit')}) format('woff2-variations'); unicode-range: ${LATIN}; }`;

	// Icons, shown through a CSS mask so they take the text colour (or their brand colour in the skills list)
	const iconCss = [];
	const iconFiles = new Set((await readdir(path.join(ROOT, 'assets/icons'))).map((f) => f.replace(/\.svg$/, '')));
	for (const [name, colour] of Object.entries(ICONS)) {
		if (!iconFiles.has(name)) throw new Error(`no icon assets/icons/${name}.svg`);
		const url = await emit(`icon-${name}`, 'svg', await readFile(path.join(ROOT, `assets/icons/${name}.svg`)));
		iconCss.push(`.i-${name} { --i: url(${url});${colour ? ` --c: ${colour};` : ''} }`);
	}

	// Logos: SVGs as they are, bitmaps to WebP at twice their display height
	const logoCss = [];
	for (const l of LOGOS) {
		if (!l.file) continue;
		const file = path.join(ROOT, 'assets/logos', l.file);
		const url = l.file.endsWith('.svg')
			? await emit(`logo-${l.key}`, 'svg', await readFile(file))
			: await emit(`logo-${l.key}`, 'webp', await sharp(file).resize({ height: l.h * 2 }).webp({ quality: 90, alphaQuality: 100 }).toBuffer());
		urls.set(`logos/${l.file}`, url);
		logoCss.push(`.logo-${l.key} { --h: ${l.h}px; }`);
	}

	const langCss = Object.entries(LANGS).map(([lang, colour]) => `.lang-${lang.replace(/[^a-z]/gi, '').toLowerCase()} { --c: ${colour}; }`);

	// Screenshots
	const pics = new Map();
	for (const f of SCREENSHOTS) pics.set(f, await webp(`assets/screenshots/${f}`, f.replace(/\.[a-z]+$/, ''), [720, 1440]));
	const pic = (f) => {
		const p = pics.get(f);
		if (!p) throw new Error(`no screenshot built for ${f}`);
		return p;
	};
	const asset = (key) => {
		const u = urls.get(key);
		if (!u) throw new Error(`no asset built for ${key}`);
		return u;
	};

	// The mark: favicon (SVG and ICO), touch icon and manifest icons
	const rounded = iconSvg(true);
	const square = iconSvg(false);
	await writeFile(path.join(DIST, 'favicon.svg'), rounded);
	await writeFile(path.join(DIST, 'favicon.ico'), ico(await sharp(Buffer.from(rounded), { density: 300 }).resize(32, 32).png().toBuffer(), 32));
	await sharp(Buffer.from(square), { density: 600 }).resize(180, 180).png().toFile(path.join(DIST, 'apple-touch-icon.png'));
	await sharp(Buffer.from(square), { density: 1200 }).resize(512, 512).png().toFile(path.join(DIST, 'icon-512.png'));
	await writeFile(
		path.join(DIST, 'site.webmanifest'),
		`${JSON.stringify({ name: SITE.name, short_name: 'Chris Owen', start_url: '/', display: 'browser', background_color: NAVY, theme_color: NAVY, icons: [{ src: '/icon-512.png', sizes: '512x512', type: 'image/png' }, { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }] }, null, 2)}\n`
	);

	// The share card
	const og = { path: '/og.jpg', width: 1200, height: 630 };
	await sharp(Buffer.from(ogSvg())).jpeg({ quality: 88, mozjpeg: true }).toFile(path.join(DIST, 'og.jpg'));

	// CSS and JS
	const generated = `/* generated by scripts/build.mjs from src/content.mjs */\n${[...iconCss, ...logoCss, ...langCss].join('\n')}`;
	const css = await emit('site', 'css', Buffer.from(`${face}\n${generated}\n${await readFile(path.join(ROOT, 'src/styles.css'), 'utf8')}`));
	const js = await emit('main', 'js', await readFile(path.join(ROOT, 'src/main.js')));

	const scriptHash = createHash('sha256').update(THEME_SCRIPT).digest('base64');
	const csp = [
		"default-src 'self'",
		`script-src 'self' 'sha256-${scriptHash}'`,
		"style-src 'self'",
		"img-src 'self' data:",
		"font-src 'self'",
		"connect-src 'self'",
		"manifest-src 'self'",
		"object-src 'none'",
		"base-uri 'self'",
		"form-action 'none'"
	].join('; ');

	const html = render({ asset, pic, css, js, og, themeScript: THEME_SCRIPT, csp, year: new Date().getUTCFullYear() });
	await writeFile(path.join(DIST, 'index.html'), html);
	await writeFile(path.join(DIST, '404.html'), renderNotFound({ css, csp, themeScript: THEME_SCRIPT }));

	// Small static files
	await writeFile(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`);
	await writeFile(
		path.join(DIST, 'sitemap.xml'),
		`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${SITE.url}/</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod></url>\n</urlset>\n`
	);

	console.log(`built dist/ (${(html.length / 1024).toFixed(0)} KB of HTML, ${pics.size} screenshots, ${iconCss.length} icons, ${logoCss.length} logos)`);
}

await main();
