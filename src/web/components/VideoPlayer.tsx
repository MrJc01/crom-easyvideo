import React, { useState, useMemo } from 'react';
import type { ProjectState, CalculatedCard } from '../../core/types';
import { Icons } from '../../core/icons';
import { CARD_REGISTRY } from '../../templates/registry';
import { VideoComposition } from '../../remotion/VideoComposition';

export interface VideoPlayerProps {
  project: ProjectState;
  currentFrame: number;
  isPlaying: boolean;
  onFrameChange: (frame: number) => void;
  onTogglePlay: () => void;
  calculatedCards: CalculatedCard[];
  totalFrames: number;
  activeCard: CalculatedCard | null;
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
}) => {
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');

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
      {/* Player Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950/80 text-slate-300">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Remotion Player Preview
          </span>
          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-xs font-mono font-bold">
            {project.meta.fps} FPS
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-800 rounded-lg p-0.5 text-xs font-medium">
            <button
              onClick={() => setAspectRatio('16:9')}
              className={`px-2.5 py-1 rounded-md transition ${
                aspectRatio === '16:9' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              16:9
            </button>
            <button
              onClick={() => setAspectRatio('9:16')}
              className={`px-2.5 py-1 rounded-md transition ${
                aspectRatio === '9:16' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              9:16
            </button>
            <button
              onClick={() => setAspectRatio('1:1')}
              className={`px-2.5 py-1 rounded-md transition ${
                aspectRatio === '1:1' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              1:1
            </button>
          </div>
          <span className="font-mono text-xs text-indigo-400 bg-indigo-950/60 border border-indigo-900/60 px-2.5 py-1 rounded-md">
            {timecode}
          </span>
        </div>
      </div>

      {/* Video Viewport */}
      <div className="w-full bg-black flex items-center justify-center p-4 relative min-h-[360px] md:min-h-[460px] max-h-[540px] overflow-hidden">
        <div
          className={`relative shadow-2xl overflow-hidden transition-all duration-300 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-center ${
            aspectRatio === '16:9'
              ? 'aspect-video w-full max-w-4xl'
              : aspectRatio === '9:16'
              ? 'aspect-[9/16] h-[480px]'
              : 'aspect-square h-[440px]'
          }`}
        >
          <VideoComposition
            project={project}
            calculatedCards={calculatedCards}
            currentFrame={currentFrame}
          />

          {activeCard && (
            <div className="absolute top-4 left-4 z-30 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-300 text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 font-mono pointer-events-none">
              <span className="text-indigo-400 font-bold">Cena {activeCard.order + 1}:</span>
              <span>{CARD_REGISTRY[activeCard.templateId]?.name || 'Template'}</span>
              <span className="text-slate-500">
                ({localFrame}f / {activeCard.durationInFrames}f)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Transport & Scrubber */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col gap-3">
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

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onFrameChange(0)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Voltar ao início"
            >
              <Icons.SkipBack />
            </button>
            <button
              onClick={() => onFrameChange(Math.max(0, currentFrame - project.meta.fps))}
              className="px-2 py-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition text-xs font-mono"
              title="-1s"
            >
              -1s
            </button>
            <button
              onClick={onTogglePlay}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition transform active:scale-95"
            >
              {isPlaying ? <Icons.Pause /> : <Icons.Play />}
              <span>{isPlaying ? 'Pausar' : 'Reproduzir'}</span>
            </button>
            <button
              onClick={() =>
                onFrameChange(Math.min(totalFrames - 1, currentFrame + project.meta.fps))
              }
              className="px-2 py-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition text-xs font-mono"
              title="+1s"
            >
              +1s
            </button>
            <button
              onClick={() => onFrameChange(totalFrames - 1)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Ir para o final"
            >
              <Icons.SkipForward />
            </button>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Frame: <span className="text-white font-bold">{currentFrame}</span> / {totalFrames} (
            {(totalFrames / project.meta.fps).toFixed(1)}s total)
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
