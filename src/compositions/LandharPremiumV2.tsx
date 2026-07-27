/**
 * LandharPremiumV2 — Architectural Editorial Film
 *
 * Format : 1080 × 1920 (vertical)
 * FPS    : 30
 * Length : 784 frames / 26.13 seconds
 *
 * v2 fixes applied:
 *  - Clean photos without baked text
 *  - Correct photo assignments per brief
 *  - Logo: 540px wide, optically above center
 *  - Card 7: tagline positioned BELOW logo, no overlap
 *  - Amber line visible on Card 7
 *  - Card 4: truly NO text
 *  - Font: Cormorant Garamond 500, Inter 400
 *  - Text: translateY 8px → 0 only
 *
 * v3 fixes:
 *  - Card 7 extended to 124 frames: 07-location.mp3 is 2.79s (84 frames at 30fps)
 *    + 10 frame audio delay = 94 frames needed before audio ends, +30 hold = 124 frames
 *  - Card 7 layout: logo repositioned to 36% (was 38%) so bottom edge clears before
 *    amber line container. Logo PNG is 8492×5902 (aspect ~1.44:1), displayed at 540px wide
 *    → actual height ≈ 375px. Amber line container now at calc(36% + 236px) which places
 *    it 48px below the logo bottom edge.
 *  - Total duration updated to 784 frames (was 750)
 *
 * v4 (professional rebuild):
 *  - Font switched from Cormorant Garamond to Playfair Display 700
 *    (much thicker strokes — readable on bright Cards 2+3)
 *  - Per-card IMG_FILTER: Cards 2+3 get significantly darker treatment
 *  - Stronger LegibilityGradient: 0.88 at 0%, multi-stop, 900px height
 *  - Per-card objectPosition tuned to show darker zones in text area
 *  - Text color: pure #FFFFFF (max contrast, not ivory #ECE9E2)
 *  - textShadow upgraded: 0 2px 12px rgba(0,0,0,0.5)
 *  - letterSpacing: -0.5px (Playfair has stronger strokes, less negative needed)
 *  - lineHeight: 1.0 (Playfair's robust letterforms handle tighter leading)
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
} from 'remotion';
import { loadFont as loadPlayfair } from '@remotion/google-fonts/PlayfairDisplay';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { buildVideoSwarmConfig, logSwarmInit } from '../lib/ruflo';

// ── Ruflo ─────────────────────────────────────────────────────────────────────
const _swarm = buildVideoSwarmConfig('LandharPremiumV2 — professional rebuild: Playfair Display 700, per-card brightness, stronger gradient');
logSwarmInit(_swarm.agents, 'LandharPremiumV2');

// ── Fonts ─────────────────────────────────────────────────────────────────────
// Playfair Display 700 — editorial serif with thick strokes, far more legible
// on bright backgrounds than Cormorant Garamond at any weight.
const { fontFamily: DISPLAY } = loadPlayfair('normal', { weights: ['700'], subsets: ['latin'] });
const { fontFamily: INTER }   = loadInter('normal',   { weights: ['400'], subsets: ['latin'] });

// ── Brand ─────────────────────────────────────────────────────────────────────
const BG     = '#111110';
const TEXT   = '#ECE9E2'; // Card 7 tagline only — on dark bg, fine
const ACCENT = '#C47C3A'; // amber — Card 7 hairline ONLY

// ── Per-card image filters ────────────────────────────────────────────────────
// Tuned per background brightness. Cards 2+3 get aggressive darkening because
// the Turramurra interior and marble bathroom are both very light scenes.
const FILTER = {
  card1:      'brightness(0.88) contrast(1.04)', // dark hardwood floor — subtle
  turramurra: 'brightness(0.72) contrast(1.06)', // bright white interior — significantly darker
  bathroom:   'brightness(0.65) contrast(1.10)', // light marble — most aggressive
  chandelier: 'brightness(0.85) contrast(1.05)', // dark chandelier — subtle
  dusk:       'brightness(0.82) contrast(1.04)', // dusk exterior — subtle
};

// ── Easing ───────────────────────────────────────────────────────────────────
const E_IMG  = Easing.bezier(0.45, 0, 0.55, 1); // photo motion
const E_TEXT = Easing.bezier(0.22, 1, 0.36, 1); // text reveals
const CL = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };

// ── Assets ────────────────────────────────────────────────────────────────────
const PHOTOS = {
  turramurra:   'media/turramurra-clean.png',      // Cards 1+2 — Turramurra living room
  bathroom:     'media/rose-bowl-detail-clean.png', // Card 3   — Rose Bowl bathroom detail
  chandelier:   'media/glenmore-clean.png',          // Card 4   — Glenmore Park chandelier
  dusk:         'media/rose-bowl-dusk-clean.png',   // Card 5   — Rose Bowl dusk exterior
  logo:         'brand/landhar-logo-white.png',      // Cards 6+7 — official logo
};

const AUDIO = {
  s1: 'voiceover/landhar-premium-v2/01-work.mp3',
  s2: 'voiceover/landhar-premium-v2/02-standard.mp3',
  s3: 'voiceover/landhar-premium-v2/03-detail.mp3',
  s4: 'voiceover/landhar-premium-v2/04-constant.mp3',
  s5: 'voiceover/landhar-premium-v2/05-view.mp3',
  s6: 'voiceover/landhar-premium-v2/06-brand.mp3',
  s7: 'voiceover/landhar-premium-v2/07-location.mp3',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Shared text reveal: opacity 0→1 + translateY 8→0 over 20 frames */
