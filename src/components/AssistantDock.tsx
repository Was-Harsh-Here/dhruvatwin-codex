import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Loader2, Send, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  model?: string;
}

const SUGGESTIONS = [
  "Summarise the current continuity risk and what I should do before the drop.",
  "Which incidents are critical right now and what is the triage order?",
  "Is the water path safe at this station today?",
  "How much generation headroom does the microgrid have?",
];

/**
 * Station assistant dock.
 *
 * Every question is answered from live station context injected server side
 * (telemetry, open incidents, continuity prediction, microgrid and weather).
 * With a Groq key configured the answer comes from llama-3.3-70b-versatile;
 * without one the local rule engine answers over the same context.
 */
export function AssistantDock({
  slug,
  stationLabel,
}: {
  slug: string;
  stationLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const ask = useAction(api.assistant.ask);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open, busy]);

  const submit = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || busy) return;
    setInput("");
    setBusy(true);
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    try {
      const result = await ask({
        slug,
        question: trimmed,
        history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.answer, model: result.model },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Assistant unavailable: ${String(error).slice(0, 180)}`,
          model: "error",
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button
        variant={open ? "secondary" : "default"}
        size="sm"
        className="fixed bottom-5 right-5 z-40 shadow-lg"
        onClick={() => setOpen((v) => !v)}
      >
        <Bot className="mr-2 size-4" />
        Station assistant
      </Button>

      {open && (
        <div className="fixed bottom-0 right-0 z-50 flex h-[560px] w-full max-w-[420px] flex-col overflow-hidden border border-border bg-card shadow-2xl sm:bottom-20 sm:right-5 sm:rounded-lg">
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <span className="font-display text-sm font-bold uppercase tracking-wider">
                  Station assistant
                </span>
              </div>
              <p className="cc-mono truncate text-[10px] text-muted-foreground">
                {stationLabel} context injected - llama-3.3-70b-versatile
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close assistant"
              onClick={() => setOpen(false)}
            >
              <X className="size-4" />
            </Button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Ask about continuity risk, incidents, power headroom, the water path or the
                  local forecast. Answers are grounded in live {stationLabel} telemetry.
                </p>
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => void submit(suggestion)}
                    className="w-full rounded border border-border bg-background px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {messages.map((message, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-md border px-3 py-2 text-xs leading-relaxed",
                  message.role === "user"
                    ? "ml-6 border-primary/30 bg-primary/5 text-foreground"
                    : "mr-2 border-border bg-background text-foreground",
                )}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                {message.model && (
                  <div className="cc-mono mt-1.5 text-[9px] text-muted-foreground">
                    {message.model}
                  </div>
                )}
              </div>
            ))}

            {busy && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" />
                Reading live station context
              </div>
            )}
          </div>

          <div className="border-t border-border px-4 py-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void submit(input);
              }}
              className="flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask the station assistant"
                className="h-9 min-w-0 flex-1 rounded border border-border bg-background px-3 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50"
              />
              <Button type="submit" size="icon" disabled={busy || !input.trim()} aria-label="Send">
                <Send className="size-4" />
              </Button>
            </form>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline" className="border-border text-[9px] text-muted-foreground">
                context: telemetry + incidents + continuity + microgrid + weather
              </Badge>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
