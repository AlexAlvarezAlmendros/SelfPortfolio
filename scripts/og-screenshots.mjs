// Generate per-article OG/share images by screenshotting the top of each built
// blog page (1200x630). The same PNGs feed the hover preview in the blog list and
// the og:image / twitter:image meta tags.
//
// Usage:  node scripts/og-screenshots.mjs        (expects ./dist to exist)
//         npm run screenshots                      (builds first, then runs this)
//
// Output: public/og/<lang>/<slug>.png  (committed, served by Vercel)
//         dist/og/<lang>/<slug>.png    (so the current build already has them)

import { createServer } from 'node:http';
import { readFile, readdir, mkdir, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');
const publicOg = join(root, 'public', 'og');
const distOg = join(dist, 'og');

const WIDTH = 1200;
const HEIGHT = 630;
const PORT = 4319;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.json': 'application/json',
};

if (!existsSync(dist)) {
  console.error('✗ dist/ not found. Run `astro build` first (or use `npm run screenshots`).');
  process.exit(1);
}

// --- minimal static server over dist (handles trailing-slash routes) ----------
function resolveFile(urlPath) {
  let p = decodeURIComponent(urlPath.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  let file = join(dist, p);
  if (!extname(file)) {
    // pretty route like /blog/linux -> /blog/linux/index.html
    file = join(file, 'index.html');
  }
  return file;
}

const server = createServer(async (req, res) => {
  try {
    const file = resolveFile(req.url || '/');
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});

// --- enumerate built article pages -------------------------------------------
// es: dist/blog/<slug>/index.html   en: dist/en/blog/<slug>/index.html
async function slugsIn(dir) {
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory() && existsSync(join(dir, e.name, 'index.html')))
    .map((e) => e.name);
}

async function collectTargets() {
  const targets = [];
  for (const slug of await slugsIn(join(dist, 'blog'))) {
    targets.push({ lang: 'es', slug, url: `/blog/${slug}` });
  }
  for (const slug of await slugsIn(join(dist, 'en', 'blog'))) {
    targets.push({ lang: 'en', slug, url: `/en/blog/${slug}` });
  }
  return targets;
}

// --- run ----------------------------------------------------------------------
async function main() {
  const { chromium } = await import('playwright');

  const targets = await collectTargets();
  if (!targets.length) {
    console.error('✗ No blog articles found under dist/. Nothing to capture.');
    process.exit(1);
  }

  await new Promise((resolve) => server.listen(PORT, resolve));
  const base = `http://localhost:${PORT}`;

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 2, // crisp @2x output
  });

  for (const t of targets) {
    const outDir = join(publicOg, t.lang);
    await mkdir(outDir, { recursive: true });
    const out = join(outDir, `${t.slug}.png`);

    await page.goto(`${base}${t.url}`, { waitUntil: 'networkidle' });
    // Let the fit-to-width headings settle (they reveal after fonts load).
    await page.waitForTimeout(700);
    await page.screenshot({
      path: out,
      clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT },
    });

    // Mirror into the current build output so this deploy already has the image.
    const distDir = join(distOg, t.lang);
    await mkdir(distDir, { recursive: true });
    await copyFile(out, join(distDir, `${t.slug}.png`));

    console.log(`  ✓ og/${t.lang}/${t.slug}.png`);
  }

  await browser.close();
  server.close();
  console.log(`✓ Generated ${targets.length} OG images.`);
}

main().catch((err) => {
  console.error(err);
  server.close();
  process.exit(1);
});
