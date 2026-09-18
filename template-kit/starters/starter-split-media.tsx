import React from 'react';
import type { TemplateDefinition, TemplateRenderProps } from '../../src/core/types';
import { spring } from '../../src/core/animations';

export interface StarterSplitMediaProps {
  badge: string;
  title: string;
  description: string;
  mediaSrc: string | { url?: string; type?: string };
  mediaCaption: string;
  accentColor: string;
  reverseLayout: boolean;
}

export const starterSplitMediaTemplate: TemplateDefinition = {
  id: 'starter-split-media',
  name: 'Split Media Showcase',
  category: 'Mídia & Demonstração',
  description: 'Layout split moderno com moldura de mídia (vídeo ou imagem) e coluna textual de apoio.',
  iconName: 'split',
  defaultProps: {
    badge: 'DEMONSTRAÇÃO AO VIVO',
    title: 'Inferência Multimodal em Tempo Real',
    description: 'Processamento simultâneo de sinais de visão computacional e linguagem natural no mesmo espaço vetorial.',
    mediaSrc: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200',
    mediaCaption: 'Figura 1.1: Fluxo de Ativação Vetorial',
    accentColor: '#38bdf8',
    reverseLayout: false,
  },
  schema: [
    { name: 'badge', label: 'Texto do Badge', type: 'text', defaultValue: 'DEMONSTRAÇÃO AO VIVO' },
    { name: 'title', label: 'Título Principal', type: 'text', defaultValue: 'Inferência Multimodal em Tempo Real' },
    { name: 'description', label: 'Descrição Detalhada', type: 'textarea', defaultValue: 'Processamento simultâneo...' },
    { name: 'mediaSrc', label: 'Fonte de Mídia (Vídeo / Imagem)', type: 'media', defaultValue: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200' },
    { name: 'mediaCaption', label: 'Legenda da Mídia', type: 'text', defaultValue: 'Figura 1.1: Fluxo de Ativação Vetorial' },
    { name: 'accentColor', label: 'Cor de Destaque', type: 'color', defaultValue: '#38bdf8' },
    { name: 'reverseLayout', label: 'Inverter Posição das Colunas', type: 'toggle', defaultValue: false },
  ],
  Component: ({ props, frame, fps }: TemplateRenderProps) => {
    const p = props as StarterSplitMediaProps;

    const colTextS = spring({ frame: frame - 2, fps, config: { damping: 16, mass: 1 } });
    const colMediaS = spring({ frame: frame - 8, fps, config: { damping: 15, mass: 1 } });

    // Extração segura de mídia compatível com string ou objeto
    const resolvedUrl = typeof p.mediaSrc === 'object' ? p.mediaSrc?.url || '' : p.mediaSrc || '';
    const isVideo =
      (typeof p.mediaSrc === 'object' && p.mediaSrc?.type === 'video') ||
      resolvedUrl.endsWith('.mp4') ||
      resolvedUrl.endsWith('.webm');

    return (
      <div className="w-full h-full flex items-center justify-between p-20 bg-slate-950 relative overflow-hidden select-none">
        {/* Glow atmosférico */}
        <div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full blur-[140px] opacity-20 pointer-events-none"
          style={{ backgroundColor: p.accentColor || '#38bdf8' }}
        />

        <div
          className={`w-full flex items-center gap-16 ${
            p.reverseLayout ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          {/* Coluna 1: Textos explicativos */}
          <div
            className="w-1/2 flex flex-col justify-center space-y-6"
            style={{
              transform: `translateX(${(1 - colTextS) * (p.reverseLayout ? 40 : -40)}px)`,
              opacity: colTextS,
            }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg border border-sky-500/30 bg-sky-950/60 text-sky-400 font-mono text-xs font-semibold uppercase tracking-wider w-fit">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              {p.badge}
            </div>

            <h1 className="text-5xl font-extrabold text-white tracking-tight leading-tight">
              {p.title}
            </h1>

            <p className="text-xl text-slate-300 font-normal leading-relaxed">
              {p.description}
            </p>
          </div>

          {/* Coluna 2: Moldura de Mídia */}
          <div
            className="w-1/2 flex flex-col items-center justify-center"
            style={{
              transform: `translateY(${(1 - colMediaS) * 40}px) scale(${0.92 + colMediaS * 0.08})`,
              opacity: colMediaS,
            }}
          >
            <div className="w-full aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl relative group">
              {isVideo ? (
                <video
                  src={resolvedUrl}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={resolvedUrl}
                  alt={p.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {p.mediaCaption && (
              <span className="mt-3 text-sm font-mono text-slate-400 tracking-wide">
                {p.mediaCaption}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  },
};

export default starterSplitMediaTemplate;
