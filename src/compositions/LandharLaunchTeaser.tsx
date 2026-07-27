/**
 * LandharLaunchTeaser — Premium Architectural Gallery Film
 *
 * Format : Instagram Reel / vertical social
 * Size   : 1080 × 1920
 * FPS    : 30
 * Length : 810 frames / 27 seconds
 *
 * Ruflo swarm: video-researcher · motion-designer · component-builder
 *              timing-engineer · render-optimizer · caption-writer
 *
 * Design rules:
 *  - interpolate() + Easing.bezier() only — no spring(), no bounce
 *  - Amber #C47C3A as 1px hairline only — never a block or bar
 *  - Cards 1→2 are one continuous photographic move — no cut, no reset
 *  - Text rendered as live HTML — never baked into images
 *  - Official logo/icon used as-is from staticFile()
 *  - No "rebrand", "new", "launching", "change", "finally" anywhere
 */

import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { loadFont as loadCormorant } from '@remotion/google-fonts/CormorantGaramond';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { buildVideoSwarmConfig, logSwarmInit } from '../lib/ruflo';

// ── Ruflo ─────────────────────────────────────────────────────────────────────
const _swarm = buildVideoSwarmConfig(
  'LandharLaunchTeaser — premium architectural gallery film',
);
logSwarmInit(_swarm.agents, 'LandharLaunchTeaser');

// ── Google Fonts ──────────────────────────────────────────────────────────────
const { fontFamily: CORMORANT } = loadCormorant('normal', {
  weights: ['400', '500'],
  subsets: ['latin'],
});
const { fontFamily: INTER } = loadInter('normal', {
  weights: ['400'],
  subsets: ['latin'],
});

// ── Brand tokens ──────────────────────────────────────────────────────────────
const B = {
  bg:      '#111110',
  text:    '#ECE9E2',
  accent:  '#C47C3A',
  display: CORMORANT,
  body:    INTER,
} as const;

// ── Easing curves ─────────────────────────────────────────────────────────────
/** Slow, editorial image movement — unhurried */
const E_SLOW = Easing.bezier(0.45, 0, 0.55, 1);
/** Controlled text entrance — sharp deceleration */
const E_TEXT = Easing.bezier(0.16, 1, 0.30, 1);

