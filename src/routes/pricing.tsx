import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { PricingPlans } from "@/components/pricing/PricingPlans";
import { FeatureComparison } from "@/components/pricing/FeatureComparison";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { usePlan } from "@/lib/auth";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — PhysVisual" },
      { name: "description", content: "Compare PhysVisual Free and Premium plans: simulations, exports, classroom sharing and more." },
      { property: "og:title", content: "Pricing — PhysVisual" },
      { property: "og:description", content: "Compare PhysVisual Free and Premium plans for students and teachers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PricingPage,
});

const FAQ: [string, string][] = [
  ["Is the checkout real?", "Not yet. This is a demo subscription: confirming it switches your account to Premium without charging a card."],
  ["Can I cancel anytime?", "Yes. Premium stays active until the end of the billing period and then returns to Free. Your saved experiments are kept."],
  ["Do you offer school licences?", "Schools with more than 40 students get volume pricing from $4 per student per year, billed to the school."],
  ["Which curricula do you cover?", "The mechanics units of IB Physics, Cambridge A-Level, AP Physics 1 and the Kazakhstan national curriculum for grades 9–11."],
];

function PricingPage() {
  const { isPremium, setPlan } = usePlan();
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden bg-hero">
          <div className="absolute inset-0 bg-lab-grid mask-fade-b" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-16 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-5xl font-semibold sm:text-6xl">Simple, honest pricing</h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Every plan includes the full simulation engine. Premium adds the tools teachers ask for.
              </p>
            </div>
            {isPremium && (
              <div className="glass mx-auto mt-8 flex max-w-xl flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-4">
                <span className="flex items-center gap-2 text-sm">
                  <BadgeCheck className="size-5 text-success" /> Your account is on Premium.
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    await setPlan("free");
                    toast("Subscription cancelled", { description: "You're back on the Free plan." });
                  }}
                >
                  Cancel subscription
                </Button>
              </div>
            )}
            <div className="mt-12">
              <PricingPlans />
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-4xl px-5 py-20 lg:px-8">
          <h2 className="text-3xl font-semibold">Feature comparison</h2>
          <div className="mt-8">
            <FeatureComparison />
          </div>
          <h2 className="mt-20 text-3xl font-semibold">Questions</h2>
          <Accordion type="single" collapsible className="mt-6">
            {FAQ.map(([q, a]) => (
              <AccordionItem key={q} value={q}>
                <AccordionTrigger className="text-left">{q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
