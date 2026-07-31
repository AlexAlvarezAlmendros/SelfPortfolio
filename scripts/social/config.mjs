// Which networks get which language, and how each one is enabled.
//
// A network only runs when BOTH are true:
//   1. `enabled` is not false here, and
//   2. every env var in `requires` is present.
// Missing credentials are skipped silently — that is how you roll networks out
// one at a time without touching this file again.

export const SITE = 'https://www.alexalvarez.dev';

/** Canonical public URL for a post. */
export function postUrl(lang, slug) {
  return lang === 'en' ? `${SITE}/en/blog/${slug}/` : `${SITE}/blog/${slug}/`;
}

/** Frontmatter `tag` -> extra hashtags appended to the composed copy. */
export const TAG_HASHTAGS = {
  INDIE: ['indiedev', 'buildinpublic'],
  IA: ['IA', 'AI'],
  DEVLOG: ['devlog', 'buildinpublic'],
  LINUX: ['linux', 'selfhosted'],
  HOMELAB: ['homelab', 'selfhosted'],
  WEB: ['webdev'],
};

/** Hashtags added to every post, after the tag-specific ones. */
export const BASE_HASHTAGS = ['dev'];

export const NETWORKS = {
  // Pay-per-use since Feb 2026: ~$0.20 per post containing a link.
  x: {
    enabled: true,
    langs: ['es', 'en'],
    limit: 280,
    // t.co rewrites every link to a fixed width regardless of real length.
    urlWeight: 23,
    requires: ['X_API_KEY', 'X_API_SECRET', 'X_ACCESS_TOKEN', 'X_ACCESS_SECRET'],
  },

  // Personal profile via the self-serve "Share on LinkedIn" product.
  // The feed demotes posts with outbound links, so the link goes in the first
  // comment instead — see providers/linkedin.mjs.
  linkedin: {
    enabled: true,
    langs: ['es'],
    limit: 2800,
    linkInComment: true,
    requires: ['LINKEDIN_ACCESS_TOKEN'],
  },

  threads: {
    enabled: true,
    langs: ['es'],
    limit: 500,
    requires: ['THREADS_ACCESS_TOKEN'],
  },

  bluesky: {
    enabled: true,
    langs: ['es', 'en'],
    limit: 300,
    requires: ['BLUESKY_HANDLE', 'BLUESKY_APP_PASSWORD'],
  },

  mastodon: {
    enabled: true,
    langs: ['en'],
    limit: 500,
    requires: ['MASTODON_INSTANCE', 'MASTODON_ACCESS_TOKEN'],
  },

  // Off by default and it should stay that way until you have per-subreddit
  // targets. Blind link-drops are the fastest route to a sitewide ban.
  reddit: {
    enabled: false,
    langs: ['en'],
    limit: 300,
    subreddits: [],
    requires: ['REDDIT_CLIENT_ID', 'REDDIT_CLIENT_SECRET', 'REDDIT_USERNAME', 'REDDIT_PASSWORD'],
  },
};

/** Networks with no write API — we emit a prefilled submit link instead. */
export const MANUAL_TARGETS = {
  hackernews: { langs: ['en'], titleLimit: 80 },
  reddit: { langs: ['en'], titleLimit: 300 },
};
