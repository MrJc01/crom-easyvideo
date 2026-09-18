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
      <div className="w-full h-full flex flex-col justify-between p-20 bg-slate-950 relative overflow-hidden select-none">
        {/* Cabeçalho */}
        <div
          className="max-w-4xl space-y-4"
          style={{
            transform: `translateY(${(1 - headerS) * 30}px)`,
            opacity: headerS,
          }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/60 text-indigo-400 font-mono text-xs font-semibold uppercase tracking-wider">
            {p.badge}
          </div>

          <h1 className="text-5xl font-black text-white tracking-tight leading-tight">
            {p.headline}
          </h1>

          <p className="text-xl text-slate-400 font-normal leading-relaxed">
            {p.subtitle}
          </p>
        </div>

        {/* Grade de Cartões com Stagger por Item */}
        <div className="grid grid-cols-3 gap-8 mt-12 w-full">
          {items.map((item, idx) => {
            // Atraso de 8 frames entre cada cartão
            const cardS = spring({
              frame: frame - 8 - idx * 8,
              fps,
              config: { damping: 15, mass: 1 },
            });

            return (
              <div
                key={idx}
                className="p-8 rounded-2xl border border-slate-800 bg-slate-900/80 flex flex-col justify-between relative shadow-2xl backdrop-blur-md"
                style={{
                  transform: `translateY(${(1 - cardS) * 40}px) scale(${0.9 + cardS * 0.1})`,
                  opacity: cardS,
                  borderTopColor: item.accentColor || '#6366f1',
                  borderTopWidth: '3px',
                }}
              >
                <div>
                  <span
                    className="text-xs font-mono font-bold tracking-widest block mb-4 uppercase"
                    style={{ color: item.accentColor || '#6366f1' }}
                  >
                    {item.tag}
                  </span>

                  <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
                    {item.title}
                  </h3>

                  <p className="text-base text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span>MÓDULO ATIVO</span>
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.accentColor || '#6366f1' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
};

export default dataCurationPipelineTemplate;
