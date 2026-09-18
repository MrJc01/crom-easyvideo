import React from 'react';
import { transform } from 'sucrase';
import type { TemplateDefinition, FieldDefinition } from './types';
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
        registerTemplate(result.template);
        count++;
      }
    }
  }
  if (count > 0) {
    console.log(`[Crom EasyVideo] ${count} template(s) customizado(s) restaurado(s) do localStorage.`);
  }
}
