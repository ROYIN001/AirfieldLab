// l_aero_modes.mjs — หัวข้อ 3.3: build-up อากาศพลศาสตร์ A320ceo (DATCOM แบบย่อ) + trim + โหมดพลวัตเชิงเส้น (ไม่มี FBW/yaw damper)
// รัน: node l_aero_modes.mjs  (Node >= 18) — ทุกค่าที่พิมพ์เป็นค่าประมาณ (est) ยกเว้นที่ระบุว่ามาจากแหล่ง
import { I_at } from './l_inertia.mjs';
const D2R = Math.PI / 180, g = 9.80665, KT = 0.514444;
const f = (x, d = 3) => +x.toFixed(d);
// ── เรขาคณิต (แหล่ง: TCDS MAC 4.1935 m, Jenkinson S_h 31.0 / S_v 21.5 / b_h 12.45 / λ 0.24 / Λ 25°, FBW cfg dihedral 5.11° / b_v 19.26 ft) ──
const G = {
  S: 122.6, b: 34.10, c: 4.1935, lam: 0.24, sweep4: 25 * D2R, dihedral: 5.1 * D2R, d_fus: 3.95, L_fus: 37.57,
  Sh: 31.0, bh: 12.45, lamh: 0.30, sweep4h: 29 * D2R, lh: 17.6, hH: 1.5,          // lh, hH, lamh = ค่าประมาณ (ดูเนื้อหา)
  Sv: 21.5, bv: 5.87, sweepv_half: 30 * D2R, lv: 17.2, zv: 4.5, Aeff_fac: 1.55,    // lv, zv, Aeff_fac = ค่าประมาณ
  eta_t: 0.90, tau_e: 0.52, tau_r: 0.48, tau_a: 0.45, ail_eta: [0.76, 0.97],
};
// ตัวเลือก: node l_aero_modes.mjs a321  -> แขนหาง +2.67 m, ลำตัว 44.51 m (Jenkinson), approach 73 t / 143.3 kt (AAIB D-AIRE), CLmax FULL 2.85
const VAR = process.argv[2] === 'a321' ? 'a321' : 'a320';
if (VAR === 'a321') Object.assign(G, { lh: 17.6 + 2.67, lv: 17.2 + 2.67, L_fus: 44.51 });
const APP = VAR === 'a321' ? { m: 73000, Vkt: 143.3, CLmaxFull: 2.85 } : { m: 64500, Vkt: 133.5, CLmaxFull: 2.902 };
const A = G.b ** 2 / G.S;
const tanHalf = (A_, lam, sweep4) => Math.tan(sweep4) - (1 / A_) * (1 - lam) / (1 + lam);
// DATCOM / Helmbold–Diederich (kappa = 0.95)
const CLa_datcom = (A_, M, tanH) => { const be = Math.sqrt(1 - M * M), k = 0.95; return 2 * Math.PI * A_ / (2 + Math.sqrt((A_ * be / k) ** 2 * (1 + tanH ** 2 / be ** 2) + 4)); };
function build(M, CL) {
  const aw = CLa_datcom(A, M, tanHalf(A, G.lam, G.sweep4));
  const Ah = G.bh ** 2 / G.Sh, at = CLa_datcom(Ah, M, tanHalf(Ah, G.lamh, G.sweep4h));
  const Av = G.bv ** 2 / G.Sv * G.Aeff_fac, av = CLa_datcom(Av, M, Math.tan(G.sweepv_half));
  // DATCOM downwash
  const KA = 1 / A - 1 / (1 + A ** 1.7), KL = (10 - 3 * G.lam) / 7, KH = (1 - Math.abs(G.hH / G.b)) / Math.cbrt(2 * G.lh / G.b);
  const deda = 4.44 * (KA * KL * KH * Math.sqrt(Math.cos(G.sweep4))) ** 1.19 * (aw / CLa_datcom(A, 0, tanHalf(A, G.lam, G.sweep4)));
  const VH = G.Sh * G.lh / (G.S * G.c), VV = G.Sv * G.lv / (G.S * G.b), Sh_S = G.Sh / G.S, Sv_S = G.Sv / G.S;
  const CLa = aw + G.eta_t * at * Sh_S * (1 - deda);
  // static margin: h_ac_wb = 0.26 - Δfus(Raymer K_fus 0.015/deg) - 0.04 nacelles (ค่าประมาณ)
  const Cma_fus = 0.015 * G.d_fus ** 2 * G.L_fus / (G.c * G.S) * 57.2958;
  const h_acwb = 0.26 - Cma_fus / aw - 0.04;
  const h_n = h_acwb + G.eta_t * VH * (at / CLa) * (1 - deda);
  const Cmq = -2 * G.eta_t * at * VH * (G.lh / G.c) * 1.10, Cmadot = -2 * G.eta_t * at * VH * (G.lh / G.c) * deda;
  const CLq = 2 * G.eta_t * at * VH, CLadot = CLq * deda;
  const CLde = G.eta_t * at * Sh_S * G.tau_e, Cmde = -CLde * G.lh / G.c, CLih = G.eta_t * at * Sh_S, Cmih = -CLih * G.lh / G.c;
  // lateral-directional (Nelson/DATCOM แบบย่อ)
  const alpha = 0; // ใช้ค่า alpha ของสภาวะแยกในฟังก์ชัน lat()
  const lat = (CLw, al) => {
    const cyv = -av * Sv_S;                         // ηv(1+dσ/dβ) ≈ 1
    const CYb = cyv - 2 * (Math.PI / 4 * G.d_fus ** 2) / G.S - 0.0001 * (G.dihedral / D2R) * 57.3;
    const zv_eff = G.zv * Math.cos(al) - G.lv * Math.sin(al), lv_eff = G.lv * Math.cos(al) + G.zv * Math.sin(al);
    const Cnb_v = av * Sv_S * lv_eff / G.b, Cnb_fus = -57.3 * 0.0011 * 1.8 * (G.L_fus * G.d_fus * 0.85 / G.S) * (G.L_fus / G.b);
    const Cnb = Cnb_v + Cnb_fus - 0.01;
    const Clb_G = -(aw * G.dihedral / 6) * (1 + 2 * G.lam) / (1 + G.lam);
    const Clb_L = -CLw * Math.tan(G.sweep4) * (1 + 2 * G.lam) / (6 * (1 + G.lam)) * (CLw > 1 ? 0.7 : 1);
    const Clb_zw = +(1.2 * Math.sqrt(A) / 57.3) * (1.6 / G.b) * (2 * G.d_fus / G.b) * 57.3;
    const Clb = Clb_G + Clb_L + Clb_zw - av * Sv_S * zv_eff / G.b;
    const Clp = -(aw / 12) * (1 + 3 * G.lam) / (1 + G.lam) * Math.cos(G.sweep4) - 0.02;
    const fl = CLw > 1 ? 0.7 : 1; // แรงยกจากแฟลปอยู่ด้านในปีก (ค่าประมาณ)
    const Clr = fl * CLw * (1 + 3 * G.lam) / (6 * (1 + G.lam)) + 2 * av * Sv_S * lv_eff * zv_eff / G.b ** 2;
    const Cnp = -fl * CLw / 8 - 2 * av * Sv_S * lv_eff * zv_eff / G.b ** 2;
    const Cnr = -2 * av * Sv_S * (lv_eff / G.b) ** 2 - 0.02 * CLw ** 2 - 0.3 * 0.018;
    const CYr = 2 * av * Sv_S * lv_eff / G.b, CYp = 2 * av * Sv_S * zv_eff / G.b;
    const cr = 2 * G.S / (G.b * (1 + G.lam)), [e1, e2] = G.ail_eta, F = e => e * e / 2 - (1 - G.lam) * e ** 3 / 3;
    const Clda = 2 * aw * G.tau_a / (G.S * G.b) * (G.b / 2) ** 2 * cr * (F(e2) - F(e1)) * 0.85;
    const CYdr = av * Sv_S * G.tau_r, Cndr = -CYdr * lv_eff / G.b, Cldr = CYdr * zv_eff / G.b, Cnda = -0.15 * CLw * Clda;
    return { CYb, CYp, CYr, CYdr, Clb, Clp, Clr, Clda, Cldr, Cnb, Cnp, Cnr, Cnda, Cndr, parts: { Clb_G, Clb_L, Clb_zw, Cnb_v, Cnb_fus } };
  };
  return { aw, at, av, Av, deda, VH, VV, CLa, h_acwb, h_n, Cmq, Cmadot, CLq, CLadot, CLde, Cmde, CLih, Cmih, lat, Cma_fus };
}
// ── eigenvalues (Faddeev–LeVerrier + Durand–Kerner) ──
const C = { add: (a, b) => [a[0] + b[0], a[1] + b[1]], sub: (a, b) => [a[0] - b[0], a[1] - b[1]], mul: (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]], div: (a, b) => { const d = b[0] ** 2 + b[1] ** 2; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; } };
function charPoly(Am) { const n = Am.length; let Mk = Am.map(r => r.map(() => 0)); const c = [1]; const I = Am.map((r, i) => r.map((_, j) => +(i === j)));
  for (let k = 1; k <= n; k++) { const AM = Am.map((r, i) => Mk[0].map((_, j) => r.reduce((s, v, l) => s + v * Mk[l][j], 0)));
    Mk = AM.map((r, i) => r.map((v, j) => v + c[k - 1] * I[i][j])); const AM2 = Am.map((r, i) => Mk[0].map((_, j) => r.reduce((s, v, l) => s + v * Mk[l][j], 0)));
    c.push(-AM2.reduce((s, r, i) => s + r[i], 0) / k); }
  return c; }
