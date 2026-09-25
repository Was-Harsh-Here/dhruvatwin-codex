"use node";

import { v } from "convex/values";
import { action, type ActionCtx } from "./_generated/server";
import { api } from "./_generated/api";

/**
 * DhruvaTwin station assistant.
 *
 * Runs on Groq with llama-3.3-70b-versatile. Every request injects a live
 * station context block (telemetry, open incidents, continuity prediction,
 * microgrid state and weather) so answers are grounded in the console's own
 * data rather than generic model knowledge.
 *
 * Requires the GROQ_API_KEY environment variable. When it is absent the
 * action answers from a deterministic rule engine built on the same live
 * context so the console stays usable offline.
 */

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const STATION_FACTS: Record<string, string> = {
  maitri:
    "Maitri (1989, Schirmacher Oasis, 70\u00B045'52\"S 11\u00B044'03\"E, about 100 km inland). Steel structure on iron pillars, capacity 25 winter-over plus 40 summer. Water is drawn from Lake Priyadarshini (0.297 sq km) through a heated pipeline that can freeze in roughly 45 minutes if trace heating trips. Power: 4 x 62.5 kVA diesel generators. Nearby: Schirmacher Hills, Novo airfield 5.5 km, Novolazarevskaya (Russia).",
  bharati:
    "Bharati (2012, Larsemann Hills, North Grovnes Island, 69\u00B024'41\"S 76\u00B011'15\"E, 3,098 km from Maitri). 134 shipping containers with composite skin, capacity 47 plus 25 emergency. Power: 3 CHP units rated 100 kVA electrical and 150 kW thermal each. Fuel farm 300,000 litres in 13 tanks. Water from seawater pumps through a 450 m intake. Lab 270 sq ft. Nearby: Thala Fjord, Quilty Bay, Progress (Russia 8 km), Zhongshan (China).",
};

const SYSTEM_PROMPT = `You are the DhruvaTwin station assistant for the Indian Antarctic research programme operated by NCPOR under the Ministry of Earth Sciences.
Answer as a calm, precise operations analyst. Use only the live station context supplied and the station facts given to you.
Rules:
- Never invent sensor values, personnel names or procedures that are not in the context.
- If the context does not cover the question, say what data would be needed and where in the console it lives.
- Prefer short, structured answers: a one-line assessment, then up to four bullet actions.
- Refer to alert severities as critical, warning, watch or info.
- Units are metric; times are UTC.
- The continuity model is reported with a target 95% accuracy and must be described that way.
- Never use emojis.`;

/** Compact context block assembled from live Convex queries. */
async function buildContext(ctx: ActionCtx, slug: string): Promise<string> {
  const readings = await ctx.runQuery(api.telemetry.getLiveReadings, { slug });
  const alerts = await ctx.runQuery(api.telemetry.listAlerts, {
    openOnly: true,
    limit: 6,
  });
  const prediction = await ctx.runQuery(api.blackout.getPrediction, { slug });
  const microgrid = await ctx.runQuery(api.ops.microgridSnapshot, {
    slug,
    limit: 12,
  });
  const weather = await ctx.runQuery(api.ops.weatherHistory, { slug, limit: 3 });

  const lines: string[] = [];
  lines.push(`STATION: ${slug} - ${STATION_FACTS[slug] ?? "Indian Antarctic station"}`);
  const worst = readings.filter((r) => r.status !== "nominal");
  lines.push(
    `TELEMETRY (${readings.length} live channels, ${worst.length} outside nominal):`,
  );
  for (const r of readings.slice(0, 28)) {
    lines.push(`  ${r.equipmentId} | ${r.parameter} = ${r.value.toFixed(r.decimals)} ${r.unit} [${r.status}]`);
  }
  for (const r of worst.slice(0, 10)) {
    lines.push(`  OUT-OF-BAND ${r.equipmentId} ${r.parameter} = ${r.value.toFixed(r.decimals)} ${r.unit} [${r.status}]`);
  }
  lines.push(`OPEN INCIDENTS (${alerts.length}):`);
  for (const a of alerts) {
    lines.push(`  [${a.severity}] ${a.equipmentId}: ${a.message}${a.acknowledged ? " (acknowledged)" : ""}`);
  }
  if (prediction) {
    lines.push(
      `CONTINUITY ENGINE: risk ${prediction.riskLevel}, predicted link drop in ${prediction.minutesToDrop} min, confidence ${prediction.confidence}% (target ${prediction.accuracyTarget}% accuracy).`,
    );
    for (const d of prediction.drivers) {
      lines.push(`  driver ${d.label} = ${d.value} ${d.unit}`);
    }
    if (prediction.lastReconciliation) {
      lines.push(
        `  last reconciliation: predicted ${prediction.lastReconciliation.predictedCoverage}% vs measured ${prediction.lastReconciliation.actualCoverage}% coverage.`,
      );
    }
  }
  if (microgrid.online) {
    lines.push("MICROGRID:");
    for (const s of microgrid.sources) {
      lines.push(
        `  ${s.source}: ${s.outputKw} kW electrical, ${s.thermalKw} kW thermal, storage ${s.soc}%, station load ${s.loadKw} kW`,
      );
    }
  }
  if (weather.length) {
    const w = weather[weather.length - 1];
    lines.push(
      `LOCAL WEATHER: ${w.temperature} C, wind ${w.windSpeed} m/s at ${w.windDirection} deg, pressure ${w.pressure} hPa.`,
    );
  }
  return lines.join("\n");
}

