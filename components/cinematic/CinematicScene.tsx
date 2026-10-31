"use client";

import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera, Environment, Lightformer, ContactShadows } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, SMAA } from "@react-three/postprocessing";
import type { PerspectiveCamera as ThreePerspectiveCamera, Vector3 } from "three";
import { PCModel, type PartRegistry } from "./PCModel";
import { CAMERA_POSES } from "@/lib/animation/choreography";

/**
 * Camera rig (brief 8.2).
 *
 * GSAP animates camera.position and a plain target vector; the camera re-aims
 * at that target every frame. Animating a look-at target rather than camera
 * rotation keeps the subject framed through the whole move and avoids the
 * gimbal problems of tweening euler angles directly.
 */
function CameraRig({
  cameraRef,
  target,
}: {
  cameraRef: React.RefObject<ThreePerspectiveCamera | null>;
  target: Vector3;
}) {
  useFrame(() => {
    cameraRef.current?.lookAt(target);
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      fov={38}
      near={0.1}
      far={140}
      position={CAMERA_POSES.hero.position as [number, number, number]}
    />
  );
}

/**
 * Studio environment built from Lightformers rather than an HDRI.
 *
 * This is the single biggest visual upgrade available here. Metal surfaces are
 * defined by what they REFLECT — with no environment, metalness renders black
 * (the exact bug that made the Phase 1 cube look dead). Lightformers are real
 * geometry inside the scene, so we get believable reflections and long specular
 * streaks across the chassis with NO external HDRI download, no CDN dependency
 * and no offline failure mode.
 *
 * frames={1} bakes the environment once: the lightformers never move, so there
 * is no reason to re-render the cubemap every frame.
 */
function StudioEnvironment() {
  return (
    <Environment resolution={256} frames={1}>
      {/* Large soft key from above — the main source of form. */}
      <Lightformer
        form="rect"
        intensity={3.2}
        position={[0, 6, 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[14, 8, 1]}
        color="#ffffff"
      />
      {/* Long vertical strips: these become the specular streaks down the
          chassis edges that make brushed metal read as metal. */}
      <Lightformer
        form="rect"
        intensity={2.4}
        position={[6, 1, 3]}
        rotation={[0, -Math.PI / 2.4, 0]}
        scale={[1.2, 9, 1]}
        color="#cfe4ff"
      />
      <Lightformer
        form="rect"
        intensity={1.6}
        position={[-7, 2, -2]}
        rotation={[0, Math.PI / 2.6, 0]}
        scale={[1, 8, 1]}
        color="#8fb7ff"
      />
      {/* Warm low fill so the lower chassis never goes pure black. */}
      <Lightformer
        form="circle"
        intensity={1.1}
        position={[2, -4, 5]}
        scale={[6, 6, 1]}
        color="#ffcfa0"
      />
    </Environment>
  );
}

/** Direct lighting on top of the environment — restrained, not an RGB disco. */
function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.28} />
      <directionalLight
        position={[7, 10, 6]}
        intensity={2.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005}
      />
      <directionalLight position={[-8, 3, -6]} intensity={0.9} color="#58a6ff" />
    </>
  );
}

export function CinematicScene({
  registry,
  cameraRef,
  target,
  onReady,
}: {
  registry: PartRegistry;
  cameraRef: React.RefObject<ThreePerspectiveCamera | null>;
  target: Vector3;
  onReady: () => void;
}) {
  return (
    <group>
      <CameraRig cameraRef={cameraRef} target={target} />
      <StudioEnvironment />
      <SceneLighting />
      <PCModel registry={registry} onReady={onReady} />
      {/*
        Grounding shadow. Without it the PC floats in void and the whole scene
        reads as weightless — this is cheap and disproportionately effective.
      */}
      {/*
        Post-processing. Bloom is what turns an emissive surface into a light
        SOURCE: the RGB rings, RAM crowns and GPU logo bleed into the air around
        them instead of looking like coloured stickers. All emissive materials
        are flagged toneMapped={false} so their values exceed 1.0 and cross the
        luminance threshold; nothing else in the scene does, so only the RGB
        blooms (brief 3.1 - controlled, not an RGB disco).
      */}
      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={1.15} luminanceThreshold={1.0} luminanceSmoothing={0.3} mipmapBlur radius={0.72} />
        <Vignette eskil={false} offset={0.32} darkness={0.42} />
        <SMAA />
      </EffectComposer>

      <ContactShadows
        position={[0, -2.28, 0]}
        opacity={0.62}
        scale={26}
        blur={2.6}
        far={9}
        resolution={512}
        color="#000000"
      />
    </group>
  );
}
