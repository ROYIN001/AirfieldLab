#!/usr/bin/env node
// lm_derivs.mjs — stability and control derivatives of a light aircraft from geometry (semi-empirical; 01-methods.md §01.3).
// Library + CLI. Node >= 18, no dependencies. All results are ESTIMATES (ค่าประมาณ): replace with flight/wind-tunnel data
// where a type card has them.
//   node scripts/lm_derivs.mjs <typeId> [--json] [--V kt] [--alt ft]   reads the merged card (airframe.*), prints every
//                                                                      aero.derivatives name + CLalpha, Cmalpha, h_n, deda
//   node scripts/lm_derivs.mjs --validate [--json]                      method vs flight-extracted sets (TM-80163, TN D-6643)
// Sign convention = AC / schema-ext-r2 §5: de + = TE down (Cmde<0), da + = right roll (Clda>0, adverse Cnda<0),
// dr + = TE left (CYdr>0, Cndr<0, Cldr>0); rates non-dimensional with c/2V (q, adot) and b/2V (p, r).
// Results are given in STABILITY axes and converted to BODY axes at the condition's alpha (the sim uses body axes).
import path from 'node:path';
import { loadType, val, isObj, isMainModule } from './lm_lib.mjs';

const DEG = Math.PI / 180, KT = 0.514444, FT = 0.3048, G0 = 9.80665;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
export const DEFAULTS = {
  clalpha: 2 * Math.PI * 0.95,   // section lift slope, 1/rad (κ = 0.95, typical NACA 4-digit/23012 at GA Reynolds numbers)
  eta_h: 0.90, etaV_fixed: null,  // tail dynamic-pressure ratio (Nelson; 0.85–1.0 with slipstream)
  AvEffFactor: 1.55,              // effective fin aspect ratio / geometric (end-plating by body and stabiliser, DATCOM 5.3.1.1 range 1.4–1.6)
  tauViscous: 0.85,               // empirical factor on thin-airfoil flap effectiveness (DATCOM 6.1.1.1 trend for cf/c 0.2–0.4)
  CmqWingFus: 1.10,               // Cmq = 1.1 × tail value (Nelson ch. 3: wing+fuselage add ≈10 %)
  KnAileron: -0.20,               // Cnda = Kn · CL · Clda (adverse-yaw factor, Nelson/DATCOM trend for AR 6–8; Frise ailerons less)
  KiBody: { high: 1.85, mid: 1.0, low: 1.5 },   // DATCOM wing-body interference on fuselage CYβ (approximate reading)
  zwOverDf: { high: -0.40, mid: 0, low: 0.40 },  // wing root c/4 below body centreline / body depth (DATCOM sign: + = below)
  fusVolCoef: 0.55,               // fuselage volume ≈ k·(π/4)·W·H·L
  hhOverB: { high: -0.05, mid: 0.02, low: 0.05 }, // tail height above wing root chord plane / span (downwash K_H)
  tailconeDepth: 0.45,            // body depth at the fin, m (DATCOM 2r1 for the fin–body factor k)
};
/** lifting-line / strip-theory ratio for antisymmetric (rolling) loading. Lifting line, elliptic wing, linear twist p·y/V
 *  (Prandtl monoplane equation, n = 2 term): Clp = −clα A / (8 (A + 2 clα/π)); strip theory: Clp = −(clα/12)(1+3λ)/(1+λ). */
export function rollLL(A, lam, cla) { return (A / (8 * (A + 2 * cla / Math.PI))) / ((1 + 3 * lam) / (12 * (1 + lam))); }
// Raymer Fig. 16.14 (after NACA TR 711): fuselage pitching-moment factor K_f (per deg) vs wing root c/4 position / L_f
const KF_TABLE = [[0.1, 0.005], [0.2, 0.008], [0.3, 0.012], [0.4, 0.018], [0.5, 0.025], [0.6, 0.035]];
const interp = (T, x) => { if (x <= T[0][0]) return T[0][1]; for (let i = 1; i < T.length; i++) if (x <= T[i][0]) return T[i - 1][1] + (x - T[i - 1][0]) / (T[i][0] - T[i - 1][0]) * (T[i][1] - T[i - 1][1]); return T[T.length - 1][1]; };

