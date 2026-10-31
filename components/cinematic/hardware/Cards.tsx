"use client";

import { RoundedBox } from "@react-three/drei";
import { Fan } from "./Fan";
import { MAT, RGB } from "./materials";
import { Mat } from "./Surface";

/**
 * Graphics card. Local axes: X is card height away from the board, Y is
 * thickness (vertical in the case), Z is card length. Envelope 1.45 x 0.65 x 3.0.
 *
 * Fans face -Y, as they do in a real tower. The surface visible through the
 * side window is the card's long edge, which is exactly where manufacturers
 * put the lit logo — so that is where the RGB goes.
 */
export function Gpu() {
  const L = 3.0;
  return (
    <group>
      {/* PCB */}
      <mesh position={[-0.1, -0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.035, L * 0.92]} />
        <Mat kind="pcbDark" />
      </mesh>

      {/* Cooler shroud */}
      <RoundedBox args={[1.38, 0.44, L * 0.95]} radius={0.04} smoothness={3} position={[0, 0.02, 0]} castShadow>
        <Mat kind="anodised" />
      </RoundedBox>

      {/* Angular shroud cuts — breaks up the slab and catches highlights */}
      {[-0.95, 0.0, 0.95].map((z, i) => (
        <mesh key={`cut${i}`} position={[0.4, 0.25, z]} rotation={[0, 0, -0.22]} castShadow>
          <boxGeometry args={[0.5, 0.05, 0.5]} />
          <Mat kind="aluminium" />
        </mesh>
      ))}

      {/* Backplate */}
      <mesh position={[-0.1, 0.26, 0]} castShadow>
        <boxGeometry args={[1.22, 0.03, L * 0.93]} />
        <Mat kind="aluminium" />
      </mesh>

      {/* Triple fans, facing down as in a real build */}
      {[-0.92, 0.02, 0.96].map((z, i) => (
        <group key={`f${i}`} position={[0.05, -0.23, z]} rotation={[Math.PI / 2, 0, 0]}>
          <Fan size={0.82} thickness={0.1} blades={11} speed={3.2 + i * 0.4} />
        </group>
      ))}

      {/* Lit logo strip along the edge that faces the glass */}
      <mesh position={[0.7, 0.04, 0.1]}>
        <boxGeometry args={[0.012, 0.12, 1.5]} />
        <meshStandardMaterial color={RGB.cool} emissive={RGB.cool} emissiveIntensity={3.0} toneMapped={false} />
      </mesh>

      {/* PCIe bracket with display outputs */}
      <mesh position={[-0.2, 0.0, -L / 2 - 0.03]} castShadow>
        <boxGeometry args={[1.25, 0.5, 0.04]} />
        <Mat kind="aluminium" />
      </mesh>
      {[-0.35, 0.0, 0.35].map((x, i) => (
        <mesh key={`dp${i}`} position={[x - 0.2, 0.0, -L / 2 - 0.06]}>
          <boxGeometry args={[0.22, 0.12, 0.03]} />
          <meshStandardMaterial color="#07080a" roughness={0.9} />
        </mesh>
      ))}

      {/* 12V-2x6 power connector on the top edge */}
      <mesh position={[0.1, 0.28, 0.95]} castShadow>
        <boxGeometry args={[0.3, 0.1, 0.22]} />
        <Mat kind="plastic" />
      </mesh>

      {/* Gold edge connector */}
      <mesh position={[-0.58, -0.22, -0.35]}>
        <boxGeometry args={[0.22, 0.04, 0.72]} />
        <Mat kind="gold" />
      </mesh>
    </group>
  );
}

/**
 * Tower air cooler: copper base, heatpipes, aluminium fin stack and a fan.
 * Fins are stacked along Z, the airflow axis. Envelope 1.0 x 1.2 x 1.0.
 */
export function Cooler() {
  const FINS = 20;
  return (
    <group>
      {/* Base block, contacting the CPU */}
      <mesh position={[-0.42, -0.42, 0.0]} castShadow>
        <boxGeometry args={[0.16, 0.34, 0.5]} />
        <Mat kind="copper" />
      </mesh>

      {/* Heatpipes rising from the base through the fin stack */}
      {[-0.18, -0.06, 0.06, 0.18].map((z, i) => (
        <mesh key={`hp${i}`} position={[-0.3, 0.02, z]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.92, 10]} />
          <Mat kind="copper" />
        </mesh>
      ))}

      {/* Fin stack */}
      {Array.from({ length: FINS }, (_, i) => (
        <mesh key={`fin${i}`} position={[-0.05, 0.12, -0.3 + i * 0.032]} castShadow>
          <boxGeometry args={[0.72, 0.82, 0.012]} />
          <Mat kind="fin" />
        </mesh>
      ))}

      {/* Top cap with RGB */}
      <RoundedBox args={[0.78, 0.09, 0.68]} radius={0.02} smoothness={3} position={[-0.05, 0.56, 0.0]} castShadow>
        <Mat kind="anodised" />
      </RoundedBox>
      <mesh position={[-0.05, 0.615, 0.0]}>
        <boxGeometry args={[0.52, 0.012, 0.42]} />
        <meshStandardMaterial color={RGB.cyan} emissive={RGB.cyan} emissiveIntensity={2.6} toneMapped={false} />
      </mesh>

      {/* Fan clipped to the intake face */}
      <group position={[-0.05, 0.1, -0.4]}>
        <Fan size={0.78} thickness={0.12} blades={9} speed={2.8} rgb={RGB.cyan} />
      </group>
    </group>
  );
}

/** Power supply: body, intake fan, modular panel, rear IEC inlet. */
export function Psu() {
  return (
    <group>
      <RoundedBox args={[1.48, 0.84, 1.38]} radius={0.03} smoothness={3} castShadow receiveShadow>
        <Mat kind="chassis" />
      </RoundedBox>

      {/* Intake fan on the underside */}
      <group position={[0, -0.41, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
        <Fan size={0.92} thickness={0.08} blades={11} speed={1.6} />
      </group>

      {/* Modular connector panel facing into the case */}
      <mesh position={[0, 0, 0.7]}>
        <boxGeometry args={[1.2, 0.56, 0.02]} />
        <meshStandardMaterial color="#111316" roughness={0.8} />
      </mesh>
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={`mc${i}`} position={[-0.48 + (i % 5) * 0.24, 0.12 - Math.floor(i / 5) * 0.26, 0.72]}>
          <boxGeometry args={[0.18, 0.16, 0.03]} />
          <Mat kind="plastic" />
        </mesh>
      ))}

      {/* Rear: IEC inlet and switch */}
      <mesh position={[-0.4, 0, -0.71]} castShadow>
        <boxGeometry args={[0.34, 0.3, 0.04]} />
        <meshStandardMaterial color="#090a0b" roughness={0.9} />
      </mesh>
      <mesh position={[0.1, 0, -0.71]} castShadow>
        <boxGeometry args={[0.2, 0.12, 0.04]} />
        <Mat kind="plastic" />
      </mesh>
      {/* Honeycomb-ish exhaust */}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={`e${i}`} position={[0.45 + (i % 4) * 0.1, 0.22 - Math.floor(i / 4) * 0.12, -0.71]}>
          <cylinderGeometry args={[0.035, 0.035, 0.02, 6]} />
          <meshStandardMaterial color="#060708" roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}
