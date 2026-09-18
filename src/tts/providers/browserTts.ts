import type { ITTSProvider } from '../interface';
import { parseScriptAndDelays } from '../../core/timeline';

let activeAudioElement: HTMLAudioElement | null = null;
let activeAudioContext: AudioContext | null = null;

export class BrowserTTSProvider implements ITTSProvider {
  id = 'browser-tts' as const;

  async synthesize(
    script: string,
    _voiceId: string,
    speed: number = 1.0,
    _outputPath?: string
  ): Promise<{ audioUrl: string; durationInSeconds: number }> {
    const parsed = parseScriptAndDelays(script, speed);
    const audioUrl = `/api/tts?text=${encodeURIComponent(script)}&lang=pt-BR`;
    return {
      audioUrl,
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
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.src = '';
    } catch {}
    activeAudioElement = null;
  }
  if (activeAudioContext) {
    try {
      activeAudioContext.close().catch(() => {});
    } catch {}
    activeAudioContext = null;
  }
}

/**
 * Sintetizador Web Audio de cadência sonora para fallback offline
 */
function playWebAudioBeep(text: string, speed: number, onDone: () => void): void {
  try {
    if (typeof window === 'undefined') {
      onDone();
      return;
    }
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) {
      onDone();
      return;
    }
    const ctx = new AudioCtx();
    activeAudioContext = ctx;

    const words = text.trim().split(/\s+/).filter(Boolean);
    const wordDuration = Math.max(0.12, 0.28 / Math.max(0.5, speed));
    const totalTime = Math.max(0.6, words.length * wordDuration);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, ctx.currentTime);

    words.forEach((_, idx) => {
      const t = ctx.currentTime + idx * wordDuration;
      osc.frequency.setValueAtTime(240 + (idx % 4) * 35, t);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + wordDuration * 0.85);
    });

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + totalTime);

    osc.onended = () => {
      if (activeAudioContext === ctx) activeAudioContext = null;
      ctx.close().catch(() => {});
      onDone();
    };
  } catch {
    onDone();
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
  stopSpeechSynthesis();

  if (typeof window !== 'undefined' && isSpeechSynthesisSupported()) {
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch {}
  }

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

  // Busca dinamicamente vozes locais instaladas no navegador
  const getSelectedVoice = () => {
    const voices =
      typeof window !== 'undefined' && isSpeechSynthesisSupported()
        ? window.speechSynthesis.getVoices()
        : [];
    if (voices.length === 0) return null;
    if (voiceId) {
      const match = voices.find((v) => v.name === voiceId || v.voiceURI === voiceId);
      if (match) return match;
    }
    return (
      voices.find((v) => v.lang.startsWith('pt')) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      voices[0] ||
      null
    );
  };

  const playWithAudioApi = (text: string, onDone: () => void) => {
    if (isCancelled) return;
    try {
      const audio = new Audio(`/api/tts?text=${encodeURIComponent(text)}&lang=pt-BR`);
      activeAudioElement = audio;
      audio.playbackRate = Math.max(0.5, Math.min(2.0, speed));
      audio.onended = () => {
        if (activeAudioElement === audio) activeAudioElement = null;
        if (!isCancelled) onDone();
      };
      audio.onerror = () => {
        if (activeAudioElement === audio) activeAudioElement = null;
        playWebAudioBeep(text, speed, () => {
          if (!isCancelled) onDone();
        });
      };
      audio.play().catch((err) => {
        console.warn('[Crom TTS] Audio play bloqueado ou offline:', err);
        if (activeAudioElement === audio) activeAudioElement = null;
        playWebAudioBeep(text, speed, () => {
          if (!isCancelled) onDone();
        });
      });
    } catch {
      playWebAudioBeep(text, speed, () => {
        if (!isCancelled) onDone();
      });
    }
  };

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
      const text = seg.text || '';
      if (!text.trim()) {
        playNextSegment();
        return;
      }

      const availableVoices =
        typeof window !== 'undefined' && isSpeechSynthesisSupported()
          ? window.speechSynthesis.getVoices()
          : [];

      // Se não há vozes nativas no navegador (ex: Chrome no Linux), usa a API de áudio direto
      if (availableVoices.length === 0) {
        playWithAudioApi(text, playNextSegment);
        return;
      }

      // Caso haja vozes locais, tenta a síntese nativa com fallback transparente
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = Math.max(0.5, Math.min(2.0, speed));
      utterance.lang = 'pt-BR';
      const voice = getSelectedVoice();
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onend = () => {
        if (!isCancelled) {
          playNextSegment();
        }
      };

      utterance.onerror = (e) => {
        if (isCancelled || e.error === 'canceled' || e.error === 'interrupted') return;

        // Se falhar nativamente, migra automaticamente para o motor de áudio
        console.warn('[Crom TTS] Fala nativa falhou (' + e.error + '). Acionando motor de áudio.');
        playWithAudioApi(text, playNextSegment);
      };

      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.speak(utterance);
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch (err) {
        console.warn('[Crom TTS] Exceção ao chamar speechSynthesis.speak:', err);
        playWithAudioApi(text, playNextSegment);
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

