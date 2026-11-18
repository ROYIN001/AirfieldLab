// Section 5: time from reverse idle to max reverse (u = 0.70) with the proposed spool model, SL, M 0.2, GI floor (compare Mahmood 2018: ~3 s to 80% power)
import { M } from 'test/harness.mjs';
const { atmosphere } = M; const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const p = { N2gi: 59, N2max: 100, k: 2, tau: 0.35, Racc: 18, a: 6, tauF: 0.25, revIdle: 0.10, c0: 0.30, c1: 1.0 };
const span = p.N2max - p.N2gi, dt = 1 / 240, Mach = 0.2, f = Math.min(1, atmosphere(0).p / 101325 * (1 + 0.2 * Mach * Mach) ** 3.5);
let n2 = p.N2gi, F = 0; const n2cmd = p.N2gi + span * 0.70 ** (1 / p.k);
const Frev = (n2) => (p.c0 + p.c1 * Mach) * (p.revIdle + (1 - p.revIdle) * clamp((n2 - p.N2gi) / span, 0, 1) ** p.k);
F = Frev(n2); const F0 = F, Fend = Frev(n2cmd); let t = 0, hit = {};
while (t < 15) { const n = clamp((n2 - p.N2gi) / span, 0, 1), nn = Math.min(1, n + 0.1);
  n2 += clamp((n2cmd - n2) * f / p.tau, -16 * f, p.Racc * f / (1 + p.a * (1 - nn) ** 3)) * dt; t += dt;
  F += (Frev(n2) - F) * (1 - Math.exp(-dt / p.tauF)); const fr = (F - F0) / (Fend - F0);
  for (const [k, v] of [['t50', .5], ['t90', .9], ['t95', .95]]) if (hit[k] == null && fr >= v) hit[k] = +t.toFixed(2); }
console.log(JSON.stringify({ F0_overF00: +F0.toFixed(3), Fend_overF00: +Fend.toFixed(3), ...hit }));
