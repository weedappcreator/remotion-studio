/**
 * Landhar Homes Typography System
 * Based on brand guidelines: editorial, architectural, premium, restrained.
 *
 * Display: Cormorant Garamond (400, 500) — headlines, statements, brand
 * Body:    Inter (400)                   — supporting text, labels, captions
 * Mono:    Space Mono (400)              — technical details, locations, dates
 */
import { loadFont as loadCormorant } from '@remotion/google-fonts/CormorantGaramond';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadSpaceMono } from '@remotion/google-fonts/SpaceMono';

export const { fontFamily: CORMORANT } = loadCormorant('normal', {
  weights: ['400', '500'],
  subsets: ['latin'],
});

export const { fontFamily: CORMORANT_ITALIC } = loadCormorant('italic', {
  weights: ['400', '500'],
  subsets: ['latin'],
});

export const { fontFamily: INTER } = loadInter('normal', {
  weights: ['400'],
  subsets: ['latin'],
});

export const { fontFamily: SPACE_MONO } = loadSpaceMono('normal', {
  weights: ['400'],
  subsets: ['latin'],
});

// ── Landhar Type Scale (1080×1920 vertical) ───────────────────────────────────
export const LH_TYPE = {
  // Display — main statements
  STATEMENT_XL: { fontSize: 96, lineHeight: 1.10, letterSpacing: '0.005em', fontWeight: 400, fontFamily: CORMORANT },
  STATEMENT_LG: { fontSize: 84, lineHeight: 1.12, letterSpacing: '0.005em', fontWeight: 400, fontFamily: CORMORANT },
  STATEMENT_MD: { fontSize: 72, lineHeight: 1.14, letterSpacing: '0.005em', fontWeight: 400, fontFamily: CORMORANT },

  // Three-word punches (like "Uncompromising. Considered. Crafted.")
  PUNCH:        { fontSize: 80, lineHeight: 1.16, letterSpacing: '0.008em', fontWeight: 400, fontFamily: CORMORANT },

  // Pivotal moment (the most important line)
  PIVOTAL:      { fontSize: 100, lineHeight: 1.08, letterSpacing: '0.002em', fontWeight: 400, fontFamily: CORMORANT },

  // Tagline (final card)
  TAGLINE:      { fontSize: 36, lineHeight: 1.35, letterSpacing: '0.012em', fontWeight: 400, fontFamily: CORMORANT },

  // Supporting text
  SUPPORT:      { fontSize: 22, lineHeight: 1.5, letterSpacing: '0.01em', fontWeight: 400, fontFamily: INTER },

  // Label (brand name, location, etc.)
  LABEL:        { fontSize: 13, lineHeight: 1.4, letterSpacing: '0.22em', fontWeight: 400, fontFamily: SPACE_MONO, textTransform: 'uppercase' as const },
} as const;

// ── Voiceover-synced word display ─────────────────────────────────────────────
export interface VoiceWord {
  word: string;
  startFrame: number;
  endFrame: number;
  startSec: number;
  endSec: number;
}

/**
 * Load timestamp data for a composition.
 * Returns empty array if file not yet generated.
 */
export function loadTimestamps(name: string): VoiceWord[] {
  try {
    const fs = require('fs') as typeof import('fs');
    const path = require('path') as typeof import('path');
    const file = path.join(process.cwd(), 'public', 'audio', `${name}.timestamps.json`);
    if (!fs.existsSync(file)) return [];
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    return data.words ?? [];
  } catch {
    return [];
  }
}

/**
 * Get the currently-spoken word at a given frame.
 * Returns null if no word is active.
 */
export function getActiveWord(words: VoiceWord[], frame: number): string | null {
  return words.find(w => frame >= w.startFrame && frame <= w.endFrame)?.word ?? null;
}

/**
 * Get progress (0–1) through the current word at a given frame.
 */
export function getWordProgress(words: VoiceWord[], frame: number): number {
  const word = words.find(w => frame >= w.startFrame && frame <= w.endFrame);
  if (!word) return 0;
  return (frame - word.startFrame) / Math.max(1, word.endFrame - word.startFrame);
}
