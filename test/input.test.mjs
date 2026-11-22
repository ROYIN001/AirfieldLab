// Pilot input layer, src/25-input.js (owner's research round 1, docs/research/01-flight-physics/11-input.md §11.3–11.5
// and 06-controls.md §6.7.2). Expected values are the report's (scripts i11_expected.mjs, i11_gamepad_profile.mjs,
// i11_latch_check.mjs, i11_current.mjs). Run: node --test test/input.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { M } from './harness.mjs';
const I = M;
const { Flight, AC, G0, RAD, DEG } = M;
const DT = 1 / 60;
const near = (got, want, tol, msg) => assert.ok(Math.abs(got - want) <= tol, `${msg}: ${got} (want ${want} ± ${tol})`);
const near2 = (got, want, tol, msg) => { near(got[0], want[0], tol, `${msg} [0]`); near(got[1], want[1], tol, `${msg} [1]`); };
const P = { pitch: I.INPUT_CFG.keys.pitch, roll: I.INPUT_CFG.keys.roll, rud: I.INPUT_CFG.keys.rud };
const frames = (n, v, dir, r, fine = 1) => { for (let i = 0; i < n; i++) v = I.keyRamp(v, dir, DT, r, fine); return v; };

test('T-I-01: dead zone 0.08 + expo 0.5 chain', () => {
  const f = (x) => I.shapeAxis(x, { dz: 0.08, expo: 0.5 });
  const want = [[0.05, 0], [0.1, 0.0109], [0.25, 0.0955], [0.5, 0.2758], [0.75, 0.5573], [1, 1], [-0.5, -0.2758]];
  for (const [x, y] of want) near(f(x), y, 0.0005, `f(${x})`);
  let prev = -Infinity;
  for (let x = -1; x <= 1 + 1e-9; x += 0.001) { const y = f(x); assert.ok(y >= prev - 1e-12, `monotonic at ${x.toFixed(3)}`); prev = y; }
});

test('T-C-14: gamepad shaping is odd, monotonic, 0 at the dead-zone edge and ±1 at the ends', () => {
  const f = (x) => I.shapeAxis(x, { dz: 0.08, expo: 0.5 });
  assert.equal(f(0.08), 0);
  near(f(0.5), 0.2758, 0.0005, 'f(0.5)');
  assert.equal(f(1), 1); assert.equal(f(-1), -1);
  for (let x = 0; x <= 1; x += 0.01) near(f(-x), -f(x), 1e-12, `odd at ${x.toFixed(2)}`);
  // the rest of the chain: calibration, invert, power curve, gain
  assert.equal(I.shapeAxis(-0.5, { dz: 0.08, expo: 0.5, invert: true }), f(0.5));
  near(I.shapeAxis(0.5, { pow: 2 }), 0.25, 1e-12, 'power 2'); near(I.shapeAxis(-0.5, { pow: 2 }), -0.25, 1e-12, 'power keeps the sign');
  assert.equal(I.shapeAxis(0.6, { gain: 2 }), 1, 'gain saturates at 1');
  near(I.shapeAxis(0.5, { cal: { min: -1, center: 0.1, max: 0.9 } }), 0.5, 1e-12, 'calibrated about the measured centre');
  assert.equal(I.shapeAxis(NaN, { dz: 0.08 }), 0, 'NaN reads as centre');
});

test('T-I-02: radial, axial and outer dead zones, circle → square', () => {
  near2(I.dzRadial(0.1, 0.1, 0.08), [0.0472, 0.0472], 0.0005, 'radial (0.1, 0.1)');
  near(I.dzAxial(0.1, 0.08), 0.0217, 0.0005, 'axial 0.1');
  near2(I.dzRadial(0.3, 0.05, 0.08), [0.2403, 0.0401], 0.0005, 'radial (0.3, 0.05)');
  near(I.dzAxial(0.97, 0.08, 0.02), 0.9889, 0.0005, 'axial 0.97 with outer 0.02');
  assert.equal(I.dzAxial(0.98, 0.08, 0.02), 1);
  near2(I.dzRadial(0.1, 0.1, 0.08, 0.02), [0.0483, 0.0483], 0.0005, 'radial (0.1, 0.1), outer 0.02');
  near(I.dzAxial(0.1, 0.08, 0.02), 0.0222, 0.0005, 'axial 0.1, outer 0.02');
  near2(I.dzRadial(0.3, 0.05, 0.08, 0.02), [0.2457, 0.0409], 0.0005, 'radial (0.3, 0.05), outer 0.02');
  near2(I.circleToSquare(0.7071, 0.7071), [1, 1], 0.0005, 'circle → square');
  assert.deepEqual(I.dzRadial(0.05, -0.04, 0.08), [0, 0]); assert.deepEqual(I.circleToSquare(0, 0), [0, 0]);
});

