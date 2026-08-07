// Networks that cannot — or should not — be posted to unattended.
//
// Hacker News has no write API at all; the only programmatic route is driving
// the submit form with a logged-in session, which is against the site's terms
// and gets flagged fast. Reddit has an API but not a social licence for it.
//
// So instead of publishing, we emit one-click prefilled submit URLs. The
// workflow drops them into the run summary and, optionally, a GitHub issue.
// Clicking is a two-second job; the automation still did everything else.

import { MANUAL_TARGETS } from '../config.mjs';
import { submissionTitle } from '../lib/compose.mjs';

/** @returns {{ target: string, label: string, submitUrl: string }[]} */
export function manualLinks(post, url) {
  const links = [];

  for (const [target, cfg] of Object.entries(MANUAL_TARGETS)) {
    if (!cfg.langs.includes(post.lang)) continue;
    const title = submissionTitle(post, cfg.titleLimit);

    if (target === 'hackernews') {
      links.push({
        target,
        label: 'Hacker News — Show/Submit',
        submitUrl: `https://news.ycombinator.com/submitlink?u=${encodeURIComponent(url)}&t=${encodeURIComponent(title)}`,
      });
    }

    if (target === 'reddit') {
      links.push({
        target,
        label: 'Reddit — choose a subreddit',
        submitUrl: `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
      });
    }
  }

  return links;
}
