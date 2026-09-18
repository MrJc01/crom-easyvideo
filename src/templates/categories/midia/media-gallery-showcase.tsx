import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';
import { MediaRenderer } from '../../../remotion/MediaRenderer';

export const mediaGalleryShowcaseTemplate: TemplateDefinition = {
  id: 'media-gallery-showcase',
  name: 'Galeria de Destaque',
  category: 'Mídia & Demonstração',
  description: 'Exibe uma imagem principal com moldura técnica e dados de inferência.',
  iconName: 'image',
  defaultProps: {
    title: 'Visualização de Tensores',
    caption: 'Espaço latente gerado por redes neurais generativas.',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1000&q=80',
      trimStart: 0,
      trimEnd: 4,
      objectFit: 'cover',
    },
  },
  schema: [
    { name: 'title', label: 'Título', type: 'text', defaultValue: 'Visualização de Tensores' },
    { name: 'caption', label: 'Legenda Técnica', type: 'textarea', defaultValue: 'Espaço latente...' },
    { name: 'media', label: 'Imagem / Mídia', type: 'media', defaultValue: null },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 4, fps });
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-10 text-center">
        <h3 className="text-2xl font-bold text-white mb-2">{props.title}</h3>
        <p className="text-xs text-slate-400 mb-6 max-w-md">{props.caption}</p>
        <div
          className="w-full max-w-2xl h-64 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl"
          style={{ transform: `scale(${s})`, opacity: s }}
        >
          <MediaRenderer media={props.media} frame={frame} fps={fps} />
        </div>
      </div>
    );
  },
};

export default mediaGalleryShowcaseTemplate;
