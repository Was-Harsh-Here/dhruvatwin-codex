import { ContactShadows, OrbitControls } from "@react-three/drei";

import type { SensorSummary } from "./types";

export type { SensorSummary, TwinHotspotDef, TwinSceneProps } from "./types";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

/* ------------------------------------------------------------------ */
/* Materials palette (shared with both station scenes)                 */
/* ------------------------------------------------------------------ */

/** Command-centre material palette. */
export const TWIN_COLORS = {
  snow: "#DDE7EE",
  rock: "#3A4450",
  steelWhite: "#C9D4DC",
  containerBlue: "#27415C",
  trimOrange: "#C46A2B",
  windowLit: "#FFB366",
  cyan: "#00E0C6",
  water: "#123A52",
  ice: "#A8C6D8",
  fuel: "#7A8288",
  door: "#D8A017",
  amber: "#FFB020",
  green: "#3EE07F",
  red: "#FF3B47",
  moduleRed: "#B3402F",
  moduleWhite: "#D6DDE2",
  pole: "#8A949E",
};

/** Standard material presets per the twin spec. */
export const MAT = {
  snow: { roughness: 0.7, metalness: 0.0 },
  rock: { roughness: 0.95, metalness: 0.05 },
  metal: { roughness: 0.4, metalness: 0.8 },
  glass: { roughness: 0.1, metalness: 0.0 },
} as const;

/* ------------------------------------------------------------------ */
/* Terrain                                                             */
/* ------------------------------------------------------------------ */

/**
 * Displaced terrain plane. Heights are value-noise-based so both stations get
 * realistic undulation instead of a flat plane. `rises` marks a raised sector
 * (Schirmacher hills for Maitri, the Larsemann outcrop for Bharati).
 */
export function Terrain({
  size,
  color = TWIN_COLORS.snow,
  rises = [],
}: {
  size: number;
  color?: string;
  rises?: Array<{ x: number; z: number; r: number; h: number }>;
}) {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size, size, 96, 96);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const nx = v.x / size;
      const nz = v.y / size;
      // Layered value noise for rolling ice.
      let h =
        1.4 * Math.sin(nx * 9.7 + nz * 5.3) +
        0.9 * Math.sin(nx * 17.1 - nz * 12.7) +
        0.5 * Math.sin(nx * 31.3 + nz * 27.9);
      // Raised sectors.
      for (const r of rises) {
        const d = Math.hypot(v.x - r.x, v.y - r.z);
        if (d < r.r) {
          h += r.h * (1 - d / r.r) * (1 - d / r.r);
        }
      }
      pos.setZ(i, h);
    }
    geo.computeVertexNormals();
    return geo;
  }, [size, rises]);

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <meshStandardMaterial color={color} {...MAT.snow} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* Sky: stars, aurora ribbons, fog handled by scene                    */
/* ------------------------------------------------------------------ */

/** Static star field (points) positioned on a high dome. */
export function Stars({ count = 500, radius = 320 }: { count?: number; radius?: number }) {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.42;
      const r = radius * (0.85 + Math.random() * 0.15);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi) * 0.6 + 60;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [count, radius]);

  return (
    <points geometry={geometry}>
      <pointsMaterial color="#BFD3E6" size={0.9} sizeAttenuation transparent opacity={0.85} />
    </points>
  );
}

