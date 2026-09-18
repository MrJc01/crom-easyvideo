import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';

export const glossaryTermTemplate: TemplateDefinition = {
  id: 'glossary-term',
  name: 'Termo de Glossário & Jargão',
  category: 'Conceitos & Explicações',
  description: 'Explicação detalhada com pronúncia e significado de jargões técnicos.',
  iconName: 'hero',
  defaultProps: {
    badge: 'GLOSSÁRIO TÉCNICO',
    term: 'Temperature',
    phonetic: '/ˈtɛmp.rə.tʃər/',
    meaning:
      'Hiperparâmetro que calibra a aleatoriedade da distribuição de probabilidade na amostragem Softmax.',
    accentColor: '#6366f1',
  },
  schema: [
    { name: 'badge', label: 'Badge Superior', type: 'text', defaultValue: 'GLOSSÁRIO TÉCNICO' },
    { name: 'term', label: 'Termo / Jargão', type: 'text', defaultValue: 'Temperature' },
    { name: 'phonetic', label: 'Pronúncia / Guia', type: 'text', defaultValue: '/ˈtɛmp.rə.tʃər/' },
    { name: 'meaning', label: 'Significado', type: 'textarea', defaultValue: 'Hiperparâmetro que calibra...' },
    { name: 'accentColor', label: 'Cor de Destaque', type: 'color', defaultValue: '#6366f1' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 2, fps, config: { damping: 16, mass: 0.9 } });
    const cardS = spring({ frame: frame - 6, fps, config: { damping: 15, mass: 1 } });
    const badgeText = props.badge || 'GLOSSÁRIO TÉCNICO';
    const accent = props.accentColor || '#6366f1';

    return (
      <div
        className="w-full h-full bg-slate-950 flex flex-col justify-between select-none relative overflow-hidden"
        style={{
          paddingTop: 'var(--safe-top, 80px)',
          paddingBottom: 'var(--safe-bottom, 80px)',
          paddingLeft: 'var(--safe-left, 80px)',
          paddingRight: 'var(--safe-right, 80px)',
        }}
      >
        {/* Glow de fundo */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${accent} 0%, transparent 65%)`,
          }}
        />

        {/* Topo: Badge */}
        <div
          className="flex justify-start shrink-0"
          style={{ transform: `translateY(${(1 - s) * -15}px)`, opacity: s }}
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border font-mono uppercase tracking-widest font-bold"
            style={{
              borderColor: `${accent}40`,
              backgroundColor: `${accent}15`,
              color: accent,
              fontSize: 'var(--font-badge, 18px)',
            }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accent }} />
            {badgeText}
          </div>
        </div>

        {/* Área Central: Caixa de Glossário */}
        <div
          className="max-w-4xl w-full mx-auto my-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-10 shadow-2xl backdrop-blur-md"
          style={{
            transform: `scale(${0.92 + cardS * 0.08})`,
            opacity: cardS,
            borderTopColor: accent,
            borderTopWidth: '4px',
          }}
        >
          <h2
            className="font-black text-white tracking-tight leading-none mb-2"
            style={{ fontSize: 'var(--font-title, 52px)' }}
          >
            {props.term}
          </h2>

          {props.phonetic && (
            <span
              className="font-mono text-slate-400 italic block mb-6"
              style={{ fontSize: 'var(--font-item, 20px)' }}
            >
              {props.phonetic}
            </span>
          )}

          <div className="border-t border-slate-800/80 pt-6">
            <p
              className="text-slate-200 leading-relaxed font-normal"
              style={{ fontSize: 'var(--font-body, 25px)' }}
            >
              {props.meaning}
            </p>
          </div>
        </div>

        {/* Rodapé */}
        <div
          className="text-center font-mono text-slate-500 uppercase tracking-widest shrink-0"
          style={{ fontSize: 'var(--font-footer, 16px)' }}
        >
          DEFINIÇÕES ARQUITETURAIS
        </div>
      </div>
    );
  },
};

export default glossaryTermTemplate;
