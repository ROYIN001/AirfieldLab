#!/usr/bin/env node
// lh_json.mjs — AirfieldLab research round 2, topic 08 (LH): builds the ```json data blocks of 08-handling.md
// (<id>.ops.* for every type, common_light.ops.*, common_light.evaluator.*) from lh_attitude.mjs (pitch estimates)
// and lh_eval.mjs (thresholds, rules). Writes out/lh_json_blocks.md; paste/replace section 08.8 with it.
// Pure Node >= 18.   node lh_json.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { run as attitudeRun } from './lh_attitude.mjs';
import { TH, RULES, PROFILES } from './lh_eval.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const A = attitudeRun();
const L = (v, u, src, conf, est, note, scope = 'aircraft') => ({ v, u, scope, src, conf, est, note });
const PH = ['takeoff_roll', 'rotation', 'initial_climb', 'cruise_climb', 'cruise', 'descent', 'downwind', 'base', 'final', 'flare', 'touchdown', 'go_around'];

/** rows: phase -> [ias_kt, power, flap, rate_fpm, src[], conf, note, pitchFrom ('calc'|'pub:<deg>'|null), calcType] */
function ap(id, rows, calcType = id) {
  const out = {};
  for (const ph of PH) {
    const r = rows[ph]; if (!r) continue;
    const [ias, power, flap, rate, src, conf, note, pf] = r;
    let pitch = null, est = false, pnote = '';
    const calc = A[calcType] && A[calcType][ph === 'flare' ? 'touchdown' : ph];
    if (pf && pf.startsWith('pub:')) { pitch = +pf.slice(4); pnote = 'pitch จากคู่มือ'; }
    else if (pf === 'calc' && calc) { pitch = calc.pitch_deg; est = true; pnote = `ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs${calcType !== id ? ' (ใช้ค่าของ ' + calcType + ')' : ''}`; }
    out[ph] = L({ ias_kt: ias, pitch_deg: pitch, power, flap, rate_fpm: rate }, 'kt IAS, deg, -, -, fpm', [...new Set(pf === 'calc' ? [...src, 'LH0'] : src)], conf, est || /ค่าประมาณ/.test(note), [note, pnote].filter(Boolean).join('; '));
  }
  return out;
}

const T = {};
// ---------------- C172S ----------------
const c172rows = {
  takeoff_roll: [0, 'เต็ม (static 2,300–2,400 rpm)', 0, 0, ['LH11', 'LH8', 'LC3', 'LC6'], 'กลาง', 'แฟลป 0 ปกติ, 10 short field; รอบสถิตจากบัตร 04', null],
  rotation: [55, 'เต็ม', 0, 0, ['LH11', 'LH8'], 'กลาง', 'rotate 55 KIAS (LH11 p.4–5, LH8 p.5); short field 51 KIAS แฟลป 10', 'calc'],
  initial_climb: [74, 'เต็ม', 0, 730, ['LH11', 'LC1'], 'กลาง', 'Vy SL 74 (IM p.4-5); ROC 730 fpm ที่ MTOW SL (ที่มวลฝึกไต่ได้มากกว่า); short field: Vx 62 จนพ้นสิ่งกีดขวาง เก็บแฟลปที่ 300 ft AGL (SOP)', 'calc'],
  cruise_climb: [80, 'เต็ม', 0, 600, ['LC1', 'LH11'], 'กลาง', '75–85 KIAS ที่ SL, 70–80 ที่ 10,000 ft (IM p.4-5); SOP 70–85; rate ค่าประมาณ (ผู้เขียนตั้งต่ำกว่า ROC ที่ Vy)', 'calc'],
  cruise: [105, '≈2,200–2,500 rpm (ค่าประมาณ)', 0, 0, ['LC1', 'LH12'], 'กลาง', 'ค่าประมาณ: rpm ในช่วง tach green arc 2,100–2,500 rpm ที่ SL ของบัตร 04 [LC1]; ias ค่าประมาณ; C172R IM แนะนำ cruise 60–80 % (p.4-26)', 'calc'],
  descent: [100, '≈2,000 rpm', 0, -500, ['LH9'], 'ต่ำ', 'ค่าประมาณ (ผู้เขียนตั้ง): rpm และอัตรา ไม่มีในแหล่ง', 'calc'],
  downwind: [90, '2,000–2,200 rpm', 0, 0, ['LH11', 'LH9'], 'กลาง', 'entry 90 KIAS ≈2,200 rpm (LH9), downwind 95 kt 2,000–2,200 rpm (LH11 p.14); abeam ≈1,500 rpm แฟลป 10 80–85 KIAS (LH8 ใช้ 1,700 rpm)', 'calc'],
  base: [75, '≈1,500 rpm', 20, -500, ['LH11', 'LH9', 'LH8'], 'กลาง', '70–75 KIAS แฟลป 20; rate ค่าประมาณ', 'calc'],
  final: [65, '≈1,500 rpm ปรับตาม path', 30, -345, ['LH11', 'LC1', 'LH1'], 'กลาง', '60–70 KIAS แฟลป 30 (IM p.4-5); short field 61; 3° ที่ GS 65 kt', 'calc'],
  flare: [55, 'idle', 30, -100, ['LH1'], 'กลาง', 'เริ่ม roundout 10–20 ft (AFH p.9-8); ias และ rate ค่าประมาณ (ลดจาก Vapp)', null],
  touchdown: [46, 'idle', 30, -120, ['LH1', 'LH9'], 'กลาง', 'ล้อหลักก่อน ใกล้ power-off stall attitude; ias ≈ 1.08 VS0 + 2 (ค่าประมาณ); pitch คำนวณที่ 1.05 VS0 = 50 KCAS (≈ 41 KIAS) นอก ground effect จึงเป็นขอบบน', 'calc'],
  go_around: [60, 'เต็ม', 20, 300, ['LH11', 'LH12'], 'กลาง', 'แฟลป 30→20 ทันที, 65 KIAS ที่ 50 ft, Vy 74, 10 → 0 ที่ 300 ft; rate ค่าประมาณ', 'calc'],
};
T.c172s = { ops: { attitude_power: ap('c172s', c172rows) } };
// C172R: 172R IM speeds/power [LH12]; other phases use the 172S SOP rows; pitch from lh_attitude c172r (172S aero, ค่าประมาณ)
T.c172r = { ops: { attitude_power: ap('c172r', { ...c172rows,
  rotation: [55, 'เต็ม', 0, 0, ['LH12'], 'สูง', 'lift nose wheel 55 KIAS (p.4-15); short field 57 KIAS ที่ 50 ft แฟลป 10 (p.4-5); pitch ใช้ aero ของบัตร c172s', 'calc'],
  initial_climb: [79, 'เต็ม', 0, 720, ['LH12'], 'สูง', 'Vy SL 79 KIAS (71 ที่ 10,000 ft), Vx SL 60; normal climb out 70–80; ROC 720 fpm ที่ 2,450 lb SL (p.ii, 4-5); pitch ใช้ aero ของบัตร c172s', 'calc'],
  cruise_climb: [80, 'เต็ม', 0, 600, ['LH12'], 'สูง', 'enroute climb 75–85 KIAS SL, 70–80 ที่ 10,000 ft (p.4-5); rate ค่าประมาณ', 'calc'],
  cruise: [105, '2,000–2,400 rpm (≤ 80 %)', 0, 0, ['LH12'], 'กลาง', 'checklist p.4-16; ปกติ 60–80 % (p.4-26); ias ค่าประมาณ', 'calc'],
  final: [65, '≈1,500 rpm ปรับตาม path', 30, -345, ['LH12', 'LH1'], 'สูง', '60–70 KIAS แฟลป 30, 65–75 แฟลปขึ้น; short field 62 (p.4-5)', 'calc'],
  go_around: [55, 'เต็ม', 20, 300, ['LH12'], 'กลาง', 'balked landing 55 KIAS แฟลป 20 แล้ว 10 และเก็บหมดเมื่อ ≥ 60 KIAS ที่ความสูงปลอดภัย (p.4-17); rate ค่าประมาณ', 'calc'] }) } };
