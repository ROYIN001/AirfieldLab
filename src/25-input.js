// ───────────────────────── Pilot input layer (pure, no DOM) ─────────────────────────
// Turns raw device readings into the channels Flight.input takes: x roll (+right), y pitch (+pull), rud (+right),
// thr 0…1 and brake 0…1. A self-centring axis is shaped in the order calibration → invert → scaled dead zone →
// response curve → gain (§11.3). Keys ramp with frame time, never with the operating system's key repeat, and
// self-centre when released; Shift held is the fine mode (§11.4.2). A gamepad with the W3C "standard" mapping is read
// once per frame (§11.2.1). When the keyboard, a gamepad and the touch stick feed one axis, the source that moved last
// controls it (§11.5.4). The phone's tilt can stand in for the touch stick (TiltStick, not in the report). 90-app.js
// only reads navigator.getGamepads(), key, pointer and deviceorientation events and passes the values here.
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
  // phone tilt (not in the research report; every value an estimate from the sources in the tilt section below):
  // full deflection at rollMax / pitchMax degrees from the centred pose, dead zone dz degrees, expo, smoothing time
  // constant tau seconds, and the recline from flat (degrees) from which the phone is read as a wheel, below it a tray
  tilt: { rollMax: 30, pitchMax: 20, dz: 2, expo: 0.3, tau: 0.06, wheelFrom: 40 },
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

