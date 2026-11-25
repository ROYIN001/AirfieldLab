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
const btn = (v) => ({ pressed: v > 0.5, touched: v > 0, value: v });
const pad = (axes, values = {}, mapping = 'standard') => ({ id: 'Test pad', mapping, connected: true, axes, buttons: Array.from({ length: 17 }, (_, i) => btn(values[i] || 0)) });
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
  // the same on a standard gamepad: a mirrored reading gives mirrored channels, the dead-zone edge gives 0
  for (const [ax, b] of [[[0.5, 0.6, 0, -0.4], { 6: 0.2, 7: 0.7 }], [[0.9, -0.3, 0, 0.8], { 7: 1 }], [[-0.05, 1, 0, -1], { 6: 0.4 }]]) {
    const p = I.readPad(pad(ax, b)), m = I.readPad(pad(ax.map((v) => -v), { 6: b[7] || 0, 7: b[6] || 0 }));
    for (const k of ['x', 'y', 'rud', 'thrRate']) near(m[k], -p[k], 1e-12, `${k} mirrored at ${ax}`);
  }
  assert.deepEqual([I.readPad(pad([0.08, 0, 0, 0])).x, I.readPad(pad([0, 0, 0, 0.15])).thrRate, I.readPad(pad([0, 0, 0, 0], { 7: 0.05 })).rud], [0, 0, 0]);
  near(I.readPad(pad([-1, 0, 0, 0])).x, -1, 1e-12, 'full left'); near(I.readPad(pad([0, 0, 0, 0], { 6: 1 })).rud, -1, 1e-12, 'full left rudder');
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

test('arbitration (§11.5.4): the source that moved last controls the axis', () => {
  // the report's examples (scripts/i11_gamepad_profile.mjs)
  const a1 = new I.Arbiter(2); a1.t = [10, 12]; a1.at = [0, 0.4]; assert.equal(a1.pick(12.1, [0, 0.4]), 0.4);
  const a2 = new I.Arbiter(2); a2.t = [12, 11]; a2.at = [0.2, 0.4]; assert.equal(a2.pick(12.1, [0.2, 0.4]), 0.2);
  const a3 = new I.Arbiter(2); assert.equal(a3.pick(12, [0, 0]), 0); assert.equal(a3.src, -1);
  // the keyboard is not tracked: only a key going down moves it, so its ramp and its self-centring never take the
  // axis back from a stick
  const a = new I.Arbiter(2), K = { track: [false] };
  assert.equal(a.pick(0, [0.1, 0], { ...K, edge: [true] }), 0.1, 'a key went down; the gamepad rests at 0');
  assert.equal(a.pick(1, [0.3, 0.4], K), 0.4, 'the stick moved: it takes over');
  assert.equal(a.pick(2, [0.6, 0.41], K), 0.41, 'the key ramp keeps changing, the stick only jitters: no change');
  assert.equal(a.pick(3, [0.6, 0.41], { ...K, edge: [true] }), 0.6, 'a key going down takes the axis back');
  assert.equal(a.pick(4, [0, 0], K), 0); assert.equal(a.src, 0, 'every source at rest: the last one keeps the axis');
});