/** Animated aurora ribbons across the southern sky. */
export function Aurora({
  z = -160,
  scale = 1,
  opacity = 0.32,
}: {
  z?: number;
  scale?: number;
  /** Season-driven brightness: absent under the summer sun, strong in winter. */
  opacity?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (ref.current) {
      ref.current.position.x = Math.sin(t * 0.12) * 14;
      const mat = ref.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.85 + Math.sin(t * 0.7) * 0.25;
    }
  });
  return (
    <group position={[0, 90, z]} scale={scale}>
      {[0, 26, 52].map((off, i) => (
        <mesh key={off} ref={i === 0 ? ref : undefined} position={[off * 0.6, off * 0.35, -off]}>
          <planeGeometry args={[300, 34, 1, 1]} />
          <meshStandardMaterial
            color={i === 1 ? "#3EE07F" : "#00E0C6"}
            emissive={i === 1 ? "#3EE07F" : "#00E0C6"}
            emissiveIntensity={0.9}
            transparent
            opacity={opacity}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Snowfall                                                            */
/* ------------------------------------------------------------------ */

/** Drifting snow particles that wrap around a bounding volume. */
export function Snowfall({ count = 1200, spread = 220 }: { count?: number; spread?: number }) {
  const ref = useRef<THREE.Points>(null);
  const [geometry] = useState(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = Math.random() * 70;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  });
  const speeds = useMemo(
    () => Array.from({ length: count }, () => 2.2 + Math.random() * 3.4),
    [count],
  );

  useFrame((_, delta) => {
    const pos = geometry.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] -= speeds[i] * delta;
      arr[i * 3 + 3] += 0; // keep V8 happy about the stride read
      if (arr[i * 3 + 1] < 0) {
        arr[i * 3 + 1] = 70;
        arr[i * 3] = (Math.random() - 0.5) * spread;
        arr[i * 3 + 2] = (Math.random() - 0.5) * spread;
      }
    }
    pos.needsUpdate = true;
    if (ref.current) ref.current.rotation.y += delta * 0.008;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial color="#EAF2F8" size={0.55} sizeAttenuation transparent opacity={0.8} />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/* Hotspots                                                            */
/* ------------------------------------------------------------------ */

/** Clickable equipment hotspot marker floating above an object. */
export function Hotspot({
  position,
  label,
  onSelect,
  active,
}: {
  position: [number, number, number];
  label: string;
  onSelect: (label: string) => void;
  active?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 2) * 0.25;
    }
  });
  return (
    <group
      ref={ref}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(label);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      <mesh>
        <sphereGeometry args={hovered || active ? [1.15, 16, 16] : [0.85, 16, 16]} />
        <meshStandardMaterial
          color={active ? TWIN_COLORS.red : TWIN_COLORS.cyan}
          emissive={active ? TWIN_COLORS.red : TWIN_COLORS.cyan}
          emissiveIntensity={1.6}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, 0]}>
        <ringGeometry args={[1.4, 1.8, 24]} />
        <meshStandardMaterial
          color={active ? TWIN_COLORS.red : TWIN_COLORS.cyan}
          emissive={active ? TWIN_COLORS.red : TWIN_COLORS.cyan}
          emissiveIntensity={0.8}
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Lights                                                              */
/* ------------------------------------------------------------------ */

/**
 * Lighting rig per the twin spec: cool sun, hemi fill, warm windows.
 * Intensities are driven by the active view mode so night and thermal modes
 * read correctly.
 */
export function Lighting({
  sun = 1.2,
  hemi = 0.4,
  ambient = 0.15,
  sunPosition = [120, 140, 60],
  night = false,
}: {
  sun?: number;
  hemi?: number;
  ambient?: number;
  /** Direction of the sun for the selected time of day. */
  sunPosition?: [number, number, number];
  /** Night raises the apron floodlights. */
  night?: boolean;
}) {
  return (
    <>
      <directionalLight
        position={sunPosition}
        intensity={sun}
        color={night ? "#8FB4E0" : "#E8F4FF"}
      />
      <hemisphereLight args={[night ? "#0C1626" : "#1A2A44", "#4A3E30", hemi]} />
      {night && <Floodlights />}
      <pointLight position={[0, 12, 0]} intensity={40} distance={40} color="#FFB366" />
      <pointLight position={[-60, 8, 40]} intensity={25} distance={50} color={TWIN_COLORS.cyan} />
      <ambientLight intensity={ambient} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Night floodlights and building access                               */
/* ------------------------------------------------------------------ */

/**
 * Station apron floodlights.
 *
 * Mounted only for the polar night, so the light count is stable through the
 * day. They carry no shadows because the sun already does.
 */
export function Floodlights({ intensity = 55 }: { intensity?: number }) {
  const posts: Array<[number, number, number]> = [
    [42, 9, 42],
    [-42, 9, 42],
    [42, 9, -42],
    [-42, 9, -42],
  ];
  return (
    <group>
      {posts.map((p, i) => (
        <group key={i} position={p}>
          <mesh position={[0, -p[1] / 2, 0]}>
            <cylinderGeometry args={[0.18, 0.26, p[1], 8]} />
            <meshStandardMaterial color={TWIN_COLORS.pole} metalness={0.7} roughness={0.35} />
          </mesh>
          <mesh rotation={[0.5, i * 1.6, 0]}>
            <boxGeometry args={[1.1, 0.3, 0.7]} />
            <meshStandardMaterial color="#B9C4CC" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, -0.1, 0.3]} rotation={[0.5, 0, 0]}>
            <planeGeometry args={[0.9, 0.4]} />
            <meshStandardMaterial color="#FFE6C0" emissive="#FFE6C0" emissiveIntensity={1.6} />
          </mesh>
          <pointLight
            position={[0, -0.4, 0.8]}
            intensity={intensity}
            distance={90}
            decay={2}
            color="#FFE6C0"
          />
        </group>
      ))}
    </group>
  );
}

/**
 * Building entrance marker.
 *
 * A lit airlock frame with a hover label. Clicking it leaves the exterior view
 * and puts the operator inside the station in walk mode, which is the only
 * entry point to the interior rooms.
 */
export function BuildingEntrance({
  position,
  rotation = [0, 0, 0],
  label,
  onEnter,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  label: string;
  onEnter: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <group
      position={position}
      rotation={rotation}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onEnter();
      }}
    >
      <mesh>
        <planeGeometry args={[3.2, 4.2]} />
        <meshStandardMaterial
          color={TWIN_COLORS.amber}
          emissive={TWIN_COLORS.amber}
          emissiveIntensity={hovered ? 0.9 : 0.35}
          transparent
          opacity={0.34}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, -2.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 1.9, 28]} />
        <meshStandardMaterial
          color={TWIN_COLORS.amber}
          emissive={TWIN_COLORS.amber}
          emissiveIntensity={hovered ? 1.2 : 0.5}
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
      <Label3D
        position={[0, 2.9, 0]}
        border={TWIN_COLORS.amber}
        px={0.13}
        rows={[
          { text: label, color: TWIN_COLORS.amber },
          { text: hovered ? "CLICK TO ENTER" : "INTERIOR ACCESS", color: "#E8EEF4" },
        ]}
      />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Camera rig + presets                                                */
