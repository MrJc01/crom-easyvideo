import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';

export const codeSnippetTemplate: TemplateDefinition = {
  id: 'code-snippet',
  name: 'Código PyTorch / API',
  category: 'Arquitetura & IA',
  description: 'Bloco de código de sintaxe para demonstrar algoritmos ou chamadas de API.',
  iconName: 'code',
  defaultProps: {
    filename: 'transformer.py',
    code: 'class SelfAttention(nn.Module):\n  def forward(self, x):\n    scores = q @ k.transpose(-2, -1) / sqrt(d)\n    return softmax(scores) @ v',
  },
  schema: [
    { name: 'filename', label: 'Nome do Arquivo', type: 'text', defaultValue: 'transformer.py' },
    { name: 'code', label: 'Código', type: 'textarea', defaultValue: 'class SelfAttention...' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 4, fps });
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-12">
        <div
          className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
          style={{ transform: `scale(${s})`, opacity: s }}
        >
          <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono text-indigo-300">{props.filename}</span>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>
          </div>
          <pre className="p-6 font-mono text-xs text-emerald-400 leading-relaxed overflow-x-auto whitespace-pre-wrap">
            {props.code}
          </pre>
        </div>
      </div>
    );
  },
};

export default codeSnippetTemplate;
