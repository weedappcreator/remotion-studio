import React from 'react';
import { Composition } from 'remotion';
import { LogoReveal } from './compositions/LogoReveal';
import { KineticTypography } from './compositions/KineticTypography';
import { WebsitePromo } from './compositions/WebsitePromo';
import { LandharRebrand } from './compositions/LandharRebrand';

// Live script — updated by `npm run voice-watch` via OpenLess → OpenRouter
// Remotion Studio hot-reloads whenever this file changes
// eslint-disable-next-line @typescript-eslint/no-var-requires
const script = require('./data/script.json') as {
  headline: string;
  subheadline: string;
  lines: string[];
  cta: string;
};

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
          tagline: script.headline,
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
          tagline: script.headline,
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
          lines: script.lines,
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
          headline: script.headline,
          subheadline: script.subheadline,
          cta: script.cta,
          brandName: 'UIGen',
          palette: 'obsidian',
        }}
      />
      <Composition
        id="LandharRebrand"
        component={LandharRebrand}
        durationInFrames={1350}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  );
};