function useTextReveal(localFrame: number, from: number) {
  const f = localFrame - from;
  return {
    opacity:  interpolate(f, [0, 20], [0, 1], { ...CL, easing: E_TEXT }),
    ty:       interpolate(f, [0, 20], [8, 0], { ...CL, easing: E_TEXT }),
  };
}

/** Text exit: opacity 1→0 over 8 frames */
function useTextExit(localFrame: number, from: number) {
  return interpolate(localFrame, [from, from + 8], [1, 0], CL);
}

// ── LegibilityGradient ────────────────────────────────────────────────────────
// Stronger gradient — covers Cards 2+3 which have bright photo backgrounds.
// Multi-stop: 0.88 at base, gentle fade to transparent at 70%. 900px height.
const LegibilityGradient: React.FC<{ height?: number }> = ({ height = 900 }) => (
  <div style={{
    position: 'absolute', bottom: 0, left: 0, right: 0, height,
    background: 'linear-gradient(to top, rgba(8,8,7,0.88) 0%, rgba(8,8,7,0.72) 15%, rgba(8,8,7,0.45) 35%, rgba(8,8,7,0.15) 55%, rgba(8,8,7,0) 70%)',
    pointerEvents: 'none',
  }} />
);

// ── Display text style ────────────────────────────────────────────────────────
// Playfair Display 700 — thick strokes, readable on any background.
// Pure #FFFFFF for maximum contrast (not ivory — ivory fails on near-white photos).
// textShadow upgraded to 12px blur for cards with bright backgrounds.
const displayStyle = (size: number, lineH = 1.0): React.CSSProperties => ({
  fontFamily:          DISPLAY,
  fontWeight:          700,
  fontSize:            size,
  lineHeight:          lineH,
  letterSpacing:       '-0.5px',
  color:               '#FFFFFF',
  textShadow:          '0 2px 12px rgba(0,0,0,0.5)',
  margin:              0,
  padding:             0,
  WebkitFontSmoothing: 'antialiased',
});

// ─────────────────────────────────────────────────────────────────────────────
// CARD 1 — frames 0–89
// Turramurra living room. Image only. No text.
// Part of the continuous 0–209 motion arc.
// ─────────────────────────────────────────────────────────────────────────────
const Card1: React.FC = () => {
  const f = useCurrentFrame();
  const scale = interpolate(f, [0, 209], [1.02, 1.05], { ...CL, easing: E_IMG });
  const ty    = interpolate(f, [0, 209], [0, -16],     { ...CL, easing: E_IMG });

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden' }}>
      <Img
        src={staticFile(PHOTOS.turramurra)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%',
          transform: `scale(${scale}) translateY(${ty}px)`, filter: FILTER.card1 }}
      />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CARD 2 — frames 90–209
