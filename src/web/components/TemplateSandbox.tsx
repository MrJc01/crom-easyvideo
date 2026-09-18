import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import type { TemplateDefinition, TemplateRenderProps } from '../../core/types';
import { CARD_REGISTRY, registerTemplate } from '../../templates/registry';
import { spring, interpolate } from '../../core/animations';
import { Icons, TemplateIconMap } from '../../core/icons';
import {
  type ResolutionPreset,
  RESOLUTION_PRESETS,
  DEFAULT_RESOLUTION_PRESET,
  calculateCanonicalScale,
} from '../../core/resolutions';
import {
  compileTsxTemplate,
  saveCustomTemplate,
  getCustomTemplateSource,
  isCustomTemplate,
  deleteCustomTemplate,
} from '../../core/customTemplates';
import { MediaFieldEditor } from './MediaFieldEditor';
import { DynamicArrayField } from './DynamicArrayField';
import { getShortLoremForField } from '../../core/lorem';

interface StageErrorBoundaryProps {
  children: React.ReactNode;
  resetKey?: any;
}

interface StageErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class StageErrorBoundary extends React.Component<
  StageErrorBoundaryProps,
  StageErrorBoundaryState
> {
  constructor(props: StageErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): StageErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[Sandbox Canvas Stage Error]:', error, errorInfo);
  }

  componentDidUpdate(prevProps: StageErrorBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-rose-950/90 p-8 text-rose-200 text-center font-mono select-text">
          <div className="w-12 h-12 rounded-xl bg-rose-900/80 flex items-center justify-center text-rose-300 mb-3 border border-rose-700">
            <Icons.AlertTriangle />
          </div>
          <h3 className="text-sm font-bold text-rose-300 mb-1">
            Erro de Execução no Componente
          </h3>
          <p className="text-xs max-w-lg bg-black/60 p-3 rounded-lg border border-rose-800/80 text-rose-300 overflow-x-auto text-left whitespace-pre-wrap mb-3">
            {this.state.error?.message || 'Erro desconhecido'}
          </p>
          <span className="text-[11px] text-rose-400/80">
            Edite o código TSX ou ajuste as propriedades para resolver.
          </span>
        </div>
      );
    }
    return this.props.children;
  }
}

// Mapeamento automático em tempo de build de todos os 30 arquivos .tsx nativos das categorias
const RAW_TEMPLATE_FILES = import.meta.glob(
  '../../templates/categories/**/*.tsx',
  { query: '?raw', import: 'default', eager: true }
) as Record<string, string>;

/**
 * Localiza o código-fonte .tsx bruto correspondente ao templateId
 */
function getRawTemplateSource(id: string): string {
  // 1. Verifica se é um template customizado persistido com código TSX salvo
  const customSrc = getCustomTemplateSource(id);
  if (customSrc) {
    return customSrc;
  }

  // 2. Busca entre os templates nativos do projeto
  for (const [filePath, content] of Object.entries(RAW_TEMPLATE_FILES)) {
    if (filePath.endsWith(`/${id}.tsx`)) {
      return content;
    }
  }

  // 3. Fallback para templates gerados dinamicamente
  const def = CARD_REGISTRY[id];
  if (def) {
    return generateBoilerplateFromDef(def);
  }

  return '';
}

/**
 * Gera código .tsx pronto caso o template tenha sido criado em runtime
 */
function generateBoilerplateFromDef(def: TemplateDefinition): string {
  return `import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';

export const ${def.id.replace(/[-_](\w)/g, (_, c) => c.toUpperCase())}Template: TemplateDefinition = {
  id: '${def.id}',
  name: '${def.name}',
  category: '${def.category}',
  description: '${def.description}',
  iconName: '${def.iconName}',
  defaultProps: ${JSON.stringify(def.defaultProps, null, 2)},
  schema: ${JSON.stringify(def.schema, null, 2)},
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame, fps });
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-12 text-center select-none">
        <h1
          className="text-6xl font-black text-white tracking-tight"
          style={{ transform: \`scale(\${s})\`, opacity: s }}
        >
          {props.title || 'Título do Card'}
        </h1>
        {props.subtitle && (
          <p className="text-2xl text-slate-300 mt-4 max-w-2xl font-normal">
            {props.subtitle}
          </p>
        )}
      </div>
    );
  },
};

export default ${def.id.replace(/[-_](\w)/g, (_, c) => c.toUpperCase())}Template;
`;
}

