import { useCallback, useEffect, useRef, useState } from "react";

/** requestAnimationFrame clock for a simulation that ends at `duration` seconds. */
export function useSimClock(duration: number) {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const durRef = useRef(duration);
  const speedRef = useRef(speed);
  const tRef = useRef(0);
  durRef.current = duration;
  speedRef.current = speed;
  tRef.current = t;

  useEffect(() => {
    if (t > duration) setT(duration);
  }, [duration, t]);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000) * speedRef.current;
      last = now;
      const next = tRef.current + dt;
      if (next >= durRef.current) {
        tRef.current = durRef.current;
        setT(durRef.current);
        setPlaying(false);
        return;
      }
      tRef.current = next;
      setT(next);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const play = useCallback(() => {
    if (tRef.current >= durRef.current - 1e-6) {
      tRef.current = 0;
      setT(0);
    }
    setPlaying(true);
  }, []);
  const pause = useCallback(() => setPlaying(false), []);
  const reset = useCallback(() => {
    setPlaying(false);
    tRef.current = 0;
    setT(0);
  }, []);
  const seek = useCallback((v: number) => {
    tRef.current = v;
    setT(v);
  }, []);

  return { t, playing, speed, setSpeed, play, pause, reset, seek };
}
