---
title: "Building my own tools to depend on no one"
slug: "herramientas-propias"
lang: en
tag: "INDIE"
date: 2026-05-20
read: "8 min"
excerpt: "Hosting, database, mailing, auth... cutting out the lazy delegation and building it myself."
order: 3
---
In my life as a developer, on the personal side (I don't talk about work, ahem, NDAs and all that...), I've always leaned on third-party tools to save myself effort: hosting, the database, authentication, mailing. All those pieces we end up delegating out of laziness or convenience and that, added up, charge you an arm and a leg.

For a while now I've been setting up these services myself or hunting for cheap alternatives that let me keep building without much trouble.

## What I've already solved

- **Hosting:** I started by getting it off my plate with Vercel. Over time I picked up a basic subscription that's more than enough for my projects.
- **Database:** I use Turso, which is basically distributed SQLite, and in practice it's free for me. A great 2-for-1 alongside hosting.
- **Mailing:** with Nodemailer and Gmail I can send and receive email without spending a dime.

## The tough one: authentication

The trickiest part is, as almost always, authentication. I started by delegating it to Auth0 and I still have a fair few projects using it. But I'm building my own auth system so I don't depend on it.

```ts
// Own auth: full control, one less thing to pay for
const session = await auth.verify(token);
if (!session) throw new Unauthorized();
```

It's complex and demands more care and attention than the rest, but I've already got it well on track.

> The goal is to depend less and less on external providers, or to have the few I keep solve several pains at once.

It's not about saving a few bucks (though that too), it's about really understanding how each layer of what I build works. And, while I'm at it, not getting caught with my pants down the day a provider decides to raise prices or shut off the tap.
