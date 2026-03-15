import { useRef, useEffect } from 'react';
import { CameraControls } from '@react-three/drei';

export default function CinematicCamera({ started, zoomedNode }) {
  const controlRef = useRef();

  useEffect(() => {
    if (!controlRef.current) return;
    if (!started) {
      controlRef.current.setLookAt(0, 500, 700, 0, 0, 0, true);
    } else if (!zoomedNode) {
      controlRef.current.setLookAt(0, 250, 450, 0, 80, 0, true);
    } else {
      controlRef.current.setLookAt(
        zoomedNode[0],
        zoomedNode[1] + 60,
        zoomedNode[2] + 180,
        zoomedNode[0],
        zoomedNode[1],
        zoomedNode[2],
        true
      );
    }
  }, [started, zoomedNode]);

  return (
    <CameraControls
      ref={controlRef}
      makeDefault
      minPolarAngle={0.1}
      maxPolarAngle={Math.PI / 2.05}
      minDistance={50}
      maxDistance={2000}
    />
  );
}
