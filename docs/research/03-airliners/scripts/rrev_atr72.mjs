// rrev_atr72.mjs — ผู้ตรวจทานอิสระ หัวข้อ 3.1 ATR 72-600 (2026-11-18)
// คำนวณซ้ำค่าคาดหวังของกรณีทดสอบและค่าที่ได้จากสมการ โดยไม่ใช้โค้ดของผู้วิจัย
// รัน: node scripts/rrev_atr72.mjs
const KT = 1852 / 3600, FT = 0.3048, G = 9.80665, LBF = 4.4482216, SHP = 745.69987, LB = 0.45359237;
const R = 287.05287, GAM = 1.4;
const f = (x, d = 3) => Number(x.toFixed(d));
// ISA troposphere
const isa = (h, dT = 0) => { const T0 = 288.15 - 0.0065 * h; const p = 101325 * Math.pow(T0 / 288.15, 5.25588); const T = T0 + dT; return { T, p, rho: p / (R * T), a: Math.sqrt(GAM * R * T) }; };
const sl = isa(0);
const S = 61.0, b = 27.05, D = 3.93, L = 27.166;
const out = {};

// ---- 1. engine ratings / torque
const P = { NTO: 1846e3, RTO: 2051e3, MCT: 1864e3, CLB: 2192 * SHP, CRZ: 2132 * SHP };
const w100 = 2 * Math.PI * 1200 / 60;
const Q100 = P.RTO / w100;
out.engine = {
  shp_to_kW: { NTO: f(2475 * SHP / 1e3, 1), RTO: f(2750 * SHP / 1e3, 1), MCT: f(2500 * SHP / 1e3, 1), CLB: f(P.CLB / 1e3, 1), CRZ: f(P.CRZ / 1e3, 1) },
  Q100_Nm: f(Q100, 1), Q100_lbfft: f(Q100 / (LBF * FT), 0), Qlim_over_1063: f(17354 / 1.063, 1),
  diff_pct: f((17354 / 1.063 - Q100) / Q100 * 100, 3),
  pctTQ: { NTO: f(P.NTO / P.RTO * 100, 2), MCT: f(P.MCT / P.RTO * 100, 2), CLB_Np82: f(P.CLB / (P.RTO * 0.82) * 100, 2), CRZ_Np82: f(P.CRZ / (P.RTO * 0.82) * 100, 2) },
  transient_pct: f(19578 / Q100 * 100, 2), NTO_torque_Nm: f(P.NTO / w100, 0),
  Ng100: f(34360 / 1.027, 0), NL100: f(28870 / 1.042, 0), Np82_rpm: 0.82 * 1200, Np70_8_rpm: f(0.708 * 1200, 0),
  ovsp_rpm: [1.02 * 1200, 1.06 * 1200],
};

