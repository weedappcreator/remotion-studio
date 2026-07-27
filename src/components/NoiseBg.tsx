import React from 'react';
import { useCurrentFrame } from 'remotion';

interface NoiseBgProps {
  opacity?: number;
  size?: number;
}

export const NoiseBg: React.FC<NoiseBgProps> = ({ opacity = 0.04, size = 180 }) => {
  const frame = useCurrentFrame();
  const seed = frame % 4;

  // SVG-based deterministic noise (render-safe)
  const svgNoise = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' seed='${seed}' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/></svg>`;

  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      backgroundImage: `url("${svgNoise}")`,
      backgroundRepeat: 'repeat',
      opacity,
      mixBlendMode: 'overlay',
    }} />
  );
};
