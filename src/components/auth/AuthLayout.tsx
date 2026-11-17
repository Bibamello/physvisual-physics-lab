import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { SimGlyph } from "@/components/lab/SimGlyph";

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: ReactNode; children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.05fr]">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Logo />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12 animate-fade-up">
          <h1 className="text-3xl font-semibold">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
      <div className="relative hidden overflow-hidden border-l border-border/60 bg-hero lg:block">
        <div className="absolute inset-0 bg-lab-grid" aria-hidden="true" />
        <div className="relative flex h-full flex-col justify-center p-14">
          <div className="glass rounded-3xl p-6">
            <div className="aspect-[16/9] rounded-2xl bg-background/50 p-4">
              <SimGlyph id="projectile" />
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 font-mono text-xs">
              {[
                ["v₀", "25.0 m/s"],
                ["θ", "45°"],
                ["R", "63.71 m"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-glass-border bg-background/50 px-3 py-2">
                  <div className="text-muted-foreground">{k}</div>
                  <div className="mt-0.5 text-primary">{v}</div>
                </div>
              ))}
            </div>
          </div>
          <blockquote className="mt-10 max-w-md font-display text-2xl leading-snug">
            “Nature uses only the longest threads to weave her patterns.”
          </blockquote>
          <p className="mt-3 text-sm text-muted-foreground">Richard Feynman</p>
        </div>
      </div>
    </div>
  );
}
