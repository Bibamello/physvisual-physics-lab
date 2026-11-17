import { useEffect, useState } from "react";
import { CheckCircle2, CreditCard, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PRICES } from "@/lib/plans";
import { usePlan } from "@/lib/auth";
import { cn } from "@/lib/utils";
import type { Billing } from "./PricingPlans";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billing?: Billing;
  onBillingChange?: (b: Billing) => void;
}

/** Demo-only checkout: no card is charged, it simply switches the plan to Premium. */
export function SubscribeDialog({ open, onOpenChange, billing: billingProp, onBillingChange }: Props) {
  const { setPlan } = usePlan();
  const [localBilling, setLocalBilling] = useState<Billing>(billingProp ?? "yearly");
  const billing = billingProp ?? localBilling;
  const setBilling = onBillingChange ?? setLocalBilling;
  const [step, setStep] = useState<"form" | "processing" | "done">("form");
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) setStep("form");
  }, [open]);

  const total = billing === "monthly" ? PRICES.monthly : PRICES.yearly;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStep("processing");
    await new Promise((r) => setTimeout(r, 1300));
    try {
      await setPlan("premium");
      setStep("done");
      toast.success("Welcome to Premium", { description: "All simulations are now unlocked." });
    } catch {
      setStep("form");
      toast.error("Could not update your plan. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass max-w-md rounded-2xl">
        {step === "done" ? (
          <div className="py-6 text-center">
            <CheckCircle2 className="mx-auto size-14 text-success" />
            <DialogTitle className="mt-4 text-2xl">You're on Premium</DialogTitle>
            <DialogDescription className="mt-2">
              Inclined Plane, CSV export and classroom sharing are unlocked.
            </DialogDescription>
            <Button variant="hero" className="mt-6 w-full" onClick={() => onOpenChange(false)}>
              Back to the lab
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <DialogHeader>
              <DialogTitle className="text-xl">Upgrade to Premium</DialogTitle>
              <DialogDescription>Demo checkout — no card will be charged.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-2">
              {(["monthly", "yearly"] as const).map((b) => (
                <button
                  type="button"
                  key={b}
                  onClick={() => setBilling(b)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-all",
                    billing === b ? "border-primary bg-primary/10 shadow-glow" : "border-border hover:border-primary/40",
                  )}
                >
                  <div className="text-sm font-medium capitalize">{b}</div>
                  <div className="font-mono text-xs text-muted-foreground">
                    {b === "monthly" ? `$${PRICES.monthly}/mo` : `$${PRICES.yearly}/yr · save 20%`}
                  </div>
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="card-name">Name on card</Label>
              <Input id="card-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Aigerim Sadykova" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card-number">Card number</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="card-number" className="pl-9 font-mono" defaultValue="4242 4242 4242 4242" readOnly />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="card-exp">Expiry</Label>
                <Input id="card-exp" className="font-mono" defaultValue="12 / 29" readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-cvc">CVC</Label>
                <Input id="card-cvc" className="font-mono" defaultValue="123" readOnly />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-muted/60 px-4 py-3 text-sm">
              <span className="text-muted-foreground">Due today</span>
              <span className="font-mono text-base font-semibold">${total}.00</span>
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={step === "processing"}>
              {step === "processing" ? <Loader2 className="animate-spin" /> : <Lock />}
              {step === "processing" ? "Processing…" : `Subscribe for $${total}`}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
