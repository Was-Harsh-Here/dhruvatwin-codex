import { action } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Idempotent bootstrap: ensures the station catalog exists and telemetry is
 * backfilled. Called once from the dashboard when the station list is empty.
 */
export const ensureSeeded = action({
  args: {},
  handler: async (ctx) => {
    await ctx.runMutation(internal.seed.seedStations, { now: Date.now() });
    return { ok: true };
  },
});