const CLAMP = {
  extrapolateLeft:  'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

// ── Interpolate shorthand ─────────────────────────────────────────────────────
function itp(
  f:       number,
  inStart: number,
  inEnd:   number,
  outFrom: number,
  outTo:   number,
  ease:    (t: number) => number = E_SLOW,
): number {
  return interpolate(f, [inStart, inEnd], [outFrom, outTo], {
    ...CLAMP,
    easing: ease,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// AmberHairline
// 1px amber accent line that draws its width left→right.
// Used as a decorative underline after text settles (Cards 2, 7).
// ─────────────────────────────────────────────────────────────────────────────
interface AmberHairlineProps {
  /** Relative frame at which the line begins drawing */
  from:   number;
  /** Final drawn width in px */
  width?: number;
}

const AmberHairline: React.FC<AmberHairlineProps> = ({ from, width = 260 }) => {
  const f = useCurrentFrame();
  const w = itp(f, from, from + 24, 0, width);

  return (
    <div
      style={{
        width:           w,
        height:          1,
        backgroundColor: B.accent,
        display:         'block',
        overflow:        'hidden',
      }}
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// HairlineWipe
// Amber 1px line sweeps left→right over 14 frames.
// The incoming scene is revealed progressively BEHIND the line
// (to the left, like a curtain being drawn).
// ─────────────────────────────────────────────────────────────────────────────
interface HairlineWipeProps {
  children: React.ReactNode;
}

const WIPE_DURATION = 14;

const HairlineWipe: React.FC<HairlineWipeProps> = ({ children }) => {
  const f        = useCurrentFrame();
  const { width } = useVideoConfig();

  // Hairline x-position: 0 → full width over WIPE_DURATION frames
  const hx = itp(f, 0, WIPE_DURATION, 0, width);

  // Clip the incoming scene: reveal only what's to the LEFT of the hairline
  // inset(top right bottom left) — we clip from the right, shrinking as hx grows
  const clipRight = width - hx;

  return (
    <>
      {/* Incoming scene: revealed left of hairline */}
      <div
        style={{
          position: 'absolute',
          inset:    0,
          clipPath: `inset(0 ${clipRight}px 0 0)`,
        }}
      >
        {children}
      </div>

      {/* 1px amber leading edge — fades after wipe completes */}
      <div
        style={{
          position:        'absolute',
          top:             0,
          left:            hx - 0.5,
          width:           1,
          height:          '100%',
          backgroundColor: B.accent,
          opacity:         f <= WIPE_DURATION ? 1 : 0,
          pointerEvents:   'none',
        }}
      />
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PhotoScene
// Full-bleed image with Ken Burns motion.
//
// motion='scale'  — scale 1.035→1.065 + subtle upward drift
//                   Uses absoluteOffset so Cards 1+2 share one continuous arc
// motion='up'     — slow upward translation (chandelier, sky reveal)
// motion='down'   — slow downward drift (basin, stone details)
//
// absoluteOffset: add this to useCurrentFrame() before motion calculation.
// Allows Cards 1+2 to use the same motion math across two separate Sequences.
// ─────────────────────────────────────────────────────────────────────────────
type Motion = 'scale' | 'up' | 'down';

interface PhotoSceneProps {
  src:             string;
  motion:          Motion;
  absoluteOffset?: number;
  totalFrames?:    number;
}

const PhotoScene: React.FC<PhotoSceneProps> = ({
  src,
  motion,
  absoluteOffset = 0,
  totalFrames    = 120,
}) => {
  const frame = useCurrentFrame();
  // Absolute frame: allows multi-Sequence continuity
  const f = frame + absoluteOffset;

  let scale = 1;
  let ty    = 0;

  if (motion === 'scale') {
    // Ken Burns across the full span (Cards 1+2 = 210 frames)
    scale = itp(f, absoluteOffset, absoluteOffset + totalFrames, 1.035, 1.065);
    ty    = itp(f, absoluteOffset, absoluteOffset + totalFrames, 0, -16);
  } else if (motion === 'up') {
    ty = itp(f, 0, totalFrames, 0, -22);
  } else if (motion === 'down') {
    ty = itp(f, 0, totalFrames, 0, 14);
  }

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Img
        src={staticFile(src)}
        style={{
          width:           '100%',
          height:          '100%',
          objectFit:       'cover',
          objectPosition:  'center',
          display:         'block',
          // Cinematic treatment: slightly deepened shadows, improved contrast
          filter:          'brightness(0.88) contrast(1.05)',
          transform:       `scale(${scale}) translateY(${ty}px)`,
          transformOrigin: 'center center',
        }}
      />
      {/* Subtle radial vignette — darkens corners without harshness */}
      <div
        style={{
          position:      'absolute',
          inset:         0,
          background:    'radial-gradient(ellipse 90% 75% at 50% 40%, transparent 45%, rgba(6,5,4,0.38) 100%)',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TextGradient
// Legibility gradient behind lower-third editorial copy.
// Multi-stop for a natural, non-obvious fade.
// ─────────────────────────────────────────────────────────────────────────────
const TextGradient: React.FC<{ height?: number }> = ({ height = 680 }) => (
  <div
    style={{
      position:      'absolute',
      bottom:        0,
      left:          0,
      right:         0,
      height,
      background:    [
        'linear-gradient(to top,',
        '  rgba(8, 7, 6, 0.88) 0%,',
        '  rgba(8, 7, 6, 0.70) 22%,',
        '  rgba(8, 7, 6, 0.44) 45%,',
        '  rgba(8, 7, 6, 0.16) 70%,',
        '  transparent 100%',
        ')',
      ].join('\n'),
      pointerEvents: 'none',
    }}
  />
);

// ─────────────────────────────────────────────────────────────────────────────
// LiveCopy
// Editorial text entrance: opacity fade + vertical lift only.
// No typewriter. No per-letter. No word animation.
// string[] enables subtle multi-line stagger (3–4 frames between lines).
// ─────────────────────────────────────────────────────────────────────────────
interface LiveCopyProps {
  from:           number;
  text:           string | string[];
  fontSize?:      number;
  fontFamily?:    string;
  fontWeight?:    number;
  color?:         string;
  lineHeight?:    number;
  letterSpacing?: string;
  textAlign?:     React.CSSProperties['textAlign'];
  stagger?:       number;
}

const LiveCopy: React.FC<LiveCopyProps> = ({
  from,
  text,
  fontSize      = 88,
  fontFamily    = B.display,
  fontWeight    = 400,
  color         = B.text,
  lineHeight    = 1.16,
  letterSpacing = '0.005em',
  textAlign     = 'left',
  stagger       = 4,
}) => {
  const f     = useCurrentFrame();
  const lines = Array.isArray(text) ? text : [text];

  return (
    <div style={{ textAlign }}>
      {lines.map((line, i) => {
        const lf = from + i * stagger;
        const opacity = itp(f, lf, lf + 22, 0, 1, E_TEXT);
        const ty      = itp(f, lf, lf + 22, 20, 0, E_TEXT);

        return (
          <div
            key={i}
            style={{
              opacity,
              transform:               `translateY(${ty}px)`,
              fontFamily,
              fontSize,
              fontWeight,
              color,
              lineHeight,
              letterSpacing,
              display:                 'block',
              WebkitFontSmoothing:     'antialiased',
              MozOsxFontSmoothing:     'grayscale',
            }}
          >
            {line}
          </div>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// BrandIdentityReveal
// Cards 6 + 7: official icon → wordmark, both on #111110.
// iconFrom / logoFrom < 0 → already fully visible (hold state for Card 7).
// ─────────────────────────────────────────────────────────────────────────────
interface BrandIdentityRevealProps {
  iconFrom:       number;
  logoFrom:       number;
  showHairline?:  boolean;
  hairlineFrom?:  number;
  showTagline?:   boolean;
  taglineFrom?:   number;
}

const BrandIdentityReveal: React.FC<BrandIdentityRevealProps> = ({
  iconFrom,
  logoFrom,
  showHairline = false,
  hairlineFrom = 0,
  showTagline  = false,
  taglineFrom  = 0,
}) => {
  const f = useCurrentFrame();

  const iconOpacity = iconFrom < 0 ? 1 : itp(f, iconFrom, iconFrom + 20, 0, 1, E_TEXT);
  const iconTY      = iconFrom < 0 ? 0 : itp(f, iconFrom, iconFrom + 20, 16, 0, E_TEXT);

  const logoOpacity = logoFrom < 0 ? 1 : itp(f, logoFrom, logoFrom + 22, 0, 1, E_TEXT);
  const logoTY      = logoFrom < 0 ? 0 : itp(f, logoFrom, logoFrom + 22, 12, 0, E_TEXT);

  const tagOpacity = showTagline ? itp(f, taglineFrom, taglineFrom + 22, 0, 1, E_TEXT) : 0;
  const tagTY      = showTagline ? itp(f, taglineFrom, taglineFrom + 22, 16, 0, E_TEXT) : 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: B.bg,
        display:         'flex',
        flexDirection:   'column',
        alignItems:      'center',
        justifyContent:  'center',
      }}
    >
      {/* Official icon — appears first */}
      <div
        style={{
          opacity:   iconOpacity,
          transform: `translateY(${iconTY}px)`,
        }}
      >
        <Img
          src={staticFile('brand/landhar-icon-white.png')}
          style={{ width: 88, height: 'auto', display: 'block' }}
        />
      </div>

      {/* Spacer between icon and wordmark */}
      <div style={{ height: 22 }} />

      {/* Official wordmark — follows icon */}
      <div
        style={{
          opacity:   logoOpacity,
          transform: `translateY(${logoTY}px)`,
        }}
      >
        <Img
          src={staticFile('brand/landhar-logo-white.png')}
          style={{ width: 288, height: 'auto', display: 'block' }}
        />
      </div>

      {/* 1px amber hairline — Card 7 only */}
      {showHairline && (
        <div style={{ marginTop: 30 }}>
          <AmberHairline from={hairlineFrom} width={192} />
        </div>
      )}

      {/* Tagline — Card 7 only */}
      {showTagline && (
        <div
          style={{
            marginTop:           22,
            opacity:             tagOpacity,
            transform:           `translateY(${tagTY}px)`,
            fontFamily:          B.display,
            fontSize:            38,
            fontWeight:          400,
            color:               B.text,
            lineHeight:          1.32,
            letterSpacing:       '0.01em',
            textAlign:           'center',
            paddingLeft:         80,
            paddingRight:        80,
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          }}
        >
          Custom homes, commissioned<br />across Greater Sydney.
        </div>
      )}
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// LandharLaunchTeaser — main composition
// Total: 810 frames / 27 seconds
// ─────────────────────────────────────────────────────────────────────────────
export const LandharLaunchTeaser: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: B.bg, overflow: 'hidden' }}>

      {/*
       * ── CARDS 1 + 2 — Turramurra interior — frames 0–209 ──────────────────
       *
       * ONE continuous photographic move across both cards.
       * absoluteOffset=0, totalFrames=210 → motion spans 0→209.
       * Card 1: image only (0–89).
       * Card 2: text + hairline overlay (90–209).
       * NO transition between Card 1 and Card 2.
       */}

      {/* Photo: renders for full 210 frames, continuous */}
      <Sequence from={0} durationInFrames={210}>
        <PhotoScene
          src="media/turramurra-living.png"
          motion="scale"
          absoluteOffset={0}
          totalFrames={210}
        />
      </Sequence>

      {/* Card 2 text overlay: enters 18 frames after its start (absolute frame 108) */}
      <Sequence from={90} durationInFrames={120}>
        <AbsoluteFill>
          <TextGradient />
          <div
            style={{
              position: 'absolute',
              bottom:   200,
              left:     80,
              right:    80,
            }}
          >
            <LiveCopy
              from={18}
              text="Every commission held to one standard."
              fontSize={84}
            />
            <div style={{ marginTop: 24 }}>
              {/* Hairline draws after text finishes entering: 18 + 22 = 40 */}
              <AmberHairline from={42} width={272} />
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/*
       * ── CARD 3 — Rose Bowl bathroom detail — frames 210–329 ───────────────
       * Slow downward drift following basin, stone, black fittings.
       * Three-line stagger: 4 frames per line.
       */}
      <Sequence from={210} durationInFrames={120}>
        <AbsoluteFill>
          <HairlineWipe>
            <PhotoScene
              src="media/rose-bowl-detail.png"
              motion="down"
              totalFrames={120}
            />
          </HairlineWipe>
          <TextGradient />
          <div style={{ position: 'absolute', bottom: 200, left: 80, right: 80 }}>
            <LiveCopy
              from={22}
              text={['Uncompromising.', 'Considered.', 'Crafted.']}
              fontSize={84}
              stagger={4}
            />
          </div>
        </AbsoluteFill>
      </Sequence>

      {/*
       * ── CARD 4 — Glenmore Park double-height chandelier — frames 330–449 ──
       * Slow upward move letting the chandelier command the upper frame.
       */}
      <Sequence from={330} durationInFrames={120}>
        <AbsoluteFill>
          <HairlineWipe>
            <PhotoScene
              src="media/glenmore-stairwell.png"
              motion="up"
              totalFrames={120}
            />
          </HairlineWipe>
          <TextGradient />
          <div style={{ position: 'absolute', bottom: 200, left: 80, right: 80 }}>
            <LiveCopy
              from={22}
              text="That has never changed."
              fontSize={84}
            />
          </div>
        </AbsoluteFill>
      </Sequence>

      {/*
       * ── CARD 5 — Rose Bowl dusk exterior — frames 450–569 ─────────────────
       * THE PIVOTAL LINE. Slow upward push revealing sky.
       * Larger type (96px). Maximum negative space. No amber decoration.
       * This is the emotional turn — cleanest composition in the film.
       */}
      <Sequence from={450} durationInFrames={120}>
        <AbsoluteFill>
          <HairlineWipe>
            <PhotoScene
              src="media/rose-bowl-dusk.png"
              motion="up"
              totalFrames={120}
            />
          </HairlineWipe>
          <TextGradient height={760} />
          <div style={{ position: 'absolute', bottom: 240, left: 80, right: 80 }}>
            <LiveCopy
              from={22}
              text="Now, it comes into view."
              fontSize={96}
              lineHeight={1.10}
            />
          </div>
        </AbsoluteFill>
      </Sequence>

      {/*
       * ── CARD 6 — Identity reveal — frames 570–689 ─────────────────────────
       * Pure #111110. Hairline wipe in from Card 5.
       * Official icon enters first (~18f), wordmark follows (~30f).
       * No glow. No shadow. No reconstruction. Exact geometry preserved.
       */}
      <Sequence from={570} durationInFrames={120}>
        <HairlineWipe>
          <BrandIdentityReveal
            iconFrom={18}
            logoFrom={30}
          />
        </HairlineWipe>
      </Sequence>

      {/*
       * ── CARD 7 — Final hold — frames 690–809 ──────────────────────────────
       * Continuous dark ground. Logo held in exact same optical position.
       * Amber hairline draws beneath logo at ~12f.
       * Tagline fades at ~28f.
       * Ends on a clean static hold — no fade out.
       */}
      <Sequence from={690} durationInFrames={120}>
        <BrandIdentityReveal
          iconFrom={-1}
          logoFrom={-1}
          showHairline
          hairlineFrom={12}
          showTagline
          taglineFrom={28}
        />
      </Sequence>

      {/*
       * ── Audio ──────────────────────────────────────────────────────────────
       * Narration: calm, assured, Australian English.
       * Add <Audio> when public/audio/landhar-narration.wav is supplied.
       * Leave 8–12 frames of silence before the first spoken word.
       *
       * import { Audio } from 'remotion';
       * <Audio src={staticFile('audio/landhar-narration.wav')} startFrom={10} />
       *
       * Music: placeholder for a calm cinematic track (add later).
       */}

    </AbsoluteFill>
  );
};
