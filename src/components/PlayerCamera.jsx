import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { MilesModel } from './MilesModel';

const BUILDING_TOP_Y = 75; // Raised from 55 for better view
const GROUND_Y = 3;

export function PlayerCamera({ started, targetOrb, onThwip }) {
  const playerRef = useRef();
  const webLineRef = useRef();

  // Camera orbit & lookAt
  const cameraAngle = useRef({ theta: Math.PI, phi: 0.55 });
  const cameraDistance = useRef(35);
  const lookAtTarget = useRef(new THREE.Vector3(0, BUILDING_TOP_Y + 5, 0));
  const isDragging = useRef(false);

  // Intro
  const introPhase = useRef('hanging');
  const introTimer = useRef(0);

  // Return swing state
  const returnStart = useRef(new THREE.Vector3());
  const returnAnchor = useRef(new THREE.Vector3());
  const isReturning = useRef(false);
  const returnTimer = useRef(0);

  const { gl } = useThree();

  // Camera controls
  useEffect(() => {
    if (!started) return;
    let lastX = 0;
    let lastY = 0;
    const onMouseDown = (e) => {
      if (e.button === 2) {
        isDragging.current = true;
        lastX = e.clientX;
        lastY = e.clientY;
      }
    };
    const onMouseUp = (e) => {
      if (e.button === 2) isDragging.current = false;
    };
    const onMouseMove = (e) => {
      if (!isDragging.current) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      cameraAngle.current.theta -= dx * 0.005;
      cameraAngle.current.phi = THREE.MathUtils.clamp(
        cameraAngle.current.phi - dy * 0.005,
        -0.2,
        1.0
      );
    };
    const onContext = (e) => e.preventDefault();
    gl.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    gl.domElement.addEventListener('contextmenu', onContext);
    return () => {
      gl.domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      gl.domElement.removeEventListener('contextmenu', onContext);
    };
  }, [started, gl]);

  // Track previous targetOrb to detect closing
  const prevTargetOrb = useRef(null);

  useFrame((state, delta) => {
    if (!playerRef.current) return;
    const body = playerRef.current;
    const pos = body.translation();
    const currentPosVec = new THREE.Vector3(pos.x, pos.y, pos.z);

    // Track previous targetOrb to detect closing
    // If a panel was just closed, start the return swing
    if (prevTargetOrb.current && !targetOrb && started && introPhase.current === 'playing') {
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      body.setAngvel({ x: 0, y: 0, z: 0 }, true);
      // Start return swing
      returnStart.current.copy(currentPosVec);
      // Pick a building anchor point to swing through (above and to the side)
      const side = returnStart.current.x > 0 ? -1 : 1;
      returnAnchor.current.set(
        returnStart.current.x + side * 30,
        returnStart.current.y + 25,
        returnStart.current.z - 20
      );
      isReturning.current = true;
      returnTimer.current = 0;
      if (onThwip) onThwip();
    }
    prevTargetOrb.current = targetOrb;

    /* ---- Pre-start: static cinematic view ---- */
    if (!started) {
      // Even closer zoom for title screen
      state.camera.position.lerp(new THREE.Vector3(0, BUILDING_TOP_Y + 15, 60), 0.03);
      lookAtTarget.current.lerp(new THREE.Vector3(0, BUILDING_TOP_Y + 5, 0), 0.05);
      state.camera.lookAt(lookAtTarget.current);

      // Keep Miles upside down on ledge
      body.setTranslation({ x: 0, y: BUILDING_TOP_Y + 7, z: 0 }, true);
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);

      introPhase.current = 'hanging';
      introTimer.current = 0;
      return;
    }

    /* ---- Intro: Miles hangs upside down, then lowers down ---- */
    if (introPhase.current === 'hanging') {
      introTimer.current += delta;

      body.setTranslation({ x: 0, y: BUILDING_TOP_Y + 7.5, z: 0 }, true);
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);

      // Camera stay on Miles upside down (wide view)
      state.camera.position.lerp(new THREE.Vector3(0, BUILDING_TOP_Y + 15, 90), 0.05);
      lookAtTarget.current.lerp(new THREE.Vector3(0, BUILDING_TOP_Y + 7, 0), 0.08);
      state.camera.lookAt(lookAtTarget.current);

      if (introTimer.current > 1.5) {
        introPhase.current = 'falling'; // Swing Down Phase
        introTimer.current = 0; // CRITICAL: Reset timer for smooth swing
        if (onThwip) onThwip();
      }
      return;
    }

    if (introPhase.current === 'falling') {
      introTimer.current += delta;

      const targetPos = new THREE.Vector3(0, 45, 148); // In front of orbs
      const startPos = new THREE.Vector3(0, BUILDING_TOP_Y + 7.5, 0);

      // Precision arc swing to destination
      if (introTimer.current < 2.5) {
        const t = Math.min(introTimer.current / 2.0, 1.0);
        const lerpPos = new THREE.Vector3().lerpVectors(startPos, targetPos, t);
        body.setTranslation({ x: lerpPos.x, y: lerpPos.y, z: lerpPos.z }, true);
      } else {
        body.setTranslation({ x: targetPos.x, y: targetPos.y, z: targetPos.z }, true);
        introPhase.current = 'playing';
        introTimer.current = 0;
      }
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);

      const camTargetPos = new THREE.Vector3(0, 55, 200);
      state.camera.position.lerp(camTargetPos, 0.05);
      lookAtTarget.current.lerp(new THREE.Vector3(0, 48, 110), 0.06);
      state.camera.lookAt(lookAtTarget.current);
      return;
    }

    /* ---- Core Gameplay Logic ---- */
    if (introPhase.current === 'playing') {
      // Return swing animation
      if (isReturning.current) {
        returnTimer.current += delta;
        body.setGravityScale(0, true);
        
        const RETURN_DURATION = 1.5;
        const t = Math.min(returnTimer.current / RETURN_DURATION, 1.0);
        const homePos = new THREE.Vector3(0, 45, 148);
        
        // Quadratic bezier: start -> anchor -> home
        const p0 = returnStart.current;
        const p1 = returnAnchor.current;
        const p2 = homePos;
        const oneMinusT = 1 - t;
        const swingPos = new THREE.Vector3(
          oneMinusT * oneMinusT * p0.x + 2 * oneMinusT * t * p1.x + t * t * p2.x,
          oneMinusT * oneMinusT * p0.y + 2 * oneMinusT * t * p1.y + t * t * p2.y,
          oneMinusT * oneMinusT * p0.z + 2 * oneMinusT * t * p1.z + t * t * p2.z
        );
        
        body.setTranslation({ x: swingPos.x, y: swingPos.y, z: swingPos.z }, true);
        body.setLinvel({ x: 0, y: 0, z: 0 }, true);
        
        if (t >= 1.0) {
          isReturning.current = false;
          returnTimer.current = 0;
        }
      } else if (targetOrb) {
        // Zoom in when swinging
        cameraDistance.current = THREE.MathUtils.lerp(cameraDistance.current, 22, 0.08);

        const targetVec = new THREE.Vector3(...targetOrb);
        const direction = new THREE.Vector3().subVectors(targetVec, currentPosVec).normalize();
        const dist = currentPosVec.distanceTo(targetVec);

        if (dist > 14) {
          body.setGravityScale(1, true); // <---------- gravity ON while swinging
          const desiredVel = direction.multiplyScalar(50);
          const currentVel = body.linvel();
          const velDiff = new THREE.Vector3(
            desiredVel.x - currentVel.x,
            desiredVel.y - currentVel.y + 30 * delta, // Add gravity compensation
            desiredVel.z - currentVel.z
          );
          body.applyImpulse(velDiff.multiplyScalar(0.8), true);
        } else {
          // Reached orb - hold position and float
          body.setGravityScale(0, true); // <---------- gravity OFF while hovering
          body.setLinvel({ x: 0, y: Math.sin(state.clock.elapsedTime * 2) * 1, z: 0 }, true);
          const holdPos = new THREE.Vector3().subVectors(targetVec, currentPosVec).multiplyScalar(0.2);
          body.applyImpulse(holdPos, true);
        }
      } else {
        body.setGravityScale(0, true); // <---------- gravity OFF while hovering
        
        // Calculate goal position: central zone + sine wave bobbing
        const targetPos = new THREE.Vector3(0, 45 + Math.sin(state.clock.elapsedTime * 1.5) * 1.5, 148);
        
        // Spring logic: Velocity proportional to distance
        const desiredVel = new THREE.Vector3().subVectors(targetPos, currentPosVec).multiplyScalar(2.5);
        
        const currentVel = body.linvel();
        body.setLinvel({
          x: THREE.MathUtils.lerp(currentVel.x, desiredVel.x, 0.1),
          y: THREE.MathUtils.lerp(currentVel.y, desiredVel.y, 0.1),
          z: THREE.MathUtils.lerp(currentVel.z, desiredVel.z, 0.1)
        }, true);
      }
    }

    /* ---- Third-person & Cinematic camera behavior ---- */
    if (introPhase.current === 'playing') {
      if (isReturning.current || !targetOrb) {
        // IDLE / RETURNING: Maintain the cinematic wide-angle framing
        const camTargetPos = new THREE.Vector3(0, 55, 200);
        state.camera.position.lerp(camTargetPos, 0.05);
        lookAtTarget.current.lerp(new THREE.Vector3(0, 48, 110), 0.06);
        state.camera.lookAt(lookAtTarget.current);
      } else {
        // SWINGING: Active third-person dynamic camera
        const { theta, phi } = cameraAngle.current;
        const camDist = cameraDistance.current;
        const camX = pos.x - Math.sin(theta) * Math.cos(phi) * camDist;
        let camY = pos.y + Math.sin(phi) * camDist + 5;
        const camZ = pos.z - Math.cos(theta) * Math.cos(phi) * camDist;
        camY = Math.max(camY, GROUND_Y);

        state.camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 0.1);
        lookAtTarget.current.lerp(new THREE.Vector3(pos.x, pos.y + 3, pos.z), 0.1);
        state.camera.lookAt(lookAtTarget.current);
      }
    }
  });

  return (
    <>
      <RigidBody
        ref={playerRef}
        type={(started && introPhase.current === 'playing') ? 'dynamic' : 'kinematicPositionBased'}
        position={[0, BUILDING_TOP_Y + 4, 0]}
        colliders="ball"
        mass={2}
        restitution={0.05}
        friction={1}
        linearDamping={0.5}
        angularDamping={2}
        lockRotations
      >
        <MilesModel
          swinging={!!targetOrb}
          hanging={introPhase.current === 'hanging'}
          upsideDown={introPhase.current === 'hanging' || introPhase.current === 'falling'}
          velocity={playerRef.current ? playerRef.current.linvel() : { x: 0, y: 0, z: 0 }}
        />
      </RigidBody>

      {/* Starting ledge with solid physics */}
      <RigidBody type="fixed" position={[0, BUILDING_TOP_Y, 0]}>
        <CuboidCollider args={[6, 0.5, 7]} />
        <group>
          <mesh position={[0, 0, -5]} receiveShadow>
            <boxGeometry args={[12, 1, 14]} />
            <meshStandardMaterial color="#2a2a3a" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.5, 2]} receiveShadow>
            <boxGeometry args={[14, 0.6, 0.5]} />
            <meshStandardMaterial color="#3a3a4a" roughness={0.7} />
          </mesh>
          <mesh position={[-4, 1.2, -8]} castShadow>
            <boxGeometry args={[3, 2.4, 2.5]} />
            <meshStandardMaterial color="#555566" roughness={0.8} metalness={0.3} />
          </mesh>
          <mesh position={[0, 4, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 8, 6]} />
            <meshStandardMaterial color="#444455" roughness={0.6} metalness={0.5} />
          </mesh>
        </group>
      </RigidBody>

      {/* Placeholder line before start */}
      <mesh position={[0, BUILDING_TOP_Y + 4, 0]} visible={!started}>
        <cylinderGeometry args={[0.04, 0.04, 4, 4]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
      </mesh>

      {/* Web line from Miles — always showing during play or when swinging */}
      <group visible={started}>
        {/* Main vertical web line when stationary & not returning */}
        <mesh position={[0, BUILDING_TOP_Y - 5, 0]} visible={!targetOrb && !isReturning.current}>
          <cylinderGeometry args={[0.06, 0.06, 45, 4]} />
          <meshStandardMaterial 
            color="#ffffff" 
            emissive="#ffffff" 
            emissiveIntensity={2} 
            transparent 
            opacity={0.5} 
            toneMapped={false} 
          />
        </mesh>

        {/* Swing web line towards orb */}
        {targetOrb && (
          <WebLine milesRef={playerRef} target={targetOrb} />
        )}

        {/* Return web line to building anchor */}
        <ReturnWebLine milesRef={playerRef} anchorRef={returnAnchor} active={isReturning} />
      </group>
    </>
  );
}

