// Strip (panel) wing prototype: local alpha from body velocity + omega x r, dihedral, per-panel static curve.
// Rolling moment vs roll rate at fixed alpha -> Clp(alpha) and autorotation equilibrium.
import { P, coeffs, DEG, RAD } from './proto_aero.mjs';
export const WING = { n: 8, taper: 0.6, gammaDeg: 4.0, kp: 1.0, seed: 0 };
export function wingPanels(w = WING, p = P) {
  const cr = 2 * p.S / (p.b * (1 + w.taper)), hs = p.b / 2, dy = hs / w.n, pan = [];
  for (const side of [1, -1]) for (let i = 0; i < w.n; i++) {
    const y = (i + 0.5) * dy, c = cr * (1 - (1 - w.taper) * y / hs);
    pan.push({ y: side * y, c, dS: c * dy, side, g: w.gammaDeg * DEG });
  }
  return pan;
}
// body-axis air velocity of the CG (u,v,w), body rates (p,q,r), flap index f, per-side alpha* offsets (asymmetry seed)
export function stripLoads(vb, om, f, pan, opts = {}) {
  const { kp = 1, dAstarL = 0, dAstarR = 0 } = opts;
  let L = 0, N = 0, Fz = 0, Fx = 0;
  for (const s of pan) {
    // panel point r = (0, y, -|y| tan G); velocity of air relative to panel = -(vb + om x r); use panel motion
    const r = [0, s.y, -Math.abs(s.y) * Math.tan(s.g)];
    const vr = [om[1] * r[2] - om[2] * r[1], om[2] * r[0] - om[0] * r[2], om[0] * r[1] - om[1] * r[0]];
    // kp scales only the roll-rate part of the induced normal velocity (lifting-line correction, calibrated)
    const vrp = [0, -om[0] * r[2] * kp, om[0] * r[1] * kp];
    const vx = vb[0] + vr[0], vy = vb[1] + vr[1] - (1 - kp) * 0 , vz = vb[2] + (vr[2] - om[0] * r[1]) + vrp[2];
    // panel down-normal with dihedral: right wing (0, sinG, cosG), left (0, -sinG, cosG)
    const sg = Math.sin(s.g) * s.side, cg = Math.cos(s.g);
    const wn = vy * sg + vz * cg;               // normal (down) component in panel frame
    const un = vx;
    const a = Math.atan2(wn, un), q2 = un * un + wn * wn;
    const k = { ...P.cfg[f] }; k.aStar += s.side > 0 ? dAstarR : dAstarL;
    const c = coeffs(a, f, null, { ...P, cfg: { ...P.cfg, [f]: k } });
    const Lift = 0.5 * q2 * s.dS * c.CL, Drag = 0.5 * q2 * s.dS * c.CD;   // rho=1 (coefficients only)
    // force in panel (x, n) plane: lift perpendicular to (un, wn) -> (wn, -un)/|.|, drag along -(un, wn)
    const V = Math.sqrt(q2) || 1e-9;
    const fx = (Lift * wn - Drag * un) / V, fn = (-Lift * un - Drag * wn) / V;
    const F = [fx, fn * sg, fn * cg];
    L += r[1] * F[2] - r[2] * F[1]; N += r[0] * F[1] - r[1] * F[0]; Fz += F[2]; Fx += F[0];
  }
  return { L, N, Fz, Fx };
}
// non-dimensional rolling-moment coefficient vs p_hat at fixed alpha (V=1, rho=1 -> qS b = 0.5 S b)
export function Cl_at(aDeg, phat, f = 0, opts = {}, w = WING) {
  const pan = wingPanels(w), V = 1, a = aDeg * DEG;
  const vb = [V * Math.cos(a), 0, V * Math.sin(a)], p = phat * 2 * V / P.b;
  // rotation about the velocity vector (rotary-balance-like coning) vs pure body roll: use body p only here
  const o = stripLoads(vb, [p, 0, 0], f, pan, { kp: w.kp, ...opts });
  return { Cl: o.L / (0.5 * P.S * P.b), Cn: o.N / (0.5 * P.S * P.b), CL: -o.Fz / (0.5 * P.S) };
}
