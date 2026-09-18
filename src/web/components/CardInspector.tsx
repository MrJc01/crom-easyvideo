import React, { useState } from 'react';
import type { CalculatedCard, VideoCard, TransitionType } from '../../core/types';
import { Icons } from '../../core/icons';
import { CARD_REGISTRY } from '../../templates/registry';
import { parseScriptAndDelays } from '../../core/timeline';
import { MediaFieldEditor } from './MediaFieldEditor';
import { DynamicArrayField } from './DynamicArrayField';
import { AudioSourceSelector } from './AudioSourceSelector';

export interface CardInspectorProps {
  card: CalculatedCard | null;
  onUpdateCard: (updated: VideoCard) => void;
  fps: number;
}

export const CardInspector: React.FC<CardInspectorProps> = ({ card, onUpdateCard, fps }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'timing' | 'voice'>('content');

  if (!card) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
          <Icons.Film />
        </div>
        <h3 className="text-slate-300 font-semibold text-base">Nenhuma cena ativa</h3>
        <p className="text-xs mt-1">Navegue no player para inspecionar a cena atual.</p>
      </div>
    );
  }

  const templateDef = CARD_REGISTRY[card.templateId] || CARD_REGISTRY['hero-title'];
  const scriptText =
    card.audio?.mode === 'tts'
      ? card.audio.script
      : card.tts?.script || '';
  const scriptSpeed =
    card.audio?.mode === 'tts'
      ? card.audio.speed
      : card.tts?.speed || 1.0;

  const parsedScript = parseScriptAndDelays(scriptText, scriptSpeed);

  const baseAudioSeconds =
    card.audio?.audioDurationInSeconds ||
    card.tts?.audioDurationInSeconds ||
    parsedScript.totalDurationSeconds;

  const handlePropChange = (fieldName: string, value: any) => {
    onUpdateCard({
      ...card,
      props: {
        ...card.props,
        [fieldName]: value,
      },
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-full overflow-hidden shadow-2xl">
      {/* Header com Abas de Navegação */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/70">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Icons.Layers />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold block">
                Cena #{card.order + 1}
              </span>
              <h3 className="text-sm font-bold text-white truncate max-w-[200px]">
                {templateDef.name}
              </h3>
            </div>
          </div>
          <div className="text-right font-mono text-xs">
            <span className="text-white font-bold">{card.durationInFrames}f</span>
            <span className="text-slate-400 block text-[10px]">
              ({(card.durationInFrames / fps).toFixed(1)}s)
            </span>
          </div>
        </div>

        {/* Botões de Navegação das Abas */}
        <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('content')}
            className={`py-1.5 rounded-lg transition ${
              activeTab === 'content'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Conteúdo
          </button>
          <button
            onClick={() => setActiveTab('timing')}
            className={`py-1.5 rounded-lg transition ${
              activeTab === 'timing'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Duração
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`py-1.5 rounded-lg transition ${
              activeTab === 'voice'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Áudio & Voz
          </button>
        </div>
      </div>

      {/* Corpo do Inspetor */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
        {/* ABA 1: Conteúdo do Template */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            {templateDef.schema.map((field) => {
              const val = card.props[field.name] ?? field.defaultValue;

              if (field.type === 'toggle') {
                return (
                  <div
                    key={field.name}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800"
                  >
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">
                        {field.label}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {val ? 'Elemento Visível no Card' : 'Elemento Oculto'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePropChange(field.name, !val)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                        val
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {val ? <Icons.Eye /> : <Icons.EyeOff />}
                      <span>{val ? 'Exibir' : 'Ocultar'}</span>
                    </button>
                  </div>
                );
              }

              if (field.type === 'media') {
                return (
                  <div key={field.name} className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      {field.label}
                    </label>
                    <MediaFieldEditor
                      value={val}
                      onChange={(media) => handlePropChange(field.name, media)}
                    />
                  </div>
                );
              }

              if (field.type === 'array') {
                return (
                  <div key={field.name}>
                    <DynamicArrayField
                      items={Array.isArray(val) ? val : []}
                      onChange={(arr) => handlePropChange(field.name, arr)}
                      label={field.label}
                      itemLabel={field.itemLabel}
                      itemDefaultValue={field.itemDefaultValue}
                    />
                  </div>
                );
              }

              if (field.type === 'textarea') {
                return (
                  <div key={field.name}>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {field.label}
                    </label>
                    <textarea
                      value={val || ''}
                      onChange={(e) => handlePropChange(field.name, e.target.value)}
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
                    />
                  </div>
                );
              }

              if (field.type === 'color') {
                return (
                  <div
                    key={field.name}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800"
                  >
                    <span className="text-xs font-semibold text-slate-200">{field.label}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={val || '#6366f1'}
                        onChange={(e) => handlePropChange(field.name, e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-xs font-mono text-slate-400 uppercase">
                        {val || '#6366f1'}
                      </span>
                    </div>
                  </div>
                );
              }

              return (
                <div key={field.name}>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    value={val || ''}
                    onChange={(e) => handlePropChange(field.name, e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* ABA 2: Duração & Modo */}
        {activeTab === 'timing' && (
          <div className="space-y-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Icons.Clock />
                  <span>Modo de Duração</span>
                </label>
                <div className="flex bg-slate-900 rounded-lg p-0.5 text-[11px] font-medium border border-slate-800">
                  <button
                    onClick={() => onUpdateCard({ ...card, durationMode: 'auto' })}
                    className={`px-3 py-1 rounded-md transition ${
                      card.durationMode === 'auto'
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Áudio + Margem
                  </button>
                  <button
                    onClick={() => onUpdateCard({ ...card, durationMode: 'manual' })}
                    className={`px-3 py-1 rounded-md transition ${
                      card.durationMode === 'manual'
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Fixo Manual
                  </button>
                </div>
              </div>

              {card.durationMode === 'auto' ? (
                <div className="pt-2 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Margem de Encerramento (Pós-áudio):</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step={0.2}
                        min={0.2}
                        max={10.0}
                        value={card.audioPaddingEndInSeconds}
                        onChange={(e) =>
                          onUpdateCard({
                            ...card,
                            audioPaddingEndInSeconds: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-20 bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-center text-xs font-mono text-indigo-300 font-bold"
                      />
                      <span className="text-slate-400 text-xs">segundos</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-900/40 text-xs font-mono text-indigo-300 space-y-1">
                    <div className="flex justify-between">
                      <span>Duração Base do Áudio:</span>
                      <span>{baseAudioSeconds.toFixed(1)}s</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Margem de Encerramento:</span>
                      <span>+{card.audioPaddingEndInSeconds}s</span>
                    </div>
                    <div className="border-t border-indigo-900/60 pt-1 flex justify-between font-bold text-white">
                      <span>Duração Final da Cena:</span>
                      <span>
                        {(baseAudioSeconds + card.audioPaddingEndInSeconds).toFixed(1)}s (
                        {Math.ceil((baseAudioSeconds + card.audioPaddingEndInSeconds) * fps)}f)
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Duração (Segundos)</label>
                    <input
                      type="number"
                      step={0.5}
                      min={1}
                      max={60}
                      value={card.manualDurationInSeconds || card.manualDurationInFrames / fps}
                      onChange={(e) => {
                        const secs = parseFloat(e.target.value) || 1;
                        onUpdateCard({
                          ...card,
                          manualDurationInSeconds: secs,
                          manualDurationInFrames: Math.round(secs * fps),
                        });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Duração (Frames)</label>
                    <input
                      type="number"
                      step={15}
                      min={15}
                      value={card.manualDurationInFrames}
                      onChange={(e) => {
                        const f = parseInt(e.target.value) || 30;
                        onUpdateCard({
                          ...card,
                          manualDurationInFrames: f,
                          manualDurationInSeconds: Math.round((f / fps) * 10) / 10,
                        });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Configuração de Transição de Entrada */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Icons.Layers />
                <span>Transição de Entrada da Cena</span>
              </label>

              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1.5 font-medium">
                    Efeito Visual
                  </label>
                  <select
                    value={card.transition?.type || 'none'}
                    onChange={(e) =>
                      onUpdateCard({
                        ...card,
                        transition: {
                          type: e.target.value as TransitionType,
                          durationInFrames: card.transition?.durationInFrames ?? 15,
                        },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="none">Nenhuma (Corte Seco)</option>
                    <option value="fade">Fade In (Dissolvência)</option>
                    <option value="slide-left">Slide da Direita (Slide Left)</option>
                    <option value="slide-right">Slide da Esquerda (Slide Right)</option>
                    <option value="zoom-in">Zoom In (Escala & Opacidade)</option>
                    <option value="wipe-left">Wipe Revelação (Wipe Left)</option>
                  </select>
                </div>

                {card.transition?.type && card.transition.type !== 'none' && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Duração da Transição:</span>
                      <span className="font-mono text-indigo-400 font-bold">
                        {card.transition?.durationInFrames ?? 15} frames (
                        {(((card.transition?.durationInFrames ?? 15) / fps)).toFixed(2)}s)
                      </span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={45}
                      step={1}
                      value={card.transition?.durationInFrames ?? 15}
                      onChange={(e) =>
                        onUpdateCard({
                          ...card,
                          transition: {
                            type: card.transition?.type || 'fade',
                            durationInFrames: parseInt(e.target.value, 10) || 15,
                          },
                        })
                      }
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ABA 3: Áudio, Narração & Microfone (Zero Emojis, Totalmente Modular) */}
        {activeTab === 'voice' && (
          <AudioSourceSelector card={card} onUpdateCard={onUpdateCard} fps={fps} />
        )}
      </div>
    </div>
  );
};

export default CardInspector;
