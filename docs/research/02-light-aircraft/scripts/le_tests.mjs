// le_tests.mjs — T-LE test table for the c172r card (topic 10). Same structure as lc_tests.mjs (C172S):
// loads the merged c172r card (inherits c172s), maps it into today's AirfieldLab physics (lm_card.buildAC + applyAC,
// no code change), runs lm_card.runCard plus extra cases, and adds analytic checks of the POH numbers.
// Expected values come from the 172R POH / Information Manual / TCDS or from physics; "current" is what the card gives
// in today's sim.  Run from the repo root:  node <this folder>/le_tests.mjs  → scripts/out/le_tests.json + le_tests.md
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadType, val, isMainModule } from './lm_lib.mjs';
import { loadSim, buildAC, applyAC, cardInfo, runCard, trim, trimThr, climbSweep, takeoffTest } from './lm_card.mjs';
import { stallSpeed } from './lm_polar.mjs';
import { lapse } from './lm_engine.mjs';
import { compute } from './le_calc.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const KT = 0.514444, FT = 0.3048, G0 = 9.80665, RHO0 = 1.225, DEG = Math.PI / 180, RAD = 180 / Math.PI, LB = 0.45359237;
const r = (x, n = 1) => (x == null || Number.isNaN(x) ? null : Math.round(x * 10 ** n) / 10 ** n);
const MTOW = 1111.3;

