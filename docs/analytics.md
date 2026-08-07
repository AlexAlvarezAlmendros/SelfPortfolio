# Analíticas y auditoría

Stack elegido: **Umami v3 autoalojada** (MIT) sobre **Vercel + Neon Postgres**, ambos en
free tier, más **Lighthouse CI** en GitHub Actions. Coste 0 €, datos en cuentas tuyas,
sin ningún SaaS de terceros de por medio.

Umami cubre los cuatro frentes con una sola herramienta:

| Qué | Cómo |
| --- | --- |
| Tráfico | Pageviews, referrers, países, dispositivos, ES vs EN |
| Eventos y conversiones | Atributos `data-umami-event` en los enlaces clave |
| Heatmaps y session replay | `recorder.js`, incluido en la build self-hosted desde v3.1 |
| Core Web Vitals reales | `data-performance="true"` en el tracker (v3.1+) |
| Auditoría técnica | Lighthouse CI en cada push y PR |

No hace falta PostHog ni Matomo. Se descartaron porque el replay de PostHog exige
ClickHouse + Kafka (imposible en serverless) y los heatmaps de Matomo son plugin de pago.

---

## Arquitectura

```
alexalvarez.dev (este repo, Vercel)
   └── script.js    ─┐
   └── recorder.js  ─┤ tras consentimiento
                     ▼
analiticas.alexalvarez.dev (Umami, Vercel)
                     ▼
             Neon Postgres (free)
```

Son **dos proyectos de Vercel distintos**: este portfolio y la instancia de Umami.

---

## Despliegue, paso a paso

### 1. Base de datos (Neon)

