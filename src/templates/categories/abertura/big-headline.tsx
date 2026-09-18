import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';

export const bigHeadlineTemplate: TemplateDefinition = {
  id: 'big-headline',
  name: 'Headline Impactante',
  category: 'Abertura & Título',
  description: 'Frase de alto impacto com tipografia superdimensionada e barra decorativa.',
  iconName: 'hero',
  defaultProps: {
    showKicker: true,
    kicker: 'MUDANÇA DE PARADIGMA',
    headline: 'O Fim da Busca Tradicional',
    accent: '#ec4899',
    showAccentBar: true,
  },
  schema: [
    { name: 'showKicker', label: 'Exibir Chamada Curta', type: 'toggle', defaultValue: true },
    { name: 'kicker', label: 'Chamada Curta', type: 'text', defaultValue: 'MUDANÇA DE PARADIGMA' },
    { name: 'headline', label: 'Manchete Principal', type: 'text', defaultValue: 'O Fim da Busca Tradicional' },
    { name: 'showAccentBar', label: 'Exibir Barra de Destaque', type: 'toggle', defaultValue: true },
    { name: 'accent', label: 'Cor de Destaque', type: 'color', defaultValue: '#ec4899' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 2, fps, config: { damping: 16, mass: 0.9 } });
    const barS = spring({ frame: frame - 8, fps, config: { damping: 14, mass: 0.8 } });
    const accent = props.accent || '#ec4899';

    return (
      <div
        className="w-full h-full bg-slate-950 flex flex-col justify-between items-start select-none relative overflow-hidden"
        style={{
          paddingTop: 'var(--safe-top, 80px)',
          paddingBottom: 'var(--safe-bottom, 80px)',
          paddingLeft: 'var(--safe-left, 80px)',
          paddingRight: 'var(--safe-right, 80px)',
        }}
      >
        {/* Glow de fundo */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 70% 30%, ${accent} 0%, transparent 65%)`,
          }}
        />

        {/* Kicker / Badge */}
        {props.showKicker && (
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border font-mono uppercase tracking-widest font-bold shrink-0"
            style={{
              borderColor: `${accent}40`,
              backgroundColor: `${accent}15`,
              color: accent,
              fontSize: 'var(--font-badge, 18px)',
              transform: `translateY(${(1 - s) * -15}px)`,
              opacity: s,
            }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accent }} />
            {props.kicker}
          </div>
        )}

        {/* Manchete Principal */}
        <div className="my-auto max-w-5xl w-full">
          <h1
            className="font-black text-white tracking-tighter uppercase leading-tight"
            style={{
              fontSize: 'var(--font-hero, 72px)',
              transform: `scale(${0.92 + s * 0.08})`,
              opacity: s,
            }}
          >
            {props.headline}
          </h1>

          {props.showAccentBar && (
            <div
              className="h-3 rounded-full mt-8"
              style={{
                width: `${barS * 320}px`,
                backgroundColor: accent,
                boxShadow: `0 0 25px ${accent}80`,
              }}
            />
          )}
        </div>

        {/* Rodapé */}
        <div
          className="font-mono text-slate-500 uppercase tracking-widest shrink-0"
          style={{ fontSize: 'var(--font-footer, 16px)' }}
        >
          MOMENTO DECISIVO & TRANSFORMAÇÃO
        </div>
      </div>
    );
  },
};

export default bigHeadlineTemplate;
