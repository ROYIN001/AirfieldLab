// dt sweep part 2: find the instability edge. Parked (brakes on) and an ASYMMETRIC drop (bank 2°, drift 1 m/s, 3 m/s sink).
import { M } from './s9_harness.mjs';
const { Aircraft, AC, DEG, RAD, KT, FT, G0 } = M;
const lab = (dt) => `1/${Math.round(1 / dt)}`;
function parked(dt, T = 20) {
  const ac = new Aircraft(); ac.setParked(0, 0, 30 * DEG);
  // small asymmetric kick so lateral/roll modes are excited
  ac.x[10] = 0.05; ac.x[12] = 0.02; ac.x[4] += 0.05;
  let maxP = 0, blow = false;
  const N = Math.round(T / dt);
  for (let i = 0; i < N; i++) { ac.step(dt); const a = ac.air;
    if (!Number.isFinite(a.h) || Math.abs(a.p) > 50) { blow = true; break; }
    if (ac.t > T - 5) maxP = Math.max(maxP, Math.abs(a.p), Math.abs(a.q), Math.abs(a.r)); }
  return { dt: lab(dt), blowUp: blow, 'max|rate| last 5 s (deg/s)': blow ? null : +(maxP * RAD).toExponential(2), h: blow ? null : +ac.air.h.toFixed(4) };
}
console.log('parked + small kick, 20 s'); console.table([1/240, 1/60, 1/30, 1/25, 1/22, 1/20, 1/18, 1/15].map((dt) => parked(dt)));
function adrop(dt, sink = 3, T = 4) {
  const ac = new Aircraft(); const tr = ac.setApproach({ dist: 5500 });
  const q = M.eulerToQ(2 * DEG, 5 * DEG, 0);
  ac.x.set([0, 0, -1.6, 45, 1.0, sink, q[0], q[1], q[2], q[3], 0, 0, 0]);
  ac.updateAir(0); ac.x[2] -= (0.3 - ac.air.hWheel); ac.updateAir(0);
  ac.thr = ac.cmd.thr = AC.idle; ac.de = ac.cmd.de = tr.de;
  let peakN = 0, blow = false, maxPhi = 0, prevVd = ac.x[5], peakNz = 0;
  const N = Math.round(T / dt);
  for (let i = 0; i < N; i++) { ac.step(dt); const a = ac.air;
    if (!Number.isFinite(a.h) || Math.abs(a.p) > 50) { blow = true; break; }
    peakN = Math.max(peakN, ...a.load); maxPhi = Math.max(maxPhi, Math.abs(a.phi));
    const nz = -(ac.x[5] - prevVd) / dt / G0 + 1; prevVd = ac.x[5]; peakNz = Math.max(peakNz, nz); }
  const a = ac.air;
  return { dt: lab(dt), blowUp: blow, peakN: Math.round(peakN), peakNz: +peakNz.toFixed(2), 'max|phi| deg': +(maxPhi * RAD).toFixed(3), 'phi@4s': blow ? null : +(a.phi * RAD).toFixed(4), 'e@4s (m)': blow ? null : +ac.x[1].toFixed(4), 'psi@4s': blow ? null : +(a.psi * RAD).toFixed(4) };
}
for (const sink of [3, 5]) { console.log(`asymmetric drop, sink ${sink} m/s, bank 2°, drift 1 m/s`); console.table([1/4000, 1/1000, 1/480, 1/240, 1/120, 1/60, 1/45, 1/30, 1/20].map((dt) => adrop(dt, sink))); }
