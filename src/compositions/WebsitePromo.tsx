import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { GradientBg } from '../components/GradientBg';
import { NoiseBg } from '../components/NoiseBg';
import { KineticText } from '../components/KineticText';
import { BlurReveal } from '../components/BlurReveal';
import { PALETTE, SPRING } from '../style/tokens';

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
  brandName = 'UIGen',
  palette = 'obsidian',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = PALETTE[palette];

  const ctaProgress = spring({ frame: frame - 60, fps, config: SPRING.BOUNCY });
  const ctaScale = interpolate(ctaProgress, [0, 1], [0.8, 1]);
  const ctaOpacity = interpolate(ctaProgress, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '0 160px', textAlign: 'left' }}>
      <GradientBg colors={[p.bg, p.surface, p.surface]} speed={0.1} />
      <NoiseBg opacity={0.03} />

      {/* Brand */}
      <BlurReveal from={0} direction="down">
        <div style={{ fontSize: 18, color: p.accent, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: 40 }}>
          {brandName}
        </div>
      </BlurReveal>

      {/* Headline */}
      <KineticText
        text={headline}
        from={10}
        mode="slideUp"
        fontSize={120}
        color={p.text}
        staggerFrames={6}
      />

      {/* Subheadline */}
      <BlurReveal from={35} direction="up">
        <div style={{ fontSize: 28, color: p.muted, fontFamily: '"DM Sans", sans-serif', fontWeight: 400, lineHeight: 1.5, marginTop: 24, maxWidth: 700 }}>
          {subheadline}
        </div>
      </BlurReveal>

      {/* CTA */}
      <div style={{
        marginTop: 52,
        opacity: ctaOpacity,
        transform: `scale(${ctaScale})`,
        background: p.accent,
        color: p.bg,
        fontSize: 22,
        fontWeight: 700,
        padding: '18px 48px',
        borderRadius: 8,
        letterSpacing: '0.04em',
        fontFamily: '"Space Grotesk", sans-serif',
        alignSelf: 'flex-start',
        boxShadow: `0 0 40px ${p.accent}50`,
      }}>
        {cta}
      </div>
    </AbsoluteFill>
  );
};
