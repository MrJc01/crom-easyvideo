import type { ProjectState } from './types';

export const INITIAL_PROJECT_STATE: ProjectState = {
  meta: {
    title: 'Arquitetura e Fundamentos de Modelos de Linguagem',
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
      manualDurationInFrames: 240,
      manualDurationInSeconds: 8.0,
      audioPaddingEndInSeconds: 0.8,
      audio: {
        mode: 'tts',
        script:
          'Como funcionam os modelos de linguagem de grande escala? [@sleep-0.6] Conheça os fundamentos e a matemática dos Transformers.',
        voiceId: 'pt-BR-Antonio',
        provider: 'browser-tts',
        speed: 1.0,
        audioDurationInSeconds: 7.2,
      },
      tts: {
        script:
          'Como funcionam os modelos de linguagem de grande escala? [@sleep-0.6] Conheça os fundamentos e a matemática dos Transformers.',
        voiceId: 'pt-BR-Antonio',
        provider: 'browser-tts',
        speed: 1.0,
        audioDurationInSeconds: 7.2,
      },
      props: {
        showBadge: true,
        badge: 'ARQUITETURA DE IA',
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
      manualDurationInFrames: 210,
      manualDurationInSeconds: 7.0,
      audioPaddingEndInSeconds: 0.8,
      audio: {
        mode: 'tts',
        script:
          'A inferência multimodal processa texto e visão em tempo real, projetando dados no mesmo espaço vetorial semântico.',
        voiceId: 'pt-BR-Francisca',
        provider: 'browser-tts',
        speed: 1.0,
        audioDurationInSeconds: 6.5,
      },
      tts: {
        script:
          'A inferência multimodal processa texto e visão em tempo real, projetando dados no mesmo espaço vetorial semântico.',
        voiceId: 'pt-BR-Francisca',
        provider: 'browser-tts',
        speed: 1.0,
        audioDurationInSeconds: 6.5,
      },
      props: {
        showBadge: true,
        badge: 'INFERÊNCIA MULTIMODAL',
        title: 'Entrada Visual e Linguagem',
        media: {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
          trimStart: 0,
          trimEnd: 4,
          objectFit: 'cover',
        },
        bullets: [
          'Decomposição de imagens em patches vetoriais',
          'Projeção linear no espaço semântico comum',
          'Atenção cruzada entre visão e texto',
        ],
      },
    },
    {
      id: 'card-3',
      order: 2,
      templateId: 'concept-definition',
      durationMode: 'auto',
      manualDurationInFrames: 210,
      manualDurationInSeconds: 7.0,
      audioPaddingEndInSeconds: 0.8,
      audio: {
        mode: 'tts',
        script:
          'Redes neurais profundas calculam probabilidades contextuais para prever a próxima palavra com alta precisão estatística.',
        voiceId: 'pt-BR-Antonio',
        provider: 'browser-tts',
        speed: 1.0,
        audioDurationInSeconds: 6.4,
      },
      tts: {
        script:
          'Redes neurais profundas calculam probabilidades contextuais para prever a próxima palavra com alta precisão estatística.',
        voiceId: 'pt-BR-Antonio',
        provider: 'browser-tts',
        speed: 1.0,
        audioDurationInSeconds: 6.4,
      },
      props: {
        showTag: true,
        tag: 'FUNDAMENTOS',
        conceptTitle: 'Definição Estrutural',
        statement:
          'Rede neural profunda orientada a modelar distribuições de probabilidade condicionais sobre sequências de símbolos discretos.',
        bulletPoints: [
          'Treinamento massivo em corpus multilíngue',
          'Mecanismo de auto-atenção com paralelismo nativo',
          'Generalização emergente para múltiplas tarefas cognitivas',
        ],
      },
    },
  ],
};

export default INITIAL_PROJECT_STATE;
