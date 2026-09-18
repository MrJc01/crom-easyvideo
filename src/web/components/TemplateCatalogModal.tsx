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
  const [mobileTab, setMobileTab] = useState<'list' | 'preview'>('list');

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl max-w-6xl w-full p-4 sm:p-6 shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-800">
          <div className="min-w-0 pr-2">
            <h2 className="text-base sm:text-xl font-bold text-white flex items-center gap-2 truncate">
              <Icons.Sparkles />
              <span className="truncate">Loja de Templates (30 Modelos)</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate hidden xs:block">
              Selecione qualquer template para visualizar o preview animado com mídias e listas.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm shrink-0"
          >
            <Icons.Close />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex gap-1.5 sm:gap-2 my-3 overflow-x-auto pb-1 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap transition ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Mobile Tab Switcher */}
        <div className="flex lg:hidden bg-slate-950 p-1 rounded-xl border border-slate-800 mb-3 text-xs">
          <button
            onClick={() => setMobileTab('list')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition ${
              mobileTab === 'list' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'
            }`}
          >
            Modelos ({filtered.length})
          </button>
          <button
            onClick={() => setMobileTab('preview')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition ${
              mobileTab === 'preview' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'
            }`}
          >
            Preview: {activePreviewDef.name}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 flex-1 overflow-hidden min-h-0">
          {/* Templates Grid List */}
          <div
            className={`lg:col-span-7 overflow-y-auto pr-1 sm:pr-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 max-h-[58vh] ${
              mobileTab === 'preview' ? 'hidden lg:grid' : 'grid'
            }`}
          >
            {filtered.map((tmpl) => {
              const isSelected = tmpl.id === previewTemplateId;
              const IconComp = TemplateIconMap[tmpl.iconName] || Icons.Film;

              return (
                <div
                  key={tmpl.id}
                  onClick={() => {
                    setPreviewTemplateId(tmpl.id);
                  }}
                  className={`bg-slate-950 border rounded-2xl p-3 sm:p-4 cursor-pointer transition flex flex-col justify-between group ${
                    isSelected
                      ? 'border-indigo-500 ring-2 ring-indigo-500/40 bg-slate-900/60'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-950/60 border border-indigo-900/50 text-indigo-400 flex items-center justify-center">
                        <IconComp />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {tmpl.category}
                      </span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-300 transition">
                      {tmpl.name}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                      {tmpl.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-900 flex items-center justify-between text-xs font-semibold">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewTemplateId(tmpl.id);
                        setMobileTab('preview');
                      }}
                      className="text-indigo-400 hover:text-indigo-300 text-[11px] underline sm:no-underline"
                    >
                      Ver Preview
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTemplate(tmpl.id);
                        onClose();
                      }}
                      className="px-2.5 sm:px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition flex items-center gap-1 shadow-md shadow-indigo-600/30"
                    >
                      <Icons.Plus />
                      <span>Adicionar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Animated Preview Area */}
          <div
            className={`lg:col-span-5 flex flex-col bg-slate-950 border border-slate-800 rounded-2xl p-3 sm:p-4 overflow-hidden ${
              mobileTab === 'list' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                <span className="text-xs font-bold text-white">Preview Animado ao Vivo</span>
              </div>
              <button
                onClick={() => setIsAnimatingPreview(!isAnimatingPreview)}
                className="text-[10px] sm:text-[11px] text-indigo-400 hover:text-indigo-300 font-mono"
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

            <div className="mt-3 sm:mt-4 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-sm sm:text-base font-bold text-white">{activePreviewDef.name}</h4>
                <p className="text-[11px] sm:text-xs text-slate-300 mt-1 leading-relaxed">
                  {activePreviewDef.description}
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-mono text-slate-400">
                  <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                    FPS: {fps}
                  </span>
                  <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                    Campos: {activePreviewDef.schema.length}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-3 sm:mt-4">
                <button
                  onClick={() => setMobileTab('list')}
                  className="lg:hidden flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Voltar à Lista
                </button>
                <button
                  onClick={() => {
                    onSelectTemplate(activePreviewDef.id);
                    onClose();
                  }}
                  className="flex-1 py-2 sm:py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/30 transition"
                >
                  <Icons.Plus />
                  <span>Adicionar Template</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateCatalogModal;