/** DATCOM / Helmbold–Polhamus 3-D lift slope (1/rad) */
export function liftSlope(A, { sweepC2 = 0, M = 0, kappa = DEFAULTS.clalpha / (2 * Math.PI) } = {}) {
  const b2 = 1 - M * M, t = Math.tan(sweepC2);
  return 2 * Math.PI * A / (2 + Math.sqrt(A * A * b2 / (kappa * kappa) * (1 + t * t / b2) + 4));
}
/** thin-airfoil flap effectiveness τ = 1 − (θ − sinθ)/π, cos θ = 2 cf/c − 1, times viscous factor */
export function tauFlap(cfc, visc = DEFAULTS.tauViscous) { const th = Math.acos(clamp(2 * cfc - 1, -1, 1)); return visc * (1 - (th - Math.sin(th)) / Math.PI); }
/** DATCOM downwash gradient at the tail (4.4.1) */
export function downwashDATCOM({ A, taper, sweepC4 = 0, lH, hH, b }) {
  const KA = 1 / A - 1 / (1 + Math.pow(A, 1.7)), Kl = (10 - 3 * taper) / 7, KH = (1 - Math.abs(hH / b)) / Math.cbrt(2 * lH / b);
  return 4.44 * Math.pow(KA * Kl * KH * Math.sqrt(Math.cos(sweepC4)), 1.19);
}
/** stability → body axes rotation of the lateral derivatives at alpha (Etkin & Reid §B.? ; small-angle exact form) */
export function stabToBody(d, alpha) {
  const c = Math.cos(alpha), s = Math.sin(alpha), o = { ...d };
  o.Clb = d.Clb * c - d.Cnb * s; o.Cnb = d.Cnb * c + d.Clb * s;
  o.Clp = d.Clp * c * c - (d.Clr + d.Cnp) * s * c + d.Cnr * s * s;
  o.Clr = d.Clr * c * c + (d.Clp - d.Cnr) * s * c - d.Cnp * s * s;
  o.Cnp = d.Cnp * c * c + (d.Clp - d.Cnr) * s * c - d.Clr * s * s;
  o.Cnr = d.Cnr * c * c + (d.Clr + d.Cnp) * s * c + d.Clp * s * s;
  o.Clda = d.Clda * c - d.Cnda * s; o.Cnda = d.Cnda * c + d.Clda * s;
  o.Cldr = d.Cldr * c - d.Cndr * s; o.Cndr = d.Cndr * c + d.Cldr * s;
  o.CYr = d.CYr * c; // CYp not in AC
  return o;
}

/**
 * geo: {S,b,c,taper,sweep_c4_deg,dihedral_deg,clalpha,wingPos,z_w, fus:{L,W,H,x_c4_root}, tail:{S_h,b_h,l_h,h_h,S_v,b_v,l_v,z_v},
 *       surf:{elevator:{chord_ratio,span_fraction}, aileron:{chord_ratio,eta_in,eta_out}, rudder:{chord_ratio,span_fraction}},
 *       cg_frac, CD0}
 * cond: {CL, M, alpha (rad, body), CD0}
 */
