"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, RoundedBox, Torus } from "@react-three/drei";
import * as THREE from "three";
import { isConstrainedDevice, prefersReducedMotion } from "@/lib/utils";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  Hero 3D scene — a floating holographic "support console".
 *
 *  Composition (all procedural, no external assets to download):
 *    · a glass console slab with glowing edges
 *    · three orbiting message cards
 *    · a paper-plane motif (the universal "send" idea)
 *    · an energy core + rotation ring
 *    · a soft particle field in the upper tier only
 *
 *  Two quality tiers are chosen at runtime:
 *    full — bloom, particles, higher dpr
 *    lite — no postprocessing, no particles, dpr locked to 1
 *
 *  The tier comes from device heuristics and is additionally downgraded if the
 *  measured frame rate stays under 28fps, so a weak phone never fights the page.
 * ─────────────────────────────────────────────────────────────────────────────
 */

type Quality = "full" | "lite";

const ACCENT = "#6d5efc"; // violet
const ELECTRIC = "#38bdf8"; // electric blue
const NEON = "#22d3ee"; // cyan

/* --------------------------------------------------------- console slab */

function ConsoleSlab({ quality }: { quality: Quality }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const d = Math.min(delta, 0.05);
    if (!group.current) return;
    group.current.rotation.y += d * 0.12;
    // Gentle pointer parallax keeps the object feeling physical.
    const { x, y } = state.pointer;
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -y * 0.16, 0.04);
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, x * 0.05, 0.04);
  });

  return (
    <group ref={group}>
      {/* Main glass slab */}
      <RoundedBox args={[2.5, 1.6, 0.16]} radius={0.14} smoothness={quality === "full" ? 6 : 2}>
        <meshPhysicalMaterial
          color="#0b1224"
          roughness={0.18}
          metalness={0.75}
          transmission={quality === "full" ? 0.45 : 0}
          thickness={1.1}
          transparent
          opacity={0.92}
          clearcoat={1}
          clearcoatRoughness={0.12}
          emissive={ACCENT}
          emissiveIntensity={0.12}
        />
      </RoundedBox>

      {/* Glowing outline — a slightly larger flat frame behind the slab */}
      <RoundedBox args={[2.62, 1.72, 0.05]} radius={0.16} smoothness={2} position={[0, 0, -0.09]}>
        <meshBasicMaterial color={ELECTRIC} transparent opacity={0.35} />
      </RoundedBox>

      {/* Header bar */}
      <RoundedBox args={[2.2, 0.14, 0.03]} radius={0.06} smoothness={2} position={[0, 0.58, 0.11]}>
        <meshStandardMaterial color={NEON} emissive={NEON} emissiveIntensity={1.6} toneMapped={false} />
      </RoundedBox>

      {/* Three content rows, progressively shorter — reads as a chat thread */}
      {[
        { w: 1.85, y: 0.26, o: 0.5 },
        { w: 1.45, y: 0.02, o: 0.32 },
        { w: 2.0, y: -0.22, o: 0.5 },
      ].map((r, i) => (
        <RoundedBox
          key={i}
          args={[r.w, 0.1, 0.02]}
          radius={0.05}
          smoothness={2}
          position={[-((2.2 - r.w) / 2) * 0 + -0.05, r.y, 0.11]}
        >
          <meshBasicMaterial color="#a5b4fc" transparent opacity={r.o} />
        </RoundedBox>
      ))}

      {/* Send button — emissive violet pill */}
      <RoundedBox args={[0.7, 0.22, 0.04]} radius={0.11} smoothness={3} position={[0.72, -0.55, 0.12]}>
        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={1.1} toneMapped={false} />
      </RoundedBox>
    </group>
  );
}

/* --------------------------------------------------------- message cards */

function MessageCard({
  position,
  color,
  delay = 0,
  quality,
}: {
  position: [number, number, number];
  color: string;
  delay?: number;
  quality: Quality;
}) {
  const mesh = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.getElapsedTime() + delay;
    // Slow bob plus a lazy spin — each card drifts out of phase.
    mesh.current.position.y = position[1] + Math.sin(t * 0.7) * 0.14;
    mesh.current.rotation.y = Math.sin(t * 0.35) * 0.5;
    mesh.current.rotation.z = Math.sin(t * 0.28) * 0.14;
  });

  return (
    <group ref={mesh} position={position}>
      <Float speed={1.1} rotationIntensity={0.2} floatIntensity={0.3}>
        <RoundedBox args={[0.66, 0.4, 0.06]} radius={0.09} smoothness={quality === "full" ? 5 : 2}>
          <meshPhysicalMaterial
            color="#0e1730"
            roughness={0.25}
            metalness={0.6}
            transparent
            opacity={0.9}
            emissive={color}
            emissiveIntensity={0.4}
          />
        </RoundedBox>
        {/* Accent stripe so each card is colour-coded */}
        <mesh position={[-0.2, 0.05, 0.04]}>
          <planeGeometry args={[0.2, 0.05]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
        {/* Two faint text lines */}
        <mesh position={[0, -0.06, 0.04]}>
          <planeGeometry args={[0.42, 0.03]} />
          <meshBasicMaterial color="#cbd5e1" transparent opacity={0.45} />
        </mesh>
        <mesh position={[-0.06, -0.13, 0.04]}>
          <planeGeometry args={[0.3, 0.03]} />
          <meshBasicMaterial color="#cbd5e1" transparent opacity={0.3} />
        </mesh>
      </Float>
    </group>
  );
}

