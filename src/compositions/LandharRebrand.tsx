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
import { KineticText } from '../components/KineticText';
import { FadeTransition } from '../components/FadeTransition';
import { SPRING } from '../style/tokens';

// ─── Brand Tokens ─────────────────────────────────────────────────────────────
const LANDHAR = {
  bg: '#0A0A09',
  surface: '#141412',
  text: '#F5F0E8',
  accent: '#C84B0E',
  muted: '#6B6560',
};

const FONTS = {
  display: "'Cormorant Garamond', Georgia, serif",
  body: "'DM Sans', sans-serif",
  mono: "'Space Mono', monospace",
};

// ─── Animated orange rule ──────────────────────────────────────────────────────
interface OrangeRuleProps {
  from: number;
  targetWidth: number;
  durationFrames?: number;
}

const OrangeRule: React.FC<OrangeRuleProps> = ({ from, targetWidth, durationFrames = 30 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - from;
  const progress = spring({ frame: local, fps, config: SPRING.SMOOTH });
  const width = interpolate(progress, [0, 1], [0, targetWidth], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        height: 1,
        width,
        background: LANDHAR.accent,
        overflow: 'hidden',
      }}
    />
  );
};

// ─── Scene 1 — Open (frames 0–210) ────────────────────────────────────────────
const SceneOpen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Wordmark fades in at frame 30
  const wordmarkProgress = spring({ frame: frame - 30, fps, config: SPRING.GENTLE });
  const wordmarkOpacity = interpolate(wordmarkProgress, [0, 1], [0, 1], { extrapolateRight: 'clamp' });

  // Rule draws from frame 80
  // Label fades in at frame 120
  const labelProgress = spring({ frame: frame - 120, fps, config: SPRING.SMOOTH });
  const labelOpacity = interpolate(labelProgress, [0, 1], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 140px',
      }}
    >
      {/* Wordmark */}
      <div
        style={{
          opacity: wordmarkOpacity,
          fontFamily: FONTS.display,
          fontSize: 96,
          fontWeight: 300,
          letterSpacing: '0.35em',
          color: LANDHAR.text,
          textTransform: 'uppercase' as const,
          marginBottom: 24,
          textAlign: 'center' as const,
        }}
      >
        LANDHAR HOMES
      </div>

      {/* Orange rule */}
      <div style={{ marginBottom: 28 }}>
        <OrangeRule from={80} targetWidth={180} />
      </div>

      {/* EST label */}
      <div
        style={{
          opacity: labelOpacity,
          fontFamily: FONTS.mono,
          fontSize: 13,
          letterSpacing: '0.22em',
          color: LANDHAR.muted,
          textTransform: 'uppercase' as const,
          textAlign: 'center' as const,
        }}
      >
        EST. · BELLA VISTA NSW · AUSTRALIA
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 2 — The Announcement (frames 210–480) ──────────────────────────────
const SceneAnnouncement: React.FC = () => {
  const frame = useCurrentFrame();

  // Relative to sequence start
  const subOpacity = interpolate(
    frame,
    [60, 80],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '0 160px',
      }}
    >
      {/* Line 1 — "A new chapter." */}
      <BlurReveal from={5} direction="up">
        <div
          style={{
            fontFamily: FONTS.display,
            fontSize: 112,
            fontWeight: 300,
            color: LANDHAR.text,
            letterSpacing: '-0.01em',
            lineHeight: 1.05,
            marginBottom: 8,
          }}
        >
          A new chapter.
        </div>
      </BlurReveal>

      {/* Line 2 — "A new standard." staggered 20 frames */}
      <BlurReveal from={25} direction="up">
        <div
          style={{
            fontFamily: FONTS.display,
            fontSize: 112,
            fontWeight: 300,
            color: LANDHAR.text,
            letterSpacing: '-0.01em',
            lineHeight: 1.05,
            marginBottom: 56,
          }}
        >
          A new standard.
        </div>
      </BlurReveal>

      {/* Sub text — "Landhar Homes. Reimagined." */}
      <div
        style={{
          opacity: subOpacity,
          fontFamily: FONTS.body,
          fontSize: 26,
          fontWeight: 300,
          color: LANDHAR.muted,
          letterSpacing: '0.05em',
        }}
      >
        Landhar Homes. Reimagined.
      </div>
    </AbsoluteFill>
  );
};

// ─── Pillar component ──────────────────────────────────────────────────────────
interface PillarProps {
  word: string;
  sub: string;
  ruleWidth: number;
  inFrom: number;
  outFrom: number;
}

