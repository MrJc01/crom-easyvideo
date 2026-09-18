import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';

export const bigStatTemplate: TemplateDefinition = {
  id: 'big-stat',
  name: 'Estatística Numérica Central',
  category: 'Dados, Métricas & Encerramento',
  description: 'Destaque visual para um percentual ou número expressivo de benchmark.',
  iconName: 'chart',
  defaultProps: {
    percentage: '92.4%',
    label: 'Acurácia MMLU',
    description: 'Capacidade em testes acadêmicos de nível de pós-graduação.',
  },
  schema: [
    { name: 'percentage', label: 'Valor / Porcentagem', type: 'text', defaultValue: '92.4%' },
    { name: 'label', label: 'Rótulo da Métrica', type: 'text', defaultValue: 'Acurácia MMLU' },
    { name: 'description', label: 'Explicação Curta', type: 'textarea', defaultValue: 'Capacidade em testes...' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 4, fps });
    const statValue = props.number || props.percentage || '100%';
    const label = props.label || '';
    const description = props.sublabel || props.description || '';
    const badge = props.badge || null;
    const accentColor = props.accentColor || '#6366f1';

    return (
      <div
        className="w-full h-full bg-slate-950 flex flex-col justify-center items-center text-center relative overflow-hidden select-none"
        style={{
          padding: 'var(--safe-top, 80px) var(--safe-right, 100px) var(--safe-bottom, 80px) var(--safe-left, 100px)',
          background: `radial-gradient(circle at 50% 50%, ${accentColor}18 0%, #030712 80%)`,
        }}
      >
        <div className="max-w-4xl w-full flex flex-col items-center justify-center" style={{ transform: `scale(${s})`, opacity: s }}>
          {badge && (
            <span
              className="px-4 py-1.5 rounded-full font-mono font-bold uppercase mb-4 inline-block border"
              style={{
                fontSize: 'var(--font-badge, 18px)',
                backgroundColor: `${accentColor}26`,
                color: accentColor,
                borderColor: `${accentColor}4d`,
              }}
            >
              {badge}
            </span>
          )}
          <div
            className="font-black tracking-tight leading-none mb-4 font-mono drop-shadow-2xl"
            style={{
              fontSize: 'var(--font-mega, 140px)',
              background: `linear-gradient(135deg, #ffffff 30%, ${accentColor} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {statValue}
          </div>
          <h3
            className="font-extrabold text-white leading-tight mb-3"
            style={{ fontSize: 'var(--font-subtitle, 34px)' }}
          >
            {label}
          </h3>
          {description && (
            <p
              className="text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal"
              style={{ fontSize: 'var(--font-body, 25px)' }}
            >
              {description}
            </p>
          )}
        </div>
      </div>
    );
  },
};

export default bigStatTemplate;