const S = (...a) => new Set(a);
// PilotInput at `hz` frames per second. Every frame where the source in control of an axis changes, the output must
// not jump (§11.5.4): it moves by no more than the axis's return rate × dt, unless a stick took over an output that
// sat where the stick was a frame before, in which case it moves only as far as the stick itself did.
function rig(hz = 60) {
  const pi = new I.PilotInput(), dt = 1 / hz, K = I.INPUT_CFG.keys, back = { x: K.roll.back, y: K.pitch.back, rud: K.rud.back };
  let t = 0, last = null, lastSrc = null, switches = 0;
  const srcVals = (s) => { const p = I.readPad(s.pad || null), tc = s.touch || null, g = s.tilt || null;
    return { x: [null, p ? p.x : 0, tc ? tc.x : 0, g ? g.x : 0], y: [null, p ? p.y : 0, tc ? tc.y : 0, g ? g.y : 0], rud: [null, p ? p.rud : 0] }; };
  const step = (s, n = 1) => {
    let r;
    for (let i = 0; i < n; i++) {
      t += dt; r = pi.update(dt, t, { thr: 0.3, ...s });
      const sv = srcVals(s);
      if (last) for (const k of ['x', 'y', 'rud']) if (r.src[k] !== last.src[k]) {
        switches++;
        const j = r.src[k], ownMove = j > 0 && last[k] === lastSrc[k][j] && r[k] === sv[k][j];
        assert.ok(ownMove || Math.abs(r[k] - last[k]) <= back[k] * dt + 1e-12, `${k} jumped ${last[k]} → ${r[k]} when the source changed to ${j}`);
      }
      last = r; lastSrc = sv;
    }
    return r;
  };
  return { pi, step, dt, switches: () => switches };
}

test('PilotInput: keys, Shift, throttle, brakes and gamepad buttons through one frame', () => {
  const { pi, step } = rig();
  let r = step({ keys: S('dn', 'rt', 'rr') }, 18);
  near(r.y, 0.15, 1e-9, 'pull'); near(r.x, 0.3, 1e-9, 'roll right'); near(r.rud, 0.3, 1e-9, 'rudder right');
  r = step({ keys: S() }, 60); assert.deepEqual([r.x, r.y, r.rud], [0, 0, 0], 'self-centred');
  r = step({ keys: S('dn', 'fine') }, 18); near(r.y, 0.075, 1e-9, 'Shift halves the rate (0.25/s)');
  r = step({ keys: S('dn', 'fine') }, 600); near(r.y, 0.5, 1e-9, 'and the travel');
  r = step({ keys: S('fine') }); near(r.y, 0.5 - 2.5 * DT, 1e-12, 'but not the return rate');
  step({ keys: S() }, 60);
  // throttle: keys and the right stick add their rates; Shift leaves the throttle alone
  near(step({ keys: S('tu') }).thr, 0.3 + 0.35 * DT, 1e-12, 'throttle key');
  near(step({ keys: S('tu', 'fine') }).thr, 0.3 + 0.35 * DT, 1e-12, 'throttle key with Shift: same rate');
  near(step({ pad: pad([0, 0, 0, -1]) }).thr, 0.3 + 0.5 * DT, 1e-12, 'throttle stick');
  near(step({ keys: S('tu'), pad: pad([0, 0, 0, 1]) }).thr, 0.3 - 0.15 * DT, 1e-12, 'key up and stick down add');
  // brakes from B, the bumpers and the touch button
  r = step({ pad: pad([0, 0, 0, 0], { 5: 1 }) }); assert.deepEqual([r.brake, r.brakeL, r.brakeR], [1, 0, 1]);
  r = step({ keys: S('br') }); assert.deepEqual([r.brakeL, r.brakeR], [1, 1]);
  assert.equal(step({ brake: true }).brake, 1); assert.equal(step({}).brake, 0);
  assert.equal(pi.padUsed, true);
  // pad buttons: events from the second poll of the same pad on; after a gap, or from another pad, none on the first
  const padAt = (index, id, b) => ({ ...pad([0, 0, 0, 0], b), index, id });
  step({ pad: padAt(0, 'A', {}) }); assert.deepEqual(step({ pad: padAt(0, 'A', { 1: 1 }) }).events, ['cam']);
  step({}); assert.deepEqual(step({ pad: padAt(0, 'A', { 1: 1 }) }).events, [], 'first poll after a gap fires nothing');
  step({ pad: padAt(0, 'A', {}) });
  assert.deepEqual(step({ pad: padAt(1, 'B', { 1: 1, 9: 1 }) }).events, [], 'a different pad: its held buttons do not fire');
  assert.deepEqual(step({ pad: padAt(1, 'B', { 1: 1, 9: 1 }) }).events, []);
  assert.deepEqual(pi.buttons(padAt(1, 'B', { 0: 1, 1: 1, 9: 1 })), ['take'], 'between flights: buttons only');
  assert.deepEqual(pi.buttons(null), []);
});

