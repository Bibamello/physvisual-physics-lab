// Pure physics models for every PhysVisual simulation. No browser APIs here:
// the canvas renderer, graphs and formula panel all read from these functions.

export type SimId = "kinematics" | "dynamics" | "newtons-laws" | "projectile" | "free-fall";

export type Params = Record<string, number>;
export type Sample = Record<string, number>;

export interface ParamDef {
  key: string;
  label: string;
  symbol: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  default: number;
}

export interface SeriesDef {
  key: string;
  label: string;
  unit: string;
  tone: "cyan" | "violet" | "amber";
}

export interface ReadoutDef {
  key: string;
  label: string;
  unit: string;
}

export interface FormulaLine {
  label: string;
  expression: string;
  substituted: string;
  result: string;
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  params: Params;
}

export interface SimDefinition {
  id: SimId;
  title: string;
  category: string;
  tagline: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  minutes: number;
  premium: boolean;
  topics: string[];
  params: ParamDef[];
  series: [SeriesDef, SeriesDef];
  readouts: ReadoutDef[];
  presets: Preset[];
  duration: (p: Params) => number;
  sample: (t: number, p: Params) => Sample;
  formulas: (p: Params, s: Sample) => FormulaLine[];
}

const DEG = Math.PI / 180;
export const G_EARTH = 9.81;

export const fmt = (n: number, digits = 2) => {
  if (!Number.isFinite(n)) return "—";
  const v = Math.abs(n) < 1e-9 ? 0 : n;
  return v.toFixed(digits);
};

// ---------- Kinematics: uniformly accelerated motion ----------
export function kinematicsAt(t: number, p: Params) {
  const x = p.v0 * t + 0.5 * p.a * t * t;
  const v = p.v0 + p.a * t;
  return { t, x, v, a: p.a };
}

// ---------- Dynamics: block sliding down an incline with friction ----------
export function inclineAcceleration(p: Params) {
  const th = p.theta * DEG;
  const drive = G_EARTH * Math.sin(th);
  const resist = p.mu * G_EARTH * Math.cos(th);
  return drive > resist ? drive - resist : 0;
}

export function inclineDuration(p: Params) {
  const a = inclineAcceleration(p);
  return a > 0 ? Math.sqrt((2 * p.length) / a) : 4;
}

export function inclineAt(t: number, p: Params) {
  const a = inclineAcceleration(p);
  const T = inclineDuration(p);
  const tc = Math.min(t, a > 0 ? T : t);
  const s = a > 0 ? Math.min(0.5 * a * tc * tc, p.length) : 0;
  const v = a * tc;
  const th = p.theta * DEG;
  const weightParallel = p.m * G_EARTH * Math.sin(th);
  const normal = p.m * G_EARTH * Math.cos(th);
  const friction = a > 0 ? p.mu * normal : weightParallel; // static friction balances when at rest
  return { t, s, v, a, weightParallel, normal, friction };
}

// ---------- Newton's second law: applied force on a crate with friction ----------
export function newtonAcceleration(p: Params) {
  const maxFriction = p.mu * p.m * G_EARTH;
  return p.force > maxFriction ? (p.force - maxFriction) / p.m : 0;
}

export function newtonAt(t: number, p: Params) {
  const a = newtonAcceleration(p);
  const maxFriction = p.mu * p.m * G_EARTH;
  const friction = a > 0 ? maxFriction : p.force;
  return { t, x: 0.5 * a * t * t, v: a * t, a, friction, net: p.force - friction };
}

// ---------- Projectile motion ----------
export function projectileFlightTime(p: Params) {
  const vy = p.v0 * Math.sin(p.angle * DEG);
  return (vy + Math.sqrt(vy * vy + 2 * p.g * p.h0)) / p.g;
}

export function projectileRange(p: Params) {
  return p.v0 * Math.cos(p.angle * DEG) * projectileFlightTime(p);
}

export function projectileMaxHeight(p: Params) {
  const vy = p.v0 * Math.sin(p.angle * DEG);
  return p.h0 + (vy * vy) / (2 * p.g);
}

