// Step 4 — configuration changes: flap and gear travel time, squat switch, flap blow-back above the limit
// speed, pitching moments (balloon) and trim change, limit-speed events, gear-up landing.
import { M, trimmed, run, onRunway, DT } from './lib/sim.mjs';
import { check, within, f1, done } from './lib/check.mjs';
const { Flight, SCENARIOS, AC, KT, DEG, RAD, FT, vfeFor } = M;

// travel times
{
  const { ac } = trimmed({ ias: 110, flaps: 0, gear: 1 });
  ac.cmd.flaps = 1; let t = 0; while (ac.flaps < 0.999 && t < 30) { ac.step(DT); t += DT; }
  check('flaps UP → LDG travel', within(t, 7.5, 11), `${f1(t, 1)} s`);
  const b = trimmed({ ias: 110, flaps: 0, gear: 1 }).ac;
  b.cmd.flaps = AC.flapNotch[1]; t = 0; while (b.flaps < AC.flapNotch[1] - 1e-3 && t < 30) { b.step(DT); t += DT; }
  check('flaps UP → TO travel', within(t, 3, 5.5), `${f1(t, 1)} s`);
  ac.cmd.gear = 0; t = 0; while (ac.gearPos > 1e-3 && t < 30) { ac.step(DT); t += DT; }
  check('gear retraction', within(t, 5, 8), `${f1(t, 1)} s`);
}
// squat switch: no retraction with weight on wheels
{
  const ac = onRunway(300); ac.cmd.gear = 0; run(ac, 3);
  check('gear stays down on the ground (squat switch)', ac.gearPos > 0.99, `gear ${f1(ac.gearPos, 2)}`);
}
// blow-back: landing flaps selected far above VFE
{
  // hold 150 kt with the elevator while the landing flaps are selected
  const { ac, tr } = trimmed({ ias: 150, flaps: 0, gear: 1, pcl: 0.7 }); ac.cmd.flaps = 1;
  run(ac, 12, (a) => { a.cmd.de = tr.de + 0.4 * DEG * (150 - a.air.ias / KT) + 0.6 * a.air.q; });
  const ias = ac.air.ias / KT;
  check('flap blow-back above VFE', ac.flaps < 0.9 && ac.flaps > 0.5, `flaps ${f1(ac.flaps, 2)} at ${f1(ias, 0)} kt (VFE LDG ${AC.VFE[2]} kt)`);
  const c = trimmed({ ias: 115, flaps: 0, gear: 1 }).ac; c.cmd.flaps = 1; run(c, 12);
  check('full landing flaps below VFE', c.flaps > 0.99, `flaps ${f1(c.flaps, 2)} at ${f1(c.air.ias / KT, 0)} kt`);
}
// pitching moment and trim change with flaps
{
  const up = trimmed({ ias: 100, flaps: 0, gear: 1 }).tr, ldg = trimmed({ ias: 100, flaps: 1, gear: 1 }).tr;
  check('trim change UP → LDG at 100 kt: a few degrees of elevator', within(Math.abs(ldg.de - up.de) * RAD, 1.5, 8), `δe ${f1(up.de * RAD, 2)}° → ${f1(ldg.de * RAD, 2)}°, α ${f1(up.alpha * RAD, 1)}° → ${f1(ldg.alpha * RAD, 1)}°`);
  const { ac } = trimmed({ ias: 110, flaps: 0, gear: 1 });
  const vs0 = ac.air.vs; ac.cmd.flaps = AC.flapNotch[1]; run(ac, 3);
  check('flaps out with the stick held: the aircraft balloons', ac.air.vs > vs0 + 1, `climb rate ${f1(vs0, 2)} → ${f1(ac.air.vs, 2)} m/s after 3 s`);
}
// limit-speed events in the evaluator
{
  const f = new Flight({ wind: SCENARIOS.calm, pilot: 'man', assist: false, dist: 9000 });
  const tr = f.ac.trimFlight({ tas: 140 * KT * Math.sqrt(1.225 / f.ac.air.rho), gamma: 0, h: 500, psiAir: M.FIELD.rwyHdg * DEG });
  f.laws.trimDe = tr.de; f.input.thr = tr.thr;
  for (let i = 0; i < 240 * 2; i++) f.tick(DT);
  check('flap overspeed recorded above VFE', f.ev.has('flapOver'), `flaps ${f1(f.ac.flaps, 2)}, ${f1(f.ac.air.ias / KT, 0)} kt, VFE ${vfeFor(f.ac.flaps)}`);
  const g = new Flight({ wind: SCENARIOS.calm, pilot: 'man', assist: false, dist: 9000 });
  g.ac.flaps = g.ac.cmd.flaps = 0; g.input.flaps = 0;
  const t2 = g.ac.trimFlight({ tas: 165 * KT * Math.sqrt(1.225 / g.ac.air.rho), gamma: 0, h: 500, psiAir: M.FIELD.rwyHdg * DEG });
  g.laws.trimDe = t2.de; g.input.thr = t2.thr;
  for (let i = 0; i < 240 * 2; i++) g.tick(DT);
  check('gear overspeed recorded above VLE', g.ev.has('gearOver') && !g.ev.has('flapOver'), `${f1(g.ac.air.ias / KT, 0)} kt, VLE ${AC.VLE}`);
}
// gear-up landing: the belly takes the weight, the evaluator caps the score
{
  const f = new Flight({ wind: SCENARIOS.calm, pilot: 'man', assist: true, autoThr: true, seed: 3, dh: 0, dtl: 0, dist: 4000 });
  f.input.gear = 0;
  while (f.ac.t < 200 && !f.ev.done && !f.crashed) {
    const a = f.ac.air, g = f.ap.guidance();
    f.input.x = Math.max(-1, Math.min(1, g.phiCmd / (33 * DEG)));
    let gc = g.gammaCmd; if (a.hWheel < 6) gc = Math.asin(-(0.25 + Math.max(a.h - 0.6, 0) / 2.4) / a.V);
    f.input.y = Math.max(-1, Math.min(1, (gc - a.gamma) * 6 - a.q * 0.5));
    f.tick(DT);
  }
  const sc = f.ev.score();
  check('gear-up landing: belly contact recorded, score capped', f.ev.has('belly') && sc && sc.total <= 10 && !f.crashed, `events ${f.ev.events.map((e) => e.k).join(',')} score ${sc && sc.total} stop ${f1(f.ev.stopS - (f.ev.td ? f.ev.td.s : 0), 0)} m`);
}
done();
