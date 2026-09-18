import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type {
  ProjectState,
  VideoCard,
  CalculatedCard,
  TemplateDefinition,
  FieldDefinition,
  TTSAudioConfig,
  FileAudioConfig,
  RecordAudioConfig,
} from '../../core/types';
import { Icons, TemplateIconMap } from '../../core/icons';
import { CARD_REGISTRY, getAllTemplates, TEMPLATE_CATEGORIES } from '../../templates/registry';
import { calculateCanonicalScale, DEFAULT_RESOLUTION_PRESET } from '../../core/resolutions';
import { parseScriptAndDelays } from '../../core/timeline';
import { getShortLoremForField } from '../../core/lorem';
import {
  playScriptWithSpeechSynthesis,
  stopSpeechSynthesis,
  isSpeechSynthesisSupported,
} from '../../tts/providers/browserTts';
import { MediaFieldEditor } from './MediaFieldEditor';
import { DynamicArrayField } from './DynamicArrayField';
import { AudioSourceSelector } from './AudioSourceSelector';
import { isCustomTemplate } from '../../core/customTemplates';
import { StageErrorBoundary } from './StageErrorBoundary';

function getCardScriptText(card: VideoCard, fallbackText: string): string {
  if (card.audio && 'script' in card.audio && card.audio.script?.trim()) {
    return card.audio.script;
  }
  if (card.tts?.script?.trim()) {
    return card.tts.script;
  }
  if (fallbackText?.trim()) {
    return fallbackText;
  }
  return '';
}

export interface StackedCardsEditorProps {
  project: ProjectState;
  setProject: React.Dispatch<React.SetStateAction<ProjectState>>;
  calculatedCards: CalculatedCard[];
  totalFrames: number;
  fps: number;
  onUpdateCard: (updated: VideoCard) => void;
  onDeleteCard: (cardId: string) => void;
  onDuplicateCard: (cardId: string) => void;
  onReorderCards: (newCards: VideoCard[]) => void;
  onAddFromTemplate: (templateId: string) => void;
  onOpenRenderModal: () => void;
  onOpenCatalog: () => void;
  onOpenJsonModal: () => void;
  onSwitchToStudio?: () => void;
}

interface SceneCardProps {
  card: CalculatedCard;
  index: number;
  totalScenes: number;
  fps: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onUpdateCard: (updated: VideoCard) => void;
  onDeleteScene: (id: string) => void;
  onDuplicateScene: (id: string) => void;
  onMoveScene: (fromIdx: number, toIdx: number) => void;
  onOpenCatalog: () => void;
}

