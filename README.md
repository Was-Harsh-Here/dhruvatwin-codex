# DhruvaTwin

Offline-first Digital Twin platform for the Indian Antarctic research stations at Maitri and Bharati.

- Team: **HackFinity007**
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

### Wildlife and the expedition member

Both twins carry a living wildlife layer, switchable from the Layers menu and clickable in the scene.

- **Twenty-two species**, each with a real field-guide entry: Adelie, emperor, chinstrap and gentoo penguins; Weddell, crabeater and leopard seals; humpback, minke and killer whales; hourglass dolphins; Antarctic icefish, toothfish, krill, sea spiders and oasis lake invertebrates; snow petrels, south polar skuas, Antarctic petrels, Antarctic terns, cape petrels and Wilson's storm petrels.
- **Placed honestly.** Bharati sits on the coast, so it carries the marine fauna: three penguin colonies with chicks, seals on the floes, a leopard seal cruising the waterline, whales and dolphins at the ice edge, a krill swarm, fish, seafloor sea spiders and six seabird groups including two nesting ledges. Maitri is 100 km inland, so it gets what genuinely lives on the oasis: flyers riding the ridge line, terns flying in to bathe at the lake margin, storm petrels in the rock crevices and copepods, rotifers and tardigrades in Lake Priyadarshini. Each species card states where it is seen and carries a link to the station where it is modelled.
- **Interactive models.** Click any group for its species card: Latin name, length, mass, diet, status, four field facts, how many animals are modelled in that scene and a live sighting log read from the `sightings` table. Recording a sighting writes the count, the location and the observer to the station record and appends an audit-chain entry, and the card carries a chip per colony in the scene so switching species is one click.
- **Cute by design.** The penguins are deliberately pushed towards the appealing end of the proportions - plump bodies, oversized heads, wide-set eyes with a glint, rosy cheeks - and they blink, hop, waddle and look around, with fluffy grey chicks following the adults. The species markings stay correct (Adelie eye ring, emperor neck patch, chinstrap strap, gentoo bonnet), so the models remain identifiable.
- **Dev Khandhediya, expedition member.** The expedition systems and digital twin administrator is modelled in both places. Outdoors he stands with the Adelie colony on the Bharati shore, or with the flyers at Maitri, and waves at intervals; indoors he is seated at his own admin desk in the command room of both stations, with the sensor ingest, MQTT bridge and offline outbox on the screen. Clicking either one opens the same profile card, and the card carries **Go to his desk inside** and **Stand with him outside**: the desk jump lands you in the command room facing him.

### Seven engineering view modes

Applied to both twins through scene-graph material overrides so every mode works everywhere.

1. **Exterior** - photographic rendering
2. **X-Ray** - buildings at 15 percent opacity with the structural frame drawn in cyan
3. **Infrared** - purple to red heat-map overlay across the station envelope
4. **Thermal** - higher contrast heat map with live temperature values pinned to each subsystem
5. **MEP / HVAC** - water cyan, electrical yellow, HVAC orange, fuel red service runs
6. **Structural** - load-bearing structure only
7. **Night** - emissive elements only, for a polar night inspection walk

### Free camera, drone tour and map detail

- **Free camera by default.** A camera preset flies the camera once, over about a second, and then releases it completely. Nothing writes to the camera while the operator works, so a drag, pan or zoom stays exactly where it is left. Manual input cancels an in-flight preset, and any preset can be re-flown from the Camera menu (including **Reset to overview**). Drag orbits, right-drag pans, scroll zooms, closer and further than before.
- **Drone tour mode.** A scripted flight over each station with ten or eleven narrated stops: the site, the station structure, power, water, fuel, weather, field support, wildlife and the expedition member, the water features and interiors. The panel carries the written briefing, the facts behind the stop, dwell progress, pause, previous, next, restart and half, normal or double speed; taking control hands the camera straight back to free view.
- **Survey layer.** A 20 m graticule with bold 100 m lines, 25/50/100/200 m range rings with distance labels, contour rings around each raised sector and a north rose, all switchable. Layer switches for labels, survey and hotspots live in the Layers menu and apply to the live scene without rebuilding it.
- **Detailed station plot.** The mini-map graticule is drawn to scale with range rings, a north arrow, a 50 m scale bar, labelled water bodies and every plotted structure. Clicking a block opens its hotspot and flies the matching viewpoint; clicking a lake opens its water panel.
- **Decluttered viewport.** Seven view modes, the camera presets and the layer switches live in three compact menus instead of open columns, the legend and context line share one block, and labels, survey and hotspot markers can each be turned off independently.
- **Labels are removable, and off by default where they cluttered the view.** Ambient titles - the green telemetry strip over a station, the amber airlock marker, the neighbouring-station name, room name plates - sit behind a **Place titles and telemetry strips** switch that starts off, so the scene is clean on load and still in walk mode, where nothing floats over anything until the switch is on. Everything else (hover labels, object panels) is one key away: press `L` or the `labels on/off` chip to strip every floating label and put it back, and the interior view has a `Hide labels` button.
- **Walk the site on foot.** The exterior has a **Walk the site** button as well as orbit: click the canvas for pointer lock, then WASD to walk the apron, Shift to sprint, Space to jump, mouse to look. The hull, fuel farm and summer camp block you out, the fjord and the oasis lake fence you off so nobody walks on water, a boundary keeps a walk on the map, and the amber airlock marker still drops you inside. Distance walked counts towards the field badge.

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

