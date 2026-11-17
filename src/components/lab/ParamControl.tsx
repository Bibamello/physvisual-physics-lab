import { Slider } from "@/components/ui/slider";
import type { ParamDef } from "@/lib/simulations";

interface Props {
  def: ParamDef;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}

export function ParamControl({ def, value, onChange, disabled }: Props) {
  const decimals = def.step < 0.1 ? 2 : def.step < 1 ? 1 : 0;
  return (
    <div className="group space-y-3">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={`p-${def.key}`} className="text-sm">
          {def.label}
          <span className="ml-1.5 font-mono text-xs text-muted-foreground">{def.symbol}</span>
        </label>
        <div className="flex items-center gap-1 rounded-lg border border-input bg-background/60 px-2 py-1 transition-colors focus-within:border-primary">
          <input
            id={`p-${def.key}`}
            type="number"
            disabled={disabled}
            value={Number(value.toFixed(decimals))}
            min={def.min}
            max={def.max}
            step={def.step}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (Number.isFinite(v)) onChange(Math.min(def.max, Math.max(def.min, v)));
            }}
            className="w-16 bg-transparent text-right font-mono text-sm tabular text-primary outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          />
          {def.unit && <span className="font-mono text-xs text-muted-foreground">{def.unit}</span>}
        </div>
      </div>
      <Slider
        value={[value]}
        min={def.min}
        max={def.max}
        step={def.step}
        disabled={disabled}
        onValueChange={([v]) => onChange(v)}
        aria-label={def.label}
        className="[&_[role=slider]]:size-4 [&_[role=slider]]:border-primary [&_[role=slider]]:bg-primary [&_[role=slider]]:shadow-glow"
      />
      <div className="flex justify-between font-mono text-[10px] text-muted-foreground/70">
        <span>{def.min}</span>
        <span>{def.max}</span>
      </div>
    </div>
  );
}
