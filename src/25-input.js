// ───────────────────────── Pilot input layer (pure, no DOM) ─────────────────────────
// Turns raw device readings into the channels Flight.input takes: x roll (+right), y pitch (+pull), rud (+right),
// thr 0…1 and brake 0…1. A self-centring axis is shaped in the order calibration → invert → scaled dead zone →
// response curve → gain (§11.3). Keys ramp with frame time, never with the operating system's key repeat, and
// self-centre when released; Shift held is the fine mode (§11.4.2). A gamepad with the W3C "standard" mapping is read
// once per frame (§11.2.1). When the keyboard, a gamepad and the touch stick feed one axis, the source that moved last
// controls it (§11.5.4). 90-app.js only reads navigator.getGamepads(), key and pointer events and passes the values here.
// Source: owner's research round 1, docs/research/01-flight-physics/11-input.md (tests T-I-01…T-I-06, T-I-09…T-I-12)
// and 06-controls.md §6.7.2 (T-C-14). Written from the report's equations; no code taken from FlightGear (GPL).
// Every number in INPUT_CFG is an estimate (ค่าประมาณ) from the report, to be tuned by flying.

const INPUT_CFG = {
  // keyboard ramps, per second (§11.4.2): up while a key is held, back after release (self-centring); cap = travel
  keys: {
    roll: { up: 1.0, back: 3.0, cap: 1 },
    pitch: { up: 0.5, back: 2.5, cap: 1 },   // 0.5/s ≈ 1.1 g/s in DIRECT at 95 kt (the old 2.0/s ≈ 4.6 g/s)
    rud: { up: 1.0, back: 2.0, cap: 1 },
    fine: 0.5,                               // Shift held: rate and travel × 0.5
    thrRate: 0.35,                           // throttle keys, per second (unchanged)
  },
  // standard gamepad (§11.2.1, T-I-12): left stick = scaled radial dead zone + expo; rudder = right trigger − left
  // trigger (axial dead zone + expo); right stick up/down = throttle rate (dead zone thrDz, full rate thrRate per second)
  pad: { dz: 0.08, outer: 0, expo: 0.5, rudDz: 0.05, rudExpo: 0.3, thrDz: 0.15, thrRate: 0.5 },
  moveEps: 0.02,   // arbitration: a source has moved when its value changes by more than this (not in the report)
};

// ── calibration (§11.3.1), for the device-binding wizard ──
// self-centring axis, c = { min, center, max } measured on the device: piecewise linear about the centre → −1…1
function calBipolar(raw, c) {
  const d = raw - c.center, span = d >= 0 ? c.max - c.center : c.center - c.min;
  return span > 1e-6 ? clamp(d / span, -1, 1) : 0;
}
// lever or toe brake, c = { rest, full } in either order (a device that rests at +1 needs no invert flag) → 0…1
function calUnipolar(raw, c) {
  const span = c.full - c.rest;
  return Math.abs(span) > 1e-6 ? clamp((raw - c.rest) / span, 0, 1) : 0;
}
// samples taken while nobody touches the device: the mean and the largest deviation from it
function restStats(samples) {
  const n = samples.length; if (!n) return { center: 0, noise: 0 };
  let s = 0; for (const v of samples) s += v; const center = s / n;
  let noise = 0; for (const v of samples) noise = Math.max(noise, Math.abs(v - center));
  return { center, noise };
}
// dead zone from the measured rest noise (§11.3.2): clamp(k·noise/span + margin, lo, hi)
function suggestDeadzone(noise, span = 1, k = 1.5, margin = 0.02, lo = 0.03, hi = 0.25) {
  return clamp((k * noise) / span + margin, lo, hi);
}
// which axis did the user move: the largest excursion from the rest frame, at least minMove; −1 when none
function detectAxis(rest, frames, minMove = 0.5) {
  let best = -1, bestMove = minMove;
  for (let i = 0; i < rest.length; i++) {
    let mv = 0; for (const f of frames) mv = Math.max(mv, Math.abs(f[i] - rest[i]));
    if (mv > bestMove) { bestMove = mv; best = i; }
  }
  return best;
}

// ── dead zones (§11.3.2) and gates ──
// scaled axial dead zone: 0 up to d, then linear, reaching ±1 at `outer` before the end of travel
function dzAxial(x, d, outer = 0) {
  const a = Math.abs(x); if (!(a > d)) return 0;
  return Math.sign(x) * Math.min(1, (a - d) / (1 - d - outer));
}
// scaled radial dead zone for a thumbstick: keeps the direction of the stick (XInput example [I7])
function dzRadial(x, y, d, outer = 0) {
  const m = Math.hypot(x, y); if (!(m > d)) return [0, 0];
  const k = Math.min(1, (m - d) / (1 - d - outer)) / m; return [x * k, y * k];
}
// round gate → square, so a round-gated stick reaches full roll and full pitch together (§11.7)
function circleToSquare(x, y) {
  const m = Math.hypot(x, y), a = Math.max(Math.abs(x), Math.abs(y)); if (a < 1e-9) return [0, 0];
  const k = m / a; return [clamp(x * k, -1, 1), clamp(y * k, -1, 1)];
}

