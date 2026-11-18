import { Cl_at, WING, wingPanels, stripLoads } from './strip.mjs';
import { P, DEG } from './proto_aero.mjs';
// 1) uncalibrated Clp at small alpha
const clp = (a, f = 0, opts) => (Cl_at(a, 0.01, f, opts).Cl - Cl_at(a, -0.01, f, opts).Cl) / 0.02;
console.log('kp=1: Clp(2deg) =', clp(2).toFixed(3), ' CL(2deg) strip =', Cl_at(2, 0).CL.toFixed(3));
WING.kp = -0.47 / clp(2) * 1.0; // calibrate to AC.Clp
console.log('calibrated kp =', WING.kp.toFixed(3), ' -> Clp(2deg) =', clp(2).toFixed(3));
// 2) dihedral calibration for Clb: beta derivative
const clb = (aDeg, g) => { WING.gammaDeg = g; const pan = wingPanels(); const a = aDeg * DEG, b = 1 * DEG;
  const vb = (bb) => [Math.cos(a) * Math.cos(bb), Math.sin(bb), Math.sin(a) * Math.cos(bb)];
  const L1 = stripLoads(vb(b), [0, 0, 0], 0, pan, { kp: WING.kp }).L, L0 = stripLoads(vb(-b), [0, 0, 0], 0, pan, { kp: WING.kp }).L;
  return (L1 - L0) / (2 * b) / (0.5 * P.S * P.b); };
for (const g of [2, 4, 6, 7]) console.log(`Gamma ${g} deg: Clb(4deg) = ${clb(4, g).toFixed(4)} /rad`);
WING.gammaDeg = 6;
// 3) Clp vs alpha (clean and flaps)
for (const f of [0, 1]) {
  const out = []; for (const a of [0, 5, 10, 12, 13, 14, 15, 16, 17, 18, 20, 22, 25, 30, 35, 40, 45, 50, 60]) out.push(`${a}:${clp(a, f).toFixed(2)}`);
  console.log(`flaps ${f} Clp(alpha): ${out.join(' ')}`);
  // sign change alpha
  let az = null; for (let a = 5; a < 40; a += 0.05) if (clp(a, f) > 0) { az = a; break; }
  console.log(`   Clp > 0 from alpha = ${az?.toFixed(2)} deg`);
}
// 4) autorotation: stable equilibrium p_hat where Cl = 0 and dCl/dp < 0, scanning p_hat 0.005..0.6
for (const f of [0, 1]) {
  const res = [];
  for (const a of [14, 16, 18, 20, 25, 30, 35, 40, 45, 50]) {
    let eq = null, prev = Cl_at(a, 0.005, f).Cl;
    for (let ph = 0.01; ph <= 0.8; ph += 0.005) { const c = Cl_at(a, ph, f).Cl; if (prev > 0 && c <= 0) { eq = ph; break; } prev = c; }
    res.push(`${a}:${eq == null ? '-' : eq.toFixed(3)}`);
  }
  console.log(`flaps ${f} autorotation p_hat_eq(alpha): ${res.join(' ')}`);
}
// 5) Clr and Cnp from strip at alpha 2 and 10 (for comparison with AC.Clr 0.11, Cnp -0.055)
const pan = wingPanels();
for (const a of [2, 8, 12]) {
  const A = a * DEG, vb = [Math.cos(A), 0, Math.sin(A)], rr = 0.01 * 2 / P.b;
  const Lp = stripLoads(vb, [0, 0, rr], 0, pan, { kp: WING.kp }), Lm = stripLoads(vb, [0, 0, -rr], 0, pan, { kp: WING.kp });
  const Clr = (Lp.L - Lm.L) / 0.02 / (0.5 * P.S * P.b);
  const pp = 0.01 * 2 / P.b, Pp = stripLoads(vb, [pp, 0, 0], 0, pan, { kp: WING.kp }), Pm = stripLoads(vb, [-pp, 0, 0], 0, pan, { kp: WING.kp });
  const Cnp = (Pp.N - Pm.N) / 0.02 / (0.5 * P.S * P.b);
  console.log(`alpha ${a}: CL ${Cl_at(a, 0).CL.toFixed(3)} Clr(wing) ${Clr.toFixed(3)} Cnp(wing) ${Cnp.toFixed(3)}`);
}
