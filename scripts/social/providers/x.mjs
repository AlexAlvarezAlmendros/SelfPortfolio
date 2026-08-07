// X (Twitter) — POST /2/tweets with OAuth 1.0a user-context signing.
//
// OAuth 1.0a rather than OAuth 2.0 PKCE on purpose: the access token/secret
// pair never expires, so CI needs no refresh dance. The four credentials come
// straight from the app's "Keys and tokens" tab.
//
// Billing note: as of Feb 2026 X is pay-per-use and a post containing a link
// costs ~$0.20. This provider posts once per language, so a bilingual entry is
// roughly $0.40.

import { createHmac, randomBytes } from 'node:crypto';
import { env, request } from '../lib/http.mjs';

const ENDPOINT = 'https://api.x.com/2/tweets';

/** RFC 3986 percent-encoding — stricter than encodeURIComponent. */
const enc = (s) =>
  encodeURIComponent(s).replace(/[!*'()]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);

function authHeader({ X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET }, method, url) {
  const params = {
    oauth_consumer_key: X_API_KEY,
    oauth_nonce: randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: X_ACCESS_TOKEN,
    oauth_version: '1.0',
  };
  // A JSON request body is never part of the OAuth 1.0a signature base string.
  const normalized = Object.keys(params)
    .sort()
    .map((k) => `${enc(k)}=${enc(params[k])}`)
    .join('&');
  const base = [method.toUpperCase(), enc(url), enc(normalized)].join('&');
  const key = `${enc(X_API_SECRET)}&${enc(X_ACCESS_SECRET)}`;
  params.oauth_signature = createHmac('sha1', key).update(base).digest('base64');

  return `OAuth ${Object.keys(params)
    .sort()
    .map((k) => `${enc(k)}="${enc(params[k])}"`)
    .join(', ')}`;
}

export const name = 'x';

export function credentials(requires) {
  return env(requires);
}

/** @returns {Promise<{ id: string, url: string }>} */
export async function publish({ text }, creds) {
  const { json } = await request('x', ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: authHeader(creds, 'POST', ENDPOINT),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });
  const id = json?.data?.id;
  return { id, url: id ? `https://x.com/i/status/${id}` : ENDPOINT };
}
