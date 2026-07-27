import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

interface GradientBgProps {
  colors?: [string, string, string];
  speed?: number;
}

export const GradientBg: React.FC<GradientBgProps> = ({
  colors = ['#0A0A0B', '#1a1a2e', '#16213e'],
  speed = 0.3,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = (frame / fps) * speed;

  const x1 = 50 + Math.sin(t * 0.7) * 30;
  const y1 = 50 + Math.cos(t * 0.5) * 30;
  const x2 = 50 + Math.sin(t * 0.4 + 1) * 40;
  const y2 = 50 + Math.cos(t * 0.6 + 2) * 40;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: colors[0],
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at ${x1}% ${y1}%, ${colors[1]}88 0%, transparent 60%)`,
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at ${x2}% ${y2}%, ${colors[2]}66 0%, transparent 55%)`,
      }} />
    </div>
  );
};