const Pillar: React.FC<PillarProps> = ({ word, sub, ruleWidth, inFrom, outFrom }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const inProgress = spring({ frame: frame - inFrom, fps, config: SPRING.SMOOTH });
  const inOpacity = interpolate(inProgress, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
  const inY = interpolate(inProgress, [0, 1], [40, 0]);

  const outProgress = spring({ frame: frame - outFrom, fps, config: SPRING.SNAPPY });
  const outOpacity = interpolate(outProgress, [0, 1], [1, 0], { extrapolateRight: 'clamp' });

  const opacity = inOpacity * outOpacity;
  const transform = `translateY(${inY}px)`;

  const ruleProgress = spring({ frame: frame - (inFrom + 10), fps, config: SPRING.SMOOTH });
  const ruleW = interpolate(ruleProgress, [0, 1], [0, ruleWidth], { extrapolateRight: 'clamp' });

  return (
    <div style={{ opacity, transform }}>
      <div
        style={{
          fontFamily: FONTS.display,
          fontSize: 128,
          fontWeight: 300,
          color: LANDHAR.text,
          letterSpacing: '0.02em',
          lineHeight: 1,
          marginBottom: 6,
        }}
      >
        {word}
      </div>
      {/* Orange underline rule under the pillar word only */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ height: 1, width: ruleW, background: LANDHAR.accent }} />
      </div>
      <div
        style={{
          fontFamily: FONTS.body,
          fontSize: 28,
          fontWeight: 300,
          color: LANDHAR.muted,
          letterSpacing: '0.06em',
          fontStyle: 'italic',
        }}
      >
        {sub}
      </div>
    </div>
  );
};

// ─── Scene 3 — Three Pillars (frames 480–870) ─────────────────────────────────
// Pillar 1: seq-local 0–140 (480–620 abs)
// Pillar 2: seq-local 140–280 (620–760 abs)
// Pillar 3: seq-local 280–390 (760–870 abs)
const ScenePillars: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '0 160px',
      }}
    >
      {/* Pillar 1: in at 5, out at 125 */}
      {frame < 155 && (
        <Pillar
          word="Expertise"
          sub="you can see."
          ruleWidth={140}
          inFrom={5}
          outFrom={125}
        />
      )}

      {/* Pillar 2: in at 145, out at 265 */}
      {frame >= 135 && frame < 295 && (
        <Pillar
          word="Clarity"
          sub="you can feel."
          ruleWidth={116}
          inFrom={145}
          outFrom={265}
        />
      )}

      {/* Pillar 3: in at 285, no exit (stays to end of scene) */}
      {frame >= 275 && (
        <Pillar
          word="Quality"
          sub="you can trust."
          ruleWidth={124}
          inFrom={285}
          outFrom={999}
        />
      )}
    </AbsoluteFill>
  );
};

