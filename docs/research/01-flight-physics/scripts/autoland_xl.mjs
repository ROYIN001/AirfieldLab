// Baseline: autoland in the gusty-crosswind scenario with the current Wind model (3 seeds)
import { M } from 'test/harness.mjs';
const { Flight, SCENARIOS, KT, FT, DEG, RAD } = M;
for (const seed of [5, 6, 7]) {
  const f = new Flight({ wind: SCENARIOS.xl, pilot: 'ap', seed });
  let maxLoc = 0, maxPhi = 0;
  while (f.ac.t < 260 && !f.ev.done && !f.crashed) { f.tick(f.dt); const a = f.ac.air; if (a.h > 60) maxLoc = Math.max(maxLoc, Math.abs(a.locDots)); maxPhi = Math.max(maxPhi, Math.abs(a.phi)); }
  const s = f.ev.score();
  console.log(`seed ${seed}: crashed=${f.crashed} score=${s && s.total} maxLocDots(>60 m)=${maxLoc.toFixed(2)} maxPhi=${(maxPhi * RAD).toFixed(1)} deg sink=${f.ev.td ? (f.ev.td.vs / FT * 60).toFixed(0) : '-'} fpm`);
}
