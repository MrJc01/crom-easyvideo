import React from 'react';
import type { TemplateDefinition, TemplateRenderProps } from '../../../core/types';
import { spring } from '../../../core/animations';

export interface ArrayCardItem {
  tag: string;
  title: string;
  description: string;
  accentColor: string;
}

export interface DataCurationPipelineProps {
  badge: string;
  headline: string;
  subtitle: string;
  items: ArrayCardItem[];
}

export const dataCurationPipelineTemplate: TemplateDefinition = {
  id: 'data-curation-pipeline',
  name: 'Data Curation Pipeline',
  category: 'Arquitetura & IA',
  description: 'Grade responsiva com cartões dinâmicos gerenciáveis pelo DynamicArrayField com itemSchema.',
  iconName: 'grid',
  defaultProps: {
    badge: 'PILARES ARQUITETURAIS',
    headline: 'Três Camadas da Computação Vetorial',
    subtitle: 'Cada estágio do pipeline atua de maneira modular e desacoplada.',
    items: [
      {
        tag: '01. TOKENIZAÇÃO',
        title: 'Divisão Subpalavra BPE',
        description: 'Segmentação de strings textuais em vocabulário vetorial discreto.',
        accentColor: '#6366f1',
      },
      {
        tag: '02. ATENÇÃO',
        title: 'Mecanismo Multi-Head',
        description: 'Projeção simultânea de matrizes Query, Key e Value.',
        accentColor: '#38bdf8',
      },
      {
        tag: '03. ATIVAÇÃO',
        title: 'Camadas Feed-Forward',
        description: 'Transformação dimensional não-linear com normalização RMSNorm.',
        accentColor: '#10b981',
      },
    ],
  },
  schema: [
    { name: 'badge', label: 'Badge Superior', type: 'text', defaultValue: 'PILARES ARQUITETURAIS' },
    { name: 'headline', label: 'Título Principal', type: 'text', defaultValue: 'Três Camadas da Computação Vetorial' },
    { name: 'subtitle', label: 'Subtítulo', type: 'textarea', defaultValue: 'Cada estágio do pipeline atua de maneira modular e desacoplada.' },
    {
      name: 'items',
      label: 'Cartões da Grade',
      type: 'array',
      defaultValue: [
        {
          tag: '01. TOKENIZAÇÃO',
          title: 'Divisão Subpalavra BPE',
          description: 'Segmentação de strings textuais em vocabulário vetorial discreto.',
          accentColor: '#6366f1',
        },
        {
          tag: '02. ATENÇÃO',
          title: 'Mecanismo Multi-Head',
          description: 'Projeção simultânea de matrizes Query, Key e Value.',
          accentColor: '#38bdf8',
        },
        {
          tag: '03. ATIVAÇÃO',
          title: 'Camadas Feed-Forward',
          description: 'Transformação dimensional não-linear com normalização RMSNorm.',
          accentColor: '#10b981',
        },
      ],
      itemSchema: [
        { name: 'tag', label: 'Tag / Etapa', type: 'text', defaultValue: '01. ETAPA' },
        { name: 'title', label: 'Título do Cartão', type: 'text', defaultValue: 'Título do Recurso' },
        { name: 'description', label: 'Descrição Curta', type: 'textarea', defaultValue: 'Detalhes...' },
        { name: 'accentColor', label: 'Cor de Destaque', type: 'color', defaultValue: '#6366f1' },
      ],
    },
  ],
  Component: ({ props, frame, fps }: TemplateRenderProps) => {
    const p = props as unknown as DataCurationPipelineProps;

    const headerS = spring({ frame: frame - 2, fps, config: { damping: 16, mass: 0.9 } });
    const items = Array.isArray(p.items) ? p.items : [];

    return (
      <div
        className="w-full h-full flex flex-col justify-between bg-slate-950 relative overflow-hidden select-none"
        style={{
          paddingTop: 'var(--safe-top, 80px)',
          paddingBottom: 'var(--safe-bottom, 80px)',
          paddingLeft: 'var(--safe-left, 80px)',
          paddingRight: 'var(--safe-right, 80px)',
        }}
      >
        {/* Glow de fundo */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(circle_at_50%_15%,#6366f1_0%,transparent_60%)]" />

        {/* Cabeçalho */}
        <div
          className="max-w-4xl space-y-3 shrink-0"
          style={{
            transform: `translateY(${(1 - headerS) * -20}px)`,
            opacity: headerS,
          }}
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/60 text-indigo-400 font-mono font-bold uppercase tracking-wider"
            style={{ fontSize: 'var(--font-badge, 18px)' }}
          >
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            {p.badge}
          </div>

          <h1
            className="font-black text-white tracking-tight leading-tight"
            style={{ fontSize: 'var(--font-title, 48px)' }}
          >
            {p.headline}
          </h1>

          <p
            className="text-slate-300 font-normal leading-relaxed"
            style={{ fontSize: 'var(--font-body, 24px)' }}
          >
            {p.subtitle}
          </p>
        </div>

        {/* Grade / Lista de Cartões com Stagger por Item (Adaptativo para retrato e paisagem) */}
        <div className="my-auto grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {items.map((item, idx) => {
            const cardS = spring({
              frame: frame - 8 - idx * 8,
              fps,
              config: { damping: 15, mass: 1 },
            });

            return (
              <div
                key={idx}
                className="p-6 rounded-3xl border border-slate-800 bg-slate-900/90 flex flex-col justify-between relative shadow-2xl backdrop-blur-md"
                style={{
                  transform: `translateY(${(1 - cardS) * 30}px) scale(${0.92 + cardS * 0.08})`,
                  opacity: cardS,
                  borderTopColor: item.accentColor || '#6366f1',
                  borderTopWidth: '4px',
                }}
              >
                <div>
                  <span
                    className="font-mono font-bold tracking-widest block mb-3 uppercase text-xs"
                    style={{ color: item.accentColor || '#6366f1', fontSize: 'var(--font-footer, 16px)' }}
                  >
                    {item.tag}
                  </span>

                  <h3
                    className="font-bold text-white mb-2 tracking-tight"
                    style={{ fontSize: 'var(--font-item, 24px)' }}
                  >
                    {item.title}
                  </h3>

                  <p
                    className="text-slate-300 leading-relaxed font-normal"
                    style={{ fontSize: 'var(--font-body, 20px)' }}
                  >
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-800/80 flex items-center justify-between font-mono text-slate-500">
                  <span style={{ fontSize: 'var(--font-footer, 14px)' }}>MÓDULO ATIVO</span>
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.accentColor || '#6366f1' }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Rodapé */}
        <div
          className="text-center font-mono text-slate-500 uppercase tracking-widest shrink-0"
          style={{ fontSize: 'var(--font-footer, 16px)' }}
        >
          CURADORIA & ENGENHARIA DE DADOS EM ESCALA
        </div>
      </div>
    );
  },
};

export default dataCurationPipelineTemplate;