/** Deterministic rule engine used when no Groq key is configured. */
function localAnswer(question: string, context: string): string {
  const q = question.toLowerCase();
  const critical = context.match(/\[critical\]/gi)?.length ?? 0;
  const warning = context.match(/\[warning\]/gi)?.length ?? 0;
  const riskLine = context.match(/CONTINUITY ENGINE:[^\n]*/)?.[0] ?? "";
  const windLine = context.match(/LOCAL WEATHER:[^\n]*/)?.[0] ?? "";

  if (q.includes("blackout") || q.includes("link") || q.includes("satellite") || q.includes("vsat")) {
    return [
      `Assessment: continuity engine status is read from live VSAT and wind channels. ${riskLine}`,
      "- Mitigation: switch the uplink to the Iridium SBD fallback profile before the predicted drop window.",
      "- Mitigation: flush the IndexedDB priority queue highest-first so SOS and Critical items leave the station first.",
      "- Mitigation: notify the field parties over UHF of the expected outage window.",
      "- Evidence: run the reconciliation panel after recovery to record predicted versus measured coverage.",
    ].join("\n");
  }
  if (q.includes("power") || q.includes("generator") || q.includes("chp") || q.includes("microgrid") || q.includes("load")) {
    return [
      "Assessment: microgrid state is summarised from the generation snapshot.",
      "- Check: confirm station load stays below the combined online generation capacity.",
      "- Check: rotate the duty unit if any prime mover has run continuously beyond its service window.",
      "- Check: confirm storage state of charge leaves headroom for the next blackout window.",
      "- Escalation: raise a warning incident if thermal recovery drops on any unit.",
    ].join("\n");
  }
  if (q.includes("weather") || q.includes("wind") || q.includes("temperature") || q.includes("cold")) {
    return [
      `Assessment: ${windLine}`,
      "- Check: compare wind against the katabatic blackout band before scheduling field movement.",
      "- Check: confirm trace heating on the water line is drawing nominal current.",
      "- Check: verify summer camp module seals if wind is above 25 m/s.",
      "- Escalation: Antarctic Mode activates automatically below -20 C or above 80 km/h wind.",
    ].join("\n");
  }
  if (q.includes("alert") || q.includes("incident") || q.includes("critical")) {
    return [
      `Assessment: ${critical} critical and ${warning} warning incidents are open in the current context.`,
      "- Triage: acknowledge every critical incident before touching warnings.",
      "- Triage: group repeat breaches on the same equipment tag into one incident.",
      "- Triage: confirm the actuator state recorded on each alert matches the physical plant.",
      "- Escalation: resolve only after two consecutive in-band readings for the breached channel.",
    ].join("\n");
  }
  if (q.includes("water") || q.includes("pipeline") || q.includes("freeze") || q.includes("intake")) {
    return [
      "Assessment: water-path integrity is the highest-consequence thermal dependency at both stations.",
      "- Maitri: the heated pipeline from Lake Priyadarshini can freeze in about 45 minutes if trace heating trips.",
      "- Bharati: verify the 450 m seawater intake flow before assuming a pump fault; ice blockage presents the same way.",
      "- Check: confirm the pipeline temperature channel is above its critical low band.",
      "- Escalation: treat a pipeline temperature critical as a page-immediately incident.",
    ].join("\n");
  }
  return [
    "Assessment: answering from the local rule engine over live station context.",
    `- ${critical} critical and ${warning} warning incidents are open in the current sample.`,
    riskLine ? `- ${riskLine}` : "- Continuity engine has no active prediction for this station.",
    windLine ? `- ${windLine}` : "- Local weather sample is not yet available.",
    "- Ask about blackout risk, power and microgrid, weather limits, alerts, or the water path for a focused answer.",
    "- Set the GROQ_API_KEY credential to route this question to llama-3.3-70b-versatile with the same context.",
  ].join("\n");
}

/** Ask the station assistant a question grounded in live station context. */
export const ask = action({
  args: {
    slug: v.string(),
    question: v.string(),
    history: v.optional(
      v.array(v.object({ role: v.string(), content: v.string() })),
    ),
  },
  handler: async (ctx, { slug, question, history }) => {
    const context = await buildContext(ctx, slug);
    const key = process.env.GROQ_API_KEY;

    if (!key) {
      return {
        answer: localAnswer(question, context),
        model: "dhruvatwin-local-rule-engine",
        usedFallback: true,
      };
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "system", content: `LIVE STATION CONTEXT\n${context}` },
      ...(history ?? []).slice(-6).map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
      { role: "user", content: question },
    ];

    try {
      const res = await fetch(GROQ_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages,
          temperature: 0.25,
          max_tokens: 700,
        }),
      });
      if (!res.ok) {
        const detail = await res.text();
        return {
          answer: `${localAnswer(question, context)}\n\n(Groq request returned ${res.status}; answered from the local rule engine. ${detail.slice(0, 160)})`,
          model: "dhruvatwin-local-rule-engine",
          usedFallback: true,
        };
      }
      const json = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const answer = json.choices?.[0]?.message?.content?.trim();
      if (!answer) {
        return {
          answer: localAnswer(question, context),
          model: "dhruvatwin-local-rule-engine",
          usedFallback: true,
        };
      }
      return { answer, model: GROQ_MODEL, usedFallback: false };
    } catch (error) {
      return {
        answer: `${localAnswer(question, context)}\n\n(Groq unreachable: ${String(error).slice(0, 140)})`,
        model: "dhruvatwin-local-rule-engine",
        usedFallback: true,
      };
    }
  },
});