test('PilotInput: a stick moved after a held key takes over, without a jump', () => {
  const { step, switches } = rig(), py = I.readPad(pad([0, 0.6, 0, 0])).y;
  let r = step({ keys: S('dn') }, 60); near(r.y, 0.5, 1e-9, 'key held 1 s'); assert.equal(r.src.y, 0);
  r = step({ keys: S('dn'), pad: pad([0, 0.6, 0, 0]) });
  assert.equal(r.src.y, 1, 'the stick moved last: it has the axis though the key is still held');
  near(r.y, 0.5 - 2.5 * DT, 1e-12, 'output runs to the stick at the return rate');
  r = step({ keys: S('dn'), pad: pad([0, 0.6, 0, 0]) }, 120); near(r.y, py, 1e-12, 'then follows the stick'); assert.equal(r.src.y, 1);
  r = step({ keys: S('dn'), pad: pad([0, 0.8, 0, 0]) }); near(r.y, I.readPad(pad([0, 0.8, 0, 0])).y, 1e-12, 'directly');
  // the stick goes back to the centre with the key still held: the key takes over where the output is
  r = step({ keys: S('dn'), pad: pad([0, 0, 0, 0]) }); assert.equal(r.src.y, 0);
  near(r.y, I.readPad(pad([0, 0.8, 0, 0])).y + 0.5 * DT, 1e-12, 'the key ramp starts from the output');
  // a key going down takes the axis from a deflected stick, and starts from the stick's value
  step({ keys: S(), pad: pad([0, -0.6, 0, 0]) }, 60);
  r = step({ keys: S('dn'), pad: pad([0, -0.6, 0, 0]) }); assert.equal(r.src.y, 0);
  near(r.y, -py + 2.5 * DT, 1e-12, 'reversing from the stick value at the return rate');
  // from a centred output a stick leaving its centre is followed at once, so the gamepad adds no lag after the keys
  step({}, 60); r = step({ keys: S('dn') }, 30); r = step({}, 30); assert.deepEqual([r.y, r.src.y], [0, 0]);
  r = step({ pad: pad([0, 0.6, 0, 0]) }); assert.equal(r.src.y, 1); near(r.y, py, 1e-12, 'stick followed at once');
  // a stick held deflected through a key tap: once the key ramp is home the output runs back to the stick, no jump
  r = step({ keys: S('up'), pad: pad([0, 0.6, 0, 0]) }, 12); assert.equal(r.src.y, 0, 'the tap took the axis');
  r = step({ pad: pad([0, 0.6, 0, 0]) }, 30); assert.equal(r.src.y, 1, 'the deflected stick has it again');
  near(r.y, py, 1e-12, 'and the output has run back to it');
  assert.ok(switches() >= 4, `${switches()} switches checked`);
});

