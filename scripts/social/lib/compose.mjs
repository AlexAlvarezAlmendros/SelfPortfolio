// Turns a blog post into per-network copy.
//
// The default copy is intentionally plain — title, excerpt, link, a couple of
// hashtags — because auto-generated hype reads like a bot. When a post deserves
// better, write it by hand in the post's own frontmatter:
//
//   social:
//     linkedin: |
//       Long-form copy for LinkedIn.
//     x: "Short punchy version"
//
// A `social:` entry replaces the generated body wholesale; the link and
// hashtags are still appended per that network's rules.

import { BASE_HASHTAGS, TAG_HASHTAGS, postUrl } from '../config.mjs';

/** Strip markdown down to plain prose suitable for a social timeline. */
export function toPlainText(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, '')          // fenced code
    .replace(/^\s*>\s?/gm, '')                // blockquote markers
    .replace(/^#{1,6}\s+.*$/gm, '')           // headings
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')     // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')  // links -> label
    .replace(/`([^`]+)`/g, '$1')              // inline code
    .replace(/\*\*([^*]+)\*\*/g, '$1')        // bold
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '$1') // italic
    .replace(/\r/g, '')
    .trim();
}

/** First N non-empty paragraphs of the body as plain text. */
export function leadParagraphs(markdown, count = 2) {
  return toPlainText(markdown)
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .slice(0, count);
}

export function hashtags(tag) {
  const specific = TAG_HASHTAGS[tag?.toUpperCase()] ?? [];
  return [...new Set([...specific, ...BASE_HASHTAGS])].map((h) => `#${h}`);
}

/** Cut to `max` characters on a word boundary, adding an ellipsis if cut. */
export function truncate(text, max) {
  if (text.length <= max) return text;
  const slice = text.slice(0, max - 1);
  const cut = slice.lastIndexOf(' ');
  return `${(cut > max * 0.6 ? slice.slice(0, cut) : slice).trimEnd()}…`;
}

/**
 * Build the text for one post on one network.
 * @returns {{ text: string, url: string, tags: string[] }}
 */
export function compose(post, network, cfg) {
  const url = postUrl(post.lang, post.slug);
  const tags = hashtags(post.tag);
  const override = post.social?.[network];

  // Two networks attach the link out of band rather than in the body text:
  // LinkedIn as an ARTICLE card (or the first comment), Threads as a
  // link_attachment. On Threads a URL left in the body would become the preview
  // on its own and render twice. Everywhere else the link is appended below,
  // and costs characters.
  const bodyCarriesLink = network !== 'linkedin' && network !== 'threads';
  const linkCost = bodyCarriesLink ? (cfg.urlWeight ?? url.length) + 2 : 0;
  const tagLine = tags.join(' ');
  const tagCost = tagLine.length + 2;
  const budget = cfg.limit - linkCost - tagCost;

  let body;
  if (typeof override === 'string' && override.trim()) {
    body = override.trim();
  } else if (network === 'linkedin') {
    // LinkedIn rewards length: title, the hook, then the opening paragraphs.
    const lead = leadParagraphs(post.body, 3).join('\n\n');
    body = `${post.title}\n\n${post.excerpt}\n\n${lead}`;
  } else if (network === 'threads' || network === 'mastodon') {
    body = `${post.title}\n\n${post.excerpt}`;
  } else {
    // X / Bluesky: one line of title, one of excerpt, hard-trimmed.
    const room = budget - post.title.length - 2;
    body = room > 60 ? `${post.title}\n\n${truncate(post.excerpt, room)}` : truncate(post.title, budget);
  }

  body = truncate(body.trim(), Math.max(budget, 40));

  const parts = [body];
  if (bodyCarriesLink) parts.push(url);
  if (tagLine) parts.push(tagLine);

  return { text: parts.join('\n\n'), url, tags };
}

/** Title for link-submission sites, which take a title + URL rather than prose. */
export function submissionTitle(post, limit) {
  return truncate(post.title, limit);
}
