// Shared fetch wrapper. Every provider funnels through this so a failure names
// the network and shows the API's own error body — debugging a social API from
// a bare "401 Unauthorized" in CI logs is miserable.

export class ApiError extends Error {
  constructor(network, res, body) {
    super(`${network}: ${res.status} ${res.statusText} — ${body.slice(0, 600)}`);
    this.name = 'ApiError';
    this.network = network;
    this.status = res.status;
  }
}

/**
 * @param {string} network Label used in error messages.
 * @param {string} url
 * @param {RequestInit} init
 * @returns {Promise<{ json: any, text: string, headers: Headers }>}
 */
export async function request(network, url, init = {}) {
  const res = await fetch(url, init);
  const text = await res.text();
  if (!res.ok) throw new ApiError(network, res, text);
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // Some endpoints (LinkedIn create) answer 201 with an empty body.
  }
  return { json, text, headers: res.headers };
}

/** Read env vars, returning null when any is missing. */
export function env(names) {
  const out = {};
  for (const name of names) {
    const value = process.env[name];
    if (!value) return null;
    out[name] = value;
  }
  return out;
}
