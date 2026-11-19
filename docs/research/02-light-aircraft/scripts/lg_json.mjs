#!/usr/bin/env node
// lg_json.mjs — build the p2006t data card (schema-ext-r2 leaves) from lg_calc + lm_derivs + lm_legacy_fit results and write
// the JSON blocks into ../12-p2006t.md between <!-- LG_JSON_BEGIN --> and <!-- LG_JSON_END --> (only that part is replaced).
// Order to rebuild (from the repo root, S = this folder):
//   node S/lg_calc.mjs → node S/lg_json.mjs → node S/lm_derivs.mjs p2006t --json > S/out/lg_derivs.json
//   → node S/lg_json.mjs → node S/lm_legacy_fit.mjs p2006t --json > S/out/lg_legacy.json → node S/lg_json.mjs
//   → node S/lm_card.mjs p2006t --json > S/out/lg_card.json → node S/lm_merge.mjs --type p2006t --coverage --dry → node S/lg_tests.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { F, compute } from './lg_calc.mjs';
import { isMainModule } from './lm_lib.mjs';
import { normaliseScopes, stickForceBand } from './lc_cardfix.mjs';   // shared helpers (D4 scope rule, wheel Fs/g band), read-only use

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MD = path.join(HERE, '..', '12-p2006t.md');
const rd = f => { try { return JSON.parse(fs.readFileSync(path.join(HERE, 'out', f), 'utf8')); } catch { return null; } };
const r = (x, n = 4) => (typeof x === 'number' ? +x.toPrecision(n) : x);
const L = (v, u, src, conf, est, note = '', scope = 'aircraft') => ({ v, u, scope, src, conf, est, note });
const E = (v, u, src, note, conf = 'ต่ำ', scope = 'aircraft') => L(v, u, src, conf, true, 'ค่าประมาณ: ' + note, scope);
const DEG = Math.PI / 180;
export const IYY_SCALE = 1.3;   // est: build-up Iyy raised to the top of its ±30 % band toward the flight short period (§12.9.3)

// choice of each AC derivative: 'ft' = flight-test parameter estimation [LG7] (sign-converted), 'est' = lm_derivs geometry estimate
// (see 12-p2006t.md §12.6.3 for the reasons; Cnb/Clb/Clp/Cnr from flight were rejected because they do not reproduce the measured
// Dutch-roll frequency with any plausible Izz, see out/lg_iter.json)
export const DERIV_CHOICE = { Cmq: 'ft', Cmde: 'ft' };
// D6 (19 Nov 2026): flap detent names of the card = the AFM checklist names UP / T/O / FULL with flap_deg 0 / 15 / 40; 08 and 09
// follow these names. lg_calc keeps its internal keys '0' / '15' / '40'.
export const DET_NAME = { '0': 'UP', '15': 'T/O', '40': 'FULL' };

