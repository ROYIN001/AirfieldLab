#!/usr/bin/env node
// lh_json.mjs — AirfieldLab research round 2, topic 08 (LH): builds the ```json data blocks of 08-handling.md
// (<id>.ops.* for every type, common_light.ops.*, common_light.evaluator.*) from lh_attitude.mjs (pitch estimates),
// lh_stick.mjs (stick-force targets) and lh_eval.mjs (thresholds, rules). Writes out/lh_json_blocks.md; section 08.8
// of 08-handling.md is replaced with it.  Node >= 18.   node lh_json.mjs
// Completeness check 19 Nov 2026: final IAS = card speeds.VAPP_kt (D1), flap values = card detent names (D6),
// flare/touchdown leaves from the ground-effect estimate, overrides for da40_180, da40d, da42_tae125, t6c, full P2006T.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { run as attitudeRun, TYPES, balloon } from './lh_attitude.mjs';
import { compute as stickCompute } from './lh_stick.mjs';
import { TH, RULES } from './lh_eval.mjs';
import { loadType, mergeDir, val, leaf } from './lm_lib.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const A = attitudeRun();
const ST = await stickCompute();
const MERGED = mergeDir(path.dirname(HERE), { checks: false, bases: false }).merged;
const card = id => loadType(id, { merged: MERGED });
const L = (v, u, src, conf, est, note, scope = 'aircraft') => ({ v, u, scope, src, conf: est && conf === 'สูง' ? 'กลาง' : conf, est, note });
const PH = ['takeoff_roll', 'rotation', 'initial_climb', 'cruise_climb', 'cruise', 'descent', 'downwind', 'base', 'final', 'flare', 'touchdown', 'go_around'];
const r1 = (x, n = 1) => (x == null ? null : +x.toFixed(n));
const FT = 0.3048;
const landDet = id => { const d = val(card(id), 'aero.flaps.detents') || []; return d.length ? String(d.slice().sort((a, b) => a.flap_deg - b.flap_deg).slice(-1)[0].name) : null; };
const vappLeaf = id => leaf(card(id), 'speeds.VAPP_kt');
const ias = x => (x == null ? null : Math.round(x));

/** rows: phase -> [ias_kt | 'VAPP', power, flap (card detent name), rate_fpm, src[], conf, note, pitchFrom ('calc'|'pub:<deg>'|'flare'|'td'|null)]
 *  calcType: lh_attitude id used for the pitch (default the same id). final 'VAPP' = card speeds.VAPP_kt (D1).
 *  opts.flareH: flare (roundout) height, m */
function ap(id, rows, calcType = id, opts = {}) {
  const out = {}, C = A[calcType];
  for (const ph of PH) {
    const r = rows[ph]; if (!r) continue;
    let [v, power, flap, rate, src, conf, note, pf] = r;
    let u = 'kt IAS, deg, -, -, fpm', est = false, pnote = '';
    if (v === 'VAPP') { const l = vappLeaf(id); v = l.v; if (/CAS/.test(l.u || '')) u = 'kt CAS, deg, -, -, fpm'; note = `บัตร speeds.VAPP_kt ${l.v} ${l.u} ที่มวลฝึก (D1)${note ? '; ' + note : ''}`; }
    let val_ = { ias_kt: v, pitch_deg: null, power, flap: flap == null ? null : String(flap), rate_fpm: rate };
    if (pf && pf.startsWith('pub:')) { val_.pitch_deg = +pf.slice(4); pnote = 'pitch จากคู่มือ'; }
    else if (pf === 'calc' && C && C[ph]) { val_.pitch_deg = C[ph].pitch_deg; est = true; pnote = `ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs ที่มวลฝึก${calcType !== id ? ' (ใช้บัตร ' + calcType + ')' : ''}`; }
    else if (pf === 'td' && C && C.touchdown) {
      const t = C.touchdown; val_.ias_kt = t.ias_kt; val_.pitch_deg = t.pitch_deg; val_.rate_fpm = t.rate_fpm; est = true;
      pnote = `ค่าประมาณ: 1.05 V_S0 ที่มวลฝึก (V_S0 ${t.vs0_cas_train} KCAS จาก CLmax_target ของบัตร) = ${t.cas_kt} KCAS (${t.ias_kt} KIAS, ${(t.cas_kt * 0.514444).toFixed(1)} m/s) จม 120 fpm (0.61 m/s); pitch ใน ground effect (σ ${t.sigma} ที่ h/b ${t.h_over_b}, รอบที่ 1 §2.4) ${t.pitch_deg}° นอก ground effect ${t.pitch_oge_deg}°`;
    } else if (pf === 'flare' && C && C.flare) {
      const f = C.flare, H = opts.flareH ?? 4.6;
      val_ = { ias_kt: f.ias_kt, ias_range_kt: f.ias_range_kt, pitch_deg: f.pitch_deg, pitch_start_deg: f.pitch_start_deg, power: power ?? 'idle', flap: String(f.flap), rate_fpm: -120, flare_height_m: H };
      u = 'kt IAS, deg, -, -, fpm, m'; est = true;
      pnote = `ค่าประมาณ: ความเร็วลดจาก final ${f.ias_range_kt[0]} ถึงแตะ ${f.ias_range_kt[1]} KIAS (ค่ากลาง ${f.ias_kt}); pitch เพิ่มจาก ${f.pitch_start_deg}° (final) ถึง ${f.pitch_deg}° (แตะ ใน ground effect, lh_attitude.mjs); เริ่ม roundout ที่ ${H} m (${Math.round(H / FT)} ft) ล้อ; อัตราจมท้าย flare 120 fpm`;
    } else if (pf === 'flare') {   // no aero data on the card (13 minor types): speeds only
      const vapp = vappLeaf(id)?.v, vs0 = val(card(id), 'speeds.VS0_kt'), td = vs0 ? Math.round(1.05 * vs0) : null, H = opts.flareH ?? 4.6;
      val_ = { ias_kt: vapp && td ? Math.round((vapp + td) / 2) : null, ias_range_kt: [vapp ?? null, td], pitch_deg: null, power: power ?? 'idle', flap: landDet(id), rate_fpm: -120, flare_height_m: H };
      u = 'kt, deg, -, -, fpm, m'; est = true;
      pnote = `ค่าประมาณ: ความเร็วจาก VAPP ${vapp} ถึง ≈ 1.05 VS0 = ${td} kt (หน่วยตาม VS0 ของบัตร); pitch ยังไม่คำนวณเพราะบัตร 13 ไม่มี CL0/CLα/ตำแหน่งล้อ; เริ่ม roundout ${H} m (${Math.round(H / FT)} ft) ตาม AFH [LH1]`;
    }
    est = est || /ค่าประมาณ/.test(note || '');
    out[ph] = L(val_, u, [...new Set(pf === 'calc' || pf === 'td' || pf === 'flare' ? [...src, 'LH0'] : src)], conf, est, [note, pnote].filter(Boolean).join('; '));
  }
  return out;
}

const T = {};
// ---------------- C172S ----------------
const c172rows = {
  takeoff_roll: [0, 'เต็ม (static 2,300–2,400 rpm)', '0', 0, ['LH11', 'LH8', 'LC3', 'LC6'], 'กลาง', 'แฟลป 0 ปกติ, 10 short field; รอบสถิตจากบัตร 04', null],
  rotation: [55, 'เต็ม', '0', 0, ['LH11', 'LH8'], 'กลาง', 'rotate 55 KIAS (28.3 m/s) (LH11 p.4–5, LH8 p.5); short field 51 KIAS แฟลป 10', 'calc'],
  initial_climb: [74, 'เต็ม', '0', 730, ['LH11', 'LC1'], 'กลาง', 'Vy SL 74 KIAS (38.1 m/s) (IM p.4-5); ROC 730 fpm (3.7 m/s) ที่ MTOW SL (ที่มวลฝึกไต่ได้มากกว่า); short field: Vx 62 จนพ้นสิ่งกีดขวาง เก็บแฟลปที่ 300 ft AGL (SOP)', 'calc'],
  cruise_climb: [80, 'เต็ม', '0', 600, ['LC1', 'LH11'], 'กลาง', '75–85 KIAS ที่ SL, 70–80 ที่ 10,000 ft (IM p.4-5); SOP 70–85; rate ค่าประมาณ (ผู้เขียนตั้งต่ำกว่า ROC ที่ Vy)', 'calc'],
  cruise: [105, '≈2,200–2,500 rpm (ค่าประมาณ)', '0', 0, ['LC1', 'LH12'], 'กลาง', 'ค่าประมาณ: rpm ในช่วง tach green arc 2,100–2,500 rpm ที่ SL ของบัตร 04 [LC1]; ias ค่าประมาณ; C172R IM แนะนำ cruise 60–80 % (p.4-26)', 'calc'],
  descent: [100, '≈2,000 rpm', '0', -500, ['LH9'], 'ต่ำ', 'ค่าประมาณ (ผู้เขียนตั้ง): rpm และอัตรา ไม่มีในแหล่ง', 'calc'],
  downwind: [90, '2,000–2,200 rpm', '0', 0, ['LH11', 'LH9'], 'กลาง', 'entry 90 KIAS ≈2,200 rpm (LH9), downwind 95 kt 2,000–2,200 rpm (LH11 p.14); abeam ≈1,500 rpm แฟลป 10 80–85 KIAS (LH8 ใช้ 1,700 rpm)', 'calc'],
  base: [75, '≈1,500 rpm', '20', -500, ['LH11', 'LH9', 'LH8'], 'กลาง', '70–75 KIAS แฟลป 20; rate ค่าประมาณ', 'calc'],
  final: ['VAPP', '≈1,500 rpm ปรับตาม path', '30', -345, ['LH11', 'LC1', 'LH1'], 'กลาง', '60–70 KIAS แฟลป 30 (IM p.4-5); short field 61; 3° ที่ GS 65 kt', 'calc'],
  flare: [null, 'idle', '30', -120, ['LH1'], 'กลาง', 'roundout 10–20 ft (AFH p.9-8)', 'flare'],
  touchdown: [null, 'idle', '30', -120, ['LH1', 'LH9'], 'กลาง', 'ล้อหลักก่อน ใกล้ power-off stall attitude (AFH ch.9)', 'td'],
  go_around: [60, 'เต็ม', '20', 300, ['LH11', 'LH12'], 'กลาง', 'แฟลป 30→20 ทันที, 65 KIAS ที่ 50 ft, Vy 74, 10 → 0 ที่ 300 ft; rate ค่าประมาณ', 'calc'],
};
T.c172s = { ops: { attitude_power: ap('c172s', c172rows) } };
// C172R: 172R IM speeds/power [LH12]; other phases use the 172S SOP rows; pitch from lh_attitude with the c172r card (gap 9)
T.c172r = { ops: { attitude_power: ap('c172r', { ...c172rows,
  rotation: [55, 'เต็ม', '0', 0, ['LH12'], 'สูง', 'lift nose wheel 55 KIAS (p.4-15); short field 57 KIAS ที่ 50 ft แฟลป 10 (p.4-5)', 'calc'],
  initial_climb: [79, 'เต็ม', '0', 720, ['LH12'], 'สูง', 'Vy SL 79 KIAS (40.6 m/s) (71 ที่ 10,000 ft), Vx SL 60; normal climb out 70–80; ROC 720 fpm (3.7 m/s) ที่ 2,450 lb SL (p.ii, 4-5)', 'calc'],
  cruise_climb: [80, 'เต็ม', '0', 600, ['LH12'], 'สูง', 'enroute climb 75–85 KIAS SL, 70–80 ที่ 10,000 ft (p.4-5); rate ค่าประมาณ', 'calc'],
  cruise: [105, '2,000–2,400 rpm (≤ 80 %)', '0', 0, ['LH12'], 'กลาง', 'checklist p.4-16; ปกติ 60–80 % (p.4-26); ias ค่าประมาณ', 'calc'],
  final: ['VAPP', '≈1,500 rpm ปรับตาม path', '30', -345, ['LH12', 'LH1'], 'สูง', '60–70 KIAS แฟลป 30, 65–75 แฟลปขึ้น; short field 62 (p.4-5)', 'calc'],
  go_around: [55, 'เต็ม', '20', 300, ['LH12'], 'กลาง', 'balked landing 55 KIAS แฟลป 20 แล้ว 10 และเก็บหมดเมื่อ ≥ 60 KIAS ที่ความสูงปลอดภัย (p.4-17); rate ค่าประมาณ', 'calc'] }) } };
