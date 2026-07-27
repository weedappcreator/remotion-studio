/**
 * LandharLaunchTeaser — 27s vertical gallery film
 * 1080 × 1920 · 30 fps · 810 frames
 *
 * Ruflo swarm boot:
 *   import { buildVideoSwarmConfig, logSwarmInit } from '../lib/ruflo';
 *   const swarm = buildVideoSwarmConfig('LandharLaunchTeaser — premium architectural gallery film');
 *   logSwarmInit(swarm.agents, swarm.task);
 */

import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  Sequence,
  Img,
  staticFile,
  AbsoluteFill,
} from 'remotion';
import { buildVideoSwarmConfig, logSwarmInit } from '../lib/ruflo';

// ─── Ruflo swarm init ────────────────────────────────────────────────────────
const _swarm = buildVideoSwarmConfig(
  'LandharLaunchTeaser — premium architectural gallery film',
);
logSwarmInit(_swarm.agents, _swarm.task);

// ─── Brand tokens ────────────────────────────────────────────────────────────
const BRAND = {
  bg: '#111110',
  text: '#ECE9E2',
  accent: '#C47C3A',
  display: "'Cormorant Garamond', Georgia, serif",
  body: "'Inter', sans-serif",
} as const;

// ─── Easing curves ───────────────────────────────────────────────────────────
const EASE_EDITORIAL = Easing.bezier(0.45, 0, 0.55, 1);  // slow image movement
const EASE_TEXT = Easing.bezier(0.16, 1, 0.3, 1);         // controlled text entrance

const CLAMP = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

// ─── AmberHairline ───────────────────────────────────────────────────────────
/**
 * A 1–2px amber line that draws its width from 0 → props.width over 20 frames.
 * Used as a decorative underline after text settles (Cards 2, 7).
 */
interface AmberHairlineProps {
  from: number;
  width: number;
}

const AmberHairline: React.FC<AmberHairlineProps> = ({ from, width }) => {
  const frame = useCurrentFrame();
  const drawnWidth = interpolate(frame, [from, from + 20], [0, width], {
    ...CLAMP,
    easing: EASE_EDITORIAL,
  });
  return (
    <div
      style={{
        width: drawnWidth,
        height: 1,
        backgroundColor: BRAND.accent,
        overflow: 'hidden',
      }}
    />
  );
};

// ─── HairlineWipe ─────────────────────────────────────────────────────────────
/**
 * Full-height 1px amber line sweeping left→right over 14 frames.
 * Behind it, an animated clipPath reveals incomingChild.
 * The wrapper must be positioned absolutely to fill the parent scene.
 */
interface HairlineWipeProps {
  from: number;
  incomingChild: React.ReactNode;
}

const HairlineWipe: React.FC<HairlineWipeProps> = ({ from, incomingChild }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const DURATION = 14;

  // hairline x position: 0 → width over DURATION frames
  const hairlineX = interpolate(frame, [from, from + DURATION], [0, width], {
    ...CLAMP,
    easing: EASE_EDITORIAL,
  });

  // incoming scene is clipped: only the right side of hairlineX is revealed
  const clipLeft = hairlineX;

  return (
    <>
      {/* Incoming scene clipped by hairline's leading edge */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          clipPath: `inset(0 0 0 ${clipLeft}px)`,
        }}
      >
        {incomingChild}
      </div>

      {/* 1px amber hairline — the leading edge */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: hairlineX,
          width: 1,
          height: '100%',
          backgroundColor: BRAND.accent,
          opacity: hairlineX < width ? 1 : 0,
        }}
      />
    </>
  );
};

// ─── PhotoScene ───────────────────────────────────────────────────────────────
/**
 * Full-bleed photo with Ken Burns motion.
 * motion='scale'  → scale 1.035→1.065 + translateY 0→-15px over totalFrames
 * motion='up'     → translateY 0→-20px (slow upward drift)
 * motion='down'   → translateY 0→10px  (slow downward drift)
 *
 * startFrame / totalFrames allow absolute-frame math so Card 1→2
 * share the same motion continuum.
 */
