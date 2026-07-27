import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { SPRING } from '../style/tokens';

export type AnimPreset = 'fadeIn' | 'slideUp' | 'slideDown' | 'scaleIn' | 'blurIn' | 'drawLine';

interface UseAnimationPresetsOptions {
  from?: number;
  exitFrom?: number;
  preset?: AnimPreset;
  config?: typeof SPRING[keyof typeof SPRING];
}

interface AnimationStyle {
  opacity: number;
  transform: string;
  filter: string;
  /** Raw spring progress [0..1] */
  progress: number;
  /** Raw exit progress [0..1] */
  exitProgress: number;
}

/**
 * Returns frame-driven animation styles for a given preset.
 * Handles enter AND exit springs automatically.
 */
export function useAnimationPresets({
  from = 0,
  exitFrom,
  preset = 'fadeIn',
  config = SPRING.SMOOTH,
}: UseAnimationPresetsOptions = {}): AnimationStyle {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - from;
  const progress = spring({ frame: localFrame, fps, config });

  const exitFrame = exitFrom !== undefined ? frame - exitFrom : -Infinity;
  const exitProgress =
    exitFrom !== undefined
      ? spring({ frame: exitFrame, fps, config: SPRING.SNAPPY })
      : 0;

  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0], { extrapolateRight: 'clamp' });

  let opacity = 1;
  let transform = 'none';
  let filter = 'none';

  if (preset === 'fadeIn') {
    opacity = interpolate(progress, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' }) * exitOpacity;
  } else if (preset === 'slideUp') {
    const y = interpolate(progress, [0, 1], [50, 0]);
    const exitY = interpolate(exitProgress, [0, 1], [0, -30]);
    opacity = interpolate(progress, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' }) * exitOpacity;
    transform = `translateY(${y + exitY}px)`;
  } else if (preset === 'slideDown') {
    const y = interpolate(progress, [0, 1], [-50, 0]);
    opacity = interpolate(progress, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' }) * exitOpacity;
    transform = `translateY(${y}px)`;
  } else if (preset === 'scaleIn') {
    const scale = interpolate(progress, [0, 1], [0.85, 1]);
    const exitScale = interpolate(exitProgress, [0, 1], [1, 1.08]);
    opacity = interpolate(progress, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' }) * exitOpacity;
    transform = `scale(${scale * exitScale})`;
  } else if (preset === 'blurIn') {
    const blur = interpolate(progress, [0, 1], [20, 0]);
    opacity = interpolate(progress, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' }) * exitOpacity;
    filter = `blur(${blur}px)`;
  } else if (preset === 'drawLine') {
    // For a line element: animate scaleX from 0→1
    const scaleX = interpolate(progress, [0, 1], [0, 1]);
    transform = `scaleX(${scaleX})`;
    opacity = exitOpacity;
  }

  return { opacity, transform, filter, progress, exitProgress };
}
