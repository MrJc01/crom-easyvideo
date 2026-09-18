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
    const badge = props.badge || 'TOPOLOGIA NEURAL';
    const title = props.title || props.caption || 'Interconexão Sináptica';
    const layersInfo = props.layersInfo || props.subtitle || '';
    const accentColor = props.accentColor || '#6366f1';
    const activeNodes = props.activeNodes || null;
    const latency = props.latency || null;

    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-10 relative overflow-hidden">
        <div className="text-center mb-8 max-w-xl" style={{ opacity: s }}>
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
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 leading-tight">{title}</h3>
          {layersInfo && (
            <span className="text-xs font-mono text-slate-400 block">{layersInfo}</span>
          )}

          {(activeNodes || latency) && (
            <div className="flex items-center justify-center gap-4 mt-4 font-mono text-xs">
              {activeNodes && (
                <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-white font-semibold">
                  ⚡ {activeNodes}
                </span>
              )}
              {latency && (
                <span
                  className="px-3 py-1 rounded-lg border font-semibold"
                  style={{
                    backgroundColor: `${accentColor}1a`,
                    color: accentColor,
                    borderColor: `${accentColor}40`,
                  }}
                >
                  ⏱️ {latency}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-12 items-center">
          {[4, 6, 6, 4].map((nodesCount, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-3">
              {Array.from({ length: nodesCount }).map((_, nodeIdx) => (
                <div
                  key={nodeIdx}
                  className={`w-6 h-6 rounded-full border transition-all duration-300 ${
                    (colIdx + nodeIdx + Math.floor(frame / 8)) % 3 === 0
                      ? 'shadow-lg'
                      : 'bg-slate-800/80 border-slate-700'
                  }`}
                  style={
                    (colIdx + nodeIdx + Math.floor(frame / 8)) % 3 === 0
                      ? {
                          backgroundColor: accentColor,
                          borderColor: '#ffffff',
                          boxShadow: `0 0 15px ${accentColor}80`,
                        }
                      : {}
                  }
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
