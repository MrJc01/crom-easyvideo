import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';
import { MediaRenderer } from '../../../remotion/MediaRenderer';

export const videoHeroBgTemplate: TemplateDefinition = {
  id: 'video-hero-bg',
  name: 'Vídeo Hero Background',
  category: 'Mídia & Demonstração',
  description: 'Vídeo em tela cheia com overlay ajustável e tipografia de título animada.',
  iconName: 'film',
  defaultProps: {
    media: {
      type: 'video',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      trimStart: 1,
      trimEnd: 6,
      objectFit: 'cover',
    },
    title: 'Visão Computacional & LLMs Multimodais',
    subtitle: 'Processamento simultâneo de frames de vídeo e texto.',
    overlayOpacity: 65,
    showSubtitle: true,
  },
  schema: [
    { name: 'media', label: 'Vídeo de Fundo', type: 'media', defaultValue: null },
    { name: 'title', label: 'Título', type: 'text', defaultValue: 'Visão Computacional' },
    { name: 'showSubtitle', label: 'Exibir Subtítulo', type: 'toggle', defaultValue: true },
    { name: 'subtitle', label: 'Subtítulo', type: 'textarea', defaultValue: 'Processamento simultâneo...' },
    { name: 'overlayOpacity', label: 'Opacidade do Escurecimento (%)', type: 'number', defaultValue: 65 },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 4, fps });
    return (
      <div className="w-full h-full relative overflow-hidden bg-black flex items-center justify-center p-12 text-center">
        <div className="absolute inset-0 z-0">
          <MediaRenderer media={props.media} frame={frame} fps={fps} />
        </div>
        <div
          className="absolute inset-0 z-10 bg-slate-950"
          style={{ opacity: (props.overlayOpacity || 60) / 100 }}
        />
        <div className="relative z-20 max-w-4xl" style={{ transform: `scale(${s})`, opacity: s }}>
          <h1 className="text-5xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
            {props.title}
          </h1>
          {props.showSubtitle && (
            <p className="text-lg text-slate-200 mt-4 max-w-2xl mx-auto leading-relaxed drop-shadow">
              {props.subtitle}
            </p>
          )}
        </div>
      </div>
    );
  },
};

export default videoHeroBgTemplate;
