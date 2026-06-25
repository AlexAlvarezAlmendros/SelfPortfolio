---
title: "OpenClaw en un ThinkCentre 700"
slug: "openclaw"
lang: es
tag: "AI"
date: 2026-04-15
read: "9 min"
excerpt: "Memoria por procesos, curado de datos y automatizaciones diarias corriendo en una cajita de segunda mano."
order: 5
---
Si has seguido el mundillo de los agentes de IA, seguramente te suene OpenClaw. Causó bastante revuelo: un agente capaz de orquestar tareas complejas, mantener contexto y trabajar de forma casi autónoma. Yo quería ver hasta dónde podía exprimirlo en hardware modesto, así que lo monté en mi ThinkCentre 700.

## La configuración

Lo hice funcionar usando GitHub Copilot con el modelo Claude Sonnet 4.6 por detrás. La parte de la que estoy más orgulloso es el sistema de memoria por procesos: en lugar de una memoria global que se ensucia con todo, cada proceso mantenía su propio contexto y se sincronizaba solo cuando hacía falta. Así el agente no se perdía entre tareas que no tenían nada que ver.

```js
// Curado de datos para publicaciones
const raw = await scrape(sources);           // scrapers diarios
const clean = await agent.curate(raw);       // OpenClaw filtra y resume
await publishQueue.push(clean.forLinkedIn);  // listo para redes
```

## Lo que automaticé

Monté un sistema de curado de datos para generar publicaciones para redes como LinkedIn casi en piloto automático. Y lo combiné con n8n para procesar grandes volúmenes de datos en Excel: desde listados de contactos de leads potenciales para mi proyecto **inmocapt.com** hasta el curado masivo de datos que otras automatizaciones scrapeaban a diario. Todo eso, en un ThinkCentre 700 de segunda mano, como si nada.

## Por qué se acabó

La fiesta terminó cuando empezaron a subir las cuotas de GitHub Copilot. Cuando la cosa derivó hacia un sistema de API por suscripción, dejó de tener sentido económico bastante rápido.

> Las herramientas geniales gratis tienen fecha de caducidad. La pregunta no es si suben el precio, es cuándo.

Queda pendiente para próximos experimentos montar la estructura con modelos locales. Aunque, siendo honesto, con este ordenador se quedaría corto, por no decir inviable. Y no, no hay presupuesto para una DGX Spark, ni tengo el alma tan vendida al diablo como para comprarme un Mac Mini... Otra vía que quiero explorar es la de las APIs chinas, que parecen bastante económicas y capaces. Si me pongo con ello, lo cuento por aquí. Hasta entonces, nada.
