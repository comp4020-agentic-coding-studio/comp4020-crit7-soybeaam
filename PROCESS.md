# Process overview

## What I built

A campus room-finder: a full-screen MapLibre map of ANU buildings that opens a
Teams-style side panel of room availability when you click a marker, backed by
real bookings in SQLite. `README.md` covers what the app does; this is how it
got there.

## How I got here

The starter already had a campus map and a full booking flow
([`568cd3f`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-soybeaam/commit/568cd3f),
[`a9b1abd`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-soybeaam/commit/a9b1abd)).
This week's brief was to stop redirecting on marker click and show live
availability in place, like the Microsoft Teams room panel.

I had an agent explore the existing map, routing, DB schema and CSS
conventions first, so the build could reuse what was there (the existing
`/api/rooms.json` endpoint, the progressive-enhancement pattern from the
calendar component) instead of inventing a parallel structure. I then used the
`orchestrator` subagent to build the panel end to end — component, wiring,
styles, tests — and to run a browsing/booking user-story check and a code
review against its own work before reporting back
([`b1153af`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-soybeaam/commit/b1153af)).
That review caught real issues (focus order on repeated clicks, a duplicate
status lookup, available rooms not sorted first) that got fixed before I saw
the result, which is the main reason I lean on orchestrated review for
anything with keyboard/focus behaviour — I don't reliably think to test that
by hand.

I ran the app locally after every change rather than trusting the type
checker alone — that's how a stale Vite dependency cache that silently broke
the map (dependencies 404ing under `/node_modules/.vite/deps/`) got caught
and fixed by clearing the cache and restarting, not by CI.

Building on the panel, I added real building photos in place of the CSS
placeholder in the marker hover card
([`e50db9b`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-soybeaam/commit/e50db9b))
and filled in map coordinates for buildings that had none yet
([`dfafa56`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-soybeaam/commit/dfafa56)).

The current in-progress change removes the building card list in favour of a
full-viewport map with a help section underneath, and upgrades the panel from
a single point-in-time status to a real "available now / until…" read of the
day's actual bookings rather than static placeholder text — again via
`orchestrator`, with review before I look at it. That work isn't committed
yet, so it isn't cited here; this file will grow to cover it once it lands.

## Before you ship

Checked against `pnpm check:evidence`'s requirements as this file grows.
