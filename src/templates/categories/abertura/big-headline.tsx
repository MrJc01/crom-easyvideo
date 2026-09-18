import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';

export const bigHeadlineTemplate: TemplateDefinition = {
  id: 'big-headline',
  name: 'Headline Impactante',
  category: 'Abertura & Título',
  description: 'Frase de alto impacto com tipografia superdimensionada e barra decorativa.',
  iconName: 'hero',
  defaultProps: {
    showKicker: true,
    kicker: 'MUDANÇA DE PARADIGMA',
    headline: 'O Fim da Busca Tradicional',
    accent: '#ec4899',
    showAccentBar: true,
  },
  schema: [
    { name: 'showKicker', label: 'Exibir Chamada Curta', type: 'toggle', defaultValue: true },
    { name: 'kicker', label: 'Chamada Curta', type: 'text', defaultValue: 'MUDANÇA DE PARADIGMA' },
    { name: 'headline', label: 'Manchete Principal', type: 'text', defaultValue: 'O Fim da Busca Tradicional' },
    { name: 'showAccentBar', label: 'Exibir Barra de Destaque', type: 'toggle', defaultValue: true },
    { name: 'accent', label: 'Cor de Destaque', type: 'color', defaultValue: '#ec4899' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 4, fps });
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-start p-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        {props.showKicker && (
          <span
            className="text-sm font-mono tracking-widest text-pink-400 uppercase font-semibold mb-4"
            style={{ opacity: s }}
          >
            // {props.kicker}
          </span>
        )}
        <h1
          className="text-7xl font-black text-white tracking-tighter uppercase leading-none max-w-4xl"
          style={{ transform: `scale(${s})`, opacity: s }}
        >
          {props.headline}
        </h1>
        {props.showAccentBar && (
          <div
            className="h-2 rounded-full mt-8"
            style={{ width: `${s * 240}px`, backgroundColor: props.accent }}
          />
        )}
      </div>
    );
  },
};

export default bigHeadlineTemplate;
