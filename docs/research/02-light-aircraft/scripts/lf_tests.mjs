#!/usr/bin/env node
// lf_tests.mjs — test cases T-LF-01..T-LF-24 for the c152 card (topic 11): expected values computed here from the POH/TCDS
// numbers in lf_calc.F (or from physics/definitions), current-model results measured with today's sim through lf_card.run
// (lm_card; since D2 of 19 Nov 2026 it reads the card's control travel itself, no workaround). Writes scripts/out/lf_tests.json and lf_tests.md (table for §11.12).
// Run from the repo root: node <this folder>/lf_tests.mjs        exit 1 if a test marked `must` fails
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { F, compute, iasToCas, LB, IN, FT, KT } from './lf_calc.mjs';
import { run } from './lf_card.mjs';
import { loadType, val } from './lm_lib.mjs';
import { buildAC, applyAC, loadSim, takeoffTest, trim, climbSweep, iasCas } from './lm_card.mjs';
import { clmaxFromStall, stallSpeed } from './lm_polar.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const G0 = 9.80665;
const C = compute();
const R = (await run({ mass: 757.5 })).res;
const card = loadType('c152');
const M = await loadSim();

// extra current-model measurements: max level speed, hot day takeoff/climb (Aircraft.isaDev = +20 K)
const ac = buildAC(card, { mass: 757.5 }); const restore = applyAC(M, ac);
const vmax = (Mx, h) => { let lo = 60, hi = 140; for (let k = 0; k < 40; k++) { const m = 0.5 * (lo + hi); const t = trim(Mx, new Mx.Aircraft(), { ias: m, h, flaps: 0, gear: 1 }); if (t.thr > 1) hi = m; else lo = m; } return 0.5 * (lo + hi); };
const vmaxSL = vmax(M, 30), rhoR = M.atmosphere(M.FIELD.elev + 30, 0).rho / 1.225, vmaxSL_tas = vmaxSL / Math.sqrt(rhoR);
const Hot = class extends M.Aircraft { constructor(...a) { super(...a); this.isaDev = 20; } };
const MH = { ...M, Aircraft: Hot };
const toHot = takeoffTest(MH, { f: R.takeoff ? C.stall.detents[1].f_lift : 0.36, VR: 52, theta: 12 });
const climbHot = climbSweep(MH, { h: 30, v0: 50, v1: 90, step: 2, flaps: 0, gear: 1 });
restore();

const T = [];
const add = (id, cond, qty, exp, tol, origin, cur, pass, note = '') => T.push({ id, cond, qty, exp, tol, origin, cur, pass, note });
const within = (x, e, t) => Math.abs(x - e) <= t;
const f1 = x => +(+x).toFixed(1), f0 = x => Math.round(x), f3 = x => +(+x).toFixed(3);

