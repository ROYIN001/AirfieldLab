// ───────────────────────── Pilot input shaping (pure, no DOM) ─────────────────────────
// Keys become proportional inputs: the longer a key is held the larger the deflection, and the input
// re-centres when the key is released (a spring-loaded stick). Analog axes get a dead zone, expo and a
// sensitivity scale. Gamepad API objects are read by readPad(), so the mapping is testable in Node with
// plain objects shaped like navigator.getGamepads() entries.

const INPUT_DEFAULTS = { sens: 1.0, expo: 0.35, dead: 0.08, thrAxis: -1, rudAxis: -1, thrInv: false };

class KeyAxis {
  // rate: deflection per second once the key has been held a moment; tc: re-centring time constant (s)
  constructor(rate = 1.2, tc = 0.12) { this.rate = rate; this.tc = tc; this.reset(); }
  reset() { this.v = 0; this.held = 0; this.dir = 0; }
  // dir: −1, 0 or +1 from the keys; gain: sensitivity setting
  update(dt, dir, gain = 1) {
    if (dir) {
      if (dir !== this.dir) this.held = 0;
      this.held += dt;
      if (this.v * dir < 0) {
        // opposite key: let the old input go quickly before building the new one
        this.v = Math.sign(this.v) * Math.max(0, Math.abs(this.v) - 8 * dt);
      } else {
        // slow for the first ~0.2 s so a tap gives a fine correction, then the full ramp rate
        const r = this.rate * gain * Math.min(1, 0.35 + this.held / 0.35);
        this.v = clamp(this.v + dir * r * dt, -1, 1);
      }
    } else {
      this.held = 0;
      this.v *= Math.exp(-dt / this.tc);
      if (Math.abs(this.v) < 1e-3) this.v = 0;
    }
    this.dir = dir;
    return this.v;
  }
}

// Dead zone, then expo (cubic blend: fine control near centre, full travel kept), then sensitivity.
function shapeAxis(v, cfg = INPUT_DEFAULTS) {
  const dead = cfg.dead ?? INPUT_DEFAULTS.dead, expo = cfg.expo ?? 0, sens = cfg.sens ?? 1;
  const a = Math.abs(v);
  if (!(a > dead)) return 0;
  const x = Math.min(1, (a - dead) / (1 - dead));
  return Math.sign(v) * Math.min(1, ((1 - expo) * x + expo * x * x * x) * sens);
}

// Standard mapping (W3C Gamepad "standard" layout): left stick roll/pitch, right stick X rudder, right stick Y
// throttle (rate), LT/RT left/right toe brakes (analog), LB/RB flaps up/down one notch, D-pad ↑/↓ trim nose
// down/up, Y gear, X camera, A autopilot ↔ manual, Start pause, Back restart.
// Other devices (joysticks, throttle quadrants): axes 0/1 are the stick; the throttle and rudder axes are chosen
// in the settings; button 0 brakes, 1 gear, 2 flaps down, 3 flaps up.
const PAD_STD = { 0: 'take', 2: 'cam', 3: 'gear', 4: 'flapUp', 5: 'flapDn', 8: 'restart', 9: 'pause' };
const PAD_GEN = { 1: 'gear', 2: 'flapDn', 3: 'flapUp' };
function readPad(gp, cfg = INPUT_DEFAULTS, prev = null) {
  const axes = gp.axes || [], btns = gp.buttons || [];
  const ax = (i) => (i >= 0 && i < axes.length && Number.isFinite(axes[i]) ? axes[i] : 0);
  const bv = (i) => { const b = btns[i]; if (b == null) return 0; if (typeof b === 'number') return b; return b.value || (b.pressed ? 1 : 0); };
  const std = gp.mapping === 'standard';
  const out = { std, x: shapeAxis(ax(0), cfg), y: shapeAxis(ax(1), cfg), rud: 0, thrRate: 0, thrAbs: null, brakeL: 0, brakeR: 0, trim: 0, events: [], pressed: [] };
  if (std) {
    out.rud = shapeAxis(ax(2), cfg);
    const ry = ax(3);
    out.thrRate = Math.abs(ry) > Math.max(cfg.dead ?? 0.08, 0.2) ? -ry : 0;   // stick up = more power
    out.brakeL = bv(6); out.brakeR = bv(7);
    out.trim = (bv(13) > 0.5 ? 1 : 0) - (bv(12) > 0.5 ? 1 : 0);             // D-pad down = nose up
  } else {
    if (cfg.rudAxis >= 0) out.rud = shapeAxis(ax(cfg.rudAxis), cfg);
    if (cfg.thrAxis >= 0) { const t = ax(cfg.thrAxis) * (cfg.thrInv ? -1 : 1); out.thrAbs = clamp((1 - t) / 2, 0, 1); }   // lever forward (−1) = full power
    out.brakeL = out.brakeR = bv(0);
  }
  const map = std ? PAD_STD : PAD_GEN;
  for (let i = 0; i < btns.length; i++) {
    const on = bv(i) > 0.5;
    out.pressed[i] = on;
    if (on && prev && !prev[i] && map[i]) out.events.push(map[i]);   // rising edges only; nothing on the first poll
  }
  return out;
}

// Larger-magnitude source wins, so keyboard, touch and gamepad can be mixed without fighting.
const pickInput = (...v) => v.reduce((a, b) => (Math.abs(b) > Math.abs(a) ? b : a), 0);
