import { useEffect, useState } from 'react';

export interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

function compute(targetMs: number): CountdownState {
  const diff = targetMs - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    isPast: false,
  };
}

export function useCountdown(targetIso: string): CountdownState {
  const targetMs = new Date(targetIso).getTime();
  const [state, setState] = useState<CountdownState>(() => compute(targetMs));

  useEffect(() => {
    let interval: number | undefined;

    const start = () => {
      setState(compute(targetMs));
      interval = window.setInterval(() => setState(compute(targetMs)), 1000);
    };
    const stop = () => {
      if (interval !== undefined) window.clearInterval(interval);
      interval = undefined;
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else {
        stop();
        start();
      }
    };

    start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [targetMs]);

  return state;
}
