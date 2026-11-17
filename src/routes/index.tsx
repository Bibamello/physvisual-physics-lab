import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Atom, BarChart3, FlaskConical, Gauge, GraduationCap, Play, Sigma, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { HeroIllustration } from "@/components/marketing/HeroIllustration";
import { PricingPlans } from "@/components/pricing/PricingPlans";
import { SimGlyph } from "@/components/lab/SimGlyph";
import { SIMULATIONS } from "@/lib/simulations";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PhysVisual — Understand Physics. See It in Motion." },
      { name: "description", content: "Interactive mechanics simulations with live graphs, real formulas and instant parameter control for students and teachers." },
      { property: "og:title", content: "PhysVisual — Understand Physics. See It in Motion." },
      { property: "og:description", content: "Interactive mechanics simulations with live graphs, real formulas and instant parameter control." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: SlidersHorizontal, title: "Real-time parameters", text: "Drag a slider and the experiment, graphs and equations respond in the same frame." },
  { icon: BarChart3, title: "Live graphs", text: "Position, velocity and height plotted as the motion happens, with the full prediction ghosted behind." },
  { icon: Sigma, title: "Formulas that show their work", text: "Every equation is substituted with your current numbers, so the math never feels abstract." },
  { icon: FlaskConical, title: "Saved experiments", text: "Store a configuration, name it and reopen it next lesson exactly where you left off." },
  { icon: GraduationCap, title: "Built for the syllabus", text: "Aligned with IB, A-Level and AP Physics 1 mechanics units, from kinematics to friction." },
  { icon: Gauge, title: "Any planet, any gravity", text: "Switch from Earth to the Moon or Mars and watch every trajectory stretch or shrink." },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden bg-hero">
          <div className="absolute inset-0 bg-lab-grid mask-fade-b" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-24 pt-16 lg:grid-cols-[1.05fr_1fr] lg:px-8 lg:pb-32 lg:pt-24">
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-glass-border bg-glass px-3 py-1 text-xs text-muted-foreground backdrop-blur">
                <Atom className="size-3.5 text-primary" />
                New: air drag in Free Fall
              </span>
              <h1 className="mt-6 text-5xl font-semibold leading-[1.02] sm:text-6xl lg:text-7xl">
                Understand Physics.
                <br />
                <span className="text-gradient">See It in Motion.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                PhysVisual turns textbook mechanics into a live laboratory. Launch, drop and push
                objects, then watch the graphs and equations explain exactly what happened.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button asChild variant="hero" size="lg">
                  <Link to="/register">
                    Get Started <ArrowRight />
                  </Link>
                </Button>
                <Button asChild variant="glass" size="lg">
                  <Link to="/lab/$simId" params={{ simId: "projectile" }}>
                    <Play /> Try the lab
                  </Link>
                </Button>
              </div>
              <dl className="mt-12 grid max-w-md grid-cols-3 gap-6">
                {[
                  ["38k", "students"],
                  ["1,200", "classrooms"],
                  ["4.9", "teacher rating"],
                ].map(([n, l]) => (
                  <div key={l}>
                    <dt className="font-display text-2xl font-semibold">{n}</dt>
                    <dd className="text-xs text-muted-foreground">{l}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="animate-fade-up [animation-delay:150ms]">
              <HeroIllustration />
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Features</p>
            <h2 className="mt-3 text-4xl font-semibold sm:text-5xl">A lab bench that fits in a browser tab.</h2>
            <p className="mt-4 text-muted-foreground">
              No installs, no plug-ins. Everything runs instantly on a school Chromebook or a phone.
            </p>
          </div>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="glass group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <f.icon className="size-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-border/60 bg-surface/50">
          <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-xl">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Simulations</p>
                <h2 className="mt-3 text-4xl font-semibold">Five experiments. Every core idea of mechanics.</h2>
              </div>
              <Button asChild variant="glass">
                <Link to="/simulations">
                  Browse the catalog <ArrowRight />
                </Link>
              </Button>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {SIMULATIONS.map((s) => (
                <Link
                  key={s.id}
                  to="/lab/$simId"
                  params={{ simId: s.id }}
                  className="glass group flex flex-col rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow"
                >
                  <div className="aspect-[16/9] rounded-xl bg-background/60 bg-lab-grid p-2">
                    <SimGlyph id={s.id} />
                  </div>
                  <span className="mt-4 font-mono text-[11px] uppercase tracking-wider text-primary">{s.category}</span>
                  <span className="mt-1 font-display font-semibold">{s.title}</span>
                  <span className="mt-1 text-xs text-muted-foreground">{s.tagline}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-24 text-center lg:px-8">
          <blockquote className="font-display text-2xl font-medium leading-snug sm:text-3xl">
            “My Year 10s finally <span className="text-gradient">see</span> why the velocity graph is a
            straight line. We run the projectile lab on the board and they predict the landing spot before
            we press play.”
          </blockquote>
          <div className="mt-6 text-sm text-muted-foreground">
            Dr. Madina Seitkali · Head of Physics, Nazarbayev Intellectual School, Almaty
          </div>
        </section>

        <section id="pricing" className="relative overflow-hidden border-t border-border/60 py-24">
          <div className="absolute inset-0 bg-hero opacity-60" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mx-auto max-w-xl text-center">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Pricing</p>
              <h2 className="mt-3 text-4xl font-semibold">Start free. Upgrade when the class does.</h2>
            </div>
            <div className="mt-10">
              <PricingPlans />
            </div>
            <p className="mt-8 text-center text-sm text-muted-foreground">
              Need a school licence?{" "}
              <Link to="/pricing" className="text-primary hover:underline">
                Compare every feature
              </Link>
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
