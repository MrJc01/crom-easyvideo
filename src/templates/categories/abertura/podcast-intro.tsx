import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';

export const podcastIntroTemplate: TemplateDefinition = {
  id: 'podcast-intro',
  name: 'Banner Podcast / Talk',
  category: 'Abertura & Título',
  description: 'Visual moderno para abertura de podcasts e entrevistas técnicas.',
  iconName: 'film',
  defaultProps: {
    episode: 'EPISÓDIO 42',
    topic: 'Como a Inteligência Artificial Conquistou a Linguagem',
    host: 'Apresentado por IA Studio',
  },
  schema: [
    { name: 'episode', label: 'Tag / Episódio', type: 'text', defaultValue: 'EPISÓDIO 42' },
    { name: 'topic', label: 'Tema Principal', type: 'textarea', defaultValue: 'Como a Inteligência Artificial...' },
    { name: 'host', label: 'Apresentador', type: 'text', defaultValue: 'Apresentado por IA Studio' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 5, fps });
    return (
      <div className="w-full h-full bg-slate-950 flex items-center justify-center p-14 relative">
        <div
          className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-10 shadow-2xl text-center"
          style={{ transform: `scale(${s})`, opacity: s }}
        >
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono text-xs font-bold uppercase">
            {props.episode}
          </span>
          <h2 className="text-4xl font-extrabold text-white mt-6 mb-6 leading-tight">
            {props.topic}
          </h2>
          <span className="text-xs font-mono text-slate-400 tracking-wider uppercase">
            {props.host}
          </span>
        </div>
      </div>
    );
  },
};

export default podcastIntroTemplate;
