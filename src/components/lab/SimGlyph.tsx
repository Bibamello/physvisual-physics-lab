import type { SimId } from "@/lib/simulations";
import { cn } from "@/lib/utils";

/** Small animated diagram used on catalog and dashboard cards. */
export function SimGlyph({ id, className }: { id: SimId; className?: string }) {
  return (
    <svg viewBox="0 0 160 90" className={cn("h-full w-full", className)} aria-hidden="true">
      <defs>
        <linearGradient id={`g-${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="var(--primary)" />
          <stop offset="1" stopColor="var(--violet)" />
        </linearGradient>
      </defs>
      {id === "projectile" && (
        <>
          <path d="M10 78 H150" stroke="var(--border)" strokeWidth="1.5" />
          <path id="pp" d="M16 78 Q 80 -10 144 78" fill="none" stroke={`url(#g-${id})`} strokeWidth="2" strokeDasharray="4 5" className="animate-dash" />
          <circle r="5" fill="var(--primary)">
            <animateMotion dur="2.8s" repeatCount="indefinite" path="M16 78 Q 80 -10 144 78" />
          </circle>
        </>
      )}
      {id === "free-fall" && (
        <>
          <rect x="30" y="10" width="14" height="70" rx="2" fill="var(--secondary)" />
          {[20, 35, 50, 65].map((y) => (
            <path key={y} d={`M44 ${y} H52`} stroke="var(--muted-foreground)" strokeOpacity="0.5" />
          ))}
          <path d="M20 80 H140" stroke="var(--border)" strokeWidth="1.5" />
          <circle cx="90" r="6" fill="var(--primary)">
            <animate attributeName="cy" values="14;74;74" keyTimes="0;0.7;1" dur="2.2s" repeatCount="indefinite" calcMode="spline" keySplines="0.55 0 1 0.45;0 0 1 1" />
          </circle>
          <path d="M110 18 V70" stroke="var(--violet)" strokeWidth="2" markerEnd="" />
          <path d="M105 62 L110 70 L115 62" fill="none" stroke="var(--violet)" strokeWidth="2" />
          <text x="118" y="44" fontSize="10" fill="var(--muted-foreground)" fontFamily="var(--font-mono)">g</text>
        </>
      )}
      {id === "kinematics" && (
        <>
          <path d="M10 66 H150" stroke="var(--border)" strokeWidth="1.5" />
          {[20, 50, 80, 110, 140].map((x) => (
            <path key={x} d={`M${x} 66 V71`} stroke="var(--muted-foreground)" strokeOpacity="0.5" />
          ))}
          <g>
            <animateTransform attributeName="transform" type="translate" values="0 0; 100 0" dur="2.6s" repeatCount="indefinite" calcMode="spline" keySplines="0.6 0 1 1" keyTimes="0;1" />
            <rect x="14" y="44" width="34" height="16" rx="5" fill={`url(#g-${id})`} />
            <circle cx="22" cy="62" r="4" fill="var(--foreground)" />
            <circle cx="40" cy="62" r="4" fill="var(--foreground)" />
          </g>
          <path d="M10 30 Q 90 30 150 12" fill="none" stroke="var(--violet)" strokeOpacity="0.6" strokeDasharray="3 4" />
        </>
      )}
      {id === "dynamics" && (
        <>
          <path d="M20 80 L140 80 L140 24 Z" fill="var(--secondary)" />
          <g>
            <animateMotion dur="3s" repeatCount="indefinite" path="M118 34.3 L46 67.9" keyPoints="0;1;1" keyTimes="0;0.75;1" calcMode="spline" keySplines="0.5 0 1 1;0 0 1 1" />
            <g transform="rotate(-25)">
              <rect x="-13" y="-18" width="26" height="18" rx="3" fill={`url(#g-${id})`} />
            </g>
          </g>
          <path d="M30 80 A 14 14 0 0 1 32 72" fill="none" stroke="var(--primary)" />
          <text x="36" y="76" fontSize="9" fill="var(--muted-foreground)" fontFamily="var(--font-mono)">θ</text>
        </>
      )}
      {id === "newtons-laws" && (
        <>
          <path d="M10 70 H150" stroke="var(--border)" strokeWidth="1.5" />
          <g>
            <animateTransform attributeName="transform" type="translate" values="0 0; 60 0; 0 0" dur="3.4s" repeatCount="indefinite" />
            <rect x="46" y="40" width="30" height="30" rx="4" fill={`url(#g-${id})`} />
            <path d="M18 55 H42" stroke="var(--amber)" strokeWidth="2.5" />
            <path d="M36 50 L43 55 L36 60" fill="none" stroke="var(--amber)" strokeWidth="2.5" />
          </g>
          <text x="104" y="30" fontSize="11" fill="var(--muted-foreground)" fontFamily="var(--font-mono)">F = ma</text>
        </>
      )}
    </svg>
  );
}