test('PilotInput: touch stick against the keys, and no flip-flop at 144 Hz', () => {
  const { step } = rig();
  let r = step({ keys: S('dn') }, 30); r = step({}, 30); assert.deepEqual([r.y, r.src.y], [0, 0], 'keys used, then centred');
  r = step({ touch: { x: 0, y: -0.4 } }); assert.equal(r.src.y, 2, 'a finger on the stick takes the axis');
  assert.equal(r.y, -0.4, 'from a centred output it is followed at once, as before (the touch stick is absolute)');
  r = step({ keys: S('dn'), touch: { x: 0, y: -0.4 } }); assert.equal(r.src.y, 0, 'a key going down takes over from a still finger');
  near(r.y, -0.4 + 2.5 * DT, 1e-12, 'from the touch value');
  r = step({ keys: S('dn'), touch: { x: 0, y: -0.4 } }, 30); assert.equal(r.src.y, 0, 'a finger that does not move does not take it back');
  r = step({ keys: S('dn'), touch: { x: 0, y: -0.2 } }); assert.equal(r.src.y, 2, 'a finger that moves does');
  r = step({}, 30); assert.equal(r.y, 0, 'finger lifted, key released: centre');
  // 144 Hz: a held key and a stick held still never trade the axis frame by frame
  const f = rig(144); let src = [];
  f.step({ keys: S('rt') }, 72);
  for (let i = 0; i < 288; i++) src.push(f.step({ keys: S('rt'), pad: pad([0.5, 0, 0, 0]) }).src.x);
  assert.deepEqual([...new Set(src)], [1], 'the stick keeps the roll axis');
  src = []; f.step({ keys: S('lt'), pad: pad([0.5, 0, 0, 0]) });
  for (let i = 0; i < 288; i++) src.push(f.step({ keys: S('lt'), pad: pad([0.5, 0, 0, 0]) }).src.x);
  assert.deepEqual([...new Set(src)], [0], 'the opposite key took it and keeps it');
});

test('PilotInput: reset clears every channel, even with keys and sticks deflected', () => {
  const { pi, step } = rig();
  step({ keys: S('dn', 'lt', 'rl'), pad: pad([0.7, 0.7, 0, 0], { 1: 1 }) }, 90);
  step({ keys: S('dn', 'lt', 'rl'), touch: { x: 0.5, y: 0.5 } }, 10);
  pi.reset();
  const r = pi.update(DT, 100, { thr: 0.3, keys: S() });
  assert.deepEqual([r.x, r.y, r.rud, r.src.x, r.src.y, r.src.rud, pi.padUsed], [0, 0, 0, -1, -1, -1, false]);
  assert.deepEqual(pi.update(DT, 100 + DT, { thr: 0.3, pad: pad([0, 0, 0, 0], { 1: 1 }) }).events, [], 'no stale button edge');
  near(pi.update(DT, 100 + 2 * DT, { thr: 0.3, keys: S('dn') }).y, 0.5 * DT, 1e-12, 'keys ramp from 0 again');
});

// ── phone tilt (TiltStick): not in the research report; geometry from the W3C DeviceOrientation Event spec ──
const D2R = Math.PI / 180;
// (beta, gamma) in the spec's ranges for an "up" vector u in device coordinates (inverse of tiltUp)
function bg(u) {
  const b = u[2] >= 0 ? Math.asin(u[1]) : (u[1] >= 0 ? Math.PI : -Math.PI) - Math.asin(u[1]), cb = Math.cos(b);
  return [b / D2R, Math.atan2(-u[0] / cb, u[2] / cb) / D2R];
}
// a pose held like a yoke, seen in the screen frame: top edge raised `pitch` degrees from flat, then turned `wheel`
// degrees counter-clockwise like a steering wheel (left edge down); `angle` is how the screen is turned (Screen
// Orientation API). Returns the deviceorientation (beta, gamma) of that pose.
function pose(pitch, wheel, angle) {
  const t = pitch * D2R, f = wheel * D2R, a = angle * D2R;
  const r0 = 0, u0 = Math.sin(t), out = Math.cos(t);
  const r = r0 * Math.cos(f) + u0 * Math.sin(f), up = -r0 * Math.sin(f) + u0 * Math.cos(f);
  return bg([r * Math.cos(a) + up * Math.sin(a), -r * Math.sin(a) + up * Math.cos(a), out]);
}
// held near flat like a tray: top edge raised `pitch` degrees, then the phone turned about its own up axis so the right
// edge rises `side` degrees
function poseTray(pitch, side, angle) {
  const t = pitch * D2R, p = side * D2R, a = angle * D2R;
  const r = Math.cos(t) * Math.sin(p), up = Math.sin(t), out = Math.cos(t) * Math.cos(p);
  return bg([r * Math.cos(a) + up * Math.sin(a), -r * Math.sin(a) + up * Math.cos(a), out]);
}
const settle = (ts, b, g, t0, n = 60) => { let t = t0; for (let i = 0; i < n; i++) { t += DT; ts.sample(b, g, t); ts.read(DT, t); } return t; };

