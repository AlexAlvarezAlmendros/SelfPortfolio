---
title: "La resaca del vibe coding: cómo trabajo yo con agentes"
slug: "vibe-coding"
lang: es
tag: "AI"
date: 2026-08-18
read: "6 min"
excerpt: "El vibe coding no lo inventó la IA, y lo que vino después tampoco tenía nombre cuando empecé a hacerlo."
order: 1
seoTitle: "La resaca del vibe coding: cómo trabajo yo con agentes"
seoDesc: "Casi la mitad del código nuevo lo escribe una IA y la confianza en él está cayendo. Mi sistema para trabajar con agentes: documentación, skills y hooks."
social:
  linkedin: |
    Lo que hoy llamamos vibe coding existía mucho antes que la IA. Solo que entonces no se llamaba así.

    Eran proyectos rápidos y verticales para validar una idea, normalmente sacados adelante por una sola persona con lo que tuviera a mano. Nadie pretendía que fueran mantenibles. El desarrollo conducido por IA se quedó con el nombre porque hace exactamente lo mismo, solo que ahora mucha más gente puede hacerlo.

    Y ahí llegó la resaca. Casi la mitad del código nuevo ya lo escribe una IA, pero la confianza en ese código ha bajado del 77% al 60% en un año. Los equipos dedican dos o tres veces más tiempo a depurar lo que generó el agente que si lo hubiera escrito alguien que entendía la arquitectura.

    Lo mejor de todo: el propio Karpathy, que le puso el nombre, dio el vibe coding por muerto este mismo año. Ahora habla de agentic engineering: el agente planifica, escribe, prueba y despliega, pero con supervisión humana estructurada.

    Cuando lo leí me hizo gracia, porque llevaba meses haciendo exactamente eso sin tener ni idea de que tuviera nombre.

    En el post cuento mi sistema entero: documentación funcional y técnica antes de escribir una línea, modelo de datos, skills de proyecto que parten cada feature en subtareas que puedo revisar, y hooks que comprueban formato, tests y antipatrones al terminar.

    Hay muchas formas de usar esta herramienta y ninguna está escrita en piedra. Lo único que no cambia es que el control y el conocimiento de lo que construyes tienen que seguir siendo tuyos.
  threads: |
    Lo que hoy llamamos vibe coding existía mucho antes que la IA. Solo que entonces no se llamaba así: proyectos rápidos para validar una idea, sin pretensión de ser mantenibles.

    Casi la mitad del código nuevo ya lo escribe una IA y la confianza en él ha bajado del 77% al 60% en un año.

    Karpathy le puso el nombre y este año lo dio por muerto. Llevaba meses haciendo agentic engineering sin saber que tenía nombre.
  bluesky: |
    Lo que hoy llamamos vibe coding existía mucho antes que la IA. Solo que no se llamaba así.

    Karpathy le puso el nombre y este año lo dio por muerto.

    Llevaba meses haciendo agentic engineering sin saber que tenía nombre. Mi sistema:
  x: |
    Lo que hoy llamamos vibe coding existía mucho antes que la IA. Solo que no se llamaba así.

    Karpathy le puso el nombre y este año lo dio por muerto.

    Llevaba meses haciendo agentic engineering sin saber que tenía nombre. Mi sistema:
---
Si te dedicas a esto ya no hace falta que te cuente que todo el mundo trabaja utilizando IA de una forma u otra. Lo verdaderamente interesante es lo que ha pasado estos últimos meses, porque he vivido las dos fases y la segunda no me la esperaba.

## El vibe coding antes de la IA

Lo que hoy llamamos vibe coding existía mucho antes que la IA. Solo que entonces no se llamaba así.

Eran proyectos rápidos y verticales que servían para validar una idea o un negocio, normalmente sacados adelante por una sola persona con los recursos que tuviera a mano. El objetivo no era un producto pulido, ni eficiente, ni mantenible siquiera: era validar. Y una vez validado, ya dedicabas esfuerzos a mejorarlo y a sacarle rendimiento.

El desarrollo conducido por IA se quedó con el nombre porque esencialmente hace lo mismo: prototipos rápidos que validan una idea. La diferencia es que ahora mucha más gente puede hacerlo.

Y si no aspiras a nada más, es más que suficiente: la IA lo hace de maravilla. El problema se lo encontraron los que, sin conocimientos, quisieron dar un paso más y descubrieron que no tenían con qué darlo.

## La resaca

Los que ya teníamos los conocimientos antes de la resaca la hemos llevado un poco más allá, usándola de formas que nos parecían lógicas y a las que más adelante alguien ha acabado poniendo nombre. A mí me pasó exactamente eso con el spec-driven development.

Los datos que van saliendo cuentan la historia bastante bien: casi la mitad del código nuevo ya lo escribe una IA, pero la confianza en ese código ha bajado del 77% al 60% en un año. Y los equipos han pasado a dedicar dos o tres veces más tiempo a depurar lo que generó el agente que si lo hubiera hecho una persona que entendía la arquitectura.

Lo mejor de todo es que el propio Karpathy, que fue quien le puso el nombre, dio el vibe coding por muerto este mismo año. Ahora habla de *agentic engineering*: el agente planifica, escribe, prueba y despliega, pero con supervisión humana estructurada. Specs, criterios de calidad y evaluación escritos antes de tocar nada.

Cuando lo leí me hizo gracia, porque llevaba meses haciendo exactamente eso sin tener ni idea de que tuviera nombre.

## Mi sistema

Cuando empiezo un proyecto, lo primero que hago es apuntar la idea en una nota de Obsidian. Me puede pillar en el lavabo o en medio del supermercado; cuando viene hay que apuntarla, y ese es el inicio.

Ya en casa, con algo de tiempo para ponerme con ello, empieza lo de verdad: documentar antes de escribir una sola línea.

- **Documentación funcional.** Defino cómo tiene que funcionar aquello: el recorrido del usuario, las pantallas y qué hace cada una.
- **Documentación técnica.** Aquí entra el stack, la estructura, la arquitectura en detalle, las prácticas que quiero que se respeten y las reglas para que el código salga limpio y coherente: nomenclatura de funciones, de variables, ese tipo de cosas.
- **Modelo de datos.** Con todas sus validaciones.
- **Skills del proyecto.** Especifican cómo se planifica cada feature y cómo se parte en subtareas concretas que yo pueda revisar antes de que se implemente nada.
- **Hooks.** Se ejecutan al terminar y comprueban el formato, lanzan los tests o buscan antipatrones y cosas mejorables. Cada proyecto tiene sus exigencias.

Con todo eso montado ya solo queda generar el plan e ir iterando subtarea a subtarea, revisando los cambios que va haciendo y entendiendo el código que genera.

> Documento antes de escribir una línea. No por orden, sino porque es la única forma de que lo que sale se parezca a lo que tenía en la cabeza.

## Lo siguiente

Cada semana aparecen cosas nuevas, o se me ocurren maneras de optimizar algún aspecto del desarrollo, siempre intentando mantener o mejorar la calidad del código. Hay muchas formas de usar esta herramienta y ninguna está escrita en piedra.

Lo único que no cambia es que el control y el conocimiento de lo que estás construyendo tienen que seguir siendo tuyos. Eso es lo que nos hace mejores cada día, y lo que nos lleva a trabajar de formas que todavía no tienen nombre.
