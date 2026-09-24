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

/** Interlocked container main station with lit windows and yellow door. */
function ContainerStation({ onInfo }: { onInfo: () => void }) {
  const rows = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        z: -21 + i * 6,
        count: 5,
      })),
    [],
  );
  return (
    <group onClick={(e) => { e.stopPropagation(); onInfo(); }}>
      {/* 8 container rows x 5 containers, two levels */}
      {rows.map((row, ri) =>
        Array.from({ length: row.count }, (_, ci) => {
          const x = -15 + ci * 7.5;
          const y = ri % 2 === 0 ? 2 : 5.4;
          return (
            <mesh key={`${ri}-${ci}`} position={[x, y, row.z]}>
              <boxGeometry args={[7.1, 3.2, 5.8]} />
              <meshStandardMaterial
                color={(ri + ci) % 3 === 0 ? TWIN_COLORS.containerBlue : TWIN_COLORS.steelWhite}
                {...MAT.metal}
              />
            </mesh>
          );
        }),
      )}
      {/* 40 lit windows across the sea-facing face */}
      {Array.from({ length: 40 }, (_, i) => {
        const ri = Math.floor(i / 10);
        const ci = i % 10;
        return (
          <mesh key={i} position={[-13.5 + ci * 3, 2.4 + (ri % 2) * 3.2, 25.2]} rotation={[0, 0, 0]}>
            <planeGeometry args={[1.5, 1.1]} />
            <meshStandardMaterial
              color="#7FB4E8"
              emissive={TWIN_COLORS.windowLit}
              emissiveIntensity={ri % 2 === 0 ? 1.3 : 0.55}
              {...MAT.glass}
            />
          </mesh>
        );
      })}
      {/* Main yellow door */}
      <mesh position={[0, 1.7, 25.4]}>
        <planeGeometry args={[2.4, 3.4]} />
        <meshStandardMaterial color={TWIN_COLORS.door} emissive={TWIN_COLORS.door} emissiveIntensity={0.25} />
      </mesh>
      {/* Roof railings */}
      {[-30, 30].map((x) => (
        <mesh key={x} position={[x, 7.6, 0]}>
          <boxGeometry args={[0.18, 1.2, 50]} />
          <meshStandardMaterial color={TWIN_COLORS.pole} {...MAT.metal} />
        </mesh>
      ))}
      {/* 4 antenna dishes */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[-9 + i * 6, 8.6, -8 + (i % 2) * 10]} rotation={[0.6, i * 0.4, 0]}>
          <sphereGeometry args={[1.15, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2.6]} />
          <meshStandardMaterial color="#B9C4CC" {...MAT.metal} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

/** Three CHP units with exhaust stacks, heat-exchanger coils and status panels. */
function CHPUnits() {
  const panels = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (panels.current) {
      panels.current.children.forEach((c, i) => {
        const mesh = c as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 0.8 + Math.sin(clock.elapsedTime * 2 + i) * 0.4;
      });
    }
  });
  return (
    <group position={[34, 0, -20]}>
      {[0, 1, 2].map((i) => (
        <group key={i} position={[0, 0, i * 8]}>
          <mesh position={[0, 1.5, 0]}>
            <boxGeometry args={[6, 3, 3]} />
            <meshStandardMaterial color="#5B6670" {...MAT.metal} />
          </mesh>
          {/* exhaust stack */}
          <mesh position={[-2, 4.2, 0]}>
            <cylinderGeometry args={[0.35, 0.35, 3.6, 10]} />
            <meshStandardMaterial color={TWIN_COLORS.pole} {...MAT.metal} />
          </mesh>
          {/* heat exchanger coils */}
          {[0.4, 1.0, 1.6].map((y) => (
            <mesh key={y} position={[2.4, y + 0.6, 0]} rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.5, 0.09, 8, 18]} />
              <meshStandardMaterial color={TWIN_COLORS.amber} emissive={TWIN_COLORS.amber} emissiveIntensity={0.5} />
            </mesh>
          ))}
          {/* status panel */}
          <mesh ref={i === 0 ? panels : undefined} position={[0, 1.7, 1.6]}>
            <planeGeometry args={[1.3, 0.8]} />
            <meshStandardMaterial color={TWIN_COLORS.cyan} emissive={TWIN_COLORS.cyan} emissiveIntensity={1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** 13-tank fuel farm in two rows plus three yellow day tanks. */
function FuelFarm13() {
  const tanks = useMemo(
    () =>
      Array.from({ length: 13 }, (_, i) => ({
        x: -3 + (i % 7) * 6.5,
        z: i < 7 ? 0 : 9,
        r: i < 7 ? 2.6 : 2.2,
      })),
    [],
  );
  return (
    <group position={[-44, 0, -18]}>
      {tanks.map((t, i) => (
        <mesh key={i} position={[t.x, t.r * 0.9, t.z]}>
          <cylinderGeometry args={[t.r, t.r, t.r * 1.8, 18]} />
          <meshStandardMaterial color={TWIN_COLORS.fuel} {...MAT.metal} />
        </mesh>
      ))}
      {/* day tanks */}
      {[-24, -21, -18].map((x, i) => (
        <mesh key={i} position={[x, 0.9, 16]}>
          <cylinderGeometry args={[0.8, 0.8, 1.6, 12]} />
          <meshStandardMaterial color={TWIN_COLORS.door} {...MAT.metal} />
        </mesh>
      ))}
    </group>
  );
}

/** Seawater pump house with the 450 m intake line running to the fjord. */
function SeawaterPumpHouse() {
  return (
    <group position={[10, 0, 44]}>
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[10, 4, 6]} />
        <meshStandardMaterial color={TWIN_COLORS.steelWhite} {...MAT.metal} />
      </mesh>
      <mesh position={[0, 4.3, 0]}>
        <boxGeometry args={[10.6, 0.5, 6.6]} />
        <meshStandardMaterial color={TWIN_COLORS.containerBlue} {...MAT.metal} />
      </mesh>
      {/* intake pipe run toward the water */}
      {[0.25, 0.5, 0.75].map((t, i) => (
        <mesh key={i} position={[0, 0.45, 4 + t * 22]}>
          <cylinderGeometry args={[0.45, 0.45, 6, 10]} />
          <meshStandardMaterial color="#4C5860" {...MAT.metal} />
        </mesh>
      ))}
    </group>
  );
}

/** Wastewater treatment plant with three tanks and rising steam puffs. */
function WastewaterPlant() {
  const steam = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (steam.current) {
      steam.current.children.forEach((c, i) => {
        const mesh = c as THREE.Mesh;
        const t = (clock.elapsedTime * 0.35 + i * 0.33) % 1;
        mesh.position.y = 2.2 + t * 4;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.opacity = 0.4 * (1 - t);
      });
    }
  });
  return (
    <group position={[-20, 0, 40]}>
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[8, 3, 6]} />
        <meshStandardMaterial color="#77828C" {...MAT.metal} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-2.2 + i * 2.2, 2.1, -3.4]}>
          <cylinderGeometry args={[0.85, 0.85, 1.4, 12]} />
          <meshStandardMaterial color="#98A2AA" {...MAT.metal} />
        </mesh>
      ))}
      <group ref={steam}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, 2.2, 0]}>
            <sphereGeometry args={[0.7, 10, 10]} />
            <meshStandardMaterial color="#DCE6EC" transparent opacity={0.3} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** Laboratory module with blue windows and equipment silhouettes. */