/* ------------------------------------------------------------ paper plane */

/** A stylised send motif built from two triangles — no external model needed. */
function PaperPlane({ quality }: { quality: Quality }) {
  const group = useRef<THREE.Group>(null);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    // Upper wing + lower wing, sharing the nose edge.
    const verts = new Float32Array([
      0, 0, 0, -0.9, 0.45, 0, -0.9, -0.45, 0, // body triangle
      0, 0, 0, -0.9, -0.45, 0, -0.35, -0.1, 0.16, // folded flap
    ]);
    g.setAttribute("position", new THREE.BufferAttribute(verts, 3));
    g.computeVertexNormals();
    return g;
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;
    const d = Math.min(delta, 0.05);
    group.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.16;
    group.current.position.y = 1.05 + Math.sin(state.clock.getElapsedTime() * 0.8) * 0.1;
    group.current.rotation.y += d * 0.4;
  });

  return (
    <group ref={group} position={[0.05, 1.05, 0.2]} scale={0.62}>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color={ELECTRIC}
          emissive={NEON}
          emissiveIntensity={quality === "full" ? 1.2 : 0.7}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------- core/ring */

function EnergyCore({ quality }: { quality: Quality }) {
  const core = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    const d = Math.min(delta, 0.05);
    if (core.current) {
      core.current.rotation.y -= d * 0.5;
      core.current.rotation.x += d * 0.2;
    }
    if (ring.current) ring.current.rotation.z += d * 0.35;
  });

  return (
    <group position={[0, 0, -1.5]}>
      <mesh ref={core}>
        <icosahedronGeometry args={[0.5, quality === "full" ? 2 : 1]} />
        <meshStandardMaterial
          color={ACCENT}
          emissive={ACCENT}
          emissiveIntensity={1.4}
          wireframe={quality === "lite"}
          toneMapped={false}
        />
      </mesh>
      <Torus ref={ring} args={[0.95, 0.006, 8, quality === "full" ? 96 : 48]}>
        <meshBasicMaterial color={NEON} transparent opacity={0.55} toneMapped={false} />
      </Torus>
    </group>
  );
}

/* --------------------------------------------------------------- particles */

function Particles({ count = 90, enabled }: { count?: number; enabled: boolean }) {
  const points = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (points.current) points.current.rotation.y += Math.min(delta, 0.05) * 0.03;
  });

  if (!enabled) return null;

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color={NEON} transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

/* ------------------------------------------------------- quality controller */

/** Watch the frame rate and demote to `lite` if the device cannot keep up. */
function useAdaptiveQuality(): Quality {
  const [quality, setQuality] = useState<Quality>(() => {
    if (typeof window === "undefined") return "lite";
    return isConstrainedDevice() ? "lite" : "full";
  });
  const frames = useRef(0);
  const last = useRef(0);
  const demoted = useRef(false);

  useEffect(() => {
    frames.current = 0;
    last.current = performance.now();
  }, [quality]);

  useEffect(() => {
    if (quality === "lite" || demoted.current) return;
    let raf = 0;
    const tick = () => {
      frames.current += 1;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const sample = window.setInterval(() => {
      const now = performance.now();
      const elapsed = (now - last.current) / 1000;
      if (elapsed <= 0) return;
      const fps = frames.current / elapsed;
      frames.current = 0;
      last.current = now;
      // Two consecutive bad samples before demoting, to ignore one-off stalls.
      if (fps > 0 && fps < 28 && !demoted.current) {
        demoted.current = true;
        setQuality("lite");
      }
    }, 2500);

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(sample);
    };
  }, [quality]);

  return quality;
}

/* ------------------------------------------------------------------ scene */

export default function HeroScene() {
  const quality = useAdaptiveQuality();
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);

    // Pause rendering entirely while the tab is hidden — battery friendly.
    const onVis = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    onVis();

    return () => {
      mq.removeEventListener("change", onChange);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const full = quality === "full" && !reduced;

  return (
    <Canvas
      camera={{ position: [0, 0, 5.4], fov: 46 }}
      dpr={full ? [1, 1.75] : 1}
      frameloop={reduced || !visible ? "demand" : "always"}
      gl={{
        antialias: full,
        alpha: true,
        powerPreference: full ? "high-performance" : "low-power",
        stencil: false,
      }}
      style={{ touchAction: "pan-y", pointerEvents: "none" }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 5, 5]} intensity={1.4} color="#a78bfa" />
      <pointLight position={[-5, -2, 2]} intensity={2.2} color={NEON} />
      <pointLight position={[3, 3, -3]} intensity={1.4} color={ELECTRIC} />

      <ConsoleSlab quality={quality} />
      <PaperPlane quality={quality} />
      <EnergyCore quality={quality} />

      <MessageCard position={[-2.25, 0.75, 0.5]} color={ELECTRIC} delay={0} quality={quality} />
      <MessageCard position={[2.3, -0.1, 0.7]} color={ACCENT} delay={1.4} quality={quality} />
      <MessageCard position={[-1.95, -0.95, 0.2]} color={NEON} delay={2.6} quality={quality} />

      {full && (
        <Particles count={90} enabled />
      )}
    </Canvas>
  );
}