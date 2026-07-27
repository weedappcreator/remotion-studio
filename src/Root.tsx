import React from 'react';
import { Composition } from 'remotion';
import { LogoReveal } from './compositions/LogoReveal';
import { KineticTypography } from './compositions/KineticTypography';
import { WebsitePromo } from './compositions/WebsitePromo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="LogoReveal"
        component={LogoReveal}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          logoText: 'BRAND',
          tagline: 'Make it memorable.',
          palette: 'obsidian',
        }}
      />
      <Composition
        id="LogoRevealShorts"
        component={LogoReveal}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          logoText: 'BRAND',
          tagline: 'Make it memorable.',
          palette: 'midnight',
        }}
      />
      <Composition
        id="KineticTypography"
        component={KineticTypography}
        durationInFrames={400}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          lines: ['Make it', 'unforgettable.', 'Make it', 'yours.'],
          palette: 'obsidian',
        }}
      />
      <Composition
        id="WebsitePromo"
        component={WebsitePromo}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          headline: 'Build faster.',
          subheadline: 'Ship production-ready websites in minutes with AI.',
          cta: 'Start Free →',
          brandName: 'UIGen',
          palette: 'obsidian',
        }}
      />
    </>
  );
};
