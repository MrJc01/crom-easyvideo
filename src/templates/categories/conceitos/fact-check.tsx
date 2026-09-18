import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';

export const factCheckTemplate: TemplateDefinition = {
  id: 'fact-check',
  name: 'Mito vs Fato',
  category: 'Conceitos & Explicações',
  description: 'Contraste direto entre mito popular e evidência científica.',
  iconName: 'chart',
  defaultProps: {
    myth: 'LLMs possuem consciência e sentimentos próprios.',
    fact: 'São funções matemáticas de predição de tokens treinadas com gradiente descendente.',
  },
  schema: [
    { name: 'myth', label: 'O Mito', type: 'textarea', defaultValue: 'LLMs possuem consciência...' },
    { name: 'fact', label: 'O Fato Técnico', type: 'textarea', defaultValue: 'São funções matemáticas...' },
  ],
  Component: ({ props, frame, fps }) => {
    const leftS = spring({ frame: frame - 4, fps });
    const rightS = spring({ frame: frame - 12, fps });
    return (
      <div className="w-full h-full bg-slate-950 grid grid-cols-2 p-12 gap-8 items-center">
        <div
          className="bg-rose-950/20 border border-rose-800/40 rounded-2xl p-8"
          style={{ opacity: leftS, transform: `scale(${leftS})` }}
        >
          <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider block mb-3">
            // MITO POPULAR
          </span>
          <p className="text-lg text-rose-200 font-medium">{props.myth}</p>
        </div>
        <div
          className="bg-emerald-950/20 border border-emerald-800/40 rounded-2xl p-8"
          style={{ opacity: rightS, transform: `scale(${rightS})` }}
        >
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider block mb-3">
            // FATO CIENTÍFICO
          </span>
          <p className="text-lg text-emerald-200 font-medium">{props.fact}</p>
        </div>
      </div>
    );
  },
};

export default factCheckTemplate;
