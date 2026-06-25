---
title: "¿GitHub en la blockchain?"
slug: "github-blockchain"
lang: es
tag: "BLOCKCHAIN"
date: 2026-06-18
read: "8 min"
excerpt: "Vincular repositorios de GitHub a Ethereum para gestionar bounties y decisiones entre mantenedores."
order: 1
---
El otro día me topé con alguien defendiendo que GitHub no significa open source. Un statement un poco raro y bastante obvio para los que llevamos tiempo en esto, pero me hizo pensar.

## La idea

Me puse a darle vueltas al open source y a cómo esa idea de que el software sea libre encaja sorprendentemente bien con la descentralización y las redes blockchain. Si el código es de todos, ¿por qué las decisiones y el dinero que lo rodean siguen pasando por intermediarios?

De ahí salió la pregunta: ¿y si montara un proyecto que vincule y gestione repositorios de GitHub sobre la red de Ethereum? Algo para gestionar las partes que hoy son un lío de confianza y trámites:

- **Bounties** pagados de forma transparente y sin intermediarios.
- **Decisiones de alto nivel** entre los mantenedores de un repo, registradas on-chain.
- **Reputación portable** para los devs que contribuyen de verdad.

## A investigar

Me puse manos a la obra a investigar y, para mi sorpresa, nadie parece haber hecho algo parecido con este enfoque. Eso me animó todavía más: si el hueco está vacío, o es que no interesa, o es que nadie se ha atrevido. Apuesto por lo segundo.

```solidity
// Un bounty que se libera solo cuando el PR se mergea
function claimBounty(bytes32 repoId, uint256 prId) external nonReentrant {
    require(isMerged(repoId, prId), "PR not merged");
    pendingWithdrawals[msg.sender] += bounties[repoId][prId];
}
```

> El open source resolvió quién puede leer el código. Falta resolver quién decide y quién cobra.

Convertir las licencias en contratos ejecutables, los bounties en algo sin intermediarios y la reputación en algo que el dev se lleve consigo: ahí veo el potencial. Estoy en plena fase de construirlo, así que iré contando cómo avanza por aquí.
