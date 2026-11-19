#!/usr/bin/env node
// lm_prop.mjs — blade-element momentum (BEM) propeller tables for light aircraft (01-methods.md §01.7). Library + CLI.
// Rewritten from the equations of round-1 03-propeller.md §3.3 (Prandtl tip loss, Beard–McLain section stall blend,
// Snel stall delay); no code copied. Geometry of real blades is not public: chord and section data are ESTIMATES.
//   node scripts/lm_prop.mjs fixed   [--json]   C172S-class 2-blade fixed pitch, 76 in, 60 in pitch: CT/CP(J), static rpm
//   node scripts/lm_prop.mjs cs      [--json]   DA40 NG-class 3-blade constant speed, 1.90 m: CT/CP(J, beta75), static thrust
import { isMainModule } from './lm_lib.mjs';
import { isa, powerIndFriction } from './lm_engine.mjs';
const DEG = Math.PI / 180, RAD = 180 / Math.PI, IN = 0.0254, HP = 745.69987, KT = 0.514444;
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const interp = (xs, ys, x) => { if (x <= xs[0]) return ys[0]; for (let i = 1; i < xs.length; i++) if (x <= xs[i]) return ys[i - 1] + (x - xs[i - 1]) / (xs[i] - xs[i - 1]) * (ys[i] - ys[i - 1]); return ys[ys.length - 1]; };

