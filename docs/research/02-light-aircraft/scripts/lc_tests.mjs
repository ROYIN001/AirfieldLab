// lc_tests.mjs — T-LC test table for the c172s card (topic 04).
// Loads the merged c172s card, maps it into today's AirfieldLab physics (lm_card.buildAC + applyAC, no code change),
// runs lm_card.runCard plus extra cases (short-field landing, hot day, 8,000 ft climb, max level speed, cruise power),
// and adds analytic checks of the POH numbers.  Expected values come from the POH/TCDS or from physics; the
// "current" column is what the card gives in today's sim.  Run from the repo root:
//   node <this folder>/lc_tests.mjs        → scripts/out/lc_tests.json + markdown rows on stdout
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadType, val, isMainModule } from './lm_lib.mjs';
import { loadSim, buildAC, applyAC, cardInfo, runCard, trim, trimThr, climbSweep, glideSweep, takeoffTest, landingTest, modes, startTrimmed } from './lm_card.mjs';
import { toSimPolar } from './lm_polar.mjs';
import { lapse } from './lm_engine.mjs';
import { compute } from './lc_calc.mjs';
import { stickForceBand } from './lc_cardfix.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const KT = 0.514444, FT = 0.3048, G0 = 9.80665, RHO0 = 1.225, DEG = Math.PI / 180, RAD = 180 / Math.PI;
const r = (x, n = 1) => (x == null || Number.isNaN(x) ? null : Math.round(x * 10 ** n) / 10 ** n);
const MTOW = 1156.66, LB = 0.45359237, dtS = 1 / 240;

