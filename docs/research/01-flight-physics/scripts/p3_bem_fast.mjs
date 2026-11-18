// BEM (blade element momentum) with Prandtl tip loss for a generic 4-blade turboprop-trainer propeller.
// All geometry and airfoil numbers are ESTIMATES (ค่าประมาณ) for AirfieldLab's fictional trainer.
// Usage: node bem.mjs            -> prints tables + key numbers
//        import { prop, bem, loads } from './p3_bem.mjs'
const DEG = Math.PI / 180, RAD = 180 / Math.PI;
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

export const prop = {
  B: 4, D: 2.44, xh: 0.18,            // blades, diameter m, hub/spinner radius / R
  Jd: 1.10,                           // twist follows atan(Jd/(pi x)) (helical twist for J = Jd)
  // chord / D at x = r/R
  cx: [0.18, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.92, 0.97, 1.00],
  cD: [0.058, 0.064, 0.070, 0.073, 0.074, 0.073, 0.071, 0.066, 0.060, 0.052, 0.040],
  // section aerodynamics (thin cambered section, estimate)
  cla: 2 * Math.PI * 0.92, a0: -3.0 * DEG, aStallP: 14 * DEG, aStallN: -11 * DEG, Mblend: 10,
  cd0: 0.0085, kcd: 0.010, clmd: 0.35, Mdd: 0.80, snel: 3,
};
const interp = (xs, ys, x) => { if (x <= xs[0]) return ys[0]; for (let i = 1; i < xs.length; i++) if (x <= xs[i]) { const t = (x - xs[i - 1]) / (xs[i] - xs[i - 1]); return ys[i - 1] + t * (ys[i] - ys[i - 1]); } return ys[ys.length - 1]; };
export const chord = (x, P = prop) => interp(P.cx, P.cD, x) * P.D;
export const twist = (x, P = prop) => Math.atan(P.Jd / (Math.PI * x)) - Math.atan(P.Jd / (Math.PI * 0.75)); // relative to 0.75R

function sig(a, a0, M) { const e1 = Math.exp(-M * (a - a0)); return 1 / (1 + e1); }
// section Cl, Cd versus angle of attack a (rad) and Mach number Ma
export function airfoil(a, Ma, P = prop, cr = 0) {
  const m = Math.min(Ma, 0.8), pg = 1 / Math.sqrt(1 - m * m);
  const clLin = P.cla * pg * (a - P.a0);
  const cdLin = P.cd0 + P.kcd * (clLin - P.clmd) ** 2;
  // Beard-McLain style blend to flat plate beyond positive and negative stall
  const sp = sig(a, P.aStallP, P.Mblend), sn = 1 - sig(a, P.aStallN, P.Mblend);
  const s = Math.max(sp, sn);
  const sa = Math.sin(a), ca = Math.cos(a);
  const clFP = 2 * sa * ca, cdFP = P.cd0 + 1.9 * sa * sa;
  let cl = (1 - s) * clLin + s * clFP, cd = (1 - s) * cdLin + s * cdFP;
  // rotational stall delay (Snel et al. 1994): cl3D = cl2D + 3 (c/r)^2 (cl_lin - cl2D), limited to |alpha| < 30 deg
  if (P.snel && Math.abs(a) < 30 * DEG) cl += P.snel * cr * cr * (clLin - cl);
  const Mcrit = P.Mdd - Math.cbrt(0.1 / 80);           // Korn/Lock drag-rise form
  if (Ma > Mcrit) cd += 20 * (Ma - Mcrit) ** 4;
  return { cl, cd };
}