### Cascade drill (failure propagation)

One equipment trigger propagates through the station's real dependency graph, and the operator's isolation plan changes the outcome rather than the wording around it.

- Each station has its own graph: Maitri runs from the fuel farm through four 62.5 kVA generators, the PDU, the critical bus, the thermal plant, the heated lake pipeline, the habitat envelope, VSAT, the AWS and detection; Bharati runs from 13 fuel tanks through three CHP units, the distribution grid, the emergency bus, the thermal loop, the 450 m seawater intake, the desalination and wastewater plants, the container envelope, the laboratory and detection.
- Nodes carry redundancy (none, N+1, dual), a consequence weight and a real isolation time. Redundancy attenuates propagation; isolation stops it.
- The screen draws the graph by tier, colours every node by state, highlights the propagation path, and lists the timeline with time to impact, probability, path and the isolation procedure for each node.
- Outputs: nodes reached, response window in minutes, crew-risk node, resilience index, and a recommendation naming the node to protect first.
- Every drill is stored with the full propagation and appended to the audit chain, and a drill at warning or above raises the crew-risk node as a real incident in triage.

### Repair bay and FPGA self-healing

**Telemetry repair.** The fault queue is derived from the live channels: out of band, dropped (no sample inside the window), drifting toward a warn limit, or flagged by signal quality. Each fault carries the field procedure written out step by step. Applying a repair closes the matching incidents, writes a corrected sample back inside the operating band so the plant really does report nominal again, records the work in the repair log and appends an entry to the hash-chained audit log.

**FPGA self-healing verification.** A real simulation, not a progress bar: it builds a 256 frame bitstream held in triple modular redundancy, injects single-event upsets into individual copies, runs the bitwise majority voter, runs the scrubber and re-verifies every frame against its own CRC signature.

- Verdicts: **PASS** only when no single-bit upset reaches the logic and no corruption slips past the CRC. Two upsets in one copy are physically unrepairable by voting and are reported as detected-uncorrectable rather than hidden.
- Reported: trials, corrected by vote, corrected by scrub, frames rewritten, double-bit events repaired, detected-uncorrectable, undetected, mean and worst scrub time, plus the per-trial table.
- A **scrub interval planner** computes the upsets expected between passes, the double-bit risk and the recommended maximum scrub interval, then passes or fails the configured interval against it.
- Verdicts can be recorded to the station record and the audit chain.

### Resupply voyage tracker (Google Maps and Google Earth)

- Three modelled voyages: the Cape Town to Bharati relief, the Cape Town to Maitri relief and the inter-station Bharati to Maitri leg, from real route geometry with waypoints, notes and discharge plans.
- Live position, course and compass, distance run and remaining in nautical miles and kilometres, day of voyage, schedule margin, ice state against the plotted ice edge, planned arrival and passage progress, all computed from the route, the speed and the time.
- Noon reports with position, distance run, average speed, wind, swell and air temperature, with the ice-edge crossing marked.
- Cargo manifest and vessel particulars for the modelled charter vessel.
- **Google Maps** satellite embed centred on the ship or any waypoint, **Google Earth** deep link, and route links to the destination station. The embed is keyless, so the tracker works with no configuration; adding `VITE_GOOGLE_MAPS_API_KEY` upgrades it to the Maps JavaScript API.
- A built-in route chart drawn by the twin from the same geometry used for the position, so the ship marker cannot drift away from the numbers. Ice edge, graticule, waypoints, port and destination are all plotted and clickable.

### Field badge (gamification)

The twin keeps a progression layer over everything you do in it, stored in local storage so it survives a reload and works offline.

- **Eighteen badges in four tracks**: Explorer (walk 100 m and 500 m outside, stand in ten and twenty-five rooms, visit both stations, use teleport, step inside), Naturalist (open five species cards, record a sighting, stand with Dev outside, find him at his admin desk), Operator (watch three drone tour stops, open the 2.5D cutaway, open the resupply tracker, flush the offline queue) and Resilience (run a cascade drill, apply a repair, run the FPGA self-test).
- **Experience, levels and a progress bar** are shown in the Field badge card in the twin's right rail, with the locked badges still stating what they ask for, so the list doubles as a list of things to go and do. Winning a badge raises a toast with its XP.
- A reset button clears progress for a clean demo.

### Terms and privacy

