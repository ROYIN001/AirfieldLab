// Section 5: same as f5_n1check.mjs but N1 taken from the LAGGED thrust: n1 = sqrt((F-Fidle)/(1-Fidle)) (display N1 recommended in 5.5)
import { M } from 'test/harness.mjs';
const { atmosphere, FT } = M; const P0 = 101325, clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const dT = (h, Ma) => atmosphere(h * FT).p / P0 * (1 + 0.2 * Ma * Ma) ** 3.5;
const P = { CFM56_7B: { N2gi: 59, N2max: 100, k: 2, idle: 0.05, tau: 0.35, Racc: 18, a: 6, Rdec: 16, e: 1, tauF: 0.25 },
            LEAP_1A: { N2gi: 57, N2max: 100, k: 2, idle: 0.045, tau: 0.35, Racc: 18, a: 6, Rdec: 15, e: 1, tauF: 0.30 } };
function run(p, c0, c1, h, Ma) { const span = p.N2max - p.N2gi, dt = 1 / 240, f = Math.min(1, dT(h, Ma)) ** p.e;
  let n2 = p.N2gi + span * c0 ** (1 / p.k); const n2end = p.N2gi + span * c1 ** (1 / p.k);
  const N = (x) => clamp((x - p.N2gi) / span, 0, 1); const Fss = (x) => p.idle + (1 - p.idle) * N(x) ** p.k;
  let F = Fss(n2); const n1of = (F) => Math.sqrt(Math.max(0, (F - p.idle) / (1 - p.idle)));
  const a0 = n1of(F), a1 = n1of(Fss(n2end)); let t = 0, hit = {}, lastOut = 0;
  while (t < 30) { const n = N(n2), nn = Math.min(1, n + 0.1);
    n2 += clamp((n2end - n2) * f / p.tau, -p.Rdec * f, p.Racc * f / (1 + p.a * (1 - nn) ** 3)) * dt; t += dt;
    F += (Fss(n2) - F) * (1 - Math.exp(-dt / p.tauF)); const fr = (n1of(F) - a0) / (a1 - a0);
    for (const [k, v] of [['t10', .1], ['t50', .5], ['t90', .9]]) if (hit[k] == null && fr >= v) hit[k] = t;
    if (Math.abs(fr - 1) > 0.02) lastOut = t; }
  return { delay: +hit.t50.toFixed(2), rise: +(hit.t90 - hit.t10).toFixed(2), settle: +lastOut.toFixed(2) }; }
const out = {};
for (const [k, p] of Object.entries(P)) out[k] = { SL_up: run(p, .4, 1, 0, 0), SL_down: run(p, 1, .4, 0, 0), h10k_up: run(p, .4, 1, 10000, .25), h25k_up: run(p, .4, 1, 25000, .62), h42k_up: run(p, .4, 1, 42000, .84) };
console.log(JSON.stringify(out));
