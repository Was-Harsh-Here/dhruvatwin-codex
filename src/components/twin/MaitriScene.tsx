import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import {
  Aurora,
  GroundShadow,
  Hotspot,
  Lighting,
  MAT,
  Snowfall,
  Stars,
  Terrain,
  TWIN_COLORS,
  type TwinSceneProps,
} from "./twin-primitives";

/* ------------------------------------------------------------------ */
/* Reusable building blocks                                            */
/* ------------------------------------------------------------------ */

/** Sloped-roof main station on pillars with lit windows and orange trim. */
function MainStation({ onInfo }: { onInfo: () => void }) {
  const windows = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        x: -14 + (i % 10) * 3.1,
        y: 3.2 + Math.floor(i / 10) * 2.6,
        z: i < 10 ? 10.05 : -10.05,
        rotY: i < 10 ? 0 : Math.PI,
      })),
    [],
  );
  return (
    <group onClick={(e) => { e.stopPropagation(); onInfo(); }}>
      {/* 8 pillars */}
      {[
        [-15, -7], [-5, -7], [5, -7], [15, -7],
        [-15, 7], [-5, 7], [5, 7], [15, 7],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.7, z]}>
          <boxGeometry args={[1.6, 1.4, 1.6]} />
          <meshStandardMaterial color={TWIN_COLORS.rock} {...MAT.rock} />
        </mesh>
      ))}
      {/* Main hull */}
      <mesh position={[0, 4, 0]}>
        <boxGeometry args={[40, 4.4, 20]} />
        <meshStandardMaterial color={TWIN_COLORS.steelWhite} {...MAT.metal} />
      </mesh>
      {/* Orange trim bands */}
      <mesh position={[0, 2.1, 0]}>
        <boxGeometry args={[40.4, 0.5, 20.4]} />
        <meshStandardMaterial color={TWIN_COLORS.trimOrange} {...MAT.metal} />
      </mesh>
      <mesh position={[0, 5.9, 0]}>
        <boxGeometry args={[40.4, 0.5, 20.4]} />
        <meshStandardMaterial color={TWIN_COLORS.trimOrange} {...MAT.metal} />
      </mesh>
      {/* Sloped roof */}
      <mesh position={[0, 6.9, 0]} rotation={[0, 0, 0.06]}>
        <boxGeometry args={[41, 0.8, 21]} />
        <meshStandardMaterial color={TWIN_COLORS.steelWhite} {...MAT.metal} />
      </mesh>
      {/* Lit windows */}
      {windows.map((w, i) => (
        <mesh key={i} position={[w.x, w.y, w.z]} rotation={[0, w.rotY, 0]}>
          <planeGeometry args={[1.7, 1.3]} />
          <meshStandardMaterial
            color={TWIN_COLORS.windowLit}
            emissive={TWIN_COLORS.windowLit}
            emissiveIntensity={1.4}
            {...MAT.glass}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Antenna mast with three dishes. */
function AntennaMast() {
  return (
    <group position={[24, 0, -6]}>
      <mesh position={[0, 6, 0]}>
        <cylinderGeometry args={[0.22, 0.3, 12, 8]} />
        <meshStandardMaterial color={TWIN_COLORS.pole} {...MAT.metal} />
      </mesh>
      {[
        { y: 9.5, r: 2.2, rotX: 0.5 },
        { y: 7.5, r: 1.7, rotX: -0.35 },
        { y: 11, r: 1.4, rotX: 0.15 },
      ].map((d, i) => (
        <mesh key={i} position={[0, d.y, 0.6]} rotation={[d.rotX, 0, 0]}>
          <sphereGeometry args={[d.r, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2.6]} />
          <meshStandardMaterial color="#B9C4CC" {...MAT.metal} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

/** Lake Priyadarshini with animated water and floating ice floes. */
function LakePriyadarshini() {
  const waterRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (waterRef.current) {
      const mat = waterRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.28 + Math.sin(clock.elapsedTime * 1.1) * 0.08;
      waterRef.current.position.y = 0.32 + Math.sin(clock.elapsedTime * 0.8) * 0.04;
    }
  });
  const floes = useMemo(
    () =>
      [
        [-9, 2],
        [5, -4],
        [11, 3],
      ].map(([x, z], i) => ({
        x,
        z,
        r: 1.6 + i * 0.5,
        rot: i * 1.7,
      })),
    [],
  );
  return (
    <group position={[-38, 0, 26]}>
      {/* Ice rim */}
      <mesh position={[0, 0.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[26, 32]} />
        <meshStandardMaterial color={TWIN_COLORS.ice} {...MAT.snow} />
      </mesh>
      {/* Water */}
      <mesh ref={waterRef} position={[0, 0.32, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[24, 32]} />
        <meshStandardMaterial
          color={TWIN_COLORS.water}
          emissive={TWIN_COLORS.cyan}
          emissiveIntensity={0.3}
          roughness={0.15}
          metalness={0.1}
        />
      </mesh>
      {/* Floating ice floes */}
      {floes.map((f, i) => (
        <mesh key={i} position={[f.x, 0.42, f.z]} rotation={[0, f.rot, 0]}>
          <cylinderGeometry args={[f.r, f.r * 0.85, 0.35, 7]} />
          <meshStandardMaterial color="#E8F1F6" {...MAT.snow} />
        </mesh>
      ))}
    </group>
  );
}

/** Heated water pipeline from the lake to the station with pulsing flow glow. */
function HeatedPipeline() {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.emissiveIntensity = 0.7 + Math.sin(clock.elapsedTime * 2.4) * 0.45;
    }
  });
  const start: [number, number, number] = [-26, 1.1, 22];
  const end: [number, number, number] = [-12, 1.1, 6];
  const mid = [(start[0] + end[0]) / 2, 1.1, (start[2] + end[2]) / 2] as [number, number, number];
  const angle = Math.atan2(end[0] - start[0], end[2] - start[2]);
  const length = Math.hypot(end[0] - start[0], end[2] - start[2]);
  return (
    <group>
      <mesh position={mid} rotation={[0, angle, 0]}>
        <cylinderGeometry args={[0.4, 0.4, length, 10]} />
        <meshStandardMaterial
          ref={matRef}
          color={TWIN_COLORS.cyan}
          emissive={TWIN_COLORS.cyan}
          emissiveIntensity={0.8}
          roughness={0.3}
          metalness={0.4}
        />
      </mesh>
      {/* Support bents */}
      {[0.2, 0.5, 0.8].map((t, i) => (
        <mesh key={i} position={[start[0] + (end[0] - start[0]) * t, 0.4, start[2] + (end[2] - start[2]) * t]}>
          <boxGeometry args={[0.5, 1.4, 0.5]} />
          <meshStandardMaterial color={TWIN_COLORS.pole} {...MAT.metal} />
        </mesh>
      ))}
    </group>
  );
}

/** Fuel farm: six vertical tanks with fill indicators and railing. */
function FuelFarm() {
  const tanks = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        x: -6 + (i % 3) * 7,
        z: i < 3 ? -2 : 4.5,
      })),
    [],
  );
  return (
    <group position={[42, 0, 30]}>
      {tanks.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]}>
          <mesh position={[0, 4, 0]}>
            <cylinderGeometry args={[2.4, 2.4, 8, 18]} />
            <meshStandardMaterial color={TWIN_COLORS.fuel} {...MAT.metal} />
          </mesh>
          {/* fill-level band */}
          <mesh position={[0, 5.4, 0]}>
            <cylinderGeometry args={[2.45, 2.45, 1.1, 18, 1, true]} />
            <meshStandardMaterial color={TWIN_COLORS.amber} emissive={TWIN_COLORS.amber} emissiveIntensity={0.6} />
          </mesh>
        </group>
      ))}
      {/* Safety railing */}
      {[-8, 8].map((x) => (
        <mesh key={x} position={[x, 1, 1]}>
          <boxGeometry args={[0.15, 2, 14]} />
          <meshStandardMaterial color={TWIN_COLORS.pole} {...MAT.metal} />
        </mesh>
      ))}
    </group>
  );
}

