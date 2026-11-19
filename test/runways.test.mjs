// Autoland on all four runway ends (ILS on 21R, 21L, 03L; RNP with a synthetic 3° path on 03R), calm and 15 kt
// gusty crosswind, seed 5. Floors sit just under the values measured on 2026-11-19 (calm 100/100/100/93,
// crosswind 88/88/90/78).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { M } from './harness.mjs';
const { Flight, SCENARIOS, FIELD, setActiveRunway } = M;
const FLOOR = { calm: 90, xl: 75 };

for (const id of ['21R', '21L', '03L', '03R']) {
  for (const key of ['calm', 'xl']) {
    test(`${id} ${key}: lands on the runway, no event, localiser held, score ≥ ${FLOOR[key]}`, () => {
      setActiveRunway(id);
      try {
        const f = new Flight({ wind: SCENARIOS[key], pilot: 'ap', seed: 5 });
        let maxLoc = 0;
        while (f.ac.t < 260 && !f.ev.done && !f.crashed) { f.tick(f.dt); const a = f.ac.air; if (a.h > 20) maxLoc = Math.max(maxLoc, Math.abs(a.locDots)); }
        const td = f.ev.td, s = f.ev.score();
        assert.ok(!f.crashed && td && td.onRunway, `${FIELD.ident}: crashed ${f.crashed}, touchdown ${td ? td.s.toFixed(0) + ' m' : 'none'}`);
        assert.deepEqual(f.ev.events.map((e) => e.k), []);
        assert.ok(maxLoc < 0.1, `localiser ${maxLoc.toFixed(2)} dots above 20 m`);
        assert.ok(s.total >= FLOOR[key], `score ${s.total}`);
      } finally { setActiveRunway('21R'); }
    });
  }
}
