import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

/**
 * Advance the DhruvaTwin sensor simulation every 10 seconds: new telemetry
 * rows for both instrumented stations plus threshold alert evaluation.
 */
crons.interval(
  "sensor simulation tick",
  { seconds: 10 },
  internal.telemetry.simulateTick,
);

export default crons;
