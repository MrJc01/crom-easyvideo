import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { TemplateDefinition } from '../../core/types';
import { CARD_REGISTRY, registerTemplate } from '../../templates/registry';
import { Icons, TemplateIconMap } from '../../core/icons';
import { MediaFieldEditor } from './MediaFieldEditor';
import { DynamicArrayField } from './DynamicArrayField';

export interface TemplateSandboxProps {
  onBackToStudio?: () => void;
}

export const TemplateSandbox: React.FC<TemplateSandboxProps> = ({ onBackToStudio }) => {
  const allTemplates = useMemo(() => Object.values(CARD_REGISTRY), []);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    allTemplates[0]?.id || 'hero-title'
  );

  const activeTemplate = useMemo(() => {
    return CARD_REGISTRY[selectedTemplateId] || allTemplates[0];
  }, [selectedTemplateId, allTemplates]);

  // Props editáveis locais
  const [currentProps, setCurrentProps] = useState<Record<string, any>>({
    ...(activeTemplate?.defaultProps || {}),
  });

  // Editor JSON
  const [jsonText, setJsonText] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'form' | 'json' | 'schema'>('form');

  // Controle de reprodução e frames no preview isolado
  const [localFrame, setLocalFrame] = useState<number>(15);
  const [maxFrames, setMaxFrames] = useState<number>(90);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Escala proporcional do viewport canônico (1920x1080)
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(0.4);

  // Sincroniza props e JSON ao trocar de template
  useEffect(() => {
    if (activeTemplate) {
      const initial = { ...(activeTemplate.defaultProps || {}) };
      setCurrentProps(initial);
      setJsonText(JSON.stringify(initial, null, 2));
      setJsonError(null);
      setLocalFrame(15);
    }
  }, [activeTemplate?.id]);

  // Hook de cálculo de escala proporcional não-destrutiva
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateScale = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w === 0 || h === 0) return;

      const padding = 24;
      const availW = Math.max(50, w - padding);
      const availH = Math.max(50, h - padding);

      const calculatedScale = Math.min(availW / 1920, availH / 1080) * 0.95;
      setScale(Math.max(0.08, calculatedScale));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    window.addEventListener('resize', updateScale);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, []);

  // Loop de playback local no sandbox
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setLocalFrame((prev) => {
        if (prev >= maxFrames - 1) {
          return 0;
        }
        return prev + 1;
      });
    }, 1000 / 30);

    return () => clearInterval(interval);
  }, [isPlaying, maxFrames]);

  // Atualização de prop individual
  const handlePropChange = (fieldName: string, value: any) => {
    const updated = { ...currentProps, [fieldName]: value };
    setCurrentProps(updated);
    setJsonText(JSON.stringify(updated, null, 2));
    setJsonError(null);
  };

  // Atualização a partir do editor JSON
  const handleJsonChange = (text: string) => {
    setJsonText(text);
    try {
      const parsed = JSON.parse(text);
      setCurrentProps(parsed);
      setJsonError(null);
    } catch (err: unknown) {
      setJsonError(err instanceof Error ? err.message : 'JSON inválido');
    }
  };

  // Ação: Resetar para props padrão
  const handleResetDefaults = () => {
    if (!activeTemplate) return;
    const defaults = { ...activeTemplate.defaultProps };
    setCurrentProps(defaults);
    setJsonText(JSON.stringify(defaults, null, 2));
    setJsonError(null);
  };

  // Ação: Duplicar Template
  const handleDuplicateTemplate = () => {
    if (!activeTemplate) return;
    const newId = `${activeTemplate.id}-copia-${Date.now().toString().slice(-4)}`;
    const duplicated: TemplateDefinition = {
      ...activeTemplate,
      id: newId,
      name: `${activeTemplate.name} (Cópia)`,
      defaultProps: { ...currentProps },
    };
    registerTemplate(duplicated);
    setSelectedTemplateId(newId);
    showNotice(`Template duplicado como "${duplicated.name}"`);
  };

  // Ação: Criar Novo Template Customizado
  const handleCreateCustomTemplate = () => {
    const customId = `custom-template-${Date.now().toString().slice(-4)}`;
    const newTemplate: TemplateDefinition = {
      id: customId,
      name: 'Novo Template Customizado',
      category: 'Conceitos & Explicações',
      iconName: 'Sparkles',
      description: 'Template criado sob medida através do Template Sandbox.',
      defaultProps: {
        title: 'Título do Card Personalizado',
        subtitle: 'Subtítulo descritivo configurável pelo usuário.',
        accentColor: '#6366f1',
        showBadge: true,
        badge: 'CUSTOM',
      },
      schema: [
        { name: 'showBadge', label: 'Exibir Badge', type: 'toggle', defaultValue: true },
        { name: 'badge', label: 'Texto do Badge', type: 'text', defaultValue: 'CUSTOM' },
        { name: 'title', label: 'Título', type: 'text', defaultValue: 'Título do Card Personalizado' },
        { name: 'subtitle', label: 'Subtítulo', type: 'textarea', defaultValue: 'Subtítulo descritivo configurável pelo usuário.' },
        { name: 'accentColor', label: 'Cor de Destaque', type: 'color', defaultValue: '#6366f1' },
      ],
      Component: activeTemplate?.Component || CARD_REGISTRY['hero-title'].Component,
    };

    registerTemplate(newTemplate);
    setSelectedTemplateId(customId);
    showNotice('Novo template criado e adicionado ao registry local.');
  };

  // Ação: Exportar Definição (.json)
  const handleExportJson = () => {
    if (!activeTemplate) return;
    const exportData = {
      id: activeTemplate.id,
      name: activeTemplate.name,
      category: activeTemplate.category,
      iconName: activeTemplate.iconName,
      description: activeTemplate.description,
      schema: activeTemplate.schema,
      defaultProps: currentProps,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template_${activeTemplate.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotice(`Arquivo template_${activeTemplate.id}.json exportado.`);
  };

  const showNotice = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const ComponentToRender = activeTemplate?.Component;
  const IconComp = activeTemplate
    ? TemplateIconMap[activeTemplate.iconName] || Icons.Film
    : Icons.Film;

  return (
    <div className="flex flex-col flex-1 max-w-[1700px] w-full mx-auto p-3 sm:p-6 gap-4 sm:gap-6">
      {/* Top Bar com Seletor e Ações CRUD */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
            <IconComp />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                Template Sandbox & Lab
              </h2>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono font-medium">
                {activeTemplate?.category || 'Geral'}
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate">
              {activeTemplate?.description || 'Ambiente isolado para prototipação e teste de templates.'}
            </p>
          </div>
        </div>

        {/* Dropdown de Templates e Ações Rápidas */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <select
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
            className="bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 transition cursor-pointer max-w-[220px] sm:max-w-[280px]"
          >
            {allTemplates.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.name} ({tpl.category})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleDuplicateTemplate}
            className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
            title="Duplicar Template Atual"
          >
            <Icons.Copy />
            <span className="hidden sm:inline">Duplicar</span>
          </button>

          <button
            type="button"
            onClick={handleCreateCustomTemplate}
            className="px-2.5 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-semibold transition flex items-center gap-1.5"
            title="Criar Novo Template do Zero"
          >
            <Icons.Plus />
            <span className="hidden sm:inline">Criar Novo</span>
          </button>

          <button
            type="button"
            onClick={handleExportJson}
            className="px-2.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
            title="Exportar Definição JSON"
          >
            <Icons.Download />
            <span className="hidden sm:inline">Exportar</span>
          </button>

          {onBackToStudio && (
            <button
              type="button"
              onClick={onBackToStudio}
              className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-medium border border-slate-700 transition ml-auto"
              title="Voltar ao Estúdio"
            >
              <Icons.Close />
            </button>
          )}
        </div>
      </div>

      {/* Notificação Toast Flutuante de Sucesso */}
      {saveSuccessMsg && (
        <div className="bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-xs font-medium px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in duration-150">
          <Icons.Check />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Grid Principal: Esquerda (Preview) | Direita (Props & JSON Editor) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start flex-1">
        {/* Coluna Esquerda: Preview Isolado do Card */}
        <div className="lg:col-span-7 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Header do Preview */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/90 text-slate-300 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="font-bold text-white uppercase tracking-wider">
                Palco Isolado (1920 × 1080)
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-indigo-400">
              <span>Frame: {localFrame}f / {maxFrames}f</span>
              <span>•</span>
              <span>{(localFrame / 30).toFixed(2)}s</span>
            </div>
          </div>

          {/* Viewport Canônico com Escala Proporcional */}
          <div
            ref={containerRef}
            className="w-full bg-black flex items-center justify-center p-4 relative min-h-[300px] sm:min-h-[440px] md:min-h-[500px] max-h-[560px] overflow-hidden select-none"
          >
            <div
              style={{
                width: '1920px',
                height: '1080px',
                transform: `scale(${scale})`,
                transformOrigin: 'center center',
                flexShrink: 0,
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: '#030712',
                boxShadow:
                  '0 25px 50px -12px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.08)',
              }}
            >
              {ComponentToRender && (
                <ComponentToRender props={currentProps} frame={localFrame} fps={30} />
              )}
            </div>
          </div>

          {/* Controles de Transporte e Scrubbing Local */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col gap-3">
            <div className="relative w-full">
              <input
                type="range"
                min={0}
                max={maxFrames - 1}
                value={localFrame}
                onChange={(e) => setLocalFrame(parseInt(e.target.value, 10) || 0)}
                className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setLocalFrame(0)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                  title="Frame 0"
                >
                  <Icons.SkipBack />
                </button>
                <button
                  type="button"
                  onClick={() => setLocalFrame((f) => Math.max(0, f - 10))}
                  className="px-2 py-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition text-xs font-mono"
                  title="-10 frames"
                >
                  -10f
                </button>
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition"
                >
                  {isPlaying ? <Icons.Pause /> : <Icons.Play />}
                  <span>{isPlaying ? 'Pausar' : 'Animar'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLocalFrame((f) => Math.min(maxFrames - 1, f + 10))}
                  className="px-2 py-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition text-xs font-mono"
                  title="+10 frames"
                >
                  +10f
                </button>
                <button
                  type="button"
                  onClick={() => setLocalFrame(maxFrames - 1)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                  title="Último Frame"
                >
                  <Icons.SkipForward />
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Duração Total:</span>
                <select
                  value={maxFrames}
                  onChange={(e) => setMaxFrames(parseInt(e.target.value, 10) || 90)}
                  className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-2 py-1 font-mono text-xs cursor-pointer"
                >
                  <option value={60}>60 frames (2.0s)</option>
                  <option value={90}>90 frames (3.0s)</option>
                  <option value={120}>120 frames (4.0s)</option>
                  <option value={180}>180 frames (6.0s)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Editor de Schema, Props e JSON */}
        <div className="lg:col-span-5 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl h-[560px] md:h-[640px] overflow-hidden">
          {/* Header com Abas */}
          <div className="flex items-center border-b border-slate-800 bg-slate-950/80 px-3 pt-2 gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className={`px-3 py-2 text-xs font-bold rounded-t-xl transition border-t-2 ${
                activeTab === 'form'
                  ? 'bg-slate-900 text-indigo-400 border-indigo-500'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              Formulário de Props
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('json')}
              className={`px-3 py-2 text-xs font-bold rounded-t-xl transition border-t-2 ${
                activeTab === 'json'
                  ? 'bg-slate-900 text-indigo-400 border-indigo-500'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              Editor JSON
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('schema')}
              className={`px-3 py-2 text-xs font-bold rounded-t-xl transition border-t-2 ${
                activeTab === 'schema'
                  ? 'bg-slate-900 text-indigo-400 border-indigo-500'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              Schema ({activeTemplate?.schema.length || 0})
            </button>

            <button
              type="button"
              onClick={handleResetDefaults}
              className="ml-auto text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800 transition"
              title="Restaurar valores padrão deste template"
            >
              Restaurar Padrão
            </button>
          </div>

          {/* Corpo das Abas */}
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            {/* ABA 1: Formulário Dinâmico de Props */}
            {activeTab === 'form' && (
              <div className="space-y-3.5">
                {activeTemplate?.schema.map((field) => {
                  const val = currentProps[field.name];

                  if (field.type === 'toggle') {
                    return (
                      <div
                        key={field.name}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800"
                      >
                        <span className="text-xs font-semibold text-slate-200">{field.label}</span>
                        <button
                          type="button"
                          onClick={() => handlePropChange(field.name, !val)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                            val
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {val ? <Icons.Eye /> : <Icons.EyeOff />}
                          <span>{val ? 'Ativado' : 'Desativado'}</span>
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
                          value={val ?? ''}
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

                  if (field.type === 'select' && field.options) {
                    return (
                      <div key={field.name}>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          {field.label}
                        </label>
                        <select
                          value={val || field.defaultValue}
                          onChange={(e) => handlePropChange(field.name, e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
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

                  return (
                    <div key={field.name}>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        {field.label}
                      </label>
                      <input
                        type={field.type === 'number' ? 'number' : 'text'}
                        value={val ?? ''}
                        onChange={(e) =>
                          handlePropChange(
                            field.name,
                            field.type === 'number'
                              ? parseFloat(e.target.value) || 0
                              : e.target.value
                          )
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* ABA 2: Editor JSON em Tempo Real */}
            {activeTab === 'json' && (
              <div className="flex flex-col h-full space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Edite os valores em JSON com sincronização imediata:</span>
                  {jsonError && (
                    <span className="text-rose-400 font-mono font-bold">{jsonError}</span>
                  )}
                </div>
                <textarea
                  value={jsonText}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  rows={18}
                  className={`w-full flex-1 bg-slate-950 border rounded-xl p-3 text-xs font-mono text-indigo-300 focus:outline-none leading-relaxed ${
                    jsonError ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                  }`}
                  spellCheck={false}
                />
              </div>
            )}

            {/* ABA 3: Visualizador do Schema de Definição */}
            {activeTab === 'schema' && (
              <div className="space-y-3">
                <div className="text-xs text-slate-400 mb-2">
                  Campos configurados no contrato de entrada deste template:
                </div>
                {activeTemplate?.schema.map((f, idx) => (
                  <div
                    key={f.name}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex flex-col gap-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">
                        {idx + 1}. {f.label} ({f.name})
                      </span>
                      <span className="px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-800 text-indigo-300 font-mono text-[10px] font-semibold">
                        {f.type}
                      </span>
                    </div>
                    {f.description && (
                      <span className="text-slate-400 text-[11px]">{f.description}</span>
                    )}
                    <div className="text-slate-500 text-[10px] font-mono mt-0.5">
                      Padrão: {JSON.stringify(f.defaultValue)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateSandbox;