// C152: own card (gap 9: 11-c152 card S 14.82 m², CLα 5.0/rad, training mass 717 kg)
T.c152 = { ops: { attitude_power: ap('c152', {
  takeoff_roll: [0, 'เต็ม carb heat cold', '0', 0, ['LH13'], 'สูง', 'แฟลป 0–10', null],
  rotation: [50, 'เต็ม', '0', 0, ['LH13'], 'สูง', 'ยกล้อหน้า 50 KIAS (25.7 m/s) (p.4-8); short field แฟลป 10 ไต่ 54 KIAS จนพ้นสิ่งกีดขวาง', 'calc'],
  initial_climb: [67, 'เต็ม', '0', 715, ['LH13', 'LF1'], 'สูง', '65–75 หลังขึ้น; Vy 67 KIAS (34.5 m/s) SL, Vx 55; ROC 715 fpm (3.6 m/s) ที่ 1,670 lb SL จากบัตร 11 [LF1]', 'calc'],
  cruise_climb: [75, 'เต็ม mixture rich < 3,000 ft', '0', 500, ['LH13'], 'สูง', '70–80 KIAS; rate ค่าประมาณ (ต่ำกว่า ROC ที่ Vy)', 'calc'],
  cruise: [95, '1,900–2,550 rpm (55–75 %)', '0', 0, ['LH13'], 'กลาง', 'rpm p.4-8, % p.4-15; ias ค่าประมาณ (ผู้เขียนตั้ง: IM ให้ cruise เป็น KTAS)', 'calc'],
  descent: [85, '≈2,000 rpm carb heat ตามต้อง', '0', -500, ['LH13', 'LH0'], 'ต่ำ', 'ค่าประมาณ (ผู้เขียนตั้ง): 85 KIAS −500 fpm (2.5 m/s) ไม่มีในแหล่ง; carb heat เมื่อลดกำลังมาก (p.4-9)', 'calc'],
  downwind: [80, 'ลดหลัง carb heat ON', '0', 0, ['LH13'], 'ต่ำ', 'ias ค่าประมาณ (ผู้เขียนตั้ง): IM ไม่ให้ความเร็ว downwind ใช้ค่าระหว่าง enroute climb 70–80 และ approach แฟลปขึ้น 60–70 KIAS; carb heat ก่อนลดกำลัง p.4-9', 'calc'],
  base: [65, 'ลดตาม path (carb heat ON)', '20', -500, ['LH13', 'LH0'], 'ต่ำ', 'ค่าประมาณ (ผู้เขียนตั้ง): 65 KIAS แฟลป 20 −500 fpm ระหว่าง approach แฟลปขึ้น 60–70 และ final 55–65 KIAS ของ IM', 'calc'],
  final: ['VAPP', 'ปรับตาม path', '30', -320, ['LH13'], 'สูง', '55–65 แฟลป 30 (60–70 แฟลปขึ้น); short field 54', 'calc'],
  flare: [null, 'idle', '30', -120, ['LH1', 'LH13'], 'กลาง', 'roundout 10–20 ft (AFH p.9-8)', 'flare'],
  touchdown: [null, 'idle', '30', -120, ['LH13'], 'กลาง', 'ล้อหลักก่อน; VS0 31–35 KIAS ตาม CG (IM p.5-10)', 'td'],
  go_around: [55, 'เต็ม carb heat cold', '20', 200, ['LH13'], 'สูง', 'แฟลป 30→20 ทันทีแล้วเก็บช้า ๆ; rate ค่าประมาณ', 'calc'],
}) } };
// ---------------- DA40 NG ----------------
T.da40ng = { ops: { attitude_power: ap('da40ng', {
  takeoff_roll: [0, 'MAX 100 % load (prop 2,200–2,300 rpm)', 'T/O', 0, ['LH17'], 'กลาง', '', null],
  rotation: [63, 'MAX', 'T/O', 0, ['LH17', 'LH18'], 'กลาง', 'VR 56/58/61/65/67 KIAS ที่ 940/1,000/1,100/1,200/1,280 kg: ที่มวลฝึก 1,150 kg ได้ 63 KIAS (32.4 m/s, ประมาณเชิงเส้น); SOP ซิม +7.5° ANU', 'calc'],
  initial_climb: [72, 'MAX', 'T/O', 650, ['LH17'], 'กลาง', 'Vy ถึงความสูงปลอดภัย; ROC 651 fpm (3.3 m/s) MTOM', 'calc'],
  cruise_climb: [88, '≈92 %', 'UP', 500, ['LH17', 'LH18'], 'ต่ำ', 'กำลังจาก SOP ของชุมชนซิม; rate ค่าประมาณ', 'calc'],
  cruise: [115, '60–75 %', 'UP', 0, ['LD4'], 'ต่ำ', 'ค่าประมาณ: ias ≈ 115 KIAS จาก cruise_table ของบัตร 05 ที่ 60–75 % ระดับต่ำ', 'calc'],
  descent: [110, '≈35–45 %', 'UP', -500, ['LH0'], 'ต่ำ', 'ค่าประมาณ (ผู้เขียนตั้ง): 110 KIAS −500 fpm ลด load ให้ได้อัตรานี้ ไม่มีในแหล่ง', 'calc'],
  downwind: [90, '30–40 %', 'UP', 0, ['LH18'], 'ต่ำ', 'SOP ของชุมชนซิม (ต่ำ)', 'calc'],
  base: [80, '≈25–30 %', 'T/O', -500, ['LH0'], 'ต่ำ', 'ค่าประมาณ (ผู้เขียนตั้ง): 80 KIAS แฟลป T/O −500 fpm ระหว่าง circuit 90 KIAS [LH18] และ final', 'calc'],
  final: ['VAPP', '≈20–30 % → idle', 'LDG', -390, ['LH17', 'LD3'], 'กลาง', 'VREF LDG 66/68/72/76/76/77 ที่ 940/1,000/1,100/1,200/1,216/1,280 kg; pitch ลบสอดคล้องกับท่าบิน DA40 NG ที่นักบินรายงานในบัตร 05 (แฟลป LDG idle 84 KIAS −6.5°) ดู 08.10', 'calc'],
  flare: [null, 'idle', 'LDG', -120, ['LH1', 'LH17'], 'ต่ำ', 'ปีกต่ำ: ground effect แรง (h/b ≈ 0.05) ลอยนานถ้าเร็วเกิน', 'flare'],
  touchdown: [null, 'idle', 'LDG', -120, ['LH17', 'LH1'], 'ต่ำ', 'ล้อหลักก่อน', 'td'],
  go_around: [72, 'MAX', 'T/O', 400, ['LH17'], 'กลาง', 'ขั้นต่ำ 72 KIAS แฟลป T/O; rate ค่าประมาณ', 'calc'],
}) } };
// DA 40 (IO-360-M1A, MÄM 40-227) — gap 0: AFM 6.01.01-E pages 4A-25…4A-36 [LD6]; speeds by mass interpolated to 1,050 kg
T.da40_180 = { ops: { attitude_power: ap('da40_180', {
  takeoff_roll: [0, 'MAX PWR (คันเร่งเต็มไม่กระชาก) 2,680 ± 20 rpm, mixture RICH, fuel pump ON', 'T/O', 0, ['LD6'], 'สูง', 'รอบวิ่งขึ้น 2,680 ± 20 rpm ถ้าไม่ถึงให้ยกเลิก (p.4A-25); mixture RICH (p.4A-27)', null],
  rotation: [59, 'MAX PWR', 'T/O', 0, ['LD6', 'LD8'], 'สูง', 'ยกล้อหน้า 59 KIAS (30.4 m/s) ค่าเดียวทุกมวล (p.4A-25)', 'calc'],
  initial_climb: [62, 'MAX PWR แล้ว 2,400 rpm เมื่อสูงปลอดภัย, mixture RICH, fuel pump OFF', 'T/O', 780, ['LD6', 'LD4'], 'กลาง', 'ค่าประมาณ (ประมาณเชิงเส้นตามมวล): 67/66/60/54 KIAS ที่ 1,200/1,150/1,000/850 kg (p.4A-26, 4A-27) → 62 KIAS (31.9 m/s) ที่ 1,050 kg; ROC 780 fpm (4.0 m/s) [LD4]', 'calc'],
  cruise_climb: [70, 'MAX PWR / 2,400 rpm, mixture RICH (คง RICH เหนือ 5,000 ft ตาม AFM)', 'UP', 600, ['LD6'], 'กลาง', 'ค่าประมาณ (ประมาณเชิงเส้นตามมวล): 76/73/68/60 KIAS ที่ 1,200/1,150/1,000/850 kg (p.4A-28) → 70 KIAS ที่ 1,050 kg; rate ผู้เขียนตั้ง', 'calc'],
  cruise: [110, '≈22–23 inHg / 2,400 rpm (≈ 65 %, ค่าประมาณ), mixture best economy', 'UP', 0, ['LD6', 'LD4', 'LH0'], 'ต่ำ', 'rpm 1,800–2,400 และ MAP ตามตารางบท 5 (p.4A-29) ซึ่งเป็นภาพอ่านไม่ได้: ค่าประมาณ MAP จากสัดส่วน MAP × rpm ของ IO-360 (100 % ≈ 29 inHg ที่ 2,700 rpm) บวกความสูญเสียราว 1 inHg; mixture best economy ใช้ได้ถึง 75 % (หรี่จนเครื่องสะดุดแล้วดันกลับให้เรียบ EGT สูงสุด) หรือ best power EGT ต่ำกว่า peak 100 °F (55 °C) (p.4A-31, 4A-32); ias ค่าประมาณจาก 137 KTAS ที่ 75 % 6,000 ft [LD4]', 'calc'],
  descent: [105, 'คันเร่งตามต้อง 1,800–2,400 rpm, mixture ปรับตามต้อง', 'UP', -500, ['LD6', 'LH0'], 'ต่ำ', 'CHT ลดไม่เกิน 50 °F (28 °C) ต่อนาที (p.4A-33); ias และ rate ค่าประมาณ (ผู้เขียนตั้ง)', 'calc'],
  downwind: [85, 'fuel pump ON, mixture RICH, RPM HIGH', 'UP', 0, ['LD6', 'LH0'], 'ต่ำ', 'รายการ approach (p.4A-34): fuel pump ON, ถังที่มากกว่า, mixture RICH, RPM HIGH, แฟลป T/O เมื่อต่ำกว่า VFE 108 KIAS; ias ค่าประมาณ (ผู้เขียนตั้ง)', 'calc'],
  base: [75, 'ตามต้อง', 'T/O', -500, ['LD6', 'LH0'], 'ต่ำ', 'แฟลป T/O ระหว่าง approach (p.4A-34); ias และ rate ค่าประมาณ (ผู้เขียนตั้ง)', 'calc'],
  final: ['VAPP', 'ตามต้อง, RPM HIGH, mixture RICH', 'LDG', -350, ['LD6'], 'สูง', 'approach แฟลป LDG 73/71/67/63/58 KIAS ที่ 1,200/1,150/1,092/1,000/850 kg (p.4A-34) → 65 KIAS (33.4 m/s) ที่ 1,050 kg; AFM ให้เพิ่มความเร็วเมื่อลมแรง/wind shear', 'calc'],
  flare: [null, 'idle', 'LDG', -120, ['LH1', 'LD6'], 'ต่ำ', 'ปีกต่ำ ground effect แรง', 'flare'],
  touchdown: [null, 'idle', 'LDG', -120, ['LH1'], 'ต่ำ', 'ล้อหลักก่อน', 'td'],
  go_around: [62, 'MAX PWR', 'T/O', 400, ['LD6'], 'กลาง', 'MAX PWR, แฟลป T/O แล้ว UP เมื่อสูงปลอดภัย (p.4A-36); 67/66/60/54 KIAS (แฟลป T/O) และ 76/73/68/60 (UP) ที่ 1,200/1,150/1,000/850 kg → 62 / 70 KIAS ที่ 1,050 kg (ค่าประมาณ ประมาณเชิงเส้น); rate ผู้เขียนตั้ง', 'calc'],
}) } };
// DA 40 D (TAE 125, FADEC single lever, power as % load) — gap 0: handout [LD8], speeds by mass from the same airframe table [LD6]
T.da40d = { ops: { attitude_power: ap('da40d', {
  takeoff_roll: [0, '100 % load (FADEC คันเดียว) ใบพัด ≈ 2,300 rpm', 'T/O', 0, ['LD8'], 'กลาง', 'กำลังต่อเนื่องสูงสุด 99 kW (135 hp) ที่ใบพัด 2,300 rpm (handout p.11)', null],
  rotation: [59, '100 %', 'T/O', 0, ['LD8', 'LD6'], 'สูง', 'rotate 59 KIAS (30.4 m/s) (handout p.23–24; AFM p.4A-25)', 'calc'],
  initial_climb: [62, '100 %', 'T/O', 550, ['LD8', 'LD6', 'LD14'], 'ต่ำ', 'ค่าประมาณ: takeoff climb 66 KIAS ที่ 1,150 kg (handout p.5) ประมาณเชิงเส้นด้วยตารางมวลของโครงเดียวกัน (60 ที่ 1,000 kg, AFM p.4A-27) → 62 KIAS ที่ 1,060 kg; ROC ≈ 550 fpm (2.8 m/s) ค่าประมาณของบัตร 05 [LD14]', 'calc'],
  cruise_climb: [70, '100 % (หรือ ≥ 80 %)', 'UP', 450, ['LD8', 'LD6'], 'ต่ำ', 'ค่าประมาณ: cruise climb 73 KIAS ที่ 1,150 kg (handout p.5) → 70 KIAS ที่ 1,060 kg (ตาราง AFM p.4A-28); rate ผู้เขียนตั้ง', 'calc'],
  cruise: [105, '55–70 % load', 'UP', 0, ['LD8'], 'ต่ำ', 'ตัวอย่าง 70 % load ที่ 6,000 ft ISA ได้ 121 KTAS (handout p.23) ราว 5 USgal/h (19 l/h) (p.14); ias ค่าประมาณที่ระดับต่ำ', 'calc'],
  descent: [100, '≈30–40 % load', 'UP', -500, ['LH0'], 'ต่ำ', 'ค่าประมาณ (ผู้เขียนตั้ง): handout ไม่ให้ค่า descent', 'calc'],
  downwind: [85, '≈35–45 % load', 'UP', 0, ['LH0', 'LD6'], 'ต่ำ', 'ค่าประมาณ (ผู้เขียนตั้ง); แฟลป T/O เมื่อต่ำกว่า VFE 108 KIAS [LD8]', 'calc'],
  base: [75, '≈25–35 % load', 'T/O', -500, ['LH0'], 'ต่ำ', 'ค่าประมาณ (ผู้เขียนตั้ง)', 'calc'],
  final: ['VAPP', '≈20–30 % → idle', 'LDG', -355, ['LD6', 'LD8'], 'สูง', 'VREF แฟลป LDG 71 KIAS ที่ 1,150 kg (handout p.24) = ตาราง AFM p.4A-34; 66 KIAS (34.0 m/s) ที่มวลฝึก 1,060 kg ตามบัตร; VFE LDG 91 KIAS', 'calc'],
  flare: [null, 'idle', 'LDG', -120, ['LH1'], 'ต่ำ', 'ปีกต่ำ ground effect แรง', 'flare'],
  touchdown: [null, 'idle', 'LDG', -120, ['LH1', 'LD8'], 'ต่ำ', 'handout ให้ VLDG แฟลป LDG 58 KIAS (p.25) ที่ 1,150 kg', 'td'],
  go_around: [62, '100 %', 'T/O', 300, ['LD6', 'LH0'], 'ต่ำ', 'ค่าประมาณ: handout ไม่ให้ค่า go-around; ใช้ลำดับของ AFM โครงเดียวกัน (MAX แฟลป T/O แล้ว UP, p.4A-36) ที่ 1,060 kg', 'calc'],
}) } };
// ---------------- DA42 NG ----------------
T.da42ng = { ops: { attitude_power: ap('da42ng', {
  takeoff_roll: [0, 'MAX ทั้งสองเครื่อง', 'UP', 0, ['LT9'], 'กลาง', '', null],
  rotation: [76, 'MAX', 'UP', 0, ['LT9'], 'กลาง', 'VR 76 KIAS (39.1 m/s)', 'calc'],
  initial_climb: [90, 'MAX', 'UP', 1100, ['LT9', 'LH29'], 'กลาง', 'Vy 90 KIAS (46.3 m/s); เก็บล้อเมื่อ positive rate; ROC 1,180 fpm MTOM', 'calc'],
  cruise_climb: [100, '≈92 %', 'UP', 900, ['LH29'], 'ต่ำ', 'rate ค่าประมาณ; แหล่งเป็นรุ่น L360', 'calc'],
  cruise: [140, '60–75 %', 'UP', 0, ['LT10'], 'ต่ำ', 'ค่าประมาณ: ias ≈ 140 KIAS จาก cruise_table ของบัตร 06 ที่ 60–75 % ระดับต่ำ', 'calc'],
  descent: [130, 'ลดให้ได้ ≈500 fpm', 'UP', -500, ['LH29'], 'ต่ำ', '130–140 KIAS (L360)', 'calc'],
  downwind: [100, '≈35 %', 'UP', 0, ['LH29'], 'ต่ำ', 'ค่าประมาณ (ผู้เขียนตั้ง): ias และ load ไม่มีในแหล่ง (สูงกว่า base 95 KIAS เล็กน้อย); ล้อลงบน base เมื่อแน่ใจว่าลงได้ [LH29]', 'calc'],
  base: [95, '≈25–30 %', 'APP', -500, ['LH29'], 'ต่ำ', 'base 95 KIAS ล้อลง (flashcard รุ่น L360 [LH29]); load และ rate ค่าประมาณ', 'calc'],
  final: ['VAPP', '≈20–30 %', 'LDG', -430, ['LT9'], 'กลาง', 'VREF ≤ 1,900 kg (86 > 1,900 kg)', 'calc'],
  flare: [null, 'idle ทั้งสองเครื่อง', 'LDG', -120, ['LH1'], 'ต่ำ', 'ปีกต่ำ ground effect แรง', 'flare'],
  touchdown: [null, 'idle', 'LDG', -120, ['LT2', 'LH1'], 'ต่ำ', 'VS0 62 KIAS ปลาย white arc ที่ 1,900 kg [LT2]', 'td'],
  go_around: [90, 'MAX', 'APP', 500, ['LH29'], 'ต่ำ', 'LDG→APP, ล้อขึ้นเมื่อ positive rate; rate ค่าประมาณ', 'calc'],
}) } };
// DA 42 (TAE 125 "TDI", MÄM 42-088) — gap 0: AFM 4A.2 speeds [LT5], AOPA spec box [LT16]; power as % load per engine
T.da42_tae125 = { ops: { attitude_power: ap('da42_tae125', {
  takeoff_roll: [0, '100 % load ทั้งสองเครื่อง (FADEC คันละเครื่อง)', 'UP', 0, ['LT5'], 'กลาง', '', null],
  rotation: [70, '100 %', 'UP', 0, ['LT5', 'LT16'], 'สูง', 'VR 70 KIAS (36.0 m/s) ≤ 1,700 kg (72 > 1,700 kg) [LT5 p.4A-3]; การจับแถวตาราง 4A.2 เป็นการอนุมานของบัตร 06', 'calc'],
  initial_climb: [77, '100 %', 'UP', 1060, ['LT5', 'LT16'], 'กลาง', 'Vy 77 KIAS (39.6 m/s) ≤ 1,700 kg [LT5]; ROC 1,060 fpm (5.4 m/s) [LT16]; เก็บล้อเมื่อ positive rate', 'calc'],
  cruise_climb: [90, '≈ 80–100 %', 'UP', 800, ['LT16', 'LH0'], 'ต่ำ', 'ค่าประมาณ (ผู้เขียนตั้ง) ทั้ง ias load และ rate', 'calc'],
  cruise: [125, '60 % load', 'UP', 0, ['LT16'], 'ต่ำ', '60 % ได้ 138 KTAS ที่ 10,000 ft 16.7 l/h ต่อเครื่อง [LT16]; ias ค่าประมาณที่ระดับต่ำ', 'calc'],
  descent: [120, '≈30–40 % load', 'UP', -500, ['LH0'], 'ต่ำ', 'ค่าประมาณ (ผู้เขียนตั้ง)', 'calc'],
  downwind: [100, '≈35 % load', 'UP', 0, ['LH0'], 'ต่ำ', 'ค่าประมาณ (ผู้เขียนตั้ง) ใช้รูปแบบเดียวกับ NG', 'calc'],
  base: [90, '≈25–30 % load', 'APP', -500, ['LH0'], 'ต่ำ', 'ค่าประมาณ (ผู้เขียนตั้ง); ล้อลง', 'calc'],
  final: ['VAPP', '≈20–30 %', 'LDG', -430, ['LT5'], 'สูง', 'final approach ขั้นต่ำ 82 KIAS (42.2 m/s) ทั้งสองแถบมวล [LT5 p.4A-3]; VREF 76 KIAS (≤ 1,700 kg)', 'calc'],
  flare: [null, 'idle', 'LDG', -120, ['LH1'], 'ต่ำ', 'ปีกต่ำ ground effect แรง', 'flare'],
  touchdown: [null, 'idle', 'LDG', -120, ['LT5', 'LH1'], 'ต่ำ', 'VS0 57 KIAS ที่ 1,785 kg [LT5 p.5-8]', 'td'],
  go_around: [82, '100 %', 'APP', 400, ['LT5', 'LH0'], 'ต่ำ', 'ค่าประมาณ: LDG→APP ล้อขึ้นเมื่อ positive rate; ias = final ขั้นต่ำ [LT5]; rate ผู้เขียนตั้ง', 'calc'],
}) } };
// ---------------- T-6A ----------------
const t6rows = {
  takeoff_roll: [0, 'MAX', 'TO', 0, ['LH14'], 'สูง', '', null],
  rotation: [85, 'MAX', 'TO', 0, ['LH14', 'LH15'], 'สูง', 'takeoff attitude 7–10° NH; VR 85 KIAS (43.7 m/s)', 'pub:8.5'],
  initial_climb: [140, 'MAX', 'UP', null, ['LH14'], 'สูง', 'tech climb 140/160/180 KIAS = 15/12.5/10° NH; pattern climb 120 KIAS 60–70 % torque', 'pub:15'],
  cruise_climb: [160, 'MAX', 'UP', null, ['LH14'], 'สูง', '', 'pub:12.5'],
  cruise: [200, '≈50 % + 1 %/1,000 ft MSL', 'UP', 0, ['LH14'], 'กลาง', 'Table 2.1: 250 KIAS ≈ 93 % 2° NL; 200 KIAS 0°; 150 KIAS 32 % 2° NH (สูตร 08.1 ได้ −0.1° ที่ 200 KIAS, T-LH-52)', 'calc'],
  descent: [200, '≈10–20 %', 'UP', -1500, ['LH15'], 'ต่ำ', 'ค่าประมาณ: 10 % ใช้ลดสู่ pattern altitude', 'calc'],
  downwind: [120, '≈31 %', 'UP', 0, ['LH15'], 'กลาง', 'ล้อลงเมื่อ < 150 KIAS; abeam ลดเป็น 15 %', 'calc'],
  base: [110, '≈15 %', 'LDG', -800, ['LH15'], 'กลาง', 'approach turn 120/115/110 (UP/TO/LDG), 90 position 400 ft AGL; rate ค่าประมาณ', 'calc'],
  final: ['VAPP', 'ตามต้อง (≥ on-speed AOA)', 'LDG', -530, ['LH15', 'LP20'], 'กลาง', '110/105/100 KIAS (UP/TO/LDG); groove 100–150 ft ≈ 1,500 ft', 'calc'],
  flare: [null, 'idle ที่ 5–10 ft', 'LDG', -120, ['LH15'], 'กลาง', 'ลดกำลังสู่ idle ที่ 5–10 ft แล้วตั้ง landing attitude และ flare ใน ground effect (Fig 6-10)', 'flare'],
  touchdown: [null, 'idle', 'LDG', -120, ['LH15'], 'กลาง', 'attitude สูงกว่า takeoff attitude เล็กน้อย (7–10° NH) [LH15]', 'td'],
  go_around: [110, 'MAX', 'TO', 1500, ['LH15'], 'ต่ำ', 'ค่าประมาณ ias และ rate', 'calc'],
};
T.t6a = { ops: { attitude_power: ap('t6a', t6rows, 't6a', { flareH: 2.3 }) } };
// T-6C — gap 0: same technique and power (torque %) as the T-6A, card mass-scaled approach [LP27][LP20][LP31]
T.t6c = { ops: { attitude_power: ap('t6c', { ...t6rows,
  rotation: [85, 'MAX', 'TO', 0, ['LP29', 'LH15'], 'กลาง', 'VR 85 KIAS ที่ 6,300 lb [LP29]; เทคนิคเดียวกับ T-6A (7–10° NH) [LH15]; มวลฝึก 2,776 kg หนักกว่า T-6A จึงยกหัวช้ากว่าเล็กน้อย', 'calc'],
  initial_climb: [140, 'MAX', 'UP', 2860, ['LP29', 'LP27'], 'กลาง', 'VY 140 KIAS [LP29]; ROC 2,860 fpm (14.5 m/s) ค่าประมาณของบัตร 07', 'calc'],
  cruise_climb: [160, 'MAX', 'UP', 2500, ['LH14', 'LP27'], 'ต่ำ', 'ค่าประมาณ: ความเร็วเดียวกับ T-6A [LH14]; rate ผู้เขียนตั้ง', 'calc'],
  final: ['VAPP', 'ตามต้อง (≥ on-speed AOA)', 'LDG', -550, ['LP27', 'LP20', 'LP31'], 'กลาง', 'final 100 KIAS ของ T-6A สเกลด้วย √(มวล) ตามบัตร 07; รายงานบิน T-6C: short final 110 KIAS แตะ 100 [LP31]', 'calc'],
  touchdown: [null, 'idle', 'LDG', -120, ['LH15', 'LP31'], 'กลาง', 'เทคนิคเดียวกับ T-6A; รายงานบินให้แตะราว 100 KIAS [LP31] (เร็วกว่าค่าประมาณ 1.05 VS0 ซึ่งเป็นปลาย flare)', 'td'] }, 't6c', { flareH: 2.3 }) } };
