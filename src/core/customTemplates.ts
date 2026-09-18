import React from 'react';
import { transform } from 'sucrase';
import type { TemplateDefinition, FieldDefinition, TemplateCategory } from './types';
import { CARD_REGISTRY, registerTemplate, getAllTemplates } from '../templates/registry';
import { spring, interpolate } from './animations';
import { Icons, TemplateIconMap } from './icons';
import { MediaRenderer } from '../remotion/MediaRenderer';

export interface StoredCustomTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  iconName: string;
  defaultDurationInFrames?: number;
  minDurationInFrames?: number;
  defaultProps: Record<string, any>;
  schema: FieldDefinition[];
  tsxCode: string;
  updatedAt: number;
}

const STORAGE_KEY = 'crom_custom_templates_v1';

// Safe non-enumerable fallback polyfills on Object.prototype to prevent arbitrary custom templates calling .endsWith, .startsWith, .includes, .toLowerCase, etc. on non-strings from throwing TypeError
try {
  const safeStringDelegates = ['endsWith', 'startsWith', 'includes', 'toLowerCase', 'toUpperCase'];
  for (const m of safeStringDelegates) {
    if (typeof (Object.prototype as any)[m] !== 'function') {
      Object.defineProperty(Object.prototype, m, {
        value: function (...args: any[]) {
          const target =
            this && typeof this.url === 'string'
              ? this.url
              : this && typeof this.src === 'string'
              ? this.src
              : this && typeof this.toString === 'function' && this.toString() !== '[object Object]'
              ? this.toString()
              : '';
          return typeof (String.prototype as any)[m] === 'function'
            ? (String.prototype as any)[m].apply(target, args)
            : false;
        },
        configurable: true,
        enumerable: false,
        writable: true,
      });
    }
  }
} catch (e) {
  console.warn('Fallback string methods setup error:', e);
}

/**
 * Converte um objeto de mídia em um objeto totalmente interoperável com métodos de string.
 */
export function makeStringCompatibleObject(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;

  const urlStr =
    typeof obj.url === 'string'
      ? obj.url
      : typeof obj.src === 'string'
      ? obj.src
      : '';

  const stringMethods = [
    'endsWith',
    'startsWith',
    'includes',
    'indexOf',
    'lastIndexOf',
    'toLowerCase',
    'toUpperCase',
    'trim',
    'slice',
    'substring',
    'substr',
    'split',
    'replace',
    'replaceAll',
    'match',
    'search',
    'charAt',
    'charCodeAt',
    'concat',
  ];

  for (const method of stringMethods) {
    if (typeof (String.prototype as any)[method] === 'function' && typeof obj[method] !== 'function') {
      try {
        Object.defineProperty(obj, method, {
          value: function (...args: any[]) {
            const target =
              typeof this.url === 'string'
                ? this.url
                : typeof this.src === 'string'
                ? this.src
                : urlStr;
            return (String.prototype as any)[method].apply(target, args);
          },
          configurable: true,
          enumerable: false,
          writable: true,
        });
      } catch {}
    }
  }

  try {
    Object.defineProperty(obj, 'toString', {
      value: function () {
        return typeof this.url === 'string' ? this.url : typeof this.src === 'string' ? this.src : urlStr;
      },
      configurable: true,
      enumerable: false,
      writable: true,
    });
    Object.defineProperty(obj, 'valueOf', {
      value: function () {
        return typeof this.url === 'string' ? this.url : typeof this.src === 'string' ? this.src : urlStr;
      },
      configurable: true,
      enumerable: false,
      writable: true,
    });
    if (typeof Symbol !== 'undefined' && Symbol.toPrimitive) {
      Object.defineProperty(obj, Symbol.toPrimitive, {
        value: function () {
          return typeof this.url === 'string' ? this.url : typeof this.src === 'string' ? this.src : urlStr;
        },
        configurable: true,
        enumerable: false,
        writable: true,
      });
    }
    if (!('length' in obj)) {
      Object.defineProperty(obj, 'length', {
        get: function () {
          const s = typeof this.url === 'string' ? this.url : typeof this.src === 'string' ? this.src : urlStr;
          return s.length;
        },
        configurable: true,
        enumerable: false,
      });
    }
  } catch {}

  return obj;
}

