#!/usr/bin/env node
// lt_oei.mjs — DA42 one-engine-inoperative (OEI) checks, 06-da42.md §06.6 and tests T-LT-13…19.  Run from the repo root:
//   node scripts/lt_oei.mjs            -> scripts/out/lt_oei.json
// Part A (static, no simulator): VMCA and the zero-sideslip bank from the card's lateral derivatives (lm_derivs, ค่าประมาณ),
//   BEM thrust per engine (lt_geom.json, ค่าประมาณ) and Raymer windmilling / feathered propeller drag (ค่าประมาณ).
//   Steady straight flight, small angles, body axes:  CYβ β + CYδr δr + CW sinφ = 0 ;  Clβ β + Clδa δa + Clδr δr + Cl_eng = 0 ;
//   Cnβ β + Cnδa δa + Cnδr δr + Cn_eng = 0,  Cn_eng = −(T_live + D_dead)·y_E/(qSb)  (left engine dead ⇒ nose left).
// Part B (current simulator + a test-only wrapper): today's src/20-flight.js has ONE thrust lever at the CG and no asymmetric
//   thrust. We wrap Aircraft.prototype.deriv (in this process only; the repo is not changed) to remove the left engine's thrust
//   (exponential spool-down, τ 0.3 s, ค่าประมาณ), add its propeller drag and the yaw moment −y_E(T_eng + D) about the CG, then
//   (1) fly a hands-off engine cut at VYSE, (2) solve the 6-DOF OEI trim (β = 0 and φ = 5°) with lm_card.f9, (3) OEI climb.
import fs from 'node:fs';
import { loadType, val } from './lm_lib.mjs';
import { loadSim, buildAC, applyAC, AC_R1, f9, solve, startTrimmed, trimThr, iasCas } from './lm_card.mjs';
const D2R = Math.PI / 180, R2D = 180 / Math.PI, KT = 0.514444, FT = 0.3048, G0 = 9.80665, RHO0 = 1.225;
const r = (x, n = 4) => (x == null || !isFinite(x) ? null : +(+x).toPrecision(n));
const geom = JSON.parse(fs.readFileSync(new URL('./out/lt_geom.json', import.meta.url), 'utf8'));
const S = 16.29, B = 13.42, YE = 1.70;                                          // TCDS [LT1]; y_E ค่าประมาณ (lt_geom)
const DQ = { windmill: geom.prop.drag.DoverQ_windmill_m2, feathered: geom.prop.drag.DoverQ_feathered_m2 };
const interp = (c, ktas, key) => { let i = 1; while (i < c.length - 1 && c[i].KTAS < ktas) i++; const a = c[i - 1], b = c[i]; return a[key] + (ktas - a.KTAS) / (b.KTAS - a.KTAS) * (b[key] - a[key]); };
const Tcurve = { ng: geom.prop.ng_e4_187, tdi: geom.prop.tdi_99kW_187, vi: geom.prop.vi_e4_190 };
const Pmax = { ng: 123.5e3, tdi: 99e3, vi: 123.5e3 }, RPM = { ng: 2300, tdi: 2300, vi: 2300 };