// PC-9 M / PC-7 MkII: T-6 class technique (ค่าประมาณ); rotation/climb from the 07 cards (VR, VY), low speeds scaled by VS0, final = card VAPP
for (const id of ['pc9m', 'pc7mk2']) {
  const k = id === 'pc9m' ? 0.893 : 0.867, rows = {};
  for (const [ph, r] of Object.entries(t6rows)) {
    const low = ['downwind', 'base', 'go_around'].includes(ph);
    rows[ph] = [r[0] && r[0] !== 'VAPP' && low ? Math.round(r[0] * k) : r[0], r[1] + ' (คลาส T-6)', r[2], r[3], [...r[4], 'LP2', 'LP9', 'LP27'], 'ต่ำ', `ค่าประมาณ: เทคนิคคลาส T-6${low ? ` ความเร็วสเกล VS0 ×${k}` : ''}`, r[7] && r[7].startsWith('pub') ? 'calc' : r[7]];
  }
  const vr = id === 'pc9m' ? 78 : 76;
  rows.rotation = [vr, 'MAX (คลาส T-6)', 'TO', 0, ['LP27', 'LH15'], 'ต่ำ', `ค่าประมาณ: VR ${vr} kt CAS ของบัตร 07 (≈ 1.05 VS แฟลป TO)`, 'calc'];
  rows.initial_climb = [136, 'MAX (คลาส T-6)', 'UP', id === 'pc9m' ? 3000 : 2500, ['LP27', 'LP29'], 'ต่ำ', 'ค่าประมาณ: VY 136 kt CAS ของบัตร 07 (lp_perf.mjs); rate ผู้เขียนตั้งต่ำกว่า ROC ของบัตร', 'calc'];
  T[id] = { ops: { attitude_power: ap(id, rows, id, { flareH: 2.3 }) } };
}
// ---------------- P2006T (gap 8: complete from the 12-p2006t card and AFM Section 4 [LG3]) ----------------
T.p2006t = { ops: { attitude_power: ap('p2006t', {
  takeoff_roll: [0, 'ใบพัดเต็มหน้า คันเร่งเต็ม (กำลังวิ่งขึ้นไม่เกิน 5 นาที)', 'T/O', 0, ['LG3'], 'สูง', 'trim pitch และ rudder ตั้งกลางก่อนวิ่งขึ้น (S4-23/24); ตรวจค่าเครื่องในแถบเขียว (S4-25)', null],
  rotation: [64, 'เต็ม', 'T/O', 0, ['LG3'], 'สูง', 'VR 64 KIAS (32.9 m/s) ที่ 1,180 kg, 65 ที่ 1,230 kg (S4-7)', 'calc'],
  initial_climb: [80, 'เต็ม แล้ว MCP 2,250 rpm เมื่อสูงปลอดภัย', 'UP', 1105, ['LG3', 'LG4'], 'กลาง', 'VY 80 KIAS (41.2 m/s) แฟลป UP ที่ 1,180 kg (S4-7); ล้อขึ้นเมื่อ positive rate ที่ VY/VX ภายในราว 20 s และ AFM ระบุว่าแฟลป UP ไต่ดีที่สุดเสมอ (S4-25); ROC 1,105 fpm (5.6 m/s) ค่าประมาณของบัตร 12 [LG4]', 'calc'],
  cruise_climb: [90, 'MCP: ลด MAP ก่อนแล้วลด rpm ≤ 2,250', 'UP', 800, ['LG3', 'LH0'], 'ต่ำ', 'ลำดับลดกำลัง MAP ก่อน rpm (S4-3, S4-25); ias และ rate ค่าประมาณ (ผู้เขียนตั้ง)', 'calc'],
  cruise: [135, '≈25 inHg / 2,250 rpm ≈ 75 %', 'UP', 0, ['LG3', 'LG10'], 'ต่ำ', 'rpm cruise 1,900–2,250 carb heat ตามต้อง (S4-26); 25 inHg ≈ 75 % ได้ 142 KTAS ที่ 3,500 ft −8 °C [LG10]; ias ค่าประมาณ', 'calc'],
  descent: [110, 'ลด MAP, ใบพัด 2,250 rpm (MCP), carb heat ตามต้อง', 'UP', -500, ['LG3', 'LH0'], 'ต่ำ', 'ใบพัดตั้ง MCP 2,250 rpm สำหรับ descent/approach (S4-27); ias และ rate ค่าประมาณ (ผู้เขียนตั้ง)', 'calc'],
  downwind: [90, 'ตามต้อง ใบพัด 2,250 rpm', 'T/O', 0, ['LG3'], 'สูง', 'approach แฟลป T/O 90 KIAS (S4-7); แฟลป T/O เมื่อต่ำกว่า VFE 119 KIAS, ล้อลงเมื่อต่ำกว่า VLO และตรวจไฟเขียวสามดวง (S4-27)', 'calc'],
  base: [80, 'ตามต้อง', 'T/O', -500, ['LG3', 'LH0'], 'ต่ำ', 'ค่าประมาณ (ผู้เขียนตั้ง): 80 KIAS ระหว่าง approach 90 และ final 70; แฟลป FULL เมื่อต่ำกว่า 93 KIAS บน final (S4-27)', 'calc'],
  final: ['VAPP', 'ตามต้อง ใบพัดเต็มหน้า carb heat OFF', 'FULL', -370, ['LG3'], 'สูง', 'final 70 KIAS (36.0 m/s) แฟลป FULL ที่ 1,180 kg, 71 ที่ 1,230 kg (S4-7, S4-27)', 'calc'],
  flare: [null, 'idle', 'FULL', -120, ['LH1', 'LG3'], 'ต่ำ', 'AFM ไม่บรรยาย flare; ใช้เทคนิค AFH', 'flare'],
  touchdown: [null, 'idle', 'FULL', -120, ['LG3', 'LH1'], 'ต่ำ', 'AFM ให้ touchdown 65 KIAS (S4-27) ซึ่งสูงกว่าค่าประมาณปลาย flare 1.05 VS0 ของสคริปต์ (ซิมควรถือ 65 เป็นความเร็วเริ่ม flare)', 'td'],
  go_around: [70, 'ใบพัดเต็มหน้าก่อน แล้วคันเร่งเต็ม', 'T/O', 400, ['LG3', 'LH0'], 'กลาง', 'แฟลป T/O, ไม่ต่ำกว่า 62 KIAS แล้วไต่ที่ VY/VX, ล้อขึ้นเมื่อ positive rate แล้วแฟลป UP (S4-28); ias 70 และ rate ค่าประมาณ', 'calc'],
}) } };
// ---------------- Thai-school types from 13-other-trainers (no aero data: speeds and power only) ----------------
T.pa28_161 = { ops: { attitude_power: ap('pa28_161', {
  rotation: [50, 'เต็ม', '0', 0, ['LH19'], 'กลาง', 'short field 50 KIAS (Warrior, p.41) แฟลปตามคู่มือ', null],
  initial_climb: [79, 'เต็ม', '0', null, ['LH19'], 'กลาง', 'Vy 79, Vx 63 (p.22)', null],
  cruise_climb: [87, 'เต็ม', '0', null, ['LH19'], 'กลาง', '', null],
  downwind: [90, 'ลดเริ่ม descent', null, 0, ['LH19'], 'กลาง', 'เริ่มลดที่ abeam ≈ 90 kt; แฟลปตามต้อง', null],
  base: [80, '-', null, null, ['LH19'], 'กลาง', 'เลี้ยวที่ 45° จากจุดแตะ; แฟลปตามต้อง', null],
  final: ['VAPP', 'ตาม path', '40', null, ['LH19', 'LN3'], 'กลาง', 'โรงเรียนต้นทางใช้ 65 KIAS +½ gust; stabilised ไม่ต่ำกว่า 300 ft AGL (p.43)', null],
  flare: [null, 'idle', '40', -120, ['LH1'], 'ต่ำ', '', 'flare'],
  go_around: [63, 'เต็ม', '25', null, ['LH19'], 'กลาง', 'เก็บแฟลปขั้นแรก (40 → 25) ทันที; pitch Vx แล้ว Vy', null],
}) } };
T.be76 = { ops: { attitude_power: ap('be76', {
  takeoff_roll: [0, 'เต็ม', '0', 0, ['LH20'], 'ต่ำ', 'flashcard ผู้ใช้: ลดเป็น 25 inHg / 2,500 rpm เมื่อพ้นปลายรันเวย์ (end of runway power)', null],
  cruise_climb: [100, '25 inHg / 2,500 rpm', '0', null, ['LH20'], 'ต่ำ', '', null],
  cruise: [120, '21 inHg / 2,300 rpm', '0', 0, ['LH20'], 'ต่ำ', '', null],
  descent: [115, '20 inHg / 2,300 rpm', '0', null, ['LH20'], 'ต่ำ', 'หรือ 15 inHg 105 KIAS', null],
  downwind: [105, '18 inHg / 2,300 rpm', '10', 0, ['LH20'], 'ต่ำ', 'แฟลป 10 บน downwind; abeam 15 inHg 90 KIAS', null],
  base: [85, '≈15 inHg', '20', null, ['LH20'], 'ต่ำ', '', null],
  final: ['VAPP', 'props full forward', '35', null, ['LH20', 'LN5'], 'ต่ำ', '76 KIAS short final (flashcard)', null],
  flare: [null, 'idle', '35', -120, ['LH1'], 'ต่ำ', '', 'flare'],
  go_around: [85, 'เต็ม', null, null, ['LH20'], 'ต่ำ', 'pitch Vy 85; แฟลปตามต้อง', null],
}) } };
T.p2002jf = { ops: { attitude_power: ap('p2002jf', {
  initial_climb: [null, 'เต็ม', 'TO', 800, ['LH26'], 'กลาง', 'ROC SL ที่ 620 kg', null],
  cruise: [null, '75 %', 'UP', 0, ['LH26'], 'กลาง', '118 kt ที่ 6,500 ft', null],
  final: ['VAPP', '-', 'LDG', null, ['LH26', 'LH25', 'LN11'], 'ต่ำ', 'VFE LDG 67 KIAS', null],
  flare: [null, 'idle', 'LDG', -120, ['LH1'], 'ต่ำ', '', 'flare'],
}) } };
T.p68c = { ops: { attitude_power: ap('p68c', {
  final: ['VAPP', '-', '35', null, ['LH27', 'LN14'], 'ต่ำ', 'แฟลป 30–35°; VFE 30–35° 99 KCAS, VMC 60 KCAS [LH27]', null],
  flare: [null, 'idle', '35', -120, ['LH1'], 'ต่ำ', '', 'flare'],
}) } };
T.t206h = { ops: { attitude_power: ap('t206h', {
  cruise_climb: [null, '2,400 rpm / 30 inHg', 'UP', null, ['LH24'], 'กลาง', 'cowl flaps open', null],
  cruise: [null, '65–75 % (lean 75 °F ROP TIT)', 'UP', 0, ['LH24'], 'กลาง', '65–75 % ตาม POH p.7-38 (ช่วง 50 ชม.แรก); lean ด้วย TIT ได้ที่ ≤ 75 % MCP, 75 °F (42 °C) ROP p.4-37/4-38', null],
  final: ['VAPP', '-', 'FULL', null, ['LH23', 'LN18'], 'ต่ำ', 'แฟลป 10–FULL', null],
  flare: [null, 'idle', 'FULL', -120, ['LH1'], 'ต่ำ', '', 'flare'],
}) } };
T.ct4 = { ops: { attitude_power: ap('ct4', {
  final: ['VAPP', '-', 'LDG', null, ['LH28', 'LN22'], 'ต่ำ', 'ผู้ใช้ทางทหาร แบบทั่วไป; VFE TO 100 / LDG 85 kt CAS จาก TCDS [LH28]', null],
  flare: [null, 'idle', 'LDG', -120, ['LH1'], 'ต่ำ', '', 'flare'],
}) } };

