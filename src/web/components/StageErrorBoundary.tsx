import React from 'react';
import { Icons } from '../../core/icons';

export interface StageErrorBoundaryProps {
  children: React.ReactNode;
  resetKey?: any;
  title?: string;
}

export interface StageErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class StageErrorBoundary extends React.Component<
  StageErrorBoundaryProps,
  StageErrorBoundaryState
> {
  constructor(props: StageErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): StageErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[Template Stage Error Caught]:', error, errorInfo);
  }

  componentDidUpdate(prevProps: StageErrorBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-rose-950/90 p-6 text-rose-200 text-center font-mono select-text">
          <div className="w-10 h-10 rounded-xl bg-rose-900/80 flex items-center justify-center text-rose-300 mb-2.5 border border-rose-700">
            <Icons.AlertTriangle />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-rose-300 mb-1">
            {this.props.title || 'Falha ao Renderizar Template'}
          </h3>
          <p className="text-[11px] max-w-md bg-black/70 p-2.5 rounded-lg border border-rose-800/80 text-rose-300 overflow-x-auto text-left whitespace-pre-wrap mb-2">
            {this.state.error?.message || 'Erro desconhecido'}
          </p>
          <span className="text-[10px] text-rose-400/80">
            Verifique as propriedades ou o código do componente.
          </span>
        </div>
      );
    }
    return this.props.children;
  }
}