function Laboratory() {
  return (
    <group position={[46, 0, 26]}>
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[10, 3, 8]} />
        <meshStandardMaterial color={TWIN_COLORS.steelWhite} {...MAT.metal} />
      </mesh>
      {[-3, 0, 3].map((x) => (
        <mesh key={x} position={[x, 1.7, 4.05]}>
          <planeGeometry args={[1.8, 1.2]} />
          <meshStandardMaterial
            color="#7FB4E8"
            emissive="#7FB4E8"
            emissiveIntensity={1.1}
            {...MAT.glass}
          />
        </mesh>
      ))}
      {/* equipment silhouettes on the roof */}
      {[-2.5, 0.5, 3].map((x, i) => (
        <mesh key={i} position={[x, 3.5, -1]}>
          <boxGeometry args={[1.4, 1, 1.4]} />
          <meshStandardMaterial color="#5B6670" {...MAT.metal} />
        </mesh>
      ))}
    </group>
  );
}

/** Summer camp: 15 red-white containers in a 5x3 block. */
function SummerCamp15() {
  return (
    <group position={[-12, 0, -52]} rotation={[0, -0.2, 0]}>
      {Array.from({ length: 15 }, (_, i) => (
        <mesh key={i} position={[(i % 5) * 6.5, 1.5, Math.floor(i / 5) * 5]}>
          <boxGeometry args={[6, 3, 4.2]} />
          <meshStandardMaterial color={i % 2 === 0 ? TWIN_COLORS.moduleRed : TWIN_COLORS.moduleWhite} {...MAT.metal} />
        </mesh>
      ))}
    </group>
  );
}