Two public legal documents, `/terms` and `/privacy`, written against what the platform actually does: what DhruvaTwin is and is not (a prototype with simulated data, not an operational system), acceptable use, the third parties it talks to, what is collected and why, retention, and the rights a user has. They are linked from the landing footer and from every signed-in footer.

### Command screens (19)

Sensor Dashboard, Alert Triage and Incident Matrix, Station Dashboard with personnel roster, Microgrid and CHP Command, Local Environment with the ice velocity map, Digital Twin 3D, Antarctica Overview, Weather Extension, Antarctic Mode, Cascade Drill, Repair Bay, Resupply Voyage, NCPOR Library, NPDC Compliance Centre, Expedition Logs, Audit Trail, Equipment Catalog, Workspace and Admin Console.

### Weather extension

Open-Meteo (no API key) provides hourly temperature, wind, surface pressure and humidity for both station coordinates: a 24 hour temperature trend in cyan, a 24 hour wind trace in amber, a 7 day pressure trace in violet and a 7 day forecast strip. If the public endpoint is unreachable the page falls back to the station automatic weather station series.

### Station assistant

A Groq-powered assistant using `llama-3.3-70b-versatile`, with live station context injected on every request: telemetry channels, open incidents, continuity prediction, microgrid state and local weather.

- **General questions are answered too.** The assistant decides what a question needs: operational questions are grounded in live context and never invent sensor values; general questions (polar science, engineering, history, definitions, writing help) are answered properly from the model's own knowledge; mixed questions get both parts. Station context is supplied, not forced into unrelated answers.
- **Responsiveness.** Greetings, identity, console how-to and topic help are answered locally in the same tick with no round trip. A server answer types itself out at reading speed instead of painting in one block, the wait shows staged status text, and every answer is stamped with its model and elapsed time. Ctrl/Cmd + K opens the dock, Escape closes it, and the last answer can be copied or the last question retried in one click.
- **Offline.** Without a Groq key a deterministic rule engine answers over the same live context, backed by a built-in polar reference set covering the Antarctic Treaty, katabatic wind, TMR and single-event upsets, polar water systems, NPDC metadata, generator maintenance, sea ice and the station history.

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
| `schema.ts` | Stations, telemetry, alerts, personnel, microgrid, weather, satellite passes, command logs, documents, expeditions, blackout events, NPDC exports, cascade runs, repair log, wildlife sightings, self-tests |
| `sensors.ts` | Single source of truth for equipment, thresholds and the simulation model |
| `telemetry.ts` | Ten second simulation tick, live readings, history, alert lifecycle |
| `ops.ts` | Rosters, microgrid, weather, satellite passes, ice velocity, sixty second ops tick |
| `records.ts` | Hash-chained audit log, NCPOR library, expeditions, NPDC exports |
| `blackout.ts` | Continuity prediction, blackout simulation and reconciliation |
| `cascadeGraph.ts` | Pure dependency model and deterministic propagation engine, shared by the server and the console |
| `cascade.ts` | Cascade drill execution, persistence and audit logging |
| `repairs.ts` | Telemetry repair procedures, repair log, FPGA self-test recording |
| `wildlife.ts` | Species sighting log per station, census and per-species totals read by the twin's species cards |
| `assistant.ts` | Groq station assistant with live context injection and general knowledge |
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
| `GROQ_API_KEY` | Enables the station assistant on `llama-3.3-70b-versatile`. Without it the assistant answers from a deterministic local rule engine and a built-in polar reference set over the same live context. |
| `VITE_GOOGLE_MAPS_API_KEY` | Optional. Upgrades the resupply screen from the keyless Google Maps embed to the Maps JavaScript API. |

No key is required for Open-Meteo weather, the keyless Google Maps and Google Earth links, or the public HiveMQ broker.

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
13. **Drone tour** - in the twin, pick Drone Tour and let it narrate two or three stops, then switch to Exterior and drag to show the camera is free.
14. **Cascade Drill** - trigger the generator hall at critical, run it, then tick the isolation points in the plan and watch the response window and resilience index move before recording the drill.
15. **Repair Bay** - open a fault, read the procedure, apply it and show the incident closing and the channel returning to band; then run the FPGA self-test and read the PASS verdict and the scrub interval verdict.
16. **Resupply Voyage** - show the ship mid-passage, the noon reports, the route chart and the Google Maps and Google Earth links.
17. **Wildlife and the expedition member** - in the twin, click the Adelie colony for its species card, record a sighting, then press **Go to his desk inside** to land in the command room facing Dev Khandhediya at his admin desk, and click the desk to open the same card indoors.
18. **Walk the site and the field badge** - back outside, press **Walk the site**, click the canvas and walk the apron; then open the Field badge card in the right rail to show the level, the XP bar and the badge just won.
19. **Station assistant** - press Ctrl/Cmd + K, ask an operational question, then ask a general one to show it answers both.
20. **Role views** - switch between Admin, Commander, Scientist and Station to show navigation and action gating.

## Verification

```bash
bun convex dev --once && bun tsc -b --noEmit
```

Both commands pass on the current tree.
