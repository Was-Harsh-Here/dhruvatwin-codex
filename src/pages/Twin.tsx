import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppShell } from "@/components/AppShell";
import { MaitriScene } from "@/components/twin/MaitriScene";
import { BharatiScene } from "@/components/twin/BharatiScene";
import { CameraRig, TwinCanvas, type CameraPreset } from "@/components/twin/twin-primitives";
import { SUBSYSTEM_LABELS, formatAge, statusClasses, stationFromParams } from "@/lib/station";
import { Box, Loader2 } from "lucide-react";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { cn } from "@/lib/utils";

/** Camera presets shared by both scenes. */
const PRESETS: CameraPreset[] = [
  { id: "overview", label: "Overview", position: [150, 95, 150], target: [0, 0, 0] },
  { id: "aerial", label: "Aerial", position: [40, 300, 60], target: [0, 0, 0] },
  { id: "station", label: "Station Focus", position: [55, 30, 70], target: [0, 6, 0] },
  { id: "systems", label: "Systems Focus", position: [80, 26, -60], target: [30, 4, -20] },
  { id: "water", label: "Water Focus", position: [-90, 40, 130], target: [-50, 0, 60] },
  { id: "zoom", label: "Component Zoom", position: [26, 12, -38], target: [16, 2, -26] },
];

/** Hotspot detail copy for both stations. */
const HOTSPOT_INFO: Record<string, { name: string; info: string; equipmentId?: string }> = {
  "main-station": {
    name: "Main Station",
    info:
      "Habitation and command core. Habitat temperature and CO2 channels are watched against life-support bands; the building itself houses the operations room this console mirrors.",
  },
  lake: {
    name: "Lake Priyadarshini",
    info:
      "Water source for the station, 0.297 square kilometres. The heated pipeline runs from here; its temperature channel is the freeze-critical one.",
    equipmentId: "PIPE-MAITRI",
  },
  pipeline: {
    name: "Heated Pipeline",
    info:
      "Carries water from the lake. If trace heating trips, the line can freeze in roughly 45 minutes, so the temperature band is tight and critical alerts page immediately.",
    equipmentId: "PIPE-MAITRI",
  },
  fuel: {
    name: "Fuel Farm",
    info:
      "Bulk fuel storage with hydrocarbon leak detection. Level and leak channels are monitored against environmental safety bands.",
    equipmentId: "FUEL-MAITRI",
  },
  generators: {
    name: "Diesel Generators",
    info:
      "Four 62.5 kVA units carrying the station load. Output per unit is tracked; sustained low output raises a warning incident.",
    equipmentId: "GEN-1",
  },
  weather: {
    name: "Weather Mast",
    info:
      "Automatic weather station: temperature, wind and pressure feed both the environment channels and the decision context across the console.",
    equipmentId: "AWS-MAITRI",
  },
  "summer-camp": {
    name: "Summer Camp",
    info:
      "Containerised accommodation for the summer campaign, when station complement expands well beyond the winter-over crew.",
  },
  chp: {
    name: "CHP Units",
    info:
      "Three combined heat and power units, 100 kVA electrical plus 150 kW thermal each. Output and hot-water loop temperature are both instrumented.",
    equipmentId: "CHP-1",
  },
  seawater: {
    name: "Seawater Pump House",
    info:
      "Draws water through a 450-metre intake. Flow below the warning band means ice blockage or pump trouble and triggers an incident.",
    equipmentId: "SWPUMP-BHARATI",
  },
  wastewater: {
    name: "Wastewater Treatment",
    info:
      "On-site treatment before discharge. Instrumented for process health; steam plumes are normal operation.",
  },
  laboratory: {
    name: "Laboratory Module",
    info:
      "Science workspace with regulated power. Silhouettes on the roof are atmospheric instruments serving the research programme.",
  },
  fjord: {
    name: "Thala Fjord",
    info:
      "The fjord Bharati overlooks. Sea state and ice here drive the seawater intake the station depends on.",
  },
  bay: {
    name: "Quilty Bay",
    info:
      "Second water body on the shoreline. Small lakes across the Larsemann Hills are also modelled in the terrain.",
  },
};

