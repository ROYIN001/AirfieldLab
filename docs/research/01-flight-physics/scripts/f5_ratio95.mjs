// ratio of B&Y rated thrust at 10,000 ft vs SL at the same TAS (95 kt), for the current-model gap row
import { M } from 'test/harness.mjs';
const { atmosphere, FT } = M;
const BY = (Mach, d, b) => { const G = 0.0606 * b + 0.6337, A = -0.4327*d*d + 1.3855*d + 0.0472, Z = 0.9106*d**3 - 1.7736*d*d + 1.8697*d, X = 0.1377*d**3 - 0.4374*d*d + 1.3003*d;
  return A - 0.377*(1+b)/Math.sqrt((1+0.82*b)*G)*Z*Mach + (0.23+0.19*Math.sqrt(b))*X*Mach*Mach; };
const V = 95 * 0.514444; const r = {};
for (const b of [5.1, 11.1]) { const s = atmosphere(0), h = atmosphere(10000 * FT); const aS = Math.sqrt(1.4*287.05287*s.T), aH = Math.sqrt(1.4*287.05287*h.T);
  r[b] = { SL: +BY(V/aS, 1, b).toFixed(3), h10k: +BY(V/aH, h.p/101325, b).toFixed(3), ratio: +(BY(V/aH, h.p/101325, b)/BY(V/aS, 1, b)).toFixed(3) }; }
console.log(JSON.stringify(r));