// one annulus: solve for inflow angle phi. V axial (m/s), Om rad/s, r m, th local pitch (rad)
export function annulus(V, Om, r, c, th, rho, a_s, P) {
  const R = P.D / 2, B = P.B, sigma = B * c / (2 * Math.PI * r);
  const ev = (phi) => {
    const sp = Math.sin(phi), cp = Math.cos(phi);
    const f = (B / 2) * (R - r) / (r * Math.max(Math.abs(sp), 1e-6));
    const F = Math.max((2 / Math.PI) * Math.acos(clamp(Math.exp(-f), 0, 1)), 1e-4);
    const alpha = th - phi;
    // local Mach from geometric (no induction) helical speed: adequate for drag rise
    const Ma = Math.hypot(V, Om * r) / a_s;
    const { cl, cd } = airfoil(alpha, Ma, P, c / r);
    const Cy = cl * cp - cd * sp, Cx = cl * sp + cd * cp;
    const ka = sigma * Cy / (4 * F * sp * sp), kt = sigma * Cx / (4 * F * sp * cp);
    const res = sp * (1 - ka) - (V / (Om * r)) * cp * (1 + kt);
    return { res, F, alpha, cl, cd, Cy, Cx, ka, kt, Ma };
  };
  // scan for the first sign change (negative -> positive), then bisect
  let lo = 1e-4, flo = ev(lo).res, phi = null;
  const n = 24;
  for (let i = 1; i <= n; i++) {
    const hi = 1e-4 + (Math.PI / 2 - 2e-4) * i / n, fhi = ev(hi).res;
    if (flo <= 0 && fhi > 0) { let a = lo, b = hi; for (let k = 0; k < 30; k++) { const m = 0.5 * (a + b); if (ev(m).res > 0) b = m; else a = m; } phi = 0.5 * (a + b); break; }
    lo = hi; flo = fhi;
  }
  let ok = true;
  if (phi === null) { ok = false; phi = Math.max(1e-3, Math.atan2(V, Om * r)); }
  const e = ev(phi);
  const sp = Math.sin(phi), cp = Math.cos(phi);
  // velocities: W_t = Om r /(1+kt); W_a = W_t tan(phi)
  const Wt = Om * r / (1 + e.kt), Wa = Wt * Math.tan(phi), W = Math.hypot(Wa, Wt);
  const va = Wa - V, vt = Om * r - Wt;
  if (V > 0 && va < -0.5 * V) ok = false;                // momentum theory invalid (turbulent wake / vortex ring)
  const q = 0.5 * rho * W * W * c;
  return { phi, dT: B * q * e.Cy, dQ: B * q * e.Cx * r, dFt: B * q * e.Cx, W, Wa, Wt, va, vt, ok, ...e };
}

// integrate the blade: beta75 (deg) blade angle at 0.75R, J advance ratio, n rev/s
export function bem(J, beta75, { n = 2000 / 60, rho = 1.225, a_s = 340.3, N = 40, P = prop } = {}) {
  const R = P.D / 2, D = P.D, Om = 2 * Math.PI * n, V = J * n * D;
  let T = 0, Q = 0, ok = true, Tvi = 0; const el = [];
  for (let i = 0; i < N; i++) {
    const x = P.xh + (1 - P.xh) * (i + 0.5) / N, r = x * R, dr = (1 - P.xh) * R / N;
    const th = beta75 * DEG + twist(x, P);
    const s = annulus(V, Om, r, chord(x, P), th, rho, a_s, P);
    T += s.dT * dr; Q += s.dQ * dr; ok = ok && s.ok; Tvi += s.va * s.dT * dr;
    el.push({ x, r, dr, th, c: chord(x, P), ...s });
  }
  const CT = T / (rho * n * n * D ** 4), CQ = Q / (rho * n * n * D ** 5), CP = 2 * Math.PI * CQ;
  const eta = CP > 1e-6 && CT > 0 ? J * CT / CP : 0;
  return { J, beta75, V, n, T, Q, P: Q * Om, CT, CP, eta, ok, el, vaMean: T !== 0 ? Tvi / T : 0 };
}

