import type {
  ParsedScriptResult,
  ParsedScriptSegment,
  VideoCard,
  CalculatedCard,
} from './types';

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
