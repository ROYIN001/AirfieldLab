// Eigenvalues at the instant of peak gear load in an asymmetric 5 m/s drop (worst case for contact stiffness).
import { M } from './s9_harness.mjs';
import { jac12, eig } from './s9_eigen.mjs';
const { Aircraft, AC, DEG, RAD } = M;
for (const sink of [3, 5]) {
  const ac = new Aircraft(); const tr = ac.setApproach({ dist: 5500 });
  const q = M.eulerToQ(2 * DEG, 5 * DEG, 0);
  ac.x.set([0, 0, -1.6, 45, 1.0, sink, q[0], q[1], q[2], q[3], 0, 0, 0]);
  ac.updateAir(0); ac.x[2] -= (0.3 - ac.air.hWheel); ac.updateAir(0);
  ac.thr = ac.cmd.thr = AC.idle; ac.de = ac.cmd.de = tr.de;
  let best = { N: 0 };
  for (let i = 0; i < 240; i++) { ac.step(1 / 2000); const N = Math.max(...ac.air.load); if (N > best.N) best = { N, x: Float64Array.from(ac.x), t: ac.t }; }
  const ac2 = new Aircraft(); ac2.setApproach({ dist: 5500 }); ac2.thr = AC.idle; ac2.de = tr.de; ac2.x.set(best.x); ac2.updateAir(0);
  const ev = eig(jac12(ac2, ac2.x));
  const mx = ev.reduce((m, l) => Math.max(m, Math.hypot(l.re, l.im)), 0);
  const top = ev.sort((a, b) => Math.hypot(b.re, b.im) - Math.hypot(a.re, a.im)).slice(0, 4).map((l) => `${l.re.toFixed(1)}${l.im ? (l.im > 0 ? '+' : '') + l.im.toFixed(1) + 'i' : ''}`);
  console.log(`sink ${sink} m/s: peak main load ${best.N.toFixed(0)} N at t=${best.t.toFixed(4)} s; max|λ| = ${mx.toFixed(1)} 1/s; |λ|dt @240 Hz = ${(mx / 240).toFixed(3)}, @120 = ${(mx / 120).toFixed(3)}, @60 = ${(mx / 60).toFixed(3)}; dt_crit(RK4 real axis) = ${(2.7853 / mx * 1000).toFixed(1)} ms; top: ${top.join(', ')}`);
}
