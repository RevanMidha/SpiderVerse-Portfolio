import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Billboard, useTexture, Text } from '@react-three/drei';

export default function PlayerSlinger({ started, zoomedNode }) {
  const groupRef = useRef();
  const webRef = useRef();
  const [milesPos, setMilesPos] = useState(new THREE.Vector3(0, 120, 200));
  const [curve, setCurve] = useState(null);
  const [showThwip, setShowThwip] = useState(false);
  const progress = useRef(0);
  const swinging = useRef(false);
  const milesTexture = useTexture('/miles.png');

  // When target node changes, start a swing
  useEffect(() => {
    if (!started || !zoomedNode) return;
    const start = milesPos.clone();
    const end = new THREE.Vector3(...zoomedNode).add(new THREE.Vector3(0, 10, 40));
    const ctrl = start.clone().lerp(end, 0.5);
    ctrl.y += 120;
    setCurve(new THREE.QuadraticBezierCurve3(start, ctrl, end));
    progress.current = 0;
    swinging.current = true;
    setShowThwip(true);
    setTimeout(() => setShowThwip(false), 700);
    const sfx = document.getElementById('thwip-sfx');
    if (sfx) { sfx.currentTime = 0; sfx.play().catch(() => {}); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomedNode, started]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (swinging.current && curve) {
      progress.current = Math.min(1, progress.current + delta * 1.2);
      const pt = curve.getPoint(progress.current);
      groupRef.current.position.copy(pt);
      setMilesPos(pt.clone());

      // Swing FOV
      const speed = Math.sin(progress.current * Math.PI);
      state.camera.fov = THREE.MathUtils.lerp(state.camera.fov, 65 + speed * 20, 0.1);
      state.camera.updateProjectionMatrix();

      // Web line
      if (webRef.current && progress.current < 0.95 && zoomedNode) {
        const hand = pt.clone().add(new THREE.Vector3(6, 3, 0));
        const anchor = new THREE.Vector3(...zoomedNode);
        anchor.y += 180;
        const geo = new THREE.TubeGeometry(new THREE.LineCurve3(hand, anchor), 10, 0.6, 6, false);
        if (webRef.current.geometry) webRef.current.geometry.dispose();
        webRef.current.geometry = geo;
        webRef.current.visible = true;
      } else if (webRef.current) {
        webRef.current.visible = false;
      }

      if (progress.current >= 1) {
        swinging.current = false;
        state.camera.fov = 65;
        state.camera.updateProjectionMatrix();
      }
    } else if (started && !swinging.current) {
      // Idle bob
      const t = state.clock.getElapsedTime();
      groupRef.current.position.y = milesPos.y + Math.sin(t * 1.8) * 3;

      // Reset FOV
      state.camera.fov = THREE.MathUtils.lerp(state.camera.fov, 65, 0.05);
      state.camera.updateProjectionMatrix();

      if (webRef.current) webRef.current.visible = false;
    }

    // Update minimap player dot
    const dot = document.getElementById('minimap-player');
    if (dot && groupRef.current) {
      const pos = groupRef.current.position;
      dot.style.left = `${((pos.x + 1600) / 3200) * 100}%`;
      dot.style.top  = `${((pos.z + 1600) / 3200) * 100}%`;
    }
  });

  if (!started) return null;

  return (
    <group>
      {/* Miles sprite */}
      <group ref={groupRef} position={milesPos.toArray()}>
        <Billboard follow args={[1, 1]}>
          <mesh>
            <planeGeometry args={[55, 55]} />
            <meshBasicMaterial map={milesTexture} transparent depthTest={false} />
          </mesh>
          {/* Eye glow */}
          <mesh position={[0, 10, 0.5]}>
            <planeGeometry args={[18, 6]} />
            <meshBasicMaterial color="#00f3ff" transparent opacity={0.5} />
          </mesh>
          {/* Idle web strand */}
          {!swinging.current && (
            <mesh position={[0, 150, 0]}>
              <boxGeometry args={[0.4, 300, 0.4]} />
              <meshStandardMaterial color="white" emissive="white" emissiveIntensity={4} />
            </mesh>
          )}
          {/* THWIP! comic text */}
          {showThwip && (
            <Text position={[30, 25, 0]} fontSize={9} color="#ff0066" anchorX="left" outlineWidth={0.4} outlineColor="#fff">
              THWIP!
            </Text>
          )}
        </Billboard>
      </group>

      {/* Swinging web line */}
      <mesh ref={webRef} visible={false}>
        <meshStandardMaterial color="#ffffff" emissive="#00f3ff" emissiveIntensity={3} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}
