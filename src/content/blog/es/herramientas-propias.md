---
title: "Herramientas propias para no depender de nadie"
slug: "herramientas-propias"
lang: es
tag: "INDIE"
date: 2026-05-20
read: "8 min"
excerpt: "Hosting, base de datos, mailing, auth... dejar de delegar por pereza y montármelo yo."
order: 3
---
En mi vida como desarrollador, en la parte personal (del trabajo no hablo, ejem, NDAs y esas cosas...), siempre he dependido de herramientas de terceros para ahorrarme faena: el hosting, la base de datos, la autenticación, el mailing. Todas esas piezas que acabamos delegando por pereza o comodidad y que, sumadas, te cobran un ojo de la cara.

De un tiempo a esta parte me he ido montando estos servicios yo mismo o buscando alternativas económicas que me dejen seguir desarrollando sin demasiado problema.

## Lo que ya tengo resuelto

- **Hosting:** empecé quitándomelo de encima con Vercel. Con el tiempo pillé una suscripción básica que me da de sobra para mis proyectos.
- **Base de datos:** uso Turso, que es básicamente SQLite distribuido, y en la práctica me sale gratis. Un 2x1 estupendo junto al hosting.
- **Mailing:** con Nodemailer y Gmail puedo enviar y recibir correos sin gastar un duro.

## El hueso duro: la autenticación

El tema más complicado es, como casi siempre, la autenticación. Empecé delegándola en Auth0 y todavía tengo bastantes proyectos que la usan. Pero estoy montándome un sistema de auth propio para no depender de él.

```ts
// Auth propia: control total, una pieza menos que pagar
const session = await auth.verify(token);
if (!session) throw new Unauthorized();
```

Es complejo y pide más atención y mimo que el resto, pero ya lo tengo bastante encaminado.

> La idea es depender cada vez menos de proveedores externos, o que los pocos que tenga me resuelvan varios dolores de golpe.

No es por ahorrar cuatro duros (que también), es por entender de verdad cómo funciona cada capa de lo que construyo. Y, de paso, no quedarme con el culo al aire el día que a un proveedor le dé por subir precios o cerrar el grifo.
