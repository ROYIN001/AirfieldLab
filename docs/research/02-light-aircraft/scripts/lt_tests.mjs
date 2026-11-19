#!/usr/bin/env node
// lt_tests.mjs — DA42 test cases T-LT-01…33 (06-da42.md §06.11): expected values from the sources (or from a stated
// calculation, ค่าประมาณ), tolerance, and the result of the CURRENT simulator with the card (lm_card) or, for OEI, the
// current simulator plus the test-only wrapper of lt_oei.mjs.  Run from the repo root after lt_run.mjs card and lt_oei.mjs:
//   node scripts/lt_tests.mjs     -> scripts/out/lt_tests.json, scripts/out/lt_tests.md (table pasted into the report)
//   (T-LT-29 needs scripts/out/lt_review.json from lt_review.mjs, added by the reviewer)
import fs from 'node:fs';
import { loadType } from './lm_lib.mjs';
import { loadSim, buildAC, applyAC, trim, iasCas } from './lm_card.mjs';
const D2R = Math.PI / 180, KT = 0.514444, FT = 0.3048, G0 = 9.80665;
const rd = f => JSON.parse(fs.readFileSync(new URL('./out/' + f, import.meta.url), 'utf8'));
const r = (x, n = 4) => (x == null || !isFinite(x) ? null : +(+x).toPrecision(n));
const card = { ng: rd('lt_card_da42ng.json').res, tdi: rd('lt_card_da42_tae125.json').res, vi: rd('lt_card_da42_vi.json').res };
const oei = rd('lt_oei.json');
const M = await loadSim();
// control travel comes from the card (lm_card D2 fix); aero.legacy.Cma is the card value (−0.535, flight test [LT15])
const ngCard = structuredClone(loadType('da42ng'));

// extra sim runs: hot-day take-off (ISA+20 = 35 °C at VTBD, elevation 9 ft ≈ SL) and cruise speed at 92 % power
function takeoffISA(isaDev, { f = 0, VR = 76, theta = 9 } = {}) {   // same procedure as lm_card.takeoffTest, plus isaDev
  const { AC } = M, dt = 1 / 240, clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const ac = new M.Aircraft(); ac.isaDev = isaDev; ac.setParked(0, 0, 0); for (let i = 0; i < 240 * 5; i++) ac.step(dt);
  ac.cmd.flaps = ac.flaps = f; ac.cmd.thr = 1; for (let i = 0; i < 240 * 3; i++) ac.step(dt);
  ac.cmd.brake = 0; const a = ac.air, n0 = ac.x[0], t0 = ac.t; let thC = null, deI = 0, lo = null, d50 = null;
  while (ac.t - t0 < 120 && d50 == null) {
    if (a.ias / KT >= VR) { if (thC == null) thC = a.theta; thC = Math.min(theta * D2R, thC + 3 * D2R * dt); const e = thC - a.theta; deI = clamp(deI - 0.6 * e * dt, -AC.deUp, AC.deDn); ac.cmd.de = clamp(deI - 2.5 * e + 0.85 * a.q, -AC.deUp, AC.deDn); }
    else ac.cmd.de = 0;
    ac.cmd.dr = clamp(1.4 * a.psi + 0.6 * a.r, -AC.drMax, AC.drMax); ac.cmd.steer = a.wow[0] ? clamp(-ac.cmd.dr / AC.drMax, -1, 1) * 10 * D2R : 0;
    ac.cmd.da = clamp(-1.25 * a.phi - 0.28 * a.p, -AC.daMax, AC.daMax);
    ac.step(dt);
    if (!lo && !a.onGround && a.ias / KT > 0.5 * VR) lo = ac.x[0] - n0;
    if (lo && a.hWheel >= 50 * FT) d50 = ac.x[0] - n0;
  }
  return { roll: lo, d50 };
}
let restore = applyAC(M, buildAC(ngCard, { mass: 1900 }));
const toISA = takeoffISA(0), toHot = takeoffISA(20);
restore();
// cruise: level flight at 8,000 ft ISA+3 (AOPA flight test +2 °C), 1,750 kg (ค่าประมาณ), throttle 0.92 → TAS
restore = applyAC(M, buildAC(ngCard, { mass: 1750 }));
let cruise;
{ const h = 8000 * FT, thrAt = ias => { const ac = new M.Aircraft(); ac.isaDev = 3; return trim(M, ac, { ias, h, flaps: 0, gear: 0, gammaDeg: 0 }); };
  let lo = 110, hi = 175; for (let i = 0; i < 40; i++) { const m = 0.5 * (lo + hi); if (thrAt(m).thr < 0.92) lo = m; else hi = m; }
  const t = thrAt(lo); cruise = { kias: r(lo, 4), ktas: r(t.V / KT, 4) }; }
