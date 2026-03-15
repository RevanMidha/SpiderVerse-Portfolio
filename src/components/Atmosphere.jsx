import React, { useMemo } from 'react';
import { Stars } from '@react-three/drei';
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Noise,
  Vignette,
  Scanline,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';

/* ---- Spider-Verse Stylized Moon ---- */
function StylizedMoon({ started }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current || !started) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    meshRef.current.rotation.z = state.clock.elapsedTime * 0.02;
  });

  return (
    <group ref={meshRef} position={[-50, 250, -500]}>
      {/* Outer wireframe glow */}
      <mesh>
        <icosahedronGeometry args={[120, 2]} />
        <meshBasicMaterial 
          color="#ff0055" 
          wireframe={true} 
          transparent 
          opacity={started ? 0.3 : 0.6}
          toneMapped={false}
        />
      </mesh>
      {/* Inner solid void */}
      <mesh>
        <icosahedronGeometry args={[118, 1]} />
        <meshBasicMaterial 
          color="#050114" 
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/* ---- Floating Sparks (Dimension Glitch Particles) ---- */
function SparkParticles({ started }) {
  const meshRef = useRef();
  const data = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 60; i++) {
      arr.push({
        pos: [
          (Math.random() - 0.5) * 100,
          Math.random() * 80,
          (Math.random() - 0.5) * 100,
        ],
        speed: 0.1 + Math.random() * 0.2,
      });
    }
    return arr;
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    data.forEach((c, i) => {
      c.pos[1] += c.speed * delta * 15;
      if (c.pos[1] > 100) c.pos[1] = 0;
      dummy.position.set(...c.pos);
      // Gentle wobble
      dummy.position.x += Math.sin(state.clock.elapsedTime * 2 + i) * 0.05;
      dummy.position.z += Math.cos(state.clock.elapsedTime * 2 + i) * 0.05;
      dummy.scale.setScalar(0.2 + Math.random() * 0.15);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, data.length]} visible={started}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#ffaa00" toneMapped={false} />
    </instancedMesh>
  );
}

function VisualEffects({ started }) {
  return (
    <EffectComposer disableNormalPass>
      <Bloom
        luminanceThreshold={0.4}
        luminanceSmoothing={0.4}
        mipmapBlur
        intensity={started ? 1.0 : 1.5}
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={started ? [0.0002, 0.0002] : [0.001, 0.001]}
      />
      <Noise blendFunction={BlendFunction.OVERLAY} opacity={started ? 0.015 : 0.03} />
      <Vignette eskil={false} offset={0.1} darkness={0.9} />
    </EffectComposer>
  );
}

/* ---- Neon clouds for title screen (purplish dark) ---- */
function NeonClouds({ opacity = 0.12 }) {
  const meshRef = useRef();
  
  const data = useMemo(() => {
    const arr = [];
    const colors = ['#ff0055', '#9d00ff', '#00e5ff'];
    for (let i = 0; i < 35; i++) {
      arr.push({
        pos: [
          (Math.random() - 0.5) * 600,
          80 + Math.random() * 80,
          (Math.random() - 0.5) * 600,
        ],
        scale: [20 + Math.random() * 40, 2 + Math.random() * 4, 15 + Math.random() * 30],
        color: colors[Math.floor(Math.random() * 3)],
      });
    }
    return arr;
  }, []);

  useEffect(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    data.forEach((c, i) => {
      dummy.position.set(...c.pos);
      dummy.scale.set(...c.scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      meshRef.current.setColorAt(i, new THREE.Color(c.color));
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [data]);

  return (
    <instancedMesh ref={meshRef} args={[null, null, data.length]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial transparent opacity={opacity} vertexColors />
    </instancedMesh>
  );
}

export function Atmosphere({ started }) {
  return (
    <>
      {/* ---- Lighting ---- */}
      <ambientLight intensity={started ? 0.6 : 1.5} color={started ? "#331a5a" : "#4b0082"} />
      <directionalLight
        position={started ? [100, 200, 50] : [10, 50, -20]}
        intensity={started ? 1.2 : 1.5}
        color={started ? "#b088cc" : "#ff0055"}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={400}
        shadow-camera-near={0.5}
        shadow-camera-left={-150}
        shadow-camera-right={150}
        shadow-camera-top={150}
        shadow-camera-bottom={-150}
      />
      <directionalLight 
        position={started ? [-80, 100, -50] : [-10, 30, 20]} 
        intensity={started ? 0.2 : 0.8} 
        color={started ? "#4b0082" : "#00e5ff"} 
      />
      <hemisphereLight 
        args={started ? ['#1a0a2e', '#0a0020', 0.5] : ['#1a0a2e', '#0a0020', 0.0]} 
        intensity={started ? 0.5 : 0} 
      />
      <pointLight 
        position={[0, 100, 0]} 
        intensity={started ? 0 : 2.0} 
        distance={400} 
        color="#9d00ff" 
      />

      {/* ---- Sky ---- */}
      <Stars 
        radius={300} 
        depth={100} 
        count={started ? 4000 : 500} 
        factor={started ? 5 : 6} 
        saturation={started ? 0.6 : 0.8} 
        fade 
        speed={started ? 0.5 : 0} 
      />
      <fog 
        attach="fog" 
        args={['#0a0020', 30, 500]} 
        near={started ? 100 : 30}
        far={started ? 600 : 500}
      />
      
      {/* Spider-Verse Stylized Moon */}
      <StylizedMoon started={started} />

      {started && <NeonClouds opacity={0.08} />}
      {started && <SparkParticles started={started} />}

      {/* ---- Spider-Verse post-processing ---- */}
      <VisualEffects started={started} />
    </>
  );
}
