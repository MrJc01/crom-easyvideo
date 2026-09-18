import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { ProjectState, CalculatedCard } from '../../core/types';
import { Icons } from '../../core/icons';
import { CARD_REGISTRY } from '../../templates/registry';
import { VideoComposition } from '../../remotion/VideoComposition';
import {
  type ResolutionPreset,
  RESOLUTION_PRESETS,
  DEFAULT_RESOLUTION_PRESET,
  calculateCanonicalScale,
} from '../../core/resolutions';

export type { ResolutionPreset };
export { RESOLUTION_PRESETS };

export interface VideoPlayerProps {
  project: ProjectState;
  currentFrame: number;
  isPlaying: boolean;
  onFrameChange: (frame: number) => void;
  onTogglePlay: () => void;
  calculatedCards: CalculatedCard[];
  totalFrames: number;
  activeCard: CalculatedCard | null;
  isMuted?: boolean;
  onToggleMute?: () => void;
  isSpeaking?: boolean;
  isAudioHolding?: boolean;
  onOpenRenderModal?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  project,
  currentFrame,
  isPlaying,
  onFrameChange,
  onTogglePlay,
  calculatedCards,
  totalFrames,
  activeCard,
  isMuted = false,
  onToggleMute,
  isSpeaking = false,
  isAudioHolding = false,
  onOpenRenderModal,
}) => {
  // Preset de Resolução Canônica Selecionado
  const [selectedPreset, setSelectedPreset] = useState<ResolutionPreset>(
    RESOLUTION_PRESETS[0] // 16:9 1080p padrão
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(0.5);

  // Hook de cálculo de escala proporcional não-destrutiva (Zero crop / Zero distorção)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateScale = () => {
      const parentWidth = el.clientWidth;
      const parentHeight = el.clientHeight;
      if (parentWidth === 0 || parentHeight === 0) return;

      const calculatedScale = calculateCanonicalScale(
        parentWidth,
        parentHeight,
        selectedPreset.canonicalWidth,
        selectedPreset.canonicalHeight,
        20,
        0.95
      );

      setScale(calculatedScale);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    window.addEventListener('resize', updateScale);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, [selectedPreset.canonicalWidth, selectedPreset.canonicalHeight]);

  const localFrame = useMemo(() => {
    if (!activeCard) return 0;
    return Math.max(0, currentFrame - activeCard.startFrame);
  }, [activeCard, currentFrame]);

  const timecode = useMemo(() => {
    const fps = project.meta.fps;
    const totalSeconds = Math.floor(currentFrame / fps);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const frames = currentFrame % fps;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
  }, [currentFrame, project.meta.fps]);

  return (
    <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Player Header com Dropdown de Resoluções Canônicas */}
      <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 border-b border-slate-800 bg-slate-950/90 text-slate-300 gap-2 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-[11px] sm:text-xs font-semibold text-slate-300 uppercase tracking-wider truncate">
            Viewport Canônico
          </span>
          <span className="bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 px-2 py-0.5 rounded text-[10px] sm:text-xs font-mono font-bold shrink-0">
            {selectedPreset.width} × {selectedPreset.height}
          </span>
          <span className="text-[10px] text-slate-500 font-mono hidden md:inline">
            (Canvas: {selectedPreset.canonicalWidth}×{selectedPreset.canonicalHeight})
          </span>
        </div>

        {/* Dropdown de Resoluções e Ações */}
        <div className="flex items-center gap-2 ml-auto flex-wrap sm:flex-nowrap">
          {/* Seletor Dropdown Padronizado */}
          <select
            value={selectedPreset.id}
            onChange={(e) => {
              const found = RESOLUTION_PRESETS.find((p) => p.id === e.target.value);
              if (found) setSelectedPreset(found);
            }}
            className="bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
          >
            {RESOLUTION_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label} ({p.width} × {p.height})
              </option>
            ))}
          </select>

          {/* Timecode */}
          <span className="font-mono text-xs text-indigo-400 bg-indigo-950/60 border border-indigo-900/60 px-2 py-1 rounded-md shrink-0">
            {timecode}
          </span>

          {/* Botão de Renderizar no Topo do Player */}
          {onOpenRenderModal && (
            <button
              type="button"
              onClick={onOpenRenderModal}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition shrink-0"
              title="Renderizar e Baixar Vídeo"
            >
              <Icons.Video />
              <span className="hidden xs:inline">Renderizar</span>
            </button>
          )}
        </div>
      </div>

      {/* Video Viewport Container com Escala Proporcional Estrita */}
      <div
        ref={containerRef}
        className="w-full bg-black flex items-center justify-center p-2 sm:p-4 relative min-h-[260px] sm:min-h-[400px] md:min-h-[480px] max-h-[580px] overflow-hidden select-none"
      >
        {/* Palco Canônico - Largura e Altura Fixas com Escala Não-Destrutiva */}
        <div
          id="remotion-canvas-stage"
          style={{
            width: `${selectedPreset.canonicalWidth}px`,
            height: `${selectedPreset.canonicalHeight}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            flexShrink: 0,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.08)',
            backgroundColor: '#030712',
          }}
        >
          <VideoComposition
            project={project}
            calculatedCards={calculatedCards}
            currentFrame={currentFrame}
          />
        </div>

        {/* Badge Flutuante de Cena Ativa */}
        {activeCard && (
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-30 bg-slate-900/90 backdrop-blur-md border border-slate-700/70 text-slate-300 text-[10px] sm:text-xs px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg flex items-center gap-1.5 sm:gap-2 font-mono pointer-events-none shadow-lg">
            <span className="text-indigo-400 font-bold">#{activeCard.order + 1}:</span>
            <span className="truncate max-w-[120px] sm:max-w-[200px]">
              {CARD_REGISTRY[activeCard.templateId]?.name || 'Template'}
            </span>
            <span className="text-slate-500">
              ({localFrame}f / {activeCard.durationInFrames}f)
            </span>
          </div>
        )}

        {/* Indicador Flutuante de Áudio Ativo / Slide Hold */}
        {isPlaying && !isMuted && (
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 flex items-center gap-2 pointer-events-none">
            {isAudioHolding && (
              <div className="bg-amber-950/90 backdrop-blur-md border border-amber-500/60 text-amber-300 text-[10px] sm:text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium shadow-lg animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Sincronizando áudio...</span>
              </div>
            )}
            {isSpeaking && (
              <div className="bg-emerald-950/90 backdrop-blur-md border border-emerald-500/50 text-emerald-300 text-[10px] sm:text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Áudio Cena #{activeCard ? activeCard.order + 1 : 1}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Transport, Scrubber e Controles de Reprodução */}
      <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex flex-col gap-2.5 sm:gap-3">
        {/* Scrubber da Timeline */}
        <div className="relative w-full">
          <input
            type="range"
            min={0}
            max={Math.max(1, totalFrames - 1)}
            value={currentFrame}
            onChange={(e) => onFrameChange(Number(e.target.value))}
            className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 z-10 relative"
          />
          <div className="absolute inset-0 pointer-events-none flex h-2.5 rounded-lg overflow-hidden">
            {calculatedCards.map((c, i) => {
              const widthPct = (c.durationInFrames / totalFrames) * 100;
              return (
                <div
                  key={c.id}
                  style={{ width: `${widthPct}%` }}
                  className={`h-full border-r border-slate-950 ${
                    i % 2 === 0 ? 'bg-indigo-600/20' : 'bg-slate-700/20'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Botões de Transporte */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onFrameChange(0)}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Voltar ao início"
            >
              <Icons.SkipBack />
            </button>
            <button
              onClick={() => onFrameChange(Math.max(0, currentFrame - project.meta.fps))}
              className="px-1.5 sm:px-2 py-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition text-[11px] sm:text-xs font-mono"
              title="-1 segundo"
            >
              -1s
            </button>
            <button
              onClick={onTogglePlay}
              className="px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-indigo-600/30 transition transform active:scale-95"
            >
              {isPlaying ? <Icons.Pause /> : <Icons.Play />}
              <span>{isPlaying ? 'Pausar' : 'Reproduzir'}</span>
            </button>
            <button
              onClick={() =>
                onFrameChange(Math.min(totalFrames - 1, currentFrame + project.meta.fps))
              }
              className="px-1.5 sm:px-2 py-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition text-[11px] sm:text-xs font-mono"
              title="+1 segundo"
            >
              +1s
            </button>
            <button
              onClick={() => onFrameChange(totalFrames - 1)}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Ir para o final"
            >
              <Icons.SkipForward />
            </button>

            {/* Alternador de Áudio com Ícone SVG Monocromático */}
            {onToggleMute && (
              <button
                type="button"
                onClick={onToggleMute}
                className={`ml-1 sm:ml-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition ${
                  isMuted
                    ? 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                    : 'bg-indigo-950/70 border-indigo-700/60 text-indigo-300 hover:bg-indigo-900/80'
                }`}
                title={isMuted ? 'Ativar Áudio da Cena' : 'Silenciar Áudio da Cena'}
              >
                {isMuted ? <Icons.VolumeX /> : <Icons.Volume />}
                <span className="hidden sm:inline">{isMuted ? 'Mudo' : 'Áudio'}</span>
              </button>
            )}
          </div>

          <div className="text-[11px] sm:text-xs text-slate-400 font-mono ml-auto flex items-center gap-2">
            <span>
              Frame: <span className="text-white font-bold">{currentFrame}</span> / {totalFrames}
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="hidden sm:inline">{(totalFrames / project.meta.fps).toFixed(1)}s</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
