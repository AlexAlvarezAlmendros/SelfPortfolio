// @ts-check
import { readdirSync, readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const SITE = 'https://www.alexalvarez.dev';

/**
 * Last-modified date per blog URL, read straight from the markdown frontmatter
 * (`updated` when present, otherwise `date`). Astro's sitemap integration has no
 * access to the content collections, so we parse the two fields we need here.
 * Only posts get a lastmod — for the rest, no date beats a wrong one.
 */
function blogLastmod() {
  /** @type {Record<string, string>} */
  const map = {};
  for (const lang of ['es', 'en']) {
    const dir = new URL(`./src/content/blog/${lang}/`, import.meta.url);
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
      const raw = readFileSync(new URL(file, dir), 'utf8');
      const slug = raw.match(/^slug:\s*"?([^"\n]+)"?/m)?.[1]?.trim();
      const date = (raw.match(/^updated:\s*"?([^"\n]+)"?/m) ?? raw.match(/^date:\s*"?([^"\n]+)"?/m))?.[1]?.trim();
      if (!slug || !date) continue;
      const path = lang === 'es' ? `/blog/${slug}` : `/en/blog/${slug}`;
      map[`${SITE}${path}`] = new Date(date).toISOString();
    }
  }
  return map;
}

const lastmod = blogLastmod();

/** Drop the trailing slash on everything but the site root. */
const trim = (/** @type {string} */ url) =>
  url.length > SITE.length + 1 ? url.replace(/\/$/, '') : url;

// https://astro.build/config
export default defineConfig({
  site: SITE,
  trailingSlash: 'ignore',
  markdown: {
    syntaxHighlight: false,
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'es',
        locales: {
          es: 'es-ES',
          en: 'en-US',
        },
      },
      serialize(item) {
        // <link rel="canonical"> is emitted without a trailing slash; the sitemap
        // has to point at the exact same URLs or the two signals disagree.
        const url = trim(item.url);
        const links = item.links?.map((l) => ({ ...l, url: trim(l.url) }));
        return {
          ...item,
          url,
          ...(links ? { links } : {}),
          ...(lastmod[url] ? { lastmod: lastmod[url] } : {}),
        };
      },
    }),
  ],
});
