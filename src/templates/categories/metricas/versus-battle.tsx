import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';

export const versusBattleTemplate: TemplateDefinition = {
  id: 'versus-battle',
  name: 'Batalha A vs B',
  category: 'Dados, Métricas & Encerramento',
  description: 'Confronto direto lado a lado entre duas abordagens tecnológicas rivais com layout adaptativo.',
  iconName: 'chart',
  defaultProps: {
    badge: 'COMPARAÇÃO DE PARADIGMAS',
    titleA: 'Open Source (Llama / Mistral)',
    descA: 'Privacidade total & Auto-hospedagem local sem envio de dados a terceiros.',
    titleB: 'Closed API (GPT-4 / Claude)',
    descB: 'SOTA máximo em raciocínio & Zero complexidade operacional de infraestrutura.',
    accentColor: '#38bdf8',
  },
  schema: [
    { name: 'badge', label: 'Badge Superior', type: 'text', defaultValue: 'COMPARAÇÃO DE PARADIGMAS' },
    { name: 'titleA', label: 'Lado A (Título)', type: 'text', defaultValue: 'Open Source' },
    { name: 'descA', label: 'Lado A (Descrição)', type: 'textarea', defaultValue: 'Privacidade total...' },
    { name: 'titleB', label: 'Lado B (Título)', type: 'text', defaultValue: 'Closed API' },
    { name: 'descB', label: 'Lado B (Descrição)', type: 'textarea', defaultValue: 'SOTA máximo...' },
    { name: 'accentColor', label: 'Cor de Destaque', type: 'color', defaultValue: '#38bdf8' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 2, fps, config: { damping: 16, mass: 0.9 } });
    const cardAS = spring({ frame: frame - 6, fps, config: { damping: 15, mass: 1 } });
    const cardBS = spring({ frame: frame - 12, fps, config: { damping: 15, mass: 1 } });

    const badgeText = props.badge || 'CONFRONTO DIRETO';
    const accent = props.accentColor || '#38bdf8';
    const sideA = props.titleA || props.sideA || 'Opção A';
    const descA = props.descA || props.pointA || '';
    const sideB = props.titleB || props.sideB || 'Opção B';
    const descB = props.descB || props.pointB || '';

    return (
      <div
        className="w-full h-full bg-slate-950 flex flex-col justify-between select-none relative overflow-hidden"
        style={{
          paddingTop: 'var(--safe-top, 80px)',
          paddingBottom: 'var(--safe-bottom, 80px)',
          paddingLeft: 'var(--safe-left, 80px)',
          paddingRight: 'var(--safe-right, 80px)',
        }}
      >
        {/* Glow de fundo */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${accent} 0%, transparent 65%)`,
          }}
        />

        {/* Topo: Badge */}
        <div
          className="flex justify-center shrink-0"
          style={{ transform: `translateY(${(1 - s) * -15}px)`, opacity: s }}
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border font-mono uppercase tracking-widest font-bold"
            style={{
              borderColor: `${accent}40`,
              backgroundColor: `${accent}15`,
              color: accent,
              fontSize: 'var(--font-badge, 18px)',
            }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accent }} />
            {badgeText}
          </div>
        </div>

        {/* Área Central: Lado A vs Lado B (Flex-col em telas verticais, row em telas horizontais) */}
        <div className="my-auto flex flex-col md:flex-row items-center justify-between gap-6 relative w-full">
          {/* Card A */}
          <div
            className="flex-1 w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md flex flex-col justify-between relative overflow-hidden"
            style={{
              transform: `scale(${0.92 + cardAS * 0.08})`,
              opacity: cardAS,
              borderTopColor: '#38bdf8',
              borderTopWidth: '4px',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-sky-400 font-bold tracking-widest text-xs uppercase">
                // ABORDAGEM A
              </span>
              <div className="w-2 h-2 rounded-full bg-sky-400" />
            </div>
            <h3
              className="font-bold text-white tracking-tight mb-3"
              style={{ fontSize: 'var(--font-title, 40px)', lineHeight: '1.2' }}
            >
              {sideA}
            </h3>
            <p
              className="text-slate-300 font-normal leading-relaxed"
              style={{ fontSize: 'var(--font-body, 25px)' }}
            >
              {descA}
            </p>
          </div>

          {/* Selo VS Central */}
          <div
            className="shrink-0 z-20 w-16 h-16 rounded-full bg-slate-950 border-2 border-slate-700 flex items-center justify-center font-black text-white font-mono shadow-2xl"
            style={{
              fontSize: 'var(--font-item, 22px)',
              boxShadow: '0 0 30px rgba(0,0,0,0.8)',
            }}
          >
            VS
          </div>

          {/* Card B */}
          <div
            className="flex-1 w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md flex flex-col justify-between relative overflow-hidden"
            style={{
              transform: `scale(${0.92 + cardBS * 0.08})`,
              opacity: cardBS,
              borderTopColor: '#a855f7',
              borderTopWidth: '4px',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-purple-400 font-bold tracking-widest text-xs uppercase">
                // ABORDAGEM B
              </span>
              <div className="w-2 h-2 rounded-full bg-purple-400" />
            </div>
            <h3
              className="font-bold text-white tracking-tight mb-3"
              style={{ fontSize: 'var(--font-title, 40px)', lineHeight: '1.2' }}
            >
              {sideB}
            </h3>
            <p
              className="text-slate-300 font-normal leading-relaxed"
              style={{ fontSize: 'var(--font-body, 25px)' }}
            >
              {descB}
            </p>
          </div>
        </div>

        {/* Rodapé sutil */}
        <div
          className="text-center font-mono text-slate-500 uppercase tracking-widest shrink-0"
          style={{ fontSize: 'var(--font-footer, 16px)' }}
        >
          ANÁLISE COMPARATIVA DIRETA
        </div>
      </div>
    );
  },
};

export default versusBattleTemplate;
