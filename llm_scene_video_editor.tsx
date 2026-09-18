import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  createContext,
  useContext,
} from 'react';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'color'
  | 'select'
  | 'number'
  | 'toggle'
  | 'media'
  | 'array';

export interface MediaAsset {
  type: 'image' | 'video';
  url: string;
  name?: string;
  duration?: number;
  trimStart: number;
  trimEnd: number;
  objectFit: 'cover' | 'contain' | 'fill';
  volume?: number;
}

export interface FieldDefinition {
  name: string;
  label: string;
  type: FieldType;
  defaultValue: any;
  options?: { label: string; value: string }[];
  placeholder?: string;
  description?: string;
  itemLabel?: string;
  itemDefaultValue?: any;
}

export interface VideoCard {
  id: string;
  order: number;
  templateId: string;
  durationMode: 'auto' | 'manual';
  manualDurationInFrames: number;
  manualDurationInSeconds?: number;
  audioPaddingEndInSeconds: number;
  tts: {
    script: string;
    voiceId: string;
    provider: 'elevenlabs' | 'openai' | 'browser-tts';
    speed: number;
    audioUrl?: string;
    audioDurationInSeconds?: number;
  };
  props: Record<string, any>;
}

export interface ProjectState {
  meta: {
    title: string;
    fps: number;
    width: number;
    height: number;
  };
  cards: VideoCard[];
}

export interface TemplateDefinition {
  id: string;
  name: string;
  category:
    | 'Abertura & Título'
    | 'Mídia & Demonstração'
    | 'Conceitos & Explicações'
    | 'Arquitetura & IA'
    | 'Dados, Métricas & Encerramento';
  description: string;
  iconName: string;
  defaultProps: Record<string, any>;
  schema: FieldDefinition[];
  Component: React.FC<{ props: Record<string, any>; frame: number; fps: number }>;
}

export interface CalculatedCard extends VideoCard {
  durationInFrames: number;
  startFrame: number;
  endFrame: number;
  totalDurationInSeconds: number;
}

export const Icons = {
  Play: () => (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  ),
  Pause: () => (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  ),
  SkipBack: () => (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
    </svg>
  ),
  SkipForward: () => (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  ),
  Copy: () => (
    <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  ),
  Download: () => (
    <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  ),
  Upload: () => (
    <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
      />
    </svg>
  ),
  Clock: () => (
    <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
    </svg>
  ),
  Mic: () => (
    <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 11a7 7 0 01-14 0m7 7v4m-4 0h8m-4-11a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3z"
      />
    </svg>
  ),
  Sparkles: () => (
    <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.286L13 21l-2.286-6.857L5 12l5.714-2.286L13 3z"
      />
    </svg>
  ),
  Layers: () => (
    <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
      />
    </svg>
  ),
  Cpu: () => (
    <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M9 9h6v6H9zM9 1v3m6-3v3m-6 16v3m6-3v3M1 9h3m-3 6h3m16-6h3m-3 6h3" />
    </svg>
  ),
  Code: () => (
    <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  BarChart: () => (
    <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 20V10m-6 10V4M6 20v-6" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  Close: () => (
    <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Film: () => (
    <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
      <path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5m10-10h5m-5 10h5" />
    </svg>
  ),
  Eye: () => (
    <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  ),
  EyeOff: () => (
    <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18"
      />
    </svg>
  ),
  Video: () => (
    <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  Image: () => (
    <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  Scissors: () => (
    <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  ),
};

export const TemplateIconMap: Record<string, React.FC> = {
  hero: Icons.Sparkles,
  code: Icons.Code,
  cpu: Icons.Cpu,
  layers: Icons.Layers,
  chart: Icons.BarChart,
  film: Icons.Film,
  video: Icons.Video,
  image: Icons.Image,
};

export function spring({
  frame,
  fps = 30,
  config = { damping: 12, mass: 0.5, stiffness: 100 },
}: {
  frame: number;
  fps?: number;
  config?: { damping?: number; mass?: number; stiffness?: number };
}): number {
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

export function interpolate(
  input: number,
  inputRange: [number, number],
  outputRange: [number, number],
  options?: { extrapolateLeft?: 'clamp' | 'identity'; extrapolateRight?: 'clamp' | 'identity' }
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

export interface ParsedScriptResult {
  cleanText: string;
  totalSleepSeconds: number;
  speechEstimatedSeconds: number;
  totalDurationSeconds: number;
  segments: Array<{ type: 'speech' | 'sleep'; text?: string; sleepDuration?: number }>;
}

export function parseScriptAndDelays(rawScript: string, speed: number = 1.0): ParsedScriptResult {
  if (!rawScript || !rawScript.trim()) {
    return {
      cleanText: '',
      totalSleepSeconds: 0,
      speechEstimatedSeconds: 0,
      totalDurationSeconds: 2.5,
      segments: [],
    };
  }

  const sleepTagRegex = /\[@sleep-(\d+(?:\.\d+)?)\]/gi;
  let totalSleep = 0;
  const segments: Array<{ type: 'speech' | 'sleep'; text?: string; sleepDuration?: number }> = [];

  let lastIndex = 0;
  let match;

  while ((match = sleepTagRegex.exec(rawScript)) !== null) {
    const speechPart = rawScript.slice(lastIndex, match.index).trim();
    if (speechPart) {
      segments.push({ type: 'speech', text: speechPart });
    }
    const sleepDuration = parseFloat(match[1]) || 0;
    totalSleep += sleepDuration;
    segments.push({ type: 'sleep', sleepDuration });
    lastIndex = sleepTagRegex.lastIndex;
  }

  const remaining = rawScript.slice(lastIndex).trim();
  if (remaining) {
    segments.push({ type: 'speech', text: remaining });
  }

  const cleanText = rawScript
    .replace(/\[@sleep-(\d+(?:\.\d+)?)\]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const words = cleanText ? cleanText.split(/\s+/).length : 0;
  const speechEstimatedSeconds = words > 0 ? words / (2.4 * Math.max(0.5, speed)) : 0;
  const totalDurationSeconds = Math.max(
    1.5,
    Math.round((speechEstimatedSeconds + totalSleep) * 10) / 10
  );

  return {
    cleanText,
    totalSleepSeconds: totalSleep,
    speechEstimatedSeconds: Math.round(speechEstimatedSeconds * 10) / 10,
    totalDurationSeconds,
    segments,
  };
}

export function calculateTimeline(
  cards: VideoCard[],
  fps: number
): {
  calculatedCards: CalculatedCard[];
  totalFrames: number;
} {
  let currentStart = 0;

  const calculatedCards: CalculatedCard[] = cards.map((card) => {
    let durationInFrames = 90;
    let totalDurationInSeconds = 3.0;

    if (card.durationMode === 'auto') {
      const parsed = parseScriptAndDelays(card.tts?.script || '', card.tts?.speed || 1.0);
      const audioDuration = card.tts?.audioDurationInSeconds || parsed.totalDurationSeconds;
      const padding = card.audioPaddingEndInSeconds ?? 0.8;
      totalDurationInSeconds = audioDuration + padding;
      durationInFrames = Math.max(30, Math.ceil(totalDurationInSeconds * fps));
    } else {
      durationInFrames =
        card.manualDurationInFrames ||
        Math.max(30, Math.ceil((card.manualDurationInSeconds || 3) * fps));
      totalDurationInSeconds = durationInFrames / fps;
    }

    const startFrame = currentStart;
    const endFrame = startFrame + durationInFrames;
    currentStart = endFrame;

    return {
      ...card,
      durationInFrames,
      startFrame,
      endFrame,
      totalDurationInSeconds: Math.round(totalDurationInSeconds * 10) / 10,
    };
  });

  return {
    calculatedCards,
    totalFrames: Math.max(1, currentStart),
  };
}

export const MediaRenderer: React.FC<{
  media?: MediaAsset;
  frame: number;
  fps: number;
  className?: string;
  placeholderText?: string;
}> = ({ media, frame, fps, className = '', placeholderText = 'Sem mídia configurada' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!media || media.type !== 'video' || !videoRef.current) return;
    const trimStart = media.trimStart || 0;
    const trimEnd = media.trimEnd && media.trimEnd > trimStart ? media.trimEnd : 9999;
    const localSec = frame / fps;
    let targetTime = trimStart + localSec;

    if (targetTime > trimEnd) {
      targetTime = trimEnd;
    }

    if (Math.abs(videoRef.current.currentTime - targetTime) > 0.08) {
      videoRef.current.currentTime = targetTime;
    }
  }, [frame, fps, media]);

  if (!media || !media.url) {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center bg-slate-900/60 border border-dashed border-slate-700/80 rounded-2xl p-6 text-slate-500 text-center ${className}`}
      >
        <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-400 mb-2">
          <Icons.Video />
        </div>
        <span className="text-xs font-medium">{placeholderText}</span>
        <span className="text-[10px] text-slate-500 mt-1">Carregue imagem ou vídeo no painel lateral</span>
      </div>
    );
  }

  if (media.type === 'video') {
    return (
      <div className={`relative w-full h-full overflow-hidden rounded-2xl bg-black ${className}`}>
        <video
          ref={videoRef}
          src={media.url}
          muted={true}
          playsInline
          className={`w-full h-full object-${media.objectFit || 'cover'}`}
        />
        <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-indigo-300 border border-slate-800 pointer-events-none">
          Trim: {media.trimStart}s - {media.trimEnd ? `${media.trimEnd}s` : 'Max'}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden rounded-2xl ${className}`}>
      <img
        src={media.url}
        alt="Template Asset"
        className={`w-full h-full object-${media.objectFit || 'cover'}`}
      />
    </div>
  );
};

export const CARD_REGISTRY: Record<string, TemplateDefinition> = {};

function registerTemplate(def: TemplateDefinition) {
  CARD_REGISTRY[def.id] = def;
}

// 1. Hero Title Tech
registerTemplate({
  id: 'hero-title',
  name: 'Hero Title Tech',
  category: 'Abertura & Título',
  description: 'Abertura de impacto cinematográfico com badge dinâmico e visibilidade modular.',
  iconName: 'hero',
  defaultProps: {
    showBadge: true,
    badge: 'DEEP DIVE TECNOLÓGICO',
    title: 'Como Funcionam os LLMs',
    showSubtitle: true,
    subtitle: 'Da matemática dos vetores à revolução dos Transformers modernos',
    accentColor: '#6366f1',
    glowColor: '#312e81',
  },
  schema: [
    { name: 'showBadge', label: 'Exibir Badge Superior', type: 'toggle', defaultValue: true },
    { name: 'badge', label: 'Texto do Badge', type: 'text', defaultValue: 'DEEP DIVE TECNOLÓGICO' },
    { name: 'title', label: 'Título Principal', type: 'text', defaultValue: 'Como Funcionam os LLMs' },
    { name: 'showSubtitle', label: 'Exibir Subtítulo', type: 'toggle', defaultValue: true },
    { name: 'subtitle', label: 'Subtítulo', type: 'textarea', defaultValue: 'Da matemática dos vetores...' },
    { name: 'accentColor', label: 'Cor de Destaque', type: 'color', defaultValue: '#6366f1' },
    { name: 'glowColor', label: 'Cor de Fundo Glow', type: 'color', defaultValue: '#312e81' },
  ],
  Component: ({ props, frame, fps }) => {
    const badgeS = spring({ frame: frame - 2, fps });
    const titleS = spring({ frame: frame - 6, fps });
    const subS = spring({ frame: frame - 12, fps });
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center p-12 text-center relative overflow-hidden select-none"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${props.glowColor || '#312e81'} 0%, #030712 85%)`,
        }}
      >
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px]" />
        {props.showBadge && (
          <div
            className="px-4 py-1.5 rounded-full border border-indigo-500/40 bg-indigo-950/60 text-indigo-300 font-mono text-xs font-semibold tracking-wider mb-6 flex items-center gap-2 shadow-lg"
            style={{ transform: `scale(${badgeS})`, opacity: badgeS }}
          >
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            {props.badge}
          </div>
        )}
        <h1
          className="text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl drop-shadow-2xl"
          style={{ transform: `translateY(${(1 - titleS) * 30}px) scale(${titleS})`, opacity: titleS }}
        >
          {props.title}
        </h1>
        {props.showSubtitle && (
          <p
            className="text-lg md:text-xl text-slate-300 max-w-2xl mt-6 font-normal leading-relaxed"
            style={{ transform: `translateY(${(1 - subS) * 20}px)`, opacity: subS }}
          >
            {props.subtitle}
          </p>
        )}
      </div>
    );
  },
});

