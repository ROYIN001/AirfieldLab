// 1-g stall: CL(α) sweep for clean and landing flaps (owner's research round 1,
// docs/research/01-flight-physics/01-aero.md T-A-01; Vs0 71 kt is the design value AC.Vs0).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { M } from './harness.mjs';
const { Aircraft, AC, DEG, KT, G0 } = M;

function clmax(flaps) {
  const ac = new Aircraft(); ac.flaps = flaps;
  let best = { CL: 0, a: 0 };
  for (let i = 0; i <= 440; i++) {
    const a = i * 0.05, th = a * DEG, qq = [Math.cos(th / 2), 0, Math.sin(th / 2), 0];
    ac.x.set([0, 0, -500, 45, 0, 0, qq[0], qq[1], qq[2], qq[3], 0, 0, 0]);   // level flight path: α = θ
    const d = { wow: [0, 0, 0], load: [0, 0, 0] }; ac.deriv(ac.x, new Float64Array(13), d);
    if (d.CL > best.CL) best = { CL: d.CL, a };
  }
  return { ...best, vs: Math.sqrt(2 * AC.m * G0 / (1.225 * AC.S * best.CL)) / KT };
}

test('T-A-01 clean: CLmax 1.355 ± 0.02 at α 14.6 ± 1.0°, Vs1 78.5 ± 0.6 kt', () => {
  const r = clmax(0);
  assert.ok(Math.abs(r.CL - 1.355) <= 0.02 && Math.abs(r.a - 14.6) <= 1.0 && Math.abs(r.vs - 78.5) <= 0.6, `CLmax ${r.CL.toFixed(3)} at ${r.a.toFixed(2)}°, Vs ${r.vs.toFixed(1)} kt`);
});

test('T-A-01 landing flaps: CLmax 1.657 ± 0.02 at α 11.6 ± 1.0°, Vs0 71.0 ± 0.5 kt (AC.Vs0)', () => {
  const r = clmax(1);
  assert.ok(Math.abs(r.CL - 1.657) <= 0.02 && Math.abs(r.a - 11.6) <= 1.0 && Math.abs(r.vs - AC.Vs0) <= 0.5, `CLmax ${r.CL.toFixed(3)} at ${r.a.toFixed(2)}°, Vs ${r.vs.toFixed(1)} kt (AC.Vs0 ${AC.Vs0})`);
});

test('flaps lower the stall speed and the stall angle', () => {
  const c = clmax(0), f = clmax(1);
  assert.ok(f.vs < c.vs - 5 && f.a < c.a, `clean ${c.vs.toFixed(1)} kt at ${c.a.toFixed(2)}°, flaps ${f.vs.toFixed(1)} kt at ${f.a.toFixed(2)}°`);
});
