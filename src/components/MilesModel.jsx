import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, Billboard } from '@react-three/drei';
import * as THREE from 'three';

export function MilesModel({ swinging = false, hanging = false, upsideDown = false, velocity = { x: 0, y: 0, z: 0 } }) {
  const groupRef = useRef();
  const texture = useTexture('/miles.png');

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    if (swinging) {
      // Swinging pose: slight tilt forward
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -0.4, 0.1);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, 0.1);
    } else if (upsideDown) {
      // Upside down pose: 180 flip
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, Math.PI, 0.1);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.1);
    } else if (hanging) {
      // Hanging from ledge pose
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, 0.1);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0.2, 0.1);
    } else {
      // Idle
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.1);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, 0.1);
    }
    
    // Slight bobbing based on velocity
    const speed = Math.sqrt(velocity.x ** 2 + velocity.z ** 2);
    if (!swinging && !upsideDown && !hanging) {
      groupRef.current.position.y = Math.sin(t * 8) * Math.min(speed * 0.02, 0.2);
    } else {
      groupRef.current.position.y = 0;
    }
  });

  return (
    <group ref={groupRef} scale={[12.0, 12.0, 12.0]}>
      {/* Dynamic Lighting Highlights */}
      <pointLight position={[-3, 1, 1]} color="#ff0055" intensity={15} distance={10} />
      <pointLight position={[3, 1, -1]} color="#00e5ff" intensity={15} distance={10} />

      <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
        <mesh castShadow receiveShadow>
          <planeGeometry args={[1.5, 1.5]} />
          <meshStandardMaterial 
            map={texture} 
            emissiveMap={texture}
            emissive="#ffffff"
            emissiveIntensity={0.8}
            transparent 
            alphaTest={0.1}
            side={THREE.DoubleSide} 
            roughness={0.4}
            toneMapped={false}
          />
        </mesh>
      </Billboard>
    </group>
  );
}