// ── card derivatives (cruise set = flaps UP; Cnδa scaled with CL: lm_derivs gives Cnδa ≈ −0.029·CL in both sets) ──
const ng = loadType('da42ng'), dv = n => val(ng, `aero.derivatives.${n}`)?.cruise;
const Dv = { CYb: dv('CYb'), CYdr: dv('CYdr'), Clb: dv('Clb'), Clda: dv('Clda'), Cldr: dv('Cldr'), Cnb: dv('Cnb'), Cndr: dv('Cndr'), Cnda_per_CL: -0.029 };
// ── engine-out rolling moment (ค่าประมาณ): torque of the live engine + its slipstream lift on the right wing ──
function engineRoll(V, T, P, rpm, CW, opt) {
  if (!opt.roll) return 0;
  const Q = P / (rpm * 2 * Math.PI / 60);                                         // reaction torque, CW prop (from behind) ⇒ roll left
  const q = 0.5 * RHO0 * V * V, A = geom.prop.drag.disk_m2, a = 0.5 * (Math.sqrt(1 + T / (q * A)) - 1);
  const qr = (1 + 1.6 * a) ** 2 - 1, Sslip = 1.87 * 0.93 * 1.45;                  // slipstream 1.6a at the wing c/4, 2.5 m² of wing
  const dL = 0.6 * CW * q * Sslip * qr;                                           // 0.6: lift-increment efficiency (ค่าประมาณ)
  return -(Q + dL * YE) / (q * S * B);
}
// solve [β, δa, δr] for given φ (or [φ, δa, δr] for β = 0)
function staticOEI({ kcas, mass, variant = 'ng', dead = 'windmill', phiDeg = 5, zeroBeta = false, roll = true, pf = 0, CndrScale = 1 }) {
  const V = kcas * KT, q = 0.5 * RHO0 * V * V, CW = mass * G0 / (q * S);
  const T = interp(Tcurve[variant], kcas, 'T_N'), Dd = q * DQ[dead];
  const Cn_eng = -(T + Dd) * (YE + pf) / (q * S * B), Cl_eng = engineRoll(V, T, Pmax[variant], RPM[variant], CW, { roll });
  const Cnda = Dv.Cnda_per_CL * CW, Cndr = Dv.Cndr * CndrScale, CYdr = Dv.CYdr * CndrScale;
  let x, phi;
  if (!zeroBeta) {
    phi = phiDeg * D2R;
    x = solve([[Dv.CYb, 0, CYdr], [Dv.Clb, Dv.Clda, Dv.Cldr], [Dv.Cnb, Cnda, Cndr]], [-CW * Math.sin(phi), -Cl_eng, -Cn_eng]);
    return { kcas, beta_deg: r(x[0] * R2D, 3), da_deg: r(x[1] * R2D, 3), dr_deg: r(x[2] * R2D, 3), phi_deg: phiDeg, T_live_N: Math.round(T), D_dead_N: Math.round(Dd), Cn_eng: r(Cn_eng), Cl_eng: r(Cl_eng), CW: r(CW) };
  }
  // β = 0: unknowns s = sinφ, δa, δr
  x = solve([[CW, 0, CYdr], [0, Dv.Clda, Dv.Cldr], [0, Cnda, Cndr]], [0, -Cl_eng, -Cn_eng]);
  return { kcas, phi_deg: r(Math.asin(x[0]) * R2D, 3), da_deg: r(x[1] * R2D, 3), dr_deg: r(x[2] * R2D, 3), beta_deg: 0, T_live_N: Math.round(T), D_dead_N: Math.round(Dd), Cn_eng: r(Cn_eng), Cl_eng: r(Cl_eng), CW: r(CW) };
}
// VMCA: lowest KCAS at which the rudder needed stays within drLim (right rudder, δr < 0)
function vmca(o, drLim = 29) {
  let lo = 40, hi = 120;
  for (let i = 0; i < 50; i++) { const m = 0.5 * (lo + hi), s = staticOEI({ ...o, kcas: m }); if (-s.dr_deg > drLim) lo = m; else hi = m; }
  const s = staticOEI({ ...o, kcas: hi }); return { VMCA_kcas: r(hi, 3), ...s };
}
const A = {};
A.derivs = { ...Object.fromEntries(Object.entries(Dv).map(([k, v]) => [k, r(v)])) };
const ref = { mass: 1900, variant: 'ng', dead: 'windmill', phiDeg: 5 };
A.vmca = {
  ng_1900_wm_5deg: vmca(ref),
  ng_1900_wm_5deg_yawOnly: vmca({ ...ref, roll: false }),
  ng_1900_wm_0deg: vmca({ ...ref, phiDeg: 0 }),
  ng_1510_wm_5deg: vmca({ ...ref, mass: 1510 }),
  ng_1900_feathered_5deg: vmca({ ...ref, dead: 'feathered' }),
  ng_1900_wm_5deg_Pfactor: vmca({ ...ref, pf: 0.075 }),                         // thrust centre 0.08 R outboard (ค่าประมาณ)
  ng_1900_wm_5deg_sim27: vmca(ref, 27),                                          // the sim's symmetric drMax
  tdi_1785_wm_5deg: vmca({ ...ref, mass: 1785, variant: 'tdi' }),
  vi_1999_wm_5deg: vmca({ ...ref, mass: 1999, variant: 'vi' }),
};
// rudder power needed for the DA42-VI to reach its TCDS VMCA 70 KEAS (MÄM 42-600 larger rudder) [LT1, LT6]
{ let lo = 1, hi = 2; for (let i = 0; i < 40; i++) { const m = 0.5 * (lo + hi); if (vmca({ ...ref, mass: 1999, variant: 'vi', CndrScale: m }).VMCA_kcas > 70) lo = m; else hi = m; }
  A.vi_rudder_scale_for_70 = r(hi, 3); }
