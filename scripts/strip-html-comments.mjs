// Post-build: strip HTML comments from every page in dist/ so source-level
// section labels (<!-- HERO -->, etc.) never reach the browser. Astro does not
// remove HTML comments on its own. <script> and <style> blocks are protected so
// their contents are never touched.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;

/** @param {string} dir */
async function* htmlFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(full);
    else if (entry.name.endsWith('.html')) yield full;
  }
}

// Pull <script>/<style> blocks out, strip comments from the rest, restore.
const PROTECT = /<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi;
const COMMENT = /<!--[\s\S]*?-->/g;
const TOKEN = /\x00(\d+)\x00/g;

function stripComments(html) {
  const blocks = [];
  const masked = html.replace(PROTECT, (m) => `\x00${blocks.push(m) - 1}\x00`);
  return masked.replace(COMMENT, '').replace(TOKEN, (_, i) => blocks[Number(i)]);
}

let bytesSaved = 0;
let touched = 0;
for await (const file of htmlFiles(DIST)) {
  const before = await readFile(file, 'utf8');
  const after = stripComments(before);
  if (after !== before) {
    await writeFile(file, after);
    bytesSaved += before.length - after.length;
    touched++;
  }
}
console.log(`[strip-html-comments] ${touched} file(s), ${bytesSaved} bytes removed`);
