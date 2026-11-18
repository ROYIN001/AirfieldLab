// Section 11: expected values for the proposed input-shaping tests
import * as I from './i11_input.mjs';
const r4 = (v) => Math.round(v * 1e4) / 1e4;
const out = {};
// XInput dead-zone constants normalised
out.xinput = { left: r4(7849 / 32767), right: r4(8689 / 32767), trigger: r4(30 / 255) };
// dead zone + expo chain (d 0.08, e 0.5)
out.chain = [0, 0.05, 0.08, 0.1, 0.25, 0.5, 0.75, 1, -0.5].map((x) => [x, r4(I.shapeAxis(x, { dz: 0.08, expo: 0.5 }))]);
out.slopeAtEdgeOfDz = r4((1 - 0.5) / (1 - 0.08));
// expo comparisons at half stick: X-Plane says up to 10 % at half deflection with max curve
out.half = { e05: I.expo(0.5, 0.5), e1: I.expo(0.5, 1), pow2: I.powc(0.5, 2), pow3: I.powc(0.5, 3), p_for_10pct: r4(Math.log(0.1) / Math.log(0.5)) };
// axial vs radial on a diagonal input near centre and full
out.diag = { axial: [I.dzAxial(0.1, 0.08), I.dzAxial(0.1, 0.08)].map(r4), radial: I.dzRadial(0.1, 0.1, 0.08).map(r4), radialUnscaled: I.dzRadialUnscaled(0.1, 0.1, 0.08) };
out.pureRoll = { axialX: r4(I.dzAxial(0.3, 0.08)), radialX: I.dzRadial(0.3, 0.05, 0.08).map(r4) };
out.outer = [0.97, 0.98, 1].map((x) => [x, r4(I.dzAxial(x, 0.08, 0.02))]);
out.c2s = I.circleToSquare(Math.SQRT1_2, Math.SQRT1_2).map(r4);
// calibration
out.calBi = [[-0.9, { min: -0.9, center: 0.04, max: 0.95 }], [0.04, { min: -0.9, center: 0.04, max: 0.95 }], [0.5, { min: -0.9, center: 0.04, max: 0.95 }]].map(([r, c]) => [r, r4(I.calBipolar(r, c))]);
// throttle forward = -1 (spec: -1 SHOULD be forward); idle = +1 ; T-Rudder toe brake rest +1 ; Saitek rest -1
out.thr = [1, 0, -1].map((r) => [r, r4(I.shapeLever(r, { cal: { rest: 1, full: -1 }, dzIdle: 0.02, dzFull: 0.02 }))]);
out.toeSaitek = [-1, 0, 1].map((r) => [r, I.calUnipolar(r, { rest: -1, full: 1 })]);
out.toeTRudder = [1, 0, -1].map((r) => [r, I.calUnipolar(r, { rest: 1, full: -1 })]);
// FlightGear formulas for comparison: brake=(raw+1)*0.5 (Saitek), (raw-1)*(-0.5) (T-Rudder), throttle (1-val)/2
out.fg = { saitek: [-1, 1].map((r) => (r + 1) * 0.5), trudder: [1, -1].map((r) => (r - 1) * -0.5), thr: [-1, 1].map((v) => (1 - v) / 2) };
// rest stats & dead-zone suggestion
let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5);
const samples = Array.from({ length: 120 }, () => 0.03 + 0.02 * rnd()); // centre 0.03, +-0.01 noise
const rs = I.restStats(samples); out.rest = { center: r4(rs.center), noise: r4(rs.noise), dz: r4(I.suggestDeadzone(rs.noise)) };
// detectAxis
const rest = [0.01, -0.02, 1.0, 0.0];
const frames = [[0.02, -0.01, 1.0, 0.0], [0.05, -0.6, 0.98, 0.1], [0.0, -1.0, 0.99, 0.05]];
out.detect = I.detectAxis(rest, frames);
// keyboard ramps: current code (up 2.0 pitch /2.5 roll, back 5) vs proposed (pitch up 0.5, roll 1.0, back 2.5/3)
function hold(r, T, dt = 1 / 60) { let v = 0, t = 0; while (t < T - 1e-9) { v = I.keyRamp(v, 1, dt, r); t += dt; } return v; }
function rel(r, v0, dt = 1 / 60) { let v = v0, t = 0; while (Math.abs(v) > 1e-9) { v = I.keyRamp(v, 0, dt, r); t += dt; } return t; }
const cur = { up: 2.0, back: 5, cap: 1 }, prop = { up: 0.5, back: 2.5, cap: 1 }, propR = { up: 1.0, back: 3, cap: 1 };
out.key = {
  cur_pitch_after_1frame: r4(hold(cur, 1 / 60)), cur_pitch_after_0p25: r4(hold(cur, 0.25)), cur_full_s: 1 / cur.up, cur_center_s: r4(rel(cur, 1)),
  prop_pitch_after_1frame: r4(hold(prop, 1 / 60)), prop_pitch_after_0p3: r4(hold(prop, 0.3)), prop_full_s: 1 / prop.up, prop_center_s: r4(rel(prop, 1)),
  prop_roll_after_0p3: r4(hold(propR, 0.3)), fine_pitch_after_2s: r4((() => { let v = 0; for (let i = 0; i < 120; i++) v = I.keyRamp(v, 1, 1 / 60, prop, 0.5); return v; })()),
  reverse_from_0p5: r4((() => { let v = 0.5; for (let i = 0; i < 6; i++) v = I.keyRamp(v, -1, 1 / 60, prop); return v; })()),
};
// (sub-frame tap latch is checked in i11_latch_check.mjs)
// FlightGear keyboard (0.05 per press, OS repeat 2.5..30 Hz) equivalent ramp
out.fgKeyRamp = { min_per_s: 0.05 * 2.5, max_per_s: 0.05 * 30, trimStepPerS_at30Hz: 0.001 * 30, TRIM_RATE: 0.045, fullTrimTravel_s: 2 / 0.045 };
// flap notches & brakes
out.flaps = { up_from0: I.flapNotch(0, 1, [0, 0.5, 1]), up_from05: I.flapNotch(0.5, 1, [0, 0.5, 1]), dn_from1: I.flapNotch(1, -1, [0, 0.5, 1]), dn_from0: I.flapNotch(0, -1, [0, 0.5, 1]), mid: I.flapNotch(0.3, 1, [0, 0.5, 1]) };
out.brakes = I.brakes(0.3, 0, 0.6);
// resolveKey and keymap check (current KEYMAP of 90-app.js:332)
const CUR = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'dn', KeyS: 'dn', ArrowLeft: 'lt', KeyA: 'lt', ArrowRight: 'rt', KeyD: 'rt', KeyQ: 'rl', KeyE: 'rr', ShiftLeft: 'tu', ShiftRight: 'tu', ControlLeft: 'td', ControlRight: 'td', KeyB: 'br' };
out.keymapProblems_current = I.keymapProblems(CUR);
out.resolve = [I.resolveKey('KeyW', { ctrl: true }, CUR), I.resolveKey('KeyW', {}, CUR)];
// gamepad id parsing
out.ids = ['Xbox 360 Controller (STANDARD GAMEPAD Vendor: 045e Product: 028e)', '810-3-USB Gamepad', 'T.16000M'].map(I.parseGamepadId);
// 1€ filter: lag for a slow ramp (0.2 /s) and fast ramp (2 /s) at 60 Hz, and jitter attenuation
function ramp(fmc, beta, slope, dt = 1 / 60, N = 240) { const f = new I.OneEuro(fmc, beta, 1); let y = 0; for (let i = 0; i <= N; i++) y = f.filter(slope * i * dt, dt); return r4((slope * N * dt - y) / slope); }
function jitter(fmc, beta, amp = 0.01, dt = 1 / 60, N = 2000) { const f = new I.OneEuro(fmc, beta, 1); let s = 0, s2 = 0; seed = 3; for (let i = 0; i < N; i++) { const y = f.filter(amp * 2 * rnd(), dt); if (i > 200) { s2 += y * y; } } return r4(Math.sqrt(s2 / (N - 201)) / (amp * 2 / Math.sqrt(12))); }
out.oneEuro = {
  lp1Hz_lag_s: r4(1 / (2 * Math.PI * 1)), lp5Hz_lag_s: r4(1 / (2 * Math.PI * 5)),
  fc5_b0: { slowLag: ramp(5, 0, 0.2), fastLag: ramp(5, 0, 2), jitterRatio: jitter(5, 0) },
  fc1_b1: { slowLag: ramp(1, 1, 0.2), fastLag: ramp(1, 1, 2), jitterRatio: jitter(1, 1) },
  fc2_b2: { slowLag: ramp(2, 2, 0.2), fastLag: ramp(2, 2, 2), jitterRatio: jitter(2, 2) },
};
// haptics
out.hap = [
  I.hapticMix({ buffet: 0.6 }), I.hapticMix({ onGround: true, gs: 30, rough: 0.15 }), I.hapticMix({ onGround: true, gs: 15, rough: 0.15 }),
  I.hapticMix({ tdSinkFpm: 400 }), I.hapticMix({ tdSinkFpm: 900, onGround: true, gs: 40 }), I.hapticMix({ buffet: 0.6 }, { gain: 0.5, buffet: 1, runway: 1, touchdown: 1 }),
];
console.log(JSON.stringify(out, null, 1));
