// Interactive credential helper. Run it on your machine, not in CI.
//
//   node --env-file=.env.local scripts/social/auth.mjs linkedin
//   node --env-file=.env.local scripts/social/auth.mjs threads --token=<short-lived>
//   node --env-file=.env.local scripts/social/auth.mjs threads --refresh
//
// LinkedIn needs a real 3-legged OAuth round trip, so this spins up a throwaway
// localhost listener, sends you to the consent screen and catches the redirect.
// Threads is simpler: grab a short-lived token from the App Dashboard's User
// Token Generator and this exchanges it for the 60-day one.
//
// Client secrets are read from the environment (put them in .env.local) so they
// never end up in your shell history.

import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';

const PORT = 3000;
const REDIRECT = `http://localhost:${PORT}/callback`;

function arg(name) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
}
const has = (name) => process.argv.includes(`--${name}`);

function need(varName) {
  const v = process.env[varName];
  if (!v) {
    console.error(`\nMissing ${varName}. Add it to .env.local and re-run with:`);
    console.error(`  node --env-file=.env.local scripts/social/auth.mjs ${process.argv[2]}\n`);
    process.exit(1);
  }
  return v;
}

/** Best-effort browser launch; the URL is always printed as a fallback. */
function openBrowser(url) {
  const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  try {
    spawn(cmd, [url], { stdio: 'ignore', detached: true }).unref();
  } catch {
    /* printed below anyway */
  }
}

/**
 * Serve one request on localhost and resolve with its query params.
 * Times out so a closed tab or an abandoned consent screen doesn't hang forever.
 */
function awaitRedirect(expectedState) {
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      const url = new URL(req.url, `http://localhost:${PORT}`);
      if (url.pathname !== '/callback') {
        res.writeHead(404).end();
        return;
      }
      const params = Object.fromEntries(url.searchParams);
      const ok = params.code && params.state === expectedState;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(
        `<body style="font:16px system-ui;padding:3rem;max-width:34rem">
           <h1>${ok ? '✅ Listo' : '❌ Algo ha fallado'}</h1>
           <p>${ok ? 'Ya puedes cerrar esta pestaña y volver a la terminal.' : JSON.stringify(params)}</p>
         </body>`,
      );
      server.close();
      clearTimeout(timer);
      if (params.error) return reject(new Error(`${params.error}: ${params.error_description ?? ''}`));
      if (params.state !== expectedState) return reject(new Error('state mismatch — aborting'));
      resolve(params);
    });

    const timer = setTimeout(() => {
      server.close();
      reject(new Error('timed out after 5 minutes waiting for the redirect'));
    }, 300_000);

    server.listen(PORT, () => {});
    server.on('error', reject);
  });
}

async function linkedin() {
  const clientId = need('LINKEDIN_CLIENT_ID');
  const clientSecret = need('LINKEDIN_CLIENT_SECRET');
  const state = randomBytes(16).toString('hex');

  const authorize = `https://www.linkedin.com/oauth/v2/authorization?${new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: REDIRECT,
    state,
    scope: 'openid profile w_member_social',
  })}`;

  console.log('\nOpening the LinkedIn consent screen. If nothing happens, paste this:\n');
  console.log(`  ${authorize}\n`);
  console.log(`Make sure ${REDIRECT} is listed as an authorized redirect URL in the app.\n`);
  openBrowser(authorize);

  const { code } = await awaitRedirect(state);

  const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`token exchange failed: ${JSON.stringify(json)}`);

  const days = Math.round((json.expires_in ?? 0) / 86400);
  const issued = new Date().toISOString().slice(0, 10);

  console.log(`\n✅ Token obtained. Valid ~${days} days.\n`);
  console.log('Add to .env.local:\n');
  console.log(`LINKEDIN_ACCESS_TOKEN=${json.access_token}`);
  console.log(`LINKEDIN_TOKEN_ISSUED=${issued}\n`);
  console.log('And for CI:\n');
  console.log('  gh secret set LINKEDIN_ACCESS_TOKEN');
  console.log(`  gh variable set LINKEDIN_TOKEN_ISSUED --body ${issued}\n`);
}

async function threads() {
  const secret = need('THREADS_APP_SECRET');

  if (has('refresh')) {
    const current = arg('token') ?? need('THREADS_ACCESS_TOKEN');
    const url = `https://graph.threads.net/refresh_access_token?grant_type=th_refresh_token&access_token=${current}`;
    const res = await fetch(url);
    const json = await res.json();
    if (!res.ok) throw new Error(`refresh failed: ${JSON.stringify(json)}`);
    console.log(`\n✅ Refreshed. Valid ~${Math.round(json.expires_in / 86400)} days.\n`);
    console.log(`THREADS_ACCESS_TOKEN=${json.access_token}\n`);
    return;
  }

  const short = arg('token');
  if (!short) {
    console.error('\nGet a short-lived token first:');
    console.error('  developers.facebook.com -> your app -> Use cases -> "Access the Threads API"');
    console.error('  -> Customize -> scroll to "User Token Generator" -> Generate token');
    console.error('\nThen run:');
    console.error('  node --env-file=.env.local scripts/social/auth.mjs threads --token=<short-lived>\n');
    process.exit(1);
  }

  const url = `https://graph.threads.net/access_token?${new URLSearchParams({
    grant_type: 'th_exchange_token',
    client_secret: secret,
    access_token: short,
  })}`;
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) throw new Error(`exchange failed: ${JSON.stringify(json)}`);

  console.log(`\n✅ Long-lived token obtained. Valid ~${Math.round(json.expires_in / 86400)} days.\n`);
  console.log('Add to .env.local:\n');
  console.log(`THREADS_ACCESS_TOKEN=${json.access_token}\n`);
  console.log('And for CI:\n  gh secret set THREADS_ACCESS_TOKEN\n');
  console.log('Renew any time before it expires with:');
  console.log('  node --env-file=.env.local scripts/social/auth.mjs threads --refresh\n');
}

const target = process.argv[2];
const RUNNERS = { linkedin, threads };
if (!RUNNERS[target]) {
  console.error('Usage: auth.mjs <linkedin|threads> [--token=...] [--refresh]');
  process.exit(1);
}

try {
  await RUNNERS[target]();
} catch (err) {
  // A stack trace here is noise — every failure at this point is either a
  // misconfigured app or an expired code, and the API's own message says which.
  console.error(`\n❌ ${err.message}\n`);
  process.exit(1);
}
