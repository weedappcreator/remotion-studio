/**
 * LandharPremiumV2 — Architectural Editorial Film, Apple-Level Precision
 *
 * Format : 1080 × 1920 (vertical / Reels)
 * FPS    : 30
 * Length : 750 frames / 25 seconds
 *
 * Ruflo swarm: composition-analyst · animation-builder · voiceover-sync · timing-reviewer
 *
 * Design rules (v2 brief):
 *  - Dark ground: #111110 throughout
 *  - Text: #ECE9E2 — NO shadow, NO glow, NO italic, NO uppercase
 *  - Accent #C47C3A appears ONLY as the 1px line on Card 7
 *  - Cormorant Garamond 500 for display, Inter 400 for body
 *  - Text reveals: translateY 8px → 0px only. No per-letter/per-word animation.
 *  - Photo motion: max 2–3% scale, max 18px translation. E_IMG only.
 *  - Cards 1+2 share ONE continuous motion arc (absoluteFrame 0–209)
 *  - Transitions: opacity dissolve only. No wipes, no zooms, no amber hairlines.
 *  - Logo: landhar-logo-white.png as ONE complete asset, never split
 *  - interpolate() + Easing.bezier() only — ZERO spring() calls
 *  - FORBIDDEN: KineticText, BlurReveal, HairlineWipe, WarmTint, GradientBg, NoiseBg, ParticlesBg
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

// ── Ruflo swarm init ──────────────────────────────────────────────────────────
const _swarm = buildVideoSwarmConfig(
  'LandharPremiumV2 — architectural editorial film, Apple-level precision',
);
logSwarmInit(_swarm.agents, 'LandharPremiumV2');

// ── Google Fonts ──────────────────────────────────────────────────────────────
const { fontFamily: CORMORANT } = loadCormorant('normal', {
  weights: ['500'],
  subsets: ['latin'],
});
const { fontFamily: INTER } = loadInter('normal', {
  weights: ['400'],
  subsets: ['latin'],
});

// ── Brand tokens ──────────────────────────────────────────────────────────────
const BG      = '#111110';
const TEXT    = '#ECE9E2';
const ACCENT  = '#C47C3A'; // amber — ONLY Card 7 hairline

// ── Easing curves (v2 spec) ───────────────────────────────────────────────────
/** All photo motion */
const E_IMG  = Easing.bezier(0.45, 0, 0.55, 1);
/** All text reveals — NOT 0.16,1,0.30,1 */
const E_TEXT = Easing.bezier(0.22, 1, 0.36, 1);

const CLAMP = {
  extrapolateLeft:  'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

// ── Image filter ──────────────────────────────────────────────────────────────
const IMG_FILTER = 'brightness(0.92) contrast(1.04)';

// ── Legibility gradient (photo cards with text only) ─────────────────────────
const LegibilityGradient: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 520,
      background:
        'linear-gradient(to top, rgba(17,17,16,0.52) 0%, rgba(17,17,16,0.16) 42%, rgba(17,17,16,0) 68%)',
      pointerEvents: 'none',
    }}
  />
);

// ── Card 1: frames 0–89 — Photo only, no text ────────────────────────────────
const Card1: React.FC = () => {
  const f = useCurrentFrame();
  // Cards 1+2 share ONE continuous motion arc — absoluteFrame 0–209
  // Card 1 spans absoluteFrame 0–89 (partial of the arc)
  const scale = interpolate(f, [0, 209], [1.02, 1.05], { ...CLAMP, easing: E_IMG });
  const ty    = interpolate(f, [0, 209], [0, -16],     { ...CLAMP, easing: E_IMG });

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden' }}>
      <Img
        src={staticFile('media/turramurra-living.png')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale}) translateY(${ty}px)`,
          filter: IMG_FILTER,
        }}
      />
    </AbsoluteFill>
  );
};

// ── Card 2: frames 90–209 — Continuous image + text ──────────────────────────
const Card2: React.FC = () => {
  // f is relative (0–119), but motion uses absoluteFrame = f + 90
  const f = useCurrentFrame();
  const absF = f + 90; // absoluteFrame for the shared 0–209 arc

  const scale = interpolate(absF, [0, 209], [1.02, 1.05], { ...CLAMP, easing: E_IMG });
  const ty    = interpolate(absF, [0, 209], [0, -16],     { ...CLAMP, easing: E_IMG });

  // Text enters at relative frame 20
  const textEnterF = f - 20;
  const opacity = interpolate(textEnterF, [0, 20], [0, 1], { ...CLAMP, easing: E_TEXT });
  const textTy  = interpolate(textEnterF, [0, 20], [8, 0], { ...CLAMP, easing: E_TEXT });

  // Text exit at relative frame 100 — 8-frame fade, no movement
  const exitOpacity = interpolate(f, [100, 108], [1, 0], CLAMP);
  const finalOpacity = f >= 100 ? exitOpacity : opacity;

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden' }}>
      <Img
        src={staticFile('media/turramurra-living.png')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale}) translateY(${ty}px)`,
          filter: IMG_FILTER,
        }}
      />
      <LegibilityGradient />
      {/* Text block */}
      <div
        style={{
          position: 'absolute',
          left: 90,
          bottom: 180,
          maxWidth: 760,
          opacity: finalOpacity,
          transform: `translateY(${f >= 100 ? 0 : textTy}px)`,
        }}
      >
        <div
          style={{
            fontFamily: CORMORANT,
            fontWeight: 500,
            fontSize: 112,
            lineHeight: 0.94,
            letterSpacing: '-1.5px',
            color: TEXT,
            margin: 0,
            padding: 0,
          }}
        >
          Every commission.
          <br />
          One standard.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Card 3: frames 210–329 — Rose Bowl detail ─────────────────────────────────
