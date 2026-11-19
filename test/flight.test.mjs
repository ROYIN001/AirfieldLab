// The app's starting trim, a parked aircraft, and the autopilot landing in every wind scenario (seed 5).
// Floors sit just under the values measured on 2026-11-19 so an unintended change fails (research round 1,
// docs/research/01-flight-physics/10-validation.md §10.7: acceptance limits plus a narrow regression band).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { M } from './harness.mjs';
const { Flight, SCENARIOS, KT, DEG, AC, G0, FIELD } = M;

test('setApproach starts in trim (T-V-01): |a_NED| < 0.05 m/s², |ω̇| < 1e-6 rad/s², at Vapp', () => {
  const f = new Flight({ wind: SCENARIOS.calm });
  const d = new Float64Array(13); f.ac.deriv(f.ac.x, d);
  const a = Math.hypot(d[3], d[4], d[5]), w = Math.hypot(d[10], d[11], d[12]);
  assert.ok(a < 0.05 && w < 1e-6, `|a_NED| ${a.toFixed(4)}, |ω̇| ${w.toExponential(2)}`);
  assert.ok(Math.abs(f.ac.air.ias / KT - AC.Vapp) < 0.5, `IAS ${(f.ac.air.ias / KT).toFixed(1)} kt`);
});

test('parked: the gear carries the weight, no drift in 6 s', () => {
  const f = new Flight({ wind: SCENARIOS.calm }); f.ac.setParked(0, 0, 30 * DEG);
  for (let i = 0; i < 240 * 6; i++) f.ac.step(1 / 240);
  const a = f.ac.air, sum = a.load.reduce((s, v) => s + v, 0) / (AC.m * G0);
  assert.ok(Math.abs(sum - 1) < 0.01, `gear load ${sum.toFixed(3)} × weight`);
  assert.ok(a.gs < 0.05, `ground speed ${a.gs.toFixed(4)} m/s`);
});

// acceptance: score floors just under the measured scores (calm 100, head 96, xr 97, xl 88).
// regression band: touchdown point and sink rate measured on 2026-11-19 (seed 5, 21R); an intended change to the
// autopilot or the model updates REF in the same PR.
const FLOOR = { calm: 95, head: 90, xr: 90, xl: 85 };
const REF = { calm: { s: 309.5, fpm: -129.4 }, head: { s: 307.3, fpm: -148.4 }, xr: { s: 311.1, fpm: -122.2 }, xl: { s: 343.2, fpm: -46.2 } };
for (const [key, sc] of Object.entries(SCENARIOS)) {
  test(`autoland, ${key} (${sc.label}): lands, stops on the runway, score ≥ ${FLOOR[key]}`, () => {
    const f = new Flight({ wind: sc, pilot: 'ap', seed: 5 });
    let maxLoc = 0;
    while (f.ac.t < 260 && !f.ev.done && !f.crashed) { f.tick(f.dt); const a = f.ac.air; if (a.h > 20) maxLoc = Math.max(maxLoc, Math.abs(a.locDots)); }
    const td = f.ev.td, s = f.ev.score();
    assert.ok(!f.crashed && td && td.onRunway, `crashed ${f.crashed}, touchdown ${td ? td.s.toFixed(0) + ' m' : 'none'}`);
    assert.ok(f.ev.done && f.ev.stopS <= FIELD.rwyLen, `stopped ${f.ev.stopS != null ? f.ev.stopS.toFixed(0) + ' m' : 'no'}`);
    assert.deepEqual(f.ev.events.map((e) => e.k), []);
    assert.deepEqual(Object.keys(f.ev.gates).sort(), ['g200', 'g500']);
    assert.ok(Object.values(f.ev.gates).every((g) => g.ok), `gates ${JSON.stringify(f.ev.gates)}`);
    assert.ok(maxLoc < 0.1, `localiser ${maxLoc.toFixed(2)} dots above 20 m`);
    assert.ok(s.total >= FLOOR[key], `score ${s.total}`);
    assert.ok(Math.abs(td.s - REF[key].s) <= 25 && Math.abs(td.vsFpm - REF[key].fpm) <= 30, `touchdown ${td.s.toFixed(1)} m (ref ${REF[key].s} ± 25), ${td.vsFpm.toFixed(1)} fpm (ref ${REF[key].fpm} ± 30)`);
  });
}
