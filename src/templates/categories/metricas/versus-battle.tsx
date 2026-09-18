import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';

export const versusBattleTemplate: TemplateDefinition = {
  id: 'versus-battle',
  name: 'Batalha A vs B',
  category: 'Dados, Métricas & Encerramento',
  description: 'Confronto direto lado a lado entre duas abordagens tecnológicas rivais.',
  iconName: 'chart',
  defaultProps: {
    sideA: 'Open Source (Llama / Mistral)',
    sideB: 'Closed API (GPT-4 / Claude)',
    pointA: 'Privacidade total & Auto-hospedagem local sem envio de dados.',
    pointB: 'SOTA máximo em raciocínio & Zero complexidade operacional.',
  },
  schema: [
    { name: 'sideA', label: 'Lado A', type: 'text', defaultValue: 'Open Source' },
    { name: 'pointA', label: 'Destaque A', type: 'textarea', defaultValue: 'Privacidade total...' },
    { name: 'sideB', label: 'Lado B', type: 'text', defaultValue: 'Closed API' },
    { name: 'pointB', label: 'Destaque B', type: 'textarea', defaultValue: 'SOTA máximo...' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 4, fps });
    return (
      <div className="w-full h-full bg-slate-950 grid grid-cols-2 p-12 gap-8 items-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center font-black text-white text-xs font-mono">
          VS
        </div>
        <div
          className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center"
          style={{ transform: `scale(${s})`, opacity: s }}
        >
          <h3 className="text-xl font-bold text-cyan-400 mb-4">{props.sideA}</h3>
          <p className="text-sm text-slate-300">{props.pointA}</p>
        </div>
        <div
          className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center"
          style={{ transform: `scale(${s})`, opacity: s }}
        >
          <h3 className="text-xl font-bold text-purple-400 mb-4">{props.sideB}</h3>
          <p className="text-sm text-slate-300">{props.pointB}</p>
        </div>
      </div>
    );
  },
};

export default versusBattleTemplate;