const Card3: React.FC = () => {
  const f = useCurrentFrame();

  // Slow downward drift, max 14px, scale 1.0→1.01
  const scale = interpolate(f, [0, 120], [1.0, 1.01],  { ...CLAMP, easing: E_IMG });
  const ty    = interpolate(f, [0, 120], [0, 14],      { ...CLAMP, easing: E_IMG });

  // Text: ONE BLOCK, zero stagger — enters at relative frame 22
  const textEnterF = f - 22;
  const opacity = interpolate(textEnterF, [0, 20], [0, 1], { ...CLAMP, easing: E_TEXT });
  const textTy  = interpolate(textEnterF, [0, 20], [8, 0], { ...CLAMP, easing: E_TEXT });

  // Text exit at relative frame 100 — 8-frame fade
  const exitOpacity = interpolate(f, [100, 108], [1, 0], CLAMP);
  const finalOpacity = f >= 100 ? exitOpacity : opacity;

  // 8-frame dissolve IN from Card 2 (frames 0–8 of Card 3)
  const dissolveIn = interpolate(f, [0, 8], [0, 1], CLAMP);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden', opacity: dissolveIn }}>
      <Img
        src={staticFile('media/rose-bowl-detail.png')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale}) translateY(${ty}px)`,
          filter: IMG_FILTER,
        }}
      />
      <LegibilityGradient />
      {/* Text block — ONE BLOCK, no per-line stagger */}
      <div
        style={{
          position: 'absolute',
          left: 90,
          bottom: 180,
          maxWidth: 760,
          opacity: finalOpacity,
          transform: `translateY(${f >= 100 ? 0 : textTy}px)`,
        }}
      >
        <div
          style={{
            fontFamily: CORMORANT,
            fontWeight: 500,
            fontSize: 106,
            lineHeight: 0.94,
            letterSpacing: '-1.5px',
            color: TEXT,
            margin: 0,
            padding: 0,
          }}
        >
          Uncompromising.
          <br />
          Considered.
          <br />
          Crafted.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Card 2 → Card 3 dissolve: outgoing layer ──────────────────────────────────
// Rendered as an overlay in the Card 3 Sequence window
const Card2Outgoing: React.FC = () => {
  const f = useCurrentFrame();
  const absF = f + 90 + 120; // absoluteFrame offset for shared arc (not used here, just for image match)
  // dissolve OUT: opacity 1→0 over frames 0–8
  const outOpacity = interpolate(f, [0, 8], [1, 0], CLAMP);

  // Mirror Card2's motion at its last frame (~frame 119 relative = absolute 209)
  const frozenAbs = 209;
  const scale = interpolate(frozenAbs, [0, 209], [1.02, 1.05], { ...CLAMP, easing: E_IMG });
  const ty    = interpolate(frozenAbs, [0, 209], [0, -16],     { ...CLAMP, easing: E_IMG });

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden', opacity: outOpacity }}>
      <Img
        src={staticFile('media/turramurra-living.png')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale}) translateY(${ty}px)`,
          filter: IMG_FILTER,
        }}
      />
    </AbsoluteFill>
  );
};

