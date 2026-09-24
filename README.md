# DhruvaTwin

**Offline-first digital twin platform for Indian Antarctic research stations.**

Built by **Team HackFinity** for **Smart India Hackathon 2026** — Problem Statement **26060**, Theme **Smart Automation**, for **NCPOR (National Centre for Polar and Ocean Research), Ministry of Earth Sciences, Government of India**.

---

## Version 1 scope (built in this release)

Per the product brief, version 1 focuses on exactly two things for scientists, scholars and NCPOR staff:

1. **Live sensor dashboard** — real-time telemetry from Maitri and Bharati.
2. **Alerts** — automated threshold alerting with a triage workflow.

Everything else from the full DhruvaTwin vision (3D digital twins, Antarctic Mode, AI blackout predictor, MQTT, offline sync, the other eight console modules) is intentionally deferred to later releases and appears in-app only as marked placeholders.

## What is working in v1

### Live sensor dashboard (`/dashboard`)

- **20+ telemetry channels per station** across six subsystems: power, thermal, life support, environment, comms, safety.
- Maitri instrumented with: 4 × 62.5 kVA diesel generators, the heated **Lake Priyadarshini** water pipeline, bus frequency, fuel farm, AWS, VSAT link, habitat and generator-bay safety sensors.
- Bharati instrumented with: 3 × 100 kVA CHP units with hot-water loops, bus frequency, seawater intake flow, fuel farm, AWS, VSAT link, habitat and generator-bay safety sensors.
- **Convex cron advances the sensor simulation every 10 seconds**; every reading is evaluated against per-sensor threshold bands (warn/crit, low/high) derived from real station equipment limits.
- KPI header row (critical / warning / nominal counts + ambient temperature), featured live chart with threshold bands (recharts), and a **sensor grid** where every channel shows value, unit, status chip and data age.
- Station switcher (MAITRI / BHARATI) in the top bar; the selection persists via the `?station=` URL parameter, so any station view is shareable.

### Alert triage (`/alerts`)

- Threshold breaches automatically raise incidents: **critical** (e.g. pipeline below 2 °C), **warning** (e.g. generator output low), **watch** (e.g. high katabatic winds).
- Deduplication: one open incident per sensor; no queue flooding while an incident is being worked.
- Filter tabs: open/resolved plus severity, scoped to the station switcher.
- **Acknowledge** claims an incident under the operator's account and stamps the time; **Resolve** closes it. If the sensor breaches again, a fresh incident is raised.

### Identity & branding (40-point checklist subset)

- Project name **DhruvaTwin** (always with the "a") on the landing page, app shell, page titles and README.
- Team **HackFinity** in the sidebar and footer of every screen.
- **PS 26060** in the sidebar and footer of the authenticated console and on the landing page.
- **SIH 2026** branding and **NCPOR / MoES** attribution across the app.
- Dark Navy Command Centre theme applied app-wide (navy `#060B14` canvas, `#0A121E` cards, `#1A2533` borders, aurora-cyan `#00E0C6` primary, amber/red/green status ramp, Montserrat/Inter/JetBrains Mono typography).

## Architecture

| Layer | Technology |
| --- | --- |
| Frontend | React 19 + Vite + TypeScript, Tailwind v4, shadcn/ui, recharts, Framer Motion |
| Routing | React Router v7 (`/`, `/auth`, `/dashboard`, `/alerts`) |
| Backend + database | Convex (stations, telemetry, alerts tables with indexes) |
| Auth | Convex Auth — email OTP + guest access, protected via `RequireAuth` |
| Scheduler | Convex cron — `simulateTick` every 10 s, prunes telemetry older than 30 min |

Key backend modules:

- `src/convex/sensors.ts` — sensor catalog, simulation dynamics, threshold bands
- `src/convex/telemetry.ts` — simulation tick, live readings, history, alert queries + acknowledge/resolve mutations
- `src/convex/seed.ts` — idempotent station seed + telemetry backfill (first dashboard load triggers it)
- `src/convex/crons.ts` — 10-second scheduler

Key frontend modules:

- `src/components/AppShell.tsx` — sidebar, top bar, station switcher, UTC clock
- `src/pages/Dashboard.tsx` — live telemetry console
- `src/pages/Alerts.tsx` — incident queue
- `src/lib/station.ts` — station constants, formatting, status colour system

## Setup

```bash
bun install
bun convex dev --once   # push backend + regenerate types
bun tsc -b --noEmit     # typecheck
bun run dev             # start the Vite dev server
```

Sign in via email OTP (or continue as guest) at `/auth`; the seed runs automatically on the first dashboard load, and the cron starts streaming telemetry from there.

## Judge demo flow (3 minutes)

1. **Landing page** — SIH 2026 + PS 26060 badges, Team HackFinity, the four-station status strip, and the capability grid mapping to the problem statement.
2. **Enter Command Centre** — sign in with email OTP (or guest). The Sensor Dashboard opens for **Maitri**.
3. **Watch it live** — KPI row and the featured **Lake Priyadarshini pipeline** chart tick every 10 seconds; the sensor grid shows 22 channels with live values and statuses.
4. **Switch to BHARATI** in the top bar — the whole console re-scopes: 3 CHP units, seawater intake, and the featured CHP chart.
5. **Alert Triage** from the sidebar — open incidents with severity filters. **Acknowledge** one (stamps your operator ID) and **Resolve** it; it moves to the resolved view.
6. Point out the threshold bands on the featured chart (amber dashed) and the status colour language (cyan nominal, amber warning, red critical) used consistently across both screens.

## What ships next (post-v1 roadmap)

The full vision — separate 3D twins for Maitri and Bharati (Lake Priyadarshini, Thala Fjord, Quilty Bay), Antarctic Mode accessibility profile, AI blackout predictor with simulation and reconciliation, MQTT telemetry transport, IndexedDB offline sync, and the remaining console modules — builds directly on the telemetry and alert foundation laid here.
