import React from 'react';
import type { TemplateDefinition } from '../../../core/types';

export const prosConsModularTemplate: TemplateDefinition = {
  id: 'pros-cons-modular',
  name: 'Vantagens & Desvantagens',
  category: 'Dados, Métricas & Encerramento',
  description: 'Listas dinâmicas de prós e contras com suporte a adição e remoção.',
  iconName: 'chart',
  defaultProps: {
    pros: ['Altíssima velocidade', 'Sem custos de API por requisição', 'Customização total de pesos'],
    cons: ['Exige GPU de ponta com alta VRAM', 'Alucinações possíveis', 'Manutenção contínua de servidor'],
  },
  schema: [
    {
      name: 'pros',
      label: 'Vantagens (Prós)',
      type: 'array',
      itemLabel: 'Vantagem',
      itemDefaultValue: 'Nova vantagem técnica',
      defaultValue: ['Vantagem 1', 'Vantagem 2'],
    },
    {
      name: 'cons',
      label: 'Desvantagens (Contras)',
      type: 'array',
      itemLabel: 'Desvantagem',
      itemDefaultValue: 'Nova desvantagem técnica',
      defaultValue: ['Desvantagem 1', 'Desvantagem 2'],
    },
  ],
  Component: ({ props }) => {
    const pros = Array.isArray(props.pros) ? props.pros : [];
    const cons = Array.isArray(props.cons) ? props.cons : [];
    return (
      <div className="w-full h-full bg-slate-950 grid grid-cols-2 p-12 gap-8 items-center">
        <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-2xl p-6">
          <span className="text-xs font-mono text-emerald-400 font-bold uppercase block mb-4">
            VANTAGENS (+)
          </span>
          <div className="space-y-2">
            {pros.map((p: string, i: number) => (
              <div key={i} className="text-xs text-emerald-200 flex items-center gap-2">
                <span className="text-emerald-400 font-bold">+</span> {p}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-rose-950/20 border border-rose-800/40 rounded-2xl p-6">
          <span className="text-xs font-mono text-rose-400 font-bold uppercase block mb-4">
            DESVANTAGENS (-)
          </span>
          <div className="space-y-2">
            {cons.map((c: string, i: number) => (
              <div key={i} className="text-xs text-rose-200 flex items-center gap-2">
                <span className="text-rose-400 font-bold">-</span> {c}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
};

export default prosConsModularTemplate;
