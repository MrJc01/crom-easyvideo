import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';

export const ctaSubscribeTemplate: TemplateDefinition = {
  id: 'cta-subscribe',
  name: 'Chamada para Ação (CTA)',
  category: 'Dados, Métricas & Encerramento',
  description: 'Card final de alto impacto com convite para inscrição, comunidade ou engajamento.',
  iconName: 'hero',
  defaultProps: {
    badge: 'ENGENHARIA DE IA EM PROFUNDIDADE',
    headline: 'Aprofunde seus Conhecimentos',
    subheadline: 'Novos mergulhos técnicos em arquitetura de software, LLMs e sistemas distribuídos.',
    buttonText: 'Inscreva-se no Canal',
    accentColor: '#6366f1',
  },
  schema: [
    { name: 'badge', label: 'Badge Superior', type: 'text', defaultValue: 'ENGENHARIA DE IA EM PROFUNDIDADE' },
    { name: 'headline', label: 'Título de Ação', type: 'text', defaultValue: 'Aprofunde seus Conhecimentos' },
    { name: 'subheadline', label: 'Subtítulo / Chamada', type: 'textarea', defaultValue: 'Novos mergulhos técnicos...' },
    { name: 'buttonText', label: 'Texto do Botão / Canal', type: 'text', defaultValue: 'Inscreva-se no Canal' },
    { name: 'accentColor', label: 'Cor de Destaque', type: 'color', defaultValue: '#6366f1' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 2, fps, config: { damping: 16, mass: 0.9 } });
    const cardS = spring({ frame: frame - 6, fps, config: { damping: 15, mass: 1 } });
    const btnS = spring({ frame: frame - 14, fps, config: { damping: 14, mass: 0.8 } });

    const badgeText = props.badge || 'COMUNIDADE & APRENDIZADO';
    const accent = props.accentColor || '#6366f1';
    const headline = props.headline || props.action || 'Gostou do Conteúdo?';
    const subheadline = props.subheadline || props.subtext || 'Inscreva-se para mais análises aprofundadas.';
    const buttonText = props.buttonText || props.channel || 'Inscreva-se';

    return (
      <div
        className="w-full h-full bg-slate-950 flex flex-col justify-between select-none relative overflow-hidden text-center"
        style={{
          paddingTop: 'var(--safe-top, 80px)',
          paddingBottom: 'var(--safe-bottom, 80px)',
          paddingLeft: 'var(--safe-left, 80px)',
          paddingRight: 'var(--safe-right, 80px)',
        }}
      >
        {/* Glow de fundo */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
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

        {/* Área Central: Caixa de Destaque CTA */}
        <div
          className="my-auto max-w-3xl w-full mx-auto bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 rounded-3xl p-10 shadow-2xl backdrop-blur-md flex flex-col items-center justify-center gap-6 relative"
          style={{
            transform: `scale(${0.92 + cardS * 0.08})`,
            opacity: cardS,
            borderTopColor: accent,
            borderTopWidth: '4px',
            boxShadow: `0 0 50px ${accent}25`,
          }}
        >
          <h2
            className="font-black text-white tracking-tight leading-tight max-w-2xl"
            style={{ fontSize: 'var(--font-hero, 56px)' }}
          >
            {headline}
          </h2>

          <p
            className="text-slate-300 max-w-xl font-normal leading-relaxed"
            style={{ fontSize: 'var(--font-body, 25px)' }}
          >
            {subheadline}
          </p>

          <div
            style={{
              transform: `scale(${0.9 + btnS * 0.1})`,
              opacity: btnS,
            }}
            className="mt-2"
          >
            <div
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold font-mono uppercase tracking-wider text-white shadow-2xl cursor-pointer"
              style={{
                backgroundColor: accent,
                fontSize: 'var(--font-item, 24px)',
                boxShadow: `0 0 35px ${accent}60`,
              }}
            >
              <span>🔔</span>
              <span>{buttonText}</span>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div
          className="text-center font-mono text-slate-500 uppercase tracking-widest shrink-0"
          style={{ fontSize: 'var(--font-footer, 16px)' }}
        >
          COMPARTILHE O CONHECIMENTO
        </div>
      </div>
    );
  },
};

export default ctaSubscribeTemplate;
