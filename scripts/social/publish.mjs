// Cross-post new blog entries to the social networks that allow it.
//
//   node scripts/social/publish.mjs                    # dry run, prints copy
//   node scripts/social/publish.mjs --live             # actually posts
//   node scripts/social/publish.mjs --network=bluesky  # one network only
//   node scripts/social/publish.mjs --post=es/tty-launcher --live
//   node scripts/social/publish.mjs --max-age=9999 --live   # backfill
//
// Dry run is the default on purpose: publishing is irreversible and public.
// Nothing here posts unless --live is passed explicitly.

import { appendFile } from 'node:fs/promises';
import { MANUAL_TARGETS, NETWORKS } from './config.mjs';
import { compose, submissionTitle } from './lib/compose.mjs';
import { pending, readLedger, readPosts, recordPublish, writeLedger } from './lib/posts.mjs';
import { manualLinks } from './providers/manual.mjs';

const PROVIDERS = {
  x: () => import('./providers/x.mjs'),
  linkedin: () => import('./providers/linkedin.mjs'),
  threads: () => import('./providers/threads.mjs'),
  bluesky: () => import('./providers/bluesky.mjs'),
  mastodon: () => import('./providers/mastodon.mjs'),
  reddit: () => import('./providers/reddit.mjs'),
};

// A post older than this is treated as back catalogue and skipped, so wiring up
// a new network never floods a timeline with two years of archive.
const DEFAULT_MAX_AGE_DAYS = 14;

function parseArgs(argv) {
  const args = { live: false, network: null, post: null, maxAge: DEFAULT_MAX_AGE_DAYS };
  for (const arg of argv) {
    if (arg === '--live') args.live = true;
    else if (arg.startsWith('--network=')) args.network = arg.slice(10);
    else if (arg.startsWith('--post=')) args.post = arg.slice(7);
    else if (arg.startsWith('--max-age=')) args.maxAge = Number(arg.slice(10));
  }
  return args;
}

const summary = [];
function log(line = '') {
  console.log(line);
  summary.push(line);
}

async function flushSummary() {
  if (process.env.GITHUB_STEP_SUMMARY) {
    await appendFile(process.env.GITHUB_STEP_SUMMARY, `${summary.join('\n')}\n`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const posts = await readPosts();
  const ledger = await readLedger();

  log(`## Social autopost ${args.live ? '' : '— DRY RUN (pass --live to publish)'}`);
  log();

  let published = 0;
  let failed = 0;
  const manual = new Map();

  for (const [network, cfg] of Object.entries(NETWORKS)) {
    if (args.network && args.network !== network) continue;
    if (cfg.enabled === false) continue;

    const provider = await PROVIDERS[network]();
    const creds = provider.credentials(cfg.requires);
    // Missing credentials only block a live run — a dry run still previews the
    // copy, which is how you check wording before wiring up any secrets.
    if (!creds && args.live) {
      log(`- \`${network}\` — skipped, missing secrets (${cfg.requires.join(', ')})`);
      continue;
    }

    // LinkedIn member tokens expire after 60 days with no unattended refresh,
    // so the only defence is shouting about it before the run that fails.
    if (network === 'linkedin' && typeof provider.tokenAge === 'function') {
      const daysLeft = provider.tokenAge();
      if (daysLeft !== null && daysLeft <= 10) {
        log(
          `- ⚠️ \`linkedin\` — the access token expires in ~${daysLeft} day(s). ` +
            'Re-run the OAuth flow and update LINKEDIN_ACCESS_TOKEN / LINKEDIN_TOKEN_ISSUED.',
        );
      }
    }

    let queue = pending(posts, ledger, network, cfg.langs, args.maxAge);
    if (args.post) queue = queue.filter((p) => p.key === args.post);
    if (!queue.length) {
      log(`- \`${network}\` — nothing pending`);
      continue;
    }

    for (const post of queue) {
      const { text, url, tags } = compose(post, network, cfg);
      const title = submissionTitle(post, cfg.limit);

      if (!args.live) {
        log(`\n<details><summary><code>${network}</code> → ${post.key} (${text.length} chars)</summary>\n`);
        log('```');
        log(text);
        log('```');
        log('</details>');
        continue;
      }

      try {
        const result = await provider.publish({ text, url, tags, title, post, cfg }, creds);
        recordPublish(ledger, post.key, network, {
          at: new Date().toISOString(),
          url: result.url ?? null,
          id: result.id ?? null,
        });
        published++;
        log(`- ✅ \`${network}\` → ${post.key} — ${result.url ?? 'ok'}`);
      } catch (err) {
        failed++;
        log(`- ❌ \`${network}\` → ${post.key} — ${err.message}`);
      }
    }
  }

  // Manual targets: never posted, always reported, and only for posts that are
  // still inside the freshness window.
  const manualLangs = new Set(Object.values(MANUAL_TARGETS).flatMap((t) => t.langs));
  for (const post of posts) {
    if (!manualLangs.has(post.lang)) continue;
    if (args.post && post.key !== args.post) continue;
    if (post.date.valueOf() < Date.now() - args.maxAge * 86_400_000) continue;
    const links = manualLinks(post, compose(post, 'x', NETWORKS.x).url);
    if (links.length) manual.set(post.key, links);
  }

  if (manual.size) {
    log();
    log('### Needs one click from you');
    log();
    log('Hacker News has no write API, and Reddit link-drops get accounts banned.');
    log('These are prefilled — clicking submits:');
    log();
    for (const [key, links] of manual) {
      log(`**${key}**`);
      for (const l of links) log(`  - [${l.label}](${l.submitUrl})`);
    }
  }

  if (args.live) {
    await writeLedger(ledger);
    log();
    log(`_${published} published, ${failed} failed._`);
  }

  await flushSummary();
  // A failed network should turn the run red, but only after every other
  // network has had its turn.
  if (failed) process.exitCode = 1;
}

await main();
