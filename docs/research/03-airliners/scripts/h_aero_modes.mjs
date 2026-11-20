// h_aero_modes.mjs — หัวข้อ 3.4: build-up อากาศพลศาสตร์ A330-300 (DATCOM แบบย่อ, โครงเดียวกับ l_aero_modes.mjs ของหัวข้อ 3)
// + trim (approach FULL, cruise จุดยึด QF72) + โหมดพลวัตเชิงเส้นของโครงเครื่องเปล่า (ไม่มี FBW/yaw damper) + Mach + VMCA + legacy
// รัน: node h_aero_modes.mjs  (Node >= 18) — ทุกค่าที่พิมพ์เป็นค่าประมาณ (est) ยกเว้นที่ระบุว่ามาจากแหล่ง
import { I_at } from './h_inertia.mjs';
import { CLMAX } from './h_speeds_perf.mjs';
const D2R = Math.PI / 180, g = 9.80665, KT = 0.514444;
const f = (x, d = 3) => +x.toFixed(d);
// เรขาคณิต: S 361.6 (OpenAP/FG), b 60.30 (Airbus), c 7.27 (EASA TCDS), λ 0.251, Λ 29.7°, HT/VT จาก Jenkinson; ที่เหลือ = ค่าประมาณ
const G = {
  S: 361.6, b: 60.30, c: 7.27, lam: 0.251, sweep4: 29.7 * D2R, dihedral: 5.0 * D2R, d_fus: 5.64, L_fus: 63.66,
  Sh: 72.9, bh: 19.06, lamh: 0.36, sweep4h: 30 * D2R, lh: 28.6, hH: 2.5,
  Sv: 45.2, bv: 8.45, sweepv_half: 34.8 * D2R, lv: 27.5, zv: 6.3, Aeff_fac: 1.55,
  eta_t: 0.90, tau_e: 0.50, tau_r: 0.58, tau_a: 0.45, ail_eta: [0.66, 0.97],
};
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
// ── polar: OpenAP a333 (CD0 0.022, k 0.041, e 0.773, gear 0.014) + ΔCD0 แฟลปตามสูตร drag.py; มุมแฟลปเป็นค่าประมาณ ──
const OA = { CD0: 0.022, k: 0.041, gear: 0.014, lf: 0.9, cfc: 0.15, SfS: 0.15 };
const FLAPDEG = { CONF0: 0, CONF1: 0, 'CONF1+F': 8, CONF2: 14, CONF3: 22, FULL: 32 };   // ค่าประมาณ (ไม่พบใน FCOM สาธารณะ)
const dCD0flap = d => OA.lf * OA.cfc ** 1.38 * OA.SfS * Math.sin(d * D2R) ** 2;
const kflap = d => 1 / (1 / OA.k + Math.PI * A * 0.0026 * d);
const SLAT_DCD0 = 0.002;   // ใช้เฉพาะคอลัมน์เปรียบเทียบสูตร OpenAP
const dCD0_openap = c => dCD0flap(FLAPDEG[c]) + (c === 'CONF0' ? 0 : SLAT_DCD0);
// ชุดที่เลือก (ค่าประมาณ): ΔCD0 และ e ตาม CONF ใช้รูปแบบเดียวกับ A320 ของหัวข้อ 3 เพราะสูตร OpenAP ให้ ΔCD0(FULL) เพียง ~0.005 (L/D approach ~12, แรงขับใกล้ idle)
const DCD0 = { CONF0: 0, CONF1: 0.004, 'CONF1+F': 0.010, CONF2: 0.020, CONF3: 0.030, FULL: 0.050 };
const EFF = { CONF0: null, CONF1: 0.78, 'CONF1+F': 0.75, CONF2: 0.72, CONF3: 0.72, FULL: 0.70 };
const dCD0 = c => DCD0[c];
const kOf = c => EFF[c] ? 1 / (Math.PI * A * EFF[c]) : OA.k;
const CDof = (c, CL, gear) => OA.CD0 + dCD0(c) + (gear ? OA.gear : 0) + kOf(c) * CL * CL;
const CDof_openap = (c, CL, gear) => OA.CD0 + dCD0_openap(c) + (gear ? OA.gear : 0) + kflap(FLAPDEG[c]) * CL * CL;
const ASTAR = { CONF0: 13.0, CONF1: 20.0, 'CONF1+F': 20.0, CONF2: 19.5, CONF3: 18.5, FULL: 17.5 };   // ค่าประมาณ: รูปแบบ A320 ลบ 0.5–1° แล้วเลื่อน +2.0° ให้เข้าใกล้จุด lift-off ของ TSB C-GHLM (152 kt, 13.7°)
const atm = h => { const T = h <= 11000 ? 288.15 - 0.0065 * h : 216.65; const p = h <= 11000 ? 101325 * (T / 288.15) ** 5.25588 : 22632.06 * Math.exp(-g * (h - 11000) / (287.053 * 216.65)); return { T, p, rho: p / (287.053 * T), a: Math.sqrt(1.4 * 287.053 * T) }; };
function main() {
  const B0 = build(0.21, 1.6);
  console.log('== Geometry-derived (M 0.21) ==');
  console.log({ A: f(A), aw: f(B0.aw), at: f(B0.at), Av_eff: f(B0.Av), av: f(B0.av), deda: f(B0.deda), VH: f(B0.VH), VV: f(B0.VV), CLa: f(B0.CLa), h_acwb: f(B0.h_acwb), h_n: f(B0.h_n), Cmq: f(B0.Cmq, 2), Cmadot: f(B0.Cmadot, 2), CLq: f(B0.CLq, 2), CLadot: f(B0.CLadot, 2), CLde: f(B0.CLde), Cmde: f(B0.Cmde), CLih: f(B0.CLih), Cmih: f(B0.Cmih) });
  const CLa_deg = B0.CLa * D2R;
  // ── cruise anchor: QF72 185,280 kg, FL370, M0.82, AOA 2–3° (ATSB) ──
  const h = 37000 * 0.3048, at37 = atm(h), Mc = 0.82, Vc = Mc * at37.a, qc = 0.5 * at37.rho * Vc * Vc, mc = 185280, CLc = mc * g / (qc * G.S);
  const Bc = build(Mc, CLc), beta = Math.sqrt(1 - Mc * Mc), alc = 2.5, CL0c_M = CLc - Bc.CLa * D2R * alc, CL0clean = CL0c_M * beta;
  console.log('\n== Cruise anchor QF72 ==', { rho: f(at37.rho, 5), a: f(at37.a, 2), TAS_kt: f(Vc / KT, 1), q_Pa: f(qc, 0), CL: f(CLc), CLa_M: f(Bc.CLa), CL0_M_for_alpha2p5: f(CL0c_M), CL0_clean_lowM: f(CL0clean) });
  const EAS = Vc * Math.sqrt(at37.rho / 1.225) / KT; console.log('EAS kt', f(EAS, 1), '(CAS ~270 kt ATSB; ต่าง = compressibility)');
  // ── lift per CONF ──
  const CL0 = { CONF0: CL0clean };
  for (const k of Object.keys(ASTAR)) if (k !== 'CONF0') CL0[k] = CLMAX[k] + 0.10 - CLa_deg * ASTAR[k];
  const astar0 = (CLMAX.CONF0 + 0.10 - CL0clean) / CLa_deg;
  console.log('\n== Lift per CONF (CLa', f(B0.CLa), '/rad =', f(CLa_deg, 4), '/deg) ==');
  console.log('CONF0 alpha* implied by CL0_clean', f(astar0, 2), '(chosen pattern', ASTAR.CONF0, ')');
  for (const k of Object.keys(CLMAX)) console.log(k.padEnd(8), 'CLmax', CLMAX[k], ' alpha_CLmax', k === 'CONF0' ? f(astar0, 1) : ASTAR[k], ' CL0', f(CL0[k]), ' dCL0 vs clean', f(CL0[k] - CL0.CONF0), ' dCD0', f(dCD0(k), 4), ' k', f(kOf(k), 4), ' | OpenAP formula dCD0', f(dCD0_openap(k), 4), ' k', f(kflap(FLAPDEG[k]), 4));
  // ── trim approach FULL @187 t VAPP 144.0 kt (VLS 139.0 + 5) ──
  const m = 187000, Vkt = 1.23 * Math.sqrt(2 * m * g / (1.225 * G.S * CLMAX.FULL)) / KT + 5, V = Vkt * KT, q = 0.5 * 1.225 * V * V, CLapp = m * g / (q * G.S);
  const al = (CLapp - CL0.FULL) / CLa_deg, CD = CDof('FULL', CLapp, true), D = q * G.S * CD, T = D - m * g * Math.sin(3 * D2R);
  console.log(`\n== Trim approach FULL gear down 187 t, VAPP ${f(Vkt, 1)} kt, ISA SL, 3 deg ==`);
  console.log({ CL: f(CLapp), alpha_deg: f(al, 2), theta_deg: f(al - 3, 2), CD: f(CD, 4), L_D: f(CLapp / CD, 2), L_D_openapFlap: f(CLapp / CDof_openap('FULL', CLapp, true), 2), T_total_kN: f(T / 1000, 1), T_per_engine_kN: f(T / 2000, 1), T_over_W: f(T / (m * g), 4), sink_fpm: f(V * Math.sin(3 * D2R) / 0.00508, 0) });
  const m2 = 170000, V2k = 1.23 * Math.sqrt(2 * m2 * g / (1.225 * G.S * CLMAX.FULL)) / KT + 5, q2 = 0.5 * 1.225 * (V2k * KT) ** 2, CL2 = m2 * g / (q2 * G.S), al2 = (CL2 - CL0.FULL) / CLa_deg;
  console.log('approach FULL 170 t VAPP', f(V2k, 1), 'kt: alpha', f(al2, 2), 'theta', f(al2 - 3, 2), 'T kN', f((q2 * G.S * CDof('FULL', CL2, true) - m2 * g * Math.sin(3 * D2R)) / 1000, 1));
  const V3 = 1.23 * Math.sqrt(2 * m * g / (1.225 * G.S * CLMAX.CONF3)) / KT + 5, q3 = 0.5 * 1.225 * (V3 * KT) ** 2, CL3 = m * g / (q3 * G.S), al3 = (CL3 - CL0.CONF3) / CLa_deg;
  console.log('CONF3 VAPP', f(V3, 1), 'kt:', { CL: f(CL3), alpha_deg: f(al3, 2), theta_deg: f(al3 - 3, 2), L_D: f(CL3 / CDof('CONF3', CL3, true), 2), T_total_kN: f((q3 * G.S * CDof('CONF3', CL3, true) - m * g * Math.sin(3 * D2R)) / 1000, 1) });
  // takeoff V2 = 1.13 VS1g CONF2 @242 t
  const CLv2 = CLMAX.CONF2 / 1.13 ** 2, alv2 = (CLv2 - CL0.CONF2) / CLa_deg, CDv2 = CDof('CONF2', CLv2, false);
  console.log('V2 CONF2 (1.13 VS1g): CL', f(CLv2), 'alpha', f(alv2, 2), 'deg, L/D', f(CLv2 / CDv2, 2), '; OEI climb grad (T 316.3 kN, 242 t):', f((316300 / (242000 * g) - CDv2 / CLv2) * 100, 2), '%');
  // TSB check: VR 157 kt at 222.7 t CONF1+F, alpha at rotation start (ground, θ≈0)
  { const W = 221200 * g, q152 = 0.5 * 1.225 * (152 * KT) ** 2, CLreq = W / (q152 * G.S), Tflex = 2 * 0.85 * 316300, CLth = CLreq - Tflex * Math.sin(13.7 * D2R) / (q152 * G.S), CLmod = CL0['CONF1+F'] + CLa_deg * 13.7, CLde15 = B0.CLde * (-15 * D2R);
    console.log('TSB lift-off 152 kt 13.7 deg 221.2 t CONF1+F: CL_req', f(CLreq), ' minus thrust (2*0.85*316.3 kN est)', f(CLth), ' model free-air CL', f(CLmod), ' model + elevator -15 deg', f(CLmod + CLde15), ' model*1.10 GE + elev', f(CLmod * 1.10 + CLde15)); }
  const CLvr = 222700 * g / (0.5 * 1.225 * (157 * KT) ** 2 * G.S); console.log('TSB VR 157 kt 222.7 t: CL req', f(CLvr), 'alpha req', f((CLvr - CL0['CONF1+F']) / CLa_deg, 2), 'deg; tailstrike 10.4 deg -> CL', f(CL0['CONF1+F'] + CLa_deg * 10.4, 3));
  // cruise derived quantities
  console.log('\n== Cruise M0.82 FL370 185.3 t ==', { deda: f(Bc.deda), CLq: f(Bc.CLq, 2), CLadot: f(Bc.CLadot, 2), CLde: f(Bc.CLde), Cmde: f(Bc.Cmde), Cmq: f(Bc.Cmq, 2), Cmadot: f(Bc.Cmadot, 2), h_n: f(Bc.h_n), Cma_cg28: f(-Bc.CLa * (Bc.h_n - 0.28)) }, ' approach Cma_cg28', f(-B0.CLa * (B0.h_n - 0.28)));
  console.log('CLalpha vs Mach (1/rad):', JSON.stringify([0.2, 0.4, 0.5, 0.6, 0.7, 0.76, 0.8, 0.82, 0.86].map(Mx => [Mx, f(build(Mx, 0.5).CLa)])));
  // Mach drag (OpenAP drag.py: kappa 0.95, t/c 0.11)
  const tc = 0.11, cs = Math.cos(G.sweep4), Mcrit = CLx => 0.95 / cs - tc / cs ** 2 - 0.1 * CLx / cs ** 3 - 0.108;
  console.log('Mcrit(CL 0.5) =', f(Mcrit(0.5)), ' Mcrit(QF72 CL) =', f(Mcrit(CLc)), ' MDD (dCDw 0.002) =', f(Mcrit(0.5) + 0.1), ' table CL0.5:', JSON.stringify([0.74, 0.78, 0.80, 0.82, 0.84, 0.86, 0.88].map(Mx => [Mx, f(20 * Math.max(0, Mx - Mcrit(0.5)) ** 4, 5)])));
  const CDc = OA.CD0 + OA.k * CLc ** 2 + 20 * Math.max(0, Mc - Mcrit(CLc)) ** 4, Dc = qc * G.S * CDc;
  console.log('QF72 cruise: CD', f(CDc, 4), 'L/D', f(CLc / CDc, 2), 'drag kN', f(Dc / 1000, 1), 'per engine', f(Dc / 2000, 1));
  console.log('L/Dmax clean =', f(1 / (2 * Math.sqrt(OA.CD0 * OA.k)), 2), ' at CL', f(Math.sqrt(OA.CD0 / OA.k), 3), '; FULL+gear:', f(1 / (2 * Math.sqrt((OA.CD0 + dCD0('FULL') + OA.gear) * kOf('FULL'))), 2), ' (OpenAP flap formula:', f(1 / (2 * Math.sqrt((OA.CD0 + dCD0_openap('FULL') + OA.gear) * kflap(32))), 2), ')', '; gear dCD (OpenAP formula, MTOW 242 t):', f(242000 * g / G.S * 3.16e-5 * 242000 ** -0.215, 4));
  // ── VMCA estimate ──
  const L = B0.lat(1.2, 8 * D2R), dr = 30 * D2R, Te = 316300, ye = 9.40;
  const Vmca = Math.sqrt(2 * Te * ye / (1.225 * G.S * G.b * Math.abs(L.Cndr) * dr)) / KT;
  const Vmca85 = Math.sqrt(2 * 0.85 * Te * ye / (1.225 * G.S * G.b * Math.abs(L.Cndr) * dr)) / KT;
  console.log('\n== VMCA est (tau_r 0.58, rudder 30 deg, y_e 9.40 m, no bank credit, no windmill drag): T 0.85*316.3 kN ->', f(Vmca85, 1), 'kt; static T ->', f(Vmca, 1), 'kt; with windmill drag +10% moment:', f(Vmca * Math.sqrt(1.1), 1), '; 1.13 VSR CONF1+F @130 t =', f(1.13 * Math.sqrt(2 * 130000 * g / (1.225 * G.S * CLMAX['CONF1+F'])) / KT, 1), '; Cndr', f(L.Cndr, 4));
  // ── modes ──
  const runModes = (name, Bx, rho_, V_, m_, CLw, CDw, CL0x, cgpct, Iuse, kx) => {
    const q_ = 0.5 * rho_ * V_ * V_, S = G.S, c = G.c, b = G.b, al_ = (CLw - CL0x) / (Bx.CLa * D2R) * D2R;
    const Cma = -Bx.CLa * (Bx.h_n - cgpct / 100), CDa = 2 * kx * CLw * Bx.CLa;
    const Xu = -2 * CDw * q_ * S / (m_ * V_), Xw = -(CDa - CLw) * q_ * S / (m_ * V_), Zu = -2 * CLw * q_ * S / (m_ * V_), Zw = -(Bx.CLa + CDw) * q_ * S / (m_ * V_);
    const Zwd = -Bx.CLadot * c * q_ * S / (2 * m_ * V_ * V_), Mw = Cma * q_ * S * c / (Iuse.Iyy * V_), Mwd = Bx.Cmadot * c * c * q_ * S / (2 * Iuse.Iyy * V_ * V_), Mq = Bx.Cmq * c * c * q_ * S / (2 * Iuse.Iyy * V_);
    const k1 = 1 / (1 - Zwd);
    const Alon = [[Xu, Xw, 0, -g], [Zu * k1, Zw * k1, V_ * k1, 0], [Mwd * Zu * k1, Mw + Mwd * Zw * k1, Mq + Mwd * V_ * k1, 0], [0, 0, 1, 0]];
    const lon = roots(charPoly(Alon)).map(modeOf).sort((p, r) => r.wn - p.wn);
    const Lt = Bx.lat(CLw, al_);
    const Ixs = Iuse.Ixx * Math.cos(al_) ** 2 + Iuse.Izz * Math.sin(al_) ** 2, Izs = Iuse.Ixx * Math.sin(al_) ** 2 + Iuse.Izz * Math.cos(al_) ** 2, Ixz = (Iuse.Ixx - Iuse.Izz) * Math.sin(al_) * Math.cos(al_);
    const Lb = q_ * S * b * Lt.Clb / Ixs, Lp = q_ * S * b * b * Lt.Clp / (2 * Ixs * V_), Lr = q_ * S * b * b * Lt.Clr / (2 * Ixs * V_);
    const Nb = q_ * S * b * Lt.Cnb / Izs, Np = q_ * S * b * b * Lt.Cnp / (2 * Izs * V_), Nr = q_ * S * b * b * Lt.Cnr / (2 * Izs * V_);
    const den = 1 - Ixz * Ixz / (Ixs * Izs), P = (Lx, Nx) => [(Lx + Ixz / Ixs * Nx) / den, (Nx + Ixz / Izs * Lx) / den];
    const [Lbp, Nbp] = P(Lb, Nb), [Lpp, Npp] = P(Lp, Np), [Lrp, Nrp] = P(Lr, Nr);
    const Yb = q_ * S * Lt.CYb / m_, Yp = q_ * S * b * Lt.CYp / (2 * m_ * V_), Yr = q_ * S * b * Lt.CYr / (2 * m_ * V_);
    const Alat = [[Yb / V_, Yp / V_, -(1 - Yr / V_), g / V_], [Lbp, Lpp, Lrp, 0], [Nbp, Npp, Nrp, 0], [0, 1, 0, 0]];
    const lat = roots(charPoly(Alat)).map(modeOf);
    const nAlpha = Bx.CLa * q_ * S / (m_ * g);
    console.log(`\n== Modes: ${name} ==`);
    console.log('alpha_deg', f(al_ / D2R, 2), 'Cma', f(Cma), 'Cmq', f(Bx.Cmq, 2), 'Cmadot', f(Bx.Cmadot, 2), 'CLa', f(Bx.CLa), 'n/alpha', f(nAlpha, 2), 'g/rad');
    const sp = lon[0], ph = lon[lon.length - 1];
    console.log('short period', sp, ' CAP', f(sp.wn ** 2 / nAlpha, 3));
    console.log('phugoid', ph);
    console.log('lat derivs', JSON.stringify(Object.fromEntries(Object.entries(Lt).filter(([k]) => k !== 'parts').map(([k, v]) => [k, f(v, 4)]))));
    const dr = lat.filter(r => r.im > 0.05)[0], reals = lat.filter(r => Math.abs(r.im) <= 0.05).sort((p, r) => p.re - r.re);
    console.log('Dutch roll', dr, ' roll tau_s', f(-1 / reals[0].re, 3), ' spiral lambda', reals[1].re, reals[1].re > 0 ? ' T2 ' + f(Math.log(2) / reals[1].re, 1) + ' s' : ' T1/2 ' + f(Math.log(2) / -reals[1].re, 1) + ' s');
  };
  runModes(`approach FULL 187 t ${f(Vkt, 1)} kt SL CG 28%`, B0, 1.225, V, m, CLapp, CDof('FULL', CLapp, true), CL0.FULL, 28, I_at(m), kOf('FULL'));
  runModes('cruise M0.82 FL370 185.3 t CG 28% (QF72)', Bc, at37.rho, Vc, mc, CLc, OA.CD0 + OA.k * CLc ** 2, CL0c_M, 28, I_at(mc), OA.k);
  // ── legacy (AC เดิม) ──
  const blendMax = (CL0x, a0deg) => { const a0 = a0deg * D2R; let best = 0; for (let ad = 0; ad <= 40; ad += 0.02) { const a_ = ad * D2R, e1 = Math.exp(-55 * (a_ - a0)), e2 = Math.exp(55 * (a_ + a0)); const sig = (1 + e1 + e2) / ((1 + e1) * (1 + e2)); const CLv = (1 - sig) * (CL0x + B0.CLa * a_) + sig * 2 * Math.sin(a_) ** 2 * Math.cos(a_); if (CLv > best) best = CLv; } return best; };
  const solveA0 = (CL0x, target) => { let lo = 3, hi = 30; for (let i = 0; i < 50; i++) { const mid = (lo + hi) / 2; if (blendMax(CL0x, mid) > target) hi = mid; else lo = mid; } return (lo + hi) / 2; };
  const a0c = solveA0(CL0.CONF0, CLMAX.CONF0), a0F = solveA0(CL0.FULL, CLMAX.FULL);
  console.log('\n== legacy: CL0', f(CL0.CONF0), ' CLa', f(B0.CLa), ' aStall', f(a0c, 2), ' aStallFlap', f(a0F - a0c, 2), ' CLflap', f(CL0.FULL - CL0.CONF0), ' CDflap(FULL)', f(dCD0('FULL'), 4), ' CDgear', OA.gear, ' (check FULL max', f(blendMax(CL0.FULL, a0F), 3), ')');
  for (const k of ['CONF1', 'CONF1+F', 'CONF2', 'CONF3']) { const fr = (CL0[k] - CL0.CONF0) / (CL0.FULL - CL0.CONF0); console.log(`  ${k}: flap fraction ${f(fr)} -> legacy CLmax ${f(blendMax(CL0[k], a0c + (a0F - a0c) * fr), 3)} vs target ${CLMAX[k]}`); }
}
main();
