import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLAN_FEATURES, PRICES } from "@/lib/plans";
import { usePlan } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { SubscribeDialog } from "./SubscribeDialog";

export type Billing = "monthly" | "yearly";

export function PricingPlans() {
  const [billing, setBilling] = useState<Billing>("yearly");
  const [open, setOpen] = useState(false);
  const { isPremium } = usePlan();
  const price = billing === "monthly" ? PRICES.monthly : Math.round((PRICES.yearly / 12) * 100) / 100;

  return (
    <div>
      <div className="mx-auto flex w-fit items-center gap-1 rounded-full border border-glass-border bg-glass p-1 backdrop-blur">
        {(["monthly", "yearly"] as const).map((b) => (
          <button
            key={b}
            onClick={() => setBilling(b)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm transition-all",
              billing === b ? "bg-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {b === "monthly" ? "Monthly" : "Yearly"}
            {b === "yearly" && <span className="ml-1.5 text-xs opacity-80">−20%</span>}
          </button>
        ))}
      </div>

      <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
        <div className="glass flex flex-col rounded-3xl p-8">
          <h3 className="text-xl font-semibold">Free</h3>
          <p className="mt-1 text-sm text-muted-foreground">For students exploring mechanics on their own.</p>
          <div className="mt-6 flex items-baseline gap-1">
            <span className="font-display text-5xl font-semibold">$0</span>
            <span className="text-muted-foreground">/ forever</span>
          </div>
          <ul className="mt-8 flex-1 space-y-3 text-sm">
            {PLAN_FEATURES.free.map((f) => (
              <li key={f} className="flex gap-3">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                {f}
              </li>
            ))}
          </ul>
          <Button asChild variant="glass" size="lg" className="mt-8">
            <Link to="/register">{isPremium ? "Included" : "Start for free"}</Link>
          </Button>
        </div>

        <div className="relative flex flex-col rounded-3xl bg-brand p-px shadow-violet">
          <div className="flex flex-1 flex-col rounded-[calc(1.5rem-1px)] bg-surface p-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Premium</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">
                <Sparkles className="size-3" /> Most popular
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">For teachers, tutors and serious learners.</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="font-display text-5xl font-semibold tabular">${price}</span>
              <span className="text-muted-foreground">/ month</span>
            </div>
            <p className="mt-1 h-4 text-xs text-muted-foreground">
              {billing === "yearly" ? `Billed $${PRICES.yearly} yearly` : "Billed monthly, cancel anytime"}
            </p>
            <ul className="mt-6 flex-1 space-y-3 text-sm">
              {PLAN_FEATURES.premium.map((f) => (
                <li key={f} className="flex gap-3">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
            <Button variant="hero" size="lg" className="mt-8" onClick={() => setOpen(true)} disabled={isPremium}>
              {isPremium ? "You're on Premium" : "Upgrade to Premium"}
            </Button>
          </div>
        </div>
      </div>
      <SubscribeDialog open={open} onOpenChange={setOpen} billing={billing} onBillingChange={setBilling} />
    </div>
  );
}