test('T-I-03: bipolar calibration, and levers whose rest is at either end', () => {
  const c = { min: -0.9, center: 0.04, max: 0.95 };
  near(I.calBipolar(-0.9, c), -1, 1e-4, 'min'); near(I.calBipolar(0.04, c), 0, 1e-4, 'centre'); near(I.calBipolar(0.5, c), 0.5055, 1e-4, '0.5');
  const thr = { cal: { rest: 1, full: -1 }, dzIdle: 0.02, dzFull: 0.02 };   // spec: forward (−1) = full power
  near(I.shapeLever(1, thr), 0, 1e-4, 'throttle idle'); near(I.shapeLever(0, thr), 0.5, 1e-4, 'throttle half'); near(I.shapeLever(-1, thr), 1, 1e-4, 'throttle full');
  for (const [name, rest] of [['Saitek, rest −1', -1], ['T-Rudder, rest +1', 1]]) {
    const cal = { rest, full: -rest };
    near(I.calUnipolar(rest, cal), 0, 1e-4, `${name}: released`); near(I.calUnipolar(0, cal), 0.5, 1e-4, `${name}: half`); near(I.calUnipolar(-rest, cal), 1, 1e-4, `${name}: full`);
  }
});

test('T-I-04: rest statistics, automatic dead zone, axis detection', () => {
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5;   // the report's LCG
  const samples = Array.from({ length: 120 }, () => 0.03 + 0.02 * rnd());
  const rs = I.restStats(samples);
  near(rs.center, 0.03, 0.002, 'centre'); assert.ok(rs.noise <= 0.0102, `noise ${rs.noise}`);
  near(I.suggestDeadzone(rs.noise), 0.035, 0.003, 'dead zone');
  assert.equal(I.suggestDeadzone(0), 0.03, 'never below 0.03'); assert.equal(I.suggestDeadzone(1), 0.25, 'never above 0.25');
  const rest = [0.01, -0.02, 1.0, 0.0], moves = [[0.02, -0.01, 1.0, 0.0], [0.05, -0.6, 0.98, 0.1], [0.0, -1.0, 0.99, 0.05]];
  assert.equal(I.detectAxis(rest, moves), 1);
  assert.equal(I.detectAxis(rest, [[0.1, -0.1, 0.9, 0.2]]), -1, 'nothing moved far enough');
  assert.deepEqual(I.restStats([]), { center: 0, noise: 0 });
});

test('T-I-05: keyboard ramps (pitch up 0.5/s, back 2.5/s) and Shift', () => {
  const r = P.pitch;
  near(frames(1, 0, 1, r), 0.00833, 1e-5, 'one frame');
  near(frames(18, 0, 1, r), 0.15, 1e-9, 'held 0.3 s');
  assert.ok(frames(119, 0, 1, r) < 0.992, 'not full before 2 s'); near(frames(120, 0, 1, r), 1, 1e-9, 'full at 2.0 s');
  assert.ok(frames(23, 1, 0, r) > 0.04, 'still returning'); near(frames(24, 1, 0, r), 0, 1e-9, 'centred in 0.40 s');
  near(frames(6, 0.5, -1, r), 0.25, 1e-9, 'opposite key from 0.5 for 6 frames');
  near(frames(120, 0, 1, r, I.INPUT_CFG.keys.fine), 0.5, 1e-9, 'Shift held 2 s: half travel');
  near(frames(600, 0, 1, r, I.INPUT_CFG.keys.fine), 0.5, 1e-12, 'Shift caps the travel at 0.5');
  // roll 1.0/3.0, rudder 1.0/2.0
  near(frames(18, 0, 1, P.roll), 0.3, 1e-9, 'roll held 0.3 s'); near(frames(12, 1, 0, P.roll), 0.4, 1e-9, 'roll back at 3/s');
  near(frames(30, 0, -1, P.rud), -0.5, 1e-9, 'rudder held 0.5 s'); near(frames(15, -0.5, 0, P.rud), 0, 1e-9, 'rudder back at 2/s');
  // the ramp follows frame time: 30 Hz and 144 Hz frames give the same value after 0.5 s
  const at = (hz) => { let v = 0; for (let i = 0; i < hz / 2; i++) v = I.keyRamp(v, 1, 1 / hz, r); return v; };
  near(at(30), 0.25, 1e-9, '30 Hz'); near(at(144), 0.25, 1e-9, '144 Hz');
});