T.c152 = { ops: { attitude_power: ap('c152', {
  takeoff_roll: [0, 'เต็ม carb heat cold', 0, 0, ['LH13'], 'สูง', 'แฟลป 0–10', null],
  rotation: [50, 'เต็ม', 0, 0, ['LH13'], 'สูง', 'ยกล้อหน้า 50 KIAS (p.4-8); short field แฟลป 10 ไต่ 54 KIAS จนพ้นสิ่งกีดขวาง', 'calc'],
  initial_climb: [70, 'เต็ม', 0, null, ['LH13'], 'สูง', '65–75 หลังขึ้น; Vy 67 SL, Vx 55', 'calc'],
  cruise_climb: [75, 'เต็ม mixture rich < 3,000 ft', 0, null, ['LH13'], 'สูง', '70–80 KIAS', 'calc'],
  cruise: [95, '1,900–2,550 rpm (55–75 %)', 0, 0, ['LH13'], 'กลาง', 'rpm p.4-8, % p.4-15; ias ค่าประมาณ (ผู้เขียนตั้ง: IM ให้ cruise เป็น KTAS)', 'calc'],
  downwind: [80, 'ลดหลัง carb heat ON', 0, 0, ['LH13'], 'ต่ำ', 'ias ค่าประมาณ (ผู้เขียนตั้ง): IM ไม่ให้ความเร็ว downwind ใช้ค่าระหว่าง enroute climb 70–80 และ approach แฟลปขึ้น 60–70 KIAS; carb heat ก่อนลดกำลัง p.4-9', null],
  final: [60, 'ปรับตาม path', 30, -320, ['LH13'], 'สูง', '55–65 แฟลป 30 (60–70 แฟลปขึ้น); short field 54', 'calc'],
  touchdown: [40, 'idle', 30, -120, ['LH13'], 'กลาง', 'ล้อหลักก่อน; VS0 31–35 KIAS ตาม CG', 'calc'],
  go_around: [55, 'เต็ม carb heat cold', 20, null, ['LH13'], 'สูง', 'แฟลป 30→20 ทันทีแล้วเก็บช้า ๆ', 'calc'],
}, 'c172s') } };
// ---------------- DA40 NG ----------------
T.da40ng = { ops: { attitude_power: ap('da40ng', {
  takeoff_roll: [0, 'MAX 100 % load (prop 2,200–2,300 rpm)', 'T/O', 0, ['LH17'], 'กลาง', '', null],
  rotation: [60, 'MAX', 'T/O', 0, ['LH17', 'LH18'], 'กลาง', 'VR 56/58/61/65/67 ที่ 940/1,000/1,100/1,200/1,280 kg (ใช้ 1,150 kg); SOP ซิม +7.5° ANU', 'calc'],
  initial_climb: [72, 'MAX', 'T/O', 650, ['LH17'], 'กลาง', 'Vy ถึงความสูงปลอดภัย; ROC 651 fpm MTOM', 'calc'],
  cruise_climb: [88, '≈92 %', 'UP', 500, ['LH17', 'LH18'], 'ต่ำ', 'กำลังจาก SOP ของชุมชนซิม; rate ค่าประมาณ', 'calc'],
  cruise: [115, '60–75 %', 'UP', 0, ['LD4'], 'ต่ำ', 'ค่าประมาณ: ias ≈ 115 KIAS จาก cruise_table ของบัตร 05 ที่ 60–75 % ระดับต่ำ', 'calc'],
  descent: [110, '≈35–45 %', 'UP', -500, ['LH0'], 'ต่ำ', 'ค่าประมาณ (ผู้เขียนตั้ง): 110 KIAS −500 fpm ลด load ให้ได้อัตรานี้ ไม่มีในแหล่ง', 'calc'],
  downwind: [90, '30–40 %', 'UP', 0, ['LH18'], 'ต่ำ', 'SOP ของชุมชนซิม (ต่ำ)', 'calc'],
  base: [80, '≈25–30 %', 'T/O', -500, ['LH0'], 'ต่ำ', 'ค่าประมาณ (ผู้เขียนตั้ง): 80 KIAS แฟลป T/O −500 fpm ระหว่าง circuit 90 KIAS [LH18] และ final 74', 'calc'],
  final: [74, '≈20–30 % → idle', 'LDG', -390, ['LH17'], 'กลาง', 'VREF LDG 66/68/72/76/76/77 ที่ 940/1,000/1,100/1,200/1,216/1,280 kg (ใช้ 74 ที่ ≈ 1,150 kg); pitch −4° สอดคล้องกับท่าบิน DA40 NG ที่นักบินรายงานในบัตร 05 (แฟลป LDG idle 84 KIAS −6.5°) ดู 08.10', 'calc'],
  touchdown: [58, 'idle', 'LDG', -120, ['LH17'], 'ต่ำ', 'ค่าประมาณ: ias ≈ 1.05 VS0 (VS0 LDG 55–60 KIAS ที่ 1,000–1,310 kg)', 'calc'],
  go_around: [72, 'MAX', 'T/O', 400, ['LH17'], 'กลาง', 'ขั้นต่ำ 72 KIAS แฟลป T/O; rate ค่าประมาณ', 'calc'],
}) } };
// ---------------- DA42 NG ----------------
T.da42ng = { ops: { attitude_power: ap('da42ng', {
  takeoff_roll: [0, 'MAX ทั้งสองเครื่อง', 'UP', 0, ['LT9'], 'กลาง', '', null],
  rotation: [76, 'MAX', 'UP', 0, ['LT9'], 'กลาง', 'TAE 125: 70–72', 'calc'],
  initial_climb: [90, 'MAX', 'UP', 1100, ['LT9', 'LH29'], 'กลาง', 'Vy; เก็บล้อเมื่อ positive rate; ROC 1,180 MTOM', 'calc'],
  cruise_climb: [100, '≈92 %', 'UP', 900, ['LH29'], 'ต่ำ', 'rate ค่าประมาณ; แหล่งเป็นรุ่น L360', 'calc'],
  cruise: [140, '60–75 %', 'UP', 0, ['LT10'], 'ต่ำ', 'ค่าประมาณ: ias ≈ 140 KIAS จาก cruise_table ของบัตร 06 ที่ 60–75 % ระดับต่ำ', 'calc'],
  descent: [130, 'ลดให้ได้ ≈500 fpm', 'UP', -500, ['LH29'], 'ต่ำ', '130–140 KIAS (L360)', 'calc'],
  downwind: [100, '≈35 %', 'UP', 0, ['LH29'], 'ต่ำ', 'ค่าประมาณ (ผู้เขียนตั้ง): ias และ load ไม่มีในแหล่ง (สูงกว่า base 95 KIAS เล็กน้อย); ล้อลงบน base เมื่อแน่ใจว่าลงได้ [LH29]', 'calc'],
  base: [95, '≈25–30 %', 'APP', -500, ['LH29'], 'ต่ำ', 'base 95 KIAS ล้อลง (flashcard รุ่น L360 [LH29]); load และ rate ค่าประมาณ', 'calc'],
  final: [84, '≈20–30 %', 'LDG', -430, ['LT9'], 'กลาง', 'VREF ≤ 1,900 kg (86 > 1,900 kg)', 'calc'],
  touchdown: [62, 'idle', 'LDG', -120, ['LT2'], 'ต่ำ', 'ค่าประมาณ: ias ≈ VS0 62 KIAS (ปลาย white arc ที่ 1,900 kg)', 'calc'],
  go_around: [90, 'MAX', 'APP', 500, ['LH29'], 'ต่ำ', 'LDG→APP, ล้อขึ้นเมื่อ positive rate; rate ค่าประมาณ', 'calc'],
}) } };
// ---------------- T-6A ----------------
const t6rows = {
  takeoff_roll: [0, 'MAX', 'TO', 0, ['LH14'], 'สูง', '', null],
  rotation: [85, 'MAX', 'TO', 0, ['LH14', 'LH15'], 'สูง', 'takeoff attitude 7–10° NH', 'pub:8.5'],
  initial_climb: [140, 'MAX', 'UP', null, ['LH14'], 'สูง', 'tech climb 140/160/180 KIAS = 15/12.5/10° NH; pattern climb 120 KIAS 60–70 % torque', 'pub:15'],
  cruise_climb: [160, 'MAX', 'UP', null, ['LH14'], 'สูง', '', 'pub:12.5'],
  cruise: [200, '≈50 % + 1 %/1,000 ft MSL', 'UP', 0, ['LH14'], 'กลาง', 'Table 2.1: 250 KIAS ≈ 93 % 2° NL; 200 KIAS 0°; 150 KIAS 32 % 2° NH (สูตร 08.1 ได้ −0.1° ที่ 200 KIAS, T-LH-52)', 'calc'],
  descent: [200, '≈10–20 %', 'UP', -1500, ['LH15'], 'ต่ำ', 'ค่าประมาณ: 10 % ใช้ลดสู่ pattern altitude', 'calc'],
  downwind: [120, '≈31 %', 'UP', 0, ['LH15'], 'สูง', 'ล้อลงเมื่อ < 150 KIAS; abeam ลดเป็น 15 %', 'calc'],
  base: [110, '≈15 %', 'LDG', -800, ['LH15'], 'กลาง', 'approach turn 120/115/110 (UP/TO/LDG), 90 position 400 ft AGL; rate ค่าประมาณ', 'calc'],
  final: [100, 'ตามต้อง (≥ on-speed AOA)', 'LDG', -530, ['LH15'], 'สูง', '110/105/100 KIAS (UP/TO/LDG); groove 100–150 ft ≈ 1,500 ft', 'calc'],
  flare: [95, 'idle', 'LDG', -100, ['LH15'], 'สูง', 'ลดกำลังสู่ idle ที่ 5–10 ft แล้วตั้ง landing attitude และ flare ใน ground effect (Fig 6-10); ias และ rate ค่าประมาณ', null],
  touchdown: [85, 'idle', 'LDG', -120, ['LH15'], 'กลาง', 'attitude สูงกว่า takeoff attitude เล็กน้อย; ias ค่าประมาณ', 'calc'],
  go_around: [110, 'MAX', 'TO', 1500, ['LH15'], 'ต่ำ', 'ค่าประมาณ ias และ rate', 'calc'],
};
T.t6a = { ops: { attitude_power: ap('t6a', t6rows) } };
for (const id of ['pc9m', 'pc7mk2']) {
  const k = id === 'pc9m' ? 0.893 : 0.867, rows = {};
  for (const [ph, r] of Object.entries(t6rows)) {
    const low = ['rotation', 'downwind', 'base', 'final', 'flare', 'touchdown', 'go_around'].includes(ph);
    rows[ph] = [r[0] && low ? Math.round(r[0] * k) : r[0], r[1] + ' (คลาส T-6)', r[2], r[3], [...r[4], 'LP2', 'LP9'], 'ต่ำ', `ค่าประมาณ: เทคนิคคลาส T-6 ความเร็วต่ำสเกล VS0 ×${k}`, r[7] && r[7].startsWith('pub') ? 'calc' : r[7]];
  }
  T[id] = { ops: { attitude_power: ap(id, rows) } };
}
// ---------------- Thai-school P3 types (partial) ----------------
T.pa28_161 = { ops: { attitude_power: ap('pa28_161', {
  rotation: [50, 'เต็ม', 'ตามคู่มือ', 0, ['LH19'], 'กลาง', 'short field 50 KIAS (Warrior, p.41)', null],
  initial_climb: [79, 'เต็ม', 0, null, ['LH19'], 'กลาง', 'Vy 79, Vx 63 (p.22)', null],
  cruise_climb: [87, 'เต็ม', 0, null, ['LH19'], 'กลาง', '', null],
  downwind: [90, 'ลดเริ่ม descent', 'ตามต้อง', 0, ['LH19'], 'กลาง', 'เริ่มลดที่ abeam ≈ 90 kt', null],
  base: [80, '-', 'ตามต้อง', null, ['LH19'], 'กลาง', 'เลี้ยวที่ 45° จากจุดแตะ', null],
  final: [65, 'ตาม path', 'FULL', null, ['LH19'], 'กลาง', '+½ gust; stabilised ไม่ต่ำกว่า 300 ft AGL (p.43)', null],
  go_around: [63, 'เต็ม', 'เก็บขั้นแรกทันที', null, ['LH19'], 'กลาง', 'pitch Vx แล้ว Vy', null],
}) } };
T.be76 = { ops: { attitude_power: ap('be76', {
  takeoff_roll: [0, 'เต็ม', 0, 0, ['LH20'], 'ต่ำ', 'flashcard ผู้ใช้: ลดเป็น 25 inHg / 2,500 rpm เมื่อพ้นปลายรันเวย์ (end of runway power)', null],
  cruise_climb: [100, '25 inHg / 2,500 rpm', 0, null, ['LH20'], 'ต่ำ', '', null],
  cruise: [120, '21 inHg / 2,300 rpm', 0, 0, ['LH20'], 'ต่ำ', '', null],
  descent: [115, '20 inHg / 2,300 rpm', 0, null, ['LH20'], 'ต่ำ', 'หรือ 15 inHg 105 KIAS', null],
  downwind: [105, '18 inHg / 2,300 rpm', 10, 0, ['LH20'], 'ต่ำ', 'แฟลป 10 บน downwind; abeam 15 inHg 90 KIAS', null],
  base: [85, '≈15 inHg', 20, null, ['LH20'], 'ต่ำ', '', null],
  final: [80, 'props full forward', 35, null, ['LH20'], 'ต่ำ', '76 KIAS short final', null],
  go_around: [85, 'เต็ม', 'ตามต้อง', null, ['LH20'], 'ต่ำ', 'pitch Vy 85', null],
}) } };
T.p2006t = { ops: { attitude_power: ap('p2006t', {
  initial_climb: [80, 'คันเร่งและใบพัดเต็ม', 'T/O', 1050, ['LH22'], 'ต่ำ', 'บทความทดสอบเครื่องก่อนรับรอง', null],
  cruise: [145, 'คันเร่งเต็ม ≤ 2,265 rpm ใบพัด (MCP 92.5 hp)', 0, 0, ['LH22', 'LH21'], 'ต่ำ', 'kt ไม่ระบุ IAS/TAS', null],
  downwind: [90, '-', 0, 0, ['LH22'], 'ต่ำ', 'ล้อลงบน downwind', null],
  final: [70, '-', 'FULL', null, ['LH22'], 'ต่ำ', 'ข้าม threshold 70 kt', null],
}) } };
T.p2002jf = { ops: { attitude_power: ap('p2002jf', {
  initial_climb: [null, 'เต็ม', 'T/O', 800, ['LH26'], 'กลาง', 'ROC SL ที่ 620 kg', null],
  cruise: [null, '75 %', 0, 0, ['LH26'], 'กลาง', '118 kt ที่ 6,500 ft', null],
  final: [52, '-', 'LDG', null, ['LH26', 'LH25'], 'ต่ำ', 'ค่าประมาณ: 1.3 × VS0 38 kt ≈ 50–55 (VFE LDG 67 KIAS)', null],
}) } };
T.p68c = { ops: { attitude_power: ap('p68c', {
  final: [null, '-', '30–35°', null, ['LH27'], 'ต่ำ', 'ไม่มีความเร็ว approach ในแหล่งเปิด; VFE 30–35° 99 KCAS, VMC 60 KCAS', null],
}) } };
T.t206h = { ops: { attitude_power: ap('t206h', {
  cruise_climb: [null, '2,400 rpm / 30 inHg', 0, null, ['LH24'], 'กลาง', 'cowl flaps open', null],
  cruise: [null, '65–75 % (lean 75 °F ROP TIT)', 0, 0, ['LH24'], 'กลาง', '65–75 % ตาม POH p.7-38 (ช่วง 50 ชม.แรก); lean ด้วย TIT ได้ที่ ≤ 75 % MCP, 75 °F ROP p.4-37/4-38', null],
  final: [75, '-', '10–FULL', null, ['LH23'], 'ต่ำ', 'ค่าประมาณ: ใช้ความเร็ว precautionary/forced landing ของ POH เป็นตัวแทน', null],
}) } };
T.ct4 = { ops: { attitude_power: ap('ct4', {
  final: [null, '-', 'LDG', null, ['LH28'], 'ต่ำ', 'ผู้ใช้ทางทหาร แบบทั่วไป; มีเพียง VFE TO 100 / LDG 85 kt จาก TCDS', null],
}) } };

