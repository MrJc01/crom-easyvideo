import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';

export const stepGuideModularTemplate: TemplateDefinition = {
  id: 'step-guide-modular',
  name: 'Passo a Passo Modular',
  category: 'Conceitos & Explicações',
  description: 'Lista ordenada de passos configurável com adição e remoção dinâmica.',
  iconName: 'layers',
  defaultProps: {
    title: 'Ciclo de Treinamento',
    steps: [
      'Pré-treinamento com trilhões de tokens de texto',
      'Supervised Fine-Tuning (SFT) com instruções humanas',
      'Alinhamento com RLHF (Reinforcement Learning from Human Feedback)',
    ],
  },
  schema: [
    { name: 'title', label: 'Título do Processo', type: 'text', defaultValue: 'Ciclo de Treinamento' },
    {
      name: 'steps',
      label: 'Passos Dinâmicos',
      type: 'array',
      itemLabel: 'Passo',
      itemDefaultValue: 'Nova etapa do ciclo',
      defaultValue: ['Etapa 1', 'Etapa 2', 'Etapa 3'],
    },
  ],
  Component: ({ props, frame, fps }) => {
    const steps = Array.isArray(props.steps) ? props.steps : [];
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-12">
        <h2 className="text-3xl font-extrabold text-white mb-8">{props.title}</h2>
        <div className="space-y-4 max-w-3xl w-full">
          {steps.map((st: string, idx: number) => {
            const s = spring({ frame: frame - 6 - idx * 5, fps });
            return (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg"
                style={{ transform: `scale(${s})`, opacity: s }}
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 font-mono font-bold flex items-center justify-center shrink-0 border border-indigo-500/30">
                  {idx + 1}
                </div>
                <span className="text-sm text-slate-200 font-medium">{st}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
};

export default stepGuideModularTemplate;
