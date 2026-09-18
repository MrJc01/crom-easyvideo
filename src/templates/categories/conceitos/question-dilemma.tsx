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
    badge: 'O DILEMA FILOSÓFICO',
    question: 'Eles realmente entendem o que dizem?',
    context:
      'Ou são apenas papagaios estocásticos que combinam palavras com base em probabilidade matemática?',
    showIcon: true,
  },
  schema: [
    { name: 'badge', label: 'Badge Superior', type: 'text', defaultValue: 'O DILEMA FILOSÓFICO' },
    { name: 'showIcon', label: 'Exibir Ícone Central', type: 'toggle', defaultValue: true },
    { name: 'question', label: 'Pergunta Principal', type: 'text', defaultValue: 'Eles realmente entendem?' },
    { name: 'context', label: 'Contextualização', type: 'textarea', defaultValue: 'Ou são apenas...' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 2, fps, config: { damping: 16, mass: 0.9 } });
    const badgeText = props.badge || 'REFLEXÃO FUNDAMENTAL';

    return (
      <div
        className="w-full h-full bg-slate-950 flex flex-col justify-between items-center text-center select-none relative overflow-hidden"
        style={{
          paddingTop: 'var(--safe-top, 80px)',
          paddingBottom: 'var(--safe-bottom, 80px)',
          paddingLeft: 'var(--safe-left, 80px)',
          paddingRight: 'var(--safe-right, 80px)',
        }}
      >
        {/* Glow de fundo */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,#f59e0b_0%,transparent_65%)]" />

        {/* Topo: Badge */}
        <div
          className="flex justify-center shrink-0"
          style={{ transform: `translateY(${(1 - s) * -15}px)`, opacity: s }}
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-950/60 text-amber-400 font-mono font-bold uppercase tracking-wider"
            style={{ fontSize: 'var(--font-badge, 18px)' }}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            {badgeText}
          </div>
        </div>

        {/* Área Central: Ícone + Pergunta + Contexto */}
        <div
          className="my-auto max-w-4xl w-full flex flex-col items-center justify-center space-y-6"
          style={{ transform: `scale(${0.92 + s * 0.08})`, opacity: s }}
        >
          {props.showIcon && (
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-xl">
              <Icons.Sparkles />
            </div>
          )}
          <h2
            className="font-black text-white leading-tight tracking-tight max-w-3xl"
            style={{ fontSize: 'var(--font-hero, 58px)' }}
          >
            {props.question}
          </h2>
          <p
            className="text-slate-300 max-w-2xl leading-relaxed font-normal"
            style={{ fontSize: 'var(--font-body, 25px)' }}
          >
            {props.context}
          </p>
        </div>

        {/* Rodapé */}
        <div
          className="text-center font-mono text-slate-500 uppercase tracking-widest shrink-0"
          style={{ fontSize: 'var(--font-footer, 16px)' }}
        >
          DEBATE TÉCNICO & FILOSÓFICO
        </div>
      </div>
    );
  },
};

export default questionDilemmaTemplate;
