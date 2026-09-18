import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';

export const comparativeMetricsTemplate: TemplateDefinition = {
  id: 'comparative-metrics',
  name: 'Comparativo de Métricas',
  category: 'Dados, Métricas & Encerramento',
  description: 'Barras comparativas com cálculo dinâmico de percentuais.',
  iconName: 'chart',
  defaultProps: {
    title: 'Modelos Clássicos vs LLMs Modernos',
    modelA: 'RNN / LSTM (2015)',
    modelB: 'Transformer SOTA (2024)',
    metric1Label: 'Janela de Contexto',
    metric2Label: 'Paralelização de Treino',
    metric3Label: 'Raciocínio Geral',
  },
  schema: [
    { name: 'title', label: 'Título', type: 'text', defaultValue: 'Modelos Clássicos vs LLMs' },
    { name: 'modelA', label: 'Modelo A', type: 'text', defaultValue: 'RNN / LSTM' },
    { name: 'modelB', label: 'Modelo B', type: 'text', defaultValue: 'Transformer SOTA' },
    { name: 'metric1Label', label: 'Métrica 1', type: 'text', defaultValue: 'Janela de Contexto' },
    { name: 'metric2Label', label: 'Métrica 2', type: 'text', defaultValue: 'Paralelização' },
    { name: 'metric3Label', label: 'Métrica 3', type: 'text', defaultValue: 'Raciocínio Geral' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame, fps });
    const metrics = [
      { label: props.metric1Label, v1: 35, v2: 95 },
      { label: props.metric2Label, v1: 25, v2: 98 },
      { label: props.metric3Label, v1: 45, v2: 90 },
    ];
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-12">
        <div className="max-w-3xl w-full" style={{ opacity: s }}>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-extrabold text-white">{props.title}</h2>
            <div className="flex gap-4 text-xs font-mono">
              <span className="text-slate-400">■ {props.modelA}</span>
              <span className="text-amber-400">■ {props.modelB}</span>
            </div>
          </div>
          <div className="space-y-6 bg-slate-900 border border-slate-800 rounded-3xl p-8">
            {metrics.map((m, i) => {
              const barS = spring({ frame: frame - 10 - i * 6, fps });
              return (
                <div key={i} className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-300">{m.label}</span>
                  <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-500 rounded-full" style={{ width: `${m.v1 * barS}%` }} />
                  </div>
                  <div className="h-3.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-lg"
                      style={{ width: `${m.v2 * barS}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
};

export default comparativeMetricsTemplate;