// ---------------- per-type descriptive ops leaves ----------------
const add = (id, k, leaf) => { T[id].ops[k] = leaf; };
const xw = (v, src, conf, note) => L(v, 'kt', src, conf, false, note);
add('c172s', 'crosswind_limits', xw({ demonstrated: 15, limitation: false }, ['LC1', 'LH11'], 'สูง', 'สาธิต ไม่ใช่ขีดจำกัด (IM p.4-5); SOP ของโรงเรียนแยก 20 kt แฟลป 0–10 / 15 kt แฟลป 20–30 (p.4)'));
add('c172r', 'crosswind_limits', xw({ demonstrated: 15, limitation: false }, ['LH12'], 'สูง', 'p.4-5, 4-33'));
add('c152', 'crosswind_limits', xw({ demonstrated: 12, limitation: false }, ['LH13'], 'สูง', 'p.4-3, 5-10A (ไม่ใช่ขีดจำกัด)'));
add('da40ng', 'crosswind_limits', xw({ demonstrated: 25, limitation: false }, ['LH17'], 'กลาง', 'checklist p.8'));
add('da42ng', 'crosswind_limits', xw({ demonstrated: 25, limitation: false }, ['LT10', 'LT6'], 'กลาง', 'สเปก DA42 NG (AOPA 2010) และโบรชัวร์ DA42-VI ผ่านบัตร 06; AFM NG บท 4/5 เปิดไม่ได้'));
add('pa28_161', 'crosswind_limits', xw({ demonstrated: 17, limitation: false }, ['LH19'], 'กลาง', 'ตาราง V-speeds ของโรงเรียน p.22 (ไม่ระบุว่าสาธิตหรือจำกัด)'));
add('t6a', 'crosswind_limits', xw({ dry: 25, wet: 10, icy: 5, touch_and_go: 20, formation: 15, tailwind_takeoff: 10, limitation: true }, ['LH16'], 'สูง', 'ขีดจำกัดปฏิบัติการ'));
for (const id of ['pc9m', 'pc7mk2']) add(id, 'crosswind_limits', xw({ dry: 25, limitation: false }, ['LH16'], 'ต่ำ', 'ค่าประมาณ: ใช้ค่าคลาส T-6'));