export async function run() {
  const C = compute();
  const card = loadType('c172r');
  const ac = buildAC(card, { mass: MTOW });
  // D2 (19 Nov 2026): lm_card.travelOf reads controls.surfaces.<s>.v.travel_deg (inherited from c172s), so the former
  // travelFix workaround is gone; the travel used is reported from the AC.
  const M = await loadSim();
  const restore = applyAC(M, ac);
  const info = cardInfo(card, ac);
  const R = runCard(M, ac, info);

  // extra sim cases ---------------------------------------------------------------------------------------------
  const X = {};
  // hot day at VTBD: OAT 35 °C (ISA+20 at SL), same takeoff technique
  { const Orig = M.Aircraft; M.Aircraft = class extends Orig { constructor(...a) { super(...a); this.isaDev = 20; } };
    try { X.toHot = takeoffTest(M, { f: info.takeoff.f, VR: info.takeoff.VR, theta: info.takeoff.theta }); } finally { M.Aircraft = Orig; } }
  // climb at 8,000 ft ISA (POH Fig 5-6 ISA column 367 fpm)
  X.climb8k = climbSweep(M, { h: 8000 * FT, v0: 56, v1: 90, step: 2, flaps: 0, gear: 1 });
  // max level speed at SL, full throttle (POH 123 KTAS)
  { let lo = 60, hi = 170; const g = v => trimThr(M, v, 1, 0, 1, 30).gamma;
    for (let i = 0; i < 40; i++) { const m = 0.5 * (lo + hi); if (g(m) > 0) lo = m; else hi = m; }
    X.vmaxSL = { keas: 0.5 * (lo + hi) }; const rho = M.atmosphere(M.FIELD.elev + 30, 0).rho; X.vmaxSL.ktas = X.vmaxSL.keas / Math.sqrt(rho / RHO0); }
  // cruise 80 % at 8,000 ft ISA, 122 KTAS (POH): throttle needed (sim thr ≤ 1 means the card can fly it)
  { const h = 8000 * FT, rho = M.atmosphere(M.FIELD.elev + h, 0).rho, eas = 122 * Math.sqrt(rho / RHO0);
    const T = trim(M, new M.Aircraft(), { ias: eas, h, flaps: 0, gear: 1 }); X.cruise80 = { eas, thr: T.thr, alpha_deg: T.alpha * RAD }; }
  // approach trim at the POH short-field speed (62 KIAS → 62.8 KCAS), flaps 30, γ −3°, 300 m
  { const T = trim(M, new M.Aircraft(), { ias: 62.8, h: 300, flaps: 1, gear: 1, gammaDeg: -3 });
    X.apprShort = { alpha_deg: T.alpha * RAD, theta_deg: T.theta * RAD, de_deg: T.de * RAD, thr: T.thr }; }
  // steady-heading sideslip for the 15 kt demonstrated crosswind at 62.8 KCAS (SL)
  { const A = M.AC, V = 62.8 * KT, beta = Math.asin(15 / 62.8), det = A.Clda * A.Cndr - A.Cldr * A.Cnda;
    const da = (-A.Clb * beta * A.Cndr + A.Cldr * A.Cnb * beta) / det, dr = (-A.Clda * A.Cnb * beta + A.Cnda * A.Clb * beta) / det;
    const CL = A.m * G0 / (0.5 * RHO0 * V * V * A.S), phi = Math.asin(Math.max(-1, Math.min(1, -(A.CYb * beta + A.CYdr * dr) / CL)));
    X.xwind = { beta_deg: beta * RAD, da_deg: da * RAD, dr_deg: dr * RAD, phi_deg: phi * RAD, daMax_deg: A.daMax * RAD, drMax_deg: A.drMax * RAD }; }
  restore();

  // test table -----------------------------------------------------------------------------------------------------
  const st = R.stall, md = R.modes, s0 = st['0'], s10 = st['10'], s30 = st['30'];
  const vs45 = 52 / Math.sqrt(Math.cos(45 * DEG)), vs60 = 52 / Math.sqrt(Math.cos(60 * DEG));
  const lapse35 = lapse('ind_friction', 0, 20, { f: 0.10 });
  const lim = (x, lo, hi) => x != null && x >= lo && x <= hi;
  const T = [];
  const add = (id, cond, qty, exp, tol, unit, origin, cur, pass) => T.push({ id, cond, qty, expected: exp, tol, unit, origin, current: cur, pass });
  const S = C.stallFromC172sCL;
  const vs1P = stallSpeed({ mass: 2400 * LB, S: C.geom.S_m2, CLmax: 1.464 }) * Math.sqrt(0.95), vs0N = stallSpeed({ mass: 2300 * LB, S: C.geom.S_m2, CLmax: 1.785 }) * Math.sqrt(0.95);

  add('T-LE-01', 'ตาราง stall ของ POH 172R (Fig 5-3, CG หน้าสุด แฟลปขึ้น power off 2,450 lb): VS 52 KCAS ที่ปีกระดับ', 'VS(φ) = VS(0°)/√cos φ ที่ 45° และ 60°', '62 / 74 (POH)', 1.0, 'KCAS',
    'POH Fig 5-3 p5-12 [LE3]; ทุกช่องของสองตารางต่างจากสูตรไม่เกิน ' + C.stallTableCheck.maxDev_kt + ' kt', `${r(vs45)} / ${r(vs60)}`, Math.abs(vs45 - 62) <= 1 && Math.abs(vs60 - 74) <= 1);
  add('T-LE-02', 'normal category MTOW 2,450 lb: หน้า 40.0 in หลัง 47.3 in หลัง datum; LEMAC 25.9 in, MAC 58.8 in', 'CG เป็น %MAC (fwd / aft)', '24.0 / 36.4', 0.2, '%MAC',
    'TCDS 3A12 [LE1]; IM p2-7/2-8 [LE2]; le_calc.mjs [LE0]', `${C.cg.normal_pctMAC.fwd_mtow} / ${C.cg.normal_pctMAC.aft}`, Math.abs(C.cg.normal_pctMAC.fwd_mtow - 24.0) <= 0.2 && Math.abs(C.cg.normal_pctMAC.aft - 36.4) <= 0.2);
  add('T-LE-03', 'ปีกเดียวกับ 172S: ใช้ CLmax ของบัตร c172s (1.464 / 1.581 / 1.785, nz 0.95) กับมวล 2,450 lb', 'ความเร็ว stall ต่ำสุดแฟลป 0 / 10 / 30', '52 / 50 / 47 (POH 172R CG หน้า)', 0.5, 'KCAS',
    'POH Fig 5-3 [LE3]; บัตร c172s [LC0]; lm_polar [LM0]', `${S['0']} / ${S['10']} / ${S['30']}`, Math.abs(S['0'] - 52) <= 0.5 && Math.abs(S['10'] - 50) <= 0.5 && Math.abs(S['30'] - 47) <= 0.5);
  add('T-LE-04', 'ตาราง airspeed calibration ของ 172R (Fig 5-1) ตีความเชิงเส้น', 'KCAS ของ Vy 79 KIAS / Vx 60 KIAS / VG 65 KIAS (แฟลปขึ้น) / Vref 62 KIAS (แฟลป 30)', '78.1 / 62.0 / 66.0 / 62.8', 0.1, 'KCAS',
    'POH Fig 5-1 p5-9 [LE3]; le_calc.mjs [LE0]', `${C.speedsCAS.VY_79} / ${C.speedsCAS.VX_60} / ${C.speedsCAS.VG_65} / ${C.speedsCAS.VREF_62_f30}`,
    Math.abs(C.speedsCAS.VY_79 - 78.1) <= 0.1 && Math.abs(C.speedsCAS.VREF_62_f30 - 62.8) <= 0.1);
  add('T-LE-05', 'ซิม: 1,111.3 kg CG อ้างอิง 27.4 %MAC, 3,000 ft ISA, idle, แฟลป 0, ปีกระดับ, ลด 1 kt/s', 'VS1 (Vmin, KEAS ≈ KCAS)', 52, 3, 'KCAS',
    'POH Fig 5-3 [LE3] (IM p ii ให้ 51 = CG หลัง); ±3 kt ตาม Part 60 2.c.8 [R1:V2]', r(s0.Vmin_eas), Math.abs(s0.Vmin_eas - 52) <= 3);
  add('T-LE-06', 'เหมือน T-LE-05 แฟลป 10', 'VS (Vmin)', 50, 3, 'KCAS', 'POH Fig 5-3 [LE3] (CG หน้าสุด)', r(s10.Vmin_eas), Math.abs(s10.Vmin_eas - 50) <= 3);
  add('T-LE-07', 'เหมือน T-LE-05 แฟลป 30', 'VS0 (Vmin)', 47, 3, 'KCAS', 'IM p ii, POH Fig 5-3 [LE2, LE3]', r(s30.Vmin_eas), Math.abs(s30.Vmin_eas - 47) <= 3);
  const cl = R.climb;
  add('T-LE-08', 'ซิม: MTOW, SL ISA (h 30 m), คันเร่งสุด, แฟลป 0, กวาด IAS ทีละ 2 kt', 'ROCmax / Vy', '720 / 78.1', '±100 fpm / ±3 kt', 'fpm / KCAS',
    'IM p ii, POH Fig 5-6 p5-15 [LE2, LE3]; Part 60 1.c.1 [R1:V2]', `${r(cl.ROCmax_fpm, 0)} / ${r(cl.Vy_kt)}`, Math.abs(cl.ROCmax_fpm - 720) <= 100 && Math.abs(cl.Vy_kt - 78.1) <= 3);
  add('T-LE-09', 'เหมือน T-LE-08', 'Vx (γ สูงสุด)', 62.0, 3, 'KCAS', 'IM p4-5 Vx 60 KIAS [LE2] แปลงด้วย Fig 5-1', r(cl.Vx_kt), Math.abs(cl.Vx_kt - 62.0) <= 3);
  const roc8 = C.rocISA.find(x => x[0] === 8000)[2];
  add('T-LE-10', 'ซิม: MTOW, 8,000 ft ISA, คันเร่งสุด, แฟลป 0', 'ROCmax', roc8, 100, 'fpm', 'POH Fig 5-6 คอลัมน์ ISA (−0.8 °C) [LE3]; ซิมไม่มี power lapse จึงคาดว่าไม่ผ่าน',
    r(X.climb8k.ROCmax_fpm, 0), Math.abs(X.climb8k.ROCmax_fpm - roc8) <= 100);
  const gl = R.glide.zeroThrust;
  add('T-LE-11', 'ซิม: MTOW, 3,000 ft ISA, แรงขับศูนย์, แฟลป 0, กวาด IAS ทีละ 1 kt', 'ความเร็วร่อนดีสุด / L/D', '66.0 / 9.1', '±3 kt / ±0.5', 'KCAS / -',
    'IM p3-3 VG 65 KIAS [LE2]; 1.5 NM ต่อ 1,000 ft [LC4] (ค่าประมาณ); Part 60 1.d.4 [R1:V2]', `${r(gl.Vbg_kt)} / ${r(gl.LD, 2)}`, Math.abs(gl.Vbg_kt - 66.0) <= 3 && Math.abs(gl.LD - 9.1) <= 0.5);
  const to = R.takeoff;
  add('T-LE-12', `ซิม: short field แฟลป 10, MTOW, SL ISA 15 °C, ลมสงบ, ทางแห้ง, เบรกค้าง 3 s คันเร่งสุด, VR ${info.takeoff.VR} KEAS, θ ${info.takeoff.theta}° (ค่าประมาณของวิธีทดสอบ)`, 'ground roll', C.hot[15].to_roll_m, '±5 % หรือ ±61 m', 'm',
    'POH Fig 5-5 p5-14 (945 ft) [LE3]; Part 60 1.b.1 [R1:V2]', r(to.groundRoll_m, 0), Math.abs(to.groundRoll_m - C.hot[15].to_roll_m) <= 61);
  add('T-LE-13', 'เหมือน T-LE-12', 'ระยะถึง 50 ft / ความเร็วยกล้อ', `${C.hot[15].to_50_m} / 55.7`, '±10 % / ข้อมูลประกอบ', 'm / KCAS', 'POH Fig 5-5 (1,685 ft; lift-off 51 KIAS) [LE3]',
    `${r(to.dist50ft_m, 0)} / ${r(to.V_LOF_kt)}`, Math.abs(to.dist50ft_m - C.hot[15].to_50_m) <= 0.1 * C.hot[15].to_50_m);
  add('T-LE-14', 'เหมือน T-LE-12 แต่ OAT 35 °C (ISA+20 ค่าประจำของ VTBD ตอนบ่าย)', 'ground roll / ถึง 50 ft', `${C.hot[35].to_roll_m} / ${C.hot[35].to_50_m}`, '±10 %', 'm',
    'POH Fig 5-5 ตีความเชิงเส้นระหว่าง 30 และ 40 °C [LE3]; thrustAvail ไม่มีพจน์ ρ จึงคาดว่าสั้นเกิน', `${r(X.toHot.groundRoll_m, 0)} / ${r(X.toHot.dist50ft_m, 0)}`,
    Math.abs(X.toHot.groundRoll_m - C.hot[35].to_roll_m) <= 0.1 * C.hot[35].to_roll_m && Math.abs(X.toHot.dist50ft_m - C.hot[35].to_50_m) <= 0.1 * C.hot[35].to_50_m);
  const lm = R.landing.maxBrake;
  add('T-LE-15', 'ซิม: autoland ของ Flight, ลมสงบ, 15 °C, MTOW, แฟลป 30, ข้าม 50 ft ที่ Vref 63 KCAS (= 62 KIAS short field), เบรกเต็มเมื่อล้อหน้าแตะ', 'ระยะรวมจาก 50 ft ถึงหยุด', C.hot[15].ldg_50_m, '±10 %', 'm',
    'POH Fig 5-11 p5-21 (1,295 ft) [LE3]', lm.failed ? 'ล้มเหลว' : `${r(lm.total_m, 0)} (อากาศ ${r(lm.air_m, 0)} + พื้น ${r(lm.ground_m, 0)}; ${r(lm.ias50_kt)} kt ที่ 50 ft)`, !lm.failed && Math.abs(lm.total_m - C.hot[15].ldg_50_m) <= 0.1 * C.hot[15].ldg_50_m);
  add('T-LE-16', 'เหมือน T-LE-15', 'ground roll (แตะพื้นถึงหยุด)', C.hot[15].ldg_roll_m, '±10 % = ±17 m', 'm', 'POH Fig 5-11 (550 ft) [LE3]; Part 60 1.e.1 [R1:V2]',
    lm.failed ? 'ล้มเหลว' : r(lm.ground_m, 0), !lm.failed && Math.abs(lm.ground_m - C.hot[15].ldg_roll_m) <= 17);
  add('T-LE-17', 'ซิม: MTOW, SL ISA, คันเร่งสุด, แฟลป 0, บินระดับ', 'ความเร็วสูงสุด', 123, 3, 'KTAS', 'IM p ii (เครื่องติด speed fairing; ไม่มี ≈ 121 KTAS ยังอยู่ใน tolerance) [LE2]', r(X.vmaxSL.ktas), Math.abs(X.vmaxSL.ktas - 123) <= 3);
  add('T-LE-18', 'ซิม: MTOW, 8,000 ft ISA, บินระดับ 122 KTAS (80 % BHP ตาม POH)', 'คันเร่งที่ต้องใช้ (thr ของซิม)', '≤ 1.0 (บินได้)', 'ขีดบนเดียว ส่วนเผื่อ 0', '-', 'IM p ii, p4-27 [LE2]',
    r(X.cruise80.thr, 3), X.cruise80.thr <= 1.0);
  const sp = md.cruise.sp, ph = md.cruise.ph, drA = md.approach.dr, drC = md.cruise.dr;
  add('T-LE-19', 'ซิม linearise: cruise 110 KCAS 3,000 ft แฟลป 0 (Category B; สภาพเดียวกับ c172s)', 'short period ζ / ωn', 'ζ 0.30–2.00; ωn = c172s 5.60 rad/s ± 10 % (โครงลำเดียวกัน มวลต่ำกว่า 4 %)', 'ζ: ช่วงปิด ส่วนเผื่อ 0; ωn: ±10 %', '- / rad/s',
    'MIL-F-8785C Level 1 Class I [R1:V7, R1:V10]; บัตร c172s §04.9 [LC0]', `${r(sp.zeta, 3)} / ${r(sp.wn, 2)}`, lim(sp.zeta, 0.3, 2.0) && Math.abs(sp.wn / 5.60 - 1) <= 0.1);
  add('T-LE-20', 'เหมือน T-LE-19', 'phugoid ζ / คาบ', 'ζ ≥ 0.04 (คาบ c172s 33 s ข้อมูลประกอบ)', 'ζ: ขีดล่างเดียว ส่วนเผื่อ 0; คาบ: ไม่ตัดสิน', '- / s', 'MIL-F-8785C Level 1 [R1:V10]; บัตร c172s [LC0]', `${r(ph.zeta, 3)} / ${r(ph.T, 1)}`, ph.zeta >= 0.04);
  add('T-LE-21', 'ซิม linearise: approach 66 KCAS 300 m แฟลป 30 γ −3° (Category C) และ cruise', 'Dutch roll ωn / ζ / ζωn', 'ζ ≥ 0.08, ζωn ≥ 0.15, ωn ≥ 1.0 (approach)', 'ขีดล่างเดียวทั้งสามค่า ส่วนเผื่อ 0; cruise แสดงอย่างเดียว', 'rad/s / - / rad/s',
    'MIL-F-8785C Level 1 Class I Cat C [R1:V10]', `approach ${r(drA.wn, 2)} / ${r(drA.zeta, 3)} / ${r(drA.wn * drA.zeta, 3)}; cruise ${r(drC.wn, 2)} / ${r(drC.zeta, 3)}`,
    drA.zeta >= 0.08 && drA.wn * drA.zeta >= 0.15 && drA.wn >= 1.0);
  add('T-LE-22', 'เหมือน T-LE-21', 'roll mode τR (approach / cruise)', '≤ 1.0 (Cat C) / ≤ 1.4 (Cat B)', 'ขีดบนเดียว ส่วนเผื่อ 0', 's', 'MIL-F-8785C Table 5 [R1:V7, R1:V10]',
    `${r(md.approach.roll_tau, 3)} / ${r(md.cruise.roll_tau, 3)}`, md.approach.roll_tau <= 1.0 && md.cruise.roll_tau <= 1.4);
  const spA = md.approach.spiral, spC = md.cruise.spiral;
  add('T-LE-23', 'เหมือน T-LE-21', 'spiral: เวลาเพิ่มเป็นสองเท่า T₂ (approach / cruise)', 'T₂ ≥ 12 s (Cat C) / ≥ 20 s (Cat B)', 'ขีดล่างเดียว ส่วนเผื่อ 0; spiral ที่ลู่เข้าผ่านเสมอ', 's', 'MIL-F-8785C Table 6 [R1:V7, R1:V10]',
    `${spA.grows ? r(spA.t2, 1) : 'เสถียร'} / ${spC.grows ? r(spC.t2, 1) : 'เสถียร'}`, (!spA.grows || spA.t2 >= 12) && (!spC.grows || spC.t2 >= 20));
  add('T-LE-24', 'ลมขวาง 15 kt (demonstrated) ที่ 62.8 KCAS SL, wing-low ไม่มี crab: β = asin(15/62.8) (±0.1° จากการปัดเศษ)', 'δr / δa / มุมเอียงที่ต้องใช้', `β ${r(X.xwind.beta_deg)}°; ขนาด δr ≤ ${r(X.xwind.drMax_deg)}° และ δa ≤ ${r(X.xwind.daMax_deg)}°`, 'ขีดบนเดียวที่ travel เต็ม ส่วนเผื่อ 0°', 'deg',
    'IM p4-5 [LE2]; travel จาก TCDS [LE1]; สมการ steady sideslip (Etkin) กับอนุพันธ์ของบัตร', `δr ${r(X.xwind.dr_deg)} / δa ${r(X.xwind.da_deg)} / φ ${r(X.xwind.phi_deg)}`,
    Math.abs(X.xwind.dr_deg) <= X.xwind.drMax_deg && Math.abs(X.xwind.da_deg) <= X.xwind.daMax_deg);
  const aps = X.apprShort;
  add('T-LE-25', 'ซิม trim: 62.8 KCAS แฟลป 30 γ −3° ที่ 300 m, MTOW, CG อ้างอิง', 'elevator ที่ใช้ / ระยะเผื่อถึง travel ขึ้น 28°', 'เผื่อ ≥ 10° ไว้ flare (เกณฑ์ภายใน ค่าประมาณ)', 'ขีดล่างเดียว ส่วนเผื่อ 0', 'deg',
    'TCDS travel [LE1]; เกณฑ์ของผู้เขียน', `de ${r(aps.de_deg)} / α ${r(aps.alpha_deg)} / θ ${r(aps.theta_deg)} / thr ${r(aps.thr, 2)}`, 28 + aps.de_deg >= 10);
  add('T-LE-26', 'เครื่อง IO-360-L2A คันเร่งสุด SL OAT 35 °C', 'P/P_ISA (indicated-minus-friction f 0.10)', 0.964, 0.005, '-', 'lm_engine [LM0]; NACA Rep. 190 [LM17]; เทียบ POH ROC 656/721 = 0.91 [LE3]',
    r(lapse35, 4), Math.abs(lapse35 - 0.964) <= 0.005);
  add('T-LE-27', 'ใบพัด 1C235/LFA7570 (75 in × 70 in) BEM ที่ปรับเชือกใบให้รอบสถิต 2,115 rpm, SL ISA', 'figure of merit สถิต / แรงขับสถิต', 'FM 0.50–0.75 (ช่วงใบพัด GA สองใบ); T0 ระหว่างค่าที่รอบ 2,065 และ 2,165 rpm', 'FM: ช่วงปิด ส่วนเผื่อ 0; T0: อยู่ระหว่างค่าทั้งสอง', '- / N',
    'TCDS 3A12 static rpm [LE1]; lm_prop [LM0]; ช่วง FM ของหัวข้อ 01 §01.7 [LM0]', `${C.prop.static.FM} / ${C.prop.static.T0_N} (${C.prop.static_range.rpm2065_T0_N}–${C.prop.static_range.rpm2165_T0_N})`, lim(C.prop.static.FM, 0.5, 0.75));
  add('T-LE-28', 'BEM ใบพัดเดิม คันเร่งสุด 160 hp SL ISA บินระดับ 123 KTAS (แรงต้านจาก polar สะอาด)', 'rpm ที่สมดุลกำลัง', '2,400 (rpm สูงสุด, คาดว่าความเร็วสูงสุดอยู่ใกล้รอบ redline)', 50, 'rpm',
    'IM p2-5, p ii [LE2]; lm_prop [LM0]', `${C.prop.at123.rpm} (J ${C.prop.at123.J})`, Math.abs(C.prop.at123.rpm - 2400) <= 50);
  add('T-LE-29', 'POH Fig 5-5 short field takeoff, 2,450 lb, SL, ตีความเชิงเส้นระหว่าง 30 และ 40 °C', 'ระยะถึง 50 ft ที่ 35 °C', 1945, 10, 'ft', 'POH p5-14 [LE3]; le_calc.mjs [LE0]', C.hot['35'].to_50_ft, Math.abs(C.hot['35'].to_50_ft - 1945) <= 10);
  add('T-LE-30', 'W/S = 14.08 lb/ft² (2,450 lb, 174 ft²)', 'limit descent velocity V = 4.4 (W/S)^¼ (7–10 fps)', 8.52, 0.02, 'fps', '14 CFR 23.473(d) ฉบับ 2011 [LM3]; le_calc.mjs [LE0]', C.part23.Vdesc_fps, Math.abs(C.part23.Vdesc_fps - 8.52) <= 0.02);
  add('T-LE-31', 'คอลัมน์ ISA ของ POH Fig 5-6 (interpolate OAT ISA ทุกความสูง) extrapolate ถึง 100 fpm', 'service ceiling', 13500, 300, 'ft', 'IM p ii 13,500 ft [LE2]; POH Fig 5-6 [LE3]', C.ceilings.service_100fpm_ft, Math.abs(C.ceilings.service_100fpm_ft - 13500) <= 300);
  add('T-LE-32', `ตาราง cruise Fig 5-8 คอลัมน์ ISA ${C.bsfc.n} จุด ทั้งสองแผ่น (recommended lean): GPH × 6.0 lb / (%BHP × 160 hp)`, 'BSFC', '0.42–0.45 (ช่วงปกติของ IO-360 lean)', 'ช่วงปิด ส่วนเผื่อ 0', 'lb/(hp h)', 'POH p5-17, p5-18 [LE3]; le_calc.mjs [LE0]',
    `${C.bsfc.lb_per_hp_h} (${C.bsfc.min}–${C.bsfc.max})`, lim(C.bsfc.lb_per_hp_h, 0.42, 0.45));
  add('T-LE-33', 'รุ่นเก่า 172P (ปีกเดียวกัน 2,400 lb แฟลป 30) และ 172N (2,300 lb แฟลป 40) ด้วย CLmax ของบัตร (1.464 แฟลป 0, 1.785 แฟลป 30)', 'VS1 ของ 172P / VS0 ของ 172N (แฟลป 30 ของบัตรเทียบ 40° จริง)', '52 (172P CG หน้า) / 44 (172N แฟลป 40)', '±1 / ข้อมูลประกอบ', 'KCAS',
    '172P POH ผ่านหัวข้อ 03 [LB9]; 172N POH 1978 p ii [LE4]; แฟลป 40° ของ 172N ให้ CLmax สูงกว่า 30° ราว 0.13', `${r(vs1P)} / ${r(vs0N)}`, Math.abs(vs1P - 52) <= 1);

  // review 2026-11-19: two more data checks against Fig 5-8 sheet 2 (p5-18), which the first version did not have
  const ab = C.prop.cruiseAbsorb.find(x => x.pa === 8000 && x.rpm === 2400);
  add('T-LE-34', 'BEM ใบพัด 1C235/LFA7570 ของบัตร (ค่าประมาณ) ที่จุด cruise ของ POH: 8,000 ft ISA, 2,400 rpm, 122 KTAS (มี speed fairing), 2,450 lb', 'กำลังที่ใบพัดดูด CP ρ n³ D⁵', '128 (80 % × 160 hp)', '±10 %', 'hp',
    'POH Fig 5-8 แผ่น 2 p5-18 [LE3]; lm_prop [LM0]; ทุกจุดของสองแผ่นได้ 0.90–0.95 เท่า', `${ab.P_bem_hp} (J ${ab.J}, ${r(100 * (ab.ratio - 1), 1)} %)`, Math.abs(ab.ratio - 1) <= 0.10);
  const ct = C.cruiseTable.filter(t => t.pct >= 55), ctR = ct.map(t => t.ratio);
  add('T-LE-35', `polar cruise สะอาดของบัตร (CD0 ${C.cleanPolar.CD0}, K ${C.cleanPolar.K}) เทียบจุดคอลัมน์ ISA ของ Fig 5-8 ทั้งสองแผ่นที่ %BHP ≥ 55 (${ct.length} จุด, KTAS ตามที่พิมพ์, η 0.80 สมมติ)`, 'CD ที่ต้องการตาม POH ÷ CD ของ polar (ต่ำสุด / สูงสุด)', 1.0, 0.1, '-',
    'POH Fig 5-8 p5-17, p5-18 [LE3]; le_calc.mjs [LE0]; จุดกำลังต่ำ (50–54 %) เบี่ยงถึง +10 % เพราะ η 0.80 คงที่', `${Math.min(...ctR)} / ${Math.max(...ctR)}`, ctR.every(x => Math.abs(x - 1) <= 0.1));

  return { type: 'c172r', mass_kg: MTOW, travel: { source: 'card controls.surfaces.<s>.v.travel_deg via lm_card.travelOf (D2)', card_rad: { deUp: ac.deUp, deDn: ac.deDn, daMax: ac.daMax, drMax: ac.drMax } }, tests: T,
    raw: { stall: R.stall, climb: R.climb, glide: R.glide, trim: R.trim, modes: R.modes, takeoff: R.takeoff, landing: R.landing, extra: X } };
}

