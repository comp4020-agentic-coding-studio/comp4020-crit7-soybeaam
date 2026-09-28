# Website reference

Palette and reusable assets for the ANU Room Finder layout. Full styles live in
`src/styles.css`; this is the quick lookup.

## Colour palette

ANU's brand set. Black and white carry the page; gold is a highlight, used
sparingly (nav accent, status dots, hover) — never as a large fill.

| Swatch | Value | Variable | Use |
|---|---|---|---|
| ⬛ | `#000000` | `--colour-black` | Nav bar, primary text, buttons |
| ⬜ | `#FFFFFF` | `--colour-white` | Page background, button/nav text |
| 🟨 | `#BE830E` | `--colour-gold` | Highlight only — nav underline, hover states, map building outline |
| 🟫 | `#F5EDDE` | `--colour-gold-tint` | Card and map background wash |
| ⬜ | `#333333` | `--colour-unigrey` | Body text, meta text |

Status colours (not brand colours — used only for room availability):

| Status | Text | Background |
|---|---|---|
| Available | `#1E6B3D` | `#E3F0E6` |
| Busy | `#A13324` | `#F3E2DE` |
| Closed | `#5A5A5A` | `#ECECEC` |

## Asset dictionary

Reusable components, `src/components/`:

| Asset | File | Usage |
|---|---|---|
| Layout | `Layout.astro` | Page shell: nav bar + `<main>`. Every page wraps in this. |
| StatusBadge | `StatusBadge.astro` | Coloured pill showing a room's `available` / `busy` / `closed` status. |
| RoomCard | `RoomCard.astro` | One room row: name, capacity, note, and a `StatusBadge`. |

Shared CSS classes, `src/styles.css`:

| Class | Usage |
|---|---|
| `.site-nav` | Black nav bar with gold underline, used on every page |
| `.card` / `.card-list` | Gold-tint panel used for room rows and building summaries |
| `.badge`, `.badge-available`, `.badge-busy`, `.badge-closed` | Status pill colouring |
| `.campus-map`, `.map-legend` | The MapLibre campus map container on the homepage |
| `.map-marker`, `.marker-pin`, `.marker-card` | Building marker (a link to the building page), its pin, and the hover/focus card (image placeholder, name, rooms available) |
| `.back-link` | "Back to campus map" link on a building page |

## Data

Building and room data (mock, for this prototype) lives in `src/lib/campus.ts`.
Each building has a list of rooms and an optional `lngLat` (GeoJSON
`[lng, lat]` order). Only buildings with a `lngLat` get a map marker; every
building appears in the list under the map and has its own building page.

## Map tiles

The map is MapLibre GL JS (`src/pages/index.astro`, style in
`src/lib/map-style.ts`) reading `public/maps/anu.pmtiles`, a self-hosted
extract of the Protomaps OpenStreetMap basemap. The app's own server provides
the file, so the map makes no third-party requests at runtime. The style
has no text labels, so it needs no glyph or sprite files. To regenerate it
with the [go-pmtiles](https://github.com/protomaps/go-pmtiles) CLI:

```sh
pmtiles extract https://build.protomaps.com/20260928.pmtiles public/maps/anu.pmtiles \
  --bbox=149.100,-35.292,149.138,-35.262 --maxzoom=15
```

Keep the bbox larger than the map's `maxBounds` so the edges never go blank.
Map data © OpenStreetMap contributors (ODbL), credited in the map's
attribution control.
