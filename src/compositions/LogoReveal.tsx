import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from 'remotion';
import { GradientBg } from '../components/GradientBg';
import { NoiseBg } from '../components/NoiseBg';
import { BlurReveal } from '../components/BlurReveal';
import { FadeTransition } from '../components/FadeTransition';
import { SPRING, TIMING, PALETTE } from '../style/tokens';

interface LogoRevealProps {
  logoText?: string;
  tagline?: string;
  palette?: 'obsidian' | 'arctic' | 'midnight' | 'noir' | 'forest';
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

  // ─── Accent line (frame 10-40) ───────────────────────────────────────────
  // spring starts at frame 10 using SNAPPY config
  const lineProgress = spring({
    frame: frame - 10,
    fps,
    config: SPRING.SNAPPY,
  });
  const lineWidth = interpolate(lineProgress, [0, 1], [0, 180]);

  // ─── Hold phase: subtle scale (frame 80-150) ─────────────────────────────
  const holdProgress = interpolate(frame, [80, 150], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const holdScale = interpolate(holdProgress, [0, 1], [1.0, 1.003]);

  // ─── Bottom accent rule (frame 90 fade in) ───────────────────────────────
  const bottomRuleOpacity = interpolate(frame, [90, 90 + TIMING.NORMAL], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ background: p.bg, overflow: 'hidden' }}>
      {/* ── Layer 0: Animated gradient background (frames 0-150) ── */}
      <GradientBg
        colors={[p.bg, p.surface, p.surface]}
        speed={0.15}
      />

      {/* ── Layer 1: Film grain noise (frames 0-150) ── */}
      <NoiseBg opacity={0.04} />

      {/* ── Layer 2: Fade in from black (frames 0-20) ── */}
      <FadeTransition inFrom={0} inDuration={20} mode="dipToBlack">
        {/* Children intentionally empty — overlay sits on top of bg layers */}
        <div style={{ width: '100%', height: '100%' }} />
      </FadeTransition>

      {/* ── Layer 3: Content center stage, with hold-phase scale ── */}
      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          transform: `scale(${holdScale})`,
          // transform origin stays center
        }}
      >
        {/* ── Accent line: expands frame 10-40 ── */}
        <Sequence from={10} durationInFrames={140}>
          <AbsoluteFill
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                position: 'absolute',
                // sit below center by offset: logo is ~100px tall + some gap
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, 68px)',
                width: lineWidth,
                height: 1,
                background: accent,
                boxShadow: `0 0 16px ${accent}60`,
              }}
            />
          </AbsoluteFill>
        </Sequence>

        {/* ── Logo text: BlurReveal from frame 25, direction up ── */}
        <Sequence from={25} durationInFrames={125}>
          <AbsoluteFill
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BlurReveal from={25} direction="up">
              <div
                style={{
                  fontSize: 100,
                  fontWeight: 800,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  fontFamily: '"Space Grotesk", sans-serif',
                  color: p.text,
                  lineHeight: 1,
                  userSelect: 'none',
                }}
              >
                {logoText}
              </div>
            </BlurReveal>
          </AbsoluteFill>
        </Sequence>

        {/* ── Tagline: BlurReveal from frame 55, direction up ── */}
        <Sequence from={55} durationInFrames={95}>
          <AbsoluteFill
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BlurReveal from={55} direction="up">
              <div
                style={{
                  // offset below logo center
                  marginTop: 160,
                  fontSize: 20,
                  letterSpacing: '0.14em',
                  fontFamily: '"DM Sans", sans-serif',
                  fontWeight: 400,
                  color: p.muted,
                  userSelect: 'none',
                }}
              >
                {tagline}
              </div>
            </BlurReveal>
          </AbsoluteFill>
        </Sequence>

        {/* ── Bottom accent rule: 80px, fades in at frame 90 ── */}
        <Sequence from={90} durationInFrames={60}>
          <AbsoluteFill>
            <div
              style={{
                position: 'absolute',
                bottom: 60,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 80,
                height: 1,
                background: `${accent}80`,
                opacity: bottomRuleOpacity,
              }}
            />
          </AbsoluteFill>
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
