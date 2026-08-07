// Post discovery and the published-ledger.
//
// The ledger is the single source of truth for "has this already gone out?".
// We deliberately do NOT derive that from the git diff: a rerun of a failed
// workflow, a rebase, or a squash-merge would all re-publish. The ledger is
// committed back to the repo by the workflow after a successful run.

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseFrontmatter } from './frontmatter.mjs';

const BLOG_DIR = new URL('../../../src/content/blog/', import.meta.url).pathname;
const LEDGER = new URL('../published.json', import.meta.url).pathname;

/**
 * @typedef {object} Post
 * @property {string} key      `${lang}/${slug}` — ledger key.
 * @property {string} lang
 * @property {string} slug
 * @property {string} title
 * @property {string} excerpt
 * @property {string} tag
 * @property {Date}   date
 * @property {string} body     Markdown body, frontmatter stripped.
 * @property {Record<string,string>} social Per-network copy overrides.
 */

/** Read every blog entry off disk. */
export async function readPosts() {
  /** @type {Post[]} */
  const posts = [];
  for (const lang of await readdir(BLOG_DIR)) {
    const dir = join(BLOG_DIR, lang);
    for (const file of await readdir(dir)) {
      if (!file.endsWith('.md')) continue;
      const { data, body } = parseFrontmatter(await readFile(join(dir, file), 'utf8'));
      if (!data.slug || !data.lang) {
        throw new Error(`${lang}/${file}: frontmatter is missing slug or lang`);
      }
      posts.push({
        key: `${data.lang}/${data.slug}`,
        lang: String(data.lang),
        slug: String(data.slug),
        title: String(data.title ?? ''),
        excerpt: String(data.excerpt ?? ''),
        tag: String(data.tag ?? ''),
        date: new Date(data.date),
        body,
        social: data.social && typeof data.social === 'object' ? data.social : {},
      });
    }
  }
  return posts.sort((a, b) => b.date - a.date);
}

/** @returns {Promise<Record<string, Record<string, string>>>} */
export async function readLedger() {
  try {
    return JSON.parse(await readFile(LEDGER, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return {};
    throw err;
  }
}

export async function writeLedger(ledger) {
  const sorted = Object.fromEntries(Object.entries(ledger).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(LEDGER, `${JSON.stringify(sorted, null, 2)}\n`);
}

/**
 * Posts that still owe a publish on `network`.
 * `maxAgeDays` stops a first run — or a newly-added network — from dumping the
 * entire back catalogue onto a timeline at once.
 */
export function pending(posts, ledger, network, langs, maxAgeDays) {
  const cutoff = Number.isFinite(maxAgeDays) ? Date.now() - maxAgeDays * 86_400_000 : -Infinity;
  return posts.filter(
    (p) =>
      langs.includes(p.lang) &&
      !ledger[p.key]?.[network] &&
      p.date.valueOf() >= cutoff,
  );
}

export function recordPublish(ledger, key, network, result) {
  ledger[key] ??= {};
  ledger[key][network] = result;
  return ledger;
}
