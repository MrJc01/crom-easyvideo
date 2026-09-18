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
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-12">
        <div className="max-w-4xl w-full text-center" style={{ opacity: s }}>
          <span className="text-xs font-mono text-purple-400 uppercase tracking-wider block mb-4">
            SISTEMA RAG (RETRIEVAL AUGMENTED GENERATION)
          </span>
          <div className="grid grid-cols-4 gap-4 items-center">
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
        </div>
      </div>
    );
  },
};

export default systemArchitectureTemplate;
