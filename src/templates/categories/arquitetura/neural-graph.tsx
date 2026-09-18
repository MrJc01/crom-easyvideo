import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';

export const neuralGraphTemplate: TemplateDefinition = {
  id: 'neural-graph',
  name: 'Grafo Sináptico',
  category: 'Arquitetura & IA',
  description: 'Nós neurais interconectados demonstrando ativação de tensores.',
  iconName: 'cpu',
  defaultProps: {
    caption: 'Interconexão de Parâmetros e Pesos Sinápticos',
    layersInfo: 'Entrada -> Hidden Layers -> Saída Probabilística',
  },
  schema: [
    { name: 'caption', label: 'Legenda', type: 'text', defaultValue: 'Interconexão de Parâmetros...' },
    { name: 'layersInfo', label: 'Descrição de Camadas', type: 'text', defaultValue: 'Entrada -> Hidden...' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame, fps });
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-10 relative">
        <div className="text-center mb-6" style={{ opacity: s }}>
          <h3 className="text-2xl font-bold text-white">{props.caption}</h3>
          <span className="text-xs font-mono text-indigo-400">{props.layersInfo}</span>
        </div>
        <div className="flex gap-12 items-center">
          {[4, 6, 6, 4].map((nodesCount, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-3">
              {Array.from({ length: nodesCount }).map((_, nodeIdx) => (
                <div
                  key={nodeIdx}
                  className={`w-5 h-5 rounded-full border ${
                    (colIdx + nodeIdx + Math.floor(frame / 10)) % 3 === 0
                      ? 'bg-indigo-500 border-indigo-300 shadow-lg shadow-indigo-500/50'
                      : 'bg-slate-800 border-slate-700'
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  },
};

export default neuralGraphTemplate;
