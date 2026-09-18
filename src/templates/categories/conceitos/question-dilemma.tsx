import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';
import { Icons } from '../../../core/icons';

export const questionDilemmaTemplate: TemplateDefinition = {
  id: 'question-dilemma',
  name: 'Pergunta / O Dilema',
  category: 'Conceitos & Explicações',
  description: 'Gera curiosidade com uma questão central reflexiva e contexto secundário.',
  iconName: 'hero',
  defaultProps: {
    question: 'Eles realmente entendem o que dizem?',
    context:
      'Ou são apenas papagaios estocásticos que combinam palavras com base em probabilidade matemática?',
    showIcon: true,
  },
  schema: [
    { name: 'showIcon', label: 'Exibir Ícone Central', type: 'toggle', defaultValue: true },
    { name: 'question', label: 'Pergunta Principal', type: 'text', defaultValue: 'Eles realmente entendem?' },
    { name: 'context', label: 'Contextualização', type: 'textarea', defaultValue: 'Ou são apenas...' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 4, fps });
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-14 text-center">
        <div className="max-w-3xl" style={{ transform: `scale(${s})`, opacity: s }}>
          {props.showIcon && (
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-6">
              <Icons.Sparkles />
            </div>
          )}
          <h2 className="text-5xl font-black text-white leading-tight mb-6">
            {props.question}
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">{props.context}</p>
        </div>
      </div>
    );
  },
};

export default questionDilemmaTemplate;
