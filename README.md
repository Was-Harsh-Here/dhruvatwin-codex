# DhruvaTwin

Offline-first Digital Twin platform for the Indian Antarctic research stations at Maitri and Bharati.

- Team: **HackFinity**
- Problem Statement ID: **26060**
- Theme: **Smart Automation**
- Category: **Software**
- Event: **Smart India Hackathon 2026**
- Agency: **NCPOR - National Centre for Polar and Ocean Research, Ministry of Earth Sciences**

Built to monitor two Indian Antarctic research stations:

| Station | Established | Location | Coordinates |
| --- | --- | --- | --- |
| Maitri | 1989 | Schirmacher Oasis, Central Dronning Maud Land | 70°45'52"S 11°44'03"E |
| Bharati | 2012 | Larsemann Hills, North Grovnes Island | 69°24'41"S 76°11'15"E |

The two stations are 3,098 km apart. Dakshin Gangotri (buried) and the planned Maitri-II replacement are also represented in the network picture.

## What the platform does

### Separate 3D twins

Two distinct scenes, not one scene with a parameter switch.

- **Maitri** - pillar-mounted steel main station, Lake Priyadarshini with floating ice floes, the heated pipeline with pulsing cyan flow, fuel farm, lake pump house, four 62.5 kVA diesel generators, weather mast with anemometer, summer camp, Schirmacher rock formations, garage, helipad, cargo yard, balloon shed, incinerator and wind-carved sastrugi.
- **Bharati** - the 134-container main building, three CHP units, the 13-tank fuel farm with day tanks, seawater pump house with the 450 m intake, wastewater plant, laboratory module, summer camp, Thala Fjord, Quilty Bay, scattered Larsemann lakes, the 104 m outcrop, ice runway, jetty and neighbour markers for Progress (8 km) and Zhongshan.

Both scenes carry displaced terrain (800 m and 900 m aprons), an aurora band, star fields (800 and 1,200 points), snow particle systems (5,000 and 6,000 particles) and fog, plus clickable hotspots on every major object and a telemetry readout strip above the station.

### Walkable interiors

The interior is its own world, mounted instead of the exterior scene rather than inside it, so every room can be modelled at walkable detail without paying for it from outside.

- **Maitri** - 9 rooms on the entrance deck and 9 on the upper deck: entrance vestibule with the parka rail and airlock gauges, command centre with six twin-monitor consoles and the Antarctic wall map, communication room with modem rack and radio console, server room with spinning rack fans and an emergency shut-off, generator room with two fully modelled diesel sets (engine block, six injector lines, exhaust manifold, cooling fan, analogue gauges), water treatment with the reverse osmosis plant and UV steriliser, medical bay with beds, X-ray unit and ultrasound, storage with shelving, pallet racking and a folding ladder, plus living quarters with named cabins, dormitories, galley, dining mess, recreation room, gymnasium, bathrooms, laundry and stairway.
- **Bharati** - 11 rooms on each deck: atrium with skylight and glass-railed stair, command centre with a sixteen-monitor video wall, communication centre, data centre with six operating racks, power room with three CHP units behind the viewing panel, water treatment, wastewater treatment with a bubbling MBBR digester, medical bay, laboratory with four benches, fume hood and microscope, storage, workshop with centre lathe and welding station, plus living quarters with twelve cabin doors, dormitory, galley with walk-in pantry, dining mess, recreation, gymnasium, bathrooms, laundry, sauna with tiered cedar bench and Finnish stove, and the observation lounge.

Every wall, doorway and load-bearing partition is generated from one floor plan, so a gap in a wall exists only where a door was declared. Doors swing open as you approach and close behind you. Every room has a clickable light switch, and every significant object inside a room opens its own detail panel with live telemetry where the object is instrumented.

### Interactive water

Every water body carries the measurements the station acts on and can be clicked for its survey panel.

- **Lake Priyadarshini** - surface temperature, ice thickness at shore and centre, purity, pH, depth, volume, flow to station, trace heating state and days to complete freeze, with a twelve month ice coverage chart.
- **Thala Fjord** - surface temperature, salinity, ice coverage, iceberg count, mean and maximum depth, wave height, current speed and aurora reflection.
- **Quilty Bay** - temperature, ice coverage, intake status and flow, post-desalination purity and shore assets.
- **Seawater intake** - intake depth and temperature, flow, filter state, pipe integrity and the trace heating current and resistance.
- **44 Larsemann lakelets** - diameter, depth, ice thickness, water temperature, biota, distance from Bharati and last sampling date, with an overlay that ranks them by ice thickness and flags active research sites.

The surface is displaced by three superposed swell components in a custom shader, so wave height and speed come straight from the station data: a 5 cm ripple on the lake, 0.8 m whitecapped swell on the fjord. Every body has an **underwater view** showing seabed relief, boulders, fish, rising bubbles and the submerged intake line, and the fjord and bay carry an **iceberg tracker** with twenty-four hours of drift history and a dashed forecast path.

