import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';

export const tokensEmbeddingsTemplate: TemplateDefinition = {
  id: 'tokens-embeddings',
  name: 'Tokens & Embeddings',
  category: 'Arquitetura & IA',
  description: 'Demonstração animada da quebra de texto em tokens e coordenadas vetoriais.',
  iconName: 'cpu',
  defaultProps: {
    title: 'Como o Modelo "Enxerga" o Texto',
    sentence: 'A inteligência artificial transforma texto em números',
    tokens: 'A;intelig;ência;artific;ial;trans;forma;texto;em;números',
    showDimensions: true,
  },
  schema: [
    { name: 'title', label: 'Título', type: 'text', defaultValue: 'Como o Modelo "Enxerga" o Texto' },
    { name: 'sentence', label: 'Frase de Entrada', type: 'text', defaultValue: 'A inteligência artificial...' },
    {
      name: 'tokens',
      label: 'Tokens (separados por ;)',
      type: 'text',
      defaultValue: 'A;intelig;ência;artific;ial;trans;forma;texto;em;números',
    },
    { name: 'showDimensions', label: 'Exibir Dimensões Vetoriais', type: 'toggle', defaultValue: true },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame, fps });
    const tokens = (props.tokens || '').split(';').filter(Boolean);
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-10 text-center overflow-y-auto">
        <div className="max-w-4xl w-full" style={{ opacity: s }}>
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
            TOKENIZAÇÃO & VETORES
          </span>
          <h2 className="text-4xl font-extrabold text-white mt-3 mb-6">{props.title}</h2>
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 font-mono text-sm text-slate-400 mb-6 inline-block max-w-full truncate">
            Input: "{props.sentence}"
          </div>
          <div className="flex flex-wrap justify-center gap-2 mb-8 max-h-[160px] overflow-y-auto">
            {tokens.map((t: string, i: number) => {
              const tokS = spring({ frame: frame - 8 - i * 3, fps });
              const isHighlight = Math.floor(frame / 20) % tokens.length === i;
              return (
                <div
                  key={i}
                  className={`px-3 py-2 rounded-xl font-mono text-sm border transition-all ${
                    isHighlight
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 scale-105 shadow-lg'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                  style={{ transform: `scale(${tokS})`, opacity: tokS }}
                >
                  <span className="text-[10px] text-slate-500 mr-1">#{i}</span>
                  {t}
                </div>
              );
            })}
          </div>
          {props.showDimensions && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-300 flex items-center justify-between gap-2">
              <span className="text-emerald-400 font-bold shrink-0">Vetor [1536d]:</span>
              <span className="text-slate-400 truncate">[0.842, -0.312, 0.915, ... 1533 dimensões]</span>
            </div>
          )}
        </div>
      </div>
    );
  },
};

export default tokensEmbeddingsTemplate;
