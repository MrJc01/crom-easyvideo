import React, { useState, useRef } from 'react';
import type { ProjectState, CalculatedCard } from '../../core/types';
import { Icons } from '../../core/icons';
import {
  PLATFORM_PRESETS,
  QUALITY_PRESETS,
  type PlatformPreset,
  type QualityPreset,
  type RenderProgress,
  type RenderResult,
  renderProjectToVideo,
  triggerVideoDownload,
} from '../../core/renderEngine';

export interface RenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectState;
  calculatedCards: CalculatedCard[];
  totalFrames: number;
}

export const RenderModal: React.FC<RenderModalProps> = ({
  isOpen,
  onClose,
  project,
  calculatedCards,
  totalFrames,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformPreset>(
    PLATFORM_PRESETS[0] // YouTube 16:9 padrão
  );
  const [selectedQuality, setSelectedQuality] = useState<QualityPreset>(
    QUALITY_PRESETS[0] // 1080p padrão
  );

  const [fps, setFps] = useState<number>(project.meta.fps || 30);
  const [format, setFormat] = useState<'webm' | 'mp4'>('webm');
  const [includeAudio, setIncludeAudio] = useState<boolean>(true);
  const [bitrate, setBitrate] = useState<number>(8); // 8 Mbps

  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [progress, setProgress] = useState<RenderProgress | null>(null);
  const [renderResult, setRenderResult] = useState<RenderResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cancelTokenRef = useRef<{ isCancelled: boolean }>({ isCancelled: false });

  if (!isOpen) return null;

  const durationSec = (totalFrames / fps).toFixed(1);

  // Dimensões finais calculadas
  const finalExportWidth = Math.round(selectedPlatform.width * selectedQuality.scale);
  const finalExportHeight = Math.round(selectedPlatform.height * selectedQuality.scale);

  const handleStartRender = async () => {
    setIsRendering(true);
    setError(null);
    setRenderResult(null);
    cancelTokenRef.current = { isCancelled: false };

    try {
      const result = await renderProjectToVideo(
        project,
        calculatedCards,
        totalFrames,
        {
          platform: selectedPlatform,
          quality: selectedQuality,
          fps,
          bitrateMbps: bitrate,
          format,
          includeAudio,
          onProgress: (p) => setProgress(p),
        },
        cancelTokenRef.current
      );

      setRenderResult(result);
      setIsRendering(false);
      setProgress(null);
    } catch (err: unknown) {
      setIsRendering(false);
      setProgress(null);
      if (err instanceof Error && err.message.includes('cancelada')) {
        setError('Renderização cancelada.');
      } else {
        setError(err instanceof Error ? err.message : 'Erro ao renderizar vídeo.');
      }
    }
  };

  const handleCancelRender = () => {
    cancelTokenRef.current.isCancelled = true;
  };

  const handleDownload = () => {
    if (renderResult) {
      triggerVideoDownload(renderResult.url, renderResult.filename);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Icons.Video />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Renderizar & Baixar Vídeo
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono font-normal">
                  Fidelidade Universal
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Gere o arquivo final com proporções exatas para YouTube, TikTok, Instagram e Shorts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isRendering}
            aria-label="Fechar"
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition disabled:opacity-40"
          >
            <Icons.Close />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Seção 1: Configuração Pré-Render */}
          {!isRendering && !renderResult && (
            <>
              {/* Escolha da Plataforma / Formato */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  1. Formato da Plataforma de Destino
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PLATFORM_PRESETS.map((p) => {
                    const isSelected = selectedPlatform.id === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPlatform(p)}
                        className={`text-left p-3 rounded-xl border transition flex flex-col gap-1 ${
                          isSelected
                            ? 'bg-indigo-950/70 border-indigo-500 shadow-md shadow-indigo-500/10'
                            : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`text-sm font-bold flex items-center gap-1.5 ${isSelected ? 'text-indigo-300' : 'text-white'}`}>
                            <span>{p.platform}</span>
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-400 font-semibold border border-slate-700">
                            {p.badge}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">{p.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Escolha da Qualidade / Resolução de Renderização */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  2. Qualidade de Resolução (Proporção Preservada 100%)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {QUALITY_PRESETS.map((q) => {
                    const isSelected = selectedQuality.id === q.id;
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setSelectedQuality(q)}
                        className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1 ${
                          isSelected
                            ? 'bg-indigo-950/80 border-indigo-500 text-white shadow'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`text-xs font-bold ${isSelected ? 'text-indigo-300' : 'text-slate-200'}`}>
                            {q.name}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 leading-snug">
                          {q.description}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Badge de Resolução Final */}
                <div className="mt-2.5 p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs flex items-center justify-between flex-wrap gap-2 text-slate-300">
                  <span>Resolução Final do Arquivo:</span>
                  <span className="font-mono font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-900/60 px-2.5 py-0.5 rounded">
                    {finalExportWidth} × {finalExportHeight} ({selectedPlatform.aspectRatio})
                  </span>
                </div>
              </div>

              {/* Opções de Taxa de Quadros, Bitrate e Formato */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    Taxa de Quadros (FPS)
                  </label>
                  <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setFps(30)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${
                        fps === 30 ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      30 FPS
                    </button>
                    <button
                      type="button"
                      onClick={() => setFps(60)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${
                        fps === 60 ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      60 FPS
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    Formato de Arquivo
                  </label>
                  <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setFormat('webm')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${
                        format === 'webm' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      WebM (Nativo)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormat('mp4')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${
                        format === 'mp4' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      MP4
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    Taxa de Bits (Bitrate)
                  </label>
                  <select
                    value={bitrate}
                    onChange={(e) => setBitrate(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg py-2 px-2.5 focus:outline-none focus:border-indigo-500"
                  >
                    <option value={4}>Padrão (4 Mbps)</option>
                    <option value={8}>Alta Fidelidade (8 Mbps)</option>
                    <option value={16}>Ultra HD (16 Mbps)</option>
                  </select>
                </div>
              </div>

              {/* Opção de Áudio e Resumo */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-300">
                  <input
                    type="checkbox"
                    checked={includeAudio}
                    onChange={(e) => setIncludeAudio(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                  />
                  <span>Sincronizar Faixa de Áudio e Narração</span>
                </label>

                <div className="text-xs text-slate-400 font-mono flex items-center gap-3">
                  <span>{calculatedCards.length} cenas</span>
                  <span>•</span>
                  <span>{durationSec}s total</span>
                  <span>•</span>
                  <span>{totalFrames} frames</span>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl text-xs text-rose-300">
                  {error}
                </div>
              )}
            </>
          )}

          {/* Seção 2: Renderização em Progresso */}
          {isRendering && progress && (
            <div className="py-6 flex flex-col items-center justify-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-indigo-400 animate-pulse shadow-lg shadow-indigo-500/20">
                <Icons.Sparkles />
              </div>

              <div className="text-center">
                <h3 className="text-base font-bold text-white">
                  Renderizando Vídeo ({finalExportWidth} × {finalExportHeight})
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Processando frame {progress.currentFrame} de {progress.totalFrames} ({progress.percentage}%)
                </p>
              </div>

              {/* Barra de Progresso Estilizada */}
              <div className="w-full bg-slate-950 border border-slate-800 rounded-full h-4 overflow-hidden relative shadow-inner p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-150 shadow-lg shadow-indigo-500/50"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>

              <div className="w-full flex items-center justify-between text-xs font-mono text-slate-400 px-1">
                <span>Tempo decorrido: {progress.elapsedSeconds}s</span>
                <span>Restante estimado: ~{progress.remainingSeconds}s</span>
              </div>

              <button
                type="button"
                onClick={handleCancelRender}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition border border-slate-700"
              >
                Cancelar Renderização
              </button>
            </div>
          )}

          {/* Seção 3: Conclusão & Download */}
          {renderResult && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-xl flex items-center gap-3 text-emerald-300 text-xs font-medium">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Icons.Check />
                </div>
                <span>
                  Vídeo renderizado com sucesso para {renderResult.platformName} ({renderResult.width} × {renderResult.height})!
                </span>
              </div>

              {/* Player do Vídeo Gerado */}
              <div className="bg-black rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center max-h-[320px]">
                <video
                  src={renderResult.url}
                  controls
                  autoPlay
                  loop
                  className="w-full h-full max-h-[320px] object-contain"
                />
              </div>

              {/* Informações do Arquivo */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Tamanho</span>
                  <span className="font-bold text-slate-200">{formatFileSize(renderResult.sizeBytes)}</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Resolução</span>
                  <span className="font-bold text-slate-200">{renderResult.width} × {renderResult.height}</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Duração</span>
                  <span className="font-bold text-slate-200">{renderResult.durationSeconds.toFixed(1)}s</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">FPS</span>
                  <span className="font-bold text-slate-200">{fps} FPS</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-t border-slate-800 bg-slate-950/80 gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isRendering}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition disabled:opacity-50"
          >
            {renderResult ? 'Fechar' : 'Cancelar'}
          </button>

          {!renderResult && !isRendering && (
            <button
              type="button"
              onClick={handleStartRender}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition"
            >
              <Icons.Video />
              <span>Iniciar Renderização</span>
            </button>
          )}

          {renderResult && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRenderResult(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition border border-slate-700"
              >
                Renderizar Outro
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition"
              >
                <Icons.Download />
                <span>Baixar Vídeo ({renderResult.filename.split('.').pop()?.toUpperCase()})</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RenderModal;