1. Crea un proyecto en [neon.tech](https://neon.tech) — región **EU (Frankfurt)**, más
   cerca de tus visitantes y mejor para RGPD.
2. Copia la **pooled connection string** (la que lleva `-pooler` en el host).

> Usa la pooled sí o sí. Vercel abre una conexión por invocación de función y una
> conexión directa agota el límite de Neon en cuanto entren varias visitas a la vez.

### 2. Umami en Vercel

1. Haz fork de [`umami-software/umami`](https://github.com/umami-software/umami).
2. En Vercel: **Add New → Project** e importa el fork.
3. Variables de entorno:

   | Variable | Valor |
   | --- | --- |
   | `DATABASE_URL` | la pooled connection string de Neon |
   | `APP_SECRET` | cadena aleatoria — `openssl rand -base64 32` |

4. Deploy. Las migraciones de Prisma corren solas en el build.

### 3. Dominio

Apunta `analiticas.alexalvarez.dev` al proyecto de Umami en Vercel. Un subdominio propio
evita buena parte de los bloqueadores, que sí filtran los dominios conocidos de analítica.

### 4. Primer acceso

Usuario `admin`, contraseña `umami`. **Cámbiala antes de nada** — la instancia es pública.

Luego **Settings → Websites → Add website** con el dominio `www.alexalvarez.dev`, y copia
el **Website ID** que genera.

### 5. Conectar el portfolio

En el proyecto de Vercel **de este repo**, añade:

```
PUBLIC_UMAMI_SRC        = https://analiticas.alexalvarez.dev/script.js
PUBLIC_UMAMI_WEBSITE_ID = <el ID del paso anterior>
PUBLIC_UMAMI_DOMAINS    = www.alexalvarez.dev
```

Redeploy. Mientras `PUBLIC_UMAMI_SRC` o `PUBLIC_UMAMI_WEBSITE_ID` estén vacías, el sitio
no emite ningún script: `astro dev` y CI quedan siempre limpios.

### 6. Replay y heatmaps (opcional)

1. En Umami: **Settings → Websites → [tu web] → Replays & Heatmaps**, y actívalo.
2. En Vercel, añade `PUBLIC_UMAMI_REPLAY=true` y redeploy.

Esto activa el banner de consentimiento. `recorder.js` solo se carga si el visitante
acepta; el contador de visitas funciona igual acepte o no.

---

## Qué se mide

Eventos ya instrumentados (`data-umami-event`):

| Evento | Dónde | Propiedades |
| --- | --- | --- |
| `cta-contact` | Botón CONTACTAR del hero | `place` |
| `contact-email` | Enlace `mailto:` | — |
| `outbound-linkedin` | LinkedIn | — |
| `outbound-github` | GitHub (hero y contacto) | `place` |
| `project-live` | VISITAR de cada proyecto | `project` |
| `project-repo` | VER REPO de cada proyecto | `project` |
| `article-read` | Final de un post visible en pantalla | `path` |

`article-read` es el que distingue leer de abrir: un pageview solo dice que alguien entró.

Para añadir más, basta con el atributo — no hace falta tocar JavaScript:

```html
<a href="/cv.pdf" data-umami-event="cv-download">Descargar CV</a>
```

---

## Privacidad

- El tracker de visitas es **sin cookies** y anónimo → no necesita banner.
- El **replay sí lo necesita**, porque graba la sesión. De ahí el gate de consentimiento.
- `data-do-not-track="true"` respeta la señal DNT del navegador. Si algún día ves un
  hueco raro en los números, este es el motivo; se quita en `Analytics.astro`.
- `data-exclude-hash="true"` evita que los anclas `#contact` ensucien las URLs.

---

## Auditoría técnica

**Lighthouse CI** corre en cada push a `main` y en cada PR (`.github/workflows/lighthouse.yml`),
sobre 4 URLs representativas y 3 pasadas cada una. Config en `lighthouserc.json`.

### Baseline medido (2026-08-07)

| Categoría | Score | Umbral | Modo |
| --- | --- | --- | --- |
| SEO | 1.00 | 0.95 | error |
| Buenas prácticas | 1.00 | 0.95 | error |
| Accesibilidad | **0.89** | 0.88 | error |
| Rendimiento | **0.60** | 0.55 | warn |

Los umbrales están puestos **justo por debajo del estado actual**, no en el ideal. Así el
check pasa hoy y salta en cuanto algo empeore. La idea es subirlos según se vayan
arreglando las cosas (ratchet), no dejarlos fijos.

### Dos fallos reales que el sistema ya ha detectado

Son **previos** a este montaje, no los introduce la analítica. Sin arreglar, la
accesibilidad no pasará de 0.89:

1. **Contraste insuficiente en el footer** — `#55554f` sobre `#050504` da 2.72:1 y el
   mínimo AA es 4.5:1. El cambio mínimo que cumple es **`#7a7a73`** (4.72:1), en
   `src/components/Footer.astro`. Afecta a las dos líneas del footer.
2. **`aria-hidden` con elementos focalizables** — `#mobile-nav` lleva `aria-hidden="true"`
   cuando está cerrado, pero sus enlaces siguen siendo tabulables: quien navega con teclado
   entra en un menú invisible. Se arregla añadiendo `inert` al cerrarlo.

Arreglados los dos, sube el umbral de accesibilidad a 0.95 en `lighthouserc.json`.

El 0.60 de rendimiento es el canvas WebGL de `PixelBlast`. Es una decisión de diseño
consciente, por eso queda como aviso y no bloquea nada.

El informe se sube a `temporary-public-storage` de Google: enlace público en los logs, se
borra a los pocos días. Suficiente para revisar una regresión puntual.

El job tarda unos **15 min** (4 URLs × 3 pasadas en un runner compartido). El repo es
público, así que los minutos de Actions no cuestan, pero si molesta la espera lo que más
recorta es bajar `numberOfRuns` a 2. Se mantiene en 3 porque la mediana de tres pasadas
absorbe mucho mejor el ruido de rendimiento del runner.

Esto es rendimiento **de laboratorio**. El rendimiento **real** lo da Umami vía
`data-performance`, en **Reports → Performance**: LCP, INP y CLS de visitantes de verdad,
con sus móviles y sus redes. Los dos se complementan, ninguno sustituye al otro.

---

## Límites y mantenimiento

| Recurso | Free tier | Nota |
| --- | --- | --- |
| Neon | 0.5 GB, 100 CU-h/mes | Escala a cero a los 5 min de inactividad |
| Vercel Hobby | Sin coste, uso no comercial | Dos proyectos cuentan por separado |

Lo único que puede llenar los 0.5 GB es el **session replay**: cada grabación guarda
snapshots del DOM y pesa órdenes de magnitud más que un pageview. Con el tráfico de un
portfolio no es un problema inmediato, pero conviene:

- Activar el replay **por temporadas** — un par de semanas tras un rediseño, y apagarlo.
- Vigilar el uso en el panel de Neon de vez en cuando.
- Si se llena, Neon **suspende el compute** hasta el siguiente ciclo. Es el fallo más
  probable de todo este montaje, y avisa por email antes de llegar.

Los pageviews puros son minúsculos: 0.5 GB da para años.

## Si algún día se queda corto

Un VPS de 5 €/mes con Docker Compose (Umami + Postgres + Caddy) quita todos los límites y
usa exactamente la misma configuración de cliente: solo cambia `PUBLIC_UMAMI_SRC`. Nada de
lo que hay en este repo tendría que cambiar.
