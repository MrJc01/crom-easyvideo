import { useState, useEffect, useRef, useCallback } from 'react';
import type { CalculatedCard, FileAudioConfig, RecordAudioConfig } from '../../core/types';
import {
  playScriptWithSpeechSynthesis,
  stopSpeechSynthesis,
} from '../../tts/providers/browserTts';

export interface UseAudioSlideSyncProps {
  cards: CalculatedCard[];
  totalFrames: number;
  fps: number;
  currentFrame: number;
  setCurrentFrame: (frame: number | ((prev: number) => number)) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  isMuted: boolean;
  activeCard: CalculatedCard | null;
}

export interface UseAudioSlideSyncReturn {
  isSpeaking: boolean;
  isAudioHolding: boolean;
  handleSeek: (targetFrame: number) => void;
  togglePlay: () => void;
}

/**
 * Hook de Sincronização em Lockstep entre Áudio (TTS / Arquivo / Gravação)
 * e o Vídeo Preview do Remotion Studio.
 *
 * Garante que:
 * 1. O áudio nunca seja cortado prematuramente antes do término da fala.
 * 2. Em arquivos/gravações, o hardware de som seja o relógio mestre (zero drift).
 * 3. No TTS, o slide congele no último frame da cena enquanto a fala estiver ativa (slide hold).
 * 4. Ao dar seek/scrub na timeline, o áudio e o frame se posicionem em perfeita sincronia.
 */
