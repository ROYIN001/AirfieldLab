// Wing drop (1-DOF roll) with strip wing, asymmetry seed, and aileron effectiveness vs alpha
import { P, coeffs, DEG, RAD, KT, G0 } from './proto_aero.mjs';
import { WING, wingPanels } from './strip.mjs';
WING.kp = 0.661; WING.gammaDeg = 4;
// strip loads with aileron: outer 40% span panels get alpha increment tau*da (right wing -da, left +da for +da = roll right)
function loads(aRad, p, V, f, da, dAstarL, rho = 1.225) {
  const pan = wingPanels(); let L = 0;
  for (const s of pan) {
    const y = s.y, z = -Math.abs(y) * Math.tan(s.g);
    const vx = V * Math.cos(aRad), vy = -p * z * WING.kp, vz = V * Math.sin(aRad) + p * y * WING.kp;
    const sg = Math.sin(s.g) * s.side, cg = Math.cos(s.g);
    const wn = vy * sg + vz * cg, un = vx;
    let a = Math.atan2(wn, un);
    const outer = Math.abs(y) > 0.6 * P.b / 2;
    if (outer) a += 0.45 * da * (s.side > 0 ? -1 : 1);   // tau_a = 0.45 (est); +da = right roll -> right aileron up
    const k = { ...P.cfg[f] }; if (s.side < 0) k.aStar += dAstarL;
    const c = coeffs(a, f, null, { ...P, cfg: { ...P.cfg, [f]: k } });
    const q2 = un * un + wn * wn, Vl = Math.sqrt(q2);
    const Lift = 0.5 * rho * q2 * s.dS * c.CL, Drag = 0.5 * rho * q2 * s.dS * c.CD;
    const fn = (-Lift * un - Drag * wn) / Vl;
    const F = [0, fn * sg, fn * cg];
    L += y * F[2] - z * F[1];
  }
  return L;
}
const qSb = (V) => 0.5 * 1.225 * V * V * P.S * P.b;
// aileron effectiveness vs alpha
const Vt = 40;
const clda = (aDeg, f = 0) => (loads(aDeg * DEG, 0, Vt, f, 1 * DEG, 0) - loads(aDeg * DEG, 0, Vt, f, -1 * DEG, 0)) / (2 * DEG) / qSb(Vt);
console.log('Clda(alpha) clean:', [0, 5, 10, 12, 13, 14, 15, 16, 18, 20, 25].map(a => `${a}:${clda(a).toFixed(3)}`).join(' '));
console.log('Clda(alpha) flaps:', [0, 5, 9, 10, 11, 12, 13, 14, 16, 20].map(a => `${a}:${clda(a, 1).toFixed(3)}`).join(' '));
// 1-DOF roll at fixed alpha & V, seed on left wing
function rollSim({ aDeg, f = 0, seedDeg = -0.5, da = 0, daAt = 99, T = 3 }) {
  const W = P.m * G0;
  let CLm = -9; for (let a = 5; a < 25; a += 0.02) CLm = Math.max(CLm, coeffs(a * DEG, f).CL);
  const V = Math.sqrt(2 * W / (1.225 * P.S * CLm));   // 1-g stall speed
  let p = 0, phi = 0, t = 0; const dt = 1 / 240; const out = {};
  while (t < T) {
    const d = t >= daAt ? da : 0;
    const L = loads(aDeg * DEG, p, V, f, d, seedDeg * DEG);
    p += L / P.Ixx * dt; phi += p * dt; t += dt;
    for (const tt of [0.5, 1, 1.5, 2, 3]) if (Math.abs(t - tt) < dt / 2) out[tt] = +(phi * RAD).toFixed(1);
  }
  return { V: V / KT, out, pEnd: p * RAD };
}
for (const f of [0, 1]) {
  let am = 0, CLm = -9; for (let a = 5; a < 25; a += 0.02) { const c = coeffs(a * DEG, f).CL; if (c > CLm) { CLm = c; am = a; } }
  for (const da of [0, 1]) for (const dA of [-1.0, 1.0]) {
    const aD = am + dA;
    const r = rollSim({ aDeg: aD, f, seedDeg: -0.5, da: da ? 20 * DEG : 0, daAt: 0.5 });
    console.log(`flaps ${f} alpha ${aD.toFixed(2)} (aCLmax${dA > 0 ? '+' : ''}${dA}) seed L -0.5deg, ${da ? 'full right aileron at 0.5 s' : 'aileron neutral'}: V ${r.V.toFixed(1)} kt bank(t) ${JSON.stringify(r.out)} p_end ${r.pEnd.toFixed(1)} deg/s`);
  }
  // symmetric (no seed) check: should stay ~0
  const r0 = rollSim({ aDeg: am + 1, f, seedDeg: 0 });
  console.log(`   no seed: bank(t) ${JSON.stringify(r0.out)}`);
}
