import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, Star } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { SimCard } from "@/components/lab/SimCard";
import { Input } from "@/components/ui/input";
import { SIMULATIONS } from "@/lib/simulations";
import { useFavorites } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/simulations")({
  head: () => ({
    meta: [
      { title: "Simulation Catalog — PhysVisual" },
      { name: "description", content: "Kinematics, dynamics, Newton's laws, projectile motion and free fall: interactive simulations with ready-made experiments." },
      { property: "og:title", content: "Simulation Catalog — PhysVisual" },
      { property: "og:description", content: "Interactive mechanics simulations with ready-made experiments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Catalog,
});

const CATEGORIES = ["All", ...SIMULATIONS.map((s) => s.category)];

function Catalog() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [onlyFav, setOnlyFav] = useState(false);
  const { favorites } = useFavorites();

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SIMULATIONS.filter((s) => {
      if (category !== "All" && s.category !== category) return false;
      if (onlyFav && !favorites.includes(s.id)) return false;
      if (!q) return true;
      return [s.title, s.category, s.description, ...s.topics].join(" ").toLowerCase().includes(q);
    });
  }, [query, category, onlyFav, favorites]);

  return (
    <AppShell title="Simulation catalog">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold sm:text-4xl">Choose an experiment</h1>
          <p className="text-muted-foreground">Five core mechanics labs, each with ready-made experiments to start from.</p>
        </div>
        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm transition-all",
                  category === c
                    ? "border-primary bg-primary text-primary-foreground shadow-glow"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {c}
              </button>
            ))}
            <button
              onClick={() => setOnlyFav((v) => !v)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-all",
                onlyFav ? "border-amber/60 bg-amber/15 text-amber" : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              <Star className={cn("size-3.5", onlyFav && "fill-amber")} /> Favorites
            </button>
          </div>
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search friction, gravity…" className="pl-9" />
          </div>
        </div>
        {list.length ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {list.map((s) => (
              <SimCard key={s.id} sim={s} />
            ))}
          </div>
        ) : (
          <div className="glass mt-8 rounded-2xl p-12 text-center">
            <p className="font-display text-lg">No simulations match those filters.</p>
            <button
              className="mt-3 text-sm text-primary hover:underline"
              onClick={() => {
                setQuery("");
                setCategory("All");
                setOnlyFav(false);
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