function WebLine({ milesRef, target }) {
  const lineRef = useRef();
  const targetVec = useMemo(() => new THREE.Vector3(...target), [target]);

  useFrame((state) => {
    if (!lineRef.current || !milesRef.current) return;
    const milesPos = milesRef.current.translation();
    const start = new THREE.Vector3(milesPos.x, milesPos.y + 2, milesPos.z);

    const v = new THREE.Vector3().subVectors(targetVec, start);
    const dist = v.length();
    lineRef.current.scale.set(1, dist, 1);
    lineRef.current.position.copy(start).add(v.multiplyScalar(0.5));
    lineRef.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.normalize());

    if (lineRef.current.material) {
      lineRef.current.material.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 15) * 0.5;
    }
  });

  return (
    <mesh ref={lineRef}>
      <cylinderGeometry args={[0.08, 0.08, 1, 4]} />
      <meshStandardMaterial 
        color="#ffffff" 
        emissive="#ffffff" 
        emissiveIntensity={3}
        transparent 
        opacity={0.8} 
        toneMapped={false} 
      />
    </mesh>
  );
}

function ReturnWebLine({ milesRef, anchorRef, active }) {
  const lineRef = useRef();

  useFrame((state) => {
    if (!lineRef.current || !milesRef.current) return;
    if (!active.current) {
      lineRef.current.visible = false;
      return;
    }
    lineRef.current.visible = true;
    const milesPos = milesRef.current.translation();
    const start = new THREE.Vector3(milesPos.x, milesPos.y + 2, milesPos.z);
    const anchor = anchorRef.current;

    const v = new THREE.Vector3().subVectors(anchor, start);
    const dist = v.length();
    lineRef.current.scale.set(1, dist, 1);
    lineRef.current.position.copy(start).add(v.multiplyScalar(0.5));
    lineRef.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.normalize());

    lineRef.current.material.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 15) * 0.5;
  });

  return (
    <mesh ref={lineRef} visible={false}>
      <cylinderGeometry args={[0.06, 0.06, 1, 4]} />
      <meshStandardMaterial 
        color="#ffffff" 
        emissive="#ffffff" 
        emissiveIntensity={3}
        transparent 
        opacity={0.8} 
        toneMapped={false} 
      />
    </mesh>
  );
}
