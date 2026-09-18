import type { ProjectState, CalculatedCard } from './types';
import { CARD_REGISTRY } from '../templates/registry';
import { spring } from './animations';
import { normalizeVoiceId } from './voices';

export interface PlatformPreset {
  id: string;
  name: string;
  platform: string;
  badge: string;
  aspectRatio: string;
  width: number;
  height: number;
  icon: string;
  description: string;
}

/**
 * Plataformas e Proporções de Vídeo Suportadas.
 * Cada formato define sua resolução base de design canônica.
 */
export const PLATFORM_PRESETS: PlatformPreset[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    platform: 'YouTube / Widescreen',
    badge: '16:9 (1920×1080)',
    aspectRatio: '16:9',
    width: 1920,
    height: 1080,
    icon: '',
    description: 'Padrão widescreen 16:9 para YouTube, computadores e TVs',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    platform: 'TikTok / Reels / Shorts',
    badge: '9:16 (1080×1920)',
    aspectRatio: '9:16',
    width: 1080,
    height: 1920,
    icon: '',
    description: 'Formato vertical tela cheia 9:16 para smartphones',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    platform: 'Feed Quadrado',
    badge: '1:1 (1080×1080)',
    aspectRatio: '1:1',
    width: 1080,
    height: 1080,
    icon: '',
    description: 'Formato quadrado 1:1 ideal para feed do Instagram e LinkedIn',
  },
  {
    id: 'portrait',
    name: 'Retrato',
    platform: 'Instagram Retrato',
    badge: '4:5 (1080×1350)',
    aspectRatio: '4:5',
    width: 1080,
    height: 1350,
    icon: '',
    description: 'Formato 4:5 de alto engajamento visual no feed móvel',
  },
];

export interface QualityPreset {
  id: string;
  name: string;
  scale: number;
  badge: string;
  description: string;
}

export const QUALITY_PRESETS: QualityPreset[] = [
  {
    id: '1080p',
    name: '1080p Full HD',
    scale: 1.0,
    badge: 'Padrão Nativo (1080p)',
    description: 'Máxima nitidez e fidelidade recomendada para todas as plataformas',
  },
  {
    id: '720p',
    name: '720p HD',
    scale: 0.666667,
    badge: 'Rápido & Leve (720p)',
    description: 'Renderização mais rápida e tamanho de arquivo reduzido',
  },
  {
    id: '4k',
    name: '4K Ultra HD',
    scale: 2.0,
    badge: 'Ultra HD (4K)',
    description: 'Super resolução cinematográfica para telas de altíssima densidade',
  },
];

export interface ResolutionPreset {
  id: string;
  name: string;
  width: number;
  height: number;
  aspectRatio: string;
  badge: string;
  description: string;
}

// Retrocompatibilidade
export const RESOLUTION_PRESETS: ResolutionPreset[] = [
  {
    id: '1080p',
    name: 'YouTube 1080p Full HD',
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    badge: '1920 × 1080',
    description: 'YouTube, Web e apresentações widescreen',
  },
  {
    id: '720p',
    name: 'YouTube 720p HD',
    width: 1280,
    height: 720,
    aspectRatio: '16:9',
    badge: '1280 × 720',
    description: 'Renderização mais rápida para web',
  },
  {
    id: '4k',
    name: 'YouTube 4K Ultra HD',
    width: 3840,
    height: 2160,
    aspectRatio: '16:9',
    badge: '3840 × 2160',
    description: 'Máxima resolução cinematográfica',
  },
  {
    id: '9:16',
    name: 'TikTok / Reels (1080×1920)',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    badge: '1080 × 1920',
    description: 'TikTok, Instagram Reels e YouTube Shorts',
  },
  {
    id: '1:1',
    name: 'Feed Instagram (1080×1080)',
    width: 1080,
    height: 1080,
    aspectRatio: '1:1',
    badge: '1080 × 1080',
    description: 'Feed do Instagram e LinkedIn',
  },
  {
    id: '4:5',
    name: 'Instagram Retrato (1080×1350)',
    width: 1080,
    height: 1350,
    aspectRatio: '4:5',
    badge: '1080 × 1350',
    description: 'Feed Retrato de alto engajamento',
  },
];

export interface RenderProgress {
  currentFrame: number;
  totalFrames: number;
  percentage: number;
  elapsedSeconds: number;
  remainingSeconds: number;
  status: 'idle' | 'rendering' | 'encoding' | 'completed' | 'error';
  errorMessage?: string;
}

export interface RenderOptions {
  platform: PlatformPreset;
  quality: QualityPreset;
  fps: number;
  bitrateMbps: number;
  format: 'webm' | 'mp4';
  includeAudio: boolean;
  onProgress?: (progress: RenderProgress) => void;
}