/* ------------------------------------------------------------------ */

/** Camera preset descriptor. */
export interface CameraPreset {
  id: string;
  label: string;
  position: [number, number, number];
  target: [number, number, number];
}

/** Smoothly move the orbit camera toward the active preset. */
export function CameraRig({
  preset,
  presets,
}: {
  preset: string;
  presets: CameraPreset[];
}) {
  const controlsRef = useRef<React.ComponentRef<typeof OrbitControls> | null>(null);
  const target = presets.find((p) => p.id === preset) ?? presets[0];

  useFrame((state, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;
    const cam = state.camera;
    const k = 1 - Math.pow(0.001, delta); // frame-rate independent lerp
    cam.position.lerp(new THREE.Vector3(...target.position), k);
    controls.target.lerp(new THREE.Vector3(...target.target), k);
    controls.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={20}
      maxDistance={420}
      maxPolarAngle={Math.PI / 2.05}
    />
  );
}

/** Twin canvas wrapper with fog and shared defaults. */
export function TwinCanvas({
  children,
  fogColor = "#0B1622",
  fogNear = 180,
  fogFar = 420,
  cameraPosition = [150, 95, 150],
  cameraNear = 0.5,
}: {
  children: React.ReactNode;
  fogColor?: string;
  fogNear?: number;
  fogFar?: number;
  /** Initial camera placement; the controllers take over from there. */
  cameraPosition?: [number, number, number];
  cameraNear?: number;
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: cameraPosition, fov: 42, near: cameraNear, far: 900 }}
      gl={{ antialias: true }}
    >
      <fog attach="fog" args={[fogColor, fogNear, fogFar]} />
      <color attach="background" args={[fogColor]} />
      {children}
    </Canvas>
  );
}

/* ------------------------------------------------------------------ */
/* In-canvas labels                                                    */
/* ------------------------------------------------------------------ */

/** One line of an in-canvas label. */
export interface LabelRow {
  text: string;
  color?: string;
}

const LABEL_FONT = '600 34px "JetBrains Mono", ui-monospace, monospace';

/**
 * Draw a label to an offscreen canvas and upload it as a texture.
 *
 * Labels are drawn inside the WebGL scene as camera-facing sprites rather
 * than React DOM portals overlaid on the canvas. Overlay portals inside a
 * canvas are fragile: under StrictMode, or when a conditional label group is
 * unmounted, the portal teardown can remove a DOM node React still owns and
 * the commit throws NotFoundError on removeChild. Sprites have no DOM, so the
 * whole failure mode disappears and labels still scale with perspective.
 */
