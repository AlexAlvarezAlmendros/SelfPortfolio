// Reddit — disabled in config.mjs by default, and that default is the advice.
//
// The API will happily submit link posts, but nearly every subreddit treats an
// unattended blog-link drop as spam. Bans are account-wide and effectively
// permanent. Only turn this on once you have specific subreddits where you are
// a real participant and self-promotion is allowed, and list them in
// NETWORKS.reddit.subreddits.
//
// Uses the "script" app type: create one at reddit.com/prefs/apps with your own
// account as the developer, then password-grant against it.

import { env, request } from '../lib/http.mjs';

const UA = 'alexalvarez.dev-autopost/1.0 (by /u/%USER%)';

export const name = 'reddit';

export function credentials(requires) {
  return env(requires);
}

async function token({ REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD }) {
  const basic = Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString('base64');
  const { json } = await request('reddit', 'https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': UA.replace('%USER%', REDDIT_USERNAME),
    },
    body: new URLSearchParams({
      grant_type: 'password',
      username: REDDIT_USERNAME,
      password: REDDIT_PASSWORD,
    }),
  });
  if (!json?.access_token) throw new Error('reddit: password grant returned no access_token');
  return json.access_token;
}

export async function publish({ title, url, cfg }, creds) {
  const subs = cfg.subreddits ?? [];
  if (!subs.length) throw new Error('reddit: enabled but NETWORKS.reddit.subreddits is empty');

  const access = await token(creds);
  const results = [];

  for (const sr of subs) {
    const { json } = await request('reddit', 'https://oauth.reddit.com/api/submit', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': UA.replace('%USER%', creds.REDDIT_USERNAME),
      },
      body: new URLSearchParams({ sr, kind: 'link', title, url, api_type: 'json', resubmit: 'false' }),
    });

    const errors = json?.json?.errors ?? [];
    if (errors.length) throw new Error(`reddit: r/${sr} rejected the post — ${JSON.stringify(errors)}`);
    results.push(json?.json?.data?.url ?? `https://reddit.com/r/${sr}`);

    // Well under the 60 req/min ceiling, and it keeps the account from looking
    // like a burst-poster across multiple subs.
    await new Promise((r) => setTimeout(r, 5000));
  }

  return { id: results.join(' '), url: results[0] };
}
