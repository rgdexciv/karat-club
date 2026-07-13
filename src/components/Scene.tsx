"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, Float } from "@react-three/drei";
import * as THREE from "three";
import { scrollState } from "@/lib/scrollState";

/**
 * Placeholder jewelry asset: a champagne-gold signet ring built from
 * primitives. Swap `<Ring />` for a <primitive object={gltf.scene} />
 * once a production GLB (draco-compressed) is available — the material,
 * parallax path, and pointer behaviour all stay the same.
 */
function Ring() {
  const groupRef = useRef<THREE.Group>(null);
  const pointerTarget = useRef({ x: 0, y: 0 });

  useFrame(({ pointer }, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const progress = scrollState.progress;

    // --- Scroll-bound parallax path -------------------------------------
    // The ring travels from centre-right (hero) down-left and tumbles as
    // the user scrolls. Eased here rather than in GSAP so WebGL motion
    // stays frame-rate independent.
    const targetX = THREE.MathUtils.lerp(1.1, -1.4, progress);
    const targetY = THREE.MathUtils.lerp(0, -0.55, Math.sin(progress * Math.PI));
    const targetZ = THREE.MathUtils.lerp(0, 1.2, progress);
    const scrollRotX = progress * Math.PI * 1.5;
    const scrollRotY = progress * Math.PI * 2.2;

    // --- Pointer-bound micro rotation ------------------------------------
    // pointer is normalized (-1..1); damp toward it for a weighty feel.
    pointerTarget.current.x = THREE.MathUtils.damp(
      pointerTarget.current.x,
      pointer.x * 0.35,
      4,
      delta,
    );
    pointerTarget.current.y = THREE.MathUtils.damp(
      pointerTarget.current.y,
      pointer.y * 0.25,
      4,
      delta,
    );

    group.position.x = THREE.MathUtils.damp(group.position.x, targetX, 5, delta);
    group.position.y = THREE.MathUtils.damp(group.position.y, targetY, 5, delta);
    group.position.z = THREE.MathUtils.damp(group.position.z, targetZ, 5, delta);
    group.rotation.x = scrollRotX + pointerTarget.current.y;
    group.rotation.y = scrollRotY + pointerTarget.current.x;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.35}>
      <group ref={groupRef} position={[1.1, 0, 0]}>
        {/* Band */}
        <mesh castShadow>
          <torusGeometry args={[0.72, 0.16, 64, 128]} />
          <meshStandardMaterial
            color="#d4af5e"
            metalness={1}
            roughness={0.18}
            envMapIntensity={1.6}
          />
        </mesh>
        {/* Bezel-set stone */}
        <mesh position={[0, 0.88, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <octahedronGeometry args={[0.17, 0]} />
          {/* Transmission renders flat white over the alpha canvas (nothing
              behind it to refract), so the stone reads as polished metal
              instead — deterministic on mobile GPUs. */}
          <meshStandardMaterial
            color="#e8d9ae"
            metalness={1}
            roughness={0.12}
            envMapIntensity={1.8}
          />
        </mesh>
        {/* Bezel collar */}
        <mesh position={[0, 0.82, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.14, 0.18, 0.1, 32]} />
          <meshStandardMaterial color="#9a7b34" metalness={1} roughness={0.25} />
        </mesh>
      </group>
    </Float>
  );
}

export default function Scene() {
  return (
    <div className="fixed inset-0 -z-10" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 40 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.25} />
          <spotLight
            position={[4, 5, 3]}
            angle={0.4}
            penumbra={0.8}
            intensity={40}
            color="#fff2d8"
            castShadow
          />
          <Ring />
          {/* Studio-style environment built from lightformers: no network
              fetch, deterministic gold reflections. */}
          <Environment resolution={256}>
            <Lightformer
              intensity={4}
              position={[0, 3, 2]}
              scale={[6, 2, 1]}
              color="#fff5e0"
            />
            <Lightformer
              intensity={2}
              position={[-4, 0, 1]}
              rotation-y={Math.PI / 2}
              scale={[4, 1, 1]}
              color="#ffe0b0"
            />
            <Lightformer
              intensity={1.5}
              position={[4, -1, -1]}
              rotation-y={-Math.PI / 2}
              scale={[4, 1, 1]}
              color="#d9c8ff"
            />
          </Environment>
        </Suspense>
      </Canvas>
    </div>
  );
}
