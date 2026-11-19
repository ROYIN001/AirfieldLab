#!/usr/bin/env node
// Round 2 / topic 13 (LN): short TCDS-level data cards of the minor types Thai schools, clubs and (generic) military users fly:
// pa28_161, be76, p2002jf, p68c, t206h, ct4 (decision D5 of 19 Nov 2026). Writes the JSON blocks of ../13-other-trainers.md
// between the markers LN_JSON_BEGIN / LN_JSON_END (never edit them by hand) and out/ln_cards.json (derived numbers that the
// text and scripts/ln_tests.mjs quote).
//   node scripts/ln_json.mjs            write blocks + out/ln_cards.json
//   node scripts/ln_json.mjs --check    exit 1 when the blocks in ../13-other-trainers.md differ from the generated ones
// Node >= 18, no dependencies. Data paths are relative to this file (scripts/), so it runs unchanged from
// docs/research/02-light-aircraft/scripts/ in the repo.
//
// Every number below is a fact read from the source named in its leaf (code LNn of the reference table §13.9, or a code of
// another topic such as LS1, LG11, LM4, LM25). est:true marks our own computations (method in the note, conf กลาง or ต่ำ).
// Methods used here (all labelled ค่าประมาณ in the notes):
//   CLmax_target   lm_polar.clmaxFromStall(MTOW, S, VS, kind 'min', nz 0.95): 1-g CLmax from a 1 kt/s minimum speed (01-methods §01.5)
//   VREF (no POH)  1.3 VS0 at training mass [LM25 AFH p9-3]: 1.3 · VS0(MTOW) · √(m_train/MTOW)
//   VAPP (no POH)  VREF + 5 kt (lm_card DEFAULTS.VappMinusVref, 01-methods §01.1)
//   aero.ref.c     S/b (mean geometric chord) when the TCDS gives no MAC
//   fuel mass      AVGAS/MOGAS 0.72 kg/L (6 lb/US gal [LM4])
import fs from 'node:fs';
import { clmaxFromStall } from './lm_polar.mjs';

const HERE = new URL('.', import.meta.url);
const MD = new URL('../13-other-trainers.md', HERE);
const LB = 0.45359237, FT = 0.3048, IN = 0.0254, KT = 0.514444, HP = 745.69987, GAL = 3.785411784, FUEL = 0.72;
const r = (x, n = 1) => Math.round(x * 10 ** n) / 10 ** n;
const SCOPE = { gear: 'gear', piston: 'engine', propeller: 'propeller' };
// leaf: [v, u, src, conf, est, note]; scope from the first path segment (D4)
const L = (v, u, src, conf, est, note) => ({ v, u, src, conf, est, note });

// ───────────────────────── per-type data ─────────────────────────
// Training mass (D3): empty_kg = BEW_typical, crew 160 kg (instructor 85 + student 75, as 12-p2006t), fuel as stated.
function tm(bew, fuelL, note) {
  const fuel = r(fuelL * FUEL, 1), crew = 160, kg = r(bew + crew + fuel, 1);
  return L({ kg, empty_kg: bew, crew_kg: crew, fuel_kg: fuel, fuel_l: fuelL }, 'kg', ['LN0', 'LM4'], 'ต่ำ', true,
    `ค่าประมาณ: empty_kg = BEW_typical ${bew} kg + ครู 85 + ศิษย์ 75 kg + เชื้อเพลิง ${fuelL} L × 0.72 kg/L = ${kg} kg; ${note}`);
}

const T = {};

// ── Piper PA-28-161 (Warrior II/III); PA-28-151 counted under this id (02 thai_fleet variants) ──
T.pa28_161 = {
  mtow: 2440 * LB, vs0: 44, vs1: 50, vsUnit: 'kt IAS', fullDet: '40', cleanDet: '0', bew: r(1539 * LB, 0), fuelL: 100,
  poh: { vref: [63, 'kt IAS', ['LN2'], 'สูง', 'D1: final approach speed แฟลป 40° 63 KIAS (POH VB-1180 p4-2, น้ำหนักสูงสุด 2,440 lb) ซึ่ง checklist ของโรงเรียนใช้เป็นความเร็ว power-off/short field ด้วย (65 KIAS ใน LN4); เอกสารให้ความเร็วเดียวไม่แยกตามมวล จึงใช้ค่าเดียวกันที่ training_mass ตามแนวบัตร c172s/c152'],
         vapp: [70, 'kt IAS', ['LN4', 'LN2'], 'กลาง', 'D1 (บัตรเป็นเจ้าของ; 08 ops.final และ 09 Vapp อ้างค่านี้): Landing Final Approach, Normal 70 KIAS แฟลป 40 (checklist ของโรงเรียน LN4 ปี 2025 อิง POH) = 36.0 m/s; short/soft field 65 KIAS; ใช้ค่าเดียวกันที่ training_mass'] },
  leaves: {
    'airframe.identity': L({ manufacturer: 'Piper Aircraft (สหรัฐฯ)', model: 'PA-28-161', variant: 'Warrior II/III (บัตรนี้ใช้ POH VB-1180 ของ Warrior II; ลำในไทย s/n 2842026 [LS1] ไม่ได้ตรวจว่า POH ฉบับใดใช้กับลำนี้); PA-28-151 (O-320-E3D 150 hp) ของชมรมเดียวกันนับใต้ id นี้', engine: 'Lycoming O-320-D3G (หรือ -D2A) 160 hp (119 kW) ที่ 2,700 rpm คาร์บูเรเตอร์', propeller: 'Sensenich 74DM6-0-60 (หรือ -0-58) fixed pitch 2 ใบ Ø 72–74 in (1.83–1.88 m)', seats: 4, category: 'normal (utility ที่ 2,020 lb)', tc_ref: 'FAA TCDS 2A13 Rev 48 (7 Aug 2006) item XVI-A, TC ของ PA-28-161 2 Nov 1976' }, '-', ['LN1', 'LN2', 'LS1'], 'สูง', false, 'ผู้ใช้ในไทย: ชมรมการบิน 1 ลำ (+ PA-28-151 1 ลำ) ไม่มีใน ATO (ทะเบียน 9 ก.ค. 2026)'),
    'airframe.weights.MTOW': L(r(2440 * LB, 1), 'kg', ['LN2', 'LN1'], 'สูง', false, '2,440 lb normal category (POH p1-4, p2-3); utility 2,020 lb; TCDS 2A13 Rev 48 item XVI-A ให้ 2,325 lb (เครื่องรุ่นแรก) ดู §13.8'),
    'airframe.weights.MLW': L(r(2440 * LB, 1), 'kg', ['LN2'], 'สูง', false, '2,440 lb เท่ากับ MTOW (POH p1-4)'),
    'airframe.weights.MRW': L(r(2447 * LB, 1), 'kg', ['LN2'], 'สูง', false, 'ramp 2,447 lb (POH p1-4)'),
    'airframe.weights.BEW_typical': L(r(1539 * LB, 0), 'kg', ['LN3'], 'กลาง', false, 'empty weight 1,539 lb ตามหน้า AOPA ของ Warrior III (ค่าแทน น้ำหนักจริงอยู่ใน weighing record ของแต่ละลำ)'),
    'airframe.weights.max_fuel_usable': L(r(48 * GAL * FUEL, 1), 'kg', ['LN2', 'LM4'], 'สูง', false, 'ใช้ได้ 48 US gal (181.7 L) จาก 50 US gal (POH p1-3, p2-6) × 0.72 kg/L'),
    'airframe.weights.useful_load': L(r(2440 * LB - 1539 * LB, 0), 'kg', ['LN3'], 'กลาง', false, '901 lb (AOPA) = MTOW − BEW_typical'),
    'airframe.weights.training_mass': tm(r(1539 * LB, 0), 100, 'เชื้อเพลิง 100 L ≈ 26 US gal; สองคน + เชื้อเพลิงเต็ม 48 gal ได้ ≈ 989 kg ยังต่ำกว่า MTOW'),
    'airframe.cg.datum': L('78.4 in (1.991 m) หน้าขอบหน้าปีก', '-', ['LN2'], 'สูง', false, 'POH p2-4; ระยะ m DAT บวกไปทางท้าย'),
    'airframe.cg.envelope': L([[r(1950 * LB, 1), r(83.0 * IN, 4), r(93.0 * IN, 4)], [r(2440 * LB, 1), r(88.3 * IN, 4), r(93.0 * IN, 4)]], 'kg, m DAT', ['LN2', 'LN1'], 'กลาง', false, 'หน้า 83.0 in ที่ ≤ 1,950 lb ถึง 88.3 in ที่ 2,440 lb (เส้นตรง) หลัง 93.0 in ทุกน้ำหนัก (POH p2-4 ข้อความสกัดอ่านไม่ชัด ตรวจกับต้นฉบับ); TCDS Rev 48: 87.0 in ที่ 2,325 lb'),
    'airframe.geometry.span': L(r(35 * FT, 2), 'm', ['LN2', 'LN3'], 'สูง', false, '35 ft (POH p1-2)'),
    'airframe.geometry.length': L(r(24 * FT, 2), 'm', ['LN3'], 'กลาง', false, '24 ft (AOPA ปัดเป็นฟุต)'),
    'airframe.geometry.height': L(r((7 + 4 / 12) * FT, 2), 'm', ['LN3'], 'กลาง', false, '7 ft 4 in'),
    'airframe.wing.S': L(r(170 * FT * FT, 2), 'm2', ['LN3'], 'กลาง', false, '170 ft² (AOPA); ตรงกับภาระปีก 14.4 lb/ft² × 170 = 2,448 lb ของ POH p1-4'),
    'airframe.wing.b': L(r(35 * FT, 2), 'm', ['LN2'], 'สูง', false, '35 ft'),
    'airframe.wing.AR': L(r((35 * FT) ** 2 / (170 * FT * FT), 2), '-', ['LN0'], 'กลาง', true, 'ค่าประมาณ: b²/S จากสองค่าข้างบน'),
  },
  detents: [['0', 0, null], ['10', 10, 103], ['25', 25, 103], ['40', 40, 103]],
  detNote: 'แฟลปคันโยกสี่ตำแหน่ง 0/10/25/40° (มุมสุด 40° ±2° ตาม TCDS; 25° ใช้วิ่งขึ้น short/soft field ตาม LN4; 10° ตามที่หัวข้อ 09 ใช้จาก POH/checklist LO21/LO22) ชื่อ detent = มุมแฟลปตาม POH; VFE 103 KIAS (100 KCAS) ทุกตำแหน่ง (POH p2-1)',
  detSrc: ['LN1', 'LN2', 'LN4'],
  speeds: {
    VS0_kt: [44, 'kt IAS', ['LN3'], 'กลาง', 'แฟลป 40° ที่ 2,440 lb (AOPA อิง POH) = 22.6 m/s; ไม่มีตาราง IAS→CAS ในแหล่งที่เปิดได้ จึงถือ IAS ≈ CAS'],
    VS1_kt: [50, 'kt IAS', ['LN3'], 'กลาง', 'แฟลป 0 ที่ 2,440 lb = 25.7 m/s'],
    VX_kt: [63, 'kt IAS', ['LN2', 'LN4'], 'สูง', 'POH p4-2 (32.4 m/s)'],
    VY_kt: [79, 'kt IAS', ['LN2', 'LN4'], 'สูง', 'POH p4-2 (40.6 m/s)'],
    VR_kt: [52, 'kt IAS', ['LN4'], 'กลาง', 'short field rotate 52 KIAS แฟลป 25; normal rotation 45–55 KIAS (checklist LN4)'],
    VG_kt: [73, 'kt IAS', ['LN2'], 'สูง', 'best glide (POH p3-3, p3-11) 37.6 m/s; อัตราร่อนไม่มีในแหล่งที่เปิดได้'],
    VA_kt: [111, 'kt IAS', ['LN2', 'LN1'], 'สูง', 'ที่ 2,440 lb (POH p2-2); 88 KIAS ที่ 1,531 lb'],
    VNO_kt: [126, 'kt IAS', ['LN2', 'LN1'], 'สูง', '122 KCAS (POH p2-1)'],
    VNE_kt: [160, 'kt IAS', ['LN2', 'LN1'], 'สูง', '153 KCAS = 78.7 m/s (POH p2-1)'],
    crosswind_demonstrated_kt: [17, 'kt', ['LN2', 'LN4'], 'สูง', 'maximum demonstrated crosswind 17 kt (POH p2-8, p4-2) = 8.7 m/s ไม่ใช่ขีดจำกัด'],
  },
  perf: {
    ROC_SL_fpm: [692, 'fpm', ['LN3'], 'กลาง', 'SL MTOW ตาม AOPA (3.5 m/s); POH Section 5 ไม่อยู่ในสำเนาที่เปิดได้'],
    service_ceiling_ft: [11000, 'ft', ['LN3'], 'กลาง', '3,353 m (AOPA)'],
    takeoff: [{ ground_roll_m: r(1150 * FT, 0), over50ft_m: r(1620 * FT, 0) }, 'm', ['LN3'], 'กลาง', '1,150 / 1,620 ft (AOPA; สันนิษฐานว่า MTOW SL ISA ลมสงบ ผิวแห้ง แฟลป 0 แหล่งไม่บอกเงื่อนไข)'],
    landing: [{ ground_roll_m: r(625 * FT, 0), over50ft_m: r(1160 * FT, 0) }, 'm', ['LN3'], 'กลาง', '625 / 1,160 ft (AOPA; เงื่อนไขเหมือนข้างบน)'],
  },
  engine: { model: 'Lycoming O-320-D3G (หรือ -D2A)', kind: 'carb', displacement_L: r(320 * 0.0163871, 2), cylinders: 4, tcds: 'FAA 2A13 item XVI-A', P: 160, rpm: 2700, src: ['LN1', 'LN2'], note: 'ความจุจากชื่อรุ่น 320 in³; 160 hp ที่ 2,700 rpm ทุกการใช้งาน (TCDS)' },
  prop: { kind: 'fixed', model: 'Sensenich 74DM6-0-60 (หรือ 74DM6-0-58)', n: 2, D: r(74 * IN, 3), Dnote: 'Ø สูงสุด 74 in (1.880 m) ต่ำสุด 72 in (1.829 m) ไม่มี tolerance เพิ่ม (TCDS)', sense: 1, senseEst: true, src: ['LN1', 'LN2'], staticRpm: [2330, 2430], staticNote: '74DM6-0-60: รอบสถิต 2,330–2,430 rpm SL ISA (TCDS); -0-58: 2,365–2,465' },
  gear: { layout: 'tricycle_fixed', src: ['LN1', 'LN2'], steering: { mode: 'pedal_linked', pedal_max: 30 } },
  controls: {
    elevator: [{ travel_deg: { up: 14, down: 2 } }, 'คันบังคับเป็น stabilator (เคลื่อนทั้งชิ้น) ขึ้น 14° ลง 2° (±1°) ตาม TCDS; มุม stabilator ไม่เทียบเท่ามุม elevator ของซิม (ประสิทธิผลต่อองศาสูงกว่า)'],
    aileron: [{ travel_deg: { up: 25, down: 12.5 } }, 'ขึ้น 25° ลง 12.5° (±2°)'],
    rudder: [{ travel_deg: { left: 27, right: 27 } }, '27° ซ้าย/ขวา (±2°)'],
    flap: [{ travel_deg: { up: 0, down: 40 } }, 'ลง 40° (±2°)'],
    trim_tab: [{ travel_deg: { up: 3, down: 12 } }, 'stabilator tab ขึ้น 3° ลง 12° (±1°)'],
    src: ['LN1'],
  },
  twin: false,
};

