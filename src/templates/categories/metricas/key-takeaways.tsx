import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';

export const keyTakeawaysTemplate: TemplateDefinition = {
  id: 'key-takeaways',
  name: 'Conclusão Chave',
  category: 'Dados, Métricas & Encerramento',
  description: 'Destaque de uma única grande mensagem definitiva para finalizar.',
  iconName: 'hero',
  defaultProps: {
    badge: 'CONCLUSÃO FINAL',
    takeaway: 'O segredo não é mágica: é matemática vetorial, dados e poder computacional massivo.',
  },
  schema: [
    { name: 'badge', label: 'Badge Superior', type: 'text', defaultValue: 'CONCLUSÃO FINAL' },
    { name: 'takeaway', label: 'Mensagem Central', type: 'textarea', defaultValue: 'O segredo não é mágica...' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 4, fps });
    const badge = props.badge || 'CONCLUSÃO CHAVE';
    const title = props.title || null;
    const takeaway = props.takeaway || null;
    const takeaways = Array.isArray(props.takeaways) ? props.takeaways : null;
    const accentColor = props.accentColor || '#a855f7';

    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-12 text-center relative overflow-hidden">
        <div className="max-w-3xl w-full" style={{ transform: `scale(${s})`, opacity: s }}>
          <span
            className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase mb-4 inline-block border"
            style={{
              backgroundColor: `${accentColor}26`,
              color: accentColor,
              borderColor: `${accentColor}4d`,
            }}
          >
            {badge}
          </span>

          {title && (
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6 leading-tight">
              {title}
            </h2>
          )}

          {takeaways && (
            <div className="space-y-3.5 text-left mt-2">
              {takeaways.map((t: any, idx: number) => {
                const point = typeof t === 'object' && t !== null ? t.point : t;
                const detail = typeof t === 'object' && t !== null ? t.detail : null;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border flex items-start gap-3.5 shadow-lg bg-slate-900/90"
                    style={{ borderColor: `${accentColor}33` }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5 border"
                      style={{
                        backgroundColor: `${accentColor}26`,
                        color: accentColor,
                        borderColor: `${accentColor}4d`,
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-base text-white font-bold leading-snug">
                        {point}
                      </span>
                      {detail && (
                        <span className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {detail}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!takeaways && takeaway && (
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-relaxed">
              {takeaway}
            </h2>
          )}
        </div>
      </div>
    );
  },
};

export default keyTakeawaysTemplate;
