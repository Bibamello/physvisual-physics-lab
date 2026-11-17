import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Lock, Star } from "lucide-react";
import { toast } from "sonner";
import { SimGlyph } from "./SimGlyph";
import { Button } from "@/components/ui/button";
import { useFavorites, usePlan } from "@/lib/auth";
import type { SimDefinition } from "@/lib/simulations";
import { cn } from "@/lib/utils";

export function FavoriteButton({ sim, className }: { sim: SimDefinition; className?: string }) {
  const { isFavorite, toggle } = useFavorites();
  const fav = isFavorite(sim.id);
  return (
    <button
      type="button"
      aria-label={fav ? `Remove ${sim.title} from favorites` : `Add ${sim.title} to favorites`}
      onClick={async (e) => {
        e.preventDefault();
        const now = await toggle(sim.id);
        toast(now ? "Added to favorites" : "Removed from favorites", { description: sim.title });
      }}
      className={cn(
        "flex size-9 items-center justify-center rounded-full border border-glass-border bg-background/60 backdrop-blur transition-all hover:scale-105 hover:border-amber/50",
        className,
      )}
    >
      <Star className={cn("size-4 transition-colors", fav ? "fill-amber text-amber" : "text-muted-foreground")} />
    </button>
  );
}

export function SimCard({ sim, showPresets = true }: { sim: SimDefinition; showPresets?: boolean }) {
  const { isPremium } = usePlan();
  const locked = sim.premium && !isPremium;
  return (
    <article className="glass group flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/30">
      <div className="relative aspect-[16/8] bg-background/50 bg-lab-grid p-4">
        <SimGlyph id={sim.id} />
        <FavoriteButton sim={sim} className="absolute right-3 top-3" />
        {sim.premium && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-violet/20 px-2.5 py-1 text-[11px] font-medium text-violet-foreground">
            <Lock className="size-3" /> Premium
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider">
          <span className="text-primary">{sim.category}</span>
          <span className="text-muted-foreground">· {sim.level}</span>
        </div>
        <h3 className="mt-2 text-lg font-semibold">{sim.title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{sim.description}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {sim.topics.map((t) => (
            <span key={t} className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {t}
            </span>
          ))}
        </div>
        {showPresets && (
          <div className="mt-5 space-y-1 border-t border-glass-border pt-4">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Ready-made experiments</p>
            {sim.presets.map((p) => (
              <Link
                key={p.id}
                to="/lab/$simId"
                params={{ simId: sim.id }}
                search={{ preset: p.id }}
                className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-accent"
              >
                <span>{p.name}</span>
                <ArrowRight className="size-3.5 text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}
        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3.5" /> ~{sim.minutes} min
          </span>
          <Button asChild variant={locked ? "glass" : "soft"} size="sm">
            <Link to="/lab/$simId" params={{ simId: sim.id }}>
              {locked ? "Preview" : "Launch"} <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
