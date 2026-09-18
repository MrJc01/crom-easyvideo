import React from 'react';
import type { TemplateDefinition } from '../../../core/types';
import { spring } from '../../../core/animations';

export const creditsOutroTemplate: TemplateDefinition = {
  id: 'credits-outro',
  name: 'Créditos da Produção',
  category: 'Dados, Métricas & Encerramento',
  description: 'Encerramento formal com créditos técnicos e menção à equipe.',
  iconName: 'film',
  defaultProps: {
    producedBy: 'Produzido por Remotion Video Studio',
    techStack: 'React • Remotion • Tailwind CSS',
    license: 'Licença Aberta Educacional 2026',
  },
  schema: [
    { name: 'producedBy', label: 'Produção', type: 'text', defaultValue: 'Produzido por Remotion Studio' },
    { name: 'techStack', label: 'Tecnologias', type: 'text', defaultValue: 'React • Remotion' },
    { name: 'license', label: 'Licença / Ano', type: 'text', defaultValue: 'Licença Educacional 2026' },
  ],
  Component: ({ props, frame, fps }) => {
    const s = spring({ frame: frame - 4, fps });
    const badge = props.badge || 'CRÉDITOS DA PRODUÇÃO';
    const title = props.title || null;
    const author = props.author || props.producedBy || 'Crom EasyVideo Studio';
    const techStack = props.techStack || 'React • Remotion • Tailwind CSS';
    const license = props.license || 'Licença Aberta Educacional 2026';
    const accentColor = props.accentColor || '#ef4444';

    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-12 text-center font-mono relative overflow-hidden">
        <div className="max-w-xl w-full space-y-4" style={{ opacity: s }}>
          <span
            className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase mb-2 inline-block border"
            style={{
              backgroundColor: `${accentColor}26`,
              color: accentColor,
              borderColor: `${accentColor}4d`,
            }}
          >
            {badge}
          </span>
          {title && (
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-sans tracking-tight">
              {title}
            </h3>
          )}
          <h4 className="text-base font-bold text-slate-200 uppercase tracking-wider">{author}</h4>
          <p
            className="text-xs font-medium"
            style={{ color: accentColor }}
          >
            {techStack}
          </p>
          <span className="text-[11px] text-slate-500 block pt-2">{license}</span>
        </div>
      </div>
    );
  },
};

export default creditsOutroTemplate;
