[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/h05meiherlianto/makefun-trophyguide-01-agent2/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/h05meiherlianto/makefun-trophyguide-01-agent2/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Trophy Guide — GTA VI, all 55 PS5 trophies

An offline, open-source guide and tracker for every PlayStation 5 trophy in
Grand Theft Auto VI: 1 platinum, 2 gold, 6 silver, 46 bronze — 28 of them
hidden on PlayStation until earned, and none of them online.

## What it does

- **Checklist tracker** — tick trophies off; progress saves in the browser
  (localStorage) and can be exported to a file and imported back.
- **Filters** — by grade and by kind (story, missable, collectibles,
  activities, online), plus search and a hide-earned switch.
- **Spoiler setting** — on by default: hidden story trophies stay masked
  (name, description and guide) until you earn them.
- **Roadmap to the platinum** — four stages built from the official
  descriptions: story, stranger strands, partner/robbery/free-roam, then
  the collectibles and the long grind to 100% completion.
- **Missable flags** — Positive Mental Attitude is the one trophy that can
  be missed (the Chapter 1 balcony meditation), plus a warning about the
  time-sensitive Yago race in Chapter 3. There is no mission replay, so the
  guide tells you to keep a manual save at the start of every chapter.
- **A guide for every trophy** — written in our own words, naming its
  sources beside it. Names, descriptions, grades, hidden flags and PSN
  progress targets are the official list as mirrored by
  [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/)
  and [PSNProfiles](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi),
  checked 19 November 2026. Five trophies had no confirmed unlock method at
  launch; their guides say so plainly instead of inventing one.

## Run it

No build step, no network, no install. Any static server works:

```sh
node serve.ts        # serves app/ on http://localhost:8080
```

Or open `app/index.html` through any static file server. Deep links work:
`?kind=missable`, `?grade=silver`, `?trophy=28` (open a trophy's guide),
`?spoilers=off`, and `?seed=13` ticks the first 13 roadmap trophies so you
can preview the tracker with progress.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
to the output directory and writes `dossier.json` with the vendored
`vendor/makefun-frontend.ts`.

## Files

- `app/index.html`, `app/app.js`, `app/style.css` — the guide
- `app/data/trophies.json` — the 55 official trophies with guides and sources
- `screenshots/` — real renders of the app in Chrome
- `main.ts` — the entry program · `serve.ts` — local dev server

Unofficial fan guide, not affiliated with Rockstar Games or PlayStation. No
Rockstar logo or official artwork is used.

<sub>Entered on [make.fun](https://make.fun/?ref=rdxqc0yh&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
