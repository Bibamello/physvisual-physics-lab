import { useEffect, useRef, useState } from "react";
import type { Sample, SeriesDef } from "@/lib/simulations";

const TONE: Record<SeriesDef["tone"], string> = {
  cyan: "var(--primary)",
  violet: "var(--violet)",
  amber: "var(--amber)",
};

interface Props {
  def: SeriesDef;
  data: Sample[];
  t: number;
  current: number;
}

const H = 190;
const PAD = { l: 44, r: 14, t: 14, b: 26 };

export function LiveChart({ def, data, t, current }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(480);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => e && setW(Math.max(240, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const T = data[data.length - 1]?.t || 1;
  const vals = data.map((d) => d[def.key]);
  let lo = Math.min(0, ...vals);
  let hi = Math.max(0, ...vals);
  if (hi - lo < 1e-6) hi = lo + 1;
  const padV = (hi - lo) * 0.08;
  lo -= lo < 0 ? padV : 0;
  hi += padV;
  const X = (x: number) => PAD.l + (x / T) * (w - PAD.l - PAD.r);
  const Y = (y: number) => PAD.t + (1 - (y - lo) / (hi - lo)) * (H - PAD.t - PAD.b);
  const path = (pts: Sample[]) => pts.map((d, i) => `${i ? "L" : "M"}${X(d.t).toFixed(1)},${Y(d[def.key]).toFixed(1)}`).join("");
  const done = data.filter((d) => d.t <= t);
  const color = TONE[def.tone];
  const gid = `lc-${def.key}-${def.tone}`;
  const yTicks = [lo, lo + (hi - lo) / 3, lo + (2 * (hi - lo)) / 3, hi];
  const xTicks = [0, T / 4, T / 2, (3 * T) / 4, T];
  const area = done.length > 1 ? `${path(done)}L${X(Math.min(t, T))},${Y(Math.max(lo, 0))}L${X(0)},${Y(Math.max(lo, 0))}Z` : "";

  return (
    <div className="glass min-w-0 rounded-2xl p-4">
      <div className="flex items-baseline justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="size-2 rounded-full" style={{ background: color }} />
          {def.label}
          <span className="text-muted-foreground">vs time</span>
        </div>
        <div className="font-mono text-sm tabular" style={{ color }}>
          {current.toFixed(2)} <span className="text-muted-foreground">{def.unit}</span>
        </div>
      </div>
      <div ref={ref} className="mt-2 w-full overflow-hidden">
        <svg width={w} height={H} className="block overflow-visible">
          <defs>
            <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={color} stopOpacity="0.28" />
              <stop offset="1" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          {yTicks.map((v, i) => (
            <g key={i}>
              <line x1={PAD.l} x2={w - PAD.r} y1={Y(v)} y2={Y(v)} stroke="var(--border)" />
              <text x={PAD.l - 8} y={Y(v) + 4} textAnchor="end" fontSize="10" fill="var(--muted-foreground)" fontFamily="var(--font-mono)">
                {Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(1)}
              </text>
            </g>
          ))}
          {lo < 0 && <line x1={PAD.l} x2={w - PAD.r} y1={Y(0)} y2={Y(0)} stroke="var(--muted-foreground)" strokeOpacity="0.4" />}
          {xTicks.map((v, i) => (
            <text key={i} x={X(v)} y={H - 6} textAnchor="middle" fontSize="10" fill="var(--muted-foreground)" fontFamily="var(--font-mono)">
              {v.toFixed(1)}s
            </text>
          ))}
          <path d={path(data)} fill="none" stroke={color} strokeOpacity="0.25" strokeWidth="1.5" strokeDasharray="4 5" />
          {area && <path d={area} fill={`url(#${gid})`} />}
          {done.length > 1 && <path d={path(done)} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />}
          <line x1={X(Math.min(t, T))} x2={X(Math.min(t, T))} y1={PAD.t} y2={H - PAD.b} stroke={color} strokeOpacity="0.35" />
          <circle cx={X(Math.min(t, T))} cy={Y(current)} r="5" fill={color} stroke="var(--background)" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
}
