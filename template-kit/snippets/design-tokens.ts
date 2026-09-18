/**
 * Tokens de Design, Cores e Resoluções Canônicas para Templates
 */

export const CANONICAL_RESOLUTIONS = {
  WIDESCREEN_16_9: {
    width: 1920,
    height: 1080,
    aspect: 16 / 9,
    label: '16:9 Widescreen Full HD',
  },
  VERTICAL_9_16: {
    width: 1080,
    height: 1920,
    aspect: 9 / 16,
    label: '9:16 Vertical Story / Reels',
  },
  SQUARE_1_1: {
    width: 1080,
    height: 1080,
    aspect: 1 / 1,
    label: '1:1 Quadrado Feed',
  },
  PORTRAIT_4_5: {
    width: 1080,
    height: 1350,
    aspect: 4 / 5,
    label: '4:5 Retrato Feed',
  },
} as const;

export const RECOMMENDED_PALETTES = {
  indigoCyber: {
    primary: '#6366f1',
    glow: '#312e81',
    bg: '#030712',
    accentText: '#a5b4fc',
  },
  skyTech: {
    primary: '#38bdf8',
    glow: '#0c4a6e',
    bg: '#020617',
    accentText: '#7dd3fc',
  },
  emeraldAnalytics: {
    primary: '#10b981',
    glow: '#064e3b',
    bg: '#022c22',
    accentText: '#6ee7b7',
  },
  purpleNeural: {
    primary: '#a855f7',
    glow: '#581c87',
    bg: '#090514',
    accentText: '#d8b4fe',
  },
  roseImpact: {
    primary: '#f43f5e',
    glow: '#881337',
    bg: '#0c0507',
    accentText: '#fda4af',
  },
  amberAttention: {
    primary: '#f59e0b',
    glow: '#78350f',
    bg: '#0d0903',
    accentText: '#fcd34d',
  },
} as const;

export const BACKGROUND_PATTERNS = {
  radialGlow: (glowColor: string = '#312e81', bgColor: string = '#030712') =>
    `radial-gradient(circle at 50% 40%, ${glowColor} 0%, ${bgColor} 85%)`,

  subtleGrid: (lineColor: string = '#6366f1') =>
    `radial-gradient(${lineColor} 1px, transparent 1px)`,

  linearTechGrid: (lineColor: string = '#38bdf8') =>
    `linear-gradient(to right, ${lineColor} 1px, transparent 1px), linear-gradient(to bottom, ${lineColor} 1px, transparent 1px)`,
};