// ---------------- per-type descriptive ops leaves ----------------
const add = (id, k, leaf_) => { T[id].ops[k] = leaf_; };
const xw = (v, src, conf, note, est = false) => L(v, 'kt', src, conf, est, note);
add('c172s', 'crosswind_limits', xw({ demonstrated: 15, limitation: false }, ['LC1', 'LH11'], 'สูง', 'สาธิต 15 kt (7.7 m/s) ไม่ใช่ขีดจำกัด (IM p.4-5); SOP ของโรงเรียนแยก 20 kt แฟลป 0–10 / 15 kt แฟลป 20–30 (p.4)'));
add('c172r', 'crosswind_limits', xw({ demonstrated: 15, limitation: false }, ['LH12'], 'สูง', 'p.4-5, 4-33'));
add('c152', 'crosswind_limits', xw({ demonstrated: 12, limitation: false }, ['LH13'], 'สูง', 'p.4-3, 5-10A (ไม่ใช่ขีดจำกัด)'));
add('da40ng', 'crosswind_limits', xw({ demonstrated: 25, limitation: false }, ['LH17'], 'กลาง', 'checklist p.8'));
add('da40_180', 'crosswind_limits', xw({ demonstrated: 20, limitation: false }, ['LD4'], 'กลาง', 'DA 40 รุ่น IO-360 (XLT) 20 kt (10.3 m/s) จากหน้าสเปกของผู้ผลิตผ่านบัตร 05'));
add('da40d', 'crosswind_limits', xw({ demonstrated: 20, limitation: false }, ['LD4'], 'ต่ำ', 'ค่าประมาณ: บัตร 05 ใช้ค่าของรุ่น IO-360 (20 kt) เพราะ handout ไม่ให้ค่า', true));
add('da42ng', 'crosswind_limits', xw({ demonstrated: 25, limitation: false }, ['LT10', 'LT6'], 'กลาง', 'สเปก DA42 NG (AOPA 2010) และโบรชัวร์ DA42-VI ผ่านบัตร 06; AFM NG บท 4/5 เปิดไม่ได้'));
add('da42_tae125', 'crosswind_limits', xw({ demonstrated: 20, limitation: false }, ['LT16'], 'กลาง', 'สเปก AOPA 2006 จาก POH DA 42 1,785 kg ผ่านบัตร 06'));
add('pa28_161', 'crosswind_limits', xw({ demonstrated: 17, limitation: false }, ['LH19'], 'กลาง', 'ตาราง V-speeds ของโรงเรียน p.22 (ไม่ระบุว่าสาธิตหรือจำกัด)'));
add('t6a', 'crosswind_limits', xw({ dry: 25, wet: 10, icy: 5, touch_and_go: 20, formation: 15, tailwind_takeoff: 10, limitation: true, demonstrated: 24 }, ['LH16', 'LP29'], 'สูง', 'ขีดจำกัดปฏิบัติการของผู้ใช้ [LH16]; maximum demonstrated 24 kt ในสเปกของผู้ผลิต [LP29]'));
add('t6c', 'crosswind_limits', xw({ dry: 25, wet: 10, icy: 5, touch_and_go: 20, formation: 15, tailwind_takeoff: 10, limitation: true, demonstrated: 24 }, ['LH16', 'LP29'], 'กลาง', 'ใช้ขีดจำกัดของ T-6A (เอกสารของผู้ใช้ไม่แยก T-6C) [LH16]; demonstrated 24 kt [LP29]'));
for (const id of ['pc9m', 'pc7mk2']) add(id, 'crosswind_limits', xw({ dry: 25, limitation: false }, ['LH16'], 'ต่ำ', 'ค่าประมาณ: ใช้ค่าคลาส T-6 (ไม่มีค่าสาธารณะของแบบนี้)', true));
add('p2006t', 'crosswind_limits', xw({ demonstrated: 17, limitation: false }, ['LG5'], 'สูง', 'maximum demonstrated crosswind 17 kt (8.7 m/s) (AFM p5-6) ผ่านบัตร 12'));

