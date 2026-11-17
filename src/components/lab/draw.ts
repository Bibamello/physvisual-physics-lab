import {
  G_EARTH,
  fallDuration,
  inclineAcceleration,
  projectileMaxHeight,
  projectileRange,
  terminalVelocity,
  type Params,
  type Sample,
  type SimDefinition,
} from "@/lib/simulations";

export interface Theme {
  primary: string;
  violet: string;
  amber: string;
  success: string;
  fg: string;
  muted: string;
  border: string;
  secondary: string;
  surface: string;
}

export function readTheme(el: HTMLElement): Theme {
  const cs = getComputedStyle(el);
  const v = (n: string, f: string) => cs.getPropertyValue(n).trim() || f;
  return {
    primary: v("--primary", "#5ee3f5"),
    violet: v("--violet", "#9b6bff"),
    amber: v("--amber", "#f4c15d"),
    success: v("--success", "#4fd69c"),
    fg: v("--foreground", "#eef2ff"),
    muted: v("--muted-foreground", "#9aa3c7"),
    border: v("--border", "#2a3360"),
    secondary: v("--secondary", "#232a52"),
    surface: v("--surface-raised", "#1c2246"),
  };
}

interface Ctx {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  theme: Theme;
}

function arrow(c: Ctx, x1: number, y1: number, x2: number, y2: number, color: string, label?: string, width = 2.5) {
  const { ctx } = c;
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 2) return;
  const ang = Math.atan2(y2 - y1, x2 - x1);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2 - Math.cos(ang) * 6, y2 - Math.sin(ang) * 6);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - Math.cos(ang - 0.45) * 11, y2 - Math.sin(ang - 0.45) * 11);
  ctx.lineTo(x2 - Math.cos(ang + 0.45) * 11, y2 - Math.sin(ang + 0.45) * 11);
  ctx.closePath();
  ctx.fill();
  if (label) {
    ctx.font = "500 12px 'JetBrains Mono', monospace";
    ctx.fillText(label, x2 + 6, y2 - 6);
  }
  ctx.restore();
}

function niceStep(range: number, target = 6) {
  const raw = range / target;
  const pow = Math.pow(10, Math.floor(Math.log10(raw || 1)));
  const n = raw / pow;
  return (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * pow;
}

function label(c: Ctx, text: string, x: number, y: number, color = c.theme.muted, align: CanvasTextAlign = "center", size = 11) {
  c.ctx.save();
  c.ctx.fillStyle = color;
  c.ctx.font = `400 ${size}px 'JetBrains Mono', monospace`;
  c.ctx.textAlign = align;
  c.ctx.fillText(text, x, y);
  c.ctx.restore();
}

function ground(c: Ctx, y: number, x0 = 24, x1 = c.w - 24) {
  const { ctx, theme } = c;
  ctx.save();
  const g = ctx.createLinearGradient(0, y, 0, c.h);
  g.addColorStop(0, theme.secondary);
  g.addColorStop(1, "transparent");
  ctx.fillStyle = g;
  ctx.globalAlpha = 0.7;
  ctx.fillRect(x0, y, x1 - x0, c.h - y);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = theme.primary;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x0, y);
  ctx.lineTo(x1, y);
  ctx.stroke();
  ctx.restore();
}

function axisTicks(c: Ctx, y: number, px0: number, px1: number, v0: number, v1: number, unit: string) {
  const step = niceStep(v1 - v0);
  const start = Math.ceil(v0 / step) * step;
  for (let v = start; v <= v1 + 1e-9; v += step) {
    const x = px0 + ((v - v0) / (v1 - v0)) * (px1 - px0);
    c.ctx.save();
    c.ctx.strokeStyle = c.theme.muted;
    c.ctx.globalAlpha = 0.4;
    c.ctx.beginPath();
    c.ctx.moveTo(x, y);
    c.ctx.lineTo(x, y + 6);
    c.ctx.stroke();
    c.ctx.restore();
    label(c, `${+v.toFixed(2)}${unit}`, x, y + 20);
  }
}

function ball(c: Ctx, x: number, y: number, r: number) {
  const { ctx, theme } = c;
  ctx.save();
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 24;
  const g = ctx.createRadialGradient(x - r / 3, y - r / 3, 1, x, y, r);
  g.addColorStop(0, theme.fg);
  g.addColorStop(0.35, theme.primary);
  g.addColorStop(1, theme.violet);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function box(c: Ctx, x: number, y: number, w: number, h: number, alpha = 1) {
  const { ctx, theme } = c;
  ctx.save();
  ctx.globalAlpha = alpha;
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, theme.primary);
  g.addColorStop(1, theme.violet);
  ctx.fillStyle = g;
  ctx.shadowColor = theme.violet;
  ctx.shadowBlur = alpha === 1 ? 20 : 0;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 6);
  ctx.fill();
  ctx.restore();
}