/** Lake pump house with a rotating pump indicator. */
function PumpHouse() {
  const rotor = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (rotor.current) rotor.current.rotation.y += delta * 3;
  });
  return (
    <group position={[-22, 0, 34]}>
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[6, 3, 4]} />
        <meshStandardMaterial color={TWIN_COLORS.steelWhite} {...MAT.metal} />
      </mesh>
      <mesh ref={rotor} position={[0, 3.4, 0]}>
        <torusGeometry args={[0.7, 0.18, 8, 20]} />
        <meshStandardMaterial color={TWIN_COLORS.cyan} emissive={TWIN_COLORS.cyan} emissiveIntensity={1.2} />
      </mesh>
    </group>
  );
}

/** Four diesel generators with status LEDs, stacks and vibration animation. */
function Generators() {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (group.current) {
      group.current.position.y = Math.sin(clock.elapsedTime * 14) * 0.035;
    }
  });
  return (
    <group ref={group} position={[16, 0, -26]}>
      {[0, 1, 2, 3].map((i) => (
        <group key={i} position={[(i % 2) * 7 - 3.5, 0, Math.floor(i / 2) * 6 - 3]}>
          <mesh position={[0, 1, 0]}>
            <boxGeometry args={[4, 2, 2]} />
            <meshStandardMaterial color="#5B6670" {...MAT.metal} />
          </mesh>
          <mesh position={[0, 2.4, -0.6]}>
            <cylinderGeometry args={[0.3, 0.3, 1.4, 8]} />
            <meshStandardMaterial color={TWIN_COLORS.pole} {...MAT.metal} />
          </mesh>
          <mesh position={[1.4, 2.15, 0.6]}>
            <sphereGeometry args={[0.16, 8, 8]} />
            <meshStandardMaterial color={TWIN_COLORS.green} emissive={TWIN_COLORS.green} emissiveIntensity={2} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** 15 m weather mast with spinning anemometer cups and wind vane. */
function WeatherMast() {
  const cups = useRef<THREE.Group>(null);
  const vane = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (cups.current) cups.current.rotation.y += delta * 2.4;
    if (vane.current) vane.current.rotation.y = Math.sin(performance.now() / 2600) * 1.2;
  });
  return (
    <group position={[-8, 0, -30]}>
      <mesh position={[0, 7.5, 0]}>
        <cylinderGeometry args={[0.16, 0.24, 15, 8]} />
        <meshStandardMaterial color={TWIN_COLORS.pole} {...MAT.metal} />
      </mesh>
      {/* sensor housing */}
      <mesh position={[0, 9.5, 0]}>
        <boxGeometry args={[0.9, 0.6, 0.9]} />
        <meshStandardMaterial color="#B9C4CC" {...MAT.metal} />
      </mesh>
      {/* anemometer */}
      <group ref={cups} position={[0, 14.6, 0]}>
        {[0, 2.09, 4.19].map((a) => (
          <mesh key={a} position={[Math.cos(a) * 0.8, 0, Math.sin(a) * 0.8]}>
            <sphereGeometry args={[0.34, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#D6DDE2" {...MAT.metal} />
          </mesh>
        ))}
      </group>
      {/* wind vane */}
      <group ref={vane} position={[0, 13.6, 0]}>
        <mesh position={[0.9, 0, 0]}>
          <boxGeometry args={[1.6, 0.1, 0.4]} />
          <meshStandardMaterial color={TWIN_COLORS.trimOrange} {...MAT.metal} />
        </mesh>
      </group>
    </group>
  );
}

/** Summer camp: eight red-white containerised modules in a 4x2 grid. */
function SummerCamp() {
  return (
    <group position={[-44, 0, -12]} rotation={[0, 0.35, 0]}>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[(i % 4) * 7, 1.5, Math.floor(i / 4) * 5]}>
          <boxGeometry args={[6, 3, 4]} />
          <meshStandardMaterial color={i % 2 === 0 ? TWIN_COLORS.moduleRed : TWIN_COLORS.moduleWhite} {...MAT.metal} />
        </mesh>
      ))}
    </group>
  );
}

