/**
 * VoiceoverCaption — Voiceover-synced word highlight component
 *
 * Reads ElevenLabs word-level timestamp data and highlights the currently-spoken
 * word in the on-screen text. Inactive words are dimmed; the active word shifts
 * to the accent colour and italicises.
 *
 * Usage:
 *   <VoiceoverCaption
 *     text="Custom homes, commissioned across Greater Sydney."
 *     words={TIMESTAMPS}
 *     from={690}          // Sequence-relative offset for Card 7
 *   />
 */

import React from 'react';
import { useCurrentFrame } from 'remotion';
import { getActiveWord, VoiceWord, LH_TYPE } from '../style/landhar-typography';

interface VoiceoverCaptionProps {
  /** Full text string — must match what was sent to ElevenLabs */
  text: string;
  /** Word-level timestamp data from loadTimestamps() */
  words: VoiceWord[];
  /**
   * Frame offset added to the composition frame before looking up the active word.
   * Use the absolute start frame of the Sequence this component lives inside.
   */
  from?: number;
  /** Visual highlight style */
  style?: 'default' | 'highlight' | 'glow';
  /** Base text colour */
  textColor?: string;
  /** Active word accent colour */
  activeColor?: string;
  /** Font size in px — defaults to LH_TYPE.TAGLINE.fontSize (36) */
  fontSize?: number;
}

export const VoiceoverCaption: React.FC<VoiceoverCaptionProps> = ({
  text,
  words,
  from = 0,
  style = 'highlight',
  textColor = '#ECE9E2',
  activeColor = '#C47C3A',
  fontSize = LH_TYPE.TAGLINE.fontSize,
}) => {
  const frame = useCurrentFrame();
  // Offset the composition frame so timestamps align to audio start
  const activeWord = getActiveWord(words, frame - from);
  const textWords = text.split(' ');

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.3em',
        fontFamily: LH_TYPE.TAGLINE.fontFamily,
        fontSize,
        fontWeight: LH_TYPE.TAGLINE.fontWeight,
        lineHeight: LH_TYPE.TAGLINE.lineHeight,
        letterSpacing: LH_TYPE.TAGLINE.letterSpacing,
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      } as React.CSSProperties}
    >
      {textWords.map((word, i) => {
        // Strip punctuation for comparison but preserve it in display
        const bare = word.toLowerCase().replace(/[.,!?;:]/g, '');
        const isActive = activeWord != null && activeWord.toLowerCase() === bare;

        return (
          <span
            key={i}
            style={{
              color: isActive ? activeColor : textColor,
              opacity: isActive ? 1 : 0.65,
              fontStyle: isActive ? 'italic' : 'normal',
              // No CSS transitions — Remotion renders per-frame, not animated CSS
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
