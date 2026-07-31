// Mastodon — the simplest of the lot. Create an application under
// Preferences → Development on your instance, scope `write:statuses`, and use
// the access token it hands you. Tokens do not expire.

import { env, request } from '../lib/http.mjs';

export const name = 'mastodon';

export function credentials(requires) {
  return env(requires);
}

export async function publish({ text, post }, creds) {
  const instance = creds.MASTODON_INSTANCE.replace(/\/+$/, '');
  const { json } = await request('mastodon', `${instance}/api/v1/statuses`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${creds.MASTODON_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      // Guards against a retried workflow posting the same status twice.
      'Idempotency-Key': `${post.key}-${post.date.toISOString().slice(0, 10)}`,
    },
    body: JSON.stringify({ status: text, visibility: 'public', language: post.lang }),
  });
  return { id: json?.id, url: json?.url };
}