// ─── Scene 4 — Positioning Statement (frames 870–1140) ────────────────────────
const ScenePositioning: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const subProgress = spring({ frame: frame - 40, fps, config: SPRING.SMOOTH });
  const subOpacity = interpolate(subProgress, [0, 1], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '0 160px',
      }}
    >
      {/* Main positioning line — word by word */}
      <KineticText
        text="Uncompromising homes, built with clarity."
        from={5}
        mode="blur"
        fontSize={88}
        color={LANDHAR.text}
        fontFamily={FONTS.display}
        staggerFrames={6}
        splitBy="words"
      />

      {/* Italic subtext */}
      <div
        style={{
          opacity: subOpacity,
          fontFamily: FONTS.body,
          fontSize: 22,
          fontWeight: 300,
          color: LANDHAR.muted,
          fontStyle: 'italic',
          letterSpacing: '0.03em',
          marginTop: 44,
          maxWidth: 780,
          lineHeight: 1.7,
        }}
      >
        Guiding every homeowner through every decision, every detail, every step.
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 5 — Brand Reveal + Close (frames 1140–1350) ────────────────────────
const SceneClose: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Brief flash to full black first 5 frames handled by FadeTransition inFrom
  // Wordmark in at frame 10
  const wordProgress = spring({ frame: frame - 10, fps, config: SPRING.GENTLE });
  const wordOpacity = interpolate(wordProgress, [0, 1], [0, 1], { extrapolateRight: 'clamp' });

  // URL label at frame 55
  const urlProgress = spring({ frame: frame - 55, fps, config: SPRING.SMOOTH });
  const urlOpacity = interpolate(urlProgress, [0, 1], [0, 1], { extrapolateRight: 'clamp' });

  // Corner label at frame 70
  const cornerOpacity = interpolate(frame, [70, 90], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Final fade out: frames 180–210 (absolute 1320–1350)
  const fadeOut = interpolate(frame, [180, 210], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      {/* Center block */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Wordmark */}
        <div
          style={{
            opacity: wordOpacity,
            fontFamily: FONTS.display,
            fontSize: 108,
            fontWeight: 300,
            letterSpacing: '0.35em',
            color: LANDHAR.text,
            textTransform: 'uppercase' as const,
            marginBottom: 22,
            textAlign: 'center' as const,
          }}
        >
          LANDHAR HOMES
        </div>

        {/* Orange rule */}
        <div style={{ marginBottom: 28 }}>
          <OrangeRule from={20} targetWidth={180} />
        </div>

        {/* URL */}
        <div
          style={{
            opacity: urlOpacity,
            fontFamily: FONTS.mono,
            fontSize: 16,
            letterSpacing: '0.18em',
            color: LANDHAR.muted,
            textTransform: 'lowercase' as const,
          }}
        >
          landhar.com.au
        </div>
      </div>

      {/* Bottom left corner */}
      <div
        style={{
          position: 'absolute',
          bottom: 52,
          left: 80,
          opacity: cornerOpacity,
          fontFamily: FONTS.mono,
          fontSize: 11,
          letterSpacing: '0.18em',
          color: LANDHAR.muted,
          textTransform: 'uppercase' as const,
        }}
      >
        Premium Custom Homes · Sydney · NSW
      </div>

      {/* Bottom right corner */}
      <div
        style={{
          position: 'absolute',
          bottom: 52,
          right: 80,
          opacity: cornerOpacity,
          fontFamily: FONTS.mono,
          fontSize: 11,
          letterSpacing: '0.18em',
          color: LANDHAR.muted,
        }}
      >
        EST. · BELLA VISTA NSW · AUSTRALIA
      </div>
    </AbsoluteFill>
  );
};

// ─── Root composition ──────────────────────────────────────────────────────────
export const LandharRebrand: React.FC = () => {
  const frame = useCurrentFrame();

  // Scene 1 fade out at frame 195 over 15 frames
  const scene1OutOpacity = interpolate(frame, [195, 210], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Flash to black at scene 5 transition: frames 1140–1145 → black, 1145–1155 → reveal
  const flashBlack = frame >= 1140 && frame < 1145
    ? interpolate(frame, [1140, 1145], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : frame >= 1145 && frame < 1155
    ? interpolate(frame, [1145, 1155], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;

  return (
    <AbsoluteFill style={{ background: LANDHAR.bg }}>
      {/* Persistent grain texture */}
      <GradientBg colors={['#0A0A09', '#141412', '#141412']} speed={0.05} />
      <NoiseBg opacity={0.045} />

      {/* ── Scene 1: Open 0–210 ── */}
      <Sequence from={0} durationInFrames={210}>
        <AbsoluteFill style={{ opacity: scene1OutOpacity }}>
          <SceneOpen />
        </AbsoluteFill>
      </Sequence>

      {/* ── Scene 2: Announcement 210–480 ── */}
      <Sequence from={210} durationInFrames={270}>
        <FadeTransition inFrom={0} inDuration={20} outFrom={250} outDuration={20}>
          <SceneAnnouncement />
        </FadeTransition>
      </Sequence>

      {/* ── Scene 3: Pillars 480–870 ── */}
      <Sequence from={480} durationInFrames={390}>
        <FadeTransition inFrom={0} inDuration={15} outFrom={375} outDuration={15}>
          <ScenePillars />
        </FadeTransition>
      </Sequence>

      {/* ── Scene 4: Positioning Statement 870–1140 ── */}
      <Sequence from={870} durationInFrames={270}>
        <FadeTransition inFrom={0} inDuration={20} outFrom={250} outDuration={20}>
          <ScenePositioning />
        </FadeTransition>
      </Sequence>

      {/* ── Flash to black transition ── */}
      <AbsoluteFill
        style={{
          background: '#000000',
          opacity: flashBlack,
          pointerEvents: 'none',
        }}
      />

      {/* ── Scene 5: Brand Reveal + Close 1140–1350 ── */}
      <Sequence from={1140} durationInFrames={210}>
        <FadeTransition inFrom={5} inDuration={15}>
          <SceneClose />
        </FadeTransition>
      </Sequence>
    </AbsoluteFill>
  );
};
