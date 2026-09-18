import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';

export const beforeAfterMediaTemplate: TemplateDefinition = {
  id: 'before-after-media',
  name: 'Comparativo Antes vs Depois',
  category: 'Mídia & Demonstração',
  description: 'Compara duas imagens ou fluxos com etiquetas personalizadas.',
  iconName: 'video',
  defaultProps: {
    title: 'Transformação de Dados',
    labelBefore: 'Entrada Bruta (Texto Desestruturado)',
    labelAfter: 'Saída Estruturada (JSON / Ações)',
    beforeText: 'Logs e relatórios manuais de 100 páginas sem índice.',
    afterText: 'Extração automática em schema estrito em menos de 2 segundos.',
  },
  schema: [
    { name: 'title', label: 'Título', type: 'text', defaultValue: 'Transformação de Dados' },
    { name: 'labelBefore', label: 'Rótulo Antes', type: 'text', defaultValue: 'Entrada Bruta' },
    { name: 'beforeText', label: 'Descrição Antes', type: 'textarea', defaultValue: 'Logs e relatórios...' },
    { name: 'labelAfter', label: 'Rótulo Depois', type: 'text', defaultValue: 'Saída Estruturada' },
    { name: 'afterText', label: 'Descrição Depois', type: 'textarea', defaultValue: 'Extração automática...' },
  ],
  Component: ({ props, frame, fps }) => {
    const s1 = spring({ frame: frame - 4, fps });
    const s2 = spring({ frame: frame - 10, fps });
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-12">
        <h2 className="text-3xl font-extrabold text-white mb-8">{props.title}</h2>
        <div className="grid grid-cols-2 gap-8 max-w-4xl w-full">
          <div
            className="bg-rose-950/20 border border-rose-800/40 rounded-2xl p-6"
            style={{ transform: `scale(${s1})`, opacity: s1 }}
          >
            <span className="text-xs font-mono text-rose-400 font-bold uppercase block mb-3">
              {props.labelBefore}
            </span>
            <p className="text-sm text-slate-300">{props.beforeText}</p>
          </div>
          <div
            className="bg-emerald-950/20 border border-emerald-800/40 rounded-2xl p-6"
            style={{ transform: `scale(${s2})`, opacity: s2 }}
          >
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase block mb-3">
              {props.labelAfter}
            </span>
            <p className="text-sm text-slate-300">{props.afterText}</p>
          </div>
        </div>
      </div>
    );
  },
};

export default beforeAfterMediaTemplate;
