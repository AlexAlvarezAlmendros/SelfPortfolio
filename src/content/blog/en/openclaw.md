---
title: "OpenClaw on a ThinkCentre 700"
slug: "openclaw"
lang: en
tag: "AI"
date: 2026-04-15
read: "9 min"
excerpt: "Per-process memory, data curation and daily automations running on a second-hand little box."
order: 5
---
If you've been following the AI agent scene, OpenClaw probably rings a bell. It caused quite a stir: an agent able to orchestrate complex tasks, hold context and work almost autonomously. I wanted to see how far I could push it on modest hardware, so I set it up on my ThinkCentre 700.

## The setup

I got it running using GitHub Copilot with Claude Sonnet 4.6 underneath. The part I'm proudest of is the per-process memory system: instead of one global memory that gets polluted with everything, each process kept its own context and only synced when it actually needed to. That way the agent didn't get lost jumping between unrelated tasks.

```js
// Data curation for posts
const raw = await scrape(sources);           // daily scrapers
const clean = await agent.curate(raw);       // OpenClaw filters and summarizes
await publishQueue.push(clean.forLinkedIn);  // ready for social
```

## What I automated

I built a data-curation system to generate posts for networks like LinkedIn almost on autopilot. And I paired it with n8n to process large volumes of Excel data: from lead contact lists for my **inmocapt.com** project to the mass curation of data that other automations scraped daily. All of that, on a second-hand ThinkCentre 700, like it was nothing.

## Why it ended

The party ended when GitHub Copilot's pricing started climbing. Once things drifted toward a subscription-based API model, it stopped making economic sense pretty fast.

> Great free tools have an expiration date. The question isn't whether the price goes up, it's when.

Still pending for future experiments: rebuilding the whole thing with local models. Though, to be honest, this machine would fall short, if not make it outright unfeasible. And no, there's no budget for a DGX Spark, nor is my soul sold to the devil enough to buy a Mac Mini... Another path I want to explore is the Chinese APIs, which look pretty cheap and capable. If I get to it, I'll write about it here. Until then, that's all.