// DIRECT law at 95 kt with landing flaps (the app's default approach), 60 Hz frames, as scripts/i11_current.mjs
function pullAndRelease(holdS, rates) {
  const fl = new Flight({ pilot: 'man', assist: false, autoThr: false, dist: 5500 });
  fl.setPilot('ap'); fl.setPilot('man');
  const k = new I.KeyAxis(rates);
  let nMax = 0, aMax = -Infinity;
  for (let i = 0; i < 240; i++) {   // 4 s
    Object.assign(fl.input, { x: 0, y: k.update(DT, i * DT < holdS - 1e-9 ? 1 : 0), rud: 0, thr: fl.ac.thr, brake: 0 });
    fl.advance(DT);
    const a = fl.ac.air;
    nMax = Math.max(nMax, (a.qbar * AC.S * a.CL) / (AC.m * G0) * Math.cos(a.alpha)); aMax = Math.max(aMax, a.alpha * RAD);
  }
  return { dn: nMax - 1, alpha: aMax };
}
test('T-I-06: a 0.3 s pull in DIRECT at 95 kt gives 0.04–0.15 g and α < 4° (the old 2.0/s ramp gave 0.40 g)', () => {
  const r = pullAndRelease(0.3, P.pitch);
  assert.ok(r.dn >= 0.04 && r.dn <= 0.15, `Δn ${r.dn.toFixed(3)} g (report 0.074)`);
  assert.ok(r.alpha < 4, `α max ${r.alpha.toFixed(2)}°`);
  const old = pullAndRelease(0.3, { up: 2.0, back: 5, cap: 1 });
  assert.ok(old.dn > 2 * r.dn, `old ramp Δn ${old.dn.toFixed(3)} g`);
});

test('T-I-09: a tap shorter than one frame still moves the stick for one frame', () => {
  const ks = new I.KeyState(), ev = (code) => ({ code, repeat: false, ctrlKey: false, metaKey: false, altKey: false });
  ks.down(ev('KeyS'), { train: true, flying: true }); ks.up(ev('KeyS'));
  assert.equal(ks.size, 0, 'released before the frame');
  const k = new I.KeyAxis(P.pitch);
  near(k.update(DT, I.keyDir(ks.frame(), 'up', 'dn')), 0.00833, 1e-5, 'the frame sees S');
  assert.equal(ks.frame().size, 0, 'the next frame is empty');
  // a key still held stays in the next frame; Ctrl drops taps as well
  ks.down(ev('KeyW'), {}); ks.frame(); assert.deepEqual([...ks.frame()], ['up']);
  ks.down(ev('KeyA'), {}); ks.up(ev('KeyA')); ks.down({ ...ev('ControlLeft'), ctrlKey: true }, {});
  assert.equal(ks.frame().size, 0, 'Ctrl releases held keys and pending taps');
  // toggles are never held or tapped
  ks.down(ev('KeyC'), { train: true }); assert.equal(ks.frame().size, 0);
});

test('T-I-10: flap detents and split brakes', () => {
  const N = [0, 0.5, 1];
  assert.equal(I.flapNotch(0, 1, N), 0.5); assert.equal(I.flapNotch(0.3, 1, N), 0.5); assert.equal(I.flapNotch(0.5, 1, N), 1);
  assert.equal(I.flapNotch(1, 1, N), 1); assert.equal(I.flapNotch(1, -1, N), 0.5); assert.equal(I.flapNotch(0.3, -1, N), 0); assert.equal(I.flapNotch(0, -1, N), 0);
  assert.deepEqual(I.brakePair(0.3, 0, 0.6), [0.6, 0.6]); assert.deepEqual(I.brakePair(0.8, 0, 0), [0.8, 0]); assert.deepEqual(I.brakePair(0, 0, 0, 1), [1, 1]);
});

