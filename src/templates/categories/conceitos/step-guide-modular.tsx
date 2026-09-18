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
    const accentColor = props.accentColor || '#6366f1';
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-12 relative overflow-hidden">
        {props.badge && (
          <span
            className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider mb-4 border"
            style={{
              backgroundColor: `${accentColor}1a`,
              color: accentColor,
              borderColor: `${accentColor}4d`,
            }}
          >
            {props.badge}
          </span>
        )}
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-8 text-center">{props.title}</h2>
        <div className="space-y-4 max-w-3xl w-full">
          {steps.map((st: any, idx: number) => {
            const s = spring({ frame: frame - 6 - idx * 5, fps });
            const stepLabel = typeof st === 'object' && st !== null ? (st.step || `${idx + 1}`) : `${idx + 1}`;
            const stepTitle = typeof st === 'object' && st !== null ? (st.title || '') : st;
            const stepDesc = typeof st === 'object' && st !== null ? st.desc : null;

            return (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg"
                style={{ transform: `scale(${s})`, opacity: s }}
              >
                <div
                  className="w-10 h-10 rounded-xl font-mono font-bold flex items-center justify-center shrink-0 border text-xs"
                  style={{
                    backgroundColor: `${accentColor}26`,
                    color: accentColor,
                    borderColor: `${accentColor}4d`,
                  }}
                >
                  {stepLabel}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-base text-slate-100 font-bold leading-tight">{stepTitle}</span>
                  {stepDesc && (
                    <span className="text-xs text-slate-400 mt-1 leading-relaxed font-normal">{stepDesc}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
};

export default stepGuideModularTemplate;
