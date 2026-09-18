import React, { useState, useRef, useEffect } from 'react';
import type { VideoCard, CardAudioConfig } from '../../core/types';
import { Icons } from '../../core/icons';
import { parseScriptAndDelays } from '../../core/timeline';

export interface AudioSourceSelectorProps {
  card: VideoCard;
  onUpdateCard: (updated: VideoCard) => void;
  fps: number;
}

export const AudioSourceSelector: React.FC<AudioSourceSelectorProps> = ({
  card,
  onUpdateCard,
  fps: _fps,
}) => {
  // Inicialização segura de audio config
  const audioConfig: CardAudioConfig = card.audio || {
    mode: 'tts',
    script: card.tts?.script || '',
    voiceId: card.tts?.voiceId || 'pt-BR-Antonio',
    provider: 'browser-tts',
    speed: card.tts?.speed || 1.0,
    audioDurationInSeconds: card.tts?.audioDurationInSeconds,
  };

  const activeMode = audioConfig.mode;

  // Estados para TTS
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [ttsMeasuredSeconds, setTtsMeasuredSeconds] = useState<number | null>(
    audioConfig.mode === 'tts' && audioConfig.audioDurationInSeconds
      ? audioConfig.audioDurationInSeconds
      : null
  );

  // Estados para Gravação de Microfone
  const [recordState, setRecordState] = useState<'idle' | 'recording' | 'paused' | 'recorded'>('idle');
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);
  const recordingStartTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);

  // Preview de áudio gravado / arquivo
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Parar qualquer reprodução ao desmontar ou trocar de card
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [card.id]);

  // Alternar Modo de Áudio (TTS, Arquivo, Gravação)
  const setMode = (mode: 'tts' | 'file' | 'record') => {
    if (previewAudioRef.current) previewAudioRef.current.pause();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingTTS(false);
    setIsPlayingAudio(false);

    if (mode === 'tts') {
      const updatedAudio: CardAudioConfig = {
        mode: 'tts',
        script:
          audioConfig.mode === 'tts'
            ? audioConfig.script
            : 'Texto de narração sintetizada.',
        voiceId: 'pt-BR-Antonio',
        provider: 'browser-tts',
        speed: 1.0,
      };
      onUpdateCard({
        ...card,
        audio: updatedAudio,
        tts: {
          script: updatedAudio.script,
          voiceId: updatedAudio.voiceId,
          provider: updatedAudio.provider,
          speed: updatedAudio.speed,
        },
      });
    } else if (mode === 'file') {
      const updatedAudio: CardAudioConfig = {
        mode: 'file',
        fileUrl: audioConfig.mode === 'file' ? audioConfig.fileUrl : '',
        fileName: audioConfig.mode === 'file' ? audioConfig.fileName : '',
        audioDurationInSeconds:
          audioConfig.mode === 'file' ? audioConfig.audioDurationInSeconds : 3.0,
      };
      onUpdateCard({ ...card, audio: updatedAudio });
    } else if (mode === 'record') {
      const updatedAudio: CardAudioConfig = {
        mode: 'record',
        blobUrl: audioConfig.mode === 'record' ? audioConfig.blobUrl : '',
        audioDurationInSeconds:
          audioConfig.mode === 'record' ? audioConfig.audioDurationInSeconds : 3.0,
      };
      onUpdateCard({ ...card, audio: updatedAudio });
    }
  };

  // -------------------------------------------------------------------------
  // MODO 1: TTS Handlers
  // -------------------------------------------------------------------------
  const parsedTts = parseScriptAndDelays(
    audioConfig.mode === 'tts' ? audioConfig.script : '',
    audioConfig.mode === 'tts' ? audioConfig.speed : 1.0
  );

  const handleScriptChange = (newScript: string) => {
    if (audioConfig.mode !== 'tts') return;
    const updatedAudio: CardAudioConfig = {
      ...audioConfig,
      script: newScript,
    };
    onUpdateCard({
      ...card,
      audio: updatedAudio,
      tts: {
        script: newScript,
        voiceId: audioConfig.voiceId,
        provider: audioConfig.provider,
        speed: audioConfig.speed,
      },
    });
  };

  const handleSpeedChange = (newSpeed: number) => {
    if (audioConfig.mode !== 'tts') return;
    const updatedAudio: CardAudioConfig = {
      ...audioConfig,
      speed: newSpeed,
    };
    onUpdateCard({
      ...card,
      audio: updatedAudio,
      tts: {
        script: audioConfig.script,
        voiceId: audioConfig.voiceId,
        provider: audioConfig.provider,
        speed: newSpeed,
      },
    });
  };

  const handleVoiceChange = (newVoice: string) => {
    if (audioConfig.mode !== 'tts') return;
    const updatedAudio: CardAudioConfig = {
      ...audioConfig,
      voiceId: newVoice,
    };
    onUpdateCard({
      ...card,
      audio: updatedAudio,
      tts: {
        script: audioConfig.script,
        voiceId: newVoice,
        provider: audioConfig.provider,
        speed: audioConfig.speed,
      },
    });
  };

  const handlePreviewAndMeasureTTS = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isPlayingTTS) {
      window.speechSynthesis.cancel();
      setIsPlayingTTS(false);
      return;
    }

    if (audioConfig.mode !== 'tts' || !audioConfig.script.trim()) return;

    window.speechSynthesis.cancel();
    setIsPlayingTTS(true);

    const segments = parsedTts.segments;
    if (segments.length === 0) {
      setIsPlayingTTS(false);
      return;
    }

    const t0 = performance.now();
    let segmentIndex = 0;

    const playNextSegment = () => {
      if (segmentIndex >= segments.length) {
        const measured = Math.round(((performance.now() - t0) / 1000) * 10) / 10;
        setTtsMeasuredSeconds(measured);
        setIsPlayingTTS(false);

        // Salva duração real medida no card
        const updatedAudio: CardAudioConfig = {
          ...audioConfig,
          audioDurationInSeconds: measured,
        };
        onUpdateCard({
          ...card,
          audio: updatedAudio,
          tts: {
            script: audioConfig.script,
            voiceId: audioConfig.voiceId,
            provider: audioConfig.provider,
            speed: audioConfig.speed,
            audioDurationInSeconds: measured,
          },
        });
        return;
      }

      const seg = segments[segmentIndex];
      segmentIndex++;

      if (seg.type === 'sleep') {
        const ms = (seg.sleepDuration || 1) * 1000;
        setTimeout(playNextSegment, ms);
      } else {
        const utterance = new SpeechSynthesisUtterance(seg.text || '');
        utterance.rate = audioConfig.speed || 1.0;
        utterance.lang = 'pt-BR';
        utterance.onend = () => playNextSegment();
        utterance.onerror = () => setIsPlayingTTS(false);
        window.speechSynthesis.speak(utterance);
      }
    };

    playNextSegment();
  };

  const insertSleepTag = (seconds: number) => {
    if (audioConfig.mode !== 'tts') return;
    const tag = ` [@sleep-${seconds}] `;
    handleScriptChange((audioConfig.script || '') + tag);
  };

  // -------------------------------------------------------------------------
  // MODO 2: Upload de Arquivo de Áudio
  // -------------------------------------------------------------------------
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Decodifica a duração precisa do arquivo via AudioContext
      const arrayBuffer = await file.arrayBuffer();
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtxClass();
      const decoded = await audioCtx.decodeAudioData(arrayBuffer);
      const measuredDuration = Math.round(decoded.duration * 10) / 10;
      audioCtx.close();

      const fileUrl = URL.createObjectURL(file);
      const updatedAudio: CardAudioConfig = {
        mode: 'file',
        fileUrl,
        fileName: file.name,
        audioDurationInSeconds: Math.max(0.5, measuredDuration),
      };

      onUpdateCard({ ...card, audio: updatedAudio });
    } catch (err) {
      console.warn('Erro ao decodificar áudio via AudioContext:', err);
      // Fallback via HTMLAudioElement
      const fileUrl = URL.createObjectURL(file);
      const tempAudio = new Audio(fileUrl);
      tempAudio.onloadedmetadata = () => {
        const duration = Math.round((tempAudio.duration || 3.0) * 10) / 10;
        const updatedAudio: CardAudioConfig = {
          mode: 'file',
          fileUrl,
          fileName: file.name,
          audioDurationInSeconds: duration,
        };
        onUpdateCard({ ...card, audio: updatedAudio });
      };
    }
  };

  // -------------------------------------------------------------------------
  // MODO 3: Gravador de Microfone (WebRTC MediaRecorder)
  // -------------------------------------------------------------------------
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/ogg;codecs=opus';
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      recordedChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;

      setRecordState('recording');
      accumulatedTimeRef.current = 0;
      recordingStartTimeRef.current = performance.now();

      recordingTimerRef.current = window.setInterval(() => {
        const elapsed = (performance.now() - recordingStartTimeRef.current) / 1000;
        setRecordingSeconds(accumulatedTimeRef.current + elapsed);
      }, 100);
    } catch (err) {
      console.error('Permissão de microfone negada ou indisponível:', err);
      alert('Não foi possível acessar o microfone. Verifique as permissões do navegador.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && recordState === 'recording') {
      mediaRecorderRef.current.pause();
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      accumulatedTimeRef.current +=
        (performance.now() - recordingStartTimeRef.current) / 1000;
      setRecordState('paused');
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && recordState === 'paused') {
      mediaRecorderRef.current.resume();
      recordingStartTimeRef.current = performance.now();
      recordingTimerRef.current = window.setInterval(() => {
        const elapsed = (performance.now() - recordingStartTimeRef.current) / 1000;
        setRecordingSeconds(accumulatedTimeRef.current + elapsed);
      }, 100);
      setRecordState('recording');
    }
  };

  const stopAndSaveRecording = async () => {
    if (!mediaRecorderRef.current) return;

    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);

    const recorder = mediaRecorderRef.current;
    const finalSeconds = Math.max(0.5, Math.round(recordingSeconds * 10) / 10);

    const stopPromise = new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });
        resolve(blob);
      };
    });

    recorder.stop();
    const recordedBlob = await stopPromise;

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((t) => t.stop());
    }

    const blobUrl = URL.createObjectURL(recordedBlob);
    const updatedAudio: CardAudioConfig = {
      mode: 'record',
      blobUrl,
      audioDurationInSeconds: finalSeconds,
    };

    onUpdateCard({ ...card, audio: updatedAudio });
    setRecordState('recorded');
  };

  const discardRecording = () => {
    if (mediaRecorderRef.current && recordState === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    setRecordState('idle');
    setRecordingSeconds(0);
    accumulatedTimeRef.current = 0;
  };

  // Preview de Arquivo ou Gravação
  const togglePlayAudioPreview = (url: string) => {
    if (isPlayingAudio && previewAudioRef.current) {
      previewAudioRef.current.pause();
      setIsPlayingAudio(false);
      return;
    }

    if (!previewAudioRef.current) {
      previewAudioRef.current = new Audio(url);
    } else {
      previewAudioRef.current.src = url;
    }

    previewAudioRef.current.onended = () => setIsPlayingAudio(false);
    previewAudioRef.current.onerror = () => setIsPlayingAudio(false);
    previewAudioRef.current.play();
    setIsPlayingAudio(true);
  };

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-4">
      {/* Seletor de Modo de Áudio */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
          <Icons.Mic />
          <span>Fonte de Áudio do Card</span>
        </label>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
          Duração Base: {card.audio?.audioDurationInSeconds || parsedTts.totalDurationSeconds}s
        </span>
      </div>

      {/* 3 Abas Monocromáticas sem Emojis */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800">
        <button
          type="button"
          onClick={() => setMode('tts')}
          className={`py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            activeMode === 'tts'
              ? 'bg-indigo-600 text-white shadow font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Icons.Volume />
          <span>TTS (Voz IA)</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('file')}
          className={`py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            activeMode === 'file'
              ? 'bg-indigo-600 text-white shadow font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Icons.Upload />
          <span>Arquivo Áudio</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('record')}
          className={`py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            activeMode === 'record'
              ? 'bg-indigo-600 text-white shadow font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Icons.Mic />
          <span>Gravar Microfone</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* ABA 1: TTS (Padrão) */}
      {/* ===================================================================== */}
      {activeMode === 'tts' && audioConfig.mode === 'tts' && (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">Roteiro de Fala:</span>
            <button
              type="button"
              onClick={handlePreviewAndMeasureTTS}
              className={`text-xs px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 transition ${
                isPlayingTTS
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600 hover:text-white'
              }`}
            >
              {isPlayingTTS ? <Icons.Pause /> : <Icons.Play />}
              <span>{isPlayingTTS ? 'Parar Áudio' : 'Ouvir e Medir Duração'}</span>
            </button>
          </div>

          <textarea
            value={audioConfig.script}
            onChange={(e) => handleScriptChange(e.target.value)}
            rows={3}
            placeholder="Digite o texto que a voz neural irá narrar nesta cena..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
          />

          {/* Inserção de Pausas */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-slate-400">Inserir pausa entre frases:</span>
              <span className="text-[10px] text-slate-500 font-mono">Adiciona ao final</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[0.5, 1, 1.5, 2].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => insertSleepTag(sec)}
                  className="px-2 py-0.5 rounded bg-slate-900 hover:bg-indigo-950/60 border border-slate-800 text-[11px] font-mono text-slate-300 hover:text-indigo-300 transition"
                >
                  +{sec}s pausa
                </button>
              ))}
            </div>
          </div>

          {/* Configurações de Voz e Velocidade */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Voz do Sistema</label>
              <select
                value={audioConfig.voiceId}
                onChange={(e) => handleVoiceChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="pt-BR-Antonio">Antonio (Português - Masculino)</option>
                <option value="pt-BR-Francisca">Francisca (Português - Feminino)</option>
                <option value="pt-BR-Brenda">Brenda (Português - Jovem)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Velocidade</span>
                <span className="font-mono text-indigo-400 font-bold">{audioConfig.speed}x</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.6"
                step="0.1"
                value={audioConfig.speed}
                onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>

          {ttsMeasuredSeconds && (
            <div className="p-2.5 rounded-lg bg-indigo-950/60 border border-indigo-800/60 text-xs font-mono text-indigo-300 flex items-center justify-between">
              <span>Duração Real Medida da Fala:</span>
              <span className="font-bold text-white">{ttsMeasuredSeconds}s</span>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* ABA 2: Upload de Arquivo de Áudio */}
      {/* ===================================================================== */}
      {activeMode === 'file' && audioConfig.mode === 'file' && (
        <div className="space-y-3">
          <div className="p-4 border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl bg-slate-900/50 text-center transition flex flex-col items-center justify-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Icons.Upload />
            </div>
            <div>
              <label className="cursor-pointer text-xs font-bold text-indigo-400 hover:text-indigo-300 underline">
                Clique para enviar arquivo de áudio
                <input
                  type="file"
                  accept="audio/mp3,audio/wav,audio/m4a,audio/ogg,audio/aac"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Suporta MP3, WAV, M4A, OGG. A duração é calculada automaticamente.
              </p>
            </div>
          </div>

          {audioConfig.fileUrl && (
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={() => togglePlayAudioPreview(audioConfig.fileUrl)}
                  className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shrink-0 transition"
                  title="Ouvir áudio"
                >
                  {isPlayingAudio ? <Icons.Pause /> : <Icons.Play />}
                </button>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-200 block truncate">
                    {audioConfig.fileName || 'audio-carregado.mp3'}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">
                    Duração exata: {audioConfig.audioDurationInSeconds}s
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 shrink-0">
                Áudio Conectado
              </span>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* ABA 3: Gravação de Microfone */}
      {/* ===================================================================== */}
      {activeMode === 'record' && (
        <div className="space-y-3">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-3 text-center">
            <div className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  recordState === 'recording'
                    ? 'bg-rose-500 animate-ping'
                    : recordState === 'paused'
                    ? 'bg-amber-500'
                    : 'bg-slate-600'
                }`}
              />
              <span className="text-sm font-mono font-bold text-white">
                {recordState === 'recording' || recordState === 'paused'
                  ? `${recordingSeconds.toFixed(1)}s gravados`
                  : recordState === 'recorded'
                  ? `Gravação salva: ${audioConfig.mode === 'record' ? audioConfig.audioDurationInSeconds : 0}s`
                  : 'Pronto para gravar sua voz'}
              </span>
            </div>

            {/* Controles de Gravação */}
            <div className="flex items-center gap-2">
              {recordState === 'idle' && (
                <button
                  type="button"
                  onClick={startRecording}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-600/20 transition"
                >
                  <Icons.Mic />
                  <span>Iniciar Gravação</span>
                </button>
              )}

              {recordState === 'recording' && (
                <>
                  <button
                    type="button"
                    onClick={pauseRecording}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Icons.Pause />
                    <span>Pausar</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopAndSaveRecording}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Icons.Check />
                    <span>Concluir & Salvar</span>
                  </button>
                  <button
                    type="button"
                    onClick={discardRecording}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                    title="Descartar"
                  >
                    <Icons.Trash />
                  </button>
                </>
              )}

              {recordState === 'paused' && (
                <>
                  <button
                    type="button"
                    onClick={resumeRecording}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Icons.Play />
                    <span>Continuar</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopAndSaveRecording}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Icons.Check />
                    <span>Concluir & Salvar</span>
                  </button>
                  <button
                    type="button"
                    onClick={discardRecording}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                    title="Descartar"
                  >
                    <Icons.Trash />
                  </button>
                </>
              )}

              {recordState === 'recorded' && (
                <button
                  type="button"
                  onClick={startRecording}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Icons.Mic />
                  <span>Gravar Novamente</span>
                </button>
              )}
            </div>
          </div>

          {audioConfig.mode === 'record' && audioConfig.blobUrl && (
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => togglePlayAudioPreview(audioConfig.blobUrl)}
                  className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shrink-0 transition"
                  title="Ouvir gravação"
                >
                  {isPlayingAudio ? <Icons.Pause /> : <Icons.Play />}
                </button>
                <div>
                  <span className="text-xs font-bold text-slate-200 block">
                    Gravação de Voz do Microfone
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">
                    Duração exata: {audioConfig.audioDurationInSeconds}s
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 shrink-0">
                Gravado e Ativo
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AudioSourceSelector;