// stall leaves: altitude loss from each card's speeds.stall_altitude_loss_ft (est/conf carried over)
const lossOf = id => { const l = leaf(card(id), 'speeds.stall_altitude_loss_ft'); return l ? { ft: l.v, est: !!l.est, src: l.src || [] } : null; };
const stall = (id, v, src, conf, est, note) => {
  const lo = lossOf(id); let n = note;
  if (lo && v.altitude_loss_ft == null) { v.altitude_loss_ft = lo.ft; v.altitude_loss_m = Math.round(lo.ft * FT); src = [...new Set([...src, ...lo.src])]; est = est || lo.est;
    n = `${note ? note + '; ' : ''}ความสูงที่เสียตอน stall และแก้ ${lo.ft} ft (${Math.round(lo.ft * FT)} m) จากบัตร${lo.est ? ' (ค่าประมาณของบัตร: สัดส่วน h/VS1² ของ POH เครื่องฝึก)' : ''}`; }
  add(id, 'stall_characteristics', L(v, 'kt, ft, m', src, conf, est, n));
};
stall('c172s', { warning: 'แตร reed ขอบหน้าปีก', warning_margin_kt: [5, 10], behaviour: 'conventional' }, ['LH12'], 'สูง', false, 'margin จาก C172R IM p.4-30');
stall('c172r', { warning_margin_kt: [5, 10], behaviour: 'conventional' }, ['LH12'], 'สูง', false, 'p.4-30');
stall('c152', { warning_margin_kt: 10, behaviour: 'conventional' }, ['LH13'], 'สูง', false, 'p.4-18, 5-10');
stall('da40ng', { warning: 'lift detector ปีกซ้าย', warning_margin_kt: 5, behaviour: 'AFM ไม่บรรยายการตกปีก', dynamic_stall: 'ห้าม' }, ['LD2', 'LD8'], 'กลาง', true, 'ค่าประมาณ: margin = เกณฑ์ขั้นต่ำ 23.207');
for (const id of ['da40_180', 'da40d']) stall(id, { warning: 'lift detector ปีกซ้าย', warning_margin_kt: 5, behaviour: 'AFM ไม่บรรยายการตกปีก' }, ['LD6', 'LD8'], 'กลาง', true, 'ค่าประมาณ: margin = เกณฑ์ขั้นต่ำ 23.207; รุ่นเดิมโครงเดียวกับ NG');
stall('da42ng', { warning_margin_kt: 5, note_l360: 'รุ่น L360 ไม่ถึง 5 kt ที่ CG หน้า' }, ['LT4'], 'ต่ำ', true, 'ค่าประมาณ: margin = ขั้นต่ำ 5 kt ของ 14 CFR 23.207 / CS-23 เพราะ AFM ที่เปิดได้ไม่ให้ตัวเลข');
stall('da42_tae125', { warning_margin_kt: 5 }, ['LT5'], 'ต่ำ', true, 'ค่าประมาณ: margin = ขั้นต่ำ 23.207');
stall('t6a', { warning: 'stick shaker', warning_margin_kt: [5, 10], buffet_margin_kt: 3, roll_off: 'ซ้ายเมื่อ > 60 % torque แม้ใช้ rudder/aileron ขวาเต็ม; แฟลปทำให้แย่ลง', recovery: 'MAX power, ผ่อนคัน, wings level, ball กลาง, AOA < 18 units' }, ['LH15', 'LP19'], 'กลาง', false, 'ตัวเลข margin จาก flashcard [LP19]');
stall('t6c', { warning: 'stick shaker', warning_margin_kt: [5, 10], roll_off: 'เหมือน T-6A' }, ['LH15', 'LP19'], 'ต่ำ', true, 'ค่าประมาณ: ลักษณะเดียวกับ T-6A (โครงเดียวกัน)');
for (const id of ['pc9m', 'pc7mk2']) stall(id, { warning_margin_kt: [5, 10] }, ['LP19'], 'ต่ำ', true, 'ค่าประมาณ: คลาส T-6');
stall('p2006t', { buffet_onset_kt: 50, behaviour: 'ไม่รุนแรง', oei_stall: 'ห้าม' }, ['LH22', 'LH21'], 'ต่ำ', false, 'บทความทดสอบ; POH p.2-22');

