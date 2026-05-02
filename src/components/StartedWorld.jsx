import React from 'react';
import { Physics } from '@react-three/rapier';

import { CityEnvironment } from './CityEnvironment';
import { PlayerCamera } from './PlayerCamera';
import { Checkpoints } from './Checkpoints';

export default function StartedWorld({
  checkpoints,
  deviceProfile,
  onSelectCheckpoint,
  onThwip,
  performanceTier,
  targetOrb,
}) {
  return (
    <Physics gravity={[0, -30, 0]}>
      <CityEnvironment
        started
        performanceTier={performanceTier}
        deviceProfile={deviceProfile}
      />
      <PlayerCamera
        started
        targetOrb={targetOrb}
        onThwip={onThwip}
      />
      <Checkpoints
        started
        checkpoints={checkpoints}
        onSelectCheckpoint={onSelectCheckpoint}
        activeTarget={null}
      />
    </Physics>
  );
}
