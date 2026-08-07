// Bluesky — AT Protocol. Auth is a handle plus an app password (Settings →
// App Passwords); no OAuth app registration, no approval, no expiry to manage.
//
// Bluesky does not auto-detect links or hashtags: rich text is explicit via
// `facets`, whose offsets are UTF-8 BYTE positions, not JS string indices.
// Getting that wrong shifts every link on any post containing an accent — and
// this site posts in Spanish, so it would break constantly.

import { env, request } from '../lib/http.mjs';

const PDS = 'https://bsky.social';

export const name = 'bluesky';

export function credentials(requires) {
  return env(requires);
}

const bytes = (s) => new TextEncoder().encode(s).length;

/** Byte range of `needle` inside `text`, or null when absent. */
function byteRange(text, needle) {
  const index = text.indexOf(needle);
  if (index === -1) return null;
  const start = bytes(text.slice(0, index));
  return { byteStart: start, byteEnd: start + bytes(needle) };
}

function buildFacets(text, url, tags) {
  const facets = [];
  const link = byteRange(text, url);
  if (link) {
    facets.push({ index: link, features: [{ $type: 'app.bsky.richtext.facet#link', uri: url }] });
  }
  for (const tag of tags) {
    const range = byteRange(text, tag);
    if (range) {
      facets.push({
        index: range,
        features: [{ $type: 'app.bsky.richtext.facet#tag', tag: tag.replace(/^#/, '') }],
      });
    }
  }
  return facets.sort((a, b) => a.index.byteStart - b.index.byteStart);
}

async function session({ BLUESKY_HANDLE, BLUESKY_APP_PASSWORD }) {
  const { json } = await request('bluesky', `${PDS}/xrpc/com.atproto.server.createSession`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: BLUESKY_HANDLE, password: BLUESKY_APP_PASSWORD }),
  });
  return { did: json.did, jwt: json.accessJwt };
}

export async function publish({ text, url, tags, post }, creds) {
  const { did, jwt } = await session(creds);

  const record = {
    $type: 'app.bsky.feed.post',
    text,
    createdAt: new Date().toISOString(),
    langs: [post.lang],
    facets: buildFacets(text, url, tags),
    embed: {
      $type: 'app.bsky.embed.external',
      external: { uri: url, title: post.title, description: post.excerpt },
    },
  };

  const { json } = await request('bluesky', `${PDS}/xrpc/com.atproto.repo.createRecord`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ repo: did, collection: 'app.bsky.feed.post', record }),
  });

  const rkey = json?.uri?.split('/').pop();
  return {
    id: json?.uri,
    url: rkey ? `https://bsky.app/profile/${creds.BLUESKY_HANDLE}/post/${rkey}` : json?.uri,
  };
}