const spin = (id, v, src, conf, est, note) => add(id, 'spin', L(v, 'turn, ft, s', src, conf, est, note));
spin('c172s', { approved: 'utility category เท่านั้น', flaps: 'ห้าม', recovery_turns_max: 0.25, alt_loss_1turn_ft: 1000, complete_recovery_agl_ft: 4000, training_turns: [1, 2], recovery: 'idle, aileron กลาง, rudder ตรงข้ามเต็ม, ดันคันไปหน้า, rudder กลางเมื่อหยุดหมุน' }, ['LH12'], 'สูง', false, 'C172R IM p.4-30…4-32 ใช้กับ 172S (การรับรองเดียวกัน); 1,000 ft = 305 m, 4,000 ft = 1,219 m');
spin('c172r', { approved: 'utility category เท่านั้น', flaps: 'ห้าม' }, ['LH12'], 'สูง', false, 'p.2-9, 4-30');
spin('c152', { approved: true, flaps: 'ห้าม', alt_loss_1turn_ft: 1000, alt_loss_6turn: 'มากกว่าสองเท่าเล็กน้อย', complete_recovery_agl_ft: 4000 }, ['LH13'], 'สูง', false, 'p.2-6 (maneuver limits), 4-18…4-20');
spin('da40ng', { approved: false }, ['LD2'], 'สูง', false, 'normal category ห้าม spin และ aerobatics');
for (const id of ['da40_180', 'da40d']) spin(id, { approved: false, recovery: 'idle, rudder ตรงข้ามเต็ม, ดันคันหน้าสุด, aileron กลาง, เก็บแฟลป' }, ['LD6'], 'สูง', false, 'ห้าม spin; ขั้นตอนแก้ spin ไม่ตั้งใจ (สรุป) AFM p.3-33 ผ่านบัตร 05');
spin('da42ng', { approved: false }, ['LT2'], 'สูง', false, 'normal category');
spin('t6a', { approved: true, entry_min_ft_msl: 13500, prohibited_below_ft_pa: 10000, prohibited_above_ft_pa: 22000, max_aggravated_turns: 2, s_per_turn: [2, 3], ft_per_turn: [400, 500], stabilised_kias: [120, 135], recovery_ft: '≈500 ft/รอบ + 1,500–2,000 ft' }, ['LH16', 'LH15', 'LP19'], 'กลาง', false, 'ตัวเลขลักษณะ spin จาก flashcard (ต่ำ); ขีดจำกัดความสูงจาก ops limits (สูง); 13,500 ft = 4,115 m');
for (const id of ['pc9m', 'pc7mk2']) spin(id, { approved: 'aerobatic category (รายละเอียดไม่เปิดเผย)' }, ['LP2', 'LP9'], 'ต่ำ', false, 'TCDS/fact sheet');
spin('p2006t', { approved: false }, ['LH21'], 'สูง', false, 'POH p.2-22, 3-44');
spin('t206h', { approved: false }, ['LH23'], 'สูง', false, 'POH p.2-9');
spin('ct4', { approved: 'CT/4E acrobatic category; CT/4A acrobatic + normal' }, ['LH28'], 'กลาง', false, 'TCDS ไม่ให้รายละเอียด spin');
spin('pa28_161', { approved: 'ไม่ยืนยันในรอบนี้' }, ['LH19'], 'ต่ำ', false, 'โรงเรียนต้นทางอนุญาต spin เฉพาะใน C152');

// flap effects: VFE from the cards (speeds.VFE), balloon (instantaneous Δn at held α) and Δα from lh_attitude.mjs
const flaps = (id, v, src, conf, est, note) => add(id, 'flap_effects', L(v, 'kt, g, deg', src, conf, est, note));
const vfe = id => val(card(id), 'speeds.VFE');
const bl = (id, f1, f2, kias) => +balloon(TYPES[id], f1, f2, kias).toFixed(2);
const dAlpha = id => +(A[id].downwind.alpha_deg - A[id].final.alpha_deg).toFixed(1);
flaps('c172s', { VFE: vfe('c172s'), balloon_dn_g: { '0to10_85kt': bl('c172s', '0', '10', 85), '10to20_80kt': bl('c172s', '10', '20', 80), '20to30_70kt': bl('c172s', '20', '30', 70) }, approach_alpha_drop_deg: 4.0, notes: 'ปีกสูงแฟลป Fowler: กางแล้วลอยและเชิดหัว ต้องดันคันและ trim; เกิน 20° หลีกเลี่ยง slip ชัน' }, ['LH1', 'LH12', 'LH0'], 'กลาง', true, 'ค่าประมาณ: balloon และ Δα จาก lh_attitude.mjs (T-LH-06, 07)');
flaps('c152', { VFE: vfe('c152'), balloon_dn_g: { '0to10_80kt': bl('c152', '0', '10', 80), '20to30_65kt': bl('c152', '20', '30', 65) }, notes: 'เก็บแฟลป 10 ช้า ๆ หลัง 60 KIAS; balked landing เหลือ 20 ทันที' }, ['LH13', 'LF1', 'LH0'], 'กลาง', true, 'ค่าประมาณ: balloon จาก lh_attitude.mjs กับบัตร 11 (gap 9)');
flaps('da40ng', { VFE: vfe('da40ng'), balloon_dn_g: { 'UPtoTO_100kt_upper_bound': bl('da40ng', 'UP', 'T/O', 100) }, notes: 'ปีกต่ำ แฟลป 20°/42°: ΔCL0 ของบัตร 05 (0.52/0.75) ยืนยันด้วย DATCOM และท่าบินที่นักบินรายงาน; Δn เป็นขอบบน (แฟลปกางทันทีและถือ α เดิม) จริงแฟลปไฟฟ้าใช้หลายวินาทีและ dCm0 −0.06 กดหัวลง (ดู 08.10)' }, ['LH17', 'LH0', 'LD13'], 'ต่ำ', true, 'ค่าประมาณ: balloon จาก lh_attitude.mjs');
for (const id of ['da40_180', 'da40d']) flaps(id, { VFE: vfe(id), balloon_dn_g: { 'UPtoTO_90kt_upper_bound': bl(id, 'UP', 'T/O', 90) }, notes: 'แฟลปไฟฟ้า 3 ตำแหน่ง ต่อซ้ายขวาด้วยกลไก [LD8]; VFE ต่ำกว่า NG (108/91 เทียบ 110/98 KIAS)' }, ['LD1', 'LD6', 'LD8', 'LH0'], 'ต่ำ', true, 'ค่าประมาณ: balloon จาก lh_attitude.mjs ที่ 90 KIAS (ขอบบน)');
flaps('da42ng', { VFE: vfe('da42ng'), balloon_dn_g: { 'UPtoAPP_110kt_upper_bound': bl('da42ng', 'UP', 'APP', 110) } }, ['LT1', 'LH0'], 'ต่ำ', true, 'VFE ผ่านบัตร 06; ค่าประมาณ: balloon จาก lh_attitude.mjs (ขอบบน)');
flaps('da42_tae125', { VFE: vfe('da42_tae125'), balloon_dn_g: { 'UPtoAPP_110kt_upper_bound': bl('da42_tae125', 'UP', 'APP', 110) } }, ['LT3', 'LH0'], 'ต่ำ', true, 'VFE ผ่านบัตร 06; ค่าประมาณ: balloon จาก lh_attitude.mjs (ขอบบน)');
flaps('t6a', { VFE: vfe('t6a'), final_kias: { UP: 110, TO: 105, LDG: 100 }, notes: 'แฟลปเพิ่ม roll-off ตอน stall' }, ['LH15', 'LH16', 'LP19'], 'สูง', false, '');
flaps('t6c', { VFE: vfe('t6c'), notes: 'เหมือน T-6A: แฟลปเพิ่ม roll-off ตอน stall' }, ['LP5', 'LP29', 'LH15'], 'กลาง', false, 'VFE ผ่านบัตร 07');
for (const id of ['pc9m', 'pc7mk2']) flaps(id, { VFE: vfe(id), balloon_dn_g: { 'UPtoTO_140kt_upper_bound': bl(id, 'UP', 'TO', 140) }, approach_alpha_drop_deg: dAlpha(id), notes: 'แฟลป split/plain ใต้ปีก (ค่าประมาณ: เทคนิคคลาส T-6: ลดความเร็วก่อนกางแล้ว trim หัวลงเล็กน้อย)' },
  ['LP2', 'LP27', 'LH15', 'LH0'], 'ต่ำ', true, `ค่าประมาณ: VFE ${JSON.stringify(vfe(id))} kt CAS จาก TCDS ผ่านบัตร 07; balloon และ Δα (downwind แฟลป UP เทียบ final แฟลป LDG) จาก lh_attitude.mjs`);
flaps('p2006t', { VFE: vfe('p2006t'), balloon_dn_g: { 'UPtoTO_100kt_upper_bound': bl('p2006t', 'UP', 'T/O', 100), 'TOtoFULL_85kt_upper_bound': bl('p2006t', 'T/O', 'FULL', 85) }, best_climb_flaps: 'UP', notes: 'AFM: ไต่ดีที่สุดที่แฟลป UP เสมอ (S4-25); แฟลป T/O บน downwind ต่ำกว่า 119 KIAS, FULL บน final ต่ำกว่า 93 KIAS (S4-27); AFM ไม่บรรยายผลต่อ pitch/trim' },
  ['LG1', 'LG2', 'LG3', 'LH0'], 'ต่ำ', true, 'ค่าประมาณ: balloon จาก lh_attitude.mjs กับบัตร 12 (ขอบบน: แฟลปกางทันทีและถือ α เดิม)');