/**
 * Detecta a duração recomendada em frames para um template com base na sua definição ou código TSX.
 */
function detectAnimationDurationInFrames(
  code: string,
  def?: TemplateDefinition | null
): { detectedFrames: number; reason?: string } {
  // 1. Se a definição explicitamente define defaultDurationInFrames ou minDurationInFrames
  if (def?.defaultDurationInFrames && def.defaultDurationInFrames > 0) {
    return {
      detectedFrames: def.defaultDurationInFrames,
      reason: `Definido no template (${def.defaultDurationInFrames}f = ${(def.defaultDurationInFrames / 30).toFixed(1)}s)`,
    };
  }
  if (def?.minDurationInFrames && def.minDurationInFrames > 0) {
    return {
      detectedFrames: def.minDurationInFrames,
      reason: `Mínimo exigido (${def.minDurationInFrames}f = ${(def.minDurationInFrames / 30).toFixed(1)}s)`,
    };
  }

  if (!code) return { detectedFrames: 90 };

  // 2. Busca por padrão explícito no código (ex: defaultDurationInFrames: 300)
  const durationMatch = code.match(/defaultDurationInFrames\s*:\s*(\d+)/);
  if (durationMatch) {
    const f = parseInt(durationMatch[1], 10);
    if (f > 0) return { detectedFrames: f, reason: `defaultDurationInFrames: ${f}f` };
  }

  // 3. Busca por cálculos temporais baseados em fps (ex: (frame / (fps * 10)) ou fps * 10)
  const fpsMultMatch = code.match(/fps\s*\*\s*(\d+(?:\.\d+)?)/i);
  if (fpsMultMatch) {
    const sec = parseFloat(fpsMultMatch[1]);
    if (sec > 0) {
      const f = Math.round(sec * 30);
      return { detectedFrames: f, reason: `Cálculo de régua temporal em ${sec}s (${f}f)` };
    }
  }

  // 4. Busca por frames de início tardios em máquinas de escrever ou molas
  let maxFrameFound = 0;
  const startFrameMatches = Array.from(code.matchAll(/(?:startFrame|frame\s*-\s*)(\d+)/gi));
  for (const m of startFrameMatches) {
    const f = parseInt(m[1], 10);
    if (f > maxFrameFound) maxFrameFound = f;
  }
  const typeCharMatches = Array.from(code.matchAll(/typeChar\([^,]+,\s*(\d+)/gi));
  for (const m of typeCharMatches) {
    const f = parseInt(m[1], 10);
    if (f > maxFrameFound) maxFrameFound = f;
  }

  if (maxFrameFound >= 60) {
    const estimatedFrames = Math.max(180, Math.ceil((maxFrameFound + 120) / 30) * 30);
    return {
      detectedFrames: Math.min(600, estimatedFrames),
      reason: `Animações tardias detectadas no frame ${maxFrameFound}`,
    };
  }

  return { detectedFrames: 90 };
}

export interface TemplateSandboxProps {
  onBackToStudio?: () => void;
}

export const TemplateSandbox: React.FC<TemplateSandboxProps> = ({ onBackToStudio }) => {
  const [templateListVersion, setTemplateListVersion] = useState<number>(0);

  const allTemplates = useMemo(() => {
    return Object.values(CARD_REGISTRY);
  }, [templateListVersion]);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    allTemplates[0]?.id || 'hero-title'
  );

  const activeTemplate = useMemo(() => {
    return CARD_REGISTRY[selectedTemplateId] || allTemplates[0];
  }, [selectedTemplateId, allTemplates]);

  // Aba ativa: 'code' (Código TSX) é o padrão prioritário
  const [activeTab, setActiveTab] = useState<'code' | 'form' | 'json' | 'schema'>('code');

  // Estado do Código TSX
  const [tsxCode, setTsxCode] = useState<string>('');
  const [tsxCompileError, setTsxCompileError] = useState<string | null>(null);
  const [isCompiledCustom, setIsCompiledCustom] = useState<boolean>(false);
  const [compiledTemplate, setCompiledTemplate] = useState<TemplateDefinition | null>(null);

  // Props editáveis do card
  const [currentProps, setCurrentProps] = useState<Record<string, any>>({
    ...(activeTemplate?.defaultProps || {}),
  });

  // Editor JSON de Props
  const [jsonText, setJsonText] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Controle de frames e reprodução local
  const [localFrame, setLocalFrame] = useState<number>(15);
  const [maxFrames, setMaxFrames] = useState<number>(() => {
    return activeTemplate?.defaultDurationInFrames || 90;
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Viewport e escala proporcional
  const [selectedPreset, setSelectedPreset] = useState<ResolutionPreset>(
    DEFAULT_RESOLUTION_PRESET
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(0.4);

  // Carrega código .tsx ao alternar de template
  useEffect(() => {
    if (activeTemplate) {
      const code = getRawTemplateSource(activeTemplate.id);
      setTsxCode(code);
      setTsxCompileError(null);
      setIsCompiledCustom(false);
      setCompiledTemplate(null);

      const initialProps = { ...(activeTemplate.defaultProps || {}) };
      setCurrentProps(initialProps);
      setJsonText(JSON.stringify(initialProps, null, 2));
      setJsonError(null);
      setLocalFrame(15);

      const { detectedFrames } = detectAnimationDurationInFrames(code, activeTemplate);
      if (detectedFrames > 0) {
        setMaxFrames(detectedFrames);
      }
    }
  }, [activeTemplate?.id]);

  // Garante que o frame local não exceda o limite máximo quando a duração for reduzida
  useEffect(() => {
    if (localFrame >= maxFrames) {
      setLocalFrame(Math.max(0, maxFrames - 1));
    }
  }, [maxFrames, localFrame]);

  // Escala proporcional não-destrutiva baseada no preset canônico
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateScale = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w === 0 || h === 0) return;

      const calculatedScale = calculateCanonicalScale(
        w,
        h,
        selectedPreset.canonicalWidth,
        selectedPreset.canonicalHeight,
        24,
        0.95
      );
      setScale(calculatedScale);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    window.addEventListener('resize', updateScale);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, [selectedPreset.canonicalWidth, selectedPreset.canonicalHeight]);

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

  // Executa compilação do código TSX em tempo real
  const handleCompileCode = useCallback(
    (codeToCompile: string, notifySuccess = false) => {
      if (!codeToCompile.trim()) return;

      const result = compileTsxTemplate(codeToCompile);
      if (result.error) {
        setTsxCompileError(result.error);
      } else if (result.template) {
        setTsxCompileError(null);
        setCompiledTemplate(result.template);
        setIsCompiledCustom(true);

        // Sincroniza props e JSON se o schema ou defaultProps mudaram
        if (result.template.defaultProps) {
          setCurrentProps((prev) => ({
            ...result.template!.defaultProps,
            ...prev,
          }));
          setJsonText(
            JSON.stringify(
              { ...result.template.defaultProps, ...currentProps },
              null,
              2
            )
          );
        }

        // Sincroniza duração de frames se detectada na animação
        const { detectedFrames, reason } = detectAnimationDurationInFrames(
          codeToCompile,
          result.template
        );
        if (detectedFrames && detectedFrames > 0) {
          setMaxFrames(detectedFrames);
        }

        if (notifySuccess) {
          const durMsg =
            detectedFrames && detectedFrames >= 180
              ? ` Duração sincronizada para ${detectedFrames} frames (${(detectedFrames / 30).toFixed(1)}s): ${reason}`
              : '';
          showToast(`Código TSX compilado e aplicado ao vivo no preview!${durMsg}`);
        }
      }
    },
    [currentProps]
  );

  // Auto-compilação inteligente com debounce ao digitar código
  const debounceTimerRef = useRef<number | null>(null);
  const handleCodeChange = (newCode: string) => {
    setTsxCode(newCode);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
      handleCompileCode(newCode, false);
    }, 400);
  };

  // Sincronização reativa com eventos de criação/exclusão de templates
  useEffect(() => {
    const handleTemplatesUpdated = () => {
      setTemplateListVersion((v) => v + 1);
    };
    window.addEventListener('crom:templates-updated', handleTemplatesUpdated);
    return () => window.removeEventListener('crom:templates-updated', handleTemplatesUpdated);
  }, []);

  // Salvar no Registry Local e persistir no localStorage
  const handleSaveToRegistry = () => {
    const result = compileTsxTemplate(tsxCode);
    if (result.error) {
      setTsxCompileError(result.error);
      alert(`Não foi possível salvar devido a erro no código:\n${result.error}`);
      return;
    }

    if (result.template) {
      saveCustomTemplate(result.template, tsxCode);
      setTemplateListVersion((v) => v + 1);
      setSelectedTemplateId(result.template.id);
      showToast(
        `Template "${result.template.name}" [${result.template.id}] salvo no catálogo com sucesso!`
      );
    }
  };

  // Salvar como Novo Template (Fork) persistente
  const handleForkNewTemplate = () => {
    const customId = `custom-${Date.now().toString().slice(-4)}`;
    const customName = `${activeTemplate?.name || 'Template'} Customizado`;

    // Atualiza o ID, nome e categoria no código TSX
    let updatedCode = tsxCode
      .replace(/id:\s*['"][^'"]+['"]/, `id: '${customId}'`)
      .replace(/name:\s*['"][^'"]+['"]/, `name: '${customName}'`)
      .replace(/category:\s*['"][^'"]+['"]/, `category: 'Customizados'`);

    const result = compileTsxTemplate(updatedCode);
    if (result.error) {
      setTsxCompileError(result.error);
      showToast(`Erro ao criar template: ${result.error}`);
      return;
    }

    if (result.template) {
      saveCustomTemplate(result.template, updatedCode);
      setTemplateListVersion((v) => v + 1);
      setSelectedTemplateId(result.template.id);
      setTsxCode(updatedCode);
      showToast(`Novo template criado e salvo no catálogo: "${customName}" [${customId}]`);
    } else {
      showToast('Erro ao criar template. Verifique a sintaxe.');
    }
  };

  // Baixar Arquivo .tsx
  const handleDownloadTsx = () => {
    const filename = `${compiledTemplate?.id || activeTemplate?.id || 'template'}.tsx`;
    const blob = new Blob([tsxCode], { type: 'text/typescript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Arquivo ${filename} baixado com sucesso!`);
  };

  // Restaurar Código Original
  const handleRestoreOriginalCode = () => {
    if (!activeTemplate) return;
    const original = getRawTemplateSource(activeTemplate.id);
    setTsxCode(original);
    setTsxCompileError(null);
    setIsCompiledCustom(false);
    setCompiledTemplate(null);
    handleCompileCode(original, false);
    showToast('Código original do template restaurado.');
  };

  // Atualizações de props individuais
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Determina qual componente React renderizar
  const effectiveTemplate = compiledTemplate || activeTemplate;
  const ComponentToRender = effectiveTemplate?.Component;
  const IconComp = activeTemplate
    ? TemplateIconMap[activeTemplate.iconName] || Icons.Film
    : Icons.Film;

  // Normaliza props garantindo que objetos de mídia possam ser usados tanto como objeto quanto como string
  const safeProps = useMemo(() => {
    const res: Record<string, any> = { ...currentProps };
    for (const [k, v] of Object.entries(res)) {
      if (v && typeof v === 'object' && 'url' in v) {
        if (!v.toString || v.toString() === '[object Object]') {
          Object.defineProperty(v, 'toString', {
            value: () => v.url || '',
            configurable: true,
            enumerable: false,
          });
        }
        if (!v.valueOf || v.valueOf() === '[object Object]') {
          Object.defineProperty(v, 'valueOf', {
            value: () => v.url || '',
            configurable: true,
            enumerable: false,
          });
        }
      }
    }
    return res;
  }, [currentProps]);

  return (
    <div className="flex flex-col flex-1 max-w-[1700px] w-full mx-auto p-3 sm:p-6 gap-4 sm:gap-6">
      {/* Top Bar com Seletor e Ações */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
            <IconComp />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                Template Sandbox & Code Lab
              </h2>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono font-medium">
                {activeTemplate?.category || 'Geral'}
              </span>
              {isCompiledCustom && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Code Ativo
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 truncate">
              {activeTemplate?.description || 'Edite o código TSX diretamente para criar templates exclusivos.'}
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
            onClick={handleForkNewTemplate}
            className="px-2.5 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-semibold transition flex items-center gap-1.5"
            title="Criar Novo Template Baseado no Código Atual"
          >
            <Icons.Plus />
            <span className="hidden sm:inline">Criar Novo</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadTsx}
            className="px-2.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
            title="Baixar arquivo .tsx deste template"
          >
            <Icons.Download />
            <span className="hidden sm:inline">Baixar .tsx</span>
          </button>

          {isCustomTemplate(activeTemplate?.id) && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Deseja realmente excluir o template customizado "${activeTemplate.name}"?`)) {
                  deleteCustomTemplate(activeTemplate.id);
                  const remaining = Object.values(CARD_REGISTRY).filter((t) => t.id !== activeTemplate.id);
                  setSelectedTemplateId(remaining[0]?.id || 'hero-title');
                  showToast(`Template "${activeTemplate.name}" excluído.`);
                }
              }}
              className="px-2.5 py-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-semibold transition flex items-center gap-1.5"
              title="Excluir este template customizado"
            >
              <Icons.Trash />
              <span className="hidden sm:inline">Excluir</span>
            </button>
          )}

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

      {/* Notificação Toast */}
      {toastMessage && (
        <div className="bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-xs font-medium px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in duration-150">
          <Icons.Check />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Grid Principal: Esquerda (Preview) | Direita (Abas de Código e Edição) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start flex-1">
        {/* Coluna Esquerda: Preview Isolado */}
        <div className="lg:col-span-6 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Header do Preview */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-slate-800 bg-slate-950/90 text-slate-300 text-xs gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse shrink-0" />
              <span className="font-bold text-white uppercase tracking-wider truncate">
                Preview Canônico
              </span>
              <span className="bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0">
                {selectedPreset.width} × {selectedPreset.height}
              </span>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <select
                value={selectedPreset.id}
                onChange={(e) => {
                  const found = RESOLUTION_PRESETS.find((p) => p.id === e.target.value);
                  if (found) setSelectedPreset(found);
                }}
                className="bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                title="Resolução / Formato de Exibição"
              >
                {RESOLUTION_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label} ({p.width} × {p.height})
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1.5 font-mono text-xs text-indigo-400 shrink-0">
                <span>{localFrame}f</span>
                <span>•</span>
                <span>{(localFrame / 30).toFixed(2)}s</span>
                <span className="text-slate-500">/</span>
                <span className="text-slate-400 font-medium">{(maxFrames / 30).toFixed(1)}s</span>
              </div>
            </div>
          </div>

          {/* Viewport Canônico com Escala Proporcional */}
          <div
            ref={containerRef}
            className="w-full bg-black flex items-center justify-center p-4 relative min-h-[300px] sm:min-h-[440px] md:min-h-[500px] max-h-[560px] overflow-hidden select-none"
          >
            <div
              id="sandbox-canvas-stage"
              style={{
                width: `${selectedPreset.canonicalWidth}px`,
                height: `${selectedPreset.canonicalHeight}px`,
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
              <StageErrorBoundary resetKey={`${selectedTemplateId}_${localFrame}`}>
                {ComponentToRender && (
                  <ComponentToRender props={safeProps} frame={localFrame} fps={30} />
                )}
              </StageErrorBoundary>
            </div>
          </div>

          {/* Controles de Transporte e Scrubbing Local */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col gap-3">
            <div className="relative w-full">
              <input
                type="range"
                min={0}
                max={Math.max(0, maxFrames - 1)}
                value={Math.min(localFrame, maxFrames - 1)}
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

              <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-medium">Duração:</span>
                  <select
                    value={maxFrames}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (val > 0) setMaxFrames(val);
                    }}
                    className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 font-mono text-xs cursor-pointer focus:border-indigo-500 focus:outline-none"
                    title="Selecione a duração total de reprodução"
                  >
                    {[60, 90, 120, 150, 180, 240, 300, 360, 450, 600].map((f) => (
                      <option key={f} value={f}>
                        {f} frames ({(f / 30).toFixed(1)}s)
                      </option>
                    ))}
                    {![60, 90, 120, 150, 180, 240, 300, 360, 450, 600].includes(maxFrames) && (
                      <option value={maxFrames}>
                        {maxFrames} frames ({(maxFrames / 30).toFixed(1)}s) [Custom]
                      </option>
                    )}
                  </select>
                </div>

                {/* Input Numérico Customizado Direto */}
                <div
                  className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-0.5"
                  title="Defina o número exato de frames manualmente"
                >
                  <input
                    type="number"
                    min={15}
                    max={1800}
                    step={15}
                    value={maxFrames}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val > 0) {
                        setMaxFrames(Math.min(1800, Math.max(15, val)));
                      }
                    }}
                    className="w-12 bg-transparent text-white font-mono text-xs text-right focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 font-mono">f</span>
                </div>

                {/* Badge de Animação Longa Detectada */}
                {maxFrames >= 240 && (
                  <span
                    className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30"
                    title="Duração ampliada para acomodar animações ricas e completas"
                  >
                    <span>⚡ Completo ({(maxFrames / 30).toFixed(1)}s)</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Editor de Código TSX / Formulário / JSON / Schema */}
        <div className="lg:col-span-6 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl h-[580px] md:h-[660px] overflow-hidden">
          {/* Header com Abas */}
          <div className="flex items-center border-b border-slate-800 bg-slate-950/90 px-3 pt-2 gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition border-t-2 flex items-center gap-2 ${
                activeTab === 'code'
                  ? 'bg-slate-900 text-indigo-400 border-indigo-500'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              <Icons.Code />
              <span>Código TSX (.tsx)</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded font-mono">
                Live
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className={`px-3 py-2 text-xs font-bold rounded-t-xl transition border-t-2 ${
                activeTab === 'form'
                  ? 'bg-slate-900 text-indigo-400 border-indigo-500'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              Props do Card
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
              JSON
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
              Schema
            </button>
          </div>

          {/* ABA 1: EDITOR DE CÓDIGO TSX (.tsx) COM COMPILADOR AO VIVO */}
          {activeTab === 'code' && (
            <div className="flex flex-col flex-1 overflow-hidden p-3 sm:p-4 space-y-2.5">
              {/* Barra de Ações do Código */}
              <div className="flex items-center justify-between gap-2 flex-wrap bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-indigo-300 font-bold">
                    {activeTemplate.id}.tsx
                  </span>
                  {tsxCompileError ? (
                    <span className="text-rose-400 font-mono text-[11px] bg-rose-950/60 border border-rose-900 px-2 py-0.5 rounded">
                      Erro de Sintaxe
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-mono text-[11px] bg-emerald-950/60 border border-emerald-900 px-2 py-0.5 rounded flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Pronto para Execução
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 ml-auto">
                  <button
                    type="button"
                    onClick={() => handleCompileCode(tsxCode, true)}
                    className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs shadow transition flex items-center gap-1.5"
                    title="Forçar Recompilação Imediata"
                  >
                    <Icons.Sparkles />
                    <span>Compilar</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveToRegistry}
                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow transition flex items-center gap-1.5"
                    title="Salvar alterações no Registry Local para usar no Estúdio"
                  >
                    <Icons.Check />
                    <span>Salvar no Catálogo</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRestoreOriginalCode}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition"
                    title="Restaurar código original do arquivo"
                  >
                    Restaurar
                  </button>

                  {isCustomTemplate(activeTemplate?.id) && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Deseja realmente excluir o template customizado "${activeTemplate.name}"?`)) {
                          deleteCustomTemplate(activeTemplate.id);
                          const remaining = Object.values(CARD_REGISTRY).filter((t) => t.id !== activeTemplate.id);
                          setSelectedTemplateId(remaining[0]?.id || 'hero-title');
                          showToast(`Template "${activeTemplate.name}" excluído.`);
                        }
                      }}
                      className="px-2.5 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                      title="Excluir este template customizado"
                    >
                      <Icons.Trash />
                      <span>Excluir</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Banner de Erro de Compilação */}
              {tsxCompileError && (
                <div className="p-3 bg-rose-950/90 border border-rose-500/80 rounded-xl text-rose-200 text-xs font-mono leading-relaxed overflow-x-auto">
                  <strong className="block text-rose-300 font-bold mb-1">
                    Erro de Compilação TSX:
                  </strong>
                  {tsxCompileError}
                </div>
              )}

              {/* Área de Edição de Código com Fonte Monospaçada */}
              <div className="flex-1 relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                <textarea
                  value={tsxCode}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  className="w-full h-full p-3.5 bg-transparent text-slate-200 font-mono text-xs leading-relaxed focus:outline-none resize-none selection:bg-indigo-600 selection:text-white"
                  spellCheck={false}
                  placeholder="// Cole ou edite o código TSX do seu template aqui..."
                />
              </div>

              <div className="text-[11px] text-slate-500 flex items-center justify-between px-1">
                <span>
                  Dica: Você tem acesso nativo a <code className="text-indigo-400">React</code>,{' '}
                  <code className="text-indigo-400">MediaRenderer</code>,{' '}
                  <code className="text-indigo-400">spring</code>,{' '}
                  <code className="text-indigo-400">interpolate</code>,{' '}
                  <code className="text-indigo-400">Icons</code> e Tailwind CSS.
                </span>
                <span>{tsxCode.split('\n').length} linhas</span>
              </div>
            </div>
          )}

          {/* ABA 2: Formulário Dinâmico de Props */}
          {activeTab === 'form' && (
            <div className="p-4 flex-1 overflow-y-auto space-y-3.5">
              {effectiveTemplate?.schema?.map((field) => {
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
                          className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-indigo-300 transition"
                          title="Preencher com Lorem Ipsum"
                        >
                          Lorem
                        </button>
                      </div>
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
                          className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-indigo-300 transition"
                          title="Preencher com Lorem Ipsum"
                        >
                          Lorem
                        </button>
                      )}
                    </div>
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

          {/* ABA 3: Editor JSON */}
          {activeTab === 'json' && (
            <div className="flex flex-col flex-1 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Edição direta dos valores das propriedades do template:</span>
                {jsonError && (
                  <span className="text-rose-400 font-mono font-bold">{jsonError}</span>
                )}
              </div>
              <textarea
                value={jsonText}
                onChange={(e) => handleJsonChange(e.target.value)}
                className={`w-full flex-1 bg-slate-950 border rounded-xl p-3 text-xs font-mono text-indigo-300 focus:outline-none leading-relaxed ${
                  jsonError ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                }`}
                spellCheck={false}
              />
            </div>
          )}

          {/* ABA 4: Schema */}
          {activeTab === 'schema' && (
            <div className="p-4 flex-1 overflow-y-auto space-y-3">
              <div className="text-xs text-slate-400 mb-2">
                Especificação de schema e tipos aceitos por este template:
              </div>
              {effectiveTemplate?.schema?.map((f, idx) => (
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
  );
};

export default TemplateSandbox;