export function buildCard() {
  const C = compute(), g = C.geom, w = C.weights, D = rd('lg_derivs.json'), leg = rd('lg_legacy.json'), it = rd('lg_iter.json'), card1180 = rd('lg_card_1180.json'), T = rd('lg_tests.json');
  const xref = C.cg.ref_m;   // m DAT of the reference CG (25 % MAC)
  const xFRD = xDat => r(xref - xDat, 4);
  const card = { p2006t: {} }; const c = card.p2006t;
  const geoTail = { S_h: 2.65, b_h: 3.70, l_h: 4.55, S_v: 1.95, b_v: 1.50, l_v: 4.60 };
  if (it?.tail) Object.assign(geoTail, it.tail);

  // ───────── airframe
  c.airframe = {
    identity: L({ manufacturer: 'Costruzioni Aeronautiche Tecnam S.p.A. (อิตาลี)', model: 'P2006T', variant: 'P2006T มาตรฐาน MTOW 1,180 kg (บัตรนี้); ตัวเลือก MOD2006/015 1,230 kg และ MOD2006/416 1,290 kg; P2006T NG (912 iSc3 Sport) เป็นแบบย่อยใหม่ปี 2025 ไม่รวม', engine: '2 × BRP-Rotax 912 S3 (73.5 kW / 98.6 hp ที่ 5,800 rpm 5 นาที; 69.0 kW ต่อเนื่อง) คาร์บูเรเตอร์ เกียร์ทด 2.43', propeller: '2 × MT-Propeller MTV-21-A-C-F/CF178-05 สองใบ constant speed full feathering D 1.78 m หมุนตามเข็มนาฬิกา (มองจากที่นั่งนักบิน) ทั้งสองข้าง', seats: 4, category: 'normal (CS-23)', tc_ref: 'EASA TCDS EASA.A.185 Issue 19 (20 Apr 2026); FAA รับรอง 10 Nov 2010' }, '-', ['LG1', 'LG2', 'LG9'], 'สูง', false, 'เครื่องสองเครื่องยนต์ ปีกสูง ล้อพับได้ stabilator (หางระดับเคลื่อนทั้งชิ้น); ผู้ใช้ในไทย: Thai Aviation Academy (VTUV) 1 ลำ [LS1][LS13] ไม่ทราบว่าเป็นรุ่น MTOW ใด'),
    weights: {
      MTOW: L(F.MTOW, 'kg', ['LG1', 'LG2'], 'สูง', false, '2,600 lb (TCDS p.7); MOD2006/015 1,230 kg; MOD2006/416 1,290 kg'),
      MLW: L(F.MTOW, 'kg', ['LG1', 'LG2'], 'สูง', false, 'เท่ากับ MTOW (TCDS ให้ take-off/landing ค่าเดียว; AFM p2-15)'),
      MZFW: L(F.MZFW, 'kg', ['LG1'], 'สูง', false, 'maximum zero (wing) fuel mass 1,145 kg (1,195 kg ที่ MTOW 1,230)'),
      BEW_typical: L(F.bro.BEW, 'kg', ['LG6', 'LG9'], 'กลาง', false, 'standard empty weight ตามโบรชัวร์ 2021 (รุ่น 1,230 kg); เครื่องทดสอบก่อนรับรอง 1,817 lb = 824 kg [LG9]; น้ำหนักจริงอยู่ใน weighing record ของแต่ละลำ (AFM Section 6)'),
      max_fuel_usable: L(r(F.fuelUsable_L * 0.72, 4), 'kg', ['LG1', 'LM4'], 'สูง', false, `ใช้ได้ 194.4 L (51.4 US gal) จาก 200 L × 0.72 kg/l (ความหนาแน่น MOGAS/AVGAS ที่หัวข้อ 01 ใช้ร่วมกัน [LM4])`),
      useful_load: L(F.MTOW - F.bro.BEW, 'kg', ['LG1', 'LG6'], 'กลาง', false, 'MTOW 1,180 − BEW 860; โบรชัวร์ให้ 370 kg ที่ MTOW 1,230'),
      training_mass: E({ kg: w.training_mass, empty_kg: F.bro.BEW, crew_kg: 160, fuel_kg: r(w.trainFuelL * 0.72, 4), fuel_l: w.trainFuelL }, 'kg', ['LG6', 'LG0'], `empty_kg = BEW_typical ${F.bro.BEW} kg (โบรชัวร์ [LG6]); ครู 85 + ศิษย์ 75 = 160 kg; เชื้อเพลิง ${w.trainFuelL} L × 0.72 kg/l = ${r(w.trainFuelL * 0.72, 4)} kg; รวม ${w.training_mass} kg (ต่ำกว่า 1,180 kg จึงใช้ความเร็วคอลัมน์ 1,180 kg ของ AFM); สองคน + เชื้อเพลิงเต็มได้ ${w.fullFuelTwoPilots} kg ยังไม่เกิน MTOW`),
    },
    cg: {
      datum: L('ระนาบตั้งที่สัมผัสขอบหน้าปีก (wing leading edge)', '-', ['LG1', 'LG2'], 'สูง', false, 'ระยะ m DAT บวกไปทางท้าย'),
      LEMAC: L(0.0, 'm DAT', ['LG1', 'LG0'], 'สูง', false, 'คำนวณจาก TCDS: 0.221 m = 16.5 % และ 0.415 m = 31.0 % ของ MAC 1.339 m ให้ LEMAC = 0.000 m ทั้งสองจุด'),
      MAC: L(F.MAC_tcds, 'm', ['LG1'], 'สูง', false, 'MAC ของ TCDS (p.7) ใช้กับ %MAC; AFM p1-5 ให้ mean geometric chord 1.295 m (= S/b) ถ้าใช้ 1.295 ขีดจำกัดจะเป็น 17.1/32.0 % ซึ่งไม่ตรงกับตัวเลขที่พิมพ์'),
      envelope: L(C.cg.envelope, 'kg, m DAT', ['LG1'], 'สูง', false, 'หน้า 0.221 m (16.5 % MAC) หลัง 0.415 m (31.0 % MAC) คงที่ทุกน้ำหนักถึง 1,230 kg; ที่ 1,290 kg ขีดหน้าเป็น 0.261 m (19.5 %) เชิงเส้น; มวลล่าง 700 kg เป็นค่าเพื่อปิดรูปเท่านั้น'),
      ref: E({ m_DAT: r(xref, 4), pct_mac: 25 }, 'm DAT, %MAC', ['LG8', 'LG0'], 'CG อ้างอิงของ FRD และ inertia = 25 % MAC (CG cruise ที่ ICAS 2008 ใช้); ตาราง stall ของ AFM ใช้ 22 %', 'กลาง'),
    },
    inertia: {
      Ixx: E(C.inertia.training.Ixx, 'kg m2', ['LG0', 'LM15'], `component build-up (Roskam Part V บทที่ 10) ที่มวลฝึก ${w.training_mass} kg: เครื่องยนต์ 2 × 94 kg ที่ y ±1.65 m, เชื้อเพลิงในปีก y ±2.3 m; ค่าคลาส single_prop ให้ ${C.inertia.class_single_prop.Ixx}, twin (C310) ${C.inertia.class_twin_C310.Ixx}`),
      Iyy: E(r(C.inertia.training.Iyy * IYY_SCALE, 4), 'kg m2', ['LG0', 'LM15', 'LG7'], `build-up ${C.inertia.training.Iyy} × ${IYY_SCALE} (ขอบบนของความไม่แน่นอน ±30 %) เพื่อให้ short period ของซิมเข้าใกล้ผลบิน 3.41 rad/s [LG7] (build-up เดิมให้ 4.39 rad/s; ต้อง ×1.65 จึงตรง ดู out/lg_tune.json); ค่าคลาส single_prop ให้ ${C.inertia.class_single_prop.Iyy}`),
      Izz: E(C.inertia.training.Izz, 'kg m2', ['LG0', 'LM15'], `build-up; ค่าคลาส single_prop ให้ ${C.inertia.class_single_prop.Izz}`),
      Ixz: E(C.inertia.training.Ixz, 'kg m2', ['LG0'], 'build-up (แกนลำตัวที่ CG); ลำดับเล็กเพราะมวลส่วนใหญ่อยู่ใกล้ระนาบปีก'),
      ref_mass: L(w.training_mass, 'kg', ['LG0'], 'กลาง', false, 'inertia ข้างบนคิดที่มวลฝึก; buildAC สเกลด้วย m/ref_mass'),
      radii: E({ ...C.inertia.training.radii, Ry: r(C.inertia.training.radii.Ry * Math.sqrt(IYY_SCALE), 3) }, '-', ['LG0', 'LM15'], 'Roskam Rx/Ry/Rz ย้อนจาก build-up (b 11.4 m, L 8.7 m); Ry รวมตัวคูณ Iyy'),
      method: E('component_buildup', '-', ['LG0', 'LM15'], 'ไม่มี inertia ของ P2006T เผยแพร่ในแหล่งเปิด; มวลและตำแหน่งชิ้นส่วนเป็นค่าประมาณ ความไม่แน่นอน ±30 %', 'ต่ำ'),
    },
    wing: {
      S: L(F.S, 'm2', ['LG2'], 'สูง', false, '158.9 ft² (AFM p1-5); ต้นแบบไม่มี winglet 14.7 m² [LG7]'),
      b: L(F.b, 'm', ['LG2', 'LG7'], 'สูง', false, '37.4 ft รวม winglet (ต้นแบบ 11.2 m)'),
      MAC: L(F.MAC_tcds, 'm', ['LG1'], 'สูง', false, 'ดู airframe.cg.MAC; MGC 1.295 m'),
      AR: L(F.AR, '-', ['LG2'], 'สูง', false, 'AFM p1-5 (b²/S = 8.805)'),
      taper: E(0.80, '-', ['LG8', 'LG0'], 'ปีกสี่เหลี่ยมช่วงใน (มีแฟลป) + เรียวช่วงนอก [LG8] เทียบเป็นปีกเรียวเดียว'),
      sweep_c4_deg: E(0, 'deg', ['LG8', 'LG0'], 'ปีกตรง: ช่วงในสี่เหลี่ยม ช่วงนอกเรียวเล็กน้อย [LG8 §3.2] จึงถือมุมกวาดที่ c/4 ≈ 0 (ไม่พบตัวเลข)'),
      dihedral_deg: L(F.dihedral, 'deg', ['LG2'], 'สูง', false, 'AFM p1-5'),
      incidence_deg: E(2.0, 'deg', ['LG0'], 'ไม่พบในแหล่งเปิด; ค่าทั่วไปของปีกสูง GA'),
      twist_deg: E(-2.0, 'deg', ['LG0'], 'ไม่พบ; ช่วงนอกบางกว่า (12 %) ใช้ washout เล็กน้อย'),
      airfoil: L({ root: F.icas.airfoilRoot, tip: F.icas.airfoilTip }, '-', ['LG8'], 'กลาง', false, 'ICAS 2008 Sec 3.2 Fig 7: ช่วงใน 15 % ช่วงนอก 12 %'),
      position: L('high', '-', ['LG2', 'LG8'], 'สูง', false, 'ปีกสูง'),
      winglet: L({ height_m: 0.60, de_oswald: 0.10 }, 'm, -', ['LG7', 'LG8'], 'กลาง', false, 'winglet เพิ่มช่วงปีก 0.2 m และ e 0.72 → 0.82 (ประมาณ) ROC OEI 169 → 300 fpm'),
    },
    tail: {
      S_h: E(geoTail.S_h, 'm2', ['LG0', 'LG7'], 'stabilator: ไม่มีพื้นที่ในแหล่งเปิด ปรับให้ Cmde ของ lm_derivs ≈ −1.81 /rad (อุโมงค์ลม −1.83, การบิน −1.811 [LG7])'),
      b_h: E(geoTail.b_h, 'm', ['LG0'], 'ราว 1/3 ของช่วงปีก'),
      l_h: E(geoTail.l_h, 'm', ['LG0'], '25 % MAC ปีก (x 0.335 m DAT) ถึง 25 % คอร์ดหาง (ราว 4.9 m DAT) จากสัดส่วนลำตัว 8.7 m'),
      S_v: E(geoTail.S_v, 'm2', ['LG0'], 'รวม rudder; หางดิ่งของเครื่องสองเครื่องยนต์ออกแบบตาม VMC [LG8]'),
      b_v: E(geoTail.b_v, 'm', ['LG0'], 'ไม่พบ; ประมาณจากความสูงเครื่อง 2.58 m ลบความสูงท้ายลำตัว (สัดส่วนรูปด้านข้าง)'),
      l_v: E(geoTail.l_v, 'm', ['LG0'], 'ไม่พบ; 25 % MAC ปีก ถึง 25 % คอร์ดเฉลี่ยของครีบ ประมาณจากความยาวลำตัว 8.7 m (ใกล้ l_h)'),
      airfoil_h: E('NACA 0012 class (สมมาตร)', '-', ['LG0'], 'ไม่พบในแหล่งเปิด; สมมติแพนอากาศสมมาตรหนา 12 % ตามหางทั่วไปของเครื่องเบา (มีผลเฉพาะ a_t ใน lm_derivs)'),
      airfoil_v: E('NACA 0012 class (สมมาตร)', '-', ['LG0'], 'ไม่พบในแหล่งเปิด; สมมติแพนอากาศสมมาตรหนา 12 % ตามหางทั่วไปของเครื่องเบา'),
      incidence_h_deg: E(0, 'deg', ['LG0'], 'stabilator ไม่มีมุมติดตั้งคงที่ (มุมคือ δe)'),
      kind: L('stabilator + trim tab', '-', ['LG1', 'LG8'], 'สูง', false, 'all-movable stabilator [LG8 Sec 3.3]; stabilator trim tab 19° ลง / 2° ขึ้น [LG1 p7]; TCDS และ ICAS ไม่ได้บอกว่า tab ทำงานแบบ anti-servo ด้วยหรือไม่ (stabilator ทั่วไปเป็นแบบนั้น แต่ยังไม่ยืนยัน)'),
    },
    surfaces: {
      elevator: E({ area_m2: geoTail.S_h, chord_ratio: 1.0, span_fraction: 1.0 }, '-', ['LG1', 'LG0'], 'stabilator ทั้งชิ้นเป็นพื้นบังคับ (chord_ratio 1)'),
      aileron: E({ area_m2: 0.62, chord_ratio: 0.25, span_fraction: [0.60, 0.95] }, '-', ['LG8', 'LG0'], 'Frise aileron [LG8] ช่วงนอก; ขนาดเป็นค่าประมาณ'),
      rudder: E({ area_m2: 0.75, chord_ratio: 0.40, span_fraction: 1.0 }, '-', ['LG0'], 'ไม่พบ; ราว 1/3 ของ S_v (0.75/2.28) และคอร์ด 40 % ตามสัดส่วนทั่วไปของเครื่องสองเครื่องยนต์เบา'),
      flap: E({ area_m2: 2.4, chord_ratio: 0.28, span_fraction: [0.10, 0.55], kind: 'slotted, low hinge' }, '-', ['LG8', 'LG0'], 'slotted flap ช่วงในสี่เหลี่ยม [LG8]'),
      trim_tab: L({ on: 'stabilator', travel: { up: F.travel.stabTab.up, down: F.travel.stabTab.down }, rudder_tab_deg: F.travel.rudTab }, 'deg', ['LG1', 'LG2'], 'สูง', false, 'ขนาด tab ไม่พบ'),
    },
    geometry: {
      length: L(F.L, 'm', ['LG2'], 'สูง', false, '28.5 ft (AFM p1-5)'),
      span: L(F.b, 'm', ['LG2'], 'สูง', false, ''),
      height: L(F.H, 'm', ['LG2'], 'กลาง', false, 'AFM p1-5 8.46 ft; Wikipedia 2.90 m (ขัดกัน ใช้ AFM)'),
      wheelbase: L(F.wheelbase, 'm', ['LG2'], 'สูง', false, 'AFM p1-5'),
      main_track: L(F.track, 'm', ['LG2'], 'สูง', false, 'AFM p1-5'),
      prop_clearance: E(0.80, 'm', ['LG0'], 'ใบพัดอยู่ใต้ปีกสูง ระยะพื้นมาก (ไม่พบตัวเลข)'),
      fuselage_width: E(1.30, 'm', ['LG9', 'LG0'], 'ห้องโดยสารกว้าง 48 in (1.22 m) [LG9] + ผนัง'),
      fuselage_height: E(1.45, 'm', ['LG0'], 'ไม่พบ; ห้องโดยสารปีกสูงสี่ที่นั่ง ประมาณจากสัดส่วนรูปด้านข้าง'),
      nacelle_width: E(F.icas.nacelleW, 'm', ['LG8'], 'ใช้ความกว้างสูงสุดของเครื่องยนต์ Rotax 912 S 575 mm (พื้นที่หน้าตัดเครื่องยนต์ 0.322 m²) จาก ICAS 2008 Table 1 แทนความกว้าง nacelle ซึ่งไม่พบ (nacelle จริงกว้างกว่าเล็กน้อย)', 'กลาง'),
      eye_pos_FRD: E([0.40, -0.30, -0.35], 'm FRD', ['LG0'], 'ที่นั่งซ้ายหน้า ราว x −0.05 m DAT, ตาสูงกว่า CG 0.35 m'),
      eye_height_static: E(2.0, 'm', ['LG0'], 'ปีกสูง ลำตัวสูง ตาราว 2.0 m เหนือพื้นเมื่อจอด'),
    },
  };

  // ───────── aero
  const cl = C.clmax, fl = C.flaps;
  const dets = [{ name: 'UP', flap_deg: 0, VFE_kt: null, dCL0: 0, dCD0: 0, dCm0: 0, CLmax: cl['0'].CLmax_1g },
    { name: 'T/O', flap_deg: 15, VFE_kt: 119, dCL0: fl.dCL0['15'], dCD0: 0.012, dCm0: -0.04, CLmax: cl['15'].CLmax_1g },
    { name: 'FULL', flap_deg: 40, VFE_kt: 93, dCL0: fl.dCL0['40'], dCD0: 0.050, dCm0: -0.10, CLmax: cl['40'].CLmax_1g }];
  c.aero = {
    ref: { S: L(F.S, 'm2', ['LG2'], 'สูง', false, ''), b: L(F.b, 'm', ['LG2'], 'สูง', false, ''), c: L(F.MAC_tcds, 'm', ['LG1'], 'สูง', false, 'MAC ของ TCDS') },
    static_long: {
      CL0: L({ UP: F.ft.CL0, 'T/O': r(F.ft.CL0 + fl.dCL0['15'], 3), FULL: r(F.ft.CL0 + fl.dCL0['40'], 3) }, '-', ['LG7', 'LG0'], 'กลาง', true, `ค่าประมาณ (แฟลป): UP (clean) จาก parameter estimation การบิน 110 kt [LG7] (อุโมงค์ลม 0.153); แฟลป = UP + ΔCLmax/0.85 จากความเร็ว stall ของ AFM`),
      CLalpha: L(F.ft.CLa, '1/rad', ['LG7'], 'กลาง', false, 'parameter estimation 4.152; บินระดับหลายความเร็ว 3.85; อุโมงค์ลม 4.5 (Re 0.6e6)'),
      Cm0: L({ UP: F.ft.WT.Cm0 }, '-', ['LG7'], 'ต่ำ', false, 'อุโมงค์ลม −0.08 (ค่าจาก parameter estimation −0.922 อ้างอิงต่างกันและใช้กับ AC ไม่ได้)'),
      Cmalpha: L(F.ft.Cma, '1/rad', ['LG7'], 'กลาง', false, 'parameter estimation −0.871; อุโมงค์ลม −0.80; neutral point ~41 % MAC และ SM ~16 % ที่ CL 0.3 [LG8]'),
      CLmax_target: L({ UP: cl['0'].CLmax_1g, 'T/O': cl['15'].CLmax_1g, FULL: cl['40'].CLmax_1g }, '-', ['LG2', 'LG4', 'LM1'], 'กลาง', true, `ค่าประมาณ: 1 g trimmed ที่ 1,180 kg จาก V_S ของ AFM (KCAS 66/56/54) ด้วยวิธีความเร็วต่ำสุด nz 0.95 ของหัวข้อ 01; ทดสอบการบิน [LG7] ให้ static CLmax clean 1.25 (= 62 KCAS) ขัดกับ green arc 66 KIAS`),
      alpha_CLmax: card1180?.res?.stall ? E(Object.fromEntries(Object.entries(card1180.res.stall).map(([k, s]) => [DET_NAME[k] ?? k, r(s.alpha_deg, 3)])), 'deg', ['LG0', 'LM0'], 'มุมปะทะที่ CLmax ในการทดสอบ stall 1 kt/s ของซิม (lm_card, 1,180 kg) จาก aStall ที่แก้หา; ไม่มีค่าจากการวัด') : undefined,
    },
    flaps: {
      detents: L(dets, 'deg, kt IAS, -', ['LG1', 'LG2', 'LG4', 'LG7', 'LG0'], 'ต่ำ', true, 'ค่าประมาณ (dCL0, dCD0, dCm0): ชื่อตำแหน่ง UP / T/O / FULL ตาม checklist ของ AFM [LG3] (หัวตาราง S4-7 เขียนแฟลปขึ้นว่า 0°) ใช้ชื่อชุดนี้ในหัวข้อ 08 และ 09 ด้วย (D6); มุม 0/40° จาก TCDS, ตำแหน่ง T/O = 15° จากการทดสอบ stall [LG7] (AFM ไม่พิมพ์มุม); CLmax จาก V_S ของ AFM; VFE T/O 119 FULL 93 KIAS; แฟลปไฟฟ้าตั้งได้ต่อเนื่อง (ไม่มี detent กลไก) [LH21]'),
      transition_time_s: E(10, 's', ['LG0'], '0 → 40° แฟลปไฟฟ้า ไม่พบตัวเลข'),
    },
    gear_drag: { dCD0: E(0.012, '-', ['LG0'], 'ล้อพับเข้า sponson ใต้ลำตัว; ΔCD0 ของล้อลงเทียบเครื่องสองเครื่องยนต์เบา (0.010–0.020)') },
    stall_warning: {
      min_margin: L(5, 'kt', ['LM3'], 'กลาง', false, 'CS-23.207(c) ฐานรับรอง CS-23 amdt 0 (5 kt หรือ 5 %)'),
    },
  };
  if (!c.aero.static_long.alpha_CLmax) delete c.aero.static_long.alpha_CLmax;
  // derivatives
  if (D?.out) {
    const est = n => ({ cruise: r(D.out.cruise[n] ?? D.out.cruise.derivs?.[n] ?? D.out.cruise.body?.[n], 4), approach: r(D.out.approach[n] ?? D.out.approach.derivs?.[n] ?? D.out.approach.body?.[n], 4) });
    const ftv = { Cmq: F.ft.Cmq, Cmde: F.ft.Cmde, Clr: F.ft.lat.Clr, Cnp: F.ft.lat.Cnp, Clb: F.ft.lat.Clb, Clp: F.ft.lat.Clp, Cnb: F.ft.lat.Cnb, Cnr: F.ft.lat.Cnr, CYb: F.ft.lat.CYb,
      Cndr: F.ft.lat.Cndr, Cldr: F.ft.lat.Cldr, CYdr: F.ft.lat.CYdr, Clda: -F.ft.lat.Clda, Cnda: -F.ft.lat.Cnda };
    const der = {};
    for (const n of ['CLq', 'CLadot', 'CLde', 'CYb', 'CYdr', 'CYr', 'Clb', 'Clp', 'Clr', 'Clda', 'Cldr', 'Cmq', 'Cmadot', 'Cmde', 'Cnb', 'Cnp', 'Cnr', 'Cnda', 'Cndr']) {
      const e = est(n), ch = DERIV_CHOICE[n];
      const cmp = ftv[n] != null ? ` · การบิน [LG7] ${ftv[n]}` : '';
      const flip = (n === 'Clda' || n === 'Cnda') ? -1 : 1;   // [LG7] aileron sign is opposite to AC (da+ = roll right)
      const wt = F.ft.WT[n] != null ? ` · อุโมงค์ลม ${flip * F.ft.WT[n]}` : '', se = F.ft.semi[n] != null ? ` · semi-empirical ${flip * F.ft.semi[n]}` : '';
      const conv = flip < 0 ? ' (ค่าของ [LG7] กลับเครื่องหมายให้ตรง AC แล้ว)' : '';
      if (ch === 'ft') der[n] = L(ftv[n], '1/rad', ['LG7'], 'กลาง', false, `parameter estimation จากการบิน 110 kt (Output Error) [LG7]; lm_derivs ให้ cruise ${e.cruise} approach ${e.approach}${wt}${se}`);
      else if (it?.deriv?.[n] != null) der[n] = E({ cruise: r(it.deriv[n].cruise, 4), approach: r(it.deriv[n].approach, 4) }, '1/rad', ['LM0', 'LG0', 'LG7'], `lm_derivs ปรับด้วย ${it.deriv[n].why}${cmp}${wt}${se}${conv}`);
      else der[n] = E(e, '1/rad', ['LM0', 'LG0'], `lm_derivs จากรูปทรง (หาง/พื้นบังคับเป็นค่าประมาณ)${cmp}${wt}${se}`);
    }
    der.CD0 = L(F.ft.CD0, '-', ['LG7'], 'กลาง', false, 'polar ทางอากาศพลศาสตร์ (ไม่รวมแรงต้านใบพัด idle) จาก parameter estimation; ICAS 2008: 0.024 (ประมาณ, มี winglet), trimmed 0.037; ซิมวันนี้ใช้ aero.legacy.CD0/K จาก glide');
    der.K = L(r(1 / (Math.PI * F.AR * F.ft.e_winglet), 4), '-', ['LG7', 'LG0'], 'กลาง', false, '1/(π A e), e 0.82 (มี winglet) [LG7]; ICAS 2008 ให้ e 0.83–0.84');
    c.aero.derivatives = der;
  }
  if (leg?.legacy?.aero) {
    const a = leg.legacy.aero;
    c.aero.legacy = E({ CL0: a.CL0, CLa: a.CLa, CLflap: r(a.CLflap, 4), CDflap: a.CDflap, CDgear: a.CDgear, Cm0: a.Cm0, Cma: a.Cma, Cmflap: a.Cmflap, aStall: a.aStall, aStallFlap: a.aStallFlap, CD0: a.CD0, K: a.K },
      'AC', ['LM0', 'LG0'], `lm_legacy_fit (static): polar จาก glide ${C.polar.Vbg_kcas} KCAS L/D ${C.polar.E_idle_at_Vbg} (ค่าประมาณ), aStall/aStallFlap แก้หาจาก CLmax 1 g, CLflap = ΔCL0 แฟลป 40° (f = 1); ใช้กับซิมวันนี้เท่านั้น`);
  }

  // ───────── interference
  const st = D?.out?.cruise?.static;
  c.interference = {
    downwash: {
      deda: st ? E(r(st.deda, 3), '-', ['LM0'], 'DATCOM ใน lm_derivs (ปีกสูง หางต่ำกว่าปีก)') : undefined,
      l_t: E(geoTail.l_h, 'm', ['LG0'], 'เท่ากับ airframe.tail.l_h'),
      VH: E(r(geoTail.S_h * geoTail.l_h / (F.S * F.MAC_tcds), 3), '-', ['LG0'], 'S_h l_t/(S c)'),
      a_t: st?.CLaH ? E(r(st.CLaH, 3), '1/rad', ['LM0'], 'lm_derivs') : undefined,
      eta_t: E(0.90, '-', ['LM0'], 'ค่าเริ่มต้นของหัวข้อ 01; หางอยู่นอกกระแสใบพัด (เครื่องยนต์บนปีกห่างลำตัว)'),
    },
    groundEffect: {
      A: L(F.AR, '-', ['LG2'], 'สูง', false, ''),
      rMac: E([0, r(0.42 * F.b / 2, 3), -0.45], 'm FRD', ['LG0'], 'c/4 ของ MAC: y ≈ 0.42 b/2, ปีกสูงกว่า CG ราว 0.45 m (h/b ใหญ่ ผล ground effect น้อยกว่าปีกต่ำ)'),
      CLa_w: st?.CLaW ? E(r(st.CLaW, 3), '1/rad', ['LM0'], 'lm_derivs') : undefined,
    },
    slipstream: {
      diskDiameter: L(F.D_prop, 'm', ['LG1'], 'สูง', false, 'ต่อใบพัด (สองใบพัด)', 'propeller'),
      hubPos: E([[1.89, -1.65, -0.29], [1.89, 1.65, -0.29]], 'm FRD', ['LG0'], 'ดุมใบพัดราว x −1.55 m DAT, y ±1.65 m; หางระดับและหางดิ่งอยู่นอกกระแสใบพัด'),
      sense: L(1, '-', ['LG1'], 'สูง', false, 'ทั้งสองใบพัดหมุนตามเข็มนาฬิกาเมื่อมองจากที่นั่งนักบิน (ไม่ใช่ counter-rotating) ⇒ เครื่องซ้ายเป็น critical engine', 'propeller'),
      finArea: E(geoTail.S_v, 'm2', ['LG0'], 'เท่ากับ airframe.tail.S_v (ปรับให้ Cnβ = 0.050)'), finArm: E(geoTail.l_v, 'm', ['LG0'], 'เท่ากับ airframe.tail.l_v'), eta_v: E(0.90, '-', ['LM0'], 'ค่าเริ่มต้นของหัวข้อ 01; ครีบอยู่นอกกระแสใบพัด'),
    },
  };
  for (const g2 of Object.values(c.interference)) for (const k of Object.keys(g2)) if (g2[k] === undefined) delete g2[k];

  // ───────── speeds
  const ias = (v, note, src = ['LG2'], conf = 'สูง') => L(v, 'kt IAS', src, conf, false, note);
  c.speeds = {
    VS0_kt: ias(53, 'แฟลป FULL ล้อลง idle 1,180 kg CG 22 % มุมเอียง 0° = 54 KCAS (AFM p5-5); white arc ล่าง 53 KIAS; 1,230 kg: 54/55; โบรชัวร์ 55 KCAS', ['LG4', 'LG2', 'LG6'], 'กลาง'),
    VS1_kt: ias(66, 'green arc ล่าง = VS1 แฟลป 0 ที่ MTOW (AFM p2-7); ตารางแฟลป 0 อ่านไม่ได้ในสำเนา; ขัดกับการทดสอบบิน CLmax 1.25 (≈ 62 KCAS) [LG7] และ final แฟลปขึ้น 82 kt [LG10]', ['LG2', 'LG7'], 'กลาง'),
    VS_TO_kt: ias(56, 'แฟลป T/O = 56 KCAS (AFM p5-5)', ['LG4'], 'กลาง'),
    VX_kt: ias(73, '1,180 kg แฟลป 0 (AFM p S4-7); 72 ที่ 1,230 kg', ['LG3']),
    VY_kt: ias(80, 'ค่าเดียวของบัตร: 80 KIAS (41.2 m/s) แฟลป UP ที่ 1,180 kg (ใช้กับมวลฝึก 1,128 kg) จากตารางความเร็วของ AFM p S4-7 [LG3]; 84 ที่ 1,230 kg; ค่าอื่นในเอกสาร: บท 3 (p 3-46 ของไฟล์ส่วนที่ 1 [LG2], S3-56 ของไฟล์ส่วนที่ 2) ให้ 83 KIAS ซึ่งเป็นความเร็ว best glide (= VG_kt) หัวข้อ 09 ควรอ้าง 80 สำหรับไต่ใน pattern และ go-around', ['LG3'], 'กลาง'),
    VR_kt: ias(64, 'แฟลป T/O 1,180 kg (S4-7); 65 ที่ 1,230 kg; AFM 1st ed: lift-off 66.5 KIAS บนหญ้า', ['LG3', 'LG5']),
    VAPP_kt: ias(70, 'final approach แฟลป FULL 70 KIAS (36.0 m/s) คอลัมน์ 1,180 kg ของ S4-7 ใช้กับมวลฝึก 1,128 kg [LG3]; 71 ที่ 1,230 kg; approach แฟลป T/O 90 KIAS (downwind); บัตรเป็นเจ้าของค่านี้ (D1) หัวข้อ 08 และ 09 อ้างจากที่นี่', ['LG3']),
    VREF_kt: ias(70, 'AFM ไม่ใช้คำว่า VREF; ใช้ final approach speed แฟลป FULL 70 KIAS ที่คอลัมน์ 1,180 kg (มวลฝึก 1,128 kg) (= 1.3 × 54 KCAS = 70.2); แตะพื้น 65 KIAS; VAPP = VREF (D1)', ['LG3', 'LG0'], 'กลาง'),
    VG_kt: ias(83, 'best glide แฟลป UP 83 KIAS (42.7 m/s) ที่ 1,180 kg, 84 ที่ 1,230 kg (บท 3: p 3-46 [LG2], S3-56 [LG3]) บท 3 เรียกความเร็วนี้ว่า VY แต่บัตรใช้ VY_kt 80 KIAS จากตาราง S4-7 และเก็บ 83 เป็น best glide', ['LG2', 'LG3'], 'กลาง'),
    VA_kt: ias(119, 'TCDS 119/117 KCAS (1,180 kg); AFM p2-5/2-19 ให้ 118 — ขัดกัน 1 kt; 122 ที่ 1,230 kg', ['LG1', 'LG2']),
    VNO_kt: ias(135, 'TCDS 135/134 KCAS (AFM 133 KCAS); 138 ที่ 1,230 kg', ['LG1', 'LG2']),
    VNE_kt: ias(167, '168 KCAS; 171 ที่ 1,230 kg', ['LG1', 'LG2']),
    VLE_kt: ias(93, '92 KCAS; MOD2006/033 เพิ่มเป็น 122 KIAS', ['LG1', 'LG2']),
    VLO_kt: ias(93, 'เหมือน VLE', ['LG1', 'LG2']),
    VFE: L({ 'T/O': 119, FULL: 93 }, 'kt IAS', ['LG1', 'LG2'], 'สูง', false, 'T/O 119/117 KCAS, FULL 93/92 KCAS; 1,230 kg: T/O 122'),
    VMCA_kt: ias(62, 'แฟลป T/O, 62 KCAS; red line (AFM p2-7, TCDS)', ['LG1', 'LG2']),
    VYSE_kt: ias(80, 'blue line ระดับน้ำทะเล 1,180 kg; 84 ที่ 1,230 kg (AFM p3-24)', ['LG2']),
    VXSE_kt: ias(79, '1,180 kg; 83 ที่ 1,230 kg (AFM p3-24)', ['LG2']),
    VSSE_kt: ias(70, 'safe single-engine speed สำหรับการฝึก ไม่ขึ้นกับน้ำหนัก (AFM S4-8)', ['LG3']),
    ias_cas: L({ UP: [[75, 74], [93, 92], [119, 117], [135, 134], [167, 168]], 'T/O': [[56, 56], [57, 57], [60, 60], [67, 67], [81, 79], [119, 117]], FULL: [[53, 54], [54, 55], [58, 58], [64, 64], [78, 76], [93, 92]] }, 'KIAS→KCAS', ['LG1', 'LG4', 'LG5'], 'ต่ำ', false,
      'จุดจากตาราง stall (แฟลป T/O และ FULL) และขีดจำกัดใน TCDS; แฟลป UP ใช้ตัวอย่างกราฟ 75→74 KIAS (กราฟเต็มเป็นรูปภาพ) และ VLE/VA/VNO/VNE; ต่ำกว่า 75 KIAS แฟลป UP ไม่มีจุด (ซิมใช้ค่าปลายสุด)'),
    stall_table: L({ axes: { flap: ['T/O', 'FULL'], bank_deg: [0, 15, 30, 45, 60] }, data: [F.stall.TO, F.stall.FULL], note_1230: [F.stall1230.TO, F.stall1230.FULL] }, '[KIAS, KCAS]', ['LG4'], 'กลาง', false,
      '1,180 kg CG 22 % idle ล้อลง (AFM p5-5, อ่านจากข้อความที่สกัดจากสำเนาออนไลน์; ป้ายคอลัมน์มุมเอียงอนุมานจากอัตราส่วน 1/√cos φ ซึ่งตรงทุกช่อง ≤ 0.6 %); note_1230 = หน้า W5-5 รุ่น 1,230 kg'),
    stall_altitude_loss_ft: L(F.stallAltLoss_ft, 'ft', ['LG5'], 'กลาง', false, `ความสูงที่เสียสูงสุด ${F.stallAltLoss_ft} ft (${Math.round(F.stallAltLoss_ft * 0.3048)} m) ระหว่าง stall และการแก้แบบปกติ มุมเอียง < 30° (AFM p5-5)`),
    stall_warning_margin_kt: E(5, 'kt', ['LM3', 'LG0'], 'ใช้เกณฑ์ขั้นต่ำของฐานรับรอง CS-23.207(c) amdt 0 (เตือนก่อน stall อย่างน้อย 5 kt หรือ 5 % ของความเร็ว stall แล้วแต่ค่าไหนมากกว่า); ส่วนที่อ่านได้ของ AFM ไม่บอก margin จริงของระบบเตือนของ P2006T', 'ต่ำ'),
    crosswind_demonstrated_kt: L(F.xwind_kt, 'kt', ['LG4', 'LG5'], 'สูง', false, 'maximum demonstrated crosswind (AFM p5-6)'),
    icao_approach_category: L('A', '-', ['LG0'], 'สูง', false, 'Vat = 1.3 VS0 ≈ 70 kt < 91 kt (ICAO Doc 8168)'),
  };

  // ───────── performance
  c.performance = {
    ROC_SL_fpm: L(r(C.climb.enroute_15C, 4), 'fpm', ['LG4', 'LG0'], 'ต่ำ', true, `ค่าประมาณ: แถวแรกของตาราง en-route rate of climb (−25/0/25 °C = 1,392/1,205/1,038 fpm) ประมาณเชิงเส้นที่ 15 °C; ป้ายแถวและมวลอ่านไม่ได้ในสำเนา (อนุมานว่าระดับน้ำทะเล 1,180 kg); โบรชัวร์ 1,036 fpm (1,230 kg), Flying ~1,050, AOPA ~1,140`),
    ROC_table: L({ axes: { row: ['SL?', '2000?', '4000?', '6000?', '8000?', '10000?', '12000?', '14000?'], OAT_C: [-25, 0, 25] }, enroute: [[1392, 1205, 1038], [1249, 1066, 901], [1108, 927, 766], [966, 789, 630], [826, 651, 495], [685, 514, 361], [545, 377, 227], [406, 241, 93]], takeoff: [[1347, 1154, 982], [1200, 1010, 841], [1054, 867, 701], [908, 725, 561], [763, 583, 422], [618, 441, 283], [473, 300, 145], [330, 159, 7]], vtbd_35C_extrap: { enroute: C.climb.enroute_35C, takeoff: C.climb.takeoff_35C } }, 'fpm', ['LG4', 'LG0'], 'ต่ำ', true,
      'ค่าประมาณ (ป้ายแถว): ตัวเลขจากข้อความที่สกัดจากหน้า "Take-off rate of climb" และ "Enroute rate of climb" ของ AFM ฉบับที่ 4; ป้ายความสูงทีละ 2,000 ft และมวล 1,180 kg เป็นการอนุมาน; จุด VTBD 35 °C ต่อเส้นตรง (ตารางมีถึง 25 °C)'),
    service_ceiling_ft: L(14000, 'ft', ['LG1'], 'กลาง', false, 'maximum operating altitude (TCDS p.7) ไม่ใช่ service ceiling; OEI ceiling 7,500 ft [LG9]'),
    oei: L({ ROC_fpm: F.fly.rocOEI, ceiling_ft: F.fly.ceilOEI, ROC_800ft_winglet_fpm: 300 }, 'fpm, ft', ['LG9', 'LG7', 'LG8'], 'กลาง', false, 'Flying 2011: ราว 250 fpm และเพดาน OEI 7,500 ft (ตัวเลขที่ผู้ผลิตประกาศ ไม่บอกมวล/อุณหภูมิ); สไลด์ [LG7] 169 → 300 fpm ที่ 800 ft ก่อน/หลังติด winglet (สไลด์ไม่ได้เขียนว่า OEI แต่บริบทคือการไต่เครื่องเดียว); ICAS 2008 §4.4: OEI 160 → 300 fpm ที่ MTOW'),
    cruise_table: L([{ ktas: 142, h_ft: 3500, oat_c: -8, map_inhg: 25, pct: 75, src: 'LG10' }, { ktas: 151, map_inhg: 26, note: 'max power', src: 'LG10' }, { ktas: 150, mass_kg: 1180, note: 'max level speed', src: 'LG8' }, { ktas: 145, note: 'max cruise (brochure)', src: 'LG6' }], 'kt TAS', ['LG10', 'LG8', 'LG6'], 'ต่ำ', false, 'ตาราง cruise ของ AFM เป็นรูป (อ่านไม่ได้); จุดจากบทความทดสอบบินและเอกสารผู้ผลิต'),
    glide: E({ speed_kt: 83, ratio: C.polar.E_idle_at_Vbg }, 'kt IAS, -', ['LG3', 'LG7', 'LG0'], `ความเร็ว best glide 83 KIAS (AFM S3-56 ซึ่งเรียกว่า VY; VY_kt ของบัตรคือ 80 จาก S4-7); L/D ไม่มีใน AFM: polar ทดสอบบิน CD0 0.0334 e 0.82 ให้ L/D ${C.polar.E_aero_at_Vbg} ที่ ${C.polar.Vbg_kcas} KCAS แล้วบวกแรงต้านใบพัด idle สองใบ ΔCD ${C.polar.dCDidle} ⇒ ${C.polar.E_idle_at_Vbg} (ช่วง ${C.polar.E_range.join('–')})`),
    takeoff: L({ ground_roll_m: F.bro.toRun, over50ft_m: F.bro.toDist }, 'm', ['LG6'], 'ต่ำ', false, 'โบรชัวร์ 2021 รุ่น MTOW 1,230 kg ไม่ระบุสภาพ (อนุมาน ISA SL ลมสงบ ทางแข็ง, 394 m อนุมานว่าเป็นระยะถึง 50 ft); AFM: แฟลป T/O, lift-off 66.5 KIAS, หญ้า, ทางแข็ง −6 %'),
    landing: L({ ground_roll_m: F.bro.ldgRun, over50ft_m: F.bro.ldgDist }, 'm', ['LG6'], 'ต่ำ', false, 'โบรชัวร์ 2021 (1,230 kg ไม่ระบุสภาพ); AFM: แฟลป FULL idle short final 67 KIAS'),
    takeoff_table: L({ oat_c: -25, rows: [{ h_ft: 0, ground_roll_m: 148, over50ft_m: 193 }, { h_ft: 1000, ground_roll_m: 165, over50ft_m: 216 }, { h_ft: 2000, ground_roll_m: 184, over50ft_m: 241 }], corrections: { headwind_m_per_kt: -2.5, tailwind_m_per_kt: 10, paved_pct: -6, upslope_pct_per_pct: 5 } }, 'm', ['LG4', 'LG5'], 'ต่ำ', false,
      'ชิ้นส่วนเดียวที่อ่านได้ของตาราง take-off ฉบับที่ 4 (คอลัมน์ −25 °C, มวลไม่ทราบ) และตัวแก้ของฉบับที่ 1 (p5-9); จุด VTBD ร้อนไม่มีในสำเนา'),
    landing_corrections: L({ headwind_m_per_kt: -3.5, obstacle_m_per_kt: -5, final_kias: 67 }, 'm/kt', ['LG5'], 'กลาง', false, 'AFM 1st ed p5-11 (หญ้า แฟลป FULL)'),
    fuel: L({ usable_L: F.fuelUsable_L, ff_per_engine: { MCP_gph: 5, pct75_gph: 4, icas_lph: 19 }, total_cruise_gph: F.fly.gph, fuel_types: 'MOGAS RON95 (EN 228) หรือ AVGAS 100LL' }, 'L, US gal/h', ['LG1', 'LG10', 'LG9', 'LG8'], 'กลาง', false, ''),
  };
  // gap 16 (19 Nov 2026): VTBD hot-day (35 °C, SL) estimates where the AFM copy has no hot-day column
  { const sig = 288.15 / 308.15, lap = C.engine.lapse_VTBD_35C, fTO = sig ** (-4 / 3) * lap ** (-2 / 3), fLD = 1 / sig;
    c.performance.takeoff_table.v.vtbd_hot_estimate = { OAT_C: 35, elev_ft: 9, mass_kg: 1230, ground_roll_m: Math.round(F.bro.toRun * fTO), over50ft_m: Math.round(F.bro.toDist * fTO), factor: r(fTO, 4) };
    c.performance.takeoff_table.est = true; c.performance.takeoff_table.note = `ค่าประมาณ (เฉพาะ vtbd_hot_estimate): ${c.performance.takeoff_table.note}; จุด VTBD 35 °C สเกลระยะของโบรชัวร์ (${F.bro.toRun} / ${F.bro.toDist} m, 1,230 kg [LG6]) ด้วย σ^(−4/3) × (P/P0)^(−2/3) = ${r(fTO, 4)} (σ ${r(sig, 3)}, กำลัง Rotax ที่ 35 °C ${r(lap, 3)} ของพิกัดตาม §01.6.1; แรงขับสถิต ∝ (ρP²)^(1/3))`;
    c.performance.landing_table = E({ vtbd_hot_estimate: { OAT_C: 35, elev_ft: 9, mass_kg: 1230, ground_roll_m: Math.round(F.bro.ldgRun * fLD), over50ft_m: Math.round(F.bro.ldgDist * fLD), factor: r(fLD, 4) } }, 'm', ['LG6', 'LG5', 'LG0'],
      `ตารางลงจอดของ AFM อ่านไม่ได้ในสำเนา (มีเฉพาะตัวแก้ p5-11 [LG5]); สเกลระยะของโบรชัวร์ (${F.bro.ldgRun} / ${F.bro.ldgDist} m, 1,230 kg [LG6], สภาพไม่ระบุ อนุมาน ISA SL) ด้วย 1/σ = ${r(fLD, 4)} (IAS เท่าเดิม ⇒ TAS² ∝ 1/σ) ที่ 35 °C ระดับน้ำทะเล`); }
  // gap 16: performance.tests carries the same rows as the §12.11 table (origin, current model, pass)
  const card0 = rd('lg_card.json');
  c.performance.tests = L(T?.tests ? T.tests.map(t => ({ case: t.id, conditions: t.cond, quantity: t.qty, expected: t.expected, tolerance: t.tol, origin: t.origin, current_model: t.current, pass: t.pass })) : testsList(C, card0), 'ตามช่อง quantity ของแต่ละแถว', ['LG0'], 'กลาง', false,
    `จุดเป้าสำหรับทดสอบอัตโนมัติ (ตาราง §12.11 สร้างจาก scripts/lg_tests.mjs)${T?.summary ? `: ${T.summary.n} กรณี ผ่าน ${T.summary.pass} ไม่ผ่าน ${T.summary.fail} ไม่รองรับในซิมวันนี้ ${T.summary.na}` : ''}`);

  // ───────── propulsion, piston, propeller
  const lp = leg?.legacy?.propulsion;
  c.propulsion = {
    layout: E([{ id: 1, pos: [1.89, -1.65, -0.29], axis: [1, 0, 0], type: 'piston', model: 'Rotax 912 S3', prop_sense: 1 }, { id: 2, pos: [1.89, 1.65, -0.29], axis: [1, 0, 0], type: 'piston', model: 'Rotax 912 S3', prop_sense: 1 }], 'm FRD', ['LG1', 'LG0'],
      'ตำแหน่งดุมใบพัดเป็นค่าประมาณ (y ±1.65 m เพื่อให้ปลายใบห่างลำตัว); ทิศหมุนจาก TCDS (clockwise pilot\'s view ทั้งสองข้าง)'),
  };
  c.propulsion.legacy = E({ P: 2 * F.P_TO_kW * 1000, eta: lp ? lp.eta : 0.80, T0: Math.round(C.prop.static.T_total_N), idle: lp ? lp.idle : 0 }, 'W, -, N, -', ['LM0', 'LG0'], `lm_legacy_fit (static): P = 2 × 73.5 kW, T0 = แรงขับสถิตรวมจาก BEM (${C.prop.static.T_total_N} N), Vc fit ให้ ROC ${r(C.climb.enroute_15C, 4)} fpm ที่ VY 80 KIAS; idle 0 เพราะ polar มาจาก glide ที่ idle`);
  c.piston = {
    identity: L({ model: 'BRP-Rotax 912 S3', kind: 'carb', displacement_L: F.rotax.disp_L, cylinders: 4, tcds: 'EASA TCDS E.121', gear_ratio: 2.43, bore_mm: 84, stroke_mm: 61 }, '-', ['LG1', 'LG2', 'LG11'], 'สูง', false, 'สี่สูบนอน ระบายความร้อนหัวสูบด้วยน้ำ ตัวสูบด้วยอากาศ คาร์บูเรเตอร์ 2 ตัว (carb heat ใน checklist [LG3])', 'engine'),
    ratings: L({ P_rated: F.P_TO_kW * 1000, rpm_rated: F.rpmPropTO, P_mcp: F.P_MCP_kW * 1000, rpm_mcp: F.rpmPropMCP, rpm_redline: F.rpmPropTO, engine_rpm_rated: F.rpmEngTO, engine_rpm_mcp: F.rpmEngMCP, takeoff_time_limit_s: 300, torque_max_Nm_engine: F.rotax.Tmax }, 'W, rpm (ใบพัด)', ['LG1', 'LG2', 'LG11'], 'สูง', false, 'ต่อเครื่อง: take-off 73.5 kW (98.6 hp) 5 นาที ที่ 5,800/2,388 rpm; ต่อเนื่อง 69.0 kW (92.5 hp) ที่ 5,500/2,265 rpm; แรงบิดสูงสุด 128 Nm ที่ 5,100 rpm', 'engine'),
    altitude: E({ model: 'ind_friction', f: 0.10, vtbd_35C: C.engine.lapse_VTBD_35C, gagg_vtbd_35C: C.engine.lapse_VTBD_35C_gf, at_8000ft_isa: C.engine.lapse_8000ft }, '-', ['LM0', 'LM17'], 'ไม่มี turbo; สูตรของหัวข้อ 01 §01.6.1', 'ต่ำ', 'engine'),
    fuel: E({ fuel: 'MOGAS RON95 / AVGAS 100LL', bsfc_g_per_kWh: { pct75_aopa: C.engine.bsfc_from_aopa75, icas_19lph_assumed75: C.engine.bsfc_from_icas } }, 'g/kWh', ['LG10', 'LG8', 'LG0'], 'BSFC จาก 4 gph/เครื่อง ที่ 75 % [LG10] และ 19 l/h [LG8] (สมมติ 75 %), ความหนาแน่น 0.72 kg/l', 'ต่ำ', 'engine'),
    dynamics: E({ tau_throttle_s: 0.3, I_engine: 0.6, friction_torque: null }, 's, kg m2', ['LG0'], 'ไม่พบ; I รวมใบพัดคอมโพสิต 2 ใบสะท้อนที่เพลาใบพัด (ค่าประมาณ)', 'ต่ำ', 'engine'),
  };
  c.propeller = {
    identity: {
      kind: L('constant_speed_feathering', '-', ['LG1', 'LG6'], 'สูง', false, 'hydraulic governor; full feathering', 'propeller'),
      model: L('MT-Propeller MTV-21-A-C-F/CF178-05', '-', ['LG1'], 'สูง', false, 'EASA TC P.101; ใบไม้/คอมโพสิต ดุมอะลูมิเนียม (AFM p1-6)', 'propeller'),
      nBlades: L(2, '-', ['LG1'], 'สูง', false, '', 'propeller'),
      diameter: L(F.D_prop, 'm', ['LG1', 'LG2'], 'สูง', false, '1,780 mm ห้ามตัดสั้น', 'propeller'),
      sense: L(1, '-', ['LG1'], 'สูง', false, 'clockwise (pilot\'s view) ทั้งสองข้าง', 'propeller'),
      hubPosition: E([[1.89, -1.65, -0.29], [1.89, 1.65, -0.29]], 'm FRD', ['LG0'], 'ดู propulsion.layout'),
      thrustAxis: E([1, 0, 0], '-', ['LG0'], 'ไม่พบมุมติดตั้ง'),
    },
    engineInterface: {
      maxShaftPower: L(F.P_TO_kW, 'kW', ['LG1', 'LG2'], 'สูง', false, 'ต่อเครื่อง 5 นาที', 'engine'),
      rpmGoverned: L(F.rpmPropTO, 'rpm', ['LG2'], 'สูง', false, 'รอบใบพัดสูงสุด (5,800 รอบเครื่อง); ต่อเนื่อง 2,265; cruise 1,900–2,250', 'engine'),
      gearRatio: L(2.43, '-', ['LG11', 'LG0'], 'สูง', false, '5,800/2,388 = 2.429', 'engine'),
    },
    governor: {
      rpmRange: L({ cruise: [1900, 2250], takeoff: F.rpmPropTO, mcp: F.rpmPropMCP }, 'rpm', ['LG3', 'LG2'], 'กลาง', false, 'checklist (S4-26) และขีดจำกัด', 'propeller'),
      featherRate: E(15, 'deg/s', ['LG0'], 'ไม่พบ; ค่าทั่วไปของ governor ไฮดรอลิกที่ feather ได้ในราว 4–6 s (ระยะ pitch ราว 60–80°)', 'ต่ำ', 'propeller'),
    },
    checks: {
      staticThrustISA: E(r(C.prop.static.T_each_N / 1000, 4), 'kN', ['LM0', 'LG0'], `ต่อใบพัด, BEM ของหัวข้อ 01 (รูปทรงใบเป็นค่าประมาณ) β75 ${C.prop.static.beta75}°, FM ${C.prop.static.FM}; สองเครื่อง ${r(C.prop.static.T_total_N / 1000, 4)} kN`, 'ต่ำ', 'propeller'),
      peakEfficiency: E(C.prop.cruise75.eta, '-', ['LM0', 'LG0'], `cruise 142 KTAS 75 % 2,250 rpm J ${C.prop.cruise75.J}; installed 0.70–0.82 จากการทดสอบบิน [LG7]`, 'ต่ำ', 'propeller'),
      climbEfficiency: E(C.prop.climb80.eta, '-', ['LM0', 'LG0'], 'BEM ที่ 80 kt MCP 2,265 rpm', 'ต่ำ', 'propeller'),
    },
  };

  // ───────── controls
  const tv = F.travel;
  c.controls = {
    architecture: L({ pitch: 'reversible', roll: 'reversible', yaw: 'reversible', trim: 'tab' }, '-', ['LG9', 'LG1'], 'กลาง', false, 'push-rod กับสลิงในห้องโดยสาร ไม่มี booster [LG9] (คำว่า reversible เป็นการตีความจากระบบกลไกล้วน แหล่งไม่ได้เขียนตรง ๆ); trim stabilator ด้วย tab (ล้อมือ; trim ไฟฟ้าเป็นอุปกรณ์เลือกติดพร้อม autopilot S-TEC 55X หรือติดแยก), rudder trim tab ไฟฟ้า [LG9]'),
    surfaces: {
      elevator: L({ travel_deg: { up: tv.stab.up, down: tv.stab.down } }, 'deg', ['LG1', 'LG12'], 'กลาง', false, 'stabilator: TCDS p7 "15° ±2° to pitch up / 4° ±2° to pitch down" (ขอบท้ายขึ้น 15° / ลง 4°); AFM p1-6 [LG12] พิมพ์ว่าขอบท้าย Up 4° Down 15° — ขัดกัน; ใช้ TCDS เพราะเป็นเอกสารรับรองและซิมต้องใช้ขอบท้ายขึ้นเกิน 4° เพื่อ trim approach (6.9°)'),
      aileron: L({ travel_deg: { up: tv.ail.up, down: tv.ail.down } }, 'deg', ['LG1', 'LG2'], 'สูง', false, '±2°'),
      rudder: L({ travel_deg: { left: tv.rud, right: tv.rud } }, 'deg', ['LG1', 'LG2'], 'สูง', false, '±2°'),
      flap: L({ travel_deg: { up: 0, down: tv.flapFull }, positions: [{ name: 'UP', flap_deg: 0 }, { name: 'T/O', flap_deg: 15 }, { name: 'FULL', flap_deg: tv.flapFull }] }, 'deg', ['LG1', 'LG7', 'LG3'], 'กลาง', false, 'ไฟฟ้า; ชื่อตำแหน่งตาม checklist ของ AFM [LG3] (D6); มุม T/O จาก [LG7]'),
      trim_tab: L({ travel_deg: { up: tv.stabTab.up, down: tv.stabTab.down }, rudder_tab: { left: tv.rudTab, right: tv.rudTab } }, 'deg', ['LG1', 'LG2'], 'สูง', false, ''),
    },
    trim: { kind: L('stabilator tab: manual wheel (+ electric optional); rudder tab: electric', '-', ['LG9', 'LH22'], 'กลาง', false, 'ล้อ trim ใหญ่ระหว่างที่นั่ง; trim ไฟฟ้าของ stabilator เป็นอุปกรณ์เลือกติด; สวิตช์ rudder trim ไฟฟ้าอยู่ซ้ายบนของคันบังคับ [LG9]'), rate_dps: E(1.0, 'deg/s', ['LG0'], 'สำหรับปุ่มของซิม') },
    pitch: {
      architecture: L({ kind: 'reversible', input: 'force' }, '-', ['LG9'], 'กลาง', false, 'push-rod'),
      S_e: E(geoTail.S_h, 'm2', ['LG0'], 'stabilator ทั้งชิ้น = airframe.tail.S_h'), eta_t: E(0.9, '-', ['LM0'], 'เท่ากับ interference.downwash.eta_t (ค่าเริ่มต้นของหัวข้อ 01)'),
      a_t: st?.CLaH ? E(r(st.CLaH, 3), '1/rad', ['LM0'], 'lm_derivs') : undefined,
      l_t: E(geoTail.l_h, 'm', ['LG0'], 'เท่ากับ airframe.tail.l_h'), tab_max: L(tv.stabTab.down, 'deg', ['LG1'], 'สูง', false, 'ลง 19 / ขึ้น 2'),
      stops: L({ teu: tv.stab.up, ted: tv.stab.down }, 'deg', ['LG1'], 'กลาง', false, 'TCDS'),
    },
    roll: { architecture: L({ kind: 'reversible', input: 'force' }, '-', ['LG9'], 'กลาง', false, 'Frise aileron [LG8]'), stops: L({ up: tv.ail.up, down: tv.ail.down, max_mean: 18.5 }, 'deg', ['LG1'], 'สูง', false, '') },
    yaw: { architecture: L({ kind: 'reversible', input: 'force' }, '-', ['LG9'], 'กลาง', false, ''), tab_max: L(tv.rudTab, 'deg', ['LG2'], 'สูง', false, 'rudder trim tab ไฟฟ้า ±20°'), stops: L({ max: tv.rud }, 'deg', ['LG1'], 'สูง', false, '') },
  };
  if (!c.controls.pitch.a_t) delete c.controls.pitch.a_t;

  // ───────── gear
  const xm = 0.75, xn = xm - F.wheelbase, hp = 1.05;   // m DAT (est), CG height parked est
  const Wn = F.MTOW * 9.80665 * (xm - xref) / (xm - xn);
  c.gear = {
    layout: L('tricycle_retract', '-', ['LG2', 'LG6', 'LG9'], 'สูง', false, 'ระบบ electro-hydraulic ปั๊มไฟฟ้าแบบกลับทางได้; ล้อหลักแบบ trailing link หมุน 90° พับเข้า sponson ข้างลำตัว; ลงฉุกเฉินด้วยแก๊สไนโตรเจนจากถัง [LG9]; ทิศพับของล้อหน้ายังไม่ได้ยืนยันจาก AFM Section 7'),
    retract: L({ time_s: 20, VLO_kt: 93, VLE_kt: 93 }, 's, kt IAS', ['LG3', 'LG10', 'LG1'], 'กลาง', false, 'TRANS light ดับภายในราว 20 s (S4-25); AOPA: ลงราว 20 s'),
    geometry: {
      nose_contact_body_extended: E([xFRD(xn), 0, hp], 'm FRD', ['LG2', 'LG0'], `แกนล้อหลักสมมติที่ +0.75 m DAT (หลัง CG อ้างอิง 0.42 m) ล้อหน้าอยู่หน้า 2.9 m (wheelbase จาก AFM); โหลดล้อหน้า ${r(100 * Wn / (F.MTOW * 9.80665), 3)} %`),
      main_contact_body_extended: E([[xFRD(xm), -F.track / 2, hp], [xFRD(xm), F.track / 2, hp]], 'm FRD', ['LG2', 'LG0'], 'track 2.0 m (AFM)'),
      cg_height_parked: E(hp, 'm', ['LG0'], 'ปีกสูง แต่ CG อยู่ใกล้พื้นห้องโดยสาร (เครื่องยนต์บนปีก)'),
    },
    tyre_main: { size: L({ size: '6.00-6' }, '-', ['LG2', 'LG6'], 'สูง', false, 'AFM p1-5') },
    tyre_nose: { size: L({ size: '5.00-5' }, '-', ['LG2', 'LG6'], 'สูง', false, 'AFM p1-5') },
    brakes: { antiskid: L(0, 'bool', ['LG0'], 'กลาง', false, 'ไม่มี anti-skid (เครื่องเบา CS-23); toe brake ไฮดรอลิกที่ล้อหลัก (ยังไม่ได้ยืนยันจาก AFM Section 7)') },
    steering: {
      mode: E({ type: 'pedal_linked', caster_with_diff_brake: true }, '-', ['LG0'], 'ล้อหน้าเลี้ยวด้วยแป้น rudder (ไม่ได้ยืนยันจาก AFM Section 7)'),
      pedal_max: E(15, 'deg', ['LG0'], 'ไม่พบ; ค่าทั่วไปของล้อหน้าที่ต่อกับแป้น rudder ของเครื่องเบา (±10–20°)'),
    },
  };

  // ───────── wind, input, validation
  c.wind = { wake: { b0_over_b: L(0.7854, '-', ['LC10'], 'กลาง', false, 'π/4 ปีกวงรี') } };
  c.input = { keyboard: { flap_notches: E(rd('lg_card.json')?.res?.stall ? Object.values(rd('lg_card.json').res.stall).map(s => s.f) : [0, r(fl.dCL0['15'] / fl.dCL0['40'], 3), 1], 'สัดส่วน AC.flaps', ['LG0'], 'UP 0° / T/O 15° / FULL 40° แปลงด้วย flapMap แบบ lift') } };
  c.validation = {
    trim_targets: {
      cruise: L({ ias_kt: 110, h_ft: 3000, gamma_deg: 0 }, 'kt, ft, deg', ['LG7', 'LG0'], 'กลาง', true, 'ค่าประมาณเฉพาะความสูง: 110 kt (56.6 m/s) คือสภาพการทดสอบโหมดพลวัตของ [LG7]; ความสูง 3,000 ft (914 m) ไม่ระบุในสไลด์จึงเลือกเอง'),
      approach: L({ ias_kt: 70, h_m: 300, gamma_deg: -3 }, 'kt, m, deg', ['LG3'], 'กลาง', false, 'final แฟลป FULL ล้อลง'),
    },
    reference_modes: {
      flight_110kt: L({ sp: F.ft.modes.sp, ph: F.ft.modes.ph, dr: F.ft.modes.dr }, 'rad/s, -, s', ['LG7'], 'กลาง', false, 'วัดจากการทดสอบบิน 110 kt: short period ωn 3.41 ζ 0.40 CAP 1.009 (Level 1 Class I-B); phugoid T 27 s ζ 0.09; Dutch roll ωn 2.00 ζ 0.26 T 3.25 s; มวลและ CG ระหว่างทดสอบไม่ระบุในสไลด์'),
    },
    takeoff_test: E({ flap: 'T/O', VR_kt: 64, theta_deg: 12 }, 'kt CAS, deg', ['LG3', 'LG0'], 'VR 64 KIAS แฟลป T/O (≈ KCAS ตามตาราง stall แฟลป T/O 15°); θ หมุน 12° (ไม่พบ; ใกล้ θ ของ Vy climb 15° ในซิม, ดู out/lg_tune.json)'),
    stall_test: E({ UP: 89, 'T/O': 76, FULL: 73 }, 'kt', ['LG0'], 'ความเร็วเริ่มต้น ≈ 1.35 V_S'),
  };
  // gap 18/20 (19 Nov 2026): validation.stick_force_targets — requirement band (the P2006T has control wheels/yokes [LG9]); the sim has no stick-force model
  { const nA = card1180?.res?.modes?.cruise?.nAlpha;
    if (nA) { const sb = stickForceBand({ nAlpha: nA, nL: 3.8, W_lb: F.MTOW / 0.45359237 });
      c.validation.stick_force_targets = L({ controller: 'wheel', ...sb }, 'lbf/g, N/g, g/rad, lbf, lbf/kt, N/kt', ['R1:C12', 'LM3', 'LC14', 'LG1', 'LG9'], 'ต่ำ', true,
        `ค่าประมาณ: ไม่ใช่ค่าที่วัดจาก P2006T แต่เป็นแถบเป้าหมายจากเกณฑ์ MIL-F-8785C Level 1 แบบ wheel (สูตรของ controls.requirements.mil8785c_fs_per_g_wheel_L1 รอบที่ 1 [R1:C12]: ขีดบน min(500/(n/α), 120) แต่ไม่ต่ำกว่า 120/(nL − 1), ขีดล่าง max(35/(nL − 1), 6)) ด้วย n/α ${sb.nAlpha_cruise_g_per_rad} g/rad ของบัตรที่ cruise 110 KCAS 3,000 ft MTOW 1,180 kg (lm_card) และ nL 3.8 (normal category [LG1]) กับพื้นขั้นต่ำจาก 14 CFR 23.155 แบบ wheel (แรงถึง limit load ≥ W/100 = ${sb.part23_155_force_lbf} lbf ⇒ ≥ ${sb.part23_155_min_gradient_lbf} lbf/g) [LM3]; แรงต่อ kt ขั้นต่ำ 1 lbf ต่อ 6 kt ตาม 14 CFR 25.173(c) ใช้เป็นแนวทาง [LC14]; P2006T ใช้คันบังคับแบบ yoke [LG9]; ซิมยังไม่มีแบบจำลองแรงที่คัน (T-LG-25)`); } }

  // ───────── _na
  const naNot = ['turboprop.*', 'turbofan.*', 'propeller.betaReverse.*', 'propeller.engineInterface.flightIdleShaftPower', 'propeller.engineInterface.rpmTransientLimit',
    'gear.brakes.antiskid_efficiency', 'gear.brakes.antiskid_efficiency_measured', 'gear.brakes.antiskid_slip_setpoint', 'gear.certification.part25_limit_descent', 'gear.certification.part25_friction_cap',
    'controls.reference_types.*', 'controls.pitch.derived_check', 'interference.groundEffect.tablesCheck', 'wind.discreteGust.cfr25_341_Fg', 'wind.wake.leaders',
    'numerics.*', 'validation.typicalModes.*', 'validation.currentModel.*', 'otherSims.*'];
  const naLater = ['aero.static_long.alpha_star', 'aero.static_long.alpha_star_neg', 'aero.static_long.a1', 'aero.static_long.CL_sep_at_alpha_star', 'aero.static_long.CDmax_90', 'aero.static_long.dCD_sep', 'aero.static_long.CmX', 'aero.static_long.table_clean',
    'aero.stall_warning.alpha_warn_5kt', 'aero.stall_warning.alpha_warn_design', 'aero.large_beta.*',
    'aero.elevator_fade.*', 'aero.separation_dynamics.*', 'aero.buffet.*', 'aero.spin_reference.*', 'aero.strip_wing.*',
    'interference.downwash.eps0', 'interference.downwash.CLadot', 'interference.downwash.Cmadot', 'interference.groundEffect.rEps',
    'interference.slipstream.hubRadius', 'interference.slipstream.kappa', 'interference.slipstream.immersionH', 'interference.slipstream.immersionV', 'interference.slipstream.kSwirl', 'interference.slipstream.zSwirl', 'interference.slipstream.finLiftSlope', 'interference.slipstream.blownSpanFactor', 'interference.slipstream.blownArea', 'interference.slipstream.kBlown', 'interference.slipstream.k_deda_power',
    'propeller.identity.massComplete', 'propeller.bladeGeometry.*', 'propeller.section.*', 'propeller.tables.*', 'propeller.inertia.*', 'propeller.governor.kGov', 'propeller.governor.pitchRateMax', 'propeller.governor.rpmOverspeed', 'propeller.governor.oilMinRpm', 'propeller.governor.betaFlightIdle', 'propeller.governor.betaFeather', 'propeller.feathered.*',
    'propeller.engineInterface.IreflectedEngine', 'propeller.checks.staticThrustVTBD31C', 'propeller.checks.momentumIdealStaticISA',
    'controls.pitch.S_e_check', 'controls.pitch.c_e', 'controls.pitch.gearing', 'controls.pitch.tau_e', 'controls.pitch.deda', 'controls.pitch.Ch0', 'controls.pitch.Ch_alpha', 'controls.pitch.Ch_delta', 'controls.pitch.Ch_tab', 'controls.pitch.trim_rate_flaps_down', 'controls.pitch.trim_rate_flaps_up', 'controls.pitch.breakout', 'controls.pitch.friction', 'controls.pitch.centring_spring', 'controls.pitch.rate_limit',
    'controls.roll.S_a_each', 'controls.roll.c_a', 'controls.roll.gearing', 'controls.roll.Ch_delta', 'controls.roll.Ch_alpha', 'controls.roll.tab_max', 'controls.roll.trim_rate', 'controls.roll.breakout', 'controls.roll.rate_limit',
    'controls.yaw.S_r', 'controls.yaw.c_r', 'controls.yaw.gearing', 'controls.yaw.Ch_delta', 'controls.yaw.Ch_beta', 'controls.yaw.slipstream_q_ratio', 'controls.yaw.trim_rate', 'controls.yaw.breakout', 'controls.yaw.rate_limit',
    'gear.strut_main.*', 'gear.strut_nose.*', 'gear.tyre_main.rated_load', 'gear.tyre_main.rated_pressure', 'gear.tyre_main.operating_pressure', 'gear.tyre_main.outside_diameter', 'gear.tyre_main.section_width', 'gear.tyre_main.rolling_radius', 'gear.tyre_main.k_vertical', 'gear.tyre_main.c_vertical', 'gear.tyre_main.cornering_stiffness_coef', 'gear.tyre_main.relaxation_length', 'gear.tyre_main.k_longitudinal', 'gear.tyre_main.mu_peak_dry', 'gear.tyre_main.mu_skid_ratio_dry', 'gear.tyre_main.mu_skid_ratio_wet', 'gear.tyre_main.wheel_inertia',
    'gear.tyre_nose.rated_load', 'gear.tyre_nose.rated_pressure', 'gear.tyre_nose.operating_pressure', 'gear.tyre_nose.outside_diameter', 'gear.tyre_nose.k_vertical', 'gear.tyre_nose.c_vertical', 'gear.tyre_nose.cornering_stiffness_coef', 'gear.tyre_nose.relaxation_length',
    'gear.brakes.force_limit_ratio', 'gear.brakes.pressure_rise_rate', 'gear.brakes.heat_sink_mass', 'gear.brakes.heat_sink_cool_tau', 'gear.brakes.fade_start_temp', 'gear.brakes.fade_full_temp',
    'gear.steering.caster_max', 'gear.steering.steer_rate', 'gear.steering.shimmy_lag', 'gear.certification.part23_limit_descent', 'gear.certification.part23_wing_lift_ratio', 'gear.certification.part23_min_load_factors', 'gear.certification.part23_reserve_drop_factor',
    'wind.wake.rc_over_b', 'wind.wake.trainerRollControl', 'wind.fFactor.trainerExcessTW', 'input.keyboard.interim_trim_rate_elevator', 'validation.classification', 'validation.procedures'];
  c._na = L([...naNot, ...naLater], '-', [], 'สูง', false,
    'ไม่ใช้กับแบบนี้ (กลุ่มแรก ' + naNot.length + ' รายการ): เครื่องลูกสูบ ไม่มี turboprop/turbofan, beta/reverse, transient limit แบบกังหัน; ไม่มี anti-skid; ไม่ใช่ Part 25; controls.reference_types และ wind.wake.leaders เป็นค่าของเครื่องโดยสาร; derived_check/tablesCheck/numerics/typicalModes/currentModel เป็นค่าของตัวซิมหรือเครื่องฝึกรอบที่ 1; otherSims เป็นของหัวข้อ 03 (ไม่มีโมเดล P2006T ใน JSBSim 1.3.3 แต่มีโมเดล FlightGear "Tecnam-P2006T" ใน FGMEMBERS บน GitHub สัญญาอนุญาต GPL-2.0 ที่หัวข้อ 03 ยังไม่ได้ตรวจ). '
    + 'เลื่อนไปทำเมื่อจำเป็น (กลุ่มที่สอง ' + naLater.length + ' รายการ): โมเดลแยกตัวหลัง stall, buffet, spin (ห้าม spin โดยเจตนา), strip wing, slipstream ละเอียด, รูปทรงใบพัดและ governor/feather ละเอียด, hinge moment และแรงที่คัน, ขาล้อ oleo ยาง และเบรกละเอียด ไม่มีข้อมูลสาธารณะของ P2006T; ถ้าต้องใช้ให้ยืมค่าบัตร 06 (DA42) หรือ 04 (C172S) ที่สเกลแล้วและติดป้ายค่าประมาณ (ดู §12.14)');
  // D4 (19 Nov 2026): scope by category through lm_lib.expectedScope (gear → gear, propeller.* → propeller, others as round 1)
  normaliseScopes(c);
  return { card, C };
}

