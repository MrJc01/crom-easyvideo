import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { ProjectState, VideoCard } from '../core/types';
import { INITIAL_PROJECT_STATE } from '../core/initialState';
import { calculateTimeline } from '../core/timeline';
import { Icons } from '../core/icons';
import { CARD_REGISTRY } from '../templates/registry';
import { useAudioSlideSync } from './hooks/useAudioSlideSync';
import {
  VideoPlayer,
  CardInspector,
  TimelineCardStrip,
  TemplateCatalogModal,
  JsonModal,
  RenderModal,
  TemplateSandbox,
  CardCreationDocs,
} from './components';

export default function App() {
  const [project, setProject] = useState<ProjectState>(INITIAL_PROJECT_STATE);
  const [selectedCardId, setSelectedCardId] = useState<string>(project.cards[0]?.id || '');
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState<boolean>(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState<boolean>(false);
  const [isRenderModalOpen, setIsRenderModalOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [mobileView, setMobileView] = useState<'both' | 'player' | 'inspector'>('both');
  const [currentView, setCurrentView] = useState<'studio' | 'sandbox' | 'docs'>('studio');

  const { calculatedCards, totalFrames } = useMemo(() => {
    return calculateTimeline(project.cards, project.meta.fps);
  }, [project.cards, project.meta.fps]);

  const activeCard = useMemo(() => {
    const found = calculatedCards.find(
      (c) => currentFrame >= c.startFrame && currentFrame < c.endFrame
    );
    return found || calculatedCards[0] || null;
  }, [calculatedCards, currentFrame]);

  useEffect(() => {
    if (activeCard && activeCard.id !== selectedCardId) {
      setSelectedCardId(activeCard.id);
    }
  }, [activeCard?.id]);

  const selectedCard = useMemo(() => {
    return calculatedCards.find((c) => c.id === selectedCardId) || activeCard;
  }, [calculatedCards, selectedCardId, activeCard]);

  // Hook Central de Sincronização em Lockstep entre Áudio e Slides do Preview
  const { isSpeaking, isAudioHolding, handleSeek, togglePlay } = useAudioSlideSync({
    cards: calculatedCards,
    totalFrames,
    fps: project.meta.fps,
    currentFrame,
    setCurrentFrame,
    isPlaying,
    setIsPlaying,
    isMuted,
    activeCard,
  });

  const handleUpdateCard = (updated: VideoCard) => {
    setProject((prev) => ({
      ...prev,
      cards: prev.cards.map((c) => (c.id === updated.id ? updated : c)),
    }));
  };

  const handleDuplicateCard = (cardId: string) => {
    const target = project.cards.find((c) => c.id === cardId);
    if (!target) return;

    const newCard: VideoCard = {
      ...target,
      id: `card-${Date.now()}`,
      order: target.order + 1,
      props: {
        ...target.props,
        title: target.props.title ? `${target.props.title} (Cópia)` : undefined,
      },
    };

    const newCards = [...project.cards];
    newCards.splice(target.order + 1, 0, newCard);
    const reordered = newCards.map((c, idx) => ({ ...c, order: idx }));

    setProject((prev) => ({ ...prev, cards: reordered }));
    setSelectedCardId(newCard.id);
  };

  const handleDeleteCard = (cardId: string) => {
    if (project.cards.length <= 1) return;
    const remaining = project.cards.filter((c) => c.id !== cardId);
    const reordered = remaining.map((c, idx) => ({ ...c, order: idx }));
    setProject((prev) => ({ ...prev, cards: reordered }));
    setSelectedCardId(reordered[0]?.id || '');
  };

  const handleAddFromTemplate = (templateId: string) => {
    const def = CARD_REGISTRY[templateId];
    if (!def) return;

    const defaultFrames = def.defaultDurationInFrames || 120;
    const defaultSeconds = Math.round((defaultFrames / 30) * 10) / 10;

    const newCard: VideoCard = {
      id: `card-${Date.now()}`,
      order: project.cards.length,
      templateId: def.id,
      durationMode: 'auto',
      manualDurationInFrames: defaultFrames,
      manualDurationInSeconds: defaultSeconds,
      audioPaddingEndInSeconds: 0.8,
      audio: {
        mode: 'tts',
        script: `Apresentamos agora o conceito sobre ${def.name}. [@sleep-1.0] Aprofunde os detalhes no editor.`,
        voiceId: 'pt-BR-Antonio',
        provider: 'browser-tts',
        speed: 1.0,
      },
      props: { ...def.defaultProps },
    };

    setProject((prev) => ({
      ...prev,
      cards: [...prev.cards, newCard],
    }));
    setSelectedCardId(newCard.id);
    handleSeek(totalFrames);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
            <Icons.Film />
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm md:text-base font-extrabold text-white tracking-tight flex items-center gap-1.5 sm:gap-2 truncate">
              <span className="truncate">Remotion Studio</span>
              <span className="hidden sm:inline-block text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono font-normal shrink-0">
                v3.2 Modular
              </span>
            </h1>
            <p className="text-[10px] sm:text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-md hidden xs:block">
              {project.meta.title}
            </p>
          </div>
        </div>

        {/* Navigation Selector de Rotas / Abas no Topo */}
        <nav className="hidden md:flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-1 gap-1">
          <button
            onClick={() => setCurrentView('studio')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              currentView === 'studio'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icons.Film />
            <span>Estúdio de Vídeo</span>
          </button>
          <button
            onClick={() => setCurrentView('sandbox')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              currentView === 'sandbox'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icons.Sparkles />
            <span>Sandbox de Templates</span>
          </button>
          <button
            onClick={() => setCurrentView('docs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              currentView === 'docs'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icons.Code />
            <span>Guia de Criação</span>
          </button>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Botão Principal de Renderizar & Baixar */}
          <button
            onClick={() => setIsRenderModalOpen(true)}
            className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 sm:gap-2 transition active:scale-95"
            title="Renderizar e Baixar Vídeo"
          >
            <Icons.Video />
            <span className="hidden sm:inline">Renderizar & Baixar</span>
            <span className="sm:hidden">Baixar</span>
          </button>

          <button
            onClick={() => setIsCatalogOpen(true)}
            className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 sm:gap-2 transition"
            title="Loja de Templates"
          >
            <Icons.Sparkles />
            <span className="hidden sm:inline">Loja de Templates</span>
            <span className="sm:hidden">Templates</span>
          </button>

          <button
            onClick={() => setIsJsonModalOpen(true)}
            className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 sm:gap-2 transition border border-slate-700"
            title="Importar / Exportar JSON"
          >
            <Icons.Download />
            <span className="hidden sm:inline">JSON</span>
            <span className="sm:hidden">JSON</span>
          </button>
        </div>
      </header>

      {/* Visualização Condicional: Sandbox de Templates */}
      {currentView === 'sandbox' && (
        <TemplateSandbox onBackToStudio={() => setCurrentView('studio')} />
      )}

      {/* Visualização Condicional: Guia de Criação de Cards */}
      {currentView === 'docs' && (
        <CardCreationDocs onBackToStudio={() => setCurrentView('studio')} />
      )}

      {/* Visualização Principal: Estúdio Remotion */}
      {currentView === 'studio' && (
        <main className="flex-1 p-3 sm:p-6 flex flex-col gap-4 sm:gap-6 max-w-[1700px] w-full mx-auto">
          {/* Mobile Quick Selector */}
          <div className="flex lg:hidden bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-medium">
            <button
              onClick={() => setMobileView('both')}
              className={`flex-1 py-1.5 rounded-lg text-center transition ${
                mobileView === 'both' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'
              }`}
            >
              Visão Completa
            </button>
            <button
              onClick={() => setMobileView('player')}
              className={`flex-1 py-1.5 rounded-lg text-center transition ${
                mobileView === 'player' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'
              }`}
            >
              Apenas Player
            </button>
            <button
              onClick={() => setMobileView('inspector')}
              className={`flex-1 py-1.5 rounded-lg text-center transition ${
                mobileView === 'inspector' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'
              }`}
            >
              Apenas Editor
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 flex-1 items-start">
            {/* Central Remotion Player */}
            <div
              className={`lg:col-span-7 flex flex-col gap-4 ${
                mobileView === 'inspector' ? 'hidden lg:flex' : 'flex'
              }`}
            >
              <VideoPlayer
                project={project}
                currentFrame={currentFrame}
                isPlaying={isPlaying}
                onFrameChange={handleSeek}
                onTogglePlay={togglePlay}
                calculatedCards={calculatedCards}
                totalFrames={totalFrames}
                activeCard={activeCard}
                isMuted={isMuted}
                onToggleMute={() => setIsMuted(!isMuted)}
                isSpeaking={isSpeaking}
                isAudioHolding={isAudioHolding}
                onOpenRenderModal={() => setIsRenderModalOpen(true)}
              />
            </div>

            {/* Modular Dynamic Inspector */}
            <div
              className={`lg:col-span-5 h-[520px] sm:h-[580px] lg:h-[620px] ${
                mobileView === 'player' ? 'hidden lg:block' : 'block'
              }`}
            >
              <CardInspector
                card={selectedCard}
                onUpdateCard={handleUpdateCard}
                fps={project.meta.fps}
              />
            </div>
          </div>

          {/* Bottom Horizontal Timeline Filmstrip */}
          <div className="w-full">
            <TimelineCardStrip
              cards={calculatedCards}
              selectedCardId={selectedCardId}
              onSelectCard={setSelectedCardId}
              onReorderCards={(newCards) => setProject((prev) => ({ ...prev, cards: newCards }))}
              onDuplicateCard={handleDuplicateCard}
              onDeleteCard={handleDeleteCard}
              onOpenCatalog={() => setIsCatalogOpen(true)}
              currentFrame={currentFrame}
              onSeekToCard={handleSeek}
            />
          </div>
        </main>
      )}

      {/* Modals */}
      <TemplateCatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        onSelectTemplate={handleAddFromTemplate}
        fps={project.meta.fps}
      />

      <JsonModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        project={project}
        onImport={(imported) => {
          setProject(imported);
          setSelectedCardId(imported.cards[0]?.id || '');
          handleSeek(0);
        }}
      />

      <RenderModal
        isOpen={isRenderModalOpen}
        onClose={() => setIsRenderModalOpen(false)}
        project={project}
        calculatedCards={calculatedCards}
        totalFrames={totalFrames}
      />
    </div>
  );
}