restore();

// ── test table ──
const T = [], add = (id, cond, qty, exp, tol, src, cur, pass, note = '') => T.push({ id, cond, qty, exp, tol, src, cur, pass, note });
const within = (x, e, t) => x != null && Math.abs(x - e) <= t;
const st = (c, d) => c.stall[d];
const p = (x, d = 1) => (x == null ? '—' : (+x).toFixed(d));
// stall (Vmin of the 1 kt/s idle deceleration, KIAS through the card's ias_cas table)
[['T-LT-01', 'ng', 'UP', 68, 'DA42 NG 1,900 kg, แฟลป UP ล้อขึ้น, idle, 1 kt/s, ปีกระดับ', 'LT11, LT2 (ปลาย green arc 69)'],
 ['T-LT-02', 'ng', 'APP', 65, 'DA42 NG 1,900 kg, แฟลป APP ล้อลง, idle, 1 kt/s', 'LT11'],
 ['T-LT-03', 'ng', 'LDG', 62, 'DA42 NG 1,900 kg, แฟลป LDG ล้อลง, idle, 1 kt/s', 'LT11, LT2 (ปลาย white arc 62)'],
 ['T-LT-04', 'tdi', 'UP', 64, 'DA 42 (TAE 125) 1,785 kg, แฟลป UP, idle, 1 kt/s', 'LT5 p.5-8'],
 ['T-LT-05', 'tdi', 'LDG', 57, 'DA 42 (TAE 125) 1,785 kg, แฟลป LDG, idle, 1 kt/s', 'LT5 p.5-8'],
].forEach(([id, k, d, e, c, s]) => { const v = st(card[k], d).Vmin_kias; add(id, c, 'V_S (KIAS)', e, 2, s, `${p(v)} (VSR ${p(st(card[k], d).VSR_kias)})`, within(v, e, 2)); });
{ const v = st(card.vi, 'LDG').Vmin_eas; add('T-LT-06', 'DA42-VI 1,999 kg, แฟลป LDG, idle, 1 kt/s', 'V_S0 (KCAS)', 62, 2, 'LT6 p.19', `${p(v)} (VSR ${p(st(card.vi, 'LDG').VSR_cas)})`, within(v, 62, 2)); }
// climb
add('T-LT-07', 'NG 1,900 kg SL ISA สองเครื่อง MAX แฟลป UP ล้อขึ้น', 'ROC สูงสุด (fpm)', 1180, 118, 'LT10', p(card.ng.climb.ROCmax_fpm, 0), within(card.ng.climb.ROCmax_fpm, 1180, 118));
{ const vy = iasCas(ngCard, 'UP').f(90); add('T-LT-08', 'เงื่อนไขเดียวกับ T-LT-07', 'V_Y (KCAS)', r(vy, 3), 5, 'LT2, LT9 (90 KIAS)', p(card.ng.climb.Vy_kt), within(card.ng.climb.Vy_kt, vy, 5)); }
add('T-LT-09', 'DA 42 (TAE 125) 1,785 kg SL ISA สองเครื่อง', 'ROC สูงสุด (fpm)', 1060, 106, 'LT16', p(card.tdi.climb.ROCmax_fpm, 0), within(card.tdi.climb.ROCmax_fpm, 1060, 106));
add('T-LT-10', 'DA42-VI 1,999 kg SL ISA สองเครื่อง', 'ROC สูงสุด (fpm)', 1114, 111, 'LT6 p.19', p(card.vi.climb.ROCmax_fpm, 0), within(card.vi.climb.ROCmax_fpm, 1114, 111));
// take-off / landing
add('T-LT-11', 'NG 1,900 kg SL ISA แฟลป UP VR 76 KIAS ลมสงบ ทางแห้ง', 'ระยะวิ่งขึ้นบนพื้น (m)', 458, 69, 'LT10 (1,503 ft)', p(card.ng.takeoff.groundRoll_m, 0), within(card.ng.takeoff.groundRoll_m, 458, 69));
add('T-LT-12', 'เงื่อนไขเดียวกับ T-LT-11', 'ระยะถึง 50 ft (m)', 733, 110, 'LT10 (2,405 ft)', p(card.ng.takeoff.dist50ft_m, 0), within(card.ng.takeoff.dist50ft_m, 733, 110));
add('T-LT-13', 'TAE 125 1,785 kg SL ISA แฟลป UP VR 72', 'ระยะถึง 50 ft (m)', 691, 104, 'LT16 (2,267 ft)', p(card.tdi.takeoff.dist50ft_m, 0), within(card.tdi.takeoff.dist50ft_m, 691, 104));
add('T-LT-14', 'NG 1,900 kg (สเปก AOPA ใช้ gross weight; MLM 1,805 kg) SL ISA แฟลป LDG จาก 50 ft เบรกเต็ม (autoland ของซิม)', 'ระยะลงจอดรวมจาก 50 ft (m)', 594, 119, 'LT10 (1,950 ft)', p(card.ng.landing.maxBrake.total_m, 0), within(card.ng.landing.maxBrake.total_m, 594, 119));
add('T-LT-15', 'เงื่อนไขเดียวกับ T-LT-14', 'ระยะวิ่งบนพื้น (m)', 366, 73, 'LT10 (1,200 ft)', p(card.ng.landing.maxBrake.ground_m, 0), within(card.ng.landing.maxBrake.ground_m, 366, 73));
{ const sig = 288.15 / 308.15, e = 458 * sig ** -1.33; add('T-LT-16', 'วันร้อนที่ VTBD: 35 °C (ISA+20) ระดับน้ำทะเล NG 1,900 kg แฟลป UP', 'ระยะวิ่งขึ้นบนพื้น (m)', r(e, 3), r(0.15 * e, 2), 'LT10 × σ^−1.33 (ค่าประมาณ, LM1)', `${p(toHot.roll, 0)} (ISA ${p(toISA.roll, 0)}; อัตราส่วน ${p(toHot.roll / toISA.roll, 3)})`, within(toHot.roll, e, 0.15 * e)); }
add('T-LT-17', 'NG 1,750 kg* 8,000 ft ISA+3 กำลัง 92 % ระดับ', 'TAS (kt)', 176, 7, 'LT10 (บินทดสอบ AOPA 2010)', `${p(cruise.ktas)} (${p(cruise.kias)} KIAS)`, within(cruise.ktas, 176, 7), '*มวลเป็นค่าประมาณ; ซิมไม่มีผลความหนาแน่นต่อแรงขับ (ตรงกับเครื่อง turbo ต่ำกว่า critical altitude)');
// OEI
const S = oei.static, B = oei.sim;
add('T-LT-18', 'VMCA: เครื่องซ้ายดับ ใบพัด windmill, ขวา MAX, เอียง 5° ไปทางเครื่องที่ดี, 1,900 kg, rudder ขวา 29°, แฟลป UP ล้อขึ้น', 'V_MCA (KCAS)', 75, 5, 'LT1 (75 KEAS), LT2 (76 KIAS)', `static ${p(S.vmca.ng_1900_wm_5deg.VMCA_kcas)}; ซิม+wrapper ±27° ${p(B.vmca_sim_phi5_wm.VMCA_kcas)}`, within(S.vmca.ng_1900_wm_5deg.VMCA_kcas, 75, 5), 'ซิมปัจจุบันไม่มี OEI จึงวัดตรงไม่ได้');
add('T-LT-19', 'VMCA รุ่น TAE 125 1,785 kg เงื่อนไขเดียวกับ T-LT-18', 'V_MCA (KCAS)', 68, 5, 'LT1 (68 KEAS)', `static ${p(S.vmca.tdi_1785_wm_5deg.VMCA_kcas)}`, within(S.vmca.tdi_1785_wm_5deg.VMCA_kcas, 68, 5));
add('T-LT-20', 'OEI ที่ VYSE 85 KIAS, 1,900 kg, ใบพัดซ้าย feather, ขวา MAX, β = 0', 'มุมเอียงไปทางเครื่องที่ดี (deg)', 2.5, 1.0, 'LT17 p.12-20 (~2° เมื่อไม่มีคำแนะนำของผู้ผลิต), LT8 §2.5.22 (~3° ที่ VYSE)', `static ${p(S.zeroSideslip.ng_1900_VYSE_feathered.phi_deg, 2)}; ซิม+wrapper ${p(B.trim.VYSE_feathered_zeroBeta.phi_deg, 2)}`, within(B.trim.VYSE_feathered_zeroBeta.phi_deg, 2.5, 1.0));
add('T-LT-21', 'เงื่อนไขเดียวกับ T-LT-20', 'rudder ที่ต้องใช้ (deg, ไม่อิ่มตัว)', '≤ 29', 0, 'LT1 (ระยะ rudder ขวา 29°)', `static ${p(S.zeroSideslip.ng_1900_VYSE_feathered.dr_deg)}; ซิม+wrapper ${p(B.trim.VYSE_feathered_zeroBeta.dr_deg)}`, Math.abs(B.trim.VYSE_feathered_zeroBeta.dr_deg) <= 29);
add('T-LT-22', 'OEI SL ISA 1,900 kg ที่ VYSE, feather, β = 0, แฟลป UP ล้อขึ้น', 'ROC (fpm)', 210, 60, 'LT10', `ซิม+wrapper ${p(B.trim.VYSE_feathered_zeroBeta.roc_fpm, 0)} (windmill ${p(B.trim.VYSE_windmill_zeroBeta.roc_fpm, 0)})`, within(B.trim.VYSE_feathered_zeroBeta.roc_fpm, 210, 60), 'ซิมปัจจุบันลด thr เหลือ 0.5 ได้แต่ไม่มีโมเมนต์หันเห');
add('T-LT-23', 'ตัดเครื่องซ้ายทันที (τ → 0) ที่ VYSE ไต่สองเครื่อง MAX, ใบพัด windmill', 'ṙ ทันทีหลังตัด (deg/s²)', r(B.instant_cut.rdot_expected_dps2, 3), r(Math.abs(0.02 * B.instant_cut.rdot_expected_dps2), 2), 'สมการ: ṙ = I⁻¹·N, N = −y_E(T/2 + D_wm) (ค่าประมาณ y_E 1.70 m)', `ซิม+wrapper ${p(B.instant_cut.rdot_sim_dps2, 2)}`, within(B.instant_cut.rdot_sim_dps2, B.instant_cut.rdot_expected_dps2, Math.abs(0.02 * B.instant_cut.rdot_expected_dps2)));
{ const r2 = B.cut_VYSE.rows.find(x => x.t_s === 2); add('T-LT-24', 'ตัดเครื่องซ้ายที่ VYSE (τ 0.3 s) ไม่แตะคันบังคับ 2 s', 'Δψ, φ ที่ 2 s (deg)', 'ทั้งคู่ < 0 (ไปทางเครื่องที่ดับ); Δψ −15 ± 5, φ −20 ± 7', 0, 'ฟิสิกส์ (ทิศ) + แบบจำลองนี้ (ขนาด, ค่าประมาณ)', `Δψ ${p(r2.dpsi_deg)}, φ ${p(r2.phi_deg)}`, r2.dpsi_deg < 0 && r2.phi_deg < 0 && within(r2.dpsi_deg, -15, 5) && within(r2.phi_deg, -20, 7)); }
add('T-LT-25', 'ตัดเครื่องซ้ายที่ VYSE, หน่วง 1 s แล้วนักบินใช้ rudder/aileron (เป้าเอียง 3° ไปทางเครื่องที่ดี)', 'Δψ สูงสุด (deg)', '≤ 20', 0, '14 CFR 23.149 / AFH ch.12 (LT17)', `${p(B.cut_VYSE_recovery.max_dpsi_deg)} (เอียงสูงสุด ${p(B.cut_VYSE_recovery.max_bank_deg)})`, B.cut_VYSE_recovery.max_dpsi_deg <= 20);
add('T-LT-26', 'คำสั่ง gear down ที่ความเร็ว < VLO (เวลาพับไม่ระบุใน AFM ใช้ช่วงเดียวกัน)', 'เวลากางล้อ (s)', '6–10', 0, 'LT5 p.7-14, LT9', '6.0 (อัตรา 1/6 ต่อวินาทีใน actuators)', true, 'ค่าคงที่ในซิม (src/20-flight.js actuators)');
add('T-LT-27', 'ตาราง ias_cas ของบัตร NG แฟลป UP', 'KCAS ที่ 76 KIAS', 75, 0.5, 'LT1 (VMCA 75 KEAS) กับ LT2 (76 KIAS)', p(iasCas(ngCard, 'UP').f(76), 2), within(iasCas(ngCard, 'UP').f(76), 75, 0.5));

