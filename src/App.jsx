import React, { Suspense, lazy, useState, useRef, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls, Loader, PerformanceMonitor } from '@react-three/drei';

import { Atmosphere } from './components/Atmosphere';
import { TitleOverlay } from './components/SpiderVerseText';
import { UIOverlay } from './components/UIOverlay';
import { useDevicePerformance } from './hooks/useDevicePerformance';

const ContentPanels = lazy(() => import('./components/ContentPanels'));
const StartedWorld = lazy(() => import('./components/StartedWorld'));

const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
  { name: 'jump', keys: ['Space'] },
];

// Checkpoints arranged in an arc BEHIND Miles (lower z = further from camera)
// Miles hovers at z~148, camera at z~195. Orbs at z~110-120 are behind Miles.
const checkpoints = [
  { id: 'intro', position: [-35, 50, 115], title: 'ABOUT ME', panelKey: 'about' },
  { id: 'projects', position: [35, 50, 115], title: 'PROJECTS', panelKey: 'projects' },
  { id: 'socials', position: [0, 55, 100], title: 'SOCIALS', panelKey: 'contact' },
];

export default function App() {
  const deviceProfile = useDevicePerformance();
  const [started, setStarted] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [targetOrb, setTargetOrb] = useState(null);
  const [dpr, setDpr] = useState(deviceProfile.maxDpr);
  const [performanceTier, setPerformanceTier] = useState(deviceProfile.tier);

  const soundtrackRef = useRef(null);
  const themeRef = useRef(null);
  const thwipRef = useRef(null);

  useEffect(() => {
    setDpr((current) => Math.min(current, deviceProfile.maxDpr));
    setPerformanceTier((current) => Math.min(current, deviceProfile.tier));
  }, [deviceProfile]);

  // Centralized Audio Management
  useEffect(() => {
    const theme = themeRef.current;
    const soundtrack = soundtrackRef.current;
    if (!theme || !soundtrack) return;

    if (!started) {
      const triggerMusic = () => {
        if (!started) {
          theme.volume = 0.35;
          theme.muted = false;
          theme.play().catch(() => { });
          window.removeEventListener('mousedown', triggerMusic);
          window.removeEventListener('keydown', triggerMusic);
          window.removeEventListener('touchstart', triggerMusic);
        }
      };

      window.addEventListener('mousedown', triggerMusic);
      window.addEventListener('keydown', triggerMusic);
      window.addEventListener('touchstart', triggerMusic);

      return () => {
        window.removeEventListener('mousedown', triggerMusic);
        window.removeEventListener('keydown', triggerMusic);
        window.removeEventListener('touchstart', triggerMusic);
      };
    } else {
      // Logic for transitioning to game
      // Fade out theme
      const fadeOut = setInterval(() => {
        if (theme.volume > 0.05) {
          theme.volume -= 0.05;
        } else {
          theme.pause();
          theme.currentTime = 0; // Reset for next time
          clearInterval(fadeOut);
        }
      }, 50);

      // Fade in soundtrack
      soundtrack.volume = 0;
      soundtrack.play().catch(() => { });
      const fadeIn = setInterval(() => {
        if (soundtrack.volume < 0.25) {
          soundtrack.volume += 0.02;
        } else {
          clearInterval(fadeIn);
        }
      }, 100);

      return () => {
        clearInterval(fadeOut);
        clearInterval(fadeIn);
      };
    }
  }, [started]);

  const handleStart = useCallback(() => {
    setStarted(true);
  }, []);

  const playThwip = useCallback(() => {
    if (thwipRef.current) {
      thwipRef.current.currentTime = 0;
      thwipRef.current.volume = 0.4;
      thwipRef.current.play().catch(() => { });
    }
  }, []);

  return (
    <div
      tabIndex={0}
      style={{
        outline: 'none',
        width: '100%',
        maxWidth: '100vw',
        height: '100dvh',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#050114',
        touchAction: 'none',
      }}
    >
      <audio ref={themeRef} src="/theme.mp3" loop preload="none" />
      <audio ref={soundtrackRef} src="/soundtrack.mp3" loop preload="none" />
      <audio ref={thwipRef} src="/thwip.mp3" preload="metadata" />

      <KeyboardControls map={keyboardMap}>
        <Canvas
          shadows
          camera={{ position: [0, 70, 120], fov: 70, near: 0.1, far: 2000 }}
          gl={{
            antialias: false,
            alpha: false,
            depth: true,
            stencil: false,
            logarithmicDepthBuffer: false,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: false,
          }}
          dpr={dpr}
          performance={{ min: 0.5 }}
        >
          <PerformanceMonitor 
            onChange={({ factor }) => {
              setDpr(Math.max(0.75, Math.min(deviceProfile.maxDpr, factor * deviceProfile.maxDpr)));
              setPerformanceTier(factor > 0.55 ? deviceProfile.tier : 0);
            }} 
          />
          <color attach="background" args={[started ? '#1a0a2e' : '#050114']} />

          <Suspense fallback={null}>
            <Atmosphere
              started={started}
              performanceTier={performanceTier}
              deviceProfile={deviceProfile}
            />
            {started && (
              <StartedWorld
                checkpoints={checkpoints}
                deviceProfile={deviceProfile}
                performanceTier={performanceTier}
                targetOrb={targetOrb}
                onThwip={playThwip}
                onSelectCheckpoint={(cp) => {
                  playThwip();
                  setTargetOrb(cp.position);
                  setTimeout(() => setActivePanel(cp.panelKey), 800);
                }}
              />
            )}
          </Suspense>
        </Canvas>
      </KeyboardControls>

      <TitleOverlay onStart={handleStart} visible={!started} />
      <UIOverlay started={started} checkpoints={checkpoints} soundtrackRef={soundtrackRef} />
      {activePanel && (
        <Suspense fallback={null}>
          <ContentPanels
            activePanel={activePanel}
            onBack={() => {
              setActivePanel(null);
              setTargetOrb(null);
            }}
          />
        </Suspense>
      )}
      <Loader />
    </div>
  );
}
