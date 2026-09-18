import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';

export const glossaryTermTemplate: TemplateDefinition = {
  id: 'glossary-term',
  name: 'Termo de Glossário',
  category: 'Conceitos & Explicações',
  description: 'Explicação detalhada com pronúncia e significado de jargões técnicos.',
  iconName: 'hero',
  defaultProps: {
    term: 'Temperature',
    phonetic: '/ˈtɛmp.rə.tʃər/',
    meaning:
      'Hiperparâmetro que calibra a aleatoriedade da distribuição de probabilidade na amostragem Softmax.',
  },
  schema: [
    { name: 'term', label: 'Termo / Jargão', type: 'text', defaultValue: 'Temperature' },
    { name: 'phonetic', label: 'Pronúncia / Guia', type: 'text', defaultValue: '/ˈtɛmp.rə.tʃər/' },
    { name: 'meaning', label: 'Significado', type: 'textarea', defaultValue: 'Hiperparâmetro que calibra...' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 4, fps });
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-14">
        <div
          className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-10"
          style={{ transform: `scale(${s})`, opacity: s }}
        >
          <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
            GLOSSÁRIO TÉCNICO
          </span>
          <h2 className="text-4xl font-extrabold text-white mt-2 mb-1">{props.term}</h2>
          <span className="text-sm font-mono text-slate-500 italic block mb-6">{props.phonetic}</span>
          <p className="text-lg text-slate-300 leading-relaxed border-t border-slate-800 pt-6">
            {props.meaning}
          </p>
        </div>
      </div>
    );
  },
};

export default glossaryTermTemplate;