export function useAudioSlideSync({
  cards,
  totalFrames,
  fps,
  currentFrame,
  setCurrentFrame,
  isPlaying,
  setIsPlaying,
  isMuted,
  activeCard,
}: UseAudioSlideSyncProps): UseAudioSlideSyncReturn {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isAudioHolding, setIsAudioHolding] = useState<boolean>(false);

  // Instância dedicada de áudio HTML5 com fallback robusto
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  if (!audioPlayerRef.current && typeof Audio !== 'undefined') {
    audioPlayerRef.current = new Audio();
    audioPlayerRef.current.preload = 'auto';
  }

  // Cancelador de TTS ativo
  const ttsCleanupRef = useRef<(() => void) | null>(null);

  // Refs para evitar stale closures em animações e eventos assíncronos
  const isPlayingRef = useRef<boolean>(isPlaying);
  isPlayingRef.current = isPlaying;

  const currentFrameRef = useRef<number>(currentFrame);
  currentFrameRef.current = currentFrame;

  const activeCardRef = useRef<CalculatedCard | null>(activeCard);
  activeCardRef.current = activeCard;

  const cardsRef = useRef<CalculatedCard[]>(cards);
  cardsRef.current = cards;

  const isMutedRef = useRef<boolean>(isMuted);
  isMutedRef.current = isMuted;

  const isSpeakingRef = useRef<boolean>(false);
  const activeAudioUrlRef = useRef<string | null>(null);

  // Parada geral segura de áudio e fala
  const stopAllAudio = useCallback(() => {
    isSpeakingRef.current = false;
    setIsSpeaking(false);
    setIsAudioHolding(false);

    if (ttsCleanupRef.current) {
      ttsCleanupRef.current();
      ttsCleanupRef.current = null;
    }
    stopSpeechSynthesis();

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
  }, []);

  // Iniciar áudio para a cena informada a partir do frame atual
  const playAudioForCard = useCallback(
    (card: CalculatedCard, startFrameOffset: number = 0) => {
      stopAllAudio();

      if (isMutedRef.current) {
        return;
      }

      const audioConfig = card.audio;
      const audioMode = audioConfig?.mode || (card.tts ? 'tts' : 'none');

      // 1. MODO ARQUIVO OU GRAVAÇÃO (Áudio Real)
      if (audioMode === 'file' || audioMode === 'record') {
        const url =
          audioMode === 'file'
            ? (audioConfig as FileAudioConfig)?.fileUrl
            : (audioConfig as RecordAudioConfig)?.blobUrl;

        if (!url || !audioPlayerRef.current) return;

        const audio = audioPlayerRef.current;
        activeAudioUrlRef.current = url;
        audio.src = url;
        audio.muted = isMutedRef.current;

        const localSec = Math.max(0, startFrameOffset / fps);
        audio.currentTime = localSec;

        isSpeakingRef.current = true;
        setIsSpeaking(true);

        audio.onended = () => {
          isSpeakingRef.current = false;
          setIsSpeaking(false);
        };

        audio.onerror = () => {
          isSpeakingRef.current = false;
          setIsSpeaking(false);
        };

        audio.play().catch((err) => {
          console.warn('Playback de áudio suspenso ou bloqueado:', err);
          isSpeakingRef.current = false;
          setIsSpeaking(false);
        });
      }
      // 2. MODO TTS (Síntese de Voz)
      else if (audioMode === 'tts' || card.tts) {
        const script =
          audioConfig && 'script' in audioConfig
            ? audioConfig.script
            : card.tts?.script;
        const speed =
          audioConfig && 'speed' in audioConfig
            ? audioConfig.speed
            : card.tts?.speed || 1.0;
        const voiceId =
          audioConfig && 'voiceId' in audioConfig
            ? audioConfig.voiceId
            : card.tts?.voiceId;

        if (!script || !script.trim()) {
          isSpeakingRef.current = false;
          setIsSpeaking(false);
          return;
        }

        isSpeakingRef.current = true;
        setIsSpeaking(true);

        ttsCleanupRef.current = playScriptWithSpeechSynthesis(
          script,
          speed,
          {
            onStart: () => {
              isSpeakingRef.current = true;
              setIsSpeaking(true);
            },
            onEnd: () => {
              isSpeakingRef.current = false;
              setIsSpeaking(false);
              setIsAudioHolding(false);
            },
            onError: () => {
              isSpeakingRef.current = false;
              setIsSpeaking(false);
              setIsAudioHolding(false);
            },
          },
          voiceId || 'pt-BR-AntonioNeural',
          (audioConfig && 'provider' in audioConfig && audioConfig.provider) || card.tts?.provider || 'cromyvoice'
        );
      }
    },
    [fps, stopAllAudio]
  );

  // Efeito ao Alternar Mudo
  useEffect(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.muted = isMuted;
    }
    if (isMuted) {
      stopSpeechSynthesis();
      setIsSpeaking(false);
    } else if (isPlaying && activeCard) {
      const localOffset = Math.max(0, currentFrame - activeCard.startFrame);
      playAudioForCard(activeCard, localOffset);
    }
  }, [isMuted]);

  // Efeito ao Iniciar ou Pausar Reprodução
  useEffect(() => {
    if (!isPlaying) {
      stopAllAudio();
      return;
    }

    if (activeCard) {
      const localOffset = Math.max(0, currentFrame - activeCard.startFrame);
      playAudioForCard(activeCard, localOffset);
    }

    return () => {
      stopAllAudio();
    };
  }, [isPlaying, activeCard?.id]);

  // Loop de Reprodução Lockstep
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = 1000 / fps;
    const timer = setInterval(() => {
      const current = currentFrameRef.current;
      const active = activeCardRef.current;
      const audio = audioPlayerRef.current;

      if (!active) return;

      const audioMode = active.audio?.mode || (active.tts ? 'tts' : 'none');

      // CASO A: MODO ARQUIVO OU GRAVAÇÃO - ÁUDIO COMO MASTER CLOCK
      if (
        (audioMode === 'file' || audioMode === 'record') &&
        audio &&
        !audio.paused &&
        !audio.ended
      ) {
        const audioCurrentTime = audio.currentTime;
        const targetLocalFrame = Math.floor(audioCurrentTime * fps);
        const maxLocalFrame = active.durationInFrames - 1;
        const targetFrame = active.startFrame + Math.min(maxLocalFrame, targetLocalFrame);

        if (targetFrame !== current) {
          currentFrameRef.current = targetFrame;
          setCurrentFrame(targetFrame);
        }
        return;
      }

      // CASO B: TRANSIÇÃO DE FINAL DE CENA (TTS ou Áudio Finalizado)
      const nextFrame = current + 1;

      // Se atingiu o final nominal do card
      if (nextFrame >= active.endFrame) {
        // Se a fala TTS ainda estiver ativa, segura o slide (SLIDE HOLD)
        if (audioMode === 'tts' && isSpeakingRef.current && !isMutedRef.current) {
          setIsAudioHolding(true);
          // Trava no último frame do card atual para manter o slide visível
          const clamped = active.endFrame - 1;
          if (current !== clamped) {
            currentFrameRef.current = clamped;
            setCurrentFrame(clamped);
          }
          return;
        }

        // Fala finalizada: desativa hold e verifica se é fim do projeto
        setIsAudioHolding(false);

        if (nextFrame >= totalFrames) {
          // Fim do vídeo completo
          stopAllAudio();
          setIsPlaying(false);
          currentFrameRef.current = 0;
          setCurrentFrame(0);
          return;
        }

        // Transiciona para a próxima cena
        const nextCard = cardsRef.current.find((c) => nextFrame >= c.startFrame && nextFrame < c.endFrame);
        currentFrameRef.current = nextFrame;
        setCurrentFrame(nextFrame);

        if (nextCard && nextCard.id !== active.id) {
          playAudioForCard(nextCard, 0);
        }
        return;
      }

      // Avanço de frame padrão dentro do card
      setIsAudioHolding(false);
      currentFrameRef.current = nextFrame;
      setCurrentFrame(nextFrame);
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, fps, totalFrames, playAudioForCard, stopAllAudio, setCurrentFrame]);

  // Handler Universal de Seek / Scrubbing
  const handleSeek = useCallback(
    (targetFrame: number) => {
      const clamped = Math.max(0, Math.min(totalFrames - 1, targetFrame));
      currentFrameRef.current = clamped;
      setCurrentFrame(clamped);

      const targetCard =
        cardsRef.current.find(
          (c) => clamped >= c.startFrame && clamped < c.endFrame
        ) || cardsRef.current[0];

      if (!targetCard) return;

      const localOffset = Math.max(0, clamped - targetCard.startFrame);
      const localSec = localOffset / fps;

      const audioConfig = targetCard.audio;
      const audioMode = audioConfig?.mode || (targetCard.tts ? 'tts' : 'none');

      // Seek em áudio HTML5
      if (audioMode === 'file' || audioMode === 'record') {
        const url =
          audioMode === 'file'
            ? (audioConfig as FileAudioConfig)?.fileUrl
            : (audioConfig as RecordAudioConfig)?.blobUrl;

        if (url && audioPlayerRef.current) {
          const audio = audioPlayerRef.current;
          if (activeAudioUrlRef.current !== url) {
            activeAudioUrlRef.current = url;
            audio.src = url;
          }
          audio.currentTime = localSec;
          if (isPlayingRef.current) {
            audio.play().catch(console.warn);
          } else {
            audio.pause();
          }
        }
      } else if (audioMode === 'tts') {
        // Se estiver reproduzindo e mudar de cena ou posição, reinicia narração da cena
        if (isPlayingRef.current) {
          playAudioForCard(targetCard, localOffset);
        } else {
          stopAllAudio();
        }
      }
    },
    [totalFrames, fps, isPlayingRef, playAudioForCard, stopAllAudio, setCurrentFrame]
  );

  const togglePlay = useCallback(() => {
    setIsPlaying(!isPlayingRef.current);
  }, [setIsPlaying]);

  return {
    isSpeaking,
    isAudioHolding,
    handleSeek,
    togglePlay,
  };
}
