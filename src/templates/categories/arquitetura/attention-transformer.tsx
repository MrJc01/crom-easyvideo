import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';

export const attentionTransformerTemplate: TemplateDefinition = {
  id: 'attention-transformer',
  name: 'Mecanismo de Atenção',
  category: 'Arquitetura & IA',
  description: 'Visualização de conexões e pesos matemáticos de autoatenção entre palavras.',
  iconName: 'layers',
  defaultProps: {
    title: 'Mecanismo de Atenção (Transformers)',
    description: 'A palavra "cansado" calcula pesos matemáticos para relacionar-se com o sujeito "animal".',
    showFormula: true,
  },
  schema: [
    { name: 'title', label: 'Título', type: 'text', defaultValue: 'Mecanismo de Atenção' },
    { name: 'description', label: 'Descrição da Regra', type: 'textarea', defaultValue: 'A palavra calcula pesos...' },
    { name: 'showFormula', label: 'Exibir Fórmula Softmax', type: 'toggle', defaultValue: true },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame, fps });
    const words = ['O', 'animal', 'não', 'atravessou', 'a', 'rua', 'porque', 'estava', 'cansado'];
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-10 overflow-y-auto">
        <div className="max-w-4xl w-full text-center" style={{ opacity: s }}>
          <span className="text-[10px] sm:text-xs font-mono text-violet-400 uppercase tracking-wider bg-violet-500/10 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-violet-500/30">
            SELF-ATTENTION LAYER
          </span>
          <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-white mt-2 sm:mt-3 mb-1 sm:mb-2">{props.title}</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mb-4 sm:mb-8">{props.description}</p>
          <div className="bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-6 relative">
            <div className="flex justify-between items-center relative z-10 overflow-x-auto pb-2 gap-2 scrollbar-thin">
              {words.map((w, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col items-center shrink-0 ${
                    idx === 1
                      ? 'text-violet-400 font-bold'
                      : idx === 8
                      ? 'text-pink-400 font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-mono mb-1 border ${
                      idx === 1 || idx === 8
                        ? 'bg-violet-500/20 border-violet-400'
                        : 'bg-slate-800 border-slate-700'
                    }`}
                  >
                    q{idx}
                  </div>
                  <span className="text-[10px] sm:text-xs">{w}</span>
                </div>
              ))}
            </div>
            {props.showFormula && (
              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-800 text-[10px] sm:text-xs font-mono text-slate-400 flex justify-around flex-wrap gap-2">
                <span>Q: Query</span>
                <span>K: Key</span>
                <span>V: Value</span>
                <span className="text-violet-300">Softmax(QKᵀ / √d) × V</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
};

export default attentionTransformerTemplate;