// ── response curves (§11.3.3) ──
const expoCurve = (x, e) => (1 - e) * x + e * x * x * x;    // RC expo: slope 1 − e at the centre, ±1 at the ends
const powCurve = (x, p) => Math.sign(x) * Math.abs(x) ** p; // sign-preserving power
// whole chain for a self-centring axis; p = { cal?, invert?, dz?, outer?, expo?, pow?, gain? }
function shapeAxis(raw, p = {}) {
  let x = p.cal ? calBipolar(raw, p.cal) : clamp(raw, -1, 1);
  if (p.invert) x = -x;
  x = dzAxial(x, p.dz || 0, p.outer || 0);
  x = p.pow ? powCurve(x, p.pow) : expoCurve(x, p.expo || 0);
  return clamp(x * (p.gain ?? 1), -1, 1);
}
// lever (throttle, prop, condition, toe brake): calibration, then end dead zones so that 0 and 1 are always reached
function shapeLever(raw, p) {
  const u = calUnipolar(raw, p.cal), e0 = p.dzIdle || 0, e1 = p.dzFull || 0;
  return clamp((u - e0) / (1 - e0 - e1), 0, 1);
}

// ── keyboard (§11.4.2) ──
// v moves toward dir·cap·fine: at up·fine per second while a key is held, at back per second once released, and at
// max(up, back) while the opposite key undoes a deflection. dir −1, 0 or +1; fine 1, or INPUT_CFG.keys.fine with Shift.
function keyRamp(v, dir, dt, r, fine = 1) {
  const rate = dir === 0 ? r.back : v * dir < 0 ? Math.max(r.up, r.back) : r.up * fine;
  return v + clamp(dir * r.cap * fine - v, -rate * dt, rate * dt);
}
class KeyAxis {
  constructor(r) { this.r = r; this.v = 0; }
  update(dt, dir, fine = 1) { return (this.v = keyRamp(this.v, dir, dt, this.r, fine)); }
}
// +1, −1 or 0 from two held actions (both held = 0)
const keyDir = (keys, neg, pos) => (keys.has(pos) ? 1 : 0) - (keys.has(neg) ? 1 : 0);

// ── flaps and brakes (§11.4.3) ──
// next flap detent in the direction pressed (+1 extend, −1 retract); from between two detents, the next one that way
function flapNotch(cmd, dir, notches) {
  if (dir > 0) { for (const n of notches) if (n > cmd + 1e-6) return n; return notches[notches.length - 1]; }
  for (let i = notches.length - 1; i >= 0; i--) if (notches[i] < cmd - 1e-6) return notches[i];
  return notches[0];
}
// left and right brake from the left and right inputs, the both-brakes input and the parking brake
function brakePair(left, right, both, parking = 0) { return [Math.max(left, both, parking), Math.max(right, both, parking)]; }

// ── gamepads ──
// vendor and product from Gamepad.id: Chrome "Name (STANDARD GAMEPAD Vendor: 045e Product: 028e)", Firefox
// "45e-28e-Name" (§11.2.5, T-I-11); null when the id carries neither
function parseGamepadId(id) {
  let m = /Vendor:\s*([0-9a-f]{1,4})\s+Product:\s*([0-9a-f]{1,4})/i.exec(id);
  if (!m) m = /^([0-9a-f]{1,4})-([0-9a-f]{1,4})-/i.exec(id);
  return m ? { vendor: m[1].toLowerCase().padStart(4, '0'), product: m[2].toLowerCase().padStart(4, '0') } : null;
}
// the device name from Gamepad.id, without the vendor and product numbers ('' when nothing is left)
function padLabel(id) {
  return String(id || '').replace(/\s*\([^()]*Vendor:[^()]*\)\s*$/i, '').replace(/^[0-9a-f]{1,4}-[0-9a-f]{1,4}-/i, '').trim();
}
// rising-edge buttons of the standard layout: bottom and right buttons of the right cluster, top button (gear), Start,
// D-pad left / right (flaps up / down one detent)
const PAD_EDGE = { 0: 'take', 1: 'cam', 3: 'gear', 9: 'pause', 14: 'flapUp', 15: 'flapDn' };
// gp: a navigator.getGamepads() entry, or a plain object shaped like one; prev: `pressed` from the previous poll.
// Returns the shaped channels, the buttons that went down since `prev` (none on the first poll, so a button already
// held does not fire) and `pressed` for the next poll. Other devices (flight sticks, pedals, HOTAS) give null: the spec
// leaves their axis order undefined, so they wait for the binding wizard.
function readPad(gp, prev = null, c = INPUT_CFG.pad) {
  if (!gp || gp.mapping !== 'standard') return null;
  const axes = gp.axes || [], btns = gp.buttons || [];
  const ax = (i) => (Number.isFinite(axes[i]) ? axes[i] : 0);
  const bv = (i) => { const b = btns[i], v = b == null ? 0 : typeof b === 'number' ? b : b.value || (b.pressed ? 1 : 0); return Number.isFinite(v) ? clamp(v, 0, 1) : 0; };
  const on = (i) => { const b = btns[i]; return b != null && ((typeof b === 'object' && b.pressed === true) || bv(i) > 0.5); };
  const [sx, sy] = dzRadial(ax(0), ax(1), c.dz, c.outer);
  const out = {
    x: expoCurve(sx, c.expo), y: expoCurve(sy, c.expo),            // axes[1] is + pulled back = +y: no sign change
    rud: expoCurve(dzAxial(bv(7) - bv(6), c.rudDz), c.rudExpo),      // analog triggers, right − left
    thrRate: dzAxial(-ax(3), c.thrDz) * c.thrRate,                   // right stick forward (−1) = more power
    brakeL: on(4) ? 1 : 0, brakeR: on(5) ? 1 : 0,                    // bumpers (the model ramps the brakes itself)
    trim: (on(13) ? 1 : 0) - (on(12) ? 1 : 0),                       // D-pad down = nose up, up = nose down
    events: [], pressed: [],
  };
  for (let i = 0; i < btns.length; i++) {
    out.pressed[i] = on(i);
    if (out.pressed[i] && prev && !prev[i] && PAD_EDGE[i]) out.events.push(PAD_EDGE[i]);
  }
  return out;
}

