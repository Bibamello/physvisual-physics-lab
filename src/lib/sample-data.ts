import type { Params, SimId } from "./simulations";

export interface Experiment {
  id: string;
  simId: SimId;
  name: string;
  params: Params;
  createdAt: string; // ISO date
  result: string;
}

export const SAMPLE_EXPERIMENTS: Experiment[] = [
  { id: "exp-launch-angle", simId: "projectile", name: "Optimal launch angle test", params: { v0: 25, angle: 45, h0: 0, g: 9.81 }, createdAt: "2026-11-16T17:20:00Z", result: "Range 63.71 m" },
  { id: "exp-moon-drop", simId: "free-fall", name: "Moon vs Earth drop", params: { h: 50, m: 1, k: 0, g: 1.62 }, createdAt: "2026-11-14T09:05:00Z", result: "Impact after 7.86 s" },
  { id: "exp-friction-sweep", simId: "dynamics", name: "Friction coefficient sweep", params: { theta: 30, m: 5, mu: 0.35, length: 10 }, createdAt: "2026-11-11T15:42:00Z", result: "a = 1.93 m/s²" },
  { id: "exp-braking", simId: "kinematics", name: "Braking distance at 90 km/h", params: { v0: 25, a: -5, T: 5 }, createdAt: "2026-11-08T12:30:00Z", result: "Stopped in 62.50 m" },
  { id: "exp-crate", simId: "newtons-laws", name: "Crate push, second law check", params: { force: 90, m: 40, mu: 0.2 }, createdAt: "2026-11-02T10:10:00Z", result: "a = 0.29 m/s²" },
];

export const TOPIC_PROGRESS = [
  { topic: "Kinematics", value: 82 },
  { topic: "Newton's Laws", value: 64 },
  { topic: "Projectile Motion", value: 71 },
  { topic: "Free Fall", value: 90 },
  { topic: "Dynamics", value: 38 },
];

export const WEEKLY_ACTIVITY = [
  { day: "Mon", minutes: 24 },
  { day: "Tue", minutes: 41 },
  { day: "Wed", minutes: 18 },
  { day: "Thu", minutes: 55 },
  { day: "Fri", minutes: 32 },
  { day: "Sat", minutes: 12 },
  { day: "Sun", minutes: 47 },
];