### Vehicle fleet

Twelve vehicle classes are modelled and laid out per station: PistenBully tracked snow vehicles, snowmobiles, ATV quad bikes, tracked cargo carriers, a helicopter with animated rotor, Nansen sledges, cargo sledges, snow blowers, forklifts, a mobile crane, the Zodiac boat and utility trailers. Tracks roll on the running machines, the PistenBully blade breathes through its hydraulic stroke, exhaust particulates rise while an engine runs, and every unit carries a tail number plate in its status colour. Clicking a unit opens its maintenance record: status, fuel, engine hours, days since service, hours to next service, track or blade life, capacity, range, location, driver and weather window, with start-engine, maintenance-log and assign-task actions.

### Occupants

Thirty-six crew figures walk fixed routes derived from the floor plan - corridor to room centre and back - so movement is repeatable and never crosses a partition except at a room's own doorway. Figures are colour coded by role, animate their legs and arms while walking, and report a profile on hover and click.

### Seven engineering view modes

Applied to both twins through scene-graph material overrides so every mode works everywhere.

1. **Exterior** - photographic rendering
2. **X-Ray** - buildings at 15 percent opacity with the structural frame drawn in cyan
3. **Infrared** - purple to red heat-map overlay across the station envelope
4. **Thermal** - higher contrast heat map with live temperature values pinned to each subsystem
5. **MEP / HVAC** - water cyan, electrical yellow, HVAC orange, fuel red service runs
6. **Structural** - load-bearing structure only
7. **Night** - emissive elements only, for a polar night inspection walk

### Navigation and time

- **Orbit mode** outside, **walk mode** inside: WASD, mouse look with pointer lock, Shift to sprint, Space to jump, Esc to release the pointer.
- **Mini-map** in the corner, drawing the station plot while outside and the current deck plan while inside, always with the live player marker and heading.
- **Teleport menu** (press `T`) covering both deck landings, all forty interior rooms, every water body, every vehicle unit and the camera presets.
- **Time of day** slider and season selector driving real solar geometry for each station's latitude: the midnight sun through summer, the polar night through winter, aurora opacity following the season, apron floodlights raised at night, and a **24 hour timelapse** that runs the full day in about ten seconds.

### 2.5D isometric cutaway

The station footprint is drawn as flat isometric tiles with every room of both decks extruded as a cutaway block (floor and four walls, no ceiling). The blocks are built from the same floor plans the walkable interior uses, so the cutaway and the first-person decks describe one station rather than two drawings. Live temperature, power draw, occupancy and status float above every room, colour coded by subsystem health, and selecting a block drives the same hotspot selection the 3D view uses.

### AI blackout predictor (continuity engine)

- Status widget in the top nav: `Drop predicted in X min - Y% confidence`
- Prediction surfaces in the 3D viewport overlay, the right rail card and the footer
- Telemetry charts carry a dotted orange forecast line
- **Simulate Satellite Blackout** starts a 60 second uplink loss: VSAT drops, the twin shows a red pulsing border, a critical incident is raised
- After the window closes a **reconciliation panel** compares predicted against measured uplink retention and records the delta against the target 95% accuracy

The model combines live VSAT signal-to-noise ratio, surface wind (the katabatic driver), uplink latency creep and a slow orbital geometry term.

### Antarctic Mode

A separate interface, not a theme. Pure black background, pure white text, 4 pixel white borders, bright yellow active elements, red criticals and green successes. Body text is at least 18 point, numerals 28 point, every control is at least 64 by 64 pixels and the SOS control is 200 by 200 with a red pulsing glow.

- Trigger: top nav toggle, `Ctrl+Shift+A`, or automatic activation at -20 °C or above 80 km/h wind
- Screens: Home (four large squares plus SOS), Tasks, Report Issue, Check-In, Vehicle Log, Weather and a full-screen SOS with GPS
- Field traffic is written to the priority queue before any network attempt

### MQTT and offline sync

- Broker: `broker.hivemq.com` over `wss://broker.hivemq.com:8884/mqtt`
- Topics: `dhruvatwin/telemetry/{stationId}/{sensorId}`, `dhruvatwin/telemetry/{stationId}/batch`, `dhruvatwin/alerts/{stationId}`, `dhruvatwin/sos/{stationId}`, `dhruvatwin/queue/{stationId}`
- IndexedDB outbox with priority classes **SOS 1, Critical 2, Check-in 3, Routine 4**, replayed highest-priority-first when the link returns
- A sync indicator in the top bar reports broker state, online/offline and the pending count

### Command screens (16)

