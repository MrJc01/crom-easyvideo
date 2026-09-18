import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';

export const quoteStatementTemplate: TemplateDefinition = {
  id: 'quote-statement',
  name: 'Citação de Autoridade & Artigos',
  category: 'Conceitos & Explicações',
  description: 'Citação de papers célebres ou especialistas com autor, filiação institucional e ano.',
  iconName: 'hero',
  defaultProps: {
    badge: 'CITAÇÃO DE AUTORIDADE',
    quote: '"Attention Is All You Need."',
    author: 'Vaswani et al.',
    role: 'Google Brain & Google Research · NeurIPS 2017',
    accentColor: '#6366f1',
  },
  schema: [
    { name: 'badge', label: 'Badge Superior', type: 'text', defaultValue: 'CITAÇÃO DE AUTORIDADE' },
    { name: 'quote', label: 'Citação', type: 'textarea', defaultValue: '"Attention Is All You Need."' },
    { name: 'author', label: 'Autor(es)', type: 'text', defaultValue: 'Vaswani et al.' },
    { name: 'role', label: 'Cargo / Instituição / Ano', type: 'text', defaultValue: 'Google Brain · NeurIPS 2017' },
    { name: 'accentColor', label: 'Cor de Destaque', type: 'color', defaultValue: '#6366f1' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 2, fps, config: { damping: 16, mass: 0.9 } });
    const quoteS = spring({ frame: frame - 6, fps, config: { damping: 15, mass: 1 } });
    const authorS = spring({ frame: frame - 14, fps, config: { damping: 15, mass: 1 } });

    const badgeText = props.badge || 'CITAÇÃO HISTÓRICA';
    const accent = props.accentColor || '#6366f1';
    const roleText = props.role || props.year || '';

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
            background: `radial-gradient(circle at 30% 50%, ${accent} 0%, transparent 65%)`,
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

        {/* Área Central: Citação com Aspas Gigantes Decorativas */}
        <div
          className="my-auto max-w-4xl w-full border-l-4 pl-8 py-4 relative"
          style={{
            borderColor: accent,
            transform: `translateX(${(1 - quoteS) * -25}px)`,
            opacity: quoteS,
          }}
        >
          <span
            className="absolute -top-12 -left-6 text-8xl font-serif select-none pointer-events-none opacity-20"
            style={{ color: accent }}
          >
            “
          </span>

          <p
            className="font-serif italic text-white leading-relaxed tracking-normal mb-8"
            style={{ fontSize: 'clamp(28px, 3.8cqmin, 48px)' }}
          >
            {props.quote}
          </p>

          <div
            className="space-y-1"
            style={{
              transform: `translateY(${(1 - authorS) * 15}px)`,
              opacity: authorS,
            }}
          >
            <h4
              className="font-bold text-white font-mono tracking-tight"
              style={{ fontSize: 'var(--font-item, 24px)', color: accent }}
            >
              {props.author}
            </h4>
            {roleText && (
              <p
                className="text-slate-400 font-mono"
                style={{ fontSize: 'var(--font-footer, 18px)' }}
              >
                {roleText}
              </p>
            )}
          </div>
        </div>

        {/* Rodapé */}
        <div
          className="text-right font-mono text-slate-500 uppercase tracking-widest shrink-0"
          style={{ fontSize: 'var(--font-footer, 16px)' }}
        >
          LITERATURA & DISCUSSÃO CIENTÍFICA
        </div>
      </div>
    );
  },
};

export default quoteStatementTemplate;
