import React from 'react';
import { AbsoluteFill, Audio, Easing, interpolate, useCurrentFrame, Img, staticFile } from 'remotion';
import { GradientBg } from '../components/GradientBg';
import { NoiseBg } from '../components/NoiseBg';
import { ParticlesBg } from '../components/ParticlesBg';
import { BlurReveal } from '../components/BlurReveal';
import { buildVideoSwarmConfig, logSwarmInit } from '../lib/ruflo';

// ─── Ruflo init ───────────────────────────────────────────────────────────────
const _swarm = buildVideoSwarmConfig('LandharSlowBurn — abstract luxury slow burn');
logSwarmInit(_swarm.agents, _swarm.task);

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const B = {
  bg:      '#0D0B08',
  text:    '#ECE9E2',
  amber:   '#C47C3A',
  gold:    '#D4A853',
  muted:   '#6B6258',
  display: "'Cormorant Garamond', Georgia, serif",
};

// ─── Easing ───────────────────────────────────────────────────────────────────
const E_SLOW = Easing.bezier(0.45, 0, 0.55, 1);
const E_TEXT = Easing.bezier(0.16, 1, 0.30, 1);
const CLAMP = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };

// ─── AmberGlow ────────────────────────────────────────────────────────────────
const AmberGlow: React.FC<{ from: number; intensity?: number }> = ({ from, intensity = 0.15 }) => {
  const f = useCurrentFrame();
  const opacity = interpolate(f, [from, from + 60], [0, intensity], { ...CLAMP, easing: E_SLOW });
  const pulse = Math.sin((f - from) * 0.04) * 0.03 + opacity;
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: `radial-gradient(ellipse 70% 50% at 50% 60%, rgba(196,124,58,${Math.max(0, pulse)}) 0%, transparent 70%)`,
      pointerEvents: 'none',
    }} />
  );
};

// ─── HairlineRule ─────────────────────────────────────────────────────────────
const HairlineRule: React.FC<{ from: number; width?: number }> = ({ from, width = 120 }) => {
  const f = useCurrentFrame();
  const w = interpolate(f, [from, from + 30], [0, width], { ...CLAMP, easing: E_SLOW });
  return <div style={{ width: w, height: 1, background: B.amber, display: 'block' }} />;
};

// ─── LiveCopy — opacity + translateY fade-in, no per-letter animation ─────────
interface LiveCopyProps {
  children: React.ReactNode;
  from: number;
  style?: React.CSSProperties;
}

const LiveCopy: React.FC<LiveCopyProps> = ({ children, from, style }) => {
  const f = useCurrentFrame();
  const opacity = interpolate(f, [from, from + 24], [0, 1], { ...CLAMP, easing: E_TEXT });
  const y = interpolate(f, [from, from + 24], [20, 0], { ...CLAMP, easing: E_TEXT });
  return (
    <div style={{ opacity, transform: `translateY(${y}px)`, ...style }}>
      {children}
    </div>
  );
};

// ─── Shared background layers ─────────────────────────────────────────────────
const BackgroundLayers: React.FC = () => (
  <>
    <GradientBg
      colors={['#0D0B08', '#1A1208', '#0A0A08']}
      speed={0.06}
    />
    <ParticlesBg
      count={35}
      color="#D4A853"
      baseOpacity={0.08}
      fadeInFrom={0}
      fadeInDuration={90}
    />
    <NoiseBg opacity={0.055} size={160} />
  </>
);

// ─── Shared layout wrapper ────────────────────────────────────────────────────
const CenteredLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 80px',
    textAlign: 'center',
  }}>
    {children}
  </div>
);

