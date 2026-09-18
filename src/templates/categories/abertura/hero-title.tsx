import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';

export const heroTitleTemplate: TemplateDefinition = {
  id: 'hero-title',
  name: 'Hero Title Tech',
  category: 'Abertura & Título',
  description: 'Abertura de impacto cinematográfico com badge dinâmico e visibilidade modular.',
  iconName: 'hero',
  defaultProps: {
    showBadge: true,
    badge: 'DEEP DIVE TECNOLÓGICO',
    title: 'Como Funcionam os LLMs',
    showSubtitle: true,
    subtitle: 'Da matemática dos vetores à revolução dos Transformers modernos',
    accentColor: '#6366f1',
    glowColor: '#312e81',
  },
  schema: [
    { name: 'showBadge', label: 'Exibir Badge Superior', type: 'toggle', defaultValue: true },
    { name: 'badge', label: 'Texto do Badge', type: 'text', defaultValue: 'DEEP DIVE TECNOLÓGICO' },
    { name: 'title', label: 'Título Principal', type: 'text', defaultValue: 'Como Funcionam os LLMs' },
    { name: 'showSubtitle', label: 'Exibir Subtítulo', type: 'toggle', defaultValue: true },
    { name: 'subtitle', label: 'Subtítulo', type: 'textarea', defaultValue: 'Da matemática dos vetores...' },
    { name: 'accentColor', label: 'Cor de Destaque', type: 'color', defaultValue: '#6366f1' },
    { name: 'glowColor', label: 'Cor de Fundo Glow', type: 'color', defaultValue: '#312e81' },
  ],
  Component: ({ props, frame, fps }) => {
    const badgeS = spring({ frame: frame - 2, fps });
    const titleS = spring({ frame: frame - 6, fps });
    const subS = spring({ frame: frame - 12, fps });
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center p-12 text-center relative overflow-hidden select-none"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${props.glowColor || '#312e81'} 0%, #030712 85%)`,
        }}
      >
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:28px_28px]" />
        {props.showBadge && (
          <div
            className="px-6 py-2 rounded-full border border-indigo-500/40 bg-indigo-950/80 text-indigo-300 font-mono text-lg font-bold tracking-wider mb-6 flex items-center gap-2.5 shadow-xl"
            style={{ transform: `scale(${badgeS})`, opacity: badgeS }}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping" />
            {props.badge}
          </div>
        )}
        <h1
          className="text-6xl font-black text-white tracking-tight leading-tight max-w-5xl drop-shadow-2xl"
          style={{ transform: `translateY(${(1 - titleS) * 30}px) scale(${titleS})`, opacity: titleS }}
        >
          {props.title}
        </h1>
        {props.showSubtitle && (
          <p
            className="text-2xl text-slate-300 max-w-3xl mt-6 font-normal leading-relaxed"
            style={{ transform: `translateY(${(1 - subS) * 20}px)`, opacity: subS }}
          >
            {props.subtitle}
          </p>
        )}
      </div>
    );
  },
};

export default heroTitleTemplate;