function roots(c) { const n = c.length - 1; let z = Array.from({ length: n }, (_, k) => C.mul([0.4, 0.9], [Math.cos(k), Math.sin(k)]).map(v => v * 1.5));
  const ev = x => c.reduce((s, ci) => C.add(C.mul(s, x), [ci, 0]), [0, 0]);
  for (let it = 0; it < 2000; it++) z = z.map((zi, i) => { let den = [1, 0]; z.forEach((zj, j) => { if (j !== i) den = C.mul(den, C.sub(zi, zj)); }); return C.sub(zi, C.div(ev(zi), den)); });
  return z; }
const modeOf = r => { const wn = Math.hypot(r[0], r[1]); return { re: f(r[0], 4), im: f(r[1], 4), wn: f(wn, 4), zeta: f(-r[0] / wn, 3), T_s: r[1] ? f(2 * Math.PI / Math.abs(r[1]), 2) : null }; };
// ── polar (แนะนำ, est) ──
const POLAR = { CD0: 0.0182, k_clean: 0.0386, dCD0: { CONF0: 0, CONF1: 0.004, 'CONF1+F': 0.010, CONF2: 0.020, CONF3: 0.030, FULL: 0.050 }, e: { CONF0: null, CONF1: 0.78, 'CONF1+F': 0.75, CONF2: 0.72, CONF3: 0.72, FULL: 0.70 }, gear: 0.017 };
const kOf = conf => POLAR.e[conf] ? 1 / (Math.PI * A * POLAR.e[conf]) : POLAR.k_clean;
const CDof = (conf, CL, gear) => POLAR.CD0 + POLAR.dCD0[conf] + (gear ? POLAR.gear : 0) + kOf(conf) * CL * CL;
// ── ตาราง lift ต่อ CONF (A320ceo) ──
const CLMAX = { CONF0: 1.316, CONF1: 1.957, 'CONF1+F': 2.360, CONF2: 2.447, CONF3: 2.447, FULL: 2.902 }; // @60 t จาก l_speeds_clmax.mjs
const ASTAR = { CONF0: 14.0, CONF1: 19.5, 'CONF1+F': 19.0, CONF2: 18.5, CONF3: 17.5 };          // ค่าประมาณ
function main() {
  const B0 = build(0.20, 1.8);
  console.log('== Geometry-derived (M 0.20) ==');
  console.log({ A: f(A), aw: f(B0.aw), at: f(B0.at), Av_eff: f(B0.Av), av: f(B0.av), deda: f(B0.deda), VH: f(B0.VH), VV: f(B0.VV), CLa: f(B0.CLa), Cma_fus: f(B0.Cma_fus), h_acwb: f(B0.h_acwb), h_n: f(B0.h_n), Cmq: f(B0.Cmq, 2), Cmadot: f(B0.Cmadot, 2), CLq: f(B0.CLq, 2), CLadot: f(B0.CLadot, 2), CLde: f(B0.CLde), Cmde: f(B0.Cmde), CLih: f(B0.CLih), Cmih: f(B0.Cmih) });
  const VH_jenk = G.Sh * 13.53 / (G.S * G.c); console.log('V_H with Jenkinson l_h 13.53 m =', f(VH_jenk), '; with FG 17.64 m =', f(G.Sh * 17.64 / (G.S * G.c)), '; V_V(lv 12.53) =', f(G.Sv * 12.53 / (G.S * G.b)));
  const CLa_deg = B0.CLa * D2R;
  // FULL anchor: VAPP = VLS(64.5 t) + 5 = 133.5 kt, alpha_body 4.5 deg (A321 AAIB 1.5 deg pitch on 3 deg)
  CLMAX.FULL = APP.CLmaxFull; const m = APP.m, V = APP.Vkt * KT, q = 0.5 * 1.225 * V * V, CLapp = m * g / (q * G.S);
  const CL0 = {}; for (const k of Object.keys(ASTAR)) CL0[k] = CLMAX[k] + 0.10 - CLa_deg * ASTAR[k];
  CL0.FULL = CLapp - CLa_deg * 4.5; ASTAR.FULL = (CLMAX.FULL + 0.10 - CL0.FULL) / CLa_deg;
  console.log('\n== Lift per CONF (CLa', f(B0.CLa), '/rad =', f(CLa_deg, 4), '/deg) ==');
  for (const k of Object.keys(CLMAX)) console.log(k.padEnd(8), 'CLmax', CLMAX[k], ' alpha_CLmax', f(ASTAR[k], 1), ' CL0', f(CL0[k]), ' dCL0 vs clean', f(CL0[k] - CL0.CONF0));
  // ── trim targets ──
  console.log(`\n== Trim (${VAR}): approach CONF FULL gear down, ${APP.m / 1000} t, VAPP ${APP.Vkt} kt, ISA SL, 3 deg ==`);
  const al = (CLapp - CL0.FULL) / CLa_deg, CD = CDof('FULL', CLapp, true), D = q * G.S * CD, T = D - m * g * Math.sin(3 * D2R);
  console.log({ CL: f(CLapp), alpha_deg: f(al, 2), theta_deg: f(al - 3, 2), CD: f(CD, 4), L_D: f(CLapp / CD, 2), T_total_kN: f(T / 1000, 1), T_per_engine_kN: f(T / 2000, 1), T_over_W: f(T / (m * g), 4), sink_fpm: f(V * Math.sin(3 * D2R) / 0.00508, 0) });
  // CONF3 approach
  const V3 = (140.4 + 5) * KT, q3 = 0.5 * 1.225 * V3 * V3, CL3 = m * g / (q3 * G.S), al3 = (CL3 - CL0.CONF3) / CLa_deg, CD3 = CDof('CONF3', CL3, true), T3 = q3 * G.S * CD3 - m * g * Math.sin(3 * D2R);
  console.log('CONF3 VAPP 145.4 kt:', { CL: f(CL3), alpha_deg: f(al3, 2), theta_deg: f(al3 - 3, 2), L_D: f(CL3 / CD3, 2), T_total_kN: f(T3 / 1000, 1) });
  // A321 check: AAIB D-AIRE 73 t, VLS FULL 138.3 -> VAPP 143.3 kt; A321 CL0_FULL from 4.5 deg
  const qA = 0.5 * 1.225 * (143.3 * KT) ** 2, CLA = 73000 * g / (qA * G.S);
  console.log('A321 D-AIRE anchor: CL at 143.3 kt, 73 t =', f(CLA), '-> CL0_FULL(A321) =', f(CLA - CLa_deg * 4.5));
  // takeoff: V2 = 1.13 VS1g CONF1+F, 73.5 t
  const CLv2 = CLMAX['CONF1+F'] / 1.13 ** 2, alv2 = (CLv2 - CL0['CONF1+F']) / CLa_deg, CDv2 = CDof('CONF1+F', CLv2, false);
  console.log('V2 CONF1+F: CL', f(CLv2), 'alpha', f(alv2, 2), 'deg, L/D', f(CLv2 / CDv2, 2));
  const CLlof = CLMAX.CONF3 / 1.10 ** 2; console.log('VLOF ~1.10 VS CONF3: CL', f(CLlof), 'alpha (free air)', f((CLlof - CL0.CONF3) / CLa_deg, 2), 'deg');
  // cruise
  const Mc = 0.78, rho = 0.37956, a = 296.54, Vc = Mc * a, qc = 0.5 * rho * Vc * Vc, mc = 65000, CLc = mc * g / (qc * G.S);
  const Bc = build(Mc, CLc), beta = Math.sqrt(1 - Mc * Mc), CL0c = CL0.CONF0 / beta, alc = (CLc - CL0c) / (Bc.CLa * D2R);
  console.log('\n== Cruise M0.78 FL350 ISA 65 t ==', { CL: f(CLc), CLa_M: f(Bc.CLa), CL0_M: f(CL0c), alpha_deg: f(alc, 2), q_Pa: f(qc, 0), TAS_kt: f(Vc / KT, 1) });
  console.log('cruise build:', { deda: f(Bc.deda), CLq: f(Bc.CLq, 2), CLadot: f(Bc.CLadot, 2), CLde: f(Bc.CLde), Cmde: f(Bc.Cmde), Cmq: f(Bc.Cmq, 2), Cmadot: f(Bc.Cmadot, 2), h_n: f(Bc.h_n), Cma_cg25: f(-Bc.CLa * (Bc.h_n - 0.25)) }, ' approach Cma_cg25', f(-B0.CLa * (B0.h_n - 0.25)));
  console.log('CLalpha vs Mach (1/rad):', [0.2, 0.4, 0.5, 0.6, 0.7, 0.74, 0.78, 0.82].map(Mx => [Mx, f(build(Mx, 0.5).CLa)]));
  // Mach drag (Korn/Gur as OpenAP, t/c 0.12, kappa 0.95)
  const Mcrit = CLx => 0.95 / Math.cos(G.sweep4) - 0.12 / Math.cos(G.sweep4) ** 2 - 0.1 * CLx / Math.cos(G.sweep4) ** 3 - 0.108;
  console.log('Mcrit(CL 0.5) =', f(Mcrit(0.5)), ' MDD (dCDw = 0.002) =', f(Mcrit(0.5) + 0.1), ' table CL0.5:', [0.70, 0.74, 0.78, 0.80, 0.82, 0.84, 0.86].map(Mx => [Mx, f(20 * Math.max(0, Mx - Mcrit(0.5)) ** 4, 5)]));
  // L/D max clean
  console.log('L/Dmax clean =', f(1 / (2 * Math.sqrt(POLAR.CD0 * POLAR.k_clean)), 2), ' at CL', f(Math.sqrt(POLAR.CD0 / POLAR.k_clean), 3), '; with gear+FULL (e 0.70):', f(1 / (2 * Math.sqrt((POLAR.CD0 + 0.05 + 0.017) * kOf('FULL'))), 2));
  // ── modes ──
  const runModes = (name, Bx, Mx, rho_, V_, m_, CLw, CDw, CL0x, cgpct, Iuse) => {
    const q_ = 0.5 * rho_ * V_ * V_, S = G.S, c = G.c, b = G.b, al_ = (CLw - CL0x) / (Bx.CLa * D2R) * D2R;
    const Cma = -Bx.CLa * (Bx.h_n - cgpct / 100), CDa = 2 * kOf(name.includes('FULL') ? 'FULL' : 'CONF0') * CLw * Bx.CLa;
    const Xu = -2 * CDw * q_ * S / (m_ * V_), Xw = -(CDa - CLw) * q_ * S / (m_ * V_), Zu = -2 * CLw * q_ * S / (m_ * V_), Zw = -(Bx.CLa + CDw) * q_ * S / (m_ * V_);
    const Zwd = -Bx.CLadot * c * q_ * S / (2 * m_ * V_ * V_), Mw = Cma * q_ * S * c / (Iuse.Iyy * V_), Mwd = Bx.Cmadot * c * c * q_ * S / (2 * Iuse.Iyy * V_ * V_), Mq = Bx.Cmq * c * c * q_ * S / (2 * Iuse.Iyy * V_);
    const k1 = 1 / (1 - Zwd);
    const Alon = [[Xu, Xw, 0, -g], [Zu * k1, Zw * k1, V_ * k1, 0], [Mwd * Zu * k1, Mw + Mwd * Zw * k1, Mq + Mwd * V_ * k1, 0], [0, 0, 1, 0]];
    const lon = roots(charPoly(Alon)).map(modeOf).sort((p, r) => r.wn - p.wn);
    const L = Bx.lat(CLw, al_);
    const Ixs = Iuse.Ixx * Math.cos(al_) ** 2 + Iuse.Izz * Math.sin(al_) ** 2, Izs = Iuse.Ixx * Math.sin(al_) ** 2 + Iuse.Izz * Math.cos(al_) ** 2, Ixz = (Iuse.Ixx - Iuse.Izz) * Math.sin(al_) * Math.cos(al_); // I_xz,s = ½(Ix − Iz) sin2α (body Ixz ≈ 0)
    const Lb = q_ * S * b * L.Clb / Ixs, Lp = q_ * S * b * b * L.Clp / (2 * Ixs * V_), Lr = q_ * S * b * b * L.Clr / (2 * Ixs * V_);
    const Nb = q_ * S * b * L.Cnb / Izs, Np = q_ * S * b * b * L.Cnp / (2 * Izs * V_), Nr = q_ * S * b * b * L.Cnr / (2 * Izs * V_);
    const den = 1 - Ixz * Ixz / (Ixs * Izs), P = (Lx, Nx) => [(Lx + Ixz / Ixs * Nx) / den, (Nx + Ixz / Izs * Lx) / den];
    const [Lbp, Nbp] = P(Lb, Nb), [Lpp, Npp] = P(Lp, Np), [Lrp, Nrp] = P(Lr, Nr);
    const Yb = q_ * S * L.CYb / m_, Yp = q_ * S * b * L.CYp / (2 * m_ * V_), Yr = q_ * S * b * L.CYr / (2 * m_ * V_);
    const Alat = [[Yb / V_, Yp / V_, -(1 - Yr / V_), g / V_], [Lbp, Lpp, Lrp, 0], [Nbp, Npp, Nrp, 0], [0, 1, 0, 0]];
    const lat = roots(charPoly(Alat)).map(modeOf);
    const nAlpha = Bx.CLa * q_ * S / (m_ * g);
    console.log(`\n== Modes: ${name} ==`);
    console.log('Cma', f(Cma), 'Cmq', f(Bx.Cmq, 2), 'Cmadot', f(Bx.Cmadot, 2), 'CLa', f(Bx.CLa), 'n/alpha', f(nAlpha, 2), 'g/rad');
    const sp = lon[0], ph = lon[lon.length - 1];
    console.log('short period', sp, ' CAP', f(sp.wn ** 2 / nAlpha, 3));
    console.log('phugoid', ph);
    console.log('lat derivs', Object.fromEntries(Object.entries(L).filter(([k]) => k !== 'parts').map(([k, v]) => [k, f(v, 4)])), 'parts', Object.fromEntries(Object.entries(L.parts).map(([k, v]) => [k, f(v, 4)])));
    const dr = lat.filter(r => r.im > 0.05)[0], reals = lat.filter(r => Math.abs(r.im) <= 0.05).sort((p, r) => p.re - r.re);
    console.log('Dutch roll', dr, ' roll tau_s', f(-1 / reals[0].re, 3), ' spiral lambda', reals[1].re, reals[1].re > 0 ? ' T2 ' + f(Math.log(2) / reals[1].re, 1) + ' s' : ' T1/2 ' + f(Math.log(2) / -reals[1].re, 1) + ' s');
    return { sp, ph, dr, roll_tau: -1 / reals[0].re, spiral: reals[1].re };
  };
  const Iapp = I_at(APP.m, G.b, G.L_fus);
  runModes(`${VAR} approach FULL ${APP.m / 1000} t ${APP.Vkt} kt SL CG 30%`, B0, 0.2, 1.225, APP.Vkt * KT, APP.m, CLapp, CDof('FULL', CLapp, true), CL0.FULL, 30, Iapp);
  runModes('cruise M0.78 FL350 65 t CG 30%', Bc, 0.78, rho, Vc, 65000, CLc, CDof('CONF0', CLc, false) + 0.0006, CL0c, 30, I_at(65000, G.b, G.L_fus));
  // ── legacy (AC เดิม): หา aStall, aStallFlap ให้ max CL ของ Beard–McLain blend = CLmax ──
  const blendMax = (CL0x, a0deg) => { const a0 = a0deg * D2R; let best = 0; for (let ad = 0; ad <= 40; ad += 0.02) { const a_ = ad * D2R, e1 = Math.exp(-55 * (a_ - a0)), e2 = Math.exp(55 * (a_ + a0)); const sig = (1 + e1 + e2) / ((1 + e1) * (1 + e2)); const CLv = (1 - sig) * (CL0x + B0.CLa * a_) + sig * 2 * Math.sin(a_) ** 2 * Math.cos(a_); if (CLv > best) best = CLv; } return best; };
  const solveA0 = (CL0x, target) => { let lo = 5, hi = 30; for (let i = 0; i < 50; i++) { const mid = (lo + hi) / 2; if (blendMax(CL0x, mid) > target) hi = mid; else lo = mid; } return (lo + hi) / 2; };
  const a0c = solveA0(CL0.CONF0, CLMAX.CONF0), a0F = solveA0(CL0.FULL, CLMAX.FULL);
  console.log('\n== legacy: aStall', f(a0c, 2), ' aStallFlap', f(a0F - a0c, 2), ' CLflap', f(CL0.FULL - CL0.CONF0), ' (check FULL max', f(blendMax(CL0.FULL, a0F), 3), ')');
  for (const k of ['CONF1', 'CONF1+F', 'CONF2', 'CONF3']) { let lo = 0, hi = 1; for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (blendMax(CL0.CONF0 + (CL0.FULL - CL0.CONF0) * mid, a0c + (a0F - a0c) * mid) > CLMAX[k]) hi = mid; else lo = mid; } const fq = (lo + hi) / 2; console.log(`  legacy f for CLmax ${k}: ${f(fq)} (CL0 legacy ${f(CL0.CONF0 + (CL0.FULL - CL0.CONF0) * fq)} vs table ${f(CL0[k])})`); }
  for (const k of ['CONF1+F', 'CONF2', 'CONF3']) { const fr = (CL0[k] - CL0.CONF0) / (CL0.FULL - CL0.CONF0); console.log(`  ${k}: flap fraction ${f(fr)} -> legacy CLmax ${f(blendMax(CL0[k], a0c + (a0F - a0c) * fr), 3)} vs target ${CLMAX[k]}; legacy CDflap*f^1.5 ${f(0.050 * fr ** 1.5, 4)} vs dCD0 ${POLAR.dCD0[k]}`); }
}
main();