// ─── Main Composition ─────────────────────────────────────────────────────────
export const LandharSlowBurn: React.FC = () => {
  const f = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: B.bg }}>
      <BackgroundLayers />

      {/* ── Scene 1 (0–89): Pure ambient ── */}
      <AmberGlow from={20} intensity={0.10} />

      {/* ── Scene 2 (90–209): First words ── */}
      {f >= 90 && (
        <AmberGlow from={90} intensity={0.14} />
      )}
      {f >= 90 && (
        <CenteredLayout>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <LiveCopy from={108}>
              <span style={{
                fontFamily: B.display,
                fontSize: 96,
                color: B.text,
                lineHeight: 1.05,
                fontWeight: 400,
                display: 'block',
              }}>
                Every commission
              </span>
            </LiveCopy>
            <LiveCopy from={120}>
              <span style={{
                fontFamily: B.display,
                fontSize: 80,
                color: B.muted,
                lineHeight: 1.05,
                fontWeight: 400,
                display: 'block',
              }}>
                held to one standard.
              </span>
            </LiveCopy>
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
              <HairlineRule from={135} width={160} />
            </div>
          </div>
        </CenteredLayout>
      )}

      {/* ── Scene 3 (210–329): Three qualities ── */}
      {f >= 210 && (
        <CenteredLayout>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <LiveCopy from={228}>
              <span style={{
                fontFamily: B.display,
                fontSize: 88,
                color: B.text,
                lineHeight: 1.1,
                fontWeight: 400,
                display: 'block',
              }}>
                Uncompromising.
              </span>
            </LiveCopy>
            <LiveCopy from={232}>
              <span style={{
                fontFamily: B.display,
                fontSize: 88,
                color: B.text,
                lineHeight: 1.1,
                fontWeight: 400,
                display: 'block',
              }}>
                Considered.
              </span>
            </LiveCopy>
            <LiveCopy from={236}>
              <span style={{
                fontFamily: B.display,
                fontSize: 88,
                color: B.amber,
                lineHeight: 1.1,
                fontWeight: 400,
                display: 'block',
              }}>
                Crafted.
              </span>
            </LiveCopy>
          </div>
        </CenteredLayout>
      )}

      {/* ── Scene 4 (330–449): Continuity statement ── */}
      {f >= 330 && (
        <>
          <AmberGlow from={330} intensity={0.18} />
          <CenteredLayout>
            <LiveCopy from={348}>
              <span style={{
                fontFamily: B.display,
                fontSize: 88,
                fontStyle: 'italic',
                color: B.text,
                lineHeight: 1.1,
                fontWeight: 400,
                display: 'block',
              }}>
                That has never changed.
              </span>
            </LiveCopy>
          </CenteredLayout>
        </>
      )}

      {/* ── Scene 5 (450–569): THE TURN ── */}
      {f >= 450 && (
        <>
          <AmberGlow from={450} intensity={0.22} />
          <CenteredLayout>
            <LiveCopy from={468}>
              <span style={{
                fontFamily: B.display,
                fontSize: 104,
                color: B.text,
                lineHeight: 1.08,
                fontWeight: 400,
                display: 'block',
              }}>
                Now, it comes into view.
              </span>
            </LiveCopy>
          </CenteredLayout>
        </>
      )}

      {/* ── Scene 6 (570–689): Logo reveal ── */}
      {f >= 570 && (
        <>
          <AmberGlow from={570} intensity={0.08} />
          <CenteredLayout>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
              <BlurReveal from={f >= 570 ? 570 + 18 : 0}>
                <Img
                  src={staticFile('brand/landhar-icon-white.png')}
                  style={{ width: 88, height: 'auto' }}
                />
              </BlurReveal>
              <BlurReveal from={f >= 570 ? 570 + 30 : 0}>
                <Img
                  src={staticFile('brand/landhar-logo-white.png')}
                  style={{ width: 280, height: 'auto' }}
                />
              </BlurReveal>
            </div>
          </CenteredLayout>
        </>
      )}

      {/* ── Scene 7 (690–809): Final hold ── */}
      {f >= 690 && (
        <CenteredLayout>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
            {/* Logo remains */}
            <BlurReveal from={570 + 18}>
              <Img
                src={staticFile('brand/landhar-icon-white.png')}
                style={{ width: 88, height: 'auto' }}
              />
            </BlurReveal>
            <BlurReveal from={570 + 30}>
              <Img
                src={staticFile('brand/landhar-logo-white.png')}
                style={{ width: 280, height: 'auto' }}
              />
            </BlurReveal>

            {/* Hairline */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <HairlineRule from={690 + 12} width={160} />
            </div>

            {/* Tagline */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <LiveCopy from={690 + 28}>
                <span style={{
                  fontFamily: B.display,
                  fontSize: 38,
                  color: B.muted,
                  lineHeight: 1.4,
                  fontWeight: 400,
                  display: 'block',
                }}>
                  Custom homes, commissioned
                </span>
              </LiveCopy>
              <LiveCopy from={690 + 32}>
                <span style={{
                  fontFamily: B.display,
                  fontSize: 38,
                  color: B.muted,
                  lineHeight: 1.4,
                  fontWeight: 400,
                  display: 'block',
                }}>
                  across Greater Sydney.
                </span>
              </LiveCopy>
            </div>
          </div>
        </CenteredLayout>
      )}

      {/* ElevenLabs narration — George voice, warm editorial gravitas */}
      <Audio src={staticFile('audio/landhar-slowburn.mp3')} startFrom={10} />

    </AbsoluteFill>
  );
};
