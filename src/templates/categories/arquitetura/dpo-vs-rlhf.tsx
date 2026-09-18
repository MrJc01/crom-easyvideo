import React from 'react';
import type { TemplateDefinition, TemplateRenderProps } from '../../../core/types';
import { spring } from '../../../core/animations';

export interface DpoVsRlhfProps {
  badge: string;
  title: string;
  subtitle: string;
  rlhfTitle: string;
  rlhfPoints: string[];
  dpoTitle: string;
  dpoPoints: string[];
  formula: string;
  accentColor: string;
}

export const dpoVsRlhfTemplate: TemplateDefinition = {
  id: 'dpo-vs-rlhf',
  name: 'DPO vs RLHF Comparison',
  category: 'Arquitetura & IA',
  description: 'Comparativo visual entre a complexidade de redes de RLHF/PPO e a simplificação matemática do DPO de Stanford.',
  iconName: 'split',
  defaultProps: {
    badge: 'RUPTURA ARQUITETURAL',
    title: 'A Mudança de Paradigma no Alinhamento',
    subtitle: 'Por que Stanford substituiu 4 redes neurais e loops de RL por uma única loss analítica.',
    rlhfTitle: 'RLHF Clássico (PPO)',
    rlhfPoints: [
      '4 modelos em GPU: Actor, Critic, Reward, Ref',
      'Treinamento instável com divergência de gradiente',
      'Custo massivo de memória e hiperparâmetros sensíveis',
      'Risco severo de Reward Hacking / Sycophancy'
    ],
    dpoTitle: 'DPO (Direct Preference Optimization)',
    dpoPoints: [
      'Zero modelos de recompensa explícitos',
      'Otimização direta por Cross-Entropy binária',
      'Estabilidade garantida e convergência rápida',
      'Derivação matemática exata da política ótima'
    ],
    formula: 'r(x, y) = β · log [ π_θ(y|x) / π_ref(y|x) ]',
    accentColor: '#38bdf8',
  },
  schema: [
    { name: 'badge', label: 'Badge Superior', type: 'text', defaultValue: 'RUPTURA ARQUITETURAL' },
    { name: 'title', label: 'Título Principal', type: 'text', defaultValue: 'A Mudança de Paradigma no Alinhamento' },
    { name: 'subtitle', label: 'Subtítulo', type: 'textarea', defaultValue: 'Por que Stanford substituiu 4 redes neurais...' },
    { name: 'rlhfTitle', label: 'Título Coluna RLHF', type: 'text', defaultValue: 'RLHF Clássico (PPO)' },
    {
      name: 'rlhfPoints',
      label: 'Pontos do RLHF',
      type: 'array',
      defaultValue: [
        '4 modelos em GPU: Actor, Critic, Reward, Ref',
        'Treinamento instável com divergência de gradiente',
        'Custo massivo de memória e hiperparâmetros sensíveis',
        'Risco severo de Reward Hacking / Sycophancy'
      ]
    },
    { name: 'dpoTitle', label: 'Título Coluna DPO', type: 'text', defaultValue: 'DPO (Direct Preference Optimization)' },
    {
      name: 'dpoPoints',
      label: 'Pontos do DPO',
      type: 'array',
      defaultValue: [
        'Zero modelos de recompensa explícitos',
        'Otimização direta por Cross-Entropy binária',
        'Estabilidade garantida e convergência rápida',
        'Derivação matemática exata da política ótima'
      ]
    },
    { name: 'formula', label: 'Fórmula Matemática do DPO', type: 'text', defaultValue: 'r(x, y) = β · log [ π_θ(y|x) / π_ref(y|x) ]' },
    { name: 'accentColor', label: 'Cor de Destaque', type: 'color', defaultValue: '#38bdf8' },
  ],
  Component: ({ props, frame, fps }: TemplateRenderProps) => {
    const p = props as unknown as DpoVsRlhfProps;

    const titleS = spring({ frame: frame - 2, fps, config: { damping: 16, mass: 0.9 } });
    const leftCardS = spring({ frame: frame - 8, fps, config: { damping: 16, mass: 1 } });
    const rightCardS = spring({ frame: frame - 14, fps, config: { damping: 16, mass: 1 } });
    const formulaS = spring({ frame: frame - 20, fps, config: { damping: 14, mass: 0.8 } });

    const rlhfPoints = Array.isArray(p.rlhfPoints) ? p.rlhfPoints : [];
    const dpoPoints = Array.isArray(p.dpoPoints) ? p.dpoPoints : [];

    return (
      <div className="w-full h-full flex flex-col justify-between p-16 bg-slate-950 relative overflow-hidden select-none">
        {/* Glow de fundo */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,#38bdf8_0%,transparent_60%)]" />

        {/* Topo: Header */}
        <div
          className="max-w-4xl space-y-3"
          style={{
            transform: `translateY(${(1 - titleS) * 30}px)`,
            opacity: titleS,
          }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-sky-500/30 bg-sky-950/60 text-sky-400 font-mono text-xs font-semibold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            {p.badge}
          </div>
          <h1 className="text-5xl font-black text-white tracking-tight leading-tight">
            {p.title}
          </h1>
          <p className="text-xl text-slate-300 font-normal leading-relaxed">
            {p.subtitle}
          </p>
        </div>

        {/* Comparativo Central (Split Columns) */}
        <div className="grid grid-cols-2 gap-8 my-auto pt-4">
          {/* Lado Esquerdo: RLHF */}
          <div
            className="p-8 rounded-2xl border border-rose-500/30 bg-rose-950/20 backdrop-blur-sm flex flex-col justify-between"
            style={{
              transform: `translateX(${(1 - leftCardS) * -40}px)`,
              opacity: leftCardS,
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-rose-300 tracking-tight">{p.rlhfTitle}</h3>
                <span className="px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-400 font-mono text-xs font-bold">
                  ALTA COMPLEXIDADE
                </span>
              </div>
              <ul className="space-y-3">
                {rlhfPoints.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-300 text-lg">
                    <svg className="w-5 h-5 text-rose-400 mt-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Lado Direito: DPO */}
          <div
            className="p-8 rounded-2xl border border-emerald-500/40 bg-emerald-950/30 backdrop-blur-sm flex flex-col justify-between shadow-[0_0_50px_rgba(16,185,129,0.15)]"
            style={{
              transform: `translateX(${(1 - rightCardS) * 40}px)`,
              opacity: rightCardS,
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-emerald-300 tracking-tight">{p.dpoTitle}</h3>
                <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-mono text-xs font-bold">
                  ELEGANTE & EFICIENTE
                </span>
              </div>
              <ul className="space-y-3">
                {dpoPoints.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-200 text-lg font-medium">
                    <svg className="w-5 h-5 text-emerald-400 mt-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Rodapé: Barra da Equação de Stanford */}
        <div
          className="mt-4 p-4 rounded-xl border border-sky-500/30 bg-sky-950/40 backdrop-blur-md flex items-center justify-between"
          style={{
            transform: `scale(${formulaS})`,
            opacity: formulaS,
          }}
        >
          <span className="text-sky-400 font-mono text-xs uppercase tracking-widest font-bold">
            EQUAÇÃO ANALÍTICA DE STANFORD (DPO)
          </span>
          <code className="text-2xl font-mono font-bold text-white tracking-wide">
            {p.formula}
          </code>
        </div>
      </div>
    );
  },
};

export default dpoVsRlhfTemplate;