const stall = (id, v, src, conf, est, note) => add(id, 'stall_characteristics', L(v, 'kt, ft', src, conf, est, note));
stall('c172s', { warning: 'แตร reed ขอบหน้าปีก', warning_margin_kt: [5, 10], behaviour: 'conventional', altitude_loss_ft: 230 }, ['LH12', 'LC2'], 'สูง', false, 'margin จาก C172R IM p.4-30; altitude loss จากบัตร 04');
stall('c172r', { warning_margin_kt: [5, 10], behaviour: 'conventional' }, ['LH12'], 'สูง', false, 'p.4-30');
stall('c152', { warning_margin_kt: 10, behaviour: 'conventional', altitude_loss_ft: 160 }, ['LH13'], 'สูง', false, 'p.4-18, 5-10');
stall('da40ng', { warning: 'lift detector ปีกซ้าย', warning_margin_kt: 5, behaviour: 'AFM ไม่บรรยายการตกปีก', dynamic_stall: 'ห้าม' }, ['LD2', 'LD8'], 'กลาง', true, 'margin = เกณฑ์ขั้นต่ำ 23.207 (ค่าประมาณ)');
stall('da42ng', { warning_margin_kt: 5, note_l360: 'รุ่น L360 ไม่ถึง 5 kt ที่ CG หน้า' }, ['LT4'], 'ต่ำ', true, 'ค่าประมาณ: margin = ขั้นต่ำ 5 kt ของ 14 CFR 23.207 / CS-23 เพราะ AFM ที่เปิดได้ไม่ให้ตัวเลข');
stall('t6a', { warning: 'stick shaker', warning_margin_kt: [5, 10], buffet_margin_kt: 3, roll_off: 'ซ้ายเมื่อ > 60 % torque แม้ใช้ rudder/aileron ขวาเต็ม; แฟลปทำให้แย่ลง', recovery: 'MAX power, ผ่อนคัน, wings level, ball กลาง, AOA < 18 units' }, ['LH15', 'LP19'], 'กลาง', false, 'ตัวเลข margin จาก flashcard [LP19]');
for (const id of ['pc9m', 'pc7mk2']) stall(id, { warning_margin_kt: [5, 10] }, ['LP19'], 'ต่ำ', true, 'ค่าประมาณ: คลาส T-6');
stall('p2006t', { buffet_onset_kt: 50, behaviour: 'ไม่รุนแรง', oei_stall: 'ห้าม' }, ['LH22', 'LH21'], 'ต่ำ', false, 'บทความทดสอบ; POH p.2-22');