export interface RenderResult {
  blob: Blob;
  url: string;
  filename: string;
  sizeBytes: number;
  durationSeconds: number;
  width: number;
  height: number;
  platformName: string;
}

/**
 * Desenha um frame do vídeo diretamente no contexto 2D do Canvas com proporções universais.
 * O layout sempre mantém a mesma hierarquia e tamanho proporcional independente da resolução final de renderização.
 */
export function drawVideoFrameToCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  card: CalculatedCard,
  localFrame: number,
  fps: number,
  globalFrame: number,
  totalFrames: number
): void {
  const props = card.props || {};
  const isVertical = height > width;
  const isSquare = width === height;

  // 1. Fundo com gradiente radial e profundidade
  const glowColor = (props.glowColor as string) || '#312e81';
  const accentColor = (props.accentColor as string) || '#6366f1';
  
  const cx = width / 2;
  const cy = isVertical ? height * 0.42 : height * 0.45;
  const radius = Math.max(width, height) * 0.8;
  const grad = ctx.createRadialGradient(cx, cy, 50, cx, cy, radius);
  grad.addColorStop(0, glowColor);
  grad.addColorStop(0.5, '#090d16');
  grad.addColorStop(1, '#020617');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // 2. Grid tecnológico de fundo
  ctx.save();
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)';
  ctx.lineWidth = 1;
  const gridSize = isVertical ? width * 0.05 : width * 0.035;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();

  // Animações spring com amortecimento suave
  const badgeSpring = spring({ frame: localFrame - 2, fps, config: { damping: 14, stiffness: 120 } });
  const titleSpring = spring({ frame: localFrame - 6, fps, config: { damping: 13, stiffness: 100 } });
  const subSpring = spring({ frame: localFrame - 12, fps, config: { damping: 15, stiffness: 90 } });

  const def = CARD_REGISTRY[card.templateId];
  const templateName = def?.name || 'Cena';

  // 3. Badge Superior (Proporcional a largura do canvas)
  const showBadge = props.showBadge !== false;
  const badgeText = (props.badge as string) || (props.category as string) || templateName.toUpperCase();
  
  if (showBadge && badgeText && badgeSpring > 0.05) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, badgeSpring);
    // Em modo vertical (TikTok), posiciona abaixo da safe-area superior (140px)
    const badgeY = isVertical ? height * 0.20 : height * 0.26;
    const bScale = Math.max(0.5, badgeSpring);
    
    ctx.translate(cx, badgeY);
    ctx.scale(bScale, bScale);

    const badgeFontSize = Math.round(width * 0.015 + (isVertical ? 8 : 4));
    ctx.font = `600 ${badgeFontSize}px ui-monospace, monospace`;
    const textMetrics = ctx.measureText(badgeText);
    const padX = badgeFontSize * 1.1;
    const padY = badgeFontSize * 0.55;
    const boxW = textMetrics.width + padX * 2 + badgeFontSize;
    const boxH = badgeFontSize * 2.2;

    ctx.fillStyle = 'rgba(30, 27, 75, 0.8)';
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-boxW / 2, -boxH / 2, boxW, boxH, boxH / 2);
    ctx.fill();
    ctx.stroke();

    // Ponto aceso
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.arc(-boxW / 2 + padX * 0.8, 0, badgeFontSize * 0.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#a5b4fc';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, -boxW / 2 + padX * 1.4, 1);
    ctx.restore();
  }

  // 4. Título Principal (Dimensão Proporcional Matemática)
  const title = (props.title as string) || (props.headline as string) || templateName;
  if (title && titleSpring > 0.05) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, titleSpring);
    const titleY = (isVertical ? height * 0.38 : height * 0.44) + (1 - titleSpring) * 35;
    
    ctx.translate(cx, titleY);
    const tScale = Math.max(0.8, titleSpring);
    ctx.scale(tScale, tScale);

    // Tamanho proporcional exato relativo à largura e altura
    const fontSize = isVertical
      ? Math.round(Math.min(76, width * 0.075))
      : isSquare
      ? Math.round(Math.min(68, width * 0.062))
      : Math.round(Math.min(84, width * 0.046));

    ctx.font = `900 ${fontSize}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 32;
    ctx.fillStyle = '#ffffff';

    const maxTitleWidth = width * (isVertical ? 0.82 : 0.78);
    wrapText(ctx, title, 0, 0, maxTitleWidth, fontSize * 1.18);
    ctx.restore();
  }

  // 5. Subtítulo / Descrição
  const subtitle = (props.subtitle as string) || (props.description as string) || (props.definition as string) || '';
  if (subtitle && subSpring > 0.05) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, subSpring);
    const subY = (isVertical ? height * 0.55 : height * 0.60) + (1 - subSpring) * 20;

    const subFontSize = isVertical
      ? Math.round(Math.min(34, width * 0.034))
      : isSquare
      ? Math.round(Math.min(30, width * 0.028))
      : Math.round(Math.min(36, width * 0.022));

    ctx.font = `400 ${subFontSize}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#cbd5e1';

    const maxSubWidth = width * (isVertical ? 0.82 : 0.68);
    wrapText(ctx, subtitle, cx, subY, maxSubWidth, subFontSize * 1.38);
    ctx.restore();
  }

  // 6. Barra de Progresso da Cena e Global
  const progressHeight = Math.max(4, Math.round(height * 0.007));
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fillRect(0, height - progressHeight, width, progressHeight);
  
  const progressRatio = Math.min(1, Math.max(0, globalFrame / Math.max(1, totalFrames)));
  ctx.fillStyle = accentColor;
  ctx.shadowColor = accentColor;
  ctx.shadowBlur = 10;
  ctx.fillRect(0, height - progressHeight, width * progressRatio, progressHeight);
  ctx.shadowBlur = 0;

  // 7. Marca d'água / Timestamp inferior com safe area
  ctx.save();
  const metaFontSize = Math.max(13, Math.round(width * 0.012));
  ctx.font = `500 ${metaFontSize}px ui-monospace, monospace`;
  ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  const totalSec = (globalFrame / fps).toFixed(1);
  const padBottom = isVertical ? height * 0.08 : 16;
  ctx.fillText(`Cena #${card.order + 1} • ${totalSec}s`, width - 30, height - padBottom);
  ctx.restore();
}