// ── phone tilt (DeviceOrientation), not covered by the research report ──
// Sources (opened 2026-11-25): W3C Device Orientation and Motion, CRD 18 Nov 2026, Appendix A rotation matrix
// (https://www.w3.org/TR/orientation-event/); W3C Screen Orientation (https://www.w3.org/TR/screen-orientation/,
// angle = counter-clockwise turn of the screen, since spec PR #248); X-Plane Mobile manual (calibrate on the pose held,
// top edge away = nose down; https://x-plane.com/manuals/mobile/); Rahman et al., CHI 2009, "Tilt techniques" (wrist
// ranges, about 5° per controllable level, a quadratic mapping beats a linear one); Ryu et al. 1991 and Morrey et al.
// 1981 (functional wrist ranges ±40° flexion/extension, ±50° forearm rotation). The numbers in INPUT_CFG.tilt are
// estimates chosen inside those ranges, to be tuned on a phone.
// W3C DeviceOrientation Event: beta and gamma, in degrees, rotate the
// device frame (x right, y up the screen, z out of the screen, in the device's natural orientation) by Z-X'-Y''
// intrinsic rotations (alpha, beta, gamma). The "up" direction (against gravity) in device coordinates is then
// (−sin γ cos β, sin β, cos γ cos β): flat on a table, screen up = (0, 0, 1); upright in portrait = (0, 1, 0).
// Working on this vector rather than on beta and gamma avoids their jumps near beta = ±90°. alpha (compass heading,
// drifts) is not used.
function tiltUp(beta, gamma) {
  const b = beta * DEG, g = gamma * DEG, cb = Math.cos(b);
  return [-Math.sin(g) * cb, Math.sin(b), Math.cos(g) * cb];
}
// The screen's right and up axes in device coordinates when the content is rotated by `angle` degrees (Screen
// Orientation API angle: the device turned counter-clockwise by angle): right = (cos a, −sin a), up = (sin a, cos a).
// Returns the up vector in screen coordinates [right, up, out of the screen].
function upOnScreen(u, angle) {
  const a = angle * DEG, c = Math.cos(a), s = Math.sin(a);
  return [u[0] * c - u[1] * s, u[0] * s + u[1] * c, u[2]];
}
// How far the screen is raised from lying flat, in degrees: 0 flat with the screen up, 90 upright facing the player.
function tiltRecline(u, angle) { const [, up, out] = upOnScreen(u, angle); return Math.atan2(up, out) * RAD; }
// The pose of the phone as a yoke, in degrees: roll + = right edge raised (a turn to the left), pitch + = top edge
// toward the player. Gravity cannot tell a turn about the screen's normal from one about its up axis, and people use
// the first with the phone held up (like a steering wheel) and the second with it held near flat (like a tray), so
// each grip gets the angles that are exact for its own motion:
// 'wheel': pitch = angle of the screen's normal from the vertical, roll = turn of gravity about the normal;
// 'tray': pitch = elevation of the screen's up axis, roll = turn of gravity about that axis.
function tiltAngles(u, angle, grip = 'wheel') {
  const [r, up, out] = upOnScreen(u, angle), m = Math.hypot(r, up, out) || 1;
  return grip === 'tray'
    ? { roll: Math.atan2(r, out) * RAD, pitch: Math.asin(clamp(up / m, -1, 1)) * RAD }
    : { roll: Math.atan2(r, up) * RAD, pitch: Math.acos(clamp(out / m, -1, 1)) * RAD };
}
// Which way the screen is turned, from the viewport (landscape or not) and gravity: people hold a phone with the top of
// the picture higher than the bottom, so among the two angles that fit the viewport, take the one whose screen-up axis
// points up. When the phone lies almost flat gravity cannot tell, so the browser's angle is kept. This guards against
// browsers whose angle does not match the device frame: Safari 16.4 counted clockwise (WebKit bug 255388), iPad Safari
// 17+ counts from landscape, and the spec lets private modes report only 0 or 90.
function pickScreenAngle(u, apiAngle, landscape) {
  const api = wrap360(Math.round((Number(apiAngle) || 0) / 90) * 90);
  const cand = landscape ? [90, 270] : [0, 180];
  const lift = (a) => upOnScreen(u, a)[1];
  const best = lift(cand[0]) >= lift(cand[1]) ? cand[0] : cand[1];
  if (Math.abs(lift(best)) < 0.25) return cand.includes(api) ? api : best;   // under ~15° of tilt: keep the browser's
  return best;
}
// One tilt-to-stick channel: degrees from the centred pose → −1…1 through a dead zone and an expo curve.
const tiltAxis = (deg, max, dz, expo) => clamp(expoCurve(dzAxial(clamp(deg / max, -1, 1), dz / max), expo), -1, 1);
// The phone as a stick. sample() takes each deviceorientation reading; centre() makes the pose of the next reading
// (or the current one) the centre, in the screen frame of that moment, so the screen turning during a flight does not
// swap roll and pitch, and picks the grip: 'wheel' when the screen is raised wheelFrom degrees or more from flat, else
// 'tray'; read() gives the command once a frame: x roll (+ right), y pitch (+ pull, top edge toward the player), 0
// until a centre is set and after lost(). A gap between readings is not a loss: browsers send a reading only when an
// angle changes by 0.1° or more, so a phone resting still sends none, and its last pose stands. lost() is for the page
// being hidden, when the readings stop.
class TiltStick {
  constructor(c = INPUT_CFG.tilt) { this.c = c; this.reset(); }
  reset() { this.raw = null; this.f = null; this.t = -Infinity; this.n = 0; this.zero = null; this.angle = 0; this.grip = 'wheel'; this.want = null; this.x = 0; this.y = 0; }
  lost() { this.raw = null; this.f = null; this.x = this.y = 0; }   // keeps the centre; the next reading restarts
  // beta, gamma in degrees (null on a device without the sensor); t in seconds. True when the reading was usable.
  sample(beta, gamma, t) {
    if (!Number.isFinite(beta) || !Number.isFinite(gamma)) return false;
    this.raw = tiltUp(beta, gamma); this.t = t; this.n++;
    return true;
  }
  // screen: { angle, landscape } now; the centre is taken from the latest reading, or from the next one if none yet
  centre(screen) { this.want = screen; this.zero = null; this.f = null; }
  get centred() { return !!this.zero; }
  read(dt) {
    if (!this.raw) { this.x = this.y = 0; return this; }
    if (this.want) {
      this.angle = pickScreenAngle(this.raw, this.want.angle, this.want.landscape);
      this.grip = tiltRecline(this.raw, this.angle) >= this.c.wheelFrom ? 'wheel' : 'tray';
      this.zero = tiltAngles(this.raw, this.angle, this.grip); this.f = this.raw.slice(); this.want = null;
    }
    if (!this.zero) { this.x = this.y = 0; return this; }
    if (!this.f) this.f = this.raw.slice();
    const k = 1 - Math.exp(-Math.max(0, dt) / this.c.tau), f = this.f;
    for (let i = 0; i < 3; i++) f[i] += (this.raw[i] - f[i]) * k;
    const a = tiltAngles(f, this.angle, this.grip), c = this.c, d = (v) => ((v + 540) % 360) - 180;
    this.x = tiltAxis(-d(a.roll - this.zero.roll), c.rollMax, c.dz, c.expo);
    this.y = tiltAxis(d(a.pitch - this.zero.pitch), c.pitchMax, c.dz, c.expo);
    return this;
  }
}

