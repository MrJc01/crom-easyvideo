import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';

export const conceptDefinitionTemplate: TemplateDefinition = {
  id: 'concept-definition',
  name: 'Definição & Tópicos Modulares',
  category: 'Conceitos & Explicações',
  description:
    'Definição conceitual com lista dinâmica de tópicos (adicionar e remover itens dinamicamente).',
  iconName: 'layers',
  defaultProps: {
    showTag: true,
    tag: 'CONCEITO FUNDAMENTAL',
    conceptTitle: 'O que é um LLM?',
    statement:
      'Um Large Language Model é uma rede neural artificial profunda treinada para capturar padrões probabilísticos na linguagem humana.',
    bulletPoints: [
      'Modelos treinados em terabytes de dados da internet',
      'Predizem a próxima palavra com base em contexto estatístico',
      'Base da arquitetura Transformer lançada em 2017',
    ],
  },
  schema: [
    { name: 'showTag', label: 'Exibir Tag', type: 'toggle', defaultValue: true },
    { name: 'tag', label: 'Tag Superior', type: 'text', defaultValue: 'CONCEITO FUNDAMENTAL' },
    { name: 'conceptTitle', label: 'Título do Conceito', type: 'text', defaultValue: 'O que é um LLM?' },
    { name: 'statement', label: 'Declaração Principal', type: 'textarea', defaultValue: 'Um Large Language Model...' },
    {
      name: 'bulletPoints',
      label: 'Tópicos Dinâmicos (Adicionar/Remover)',
      type: 'array',
      itemLabel: 'Tópico Explicativo',
      itemDefaultValue: 'Novo ponto conceitual',
      defaultValue: ['Ponto 1', 'Ponto 2', 'Ponto 3'],
    },
  ],
  Component: ({ props, frame, fps }) => {
    const cardS = spring({ frame: frame - 3, fps });
    const points = Array.isArray(props.bulletPoints) ? props.bulletPoints : [];
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-12 relative overflow-hidden">
        <div
          className="max-w-4xl w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-10 shadow-2xl backdrop-blur-xl"
          style={{ transform: `scale(${cardS})`, opacity: cardS }}
        >
          <div className="mb-4">
            {props.showTag && (
              <span className="text-cyan-400 text-xs font-mono uppercase tracking-widest">
                {props.tag}
              </span>
            )}
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mt-1">
              {props.conceptTitle}
            </h2>
          </div>
          <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-6 border-l-4 border-cyan-500 pl-4 bg-slate-800/40 py-2 rounded-r-lg">
            {props.statement}
          </p>
          <div className="space-y-3">
            {points.map((pt: string, idx: number) => {
              const itemS = spring({ frame: frame - 10 - idx * 5, fps });
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-200 text-sm font-medium"
                  style={{ transform: `translateX(${(1 - itemS) * 30}px)`, opacity: itemS }}
                >
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <span>{pt}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
};

export default conceptDefinitionTemplate;