/** Irregular animated water body used for the fjord and the bay. */
function WaterBody({
  position,
  radiusX,
  radiusZ,
  seed = 0,
}: {
  position: [number, number];
  radiusX: number;
  radiusZ: number;
  seed?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.22 + Math.sin(clock.elapsedTime * 0.9 + seed) * 0.07;
    }
  });
  return (
    <mesh
      ref={ref}
      position={[position[0], 0.3, position[1]]}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={[radiusX, radiusZ, 1]}
    >
      <circleGeometry args={[1, 36]} />
      <meshStandardMaterial
        color={TWIN_COLORS.water}
        emissive={TWIN_COLORS.cyan}
        emissiveIntensity={0.25}
        roughness={0.15}
        metalness={0.1}
      />
    </mesh>
  );
}

/** Thala Fjord, Quilty Bay and scattered small lakes. */
function WaterFeatures() {
  const lakes = useMemo(
    () =>
      Array.from({ length: 32 }, (_, i) => ({
        x: -240 + ((i * 61) % 480),
        z: -230 + ((i * 97) % 460),
        r: 2.5 + ((i * 7) % 5),
      })),
    [],
  );
  return (
    <group>
      <WaterBody position={[-70, 110]} radiusX={110} radiusZ={52} seed={0} />
      <WaterBody position={[120, 90]} radiusX={80} radiusZ={44} seed={2.1} />
      {lakes.map((l, i) => (
        <mesh key={i} position={[l.x, 0.26, l.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[l.r, 14]} />
          <meshStandardMaterial color={TWIN_COLORS.water} roughness={0.2} metalness={0.1} />
        </mesh>
      ))}
    </group>
  );
}

/** Larsemann Hills outcrops including the 104 m hill. */
function LarsemannHills() {
  const hills = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        x: -230 + ((i * 71) % 460),
        z: -250 + ((i * 29) % 90),
        s: 7 + ((i * 17) % 20),
      })),
    [],
  );
  return (
    <group>
      {hills.map((h, i) => (
        <mesh key={i} position={[h.x, h.s * 0.3, h.z]} rotation={[0.15, i, 0.12]}>
          <dodecahedronGeometry args={[h.s, 0]} />
          <meshStandardMaterial color={TWIN_COLORS.rock} {...MAT.rock} />
        </mesh>
      ))}
      {/* the 104 m outcrop */}
      <mesh position={[-160, 12, -210]} rotation={[0.1, 0.7, 0.06]}>
        <dodecahedronGeometry args={[34, 0]} />
        <meshStandardMaterial color={TWIN_COLORS.rock} {...MAT.rock} />
      </mesh>
    </group>
  );
}

