// LinkedIn — personal profile posts via the self-serve "Share on LinkedIn"
// product (scope w_member_social).
//
// Two things worth knowing:
//  1. The member access token lives 60 days. There is no unattended refresh on
//     the consumer tier, so re-auth is a calendar chore — the workflow warns
//     when the token is close to expiry (LINKEDIN_TOKEN_ISSUED).
//  2. The feed demotes posts carrying an outbound link. With linkInComment on,
//     the post body ships clean and the URL lands in the first comment.

import { env, request } from '../lib/http.mjs';

const API = 'https://api.linkedin.com';
const VERSION = '202506';

export const name = 'linkedin';

export function credentials(requires) {
  return env(requires);
}

function headers(token) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'LinkedIn-Version': VERSION,
    'X-Restli-Protocol-Version': '2.0.0',
  };
}

/** The member URN is derived at runtime so only the token has to be a secret. */
async function personUrn(token) {
  const { json } = await request('linkedin', `${API}/v2/userinfo`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!json?.sub) throw new Error('linkedin: /v2/userinfo returned no `sub` claim');
  return `urn:li:person:${json.sub}`;
}

export async function publish({ text, url, cfg }, creds) {
  const token = creds.LINKEDIN_ACCESS_TOKEN;
  const author = await personUrn(token);

  const body = {
    author,
    commentary: text,
    visibility: 'PUBLIC',
    distribution: {
      feedDistribution: 'MAIN_FEED',
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false,
  };

  const res = await request('linkedin', `${API}/rest/posts`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(body),
  });

  const urn = res.headers.get('x-restli-id') ?? res.json?.id;
  if (!urn) throw new Error('linkedin: post created but no URN was returned');

  if (cfg.linkInComment) {
    // A failed comment must not mask a successful post — the post is the thing
    // that costs reach if we retry it.
    try {
      await request('linkedin', `${API}/v2/socialActions/${encodeURIComponent(urn)}/comments`, {
        method: 'POST',
        headers: headers(token),
        body: JSON.stringify({ actor: author, object: urn, message: { text: url } }),
      });
    } catch (err) {
      console.warn(`  ! linkedin: post published but the link comment failed — ${err.message}`);
    }
  }

  return { id: urn, url: `https://www.linkedin.com/feed/update/${urn}/` };
}

/** Days until the configured token expires, or null when unknown. */
export function tokenAge() {
  const issued = process.env.LINKEDIN_TOKEN_ISSUED;
  if (!issued) return null;
  const days = (Date.now() - new Date(issued).valueOf()) / 86_400_000;
  return Number.isFinite(days) ? Math.round(60 - days) : null;
}
