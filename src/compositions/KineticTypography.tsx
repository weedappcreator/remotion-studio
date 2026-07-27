/**
 * KineticTypography — Premium motion reel opener
 * 400 frames @ 30fps ≈ 13.3s
 * Obsidian palette: bg=#0A0A0B text=#F5F5F7 accent=#E8FF47 muted=#6B6B6B
 */
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
import { ParticlesBg } from '../components/ParticlesBg';
import { KineticText } from '../components/KineticText';
import { BlurReveal } from '../components/BlurReveal';
import { SPRING, TIMING, PALETTE } from '../style/tokens';
import { useAnimationPresets } from '../hooks/useAnimationPresets';

// ─── Palette ─────────────────────────────────────────────────────────────────
const P = PALETTE.obsidian;
const ACCENT = '#E8FF47';
const MUTED = '#6B6B6B';

// ─── Accent rule ─────────────────────────────────────────────────────────────
const AccentRule: React.FC = () => {
  const { opacity, transform } = useAnimationPresets({
    from: 30,
    preset: 'drawLine',
    config: SPRING.SNAPPY,
  });

  return (
    <div
      style={{
        width: 60,
        height: 1,
        background: ACCENT,
        opacity,
        transform,
        transformOrigin: 'left center',
        marginBottom: 32,
        marginTop: 4,
      }}
    />
  );
};

// ─── Studio label ────────────────────────────────────────────────────────────
const StudioLabel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - 320;
  const progress = spring({ frame: localFrame, fps, config: SPRING.GENTLE });
  const opacity = interpolate(progress, [0, 0.5], [0, 1], { extrapolateRight: 'clamp' });
  const dy = interpolate(progress, [0, 1], [10, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 56,
        left: 80,
        opacity,
        transform: `translateY(${dy}px)`,
        fontFamily: '"Space Mono", "Courier New", monospace',
        fontSize: 11,
        letterSpacing: '0.22em',
        color: MUTED,
        fontWeight: 400,
        textTransform: 'uppercase' as const,
      }}
    >
      Remotion Studio · 2026
    </div>
  );
};

// ─── Scene 1: "Make it"  (0-100f) ────────────────────────────────────────────
const Scene1: React.FC = () => (
  <AbsoluteFill
    style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '0 80px',
    }}
  >
    <KineticText
      text="Make it"
      from={15}
      mode="slideUp"
      fontSize={140}
      color={P.text}
      staggerFrames={8}
      exitFrom={72}
    />
  </AbsoluteFill>
);

// ─── Scene 2: "unforgettable."  (80-200f) ────────────────────────────────────
const Scene2: React.FC = () => (
  <AbsoluteFill
    style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '0 80px',
    }}
  >
    <BlurReveal from={90} direction="up">
      <KineticText
        text="unforgettable."
        from={95}
        mode="blur"
        fontSize={120}
        color={ACCENT}
        staggerFrames={6}
        exitFrom={172}
      />
    </BlurReveal>
  </AbsoluteFill>
);

// ─── Scene 3: "Make it"  (190-300f) ──────────────────────────────────────────
const Scene3: React.FC = () => (
  <AbsoluteFill
    style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '0 80px',
    }}
  >
    <KineticText
      text="Make it"
      from={200}
      mode="scale"
      fontSize={140}
      color={P.text}
      staggerFrames={7}
      exitFrom={272}
    />
  </AbsoluteFill>
);

// ─── Scene 4: "yours."  (280-400f) ───────────────────────────────────────────
const Scene4: React.FC = () => (
  <AbsoluteFill
    style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '0 80px',
    }}
  >
    <KineticText
      text="yours."
      from={285}
      mode="glitch"
      fontSize={160}
      color={P.text}
      staggerFrames={5}
      exitFrom={370}
    />
  </AbsoluteFill>
);

// ─── Root composition ─────────────────────────────────────────────────────────
interface KineticTypographyProps {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  lines?: string[];
  palette?: keyof typeof PALETTE;
}

export const KineticTypography: React.FC<KineticTypographyProps> = () => {
  return (
    <AbsoluteFill style={{ background: P.bg, overflow: 'hidden' }}>
      {/* ── Layer 0: Animated mesh gradient ── */}
      <GradientBg
        colors={[P.bg, P.surface, '#1C1C1E']}
        speed={0.18}
      />

      {/* ── Layer 1: Particle field ── */}
      <ParticlesBg
        count={55}
        color={ACCENT}
        baseOpacity={0.12}
        fadeInFrom={0}
        fadeInDuration={50}
      />

      {/* ── Layer 2: Film grain ── */}
      <NoiseBg opacity={0.04} size={180} />

      {/* ── Persistent accent rule ── */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 80px',
          pointerEvents: 'none',
        }}
      >
        {/* Sits above scenes via z-index */}
        <div style={{ position: 'absolute', left: 80, top: '50%', transform: 'translateY(-120px)' }}>
          <AccentRule />
        </div>
      </AbsoluteFill>

      {/* ── Scene 1: "Make it" (0-100f) ── */}
      <Sequence from={0} durationInFrames={100}>
        <Scene1 />
      </Sequence>

      {/* ── Scene 2: "unforgettable." (80-200f) ── */}
      <Sequence from={80} durationInFrames={120}>
        <Scene2 />
      </Sequence>

      {/* ── Scene 3: "Make it" (190-300f) ── */}
      <Sequence from={190} durationInFrames={110}>
        <Scene3 />
      </Sequence>

      {/* ── Scene 4: "yours." (280-400f) ── */}
      <Sequence from={280} durationInFrames={120}>
        <Scene4 />
      </Sequence>

      {/* ── Studio label: fades in at 320f ── */}
      <StudioLabel />
    </AbsoluteFill>
  );
};
