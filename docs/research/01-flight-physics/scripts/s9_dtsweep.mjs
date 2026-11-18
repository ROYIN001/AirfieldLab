// dt sweep: (1) parked settling 6 s, (2) open-loop touchdown drop at 2 and 5 m/s sink, (3) full autoland with Flight.dt changed.
import { M } from './s9_harness.mjs';
const { Aircraft, Flight, SCENARIOS, AC, DEG, RAD, KT, FT, G0 } = M;
const DTS = [1/30, 1/60, 1/120, 1/240, 1/480, 1/1000, 1/2000, 1/4000];
const lab = (dt) => `1/${Math.round(1/dt)}`;
// (1) parked settling
console.log('\n(1) parked settling, brakes on, 6 s and 60 s');
const parked = [];
for (const dt of DTS) {
  const ac = new Aircraft(); ac.setParked(0, 0, 30 * DEG);
  let nan = false, maxRate = 0, minH = 9, maxH = 0;
  const N6 = Math.round(6 / dt), N60 = Math.round(60 / dt);
  let r6 = null;
  for (let i = 0; i < N60; i++) { ac.step(dt); const a = ac.air; if (!Number.isFinite(a.h)) { nan = true; break; }
    maxRate = Math.max(maxRate, Math.abs(a.q), Math.abs(a.p)); minH = Math.min(minH, a.h); maxH = Math.max(maxH, a.h);
    if (i === N6 - 1) r6 = { h: a.h, th: a.theta * RAD, sumLoad: a.load.reduce((s, v) => s + v, 0) / (AC.m * G0), gs: a.gs }; }
  const a = ac.air, dist = Math.hypot(ac.x[0], ac.x[1]);
  parked.push({ dt: lab(dt), nan, h6: r6 && +r6.h.toFixed(5), pitch6: r6 && +r6.th.toFixed(4), loadSum6_g: r6 && +r6.sumLoad.toFixed(4), gs6: r6 && +r6.gs.toExponential(3), creep60_m: nan ? null : +dist.toFixed(3), maxRate_dps: +(maxRate * RAD).toFixed(3) });
}
console.table(parked);
// (2) open-loop touchdown drop
function drop(dt, sink, T = 4) {
  const ac = new Aircraft(); const tr = ac.setApproach({ dist: 5500 });
  const th = 5 * DEG, psi = 0, V = 45;
  const q = M.eulerToQ(0, th, psi);
  ac.x.set([0, 0, -1.6, V, 0, sink, q[0], q[1], q[2], q[3], 0, 0, 0]);
  ac.updateAir(0); ac.x[2] -= (0.3 - ac.air.hWheel); ac.updateAir(0); // wheels 0.30 m above ground
  ac.thr = ac.cmd.thr = AC.idle; ac.de = ac.cmd.de = tr.de; ac.brake = ac.cmd.brake = 0;
  let peakN = 0, peakNz = 0, td = null, airborneAfter = 0, maxBounce = 0, nan = false, maxPen = 0;
  const N = Math.round(T / dt); let prevVd = ac.x[5];
  for (let i = 0; i < N; i++) {
    ac.step(dt); const a = ac.air;
    if (!Number.isFinite(ac.x[2]) || Math.abs(ac.x[2]) > 1e4) { nan = true; break; }
    const nz = -(ac.x[5] - prevVd) / dt / G0 + 1; prevVd = ac.x[5];
    const Nm = Math.max(a.load[1], a.load[2]); peakN = Math.max(peakN, Nm);
    if (td === null && (a.wow[1] || a.wow[2])) td = ac.t;
    if (td !== null) { peakNz = Math.max(peakNz, nz); if (!a.onGround) { airborneAfter += dt; maxBounce = Math.max(maxBounce, a.hWheel); } }
    maxPen = Math.max(maxPen, -a.hWheel);
  }
  return { dt: lab(dt), sink, nan, td: td && +td.toFixed(4), peakMainN: Math.round(peakN), peakNz_g: +peakNz.toFixed(3), bounce_m: +maxBounce.toFixed(4), airborneAfterTD_s: +airborneAfter.toFixed(3), maxPen_m: +maxPen.toFixed(4), n4s: nan ? null : +ac.x[0].toFixed(3), theta4s: nan ? null : +(ac.air.theta * RAD).toFixed(3), h4s: nan ? null : +ac.air.h.toFixed(4) };
}
for (const sink of [1.0, 2.0, 5.0]) { console.log(`\n(2) open-loop drop, sink ${sink} m/s (${(sink / FT * 60).toFixed(0)} fpm), 45 m/s, pitch 5°, idle`); console.table(DTS.map((dt) => drop(dt, sink))); }
// (3) full autoland with the physics step changed
console.log('\n(3) autoland, Flight.dt changed');
const rows = [];
for (const key of ['calm', 'xl']) for (const dt of [1/60, 1/120, 1/240, 1/480, 1/1000]) {
  const f = new Flight({ wind: SCENARIOS[key], pilot: 'ap', seed: 5 }); f.dt = dt;
  let steps = 0; while (f.ac.t < 260 && !f.ev.done && !f.crashed) { f.tick(f.dt); steps++; }
  const td = f.ev.td, s = f.ev.score();
  rows.push({ sc: key, dt: lab(dt), crashed: f.crashed, td_s: td && +td.s.toFixed(1), td_vs_fpm: td && +td.vsFpm.toFixed(0), td_ias: td && +td.ias.toFixed(2), td_tl: td && +td.tl.toFixed(2), score: s && s.total, stopS: f.ev.stopS && +f.ev.stopS.toFixed(0) });
}
console.table(rows);
