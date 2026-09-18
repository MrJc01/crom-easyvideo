import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';

export const keyTakeawaysTemplate: TemplateDefinition = {
  id: 'key-takeaways',
  name: 'Conclusão Chave',
  category: 'Dados, Métricas & Encerramento',
  description: 'Destaque de uma única grande mensagem definitiva para finalizar.',
  iconName: 'hero',
  defaultProps: {
    badge: 'CONCLUSÃO FINAL',
    takeaway: 'O segredo não é mágica: é matemática vetorial, dados e poder computacional massivo.',
  },
  schema: [
    { name: 'badge', label: 'Badge Superior', type: 'text', defaultValue: 'CONCLUSÃO FINAL' },
    { name: 'takeaway', label: 'Mensagem Central', type: 'textarea', defaultValue: 'O segredo não é mágica...' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 4, fps });
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-14 text-center">
        <div className="max-w-3xl" style={{ transform: `scale(${s})`, opacity: s }}>
          <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-mono font-bold uppercase mb-6 inline-block">
            {props.badge}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-relaxed">
            {props.takeaway}
          </h2>
        </div>
      </div>
    );
  },
};

export default keyTakeawaysTemplate;