test('tilt: the up vector from beta and gamma (W3C DeviceOrientation, Z-X\'-Y\'\')', () => {
  near2(I.tiltUp(0, 0).slice(1), [0, 1], 1e-12, 'flat, screen up'); near(I.tiltUp(0, 0)[0], 0, 1e-12, 'flat x');
  const up = I.tiltUp(90, 0); near(up[0], 0, 1e-12, 'portrait upright x'); near(up[1], 1, 1e-12, 'y'); near(up[2], 0, 1e-12, 'z');
  const l = I.tiltUp(0, -45); near(l[0], Math.SQRT1_2, 1e-12, 'right edge raised 45° (gamma −45)'); near(l[2], Math.SQRT1_2, 1e-12, 'z');
  let seed = 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 200; i++) {
    const u0 = [rnd() - 0.5, rnd() - 0.5, rnd() - 0.5], m = Math.hypot(...u0), u = u0.map((v) => v / m);
    const [b, g] = bg(u); assert.ok(b >= -180 && b <= 180 && g >= -90 && g <= 90, `spec ranges ${b} ${g}`);
    const back = I.tiltUp(b, g); for (let k = 0; k < 3; k++) near(back[k], u[k], 1e-9, `round trip ${i}.${k}`);
  }
});

test('tilt: yoke angles for both grips in every screen orientation, and which way is which', () => {
  for (const angle of [0, 90, 180, 270]) {
    const u = (b) => I.tiltUp(...b);
    near(I.tiltRecline(u(pose(40, 0, angle)), angle), 40, 1e-9, `recline at ${angle}°`);
    // wheel grip: turning like a steering wheel is roll, exactly, and does not move pitch
    const w = I.tiltAngles(u(pose(40, 10, angle)), angle, 'wheel');
    near(w.roll, 10, 1e-9, `wheel turn at ${angle}°`); near(w.pitch, 40, 1e-9, `wheel turn leaves pitch at ${angle}°`);
    near(I.tiltAngles(u(pose(55, -20, angle)), angle, 'wheel').pitch, 55, 1e-9, 'pitch 55, wheel −20');
    // tray grip: turning about the screen's up axis is roll, exactly, and does not move pitch
    const t = I.tiltAngles(u(poseTray(20, 12, angle)), angle, 'tray');
    near(t.roll, 12, 1e-9, `tray tilt at ${angle}°`); near(t.pitch, 20, 1e-9, `tray tilt leaves pitch at ${angle}°`);
  }
  // past upright the wheel pitch keeps growing (no fold-over at 90°)
  near(I.tiltAngles(I.tiltUp(...pose(100, 0, 90)), 90, 'wheel').pitch, 100, 1e-9, 'top edge 10° past upright');
  near(I.tiltAngles([Math.sin(12 * D2R), 0, Math.cos(12 * D2R)], 0, 'tray').roll, 12, 1e-9, 'flat, right edge raised 12°');
});

test('tilt: the screen angle is checked against gravity', () => {
  const u = I.tiltUp(...pose(40, 0, 90));
  assert.equal(I.pickScreenAngle(u, 90, true), 90); assert.equal(I.pickScreenAngle(u, 270, true), 90, 'a browser reporting the other sign');
  assert.equal(I.pickScreenAngle(u, -90, true), 90);
  assert.equal(I.pickScreenAngle(I.tiltUp(...pose(40, 0, 270)), 90, true), 270);
  assert.equal(I.pickScreenAngle(I.tiltUp(...pose(40, 0, 0)), 0, false), 0); assert.equal(I.pickScreenAngle(I.tiltUp(...pose(40, 0, 180)), 0, false), 180);
  // flat on a table gravity cannot tell: the browser's angle stands
  assert.equal(I.pickScreenAngle(I.tiltUp(...pose(5, 0, 90)), 270, true), 270); assert.equal(I.pickScreenAngle([0, 0, 1], -90, true), 270);
});

