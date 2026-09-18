import React from 'react';
import type { TemplateDefinition, TemplateRenderProps } from '../../../core/types';
import { spring } from '../../../core/animations';

export interface ScalingLawsChartProps {
  badge: string;
  metricValue: string;
  metricUnit: string;
  metricLabel: string;
  description: string;
  accentColor: string;
  comparisonText: string;
}

export const scalingLawsChartTemplate: TemplateDefinition = {
  id: 'scaling-laws-chart',
  name: 'Scaling Laws Chart',
  category: 'Dados, Métricas & Encerramento',
  description: 'Exibição de métrica de alto impacto com número gigante animado e contexto analítico.',
  iconName: 'chart',
  defaultProps: {
    badge: 'BENCHMARK DE PERFORMANCE',
    metricValue: '99.4',
    metricUnit: '%',
    metricLabel: 'Precisão em Inferência Zero-Shot',
    description: 'Redução de latência de 84% comparada à geração autoregressiva tradicional sem quantização.',
    accentColor: '#10b981',
    comparisonText: '+14.2% vs. Modelos Anteriores',
  },
  schema: [
    { name: 'badge', label: 'Badge Superior', type: 'text', defaultValue: 'BENCHMARK DE PERFORMANCE' },
    { name: 'metricValue', label: 'Valor Numérico da Métrica', type: 'text', defaultValue: '99.4' },
    { name: 'metricUnit', label: 'Unidade / Sufixo (%, ms, x)', type: 'text', defaultValue: '%' },
    { name: 'metricLabel', label: 'Rótulo da Métrica', type: 'text', defaultValue: 'Precisão em Inferência Zero-Shot' },
    { name: 'description', label: 'Contexto e Descrição', type: 'textarea', defaultValue: 'Redução de latência de 84%...' },
    { name: 'accentColor', label: 'Cor de Destaque', type: 'color', defaultValue: '#10b981' },
    { name: 'comparisonText', label: 'Texto de Comparação', type: 'text', defaultValue: '+14.2% vs. Modelos Anteriores' },
  ],
  Component: ({ props, frame, fps }: TemplateRenderProps) => {
    const p = props as unknown as ScalingLawsChartProps;

    const badgeS = spring({ frame: frame - 2, fps, config: { damping: 14, mass: 0.8 } });
    const numberS = spring({ frame: frame - 5, fps, config: { damping: 18, mass: 1 } });
    const labelS = spring({ frame: frame - 12, fps, config: { damping: 16, mass: 1 } });
    const descS = spring({ frame: frame - 18, fps, config: { damping: 16, mass: 1 } });

    // Efeito de contador numérico se o valor for puramente numérico
    const rawNum = parseFloat(p.metricValue.replace(',', '.'));
    const isNumeric = !isNaN(rawNum);
    const animatedDisplayValue = isNumeric
      ? (rawNum * Math.min(1, Math.max(0, numberS))).toFixed(p.metricValue.includes('.') ? 1 : 0)
      : p.metricValue;

    return (
      <div
        className="w-full h-full flex flex-col items-center justify-between text-center bg-slate-950 relative overflow-hidden select-none"
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
            background: `radial-gradient(circle at 50% 45%, ${p.accentColor || '#10b981'} 0%, transparent 65%)`,
          }}
        />

        {/* Badge superior */}
        <div
          className="px-5 py-2 rounded-full border border-emerald-500/30 bg-emerald-950/60 text-emerald-400 font-mono font-bold tracking-wider shrink-0 shadow-xl"
          style={{
            transform: `scale(${badgeS})`,
            opacity: badgeS,
            fontSize: 'var(--font-badge, 18px)',
          }}
        >
          {p.badge}
        </div>

        {/* Bloco Central: Valor Numérico Gigante + Rótulo */}
        <div className="my-auto flex flex-col items-center justify-center max-w-4xl">
          <div
            className="flex items-baseline justify-center gap-3 font-black tracking-tighter leading-none"
            style={{
              transform: `scale(${0.85 + numberS * 0.15}) translateY(${(1 - numberS) * 25}px)`,
              opacity: numberS,
              color: p.accentColor || '#10b981',
            }}
          >
            <span
              className="drop-shadow-2xl font-mono"
              style={{ fontSize: 'var(--font-mega, 140px)', lineHeight: '1.0' }}
            >
              {animatedDisplayValue}
            </span>
            {p.metricUnit && (
              <span
                className="text-slate-400 font-sans font-bold"
                style={{ fontSize: 'clamp(28px, 4cqmin, 56px)' }}
              >
                {p.metricUnit}
              </span>
            )}
          </div>

          <h2
            className="font-extrabold text-white mt-6 tracking-tight"
            style={{
              transform: `translateY(${(1 - labelS) * 15}px)`,
              opacity: labelS,
              fontSize: 'var(--font-title, 48px)',
            }}
          >
            {p.metricLabel}
          </h2>

          {/* Tag de Comparação e Descrição */}
          <div
            className="mt-6 flex flex-col items-center space-y-3 max-w-2xl"
            style={{
              transform: `translateY(${(1 - descS) * 15}px)`,
              opacity: descS,
            }}
          >
            {p.comparisonText && (
              <span
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono font-semibold"
                style={{ fontSize: 'var(--font-item, 20px)' }}
              >
                {p.comparisonText}
              </span>
            )}

            <p
              className="text-slate-300 leading-relaxed font-normal"
              style={{ fontSize: 'var(--font-body, 25px)' }}
            >
              {p.description}
            </p>
          </div>
        </div>

        {/* Rodapé */}
        <div
          className="text-center font-mono text-slate-500 uppercase tracking-widest shrink-0"
          style={{ fontSize: 'var(--font-footer, 16px)' }}
        >
          ANÁLISE DE ESCALA COMPUTACIONAL (CHINCHILLA & KAPLAN)
        </div>
      </div>
    );
  },
};

export default scalingLawsChartTemplate;
