import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';

export const comparativeMetricsTemplate: TemplateDefinition = {
  id: 'comparative-metrics',
  name: 'Comparativo de Métricas & Valores',
  category: 'Dados, Métricas & Encerramento',
  description: 'Exibição de métricas numéricas comparativas de alto impacto ou barras com percentuais dinâmicos.',
  iconName: 'chart',
  defaultProps: {
    badge: 'EVOLUÇÃO DO VOCABULÁRIO',
    title: 'LLaMA 1 vs. LLaMA 3',
    metricALabel: 'LLaMA 1 & 2',
    metricAValue: '32.000',
    metricASub: 'Vocabulário restrito com alta fragmentação multilíngue',
    metricBLabel: 'LLaMA 3 & 3.1',
    metricBValue: '128.000',
    metricBSub: 'Alta compressão, fluência em dezenas de línguas e código',
    accentColor: '#38bdf8',
  },
  schema: [
    { name: 'badge', label: 'Badge Superior', type: 'text', defaultValue: 'EVOLUÇÃO DO VOCABULÁRIO' },
    { name: 'title', label: 'Título', type: 'text', defaultValue: 'LLaMA 1 vs. LLaMA 3' },
    { name: 'metricALabel', label: 'Rótulo Métrica A', type: 'text', defaultValue: 'LLaMA 1 & 2' },
    { name: 'metricAValue', label: 'Valor Métrica A', type: 'text', defaultValue: '32.000' },
    { name: 'metricASub', label: 'Subtexto Métrica A', type: 'textarea', defaultValue: 'Vocabulário restrito...' },
    { name: 'metricBLabel', label: 'Rótulo Métrica B', type: 'text', defaultValue: 'LLaMA 3 & 3.1' },
    { name: 'metricBValue', label: 'Valor Métrica B', type: 'text', defaultValue: '128.000' },
    { name: 'metricBSub', label: 'Subtexto Métrica B', type: 'textarea', defaultValue: 'Alta compressão...' },
    { name: 'accentColor', label: 'Cor de Destaque', type: 'color', defaultValue: '#38bdf8' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 2, fps, config: { damping: 16, mass: 0.9 } });
    const cardAS = spring({ frame: frame - 6, fps, config: { damping: 15, mass: 1 } });
    const cardBS = spring({ frame: frame - 12, fps, config: { damping: 15, mass: 1 } });

    const badgeText = props.badge || 'COMPARATIVO TÉCNICO';
    const accent = props.accentColor || '#38bdf8';
    const isDualMetric = Boolean(props.metricAValue || props.metricALabel);

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

        {/* Topo: Badge + Título */}
        <div
          className="max-w-4xl mx-auto text-center space-y-3 shrink-0"
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
        </div>

        {/* Conteúdo Principal: Dois Cards com Números Gigantes */}
        {isDualMetric ? (
          <div className="my-auto flex flex-col md:flex-row items-center justify-between gap-6 w-full max-w-5xl mx-auto">
            {/* Card Métrica A */}
            <div
              className="flex-1 w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md flex flex-col justify-between"
              style={{
                transform: `scale(${0.92 + cardAS * 0.08})`,
                opacity: cardAS,
                borderTopColor: '#94a3b8',
                borderTopWidth: '4px',
              }}
            >
              <span className="font-mono text-slate-400 font-bold tracking-wider uppercase text-sm mb-2 block">
                {props.metricALabel || 'BASELINE'}
              </span>
              <div
                className="font-black font-mono tracking-tight my-2"
                style={{
                  fontSize: 'clamp(48px, 6.5cqmin, 86px)',
                  lineHeight: '1.0',
                  color: '#e2e8f0',
                }}
              >
                {props.metricAValue}
              </div>
              <p
                className="text-slate-400 font-normal leading-relaxed mt-3"
                style={{ fontSize: 'var(--font-body, 22px)' }}
              >
                {props.metricASub}
              </p>
            </div>

            {/* Card Métrica B (Destaque Principal) */}
            <div
              className="flex-1 w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md flex flex-col justify-between"
              style={{
                transform: `scale(${0.92 + cardBS * 0.08})`,
                opacity: cardBS,
                borderTopColor: accent,
                borderTopWidth: '4px',
                boxShadow: `0 0 40px ${accent}20`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="font-mono font-bold tracking-wider uppercase text-sm"
                  style={{ color: accent }}
                >
                  {props.metricBLabel || 'OTIMIZADO'}
                </span>
                <span
                  className="px-2.5 py-0.5 rounded-full font-mono text-xs font-bold"
                  style={{ backgroundColor: `${accent}25`, color: accent }}
                >
                  EVOLUÇÃO
                </span>
              </div>
              <div
                className="font-black font-mono tracking-tight my-2"
                style={{
                  fontSize: 'clamp(48px, 6.5cqmin, 86px)',
                  lineHeight: '1.0',
                  color: accent,
                }}
              >
                {props.metricBValue}
              </div>
              <p
                className="text-slate-300 font-normal leading-relaxed mt-3"
                style={{ fontSize: 'var(--font-body, 22px)' }}
              >
                {props.metricBSub}
              </p>
            </div>
          </div>
        ) : (
          /* Fallback: Barras Clássicas Animadas */
          <div className="my-auto space-y-6 bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-4xl mx-auto w-full">
            {[
              { label: props.metric1Label || 'Métrica 1', v1: 35, v2: 95 },
              { label: props.metric2Label || 'Métrica 2', v1: 25, v2: 98 },
              { label: props.metric3Label || 'Métrica 3', v1: 45, v2: 90 },
            ].map((m, i) => {
              const barS = spring({ frame: frame - 10 - i * 6, fps });
              return (
                <div key={i} className="space-y-2">
                  <span className="font-semibold text-slate-300" style={{ fontSize: 'var(--font-item, 22px)' }}>
                    {m.label}
                  </span>
                  <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-500 rounded-full" style={{ width: `${m.v1 * barS}%` }} />
                  </div>
                  <div className="h-5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full shadow-lg"
                      style={{
                        width: `${m.v2 * barS}%`,
                        backgroundColor: accent,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Rodapé */}
        <div
          className="text-center font-mono text-slate-500 uppercase tracking-widest shrink-0"
          style={{ fontSize: 'var(--font-footer, 16px)' }}
        >
          BENCHMARK EMPÍRICO RIGOROSO
        </div>
      </div>
    );
  },
};

export default comparativeMetricsTemplate;
