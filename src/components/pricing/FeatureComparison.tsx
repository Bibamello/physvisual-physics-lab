import { Check, Minus } from "lucide-react";
import { COMPARISON } from "@/lib/plans";

function Cell({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="mx-auto size-4 text-primary" aria-label="Included" />;
  if (value === false) return <Minus className="mx-auto size-4 text-muted-foreground/50" aria-label="Not included" />;
  return <span className="text-sm">{value}</span>;
}

export function FeatureComparison() {
  return (
    <div className="glass overflow-hidden rounded-2xl">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-glass-border text-sm">
            <th className="px-5 py-4 font-medium text-muted-foreground">Feature</th>
            <th className="w-32 px-5 py-4 text-center font-medium sm:w-44">Free</th>
            <th className="w-32 px-5 py-4 text-center font-medium text-primary sm:w-44">Premium</th>
          </tr>
        </thead>
        <tbody>
          {COMPARISON.map((row) => (
            <tr key={row.feature} className="border-b border-glass-border/60 last:border-0 transition-colors hover:bg-accent/30">
              <td className="px-5 py-3.5 text-sm">{row.feature}</td>
              <td className="px-5 py-3.5 text-center"><Cell value={row.free} /></td>
              <td className="px-5 py-3.5 text-center"><Cell value={row.premium} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
