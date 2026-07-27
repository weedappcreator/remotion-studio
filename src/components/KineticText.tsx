import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { SPRING, TIMING } from '../style/tokens';
import { useTextSplit } from '../hooks/useTextSplit';

export type KineticMode = 'slideUp' | 'blur' | 'scale' | 'glitch' | 'drop';

interface KineticTextProps {
  text: string;
  from?: number;
  mode?: KineticMode;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  staggerFrames?: number;
  splitBy?: 'words' | 'chars';
  exitFrom?: number;
}

export const KineticText: React.FC<KineticTextProps> = ({
  text,
  from = 0,
  mode = 'slideUp',
  fontSize = 80,
  color = '#FFFFFF',
  fontFamily = '"Space Grotesk", sans-serif',
  staggerFrames = TIMING.STAGGER,
  splitBy = 'words',
  exitFrom,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const parts = useTextSplit(text, splitBy);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: splitBy === 'chars' ? 0 : '0.25em', overflow: 'hidden' }}>
      {parts.map((part, i) => {
        const delay = from + i * staggerFrames;
        const localFrame = frame - delay;
        const exitFrame = exitFrom !== undefined ? frame - (exitFrom + i * staggerFrames) : -1;

        const progress = spring({ frame: localFrame, fps, config: SPRING.SMOOTH });
        const exitProgress = exitFrom !== undefined
          ? spring({ frame: exitFrame, fps, config: SPRING.SNAPPY })
          : 0;

        let style: React.CSSProperties = {
          display: 'inline-block',
          fontSize,
          color,
          fontFamily,
          fontWeight: 700,
          lineHeight: 1.1,
          willChange: 'transform, opacity, filter',
        };

        if (mode === 'slideUp') {
          const y = interpolate(progress, [0, 1], [60, 0]);
          const opacity = interpolate(progress, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' });
          const exitY = interpolate(exitProgress, [0, 1], [0, -40]);
          const exitOpacity = interpolate(exitProgress, [0, 0.6], [1, 0], { extrapolateRight: 'clamp' });
          style = { ...style, transform: `translateY(${y + exitY}px)`, opacity: opacity * (1 - exitOpacity) };
        } else if (mode === 'blur') {
          const blur = interpolate(progress, [0, 1], [20, 0]);
          const opacity = interpolate(progress, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });
          style = { ...style, filter: `blur(${blur}px)`, opacity };
        } else if (mode === 'scale') {
          const scale = interpolate(progress, [0, 1], [0.3, 1]);
          const opacity = interpolate(progress, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' });
          style = { ...style, transform: `scale(${scale})`, opacity };
        } else if (mode === 'glitch') {
          const glitchX = localFrame < 5 ? Math.sin(localFrame * 10) * 8 : 0;
          const opacity = interpolate(progress, [0, 0.2], [0, 1], { extrapolateRight: 'clamp' });
          style = { ...style, transform: `translateX(${glitchX}px)`, opacity };
        } else if (mode === 'drop') {
          const y = interpolate(progress, [0, 1], [-80, 0]);
          const opacity = interpolate(progress, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });
          style = { ...style, transform: `translateY(${y}px)`, opacity };
        }

        return (
          <span key={i} style={{ overflow: 'hidden', display: 'inline-block' }}>
            <span style={style}>{part}{splitBy === 'words' ? '\u00A0' : ''}</span>
          </span>
        );
      })}
    </div>
  );
};
