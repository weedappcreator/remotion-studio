import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  phase: number;
  opacity: number;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 43758.5453123;
  return x - Math.floor(x);
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    x: seededRandom(i * 7 + 1) * 100,
    y: seededRandom(i * 7 + 2) * 100,
    size: seededRandom(i * 7 + 3) * 2.5 + 0.5,
    speed: seededRandom(i * 7 + 4) * 0.4 + 0.1,
    phase: seededRandom(i * 7 + 5) * Math.PI * 2,
    opacity: seededRandom(i * 7 + 6) * 0.5 + 0.1,
  }));
}

interface ParticlesBgProps {
  count?: number;
  color?: string;
  baseOpacity?: number;
  fadeInFrom?: number;
  fadeInDuration?: number;
}

export const ParticlesBg: React.FC<ParticlesBgProps> = ({
  count = 60,
  color = '#E8FF47',
  baseOpacity = 0.18,
  fadeInFrom = 0,
  fadeInDuration = 40,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const particles = React.useMemo(() => generateParticles(count), [count]);

  const globalFade = interpolate(
    frame,
    [fadeInFrom, fadeInFrom + fadeInDuration],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const t = frame / fps;

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: 'absolute', inset: 0, opacity: globalFade }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {particles.map((p, i) => {
          const drift = Math.sin(t * p.speed + p.phase) * 12;
          const cx = (p.x / 100) * width + drift;
          const cy = (p.y / 100) * height + Math.cos(t * p.speed * 0.7 + p.phase) * 8;
          const pulse = 0.6 + 0.4 * Math.sin(t * p.speed * 2 + p.phase);
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={p.size}
              fill={color}
              opacity={p.opacity * baseOpacity * pulse}
            />
          );
        })}
      </svg>
    </div>
  );
};