// ── Beechcraft 76 Duchess ──
T.be76 = {
  mtow: 3900 * LB, vs0: 60, vs1: 70, vsUnit: 'kt IAS', fullDet: '35', cleanDet: '0', bew: r(2460 * LB, 0), fuelL: 200,
  poh: { vref: [76, 'kt IAS', ['LN5'], 'ต่ำ', 'D1: short final / short-field approach 76 KIAS แฟลป 35 (flashcard ของผู้ใช้ LN5 และ LO24 ของหัวข้อ 09 ตติยภูมิ ยังไม่ได้ตรวจกับ POH) = 1.27 VS0; ความเร็วเดียวไม่แยกตามมวล ใช้ค่าเดียวกันที่ training_mass'],
         vapp: [80, 'kt IAS', ['LN5'], 'ต่ำ', 'D1 (บัตรเป็นเจ้าของ; 08 ops.final และ 09 Vapp อ้างค่านี้): final 80 KIAS แฟลป 35 ล้อลง (flashcard LN5/LH20) = 41.2 m/s; ความเชื่อมั่นต่ำจนกว่าจะได้ POH'] },
  leaves: {
    'airframe.identity': L({ manufacturer: 'Beech Aircraft (ปัจจุบัน Textron Aviation)', model: '76 Duchess', variant: 'Model 76 (ผลิต 1978–1982); ลำในไทย s/n ME-331 [LS1]; T-tail ล้อพับ', engine: '2 × Lycoming 180 hp (134 kW) ที่ 2,700 rpm: O-360-A1G6D (ซ้าย) และ LO-360-A1G6D (ขวา หมุนกลับ) คาร์บูเรเตอร์', propeller: '2 × Hartzell HC-M2YR-2C(L)EUF/F(J)C7666A 2 ใบ constant speed feather ได้ หมุนสวนกัน', seats: 4, category: 'normal', tc_ref: 'FAA TCDS A29CE (ไม่ได้เปิดอ่านฉบับเต็มในรอบนี้; ตัวเลขจาก flashcard ของ POH นิตยสาร และ Jane\'s)' }, '-', ['LN7', 'LN8', 'LN6', 'LS1'], 'กลาง', false, 'ผู้ใช้ในไทย: ATO 1 แห่ง 1 ลำ (ฝึก multi-engine) ทะเบียน 9 ก.ค. 2026'),
    'airframe.weights.MTOW': L(r(3900 * LB, 1), 'kg', ['LN6', 'LN8', 'LN9'], 'กลาง', false, '3,900 lb (สามแหล่งตรงกัน)'),
    'airframe.weights.MLW': L(r(3900 * LB, 1), 'kg', ['LN6'], 'ต่ำ', false, '3,900 lb (flashcard บท 2 ของ POH)'),
    'airframe.weights.MRW': L(r(3916 * LB, 1), 'kg', ['LN6'], 'ต่ำ', false, 'ramp 3,916 lb'),
    'airframe.weights.MZFW': L(r(3500 * LB, 1), 'kg', ['LN6'], 'ต่ำ', false, 'zero fuel 3,500 lb'),
    'airframe.weights.BEW_typical': L(r(2460 * LB, 0), 'kg', ['LN8', 'LN9'], 'กลาง', false, 'empty 2,460 lb (Jane\'s 1980–81 ผ่าน LN8; LN9 ตรงกัน)'),
    'airframe.weights.max_fuel_usable': L(r(100 * GAL * FUEL, 0), 'kg', ['LN8', 'LM4'], 'ต่ำ', true, 'ค่าประมาณ: LN8 ให้ความจุ 100 US gal (378.5 L) ไม่บอกส่วนที่ใช้ได้ จึงถือว่าใช้ได้ทั้งหมด × 0.72 kg/L (ขอบบน)'),
    'airframe.weights.useful_load': L(r((3900 - 2460) * LB, 0), 'kg', ['LN8', 'LN6'], 'กลาง', false, 'MTOW − BEW = 1,440 lb (flashcard ให้ max useful load 1,470 lb)'),
    'airframe.weights.training_mass': tm(r(2460 * LB, 0), 200, 'เชื้อเพลิง 200 L ≈ 53 US gal'),
    'airframe.geometry.span': L(r(38 * FT, 2), 'm', ['LN8'], 'กลาง', false, '38 ft 0 in (Jane\'s)'),
    'airframe.geometry.length': L(r(29.04 * FT, 2), 'm', ['LN8'], 'กลาง', false, '29 ft 0.5 in'),
    'airframe.geometry.height': L(r(9.5 * FT, 2), 'm', ['LN8'], 'กลาง', false, '9 ft 6 in (T-tail)'),
    'airframe.wing.S': L(r(181 * FT * FT, 2), 'm2', ['LN8'], 'กลาง', false, '181 ft²'),
    'airframe.wing.b': L(r(38 * FT, 2), 'm', ['LN8'], 'กลาง', false, '38 ft'),
    'airframe.wing.AR': L(r((38 * FT) ** 2 / (181 * FT * FT), 2), '-', ['LN0'], 'กลาง', true, 'ค่าประมาณ: b²/S'),
    'airframe.wing.airfoil': L('NACA 63₂A415', '-', ['LN8'], 'กลาง', false, 'ตาม Jane\'s 1980–81'),
  },
  detents: [['0', 0, null], ['10', 10, 120], ['20', 20, 120], ['35', 35, 110]],
  detNote: 'ตำแหน่งแฟลป 0/10/20/35° ตาม flashcard ของผู้ใช้ (LN5; หัวข้อ 08/09 ใช้ 10 บน downwind, 20 บน base, 35 บน final จาก LH20/LO24) ชื่อ detent = มุม; VFE 120 KIAS สำหรับแฟลปไม่เกิน 20° (จึงครอบคลุมตำแหน่ง 10°) และ 110 KIAS แฟลปเต็ม 35° (LN5, LN6)',
  detSrc: ['LN5', 'LN6'],
  speeds: {
    VS0_kt: [60, 'kt IAS', ['LN5', 'LN7', 'LN8'], 'กลาง', 'แฟลปเต็ม idle MTOW (30.9 m/s) สามแหล่งตรงกัน; ไม่มีตาราง IAS→CAS จึงถือ IAS ≈ CAS'],
    VS1_kt: [70, 'kt IAS', ['LN5', 'LN6'], 'ต่ำ', 'แฟลป 0 (ขอบล่าง green arc 70 KIAS) = 36.0 m/s'],
    VX_kt: [71, 'kt IAS', ['LN5'], 'ต่ำ', '36.5 m/s'],
    VY_kt: [85, 'kt IAS', ['LN5'], 'ต่ำ', '43.7 m/s'],
    VR_kt: [71, 'kt IAS', ['LN5'], 'ต่ำ', 'rotation = lift-off 71 KIAS'],
    VG_kt: [95, 'kt IAS', ['LN5'], 'ต่ำ', 'best glide ที่ MTOW (82 KIAS ที่ 3,000 lb)'],
    VA_kt: [132, 'kt IAS', ['LN5', 'LN6'], 'ต่ำ', 'ที่ 3,900 lb; 116 KIAS ที่ 3,000 lb'],
    VNO_kt: [154, 'kt IAS', ['LN5', 'LN6'], 'ต่ำ', '79.2 m/s'],
    VNE_kt: [194, 'kt IAS', ['LN6', 'LN7'], 'กลาง', '99.8 m/s; LN8 พิมพ์ 171 kn ซึ่งตรงกับ max speed ของ LN7 (ขัดกัน ดู §13.8)'],
    VLE_kt: [140, 'kt IAS', ['LN5', 'LN6'], 'ต่ำ', 'gear extended'],
    VLO_kt: [140, 'kt IAS', ['LN5', 'LN6'], 'ต่ำ', 'กางล้อ 140; เก็บล้อ (VLO retract) 112 KIAS'],
    VMCA_kt: [65, 'kt IAS', ['LN5', 'LN6'], 'ต่ำ', 'red radial 65 KIAS (33.4 m/s)'],
    VYSE_kt: [85, 'kt IAS', ['LN5', 'LN6'], 'ต่ำ', 'blue line 85 KIAS'],
    VXSE_kt: [85, 'kt IAS', ['LN5'], 'ต่ำ', 'ตาม flashcard (เท่ากับ VYSE)'],
    VSSE_kt: [71, 'kt IAS', ['LN5'], 'ต่ำ', 'intentional one-engine-inoperative speed'],
    crosswind_demonstrated_kt: [25, 'kt', ['LN5'], 'ต่ำ', 'flashcard "Xwind 25" = 12.9 m/s ยังไม่ได้ตรวจกับ POH'],
  },
  perf: {
    ROC_SL_fpm: [1248, 'fpm', ['LN7', 'LN8'], 'กลาง', 'สองเครื่องยนต์ SL MTOW (6.34 m/s)'],
    service_ceiling_ft: [19650, 'ft', ['LN7', 'LN8'], 'กลาง', '5,989 m สองเครื่องยนต์'],
    oei: [{ ROC_fpm: 235, ceiling_ft: 6170 }, 'fpm, ft', ['LN7'], 'กลาง', 'เครื่องดับหนึ่งข้าง MTOW: ไต่ 235 fpm (1.19 m/s), เพดาน 6,170 ft (1,881 m)'],
    takeoff: [{ ground_roll_m: null, over50ft_m: r(2119 * FT, 0) }, 'm', ['LN9'], 'ต่ำ', 'ถึง 50 ft 2,119 ft (Plane & Pilot ไม่บอกเงื่อนไขและหน่วย สันนิษฐานว่า ft ที่ MTOW SL); ระยะวิ่งไม่มีแหล่งที่เชื่อได้'],
    landing: [{ ground_roll_m: null, over50ft_m: r(1881 * FT, 0) }, 'm', ['LN9'], 'ต่ำ', 'จาก 50 ft 1,881 ft (Plane & Pilot เงื่อนไขเหมือนข้างบน)'],
    cruise_table: [[{ ktas: 158, h_ft: 10000, note: 'Jane\'s' }, { ktas: 166, h_ft: 6000, note: 'max cruise' }], 'kt TAS, ft', ['LN8', 'LN7'], 'กลาง', '158 KTAS ที่ 10,000 ft (81.3 m/s); max cruise 166 KTAS ที่ 6,000 ft'],
  },
  engine: { model: 'Lycoming O-360-A1G6D (ซ้าย) / LO-360-A1G6D (ขวา)', kind: 'carb', displacement_L: r(360 * 0.0163871, 2), cylinders: 4, tcds: 'FAA E-286 (O-360 series; ไม่ได้เปิด)', P: 180, rpm: 2700, src: ['LN7', 'LN8', 'LN6'], note: 'ความจุจากชื่อรุ่น 360 in³; 180 hp ต่อเครื่อง; MAP green arc 15–29.6 inHg และรอบสูงสุด 2,700 rpm (LN6)' },
  prop: { kind: 'constant_speed_feathering', model: 'Hartzell HC-M2YR-2C(L)EUF/F(J)C7666A', n: 2, D: r(76 * IN, 3), Dnote: 'ค่าประมาณ: Ø 76 in จากรหัสใบ 7666A (ตัวเลขสองหลักแรกของรหัสใบ Hartzell = Ø นิ้วก่อนตัด) ยังไม่ได้ตรวจกับ TCDS', Dest: true, sense: { left: 1, right: -1 }, senseEst: false, src: ['LN8', 'LN7'] },
  gear: { layout: 'tricycle_retract', src: ['LN5', 'LN6'], retract: { time_s: null, VLO_extend_kt: 140, VLO_retract_kt: 112, VLE_kt: 140 } },
  controls: null,
  twin: true,
};