export async function run() {
  const C = compute();
  const card = loadType('c172s');
  const ac = buildAC(card, { mass: MTOW });
  // D2 (19 Nov 2026): lm_card.travelOf now reads controls.surfaces.<s>.v.travel_deg (TCDS travel of the card), so the
  // former travelFix workaround of this script is gone; the travel used is reported from the AC itself.
  const M = await loadSim();
  const restore = applyAC(M, ac);
  const info = cardInfo(card, ac);
  const R = runCard(M, ac, info);

  // Review fix (2026-11-18): runCard linearises cruise and approach with ONE AC, and buildAC picks the "approach" value of
  // every config-dependent derivative (Clr, Cnp, Cnda, CYdr, Cldr, CYr, CLq, CLadot, Cmadot) unless opts.config is given,
  // so the cruise modes above used approach derivatives. Re-linearise the cruise point with an AC built from the "cruise"
  // values; keep the old numbers in raw.extra.modesCruise_approachCfg for the record.
  const pickM = m => { const pk = o => (o && o.wn ? { wn: o.wn, zeta: o.zeta, T: o.T } : o);
    return { sp: pk(m.sp), ph: pk(m.ph), dr: pk(m.dr), roll_tau: m.roll?.tau, spiral: m.spiral ? { lam: m.spiral.lam, t2: m.spiral.t2, grows: m.spiral.grows } : null, nAlpha: m.nAlpha, CAP: m.CAP, trim: m.trim }; };
  const acC = buildAC(card, { mass: MTOW, config: 'cruise' });
  const crCond = { ias: info.cruise.ias, h: info.cruise.h, flaps: 0, gear: 1, gammaDeg: 0 };
  const apCond = { ias: info.approach.ias, h: info.approach.h, flaps: 1, gear: 1, gammaDeg: info.approach.gammaDeg };
  const modesCruiseApproachCfg = R.modes.cruise;
  { const rc = applyAC(M, acC); R.modes.cruise = pickM(modes(M, crCond, { adot: true })); rc(); }
  // Sensitivity (not a test): Clr and Cnp from the flight-test linear fits of NASA TM-80163 Table X (flaps up; CL 0.3 for
  // cruise, CL 1.0 for approach; OCR reading, review 2026-11-18) in place of the lm_derivs estimates.
  const tmLat = {};
  { const rc = applyAC(M, acC); Object.assign(M.AC, { Clr: 0.07, Cnp: -0.05 }); tmLat.cruise = pickM(modes(M, crCond, { adot: true })); rc(); }
  { const keep = { Clr: M.AC.Clr, Cnp: M.AC.Cnp }; Object.assign(M.AC, { Clr: 0.13, Cnp: -0.115 }); tmLat.approach = pickM(modes(M, apCond, { adot: true })); Object.assign(M.AC, keep); }

  // extra sim cases --------------------------------------------------------------------------
  const X = { modesCruise_approachCfg: modesCruiseApproachCfg, tmLateralSensitivity: tmLat };
  // short-field landing: POH technique 61 KIAS flaps 30 (63.9 KCAS) to the threshold, max braking
  { const keep = { Vapp: M.AC.Vapp, Vref: M.AC.Vref }; M.AC.Vapp = 64; M.AC.Vref = 64;
    X.ldgShort = landingTest(M, { maxBrake: true }); Object.assign(M.AC, keep); }
  // hot day at VTBD: OAT 35 °C (ISA+20 at sea level), same takeoff technique as T-LC-13
  { const Orig = M.Aircraft; M.Aircraft = class extends Orig { constructor(...a) { super(...a); this.isaDev = 20; } };
    try { X.toHot = takeoffTest(M, { f: info.takeoff.f, VR: info.takeoff.VR, theta: info.takeoff.theta }); } finally { M.Aircraft = Orig; } }
  // climb at 8,000 ft ISA (POH 408 fpm)
  X.climb8k = climbSweep(M, { h: 8000 * FT, v0: 60, v1: 90, step: 2, flaps: 0, gear: 1 });
  // max level speed at sea level, full throttle (POH 126 KTAS)
  { let lo = 80, hi = 170; const g = v => trimThr(M, v, 1, 0, 1, 30).gamma;
    if (g(hi) > 0) X.vmaxSL = { kt: null, note: 'level at > 170 kt' };
    else { for (let i = 0; i < 40; i++) { const m = 0.5 * (lo + hi); if (g(m) > 0) lo = m; else hi = m; } X.vmaxSL = { keas: 0.5 * (lo + hi) }; }
    const rho = M.atmosphere(M.FIELD.elev + 30, 0).rho; if (X.vmaxSL.keas) X.vmaxSL.ktas = X.vmaxSL.keas / Math.sqrt(rho / RHO0); }
  // cruise 75 % at 8,500 ft ISA, 124 KTAS (POH): thrust power needed / (eta P)
  { const h = 8500 * FT, rho = M.atmosphere(M.FIELD.elev + h, 0).rho, eas = 124 * Math.sqrt(rho / RHO0);
    const a2 = new M.Aircraft(); const T = trim(M, a2, { ias: eas, h, flaps: 0, gear: 1 });
    const Vc = M.AC.eta * M.AC.P / M.AC.T0, Tav = M.AC.T0 * Vc / Math.sqrt(T.V * T.V + Vc * Vc);
    X.cruise85 = { eas, thr: T.thr, powerFrac: T.thr * Tav * T.V / (M.AC.eta * M.AC.P), alpha_deg: T.alpha * RAD }; }
  // approach trim at the POH short-field speed (61 KIAS → 63.9 KCAS), flaps 30, gamma −3°, 300 m
  { const a3 = new M.Aircraft(); const T = trim(M, a3, { ias: 63.9, h: 300, flaps: 1, gear: 1, gammaDeg: -3 });
    X.apprShort = { alpha_deg: T.alpha * RAD, theta_deg: T.theta * RAD, de_deg: T.de * RAD, thr: T.thr }; }
  // steady-heading sideslip for the 15 kt demonstrated crosswind at 63.9 KCAS (sea level): solve δa, δr from
  // Clβ β + Clδa δa + Clδr δr = 0 and Cnβ β + Cnδa δa + Cnδr δr = 0, bank from the side-force balance
  { const A = M.AC, V = 63.9 * KT, beta = Math.asin(15 / 63.9);
    const det = A.Clda * A.Cndr - A.Cldr * A.Cnda;
    const da = (-A.Clb * beta * A.Cndr + A.Cldr * A.Cnb * beta) / det, dr = (-A.Clda * A.Cnb * beta + A.Cnda * A.Clb * beta) / det;
    const CL = A.m * G0 / (0.5 * RHO0 * V * V * A.S), phi = Math.asin(Math.max(-1, Math.min(1, -(A.CYb * beta + A.CYdr * dr) / CL)));
    X.xwind = { beta_deg: beta * RAD, da_deg: da * RAD, dr_deg: dr * RAD, phi_deg: phi * RAD, daMax_deg: A.daMax * RAD, drMax_deg: A.drMax * RAD }; }
  // sensitivity (not a test): the clean polar implied by the POH cruise point (lc_calc cleanPolar) in place of the
  // glide polar, everything else unchanged → what one polar can and cannot match
  { const keep = { CD0: M.AC.CD0, K: M.AC.K }; const sp2 = toSimPolar({ CD0: C.cleanPolar.CD0, K: C.cleanPolar.K });
    M.AC.CD0 = sp2.CD0; M.AC.K = sp2.K;
    let lo = 80, hi = 170; const g = v => trimThr(M, v, 1, 0, 1, 30).gamma;
    for (let i = 0; i < 40; i++) { const m = 0.5 * (lo + hi); if (g(m) > 0) lo = m; else hi = m; }
    const c2 = climbSweep(M, { h: 30, v0: 56, v1: 100, step: 2, flaps: 0, gear: 1 });
    const g2 = glideSweep(M, { h: 3000 * FT, v0: 55, v1: 100, step: 1, thr: 0 });
    X.altPolar = { CD0_sim: sp2.CD0, K_sim: sp2.K, vmaxSL_keas: 0.5 * (lo + hi), Vy_kt: c2.Vy_kt, ROC_fpm: c2.ROCmax_fpm, Vbg_kt: g2.Vbg_kt, LD: g2.LD };
    Object.assign(M.AC, keep); }

  // Gap 17 (19 Nov 2026): reference modes. The card in today's sim at the conditions of the public flight tests:
  // NASA CR-2337 [LC11], a Cessna 177B Cardinal (close Cessna type, NOT a C172): phugoid (Table V), Dutch roll (text
  // p. 26) and full-aileron rolls with the rudder held (Table IV), 80 and 120 mph CAS at 4,000-4,100 ft, test weight
  // about 2,460 lb. The card's static and damping derivatives are already the flight-identified values of NASA
  // TM-80163 [LM5] (a C172 according to KU-M-407-7 [LC13]); a hybrid run with the TM-80163 set swapped in gave the same
  // short period to 0.1 % (only Clr, Cnp, Cnda, Cldr, CYdr differ), so it is no independent reference and is not kept.
  // ias in lm_card.trim is EAS; at 4,000 ft and 70-105 kt CAS ≈ EAS within 0.3 kt.
  const mRef = 2460 * LB, condLo = { ias: 69.5, h: 4000 * FT, gear: 1, gammaDeg: 0 }, condHi = { ias: 104.3, h: 4100 * FT, gear: 1, gammaDeg: 0 };
  const rollRun = c => { // full aileron step from wings-level trim, rudder and elevator held, until φ 60° or 8 s
    const { ac: a1, T } = startTrimmed(M, { ...c, flaps: 0 }); const A = M.AC, a = a1.air, t0 = a1.t;
    a1.cmd.da = A.daMax; a1.cmd.dr = 0; let t30 = null, pmax = 0, b30 = null, bmax = 0, pb2v = 0;
    while (a1.t - t0 < 8 && a.phi < 60 * DEG) { a1.step(dtS); pmax = Math.max(pmax, a.p); bmax = Math.max(bmax, Math.abs(a.beta)); pb2v = Math.max(pb2v, a.p * A.b / (2 * a.V));
      if (t30 == null && a.phi >= 30 * DEG) { t30 = a1.t - t0; b30 = a.beta; } }
    return { t30_s: t30, pmax_dps: pmax * RAD, beta30_deg: b30 == null ? null : b30 * RAD, betaMax_deg: bmax * RAD, pb2V: pb2v, da_deg: A.daMax * RAD, V_ktas: T.V / KT }; };
  const RM = { mass_kg: mRef, cond: { lo: { keas: condLo.ias, h_ft: 4000 }, hi: { keas: condHi.ias, h_ft: 4100 } } };
  { const rc = applyAC(M, buildAC(card, { mass: mRef, config: 'cruise' }));
    for (const [k, c] of [['lo', condLo], ['hi', condHi]]) {
      RM['card_' + k] = pickM(modes(M, { ...c, flaps: 0 }, { adot: true })); RM['roll_card_' + k] = rollRun(c);
    }
    rc(); }
  { const rc = applyAC(M, buildAC(card, { mass: mRef, config: 'approach' })); RM.card_lo_f30 = pickM(modes(M, { ...condLo, flaps: 1 }, { adot: true })); rc(); }
  X.refModes = RM;
  restore();

  // test table ------------------------------------------------------------------------------
  const st = R.stall, md = R.modes;
  const s0 = st['0'], s10 = st['10'], s30 = st['30'];
  const vs45 = 53 / Math.sqrt(Math.cos(45 * DEG)), vs60 = 53 / Math.sqrt(Math.cos(60 * DEG));
  const lapse35 = lapse('ind_friction', 0, 20, { f: 0.10 });
  const lim = (x, lo, hi) => x != null && x >= lo && x <= hi;
  const T = [];
  const add = (id, cond, qty, exp, tol, unit, origin, cur, pass) => T.push({ id, cond, qty, expected: exp, tol, unit, origin, current: cur, pass });

  add('T-LC-01', 'POH p1-2/TCDS: span 36 ft 1 in, wing area 174 ft² (POH) / 175.5 ft² (TCDS)', 'AR = b²/S', 7.48, 0.02, '-',
    'POH [LC1] p1-2; TCDS 3A12 [LC6] ให้ 7.42', r(ac.b ** 2 / ac.S, 3), Math.abs(ac.b ** 2 / ac.S - 7.48) <= 0.02);
  add('T-LC-02', 'normal category, MTOW 2,550 lb: forward limit 41.0 in, aft limit 47.3 in aft of datum; LEMAC 25.9 in, MAC 58.8 in', 'CG เป็น %MAC (fwd / aft)', '25.7 / 36.4', 0.2, '%MAC',
    'POH p2-7/2-8 [LC1]; TCDS MAC/LEMAC [LC3, LC6]; lc_calc.mjs [LC0]', `${C.cg.normal_pctMAC.fwd_mtow} / ${C.cg.normal_pctMAC.aft}`, true);
  add('T-LC-03', 'ตาราง stall ของ POH (Fig 5-3, CG หน้าสุด แฟลปขึ้น, power off): VS0° 53 KCAS', 'VS(φ) = VS0/√cosφ ที่ 45° และ 60°', '63 / 75 (POH)', 1.0, 'KCAS',
    'POH Fig 5-3 (ManualsLib หน้า 146) [LC2]; ทุกช่องของตารางต่างจากสูตรไม่เกิน 0.46 kt', `${r(vs45)} / ${r(vs60)}`, Math.abs(vs45 - 63) <= 1 && Math.abs(vs60 - 75) <= 1);
  add('T-LC-04', '2,550 lb, S 174 ft², VS1 53 / VS0 48 KCAS ถือเป็นความเร็วต่ำสุด (nz 0.95 ที่ Vmin, ลด 1 kt/s)', 'CLmax 1 g แฟลป 0 / 30', '1.464 / 1.785', 0.03, '-',
    'lm_polar.clmaxFromStall kind min [LM0]; นิยาม VS [LM1, LM3]; POH p ii, Fig 5-3 [LC1, LC2]', `ซิมวัด CLmax ${r(s0.CLmax, 3)} / ${r(s30.CLmax, 3)}`, Math.abs(s0.CLmax - 1.464) <= 0.03 && Math.abs(s30.CLmax - 1.785) <= 0.03);
  add('T-LC-05', 'ตาราง airspeed calibration (POH Fig 5-1) ตีความเชิงเส้น', 'KCAS ของ Vy 74 KIAS แฟลปขึ้น / Vref 61 KIAS แฟลป 30 / Vx 62 KIAS', '73.2 / 63.9 / 63.6', 0.1, 'KCAS',
    'POH Fig 5-1 p5-9 [LC2]; lc_calc.mjs [LC0]', `${C.speedsCAS.VY_74} / ${C.speedsCAS.VREF_61_f30} / ${C.speedsCAS.VX_62}`, true);
  add('T-LC-06', 'ซิม: MTOW 1,156.7 kg CG อ้างอิง 27.4 %MAC, 3,000 ft ISA, idle, แฟลป 0, ปีกระดับ, ลด 1 kt/s', 'VS1 (Vmin, KEAS≈KCAS)', 53, 3, 'KCAS',
    'POH p ii, Fig 5-3 [LC1, LC2]; tolerance ±3 kt ตาม Part 60 2.c.8 [R1:V2]', r(s0.Vmin_eas), Math.abs(s0.Vmin_eas - 53) <= 3);
  add('T-LC-07', 'เหมือน T-LC-06 แฟลป 10', 'VS (Vmin)', 51, 3, 'KCAS', 'POH Fig 5-3 [LC2] (CG หน้าสุด)', r(s10.Vmin_eas), Math.abs(s10.Vmin_eas - 51) <= 3);
  add('T-LC-08', 'เหมือน T-LC-06 แฟลป 30', 'VS0 (Vmin)', 48, 3, 'KCAS', 'POH p ii, Fig 5-3 [LC1, LC2]', r(s30.Vmin_eas), Math.abs(s30.Vmin_eas - 48) <= 3);
  const cl = R.climb;
  add('T-LC-09', 'ซิม: MTOW, SL ISA (h 30 m), คันเร่งสุด, แฟลป 0, กวาด IAS ทีละ 2 kt', 'ROCmax / Vy', '730 / 73.2', '±100 fpm (หรือ 5 %) / ±3 kt', 'fpm / KCAS',
    'POH p ii, Fig 5-6 p5-17 [LC1, LC2]; Part 60 1.c.1 [R1:V2]', `${r(cl.ROCmax_fpm, 0)} / ${r(cl.Vy_kt)}`, Math.abs(cl.ROCmax_fpm - 730) <= 100 && Math.abs(cl.Vy_kt - 73.2) <= 3);
  add('T-LC-10', 'เหมือน T-LC-09', 'Vx (γ สูงสุด)', 63.6, 3, 'KCAS', 'POH p4-5 Vx 62 KIAS [LC1] แปลงด้วย Fig 5-1', r(cl.Vx_kt), Math.abs(cl.Vx_kt - 63.6) <= 3);
  add('T-LC-11', 'ซิม: MTOW, 8,000 ft ISA, คันเร่งสุด, แฟลป 0', 'ROCmax', 408, 100, 'fpm', 'POH Fig 5-6 p5-17 [LC2]; ซิมไม่มี power lapse จึงคาดว่าไม่ผ่าน',
    r(X.climb8k.ROCmax_fpm, 0), Math.abs(X.climb8k.ROCmax_fpm - 408) <= 100);
  const gl = R.glide.zeroThrust;
  add('T-LC-12', 'ซิม: MTOW, 3,000 ft ISA, แรงขับศูนย์, แฟลป 0, กวาด IAS ทีละ 1 kt', 'ความเร็วร่อนดีสุด / L/D', '68.4 / 9.1', '±3 kt / ±0.5', 'KCAS / -',
    'POH VG 68 KIAS p3-3 [LC1]; ระยะร่อน 1.5 NM ต่อ 1,000 ft [LC4]; Part 60 1.d.4 (idle descent: ±3 kt) [R1:V2]; L/D ±0.5 ผู้เขียนตั้ง', `${r(gl.Vbg_kt)} / ${r(gl.LD, 2)}`, Math.abs(gl.Vbg_kt - 68.4) <= 3 && Math.abs(gl.LD - 9.1) <= 0.5);
  const to = R.takeoff;
  add('T-LC-13', 'ซิม: short field แฟลป 10, MTOW, SL ISA 15 °C, ลมสงบ, ทางแห้ง, เบรกค้าง 3 s คันเร่งสุด, VR 52 KEAS, θ 12°', 'ground roll', 293, '±5 % หรือ ±61 m', 'm',
    'POH Fig 5-5 p5-14 (960 ft) [LC2]; Part 60 1.b.1 [R1:V2]', r(to.groundRoll_m, 0), Math.abs(to.groundRoll_m - 293) <= 61);
  add('T-LC-14', 'เหมือน T-LC-13', 'ระยะถึง 50 ft', 497, '±10 % (ดัดแปลงจาก 1.b.1)', 'm', 'POH Fig 5-5 p5-14 (1,630 ft) [LC2]', r(to.dist50ft_m, 0), Math.abs(to.dist50ft_m - 497) <= 49.7);
  add('T-LC-15', 'เหมือน T-LC-13 แต่ OAT 35 °C (ISA+20, ค่าประจำของ VTBD ตอนบ่าย)', 'ground roll / ถึง 50 ft', '338 / 572', '±10 %', 'm',
    'POH Fig 5-5 p5-14 ตีความเชิงเส้นระหว่าง 30 และ 40 °C [LC2]; thrustAvail ไม่มีพจน์ ρ จึงคาดว่าสั้นเกิน', `${r(X.toHot.groundRoll_m, 0)} / ${r(X.toHot.dist50ft_m, 0)}`,
    Math.abs(X.toHot.groundRoll_m - 338) <= 33.8 && Math.abs(X.toHot.dist50ft_m - 572) <= 57.2);
  const lm = R.landing.maxBrake, ls = X.ldgShort;
  add('T-LC-16', 'ซิม: autoland ของ Flight, ลมสงบ, 15 °C, MTOW, แฟลป 30, ข้าม threshold ที่ 64 KCAS (= 61 KIAS ตาม short field), เบรกเต็มเมื่อล้อหน้าแตะ', 'ระยะรวมจาก 50 ft ถึงหยุด', 407, '±10 %', 'm',
    'POH Fig 5-11 p5-23/24 (1,335 ft) [LC2]', ls.failed ? 'ล้มเหลว' : `${r(ls.total_m, 0)} (อากาศ ${r(ls.air_m, 0)} + พื้น ${r(ls.ground_m, 0)}); autoland ปกติ Vapp 67 KCAS = ${r(lm.total_m, 0)}`, !ls.failed && Math.abs(ls.total_m - 407) <= 40.7);
  add('T-LC-17', 'เหมือน T-LC-16', 'ground roll (แตะพื้นถึงหยุด)', 175, '±10 % หรือ ±61 m ค่าที่เล็กกว่า = ±17.5 m', 'm',
    'POH Fig 5-11 (575 ft) [LC2]; Part 60 1.e.1 [R1:V2]', ls.failed ? 'ล้มเหลว' : r(ls.ground_m, 0), !ls.failed && Math.abs(ls.ground_m - 175) <= 17.5);
  add('T-LC-18', 'ซิม: MTOW, SL ISA, คันเร่งสุด, แฟลป 0, บินระดับ', 'ความเร็วสูงสุด', 126, 3, 'KTAS', 'POH p ii [LC1]', X.vmaxSL.ktas ? r(X.vmaxSL.ktas) : '> 170', X.vmaxSL.ktas != null && Math.abs(X.vmaxSL.ktas - 126) <= 3);
  add('T-LC-19', 'ซิม: MTOW, 8,500 ft ISA, บินระดับ 124 KTAS', 'กำลังที่ต้องใช้ T·V/(η P)', 0.75, 0.05, '-', 'POH p ii (75 % BHP, 124 KTAS) [LC1]; η ของซิมคงที่ 0.883',
    r(X.cruise85.powerFrac, 3), Math.abs(X.cruise85.powerFrac - 0.75) <= 0.05);
  const sp = md.cruise.sp, ph = md.cruise.ph, drA = md.approach.dr, drC = md.cruise.dr;
  add('T-LC-20', 'ซิม linearise: cruise 110 KCAS 3,000 ft แฟลป 0 (Category B)', 'short period ζ / ωn / CAP', 'ζ 0.30–2.00; ωn 6.5 rad/s (JSBSim c172x, cross-check); CAP ไม่ตัดสิน', 'ζ: ช่วงปิด 0.30–2.00 ส่วนเผื่อ 0; ωn: ±30 % (4.55–8.45 rad/s)', '- / rad/s / 1/s²',
    'MIL-F-8785C Level 1 Class I [R1:V7, R1:V10]; JSBSim c172x 100 KCAS ของรอบที่ 1 [R1:V15]', `${r(sp.zeta, 3)} / ${r(sp.wn, 2)} / ${r(md.cruise.CAP, 2)}`, lim(sp.zeta, 0.3, 2.0) && Math.abs(sp.wn / 6.5 - 1) <= 0.3);
  const Vcr = md.cruise && R.trim.cruise ? R.trim.cruise.V ?? null : null;
  const lanch = (Vcr ?? 110 * KT / Math.sqrt(M.atmosphere(M.FIELD.elev + 3000 * FT, 0).rho / RHO0)) * Math.PI * Math.SQRT2 / G0;
  add('T-LC-21', 'เหมือน T-LC-20', 'phugoid ζ / คาบ', `ζ ≥ 0.04; คาบ Lanchester π√2·V/g = ${r(lanch, 1)} s (ข้อมูลประกอบ ไม่ใช้ตัดสิน)`, 'ζ: ขีดล่างเดียว ส่วนเผื่อ 0; คาบ: ไม่ตัดสิน', '- / s', 'MIL-F-8785C Level 1 [R1:V10, R1:V11]; JSBSim c172x 32 s [R1:V15]',
    `${r(ph.zeta, 3)} / ${r(ph.T, 1)}`, ph.zeta >= 0.04);
  add('T-LC-22', 'ซิม linearise: approach 67 KCAS 300 m แฟลป 30 γ −3° (Category C) และ cruise', 'Dutch roll ωn / ζ / ζωn', 'ζ ≥ 0.08, ζωn ≥ 0.15, ωn ≥ 1.0 (approach)', 'ขีดล่างเดียวทั้งสามค่า ส่วนเผื่อ 0; cruise แสดงอย่างเดียว', 'rad/s / - / rad/s',
    'MIL-F-8785C Level 1 Class I Cat C [R1:V10]; NASA CR-2337 Cardinal ωn 1.6–2.1 [LC11]', `approach ${r(drA.wn, 2)} / ${r(drA.zeta, 3)} / ${r(drA.wn * drA.zeta, 3)}; cruise ${r(drC.wn, 2)} / ${r(drC.zeta, 3)}`,
    drA.zeta >= 0.08 && drA.wn * drA.zeta >= 0.15 && drA.wn >= 1.0);
  add('T-LC-23', 'เหมือน T-LC-22', 'roll mode τR (approach / cruise)', '≤ 1.0 (Cat C) / ≤ 1.4 (Cat B)', 'ขีดบนเดียว ส่วนเผื่อ 0', 's', 'MIL-F-8785C Table 5 [R1:V7, R1:V10]',
    `${r(md.approach.roll_tau, 3)} / ${r(md.cruise.roll_tau, 3)}`, md.approach.roll_tau <= 1.0 && md.cruise.roll_tau <= 1.4);
  const spA = md.approach.spiral, spC = md.cruise.spiral;
  add('T-LC-24', 'เหมือน T-LC-22', 'spiral: เวลาเพิ่มเป็นสองเท่า T₂ (approach / cruise)', 'T₂ ≥ 12 s (Cat C) / ≥ 20 s (Cat B)', 'ขีดล่างเดียว ส่วนเผื่อ 0; spiral ที่ลู่เข้าผ่านเสมอ', 's', 'MIL-F-8785C Table 6 [R1:V7, R1:V10]',
    `${spA.grows ? r(spA.t2, 1) : 'เสถียร'} / ${spC.grows ? r(spC.t2, 1) : 'เสถียร'}`, (!spA.grows || spA.t2 >= 12) && (!spC.grows || spC.t2 >= 20));
  add('T-LC-25', `ลมขวาง 15 kt (demonstrated) ที่ 63.9 KCAS SL, wing-low ไม่มี crab: β = asin(15/63.9) = ${r(X.xwind.beta_deg)}° (±0.1° จากการปัดเศษ)`, 'δr / δa / มุมเอียงที่ต้องใช้', `ขนาด δr ≤ ${r(X.xwind.drMax_deg)}°, ขนาด δa ≤ ${r(X.xwind.daMax_deg)}° (travel เต็มของบัตร); φ แสดงอย่างเดียว`, 'ขีดบนเดียวที่ travel เต็ม ส่วนเผื่อ 0°', 'deg',
    'POH p4-5 [LC1]; travel จาก TCDS [LC3, LC6]; สมการ steady sideslip (Etkin) ใช้อนุพันธ์ของบัตร', `δr ${r(X.xwind.dr_deg)} / δa ${r(X.xwind.da_deg)} / φ ${r(X.xwind.phi_deg)}`,
    Math.abs(X.xwind.dr_deg) <= X.xwind.drMax_deg && Math.abs(X.xwind.da_deg) <= X.xwind.daMax_deg);
  add('T-LC-26', 'เครื่อง IO-360-L2A คันเร่งสุด SL, OAT 35 °C', 'P/P_ISA (indicated-minus-friction, f 0.10)', 0.964, 0.005, '-',
    'lm_engine [LM0]; NACA Rep. 190 [LM17]; เทียบ POH ROC 661/729 = 0.907 ที่ 35 °C [LC2]', r(lapse35, 4), Math.abs(lapse35 - 0.964) <= 0.005);
  add('T-LC-27', 'ใบพัด McCauley 1A170E/JHA7660 (76 in) BEM, SL ISA, คันเร่งสุด, ความเร็วศูนย์', 'static rpm', '2,350', '±50 rpm (ช่วง 2,300–2,400 ของ TCDS)', 'rpm',
    'TCDS IM.A.051 C.6 [LC3]; POH p2-5 [LC1]; lm_prop [LM0]; ซิมไม่มีใบพัด (T0 คงที่ 3,538 N)', C.prop.static.rpm, lim(C.prop.static.rpm, 2300, 2400));
  add('T-LC-28', 'BEM ใบพัดเดิม คันเร่งสุด 180 hp, SL ISA, 126 KTAS', 'rpm ที่สมดุลกำลัง', '≤ 2,700 (rpm สูงสุด)', 'ขีดบนเดียว ส่วนเผื่อ 0', 'rpm',
    'POH p2-5 [LC1]; lm_prop [LM0]', `${C.prop.vmax126.rpm} (J ${C.prop.vmax126.J})`, C.prop.vmax126.rpm <= 2700);
  add('T-LC-29', 'POH Fig 5-5 short field takeoff, 2,550 lb, SL, ตีความเชิงเส้นระหว่าง 30 และ 40 °C', 'ระยะถึง 50 ft ที่ 35 °C', 1878, 10, 'ft', 'POH p5-14 [LC2]; lc_calc.mjs [LC0]', C.hot['35'].to_50_ft, Math.abs(C.hot['35'].to_50_ft - 1878) <= 10);
  add('T-LC-30', 'W/S = 14.66 lb/ft² (2,550 lb, 174 ft²)', 'limit descent velocity V = 4.4 (W/S)^¼ (ไม่ต่ำกว่า 7, ไม่เกิน 10 fps)', 8.61, 0.02, 'fps', '14 CFR 23.473(d) ฉบับ 2011 [LM3] (รอบที่ 1 [R1:G3]); lc_calc.mjs [LC0]', C.part23.Vdesc_fps, Math.abs(C.part23.Vdesc_fps - 8.61) <= 0.02);
  const aps = X.apprShort;
  add('T-LC-31', 'ซิม trim: 63.9 KCAS แฟลป 30 γ −3° ที่ 300 m, MTOW, CG อ้างอิง', 'elevator ที่ต้องใช้ / ระยะเผื่อถึง travel ขึ้น 28°', 'เผื่อ ≥ 10° ไว้ flare (เกณฑ์ภายใน ค่าประมาณ)', 'ขีดล่างเดียว ส่วนเผื่อ 0', 'deg',
    'TCDS travel [LC3, LC6]; เกณฑ์ของผู้เขียน', `de ${r(aps.de_deg)} / α ${r(aps.alpha_deg)} / θ ${r(aps.theta_deg)} / thr ${r(aps.thr, 2)}`, 28 + aps.de_deg >= 10);
  // Gap 17: reference modes (see X.refModes above). Tolerances are the author's (ค่าประมาณ) or 01-methods §01.3.4.
  const RMo = X.refModes, phs = [RMo.card_lo.ph, RMo.card_lo_f30.ph], dl = RMo.card_lo.dr, dh = RMo.card_hi.dr;
  const inR = (x, lo, hi) => x != null && x >= lo && x <= hi;
  add('T-LC-32', 'ซิม linearise: บัตร c172s ที่ 1,115.8 kg (2,460 lb น้ำหนักทดสอบของ CR-2337), 69.5 KEAS (80 mph CAS), 4,000 ft ISA, แฟลป 0 และแฟลป 30', 'phugoid คาบ / ζ (แฟลป 0; แฟลป 30)', 'คาบ 18.3 s (4 รัน 17.6–19.4 s); ζ 0.044–0.061',
    'คาบ ±20 % (14.6–22.0 s); ζ 0.02–0.12 (×0.5 ถึง ×2 ของช่วงที่วัด ค่าประมาณ เพราะเป็นเครื่องต่างแบบ)', 's / -', 'NASA CR-2337 Table V (Cessna 177B Cardinal ไม่ใช่ C172) [LC11]',
    `แฟลป 0: ${r(phs[0].T, 1)} / ${r(phs[0].zeta, 3)}; แฟลป 30: ${r(phs[1].T, 1)} / ${r(phs[1].zeta, 3)}`, phs.every(p => p && p.T && Math.abs(p.T / 18.3 - 1) <= 0.2 && inR(p.zeta, 0.02, 0.12)));
  add('T-LC-33', 'เหมือน T-LC-32 แฟลป 0 ที่ 69.5 และ 104.3 KEAS (80 และ 120 mph CAS)', 'Dutch roll ωn / ζ (69.5; 104.3 KEAS)', 'ωn ≈ 1.60 / ≈ 2.1 rad/s; ζ > 0.5 / > 0.4',
    'อัตราส่วนค่าจริง/บัตร ωn 0.90–1.45, ζ 0.60–1.40 [LM0 §01.3.4 ค่าประมาณ] → บัตรต้องได้ ωn 1.10–1.78 / 1.45–2.33 rad/s และ ζ ≥ 0.36 / ≥ 0.29', 'rad/s / -',
    'NASA CR-2337 หน้า 26 (ข้อความ; รายงานบอกว่าการหน่วงสูงทำให้สกัดตัวเลขได้ไม่แม่น) [LC11]', `69.5: ${r(dl.wn, 2)} / ${r(dl.zeta, 3)}; 104.3: ${r(dh.wn, 2)} / ${r(dh.zeta, 3)}`,
    inR(1.6 / dl.wn, 0.9, 1.45) && inR(2.1 / dh.wn, 0.9, 1.45) && dl.zeta >= 0.5 / 1.4 && dh.zeta >= 0.4 / 1.4);
  const rl = RMo.roll_card_lo, rh = RMo.roll_card_hi;
  add('T-LC-34', 'ซิมเวลาจริง 240 Hz: trim ระดับแฟลป 0 ที่ 1,115.8 kg 4,000 ft, aileron เต็มทันที (อัตราของซิม 80°/s), rudder และ elevator ค้าง, ไม่มีลม', 'อัตราม้วนสูงสุด p_max (69.5; 104.3 KEAS)', '34.7 / 54.5 °/s (เฉลี่ย 4 รัน ช่วง 33.2–35.9 / 53.8–54.7)',
    '±25 % (ค่าประมาณ ผู้เขียนตั้ง: aileron ของ Cardinal ต่างจาก C172)', 'deg/s', 'NASA CR-2337 Table IV [LC11]',
    `${r(rl.pmax_dps)} / ${r(rh.pmax_dps)}; ข้อมูลประกอบ: เวลาถึง 30° ${r(rl.t30_s, 2)} / ${r(rh.t30_s, 2)} s (วัด 1.02–1.41 / 0.70–0.74), pb/2V ${r(rl.pb2V, 3)} / ${r(rh.pb2V, 3)} (วัด 0.083–0.090 / 0.090–0.098), β ที่ 30° ${r(rl.beta30_deg)} / ${r(rh.beta30_deg)}° (วัด 8.5–11 / 3–3.5)`,
    Math.abs(rl.pmax_dps / 34.7 - 1) <= 0.25 && Math.abs(rh.pmax_dps / 54.5 - 1) <= 0.25);  // Gap 18 (19 Nov 2026): stick force per g target band (requirement-derived, est); the sim has no stick-force model
  const sfb = stickForceBand({ nAlpha: md.cruise.nAlpha, nL: 3.8, W_lb: 2550 });
  add('T-LC-35', `ดึงคันบังคับใน turn หรือ pull-up ที่ cruise 110 KCAS 3,000 ft MTOW (n/α ของบัตร ${r(md.cruise.nAlpha, 1)} g/rad)`, 'แรงที่ wheel ต่อ g (Fs/g)', `${sfb.fs_per_g_lbf.min}–${sfb.fs_per_g_lbf.max} lbf/g (${sfb.fs_per_g_N.min}–${sfb.fs_per_g_N.max} N/g)`,
    'ช่วงปิด ส่วนเผื่อ 0 (แถบเป้าหมายค่าประมาณ ไม่ใช่ค่าที่วัดจาก C172)', 'lbf/g', 'MIL-F-8785C Level 1 wheel [R1:C12]; 14 CFR 23.155 [LM3]; lc_cardfix.stickForceBand',
    'ไม่รองรับในซิมวันนี้ (ซิมไม่มีแบบจำลองแรงที่คันบังคับ)', null);

  return { type: 'c172s', mass_kg: MTOW, travel: { source: 'card controls.surfaces.<s>.v.travel_deg via lm_card.travelOf (D2)', card_rad: { deUp: ac.deUp, deDn: ac.deDn, daMax: ac.daMax, drMax: ac.drMax } }, tests: T, raw: { stall: R.stall, climb: R.climb, glide: R.glide, trim: R.trim, modes: R.modes, takeoff: R.takeoff, landing: R.landing, extra: X } };
}