export function testsList(C, card0) {
  return [
    { case: 'T-LG-01', conditions: 'stall แฟลป 0 ล้อขึ้น idle 1 kt/s MTOW 1,180 kg', quantity: 'V_SR KIAS', expected: 66, tolerance: 2 },
    { case: 'T-LG-02', conditions: 'stall แฟลป T/O 15° ล้อลง idle 1 kt/s 1,180 kg', quantity: 'V_SR KIAS', expected: 56, tolerance: 2 },
    { case: 'T-LG-03', conditions: 'stall แฟลป 40° ล้อลง idle 1 kt/s 1,180 kg', quantity: 'V_SR KIAS', expected: 53, tolerance: 2 },
    { case: 'T-LG-04', conditions: 'climb SL ISA เต็มกำลังสองเครื่อง clean ล้อขึ้น 1,180 kg', quantity: 'ROC max fpm', expected: Math.round(C.climb.enroute_15C), tolerance: 60 },
    { case: 'T-LG-05', conditions: 'ร่อน idle 3,000 ft clean 1,180 kg', quantity: 'L/D', expected: C.polar.E_idle_at_Vbg, tolerance: 0.6 },
  ];
}

export function blocks(card) {
  const id = 'p2006t', c = card[id];
  const groups = [['airframe', ['airframe']], ['aero', ['aero']], ['interference', ['interference']], ['speeds', ['speeds']], ['performance', ['performance']],
    ['propulsion + piston + propeller', ['propulsion', 'piston', 'propeller']], ['controls', ['controls']], ['gear', ['gear']], ['wind + input + validation', ['wind', 'input', 'validation']], ['_na', ['_na']]];
  const isLeaf = o => o && typeof o === 'object' && 'v' in o && 'scope' in o;
  const ser = (o, ind) => Object.entries(o).filter(([, v]) => v !== undefined).map(([k, v]) => isLeaf(v) ? `${ind}"${k}": ${JSON.stringify(v)}` : `${ind}"${k}": {\n${ser(v, ind + ' ')}\n${ind}}`).join(',\n');
  return groups.map(([title, keys]) => { const sub = {}; for (const k of keys) if (c[k]) sub[k] = c[k]; return `**บล็อก ${title}**\n\n\`\`\`json\n{\n "${id}": {\n${ser(sub, '  ')}\n }\n}\n\`\`\``; }).join('\n\n');
}

if (isMainModule(import.meta.url)) {
  const { card } = buildCard();
  const txt = blocks(card);
  for (const b of txt.match(/```json\n([\s\S]*?)```/g)) JSON.parse(b.slice(8, -3));
  if (process.argv.includes('--print')) console.log(txt);
  const md = fs.readFileSync(MD, 'utf8');
  const a = md.indexOf('<!-- LG_JSON_BEGIN -->'), b = md.indexOf('<!-- LG_JSON_END -->');
  if (a < 0 || b < 0) { console.error('markers LG_JSON_BEGIN/END not found in 12-p2006t.md'); process.exit(1); }
  fs.writeFileSync(MD, md.slice(0, a) + '<!-- LG_JSON_BEGIN -->\n' + txt + '\n' + md.slice(b));
  fs.writeFileSync(path.join(HERE, 'out', 'lg_card_object.json'), JSON.stringify(card));
  console.log('wrote JSON blocks into 12-p2006t.md');
}