const txt = (id, k, s_, src, conf, note = '') => add(id, k, L(s_, '-', src, conf, false, note));
for (const id of ['c172s', 'c172r', 'c152']) {
  txt(id, 'trim_technique', 'attitude → power → trim; trim ใหม่ทุกครั้งที่เปลี่ยนแฟลป; go-around ดันคันต้านหัวเชิดก่อนแล้ว trim หยาบ; ล้อ trim มือ (172S NAV III มี electric trim)', ['LH1', 'LC2'], 'กลาง');
  txt(id, 'crosswind_technique', 'crab ใน pattern → wing-low ก่อน roundout; แฟลปน้อยที่สุดตามความยาวรันเวย์; ล้อด้านลมก่อน; aileron เข้าลมตลอดการวิ่ง', ['LH1', 'LH12', 'LH13'], 'สูง');
  txt(id, 'stick_feel', 'พวงมาลัย สลิง reversible แรงเพิ่มตาม q; แฟลปเต็มและ CG หน้าทำให้แรงดึงตอน flare สูง; ไม่มีตัวเลขแรงในแหล่งเปิด (เป้าตัวเลขค่าประมาณอยู่ใน ops.stick_force)', ['LH1', 'LC2'], 'ต่ำ');
}
for (const id of ['da40ng', 'da40_180', 'da40d', 'da42ng', 'da42_tae125']) {
  txt(id, 'trim_technique', 'ล้อ trim มือ (tab ผ่าน Bowden cable) + electric trim ใน NG/NXi; FADEC คันเดียว (NG, D, TDI) เปลี่ยนกำลังแล้ว trim เปลี่ยนน้อยกว่าเครื่องคาร์บู; รุ่น IO-360 ใช้คันเร่ง ใบพัด และ mixture แยก', ['LD6', 'LD7', 'LH1'], 'ต่ำ');
  txt(id, 'crosswind_technique', `crab → wing-low ตาม AFH; ค่าสาธิต ${val(card(id), 'speeds.crosswind_demonstrated_kt')} kt; ไม่มี nose-wheel steering (castering) จึงคุมทิศด้วย rudder และเบรกแยกข้างที่ความเร็วต่ำ`, ['LH1', 'LH17', 'LD6'], 'กลาง');
  txt(id, 'stick_feel', 'stick ระบบ push-rod ตอบสนองตรง ไม่มีตัวเลขแรงในแหล่งเปิด (เป้าตัวเลขค่าประมาณอยู่ใน ops.stick_force)', ['LD7'], 'ต่ำ');
}
for (const id of ['t6a', 't6c', 'pc9m', 'pc7mk2']) {
  const t6 = id.startsWith('t6');
  txt(id, 'trim_technique', t6 ? 'trim ไฟฟ้า ลำดับ rudder → elevator → aileron; Trim Aid Device trim rudder ตามกำลัง/ความเร็ว (WOW off > 80 KIAS)' : 'ไม่มี Trim Aid Device: เหยียบ rudder ขวาเองเมื่อเพิ่มกำลัง (ค่าประมาณ: เทคนิคคลาส)', t6 ? ['LH14', 'LP21'] : ['LP21'], t6 ? 'กลาง' : 'ต่ำ');
  txt(id, 'crosswind_technique', 'crab ใน pattern, final ใช้ rudder จัดหัว aileron คุมเส้นกลาง wing-low จนแตะล้อด้านลม; ไม่เบรกเหนือ 80 KIAS; touch-and-go คง aileron เข้าลม', ['LH15'], id === 't6a' ? 'สูง' : 'ต่ำ');
  txt(id, 'stick_feel', 'stick, กำลังสูงที่ความเร็วต่ำทำให้ yaw/roll ซ้ายมาก; ห้าม rudder เต็มเหนือ 150 KIAS (T-6) (เป้าตัวเลขค่าประมาณอยู่ใน ops.stick_force)', ['LH16', 'LP19'], 'ต่ำ');
}
txt('p2006t', 'trim_technique', 'ล้อ trim มือของ stabilator (anti-servo tab; electric trim เป็นอุปกรณ์เลือกติด) และ rudder trim ไฟฟ้าที่คันบังคับ; ตั้ง trim pitch และ rudder กลางก่อนวิ่งขึ้น; เพิ่มกำลัง: ใบพัดก่อนแล้ว MAP, ลดกำลัง: MAP ก่อนแล้วใบพัด; trim rudder ใหม่เมื่อเปลี่ยนกำลังสองเครื่องไม่เท่ากัน', ['LG3', 'LG9', 'LH1'], 'กลาง');
txt('p2006t', 'crosswind_technique', 'crab → wing-low ตาม AFH (AFM บท 4 ไม่บรรยาย); ค่าสาธิต 17 kt; ปีกสูง ใบพัดสองข้างไม่หมุนสวนกัน', ['LH1', 'LG5'], 'กลาง');
txt('p2006t', 'stick_feel', 'คันบังคับแบบพวงมาลัย (yoke) สลิงและ push-rod ไม่มี booster; stabilator ทั้งชิ้นพร้อม anti-servo tab (โมเดล hinge ของรอบที่ 1 ใช้ไม่ได้ เป้าตัวเลขอยู่ใน ops.stick_force เป็นแถบกลาง)', ['LG9', 'LG1'], 'ต่ำ');

// numeric stick-force targets (gap 18): lh_stick.mjs, round-1 §6 hinge model with the card leaves, bounded by 23.143/23.155
for (const [id, r] of Object.entries(ST)) {
  if (!T[id]) continue;
  const t = r.target, m = r.train;
  add(id, 'stick_force', L({
    controller: r.controller, fs_per_g_N: t.fs_per_g_N, fs_per_g_lbf: t.fs_per_g_lbf, grad_N_per_kt: t.grad_N_per_kt, flare_pull_N: t.flare_pull_N,
    model_fs_per_g_N: m ? { approach: m.approach.Fs_per_g_N, cruise: m.cruise.Fs_per_g_N } : null,
    bounds: { band_lbf_per_g: [r.band_lbf_per_g.min, r.band_lbf_per_g.max], cfr23_155_force_lbf: r.cfr23_155.force_lbf, cfr23_143_temporary_lbf: r.cfr23_143.temporary_pitch_lbf, cfr23_143_one_hand_lbf: r.cfr23_143.one_hand_lbf, cfr23_143_prolonged_lbf: r.cfr23_143.prolonged_lbf },
  }, 'N/g, lbf/g, N/kt, N, lbf', ['LH0', 'R1:C12', 'R1:C16', 'R1:C20', 'LH30', 'LM3'], 'ต่ำ', true,
    `ค่าประมาณ (lh_stick.mjs): ${m ? `แบบจำลอง elevator reversible ของรอบที่ 1 §6 กับ controls.pitch.* ของบัตร${r.fallback_from ? ` (ขาด ${r.fallback_from.keys.join(', ')} ใช้ของ ${r.fallback_from.id})` : ''} ที่มวลฝึก ${m.mass_kg} kg ได้ Fs/g ${m.approach.Fs_per_g_N} N (approach ${m.approach.cas_kt} KCAS) / ${m.cruise.Fs_per_g_N} N (cruise ${m.cruise.cas_kt} KCAS); ${t.basis === 'hinge model inside the bounds' ? 'อยู่ในขอบเขต ใช้เป็นเป้า' : `อยู่นอกขอบเขต จึงตั้งเป้าที่ขอบ (${t.fs_per_g_lbf.cruise} lbf/g) และคูณความชันกับแรง flare ด้วยอัตราส่วนเดียวกัน ${t.scale_vs_model.cruise}`}` : `${r.no_hinge}: ใช้กลางแถบ`}; ขอบเขต: แถบ MIL-F-8785C Level 1 + 14 CFR 23.155 ของบัตร (หรือคำนวณ) และแรงชั่วคราว 23.143 หารด้วย (nL − 1) = ${r.nL - 1} g; flare_pull = แรงดึงจาก trim ที่ VAPP ถึง 1.05 VS0 (ไม่รวม ground effect); ซิมวันนี้ไม่มีโมเดลแรงที่คัน`));
}

const num1 = (id, k, v, u, src, conf, est, note) => add(id, k, L(v, u, src, conf, est, note));
const CARDED = ['c172s', 'c172r', 'c152', 'da40ng', 'da40_180', 'da40d', 'da42ng', 'da42_tae125', 't6a', 't6c', 'pc9m', 'pc7mk2', 'p2006t'];
for (const id of CARDED) {
  const tp = id.startsWith('t6') || id.startsWith('pc'), td = A[id].touchdown;
  num1(id, 'approach_pitch_deg', A[id].final.pitch_deg, 'deg', ['LH0'], 'ต่ำ', true, `ค่าประมาณ: θ = α + γ ที่ final (${A[id].final.ias_kt} kt, path 3°, มวลฝึก) จาก lh_attitude.mjs`);
  num1(id, 'touchdown_pitch_deg', td.pitch_deg, 'deg', ['LH0', 'LH1'], 'ต่ำ', true, `ค่าประมาณ: 1.05 VS0 ที่มวลฝึก จม 120 fpm ใน ground effect (นอก ground effect ${td.pitch_oge_deg}°)${id.startsWith('t6') ? '; คู่มือ T-6: สูงกว่า takeoff attitude 7–10° เล็กน้อย [LH15]' : ''}`);
  num1(id, 'flare_height_m', tp ? 2.3 : 4.6, 'm', tp ? ['LH15'] : ['LH1'], 'กลาง', false, tp ? 'ลดกำลังที่ 5–10 ft แล้ว flare ใน ground effect (กลาง 7.5 ft = 2.3 m) [LH15 Fig 6-10]' : 'roundout เริ่ม 10–20 ft (กลาง 15 ft = 4.6 m) [LH1 p.9-8]');
}
for (const id of ['pa28_161', 'be76', 'p2002jf', 'p68c', 't206h', 'ct4']) num1(id, 'flare_height_m', 4.6, 'm', ['LH1'], 'กลาง', false, 'roundout เริ่ม 10–20 ft (กลาง 15 ft = 4.6 m) [LH1 p.9-8]');
for (const id of Object.keys(T)) {
  const vl = vappLeaf(id), retract = ['da42ng', 'da42_tae125', 't6a', 't6c', 'pc9m', 'pc7mk2', 'be76', 'p2006t', 'p68c'].includes(id);
  add(id, 'stabilised_criteria', L({ gate_ft: [500, 300], speed: vl ? { Vapp: vl.v, unit: vl.u, lo: -5, hi_ppl: 10, hi_cpl: 5 } : 'Vapp −5/+10', vs_min_fpm: -1000, bank_max_deg: 15, config: `แฟลป ${landDet(id) ?? 'ลงจอด'}${retract ? ' + ล้อลง' : ''}`, path_dots: 1 }, 'ft, kt, fpm, deg', ['LH1', 'LH2', 'LH3'], 'กลาง', false,
    'เกณฑ์ร่วม common_light.evaluator ใช้ Vapp ของบัตร (D1); 500/300 ft = 152/91 m, 1,000 fpm = 5.1 m/s'));
}

