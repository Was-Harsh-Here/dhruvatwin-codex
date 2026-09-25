import { useMemo } from "react";
import type { SensorSummary } from "./types";
import { cn } from "@/lib/utils";

/**
 * 2.5D isometric cutaway twin.
 *
 * The station footprint is drawn as flat isometric tiles with each room as an
 * extruded cutaway block (floor and four walls, no ceiling). Live data
 * overlays float above every room and the blocks are colour coded by the
 * status of the subsystem they carry. Selecting a block drives the same
 * hotspot selection the 3D view uses.
 */

export interface RoomDef {
  id: string;
  hotspot: string;
  label: string;
  /** Grid position and size in tile units. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Extrusion height in pixels. */
  height: number;
  /** Equipment tag whose live reading is shown on the block. */
  equipmentId?: string;
  /** Fixed occupancy for the overlay. */
  occupancy: number;
}

const TILE = 46;

const MAITRI_ROOMS: RoomDef[] = [
  { id: "ops", hotspot: "main-station", label: "Operations", x: 0, y: 0, w: 4, h: 3, height: 54, equipmentId: "HAB-MAITRI", occupancy: 6 },
  { id: "hab", hotspot: "main-station", label: "Habitation", x: 4, y: 0, w: 4, h: 3, height: 54, equipmentId: "HAB-MAITRI", occupancy: 12 },
  { id: "galley", hotspot: "main-station", label: "Galley", x: 8, y: 0, w: 4, h: 3, height: 54, equipmentId: "HAB-MAITRI", occupancy: 8 },
  { id: "med", hotspot: "main-station", label: "Medical", x: 0, y: 3, w: 3, h: 2, height: 40, equipmentId: "HAB-MAITRI", occupancy: 2 },
  { id: "plant", hotspot: "generators", label: "Generator Bay", x: 0, y: 5, w: 5, h: 3, height: 72, equipmentId: "GEN-1", occupancy: 3 },
  { id: "water", hotspot: "pipeline", label: "Water Plant", x: 5, y: 5, w: 4, h: 3, height: 72, equipmentId: "PIPE-MAITRI", occupancy: 2 },
  { id: "lab", hotspot: "main-station", label: "Science Lab", x: 8, y: 3, w: 4, h: 3, height: 40, equipmentId: "HAB-MAITRI", occupancy: 7 },
  { id: "stores", hotspot: "fuel", label: "Stores", x: 12, y: 0, w: 3, h: 8, height: 64, equipmentId: "FUEL-MAITRI", occupancy: 3 },
];

const BHARATI_ROOMS: RoomDef[] = [
  { id: "ops", hotspot: "main-station", label: "Operations", x: 0, y: 0, w: 5, h: 4, height: 96, equipmentId: "HAB-BHARATI", occupancy: 8 },
  { id: "hab", hotspot: "main-station", label: "Habitation", x: 5, y: 0, w: 5, h: 4, height: 96, equipmentId: "HAB-BHARATI", occupancy: 30 },
  { id: "med", hotspot: "main-station", label: "Medical", x: 10, y: 0, w: 3, h: 4, height: 96, equipmentId: "HAB-BHARATI", occupancy: 4 },
  { id: "lab", hotspot: "laboratory", label: "Laboratory", x: 13, y: 0, w: 3, h: 4, height: 96, equipmentId: "HAB-BHARATI", occupancy: 9 },
  { id: "chp", hotspot: "chp", label: "CHP Hall", x: 0, y: 4, w: 5, h: 4, height: 88, equipmentId: "CHP-1", occupancy: 5 },
  { id: "sw", hotspot: "seawater", label: "Seawater Plant", x: 5, y: 4, w: 4, h: 4, height: 88, equipmentId: "SWPUMP-BHARATI", occupancy: 3 },
  { id: "ww", hotspot: "wastewater", label: "Wastewater", x: 9, y: 4, w: 4, h: 4, height: 66, equipmentId: "SWPUMP-BHARATI", occupancy: 2 },
  { id: "stores", hotspot: "fuel", label: "Stores & Fuel", x: 0, y: 8, w: 7, h: 3, height: 80, equipmentId: "FUEL-BHARATI", occupancy: 6 },
];

const STATUS_FILL: Record<string, { top: string; wall: string; text: string }> = {
  nominal: { top: "#123244", wall: "#0B2130", text: "#3EE07F" },
  warning: { top: "#3A2C12", wall: "#251B0A", text: "#FFB020" },
  watch: { top: "#152C42", wall: "#0E1F30", text: "#4A9EFF" },
  critical: { top: "#3A1218", wall: "#240A0F", text: "#FF3B47" },
  offline: { top: "#1A2533", wall: "#111A24", text: "#6B7A8F" },
};

