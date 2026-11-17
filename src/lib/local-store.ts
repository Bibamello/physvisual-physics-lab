import { useSyncExternalStore } from "react";
import { SAMPLE_EXPERIMENTS, type Experiment } from "./sample-data";
import type { SimId } from "./simulations";

// Browser-only state that does not need an account: saved experiments and
// guest favorites/plan. Server render always sees DEFAULT_STATE.
interface LocalState {
  experiments: Experiment[];
  guestFavorites: SimId[];
  guestPlan: "free" | "premium";
}

const KEY = "physvisual:v1";
const DEFAULT_STATE: LocalState = {
  experiments: SAMPLE_EXPERIMENTS,
  guestFavorites: ["projectile", "free-fall"],
  guestPlan: "free",
};

let state: LocalState | null = null;
const listeners = new Set<() => void>();

function read(): LocalState {
  if (state) return state;
  try {
    const raw = window.localStorage.getItem(KEY);
    state = raw ? { ...DEFAULT_STATE, ...(JSON.parse(raw) as Partial<LocalState>) } : DEFAULT_STATE;
  } catch {
    state = DEFAULT_STATE;
  }
  return state;
}

export function updateLocal(updater: (s: LocalState) => LocalState) {
  state = updater(read());
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked: keep in memory */
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useLocalState(): LocalState {
  return useSyncExternalStore(subscribe, read, () => DEFAULT_STATE);
}