export function projectileAt(t: number, p: Params) {
  const T = projectileFlightTime(p);
  const tc = Math.min(t, T);
  const vx = p.v0 * Math.cos(p.angle * DEG);
  const vy = p.v0 * Math.sin(p.angle * DEG) - p.g * tc;
  const x = vx * tc;
  const y = Math.max(0, p.h0 + p.v0 * Math.sin(p.angle * DEG) * tc - 0.5 * p.g * tc * tc);
  return { t, x, y, vx, vy, speed: Math.hypot(vx, vy) };
}

// ---------- Free fall with linear air drag (F = -k·v) ----------
export function fallDistance(t: number, p: Params) {
  if (p.k <= 1e-6) return 0.5 * p.g * t * t;
  const tau = p.m / p.k;
  const vt = p.g * tau;
  return vt * (t - tau * (1 - Math.exp(-t / tau)));
}

export function fallVelocity(t: number, p: Params) {
  if (p.k <= 1e-6) return p.g * t;
  const tau = p.m / p.k;
  return p.g * tau * (1 - Math.exp(-t / tau));
}

export function terminalVelocity(p: Params) {
  return p.k <= 1e-6 ? Infinity : (p.m * p.g) / p.k;
}

export function fallDuration(p: Params) {
  if (p.k <= 1e-6) return Math.sqrt((2 * p.h) / p.g);
  let lo = 0;
  let hi = 1;
  while (fallDistance(hi, p) < p.h && hi < 1e4) hi *= 2;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (fallDistance(mid, p) < p.h) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export function fallAt(t: number, p: Params) {
  const T = fallDuration(p);
  const tc = Math.min(t, T);
  const d = Math.min(fallDistance(tc, p), p.h);
  const v = fallVelocity(tc, p);
  return { t, height: p.h - d, distance: d, v, a: p.g - (p.k * v) / p.m };
}

// ---------- Catalog ----------
export const SIMULATIONS: SimDefinition[] = [
  {
    id: "kinematics",
    title: "Uniform Acceleration",
    category: "Kinematics",
    tagline: "Position, velocity and time on a straight road.",
    description:
      "Drive a car along a straight track with a starting velocity and constant acceleration. Watch the position curve bend into a parabola while the velocity line stays perfectly straight.",
    level: "Beginner",
    minutes: 10,
    premium: false,
    topics: ["Displacement", "Velocity", "Acceleration"],
    params: [
      { key: "v0", label: "Initial velocity", symbol: "v₀", unit: "m/s", min: 0, max: 30, step: 0.5, default: 5 },
      { key: "a", label: "Acceleration", symbol: "a", unit: "m/s²", min: -5, max: 5, step: 0.1, default: 2 },
      { key: "T", label: "Duration", symbol: "T", unit: "s", min: 2, max: 20, step: 0.5, default: 8 },
    ],
    series: [
      { key: "x", label: "Position", unit: "m", tone: "cyan" },
      { key: "v", label: "Velocity", unit: "m/s", tone: "violet" },
    ],
    readouts: [
      { key: "t", label: "Time", unit: "s" },
      { key: "x", label: "Position", unit: "m" },
      { key: "v", label: "Velocity", unit: "m/s" },
      { key: "a", label: "Acceleration", unit: "m/s²" },
    ],
    presets: [
      { id: "city-car", name: "City car pulling away", description: "From rest at a green light.", params: { v0: 0, a: 3, T: 8 } },
      { id: "braking", name: "Emergency braking", description: "90 km/h down to a stop.", params: { v0: 25, a: -5, T: 5 } },
      { id: "cruise", name: "Cruise control", description: "Constant velocity, zero acceleration.", params: { v0: 20, a: 0, T: 10 } },
    ],
    duration: (p) => p.T,
    sample: kinematicsAt,
    formulas: (p, s) => [
      { label: "Position", expression: "x = v₀t + ½at²", substituted: `${fmt(p.v0, 1)}·${fmt(s.t)} + ½·${fmt(p.a, 1)}·${fmt(s.t)}²`, result: `${fmt(s.x)} m` },
      { label: "Velocity", expression: "v = v₀ + at", substituted: `${fmt(p.v0, 1)} + ${fmt(p.a, 1)}·${fmt(s.t)}`, result: `${fmt(s.v)} m/s` },
      { label: "Timeless", expression: "v² = v₀² + 2ax", substituted: `${fmt(p.v0 * p.v0, 1)} + 2·${fmt(p.a, 1)}·${fmt(s.x)}`, result: `${fmt(s.v * s.v, 1)} m²/s²` },
    ],
  },
  {
    id: "dynamics",
    title: "Inclined Plane",
    category: "Dynamics",
    tagline: "Gravity, normal force and friction on a ramp.",
    description:
      "Release a block on a ramp and decompose its weight into parallel and perpendicular components. Increase friction until static friction wins and the block stays put.",
    level: "Intermediate",
    minutes: 15,
    premium: true,
    topics: ["Force components", "Friction", "Normal force"],
    params: [
      { key: "theta", label: "Incline angle", symbol: "θ", unit: "°", min: 5, max: 60, step: 1, default: 30 },
      { key: "m", label: "Block mass", symbol: "m", unit: "kg", min: 1, max: 20, step: 0.5, default: 5 },
      { key: "mu", label: "Friction coefficient", symbol: "μ", unit: "", min: 0, max: 0.8, step: 0.01, default: 0.2 },
      { key: "length", label: "Ramp length", symbol: "L", unit: "m", min: 2, max: 20, step: 0.5, default: 10 },
    ],
    series: [
      { key: "s", label: "Distance along ramp", unit: "m", tone: "cyan" },
      { key: "v", label: "Velocity", unit: "m/s", tone: "violet" },
    ],
    readouts: [
      { key: "t", label: "Time", unit: "s" },
      { key: "s", label: "Distance", unit: "m" },
      { key: "v", label: "Velocity", unit: "m/s" },
      { key: "a", label: "Acceleration", unit: "m/s²" },
    ],
    presets: [
      { id: "icy", name: "Icy ramp", description: "Almost frictionless descent.", params: { theta: 20, m: 5, mu: 0.05, length: 12 } },
      { id: "plank", name: "Wooden plank", description: "Typical wood-on-wood friction.", params: { theta: 35, m: 8, mu: 0.3, length: 10 } },
      { id: "stuck", name: "Friction wins", description: "Static friction holds the block.", params: { theta: 15, m: 10, mu: 0.4, length: 8 } },
    ],
    duration: inclineDuration,
    sample: inclineAt,
    formulas: (p, s) => [
      { label: "Weight along ramp", expression: "F∥ = mg·sinθ", substituted: `${fmt(p.m, 1)}·9.81·sin ${fmt(p.theta, 0)}°`, result: `${fmt(s.weightParallel)} N` },
      { label: "Normal force", expression: "N = mg·cosθ", substituted: `${fmt(p.m, 1)}·9.81·cos ${fmt(p.theta, 0)}°`, result: `${fmt(s.normal)} N` },
      { label: "Friction", expression: "f = μN", substituted: `${fmt(p.mu)}·${fmt(s.normal)}`, result: `${fmt(s.friction)} N` },
      { label: "Acceleration", expression: "a = g(sinθ − μcosθ)", substituted: `9.81·(${fmt(Math.sin(p.theta * DEG), 3)} − ${fmt(p.mu)}·${fmt(Math.cos(p.theta * DEG), 3)})`, result: `${fmt(s.a)} m/s²` },
    ],
  },
  {
    id: "newtons-laws",
    title: "Newton's Second Law",
    category: "Newton's Laws",
    tagline: "Net force, mass and the acceleration they produce.",
    description:
      "Push a crate across the floor. Below the friction threshold nothing moves (first law); above it the net force sets the acceleration exactly as F = ma predicts.",
    level: "Beginner",
    minutes: 12,
    premium: false,
    topics: ["Net force", "Inertia", "F = ma"],
    params: [
      { key: "force", label: "Applied force", symbol: "F", unit: "N", min: 0, max: 200, step: 1, default: 60 },
      { key: "m", label: "Crate mass", symbol: "m", unit: "kg", min: 1, max: 50, step: 0.5, default: 10 },
      { key: "mu", label: "Friction coefficient", symbol: "μ", unit: "", min: 0, max: 0.6, step: 0.01, default: 0.15 },
    ],
    series: [
      { key: "x", label: "Position", unit: "m", tone: "cyan" },
      { key: "v", label: "Velocity", unit: "m/s", tone: "violet" },
    ],
    readouts: [
      { key: "t", label: "Time", unit: "s" },
      { key: "x", label: "Position", unit: "m" },
      { key: "v", label: "Velocity", unit: "m/s" },
      { key: "net", label: "Net force", unit: "N" },
    ],
    presets: [
      { id: "cart", name: "Shopping cart", description: "Light push, low rolling resistance.", params: { force: 30, m: 15, mu: 0.05 } },
      { id: "crate", name: "Heavy crate", description: "Barely overcoming friction.", params: { force: 90, m: 40, mu: 0.2 } },
      { id: "inertia", name: "First law check", description: "Force too small to move it.", params: { force: 20, m: 30, mu: 0.3 } },
    ],
    duration: () => 8,
    sample: newtonAt,
    formulas: (p, s) => [
      { label: "Max friction", expression: "f = μmg", substituted: `${fmt(p.mu)}·${fmt(p.m, 1)}·9.81`, result: `${fmt(p.mu * p.m * G_EARTH)} N` },
      { label: "Net force", expression: "ΣF = F − f", substituted: `${fmt(p.force, 0)} − ${fmt(s.friction)}`, result: `${fmt(s.net)} N` },
      { label: "Acceleration", expression: "a = ΣF / m", substituted: `${fmt(s.net)} / ${fmt(p.m, 1)}`, result: `${fmt(s.a)} m/s²` },
      { label: "Momentum", expression: "p = mv", substituted: `${fmt(p.m, 1)}·${fmt(s.v)}`, result: `${fmt(p.m * s.v)} kg·m/s` },
    ],
  },
  {
    id: "projectile",
    title: "Projectile Launcher",
    category: "Projectile Motion",
    tagline: "Two independent motions, one parabolic path.",
    description:
      "Launch a ball at any angle and speed, from any height, on any planet. The horizontal velocity never changes while gravity reshapes the vertical one.",
    level: "Intermediate",
    minutes: 15,
    premium: false,
    topics: ["Vectors", "Range", "Maximum height"],
    params: [
      { key: "v0", label: "Launch speed", symbol: "v₀", unit: "m/s", min: 5, max: 50, step: 0.5, default: 25 },
      { key: "angle", label: "Launch angle", symbol: "θ", unit: "°", min: 5, max: 85, step: 1, default: 45 },
      { key: "h0", label: "Launch height", symbol: "h₀", unit: "m", min: 0, max: 30, step: 0.5, default: 0 },
      { key: "g", label: "Gravity", symbol: "g", unit: "m/s²", min: 1.6, max: 24.8, step: 0.01, default: 9.81 },
    ],
    series: [
      { key: "y", label: "Height", unit: "m", tone: "cyan" },
      { key: "vy", label: "Vertical velocity", unit: "m/s", tone: "violet" },
    ],
    readouts: [
      { key: "t", label: "Time", unit: "s" },
      { key: "x", label: "Distance", unit: "m" },
      { key: "y", label: "Height", unit: "m" },
      { key: "speed", label: "Speed", unit: "m/s" },
    ],
    presets: [
      { id: "classic", name: "Classic 45° launch", description: "Maximum range on flat ground.", params: { v0: 25, angle: 45, h0: 0, g: 9.81 } },
      { id: "cliff", name: "Cannon on a cliff", description: "Low angle from 30 m up.", params: { v0: 30, angle: 20, h0: 30, g: 9.81 } },
      { id: "moon", name: "Golf on the Moon", description: "One sixth of Earth's gravity.", params: { v0: 35, angle: 40, h0: 0, g: 1.62 } },
    ],
    duration: projectileFlightTime,
    sample: projectileAt,
    formulas: (p, s) => [
      { label: "Horizontal", expression: "x = v₀cosθ·t", substituted: `${fmt(p.v0, 1)}·cos ${fmt(p.angle, 0)}°·${fmt(s.t)}`, result: `${fmt(s.x)} m` },
      { label: "Vertical", expression: "y = h₀ + v₀sinθ·t − ½gt²", substituted: `${fmt(p.h0, 1)} + ${fmt(p.v0 * Math.sin(p.angle * DEG))}·${fmt(s.t)} − ½·${fmt(p.g)}·${fmt(s.t)}²`, result: `${fmt(s.y)} m` },
      { label: "Max height", expression: "H = h₀ + (v₀sinθ)² / 2g", substituted: `${fmt(p.h0, 1)} + ${fmt((p.v0 * Math.sin(p.angle * DEG)) ** 2, 1)} / ${fmt(2 * p.g)}`, result: `${fmt(projectileMaxHeight(p))} m` },
      { label: "Range", expression: "R = v₀cosθ · T", substituted: `${fmt(p.v0 * Math.cos(p.angle * DEG))}·${fmt(projectileFlightTime(p))}`, result: `${fmt(projectileRange(p))} m` },
    ],
  },
  {
    id: "free-fall",
    title: "Free Fall & Air Drag",
    category: "Free Fall",
    tagline: "Drop objects in vacuum, air, or on other planets.",
    description:
      "Drop a ball from a tower. Without air it accelerates forever; add drag and it approaches terminal velocity. Switch gravity to compare Earth, Mars and the Moon.",
    level: "Beginner",
    minutes: 10,
    premium: false,
    topics: ["Gravity", "Terminal velocity", "Air resistance"],
    params: [
      { key: "h", label: "Drop height", symbol: "h", unit: "m", min: 5, max: 200, step: 1, default: 50 },
      { key: "m", label: "Mass", symbol: "m", unit: "kg", min: 0.1, max: 10, step: 0.1, default: 1 },
      { key: "k", label: "Drag coefficient", symbol: "k", unit: "kg/s", min: 0, max: 2, step: 0.01, default: 0 },
      { key: "g", label: "Gravity", symbol: "g", unit: "m/s²", min: 1.6, max: 24.8, step: 0.01, default: 9.81 },
    ],
    series: [
      { key: "height", label: "Height", unit: "m", tone: "cyan" },
      { key: "v", label: "Velocity", unit: "m/s", tone: "violet" },
    ],
    readouts: [
      { key: "t", label: "Time", unit: "s" },
      { key: "height", label: "Height", unit: "m" },
      { key: "v", label: "Velocity", unit: "m/s" },
      { key: "a", label: "Acceleration", unit: "m/s²" },
    ],
    presets: [
      { id: "vacuum", name: "Vacuum drop", description: "Pure gravity from 50 m.", params: { h: 50, m: 1, k: 0, g: 9.81 } },
      { id: "skydiver", name: "Skydiver (simplified)", description: "Drag caps the speed near 49 m/s.", params: { h: 200, m: 10, k: 2, g: 9.81 } },
      { id: "mars", name: "Drop on Mars", description: "Thin air, 3.71 m/s² gravity.", params: { h: 100, m: 1, k: 0, g: 3.71 } },
    ],
    duration: fallDuration,
    sample: fallAt,
    formulas: (p, s) => [
      { label: "Velocity", expression: p.k > 0 ? "v = (mg/k)(1 − e^(−kt/m))" : "v = gt", substituted: p.k > 0 ? `${fmt(terminalVelocity(p))}·(1 − e^(−${fmt(p.k / p.m, 3)}·${fmt(s.t)}))` : `${fmt(p.g)}·${fmt(s.t)}`, result: `${fmt(s.v)} m/s` },
      { label: "Distance fallen", expression: p.k > 0 ? "d = vₜ(t − τ(1 − e^(−t/τ)))" : "d = ½gt²", substituted: p.k > 0 ? `τ = m/k = ${fmt(p.m / p.k)} s` : `½·${fmt(p.g)}·${fmt(s.t)}²`, result: `${fmt(s.distance)} m` },
      { label: "Terminal velocity", expression: "vₜ = mg / k", substituted: p.k > 0 ? `${fmt(p.m, 1)}·${fmt(p.g)} / ${fmt(p.k)}` : "k = 0 → no limit", result: p.k > 0 ? `${fmt(terminalVelocity(p))} m/s` : "∞" },
      { label: "Impact time", expression: "d(T) = h", substituted: `solve for h = ${fmt(p.h, 0)} m`, result: `${fmt(fallDuration(p))} s` },
    ],
  },
];

export const SIM_IDS = SIMULATIONS.map((s) => s.id);

export function getSimulation(id: string): SimDefinition | undefined {
  return SIMULATIONS.find((s) => s.id === id);
}

export function defaultParams(sim: SimDefinition): Params {
  return Object.fromEntries(sim.params.map((p) => [p.key, p.default]));
}

export function buildSeries(sim: SimDefinition, p: Params, points = 160) {
  const T = Math.max(sim.duration(p), 0.01);
  return Array.from({ length: points + 1 }, (_, i) => sim.sample((T * i) / points, p));
}