export function estimate(geo, cond) {
  const D = DEFAULTS, { S, b, c } = geo, A = b * b / S, lam = geo.taper ?? 1, L4 = (geo.sweep_c4_deg ?? 0) * DEG, G = (geo.dihedral_deg ?? 0) * DEG;
  const kappa = (geo.clalpha ?? D.clalpha) / (2 * Math.PI), M = cond.M ?? 0.12, CL = cond.CL, al = cond.alpha ?? 0;
  const tanC2 = Math.tan(L4) - (4 / A) * 0.25 * (1 - lam) / (1 + lam);
  const pos = geo.wingPos ?? 'low', fus = geo.fus, T = geo.tail, sf = geo.surf || {};
  const df = Math.sqrt(fus.W * fus.H);   // equivalent body diameter
  // ── longitudinal
  const CLaW = liftSlope(A, { sweepC2: Math.atan(tanC2), M, kappa });
  const Kwf = 1 + 0.025 * (df / b) - 0.25 * (df / b) ** 2;
  const Ah = T.b_h ** 2 / T.S_h, CLaH = liftSlope(Ah, { M, kappa });
  const hH = T.h_h ?? D.hhOverB[pos] * b;
  const deda = downwashDATCOM({ A, taper: lam, sweepC4: L4, lH: T.l_h, hH, b }) * liftSlope(A, { sweepC2: Math.atan(tanC2), M, kappa }) / liftSlope(A, { sweepC2: Math.atan(tanC2), M: 0, kappa });
  const eh = T.eta_h ?? D.eta_h, Sh = T.S_h / S, VH = T.S_h * T.l_h / (S * c);
  const CLa = Kwf * CLaW + eh * CLaH * Sh * (1 - deda);
  const xw = (fus.x_c4_root ?? 0.3 * fus.L) / fus.L, Kf = interp(KF_TABLE, xw);
  const dCmaFus = Kf * fus.W ** 2 * fus.L / (c * S) / DEG;   // Raymer 16.25, per deg → per rad
  const xacH = 0.25 + T.l_h / c;
  const hn = (Kwf * CLaW * 0.25 + eh * CLaH * Sh * (1 - deda) * xacH - dCmaFus) / CLa;
  const xcg = geo.cg_frac ?? 0.25, arm = xacH - xcg;
  const Cma = CLa * (xcg - hn);
  const tauE = tauFlap(sf.elevator?.chord_ratio ?? 0.4) * (sf.elevator?.span_fraction ?? 1);
  const CLde = eh * Sh * CLaH * tauE, Cmde = -CLde * arm;
  const CLqH = 2 * eh * Sh * arm * CLaH, CLqW = (0.5 + 2 * (0.25 - xcg)) * CLaW;   // DATCOM 7.1.1: wing (x from cg to wing ac, + aft)
  const CLq = CLqH + CLqW, Cmq = -D.CmqWingFus * 2 * eh * Sh * arm * arm * CLaH;
  const CLadot = 2 * eh * Sh * arm * CLaH * deda, Cmadot = -2 * eh * Sh * arm * arm * CLaH * deda;
  // ── lateral-directional (stability axes)
  const Av = D.AvEffFactor * T.b_v ** 2 / T.S_v, CLaV = liftSlope(Av, { M, kappa });
  const Sv = T.S_v / S, zwz = geo.z_w != null ? geo.z_w / fus.H : D.zwOverDf[pos];
  const etaSigma = T.etaV_sigma ?? (0.724 + 3.06 * Sv / (1 + Math.cos(L4)) + 0.4 * zwz + 0.009 * A);
  const kV = clamp(0.75 + (T.b_v / (T.tailcone_depth ?? D.tailconeDepth) - 2) / 6, 0.75, 1.0);   // DATCOM: 0.75 at b_v/2r1 ≤ 2 → 1.0 at 3.5
  const CYbV = -kV * CLaV * Sv * etaSigma;
  const CYbB = -2 * D.KiBody[pos] * (Math.PI * df * df / 4) / S;
  const CYbW = -0.0001 * Math.abs(G / DEG) / DEG;
  const lv = T.l_v * Math.cos(al) + T.z_v * Math.sin(al), zv = T.z_v * Math.cos(al) - T.l_v * Math.sin(al);
  const CYb = CYbV + CYbB + CYbW;
  const volF = D.fusVolCoef * Math.PI / 4 * fus.W * fus.H * fus.L;
  const CnbF = -1.3 * volF / (S * b) * (fus.H / fus.W);            // Raymer 16.47 (per rad)
  const CnbV = -CYbV * lv / b, Cnb = CnbV + CnbF;
  const cla2 = 2 * Math.PI * kappa, KLL = rollLL(A, lam, cla2);
  const ClbG = -KLL * cla2 * G / 6 * (1 + 2 * lam) / (1 + lam);     // strip theory (2-D clα, linear taper) × lifting-line factor
  const zwm = geo.z_w ?? D.zwOverDf[pos] * fus.H;
  const ClbZ = 1.2 * Math.sqrt(A) * (zwm / b) * (2 * df / b);       // DATCOM wing-position increment (+ z_w = wing below body CL)
  const ClbV = CYbV * zv / b, Clb = ClbG + ClbZ + ClbV;
  const ClpW = -cla2 * A / (8 * (A + 2 * cla2 / Math.PI)), ClpH = 0.5 * Sh * (T.b_h / b) ** 2 * (-CLaH / 12 * 4 / 2), ClpV = 2 * CYbV * (T.z_v / b) ** 2;
  const Clp = ClpW + ClpH + ClpV;
  const CnpW = -CL / 8, CnpV = -(2 / (b * b)) * lv * (zv - T.z_v) * CYbV;   // Roskam Part VI form (fin term ≈ 0 at α = 0)
  const Cnp = CnpW + CnpV;
  const ClrW = CL / 4, ClrV = -(2 / (b * b)) * lv * zv * CYbV, Clr = ClrW + ClrV;
  const e = 1.78 * (1 - 0.045 * Math.pow(A, 0.68)) - 0.64, K = 1 / (Math.PI * A * e);
  const CD0 = cond.CD0 ?? geo.CD0 ?? 0.03;
  const CnrW = -(CD0 + K * CL * CL) * (1 + 3 * lam) / (6 * (1 + lam)), CnrV = (2 / (b * b)) * lv * lv * CYbV, Cnr = CnrW + CnrV;
  const CYr = -(2 / b) * lv * CYbV;
  // ailerons (strip theory, per rad of mean deflection)
  const ai = sf.aileron || {}, yi = (ai.eta_in ?? 0.55) * b / 2, yo = (ai.eta_out ?? 0.95) * b / 2, cr = 2 * S / (b * (1 + lam));
  const Icy = y => cr * (y * y / 2 - (1 - lam) * (2 / b) * y * y * y / 3);
  const Clda = KLL * 2 * cla2 * tauFlap(ai.chord_ratio ?? 0.25) / (S * b) * (Icy(yo) - Icy(yi));   // strip × lifting-line factor
  const Cnda = D.KnAileron * CL * Clda;
  const tauR = tauFlap(sf.rudder?.chord_ratio ?? 0.4) * (sf.rudder?.span_fraction ?? 1);
  const CYdr = kV * CLaV * Sv * (T.etaV ?? 0.9) * tauR, Cndr = -CYdr * lv / b, Cldr = CYdr * zv / b;
  const stab = { CLq, CLadot, CLde, CYb, CYdr, CYr, Clb, Clp, Clr, Clda, Cldr, Cmq, Cmadot, Cmde, Cnb, Cnp, Cnr, Cnda, Cndr };
  return {
    stab, body: stabToBody(stab, al), K, e, CD0,
    static: { KLL, CLalpha: CLa, CLaW, CLaH, CLaV, Cmalpha: Cma, h_n: hn, static_margin: hn - xcg, deda, Kwf, VH, Av_eff: Av, etaSigma, kV, tauE, tauR, dCmaFus },
    parts: { CYbV, CYbB, CYbW, CnbV, CnbF, ClbG, ClbZ, ClbV, ClpW, ClpH, ClpV, CnpW, CnpV, ClrW, ClrV, CnrW, CnrV, CLqH, CLqW },
  };
}