const spin = (id, v, src, conf, est, note) => add(id, 'spin', L(v, 'turn, ft, s', src, conf, est, note));
spin('c172s', { approved: 'utility category เท่านั้น', flaps: 'ห้าม', recovery_turns_max: 0.25, alt_loss_1turn_ft: 1000, complete_recovery_agl_ft: 4000, training_turns: [1, 2], recovery: 'idle, aileron กลาง, rudder ตรงข้ามเต็ม, ดันคันไปหน้า, rudder กลางเมื่อหยุดหมุน' }, ['LH12'], 'สูง', false, 'C172R IM p.4-30…4-32 ใช้กับ 172S (การรับรองเดียวกัน)');
spin('c172r', { approved: 'utility category เท่านั้น', flaps: 'ห้าม' }, ['LH12'], 'สูง', false, 'p.2-9, 4-30');
spin('c152', { approved: true, flaps: 'ห้าม', alt_loss_1turn_ft: 1000, alt_loss_6turn: 'มากกว่าสองเท่าเล็กน้อย', complete_recovery_agl_ft: 4000 }, ['LH13'], 'สูง', false, 'p.2-6 (maneuver limits), 4-18…4-20');
spin('da40ng', { approved: false }, ['LD2'], 'สูง', false, 'normal category ห้าม spin และ aerobatics');
spin('da42ng', { approved: false }, ['LT2'], 'สูง', false, 'normal category');
spin('t6a', { approved: true, entry_min_ft_msl: 13500, prohibited_below_ft_pa: 10000, prohibited_above_ft_pa: 22000, max_aggravated_turns: 2, s_per_turn: [2, 3], ft_per_turn: [400, 500], stabilised_kias: [120, 135], recovery_ft: '≈500 ft/รอบ + 1,500–2,000 ft' }, ['LH16', 'LH15', 'LP19'], 'กลาง', false, 'ตัวเลขลักษณะ spin จาก flashcard (ต่ำ); ขีดจำกัดความสูงจาก ops limits (สูง)');
for (const id of ['pc9m', 'pc7mk2']) spin(id, { approved: 'aerobatic category (รายละเอียดไม่เปิดเผย)' }, ['LP2', 'LP9'], 'ต่ำ', false, 'TCDS/fact sheet');
spin('p2006t', { approved: false }, ['LH21'], 'สูง', false, 'POH p.2-22, 3-44');
spin('t206h', { approved: false }, ['LH23'], 'สูง', false, 'POH p.2-9');
spin('ct4', { approved: 'CT/4E acrobatic category; CT/4A acrobatic + normal' }, ['LH28'], 'กลาง', false, 'TCDS ไม่ให้รายละเอียด spin');
spin('pa28_161', { approved: 'ไม่ยืนยันในรอบนี้' }, ['LH19'], 'ต่ำ', false, 'โรงเรียนต้นทางอนุญาต spin เฉพาะใน C152');