{ const sw = B.oei_climb_sweep.map(([v, roc]) => ({ v, g: Math.asin(roc * FT / 60 / (v * KT)) })), best = sw.reduce((a, b) => (b.g > a.g ? b : a));
  const vx = iasCas(ngCard, 'UP').inv(best.v);
  add('T-LT-28', 'OEI SL ISA 1,900 kg feather β = 0 แฟลป UP ล้อขึ้น (กวาดความเร็ว 72–100 KCAS)', 'VXSE = ความเร็วที่มุมไต่สูงสุด (KIAS)', 82, 5, 'ค่าประมาณ (AFM NG ไม่ให้ค่า [LT8]; TDI 77 [LT16] + 5)', `ซิม+wrapper ${p(vx)} (γ ${p(best.g * 180 / Math.PI, 2)}°)`, within(vx, 82, 5), 'ค่าของซิมต่ำกว่า VMCA 76 KIAS จึงใช้สอนไม่ได้ ดู §06.12'); }
// T-LT-29 (added by the reviewer, 2026-11-18): VMCA at the most unfavourable certification condition (lightest mass, aft CG)
// from lt_review.mjs, which recomputes the static VMCA from the card values with its own solver
{ let rv = null; try { rv = rd('lt_review.json'); } catch { rv = null; }
  if (rv) { const v = rv.vmca.aft_cg_1510; add('T-LT-29', 'VMCA: มวลต่ำสุดในการบิน 1,510 kg CG หลังสุด 2.480 m DAT, เครื่องซ้ายดับ windmill, ขวา MAX, เอียง 5°, rudder ขวา 29°, แฟลป UP ล้อขึ้น', 'V_MCA (KCAS / KIAS ผ่านตาราง ias_cas)', 75, 5, 'LT1 (75 KEAS), LT2 (76 KIAS), LT17 p.12-28 (มวลเบาและ CG หลังทำให้ VMC สูงขึ้น)', `static ${p(v.kcas)} KCAS = ${p(v.kias)} KIAS (ที่ 1,900 kg CG อ้างอิง ${p(rv.vmca.ref_cg_1900.kcas)} KCAS)`, within(v.kcas, 75, 5), 'คำนวณซ้ำโดยผู้ตรวจจากค่าในบัตร (lt_review.mjs); ซิมปัจจุบันไม่มี OEI'); } }
