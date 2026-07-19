import { Canvas } from '@react-three/fiber'
import { Float, ContactShadows } from '@react-three/drei'
import { useMemo } from 'react'

function Building({
  position,
  size,
  color,
}: {
  position: [number, number, number]
  size: [number, number, number]
  color: string
}) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.45} metalness={0.15} />
    </mesh>
  )
}

function CityCluster() {
  const buildings = useMemo(
    () =>
      [
        { position: [-1.4, 0.7, 0.2] as [number, number, number], size: [0.55, 1.4, 0.55] as [number, number, number], color: '#2f8f86' },
        { position: [-0.55, 1.1, -0.1] as [number, number, number], size: [0.7, 2.2, 0.7] as [number, number, number], color: '#1f2a28' },
        { position: [0.35, 0.85, 0.15] as [number, number, number], size: [0.6, 1.7, 0.6] as [number, number, number], color: '#e07020' },
        { position: [1.2, 0.55, -0.2] as [number, number, number], size: [0.5, 1.1, 0.5] as [number, number, number], color: '#c9a227' },
        { position: [0.1, 0.35, 1.0] as [number, number, number], size: [1.8, 0.08, 1.2] as [number, number, number], color: '#d7d2c8' },
      ] as const,
    [],
  )

  return (
    <Float speed={1.2} rotationIntensity={0.18} floatIntensity={0.35}>
      <group rotation={[-0.15, 0.55, 0]} position={[0, -0.2, 0]}>
        {buildings.map((b, i) => (
          <Building key={i} {...b} />
        ))}
      </group>
    </Float>
  )
}

export function HeroScene() {
  const reduceMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (reduceMotion) return null

  return (
    <div className="hero-3d" aria-hidden="true">
      <Canvas camera={{ position: [3.2, 2.2, 4.2], fov: 38 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.65} />
        <directionalLight position={[4, 6, 2]} intensity={1.15} castShadow />
        <CityCluster />
        <ContactShadows opacity={0.35} scale={10} blur={2.5} far={4} />
      </Canvas>
    </div>
  )
}
