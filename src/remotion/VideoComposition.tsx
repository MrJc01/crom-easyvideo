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
    return found || calculatedCards[0] || null;
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

  if (!activeCard || !CurrentTemplateComponent) {
    return null;
  }

  return (
    <div className={`w-full h-full relative overflow-hidden ${className}`}>
      <CurrentTemplateComponent
        props={activeCard.props}
        frame={localFrame}
        fps={project.meta.fps}
      />
    </div>
  );
};

export default VideoComposition;
