# DhruvaTwin Platform

**A living digital twin of India's Antarctic research stations.**

Built by **Team HackFinity** for **Smart India Hackathon 2026** — Problem Statement **26060**, Theme **Smart Automation**, for **NCPOR (National Centre for Polar and Ocean Research), Ministry of Earth Sciences, Government of India**.

DhruvaTwin Platform mirrors the Maitri and Bharati stations in software: interactive 3D station twins, a live sensor grid, automated alert triage, a searchable equipment catalog, and operator-contributed content — a dark, technical, developer-facing platform for partner organisations working with NCPOR.

---

## What's in the platform

### Digital Twin 3D (`/twin`)

- **Separate interactive 3D twins for Maitri and Bharati** built with react-three-fiber.
- **Maitri scene**: pillar-mounted main station with sloped roof, lit windows and orange trim; **Lake Priyadarshini** with animated water, ice rim and floating floes; the **pulsing heated pipeline** (freeze-critical); fuel farm with fill indicators; four vibrating diesel generators with status LEDs; weather mast with spinning anemometer and wind vane; lake pump house with rotating impeller; summer camp modules; Schirmacher rock hills; windsock toward Novo airfield; antenna mast with dishes.
- **Bharati scene**: 8x5 interlocked container station with 40 lit windows and yellow door; three CHP units with exhaust stacks, heat-exchanger coils and pulsing status panels; **13-tank fuel farm** plus yellow day tanks; seawater pump house with the 450 m intake run; wastewater plant with rising steam; laboratory module; 15-module summer camp; **Thala Fjord** and **Quilty Bay** water bodies; 30+ scattered lakes; Larsemann Hills outcrops; Progress and Zhongshan distance markers.
- Both scenes: displaced terrain (not flat), aurora ribbons, star fields, drifting snowfall, distance fog, cool directional sun with warm window lighting, clickable **hotspots on every major object**, and **six camera presets** (Overview, Aerial, Station Focus, Systems Focus, Water Focus, Component Zoom).
- A **live telemetry strip** floats above each station showing real sensor values, colour-coded by status; clicking a hotspot opens a detail panel wired to the live channels for that equipment.

### Live sensor dashboard (`/dashboard`)

- 20+ telemetry channels per station across power, thermal, life support, environment, comms and safety.
- Convex cron advances the sensor simulation every 10 seconds; every reading is evaluated against per-sensor threshold bands (warn/crit, low/high).
- KPI header row, featured live chart with threshold bands, and a sensor grid with value, unit, status chip and data age per channel.
- Station switcher (MAITRI / BHARATI) persists via the `?station=` URL parameter.

### Alert triage (`/alerts`)

- Threshold breaches automatically raise incidents; one open incident per sensor (no queue flooding).
- Filter by open/resolved and severity, scoped to the station switcher.
- **Acknowledge** claims an incident under the operator's account; **Resolve** closes it.

### Equipment catalog (`/catalog` + `/equipment/:id`)

- Searchable, filterable registry generated directly from the sensor definitions — what the catalog shows is exactly what the platform instruments.
- Each equipment page has an overview, spec table, telemetry threshold summary, **live channel cards with charts**, and an operator field-notes thread with **comments**.

### Workspace (`/workspace`)

- Publish **observations, maintenance logs or questions** against any instrumented equipment tag.
- Your contributions list with links to the equipment pages and one-click remove.
- Everything carries operator attribution and appears in the equipment-page discussion.

### Admin console (`/admin`)

- Account management: view every operator and change their role (admin / commander / scientist / station).
- Content moderation: review everything published across the programme and remove entries.
- Server-enforced admin gate on every query and mutation.

### Alert triage, landing and identity

- Landing page with SIH 2026 + PS 26060 badges, station status strip, and platform capabilities.
- **DhruvaTwin Platform** naming, **Team HackFinity** and **NCPOR / MoES** attribution in the sidebar and footer of every screen.
- Dark Navy Command Centre theme app-wide (navy `#060B14` canvas, `#0A121E` cards, `#1A2533` borders, aurora-cyan `#00E0C6` primary, amber/red/green status ramp, Montserrat / Inter / JetBrains Mono typography).

## Architecture

| Layer | Technology |
| --- | --- |
| Frontend | React 19 + Vite + TypeScript, Tailwind v4, shadcn/ui, recharts, Framer Motion |
| 3D | three.js + @react-three/fiber + @react-three/drei (custom scene library in `src/components/twin/`) |
| Routing | React Router v7: `/`, `/auth`, `/dashboard`, `/alerts`, `/twin`, `/catalog`, `/equipment/:id`, `/workspace`, `/admin` |
| Backend + database | Convex (stations, telemetry, alerts, stationNotes, noteComments tables with indexes) |
| Auth | Convex Auth — email OTP + guest access, protected via `RequireAuth`, roles on the users table |
| Scheduler | Convex cron — `simulateTick` every 10 s, prunes telemetry older than 30 min |

Key modules:

- `src/convex/sensors.ts` — sensor catalog, simulation dynamics, threshold bands
- `src/convex/telemetry.ts` — simulation tick, live readings, history, alert queries + acknowledge/resolve
- `src/convex/admin.ts` — notes, comments, moderation, user listing, role management
- `src/convex/seed.ts` / `bootstrap.ts` — idempotent station seed + telemetry backfill
- `src/convex/crons.ts` — 10-second scheduler
- `src/components/twin/twin-primitives.tsx` — terrain, aurora, snow, hotspots, lighting, camera rig
- `src/components/twin/MaitriScene.tsx` / `BharatiScene.tsx` — the two station twins
- `src/lib/catalog.ts` — equipment metadata joining the sensor catalog

## Setup

```bash
bun install
bun convex dev --once   # push backend + regenerate types
bun tsc -b --noEmit     # typecheck
bun run dev             # start the Vite dev server
```

Sign in via email OTP (or continue as guest) at `/auth`; the seed runs automatically on the first dashboard load, and the cron starts streaming telemetry from there.

## Demo flow (3 minutes)

1. **Landing page** — SIH 2026 + PS 26060 badges, Team HackFinity, station status strip, capability grid.
2. **Enter Command Centre** — sign in with email OTP (or guest). The Sensor Dashboard opens for **Maitri**.
3. **Watch it live** — KPIs and the featured **Lake Priyadarshini pipeline** chart tick every 10 seconds; the sensor grid shows 22 live channels.
4. **Digital Twin 3D** from the sidebar — orbit the **Maitri** twin, click the pipeline hotspot to see its live temperature, run through the camera presets. Switch to **Bharati** and tour the container station, CHP units, fuel farm and fjord.
5. **Equipment Catalog** — search "CHP", open a CHP unit's page, see live channels and thresholds, open the discussion and post a comment.
6. **Workspace** — publish a field observation against any equipment tag; see it appear on the equipment page.
7. **Alert Triage** — acknowledge and resolve an incident; then **Admin Console** to manage roles and moderate content.
