import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { SPRING } from '../style/tokens';

interface BlurRevealProps {
  children: React.ReactNode;
  from?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'none';
}

export const BlurReveal: React.FC<BlurRevealProps> = ({
  children,
  from = 0,
  direction = 'up',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - from;
  const progress = spring({ frame: local, fps, config: SPRING.SMOOTH });
  const blur = interpolate(progress, [0, 1], [24, 0]);
  const opacity = interpolate(progress, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });
  const dy = direction === 'up' ? interpolate(progress, [0, 1], [30, 0])
    : direction === 'down' ? interpolate(progress, [0, 1], [-30, 0]) : 0;

  return (
    <div style={{ filter: `blur(${blur}px)`, opacity, transform: `translateY(${dy}px)`, willChange: 'transform, filter, opacity' }}>
      {children}
    </div>
  );
};