// zero-sideslip bank at VYSE 85 KIAS (≈ 84.6 KCAS from ias_cas), MTOM, feathered (AFM OEI climb condition [LT5 p.5-23])
const vyseCas = iasCas(ng, 'UP').f(85);
A.zeroSideslip = {
  ng_1900_VYSE_feathered: staticOEI({ kcas: vyseCas, mass: 1900, dead: 'feathered', zeroBeta: true }),
  ng_1900_VYSE_feathered_yawOnly: staticOEI({ kcas: vyseCas, mass: 1900, dead: 'feathered', zeroBeta: true, roll: false }),
  ng_1510_VYSE_feathered: staticOEI({ kcas: vyseCas, mass: 1510, dead: 'feathered', zeroBeta: true }),
  ng_1900_VYSE_windmill: staticOEI({ kcas: vyseCas, mass: 1900, dead: 'windmill', zeroBeta: true }),
  ng_1900_VYSE_wingsLevel: staticOEI({ kcas: vyseCas, mass: 1900, dead: 'feathered', phiDeg: 0 }),
};

// ── OEI ceiling (analytic, not the sim): cruise polar (lt_polar) + feathered ΔCD + trim ΔCD, BEM η at MCP ──
const pol = JSON.parse(fs.readFileSync(new URL('./out/lt_polar.json', import.meta.url), 'utf8'));
const rhoISA = h => 1.225 * (1 - 2.25577e-5 * h) ** 4.2559;
function oeiROC(h, mass, { P = 114e3, hc = 16000 * FT, curve = Tcurve.ng, dCD = geom.prop.drag.dCD_feathered_onS + 0.002, kEta = 1 } = {}) {
  const rho = rhoISA(h), sig = rho / 1.225, Ph = h <= hc ? P : P * (rhoISA(h) / rhoISA(hc)) ** 1.1;
  let best = -1e9, Vb = 0;
  for (let kt = 60; kt <= 140; kt += 0.5) {                                       // kt = KTAS
    const V = kt * KT, q = 0.5 * rho * V * V, CL = mass * G0 / (q * S), CD = pol.CD0_mean + dCD + pol.oswald.K * CL * CL;
    const eta = kEta * interp(curve, kt, 'eta'), roc = (eta * Ph / V - q * S * CD) * V / (mass * G0);
    if (roc > best) { best = roc; Vb = kt * Math.sqrt(sig); }
  }
  return { roc_fpm: best / FT * 60, Vbest_keas: Vb };
}
function ceiling(mass, opt, target = 50) { let lo = 0, hi = 9000; for (let i = 0; i < 40; i++) { const m = 0.5 * (lo + hi); if (oeiROC(m, mass, opt).roc_fpm > target) lo = m; else hi = m; } return r(lo / FT, 3); }
A.ceiling = {
  note: 'ค่าประมาณ: เครื่องที่เหลือ MCP 114 kW คงที่ถึง h_c 16,000 ft (โบรชัวร์ DA42-VI: MCP ที่ 16,000 ft) แล้วลดตาม σ^1.1; ใบพัดซ้าย feather; trim ΔCD 0.002',
  vi_1999_service_ft: ceiling(1999, { curve: Tcurve.vi }), vi_1999_absolute_ft: ceiling(1999, { curve: Tcurve.vi }, 0),
  ng_1900_service_ft: ceiling(1900, {}), ng_1900_SL_MCP_fpm: Math.round(oeiROC(0, 1900).roc_fpm), ng_1900_SL_max_fpm: Math.round(oeiROC(0, 1900, { P: 123.5e3 }).roc_fpm),
  tdi_1785_SL_fpm: Math.round(oeiROC(0, 1785, { P: 99e3, curve: Tcurve.tdi }).roc_fpm),
  tdi_1785_service_ft_hc0: ceiling(1785, { P: 99e3, curve: Tcurve.tdi, hc: 0 }),
};
// consistency check between two independent published numbers: scale the installed η (k_η) so that the NG OEI climb at SL
// (1,900 kg, live engine MAX 123.5 kW, feathered) = 210 fpm [LT10], then predict the DA42-VI OEI ceiling (MCP) vs 16,000 ft [LT6]
{ let lo = 0.6, hi = 1.0; for (let i = 0; i < 40; i++) { const m = 0.5 * (lo + hi); if (oeiROC(0, 1900, { P: 123.5e3, kEta: m }).roc_fpm > 210) hi = m; else lo = m; }
  const k = 0.5 * (lo + hi); A.ceiling.kEta_for_210fpm = r(k, 3);
  A.ceiling.vi_1999_service_ft_calibrated = ceiling(1999, { curve: Tcurve.vi, kEta: k });
  A.ceiling.vi_1999_absolute_ft_calibrated = ceiling(1999, { curve: Tcurve.vi, kEta: k }, 0);
  A.ceiling.ng_1900_service_ft_calibrated = ceiling(1900, { kEta: k }); }