const flaps = (id, v, src, conf, est, note) => add(id, 'flap_effects', L(v, 'kt, g, deg', src, conf, est, note));
flaps('c172s', { VFE: { '10': 110, '20': 85, '30': 85 }, balloon_dn_g: { '0to10_85kt': 0.22, '10to20_80kt': 0.23, '20to30_70kt': 0.09 }, approach_alpha_drop_deg: 4.0, notes: 'ปีกสูงแฟลป Fowler: กางแล้วลอยและเชิดหัว ต้องดันคันและ trim; เกิน 20° หลีกเลี่ยง slip ชัน' }, ['LH1', 'LH12', 'LH0'], 'กลาง', true, 'ค่าประมาณ: balloon และ Δα จาก lh_attitude.mjs (T-LH-06, 07)');
flaps('c152', { notes: 'เก็บแฟลป 10 ช้า ๆ หลัง 60 KIAS; balked landing เหลือ 20 ทันที' }, ['LH13'], 'สูง', false, '');
flaps('da40ng', { VFE: { 'T/O': 110, 'LDG': 98 }, balloon_dn_g: { 'UPtoTO_100kt_upper_bound': 0.99 }, notes: 'ปีกต่ำ แฟลป 20°/42°: ΔCL0 ของบัตร 05 (0.52/0.75) ยืนยันด้วย DATCOM และท่าบินที่นักบินรายงาน; Δn เป็นขอบบน (แฟลปกางทันทีและถือ α เดิม) จริงแฟลปไฟฟ้าใช้หลายวินาทีและ dCm0 −0.06 กดหัวลง (ดู 08.10)' }, ['LH17', 'LH0', 'LD13'], 'ต่ำ', true, 'ค่าประมาณ: balloon จาก lh_attitude.mjs');
flaps('da42ng', { VFE: { APP: 133, LDG: 113 } }, ['LT1'], 'สูง', false, 'ผ่านบัตร 06');
flaps('t6a', { VFE: { TO: 150, LDG: 150 }, final_kias: { UP: 110, TO: 105, LDG: 100 }, notes: 'แฟลปเพิ่ม roll-off ตอน stall' }, ['LH15', 'LH16', 'LP19'], 'สูง', false, '');

