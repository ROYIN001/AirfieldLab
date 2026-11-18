// Constant-speed governor simulation on a BEM-derived CT/CP table (estimates). Run: node gov.mjs
import { prop, bem } from './p3_bem.mjs';
const D = prop.D, rho = 1.16, KT = 0.514444;
const Bs = [], Js = []; for (let b = 0; b <= 64; b += 2) Bs.push(b); for (let j = 0; j <= 1.6001; j += 0.04) Js.push(+j.toFixed(2));
const CT = Js.map(J => Bs.map(b => bem(J, b, { N: 20, rho }).CT)), CP = Js.map(J => Bs.map(b => bem(J, b, { N: 20, rho }).CP));
function lut(T, J, b) { const fj = Math.min(Math.max(J / 0.04, 0), Js.length - 1.0001), fb = Math.min(Math.max(b / 2, 0), Bs.length - 1.0001);
  const i = Math.floor(fj), k = Math.floor(fb), u = fj - i, v = fb - k;
  return (1 - u) * ((1 - v) * T[i][k] + v * T[i][k + 1]) + u * ((1 - v) * T[i + 1][k] + v * T[i + 1][k + 1]); }
function sim({ law, kGov = 1.0, rmax = Infinity, Iext = 0, V = 80 * KT, P1 = 20e3, P2 = 700e3, tau = 1.0, dt = 1 / 240, tEnd = 8, bMin = 10, bMax = 81, Nset = 2000 }) {
  const I = 14 + Iext; let N = Nset, b = 14, P = P1, peak = 0, tSettle = null, bPeak = 0; let integ = 0;
  // find initial beta in equilibrium at P1
  for (let it = 0; it < 4000; it++) { const n = N / 60, J = V / (n * D); const Q = lut(CP, J, b) * rho * n ** 3 * D ** 5 / (2 * Math.PI * n); const e = P / (2 * Math.PI * n) - Q; b += 1e-4 * e; b = Math.min(Math.max(b, bMin), bMax); }
  const log = [];
  for (let t = 0; t < tEnd; t += dt) {
    const Pc = t < 1 ? P1 : P2; P += (Pc - P) * (1 - Math.exp(-dt / tau));
    const n = N / 60, Om = 2 * Math.PI * n, J = V / (n * D);
    const Qa = lut(CP, J, b) * rho * n ** 3 * D ** 5 / Om;
    N += ((P / Om - Qa) / I) * dt * 60 / (2 * Math.PI);
    const e = N - Nset;
    let rate = law === 'jsbsim' ? kGov * e : (kGov * e + 0.0 * integ);
    rate = Math.max(-rmax, Math.min(rmax, rate));
    b = Math.min(Math.max(b + rate * dt, bMin), bMax);
    if (t > 1) { peak = Math.max(peak, N); bPeak = Math.max(bPeak, b); }
    log.push([t, N, b, P]);
  }
  // settling: last time |N-Nset| > 1% after the step
  for (let i = log.length - 1; i >= 0; i--) if (Math.abs(log[i][1] - Nset) > 0.01 * Nset) { tSettle = log[i][0] - 1; break; }
  const T = lut(CT, V / (N / 60 * D), b) * rho * (N / 60) ** 2 * D ** 4;
  return { peak, tSettle, bEnd: b, NEnd: N, T };
}
const cases = [
  ['JSBSim law k=1 deg/s/rpm, no rate limit', { law: 'jsbsim', kGov: 1 }],
  ['k=1, rate limit 20 deg/s', { law: 'p', kGov: 1, rmax: 20 }],
  ['k=0.5, rate limit 15 deg/s', { law: 'p', kGov: 0.5, rmax: 15 }],
  ['k=0.2, rate limit 15 deg/s', { law: 'p', kGov: 0.2, rmax: 15 }],
  ['k=0.5, rate 15, +5 kg m2 reflected PT inertia', { law: 'p', kGov: 0.5, rmax: 15, Iext: 5 }],
  ['k=1, rate 20, I=10.8 (JSBSim prop_PT6 value)', { law: 'p', kGov: 1, rmax: 20, Iext: -3.2 }],
  ['k=0.5, rate 15, engine tau 0.3 s', { law: 'p', kGov: 0.5, rmax: 15, tau: 0.3 }],
];
for (const [nm, o] of cases) { const r = sim(o); console.log(`${nm}: peak ${r.peak.toFixed(0)} rpm, settle(±1%) ${r.tSettle === null ? 'n/a' : r.tSettle.toFixed(2) + ' s'}, final beta ${r.bEnd.toFixed(1)} deg, N ${r.NEnd.toFixed(0)}, T ${(r.T / 1e3).toFixed(2)} kN`); }
// power chop: 700 kW -> 20 kW at 120 kt: underspeed check (blade hits flight-idle stop?)
for (const [nm, o] of [['chop 700->20 kW at 120 kt, k=0.5 r=15', { law: 'p', kGov: 0.5, rmax: 15, V: 120 * KT, P1: 700e3, P2: 20e3 }], ['chop at 88 kt', { law: 'p', kGov: 0.5, rmax: 15, V: 88 * KT, P1: 700e3, P2: 20e3 }]]) {
  const r = sim(o); console.log(`${nm}: final beta ${r.bEnd.toFixed(1)} N ${r.NEnd.toFixed(0)} rpm T ${r.T.toFixed(0)} N, min-rpm check -> settle ${r.tSettle}`);
}
