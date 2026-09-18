import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';

export const tokensEmbeddingsTemplate: TemplateDefinition = {
  id: 'tokens-embeddings',
  name: 'Tokens & Embeddings Vetoriais',
  category: 'Arquitetura & IA',
  description: 'Visualização da conversão de texto em tokens discretos e coordenadas vetoriais de alta dimensão.',
  iconName: 'cpu',
  defaultProps: {
    badge: 'REPRESENTAÇÃO ESPACIAL',
    title: 'Embeddings de Alta Dimensão',
    subtitle: 'Palavras com significados semanticamente próximos convergem para regiões similares do espaço vetorial.',
    tokenCount: '128.000 Tokens',
    dimension: 'd_model = 4096 / 8192',
    accentColor: '#ec4899',
  },
  schema: [
    { name: 'badge', label: 'Badge Superior', type: 'text', defaultValue: 'REPRESENTAÇÃO ESPACIAL' },
    { name: 'title', label: 'Título', type: 'text', defaultValue: 'Embeddings de Alta Dimensão' },
    { name: 'subtitle', label: 'Subtítulo', type: 'textarea', defaultValue: 'Palavras com significados...' },
    { name: 'tokenCount', label: 'Tamanho do Vocabulário / Tokens', type: 'text', defaultValue: '128.000 Tokens' },
    { name: 'dimension', label: 'Dimensão do Vetor', type: 'text', defaultValue: 'd_model = 4096 / 8192' },
    { name: 'accentColor', label: 'Cor de Destaque', type: 'color', defaultValue: '#ec4899' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 2, fps, config: { damping: 16, mass: 0.9 } });
    const card1S = spring({ frame: frame - 6, fps, config: { damping: 15, mass: 1 } });
    const card2S = spring({ frame: frame - 12, fps, config: { damping: 15, mass: 1 } });

    const badgeText = props.badge || 'TOKENIZAÇÃO & VETORES';
    const accent = props.accentColor || '#ec4899';
    const hasSpecs = Boolean(props.tokenCount || props.dimension);
    const tokens = (props.tokens || 'A;intelig;ência;artific;ial;trans;forma;texto;em;números').split(';').filter(Boolean);

    return (
      <div
        className="w-full h-full bg-slate-950 flex flex-col justify-between select-none relative overflow-hidden text-center"
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

        {/* Topo: Badge + Título + Subtítulo */}
        <div
          className="max-w-4xl mx-auto space-y-3 shrink-0"
          style={{ transform: `translateY(${(1 - s) * -15}px)`, opacity: s }}
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border font-mono uppercase tracking-widest font-bold mx-auto"
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

          <h1
            className="font-black text-white tracking-tight leading-tight"
            style={{ fontSize: 'var(--font-title, 50px)' }}
          >
            {props.title}
          </h1>

          {props.subtitle && (
            <p
              className="text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed"
              style={{ fontSize: 'var(--font-body, 25px)' }}
            >
              {props.subtitle}
            </p>
          )}
        </div>

        {/* Conteúdo Central: Cards de Especificação ou Visualizador de Tokens */}
        {hasSpecs ? (
          <div className="my-auto flex flex-col md:flex-row items-center justify-between gap-6 w-full max-w-4xl mx-auto">
            {/* Card 1: Vocabulário / Tokens */}
            <div
              className="flex-1 w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md flex flex-col justify-between items-center text-center"
              style={{
                transform: `scale(${0.92 + card1S * 0.08})`,
                opacity: card1S,
                borderTopColor: '#38bdf8',
                borderTopWidth: '4px',
              }}
            >
              <span className="font-mono text-sky-400 font-bold tracking-widest text-xs uppercase mb-2">
                // ESPAÇO DISCRETO
              </span>
              <div
                className="font-black font-mono tracking-tight my-2"
                style={{
                  fontSize: 'clamp(36px, 4.5cqmin, 58px)',
                  lineHeight: '1.1',
                  color: '#38bdf8',
                }}
              >
                {props.tokenCount || '128.000'}
              </div>
              <span className="text-slate-400 font-mono text-sm uppercase tracking-wider mt-2">
                Tamanho do Dicionário
              </span>
            </div>

            {/* Card 2: Dimensões Vetoriais */}
            <div
              className="flex-1 w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md flex flex-col justify-between items-center text-center"
              style={{
                transform: `scale(${0.92 + card2S * 0.08})`,
                opacity: card2S,
                borderTopColor: accent,
                borderTopWidth: '4px',
                boxShadow: `0 0 35px ${accent}20`,
              }}
            >
              <span
                className="font-mono font-bold tracking-widest text-xs uppercase mb-2"
                style={{ color: accent }}
              >
                // ESPAÇO CONTÍNUO
              </span>
              <div
                className="font-black font-mono tracking-tight my-2"
                style={{
                  fontSize: 'clamp(36px, 4.5cqmin, 58px)',
                  lineHeight: '1.1',
                  color: accent,
                }}
              >
                {props.dimension || '8192 Dimensões'}
              </div>
              <span className="text-slate-400 font-mono text-sm uppercase tracking-wider mt-2">
                Geometria Latente (d_model)
              </span>
            </div>
          </div>
        ) : (
          /* Visualizador de Chips de Tokens */
          <div className="my-auto max-w-4xl mx-auto w-full">
            {props.sentence && (
              <div
                className="bg-slate-900 border border-slate-800 rounded-2xl px-6 py-3 font-mono text-slate-300 mb-6 inline-block max-w-full"
                style={{ fontSize: 'var(--font-item, 20px)' }}
              >
                Input: "{props.sentence}"
              </div>
            )}
            <div className="flex flex-wrap justify-center gap-3">
              {tokens.map((t: string, i: number) => {
                const tokS = spring({ frame: frame - 8 - i * 3, fps });
                return (
                  <div
                    key={i}
                    className="px-4 py-2.5 rounded-2xl font-mono border bg-slate-900/90 border-slate-800 text-slate-200 shadow-md"
                    style={{
                      transform: `scale(${tokS})`,
                      opacity: tokS,
                      fontSize: 'var(--font-item, 20px)',
                    }}
                  >
                    <span className="text-xs text-slate-500 mr-1.5 font-mono">#{i}</span>
                    {t}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Rodapé */}
        <div
          className="text-center font-mono text-slate-500 uppercase tracking-widest shrink-0"
          style={{ fontSize: 'var(--font-footer, 16px)' }}
        >
          COMPRESSÃO SEMÂNTICA & ÁLGEBRA LINEAR
        </div>
      </div>
    );
  },
};

export default tokensEmbeddingsTemplate;