// ── Tecnam P2002-JF ──
T.p2002jf = {
  mtow: 620, vs0: 38, vs1: 41, vsUnit: 'kt CAS', fullDet: 'LDG', cleanDet: 'UP', bew: 370, fuelL: 60,
  poh: null,   // no public AFM → 1.3 VS0 (est)
  clNote: 'ข้อควรระวัง: CLmax แฟลป UP 1.84 สูงเกินช่วงปกติของปีกไม่มีแฟลป (≈ 1.3–1.7) แสดงว่า 41 kt ของสเปกน่าจะเป็น KIAS หรือมวลต่ำกว่า 620 kg (§13.8 ข้อ 4; T-LN-06)',
  leaves: {
    'airframe.identity': L({ manufacturer: 'Costruzioni Aeronautiche Tecnam (อิตาลี)', model: 'P2002-JF', variant: 'P2002-JF มาตรฐาน MTOW 620 kg (MOD2002/87); ลำในไทย s/n 335 [LS1]; P2002JF MkII (660 kg ตามสเปกปี 2020) และ P2002 Sierra (US-LSA) เป็นคนละแบบย่อย', engine: 'BRP-Rotax 912 S2 (912 S3 ด้วย MOD2002/127) 73.5 kW (98.6 hp) ที่ 5,800 rpm 5 นาที, 69.0 kW ต่อเนื่องที่ 5,500 rpm, เกียร์ทด 2.43', propeller: 'Hoffmann HO17GHM A 174 177C fixed pitch 2 ใบไม้ Ø 1.74 m (มาตรฐาน); Hoffmann HOV352F1/C170FQ+8 variable pitch Ø 1.78 m ด้วย MOD2002/127', seats: 2, category: 'normal (CS-VLA)', tc_ref: 'EASA TCDS EASA.A.006 Issue 13 (24 Nov 2022) Section A; TC 27 May 2004' }, '-', ['LN10', 'LN11', 'LG11', 'LS1'], 'สูง', false, 'ผู้ใช้ในไทย: ATO 1 แห่ง 1 ลำ (ซื้อ 2 ลำปี 2018 [LS13])'),
    'airframe.weights.MTOW': L(620, 'kg', ['LN10', 'LN11'], 'สูง', false, '1,367 lb กับ MOD2002/87 หรือ SB0105-CS; ฐาน 580 kg, MOD2002/29 600 kg (TCDS A.III.13) ทะเบียนไทยไม่บอกว่าลำนี้รุ่นไหน'),
    'airframe.weights.MLW': L(620, 'kg', ['LN10'], 'สูง', false, 'เท่ากับ MTOW'),
    'airframe.weights.MZFW': L(620, 'kg', ['LN10'], 'สูง', false, 'zero fuel mass เท่ากับ MTOW'),
    'airframe.weights.BEW_typical': L(370, 'kg', ['LN11'], 'กลาง', false, 'standard empty weight 815 lb (สเปกผู้ผลิต); MkII 410 kg'),
    'airframe.weights.max_fuel_usable': L(r(99 * FUEL, 1), 'kg', ['LN10', 'LM4'], 'สูง', false, 'ใช้ได้ 99 L จาก 100 L (TCDS A.III.9.1) × 0.72 kg/L (MOGAS/AVGAS)'),
    'airframe.weights.useful_load': L(250, 'kg', ['LN11'], 'กลาง', false, 'maximum useful load 511 lb (สเปก)'),
    'airframe.weights.training_mass': tm(370, 60, 'เชื้อเพลิง 60 L; สองคน + เชื้อเพลิงเต็ม 99 L ได้ ≈ 601 kg ยังต่ำกว่า MTOW'),
    'airframe.cg.datum': L('หน้าแปลนรองใบพัด (propeller support flange) ไม่รวม spacer', '-', ['LN10'], 'สูง', false, 'TCDS A.III.14; ระยะ m DAT บวกไปทางท้าย'),
    'airframe.cg.envelope': L([[400, 1.693, 1.782], [620, 1.693, 1.782]], 'kg, m DAT', ['LN10'], 'สูง', false, 'หน้า 1.693 m หลัง 1.782 m หลัง datum (TCDS A.III.15 ไม่แยกตามมวล ไม่ให้ %MAC); มวลล่าง 400 kg ใส่เพื่อปิดรูปเท่านั้น'),
    'airframe.geometry.span': L(8.6, 'm', ['LN10', 'LN11'], 'สูง', false, '28.2 ft (TCDS A.III.4)'),
    'airframe.geometry.length': L(6.63, 'm', ['LN11'], 'กลาง', false, '21.7 ft (สเปก; MkII 6.80 m)'),
    'airframe.geometry.height': L(2.4, 'm', ['LN11'], 'กลาง', false, '7.9 ft'),
    'airframe.wing.S': L(11.5, 'm2', ['LN10', 'LN11'], 'สูง', false, '123.8 ft²'),
    'airframe.wing.b': L(8.6, 'm', ['LN10'], 'สูง', false, '28.2 ft'),
    'airframe.wing.AR': L(6.4, '-', ['LN11'], 'สูง', false, 'สเปกผู้ผลิต (b²/S = 6.43)'),
    'airframe.wing.dihedral_deg': L(5, 'deg', ['LN11'], 'สูง', false, 'สเปกผู้ผลิต'),
  },
  detents: [['UP', 0, null], ['TO', 15, 97], ['LDG', 38, 67]],
  detNote: 'AFM ของ JF ไม่เปิดสาธารณะ: TCDS ให้ VFE ของตำแหน่ง take-off 97 KIAS (95 KCAS) และ landing 67 KIAS (69 KCAS) จึงตั้งชื่อ UP/TO/LDG แบบเดียวกับ DA40; มุม 15° และ 38° เป็นค่าประมาณจาก AFM ของรุ่นใกล้เคียง P2002 Sierra (LN13 p17) VFE ของ MOD2002/29 หรือ SB010-CS สูงขึ้น 1–2 kt',
  detSrc: ['LN10', 'LN13'], detEst: true,
  speeds: {
    VS0_kt: [38, 'kt CAS', ['LN11'], 'กลาง', 'แฟลปลง ที่ 620 kg (19.5 m/s); สเปกไม่บอก IAS/CAS สเปก MkII บอก KCAS จึงถือเป็น CAS; MkII 42.5 KCAS ที่ 660 kg'],
    VS1_kt: [41, 'kt CAS', ['LN11'], 'ต่ำ', 'แฟลปขึ้น ที่ 620 kg (21.1 m/s); หน่วยเหมือนข้างบน; CLmax ที่ได้ (1.84) สูงเกินปีกไม่มีแฟลป ดู §13.8 ข้อ 4'],
    VX_kt: [60, 'kt IAS', ['LN13'], 'ต่ำ', 'ค่าประมาณ: ใช้ VX ของรุ่นใกล้เคียง P2002 Sierra (LN13 p27, 57 KCAS) เพราะ AFM ของ JF ไม่สาธารณะ', true],
    VY_kt: [68, 'kt IAS', ['LN13'], 'ต่ำ', 'ค่าประมาณ: ใช้ VY ของ P2002 Sierra (LN13 p27, 64 KCAS = 35.0 m/s)', true],
    VR_kt: [43, 'kt IAS', ['LN13'], 'ต่ำ', 'ค่าประมาณ: rotation ของ P2002 Sierra แฟลป T/O (LN13 p47)', true],
    VG_kt: [68, 'kt IAS', ['LN13'], 'ต่ำ', 'ค่าประมาณ: best glide ของ P2002 Sierra (LN13 p53)', true],
    VA_kt: [96, 'kt IAS', ['LN10'], 'สูง', '94 KCAS (ฐาน; MOD2002/29 98/96, SB010-CS 100/97)'],
    VNO_kt: [110, 'kt IAS', ['LN10'], 'สูง', '106 KCAS (ฐาน)'],
    VNE_kt: [138, 'kt IAS', ['LN10'], 'สูง', '135 KCAS = 69.4 m/s (ฐาน; สเปก LN11 ให้ 142 kt ซึ่งตรงกับรุ่นแก้ไขของ TCDS)'],
    crosswind_demonstrated_kt: [22, 'kt', ['LN13'], 'ต่ำ', 'ค่าประมาณ: ค่าของ P2002 Sierra (LN13 p32) ไม่ใช่ของ JF', true],
  },
  perf: {
    ROC_SL_fpm: [800, 'fpm', ['LN11'], 'กลาง', 'SL ที่ 620 kg (4.06 m/s)'],
    service_ceiling_ft: [15000, 'ft', ['LN11'], 'กลาง', '4,572 m'],
    takeoff: [{ ground_roll_m: 262, over50ft_m: 434 }, 'm', ['LN11'], 'กลาง', '860 / 1,424 ft ที่ 620 kg SL (สเปกไม่บอกผิวและแฟลป)'],
    landing: [{ ground_roll_m: 170, over50ft_m: 333 }, 'm', ['LN11'], 'กลาง', '558 / 1,092 ft'],
    glide: [{ speed_kt: 68, ratio: 12.8 }, 'kt IAS, -', ['LN13'], 'ต่ำ', 'ค่าประมาณ: ของ P2002 Sierra (LN13 p55: 2 NM ต่อ 1,000 ft) ไม่ใช่ของ JF', true],
    cruise_table: [[{ ktas: 118, h_ft: 6500, power_pct: 75 }], 'kt TAS, ft', ['LN11'], 'กลาง', '118 KTAS (60.7 m/s) ที่ 75 % 6,500 ft'],
  },
  engine: { model: 'BRP-Rotax 912 S2', kind: 'carb', displacement_L: 1.352, cylinders: 4, tcds: 'EASA E.121 (Rotax 912 series)', P: 73.5 * 1000 / HP, Pw: 73500, rpm: 5800, mcpW: 69000, rpmMcp: 5500, tlim: 300, src: ['LN10', 'LG11'], note: '73.5 kW ที่ 5,800 rpm นานสุด 5 นาที, 69.0 kW ต่อเนื่องที่ 5,500 rpm (รอบจาก TCDS A.III.5, กำลังจาก datasheet Rotax LG11 ของหัวข้อ 12)' },
  prop: { kind: 'fixed', model: 'Hoffmann HO17GHM A 174 177C', n: 2, D: 1.74, Dnote: 'Ø 1,740 mm (TCDS A.III.7)', sense: 1, senseEst: true, senseNote: 'ค่าประมาณ: Rotax 912 เกียร์ทดแบบเดียวกับ P2006T ซึ่ง TCDS A.185 ระบุว่าใบพัดหมุนตามเข็มนาฬิกา (มองจากที่นั่งนักบิน) [LG1]', src: ['LN10'], gearRatio: 2.43 },
  gear: { layout: 'tricycle_fixed', src: ['LN11'] },
  controls: null,
  twin: false,
};

