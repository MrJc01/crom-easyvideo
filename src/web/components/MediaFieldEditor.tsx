import React, { useState, useRef, useMemo } from 'react';
import type { MediaAsset } from '../../core/types';
import { Icons } from '../../core/icons';

export interface MediaFieldEditorProps {
  value?: MediaAsset;
  onChange: (val: MediaAsset) => void;
}

/**
 * Cria um MediaAsset com toString() e valueOf() transparentes,
 * evitando que componentes que usem <img src={props.media} /> quebrem com [object Object].
 */
export function createMediaAsset(data: {
  type: 'image' | 'video';
  url: string;
  name?: string;
  duration?: number;
  trimStart?: number;
  trimEnd?: number;
  objectFit?: 'cover' | 'contain' | 'fill';
}): MediaAsset {
  const asset: MediaAsset = {
    type: data.type,
    url: data.url,
    name: data.name,
    duration: data.duration,
    trimStart: data.trimStart ?? 0,
    trimEnd: data.trimEnd ?? 0,
    objectFit: data.objectFit ?? 'cover',
  };

  Object.defineProperty(asset, 'toString', {
    value: function () {
      return this.url || '';
    },
    writable: true,
    configurable: true,
    enumerable: false,
  });

  Object.defineProperty(asset, 'valueOf', {
    value: function () {
      return this.url || '';
    },
    writable: true,
    configurable: true,
    enumerable: false,
  });

  return asset;
}

export const MediaFieldEditor: React.FC<MediaFieldEditorProps> = ({ value, onChange }) => {
  const [videoDuration, setVideoDuration] = useState<number>(value?.duration || 10);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentMedia: MediaAsset = useMemo(() => {
    return (
      value ||
      createMediaAsset({
        type: 'image',
        url: '',
        trimStart: 0,
        trimEnd: 5,
        objectFit: 'cover',
      })
    );
  }, [value]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const url = URL.createObjectURL(file);

    if (isVideo) {
      const tempVideo = document.createElement('video');
      tempVideo.src = url;
      tempVideo.onloadedmetadata = () => {
        const dur = Math.round(tempVideo.duration * 10) / 10 || 10;
        setVideoDuration(dur);
        onChange(
          createMediaAsset({
            type: 'video',
            url,
            name: file.name,
            duration: dur,
            trimStart: 0,
            trimEnd: Math.min(dur, 6),
            objectFit: 'cover',
          })
        );
      };
    } else {
      onChange(
        createMediaAsset({
          type: 'image',
          url,
          name: file.name,
          trimStart: 0,
          trimEnd: 0,
          objectFit: 'cover',
        })
      );
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Icons.Video />
          <span>Upload de Imagem ou Vídeo</span>
        </span>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <Icons.Upload />
          <span>Carregar Arquivo</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {currentMedia.url ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-16 h-12 rounded-lg bg-slate-900 overflow-hidden border border-slate-700 shrink-0">
              {currentMedia.type === 'video' ? (
                <video src={currentMedia.url} className="w-full h-full object-cover" />
              ) : (
                <img src={currentMedia.url} alt="Preview" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <span className="text-xs font-bold text-white block truncate">
                {currentMedia.name || 'Mídia Selecionada'}
              </span>
              <span className="text-[10px] text-indigo-400 font-mono uppercase">
                {currentMedia.type === 'video' ? 'Vídeo Carregado' : 'Imagem'}
              </span>
            </div>
            <button
              onClick={() =>
                onChange(
                  createMediaAsset({
                    type: 'image',
                    url: '',
                    trimStart: 0,
                    trimEnd: 0,
                    objectFit: 'cover',
                  })
                )
              }
              className="p-1 text-slate-400 hover:text-rose-400"
              title="Remover mídia"
            >
              <Icons.Trash />
            </button>
          </div>

          {/* Video Trimmer Controls */}
          {currentMedia.type === 'video' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-indigo-400 font-bold flex items-center gap-1">
                  <Icons.Scissors />
                  <span>Corte do Vídeo (Trim Start & End)</span>
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  Duração: {(currentMedia.trimEnd - currentMedia.trimStart).toFixed(1)}s
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Começo (Trim Start: {currentMedia.trimStart}s)
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(0, (currentMedia.trimEnd || videoDuration) - 0.5)}
                    step={0.1}
                    value={currentMedia.trimStart || 0}
                    onChange={(e) =>
                      onChange(
                        createMediaAsset({
                          ...currentMedia,
                          trimStart: parseFloat(e.target.value) || 0,
                        })
                      )
                    }
                    className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Fim (Trim End: {currentMedia.trimEnd}s)
                  </label>
                  <input
                    type="range"
                    min={(currentMedia.trimStart || 0) + 0.5}
                    max={Math.max(videoDuration, 30)}
                    step={0.1}
                    value={currentMedia.trimEnd || Math.min(videoDuration, 10)}
                    onChange={(e) =>
                      onChange(
                        createMediaAsset({
                          ...currentMedia,
                          trimEnd: parseFloat(e.target.value) || 1,
                        })
                      )
                    }
                    className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-400">Enquadramento:</span>
            <select
              value={currentMedia.objectFit}
              onChange={(e) =>
                onChange(
                  createMediaAsset({
                    ...currentMedia,
                    objectFit: e.target.value as 'cover' | 'contain' | 'fill',
                  })
                )
              }
              className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 text-xs"
            >
              <option value="cover">Preencher (Cover)</option>
              <option value="contain">Conter Inteiro (Contain)</option>
              <option value="fill">Esticar (Fill)</option>
            </select>
          </div>
        </div>
      ) : (
        <div className="text-center py-3">
          <input
            type="text"
            placeholder="Ou cole a URL direta de uma imagem ou vídeo..."
            value={currentMedia.url}
            onChange={(e) => {
              const url = e.target.value;
              const isVid = /\.(mp4|webm|mov|m4v|ogg)(\?|$)/i.test(url);
              onChange(
                createMediaAsset({
                  type: isVid ? 'video' : 'image',
                  url,
                  trimStart: 0,
                  trimEnd: 6,
                  objectFit: 'cover',
                })
              );
            }}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      )}
    </div>
  );
};

export default MediaFieldEditor;
