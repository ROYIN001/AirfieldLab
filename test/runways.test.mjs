// Autoland on all four runway ends (ILS on 21R, 21L, 03L; RNP with a synthetic 3° path on 03R), calm and 15 kt
// gusty crosswind, seed 5. Floors sit just under the values measured on 2026-11-19 (calm 100/100/100/93,
// crosswind 88/88/90/78).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { M } from './harness.mjs';
const { Flight, SCENARIOS, FIELD, RWY_END, setActiveRunway } = M;
const FLOOR = { calm: 90, xl: 75 };

for (const id of ['21R', '21L', '03L', '03R']) {
  for (const key of ['calm', 'xl']) {
    test(`${id} ${key}: lands on the runway, no event, localiser held, score ≥ ${FLOOR[key]}`, () => {
      setActiveRunway(id);
      try {
        assert.equal(FIELD.rwy, id);
        const f = new Flight({ wind: SCENARIOS[key], pilot: 'ap', seed: 5 });
        let maxLoc = 0, p = null;
        while (f.ac.t < 260 && !f.ev.done && !f.crashed) {
          f.tick(f.dt); const a = f.ac.air;
          if (a.h > 20) maxLoc = Math.max(maxLoc, Math.abs(a.locDots));
          if (!p && f.ev.td) p = [f.ac.x[0], f.ac.x[1]];   // NED position at the first touchdown
        }
        const td = f.ev.td, s = f.ev.score();
        // the touchdown in the AIP frame of this runway end (the frame the painted runway and the lights use)
        const E = RWY_END[id], d = p ? [p[0] - E.thr[0], p[1] - E.thr[1]] : [NaN, NaN];
        const along = d[0] * E.u[0] + d[1] * E.u[1], side = d[0] * E.r[0] + d[1] * E.r[1];
        assert.ok(along >= 150 && along <= 600 && Math.abs(side) < 10, `${id}: touchdown ${along.toFixed(0)} m past THR ${id}, ${side.toFixed(1)} m off its centre line (AIP geometry)`);
        assert.ok(!f.crashed && td && td.onRunway, `${FIELD.ident}: crashed ${f.crashed}, touchdown ${td ? td.s.toFixed(0) + ' m' : 'none'}`);
        assert.deepEqual(f.ev.events.map((e) => e.k), []);
        assert.ok(maxLoc < 0.1, `localiser ${maxLoc.toFixed(2)} dots above 20 m`);
        assert.ok(s.total >= FLOOR[key], `score ${s.total}`);
      } finally { setActiveRunway('21R'); }
    });
  }
}