// 01–03 definitions / consistency
add('T-LF-01', '1,670 lb', 'MTOW (kg)', f3(F.mtow_lb * LB), 0.1, 'LF1 p1-5; นิยาม lb', f3(val(card, 'airframe.weights.MTOW')), within(val(card, 'airframe.weights.MTOW'), F.mtow_lb * LB, 0.1));
const fwd1500 = 31.0 + (1500 - 1350) / (1670 - 1350) * (32.65 - 31.0);
add('T-LF-02', '1,500 lb', 'CG หน้าสุด (in DAT) เชิงเส้นระหว่างจุด POH', f3(fwd1500), 0.01, 'LF1 p2-5, LF2', f3((() => { const e = val(card, 'airframe.cg.envelope'); const m = 1500 * LB; const t = (m - e[0][0]) / (e[1][0] - e[0][0]); return (e[0][1] + t * (e[1][1] - e[0][1])) / IN; })()), true);
T[1].pass = within(T[1].cur, T[1].exp, 0.01);
add('T-LF-03', 'MTOW, S ในบัตร', 'wing loading (lb/ft²)', 10.5, 0.05, 'LF1 p1-5', f3(F.mtow_lb / F.S_ft2), within(F.mtow_lb / F.S_ft2, 10.5, 0.05));
// 04–07 stall (1 kt/s, idle, 3,000 ft, MTOW, CG fwd as POH; sim CG = card ref)
for (const [i, det, kcas] of [[4, '0', 48], [5, '10', 46], [6, '30', 43]]) {
  const s = R.stall[det];
  add(`T-LF-0${i}`, `stall แฟลป ${det}° MTOW idle 1 kt/s 3,000 ft ปีกระดับ`, 'ความเร็วต่ำสุด Vmin (KCAS)', kcas, 1.5, `LF1 Fig 5-3 (CG หน้า, ${F.vs.fwd[det][0]} KIAS)`, f1(s.Vmin_eas), within(s.Vmin_eas, kcas, 1.5));
}
const s30 = R.stall['30'];
add('T-LF-07', 'stall แฟลป 30° MTOW idle 1 kt/s (T-LF-06) ค่าที่มาตรวัดแสดง', 'Vmin แสดงเป็น KIAS ผ่าน speeds.ias_cas', 35, 3, 'LF1 Fig 5-3 (35 KIAS = 43 KCAS)', f1(s30.Vmin_kias), within(s30.Vmin_kias, 35, 3), 'Fig 5-1 เริ่มที่ 40 KIAS จึง extrapolate ช่วง stall ไม่ได้ (KIAS ของ Fig 5-3 เป็นค่าโดยประมาณจาก calibration แบบ power off) ต้องเพิ่มจุดจาก stall_table (งาน P2)');
// 08–11 climb and glide
const vyK = iasToCas('0', F.kias.VY), vxK = iasToCas('0', F.kias.VX);
add('T-LF-08', 'SL ISA MTOW คันเร่งเต็ม แฟลปขึ้น', 'ROC สูงสุด (fpm)', F.roc_sl_fpm, 40, 'LF1 หน้าสเปก, Fig 5-5', f0(R.climb.ROCmax_fpm), within(R.climb.ROCmax_fpm, F.roc_sl_fpm, 40));
add('T-LF-09', 'เดียวกับ T-LF-08', 'Vy (KCAS)', f1(vyK), 3, 'LF1 p4-3 (67 KIAS)', f1(R.climb.Vy_kt), within(R.climb.Vy_kt, vyK, 3), 'ซิมมี polar เดียวจาก glide (รวมแรงต้านใบพัดหมุนฟรี) จึง Vy ต่ำ (หัวข้อ 01 §01.8.3)');
add('T-LF-10', 'เดียวกับ T-LF-08', 'Vx (KCAS)', f1(vxK), 3, 'LF1 p4-3 (55 KIAS)', f1(R.climb.Vx_kt), within(R.climb.Vx_kt, vxK, 3));
add('T-LF-11', '3,000 ft แรงขับศูนย์ แฟลปขึ้น MTOW', 'L/D สูงสุด / ความเร็ว (KEAS)', `${f3(F.glide.ratio_faa)} / ${iasToCas('0', 60)}`, '±0.3 / ±2', 'LF6 (1.5 NM/1,000 ft), LF1 p3-3', `${f3(R.glide.zeroThrust.LD)} / ${f1(R.glide.zeroThrust.Vbg_kt)}`, within(R.glide.zeroThrust.LD, F.glide.ratio_faa, 0.3) && within(R.glide.zeroThrust.Vbg_kt, 60, 2));
const tasG = R.glide.zeroThrust.Vbg_kt / Math.sqrt(M.atmosphere(M.FIELD.elev + 3000 * FT, 0).rho / 1.225), sinkExp = tasG * KT / F.glide.ratio_faa / FT * 60;
add('T-LF-12', 'เดียวกับ T-LF-11', 'อัตราจม (fpm) = V_TAS/(L/D)', f0(sinkExp), 30, 'ฟิสิกส์ (TAS ที่ 3,000 ft)', f0(R.glide.zeroThrust.sink_fpm), within(R.glide.zeroThrust.sink_fpm, sinkExp, 30));
// 13–16 ground
add('T-LF-13', 'วิ่งขึ้น SL ISA MTOW แฟลป 10 VR 52 KCAS θ 12° ลมสงบ', 'ground roll (m)', f0(F.to.gr_ft * FT), '±20 %', 'LF1 หน้าสเปก/Fig 5-4', f0(R.takeoff.groundRoll_m), Math.abs(R.takeoff.groundRoll_m / (F.to.gr_ft * FT) - 1) <= 0.20, 'POH ใช้เทคนิค short field (tail low) ล้อพ้นพื้นเร็วกว่า; ซิมพ้นพื้นที่ ' + f1(R.takeoff.V_LOF_kt) + ' kt');
add('T-LF-14', 'เดียวกับ T-LF-13', 'ระยะถึง 50 ft (m)', f0(F.to.d50_ft * FT), '±15 %', 'LF1', f0(R.takeoff.dist50ft_m), Math.abs(R.takeoff.dist50ft_m / (F.to.d50_ft * FT) - 1) <= 0.15);
add('T-LF-15', 'ลงจอด SL ISA MTOW แฟลป 30 autoland ของซิม เบรกเต็มหลังล้อหน้าแตะ', 'ground roll (m)', f0(F.ldg.gr_ft * FT), '±20 %', 'LF1 หน้าสเปก, ตารางลงจอด p5-19', f0(R.landing.maxBrake.ground_m), Math.abs(R.landing.maxBrake.ground_m / (F.ldg.gr_ft * FT) - 1) <= 0.20);
add('T-LF-16', 'เดียวกับ T-LF-15', 'ระยะจาก 50 ft (m)', f0(F.ldg.d50_ft * FT), '±15 %', 'LF1 (54 KIAS ที่ 50 ft, power off)', f0(R.landing.maxBrake.total_m), Math.abs(R.landing.maxBrake.total_m / (F.ldg.d50_ft * FT) - 1) <= 0.15, `autoland ของซิมข้าม 50 ft ที่ ${f1(R.landing.maxBrake.ias50_kt)} kt บนเส้นร่อน 3° (ระยะในอากาศ ${f0(R.landing.maxBrake.air_m)} m เทียบ POH ${f0((F.ldg.d50_ft - F.ldg.gr_ft) * FT)} m)`);
// 17 max level speed
add('T-LF-17', 'SL ISA MTOW คันเร่งเต็ม บินระดับ', 'ความเร็วสูงสุด (KTAS)', 110, 5, 'LF1 หน้าสเปก', f1(vmaxSL_tas), within(vmaxSL_tas, 110, 5), 'polar จาก glide แรงต้านสูงกว่า cruise ~24 % (lf_calc) งาน P2');
// 18–19 trims
const tc = R.trim.cruise, ta = R.trim.approach;
add('T-LF-18', 'trim 90 KCAS 3,000 ft แฟลปขึ้น MTOW CG อ้างอิง', 'คันเร่ง และ δe', 'thr 0.6–1.0; δe ภายในระยะเคลื่อน −25…+18° (ค่าออกแบบ −2.5°)', 'ช่วงปิดตามที่เขียน ส่วนเผื่อ 0', 'LF1 Fig 5-7 (59–66 % ที่ 91–96 KTAS); δe ค่าประมาณจากการตั้ง Cm0', `thr ${f3(tc.thr)}, δe ${f1(tc.de_deg)}°`, tc.thr <= 1 && tc.thr >= 0.6 && tc.de_deg > -25 && tc.de_deg < 18);
add('T-LF-19', 'approach 61 KCAS แฟลป 30 γ −3° MTOW', 'α, θ, คันเร่ง', 'α 3–6°, θ −1 ถึง +3°, thr 0.2–0.6', 'ช่วงปิดตามที่เขียน ส่วนเผื่อ 0', 'บัตร 08 §08.1.2 (pitch ใกล้ C172) + ฟิสิกส์', `α ${f1(ta.alpha_deg)}, θ ${f1(ta.theta_deg)}, thr ${f3(ta.thr)}`, ta.alpha_deg >= 3 && ta.alpha_deg <= 6 && ta.theta_deg >= -1 && ta.theta_deg <= 3 && ta.thr >= 0.2 && ta.thr <= 0.6);
// 20–21 modes vs MIL-F-8785C Level 1 (Class I, Cat C at approach)
const ma = R.modes.approach;
add('T-LF-20', 'linearise ที่ approach (T-LF-19)', 'short period ζ และ CAP (Level 1 Cat C)', 'ζ 0.35–1.30; CAP 0.15–3.6', 'ช่วงปิดตามที่เขียน ส่วนเผื่อ 0', 'MIL-F-8785C (R1:V8)', `ζ ${f3(ma.sp.zeta)}, ωn ${f3(ma.sp.wn)}, CAP ${f3(ma.CAP)}`, ma.sp.zeta >= 0.35 && ma.sp.zeta <= 1.3 && ma.CAP >= 0.15 && ma.CAP <= 3.6);
add('T-LF-21', 'เดียวกับ T-LF-20', 'Dutch roll, roll mode, spiral (Level 1 Class I Cat C)', 'ζ ≥ 0.08, ωn ≥ 0.4, ζωn ≥ 0.15; τR ≤ 1.0 s; spiral t2 ≥ 12 s ถ้าลู่ออก', 'ช่วงปิดตามที่เขียน ส่วนเผื่อ 0', 'MIL-F-8785C (R1:V8)', `DR ${f3(ma.dr.wn)}/${f3(ma.dr.zeta)}, τR ${f3(ma.roll_tau)}, spiral ${ma.spiral.grows ? 'div' : 'conv'} t2 ${f1(ma.spiral.t2)} s`, ma.dr.zeta >= 0.08 && ma.dr.wn >= 0.4 && ma.dr.zeta * ma.dr.wn >= 0.15 && ma.roll_tau <= 1 && (!ma.spiral.grows || ma.spiral.t2 >= 12));
// 22 hot day (VTBD 35 °C) — POH interpolation vs current model (no ρ in thrust)
const hot = C.perf.vtbd35;
add('T-LF-22', 'VTBD PA 0 ft OAT 35 °C MTOW แฟลป 10 (ซิม isaDev +20 K)', 'ground roll / ถึง 50 ft (m)', `${f0(hot.to_gr_ft * FT)} / ${f0(hot.to_50_ft * FT)}`, '±20 % / ±15 %', 'LF1 Fig 5-4 interpolate 30–40 °C', `${f0(toHot.groundRoll_m)} / ${f0(toHot.dist50ft_m)}`, Math.abs(toHot.groundRoll_m / (hot.to_gr_ft * FT) - 1) <= 0.2 && Math.abs(toHot.dist50ft_m / (hot.to_50_ft * FT) - 1) <= 0.15, 'ซิมเพิ่มระยะเฉพาะจาก TAS ที่สูงขึ้น แรงขับไม่ลดตาม ρ');
add('T-LF-23', 'เดียวกับ T-LF-22 ไต่ SL', 'ROC สูงสุด (fpm)', f0(hot.roc_fpm), 40, 'LF1 Fig 5-5 interpolate 20–40 °C', f0(climbHot.ROCmax_fpm), within(climbHot.ROCmax_fpm, hot.roc_fpm, 40), 'thrustAvail ไม่มี ρ');
// 24 propeller + engine checks (BEM, ค่าประมาณ)
const cc = C.prop.cruise_check;
add('T-LF-24', 'BEM ใบ 69×58 หลังปรับ chord ให้รอบสถิต 2,330 rpm; cruise 2,400 rpm 101 KTAS 2,000 ft', 'กำลังที่ใบพัดดูด (% ของ 110 hp)', 75, 10, 'LF1 Fig 5-7', f1(cc.P_abs_pct), within(cc.P_abs_pct, 75, 10), 'ตรวจ pitch 58 in จากรหัสรุ่น');
// 25 C150H cross-check: card CLmax(30) of C152 predicts C150H flaps-40 stall at 1,600 lb within the flap difference
const v150 = stallSpeed({ mass: F.c150h.mtow_lb * LB, S: C.geom.S, CLmax: C.stall.fwd['30'].CLmax_1g, n: 0.95 });
add('T-LF-25', 'C150H 1,600 lb แฟลป 40 power off (ใช้ CLmax แฟลป 30 ของ C152)', 'ความเร็วต่ำสุด (KCAS)', f1(F.c150h.stall_mph_cas['40'] * 0.868976), 2, 'LF8 Fig 5-2 (48 mph CAS)', f1(v150), within(v150, F.c150h.stall_mph_cas['40'] * 0.868976, 2), 'สูตร lm_polar (ไม่ใช่ซิม): แฟลป 40° ให้ CLmax สูงกว่า 30° เพียง ~2 %');
// 26 bank-angle stall table consistency (definition n = 1/cos φ)
const st60 = val(card, 'speeds.stall_table').cg_fwd['0'][3][1], st0 = val(card, 'speeds.stall_table').cg_fwd['0'][0][1];
add('T-LF-26', 'stall แฟลปขึ้น CG หน้า เอียง 60° (speeds.stall_table)', 'KCAS เทียบ V0/√cos φ', f1(st0 * Math.SQRT2), 1.5, 'ฟิสิกส์; LF1 Fig 5-3', st60, within(st60, st0 * Math.SQRT2, 1.5), 'ตรวจตารางในบัตร (ไม่ใช่ซิม)');
// 27 IAS-CAS table of the card at VFE (data check; LF1 p2-3 gives VFE 85 KIAS = 87 KCAS)
const ic30 = iasCas(card, '30'), ic10 = iasCas(card, '10');
add('T-LF-27', 'speeds.ias_cas แฟลป 30 ที่ 85 KIAS และแฟลป 10 ที่ 60 KIAS', 'KCAS', '87 / 61', '±0.5 / ±0.5', 'LF1 p2-3 (VFE 85 KIAS = 87 KCAS), LF5 Fig 5-1', `${f1(ic30.f(85))} / ${f1(ic10.f(60))}`, within(ic30.f(85), 87, 0.5) && within(ic10.f(60), 61, 0.5), 'ตรวจข้อมูลในบัตร (ไม่ใช่ซิม)');
// 28 wind correction of the takeoff chart (data check, for a future wind test in the sim): SL 15 °C, 9 kt headwind
const corr = val(card, 'performance.corrections'), toHw = F.to.gr_ft * (1 - corr.headwind_pct_per_kt * 9 / 100);
add('T-LF-28', 'วิ่งขึ้น SL ISA MTOW แฟลป 10 ลมปะทะ 9 kt (performance.corrections)', 'ground roll (ft)', 652.5, 1, 'LF5 หมายเหตุ Fig 5-4 (−10 % ต่อ 9 kt), LF1 หน้าสเปก', f1(toHw), within(toHw, 652.5, 1), 'ตรวจข้อมูลในบัตร; เมื่อซิมรองรับลมในการทดสอบวิ่งขึ้นให้เทียบผลซิมกับค่านี้ ±20 %');

