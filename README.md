<div align="center">

# alexalvarez.dev

**Portfolio bilingüe en Astro: cero JavaScript de framework en el cliente, y cuando publicas un post se anuncia solo en las redes.**

[![En producción](https://img.shields.io/badge/en%20producci%C3%B3n-potfolioalex.vercel.app-4dd4ac)](https://potfolioalex.vercel.app)
[![Astro 7](https://img.shields.io/badge/Astro-7-ff5d01)](https://astro.build)
[![Lighthouse CI](https://github.com/AlexAlvarezAlmendros/SelfPortfolio/actions/workflows/lighthouse.yml/badge.svg)](.github/workflows/lighthouse.yml)
[![Autopost](https://github.com/AlexAlvarezAlmendros/SelfPortfolio/actions/workflows/social-publish.yml/badge.svg)](.github/workflows/social-publish.yml)

[Qué tiene dentro](#qué-tiene-dentro) ·
[Publicación automática](#un-post-nuevo-se-publica-solo) ·
[Calidad como puerta](#la-calidad-es-una-puerta-no-un-informe) ·
[Escribir](#escribir)

</div>

---

Sitio personal: quién soy, en qué trabajo, los proyectos y el blog. Estático de principio a fin,
bilingüe por rutas reales —español en `/`, inglés en `/en/`— y sin un solo componente de framework
hidratándose en el navegador. Las interacciones (marquee, scramble de texto, cursor con vista
previa, ajuste de tipografía, reloj, reveal al hacer scroll) son **TypeScript a pelo** en
`src/scripts/interactions.ts`; el único JS pesado es el fondo WebGL, y va aislado en su componente.

## Qué tiene dentro

- **Astro 7 en SSG.** Rutas reales, HTML servido ya hecho. El build además pasa por
  `scripts/strip-html-comments.mjs` para no publicar comentarios de plantilla.
- **i18n por rutas** con `hreflang` correcto, no un selector que cambia strings en el cliente.
- **Content Collections**: blog y proyectos en Markdown bajo `src/content/{blog,projects}/{es,en}/`,
  con frontmatter validado por schema — un post mal formado rompe el build, no la página.
- **SEO completo**: canonical, Open Graph, Twitter Card, JSON-LD (`Person`, `WebSite`,
  `BlogPosting`), `sitemap-index.xml`, `robots.txt`, RSS y **`llms.txt`** para que los modelos que
  rastreen el sitio encuentren la versión en texto.
- **Imágenes sociales generadas**, no maquetadas a mano: `npm run screenshots` y `npm run thumbs`
  disparan Playwright contra el build y sacan las OG y las miniaturas de cada proyecto.
- **Fondo WebGL** (`PixelBlast.astro`) con `three` + `postprocessing`, y banner de consentimiento
  antes de cargar analítica.

## Un post nuevo se publica solo

Escribir el post y luego ir red por red pegando el enlace es la parte que siempre se deja de hacer.
Aquí la hace el CI: al hacer push a `main` con un fichero nuevo en `src/content/blog/**`, el
workflow compone la copy y la publica.

| Red | Automático | Qué necesita |
|---|---|---|
| **Bluesky** | Sí | Handle + app password |
| **Mastodon** | Sí | Token de tu instancia |
| **Threads** | Sí | App de Meta, token de 60 días |
| **LinkedIn** | Sí | Producto *Share on LinkedIn*, re-auth manual cada 60 días |
| **X** | Sí | OAuth 1.0a — y ya no es gratis |
| **Reddit** · **Hacker News** | No | Enlaces de envío pre-rellenados |

Tres seguros, en este orden:

1. **Publicar de verdad exige la variable de repo `SOCIAL_AUTOPOST == 'true'`.** Hasta que la
   pongas, cada ejecución es un dry-run que solo imprime la copy.
2. **`scripts/social/published.json` es el libro mayor.** Un post que ya está ahí no se vuelve a
   enviar: reruns y rebases son inofensivos.
3. **Los posts viejos se ignoran** por antigüedad máxima, para que activar una red nueva no vuelque
   el archivo entero en la timeline de nadie.

```bash
npm run social:preview    # dry-run, sin credenciales: solo enseña la copy
npm run social:publish    # publica de verdad
```

Detalle por red y cómo conseguir cada credencial: [`scripts/social/README.md`](scripts/social/README.md).

## La calidad es una puerta, no un informe

`lighthouse.yml` corre Lighthouse CI sobre el `dist/` construido, tres pasadas por página
(home, work, blog y la home en inglés), y **falla el build** si no llega:

| Categoría | Umbral | |
|---|---|---|
| Accesibilidad | ≥ 0,88 | error |
| SEO | ≥ 0,95 | error |
| Buenas prácticas | ≥ 0,95 | error |
| Rendimiento | ≥ 0,55 | aviso |

## Escribir

```bash
npm install
npm run dev        # http://localhost:4321
npm run check      # astro check
npm run build      # estático a dist/
npm run preview
```

- **Post**: `src/content/blog/es/<slug>.md` y su gemelo en `en/`, con frontmatter
  (`title, slug, lang, tag, date, read, excerpt, order`).
- **Proyecto**: igual, en `src/content/projects/{es,en}/`.

```
src/
  pages/       rutas ES (raíz) y EN (/en) · rss.xml · llms.txt · 404
  layouts/     Layout.astro — head SEO, header, marquee, footer
  components/  Header · Footer · Analytics · ConsentBanner · PixelBlast · home/ · views/
  content/     blog/{es,en}/*.md · projects/{es,en}/*.md
  i18n/        ui.ts (strings y datos) · utils.ts
  lib/         patterns · date · jsonld
  scripts/     interactions.ts
scripts/       generación de OG y miniaturas · social/ (autopublicación)
```

## Despliegue

Vercel, framework `astro`, salida `dist/` (ver `vercel.json`).

La versión anterior del sitio queda archivada en `legacy/` y el diseño fuente en
`Portfolio web redesign/`; ninguno de los dos se despliega.

## Stack

**Astro 7** · TypeScript · `three` + `postprocessing` para el fondo WebGL · Playwright para
generar imágenes · Lighthouse CI · Node 22. Sin React, sin Vue, sin bundle de framework.
