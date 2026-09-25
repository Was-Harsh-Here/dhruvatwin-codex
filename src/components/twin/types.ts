/** Live sensor summary passed into twin scenes for hotspot readouts. */
export interface SensorSummary {
  equipmentId: string;
  parameter: string;
  value: number;
  unit: string;
  decimals: number;
  status: string;
}

/** Descriptor for one clickable hotspot in a twin scene. */
export interface TwinHotspotDef {
  id: string;
  label: string;
  /** Optional equipment tag linking the hotspot to live telemetry. */
  equipmentId?: string;
  /** Short line describing the object, shown in the detail panel. */
  info: string;
}

import type { ViewMode } from "./view-modes";

/** Props every station scene component accepts. */
export interface TwinSceneProps {
  readings: SensorSummary[];
  onSelect: (hotspotId: string) => void;
  activeHotspot: string | null;
  /** Active display mode; defaults to the photographic exterior view. */
  viewMode?: ViewMode;
}
