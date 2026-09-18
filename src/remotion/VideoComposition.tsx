import React, { useMemo } from 'react';
import type { ProjectState, CalculatedCard } from '../core/types';
import { CARD_REGISTRY } from '../templates/registry';

export interface VideoCompositionProps {
  project: ProjectState;
  calculatedCards: CalculatedCard[];
  currentFrame: number;
  className?: string;
}

export const VideoComposition: React.FC<VideoCompositionProps> = ({
  project,
  calculatedCards,
  currentFrame,
  className = '',
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

  return (
    <div
      style={transitionStyle}
      className={`w-full h-full relative overflow-hidden ${className}`}
    >
      <CurrentTemplateComponent
        props={activeCard.props}
        frame={localFrame}
        fps={project.meta.fps}
      />
    </div>
  );
};

export default VideoComposition;
