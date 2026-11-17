import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("size-8", className)} aria-hidden="true">
      <defs>
        <linearGradient id="pv-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--primary)" />
          <stop offset="1" stopColor="var(--violet)" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="11" fill="url(#pv-mark)" opacity="0.16" />
      <rect x="1" y="1" width="38" height="38" rx="11" fill="none" stroke="url(#pv-mark)" strokeWidth="1.5" />
      <path d="M8 30 Q 20 -2 32 30" fill="none" stroke="url(#pv-mark)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M6 31 H34" stroke="var(--primary)" strokeOpacity="0.4" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="26.5" cy="17" r="3.2" fill="var(--primary)" />
    </svg>
  );
}

export function Logo({ className, to = "/" }: { className?: string; to?: "/" | "/dashboard" }) {
  return (
    <Link to={to} className={cn("group inline-flex items-center gap-2.5", className)} aria-label="PhysVisual home">
      <LogoMark className="transition-transform duration-300 group-hover:rotate-[-6deg]" />
      <span className="font-display text-lg font-semibold tracking-tight">
        Phys<span className="text-gradient">Visual</span>
      </span>
    </Link>
  );
}