// 2. Bold Headline
registerTemplate({
  id: 'big-headline',
  name: 'Headline Impactante',
  category: 'Abertura & Título',
  description: 'Frase de alto impacto com tipografia superdimensionada e barra decorativa.',
  iconName: 'hero',
  defaultProps: {
    showKicker: true,
    kicker: 'MUDANÇA DE PARADIGMA',
    headline: 'O Fim da Busca Tradicional',
    accent: '#ec4899',
    showAccentBar: true,
  },
  schema: [
    { name: 'showKicker', label: 'Exibir Chamada Curta', type: 'toggle', defaultValue: true },
    { name: 'kicker', label: 'Chamada Curta', type: 'text', defaultValue: 'MUDANÇA DE PARADIGMA' },
    { name: 'headline', label: 'Manchete Principal', type: 'text', defaultValue: 'O Fim da Busca Tradicional' },
    { name: 'showAccentBar', label: 'Exibir Barra de Destaque', type: 'toggle', defaultValue: true },
    { name: 'accent', label: 'Cor de Destaque', type: 'color', defaultValue: '#ec4899' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 4, fps });
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-start p-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        {props.showKicker && (
          <span
            className="text-sm font-mono tracking-widest text-pink-400 uppercase font-semibold mb-4"
            style={{ opacity: s }}
          >
            // {props.kicker}
          </span>
        )}
        <h1
          className="text-6xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none max-w-4xl"
          style={{ transform: `scale(${s})`, opacity: s }}
        >
          {props.headline}
        </h1>
        {props.showAccentBar && (
          <div
            className="h-2 rounded-full mt-8"
            style={{ width: `${s * 240}px`, backgroundColor: props.accent }}
          />
        )}
      </div>
    );
  },
});

// 3. Cyberpunk Terminal
registerTemplate({
  id: 'glitch-cyber',
  name: 'Terminal Cyberpunk',
  category: 'Abertura & Título',
  description: 'Estilo sci-fi com gradiente neon, estética de console e status animado.',
  iconName: 'hero',
  defaultProps: {
    systemTag: 'SYS_BOOT // MODEL_INITIALIZE',
    header: 'NEURAL WEIGHTS LOADED',
    subtext: '175 bilhões de parâmetros prontos para inferência imediata.',
    showLiveIndicator: true,
  },
  schema: [
    { name: 'systemTag', label: 'Tag do Sistema', type: 'text', defaultValue: 'SYS_BOOT // MODEL_INITIALIZE' },
    { name: 'header', label: 'Cabeçalho Terminal', type: 'text', defaultValue: 'NEURAL WEIGHTS LOADED' },
    { name: 'subtext', label: 'Subtexto Informativo', type: 'textarea', defaultValue: '175 bilhões de parâmetros...' },
    { name: 'showLiveIndicator', label: 'Exibir Indicador Online', type: 'toggle', defaultValue: true },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 3, fps });
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-12 relative overflow-hidden font-mono">
        <div
          className="w-full max-w-3xl border border-emerald-500/30 bg-emerald-950/20 rounded-2xl p-8 shadow-2xl backdrop-blur-md"
          style={{ transform: `scale(${s})`, opacity: s }}
        >
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3 mb-6 text-xs text-emerald-400">
            <span>{props.systemTag}</span>
            {props.showLiveIndicator && <span className="animate-pulse font-bold">ONLINE</span>}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-wide">{props.header}</h2>
          <p className="text-slate-400 mt-4 text-sm font-sans">{props.subtext}</p>
        </div>
      </div>
    );
  },
});

// 4. Minimal Split Screen
registerTemplate({
  id: 'minimal-split',
  name: 'Minimal Split Titular',
  category: 'Abertura & Título',
  description: 'Divisão em 2 colunas para contrapor categoria e mensagem focal.',
  iconName: 'layers',
  defaultProps: {
    category: 'ARQUITETURA',
    leftTitle: 'Processamento Paralelo',
    rightDescription:
      'Diferente das RNNs sequenciais, os Transformers analisam todas as palavras ao mesmo tempo.',
  },
  schema: [
    { name: 'category', label: 'Categoria', type: 'text', defaultValue: 'ARQUITETURA' },
    { name: 'leftTitle', label: 'Título Esquerdo', type: 'text', defaultValue: 'Processamento Paralelo' },
    { name: 'rightDescription', label: 'Texto Direito', type: 'textarea', defaultValue: 'Diferente das RNNs...' },
  ],
  Component: ({ props, frame, fps }) => {
    const leftS = spring({ frame: frame - 4, fps });
    const rightS = spring({ frame: frame - 10, fps });
    return (
      <div className="w-full h-full bg-slate-950 grid grid-cols-2 p-14 gap-8 items-center relative">
        <div
          className="border-r border-slate-800 pr-8"
          style={{ opacity: leftS, transform: `translateX(${(1 - leftS) * -30}px)` }}
        >
          <span className="text-xs font-mono text-cyan-400 tracking-widest uppercase">
            {props.category}
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mt-4 leading-tight">
            {props.leftTitle}
          </h2>
        </div>
        <div
          className="pl-6"
          style={{ opacity: rightS, transform: `translateX(${(1 - rightS) * 30}px)` }}
        >
          <p className="text-xl text-slate-300 leading-relaxed font-light">{props.rightDescription}</p>
        </div>
      </div>
    );
  },
});

// 5. Podcast Intro
registerTemplate({
  id: 'podcast-intro',
  name: 'Banner Podcast / Talk',
  category: 'Abertura & Título',
  description: 'Visual moderno para abertura de podcasts e entrevistas técnicas.',
  iconName: 'film',
  defaultProps: {
    episode: 'EPISÓDIO 42',
    topic: 'Como a Inteligência Artificial Conquistou a Linguagem',
    host: 'Apresentado por IA Studio',
  },
  schema: [
    { name: 'episode', label: 'Tag / Episódio', type: 'text', defaultValue: 'EPISÓDIO 42' },
    { name: 'topic', label: 'Tema Principal', type: 'textarea', defaultValue: 'Como a Inteligência Artificial...' },
    { name: 'host', label: 'Apresentador', type: 'text', defaultValue: 'Apresentado por IA Studio' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 5, fps });
    return (
      <div className="w-full h-full bg-slate-950 flex items-center justify-center p-14 relative">
        <div
          className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-10 shadow-2xl text-center"
          style={{ transform: `scale(${s})`, opacity: s }}
        >
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono text-xs font-bold uppercase">
            {props.episode}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-6 mb-6 leading-tight">
            {props.topic}
          </h2>
          <span className="text-xs font-mono text-slate-400 tracking-wider uppercase">
            {props.host}
          </span>
        </div>
      </div>
    );
  },
});

// 6. Media Split Showcase
registerTemplate({
  id: 'media-split-showcase',
  name: 'Split Mídia & Explicação',
  category: 'Mídia & Demonstração',
  description:
    'Lado a lado com imagem ou vídeo com controle de corte (trim) e lista de tópicos modular.',
  iconName: 'video',
  defaultProps: {
    title: 'Demonstração Prática',
    badge: 'AO VIVO',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
      trimStart: 0,
      trimEnd: 5,
      objectFit: 'cover',
    },
    bullets: [
      'Execução em tempo real no browser',
      'Sincronização de frames com Remotion Player',
      'Suporte a vídeo cortado e imagens em alta definição',
    ],
    showBadge: true,
  },
  schema: [
    { name: 'showBadge', label: 'Exibir Badge', type: 'toggle', defaultValue: true },
    { name: 'badge', label: 'Texto do Badge', type: 'text', defaultValue: 'AO VIVO' },
    { name: 'title', label: 'Título do Destaque', type: 'text', defaultValue: 'Demonstração Prática' },
    { name: 'media', label: 'Mídia (Vídeo ou Imagem)', type: 'media', defaultValue: null },
    {
      name: 'bullets',
      label: 'Tópicos Dinâmicos',
      type: 'array',
      itemLabel: 'Tópico',
      itemDefaultValue: 'Novo tópico explicativo',
      defaultValue: ['Tópico 1', 'Tópico 2'],
    },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 2, fps });
    const bullets = Array.isArray(props.bullets) ? props.bullets : [];
    return (
      <div className="w-full h-full bg-slate-950 grid grid-cols-12 p-10 gap-8 items-center">
        <div className="col-span-6 h-full flex flex-col justify-center" style={{ opacity: s }}>
          {props.showBadge && (
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-mono font-bold uppercase w-max mb-3">
              {props.badge}
            </span>
          )}
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6 leading-tight">
            {props.title}
          </h2>
          <div className="space-y-3">
            {bullets.map((b: string, i: number) => {
              const bS = spring({ frame: frame - 8 - i * 4, fps });
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200"
                  style={{ transform: `translateX(${(1 - bS) * 20}px)`, opacity: bS }}
                >
                  <div className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <Icons.Check />
                  </div>
                  <span>{b}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="col-span-6 h-full flex items-center justify-center">
          <div className="w-full h-[360px] shadow-2xl rounded-2xl overflow-hidden border border-slate-800">
            <MediaRenderer media={props.media} frame={frame} fps={fps} />
          </div>
        </div>
      </div>
    );
  },
});

// 7. Video Hero Background
registerTemplate({
  id: 'video-hero-bg',
  name: 'Vídeo Hero Background',
  category: 'Mídia & Demonstração',
  description: 'Vídeo em tela cheia com overlay ajustável e tipografia de título animada.',
  iconName: 'film',
  defaultProps: {
    media: {
      type: 'video',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      trimStart: 1,
      trimEnd: 6,
      objectFit: 'cover',
    },
    title: 'Visão Computacional & LLMs Multimodais',
    subtitle: 'Processamento simultâneo de frames de vídeo e texto.',
    overlayOpacity: 65,
    showSubtitle: true,
  },
  schema: [
    { name: 'media', label: 'Vídeo de Fundo', type: 'media', defaultValue: null },
    { name: 'title', label: 'Título', type: 'text', defaultValue: 'Visão Computacional' },
    { name: 'showSubtitle', label: 'Exibir Subtítulo', type: 'toggle', defaultValue: true },
    { name: 'subtitle', label: 'Subtítulo', type: 'textarea', defaultValue: 'Processamento simultâneo...' },
    { name: 'overlayOpacity', label: 'Opacidade do Escurecimento (%)', type: 'number', defaultValue: 65 },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 4, fps });
    return (
      <div className="w-full h-full relative overflow-hidden bg-black flex items-center justify-center p-12 text-center">
        <div className="absolute inset-0 z-0">
          <MediaRenderer media={props.media} frame={frame} fps={fps} />
        </div>
        <div
          className="absolute inset-0 z-10 bg-slate-950"
          style={{ opacity: (props.overlayOpacity || 60) / 100 }}
        />
        <div className="relative z-20 max-w-4xl" style={{ transform: `scale(${s})`, opacity: s }}>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
            {props.title}
          </h1>
          {props.showSubtitle && (
            <p className="text-base md:text-lg text-slate-200 mt-4 max-w-2xl mx-auto leading-relaxed drop-shadow">
              {props.subtitle}
            </p>
          )}
        </div>
      </div>
    );
  },
});

// 8. Device Mockup Demo
registerTemplate({
  id: 'device-mockup',
  name: 'Device Mockup (App / Web)',
  category: 'Mídia & Demonstração',
  description: 'Simulador de tela de smartphone ou notebook com gravação de tela dentro.',
  iconName: 'video',
  defaultProps: {
    headline: 'Interface do Usuário',
    subtext: 'Demonstração da experiência interativa em tempo real.',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80',
      trimStart: 0,
      trimEnd: 4,
      objectFit: 'cover',
    },
  },
  schema: [
    { name: 'headline', label: 'Título do Destaque', type: 'text', defaultValue: 'Interface do Usuário' },
    { name: 'subtext', label: 'Subtexto', type: 'textarea', defaultValue: 'Demonstração...' },
    { name: 'media', label: 'Mídia da Tela', type: 'media', defaultValue: null },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 4, fps });
    return (
      <div className="w-full h-full bg-slate-950 grid grid-cols-12 p-12 gap-8 items-center">
        <div className="col-span-5" style={{ opacity: s }}>
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block mb-2">
            MOCKUP INTERATIVO
          </span>
          <h2 className="text-3xl font-extrabold text-white mb-4 leading-tight">{props.headline}</h2>
          <p className="text-sm text-slate-300 leading-relaxed">{props.subtext}</p>
        </div>
        <div className="col-span-7 flex justify-center">
          <div
            className="w-full max-w-md bg-slate-900 border-4 border-slate-700 rounded-3xl p-2 shadow-2xl aspect-[16/10] flex flex-col"
            style={{ transform: `scale(${s})`, opacity: s }}
          >
            <div className="flex items-center gap-1.5 px-3 py-1 border-b border-slate-800">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <div className="flex-1 overflow-hidden rounded-xl mt-1">
              <MediaRenderer media={props.media} frame={frame} fps={fps} />
            </div>
          </div>
        </div>
      </div>
    );
  },
});