Sensor Dashboard, Alert Triage and Incident Matrix, Station Dashboard with personnel roster, Microgrid and CHP Command, Local Environment with the ice velocity map, Digital Twin 3D, Antarctica Overview, Weather Extension, Antarctic Mode, NCPOR Library, NPDC Compliance Centre, Expedition Logs, Audit Trail, Equipment Catalog, Workspace and Admin Console.

### Weather extension

Open-Meteo (no API key) provides hourly temperature, wind, surface pressure and humidity for both station coordinates: a 24 hour temperature trend in cyan, a 24 hour wind trace in amber, a 7 day pressure trace in violet and a 7 day forecast strip. If the public endpoint is unreachable the page falls back to the station automatic weather station series.

### Station assistant

A Groq-powered assistant using `llama-3.3-70b-versatile`, with live station context injected on every request: telemetry channels, open incidents, continuity prediction, microgrid state and local weather. Without a Groq key the same context is answered by a deterministic local rule engine so the console stays usable.

### NPDC metadata and roles

- Metadata is auto-tagged with CF-1.11 standard names and GCMD keywords, validated against the National Polar Data Centre submission standard `NPDC-DS-01`, and exported as schema.org Dataset JSON-LD. Every export is also written to the audit chain.
- Four role views ship: **Admin**, **Commander**, **Scientist** and **Station**. The role view filters navigation, gates actions such as continuity drills and dataset publication, and changes what the console emphasises.

## Architecture

- **Frontend**: Vite, React 19, React Router, Tailwind CSS v4, shadcn/ui, Framer Motion, Recharts
- **3D**: three.js with `@react-three/fiber` and `@react-three/drei`
- **Backend and database**: Convex (queries, mutations, actions, cron jobs)
- **Auth**: Convex Auth email one-time code plus anonymous guest sessions
- **Transport**: MQTT over WebSocket to HiveMQ, IndexedDB outbox for store-and-forward

### Convex modules

| Module | Responsibility |
| --- | --- |
| `schema.ts` | Stations, telemetry, alerts, personnel, microgrid, weather, satellite passes, command logs, documents, expeditions, blackout events, NPDC exports |
| `sensors.ts` | Single source of truth for equipment, thresholds and the simulation model |
| `telemetry.ts` | Ten second simulation tick, live readings, history, alert lifecycle |
| `ops.ts` | Rosters, microgrid, weather, satellite passes, ice velocity, sixty second ops tick |
| `records.ts` | Hash-chained audit log, NCPOR library, expeditions, NPDC exports |
| `blackout.ts` | Continuity prediction, blackout simulation and reconciliation |
| `assistant.ts` | Groq station assistant with live context injection |
| `seed.ts` | Idempotent seeding of stations, telemetry, rosters, plant history, passes, library, expeditions and the audit chain |
| `crons.ts` | Ten second sensor tick and sixty second operations tick |

## Running the project

```bash
bun install
bun convex dev          # push functions and start codegen (platform-managed here)
bun tsc -b --noEmit     # typecheck
bun run dev             # vite dev server
```

The platform seeds itself: opening the dashboard runs `bootstrap.ensureSeeded` once, which creates the four stations, backfills telemetry and populates the operations data set.

### Environment

| Variable | Purpose |
| --- | --- |
| `GROQ_API_KEY` | Enables the station assistant on `llama-3.3-70b-versatile`. Without it the assistant answers from a deterministic local rule engine over the same live context. |

No key is required for Open-Meteo weather or the public HiveMQ broker.

## Demo flow for judges

1. **Land** on the public page, then enter the command centre and sign in.
2. **Sensor Dashboard** - watch the ten second tick refresh every channel; open the featured chart.
3. **Alert Triage** - read the incident matrix, acknowledge a critical, resolve a warning.
4. **Station Dashboard** - show the roster, badge state, duty board and queue a roll call.
5. **Microgrid and CHP** - show load versus supply, thermal recovery and plant advisories.
6. **Digital Twin 3D** - switch station, cycle the seven view modes, open the 2.5D cutaway, click hotspots.
7. **Continuity drill** - press Simulate Satellite Blackout, watch the red pulsing overlay for 60 seconds, then read the predicted versus actual reconciliation.
8. **Antarctic Mode** - toggle from the top bar or press Ctrl+Shift+A, send a check-in, then the SOS.
9. **Offline sync** - the sync badge shows the outbox draining to broker.hivemq.com.
10. **Weather Extension** - the Open-Meteo graphs and the 7 day forecast strip.
11. **NPDC Compliance Centre** - run the gates, export the metadata package, show the audit entry.
12. **Audit Trail** - show the head digest, verified chain and the export record you just created.
13. **Role views** - switch between Admin, Commander, Scientist and Station to show navigation and action gating.

## Verification

```bash
bun convex dev --once && bun tsc -b --noEmit
```

Both commands pass on the current tree.