/** Distance marker for a neighbouring station. */
function NeighbourMarker({
  position,
  name,
}: {
  position: [number, number, number];
  name: string;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 3, 0]}>
        <cylinderGeometry args={[0.12, 0.16, 6, 6]} />
        <meshStandardMaterial color={TWIN_COLORS.pole} {...MAT.metal} />
      </mesh>
      <mesh position={[0, 6.6, 0]}>
        <octahedronGeometry args={[0.9]} />
        <meshStandardMaterial color={TWIN_COLORS.amber} emissive={TWIN_COLORS.amber} emissiveIntensity={0.8} />
      </mesh>
      <Html center distanceFactor={160}>
        <div className="pointer-events-none whitespace-nowrap rounded border border-[#FFB020]/50 bg-[#060B14]/85 px-2 py-0.5 font-mono text-[10px] text-[#FFB020]">
          {name}
        </div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* The assembled Bharati scene                                         */
/* ------------------------------------------------------------------ */

/**
 * Bharati station twin: the 134-container main building, three CHP units,
 * the 13-tank fuel farm, seawater pump house with intake line, wastewater
 * plant, laboratory, summer camp, Thala Fjord, Quilty Bay, scattered lakes,
 * Larsemann Hills and neighbour-station markers.
 */
export function BharatiScene({ readings, onSelect, activeHotspot }: TwinSceneProps) {
  const find = (tag: string) => readings.find((r) => r.equipmentId === tag);

  return (
    <group>
      <Terrain
        size={620}
        color="#C7D3DA"
        rises={[
          { x: -190, z: -220, r: 210, h: 9 },
          { x: 210, z: -170, r: 160, h: 6 },
          { x: 40, z: -260, r: 130, h: 7 },
        ]}
      />
      <Lighting />
      <Stars count={800} />
      <Aurora z={-190} scale={1.25} />
      <Snowfall count={1200} spread={280} />
      <GroundShadow />

      <ContainerStation onInfo={() => onSelect("main-station")} />
      <CHPUnits />
      <FuelFarm13 />
      <SeawaterPumpHouse />
      <WastewaterPlant />
      <Laboratory />
      <SummerCamp15 />
      <WaterFeatures />
      <LarsemannHills />

      {/* Neighbour stations */}
      <NeighbourMarker position={[150, 0, -40]} name="PROGRESS 8 KM" />
      <NeighbourMarker position={[230, 0, -90]} name="ZHONGSHAN" />

      {/* Hotspots */}
      <Hotspot position={[0, 14, 10]} label="main-station" onSelect={onSelect} active={activeHotspot === "main-station"} />
      <Hotspot position={[34, 10, -20]} label="chp" onSelect={onSelect} active={activeHotspot === "chp"} />
      <Hotspot position={[-44, 12, -12]} label="fuel" onSelect={onSelect} active={activeHotspot === "fuel"} />
      <Hotspot position={[10, 9, 44]} label="seawater" onSelect={onSelect} active={activeHotspot === "seawater"} />
      <Hotspot position={[-20, 8, 40]} label="wastewater" onSelect={onSelect} active={activeHotspot === "wastewater"} />
      <Hotspot position={[46, 7, 26]} label="laboratory" onSelect={onSelect} active={activeHotspot === "laboratory"} />
      <Hotspot position={[-12, 7, -52]} label="summer-camp" onSelect={onSelect} active={activeHotspot === "summer-camp"} />
      <Hotspot position={[-70, 6, 110]} label="fjord" onSelect={onSelect} active={activeHotspot === "fjord"} />
      <Hotspot position={[120, 6, 90]} label="bay" onSelect={onSelect} active={activeHotspot === "bay"} />

      {/* Live telemetry readout strip above the station */}
      <group position={[0, 16.5, 10]}>
        <Html center distanceFactor={130}>
          <div className="pointer-events-none flex gap-2 rounded border border-[#00E0C6]/50 bg-[#060B14]/85 px-2.5 py-1.5 font-mono text-[10px] text-[#E8EEF4]">
            {(["CHP-1", "CHP-2", "SWPUMP-BHARATI", "AWS-BHARATI"] as const).map((tag) => {
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
