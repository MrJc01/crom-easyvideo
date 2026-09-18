import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';

export const quoteStatementTemplate: TemplateDefinition = {
  id: 'quote-statement',
  name: 'Citação de Autoridade',
  category: 'Conceitos & Explicações',
  description: 'Citação de papers célebres com autor e ano de publicação.',
  iconName: 'hero',
  defaultProps: {
    quote: '"Attention Is All You Need."',
    author: 'Vaswani et al. (Google Brain & Research)',
    year: 'NeurIPS 2017',
  },
  schema: [
    { name: 'quote', label: 'Citação', type: 'textarea', defaultValue: '"Attention Is All You Need."' },
    { name: 'author', label: 'Autor(es)', type: 'text', defaultValue: 'Vaswani et al.' },
    { name: 'year', label: 'Ano / Publicação', type: 'text', defaultValue: 'NeurIPS 2017' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 4, fps });
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-14 relative">
        <div
          className="max-w-3xl border-l-4 border-indigo-500 pl-8"
          style={{ transform: `translateX(${(1 - s) * -20}px)`, opacity: s }}
        >
          <p className="text-3xl md:text-4xl font-serif italic text-white leading-snug">{props.quote}</p>
          <div className="mt-6">
            <h4 className="text-base font-bold text-indigo-400 font-mono">{props.author}</h4>
            <span className="text-xs text-slate-500 font-mono">{props.year}</span>
          </div>
        </div>
      </div>
    );
  },
};

export default quoteStatementTemplate;
