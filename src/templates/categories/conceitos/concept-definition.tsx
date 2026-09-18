import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';

export const conceptDefinitionTemplate: TemplateDefinition = {
  id: 'concept-definition',
  name: 'Definição & Tópicos Modulares',
  category: 'Conceitos & Explicações',
  description:
    'Definição conceitual com lista dinâmica de tópicos (adicionar e remover itens dinamicamente).',
  iconName: 'layers',
  defaultProps: {
    showTag: true,
    tag: 'CONCEITO FUNDAMENTAL',
    conceptTitle: 'O que é um LLM?',
    statement:
      'Um Large Language Model é uma rede neural artificial profunda treinada para capturar padrões probabilísticos na linguagem humana.',
    bulletPoints: [
      'Modelos treinados em terabytes de dados da internet',
      'Predizem a próxima palavra com base em contexto estatístico',
      'Base da arquitetura Transformer lançada em 2017',
    ],
  },
  schema: [
    { name: 'showTag', label: 'Exibir Tag', type: 'toggle', defaultValue: true },
    { name: 'tag', label: 'Tag Superior', type: 'text', defaultValue: 'CONCEITO FUNDAMENTAL' },
    { name: 'conceptTitle', label: 'Título do Conceito', type: 'text', defaultValue: 'O que é um LLM?' },
    { name: 'statement', label: 'Declaração Principal', type: 'textarea', defaultValue: 'Um Large Language Model...' },
    {
      name: 'bulletPoints',
      label: 'Tópicos Dinâmicos (Adicionar/Remover)',
      type: 'array',
      itemLabel: 'Tópico Explicativo',
      itemDefaultValue: 'Novo ponto conceitual',
      defaultValue: ['Ponto 1', 'Ponto 2', 'Ponto 3'],
    },
  ],
  Component: ({ props, frame, fps }) => {
    const cardS = spring({ frame: frame - 3, fps });
    const points = Array.isArray(props.bulletPoints) ? props.bulletPoints : [];
    const title = props.conceptTitle || props.term || props.title || 'Conceito';
    const statement = props.statement || props.definition || '';
    const tag = props.tag || props.category || props.badge || null;
    const accentColor = props.accentColor || '#06b6d4';

    return (
      <div
        className="w-full h-full bg-slate-950 flex flex-col justify-center items-center relative overflow-hidden select-none"
        style={{
          padding: 'var(--safe-top, 80px) var(--safe-right, 100px) var(--safe-bottom, 80px) var(--safe-left, 100px)',
          background: `radial-gradient(circle at 50% 50%, ${accentColor}14 0%, #030712 85%)`,
        }}
      >
        <div
          className="max-w-5xl w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl"
          style={{ transform: `scale(${cardS})`, opacity: cardS }}
        >
          <div className="mb-4">
            {tag && (
              <span
                className="font-mono uppercase tracking-widest font-bold block mb-1"
                style={{
                  fontSize: 'var(--font-badge, 18px)',
                  color: accentColor,
                }}
              >
                {tag}
              </span>
            )}
            <h2
              className="font-extrabold text-white tracking-tight mt-1 leading-tight"
              style={{ fontSize: 'var(--font-title, 50px)' }}
            >
              {title}
            </h2>
          </div>
          {statement && (
            <p
              className="text-slate-200 leading-relaxed mb-6 border-l-4 pl-5 bg-slate-800/40 py-3.5 rounded-r-xl font-normal"
              style={{
                fontSize: 'var(--font-body, 25px)',
                borderColor: accentColor,
              }}
            >
              {statement}
            </p>
          )}
          {points.length > 0 && (
            <div className="space-y-3">
              {points.map((pt: string, idx: number) => {
                const itemS = spring({ frame: frame - 10 - idx * 5, fps });
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-100 font-medium"
                    style={{
                      fontSize: 'var(--font-item, 22px)',
                      transform: `translateX(${(1 - itemS) * 30}px)`,
                      opacity: itemS,
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center font-bold shrink-0 mt-0.5"
                      style={{
                        backgroundColor: `${accentColor}26`,
                        color: accentColor,
                        fontSize: '13px',
                      }}
                    >
                      {idx + 1}
                    </div>
                    <span>{pt}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  },
};

export default conceptDefinitionTemplate;