// ───────── card → geo ─────────
export function geoFromCard(card, flags = []) {
  const v = (p, d, why) => { const x = val(card, p); if (x === undefined || x === null) { if (why) flags.push(`${p}: ${why} = ${JSON.stringify(d)}`); return d; } return x; };
  const S = v('airframe.wing.S', val(card, 'aero.ref.S')), b = v('airframe.wing.b', val(card, 'aero.ref.b')), c = v('airframe.wing.MAC', val(card, 'aero.ref.c'));
  const L = v('airframe.geometry.length', 8.0, 'ค่าเริ่มต้น');
  const sur = n => { const o = val(card, 'airframe.surfaces.' + n); return isObj(o) ? o : {}; };
  const ail = sur('aileron');
  const sfr = ail.span_fraction;
  return {
    S, b, c, taper: v('airframe.wing.taper', 1, 'ค่าเริ่มต้น'), sweep_c4_deg: v('airframe.wing.sweep_c4_deg', 0, 'ค่าเริ่มต้น'), dihedral_deg: v('airframe.wing.dihedral_deg', 3, 'ค่าเริ่มต้น'),
    wingPos: v('airframe.wing.position', 'low', 'ค่าเริ่มต้น'), z_w: val(card, 'airframe.wing.z_w') ?? null,
    fus: { L, W: v('airframe.geometry.fuselage_width', 1.1, 'ค่าเริ่มต้น'), H: v('airframe.geometry.fuselage_height', 1.3, 'ค่าเริ่มต้น'), x_c4_root: v('airframe.wing.x_c4_root', 0.3 * L, 'ค่าเริ่มต้น 0.3 L') },
    tail: { S_h: v('airframe.tail.S_h'), b_h: v('airframe.tail.b_h'), l_h: v('airframe.tail.l_h'), S_v: v('airframe.tail.S_v'), b_v: v('airframe.tail.b_v'), l_v: v('airframe.tail.l_v'),
      z_v: v('airframe.tail.z_v', 0.45 * (val(card, 'airframe.tail.b_v') ?? 1.5), 'ค่าเริ่มต้น 0.45 b_v'), h_h: val(card, 'airframe.tail.h_h') ?? null },
    surf: { elevator: { chord_ratio: sur('elevator').chord_ratio ?? 0.4, span_fraction: sur('elevator').span_fraction ?? 1 },
      aileron: { chord_ratio: ail.chord_ratio ?? 0.25, eta_in: Array.isArray(sfr) ? sfr[0] : typeof sfr === 'number' ? 1 - sfr : 0.55, eta_out: Array.isArray(sfr) ? sfr[1] : 0.97 },
      rudder: { chord_ratio: sur('rudder').chord_ratio ?? 0.4, span_fraction: sur('rudder').span_fraction ?? 1 } },
    cg_frac: (() => { const r = val(card, 'airframe.cg.ref'); const p = isObj(r) ? (r.pct_mac ?? r.mac_pct ?? r['%MAC']) : null; return p != null ? p / 100 : (flags.push('airframe.cg.ref: ค่าเริ่มต้น 25% MAC'), 0.25); })(),
  };
}

