import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Icosahedron, Torus, Sphere } from "@react-three/drei";
import { useRef, Suspense } from "react";
import * as THREE from "three";

function Globe() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.2;
      ref.current.rotation.x += delta * 0.05;
    }
  });
  return (
    <Float speed={1.4} rotationIntensity={0.6} floatIntensity={1.2}>
      <Icosahedron ref={ref} args={[1.4, 4]}>
        <MeshDistortMaterial
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={0.35}
          distort={0.35}
          speed={1.6}
          roughness={0.15}
          metalness={0.85}
          wireframe={false}
        />
      </Icosahedron>
      <Icosahedron args={[1.45, 1]}>
        <meshBasicMaterial color="#a78bfa" wireframe transparent opacity={0.25} />
      </Icosahedron>
    </Float>
  );
}

function OrbitRing({ radius, tilt, color, speed }: { radius: number; tilt: [number, number, number]; color: string; speed: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * speed;
  });
  return (
    <group rotation={tilt}>
      <Torus ref={ref} args={[radius, 0.012, 16, 128]}>
        <meshBasicMaterial color={color} transparent opacity={0.55} />
      </Torus>
    </group>
  );
}

function Particles() {
  const ref = useRef<THREE.Points>(null);
  const count = 120;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 2.5 + Math.random() * 1.8;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.05;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#22d3ee" transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

const Scene3D = () => (
  <Canvas
    camera={{ position: [0, 0, 5], fov: 45 }}
    dpr={[1, 2]}
    gl={{ antialias: true, alpha: true }}
    className="!absolute inset-0"
  >
    <Suspense fallback={null}>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1.2} color="#22d3ee" />
      <pointLight position={[-5, -3, -2]} intensity={0.8} color="#a78bfa" />
      <Globe />
      <OrbitRing radius={2.1} tilt={[Math.PI / 2.4, 0.3, 0]} color="#22d3ee" speed={0.4} />
      <OrbitRing radius={2.5} tilt={[Math.PI / 3, -0.4, 0.2]} color="#a78bfa" speed={-0.3} />
      <OrbitRing radius={2.9} tilt={[Math.PI / 2, 0.7, 0]} color="#22d3ee" speed={0.25} />
      <Particles />
    </Suspense>
  </Canvas>
);

export default Scene3D;