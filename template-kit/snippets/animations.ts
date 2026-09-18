/**
 * Utilitários e Fórmulas de Animação Recomendadas para Templates no Crom EasyVideo
 */
import { spring } from '../../src/core/animations';

export interface SpringOptions {
  frame: number;
  fps: number;
  delay?: number;
  damping?: number;
  mass?: number;
  stiffness?: number;
}

/**
 * 1. Entrada Elástica Básica (0 a 1)
 */
export function getEntranceSpring({
  frame,
  fps,
  delay = 0,
  damping = 15,
  mass = 1,
  stiffness = 100,
}: SpringOptions): number {
  return spring({
    frame: frame - delay,
    fps,
    config: { damping, mass, stiffness },
  });
}

/**
 * 2. Entrada Escalonada para Listas / Grades (Stagger)
 */
export function getStaggerSpring(
  frame: number,
  fps: number,
  index: number,
  baseDelay: number = 6,
  intervalFrames: number = 6
): number {
  return spring({
    frame: frame - (baseDelay + index * intervalFrames),
    fps,
    config: { damping: 16, mass: 1 },
  });
}

/**
 * 3. Interpolação Numérica para Contadores
 * Exemplo: 0 -> 98.5
 */
export function interpolateCounter(
  progressSpring: number,
  targetValue: number,
  decimals: number = 0
): string {
  const clamped = Math.max(0, Math.min(1, progressSpring));
  const current = targetValue * clamped;
  return current.toFixed(decimals);
}

/**
 * 4. Pulso Contínuo / Efeito Senoidal (Loop)
 * Ideal para brilhos, anéis de foco e luzes atmosféricas
 */
export function getContinuousPulse(
  frame: number,
  periodFrames: number = 60,
  minVal: number = 0.85,
  maxVal: number = 1.0
): number {
  const sine = (Math.sin((frame / periodFrames) * Math.PI * 2) + 1) / 2;
  return minVal + sine * (maxVal - minVal);
}

/**
 * 5. Helpers de Estilo CSS Inline
 */
export const AnimationStyles = {
  // Translação vertical suave com opacidade
  fadeSlideUp: (s: number, distancePx: number = 30) => ({
    transform: `translateY(${(1 - s) * distancePx}px)`,
    opacity: Math.max(0, Math.min(1, s)),
  }),

  // Pop suave com escala
  popScale: (s: number, startScale: number = 0.88) => ({
    transform: `scale(${startScale + s * (1 - startScale)})`,
    opacity: Math.max(0, Math.min(1, s)),
  }),

  // Translação lateral (esquerda -> direita)
  slideLeft: (s: number, distancePx: number = 40) => ({
    transform: `translateX(${(1 - s) * -distancePx}px)`,
    opacity: Math.max(0, Math.min(1, s)),
  }),
};
