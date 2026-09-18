import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';

export const prosConsModularTemplate: TemplateDefinition = {
  id: 'pros-cons-modular',
  name: 'Vantagens & Desvantagens',
  category: 'Dados, Métricas & Encerramento',
  description: 'Listas dinâmicas de prós e contras com suporte a adição, remoção e layout adaptativo.',
  iconName: 'chart',
  defaultProps: {
    badge: 'ANÁLISE DE TRADE-OFFS',
    pros: ['Altíssima velocidade e latência previsível', 'Sem custos de API por requisição', 'Customização total de parâmetros'],
    cons: ['Exige GPU de ponta com alta VRAM', 'Alucinações possíveis sem grounding', 'Manutenção contínua de servidor'],
  },
  schema: [
    { name: 'badge', label: 'Badge Superior', type: 'text', defaultValue: 'ANÁLISE DE TRADE-OFFS' },
    {
      name: 'pros',
      label: 'Vantagens (Prós)',
      type: 'array',
      itemLabel: 'Vantagem',
      itemDefaultValue: 'Nova vantagem técnica',
      defaultValue: ['Vantagem 1', 'Vantagem 2'],
    },
    {
      name: 'cons',
      label: 'Desvantagens (Contras)',
      type: 'array',
      itemLabel: 'Desvantagem',
      itemDefaultValue: 'Nova desvantagem técnica',
      defaultValue: ['Desvantagem 1', 'Desvantagem 2'],
    },
  ],
  Component: ({ props, frame = 0, fps = 30 }) => {
    const s = spring({ frame: frame - 2, fps, config: { damping: 16, mass: 0.9 } });
    const pros = Array.isArray(props.pros) ? props.pros : [];
    const cons = Array.isArray(props.cons) ? props.cons : [];
    const badgeText = props.badge || 'ANÁLISE DE TRADE-OFFS';

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
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,#38bdf8_0%,transparent_65%)]" />

        {/* Topo: Badge */}
        <div
          className="flex justify-center shrink-0"
          style={{ transform: `translateY(${(1 - s) * -15}px)`, opacity: s }}
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-sky-500/30 bg-sky-950/60 text-sky-400 font-mono font-bold uppercase tracking-wider"
            style={{ fontSize: 'var(--font-badge, 18px)' }}
          >
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            {badgeText}
          </div>
        </div>

        {/* Área Central: Prós e Contras (Adapta verticalmente ou horizontalmente) */}
        <div className="my-auto flex flex-col md:flex-row items-stretch justify-between gap-6 w-full max-w-5xl mx-auto">
          {/* Coluna Prós */}
          <div
            className="flex-1 bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md flex flex-col justify-between"
            style={{
              transform: `scale(${0.92 + s * 0.08})`,
              opacity: s,
              borderTopColor: '#10b981',
              borderTopWidth: '4px',
            }}
          >
            <div>
              <span className="font-mono text-emerald-400 font-bold uppercase tracking-widest text-xs block mb-4">
                // VANTAGENS (+)
              </span>
              <div className="space-y-4">
                {pros.map((p: string, i: number) => (
                  <div
                    key={i}
                    className="text-slate-200 flex items-start gap-3 leading-snug font-medium"
                    style={{ fontSize: 'var(--font-body, 22px)' }}
                  >
                    <span className="text-emerald-400 font-bold font-mono text-lg shrink-0">✓</span>
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Coluna Contras */}
          <div
            className="flex-1 bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md flex flex-col justify-between"
            style={{
              transform: `scale(${0.92 + s * 0.08})`,
              opacity: s,
              borderTopColor: '#f43f5e',
              borderTopWidth: '4px',
            }}
          >
            <div>
              <span className="font-mono text-rose-400 font-bold uppercase tracking-widest text-xs block mb-4">
                // LIMITAÇÕES / DESVANTAGENS (-)
              </span>
              <div className="space-y-4">
                {cons.map((c: string, i: number) => (
                  <div
                    key={i}
                    className="text-slate-200 flex items-start gap-3 leading-snug font-medium"
                    style={{ fontSize: 'var(--font-body, 22px)' }}
                  >
                    <span className="text-rose-400 font-bold font-mono text-lg shrink-0">✕</span>
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div
          className="text-center font-mono text-slate-500 uppercase tracking-widest shrink-0"
          style={{ fontSize: 'var(--font-footer, 16px)' }}
        >
          ANÁLISE COMPARATIVA DE VIABILIDADE
        </div>
      </div>
    );
  },
};

export default prosConsModularTemplate;
