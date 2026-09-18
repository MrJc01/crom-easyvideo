import type {
  ParsedScriptResult,
  ParsedScriptSegment,
  VideoCard,
  CalculatedCard,
} from './types';
import { CARD_REGISTRY } from '../templates/registry';

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
  const segments: ParsedScriptSegment[] = [];

  let lastIndex = 0;
  let match: RegExpExecArray | null;

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
  // Margem de segurança conservadora para fala
  const speechEstimatedSeconds = words > 0 ? words / (2.0 * Math.max(0.5, speed)) : 0;
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

/**
 * Calcula os intervalos exatos da timeline baseados no áudio real.
 * Garante que o card nunca corte a narração antes do seu término completo.
 */
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
      let baseAudioDuration = 3.0;

      if (card.audio) {
        if (card.audio.mode === 'file' || card.audio.mode === 'record') {
          // Áudio real carregado ou gravado: duração milimétrica exata
          baseAudioDuration = Math.max(0.5, card.audio.audioDurationInSeconds || 2.0);
        } else if (card.audio.mode === 'tts') {
          if (card.audio.audioDurationInSeconds && card.audio.audioDurationInSeconds > 0) {
            baseAudioDuration = card.audio.audioDurationInSeconds;
          } else {
            const parsed = parseScriptAndDelays(card.audio.script || '', card.audio.speed || 1.0);
            baseAudioDuration = parsed.totalDurationSeconds;
          }
        }
      } else if (card.tts) {
        // Fallback transitório
        const parsed = parseScriptAndDelays(card.tts.script || '', card.tts.speed || 1.0);
        baseAudioDuration = card.tts.audioDurationInSeconds || parsed.totalDurationSeconds;
      }

      const padding = card.audioPaddingEndInSeconds ?? 0.8;
      totalDurationInSeconds = Math.round((baseAudioDuration + padding) * 10) / 10;
      
      let minFrames = 30;
      const def = CARD_REGISTRY[card.templateId];
      if (def?.minDurationInFrames) {
        minFrames = Math.max(minFrames, def.minDurationInFrames);
      } else if (def?.defaultDurationInFrames) {
        minFrames = Math.max(minFrames, def.defaultDurationInFrames);
      }

      durationInFrames = Math.max(minFrames, Math.ceil(totalDurationInSeconds * fps));
      totalDurationInSeconds = Math.max(totalDurationInSeconds, durationInFrames / fps);
    } else {
      if (card.manualDurationInFrames) {
        durationInFrames = Math.max(15, card.manualDurationInFrames);
        totalDurationInSeconds = durationInFrames / fps;
      } else if (card.manualDurationInSeconds) {
        totalDurationInSeconds = card.manualDurationInSeconds;
        durationInFrames = Math.ceil(totalDurationInSeconds * fps);
      }
    }

    const calculated: CalculatedCard = {
      ...card,
      durationInFrames,
      startFrame: currentStart,
      endFrame: currentStart + durationInFrames,
      totalDurationInSeconds,
    };

    currentStart += durationInFrames;
    return calculated;
  });

  return {
    calculatedCards,
    totalFrames: Math.max(1, currentStart),
  };
}