// 9. Picture in Picture (PiP)
registerTemplate({
  id: 'picture-in-picture',
  name: 'Picture-in-Picture (PiP)',
  category: 'Mídia & Demonstração',
  description: 'Layout para reação ou demonstração com janela flutuante recortada.',
  iconName: 'video',
  defaultProps: {
    mainTitle: 'Arquitetura Multimodal',
    explanation: 'Modelos de linguagem agora integram fluxos de vídeo ao vivo com raciocínio contextual.',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
      trimStart: 0,
      trimEnd: 4,
      objectFit: 'cover',
    },
    pipLabel: 'Câmera / Demonstração',
  },
  schema: [
    { name: 'mainTitle', label: 'Título Principal', type: 'text', defaultValue: 'Arquitetura Multimodal' },
    { name: 'explanation', label: 'Explicação', type: 'textarea', defaultValue: 'Modelos de linguagem...' },
    { name: 'pipLabel', label: 'Etiqueta da Janela PiP', type: 'text', defaultValue: 'Câmera / Demonstração' },
    { name: 'media', label: 'Mídia Flutuante (PiP)', type: 'media', defaultValue: null },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 4, fps });
    const pipS = spring({ frame: frame - 10, fps });
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-start p-16 relative">
        <div className="max-w-2xl" style={{ opacity: s }}>
          <h2 className="text-4xl font-extrabold text-white mb-4">{props.mainTitle}</h2>
          <p className="text-base text-slate-300 leading-relaxed">{props.explanation}</p>
        </div>
        <div
          className="absolute bottom-10 right-10 w-72 h-44 bg-slate-900 border-2 border-indigo-500 rounded-2xl shadow-2xl overflow-hidden"
          style={{ transform: `scale(${pipS})`, opacity: pipS }}
        >
          <div className="absolute top-2 left-2 z-10 bg-black/80 px-2 py-0.5 rounded text-[9px] font-mono text-indigo-300">
            {props.pipLabel}
          </div>
          <MediaRenderer media={props.media} frame={frame} fps={fps} />
        </div>
      </div>
    );
  },
});

// 10. Before / After Comparison
registerTemplate({
  id: 'before-after-media',
  name: 'Comparativo Antes vs Depois',
  category: 'Mídia & Demonstração',
  description: 'Compara duas imagens ou fluxos com etiquetas personalizadas.',
  iconName: 'video',
  defaultProps: {
    title: 'Transformação de Dados',
    labelBefore: 'Entrada Bruta (Texto Desestruturado)',
    labelAfter: 'Saída Estruturada (JSON / Ações)',
    beforeText: 'Logs e relatórios manuais de 100 páginas sem índice.',
    afterText: 'Extração automática em schema estrito em menos de 2 segundos.',
  },
  schema: [
    { name: 'title', label: 'Título', type: 'text', defaultValue: 'Transformação de Dados' },
    { name: 'labelBefore', label: 'Rótulo Antes', type: 'text', defaultValue: 'Entrada Bruta' },
    { name: 'beforeText', label: 'Descrição Antes', type: 'textarea', defaultValue: 'Logs e relatórios...' },
    { name: 'labelAfter', label: 'Rótulo Depois', type: 'text', defaultValue: 'Saída Estruturada' },
    { name: 'afterText', label: 'Descrição Depois', type: 'textarea', defaultValue: 'Extração automática...' },
  ],
  Component: ({ props, frame, fps }) => {
    const s1 = spring({ frame: frame - 4, fps });
    const s2 = spring({ frame: frame - 10, fps });
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-12">
        <h2 className="text-3xl font-extrabold text-white mb-8">{props.title}</h2>
        <div className="grid grid-cols-2 gap-8 max-w-4xl w-full">
          <div
            className="bg-rose-950/20 border border-rose-800/40 rounded-2xl p-6"
            style={{ transform: `scale(${s1})`, opacity: s1 }}
          >
            <span className="text-xs font-mono text-rose-400 font-bold uppercase block mb-3">
              {props.labelBefore}
            </span>
            <p className="text-sm text-slate-300">{props.beforeText}</p>
          </div>
          <div
            className="bg-emerald-950/20 border border-emerald-800/40 rounded-2xl p-6"
            style={{ transform: `scale(${s2})`, opacity: s2 }}
          >
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase block mb-3">
              {props.labelAfter}
            </span>
            <p className="text-sm text-slate-300">{props.afterText}</p>
          </div>
        </div>
      </div>
    );
  },
});

// 11. Media Gallery Showcase
registerTemplate({
  id: 'media-gallery-showcase',
  name: 'Galeria de Destaque',
  category: 'Mídia & Demonstração',
  description: 'Exibe uma imagem principal com moldura técnica e dados de inferência.',
  iconName: 'image',
  defaultProps: {
    title: 'Visualização de Tensores',
    caption: 'Espaço latente gerado por redes neurais generativas.',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1000&q=80',
      trimStart: 0,
      trimEnd: 4,
      objectFit: 'cover',
    },
  },
  schema: [
    { name: 'title', label: 'Título', type: 'text', defaultValue: 'Visualização de Tensores' },
    { name: 'caption', label: 'Legenda Técnica', type: 'textarea', defaultValue: 'Espaço latente...' },
    { name: 'media', label: 'Imagem / Mídia', type: 'media', defaultValue: null },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 4, fps });
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-10 text-center">
        <h3 className="text-2xl font-bold text-white mb-2">{props.title}</h3>
        <p className="text-xs text-slate-400 mb-6 max-w-md">{props.caption}</p>
        <div
          className="w-full max-w-2xl h-64 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl"
          style={{ transform: `scale(${s})`, opacity: s }}
        >
          <MediaRenderer media={props.media} frame={frame} fps={fps} />
        </div>
      </div>
    );
  },
});

// 12. Concept Definition (Modular Arrays & Toggles)
registerTemplate({
  id: 'concept-definition',
  name: 'Definição & Tópicos Modulares',
  category: 'Conceitos & Explicações',
  description:
    'Definição conceitual com lista dinâmica de tópicos (adicionar e remover itens dinamicamente).',
  iconName: 'layers',
  defaultProps: {
    showTag: true,
    tag: 'CONCEITO FUNDAMENTAL',
    conceptTitle: 'O que é um LLM?',
    statement:
      'Um Large Language Model é uma rede neural artificial profunda treinada para capturar padrões probabilísticos na linguagem humana.',
    bulletPoints: [
      'Modelos treinados em terabytes de dados da internet',
      'Predizem a próxima palavra com base em contexto estatístico',
      'Base da arquitetura Transformer lançada em 2017',
    ],
  },
  schema: [
    { name: 'showTag', label: 'Exibir Tag', type: 'toggle', defaultValue: true },
    { name: 'tag', label: 'Tag Superior', type: 'text', defaultValue: 'CONCEITO FUNDAMENTAL' },
    { name: 'conceptTitle', label: 'Título do Conceito', type: 'text', defaultValue: 'O que é um LLM?' },
    { name: 'statement', label: 'Declaração Principal', type: 'textarea', defaultValue: 'Um Large Language Model...' },
    {
      name: 'bulletPoints',
      label: 'Tópicos Dinâmicos (Adicionar/Remover)',
      type: 'array',
      itemLabel: 'Tópico Explicativo',
      itemDefaultValue: 'Novo ponto conceitual',
      defaultValue: ['Ponto 1', 'Ponto 2', 'Ponto 3'],
    },
  ],
  Component: ({ props, frame, fps }) => {
    const cardS = spring({ frame: frame - 3, fps });
    const points = Array.isArray(props.bulletPoints) ? props.bulletPoints : [];
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-12 relative overflow-hidden">
        <div
          className="max-w-4xl w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-10 shadow-2xl backdrop-blur-xl"
          style={{ transform: `scale(${cardS})`, opacity: cardS }}
        >
          <div className="mb-4">
            {props.showTag && (
              <span className="text-cyan-400 text-xs font-mono uppercase tracking-widest">
                {props.tag}
              </span>
            )}
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mt-1">
              {props.conceptTitle}
            </h2>
          </div>
          <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-6 border-l-4 border-cyan-500 pl-4 bg-slate-800/40 py-2 rounded-r-lg">
            {props.statement}
          </p>
          <div className="space-y-3">
            {points.map((pt: string, idx: number) => {
              const itemS = spring({ frame: frame - 10 - idx * 5, fps });
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-200 text-sm font-medium"
                  style={{ transform: `translateX(${(1 - itemS) * 30}px)`, opacity: itemS }}
                >
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <span>{pt}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
});

// 13. Question Dilemma
registerTemplate({
  id: 'question-dilemma',
  name: 'Pergunta / O Dilema',
  category: 'Conceitos & Explicações',
  description: 'Gera curiosidade com uma questão central reflexiva e contexto secundário.',
  iconName: 'hero',
  defaultProps: {
    question: 'Eles realmente entendem o que dizem?',
    context:
      'Ou são apenas papagaios estocásticos que combinam palavras com base em probabilidade matemática?',
    showIcon: true,
  },
  schema: [
    { name: 'showIcon', label: 'Exibir Ícone Central', type: 'toggle', defaultValue: true },
    { name: 'question', label: 'Pergunta Principal', type: 'text', defaultValue: 'Eles realmente entendem?' },
    { name: 'context', label: 'Contextualização', type: 'textarea', defaultValue: 'Ou são apenas...' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 4, fps });
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-14 text-center">
        <div className="max-w-3xl" style={{ transform: `scale(${s})`, opacity: s }}>
          {props.showIcon && (
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-6">
              <Icons.Sparkles />
            </div>
          )}
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6">
            {props.question}
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">{props.context}</p>
        </div>
      </div>
    );
  },
});

// 14. Quote Card
registerTemplate({
  id: 'quote-statement',
  name: 'Citação de Autoridade',
  category: 'Conceitos & Explicações',
  description: 'Citação de papers célebres com autor e ano de publicação.',
  iconName: 'hero',
  defaultProps: {
    quote: '"Attention Is All You Need."',
    author: 'Vaswani et al. (Google Brain & Research)',
    year: 'NeurIPS 2017',
  },
  schema: [
    { name: 'quote', label: 'Citação', type: 'textarea', defaultValue: '"Attention Is All You Need."' },
    { name: 'author', label: 'Autor(es)', type: 'text', defaultValue: 'Vaswani et al.' },
    { name: 'year', label: 'Ano / Publicação', type: 'text', defaultValue: 'NeurIPS 2017' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 4, fps });
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-14 relative">
        <div
          className="max-w-3xl border-l-4 border-indigo-500 pl-8"
          style={{ transform: `translateX(${(1 - s) * -20}px)`, opacity: s }}
        >
          <p className="text-3xl md:text-4xl font-serif italic text-white leading-snug">{props.quote}</p>
          <div className="mt-6">
            <h4 className="text-base font-bold text-indigo-400 font-mono">{props.author}</h4>
            <span className="text-xs text-slate-500 font-mono">{props.year}</span>
          </div>
        </div>
      </div>
    );
  },
});

