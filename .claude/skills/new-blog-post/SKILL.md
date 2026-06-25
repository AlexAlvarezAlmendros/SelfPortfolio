---
name: new-blog-post
description: Create a new bilingual (ES + EN) blog/devlog entry for the alexalvarez-portfolio Astro site. Use whenever the user wants to write, add, draft or publish a new blog post, devlog, or article in /home/poio/Documentos/GIT/SelfPortfolio. Handles the two paired markdown files, the frontmatter schema, the `order` renumbering, and — critically — a real EN localization that avoids literal calques of Spanish idioms.
---

# New blog post (alexalvarez-portfolio)

Create a devlog entry. Every post is **two files** that share one `slug`: the
Spanish source and its English localization. Write Spanish first (it is the
native voice and the default locale), then localize — **never translate
literally** (see the localization guide below, it is the point of this skill).

## 1. Gather the idea

Ask the user (or infer from their request) for:
- **Topic / angle** and the rough story to tell.
- **`tag`** — one uppercase category. Reuse an existing one when it fits:
  `MINDSET`, `BLOCKCHAIN`, `INDIE`, `HOMELAB`, `LINUX`, `AI`. New tags are fine
  but keep them short and uppercase.
- **`date`** — default to today (`YYYY-MM-DD`).
- **`slug`** — kebab-case, ASCII, no accents. The filename **must equal** the
  slug, and it must be **identical in both languages**.

## 2. File layout & schema

Create both files:
- `src/content/blog/es/<slug>.md`
- `src/content/blog/en/<slug>.md`

Frontmatter (validated by Zod in `src/content.config.ts` — all fields required):

```yaml
---
title: "..."            # localized per language
slug: "<slug>"          # SAME in both files
lang: es                # es | en — must match the folder
tag: "HOMELAB"          # SAME in both files (it's a code-like label)
date: 2026-06-23        # YYYY-MM-DD, SAME in both files
read: "6 min"           # reading-time estimate, localize the unit if needed (es/en both use "min")
excerpt: "..."          # one sentence, localized — also feeds <meta description> and og
order: 1                # see step 3
---
```

Body is Markdown. Match the house style of the existing posts:
- First person, casual devlog voice. Short.
- A couple of `## H2` sections with punchy titles.
- One `>` blockquote used as a pull-quote / takeaway line.
- Optionally one fenced code block with a short top comment (```ts / ```js /
  ```solidity), only if it earns its place.
- End on a forward-looking line ("the next step is…", "I'll write about it here").

Read 2–3 existing pairs before writing (e.g. `es/servidor.md` + `en/servidor.md`,
`es/openclaw.md` + `en/openclaw.md`) to calibrate tone and length.

## 3. The `order` field (renumber, don't guess)

The blog list (`BlogListView.astro`) sorts **ascending by `order`**, so
**`order: 1` shows first**. Order must mirror reverse-chronological date
(newest = lowest number).

After writing the new post, **renumber every post so `order` runs 1..N by date,
newest first**, applying the same numbers to both the `es/` and `en/` copies.
Don't just append `order: 8` — a new post is usually the newest, so it takes
`order: 1` and everything else shifts down. List the files, read each
date+order, compute the sequence, and edit each file whose number changed.

## 4. Localization guide — write EN, don't calque ES

The English copy is a **localization**, not a word-for-word translation. Convey
the *meaning* in natural, idiomatic English in the same casual register. Keep
product names, tech terms, and code untouched.

Known traps found in this codebase — do **not** repeat them:

| Spanish | ❌ literal | ✅ idiomatic EN |
| --- | --- | --- |
| `torre` (a desktop PC) | "a tower" | "a desktop rig", "a tower PC", "a build" — never bare "tower" |
| `se le ven las costuras` | "the seams are showing" | "it's starting to show its limits", "starting to creak" |
| `pide más músculo` | "asks for more muscle" | "needs more muscle" |
| `diagnóstico` (consulting CTA) | "diagnosis" | "assessment", "audit" |
| `digitalización` | "digitalization" | "digital transformation" |
| `un ojo de la cara` | "an eye of the face" | "an arm and a leg" |
| `quedarse con el culo al aire` | "with your butt in the air" | "caught with your pants down" |
| `cuatro duros` | "four coins" | "a few bucks" |
| `tocar el césped` | "touch the grass/lawn" | "touch some grass" |
| `manos a la obra` | "hands to the work" | "rolled up my sleeves", "got to it" |
| `comerse el mundo` | "eat the world" | "take on the world" |

General rules:
- Translate idioms by **meaning**, swapping in a real English idiom — never the
  word-by-word image.
- Hardware/PC vocabulary: prefer "desktop", "rig", "build", "box", "machine"
  over literal calques.
- Match register: contractions, first person, conversational. No corporate stiffness.
- Localize the `title` and `excerpt` too (they are not just the body).
- After drafting EN, **re-read it as a native speaker**: any phrase that sounds
  translated is a bug — rewrite it.

## 5. After writing

- OG/share images are generated from the built pages by
  `scripts/og-screenshots.mjs`, which auto-discovers slugs. Regenerate them so
  the new post has a preview/`og:image`:
  ```bash
  pnpm run screenshots   # astro build + screenshot every blog page → public/og/<lang>/<slug>.png
  ```
  (Until this runs, the new post's thumbnail and og:image 404.)
- Sanity-check the build / schema:
  ```bash
  pnpm run check         # astro check (validates content frontmatter)
  ```
- The post is then reachable at `/blog/<slug>` (ES) and `/en/blog/<slug>` (EN).