const txt = (id, k, s, src, conf, note = '') => add(id, k, L(s, '-', src, conf, false, note));
for (const id of ['c172s', 'c172r', 'c152']) {
  txt(id, 'trim_technique', 'attitude → power → trim; trim ใหม่ทุกครั้งที่เปลี่ยนแฟลป; go-around ดันคันต้านหัวเชิดก่อนแล้ว trim หยาบ; ล้อ trim มือ (172S NAV III มี electric trim)', ['LH1', 'LC2'], 'กลาง');
  txt(id, 'crosswind_technique', 'crab ใน pattern → wing-low ก่อน roundout; แฟลปน้อยที่สุดตามความยาวรันเวย์; ล้อด้านลมก่อน; aileron เข้าลมตลอดการวิ่ง', ['LH1', 'LH12', 'LH13'], 'สูง');
  txt(id, 'stick_feel', 'พวงมาลัย สลิง reversible แรงเพิ่มตาม q; แฟลปเต็มและ CG หน้าทำให้แรงดึงตอน flare สูง; ไม่มีตัวเลขแรงในแหล่งเปิด', ['LH1', 'LC2'], 'ต่ำ');
}
for (const id of ['da40ng', 'da42ng']) {
  txt(id, 'trim_technique', 'ล้อ trim มือ + electric trim (NG/NXi); FADEC คันเดียว เปลี่ยนกำลังแล้ว trim เปลี่ยนน้อยกว่าเครื่องคาร์บู', ['LD7', 'LH1'], 'ต่ำ');
  txt(id, 'crosswind_technique', 'crab → wing-low ตาม AFH; ค่าสาธิต 25 kt', ['LH1', 'LH17'], 'กลาง');
  txt(id, 'stick_feel', 'stick ระบบ push-rod ตอบสนองตรง ไม่มีตัวเลขแรงในแหล่งเปิด', ['LD7'], 'ต่ำ');
}
for (const id of ['t6a', 'pc9m', 'pc7mk2']) {
  txt(id, 'trim_technique', id === 't6a' ? 'trim ไฟฟ้า ลำดับ rudder → elevator → aileron; Trim Aid Device trim rudder ตามกำลัง/ความเร็ว (WOW off > 80 KIAS)' : 'ไม่มี Trim Aid Device: เหยียบ rudder ขวาเองเมื่อเพิ่มกำลัง (ค่าประมาณ: เทคนิคคลาส)', id === 't6a' ? ['LH14', 'LP21'] : ['LP21'], id === 't6a' ? 'กลาง' : 'ต่ำ');
  txt(id, 'crosswind_technique', 'crab ใน pattern, final ใช้ rudder จัดหัว aileron คุมเส้นกลาง wing-low จนแตะล้อด้านลม; ไม่เบรกเหนือ 80 KIAS; touch-and-go คง aileron เข้าลม', ['LH15'], id === 't6a' ? 'สูง' : 'ต่ำ');
  txt(id, 'stick_feel', 'stick, กำลังสูงที่ความเร็วต่ำทำให้ yaw/roll ซ้ายมาก; ห้าม rudder เต็มเหนือ 150 KIAS (T-6)', ['LH16', 'LP19'], 'ต่ำ');
}
const num1 = (id, k, v, u, src, conf, est, note) => add(id, k, L(v, u, src, conf, est, note));
const fl = { c172s: 'c172s', da40ng: 'da40ng', da42ng: 'da42ng', t6a: 't6a', pc9m: 'pc9m', pc7mk2: 'pc7mk2' };
for (const id of Object.keys(fl)) {
  num1(id, 'approach_pitch_deg', A[id].final.pitch_deg, 'deg', ['LH0'], 'ต่ำ', true, `ค่าประมาณ: θ = α + γ ที่ final (${A[id].final.ias_kt} KIAS, path 3°)`);
  num1(id, 'touchdown_pitch_deg', id === 't6a' ? 8.5 : A[id].touchdown.pitch_deg, 'deg', id === 't6a' ? ['LH15', 'LH14'] : ['LH0', 'LH1'], 'ต่ำ', true, id === 't6a' ? 'ค่าประมาณ: "สูงกว่า takeoff attitude 7–10° เล็กน้อย"' : 'ค่าประมาณ: α ที่ 1.05 VS0 นอก ground effect (ใกล้ power-off stall attitude ตาม AFH)');
  num1(id, 'flare_height_m', id.startsWith('t6') || id.startsWith('pc') ? 2.3 : 4.6, 'm', id.startsWith('t6') || id.startsWith('pc') ? ['LH15'] : ['LH1'], 'กลาง', false, id.startsWith('t6') || id.startsWith('pc') ? 'ลดกำลังที่ 5–10 ft แล้ว flare ใน ground effect (กลาง 7.5 ft) [LH15 Fig 6-10]' : 'roundout เริ่ม 10–20 ft (กลาง 15 ft) [LH1 p.9-8]');
}
for (const id of Object.keys(T)) {
  const P = PROFILES[id] || null;
  add(id, 'stabilised_criteria', L({ gate_ft: [500, 300], speed: P ? { Vapp: P.Vapp, lo: -5, hi_ppl: 10, hi_cpl: 5 } : 'Vapp −5/+10', vs_min_fpm: -1000, bank_max_deg: 15, config: 'แฟลปลงจอดของแบบ' + (['da42ng', 't6a', 'pc9m', 'pc7mk2', 'be76', 'p2006t'].includes(id) ? ' + ล้อลง' : ''), path_dots: 1 }, 'ft, kt, fpm, deg', ['LH1', 'LH2', 'LH3'], 'กลาง', false, 'เกณฑ์ร่วม common_light.evaluator ใช้ Vapp ของแบบ'));
}