// ───────── validation sets (flight-extracted) ─────────
// Geometry not given in the reports is labelled est in VALIDATION[].estimated and documented in §01.3.
export const VALIDATION = [
  { id: 'c172class_TM80163', src: 'LM5', cond: { CL: 0.6, M: 0.12, alpha: 2 * DEG, CD0: 0.032 },
    geo: { S: 16.2, b: 11.0, c: 1.49, taper: 0.70, sweep_c4_deg: 0, dihedral_deg: 1.73, wingPos: 'high', z_w: -0.55,
      fus: { L: 8.2, W: 1.0, H: 1.35, x_c4_root: 2.35 }, tail: { S_h: 3.35, b_h: 3.45, l_h: 4.36, S_v: 1.04, b_v: 2.03, l_v: 4.36, z_v: 1.0 },
      surf: { elevator: { chord_ratio: 0.42, span_fraction: 0.95 }, aileron: { chord_ratio: 0.25, eta_in: 0.55, eta_out: 0.97 }, rudder: { chord_ratio: 0.42, span_fraction: 0.9 } }, cg_frac: 0.288 },
    estimated: ['taper 0.70', 'dihedral 1.73', 'z_w', 'fus W/H/x_c4', 'l_v = l_h', 'z_v', 'chord ratios', 'aileron span', 'CL 0.6 (ML fit point)'],
    ref: { CLalpha: 5.17, Cmalpha: -0.87, Cmq: -14.85, Cmadot: null, CLde: 0.42, Cmde: -1.23, CYb: -0.57, Clb: -0.070, Cnb: 0.042, Clp: -0.45, Cnp: null, Clr: null, Cnr: -0.11, Cndr: -0.058, Cldr: null, Clda: 0.204 },
    refNote: 'long.: ML 40.7 m/s ค่าเฉลี่ยสองรัน "trim" ของ Table IV (CZα −5.26/−5.07, Cmα −0.853/−0.886, Cmq −14.94/−14.75, CZδe −0.422/−0.413, Cmδe −1.24/−1.21; Cmα̇ ถูกตรึง −4.0 จึงไม่เทียบ); lat.: คอลัมน์ linear fit ที่ CL 0.6 ของ Table X (OCR) CYβ −0.57, Clβ −0.070, Cnβ 0.042, Clp −0.45, Cnr −0.11, Cnδr −0.058, Clδa −0.102; Clda = 2 × 0.102 กลับเครื่องหมาย เพราะรายงานนิยาม δa = ซ้าย − ขวา (Clδa ในรายงานเป็นลบ) ส่วน AC ใช้มุมเฉลี่ยและ da+ = ม้วนขวา (ตรวจทาน 2026-11-18: ฉบับก่อนใช้ 0.070 ซึ่งเป็นค่า Clβ ไม่ใช่ Clδa); รายงานเรียกพื้นบังคับตามยาวว่า stabilator ในรายการสัญลักษณ์ แต่ Table II เรียก elevator จึงใช้ elevator chord ratio 0.42 เป็นค่าประมาณ (ถ้าเป็น stabilator จริง τ = 1 และ CLde/Cmde ประมาณจะสูงขึ้นราว 60 %)' },
  { id: 'navion_TND6643_I', src: 'LM9', cond: { CL: 0.271, M: 0.215, alpha: 0.5 * DEG, CD0: 0.035 },
    geo: { S: 17.112, b: 10.17, c: 1.74, taper: 0.54, sweep_c4_deg: 0, dihedral_deg: 7.5, wingPos: 'low', z_w: 0.45,
      fus: { L: 8.38, W: 1.2, H: 1.35, x_c4_root: 2.7 }, tail: { S_h: 4.0, b_h: 4.0, l_h: 4.8, S_v: 1.163, b_v: 1.4, l_v: 4.9, z_v: 0.85 },
      surf: { elevator: { chord_ratio: 0.33, span_fraction: 1 }, aileron: { chord_ratio: 0.25, eta_in: 0.60, eta_out: 0.97 }, rudder: { chord_ratio: 0.45, span_fraction: 1 } }, cg_frac: 0.25 },
    estimated: ['z_w', 'fus W/H/x_c4', 'l_h 4.8', 'b_v 1.4', 'l_v 4.9', 'z_v', 'elevator chord ratio from area ratio 14.1/43 ft2', 'aileron span and chord', 'rudder ratio from 6.0/12.5 ft2'],
    ref: { CLalpha: 4.33, Cmalpha: -0.77, Cmq: null, Cmq_plus_adot: -24.6, CLde: 0.511, Cmde: -1.42, CYb: -0.60, CYdr: 0.33, Clb: -0.07, Clp: -0.49, Clr: 0.11, Clda: 0.154, Cldr: 0.026, Cnb: 0.073, Cnp: -0.04, Cnr: -0.09, Cnda: -0.004, Cndr: -0.063 },
    refNote: 'Table VII/XI cond I (73.2 m/s, flaps 0) แกนลำตัว; CLα ≈ −CZα; ลำดับแถว lateral อนุมานจากคอลัมน์อ้างอิง (ความเชื่อมั่นกลาง)' },
  { id: 'navion_TND6643_wt', src: 'LM9', cond: { CL: 0.271, M: 0.215, alpha: 0.5 * DEG, CD0: 0.035 }, sameGeoAs: 'navion_TND6643_I',
    ref: { CLalpha: 4.52, Cmalpha: -0.95, Cmq_plus_adot: -15.6, CLde: 0.403, Cmde: -1.42, CYb: -0.56, CYdr: 0.157, Clb: -0.074, Clp: -0.41, Clr: 0.107, Clda: 0.134, Cldr: 0.012, Cnb: 0.070, Cnp: -0.058, Cnr: -0.125, Cnda: -0.0035, Cndr: -0.07 },
    refNote: 'ค่าอุโมงค์ลม/อ้างอิงที่ TN D-6643 ใช้เทียบ (Table XIII–XIV) = ชุด Navion ของตำรา (Teper 1969)' },
];
export function validate() {
  const rows = [];
  for (const V of VALIDATION) {
    const geo = V.geo ?? VALIDATION.find(x => x.id === V.sameGeoAs).geo;
    const r = estimate(geo, V.cond), est = { ...r.body, CLalpha: r.static.CLalpha, Cmalpha: r.static.Cmalpha, Cmq_plus_adot: r.body.Cmq + r.body.Cmadot };
    for (const [k, ref] of Object.entries(V.ref)) if (typeof ref === 'number') rows.push({ set: V.id, name: k, est: est[k], ref, err_pct: 100 * (Math.abs(est[k]) / Math.abs(ref) - 1), sign_ok: Math.sign(est[k]) === Math.sign(ref) });   // no exemptions: every ref is already in the AC sign convention
  }
  return rows;
}
export function tests() {
  const rows = validate(), out = [];
  // T-LM-10: CLalpha within 15 % of flight on both sets; T-LM-11: every derivative has the flight sign
  for (const r of rows.filter(r => r.name === 'CLalpha' && !r.set.endsWith('_wt'))) out.push({ id: 'T-LM-10', what: `lm_derivs CLalpha ${r.set} err %`, got: r.err_pct, exp: 0, tol: 15 });
  const bad = rows.filter(r => !r.sign_ok).length; out.push({ id: 'T-LM-11', what: 'lm_derivs sign agreement (count of wrong signs)', got: bad, exp: 0, tol: 0 });
  const med = (a => { a.sort((x, y) => x - y); return a[Math.floor(a.length / 2)]; })(rows.filter(r => !r.set.endsWith('_wt')).map(r => Math.abs(r.err_pct)));
  out.push({ id: 'T-LM-12', what: 'lm_derivs median |error| vs flight %', got: med, exp: 20, tol: 15 });
  return out;
}