// ── several sources on one axis (§11.5.4) ──
// The source that moved last controls the axis, so a gamepad resting at the centre does not cancel the keyboard and
// the keyboard can take over from a deflected stick. A source moves when `edge` says it was just taken in hand (a key
// went down or reversed, a finger touched the stick) or, if it is tracked, when its value leaves or returns to 0 or
// changes by more than eps since it last moved. The keyboard is not tracked: its ramp and its self-centring move by
// themselves, so only a key going down counts. The source in control is the one that moved last among the live ones
// (default: value not 0); ties go to the lower index. When no source is live the last one keeps the axis, as in the
// report (which then lets go after 0.5 s; with every source at 0 that changes no value, so the timer is left out).
class Arbiter {
  constructor(n, eps = INPUT_CFG.moveEps) { this.t = new Array(n).fill(-Infinity); this.at = new Array(n).fill(0); this.eps = eps; this.src = -1; }
  // v: each source's value now; o.edge, o.live, o.track: per-source flags (track defaults to true). Returns the value
  // of the source in control (0 when none has ever moved) and leaves its index in this.src.
  pick(now, v, o = {}) {
    const edge = o.edge || [], live = o.live, track = o.track || [];
    let best = -1;
    for (let i = 0; i < v.length; i++) {
      const moved = edge[i] || (track[i] !== false && ((v[i] !== 0) !== (this.at[i] !== 0) || Math.abs(v[i] - this.at[i]) > this.eps));
      if (moved) { this.t[i] = now; this.at[i] = v[i]; }
      if ((live ? live[i] : v[i] !== 0) && (best < 0 || this.t[i] > this.t[best])) best = i;
    }
    if (best >= 0) this.src = best;
    return this.src < 0 ? 0 : v[this.src];
  }
}

// One self-centring axis fed by the keyboard (source 0) and other sources (gamepad, touch stick). Switching sources
// does not make the output jump (§11.5.4): keys that take over start their ramp from the output as it is; a stick that
// takes over is followed at once only if the output was where the stick was a frame ago (so the output moves only as
// far as the stick itself moved, as when a stick leaves its centre with the output at 0); otherwise the output runs to
// the stick's value at the axis's return rate, then follows the stick. Keys held while another source has the axis
// do nothing until they take it back by going down again, or until that source comes to rest.
class InputAxis {
  constructor(r, n) { this.r = r; this.key = new KeyAxis(r); this.arb = new Arbiter(n); this.dir = 0; this.v = 0; this.catchUp = false; this.last = new Array(n).fill(0); }
  // dir: keys −1, 0 or +1; fine: Shift factor; v: the other sources' values (0 at rest); edge: their "taken in hand"
  update(now, dt, dir, fine, v, edge) {
    const k = this.key, keyEdge = dir !== 0 && dir !== this.dir, prev = this.arb.src;
    this.dir = dir;
    const vals = [k.v, ...v];
    this.arb.pick(now, vals, { edge: [keyEdge, ...edge], live: [dir !== 0 || k.v !== 0, ...v.map((x) => x !== 0)], track: [false] });
    const s = this.arb.src;
    if (s === 0 && prev !== 0) { k.v = this.v; this.catchUp = false; }                  // keys take over where the output is
    else if (s > 0 && s !== prev) this.catchUp = Math.abs(this.v - this.last[s]) > 1e-9;   // a stick: run to it if apart
    this.last = vals;
    const target = s === 0 ? k.update(dt, dir, fine) : (k.v = 0, s > 0 ? vals[s] : 0);
    const step = this.r.back * dt, d = target - this.v;
    if (!this.catchUp || Math.abs(d) <= step) { this.v = target; this.catchUp = false; } else this.v += Math.sign(d) * step;
    return this.v;
  }
}

