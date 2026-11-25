// Autoland on all four runway ends (ILS on 21R, 21L, 03L; RNP with a synthetic 3° path on 03R), calm and 15 kt
// gusty crosswind, seed 5. Floors sit just under the values measured (calm 100/100/100/93, crosswind 85/80/85/80 in
// the A8 default weather, 2026-11-23; 88/88/90/78 in dry ISA on 2026-11-19). A8 (humid air + QNH 1009.3, research
// round 4 §6.1): ρ −1.4 %, TAS +0.7 % at the same IAS; the Dryden filter steps with TAS, so seed 5's gust sequence
// differs (xl touchdowns 348.6/308.7/360.9/280.0 → 305.2/298.5/310.6/286.3 m). Floors unchanged.
// A9 (log-law mean wind, z0 0.05 m, research round 4 §6.3 and §13 item 3, 2026-11-25): calm unchanged; crosswind
// 85/80/85/80 → 85/78/85/80 (21L: attitude part 5.5 → 3.5, sink −138.2 → −118.9 fpm), touchdowns 304.1/298.9/305.6/
// 284.2 m, 5.6–5.7 m right of the centre line (downwind; was 5.9–6.0) as the wind below 10 m is weaker. Floors unchanged.
// Not tested here, for E5: the 10 kt headwind (seed 5) lands about 6 m shorter on every end, 308.4/302.7/314.0/286.4 →
// 302.2/296.9/309.2/280.6 m; 21L drops under the 300 m edge of the perfect window (position 25 → 18, score 96 → 89),
// 21R is now only 2.2 m inside it; 03L 96 and 03R 89 keep their scores.
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