/**
 * Percorre recursivamente todas as propriedades de um objeto de props para garantir que
 * qualquer objeto que represente mídia ou array de itens funcione tanto como objeto quanto como string.
 */
export function deeplySanitizeMediaProps(val: any): any {
  if (!val) return val;
  if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
    return val;
  }
  if (Array.isArray(val)) {
    return val.map((item) => deeplySanitizeMediaProps(item));
  }
  if (typeof val === 'object') {
    makeStringCompatibleObject(val);
    for (const [k, v] of Object.entries(val)) {
      val[k] = deeplySanitizeMediaProps(v);
    }
    return val;
  }
  return val;
}

/**
 * Compila e avalia código TSX dinamicamente em runtime no navegador via Sucrase.
 */
export function compileTsxTemplate(tsxCode: string): {
  template?: TemplateDefinition;
  error?: string;
} {
  try {
    const compiled = transform(tsxCode, {
      transforms: ['typescript', 'jsx', 'imports'],
      jsxRuntime: 'classic',
    }).code;

    const exportsObj: Record<string, any> = {};
    const moduleObj = { exports: exportsObj };

    // Proxy inteligente de React para interoperabilidade transparente de mídia
    const SmartReact = {
      ...React,
      createElement: (type: any, props: any, ...children: any[]) => {
        // Se o template usou <video src={...} /> mas passou uma imagem (como no caso do usuário)
        if (type === 'video' && props?.src) {
          const rawSrc = props.src;
          const srcStr =
            typeof rawSrc === 'string'
              ? rawSrc
              : typeof rawSrc?.url === 'string'
              ? rawSrc.url
              : typeof rawSrc?.toString === 'function' && rawSrc.toString() !== '[object Object]'
              ? rawSrc.toString()
              : '';

          const nameOrSrc = ((rawSrc?.name || '') + ' ' + srcStr).toLowerCase();
          const isImage =
            rawSrc?.type === 'image' ||
            /\.(png|jpe?g|webp|gif|svg|avif|bmp|ico)(\?|$)/i.test(nameOrSrc) ||
            srcStr.startsWith('data:image/');

          if (isImage && srcStr) {
            const { autoPlay, loop, muted, playsInline, ...cleanProps } = props;
            return React.createElement(
              'img',
              {
                ...cleanProps,
                src: srcStr,
                alt: props.alt || rawSrc?.name || 'Mídia',
              },
              ...children
            );
          }
        }

        // Se o template usou <img src={...} /> mas passou um vídeo
        if (type === 'img' && props?.src) {
          const rawSrc = props.src;
          const srcStr =
            typeof rawSrc === 'string'
              ? rawSrc
              : typeof rawSrc?.url === 'string'
              ? rawSrc.url
              : typeof rawSrc?.toString === 'function' && rawSrc.toString() !== '[object Object]'
              ? rawSrc.toString()
              : '';

          const nameOrSrc = ((rawSrc?.name || '') + ' ' + srcStr).toLowerCase();
          const isVideo =
            rawSrc?.type === 'video' ||
            /\.(mp4|webm|mov|m4v|ogg|mkv)(\?|$)/i.test(nameOrSrc) ||
            srcStr.startsWith('data:video/');

          if (isVideo && srcStr) {
            return React.createElement(
              'video',
              {
                ...props,
                src: srcStr,
                autoPlay: true,
                loop: true,
                muted: true,
                playsInline: true,
              },
              ...children
            );
          }
        }

        return React.createElement(type, props, ...children);
      },
    };

    const customRequire = (name: string) => {
      const lower = name.toLowerCase();
      if (name === 'react' || name.endsWith('/react')) {
        return SmartReact;
      }
      if (lower.includes('animations')) {
        return { spring, interpolate };
      }
      if (lower.includes('icons')) {
        return { Icons, TemplateIconMap };
      }
      if (
        lower.includes('mediarenderer') ||
        lower.includes('media') ||
        lower.includes('remotion')
      ) {
        return {
          MediaRenderer,
          default: MediaRenderer,
        };
      }
      if (lower.includes('types')) {
        return {};
      }
      return {
        MediaRenderer,
        spring,
        interpolate,
        Icons,
        TemplateIconMap,
        default: MediaRenderer,
      };
    };

    const fn = new Function(
      'require',
      'exports',
      'module',
      'React',
      'MediaRenderer',
      'spring',
      'interpolate',
      'Icons',
      compiled
    );
    fn(
      customRequire,
      exportsObj,
      moduleObj,
      SmartReact,
      MediaRenderer,
      spring,
      interpolate,
      Icons
    );

    const found =
      exportsObj.default ||
      Object.values(exportsObj).find(
        (v) => v && typeof v === 'object' && typeof v.Component === 'function'
      );

    if (!found || typeof found.Component !== 'function') {
      return {
        error: 'O código deve exportar um TemplateDefinition com uma função "Component".',
      };
    }

    // Envolve o componente com sanitizador transparente de props e mídia
    const rawComponent = found.Component;
    found.Component = (renderProps: any) => {
      const sanitized = deeplySanitizeMediaProps(renderProps?.props ? { ...renderProps.props } : {});
      return rawComponent({
        ...renderProps,
        props: sanitized,
      });
    };

    return { template: found as TemplateDefinition };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Retorna todos os templates customizados persistidos no localStorage.
 */
export function getStoredCustomTemplates(): Record<string, StoredCustomTemplate> {
  if (typeof window === 'undefined' || !window.localStorage) return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Erro ao ler custom templates do localStorage:', e);
    return {};
  }
}

/**
 * Salva e registra um template customizado tanto em memória quanto no localStorage.
 * Dispara evento global 'crom:templates-updated' para sincronizar catálogo, sandbox e estúdio.
 */
export function saveCustomTemplate(template: TemplateDefinition, tsxCode: string): void {
  // 1. Registra no mapa global de templates em memória
  registerTemplate(template);

  // 2. Persiste no localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = getStoredCustomTemplates();
      stored[template.id] = {
        id: template.id,
        name: template.name,
        category: template.category,
        description: template.description,
        iconName: template.iconName,
        defaultDurationInFrames: template.defaultDurationInFrames,
        minDurationInFrames: template.minDurationInFrames,
        defaultProps: template.defaultProps,
        schema: template.schema,
        tsxCode,
        updatedAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch (e) {
      console.error('Erro ao salvar template customizado no localStorage:', e);
    }
  }

  // 3. Notifica componentes ouvintes (Catálogo, Sandbox, Estúdio)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('crom:templates-updated', { detail: { id: template.id } })
    );
  }
}