const must = new Set(['T-LF-01', 'T-LF-02', 'T-LF-03', 'T-LF-04', 'T-LF-05', 'T-LF-06', 'T-LF-08', 'T-LF-10', 'T-LF-11', 'T-LF-12', 'T-LF-14', 'T-LF-18', 'T-LF-20', 'T-LF-21', 'T-LF-26', 'T-LF-27', 'T-LF-28']);
const md = ['| รหัส | เงื่อนไข | ปริมาณที่วัด | ผลคาดหวัง ± tolerance | ที่มา | โมเดลปัจจุบัน |', '|---|---|---|---|---|---|',
  ...T.map(t => `| ${t.id} | ${t.cond} | ${t.qty} | ${t.exp}${typeof t.tol === 'number' || /^±/.test(String(t.tol)) ? ' ± ' + String(t.tol).replace(/^±\s*/, '').replace(/\/ ±/g, '/ ') : ' (เกณฑ์: ' + t.tol + ')'} | ${t.origin} | ${t.cur} ${t.pass ? '✓' : '✗'}${t.note ? ' — ' + t.note : ''} |`)].join('\n');
fs.writeFileSync(path.join(HERE, 'out', 'lf_tests.json'), JSON.stringify({ date: '2026-11-19', vmaxSL_keas: vmaxSL, vmaxSL_tas, toHot, climbHot: { Vy: climbHot.Vy_kt, ROC: climbHot.ROCmax_fpm }, tests: T }, (k, v) => (typeof v === 'number' ? +v.toPrecision(5) : v), 1));
fs.writeFileSync(path.join(HERE, 'out', 'lf_tests.md'), md + '\n');
console.log(md);
const bad = T.filter(t => must.has(t.id) && !t.pass);
console.log(`\n${T.filter(t => t.pass).length}/${T.length} pass; must-pass failures: ${bad.map(t => t.id).join(', ') || 'none'}`);
process.exitCode = bad.length ? 1 : 0;
