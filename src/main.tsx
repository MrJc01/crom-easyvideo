import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './web/App';
import './index.css';
import { initCustomTemplatesFromStorage } from './core/customTemplates';

// Restaura templates customizados persistidos no navegador
initCustomTemplatesFromStorage();

import { renderProjectToVideo, drawVideoFrameToCanvas, PLATFORM_PRESETS, QUALITY_PRESETS } from './core/renderEngine';
import { calculateTimeline } from './core/timeline';
import { CARD_REGISTRY } from './templates/registry';

if (typeof window !== 'undefined') {
  (window as any).__renderProjectToVideo = renderProjectToVideo;
  (window as any).__drawVideoFrameToCanvas = drawVideoFrameToCanvas;
  (window as any).__calculateTimeline = calculateTimeline;
  (window as any).__PLATFORM_PRESETS = PLATFORM_PRESETS;
  (window as any).__QUALITY_PRESETS = QUALITY_PRESETS;
  (window as any).__CARD_REGISTRY = CARD_REGISTRY;
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

