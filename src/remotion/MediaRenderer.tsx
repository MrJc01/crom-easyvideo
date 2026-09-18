import React, { useRef, useEffect } from 'react';
import type { MediaAsset } from '../core/types';
import { Icons } from '../core/icons';

export interface MediaRendererProps {
  media?: MediaAsset;
  frame: number;
  fps: number;
  className?: string;
  placeholderText?: string;
}

export const MediaRenderer: React.FC<MediaRendererProps> = ({
  media,
  frame,
  fps,
  className = '',
  placeholderText = 'Sem mídia configurada',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!media || media.type !== 'video' || !videoRef.current) return;
    const trimStart = media.trimStart || 0;
    const trimEnd = media.trimEnd && media.trimEnd > trimStart ? media.trimEnd : 9999;
    const localSec = frame / fps;
    let targetTime = trimStart + localSec;

    if (targetTime > trimEnd) {
      targetTime = trimEnd;
    }

    if (Math.abs(videoRef.current.currentTime - targetTime) > 0.08) {
      videoRef.current.currentTime = targetTime;
    }
  }, [frame, fps, media]);

  if (!media || !media.url) {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center bg-slate-900/60 border border-dashed border-slate-700/80 rounded-2xl p-6 text-slate-500 text-center ${className}`}
      >
        <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-400 mb-2">
          <Icons.Video />
        </div>
        <span className="text-xs font-medium">{placeholderText}</span>
        <span className="text-[10px] text-slate-500 mt-1">Carregue imagem ou vídeo no painel lateral</span>
      </div>
    );
  }

  if (media.type === 'video') {
    return (
      <div className={`relative w-full h-full overflow-hidden rounded-2xl bg-black ${className}`}>
        <video
          ref={videoRef}
          src={media.url}
          muted={true}
          playsInline
          className={`w-full h-full object-${media.objectFit || 'cover'}`}
        />
        <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-indigo-300 border border-slate-800 pointer-events-none">
          Trim: {media.trimStart}s - {media.trimEnd ? `${media.trimEnd}s` : 'Max'}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden rounded-2xl ${className}`}>
      <img
        src={media.url}
        alt="Template Asset"
        className={`w-full h-full object-${media.objectFit || 'cover'}`}
      />
    </div>
  );
};

export default MediaRenderer;