// ── Partenavia P.68C ──
T.p68c = {
  mtow: 1990, vs0: r(57 * Math.sqrt(1990 / (4630 * LB)), 1), vs0Est: true, vs1: null, vsUnit: 'kt CAS', fullDet: '35', cleanDet: '0', bew: 1420, fuelL: 300,
  poh: null,
  leaves: {
    'airframe.identity': L({ manufacturer: 'Partenavia (อิตาลี; TC ปัจจุบัน Vulcanair)', model: 'P.68C', variant: 'P.68C (TC 23 Jul 1979); ลำในไทย s/n 391 [LS1] จึงใช้ MLW 1,980 kg (s/n ≥ 381) และถังเชื้อเพลิง 538 L (s/n ≥ 210); ปีกสูง ล้อตายตัว', engine: '2 × Lycoming IO-360-A1B6 200 hp (149 kW) ที่ 2,700 rpm ฉีดเชื้อเพลิง', propeller: '2 × Hartzell HC-C2YK-2C( )F/FC7666A-4 2 ใบ Ø 1.829 m (72 in) constant speed (governor Woodward) หมุนตามเข็มนาฬิกาทั้งสองข้าง', seats: 7, category: 'normal (FAR 23)', tc_ref: 'EASA TCDS EASA.A.385 Issue 10 (1 Aug 2023) Section D' }, '-', ['LN14', 'LN15', 'LS1'], 'สูง', false, 'ผู้ใช้ในไทย: ATO 1 แห่ง 1 ลำ ทะเบียน 9 ก.ค. 2026'),
    'airframe.weights.MTOW': L(1990, 'kg', ['LN14', 'LN15'], 'สูง', false, '4,387 lb (TCDS D.III.13); 2,084 kg ด้วย Kit 68/051 (SB 79)'),
    'airframe.weights.MLW': L(1980, 'kg', ['LN14'], 'สูง', false, '4,365 lb สำหรับ s/n ≥ 381 (1,890 kg ถึง s/n 380)'),
    'airframe.weights.BEW_typical': L(1420, 'kg', ['LN16', 'LN17'], 'ต่ำ', false, 'empty 3,130 lb ของ Vulcanair P68C รุ่นใหม่ (AOPA และโบรชัวร์ผ่าน Wikipedia) เครื่องปี 1980 อาจเบากว่า'),
    'airframe.weights.max_fuel_usable': L(r(520 * FUEL, 1), 'kg', ['LN14', 'LM4'], 'สูง', false, '538 L (142 US gal) ลบ unusable 2 × 9 L = 520 L (TCDS D.III.9.1, s/n ≥ 210) × 0.72 kg/L'),
    'airframe.weights.training_mass': tm(1420, 300, 'เชื้อเพลิง 300 L'),
    'airframe.cg.datum': L('ระนาบสัมผัสขอบหน้าปีก', '-', ['LN14'], 'สูง', false, 'TCDS D.III.14'),
    'airframe.cg.envelope': L([[1680, 0.23, 0.526], [1990, 0.3, 0.526]], 'kg, m DAT', ['LN14'], 'สูง', false, 'หน้า 0.230 m (14.84 % MAC) ที่ ≤ 1,680 kg ถึง 0.300 m (19.36 %) ที่ 1,990 kg เส้นตรง; หลัง 0.526 m (34 %) ทุกน้ำหนัก'),
    'airframe.cg.MAC': L(r(0.226 / (0.34 - 0.1936), 3), 'm', ['LN14', 'LN0'], 'กลาง', true, 'ค่าประมาณ: คำนวณจากคู่ระยะ/%MAC ของ TCDS: (0.526 − 0.300)/(0.34 − 0.1936); LEMAC ≈ 0.000 m'),
    'airframe.geometry.span': L(12.0, 'm', ['LN14'], 'สูง', false, '39.37 ft (TCDS D.III.4)'),
    'airframe.geometry.length': L(9.55, 'm', ['LN14'], 'สูง', false, 'TCDS D.III.4'),
    'airframe.geometry.height': L(3.4, 'm', ['LN14'], 'สูง', false, 'TCDS D.III.4'),
    'airframe.wing.S': L(r(200.23 * FT * FT, 2), 'm2', ['LN16'], 'กลาง', false, '200.23 ft² (AOPA)'),
    'airframe.wing.b': L(12.0, 'm', ['LN14'], 'สูง', false, 'TCDS'),
    'airframe.wing.AR': L(r(144 / (200.23 * FT * FT), 2), '-', ['LN0'], 'กลาง', true, 'ค่าประมาณ: b²/S'),
  },
  detents: [['0', 0, null], ['17', 17, 152], ['30', 30, 138], ['35', 35, 99]],
  detNote: 'TCDS ให้ VFE เป็นช่วงมุม 0–17° 152 KCAS, 17–30° 138 KCAS, 30–35° 99 KCAS (D.III.10) และแฟลปสุด 35° ±2° (D.III.16) ชื่อ detent = มุมขอบบนของแต่ละช่วงตามที่หัวข้อ 09 ใช้ (AFM ไม่สาธารณะ ไม่ยืนยันว่าคันโยกมีตำแหน่ง 30°)',
  detSrc: ['LN14'],
  speeds: {
    VS0_kt: [null, 'kt CAS', ['LN16', 'LN0'], 'ต่ำ', 'ค่าประมาณ: 57 KCAS แฟลปลง ของ Vulcanair P68C ที่ 4,630 lb (2,100 kg, AOPA) × √(1,990/2,100) = 55.5 KCAS (28.5 m/s) ที่ MTOW ของบัตร', true],
    VA_kt: [126, 'kt CAS', ['LN14'], 'สูง', 'TCDS D.III.10'],
    VNO_kt: [153, 'kt CAS', ['LN14'], 'สูง', '78.7 m/s'],
    VNE_kt: [193, 'kt CAS', ['LN14'], 'สูง', '99.3 m/s'],
    VMCA_kt: [60, 'kt CAS', ['LN14'], 'สูง', 'VMC ของ TCDS D.III.10 (30.9 m/s)'],
  },
  perf: {
    ROC_SL_fpm: [1100, 'fpm', ['LN16', 'LN17'], 'ต่ำ', 'ของ Vulcanair P68C รุ่นใหม่ (5.6 m/s) ไม่ใช่ P.68C ปี 1980 ที่ 1,990 kg'],
    service_ceiling_ft: [18000, 'ft', ['LN16', 'LN17'], 'ต่ำ', '5,486 m (Vulcanair)'],
    takeoff: [{ ground_roll_m: r(787 * FT, 0), over50ft_m: r(1312 * FT, 0) }, 'm', ['LN16'], 'ต่ำ', '787 / 1,312 ft (AOPA, Vulcanair P68C เงื่อนไขไม่ระบุ)'],
    landing: [{ ground_roll_m: r(656 * FT, 0), over50ft_m: r(1969 * FT, 0) }, 'm', ['LN16'], 'ต่ำ', '656 / 1,969 ft (AOPA; ระยะจาก 50 ft ยาวผิดสังเกตเทียบกับระยะวิ่ง ดู §13.8)'],
    cruise_table: [[{ ktas: 160, h_ft: 10000, note: 'economy' }], 'kt TAS, ft', ['LN17', 'LN16'], 'ต่ำ', '160 KTAS (82.3 m/s) economy cruise 10,000 ft (Vulcanair)'],
  },
  engine: { model: 'Lycoming IO-360-A1B6', kind: 'fuel_injected', displacement_L: r(360 * 0.0163871, 2), cylinders: 4, tcds: 'FAA 1E10 (ตาม TAR LN15)', P: 200, rpm: 2700, src: ['LN14', 'LN15'], note: 'ความจุจากชื่อรุ่น 360 in³; 200 hp ที่ 2,700 rpm (TCDS D.III.5)' },
  prop: { kind: 'constant_speed_feathering', model: 'Hartzell HC-C2YK-2C( )F/FC7666A-4', n: 2, D: 1.829, Dnote: 'Ø 1.829 m (72 in) ห้ามตัดสั้น (TCDS D.III.7); มุมใบที่สถานี 0.762 m 14.2°–81.2° (มุม 81.2° คือ feather; AOPA ระบุ full feathering)', sense: { left: 1, right: 1 }, senseEst: false, src: ['LN14', 'LN16'] },
  gear: { layout: 'tricycle_fixed', src: ['LN14'] },
  controls: {
    elevator: [{ travel_deg: { up: 16, down: 6 } }, 'คันบังคับเป็น stabilator: TCDS D.III.16 ระบุมุมที่ขอบหน้า (leading edge) ขึ้น 6° ลง 16° (±2°) เท่ากับขอบท้ายขึ้น 16° ลง 6° ตามแบบ elevator ของซิม (ขอบท้ายขึ้น = เงยหัว); อ่านจากข้อความสกัดที่แยกคอลัมน์ป้ายกับตัวเลข จึงตรวจกับ PDF อีกครั้งก่อนใช้; มุม stabilator ไม่เทียบเท่ามุม elevator ของซิม', 'กลาง'],
    aileron: [{ travel_deg: { up: 30, down: 17 } }, 'ขึ้น 30° ลง 17° (±2°)', 'กลาง'],
    rudder: [{ travel_deg: { left: 25, right: 25 } }, '25° ซ้าย/ขวา (±2°); rudder tab 30°', 'กลาง'],
    flap: [{ travel_deg: { up: 0, down: 35 } }, 'ลง 35° (±2°)', 'สูง'],
    trim_tab: [{ travel_deg: { up: 0, down: 15, down_min: 1 } }, 'stabilator tab ลง 1° (±1°) ถึง 15° (±1°)', 'กลาง'],
    src: ['LN14'],
  },
  twin: true,
};

