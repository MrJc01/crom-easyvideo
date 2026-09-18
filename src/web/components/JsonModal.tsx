import React, { useState, useEffect, useRef } from 'react';
import type { ProjectState } from '../../core/types';
import { Icons } from '../../core/icons';

export interface JsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectState;
  onImport: (imported: ProjectState) => void;
}

export const JsonModal: React.FC<JsonModalProps> = ({
  isOpen,
  onClose,
  project,
  onImport,
}) => {
  const [jsonText, setJsonText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setJsonText(JSON.stringify(project, null, 2));
      setErrorMsg(null);
      setCopied(false);
    }
  }, [isOpen, project]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `video-project-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        setJsonText(content);
        const parsed = JSON.parse(content);
        if (!parsed.meta || !Array.isArray(parsed.cards)) {
          throw new Error('Formato inválido. O JSON deve conter "meta" e "cards".');
        }
        onImport(parsed);
        onClose();
      } catch (err: any) {
        setErrorMsg(err.message || 'Erro ao carregar arquivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleValidateAndImport = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed.meta || !Array.isArray(parsed.cards)) {
        throw new Error('JSON inválido: O arquivo deve conter os nós "meta" e o array "cards".');
      }
      onImport(parsed);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao analisar JSON.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl flex flex-col max-h-[88vh]">
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-800">
          <div className="min-w-0 pr-2">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 truncate">
              <Icons.Download />
              <span>Importar / Exportar JSON</span>
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400 truncate">
              Copie o código JSON ou faça upload de um arquivo para restaurar seu projeto.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm shrink-0"
          >
            <Icons.Close />
          </button>
        </div>

        {errorMsg && (
          <div className="my-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {errorMsg}
          </div>
        )}

        <div className="flex-1 py-3 overflow-hidden">
          <textarea
            rows={10}
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value);
              setErrorMsg(null);
            }}
            className="w-full h-full min-h-[160px] bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-indigo-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-slate-800 gap-2.5 sm:gap-2">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <button
              onClick={handleCopy}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Icons.Copy />
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Icons.Download />
              <span>Baixar .json</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Icons.Upload />
              <span>Subir Arquivo</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          <button
            onClick={handleValidateAndImport}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30"
          >
            Importar e Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};

export default JsonModal;