// generic GA metal blade planform (chord/D vs r/R), ESTIMATE (activity factor ≈ 90)
const GA_CX = [0.15, 0.25, 0.35, 0.45, 0.60, 0.75, 0.85, 0.93, 1.00];
const GA_CD = [0.050, 0.060, 0.068, 0.072, 0.073, 0.068, 0.060, 0.050, 0.032];
export const PROPS = {
  fixed_76x60: { kind: 'fixed', B: 2, D: 76 * IN, xh: 0.15, pitch_m: 60 * IN, cx: GA_CX, cD: GA_CD,
    cla: 2 * Math.PI * 0.90, a0: -3.5 * DEG, aStallP: 14 * DEG, aStallN: -10 * DEG, cd0: 0.010, kcd: 0.012, clmd: 0.4,
    note: 'McCauley 1A170E/JHA7660 class (C172S, TCDS IM.A.051): 76 in, 60 in pitch at 0.75R; constant geometric pitch, Clark-Y-like section (ค่าประมาณ)' },
  cs3_190: { kind: 'constant_speed', B: 3, D: 1.90, xh: 0.18, Jd: 0.95, cx: GA_CX, cD: GA_CD.map(c => c * 0.85),
    cla: 2 * Math.PI * 0.90, a0: -3.0 * DEG, aStallP: 14 * DEG, aStallN: -10 * DEG, cd0: 0.010, kcd: 0.012, clmd: 0.4,
    note: 'MT 3-blade constant speed class (DA40 NG), D 1.90 m from model designation 190 (ค่าประมาณ), helical twist for J 0.95' },
};
export const chordAt = (x, P) => interp(P.cx, P.cD, x) * P.D * (P.chordScale ?? 1);
/** blade angle at x for blade angle beta75 (fixed pitch: from pitch length; cs: helical twist about 0.75R) */
export function bladeAngle(x, P, beta75) {
  if (P.kind === 'fixed') return Math.atan(P.pitch_m / (Math.PI * P.D * x)) + (beta75 != null ? beta75 - Math.atan(P.pitch_m / (Math.PI * P.D * 0.75)) : 0);
  return beta75 + Math.atan(P.Jd / (Math.PI * x)) - Math.atan(P.Jd / (Math.PI * 0.75));
}
/** section cl, cd: linear lift with Prandtl–Glauert, blended (Beard–McLain, width 1/Mb rad) to a flat plate beyond stall */
export function section(a, Ma, P, cr) {
  const pg = 1 / Math.sqrt(1 - Math.min(Ma, 0.8) ** 2), clLin = P.cla * pg * (a - P.a0), Mb = P.Mb ?? 25;
  const s = Math.max(1 / (1 + Math.exp(-Mb * (a - P.aStallP))), 1 / (1 + Math.exp(Mb * (a - P.aStallN))));
  const sa = Math.sin(a), ca = Math.cos(a);
  let cl = (1 - s) * clLin + s * 2 * sa * ca;
  const cd = (1 - s) * (P.cd0 + P.kcd * (clLin - P.clmd) ** 2) + s * (P.cd0 + 1.9 * sa * sa);
  if (Math.abs(a) < 30 * DEG) cl += 3 * cr * cr * (clLin - cl);   // Snel et al. rotational stall delay
  return { cl, cd: cd + (Ma > 0.78 ? 20 * (Ma - 0.78) ** 4 : 0) };
}
function annulus(V, Om, r, c, th, P, a_s) {
  const R = P.D / 2, sig = P.B * c / (2 * Math.PI * r);
  const ev = phi => {
    const sp = Math.sin(phi), cp = Math.cos(phi), f = (P.B / 2) * (R - r) / (r * Math.max(Math.abs(sp), 1e-6));
    const F = Math.max((2 / Math.PI) * Math.acos(clamp(Math.exp(-f), 0, 1)), 1e-4);
    const { cl, cd } = section(th - phi, Math.hypot(V, Om * r) / a_s, P, c / r);
    const Cy = cl * cp - cd * sp, Cx = cl * sp + cd * cp, ka = sig * Cy / (4 * F * sp * sp), kt = sig * Cx / (4 * F * sp * cp);
    return { res: sp * (1 - ka) - (V / (Om * r)) * cp * (1 + kt), Cy, Cx, kt };
  };
  let lo = 1e-4, flo = ev(lo).res, phi = null;
  for (let i = 1; i <= 240; i++) { const hi = 1e-4 + (Math.PI / 2 - 2e-4) * i / 240, fhi = ev(hi).res;
    if (flo <= 0 && fhi > 0) { let a = lo, b = hi; for (let k = 0; k < 50; k++) { const m = 0.5 * (a + b); if (ev(m).res > 0) b = m; else a = m; } phi = 0.5 * (a + b); break; }
    lo = hi; flo = fhi; }
  if (phi === null) phi = Math.max(1e-3, Math.atan2(V, Om * r));
  const e = ev(phi), Wt = Om * r / (1 + e.kt), W = Wt / Math.cos(phi), q = 0.5 * W * W * c;
  return { dT: P.B * q * e.Cy, dQ: P.B * q * e.Cx * r };      // per unit density
}
/** CT, CP, eta at advance ratio J; beta75 (rad) for constant speed (fixed: null) */
export function bem(P, J, { beta75 = null, n = 40, a_s = 340.3, N = 30 } = {}) {
  const R = P.D / 2, Om = 2 * Math.PI * n, V = J * n * P.D; let T = 0, Q = 0;
  for (let i = 0; i < N; i++) { const x = P.xh + (1 - P.xh) * (i + 0.5) / N, r = x * R, dr = (1 - P.xh) * R / N;
    const s = annulus(V, Om, r, chordAt(x, P), bladeAngle(x, P, beta75), P, a_s); T += s.dT * dr; Q += s.dQ * dr; }
  const CT = T / (n * n * P.D ** 4), CP = 2 * Math.PI * Q / (n * n * P.D ** 5);
  return { J, CT, CP, eta: CP > 1e-6 && CT > 0 ? J * CT / CP : 0 };
}
/** full-throttle static rpm of a fixed-pitch prop on a naturally aspirated engine (ind_friction model) */
export function staticRpm(P, { P_rated_W = 180 * HP, rpm_rated = 2700, h_m = 0, dT = 0, f = 0.10, cp0 = null } = {}) {
  const a = isa(h_m, dT), CP0 = cp0 ?? bem(P, 0, { n: 2350 / 60 }).CP;
  let lo = 1200, hi = 3200;
  for (let k = 0; k < 60; k++) { const N = 0.5 * (lo + hi), n = N / 60;
    const Pe = P_rated_W * powerIndFriction({ delta: a.delta, theta: a.theta, rpmFrac: N / rpm_rated, f });
    const Pp = CP0 * a.rho * n ** 3 * P.D ** 5; if (Pp > Pe) hi = N; else lo = N; }
  const N = 0.5 * (lo + hi), n = N / 60, CT0 = bem(P, 0, { n }).CT;
  return { rpm: N, CP0, CT0, T0_N: CT0 * a.rho * n * n * P.D ** 4, P_W: CP0 * a.rho * n ** 3 * P.D ** 5 };
}
/** scale the (estimated) chord so the full-throttle static rpm equals a target (e.g. TCDS mid-range) */
export function calibrateChord(P, targetRpm, opt = {}) {
  let lo = 0.6, hi = 1.6;
  for (let k = 0; k < 30; k++) { const m = 0.5 * (lo + hi); const r = staticRpm({ ...P, chordScale: m }, opt).rpm; if (r > targetRpm) lo = m; else hi = m; }
  return 0.5 * (lo + hi);
}
/** momentum-theory figure of merit FM = T^1.5 / (P √(2ρA)) */
export const figureOfMerit = (T, Pw, rho, D) => Math.pow(T, 1.5) / (Pw * Math.sqrt(2 * rho * Math.PI * D * D / 4));
/** blade angle that absorbs P_W at J and rpm (constant speed) */
export function betaForPower(P, J, { P_W, rpm, rho = 1.225 }) {
  const n = rpm / 60, CPreq = P_W / (rho * n ** 3 * P.D ** 5); let lo = 5 * DEG, hi = 50 * DEG;
  for (let k = 0; k < 40; k++) { const m = 0.5 * (lo + hi); if (bem(P, J, { beta75: m, n }).CP > CPreq) hi = m; else lo = m; }
  const b = 0.5 * (lo + hi); return { beta75_deg: b * RAD, ...bem(P, J, { beta75: b, n }), CPreq };
}
// JSBSim 1.3.3 engine/prop_75in2f.xml (active tables), numbers read from the model for cross-checking (LM8)
export const JSB_75IN2F = { J: [0, 0.2, 0.4, 0.6, 0.8, 1.0], CT: [0.073, 0.072, 0.069, 0.062, 0.045, 0.024], CP: [0.066, 0.070, 0.060, 0.0501, 0.0426, 0.0282] };

