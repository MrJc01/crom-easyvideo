import React from 'react';
import type { TemplateDefinition, TemplateRenderProps } from '../../../core/types';
import { spring } from '../../../core/animations';
import { MediaRenderer } from '../../../remotion/MediaRenderer';

export interface DeepDiveArchitectureProps {
  systemBadge: string;
  architectureTitle: string;
  systemSubheading: string;
  videoSrc: string;
  videoCaption: string;
  metric1Label: string;
  metric1Value: string;
  metric2Label: string;
  metric2Value: string;
  metric3Label: string;
  metric3Value: string;
  logLine1: string;
  logLine2: string;
  logLine3: string;
  accentColor: string;
  showLivePulse: boolean;
}

export const DeepDiveArchitectureComponent: React.FC<TemplateRenderProps> = ({
  props,
  frame,
  fps,
}) => {
  const p = props as DeepDiveArchitectureProps;

  // Molas em cascata para entrada coreografada ao longo do tempo
  const headerSpring = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.8, stiffness: 100 },
  });

  const mainStageSpring = spring({
    frame: Math.max(0, frame - 8),
    fps,
    config: { damping: 15, mass: 1, stiffness: 85 },
  });

  const sidebarSpring = spring({
    frame: Math.max(0, frame - 16),
    fps,
    config: { damping: 14, mass: 0.8, stiffness: 95 },
  });

  const terminalSpring = spring({
    frame: Math.max(0, frame - 24),
    fps,
    config: { damping: 16, mass: 0.9, stiffness: 90 },
  });

  // Efeito de digitação progressiva nos logs baseado em frames corridos
  const typeChar = (text: string, startFrame: number, speed: number = 2) => {
    const elapsed = Math.max(0, frame - startFrame);
    const charCount = Math.min((text || '').length, Math.floor(elapsed / speed));
    return (text || '').slice(0, charCount);
  };

  const typedLog1 = typeChar(p.logLine1, 30);
  const typedLog2 = typeChar(p.logLine2, 50);
  const typedLog3 = typeChar(p.logLine3, 70);

  // Barra de progresso de execução do card na timeline (0% a 100% ao longo de 10s = 300 frames a 30fps)
  const timelineProgress = Math.min(100, (frame / (fps * 10)) * 100);

  return (
    <div
      className="w-full h-full flex flex-col justify-between p-12 select-none bg-slate-950 text-slate-100 relative overflow-hidden font-sans"
      style={{
        background: `radial-gradient(ellipse at 80% 10%, ${p.accentColor || '#38bdf8'}1c 0%, transparent 60%), radial-gradient(circle at 10% 90%, #030712 0%, #020617 100%)`,
      }}
    >
      {/* Grid de Fundo Sutil */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem]" />

      {/* 1. TOPO: Header de Contexto com Breadcrumb & Badge */}
      <header
        className="w-full flex items-center justify-between border-b border-slate-800/80 pb-5 z-10"
        style={{
          transform: `translateY(${(1 - headerSpring) * -30}px)`,
          opacity: headerSpring,
        }}
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span
              className="font-mono text-xs font-bold tracking-widest px-2.5 py-0.5 rounded border uppercase"
              style={{
                borderColor: `${p.accentColor || '#38bdf8'}60`,
                backgroundColor: `${p.accentColor || '#38bdf8'}18`,
                color: p.accentColor || '#38bdf8',
              }}
            >
              {p.systemBadge}
            </span>
            <span className="text-slate-500 font-mono text-xs">ARCH_INSPECTOR // V3.8</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">{p.architectureTitle}</h1>
        </div>

        {p.showLivePulse && (
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs font-mono text-slate-300 shadow-inner">
            <span
              className="w-2.5 h-2.5 rounded-full animate-ping"
              style={{ backgroundColor: p.accentColor || '#38bdf8' }}
            />
            <span>STREAMING ATIVO</span>
          </div>
        )}
      </header>

      {/* 2. CENTRO: Grid Duplo (Player em Destaque + Coluna Analítica) */}
      <main className="w-full flex-1 grid grid-cols-12 gap-8 my-6 items-stretch z-10 min-h-0">
        {/* Lado Esquerdo: Player de Vídeo em Moldura Industrial (7 colunas) */}
        <div
          className="col-span-7 flex flex-col justify-between rounded-2xl bg-slate-900/60 border border-slate-800 p-4 backdrop-blur-md shadow-2xl relative"
          style={{
            transform: `scale(${mainStageSpring}) translateY(${(1 - mainStageSpring) * 35}px)`,
            opacity: mainStageSpring,
          }}
        >
          <div className="relative w-full flex-1 rounded-xl overflow-hidden bg-black border border-slate-800/80">
            <MediaRenderer
              src={p.videoSrc}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded text-xs font-mono text-slate-300 border border-white/10">
              LATÊNCIA: 12ms // BUFFER: 100%
            </div>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-3 truncate">{p.videoCaption}</p>
        </div>

        {/* Lado Direito: Métricas Rápidas + Terminal Dinâmico (5 colunas) */}
        <div className="col-span-5 flex flex-col justify-between gap-4">
          {/* Métricas em Linha Tripla */}
          <div
            className="grid grid-cols-3 gap-3"
            style={{
              transform: `translateX(${(1 - sidebarSpring) * 30}px)`,
              opacity: sidebarSpring,
            }}
          >
            {[
              { val: p.metric1Value, lbl: p.metric1Label },
              { val: p.metric2Value, lbl: p.metric2Label },
              { val: p.metric3Value, lbl: p.metric3Label },
            ].map((m, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/90 flex flex-col justify-center"
              >
                <span
                  className="font-mono text-2xl font-black tracking-tight"
                  style={{ color: idx === 1 ? (p.accentColor || '#38bdf8') : '#ffffff' }}
                >
                  {m.val}
                </span>
                <span className="text-[11px] text-slate-400 font-medium leading-tight mt-1">
                  {m.lbl}
                </span>
              </div>
            ))}
          </div>

          {/* Terminal Console com Digitação Frame a Frame */}
          <div
            className="flex-1 flex flex-col justify-between bg-slate-950 rounded-xl border border-slate-800/90 p-4 font-mono shadow-xl overflow-hidden"
            style={{
              transform: `translateY(${(1 - terminalSpring) * 25}px)`,
              opacity: terminalSpring,
            }}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <span className="text-[10px] text-slate-500 tracking-wider">EVENT_DISPATCHER</span>
            </div>

            <div className="flex-1 space-y-2 text-xs">
              <div className="text-slate-400 flex items-start gap-2">
                <span className="text-slate-600 select-none">&gt;</span>
                <span>{typedLog1}</span>
              </div>
              <div className="text-slate-400 flex items-start gap-2">
                <span className="text-slate-600 select-none">&gt;</span>
                <span style={{ color: p.accentColor || '#38bdf8' }}>{typedLog2}</span>
              </div>
              <div className="text-slate-300 flex items-start gap-2">
                <span className="text-slate-600 select-none">&gt;</span>
                <span>{typedLog3}</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-600 pt-2 border-t border-slate-900 flex justify-between">
              <span>STATUS: HEALTHY</span>
              <span className="animate-pulse">_CURSOR</span>
            </div>
          </div>
        </div>
      </main>

      {/* 3. RODAPÉ: Resumo da Operação e Linha de Tempo */}
      <footer className="w-full flex flex-col gap-2 z-10">
        <div className="flex justify-between items-center text-xs font-mono text-slate-400">
          <span>{p.systemSubheading}</span>
          <span>{Math.round(timelineProgress)}% CONCLUÍDO</span>
        </div>
        {/* Barra de Progresso Contínua */}
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full rounded-full transition-all duration-75"
            style={{
              width: `${timelineProgress}%`,
              backgroundColor: p.accentColor || '#38bdf8',
              boxShadow: `0 0 10px ${p.accentColor || '#38bdf8'}88`,
            }}
          />
        </div>
      </footer>
    </div>
  );
};

