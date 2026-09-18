import React from 'react';
import type { TemplateDefinition, TemplateRenderProps } from '../../../core/types';
import { spring } from '../../../core/animations';
import { MediaRenderer } from '../../../remotion/MediaRenderer';

export interface BrowserFrameProps {
  url: string;
  mediaSrc: string;
  caption: string;
  accentColor: string;
}

export const BrowserFrameComponent: React.FC<TemplateRenderProps> = ({ props, frame, fps }) => {
  const p = props as BrowserFrameProps;

  const browserS = spring({
    frame,
    fps,
    config: { damping: 15, mass: 0.9, stiffness: 95 },
  });

  const captionS = spring({
    frame: Math.max(0, frame - 8),
    fps,
  });

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center p-14 select-none bg-slate-950 relative overflow-hidden"
      style={{
        background: `radial-gradient(circle at 50% 20%, ${p.accentColor}20 0%, #030712 90%)`,
      }}
    >
      {/* Janela de Navegador */}
      <div
        className="w-full max-w-5xl rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl"
        style={{
          transform: `scale(${browserS}) translateY(${(1 - browserS) * 40}px)`,
          opacity: browserS,
        }}
      >
        {/* Chrome / Top Bar */}
        <div className="flex items-center gap-4 px-4 py-3 bg-slate-950 border-b border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <div className="flex-1 max-w-lg mx-auto bg-slate-900 border border-slate-800 rounded-lg px-3 py-1 font-mono text-xs text-slate-400 text-center truncate">
            {p.url}
          </div>
        </div>

        {/* Viewport */}
        <div className="aspect-[16/9] w-full bg-black relative">
          <MediaRenderer media={p.mediaSrc} frame={frame} fps={fps} className="w-full h-full object-cover" />
        </div>
      </div>

      {p.caption && (
        <p
          className="text-slate-400 font-mono text-sm mt-6"
          style={{ transform: `translateY(${(1 - captionS) * 15}px)`, opacity: captionS }}
        >
          {p.caption}
        </p>
      )}
    </div>
  );
};

export const browserFrameTemplate: TemplateDefinition = {
  id: 'browser-frame-showcase',
  name: 'Mockup de Navegador Web',
  category: 'Mídia & Demonstração',
  iconName: 'Globe',
  description: 'Enquadra imagens ou gravações de vídeo em uma janela de browser funcional.',
  defaultProps: {
    url: 'https://app.plataforma.io/dashboard',
    mediaSrc: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80',
      objectFit: 'cover',
    },
    caption: 'Ambiente de produção com atualização semântica instantânea',
    accentColor: '#38bdf8',
  },
  schema: [
    { name: 'url', label: 'Endereço URL', type: 'text', defaultValue: 'https://app.plataforma.io' },
    { name: 'mediaSrc', label: 'Vídeo do Sistema', type: 'media', defaultValue: null },
    { name: 'caption', label: 'Legenda Inferior', type: 'text', defaultValue: 'Ambiente de produção...' },
    { name: 'accentColor', label: 'Cor de Destaque', type: 'color', defaultValue: '#38bdf8' },
  ],
  Component: BrowserFrameComponent,
};

export default browserFrameTemplate;