// ── Part B: current simulator with the test-only OEI wrapper ──
const M = await loadSim();
Object.assign(AC_R1, { deUp: 15.5 * D2R, deDn: 13 * D2R, daMax: 20 * D2R, drMax: 27 * D2R });   // lm_card travel-path workaround (see lt_run.mjs)
const card = structuredClone(ng); if (card.aero?.legacy?.v) card.aero.legacy.v.Cma = -1.10;
const ac0 = buildAC(card, { mass: 1900 }), restore = applyAC(M, ac0);
const orig = M.Aircraft.prototype.deriv;
M.Aircraft.prototype.deriv = function (s, out, diag) {
  const d = diag || this._d || (this._d = { wow: [0, 0, 0], load: [0, 0, 0] });
  orig.call(this, s, out, d);
  const o = this.oei; if (!o || this.t < o.t0) return;
  const k = Math.exp(-(this.t - o.t0) / o.tau), Teng = 0.5 * d.T, Dd = d.qbar * DQ[o.dead];
  const dFx = -(1 - k) * (Teng + Dd), R = this.R;                                // this.R = body→NED of s (set by orig)
  const dMz = YE * dFx, dMx = o.roll ? (1 - k) * (engineRoll(d.V, Teng, Pmax.ng * this.thr, 2300, M.AC.m * G0 / (d.qbar * S), { roll: true }) * d.qbar * S * B) : 0;
  out[3] += R[0] * dFx / M.AC.m; out[4] += R[3] * dFx / M.AC.m; out[5] += R[6] * dFx / M.AC.m;
  const Ii = M.AC.Iinv; out[10] += Ii[0] * dMx + Ii[2] * dMz; out[12] += Ii[6] * dMx + Ii[8] * dMz;
};
const B_ = {};
// (1) hands-off engine cut at VYSE in a full-power climb (both levers stay at MAX, controls fixed at the pre-cut trim)
{
  const h = 1000 * FT, cl = trimThr(M, vyseCas, 1, 0, 0, h);
  const { ac } = startTrimmed(M, { ias: vyseCas, h, flaps: 0, gear: 0, gammaDeg: cl.gamma });
  ac.cmd.thr = 1; ac.thr = 1;
  ac.oei = { t0: ac.t + 1, tau: 0.3, dead: 'windmill', roll: true };
  const a = ac.air, psi0 = a.psi, rows = []; let rdot0 = null, rPrev = null;
  const dt = 1 / 240;
  while (ac.t < ac.oei.t0 + 5) {
    ac.step(dt);
    const tc = ac.t - ac.oei.t0;
    if (tc > 0.98 && tc < 1.0 + dt && rdot0 == null) rdot0 = null;
    if (Math.abs(tc - 0.5) < dt / 2 && rPrev != null) rdot0 = (a.r - rPrev) / dt;
    rPrev = a.r;
    for (const tt of [1, 2, 3, 5]) if (Math.abs(tc - tt) < dt / 2) rows.push({ t_s: tt, dpsi_deg: r((a.psi - psi0) * R2D, 3), phi_deg: r(a.phi * R2D, 3), beta_deg: r(a.beta * R2D, 3), r_dps: r(a.r * R2D, 3), p_dps: r(a.p * R2D, 3), ias_kt: r(a.ias / KT, 3) });
  }
  // analytic initial yaw acceleration (dead engine fully spooled down, before any sideslip builds up)
  const q = 0.5 * RHO0 * (vyseCas * KT) ** 2, T2 = 0.5 * (M.AC.T0 * (M.AC.eta * M.AC.P / M.AC.T0) / Math.hypot(vyseCas * KT, M.AC.eta * M.AC.P / M.AC.T0));
  B_.cut_VYSE = { trim_climb: { kcas: r(vyseCas, 3), gamma_deg: r(cl.gamma, 3), roc_fpm: Math.round(cl.roc_fpm) }, rows,
    rdot_expected_dps2: r(-(T2 + q * DQ.windmill) * YE / M.AC.Izz * R2D, 3), rdot_at_0p5s_dps2: r(rdot0 * R2D, 3) };
}
// (1b) instant cut (τ → 0, no roll term): the first-step yaw acceleration must equal Iinv·N, N = −y_E(T_eng + D_windmill)
{
  const h = 1000 * FT, cl = trimThr(M, vyseCas, 1, 0, 0, h);
  const { ac } = startTrimmed(M, { ias: vyseCas, h, flaps: 0, gear: 0, gammaDeg: cl.gamma });
  ac.cmd.thr = 1; ac.thr = 1; const dt = 1 / 240;
  for (let i = 0; i < 24; i++) ac.step(dt);
  const d = { wow: [0, 0, 0], load: [0, 0, 0] }, o = new Float64Array(13); orig.call(ac, ac.x, o, d);
  const N = -YE * (0.5 * d.T + d.qbar * DQ.windmill), rdotExp = M.AC.Iinv[8] * N + o[12];
  ac.oei = { t0: ac.t - 1e-6, tau: 1e-12, dead: 'windmill', roll: false };
  const r0 = ac.air.r; ac.step(dt); const rdot = (ac.air.r - r0) / dt;
  B_.instant_cut = { N_Nm: Math.round(N), rdot_expected_dps2: r(rdotExp * R2D, 4), rdot_sim_dps2: r(rdot * R2D, 4) };
}
// (1c) cut at VYSE with a 1 s recognition delay, then a simple pilot (heading hold with rudder, bank 3° toward the live engine)
{
  const h = 1000 * FT, cl = trimThr(M, vyseCas, 1, 0, 0, h);
  const { ac } = startTrimmed(M, { ias: vyseCas, h, flaps: 0, gear: 0, gammaDeg: cl.gamma });
  ac.cmd.thr = 1; ac.thr = 1; const dt = 1 / 240, a = ac.air, psi0 = a.psi, t0 = ac.t + 1, AC = M.AC;
  ac.oei = { t0, tau: 0.3, dead: 'windmill', roll: true };
  let maxPsi = 0, maxPhi = 0, last = null;
  while (ac.t < t0 + 20) {
    if (ac.t > t0 + 1) {
      const ep = psi0 - a.psi;
      ac.cmd.dr = Math.max(-AC.drMax, Math.min(AC.drMax, -2.0 * ep + 1.0 * a.r));
      ac.cmd.da = Math.max(-AC.daMax, Math.min(AC.daMax, 1.25 * (3 * D2R - a.phi) - 0.28 * a.p));
    }
    ac.step(dt);
    if (ac.t > t0) { maxPsi = Math.max(maxPsi, Math.abs(a.psi - psi0)); maxPhi = Math.max(maxPhi, Math.abs(a.phi)); }
    last = { dpsi_deg: r((a.psi - psi0) * R2D, 3), phi_deg: r(a.phi * R2D, 3), beta_deg: r(a.beta * R2D, 3), dr_deg: r(ac.dr * R2D, 3), da_deg: r(ac.da * R2D, 3), ias_kt: r(a.ias / KT, 3) };
  }
  B_.cut_VYSE_recovery = { delay_s: 1, max_dpsi_deg: r(maxPsi * R2D, 3), max_bank_deg: r(maxPhi * R2D, 3), after20s: last };
}
// (2) 6-DOF OEI trims with f9: unknowns [α, θ, δe, δa, δr, φ|β], residuals body accelerations + angular accelerations = 0
function oeiTrim(kcas, { dead = 'feathered', zeroBeta = true, phiDeg = 5, h = 30 } = {}) {
  const ac = new M.Aircraft(); ac.flaps = 0; ac.gearPos = 0; ac.thr = 1; ac.adot = 0; ac.t = 10; ac.oei = { t0: -1e9, tau: 0.3, dead, roll: true };
  const rho = M.atmosphere(M.FIELD.elev + h, 0).rho, V = kcas * KT / Math.sqrt(rho / RHO0);
  const st = x => { const [al, th, de, da, dr, z] = x, be = zeroBeta ? 0 : z, ph = zeroBeta ? z : phiDeg * D2R;
    ac.de = de; ac.da = da; ac.dr = dr; return f9(ac, [V * Math.cos(al) * Math.cos(be), V * Math.sin(be), V * Math.sin(al) * Math.cos(be), 0, 0, 0, ph, th, 0], h); };
  const res = x => st(x).slice(0, 6);
  let x = [5 * D2R, 6 * D2R, -5 * D2R, 0, -10 * D2R, zeroBeta ? 2 * D2R : 0];
  for (let it = 0; it < 40; it++) { const f0 = res(x), J = [...Array(6)].map(() => []);
    for (let j = 0; j < 6; j++) { const xp = x.slice(); xp[j] += 1e-6; const f1 = res(xp); for (let i = 0; i < 6; i++) J[i][j] = (f1[i] - f0[i]) / 1e-6; }
    const dx = solve(J, f0.map(v => -v)); x = x.map((v, i) => v + dx[i]); if (Math.hypot(...dx) < 1e-11) break; }
  const [al, th, de, da, dr, z] = x, be = zeroBeta ? 0 : z, ph = zeroBeta ? z : phiDeg * D2R;
  // climb gradient from the NED velocity of the trimmed state
  const ca = Math.cos(al), sa = Math.sin(al), cb = Math.cos(be), sb = Math.sin(be), u = V * ca * cb, v = V * sb, w = V * sa * cb;
  const sph = Math.sin(ph), cph = Math.cos(ph), sth = Math.sin(th), cth = Math.cos(th);
  const vd = -sth * u + cth * sph * v + cth * cph * w;
  return { kcas, alpha_deg: r(al * R2D, 3), theta_deg: r(th * R2D, 3), de_deg: r(de * R2D, 3), da_deg: r(da * R2D, 3), dr_deg: r(dr * R2D, 3), beta_deg: r(be * R2D, 3), phi_deg: r(ph * R2D, 3), roc_fpm: Math.round(-vd / FT * 60), dr_saturated: Math.abs(dr * R2D) > 27 };
}
B_.trim = {
  VYSE_feathered_zeroBeta: oeiTrim(vyseCas, {}),
  VYSE_windmill_zeroBeta: oeiTrim(vyseCas, { dead: 'windmill' }),
  VYSE_feathered_phi5: oeiTrim(vyseCas, { zeroBeta: false }),
  VYSE_feathered_wingsLevel: oeiTrim(vyseCas, { zeroBeta: false, phiDeg: 0 }),
};
// sim VMCA: lowest KCAS where the trimmed rudder is within the sim's ±27° at φ = 5°, windmilling
{ let lo = 50, hi = 100; for (let i = 0; i < 30; i++) { const m = 0.5 * (lo + hi); if (Math.abs(oeiTrim(m, { dead: 'windmill', zeroBeta: false }).dr_deg) > 27) lo = m; else hi = m; }
  B_.vmca_sim_phi5_wm = { VMCA_kcas: r(hi, 3), ...oeiTrim(hi, { dead: 'windmill', zeroBeta: false }) }; }
// best OEI rate in the sim (feathered, β = 0), sweep
{ const rows = []; for (let v = 72; v <= 100; v += 2) rows.push(oeiTrim(v, {})); B_.oei_climb_sweep = rows.map(x => [x.kcas, x.roc_fpm]); B_.oei_best = rows.reduce((a, b) => (b.roc_fpm > a.roc_fpm ? b : a)); }
M.Aircraft.prototype.deriv = orig; restore();
const out = { static: A, sim: B_, vyse_kcas: r(vyseCas, 3) };
fs.writeFileSync(new URL('./out/lt_oei.json', import.meta.url), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
