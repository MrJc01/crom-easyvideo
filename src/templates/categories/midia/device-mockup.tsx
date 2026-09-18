import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';
import { MediaRenderer } from '../../../remotion/MediaRenderer';

export const deviceMockupTemplate: TemplateDefinition = {
  id: 'device-mockup',
  name: 'Device Mockup (App / Web)',
  category: 'Mídia & Demonstração',
  description: 'Simulador de tela de smartphone ou notebook com gravação de tela dentro.',
  iconName: 'video',
  defaultProps: {
    headline: 'Interface do Usuário',
    subtext: 'Demonstração da experiência interativa em tempo real.',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80',
      trimStart: 0,
      trimEnd: 4,
      objectFit: 'cover',
    },
  },
  schema: [
    { name: 'headline', label: 'Título do Destaque', type: 'text', defaultValue: 'Interface do Usuário' },
    { name: 'subtext', label: 'Subtexto', type: 'textarea', defaultValue: 'Demonstração...' },
    { name: 'media', label: 'Mídia da Tela', type: 'media', defaultValue: null },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 4, fps });
    return (
      <div className="w-full h-full bg-slate-950 grid grid-cols-12 p-12 gap-8 items-center">
        <div className="col-span-5" style={{ opacity: s }}>
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block mb-2">
            MOCKUP INTERATIVO
          </span>
          <h2 className="text-3xl font-extrabold text-white mb-4 leading-tight">{props.headline}</h2>
          <p className="text-sm text-slate-300 leading-relaxed">{props.subtext}</p>
        </div>
        <div className="col-span-7 flex justify-center">
          <div
            className="w-full max-w-md bg-slate-900 border-4 border-slate-700 rounded-3xl p-2 shadow-2xl aspect-[16/10] flex flex-col"
            style={{ transform: `scale(${s})`, opacity: s }}
          >
            <div className="flex items-center gap-1.5 px-3 py-1 border-b border-slate-800">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <div className="flex-1 overflow-hidden rounded-xl mt-1">
              <MediaRenderer media={props.media} frame={frame} fps={fps} />
            </div>
          </div>
        </div>
      </div>
    );
  },
};

export default deviceMockupTemplate;