// ---------------------------------------------------------------------------

function drawKinematics(c: Ctx, p: Params, s: Sample, series: Sample[]) {
  const gy = c.h * 0.68;
  ground(c, gy);
  const xs = series.map((d) => d.x);
  const minX = Math.min(0, ...xs);
  const maxX = Math.max(10, ...xs);
  const carW = 64;
  const px0 = 40;
  const px1 = c.w - 40 - carW;
  const toPx = (x: number) => px0 + ((x - minX) / (maxX - minX)) * (px1 - px0);
  axisTicks(c, gy, px0, px1, minX, maxX, "m");

  // strobe: car position each second
  for (let i = 1; i <= Math.floor(s.t); i++) {
    const xi = p.v0 * i + 0.5 * p.a * i * i;
    box(c, toPx(xi), gy - 34, carW, 22, 0.12);
    label(c, `${i}s`, toPx(xi) + carW / 2, gy - 42, c.theme.muted);
  }

  const cx = toPx(s.x);
  box(c, cx, gy - 34, carW, 22);
  c.ctx.save();
  c.ctx.fillStyle = c.theme.surface;
  c.ctx.beginPath();
  c.ctx.roundRect(cx + 14, gy - 44, 32, 12, 5);
  c.ctx.fill();
  c.ctx.restore();
  const rot = s.x / 6;
  for (const wx of [cx + 14, cx + carW - 14]) {
    c.ctx.save();
    c.ctx.translate(wx, gy - 8);
    c.ctx.rotate(rot);
    c.ctx.fillStyle = c.theme.fg;
    c.ctx.beginPath();
    c.ctx.arc(0, 0, 8, 0, Math.PI * 2);
    c.ctx.fill();
    c.ctx.strokeStyle = c.theme.secondary;
    c.ctx.lineWidth = 2;
    c.ctx.beginPath();
    c.ctx.moveTo(-6, 0);
    c.ctx.lineTo(6, 0);
    c.ctx.stroke();
    c.ctx.restore();
  }
  const vmax = Math.max(1, ...series.map((d) => Math.abs(d.v)));
  arrow(c, cx + carW / 2, gy - 70, cx + carW / 2 + (s.v / vmax) * 110, gy - 70, c.theme.primary, `v = ${s.v.toFixed(1)} m/s`);
  if (p.a !== 0) arrow(c, cx + carW / 2, gy - 100, cx + carW / 2 + Math.sign(p.a) * (20 + Math.abs(p.a) * 12), gy - 100, c.theme.amber, `a = ${p.a.toFixed(1)}`);
}