const StackedSceneCard: React.FC<SceneCardProps> = ({
  card,
  index,
  totalScenes,
  fps,
  isPlaying,
  onTogglePlay,
  onUpdateCard,
  onDeleteScene,
  onDuplicateScene,
  onMoveScene,
  onOpenCatalog,
}) => {
  const [activeTab, setActiveTab] = useState<'template' | 'config' | 'voice'>('config');
  const [localFrame, setLocalFrame] = useState<number>(0);
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<string>('Todos');

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(0.2);

  // Instância de áudio HTML5 dedicada para arquivos e gravações
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  if (!audioPlayerRef.current && typeof Audio !== 'undefined') {
    audioPlayerRef.current = new Audio();
    audioPlayerRef.current.preload = 'auto';
  }

  const ttsCleanupRef = useRef<(() => void) | null>(null);
  const isSpeakingRef = useRef<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Parada segura de qualquer áudio deste card
  const stopCardAudio = useCallback(() => {
    if (!isSpeakingRef.current && (!audioPlayerRef.current || audioPlayerRef.current.paused)) {
      return;
    }
    isSpeakingRef.current = false;
    setIsSpeaking(false);
    if (ttsCleanupRef.current) {
      ttsCleanupRef.current();
      ttsCleanupRef.current = null;
    }
    stopSpeechSynthesis();
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
  }, []);

  // Parada de segurança ao desmontar ou trocar de card
  useEffect(() => {
    return () => {
      stopCardAudio();
    };
  }, [card.id, stopCardAudio]);

  const templateDef: TemplateDefinition =
    CARD_REGISTRY[card.templateId] || CARD_REGISTRY['hero-title'];

  const [templateVersion, setTemplateVersion] = useState(0);

  useEffect(() => {
    const handleUpdated = () => setTemplateVersion((v) => v + 1);
    window.addEventListener('crom:templates-updated', handleUpdated);
    return () => window.removeEventListener('crom:templates-updated', handleUpdated);
  }, []);

  const allTemplates = useMemo(() => getAllTemplates(), [templateVersion]);

  const filteredTemplates = useMemo(() => {
    if (templateCategoryFilter === 'Todos') return allTemplates;
    if (templateCategoryFilter === 'Customizados') {
      return allTemplates.filter(
        (t) => t.id.startsWith('custom-') || t.category === 'Customizados' || isCustomTemplate(t.id)
      );
    }
    return allTemplates.filter((t) => t.category === templateCategoryFilter);
  }, [allTemplates, templateCategoryFilter]);

  // Identifica o campo de texto primário do template para exibição no card
  const primaryTextField = useMemo(() => {
    return (
      templateDef.schema.find((f) => f.name === 'text') ||
      templateDef.schema.find((f) => f.name === 'title') ||
      templateDef.schema.find((f) => f.name === 'headline') ||
      templateDef.schema.find((f) => f.name === 'architectureTitle') ||
      templateDef.schema.find((f) => f.name === 'statement') ||
      templateDef.schema.find((f) => f.name === 'question') ||
      templateDef.schema.find((f) => f.name === 'quote') ||
      templateDef.schema.find((f) => f.type === 'text' || f.type === 'textarea') ||
      templateDef.schema[0]
    );
  }, [templateDef]);

  const primaryTextValue = (primaryTextField && card.props[primaryTextField.name]) || '';

  // Atualização de campos de props do card
  const handlePropChange = (fieldName: string, value: any) => {
    onUpdateCard({
      ...card,
      props: {
        ...card.props,
        [fieldName]: value,
      },
    });
  };

  // Atualização rápida de texto primário
  const handlePrimaryTextChange = (newText: string) => {
    if (primaryTextField) {
      handlePropChange(primaryTextField.name, newText);
    }
    // Também sincroniza com script de TTS se estiver em modo TTS
    if (card.audio?.mode === 'tts') {
      onUpdateCard({
        ...card,
        props: {
          ...card.props,
          ...(primaryTextField ? { [primaryTextField.name]: newText } : {}),
        },
        audio: {
          ...card.audio,
          script: newText,
        },
      });
    }
  };

  // Troca inteligente de template
  const handleSelectTemplate = (newTemplateId: string) => {
    const newDef = CARD_REGISTRY[newTemplateId];
    if (!newDef) return;

    // Preserva texto digitado pelo usuário caso exista
    const updatedProps = { ...newDef.defaultProps };
    if (primaryTextValue && primaryTextField) {
      const newPrimary =
        newDef.schema.find((f) => f.name === primaryTextField.name) ||
        newDef.schema.find((f) => f.type === 'text' || f.type === 'textarea') ||
        newDef.schema[0];
      if (newPrimary) {
        updatedProps[newPrimary.name] = primaryTextValue;
      }
    }

    const defaultFrames = newDef.defaultDurationInFrames || card.manualDurationInFrames || 120;
    const defaultSeconds = Math.round((defaultFrames / 30) * 10) / 10;

    onUpdateCard({
      ...card,
      templateId: newDef.id,
      manualDurationInFrames: defaultFrames,
      manualDurationInSeconds: defaultSeconds,
      props: updatedProps,
    });
  };

  const cardRef = useRef(card);
  cardRef.current = card;

  const fpsRef = useRef(fps);
  fpsRef.current = fps;

  const onTogglePlayRef = useRef(onTogglePlay);
  onTogglePlayRef.current = onTogglePlay;

  const primaryTextRef = useRef(primaryTextValue);
  primaryTextRef.current = primaryTextValue;

  // 1. Controle de Áudio da Cena (Inicia ao dar Play e encerra ao Pausar/Desmontar)
  useEffect(() => {
    if (!isPlaying) {
      stopCardAudio();
      return;
    }

    // Desbloqueio e resume preventivo do sintetizador do navegador
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch {}
    }

    const currentCard = cardRef.current;
    const audioConfig = currentCard.audio;
    const audioMode = audioConfig?.mode || (currentCard.tts ? 'tts' : 'none');

    // MODO ARQUIVO OU GRAVAÇÃO
    if (audioMode === 'file' || audioMode === 'record') {
      const url =
        audioMode === 'file'
          ? (audioConfig as FileAudioConfig)?.fileUrl
          : (audioConfig as RecordAudioConfig)?.blobUrl;

      if (url) {
        if (!audioPlayerRef.current && typeof Audio !== 'undefined') {
          audioPlayerRef.current = new Audio();
        }
        const audio = audioPlayerRef.current;
        if (audio) {
          audio.src = url;
          audio.currentTime = 0;
          isSpeakingRef.current = true;
          setIsSpeaking(true);

          audio.onended = () => {
            isSpeakingRef.current = false;
            setIsSpeaking(false);
            onTogglePlayRef.current();
            setLocalFrame(0);
          };

          audio.onerror = () => {
            isSpeakingRef.current = false;
            setIsSpeaking(false);
          };

          audio.play().catch((err) => {
            console.warn('[StackedSceneCard] Playback de áudio HTML5 bloqueado ou suspenso:', err);
            isSpeakingRef.current = false;
            setIsSpeaking(false);
          });
        }
      }
    }
    // MODO TTS (Síntese de Fala)
    else {
      const scriptText = getCardScriptText(currentCard, primaryTextRef.current);
      const speed =
        (audioConfig && 'speed' in audioConfig && audioConfig.speed) ||
        currentCard.tts?.speed ||
        1.0;
      const voiceId =
        (audioConfig && 'voiceId' in audioConfig && audioConfig.voiceId) ||
        currentCard.tts?.voiceId ||
        'pt-BR-AntonioNeural';

      if (scriptText && scriptText.trim()) {
        isSpeakingRef.current = true;
        setIsSpeaking(true);

        ttsCleanupRef.current = playScriptWithSpeechSynthesis(
          scriptText,
          speed,
          {
            onStart: () => {
              isSpeakingRef.current = true;
              setIsSpeaking(true);
            },
            onEnd: () => {
              isSpeakingRef.current = false;
              setIsSpeaking(false);
            },
            onError: () => {
              isSpeakingRef.current = false;
              setIsSpeaking(false);
            },
          },
          voiceId,
          (audioConfig && 'provider' in audioConfig && audioConfig.provider) || currentCard.tts?.provider || 'cromyvoice'
        );
      }
    }

    return () => {
      stopCardAudio();
    };
  }, [isPlaying, stopCardAudio]);

  // 2. Loop de avanço de frames sincronizado em lockstep (desacoplado do áudio para não reiniciá-lo)
  useEffect(() => {
    if (!isPlaying) return;

    // Reseta para frame 0 ao iniciar playback
    setLocalFrame(0);

    const intervalTime = 1000 / fps;
    const interval = setInterval(() => {
      const currentCard = cardRef.current;
      const totalFrames = currentCard.durationInFrames || 120;
      const audioMode = currentCard.audio?.mode || (currentCard.tts ? 'tts' : 'none');
      const audio = audioPlayerRef.current;

      // Se for arquivo ou gravação, o áudio é o relógio mestre
      if (
        (audioMode === 'file' || audioMode === 'record') &&
        audio &&
        !audio.paused &&
        !audio.ended
      ) {
        const targetFrame = Math.floor(audio.currentTime * fps);
        if (targetFrame >= totalFrames - 1) {
          audio.pause();
          onTogglePlayRef.current();
          setLocalFrame(0);
        } else {
          setLocalFrame(targetFrame);
        }
        return;
      }

      // Se for TTS ou sem áudio, avança a cada tick
      setLocalFrame((prev) => {
        if (prev >= totalFrames - 1) {
          // Slide Hold: segura no último quadro se o sintetizador ainda estiver falando
          if (isSpeakingRef.current) {
            return totalFrames - 1;
          }
          onTogglePlayRef.current();
          return 0;
        }
        return prev + 1;
      });
    }, intervalTime);

    return () => {
      clearInterval(interval);
    };
  }, [isPlaying, fps]);

  // Escala proporcional canônica de alta fidelidade
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateScale = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w === 0 || h === 0) return;

      const calculated = calculateCanonicalScale(
        w,
        h,
        DEFAULT_RESOLUTION_PRESET.canonicalWidth,
        DEFAULT_RESOLUTION_PRESET.canonicalHeight,
        16,
        0.98
      );
      setScale(calculated);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const ComponentToRender = templateDef.Component;

  // As 3 abas principais estilo badge
  const tabs = [
    { id: 'template' as const, label: 'Template', icon: Icons.LayoutTemplate },
    { id: 'config' as const, label: 'Configurações', icon: Icons.Settings2 },
    { id: 'voice' as const, label: 'Voz (CromyVoice)', icon: Icons.Mic },
  ];

  return (
    <div
      data-testid="scene-card"
      id={`scene-card-${card.id}`}
      className="relative w-full max-w-5xl bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-800 hover:border-slate-700 shadow-2xl overflow-hidden flex flex-col lg:flex-row transition-all duration-200"
    >
      {/* LADO ESQUERDO: Formulário completo preenchendo toda a metade esquerda */}
      <div className="flex-1 flex flex-col justify-between p-5 sm:p-7 min-w-0 bg-slate-900/70 border-b lg:border-b-0 lg:border-r border-slate-800/80">
        {/* Topo do card: Identificador, Título e Tabs */}
        <div>
          <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 text-xs font-bold font-mono shrink-0">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <h3 className="text-white font-semibold text-sm sm:text-base tracking-wide truncate">
                  Cena {index + 1} • <span className="text-slate-400 font-normal">{templateDef.name}</span>
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 bg-slate-800/80 border border-slate-700/60 px-2.5 py-0.5 rounded-full font-mono shrink-0">
                {card.totalDurationInSeconds.toFixed(1)}s ({card.durationInFrames}f)
              </span>
            </div>

            {/* Ações de Cena: Mover, Duplicar, Excluir */}
            <div className="flex items-center gap-1 shrink-0">
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => onMoveScene(index, index - 1)}
                  title="Mover para cima"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <Icons.ChevronLeft />
                </button>
              )}
              {index < totalScenes - 1 && (
                <button
                  type="button"
                  onClick={() => onMoveScene(index, index + 1)}
                  title="Mover para baixo"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <Icons.ChevronRight />
                </button>
              )}
              <button
                type="button"
                onClick={() => onDuplicateScene(card.id)}
                title="Duplicar cena"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <Icons.Copy />
              </button>
              {totalScenes > 1 && (
                <button
                  type="button"
                  onClick={() => onDeleteScene(card.id)}
                  title="Excluir cena"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                >
                  <Icons.Trash />
                </button>
              )}
            </div>
          </div>

          {/* Abas / Badges horizontais */}
          <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800/90 mb-5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                  className={`flex items-center justify-center gap-2 py-2 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTEÚDO DAS ABAS */}
        <div className="flex-1 flex flex-col justify-center py-1 min-h-[300px]">
          {/* TAB 1: TEMPLATE */}
          {activeTab === 'template' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center text-xs text-slate-400 flex-wrap gap-2">
                <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5 text-indigo-400">
                  <Icons.Sparkles /> Presets & Modelos de Vídeo
                </span>
                {/* Filtro de Categorias */}
                <select
                  value={templateCategoryFilter}
                  onChange={(e) => setTemplateCategoryFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {TEMPLATE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grid de Templates */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
                {filteredTemplates.map((tpl) => {
                  const isChosen = card.templateId === tpl.id;
                  const IconComp = TemplateIconMap[tpl.iconName] || Icons.Film;

                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleSelectTemplate(tpl.id)}
                      className={`relative flex flex-col items-center justify-between p-3 rounded-2xl border transition-all h-28 text-left ${
                        isChosen
                          ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/40 shadow-md shadow-indigo-500/10'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="w-full h-11 rounded-xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 flex items-center justify-center border border-white/10 shadow-inner">
                        <span className={isChosen ? 'text-indigo-400' : 'text-slate-400'}>
                          <IconComp />
                        </span>
                      </div>

                      <div className="w-full text-center mt-1">
                        <span className="text-[11px] font-medium text-slate-200 block truncate">
                          {tpl.name}
                        </span>
                        <span className="text-[9px] text-slate-500 block truncate">
                          {tpl.category}
                        </span>
                      </div>

                      {isChosen && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px]">
                          <Icons.Check />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={onOpenCatalog}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition"
                >
                  <Icons.Sparkles />
                  <span>Ver Todos na Loja de Templates &rarr;</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CONFIGURAÇÕES */}
          {activeTab === 'config' && (
            <div className="space-y-4 animate-fadeIn max-h-[380px] overflow-y-auto pr-1">
              {/* Texto Principal da Cena com Botão de Lorem */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Icons.Type /> Texto Principal da Cena
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const lorem = getShortLoremForField('headline', 'text');
                      handlePrimaryTextChange(lorem);
                    }}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 rounded transition"
                  >
                    Lorem
                  </button>
                </div>
                <textarea
                  value={primaryTextValue}
                  onChange={(e) => handlePrimaryTextChange(e.target.value)}
                  placeholder="Digite o texto ou legenda desta cena..."
                  rows={2}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none resize-none transition-all shadow-inner font-sans"
                />
              </div>

              {/* Formulário Modular Dinâmico com Campos Restantes do Schema */}
              <div className="space-y-3 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider">Propriedades do Card</span>
                  <span className="text-[11px] text-slate-500">
                    {templateDef.schema.length} campos configuráveis
                  </span>
                </div>

                {templateDef.schema.map((field: FieldDefinition) => {
                  if (field.name === primaryTextField?.name) return null; // Já renderizado no topo
                  const val = card.props[field.name];

                  if (field.type === 'media') {
                    return (
                      <div key={field.name} className="space-y-1">
                        <label className="text-xs font-medium text-slate-300">{field.label}</label>
                        <MediaFieldEditor
                          value={val}
                          onChange={(newMedia) => handlePropChange(field.name, newMedia)}
                        />
                      </div>
                    );
                  }

                  if (field.type === 'array') {
                    return (
                      <div key={field.name} className="space-y-1">
                        <DynamicArrayField
                          items={Array.isArray(val) ? val : []}
                          onChange={(newArr) => handlePropChange(field.name, newArr)}
                          label={field.label}
                          itemLabel={field.itemLabel}
                          itemDefaultValue={field.itemDefaultValue}
                        />
                      </div>
                    );
                  }

                  if (field.type === 'toggle') {
                    return (
                      <div
                        key={field.name}
                        className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80"
                      >
                        <span className="text-xs font-medium text-slate-300">{field.label}</span>
                        <input
                          type="checkbox"
                          checked={Boolean(val)}
                          onChange={(e) => handlePropChange(field.name, e.target.checked)}
                          className="w-4 h-4 rounded text-indigo-600 accent-indigo-500 bg-slate-800 border-slate-700 cursor-pointer"
                        />
                      </div>
                    );
                  }

                  if (field.type === 'color') {
                    return (
                      <div
                        key={field.name}
                        className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80"
                      >
                        <span className="text-xs font-medium text-slate-300">{field.label}</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={val || '#38bdf8'}
                            onChange={(e) => handlePropChange(field.name, e.target.value)}
                            className="w-7 h-7 rounded-lg border border-slate-700 bg-transparent cursor-pointer"
                          />
                          <span className="font-mono text-xs text-slate-400">
                            {val || '#38bdf8'}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  // Default text / textarea
                  return (
                    <div key={field.name} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <label className="font-medium text-slate-300">{field.label}</label>
                        <button
                          type="button"
                          onClick={() => {
                            const lorem = getShortLoremForField(field.name, field.type);
                            handlePropChange(field.name, lorem);
                          }}
                          className="text-[10px] text-slate-400 hover:text-indigo-400 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded transition"
                        >
                          Lorem
                        </button>
                      </div>
                      <input
                        type="text"
                        value={val !== undefined ? String(val) : ''}
                        onChange={(e) => handlePropChange(field.name, e.target.value)}
                        placeholder={`Digite ${field.label}...`}
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500 transition"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Duração & Transição */}
              <div className="space-y-3 bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800/80 mt-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Icons.Sliders /> Duração da Cena (Manual)
                  </span>
                  <span className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-md font-mono text-xs">
                    {card.totalDurationInSeconds.toFixed(1)}s ({card.durationInFrames}f)
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="0.5"
                  value={card.manualDurationInSeconds || card.totalDurationInSeconds}
                  onChange={(e) => {
                    const sec = parseFloat(e.target.value);
                    onUpdateCard({
                      ...card,
                      durationMode: 'manual',
                      manualDurationInSeconds: sec,
                      manualDurationInFrames: Math.round(sec * fps),
                    });
                  }}
                  className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 3: VOZ & NARRAÇÃO */}
          {activeTab === 'voice' && (
            <div className="space-y-4 animate-fadeIn max-h-[380px] overflow-y-auto pr-1">
              <AudioSourceSelector card={card} onUpdateCard={onUpdateCard} fps={fps} />
            </div>
          )}
        </div>

        {/* Rodapé interno do form */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Card Sincronizado</span>
          <span>Formato Canônico 1920×1080</span>
        </div>
      </div>

      {/* LADO DIREITO: Preview Quadrado / Canônico Preenchendo a extremidade direita */}
      <div 
        onClick={onTogglePlay}
        className="group w-full lg:w-[380px] xl:w-[420px] aspect-square shrink-0 bg-black relative flex items-center justify-center overflow-hidden select-none border-t lg:border-t-0 lg:border-l border-slate-800 cursor-pointer"
      >
        {/* Palco Virtual do Canvas com Renderização do Template */}
        <div
          ref={containerRef}
          className="w-full h-full flex items-center justify-center p-2 relative overflow-hidden bg-slate-950"
        >
          <div
            style={{
              width: `${DEFAULT_RESOLUTION_PRESET.canonicalWidth}px`,
              height: `${DEFAULT_RESOLUTION_PRESET.canonicalHeight}px`,
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
              flexShrink: 0,
              position: 'relative',
              overflow: 'hidden',
              backgroundColor: '#020617',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.95)',
            }}
          >
            <StageErrorBoundary
              resetKey={`${card.id}_${card.templateId}_${localFrame}`}
              title={`Card #${index + 1}: ${templateDef.name}`}
            >
              {ComponentToRender && (
                <ComponentToRender props={card.props} frame={localFrame} fps={fps} />
              )}
            </StageErrorBoundary>
          </div>
        </div>

        {/* Badges superiores no preview */}
        <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between pointer-events-none z-20">
          <div className="flex items-center gap-1.5">
            <div className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-white font-mono flex items-center gap-1.5 border border-white/10 shadow-lg">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="font-semibold tracking-wider">REC</span>
            </div>

            {isSpeaking && (
              <div className="bg-indigo-600/85 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] text-white font-mono flex items-center gap-1 border border-indigo-400/40 shadow-lg animate-fadeIn">
                <Icons.Volume />
                <span className="font-semibold">ÁUDIO SINCRONIZADO</span>
              </div>
            )}
          </div>

          <div className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-slate-300 font-mono border border-white/10 flex items-center gap-1 shadow-lg">
            <Icons.Maximize2 />
            <span>PREVIEW CENA</span>
          </div>
        </div>

        {/* Botão Play central - Visível estritamente quando PAUSADO para NUNCA obstruir o texto ou animação durante a reprodução */}
        {!isPlaying && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePlay();
            }}
            className="absolute z-20 w-14 h-14 rounded-2xl bg-black/60 hover:bg-indigo-600/95 border border-white/25 backdrop-blur-md flex items-center justify-center text-white shadow-2xl transition-all duration-200 transform scale-100 hover:scale-110 active:scale-95 animate-fadeIn"
            title="Reproduzir Cena"
          >
            <Icons.Play />
          </button>
        )}

        {/* Barra de progresso inferior interativa */}
        <div 
          onClick={(e) => {
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const targetFrame = Math.round(clickRatio * Math.max(1, card.durationInFrames - 1));
            setLocalFrame(targetFrame);
            if (audioPlayerRef.current && (card.audio?.mode === 'file' || card.audio?.mode === 'record')) {
              audioPlayerRef.current.currentTime = targetFrame / fps;
            }
          }}
          className="absolute bottom-0 inset-x-0 p-2.5 sm:p-3 bg-gradient-to-t from-black/95 via-black/80 to-transparent z-20 flex flex-col gap-1.5 cursor-pointer group/bar hover:bg-black/40 transition-colors"
          title="Clique para navegar no tempo da cena"
        >
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-300">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePlay();
                }}
                className="w-6 h-6 rounded-md bg-white/10 hover:bg-indigo-600 text-white flex items-center justify-center transition pointer-events-auto"
                title={isPlaying ? "Pausar Cena" : "Reproduzir Cena"}
              >
                {isPlaying ? <Icons.Pause /> : <Icons.Play />}
              </button>
              <span>{localFrame}f • {(localFrame / fps).toFixed(2)}s</span>
              {isSpeaking && (
                <span className="text-indigo-400 font-sans flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping inline-block" />
                  áudio ativo
                </span>
              )}
            </div>
            <span className="text-slate-400">
              {(card.durationInFrames / fps).toFixed(1)}s total
            </span>
          </div>
          <div className="h-2 w-full bg-white/15 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-75 shadow-sm shadow-indigo-500/50"
              style={{
                width: `${Math.min(100, (localFrame / Math.max(1, card.durationInFrames - 1)) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const StackedCardsEditor: React.FC<StackedCardsEditorProps> = ({
  project,
  setProject,
  calculatedCards,
  totalFrames,
  fps,
  onUpdateCard,
  onDeleteCard,
  onDuplicateCard,
  onReorderCards,
  onAddFromTemplate,
  onOpenRenderModal,
  onOpenCatalog,
  onOpenJsonModal,
  onSwitchToStudio,
}) => {
  const [playingCardId, setPlayingCardId] = useState<string | null>(null);

  // Parada de segurança de qualquer voz/áudio ativo ao desmontar a página
  useEffect(() => {
    return () => {
      stopSpeechSynthesis();
    };
  }, []);

  const handleTogglePlayCard = useCallback((cardId: string) => {
    setPlayingCardId((prev) => {
      if (prev !== null && prev !== cardId) {
        stopSpeechSynthesis();
      }
      return prev === cardId ? null : cardId;
    });
  }, []);

  const handleMoveScene = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= project.cards.length) return;
    const updated = [...project.cards];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    const reordered = updated.map((c, i) => ({ ...c, order: i }));
    onReorderCards(reordered);
  };

  const handleAddNewScene = () => {
    onAddFromTemplate('hero-title');
  };

  return (
    <div className="min-h-screen w-full bg-[#0b0f19] text-slate-100 font-sans flex flex-col items-center">
      {/* Barra superior de ações */}
      <header className="w-full h-16 bg-slate-900/70 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40 flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <Icons.Film />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm sm:text-base tracking-wide flex items-center gap-2">
              <span>Editor de Cenas Verticais</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono font-normal">
                Modo Cards
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Cards empilhados • Preview integrado • Sincronizado com o Estúdio
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          {onSwitchToStudio && (
            <button
              onClick={onSwitchToStudio}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition active:scale-95"
              title="Alternar para visualização de Timeline Clássica"
            >
              <Icons.Film />
              <span className="hidden md:inline">Estúdio Clássico</span>
            </button>
          )}

          <button
            onClick={handleAddNewScene}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition active:scale-95"
            title="Adicionar Nova Cena"
          >
            <Icons.Plus />
            <span className="hidden sm:inline">Nova Cena</span>
          </button>

          <button
            onClick={onOpenCatalog}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-semibold rounded-xl transition"
            title="Catálogo de Templates"
          >
            <Icons.Sparkles />
            <span className="hidden sm:inline">Templates</span>
          </button>

          <button
            onClick={onOpenRenderModal}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-indigo-600/30 active:scale-95"
            title="Renderizar e Baixar Vídeo"
          >
            Renderizar Vídeo
          </button>
        </div>
      </header>

      {/* ÁREA CENTRAL: Cards empilhados com espaçamento limpo */}
      <main className="w-full max-w-5xl px-4 py-8 flex flex-col items-center pb-28">
        <div className="w-full flex flex-col items-center space-y-8">
          {calculatedCards.map((card, index) => (
            <StackedSceneCard
              key={card.id}
              card={card}
              index={index}
              totalScenes={calculatedCards.length}
              fps={fps}
              isPlaying={playingCardId === card.id}
              onTogglePlay={() => handleTogglePlayCard(card.id)}
              onUpdateCard={onUpdateCard}
              onDeleteScene={(id) => {
                if (playingCardId === id) setPlayingCardId(null);
                onDeleteCard(id);
              }}
              onDuplicateScene={onDuplicateCard}
              onMoveScene={handleMoveScene}
              onOpenCatalog={onOpenCatalog}
            />
          ))}
        </div>

        {/* Botão de Adicionar Nova Cena no final da lista */}
        <div className="mt-10 w-full max-w-md flex justify-center">
          <button
            onClick={handleAddNewScene}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl border-2 border-dashed border-slate-800 hover:border-indigo-500/60 bg-slate-900/40 hover:bg-indigo-600/5 text-slate-400 hover:text-indigo-400 transition-all text-sm font-semibold group active:scale-95"
          >
            <div className="w-7 h-7 rounded-lg bg-slate-800 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center text-slate-300 transition">
              <Icons.Plus />
            </div>
            <span>Adicionar Próxima Cena</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default StackedCardsEditor;
