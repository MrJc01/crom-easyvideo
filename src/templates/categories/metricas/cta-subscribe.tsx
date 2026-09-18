import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';

export const ctaSubscribeTemplate: TemplateDefinition = {
  id: 'cta-subscribe',
  name: 'Chamada para Ação (CTA)',
  category: 'Dados, Métricas & Encerramento',
  description: 'Card final com convite para inscrição, comunidade ou link de download.',
  iconName: 'hero',
  defaultProps: {
    action: 'Gostou da Explicação?',
    subtext: 'Inscreva-se no canal para mais análises profundas de Engenharia de IA.',
    channel: '@CanalTechAI',
  },
  schema: [
    { name: 'action', label: 'Ação Desejada', type: 'text', defaultValue: 'Gostou da Explicação?' },
    { name: 'subtext', label: 'Instrução', type: 'textarea', defaultValue: 'Inscreva-se no canal...' },
    { name: 'channel', label: 'Canal / Nome', type: 'text', defaultValue: '@CanalTechAI' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 4, fps });
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-14 text-center">
        <div
          className="max-w-xl w-full bg-gradient-to-b from-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-3xl p-10 shadow-2xl"
          style={{ transform: `scale(${s})`, opacity: s }}
        >
          <h2 className="text-3xl font-black text-white mb-3">{props.action}</h2>
          <p className="text-sm text-slate-300 mb-6">{props.subtext}</p>
          <span className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs tracking-wider uppercase font-mono shadow-lg">
            {props.channel}
          </span>
        </div>
      </div>
    );
  },
};

export default ctaSubscribeTemplate;
