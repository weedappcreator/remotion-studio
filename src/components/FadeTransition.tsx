import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

interface FadeTransitionProps {
  children: React.ReactNode;
  inFrom: number;
  inDuration?: number;
  outFrom?: number;
  outDuration?: number;
  mode?: 'fade' | 'dipToBlack' | 'dipToWhite';
}

export const FadeTransition: React.FC<FadeTransitionProps> = ({
  children,
  inFrom,
  inDuration = 20,
  outFrom,
  outDuration = 20,
  mode = 'fade',
}) => {
  const frame = useCurrentFrame();
  const inOpacity = interpolate(frame, [inFrom, inFrom + inDuration], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const outOpacity = outFrom !== undefined
    ? interpolate(frame, [outFrom, outFrom + outDuration], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 1;

  const opacity = inOpacity * outOpacity;
  const bg = mode === 'dipToBlack' ? '#000' : mode === 'dipToWhite' ? '#fff' : 'transparent';

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {bg !== 'transparent' && <div style={{ position: 'absolute', inset: 0, background: bg, opacity: 1 - opacity, zIndex: 10, pointerEvents: 'none' }} />}
      <div style={{ opacity, width: '100%', height: '100%' }}>{children}</div>
    </div>
  );
};
