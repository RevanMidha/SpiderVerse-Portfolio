import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COMIC_TEXTS = [
  { text: 'THWIP!', color: '#ff0055', top: '15%', left: '10%', rotate: -15 },
  { text: 'POW!', color: '#00e5ff', top: '75%', left: '15%', rotate: 10 },
  { text: 'WHAM!', color: '#ff0055', top: '20%', right: '12%', rotate: 20 },
  { text: 'BAM!', color: '#ffffff', bottom: '20%', right: '15%', rotate: -10 },
  { text: 'ZZZT!', color: '#00e5ff', top: '45%', right: '5%', rotate: 5 },
];

function ComicText({ text, color, style }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: [0, 1.2, 1], 
        opacity: [0, 1, 0.8],
        rotate: [style.rotate - 10, style.rotate],
      }}
      transition={{ 
        duration: 0.5, 
        delay: Math.random() * 5,
        repeat: Infinity,
        repeatDelay: 5 + Math.random() * 10
      }}
      className="font-spider"
      style={{
        position: 'absolute',
        fontSize: 'clamp(1.5rem, 4vw, 3rem)',
        color: color,
        textShadow: `3px 3px 0px #000, 0 0 20px ${color}44`,
        zIndex: 5,
        pointerEvents: 'none',
        WebkitTextStroke: '1px black',
        ...style
      }}
    >
      {text}
    </motion.div>
  );
}

const SpiderWeb = () => (
  <motion.svg
    initial={{ rotate: 0, opacity: 0 }}
    animate={{ rotate: 360, opacity: 0.35 }}
    transition={{
      rotate: { duration: 60, repeat: Infinity, ease: 'linear' },
      opacity: { duration: 2, ease: 'easeOut' }
    }}
    viewBox="0 0 100 100"
    style={{
      position: 'absolute',
      width: '150vmax',
      height: '150vmax',
      top: '50%',
      left: '50%',
      x: '-50%',
      y: '-50%',
      pointerEvents: 'none',
      zIndex: 4,
      filter: 'drop-shadow(0px 0px 8px rgba(0, 229, 255, 0.6))',
    }}
  >
    {[10, 20, 30, 40, 48].map((r) => (
      <polygon
        key={r}
        points={Array.from({ length: 8 })
          .map((_, i) => {
            const angle = (i * Math.PI) / 4;
            return `${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`;
          })
          .join(' ')}
        fill="none"
        stroke="#ffffff"
        strokeWidth="0.15"
      />
    ))}
    {Array.from({ length: 8 }).map((_, i) => {
      const angle = (i * Math.PI) / 4;
      return (
        <line
          key={i}
          x1="50"
          y1="50"
          x2={50 + 50 * Math.cos(angle)}
          y2={50 + 50 * Math.sin(angle)}
          stroke="#ffffff"
          strokeWidth="0.15"
        />
      );
    })}
  </motion.svg>
);

