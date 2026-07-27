import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { GradientBg } from '../components/GradientBg';
import { NoiseBg } from '../components/NoiseBg';
import { BlurReveal } from '../components/BlurReveal';
import { SPRING, PALETTE } from '../style/tokens';

interface LogoRevealProps {
  logoText?: string;
  tagline?: string;
  palette?: keyof typeof PALETTE;
  accentColor?: string;
}

export const LogoReveal: React.FC<LogoRevealProps> = ({
  logoText = 'BRAND',
  tagline = 'Make it memorable.',
  palette = 'obsidian',
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = PALETTE[palette];
  const accent = accentColor ?? p.accent;

  // Line expand animation
  const lineScale = spring({ frame: frame - 10, fps, config: SPRING.SNAPPY });
  const lineWidth = interpolate(lineScale, [0, 1], [0, 220]);

  // Logo text
  const logoProgress = spring({ frame: frame - 25, fps, config: SPRING.SMOOTH });
  const logoOpacity = interpolate(logoProgress, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' });
  const logoY = interpolate(logoProgress, [0, 1], [30, 0]);

  // Tagline
  const tagProgress = spring({ frame: frame - 50, fps, config: SPRING.GENTLE });
  const tagOpacity = interpolate(tagProgress, [0, 0.5], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <GradientBg colors={[p.bg, p.surface, p.surface]} speed={0.15} />
      <NoiseBg opacity={0.035} />

      {/* Accent line */}
      <div style={{
        width: lineWidth,
        height: 2,
        background: accent,
        marginBottom: 32,
        boxShadow: `0 0 20px ${accent}80`,
      }} />

      {/* Logo */}
      <div style={{
        opacity: logoOpacity,
        transform: `translateY(${logoY}px)`,
        fontSize: 96,
        fontWeight: 800,
        color: p.text,
        letterSpacing: '0.18em',
        fontFamily: '"Space Grotesk", "Inter", sans-serif',
        textTransform: 'uppercase',
      }}>
        {logoText}
      </div>

      {/* Tagline */}
      <div style={{
        opacity: tagOpacity,
        marginTop: 20,
        fontSize: 22,
        color: p.muted,
        letterSpacing: '0.12em',
        fontFamily: '"DM Sans", sans-serif',
        fontWeight: 400,
      }}>
        {tagline}
      </div>

      {/* Bottom accent line */}
      <div style={{
        position: 'absolute',
        bottom: 60,
        width: lineWidth * 0.4,
        height: 1,
        background: `${accent}60`,
      }} />
    </AbsoluteFill>
  );
};
