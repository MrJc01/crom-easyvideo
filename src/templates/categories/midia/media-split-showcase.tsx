import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';
import { Icons } from '../../../core/icons';
import { MediaRenderer } from '../../../remotion/MediaRenderer';

export const mediaSplitShowcaseTemplate: TemplateDefinition = {
  id: 'media-split-showcase',
  name: 'Split Mídia & Explicação',
  category: 'Mídia & Demonstração',
  description:
    'Lado a lado com imagem ou vídeo com controle de corte (trim) e lista de tópicos modular.',
  iconName: 'video',
  defaultProps: {
    title: 'Demonstração Prática',
    badge: 'AO VIVO',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
      trimStart: 0,
      trimEnd: 5,
      objectFit: 'cover',
    },
    bullets: [
      'Execução em tempo real no browser',
      'Sincronização de frames com Remotion Player',
      'Suporte a vídeo cortado e imagens em alta definição',
    ],
    showBadge: true,
  },
  schema: [
    { name: 'showBadge', label: 'Exibir Badge', type: 'toggle', defaultValue: true },
    { name: 'badge', label: 'Texto do Badge', type: 'text', defaultValue: 'AO VIVO' },
    { name: 'title', label: 'Título do Destaque', type: 'text', defaultValue: 'Demonstração Prática' },
    { name: 'media', label: 'Mídia (Vídeo ou Imagem)', type: 'media', defaultValue: null },
    {
      name: 'bullets',
      label: 'Tópicos Dinâmicos',
      type: 'array',
      itemLabel: 'Tópico',
      itemDefaultValue: 'Novo tópico explicativo',
      defaultValue: ['Tópico 1', 'Tópico 2'],
    },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 2, fps });
    const bullets = Array.isArray(props.bullets) ? props.bullets : [];
    return (
      <div className="w-full h-full bg-slate-950 grid grid-cols-12 p-10 gap-8 items-center">
        <div className="col-span-6 h-full flex flex-col justify-center" style={{ opacity: s }}>
          {props.showBadge && (
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-mono font-bold uppercase w-max mb-3">
              {props.badge}
            </span>
          )}
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6 leading-tight">
            {props.title}
          </h2>
          <div className="space-y-3">
            {bullets.map((b: string, i: number) => {
              const bS = spring({ frame: frame - 8 - i * 4, fps });
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200"
                  style={{ transform: `translateX(${(1 - bS) * 20}px)`, opacity: bS }}
                >
                  <div className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <Icons.Check />
                  </div>
                  <span>{b}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="col-span-6 h-full flex items-center justify-center">
          <div className="w-full h-[360px] shadow-2xl rounded-2xl overflow-hidden border border-slate-800">
            <MediaRenderer media={props.media} frame={frame} fps={fps} />
          </div>
        </div>
      </div>
    );
  },
};

export default mediaSplitShowcaseTemplate;