// ── Cessna T206H Turbo Stationair ──
T.t206h = {
  mtow: 3600 * LB, vs0: 54, vs1: 62, vsUnit: 'kt CAS', fullDet: 'FULL', cleanDet: 'UP', bew: r(2314 * LB, 0), fuelL: 200,
  poh: { vref: [67, 'kt IAS', ['LN20', 'LN18'], 'กลาง', 'D1: short field approach แฟลป FULL 67 KIAS (POH Section 4 ตาม LN20 §20.9; Section 5 ใช้ 64) ที่ MLW 3,600 lb; Cessna ให้ใช้ความเร็วบท 4 กับทุกน้ำหนักที่ต่ำกว่า จึงใช้ค่าเดียวกันที่ training_mass (แนวเดียวกับบัตร c172s); = 1.24 VS0 (54 KCAS)'],
         vapp: [75, 'kt IAS', ['LN20', 'LN18'], 'กลาง', 'D1 (บัตรเป็นเจ้าของ; 08 ops.final และ 09 Vapp อ้างค่านี้): normal approach แฟลป FULL 70–80 KIAS (LN20 §20.7 อิง POH) ใช้กลางช่วง 75 KIAS = 38.6 m/s; แฟลป UP 80–90 KIAS'] },
  leaves: {
    'airframe.identity': L({ manufacturer: 'Cessna Aircraft (ปัจจุบัน Textron Aviation)', model: 'T206H Turbo Stationair', variant: 'T206H (ผลิตตั้งแต่ปี 1998); ลำในไทย s/n T20608372 [LS1]; POH/IM ฉบับ NAV III ที่ใช้เป็นฉบับอ้างอิง ไม่ใช่ POH ที่อนุมัติของลำนี้', engine: 'Lycoming TIO-540-AJ1A turbocharged ฉีดเชื้อเพลิง 310 hp (231 kW) ที่ 2,500 rpm, 39 inHg', propeller: 'McCauley B3D36C432/80VSA-1 3 ใบ constant speed Ø 77.5–79.0 in (1.97–2.01 m)', seats: 6, category: 'normal (utility ตาม POH)', tc_ref: 'EASA TCDS EASA.IM.A.053 Issue 10 (17 Jan 2025) Section 2 (T206H); FAA TCDS A4CE ไม่ได้เปิด' }, '-', ['LN23', 'LN18', 'LN19', 'LS1'], 'สูง', false, 'ผู้ใช้ในไทย: ATO 1 แห่ง 1 ลำ ไม่ใช่เครื่องฝึกพื้นฐาน (02.5.2)'),
    'airframe.weights.MTOW': L(r(3600 * LB, 1), 'kg', ['LN23', 'LN18'], 'สูง', false, '3,600 lb (TCDS IM.A.053 p17; POH p iii, p2-8); STC เพิ่มน้ำหนักเป็น 3,789 lb มีบาง ลำ (LN20) MLW คงเดิม'),
    'airframe.weights.MLW': L(r(3600 * LB, 1), 'kg', ['LN23', 'LN18'], 'สูง', false, '3,600 lb (TCDS p17)'),
    'airframe.weights.MRW': L(r(3617 * LB, 1), 'kg', ['LN23', 'LN18'], 'สูง', false, 'ramp 3,617 lb (TCDS p17)'),
    'airframe.weights.BEW_typical': L(r(2314 * LB, 0), 'kg', ['LN18'], 'สูง', false, 'standard empty 2,314 lb (POH p1-8); AOPA ปี 2000 ให้ 2,274 lb'),
    'airframe.weights.max_fuel_usable': L(r(87 * GAL * FUEL, 1), 'kg', ['LN23', 'LN18', 'LM4'], 'สูง', false, 'ใช้ได้ 87.0 US gal (329.3 L) จาก 92.0 สำหรับ s/n T20608362 ขึ้นไป ซึ่งรวมลำในไทย (TCDS p16; ก่อนหน้านั้น 88 US gal; POH p1-6, p2-15) × 0.72 kg/L'),
    'airframe.weights.useful_load': L(r(1303 * LB, 0), 'kg', ['LN18'], 'สูง', false, 'max useful load 1,303 lb (POH p1-8)'),
    'airframe.weights.training_mass': tm(r(2314 * LB, 0), 200, 'เชื้อเพลิง 200 L ≈ 53 US gal'),
    'airframe.cg.datum': L('ผิวหน้าของ firewall (FS 0.0)', '-', ['LN23', 'LN18'], 'สูง', false, 'TCDS p17; POH p2-8 ระบุผิวหน้าของ firewall ส่วนล่าง'),
    'airframe.cg.envelope': L([[r(2500 * LB, 1), r(33.0 * IN, 4), r(49.7 * IN, 4)], [r(3600 * LB, 1), r(42.5 * IN, 4), r(49.7 * IN, 4)]], 'kg, m DAT', ['LN23', 'LN18'], 'สูง', false, 'หน้า 33.0 in ที่ ≤ 2,500 lb ถึง 42.5 in ที่ 3,600 lb เส้นตรง; หลัง 49.7 in ทุกน้ำหนัก (TCDS p17 และ POH p2-8 ตรงกัน)'),
    'airframe.geometry.span': L(r(36 * FT, 2), 'm', ['LN19'], 'กลาง', false, '36 ft (AOPA Pilot 2000)'),
    'airframe.geometry.length': L(r((28 + 3 / 12) * FT, 2), 'm', ['LN19'], 'กลาง', false, '28 ft 3 in'),
    'airframe.geometry.height': L(r((9 + 3 / 12) * FT, 2), 'm', ['LN19'], 'กลาง', false, '9 ft 3 in'),
    'airframe.wing.S': L(r(174 * FT * FT, 2), 'm2', ['LN18', 'LN19'], 'สูง', false, '174.0 ft² (POH Fig 1-1)'),
    'airframe.wing.b': L(r(36 * FT, 2), 'm', ['LN19'], 'กลาง', false, '36 ft'),
    'airframe.wing.AR': L(r((36 * FT) ** 2 / (174 * FT * FT), 2), '-', ['LN0'], 'กลาง', true, 'ค่าประมาณ: b²/S'),
  },
  detents: [['UP', 0, null], ['10', 10, 140], ['20', 20, 120], ['FULL', 40, 100]],
  detNote: 'ตำแหน่ง UP / 10° / 20° / FULL (40°, ไม่มีตำแหน่ง 30°) ตาม POH และ LN20 §21.1; VFE UP–10° 140 KIAS, 10°–20° 120 KIAS, 20°–FULL 100 KIAS (POH p2-4; TCDS IM.A.053 ให้เพียง flaps extended 100 KIAS ซึ่งตรงกับค่าแฟลปเต็ม); วิ่งขึ้นใช้ UP–20°',
  detSrc: ['LN18', 'LN20', 'LN23'],
  speeds: {
    VS0_kt: [54, 'kt CAS', ['LN18', 'LN19'], 'สูง', 'แฟลป FULL idle MTOW 54 KCAS (POH p iii) = 27.8 m/s; AOPA ให้ 39 KIAS (ผลต่าง IAS–CAS ใหญ่ที่มุมปะทะสูง)'],
    VS1_kt: [62, 'kt CAS', ['LN18', 'LN19'], 'สูง', 'แฟลป UP idle MTOW 62 KCAS (POH p iii) = 31.9 m/s; AOPA 50 KIAS'],
    VX_kt: [69, 'kt IAS', ['LN19'], 'กลาง', '35.5 m/s (AOPA Pilot 2000 อิง POH)'],
    VY_kt: [89, 'kt IAS', ['LN19'], 'กลาง', '45.8 m/s'],
    VR_kt: [55, 'kt IAS', ['LN20'], 'กลาง', 'normal takeoff rotation ตาม POH (LN20 §20.3); 56 KIAS เมื่อติด STC เพิ่มน้ำหนัก'],
    VG_kt: [80, 'kt IAS', ['LN18', 'LN20'], 'สูง', 'best glide ที่ 3,600 lb (POH p3-7)'],
    VA_kt: [125, 'kt IAS', ['LN23', 'LN18'], 'สูง', '123 KCAS ที่ 3,600 lb (TCDS p16–17); 120 KIAS ที่ 2,950 lb; 106 KIAS ที่ 2,300 lb (POH p2-4)'],
    VNO_kt: [149, 'kt IAS', ['LN23', 'LN18'], 'สูง', '147 KCAS (TCDS p16–17, POH p2-4)'],
    VNE_kt: [182, 'kt IAS', ['LN23', 'LN18'], 'สูง', 'TCDS ให้ 180 KCAS (92.6 m/s), POH 179 KCAS (§13.8 ข้อ 6)'],
    crosswind_demonstrated_kt: [20, 'kt', ['LN19', 'LN20'], 'กลาง', '10.3 m/s ไม่ใช่ขีดจำกัด'],
  },
  perf: {
    ROC_SL_fpm: [1050, 'fpm', ['LN18', 'LN19'], 'สูง', 'SL MTOW (5.33 m/s) (POH p ii)'],
    service_ceiling_ft: [27000, 'ft', ['LN18', 'LN19'], 'สูง', '8,230 m (turbocharged)'],
    takeoff: [{ ground_roll_m: r(910 * FT, 0), over50ft_m: r(1740 * FT, 0) }, 'm', ['LN18', 'LN19'], 'สูง', '910 / 1,740 ft ที่ MTOW, ISA, ทางวิ่งแข็งแห้ง ลมสงบ (POH p iii)'],
    landing: [{ ground_roll_m: r(735 * FT, 0), over50ft_m: r(1395 * FT, 0) }, 'm', ['LN18', 'LN19'], 'สูง', '735 / 1,395 ft เงื่อนไขเดียวกัน'],
    cruise_table: [[{ ktas: 164, h_ft: 20000, power_pct: 75 }], 'kt TAS, ft', ['LN19'], 'กลาง', '164 KTAS (84.4 m/s) ที่ 75 % 20,000 ft; max level 178 KTAS ที่ 17,000 ft'],
  },
  engine: { model: 'Lycoming TIO-540-AJ1A', kind: 'fuel_injected', displacement_L: r(541.5 * 0.0163871, 2), cylinders: 6, tcds: 'FAA E14EA (ไม่ได้เปิด)', P: 310, rpm: 2500, src: ['LN23', 'LN18'], note: 'turbocharged 541.5 in³; 310 hp ที่ 2,500 rpm ทั้ง takeoff และ continuous (TCDS p15), 39 inHg (POH p1-5)' },
  prop: { kind: 'constant_speed', model: 'McCauley B3D36C432/80VSA-1', n: 3, D: r(79 * IN, 3), Dnote: 'Ø สูงสุด 79.0 in (2.007 m) ต่ำสุด 77.5 in (1.969 m) (TCDS p16, POH p2-6)', sense: 1, senseEst: true, src: ['LN23', 'LN18'] },
  gear: { layout: 'tricycle_fixed', src: ['LN18'] },
  controls: {
    elevator: [{ travel_deg: { up: 21, down: 17 } }, 'ขึ้น 21° ลง 17° (±1°) เทียบกับ stabilizer (TCDS p17–18)'],
    aileron: [{ travel_deg: { up: 21, down: 14.5 } }, 'ขึ้น 21° ลง 14°30′ (±2°)'],
    rudder: [{ travel_deg: { left: 24, right: 24 } }, '24° ซ้าย/ขวา (±1°) ขนานกับ W.L. 0.00; 27°13′ เมื่อวัดตั้งฉากกับ hinge line'],
    flap: [{ travel_deg: { up: 0, down: 40 } }, 'ลง 40° (+1°, −2°)'],
    trim_tab: [{ travel_deg: { up: 25, down: 5 } }, 'elevator tab ขึ้น 25° ลง 5° (+1°, −0°)'],
    src: ['LN23'],
  },
  twin: false,
};

