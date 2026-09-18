import type { ProjectState } from './types';

export const INITIAL_PROJECT_STATE: ProjectState = {
  meta: {
    title: 'Como Funcionam os LLMs (Modelos de Linguagem Grande)',
    fps: 30,
    width: 1920,
    height: 1080,
  },
  cards: [
    {
      id: 'card-1',
      order: 0,
      templateId: 'hero-title',
      durationMode: 'auto',
      manualDurationInFrames: 120,
      manualDurationInSeconds: 4.0,
      audioPaddingEndInSeconds: 0.8,
      tts: {
        script:
          'Você já se perguntou como o ChatGPT conversa com tanta fluidez? [@sleep-1.5] Vamos desvendar a matemática por trás dos modelos de linguagem.',
        voiceId: 'pt-BR-Antonio',
        provider: 'browser-tts',
        speed: 1.0,
      },
      props: {
        showBadge: true,
        badge: 'DEEP DIVE TECNOLÓGICO',
        title: 'Como Funcionam os LLMs',
        showSubtitle: true,
        subtitle: 'Da probabilidade estatística à inteligência generativa moderna',
        accentColor: '#6366f1',
        glowColor: '#312e81',
      },
    },
    {
      id: 'card-2',
      order: 1,
      templateId: 'media-split-showcase',
      durationMode: 'auto',
      manualDurationInFrames: 150,
      manualDurationInSeconds: 5.0,
      audioPaddingEndInSeconds: 0.8,
      tts: {
        script:
          'Os modelos atuais combinam texto e visão computacional em tempo real. [@sleep-1.0] Veja como os dados são processados instantaneamente.',
        voiceId: 'pt-BR-Francisca',
        provider: 'browser-tts',
        speed: 1.0,
      },
      props: {
        showBadge: true,
        badge: 'INFERÊNCIA MULTIMODAL',
        title: 'Entrada Visual & Texto',
        media: {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
          trimStart: 0,
          trimEnd: 4,
          objectFit: 'cover',
        },
        bullets: [
          'Processamento de imagens por patches visuais',
          'Alinhamento no mesmo espaço vetorial semântico',
          'Respostas geradas com raciocínio contextual',
        ],
      },
    },
    {
      id: 'card-3',
      order: 2,
      templateId: 'concept-definition',
      durationMode: 'auto',
      manualDurationInFrames: 150,
      manualDurationInSeconds: 5.0,
      audioPaddingEndInSeconds: 0.8,
      tts: {
        script:
          'Na essência, um LLM é uma gigantesca calculadora de probabilidades. [@sleep-1.0] Ele foi treinado em terabytes de texto da internet.',
        voiceId: 'pt-BR-Antonio',
        provider: 'browser-tts',
        speed: 1.0,
      },
      props: {
        showTag: true,
        tag: 'FUNDAMENTOS',
        conceptTitle: 'O que é de fato um LLM?',
        statement:
          'Uma rede neural profunda projetada para prever estatisticamente o próximo pedaço de texto mais provável.',
        bulletPoints: [
          'Treinado em trilhões de palavras da internet',
          'Não pensa como humanos, calcula probabilidades',
          'Capaz de resumir, traduzir e programar com maestria',
        ],
      },
    },
    {
      id: 'card-4',
      order: 3,
      templateId: 'tokens-embeddings',
      durationMode: 'auto',
      manualDurationInFrames: 140,
      manualDurationInSeconds: 4.5,
      audioPaddingEndInSeconds: 0.8,
      tts: {
        script:
          'Eles não leem letras inteiras como nós. [@sleep-0.8] As palavras são fatiadas em tokens e convertidas em vetores numéricos de alta dimensão.',
        voiceId: 'pt-BR-Francisca',
        provider: 'browser-tts',
        speed: 1.0,
      },
      props: {
        title: 'Tokenização e Espaço Vetorial',
        sentence: 'A inteligência artificial transforma texto em números',
        tokens: 'A;intelig;ência;artific;ial;trans;forma;texto;em;números',
        showDimensions: true,
      },
    },
    {
      id: 'card-5',
      order: 4,
      templateId: 'attention-transformer',
      durationMode: 'auto',
      manualDurationInFrames: 160,
      manualDurationInSeconds: 5.2,
      audioPaddingEndInSeconds: 1.0,
      tts: {
        script:
          'O grande salto tecnológico foi a arquitetura Transformer em 2017. [@sleep-1.2] O mecanismo de atenção calcula o contexto entre termos distantes.',
        voiceId: 'pt-BR-Antonio',
        provider: 'browser-tts',
        speed: 1.0,
      },
      props: {
        title: 'Mecanismo de Atenção (Transformers)',
        description:
          'Cada palavra examina todas as outras simultaneamente para capturar nuances e referências complexas.',
        showFormula: true,
      },
    },
  ],
};
