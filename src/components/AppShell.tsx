import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import {
  PROJECT_IDENTITY,
  INSTRUMENTED_STATIONS,
  type StationSlug,
  formatUtc,
} from "@/lib/station";
import {
  Activity,
  AlertTriangle,
  Radio,
  Snowflake,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, useSearchParams } from "react-router";
import { cn } from "@/lib/utils";

/** UTC clock display for the top bar. */
function UtcClock() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  return (
    <span className="cc-mono hidden text-xs text-muted-foreground md:inline">
      {formatUtc(now)}
    </span>
  );
}

/** Top-level authenticated layout for the DhruvaTwin command centre. */
export function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const [params, setParams] = useSearchParams();
  const station = (params.get("station") === "bharati" ? "bharati" : "maitri") as StationSlug;
  const [navOpen, setNavOpen] = useState(false);

  const setStation = (slug: StationSlug) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("station", slug);
        return next;
      },
      { replace: true },
    );
  };

  const navItems = [
    { to: "/dashboard", label: "Sensor Dashboard", icon: Activity, end: true },
    { to: "/alerts", label: "Alert Triage", icon: AlertTriangle },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-sidebar transition-transform lg:static lg:translate-x-0",
          navOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex size-10 items-center justify-center rounded-md border border-primary/40 bg-primary/10">
            <Snowflake className="size-5 text-primary" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-sm font-bold tracking-wide text-foreground">
              {PROJECT_IDENTITY.name}
            </div>
            <div className="cc-label">Team {PROJECT_IDENTITY.team}</div>
          </div>
        </div>
        <Separator />
        <nav className="flex-1 space-y-1 px-3 py-4">
          <div className="cc-label px-2 pb-2">Operations</div>
          {navItems.map(({ to, label, icon: Icon, ...rest }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setNavOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )
              }
            >
              <Icon className="size-4 shrink-0" />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
          <div className="cc-label px-2 pb-2 pt-5">Modules</div>
          <div className="space-y-1 px-3">
            {[
              "Digital Twin 3D",
              "Microgrid Command",
              "NCPOR Library",
              "NPDC Compliance",
            ].map((label) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground/60"
                title="Planned for a later DhruvaTwin release"
              >
                <span className="truncate">{label}</span>
                <Badge variant="outline" className="ml-2 shrink-0 text-[10px] uppercase">
                  Later
                </Badge>
                <span className="sr-only">Planned for a later DhruvaTwin release</span>
              </div>
            ))}
          </div>
        </nav>
        <Separator />
        <div className="px-5 py-4">
          <div className="cc-label">PS {PROJECT_IDENTITY.psId} - SIH 2026</div>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            {PROJECT_IDENTITY.agency}
          </p>
        </div>
      </aside>

      {navOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setNavOpen(false)}
        />
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur md:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Toggle navigation"
            onClick={() => setNavOpen((v) => !v)}
          >
            {navOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
          <div className="flex items-center gap-1 rounded-md border border-border bg-card p-1">
            {INSTRUMENTED_STATIONS.map((s) => (
              <button
                key={s.slug}
                type="button"
                onClick={() => setStation(s.slug)}
                className={cn(
                  "cc-mono rounded px-3 py-1.5 text-xs transition-colors",
                  station === s.slug
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {s.name.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-4">
            <UtcClock />
            <Badge variant="outline" className="hidden border-primary/40 text-primary sm:inline-flex">
              <Radio className="mr-1 size-3" />
              SIM LINK
            </Badge>
            <div className="flex items-center gap-2">
              <div className="hidden text-right sm:block">
                <div className="text-xs font-medium text-foreground">
                  {user?.name ?? user?.email ?? "Operator"}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {(user as { twinRole?: string } | null)?.twinRole ?? "Scientist"}
                </div>
              </div>
              <Button variant="ghost" size="icon" aria-label="Sign out" onClick={() => void signOut()}>
                <LogOut className="size-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>

        <footer className="border-t border-border px-4 py-3 md:px-6">
          <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            <span className="font-display font-bold uppercase tracking-wider text-foreground">
              {PROJECT_IDENTITY.name}
            </span>
            <span>PS {PROJECT_IDENTITY.psId}</span>
            <span>{PROJECT_IDENTITY.event}</span>
            <span className="hidden sm:inline">{PROJECT_IDENTITY.agency}</span>
            <Link to="/" className="ml-auto hover:text-foreground">
              About the project
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
