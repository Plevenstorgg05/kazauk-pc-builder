"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { Mat } from "./Surface";

/**
 * Reusable cooling fan: square frame, hub, swept blades and an optional RGB ring.
 *
 * Used eight times across the build (GPU x3, cooler, chassis intake x3, PSU),
 * so it is worth building once properly. Blades spin continuously — a static
 * fan is one of the fastest ways to make a render look dead.
 */
export function Fan({
  size,
  thickness = 0.14,
  blades = 9,
  rgb,
  speed = 2.4,
  spin = true,
}: {
  size: number;
  thickness?: number;
  blades?: number;
  rgb?: string;
  speed?: number;
  spin?: boolean;
}) {
  const rotor = useRef<Group>(null);
  const r = size / 2;

  useFrame((_s, delta) => {
    if (spin && rotor.current) rotor.current.rotation.z += delta * speed;
  });

  return (
    <group>
      {/* Frame: a square plate with the rotor opening implied by the ring. */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[size, size, thickness * 0.55]} />
        <Mat kind="plastic" />
      </mesh>

      {/* Outer shroud ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[r * 0.92, r * 0.07, 8, 32]} />
        <Mat kind="plastic" />
      </mesh>

      {/* RGB ring — the glow source, picked up by bloom */}
      {rgb ? (
        <mesh position={[0, 0, thickness * 0.34]}>
          <torusGeometry args={[r * 0.8, r * 0.055, 8, 40]} />
          <meshStandardMaterial
            color={rgb}
            emissive={rgb}
            emissiveIntensity={2.6}
            toneMapped={false}
            roughness={0.4}
          />
        </mesh>
      ) : null}

      <group ref={rotor} position={[0, 0, thickness * 0.18]}>
        {/* Hub */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[r * 0.3, r * 0.3, thickness * 0.5, 18]} />
          <Mat kind="anodised" />
        </mesh>

        {/* Swept blades: each is a thin plate, rotated around the hub and
            tilted so it catches the light differently as it turns. */}
        {Array.from({ length: blades }, (_, i) => {
          const a = (i / blades) * Math.PI * 2;
          return (
            <group key={i} rotation={[0, 0, a]}>
              <mesh position={[r * 0.52, 0, 0]} rotation={[0.52, 0, 0.16]} castShadow>
                <boxGeometry args={[r * 0.78, r * 0.52, 0.012]} />
                <Mat kind="diffuser" transparent opacity={0.92} />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}
