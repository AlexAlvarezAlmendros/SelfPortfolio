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

## Probar desde tu máquina antes de tocar GitHub

Copia `.env.local.example` a `.env.local` (está en `.gitignore`) y rellena solo
la red que estés montando. Los scripts de npm lo cargan solos, así que las
credenciales nunca pasan por el historial del shell:

```bash
cp .env.local.example .env.local
$EDITOR .env.local
node --env-file=.env.local scripts/social/publish.mjs --network=bluesky --live
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
1. developers.facebook.com → nueva app, caso de uso **Access the Threads API**.
2. En *Customize*, añade los permisos `threads_basic` y `threads_content_publish`.
3. En esa misma pantalla, baja hasta **User Token Generator** y genera un token.
   Es de una hora: sirve solo como punto de partida.
4. Cámbialo por uno de 60 días:

```bash
node --env-file=.env.local scripts/social/auth.mjs threads --token=<el-de-una-hora>
```

Necesita `THREADS_APP_SECRET` en `.env.local`. Este atajo evita montar el OAuth
completo, que en Meta exige una redirect URI HTTPS.

Antes de que caduque, se renueva sin volver al dashboard:

```bash
node --env-file=.env.local scripts/social/auth.mjs threads --refresh
```

### LinkedIn
1. linkedin.com/developers → crea la app (pide asociar una página de empresa,
   aunque publiques en tu perfil personal).
2. Pestaña Products → añade **Share on LinkedIn** (self-serve, aprobación rápida).
3. Pestaña Auth → añade `http://localhost:3000/callback` como redirect URL
   autorizada, y copia el Client ID y el Client Secret a `.env.local`.
4. Lanza el flujo:

```bash
node --env-file=.env.local scripts/social/auth.mjs linkedin
```

Abre el consentimiento en el navegador, recoge el redirect en localhost y te
imprime el token ya listo para pegar.

El token dura 60 días y en el tier consumer **no hay refresh desatendido**: toca
repetir ese comando. Guarda la fecha en la variable `LINKEDIN_TOKEN_ISSUED` y el
script te avisará 10 días antes del vencimiento.

El post usa `POST /v2/ugcPosts`, que es lo que documenta el producto self-serve.
Si LinkedIn lo rechaza con 403 o 426, el proveedor reintenta contra
`/rest/posts` con `LinkedIn-Version: 202607`. Esa versión hay que subirla antes
de julio de 2027: LinkedIn garantiza un año por versión y luego la retira con
error duro.

El enlace viaja como **tarjeta de artículo**, no en el cuerpo del texto. Existe
`linkInComment` en `config.mjs` para moverlo al primer comentario (el truco
clásico contra la penalización de enlaces salientes), pero está **desactivado**:
comentar parece requerir `w_member_social_feed`, que este producto no concede, y
si el comentario falla el post se queda sin enlace ninguno. Actívalo solo si
compruebas que tu token puede comentar.

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
