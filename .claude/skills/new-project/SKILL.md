---
name: new-project
description: Add a new bilingual (ES + EN) project/work entry to the alexalvarez-portfolio Astro site. Use whenever the user wants to add, create, or publish a new project, case study, or work item in /home/poio/Documentos/GIT/SelfPortfolio. Handles the two paired markdown files, the full frontmatter schema, the `order` renumbering, the thumbnail/screenshot wiring, and a real EN localization that avoids literal calques of Spanish.
---

# New project (alexalvarez-portfolio)

Add a portfolio project. Each project is **two files** that share one `slug`:
the Spanish source and its English localization. Projects are **frontmatter
only** (empty body) — every field is rendered by `ProjectView.astro`. Write
Spanish first (native voice, default locale), then localize — **never translate
literally** (see the localization guide; it is the point of pairing this with
the same care as the blog skill).

## 1. Gather the info

Ask the user (or infer):
- **`name`** — display/brand name, usually uppercase (e.g. `INMOCAPT`). Same in both langs.
- **`slug`** — kebab-case, ASCII, no accents. Filename **must equal** the slug and be **identical in both languages**.
- **`year`** — string (e.g. `"2026"`).
- **Status / `label`** — `PUBLIC REPO` for a shipped/public repo, or *in development* (`EN DESARROLLO` / `IN DEVELOPMENT`). This field **is localized** (see table below).
- **`url`** — display text only, no protocol (e.g. `inmocapt.com`). Same both langs. For repo-only projects, use the GitHub path (e.g. `github.com/User/Repo`).
- **`live`** — full URL, **must be a valid URL** (Zod `.url()`). For dev/repo-only projects point it at the repo.
- **`repo`** — full GitHub URL, **must be a valid URL**.
- **`tags`** — array of tech names (e.g. `["React", "TypeScript", "Fastify", "Stripe"]`). Same both langs.
- **`role`**, **`tagline`**, **`overview`**, **`features`** (3–4 items) — the prose. **Localized** per language.

## 2. File layout & schema

Create both files (body stays **empty** after the frontmatter):
- `src/content/projects/es/<slug>.md`
- `src/content/projects/en/<slug>.md`

Frontmatter (validated by Zod in `src/content.config.ts` — all fields required):

```yaml
---
name: "INMOCAPT"              # SAME both files
slug: "<slug>"               # SAME both files
lang: es                     # es | en — must match the folder
label: "PUBLIC REPO"         # localized status badge
year: "2025"                 # SAME both files
url: "inmocapt.com"          # display text, no protocol, SAME both files
live: "https://inmocapt.com" # valid URL
repo: "https://github.com/AlexAlvarezAlmendros/InmoCaptWeb" # valid URL
tags: ["React", "TypeScript", "Fastify", "Stripe"]          # SAME both files
tagline: "..."               # one line, localized
role: "..."                  # localized
overview: "..."              # one paragraph, localized — also feeds <meta description>
features:                    # 3–4 bullets, localized
  - "..."
  - "..."
order: 2                     # see step 3
---
```

Read an existing pair first to calibrate (e.g. `es/inmocapt.md` + `en/inmocapt.md`,
or `es/gitchain.md` + `en/gitchain.md` for an in-development one).

## 3. The `order` field (manual ranking — renumber both langs)

The home page and project pages sort projects **ascending by `order`**, so
`order: 1` is the most prominent. Unlike the blog, **`order` is a curated
prominence ranking, not chronological** (e.g. a 2026 project can sit below a 2025
one). Ask the user where the project should slot, then **renumber so `order` runs
1..N with no gaps**, applying the same number to both the `es/` and `en/` copies.
Read every project's current order, insert, and edit each file whose number changed.

## 4. Thumbnail / screenshot wiring

The main project shot, the hover preview, and the `og:image` all come from one
1200×630 PNG. Decide which case applies:

**A. Project has a live, screenshot-able site** → wire it up:
1. `src/lib/project-thumbs.ts` — add `"<slug>": '/og/projects/<slug>.png',` to `projectShot`.
2. `scripts/project-thumbs.mjs` — add `{ slug: '<slug>', url: '<live homepage>' },` to the `SITES` array.
3. Generate the image:
   ```bash
   pnpm thumbs          # node scripts/project-thumbs.mjs → public/og/projects/<slug>.png
   ```

**B. Project has no usable live site** (in development, repo-only) → no screenshot:
1. `src/lib/project-thumbs.ts` — add `"<slug>": null,` to `projectShot`.
2. Do **not** add it to `SITES` in `project-thumbs.mjs`.
3. The UI then shows a CSS-pattern fallback (`grid` by default) and a `// WIP · <year>` placeholder.

**Optional (both cases):** give it a nicer fallback pattern by adding
`<slug>: dots,` (or `grid`/`diag`/`cross`) to `projectThumb` in
`src/lib/patterns.ts`. Without an entry it falls back to `grid`.

## 5. Localization guide — write EN, don't calque ES

The English copy is a **localization**, not a word-for-word translation. Keep
product names, tech terms and URLs untouched; convey the *meaning* of the prose
in natural, idiomatic English. (The companion `new-blog-post` skill has the full
idiom table — the same rules apply here.)

Project-prose traps to watch:

| Spanish | ❌ literal | ✅ idiomatic EN |
| --- | --- | --- |
| `digitalización` | "digitalization" | "digital transformation" |
| `diagnóstico` (consulting CTA) | "diagnosis" | "assessment", "audit" |
| `captación de leads/propietarios` | "leads/owners catchment" | "lead capture", "lead generation" |
| `particular(es)` (private owner) | "particular" | "private owner", "individual" |
| `sin intermediarios` | "without intermediaries" (ok but heavy) | "no middlemen", "direct" |
| `gestor de contenidos` | "contents manager" | "content manager / CMS" |
| `panel de administración` | "administration panel" | "admin panel" |
| `EN DESARROLLO` (label) | "IN DEVELOPMENT" ✓ | `IN DEVELOPMENT` |
| `PUBLIC REPO` (label) | — | `PUBLIC REPO` (unchanged) |

Rules: localize `label`, `role`, `tagline`, `overview` and every `features`
item. Keep `tags`, `name`, `url`, `live`, `repo`, `year`, `slug` identical
across both files. After drafting EN, re-read it as a native speaker — anything
that sounds translated is a bug; rewrite it.

## 6. After writing

- Validate the frontmatter / build:
  ```bash
  pnpm run check       # astro check (validates project frontmatter against the Zod schema)
  ```
- If you wired a live screenshot, confirm `public/og/projects/<slug>.png` exists.
- The project is then reachable at `/work/<slug>` (ES) and `/en/work/<slug>` (EN),
  and listed on the home page under PROJECTS / WORK.
