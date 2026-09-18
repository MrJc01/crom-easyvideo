import React, { useState, useEffect, useRef } from 'react';
import type { CalculatedCard, VideoCard, TransitionType, CardAudioConfig, TTSAudioConfig } from '../../core/types';
import { Icons } from '../../core/icons';
import { CARD_REGISTRY } from '../../templates/registry';
import { parseScriptAndDelays } from '../../core/timeline';
import { getShortLoremForField } from '../../core/lorem';
import { MediaFieldEditor } from './MediaFieldEditor';
import { DynamicArrayField } from './DynamicArrayField';
import { AudioSourceSelector } from './AudioSourceSelector';
import {
  playScriptWithSpeechSynthesis,
  stopSpeechSynthesis,
} from '../../tts/providers/browserTts';
import { CROMY_VOICES } from '../../core/voices';

export interface CardInspectorProps {
  card: CalculatedCard | null;
  onUpdateCard: (updated: VideoCard) => void;
  fps: number;
}

export const CardInspector: React.FC<CardInspectorProps> = ({ card, onUpdateCard, fps }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'timing' | 'voice'>('content');
  const [isPlayingScript, setIsPlayingScript] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const scriptCleanupRef = useRef<(() => void) | null>(null);

  // Cancela qualquer narração de áudio ao trocar de cena ou desmontar
  useEffect(() => {
    return () => {
      if (scriptCleanupRef.current) {
        scriptCleanupRef.current();
        scriptCleanupRef.current = null;
      }
      stopSpeechSynthesis();
      setIsPlayingScript(false);
    };
  }, [card?.id]);

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

  const currentVoiceId =
    (card.audio && 'voiceId' in card.audio && card.audio.voiceId) ||
    card.tts?.voiceId ||
    'pt-BR-AntonioNeural';

  const handleScriptChange = (newScript: string) => {
    const prevTts = card.audio?.mode === 'tts' ? card.audio : null;
    const voiceId = prevTts?.voiceId || card.tts?.voiceId || 'pt-BR-AntonioNeural';
    const provider = (prevTts?.provider || card.tts?.provider || 'cromyvoice') as
      | 'cromyvoice'
      | 'browser-tts'
      | 'elevenlabs'
      | 'openai';
    const speed = prevTts?.speed || card.tts?.speed || 1.0;

    const updatedAudio: TTSAudioConfig = {
      mode: 'tts',
      script: newScript,
      voiceId,
      provider,
      speed,
      audioDurationInSeconds: prevTts?.audioDurationInSeconds,
    };

    onUpdateCard({
      ...card,
      audio: updatedAudio,
      tts: {
        script: newScript,
        voiceId,
        provider,
        speed,
      },
    });
  };

  const handleVoiceChange = (newVoice: string) => {
    const prevTts = card.audio?.mode === 'tts' ? card.audio : null;
    const provider = (prevTts?.provider || card.tts?.provider || 'cromyvoice') as
      | 'cromyvoice'
      | 'browser-tts'
      | 'elevenlabs'
      | 'openai';
    const speed = prevTts?.speed || card.tts?.speed || 1.0;

    const updatedAudio: TTSAudioConfig = {
      mode: 'tts',
      script: scriptText,
      voiceId: newVoice,
      provider,
      speed,
      audioDurationInSeconds: prevTts?.audioDurationInSeconds,
    };

    onUpdateCard({
      ...card,
      audio: updatedAudio,
      tts: {
        script: scriptText,
        voiceId: newVoice,
        provider,
        speed,
      },
    });
  };

  const handleSpeedChange = (newSpeed: number) => {
    const prevTts = card.audio?.mode === 'tts' ? card.audio : null;
    const voiceId = prevTts?.voiceId || card.tts?.voiceId || 'pt-BR-AntonioNeural';
    const provider = (prevTts?.provider || card.tts?.provider || 'cromyvoice') as
      | 'cromyvoice'
      | 'browser-tts'
      | 'elevenlabs'
      | 'openai';

    const updatedAudio: TTSAudioConfig = {
      mode: 'tts',
      script: scriptText,
      voiceId,
      provider,
      speed: newSpeed,
      audioDurationInSeconds: prevTts?.audioDurationInSeconds,
    };

    onUpdateCard({
      ...card,
      audio: updatedAudio,
      tts: {
        script: scriptText,
        voiceId,
        provider,
        speed: newSpeed,
      },
    });
  };

  const handleInsertSleepTag = (seconds: number) => {
    const tag = ` [@sleep-${seconds}] `;
    handleScriptChange((scriptText || '') + tag);
  };

  const handleScriptLorem = () => {
    const loremScripts = [
      `Apresentamos agora os fundamentos e destaques de ${templateDef.name}. [@sleep-0.5] Explore os detalhes no formulário modular abaixo.`,
      `Entenda em profundidade a dinâmica e os diferenciais de ${templateDef.name}. [@sleep-0.8] Componentes de alta fidelidade para máxima retenção.`,
      `Como aplicar ${templateDef.name} em produções profissionais de alto engajamento. [@sleep-0.5] Dados e métricas estruturados com precisão.`,
    ];
    const picked = loremScripts[Math.floor(Math.random() * loremScripts.length)];
    handleScriptChange(picked);
    showMiniToast('Roteiro de exemplo gerado!');
  };

  const handleTogglePlayScript = () => {
    if (isPlayingScript) {
      if (scriptCleanupRef.current) {
        scriptCleanupRef.current();
        scriptCleanupRef.current = null;
      }
      stopSpeechSynthesis();
      setIsPlayingScript(false);
      return;
    }

    if (!scriptText.trim()) return;

    setIsPlayingScript(true);
    const currentProvider =
      (card?.audio && 'provider' in card.audio && card.audio.provider) ||
      card?.tts?.provider ||
      'cromyvoice';

    scriptCleanupRef.current = playScriptWithSpeechSynthesis(
      scriptText,
      scriptSpeed,
      {
        onStart: () => setIsPlayingScript(true),
        onEnd: () => setIsPlayingScript(false),
        onError: () => setIsPlayingScript(false),
      },
      currentVoiceId,
      currentProvider
    );
  };

  const handleAutoFillFromScript = () => {
    if (!scriptText.trim()) {
      showMiniToast('Digite ou gere um roteiro antes de puxar para os campos.');
      return;
    }

    const clean = scriptText.replace(/\[@sleep-[^\]]+\]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!clean) return;

    const sentences = clean.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
    if (sentences.length === 0) return;

    const newProps = { ...card.props };

    templateDef.schema.forEach((field) => {
      const lower = field.name.toLowerCase();
      if (lower.includes('title') || lower.includes('headline')) {
        newProps[field.name] = sentences[0];
      } else if (
        lower.includes('subtitle') ||
        lower.includes('desc') ||
        lower.includes('statement') ||
        lower.includes('explanation')
      ) {
        newProps[field.name] = sentences.slice(1).join('. ') || sentences[0];
      } else if (lower.includes('badge') || lower.includes('tag') || lower.includes('kicker')) {
        const words = sentences[0].split(' ');
        newProps[field.name] = words.slice(0, 3).join(' ').toUpperCase();
      } else if (field.type === 'array' && sentences.length > 1) {
        newProps[field.name] = sentences.slice(1, 5);
      }
    });

    onUpdateCard({
      ...card,
      props: newProps,
    });
    showMiniToast('Dados do roteiro aplicados aos campos do template!');
  };

  const showMiniToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const filledFieldsCount = templateDef.schema.filter((f) => {
    const v = card.props[f.name];
    if (v === undefined || v === null || v === '') return false;
    if (Array.isArray(v) && v.length === 0) return false;
    return true;
  }).length;

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
            className={`py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'content'
                ? 'bg-indigo-600 text-white shadow font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Icons.Sparkles />
            <span>Conteúdo & Roteiro</span>
          </button>
          <button
            onClick={() => setActiveTab('timing')}
            className={`py-1.5 rounded-lg transition ${
              activeTab === 'timing'
                ? 'bg-indigo-600 text-white shadow font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Duração
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`py-1.5 rounded-lg transition ${
              activeTab === 'voice'
                ? 'bg-indigo-600 text-white shadow font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Voz (CromyVoice)</span>
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMsg && (
        <div className="mx-4 mt-3 p-2.5 rounded-xl bg-emerald-950/90 border border-emerald-500/70 text-emerald-200 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-150">
          <Icons.Check />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Corpo do Inspetor */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
        {/* ABA 1: Conteúdo & Roteiro (Editor Script no Topo + Formulário Modular Automático Embaixo) */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            {/* SEÇÃO 1: EDITOR DE SCRIPT & NARRAÇÃO */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xl relative">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-950/80 border border-indigo-800/60 text-indigo-400 flex items-center justify-center">
                    <Icons.Volume />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider block">
                      Editor de Script & Narração
                    </span>
                    <span className="text-[10px] font-mono text-indigo-400">
                      {scriptText.split(/\s+/).filter(Boolean).length} palavras • ~{baseAudioSeconds.toFixed(1)}s estimadas
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 ml-auto">
                  <button
                    type="button"
                    onClick={handleScriptLorem}
                    className="px-2 py-1 text-[11px] font-mono font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-indigo-300 transition flex items-center gap-1"
                    title="Inserir texto de exemplo (Lorem) no roteiro"
                  >
                    <span>Lorem</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAutoFillFromScript}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-300 hover:text-white transition flex items-center gap-1.5 shadow-sm"
                    title="Puxar dados do roteiro e preencher automaticamente os campos do formulário"
                  >
                    <Icons.Sparkles />
                    <span className="hidden xs:inline">Puxar para Campos</span>
                    <span className="xs:hidden">Puxar</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTogglePlayScript}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition flex items-center gap-1.5 shadow-md ${
                      isPlayingScript
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                    }`}
                    title={isPlayingScript ? 'Parar narração' : 'Ouvir narração da cena'}
                  >
                    {isPlayingScript ? <Icons.Pause /> : <Icons.Play />}
                    <span>{isPlayingScript ? 'Parar' : 'Ouvir'}</span>
                  </button>
                </div>
              </div>

              {/* Textarea do Script */}
              <div className="relative">
                <textarea
                  value={scriptText}
                  onChange={(e) => handleScriptChange(e.target.value)}
                  rows={3}
                  placeholder="Digite o roteiro da cena que será narrado pela voz neural..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
                />
              </div>

              {/* Barra Rápida de Pausas e Velocidade */}
              <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-900 text-xs flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-400">Pausas:</span>
                  {[0.5, 1.0, 1.5].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => handleInsertSleepTag(sec)}
                      className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono text-slate-300 hover:text-indigo-300 transition"
                      title={`Inserir pausa de ${sec}s no roteiro`}
                    >
                      +{sec}s
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-[11px] text-slate-400">Velocidade:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="range"
                      min="0.7"
                      max="1.5"
                      step="0.1"
                      value={scriptSpeed}
                      onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                      className="w-16 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <span className="font-mono text-[10px] text-indigo-400 font-bold w-7 text-right">
                      {scriptSpeed.toFixed(1)}x
                    </span>
                  </div>
                </div>
              </div>

              {/* Seletor Rápido de Voz CromyVoice no Tab de Roteiro */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-900/80 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold flex items-center gap-1">
                    <span>⚡ CromyVoice</span>
                  </span>
                  <select
                    value={currentVoiceId}
                    onChange={(e) => handleVoiceChange(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-indigo-500 font-sans cursor-pointer"
                    title="Selecione a voz neural CromyVoice para esta cena"
                  >
                    <optgroup label="Português do Brasil (9 Vozes Neurais)">
                      {CROMY_VOICES.filter((v) => v.lang === 'pt-BR').map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.gender}){v.recommended ? ' ★' : ''}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="English US (3 Neural Voices)">
                      {CROMY_VOICES.filter((v) => v.lang === 'en-US').map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Español (2 Voces Neurales)">
                      {CROMY_VOICES.filter((v) => v.lang === 'es-ES').map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('voice')}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 underline font-mono ml-auto"
                >
                  Configurações de Áudio & Provedor →
                </button>
              </div>
            </div>

            {/* SEÇÃO 2: FORMULÁRIO MODULAR AUTOMÁTICO DO TEMPLATE */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 gap-2 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Formulário Modular Automático
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Preencha e verifique os dados visuais exigidos pelo template.
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full font-bold">
                    {filledFieldsCount}/{templateDef.schema.length} Verificados
                  </span>
                </div>
              </div>

              {/* Lista dos Campos do Schema */}
              <div className="space-y-4">
                {templateDef.schema.map((field) => {
                  const val = card.props[field.name] ?? field.defaultValue;

                  if (field.type === 'toggle') {
                    return (
                      <div
                        key={field.name}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800"
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
                      <div key={field.name} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-semibold text-slate-300">
                            {field.label}
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              handlePropChange(field.name, getShortLoremForField(field.name, 'textarea'))
                            }
                            className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700/70 text-slate-400 hover:text-indigo-300 transition flex items-center gap-1"
                            title="Inserir texto curto de exemplo (Lorem Ipsum)"
                          >
                            <span>Lorem</span>
                          </button>
                        </div>
                        <textarea
                          value={val || ''}
                          onChange={(e) => handlePropChange(field.name, e.target.value)}
                          rows={3}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
                        />
                      </div>
                    );
                  }

                  if (field.type === 'color') {
                    return (
                      <div
                        key={field.name}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800"
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

                  if (field.type === 'select' && field.options) {
                    return (
                      <div key={field.name} className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-300">
                          {field.label}
                        </label>
                        <select
                          value={val || field.defaultValue}
                          onChange={(e) => handlePropChange(field.name, e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                        >
                          {field.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  }

                  // Default: text ou number input
                  return (
                    <div key={field.name} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-slate-300">
                          {field.label}
                        </label>
                        {field.type !== 'number' && (
                          <button
                            type="button"
                            onClick={() =>
                              handlePropChange(field.name, getShortLoremForField(field.name, 'text'))
                            }
                            className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700/70 text-slate-400 hover:text-indigo-300 transition flex items-center gap-1"
                            title="Inserir texto curto de exemplo (Lorem Ipsum)"
                          >
                            <span>Lorem</span>
                          </button>
                        )}
                      </div>
                      <input
                        type={field.type === 'number' ? 'number' : 'text'}
                        value={val || ''}
                        onChange={(e) =>
                          handlePropChange(
                            field.name,
                            field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
                          )
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
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
