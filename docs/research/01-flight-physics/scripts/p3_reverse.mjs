// Static reverse thrust (V = 0). Each annulus is solved in the forward sense; when the local pitch is so low that
// the annulus pushes air forward (no root with phi > 0), it is solved mirrored: pitch -theta, camber reversed,
// thrust sign flipped, torque unchanged. Exact within BEM assumptions at V = 0 only.
import { prop, annulus, chord, twist } from './p3_bem.mjs';
const D = prop.D, R = D / 2, rho = 1.16, a_s = 349.6, DEG = Math.PI / 180;
const Pm = { ...prop, a0: -prop.a0, aStallP: -prop.aStallN, aStallN: -prop.aStallP };
function staticAny(beta75, rpm, N = 40) {
  const n = rpm / 60, Om = 2 * Math.PI * n; let T = 0, Q = 0, nf = 0, nm = 0;
  for (let i = 0; i < N; i++) {
    const x = prop.xh + (1 - prop.xh) * (i + 0.5) / N, r = x * R, dr = (1 - prop.xh) * R / N, c = chord(x), th = beta75 * DEG + twist(x);
    const f = annulus(0, Om, r, c, th, rho, a_s, prop), m = annulus(0, Om, r, c, -th, rho, a_s, Pm);
    // choose the branch whose solution is consistent (positive thrust in its own frame)
    if (f.ok && f.dT > 0 && !(m.ok && m.dT > 0 && th < 0)) { T += f.dT * dr; Q += f.dQ * dr; nf++; }
    else if (m.ok && m.dT > 0) { T -= m.dT * dr; Q += m.dQ * dr; nm++; }
  }
  return { T, Q, P: Q * Om, CT: T / (rho * n * n * D ** 4), CP: 2 * Math.PI * Q / (rho * n * n * D ** 5), nf, nm };
}
for (const rpm of [1825]) for (const b of [26.8, 10, 5, 0, -5, -10, -15, -20, -25]) {
  const s = staticAny(b, rpm);
  console.log(`rpm ${rpm} beta75=${b}: T=${(s.T / 1e3).toFixed(2)} kN P=${(s.P / 1e3).toFixed(0)} kW CT=${s.CT.toFixed(4)} CP=${s.CP.toFixed(4)} (fwd annuli ${s.nf}, mirrored ${s.nm})`);
}
// power-limited reverse: most negative beta75 with P <= 420 kW (60% of 700 kW; JSBSim pc7 'reversemaxpower 60' as analogue)
let best = null; for (let b = 0; b >= -40; b -= 0.5) { const s = staticAny(b, 1825, 30); if (s.P <= 420e3) best = { b, ...s }; else break; }
console.log(`power-limited reverse at 1825 rpm: beta75=${best.b} T=${(best.T / 1e3).toFixed(2)} kN P=${(best.P / 1e3).toFixed(0)} kW ratio to fwd static 11.55 kN = ${(-best.T / 11550).toFixed(2)}`);