function labelTexture(rows: LabelRow[], border: string) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const lines = rows.length > 0 ? rows : [{ text: " ", color: "#E8EEF4" }];
  const padding = 16;
  const lineHeight = 46;
  if (!ctx) {
    return { texture: new THREE.Texture(), width: 1, height: 1 };
  }
  ctx.font = LABEL_FONT;
  const textWidth = Math.max(
    ...lines.map((line) => ctx.measureText(line.text).width),
    24,
  );
  const width = Math.ceil(textWidth + padding * 2);
  const height = Math.ceil(lines.length * lineHeight + padding * 2);
  canvas.width = width;
  canvas.height = height;

  ctx.font = LABEL_FONT;
  ctx.textBaseline = "top";
  ctx.fillStyle = "rgba(6, 11, 20, 0.92)";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = border;
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, width - 4, height - 4);
  lines.forEach((line, i) => {
    ctx.fillStyle = line.color ?? "#E8EEF4";
    ctx.fillText(line.text, padding, padding + i * lineHeight);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return { texture, width, height };
}

/**
 * Camera-facing label rendered entirely inside the 3D scene.
 * `px` is the world size of one texture pixel, which sets how large the label
 * reads at a given camera distance.
 */
export function Label3D({
  position,
  rows,
  border = TWIN_COLORS.cyan,
  px = 0.18,
  renderOrder = 12,
}: {
  position: [number, number, number];
  rows: LabelRow[];
  border?: string;
  px?: number;
  renderOrder?: number;
}) {
  const key = rows.map((row) => `${row.text}:${row.color ?? ""}`).join("|");
  const { texture, width, height } = useMemo(
    () => labelTexture(rows, border),
    // The row key captures every visual input of the texture.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, border],
  );

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <sprite
      position={position}
      scale={[width * px, height * px, 1]}
      renderOrder={renderOrder}
    >
      <spriteMaterial
        map={texture}
        transparent
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </sprite>
  );
}

/** Colour for a reading status, matching the console palette. */
export function statusTone(status: string): string {
  switch (status) {
    case "critical":
      return TWIN_COLORS.red;
    case "warning":
      return TWIN_COLORS.amber;
    case "nominal":
      return TWIN_COLORS.green;
    case "watch":
      return "#4A9EFF";
    default:
      return "#6B7A8F";
  }
}

/** Live telemetry readout drawn above a station. */
export function TelemetryStrip({
  position,
  tags,
  readings,
  px = 0.2,
  border = TWIN_COLORS.cyan,
}: {
  position: [number, number, number];
  tags: string[];
  readings: SensorSummary[];
  px?: number;
  border?: string;
}) {
  const rows: LabelRow[] = tags.map((tag) => {
    const reading = readings.find((r) => r.equipmentId === tag);
    if (!reading) return { text: `${tag}  --`, color: "#6B7A8F" };
    return {
      text: `${tag}  ${reading.value.toFixed(reading.decimals)}${reading.unit}`,
      color: statusTone(reading.status),
    };
  });
  return <Label3D position={position} rows={rows} border={border} px={px} />;
}

/**
 * Thermal-mode readout labels pinned to subsystems. Each label shows the live
 * value and parameter for one equipment tag so the thermal view carries
 * numbers rather than only a colour gradient.
 */
export function ThermalReadout({
  targets,
  readings,
}: {
  targets: Array<{ tag: string; position: [number, number, number] }>;
  readings: SensorSummary[];
}) {
  return (
    <group>
      {targets.map((target) => {
        const reading = readings.find((r) => r.equipmentId === target.tag);
        if (!reading) return null;
        const color = statusTone(reading.status);
        return (
          <Label3D
            key={target.tag}
            position={target.position}
            border={color}
            px={0.16}
            rows={[
              { text: target.tag, color },
              {
                text: `${reading.value.toFixed(reading.decimals)}${reading.unit}`,
                color,
              },
              { text: reading.parameter, color: "#6B7A8F" },
            ]}
          />
        );
      })}
    </group>
  );
}

/** Soft contact shadow patch under buildings. */
export function GroundShadow({ y = 0.05, scale = 1 }: { y?: number; scale?: number }) {
  return <ContactShadows position={[0, y, 0]} scale={220 * scale} blur={2.4} opacity={0.35} far={40} />;
}
