"use client";

import { RoundedBox } from "@react-three/drei";
import { MAT, RGB } from "./materials";
import { Mat } from "./Surface";

/**
 * ATX motherboard. Local axes: X is board thickness (components protrude +X
 * toward the glass), Y is height, Z is depth. Envelope 0.20 x 3.0 x 2.4.
 */
export function Motherboard() {
  const H = 3.0, D = 2.4;
  const face = -0.06; // front surface of the PCB; everything mounts from here

  return (
    <group>
      {/* PCB */}
      <mesh position={[-0.08, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.04, H, D]} />
        <Mat kind="pcb" />
      </mesh>

      {/* Rear I/O shroud */}
      <RoundedBox
        args={[0.16, 0.74, 0.62]}
        radius={0.03}
        smoothness={3}
        position={[face + 0.08, 1.02, -0.86]}
        castShadow
      >
        <Mat kind="anodised" />
      </RoundedBox>
      <mesh position={[face + 0.17, 1.02, -0.86]}>
        <boxGeometry args={[0.012, 0.3, 0.42]} />
        <meshStandardMaterial color={RGB.cool} emissive={RGB.cool} emissiveIntensity={2.2} toneMapped={false} />
      </mesh>

      {/* VRM heatsinks: finned blocks flanking the socket */}
      {([[1.1, -0.1], [0.55, -0.98]] as const).map(([y, z], k) => (
        <group key={`vrm${k}`} position={[face + 0.07, y, z]}>
          <mesh castShadow>
            <boxGeometry args={[0.14, 0.42, 0.5]} />
            <Mat kind="anodised" />
          </mesh>
          {Array.from({ length: 7 }, (_, i) => (
            <mesh key={i} position={[0.09, 0, -0.2 + i * 0.066]} castShadow>
              <boxGeometry args={[0.05, 0.38, 0.022]} />
              <Mat kind="fin" />
            </mesh>
          ))}
        </group>
      ))}

      {/* CPU socket frame (the CPU itself is a separate animated part) */}
      <mesh position={[face + 0.02, 0.55, 0.2]} castShadow>
        <boxGeometry args={[0.05, 0.62, 0.62]} />
        <Mat kind="plastic" />
      </mesh>

      {/* DIMM slots */}
      {[0.72, 0.9, 1.05, 1.23].map((z, i) => (
        <group key={`d${i}`} position={[face + 0.03, 0.55, z]}>
          <mesh castShadow>
            <boxGeometry args={[0.06, 0.92, 0.07]} />
            <meshStandardMaterial color={i % 2 === 0 ? "#1b1d20" : "#2a2d31"} roughness={0.7} metalness={0.2} />
          </mesh>
          <mesh position={[0.005, 0, 0]}>
            <boxGeometry args={[0.03, 0.8, 0.03]} />
            <Mat kind="gold" />
          </mesh>
        </group>
      ))}

      {/* PCIe slots */}
      {[-0.8, -1.18].map((y, i) => (
        <mesh key={`p${i}`} position={[face + 0.04, y, -0.1]} castShadow>
          <boxGeometry args={[0.07, 0.08, 1.5]} />
          <meshStandardMaterial color="#3a3f45" metalness={0.5} roughness={0.5} />
        </mesh>
      ))}

      {/* Chipset heatsink with lit logo */}
      <RoundedBox
        args={[0.12, 0.52, 0.52]}
        radius={0.025}
        smoothness={3}
        position={[face + 0.06, -1.05, 0.62]}
        castShadow
      >
        <Mat kind="anodised" />
      </RoundedBox>
      <mesh position={[face + 0.13, -1.05, 0.62]}>
        <boxGeometry args={[0.008, 0.2, 0.2]} />
        <meshStandardMaterial color={RGB.magenta} emissive={RGB.magenta} emissiveIntensity={2.4} toneMapped={false} />
      </mesh>

      {/* Surface detail: capacitors and headers */}
      {Array.from({ length: 14 }, (_, i) => (
        <mesh
          key={`c${i}`}
          position={[face + 0.04, -1.42 + (i % 3) * 0.1, -1.05 + Math.floor(i / 3) * 0.1]}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
        >
          <cylinderGeometry args={[0.028, 0.028, 0.07, 8]} />
          <Mat kind="aluminium" />
        </mesh>
      ))}
    </group>
  );
}

/** CPU: substrate, integrated heat spreader, corner orientation notch. */
export function Cpu() {
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[0.03, 0.45, 0.45]} />
        <Mat kind="pcbDark" />
      </mesh>
      <RoundedBox args={[0.045, 0.33, 0.33]} radius={0.012} smoothness={3} position={[0.03, 0, 0]} castShadow>
        <Mat kind="ihs" />
      </RoundedBox>
      <mesh position={[0.016, -0.19, -0.19]}>
        <boxGeometry args={[0.02, 0.05, 0.05]} />
        <Mat kind="gold" />
      </mesh>
    </group>
  );
}

/** Memory module: PCB, finned heat spreader, RGB diffuser along the top. */
export function RamStick({ color = RGB.magenta }: { color?: string }) {
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[0.04, 1.0, 0.26]} />
        <Mat kind="pcbDark" />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.03, 0.08, 0]} castShadow>
          <boxGeometry args={[0.022, 0.78, 0.24]} />
          <Mat kind="anodised" />
        </mesh>
      ))}
      {/* Gold edge connector */}
      <mesh position={[0, -0.52, 0]}>
        <boxGeometry args={[0.042, 0.08, 0.22]} />
        <Mat kind="gold" />
      </mesh>
      {/* RGB diffuser crown */}
      <mesh position={[0, 0.54, 0]}>
        <boxGeometry args={[0.07, 0.06, 0.23]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.8} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** M.2 SSD under a finned heatsink. */
export function Ssd() {
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[0.02, 0.18, 0.78]} />
        <Mat kind="pcbDark" />
      </mesh>
      <mesh position={[0.02, 0, 0]} castShadow>
        <boxGeometry args={[0.025, 0.2, 0.72]} />
        <Mat kind="anodised" />
      </mesh>
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[0.036, 0, -0.3 + i * 0.075]} castShadow>
          <boxGeometry args={[0.016, 0.19, 0.03]} />
          <Mat kind="fin" />
        </mesh>
      ))}
    </group>
  );
}
