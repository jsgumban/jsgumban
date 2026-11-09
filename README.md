# Hi, I'm John Hel Gumban 👋

Senior full-stack developer, 10+ years building production web apps with **React, Next.js, TypeScript and Node.js**, and more recently **Python** tooling for audio/video processing and automation. I've worked with teams across the UK, Netherlands and Australia on healthcare, fintech and brand projects.

> **A note on my contribution graph:** most of my professional work over the last decade lives in private repositories owned by the companies and clients I've worked for, so it isn't visible here. My public activity is mainly personal projects and open-source contributions, and doesn't reflect the full scope of my day-to-day engineering work. I'm happy to walk through past work in detail on request.

### Open source

- **[recharts](https://github.com/recharts/recharts)**: fixing the tooltip band cursor so `ComposedChart` with `<Bar>` highlights the hovered category like `BarChart` does ([PR #8183](https://github.com/recharts/recharts/pull/8183), fixes [#3645](https://github.com/recharts/recharts/issues/3645))
- **[recharts](https://github.com/recharts/recharts)** *(merged)*: regression tests that pin down two long-open bugs already fixed in 3.x: active dots clipped under `allowDataOverflow`, and single-datum stacked bars ([PR #8185](https://github.com/recharts/recharts/pull/8185), closes [#2608](https://github.com/recharts/recharts/issues/2608), [#2136](https://github.com/recharts/recharts/issues/2136))
- **[xyflow / React Flow](https://github.com/xyflow/xyflow)**: fixing smooth step edges so `borderRadius` stays constant instead of shrinking when nodes are close together ([PR #6123](https://github.com/xyflow/xyflow/pull/6123), fixes [#4751](https://github.com/xyflow/xyflow/issues/4751))
- **[dnd-kit](https://github.com/clauderic/dnd-kit)**: fixing dragged items being offset by their own CSS margins, with a Playwright regression test ([PR #2177](https://github.com/clauderic/dnd-kit/pull/2177), fixes [#2092](https://github.com/clauderic/dnd-kit/issues/2092))
- **[dnd-kit](https://github.com/clauderic/dnd-kit)**: fixing `dragmove` events reporting the position from before the move, which made keyboard dragging lag one step behind ([PR #2180](https://github.com/clauderic/dnd-kit/pull/2180), fixes [#1991](https://github.com/clauderic/dnd-kit/issues/1991))
- **[dnd-kit](https://github.com/clauderic/dnd-kit)**: fixing sortable animations overshooting inside a scaled parent (e.g. a zoomable canvas), with a Playwright regression test ([PR #2184](https://github.com/clauderic/dnd-kit/pull/2184), fixes [#2041](https://github.com/clauderic/dnd-kit/issues/2041))

### What I'm building

| Project | What it does | Stack |
|---|---|---|
| [court-stuff](https://github.com/jsgumban/court-stuff) | Monorepo for my tennis court community. `court-bills` splits a night's lights/visitor costs per game and tracks who has paid. Local-first with optional Supabase sync. | React · TypeScript · Vite · Supabase |
| [highlight-reel](https://github.com/jsgumban/highlight-reel) | Scores every half-second of a long video on five signals (loudness, audio novelty, speech energy, motion, cut density) and renders ranked highlight clips plus a supercut. | Python · NumPy · SciPy · ffmpeg |
| [tennis-hit-clipper](https://github.com/jsgumban/tennis-hit-clipper) | Finds ball impacts in a training video's audio (band-pass + adaptive MAD threshold) and cuts a 50-min session into rally clips. | Python · SciPy · ffmpeg |
| [yt-outlier-finder](https://github.com/jsgumban/yt-outlier-finder) | Niche-research CLI: finds YouTube videos that pulled 5×+ their channel's median views on small channels. | Python · yt-dlp |

### Toolbox

React · Next.js · TypeScript · Redux · Tailwind · Vue · Node.js · Express · GraphQL · Python · PHP/Laravel · PostgreSQL/Supabase · MongoDB · Docker