// ---- 2. propeller static thrust (momentum + FM), coefficients
const A = Math.PI * D * D / 4;
const Tid = (Pw, rho) => Math.cbrt(2 * rho * A * Pw * Pw);
const T_FM = (Pw, rho, FM) => Math.cbrt(2 * rho * A * (FM * Pw) ** 2);
const rho31 = 101325 / (R * (273.15 + 31));
out.prop_static = {
  A: f(A, 3), Tideal_NTO_kN: f(Tid(P.NTO, sl.rho) / 1e3, 2), T_FM070: f(T_FM(P.NTO, sl.rho, 0.70) / 1e3, 2), T_FM075: f(T_FM(P.NTO, sl.rho, 0.75) / 1e3, 2),
  T_FM080: f(T_FM(P.NTO, sl.rho, 0.80) / 1e3, 2), T_FM075_lbf: f(T_FM(P.NTO, sl.rho, 0.75) / LBF, 0), lbf_per_shp: f(T_FM(P.NTO, sl.rho, 0.75) / LBF / 2475, 3),
  rho31C_SL: f(rho31, 4), T_FM075_31C: f(T_FM(P.NTO, rho31, 0.75) / 1e3, 2),
  Tideal_RTO: f(Tid(P.RTO, sl.rho) / 1e3, 2), T_RTO_FM075: f(T_FM(P.RTO, sl.rho, 0.75) / 1e3, 2), T_RTO_FM075_lbf: f(T_FM(P.RTO, sl.rho, 0.75) / LBF, 0),
  CP_static: f(P.NTO / (sl.rho * 20 ** 3 * D ** 5), 4), CT_static: f(T_FM(P.NTO, sl.rho, 0.75) / (sl.rho * 20 ** 2 * D ** 4), 4), tipMach_static: f(Math.PI * 20 * D / sl.a, 4),
};
// helper: momentum ideal efficiency for given T, V
const etaIdealFromP = (Pw, V, rho) => { // solve P*eta_i = T V, T = 2 rho A (V+vi) vi, eta_i = V/(V+vi)
  let lo = 0, hi = 200; for (let i = 0; i < 200; i++) { const vi = (lo + hi) / 2; const T = 2 * rho * A * (V + vi) * vi; if (T * (V + vi) > Pw) hi = vi; else lo = vi; }
  const vi = (lo + hi) / 2; return V / (V + vi);
};
const cond = (name, Vtas, Np, Pw, atm) => { const n = 1200 * Np / 60; const J = Vtas / (n * D); const tip = Math.hypot(Math.PI * n * D, Vtas) / atm.a; const CP = Pw / (atm.rho * n ** 3 * D ** 5); const ei = etaIdealFromP(Pw, Vtas, atm.rho); const eta = 0.9 * ei; return { name, J: f(J, 3), tipM: f(tip, 3), CP: f(CP, 3), eta_ideal: f(ei, 3), eta: f(eta, 3), T_kN: f(eta * Pw / Vtas / 1e3, 2) }; };
const fl170 = isa(17000 * FT);
out.prop_table = [
  cond('V2 116 KCAS RTO', 116 * KT, 1, P.RTO, sl),
  cond('climb 170 KCAS CLB 82%', 170 * KT, 0.82, P.CLB, sl),
  cond('cruise 275 KTAS FL170 CRZ 82%', 275 * KT, 0.82, P.CRZ, fl170),
  cond('approach 110 KCAS 25% TQ', 110 * KT, 1, 0.25 * P.RTO, sl),
];
out.fl170 = { rho: f(fl170.rho, 4), a: f(fl170.a, 1), T: f(fl170.T, 2) };

// ---- 3. CLmax / VSR / VREF table
const CLfrom = (m, V) => 2 * m * G / (sl.rho * S * (V * KT) ** 2);
const Vfrom = (m, CL) => Math.sqrt(2 * m * G / (sl.rho * S * CL)) / KT;
const CL30a = CLfrom(20400, 106 / 1.23), CL30b = CLfrom(22350, 113 / 1.23), CL30 = 2.675, CL15 = CLfrom(22800, 116 / 1.13), CL0 = 1.5;
out.clmax = { VSR30_BEA: f(106 / 1.23, 2), CL30_BEA: f(CL30a, 4), VSR30_fs: f(113 / 1.23, 2), CL30_fs: f(CL30b, 4), mean: f((CL30a + CL30b) / 2, 4), diff_pct: f((CL30a - CL30b) / CL30b * 100, 2),
  VSR15: f(116 / 1.13, 2), CL15: f(CL15, 4), VMCA_upper: f(116 / 1.10, 2), CL_icingbug: f(CLfrom(21000, (162 - 20) / 1.18), 3) };
