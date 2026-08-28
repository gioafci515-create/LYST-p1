import { useCallback, useEffect, useRef, useState } from 'react';

const TARGET_VOLUME = 0.55;

/**
 * Background music. `start()` must be called from a user gesture (the
 * envelope tap). Volume ramps 0 → 0.55 over 1.2s on start, fades out over
 * 400ms on pause. Pauses when the tab hides; resumes only if it was playing.
 *
 * If the audio file is missing (404) or unsupported, `audioAvailable`
 * flips false so the toggle can hide — silent degradation, no error UI.
 */
export function useAudio(src: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<number | undefined>(undefined);
  const wasPlayingRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioAvailable, setAudioAvailable] = useState(true);

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio(src);
      audio.loop = true;
      audio.preload = 'none';
      audio.addEventListener('error', () => setAudioAvailable(false));
      audioRef.current = audio;
    }
    return audioRef.current;
  }, [src]);

  const clearFade = () => {
    if (fadeRef.current !== undefined) {
      window.clearInterval(fadeRef.current);
      fadeRef.current = undefined;
    }
  };

  const fadeTo = useCallback(
    (audio: HTMLAudioElement, target: number, durationMs: number, onDone?: () => void) => {
      clearFade();
      const stepMs = 50;
      const steps = Math.max(1, Math.round(durationMs / stepMs));
      const delta = (target - audio.volume) / steps;
      let i = 0;
      fadeRef.current = window.setInterval(() => {
        i += 1;
        audio.volume = Math.min(1, Math.max(0, audio.volume + delta));
        if (i >= steps) {
          audio.volume = target;
          clearFade();
          onDone?.();
        }
      }, stepMs);
    },
    [],
  );

  const start = useCallback(() => {
    const audio = getAudio();
    audio.volume = 0;
    audio
      .play()
      .then(() => {
        setIsPlaying(true);
        wasPlayingRef.current = true;
        fadeTo(audio, TARGET_VOLUME, 1200);
      })
      .catch((err: unknown) => {
        // Missing/unsupported source → hide the toggle entirely.
        // Autoplay policy (NotAllowedError) → keep the toggle, stay paused.
        if (err instanceof DOMException && err.name === 'NotSupportedError') {
          setAudioAvailable(false);
        }
        setIsPlaying(false);
        wasPlayingRef.current = false;
      });
  }, [getAudio, fadeTo]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setIsPlaying(false);
    wasPlayingRef.current = false;
    fadeTo(audio, 0, 400, () => audio.pause());
  }, [fadeTo]);

  const toggle = useCallback(() => {
    if (isPlaying) pause();
    else start();
  }, [isPlaying, pause, start]);

  useEffect(() => {
    const onVisibility = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (document.hidden) {
        if (!audio.paused) {
          wasPlayingRef.current = true;
          audio.pause();
          setIsPlaying(false);
        }
      } else if (wasPlayingRef.current) {
        audio
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    return () => {
      clearFade();
      audioRef.current?.pause();
    };
  }, []);

  return { isPlaying, audioAvailable, start, toggle };
}
