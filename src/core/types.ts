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
  itemSchema?: Array<{
    name: string;
    label: string;
    type: FieldType;
    defaultValue?: any;
  }>;
}

// ---------------------------------------------------------------------------
// Tipagem Polimórfica de Áudio (Discriminated Union Extensível)
// ---------------------------------------------------------------------------
export type AudioMode = 'tts' | 'file' | 'record';

export interface TTSAudioConfig {
  mode: 'tts';
  script: string;
  voiceId: string;
  provider: 'cromyvoice' | 'browser-tts' | 'elevenlabs' | 'openai';
  speed: number;
  audioDurationInSeconds?: number;
}


export interface FileAudioConfig {
  mode: 'file';
  fileUrl: string;
  audioUrl?: string;
  fileName?: string;
  audioDurationInSeconds: number;
}

export interface RecordAudioConfig {
  mode: 'record';
  blobUrl: string;
  audioDurationInSeconds: number;
}

export type CardAudioConfig = TTSAudioConfig | FileAudioConfig | RecordAudioConfig;

// ---------------------------------------------------------------------------
// Tipagem do Motor de Transições Inter-Cenas
// ---------------------------------------------------------------------------
export type TransitionType =
  | 'none'
  | 'fade'
  | 'slide-left'
  | 'slide-right'
  | 'zoom-in'
  | 'wipe-left';

export interface CardTransitionConfig {
  type: TransitionType;
  durationInFrames: number;
}

export interface VideoCard {
  id: string;
  order: number;
  templateId: string;
  durationMode: 'auto' | 'manual';
  manualDurationInFrames: number;
  manualDurationInSeconds?: number;
  audioPaddingEndInSeconds: number;
  audio: CardAudioConfig;
  transition?: CardTransitionConfig;
  /** Compatibilidade transitória com código legado */
  tts?: {
    script: string;
    voiceId: string;
    provider: string;
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

export interface TemplateRenderProps {
  props: Record<string, any>;
  frame: number;
  fps: number;
}

export type TemplateComponent = (props: TemplateRenderProps) => any;

export type TemplateCategory =
  | 'Abertura & Título'
  | 'Mídia & Demonstração'
  | 'Conceitos & Explicações'
  | 'Arquitetura & IA'
  | 'Dados, Métricas & Encerramento'
  | 'Customizados';

export interface TemplateDefinition {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  iconName: string;
  defaultDurationInFrames?: number;
  minDurationInFrames?: number;
  defaultProps: Record<string, any>;
  schema: FieldDefinition[];
  Component: TemplateComponent;
}

export interface CalculatedCard extends VideoCard {
  durationInFrames: number;
  startFrame: number;
  endFrame: number;
  totalDurationInSeconds: number;
}

export interface ParsedScriptSegment {
  type: 'speech' | 'sleep';
  text?: string;
  sleepDuration?: number;
}

export interface ParsedScriptResult {
  cleanText: string;
  totalSleepSeconds: number;
  speechEstimatedSeconds: number;
  totalDurationSeconds: number;
  segments: ParsedScriptSegment[];
}
