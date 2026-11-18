// u2_adot_current.mjs — how well does the repo's filtered finite-difference alpha-dot track the true alpha-dot?
import { M } from 'test/harness.mjs';
const { Aircraft, AC, DEG, KT } = M;
const ac = new Aircraft();
ac.isaDev = 31 - (15 - 0.0065 * 3);
ac.setApproach({ dist: 5500 });
const dt = 1 / 240, de0 = ac.de;
const log = [];
for (let i = 0; i < 240 * 6; i++) {
  const t = i * dt;
  // elevator doublet 3 deg, 1 s each half, starting at 0.5 s
  ac.cmd.de = de0 + (t > 0.5 && t < 1.5 ? -3 * DEG : t >= 1.5 && t < 2.5 ? 3 * DEG : 0);
  ac.step(dt);
  log.push({ t: t + dt, a: ac.air.alpha, ad: ac.adot, q: ac.air.q, V: ac.air.V });
}
// reference alpha-dot: centred difference (non-causal)
let se = 0, sr = 0, n = 0, maxErr = 0;
for (let i = 1; i < log.length - 1; i++) { const ref = (log[i + 1].a - log[i - 1].a) / (2 * dt); log[i].ref = ref; se += (log[i].ad - ref) ** 2; sr += ref * ref; n++; maxErr = Math.max(maxErr, Math.abs(log[i].ad - ref)); }
// lag by cross-correlation
let best = 0, bestLag = 0;
for (let lag = 0; lag < 60; lag++) { let s = 0; for (let i = 1 + lag; i < log.length - 1; i++) s += log[i].ad * log[i - lag].ref; if (s > best) { best = s; bestLag = lag; } }
const peak = Math.max(...log.slice(1, -1).map((r) => Math.abs(r.ref)));
console.log(`V=${log[0].V.toFixed(1)} m/s; peak |alpha-dot| ${(peak / DEG).toFixed(2)} deg/s; RMS err/RMS ref = ${Math.sqrt(se / sr).toFixed(3)}; max err ${(maxErr / DEG).toFixed(2)} deg/s; best lag ${bestLag} steps = ${(bestLag * dt * 1000).toFixed(1)} ms`);
console.log('AC.CLadot', AC.CLadot, 'AC.Cmadot', AC.Cmadot, 'lt/V (lt 5.42 m) =', (5.42 / log[0].V).toFixed(3), 's');