// 15. Fact Check (Myth vs Fact)
registerTemplate({
  id: 'fact-check',
  name: 'Mito vs Fato',
  category: 'Conceitos & Explicações',
  description: 'Contraste direto entre mito popular e evidência científica.',
  iconName: 'chart',
  defaultProps: {
    myth: 'LLMs possuem consciência e sentimentos próprios.',
    fact: 'São funções matemáticas de predição de tokens treinadas com gradiente descendente.',
  },
  schema: [
    { name: 'myth', label: 'O Mito', type: 'textarea', defaultValue: 'LLMs possuem consciência...' },
    { name: 'fact', label: 'O Fato Técnico', type: 'textarea', defaultValue: 'São funções matemáticas...' },
  ],
  Component: ({ props, frame, fps }) => {
    const leftS = spring({ frame: frame - 4, fps });
    const rightS = spring({ frame: frame - 12, fps });
    return (
      <div className="w-full h-full bg-slate-950 grid grid-cols-2 p-12 gap-8 items-center">
        <div
          className="bg-rose-950/20 border border-rose-800/40 rounded-2xl p-8"
          style={{ opacity: leftS, transform: `scale(${leftS})` }}
        >
          <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider block mb-3">
            // MITO POPULAR
          </span>
          <p className="text-lg text-rose-200 font-medium">{props.myth}</p>
        </div>
        <div
          className="bg-emerald-950/20 border border-emerald-800/40 rounded-2xl p-8"
          style={{ opacity: rightS, transform: `scale(${rightS})` }}
        >
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider block mb-3">
            // FATO CIENTÍFICO
          </span>
          <p className="text-lg text-emerald-200 font-medium">{props.fact}</p>
        </div>
      </div>
    );
  },
});

// 16. Technical Glossary
registerTemplate({
  id: 'glossary-term',
  name: 'Termo de Glossário',
  category: 'Conceitos & Explicações',
  description: 'Explicação detalhada com pronúncia e significado de jargões técnicos.',
  iconName: 'hero',
  defaultProps: {
    term: 'Temperature',
    phonetic: '/ˈtɛmp.rə.tʃər/',
    meaning:
      'Hiperparâmetro que calibra a aleatoriedade da distribuição de probabilidade na amostragem Softmax.',
  },
  schema: [
    { name: 'term', label: 'Termo / Jargão', type: 'text', defaultValue: 'Temperature' },
    { name: 'phonetic', label: 'Pronúncia / Guia', type: 'text', defaultValue: '/ˈtɛmp.rə.tʃər/' },
    { name: 'meaning', label: 'Significado', type: 'textarea', defaultValue: 'Hiperparâmetro que calibra...' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 4, fps });
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-14">
        <div
          className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-10"
          style={{ transform: `scale(${s})`, opacity: s }}
        >
          <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
            GLOSSÁRIO TÉCNICO
          </span>
          <h2 className="text-4xl font-extrabold text-white mt-2 mb-1">{props.term}</h2>
          <span className="text-sm font-mono text-slate-500 italic block mb-6">{props.phonetic}</span>
          <p className="text-lg text-slate-300 leading-relaxed border-t border-slate-800 pt-6">
            {props.meaning}
          </p>
        </div>
      </div>
    );
  },
});

