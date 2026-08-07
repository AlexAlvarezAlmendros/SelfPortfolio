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
      // Keep listening unless this is a genuine OAuth callback. A health check,
      // a favicon fetch or a browser prefetch arrives bare, and treating that
      // as a state mismatch would kill the flow before the user even consents.
      if (!params.code && !params.error) {
        res.writeHead(204).end();
        return;
      }
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

    // Generous: the consent screen can involve a login and 2FA, and you may
    // not be sitting at the machine when the flow starts.
    const timer = setTimeout(() => {
      server.close();
      reject(new Error('timed out after 15 minutes waiting for the redirect'));
    }, 900_000);

    server.listen(PORT, () => {});
    server.on('error', reject);
  });
}

function authorizeUrl(clientId, state) {
  return `https://www.linkedin.com/oauth/v2/authorization?${new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: REDIRECT,
    state,
    scope: 'openid profile w_member_social',
  })}`;
}

/**
 * Ask LinkedIn to render the consent screen and read what comes back.
 * Misconfigured apps answer 200 with an error sentence in the HTML rather than
 * an OAuth error code, so this is the cheapest way to catch a wrong redirect
 * URI or a missing product before burning a browser round trip.
 */
async function linkedinCheck() {
  const clientId = need('LINKEDIN_CLIENT_ID');
  const res = await fetch(authorizeUrl(clientId, 'preflight'));
  const html = await res.text();

  // The heading and the actual reason live in separate elements, so the reason
  // has to be pulled out on its own — matching straight after the heading text
  // silently finds nothing and reports a false pass.
  if (/Bummer, something went wrong/i.test(html)) {
    const tagged = html.match(/error__message-text[^>]*>\s*([^<]+)/i);
    const plain = html
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ');
    const after = plain.match(/went wrong\.\s*(.+?)\s*(?:©|$)/i);
    const reason = (tagged?.[1] ?? after?.[1] ?? 'no reason given').trim();

    console.error(`\n❌ LinkedIn rejected the request: ${reason}\n`);
    if (/redirect_uri/i.test(reason)) {
      console.error("Add exactly this to the app's Auth tab -> Authorized redirect URLs:");
      console.error(`  ${REDIRECT}\n`);
    }
    if (/scope|permission|unauthorized/i.test(reason)) {
      console.error('Add the "Share on LinkedIn" product on the app\'s Products tab.\n');
    }
    process.exit(1);
  }

  console.log('\n✅ The consent screen renders. Client id and redirect URI are accepted.');
  console.log('   (A missing "Share on LinkedIn" product only surfaces once you sign in.)\n');
}

async function linkedin() {
  if (has('check')) return linkedinCheck();

  const clientId = need('LINKEDIN_CLIENT_ID');
  const clientSecret = need('LINKEDIN_CLIENT_SECRET');

  // --code= covers the case where the browser could not reach this machine's
  // localhost (consented on a phone, remote session, listener already gone).
  // Paste the `code` query param off the redirect URL; it is valid 30 minutes
  // and single use.
  let code = arg('code');
  if (!code) {
    const state = randomBytes(16).toString('hex');
    const authorize = authorizeUrl(clientId, state);

    console.log('\nOpening the LinkedIn consent screen. If nothing happens, paste this:\n');
    console.log(`  ${authorize}\n`);
    console.log(`Make sure ${REDIRECT} is listed as an authorized redirect URL in the app.\n`);
    openBrowser(authorize);

    ({ code } = await awaitRedirect(state));
  }

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

  // The dashboard's User Token Generator hands out a token that is ALREADY
  // long-lived, and th_exchange_token only accepts short-lived ones — it answers
  // "Session key invalid" (code 452), which reads like a broken token but is
  // not. So: try the exchange, and if it is refused, refresh instead. Both
  // routes end at a 60-day token.
  const exchange = await fetch(
    `https://graph.threads.net/access_token?${new URLSearchParams({
      grant_type: 'th_exchange_token',
      client_secret: secret,
      access_token: short,
    })}`,
  );
  let json = await exchange.json();

  if (!exchange.ok) {
    console.log('  Exchange refused — the token looks already long-lived, refreshing instead.');
    const refreshed = await fetch(
      `https://graph.threads.net/refresh_access_token?grant_type=th_refresh_token&access_token=${short}`,
    );
    const refreshedJson = await refreshed.json();
    if (!refreshed.ok) {
      throw new Error(
        `neither exchange nor refresh worked.\n  exchange: ${JSON.stringify(json)}\n  refresh:  ${JSON.stringify(refreshedJson)}`,
      );
    }
    json = refreshedJson;
  }

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