// ── Card 4: frames 330–449 — Glenmore stairwell, NO TEXT ─────────────────────
const Card4: React.FC = () => {
  const f = useCurrentFrame();

  // Slow upward movement, max 16px, scale 1.0→1.02
  const scale = interpolate(f, [0, 120], [1.0, 1.02],  { ...CLAMP, easing: E_IMG });
  const ty    = interpolate(f, [0, 120], [0, -16],     { ...CLAMP, easing: E_IMG });

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden' }}>
      <Img
        src={staticFile('media/glenmore-stairwell.png')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale}) translateY(${ty}px)`,
          filter: IMG_FILTER,
        }}
      />
      {/* NO gradient, NO text */}
    </AbsoluteFill>
  );
};

// ── Card 5: frames 450–569 — Rose Bowl dusk, pivotal ─────────────────────────
const Card5: React.FC = () => {
  const f = useCurrentFrame();

  // Nearly static — scale only, no translation
  const scale = interpolate(f, [0, 120], [1.0, 1.02], { ...CLAMP, easing: E_IMG });

  // 10-frame dissolve IN from Card 4 (frames 0–10)
  const dissolveIn = interpolate(f, [0, 10], [0, 1], CLAMP);

  // Text enters at relative frame 24
  const textEnterF = f - 24;
  const opacity = interpolate(textEnterF, [0, 20], [0, 1], { ...CLAMP, easing: E_TEXT });
  const textTy  = interpolate(textEnterF, [0, 20], [8, 0], { ...CLAMP, easing: E_TEXT });

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden', opacity: dissolveIn }}>
      <Img
        src={staticFile('media/rose-bowl-dusk.png')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale})`,
          filter: IMG_FILTER,
        }}
      />
      <LegibilityGradient />
      <div
        style={{
          position: 'absolute',
          left: 90,
          bottom: 200,
          maxWidth: 760,
          opacity: opacity,
          transform: `translateY(${textTy}px)`,
        }}
      >
        <div
          style={{
            fontFamily: CORMORANT,
            fontWeight: 500,
            fontSize: 108,
            lineHeight: 0.96,
            letterSpacing: '-1.5px',
            color: TEXT,
            margin: 0,
            padding: 0,
          }}
        >
          Now, it comes into view.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Card 4 outgoing for dissolve ──────────────────────────────────────────────
