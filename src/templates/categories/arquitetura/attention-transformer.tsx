import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';

export const attentionTransformerTemplate: TemplateDefinition = {
  id: 'attention-transformer',
  name: 'Mecanismo de Atenção & Fórmulas',
  category: 'Arquitetura & IA',
  description: 'Visualização de conexões de autoatenção e equações matemáticas centrais de Transformers.',
  iconName: 'layers',
  defaultProps: {
    badge: 'SELF-ATTENTION LAYER',
    title: 'Mecanismo de Atenção (Transformers)',
    description: 'A palavra "cansado" calcula pesos matemáticos para relacionar-se com o sujeito "animal".',
    formula: 'Softmax( (Q · Kᵀ) / √d_k ) · V',
    showFormula: true,
    accentColor: '#6366f1',
  },
  schema: [
    { name: 'badge', label: 'Badge Superior', type: 'text', defaultValue: 'SELF-ATTENTION LAYER' },
    { name: 'title', label: 'Título', type: 'text', defaultValue: 'Mecanismo de Atenção' },
    { name: 'description', label: 'Descrição da Regra', type: 'textarea', defaultValue: 'A palavra calcula pesos...' },
    { name: 'formula', label: 'Fórmula Matemática', type: 'text', defaultValue: 'Softmax( (Q · Kᵀ) / √d_k ) · V' },
    { name: 'showFormula', label: 'Exibir Fórmula Softmax', type: 'toggle', defaultValue: true },
    { name: 'accentColor', label: 'Cor de Destaque', type: 'color', defaultValue: '#6366f1' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 2, fps, config: { damping: 16, mass: 0.9 } });
    const formulaS = spring({ frame: frame - 8, fps, config: { damping: 15, mass: 1 } });
    const tokensS = spring({ frame: frame - 14, fps, config: { damping: 15, mass: 1 } });

    const badgeText = props.badge || 'SELF-ATTENTION LAYER';
    const accent = props.accentColor || '#6366f1';
    const words = ['O', 'animal', 'não', 'atravessou', 'a', 'rua', 'porque', 'estava', 'cansado'];

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
        {/* Glow de fundo dinâmico */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${accent} 0%, transparent 65%)`,
          }}
        />

        {/* Topo: Badge + Título */}
        <div
          className="max-w-4xl mx-auto space-y-3 shrink-0"
          style={{ transform: `translateY(${(1 - s) * -20}px)`, opacity: s }}
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
            style={{ fontSize: 'var(--font-title, 52px)' }}
          >
            {props.title}
          </h1>

          {props.description && (
            <p
              className="text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed"
              style={{ fontSize: 'var(--font-body, 25px)' }}
            >
              {props.description}
            </p>
          )}
        </div>

        {/* Cartão Central: Fórmula Matemática de Destaque */}
        {props.formula && (
          <div
            className="w-full max-w-4xl mx-auto my-auto p-8 rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-md relative flex flex-col items-center justify-center gap-4"
            style={{
              transform: `scale(${0.92 + formulaS * 0.08})`,
              opacity: formulaS,
              borderTopColor: accent,
              borderTopWidth: '4px',
            }}
          >
            <span
              className="font-mono text-xs uppercase tracking-widest text-slate-400 font-semibold"
              style={{ fontSize: 'var(--font-footer, 16px)' }}
            >
              EQUAÇÃO MATEMÁTICA FUNDAMENTAL
            </span>
            <div
              className="font-mono font-black text-white px-6 py-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 shadow-inner tracking-wide w-full overflow-x-auto text-center"
              style={{
                fontSize: 'clamp(28px, 4.0cqmin, 54px)',
                lineHeight: '1.3',
                color: accent,
              }}
            >
              {props.formula}
            </div>
          </div>
        )}

        {/* Rodapé: Conexões de Atenção Interativas ou Rótulos Q, K, V */}
        {(!props.formula || props.showFormula) && (
          <div
            className="w-full max-w-4xl mx-auto shrink-0 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md"
            style={{
              transform: `translateY(${(1 - tokensS) * 20}px)`,
              opacity: tokensS,
            }}
          >
            <div className="flex justify-between items-center relative z-10 overflow-x-auto pb-1 gap-2">
              {words.map((w, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col items-center shrink-0 ${
                    idx === 1
                      ? 'text-indigo-300 font-bold'
                      : idx === 8
                      ? 'text-pink-400 font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-mono mb-1.5 border shadow-sm ${
                      idx === 1 || idx === 8
                        ? 'bg-indigo-500/20 border-indigo-400'
                        : 'bg-slate-800/80 border-slate-700/80'
                    }`}
                  >
                    q{idx}
                  </div>
                  <span style={{ fontSize: 'var(--font-item, 18px)' }}>{w}</span>
                </div>
              ))}
            </div>
            <div
              className="mt-4 pt-3 border-t border-slate-800 text-slate-400 flex justify-around flex-wrap gap-4 font-mono"
              style={{ fontSize: 'var(--font-footer, 16px)' }}
            >
              <span><strong className="text-white">Q:</strong> Query</span>
              <span><strong className="text-white">K:</strong> Key</span>
              <span><strong className="text-white">V:</strong> Value</span>
              <span style={{ color: accent }}><strong>QKᵀ:</strong> Matriz de Afinidade</span>
            </div>
          </div>
        )}
      </div>
    );
  },
};

export default attentionTransformerTemplate;
