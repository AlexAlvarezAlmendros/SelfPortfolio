# Autopublicación de posts en redes

Cuando haces push a `main` con un post nuevo en `src/content/blog/**`, el workflow
`.github/workflows/social-publish.yml` compone la copy y la publica en las redes
que lo permiten. Reddit y Hacker News no se publican solos: se te devuelven
enlaces de envío pre-rellenados.

## Estado por red

| Red | Automático | Coste | Qué hace falta |
|---|---|---|---|
| **Bluesky** | Sí | Gratis | Handle + app password. Sin aprobaciones. |
| **Mastodon** | Sí | Gratis | Token de tu instancia. Sin caducidad. |
| **Threads** | Sí | Gratis | App de Meta. Token de 60 días, refrescable por código. |
| **LinkedIn** | Sí | Gratis | Producto "Share on LinkedIn". Token de 60 días, **re-auth manual**. |
| **X** | Sí | **~$0,20 por post con enlace** | 4 claves OAuth 1.0a. Ya no hay tier gratis. |
| **Reddit** | No (desactivado) | Gratis | Ver aviso abajo. |
| **Hacker News** | No (imposible) | — | No existe API de escritura. |

Empieza por Bluesky y Mastodon: son 5 minutos y no dependen de aprobaciones.

## Probar sin publicar nada

El script es dry-run por defecto. No hace falta ninguna credencial para ver la copy:

```bash
npm run social:preview              # todo lo pendiente
node scripts/social/publish.mjs --network=linkedin --post=es/tty-launcher
node scripts/social/publish.mjs --max-age=99999   # incluye el archivo entero
```

Publicar de verdad exige `--live` explícito:

```bash
npm run social:publish              # equivale a --live
```

## Activar la automatización

Nada se publica solo hasta que crees la **variable** de repositorio
`SOCIAL_AUTOPOST = true` (Settings → Secrets and variables → Actions → Variables).
Sin ella, cada push hace un dry-run y te deja la copy en el resumen del run.

Mientras tanto puedes lanzarlo a mano desde la pestaña Actions → *Social autopost*
→ *Run workflow*, marcando la casilla `live`.

## Credenciales

Todas van en Settings → Secrets and variables → **Actions** → *Secrets*.
Una red sin sus secrets se salta sin error.

### Bluesky
`BLUESKY_HANDLE` (`alexalvarez.dev` o `tu-handle.bsky.social`) y
`BLUESKY_APP_PASSWORD` (Settings → App Passwords → *Add App Password*).
No uses tu contraseña real.

### Mastodon
En tu instancia: Preferences → Development → New application, scope
`write:statuses`. Guarda `MASTODON_INSTANCE` (`https://mastodon.social`) y
`MASTODON_ACCESS_TOKEN`.

### Threads
1. developers.facebook.com → nueva app tipo *Threads*.
2. Permisos `threads_basic` y `threads_content_publish`.
3. Genera un token de larga duración → `THREADS_ACCESS_TOKEN`.

Caduca a los 60 días pero se refresca por API: `refresh()` en
`providers/threads.mjs`. Si lo automatizas, guarda el token nuevo con
`gh secret set THREADS_ACCESS_TOKEN`.

### LinkedIn
1. linkedin.com/developers → crea la app (necesita una página de empresa asociada,
   aunque publiques en tu perfil).
2. Pestaña Products → añade **Share on LinkedIn** (self-serve, aprobación rápida).
3. Flujo OAuth con scopes `openid profile w_member_social` → `LINKEDIN_ACCESS_TOKEN`.

El token dura 60 días y en el tier consumer **no hay refresh desatendido**: toca
rehacer el OAuth. Guarda la fecha en la variable `LINKEDIN_TOKEN_ISSUED`
(`2026-07-31`) y el script te avisará cuando se acerque el vencimiento.

El post sale sin enlace en el cuerpo y con la URL en el primer comentario, porque
el feed penaliza los enlaces salientes. Se controla con `linkInComment` en
`config.mjs`.

### X
developer.x.com → app con permisos *Read and write* → pestaña Keys and tokens:
`X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_SECRET`.

Usa OAuth 1.0a a propósito: esas claves no caducan, así que CI no necesita
refrescar nada. Ojo al coste — desde febrero de 2026 X es de pago por uso y un
post con enlace ronda los $0,20, así que una entrada bilingüe son ~$0,40.

### Reddit — léelo antes de activarlo

Está **desactivado** en `config.mjs` y la recomendación es dejarlo así. La API
publica sin problema, pero casi todos los subreddits consideran spam el envío
automático de enlaces propios, y los baneos son de cuenta entera. Actívalo solo
si participas de verdad en subreddits concretos donde la autopromoción esté
permitida, y ponlos en `NETWORKS.reddit.subreddits`.

## Copy a medida por post

La copy generada es deliberadamente sobria. Cuando un post merezca algo mejor,
escríbelo en su propio frontmatter y sustituye el cuerpo generado (el enlace y
los hashtags se siguen añadiendo según las reglas de cada red):

```yaml
---
title: "El problema de la adicción al móvil"
slug: "tty-launcher"
lang: es
tag: "INDIE"
date: 2026-07-29
read: "5 min"
excerpt: "..."
order: 1
social:
  x: "Mi móvil ya no tiene iconos. Solo una terminal."
  linkedin: |
    Llevaba meses dándole vueltas a por qué los launchers minimalistas
    dejan de funcionar al mes de instalarlos.

    Spoiler: el problema no es la pantalla, es el modelo de interacción.
---
```

## Cómo se evita publicar dos veces

`published.json` es la fuente de verdad: registra qué post ha salido en qué red y
cuándo. El workflow lo commitea después de cada run en vivo. No se deduce del diff
de git a propósito — un rerun, un rebase o un squash-merge volverían a publicar.

Además, los posts con más de 14 días (`--max-age`) se ignoran, así que enchufar
una red nueva no vuelca el archivo entero en tu timeline. Para republicar algo a
posta, bórralo de `published.json` y lanza el workflow a mano.