interface PhotoSceneProps {
  src: string;
  startFrame: number;
  totalFrames: number;
  motion: 'up' | 'down' | 'scale';
}

const PhotoScene: React.FC<PhotoSceneProps> = ({
  src,
  startFrame,
  totalFrames,
  motion,
}) => {
  const frame = useCurrentFrame();
  // Use absolute frame for Card 1+2 continuity
  const absoluteFrame = frame + startFrame;
  const end = startFrame + totalFrames;

  let scale = 1;
  let translateY = 0;

  if (motion === 'scale') {
    scale = interpolate(absoluteFrame, [0, end], [1.035, 1.065], {
      ...CLAMP,
      easing: EASE_EDITORIAL,
    });
    translateY = interpolate(absoluteFrame, [0, end], [0, -15], {
      ...CLAMP,
      easing: EASE_EDITORIAL,
    });
  } else if (motion === 'up') {
    translateY = interpolate(
      absoluteFrame,
      [startFrame, end],
      [0, -20],
      { ...CLAMP, easing: EASE_EDITORIAL },
    );
  } else if (motion === 'down') {
    translateY = interpolate(
      absoluteFrame,
      [startFrame, end],
      [0, 10],
      { ...CLAMP, easing: EASE_EDITORIAL },
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
      }}
    >
      <Img
        src={staticFile(src)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale}) translateY(${translateY}px)`,
          transformOrigin: 'center center',
          display: 'block',
        }}
      />
    </div>
  );
};

// ─── LiveCopy ─────────────────────────────────────────────────────────────────
/**
 * Animated text layer.
 * Single string → one block.
 * string[] → multiple lines with a 3-frame stagger between each.
 * Entrance: opacity 0→1 + translateY 20→0 over 20 frames, EASE_TEXT.
 */
interface LiveCopyProps {
  from: number;
  text: string | string[];
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  textAlign?: React.CSSProperties['textAlign'];
}

const LiveCopy: React.FC<LiveCopyProps> = ({
  from,
  text,
  fontSize = 88,
  color = BRAND.text,
  fontFamily = BRAND.display,
  textAlign = 'left',
}) => {
  const frame = useCurrentFrame();
  const lines = Array.isArray(text) ? text : [text];

  return (
    <div style={{ textAlign }}>
      {lines.map((line, i) => {
        const lineFrom = from + i * 3;
        const opacity = interpolate(frame, [lineFrom, lineFrom + 20], [0, 1], {
          ...CLAMP,
          easing: EASE_TEXT,
        });
        const ty = interpolate(frame, [lineFrom, lineFrom + 20], [20, 0], {
          ...CLAMP,
          easing: EASE_TEXT,
        });
        return (
          <div
            key={i}
            style={{
              opacity,
              transform: `translateY(${ty}px)`,
              fontFamily,
              fontSize,
              fontWeight: 400,
              color,
              lineHeight: 1.2,
              letterSpacing: '0.01em',
              display: 'block',
            }}
          >
            {line}
          </div>
        );
      })}
    </div>
  );
};

// ─── Subtle text legibility gradient ─────────────────────────────────────────
const TextGradientOverlay: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: 480,
      background:
        'linear-gradient(to top, rgba(17,17,16,0.72) 0%, rgba(17,17,16,0) 100%)',
      pointerEvents: 'none',
    }}
  />
);

// ─── Main composition ─────────────────────────────────────────────────────────
export const LandharLaunchTeaser: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bg, overflow: 'hidden' }}>

      {/* ── CARD 1 — frames 0–89 ── */}
      {/* Image only, no text, no logo, no transition */}
      <Sequence from={0} durationInFrames={90}>
        {/* PhotoScene uses absolute frame — startFrame=0, totalFrames=210 spans Cards 1+2 */}
        <PhotoScene
          src="media/turramurra-living.png"
          startFrame={0}
          totalFrames={210}
          motion="scale"
        />
      </Sequence>

      {/* ── CARD 2 — frames 90–209 ── */}
      {/* Continuous image (same PhotoScene math) + text + amber hairline */}
      <Sequence from={90} durationInFrames={120}>
        {/* Same image, same absolute motion math — visually continuous */}
        <PhotoScene
          src="media/turramurra-living.png"
          startFrame={0}
          totalFrames={210}
          motion="scale"
        />
        <TextGradientOverlay />
        <div
          style={{
            position: 'absolute',
            bottom: 240,
            left: 80,
            right: 80,
          }}
        >
          {/* from=108 absolute frame = 18 frames after card start (card starts at 90) */}
          {/* Inside the Sequence, useCurrentFrame() is relative, so from = 18 */}
          <LiveCopy
            from={18}
            text="Every commission held to one standard."
            fontSize={88}
            fontFamily={BRAND.display}
            color={BRAND.text}
          />
          <div style={{ marginTop: 24 }}>
            {/* AmberHairline: from=38 (18+20) — after text finishes entering */}
            <AmberHairline from={38} width={320} />
          </div>
        </div>
      </Sequence>

      {/* ── CARD 3 — frames 210–329 — hairline wipe in ── */}
      <Sequence from={210} durationInFrames={120}>
        <HairlineWipe
          from={0}
          incomingChild={
            <PhotoScene
              src="media/rose-bowl-detail.png"
              startFrame={210}
              totalFrames={120}
              motion="down"
            />
          }
        />
        <TextGradientOverlay />
        <div
          style={{
            position: 'absolute',
            bottom: 240,
            left: 80,
            right: 80,
          }}
        >
          {/* from=24 → 24 frames after card start, 3-frame stagger between lines */}
          <LiveCopy
            from={24}
            text={['Uncompromising.', 'Considered.', 'Crafted.']}
            fontSize={88}
            fontFamily={BRAND.display}
            color={BRAND.text}
          />
        </div>
      </Sequence>

      {/* ── CARD 4 — frames 330–449 — hairline wipe in ── */}
      <Sequence from={330} durationInFrames={120}>
        <HairlineWipe
          from={0}
          incomingChild={
            <PhotoScene
              src="media/glenmore-stairwell.png"
              startFrame={330}
              totalFrames={120}
              motion="up"
            />
          }
        />
        <TextGradientOverlay />
        <div
          style={{
            position: 'absolute',
            bottom: 240,
            left: 80,
            right: 80,
          }}
        >
          {/* from=24 → 24 frames after card start */}
          <LiveCopy
            from={24}
            text="That has never changed."
            fontSize={88}
            fontFamily={BRAND.display}
            color={BRAND.text}
          />
        </div>
      </Sequence>

      {/* ── CARD 5 — frames 450–569 — hairline wipe in ── */}
      {/* Pivotal line — strongest restrained hierarchy, no hairline decoration */}
      <Sequence from={450} durationInFrames={120}>
        <HairlineWipe
          from={0}
          incomingChild={
            <PhotoScene
              src="media/rose-bowl-dusk.png"
              startFrame={450}
              totalFrames={120}
              motion="up"
            />
          }
        />
        <TextGradientOverlay />
        <div
          style={{
            position: 'absolute',
            bottom: 280,
            left: 80,
            right: 80,
          }}
        >
          {/* from=24 → 24 frames after card start */}
          <LiveCopy
            from={24}
            text="Now, it comes into view."
            fontSize={96}
            fontFamily={BRAND.display}
            color={BRAND.text}
          />
        </div>
      </Sequence>

      {/* ── CARD 6 — frames 570–689 — hairline wipe into dark ground ── */}
      <Sequence from={570} durationInFrames={120}>
        <HairlineWipe
          from={0}
          incomingChild={
            <AbsoluteFill style={{ backgroundColor: BRAND.bg }} />
          }
        />
        <BrandIdentityReveal iconFrom={18} logoFrom={30} />
      </Sequence>

      {/* ── CARD 7 — frames 690–809 ── */}
      {/* Continuous dark ground, logo stays, hairline + tagline */}
      <Sequence from={690} durationInFrames={120}>
        <AbsoluteFill style={{ backgroundColor: BRAND.bg }} />
        {/* Logo held in same position as Card 6 */}
        <BrandIdentityReveal iconFrom={-999} logoFrom={-999} />
        <Card7Tagline />
      </Sequence>

      {/* ── Audio placeholder ── */}
      {/* Narration: add <Audio src={staticFile('audio/landhar-narration.wav')} /> when file is supplied */}
    </AbsoluteFill>
  );
};

// ─── BrandIdentityReveal ─────────────────────────────────────────────────────
/**
 * Icon fades in first, wordmark follows ~12 frames later.
 * Both use opacity + small upward translateY.
 * from=-999 means always fully visible (used for Card 7 hold).
 */
interface BrandIdentityRevealProps {
  iconFrom: number;
  logoFrom: number;
}

const BrandIdentityReveal: React.FC<BrandIdentityRevealProps> = ({
  iconFrom,
  logoFrom,
}) => {
  const frame = useCurrentFrame();

  const iconOpacity =
    iconFrom < 0
      ? 1
      : interpolate(frame, [iconFrom, iconFrom + 20], [0, 1], {
          ...CLAMP,
          easing: EASE_TEXT,
        });
  const iconTY =
    iconFrom < 0
      ? 0
      : interpolate(frame, [iconFrom, iconFrom + 20], [12, 0], {
          ...CLAMP,
          easing: EASE_TEXT,
        });

  const logoOpacity =
    logoFrom < 0
      ? 1
      : interpolate(frame, [logoFrom, logoFrom + 20], [0, 1], {
          ...CLAMP,
          easing: EASE_TEXT,
        });
  const logoTY =
    logoFrom < 0
      ? 0
      : interpolate(frame, [logoFrom, logoFrom + 20], [10, 0], {
          ...CLAMP,
          easing: EASE_TEXT,
        });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 28,
      }}
    >
      {/* Official icon */}
      <div
        style={{
          opacity: iconOpacity,
          transform: `translateY(${iconTY}px)`,
        }}
      >
        <Img
          src={staticFile('brand/landhar-icon-white.png')}
          style={{
            width: 120,
            height: 'auto',
            display: 'block',
          }}
        />
      </div>

      {/* Official wordmark */}
      <div
        style={{
          opacity: logoOpacity,
          transform: `translateY(${logoTY}px)`,
        }}
      >
        <Img
          src={staticFile('brand/landhar-logo-white.png')}
          style={{
            width: 280,
            height: 'auto',
            display: 'block',
          }}
        />
      </div>
    </div>
  );
};

// ─── Card7Tagline ─────────────────────────────────────────────────────────────
/**
 * Amber hairline draws beneath the logo position, then tagline fades in.
 * Positioned below the brand identity block (roughly vertically centered + offset).
 */
const Card7Tagline: React.FC = () => {
  const frame = useCurrentFrame();

  const taglineOpacity = interpolate(frame, [30, 50], [0, 1], {
    ...CLAMP,
    easing: EASE_TEXT,
  });
  const taglineTY = interpolate(frame, [30, 50], [16, 0], {
    ...CLAMP,
    easing: EASE_TEXT,
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        // Push below the brand block (icon ~120px + gap 28 + logo ~56px + gap 28 ≈ 232px)
        paddingTop: 292,
      }}
    >
      {/* Amber hairline */}
      <div style={{ marginBottom: 32 }}>
        <AmberHairline from={20} width={200} />
      </div>

      {/* Tagline */}
      <div
        style={{
          opacity: taglineOpacity,
          transform: `translateY(${taglineTY}px)`,
          fontFamily: BRAND.display,
          fontSize: 44,
          fontWeight: 400,
          color: BRAND.text,
          lineHeight: 1.2,
          letterSpacing: '0.01em',
          textAlign: 'center',
          paddingLeft: 80,
          paddingRight: 80,
        }}
      >
        Custom homes, commissioned across Greater Sydney.
      </div>
    </div>
  );
};