// ── several sources on one axis (§11.5.4) ──
// The source that moved last controls the axis, so a gamepad resting at the centre does not cancel the keyboard and
// the keyboard can take over from a deflected stick. A source moves when its value leaves or returns to 0, changes by
// more than eps since it last moved, or `act` says the user is working it (a key held, a finger on the touch stick).
// The report also keeps the last source in control for 0.5 s once every source is at rest; with every source at 0
// that changes no value, so only the value rule is kept.
class Arbiter {
  constructor(n, eps = INPUT_CFG.moveEps) { this.t = new Array(n).fill(-Infinity); this.at = new Array(n).fill(0); this.eps = eps; this.src = -1; }
  // v: each source's value now (0 = at rest); act: each source's "being worked" flag; returns the value in control
  pick(now, v, act = []) {
    let best = -1;
    for (let i = 0; i < v.length; i++) {
      if (act[i] || (v[i] !== 0) !== (this.at[i] !== 0) || Math.abs(v[i] - this.at[i]) > this.eps) { this.t[i] = now; this.at[i] = v[i]; }
      if (v[i] !== 0 && (best < 0 || this.t[i] > this.t[best])) best = i;
    }
    this.src = best;
    return best < 0 ? 0 : v[best];
  }
}

// ── one frame of pilot input from every source ──
const NO_KEYS = new Set();
class PilotInput {
  constructor(cfg = INPUT_CFG) { this.cfg = cfg; this.reset(); }
  reset() {
    const k = this.cfg.keys;
    this.kx = new KeyAxis(k.roll); this.ky = new KeyAxis(k.pitch); this.kr = new KeyAxis(k.rud);
    this.ax = new Arbiter(3); this.ay = new Arbiter(3); this.ar = new Arbiter(2);
    this.padPrev = null; this.padUsed = false;
  }
  // now in seconds. s.keys: held key actions this frame (KeyState.frame(), taps shorter than a frame included);
  // s.pad: a gamepad or null; s.touch: { x, y } while a finger is on the touch stick, else null; s.thr: throttle now
  // (the touch rail and the autothrottle set it too); s.brake: the touch brake button is held.
  // Returns { x, y, rud, thr, brake, brakeL, brakeR, trim, events }: Flight.input takes the first five; brakeL/brakeR,
  // trim and the gear and flap events wait for the model (one brake, auto-trim and fixed flaps and gear for now).
  update(dt, now, s) {
    const c = this.cfg, K = s.keys || NO_KEYS, fine = K.has('fine') ? c.keys.fine : 1;
    const dx = keyDir(K, 'lt', 'rt'), dy = keyDir(K, 'up', 'dn'), dr = keyDir(K, 'rl', 'rr');
    const kx = this.kx.update(dt, dx, fine), ky = this.ky.update(dt, dy, fine), kr = this.kr.update(dt, dr, fine);
    const p = readPad(s.pad, this.padPrev, c.pad), t = s.touch || null;
    this.padPrev = p ? p.pressed : null;
    if (p && (p.x || p.y || p.rud || p.thrRate || p.brakeL || p.brakeR || p.events.length)) this.padUsed = true;
    const [brakeL, brakeR] = brakePair(p ? p.brakeL : 0, p ? p.brakeR : 0, K.has('br') || s.brake ? 1 : 0);
    return {
      x: this.ax.pick(now, [kx, p ? p.x : 0, t ? t.x : 0], [dx !== 0, false, !!t]),
      y: this.ay.pick(now, [ky, p ? p.y : 0, t ? t.y : 0], [dy !== 0, false, !!t]),
      rud: this.ar.pick(now, [kr, p ? p.rud : 0], [dr !== 0, false]),
      thr: clamp(s.thr + (keyDir(K, 'td', 'tu') * c.keys.thrRate + (p ? p.thrRate : 0)) * dt, 0, 1),
      brake: Math.max(brakeL, brakeR), brakeL, brakeR,
      trim: p ? p.trim : 0, events: p ? p.events : [],
    };
  }
}