const masses = [14000, 16000, 18000, 20000, 21000, 22000, 22350, 23000];
out.table = masses.map(m => ({ m, VSR0: f(Vfrom(m, CL0), 1), VmLB0: f(1.18 * Vfrom(m, CL0), 1), VSR15: f(Vfrom(m, CL15), 1), VmLB15: f(1.18 * Vfrom(m, CL15), 1), VSR30: f(Vfrom(m, CL30), 1), VREF30: f(Math.max(98, 1.23 * Vfrom(m, CL30)), 1) }));
out.VREF_floor_mass = f(CLfrom(1, 98 / 1.23) ** -1 * CL30, 0);
out.VREF_20400 = f(1.23 * Vfrom(20400, CL30), 2);
out.VREF_21700 = f(1.23 * Vfrom(21700, CL30), 2);

// ---- 4. CL0 per flap and attitudes
const CLa = 5.6, DEG = Math.PI / 180;
const cfg = { 0: { CLmax: CL0, a: 13 }, 15: { CLmax: CL15, a: 12 }, 30: { CLmax: CL30, a: 12 } };
for (const k in cfg) cfg[k].CL0 = cfg[k].CLmax - CLa * cfg[k].a * DEG;
out.CL0 = Object.fromEntries(Object.entries(cfg).map(([k, v]) => [k, { CL0: f(v.CL0, 4), dCL0: f(v.CL0 - cfg[0].CL0, 4) }]));
out.flapMap15 = f((cfg[15].CL0 - cfg[0].CL0) / (cfg[30].CL0 - cfg[0].CL0), 4);
const att = (m, Vkt, flap, gam, ge = 1) => { const CL = 2 * m * G * Math.cos(gam * DEG) / (sl.rho * S * (Vkt * KT) ** 2); const a = (CL - cfg[flap].CL0) / (CLa * ge) / DEG; return { CL: f(CL, 3), alpha: f(a, 2), theta: f(a + gam, 2) }; };
out.att = { app_20_4_111: att(20400, 111, 30, -3), app_21_7_113: att(21700, 113, 30, -3), td_20_4_99: att(20400, 99, 30, -0.5, 1.1), td_21_7_106: att(21700, 106, 30, -0.5, 1.1), V2_22_8: att(22800, 116, 15, 0) };

// ---- 5. approach drag/torque fit (CD total 0.210), slope sensitivity, VH-FVZ prediction
const torqueApproach = (m, Vkt, gam, CDextra = 0.072, Kl = 0.040, etaP = null) => {
  const V = Vkt * KT, q = 0.5 * sl.rho * V * V; const W = m * G; const CL = W * Math.cos(gam * DEG) / (q * S);
  const CD = 0.030 + CDextra + Kl * CL * CL; const Dg = q * S * CD; const T = Dg + W * Math.sin(gam * DEG); // gam negative => T = D - W sin|gam|
  const Te = T / 2; // per engine; find P such that eta(P) * P / V = Te (eta = 0.9 * ideal)
  let lo = 1, hi = 3e6; for (let i = 0; i < 200; i++) { const Pm = (lo + hi) / 2; const e = etaP ?? 0.9 * etaIdealFromP(Pm, V, sl.rho); if (e * Pm / V > Te) hi = Pm; else lo = Pm; }
  const Pm = (lo + hi) / 2; return { CL: f(CL, 3), CD: f(CD, 4), LD: f(CL / CD, 2), T_eng_N: f(Te, 0), P_eng_kW: f(Pm / 1e3, 1), TQpct: f(Pm / P.RTO * 100, 2) };
};
out.approach = { fit_20_4: torqueApproach(20400, 111, -3), g2: torqueApproach(20400, 111, -2), g4: torqueApproach(20400, 111, -4), FVZ: torqueApproach(21700, 113, -3) };
out.approach.dTQ_per_deg = f((out.approach.g2.TQpct - out.approach.g4.TQpct) / 2, 2);

// ---- 6. ROC at 22.8 t, 170 KCAS, CLB 82% eta 0.845
const roc = (CD0) => { const m = 22800, V = 170 * KT, q = 0.5 * sl.rho * V * V, CL = m * G / (q * S); const Dg = q * S * (CD0 + 0.0313 * CL * CL); const Pex = 2 * P.CLB * 0.845 - Dg * V; return { CL: f(CL, 3), D: f(Dg, 0), ROC_ms: f(Pex / (m * G), 3), ROC_fpm: f(Pex / (m * G) / FT * 60, 0) }; };
out.roc = { cd030: roc(0.030), cd026: roc(0.026), cd032: roc(0.032) };
out.roc_conv = { fpm1355_ms: f(1355 * FT / 60, 3) };

