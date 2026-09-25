import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { PROJECT_IDENTITY } from "@/lib/station";
import { cn } from "@/lib/utils";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Box,
  ClipboardList,
  Cpu,
  FileCheck2,
  Globe2,
  Layers,
  PenSquare,
  Radio,
  Shield,
  Snowflake,
  Thermometer,
  Truck,
  Users,
  Wind,
} from "lucide-react";
import { Link } from "react-router";

/** Aurora ribbon backdrop rendered with pure CSS gradients. */
function AuroraBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute -top-32 left-1/4 h-[420px] w-[720px] rounded-full opacity-25 blur-3xl"
        style={{
          background: "radial-gradient(closest-side, #00E0C6 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute -top-16 right-0 h-[360px] w-[560px] rounded-full opacity-20 blur-3xl"
        style={{
          background: "radial-gradient(closest-side, #4A9EFF 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-40 left-0 h-[300px] w-[480px] rounded-full opacity-15 blur-3xl"
        style={{
          background: "radial-gradient(closest-side, #3EE07F 0%, transparent 70%)",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,transparent_0%,#060B14_75%)]" />
    </div>
  );
}

/** One animated station strip on the landing hero. */
function StationStrip() {
  const stations = useQuery(api.telemetry.listStations, {});
  const seeded = stations !== undefined && stations.length > 0;

  const rows = [
    { name: "Maitri", detail: "Schirmacher Oasis - est. 1989", status: "operational" },
    { name: "Bharati", detail: "Larsemann Hills - est. 2012", status: "operational" },
    { name: "Dakshin Gangotri", detail: "Ice shelf - est. 1983", status: "buried" },
    { name: "Maitri-II", detail: "Planned replacement station", status: "planned" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.6 }}
      className="mx-auto mt-12 w-full max-w-3xl"
    >
      <Card className="border-border bg-card/80 backdrop-blur">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <span className="cc-label">Indian Antarctic Stations - Live Status</span>
            <span className="cc-mono text-[10px] text-muted-foreground">
              {seeded ? "NCPOR network" : "loading"}
            </span>
          </div>
          <div className="grid sm:grid-cols-2">
            {rows.map((r, i) => (
              <div
                key={r.name}
                className={cn(
                  "flex items-center justify-between gap-3 px-5 py-4",
                  i < rows.length - 1 && "border-b border-border sm:border-b-0",
                  i % 2 === 0 && "sm:border-r",
                )}
              >
                <div>
                  <div className="text-sm font-semibold text-foreground">{r.name}</div>
                  <div className="text-[11px] text-muted-foreground">{r.detail}</div>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] uppercase tracking-wider",
                    r.status === "operational" && "border-[#3EE07F]/40 text-[#3EE07F]",
                    r.status === "buried" && "border-[#6B7A8F]/40 text-muted-foreground",
                    r.status === "planned" && "border-[#4A9EFF]/40 text-[#4A9EFF]",
                  )}
                >
                  {r.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/** DhruvaTwin public landing page. */
export default function Landing() {
  const { isLoading, isAuthenticated } = useAuth();

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <AuroraBackdrop />

      {/* Nav */}
      <header className="relative z-10">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md border border-primary/40 bg-primary/10">
              <Snowflake className="size-5 text-primary" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-sm font-bold tracking-wide text-foreground">
                {PROJECT_IDENTITY.name} Platform
              </div>
              <div className="cc-label">Team {PROJECT_IDENTITY.team}</div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            {isLoading ? (
              <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
            ) : isAuthenticated ? (
              <Button asChild className="cursor-pointer">
                <Link to="/dashboard">
                  Command Centre
                  <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild className="cursor-pointer">
                <Link to="/auth?returnTo=%2Fdashboard">
                  Enter Command Centre
                  <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-16">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
              <Badge variant="outline" className="border-primary/40 text-primary">
                PS {PROJECT_IDENTITY.psId}
              </Badge>
              <Badge variant="outline" className="border-border text-muted-foreground">
                {PROJECT_IDENTITY.event}
              </Badge>
              <Badge variant="outline" className="border-border text-muted-foreground">
                Theme: {PROJECT_IDENTITY.theme}
              </Badge>
            </div>
            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-6xl">
              A living <span className="text-primary">digital twin</span> of India&apos;s{" "}
              Antarctic stations
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              DhruvaTwin Platform mirrors Maitri and Bharati in software: separate 3D twins
              with seven engineering view modes and a 2.5D cutaway, a live sensor grid,
              automated alert triage, an AI continuity engine that predicts satellite
              blackouts, Antarctic Mode for ground staff, and an offline-first MQTT link that
              keeps reporting through a katabatic outage. Built for NCPOR, Ministry of Earth
              Sciences, and the research community that depends on it.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="cursor-pointer">
                <Link to={isAuthenticated ? "/dashboard" : "/auth?returnTo=%2Fdashboard"}>
                  {isAuthenticated ? "Open Dashboard" : "Launch the Console"}
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="cursor-pointer">
                <Link to="/alerts">Preview Alert Triage</Link>
              </Button>
            </div>
          </motion.div>

          <StationStrip />

          {/* Capability grid */}
          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Box,
                title: "Separate station twins",
                body: "Maitri and Bharati are distinct 3D scenes with lake, fjord and bay water bodies, 100 plus objects each and clickable hotspots wired to live telemetry.",
              },
              {
                icon: Layers,
                title: "Seven view modes",
                body: "Exterior, X-Ray, Infrared, Thermal, MEP/HVAC, Structural and Night, plus a 2.5D isometric cutaway with rooms, occupancy and data overlays.",
              },
              {
                icon: Cpu,
                title: "AI blackout predictor",
                body: "A continuity engine forecasts the next satellite link drop with confidence, and a 60 second drill reconciles predicted against measured coverage.",
              },
              {
                icon: Radio,
                title: "MQTT and offline queue",
                body: "Telemetry, alerts and field traffic publish to broker.hivemq.com, buffered in an IndexedDB queue ranked SOS, Critical, Check-in, Routine.",
              },
              {
                icon: Snowflake,
                title: "Antarctic Mode",
                body: "A separate high-contrast interface for ground staff: pure black, 18 point body text, 64 pixel targets and a 200 pixel SOS control.",
              },
              {
                icon: Activity,
                title: "Live sensor grid",
                body: "Twenty-plus telemetry channels per station refresh every ten seconds, with threshold bands and status carried on every reading.",
              },
              {
                icon: AlertTriangle,
                title: "Alert triage matrix",
                body: "An incident matrix breaks open alerts out by subsystem and severity. Acknowledge, work and resolve with provenance on every action.",
              },
              {
                icon: Wind,
                title: "Weather and environment",
                body: "Open-Meteo forecast and reanalysis charted for both stations, with the local ice velocity field and the satellite pass schedule.",
              },
              {
                icon: Users,
                title: "Roster and microgrid",
                body: "Personnel badges, UHF channels and duty shifts alongside CHP load, thermal recovery, storage state of charge and plant advisories.",
              },
              {
                icon: Globe2,
                title: "Antarctica overview",
                body: "All four Indian sites on one sector map: Maitri, Bharati, Dakshin Gangotri and the planned Maitri-II, 3,098 km apart.",
              },
              {
                icon: BookOpen,
                title: "NCPOR library",
                body: "Treaty instruments, Ministry policy, NPDC data standards, field manuals and scientific reports, tagged and searchable.",
              },
              {
                icon: FileCheck2,
                title: "NPDC dataset export",
                body: "Metadata is auto-tagged with CF standard names and GCMD keywords, validated against the submission standard and written to the audit chain.",
              },
              {
                icon: ClipboardList,
                title: "Expedition logs",
                body: "The full ISEA series from 1981-82 to the current season with the hosting station, programme focus and personnel strength.",
              },
              {
                icon: Shield,
                title: "Audit trail",
                body: "A rolling hash chain over every command. Recomputed digests detect any edit, insertion or reordering of history.",
              },
              {
                icon: Truck,
                title: "Vehicle fleet",
                body: "Twelve vehicle classes modelled in the twins, from PistenBully snow vehicles and cargo carriers to the helicopter and the Zodiac boat.",
              },
              {
                icon: PenSquare,
                title: "Community contributions",
                body: "Partner organisations publish field observations, maintenance logs and questions, and discuss them on the equipment page, with a Groq-powered assistant on tap.",
              },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
              >
                <Card className="cc-panel h-full border-border shadow-none transition-colors hover:border-ring/50">
                  <CardContent className="p-5">
                    <div className="flex size-9 items-center justify-center rounded-md border border-primary/30 bg-primary/10">
                      <f.icon className="size-4 text-primary" />
                    </div>
                    <h3 className="mt-3 font-display text-sm font-bold uppercase tracking-wider text-foreground">
                      {f.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Identity strip */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-16"
          >
            <Card className="border-border bg-card/60">
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="flex items-center gap-3">
                  <Snowflake className="size-5 text-primary" />
                  <div>
                    <div className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
                      {PROJECT_IDENTITY.name} by Team {PROJECT_IDENTITY.team}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Built for {PROJECT_IDENTITY.agency}
                    </div>
                  </div>
                </div>
                <Separator className="hidden w-px sm:block" orientation="vertical" />
                <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
                  <span>
                    <span className="cc-mono block text-base text-foreground">26060</span>
                    Problem Statement ID
                  </span>
                  <span>
                    <span className="cc-mono block text-base text-foreground">SIH 2026</span>
                    Smart India Hackathon
                  </span>
                  <span>
                    <span className="cc-mono block text-base text-foreground">2</span>
                    Stations instrumented
                  </span>
                  <span>
                    <span className="cc-mono block text-base text-foreground">16</span>
                    Command screens
                  </span>
                  <span>
                    <span className="cc-mono block text-base text-foreground">46</span>
                    Expeditions logged
                  </span>
                  <span>
                    <span className="cc-mono block text-base text-foreground">12</span>
                    Vehicle classes
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-5 text-xs text-muted-foreground sm:px-6">
          <span className="font-display font-bold uppercase tracking-wider text-foreground">
            {PROJECT_IDENTITY.name}
          </span>
          <span>Team {PROJECT_IDENTITY.team}</span>
          <span>PS {PROJECT_IDENTITY.psId}</span>
          <span>{PROJECT_IDENTITY.event}</span>
          <span>{PROJECT_IDENTITY.agency}</span>
        </div>
      </footer>
    </div>
  );
}
