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
    const badge = props.badge || 'ARQUITETURA DE CAMADAS';
    const title = props.title || null;
    const subtitle = props.subtitle || null;
    const layers = Array.isArray(props.layers) ? props.layers : null;

    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-10 relative overflow-hidden">
        <div className="max-w-2xl w-full text-center" style={{ opacity: s }}>
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block mb-2 font-bold">
            {badge}
          </span>
          {title && (
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 leading-tight">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mb-6 leading-relaxed">
              {subtitle}
            </p>
          )}

          {layers ? (
            <div className="space-y-3 mt-4 text-left">
              {layers.map((l: any, idx: number) => {
                const color = l.color || '#38bdf8';
                return (
                  <div
                    key={idx}
                    className="p-3.5 sm:p-4 rounded-xl border flex flex-col justify-center shadow-lg transition"
                    style={{
                      backgroundColor: `${color}14`,
                      borderColor: `${color}40`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm sm:text-base font-bold text-white">
                        {l.name}
                      </span>
                      <span
                        className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border"
                        style={{
                          backgroundColor: `${color}20`,
                          color: color,
                          borderColor: `${color}40`,
                        }}
                      >
                        Camada {idx + 1}
                      </span>
                    </div>
                    {l.detail && (
                      <span className="text-xs text-slate-300 font-sans mt-1">
                        {l.detail}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3 mt-4">
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40 text-cyan-300 font-mono text-sm font-bold shadow-lg">
                {props.layerA}
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs">
                {props.layerB}
              </div>
              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/40 text-indigo-300 font-mono text-sm font-bold shadow-lg">
                {props.layerC}
              </div>
              {props.stackCount && (
                <span className="text-xs font-mono text-slate-500 mt-6 block uppercase tracking-wider">
                  ▲ {props.stackCount} ▲
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  },
};

export default layerStackTemplate;