// ── PAC CT/4E Airtrainer (civil type certificate and manufacturer data only; generic depiction) ──
T.ct4 = {
  mtow: 1180, vs0: 45, vs1: 60, vsUnit: 'kt CAS', fullDet: 'LDG', cleanDet: 'UP', bew: 770, fuelL: 150,
  poh: null,
  vrefNote: 'ความไว: ถ้า VS0 จริง ≈ 52 KCAS (CLmax 2.1) จะได้ VREF ≈ 63 และ VAPP ≈ 68 kt ต้องยืนยันด้วย AFM ก่อนใช้ในซิม',
  clNote: 'ข้อควรระวัง: CLmax แฟลป LDG 2.79 เกินที่แฟลปธรรมดา 30° ทำได้ (≈ 1.9–2.3) แสดงว่า Vsf 45 kt ของผู้ผลิตไม่ใช่ KCAS ที่ MTOW; ถ้า CLmax จริง ≈ 2.1 VS0 ≈ 52 KCAS และ VREF ≈ 63 (§13.8 ข้อ 7; T-LN-06)',
  leaves: {
    'airframe.identity': L({ manufacturer: 'Pacific Aerospace (นิวซีแลนด์; ผู้ถือ TC ปัจจุบัน NZSkydive Ltd ชื่อการค้า NZAero)', model: 'CT/4E Airtrainer', variant: 'CT/4E (TCDS A-10 item IV, Lycoming 300 hp, 1,180 kg) เป็นแบบอ้างอิงของบัตร; CT/4A (item II, Continental IO-360-H 210 hp, 2,400 lb) ต่างที่เครื่องยนต์และมวล; ผู้ใช้ในไทยเป็นผู้ใช้ทางทหาร แสดงแบบทั่วไปจากเอกสารรับรองแบบพลเรือนและข้อมูลผู้ผลิตเท่านั้น', engine: 'Lycoming AEIO-540-L1B5 300 hp (224 kW) ที่ 2,700 rpm (ระบบน้ำมันแบบ aerobatic)', propeller: 'Hartzell HC-C3YR-4BF/FC7663-2 3 ใบ constant speed Ø 75–76 in (1.91–1.93 m); ตัวเลือก MT MTV-9-B-C/C193-58', seats: 2, category: 'acrobatic (FAR 23)', tc_ref: 'CAA NZ TCDS A-10 Rev 21 (10 Jun 2024) item IV; อนุมัติ 17 Jul 1992' }, '-', ['LN21', 'LN22'], 'สูง', false, 'จำนวนเครื่องของผู้ใช้ทางทหารในไทยอยู่ใน 02 (common_light.thai_fleet.military_generic, ความเชื่อมั่นต่ำ)'),
    'airframe.weights.MTOW': L(1180, 'kg', ['LN21'], 'สูง', false, '2,600 lb (TCDS item IV)'),
    'airframe.weights.MLW': L(1180, 'kg', ['LN22'], 'กลาง', false, '2,600 lb (หน้าเว็บผู้ผลิต)'),
    'airframe.weights.BEW_typical': L(770, 'kg', ['LN22'], 'กลาง', false, 'basic empty 1,700 lb (หน้าเว็บผู้ผลิต)'),
    'airframe.weights.max_fuel_usable': L(146, 'kg', ['LN22', 'LN21'], 'กลาง', false, '"maximum fuel" 322 lb (146 kg) ตามผู้ผลิต (ไม่ได้บอกว่าเป็นส่วนใช้ได้); ความจุ 207 L (45.5 Imp gal) ตาม TCDS'),
    'airframe.weights.training_mass': tm(770, 150, 'เชื้อเพลิง 150 L'),
    'airframe.cg.envelope': L([[998, r(29.0 * IN, 4), r(34.0 * IN, 4)], [1180, r(31.0 * IN, 4), r(34.0 * IN, 4)]], 'kg, m DAT', ['LN21'], 'สูง', false, 'หน้า 29.0 in ที่ 998 kg ถึง 31.0 in ที่ 1,180 kg; หลัง 34.0 in ทุกน้ำหนัก (TCDS item IV; datum ตามที่ TCDS กำหนด)'),
    'airframe.geometry.span': L(7.9, 'm', ['LN22'], 'กลาง', false, '26.0 ft'),
    'airframe.geometry.length': L(7.16, 'm', ['LN22'], 'กลาง', false, '23.48 ft'),
    'airframe.geometry.height': L(2.59, 'm', ['LN22'], 'กลาง', false, '8.50 ft'),
    'airframe.wing.S': L(12.0, 'm2', ['LN22'], 'กลาง', false, '129.0 ft² (gross)'),
    'airframe.wing.b': L(7.9, 'm', ['LN22'], 'กลาง', false, '26.0 ft'),
    'airframe.wing.AR': L(r(7.9 ** 2 / 12, 2), '-', ['LN0'], 'กลาง', true, 'ค่าประมาณ: b²/S'),
  },
  detents: [['UP', 0, null], ['TO', 15, 100], ['LDG', 30, 85]],
  detNote: 'TCDS ให้ VFE ของตำแหน่ง take-off 100 KCAS และ landing 85 KCAS (CT/4A: half flap / full flap) และแฟลปสุด 30°; ชื่อ UP/TO/LDG ตามคำของ TCDS; มุม TO 15° เป็นค่าประมาณ (ครึ่งหนึ่งของ 30° ตามคำ "half flap" ของ CT/4A); PAC/CT/0259 เพิ่ม VFE landing เป็น 91 KIAS',
  detSrc: ['LN21'], detEst: true,
  speeds: {
    VS0_kt: [45, 'kt CAS', ['LN22'], 'ต่ำ', 'Vsf (full flap) 45 kt (23.1 m/s) ตามผู้ผลิต ไม่บอก IAS/CAS และมวล จึงถือเป็น KCAS ที่ MTOW; CLmax ที่ได้ (2.79) สูงเกินจริง ดู §13.8 ข้อ 7'],
    VS1_kt: [60, 'kt CAS', ['LN22'], 'กลาง', 'Vs (no flap) 60 kt (30.9 m/s) หน่วยเหมือนข้างบน'],
    VA_kt: [146, 'kt CAS', ['LN21', 'LN22'], 'สูง', 'TCDS (ผู้ผลิตให้ 144 kt)'],
    VNO_kt: [147, 'kt CAS', ['LN21'], 'ต่ำ', 'ค่าประมาณ: TCDS ไม่ให้ VNO ใช้ VC (design cruising speed) 147 KCAS แทน (ผู้ผลิตให้ Vc 150 kt)', true],
    VNE_kt: [207, 'kt CAS', ['LN21'], 'สูง', '106.5 m/s (TCDS item IV)'],
  },
  perf: {
    ROC_SL_fpm: [1830, 'fpm', ['LN22'], 'กลาง', '9.3 m/s ตามผู้ผลิต (ไม่บอกมวลและความสูง)'],
    takeoff: [{ ground_roll_m: 183, over50ft_m: null }, 'm', ['LN22'], 'กลาง', 'take-off ground roll 600 ft (ผู้ผลิต); ระยะถึง 50 ft ไม่มีในแหล่ง'],
    landing: [{ ground_roll_m: 168, over50ft_m: null }, 'm', ['LN22'], 'กลาง', 'landing run 553 ft (ผู้ผลิต)'],
  },
  engine: { model: 'Lycoming AEIO-540-L1B5', kind: 'fuel_injected', displacement_L: r(541.5 * 0.0163871, 2), cylinders: 6, tcds: 'FAA 1E4 (O-540 series; ไม่ได้เปิด)', P: 300, rpm: 2700, src: ['LN21', 'LN22'], note: '300 hp ที่ 2,700 rpm เต็มคันเร่งทุกการใช้งาน (TCDS item IV); ความจุ 541.5 in³ ของตระกูล 540; power loading 8.7 lb/hp ที่ MAUW ของผู้ผลิตตรงกับ 300 hp' },
  prop: { kind: 'constant_speed', model: 'Hartzell HC-C3YR-4BF/FC7663-2', n: 3, D: r(76 * IN, 3), Dnote: 'Ø สูงสุด 76 in ต่ำสุด 75 in (TCDS item IV); มุมใบที่สถานี 30 in 13.4°–32°', sense: 1, senseEst: true, src: ['LN21'] },
  gear: { layout: 'tricycle_fixed', src: ['LN22'], est: true },
  controls: {
    elevator: [{ travel_deg: { up: 25, down: 15 } }, 'ขึ้น 25° ลง 15° (TCDS item IV)'],
    aileron: [{ travel_deg: { up: 16.5, down: 10.5 } }, 'ขึ้น 16.5° ลง 10.5°'],
    rudder: [{ travel_deg: { left: 30, right: 30 } }, '30° ซ้าย/ขวา'],
    flap: [{ travel_deg: { up: 0, down: 30 } }, 'ลง 30°'],
    src: ['LN21'],
  },
  twin: false,
};

