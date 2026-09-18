import React, { useState, useRef } from 'react';
import type { CalculatedCard, VideoCard } from '../../core/types';
import { Icons } from '../../core/icons';
import { CARD_REGISTRY } from '../../templates/registry';
import { parseScriptAndDelays } from '../../core/timeline';
import { MediaFieldEditor } from './MediaFieldEditor';
import { DynamicArrayField } from './DynamicArrayField';

export interface CardInspectorProps {
  card: CalculatedCard | null;
  onUpdateCard: (updated: VideoCard) => void;
  fps: number;
}

export const CardInspector: React.FC<CardInspectorProps> = ({ card, onUpdateCard, fps }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'timing' | 'voice'>('content');
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const speechTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  const parsedScript = parseScriptAndDelays(card.tts?.script || '', card.tts?.speed || 1.0);

  const handlePropChange = (fieldName: string, value: any) => {
    onUpdateCard({
      ...card,
      props: {
        ...card.props,
        [fieldName]: value,
      },
    });
  };

  const handleTTSChange = (field: string, value: any) => {
    onUpdateCard({
      ...card,
      tts: {
        ...card.tts,
        [field]: value,
      },
    });
  };

  const insertSleepTag = (seconds: number) => {
    const tag = `[@sleep-${seconds}]`;
    const textarea = textareaRef.current;
    if (!textarea) {
      handleTTSChange('script', `${card.tts.script || ''} ${tag}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = card.tts.script || '';
    const updated = current.substring(0, start) + ` ${tag} ` + current.substring(end);

    handleTTSChange('script', updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length + 2, start + tag.length + 2);
    }, 50);
  };

  const handlePreviewTTS = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isPlayingTTS) {
      window.speechSynthesis.cancel();
      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
      setIsPlayingTTS(false);
      return;
    }

    const segments = parsedScript.segments;
    if (segments.length === 0) return;

    setIsPlayingTTS(true);
    let segmentIndex = 0;

    const playNextSegment = () => {
      if (segmentIndex >= segments.length) {
        setIsPlayingTTS(false);
        return;
      }

      const seg = segments[segmentIndex];
      segmentIndex++;

      if (seg.type === 'sleep') {
        const ms = (seg.sleepDuration || 1) * 1000;
        speechTimeoutRef.current = setTimeout(playNextSegment, ms);
      } else {
        const utterance = new SpeechSynthesisUtterance(seg.text || '');
        utterance.rate = card.tts.speed || 1.0;
        utterance.lang = 'pt-BR';
        utterance.onend = () => playNextSegment();
        utterance.onerror = () => setIsPlayingTTS(false);
        window.speechSynthesis.speak(utterance);
      }
    };

    playNextSegment();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-full overflow-hidden shadow-2xl">
      {/* Header with Navigation Tabs */}
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

        {/* Tab Buttons */}
        <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('content')}
            className={`py-1.5 rounded-lg transition ${
              activeTab === 'content'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Conteúdo & Mídia
          </button>
          <button
            onClick={() => setActiveTab('timing')}
            className={`py-1.5 rounded-lg transition ${
              activeTab === 'timing'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Duração & Modo
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`py-1.5 rounded-lg transition ${
              activeTab === 'voice'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Voz & Narração
          </button>
        </div>
      </div>

      {/* Body / Scrollable Inspector */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
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
                  <div key={field.name}>
                    <MediaFieldEditor
                      value={val}
                      onChange={(newMedia) => handlePropChange(field.name, newMedia)}
                    />
                  </div>
                );
              }

              if (field.type === 'array') {
                return (
                  <div key={field.name}>
                    <DynamicArrayField
                      label={field.label}
                      items={Array.isArray(val) ? val : []}
                      itemLabel={field.itemLabel}
                      itemDefaultValue={field.itemDefaultValue}
                      onChange={(updated) => handlePropChange(field.name, updated)}
                    />
                  </div>
                );
              }

              if (field.type === 'textarea') {
                return (
                  <div key={field.name}>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      {field.label}
                    </label>
                    <textarea
                      rows={2}
                      value={val}
                      onChange={(e) => handlePropChange(field.name, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                );
              }

              if (field.type === 'color') {
                return (
                  <div key={field.name} className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-400">{field.label}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={val}
                        onChange={(e) => handlePropChange(field.name, e.target.value)}
                        className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                      />
                      <span className="font-mono text-xs text-slate-400">{val}</span>
                    </div>
                  </div>
                );
              }

              return (
                <div key={field.name}>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    {field.label}
                  </label>
                  <input
                    type={field.type === 'number' ? 'number' : 'text'}
                    value={val}
                    onChange={(e) =>
                      handlePropChange(
                        field.name,
                        field.type === 'number' ? parseFloat(e.target.value) : e.target.value
                      )
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              );
            })}
          </div>
        )}

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
                    Voz + Encerramento
                  </button>
                  <button
                    onClick={() => onUpdateCard({ ...card, durationMode: 'manual' })}
                    className={`px-3 py-1 rounded-md transition ${
                      card.durationMode === 'manual'
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Tempo Definido Fixo
                  </button>
                </div>
              </div>

              {card.durationMode === 'auto' ? (
                <div className="pt-2 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Tempo de Encerramento (Pós-fala):</span>
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
                      <span>Fala estimada:</span>
                      <span>{parsedScript.speechEstimatedSeconds}s</span>
                    </div>
                    {parsedScript.totalSleepSeconds > 0 && (
                      <div className="flex justify-between text-amber-400">
                        <span>Pausas [@sleep]:</span>
                        <span>+{parsedScript.totalSleepSeconds}s</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-400">
                      <span>Tempo de Encerramento:</span>
                      <span>+{card.audioPaddingEndInSeconds}s</span>
                    </div>
                    <div className="border-t border-indigo-900/60 pt-1 flex justify-between font-bold text-white">
                      <span>Duração Final:</span>
                      <span>
                        {(
                          parsedScript.totalDurationSeconds + card.audioPaddingEndInSeconds
                        ).toFixed(1)}
                        s ({Math.ceil((parsedScript.totalDurationSeconds + card.audioPaddingEndInSeconds) * fps)}f)
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
          </div>
        )}

        {activeTab === 'voice' && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                <Icons.Mic />
                <span>Roteiro de Narração</span>
              </h4>
              <button
                onClick={handlePreviewTTS}
                className={`text-xs px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 transition ${
                  isPlayingTTS
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600 hover:text-white'
                }`}
              >
                {isPlayingTTS ? <Icons.Pause /> : <Icons.Play />}
                <span>{isPlayingTTS ? 'Parar Áudio' : 'Ouvir Narração'}</span>
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-slate-400">Adicionar pausa entre frases:</span>
                <span className="text-[10px] text-slate-500 font-mono">Insere no cursor</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[0.5, 1, 1.5, 2, 3].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => insertSleepTag(sec)}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-indigo-600 hover:text-white text-indigo-300 border border-slate-700/60 text-[10px] font-mono transition flex items-center gap-1"
                  >
                    <Icons.Plus />
                    <span>[@sleep-{sec}]</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <textarea
                ref={textareaRef}
                rows={4}
                value={card.tts.script}
                onChange={(e) => handleTTSChange('script', e.target.value)}
                placeholder="Digite o roteiro da cena... Exemplo: Olá! [@sleep-1.5] Vamos entender como funciona..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Velocidade ({card.tts.speed}x)
                </label>
                <input
                  type="range"
                  min={0.75}
                  max={1.5}
                  step={0.05}
                  value={card.tts.speed}
                  onChange={(e) => handleTTSChange('speed', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-indigo-500 mt-2"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Provedor TTS</label>
                <select
                  value={card.tts.provider}
                  onChange={(e) => handleTTSChange('provider', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-300"
                >
                  <option value="browser-tts">Browser Speech (Nativo)</option>
                  <option value="elevenlabs">ElevenLabs AI</option>
                  <option value="openai">OpenAI TTS</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardInspector;