test('TiltStick: centre, direction, dead zone, full travel, smoothing and lost readings', () => {
  const c = I.INPUT_CFG.tilt;
  for (const angle of [90, 270, 0]) {
    const ts = new I.TiltStick(), landscape = angle % 180 !== 0;
    let t = 10;
    assert.deepEqual([ts.read(DT, t).x, ts.y], [0, 0], 'nothing before a reading');
    ts.centre({ angle, landscape }); t = settle(ts, ...pose(45, 0, angle), t);
    assert.ok(ts.centred); assert.equal(ts.grip, 'wheel'); assert.deepEqual([ts.x, ts.y], [0, 0], `centred at ${angle}°`);
    t = settle(ts, ...pose(45, 1.5, angle), t); assert.equal(ts.x, 0, 'inside the dead zone');
    t = settle(ts, ...pose(45, 15, angle), t, 120);
    near(ts.x, -I.tiltAxis(15, c.rollMax, c.dz, c.expo), 1e-6, `wheel 15° to the left at ${angle}° = roll left`); assert.ok(ts.x < -0.2);
    assert.equal(ts.y, 0, 'no pitch from the wheel turn');
    t = settle(ts, ...pose(57, 0, angle), t, 120); near(ts.y, I.tiltAxis(12, c.pitchMax, c.dz, c.expo), 1e-6, `top edge 12° toward the player = pull at ${angle}°`);
    t = settle(ts, ...pose(33, 0, angle), t, 120); assert.ok(ts.y < -0.1, 'top edge away = push');
    t = settle(ts, ...pose(45, -60, angle), t, 120); assert.equal(ts.x, 1, 'beyond full travel: 1');
    // held near flat: the tray grip
    const tr = new I.TiltStick(); let u = 0;
    tr.centre({ angle, landscape }); u = settle(tr, ...poseTray(20, 0, angle), u); assert.equal(tr.grip, 'tray');
    u = settle(tr, ...poseTray(20, 15, angle), u, 120); near(tr.x, -I.tiltAxis(15, c.rollMax, c.dz, c.expo), 1e-6, `tray: right edge up 15° = roll left at ${angle}°`);
    assert.equal(tr.y, 0, 'no pitch from the tray tilt');
    u = settle(tr, ...poseTray(32, 0, angle), u, 120); near(tr.y, I.tiltAxis(12, c.pitchMax, c.dz, c.expo), 1e-6, 'tray: top edge up 12° = pull');
  }
  // the centre is the pose of the reading in hand when read() next runs; read() never looks at the screen again, so
  // the browser turning the picture during a flight does not swap roll and pitch
  const ts = new I.TiltStick(); let t = 0;
  ts.sample(...pose(45, 0, 90), t); ts.centre({ angle: 90, landscape: true }); ts.read(DT, t);
  t = settle(ts, ...pose(45, 20, 90), t, 120);
  const x0 = ts.x; assert.ok(x0 < -0.2, `x0 ${x0}`); assert.equal(ts.angle, 90);
  // smoothing follows time, not frame rate: a step seen at 30 Hz and at 150 Hz gives the same value after 0.1 s
  const at = (hz) => { const s = new I.TiltStick(); let tt = 0; s.sample(...pose(45, 0, 90), tt); s.centre({ angle: 90, landscape: true }); s.read(1 / hz, tt);
    s.sample(...pose(45, 20, 90), tt); for (let i = 0; i < hz / 10; i++) { tt += 1 / hz; s.read(1 / hz, tt); } return s.x; };
  near(at(30), at(150), 1e-9, '30 Hz vs 150 Hz'); assert.ok(at(60) > x0 && at(60) < 0, 'and it lags the step a little');
  // a sensor without values (desktop Chrome sends one null reading) is ignored; a phone resting still sends no readings
  // (browsers send one only on a change of 0.1° or more), and its last pose stands
  assert.equal(ts.sample(null, null, t), false); assert.equal(ts.sample(NaN, 3, t), false);
  for (let i = 0; i < 300; i++) ts.read(DT); near(ts.x, x0, 1e-9, '5 s without a reading: same command');
  // the page hidden: lost() gives 0 until the next reading, and the centre is kept
  ts.lost(); assert.equal(ts.read(DT).x, 0); assert.ok(ts.centred);
  t = settle(ts, ...pose(45, 20, 90), t + 1, 120); near(ts.x, x0, 1e-9, 'readings back: same command');
  // re-centring on the current pose
  ts.centre({ angle: 90, landscape: true }); ts.read(DT, t); assert.equal(ts.x, 0);
  ts.reset(); assert.equal(ts.read(DT, t).x, 0); assert.equal(ts.centred, false);
});