// ---- 7. cruise power T-R-16
{ const m = 21660, V = 275 * KT, q = 0.5 * fl170.rho * V * V, CL = m * G / (q * S), CD = 0.030 + 0.0313 * CL * CL; const Dg = q * S * CD; const eta = 0.9 * etaIdealFromP(P.CRZ, V, fl170.rho);
  const Pshaft = Dg * V / eta; out.cruise = { CL: f(CL, 4), CD: f(CD, 4), D: f(Dg, 0), eta: f(eta, 3), Pshaft_kW: f(Pshaft / 1e3, 0), shp: f(Pshaft / SHP, 0), FF_kg_h_psfc048: f(Pshaft / SHP * 0.48 * LB, 0), Mach: f(V / fl170.a, 3), CL_21t: f(21000 * G / (q * S), 4) }; }

// ---- 8. landing decel (T-R-14) and conversions
out.landing = { decel_106kt_340m: f((106 * KT) ** 2 / (2 * 340), 3), g: f((106 * KT) ** 2 / (2 * 340) / G, 3), d_ft_640: f(640 / FT, 0), d_ft_915: f(915 / FT, 0), d_067: f(640 / 0.6, 0), d_07: f(640 / 0.7, 1), d_from915: f(0.7 * 915, 1) };

// ---- 9. wake
const b0 = Math.PI / 4 * b;
const gam0 = (m, Vkt, rho = sl.rho) => m * G / (rho * Vkt * KT * b0);
out.wake = { b0: f(b0, 3), G_MLW_112: f(gam0(22350, 112), 1), G_MTOW228_116: f(gam0(22800, 116), 1), G_MTOW23_116: f(gam0(23000, 116), 1),
  w0: f(gam0(22350, 112) / (2 * Math.PI * b0), 3), t_ref: f(b0 / (gam0(22350, 112) / (2 * Math.PI * b0)), 1),
  G_MLW_112_rho11262: f(gam0(22350, 112, 1.1262), 1), ratio_vs_737W_281_4: f(gam0(22350, 112, 1.1262) / 281.4, 3), ratio_SLrho_vs_281_4: f(gam0(22350, 112) / 281.4, 3) };

// ---- 10. geometry / derivatives
const taper = 0.5; const cr = 2 * S / (b * (1 + taper)); const ct = taper * cr; const mac = 2 / 3 * cr * (1 + taper + taper ** 2) / (1 + taper);
const Sh = 11.73, lh = 13.6, Sv = 12.48, lv = 13.6;
const VH = Sh * lh / (S * mac), VV = Sv * lv / (S * b);
const AR = b * b / S;
const helm = (Ar, M, kap = 0.95, sweep = 0) => { const be = Math.sqrt(1 - M * M); return 2 * Math.PI * Ar / (2 + Math.sqrt(4 + (Ar * be / kap) ** 2 * (1 + Math.tan(sweep) ** 2 / be ** 2))); };
const aw17 = helm(AR, 0.17), aw45 = helm(AR, 0.45);
const deda = 0.85 * 2 * aw17 / (Math.PI * AR), deda45 = 0.85 * 2 * aw45 / (Math.PI * AR);
const at = 4.0, eta = 0.95, tau = 0.45, av = 3.0, zv = 3.2;
const CLa_tot = 1.04 * aw17 + at * eta * Sh / S * (1 - deda);
const CLa_tot45 = 1.04 * aw45 + 4.24 * eta * Sh / S * (1 - deda45);
out.geom = { AR: f(AR, 3), cr: f(cr, 3), ct: f(ct, 3), MAC: f(mac, 3), VH: f(VH, 3), VV: f(VV, 4), aw_M017: f(aw17, 3), aw_M045: f(aw45, 3), deda: f(deda, 3), deda45: f(deda45, 3), CLa_tot: f(CLa_tot, 3), CLa_tot45: f(CLa_tot45, 3),
  Sh_over_S: f(Sh / S, 4), ARh_from_bh: f(7.31 ** 2 / Sh, 3), ARv_from_bv: f(3.87 ** 2 / Sv, 3) };
