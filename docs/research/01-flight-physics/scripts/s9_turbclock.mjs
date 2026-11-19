// Does the xl autoland spread across physics dt come from integration error or from a different gust realisation?
// Variant: Dryden filters advanced on their own fixed 1/120 s clock (exact first-order discretisation, as now),
// linearly interpolated at physics time → the same gust history for every physics dt.
import { M } from './s9_harness.mjs';
const { Flight, SCENARIOS, Wind, FT } = M;
class FixedClockWind extends Wind {
  constructor(o) { super(o); this.hg = 1 / 120; this.acc = 0; this.g0 = [0, 0, 0]; this.g1 = [0, 0, 0]; }
  update(dt, h, V, hdg) {
    this.hdg = hdg;
    if (this.turb <= 0 || this.kt <= 0) { this.g[0] = this.g[1] = this.g[2] = 0; return; }
    this.acc += dt;
    while (this.acc >= this.hg - 1e-12) { // advance the filter one gust tick using the parent's exact update
      this.g0 = this.g1.slice(); const save = this.g; this.g = this.g1.slice(); super.update(this.hg, h, V, hdg); this.g1 = this.g.slice(); this.g = save; this.acc -= this.hg; }
    const u = this.acc / this.hg; for (let i = 0; i < 3; i++) this.g[i] = this.g0[i] + (this.g1[i] - this.g0[i]) * u;
  }
}
const rows = [];
for (const variant of ['current', 'fixed gust clock'])
  for (const dt of [1 / 60, 1 / 120, 1 / 240, 1 / 480, 1 / 1000]) {
    const f = new Flight({ wind: SCENARIOS.xl, pilot: 'ap', seed: 5 }); f.dt = dt;
    if (variant !== 'current') { const w = f.ac.wind; const W = new FixedClockWind({ fromDeg: w.fromDeg, kt: w.kt, turb: w.turb, seed: 5 }); f.ac.wind = W; }
    while (f.ac.t < 260 && !f.ev.done && !f.crashed) f.tick(f.dt);
    const td = f.ev.td; rows.push({ variant, dt: `1/${Math.round(1 / dt)}`, td_s: +td.s.toFixed(1), vs_fpm: +td.vsFpm.toFixed(0), ias: +td.ias.toFixed(1), tl: +td.tl.toFixed(2), score: f.ev.score().total });
  }
console.table(rows);
