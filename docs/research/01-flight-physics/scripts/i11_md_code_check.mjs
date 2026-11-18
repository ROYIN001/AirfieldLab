export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

// ── calibration ──
// bipolar (self-centring) axis: piecewise-linear about the measured centre -> [-1, 1]
export function calBipolar(raw, c) {
  const d = raw - c.center, span = d >= 0 ? c.max - c.center : c.center - c.min;
  return span > 1e-6 ? clamp(d / span, -1, 1) : 0;
}
// unipolar (non-centring) lever / toe brake: rest and full may be in either order (inverted devices)
export function calUnipolar(raw, c) {
  const span = c.full - c.rest;
  return Math.abs(span) > 1e-6 ? clamp((raw - c.rest) / span, 0, 1) : 0;
}
// rest statistics from samples captured while the user does not touch the device
export function restStats(samples) {
  const n = samples.length; let s = 0; for (const v of samples) s += v; const center = s / n;
  let dev = 0; for (const v of samples) dev = Math.max(dev, Math.abs(v - center));
  return { center, noise: dev };
}
// dead zone suggested from measured rest noise (bipolar span ~1 after calibration)
export function suggestDeadzone(noise, span = 1, k = 1.5, margin = 0.02, lo = 0.03, hi = 0.25) {
  return clamp((k * noise) / span + margin, lo, hi);
}
// which axis did the user move? (largest excursion from the rest frame)
export function detectAxis(rest, frames, minMove = 0.5) {
  let best = -1, bestMove = minMove;
  for (let i = 0; i < rest.length; i++) {
    let mv = 0; for (const f of frames) mv = Math.max(mv, Math.abs(f[i] - rest[i]));
    if (mv > bestMove) { bestMove = mv; best = i; }
  }
  return best;
}
export function rangeOf(frames, i) { let lo = Infinity, hi = -Infinity; for (const f of frames) { lo = Math.min(lo, f[i]); hi = Math.max(hi, f[i]); } return { min: lo, max: hi }; }

// ── dead zones ──
export function dzAxial(x, d, outer = 0) { // scaled axial dead zone + extremity (outer) dead zone
  const a = Math.abs(x); if (a <= d) return 0;
  return Math.sign(x) * Math.min(1, (a - d) / (1 - d - outer));
}
export function dzRadial(x, y, d, outer = 0) { // scaled radial (XInput-style circular, rescaled)
  const m = Math.hypot(x, y); if (m <= d) return [0, 0];
  const k = Math.min(1, (m - d) / (1 - d - outer)) / m; return [x * k, y * k];
}
export function dzRadialUnscaled(x, y, d) { const m = Math.hypot(x, y); return m <= d ? [0, 0] : [x, y]; }
// circle -> square (lets a round-gated stick reach full roll and full pitch together)
export function circleToSquare(x, y) {
  const m = Math.hypot(x, y), a = Math.max(Math.abs(x), Math.abs(y)); if (a < 1e-9) return [0, 0];
  const k = m / a; return [clamp(x * k, -1, 1), clamp(y * k, -1, 1)];
}

// ── response curves ──
export const expo = (x, e) => (1 - e) * x + e * x * x * x;           // RC-style blend
export const powc = (x, p) => Math.sign(x) * Math.abs(x) ** p;         // sign-preserving power (FlightGear 'power')
export function pwl(x, pts) {                                          // odd-symmetric piecewise-linear, pts [[0,0],...,[1,1]]
  const a = Math.min(1, Math.abs(x)), s = Math.sign(x);
  for (let i = 1; i < pts.length; i++) if (a <= pts[i][0]) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; return s * (y0 + ((a - x0) * (y1 - y0)) / (x1 - x0)); }
  return s * pts[pts.length - 1][1];
}
// full chain for one bipolar axis
export function shapeAxis(raw, p) {
  let x = p.cal ? calBipolar(raw, p.cal) : clamp(raw, -1, 1);
  if (p.invert) x = -x;
  x = dzAxial(x, p.dz || 0, p.outer || 0);
  if (p.curve) x = pwl(x, p.curve); else if (p.pow) x = powc(x, p.pow); else x = expo(x, p.expo || 0);
  return clamp(x * (p.gain ?? 1), -1, 1);
}
export function shapeLever(raw, p) { // throttle, prop, condition, toe brake
  let u = calUnipolar(raw, p.cal); const e0 = p.dzIdle || 0, e1 = p.dzFull || 0;
  return clamp((u - e0) / (1 - e0 - e1), 0, 1);
}

