import React, { useState } from 'react';
import { Icons } from '../../core/icons';

export interface CardCreationDocsProps {
  onBackToStudio?: () => void;
}

export const CardCreationDocs: React.FC<CardCreationDocsProps> = ({ onBackToStudio }) => {
  const [copied, setCopied] = useState<boolean>(false);

  const boilerplateCode = `import React from 'react';
import type { TemplateDefinition, TemplateRenderProps } from '../../../core/types';
import { spring } from '../../../core/animations';

// 1. Tipagem das Propriedades Customizadas do Card
export interface MeuNovoTemplateProps {
  title: string;
  subtitle: string;
  badge: string;
  accentColor: string;
  showBadge: boolean;
}

// 2. Componente de Renderização Visual do Card
export const MeuNovoTemplateComponent: React.FC<TemplateRenderProps> = ({
  props,
  frame,
  fps,
}) => {
  const p = props as MeuNovoTemplateProps;

  // Animação de Entrada usando Física de Amortecimento (Spring)
  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.8, stiffness: 100 },
  });

  const subtitleSpring = spring({
    frame: Math.max(0, frame - 8),
    fps,
    config: { damping: 16, mass: 0.9, stiffness: 90 },
  });

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center p-12 text-center relative overflow-hidden select-none"
      style={{
        background: \`radial-gradient(circle at 50% 40%, \${p.accentColor}33 0%, #030712 85%)\`,
      }}
    >
      {/* Badge Superior */}
      {p.showBadge && (
        <div
          className="px-5 py-2 rounded-full border text-sm font-mono font-bold tracking-widest uppercase mb-6"
          style={{
            borderColor: \`\${p.accentColor}66\`,
            backgroundColor: \`\${p.accentColor}22\`,
            color: p.accentColor,
            transform: \`scale(\${titleSpring})\`,
            opacity: titleSpring,
          }}
        >
          {p.badge}
        </div>
      )}

      {/* Título Principal */}
      <h1
        className="text-6xl font-black text-white tracking-tight leading-tight max-w-5xl"
        style={{
          transform: \`translateY(\${(1 - titleSpring) * 40}px)\`,
          opacity: titleSpring,
        }}
      >
        {p.title}
      </h1>

      {/* Subtítulo Descritivo */}
      <p
        className="text-2xl text-slate-300 max-w-3xl mt-6 font-normal leading-relaxed"
        style={{
          transform: \`translateY(\${(1 - subtitleSpring) * 30}px)\`,
          opacity: subtitleSpring,
        }}
      >
        {p.subtitle}
      </p>
    </div>
  );
};

// 3. Definição do Template e Contrato de Schema do Inspetor
export const meuNovoTemplate: TemplateDefinition = {
  id: 'meu-novo-template',
  name: 'Meu Novo Template',
  category: 'Conceitos & Explicações',
  iconName: 'Sparkles',
  description: 'Apresentação impactante de conceitos com física de spring suave.',
  defaultProps: {
    badge: 'CONCEITO CENTRAL',
    title: 'Transforme Ideias em Vídeos Incríveis',
    subtitle: 'Arquitetura modular de vídeo programático construída com React e Remotion.',
    accentColor: '#6366f1',
    showBadge: true,
  },
  schema: [
    { name: 'showBadge', label: 'Exibir Badge', type: 'toggle', defaultValue: true },
    { name: 'badge', label: 'Texto do Badge', type: 'text', defaultValue: 'CONCEITO CENTRAL' },
    { name: 'title', label: 'Título Principal', type: 'text', defaultValue: 'Transforme Ideias em Vídeos' },
    { name: 'subtitle', label: 'Subtítulo', type: 'textarea', defaultValue: 'Arquitetura modular...' },
    { name: 'accentColor', label: 'Cor de Destaque', type: 'color', defaultValue: '#6366f1' },
  ],
  Component: MeuNovoTemplateComponent,
};
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(boilerplateCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="flex flex-col flex-1 max-w-[1400px] w-full mx-auto p-3 sm:p-6 gap-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
            <Icons.Layers />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
              Guia de Engenharia: Criação de Cards & Templates
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Manual técnico completo para arquitetar, animar e integrar novos cards ao catálogo do Remotion Studio
            </p>
          </div>
        </div>

        {onBackToStudio && (
          <button
            type="button"
            onClick={onBackToStudio}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
          >
            <Icons.ChevronLeft />
            <span>Voltar ao Estúdio</span>
          </button>
        )}
      </div>

      {/* Seção 1: Anatomia de um Template */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3.5 shadow-xl">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm uppercase tracking-wider">
            <Icons.Code />
            <span>1. Anatomia do TemplateDefinition</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Cada cena no Remotion Studio é definida por um contrato estrito contendo metadados, schema de campos para o Inspetor, valores padrão e o componente React de renderização:
          </p>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
              <strong className="text-white font-mono">id: string</strong> — Identificador único permanente (ex: <code className="text-indigo-300">hero-title</code>).
            </li>
            <li className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
              <strong className="text-white font-mono">category: string</strong> — Categoria do catálogo (Abertura, Mídia, Conceitos, Arquitetura, Métricas).
            </li>
            <li className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
              <strong className="text-white font-mono">schema: FieldDefinition[]</strong> — Define quais campos aparecem no painel dinâmico do editor.
            </li>
            <li className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
              <strong className="text-white font-mono">defaultProps: Record&lt;string, any&gt;</strong> — Valores padrão quando o card é inserido na timeline.
            </li>
            <li className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
              <strong className="text-white font-mono">Component: React.FC&lt;TemplateRenderProps&gt;</strong> — Função pura que recebe <code className="text-indigo-300">frame</code>, <code className="text-indigo-300">fps</code> e <code className="text-indigo-300">props</code>.
            </li>
          </ul>
        </div>

        {/* Seção 2: Física e Amortecimento com Spring */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3.5 shadow-xl">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm uppercase tracking-wider">
            <Icons.Sparkles />
            <span>2. Física de Animação com spring()</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Para garantir movimentos cinematográficos e orgânicos sem keyframes manuais, utilize a função nativa de física <code className="text-indigo-300">spring()</code>:
          </p>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-indigo-300 space-y-1">
            <div>const anim = spring({'{'}</div>
            <div className="pl-4">frame: Math.max(0, frame - delayInFrames),</div>
            <div className="pl-4">fps,</div>
            <div className="pl-4">config: {'{'}</div>
            <div className="pl-8">damping: 14,   // Amortecimento (quanto maior, menos oscila)</div>
            <div className="pl-8">mass: 0.8,      // Inércia da massa (peso do objeto)</div>
            <div className="pl-8">stiffness: 100 // Rigidez da mola (velocidade de reação)</div>
            <div className="pl-4">{'}'}</div>
            <div>{'}'});</div>
          </div>
          <div className="text-xs text-slate-400 space-y-1 pt-1">
            <div>• Retorna um valor normalizado que vai suavemente de <strong>0.0 a 1.0</strong>.</div>
            <div>• Pode ser multiplicado para controlar <code className="text-slate-300">scale</code>, <code className="text-slate-300">opacity</code> ou <code className="text-slate-300">translateY</code>.</div>
          </div>
        </div>
      </div>

      {/* Seção 3: Tipos de Campos Suportados */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm uppercase tracking-wider">
          <Icons.Layers />
          <span>3. Tipos de Campos Suportados no Schema (FieldDefinition)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-white font-mono">type: 'text'</span>
            <p className="text-slate-400 text-[11px]">Input de texto simples para títulos, rótulos e badges curtos.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-white font-mono">type: 'textarea'</span>
            <p className="text-slate-400 text-[11px]">Caixa multilinhas ideal para subtítulos, parágrafos e scripts.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-white font-mono">type: 'color'</span>
            <p className="text-slate-400 text-[11px]">Colorpicker visual com seletor hexadecimal integrado.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-white font-mono">type: 'toggle'</span>
            <p className="text-slate-400 text-[11px]">Chave booleana para exibir ou ocultar elementos condicionais.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-white font-mono">type: 'number'</span>
            <p className="text-slate-400 text-[11px]">Input numérico para percentuais, contadores e métricas.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-white font-mono">type: 'select'</span>
            <p className="text-slate-400 text-[11px]">Menu dropdown com opções personalizadas configuráveis.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-white font-mono">type: 'media'</span>
            <p className="text-slate-400 text-[11px]">Upload/URL de imagens e vídeos com corte, trim e objectFit.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-white font-mono">type: 'array'</span>
            <p className="text-slate-400 text-[11px]">Listas dinâmicas repetitivas (itens, tópicos, passos, tags).</p>
          </div>
        </div>
      </div>

      {/* Seção 4: Código Boilerplate Completo com Botão de Copiar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <Icons.Code />
            <span>4. Código Boilerplate Pronto para Copiar e Colar</span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
            }`}
          >
            {copied ? <Icons.Check /> : <Icons.Copy />}
            <span>{copied ? 'Código Copiado!' : 'Copiar Boilerplate'}</span>
          </button>
        </div>

        <div className="p-4 bg-slate-950 overflow-x-auto">
          <pre className="text-xs font-mono text-indigo-300 leading-relaxed whitespace-pre selection:bg-indigo-600 selection:text-white">
            {boilerplateCode}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default CardCreationDocs;
