/** Animated "lab window" for the landing hero: trajectory, pendulum and live readouts. */
export function HeroIllustration() {
  return (
    <div className="relative">
      <div className="absolute -inset-10 rounded-full bg-violet/20 blur-3xl" aria-hidden="true" />
      <div className="glass relative overflow-hidden rounded-3xl">
        <div className="flex items-center justify-between border-b border-glass-border px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-destructive/70" />
            <span className="size-2.5 rounded-full bg-amber/70" />
            <span className="size-2.5 rounded-full bg-success/70" />
          </div>
          <span className="font-mono text-[11px] text-muted-foreground">lab / projectile-launcher</span>
          <span className="flex items-center gap-1.5 font-mono text-[11px] text-success">
            <span className="relative flex size-2">
              <span className="absolute inset-0 animate-pulse-ring rounded-full bg-success" />
              <span className="relative size-2 rounded-full bg-success" />
            </span>
            LIVE
          </span>
        </div>
        <div className="relative bg-lab-grid">
          <svg viewBox="0 0 520 320" className="block w-full" role="img" aria-label="A ball following a parabolic trajectory next to a swinging pendulum">
            <defs>
              <linearGradient id="hero-arc" x1="0" x2="1">
                <stop offset="0" stopColor="var(--primary)" />
                <stop offset="1" stopColor="var(--violet)" />
              </linearGradient>
              <radialGradient id="hero-ball">
                <stop offset="0" stopColor="var(--foreground)" />
                <stop offset="0.5" stopColor="var(--primary)" />
                <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
              </radialGradient>
            </defs>
            <path d="M20 270 H500" stroke="var(--primary)" strokeOpacity="0.35" strokeWidth="1.5" />
            {Array.from({ length: 10 }, (_, i) => (
              <g key={i}>
                <path d={`M${40 + i * 48} 270 V278`} stroke="var(--muted-foreground)" strokeOpacity="0.5" />
                <text x={40 + i * 48} y="292" textAnchor="middle" fontSize="9" fill="var(--muted-foreground)" fontFamily="var(--font-mono)">
                  {i * 8}m
                </text>
              </g>
            ))}
            <path d="M40 270 Q 210 -20 380 270" fill="none" stroke="url(#hero-arc)" strokeWidth="2.5" strokeDasharray="6 8" className="animate-dash" />
            <path d="M40 270 L 90 190" stroke="var(--amber)" strokeWidth="2" />
            <path d="M82 192 L90 190 L89 198" fill="none" stroke="var(--amber)" strokeWidth="2" />
            <text x="96" y="200" fontSize="11" fill="var(--amber)" fontFamily="var(--font-mono)">v₀</text>
            <path d="M40 270 m 34 0 A 34 34 0 0 0 58 241" fill="none" stroke="var(--primary)" strokeOpacity="0.7" />
            <text x="80" y="258" fontSize="10" fill="var(--muted-foreground)" fontFamily="var(--font-mono)">58°</text>
            <circle r="16" fill="url(#hero-ball)" opacity="0.5">
              <animateMotion dur="3.2s" repeatCount="indefinite" path="M40 270 Q 210 -20 380 270" />
            </circle>
            <circle r="7" fill="var(--primary)">
              <animateMotion dur="3.2s" repeatCount="indefinite" path="M40 270 Q 210 -20 380 270" />
            </circle>
            <path d="M210 125 V270" stroke="var(--violet)" strokeOpacity="0.45" strokeDasharray="3 5" />
            <text x="216" y="120" fontSize="10" fill="var(--violet)" fontFamily="var(--font-mono)">Hₘₐₓ = 19.8 m</text>

            <g transform="translate(450 40)">
              <path d="M-26 0 H26" stroke="var(--muted-foreground)" strokeWidth="2" />
              <g className="animate-swing" style={{ transformOrigin: "0px 0px", transformBox: "view-box" }}>
                <path d="M0 0 V120" stroke="var(--foreground)" strokeOpacity="0.6" strokeWidth="1.2" />
                <circle cy="128" r="11" fill="url(#hero-arc)" />
              </g>
            </g>
          </svg>
          <div className="absolute left-4 top-4 hidden gap-2 sm:flex">
            {[
              ["t", "1.84 s"],
              ["x", "24.6 m"],
              ["vᵧ", "−3.1 m/s"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-glass-border bg-background/60 px-2.5 py-1.5 font-mono text-[11px] backdrop-blur">
                <span className="text-muted-foreground">{k} </span>
                <span className="text-primary">{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 border-t border-glass-border font-mono text-[11px]">
          {[
            ["Range", "39.6 m"],
            ["Flight time", "3.99 s"],
            ["g", "9.81 m/s²"],
          ].map(([k, v]) => (
            <div key={k} className="border-r border-glass-border px-4 py-3 last:border-r-0">
              <div className="text-muted-foreground">{k}</div>
              <div className="mt-0.5 text-sm text-foreground">{v}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="glass absolute -bottom-6 -left-6 hidden animate-float rounded-2xl px-4 py-3 lg:block">
        <div className="font-mono text-[11px] text-muted-foreground">Newton's 2nd law</div>
        <div className="font-display text-lg text-gradient">ΣF = m·a</div>
      </div>
    </div>
  );
}
