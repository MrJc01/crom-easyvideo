import type { ITTSProvider } from '../interface';
import { parseScriptAndDelays } from '../../core/timeline';

export class BrowserTTSProvider implements ITTSProvider {
  id = 'browser-tts' as const;

  async synthesize(
    script: string,
    _voiceId: string,
    speed: number = 1.0,
    _outputPath?: string
  ): Promise<{ audioUrl: string; durationInSeconds: number }> {
    const parsed = parseScriptAndDelays(script, speed);
    return {
      audioUrl: '',
      durationInSeconds: parsed.totalDurationSeconds,
    };
  }
}

export const browserTtsProvider = new BrowserTTSProvider();

export function isSpeechSynthesisSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof SpeechSynthesisUtterance !== 'undefined'
  );
}

export function stopSpeechSynthesis(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}

export function playScriptWithSpeechSynthesis(
  script: string,
  speed: number = 1.0,
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err?: unknown) => void;
  },
  voiceId?: string
): () => void {
  if (!isSpeechSynthesisSupported()) {
    callbacks?.onError?.('SpeechSynthesis não suportado');
    return () => {};
  }

  stopSpeechSynthesis();

  const parsed = parseScriptAndDelays(script, speed);
  const segments = parsed.segments;

  if (segments.length === 0) {
    callbacks?.onEnd?.();
    return () => {};
  }

  callbacks?.onStart?.();

  let segmentIndex = 0;
  let timeoutId: number | null = null;
  let isCancelled = false;

  // Busca vozes disponíveis no navegador
  const voices = typeof window !== 'undefined' ? window.speechSynthesis.getVoices() : [];
  const selectedVoice = voiceId
    ? voices.find((v) => v.name === voiceId || v.voiceURI === voiceId) ||
      voices.find((v) => v.lang.startsWith('pt')) ||
      null
    : voices.find((v) => v.lang.startsWith('pt')) || null;

  const playNextSegment = () => {
    if (isCancelled) return;

    if (segmentIndex >= segments.length) {
      callbacks?.onEnd?.();
      return;
    }

    const seg = segments[segmentIndex];
    segmentIndex++;

    if (seg.type === 'sleep') {
      const ms = Math.max(50, (seg.sleepDuration || 1) * 1000);
      timeoutId = window.setTimeout(playNextSegment, ms);
    } else {
      const utterance = new SpeechSynthesisUtterance(seg.text || '');
      utterance.rate = Math.max(0.5, Math.min(2.0, speed));
      utterance.lang = 'pt-BR';
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onend = () => {
        if (!isCancelled) {
          playNextSegment();
        }
      };

      utterance.onerror = (e) => {
        // Se foi cancelado intencionalmente, não considera erro
        if (!isCancelled && e.error !== 'canceled' && e.error !== 'interrupted') {
          // Se o sintetizador do sistema falhar (ex: synthesis-failed em Linux/Docker ou sem voz instalada),
          // utiliza temporizador gracioso baseado na velocidade da fala para manter o slide sincronizado
          if (
            e.error === 'synthesis-failed' ||
            e.error === 'audio-busy' ||
            e.error === 'not-allowed' ||
            e.error === 'language-unavailable'
          ) {
            const words = (seg.text || '').trim().split(/\s+/).filter(Boolean).length;
            const fallbackMs = Math.max(1000, Math.round((words / (2.2 * Math.max(0.5, speed))) * 1000));
            timeoutId = window.setTimeout(() => {
              if (!isCancelled) playNextSegment();
            }, fallbackMs);
            return;
          }
          callbacks?.onError?.(e);
        }
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch {
        // Fallback em caso de exceção síncrona
        const words = (seg.text || '').trim().split(/\s+/).filter(Boolean).length;
        const fallbackMs = Math.max(1000, Math.round((words / (2.2 * Math.max(0.5, speed))) * 1000));
        timeoutId = window.setTimeout(() => {
          if (!isCancelled) playNextSegment();
        }, fallbackMs);
      }
    }
  };

  playNextSegment();

  return () => {
    isCancelled = true;
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    stopSpeechSynthesis();
  };
}