// Off-axis loads (P-factor, normal force) by azimuthal blade-element sums with frozen axisymmetric induction.
// Body FRD axes, propeller rotating about +x (clockwise seen from behind). vIp = [vy, vz] = in-plane component of
// the aircraft's air-relative velocity in body axes (v = V sin(beta), w = V sin(alpha) for small angles).
export function loads(J, beta75, vIp, opt = {}) {
  const base = bem(J, beta75, opt);
  const { n = 2000 / 60, rho = 1.225, P = prop } = opt;
  const Om = 2 * Math.PI * n, V = base.V, NA = 72;
  let T = 0, Mx = 0, My = 0, Mz = 0, Fy = 0, Fz = 0;
  for (const e of base.el) {
    for (let k = 0; k < NA; k++) {
      const psi = 2 * Math.PI * (k + 0.5) / NA;
      // blade position: e_r = (0, cos psi, sin psi)  (psi = 0 -> right wing, psi = 90 deg -> down)
      const ry = Math.cos(psi), rz = Math.sin(psi);
      // blade velocity for rotation +x: Om x r = Om * (0, -rz, ry) * r  => direction e_t = (0,-sin psi, cos psi)
      const ty = -rz, tz = ry;
      // air velocity relative to the aircraft = -(vab); in-plane part = -vIp
      const airT = -(vIp[0] * ty + vIp[1] * tz);        // air velocity along the blade's direction of motion
      const Wt = Om * e.r - e.vt - airT;               // tangential speed seen by the section
      const Wa = V + e.va;
      const phi = Math.atan2(Wa, Wt), W = Math.hypot(Wa, Wt);
      const Ma = Math.hypot(V, Om * e.r) / (opt.a_s || 340.3);
      const { cl, cd } = airfoil(e.th - phi, Ma, P, e.c / e.r);
      const q = 0.5 * rho * W * W * e.c * e.dr * P.B / NA;   // B blades spread over NA azimuths
      const dT = q * (cl * Math.cos(phi) - cd * Math.sin(phi));
      const dFt = q * (cl * Math.sin(phi) + cd * Math.cos(phi)); // opposes blade motion
      T += dT;
      // force on the propeller: thrust +x, in-plane -dFt * e_t
      const fy = -dFt * ty, fz = -dFt * tz;
      Fy += fy; Fz += fz;
      // moments about the hub centre: r x F, r = (0, r ry, r rz), F = (dT, fy, fz)
      const pr = [0, e.r * ry, e.r * rz], F = [dT, fy, fz];
      Mx += pr[1] * F[2] - pr[2] * F[1]; My += pr[2] * F[0] - pr[0] * F[2]; Mz += pr[0] * F[1] - pr[1] * F[0];
    }
  }
  return { T, Fy, Fz, Mx, My, Mz, base };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const P = prop, R = P.D / 2;
  // activity factor per blade: AF = 1e5/16 * integral_{xh}^{1} (c/D) x^3 dx
  let AF = 0; const Ns = 400; for (let i = 0; i < Ns; i++) { const x = P.xh + (1 - P.xh) * (i + 0.5) / Ns; AF += interp(P.cx, P.cD, x) * x ** 3 * (1 - P.xh) / Ns; }
  AF *= 1e5 / 16;
  const sigma75 = P.B * chord(0.75) / (Math.PI * R);
  console.log(`geometry: B=${P.B} D=${P.D} m, AF/blade=${AF.toFixed(0)}, solidity(0.75R)=${sigma75.toFixed(3)}, twist 0.2R->tip ${((twist(0.2) - twist(1)) * RAD).toFixed(1)} deg`);
  const Js = []; for (let j = 0; j <= 2.4001; j += 0.1) Js.push(+j.toFixed(2));
  const betas = [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
  const CT = [], CP = [], OK = [];
  for (const J of Js) { const rT = [], rP = [], rO = []; for (const b of betas) { const s = bem(J, b); rT.push(+s.CT.toFixed(4)); rP.push(+s.CP.toFixed(4)); rO.push(s.ok ? 1 : 0); } CT.push(rT); CP.push(rP); OK.push(rO); }
  console.log('beta75:', betas.join(' '));
  console.log('C_T:'); Js.forEach((J, i) => console.log(J.toFixed(1), CT[i].map((v, k) => (OK[i][k] ? ' ' : '*') + v.toFixed(4)).join(' ')));
  console.log('C_P:'); Js.forEach((J, i) => console.log(J.toFixed(1), CP[i].map((v, k) => (OK[i][k] ? ' ' : '*') + v.toFixed(4)).join(' ')));
  console.log('eta:'); Js.forEach((J, i) => console.log(J.toFixed(1), CT[i].map((v, k) => (CP[i][k] > 1e-4 && v > 0 ? J * v / CP[i][k] : 0).toFixed(3)).join('  ')));
  // peak efficiency per blade angle
  for (const b of betas) { let best = { eta: 0 }; for (let J = 0.05; J <= 3.0; J += 0.01) { const s = bem(J, b); if (s.eta > best.eta && s.ok) best = { eta: s.eta, J }; } console.log(`beta ${b}: eta_max ${best.eta.toFixed(3)} at J=${best.J?.toFixed(2)}`); }
  const fs = await import('fs');
  fs.writeFileSync(new URL('./p3_bem_table.json', import.meta.url), JSON.stringify({ J: Js, beta75: betas, CT, CP, ok: OK }, null, 0));
}
