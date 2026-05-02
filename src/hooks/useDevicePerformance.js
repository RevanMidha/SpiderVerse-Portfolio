import { useEffect, useMemo, useState } from 'react';

function getProfile() {
  if (typeof window === 'undefined') {
    return { tier: 1, maxDpr: 1, isTouch: false, isCompact: false };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const isTouch = navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches;
  const isCompact = Math.min(width, height) < 768;
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4;
  const rawDpr = window.devicePixelRatio || 1;

  const tier = cores <= 4 || memory <= 4 || isCompact ? 0 : 1;
  const maxDpr = tier === 0 ? Math.min(rawDpr, 1.25) : Math.min(rawDpr, 1.75);

  return { tier, maxDpr, isTouch, isCompact };
}

export function useDevicePerformance() {
  const [profile, setProfile] = useState(getProfile);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setProfile(getProfile()));
    };

    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return useMemo(() => profile, [profile]);
}
