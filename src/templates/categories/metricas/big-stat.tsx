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
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-14 text-center">
        <div style={{ transform: `scale(${s})`, opacity: s }}>
          <div className="text-8xl font-black bg-gradient-to-r from-indigo-400 to-pink-500 bg-clip-text text-transparent mb-2">
            {props.percentage}
          </div>
          <h3 className="text-2xl font-bold text-white">{props.label}</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mt-2">{props.description}</p>
        </div>
      </div>
    );
  },
};

export default bigStatTemplate;