/**
 * Utilitário de quebra de linhas para Canvas 2D.
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';
  const lines: string[] = [];

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      lines.push(line.trim());
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());

  const totalHeight = (lines.length - 1) * lineHeight;
  const startY = y - totalHeight / 2;

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x, startY + i * lineHeight);
  }
}

/**
 * Motor de Renderização de Vídeo no Navegador.
 * Calcula dimensões finais baseadas na plataforma e qualidade escolhida.
 */
export async function renderProjectToVideo(
  project: ProjectState,
  calculatedCards: CalculatedCard[],
  totalFrames: number,
  options: RenderOptions,
  cancelToken?: { isCancelled: boolean }
): Promise<RenderResult> {
  const { platform, quality, fps, bitrateMbps, format } = options;
  
  // Resolução final calculada proporcionalmente
  const finalWidth = Math.round(platform.width * quality.scale);
  const finalHeight = Math.round(platform.height * quality.scale);

  // 1. Criar canvas offscreen no tamanho calculado
  const canvas = document.createElement('canvas');
  canvas.width = finalWidth;
  canvas.height = finalHeight;
  canvas.style.position = 'fixed';
  canvas.style.left = '-9999px';
  canvas.style.top = '-9999px';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) {
    document.body.removeChild(canvas);
    throw new Error('Não foi possível obter o contexto 2D do Canvas.');
  }

  // 2. Determinar MimeType suportado
  let mimeType = 'video/webm;codecs=vp9';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm;codecs=vp8';
  }
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm';
  }
  if (format === 'mp4' && MediaRecorder.isTypeSupported('video/mp4')) {
    mimeType = 'video/mp4';
  }

  // 3. Capturar stream do Canvas
  const stream = canvas.captureStream(fps);

  // 4. Adicionar faixa de áudio e narrações se solicitado
  let audioContext: AudioContext | null = null;
  const audioSourcesToSchedule: Array<{ buffer: AudioBuffer; startSec: number }> = [];

  if (options.includeAudio && typeof window.AudioContext !== 'undefined') {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContext = new AudioCtx();
      const dest = audioContext.createMediaStreamDestination();
      (audioContext as any).__mediaDest = dest;

      // Pré-carrega buffers de áudio para cada cena configurada
      for (let i = 0; i < calculatedCards.length; i++) {
        const c = calculatedCards[i];
        const script = (c.audio && 'script' in c.audio && c.audio.script) || c.tts?.script;
        const voiceId = (c.audio && 'voiceId' in c.audio && c.audio.voiceId) || c.tts?.voiceId || 'pt-BR-AntonioNeural';
        const normVoice = normalizeVoiceId(voiceId);
        const lang = normVoice.startsWith('en') ? 'en-US' : normVoice.startsWith('es') ? 'es-ES' : 'pt-BR';
        let audioUrl: string | null =
          c.audio && 'audioUrl' in c.audio && typeof c.audio.audioUrl === 'string'
            ? c.audio.audioUrl
            : null;

        if (!audioUrl && script) {
          audioUrl = `/api/tts?text=${encodeURIComponent(script)}&lang=${lang}&voice=${encodeURIComponent(normVoice)}`;
        }

        if (audioUrl) {

          try {
            const resp = await fetch(audioUrl);
            if (resp.ok) {
              const arrayBuf = await resp.arrayBuffer();
              const audioBuf = await audioContext.decodeAudioData(arrayBuf);
              audioSourcesToSchedule.push({
                buffer: audioBuf,
                startSec: c.startFrame / fps,
              });
            }
          } catch (err) {
            console.warn(`[RenderEngine] Não foi possível decodificar áudio do card ${c.id}:`, err);
          }
        }
      }

      const audioTrack = dest.stream.getAudioTracks()[0];
      if (audioTrack) {
        stream.addTrack(audioTrack);
      }
    } catch (e) {
      console.warn('Não foi possível inicializar faixa de áudio no stream:', e);
    }
  }

  // 5. Configurar MediaRecorder
  const bitsPerSecond = bitrateMbps * 1000 * 1000;
  const recordedChunks: Blob[] = [];
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: bitsPerSecond,
  });

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };

  const recordingStoppedPromise = new Promise<void>((resolve) => {
    recorder.onstop = () => resolve();
  });

  recorder.start();

  // Dispara narrações agendadas no lockstep da timeline
  if (audioContext && audioSourcesToSchedule.length > 0) {
    const dest = (audioContext as any).__mediaDest;
    const baseTime = audioContext.currentTime;
    audioSourcesToSchedule.forEach(({ buffer, startSec }) => {
      if (!audioContext || !dest) return;
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(dest);
      source.start(baseTime + startSec);
    });
  }

  const startTime = performance.now();


  try {
    // 6. Loop de Renderização Frame a Frame
    for (let f = 0; f < totalFrames; f++) {
      if (cancelToken?.isCancelled) {
        recorder.stop();
        throw new Error('Renderização cancelada pelo usuário.');
      }

      const activeCard = calculatedCards.find(
        (c) => f >= c.startFrame && f < c.endFrame
      ) || calculatedCards[0];

      const localFrame = Math.max(0, f - activeCard.startFrame);

      // Renderiza com escala proporcional perfeita
      drawVideoFrameToCanvas(ctx, finalWidth, finalHeight, activeCard, localFrame, fps, f, totalFrames);

      const now = performance.now();
      const elapsedSeconds = (now - startTime) / 1000;
      const progressRatio = (f + 1) / totalFrames;
      const totalEstimatedSeconds = elapsedSeconds / Math.max(0.01, progressRatio);
      const remainingSeconds = Math.max(0, totalEstimatedSeconds - elapsedSeconds);

      options.onProgress?.({
        currentFrame: f + 1,
        totalFrames,
        percentage: Math.round(progressRatio * 100),
        elapsedSeconds: Math.round(elapsedSeconds * 10) / 10,
        remainingSeconds: Math.round(remainingSeconds * 10) / 10,
        status: 'rendering',
      });

      await new Promise((resolve) => setTimeout(resolve, Math.max(8, Math.floor(1000 / fps))));
    }

    options.onProgress?.({
      currentFrame: totalFrames,
      totalFrames,
      percentage: 100,
      elapsedSeconds: Math.round((performance.now() - startTime) / 1000),
      remainingSeconds: 0,
      status: 'encoding',
    });

    recorder.stop();
    await recordingStoppedPromise;

    if (audioContext) {
      audioContext.close();
    }

    const finalBlob = new Blob(recordedChunks, { type: mimeType });
    const url = URL.createObjectURL(finalBlob);
    const sanitizedTitle = (project.meta.title || 'video')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_');
    
    const ext = format === 'mp4' && MediaRecorder.isTypeSupported('video/mp4') ? 'mp4' : 'webm';
    const filename = `${sanitizedTitle}_${platform.id}_${finalWidth}x${finalHeight}_${fps}fps.${ext}`;

    return {
      blob: finalBlob,
      url,
      filename,
      sizeBytes: finalBlob.size,
      durationSeconds: totalFrames / fps,
      width: finalWidth,
      height: finalHeight,
      platformName: platform.name,
    };
  } finally {
    if (document.body.contains(canvas)) {
      document.body.removeChild(canvas);
    }
  }
}

/**
 * Dispara o download automático do arquivo de vídeo gerado.
 */
export function triggerVideoDownload(blobUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