if (isMainModule(import.meta.url)) {
  const o = await run();
  fs.writeFileSync(path.join(HERE, 'out', 'lc_tests.json'), JSON.stringify(o, (k, v) => (typeof v === 'number' ? +v.toPrecision(5) : v), 1));
  const pf = p => (p === true ? 'ผ่าน' : p === false ? '**ไม่ผ่าน**' : '–');
  const tol = t => (t.tol == null || t.tol === '-' ? '' : typeof t.tol === 'number' ? ` ± ${t.tol}` : String(t.tol).startsWith('±') ? ` (${t.tol})` : ` (เกณฑ์: ${t.tol})`);
  const unit = t => (t.unit === '-' ? '' : ` ${t.unit}`);
  const rows = o.tests.map(t => `| ${t.id} | ${t.cond} | ${t.qty} | ${t.expected}${tol(t)}${unit(t)} | ${t.origin} | ${t.current} (${pf(t.pass)}) |`);
  const md = '| รหัส | เงื่อนไข | ปริมาณที่วัด | ผลคาดหวัง ± tolerance | ที่มา | โมเดลปัจจุบัน (บัตรนี้ในฟิสิกส์ปัจจุบัน) |\n|---|---|---|---|---|---|\n' + rows.join('\n');
  fs.writeFileSync(path.join(HERE, 'out', 'lc_tests.md'), md + '\n');
  console.log(md);
  console.log(`\n${o.tests.length} tests, pass ${o.tests.filter(t => t.pass).length}, fail ${o.tests.filter(t => t.pass === false).length}`);
}