// Continuous Turramurra motion. Text enters at relative frame 20.
// objectPosition: 'center 55%' — shows more dark floor at bottom where text lives.
// ─────────────────────────────────────────────────────────────────────────────
const Card2: React.FC = () => {
  const f    = useCurrentFrame();
  const absF = f + 90; // absolute frame for 0–209 arc
  const scale = interpolate(absF, [0, 209], [1.02, 1.05], { ...CL, easing: E_IMG });
  const ty    = interpolate(absF, [0, 209], [0, -16],     { ...CL, easing: E_IMG });

  const { opacity, ty: textTy } = useTextReveal(f, 20);
  const exitOp = useTextExit(f, 100);
  const finalOp = f >= 100 ? exitOp : opacity;
  const finalTy = f >= 100 ? 0 : textTy;

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden' }}>
      <Img
        src={staticFile(PHOTOS.turramurra)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 55%',
          transform: `scale(${scale}) translateY(${ty}px)`, filter: FILTER.turramurra }}
      />
      <LegibilityGradient />
      <div style={{ position: 'absolute', left: 90, bottom: 200, maxWidth: 760,
        opacity: finalOp, transform: `translateY(${finalTy}px)` }}>
        <p style={displayStyle(96)}>
          Every commission.<br />One standard.
        </p>
      </div>
    </AbsoluteFill>
  );
};

// ── Card 2 frozen layer for 8-frame dissolve ──────────────────────────────────
const Card2Frozen: React.FC = () => {
  const f = useCurrentFrame();
  const op = interpolate(f, [0, 8], [1, 0], CL);
  const scale = interpolate(209, [0, 209], [1.02, 1.05], { ...CL, easing: E_IMG });
  const ty    = interpolate(209, [0, 209], [0, -16],     { ...CL, easing: E_IMG });
  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden', opacity: op }}>
      <Img src={staticFile(PHOTOS.turramurra)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 55%',
          transform: `scale(${scale}) translateY(${ty}px)`, filter: FILTER.turramurra }} />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CARD 3 — frames 210–329
// Rose Bowl bathroom detail. 8-frame dissolve in.
// THREE-LINE BLOCK revealed as ONE (no stagger).
// objectPosition: 'center 65%' — shows dark cabinet base at bottom (text zone).
// ─────────────────────────────────────────────────────────────────────────────
const Card3: React.FC = () => {
  const f = useCurrentFrame();
  const scale = interpolate(f, [0, 120], [1.00, 1.01], { ...CL, easing: E_IMG });
  const ty    = interpolate(f, [0, 120], [0, 14],      { ...CL, easing: E_IMG });
  const dissolveIn = interpolate(f, [0, 8], [0, 1], CL);

  const { opacity, ty: textTy } = useTextReveal(f, 22);
  const exitOp = useTextExit(f, 100);
  const finalOp = f >= 100 ? exitOp : opacity;
  const finalTy = f >= 100 ? 0 : textTy;

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden', opacity: dissolveIn }}>
      <Img src={staticFile(PHOTOS.bathroom)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 65%',
          transform: `scale(${scale}) translateY(${ty}px)`, filter: FILTER.bathroom }} />
      <LegibilityGradient />
      <div style={{ position: 'absolute', left: 90, bottom: 200, maxWidth: 760,
        opacity: finalOp, transform: `translateY(${finalTy}px)` }}>
        {/* ONE BLOCK — zero stagger per v2 brief */}
        <p style={displayStyle(88)}>
          Uncompromising.<br />Considered.<br />Crafted.
        </p>
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CARD 4 — frames 330–449
// Glenmore Park chandelier. Hard cut. ABSOLUTELY NO TEXT.
// objectPosition: 'center 25%' — emphasises chandelier high in frame.
// ─────────────────────────────────────────────────────────────────────────────
const Card4: React.FC = () => {
  const f = useCurrentFrame();
  const scale = interpolate(f, [0, 120], [1.00, 1.02], { ...CL, easing: E_IMG });
  const ty    = interpolate(f, [0, 120], [0, -16],     { ...CL, easing: E_IMG });

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden' }}>
      <Img src={staticFile(PHOTOS.chandelier)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 25%',
          transform: `scale(${scale}) translateY(${ty}px)`, filter: FILTER.chandelier }} />
      {/* NO gradient, NO text, NO overlay — Card 4 is image only per v2 brief */}
    </AbsoluteFill>
  );
};

