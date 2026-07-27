import React, { useState } from 'react';
import { Player } from '@remotion/player';
import { LandharLaunchTeaser } from '../../src/compositions/LandharLaunchTeaser';
import { LogoReveal } from '../../src/compositions/LogoReveal';
import { KineticTypography } from '../../src/compositions/KineticTypography';
import { WebsitePromo } from '../../src/compositions/WebsitePromo';

const COMPOSITIONS = [
  {
    id: 'LandharLaunchTeaser',
    label: 'Landhar Homes — Launch Teaser',
    component: LandharLaunchTeaser,
    width: 1080,
    height: 1920,
    fps: 30,
    frames: 810,
    props: {},
  },
  {
    id: 'LogoReveal',
    label: 'Logo Reveal',
    component: LogoReveal,
    width: 1920,
    height: 1080,
    fps: 30,
    frames: 150,
    props: { logoText: 'BRAND', tagline: 'Make it memorable.', palette: 'obsidian' as const },
  },
  {
    id: 'KineticTypography',
    label: 'Kinetic Typography',
    component: KineticTypography,
    width: 1920,
    height: 1080,
    fps: 30,
    frames: 400,
    props: {},
  },
  {
    id: 'WebsitePromo',
    label: 'Website Promo',
    component: WebsitePromo,
    width: 1920,
    height: 1080,
    fps: 30,
    frames: 300,
    props: { headline: 'Build faster.', subheadline: 'Ship production-ready websites in minutes with AI.', cta: 'Start Free →', brandName: 'UIGen', palette: 'obsidian' as const },
  },
] as const;

export const App: React.FC = () => {
  const [active, setActive] = useState(0);
  const comp = COMPOSITIONS[active];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        padding: '20px 40px',
        borderBottom: '1px solid #1E1E1C',
        display: 'flex',
        alignItems: 'center',
        gap: 32,
        background: '#0A0A09',
      }}>
        <div style={{ fontSize: 13, letterSpacing: '0.2em', color: '#C47C3A', fontFamily: 'monospace' }}>
          REMOTION STUDIO
        </div>
        <nav style={{ display: 'flex', gap: 8 }}>
          {COMPOSITIONS.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setActive(i)}
              style={{
                background: i === active ? '#1E1E1C' : 'transparent',
                border: i === active ? '1px solid #2E2E2C' : '1px solid transparent',
                color: i === active ? '#ECE9E2' : '#6B6B6B',
                padding: '6px 14px',
                borderRadius: 6,
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              {c.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Player */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        background: '#0D0D0C',
      }}>
        <div style={{
          maxHeight: 'calc(100vh - 160px)',
          maxWidth: '100%',
          aspectRatio: `${comp.width} / ${comp.height}`,
        }}>
          <Player
            key={comp.id}
            component={comp.component as React.ComponentType<Record<string, unknown>>}
            inputProps={comp.props as Record<string, unknown>}
            durationInFrames={comp.frames}
            compositionWidth={comp.width}
            compositionHeight={comp.height}
            fps={comp.fps}
            style={{ width: '100%', height: '100%', borderRadius: 8 }}
            controls
            loop
            autoPlay={false}
          />
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '12px 40px',
        borderTop: '1px solid #1E1E1C',
        fontSize: 11,
        color: '#3B3B39',
        letterSpacing: '0.12em',
        fontFamily: 'monospace',
        background: '#0A0A09',
      }}>
        {comp.width}×{comp.height} · {comp.fps}fps · {comp.frames} frames · {(comp.frames / comp.fps).toFixed(1)}s
      </footer>
    </div>
  );
};
