import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';

export const factCheckTemplate: TemplateDefinition = {
  id: 'fact-check',
  name: 'Verificação de Fatos / Mito vs Fato',
  category: 'Conceitos & Explicações',
  description: 'Contraste direto com selo de veredicto, análise de alegações e fundamentação técnica.',
  iconName: 'chart',
  defaultProps: {
    badge: 'ANOMALIA CLÁSSICA',
    claim: 'LLMs falham em soletrar ou contar letras de palavras comuns.',
    verdict: 'VERDADEIRO (EFEITO BPE)',
    explanation: 'A palavra inteira é comprimida em um ou dois tokens. O modelo nunca vê os caracteres individuais durante a computação interna.',
    accentColor: '#f43f5e',
  },
  schema: [
    { name: 'badge', label: 'Badge Superior', type: 'text', defaultValue: 'ANOMALIA CLÁSSICA' },
    { name: 'claim', label: 'Alegação / Mito', type: 'textarea', defaultValue: 'LLMs falham em soletrar...' },
    { name: 'verdict', label: 'Veredicto', type: 'text', defaultValue: 'VERDADEIRO (EFEITO BPE)' },
    { name: 'explanation', label: 'Explicação Técnica', type: 'textarea', defaultValue: 'A palavra inteira...' },
    { name: 'accentColor', label: 'Cor de Destaque', type: 'color', defaultValue: '#f43f5e' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 2, fps, config: { damping: 16, mass: 0.9 } });
    const claimS = spring({ frame: frame - 6, fps, config: { damping: 15, mass: 1 } });
    const verdictS = spring({ frame: frame - 12, fps, config: { damping: 14, mass: 0.8 } });
    const expS = spring({ frame: frame - 18, fps, config: { damping: 15, mass: 1 } });

    const badgeText = props.badge || 'VERIFICAÇÃO DE FATOS';
    const claim = props.claim || props.myth || 'Alegação em análise';
    const verdict = props.verdict || (props.fact ? 'ESCLARECIMENTO TÉCNICO' : 'VEREDITO TÉCNICO');
    const explanation = props.explanation || props.fact || '';

    const isTrue = verdict.toUpperCase().includes('VERDADEIRO') || verdict.toUpperCase().includes('FATO');
    const isFalse = verdict.toUpperCase().includes('FALSO') || verdict.toUpperCase().includes('MITO');
    const stampColor = isTrue ? '#10b981' : isFalse ? '#f43f5e' : (props.accentColor || '#38bdf8');

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
            background: `radial-gradient(circle at 50% 50%, ${stampColor} 0%, transparent 65%)`,
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
              borderColor: `${stampColor}40`,
              backgroundColor: `${stampColor}15`,
              color: stampColor,
              fontSize: 'var(--font-badge, 18px)',
            }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: stampColor }} />
            {badgeText}
          </div>
        </div>

        {/* Área Central: Bloco da Alegação + Carimbo de Veredicto */}
        <div className="my-auto max-w-4xl mx-auto w-full space-y-6">
          {/* Cartão da Alegação */}
          <div
            className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md"
            style={{
              transform: `scale(${0.92 + claimS * 0.08})`,
              opacity: claimS,
            }}
          >
            <span className="font-mono text-slate-400 font-bold uppercase tracking-wider text-xs block mb-3">
              // AFIRMAÇÃO POPULAR / CENÁRIO
            </span>
            <p
              className="text-white font-bold leading-snug"
              style={{ fontSize: 'var(--font-title, 38px)' }}
            >
              "{claim}"
            </p>
          </div>

          {/* Selo / Carimbo de Veredicto */}
          <div
            className="flex items-center justify-center"
            style={{
              transform: `scale(${0.8 + verdictS * 0.2}) rotate(${(1 - verdictS) * -6}deg)`,
              opacity: verdictS,
            }}
          >
            <div
              className="inline-flex items-center gap-3 px-8 py-3.5 rounded-2xl border-2 font-mono font-black uppercase tracking-wider shadow-2xl"
              style={{
                borderColor: stampColor,
                backgroundColor: `${stampColor}20`,
                color: stampColor,
                fontSize: 'clamp(24px, 3.2cqmin, 40px)',
                boxShadow: `0 0 30px ${stampColor}30`,
              }}
            >
              {isTrue ? '✓' : isFalse ? '✕' : '●'} {verdict}
            </div>
          </div>

          {/* Cartão da Explicação Técnica */}
          {explanation && (
            <div
              className="bg-slate-900/70 border border-slate-800 rounded-3xl p-8 shadow-xl backdrop-blur-md"
              style={{
                transform: `translateY(${(1 - expS) * 20}px)`,
                opacity: expS,
                borderLeftColor: stampColor,
                borderLeftWidth: '4px',
              }}
            >
              <span className="font-mono text-slate-400 font-bold uppercase tracking-wider text-xs block mb-2">
                // REALIDADE TÉCNICA
              </span>
              <p
                className="text-slate-200 font-normal leading-relaxed"
                style={{ fontSize: 'var(--font-body, 25px)' }}
              >
                {explanation}
              </p>
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div
          className="text-center font-mono text-slate-500 uppercase tracking-widest shrink-0"
          style={{ fontSize: 'var(--font-footer, 16px)' }}
        >
          RIGOR CIENTÍFICO & ANÁLISE DE EVIDÊNCIAS
        </div>
      </div>
    );
  },
};

export default factCheckTemplate;