/** Background Schirmacher rock formations. */
function RockHills() {
  const rocks = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        x: -220 + ((i * 37) % 440),
        z: -170 - ((i * 53) % 120),
        s: 6 + ((i * 13) % 18),
      })),
    [],
  );
  return (
    <group>
      {rocks.map((r, i) => (
        <mesh key={i} position={[r.x, r.s * 0.25, r.z]} rotation={[0.2, i, 0.1]}>
          <dodecahedronGeometry args={[r.s, 0]} />
          <meshStandardMaterial color={TWIN_COLORS.rock} {...MAT.rock} />
        </mesh>
      ))}
    </group>
  );
}

/** Fuel station canopy near the generators. */
function FuelStation() {
  return (
    <group position={[30, 0, -18]}>
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[8, 4, 8]} />
        <meshStandardMaterial color={TWIN_COLORS.steelWhite} {...MAT.metal} />
      </mesh>
      <mesh position={[0, 4.4, 0]}>
        <boxGeometry args={[9, 0.7, 9]} />
        <meshStandardMaterial color={TWIN_COLORS.trimOrange} {...MAT.metal} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* The assembled Maitri scene                                          */
/* ------------------------------------------------------------------ */

/**
 * Maitri station twin: main building on pillars, Lake Priyadarshini with the
 * heated pipeline, fuel farm, four generators, weather mast, summer camp,
 * Schirmacher hills, windsock toward Novo airfield, aurora, stars and snow.
 */
export function MaitriScene({ readings, onSelect, activeHotspot }: TwinSceneProps) {
  const find = (tag: string) => readings.find((r) => r.equipmentId === tag);

  return (
    <group>
      <Terrain
        size={520}
        rises={[
          { x: -180, z: -160, r: 190, h: 7 },
          { x: 170, z: -190, r: 150, h: 5 },
        ]}
      />
      <Lighting />
      <Stars count={500} />
      <Aurora z={-170} />
      <Snowfall count={900} spread={240} />
      <GroundShadow />

      <MainStation onInfo={() => onSelect("main-station")} />
      <LakePriyadarshini />
      <HeatedPipeline />
      <FuelFarm />
      <PumpHouse />
      <Generators />
      <WeatherMast />
      <SummerCamp />
      <RockHills />
      <FuelStation />
      <AntennaMast />

      {/* Windsock marking Novo airfield 5.5 km out */}
      <group position={[60, 0, -60]}>
        <mesh position={[0, 4, 0]}>
          <cylinderGeometry args={[0.1, 0.12, 8, 6]} />
          <meshStandardMaterial color={TWIN_COLORS.pole} {...MAT.metal} />
        </mesh>
        <mesh position={[0.9, 7.4, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.55, 2.4, 10, 1, true]} />
          <meshStandardMaterial color={TWIN_COLORS.trimOrange} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Hotspots */}
      <Hotspot position={[0, 12, 0]} label="main-station" onSelect={onSelect} active={activeHotspot === "main-station"} />
      <Hotspot position={[-38, 7, 26]} label="lake" onSelect={onSelect} active={activeHotspot === "lake"} />
      <Hotspot position={[-19, 5, 14]} label="pipeline" onSelect={onSelect} active={activeHotspot === "pipeline"} />
      <Hotspot position={[42, 12, 30]} label="fuel" onSelect={onSelect} active={activeHotspot === "fuel"} />
      <Hotspot position={[16, 7, -26]} label="generators" onSelect={onSelect} active={activeHotspot === "generators"} />
      <Hotspot position={[-8, 19, -30]} label="weather" onSelect={onSelect} active={activeHotspot === "weather"} />
      <Hotspot position={[-44, 7, -12]} label="summer-camp" onSelect={onSelect} active={activeHotspot === "summer-camp"} />

      {/* Live telemetry readout strip above the main station */}
      <group position={[0, 15.5, 0]}>
        <Html center distanceFactor={120}>
          <div className="pointer-events-none flex gap-2 rounded border border-[#00E0C6]/50 bg-[#060B14]/85 px-2.5 py-1.5 font-mono text-[10px] text-[#E8EEF4] shadow-none">
            {(["GEN-1", "PIPE-MAITRI", "AWS-MAITRI"] as const).map((tag) => {
              const r = find(tag);
              if (!r) return null;
              const color =
                r.status === "critical" ? "#FF3B47" : r.status === "warning" ? "#FFB020" : "#3EE07F";
              return (
                <span key={tag} style={{ color }} className="whitespace-nowrap">
                  {tag} {r.value.toFixed(r.decimals)}
                  {r.unit}
                </span>
              );
            })}
          </div>
        </Html>
      </group>
    </group>
  );
}
