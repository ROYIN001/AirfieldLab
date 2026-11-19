// Solve alpha* so that static CLmax hits the target (Vs1 78.5 kt clean, Vs0 71.0 kt landing), ISA SL, 2250 kg
import { P, coeffs, DEG, KT, G0 } from './proto_aero.mjs';
const W = P.m * G0, rho0 = 1.225;
const clmax = (f) => { let b = -9, ab = 0; for (let a = 5; a <= 25; a += 0.01) { const c = coeffs(a * DEG, f).CL; if (c > b) { b = c; ab = a; } } return [b, ab]; };
for (const [f, Vs] of [[0, 78.5], [1, 71.0]]) {
  const target = 2 * W / (rho0 * P.S * (Vs * KT) ** 2);
  let lo = 10 * DEG, hi = 20 * DEG;
  for (let i = 0; i < 40; i++) { const mid = 0.5 * (lo + hi); P.cfg[f].aStar = mid; if (clmax(f)[0] > target) hi = mid; else lo = mid; }
  const [cm, am] = clmax(f);
  console.log(`flaps ${f}: target CLmax ${target.toFixed(4)} -> aStar ${(P.cfg[f].aStar / DEG).toFixed(3)} deg, CLmax ${cm.toFixed(4)} at ${am.toFixed(2)} deg`);
}
