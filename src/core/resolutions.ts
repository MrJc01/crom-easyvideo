/**
 * Crom EasyVideo - Sistema Central de Resoluções Canônicas
 * 
 * Baseado no padrão de arquitetura de motores de vídeo (Remotion / After Effects):
 * O Aspect Ratio determina o Espaço Lógico de Composição (Canonical Coordinate Space).
 * Resoluções físicas diferentes para o mesmo Aspect Ratio (ex: 1080p vs 720p)
 * compartilham exatamente o mesmo espaço lógico de 1920x1080, garantindo
 * zero distorção, zero alteração de tamanho de texto e zero quebra de linha.
 */

import { SAFE_ZONE_PRESETS, type SafeZoneGuide } from './typography';

export interface ResolutionPreset {
  id: string;
  label: string;
  sublabel: string;
  width: number;           // Largura física de renderização / exportação (ex: 1920, 1280)
  height: number;          // Altura física de renderização / exportação (ex: 1080, 720)
  canonicalWidth: number;  // Espaço de coordenadas lógicas de composição (ex: 1920 para 16:9)
  canonicalHeight: number; // Espaço de coordenadas lógicas de composição (ex: 1080 para 16:9)
  aspectRatio: string;     // Representação CSS (ex: '16 / 9', '9 / 16')
  aspectRatioNum: number;  // Fração numérica para cálculos rápidos
  category: 'widescreen' | 'vertical' | 'square' | 'portrait';
  safeZone: SafeZoneGuide; // Margens de segurança de interface
}

export const RESOLUTION_PRESETS: ResolutionPreset[] = [
  {
    id: '16-9-1080',
    label: '16:9 Widescreen Full HD',
    sublabel: '1920 × 1080 (YouTube, Desktop)',
    width: 1920,
    height: 1080,
    canonicalWidth: 1920,
    canonicalHeight: 1080,
    aspectRatio: '16 / 9',
    aspectRatioNum: 16 / 9,
    category: 'widescreen',
    safeZone: SAFE_ZONE_PRESETS['16:9'],
  },
  {
    id: '16-9-720',
    label: '16:9 Widescreen HD',
    sublabel: '1280 × 720 (YouTube, Rápido)',
    width: 1280,
    height: 720,
    canonicalWidth: 1920,
    canonicalHeight: 1080,
    aspectRatio: '16 / 9',
    aspectRatioNum: 16 / 9,
    category: 'widescreen',
    safeZone: SAFE_ZONE_PRESETS['16:9'],
  },
  {
    id: '9-16-1080',
    label: '9:16 Vertical Story / Reels',
    sublabel: '1080 × 1920 (TikTok, Shorts, Reels)',
    width: 1080,
    height: 1920,
    canonicalWidth: 1080,
    canonicalHeight: 1920,
    aspectRatio: '9 / 16',
    aspectRatioNum: 9 / 16,
    category: 'vertical',
    safeZone: SAFE_ZONE_PRESETS['9:16'],
  },
  {
    id: '1-1-1080',
    label: '1:1 Quadrado',
    sublabel: '1080 × 1080 (Instagram, LinkedIn)',
    width: 1080,
    height: 1080,
    canonicalWidth: 1080,
    canonicalHeight: 1080,
    aspectRatio: '1 / 1',
    aspectRatioNum: 1 / 1,
    category: 'square',
    safeZone: SAFE_ZONE_PRESETS['1:1'],
  },
  {
    id: '4-5-1080',
    label: '4:5 Retrato Feed',
    sublabel: '1080 × 1350 (Instagram Feed)',
    width: 1080,
    height: 1350,
    canonicalWidth: 1080,
    canonicalHeight: 1350,
    aspectRatio: '4 / 5',
    aspectRatioNum: 4 / 5,
    category: 'portrait',
    safeZone: SAFE_ZONE_PRESETS['4:5'],
  },
];

export const DEFAULT_RESOLUTION_PRESET = RESOLUTION_PRESETS[0];

/**
 * Calcula a escala proporcional perfeita para encaixar um palco canônico
 * dentro de um container mantendo margem segura e sem distorção.
 */
export function calculateCanonicalScale(
  parentWidth: number,
  parentHeight: number,
  canonicalWidth: number,
  canonicalHeight: number,
  padding: number = 24,
  marginFactor: number = 0.96
): number {
  if (parentWidth <= 0 || parentHeight <= 0 || canonicalWidth <= 0 || canonicalHeight <= 0) {
    return 0.5;
  }

  const availW = Math.max(40, parentWidth - padding);
  const availH = Math.max(40, parentHeight - padding);

  const scale = Math.min(availW / canonicalWidth, availH / canonicalHeight) * marginFactor;
  return Math.max(0.05, Math.min(1.0, scale));
}
