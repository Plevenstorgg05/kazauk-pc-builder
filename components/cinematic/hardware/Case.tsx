"use client";

import { RoundedBox } from "@react-three/drei";
import { Fan } from "./Fan";
import { RGB } from "./materials";
import { Mat } from "./Surface";

/**
 * Mid-tower chassis: open frame, front mesh intake, PSU shroud, rear I/O.
 *
 * All geometry stays inside the 2.2 x 4.4 x 4.2 envelope declared in
 * choreography.ts, because the collision proof is computed against that box.
 */
export function Chassis() {
  const W = 2.2, H = 4.4, D = 4.2, t = 0.07;

  return (
    <group>
      {/* Floor, ceiling, rear and far side. The near side is intentionally
          absent — that opening is the tempered glass panel. */}
      <mesh position={[0, -H / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[W, t, D]} />
        <Mat kind="chassis" />
      </mesh>
      <mesh position={[0, H / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[W, t, D]} />
        <Mat kind="chassis" />
      </mesh>
      <mesh position={[0, 0, -D / 2]} receiveShadow castShadow>
        <boxGeometry args={[W, H, t]} />
        <Mat kind="chassis" />
      </mesh>
      <mesh position={[-W / 2, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[t, H, D]} />
        <Mat kind="chassis" />
      </mesh>

      {/* Ceiling vent slots */}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={`v${i}`} position={[0, H / 2 + 0.04, -1.5 + i * 0.36]}>
          <boxGeometry args={[W * 0.7, 0.012, 0.12]} />
          <meshStandardMaterial color="#0a0b0c" roughness={0.9} />
        </mesh>
      ))}

      {/* Corner rails — the beveled edges that make it read as a real case */}
      {([[-1, -1], [-1, 1], [1, -1], [1, 1]] as const).map(([sx, sz], i) => (
        <RoundedBox
          key={`r${i}`}
          args={[0.11, H, 0.11]}
          radius={0.03}
          smoothness={3}
          position={[sx * (W / 2 - 0.13), 0, sz * (D / 2 - 0.13)]}
          castShadow
        >
          <Mat kind="anodised" />
        </RoundedBox>
      ))}

      {/* Feet */}
      {([[-1, -1], [-1, 1], [1, -1], [1, 1]] as const).map(([sx, sz], i) => (
        <mesh key={`f${i}`} position={[sx * 0.85, -H / 2 - 0.09, sz * 1.6]} castShadow>
          <cylinderGeometry args={[0.1, 0.12, 0.12, 12]} />
          <Mat kind="plastic" />
        </mesh>
      ))}

      {/* PSU shroud — hides the basement, a defining feature of a modern case */}
      <mesh position={[0, -1.15, -0.55]} castShadow receiveShadow>
        <boxGeometry args={[W - 0.16, 0.06, 2.9]} />
        <Mat kind="chassis" />
      </mesh>

      {/* Front intake: mesh frame + three RGB fans */}
      <group position={[0, 0, D / 2 - 0.09]}>
        <mesh castShadow>
          <boxGeometry args={[W - 0.14, H - 0.2, 0.04]} />
          <meshStandardMaterial color="#121416" metalness={0.5} roughness={0.75} />
        </mesh>
        {Array.from({ length: 22 }, (_, i) => (
          <mesh key={`m${i}`} position={[0, -1.9 + i * 0.18, 0.03]}>
            <boxGeometry args={[W - 0.2, 0.05, 0.012]} />
            <Mat kind="plastic" />
          </mesh>
        ))}
      </group>
      {[-1.05, 0.0, 1.05].map((y, i) => (
        <group key={`fan${i}`} position={[0, y, D / 2 - 0.28]}>
          <Fan size={0.92} blades={9} rgb={[RGB.cool, RGB.bright, RGB.core][i]} speed={1.8 + i * 0.3} />
        </group>
      ))}

      {/* Rear: I/O cutout and PCIe slot covers */}
      <mesh position={[-0.35, 1.45, -D / 2 - 0.02]}>
        <boxGeometry args={[1.1, 0.46, 0.02]} />
        <meshStandardMaterial color="#070809" roughness={0.9} />
      </mesh>
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={`s${i}`} position={[0.2, -0.1 - i * 0.17, -D / 2 - 0.02]} castShadow>
          <boxGeometry args={[1.3, 0.13, 0.03]} />
          <Mat kind="aluminium" />
        </mesh>
      ))}
    </group>
  );
}

/** Tempered glass side panel with an aluminium edge frame. */
export function GlassPanel() {
  const H = 4.2, D = 4.0;
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.03, H, D]} />
        <meshPhysicalMaterial
          color="#9fc4e8"
          metalness={0}
          roughness={0.04}
          transmission={0.86}
          thickness={0.3}
          ior={1.5}
          transparent
          opacity={0.42}
        />
      </mesh>
      {/* Edge frame catches the rim light and gives the glass an outline */}
      {([[0, H / 2], [0, -H / 2]] as const).map(([, y], i) => (
        <mesh key={`h${i}`} position={[0, y, 0]} castShadow>
          <boxGeometry args={[0.055, 0.07, D]} />
          <Mat kind="anodised" />
        </mesh>
      ))}
      {([D / 2, -D / 2] as const).map((z, i) => (
        <mesh key={`w${i}`} position={[0, 0, z]} castShadow>
          <boxGeometry args={[0.055, H, 0.07]} />
          <Mat kind="anodised" />
        </mesh>
      ))}
    </group>
  );
}
