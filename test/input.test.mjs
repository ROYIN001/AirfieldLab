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
  const srcVals = (s) => { const p = I.readPad(s.pad || null), tc = s.touch || null;
    return { x: [null, p ? p.x : 0, tc ? tc.x : 0], y: [null, p ? p.y : 0, tc ? tc.y : 0], rud: [null, p ? p.rud : 0] }; };
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
  assert.doesNotMatch(app, /ramp = \(v, tgt, r\)/, 'no second key ramp in the app');
});
