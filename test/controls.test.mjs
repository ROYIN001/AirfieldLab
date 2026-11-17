// Step 3 — control effectiveness with dynamic pressure and slipstream; reversible controls (stick force falls
// with speed); elevator trim sets the speed; ailerons lose bite in the stall.
import { M, trimmed, run, DT } from './lib/sim.mjs';
import { check, within, f1, done } from './lib/check.mjs';
const { Aircraft, Flight, SCENARIOS, AC, KT, DEG, RAD, stickGain } = M;

// angular acceleration from a surface step, at a given airspeed (m/s) and power, level attitude
function accel(V, pcl, set, idx, alphaDeg = 2) {
  const ac = new Aircraft(); ac.eng.set(pcl); ac.flaps = 0; ac.gearPos = 0;
  const q = M.eulerToQ(0, alphaDeg * DEG, 0);
  ac.x.set([0, 0, -600, V, 0, 0, q[0], q[1], q[2], q[3], 0, 0, 0]);
  const d0 = new Float64Array(13), d1 = new Float64Array(13);
  ac.deriv(ac.x, d0); set(ac); ac.deriv(ac.x, d1);
  return d1[idx] - d0[idx];
}
const elev = (V, p) => accel(V, p, (ac) => (ac.de = -10 * DEG), 11);
const rud = (V, p) => accel(V, p, (ac) => (ac.dr = -10 * DEG), 12);
const ail = (V, p, a) => accel(V, p, (ac) => (ac.da = 10 * DEG), 10, a);
{
  const r = elev(70 * KT, 1) / elev(70 * KT, 0);
  check('elevator at 70 kt: full power (slipstream) beats idle', within(r, 1.2, 2.2), `×${f1(r, 2)}`);
  const qr = elev(140 * KT, 0) / elev(70 * KT, 0);
  check('elevator power grows with dynamic pressure (140 vs 70 kt, idle)', within(qr, 3.2, 4.6), `×${f1(qr, 2)}`);
  const g0 = rud(0.1, 0), g1 = rud(0.1, 1);
  check('rudder at standstill: propwash gives authority at full power', g1 > 4 * Math.max(g0, 1e-6) && g1 > 0, `ṙ ${f1(g0 * RAD, 2)} → ${f1(g1 * RAD, 2)} °/s² for 10° right rudder`);
  const s = ail(45, 0.2, 22) / ail(45, 0.2, 2);
  check('ailerons lose effectiveness in the stall', within(s, 0.1, 0.65), `×${f1(s, 2)} at α 22° vs 2°`);
}
// reversible controls: deflection for a full pull falls with dynamic pressure
{
  const q95 = 0.5 * 1.225 * (95 * KT) ** 2, q200 = 0.5 * 1.225 * (200 * KT) ** 2;
  const e95 = stickGain(AC.stickE, q95 * 1.1) * RAD, e200 = stickGain(AC.stickE, q200 * 1.05) * RAD;
  check('full pull ≈ full up-elevator at approach speed', within(e95, 18, 26), `${f1(e95, 1)}°`);
  check('full pull at 200 kt buys much less elevator', within(e200, 6, 12), `${f1(e200, 1)}°`);
}
// stick force per g at 160 kt (DIRECT law, auto-trim off): a steady pull of 30 % force
{
  const f = new Flight({ wind: SCENARIOS.calm, pilot: 'man', assist: false, autoTrim: false, dist: 9000, oatC: 15 });
  const { ac } = f;
  // re-trim clean at 160 kt level
  ac.flaps = ac.cmd.flaps = 0; ac.gearPos = 0; ac.cmd.gear = 0; f.input.flaps = 0; f.input.gear = 0;
  const tr = ac.trimFlight({ tas: 160 * KT * Math.sqrt(1.225 / ac.air.rho), gamma: 0, h: 600, psiAir: M.FIELD.rwyHdg * DEG });
  f.laws.trimDe = tr.de; f.input.thr = tr.thr;
  let nMax = 0;
  for (let i = 0; i < 240 * 2.5; i++) { f.input.y = 0.3; f.tick(DT); nMax = Math.max(nMax, ac.air.nz); }
  const perG = 0.3 / (nMax - 1);
  check('stick force per g at 160 kt: full force ≈ 3–7 g', within(1 / perG + 1, 3, 7), `30 % pull → ${f1(nMax, 2)} g, full force ≈ ${f1(1 / perG + 1, 1)} g`);
}
// trim sets the speed: nose-down trim with the stick released → the aircraft settles faster
{
  const f = new Flight({ wind: SCENARIOS.calm, pilot: 'man', assist: false, autoTrim: false, dist: 12000, oatC: 15 });
  const ias0 = f.ac.air.ias / KT;
  for (let i = 0; i < 240 * 10; i++) f.tick(DT);
  const iasHold = f.ac.air.ias / KT;
  check('hands off on the trimmed approach: speed holds', Math.abs(iasHold - ias0) < 1.5, `${f1(ias0)} → ${f1(iasHold)} kt after 10 s`);
  f.input.trim = -1; for (let i = 0; i < 240 * 0.6; i++) f.tick(DT); f.input.trim = 0;
  const trimMoved = (f.laws.trimDe - f.trim.de) * RAD;
  let lo = 1e9, hi = 0; const hist = [];
  for (let i = 0; i < 240 * 70; i++) { f.tick(DT); if (i % 240 === 0) hist.push(f.ac.air.ias / KT); }
  for (const v of hist.slice(-12)) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
  const iasNew = hist[hist.length - 1];
  check('nose-down trim (stick free) → higher trimmed speed', iasNew > iasHold + 4, `trim +${f1(trimMoved, 2)}° → ${f1(iasNew)} kt (last 12 s ${f1(lo)}–${f1(hi)})`);
}
done();
