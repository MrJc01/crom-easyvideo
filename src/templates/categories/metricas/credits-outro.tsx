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
    return (
      <div className="w-full h-full bg-slate-950 flex flex-col justify-center items-center p-12 text-center font-mono">
        <div className="max-w-lg w-full space-y-4" style={{ opacity: s }}>
          <h4 className="text-base font-bold text-white uppercase tracking-wider">{props.producedBy}</h4>
          <p className="text-xs text-indigo-400">{props.techStack}</p>
          <span className="text-[10px] text-slate-600 block">{props.license}</span>
        </div>
      </div>
    );
  },
};

export default creditsOutroTemplate;