// ───────────────────────── build leaves ─────────────────────────
const set = (o, p, v) => { const k = p.split('.'); let c = o; for (const x of k.slice(0, -1)) c = (c[x] ??= {}); c[k.at(-1)] = v; };
const withScope = (p, l) => ({ v: l.v, u: l.u, scope: SCOPE[p.split('.')[0]] ?? 'aircraft', src: l.src, conf: l.conf, est: l.est, note: l.note });
const derived = {};

function build(id) {
  const t = T[id], card = {};
  const put = (p, l) => set(card, p, withScope(p, l));
  for (const [p, l] of Object.entries(t.leaves)) put(p, l);
  const m = t.leaves['airframe.weights.training_mass'].v.kg;
  const S = t.leaves['airframe.wing.S'].v, b = t.leaves['airframe.wing.b'].v;
  // aero.ref
  put('aero.ref.S', L(S, 'm2', t.leaves['airframe.wing.S'].src, t.leaves['airframe.wing.S'].conf, false, 'เท่ากับ airframe.wing.S'));
  put('aero.ref.b', L(b, 'm', t.leaves['airframe.wing.b'].src, t.leaves['airframe.wing.b'].conf, false, 'เท่ากับ airframe.wing.b'));
  const mac = t.leaves['airframe.cg.MAC']?.v;
  put('aero.ref.c', mac ? L(mac, 'm', ['LN14', 'LN0'], 'กลาง', true, 'ค่าประมาณ: MAC ที่คำนวณจาก TCDS (airframe.cg.MAC)') : L(r(S / b, 3), 'm', ['LN0'], 'ต่ำ', true, 'ค่าประมาณ: mean geometric chord S/b เพราะแหล่งไม่ให้ MAC'));
  // flaps
  put('aero.flaps.detents', L(t.detents.map(([name, deg, vfe]) => ({ name, flap_deg: deg, VFE_kt: vfe })), 'deg, kt', t.detSrc, t.detEst ? 'ต่ำ' : 'กลาง', !!t.detEst, (t.detEst ? 'ค่าประมาณบางส่วน: ' : '') + t.detNote + ' (D6: ชื่อเดียวกันนี้ใช้ใน 08/09)'));
  const vfeUnit = t.vsUnit === 'kt CAS' && id !== 'p2002jf' && id !== 't206h' ? 'kt CAS' : 'kt IAS';
  put('speeds.VFE', L(Object.fromEntries(t.detents.filter(d => d[2] != null).map(d => [d[0], d[2]])), vfeUnit, t.detSrc, id === 'be76' ? 'ต่ำ' : t.detEst ? 'กลาง' : 'สูง', false, 'ความเร็วสูงสุดที่ตำแหน่งแฟลปนั้น (ชื่อตาม aero.flaps.detents)'));
  // speeds
  const vs0 = t.vs0, vs1 = t.vs1;
  for (const [k, a] of Object.entries(t.speeds)) {
    const [v, u, src, conf, note, est] = a;
    put('speeds.' + k, L(k === 'VS0_kt' && v == null ? vs0 : v, u, src, conf, !!est, note));
  }
  // CLmax targets from the stall speeds (MTOW, min-speed entry → 1 g)
  const cl = {};
  if (vs1 != null) cl[t.cleanDet] = clmaxFromStall({ mass: t.mtow, S, vs_kcas: vs1, kind: 'min' }).CLmax_1g;
  if (vs0 != null) cl[t.fullDet] = clmaxFromStall({ mass: t.mtow, S, vs_kcas: vs0, kind: 'min' }).CLmax_1g;
  for (const k in cl) cl[k] = r(cl[k], 3);
  put('aero.static_long.CLmax_target', L(cl, '-', ['LN0', ...t.leaves['airframe.wing.S'].src], 'ต่ำ', true,
    `ค่าประมาณ: CLmax 1 g = 0.95 · 2 m g /(ρ0 S V²) จาก VS ที่ MTOW ${r(t.mtow, 1)} kg (lm_polar.clmaxFromStall, ความเร็วต่ำสุดของการเข้า stall 1 kt/s, nz 0.95)` + (/IAS/.test(t.vsUnit) ? '; ใช้ KIAS แทน KCAS เพราะไม่มีตาราง IAS→CAS (CLmax อาจสูงเกินจริง)' : '') + (t.clNote ? '; ' + t.clNote : '')));
  // VREF / VAPP (D1) at training mass
  let vref, vapp;
  if (t.poh) {
    vref = t.poh.vref; vapp = t.poh.vapp;
    put('speeds.VREF_kt', L(vref[0], vref[1], vref[2], vref[3], false, vref[4]));
    put('speeds.VAPP_kt', L(vapp[0], vapp[1], vapp[2], vapp[3], false, vapp[4]));
  } else {
    const k = Math.sqrt(m / t.mtow), vsTm = vs0 * k, vr = Math.round(1.3 * vsTm);
    vref = [vr]; vapp = [vr + 5];
    put('speeds.VREF_kt', L(vr, t.vsUnit, ['LM25', 'LN0', ...t.speeds.VS0_kt[2].filter(s => s !== 'LN0')], 'ต่ำ', true,
      `ค่าประมาณ (D1, AFM ไม่สาธารณะ): 1.3 VS0 ที่ training_mass ${m} kg = 1.3 × ${vs0} × √(${m}/${r(t.mtow, 1)}) = ${r(1.3 * vsTm, 1)} → ${vr} kt (${r(vr * KT, 1)} m/s) [AFH p9-3]` + (/CAS/.test(t.vsUnit) ? '; ไม่มีตาราง IAS→CAS ให้ถือ KIAS ≈ KCAS' : '') + (t.vrefNote ? '; ' + t.vrefNote : '')));
    put('speeds.VAPP_kt', L(vr + 5, t.vsUnit, ['LN0', 'LM25'], 'ต่ำ', true,
      `ค่าประมาณ (D1; 08 ops.final และ 09 Vapp อ้างค่านี้): VREF + 5 kt ตามค่าเริ่มต้น VappMinusVref ของ 01-methods §01.1 = ${vr + 5} kt (${r((vr + 5) * KT, 1)} m/s)`));
  }
  // performance
  for (const [k, a] of Object.entries(t.perf)) { const [v, u, src, conf, note, est] = a; put('performance.' + k, L(v, u, src, conf, !!est, note)); }
  // engine (piston.*), propulsion layout, propeller
  const e = t.engine, Pw = e.Pw ?? r(e.P * HP, 0);
  put('piston.identity', L({ model: e.model, kind: e.kind, displacement_L: e.displacement_L, cylinders: e.cylinders, tcds: e.tcds }, '-', e.src, 'สูง', false, e.note));
  put('piston.ratings.P_rated', L(Pw, 'W', e.src, 'สูง', false, `${r(Pw / 1000, 1)} kW = ${r(Pw / HP, 1)} hp ต่อเครื่อง`));
  put('piston.ratings.rpm_rated', L(e.rpm, 'rpm', e.src, 'สูง', false, id === 'p2002jf' ? 'รอบเครื่องยนต์ (ใบพัด 2,388 rpm ผ่านเกียร์ 2.43)' : 'ขับใบพัดตรง'));
  if (e.mcpW) { put('piston.ratings.P_mcp', L(e.mcpW, 'W', e.src, 'สูง', false, '69.0 kW ต่อเนื่อง')); put('piston.ratings.takeoff_time_limit_s', L(e.tlim, 's', e.src, 'สูง', false, 'กำลังสูงสุดนาน 5 นาที')); }
  const n = t.twin ? 2 : 1, sense = t.prop.sense;
  const sOf = i => (typeof sense === 'number' ? sense : i === 0 ? sense.left : sense.right);
  put('propulsion.layout', L(Array.from({ length: n }, (_, i) => ({ id: i + 1, pos: null, axis: [1, 0, 0], type: 'piston', model: t.twin && id === 'be76' ? (i === 0 ? 'O-360-A1G6D' : 'LO-360-A1G6D') : e.model, prop_sense: sOf(i) })), 'm FRD, -',
    t.prop.src, t.prop.senseEst ? 'กลาง' : 'กลาง', !!t.prop.senseEst, (t.prop.senseEst ? 'ค่าประมาณ: ' + (t.prop.senseNote || 'เครื่อง Lycoming ขับตรงหมุนตามเข็มนาฬิกาเมื่อมองจากด้านหลัง (แบบเดียวกับบัตร c172s)') : 'ทิศหมุนตามแหล่ง') + `; pos = null เพราะแหล่งไม่ให้ตำแหน่งเครื่องยนต์ (${n} เครื่อง)` + (t.twin ? '; id 1 = ซ้าย' : '')));
  put('propeller.identity.kind', L(t.prop.kind, '-', t.prop.src, 'สูง', false, t.prop.kind === 'fixed' ? 'fixed pitch' : 'constant speed'));
  put('propeller.identity.model', L(t.prop.model, '-', t.prop.src, 'สูง', false, ''));
  put('propeller.identity.nBlades', L(t.prop.n, '-', t.prop.src, 'สูง', false, ''));
  put('propeller.identity.diameter', L(t.prop.D, 'm', t.prop.src, t.prop.Dest ? 'ต่ำ' : 'สูง', !!t.prop.Dest, t.prop.Dnote));
  put('propeller.identity.sense', L(sense, '-', t.prop.src, 'กลาง', !!t.prop.senseEst, (t.prop.senseEst ? 'ค่าประมาณ: ' : '') + '+1 = หมุนตามเข็มนาฬิกาเมื่อมองจากด้านหลัง (รอบที่ 1)' + (typeof sense === 'object' ? '; แยกซ้าย/ขวา' : '')));
  put('propeller.engineInterface.maxShaftPower', L(r(Pw / 1000, 1), 'kW', e.src, 'สูง', false, 'กำลังพิกัดต่อเครื่อง'));
  if (t.prop.gearRatio) put('propeller.engineInterface.gearRatio', L(t.prop.gearRatio, '-', ['LN12', 'LG11'], 'สูง', false, 'เกียร์ทด Rotax 2.43:1 (2.4286 ตาม LN13)'));
  if (t.prop.staticRpm) put('propeller.fixed.static_rpm_range', L(t.prop.staticRpm, 'rpm', ['LN1'], 'สูง', false, t.prop.staticNote));
  // gear
  put('gear.layout', L(t.gear.layout, '-', t.gear.src, t.gear.est ? 'กลาง' : 'สูง', !!t.gear.est, t.gear.est ? 'ค่าประมาณ: ล้อสามล้อตายตัวตามภาพของผู้ผลิต แหล่งข้อความไม่ระบุ' : t.gear.layout === 'tricycle_retract' ? 'ล้อพับเก็บได้' : 'ล้อตายตัว'));
  if (t.gear.retract) put('gear.retract', L(t.gear.retract, 's, kt IAS', t.gear.src, 'ต่ำ', false, 'VLO กาง 140 / เก็บ 112 KIAS, VLE 140 KIAS (flashcard); เวลาพับไม่มีในแหล่ง'));
  if (t.gear.steering) {
    put('gear.steering.mode', L(t.gear.steering.mode, '-', ['LN1'], 'กลาง', true, 'ค่าประมาณ: ล้อหน้าเลี้ยวด้วยแป้นเท้าแบบ PA-28 ทั่วไป (TCDS ให้เฉพาะมุม)'));
    put('gear.steering.pedal_max', L(t.gear.steering.pedal_max, 'deg', ['LN1'], 'สูง', false, 'nose wheel travel 30° ซ้าย/ขวา (±1°) ตาม TCDS'));
  }
  // controls (D2 leaf form)
  if (t.controls) for (const s of ['elevator', 'aileron', 'rudder', 'flap', 'trim_tab']) {
    const c = t.controls[s]; if (!c) continue;
    put('controls.surfaces.' + s, L(c[0], 'deg', t.controls.src, c[2] ?? 'สูง', false, c[1]));
  }
  // _na
  const r1 = JSON.parse(fs.readFileSync(new URL('./r1-pertype-paths.json', HERE), 'utf8'));
  const have = new Set(leafPathsOf(card));
  const filled = p => have.has(p) || [...have].some(h => h.startsWith(p + '.'));
  const groups = {};
  for (const p of Object.keys(r1)) { const g = p.split('.').slice(0, 2).join('.'); (groups[g] ??= []).push(p); }
  const na = [];
  for (const [g, ps] of Object.entries(groups)) {
    const miss = ps.filter(p => !filled(p));
    if (!miss.length) continue;
    if (miss.length === ps.length) na.push(g + '.*'); else na.push(...miss);
  }
  card._na = { v: na, u: '-', scope: 'aircraft', src: ['LN0'], conf: 'สูง', est: false,
    note: 'บัตรย่อระดับ TCDS (D5): path ต่อแบบของรอบที่ 1 ที่ไม่ได้กรอกมีสองกลุ่ม (1) ไม่เกี่ยวกับแบบนี้: turbofan.*, turboprop.*, propeller.betaReverse.*, gear.brakes.antiskid*, ' + (t.twin ? '' : 'propeller.feathered.* และ ') + 'validation.typicalModes ของเครื่องบินโดยสาร; (2) เลื่อนไปทำเมื่อจำเป็น เพราะไม่มีข้อมูลสาธารณะระดับ TCDS/POH ของแบบนี้หรือซิมยังไม่มีโมเดลย่อย: อากาศพลศาสตร์ละเอียด (static_long ยกเว้น CLmax_target, stall/buffet/spin, strip wing), interference (downwash, ground effect, slipstream), รูปทรงและตารางใบพัด, governor, hinge moment และแรงที่คัน (controls.pitch/roll/yaw), ขาล้อ ยาง เบรก, numerics.contact, wind, input และ otherSims (หัวข้อ 03 เป็นเจ้าของ) lm_card ใช้ค่าเริ่มต้นของหัวข้อ 01 (ติดธง R1/default) แทนในกลุ่มที่ 2' };
  // derived numbers for the text / tests
  derived[id] = { m_train: m, mtow: r(t.mtow, 1), S, b, vs0, vs1, vsUnit: t.vsUnit, CLmax: cl, VREF: vref[0], VAPP: vapp[0], vrefUnit: t.poh ? t.poh.vref[1] : t.vsUnit,
    vappUnit: t.poh ? t.poh.vapp[1] : t.vsUnit, detents: t.detents.map(d => d[0]), fullDet: t.fullDet, cleanDet: t.cleanDet, P_W: Pw, nEng: n, twin: t.twin,
    VY: t.speeds.VY_kt?.[0] ?? null, VX: t.speeds.VX_kt?.[0] ?? null, ROC: t.perf.ROC_SL_fpm?.[0] ?? null, na: na.length, leaves: 0 };
  derived[id].leaves = leafPathsOf(card).length + 1;
  return card;
}
function leafPathsOf(o, p = [], acc = []) {
  for (const [k, v] of Object.entries(o)) { if (v && typeof v === 'object' && !Array.isArray(v) && 'v' in v && 'scope' in v) acc.push([...p, k].join('.')); else if (v && typeof v === 'object' && !Array.isArray(v)) leafPathsOf(v, [...p, k], acc); }
  return acc;
}