/** Digital Twin 3D view for the selected station. */
export default function Twin() {
  const [params] = useSearchParams();
  const slug = stationFromParams(params);
  const [preset, setPreset] = useState("overview");
  const [active, setActive] = useState<string | null>(null);

  const readingsRaw = useQuery(api.telemetry.getLiveReadings, { slug });

  const readings = useMemo(
    () =>
      (readingsRaw ?? []).map((r) => ({
        equipmentId: r.equipmentId,
        parameter: r.parameter,
        value: r.value,
        unit: r.unit,
        decimals: r.decimals,
        status: r.status,
      })),
    [readingsRaw],
  );

  const liveChannels = active
    ? readings.filter((r) => r.equipmentId === HOTSPOT_INFO[active]?.equipmentId)
    : [];

  const stationLabel = slug === "maitri" ? "Maitri" : "Bharati";

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="cc-label">Digital Twin</div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">
              {stationLabel} 3D twin
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Interactive scale model of the station. Cyan markers are clickable and open a
              live telemetry panel; the amber readout strip above the station streams real
              sensor values from the simulation.
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-md border border-border bg-card p-1">
            {(["maitri", "bharati"] as const).map((s) => (
              <Button
                key={s}
                asChild
                variant="ghost"
                size="sm"
                className={cn(
                  "cursor-pointer text-xs",
                  slug === s && "bg-primary/15 text-primary",
                )}
              >
                <a href={`/twin?station=${s}`}>{s === "maitri" ? "Maitri" : "Bharati"}</a>
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Viewport */}
          <Card className="cc-panel border-border p-0 shadow-none lg:col-span-3">
            <div className="relative h-[560px] w-full overflow-hidden rounded-lg">
              <TwinCanvas>
                <Suspense fallback={null}>
                  {slug === "maitri" ? (
                    <MaitriScene
                      readings={readings}
                      onSelect={setActive}
                      activeHotspot={active}
                    />
                  ) : (
                    <BharatiScene
                      readings={readings}
                      onSelect={setActive}
                      activeHotspot={active}
                    />
                  )}
                  <CameraRig preset={preset} presets={PRESETS} />
                </Suspense>
              </TwinCanvas>

              {/* Camera preset dock */}
              <div className="absolute left-3 top-3 flex flex-col gap-1">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPreset(p.id)}
                    className={cn(
                      "rounded border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur transition-colors",
                      preset === p.id
                        ? "border-primary/60 bg-primary/15 text-primary"
                        : "border-border bg-[#060B14]/70 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Legend */}
              <div className="absolute bottom-3 left-3 flex items-center gap-3 rounded border border-border bg-[#060B14]/70 px-3 py-1.5 backdrop-blur">
                <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="size-2 rounded-full bg-[#00E0C6]" /> Hotspot
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="size-2 rounded-full bg-[#FF3B47]" /> Selected
                </span>
                <span className="cc-mono text-[10px] text-muted-foreground">drag to orbit - scroll to zoom</span>
              </div>
            </div>
          </Card>

          {/* Right rail */}
          <div className="space-y-4">
            <Card className="cc-panel border-border shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider">
                  <Box className="size-4 text-primary" />
                  Hotspot detail
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!active ? (
                  <p className="text-sm text-muted-foreground">
                    Click a cyan marker in the scene to inspect that part of the station.
                  </p>
                ) : (
                  <>
                    <div className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
                      {HOTSPOT_INFO[active]?.name ?? active}
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {HOTSPOT_INFO[active]?.info ?? "Station subsystem."}
                    </p>
                    {liveChannels.length > 0 && (
                      <div className="space-y-2 border-t border-border pt-2">
                        {liveChannels.map((r) => {
                          const cls = statusClasses(r.status);
                          return (
                            <div key={r.equipmentId + r.parameter} className="flex items-center justify-between gap-2">
                              <span className="truncate text-xs text-muted-foreground">{r.parameter}</span>
                              <span className={cn("cc-mono text-sm", cls.text)}>
                                {r.value.toFixed(r.decimals)}
                                {r.unit}
                              </span>
                            </div>
                          );
                        })}
                        {readingsRaw && readingsRaw.length > 0 && (
                          <div className="cc-mono text-[10px] text-muted-foreground">
                            as of {formatAge(Math.max(...readingsRaw.map((r) => r.timestamp)))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="cc-panel border-border shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-sm font-bold uppercase tracking-wider">
                  Station link status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                {readingsRaw === undefined ? (
                  <div className="flex h-12 items-center justify-center">
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  (["power", "thermal", "life_support", "environment", "comms", "safety"] as const).map((sub) => {
                    const channels = readingsRaw.filter((r) => r.subsystem === sub);
                    const worst =
                      channels.some((c) => c.status === "critical")
                        ? "critical"
                        : channels.some((c) => c.status === "warning")
                          ? "warning"
                          : channels.some((c) => c.status === "watch")
                            ? "watch"
                            : channels.length > 0
                              ? "nominal"
                              : "offline";
                    const cls = statusClasses(worst);
                    return (
                      <div key={sub} className="flex items-center justify-between gap-2 border-b border-border pb-1.5 last:border-0">
                        <span className="text-muted-foreground">{SUBSYSTEM_LABELS[sub] ?? sub}</span>
                        <Badge variant="outline" className={cn("text-[10px] uppercase", cls.text, cls.border)}>
                          {worst}
                        </Badge>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
