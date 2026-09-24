import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

/**
 * DhruvaTwin operator roles (v1):
 * - admin: full access, can manage users and thresholds
 * - commander: mission overview across stations
 * - scientist: read/write access to telemetry, alerts and analysis
 * - station: standard station personnel account
 */
export const DHruvaTwinRoles = {
  ADMIN: "admin",
  COMMANDER: "commander",
  SCIENTIST: "scientist",
  STATION: "station",
} as const;

export const twinRoleValidator = v.union(
  v.literal(DHruvaTwinRoles.ADMIN),
  v.literal(DHruvaTwinRoles.COMMANDER),
  v.literal(DHruvaTwinRoles.SCIENTIST),
  v.literal(DHruvaTwinRoles.STATION),
);

/** Alert severity ramp used across the dashboard. */
export const severityValidator = v.union(
  v.literal("critical"),
  v.literal("warning"),
  v.literal("watch"),
  v.literal("info"),
);

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove

      // DhruvaTwin extensions
      twinRole: v.optional(twinRoleValidator),
      stationId: v.optional(v.id("stations")),
      organisation: v.optional(v.string()),
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // add other tables here

    /**
     * Antarctic research stations. Seeded with the four Indian stations;
     * v1 dashboards focus on Maitri and Bharati.
     */
    stations: defineTable({
      slug: v.string(), // "maitri", "bharati", "dakshin-gangotri", "maitri-ii"
      name: v.string(),
      latitude: v.number(),
      longitude: v.number(),
      builtYear: v.optional(v.number()),
      capacity: v.optional(v.number()),
      status: v.string(), // "operational" | "seasonal" | "buried" | "planned"
      region: v.string(),
    }).index("by_slug", ["slug"]),

    /**
     * Rolling live telemetry produced by the station sensor simulation.
     * Kept to a working window via prunes so the table stays small.
     */
    telemetry: defineTable({
      stationId: v.id("stations"),
      subsystem: v.string(), // power | thermal | life_support | environment | comms | safety
      equipmentId: v.string(), // e.g. "GEN-1", "CHP-2", "AWS-MAITRI"
      sensorId: v.string(), // e.g. "power.output_kw", "thermal.cabin_temp"
      parameter: v.string(), // display label
      value: v.number(),
      unit: v.string(),
      qualityFlag: v.string(), // "good" | "suspect" | "offline"
      timestamp: v.number(),
    })
      .index("by_station_sensor", ["stationId", "sensorId", "timestamp"])
      .index("by_timestamp", ["timestamp"]),

    /**
     * Alerts raised by threshold evaluation or manual operator reports.
     */
    alerts: defineTable({
      stationId: v.id("stations"),
      subsystem: v.string(),
      equipmentId: v.string(),
      sensorId: v.optional(v.string()),
      severity: severityValidator,
      message: v.string(),
      sensorReading: v.optional(v.string()),
      actuatorState: v.optional(v.string()),
      acknowledged: v.boolean(),
      acknowledgedBy: v.optional(v.id("users")),
      acknowledgedAt: v.optional(v.number()),
      resolved: v.boolean(),
      resolvedAt: v.optional(v.number()),
      createdAt: v.number(),
    })
      .index("by_station_created", ["stationId", "createdAt"])
      .index("by_open", ["resolved", "createdAt"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
