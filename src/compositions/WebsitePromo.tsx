import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Sequence,
} from 'remotion';
import { GradientBg } from '../components/GradientBg';
import { NoiseBg } from '../components/NoiseBg';
import { KineticText } from '../components/KineticText';
import { BlurReveal } from '../components/BlurReveal';
import { AnimatedIcon } from '../components/AnimatedIcon';
import { ProgressBar } from '../components/ui/ProgressBar';
import { PALETTE, SPRING, TIMING } from '../style/tokens';

interface WebsitePromoProps {
  headline?: string;
  subheadline?: string;
  cta?: string;
  brandName?: string;
  palette?: keyof typeof PALETTE;
}

export const WebsitePromo: React.FC<WebsitePromoProps> = ({
  headline = 'Build faster.',
  subheadline = 'Ship production-ready websites in minutes with AI.',
  cta = 'Start Free →',
  brandName = 'UIGEN',
  palette = 'obsidian',
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const p = PALETTE[palette];

  // ── CTA spring entrance (frame 200) ──────────────────────────────────────
  const ctaProgress = spring({
    frame: frame - 200,
    fps,
    config: SPRING.BOUNCY,
  });
  const ctaScale = interpolate(ctaProgress, [0, 1], [0.75, 1]);
  const ctaOpacity = interpolate(ctaProgress, [0, 0.35], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const ctaY = interpolate(ctaProgress, [0, 1], [24, 0]);

  // ── Subtle hold-exit fade for non-CTA elements (frame 270→300) ───────────
  const exitOpacity = interpolate(frame, [268, 295], [1, 0.85], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: p.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '0 120px',
        overflow: 'hidden',
      }}
    >
      {/* ── Layer 0: Ambient background ───────────────────────────────────── */}
      <GradientBg
        colors={[p.bg, p.surface, p.surface]}
        speed={0.08}
      />
      <NoiseBg opacity={0.035} size={160} />

      {/* ── Progress bar: fills 0→300 frames, glow style ─────────────────── */}
      <ProgressBar
        from={0}
        to={durationInFrames}
        style="glow"
        fillColor={p.accent}
        trackColor="rgba(255,255,255,0.06)"
        height={3}
        position="bottom"
      />

      {/* ── Content stack ─────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 0,
          opacity: exitOpacity,
          width: '100%',
        }}
      >

        {/* Frame 0–20: Brand label */}
        <Sequence from={0} durationInFrames={durationInFrames}>
          <div style={{ marginBottom: 36 }}>
            <BlurReveal from={0} direction="down">
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: 14,
                  letterSpacing: '0.3em',
                  color: p.accent,
                  textTransform: 'uppercase',
                  fontWeight: 500,
                }}
              >
                {brandName}
              </span>
            </BlurReveal>
          </div>
        </Sequence>

        {/* Frame 15–80: Main headline */}
        <Sequence from={15} durationInFrames={durationInFrames - 15}>
          <div style={{ marginBottom: 28 }}>
            <KineticText
              text={headline}
              from={0}
              mode="slideUp"
              fontSize={120}
              color={p.text}
              fontFamily='"Space Grotesk", sans-serif'
              staggerFrames={10}
            />
          </div>
        </Sequence>

        {/* Frame 45–120: Subheadline */}
        <Sequence from={45} durationInFrames={durationInFrames - 45}>
          <div style={{ marginBottom: 56, maxWidth: 780 }}>
            <BlurReveal from={0} direction="up">
              <p
                style={{
                  margin: 0,
                  fontSize: 26,
                  color: p.muted,
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontWeight: 400,
                  lineHeight: 1.55,
                }}
              >
                {subheadline}
              </p>
            </BlurReveal>
          </div>
        </Sequence>

        {/* Frame 80–140: Feature icon + label */}
        <Sequence from={80} durationInFrames={durationInFrames - 80}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              marginBottom: 48,
            }}
          >
            <AnimatedIcon
              icon="Zap"
              animation="pop"
              from={5}
              size={40}
              color={p.accent}
              strokeWidth={2}
            />
            <BlurReveal from={12} direction="up">
              <span
                style={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontSize: 15,
                  color: p.muted,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                }}
              >
                AI-powered generation
              </span>
            </BlurReveal>
          </div>
        </Sequence>

        {/* Frame 120–200: Second feature */}
        <Sequence from={120} durationInFrames={durationInFrames - 120}>
          <div style={{ marginBottom: 56 }}>
            <BlurReveal from={5} direction="up">
              <p
                style={{
                  margin: 0,
                  fontSize: 48,
                  fontWeight: 700,
                  color: p.text,
                  fontFamily: '"Space Grotesk", sans-serif',
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                }}
              >
                No design skills needed.
              </p>
            </BlurReveal>
          </div>
        </Sequence>

        {/* Frame 200–270: CTA */}
        <Sequence from={200} durationInFrames={durationInFrames - 200}>
          <div
            style={{
              opacity: ctaOpacity,
              transform: `scale(${ctaScale}) translateY(${ctaY}px)`,
              willChange: 'transform, opacity',
            }}
          >
            <div
              style={{
                display: 'inline-block',
                background: p.accent,
                color: p.bg,
                fontSize: 22,
                fontWeight: 700,
                padding: '20px 52px',
                borderRadius: 8,
                letterSpacing: '0.03em',
                fontFamily: '"Space Grotesk", sans-serif',
                boxShadow: `0 0 48px ${p.accent}55, 0 8px 32px ${p.accent}33`,
              }}
            >
              {cta}
            </div>
          </div>
        </Sequence>

      </div>
    </AbsoluteFill>
  );
};
