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
    provider: 'elevenlabs' | 'openai' | 'browser-tts' | string;
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