// ───────────────────────── format and write ─────────────────────────
function fmt(id, card) {
  // one leaf per line, nested objects indented (same reading layout as 12-p2006t.md)
  const lines = [];
  const walk = (o, ind) => {
    const ents = Object.entries(o);
    ents.forEach(([k, v], i) => {
      const comma = i < ents.length - 1 ? ',' : '';
      if (v && typeof v === 'object' && 'v' in v && 'scope' in v) lines.push(`${' '.repeat(ind)}${JSON.stringify(k)}: ${JSON.stringify(v)}${comma}`);
      else { lines.push(`${' '.repeat(ind)}${JSON.stringify(k)}: {`); walk(v, ind + 1); lines.push(`${' '.repeat(ind)}}${comma}`); }
    });
  };
  lines.push('{', ` ${JSON.stringify(id)}: {`); walk(card, 2); lines.push(' }', '}');
  return lines.join('\n');
}
const NAMES = { pa28_161: 'Piper PA-28-161', be76: 'Beechcraft 76 Duchess', p2002jf: 'Tecnam P2002-JF', p68c: 'Partenavia P.68C', t206h: 'Cessna T206H', ct4: 'PAC CT/4E Airtrainer' };
const cards = {};
let out = '';
for (const id of Object.keys(T)) {
  cards[id] = build(id);
  out += `**บล็อก \`${id}\`** (${NAMES[id]}; ${derived[id].leaves} leaf รวม \`_na\`)\n\n\`\`\`json\n${fmt(id, cards[id])}\n\`\`\`\n\n`;
}
out = out.trimEnd();
fs.mkdirSync(new URL('./out/', HERE), { recursive: true });
fs.writeFileSync(new URL('./out/ln_cards.json', HERE), JSON.stringify({ _meta: { script: 'scripts/ln_json.mjs', generated: '2026-11-19' }, derived }, null, 1) + '\n');

const md = fs.readFileSync(MD, 'utf8');
const B = '<!-- LN_JSON_BEGIN -->', E = '<!-- LN_JSON_END -->';
const i0 = md.indexOf(B), i1 = md.indexOf(E);
if (i0 < 0 || i1 < 0) throw new Error('markers LN_JSON_BEGIN/END not found in 13-other-trainers.md');
const next = md.slice(0, i0 + B.length) + '\n' + out + '\n' + md.slice(i1);
if (process.argv.includes('--check')) {
  const same = md.slice(i0 + B.length, i1).trim() === out.trim();
  console.log(same ? 'check: §13.6 blocks match generated blocks' : 'check: MISMATCH between §13.6 and ln_json.mjs');
  process.exitCode = same ? 0 : 1;
} else {
  fs.writeFileSync(MD, next);
  console.log('wrote', Object.keys(cards).length, 'blocks to 13-other-trainers.md and out/ln_cards.json');
}
for (const [id, d] of Object.entries(derived)) console.log(`${id}: leaves ${d.leaves}, _na ${d.na}, m_train ${d.m_train} kg, CLmax ${JSON.stringify(d.CLmax)}, VREF ${d.VREF} / VAPP ${d.VAPP} ${d.vappUnit}`);