test('PilotInput: the phone tilt as a stick source', () => {
  const { step } = rig();
  let r = step({ tilt: { x: 0.4, y: -0.2 } }); assert.deepEqual([r.src.x, r.src.y], [3, 3]); near(r.x, 0.4, 1e-12, 'roll from tilt'); near(r.y, -0.2, 1e-12, 'pitch');
  r = step({ tilt: { x: 0.4, y: -0.2 } }, 30); assert.equal(r.src.x, 3, 'a phone held still keeps the axis');
  r = step({ keys: S('lt'), tilt: { x: 0.4, y: -0.2 } }); assert.equal(r.src.x, 0, 'a key going down takes over'); near(r.x, 0.4 - 3 * DT, 1e-12, 'from the tilt value');
  r = step({ keys: S('lt'), tilt: { x: 0.45, y: -0.2 } }); assert.equal(r.src.x, 3, 'the phone moving takes it back'); assert.ok(Math.abs(r.x - (0.4 - 3 * DT)) <= 3 * DT + 1e-12);
  r = step({ tilt: { x: 0, y: 0 } }, 30); assert.deepEqual([r.x, r.y], [0, 0], 'level phone, centred stick');
  r = step({ tilt: null }); assert.deepEqual([r.x, r.y], [0, 0], 'tilt off');
});