export function tests() {
  const P0 = PROPS.fixed_76x60, s0 = staticRpm(P0), k = calibrateChord(P0, 2350), P = { ...P0, chordScale: k };
  const s = staticRpm(P), sj = staticRpm(P0, { cp0: JSB_75IN2F.CP[0] }), hot = staticRpm(P, { h_m: 3, dT: 20 });
  const pk = [0.5, 0.6, 0.7, 0.75, 0.8, 0.85].map(J => bem(P, J)).reduce((a, b) => (b.eta > a.eta ? b : a));
  const C = PROPS.cs3_190, st = betaForPower(C, 0, { P_W: 123.5e3, rpm: 2300 }), n = 2300 / 60, Tcs = st.CT * 1.225 * n * n * C.D ** 4;
  return [
    { id: 'T-LM-17', what: 'BEM (uncalibrated) static rpm SL ISA vs TCDS mid ±5 %', got: s0.rpm, exp: 2350, tol: 118 },
    { id: 'T-LM-17', what: 'chord scale fitted to 2350 static rpm', got: k, exp: 1.08, tol: 0.03 },
    { id: 'T-LM-17', what: 'JSBSim prop_75in2f CP0 → static rpm (below TCDS)', got: sj.rpm, exp: 2245, tol: 15 },
    { id: 'T-LM-17', what: 'static rpm VTBD 35 °C minus SL ISA', got: hot.rpm - s.rpm, exp: 35, tol: 15 },
    { id: 'T-LM-18', what: 'fixed-pitch static FM (0.55–0.75 physical)', got: figureOfMerit(s.T0_N, s.P_W, 1.225, P.D), exp: 0.66, tol: 0.03 },
    { id: 'T-LM-18', what: 'fixed-pitch peak eta (metal props 0.80–0.88)', got: pk.eta, exp: 0.849, tol: 0.03 },
    { id: 'T-LM-18', what: 'MT 3-blade class static thrust 123.5 kW 2300 rpm N', got: Tcs, exp: 3500, tol: 500 },
  ];
}