// ---------------- common_light ----------------
const S = 'sim', E = 'environment';
const common = {
  ops: {
    rules_of_thumb: L({ fpm_per_deg_pitch: '1.77 × KTAS (≈ 2 × KIAS ตาม SOP)', vs_on_3deg_fpm: '5.31 × GS kt', example: { '65kt': 345, '84kt': 446, '100kt': 531 } }, 'fpm', ['LH0', 'LH10'], 'สูง', false, 'ฟิสิกส์ (T-LH-04, 05)', S),
    gust_additive: L('½ gust factor', 'kt', ['LH1'], 'สูง', false, 'AFH p.9-20', S),
    roundout_start_ft: L([10, 20], 'ft', ['LH1'], 'สูง', false, 'AFH p.9-8 เครื่องเล็กลูกสูบ; เทอร์โบพร็อปฝึก 5–10 ft [LH15]', S),
    hard_landing_ref: L({ drop_6in_fpm: 340, load_g: [3, 4] }, 'fpm, g', ['LH1'], 'สูง', false, 'AFH p.9-35', S),
    control_force_limits: L({ temporary_lbf: { pitch_stick: 60, pitch_wheel2: 75, pitch_wheel1: 50, roll_stick: 30, roll_wheel2: 50, roll_wheel1: 25, yaw: 150 }, prolonged_lbf: { pitch: 10, roll: 5, yaw: 20 } }, 'lbf', ['LH30'], 'สูง', false, '14 CFR 23.143(c) ก่อน Amdt 23-64', S),
    certification_xwind: L('≥ 0.2 VS0 ที่ 90°', 'kt', ['LH1'], 'สูง', false, 'AFH p.9-19', S),
    accident_stats: L({ instr_landing_2001_2010: 830, share_of_landing: 0.22, solo_student: 457, dual: 373, directional_control_share: 0.5, solo_hard_or_stall: 228, fatal_training_2000_2015: { accidents: 240, fatalities: 432, loci: 129, loci_share: 0.54, stall_spin_of_loci: 0.81, pattern_share_of_loci: 0.42, takeoff_ga_share_of_loci: 0.29 }, landing_accidents_per_year: { '2004_08': 95, '2009_12': 70, '2013': 58, '2014': 52 } }, 'count, -', ['LH5', 'LH6', 'LH7'], 'กลาง', false, 'สหรัฐฯ (NTSB ผ่าน AOPA); takeoff_ga_share_of_loci = ขึ้นบิน/ไต่และ go-around รวมกัน (อยู่ในกลุ่ม pattern 42 %); solo student 2001–2010: แตะก่อนรันเวย์ 2, overrun 8', E),
    test_standards: L({ faa_private: { app_kt: [-5, 10], td_beyond_ft: 400, short_td_ft: 200, alt_ft: 100, pattern_kt: 10, hdg_deg: 10, vy_kt: [-5, 10] }, faa_commercial: { app_kt: [-5, 5], td_beyond_ft: 200, short_td_ft: 100, alt_ft: 100, pattern_kt: 10, vy_kt: [-5, 5] }, afh_stabilised: { app_kt: [-5, 10], bank_max_deg: 15 }, caat_lapl: { app_kt: [-5, 15], other_kt: 15, alt_ft: 150 }, caat_cpl: { app_kt: [-5, 5], other_kt: 10, alt_ft: 100, hdg_deg: 10 }, easa_ppl: { app_kt: [-5, 15], other_kt: 15, alt_ft: 150, hdg_deg: 10 } }, 'kt, ft, deg', ['LH1', 'LH2', 'LH3', 'LH31', 'LH32', 'LH33'], 'สูง', false, 'ACS-6C/7B (Nov 2023); AFH p.9-6; กพท. LAPL ยก AMC1 FCL.125 (p.6-1), CPL ยก TCAR PEL Part FCL Appendix 4 (p.6-2); EASA PPL ตาม AMC1 FCL.215/FCL.235', S),
  },
  evaluator: {
    levels: L({ ppl: { spd_hi: TH.spd_hi_ppl, spd_lo: TH.spd_lo, long_ft: TH.long_ppl_ft }, cpl: { spd_hi: TH.spd_hi_cpl, spd_lo: TH.spd_lo, long_ft: TH.long_cpl_ft } }, 'kt, ft', ['LH2', 'LH3', 'LH32'], 'สูง', false, 'ppl = FAA Private (กพท. LAPL/EASA PPL หลวมกว่า +15)', S),
    gates: L({ gate_hi_ft: TH.gate_hi_ft, gate_lo_ft: TH.gate_lo_ft, ifr_gate_ft: 1000, speed: 'Vapp −5/+10 (cpl ±5)', vs_min_fpm: -TH.sink_max_fpm, bank_max_deg: TH.bank_final_deg, path_dots: TH.dots, config: 'แฟลปลงจอด + ล้อลง' }, 'ft, kt, fpm, deg, dots', ['LH1', 'LH2', 'R1'], 'กลาง', false, 'แทน gate 500/200 ft ของวันนี้', S),
    thresholds: L(TH, 'ft, kt, fpm, deg, s, m', ['LH0', 'LH1', 'LH2', 'LH3', 'LH13', 'LH15', 'LH30', 'R1'], 'ต่ำ', true, 'ค่าประมาณบางตัว (ดูคอมเมนต์ใน lh_eval.mjs ว่าตัวไหนมาจากแหล่ง ตัวไหนตั้งเอง)', S),
    rules: L(Object.fromEntries(Object.entries(RULES).map(([k, r]) => [k, { phase: r.phase, sev: r.sev, pts: r.pts, src: r.src, th: r.th }])), '-', ['LH0', 'LH1', 'LH2', 'LH5', 'LH6'], 'กลาง', true, 'ระดับและคะแนนหักเป็นค่าประมาณของหัวข้อนี้; ข้อความไทยเขียนใหม่ทั้งหมด', S),
    scoring: L({ touchdown: { sink: 40, pos: 25, cl: 15, spd: 10, att: 10 }, pos_full_m: ['aim − 30', 'aim + 122 (ppl) / + 61 (cpl)'], pos_partial_m: { '18': 'aim + 250', '10': 'aim + 400' }, spd: 'ias ที่ 50 ft ใน Vapp −5/+10 (cpl ±5) และแตะ ≤ Vapp − 5', deduction_by_sev: { minor: [2, 4], major: [5, 10], critical: [20, 30] }, caps: { short: 20, excursion: 15, sink_gt_600: 35, any_critical: 40 }, pass: '≥ 60 และไม่มี critical', grades: { 'ดีเยี่ยม': 90, 'ดี': 75, 'ผ่าน': 60 } }, '-', ['LH0', 'LH2', 'LH3', 'R1'], 'กลาง', true, 'ค่าประมาณ: โครง 100 คะแนนเดิม + หัก + เพดาน', S),
    signals_needed: L(['nz', 'carbHeat', 'mixture', 'deTrim', 'phase', 'stallWarn', 'xw', 'latV', 'Recorder: phi, theta, beta, wow'], '-', ['LH0', 'R1'], 'กลาง', false, 'วันนี้ air.load คือแรงตั้งฉากที่ล้อแต่ละล้อ [N] (0 เมื่ออยู่ในอากาศ) ยังไม่มี nz; Recorder ยังไม่เก็บ phi/theta/beta/wow', S),
    tests: L({ script: 'scripts/lh_tests.mjs', cases: 52, ids: 'T-LH-01…T-LH-52' }, '-', ['LH0'], 'สูง', false, 'ผลล่าสุด 52/52 ผ่าน (ตรวจทาน 2026-11-18)', S),
  },
};

// ---------------- write markdown ----------------
const blocks = [];
blocks.push('```json\n' + JSON.stringify({ common_light: common }, null, 1) + '\n```');
for (const id of Object.keys(T)) blocks.push('```json\n' + JSON.stringify({ [id]: T[id] }, null, 1) + '\n```');
fs.mkdirSync(path.join(HERE, 'out'), { recursive: true });
fs.writeFileSync(path.join(HERE, 'out', 'lh_json_blocks.md'), blocks.join('\n\n') + '\n');
console.log('types', Object.keys(T).length, 'blocks', blocks.length, 'chars', blocks.join('').length);
