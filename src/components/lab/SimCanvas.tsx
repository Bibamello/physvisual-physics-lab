import { useEffect, useRef, useState } from "react";
import type { Params, Sample, SimDefinition } from "@/lib/simulations";
import { drawScene, readTheme, type Theme } from "./draw";

interface Props {
  sim: SimDefinition;
  params: Params;
  sample: Sample;
  series: Sample[];
}

export function SimCanvas({ sim, params, sample, series }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const themeRef = useRef<Theme | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    themeRef.current = readTheme(el);
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !size.w || !themeRef.current) return;
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== size.w * dpr || canvas.height !== size.h * dpr) {
      canvas.width = size.w * dpr;
      canvas.height = size.h * dpr;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawScene(ctx, size.w, size.h, themeRef.current, sim, params, sample, series);
  }, [size, sim, params, sample, series]);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas
        ref={canvasRef}
        style={{ width: size.w, height: size.h }}
        className="block"
        role="img"
        aria-label={`${sim.title} simulation`}
      />
    </div>
  );
}
