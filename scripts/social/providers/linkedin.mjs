// LinkedIn — personal profile posts via the self-serve "Share on LinkedIn"
// product (scope w_member_social).
//
// There are two posting APIs and picking the wrong one is a 403:
//   /v2/ugcPosts  — what the consumer "Share on LinkedIn" docs specify. No
//                   version header. This is our primary.
//   /rest/posts   — the versioned Marketing API, which normally needs the
//                   Marketing Developer Platform approval. Used only as a
//                   fallback in case LinkedIn has migrated the app.
//
// The member access token lives 60 days and the consumer tier has no
// unattended refresh, so re-auth is a calendar chore — publish.mjs warns when
// LINKEDIN_TOKEN_ISSUED says expiry is close. Regenerate with:
//   node --env-file=.env.local scripts/social/auth.mjs linkedin
//
// Rate limit: 150 requests/day per member. We use 2-3 per post.

import { ApiError, env, request } from '../lib/http.mjs';

const API = 'https://api.linkedin.com';

// Versions are supported for a minimum of one year from release, then sunset
// with a hard error. Bump this before July 2027.
const VERSION = '202607';

export const name = 'linkedin';

export function credentials(requires) {
  return env(requires);
}

/** The member URN is derived at runtime so only the token has to be a secret. */
async function personUrn(token) {
  const { json } = await request('linkedin', `${API}/v2/userinfo`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!json?.sub) throw new Error('linkedin: /v2/userinfo returned no `sub` claim');
  return `urn:li:person:${json.sub}`;
}

/**
 * Consumer UGC Posts payload. `withCard` attaches the post URL as an ARTICLE
 * so LinkedIn renders a real link preview.
 */
function ugcBody(author, text, { url, title, description, withCard }) {
  const content = {
    shareCommentary: { text },
    shareMediaCategory: withCard ? 'ARTICLE' : 'NONE',
  };
  if (withCard) {
    content.media = [
      { status: 'READY', originalUrl: url, title: { text: title }, description: { text: description } },
    ];
  }
  return {
    author,
    lifecycleState: 'PUBLISHED',
    specificContent: { 'com.linkedin.ugc.ShareContent': content },
    visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
  };
}

/** @returns {Promise<string>} the created post's URN */
async function createUgcPost(token, body) {
  const res = await request('linkedin', `${API}/v2/ugcPosts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(body),
  });
  const urn = res.headers.get('x-restli-id') ?? res.json?.id;
  if (!urn) throw new Error('linkedin: ugcPosts returned no X-RestLi-Id');
  return urn;
}

/** Versioned Posts API — only reached if ugcPosts is refused for this app. */
async function createVersionedPost(token, author, text) {
  const res = await request('linkedin', `${API}/rest/posts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'LinkedIn-Version': VERSION,
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
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
    }),
  });
  const urn = res.headers.get('x-restli-id') ?? res.json?.id;
  if (!urn) throw new Error('linkedin: /rest/posts returned no URN');
  return urn;
}

export async function publish({ text, url, post, cfg }, creds) {
  const token = creds.LINKEDIN_ACCESS_TOKEN;
  const author = await personUrn(token);

  // With linkInComment the body carries no URL, so the link only exists if the
  // follow-up comment succeeds — and commenting may need w_member_social_feed,
  // which the self-serve product does not grant. Attaching a card is therefore
  // the default: a post that always has its link beats a post that might not.
  const withCard = !cfg.linkInComment;
  const body = ugcBody(author, text, {
    url,
    title: post.title,
    description: post.excerpt,
    withCard,
  });

  let urn;
  try {
    urn = await createUgcPost(token, body);
  } catch (err) {
    // 403 unauthorized for this app, 426 upgrade-required on a retired API.
    if (err instanceof ApiError && (err.status === 403 || err.status === 426)) {
      console.warn(`  ! linkedin: /v2/ugcPosts refused (${err.status}), retrying /rest/posts`);
      urn = await createVersionedPost(token, author, text);
    } else {
      throw err;
    }
  }

  if (cfg.linkInComment) {
    // Never let a failed comment mask a successful post — re-running would
    // publish the post twice.
    try {
      await request('linkedin', `${API}/rest/socialActions/${encodeURIComponent(urn)}/comments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'LinkedIn-Version': VERSION,
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify({ actor: author, object: urn, message: { text: url } }),
      });
    } catch (err) {
      console.warn(
        `  ! linkedin: post published but the link comment failed — ${err.message}\n` +
          '    The post has no link. Consider setting linkInComment: false in config.mjs.',
      );
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
