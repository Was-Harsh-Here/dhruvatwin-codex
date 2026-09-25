import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppShell } from "@/components/AppShell";
import { MaitriScene } from "@/components/twin/MaitriScene";
import { BharatiScene } from "@/components/twin/BharatiScene";
import {
  CameraRig,
  TwinCanvas,
  type CameraPreset,
} from "@/components/twin/twin-primitives";
import { TwoAndHalfD } from "@/components/twin/TwoAndHalfD";
import { VIEW_MODES, type ViewMode } from "@/components/twin/view-modes";
import { FLEET, VEHICLE_CLASSES, fleetCount } from "@/components/twin/VehicleFleet";
import { useBlackout } from "@/hooks/use-blackout";
import { useStationLinkContext } from "@/components/StationLinkProvider";
import {
  SUBSYSTEM_LABELS,
  formatAge,
  formatUtc,
  statusClasses,
  stationFromParams,
  type StationSlug,
} from "@/lib/station";
import { Box, Cpu, Layers, Loader2, Radio, Satellite, TriangleAlert } from "lucide-react";
import { Component, Suspense, useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router";
import { cn } from "@/lib/utils";

/** Camera presets shared by both scenes, including the focus switches. */
const PRESETS: Array<CameraPreset & { station?: StationSlug }> = [
  { id: "overview", label: "Overview", position: [190, 120, 190], target: [0, 0, 0] },
  { id: "maitri", label: "Maitri Focus", position: [70, 38, 82], target: [0, 5, 0], station: "maitri" },
  { id: "bharati", label: "Bharati Focus", position: [72, 44, 84], target: [0, 8, 6], station: "bharati" },
  { id: "aerial", label: "Aerial", position: [60, 360, 80], target: [0, 0, 0] },
  { id: "zoom", label: "Component Zoom", position: [30, 14, -42], target: [16, 2, -26] },
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
  "vehicle-fleet": {
    name: "Vehicle Fleet",
    info:
      "Twelve vehicle classes are rendered in the twin, from tracked PistenBully snow vehicles and cargo carriers to the helicopter, Nansen sledges and the Zodiac boat. Fleet state feeds the field movement planner.",
  },
  helipad: {
    name: "Helipad",
    info:
      "Rotorcraft apron with approach markings and perimeter lighting, used for medical evacuation and remote field party support.",
  },
};

/**
 * Error boundary for the WebGL scene tree.
 *
 * The renderer inside <Canvas> is its own React root, so a fault there is not
 * caught by the app-level boundary and would otherwise take the whole preview
 * down. Failing quiet keeps the command panels usable.
 */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    console.error("[Twin] 3D scene error, falling back to panels only:", error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** Digital Twin 3D view for the selected station. */
export default function Twin() {
  const [params, setParams] = useSearchParams();
  const slug = stationFromParams(params);
  const [preset, setPreset] = useState("overview");
  const [viewMode, setViewMode] = useState<ViewMode>("exterior");
  const [isometric, setIsometric] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  const readingsRaw = useQuery(api.telemetry.getLiveReadings, { slug });
  const blackout = useBlackout(slug);

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

  const link = useStationLinkContext();

  const liveChannels = active
    ? readings.filter((r) => r.equipmentId === HOTSPOT_INFO[active]?.equipmentId)
    : [];

  const stationLabel = slug === "maitri" ? "Maitri" : "Bharati";
  const activeMode = VIEW_MODES.find((m) => m.id === viewMode) ?? VIEW_MODES[0];

  const reconciliation = blackout.reconciliation ?? blackout.lastReconciliation;

  const applyPreset = (next: CameraPreset & { station?: StationSlug }) => {
    if (next.station && next.station !== slug) {
      setParams(
        (prev) => {
          const params2 = new URLSearchParams(prev);
          params2.set("station", next.station as string);
          return params2;
        },
        { replace: true },
      );
    }
    setPreset(next.id);
  };

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
              sensor values from the simulation. Seven view modes and a 2.5D isometric
              cutaway are available from the left dock.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className={cn("text-xs", isometric && "border-primary/60 text-primary")}
              onClick={() => setIsometric((v) => !v)}
            >
              <Layers className="mr-1.5 size-3.5" />
              {isometric ? "3D view" : "2.5D cutaway"}
            </Button>
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
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Viewport */}
          <Card className="cc-panel border-border p-0 shadow-none lg:col-span-3">
            <div className="relative h-[600px] w-full overflow-hidden rounded-lg">
              {isometric ? (
                <TwoAndHalfD
                  slug={slug}
                  readings={readings}
                  onSelect={setActive}
                  activeHotspot={active}
                />
              ) : (
                <TwinCanvas>
                  <SceneBoundary>
                    <Suspense fallback={null}>
                      {slug === "maitri" ? (
                        <MaitriScene
                          readings={readings}
                          onSelect={setActive}
                          activeHotspot={active}
                          viewMode={viewMode}
                        />
                      ) : (
                        <BharatiScene
                          readings={readings}
                          onSelect={setActive}
                          activeHotspot={active}
                          viewMode={viewMode}
                        />
                      )}
                      <CameraRig preset={preset} presets={PRESETS} />
                    </Suspense>
                  </SceneBoundary>
                </TwinCanvas>
              )}

              {/* View mode dock */}
              {!isometric && (
                <div className="absolute left-3 top-3 flex flex-col gap-1">
                  <span className="cc-label px-1 pb-0.5 text-[9px]">View mode</span>
                  {VIEW_MODES.map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      title={mode.hint}
                      onClick={() => setViewMode(mode.id)}
                      className={cn(
                        "rounded border px-2.5 py-1 text-left text-[10px] font-semibold uppercase tracking-wider backdrop-blur transition-colors",
                        viewMode === mode.id
                          ? "border-primary/60 bg-primary/15 text-primary"
                          : "border-border bg-[#060B14]/70 text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Camera presets */}
              {!isometric && (
                <div className="absolute left-40 top-3 flex flex-col gap-1">
                  <span className="cc-label px-1 pb-0.5 text-[9px]">Camera</span>
                  {PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className={cn(
                        "rounded border px-2.5 py-1 text-left text-[10px] font-semibold uppercase tracking-wider backdrop-blur transition-colors",
                        preset === p.id
                          ? "border-primary/60 bg-primary/15 text-primary"
                          : "border-border bg-[#060B14]/70 text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Connectivity overlay */}
              <div
                className={cn(
                  "absolute right-3 top-3 rounded border px-3 py-2 backdrop-blur",
                  blackout.active
                    ? "border-[#FF3B47]/70 bg-[#3A1218]/85"
                    : "border-[#00E0C6]/40 bg-[#060B14]/80",
                )}
              >
                <div className="flex items-center gap-2">
                  <Satellite
                    className={cn(
                      "size-3.5",
                      blackout.active ? "text-[#FF3B47]" : "text-[#3EE07F]",
                    )}
                  />
                  <span className="cc-label text-[9px]">
                    {blackout.active ? "BLACKOUT" : "VSAT NOMINAL"}
                  </span>
                </div>
                <div className="cc-mono mt-1 text-[10px] text-foreground">
                  {blackout.active
                    ? `restore in ${blackout.remainingSec}s`
                    : `drop predicted in ${blackout.minutesToDrop} min - ${blackout.confidence}% confidence`}
                </div>
                <div className="cc-mono text-[9px] text-muted-foreground">
                  MQTT {link.status} - {link.pending} queued
                </div>
              </div>

              {/* Red pulsing border during blackout */}
              {blackout.active && (
                <div className="pointer-events-none absolute inset-0 animate-pulse rounded-lg ring-4 ring-inset ring-[#FF3B47]" />
              )}

              {/* Legend */}
              <div className="absolute bottom-3 left-3 flex items-center gap-3 rounded border border-border bg-[#060B14]/70 px-3 py-1.5 backdrop-blur">
                <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="size-2 rounded-full bg-[#00E0C6]" /> Hotspot
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="size-2 rounded-full bg-[#FF3B47]" /> Selected
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="size-2 rounded-full bg-[#FFB020]" /> AI forecast
                </span>
                <span className="cc-mono text-[10px] text-muted-foreground">
                  {isometric ? "click a room block" : "drag to orbit - scroll to zoom"}
                </span>
              </div>

              {/* Mode hint */}
              <div className="absolute bottom-3 right-3 max-w-[240px] rounded border border-border bg-[#060B14]/80 px-3 py-1.5 backdrop-blur">
                <div className="cc-label text-[9px]">
                  {isometric ? "2.5D isometric cutaway" : activeMode.label}
                </div>
                <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">
                  {isometric
                    ? "Terrain as flat tiles with each room extruded as a cutaway block and live data floating above it."
                    : activeMode.hint}
                </p>
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
                            <div
                              key={r.equipmentId + r.parameter}
                              className="flex items-center justify-between gap-2"
                            >
                              <span className="truncate text-xs text-muted-foreground">
                                {r.parameter}
                              </span>
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

            {/* AI continuity engine */}
            <Card
              className={cn(
                "cc-panel shadow-none",
                blackout.riskLevel === "imminent" || blackout.riskLevel === "high"
                  ? "border-[#FFB020]/50"
                  : "border-border",
              )}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider">
                  <Cpu className="size-4 text-[#FFB020]" />
                  AI Continuity Engine
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                {!blackout.ready ? (
                  <div className="flex h-16 items-center justify-center">
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-baseline justify-between">
                      <span className="text-muted-foreground">Link drop</span>
                      <span className="cc-mono text-lg text-foreground">
                        {blackout.minutesToDrop} min
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="cc-mono text-lg text-[#FFB020]">
                        {blackout.confidence}%
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-muted-foreground">Risk level</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] uppercase",
                          blackout.riskLevel === "imminent"
                            ? "border-[#FF3B47]/50 text-[#FF3B47]"
                            : blackout.riskLevel === "high"
                              ? "border-[#FFB020]/50 text-[#FFB020]"
                              : "border-[#3EE07F]/50 text-[#3EE07F]",
                        )}
                      >
                        {blackout.riskLevel}
                      </Badge>
                    </div>
                    <div className="space-y-1 border-t border-border pt-2">
                      {blackout.drivers.map((driver) => (
                        <div key={driver.label} className="flex items-center justify-between gap-2">
                          <span className="truncate text-muted-foreground">{driver.label}</span>
                          <span className="cc-mono text-[10px] text-foreground">
                            {driver.value}
                            {driver.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="cc-mono border-t border-border pt-2 text-[10px] leading-relaxed text-muted-foreground">
                      {blackout.model} - target {blackout.accuracyTarget}% accuracy -{" "}
                      {blackout.eventCount} events recorded
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="cc-panel border-border shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider">
                  <Radio className="size-4 text-primary" />
                  Station link
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">MQTT broker</span>
                  <span className="cc-mono text-[10px] text-foreground">{link.broker}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Link state</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] uppercase",
                      link.status === "connected"
                        ? "border-[#3EE07F]/50 text-[#3EE07F]"
                        : "border-[#FFB020]/50 text-[#FFB020]",
                    )}
                  >
                    {link.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Published frames</span>
                  <span className="cc-mono text-[10px] text-foreground">{link.published}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Offline queue</span>
                  <span className="cc-mono text-[10px] text-foreground">
                    {link.pending} (SOS {link.byPriority[1] ?? 0})
                  </span>
                </div>
                {readingsRaw === undefined ? (
                  <div className="flex h-12 items-center justify-center">
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-1.5 border-t border-border pt-2">
                    {(
                      ["power", "thermal", "life_support", "environment", "comms", "safety"] as const
                    ).map((sub) => {
                      const group = readingsRaw.filter((r) => r.subsystem === sub);
                      const worst = group.some((c) => c.status === "critical")
                        ? "critical"
                        : group.some((c) => c.status === "warning")
                          ? "warning"
                          : group.some((c) => c.status === "watch")
                            ? "watch"
                            : group.length > 0
                              ? "nominal"
                              : "offline";
                      const cls = statusClasses(worst);
                      return (
                        <div
                          key={sub}
                          className="flex items-center justify-between gap-2 border-b border-border pb-1 last:border-0"
                        >
                          <span className="text-muted-foreground">
                            {SUBSYSTEM_LABELS[sub] ?? sub}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn("text-[10px] uppercase", cls.text, cls.border)}
                          >
                            {worst}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Continuity actions and reconciliation */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="cc-panel border-border shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-sm font-bold uppercase tracking-wider">
                Continuity drill
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs leading-relaxed text-muted-foreground">
                Runs a {blackout.durationSec} second satellite blackout on {stationLabel}. The VSAT
                channel drops, the twin overlays a red pulsing border, telemetry switches to the
                forecast line and a critical incident is raised. When the window closes the
                platform reconciles predicted against measured coverage.
              </p>
              <Button
                variant="outline"
                className="w-full border-[#FF3B47]/60 text-[#FF3B47] hover:bg-[#FF3B47]/10"
                disabled={blackout.active || blackout.busy}
                onClick={() => void blackout.start()}
              >
                <TriangleAlert className="mr-2 size-4" />
                {blackout.active
                  ? `Blackout active - ${blackout.remainingSec}s remaining`
                  : "Simulate Satellite Blackout"}
              </Button>
              {blackout.active && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-muted-foreground"
                  onClick={() => void blackout.stop()}
                >
                  End early and reconcile
                </Button>
              )}
            </CardContent>
          </Card>

          <Card
            className={cn(
              "cc-panel shadow-none lg:col-span-2",
              reconciliation ? "border-[#3EE07F]/40" : "border-border",
            )}
          >
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-sm font-bold uppercase tracking-wider">
                Reconciliation - predicted vs actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!reconciliation ? (
                <p className="text-xs text-muted-foreground">
                  No reconciliation yet. Run a continuity drill to compare the model forecast
                  with the coverage measured during the outage.
                </p>
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <div className="cc-label">Predicted</div>
                      <div className="cc-mono text-xl text-[#FFB020]">
                        {reconciliation.predictedCoverage}%
                      </div>
                    </div>
                    <div>
                      <div className="cc-label">Measured</div>
                      <div className="cc-mono text-xl text-[#3EE07F]">
                        {reconciliation.actualCoverage}%
                      </div>
                    </div>
                    <div>
                      <div className="cc-label">Delta</div>
                      <div
                        className={cn(
                          "cc-mono text-xl",
                          reconciliation.delta <= 5 ? "text-[#3EE07F]" : "text-[#FFB020]",
                        )}
                      >
                        {reconciliation.delta} pp
                      </div>
                    </div>
                  </div>
                  <p className="leading-relaxed text-muted-foreground">{reconciliation.note}</p>
                  <p className="cc-mono text-[10px] text-muted-foreground">
                    reconciled {formatUtc(reconciliation.endedAt)} - target {blackout.accuracyTarget}%
                    accuracy
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Fleet inventory */}
        <Card className="cc-panel border-border shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-sm font-bold uppercase tracking-wider">
              Vehicle fleet - {fleetCount(slug)} units in {FLEET[slug]?.length ?? 0} classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {VEHICLE_CLASSES.map((cls) => {
                const entry = (FLEET[slug] ?? []).find((f) => f.id === cls.id);
                if (!entry) return null;
                return (
                  <div
                    key={cls.id}
                    className="flex items-center justify-between rounded border border-border bg-card px-3 py-2"
                  >
                    <span className="text-xs text-muted-foreground">{cls.label}</span>
                    <span className="cc-mono text-sm text-foreground">{entry.count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
