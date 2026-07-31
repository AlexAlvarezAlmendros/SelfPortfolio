// Threads — Meta's Graph API at graph.threads.net.
//
// Publishing is a two-step container model: create a media container, then
// publish it by id. `link_attachment` renders a real link card, which performs
// far better than a bare URL sitting in the text.
//
// Tokens are long-lived (60 days) and CAN be refreshed unattended once they are
// at least 24h old — `refresh()` below does that; the workflow calls it on a
// schedule so the credential never silently dies.

import { env, request } from '../lib/http.mjs';

const API = 'https://graph.threads.net/v1.0';

export const name = 'threads';

export function credentials(requires) {
  return env(requires);
}

async function userId(token) {
  const { json } = await request('threads', `${API}/me?fields=id&access_token=${token}`);
  if (!json?.id) throw new Error('threads: /me returned no id');
  return json.id;
}

export async function publish({ text, url }, creds) {
  const token = creds.THREADS_ACCESS_TOKEN;
  const id = await userId(token);

  const params = new URLSearchParams({
    media_type: 'TEXT',
    text,
    link_attachment: url,
    access_token: token,
  });
  const container = await request('threads', `${API}/${id}/threads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });
  const creationId = container.json?.id;
  if (!creationId) throw new Error('threads: container creation returned no id');

  const published = await request('threads', `${API}/${id}/threads_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ creation_id: creationId, access_token: token }),
  });

  const postId = published.json?.id;
  return { id: postId, url: postId ? `https://www.threads.net/@me/post/${postId}` : API };
}

/** Exchange the current long-lived token for a fresh 60-day one. */
export async function refresh(token) {
  const { json } = await request(
    'threads',
    `${API}/refresh_access_token?grant_type=th_refresh_token&access_token=${token}`,
  );
  return { token: json?.access_token, expiresIn: json?.expires_in };
}
