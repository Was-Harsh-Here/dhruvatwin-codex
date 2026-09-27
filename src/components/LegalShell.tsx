import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { PROJECT_IDENTITY } from "@/lib/station";
import { cn } from "@/lib/utils";

/** One numbered section of a legal document. */
export interface LegalSection {
  id: string;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

const PAGES = [
  { id: "terms", label: "Terms and Conditions", to: "/terms" },
  { id: "privacy", label: "Privacy Policy", to: "/privacy" },
] as const;

/**
 * Public document frame used by both legal pages.
 *
 * Deliberately plain: a sticky table of contents on the left, the document on
 * the right, and the same brand footer as the landing page, so the pages read
 * as part of the product rather than an afterthought.
 */
export function LegalShell({
  current,
  title,
  lede,
  updated,
  sections,
}: {
  current: (typeof PAGES)[number]["id"];
  title: string;
  lede: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Back to {PROJECT_IDENTITY.name}
          </Link>
          <nav className="ml-auto flex items-center gap-1">
            {PAGES.map((page) => (
              <Link
                key={page.id}
                to={page.to}
                className={cn(
                  "rounded border px-2.5 py-1 text-[11px] transition-colors",
                  current === page.id
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                )}
              >
                {page.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="cc-label">{PROJECT_IDENTITY.name} - legal</div>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">{lede}</p>
        <p className="cc-mono mt-2 text-[11px] text-muted-foreground">Last updated {updated}</p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <div className="cc-panel rounded border border-border bg-card p-4">
              <div className="cc-label mb-2 text-[10px]">Contents</div>
              <ol className="space-y-1.5">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="text-[11px] leading-snug text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {index + 1}. {section.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </aside>

          <div className="space-y-8">
            {sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-24 border-l-2 border-primary/40 pl-4"
              >
                <h2 className="font-display text-base font-bold uppercase tracking-wider text-foreground">
                  {index + 1}. {section.heading}
                </h2>
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 48)}
                    className="mt-2 text-sm leading-relaxed text-muted-foreground"
                  >
                    {paragraph}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="mt-3 space-y-1.5">
                    {section.bullets.map((bullet) => (
                      <li
                        key={bullet.slice(0, 48)}
                        className="text-sm leading-relaxed text-muted-foreground"
                      >
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            <div className="rounded border border-border bg-card p-4">
              <div className="cc-label text-[10px]">Contact</div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Questions about these documents go to Team {PROJECT_IDENTITY.team} through the
                workspace inside {PROJECT_IDENTITY.name}, or to {PROJECT_IDENTITY.agency} as the
                problem statement partner. We answer requests about access, correction and deletion
                of personal data through the same channel.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border">
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
