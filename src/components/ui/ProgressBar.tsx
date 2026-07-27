import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export type ProgressBarStyle = 'glow' | 'flat' | 'gradient' | 'thin';

interface ProgressBarProps {
  /** Start frame. Defaults to 0. */
  from?: number;
  /** End frame. Defaults to durationInFrames. */
  to?: number;
  /** Visual style variant. */
  style?: ProgressBarStyle;
  /** Track color. */
  trackColor?: string;
  /** Fill color. */
  fillColor?: string;
  /** Bar height in px. */
  height?: number;
  /** Border radius in px. */
  radius?: number;
  /** Position: 'top' | 'bottom'. Renders absolutely inside a positioned parent. */
  position?: 'top' | 'bottom';
  /** 0–1 opacity of the track. */
  trackOpacity?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  from = 0,
  to,
  style: barStyle = 'flat',
  trackColor = 'rgba(255,255,255,0.08)',
  fillColor = '#E8FF47',
  height = 3,
  radius = 2,
  position = 'bottom',
  trackOpacity = 1,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const endFrame = to ?? durationInFrames;

  const progress = interpolate(frame, [from, endFrame], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const fillWidth = `${progress * 100}%`;

  let fillStyle: React.CSSProperties = {
    width: fillWidth,
    height: '100%',
    borderRadius: radius,
    background: fillColor,
    transition: 'none',
  };

  if (barStyle === 'glow') {
    fillStyle = {
      ...fillStyle,
      boxShadow: `0 0 8px ${fillColor}, 0 0 20px ${fillColor}66`,
    };
  } else if (barStyle === 'gradient') {
    fillStyle = {
      ...fillStyle,
      background: `linear-gradient(90deg, ${fillColor}88, ${fillColor})`,
    };
  } else if (barStyle === 'thin') {
    fillStyle = {
      ...fillStyle,
      height: '100%',
    };
  }

  const wrapperStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    right: 0,
    [position]: 0,
    height,
    background: trackColor,
    opacity: trackOpacity,
    borderRadius: radius,
    overflow: 'hidden',
  };

  return (
    <div style={wrapperStyle}>
      <div style={fillStyle} />
    </div>
  );
};