test('T-I-11: vendor and product from Gamepad.id; the readable name', () => {
  assert.deepEqual(I.parseGamepadId('Xbox 360 Controller (STANDARD GAMEPAD Vendor: 045e Product: 028e)'), { vendor: '045e', product: '028e' });
  assert.deepEqual(I.parseGamepadId('810-3-USB Gamepad'), { vendor: '0810', product: '0003' });
  assert.equal(I.parseGamepadId('T.16000M'), null);
  assert.equal(I.padLabel('Xbox 360 Controller (STANDARD GAMEPAD Vendor: 045e Product: 028e)'), 'Xbox 360 Controller');
  assert.equal(I.padLabel('810-3-USB Gamepad'), 'USB Gamepad'); assert.equal(I.padLabel('T.16000M'), 'T.16000M'); assert.equal(I.padLabel(undefined), '');
});

const btn = (v) => ({ pressed: v > 0.5, touched: v > 0, value: v });
const pad = (axes, values = {}, mapping = 'standard') => ({ id: 'Test pad', mapping, connected: true, axes, buttons: Array.from({ length: 17 }, (_, i) => btn(values[i] || 0)) });

test('T-I-12: standard gamepad profile', () => {
  const p = I.readPad(pad([0.5, 0.6, 0, -0.4], { 6: 0.2, 7: 0.7 }));
  near(p.x, 0.3019, 0.0005, 'roll'); near(p.y, 0.3930, 0.0005, 'pitch: stick back = pull = +y, no sign change'); near(p.rud, 0.3635, 0.0005, 'rudder from the triggers');
  near(I.clamp(0.3 + p.thrRate * 1, 0, 1), 0.4471, 0.0005, 'throttle after 1 s from 0.3');
  const rest = I.readPad(pad([0.05, -0.04, 0, 0.1]));
  assert.deepEqual([rest.x, rest.y, rest.rud, rest.thrRate], [0, 0, 0, 0], 'at rest every channel is 0');
  // buttons: bumpers = brakes, D-pad up / down = trim nose down / up, rising edges only and never on the first poll
  const b = I.readPad(pad([0, 0, 0, 0], { 4: 1, 13: 1, 0: 1 }));
  assert.deepEqual([b.brakeL, b.brakeR, b.trim, b.events.length], [1, 0, 1, 0]);
  const e1 = I.readPad(pad([0, 0, 0, 0], { 0: 1, 1: 1, 9: 1 }), b.pressed), e2 = I.readPad(pad([0, 0, 0, 0], { 0: 1, 1: 1, 9: 1 }), e1.pressed);
  assert.deepEqual(e1.events, ['cam', 'pause'], 'A was already down; B and Start went down'); assert.deepEqual(e2.events, []);
  assert.deepEqual(I.readPad(pad([0, 0, 0, 0], { 14: 1, 15: 1, 3: 1 }), e2.pressed).events, ['gear', 'flapUp', 'flapDn']);
  // other devices wait for the binding wizard; missing or broken values read as rest
  assert.equal(I.readPad(pad([0, 0, -1, 0], {}, '')), null); assert.equal(I.readPad(null), null);
  const odd = I.readPad({ mapping: 'standard', axes: [NaN, undefined], buttons: [null, 1, { pressed: true }] });
  assert.deepEqual([odd.x, odd.y, odd.rud, odd.thrRate], [0, 0, 0, 0]); assert.deepEqual(odd.pressed, [false, true, true]);
});

test('arbitration: the source that moved last controls the axis', () => {
  // the report's examples (scripts/i11_gamepad_profile.mjs)
  const a1 = new I.Arbiter(2); a1.t = [10, 12]; a1.at = [0, 0.4]; assert.equal(a1.pick(12.1, [0, 0.4]), 0.4);
  const a2 = new I.Arbiter(2); a2.t = [12, 11]; a2.at = [0.2, 0.4]; assert.equal(a2.pick(12.1, [0.2, 0.4]), 0.2);
  const a3 = new I.Arbiter(2); assert.equal(a3.pick(12, [0, 0]), 0);
  // a gamepad resting at the centre does not cancel the keyboard
  const a = new I.Arbiter(2);
  assert.equal(a.pick(0, [0.1, 0], [true]), 0.1);
  // the stick moves: it takes over; a key pressed later takes over again; when the key's ramp is back at 0 the
  // stick, still deflected, has the axis
  assert.equal(a.pick(1, [0.1, 0.3]), 0.3);
  assert.equal(a.pick(2, [0.05, 0.3], [true]), 0.05);
  assert.equal(a.pick(3, [0, 0.3]), 0.3);
  // a stick that only jitters by less than eps does not count as moving
  assert.equal(a.pick(4, [0.02, 0.31], [true]), 0.02); assert.equal(a.pick(5, [0.02, 0.305]), 0.02);
});

