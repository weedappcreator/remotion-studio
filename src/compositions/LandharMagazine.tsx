/**
 * LandharMagazine — Light Luxury Editorial Film
 *
 * Format : Instagram Reel / vertical social
 * Size   : 1080 × 1920
 * FPS    : 30
 * Length : 810 frames / 27 seconds
 *
 * Ruflo swarm: composition-analyst · animation-builder · voiceover-sync · timing-reviewer
 *
 * Design rules:
 *  - Architectural Digest print aesthetic — white/cream ground, charcoal type
 *  - interpolate() + Easing.bezier() only — no spring(), no bounce
 *  - Amber #C47C3A used SPARINGLY — only as 1px rule on Cards 2 and 7
 *  - No hairline wipe — slow opacity crossfades between photo cards
 *  - Cards 1→2 share one continuous photographic move — no cut, no reset
 *  - Text rendered as live HTML — never baked into images
 *  - Official logo/icon used as-is from staticFile(), tinted to charcoal via CSS filter
 */

import React from 'react';
import {
  AbsoluteFill,
  Audio,
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
import { BlurReveal } from '../components/BlurReveal';

// ── Ruflo ─────────────────────────────────────────────────────────────────────
const _swarm = buildVideoSwarmConfig('LandharMagazine — light luxury editorial');
logSwarmInit(_swarm.agents, 'LandharMagazine');

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
  bg:      '#F8F5F0', // warm cream/ivory
  surface: '#EFEBE4', // slightly deeper cream
  text:    '#1A1A18', // near-black charcoal
  muted:   '#8A8580', // warm grey
  accent:  '#C47C3A', // amber — used SPARINGLY
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
// CrossFade
// Wraps incoming scene with a slow opacity fade-in over 20 frames.
// Replaces the HairlineWipe used in LandharLaunchTeaser.
// ─────────────────────────────────────────────────────────────────────────────
const CrossFade: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  const opacity = itp(f, 0, 20, 0, 1, E_SLOW);
  return (
    <div style={{ position: 'absolute', inset: 0, opacity }}>
      {children}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AmberHairline
// 1px amber accent line that draws its width left→right.
// Used sparingly — only Cards 2 and 7.
// ─────────────────────────────────────────────────────────────────────────────
interface AmberHairlineProps {
  from:   number;
  width?: number;
}

const AmberHairline: React.FC<AmberHairlineProps> = ({ from, width = 240 }) => {
  const f = useCurrentFrame();
  const w = itp(f, from, from + 24, 0, width);
  return (
    <div
      style={{
        width,
        height:          1,
        overflow:        'hidden',
        position:        'relative',
      }}
    >
      <div
        style={{
          position:        'absolute',
          top:             0,
          left:            0,
          width:           w,
          height:          1,
          backgroundColor: B.accent,
        }}
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// LightGradient
// Subtle cream gradient at bottom of photo cards for text legibility.
// Airy — much lighter than the dark TextGradient in LandharLaunchTeaser.
// ─────────────────────────────────────────────────────────────────────────────
const LightGradient: React.FC = () => (
  <div
    style={{
      position:      'absolute',
      bottom:        0,
      left:          0,
      right:         0,
      height:        400,
      background:    'linear-gradient(to top, rgba(248,245,240,0.80) 0%, transparent 100%)',
      pointerEvents: 'none',
    }}
  />
);

// ─────────────────────────────────────────────────────────────────────────────
// PhotoScene
// Full-bleed image with light editorial treatment + Ken Burns motion.
// Brighter, airier, slightly desaturated — Architectural Digest quality.
//
// motion='scale'  — scale 1.02→1.04 (gentler than dark version)
// motion='up'     — slow upward translation
// motion='down'   — slow downward drift
//
// absoluteOffset: allows Cards 1+2 to share one continuous motion arc.
// ─────────────────────────────────────────────────────────────────────────────
type Motion = 'scale' | 'up' | 'down';

interface PhotoSceneProps {
  src:             string;
  motion:          Motion;
  absoluteOffset?: number;
  totalFrames?:    number;
  objectPosition?: string;
}

const PhotoScene: React.FC<PhotoSceneProps> = ({
  src,
  motion,
  absoluteOffset  = 0,
  totalFrames     = 120,
  objectPosition  = 'center',
}) => {
  const frame = useCurrentFrame();
  const f     = frame + absoluteOffset;

  let scale = 1;
  let ty    = 0;

  if (motion === 'scale') {
    // Ken Burns: very slow scale across the full span (Cards 1+2 = 210 frames)
    scale = itp(f, absoluteOffset, absoluteOffset + totalFrames, 1.02, 1.04);
    ty    = itp(f, absoluteOffset, absoluteOffset + totalFrames, 0, -10);
  } else if (motion === 'up') {
    ty = itp(f, 0, totalFrames, 0, -18);
  } else if (motion === 'down') {
    ty = itp(f, 0, totalFrames, 0, 12);
  }

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Img
        src={staticFile(src)}
        style={{
          width:           '100%',
          height:          '100%',
          objectFit:       'cover',
          objectPosition,
          display:         'block',
          // Light editorial treatment: bright, airy, slightly desaturated
          filter:          'brightness(1.08) contrast(0.92) saturate(0.85)',
          transform:       `scale(${scale}) translateY(${ty}px)`,
          transformOrigin: 'center center',
        }}
      />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// LiveCopy
// Editorial text entrance: opacity fade + vertical lift only.
// No typewriter. No per-letter. No word animation.
// string[] enables subtle multi-line stagger (4 frames between lines).
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
  fontSize      = 80,
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
        const lf      = from + i * stagger;
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
// MagazineBrandReveal
// Cards 6 + 7: official icon + wordmark on cream ground.
// Icon and wordmark tinted to charcoal via CSS filter.
// iconFrom / logoFrom < 0 → already fully visible (hold state for Card 7).
// ─────────────────────────────────────────────────────────────────────────────
interface MagazineBrandRevealProps {
  iconFrom:      number;
  logoFrom:      number;
  showHairline?: boolean;
  hairlineFrom?: number;
  showTagline?:  boolean;
  taglineFrom?:  number;
}

const MagazineBrandReveal: React.FC<MagazineBrandRevealProps> = ({
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

  // CSS filter to convert white/light icon to charcoal on cream ground
  // invert(0.9) brings near-white to near-black, sepia + brightness fine-tune to warm charcoal
  const charcoalFilter = 'invert(0.9) sepia(0.05) brightness(0.15)';

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
      {/* Official icon — charcoal tint */}
      <BlurReveal from={iconFrom < 0 ? -999 : iconFrom} direction="up">
        <div
          style={{
            opacity:   iconOpacity,
            transform: `translateY(${iconTY}px)`,
          }}
        >
          <Img
            src={staticFile('brand/landhar-icon-white.png')}
            style={{
              width:   88,
              height:  'auto',
              display: 'block',
              filter:  charcoalFilter,
            }}
          />
        </div>
      </BlurReveal>

      {/* Spacer */}
      <div style={{ height: 22 }} />

      {/* Official wordmark — charcoal tint */}
      <BlurReveal from={logoFrom < 0 ? -999 : logoFrom} direction="up">
        <div
          style={{
            opacity:   logoOpacity,
            transform: `translateY(${logoTY}px)`,
          }}
        >
          <Img
            src={staticFile('brand/landhar-logo-white.png')}
            style={{
              width:   288,
              height:  'auto',
              display: 'block',
              filter:  charcoalFilter,
            }}
          />
        </div>
      </BlurReveal>

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
// LandharMagazine — main composition
// Total: 810 frames / 27 seconds
// Style: Architectural Digest print — light, airy, cream ground, charcoal type
// ─────────────────────────────────────────────────────────────────────────────
export const LandharMagazine: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: B.bg, overflow: 'hidden' }}>

      {/*
       * ── CARDS 1 + 2 — Turramurra interior — frames 0–209 ──────────────────
       *
       * ONE continuous photographic move across both cards.
       * absoluteOffset=0, totalFrames=210 → motion spans 0→209.
       * Card 1: image only (0–89) — full bleed, no text, no overlay.
       * Card 2: text + amber rule overlay (90–209).
       * NO crossfade between Card 1 and Card 2 — continuous image.
       */}

      {/* Photo: renders for full 210 frames, continuous Ken Burns */}
      <Sequence from={0} durationInFrames={210}>
        <PhotoScene
          src="media/turramurra-living.png"
          motion="scale"
          absoluteOffset={0}
          totalFrames={210}
          objectPosition="center 60%"
        />
      </Sequence>

      {/* Card 2 text overlay: editorial lower-left text + amber rule */}
      <Sequence from={90} durationInFrames={120}>
        <AbsoluteFill>
          {/* Subtle cream gradient at bottom for legibility on light photo */}
          <LightGradient />
          <div
            style={{
              position: 'absolute',
              bottom:   180,
              left:     72,
              right:    72,
            }}
          >
            <LiveCopy
              from={18}
              text="Every commission held to one standard."
              fontSize={80}
              color={B.text}
            />
            {/* Amber rule draws after text finishes entering: 18 + 22 = 40 */}
            <div style={{ marginTop: 20 }}>
              <AmberHairline from={42} width={240} />
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/*
       * ── CARD 3 — Rose Bowl bathroom detail — frames 210–329 ───────────────
       * CrossFade in. Slow downward drift.
       * Three-line stagger: 4 frames per line.
       */}
      <Sequence from={210} durationInFrames={120}>
        <CrossFade>
          <AbsoluteFill>
            <PhotoScene
              src="media/rose-bowl-detail.png"
              motion="down"
              totalFrames={120}
              objectPosition="center 45%"
            />
            <LightGradient />
            <div style={{ position: 'absolute', bottom: 180, left: 72, right: 72 }}>
              <LiveCopy
                from={22}
                text={['Uncompromising.', 'Considered.', 'Crafted.']}
                fontSize={80}
                stagger={4}
                color={B.text}
              />
            </div>
          </AbsoluteFill>
        </CrossFade>
      </Sequence>

      {/*
       * ── CARD 4 — Glenmore Park double-height stairwell — frames 330–449 ──
       * CrossFade in. Slow upward move.
       */}
      <Sequence from={330} durationInFrames={120}>
        <CrossFade>
          <AbsoluteFill>
            <PhotoScene
              src="media/glenmore-stairwell.png"
              motion="up"
              totalFrames={120}
              objectPosition="center 35%"
            />
            <LightGradient />
            <div style={{ position: 'absolute', bottom: 180, left: 72, right: 72 }}>
              <LiveCopy
                from={22}
                text="That has never changed."
                fontSize={80}
                color={B.text}
              />
            </div>
          </AbsoluteFill>
        </CrossFade>
      </Sequence>

      {/*
       * ── CARD 5 — Rose Bowl dusk exterior — frames 450–569 ─────────────────
       * THE PIVOTAL CARD — maximum negative space. Larger type.
       * CrossFade in. Slow upward push revealing sky.
       * No amber decoration. Cleanest composition in the film.
       */}
      <Sequence from={450} durationInFrames={120}>
        <CrossFade>
          <AbsoluteFill>
            <PhotoScene
              src="media/rose-bowl-dusk.png"
              motion="up"
              totalFrames={120}
              objectPosition="center 70%"
            />
            <LightGradient />
            <div style={{ position: 'absolute', bottom: 220, left: 72, right: 72 }}>
              <LiveCopy
                from={22}
                text="Now, it comes into view."
                fontSize={88}
                lineHeight={1.10}
                color={B.text}
              />
            </div>
          </AbsoluteFill>
        </CrossFade>
      </Sequence>

      {/*
       * ── CARD 6 — Identity reveal — frames 570–689 ─────────────────────────
       * Pure cream ground (#F8F5F0). CrossFade in from Card 5 photo.
       * Official icon enters first (BlurReveal ~18f), wordmark follows (~30f).
       * Both tinted to charcoal via CSS filter.
       * No noise, no gradient — pure editorial white space.
       */}
      <Sequence from={570} durationInFrames={120}>
        <CrossFade>
          <MagazineBrandReveal
            iconFrom={18}
            logoFrom={30}
          />
        </CrossFade>
      </Sequence>

      {/*
       * ── CARD 7 — Final hold — frames 690–809 ──────────────────────────────
       * Continuous cream ground. Logo held in exact same optical position.
       * 1px amber hairline draws beneath logo at ~12f.
       * Tagline fades in at ~28f.
       * Ends on a clean static hold — no fade out.
       */}
      <Sequence from={690} durationInFrames={120}>
        <MagazineBrandReveal
          iconFrom={-1}
          logoFrom={-1}
          showHairline
          hairlineFrom={12}
          showTagline
          taglineFrom={28}
        />
      </Sequence>

      {/* ElevenLabs narration — Charlie voice, warm Australian */}
      <Audio src={staticFile('audio/landhar-magazine.mp3')} startFrom={10} />

    </AbsoluteFill>
  );
};
