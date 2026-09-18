import React from 'react';
import type { TemplateDefinition, TemplateRenderProps } from '../../../core/types';
import { spring } from '../../../core/animations';

export interface ArchitectureNode {
  label: string;
  sub: string;
  type: 'input' | 'process' | 'output';
  color: string;
}

export interface LlmPipelineFlowProps {
  systemBadge: string;
  architectureTitle: string;
  systemSubheading: string;
  nodes: ArchitectureNode[];
  activePipelineName: string;
}

export const llmPipelineFlowTemplate: TemplateDefinition = {
  id: 'llm-pipeline-flow',
  name: 'LLM Pipeline Flow',
  category: 'Arquitetura & IA',
  description: 'Diagrama de fluxo de dados de sistema com nós interconectados e pipeline visual animado.',
  iconName: 'code',
  defaultProps: {
    systemBadge: 'FLUXO DE ENGENHARIA',
    architectureTitle: 'Pipeline de Inferência Heterogênea',
    systemSubheading: 'Processamento distribuído com balanceamento de nós GPU e fallback CPU em tempo real.',
    activePipelineName: 'Pipeline de Baixa Latência (v2.4)',
    nodes: [
      { label: 'Ingestão de Tokens', sub: 'Streaming gRPC / WebSocket', type: 'input', color: '#6366f1' },
      { label: 'Despacho & Roteador', sub: 'Matriz de Atenção KV-Cache', type: 'process', color: '#38bdf8' },
      { label: 'Execução TensorRT', sub: 'FlashAttention-2 em FP8', type: 'process', color: '#a855f7' },
      { label: 'Saída & Decodificação', sub: 'Emissão de Tokens JSON', type: 'output', color: '#10b981' },
    ],
  },
  schema: [
    { name: 'systemBadge', label: 'Badge do Sistema', type: 'text', defaultValue: 'FLUXO DE ENGENHARIA' },
    { name: 'architectureTitle', label: 'Título da Arquitetura', type: 'text', defaultValue: 'Pipeline de Inferência Heterogênea' },
    { name: 'systemSubheading', label: 'Subtítulo Explicativo', type: 'textarea', defaultValue: 'Processamento distribuído com balanceamento de nós GPU e fallback CPU em tempo real.' },
    { name: 'activePipelineName', label: 'Nome do Pipeline Ativo', type: 'text', defaultValue: 'Pipeline de Baixa Latência (v2.4)' },
    {
      name: 'nodes',
      label: 'Nós do Diagrama',
      type: 'array',
      defaultValue: [
        { label: 'Ingestão de Tokens', sub: 'Streaming gRPC', type: 'input', color: '#6366f1' },
        { label: 'Despacho & Roteador', sub: 'KV-Cache', type: 'process', color: '#38bdf8' },
        { label: 'Execução TensorRT', sub: 'FlashAttention', type: 'process', color: '#a855f7' },
        { label: 'Saída & Decodificação', sub: 'Emissão JSON', type: 'output', color: '#10b981' },
      ],
      itemSchema: [
        { name: 'label', label: 'Nome do Nó', type: 'text', defaultValue: 'Novo Estágio' },
        { name: 'sub', label: 'Detalhes Técnicos', type: 'text', defaultValue: 'Protocolo / Algoritmo' },
        { name: 'color', label: 'Cor do Nó', type: 'color', defaultValue: '#6366f1' },
      ],
    },
  ],
  Component: ({ props, frame, fps }: TemplateRenderProps) => {
    const p = props as unknown as LlmPipelineFlowProps;

    const titleS = spring({ frame: frame - 2, fps, config: { damping: 16, mass: 1 } });
    const nodes = Array.isArray(p.nodes) ? p.nodes : [];

    return (
      <div className="w-full h-full flex flex-col justify-between p-20 bg-slate-950 relative overflow-hidden select-none">
        {/* Fundo com linhas de grade tecnológica */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(to_right,#38bdf8_1px,transparent_1px),linear-gradient(to_bottom,#38bdf8_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Topo: Título e Identificador */}
        <div
          className="max-w-4xl space-y-4"
          style={{
            transform: `translateY(${(1 - titleS) * 30}px)`,
            opacity: titleS,
          }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-sky-500/30 bg-sky-950/60 text-sky-400 font-mono text-xs font-semibold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            {p.systemBadge}
          </div>

          <h1 className="text-5xl font-black text-white tracking-tight leading-tight">
            {p.architectureTitle}
          </h1>

          <p className="text-xl text-slate-300 font-normal leading-relaxed">
            {p.systemSubheading}
          </p>
        </div>

        {/* Pipeline Horizontal de Nós */}
        <div className="w-full flex items-center justify-between gap-4 my-auto pt-6">
          {nodes.map((node, idx) => {
            const nodeS = spring({
              frame: frame - 6 - idx * 7,
              fps,
              config: { damping: 14, mass: 0.9 },
            });

            return (
              <React.Fragment key={idx}>
                {/* Cartão do Nó */}
                <div
                  className="flex-1 p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl relative flex flex-col justify-between min-h-[160px]"
                  style={{
                    transform: `translateY(${(1 - nodeS) * 35}px) scale(${0.9 + nodeS * 0.1})`,
                    opacity: nodeS,
                    borderTop: `3px solid ${node.color || '#38bdf8'}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                      ESTÁGIO {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span
                      className="w-2.5 h-2.5 rounded-full shadow-lg"
                      style={{ backgroundColor: node.color || '#38bdf8' }}
                    />
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-white mb-1.5 tracking-tight">
                      {node.label}
                    </h4>
                    <p className="text-xs font-mono text-slate-400">
                      {node.sub}
                    </p>
                  </div>
                </div>

                {/* Conector / Seta entre nós */}
                {idx < nodes.length - 1 && (
                  <div
                    className="flex items-center justify-center text-slate-600 px-1"
                    style={{
                      opacity: Math.max(0, Math.min(1, nodeS)),
                      transform: `scale(${nodeS})`,
                    }}
                  >
                    <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Rodapé do Diagrama */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800/80 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>PIPELINE: {p.activePipelineName}</span>
          </div>
          <span>ESPAÇO CANÔNICO 1920 × 1080</span>
        </div>
      </div>
    );
  },
};

export default llmPipelineFlowTemplate;
