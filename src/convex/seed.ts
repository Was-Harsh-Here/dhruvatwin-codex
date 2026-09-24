import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { sensorDefsFor, simulateValue } from "./sensors";

/**
 * Idempotent seed of the four Indian Antarctic stations. Safe to call again:
 * existing slugs are left untouched. Maitri and Bharati get backfilled
 * telemetry so dashboards have history on first load.
 */
export const seedStations = internalMutation({
  args: { now: v.number() },
  handler: async (ctx, { now }) => {
    const stationSeeds = [
      {
        slug: "maitri",
        name: "Maitri",
        latitude: -70.7644,
        longitude: 11.7342,
        builtYear: 1989,
        capacity: 25,
        status: "operational",
        region: "Schirmacher Oasis, Central Dronning Maud Land",
      },
      {
        slug: "bharati",
        name: "Bharati",
        latitude: -69.4114,
        longitude: 76.1875,
        builtYear: 2012,
        capacity: 47,
        status: "operational",
        region: "Larsemann Hills, North Grovnes Island",
      },
      {
        slug: "dakshin-gangotri",
        name: "Dakshin Gangotri",
        latitude: -70.7492,
        longitude: 11.6681,
        builtYear: 1983,
        capacity: 0,
        status: "buried",
        region: "Central Dronning Maud Land (ice shelf)",
      },
      {
        slug: "maitri-ii",
        name: "Maitri-II (Planned)",
        latitude: -70.75,
        longitude: 11.7,
        builtYear: 2030,
        capacity: 60,
        status: "planned",
        region: "Schirmacher Oasis (replacement station)",
      },
    ];

    let seeded = 0;
    let maitriId: Id<"stations"> | null = null;
    let bharatiId: Id<"stations"> | null = null;

    for (const seed of stationSeeds) {
      const existing = await ctx.db
        .query("stations")
        .withIndex("by_slug", (q) => q.eq("slug", seed.slug))
        .unique();
      if (existing) {
        if (seed.slug === "maitri") maitriId = existing._id;
        if (seed.slug === "bharati") bharatiId = existing._id;
        continue;
      }
      const id = await ctx.db.insert("stations", seed);
      if (seed.slug === "maitri") maitriId = id;
      if (seed.slug === "bharati") bharatiId = id;
      seeded += 1;
    }

    if (!maitriId || !bharatiId) {
      return { seeded, backfilled: 0 };
    }

    // Backfill ~25 minutes of history at 30-second steps for both stations.
    const stationsToSeed: Array<{ id: Id<"stations">; slug: string }> = [
      { id: maitriId, slug: "maitri" },
      { id: bharatiId, slug: "bharati" },
    ];

    let backfilled = 0;
    const existingRows = await ctx.db.query("telemetry").take(1);
    if (existingRows.length === 0) {
      const steps = 50; // 50 x 30s = 25 minutes
      for (const st of stationsToSeed) {
        const defs = sensorDefsFor(st.slug);
        for (let i = steps; i >= 1; i -= 1) {
          const t = now - i * 30_000;
          for (const def of defs) {
            await ctx.db.insert("telemetry", {
              stationId: st.id,
              subsystem: def.subsystem,
              equipmentId: def.equipmentId,
              sensorId: def.sensorId,
              parameter: def.parameter,
              value: simulateValue(def, t, Math.random),
              unit: def.unit,
              qualityFlag: "good",
              timestamp: t,
            });
            backfilled += 1;
          }
        }
      }
    }

    return { seeded, backfilled };
  },
});