function RoomBlock({
  room,
  reading,
  active,
  onSelect,
}: {
  room: RoomDef;
  reading?: SensorSummary;
  active: boolean;
  onSelect: (hotspot: string) => void;
}) {
  const status = active ? "critical" : (reading?.status ?? "offline");
  const fill = STATUS_FILL[status] ?? STATUS_FILL.offline;
  const width = room.w * TILE;
  const height = room.h * TILE;
  const base = {
    left: room.x * TILE,
    top: room.y * TILE,
    width,
    height,
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(room.hotspot)}
      onKeyDown={(e) => e.key === "Enter" && onSelect(room.hotspot)}
      className="absolute cursor-pointer"
      style={{ ...base, transformStyle: "preserve-3d" }}
    >
      {/* Floor */}
      <div
        className="absolute inset-0 border"
        style={{
          background: fill.wall,
          borderColor: active ? "#FF3B47" : "#1A2533",
        }}
      />
      {/* North wall */}
      <div
        className="absolute left-0 top-0 w-full"
        style={{
          height: room.height,
          background: fill.top,
          transformOrigin: "top",
          transform: "rotateX(90deg)",
          borderTop: `1px solid ${fill.text}55`,
        }}
      />
      {/* South wall */}
      <div
        className="absolute bottom-0 left-0 w-full"
        style={{
          height: room.height,
          background: fill.wall,
          transformOrigin: "bottom",
          transform: "rotateX(-90deg)",
          borderBottom: `1px solid ${fill.text}33`,
        }}
      />
      {/* East wall */}
      <div
        className="absolute right-0 top-0 h-full"
        style={{
          width: room.height,
          background: "#0B1622",
          transformOrigin: "right",
          transform: "rotateY(90deg)",
        }}
      />
      {/* West wall */}
      <div
        className="absolute left-0 top-0 h-full"
        style={{
          width: room.height,
          background: "#0D1A27",
          transformOrigin: "left",
          transform: "rotateY(-90deg)",
        }}
      />
      {/* Floating data overlay, counter-rotated to face the camera */}
      <div
        className="absolute left-1/2 top-1/2 w-max -translate-x-1/2 -translate-y-1/2"
        style={{
          transform: `translate(-50%, -50%) translateZ(${room.height + 26}px) rotateZ(-45deg) rotateX(-58deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        <div
          className={cn(
            "rounded border px-2 py-1 text-center backdrop-blur",
            active && "ring-1 ring-[#FF3B47]",
          )}
          style={{
            background: "#060B14E0",
            borderColor: `${fill.text}66`,
          }}
        >
          <div className="font-display text-[10px] font-bold uppercase tracking-wider text-[#E8EEF4]">
            {room.label}
          </div>
          <div className="cc-mono text-[10px]" style={{ color: fill.text }}>
            {reading ? `${reading.value.toFixed(reading.decimals)}${reading.unit}` : "no data"}
          </div>
          <div className="cc-mono text-[9px] text-[#6B7A8F]">
            {room.occupancy} pax · {status}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TwoAndHalfD({
  slug,
  readings,
  onSelect,
  activeHotspot,
}: {
  slug: "maitri" | "bharati";
  readings: SensorSummary[];
  onSelect: (hotspot: string) => void;
  activeHotspot: string | null;
}) {
  const rooms = slug === "maitri" ? MAITRI_ROOMS : BHARATI_ROOMS;
  const gridW = Math.max(...rooms.map((r) => r.x + r.w)) * TILE;
  const gridH = Math.max(...rooms.map((r) => r.y + r.h)) * TILE;

  const byEquipment = useMemo(() => {
    const map = new Map<string, SensorSummary>();
    for (const reading of readings) {
      if (!map.has(reading.equipmentId)) map.set(reading.equipmentId, reading);
    }
    return map;
  }, [readings]);

  const counts = rooms.reduce<Record<string, number>>((acc, room) => {
    const reading = room.equipmentId ? byEquipment.get(room.equipmentId) : undefined;
    const status = reading?.status ?? "offline";
    acc[status] = (acc[status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden bg-[#060B14] px-4 py-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="cc-label">2.5D isometric cutaway</span>
        {Object.entries(STATUS_FILL).map(([status, fill]) => (
          <span key={status} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="size-2 rounded-sm" style={{ background: fill.text }} />
            {status}
            {counts[status] ? ` (${counts[status]})` : ""}
          </span>
        ))}
        <span className="cc-mono text-[10px] text-muted-foreground">
          click a room block to inspect
        </span>
      </div>

      <div
        className="flex-1 overflow-auto"
        style={{ perspective: "1600px", perspectiveOrigin: "50% 40%" }}
      >
        <div
          className="relative"
          style={{
            width: gridW,
            height: gridH,
            transform: "rotateX(58deg) rotateZ(45deg)",
            transformStyle: "preserve-3d",
            transformOrigin: "center",
            margin: "70px auto 0",
          }}
        >
          {/* Flat isometric terrain tiles */}
          <div
            className="absolute"
            style={{
              left: -TILE * 4,
              top: -TILE * 4,
              width: gridW + TILE * 8,
              height: gridH + TILE * 8,
              background:
                "repeating-linear-gradient(0deg, #0E1A27 0 1px, transparent 1px 46px), repeating-linear-gradient(90deg, #0E1A27 0 1px, transparent 1px 46px), #081120",
              border: "1px solid #1A2533",
            }}
          />
          {/* Shoreline / water body tile */}
          <div
            className="absolute"
            style={{
              left: slug === "maitri" ? -TILE * 3 : gridW + TILE,
              top: gridH + TILE,
              width: TILE * 4,
              height: TILE * 3,
              background: "linear-gradient(135deg, #123A52, #0B2436)",
              border: "1px solid #00E0C655",
            }}
          />
          {rooms.map((room) => (
            <RoomBlock
              key={room.id}
              room={room}
              reading={room.equipmentId ? byEquipment.get(room.equipmentId) : undefined}
              active={activeHotspot === room.hotspot}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
