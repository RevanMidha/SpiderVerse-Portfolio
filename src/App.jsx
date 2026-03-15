import React, { Suspense, useState, useRef, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls, Loader } from '@react-three/drei';
import { Physics } from '@react-three/rapier';

import { CityEnvironment } from './components/CityEnvironment';
import { PlayerCamera } from './components/PlayerCamera';
import { Atmosphere } from './components/Atmosphere';
import { TitleOverlay } from './components/SpiderVerseText';
import { Checkpoints } from './components/Checkpoints';
import { UIOverlay } from './components/UIOverlay';
import ContentPanels from './components/ContentPanels';

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
  const [started, setStarted] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const [targetOrb, setTargetOrb] = useState(null);

  const soundtrackRef = useRef(null);
  const themeRef = useRef(null);
  const thwipRef = useRef(null);

  // Centralized Audio Management
  useEffect(() => {
    const theme = themeRef.current;
    const soundtrack = soundtrackRef.current;
    if (!theme || !soundtrack) return;

    if (!started) {
      // Setup: Try to auto-play theme immediately unmuted!
      theme.volume = 0.4;
      theme.muted = false;
      theme.play().catch(() => { 
        // If autoplay is blocked by browser policies, keep it muted to allow background playback
        // until a user interacts.
        theme.muted = true;
        theme.play().catch(() => {});
      });

      const triggerMusic = () => {
        if (!started) {
          theme.muted = false;
          theme.play().catch(() => { });
          // Immediately clean up global listeners after first trigger
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
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#050114'
      }}
    >
      <audio ref={themeRef} src="/theme.mp3" loop preload="auto" autoPlay />
      <audio ref={soundtrackRef} src="/soundtrack.mp3" loop preload="auto" />
      <audio ref={thwipRef} src="/thwip.mp3" preload="auto" />

      <KeyboardControls map={keyboardMap}>
        <Canvas
          shadows
          camera={{ position: [0, 70, 120], fov: 70, near: 0.1, far: 2000 }}
          gl={{ antialias: false, logarithmicDepthBuffer: false }}
          dpr={[1, 2]}
        >
          <color attach="background" args={[started ? '#1a0a2e' : '#050114']} />

          <Suspense fallback={null}>
            <Atmosphere started={started} />
            {started && (
              <Physics gravity={[0, -30, 0]}>
                <CityEnvironment started={started} />
                <PlayerCamera
                  started={started}
                  targetOrb={targetOrb}
                  onThwip={playThwip}
                />
                <Checkpoints
                  started={started}
                  checkpoints={checkpoints}
                  onSelectCheckpoint={(cp) => {
                    playThwip();
                    setTargetOrb(cp.position);
                    setTimeout(() => setActivePanel(cp.panelKey), 800);
                  }}
                  activeTarget={null}
                />
              </Physics>
            )}
          </Suspense>
        </Canvas>
      </KeyboardControls>

      <TitleOverlay onStart={handleStart} visible={!started} />
      <UIOverlay started={started} checkpoints={checkpoints} soundtrackRef={soundtrackRef} />
      <ContentPanels
        activePanel={activePanel}
        onBack={() => {
          setActivePanel(null);
          setTargetOrb(null);
        }}
      />
      <Loader />
    </div>
  );
}