test('PilotInput: keys, Shift, gamepad and touch through one frame', () => {
  const pi = new I.PilotInput(), S = (...a) => new Set(a);
  let t = 0, r;
  const step = (s, n = 1) => { for (let i = 0; i < n; i++) { t += DT; r = pi.update(DT, t, { thr: 0.3, ...s }); } return r; };
  step({ keys: S('dn', 'rt', 'rr') }, 18);
  near(r.y, 0.15, 1e-9, 'pull'); near(r.x, 0.3, 1e-9, 'roll right'); near(r.rud, 0.3, 1e-9, 'rudder right');
  step({ keys: S() }, 60); assert.deepEqual([r.x, r.y, r.rud], [0, 0, 0], 'self-centred');
  step({ keys: S('up', 'fine') }, 120); near(r.y, -0.5, 1e-9, 'push with Shift: half travel');
  step({ keys: S() }, 60);
  // throttle: keys and the right stick add their rates; brakes from B, the bumpers and the touch button
  near(step({ keys: S('tu') }).thr, 0.3 + 0.35 * DT, 1e-12, 'throttle key');
  near(step({ pad: pad([0, 0, 0, -1]) }).thr, 0.3 + 0.5 * DT, 1e-12, 'throttle stick');
  near(step({ keys: S('tu'), pad: pad([0, 0, 0, 1]) }).thr, 0.3 - 0.15 * DT, 1e-12, 'key up and stick down add');
  assert.deepEqual([step({ pad: pad([0, 0, 0, 0], { 5: 1 }) }).brake, r.brakeL, r.brakeR], [1, 0, 1]);
  assert.deepEqual([step({ keys: S('br') }).brakeL, r.brakeR], [1, 1]); assert.equal(step({ brake: true }).brake, 1); assert.equal(step({}).brake, 0);
  // a resting gamepad leaves the keys in control; a moved stick takes over; the touch stick wins while touched
  step({ keys: S('dn'), pad: pad([0.03, 0.02, 0, 0]) }, 30); near(r.y, 0.25, 1e-9, 'keys over a resting pad');
  step({ keys: S(), pad: pad([0, 0, 0, 0]) }, 30); assert.equal(r.y, 0);
  near(step({ pad: pad([0, 1, 0, 0]) }).y, 1, 1e-12, 'stick pulled fully');
  near(step({ pad: pad([0, 1, 0, 0]), touch: { x: 0, y: -0.4 } }).y, -0.4, 1e-12, 'touch stick');
  assert.equal(pi.padUsed, true);
  // pad buttons: events from the second poll on; a pad that goes away and comes back starts again without events
  step({ pad: pad([0, 0, 0, 0], { 1: 1 }) }); assert.deepEqual(r.events, ['cam']);
  step({}); assert.deepEqual(step({ pad: pad([0, 0, 0, 0], { 1: 1 }) }).events, [], 'first poll after a gap fires nothing');
  pi.reset(); assert.equal(pi.padUsed, false); assert.equal(step({ keys: S('dn') }).y, 0.5 * DT);
});

test('the app reads the gamepad and applies PilotInput (src/90-app.js wiring)', () => {
  const app = fs.readFileSync(new URL('../src/90-app.js', import.meta.url), 'utf8');
  assert.match(app, /pin:\s*new PilotInput\(\)/, 'app.pin is a PilotInput');
  assert.match(app, /const keys = app\.keys\.frame\(\);/, 'held keys and taps are read once per frame');
  assert.match(app, /app\.pin\.update\(dt, now \/ 1000, \{ keys, pad/, 'readInputs goes through app.pin.update');
  assert.match(app, /try \{ pads = navigator\.getGamepads \? navigator\.getGamepads\(\) : \[\]; \} catch/, 'getGamepads guarded (permissions policy)');
  assert.match(app, /addEventListener\('gamepaddisconnected'[\s\S]{0,400}?app\.train\.warp = 0/, 'a pad lost in manual flight pauses');
  assert.match(app, /app\.pin\.reset\(\)/, 'a new flight resets the input layer');
  assert.doesNotMatch(app, /ramp = \(v, tgt, r\)/, 'no second key ramp in the app');
});