if (isMainModule(import.meta.url)) {
  const o = await run();
  fs.writeFileSync(path.join(HERE, 'out', 'le_tests.json'), JSON.stringify(o, (k, v) => (typeof v === 'number' ? +v.toPrecision(5) : v), 1));
  const pf = p => (p === true ? 'ผ่าน' : p === false ? '**ไม่ผ่าน**' : '–');
  const tol = t => (t.tol == null || t.tol === '-' ? '' : typeof t.tol === 'number' ? ` ± ${t.tol}` : String(t.tol).startsWith('±') ? ` (${t.tol})` : ` (เกณฑ์: ${t.tol})`);
  const unit = t => (t.unit === '-' ? '' : ` ${t.unit}`);
  const rows = o.tests.map(t => `| ${t.id} | ${t.cond} | ${t.qty} | ${t.expected}${tol(t)}${unit(t)} | ${t.origin} | ${t.current} (${pf(t.pass)}) |`);
  const md = '| รหัส | เงื่อนไข | ปริมาณที่วัด | ผลคาดหวัง ± tolerance | ที่มา | โมเดลปัจจุบัน (บัตรนี้ในฟิสิกส์ปัจจุบัน) |\n|---|---|---|---|---|---|\n' + rows.join('\n');
  fs.writeFileSync(path.join(HERE, 'out', 'le_tests.md'), md + '\n');
  console.log(md);
  console.log(`\n${o.tests.length} tests, pass ${o.tests.filter(t => t.pass).length}, fail ${o.tests.filter(t => t.pass === false).length}`);
}
