import React, { useRef, useEffect, useState, useMemo } from 'react';
import type { MediaAsset } from '../core/types';
import { Icons } from '../core/icons';

export interface MediaRendererProps {
  media?: MediaAsset | string | null;
  src?: MediaAsset | string | null;
  frame?: number;
  fps?: number;
  className?: string;
  placeholderText?: string;
}

/**
 * Normaliza qualquer formato de mídia (MediaAsset, string URL, objeto dinâmico)
 * e resolve com precisão se deve ser renderizado como vídeo ou imagem.
 */
export function normalizeMediaAsset(input?: MediaAsset | string | null): MediaAsset | null {
  if (!input) return null;

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return null;
    const isVid =
      /\.(mp4|webm|mov|m4v|ogg|mkv)(\?|$)/i.test(trimmed) ||
      trimmed.startsWith('data:video/');
    return {
      type: isVid ? 'video' : 'image',
      url: trimmed,
      trimStart: 0,
      trimEnd: 0,
      objectFit: 'cover',
    };
  }

  if (typeof input === 'object') {
    let url = input.url;
    if (!url && typeof (input as any).toString === 'function') {
      const strVal = (input as any).toString();
      if (strVal && strVal !== '[object Object]') {
        url = strVal;
      }
    }

    if (!url || typeof url !== 'string' || url === '[object Object]') {
      return null;
    }

    // Detecção inteligente baseada em extensão de arquivo e MIME type
    const nameOrUrl = ((input.name || '') + ' ' + url).toLowerCase();
    let resolvedType: 'image' | 'video' = input.type || 'image';

    if (
      /\.(png|jpe?g|webp|gif|svg|avif|bmp|ico)(\?|$)/i.test(nameOrUrl) ||
      url.startsWith('data:image/')
    ) {
      resolvedType = 'image';
    } else if (
      /\.(mp4|webm|mov|m4v|ogg|mkv)(\?|$)/i.test(nameOrUrl) ||
      url.startsWith('data:video/')
    ) {
      resolvedType = 'video';
    }

    return {
      type: resolvedType,
      url,
      name: input.name,
      duration: input.duration,
      trimStart: input.trimStart || 0,
      trimEnd: input.trimEnd || 0,
      objectFit: input.objectFit || 'cover',
    };
  }

  return null;
}

export const MediaRenderer: React.FC<MediaRendererProps> = ({
  media,
  src,
  frame = 0,
  fps = 30,
  className = '',
  placeholderText = 'Sem mídia configurada',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState<boolean>(false);
  const [imageFailed, setImageFailed] = useState<boolean>(false);

  const resolvedMedia = useMemo(() => {
    return normalizeMediaAsset(src || media);
  }, [src, media]);

  // Resetar estados de erro ao mudar de URL
  useEffect(() => {
    setVideoFailed(false);
    setImageFailed(false);
  }, [resolvedMedia?.url]);

  // Sincronização de frames para vídeo
  useEffect(() => {
    if (!resolvedMedia || resolvedMedia.type !== 'video' || videoFailed || !videoRef.current) {
      return;
    }

    const videoEl = videoRef.current;
    const trimStart = resolvedMedia.trimStart || 0;
    const trimEnd =
      resolvedMedia.trimEnd && resolvedMedia.trimEnd > trimStart
        ? resolvedMedia.trimEnd
        : 9999;
    const localSec = frame / fps;
    let targetTime = trimStart + localSec;

    if (targetTime > trimEnd) {
      targetTime = trimEnd;
    }

    // Atualiza currentTime de forma segura
    try {
      if (Math.abs(videoEl.currentTime - targetTime) > 0.08) {
        videoEl.currentTime = targetTime;
      }
    } catch {
      // Ignora restrições temporárias de seek do navegador antes do carregamento
    }
  }, [frame, fps, resolvedMedia, videoFailed]);

  if (!resolvedMedia || !resolvedMedia.url) {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center bg-slate-900/60 border border-dashed border-slate-700/80 rounded-2xl p-6 text-slate-500 text-center ${className}`}
      >
        <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-400 mb-2">
          <Icons.Video />
        </div>
        <span className="text-xs font-medium">{placeholderText}</span>
        <span className="text-[10px] text-slate-500 mt-1">
          Carregue imagem ou vídeo no painel lateral
        </span>
      </div>
    );
  }

  // Se o tipo for vídeo, renderiza o elemento <video>
  if (resolvedMedia.type === 'video' && !videoFailed) {
    return (
      <div className={`relative w-full h-full overflow-hidden bg-black ${className}`}>
        <video
          ref={videoRef}
          src={resolvedMedia.url}
          muted={true}
          playsInline
          preload="auto"
          onError={() => {
            const isImageExtension = /\.(png|jpe?g|webp|gif|svg|avif|bmp)(\?|$)/i.test(
              resolvedMedia.url || resolvedMedia.name || ''
            );
            if (isImageExtension) {
              console.warn(
                '[MediaRenderer] Arquivo de imagem detectado em elemento de vídeo. Fallback para <img>:',
                resolvedMedia.url
              );
              setVideoFailed(true);
            } else {
              console.warn(
                '[MediaRenderer] Aviso: vídeo requer codec nativo do navegador para playback acelerado:',
                resolvedMedia.url
              );
            }
          }}
          className="w-full h-full"
          style={{ objectFit: resolvedMedia.objectFit || 'cover' }}
        />
        {resolvedMedia.trimEnd > 0 && (
          <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-indigo-300 border border-slate-800 pointer-events-none">
            Trim: {resolvedMedia.trimStart}s - {resolvedMedia.trimEnd}s
          </div>
        )}
      </div>
    );
  }

  // Se for imagem (ou fallback de vídeo falho) e não falhou como imagem
  if (!imageFailed) {
    return (
      <div className={`relative w-full h-full overflow-hidden ${className}`}>
        <img
          src={resolvedMedia.url}
          alt={resolvedMedia.name || 'Template Asset'}
          onError={() => {
            console.warn(
              '[MediaRenderer] Falha ao carregar imagem:',
              resolvedMedia.url
            );
            setImageFailed(true);
          }}
          className="w-full h-full"
          style={{ objectFit: resolvedMedia.objectFit || 'cover' }}
        />
      </div>
    );
  }

  // Fallback se ambos falharem
  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center bg-slate-900 border border-rose-900/50 rounded-2xl p-4 text-rose-400 text-center ${className}`}
    >
      <Icons.AlertTriangle />
      <span className="text-xs font-semibold mt-2">Mídia Inacessível</span>
      <span className="text-[10px] text-slate-400 mt-1 max-w-[200px] truncate">
        {resolvedMedia.name || resolvedMedia.url}
      </span>
    </div>
  );
};

export default MediaRenderer;