// ── Card 4 frozen layer for 10-frame dissolve ─────────────────────────────────
const Card4Frozen: React.FC = () => {
  const f = useCurrentFrame();
  const op    = interpolate(f, [0, 10], [1, 0], CL);
  const scale = interpolate(119, [0, 120], [1.00, 1.02], { ...CL, easing: E_IMG });
  const ty    = interpolate(119, [0, 120], [0, -16],     { ...CL, easing: E_IMG });
  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden', opacity: op }}>
      <Img src={staticFile(PHOTOS.chandelier)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 25%',
          transform: `scale(${scale}) translateY(${ty}px)`, filter: FILTER.chandelier }} />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CARD 5 — frames 450–569
// Rose Bowl dusk exterior. 10-frame dissolve in. Pivotal line.
// Nearly static — 2% scale push only.
// objectPosition: 'center 72%' — house stays anchored low.
// ─────────────────────────────────────────────────────────────────────────────
const Card5: React.FC = () => {
  const f = useCurrentFrame();
  const scale      = interpolate(f, [0, 120], [1.00, 1.02], { ...CL, easing: E_IMG });
  const dissolveIn = interpolate(f, [0, 10], [0, 1], CL);

  const { opacity, ty: textTy } = useTextReveal(f, 24);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden', opacity: dissolveIn }}>
      <Img src={staticFile(PHOTOS.dusk)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 72%',
          transform: `scale(${scale})`, filter: FILTER.dusk }} />
      <LegibilityGradient />
      <div style={{ position: 'absolute', left: 90, bottom: 220, maxWidth: 760,
        opacity, transform: `translateY(${textTy}px)` }}>
        <p style={displayStyle(108, 1.0)}>
          Now, it comes into view.
        </p>
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CARD 6 — frames 570–659
// Pure #111110. Logo fades in as one complete asset.
// Flex column centered — no pixel math, no absolute positioning guesswork.
//
// Remotion skill rule: use flexbox for multi-element end cards.
// LHH branding: logo as sole element, centered, restrained.
// ─────────────────────────────────────────────────────────────────────────────
const Card6: React.FC = () => {
  const f  = useCurrentFrame();
  const lf = Math.max(0, f - 18);
  const logoOp    = interpolate(lf, [0, 20], [0, 1],     { ...CL, easing: E_TEXT });
  const logoScale = interpolate(lf, [0, 20], [0.995, 1], { ...CL, easing: E_TEXT });

  return (
    <AbsoluteFill style={{
      backgroundColor: BG,
      display:         'flex',
      flexDirection:   'column',
      alignItems:      'center',
      justifyContent:  'center',
    }}>
      {/* Official logo — one complete asset, 400px wide */}
      {/* Width reduced from 540→400 so wordmark reads cleanly on 1080px frame */}
      <div style={{
        opacity:         logoOp,
        transform:       `scale(${logoScale})`,
        transformOrigin: 'center center',
      }}>
        <Img
          src={staticFile(PHOTOS.logo)}
          style={{ width: 400, height: 'auto', display: 'block' }}
        />
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CARD 7 — frames 660–783 (extended to fit full 07-location.mp3 narration)
// ONE flex column: logo (static) → amber line → tagline.
// Zero pixel math. Each element stacks naturally with defined gaps.
//
// LHH typography:
//   Logo    — official PNG, 400px wide, unchanged
//   Line    — 1px #C47C3A, 180px, scaleX reveal
//   Tagline — Inter Regular 400, 36px, #ECE9E2, center aligned (on dark bg — fine)
// ─────────────────────────────────────────────────────────────────────────────
const Card7: React.FC = () => {
  const f = useCurrentFrame();

  // Amber line draws at relative frame 8, over 18 frames
  const lineF     = Math.max(0, f - 8);
  const lineScale = interpolate(lineF, [0, 18], [0, 1], { ...CL, easing: E_TEXT });

  // Tagline enters at relative frame 20 (8f after line starts + 12f stagger)
  const { opacity: tagOp, ty: tagTy } = useTextReveal(f, 20);

  return (
    <AbsoluteFill style={{
      backgroundColor: BG,
      display:         'flex',
      flexDirection:   'column',
      alignItems:      'center',
      justifyContent:  'center',
      // Nudge group slightly above mathematical center — optically correct
      paddingBottom:   80,
    }}>
      {/* Logo — identical to Card 6, fully static */}
      <Img
        src={staticFile(PHOTOS.logo)}
        style={{ width: 400, height: 'auto', display: 'block' }}
      />

      {/* 40px breathing room between logo and amber line */}
      <div style={{ height: 40 }} />

      {/* 1px amber hairline — scaleX 0→1, centered */}
      <div style={{
        width:           180,
        height:          1,
        backgroundColor: ACCENT,
        transform:       `scaleX(${lineScale})`,
        transformOrigin: 'center center',
      }} />

      {/* 28px gap between amber line and tagline */}
      <div style={{ height: 28 }} />

      {/* Tagline — Inter Regular — LHH branding: clean, precise, not decorative */}
      {/* Color: #ECE9E2 (ivory) — on dark #111110 bg this has excellent contrast */}
      <div style={{
        opacity:             tagOp,
        transform:           `translateY(${tagTy}px)`,
        fontFamily:          INTER,
        fontWeight:          400,
        fontSize:            36,
        lineHeight:          1.35,
        letterSpacing:       '0.01em',
        color:               TEXT,
        textAlign:           'center',
        maxWidth:            760,
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      }}>
        Custom homes, commissioned across Greater Sydney.
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ROOT COMPOSITION — 784 frames (26.13s) — Card 7 extended for 07-location.mp3
// ─────────────────────────────────────────────────────────────────────────────
export const LandharPremiumV2: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>

    {/* Card 1: frames 0–89 — image only */}
    <Sequence from={0} durationInFrames={90}>
      <Card1 />
      {/* <Audio src={staticFile(AUDIO.s1)} startFrom={10} /> */}
    </Sequence>

    {/* Card 2: frames 90–209 — continuous image + text */}
    <Sequence from={90} durationInFrames={120}>
      <Card2 />
      {/* <Audio src={staticFile(AUDIO.s2)} startFrom={10} /> */}
    </Sequence>

    {/* 8-frame dissolve outgoing layer at Card 2→3 boundary */}
    <Sequence from={210} durationInFrames={9}>
      <Card2Frozen />
    </Sequence>

    {/* Card 3: frames 210–329 — bathroom detail, 8-frame dissolve in */}
    <Sequence from={210} durationInFrames={120}>
      <Card3 />
      {/* <Audio src={staticFile(AUDIO.s3)} startFrom={10} /> */}
    </Sequence>

    {/* Card 4: frames 330–449 — chandelier, hard cut, NO TEXT */}
    <Sequence from={330} durationInFrames={120}>
      <Card4 />
      {/* <Audio src={staticFile(AUDIO.s4)} startFrom={10} /> */}
    </Sequence>

    {/* 10-frame dissolve outgoing layer at Card 4→5 boundary */}
    <Sequence from={450} durationInFrames={11}>
      <Card4Frozen />
    </Sequence>

    {/* Card 5: frames 450–569 — dusk exterior, 10-frame dissolve in */}
    <Sequence from={450} durationInFrames={120}>
      <Card5 />
      {/* <Audio src={staticFile(AUDIO.s5)} startFrom={10} /> */}
    </Sequence>

    {/* Card 6: frames 570–659 — logo reveal on dark */}
    <Sequence from={570} durationInFrames={90}>
      <Card6 />
      {/* <Audio src={staticFile(AUDIO.s6)} startFrom={10} /> */}
    </Sequence>

    {/* Card 7: frames 660–783 — logo hold + amber line + tagline */}
    {/* Extended to 124 frames: 07-location.mp3 is 2.79s (84 frames) + 10f delay = 94f needed, +30f hold */}
    <Sequence from={660} durationInFrames={124}>
      <Card7 />
      {/* <Audio src={staticFile(AUDIO.s7)} startFrom={10} /> */}
    </Sequence>

  </AbsoluteFill>
);
