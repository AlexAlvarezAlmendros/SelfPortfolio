// Generate the main share card -> public/og-image.png (1200x630).
// The name is fit-to-width so the longest line (ALMENDROS) never gets cropped.
//
// Usage:  node scripts/og-home.mjs   (also mirrors into dist/ if it exists)

import { mkdir, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const W = 1200;
const H = 630;
const PAD_X = 64;

const html = `<!doctype html><html lang="es"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
  *{margin:0;box-sizing:border-box}
  html,body{width:${W}px;height:${H}px;background:#070706;overflow:hidden}
  .card{position:relative;width:${W}px;height:${H}px;padding:52px ${PAD_X}px;
    display:flex;flex-direction:column;justify-content:space-between;
    background:repeating-linear-gradient(90deg,rgba(242,240,234,.035),rgba(242,240,234,.035) 1px,transparent 1px,transparent calc(100%/6)),#070706;}
  .top{display:flex;justify-content:space-between;align-items:flex-start;font-family:'Space Mono',monospace}
  .badge{background:#ccff00;color:#070706;font-weight:700;font-size:22px;letter-spacing:.06em;padding:9px 16px}
  .meta{color:#8a8a82;font-size:21px;letter-spacing:.05em;padding-top:4px}
  .name{font-family:'Syne',sans-serif;font-weight:800;line-height:.86;letter-spacing:-.03em;white-space:nowrap}
  .name div{font-size:160px}
  .alex{color:#f2f0ea}
  .acid{color:#ccff00}
  .stroke{color:transparent;-webkit-text-stroke:2px #f2f0ea}
  .bot{display:flex;justify-content:space-between;align-items:flex-end;font-family:'Space Mono',monospace}
  .stack{color:#8a8a82;font-size:22px;letter-spacing:.04em}
  .stack b{color:#ccff00;font-weight:700}
  .url{color:#f2f0ea;font-size:30px;font-weight:700;border-bottom:3px solid #ccff00;padding-bottom:4px}
</style></head>
<body>
  <div class="card">
    <div class="top">
      <span class="badge">FULLSTACK DEVELOPER</span>
      <span class="meta">BARCELONA, ES &middot; EST. 2018</span>
    </div>
    <div class="name" id="name">
      <div class="alex">ALEX</div>
      <div class="acid">ALVAREZ</div>
      <div class="stroke">ALMENDROS</div>
    </div>
    <div class="bot">
      <span class="stack">C# &middot; .NET &middot; <b>REACT</b> &middot; BLAZOR &middot; NODEJS &middot; TYPESCRIPT</span>
      <span class="url">alexalvarez.dev</span>
    </div>
  </div>
</body></html>`;

const { chromium } = await import('playwright');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
await page.setContent(html, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
// Fit the name to the available width (longest line drives the size).
await page.evaluate((availW) => {
  const divs = Array.from(document.querySelectorAll('#name div'));
  let fit = Infinity;
  for (const d of divs) {
    const cur = parseFloat(getComputedStyle(d).fontSize);
    fit = Math.min(fit, (availW / d.scrollWidth) * cur);
  }
  for (const d of divs) d.style.fontSize = `${(fit * 0.99).toFixed(1)}px`;
}, W - PAD_X * 2);
await page.waitForTimeout(150);

const out = join(root, 'public', 'og-image.png');
await page.screenshot({ path: out, clip: { x: 0, y: 0, width: W, height: H } });
const dist = join(root, 'dist', 'og-image.png');
if (existsSync(join(root, 'dist'))) await copyFile(out, dist);
await browser.close();
console.log('✓ public/og-image.png regenerado (nombre completo, sin recorte)');