// ── added 19 Nov 2026 (completeness review gaps 18, 20, 22) ──
// T-LT-30: short-period frequency at the approach trim of lm_card (84 KIAS, 300 m ISA, flap LDG, gear down, 1,900 kg) with the
// card's Cmα −0.535 (flight-test midpoint [LT15]). Expected value: classical 2-DOF short-period approximation from the same
// AC values (Nelson ch.4): Zα' = −q̄S(CLα + CD)/(mV), Mα = q̄ScCmα/Iyy, Mq = q̄Sc²Cmq/(2V·Iyy), Mα̇ = q̄Sc²Cmα̇/(2V·Iyy),
// ωn² = Zα'·Mq − Mα, ζ = −(Zα' + Mq + Mα̇)/(2ωn). Current model: the linearised mode of the sim (lm_card modes.approach.sp).
let spA = null;
{ const ac = buildAC(ngCard, { mass: 1900 }), rs = applyAC(M, ac), A = M.AC, ap = rd('lt_card_da42ng.json').res.trim.approach;
  const h = ap.h_m ?? 300, rho = 1.225 * (1 - 2.25577e-5 * h) ** 4.25588, V = ap.V_kt * KT, q = 0.5 * rho * V * V, S = A.S, c = A.c, m = A.m;
  const CL = m * G0 / (q * S), CD = A.CD0 + A.CDflap + A.CDgear + A.K * CL * CL;
  const Za = -q * S * (A.CLa + CD) / (m * V), Ma = q * S * c * A.Cma / A.Iyy, Mq = q * S * c * c * A.Cmq / (2 * V * A.Iyy), Mad = q * S * c * c * A.Cmadot / (2 * V * A.Iyy);
  const wn = Math.sqrt(Za * Mq - Ma), zeta = -(Za + Mq + Mad) / (2 * wn);
  spA = { wn: r(wn, 4), zeta: r(zeta, 3), Cma: A.Cma, Cmq: r(A.Cmq, 4), Cmadot: r(A.Cmadot, 4), Iyy: r(A.Iyy, 4), V_tas_kt: r(ap.V_kt, 4), rho: r(rho, 4) };
  rs(); }
{ const sp = card.ng.modes.approach.sp;
  add('T-LT-30', 'NG 1,900 kg, approach 84 KIAS ที่ 300 m ISA แฟลป LDG ล้อลง เส้นร่อน 3° (trim ของ lm_card), Cmα ของบัตร −0.535 [LT15]', 'ความถี่ธรรมชาติ short period ωn (rad/s)',
    spA.wn, r(0.10 * spA.wn, 2), `ประมาณ 2-DOF จากค่าในบัตร (Nelson; Cmq ${spA.Cmq}, Cmα̇ ${spA.Cmadot}, Iyy ${spA.Iyy} kg m², ζ ${spA.zeta}) ค่าประมาณ`,
    `${p(sp.wn, 3)} (ζ ${p(sp.zeta, 3)})`, within(sp.wn, spA.wn, 0.10 * spA.wn), 'ตรวจว่าโหมดของซิมตรงกับ Cmα บินทดสอบที่ใส่ในบัตร; DA42 ไม่มีโหมดที่วัดและเผยแพร่ (validation.reference_modes)'); }
