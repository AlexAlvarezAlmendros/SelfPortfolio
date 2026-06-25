---
title: "My first steps into homelabbing"
slug: "homelab"
lang: en
tag: "HOMELAB"
date: 2026-03-28
read: "6 min"
excerpt: "From tinkering with Arduino and ESP32 to finally having a machine dedicated to being my personal server."
order: 6
---
I've always been the experimenting type: Arduino, ESP32, a thousand microcontrollers wired to anything that would hold still. But I'd never had a whole computer dedicated to being my personal server. And it turns out that changes the rules of the game quite a bit.

## The first server

I grabbed an old Lenovo ThinkCentre, installed Xubuntu and left it running as my first "real" machine. The goal wasn't anything spectacular at first: just a place to run daily scripts and scrapers for some personal project without depending on my laptop or anyone's cloud.

On top of that I set up OpenClaw running Claude Sonnet 4.6 through my GitHub Copilot subscription. I'll talk about that in another post, because there's a lot to unpack there.

## Frigate and the cameras

I also started messing with Frigate, routing my security cameras to store and analyze the footage with AI. The idea was beautiful, but the ThinkCentre ran out of breath fast: processing video with AI needs more muscle than that little box could give.

> In a homelab you learn quickly where your hardware's limit is: cross it, and it lets you know through pure lag.

So for now I've left it as a kind of household bot that runs scripts daily without complaining. Not glamorous, but reliable, and for starting out that's worth gold. The next step is already clear: I need a more serious machine.
