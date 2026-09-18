import React from 'react';
import type { TemplateDefinition, TemplateRenderProps } from '../../src/core/types';
import { spring } from '../../src/core/animations';

export interface StarterMinimalProps {
  showBadge: boolean;
  badge: string;
  title: string;
  showSubtitle: boolean;
  subtitle: string;
  accentColor: string;
  glowColor: string;
}

export const starterMinimalTemplate: TemplateDefinition = {
  id: 'starter-minimal',
  name: 'Minimal Headline Impact',
  category: 'Abertura & Título',
  description: 'Composição de alto impacto com badge dinâmico, tipografia refinada e iluminação radial.',
  iconName: 'hero',
  defaultProps: {
    showBadge: true,
    badge: 'DEEP DIVE TECNOLÓGICO',
    title: 'Arquitetura e Fundamentos de Modelos de Linguagem',
    showSubtitle: true,
    subtitle: 'Da probabilidade estatística à inteligência generativa moderna.',
    accentColor: '#6366f1',
    glowColor: '#312e81',
  },
  schema: [
    { name: 'showBadge', label: 'Exibir Badge Superior', type: 'toggle', defaultValue: true },
    { name: 'badge', label: 'Texto do Badge', type: 'text', defaultValue: 'DEEP DIVE TECNOLÓGICO' },
    { name: 'title', label: 'Título Principal', type: 'text', defaultValue: 'Arquitetura e Fundamentos de Modelos de Linguagem' },
    { name: 'showSubtitle', label: 'Exibir Subtítulo', type: 'toggle', defaultValue: true },
    { name: 'subtitle', label: 'Subtítulo', type: 'textarea', defaultValue: 'Da probabilidade estatística à inteligência generativa moderna.' },
    { name: 'accentColor', label: 'Cor de Destaque', type: 'color', defaultValue: '#6366f1' },
    { name: 'glowColor', label: 'Cor de Fundo Glow', type: 'color', defaultValue: '#312e81' },
  ],
  Component: ({ props, frame, fps }: TemplateRenderProps) => {
    const p = props as StarterMinimalProps;

    // Animações com delays escalonados (stagger)
    const badgeS = spring({ frame: frame - 2, fps, config: { damping: 14, mass: 0.8 } });
    const titleS = spring({ frame: frame - 6, fps, config: { damping: 16, mass: 1 } });
    const subS = spring({ frame: frame - 12, fps, config: { damping: 18, mass: 1 } });

    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center p-16 text-center relative overflow-hidden select-none bg-slate-950"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${p.glowColor || '#312e81'} 0%, #030712 85%)`,
        }}
      >
        {/* Grade de fundo sutil */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:28px_28px]" />

        {/* Badge superior animado */}
        {p.showBadge && (
          <div
            className="px-6 py-2.5 rounded-full border border-indigo-500/40 bg-indigo-950/80 text-indigo-300 font-mono text-sm font-bold tracking-wider mb-6 flex items-center gap-2.5 shadow-xl"
            style={{
              transform: `scale(${badgeS}) translateY(${(1 - badgeS) * 20}px)`,
              opacity: badgeS,
            }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full animate-ping"
              style={{ backgroundColor: p.accentColor || '#6366f1' }}
            />
            {p.badge}
          </div>
        )}

        {/* Título de impacto em escala canônica */}
        <h1
          className="text-6xl font-black text-white tracking-tight leading-tight max-w-5xl drop-shadow-2xl font-sans"
          style={{
            transform: `translateY(${(1 - titleS) * 30}px) scale(${0.9 + titleS * 0.1})`,
            opacity: titleS,
          }}
        >
          {p.title}
        </h1>

        {/* Subtítulo explicativo */}
        {p.showSubtitle && (
          <p
            className="text-2xl text-slate-300 max-w-3xl mt-6 font-normal leading-relaxed"
            style={{
              transform: `translateY(${(1 - subS) * 20}px)`,
              opacity: subS,
            }}
          >
            {p.subtitle}
          </p>
        )}
      </div>
    );
  },
};

export default starterMinimalTemplate;
