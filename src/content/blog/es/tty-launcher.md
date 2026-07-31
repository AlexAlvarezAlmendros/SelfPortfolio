---
title: "El problema de la adicción al móvil"
slug: "tty-launcher"
lang: es
tag: "INDIE"
date: 2026-07-29
read: "5 min"
excerpt: "Cambiar el móvil de un modelo de selección a uno de petición: así nació TTY Launcher, un launcher Android con estética de terminal."
order: 1
seoTitle: "Adicción al móvil: por qué hice un launcher tipo terminal"
seoDesc: "Los launchers minimalistas dejan de funcionar cuando el cerebro se acostumbra. Por eso hice TTY Launcher: sin iconos ni listas, solo un prompt donde escribes."
relatedProject: "tty"
---
Hoy en día lo vemos en todas partes: la gente ha creado una dependencia del smartphone que da bastante que pensar. Y creo que nosotros, los desarrolladores, y las empresas tecnológicas, tenemos parte del trabajo de hacer que la tecnología sea más útil y menos adictiva. No voy a entrar en las mil situaciones en las que no deberíamos estar absorbidos por el móvil; prefiero aportar mi granito de arena.

## Los launchers minimalistas funcionan... hasta que dejan de funcionar

En las app stores ya hay cientos de launchers que hacen la pantalla de inicio más minimalista o monocromática para reducir el impulso de desbloquear el móvil y acabar en una red social o en un foro haciendo scroll infinito. Los he probado y funcionan relativamente bien, hasta que el cerebro se acostumbra y vuelve a interiorizar el movimiento automático que abre esa app que le da el chute de dopamina. Es cuestión de tiempo.

A raíz de esto se me ocurrió quitar también cualquier listado o selección: que el propio launcher sea una pantalla vacía con una entrada de texto donde escribir peticiones. Para abrir una app tienes que escribir `open` y el nombre de la app.

> Pasa de ser un modelo de selección a un modelo de petición: le pides al teléfono por escrito lo que quieres hacer.

## TTY Launcher

La idea era sencilla de ejecutar, así que me puse manos a la obra. Después de una semana ya tengo una primera versión de **TTY Launcher**, un launcher Android ultra minimalista con estética de CLI al que además le he añadido capacidades de consola tipo Linux: puedes hacer `cd`, `ls`, `mkdir`, `cat`, `touch`, etc. Todo eso gracias a Termux, que funciona por detrás aceptando esas peticiones.

```sh
$ open calendar        # abre la app, sin pasar por el cajón de apps
$ ls ~/notes           # y de paso, una consola de verdad
```

Ya lo estoy usando a diario y la verdad es que, además de una estética increíble, me ayuda mucho a ser consciente en todo momento de qué estoy abriendo o ejecutando en mi teléfono. Se acabaron las selecciones automáticas que me metían en una red social cuando solo quería mirar el calendario o mandar un mensaje.

Siento que esto tiene mucho potencial. A partir de aquí quiero poder crear scripts y automatizaciones desde la propia consola del launcher, así que iré contando las novedades por aquí.
