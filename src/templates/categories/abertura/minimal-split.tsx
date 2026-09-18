import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';

export const minimalSplitTemplate: TemplateDefinition = {
  id: 'minimal-split',
  name: 'Minimal Split Titular',
  category: 'Abertura & Título',
  description: 'Divisão em 2 colunas para contrapor categoria e mensagem focal.',
  iconName: 'layers',
  defaultProps: {
    category: 'ARQUITETURA',
    leftTitle: 'Processamento Paralelo',
    rightDescription:
      'Diferente das RNNs sequenciais, os Transformers analisam todas as palavras ao mesmo tempo.',
  },
  schema: [
    { name: 'category', label: 'Categoria', type: 'text', defaultValue: 'ARQUITETURA' },
    { name: 'leftTitle', label: 'Título Esquerdo', type: 'text', defaultValue: 'Processamento Paralelo' },
    { name: 'rightDescription', label: 'Texto Direito', type: 'textarea', defaultValue: 'Diferente das RNNs...' },
  ],
  Component: ({ props, frame, fps }) => {
    const leftS = spring({ frame: frame - 4, fps });
    const rightS = spring({ frame: frame - 10, fps });
    return (
      <div className="w-full h-full bg-slate-950 grid grid-cols-2 p-14 gap-8 items-center relative">
        <div
          className="border-r border-slate-800 pr-8"
          style={{ opacity: leftS, transform: `translateX(${(1 - leftS) * -30}px)` }}
        >
          <span className="text-xs font-mono text-cyan-400 tracking-widest uppercase">
            {props.category}
          </span>
          <h2 className="text-5xl font-extrabold text-white mt-4 leading-tight">
            {props.leftTitle}
          </h2>
        </div>
        <div
          className="pl-6"
          style={{ opacity: rightS, transform: `translateX(${(1 - rightS) * 30}px)` }}
        >
          <p className="text-xl text-slate-300 leading-relaxed font-light">{props.rightDescription}</p>
        </div>
      </div>
    );
  },
};

export default minimalSplitTemplate;
