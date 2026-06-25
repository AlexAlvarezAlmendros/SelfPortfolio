# Portfolio — Alex Alvarez Almendros

Portfolio personal construido con [Astro](https://astro.build), estático (SSG),
bilingüe (ES/EN) y con contenido en Content Collections (Markdown).

## Stack

- **Astro 7** — generación estática, rutas reales, cero JS de framework en cliente.
- **i18n por rutas** — español en `/`, inglés en `/en/`, con `hreflang`.
- **Content Collections** — blog y proyectos en `src/content/**` (Markdown + frontmatter validado por schema).
- **Interacciones** en TS vanilla (`src/scripts/interactions.ts`): marquee, scramble, cursor-preview, fit-text, reloj y reveal on-scroll.
- **SEO**: canonical, `hreflang`, Open Graph, Twitter Card, JSON-LD (Person/WebSite/BlogPosting), `sitemap-index.xml` (`@astrojs/sitemap`) y `robots.txt`.

## Comandos

```bash
pnpm install      # o npm install
pnpm dev          # servidor de desarrollo (localhost:4321)
pnpm build        # build estático a dist/
pnpm preview      # sirve el build
```

## Estructura

```
src/
  pages/            rutas ES (raíz) y EN (/en)
  layouts/          Layout.astro (head SEO, header, marquee, footer)
  components/       Header, Marquee, Footer + views/ (Home, BlogList, Article, Project)
  content/          blog/{es,en}/*.md · projects/{es,en}/*.md
  i18n/             ui.ts (strings + datos) · utils.ts (helpers de idioma)
  lib/              patterns, date, jsonld
  scripts/          interactions.ts
  styles/           global.css
public/             og-image.png, robots.txt, favicon.svg
```

### Añadir contenido

- **Post**: crea `src/content/blog/es/<slug>.md` y `src/content/blog/en/<slug>.md` con el frontmatter (`title, slug, lang, tag, date, read, excerpt, order`).
- **Proyecto**: análogo en `src/content/projects/{es,en}/<slug>.md`.

## Despliegue

Vercel (framework `astro`, salida `dist/`) — ver `vercel.json`.

> La versión estática anterior queda archivada en `legacy/` y el diseño fuente en `Portfolio web redesign/`. No se despliegan (solo se publica `dist/`).