// 17. Step by Step Guide (Modular Array)
registerTemplate({
  id: 'step-guide-modular',
  name: 'Passo a Passo Modular',
  category: 'Conceitos & Explicações',
  description: 'Lista ordenada de passos configurável com adição e remoção dinâmica.',
  iconName: 'layers',
  defaultProps: {
    title: 'Ciclo de Treinamento',
    steps: [
      'Pré-treinamento com trilhões de tokens de texto',
      'Supervised Fine-Tuning (SFT) com instruções humanas',
      'Alinhamento com RLHF (Reinforcement Learning from Human Feedback)',
    ],
  },
  schema: [
    { name: 'title', label: 'Título do Processo', type: 'text', defaultValue: 'Ciclo de Treinamento' },
    {
      name: 'steps',
      label: 'Passos Dinâmicos',
      type: 'array',
      itemLabel: 'Passo',
      itemDefaultValue: 'Nova etapa do ciclo',
      defaultValue: ['Etapa 1', 'Etapa 2', 'Etapa 3'],
    },
  ],
  Component: ({ props, frame, fps }) => {
    const steps = Array.isArray(props.steps) ? props.steps : [];
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-12">
        <h2 className="text-3xl font-extrabold text-white mb-8">{props.title}</h2>
        <div className="space-y-4 max-w-3xl w-full">
          {steps.map((st: string, idx: number) => {
            const s = spring({ frame: frame - 6 - idx * 5, fps });
            return (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg"
                style={{ transform: `scale(${s})`, opacity: s }}
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 font-mono font-bold flex items-center justify-center shrink-0 border border-indigo-500/30">
                  {idx + 1}
                </div>
                <span className="text-sm text-slate-200 font-medium">{st}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
});

// 18. Tokens & Embeddings
registerTemplate({
  id: 'tokens-embeddings',
  name: 'Tokens & Embeddings',
  category: 'Arquitetura & IA',
  description: 'Demonstração animada da quebra de texto em tokens e coordenadas vetoriais.',
  iconName: 'cpu',
  defaultProps: {
    title: 'Como o Modelo "Enxerga" o Texto',
    sentence: 'A inteligência artificial transforma texto em números',
    tokens: 'A;intelig;ência;artific;ial;trans;forma;texto;em;números',
    showDimensions: true,
  },
  schema: [
    { name: 'title', label: 'Título', type: 'text', defaultValue: 'Como o Modelo "Enxerga" o Texto' },
    { name: 'sentence', label: 'Frase de Entrada', type: 'text', defaultValue: 'A inteligência artificial...' },
    {
      name: 'tokens',
      label: 'Tokens (separados por ;)',
      type: 'text',
      defaultValue: 'A;intelig;ência;artific;ial;trans;forma;texto;em;números',
    },
    { name: 'showDimensions', label: 'Exibir Dimensões Vetoriais', type: 'toggle', defaultValue: true },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame, fps });
    const tokens = (props.tokens || '').split(';').filter(Boolean);
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-10 text-center">
        <div className="max-w-4xl w-full" style={{ opacity: s }}>
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
            TOKENIZAÇÃO & VETORES
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-3 mb-6">{props.title}</h2>
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 font-mono text-sm text-slate-400 mb-6 inline-block">
            Input: "{props.sentence}"
          </div>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {tokens.map((t: string, i: number) => {
              const tokS = spring({ frame: frame - 8 - i * 3, fps });
              const isHighlight = Math.floor(frame / 20) % tokens.length === i;
              return (
                <div
                  key={i}
                  className={`px-3 py-2 rounded-xl font-mono text-sm border transition-all ${
                    isHighlight
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 scale-105 shadow-lg'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                  style={{ transform: `scale(${tokS})`, opacity: tokS }}
                >
                  <span className="text-[10px] text-slate-500 mr-1">#{i}</span>
                  {t}
                </div>
              );
            })}
          </div>
          {props.showDimensions && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-300 flex items-center justify-between">
              <span className="text-emerald-400 font-bold">Vetor [1536d]:</span>
              <span className="text-slate-400">[0.842, -0.312, 0.915, ... 1533 dimensões restantes]</span>
            </div>
          )}
        </div>
      </div>
    );
  },
});

// 19. Attention Mechanism
registerTemplate({
  id: 'attention-transformer',
  name: 'Mecanismo de Atenção',
  category: 'Arquitetura & IA',
  description: 'Visualização de conexões e pesos matemáticos de autoatenção entre palavras.',
  iconName: 'layers',
  defaultProps: {
    title: 'Mecanismo de Atenção (Transformers)',
    description: 'A palavra "cansado" calcula pesos matemáticos para relacionar-se com o sujeito "animal".',
    showFormula: true,
  },
  schema: [
    { name: 'title', label: 'Título', type: 'text', defaultValue: 'Mecanismo de Atenção' },
    { name: 'description', label: 'Descrição da Regra', type: 'textarea', defaultValue: 'A palavra calcula pesos...' },
    { name: 'showFormula', label: 'Exibir Fórmula Softmax', type: 'toggle', defaultValue: true },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame, fps });
    const words = ['O', 'animal', 'não', 'atravessou', 'a', 'rua', 'porque', 'estava', 'cansado'];
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-10">
        <div className="max-w-4xl w-full text-center" style={{ opacity: s }}>
          <span className="text-xs font-mono text-violet-400 uppercase tracking-wider bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/30">
            SELF-ATTENTION LAYER
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-3 mb-2">{props.title}</h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto mb-8">{props.description}</p>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative">
            <div className="flex justify-between items-center relative z-10">
              {words.map((w, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col items-center ${
                    idx === 1
                      ? 'text-violet-400 font-bold'
                      : idx === 8
                      ? 'text-pink-400 font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono mb-1 border ${
                      idx === 1 || idx === 8
                        ? 'bg-violet-500/20 border-violet-400'
                        : 'bg-slate-800 border-slate-700'
                    }`}
                  >
                    q{idx}
                  </div>
                  <span className="text-xs">{w}</span>
                </div>
              ))}
            </div>
            {props.showFormula && (
              <div className="mt-6 pt-4 border-t border-slate-800 text-xs font-mono text-slate-400 flex justify-around">
                <span>Q: Query</span>
                <span>K: Key</span>
                <span>V: Value</span>
                <span className="text-violet-300">Softmax(QKᵀ / √d) × V</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
});

// 20. Code Snippet
registerTemplate({
  id: 'code-snippet',
  name: 'Código PyTorch / API',
  category: 'Arquitetura & IA',
  description: 'Bloco de código de sintaxe para demonstrar algoritmos ou chamadas de API.',
  iconName: 'code',
  defaultProps: {
    filename: 'transformer.py',
    code: 'class SelfAttention(nn.Module):\n  def forward(self, x):\n    scores = q @ k.transpose(-2, -1) / sqrt(d)\n    return softmax(scores) @ v',
  },
  schema: [
    { name: 'filename', label: 'Nome do Arquivo', type: 'text', defaultValue: 'transformer.py' },
    { name: 'code', label: 'Código', type: 'textarea', defaultValue: 'class SelfAttention...' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 4, fps });
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-12">
        <div
          className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
          style={{ transform: `scale(${s})`, opacity: s }}
        >
          <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono text-indigo-300">{props.filename}</span>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>
          </div>
          <pre className="p-6 font-mono text-xs text-emerald-400 leading-relaxed overflow-x-auto whitespace-pre-wrap">
            {props.code}
          </pre>
        </div>
      </div>
    );
  },
});

// 21. Layer Stack Recurrent
registerTemplate({
  id: 'layer-stack',
  name: 'Pilha de Camadas',
  category: 'Arquitetura & IA',
  description: 'Representação de camadas profundas empilhadas com indicação de blocos.',
  iconName: 'layers',
  defaultProps: {
    stackCount: '96 Camadas Repetidas',
    layerA: 'Multi-Head Self Attention',
    layerB: 'Add & Layer Normalization',
    layerC: 'Feed Forward Neural Network',
  },
  schema: [
    { name: 'stackCount', label: 'Repetições', type: 'text', defaultValue: '96 Camadas Repetidas' },
    { name: 'layerA', label: 'Camada Superior', type: 'text', defaultValue: 'Multi-Head Self Attention' },
    { name: 'layerB', label: 'Camada do Meio', type: 'text', defaultValue: 'Add & Layer Normalization' },
    { name: 'layerC', label: 'Camada Inferior', type: 'text', defaultValue: 'Feed Forward Neural Network' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 4, fps });
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-12">
        <div className="max-w-xl w-full text-center" style={{ opacity: s }}>
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block mb-4">
            BLOCOS RECORRENTES (N×)
          </span>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40 text-cyan-300 font-mono text-sm font-bold shadow-lg">
              {props.layerA}
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs">
              {props.layerB}
            </div>
            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/40 text-indigo-300 font-mono text-sm font-bold shadow-lg">
              {props.layerC}
            </div>
          </div>
          <span className="text-xs font-mono text-slate-500 mt-6 block uppercase tracking-wider">
            ▲ {props.stackCount} ▲
          </span>
        </div>
      </div>
    );
  },
});

// 22. Neural Synapse Graph
registerTemplate({
  id: 'neural-graph',
  name: 'Grafo Sináptico',
  category: 'Arquitetura & IA',
  description: 'Nós neurais interconectados demonstrando ativação de tensores.',
  iconName: 'cpu',
  defaultProps: {
    caption: 'Interconexão de Parâmetros e Pesos Sinápticos',
    layersInfo: 'Entrada -> Hidden Layers -> Saída Probabilística',
  },
  schema: [
    { name: 'caption', label: 'Legenda', type: 'text', defaultValue: 'Interconexão de Parâmetros...' },
    { name: 'layersInfo', label: 'Descrição de Camadas', type: 'text', defaultValue: 'Entrada -> Hidden...' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame, fps });
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-10 relative">
        <div className="text-center mb-6" style={{ opacity: s }}>
          <h3 className="text-2xl font-bold text-white">{props.caption}</h3>
          <span className="text-xs font-mono text-indigo-400">{props.layersInfo}</span>
        </div>
        <div className="flex gap-12 items-center">
          {[4, 6, 6, 4].map((nodesCount, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-3">
              {Array.from({ length: nodesCount }).map((_, nodeIdx) => (
                <div
                  key={nodeIdx}
                  className={`w-5 h-5 rounded-full border ${
                    (colIdx + nodeIdx + Math.floor(frame / 10)) % 3 === 0
                      ? 'bg-indigo-500 border-indigo-300 shadow-lg shadow-indigo-500/50'
                      : 'bg-slate-800 border-slate-700'
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  },
});

// 23. System Architecture RAG
registerTemplate({
  id: 'system-architecture',
  name: 'Arquitetura RAG & LLM',
  category: 'Arquitetura & IA',
  description: 'Visão macro de integração entre Banco Vetorial, Modelo LLM e Saída.',
  iconName: 'layers',
  defaultProps: {
    client: 'Usuário (Prompt)',
    vectorDb: 'Vector Store (Chroma / Pinecone)',
    llm: 'Fundação LLM (Claude / GPT)',
    output: 'Resposta Grounded',
  },
  schema: [
    { name: 'client', label: 'Origem', type: 'text', defaultValue: 'Usuário (Prompt)' },
    { name: 'vectorDb', label: 'Banco Vetorial', type: 'text', defaultValue: 'Vector Store' },
    { name: 'llm', label: 'Modelo LLM', type: 'text', defaultValue: 'Fundação LLM' },
    { name: 'output', label: 'Saída Grounded', type: 'text', defaultValue: 'Resposta Grounded' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame, fps });
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-12">
        <div className="max-w-4xl w-full text-center" style={{ opacity: s }}>
          <span className="text-xs font-mono text-purple-400 uppercase tracking-wider block mb-4">
            SISTEMA RAG (RETRIEVAL AUGMENTED GENERATION)
          </span>
          <div className="grid grid-cols-4 gap-4 items-center">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white">
              {props.client}
            </div>
            <div className="p-4 bg-purple-950/30 border border-purple-800/40 rounded-xl text-xs font-bold text-purple-300">
              {props.vectorDb}
            </div>
            <div className="p-4 bg-indigo-950/30 border border-indigo-800/40 rounded-xl text-xs font-bold text-indigo-300">
              {props.llm}
            </div>
            <div className="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs font-bold text-emerald-300">
              {props.output}
            </div>
          </div>
        </div>
      </div>
    );
  },
});

// 24. Comparative Metrics
registerTemplate({
  id: 'comparative-metrics',
  name: 'Comparativo de Métricas',
  category: 'Dados, Métricas & Encerramento',
  description: 'Barras comparativas com cálculo dinâmico de percentuais.',
  iconName: 'chart',
  defaultProps: {
    title: 'Modelos Clássicos vs LLMs Modernos',
    modelA: 'RNN / LSTM (2015)',
    modelB: 'Transformer SOTA (2024)',
    metric1Label: 'Janela de Contexto',
    metric2Label: 'Paralelização de Treino',
    metric3Label: 'Raciocínio Geral',
  },
  schema: [
    { name: 'title', label: 'Título', type: 'text', defaultValue: 'Modelos Clássicos vs LLMs' },
    { name: 'modelA', label: 'Modelo A', type: 'text', defaultValue: 'RNN / LSTM' },
    { name: 'modelB', label: 'Modelo B', type: 'text', defaultValue: 'Transformer SOTA' },
    { name: 'metric1Label', label: 'Métrica 1', type: 'text', defaultValue: 'Janela de Contexto' },
    { name: 'metric2Label', label: 'Métrica 2', type: 'text', defaultValue: 'Paralelização' },
    { name: 'metric3Label', label: 'Métrica 3', type: 'text', defaultValue: 'Raciocínio Geral' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame, fps });
    const metrics = [
      { label: props.metric1Label, v1: 35, v2: 95 },
      { label: props.metric2Label, v1: 25, v2: 98 },
      { label: props.metric3Label, v1: 45, v2: 90 },
    ];
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-12">
        <div className="max-w-3xl w-full" style={{ opacity: s }}>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-extrabold text-white">{props.title}</h2>
            <div className="flex gap-4 text-xs font-mono">
              <span className="text-slate-400">■ {props.modelA}</span>
              <span className="text-amber-400">■ {props.modelB}</span>
            </div>
          </div>
          <div className="space-y-6 bg-slate-900 border border-slate-800 rounded-3xl p-8">
            {metrics.map((m, i) => {
              const barS = spring({ frame: frame - 10 - i * 6, fps });
              return (
                <div key={i} className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-300">{m.label}</span>
                  <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-500 rounded-full" style={{ width: `${m.v1 * barS}%` }} />
                  </div>
                  <div className="h-3.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-lg"
                      style={{ width: `${m.v2 * barS}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
});

// 25. Versus Battle
registerTemplate({
  id: 'versus-battle',
  name: 'Batalha A vs B',
  category: 'Dados, Métricas & Encerramento',
  description: 'Confronto direto lado a lado entre duas abordagens tecnológicas rivais.',
  iconName: 'chart',
  defaultProps: {
    sideA: 'Open Source (Llama / Mistral)',
    sideB: 'Closed API (GPT-4 / Claude)',
    pointA: 'Privacidade total & Auto-hospedagem local sem envio de dados.',
    pointB: 'SOTA máximo em raciocínio & Zero complexidade operacional.',
  },
  schema: [
    { name: 'sideA', label: 'Lado A', type: 'text', defaultValue: 'Open Source' },
    { name: 'pointA', label: 'Destaque A', type: 'textarea', defaultValue: 'Privacidade total...' },
    { name: 'sideB', label: 'Lado B', type: 'text', defaultValue: 'Closed API' },
    { name: 'pointB', label: 'Destaque B', type: 'textarea', defaultValue: 'SOTA máximo...' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 4, fps });
    return (
      <div className="w-full h-full bg-slate-950 grid grid-cols-2 p-12 gap-8 items-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center font-black text-white text-xs font-mono">
          VS
        </div>
        <div
          className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center"
          style={{ transform: `scale(${s})`, opacity: s }}
        >
          <h3 className="text-xl font-bold text-cyan-400 mb-4">{props.sideA}</h3>
          <p className="text-sm text-slate-300">{props.pointA}</p>
        </div>
        <div
          className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center"
          style={{ transform: `scale(${s})`, opacity: s }}
        >
          <h3 className="text-xl font-bold text-purple-400 mb-4">{props.sideB}</h3>
          <p className="text-sm text-slate-300">{props.pointB}</p>
        </div>
      </div>
    );
  },
});

// 26. Pros & Cons Modular
registerTemplate({
  id: 'pros-cons-modular',
  name: 'Vantagens & Desvantagens',
  category: 'Dados, Métricas & Encerramento',
  description: 'Listas dinâmicas de prós e contras com suporte a adição e remoção.',
  iconName: 'chart',
  defaultProps: {
    pros: ['Altíssima velocidade', 'Sem custos de API por requisição', 'Customização total de pesos'],
    cons: ['Exige GPU de ponta com alta VRAM', 'Alucinações possíveis', 'Manutenção contínua de servidor'],
  },
  schema: [
    {
      name: 'pros',
      label: 'Vantagens (Prós)',
      type: 'array',
      itemLabel: 'Vantagem',
      itemDefaultValue: 'Nova vantagem técnica',
      defaultValue: ['Vantagem 1', 'Vantagem 2'],
    },
    {
      name: 'cons',
      label: 'Desvantagens (Contras)',
      type: 'array',
      itemLabel: 'Desvantagem',
      itemDefaultValue: 'Nova desvantagem técnica',
      defaultValue: ['Desvantagem 1', 'Desvantagem 2'],
    },
  ],
  Component: ({ props, frame, fps }) => {
    const pros = Array.isArray(props.pros) ? props.pros : [];
    const cons = Array.isArray(props.cons) ? props.cons : [];
    return (
      <div className="w-full h-full bg-slate-950 grid grid-cols-2 p-12 gap-8 items-center">
        <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-2xl p-6">
          <span className="text-xs font-mono text-emerald-400 font-bold uppercase block mb-4">
            VANTAGENS (+)
          </span>
          <div className="space-y-2">
            {pros.map((p: string, i: number) => (
              <div key={i} className="text-xs text-emerald-200 flex items-center gap-2">
                <span className="text-emerald-400 font-bold">+</span> {p}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-rose-950/20 border border-rose-800/40 rounded-2xl p-6">
          <span className="text-xs font-mono text-rose-400 font-bold uppercase block mb-4">
            DESVANTAGENS (-)
          </span>
          <div className="space-y-2">
            {cons.map((c: string, i: number) => (
              <div key={i} className="text-xs text-rose-200 flex items-center gap-2">
                <span className="text-rose-400 font-bold">-</span> {c}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
});

// 27. Big Stat Percentage
registerTemplate({
  id: 'big-stat',
  name: 'Estatística Numérica Central',
  category: 'Dados, Métricas & Encerramento',
  description: 'Destaque visual para um percentual ou número expressivo de benchmark.',
  iconName: 'chart',
  defaultProps: {
    percentage: '92.4%',
    label: 'Acurácia MMLU',
    description: 'Capacidade em testes acadêmicos de nível de pós-graduação.',
  },
  schema: [
    { name: 'percentage', label: 'Valor / Porcentagem', type: 'text', defaultValue: '92.4%' },
    { name: 'label', label: 'Rótulo da Métrica', type: 'text', defaultValue: 'Acurácia MMLU' },
    { name: 'description', label: 'Explicação Curta', type: 'textarea', defaultValue: 'Capacidade em testes...' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 4, fps });
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-14 text-center">
        <div style={{ transform: `scale(${s})`, opacity: s }}>
          <div className="text-7xl md:text-8xl font-black bg-gradient-to-r from-indigo-400 to-pink-500 bg-clip-text text-transparent mb-2">
            {props.percentage}
          </div>
          <h3 className="text-2xl font-bold text-white">{props.label}</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mt-2">{props.description}</p>
        </div>
      </div>
    );
  },
});

// 28. Key Takeaways
registerTemplate({
  id: 'key-takeaways',
  name: 'Conclusão Chave',
  category: 'Dados, Métricas & Encerramento',
  description: 'Destaque de uma única grande mensagem definitiva para finalizar.',
  iconName: 'hero',
  defaultProps: {
    badge: 'CONCLUSÃO FINAL',
    takeaway: 'O segredo não é mágica: é matemática vetorial, dados e poder computacional massivo.',
  },
  schema: [
    { name: 'badge', label: 'Badge Superior', type: 'text', defaultValue: 'CONCLUSÃO FINAL' },
    { name: 'takeaway', label: 'Mensagem Central', type: 'textarea', defaultValue: 'O segredo não é mágica...' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 4, fps });
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-14 text-center">
        <div className="max-w-3xl" style={{ transform: `scale(${s})`, opacity: s }}>
          <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-mono font-bold uppercase mb-6 inline-block">
            {props.badge}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-relaxed">
            {props.takeaway}
          </h2>
        </div>
      </div>
    );
  },
});

// 29. CTA Subscribe
registerTemplate({
  id: 'cta-subscribe',
  name: 'Chamada para Ação (CTA)',
  category: 'Dados, Métricas & Encerramento',
  description: 'Card final com convite para inscrição, comunidade ou link de download.',
  iconName: 'hero',
  defaultProps: {
    action: 'Gostou da Explicação?',
    subtext: 'Inscreva-se no canal para mais análises profundas de Engenharia de IA.',
    channel: '@CanalTechAI',
  },
  schema: [
    { name: 'action', label: 'Ação Desejada', type: 'text', defaultValue: 'Gostou da Explicação?' },
    { name: 'subtext', label: 'Instrução', type: 'textarea', defaultValue: 'Inscreva-se no canal...' },
    { name: 'channel', label: 'Canal / Nome', type: 'text', defaultValue: '@CanalTechAI' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 4, fps });
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-14 text-center">
        <div
          className="max-w-xl w-full bg-gradient-to-b from-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-3xl p-10 shadow-2xl"
          style={{ transform: `scale(${s})`, opacity: s }}
        >
          <h2 className="text-3xl font-black text-white mb-3">{props.action}</h2>
          <p className="text-sm text-slate-300 mb-6">{props.subtext}</p>
          <span className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs tracking-wider uppercase font-mono shadow-lg">
            {props.channel}
          </span>
        </div>
      </div>
    );
  },
});

// 30. Production Credits Outro
registerTemplate({
  id: 'credits-outro',
  name: 'Créditos da Produção',
  category: 'Dados, Métricas & Encerramento',
  description: 'Encerramento formal com créditos técnicos e menção à equipe.',
  iconName: 'film',
  defaultProps: {
    producedBy: 'Produzido por Remotion Video Studio',
    techStack: 'React • Remotion • Tailwind CSS',
    license: 'Licença Aberta Educacional 2026',
  },
  schema: [
    { name: 'producedBy', label: 'Produção', type: 'text', defaultValue: 'Produzido por Remotion Studio' },
    { name: 'techStack', label: 'Tecnologias', type: 'text', defaultValue: 'React • Remotion' },
    { name: 'license', label: 'Licença / Ano', type: 'text', defaultValue: 'Licença Educacional 2026' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 4, fps });
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-12 text-center font-mono">
        <div className="max-w-lg w-full space-y-4" style={{ opacity: s }}>
          <h4 className="text-base font-bold text-white uppercase tracking-wider">{props.producedBy}</h4>
          <p className="text-xs text-indigo-400">{props.techStack}</p>
          <span className="text-[10px] text-slate-600 block">{props.license}</span>
        </div>
      </div>
    );
  },
});

const INITIAL_PROJECT_STATE: ProjectState = {
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

const MediaFieldEditor: React.FC<{
  value?: MediaAsset;
  onChange: (val: MediaAsset) => void;
}> = ({ value, onChange }) => {
  const [videoDuration, setVideoDuration] = useState<number>(value?.duration || 10);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentMedia: MediaAsset = useMemo(() => {
    return (
      value || {
        type: 'image',
        url: '',
        trimStart: 0,
        trimEnd: 5,
        objectFit: 'cover',
      }
    );
  }, [value]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const url = URL.createObjectURL(file);

    if (isVideo) {
      const tempVideo = document.createElement('video');
      tempVideo.src = url;
      tempVideo.onloadedmetadata = () => {
        const dur = Math.round(tempVideo.duration * 10) / 10 || 10;
        setVideoDuration(dur);
        onChange({
          type: 'video',
          url,
          name: file.name,
          duration: dur,
          trimStart: 0,
          trimEnd: Math.min(dur, 6),
          objectFit: 'cover',
        });
      };
    } else {
      onChange({
        type: 'image',
        url,
        name: file.name,
        trimStart: 0,
        trimEnd: 0,
        objectFit: 'cover',
      });
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Icons.Video />
          <span>Upload de Imagem ou Vídeo</span>
        </span>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <Icons.Upload />
          <span>Carregar Arquivo</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {currentMedia.url ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-16 h-12 rounded-lg bg-slate-900 overflow-hidden border border-slate-700 shrink-0">
              {currentMedia.type === 'video' ? (
                <video src={currentMedia.url} className="w-full h-full object-cover" />
              ) : (
                <img src={currentMedia.url} alt="Preview" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <span className="text-xs font-bold text-white block truncate">
                {currentMedia.name || 'Mídia Selecionada'}
              </span>
              <span className="text-[10px] text-indigo-400 font-mono uppercase">
                {currentMedia.type === 'video' ? 'Vídeo Carregado' : 'Imagem'}
              </span>
            </div>
            <button
              onClick={() =>
                onChange({
                  type: 'image',
                  url: '',
                  trimStart: 0,
                  trimEnd: 0,
                  objectFit: 'cover',
                })
              }
              className="p-1 text-slate-400 hover:text-rose-400"
              title="Remover mídia"
            >
              <Icons.Trash />
            </button>
          </div>

          {/* Video Trimmer Controls */}
          {currentMedia.type === 'video' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-indigo-400 font-bold flex items-center gap-1">
                  <Icons.Scissors />
                  <span>Corte do Vídeo (Trim Start & End)</span>
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  Duração: {(currentMedia.trimEnd - currentMedia.trimStart).toFixed(1)}s
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Começo (Trim Start: {currentMedia.trimStart}s)
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(0, (currentMedia.trimEnd || videoDuration) - 0.5)}
                    step={0.1}
                    value={currentMedia.trimStart || 0}
                    onChange={(e) =>
                      onChange({
                        ...currentMedia,
                        trimStart: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Fim (Trim End: {currentMedia.trimEnd}s)
                  </label>
                  <input
                    type="range"
                    min={(currentMedia.trimStart || 0) + 0.5}
                    max={Math.max(videoDuration, 30)}
                    step={0.1}
                    value={currentMedia.trimEnd || Math.min(videoDuration, 10)}
                    onChange={(e) =>
                      onChange({
                        ...currentMedia,
                        trimEnd: parseFloat(e.target.value) || 1,
                      })
                    }
                    className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-400">Enquadramento:</span>
            <select
              value={currentMedia.objectFit}
              onChange={(e) =>
                onChange({ ...currentMedia, objectFit: e.target.value as any })
              }
              className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 text-xs"
            >
              <option value="cover">Preencher (Cover)</option>
              <option value="contain">Conter Inteiro (Contain)</option>
            </select>
          </div>
        </div>
      ) : (
        <div className="text-center py-3">
          <input
            type="text"
            placeholder="Ou cole a URL direta de uma imagem ou vídeo..."
            value={currentMedia.url}
            onChange={(e) => {
              const url = e.target.value;
              const isVid = /\.(mp4|webm|mov)$/i.test(url);
              onChange({
                type: isVid ? 'video' : 'image',
                url,
                trimStart: 0,
                trimEnd: 6,
                objectFit: 'cover',
              });
            }}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      )}
    </div>
  );
};

const DynamicArrayField: React.FC<{
  label: string;
  items: any[];
  itemLabel?: string;
  itemDefaultValue?: any;
  onChange: (updated: any[]) => void;
}> = ({ label, items = [], itemLabel = 'Item', itemDefaultValue = 'Novo item', onChange }) => {
  const handleAddItem = () => {
    onChange([...items, itemDefaultValue]);
  };

  const handleRemoveItem = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    onChange(next);
  };

  const handleUpdateItem = (index: number, val: any) => {
    const next = [...items];
    next[index] = val;
    onChange(next);
  };

  return (
    <div className="space-y-3 bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Icons.Layers />
          <span>{label}</span>
          <span className="text-slate-500 font-mono text-[10px]">({items.length})</span>
        </label>
        <button
          type="button"
          onClick={handleAddItem}
          className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition"
        >
          <Icons.Plus />
          <span>Adicionar {itemLabel}</span>
        </button>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {items.map((it, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-500 w-4 text-center">
              {idx + 1}
            </span>
            <input
              type="text"
              value={it}
              onChange={(e) => handleUpdateItem(idx, e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={() => handleRemoveItem(idx)}
              className="p-1 text-slate-500 hover:text-rose-400 transition"
              title="Remover este item"
            >
              <Icons.Trash />
            </button>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center py-4 text-xs text-slate-500 italic">
            Nenhum item adicionado. Clique no botão acima para incluir.
          </div>
        )}
      </div>
    </div>
  );
};

const CardInspector: React.FC<{
  card: CalculatedCard | null;
  onUpdateCard: (updated: VideoCard) => void;
  fps: number;
}> = ({ card, onUpdateCard, fps }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'timing' | 'voice'>('content');
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  if (!card) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
          <Icons.Film />
        </div>
        <h3 className="text-slate-300 font-semibold text-base">Nenhuma cena ativa</h3>
        <p className="text-xs mt-1">Navegue no player para inspecionar a cena atual.</p>
      </div>
    );
  }

  const templateDef = CARD_REGISTRY[card.templateId] || CARD_REGISTRY['hero-title'];
  const parsedScript = parseScriptAndDelays(card.tts?.script || '', card.tts?.speed || 1.0);

  const handlePropChange = (fieldName: string, value: any) => {
    onUpdateCard({
      ...card,
      props: {
        ...card.props,
        [fieldName]: value,
      },
    });
  };

  const handleTTSChange = (field: string, value: any) => {
    onUpdateCard({
      ...card,
      tts: {
        ...card.tts,
        [field]: value,
      },
    });
  };

  const insertSleepTag = (seconds: number) => {
    const tag = `[@sleep-${seconds}]`;
    const textarea = textareaRef.current;
    if (!textarea) {
      handleTTSChange('script', `${card.tts.script || ''} ${tag}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = card.tts.script || '';
    const updated = current.substring(0, start) + ` ${tag} ` + current.substring(end);

    handleTTSChange('script', updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length + 2, start + tag.length + 2);
    }, 50);
  };

  const handlePreviewTTS = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPlayingTTS) {
      window.speechSynthesis.cancel();
      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
      setIsPlayingTTS(false);
      return;
    }

    const segments = parsedScript.segments;
    if (segments.length === 0) return;

    setIsPlayingTTS(true);
    let segmentIndex = 0;

    const playNextSegment = () => {
      if (segmentIndex >= segments.length) {
        setIsPlayingTTS(false);
        return;
      }

      const seg = segments[segmentIndex];
      segmentIndex++;

      if (seg.type === 'sleep') {
        const ms = (seg.sleepDuration || 1) * 1000;
        speechTimeoutRef.current = setTimeout(playNextSegment, ms);
      } else {
        const utterance = new SpeechSynthesisUtterance(seg.text || '');
        utterance.rate = card.tts.speed || 1.0;
        utterance.lang = 'pt-BR';
        utterance.onend = () => playNextSegment();
        utterance.onerror = () => setIsPlayingTTS(false);
        window.speechSynthesis.speak(utterance);
      }
    };

    playNextSegment();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-full overflow-hidden shadow-2xl">
      {/* Header with Navigation Tabs */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/70">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Icons.Layers />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold block">
                Cena #{card.order + 1}
              </span>
              <h3 className="text-sm font-bold text-white truncate max-w-[200px]">
                {templateDef.name}
              </h3>
            </div>
          </div>
          <div className="text-right font-mono text-xs">
            <span className="text-white font-bold">{card.durationInFrames}f</span>
            <span className="text-slate-400 block text-[10px]">
              ({(card.durationInFrames / fps).toFixed(1)}s)
            </span>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('content')}
            className={`py-1.5 rounded-lg transition ${
              activeTab === 'content'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Conteúdo & Mídia
          </button>
          <button
            onClick={() => setActiveTab('timing')}
            className={`py-1.5 rounded-lg transition ${
              activeTab === 'timing'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Duração & Modo
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`py-1.5 rounded-lg transition ${
              activeTab === 'voice'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Voz & Narração
          </button>
        </div>
      </div>

      {/* Body / Scrollable Inspector */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {activeTab === 'content' && (
          <div className="space-y-4">
            {templateDef.schema.map((field) => {
              const val = card.props[field.name] ?? field.defaultValue;

              if (field.type === 'toggle') {
                return (
                  <div
                    key={field.name}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800"
                  >
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">
                        {field.label}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {val ? 'Elemento Visível no Card' : 'Elemento Oculto'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePropChange(field.name, !val)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                        val
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {val ? <Icons.Eye /> : <Icons.EyeOff />}
                      <span>{val ? 'Exibir' : 'Ocultar'}</span>
                    </button>
                  </div>
                );
              }

              if (field.type === 'media') {
                return (
                  <div key={field.name}>
                    <MediaFieldEditor
                      value={val}
                      onChange={(newMedia) => handlePropChange(field.name, newMedia)}
                    />
                  </div>
                );
              }

              if (field.type === 'array') {
                return (
                  <div key={field.name}>
                    <DynamicArrayField
                      label={field.label}
                      items={Array.isArray(val) ? val : []}
                      itemLabel={field.itemLabel}
                      itemDefaultValue={field.itemDefaultValue}
                      onChange={(updated) => handlePropChange(field.name, updated)}
                    />
                  </div>
                );
              }

              if (field.type === 'textarea') {
                return (
                  <div key={field.name}>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      {field.label}
                    </label>
                    <textarea
                      rows={2}
                      value={val}
                      onChange={(e) => handlePropChange(field.name, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                );
              }

              if (field.type === 'color') {
                return (
                  <div key={field.name} className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-400">{field.label}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={val}
                        onChange={(e) => handlePropChange(field.name, e.target.value)}
                        className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                      />
                      <span className="font-mono text-xs text-slate-400">{val}</span>
                    </div>
                  </div>
                );
              }

              return (
                <div key={field.name}>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    {field.label}
                  </label>
                  <input
                    type={field.type === 'number' ? 'number' : 'text'}
                    value={val}
                    onChange={(e) =>
                      handlePropChange(
                        field.name,
                        field.type === 'number' ? parseFloat(e.target.value) : e.target.value
                      )
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'timing' && (
          <div className="space-y-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Icons.Clock />
                  <span>Modo de Duração</span>
                </label>
                <div className="flex bg-slate-900 rounded-lg p-0.5 text-[11px] font-medium border border-slate-800">
                  <button
                    onClick={() => onUpdateCard({ ...card, durationMode: 'auto' })}
                    className={`px-3 py-1 rounded-md transition ${
                      card.durationMode === 'auto'
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Voz + Encerramento
                  </button>
                  <button
                    onClick={() => onUpdateCard({ ...card, durationMode: 'manual' })}
                    className={`px-3 py-1 rounded-md transition ${
                      card.durationMode === 'manual'
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Tempo Definido Fixo
                  </button>
                </div>
              </div>

              {card.durationMode === 'auto' ? (
                <div className="pt-2 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Tempo de Encerramento (Pós-fala):</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step={0.2}
                        min={0.2}
                        max={10.0}
                        value={card.audioPaddingEndInSeconds}
                        onChange={(e) =>
                          onUpdateCard({
                            ...card,
                            audioPaddingEndInSeconds: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-20 bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-center text-xs font-mono text-indigo-300 font-bold"
                      />
                      <span className="text-slate-400 text-xs">segundos</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-900/40 text-xs font-mono text-indigo-300 space-y-1">
                    <div className="flex justify-between">
                      <span>Fala estimada:</span>
                      <span>{parsedScript.speechEstimatedSeconds}s</span>
                    </div>
                    {parsedScript.totalSleepSeconds > 0 && (
                      <div className="flex justify-between text-amber-400">
                        <span>Pausas [@sleep]:</span>
                        <span>+{parsedScript.totalSleepSeconds}s</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-400">
                      <span>Tempo de Encerramento:</span>
                      <span>+{card.audioPaddingEndInSeconds}s</span>
                    </div>
                    <div className="border-t border-indigo-900/60 pt-1 flex justify-between font-bold text-white">
                      <span>Duração Final:</span>
                      <span>
                        {(
                          parsedScript.totalDurationSeconds + card.audioPaddingEndInSeconds
                        ).toFixed(1)}
                        s ({Math.ceil((parsedScript.totalDurationSeconds + card.audioPaddingEndInSeconds) * fps)}f)
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Duração (Segundos)</label>
                    <input
                      type="number"
                      step={0.5}
                      min={1}
                      max={60}
                      value={card.manualDurationInSeconds || card.manualDurationInFrames / fps}
                      onChange={(e) => {
                        const secs = parseFloat(e.target.value) || 1;
                        onUpdateCard({
                          ...card,
                          manualDurationInSeconds: secs,
                          manualDurationInFrames: Math.round(secs * fps),
                        });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Duração (Frames)</label>
                    <input
                      type="number"
                      step={15}
                      min={15}
                      value={card.manualDurationInFrames}
                      onChange={(e) => {
                        const f = parseInt(e.target.value) || 30;
                        onUpdateCard({
                          ...card,
                          manualDurationInFrames: f,
                          manualDurationInSeconds: Math.round((f / fps) * 10) / 10,
                        });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'voice' && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                <Icons.Mic />
                <span>Roteiro de Narração</span>
              </h4>
              <button
                onClick={handlePreviewTTS}
                className={`text-xs px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 transition ${
                  isPlayingTTS
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600 hover:text-white'
                }`}
              >
                {isPlayingTTS ? <Icons.Pause /> : <Icons.Play />}
                <span>{isPlayingTTS ? 'Parar Áudio' : 'Ouvir Narração'}</span>
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-slate-400">Adicionar pausa entre frases:</span>
                <span className="text-[10px] text-slate-500 font-mono">Insere no cursor</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[0.5, 1, 1.5, 2, 3].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => insertSleepTag(sec)}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-indigo-600 hover:text-white text-indigo-300 border border-slate-700/60 text-[10px] font-mono transition flex items-center gap-1"
                  >
                    <Icons.Plus />
                    <span>[@sleep-{sec}]</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <textarea
                ref={textareaRef}
                rows={4}
                value={card.tts.script}
                onChange={(e) => handleTTSChange('script', e.target.value)}
                placeholder="Digite o roteiro da cena... Exemplo: Olá! [@sleep-1.5] Vamos entender como funciona..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Velocidade ({card.tts.speed}x)
                </label>
                <input
                  type="range"
                  min={0.75}
                  max={1.5}
                  step={0.05}
                  value={card.tts.speed}
                  onChange={(e) => handleTTSChange('speed', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-indigo-500 mt-2"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Provedor TTS</label>
                <select
                  value={card.tts.provider}
                  onChange={(e) => handleTTSChange('provider', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-300"
                >
                  <option value="browser-tts">Browser Speech (Nativo)</option>
                  <option value="elevenlabs">ElevenLabs AI</option>
                  <option value="openai">OpenAI TTS</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const VideoPlayer: React.FC<{
  project: ProjectState;
  currentFrame: number;
  isPlaying: boolean;
  onFrameChange: (frame: number) => void;
  onTogglePlay: () => void;
  calculatedCards: CalculatedCard[];
  totalFrames: number;
  activeCard: CalculatedCard | null;
}> = ({
  project,
  currentFrame,
  isPlaying,
  onFrameChange,
  onTogglePlay,
  calculatedCards,
  totalFrames,
  activeCard,
}) => {
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');

  const localFrame = useMemo(() => {
    if (!activeCard) return 0;
    return Math.max(0, currentFrame - activeCard.startFrame);
  }, [activeCard, currentFrame]);

  const CurrentTemplateComponent = useMemo(() => {
    if (!activeCard) return null;
    const def = CARD_REGISTRY[activeCard.templateId] || CARD_REGISTRY['hero-title'];
    return def?.Component || null;
  }, [activeCard]);

  const timecode = useMemo(() => {
    const fps = project.meta.fps;
    const totalSeconds = Math.floor(currentFrame / fps);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const frames = currentFrame % fps;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
  }, [currentFrame, project.meta.fps]);

  return (
    <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Player Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950/80 text-slate-300">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Remotion Player Preview
          </span>
          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-xs font-mono font-bold">
            {project.meta.fps} FPS
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-800 rounded-lg p-0.5 text-xs font-medium">
            <button
              onClick={() => setAspectRatio('16:9')}
              className={`px-2.5 py-1 rounded-md transition ${
                aspectRatio === '16:9' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              16:9
            </button>
            <button
              onClick={() => setAspectRatio('9:16')}
              className={`px-2.5 py-1 rounded-md transition ${
                aspectRatio === '9:16' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              9:16
            </button>
            <button
              onClick={() => setAspectRatio('1:1')}
              className={`px-2.5 py-1 rounded-md transition ${
                aspectRatio === '1:1' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              1:1
            </button>
          </div>
          <span className="font-mono text-xs text-indigo-400 bg-indigo-950/60 border border-indigo-900/60 px-2.5 py-1 rounded-md">
            {timecode}
          </span>
        </div>
      </div>

      {/* Video Viewport */}
      <div className="w-full bg-black flex items-center justify-center p-4 relative min-h-[360px] md:min-h-[460px] max-h-[540px] overflow-hidden">
        <div
          className={`relative shadow-2xl overflow-hidden transition-all duration-300 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-center ${
            aspectRatio === '16:9'
              ? 'aspect-video w-full max-w-4xl'
              : aspectRatio === '9:16'
              ? 'aspect-[9/16] h-[480px]'
              : 'aspect-square h-[440px]'
          }`}
        >
          {CurrentTemplateComponent && activeCard && (
            <CurrentTemplateComponent
              props={activeCard.props}
              frame={localFrame}
              fps={project.meta.fps}
            />
          )}

          {activeCard && (
            <div className="absolute top-4 left-4 z-30 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-300 text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 font-mono pointer-events-none">
              <span className="text-indigo-400 font-bold">Cena {activeCard.order + 1}:</span>
              <span>{CARD_REGISTRY[activeCard.templateId]?.name || 'Template'}</span>
              <span className="text-slate-500">
                ({localFrame}f / {activeCard.durationInFrames}f)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Transport & Scrubber */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col gap-3">
        <div className="relative w-full">
          <input
            type="range"
            min={0}
            max={Math.max(1, totalFrames - 1)}
            value={currentFrame}
            onChange={(e) => onFrameChange(Number(e.target.value))}
            className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 z-10 relative"
          />
          <div className="absolute inset-0 pointer-events-none flex h-2.5 rounded-lg overflow-hidden">
            {calculatedCards.map((c, i) => {
              const widthPct = (c.durationInFrames / totalFrames) * 100;
              return (
                <div
                  key={c.id}
                  style={{ width: `${widthPct}%` }}
                  className={`h-full border-r border-slate-950 ${
                    i % 2 === 0 ? 'bg-indigo-600/20' : 'bg-slate-700/20'
                  }`}
                />
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onFrameChange(0)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Voltar ao início"
            >
              <Icons.SkipBack />
            </button>
            <button
              onClick={() => onFrameChange(Math.max(0, currentFrame - project.meta.fps))}
              className="px-2 py-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition text-xs font-mono"
              title="-1s"
            >
              -1s
            </button>
            <button
              onClick={onTogglePlay}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition transform active:scale-95"
            >
              {isPlaying ? <Icons.Pause /> : <Icons.Play />}
              <span>{isPlaying ? 'Pausar' : 'Reproduzir'}</span>
            </button>
            <button
              onClick={() =>
                onFrameChange(Math.min(totalFrames - 1, currentFrame + project.meta.fps))
              }
              className="px-2 py-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition text-xs font-mono"
              title="+1s"
            >
              +1s
            </button>
            <button
              onClick={() => onFrameChange(totalFrames - 1)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Ir para o final"
            >
              <Icons.SkipForward />
            </button>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Frame: <span className="text-white font-bold">{currentFrame}</span> / {totalFrames} (
            {(totalFrames / project.meta.fps).toFixed(1)}s total)
          </div>
        </div>
      </div>
    </div>
  );
};

const TimelineCardStrip: React.FC<{
  cards: CalculatedCard[];
  selectedCardId: string;
  onSelectCard: (id: string) => void;
  onReorderCards: (newCards: VideoCard[]) => void;
  onDuplicateCard: (cardId: string) => void;
  onDeleteCard: (cardId: string) => void;
  onOpenCatalog: () => void;
  currentFrame: number;
  onSeekToCard: (startFrame: number) => void;
}> = ({
  cards,
  selectedCardId,
  onSelectCard,
  onReorderCards,
  onDuplicateCard,
  onDeleteCard,
  onOpenCatalog,
  currentFrame,
  onSeekToCard,
}) => {
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;

    const updated = [...cards];
    const item = updated.splice(draggedIdx, 1)[0];
    updated.splice(idx, 0, item);

    const ordered = updated.map((c, i) => ({ ...c, order: i }));
    onReorderCards(ordered);
    setDraggedIdx(idx);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Icons.Film />
            <span>Timeline de Cenas ({cards.length} Cards)</span>
          </span>
          <span className="text-[11px] text-slate-500">
            Arraste para reordenar • Clique para navegar
          </span>
        </div>

        <button
          onClick={onOpenCatalog}
          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-md shadow-indigo-600/20"
        >
          <Icons.Plus />
          <span>Adicionar Cena</span>
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 pt-1">
        {cards.map((card, idx) => {
          const isSelected = card.id === selectedCardId;
          const isPlayingThis = currentFrame >= card.startFrame && currentFrame < card.endFrame;
          const templateDef = CARD_REGISTRY[card.templateId] || CARD_REGISTRY['hero-title'];
          const IconComp = TemplateIconMap[templateDef.iconName] || Icons.Film;

          return (
            <div
              key={card.id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onClick={() => {
                onSelectCard(card.id);
                onSeekToCard(card.startFrame);
              }}
              className={`min-w-[210px] max-w-[210px] bg-slate-950 border rounded-xl p-3 cursor-pointer transition select-none relative group flex flex-col justify-between ${
                isPlayingThis
                  ? 'border-emerald-500 ring-2 ring-emerald-500/40 shadow-emerald-500/10 shadow-xl'
                  : isSelected
                  ? 'border-indigo-500 ring-2 ring-indigo-500/40 shadow-indigo-500/10 shadow-xl'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {isPlayingThis && (
                <div className="absolute -top-2.5 left-3 bg-emerald-500 text-slate-950 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-950" /> Em Exibição
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold text-slate-500">
                    #{idx + 1}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateCard(card.id);
                      }}
                      title="Duplicar cena"
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                    >
                      <Icons.Copy />
                    </button>
                    {cards.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCard(card.id);
                        }}
                        title="Excluir cena"
                        className="p-1 hover:bg-slate-800 rounded text-rose-400 hover:text-rose-300"
                      >
                        <Icons.Trash />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-indigo-400 flex items-center justify-center shrink-0">
                    <IconComp />
                  </div>
                  <div className="overflow-hidden">
                    <h5 className="text-xs font-bold text-white truncate">{templateDef.name}</h5>
                    <p className="text-[10px] text-slate-400 truncate">
                      {card.props.title ||
                        card.props.conceptTitle ||
                        card.props.headline ||
                        'Sem título'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>{card.totalDurationInSeconds}s</span>
                <span className="text-indigo-400 font-semibold">{card.durationInFrames}f</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TemplateCatalogModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (templateId: string) => void;
  fps: number;
}> = ({ isOpen, onClose, onSelectTemplate, fps }) => {
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [previewTemplateId, setPreviewTemplateId] = useState<string>('hero-title');
  const [previewFrame, setPreviewFrame] = useState<number>(15);
  const [isAnimatingPreview, setIsAnimatingPreview] = useState<boolean>(true);

  const categories = [
    'Todos',
    'Abertura & Título',
    'Mídia & Demonstração',
    'Conceitos & Explicações',
    'Arquitetura & IA',
    'Dados, Métricas & Encerramento',
  ];

  const templateList = useMemo(() => Object.values(CARD_REGISTRY), []);
  const filtered =
    activeCategory === 'Todos'
      ? templateList
      : templateList.filter((t) => t.category === activeCategory);

  const activePreviewDef = CARD_REGISTRY[previewTemplateId] || templateList[0];

  useEffect(() => {
    if (!isOpen || !isAnimatingPreview) return;
    const interval = setInterval(() => {
      setPreviewFrame((f) => (f + 1) % 75);
    }, 1000 / 30);
    return () => clearInterval(interval);
  }, [isOpen, isAnimatingPreview]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-6xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Icons.Sparkles />
              <span>Loja de Templates Remotion (30 Modelos Modulares)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Selecione qualquer template para visualizar o preview animado com suporte a mídias e listas dinâmicas.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm"
          >
            <Icons.Close />
          </button>
        </div>

        <div className="flex gap-2 my-4 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden min-h-0">
          <div className="lg:col-span-7 overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[58vh]">
            {filtered.map((tmpl) => {
              const isSelected = tmpl.id === previewTemplateId;
              const IconComp = TemplateIconMap[tmpl.iconName] || Icons.Film;

              return (
                <div
                  key={tmpl.id}
                  onClick={() => setPreviewTemplateId(tmpl.id)}
                  className={`bg-slate-950 border rounded-2xl p-4 cursor-pointer transition flex flex-col justify-between group ${
                    isSelected
                      ? 'border-indigo-500 ring-2 ring-indigo-500/40 bg-slate-900/60'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-950/60 border border-indigo-900/50 text-indigo-400 flex items-center justify-center">
                        <IconComp />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {tmpl.category}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">
                      {tmpl.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                      {tmpl.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500 text-[11px]">Ver Preview</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTemplate(tmpl.id);
                        onClose();
                      }}
                      className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition flex items-center gap-1 shadow-md shadow-indigo-600/30"
                    >
                      <Icons.Plus />
                      <span>Adicionar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-5 flex flex-col bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                <span className="text-xs font-bold text-white">Preview Animado ao Vivo</span>
              </div>
              <button
                onClick={() => setIsAnimatingPreview(!isAnimatingPreview)}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-mono"
              >
                {isAnimatingPreview ? '⏸ Pausar Loop' : '▶ Reproduzir Loop'}
              </button>
            </div>

            <div className="w-full aspect-video bg-black rounded-xl border border-slate-800 overflow-hidden relative shadow-inner flex items-center justify-center">
              {activePreviewDef?.Component && (
                <div className="w-full h-full transform scale-75 origin-center">
                  <activePreviewDef.Component
                    props={activePreviewDef.defaultProps}
                    frame={previewFrame}
                    fps={fps}
                  />
                </div>
              )}
            </div>

            <div className="mt-4 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-base font-bold text-white">{activePreviewDef.name}</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {activePreviewDef.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-mono text-slate-400">
                  <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded">
                    FPS: {fps}
                  </span>
                  <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded">
                    Campos no Formulário: {activePreviewDef.schema.length}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  onSelectTemplate(activePreviewDef.id);
                  onClose();
                }}
                className="w-full mt-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition"
              >
                <Icons.Plus />
                <span>Adicionar Este Template ao Vídeo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const JsonModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  project: ProjectState;
  onImport: (imported: ProjectState) => void;
}> = ({ isOpen, onClose, project, onImport }) => {
  const [jsonText, setJsonText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setJsonText(JSON.stringify(project, null, 2));
      setErrorMsg(null);
      setCopied(false);
    }
  }, [isOpen, project]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `video-project-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        setJsonText(content);
        const parsed = JSON.parse(content);
        if (!parsed.meta || !Array.isArray(parsed.cards)) {
          throw new Error('Formato inválido. O JSON deve conter "meta" e "cards".');
        }
        onImport(parsed);
        onClose();
      } catch (err: any) {
        setErrorMsg(err.message || 'Erro ao carregar arquivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleValidateAndImport = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed.meta || !Array.isArray(parsed.cards)) {
        throw new Error('JSON inválido: O arquivo deve conter os nós "meta" e o array "cards".');
      }
      onImport(parsed);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao analisar JSON.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Icons.Download />
              <span>Importar / Exportar Projeto (JSON)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Copie o código JSON ou faça upload de um arquivo para restaurar seu projeto.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm"
          >
            <Icons.Close />
          </button>
        </div>

        {errorMsg && (
          <div className="my-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {errorMsg}
          </div>
        )}

        <div className="flex-1 py-4">
          <textarea
            rows={13}
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value);
              setErrorMsg(null);
            }}
            className="w-full h-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-indigo-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Icons.Copy />
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Icons.Download />
              <span>Baixar .json</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Icons.Upload />
              <span>Subir Arquivo</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          <button
            onClick={handleValidateAndImport}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30"
          >
            Importar e Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [project, setProject] = useState<ProjectState>(INITIAL_PROJECT_STATE);
  const [selectedCardId, setSelectedCardId] = useState<string>(project.cards[0]?.id || '');
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState<boolean>(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState<boolean>(false);

  const { calculatedCards, totalFrames } = useMemo(() => {
    return calculateTimeline(project.cards, project.meta.fps);
  }, [project.cards, project.meta.fps]);

  const activeCard = useMemo(() => {
    const found = calculatedCards.find(
      (c) => currentFrame >= c.startFrame && currentFrame < c.endFrame
    );
    return found || calculatedCards[0] || null;
  }, [calculatedCards, currentFrame]);

  useEffect(() => {
    if (activeCard && activeCard.id !== selectedCardId) {
      setSelectedCardId(activeCard.id);
    }
  }, [activeCard?.id]);

  const selectedCard = useMemo(() => {
    return calculatedCards.find((c) => c.id === selectedCardId) || activeCard;
  }, [calculatedCards, selectedCardId, activeCard]);

  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = 1000 / project.meta.fps;
    const timer = setInterval(() => {
      setCurrentFrame((prev) => {
        if (prev >= totalFrames - 1) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, totalFrames, project.meta.fps]);

  const handleUpdateCard = (updated: VideoCard) => {
    setProject((prev) => ({
      ...prev,
      cards: prev.cards.map((c) => (c.id === updated.id ? updated : c)),
    }));
  };

  const handleDuplicateCard = (cardId: string) => {
    const target = project.cards.find((c) => c.id === cardId);
    if (!target) return;

    const newCard: VideoCard = {
      ...target,
      id: `card-${Date.now()}`,
      order: target.order + 1,
      props: {
        ...target.props,
        title: target.props.title ? `${target.props.title} (Cópia)` : undefined,
      },
    };

    const newCards = [...project.cards];
    newCards.splice(target.order + 1, 0, newCard);
    const reordered = newCards.map((c, idx) => ({ ...c, order: idx }));

    setProject((prev) => ({ ...prev, cards: reordered }));
    setSelectedCardId(newCard.id);
  };

  const handleDeleteCard = (cardId: string) => {
    if (project.cards.length <= 1) return;
    const remaining = project.cards.filter((c) => c.id !== cardId);
    const reordered = remaining.map((c, idx) => ({ ...c, order: idx }));
    setProject((prev) => ({ ...prev, cards: reordered }));
    setSelectedCardId(reordered[0]?.id || '');
  };

  const handleAddFromTemplate = (templateId: string) => {
    const def = CARD_REGISTRY[templateId];
    if (!def) return;

    const newCard: VideoCard = {
      id: `card-${Date.now()}`,
      order: project.cards.length,
      templateId: def.id,
      durationMode: 'auto',
      manualDurationInFrames: 120,
      manualDurationInSeconds: 4.0,
      audioPaddingEndInSeconds: 0.8,
      tts: {
        script: `Apresentamos agora o conceito sobre ${def.name}. [@sleep-1.0] Aprofunde os detalhes no editor.`,
        voiceId: 'pt-BR-Antonio',
        provider: 'browser-tts',
        speed: 1.0,
      },
      props: { ...def.defaultProps },
    };

    setProject((prev) => ({
      ...prev,
      cards: [...prev.cards, newCard],
    }));
    setSelectedCardId(newCard.id);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Icons.Film />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Remotion Card Video Studio</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono font-normal">
                v3.2 • Modular & Mídia
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 truncate max-w-md">
              {project.meta.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCatalogOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-semibold flex items-center gap-2 transition"
          >
            <Icons.Sparkles />
            <span>Loja de Templates</span>
          </button>
          <button
            onClick={() => setIsJsonModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition border border-slate-700"
          >
            <Icons.Download />
            <span>JSON Import / Export</span>
          </button>
        </div>
      </header>

      {/* Main Studio Workspace */}
      <main className="flex-1 p-6 flex flex-col gap-6 max-w-[1700px] w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
          {/* Central Remotion Player (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <VideoPlayer
              project={project}
              currentFrame={currentFrame}
              isPlaying={isPlaying}
              onFrameChange={setCurrentFrame}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              calculatedCards={calculatedCards}
              totalFrames={totalFrames}
              activeCard={activeCard}
            />
          </div>

          {/* Modular Dynamic Inspector (5 Cols) */}
          <div className="lg:col-span-5 h-[580px] lg:h-[620px]">
            <CardInspector
              card={selectedCard}
              onUpdateCard={handleUpdateCard}
              fps={project.meta.fps}
            />
          </div>
        </div>

        {/* Bottom Horizontal Timeline Filmstrip */}
        <div className="w-full">
          <TimelineCardStrip
            cards={calculatedCards}
            selectedCardId={selectedCardId}
            onSelectCard={setSelectedCardId}
            onReorderCards={(newCards) => setProject((prev) => ({ ...prev, cards: newCards }))}
            onDuplicateCard={handleDuplicateCard}
            onDeleteCard={handleDeleteCard}
            onOpenCatalog={() => setIsCatalogOpen(true)}
            currentFrame={currentFrame}
            onSeekToCard={(frame) => setCurrentFrame(frame)}
          />
        </div>
      </main>

      {/* Modals */}
      <TemplateCatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        onSelectTemplate={handleAddFromTemplate}
        fps={project.meta.fps}
      />

      <JsonModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        project={project}
        onImport={(imported) => {
          setProject(imported);
          setSelectedCardId(imported.cards[0]?.id || '');
          setCurrentFrame(0);
        }}
      />
    </div>
  );
}