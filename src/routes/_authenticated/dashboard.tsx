import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowRight, Clock, FlaskConical, Flame, Pencil, Play, Sparkles, Star, Target, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { SimGlyph } from "@/components/lab/SimGlyph";
import { FavoriteButton } from "@/components/lab/SimCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { displayNameOf, initialsOf, useAuth, useFavorites, usePlan } from "@/lib/auth";
import { updateLocal, useLocalState } from "@/lib/local-store";
import { TOPIC_PROGRESS, WEEKLY_ACTIVITY } from "@/lib/sample-data";
import { SIMULATIONS, getSimulation } from "@/lib/simulations";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — PhysVisual" },
      { name: "description", content: "Your PhysVisual lab: simulations, recent experiments, favorites and progress." },
      { property: "og:title", content: "Dashboard — PhysVisual" },
      { property: "og:description", content: "Your simulations, recent experiments and progress." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

function greeting() {
  const h = new Date().getHours();
  return h < 5 ? "Working late" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

const LEARNER_LABEL: Record<string, string> = { student: "Student", teacher: "Teacher", "self-learner": "Self-learner" };

function Dashboard() {
  const { user, profile } = useAuth();
  const { favorites } = useFavorites();
  const { isPremium } = usePlan();
  const { experiments } = useLocalState();
  const name = displayNameOf(profile, user);
  const first = name.split(" ")[0];
  const last = experiments[0];
  const lastSim = last ? getSimulation(last.simId) : undefined;
  const favSims = SIMULATIONS.filter((s) => favorites.includes(s.id));
  const maxMin = Math.max(...WEEKLY_ACTIVITY.map((d) => d.minutes));
  const totalMin = WEEKLY_ACTIVITY.reduce((a, d) => a + d.minutes, 0);

  return (
    <AppShell title="Dashboard">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Welcome */}
        <section className="relative overflow-hidden rounded-3xl border border-glass-border bg-hero p-6 sm:p-8">
          <div className="absolute inset-0 bg-lab-grid mask-fade-b" aria-hidden="true" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">{format(new Date(), "EEEE, d MMMM")}</p>
              <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
                {greeting()}, {first}.
              </h1>
              <p className="mt-2 max-w-lg text-muted-foreground">
                {last
                  ? `Pick up where you left off: “${last.name}” is ready to run again.`
                  : "Your lab bench is clear. Launch a simulation to start your first experiment."}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {last && lastSim ? (
                <Button asChild variant="hero" size="lg">
                  <Link to="/lab/$simId" params={{ simId: last.simId }} search={{ exp: last.id }}>
                    <Play /> Continue experiment
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="hero" size="lg">
                  <Link to="/lab/$simId" params={{ simId: "projectile" }}>
                    <Play /> Start experimenting
                  </Link>
                </Button>
              )}
              <Button asChild variant="glass" size="lg">
                <Link to="/simulations">Browse catalog</Link>
              </Button>
            </div>
          </div>
          <div className="relative mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { icon: FlaskConical, label: "Experiments saved", value: String(experiments.length) },
              { icon: Clock, label: "Lab time this week", value: `${(totalMin / 60).toFixed(1)} h` },
              { icon: Flame, label: "Day streak", value: "6" },
              { icon: Target, label: "Avg. mastery", value: `${Math.round(TOPIC_PROGRESS.reduce((a, t) => a + t.value, 0) / TOPIC_PROGRESS.length)}%` },
            ].map((s) => (
              <div key={s.label} className="glass rounded-2xl p-4">
                <s.icon className="size-4 text-primary" />
                <div className="mt-3 font-display text-2xl font-semibold tabular">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-6">
            {/* Available simulations */}
            <section>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Available simulations</h2>
                <Link to="/simulations" className="flex items-center gap-1 text-sm text-primary hover:underline">
                  View all <ArrowRight className="size-3.5" />
                </Link>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {SIMULATIONS.map((s) => (
                  <Link
                    key={s.id}
                    to="/lab/$simId"
                    params={{ simId: s.id }}
                    className="glass group flex items-center gap-4 rounded-2xl p-3 transition-all hover:-translate-y-0.5 hover:border-primary/30"
                  >
                    <div className="h-14 w-20 shrink-0 rounded-xl bg-background/60 p-1.5">
                      <SimGlyph id={s.id} />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{s.title}</div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {s.category}
                        {s.premium && !isPremium && <Sparkles className="size-3 text-violet" />}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Recent experiments */}
            <RecentExperiments />

            {/* Activity */}
            <section className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">This week in the lab</h2>
                <span className="font-mono text-xs text-muted-foreground">{totalMin} min total</span>
              </div>
              <div className="mt-6 flex h-36 items-end gap-3">
                {WEEKLY_ACTIVITY.map((d) => (
                  <div key={d.day} className="group flex flex-1 flex-col items-center gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">{d.minutes}m</span>
                    <div
                      className="w-full rounded-t-lg bg-brand opacity-80 transition-all group-hover:opacity-100"
                      style={{ height: `${(d.minutes / maxMin) * 100}%` }}
                    />
                    <span className="text-xs text-muted-foreground">{d.day}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <ProfileCard />

            {/* Favorites */}
            <section className="glass rounded-2xl p-5">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Star className="size-4 fill-amber text-amber" /> Favorites
              </h2>
              {favSims.length ? (
                <ul className="mt-4 space-y-2">
                  {favSims.map((s) => (
                    <li key={s.id} className="flex items-center gap-3 rounded-xl border border-glass-border bg-background/40 p-2.5">
                      <Link to="/lab/$simId" params={{ simId: s.id }} className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="h-10 w-14 shrink-0 rounded-lg bg-background/60 p-1">
                          <SimGlyph id={s.id} />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium hover:text-primary">{s.title}</div>
                          <div className="text-xs text-muted-foreground">{s.category}</div>
                        </div>
                      </Link>
                      <FavoriteButton sim={s} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  Tap the star on any simulation to pin it here.{" "}
                  <Link to="/simulations" className="text-primary hover:underline">
                    Browse catalog
                  </Link>
                </p>
              )}
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function RecentExperiments() {
  const { experiments } = useLocalState();
  return (
    <section className="glass overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between px-5 pt-5">
        <h2 className="text-lg font-semibold">Recent experiments</h2>
        <span className="text-xs text-muted-foreground">Saved on this device</span>
      </div>
      {experiments.length ? (
        <ul className="mt-3 divide-y divide-glass-border">
          {experiments.slice(0, 6).map((e) => {
            const sim = getSimulation(e.simId);
            return (
              <li key={e.id} className="group flex items-center gap-4 px-5 py-3 transition-colors hover:bg-accent/30">
                <div className="hidden h-10 w-14 shrink-0 rounded-lg bg-background/60 p-1 sm:block">
                  <SimGlyph id={e.simId} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{e.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {sim?.title} · {format(new Date(e.createdAt), "d MMM yyyy")}
                  </div>
                </div>
                <span className="hidden font-mono text-xs text-primary md:inline">{e.result}</span>
                <Button asChild variant="soft" size="sm">
                  <Link to="/lab/$simId" params={{ simId: e.simId }} search={{ exp: e.id }}>
                    Open
                  </Link>
                </Button>
                <button
                  aria-label={`Delete ${e.name}`}
                  onClick={() => {
                    updateLocal((s) => ({ ...s, experiments: s.experiments.filter((x) => x.id !== e.id) }));
                    toast("Experiment deleted", { description: e.name });
                  }}
                  className="text-muted-foreground opacity-60 transition-all hover:text-destructive group-hover:opacity-100"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="px-5 py-8 text-sm text-muted-foreground">No saved experiments yet. Use “Save” in the lab to keep a run.</p>
      )}
    </section>
  );
}

function ProfileCard() {
  const { user, profile, updateProfile } = useAuth();
  const { isPremium } = usePlan();
  const [open, setOpen] = useState(false);
  const name = displayNameOf(profile, user);
  const [form, setForm] = useState({ display_name: "", school: "", learner_type: "student" });

  const since = useMemo(() => (profile ? format(new Date(profile.created_at), "MMMM yyyy") : ""), [profile]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateProfile({ display_name: form.display_name.trim(), school: form.school.trim(), learner_type: form.learner_type });
      toast.success("Profile updated");
      setOpen(false);
    } catch {
      toast.error("Could not save your profile");
    }
  }

  return (
    <section className="glass rounded-2xl p-5">
      <div className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand font-display text-xl font-semibold text-primary-foreground shadow-glow">
          {initialsOf(name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-lg font-semibold">{name}</div>
          <div className="truncate text-sm text-muted-foreground">{user?.email}</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded-md bg-muted px-2 py-0.5 text-xs">{LEARNER_LABEL[profile?.learner_type ?? "student"]}</span>
            <span className={cn("rounded-md px-2 py-0.5 text-xs", isPremium ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
              {isPremium ? "Premium" : "Free plan"}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Edit profile"
          onClick={() => {
            setForm({ display_name: profile?.display_name ?? "", school: profile?.school ?? "", learner_type: profile?.learner_type ?? "student" });
            setOpen(true);
          }}
        >
          <Pencil />
        </Button>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-background/40 p-3">
          <dt className="text-xs text-muted-foreground">School</dt>
          <dd className="mt-0.5 truncate">{profile?.school || "Not set"}</dd>
        </div>
        <div className="rounded-xl bg-background/40 p-3">
          <dt className="text-xs text-muted-foreground">Member since</dt>
          <dd className="mt-0.5">{since || "—"}</dd>
        </div>
      </dl>
      <div className="mt-5 space-y-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Topic mastery</h3>
        {TOPIC_PROGRESS.map((t) => (
          <div key={t.topic}>
            <div className="flex justify-between text-xs">
              <span>{t.topic}</span>
              <span className="font-mono text-muted-foreground">{t.value}%</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-brand" style={{ width: `${t.value}%` }} />
            </div>
          </div>
        ))}
      </div>
      {!isPremium && (
        <Button asChild variant="glass" size="sm" className="mt-5 w-full">
          <Link to="/pricing">
            <Sparkles /> Upgrade to Premium
          </Link>
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass max-w-md rounded-2xl">
          <form onSubmit={save} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>Shown on your dashboard and to your teacher.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="pf-name">Display name</Label>
              <Input id="pf-name" required value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf-school">School or organisation</Label>
              <Input id="pf-school" value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} placeholder="Lyceum No. 165, Almaty" />
            </div>
            <div className="space-y-2">
              <Label>I am a</Label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(LEARNER_LABEL).map(([v, l]) => (
                  <button
                    type="button"
                    key={v}
                    onClick={() => setForm({ ...form, learner_type: v })}
                    className={cn(
                      "rounded-lg border px-2 py-2 text-sm transition-all",
                      form.learner_type === v ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="hero">
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
