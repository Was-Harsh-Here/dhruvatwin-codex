import { ContactShadows, Html, OrbitControls } from "@react-three/drei";

import type { SensorSummary } from "./types";

export type { SensorSummary, TwinHotspotDef, TwinSceneProps } from "./types";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
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
export function Aurora({ z = -160, scale = 1 }: { z?: number; scale?: number }) {
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
            opacity={0.32}
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
}: {
  sun?: number;
  hemi?: number;
  ambient?: number;
}) {
  return (
    <>
      <directionalLight position={[120, 140, 60]} intensity={sun} color="#E8F4FF" />
      <hemisphereLight args={["#1A2A44", "#4A3E30", hemi]} />
      <pointLight position={[0, 12, 0]} intensity={40} distance={40} color="#FFB366" />
      <pointLight position={[-60, 8, 40]} intensity={25} distance={50} color={TWIN_COLORS.cyan} />
      <ambientLight intensity={ambient} />
    </>
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
}: {
  children: React.ReactNode;
  fogColor?: string;
  fogNear?: number;
  fogFar?: number;
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [150, 95, 150], fov: 42, near: 0.5, far: 900 }}
      gl={{ antialias: true }}
    >
      <fog attach="fog" args={[fogColor, fogNear, fogFar]} />
      <color attach="background" args={[fogColor]} />
      {children}
    </Canvas>
  );
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
        const color =
          reading.status === "critical"
            ? "#FF3B47"
            : reading.status === "warning"
              ? "#FFB020"
              : "#FF8A1F";
        return (
          <Html
            key={target.tag}
            position={target.position}
            center
            distanceFactor={155}
          >
            <div
              className="pointer-events-none whitespace-nowrap rounded border px-2 py-1 text-center font-mono text-[10px] leading-tight backdrop-blur"
              style={{ color, borderColor: `${color}80`, background: "#060B14E6" }}
            >
              <div className="font-bold">{target.tag}</div>
              <div>
                {reading.value.toFixed(reading.decimals)}
                {reading.unit}
              </div>
              <div style={{ color: "#6B7A8F" }}>{reading.parameter}</div>
            </div>
          </Html>
        );
      })}
    </group>
  );
}

/** Soft contact shadow patch under buildings. */
export function GroundShadow({ y = 0.05, scale = 1 }: { y?: number; scale?: number }) {
  return <ContactShadows position={[0, y, 0]} scale={220 * scale} blur={2.4} opacity={0.35} far={40} />;
}