const isMain = isMainModule(import.meta.url);
if (isMain) {
  const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
  const f = (x, n = 3) => (x == null || !Number.isFinite(x) ? '–' : (+x).toFixed(n));
  if (args.includes('--validate')) {
    const rows = validate();
    if (args.includes('--json')) console.log(JSON.stringify(rows, (k, x) => (typeof x === 'number' ? +x.toPrecision(4) : x), 1));
    else { console.log('set                  derivative     estimate   flight/ref   error %   sign'); for (const r of rows) console.log(`${r.set.padEnd(20)} ${r.name.padEnd(14)} ${f(r.est, 4).padStart(9)}  ${f(r.ref, 4).padStart(9)}  ${f(r.err_pct, 0).padStart(7)}   ${r.sign_ok ? 'ok' : 'WRONG'}`); }
  } else {
    const id = args.find((a, i) => !a.startsWith('--') && !['--V', '--alt'].includes(args[i - 1]));
    if (!id) { console.error('usage: node lm_derivs.mjs <typeId> [--json] [--V kt] [--alt ft] | --validate [--json]'); process.exit(2); }
    const card = loadType(id), flags = [], geo = geoFromCard(card, flags);
    // review 2026-11-18: the tail/wing inputs below have no default; without them every derivative came out NaN ('–')
    // silently, so stop with a clear message instead
    const need = { 'airframe.wing.S': geo.S, 'airframe.wing.b': geo.b, 'airframe.wing.MAC': geo.c, 'airframe.tail.S_h': geo.tail.S_h, 'airframe.tail.b_h': geo.tail.b_h,
      'airframe.tail.l_h': geo.tail.l_h, 'airframe.tail.S_v': geo.tail.S_v, 'airframe.tail.b_v': geo.tail.b_v, 'airframe.tail.l_v': geo.tail.l_v };
    const missing = Object.entries(need).filter(([, x]) => typeof x !== 'number' || !Number.isFinite(x)).map(([k]) => k);
    if (missing.length) { console.error(`lm_derivs ${id}: missing required geometry (no default): ${missing.join(', ')}`); process.exit(1); }
    const m = val(card, 'airframe.weights.training_mass') ?? val(card, 'airframe.weights.MTOW');
    const out = {};
    for (const [k, Vkt] of [['cruise', +(opt('--V') ?? val(card, 'validation.trim_targets.cruise')?.ias_kt ?? 110)], ['approach', val(card, 'speeds.VAPP_kt') ?? 70]]) {
      const V = Vkt * KT, CL = 2 * (typeof m === 'number' ? m : m?.kg) * G0 / (1.225 * geo.S * V * V);
      const r = estimate(geo, { CL, M: V / 340, alpha: (CL - 0.25) / 5 });
      out[k] = { V_kt: Vkt, CL, ...r };
    }
    if (args.includes('--json')) console.log(JSON.stringify({ type: id, flags, geo, out }, (k, x) => (typeof x === 'number' ? +x.toPrecision(4) : x), 1));
    else {
      console.log(`# lm_derivs ${id} (ค่าประมาณ, แกนลำตัว)`); flags.forEach(x => console.log('  default ' + x));
      for (const [k, o] of Object.entries(out)) {
        console.log(`\n## ${k}: ${o.V_kt} kt, CL ${f(o.CL)}  CLalpha ${f(o.static.CLalpha)}  Cmalpha ${f(o.static.Cmalpha)}  h_n ${f(o.static.h_n)}  SM ${f(o.static.static_margin)}  deda ${f(o.static.deda)}  K ${f(o.K, 4)} (e ${f(o.e)})`);
        console.log(Object.entries(o.body).map(([n, x]) => `${n} ${f(x, 4)}`).join('  '));
      }
    }
  }
}
