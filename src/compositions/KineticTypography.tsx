import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { GradientBg } from '../components/GradientBg';
import { NoiseBg } from '../components/NoiseBg';
import { KineticText } from '../components/KineticText';
import { PALETTE } from '../style/tokens';

interface KineticTypographyProps {
  lines?: string[];
  palette?: keyof typeof PALETTE;
}

const DEFAULT_LINES = [
  'Make it',
  'unforgettable.',
  'Make it',
  'yours.',
];

export const KineticTypography: React.FC<KineticTypographyProps> = ({
  lines = DEFAULT_LINES,
  palette = 'obsidian',
}) => {
  const p = PALETTE[palette];

  return (
    <AbsoluteFill style={{ background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, padding: '0 120px' }}>
      <GradientBg colors={[p.bg, p.surface, p.surface]} speed={0.2} />
      <NoiseBg opacity={0.04} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {lines.map((line, i) => (
          <Sequence key={i} from={i * 25} durationInFrames={300}>
            <KineticText
              text={line}
              from={0}
              mode={i % 2 === 0 ? 'slideUp' : 'blur'}
              fontSize={i % 2 === 0 ? 100 : 88}
              color={i % 2 === 0 ? p.text : p.accent}
              exitFrom={120}
            />
          </Sequence>
        ))}
      </div>
    </AbsoluteFill>
  );
};
