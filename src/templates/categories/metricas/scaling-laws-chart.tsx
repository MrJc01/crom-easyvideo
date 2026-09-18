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
      <div className="w-full h-full flex flex-col items-center justify-center p-16 text-center bg-slate-950 relative overflow-hidden select-none">
        {/* Glow de fundo */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${p.accentColor || '#10b981'} 0%, transparent 60%)`,
          }}
        />

        {/* Badge superior */}
        <div
          className="px-5 py-2 rounded-full border border-emerald-500/30 bg-emerald-950/60 text-emerald-400 font-mono text-xs font-bold tracking-wider mb-8 shadow-xl"
          style={{ transform: `scale(${badgeS})`, opacity: badgeS }}
        >
          {p.badge}
        </div>

        {/* Valor Numérico Gigante */}
        <div
          className="flex items-baseline justify-center gap-2 font-black tracking-tighter leading-none"
          style={{
            transform: `scale(${0.85 + numberS * 0.15}) translateY(${(1 - numberS) * 30}px)`,
            opacity: numberS,
            color: p.accentColor || '#10b981',
          }}
        >
          <span className="text-[140px] drop-shadow-2xl font-mono">
            {animatedDisplayValue}
          </span>
          <span className="text-6xl text-slate-400 font-sans font-bold">
            {p.metricUnit}
          </span>
        </div>

        {/* Rótulo da Métrica */}
        <h2
          className="text-4xl font-extrabold text-white mt-6 max-w-4xl tracking-tight"
          style={{
            transform: `translateY(${(1 - labelS) * 20}px)`,
            opacity: labelS,
          }}
        >
          {p.metricLabel}
        </h2>

        {/* Tag de Comparação e Descrição */}
        <div
          className="mt-6 flex flex-col items-center space-y-3 max-w-2xl"
          style={{
            transform: `translateY(${(1 - descS) * 20}px)`,
            opacity: descS,
          }}
        >
          {p.comparisonText && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-sm font-semibold">
              {p.comparisonText}
            </span>
          )}

          <p className="text-xl text-slate-400 leading-relaxed font-normal">
            {p.description}
          </p>
        </div>
      </div>
    );
  },
};

export default scalingLawsChartTemplate;
