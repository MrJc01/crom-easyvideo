/**
 * Crom EasyVideo - Sistema Central de Tipografia & Safe Zones para Vídeo
 *
 * Mapeamento proporcional canônico para Motion Graphics:
 * Baseado no menor eixo (1080px) para garantir proporções visuais 1:1 idênticas
 * em 16:9 Widescreen (1920x1080), 9:16 Vertical (1080x1920) e 1:1 (1080x1080).
 */

export interface SafeZoneGuide {
  top: number;
  bottom: number;
  left: number;
  right: number;
  label: string;
}

export interface TypographyPreset {
  fontSizePx: number;
  fontSizeRelative: string;
  lineHeight: string;
  letterSpacing?: string;
  fontWeight: string;
}

/**
 * Tabela Canônica de Tipografia para Vídeo Full HD (Canvas Base 1080p / 1080x1920)
 * 1cqmin = 10.8px (1% do menor eixo de 1080px)
 */
export const VIDEO_TYPOGRAPHY = {
  // 1. Números Gigantes / Destaques Numéricos (ex: 405 Bilhões, 98.4%)
  megaStat: {
    fontSizePx: 140,
    fontSizeRelative: 'clamp(96px, 13cqmin, 160px)',
    lineHeight: '1.0',
    fontWeight: '900',
  },
  // 2. Título Hero / Gancho de Abertura (ex: Como Funcionam os LLMs)
  heroTitle: {
    fontSizePx: 72,
    fontSizeRelative: 'clamp(56px, 7.0cqmin, 84px)',
    lineHeight: '1.15',
    fontWeight: '900',
  },
  // 3. Título de Card / Cabeçalho de Conceito (ex: Pilha de Camadas Transformer)
  cardTitle: {
    fontSizePx: 52,
    fontSizeRelative: 'clamp(42px, 5.0cqmin, 62px)',
    lineHeight: '1.2',
    fontWeight: '800',
  },
  // 4. Subtítulo / Frase Focal / Citação (ex: Da matemática dos vetores aos Transformers)
  subtitle: {
    fontSizePx: 32,
    fontSizeRelative: 'clamp(26px, 3.2cqmin, 38px)',
    lineHeight: '1.4',
    fontWeight: '600',
  },
  // 5. Texto Corrido / Explicações / Definições
  body: {
    fontSizePx: 25,
    fontSizeRelative: 'clamp(22px, 2.5cqmin, 30px)',
    lineHeight: '1.5',
    fontWeight: '400',
  },
  // 6. Itens de Lista / Passos / Tópicos / Camadas
  cardItem: {
    fontSizePx: 23,
    fontSizeRelative: 'clamp(20px, 2.3cqmin, 27px)',
    lineHeight: '1.35',
    fontWeight: '600',
  },
  // 7. Badges Superiores / Categorias / Tags / Metadados
  badge: {
    fontSizePx: 18,
    fontSizeRelative: 'clamp(15px, 1.8cqmin, 20px)',
    lineHeight: '1.2',
    fontWeight: '700',
    letterSpacing: '0.08em',
  },
  // 8. Fórmulas Matemáticas / Snippets de Código
  code: {
    fontSizePx: 22,
    fontSizeRelative: 'clamp(18px, 2.2cqmin, 26px)',
    lineHeight: '1.5',
    fontWeight: '600',
  },
  // 9. Legendas de Rodapé / Licença / Menções
  footer: {
    fontSizePx: 16,
    fontSizeRelative: 'clamp(14px, 1.5cqmin, 18px)',
    lineHeight: '1.4',
    fontWeight: '500',
  },
} as const;

/**
 * Zonas Seguras Padronizadas por Aspect Ratio
 */
export const SAFE_ZONE_PRESETS: Record<string, SafeZoneGuide> = {
  '16:9': {
    top: 80,
    bottom: 80,
    left: 100,
    right: 100,
    label: 'YouTube / Desktop 16:9 (Title Safe 90%)',
  },
  '9:16': {
    top: 240,     // Margem superior para topo de busca e menu do app
    bottom: 380,  // Margem inferior para legendas do app, nome do canal e som
    left: 80,     // Margem esquerda
    right: 140,   // Margem direita para os botões de curtir, comentar e compartilhar
    label: 'TikTok / Reels / Shorts 9:16 (Área Central 900x1400)',
  },
  '1:1': {
    top: 80,
    bottom: 100,
    left: 80,
    right: 80,
    label: 'Feed Quadrado 1:1',
  },
  '4:5': {
    top: 120,
    bottom: 180,
    left: 80,
    right: 90,
    label: 'Instagram Feed Retrato 4:5',
  },
};
