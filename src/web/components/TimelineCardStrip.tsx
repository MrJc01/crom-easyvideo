import React, { useState } from 'react';
import type { CalculatedCard, VideoCard } from '../../core/types';
import { Icons, TemplateIconMap } from '../../core/icons';
import { CARD_REGISTRY } from '../../templates/registry';

export interface TimelineCardStripProps {
  cards: CalculatedCard[];
  selectedCardId: string;
  onSelectCard: (id: string) => void;
  onReorderCards: (newCards: VideoCard[]) => void;
  onDuplicateCard: (cardId: string) => void;
  onDeleteCard: (cardId: string) => void;
  onOpenCatalog: () => void;
  currentFrame: number;
  onSeekToCard: (startFrame: number) => void;
}

export const TimelineCardStrip: React.FC<TimelineCardStripProps> = ({
  cards,
  selectedCardId,
  onSelectCard,
  onReorderCards,
  onDuplicateCard,
  onDeleteCard,
  onOpenCatalog,
  currentFrame,
  onSeekToCard,
}) => {
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;

    const updated = [...cards];
    const item = updated.splice(draggedIdx, 1)[0];
    updated.splice(idx, 0, item);

    const ordered = updated.map((c, i) => ({ ...c, order: i }));
    onReorderCards(ordered);
    setDraggedIdx(idx);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Icons.Film />
            <span>Timeline de Cenas ({cards.length} Cards)</span>
          </span>
          <span className="text-[11px] text-slate-500">
            Arraste para reordenar • Clique para navegar
          </span>
        </div>

        <button
          onClick={onOpenCatalog}
          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-md shadow-indigo-600/20"
        >
          <Icons.Plus />
          <span>Adicionar Cena</span>
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 pt-1">
        {cards.map((card, idx) => {
          const isSelected = card.id === selectedCardId;
          const isPlayingThis = currentFrame >= card.startFrame && currentFrame < card.endFrame;
          const templateDef = CARD_REGISTRY[card.templateId] || CARD_REGISTRY['hero-title'];
          const IconComp = TemplateIconMap[templateDef.iconName] || Icons.Film;

          return (
            <div
              key={card.id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onClick={() => {
                onSelectCard(card.id);
                onSeekToCard(card.startFrame);
              }}
              className={`min-w-[210px] max-w-[210px] bg-slate-950 border rounded-xl p-3 cursor-pointer transition select-none relative group flex flex-col justify-between ${
                isPlayingThis
                  ? 'border-emerald-500 ring-2 ring-emerald-500/40 shadow-emerald-500/10 shadow-xl'
                  : isSelected
                  ? 'border-indigo-500 ring-2 ring-indigo-500/40 shadow-indigo-500/10 shadow-xl'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {isPlayingThis && (
                <div className="absolute -top-2.5 left-3 bg-emerald-500 text-slate-950 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-950" /> Em Exibição
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold text-slate-500">
                    #{idx + 1}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateCard(card.id);
                      }}
                      title="Duplicar cena"
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                    >
                      <Icons.Copy />
                    </button>
                    {cards.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCard(card.id);
                        }}
                        title="Excluir cena"
                        className="p-1 hover:bg-slate-800 rounded text-rose-400 hover:text-rose-300"
                      >
                        <Icons.Trash />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-indigo-400 flex items-center justify-center shrink-0">
                    <IconComp />
                  </div>
                  <div className="overflow-hidden">
                    <h5 className="text-xs font-bold text-white truncate">{templateDef.name}</h5>
                    <p className="text-[10px] text-slate-400 truncate">
                      {card.props.title ||
                        card.props.conceptTitle ||
                        card.props.headline ||
                        'Sem título'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>{card.totalDurationInSeconds}s</span>
                <span className="text-indigo-400 font-semibold">{card.durationInFrames}f</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineCardStrip;
