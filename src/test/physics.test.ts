import { describe, expect, it } from "vitest";
import {
  fallDuration,
  inclineAcceleration,
  newtonAcceleration,
  projectileMaxHeight,
  projectileRange,
  terminalVelocity,
} from "@/lib/simulations";

describe("physics models", () => {
  it("projectile at 45° on Earth lands at v0²/g", () => {
    expect(projectileRange({ v0: 20, angle: 45, h0: 0, g: 9.81 })).toBeCloseTo(400 / 9.81, 6);
  });

  it("projectile max height adds launch height", () => {
    expect(projectileMaxHeight({ v0: 20, angle: 90, h0: 5, g: 10 })).toBeCloseTo(25, 6);
  });

  it("vacuum free fall from 45 m at g=10 takes 3 s", () => {
    expect(fallDuration({ h: 45, m: 1, k: 0, g: 10 })).toBeCloseTo(3, 6);
  });

  it("drag makes the fall take longer than in vacuum", () => {
    expect(fallDuration({ h: 100, m: 1, k: 0.5, g: 9.81 })).toBeGreaterThan(
      fallDuration({ h: 100, m: 1, k: 0, g: 9.81 }),
    );
  });

  it("terminal velocity is mg/k", () => {
    expect(terminalVelocity({ m: 10, k: 2, g: 9.81 })).toBeCloseTo(49.05, 6);
  });

  it("crate does not move when force is below static friction", () => {
    expect(newtonAcceleration({ force: 20, m: 30, mu: 0.3 })).toBe(0);
  });

  it("frictionless crate obeys a = F/m", () => {
    expect(newtonAcceleration({ force: 50, m: 10, mu: 0 })).toBeCloseTo(5, 6);
  });

  it("block stays on a ramp when μ exceeds tanθ", () => {
    expect(inclineAcceleration({ theta: 15, mu: 0.4, m: 10, length: 8 })).toBe(0);
  });
});
