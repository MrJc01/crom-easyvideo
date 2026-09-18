import type { TemplateDefinition } from '../core/types';

// Categoria 1: Abertura & Título (5 templates)
import { heroTitleTemplate } from './categories/abertura/hero-title';
import { bigHeadlineTemplate } from './categories/abertura/big-headline';
import { glitchCyberTemplate } from './categories/abertura/glitch-cyber';
import { minimalSplitTemplate } from './categories/abertura/minimal-split';
import { podcastIntroTemplate } from './categories/abertura/podcast-intro';

// Categoria 2: Mídia & Demonstração (7 templates)
import { mediaSplitShowcaseTemplate } from './categories/midia/media-split-showcase';
import { videoHeroBgTemplate } from './categories/midia/video-hero-bg';
import { deviceMockupTemplate } from './categories/midia/device-mockup';
import { pictureInPictureTemplate } from './categories/midia/picture-in-picture';
import { beforeAfterMediaTemplate } from './categories/midia/before-after-media';
import { mediaGalleryShowcaseTemplate } from './categories/midia/media-gallery-showcase';
import { browserFrameTemplate } from './categories/midia/browser-frame-showcase';

// Categoria 3: Conceitos & Explicações (6 templates)
import { conceptDefinitionTemplate } from './categories/conceitos/concept-definition';
import { questionDilemmaTemplate } from './categories/conceitos/question-dilemma';
import { quoteStatementTemplate } from './categories/conceitos/quote-statement';
import { factCheckTemplate } from './categories/conceitos/fact-check';
import { glossaryTermTemplate } from './categories/conceitos/glossary-term';
import { stepGuideModularTemplate } from './categories/conceitos/step-guide-modular';

// Categoria 4: Arquitetura & IA (6 templates)
import { tokensEmbeddingsTemplate } from './categories/arquitetura/tokens-embeddings';
import { attentionTransformerTemplate } from './categories/arquitetura/attention-transformer';
import { codeSnippetTemplate } from './categories/arquitetura/code-snippet';
import { layerStackTemplate } from './categories/arquitetura/layer-stack';
import { neuralGraphTemplate } from './categories/arquitetura/neural-graph';
import { systemArchitectureTemplate } from './categories/arquitetura/system-architecture';
import { deepDiveArchitectureTemplate } from './categories/arquitetura/deep-dive-architecture';

// Categoria 5: Dados, Métricas & Encerramento (7 templates)
import { comparativeMetricsTemplate } from './categories/metricas/comparative-metrics';
import { versusBattleTemplate } from './categories/metricas/versus-battle';
import { prosConsModularTemplate } from './categories/metricas/pros-cons-modular';
import { bigStatTemplate } from './categories/metricas/big-stat';
import { keyTakeawaysTemplate } from './categories/metricas/key-takeaways';
import { ctaSubscribeTemplate } from './categories/metricas/cta-subscribe';
import { creditsOutroTemplate } from './categories/metricas/credits-outro';

export const CARD_REGISTRY: Record<string, TemplateDefinition> = {};

export function registerTemplate(def: TemplateDefinition): void {
  CARD_REGISTRY[def.id] = def;
}

export function getTemplate(id: string): TemplateDefinition | undefined {
  return CARD_REGISTRY[id];
}

export function getAllTemplates(): TemplateDefinition[] {
  return Object.values(CARD_REGISTRY);
}

export function getTemplatesByCategory(category: string): TemplateDefinition[] {
  const all = getAllTemplates();
  if (category === 'Todos') return all;
  if (category === 'Customizados') {
    return all.filter((t) => t.id.startsWith('custom-') || t.category === 'Customizados');
  }
  return all.filter((t) => t.category === category);
}

export const TEMPLATE_CATEGORIES = [
  'Todos',
  'Customizados',
  'Abertura & Título',
  'Mídia & Demonstração',
  'Conceitos & Explicações',
  'Arquitetura & IA',
  'Dados, Métricas & Encerramento',
] as const;

// Registro dos 30 templates
const ALL_TEMPLATES: TemplateDefinition[] = [
  // Abertura & Título
  heroTitleTemplate,
  bigHeadlineTemplate,
  glitchCyberTemplate,
  minimalSplitTemplate,
  podcastIntroTemplate,

  // Mídia & Demonstração
  mediaSplitShowcaseTemplate,
  videoHeroBgTemplate,
  deviceMockupTemplate,
  pictureInPictureTemplate,
  beforeAfterMediaTemplate,
  mediaGalleryShowcaseTemplate,
  browserFrameTemplate,

  // Conceitos & Explicações
  conceptDefinitionTemplate,
  questionDilemmaTemplate,
  quoteStatementTemplate,
  factCheckTemplate,
  glossaryTermTemplate,
  stepGuideModularTemplate,

  // Arquitetura & IA
  tokensEmbeddingsTemplate,
  attentionTransformerTemplate,
  codeSnippetTemplate,
  layerStackTemplate,
  neuralGraphTemplate,
  systemArchitectureTemplate,
  deepDiveArchitectureTemplate,

  // Dados, Métricas & Encerramento
  comparativeMetricsTemplate,
  versusBattleTemplate,
  prosConsModularTemplate,
  bigStatTemplate,
  keyTakeawaysTemplate,
  ctaSubscribeTemplate,
  creditsOutroTemplate,
];

ALL_TEMPLATES.forEach(registerTemplate);
