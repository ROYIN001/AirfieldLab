// Section 8: expected sigma_q, sigma_r from 8785C spectra (numerical integration), current-model dt invariance,
// and correlation of the 1797A first-order form used by JSBSim 'Milspec'.
import { M } from 'test/harness.mjs';
const { Aircraft, KT, FT } = M;
const f = (x, n = 4) => Number(x).toFixed(n);
const V = 95 * KT, b = 10.2;
function lowAlt(hft, W20kt) { const h = Math.min(Math.max(hft, 10), 1000), k = 0.177 + 0.000823 * h; const sw = 0.1 * W20kt * KT; return { Lw: h * FT, Lu: h / Math.pow(k, 1.2) * FT, sw, su: sw / Math.pow(k, 0.4) }; }
// one-sided spectra in omega (rad/s), 8785C (MathWorks form)
const Phiw = (w, s, L) => (s * s * L / (Math.PI * V)) * (1 + 3 * (L * w / V) ** 2) / (1 + (L * w / V) ** 2) ** 2;
const integ = (fn, a, bnd, n = 400000) => { // log-spaced trapezoid
  let s = 0, la = Math.log(a), lb = Math.log(bnd), d = (lb - la) / n; let x0 = a, y0 = fn(a) * a;
  for (let i = 1; i <= n; i++) { const x = Math.exp(la + i * d), y = fn(x) * x; s += 0.5 * (y + y0) * d; y0 = y; } return s; };
for (const [hft, W20] of [[100, 15], [300, 15], [50, 15]]) {
  const P = lowAlt(hft, W20);
  const sw2 = integ(w => Phiw(w, P.sw, P.Lw), 1e-6, 1e5);
  const sq2 = integ(w => (w / V) ** 2 / (1 + (4 * b * w / (Math.PI * V)) ** 2) * Phiw(w, P.sw, P.Lw), 1e-6, 1e5);
  const sr2 = integ(w => (w / V) ** 2 / (1 + (3 * b * w / (Math.PI * V)) ** 2) * Phiw(w, P.su, P.Lu), 1e-6, 1e5);
  const sp2 = integ(w => (P.sw ** 2 / (V * P.Lw)) * 0.8 * Math.pow(Math.PI * P.Lw / (4 * b), 1 / 3) / (1 + (4 * b * w / (Math.PI * V)) ** 2), 1e-6, 1e5);
  console.log(`h=${hft} ft W20=${W20} kt: check sigma_w=${f(Math.sqrt(sw2))} (target ${f(P.sw)}); sigma_p=${f(Math.sqrt(sp2))} closed-form 0.954*sw/(Lw b^2)^(1/3)=${f(0.954 * P.sw / Math.cbrt(P.Lw * b * b))}; JSBSim/Yeager 1.9*sw/sqrt(Lw b)=${f(1.9 * P.sw / Math.sqrt(P.Lw * b))}; sigma_q=${f(Math.sqrt(sq2))}; sigma_r=${f(Math.sqrt(sr2))} rad/s`);
}
// current model: sigma vs dt (first-order AR1 is exact)
const Wind = new Aircraft().wind.constructor;
for (const dt of [1 / 30, 1 / 60, 1 / 240, 1 / 1000]) {
  const w = new Wind({ fromDeg: 0, kt: 15, turb: 1, seed: 5 }); const h = 100 * FT; let s = 0; const N = Math.round(2000 / dt);
  for (let i = 0; i < N; i++) { w.update(dt, h, V, 0); const a = w.at(h); s += a[2] * a[2]; }
  console.log(`current Wind dt=${f(dt, 4)}: sigma_w=${f(Math.sqrt(s / N), 3)} m/s (target 0.719)`);
}
// JSBSim ttMilspec (1797A form, Yeager eq.32): xi_w = (1-2T/tau_w) xi + sig_w sqrt(4T/tau_w) nu, tau_w = Lw/V (8785C Lw = h)
{ const P = lowAlt(100, 15), dt = 1 / 240, tau = P.Lw / V; let x = 0; const N = 240 * 3000, xs = new Float64Array(N);
  let a = 1, r = () => { a = (a * 16807) % 2147483647; return a / 2147483647; }; const g = () => Math.sqrt(-2 * Math.log(r() || 1e-12)) * Math.cos(2 * Math.PI * r());
  for (let i = 0; i < N; i++) { x = (1 - 2 * dt / tau) * x + P.sw * Math.sqrt(4 * dt / tau) * g(); xs[i] = x; }
  let s0 = 0; for (const v of xs) s0 += v * v; const lag = Math.round(P.Lw / V / dt); let s1 = 0; for (let i = 0; i + lag < N; i++) s1 += xs[i] * xs[i + lag];
  console.log(`JSBSim-Milspec-style w: sigma=${f(Math.sqrt(s0 / N), 3)} (target ${f(P.sw, 3)}), R(xi=Lw)=${f((s1 / (N - lag)) / (s0 / N), 3)} vs e^-2=${f(Math.exp(-2), 3)} vs Dryden 8785C 0.184`);
}