test('the app reads the gamepad and applies PilotInput (src/90-app.js wiring)', () => {
  const app = fs.readFileSync(new URL('../src/90-app.js', import.meta.url), 'utf8');
  assert.match(app, /pin:\s*new PilotInput\(\)/, 'app.pin is a PilotInput');
  assert.match(app, /const keys = app\.keys\.frame\(\);/, 'held keys and taps are read once per frame');
  assert.match(app, /app\.pin\.update\(dt, now \/ 1000, \{ keys, pad/, 'readInputs goes through app.pin.update');
  assert.match(app, /try \{ pads = navigator\.getGamepads \? navigator\.getGamepads\(\) : \[\]; \} catch/, 'getGamepads guarded (permissions policy)');
  assert.match(app, /I\.x = r\.x; I\.y = r\.y; I\.rud = r\.rud; I\.thr = r\.thr; I\.brake = r\.brake;/, 'every channel reaches app.input');
  assert.match(app, /if \(fl\.pilot === 'man'\) Object\.assign\(fl\.input, app\.input\)/, 'and the flight');
  assert.match(app, /for \(const ev of r\.events\) doAction\(ev\)/, 'gamepad buttons in a flight run the same actions as the keys');
  assert.match(app, /for \(const ev of app\.pin\.buttons\(gp\)\) doAction\(ev\)/, 'and between flights');
  assert.match(app, /if \(app\.train\.state !== 'fly'\) padButtons\(\);/);
  assert.match(app, /addEventListener\('gamepaddisconnected'[\s\S]{0,200}?if \(e\.gamepad\.index !== app\.padIndex\) return;[\s\S]{0,120}?if \(app\.mode === 'train' && app\.train\.state === 'fly' && app\.flight\.pilot === 'man' && app\.pin\.padUsed && app\.train\.warp\) \{\s*app\.train\.warp = 0; refreshLive\(\);/, 'only the pad being read, lost in a manual flight it was flying, pauses');
  assert.match(app, /const firstPad = \(\) => \{ const l = listPads\(\); return \(l && l\.find\(\(gp\) => gp\.mapping === 'standard'\)\) \|\| null; \};/, 'the lowest-index standard pad is read');
  assert.match(app, /addEventListener\('gamepadconnected'[\s\S]{0,200}?used && used\.index !== gp\.index/, 'a second pad is told which one is in use');
  assert.match(app, /app\.pin\.reset\(\)/, 'a new flight resets the input layer');
  // phone tilt
  assert.match(app, /const g = app\.tilt\.on \? tilt\.read\(dt\) : null;\s*const r = app\.pin\.update\([^)]*tilt: g,/, 'the tilt reaches PilotInput');
  assert.match(app, /window\.addEventListener\('deviceorientation', onOrient\)/); assert.match(app, /window\.removeEventListener\('deviceorientation', onOrient\)/);
  assert.match(app, /tilt\.sample\(e\.beta, e\.gamma, performance\.now\(\) \/ 1000\)/, 'readings on the frame clock');
  assert.match(app, /async function enableTilt\(\) \{[^}]*?\n\s*if \(app\.tilt\.on\) return true;\s*const D = window\.DeviceOrientationEvent;\s*if \(sensorsBlocked\(\)\) return tiltFail\(TILT_FRAMED\);\s*try \{\s*if \(D && typeof D\.requestPermission === 'function' && \(await D\.requestPermission\(\)\) !== 'granted'\)/, 'iOS permission asked before any other await, from the tap');
  assert.match(app, /\$\('#chkTilt'\)\.addEventListener\('click', [\s\S]{0,200}?enableTilt\(\)/, 'enabled from a tap on the option');
  assert.match(app, /setTimeout\(\(\) => \{ if \(app\.tilt\.on && !tilt\.n\) tiltFail\(/, 'no reading within the wait: the option turns itself off');
  assert.match(app, /function startFlight\(\) \{\s*if \(app\.tilt\.want && !app\.tilt\.on\) enableTilt\(\);[\s\S]{0,400}?app\.pin\.reset\(\); centreTilt\(false\);/, 'a flight starts centred');
  assert.match(app, /if \(toMan\) centreTilt\(false\);/, 'taking control centres');
  assert.match(app, /stick\.addEventListener\('pointerdown', \(e\) => \{ if \(app\.tilt\.on\) \{ clearTimeout\(holdT\); holdT = setTimeout\(\(\) => centreTilt\(true\), 600\); return; \}/, 'holding the circle centres in tilt mode');
  assert.match(app, /const stickUp = \(\) => \{ clearTimeout\(holdT\);/, 'a short touch does not');
  assert.match(app, /if \(sensorsBlocked\(\)\) return tiltFail\(TILT_FRAMED\);/, 'a frame that blocks the sensors is named');
  assert.match(app, /if \(document\.hidden\) tilt\.lost\(\);/, 'hidden page: tilt to centre');
  assert.match(app, /keepAwake\(app\.tilt\.on && app\.mode === 'train' && app\.train\.state === 'fly'\)/, 'screen kept awake in a tilt flight');
  assert.doesNotMatch(app, /ramp = \(v, tgt, r\)/, 'no second key ramp in the app');
});
