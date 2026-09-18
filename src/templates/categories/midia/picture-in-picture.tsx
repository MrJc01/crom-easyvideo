import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';
import { MediaRenderer } from '../../../remotion/MediaRenderer';

export const pictureInPictureTemplate: TemplateDefinition = {
  id: 'picture-in-picture',
  name: 'Picture-in-Picture (PiP)',
  category: 'Mídia & Demonstração',
  description: 'Layout para reação ou demonstração com janela flutuante recortada.',
  iconName: 'video',
  defaultProps: {
    mainTitle: 'Arquitetura Multimodal',
    explanation: 'Modelos de linguagem agora integram fluxos de vídeo ao vivo com raciocínio contextual.',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
      trimStart: 0,
      trimEnd: 4,
      objectFit: 'cover',
    },
    pipLabel: 'Câmera / Demonstração',
  },
  schema: [
    { name: 'mainTitle', label: 'Título Principal', type: 'text', defaultValue: 'Arquitetura Multimodal' },
    { name: 'explanation', label: 'Explicação', type: 'textarea', defaultValue: 'Modelos de linguagem...' },
    { name: 'pipLabel', label: 'Etiqueta da Janela PiP', type: 'text', defaultValue: 'Câmera / Demonstração' },
    { name: 'media', label: 'Mídia Flutuante (PiP)', type: 'media', defaultValue: null },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 4, fps });
    const pipS = spring({ frame: frame - 10, fps });
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-start p-16 relative">
        <div className="max-w-2xl" style={{ opacity: s }}>
          <h2 className="text-4xl font-extrabold text-white mb-4">{props.mainTitle}</h2>
          <p className="text-base text-slate-300 leading-relaxed">{props.explanation}</p>
        </div>
        <div
          className="absolute bottom-10 right-10 w-72 h-44 bg-slate-900 border-2 border-indigo-500 rounded-2xl shadow-2xl overflow-hidden"
          style={{ transform: `scale(${pipS})`, opacity: pipS }}
        >
          <div className="absolute top-2 left-2 z-10 bg-black/80 px-2 py-0.5 rounded text-[9px] font-mono text-indigo-300">
            {props.pipLabel}
          </div>
          <MediaRenderer media={props.media} frame={frame} fps={fps} />
        </div>
      </div>
    );
  },
};

export default pictureInPictureTemplate;