// ── one frame of pilot input from every source ──
const NO_KEYS = new Set();
class PilotInput {
  constructor(cfg = INPUT_CFG) { this.cfg = cfg; this.reset(); }
  reset() {
    const k = this.cfg.keys;
    this.ax = new InputAxis(k.roll, 4); this.ay = new InputAxis(k.pitch, 4); this.ar = new InputAxis(k.rud, 2);
    this.padPrev = null; this.padKey = null; this.padUsed = false; this.touchPrev = false;
  }
  // the gamepad's buttons and channels, with button edges against the previous poll of the same pad (a different pad,
  // or a gap with none, starts again without edges)
  readPad(gp) {
    const key = gp ? `${gp.index}|${gp.id}` : null;
    if (key !== this.padKey) { this.padPrev = null; this.padKey = key; }
    const p = readPad(gp, this.padPrev, this.cfg.pad);
    this.padPrev = p ? p.pressed : null;
    if (p && (p.x || p.y || p.rud || p.thrRate || p.brakeL || p.brakeR || p.events.length)) this.padUsed = true;
    return p;
  }
  // between flights (setup, replay, result): only the gamepad's buttons, so B/○ switches the camera as C does
  buttons(gp) { const p = this.readPad(gp); return p ? p.events : []; }
  // now in seconds. s.keys: held key actions this frame (KeyState.frame(), taps shorter than a frame included);
  // s.pad: a gamepad or null; s.touch: { x, y } while a finger is on the touch stick, else null; s.tilt: { x, y } from
  // TiltStick while the phone-tilt mode is on, else null; s.thr: throttle now (the touch rail and the autothrottle set it
  // too); s.brake: the touch brake button is held.
  // Returns { x, y, rud, thr, brake, brakeL, brakeR, trim, events, src }: Flight.input takes the first five;
  // brakeL/brakeR, trim and the gear and flap events wait for the model (one brake, auto-trim and fixed flaps and gear
  // for now); src names the source in control of each stick axis (0 keys, 1 gamepad, 2 touch, 3 tilt, −1 none yet).
  update(dt, now, s) {
    const c = this.cfg, K = s.keys || NO_KEYS, fine = K.has('fine') ? c.keys.fine : 1;
    const p = this.readPad(s.pad), t = s.touch || null, grab = !!t && !this.touchPrev;   // finger just went down
    this.touchPrev = !!t;
    const px = p ? p.x : 0, py = p ? p.y : 0, tx = t ? t.x : 0, ty = t ? t.y : 0, g = s.tilt || null, gx = g ? g.x : 0, gy = g ? g.y : 0;
    const [brakeL, brakeR] = brakePair(p ? p.brakeL : 0, p ? p.brakeR : 0, K.has('br') || s.brake ? 1 : 0);
    return {
      x: this.ax.update(now, dt, keyDir(K, 'lt', 'rt'), fine, [px, tx, gx], [false, grab, false]),
      y: this.ay.update(now, dt, keyDir(K, 'up', 'dn'), fine, [py, ty, gy], [false, grab, false]),
      rud: this.ar.update(now, dt, keyDir(K, 'rl', 'rr'), fine, [p ? p.rud : 0], [false]),
      thr: clamp(s.thr + (keyDir(K, 'td', 'tu') * c.keys.thrRate + (p ? p.thrRate : 0)) * dt, 0, 1),   // Shift: no change
      brake: Math.max(brakeL, brakeR), brakeL, brakeR,
      trim: p ? p.trim : 0, events: p ? p.events : [],
      src: { x: this.ax.arb.src, y: this.ay.arb.src, rud: this.ar.arb.src },
    };
  }
}
