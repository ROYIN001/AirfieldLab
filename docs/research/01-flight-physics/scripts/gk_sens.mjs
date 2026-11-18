import { P, coeffs, X0, DEG, RAD } from './proto_aero.mjs';
function dynMax(f, rate, tau1, tau2) { const dt = 1 / 240; let a = 0, X = 1; const adot = rate * DEG; let best = -9, ab = 0;
  while (a < 35 * DEG) { X += (X0(a - tau2 * adot, P.cfg[f]) - X) * (1 - Math.exp(-dt / tau1)); a += adot * dt; const c = coeffs(a, f, X).CL; if (c > best) { best = c; ab = a; } } return [best, ab * RAD]; }
const st = [1.3552, 1.6566];
for (const [t1, t2] of [[0.6, 0.3], [0.4, 0.2], [0.17, 0.17]]) {
  console.log(`tau1 ${t1} tau2 ${t2}: ` + [0.5, 1, 5, 20].map(r => { const [m, a] = dynMax(0, r, t1, t2); return `${r}deg/s +${(100 * (m / st[0] - 1)).toFixed(1)}%@${a.toFixed(1)}`; }).join('  '));
}
