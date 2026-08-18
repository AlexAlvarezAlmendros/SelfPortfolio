---
title: "The phone addiction problem"
slug: "tty-launcher"
lang: en
tag: "INDIE"
date: 2026-07-29
read: "5 min"
excerpt: "Turning the phone from a pick-from-a-list model into an ask-for-it model: that's how TTY Launcher, a terminal-style Android launcher, came about."
order: 2
seoTitle: "Phone addiction: why I built a terminal-style launcher"
seoDesc: "Minimalist launchers stop working once your brain adapts. So I built TTY Launcher: no icons, no lists, just a prompt where you type what you actually want."
relatedProject: "tty"
---
You see it everywhere these days: people have built up a dependency on their smartphones that's genuinely worrying. And I think we developers, along with the tech companies, have some responsibility in making technology more useful and less addictive. I'm not going to list the thousand situations where we shouldn't be glued to our phones; I'd rather do my small part.

## Minimalist launchers work... until they don't

The app stores are full of launchers that make your home screen more minimal or monochrome to blunt the urge to unlock your phone and end up doomscrolling some social feed or forum. I've tried them, and they work reasonably well, right up until your brain adapts and re-learns the automatic gesture that opens the app that gives it the dopamine hit. It's only a matter of time.

That got me thinking: what if I removed the lists and the picking altogether? Make the launcher itself an empty screen with a text field where you type what you want. To open an app, you type `open` and the app's name.

> It goes from a pick-from-a-list model to an ask-for-it model: you tell the phone in writing what you want to do.

## TTY Launcher

The idea was simple enough to build, so I got to it. A week later I've got a first version of **TTY Launcher**, an ultra-minimal Android launcher with a CLI look, and I've also given it Linux-style shell capabilities: you can run `cd`, `ls`, `mkdir`, `cat`, `touch`, and so on. All of that thanks to Termux running underneath and taking those commands.

```sh
$ open calendar        # opens the app, no app drawer involved
$ ls ~/notes           # and while we're at it, a real shell
```

I'm already using it day to day and honestly, beyond looking great, it keeps me aware at every moment of what I'm opening or running on my phone. No more autopilot taps that drop me into a social app when all I wanted was to check the calendar or send a message.

I think there's a lot of potential here. From this point I want to be able to write scripts and automations straight from the launcher's own shell, so I'll keep posting updates here.
