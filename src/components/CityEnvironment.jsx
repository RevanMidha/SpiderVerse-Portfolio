import React, { useMemo, useRef, useEffect } from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function CityEnvironment({ started }) {
  const gridSize = 6;
  const blockSize = 28;
  const streetWidth = 14;

  /* ---- Window texture ---- */
  const windowTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, 128, 256);

    for (let y = 0; y < 256; y += 16) {
      ctx.fillStyle = '#111122';
      ctx.fillRect(0, y, 128, 1);
    }

    for (let x = 6; x < 128; x += 18) {
      for (let y = 4; y < 256; y += 16) {
        const lit = Math.random() > 0.70; // Better density for rich aesthetics
        if (lit) {
          const colors = [
            '#ff0055', '#9d00ff', '#00e5ff', '#ff00aa', '#00ffff'
          ];
          const color = colors[Math.floor(Math.random() * colors.length)];
          ctx.fillStyle = color;
          ctx.globalAlpha = 0.9;
          ctx.fillRect(x, y, 10, 8);
          
          // Outer glow for the window in the texture
          ctx.shadowBlur = 15;
          ctx.shadowColor = color;
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, 10, 8);
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = '#000005'; // Almost black for unlit windows
          ctx.globalAlpha = 1;
          ctx.fillRect(x, y, 10, 8);
        }
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);

  /* ---- Road texture ---- */
  const roadTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1a1a1f';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 2000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#222228' : '#151518';
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random(), 1 + Math.random());
    }
    ctx.fillStyle = '#ccaa00';
    ctx.globalAlpha = 0.7;
    for (let y = 0; y < 256; y += 30) {
      ctx.fillRect(124, y, 8, 18);
    }
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(40, 0, 3, 256);
    ctx.fillRect(213, 0, 3, 256);
    ctx.globalAlpha = 1;
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 8);
    return tex;
  }, []);

  /* ---- Buildings ---- */
  const buildings = useMemo(() => {
    const list = [];
    const rng = (seed) => {
      let s = seed;
      return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    };
    const rand = rng(42);
    for (let x = -gridSize; x <= gridSize; x++) {
      for (let z = -gridSize; z <= gridSize; z++) {
        const posX = x * (blockSize + streetWidth);
        const posZ = z * (blockSize + streetWidth);

        // ALWAYS CLEAR the immediate starting block and central interaction lane
        if (Math.abs(x) < 2 && Math.abs(z) < 2) continue;
        if (Math.abs(posX) < 55 && posZ > -40 && posZ < 250) continue;
        
        if (rand() > 0.82) continue;

        const dist = Math.sqrt(x * x + z * z);
        const maxH = Math.max(30, 140 - dist * 6);
        const height = 20 + rand() * maxH;
        const width = blockSize * (0.5 + rand() * 0.5);
        const depth = blockSize * (0.5 + rand() * 0.5);

        const neonOptions = ['#ff0055', '#00e5ff', '#9d00ff', '#ff8800'];
        const neonColor = rand() > 0.40
          ? neonOptions[Math.floor(rand() * neonOptions.length)]
          : null;

        const facades = ['#181824', '#201f30', '#151525', '#1e1b30', '#25203a'];
        const facade = facades[Math.floor(rand() * facades.length)];

        list.push({
          position: [posX, height / 2, posZ],
          scale: [width, height, depth],
          neonColor,
          facade,
          // Store building bounds for car avoidance
          bounds: {
            minX: posX - width / 2 - 2,
            maxX: posX + width / 2 + 2,
            minZ: posZ - depth / 2 - 2,
            maxZ: posZ + depth / 2 + 2,
          },
        });
      }
    }
    return list;
  }, []);

  /* ---- Instanced buildings ---- */
  const meshRef = useRef();

  useEffect(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    buildings.forEach((b, i) => {
      dummy.position.set(...b.position);
      dummy.scale.set(...b.scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      meshRef.current.setColorAt(i, new THREE.Color(b.facade));
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [buildings]);

  /* ---- Traffic — cars stay on roads, avoid buildings ---- */
  const trafficCount = 40;
  const trafficRef = useRef();

  const carColors = useMemo(() => [
    '#cc2222', '#2255cc', '#ddcc00', '#ffffff', '#333333',
    '#ee5500', '#00aa55', '#aa22dd', '#55aadd', '#dd2288',
  ], []);

  const trafficData = useMemo(() => {
    const data = [];
    const roadPositions = [];

    // Generate valid road positions (center of each street)
    for (let i = -gridSize; i <= gridSize; i++) {
      roadPositions.push({ axis: 'x', pos: i * (blockSize + streetWidth), lane: 1 });
      roadPositions.push({ axis: 'x', pos: i * (blockSize + streetWidth), lane: -1 });
      roadPositions.push({ axis: 'z', pos: i * (blockSize + streetWidth), lane: 1 });
      roadPositions.push({ axis: 'z', pos: i * (blockSize + streetWidth), lane: -1 });
    }

    for (let i = 0; i < trafficCount; i++) {
      const road = roadPositions[Math.floor(Math.random() * roadPositions.length)];
      const laneOffset = road.lane * (streetWidth * 0.2);
      const startPos = (Math.random() - 0.5) * gridSize * 2 * (blockSize + streetWidth);

      const pos = road.axis === 'z'
        ? new THREE.Vector3(road.pos + laneOffset, 0.8, startPos)
        : new THREE.Vector3(startPos, 0.8, road.pos + laneOffset);

      const dir = road.axis === 'z'
        ? new THREE.Vector3(0, 0, road.lane)
        : new THREE.Vector3(road.lane, 0, 0);

      data.push({
        pos,
        dir,
        speed: 15 + Math.random() * 25,
        color: new THREE.Color(carColors[Math.floor(Math.random() * carColors.length)]),
        axis: road.axis,
      });
    }
    return data;
  }, [carColors]);

  useFrame((_, delta) => {
    if (!trafficRef.current || !started) return;
    const limit = gridSize * (blockSize + streetWidth);
    const dummy = new THREE.Object3D();

    trafficData.forEach((t, i) => {
      t.pos.addScaledVector(t.dir, t.speed * delta);
      // Wrap around
      if (t.pos.x > limit) t.pos.x = -limit;
      if (t.pos.x < -limit) t.pos.x = limit;
      if (t.pos.z > limit) t.pos.z = -limit;
      if (t.pos.z < -limit) t.pos.z = limit;

      dummy.position.copy(t.pos);
      // Car proportions — wider, flatter, longer
      dummy.scale.set(2.2, 1, 4.5);
      if (t.axis === 'z') dummy.rotation.set(0, 0, 0);
      else dummy.rotation.set(0, Math.PI / 2, 0);
      dummy.updateMatrix();
      trafficRef.current.setMatrixAt(i, dummy.matrix);
      trafficRef.current.setColorAt(i, t.color);
    });
    trafficRef.current.instanceMatrix.needsUpdate = true;
    if (trafficRef.current.instanceColor)
      trafficRef.current.instanceColor.needsUpdate = true;
  });

  /* ---- Street lights ---- */
  const streetLights = useMemo(() => {
    const lights = [];
    for (let x = -4; x <= 4; x += 4) { // Reduced density
      for (let z = -4; z <= 4; z += 4) {
        if (Math.abs(x) < 2 && Math.abs(z) < 2) continue;
        lights.push([
          x * (blockSize + streetWidth) + streetWidth * 0.4,
          0,
          z * (blockSize + streetWidth) + streetWidth * 0.4,
        ]);
      }
    }
    return lights;
  }, []);

  return (
    <group>
      {/* Ground */}
      <RigidBody type="fixed" friction={2}>
        <mesh position={[0, -0.5, 0]} receiveShadow>
          <boxGeometry args={[800, 1, 800]} />
          <meshStandardMaterial color="#050510" roughness={0.95} />
        </mesh>
      </RigidBody>

      {/* Neon grid */}
      <group position={[0, 0.12, 0]}>
        <gridHelper
          args={[800, Math.round(800 / (blockSize + streetWidth)), '#ff0055', '#00e5ff']}
        />
      </group>

      {/* Road surfaces - combined into two large planes instead of many small ones */}
      <group position={[0, 0.05, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[800, 800]} />
          <meshStandardMaterial 
            map={roadTexture} 
            color="#2a2a3a" 
            roughness={0.10} 
            metalness={0.9} 
          />
        </mesh>
      </group>

      {/* Building colliders */}
      {buildings.map((b, i) => (
        <RigidBody key={`col-${i}`} type="fixed" position={b.position} colliders={false}>
          <CuboidCollider args={[b.scale[0] / 2, b.scale[1] / 2, b.scale[2] / 2]} />
        </RigidBody>
      ))}

      {/* Buildings */}
      <instancedMesh 
        ref={meshRef} 
        args={[null, null, buildings.length]} 
        receiveShadow 
        castShadow
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          map={windowTexture} 
          emissiveMap={windowTexture}
          emissive={new THREE.Color('#ffffff')}
          emissiveIntensity={1.2}
          roughness={0.9} 
          metalness={0.1} 
        />
      </instancedMesh>

      {/* Neon accents on buildings - Instanced */}
      <NeonAccents buildings={buildings} />

      {/* Street lights - Instanced */}
      <InstancedStreetLights lights={streetLights} />

      {/* Cars */}
      <instancedMesh 
        ref={trafficRef} 
        args={[null, null, trafficCount]} 
        castShadow
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.3} metalness={0.6} />
      </instancedMesh>
    </group>
  );
}

function NeonAccents({ buildings }) {
  const meshRef = useRef();
  const neonBuildings = useMemo(() => buildings.filter(b => b.neonColor), [buildings]);

  useEffect(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    neonBuildings.forEach((b, i) => {
      dummy.position.set(b.position[0], b.scale[1] + 0.3, b.position[2]);
      dummy.scale.set(b.scale[0] * 0.9, 1.2, b.scale[2] * 0.9);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      meshRef.current.setColorAt(i, new THREE.Color(b.neonColor));
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [neonBuildings]);

  return (
    <instancedMesh ref={meshRef} args={[null, null, neonBuildings.length]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial toneMapped={false} vertexColors />
    </instancedMesh>
  );
}

function InstancedStreetLights({ lights }) {
  const poleRef = useRef();
  const bulbRef = useRef();

  useEffect(() => {
    if (!poleRef.current || !bulbRef.current) return;
    const dummy = new THREE.Object3D();
    lights.forEach((pos, i) => {
      // Pole
      dummy.position.set(pos[0], 5, pos[2]);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      poleRef.current.setMatrixAt(i, dummy.matrix);

      // Bulb
      dummy.position.set(pos[0], 10.5, pos[2]);
      dummy.updateMatrix();
      bulbRef.current.setMatrixAt(i, dummy.matrix);
    });
    poleRef.current.instanceMatrix.needsUpdate = true;
    bulbRef.current.instanceMatrix.needsUpdate = true;
  }, [lights]);

  return (
    <group>
      <instancedMesh ref={poleRef} args={[null, null, lights.length]} frustumCulled={false}>
        <cylinderGeometry args={[0.15, 0.2, 10, 4]} />
        <meshStandardMaterial color="#444455" metalness={0.6} roughness={0.4} />
      </instancedMesh>
      <instancedMesh ref={bulbRef} args={[null, null, lights.length]} frustumCulled={false}>
        <sphereGeometry args={[0.5, 6, 6]} />
        <meshBasicMaterial color="#ffeeaa" toneMapped={false} />
      </instancedMesh>
    </group>
  );
}
