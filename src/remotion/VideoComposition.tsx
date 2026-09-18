import React, { useMemo } from 'react';
import type { ProjectState, CalculatedCard } from '../core/types';
import { CARD_REGISTRY } from '../templates/registry';

import { VIDEO_TYPOGRAPHY, SAFE_ZONE_PRESETS, type SafeZoneGuide } from '../core/typography';

export interface VideoCompositionProps {
  project: ProjectState;
  calculatedCards: CalculatedCard[];
  currentFrame: number;
  className?: string;
  width?: number;
  height?: number;
  safeZone?: SafeZoneGuide;
  showSafeZoneGuide?: boolean;
}

interface ErrorBoundaryProps {
  cardId: string;
  templateId: string;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class TemplateErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorMessage: error?.message || 'Erro desconhecido' };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error(`[Template Error] Falha no card ${this.props.cardId} (${this.props.templateId}):`, error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (prevProps.cardId !== this.props.cardId && this.state.hasError) {
      this.setState({ hasError: false, errorMessage: '' });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full bg-slate-950 border-2 border-red-500/50 flex flex-col items-center justify-center p-8 text-center font-sans">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center mb-4 text-xl">
            ⚠️
          </div>
          <h3 className="text-xl font-bold text-white mb-1">Erro ao Renderizar Template</h3>
          <p className="text-xs font-mono text-slate-400 mb-3">Card: {this.props.cardId} | Template: {this.props.templateId}</p>
          <div className="bg-red-950/40 border border-red-800/60 rounded p-3 text-xs font-mono text-red-300 max-w-lg">
            {this.state.errorMessage}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const VideoComposition: React.FC<VideoCompositionProps> = ({
  project,
  calculatedCards,
  currentFrame,
  className = '',
  width = 1920,
  height = 1080,
  safeZone,
  showSafeZoneGuide = false,
}) => {
  const activeCard = useMemo(() => {
    const found = calculatedCards.find(
      (c) => currentFrame >= c.startFrame && currentFrame < c.endFrame
    );
    return found || calculatedCards[calculatedCards.length - 1] || calculatedCards[0] || null;
  }, [calculatedCards, currentFrame]);

  const localFrame = useMemo(() => {
    if (!activeCard) return 0;
    return Math.max(0, currentFrame - activeCard.startFrame);
  }, [activeCard, currentFrame]);

  const CurrentTemplateComponent = useMemo(() => {
    if (!activeCard) return null;
    const def = CARD_REGISTRY[activeCard.templateId] || CARD_REGISTRY['hero-title'];
    return def?.Component || null;
  }, [activeCard]);

  const detectedCategory = useMemo(() => {
    if (width < height) return '9:16';
    if (width === height) return '1:1';
    return '16:9';
  }, [width, height]);

  const activeSafeZone = safeZone || SAFE_ZONE_PRESETS[detectedCategory] || SAFE_ZONE_PRESETS['16:9'];
  const minDim = Math.min(width, height);

  const transitionStyle = useMemo<React.CSSProperties>(() => {
    if (!activeCard) return {};
    const transition = activeCard.transition;
    if (!transition || transition.type === 'none') {
      return {};
    }

    const duration = Math.max(1, transition.durationInFrames || 15);
    const progress = Math.min(1, Math.max(0, localFrame / duration));

    switch (transition.type) {
      case 'fade':
        return {
          opacity: progress,
        };
      case 'slide-left':
        return {
          transform: `translateX(${(1 - progress) * 100}%)`,
        };
      case 'slide-right':
        return {
          transform: `translateX(${(1 - progress) * -100}%)`,
        };
      case 'zoom-in':
        return {
          transform: `scale(${0.8 + 0.2 * progress})`,
          opacity: progress,
        };
      case 'wipe-left':
        return {
          clipPath: `inset(0 ${(1 - progress) * 100}% 0 0)`,
        };
      default:
        return {};
    }
  }, [activeCard, localFrame]);

  if (!activeCard || !CurrentTemplateComponent) {
    return null;
  }

  const compositionStyle: React.CSSProperties = {
    ...transitionStyle,
    containerType: 'size' as any,
    containerName: 'stage',
    ['--canvas-width' as any]: `${width}px`,
    ['--canvas-height' as any]: `${height}px`,
    ['--canvas-min' as any]: `${minDim}px`,
    ['--font-mega' as any]: VIDEO_TYPOGRAPHY.megaStat.fontSizeRelative,
    ['--font-hero' as any]: VIDEO_TYPOGRAPHY.heroTitle.fontSizeRelative,
    ['--font-title' as any]: VIDEO_TYPOGRAPHY.cardTitle.fontSizeRelative,
    ['--font-subtitle' as any]: VIDEO_TYPOGRAPHY.subtitle.fontSizeRelative,
    ['--font-body' as any]: VIDEO_TYPOGRAPHY.body.fontSizeRelative,
    ['--font-item' as any]: VIDEO_TYPOGRAPHY.cardItem.fontSizeRelative,
    ['--font-badge' as any]: VIDEO_TYPOGRAPHY.badge.fontSizeRelative,
    ['--font-code' as any]: VIDEO_TYPOGRAPHY.code.fontSizeRelative,
    ['--font-footer' as any]: VIDEO_TYPOGRAPHY.footer.fontSizeRelative,
    ['--safe-top' as any]: `${activeSafeZone.top}px`,
    ['--safe-bottom' as any]: `${activeSafeZone.bottom}px`,
    ['--safe-left' as any]: `${activeSafeZone.left}px`,
    ['--safe-right' as any]: `${activeSafeZone.right}px`,
  };

  return (
    <div
      id="video-stage-canvas"
      style={compositionStyle}
      className={`w-full h-full relative overflow-hidden ${className}`}
    >
      <TemplateErrorBoundary cardId={activeCard.id} templateId={activeCard.templateId}>
        <CurrentTemplateComponent
          props={activeCard.props}
          frame={localFrame}
          fps={project.meta.fps}
        />
      </TemplateErrorBoundary>

      {/* Visual Safe Zone Guide Overlay (quando ativado pelo criador) */}
      {showSafeZoneGuide && (
        <div className="absolute inset-0 pointer-events-none z-50 flex flex-col justify-between select-none">
          {/* Top Unsafe Area */}
          <div
            className="w-full bg-red-500/10 border-b border-red-500/40 flex items-center justify-center font-mono text-xs text-red-300 font-bold"
            style={{ height: `${activeSafeZone.top}px` }}
          >
            ▲ ZONA DE CABEÇALHO / BUSCA ({activeSafeZone.top}px) ▲
          </div>

          {/* Central Safe Rectangle */}
          <div className="flex-1 flex justify-between items-stretch">
            {/* Left Unsafe Margin */}
            <div
              className="bg-red-500/10 border-r border-red-500/40 flex items-center justify-center font-mono text-[10px] text-red-300"
              style={{ width: `${activeSafeZone.left}px` }}
            >
              <span className="rotate-90">MARGEM</span>
            </div>

            {/* Central Safe Content Box */}
            <div className="flex-1 border-2 border-dashed border-emerald-400/80 bg-emerald-500/[0.02] flex items-center justify-center relative m-1 rounded-2xl">
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/50 text-[11px] font-mono font-bold text-emerald-300">
                ✓ SAFE ZONE (ÁREA VISÍVEL GARANTIDA)
              </div>
            </div>

            {/* Right Unsafe Margin (Action buttons in vertical) */}
            <div
              className="bg-red-500/10 border-l border-red-500/40 flex flex-col items-center justify-center font-mono text-[10px] text-red-300 gap-3"
              style={{ width: `${activeSafeZone.right}px` }}
            >
              {detectedCategory === '9:16' && (
                <>
                  <div className="w-8 h-8 rounded-full border border-red-400/40 flex items-center justify-center text-[10px]">❤️</div>
                  <div className="w-8 h-8 rounded-full border border-red-400/40 flex items-center justify-center text-[10px]">💬</div>
                  <div className="w-8 h-8 rounded-full border border-red-400/40 flex items-center justify-center text-[10px]">↗️</div>
                  <span className="text-[9px] text-center">BOTOES</span>
                </>
              )}
            </div>
          </div>

          {/* Bottom Unsafe Area */}
          <div
            className="w-full bg-red-500/10 border-t border-red-500/40 flex flex-col items-center justify-center font-mono text-xs text-red-300 font-bold"
            style={{ height: `${activeSafeZone.bottom}px` }}
          >
            <span>▼ ZONA DE LEGENDAS / PERFIL / SOM ({activeSafeZone.bottom}px) ▼</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoComposition;
