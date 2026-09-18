import React, { useState, useEffect, useMemo } from 'react';
import { Icons, TemplateIconMap } from '../../core/icons';
import { CARD_REGISTRY, TEMPLATE_CATEGORIES } from '../../templates/registry';

export interface TemplateCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (templateId: string) => void;
  fps: number;
}

export const TemplateCatalogModal: React.FC<TemplateCatalogModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  fps,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [previewTemplateId, setPreviewTemplateId] = useState<string>('hero-title');
  const [previewFrame, setPreviewFrame] = useState<number>(15);
  const [isAnimatingPreview, setIsAnimatingPreview] = useState<boolean>(true);

  const categories = TEMPLATE_CATEGORIES;

  const templateList = useMemo(() => Object.values(CARD_REGISTRY), []);
  const filtered =
    activeCategory === 'Todos'
      ? templateList
      : templateList.filter((t) => t.category === activeCategory);

  const activePreviewDef = CARD_REGISTRY[previewTemplateId] || templateList[0];

  useEffect(() => {
    if (!isOpen || !isAnimatingPreview) return;
    const interval = setInterval(() => {
      setPreviewFrame((f) => (f + 1) % 75);
    }, 1000 / 30);
    return () => clearInterval(interval);
  }, [isOpen, isAnimatingPreview]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-6xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Icons.Sparkles />
              <span>Loja de Templates Remotion (30 Modelos Modulares)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Selecione qualquer template para visualizar o preview animado com suporte a mídias e listas dinâmicas.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm"
          >
            <Icons.Close />
          </button>
        </div>

        <div className="flex gap-2 my-4 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden min-h-0">
          <div className="lg:col-span-7 overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[58vh]">
            {filtered.map((tmpl) => {
              const isSelected = tmpl.id === previewTemplateId;
              const IconComp = TemplateIconMap[tmpl.iconName] || Icons.Film;

              return (
                <div
                  key={tmpl.id}
                  onClick={() => setPreviewTemplateId(tmpl.id)}
                  className={`bg-slate-950 border rounded-2xl p-4 cursor-pointer transition flex flex-col justify-between group ${
                    isSelected
                      ? 'border-indigo-500 ring-2 ring-indigo-500/40 bg-slate-900/60'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-950/60 border border-indigo-900/50 text-indigo-400 flex items-center justify-center">
                        <IconComp />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {tmpl.category}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">
                      {tmpl.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                      {tmpl.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500 text-[11px]">Ver Preview</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTemplate(tmpl.id);
                        onClose();
                      }}
                      className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition flex items-center gap-1 shadow-md shadow-indigo-600/30"
                    >
                      <Icons.Plus />
                      <span>Adicionar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-5 flex flex-col bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                <span className="text-xs font-bold text-white">Preview Animado ao Vivo</span>
              </div>
              <button
                onClick={() => setIsAnimatingPreview(!isAnimatingPreview)}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-mono"
              >
                {isAnimatingPreview ? '⏸ Pausar Loop' : '▶ Reproduzir Loop'}
              </button>
            </div>

            <div className="w-full aspect-video bg-black rounded-xl border border-slate-800 overflow-hidden relative shadow-inner flex items-center justify-center">
              {activePreviewDef?.Component && (
                <div className="w-full h-full transform scale-75 origin-center">
                  <activePreviewDef.Component
                    props={activePreviewDef.defaultProps}
                    frame={previewFrame}
                    fps={fps}
                  />
                </div>
              )}
            </div>

            <div className="mt-4 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-base font-bold text-white">{activePreviewDef.name}</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {activePreviewDef.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-mono text-slate-400">
                  <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded">
                    FPS: {fps}
                  </span>
                  <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded">
                    Campos no Formulário: {activePreviewDef.schema.length}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  onSelectTemplate(activePreviewDef.id);
                  onClose();
                }}
                className="w-full mt-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition"
              >
                <Icons.Plus />
                <span>Adicionar Este Template ao Vídeo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateCatalogModal;
