import { M } from './harness.mjs';
import { check, within, f1, done } from './lib/check.mjs';
const { Flight, SCENARIOS, KT, FT, DEG, RAD, FIELD, AC } = M;
// 1) trim check: accelerations right after setApproach
{
  const f = new Flight({ wind: SCENARIOS.calm });
  const d = new Float64Array(13); f.ac.deriv(f.ac.x, d);
  console.log('trim', JSON.stringify({ alpha: (f.trim.alpha*RAD).toFixed(2), de: (f.trim.de*RAD).toFixed(2), thr: f.trim.thr.toFixed(3), th: (f.trim.th*RAD).toFixed(2) }),
    'acc NED', [d[3], d[4], d[5]].map(v => v.toFixed(3)).join(','), 'angacc', [d[10], d[11], d[12]].map(v => v.toFixed(4)).join(','), 'ias', (f.ac.air.ias/KT).toFixed(1), 'h', f.ac.air.h.toFixed(1));
  check('approach trim: no residual acceleration', Math.hypot(d[3], d[4], d[5] - 0) < 1e-3 && Math.hypot(d[10], d[11], d[12]) < 1e-4);
}
// 2) parked equilibrium
{
  const f = new Flight({ wind: SCENARIOS.calm });
  const [n, e] = [0, 0]; f.ac.setParked(n, e, 30 * DEG);
  for (let i = 0; i < 240 * 6; i++) f.ac.step(1 / 240);
  const a = f.ac.air;
  console.log('parked: h', a.h.toFixed(3), 'pitch', (a.theta*RAD).toFixed(2), 'loads N', a.load.map(v => v.toFixed(0)).join('/'), 'gs', a.gs.toFixed(4), 'sum', (a.load.reduce((s,v)=>s+v,0)/ (AC.m*9.80665)).toFixed(3));
  check('parked: gear carries the weight, nose wheel 15–25 %', within(a.load.reduce((s, v) => s + v, 0) / (AC.m * 9.80665), 0.95, 1.02) && within(a.load[0] / a.load.reduce((s, v) => s + v, 0), 0.15, 0.25));
}
// 3) autoland in each scenario
for (const [key, sc] of Object.entries(SCENARIOS)) {
  const f = new Flight({ wind: sc, pilot: 'ap', seed: 5 });
  const log = []; let next = 0, maxPhi = 0, maxLoc = 0, maxGs = 0;
  while (f.ac.t < 260 && !f.ev.done && !f.crashed) {
    f.tick(f.dt);
    const a = f.ac.air;
    if (a.h > 20) { maxLoc = Math.max(maxLoc, Math.abs(a.locDots)); maxGs = Math.max(maxGs, Math.abs(a.gsDots)); }
    maxPhi = Math.max(maxPhi, Math.abs(a.phi));
    if (f.ac.t >= next) { next += 15; log.push(`t${f.ac.t.toFixed(0).padStart(4)} s${a.s.toFixed(0).padStart(6)} tl${a.t.toFixed(1).padStart(6)} h${a.h.toFixed(1).padStart(6)} ias${(a.ias/KT).toFixed(1)} vs${(a.vs/FT*60).toFixed(0).padStart(5)} th${(a.theta*RAD).toFixed(1)} ph${(a.phi*RAD).toFixed(1)} crab${(M.wrapPi(a.psi-FIELD.rwyHdg*DEG)*RAD).toFixed(1)} thr${f.ac.thr.toFixed(2)} gs${a.gsDots.toFixed(2)} loc${a.locDots.toFixed(2)} ${f.ap.mode}`); }
  }
  const td = f.ev.td, sc2 = f.ev.score();
  console.log(`\n=== ${key} (${sc.label}) crashed=${f.crashed} t=${f.ac.t.toFixed(1)} maxPhi ${(maxPhi*RAD).toFixed(1)} maxLocDots ${maxLoc.toFixed(2)} maxGsDots ${maxGs.toFixed(2)}`);
  console.log(log.join('\n'));
  if (td) console.log('TD', JSON.stringify(Object.fromEntries(Object.entries(td).map(([k, v]) => [k, typeof v === 'number' ? +v.toFixed(2) : v]))));
  console.log('stopS', f.ev.stopS?.toFixed(0), 'maxT', f.ev.maxT.toFixed(1), 'gates', JSON.stringify(Object.fromEntries(Object.entries(f.ev.gates).map(([k, g]) => [k, g.ok]))), 'events', JSON.stringify(f.ev.events), 'score', JSON.stringify(sc2 && { total: sc2.total, grade: sc2.grade, parts: sc2.parts.map(p => p.k + ':' + p.pts.toFixed(1)).join(' ') }));
  check(`autoland ${key}: stable gates, no events, score ≥ 85`, !f.crashed && f.ev.gates.g500?.ok && f.ev.gates.g200?.ok && !f.ev.events.length && sc2.total >= 85, `score ${sc2 && sc2.total}`);
}
done();