out.deriv_approach = {
  CLq: f(2 * at * eta * VH, 3), Cmq_22: f(-2.2 * at * eta * VH * lh / mac, 2), CLadot: f(2 * at * eta * VH * deda, 3), Cmadot: f(-2 * at * eta * VH * lh / mac * deda, 2),
  CLde: f(at * eta * Sh / S * tau, 4), Cmde: f(-VH * at * eta * tau, 3), lh_over_c: f(lh / mac, 3),
  CYb: f(-av * Sv / S - 0.10, 3), Cnb: f(av * VV - 0.084, 3), Clb: f(-0.07 - av * Sv / S * zv / b, 4), Cnr: f(-2 * av * VV * lv / b - 0.02, 3), CYr: f(-2 * (-av * Sv / S) * lv / b, 3),
  CYdr: f(av * Sv / S * tau, 4), Cndr: f(-av * Sv / S * tau * lv / b, 4), Cldr: f(av * Sv / S * tau * zv / b, 4),
};
out.deriv_cruise = { CLq: f(2 * 4.24 * eta * VH, 3), Cmq: f(-2.2 * 4.24 * eta * VH * lh / mac, 2), CLadot: f(2 * 4.24 * eta * VH * deda45, 3), Cmadot: f(-2 * 4.24 * eta * VH * lh / mac * deda45, 2), CLde: f(4.24 * eta * Sh / S * tau, 4), Cmde: f(-VH * 4.24 * eta * tau, 3) };

// ---- 11. VMCA moment check, prop torque roll, gyro
{ const V = 100 * KT, q = 0.5 * sl.rho * V * V; const N = 26e3 * 4.05; const Cn = N / (q * S * b); out.vmca = { N_kNm: f(N / 1e3, 1), Cn_req: f(Cn, 4), dr_deg: f(Cn / 0.139 / DEG, 1), V105_5_check: f(116 / 1.10, 2),
  // thrust per engine at 100 kt, RTO, momentum*0.9
  T_RTO_100kt_kN: f(0.9 * etaIdealFromP(P.RTO, V, sl.rho) * P.RTO / V / 1e3, 2) }; }
{ const Qn = P.NTO / w100; const V = 116 * KT, q = 0.5 * sl.rho * V * V; const Cl = 2 * Qn / (q * S * b); out.torqueRoll = { Q_NTO: f(Qn, 0), twoQ: f(2 * Qn, 0), Cl: f(Cl, 4), da_deg: f(Cl / 0.18 / DEG, 2), H_gyro_104: f(104 * w100, 0) }; }
{ const mb = 180 / 6 * 0 + 22; const Ip = 6 * mb * (0.45 * D / 2) ** 2; out.Ip = { Ip_6x22_k045R: f(Ip, 1) }; }

// ---- 12. gear static load, nose
{ const W = 23000 * G; const main = 0.92 * W / 4; const nose = 0.08 * W / 2; out.gear = { main_N: f(main, 0), main_lbf: f(main / LBF, 0), main_frac_13000: f(main / LBF / 13000, 3), nose_N: f(nose, 0), nose_lbf: f(nose / LBF, 0), nose_frac_3600: f(nose / LBF / 3600, 3), lb13000_N: f(13000 * LBF, 0), lb3600_N: f(3600 * LBF, 0) };
  // stroke from energy: 0.5 m v^2 at MLW 10 fps (lift = weight) plus ... E = 0.5 m v^2 ; stroke s = E / (eta_s * n * W) with n = 1.5? (n counts total load factor; with L=W net = (n-1)?)
  const m = 22350, v = 10 * FT; const E = 0.5 * m * v * v; out.gear.E_kJ = f(E / 1e3, 1); out.gear.s_eta08_n15 = f(E / (0.8 * 1.5 * m * G), 3); out.gear.s_eta08_n15_netL = f(E / (0.8 * (1.5 - 1) * m * G), 3);
  out.gear.nz_upper = f(1 + 1.97 * 600 / 928, 3); out.gear.fps10_ms = f(10 * FT, 4); out.gear.fpm600_ms = f(600 * FT / 60, 4); }

