// Prototype of the proposed AirfieldLab aero model (Section 1, Round 1). ESTIMATES for the fictional trainer.
// Static longitudinal: C = X*C_att + (1-X)*C_sep, X = flow-attachment state (Kirchhoff / Goman-Khrabrov idea),
// separated branch = Viterna-Corrigan type flat-plate extrapolation; all coefficients periodic in alpha.
export const DEG = Math.PI / 180, RAD = 180 / Math.PI, KT = 0.514444, G0 = 9.80665;
export const P = {
  m: 2250, S: 16.3, b: 10.2, c: 1.65, Ixx: 2600, Iyy: 7300, Izz: 9200,
  CLa: 4.8, CDmax: 1.40, dCDX: 0.20, CmX: -0.12, K: 0.062, CD0: 0.024, CDgear: 0.020,
  Cma: -0.72,
  cfg: { // per flap setting (0 = clean, 1 = landing)
    0: { CL0: 0.25, aStar: 16.29 * DEG, aStarN: 13.0 * DEG, a1: 22, CLs: 0.95, CDf: 0.0, Cm0: 0.045 },
    1: { CL0: 0.80, aStar: 13.73 * DEG, aStarN: 9.0 * DEG, a1: 22, CLs: 1.10, CDf: 0.050, Cm0: -0.055 },
  },
};
export const wrapPi = (a) => { a = (a + Math.PI) % (2 * Math.PI); if (a < 0) a += 2 * Math.PI; return a - Math.PI; };
// static attachment X0(alpha): ~1 attached, ~0 separated; also separates for negative stall and tail-first flow
export function X0(a, k) {
  a = wrapPi(a);
  return 0.25 * (1 - Math.tanh(k.a1 * (a - k.aStar))) * (1 + Math.tanh(k.a1 * (a + k.aStarN)));
}
// Viterna-Corrigan separated lift: CL = CDmax/2 sin2a + A cos^2 a / sin a  (|a|<=90deg), flat plate beyond
export function CLsep(a, k, p = P) {
  a = wrapPi(a);
  const as = k.aStar, sa = Math.sin(as), ca = Math.cos(as);
  const A = (k.CLs - p.CDmax * sa * ca) * sa / (ca * ca);           // matches CL_sep(aStar) = CLs
  const s = Math.sin(a), c = Math.cos(a);
  const fp = 0.5 * p.CDmax * Math.sin(2 * a);
  if (Math.abs(a) > Math.PI / 2) return 0.7 * fp;                   // tail-first: reduced (AirfoilPrep cl_adj 0.7)
  const sGuard = Math.sign(s || 1) * Math.max(Math.abs(s), sa);     // avoid 1/sin(0); X~1 there anyway
  return fp + A * c * c / sGuard;
}
export function coeffs(a, f, X = null, p = P) {   // f: 0 or 1 (flap index); X: dynamic attachment, null = static
  const k = p.cfg[f];
  const x = X == null ? X0(a, k) : X;
  const aw = wrapPi(a);
  const CLatt = k.CL0 + p.CLa * aw;
  const CL = x * CLatt + (1 - x) * CLsep(aw, k, p);
  const CD0t = p.CD0 + k.CDf + p.CDgear;
  const s2 = Math.sin(aw) ** 2;
  const CDatt = CD0t + p.K * (CLatt - 0.15) ** 2;
  const CDsep = CD0t + p.dCDX * Math.cos(aw) ** 2 + (p.CDmax - CD0t) * s2;
  const CD = x * CDatt + (1 - x) * CDsep;
  const Cmatt = k.Cm0 + p.Cma * aw, Cmsep = k.Cm0 + p.Cma * Math.sin(aw) + p.CmX;
  const Cm = x * Cmatt + (1 - x) * Cmsep;
  return { CL, CD, Cm, X: x, CN: CL * Math.cos(aw) + CD * Math.sin(aw), CA: CD * Math.cos(aw) - CL * Math.sin(aw) };
}
