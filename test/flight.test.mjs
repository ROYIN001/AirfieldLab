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

// acceptance: score floors at or just under the measured scores (A9 log-law wind: calm 100, head 100, xr 97, xl 85;
// A8 default weather before A9: 100, 100, 96, 85; dry ISA before A8: 100, 96, 97, 88). xl sits on its floor; the floor
// is kept (not lowered for A8 or A9).
// regression band: touchdown point and sink rate (seed 5, 21R); an intended change to the autopilot or the model
// updates REF in the same PR. A8 (humid air + QNH 1009.3, research round 4 §6.1, 2026-11-23): ρ −1.4 %, TAS +0.7 % at
// the same IAS. The Dryden filter steps with TAS, so seed 5's gust sequence differs. Over seeds 7–1006 the
// distribution is unchanged (xl 35–97 → 35–98, median 85 → 85, mean 83.8 → 84.1). Old REF (2026-11-19, dry ISA):
// calm 309.5/−129.4, head 307.3/−148.4, xr 311.1/−122.2, xl 343.2/−46.2; measured just before A8 (dry ISA, after A7):
// 312.4/−129.7, 309.2/−150.4, 314.5/−125.4, 348.6/−53.3; xl after A8 is 305.2/−118.4, outside the old ±25 m/±30 fpm.
// A9 (log-law mean wind, z0 0.05 m, research round 4 §6.3 and §13 item 3, 2026-11-25; turbulence W20 unchanged): the
// wind near the ground is weaker (U(10 ft)/U10 0.844 → 0.776) and stronger above 10 m (U(50 ft) 1.062 → 1.080), so the
// last 50 ft lose more headwind and crosswind. REF (A8) head 308.4/−143.8, xr 304.9/−100.7, xl 305.2/−118.4 → head
// 302.2/−150.4, xr 305.1/−101.8, xl 304.1/−111.5 (all inside the old band); calm has no wind and is unchanged.
const FLOOR = { calm: 95, head: 90, xr: 90, xl: 85 };
const REF = { calm: { s: 312.5, fpm: -133.9 }, head: { s: 302.2, fpm: -150.4 }, xr: { s: 305.1, fpm: -101.8 }, xl: { s: 304.1, fpm: -111.5 } };
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
