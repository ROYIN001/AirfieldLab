// Autoland across random seeds (the app seeds every flight differently): all four runways, every wind scenario.
// Keeps the ranges quoted in CLAUDE.md honest. About a minute of CPU.
import { M } from './harness.mjs';
import { check, f1, done } from './lib/check.mjs';
const { Flight, SCENARIOS, setActiveRunway } = M;
const SEEDS = [1, 2, 3, 4, 6, 7, 8, 9, 10, 11];
// floors a few points under the measured values (calm 93 / 98.3, head 88 / 97.0, xr 90 / 97.7, xl 74 / 92.5)
const want = { calm: { min: 90, mean: 96 }, head: { min: 85, mean: 95 }, xr: { min: 86, mean: 95 }, xl: { min: 68, mean: 90 } };
for (const key of Object.keys(want)) {
  const sc = []; let bad = [];
  for (const id of ['21R', '21L', '03L', '03R']) for (const seed of SEEDS) {
    setActiveRunway(id);
    const f = new Flight({ wind: SCENARIOS[key], pilot: 'ap', seed });
    while (f.ac.t < 300 && !f.ev.done && !f.crashed) f.tick(f.dt);
    const s = f.ev.score();
    sc.push(s ? s.total : 0);
    const ev = f.ev.events.map((e) => e.k).filter((k) => k !== 'skid');
    if (f.crashed || !s || ev.length) bad.push(`${id}/${seed}: ${f.crashed ? 'crash ' : ''}${ev.join(',')}`);
  }
  const mean = sc.reduce((a, b) => a + b, 0) / sc.length, min = Math.min(...sc);
  check(`${key}: ${sc.length} autolands, no crash or damage event, min ≥ ${want[key].min}, mean ≥ ${want[key].mean}`, !bad.length && min >= want[key].min && mean >= want[key].mean, `min ${min}, mean ${f1(mean)}, max ${Math.max(...sc)}${bad.length ? ' — ' + bad.join(' | ') : ''}`);
}
setActiveRunway('21R');
done();