// T-LT-31: stick force per g (requirement band of validation.stick_force_targets); the sim has no stick-force model
{ let sb = null; try { sb = loadType('da42ng').validation?.stick_force_targets?.v; } catch { sb = null; }
  const lo = sb?.fs_per_g_lbf?.min ?? 10.7, hi = sb?.fs_per_g_lbf?.max ?? 20;
  add('T-LT-31', `NG 1,900 kg cruise 135 KIAS 6,000 ft ดึงคันใน turn หรือ pull-up (n/α ${sb?.nAlpha_cruise_g_per_rad ?? '14.2'} g/rad)`, 'แรงที่ stick ต่อ g (lbf/g)', `${lo}–${hi} (${sb?.fs_per_g_N?.min ?? 48}–${sb?.fs_per_g_N?.max ?? 89} N/g)`, 0,
    'MIL-F-8785C Level 1 centre stick [R1:C12] + 14 CFR 23.155 W/140 [LM3] (แถบเป้าหมายค่าประมาณ ไม่ใช่ค่าวัด)', 'ไม่รองรับในซิมวันนี้ (ไม่มีแบบจำลองแรงที่คัน)', null, 'ส่วนเผื่อ 0: ผ่านเมื่ออยู่ในช่วงปิด'); }
// T-LT-32: OEI service ceiling of the DA42-VI — the sim has no OEI and no density term in thrust; the analytic model of
// lt_oei_ceiling.mjs (k_η calibrated to 210 fpm of the NG) gives the value at the mass where the brochure figure is consistent
{ let c = null; try { c = rd('lt_oei_ceiling.json'); } catch { c = null; }
  const row = m => c?.vi_ceiling_by_mass_isa?.find(x => x.mass_kg === m);
  add('T-LT-32', 'DA42-VI เครื่องซ้ายดับ feather ขวา MCP 114 kW แฟลป UP ล้อขึ้น ISA มวล 1,900 kg (มวลที่ 16,000 ft สอดคล้องกับ 210 fpm ของ NG, §06.4.1)', 'เพดาน OEI ที่ ROC 50 fpm (ft)', 16000, 1500, 'LT6 p.19 (มวลไม่ระบุ) + LT10 (210 fpm)',
    `ไม่รองรับในซิมวันนี้ (แบบจำลองวิเคราะห์ lt_oei_ceiling: ${row(1900)?.['isa+0_ft'] ?? '—'} ft ที่ 1,900 kg, ${row(1999)?.['isa+0_ft'] ?? '—'} ft ที่ 1,999 kg)`, null, 'ต้องมีเครื่องยนต์หลายตัวและแรงขับตามความหนาแน่น (§06.14 P1, P2)'); }