export function TitleOverlay({ onStart, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 1.5,
            filter: 'blur(20px) hue-rotate(90deg)',
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            pointerEvents: 'auto',
            overflow: 'hidden',
            background: 'rgba(5, 0, 20, 0.8)',
            backdropFilter: 'blur(4px)',
          }}
        >
          {/* Background Layers */}
          <div className="halftone-overlay" style={{ zIndex: 1 }} />
          <div className="vignette-overlay" style={{ zIndex: 2 }} />
          <div className="scanline-overlay" style={{ zIndex: 3 }} />

          {/* Comic Bubbles */}
          {COMIC_TEXTS.map((item, idx) => (
            <ComicText key={idx} {...item} style={{ ...item }} />
          ))}

          {/* Spider Web Background */}
          <SpiderWeb />

          {/* Main Content Container */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 0 }}
            animate={{ scale: 1, opacity: 1, y: [-10, 10, -10] }}
            transition={{
              scale: { duration: 0.8 },
              opacity: { duration: 0.8 },
              y: { duration: 6, repeat: Infinity, ease: 'easeInOut' }
            }}
            style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}
          >
            {/* Title with chromatic offset layers */}
            <div style={{
              position: 'relative',
              marginBottom: '30px',
              pointerEvents: 'none',
            }}>
              {/* Glitch Layer 1 (Red) */}
              <motion.h1
                className="font-spider"
                animate={{
                  x: ['-50.5%', '-49.5%', '-50%', '-50.2%', '-50%'],
                  opacity: [0.4, 0.6, 0.2, 0.4],
                  skewX: [0, 2, -2, 0]
                }}
                transition={{
                  duration: 0.2,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
                style={{
                  position: 'absolute',
                  top: '2px',
                  left: '50%',
                  x: '-50%',
                  fontSize: 'clamp(4rem, 12vw, 10rem)',
                  color: '#ff0055',
                  margin: 0,
                  letterSpacing: '8px',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                SPIDER-VERSE
              </motion.h1>

              {/* Glitch Layer 2 (Cyan) */}
              <motion.h1
                className="font-spider"
                animate={{
                  x: ['-49.5%', '-50.5%', '-50%', '-49.8%', '-50%'],
                  opacity: [0.3, 0.5, 0.1, 0.3],
                  skewX: [0, -2, 2, 0]
                }}
                transition={{
                  duration: 0.25,
                  repeat: Infinity,
                  repeatDelay: 1.5
                }}
                style={{
                  position: 'absolute',
                  top: '-2px',
                  left: '50%',
                  x: '-50%',
                  fontSize: 'clamp(4rem, 12vw, 10rem)',
                  color: '#00e5ff',
                  margin: 0,
                  letterSpacing: '8px',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                SPIDER-VERSE
              </motion.h1>

              {/* Main title */}
              <motion.h1
                className="font-spider"
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [-0.5, 0.5, -0.5]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  position: 'relative',
                  fontSize: 'clamp(4rem, 12vw, 10rem)',
                  color: '#ffffff',
                  margin: 0,
                  letterSpacing: '8px',
                  textShadow: '3px 3px 0px #000, 0 0 25px rgba(255, 0, 85, 1)',
                  WebkitTextStroke: '2px #000',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                SPIDER-VERSE
              </motion.h1>
            </div>

            {/* Subtitle with dynamic line */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '40px',
                pointerEvents: 'none',
              }}
            >
              <div style={{ 
                width: '120px', 
                height: '4px', 
                background: 'linear-gradient(90deg, #ff0055, #00e5ff)',
                boxShadow: '0 0 10px #ff0055'
              }} />
              <motion.p
                className="font-ui"
                animate={{
                  textShadow: [
                    '0 0 10px rgba(255,255,255,0.5)',
                    '0 0 25px rgba(0,229,255,1)',
                    '0 0 10px rgba(255,255,255,0.5)'
                  ]
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
                  color: '#ffffff',
                  margin: 0,
                  letterSpacing: '6px',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  fontStyle: 'italic'
                }}
              >
                Portfolio of Revan Midha
              </motion.p>
              <motion.p
                className="font-ui"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                style={{
                  fontSize: 'clamp(0.88rem, 1.75vw, 1.17rem)',
                  color: '#aaaacc',
                  margin: '4px 0 0 0',
                  letterSpacing: '3px',
                  fontWeight: 500,
                  fontStyle: 'normal',
                  textTransform: 'none',
                }}
              >
                Crafting immersive experiences on the web
              </motion.p>
              <motion.p
                className="font-ui"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.7, 1] }}
                transition={{ delay: 1.2, duration: 3, repeat: Infinity, repeatDelay: 5 }}
                style={{
                  fontSize: 'clamp(0.7rem, 1.3vw, 0.95rem)',
                  color: '#ff0055',
                  margin: '10px 0 0 0',
                  letterSpacing: '2px',
                  fontWeight: 700,
                  fontStyle: 'italic',
                  textShadow: '0 0 12px rgba(255,0,85,0.8)',
                  textTransform: 'none',
                }}
              >
                "With great code comes great responsibility"
              </motion.p>
            </motion.div>

            {/* Enter button with interactive states */}
            <motion.button
              animate={{
                color: ['#00e5ff', '#ff0055', '#9d00ff', '#00e5ff'],
                borderColor: ['#00e5ff', '#ff0055', '#9d00ff', '#00e5ff'],
                boxShadow: [
                  '0 0 20px rgba(0,229,255,0.3)',
                  '0 0 45px rgba(255,0,85,0.7)',
                  '0 0 45px rgba(157,0,255,0.7)',
                  '0 0 20px rgba(0,229,255,0.3)'
                ],
                textShadow: [
                  '2px 2px 0px #000, 0 0 5px rgba(0,229,255,0.2)',
                  '2px 2px 0px #000, 0 0 20px rgba(255,0,85,0.8)',
                  '2px 2px 0px #000, 0 0 20px rgba(157,0,255,0.8)',
                  '2px 2px 0px #000, 0 0 5px rgba(0,229,255,0.2)'
                ]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              whileHover={{ 
                scale: 1.1, 
                boxShadow: '0 0 50px rgba(255,0,85,0.8) !important',
                textShadow: '2px 2px 0px #000, 0 0 30px rgba(255,0,85,1)',
              }}
              whileTap={{ 
                scale: 0.9,
                filter: 'invert(1) contrast(2)',
              }}
              onClick={(e) => {
                e.stopPropagation();
                onStart();
              }}
              style={{
                background: 'rgba(0,0,0,1)',
                borderWidth: '4px',
                borderStyle: 'solid',
                padding: '16px 60px',
                fontSize: 'clamp(1rem, 1.5vw, 1.4rem)',
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 900,
                letterSpacing: '4px',
                cursor: 'pointer',
                textShadow: '2px 2px 0px #000',
                boxShadow: '0 0 20px rgba(0,229,255,0.3)',
                transition: 'all 0.2s ease',
                textTransform: 'uppercase',
                clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0% 100%)'
              }}
            >
              Enter the Spider-Verse
            </motion.button>

            {/* Hint text below button */}
            <motion.p
              className="font-ui"
              initial={{ opacity: 0, y: 6 }}
              animate={{
                opacity: [0, 0.6, 0.4, 0.6],
                y: [6, 0, -3, 0]
              }}
              transition={{ delay: 1.8, duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                marginTop: '18px',
                fontSize: 'clamp(0.65rem, 1vw, 0.8rem)',
                color: '#8888aa',
                letterSpacing: '2px',
                fontWeight: 400,
                pointerEvents: 'none',
                textTransform: 'none',
              }}
            >
              ↑ Click to start your swing through the portfolio
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