const Card4Outgoing: React.FC = () => {
  const f = useCurrentFrame();
  const outOpacity = interpolate(f, [0, 10], [1, 0], CLAMP);
  // Frozen at Card4's last frame motion
  const frozenScale = interpolate(119, [0, 120], [1.0, 1.02], { ...CLAMP, easing: E_IMG });
  const frozenTy    = interpolate(119, [0, 120], [0, -16],    { ...CLAMP, easing: E_IMG });

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden', opacity: outOpacity }}>
      <Img
        src={staticFile('media/glenmore-stairwell.png')}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${frozenScale}) translateY(${frozenTy}px)`,
          filter: IMG_FILTER,
        }}
      />
    </AbsoluteFill>
  );
};

// ── Card 6: frames 570–659 — Logo reveal on #111110 ──────────────────────────
const Card6: React.FC = () => {
  const f = useCurrentFrame();

  // Logo fades in at relative frame 18, over 20 frames
  const logoF = f - 18;
  const logoOpacity = interpolate(logoF, [0, 20], [0, 1], { ...CLAMP, easing: E_TEXT });
  const logoScale   = interpolate(logoF, [0, 20], [0.995, 1], { ...CLAMP, easing: E_TEXT });

  // After frame 38: complete stillness (logo is fully settled)
  const finalOpacity = f < 18 ? 0 : logoOpacity;
  const finalScale   = f < 18 ? 0.995 : logoScale;

  return (
    <AbsoluteFill style={{ backgroundColor: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Logo positioned slightly above center */}
      <div
        style={{
          position: 'absolute',
          top: '42%',
          left: '50%',
          transform: `translateX(-50%) translateY(-50%) scale(${finalScale})`,
          opacity: finalOpacity,
          transformOrigin: 'center center',
        }}
      >
        <Img
          src={staticFile('brand/landhar-logo-white.png')}
          style={{
            width: 540,
            height: 'auto',
            display: 'block',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// ── Card 7: frames 660–749 — Logo hold + tagline ─────────────────────────────
const Card7: React.FC = () => {
  const f = useCurrentFrame();

  // Logo: completely static, held from Card 6 position
  const LOGO_TOP = '42%';

  // Amber line: scaleX 0→1 over 18 frames, starting at relative frame 8
  const lineF = f - 8;
  const lineScale = interpolate(lineF, [0, 18], [0, 1], { ...CLAMP, easing: E_TEXT });

  // Tagline fades in at relative frame 16
  const tagF = f - 16;
  const tagOpacity = interpolate(tagF, [0, 20], [0, 1], { ...CLAMP, easing: E_TEXT });
  const tagTy      = interpolate(tagF, [0, 20], [8, 0], { ...CLAMP, easing: E_TEXT });

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {/* Logo — identical position to Card 6, fully static */}
      <div
        style={{
          position: 'absolute',
          top: LOGO_TOP,
          left: '50%',
          transform: 'translateX(-50%) translateY(-50%)',
          opacity: 1,
        }}
      >
        <Img
          src={staticFile('brand/landhar-logo-white.png')}
          style={{
            width: 540,
            height: 'auto',
            display: 'block',
          }}
        />
      </div>

      {/* Elements below logo: amber line + tagline, centered */}
      <div
        style={{
          position: 'absolute',
          top: LOGO_TOP,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 28,
          paddingTop: 80,
          width: 820,
        }}
      >
        {/* Amber 1px hairline */}
        <div
          style={{
            width: 220,
            height: 1,
            backgroundColor: ACCENT,
            transform: `scaleX(${lineScale})`,
            transformOrigin: 'left center',
          }}
        />

        {/* Tagline */}
        <div
          style={{
            fontFamily: INTER,
            fontWeight: 400,
            fontSize: 44,
            lineHeight: 1.25,
            letterSpacing: 0,
            color: TEXT,
            textAlign: 'center',
            maxWidth: 820,
            opacity: tagOpacity,
            transform: `translateY(${tagTy}px)`,
          }}
        >
          Custom homes, commissioned across Greater Sydney.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Root composition ──────────────────────────────────────────────────────────
export const LandharPremiumV2: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>

      {/* ── Card 1: frames 0–89 ─────────────────────────────────────────────── */}
      <Sequence from={0} durationInFrames={90}>
        <Card1 />
        <Audio
          src={staticFile('voiceover/landhar-premium-v2/01-work.mp3')}
          startFrom={10}
        />
      </Sequence>

      {/* ── Card 2: frames 90–209 ───────────────────────────────────────────── */}
      <Sequence from={90} durationInFrames={120}>
        <Card2 />
        <Audio
          src={staticFile('voiceover/landhar-premium-v2/02-standard.mp3')}
          startFrom={10}
        />
      </Sequence>

      {/* ── Card 2→3 dissolve outgoing layer (frames 210–218) ───────────────── */}
      <Sequence from={210} durationInFrames={9}>
        <Card2Outgoing />
      </Sequence>

      {/* ── Card 3: frames 210–329 ──────────────────────────────────────────── */}
      <Sequence from={210} durationInFrames={120}>
        <Card3 />
        <Audio
          src={staticFile('voiceover/landhar-premium-v2/03-detail.mp3')}
          startFrom={10}
        />
      </Sequence>

      {/* ── Card 4: frames 330–449 (hard cut from Card 3) ───────────────────── */}
      <Sequence from={330} durationInFrames={120}>
        <Card4 />
        <Audio
          src={staticFile('voiceover/landhar-premium-v2/04-constant.mp3')}
          startFrom={10}
        />
      </Sequence>

      {/* ── Card 4 outgoing for 10-frame dissolve into Card 5 ───────────────── */}
      <Sequence from={450} durationInFrames={11}>
        <Card4Outgoing />
      </Sequence>

      {/* ── Card 5: frames 450–569 ──────────────────────────────────────────── */}
      <Sequence from={450} durationInFrames={120}>
        <Card5 />
        <Audio
          src={staticFile('voiceover/landhar-premium-v2/05-view.mp3')}
          startFrom={10}
        />
      </Sequence>

      {/* ── Card 6: frames 570–659 (hard cut to #111110) ────────────────────── */}
      <Sequence from={570} durationInFrames={90}>
        <Card6 />
        <Audio
          src={staticFile('voiceover/landhar-premium-v2/06-brand.mp3')}
          startFrom={10}
        />
      </Sequence>

      {/* ── Card 7: frames 660–749 (same layout, no cut) ────────────────────── */}
      <Sequence from={660} durationInFrames={90}>
        <Card7 />
        <Audio
          src={staticFile('voiceover/landhar-premium-v2/07-location.mp3')}
          startFrom={10}
        />
      </Sequence>

    </AbsoluteFill>
  );
};
