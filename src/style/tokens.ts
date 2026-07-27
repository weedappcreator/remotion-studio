export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export const TIMING = {
  FAST: 10,
  NORMAL: 20,
  SLOW: 30,
  VERY_SLOW: 45,
  STAGGER: 4,
};

export const SPRING = {
  SNAPPY: { damping: 200, stiffness: 400, mass: 0.5 },
  SMOOTH: { damping: 80, stiffness: 120, mass: 1 },
  BOUNCY: { damping: 40, stiffness: 200, mass: 0.8 },
  ELASTIC: { damping: 20, stiffness: 150, mass: 1 },
  GENTLE: { damping: 120, stiffness: 80, mass: 1.2 },
};

export const PALETTE = {
  obsidian: { bg: '#0A0A0B', surface: '#141416', text: '#F5F5F7', accent: '#E8FF47', muted: '#6B6B6B' },
  arctic:   { bg: '#F8FAFB', surface: '#FFFFFF', text: '#0D0D0D', accent: '#2563EB', muted: '#94A3B8' },
  midnight: { bg: '#0D0F1A', surface: '#161824', text: '#E2E8F0', accent: '#818CF8', muted: '#475569' },
  forest:   { bg: '#0C1510', surface: '#162018', text: '#ECFDF5', accent: '#34D399', muted: '#4B5563' },
  noir:     { bg: '#0A0A0A', surface: '#111111', text: '#FFFFFF', accent: '#FFFFFF', muted: '#555555' },
};

export type PaletteKey = keyof typeof PALETTE;
