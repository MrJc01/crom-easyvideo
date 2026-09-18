export interface SpringConfig {
  damping?: number;
  mass?: number;
  stiffness?: number;
}

export interface SpringParams {
  frame: number;
  fps?: number;
  config?: SpringConfig;
}

export function spring({
  frame,
  fps = 30,
  config = { damping: 12, mass: 0.5, stiffness: 100 },
}: SpringParams): number {
  if (frame <= 0) return 0;
  const damping = config.damping ?? 12;
  const mass = config.mass ?? 0.5;
  const stiffness = config.stiffness ?? 100;

  const t = frame / fps;
  const omega0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(mass * stiffness));

  if (zeta < 1) {
    const omegaD = omega0 * Math.sqrt(1 - zeta * zeta);
    const decay = Math.exp(-zeta * omega0 * t);
    const value =
      1 - decay * (Math.cos(omegaD * t) + ((zeta * omega0) / omegaD) * Math.sin(omegaD * t));
    return Math.min(1.08, Math.max(0, value));
  }
  return Math.min(1, Math.max(0, 1 - Math.exp(-omega0 * t)));
}

export interface InterpolateOptions {
  extrapolateLeft?: 'clamp' | 'identity';
  extrapolateRight?: 'clamp' | 'identity';
}

export function interpolate(
  input: number,
  inputRange: [number, number],
  outputRange: [number, number],
  options?: InterpolateOptions
): number {
  const [inMin, inMax] = inputRange;
  const [outMin, outMax] = outputRange;
  const clampLeft = options?.extrapolateLeft !== 'identity';
  const clampRight = options?.extrapolateRight !== 'identity';

  if (input <= inMin && clampLeft) return outMin;
  if (input >= inMax && clampRight) return outMax;

  const progress = (input - inMin) / (inMax - inMin);
  return outMin + progress * (outMax - outMin);
}
