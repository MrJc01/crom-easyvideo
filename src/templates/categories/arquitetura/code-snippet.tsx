import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';

export const codeSnippetTemplate: TemplateDefinition = {
  id: 'code-snippet',
  name: 'Código PyTorch / Algoritmo',
  category: 'Arquitetura & IA',
  description: 'Bloco de código com sintaxe destacada, badge explicativo e rodapé analítico.',
  iconName: 'code',
  defaultProps: {
    badge: 'ALGORITMO & CÓDIGO',
    filename: 'transformer.py',
    language: 'python',
    code: 'class SelfAttention(nn.Module):\n  def forward(self, x):\n    scores = q @ k.transpose(-2, -1) / sqrt(d)\n    return softmax(scores) @ v',
    explanation: 'Mecanismo de auto-atenção projetando matrizes Query, Key e Value para correlação contextual.',
    accentColor: '#38bdf8',
  },
  schema: [
    { name: 'badge', label: 'Badge Superior', type: 'text', defaultValue: 'ALGORITMO & CÓDIGO' },
    { name: 'filename', label: 'Nome do Arquivo', type: 'text', defaultValue: 'transformer.py' },
    { name: 'language', label: 'Linguagem', type: 'text', defaultValue: 'python' },
    { name: 'code', label: 'Código', type: 'textarea', defaultValue: 'class SelfAttention...' },
    { name: 'explanation', label: 'Explicação do Código', type: 'textarea', defaultValue: 'Mecanismo de auto-atenção...' },
    { name: 'accentColor', label: 'Cor de Destaque', type: 'color', defaultValue: '#38bdf8' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 2, fps, config: { damping: 16, mass: 0.9 } });
    const codeS = spring({ frame: frame - 6, fps, config: { damping: 15, mass: 1 } });
    const expS = spring({ frame: frame - 12, fps, config: { damping: 15, mass: 1 } });

    const badgeText = props.badge || 'CÓDIGO & IMPLEMENTAÇÃO';
    const accent = props.accentColor || '#38bdf8';
    const filename = props.filename || (props.language ? `script.${props.language === 'python' ? 'py' : 'ts'}` : 'algorithm.py');
    const codeLines = (props.code || '').split('\n');

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
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 40%, ${accent} 0%, transparent 60%)`,
          }}
        />

        {/* Topo: Badge */}
        <div
          className="flex items-center justify-between shrink-0"
          style={{ transform: `translateY(${(1 - s) * -15}px)`, opacity: s }}
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border font-mono uppercase tracking-widest font-bold"
            style={{
              borderColor: `${accent}40`,
              backgroundColor: `${accent}15`,
              color: accent,
              fontSize: 'var(--font-badge, 18px)',
            }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accent }} />
            {badgeText}
          </div>
          <span
            className="font-mono text-slate-500 uppercase tracking-wider font-semibold"
            style={{ fontSize: 'var(--font-footer, 16px)' }}
          >
            {props.language || 'python'}
          </span>
        </div>

        {/* Editor de Código Estilizado */}
        <div
          className="w-full my-auto rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-md flex flex-col"
          style={{
            transform: `scale(${0.95 + codeS * 0.05})`,
            opacity: codeS,
            borderTopColor: accent,
            borderTopWidth: '3px',
          }}
        >
          {/* Header da Janela IDE */}
          <div className="bg-slate-950/80 px-5 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span className="font-mono text-slate-300 font-semibold" style={{ fontSize: 'var(--font-item, 20px)' }}>
                {filename}
              </span>
            </div>
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
          </div>

          {/* Conteúdo com Linhas Numeradas */}
          <div className="p-6 font-mono leading-relaxed overflow-x-auto">
            {codeLines.map((line: string, i: number) => (
              <div key={i} className="flex items-start gap-4">
                <span className="text-slate-600 select-none text-right w-6 shrink-0 font-mono text-sm pt-1">
                  {i + 1}
                </span>
                <span
                  className="whitespace-pre font-mono font-medium"
                  style={{
                    fontSize: 'var(--font-code, 22px)',
                    lineHeight: '1.6',
                    color: line.trim().startsWith('#')
                      ? '#94a3b8'
                      : line.includes('=') || line.includes('def') || line.includes('class')
                      ? '#38bdf8'
                      : '#34d399',
                  }}
                >
                  {line}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Rodapé: Explicação Conceitual (se houver) */}
        {props.explanation && (
          <div
            className="p-5 rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md shrink-0 flex items-start gap-4"
            style={{
              transform: `translateY(${(1 - expS) * 20}px)`,
              opacity: expS,
            }}
          >
            <div
              className="w-2 h-2 rounded-full mt-2.5 shrink-0"
              style={{ backgroundColor: accent }}
            />
            <p
              className="text-slate-200 font-normal leading-relaxed"
              style={{ fontSize: 'var(--font-body, 25px)' }}
            >
              {props.explanation}
            </p>
          </div>
        )}
      </div>
    );
  },
};

export default codeSnippetTemplate;
