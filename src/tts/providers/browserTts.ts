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
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
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
    onError?: () => void;
  }
): () => void {
  if (!isSpeechSynthesisSupported()) {
    callbacks?.onError?.();
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

  const playNextSegment = () => {
    if (isCancelled) return;

    if (segmentIndex >= segments.length) {
      callbacks?.onEnd?.();
      return;
    }

    const seg = segments[segmentIndex];
    segmentIndex++;

    if (seg.type === 'sleep') {
      const ms = (seg.sleepDuration || 1) * 1000;
      timeoutId = window.setTimeout(playNextSegment, ms);
    } else {
      const utterance = new SpeechSynthesisUtterance(seg.text || '');
      utterance.rate = speed;
      utterance.lang = 'pt-BR';
      utterance.onend = () => {
        if (!isCancelled) playNextSegment();
      };
      utterance.onerror = () => {
        if (!isCancelled) callbacks?.onError?.();
      };
      window.speechSynthesis.speak(utterance);
    }
  };

  playNextSegment();

  return () => {
    isCancelled = true;
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    stopSpeechSynthesis();
  };
}