// ---- 13. phugoid Lanchester, approach cat
out.lanchester = { app: { wn: f(Math.SQRT2 * G / (111 * KT), 4), T: f(2 * Math.PI / (Math.SQRT2 * G / (111 * KT)), 1) }, cru: { wn: f(Math.SQRT2 * G / (275 * KT), 4), T: f(2 * Math.PI / (Math.SQRT2 * G / (275 * KT)), 1) } };

// ---- 14. take-off ground roll (simple, legacy thrust curve and momentum*0.9 per engine)
{ const m = 22800, W = m * G; const mu = 0.02; const CLg = cfg[15].CL0; const CDg = 0.030 + 0.020 + 0.020 + 0.0313 * CLg * CLg;
  const thrMom = V => { if (V < 1) return 2 * T_FM(P.NTO, sl.rho, 0.75); return Math.min(2 * T_FM(P.NTO, sl.rho, 0.75), 2 * 0.9 * etaIdealFromP(P.NTO, V, sl.rho) * P.NTO / V); };
  const thrLeg = V => 76955 * 45.9 / Math.hypot(V, 45.9);
  const roll = (thr) => { let V = 0, x = 0, dt = 0.01; const VR = 110 * KT; while (V < VR) { const q = 0.5 * sl.rho * V * V; const L = q * S * CLg; const a = (thr(V) - q * S * CDg - mu * Math.max(0, W - L)) / m; V += a * dt; x += V * dt; } return x; };
  out.takeoff = { CLg: f(CLg, 3), CDg: f(CDg, 4), roll_momentum: f(roll(thrMom), 0), roll_legacy: f(roll(thrLeg), 0), T_legacy_V2: f(thrLeg(116 * KT), 0), T_mom_V2_NTO_2eng: f(thrMom(116 * KT), 0), T_legacy_30: f(thrLeg(30), 0), T_mom_30: f(thrMom(30), 0), T_legacy_60: f(thrLeg(60), 0), T_mom_60: f(thrMom(60), 0), T_legacy_875: f(thrLeg(87.5), 0), T_mom_875: f(thrMom(87.5), 0) }; }

// ---- 15. inertia radii check
{ const e = (b + L) / 2; const rad = (I, m) => ({ Rx: f(2 * Math.sqrt(I[0] / m) / b, 3), Ry: f(2 * Math.sqrt(I[1] / m) / L, 3), Rz: f(2 * Math.sqrt(I[2] / m) / e, 3) });
  out.radii = { buildup: rad([265800, 789800, 1002000], 21000), w21217: rad([289900, 298400, 573600], 21217), w14380: rad([289900, 298400, 573600], 14380) }; }

// ---- 16. misc conversions
out.conv = { kg22800_lb: f(22800 / LB, 0), kg23000_lb: f(23000 / LB, 0), kg22350_lb: f(22350 / LB, 0), b_ft: f(27.05 / FT, 2), S_ft2: f(61 / FT / FT, 0), D_ft: f(3.93 / FT, 2), ft25000_m: f(25000 * FT, 0), NM758_km: f(758 * 1.852, 0), l_h_FG: f(44.58 * FT, 3), D_FG_in: f(155.9 * 0.0254, 3), Np_PT: 1200 * 16.68 };
console.log(JSON.stringify(out, null, 1));
