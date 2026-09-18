/**
 * @deprecated Este arquivo monolítico foi fatiado e modularizado seguindo SRP.
 * Todas as definições foram distribuídas em suas respectivas camadas em `src/`.
 * Este arquivo permanece como uma fachada de compatibilidade retroativa.
 */

export * from './src/core/types';
export * from './src/core/animations';
export * from './src/core/timeline';
export * from './src/core/icons';
export * from './src/core/initialState';
export * from './src/tts/interface';
export * from './src/tts/providers/browserTts';
export * from './src/remotion/MediaRenderer';
export * from './src/remotion/VideoComposition';
export * from './src/templates/registry';
export * from './src/web/components';
export { default } from './src/web/App';