function drawIncline(c: Ctx, p: Params, s: Sample) {
  const th = (p.theta * Math.PI) / 180;
  const margin = 50;
  const Lpx = Math.min((c.w - margin * 2 - 40) / Math.cos(th), (c.h - 110) / Math.sin(th));
  const B = { x: c.w - margin, y: c.h - 50 };
  const A = { x: B.x - Lpx * Math.cos(th), y: B.y - Lpx * Math.sin(th) };
  const { ctx, theme } = c;
  ground(c, B.y);

  ctx.save();
  const g = ctx.createLinearGradient(A.x, A.y, B.x, B.y);
  g.addColorStop(0, theme.secondary);
  g.addColorStop(1, theme.surface);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(A.x, A.y);
  ctx.lineTo(B.x, B.y);
  ctx.lineTo(A.x, B.y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = theme.primary;
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(A.x, A.y);
  ctx.lineTo(B.x, B.y);
  ctx.stroke();
  ctx.restore();

  // angle arc at the bottom corner
  ctx.save();
  ctx.strokeStyle = theme.amber;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(B.x, B.y, 44, Math.PI, Math.PI + th);
  ctx.stroke();
  ctx.restore();
  label(c, `${p.theta.toFixed(0)}°`, B.x - 64, B.y - 10, theme.amber);

  const d = { x: Math.cos(th), y: Math.sin(th) };
  const n = { x: Math.sin(th), y: -Math.cos(th) };
  const size = 26 + p.m * 1.2;
  const along = 14 + (s.s / p.length) * (Lpx - size - 28);
  const base = { x: A.x + d.x * along, y: A.y + d.y * along };
  const center = { x: base.x + d.x * (size / 2) + n.x * (size / 2), y: base.y + d.y * (size / 2) + n.y * (size / 2) };

  ctx.save();
  ctx.translate(center.x, center.y);
  ctx.rotate(th);
  box(c, -size / 2, -size / 2, size, size);
  ctx.restore();

  const W = p.m * G_EARTH;
  const k = 80 / W;
  arrow(c, center.x, center.y, center.x, center.y + W * k, theme.fg, "mg");
  arrow(c, center.x, center.y, center.x + n.x * s.normal * k, center.y + n.y * s.normal * k, theme.primary, "N");
  if (s.friction > 0.01)
    arrow(c, base.x + d.x * size * 0.5, base.y + d.y * size * 0.5, base.x + d.x * size * 0.5 - d.x * s.friction * k, base.y + d.y * size * 0.5 - d.y * s.friction * k, theme.violet, "f");
  arrow(c, center.x, center.y, center.x + d.x * s.weightParallel * k, center.y + d.y * s.weightParallel * k, theme.amber, "F∥", 1.8);

  const a = inclineAcceleration(p);
  if (a === 0) label(c, "Static friction holds the block: μ ≥ tan θ", c.w / 2, 30, theme.amber, "center", 12);
}

function drawNewton(c: Ctx, p: Params, s: Sample, series: Sample[]) {
  const gy = c.h * 0.7;
  ground(c, gy);
  const size = 40 + p.m * 1.2;
  const maxX = Math.max(5, ...series.map((d) => d.x));
  const px0 = 120;
  const px1 = c.w - 50 - size;
  const toPx = (x: number) => px0 + (x / maxX) * (px1 - px0);
  axisTicks(c, gy, px0, px1, 0, maxX, "m");
  for (let i = 1; i <= Math.floor(s.t); i++) {
    box(c, toPx(0.5 * s.a * i * i), gy - size, size, size, 0.1);
  }
  const x = toPx(s.x);
  box(c, x, gy - size, size, size);
  label(c, `${p.m} kg`, x + size / 2, gy - size / 2 + 4, c.theme.surface, "center", 12);

  const k = 110 / Math.max(50, p.force, p.mu * p.m * G_EARTH);
  arrow(c, x - 12 - p.force * k, gy - size / 2, x - 4, gy - size / 2, c.theme.amber, `F ${p.force.toFixed(0)} N`);
  if (s.friction > 0.01) arrow(c, x + size / 2, gy + 6, x + size / 2 - s.friction * k, gy + 6, c.theme.violet, `f ${s.friction.toFixed(1)} N`);
  arrow(c, x + size / 2, gy - size - 8, x + size / 2, gy - size - 8 - 46, c.theme.primary, "N");
  label(
    c,
    s.a > 0 ? `ΣF = ${s.net.toFixed(1)} N → a = ${s.a.toFixed(2)} m/s²` : "ΣF = 0 → the crate stays at rest (first law)",
    c.w / 2,
    34,
    s.a > 0 ? c.theme.fg : c.theme.amber,
    "center",
    13,
  );
}

function drawProjectile(c: Ctx, p: Params, s: Sample, series: Sample[]) {
  const R = Math.max(projectileRange(p), 1);
  const H = Math.max(projectileMaxHeight(p), 1);
  const ox = 60;
  const oy = c.h - 46;
  const scale = Math.min((c.w - ox - 40) / R, (oy - 40) / H);
  const X = (x: number) => ox + x * scale;
  const Y = (y: number) => oy - y * scale;
  const { ctx, theme } = c;
  ground(c, oy);
  axisTicks(c, oy, ox, X(R), 0, R, "m");

  if (p.h0 > 0) {
    ctx.save();
    ctx.fillStyle = theme.secondary;
    ctx.fillRect(ox - 40, Y(p.h0), 40, p.h0 * scale);
    ctx.restore();
    label(c, `${p.h0} m`, ox - 20, Y(p.h0) - 8);
  }

  // predicted path
  ctx.save();
  ctx.setLineDash([5, 7]);
  ctx.strokeStyle = theme.muted;
  ctx.globalAlpha = 0.45;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  series.forEach((d, i) => (i ? ctx.lineTo(X(d.x), Y(d.y)) : ctx.moveTo(X(d.x), Y(d.y))));
  ctx.stroke();
  ctx.restore();

  // trail
  ctx.save();
  const g = ctx.createLinearGradient(X(0), 0, X(R), 0);
  g.addColorStop(0, theme.primary);
  g.addColorStop(1, theme.violet);
  ctx.strokeStyle = g;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  let started = false;
  for (const d of series) {
    if (d.t > s.t) break;
    if (!started) {
      ctx.moveTo(X(d.x), Y(d.y));
      started = true;
    } else ctx.lineTo(X(d.x), Y(d.y));
  }
  ctx.lineTo(X(s.x), Y(s.y));
  ctx.stroke();
  ctx.restore();

  // apex marker
  const apexX = (p.v0 * Math.cos((p.angle * Math.PI) / 180) * p.v0 * Math.sin((p.angle * Math.PI) / 180)) / p.g;
  ctx.save();
  ctx.setLineDash([3, 5]);
  ctx.strokeStyle = theme.violet;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.moveTo(X(apexX), Y(H));
  ctx.lineTo(X(apexX), oy);
  ctx.stroke();
  ctx.restore();
  label(c, `H = ${H.toFixed(1)} m`, X(apexX), Y(H) - 12, theme.violet);
  label(c, `R = ${R.toFixed(1)} m`, X(R), oy - 12, theme.primary);

  const bx = X(s.x);
  const by = Y(s.y);
  const vk = 2.2;
  arrow(c, bx, by, bx + s.vx * vk, by, theme.primary, "vₓ", 2);
  arrow(c, bx, by, bx, by - s.vy * vk, theme.violet, "vᵧ", 2);
  arrow(c, bx, by, bx + s.vx * vk, by - s.vy * vk, theme.amber, "", 2);
  ball(c, bx, by, 9);
}

function drawFreeFall(c: Ctx, p: Params, s: Sample) {
  const top = 40;
  const gy = c.h - 40;
  const scale = (gy - top) / p.h;
  const { ctx, theme } = c;
  ground(c, gy);
  // tower ruler
  const rx = 70;
  ctx.save();
  ctx.fillStyle = theme.secondary;
  ctx.fillRect(rx - 18, top, 18, gy - top);
  ctx.restore();
  const step = niceStep(p.h, 6);
  for (let hgt = 0; hgt <= p.h + 1e-9; hgt += step) {
    const y = gy - hgt * scale;
    ctx.save();
    ctx.strokeStyle = theme.muted;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(rx, y);
    ctx.lineTo(rx + 8, y);
    ctx.stroke();
    ctx.restore();
    label(c, `${+hgt.toFixed(1)}m`, rx + 14, y + 4, theme.muted, "left");
  }

  const bx = c.w * 0.42;
  // strobe every 0.25 of total fall time
  const T = fallDuration(p);
  const n = 8;
  for (let i = 1; i < n; i++) {
    const ti = (T * i) / n;
    if (ti > s.t) break;
    const d = p.k > 1e-6 ? (p.g * p.m) / p.k * (ti - (p.m / p.k) * (1 - Math.exp((-p.k * ti) / p.m))) : 0.5 * p.g * ti * ti;
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = theme.primary;
    ctx.beginPath();
    ctx.arc(bx, top + d * scale, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const by = gy - s.height * scale - 10;
  ball(c, bx, Math.max(top, by), 10);
  const vt = terminalVelocity(p);
  const vref = Number.isFinite(vt) ? vt : Math.sqrt(2 * p.g * p.h);
  arrow(c, bx + 34, by, bx + 34, by + 20 + (s.v / vref) * 90, theme.violet, `v ${s.v.toFixed(1)} m/s`);
  arrow(c, bx - 34, by, bx - 34, by + 50, theme.fg, "mg", 2);
  if (p.k > 0) arrow(c, bx - 54, by, bx - 54, by - 50 * ((p.k * s.v) / (p.m * p.g)), theme.amber, "drag", 2);

  // terminal velocity panel
  const panelX = c.w - 220;
  label(c, Number.isFinite(vt) ? `terminal vₜ = ${vt.toFixed(1)} m/s` : "no air resistance", panelX, top + 4, theme.muted, "left", 12);
  label(c, `g = ${p.g.toFixed(2)} m/s²`, panelX, top + 24, theme.muted, "left", 12);
}

export function drawScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  theme: Theme,
  sim: SimDefinition,
  p: Params,
  s: Sample,
  series: Sample[],
) {
  ctx.clearRect(0, 0, w, h);
  const c = { ctx, w, h, theme };
  switch (sim.id) {
    case "kinematics":
      return drawKinematics(c, p, s, series);
    case "dynamics":
      return drawIncline(c, p, s);
    case "newtons-laws":
      return drawNewton(c, p, s, series);
    case "projectile":
      return drawProjectile(c, p, s, series);
    case "free-fall":
      return drawFreeFall(c, p, s);
  }
}
