import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { Download, Lock, Pause, Play, RotateCcw, Save, SlidersHorizontal, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { SimCanvas } from "@/components/lab/SimCanvas";
import { LiveChart } from "@/components/lab/LiveChart";
import { ParamControl } from "@/components/lab/ParamControl";
import { FavoriteButton } from "@/components/lab/SimCard";
import { useSimClock } from "@/components/lab/use-sim-clock";
import { SubscribeDialog } from "@/components/pricing/SubscribeDialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { buildSeries, defaultParams, fmt, getSimulation, SIMULATIONS, type Params, type ParamKey, type SampleKey, type SimDefinition } from "@/lib/simulations";
import { updateLocal, useLocalState } from "@/lib/local-store";
import { usePlan } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface LabSearch {
  preset?: string | undefined;
  exp?: string | undefined;
}

export const Route = createFileRoute("/lab/$simId")({
  validateSearch: (search: Record<string, unknown>): LabSearch => ({
    preset: typeof search["preset"] === "string" ? search["preset"] : undefined,
    exp: typeof search["exp"] === "string" ? search["exp"] : undefined,
  }),
  loader: ({ params }) => {
    const sim = getSimulation(params.simId);
    if (!sim) throw notFound();
    return { title: sim.title, tagline: sim.tagline, category: sim.category };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.title} — PhysVisual Lab` : "Simulation not found — PhysVisual";
    const description = loaderData
      ? `${loaderData.category}: ${loaderData.tagline} Adjust parameters live and watch graphs and formulas update.`
      : "This simulation does not exist.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(loaderData ? [] : [{ name: "robots", content: "noindex" }]),
      ],
    };
  },
  notFoundComponent: LabNotFound,
  component: LabPage,
});

const GRAVITY_PRESETS = [
  { name: "Moon", g: 1.62 },
  { name: "Mars", g: 3.71 },
  { name: "Earth", g: 9.81 },
  { name: "Jupiter", g: 24.79 },
];

function LabNotFound() {
  return (
    <AppShell title="Laboratory">
      <div className="glass mx-auto max-w-lg rounded-2xl p-10 text-center">
        <h1 className="text-2xl font-semibold">Simulation not found</h1>
        <p className="mt-2 text-muted-foreground">That experiment isn't in the catalog.</p>
        <Button asChild variant="hero" className="mt-6">
          <Link to="/simulations">Browse simulations</Link>
        </Button>
      </div>
    </AppShell>
  );
}

function LabPage() {
  const { simId } = Route.useParams();
  const sim = getSimulation(simId)!;
  return <Lab key={sim.id} sim={sim} />;
}

function Lab({ sim }: { sim: SimDefinition }) {
  const { preset, exp } = Route.useSearch();
  const navigate = useNavigate();
  const { experiments } = useLocalState();
  const { isPremium } = usePlan();
  const locked = sim.premium && !isPremium;

  const [params, setParams] = useState<Params>(() => {
    const pr = sim.presets.find((p) => p.id === preset);
    return pr ? { ...defaultParams(sim), ...pr.params } : defaultParams(sim);
  });
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [expName, setExpName] = useState("");

  const duration = useMemo(() => sim.duration(params), [sim, params]);
  const clock = useSimClock(duration);
  const series = useMemo(() => buildSeries(sim, params), [sim, params]);
  const sample = useMemo(() => sim.sample(clock.t, params), [sim, params, clock.t]);
  const formulas = useMemo(() => sim.formulas(params, sample), [sim, params, sample]);

  // Apply a preset or saved experiment whenever the URL asks for one.
  useEffect(() => {
    const saved = exp ? experiments.find((e) => e.id === exp && e.simId === sim.id) : undefined;
    const pr = sim.presets.find((p) => p.id === preset);
    const src = saved?.params ?? pr?.params;
    if (src) {
      setParams({ ...defaultParams(sim), ...src });
      clock.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, exp, sim]);

  // Space toggles play/pause.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.code !== "Space" || tag === "INPUT" || tag === "BUTTON" || tag === "TEXTAREA" || locked) return;
      e.preventDefault();
      clock.playing ? clock.pause() : clock.play();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [clock, locked]);

  const setParam = (key: ParamKey, v: number) => setParams((p) => ({ ...p, [key]: v }));

  function exportCsv() {
    if (!isPremium) {
      setSubscribeOpen(true);
      return;
    }
    const keys = Array.from(new Set<SampleKey>(["t", ...sim.series.map((d) => d.key), ...sim.readouts.map((d) => d.key)]));
    const csv = [keys.join(","), ...series.map((r) => keys.map((k) => r[k].toFixed(4)).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `physvisual-${sim.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported", { description: `${series.length} data points` });
  }

  function saveExperiment(e: React.FormEvent) {
    e.preventDefault();
    const name = expName.trim() || `${sim.title} run`;
    const end = sim.sample(duration, params);
    const last = sim.formulas(params, end).at(-1);
    updateLocal((s) => ({
      ...s,
      experiments: [
        {
          id: `exp-${Date.now().toString(36)}`,
          simId: sim.id,
          name,
          params,
          createdAt: new Date().toISOString(),
          result: last ? `${last.label} ${last.result}` : "",
        },
        ...s.experiments,
      ].slice(0, 50),
    }));
    setSaveOpen(false);
    setExpName("");
    toast.success("Experiment saved", { description: "Find it under Recent experiments on your dashboard." });
  }

  return (
    <AppShell
      title={
        <div className="flex items-center gap-3">
          <Select value={sim.id} onValueChange={(id) => navigate({ to: "/lab/$simId", params: { simId: id }, search: {} })}>
            <SelectTrigger className="h-9 w-auto min-w-0 gap-2 border-glass-border bg-glass font-display text-sm sm:text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SIMULATIONS.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.title}
                  {s.premium && !isPremium ? " · Premium" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="hidden font-mono text-xs uppercase tracking-wider text-primary md:inline">{sim.category}</span>
        </div>
      }
      actions={
        <div className="hidden items-center gap-2 sm:flex">
          <FavoriteButton sim={sim} />
          <Button variant="glass" size="sm" onClick={() => setSaveOpen(true)} disabled={locked}>
            <Save /> <span className="hidden md:inline">Save</span>
          </Button>
          <Button variant="glass" size="sm" onClick={exportCsv} disabled={locked}>
            <Download /> <span className="hidden md:inline">CSV</span>
            {!isPremium && <Lock className="!size-3 text-muted-foreground" />}
          </Button>
        </div>
      }
    >
      <div className="mx-auto grid max-w-[1600px] gap-5 lg:grid-cols-[300px_minmax(0,1fr)] 2xl:grid-cols-[300px_minmax(0,1fr)_340px]">
        {/* Parameters */}
        <aside className="glass h-fit rounded-2xl p-5 2xl:sticky 2xl:top-24">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <SlidersHorizontal className="size-4 text-primary" /> Parameters
            </h2>
            <button
              onClick={() => setParams(defaultParams(sim))}
              className="text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              Restore defaults
            </button>
          </div>
          <div className="mt-6 space-y-6">
            {sim.params.map((def) => (
              <ParamControl key={def.key} def={def} value={params[def.key]} onChange={(v) => setParam(def.key, v)} disabled={locked} />
            ))}
          </div>
          {sim.params.some((d) => d.key === "g") && (
            <div className="mt-6">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Gravity</p>
              <div className="grid grid-cols-4 gap-1.5">
                {GRAVITY_PRESETS.map((gp) => (
                  <button
                    key={gp.name}
                    disabled={locked}
                    onClick={() => setParam("g", gp.g)}
                    className={cn(
                      "rounded-lg border px-1 py-1.5 text-xs transition-all",
                      Math.abs(params.g - gp.g) < 0.01 ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {gp.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="mt-6 border-t border-glass-border pt-5">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Presets</p>
            <div className="space-y-1.5">
              {sim.presets.map((p) => (
                <Link
                  key={p.id}
                  to="/lab/$simId"
                  params={{ simId: sim.id }}
                  search={{ preset: p.id }}
                  className={cn(
                    "block rounded-xl border px-3 py-2 transition-all",
                    preset === p.id ? "border-primary/50 bg-primary/10" : "border-transparent hover:border-border hover:bg-accent/50",
                  )}
                >
                  <div className="text-sm">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.description}</div>
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Canvas + graphs */}
        <section className="min-w-0 space-y-5">
          <div className="glass overflow-hidden rounded-2xl">
            <div className="relative h-[340px] bg-lab-grid sm:h-[440px] xl:h-[500px]">
              <SimCanvas sim={sim} params={params} sample={sample} series={series} />
              <div className="pointer-events-none absolute left-2 right-2 top-2 flex flex-wrap gap-1.5 sm:left-3 sm:top-3 sm:gap-2">
                {sim.readouts.map((r) => (
                  <div key={r.key} className="rounded-lg border border-glass-border bg-background/70 px-2 py-1 backdrop-blur sm:px-2.5 sm:py-1.5">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{r.label}</div>
                    <div className="font-mono text-xs tabular text-primary sm:text-sm">
                      {fmt(sample[r.key])} <span className="text-xs text-muted-foreground">{r.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
              {locked && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-md">
                  <div className="max-w-sm px-6 text-center">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-violet/20">
                      <Lock className="size-5 text-violet-foreground" />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold">{sim.title} is a Premium lab</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Unlock force diagrams on inclined planes, plus CSV export and classroom sharing.
                    </p>
                    <Button variant="hero" className="mt-5" onClick={() => setSubscribeOpen(true)}>
                      <Sparkles /> Unlock with Premium
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 border-t border-glass-border px-4 py-3">
              <div className="flex items-center gap-2">
                {clock.playing ? (
                  <Button variant="hero" size="sm" onClick={clock.pause} aria-label="Pause">
                    <Pause /> Pause
                  </Button>
                ) : (
                  <Button variant="hero" size="sm" onClick={clock.play} disabled={locked} aria-label="Play">
                    <Play /> {clock.t > 0 && clock.t < duration ? "Resume" : "Play"}
                  </Button>
                )}
                <Button variant="glass" size="sm" onClick={clock.reset} disabled={locked} aria-label="Reset">
                  <RotateCcw /> Reset
                </Button>
              </div>
              <div className="flex min-w-[180px] flex-1 items-center gap-3">
                <Slider
                  value={[clock.t]}
                  min={0}
                  max={duration}
                  step={duration / 400}
                  disabled={locked}
                  onValueChange={([v]) => {
                    if (v === undefined) return;
                    clock.pause();
                    clock.seek(v);
                  }}
                  aria-label="Timeline"
                />
                <span className="w-24 shrink-0 text-right font-mono text-xs tabular text-muted-foreground">
                  {clock.t.toFixed(2)} / {duration.toFixed(2)} s
                </span>
              </div>
              <div className="flex items-center rounded-lg border border-border p-0.5">
                {[0.25, 0.5, 1, 2].map((sp) => (
                  <button
                    key={sp}
                    onClick={() => clock.setSpeed(sp)}
                    className={cn(
                      "rounded-md px-2 py-1 font-mono text-xs transition-colors",
                      clock.speed === sp ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {sp}×
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {sim.series.map((def) => (
              <LiveChart key={def.key} def={def} data={series} t={clock.t} current={sample[def.key]} />
            ))}
          </div>

          <div className="flex gap-2 sm:hidden">
            <FavoriteButton sim={sim} />
            <Button variant="glass" size="sm" className="flex-1" onClick={() => setSaveOpen(true)} disabled={locked}>
              <Save /> Save
            </Button>
            <Button variant="glass" size="sm" className="flex-1" onClick={exportCsv} disabled={locked}>
              <Download /> CSV
            </Button>
          </div>
        </section>

        {/* Formulas */}
        <aside className="glass h-fit rounded-2xl p-5 lg:col-span-2 2xl:sticky 2xl:top-24 2xl:col-span-1">
          <h2 className="text-sm font-semibold">Formulas & calculations</h2>
          <p className="mt-1 text-xs text-muted-foreground">Updated live with your parameters at t = {clock.t.toFixed(2)} s</p>
          <div className="mt-5 grid gap-3 md:grid-cols-2 2xl:grid-cols-1">
            {formulas.map((f) => (
              <div key={f.label} className="rounded-xl border border-glass-border bg-background/50 p-4 transition-colors hover:border-primary/30">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{f.label}</div>
                <div className="mt-1.5 font-display text-lg text-foreground">{f.expression}</div>
                <div className="mt-2 break-words font-mono text-xs text-muted-foreground">= {f.substituted}</div>
                <div className="mt-1 font-mono text-base tabular text-primary">= {f.result}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-xl bg-primary/5 p-4 text-sm leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Try this: </span>
            {TIPS[sim.id]}
          </div>
          <p className="mt-4 hidden text-center font-mono text-[10px] text-muted-foreground lg:block">Press Space to play / pause</p>
        </aside>
      </div>

      <SubscribeDialog open={subscribeOpen} onOpenChange={setSubscribeOpen} />
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="glass max-w-md rounded-2xl">
          <form onSubmit={saveExperiment} className="space-y-5">
            <DialogHeader>
              <DialogTitle>Save experiment</DialogTitle>
              <DialogDescription>Stores the current parameters so you can reopen this run later.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="exp-name">Name</Label>
              <Input id="exp-name" autoFocus value={expName} onChange={(e) => setExpName(e.target.value)} placeholder={`${sim.title} run`} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {sim.params.map((d) => (
                <span key={d.key} className="rounded-md bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">
                  {d.symbol} = {fmt(params[d.key], d.step < 1 ? 2 : 0)} {d.unit}
                </span>
              ))}
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setSaveOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="hero">
                <Save /> Save experiment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

const TIPS: Record<SimDefinition["id"], string> = {
  kinematics: "Set a negative acceleration. Where does the velocity graph cross zero, and what does the position graph do at that moment?",
  dynamics: "Raise μ slowly. The block stops sliding exactly when μ reaches tan θ. Check it with the calculator.",
  "newtons-laws": "Double the mass while keeping the force fixed. Does the acceleration really halve once friction is overcome?",
  projectile: "Compare 30° and 60° at the same speed. Same range, different flight time. Why?",
  "free-fall": "Add drag and raise the height to 200 m. Watch the velocity graph flatten toward terminal velocity.",
};
