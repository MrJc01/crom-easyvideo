import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';

export const layerStackTemplate: TemplateDefinition = {
  id: 'layer-stack',
  name: 'Pilha de Camadas',
  category: 'Arquitetura & IA',
  description: 'Representação de camadas profundas empilhadas com indicação de blocos.',
  iconName: 'layers',
  defaultProps: {
    stackCount: '96 Camadas Repetidas',
    layerA: 'Multi-Head Self Attention',
    layerB: 'Add & Layer Normalization',
    layerC: 'Feed Forward Neural Network',
  },
  schema: [
    { name: 'stackCount', label: 'Repetições', type: 'text', defaultValue: '96 Camadas Repetidas' },
    { name: 'layerA', label: 'Camada Superior', type: 'text', defaultValue: 'Multi-Head Self Attention' },
    { name: 'layerB', label: 'Camada do Meio', type: 'text', defaultValue: 'Add & Layer Normalization' },
    { name: 'layerC', label: 'Camada Inferior', type: 'text', defaultValue: 'Feed Forward Neural Network' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 4, fps });
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-12">
        <div className="max-w-xl w-full text-center" style={{ opacity: s }}>
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block mb-4">
            BLOCOS RECORRENTES (N×)
          </span>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40 text-cyan-300 font-mono text-sm font-bold shadow-lg">
              {props.layerA}
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs">
              {props.layerB}
            </div>
            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/40 text-indigo-300 font-mono text-sm font-bold shadow-lg">
              {props.layerC}
            </div>
          </div>
          <span className="text-xs font-mono text-slate-500 mt-6 block uppercase tracking-wider">
            ▲ {props.stackCount} ▲
          </span>
        </div>
      </div>
    );
  },
};

export default layerStackTemplate;