// ---------------- common_light ----------------
const S = 'sim', E = 'environment';
const TESTS = (() => { try { return JSON.parse(fs.readFileSync(path.join(HERE, 'out', 'lh_tests.json'), 'utf8')); } catch { return { total: 0, pass: 0 }; } })();
const common = {
  ops: {
    rules_of_thumb: L({ fpm_per_deg_pitch: '1.77 × KTAS (≈ 2 × KIAS ตาม SOP)', vs_on_3deg_fpm: '5.31 × GS kt', example: { '65kt': 345, '84kt': 446, '100kt': 531 } }, 'fpm', ['LH0', 'LH10'], 'สูง', false, 'ฟิสิกส์ (T-LH-04, 05)', S),
    gust_additive: L('½ gust factor', 'kt', ['LH1'], 'สูง', false, 'AFH p.9-20', S),
    roundout_start_ft: L([10, 20], 'ft', ['LH1'], 'สูง', false, 'AFH p.9-8 เครื่องเล็กลูกสูบ; เทอร์โบพร็อปฝึก 5–10 ft [LH15]', S),
    hard_landing_ref: L({ drop_6in_fpm: 340, load_g: [3, 4] }, 'fpm, g', ['LH1'], 'สูง', false, 'AFH p.9-35', S),
    control_force_limits: L({ temporary_lbf: { pitch_stick: 60, pitch_wheel2: 75, pitch_wheel1: 50, roll_stick: 30, roll_wheel2: 50, roll_wheel1: 25, yaw: 150 }, prolonged_lbf: { pitch: 10, roll: 5, yaw: 20 } }, 'lbf', ['LH30'], 'สูง', false, '14 CFR 23.143(c) ก่อน Amdt 23-64', S),
    certification_xwind: L('≥ 0.2 VS0 ที่ 90°', 'kt', ['LH1'], 'สูง', false, 'AFH p.9-19', S),
    accident_stats: L({ instr_landing_2001_2010: 830, share_of_landing: 0.22, solo_student: 457, dual: 373, directional_control_share: 0.5, solo_hard_or_stall: 228, fatal_training_2000_2015: { accidents: 240, fatalities: 432, loci: 129, loci_share: 0.54, stall_spin_of_loci: 0.81, pattern_share_of_loci: 0.42, takeoff_ga_share_of_loci: 0.29 }, landing_accidents_per_year: { '2004_08': 95, '2009_12': 70, '2013': 58, '2014': 52 } }, 'count, -', ['LH5', 'LH6', 'LH7'], 'กลาง', false, 'สหรัฐฯ (NTSB ผ่าน AOPA); takeoff_ga_share_of_loci = ขึ้นบิน/ไต่และ go-around รวมกัน (อยู่ในกลุ่ม pattern 42 %); solo student 2001–2010: แตะก่อนรันเวย์ 2, overrun 8', E),
    accident_stats_thailand: L({
      public_final_reports_online: false,
      caat_asr_2025: { ato_top_categories_2021_2025: ['MAC', 'SCF-NP', 'WILD', 'BIRD', 'ATM'], ato_high_risk_2025: ['hard landing', 'birdstrike with damage'], ato_medium_risk_2025: ['tailstrike', 'taxi clearance deviation', 'parking brake → loss of directional control', 'bird ingestion'], solo_hard_landings_after_first_solo_guidance: 'ลดลงชัดเจนในปี 2025', ga_accidents_2025: { bounced_landing_prop_strike: 1, runway_excursion_overturn: 1, ultralight_fatal: 1 }, top_accident_categories_all_ops_2016_2025: { RE: 13, 'SCF-PP': 12, ARC: 11, 'LOC-I': 7, TURB: 5 } },
      caat_asr_2022: { ato_reports_change_vs_2021: 0.59, ato_accidents_2022: 2, ato_accident_kind: 'runway excursion และ abnormal runway contact จาก unstabilised approach', ato_high_risk_example: 'bounced landing → runway excursion' },
      aaic_cases: [{ date: '2022-04-30', type: 'Tecnam P2010', phase: 'landing (solo)', sequence: 'สูงกว่า glide path ข้าม threshold ราว 100 ft (30 m) แทน 50 ft → เด้งสองครั้ง → ล้อหน้าพับ → ไถลออกซ้าย', injuries: 0, detectors: ['high_on_path', 'bounce', 'porpoise', 'nose_first', 'dir_control'] },
        { date: '2016-02-24', type: 'Diamond DA40 D', phase: 'approach (training)', sequence: 'กำลังเครื่องลดและไม่ตอบสนองคันเร่ง → ลงฉุกเฉินนอกสนามก่อนถึงทางวิ่ง 3 NM (5.6 km)', injuries: 0, aaic_report: '06/2016', detectors: [] }],
    }, 'count, -', ['LH34', 'LH35', 'LH36', 'LH37', 'LH38'], 'กลาง', false, 'ไทย: ไม่พบคลังรายงานฉบับสมบูรณ์ของคณะกรรมการสอบสวนอุบัติเหตุอากาศยาน (AAIC) ที่เปิดอ่านได้ทางเว็บ [LH38]; รายงานความปลอดภัยประจำปีของ กพท. ให้ภาพรวม ATO (หน่วยฝึกที่ได้รับอนุมัติ) และ GA [LH34][LH35]; สองกรณีฝึกบินที่ AAIC สอบสวนเสร็จแล้ว มาจากฐานข้อมูล ASN ที่อ้างรายงาน AAIC [LH36][LH37] (ทุติยภูมิ); ไม่มีจำนวนชั่วโมงบินฝึกจึงคิดอัตราต่อชั่วโมงไม่ได้', E),
    test_standards: L({ faa_private: { app_kt: [-5, 10], td_beyond_ft: 400, short_td_ft: 200, alt_ft: 100, pattern_kt: 10, hdg_deg: 10, vy_kt: [-5, 10] }, faa_commercial: { app_kt: [-5, 5], td_beyond_ft: 200, short_td_ft: 100, alt_ft: 100, pattern_kt: 10, vy_kt: [-5, 5] }, afh_stabilised: { app_kt: [-5, 10], bank_max_deg: 15 }, caat_lapl: { app_kt: [-5, 15], other_kt: 15, alt_ft: 150 }, caat_cpl: { app_kt: [-5, 5], other_kt: 10, alt_ft: 100, hdg_deg: 10 }, easa_ppl: { app_kt: [-5, 15], other_kt: 15, alt_ft: 150, hdg_deg: 10 } }, 'kt, ft, deg', ['LH1', 'LH2', 'LH3', 'LH31', 'LH32', 'LH33'], 'สูง', false, 'ACS-6C/7B (Nov 2023); AFH p.9-6; กพท. LAPL ยก AMC1 FCL.125 (p.6-1), CPL ยก TCAR PEL Part FCL Appendix 4 (p.6-2); EASA PPL ตาม AMC1 FCL.215/FCL.235', S),
  },
  evaluator: {
    levels: L({ ppl: { spd_hi: TH.spd_hi_ppl, spd_lo: TH.spd_lo, long_ft: TH.long_ppl_ft }, cpl: { spd_hi: TH.spd_hi_cpl, spd_lo: TH.spd_lo, long_ft: TH.long_cpl_ft } }, 'kt, ft', ['LH2', 'LH3', 'LH32'], 'สูง', false, 'ppl = FAA Private (กพท. LAPL/EASA PPL หลวมกว่า +15)', S),
    gates: L({ gate_hi_ft: TH.gate_hi_ft, gate_lo_ft: TH.gate_lo_ft, ifr_gate_ft: 1000, speed: 'Vapp −5/+10 (cpl ±5)', vs_min_fpm: -TH.sink_max_fpm, bank_max_deg: TH.bank_final_deg, path_dots: TH.dots, config: 'แฟลปลงจอด + ล้อลง' }, 'ft, kt, fpm, deg, dots', ['LH1', 'LH2', 'R1:V19'], 'กลาง', false, 'แทน gate 500/200 ft ของวันนี้', S),
    thresholds: L(TH, 'ft, kt, fpm, deg, s, m', ['LH0', 'LH1', 'LH2', 'LH3', 'LH13', 'LH15', 'LH30', 'R1:V19'], 'ต่ำ', true, 'ค่าประมาณบางตัว (ดูคอมเมนต์ใน lh_eval.mjs ว่าตัวไหนมาจากแหล่ง ตัวไหนตั้งเอง)', S),
    rules: L(Object.fromEntries(Object.entries(RULES).map(([k, r]) => [k, { phase: r.phase, sev: r.sev, pts: r.pts, src: r.src, th: r.th }])), '-', ['LH0', 'LH1', 'LH2', 'LH5', 'LH6'], 'กลาง', true, 'ระดับและคะแนนหักเป็นค่าประมาณของหัวข้อนี้; ข้อความไทยเขียนใหม่ทั้งหมด', S),
    scoring: L({ touchdown: { sink: 40, pos: 25, cl: 15, spd: 10, att: 10 }, pos_full_m: ['aim − 30', 'aim + 122 (ppl) / + 61 (cpl)'], pos_partial_m: { '18': 'aim + 250', '10': 'aim + 400' }, spd: 'ias ที่ 50 ft ใน Vapp −5/+10 (cpl ±5) และแตะ ≤ Vapp − 5', deduction_by_sev: { minor: [2, 4], major: [5, 10], critical: [20, 30] }, caps: { short: 20, excursion: 15, sink_gt_600: 35, any_critical: 40 }, pass: '≥ 60 และไม่มี critical', grades: { 'ดีเยี่ยม': 90, 'ดี': 75, 'ผ่าน': 60 } }, '-', ['LH0', 'LH2', 'LH3', 'R1:V19'], 'กลาง', true, 'ค่าประมาณ: โครง 100 คะแนนเดิม + หัก + เพดาน', S),
    signals_needed: L(['nz', 'carbHeat', 'mixture', 'deTrim', 'phase', 'stallWarn', 'xw', 'latV', 'Recorder: phi, theta, beta, wow'], '-', ['LH0', 'R1:V19'], 'กลาง', false, 'วันนี้ air.load คือแรงตั้งฉากที่ล้อแต่ละล้อ [N] (0 เมื่ออยู่ในอากาศ) ยังไม่มี nz; Recorder ยังไม่เก็บ phi/theta/beta/wow', S),
    tests: L({ script: 'scripts/lh_tests.mjs', cases: TESTS.total, pass: TESTS.pass, ids: `T-LH-01…T-LH-${String(TESTS.total).padStart(2, '0')}` }, '-', ['LH0'], 'สูง', false, `ผลล่าสุด ${TESTS.pass}/${TESTS.total} ผ่าน (การตรวจความครบถ้วน 19 พ.ย. 2026); ทุกกรณีมีส่วนเผื่อชัดเจนและผลของซิมวันนี้ใน out/lh_tests.json`, S),
  },
};

// ---------------- write markdown ----------------
const blocks = [];
blocks.push('```json\n' + JSON.stringify({ common_light: common }, null, 1) + '\n```');
for (const id of Object.keys(T)) blocks.push('```json\n' + JSON.stringify({ [id]: T[id] }, null, 1) + '\n```');
fs.mkdirSync(path.join(HERE, 'out'), { recursive: true });
fs.writeFileSync(path.join(HERE, 'out', 'lh_json_blocks.md'), blocks.join('\n\n') + '\n');
console.log('types', Object.keys(T).length, 'blocks', blocks.length, 'chars', blocks.join('').length);
