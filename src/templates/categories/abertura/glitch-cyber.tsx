import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';

export const glitchCyberTemplate: TemplateDefinition = {
  id: 'glitch-cyber',
  name: 'Terminal Cyberpunk',
  category: 'Abertura & Título',
  description: 'Estilo sci-fi com gradiente neon, estética de console e status animado.',
  iconName: 'hero',
  defaultProps: {
    systemTag: 'SYS_BOOT // MODEL_INITIALIZE',
    header: 'NEURAL WEIGHTS LOADED',
    subtext: '175 bilhões de parâmetros prontos para inferência imediata.',
    showLiveIndicator: true,
  },
  schema: [
    { name: 'systemTag', label: 'Tag do Sistema', type: 'text', defaultValue: 'SYS_BOOT // MODEL_INITIALIZE' },
    { name: 'header', label: 'Cabeçalho Terminal', type: 'text', defaultValue: 'NEURAL WEIGHTS LOADED' },
    { name: 'subtext', label: 'Subtexto Informativo', type: 'textarea', defaultValue: '175 bilhões de parâmetros...' },
    { name: 'showLiveIndicator', label: 'Exibir Indicador Online', type: 'toggle', defaultValue: true },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 3, fps });
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-12 relative overflow-hidden font-mono">
        <div
          className="w-full max-w-3xl border border-emerald-500/30 bg-emerald-950/20 rounded-2xl p-8 shadow-2xl backdrop-blur-md"
          style={{ transform: `scale(${s})`, opacity: s }}
        >
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3 mb-6 text-xs text-emerald-400">
            <span>{props.systemTag}</span>
            {props.showLiveIndicator && <span className="animate-pulse font-bold">ONLINE</span>}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-wide">{props.header}</h2>
          <p className="text-slate-400 mt-4 text-sm font-sans">{props.subtext}</p>
        </div>
      </div>
    );
  },
};

export default glitchCyberTemplate;