export const deepDiveArchitectureTemplate: TemplateDefinition = {
  id: 'deep-dive-architecture',
  name: 'Arquitetura Completa de Sistema',
  category: 'Arquitetura & IA',
  iconName: 'Cpu',
  description: 'Card complexo com vídeo integrado, telemetria de 3 métricas, terminal vivo e régua temporal de 10s.',
  defaultDurationInFrames: 300,
  minDurationInFrames: 300,
  defaultProps: {
    systemBadge: 'CASO DE ESTUDO #04',
    architectureTitle: 'Migração de Render Engine para WebAssembly',
    systemSubheading: 'Pipeline de transcodificação de alta velocidade sem gargalo em CPU server-side.',
    videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42898-large.mp4',
    videoCaption: 'Figura 1.1: Thread pool dedicada executando shaders computacionais em paralelo.',
    metric1Label: 'Throughput',
    metric1Value: '2.4 GB/s',
    metric2Label: 'Otimização CPU',
    metric2Value: '-72%',
    metric3Label: 'Frame Drops',
    metric3Value: '0.00%',
    logLine1: '[INIT] Inicializando workers WASM compartilhando SharedArrayBuffer...',
    logLine2: '[SYNC] Pipeline GPU vinculada. Injeção de frames em 16.6ms ativada.',
    logLine3: '[OK] Telemetria validada: zero perdas registradas em 10.000 amostras.',
    accentColor: '#38bdf8',
    showLivePulse: true,
  },
  schema: [
    { name: 'systemBadge', label: 'Badge Superior', type: 'text', defaultValue: 'CASO DE ESTUDO #04' },
    { name: 'architectureTitle', label: 'Título Principal', type: 'text', defaultValue: 'Migração de Render Engine' },
    { name: 'systemSubheading', label: 'Texto de Rodapé', type: 'text', defaultValue: 'Pipeline de transcodificação...' },
    { name: 'videoSrc', label: 'Vídeo Demonstrativo', type: 'media', defaultValue: '' },
    { name: 'videoCaption', label: 'Legenda do Player', type: 'text', defaultValue: 'Figura 1.1: Thread pool...' },
    { name: 'metric1Label', label: 'Rótulo Métrica 1', type: 'text', defaultValue: 'Throughput' },
    { name: 'metric1Value', label: 'Valor Métrica 1', type: 'text', defaultValue: '2.4 GB/s' },
    { name: 'metric2Label', label: 'Rótulo Métrica 2', type: 'text', defaultValue: 'Otimização CPU' },
    { name: 'metric2Value', label: 'Valor Métrica 2', type: 'text', defaultValue: '-72%' },
    { name: 'metric3Label', label: 'Rótulo Métrica 3', type: 'text', defaultValue: 'Frame Drops' },
    { name: 'metric3Value', label: 'Valor Métrica 3', type: 'text', defaultValue: '0.00%' },
    { name: 'logLine1', label: 'Log Linha 1', type: 'text', defaultValue: '[INIT] Inicializando...' },
    { name: 'logLine2', label: 'Log Linha 2', type: 'text', defaultValue: '[SYNC] Pipeline vinculada...' },
    { name: 'logLine3', label: 'Log Linha 3', type: 'text', defaultValue: '[OK] Telemetria validada...' },
    { name: 'accentColor', label: 'Cor do Sistema', type: 'color', defaultValue: '#38bdf8' },
    { name: 'showLivePulse', label: 'Exibir Badge Ao Vivo', type: 'toggle', defaultValue: true },
  ],
  Component: DeepDiveArchitectureComponent,
};

export default deepDiveArchitectureTemplate;
