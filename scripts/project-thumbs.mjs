// Capture the top (hero) of each project's live site as its thumbnail. The same
// 1200x630 PNG feeds the hover preview in the projects list, the main shot on the
// project page, and the og:image meta — consistent with the blog OG images.
//
// We screenshot the start of the live homepage rather than downloading the first
// raw <img>, because real hero assets are unusable as share images (e.g. a 26MB
// animated GIF, or a 3kB placeholder). A screenshot of "el inicio de la web" is
// lightweight, uniform and always representative.
//
// Projects without a live site (e.g. gitchain) are skipped and fall back to a
// CSS pattern in the UI.
//
// Usage:  node scripts/project-thumbs.mjs
// Output: public/og/projects/<slug>.png   (committed, served by Vercel)

import { mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outDir = join(root, 'public', 'og', 'projects');

const WIDTH = 1200;
const HEIGHT = 630;

// slug -> live homepage. Edit here when domains change. Projects without a live
// site are intentionally omitted and fall back to a pattern.
const SITES = [
  { slug: 'otp', url: 'https://otherpeople.es' },
  { slug: 'inmocapt', url: 'https://inmocapt.com' },
  { slug: 'gogestia', url: 'https://gogestia.com' },
  { slug: 'trimar', url: 'https://finquestrimar.com' },
];

// Close cookie banners, newsletter popups and modal dialogs so the screenshot
// shows the actual hero. Runs in the page context.
function dismissOverlays() {
  const RX = /cookie|consent|gdpr|rgpd|newsletter|subscrib|suscrib|popup|modal|overlay|backdrop|dialog/i;
  // Word-boundary anchored so "ok" doesn't match "co​okies" etc.
  const ACCEPT =
    /\b(aceptar todas|aceptar|acepto|accept all|accept|entendido|de acuerdo|cerrar|close|got it|ok)\b/i;

  // 1) Click obvious accept/close controls. Buttons only — never <a>, which would
  // navigate away from the homepage.
  const clickables = Array.from(
    document.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"]'),
  );
  for (const el of clickables) {
    const txt = ((el.textContent || '') + ' ' + (el.getAttribute('aria-label') || '')).trim();
    if (txt.length < 40 && ACCEPT.test(txt)) {
      try {
        el.click();
      } catch {
        /* ignore */
      }
    }
  }

  // 2) Hide leftover fixed/sticky overlays that match cookie/modal patterns.
  for (const el of Array.from(document.querySelectorAll('*'))) {
    const cs = getComputedStyle(el);
    if (cs.position !== 'fixed' && cs.position !== 'sticky') continue;
    const id = `${el.id} ${el.className}`;
    const role = el.getAttribute('role') || '';
    const z = parseInt(cs.zIndex, 10) || 0;
    if (RX.test(id) || role === 'dialog' || (z >= 1000 && el.getBoundingClientRect().height > 120)) {
      // Don't nuke the site's top navigation bar.
      const r = el.getBoundingClientRect();
      const coversTopNav = r.top <= 4 && r.height < 120;
      if (!coversTopNav) el.style.setProperty('display', 'none', 'important');
    }
  }
  // Re-enable scroll if a modal locked it.
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
}

async function main() {
  const { chromium } = await import('playwright');
  await mkdir(outDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 2, // crisp @2x output
  });
  const summary = [];

  for (const site of SITES) {
    try {
      await page.goto(site.url, { waitUntil: 'networkidle', timeout: 45000 });
      // Give hero animations/lazy images a moment to settle, then freeze GIFs by
      // screenshotting a single frame.
      await page.waitForTimeout(1200);
      await page.keyboard.press('Escape').catch(() => {});
      await page.evaluate(dismissOverlays).catch(() => {});
      await page.waitForTimeout(500);
      // Safety net: if a click navigated away, return to the homepage and only
      // hide overlays (no clicks) before shooting.
      if (new URL(page.url()).pathname.replace(/\/$/, '') !== '') {
        await page.goto(site.url, { waitUntil: 'networkidle', timeout: 45000 });
        await page.waitForTimeout(1000);
        await page.keyboard.press('Escape').catch(() => {});
        await page.evaluate(dismissOverlays).catch(() => {});
        await page.waitForTimeout(400);
      }
      const out = join(outDir, `${site.slug}.png`);
      await page.screenshot({
        path: out,
        clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT },
      });
      summary.push(`  ✓ og/projects/${site.slug}.png`);
    } catch (err) {
      summary.push(`  ✗ ${site.slug}: ${err.message}`);
    }
  }

  await browser.close();
  console.log('Project thumbnails:');
  console.log(summary.join('\n'));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
