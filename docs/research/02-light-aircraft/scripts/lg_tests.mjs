#!/usr/bin/env node
// lg_tests.mjs — T-LG test cases for the Tecnam P2006T card (12-p2006t.md §12.11): expected values from the AFM/TCDS or physics
// (computed here), tolerance, origin, and the current-model result from lm_card numerics with the control-travel workaround
// (lg_card.mjs). Writes scripts/out/lg_tests.json and scripts/out/lg_tests.md. Exit code 0 always (failures are findings).
// Run from the repo root: node <this folder>/lg_tests.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { F, compute } from './lg_calc.mjs';
import { run } from './lg_card.mjs';
import { clmaxFromStall, G0, RHO0, KT } from './lm_polar.mjs';
import { isMainModule, loadType, val } from './lm_lib.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const r = (x, n = 4) => (x == null || Number.isNaN(x) ? null : +(+x).toPrecision(n));

export async function tests() {
  const C = compute(), card = loadType('p2006t', { dir: path.join(HERE, '..') });
  const A = await run({ mass: 1180 }), B = await run({ mass: 1230 }), Tm = await run({});
  const st = A.res.stall, T = [];
  const add = (id, cond, qty, expected, tol, origin, cur, kind = 'abs', curNote = '') => {
    const pass = cur == null ? null : kind === 'rel' ? Math.abs(cur - expected) <= tol * Math.abs(expected) : Math.abs(cur - expected) <= tol;
    T.push({ id, cond, qty, expected: r(expected), tol: kind === 'rel' ? `±${Math.round(tol * 100)} %` : `±${tol}`, origin, current: cur == null ? 'ไม่รองรับในซิมวันนี้' : r(cur), current_note: curNote, pass });
  };
  // stall (POH stall speed = minimum speed of a 1 kt/s entry → compare Vmin KIAS)
  add('T-LG-01', 'stall แฟลป 0 ล้อขึ้น idle 1 kt/s 1,180 kg 3,000 ft', 'Vmin KIAS', 66, 2, 'AFM p2-7 green arc (VS1) [LG2]', st['0'].Vmin_kias);
  add('T-LG-02', 'stall แฟลป T/O (15°) ล้อลง idle 1 kt/s 1,180 kg 3,000 ft', 'Vmin KIAS', 56, 2, 'AFM p5-5 [LG4]', st['15'].Vmin_kias);
  add('T-LG-03', 'stall แฟลป FULL (40°) ล้อลง idle 1 kt/s 1,180 kg 3,000 ft', 'Vmin KIAS', 53, 2, 'AFM p5-5 [LG4]', st['40'].Vmin_kias);
  add('T-LG-04', 'stall แฟลป FULL ล้อลง idle 1 kt/s 1,230 kg 3,000 ft', 'Vmin KCAS', 55, 2, 'AFM p W5-5 (1,230 kg) [LG4]; โบรชัวร์ 55 KCAS [LG6]', B.res.stall['40'].Vmin_eas);
  // physics checks of the stall table
  const bank = [0, 15, 30, 45, 60].map(p => 54 / Math.sqrt(Math.cos(p * Math.PI / 180)));
  add('T-LG-05', 'ตาราง stall แฟลป FULL 1,180 kg มุมเอียง 60°: V_S(φ) = V_S0/√cos φ (ฟิสิกส์ n = 1/cos φ)', 'KCAS', bank[4], 1.5, 'ฟิสิกส์; AFM ให้ 76 KCAS [LG4]', F.stall.FULL[4][1], 'abs', '= ค่า AFM (ตรวจตาราง AFM กับฟิสิกส์ ไม่ใช่ผลซิม)');
  const clT = clmaxFromStall({ mass: F.MTOW, S: F.S, vs_kcas: 54, kind: 'min' }).CLmax_1g;
  add('T-LG-06', 'CLmax 1 g แฟลป FULL จาก 54 KCAS 1,180 kg nz 0.95 (lm_polar)', 'CLmax', clT, 0.01, 'ฟิสิกส์ + วิธีหัวข้อ 01 §01.5', st['40'].CLmax);
  // climb, glide
  add('T-LG-07', 'climb SL ISA เต็มกำลังสองเครื่อง (2 × 73.5 kW) clean ล้อขึ้น 1,180 kg', 'Vy KCAS', 79, 3, 'AFM S4-7: VY 80 KIAS [LG3]', A.res.climb.Vy_kt);
  add('T-LG-08', 'เหมือน T-LG-07', 'ROC max fpm', C.climb.enroute_15C, 80, 'ตาราง en-route ROC (ประมาณที่ 15 °C) [LG4]; โบรชัวร์ 1,036 ที่ 1,230 kg', A.res.climb.ROCmax_fpm);
  add('T-LG-09', 'ร่อน idle ใบพัดหมุน 3,000 ft clean ล้อขึ้น 1,180 kg', 'L/D', C.polar.E_idle_at_Vbg, 0.6, 'ค่าประมาณจาก polar ทดสอบบิน + แรงต้านใบพัด [LG7][LG0]', A.res.glide.idle.LD);
  add('T-LG-10', 'เหมือน T-LG-09', 'V best glide KCAS', 82, 3, 'AFM S3-56: best glide = VY 83 KIAS [LG3]', A.res.glide.idle.Vbg_kt);
  // trim physics: cruise α from CL (training mass 1,128 kg, 110 KCAS, 3,000 ft) using the card's legacy CL0/CLa and CLde·de
  const ac = Tm.ac, tc = Tm.res.trim.cruise, rho3 = 1.121, V3 = 110 * KT / Math.sqrt(rho3 / RHO0);
  const CLc = ac.m * G0 / (0.5 * rho3 * V3 * V3 * ac.S), aExp = (CLc - ac.CL0 - ac.CLde * tc.de_deg * Math.PI / 180) / ac.CLa * 180 / Math.PI;
  add('T-LG-11', 'trim cruise 110 KCAS 3,000 ft ISA มวลฝึก 1,128 kg clean ล้อขึ้น', 'α deg', aExp, 0.3, 'ฟิสิกส์ α = (CL − CL0 − CLde δe)/CLα', tc.alpha_deg);
  // modes vs flight test (110 kt) [LG7]
  const mc = Tm.res.modes.cruise;
  add('T-LG-12', 'linear modes 110 KCAS 3,000 ft มวลฝึก', 'short period ωn rad/s', 3.41, 0.15, 'ทดสอบบิน [LG7]', mc.sp?.wn, 'rel');
  add('T-LG-13', 'เหมือน T-LG-12', 'short period ζ', 0.40, 0.10, 'ทดสอบบิน [LG7]', mc.sp?.zeta);
  add('T-LG-14', 'เหมือน T-LG-12', 'Dutch roll ωn rad/s', 2.00, 0.15, 'ทดสอบบิน [LG7]', mc.dr?.wn, 'rel');
  add('T-LG-15', 'เหมือน T-LG-12', 'Dutch roll ζ', 0.26, 0.08, 'ทดสอบบิน [LG7]', mc.dr?.zeta);
  add('T-LG-16', 'เหมือน T-LG-12', 'phugoid คาบ s', 27, 0.20, 'ทดสอบบิน [LG7]', mc.ph?.T, 'rel');
  // ground (1,230 kg = brochure)
  add('T-LG-17', 'วิ่งขึ้น SL ISA ลมสงบ ทางแข็ง 1,230 kg แฟลป T/O กำลังเต็ม VR 64 (AFM 1,230 kg ใช้ 65) θ หมุน 12°', 'ground roll m', F.bro.toRun, 0.20, 'โบรชัวร์ 2021 (ไม่ระบุสภาพ) [LG6]', B.res.takeoff?.groundRoll_m, 'rel');
  add('T-LG-18', 'เหมือน T-LG-17', 'ระยะถึง 50 ft m', F.bro.toDist, 0.20, 'โบรชัวร์ 2021 [LG6]', B.res.takeoff?.dist50ft_m, 'rel');
  add('T-LG-19', 'ลงจอด SL ISA ลมสงบ ทางแข็ง 1,230 kg แฟลป FULL ล้อลง autoland ของซิมที่ final 70 KIAS (≈ 69 KEAS) เส้นร่อน 3° แล้ว flare เบรกเต็มหลังล้อหน้าแตะพื้น', 'ground roll m', F.bro.ldgRun, 0.20, 'โบรชัวร์ 2021 [LG6]', B.res.landing?.maxBrake?.ground_m, 'rel');
  add('T-LG-20', 'เหมือน T-LG-19', 'ระยะจาก 50 ft ถึงหยุด m', F.bro.ldgDist, 0.20, 'โบรชัวร์ 2021 [LG6]', B.res.landing?.maxBrake?.total_m, 'rel');
  // engine / propeller physics
  add('T-LG-21', 'Rotax 912 S3 take-off 73.5 kW ที่ใบพัด 2,388 rpm', 'แรงบิดเพลาใบพัด N m', C.engine.Q_prop_TO_Nm, 1, 'ฟิสิกส์ Q = P/ω [LG2]', null);
  add('T-LG-22', 'วันร้อน VTBD 9 ft 35 °C คันเร่งเต็ม (ind_friction f 0.10)', 'P/P_rated', C.engine.lapse_VTBD_35C, 0.01, 'หัวข้อ 01 §01.6.1', null);
  add('T-LG-23', 'climb SL 35 °C เต็มกำลัง 1,180 kg', 'ROC fpm', C.climb.enroute_35C, 100, 'ตาราง en-route ต่อเส้นตรงจาก 0/25 °C [LG4] (ค่าประมาณ)', null);
  add('T-LG-24', 'OEI: เครื่องซ้ายดับ feather 1,180 kg SL ISA ที่ VYSE 80 KIAS', 'ROC fpm', F.fly.rocOEI, 60, 'Flying 2011 [LG9]; ทดสอบ winglet 300 fpm ที่ 800 ft [LG7]', null);
  return { tests: T, summary: { n: T.length, pass: T.filter(t => t.pass === true).length, fail: T.filter(t => t.pass === false).length, na: T.filter(t => t.pass == null).length },
    runs: { m1180: { stall: A.res.stall, climb: A.res.climb, glide: A.res.glide, takeoff: A.res.takeoff, landing: A.res.landing, trim: A.res.trim, modes: A.res.modes },
      m1230: { stall: B.res.stall, takeoff: B.res.takeoff, landing: B.res.landing, climb: B.res.climb }, training: { m: Tm.ac.m, trim: Tm.res.trim, modes: Tm.res.modes, takeoff: Tm.res.takeoff, landing: Tm.res.landing } } };
}

if (isMainModule(import.meta.url)) {
  const out = await tests();
  fs.writeFileSync(path.join(HERE, 'out', 'lg_tests.json'), JSON.stringify(out, (k, v) => (typeof v === 'number' ? +v.toPrecision(6) : v), 1));
  const md = ['| รหัส | เงื่อนไข | ปริมาณที่วัด | ผลคาดหวัง ± tolerance | ที่มา | โมเดลปัจจุบัน |', '|---|---|---|---|---|---|',
    ...out.tests.map(t => `| ${t.id} | ${t.cond} | ${t.qty} | ${t.expected} ${t.tol} | ${t.origin} | ${t.current}${t.current_note ? ' ' + t.current_note : ''}${t.pass === true ? ' (ผ่าน)' : t.pass === false ? ' (ไม่ผ่าน)' : ''} |`)].join('\n');
  fs.writeFileSync(path.join(HERE, 'out', 'lg_tests.md'), md + '\n');
  console.log(md); console.log(JSON.stringify(out.summary));
}