/**
 * Remove um template customizado do registro e do localStorage.
 */
export function deleteCustomTemplate(id: string): void {
  delete CARD_REGISTRY[id];
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = getStoredCustomTemplates();
      delete stored[id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch (e) {
      console.error('Erro ao remover template customizado do localStorage:', e);
    }
    window.dispatchEvent(
      new CustomEvent('crom:templates-updated', { detail: { id, deleted: true } })
    );
  }
}

/**
 * Recupera o código TSX de um template customizado salvo.
 */
export function getCustomTemplateSource(id: string): string | null {
  const stored = getStoredCustomTemplates();
  return stored[id]?.tsxCode || null;
}

/**
 * Identifica se um template específico foi customizado/criado pelo usuário.
 */
export function isCustomTemplate(id: string): boolean {
  if (id.startsWith('custom-')) return true;
  const stored = getStoredCustomTemplates();
  return Boolean(stored[id]);
}

/**
 * Inicializa e compila todos os templates customizados salvos no localStorage no boot da aplicação.
 */
export function initCustomTemplatesFromStorage(): void {
  const stored = getStoredCustomTemplates();
  let count = 0;
  for (const item of Object.values(stored)) {
    if (item.tsxCode) {
      const result = compileTsxTemplate(item.tsxCode);
      if (result.template) {
        if (item.defaultProps) {
          result.template.defaultProps = {
            ...result.template.defaultProps,
            ...item.defaultProps,
          };
        }
        if (item.name) result.template.name = item.name;
        if (item.category) result.template.category = item.category as TemplateCategory;
        if (item.description) result.template.description = item.description;
        registerTemplate(result.template);
        count++;
      }
    }
  }
  if (count > 0) {
    console.log(`[Crom EasyVideo] ${count} template(s) customizado(s) restaurado(s) do localStorage.`);
  }
}
