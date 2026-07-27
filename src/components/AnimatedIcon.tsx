import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { SPRING } from '../style/tokens';

export type IconName = 'Zap' | 'Layers' | 'Star' | 'ArrowRight';
export type IconAnimation = 'pop' | 'spin' | 'fadeIn' | 'bounce';

interface AnimatedIconProps {
  icon?: IconName;
  animation?: IconAnimation;
  from?: number;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const ZapPath: React.FC<{ color: string; strokeWidth: number }> = ({ color, strokeWidth }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const LayersPath: React.FC<{ color: string; strokeWidth: number }> = ({ color, strokeWidth }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const StarPath: React.FC<{ color: string; strokeWidth: number }> = ({ color, strokeWidth }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const ArrowRightPath: React.FC<{ color: string; strokeWidth: number }> = ({ color, strokeWidth }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const ICONS: Record<IconName, React.FC<{ color: string; strokeWidth: number }>> = {
  Zap: ZapPath,
  Layers: LayersPath,
  Star: StarPath,
  ArrowRight: ArrowRightPath,
};

export const AnimatedIcon: React.FC<AnimatedIconProps> = ({
  icon = 'Zap',
  animation = 'pop',
  from = 0,
  size = 48,
  color = '#FFFFFF',
  strokeWidth = 2,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - from;

  const progress = spring({ frame: local, fps, config: SPRING.BOUNCY });
  const opacity = interpolate(progress, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });

  let transform = 'none';

  if (animation === 'pop') {
    const scale = interpolate(progress, [0, 0.6, 0.8, 1], [0, 1.2, 0.95, 1]);
    transform = `scale(${scale})`;
  } else if (animation === 'spin') {
    const rotate = interpolate(progress, [0, 1], [-180, 0]);
    const scale = interpolate(progress, [0, 1], [0, 1]);
    transform = `rotate(${rotate}deg) scale(${scale})`;
  } else if (animation === 'bounce') {
    const y = interpolate(progress, [0, 0.5, 0.75, 1], [40, -10, 5, 0]);
    transform = `translateY(${y}px)`;
  } else if (animation === 'fadeIn') {
    const scale = interpolate(progress, [0, 1], [0.8, 1]);
    transform = `scale(${scale})`;
  }

  const IconComponent = ICONS[icon] ?? ZapPath;

  return (
    <div
      style={{
        width: size,
        height: size,
        opacity,
        transform,
        willChange: 'transform, opacity',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <IconComponent color={color} strokeWidth={strokeWidth} />
    </div>
  );
};
