import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export function Checkpoints({ started, checkpoints, onSelectCheckpoint, activeTarget }) {
  if (!started) return null;

  return (
    <group>
      {checkpoints.map((cp) => (
        <CheckpointOrb
          key={cp.id}
          checkpoint={cp}
          isActive={activeTarget?.id === cp.id}
          onClick={() => onSelectCheckpoint(cp)}
        />
      ))}
    </group>
  );
}

function CheckpointOrb({ checkpoint, isActive, onClick }) {
  const groupRef = useRef();
  const outerRef = useRef();
  const innerRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (groupRef.current) {
      // Gentle float
      groupRef.current.position.y =
        checkpoint.position[1] + Math.sin(t * 1.5 + checkpoint.position[0] * 0.1) * 2;
    }

    if (outerRef.current) {
      outerRef.current.scale.setScalar(1 + Math.sin(t * 2.5) * 0.15);
      outerRef.current.material.opacity = 0.08 + Math.sin(t * 2) * 0.04;
    }

    if (innerRef.current) {
      innerRef.current.rotation.y = t * 0.5;
      innerRef.current.rotation.z = Math.sin(t * 0.7) * 0.2;
    }

    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = t * 1.2;
      ring1Ref.current.rotation.y = t * 0.8;
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = Math.PI / 2 + Math.sin(t) * 0.3;
      ring2Ref.current.rotation.z = t * 1.5;
    }
  });

  const colors = {
    intro: { main: '#00e5ff', glow: '#00e5ff', emoji: '🕷️' },
    projects: { main: '#ff00cc', glow: '#ff00cc', emoji: '🕸️' },
    socials: { main: '#9d00ff', glow: '#9d00ff', emoji: '⚡' },
  };
  const c = colors[checkpoint.id] || { main: '#ff0055', glow: '#ff0055', emoji: '●' };

  return (
    <group ref={groupRef} position={checkpoint.position}>
      {/* Outer bubbly glow — reduced size to prevent text overlap */}
      <mesh ref={outerRef}>
        <sphereGeometry args={[8, 32, 32]} />
        <meshBasicMaterial color={c.glow} transparent opacity={0.06} depthWrite={false} />
      </mesh>

      {/* Middle translucent sphere — reduced */}
      <mesh>
        <sphereGeometry args={[5.5, 24, 24]} />
        <meshPhysicalMaterial
          color={c.main}
          transparent
          opacity={0.12}
          roughness={0}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* Larger invisible hit mesh for better click detection */}
      <mesh
        position={[0, 0, 0]}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <sphereGeometry args={[10, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Inner solid orb */}
      <mesh
        ref={innerRef}
      >
        <sphereGeometry args={[4.5, 20, 20]} />
        <meshStandardMaterial
          color={isActive ? '#ffffff' : c.main}
          emissive={c.main}
          emissiveIntensity={isActive ? 8 : 4}
          toneMapped={false}
        />
      </mesh>

      {/* Environmental Lighting */}
      <pointLight 
        color={c.main} 
        intensity={isActive ? 80 : 40} 
        distance={60} 
      />

      {/* Orbiting ring 1 */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[5.5, 0.15, 8, 48]} />
        <meshBasicMaterial color={c.main} transparent opacity={0.35} toneMapped={false} />
      </mesh>

      {/* Orbiting ring 2 */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[7, 0.1, 8, 48]} />
        <meshBasicMaterial color={c.main} transparent opacity={0.2} toneMapped={false} />
      </mesh>

      {/* Particle dots around the orb */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 8, Math.sin(angle) * 8, 0]}>
            <sphereGeometry args={[0.25, 6, 6]} />
            <meshBasicMaterial color={c.main} toneMapped={false} />
          </mesh>
        );
      })}

      {/* Label — positioned well above aura, renders on top */}
      <Text
        position={[0, 18, 0]}
        fontSize={4}
        color="#ffffff"
        outlineWidth={0.3}
        outlineColor={c.main}
        fillOpacity={1}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.08}
        depthTest={false}
        renderOrder={10}
      >
        {checkpoint.title}
        <meshBasicMaterial
          color="#ffffff"
          toneMapped={false}
          depthTest={false}
        />
      </Text>

      {/* Subtitle hint */}
      <Text
        position={[0, 13.5, 0]}
        fontSize={1.4}
        color="#cccccc"
        outlineWidth={0.08}
        outlineColor="#000000"
        fillOpacity={0.85}
        anchorX="center"
        anchorY="middle"
        depthTest={false}
        renderOrder={10}
      >
        {'[ CLICK TO SWING ]'}
        <meshBasicMaterial
          color="#cccccc"
          toneMapped={false}
          depthTest={false}
        />
      </Text>
    </group>
  );
}