// ── keyboard ──
// proportional ramp with self-centring; dir in {-1,0,1}; r = {up, back, cap}; fine = precision modifier factor
export function keyRamp(v, dir, dt, r, fine = 1) {
  const tgt = dir * r.cap * (fine < 1 ? 0.5 : 1);
  let rate = dir === 0 ? r.back : v * dir < 0 ? Math.max(r.up, r.back) : r.up * fine;
  return v + clamp(tgt - v, -rate * dt, rate * dt);
}
// key latch: a key pressed and released between two frames still counts as held for one frame
export const keyLatch = () => ({ held: new Set(), tapped: new Set() });
export function onKeyDown(ks, code) { ks.held.add(code); ks.tapped.add(code); }
export function onKeyUp(ks, code) { ks.held.delete(code); }
export function frameKeys(ks) { const s = new Set([...ks.held, ...ks.tapped]); ks.tapped.clear(); return s; }
export const keyDir = (keys, neg, pos) => (pos.some((c) => keys.has(c)) ? 1 : 0) - (neg.some((c) => keys.has(c)) ? 1 : 0);
export function trimStep(t, dir, rate, dt, lo = -1, hi = 1) { return clamp(t + dir * rate * dt, lo, hi); }
export function flapNotch(cmd, dir, notches) { // move to the next detent in 'dir' (+1 extend, -1 retract)
  if (dir > 0) { for (const n of notches) if (n > cmd + 1e-6) return n; return notches[notches.length - 1]; }
  for (let i = notches.length - 1; i >= 0; i--) if (notches[i] < cmd - 1e-6) return notches[i]; return notches[0];
}
export function brakes(left, right, both, parking = 0) { return [Math.max(left, both, parking), Math.max(right, both, parking)]; }
// toggles fire once per physical press: ignore auto-repeat
export const isToggleEdge = (ev) => ev.type === 'keydown' && !ev.repeat;
// flight bindings are never resolved when Ctrl/Meta/Alt is held (browser shortcuts, e.g. Ctrl+W closes the tab)
export function resolveKey(code, mods, keymap) { if (mods.ctrl || mods.meta || mods.alt) return null; return keymap[code] || null; }
const RESERVED_MODS = ['ControlLeft', 'ControlRight', 'MetaLeft', 'MetaRight', 'AltLeft', 'AltRight', 'OSLeft', 'OSRight'];
export function keymapProblems(keymap) { return Object.keys(keymap).filter((c) => RESERVED_MODS.includes(c)); }

// ── 1€ filter (Casiez, Roussel, Vogel, CHI 2012) ──
export class OneEuro {
  constructor(minCutoff = 1, beta = 0, dCutoff = 1) { this.mc = minCutoff; this.beta = beta; this.dc = dCutoff; this.x = null; this.dx = 0; }
  static alpha(dt, fc) { const tau = 1 / (2 * Math.PI * fc); return 1 / (1 + tau / dt); }
  filter(x, dt) {
    if (this.x === null) { this.x = x; return x; }
    const dxRaw = (x - this.x) / dt; this.dx += OneEuro.alpha(dt, this.dc) * (dxRaw - this.dx);
    const fc = this.mc + this.beta * Math.abs(this.dx); this.x += OneEuro.alpha(dt, fc) * (x - this.x); return this.x;
  }
}

// ── device identity ──
export function parseGamepadId(id) {
  let m = /Vendor:\s*([0-9a-f]{1,4})\s+Product:\s*([0-9a-f]{1,4})/i.exec(id);
  if (!m) m = /^([0-9a-f]{1,4})-([0-9a-f]{1,4})-/i.exec(id);
  return m ? { vendor: m[1].toLowerCase().padStart(4, '0'), product: m[2].toLowerCase().padStart(4, '0') } : null;
}

// ── haptics mixer: sim state -> one 'dual-rumble' effect per update period ──
export class RumbleScheduler { // at most one playEffect per period; skip if nothing changed and the effect is still running
  constructor(period = 0.1, durMs = 120, eps = 0.05) { this.p = period; this.d = durMs; this.eps = eps; this.tLast = -1e9; this.last = { strongMagnitude: 0, weakMagnitude: 0 }; }
  next(now, mix) {
    const changed = Math.abs(mix.strongMagnitude - this.last.strongMagnitude) > this.eps || Math.abs(mix.weakMagnitude - this.last.weakMagnitude) > this.eps;
    const active = mix.strongMagnitude > 0 || mix.weakMagnitude > 0;
    if (now - this.tLast < this.p) return null;
    if (!changed && (!active || now - this.tLast < (this.d / 1000) * 0.8)) return null;
    this.tLast = now; this.last = mix; return { type: 'dual-rumble', params: { duration: active ? this.d : 0, ...mix } };
  }
}
export function hapticMix(s, g = { gain: 1, buffet: 1, runway: 1, touchdown: 1 }) {
  let strong = 0, weak = 0;
  if (s.buffet > 0) { strong = Math.max(strong, g.buffet * s.buffet); weak = Math.max(weak, 0.5 * g.buffet * s.buffet); }
  if (s.onGround && s.gs > 1) weak = Math.max(weak, g.runway * (s.rough ?? 0.15) * Math.min(1, s.gs / 30));
  if (s.tdSinkFpm != null) strong = Math.max(strong, g.touchdown * clamp((s.tdSinkFpm - 100) / 600, 0.15, 1));
  return { strongMagnitude: clamp(strong * g.gain, 0, 1), weakMagnitude: clamp(weak * g.gain, 0, 1) };
}