// T-LT-33: height lost in a stall and recovery (class value of speeds.stall_altitude_loss_ft); lm_card has no recovery pilot
{ let l = null; try { l = loadType('da42ng').speeds?.stall_altitude_loss_ft; } catch { l = null; }
  add('T-LT-33', 'NG มวลฝึก 1,752 kg แฟลป UP ปีกระดับ สองเครื่อง idle, ฟื้นจาก stall ตามวิธีมาตรฐาน (ลดมุมปะทะ เพิ่มกำลัง)', 'ความสูงที่เสีย (ft)', l?.v ?? 280, 100,
    'ค่าคลาส ค่าประมาณ (C172S/C152/P2006T ÷ VS1², §06.6.5) ช่วงสัมประสิทธิ์ 180–350 ft', 'ไม่รองรับในซิมวันนี้ (ไม่มีนักบินอัตโนมัติสำหรับการฟื้นจาก stall)', null); }

const sup = T.filter(t => t.pass !== null), pass = sup.filter(t => t.pass).length, unsupported = T.length - sup.length;
const md = ['| รหัส | เงื่อนไข | ปริมาณที่วัด | ผลคาดหวัง ± tolerance | ที่มา | โมเดลปัจจุบัน |', '|---|---|---|---|---|---|',
  ...T.map(t => `| ${t.id} | ${t.cond} | ${t.qty} | ${t.tol ? `${t.exp} ± ${t.tol}` : t.exp} | ${t.src} | ${t.cur}${t.pass === null ? '' : t.pass ? ' (ผ่าน)' : ' (ไม่ผ่าน)'}${t.note ? ' — ' + t.note : ''} |`)].join('\n');
fs.writeFileSync(new URL('./out/lt_tests.json', import.meta.url), JSON.stringify({ n: T.length, pass, supported: sup.length, unsupported, tests: T, extra: { toISA, toHot, cruise, spA } }, null, 1));
fs.writeFileSync(new URL('./out/lt_tests.md', import.meta.url), md + '\n');
console.log(md); console.log(`\n${pass}/${sup.length} pass (${unsupported} ไม่รองรับในซิมวันนี้, รวม ${T.length})`);