if (isMainModule(import.meta.url)) {
  const which = process.argv[2] || 'fixed', json = process.argv.includes('--json'), f = (x, n = 4) => (+x).toFixed(n), out = {};
  if (which === 'fixed') {
    const P = { ...PROPS.fixed_76x60, chordScale: calibrateChord(PROPS.fixed_76x60, 2350) }; out.note = P.note + `; chord ×${(P.chordScale).toFixed(3)} fitted to static 2350 rpm`; out.chordScale = P.chordScale; out.beta75_deg = Math.atan(P.pitch_m / (Math.PI * P.D * 0.75)) * RAD;
    out.table = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map(J => bem(P, J, { n: 2400 / 60 }));
    out.static_SL = staticRpm(P); out.static_VTBD35 = staticRpm(P, { h_m: 3, dT: 20 }); out.static_jsbCP0 = staticRpm(P, { cp0: JSB_75IN2F.CP[0] });
    out.FM = figureOfMerit(out.static_SL.T0_N, out.static_SL.P_W, 1.225, P.D); out.jsb = JSB_75IN2F;
    if (!json) { console.log(`# ${P.note}\nbeta75 ${f(out.beta75_deg, 2)} deg\nJ     CT      CP      eta     | JSBSim CT  CP`);
      for (const r of out.table) { const i = JSB_75IN2F.J.indexOf(+r.J.toFixed(1)); console.log(`${f(r.J, 1)}   ${f(r.CT)}  ${f(r.CP)}  ${f(r.eta, 3)}   ${i >= 0 ? `| ${JSB_75IN2F.CT[i]}  ${JSB_75IN2F.CP[i]}` : ''}`); }
      console.log(`static SL ISA: ${f(out.static_SL.rpm, 0)} rpm, T0 ${f(out.static_SL.T0_N, 0)} N (${f(out.static_SL.T0_N / 4.44822, 0)} lbf), P ${f(out.static_SL.P_W / HP, 1)} hp, FM ${f(out.FM, 3)}`);
      console.log(`static VTBD 35 °C: ${f(out.static_VTBD35.rpm, 0)} rpm, T0 ${f(out.static_VTBD35.T0_N, 0)} N; with JSBSim CP0: ${f(out.static_jsbCP0.rpm, 0)} rpm (TCDS: 2300–2400)`); }
  } else {
    const P = PROPS.cs3_190; out.note = P.note; out.table = {};
    for (const b of [15, 20, 25, 30, 35]) out.table[b] = [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2].map(J => bem(P, J, { beta75: b * DEG, n: 2300 / 60 }));
    out.static = betaForPower(P, 0, { P_W: 123.5e3, rpm: 2300 }); const n = 2300 / 60;
    out.static.T_N = out.static.CT * 1.225 * n * n * P.D ** 4; out.static.FM = figureOfMerit(out.static.T_N, 123.5e3, 1.225, P.D);
    const J130 = 130 * 1.852 / 3.6 / ((2200 / 60) * P.D); out.cruise130 = { J: J130, ...betaForPower(P, J130, { P_W: 0.75 * 123.5e3, rpm: 2200, rho: isa(6000 * 0.3048).rho }) };
    if (!json) { console.log(`# ${P.note}`); for (const [b, rows] of Object.entries(out.table)) console.log(`beta75 ${b}: ` + rows.map(r => `J ${f(r.J, 1)} CT ${f(r.CT)} CP ${f(r.CP)} η ${f(r.eta, 2)}`).join(' | '));
      console.log(`static 123.5 kW 2300 rpm SL: beta75 ${f(out.static.beta75_deg, 1)} deg, T ${f(out.static.T_N, 0)} N, FM ${f(out.static.FM, 3)}`);
      console.log(`cruise 130 KTAS 6000 ft 75 % 2200 rpm: J ${f(out.cruise130.J, 3)}, beta75 ${f(out.cruise130.beta75_deg, 1)} deg, eta ${f(out.cruise130.eta, 3)} (ค่าประมาณ)`); }
  }
  if (json) console.log(JSON.stringify(out, (k, v) => (typeof v === 'number' ? +v.toPrecision(5) : v), 1));
}
