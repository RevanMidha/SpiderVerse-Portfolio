import React from 'react';

export function UIOverlay({ started, checkpoints, soundtrackRef }) {
  if (!started) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 'clamp(0.75rem, 3vw, 1.5rem)',
        boxSizing: 'border-box',
        color: 'white',
        zIndex: 100,
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <div style={{ pointerEvents: 'auto', cursor: 'default', flexShrink: 1, minWidth: 0 }}>
          <h1
            className="font-spider"
            style={{
              fontSize: 'clamp(1.6rem, 5vw, 4rem)',
              color: '#ffffff',
              textShadow: '3px 3px 0px #000, 0 0 15px rgba(255, 0, 85, 0.8)',
              margin: 0,
              letterSpacing: 'clamp(1px, 0.5vw, 4px)',
              fontStyle: 'italic',
              lineHeight: 0.9,
            }}
          >
            SPIDER<br/>VERSE
          </h1>
          <p 
            className="font-ui" 
            style={{ 
              fontSize: 'clamp(0.55rem, 1.8vw, 1rem)',
              opacity: 1, 
              margin: 'clamp(4px, 1vw, 8px) 0 0 clamp(2px, 0.5vw, 5px)',
              color: '#fff',
              fontWeight: 800,
              letterSpacing: 'clamp(1px, 0.5vw, 3px)',
              textShadow: '0px 0px 8px #00e5ff',
            }}
          >
            PORTFOLIO // REVAN
          </p>
        </div>

        {/* Minimap */}
        <div
          style={{
            width: 'clamp(60px, 15vw, 120px)',
            height: 'clamp(60px, 15vw, 120px)',
            border: '2px solid rgba(0, 229, 255, 0.5)',
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            position: 'relative',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {/* Player dot */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 'clamp(4px, 1vw, 6px)',
              height: 'clamp(4px, 1vw, 6px)',
              background: '#ff0055',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 8px #ff0055',
              zIndex: 5,
            }}
          />
          {/* Checkpoint dots */}
          {checkpoints && checkpoints.map((cp) => {
            const mapRange = 150;
            const centerX = 0;
            const centerZ = 120;
            const x = ((cp.position[0] - centerX + mapRange) / (mapRange * 2)) * 100;
            const z = (1 - (cp.position[2] - centerZ + mapRange) / (mapRange * 2)) * 100;
            const colors = { intro: '#00e5ff', projects: '#ff00cc', socials: '#9d00ff' };
            return (
              <div
                key={cp.id}
                style={{
                  position: 'absolute',
                  left: `${x}%`,
                  top: `${z}%`,
                  width: 'clamp(4px, 1vw, 6px)',
                  height: 'clamp(4px, 1vw, 6px)',
                  background: colors[cp.id] || '#fff',
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)',
                  boxShadow: `0 0 8px ${colors[cp.id]}`,
                  zIndex: 4,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Bottom: controls + audio bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: 'clamp(6px, 2vw, 12px)',
        flexWrap: 'wrap',
      }}>
        {/* Simple controls hint */}
        <div
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: 'clamp(0.3rem, 1vw, 0.6rem) clamp(0.5rem, 2vw, 1.2rem)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 0, 85, 0.3)',
            backdropFilter: 'blur(6px)',
            pointerEvents: 'none',
            minWidth: 0,
            flexShrink: 1,
            overflow: 'hidden',
          }}
        >
          <p className="font-ui" style={{ fontSize: 'clamp(0.5rem, 1.5vw, 0.65rem)', margin: 0, color: '#aaa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            <span style={{ color: '#00e5ff', fontWeight: 'bold' }}>TAP ORBS</span> Open Panels &nbsp;|&nbsp; <span style={{ color: '#ff00cc', fontWeight: 'bold' }}>SWIPE/DRAG</span> Look
          </p>
        </div>

        {/* Audio bar */}
        <AudioBar soundtrackRef={soundtrackRef} />
      </div>
    </div>
  );
}

function AudioBar({ soundtrackRef }) {
  const [isPlaying, setIsPlaying] = React.useState(true);

  const togglePlay = () => {
    if (!soundtrackRef?.current) return;
    if (soundtrackRef.current.paused) {
      soundtrackRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      soundtrackRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 'clamp(0.3rem, 1vw, 0.6rem) clamp(0.5rem, 1.5vw, 1rem)',
        borderRadius: '10px',
        border: '1px solid rgba(157, 0, 255, 0.4)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        gap: 'clamp(5px, 1.5vw, 10px)',
        pointerEvents: 'auto',
        cursor: 'pointer',
        flexShrink: 0,
      }}
      onClick={togglePlay}
    >
      {/* Play/Pause icon */}
      <div style={{
        width: 'clamp(20px, 4vw, 28px)',
        height: 'clamp(20px, 4vw, 28px)',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #9d00ff, #ff00cc)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 'clamp(8px, 1.5vw, 12px)',
        flexShrink: 0,
      }}>
        {isPlaying ? '❚❚' : '▶'}
      </div>

      <div>
        <p className="font-ui" style={{
          fontSize: 'clamp(0.4rem, 1.2vw, 0.55rem)',
          color: '#9d00ff',
          margin: 0,
          fontWeight: 'bold',
          letterSpacing: '1px',
        }}>
          NOW PLAYING
        </p>
        <p className="font-ui" style={{
          fontSize: 'clamp(0.55rem, 1.6vw, 0.75rem)',
          color: '#ffffff',
          margin: 0,
          fontWeight: 600,
        }}>
          Sunflower
        </p>
      </div>

      {/* Animated bars */}
      <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: 'clamp(14px, 3vw, 20px)' }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              width: 'clamp(2px, 0.5vw, 3px)',
              background: 'linear-gradient(to top, #9d00ff, #ff00cc)',
              borderRadius: '1px',
              animation: isPlaying ? `audioBar ${0.4 + i * 0.1}s ease-in-out infinite alternate` : 'none',
              height: isPlaying ? undefined : '4px',
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes audioBar {
          0% { height: 4px; }
          100% { height: 18px; }
        }
      `}</style>
    </div>
  );
}
