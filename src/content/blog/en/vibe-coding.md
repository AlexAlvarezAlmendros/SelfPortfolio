---
title: "The vibe coding hangover: how I actually work with agents"
slug: "vibe-coding"
lang: en
tag: "AI"
date: 2026-08-18
read: "6 min"
excerpt: "AI didn't invent vibe coding, and what came after it didn't have a name either when I started doing it."
order: 1
seoTitle: "The vibe coding hangover: how I work with AI agents"
seoDesc: "Almost half of all new code is written by AI and trust in it is falling. My system for working with agents: documentation first, project skills and hooks."
---
If you do this for a living, I don't need to tell you that everyone is working with AI in one way or another. What's really interesting is what has happened over the last few months, because I've lived through both phases and I wasn't expecting the second one.

## Vibe coding before AI

What we now call vibe coding existed long before AI. It just didn't have that name yet.

They were fast, vertical projects meant to validate an idea or a business, usually pushed out by one person with whatever resources they had on hand. The goal was never a polished product, or an efficient one, or even a maintainable one: the goal was to validate. Once it was validated, then you'd put the effort into improving it and making it pay.

AI-driven development took the name because it essentially does the same thing: quick prototypes that validate an idea. The difference is that a lot more people can do it now.

And if you're not after anything more than that, it's more than enough: AI is great at it. The people who hit the wall were the ones who, without the background, wanted to take it further and found out they didn't have what it takes.

## The hangover

Those of us who already had that background before the hangover pushed it a bit further, using AI in ways that just felt logical to us and that somebody later got around to naming. That's exactly what happened to me with spec-driven development.

The numbers coming out tell the story pretty well: almost half of all new code is already written by AI, but developer trust in that code has dropped from 77% to 60% in a year. And teams now spend two or three times longer debugging what the agent generated than they would have on code written by someone who understood the architecture.

The best part is that Karpathy himself, the man who gave it the name, declared vibe coding dead this same year. Now he talks about *agentic engineering*: the agent plans, writes, tests and ships, but under structured human oversight. Specs, quality bars and evaluation criteria written down before anything gets touched.

It made me laugh when I read it, because I'd been doing exactly that for months without the faintest idea that it had a name.

## My system

When I start a project, the first thing I do is drop the idea into a note in Obsidian. It can hit me in the bathroom or halfway down a supermarket aisle; when it comes you write it down, and that's the starting point.

Once I'm home and have some time to get into it, the real work begins: documenting before writing a single line.

- **Functional docs.** I define how the thing has to work: the user journey, the screens, and what each one does.
- **Technical docs.** This is where the stack goes, along with the structure, the architecture in detail, the practices I want respected, and the rules that keep the code clean and consistent: naming for functions, for variables, that kind of thing.
- **The data model.** With all its validation.
- **Project skills.** They spell out how each feature gets planned and broken down into specific subtasks I can review before anything gets implemented.
- **Hooks.** They run at the end and check formatting, fire the tests, or hunt for anti-patterns and things worth improving. Every project has its own demands.

With all that in place, what's left is generating the plan and iterating subtask by subtask, reviewing the changes it makes and understanding the code it produces.

> I document before writing a line. Not out of tidiness, but because it's the only way what comes out resembles what I had in my head.

## What's next

Every week something new shows up, or I come up with another way to optimise some part of the process, always trying to hold or raise the quality of the code. There are plenty of ways to use this tool and none of them are set in stone.

The one thing that doesn't change is that the control and the understanding of what you're building have to stay yours. That's what makes us better every day, and what leads us to work in ways that don't have a name yet.
