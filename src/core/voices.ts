export interface VoiceOption {
  id: string;
  name: string;
  lang: string;
  gender: 'Masculino' | 'Feminino' | 'Male' | 'Female';
  provider: 'cromyvoice' | 'browser-tts' | 'elevenlabs' | 'openai';
  description: string;
  recommended?: boolean;
}

export interface TTSProviderOption {
  id: 'cromyvoice' | 'browser-tts' | 'elevenlabs' | 'openai';
  name: string;
  badge: string;
  description: string;
  isLocal: boolean;
}

export const TTS_PROVIDERS: TTSProviderOption[] = [
  {
    id: 'cromyvoice',
    name: 'CromyVoice',
    badge: 'Motor Neural Nativo',
    description: 'Vozes neurais de estúdio locais de alta fidelidade sem custo ou limites de API.',
    isLocal: true,
  },
  {
    id: 'browser-tts',
    name: 'Navegador Web',
    badge: 'Web Speech API',
    description: 'Vozes locais instaladas no sistema operacional do navegador.',
    isLocal: true,
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    badge: 'Nuvem / Clonagem',
    description: 'Vozes ultrarrealistas via chave de API externa.',
    isLocal: false,
  },
  {
    id: 'openai',
    name: 'OpenAI TTS',
    badge: 'TTS-1 HD',
    description: 'Vozes neurais da OpenAI (Alloy, Echo, Nova, Onyx).',
    isLocal: false,
  },
];

export const CROMY_VOICES: VoiceOption[] = [
  {
    id: 'pt-BR-AntonioNeural',
    name: 'Antonio (Neural)',
    lang: 'pt-BR',
    gender: 'Masculino',
    provider: 'cromyvoice',
    description: 'Voz natural e calorosa em português brasileiro. Excelente para tutoriais e apresentações.',
    recommended: true,
  },
  {
    id: 'pt-BR-FranciscaNeural',
    name: 'Francisca (Neural)',
    lang: 'pt-BR',
    gender: 'Feminino',
    provider: 'cromyvoice',
    description: 'Voz neural corporativa clara e polida. Excelente para vídeos institucionais e negócios.',
    recommended: true,
  },
  {
    id: 'pt-BR-BrendaNeural',
    name: 'Brenda (Neural)',
    lang: 'pt-BR',
    gender: 'Feminino',
    provider: 'cromyvoice',
    description: 'Voz jovem, ágil e expressiva. Perfeita para shorts, reels e produtos modernos.',
    recommended: true,
  },
  {
    id: 'pt-BR-DonatoNeural',
    name: 'Donato (Neural)',
    lang: 'pt-BR',
    gender: 'Masculino',
    provider: 'cromyvoice',
    description: 'Voz grave, solene e cinematográfica. Ideal para documentários e análises profundas.',
  },
  {
    id: 'pt-BR-ElzaNeural',
    name: 'Elza (Neural)',
    lang: 'pt-BR',
    gender: 'Feminino',
    provider: 'cromyvoice',
    description: 'Voz suave, pausada e explicativa. Ideal para conceitos complexos e aulas.',
  },
  {
    id: 'pt-BR-FabioNeural',
    name: 'Fabio (Neural)',
    lang: 'pt-BR',
    gender: 'Masculino',
    provider: 'cromyvoice',
    description: 'Voz masculina dinâmica e descontraída para redes sociais e vlogs.',
  },
  {
    id: 'pt-BR-NicolauNeural',
    name: 'Nicolau (Neural)',
    lang: 'pt-BR',
    gender: 'Masculino',
    provider: 'cromyvoice',
    description: 'Voz clássica, madura e equilibrada.',
  },
  {
    id: 'pt-BR-ValerioNeural',
    name: 'Valerio (Neural)',
    lang: 'pt-BR',
    gender: 'Masculino',
    provider: 'cromyvoice',
    description: 'Voz firme, assertiva e confiante.',
  },
  {
    id: 'pt-BR-YaraNeural',
    name: 'Yara (Neural)',
    lang: 'pt-BR',
    gender: 'Feminino',
    provider: 'cromyvoice',
    description: 'Voz jovem, nítida, brilhante e energética.',
  },
  {
    id: 'en-US-GuyNeural',
    name: 'Guy (US Neural)',
    lang: 'en-US',
    gender: 'Male',
    provider: 'cromyvoice',
    description: 'Voz masculina em inglês americano internacional.',
  },
  {
    id: 'en-US-JennyNeural',
    name: 'Jenny (US Neural)',
    lang: 'en-US',
    gender: 'Female',
    provider: 'cromyvoice',
    description: 'Voz feminina natural em inglês americano.',
  },
  {
    id: 'en-US-AriaNeural',
    name: 'Aria (US Neural)',
    lang: 'en-US',
    gender: 'Female',
    provider: 'cromyvoice',
    description: 'Voz feminina altamente expressiva em inglês.',
  },
  {
    id: 'es-ES-AlvaroNeural',
    name: 'Alvaro (ES Neural)',
    lang: 'es-ES',
    gender: 'Masculino',
    provider: 'cromyvoice',
    description: 'Voz em espanhol neutro para alcance hispanofalante.',
  },
  {
    id: 'es-ES-ElviraNeural',
    name: 'Elvira (ES Neural)',
    lang: 'es-ES',
    gender: 'Feminino',
    provider: 'cromyvoice',
    description: 'Voz feminina elegante em espanhol europeu.',
  },
];

export const BROWSER_VOICES: VoiceOption[] = [
  {
    id: 'pt-BR-Antonio',
    name: 'Antonio (Padrão)',
    lang: 'pt-BR',
    gender: 'Masculino',
    provider: 'browser-tts',
    description: 'Voz masculina em português do navegador.',
    recommended: true,
  },
  {
    id: 'pt-BR-Francisca',
    name: 'Francisca (Padrão)',
    lang: 'pt-BR',
    gender: 'Feminino',
    provider: 'browser-tts',
    description: 'Voz feminina em português do navegador.',
    recommended: true,
  },
  {
    id: 'pt-BR-Brenda',
    name: 'Brenda (Padrão)',
    lang: 'pt-BR',
    gender: 'Feminino',
    provider: 'browser-tts',
    description: 'Voz jovem em português do navegador.',
  },
];

export function getVoicesForProvider(provider: string): VoiceOption[] {
  if (provider === 'cromyvoice') {
    return CROMY_VOICES;
  }
  if (provider === 'browser-tts') {
    return BROWSER_VOICES;
  }
  return CROMY_VOICES;
}

export function normalizeVoiceId(voiceId: string = 'pt-BR-AntonioNeural'): string {
  if (!voiceId) return 'pt-BR-AntonioNeural';
  if (voiceId.endsWith('Neural')) return voiceId;
  // Se for pt-BR-Antonio -> pt-BR-AntonioNeural
  const match = CROMY_VOICES.find((v) => v.id.startsWith(voiceId) || v.id === `${voiceId}Neural`);
  if (match) return match.id;
  return `${voiceId}Neural`;
}
