// Section 7: oleo-pneumatic strut design + drop test (2-DOF: sprung mass on strut, unsprung mass on tyre).
// Run: node g7_oleo.mjs
const g = 9.80665;
// Static loads of the trainer (CG at body origin; nose x=2.30, mains x=-0.35) -> from current AC.gear geometry
const m = 2250, W = m * g, xn = 2.30, xm = -0.35;
const fN = (0 - xm) / (xn - xm);           // nose share (level, geometric)
const WN = W * fN, WM = W * (1 - fN) / 2;  // per unit
// ---- strut model ----
// gas: F_a = p0*A*(V0/(V0 - A*s))^n  (NACA Rep. 1154 form, p0 = extended pressure), n = 1.12 dynamic, 1.0 static
// oil: F_h = Kh * sdot*|sdot| (compression), Kr*... (rebound, larger)   Kh = rho*Ah^3/(2*(Cd*An)^2)
// friction: F_f = mu_s * F_strut * sign(sdot) (lumped seal/bearing), small
export function strutForce(P, s, sd, nPoly = P.n) {
  const sc = Math.min(Math.max(s, 0), P.S * 0.999);
  const Fa = P.p0 * P.A * Math.pow(P.V0 / (P.V0 - P.A * sc), nPoly);
  const Fh = sd >= 0 ? P.Kh * sd * sd : -P.Kr * sd * sd;
  let F = Fa + Fh;
  F += P.muF * Math.abs(Fa) * Math.tanh(sd / 0.01);
  if (s > P.S) F += P.kStop * (s - P.S);           // bottoming (metal-to-metal), very stiff
  if (s < 0) F = P.kStop * s + 0;                   // top-out handled outside
  return F;
}
// Design: preload F_ext, static position frac of stroke (isothermal), polytropic n
export function designStrut({ Wst, S, Fext_ratio = 0.25, staticFrac = 0.70, n = 1.12, Kh, Kr, muF = 0.03, pExtPsi = null }) {
  // isothermal static: Wst = Fext * V0/(V0 - A s_st) -> V0/A = s_st * Wst/(Wst - Fext)
  const Fext = Fext_ratio * Wst, sst = staticFrac * S;
  const L0 = sst * Wst / (Wst - Fext);   // V0/A (gas column length at full extension)
  const p0 = pExtPsi ? pExtPsi * 6894.76 : 6.9e5; // choose extended pressure -> A
  const A = Fext / p0, V0 = L0 * A;
  return { S, A, V0, p0, n, Kh, Kr: Kr ?? 4 * Kh, muF, kStop: 5e7, L0, Fext, sst, Wst };
}
// tyre: F_t = kt*delta + ct*deltadot (delta>=0)
export function drop(P, T, { vs, liftFrac, Wst, mu = 12, dt = 1e-4, tEnd = 0.8 }) {
  const M = Wst / g;                       // sprung mass per unit (level static share)
  let zs = 0, vs_ = vs, zu = 0, vu = vs;   // positions down from first contact, velocities down
  let Fmax = 0, smax = 0, nTmax = 0, Ework = 0, sPrev = 0, Fpk_s = 0, tPk = 0, airborneAfter = false, inContact = true, bottom = false;
  const out = [];
  for (let t = 0; t < tEnd; t += dt) {
    const s = zs - zu, sd = vs_ - vu;               // strut closure
    const Fs = s > 0 || sd > 0 ? Math.max(0, strutForce(P, s, sd)) : 0;
    const dlt = zu, Ft = dlt > 0 ? Math.max(0, T.kt * dlt + T.ct * vu) : 0;
    if (s > P.S) bottom = true;
    // sprung: M a = M g (1-L) - Fs ; unsprung: mu a = mu g - Ft + Fs
    const as = g * (1 - liftFrac) - Fs / M;
    const au = g + (Fs - Ft) / mu;
    vs_ += as * dt; zs += vs_ * dt; vu += au * dt; zu += vu * dt;
    if (Ft > Fmax) { Fmax = Ft; tPk = t; }
    smax = Math.max(smax, s);
    if (t > 0.05 && Ft <= 0 && zu < -0.002) airborneAfter = true;
  }
  return { Fmax, nGround: Fmax / Wst, nInertia: Fmax / Wst + liftFrac, smax, tPk, bottom, airborneAfter };
}
// energy efficiency of strut at given drop (strut only): eta = int Fs ds / (Fsmax * smax)
export function strutEff(P, T, opts) {
  const { vs, liftFrac, Wst, mu = 12, dt = 1e-5 } = opts; const M = Wst / g;
  let zs = 0, v1 = vs, zu = 0, vu = vs, E = 0, Fm = 0, sm = 0, sP = 0;
  for (let t = 0; t < 0.5; t += dt) {
    const s = zs - zu, sd = v1 - vu;
    const Fs = s > 0 || sd > 0 ? Math.max(0, strutForce(P, s, sd)) : 0;
    const Ft = zu > 0 ? Math.max(0, T.kt * zu + T.ct * vu) : 0;
    v1 += (g * (1 - liftFrac) - Fs / M) * dt; zs += v1 * dt; vu += (g + (Fs - Ft) / mu) * dt; zu += vu * dt;
    const sN = zs - zu; if (sN > sP) E += Fs * (sN - sP); sP = Math.max(sP, sN);
    Fm = Math.max(Fm, Fs); sm = Math.max(sm, sN);
    if (v1 < 0 && t > 0.05) break;
  }
  return E / (Fm * sm);
}
const isMain = import.meta.url.endsWith(process.argv[1]?.split('/').pop());
if (isMain) {
  console.log(`W ${W.toFixed(0)} N, nose share ${(fN * 100).toFixed(1)}%, WN ${WN.toFixed(0)} N, WM ${WM.toFixed(0)} N per main`);
  // limit descent velocity per old 14 CFR 23.473(d): V = 4.4 (W/S)^0.25 fps, 7..10 fps
  const WSpsf = (m * 2.20462) / (16.3 * 10.7639);
  const Vfps = Math.min(10, Math.max(7, 4.4 * Math.pow(WSpsf, 0.25)));
  const hIn = Math.min(18.7, Math.max(9.2, 3.6 * Math.sqrt(WSpsf)));
  console.log(`W/S ${WSpsf.toFixed(1)} lb/ft2 -> 23.473 V = ${(4.4 * Math.pow(WSpsf, 0.25)).toFixed(2)} fps -> use ${Vfps} fps = ${(Vfps * 0.3048).toFixed(3)} m/s; 23.725 h = ${(3.6 * Math.sqrt(WSpsf)).toFixed(1)} in -> ${hIn} in -> v = ${Math.sqrt(2 * g * hIn * 0.0254).toFixed(3)} m/s; reserve 1.44h -> ${Math.sqrt(2 * g * 1.44 * hIn * 0.0254).toFixed(3)} m/s`);
  const vLim = Vfps * 0.3048, vRes = Math.sqrt(1.44) * vLim;
  // tyres (estimates): main 6.50-8 8PR @ 60 psi ~ kt 3.2e5 N/m; nose 5.00-5 6PR @ 45 psi ~ 1.6e5 N/m
  const TM = { kt: 3.2e5, ct: 600 }, TN = { kt: 1.6e5, ct: 300 };
  // search orifice coefficient for main strut, stroke 0.20 m
  for (const S of [0.18, 0.20, 0.22]) {
    let best = null;
    for (let Kh = 2e4; Kh <= 6e5; Kh *= 1.08) {
      const P = designStrut({ Wst: WM, S, Kh, pExtPsi: 150 });
      const r = drop(P, TM, { vs: vLim, liftFrac: 2 / 3, Wst: WM });
      if (r.bottom) continue;
      if (!best || r.nGround < best.r.nGround) best = { Kh, r, P };
    }
    const P = best.P, r = best.r, rr = drop(P, TM, { vs: vRes, liftFrac: 1.0, Wst: WM }), r3 = drop(P, TM, { vs: 3.0, liftFrac: 1.0, Wst: WM });
    console.log(`MAIN S ${S}: Kh ${best.Kh.toExponential(2)} N/(m/s)^2  A ${(P.A * 1e4).toFixed(2)} cm2 (d ${(Math.sqrt(4 * P.A / Math.PI) * 1000).toFixed(1)} mm) V0 ${(P.V0 * 1e6).toFixed(0)} cm3 L0 ${(P.L0).toFixed(3)} m | limit drop: n_ground ${r.nGround.toFixed(2)} n_inertia ${r.nInertia.toFixed(2)} smax ${(r.smax * 1000).toFixed(0)} mm (${(100 * r.smax / S).toFixed(0)}%) tPk ${(r.tPk * 1000).toFixed(0)} ms bounce ${r.airborneAfter} | reserve(L=1) n_g ${rr.nGround.toFixed(2)} smax ${(rr.smax * 1000).toFixed(0)} bottom ${rr.bottom} | 3.0 m/s L=1: n_g ${r3.nGround.toFixed(2)} smax ${(r3.smax * 1000).toFixed(0)} | eta ${strutEff(P, TM, { vs: vLim, liftFrac: 2 / 3, Wst: WM }).toFixed(2)}`);
  }
}
