import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';

export const systemArchitectureTemplate: TemplateDefinition = {
  id: 'system-architecture',
  name: 'Arquitetura RAG & LLM',
  category: 'Arquitetura & IA',
  description: 'Visão macro de integração entre Banco Vetorial, Modelo LLM e Saída.',
  iconName: 'layers',
  defaultProps: {
    client: 'Usuário (Prompt)',
    vectorDb: 'Vector Store (Chroma / Pinecone)',
    llm: 'Fundação LLM (Claude / GPT)',
    output: 'Resposta Grounded',
  },
  schema: [
    { name: 'client', label: 'Origem', type: 'text', defaultValue: 'Usuário (Prompt)' },
    { name: 'vectorDb', label: 'Banco Vetorial', type: 'text', defaultValue: 'Vector Store' },
    { name: 'llm', label: 'Modelo LLM', type: 'text', defaultValue: 'Fundação LLM' },
    { name: 'output', label: 'Saída Grounded', type: 'text', defaultValue: 'Resposta Grounded' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame, fps });
    const badge = props.badge || 'PIPELINE DE ARQUITETURA';
    const title = props.title || null;
    const subtitle = props.subtitle || null;
    const nodes = Array.isArray(props.nodes) ? props.nodes : null;
    const accentColor = props.accentColor || '#a855f7';

    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="max-w-4xl w-full text-center" style={{ opacity: s }}>
          <span
            className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase mb-3 inline-block border"
            style={{
              backgroundColor: `${accentColor}26`,
              color: accentColor,
              borderColor: `${accentColor}4d`,
            }}
          >
            {badge}
          </span>
          {title && (
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 leading-tight">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed font-sans">
              {subtitle}
            </p>
          )}

          {nodes ? (
            <div className="grid grid-cols-3 gap-4 items-stretch mt-2">
              {nodes.map((node: any, idx: number) => {
                const isHighlighted = node.highlight;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border flex flex-col justify-center shadow-xl transition relative"
                    style={{
                      backgroundColor: isHighlighted ? `${accentColor}18` : '#0f172a',
                      borderColor: isHighlighted ? `${accentColor}80` : '#1e293b',
                    }}
                  >
                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">
                      Etapa 0{idx + 1}
                    </div>
                    <span
                      className="font-mono text-base font-black"
                      style={{ color: isHighlighted ? accentColor : '#ffffff' }}
                    >
                      {node.name}
                    </span>
                    {node.status && (
                      <span className="text-xs text-slate-300 font-sans mt-2 leading-snug">
                        {node.status}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4 items-center mt-4">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white">
                {props.client}
              </div>
              <div className="p-4 bg-purple-950/30 border border-purple-800/40 rounded-xl text-xs font-bold text-purple-300">
                {props.vectorDb}
              </div>
              <div className="p-4 bg-indigo-950/30 border border-indigo-800/40 rounded-xl text-xs font-bold text-indigo-300">
                {props.llm}
              </div>
              <div className="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs font-bold text-emerald-300">
                {props.output}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
};

export default systemArchitectureTemplate;
