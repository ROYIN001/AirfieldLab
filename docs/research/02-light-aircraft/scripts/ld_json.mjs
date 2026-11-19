#!/usr/bin/env node
// ld_json.mjs — builds the JSON blocks of 05-da40.md (types da40ng, da40_180, da40d) from published values and from the
// outputs of the LM estimation tools, then splices them into the topic file between the markers
//   <!-- LD-JSON-START --> … <!-- LD-JSON-END -->
//   node scripts/ld_json.mjs            -> writes scripts/out/ld_json_blocks.md and updates ../05-da40.md
//   node scripts/ld_json.mjs --dry      -> only writes scripts/out/ld_json_blocks.md
// Inputs read when present (run the tools first; see 05-da40.md §05.9):
//   scripts/out/ld_derivs.json (lm_derivs da40ng --json), ld_inertia.json (ld_tools.mjs), ld_fit*.json (lm_legacy_fit),
//   ld_geom.json (ld_geom.mjs), ld_iascas.json (ld_iascas.mjs), ld_r1leaves.json (ld_r1leaves.mjs)
// Every leaf: {v,u,scope,src,conf,est,note} (schema-ext-r2 §1). Source codes refer to 05-da40.md §05.13.
import fs from 'node:fs';
import { clmaxFromStall } from './lm_polar.mjs';
import { inertiaFromRadii, RADII } from './lm_inertia.mjs';
const OUTDIR = new URL('./out/', import.meta.url);
const TOPIC = new URL('../05-da40.md', import.meta.url);
const rd = f => { try { return JSON.parse(fs.readFileSync(new URL(f, OUTDIR), 'utf8')); } catch { return null; } };
const geom = rd('ld_geom.json'), ias = rd('ld_iascas.json'), der = rd('ld_derivs.json'), inert = rd('ld_inertia.json');
const fitNG = rd('ld_fit_da40ng.json'), fit180 = rd('ld_fit_da40_180.json'), fitD = rd('ld_fit_da40d.json'), r1 = rd('ld_r1leaves.json');
const r = (x, n = 3) => (typeof x === 'number' ? +x.toPrecision(n) : x);
const rr = (x, d = 3) => (typeof x === 'number' ? +x.toFixed(d) : x);
const rd3 = (o) => (o && typeof o === 'object' ? Object.fromEntries(Object.entries(o).map(([k, v]) => [k, rd3(v)])) : rr(o, 3));

/** leaf helper */
function L(v, u, src, conf, est, note, scope = 'aircraft') { return { v, u, scope, src, conf, est, note }; }
const KT = 0.514444, LB = 0.45359237, HP = 745.69987, IN = 0.0254, FT = 0.3048;

// ───────────────────────── da40ng ─────────────────────────
const ng = {};
ng.airframe = {
  identity: L({ manufacturer: 'Diamond Aircraft Industries (TC holder: Diamond Aircraft Industries Inc., Canada)', model: 'DA 40 NG', variant: 'DA 40 NG (MÄM 40-662, MTOM 1310 kg)', engine: 'Austro Engine E4 (AE300) turbo-diesel, EECU/FADEC single lever', propeller: 'MT-Propeller MTV-6-R/190-69, 3 ใบ constant speed', seats: 4, category: 'normal', tc_ref: 'EASA TCDS EASA.IM.A.022 Issue 24 (Section D); state of design Transport Canada A-224' }, '-', ['LD1', 'LD5'], 'สูง', false, 'ปีกต่ำ cantilever โครงสร้าง composite ล้อสามล้อตายตัว หาง T, winglet เป็นอุปกรณ์เสริม [LD1 p.26]; ไม่มี DA 40 NG ในโรงเรียนพลเรือนไทย ผู้ใช้ในไทยคือผู้ใช้ทางทหาร [LS1][LS21]'),
  weights: {
    MTOW: L(1310, 'kg', ['LD1', 'LD2'], 'สูง', false, '2,888 lb เมื่อทำ MÄM 40-662 (ค่ามาตรฐานเดิม 1,280 kg / 2,822 lb) [LD1 p.31 note 8][LD2 p.2-16]'),
    MLW: L(1280, 'kg', ['LD1', 'LD2'], 'สูง', false, '2,822 lb กับ MÄM 40-574 / OÄM 40-334 / MÄM 40-662; มาตรฐานเดิม 1,216 kg (2,681 lb) [LD1 p.31]'),
    MRW: L(1314, 'kg', ['LD2'], 'สูง', false, 'AFM อนุญาตมวลบนลานจอดเกิน MTOM ได้ 4 kg เมื่อนับเที่ยวบินตั้งแต่ติดเครื่อง [LD2 p.2-18]'),
    MZFW: L(1265, 'kg', ['LD1'], 'สูง', false, '2,789 lb กับ MÄM 40-574/662 (มาตรฐานเดิม 1,200 kg) [LD1 p.31]'),
    min_flight_mass: L(940, 'kg', ['LD1', 'LD2'], 'สูง', false, '2,072 lb [LD2 p.2-16]'),
    BEW_typical: L(903, 'kg', ['LD4'], 'กลาง', false, 'ค่าโบรชัวร์ "without options" 1,991 lb [LD4]; ตัวอย่างใน AFM บท 6 = 900 kg ที่ 2.422 m DAT (อ่านผ่านโมเดล FlightGear ที่อ้างหน้า AFM [LB19]); เครื่องที่ติดอุปกรณ์จริงหนักกว่า'),
    max_fuel_usable: L(118, 'kg', ['LD1', 'LD4'], 'สูง', false, 'ถังพิสัยไกล 147.6 l (39 US gal) usable × Jet A-1 0.80 kg/l [LM19] (ถังมาตรฐาน 106.0 l = 85 kg) [LD1 p.28]'),
    useful_load: L(407, 'kg', ['LD4'], 'กลาง', false, 'โบรชัวร์ (MTOM − น้ำหนักเปล่าไม่มีอุปกรณ์เสริม) [LD4]'),
    training_mass: L({ kg: 1150, crew_kg: 170, fuel_l: 75, empty_kg: 920 }, 'kg', ['LD2', 'LD4'], 'ต่ำ', true, 'ค่าประมาณ: น้ำหนักเปล่าติดอุปกรณ์ ~920 kg + ครูฝึกและศิษย์ 2×85 kg + Jet A-1 75 l (60 kg) ≈ 1,150 kg; อยู่ในช่วง 940–1,310 kg [LD2 p.2-16]'),
  },
  cg: {
    datum: L('ระนาบ datum อยู่หน้าขอบหน้าของ stub-wing ที่ root rib 2.194 m (86.38 in); ปรับระดับด้วยลิ่ม 600:31 บนท่อลำตัวหน้าครีบหลัง', '-', ['LD1', 'LD2'], 'สูง', false, 'TCDS พิมพ์ "2.194 mm" ซึ่งคือ 2,194 mm [LD1 p.29][LD2 p.2-18]'),
    LEMAC: L(geom ? rr(geom.ng.LEMAC, 3) : 2.23, 'm DAT', ['LD2', 'LD1'], 'ต่ำ', true, 'ค่าประมาณ (scripts/ld_geom.mjs): ขอบหน้าที่ root rib 2.194 m + LE sweep 1° × ระยะ MAC จากแนวกลาง 2.63 m ของปีกเรียวตรงเทียบเท่า (taper 0.55) ≈ 87.8 in'),
    MAC: L(1.171, 'm', ['LD2'], 'สูง', false, '3 ft 10 in [LD2 p.1-5]'),
    envelope: L([[940, 2.40, 2.53], [1080, 2.40, 2.53], [1280, 2.46, 2.53], [1310, 2.469, 2.53]], 'kg, m DAT', ['LD1', 'LD2'], 'สูง', false, 'แถว [มวล, หน้าสุด, หลังสุด]; หน้าสุดเปลี่ยนเชิงเส้น 2.40 m (94.5 in) ที่ ≤1,080 kg ถึง 2.469 m (97.2 in) ที่ 1,310 kg; หลังสุด 2.53 m (99.6 in) ทุกมวล; คิดเป็น %MAC ≈ 14.6–20.5 % (หน้า) และ 25.7 % (หลัง) ด้วย LEMAC ค่าประมาณ [LD1 p.29]'),
    ref: L({ m_DAT: 2.47, pct_mac: geom ? rr(geom.ng.cg_pct.ref, 1) : 20.6 }, 'm DAT', ['LD1'], 'ต่ำ', true, 'ค่าประมาณ: CG อ้างอิงกลางช่วงที่มวลฝึก 1,150 kg (หน้าสุด 2.421, หลังสุด 2.53 m) ใช้เป็นจุดกำเนิด FRD และ inertia'),
  },
  wing: {
    S: L(13.244, 'm2', ['LD2'], 'สูง', false, '142.6 sq ft [LD2 p.1-5] (DA 40 รุ่นเดิม 13.54 m² [LD6])'),
    b: L(11.63, 'm', ['LD2', 'LD4'], 'สูง', false, '38 ft 2 in [LD2 p.1-5]'),
    MAC: L(1.171, 'm', ['LD2'], 'สูง', false, '[LD2 p.1-5]'),
    AR: L(10.223, '-', ['LD2'], 'สูง', false, '[LD2 p.1-5]'),
    taper: L(geom ? rr(geom.ng.taper, 2) : 0.55, '-', ['LD2'], 'ต่ำ', true, `ค่าประมาณ: ปีกเรียวตรงเทียบเท่าที่ให้ S, b, MAC ตาม AFM (ld_geom.mjs): c_root ${geom ? rr(geom.ng.c_root, 3) : '1.47'} m, c_tip ${geom ? rr(geom.ng.c_tip, 3) : '0.81'} m; ปีกจริงมี stub wing ตรงช่วงในแล้วเรียว`),
    sweep_c4_deg: L(geom ? rr(geom.ng.sweep_c4_deg, 1) : -0.6, 'deg', ['LD6'], 'ต่ำ', true, 'ค่าประมาณจาก LE sweep ≈ 1° [LD6 p.1-6] กับ taper เทียบเท่า'),
    dihedral_deg: L(5, 'deg', ['LD6'], 'กลาง', false, '"approx. 5°" ใน AFM DA 40 รุ่น IO-360 [LD6 p.1-6]; โครงปีกเดียวกับ NG (ยังไม่พบใน AFM NG)'),
    incidence_deg: L(1.0, 'deg', ['LB19'], 'ต่ำ', true, 'ค่าประมาณ: ไม่พบในเอกสารเผยแพร่; ค่า Aeromatic ของโมเดล FlightGear 1.0° [LB19] ใช้เพื่อ trim เท่านั้น'),
    twist_deg: L(-2, 'deg', ['LM10'], 'ต่ำ', true, 'ค่าประมาณ: washout ทั่วไปของปีก GA ไม่พบค่าจริง'),
    airfoil: L('Wortmann FX 63-137/20-W4', '-', ['LD2', 'LD6'], 'สูง', false, 'ปรับจาก FX 63-137 (หนา 13.7 %, โค้งมาก) [LD2 p.1-5]'),
    position: L('low', '-', ['LD1'], 'สูง', false, 'cantilever low wing (Section D p.26) [LD1 p.26]'),
    x_c4_root: L(2.55, 'm', ['LD1', 'LD2'], 'ต่ำ', true, 'ค่าประมาณ: ระยะจากจมูก (≈ 0 m DAT ตามโมเดล FlightGear [LB19]) ถึง c/4 ของคอร์ดโคน = 2.18 + 0.25 × 1.47 m (ใช้ใน lm_derivs สำหรับผลของลำตัว)'),
  },
  tail: {
    S_h: L(2.34, 'm2', ['LD2'], 'สูง', false, '25.2 sq ft [LD2 p.1-6]'),
    b_h: L(geom ? rr(geom.tail.b_h, 2) : 3.39, 'm', ['LD2'], 'ต่ำ', true, 'ค่าประมาณ: AR หางระดับ ≈ 4.9 (ภาพด้านบน) × S_h'),
    l_h: L(geom ? rr(geom.tail.l_h, 2) : 4.78, 'm', ['LD2'], 'ต่ำ', true, 'ค่าประมาณ: c/4 หางระดับบนยอดครีบ ≈ 7.30 m DAT ลบ c/4 MAC 2.52 m (ld_geom.mjs); V_H ≈ 0.72; โมเดล FlightGear (Aeromatic) ใช้ 6.0 m [LB19]'),
    S_v: L(1.60, 'm2', ['LD2'], 'สูง', false, '17.2 sq ft รวม rudder [LD2 p.1-6]'),
    h_h: L(0.116, '-', ['LD1'], 'ต่ำ', true, 'ค่าประมาณ h_H/b: หาง T อยู่สูงกว่าระนาบปีกต่ำราว 1.35 m (ความสูงเครื่อง 1.97 m) / b 11.63 m; ใช้ใน lm_derivs (downwash ที่หาง)'),
    z_v: L(0.60, 'm', ['LD2'], 'ต่ำ', true, 'ค่าประมาณ: จุดศูนย์กลางแรงของครีบเหนือแกนลำตัว'),
    b_v: L(1.30, 'm', ['LD2'], 'ต่ำ', true, 'ค่าประมาณจากความสูงเครื่อง 1.97 m และภาพด้านข้าง'),
    l_v: L(geom ? rr(geom.tail.l_v, 2) : 4.38, 'm', ['LD2'], 'ต่ำ', true, 'ค่าประมาณ: c/4 ครีบ ≈ 6.90 m DAT ลบ 2.52 m; V_V ≈ 0.046'),
    airfoil_h: L('ไม่เผยแพร่ (สมมาตร)', '-', ['LD2'], 'ต่ำ', true, 'ค่าประมาณ: หน้าตัดสมมาตร'),
    airfoil_v: L('ไม่เผยแพร่ (สมมาตร)', '-', ['LD2'], 'ต่ำ', true, 'ค่าประมาณ'),
    incidence_h_deg: L(-3.0, 'deg', ['LD6'], 'กลาง', false, '"approx. −3.0° relative to longitudinal axis" ใน AFM DA 40 [LD6 p.1-6]; ใช้กับ NG ด้วย (หางเดียวกัน)'),
  },
  surfaces: {
    elevator: L({ area_m2: 0.665, chord_ratio: 0.28, span_fraction: 1 }, '-', ['LD2'], 'กลาง', true, 'พื้นที่ 7.2 sq ft [LD2 p.1-6]; chord_ratio ค่าประมาณ = S_e/S_h'),
    aileron: L({ area_m2: 0.654, chord_ratio: 0.27, span_fraction: [0.72, 0.97] }, '-', ['LD2'], 'กลาง', true, 'พื้นที่รวมสองข้าง 0.654 m² [LD2 p.1-5]; chord ratio และตำแหน่งตามช่วงปีกเป็นค่าประมาณจากพื้นที่และภาพ'),
    rudder: L({ area_m2: 0.47, chord_ratio: 0.29, span_fraction: 1 }, '-', ['LD2'], 'กลาง', true, 'พื้นที่ 0.47 m² [LD2 p.1-6]; chord ratio ค่าประมาณ = S_r/S_v'),
    flap: L({ area_m2: 1.56, chord_ratio: 0.25, span_fraction: [0.10, 0.70] }, '-', ['LD2'], 'กลาง', true, 'พื้นที่รวม 1.56 m² [LD2 p.1-5]; chord ratio และช่วงเป็นค่าประมาณ'),
    trim_tab: L({ area_m2: null, chord_ratio: null, span_fraction: null, kind: 'tab บน elevator ขับด้วย Bowden cable' }, '-', ['LD6'], 'กลาง', false, 'ขนาดไม่เผยแพร่ [LD6 p.7-4]'),
  },
  geometry: {
    length: L(8.06, 'm', ['LD2', 'LD4'], 'สูง', false, '26 ft 5 in [LD2 p.1-5]'),
    span: L(11.63, 'm', ['LD2'], 'สูง', false, ''),
    height: L(1.97, 'm', ['LD2'], 'สูง', false, '6 ft 6 in'),
    wheelbase: L(1.68, 'm', ['LD2'], 'กลาง', false, '5 ft 6 in; 1.85 m ถ้าทำ MÄM 40-574 [LD2 p.1-6]; ข้อความ AFM รุ่นเดิมสลับกับ track ใน OCR [LD6 p.1-7] ส่วนโมเดล FlightGear วัดได้ 1.78 m [LB19]'),
    main_track: L(2.97, 'm', ['LD2'], 'กลาง', false, '9 ft 9 in [LD2 p.1-6]; FlightGear 2.89 m [LB19]'),
    prop_clearance: L(0.25, 'm', ['LD2'], 'ต่ำ', true, 'ค่าประมาณจากภาพ ไม่พบตัวเลข'),
    eye_pos_FRD: L([-0.07, -0.25, -0.75], 'm FRD', ['LB19'], 'ต่ำ', true, 'ค่าประมาณ: ที่นั่งหน้า 2.30 m DAT [LD8] (ตาอยู่หลังกว่าราว 0.1 m), y −0.25 m ที่นั่งซ้าย, ตาสูงกว่า CG ราว 0.75 m'),
    eye_height_static: L(1.65, 'm', ['LB19'], 'ต่ำ', true, 'ค่าประมาณ: CG สูงจากพื้นราว 0.85 m + 0.75 m + ยุบตัวล้อ'),
    fuselage_width: L(1.18, 'm', ['LD4'], 'ต่ำ', true, 'ค่าประมาณ (ห้องโดยสารกว้างราว 1.18 m ไม่พบตัวเลขในแหล่งปฐมภูมิ)'),
    fuselage_height: L(1.25, 'm', ['LD2'], 'ต่ำ', true, 'ค่าประมาณจากภาพ'),
  },
};
if (inert) ng.airframe.inertia = {
  Ixx: L(Math.round(inert.ng.Ixx), 'kg m2', ['LM15', 'LM8'], 'ต่ำ', true, `ค่าประมาณ: Roskam radii คลาส single_prop (Rx ${inert.radii.Rx}) × มวล ${inert.ng.m} kg, b 11.63 m (lm_inertia, ±30 %)`),
  Iyy: L(Math.round(inert.ng.Iyy), 'kg m2', ['LM15', 'LM8'], 'ต่ำ', true, `ค่าประมาณ: Ry ${inert.radii.Ry}, L 8.06 m`),
  Izz: L(Math.round(inert.ng.Izz), 'kg m2', ['LM15', 'LM8'], 'ต่ำ', true, `ค่าประมาณ: Rz ${inert.radii.Rz}`),
  Ixz: L(0, 'kg m2', ['LM15'], 'ต่ำ', true, 'ค่าประมาณ: ไม่ทราบ ตั้ง 0 ตาม lm_card DEFAULTS'),
  ref_mass: L(inert.ng.m, 'kg', ['LD2'], 'ต่ำ', true, 'มวลฝึก (ค่าประมาณ) ที่ CG อ้างอิง 2.47 m DAT'),
  radii: L({ Rx: inert.radii.Rx, Ry: inert.radii.Ry, Rz: inert.radii.Rz }, '-', ['LM15'], 'ต่ำ', true, 'ค่าคลาส single_prop ของ 01-methods §01.4 (ไม่ใช่ค่าเฉพาะ DA40)'),
  method: L('Roskam radii of gyration (lm_inertia.mjs) — ไม่มีค่าวัดของ DA40 เผยแพร่; โมเดล FlightGear ใช้ Ixx/Iyy/Izz 1,220/1,627/6,779 kg m² ที่ปรับตามความรู้สึก [LB19]', '-', ['LM15', 'LB19'], 'ต่ำ', true, 'ค่าประมาณ'),
};

// speeds
const iasNG = ias ? ias.ng : null;
ng.speeds = {
  VS0_kt: L(60, 'kt IAS', ['LD3', 'LD7'], 'กลาง', false, 'แฟลป LDG 1,310 kg ปีกระดับ idle; ≈ 58 KCAS (Diamond ระบุ stall landing config 58 KCAS ที่ MTOM [LD4]); 59 KIAS ที่ 1,200 kg [LD3]'),
  VS1_kt: L(66, 'kt IAS', ['LD3', 'LD7'], 'กลาง', false, 'แฟลป UP 1,310 kg; ตาราง: 58/61/64/66 KIAS ที่ 1,000/1,100/1,200/1,310 kg [LD3]'),
  VY_kt: L(72, 'kt IAS', ['LD3', 'LD7'], 'กลาง', false, 'best rate ถึงความสูงปลอดภัย แฟลป T/O [LD3]; ไต่แบบ cruise climb แฟลป UP 88 KIAS'),
  VR_kt: L(67, 'kt IAS', ['LD3'], 'กลาง', false, 'แฟลป T/O 1,280 kg; 56/58/61/65/67 KIAS ที่ 940/1,000/1,100/1,200/1,280 kg; V50 72 KIAS ที่ 1,280 kg [LD3]'),
  VAPP_kt: L(77, 'kt IAS', ['LD3'], 'กลาง', false, 'approach แฟลป LDG 1,280 kg (MLW); 66/68/72/76/76/77 ที่ 940/1,000/1,100/1,200/1,216/1,280 kg [LD3]'),
  VREF_kt: L(77, 'kt IAS', ['LD3'], 'กลาง', false, 'checklist เรียกความเร็ว approach นี้ว่า VREF (แฟลป LDG 1,280 kg) [LD3]; แฟลป T/O 78, UP 83'),
  VG_kt: L(88, 'kt IAS', ['LD2', 'LD3'], 'สูง', false, 'best glide แฟลป UP ใบพัดหมุนฟรี (ทุกมวล) [LD2 p.3-4]'),
  VA_kt: L({ 1080: 101, 1180: 108, 1310: 113 }, 'kt IAS', ['LD1', 'LD2'], 'สูง', false, 'AFM ใช้ vO (operating manoeuvring speed): 101 KIAS ถึง 1,080 kg, 108 KIAS 1,080–1,180 kg, 113 KIAS เกิน 1,180 kg [LD2 p.2-3][LD1 p.28]'),
  VNO_kt: L(130, 'kt IAS', ['LD1', 'LD2'], 'สูง', false, '[LD1 p.28]'),
  VNE_kt: L(172, 'kt IAS', ['LD1', 'LD2'], 'สูง', false, '[LD1 p.28]'),
  VFE: L({ TO: 110, LDG: 98 }, 'kt IAS', ['LD1', 'LD2'], 'สูง', false, '[LD1 p.28][LD2 p.2-3]'),
  ias_cas: L(iasNG ? { UP: iasNG.UP.table, TO: iasNG['T/O'].table, LDG: iasNG.LDG.table } : null, 'kt IAS -> kt CAS', ['LD3', 'LD4'], 'ต่ำ', true, 'ค่าประมาณ (scripts/ld_iascas.mjs): ตาราง calibration ของ AFM §5.3.1 เป็นภาพที่อ่านไม่ได้; ที่ stall ใช้ LDG 60 KIAS = 58 KCAS [LD3][LD4] และ UP/T-O จาก VREF = 1.3 VS (CAS) แล้วลดความต่างเป็นศูนย์ที่ 1.5 VS; รูปแบบ {detent: [[KIAS,KCAS],…]}'),
  stall_table: L({ axes: { mass_kg: [1000, 1100, 1200, 1310], flap: ['UP', 'TO', 'LDG'] }, data: [[58, 61, 64, 66], [54, 56, 60, 62], [55, 57, 59, 60]], bank_deg: 0 }, 'kt IAS', ['LD3'], 'กลาง', false, 'ปีกระดับ idle จาก checklist ของ Diamond Flight Training ที่คัดจาก AFM; ตารางมุมเอียงของ AFM NG ไม่ได้อ่าน; ค่า LDG ต่ำกว่า T/O ที่ 1,000 kg สะท้อน position error (ดู §05.3)'),
  stall_warning_margin_kt: L(5, 'kt', ['LD12'], 'ต่ำ', true, 'ค่าขั้นต่ำตามข้อกำหนด 14 CFR 23.207(c) (ก่อน Amdt 23-64) / CS-23; ระบบเตือนเป็น lift detector ที่ปีกซ้าย [LD8 p.3]; ค่าจริงของ DA40 ไม่พบ'),
  crosswind_demonstrated_kt: L(25, 'kt', ['LD3', 'LD4'], 'สูง', false, '46 km/h [LD4]; DA 40 รุ่น IO-360 (XLT) 20 kt [LD4]'),
  icao_approach_category: L('A', '-', ['LD3'], 'สูง', false, 'VAT = 1.3 VS0 ≈ 76–78 kt < 91 kt (ICAO Doc 8168)'),
};
// performance
ng.performance = {
  ROC_SL_fpm: L(651, 'fpm', ['LD4'], 'กลาง', false, '3.3 m/s ที่ MTOM 1,310 kg ISA MSL (โบรชัวร์ ไม่ระบุแฟลป; คาดว่าเป็นแฟลป T/O ที่ Vy 72 KIAS ตาม AFM)'),
  service_ceiling_ft: L(16400, 'ft', ['LD1', 'LD2'], 'สูง', false, 'ความสูงปฏิบัติการสูงสุด (pressure altitude) 5,000 m — ไม่ใช่ service ceiling ตามนิยาม 100 fpm [LD1 p.28]'),
  cruise_table: L([{ h_ft: 16000, load_pct: 92, ktas: 154 }, { h_ft: 14000, load_pct: 60, ktas: 124, ff_lph: 19.3 }], 'ft, %, kt TAS, l/h', ['LD4'], 'กลาง', false, 'จุด cruise จากหน้าเว็บผู้ผลิต (MTOM ISA; ตัวเลขประมาณ "approximate") [LD4]'),
  glide: L({ speed_kt: 88, ratio: 9.7 }, 'kt IAS, -', ['LD3', 'LD2'], 'กลาง', false, 'แฟลป UP ใบพัดหมุนฟรี มีครอบล้อ; ไม่มีครอบล้อ 9.4 (1.54 NM/1,000 ft) [LD3]; มวลไม่ระบุ'),
  takeoff: L({ ground_roll_m: 397, over50ft_m: 590 }, 'm', ['LD4'], 'กลาง', false, '1,302 / 1,935 ft ที่ MTOM MSL ISA ลานแข็ง (โบรชัวร์ "approximate") [LD4]; แฟลป T/O VR 67–68 KIAS'),
  landing: L({ ground_roll_m: 318, over50ft_m: 650 }, 'm', ['LD4'], 'กลาง', false, '1,043 / 2,132 ft ที่ MTOM MSL ISA [LD4]; แฟลป LDG'),
  fuel: L({ fuel: 'Jet A-1 / Jet A / diesel EN590 (OÄM 40-370)', usable_l: { standard: 106.0, long_range: 147.6 }, ff_lph_60pct: 19.3, ff_lph_100pct: 35 }, 'l, l/h', ['LD1', 'LD4', 'LM19'], 'สูง', false, '[LD1 p.27–28]; อัตราสิ้นเปลือง 60 % จาก [LD4], 100 % จาก factsheet AE300 [LM19]'),
};

// propulsion and engine
ng.propulsion = {
  layout: L([{ id: 1, pos: [geom ? rr(2.47 - 0.25, 2) : 2.22, 0, 0.05], axis: [1, 0, 0], type: 'piston', model: 'Austro Engine E4 (AE300)', prop_sense: 1 }], 'm FRD', ['LD1', 'LD9'], 'ต่ำ', true, 'ตำแหน่งดุมใบพัด ≈ 0.25 m DAT (ค่าประมาณจากภาพ) → x = 2.47 − 0.25 m; ใบพัดหมุนตามเข็มเมื่อมองจากด้านหลัง (right-hand tractor) [LD1 p.27][LD9 p.7]'),
};
ng.piston = {
  identity: L({ model: 'Austro Engine E4 (AE300, config. E4-A)', kind: 'turbo_diesel', displacement_L: 1.991, cylinders: 4, tcds: 'EASA E.200 Issue 12' }, '-', ['LD10', 'LD1'], 'สูง', false, '4 สูบ 4 จังหวะ ดีเซล common rail เทอร์โบ เกียร์ทด 1:1.69 น้ำหนักแห้ง 185 kg [LD10 p.5]'),
  ratings: L({ P_rated: 123500, rpm_rated: 2300, P_mcp: 114000, rpm_mcp: 2100, rpm_redline: 2300, rpm_overspeed: 2500, rpm_idle: null, takeoff_time_limit_s: 300 }, 'W, rpm (ใบพัด)', ['LD10', 'LD1', 'LD2'], 'สูง', false, 'take-off 100 % = 123.5 kW (168 hp) ที่ 2,300 rpm ใบพัด (3,880 rpm เพลาข้อเหวี่ยง) นานสุด 5 นาที; ต่อเนื่อง 92 % = 114 kW ที่ 2,100 rpm; overspeed 2,500 rpm ≤ 20 s [LD2 p.2-5, 2-6][LD10 p.5]; รอบ idle ไม่พบ'),
  altitude: L({ model: 'turbo_flat', critical_alt_m: null, max_operating_alt_m: 5490 }, '-', ['LD10', 'LD4'], 'ต่ำ', true, 'เทอร์โบ + EECU: AFM/TCDS ไม่ให้ critical altitude; จุด cruise 154 KTAS ที่ 16,000 ft ด้วย MCP [LD4] แสดงว่าคงกำลังต่อเนื่องได้สูง (ค่าประมาณ ต้องหาตาราง load สูงสุดตามความสูงจาก AFM บท 5)'),
  power_map: L({ axes: { load_pct: [0, 60, 92, 100] }, data: [0, 74100, 114000, 123500] }, 'W', ['LD2', 'LM19'], 'กลาง', true, 'FADEC: กำลัง = load % × 123.5 kW (เชิงเส้นตามนิยาม load ของ AFM; ค่าประมาณที่ load ต่ำ)'),
  fuel: L({ fuel: 'Jet A-1', bsfc_g_per_kWh: { 100: 227, 60: 205 }, ff_table: [[60, 19.3], [100, 35]] }, 'g/kWh, [load %, l/h]', ['LM19', 'LD4'], 'กลาง', false, 'BSFC คำนวณใน 01-methods §01.6.3 จาก factsheet [LM19] (Jet A-1 0.80 kg/l)'),
  dynamics: L({ tau_throttle_s: 0.5, I_engine: null, friction_torque: null }, 's, kg m2, N m', ['LM0'], 'ต่ำ', true, 'ค่าประมาณตาม 01-methods §01.6.4 (FADEC + turbo lag); ยังไม่พบค่าวัด'),
  fadec: L({ lever_to_load: 'load % = 100 × lever (single power lever)', rpm_schedule: [[0, 1800], [65, 1975], [92, 2100], [100, 2300]], load_max_at_1975rpm_pct: 65 }, '[load %, rpm]', ['LD2', 'LD3', 'LD1'], 'ต่ำ', true, 'จุดจริง: 2,300 rpm ที่ take-off 100 %, 2,100 rpm เป็นรอบต่อเนื่องสูงสุดที่ 92 % [LD1][LD2]; ที่ 1,975 rpm เครื่องให้ได้ถึง 65 % [LD2 p.3-19][LD3]; จุด 0 % → 1,800 rpm เป็นค่าประมาณ'),
};
ng.propeller = {
  identity: {
    kind: L('constant_speed', '-', ['LD1', 'LD9'], 'สูง', false, 'hub ไฮดรอลิก constant speed ควบคุมโดย EECU ไม่มี feather/reverse [LD9 p.6–7]'),
    model: L('MT-Propeller MTV-6-R/190-69', '-', ['LD1', 'LD9'], 'สูง', false, 'EASA TC P.094 ใบไม้/คอมโพสิต'),
    nBlades: L(3, '-', ['LD1', 'LD9'], 'สูง', false, ''),
    diameter: L(1.90, 'm', ['LD1', 'LD9'], 'สูง', false, '190 cm (6 ft 3 in) [LD1 p.27]'),
    sense: L(1, '-', ['LD1', 'LD9'], 'สูง', false, 'clockwise มองจากด้านหลัง (right-hand tractor)'),
    massComplete: L(14, 'kg', ['LD9'], 'กลาง', false, 'ราว 14 kg สำหรับ configuration constant speed ของ MTV-6 (ไม่ระบุรายรุ่น) [LD9 p.7]'),
    hubPosition: L([geom ? rr(2.47 - 0.25, 2) : 2.22, 0, 0.05], 'm FRD', ['LD2'], 'ต่ำ', true, 'ค่าประมาณ: ดุม ≈ 0.25 m DAT'),
    thrustAxis: L([1, 0, 0], '-', ['LD2'], 'ต่ำ', true, 'ค่าประมาณ: แกนแรงขับขนานแกนลำตัว เพราะไม่พบมุม right/down thrust ที่ติดตั้งในเอกสารเผยแพร่'),
  },
  engineInterface: {
    maxShaftPower: L(123.5, 'kW', ['LD10', 'LD2'], 'สูง', false, 'take-off 5 นาที; MCP 114 kW (92 %)'),
    rpmGoverned: L(2300, 'rpm', ['LD1', 'LD2'], 'สูง', false, 'take-off; ต่อเนื่อง 2,100 rpm'),
    rpmTransientLimit: L(2500, 'rpm', ['LD2'], 'สูง', false, 'overspeed สูงสุด 20 s [LD2 p.2-6]'),
    gearRatio: L(1.69, '-', ['LD10'], 'สูง', false, 'เพลาข้อเหวี่ยง 3,880 rpm : ใบพัด 2,300 rpm'),
  },
};

// controls
ng.controls = {
  architecture: L({ pitch: 'reversible', roll: 'reversible', yaw: 'reversible', trim: 'tab' }, '-', ['LD6', 'LD7'], 'สูง', false, 'aileron และ elevator ใช้ push rod, rudder ใช้สายเคเบิล, trim tab บน elevator ขับด้วย Bowden cable, แฟลปไฟฟ้า [LD6 p.7-4][LD7]'),
  surfaces: {
    elevator: L({ travel_deg: { up: 21, down: 17 }, tol: { up: '+0/−1', down: '+1/−0' }, rate_dps: null, actuator_tau_s: null }, 'deg', ['LD1'], 'สูง', false, 'DA 40 NG [LD1 p.29]; DA 40 รุ่นเดิม 23/15 (ถังมาตรฐาน), 23/16 (ถังพิสัยไกล), 18/16 (MÄM 40-227) [LD1 p.7]'),
    aileron: L({ travel_deg: { up: 20, down: 13 }, tol: { up: '±2', down: '±2' }, rate_dps: null, actuator_tau_s: null }, 'deg', ['LD1'], 'สูง', false, '[LD1 p.29] (การจับคู่ค่ากับชื่อพื้นบังคับใน PDF อ่านตามลำดับหัวข้อ ตรงกับ Section A/B)'),
    rudder: L({ travel_deg: { left: 24, right: 26 }, tol: '±1', rate_dps: null, actuator_tau_s: null }, 'deg', ['LD1'], 'สูง', false, '[LD1 p.29]; DA 40 รุ่นเดิมถังมาตรฐาน 29/31'),
    flap: L({ travel_deg: { TO: 20, LDG: 42 }, tol: { TO: '±2', LDG: '±1' }, rate_dps: null, actuator_tau_s: null, kind: 'ไฟฟ้า 3 ตำแหน่ง UP/T-O/LDG' }, 'deg', ['LD1', 'LD6'], 'สูง', false, '[LD1 p.29]'),
    trim_tab: L({ travel_deg: { nose_up: 12, nose_down: 39 }, tol: '±2' }, 'deg', ['LD1'], 'สูง', false, 'มุม tab: nose up +12°, nose down −39° [LD1 p.29]'),
  },
  trim: { kind: L('manual (trim wheel → Bowden cable → elevator tab)', '-', ['LD6'], 'กลาง', false, 'AFM รุ่นเดิมบรรยาย trim tab บน elevator ขับด้วย Bowden cable [LD6 p.7-4]; NG ที่มี autopilot GFC700 มี electric trim ด้วย [LD7]') },
};

// aero (static + flaps) — derivatives filled when ld_derivs.json exists
ng.aero = {
  ref: {
    S: L(13.244, 'm2', ['LD2'], 'สูง', false, '[LD2 p.1-5]'),
    b: L(11.63, 'm', ['LD2'], 'สูง', false, ''),
    c: L(1.171, 'm', ['LD2'], 'สูง', false, 'MAC'),
  },
};

// static longitudinal, flaps, derivatives (ค่าประมาณ)
const dc = der ? der.out.cruise : null, da = der ? der.out.approach : null;
const CLMAX = { UP: 1.362, TO: 1.543, LDG: 1.690 };   // lm_polar.clmaxFromStall kind 'min' nz 0.95, 1310 kg, KCAS from ld_iascas
ng.aero.static_long = {
  CL0: L({ UP: 0.34, TO: 0.86, LDG: 1.09 }, '-', ['LM10', 'LD13'], 'ต่ำ', true, 'ค่าประมาณที่ α ลำตัว = 0: clean จากท่าร่อน 88 KIAS θ ≈ −2.5° γ ≈ −5.8° ที่นักบินรายงาน [LD13] → CL0 0.33/0.39/0.45 ที่มวล 1,100/1,200/1,300 kg (มวลไม่ได้รายงาน) เลือก 0.34; ΔCL0 แฟลปจาก DATCOM plain flap (cf/c 0.25, τ 0.609, η_δ 0.80/0.55, K_b 0.62) = 0.527/0.761 ใช้ 0.52/0.75; ท่าบินของ DA 40 NG ใน [LD13] (โพสต์ 17 และ 20, มวลราว 1,100 kg) ให้ ΔCL0 0.48–0.57 ที่แฟลป T/O และ 0.68–0.70 ที่แฟลป LDG idle 84–88 KIAS สอดคล้องกับ DATCOM; ค่า 0.47 ที่ฉบับแรกรายงานว่าขัดแย้งมาจากจุดของ DA 40 TDI (วิดีโอทดสอบในโพสต์ 16) ไม่ใช่ NG (ตรวจทาน 2026-11-18) — scripts/ld_flaps.mjs'),
  CLalpha: L(da ? rr(da.static.CLalpha, 2) : 5.45, '1/rad', ['LM10', 'LM11'], 'กลาง', true, 'ค่าประมาณ lm_derivs (ปีก + หาง, AR 10.2) นอก ground effect; ปีกอย่างเดียว ' + (da ? rr(da.static.CLaW, 2) : 5.0)),
  Cm0: L({ UP: 0.02, TO: -0.04, LDG: -0.08 }, '-', ['LM11'], 'ต่ำ', true, 'ค่าประมาณที่ CG อ้างอิง 20.6 % MAC: เลือกให้ elevator trim ใกล้กลางที่ cruise; ΔCm แฟลปลง (nose-down) −0.06/−0.10 ตามขนาดทั่วไปของแฟลปชนิดนี้ ยังไม่มีข้อมูลจริง'),
  Cmalpha: L(da ? rr(da.static.Cmalpha, 2) : -1.6, '1/rad', ['LM10', 'LM11'], 'ต่ำ', true, `ค่าประมาณ lm_derivs: จุด neutral h_n ${da ? rr(da.static.h_n, 2) : 0.5} MAC, static margin ${da ? rr(da.static.static_margin, 2) : 0.29} ที่ CG 20.6 % MAC; dε/dα ${da ? rr(da.static.deda, 2) : 0.29} (หาง T อยู่สูงพ้น wake) — ค่าค่อนข้างสูง ความเชื่อมั่นต่ำ`),
  CLmax_target: L(CLMAX, '-', ['LD3', 'LD4', 'LM2'], 'ต่ำ', true, 'CLmax 1 g แบบ trim ที่ CG หน้า MTOW 1,310 kg จาก VS (KIAS→KCAS ค่าประมาณ ld_iascas) ด้วย lm_polar.clmaxFromStall (ความเร็วต่ำสุด, n_z 0.95): UP 64.6, T/O 60.7, LDG 58.0 KCAS'),
};
ng.aero.flaps = {
  detents: L([
    { name: 'UP', flap_deg: 0, VFE_kt: null, dCL0: 0, dCD0: 0, dCm0: 0, CLmax: CLMAX.UP },
    { name: 'TO', flap_deg: 20, VFE_kt: 110, dCL0: 0.52, dCD0: 0.008, dCm0: -0.06, CLmax: CLMAX.TO },
    { name: 'LDG', flap_deg: 42, VFE_kt: 98, dCL0: 0.75, dCD0: 0.035, dCm0: -0.10, CLmax: CLMAX.LDG },
  ], '-', ['LD1', 'LM10'], 'ต่ำ', true, 'มุมแฟลปและ VFE จริง [LD1 p.28–29]; dCL0 ค่าประมาณ DATCOM (ld_flaps.mjs); dCD0 LDG 0.035 ปรับให้ polar ของซิมร่อน idle ที่ 73 KIAS แฟลป LDG ได้ L/D ≈ 7.0 ตามจุดของ DA 40 TDI ที่อ้างใน [LD13] โพสต์ 16/20 (ไม่ใช่ NG; ลดจาก 0.050 รอบแรก, ld_iter.mjs §05.9) ตรวจกับจุดของ NG แฟลป LDG idle 88 KIAS L/D 6.9 (โพสต์ 20): ซิมให้ 6.7 ที่ 1,310 kg และ 6.2 ที่ 1,100 kg (scripts/ld_review.mjs), TO 0.008 ตามสัดส่วน (ซิมวันนี้ใช้ CDflap·f จึงได้ 0.024 ที่ T/O ดู §05.12); dCm0 ค่าประมาณจากขนาดทั่วไป; CLmax จาก VS ใน checklist [LD3]'),
  transition_time_s: L(8, 's', ['LD6'], 'ต่ำ', true, 'ค่าประมาณ UP→LDG 0→42° (AFM ระบุว่าแฟลปขับด้วยมอเตอร์ไฟฟ้า 3 ตำแหน่ง แต่ไม่ระบุเวลา [LD6 §7.3]); ระดับเดียวกับแฟลปไฟฟ้าเครื่องบินเบาทั่วไป ~1.5–2 s ต่อ 10°'),
};
if (dc && da) {
  const NAMES = ['CLq', 'CLadot', 'CLde', 'CYb', 'CYdr', 'CYr', 'Clb', 'Clp', 'Clr', 'Clda', 'Cldr', 'Cmq', 'Cmadot', 'Cmde', 'Cnb', 'Cnp', 'Cnr', 'Cnda', 'Cndr'];
  ng.aero.derivatives = {};
  for (const n of NAMES) ng.aero.derivatives[n] = L({ cruise: rr(dc.body[n], 4), approach: rr(da.body[n], 4) }, '1/rad', ['LM10', 'LM11', 'LM12'], /^(CLde|Cmde|Clb|Clp|CLq|Cmq|CLadot|Cmadot)$/.test(n) ? 'กลาง' : 'ต่ำ', true,
    `ค่าประมาณ lm_derivs (แกนลำตัว, cruise ${dc.V_kt} kt CL ${rr(dc.CL, 2)} / approach ${da.V_kt} kt CL ${rr(da.CL, 2)}); ความแม่นตามตาราง 01.3-3`);
  ng.aero.derivatives.CD0 = L(0.0403, '-', ['LD3'], 'ต่ำ', true, 'polar พาราโบลาจาก best glide 87.5 KCAS L/D 9.7 ที่ 1,310 kg (lm_polar.polarFromGlide) รวมแรงต้านใบพัดหมุนฟรี');
  ng.aero.derivatives.K = L(0.0660, '-', ['LD3'], 'ต่ำ', true, 'จาก glide เดียวกัน (e ≈ 0.47 รวมแรงต้านใบพัด); lm_derivs ให้ K ทางอากาศพลศาสตร์ ' + rr(dc.K, 3) + ' (e ' + rr(dc.e, 2) + ')');
}
const T0_SIM = 4050, CDFLAP_SIM = 0.035;   // iteration result (ld_iter.mjs, out/ld_iter_da40ng.json)
if (fitNG) {
  const pl = fitNG.legacy.propulsion, al = fitNG.legacy.aero;
  ng.propulsion.legacy = L({ P: pl.P, eta: pl.eta, T0: T0_SIM, idle: pl.idle }, '-', ['LM0', 'LD4', 'LD3'], 'ต่ำ', true, `ค่าประมาณ (iteration §05.9, ld_iter.mjs): T0 ${T0_SIM} N เลือกให้ระยะวิ่งขึ้น (ground roll) ของซิมที่ 1,310 kg แฟลป T/O = 397 m ตาม [LD4] (BEM ให้แรงขับสถิตจริง 3,450 N, FM 0.62; T0 ${T0_SIM} N เทียบเท่า FM ≈ 0.80 จึงเป็นพารามิเตอร์รูปทรงของกฎแรงขับ T0·Vc/√(V²+Vc²) ไม่ใช่แรงขับสถิตจริง — ค่าจริงอยู่ที่ propeller.checks) แล้ว lm_legacy_fit โหมด static หา Vc = ${rr(pl.eta * pl.P / pl.T0, 1)} m/s ให้ ROC สูงสุด = 651 fpm; eta_sim ${pl.eta} (> 0.95 ตามคำเตือนของ fit: polar จากการร่อนรวมแรงต้านใบพัดหมุนฟรีจึงต้องการแรงขับสูง ดู §05.12); idle 0 เพราะ polar มาจากการร่อน`);
  ng.aero.legacy = L({ CL0: al.CL0, CLa: al.CLa, CLflap: al.CLflap, CDflap: CDFLAP_SIM, CDgear: 0, Cm0: al.Cm0, Cma: al.Cma, Cmflap: al.Cmflap, aStall: al.aStall, aStallFlap: al.aStallFlap, CD0: al.CD0, K: al.K }, '-', ['LM0', 'LD3', 'LD4'], 'ต่ำ', true,
    'ค่าประมาณ lm_legacy_fit: polar ของซิม CD0 + K(CL − 0.15)² จากการร่อน 88 KIAS L/D 9.7; aStall/aStallFlap แก้หาให้ CLmax 1 g = 1.362 (UP) / 1.690 (LDG); CLflap = ΔCL0 ที่ LDG; CDflap 0.035 = dCD0 LDG หลัง iteration (§05.9); CDgear 0 (ล้อตายตัว แรงต้านอยู่ใน CD0)');
}
if (!fitNG) ng.propulsion.legacy = L({ T0: 3450 }, '-', ['LM0'], 'ต่ำ', true, 'ชั่วคราวก่อน fit: แรงขับสถิต BEM 3,450 N (lm_prop cs, 123.5 kW 2,300 rpm)');

// gear (basic)
ng.gear = {
  layout: L('tricycle_fixed', '-', ['LD1'], 'สูง', false, 'fixed tricycle landing gear [LD1 p.26] (รุ่นเดิม Section A p.4, DA 40 D Section B p.12)'),
};

// ───────── round-1 per-type leaves (ค่าประมาณเฉพาะ DA40 เว้นแต่ระบุ) ─────────
const card = rd('ld_card_da40ng_m1310.json')?.res;           // lm_card results at MTOW (for alpha_star, warnings, currentModel)
const aS = fitNG ? fitNG.legacy.aero.aStall : 15.3, aSF = fitNG ? fitNG.legacy.aero.aStallFlap : -4.2;
const CLa = da ? da.static.CLalpha : 5.45;
const alphaAt = (clmax, vsr, dv, cl0) => rr(((clmax * (vsr / (vsr + dv)) ** 2) - cl0) / CLa * 180 / Math.PI, 2);
Object.assign(ng.aero.static_long, {
  alpha_star: L({ UP: aS, LDG: rr(aS + aSF, 2) }, 'deg', ['LM0'], 'ต่ำ', true, 'จุดกลางการผสม Beard–McLain (X0 = 0.5) ที่ buildAC/lm_legacy_fit แก้หาให้ CLmax 1 g ตรงเป้า (UP 1.362, LDG 1.690)'),
  alpha_star_neg: L({ UP: 13, LDG: 9 }, 'deg', ['LD15'], 'ต่ำ', true, 'ค่าประมาณ: ใช้ค่าเครื่องฝึกรอบที่ 1 (ไม่มีข้อมูล stall ด้านลบของ DA40; บินหงายไม่ได้รับอนุญาต)'),
  a1: L(22, '1/rad', ['R1:A11', 'LD15'], 'ต่ำ', true, 'ค่าประมาณ: ความชันการแยกตัวตามรอบที่ 1 (ช่วง Citation II 20.6–23.9)'),
  CL_sep_at_alpha_star: L({ UP: 0.95, LDG: 1.1 }, '-', ['LD15'], 'ต่ำ', true, 'ค่าประมาณจากรอบที่ 1; AFM ไม่บรรยายการตกของแรงยกหลัง stall'),
  CDmax_90: L(1.40, '-', ['LD15'], 'ต่ำ', true, 'ค่าประมาณ: ปีกเดี่ยว 1.11 + 0.018 AR = 1.29 (AR 10.22) บวกหางและลำตัว'),
  dCD_sep: L(0.2, '-', ['LD15'], 'ต่ำ', true, 'ค่าประมาณจากรอบที่ 1'),
  CmX: L(-0.08, '-', ['LD15', 'LD8'], 'ต่ำ', true, 'ค่าประมาณ: pitch break อ่อนกว่ารอบที่ 1 (−0.12) เพราะ DA40 ขึ้นชื่อว่า stall นุ่มนวล ส่ายหัวลงเล็กน้อย (ค่าวรรณกรรม AT-26 −0.08)'),
  alpha_CLmax: L(card ? { UP: rr(card.stall.UP.alpha_deg, 1), TO: rr(card.stall.TO.alpha_deg, 1), LDG: rr(card.stall.LDG.alpha_deg, 1) } : { UP: 12.6, TO: 9.4, LDG: 8.1 }, 'deg', ['LM0'], 'ต่ำ', true, 'ผลการบิน stall 1 kt/s ใน lm_card ที่ 1,310 kg (มุมที่ CLmax) ไม่ใช่ค่าวัดจริง'),
});
ng.aero.elevator_fade = {
  alpha_t_star: L(20, 'deg', ['LD15'], 'ต่ำ', true, 'ค่าประมาณ: alpha_CLmax clean ≈ 12.6° + ราว 6–7° ตามแนวทางรอบที่ 1; หาง T อยู่นอก wake ที่ α ปกติ แต่ deep-stall ไม่ได้ศึกษา'),
  a_t: L(10, '1/rad', ['LD15'], 'ต่ำ', true, 'ค่าประมาณจากรอบที่ 1'),
  floor: L(0.35, '-', ['LD15'], 'ต่ำ', true, 'ค่าประมาณจากรอบที่ 1'),
};
ng.aero.separation_dynamics = {
  tau1: L(0.30, 's', ['LD15'], 'ต่ำ', true, 'ค่าประมาณ: สเกลจากรอบที่ 1 (0.4 s) ด้วยคอร์ดที่สั้นกว่า (1.17/1.65) และความเร็ว stall ต่ำกว่า'),
  tau2: L(0.15, 's', ['LD15'], 'ต่ำ', true, 'ค่าประมาณ: สเกลเดียวกัน (รอบที่ 1 0.2 s; airfoil 4.24c/V ≈ 0.15 s ที่ 33 m/s)'),
};
ng.aero.large_beta = { CY_crossflow: L(0.49, '-', ['LD2'], 'ต่ำ', true, 'ค่าประมาณ: พื้นที่ด้านข้าง ≈ 6.5 m² (ยาว 8.06 m × สูงเฉลี่ย ~0.8 m) × CD 1.0 / S 13.244') };
ng.aero.strip_wing = {
  taper: L(geom ? rr(geom.ng.taper, 2) : 0.55, '-', ['LD2'], 'ต่ำ', true, 'ปีกเรียวตรงเทียบเท่า (ld_geom.mjs)'),
  dihedral_eff: L(5, 'deg', ['LD6'], 'กลาง', true, 'dihedral ≈ 5° [LD6 p.1-6]; Clb ของปีก+ลำตัวรวมจาก lm_derivs ≈ ' + (da ? rr(da.body.Clb, 3) : -0.05)),
  washout: L(2, 'deg', ['LM10'], 'ต่ำ', true, 'ค่าประมาณ (ไม่พบค่าจริง)'),
  kp_roll: L(0.66, '-', ['LD15'], 'ต่ำ', true, 'ค่าประมาณจากรอบที่ 1; ต้องปรับให้ Clp(2°) ≈ ' + (da ? rr(da.body.Clp, 3) : -0.556) + ' ของ lm_derivs'),
  tau_aileron: L(0.45, '-', ['LM10'], 'ต่ำ', true, 'ค่าประมาณ: τ ของ aileron chord ratio 0.27 (thin-airfoil ≈ 0.62 × ประสิทธิผล 0.75); ต้องปรับให้ Clda ≈ ' + (da ? rr(da.body.Clda, 3) : 0.17)),
  aileron_span_frac: L([0.72, 0.97], '-', ['LD2'], 'ต่ำ', true, 'สัดส่วนครึ่งช่วงปีก ค่าประมาณจากพื้นที่ aileron 0.327 m² ต่อข้างและภาพ'),
};
const vsrU = card?.stall?.UP?.VSR_eas ?? 66.3, vsrL = card?.stall?.LDG?.VSR_eas ?? 59.5;
ng.aero.stall_warning = {
  min_margin: L(5, 'kt', ['LD12'], 'สูง', false, '14 CFR 23.207(c) (ก่อน Amdt 23-64) / CS 23.207: เตือนอย่างน้อย 5 kt ก่อน stall; DA40 มี lift detector (stall warning) ที่ปีกซ้าย [LD8 p.3]'),
  alpha_warn_5kt: L({ UP: alphaAt(1.362, vsrU, 5, 0.34), LDG: alphaAt(1.690, vsrL, 5, 1.09) }, 'deg', ['LM0'], 'ต่ำ', true, 'คำนวณ: α ลำตัวที่ CL = CLmax (V_SR/(V_SR+5))² ด้วย CL0 และ CLα ของบัตร'),
  alpha_warn_design: L({ UP: alphaAt(1.362, vsrU, 7, 0.34), LDG: alphaAt(1.690, vsrL, 7, 1.09) }, 'deg', ['LM0'], 'ต่ำ', true, 'margin 7 kt เผื่อ gust ตามแนวทางรอบที่ 1'),
};
ng.aero.buffet = {
  vertical_filter: L({ w0: 75.92, Q: 8.28 }, 'rad/s,-', ['R1:A11', 'LD15'], 'ต่ำ', true, 'ค่าประมาณ: ใช้ตัวกรองของรอบที่ 1 (Citation II 12.1 Hz); โครง composite ของ DA40 ยังไม่มีค่าวัด'),
  lateral_filter: L({ w0: [36.43, 64.71], Q: [4.19, 11.99], gain_ratio: [2, 1] }, 'rad/s,-,-', ['R1:A11', 'LD15'], 'ต่ำ', true, 'ค่าประมาณจากรอบที่ 1'),
  rms_full: L({ az: 0.03, ay: 0.01 }, 'g', ['LD8'], 'ต่ำ', true, 'ค่าประมาณ: เบากว่าเครื่องฝึกรอบที่ 1 (0.05 g) เพราะ DA40 มีการเตือน stall ทางอากาศพลศาสตร์น้อย ผู้ฝึกพึ่งเสียงเตือน'),
};
const iymp = inert ? (inert.ng.Ixx - inert.ng.Iyy) / (inert.ng.m * 11.63 ** 2) : 0.0012;
ng.aero.spin_reference = {
  alpha_spin: L([43, 60], 'deg', ['LD15'], 'ต่ำ', true, 'ค่าอ้างอิง NASA ของเครื่อง GA ปีกต่ำ (รอบที่ 1); DA40 ไม่ได้รับอนุญาตให้ spin [LD1][LD2 p.2-19] จึงใช้เฉพาะจำลองการหลุดเข้า spin โดยไม่ตั้งใจ'),
  turn_rate: L([145, 208], 'deg/s', ['LD15'], 'ต่ำ', true, 'NASA TP-2644 (รอบที่ 1)'),
  omega_hat: L([0.24, 0.42], '-', ['LD15'], 'ต่ำ', true, 'รอบที่ 1'),
  descent_trainer: L(6000, 'fpm', ['LD15'], 'ต่ำ', true, 'ค่าประมาณ: เครื่อง 4 ที่นั่งเบากว่าเครื่องฝึกรอบที่ 1 (9,500 fpm) สเกลตาม √(W/S)'),
  IYMP: L(rr(iymp, 4), '-', ['LM15'], 'ต่ำ', true, '(Ixx − Iyy)/(m b²) จาก inertia ค่าประมาณ ≈ 0: กระจายมวลไม่เด่นทางลำตัว (ต่างจากเครื่องฝึกรอบที่ 1 −0.0201)'),
  recovery_turns_max: L(1, 'turn', ['LD12'], 'กลาง', false, 'ประเภท normal: กู้ได้ภายใน 1 รอบเพิ่มจาก spin 1 รอบ (14 CFR 23.221(a) เดิม / CS 23.221); DA40 ห้าม spin โดยเจตนา ขั้นตอนกู้: idle, rudder สุดทวนทิศ, ดันคันสุด, aileron กลาง, เก็บแฟลป [LD6 p.3-33]'),
};
const dws = da ? da.static : { deda: 0.29, CLaH: 4.13, VH: 0.721 };
ng.interference = {
  downwash: {
    deda: L(rr(dws.deda, 3), '-', ['LM10'], 'ต่ำ', true, 'lm_derivs: หาง T สูงเหนือระนาบปีก h_H/b 0.116 ทำให้ dε/dα ต่ำ'),
    eps0: L(0, 'rad', ['LD15'], 'ต่ำ', true, 'ค่าประมาณ'),
    l_t: L(geom ? rr(geom.tail.l_h, 2) : 4.78, 'm', ['LD2'], 'ต่ำ', true, 'ld_geom.mjs'),
    VH: L(rr(dws.VH, 3), '-', ['LD2'], 'ต่ำ', true, 'S_h l_t/(S c)'),
    a_t: L(rr(dws.CLaH, 2), '1/rad', ['LM10'], 'ต่ำ', true, 'lm_derivs (AR หาง ≈ 4.9)'),
    eta_t: L(0.95, '-', ['LM10'], 'ต่ำ', true, 'ค่าประมาณ: หาง T พ้น wake ลำตัวและส่วนใหญ่พ้น slipstream'),
    CLadot: L(da ? rr(da.body.CLadot, 3) : 1.55, '1/(rad·c/2V)', ['LM10'], 'ต่ำ', true, 'lm_derivs'),
    Cmadot: L(da ? rr(da.body.Cmadot, 3) : -6.4, '1/(rad·c/2V)', ['LM10'], 'ต่ำ', true, 'lm_derivs (−CLadot l_t/c)'),
  },
  groundEffect: {
    rMac: L([geom ? rr(2.47 - geom.ng.x_c4_MAC, 3) : -0.05, geom ? rr(geom.ng.y_MAC, 2) : 2.63, 0.30], 'm (FRD จาก CG, y ใช้ ±)', ['LD2'], 'ต่ำ', true, 'c/4 ของ MAC: x จาก ld_geom, z ปีกต่ำอยู่ใต้ CG ≈ 0.30 m (ค่าประมาณ)'),
    CLa_w: L(da ? rr(da.static.CLaW, 2) : 5.0, '1/rad', ['LM10'], 'ต่ำ', true, 'ปีก+ลำตัว (lm_derivs)'),
    A: L(10.223, '-', ['LD2'], 'สูง', false, 'AR ปีก [LD2 p.1-5]'),
    rEps: L({ a: 3.99, m: 0.652 }, '-', ['LD15'], 'ต่ำ', true, 'ใช้สูตร fit VLM ของรอบที่ 1 (ไม่ขึ้นกับแบบมาก); ปีกต่ำของ DA40 อยู่ใกล้พื้น (h/b ≈ 0.05 ตอนแตะ) ground effect จึงแรง'),
  },
  slipstream: {
    diskDiameter: L(1.90, 'm', ['LD1'], 'สูง', false, 'MTV-6-R/190-69 [LD1 p.27]'),
    hubRadius: L(0.13, 'm', ['LD2'], 'ต่ำ', true, 'ค่าประมาณรัศมี spinner'),
    hubPos: L([geom ? rr(2.47 - 0.25, 2) : 2.22, 0, 0.05], 'm (FRD จาก CG)', ['LD2'], 'ต่ำ', true, 'ค่าประมาณ'),
    sense: L(1, '-', ['LD1', 'LD9'], 'สูง', false, 'clockwise มองจากด้านหลัง'),
    kappa: L(0.43, '-', ['LD15'], 'ต่ำ', true, 'ค่าประมาณจากรอบที่ 1 (TR 690)'),
    immersionH: L({ axes: { rs_m: [0.3, 0.5, 0.7, 0.8, 0.9, 1, 1.1, 1.22] }, data: [0, 0, 0, 0, 0, 0.05, 0.15, 0.30] }, '-', ['LD1'], 'ต่ำ', true, 'ค่าประมาณ: หาง T สูงกว่าแนวแรงขับราว 1.0 m จึงแทบไม่อยู่ใน slipstream (ผลกำลังต่อ trim ทางหางน้อยกว่าหางธรรมดา)'),
    immersionV: L({ axes: { rs_m: [0.3, 0.5, 0.7, 0.8, 0.9, 1, 1.1, 1.22] }, data: [0, 0.15, 0.31, 0.38, 0.46, 0.54, 0.62, 0.71] }, '-', ['LD2'], 'ต่ำ', true, 'ค่าประมาณ: ครีบเริ่มเหนือแนวแรงขับ ~0.3 m สูง 1.3 m สัดส่วนที่จมตามรัศมี slipstream'),
    kSwirl: L(0.5, '-', ['LD15'], 'ต่ำ', true, 'รอบที่ 1'),
    zSwirl: L(0.60, 'm', ['LD2'], 'ต่ำ', true, 'ค่าประมาณ: ศูนย์กลางแรงของครีบเหนือแนวแรงขับ'),
    finArea: L(1.60, 'm2', ['LD2'], 'สูง', false, 'รวม rudder [LD2 p.1-6]'),
    finArm: L(geom ? rr(geom.tail.l_v, 2) : 4.38, 'm', ['LD2'], 'ต่ำ', true, 'ld_geom.mjs'),
    finLiftSlope: L(da ? rr(da.static.CLaV, 2) : 2.22, '1/rad', ['LM10'], 'ต่ำ', true, 'lm_derivs (A_v,eff)'),
    eta_v: L(0.9, '-', ['LM10'], 'ต่ำ', true, 'ค่าประมาณ'),
    blownSpanFactor: L(0.9, 'D', ['LD15'], 'ต่ำ', true, 'TR 941 ตามรอบที่ 1'),
    blownArea: L(0.74, 'm2', ['LD2'], 'ต่ำ', true, 'ค่าประมาณ: (0.9 D − ความกว้างลำตัว 1.18 m) × คอร์ดโคน 1.40 m'),
    kBlown: L(0.5, '-', ['LD15'], 'ต่ำ', true, 'รอบที่ 1'),
    k_deda_power: L(0, '-', ['LD15'], 'ต่ำ', true, 'ค่าประมาณ: 0 เพราะหาง T อยู่เหนือ slipstream เป็นส่วนใหญ่ (ไม่มีข้อมูลวัด)'),
  },
};
const cst = { 15: null };
const ptab = (() => { try { return JSON.parse(fs.readFileSync(new URL('lm_prop_cs.json', OUTDIR), 'utf8')); } catch { return null; } })();
Object.assign(ng.propeller, {
  bladeGeometry: {
    hubRadiusRatio: L(0.18, 'r/R', ['LM0'], 'ต่ำ', true, 'ค่าในแบบจำลอง lm_prop cs3_190'),
    chordOverD: L({ axes: { x: [0.15, 0.25, 0.35, 0.45, 0.60, 0.75, 0.85, 0.93, 1.00] }, data: [0.0425, 0.051, 0.0578, 0.0612, 0.0621, 0.0578, 0.051, 0.0425, 0.0272] }, 'c/D', ['LM0'], 'ต่ำ', true, 'ค่าประมาณ: planform GA ทั่วไป × 0.85 (lm_prop cs3_190); รูปทรงใบจริงของ MT ไม่เผยแพร่'),
    twistDesignJ: L(0.95, '-', ['LM0'], 'ต่ำ', true, 'helical twist ที่ J 0.95 (lm_prop)'),
    activityFactor: L(77, '-', ['LM0'], 'ต่ำ', true, 'ค่าประมาณ ≈ 0.85 × 90 ต่อใบ'),
  },
  section: {
    liftSlope: L(5.65, '1/rad', ['LM0'], 'ต่ำ', true, '0.90·2π (lm_prop)'),
    alpha0: L(-3, 'deg', ['LM0'], 'ต่ำ', true, 'lm_prop'),
    alphaStallPos: L(14, 'deg', ['LM0'], 'ต่ำ', true, 'lm_prop'),
    alphaStallNeg: L(-10, 'deg', ['LM0'], 'ต่ำ', true, 'lm_prop'),
    stallBlendM: L(10, '1/rad', ['LD15'], 'ต่ำ', true, 'รอบที่ 1'),
    cd0: L(0.010, '-', ['LM0'], 'ต่ำ', true, 'lm_prop'),
    kcd: L(0.012, '-', ['LM0'], 'ต่ำ', true, 'lm_prop'),
    Mdd: L(0.8, '-', ['LD15'], 'ต่ำ', true, 'ปลายใบที่ 2,300 rpm M_tip ≈ 0.67 ต่ำกว่า Mdd'),
    stallDelayFactor: L(3, '-', ['LD15'], 'ต่ำ', true, 'Snel'),
  },
  tables: ptab ? {
    CT: L({ axes: { beta75_deg: Object.keys(ptab.table).map(Number), J: ptab.table['15'].map(x => x.J) }, data: Object.values(ptab.table).map(rows => rows.map(x => rr(x.CT, 4))) }, '-', ['LM0'], 'ต่ำ', true, 'BEM lm_prop cs3_190 (ρ 1.225); แถว = beta75 15–35°; มุมใบจริง low 14.5° / high 35° [LD1 p.27]'),
    CP: L({ axes: { beta75_deg: Object.keys(ptab.table).map(Number), J: ptab.table['15'].map(x => x.J) }, data: Object.values(ptab.table).map(rows => rows.map(x => rr(x.CP, 4))) }, '-', ['LM0'], 'ต่ำ', true, 'C_P = P/(ρ n³ D⁵)'),
  } : undefined,
  inertia: {
    Ip: L(1.4, 'kg m2', ['LD9'], 'ต่ำ', true, 'ค่าประมาณ: ใบพัดไม้/คอมโพสิตราว 14 kg [LD9 p.7] (ใบละ ~3.3 kg ที่รัศมีไจเรชัน ~0.36 m + ดุม)'),
    IreflectedEngine: L(0.4, 'kg m2', ['LD10'], 'ต่ำ', true, 'ค่าประมาณ: เพลาข้อเหวี่ยง+ล้อตุนกำลัง ~0.15 kg m² × 1.69²'),
  },
  governor: {
    kGov: L(1, 'deg/s per rpm', ['LD15'], 'ต่ำ', true, 'กฎเดียวกับรอบที่ 1 (JSBSim); EECU คุมรอบตามตาราง load–rpm'),
    pitchRateMax: L(15, 'deg/s', ['LD15'], 'ต่ำ', true, 'ค่าประมาณ hub ไฮดรอลิก MT'),
    rpmOverspeed: L(2500, 'rpm', ['LD2'], 'สูง', false, 'max overspeed 2,500 rpm ≤ 20 s [LD2 p.2-6]'),
    oilMinRpm: L(200, 'rpm', ['LD15'], 'ต่ำ', true, 'รอบที่ 1'),
    betaFlightIdle: L(14.5, 'deg @0.75R', ['LD1'], 'สูง', false, 'low pitch stop 14.5° ± 0.2° [LD1 p.27]'),
    betaHigh: L(35, 'deg @0.75R', ['LD1'], 'สูง', false, 'high pitch 35° ± 1° [LD1 p.27] (ไม่ใช่ feather)'),
  },
  checks: {
    staticThrustISA: L(3.45, 'kN', ['LM0'], 'ต่ำ', true, 'BEM lm_prop: β75 20.2° ที่ 123.5 kW 2,300 rpm, FM 0.62'),
    staticThrustVTBD31C: L(3.39, 'kN', ['LM0'], 'ต่ำ', true, 'สเกลแบบโมเมนตัม T ∝ ρ^(1/3) ที่กำลังคงที่ (เทอร์โบคงกำลัง): ρ 1.160/1.225'),
    momentumIdealStaticISA: L(4.73, 'kN', ['LM0'], 'สูง', false, '(2ρA)^(1/3) P^(2/3), D 1.90 m, 123.5 kW (คำนวณจากนิยาม)'),
    peakEfficiency: L(0.89, '-', ['LM0'], 'ต่ำ', true, 'สูงสุดของตาราง BEM (β75 30–35°, J 1.2)'),
  },
});
Object.assign(ng.controls, {
  pitch: {
    architecture: L({ kind: 'reversible', input: 'force' }, '-', ['LD6'], 'สูง', false, 'push rod + trim tab [LD6 p.7-4]'),
    S_e: L(0.665, 'm2', ['LD2'], 'สูง', false, '[LD2 p.1-6]'),
    c_e: L(0.196, 'm', ['LD2'], 'ต่ำ', true, 'S_e / b_h (ค่าประมาณ)'),
    gearing: L(2.4, 'rad/m', ['LD1'], 'ต่ำ', true, 'ค่าประมาณ: ระยะ elevator 21°+17° = 0.663 rad ต่อระยะคัน ~0.28 m'),
    eta_t: L(0.95, '-', ['LM10'], 'ต่ำ', true, 'หาง T'),
    a_t: L(rr(dws.CLaH, 2), '1/rad', ['LM10'], 'ต่ำ', true, 'lm_derivs'),
    tau_e: L(da ? rr(da.static.tauE, 2) : 0.54, '-', ['LM10'], 'ต่ำ', true, 'lm_derivs (chord ratio 0.28)'),
    l_t: L(geom ? rr(geom.tail.l_h, 2) : 4.78, 'm', ['LD2'], 'ต่ำ', true, 'ld_geom.mjs'),
    deda: L(rr(dws.deda, 3), '-', ['LM10'], 'ต่ำ', true, 'lm_derivs'),
    Ch0: L(0, '-', ['LD15'], 'ต่ำ', true, 'ค่าประมาณ'),
    Ch_alpha: L(-0.1146, '1/rad', ['LD15'], 'ต่ำ', true, 'ค่าประมาณจากรอบที่ 1 (−0.0020/deg)'),
    Ch_delta: L(-0.3438, '1/rad', ['LD15'], 'ต่ำ', true, 'ค่าประมาณจากรอบที่ 1 (−0.0060/deg)'),
    Ch_tab: L(-0.2005, '1/rad', ['LD15'], 'ต่ำ', true, 'ค่าประมาณจากรอบที่ 1'),
    tab_max: L({ nose_up: 12, nose_down: 39 }, 'deg', ['LD1'], 'สูง', false, 'ระยะ trim tab ตาม TCDS [LD1 p.29]'),
    trim_rate_flaps_down: L(1, 'deg/s', ['LD15'], 'ต่ำ', true, 'ล้อ trim มือ: อัตราขึ้นกับนักบิน ใช้ค่ารอบที่ 1'),
    trim_rate_flaps_up: L(1, 'deg/s', ['LD15'], 'ต่ำ', true, 'ล้อ trim มือ'),
    breakout: L(4.45, 'N', ['LD15'], 'ต่ำ', true, '1 lbf (รอบที่ 1)'),
    friction: L(4.45, 'N', ['LD15'], 'ต่ำ', true, 'รอบที่ 1'),
    centring_spring: L({ Kc: 60, qFade: 400 }, 'N/rad, Pa', ['LD15'], 'ต่ำ', true, 'รอบที่ 1'),
    stops: L({ teu: 21, ted: 17 }, 'deg', ['LD1'], 'สูง', false, 'TCDS [LD1 p.29]'),
    rate_limit: L(70, 'deg/s', ['LD15'], 'ต่ำ', true, 'รอบที่ 1'),
  },
  roll: {
    architecture: L({ kind: 'reversible', input: 'force' }, '-', ['LD6'], 'สูง', false, 'push rod'),
    S_a_each: L(0.327, 'm2', ['LD2'], 'สูง', false, 'ครึ่งหนึ่งของ 0.654 m² [LD2 p.1-5]'),
    c_a: L(0.25, 'm', ['LD2'], 'ต่ำ', true, 'ค่าประมาณ'),
    gearing: L(3.2, 'rad/m', ['LD1'], 'ต่ำ', true, 'ค่าประมาณ: aileron เฉลี่ย ±16.5° ต่อคันข้าง ±0.09 m'),
    Ch_delta: L(-0.1719, '1/rad', ['LD15'], 'ต่ำ', true, 'รอบที่ 1'),
    Ch_alpha: L(-0.0573, '1/rad', ['LD15'], 'ต่ำ', true, 'รอบที่ 1'),
    tab_max: L(0, 'deg', ['LD6'], 'กลาง', true, 'ไม่มี aileron trim ที่นักบินปรับได้ (ไม่พบใน AFM)'),
    trim_rate: L(0, 'deg/s', ['LD6'], 'กลาง', true, 'ค่าประมาณ: 0 เพราะไม่พบระบบ trim ของแกนนี้ใน AFM [LD6]'),
    breakout: L(3, 'N', ['LD15'], 'ต่ำ', true, 'รอบที่ 1'),
    stops: L({ up: 20, down: 13, max: 16.5 }, 'deg', ['LD1'], 'สูง', false, 'TCDS 20° ขึ้น / 13° ลง [LD1 p.29]; max = ค่าเฉลี่ยที่ซิมใช้'),
    rate_limit: L(80, 'deg/s', ['LD15'], 'ต่ำ', true, 'รอบที่ 1'),
  },
  yaw: {
    architecture: L({ kind: 'reversible', input: 'force' }, '-', ['LD6'], 'สูง', false, 'สายเคเบิล [LD6 p.7-4]'),
    S_r: L(0.47, 'm2', ['LD2'], 'สูง', false, '[LD2 p.1-6]'),
    c_r: L(0.36, 'm', ['LD2'], 'ต่ำ', true, 'S_r / b_v'),
    gearing: L(4.8, 'rad/m', ['LD1'], 'ต่ำ', true, 'ค่าประมาณ: ±25° ต่อแป้น ±0.09 m'),
    Ch_delta: L(-0.3438, '1/rad', ['LD15'], 'ต่ำ', true, 'รอบที่ 1'),
    Ch_beta: L(-0.1146, '1/rad', ['LD15'], 'ต่ำ', true, 'รอบที่ 1'),
    slipstream_q_ratio: L([1, 1.5], '-', ['LD15'], 'ต่ำ', true, 'ค่าประมาณ: ครีบจมใน slipstream บางส่วน (immersionV)'),
    tab_max: L(0, 'deg', ['LD6'], 'กลาง', true, 'ไม่พบ rudder trim ที่นักบินปรับได้ใน AFM'),
    trim_rate: L(0, 'deg/s', ['LD6'], 'กลาง', true, 'ค่าประมาณ: 0 เพราะไม่พบระบบ trim ของแกนนี้ใน AFM [LD6]'),
    breakout: L(13.3, 'N', ['LD15'], 'ต่ำ', true, '3 lbf (รอบที่ 1)'),
    stops: L({ left: 24, right: 26, max: 24 }, 'deg', ['LD1'], 'สูง', false, 'TCDS [LD1 p.29]; max = min(left, right)'),
    rate_limit: L(60, 'deg/s', ['LD15'], 'ต่ำ', true, 'รอบที่ 1'),
  },
});
// gear
const xm = geom ? geom.gear.main_FRD_x : -0.33, xn = geom ? geom.gear.nose_FRD_x : 1.35, zc = 0.85;
Object.assign(ng.gear, {
  geometry: {
    nose_contact_body_extended: L([rr(xn, 3), 0, rr(zc + 0.03, 3)], 'm FRD', ['LD2', 'LB19'], 'ต่ำ', true, 'ค่าประมาณ: ล้อหน้า 1.12 m DAT (ล้อหลัก − wheelbase 1.68 m [LD2]); z = ความสูง CG ~0.85 m + ยุบตัวสถิต 0.03 m'),
    main_contact_body_extended: L([[rr(xm, 3), -1.485, rr(zc + 0.06, 3)], [rr(xm, 3), 1.485, rr(zc + 0.06, 3)]], 'm FRD', ['LD2', 'LB19'], 'ต่ำ', true, 'ค่าประมาณ: ล้อหลัก 2.80 m DAT (โมเดล FlightGear 2.81 m [LB19]); track 2.97 m [LD2]; z + ยุบตัวสถิต 0.06 m'),
    cg_height_parked: L(0.85, 'm', ['LB19'], 'ต่ำ', true, 'ค่าประมาณ (FlightGear 0.79 m)'),
  },
  strut_main: {
    kind: L('spring_leg', '-', ['LD6'], 'สูง', false, 'ขาสปริงเหล็ก "sprung steel struts" [LD6 p.7-13]; TCDS อ้างขา 18 mm/"thin"/"tall" [LD1 p.8]'),
    stroke: L(0.15, 'm', ['LD6'], 'ต่ำ', true, 'ค่าประมาณระยะยุบสูงสุดที่ล้อ'),
    spring: L({ static_deflection: 0.06, damping_ratio: 0.25 }, 'm, -', ['LD6'], 'ต่ำ', true, 'ค่าประมาณ: ขาสปริงเหล็กหน่วงน้อย (ζ รวมยางและแรงเสียดทาน ~0.25); ซิมคิด k = N/δ_static'),
  },
  strut_nose: {
    kind: L('elastomer', '-', ['LD6'], 'สูง', false, 'ล้อหน้า castering รับแรงด้วย elastomer package [LD6 p.7-13]'),
    stroke: L(0.08, 'm', ['LD6'], 'ต่ำ', true, 'ค่าประมาณ'),
    spring: L({ static_deflection: 0.03, damping_ratio: 0.40 }, 'm, -', ['LD6'], 'ต่ำ', true, 'ค่าประมาณ: elastomer หน่วงมากกว่าสปริงเหล็ก'),
  },
  tyre_main: {
    size: L({ size: '15x6.0-6', ply: 6 }, '-', ['LD1'], 'สูง', false, '6 PR; OÄM 40-334: 8.50-6 [LD1 p.29]'),
    rated_load: L(5560, 'N', ['LD1'], 'ต่ำ', true, 'ค่าประมาณ ~1,250 lb สำหรับยาง 6 ply ขนาดนี้ (ไม่ได้เปิด data sheet ผู้ผลิตยาง); โหลดสถิตที่ 1,310 kg ≈ 5,170 N ต่อล้อ'),
    rated_pressure: L(40, 'psi', ['LD1'], 'ต่ำ', true, 'ค่าประมาณ'),
    operating_pressure: L(36, 'psi', ['LD1'], 'ต่ำ', true, 'ค่าประมาณ ~2.5 bar (ไม่ได้อ่านบท 8 ของ AFM)'),
    outside_diameter: L(0.381, 'm', ['LD1'], 'สูง', false, '15 in ตามรหัสยาง'),
    section_width: L(0.152, 'm', ['LD1'], 'สูง', false, '6.0 in ตามรหัสยาง'),
    k_vertical: L(150000, 'N/m', ['LD15'], 'ต่ำ', true, 'สเกลจากรอบที่ 1 (6.50-8 ที่ 60 psi 320 kN/m) ตามแรงดันและขนาด'),
    c_vertical: L(1500, 'N s/m', ['LD15'], 'ต่ำ', true, 'ζ ≈ 0.1'),
    cornering_stiffness_coef: L(3.2, '1/rad', ['LD15'], 'ต่ำ', true, 'รอบที่ 1'),
    relaxation_length: L(0.25, 'm', ['LD15'], 'ต่ำ', true, 'สเกลตามเส้นผ่านศูนย์กลาง'),
    k_longitudinal: L(110000, 'N/m', ['LD15'], 'ต่ำ', true, 'TN 4110 eq.52 1.2 p d (p 36 psi, d 0.381 m)'),
    mu_peak_dry: L(0.8, '-', ['LD15'], 'ต่ำ', true, 'รอบที่ 1'),
    mu_skid_ratio_dry: L(0.75, '-', ['LD15'], 'ต่ำ', true, 'รอบที่ 1'),
    mu_skid_ratio_wet: L(0.5, '-', ['LD15'], 'ต่ำ', true, 'รอบที่ 1'),
    rolling_radius: L(0.18, 'm', ['LD1'], 'ต่ำ', true, 'r − δ/3'),
    wheel_inertia: L(0.12, 'kg m2', ['LD15'], 'ต่ำ', true, 'ค่าประมาณ ยาง+ล้อ+จานเบรก ~7 kg'),
  },
  tyre_nose: {
    size: L({ size: '5.00-5', ply: 6 }, '-', ['LD1'], 'สูง', false, '6 PR; OÄM 40-334: 6.00-6 [LD1 p.29]'),
    rated_load: L(3600, 'N', ['LD1'], 'ต่ำ', true, 'ค่าประมาณ ~800 lb; โหลดสถิตล้อหน้า ≈ 20 % ของน้ำหนัก ≈ 2,500 N'),
    rated_pressure: L(50, 'psi', ['LD1'], 'ต่ำ', true, 'ค่าประมาณ'),
    operating_pressure: L(30, 'psi', ['LD1'], 'ต่ำ', true, 'ค่าประมาณ'),
    outside_diameter: L(0.355, 'm', ['LD1'], 'ต่ำ', true, 'ค่าทั่วไปของยาง 5.00-5 (~14 in)'),
    k_vertical: L(110000, 'N/m', ['LD15'], 'ต่ำ', true, 'สเกลตามขนาด'),
    c_vertical: L(900, 'N s/m', ['LD15'], 'ต่ำ', true, 'ζ ≈ 0.1'),
    cornering_stiffness_coef: L(3.2, '1/rad', ['LD15'], 'ต่ำ', true, 'รอบที่ 1'),
    relaxation_length: L(0.22, 'm', ['LD15'], 'ต่ำ', true, 'รอบที่ 1'),
  },
  brakes: {
    force_limit_ratio: L(0.6, '-', ['LD15'], 'ต่ำ', true, 'รอบที่ 1; เบรกจานไฮดรอลิก toe brake แยกซ้ายขวา [LD6 p.7-13]'),
    pressure_rise_rate: L(2.5, '1/s', ['LD15'], 'ต่ำ', true, 'รอบที่ 1'),
    antiskid: L(0, 'bool', ['LD6'], 'สูง', false, 'ไม่มี antiskid'),
    heat_sink_mass: L(1.5, 'kg', ['LD15'], 'ต่ำ', true, 'ค่าประมาณจานเบรกเครื่องเล็กต่อข้าง'),
    heat_sink_cool_tau: L(600, 's', ['LD15'], 'ต่ำ', true, 'ค่าประมาณ'),
    fade_start_temp: L(400, 'degC', ['LD15'], 'ต่ำ', true, 'รอบที่ 1'),
    fade_full_temp: L(700, 'degC', ['LD15'], 'ต่ำ', true, 'รอบที่ 1'),
  },
  steering: {
    mode: L({ type: 'castering_diff_brake', caster_with_diff_brake: true, pedal_linked: false }, '-', ['LD6', 'LD1'], 'สูง', false, 'ล้อหน้า free-castering ไม่มีก้านต่อแป้น เลี้ยวด้วยเบรกแยกข้าง (และ rudder เมื่อมีลม) [LD6 p.7-13]'),
    pedal_max: L(0, 'deg', ['LD6'], 'สูง', false, 'ไม่มีการเลี้ยวผ่านแป้น'),
    caster_max: L(360, 'deg', ['LB19'], 'ต่ำ', true, 'ไม่พบมุมจำกัดของล้อ castering; โมเดล FlightGear ใช้ 360° [LB19]; ล้อมี friction damper (ค่าประมาณ)'),
    shimmy_lag: L(0.05, 's', ['LD15'], 'ต่ำ', true, 'รอบที่ 1'),
  },
  certification: {
    part23_limit_descent: L({ formula: 'V = 4.4 (W/S)^0.25 fps, 7..10 fps', da40ng_fps: 9.33 }, 'fps', ['LD12'], 'สูง', false, '14 CFR 23.473(d) (ก่อน Amdt 23-64): W/S = 2,888 lb / 142.6 ft² = 20.25 psf → 9.33 fps'),
    part23_wing_lift_ratio: L(0.667, '-', ['LD12'], 'สูง', false, '23.473(e)'),
    part23_min_load_factors: L({ inertia: 2.67, ground_reaction: 2 }, 'g', ['LD12'], 'สูง', false, '23.473(g)'),
    part23_reserve_drop_factor: L(1.44, 'x drop height', ['LD12'], 'สูง', false, '23.723(b)'),
  },
});
// wind, input, validation
ng.wind = {
  fFactor: { trainerExcessTW: L(card?.excessTW ?? 0.033, '-', ['LM0'], 'ต่ำ', true, 'ซิมวันนี้: (T_max − D)/W ที่ approach แฟลป LDG ≈ 0.03 ต่ำกว่าจริงเพราะ polar จากการร่อนรวมแรงต้านใบพัดหมุนฟรี (§05.9)') },
  wake: {
    b0_over_b: L(0.7854, '-', ['LD15'], 'สูง', false, 'π/4 (นิยาม)'),
    rc_over_b: L({ default: 0.035, min: 0.02, max: 0.06 }, '-', ['LD15'], 'ต่ำ', true, 'รอบที่ 1'),
    trainerRollControl: L({ Clda: da ? rr(da.body.Clda, 3) : 0.17, daMax_deg: 16.5, ClMax: da ? rr(da.body.Clda * 16.5 * Math.PI / 180, 4) : 0.05 }, '-', ['LM10', 'LD1'], 'ต่ำ', true, 'อำนาจม้วนสูงสุดของ DA40 สำหรับเทียบกับโมเมนต์ม้วนจาก wake (ค่าประมาณ)'),
  },
};
ng.input = { keyboard: {
  interim_trim_rate_elevator: L(0.5, 'deg/s', ['LD15'], 'ต่ำ', true, 'รอบที่ 1'),
  flap_notches: L([0, fitNG ? 0.693 : 0.69, 1], 'สัดส่วน AC.flaps', ['LD1', 'LM0'], 'ต่ำ', true, 'UP/T-O/LDG: f(T/O) = dCL0(T/O)/dCL0(LDG) = 0.52/0.75 (flapMap lift)'),
} };
ng.validation = {
  classification: { hqClassCategory: L({ class: 'I', approachLanding: 'C', cruiseClimb: 'B', takeoff: 'C' }, '-', ['R1:V10'], 'สูง', false, 'เครื่องเบาเครื่องยนต์เดียว (MIL-F-8785C Class I)') },
  procedures: { v50MinFactor_singleEngine: L(1.2, '× VS1', ['LD12'], 'สูง', false, '14 CFR 23.53 เดิม; DA40 NG V50 72 KIAS ที่ 1,280 kg ≈ 1.2 × VS(T/O)') },
  takeoff_test: L({ flap: 'TO', VR_kt: 66.9, theta_deg: 8 }, 'kt CAS, deg', ['LD3'], 'กลาง', true, 'VR 68 KIAS ที่ 1,310 kg (สเกลจาก 67 KIAS ที่ 1,280 kg [LD3]) → 66.9 KCAS ด้วยตาราง TO; มุมเงย 8° ค่าประมาณ'),
  trim_targets: {
    cruise: L({ ias_kt: 110, h_ft: 3000, gamma_deg: 0 }, 'kt CAS, ft', ['LD1'], 'ต่ำ', true, 'สภาพ trim ของซิม (≈ 0.85 VNO) ไม่ใช่จุดจาก AFM'),
    approach: L({ ias_kt: 76, h_m: 300, gamma_deg: -3 }, 'kt CAS, m, deg', ['LD3'], 'กลาง', true, 'VREF 77 KIAS แฟลป LDG → 76 KCAS (ld_iascas)'),
  },
};
if (card) {
  ng.validation.currentModel = {
    performance: L({ mass_kg: 1310, VSR_kcas: { UP: rr(card.stall.UP.VSR_cas, 1), TO: rr(card.stall.TO.VSR_cas, 1), LDG: rr(card.stall.LDG.VSR_cas, 1) }, Vmin_keas: { UP: rr(card.stall.UP.Vmin_eas, 1), TO: rr(card.stall.TO.Vmin_eas, 1), LDG: rr(card.stall.LDG.Vmin_eas, 1) }, Vy_kt: rr(card.climb.Vy_kt, 1), ROC_fpm: Math.round(card.climb.ROCmax_fpm), Vx_kt: card.climb.Vx_kt, glide: { V_kt: rr(card.glide.zeroThrust.Vbg_kt, 1), LD: rr(card.glide.zeroThrust.LD, 2), sink_fpm: Math.round(card.glide.zeroThrust.sink_fpm) }, takeoff_m: { flap: card.takeoff.flap, ground: Math.round(card.takeoff.groundRoll_m), d50ft: Math.round(card.takeoff.dist50ft_m), V_LOF_kt: rr(card.takeoff.V_LOF_kt, 1) }, landing_m: { asIs: Math.round(card.landing.asIs.total_m), maxBrake: Math.round(card.landing.maxBrake.total_m), ground_maxBrake: Math.round(card.landing.maxBrake.ground_m), vtd_kt: rr(card.landing.asIs.vtd_kt, 1) }, trim: { cruise_thr: rr(card.trim.cruise.thr, 3), approach_thr: rr(card.trim.approach.thr, 3), approach_alpha_deg: rr(card.trim.approach.alpha_deg, 2) } }, 'kt, fpm, -, m', ['LM0'], 'สูง', false, 'ผล lm_card da40ng --mass 1310 กับซิม commit cabf0f0 (ตัวเลข regression ของซิมวันนี้ ไม่ใช่ค่าเครื่องจริง)'),
    approach: L(rd3(card.modes.approach), 'rad/s, -, s', ['LM0'], 'สูง', false, 'โหมดเชิงเส้นของซิมวันนี้ที่ approach 76 KCAS แฟลป LDG γ −3° (1,310 kg)'),
    cruise: L(rd3(card.modes.cruise), 'rad/s, -, s', ['LM0'], 'สูง', false, 'โหมดเชิงเส้นของซิมวันนี้ที่ 110 KCAS 3,000 ft (1,310 kg)'),
  };
}
const NA = [
  ['turbofan.*', 'เครื่องลูกสูบดีเซล'], ['turboprop.*', 'ไม่ใช่เทอร์โบพร็อป'],
  ['aero.static_long.table_clean', 'ตารางตัวอย่างรูปแบบ คำนวณได้จากพารามิเตอร์ข้างบนด้วยสคริปต์รอบที่ 1'],
  ['interference.groundEffect.tablesCheck', 'แถวตรวจของรอบที่ 1 คำนวณจาก rEps ได้ ไม่ขึ้นกับแบบ'],
  ['propeller.tables.CNmu', 'ยังไม่ได้คำนวณ BEM แยกมุมแอสไซเมทรี (P-factor) ของใบพัดนี้ งาน P2'], ['propeller.tables.CMmu', 'เหมือน CNmu'],
  ['propeller.governor.betaFeather', 'MTV-6-R/190-69 ไม่มี feather'], ['propeller.governor.featherRate', 'ไม่มี feather'],
  ['propeller.betaReverse.*', 'ไม่มี reverse'], ['propeller.feathered.*', 'ไม่มี feather (เครื่องยนต์เดียว)'],
  ['propeller.engineInterface.flightIdleShaftPower', 'นิยามของเทอร์โบพร็อป; ลูกสูบ/ดีเซลใช้ piston.*'],
  ['controls.pitch.derived_check', 'ผลตรวจ c6_hinge.mjs ของเครื่องฝึกรอบที่ 1 ต้องคำนวณใหม่เมื่อมีโมเดล hinge (งาน P2)'],
  ['controls.reference_types.*', 'ค่าอ้างอิงของเครื่องโดยสาร (737, ATR) ไม่ใช่ของ DA40'],
  ['gear.strut_main.p_static', 'ขาสปริงเหล็ก ไม่ใช่ oleo'], ['gear.strut_main.piston_area', 'ไม่ใช่ oleo'], ['gear.strut_main.ratio_static_to_extended', 'ไม่ใช่ oleo'],
  ['gear.strut_main.ratio_compressed_to_extended', 'ไม่ใช่ oleo'], ['gear.strut_main.polytropic_n_dynamic', 'ไม่ใช่ oleo'], ['gear.strut_main.polytropic_n_static', 'ไม่ใช่ oleo'],
  ['gear.strut_main.Kh_compression', 'ไม่ใช่ oleo'], ['gear.strut_main.Kr_rebound', 'ไม่ใช่ oleo'], ['gear.strut_main.c_linear', 'ใช้ spring.damping_ratio แทน'], ['gear.strut_main.seal_friction_ratio', 'ไม่ใช่ oleo'],
  ['gear.strut_nose.p_static', 'ล้อหน้า elastomer'], ['gear.strut_nose.piston_area', 'elastomer'], ['gear.strut_nose.ratio_static_to_extended', 'elastomer'], ['gear.strut_nose.ratio_compressed_to_extended', 'elastomer'],
  ['gear.strut_nose.Kh_compression', 'elastomer'], ['gear.strut_nose.Kr_rebound', 'elastomer'], ['gear.strut_nose.c_linear', 'ใช้ spring.damping_ratio แทน'],
  ['gear.brakes.antiskid_efficiency', 'ไม่มี antiskid'], ['gear.brakes.antiskid_efficiency_measured', 'ไม่มี antiskid'], ['gear.brakes.antiskid_slip_setpoint', 'ไม่มี antiskid'],
  ['gear.steering.steer_rate', 'ล้อหน้า castering ไม่มีตัวขับเลี้ยว'],
  ['gear.certification.part25_limit_descent', 'CS/Part 23 ไม่ใช่ Part 25'], ['gear.certification.part25_friction_cap', 'Part 25'],
  ['wind.discreteGust.cfr25_341_Fg', 'สูตร gust ของ Part 25'], ['wind.wake.leaders', 'รายการเครื่องนำ (A320, 737 …) ใช้ร่วมจากรอบที่ 1 ไม่ใช่ค่าของ DA40'],
  ['numerics.contact.*', 'ค่าตัวเลขของโมเดลสัมผัสพื้นในซิม ไม่ขึ้นกับแบบ ใช้ค่ารอบที่ 1'],
  ['validation.typicalModes.*', 'โหมดอ้างอิงของแบบอื่น (c172x, 737, 747, GA ทั่วไป) ไม่ใช่ของ DA40'],
  ['validation.currentModel.approach95', 'ชื่อผูกกับสภาพของเครื่องฝึกรอบที่ 1; ผลของ DA40 อยู่ที่ validation.currentModel.approach'],
  ['validation.currentModel.cruise155', 'เหมือนกัน; ดู validation.currentModel.cruise'],
  ['otherSims.*', 'หัวข้อ 03 (LB) เป็นเจ้าของ path otherSims'],
];
ng._na = L(NA.map(x => x[0]), '-', ['LD1'], 'สูง', false, NA.map(x => `${x[0]}: ${x[1]}`).join(' · '));

// ───────────────────────── variants (_inherits: da40ng, only differing leaves) ─────────────────────────
// Thai civil schools fly DA 40 D (×9) and DA 40 CS (×7), no NG [LS1][LS18]: da40_180 = Lycoming IO-360-M1A airframe
// (DA 40 / CS / XLS / XLT) at MTOM 1,200 kg (MÄM 40-227), da40d = DA 40 D (TAE 125) at MTOM 1,150 kg.
const interp = (t, x) => { for (let i = 1; i < t.length; i++) if (x <= t[i][0]) { const [x0, y0] = t[i - 1], [x1, y1] = t[i]; return y0 + (y1 - y0) * (x - x0) / (x1 - x0); } return t.at(-1)[1]; };
const iasC = ias?.classic;
const C_TAB = iasC ? { UP: iasC.UP.table1150, TO: iasC['T/O'].table1150, LDG: iasC.LDG.table1150 } : null;
const S_C = 13.54, B_C = 11.94, MAC_C = 1.121, LEMAC_C = geom ? rr(geom.classic.LEMAC, 3) : 2.236;
const kcasC = (det, kias) => rr(interp(C_TAB[det], kias), 1);
const clmaxC = (mass, vs) => Object.fromEntries(Object.entries(vs).map(([k, v]) => [k, rr(clmaxFromStall({ mass, S: S_C, vs_kcas: interp(C_TAB[k], v), kind: 'min' }).CLmax_1g, 3)]));
const pctC = rr((2.47 - LEMAC_C) / MAC_C * 100, 1);
const inC = m => inertiaFromRadii({ m, b: B_C, L: 8.01, Rx: RADII.single_prop.Rx, Ry: RADII.single_prop.Ry, Rz: RADII.single_prop.Rz });
// static thrust: momentum theory × the NG BEM figure of merit (0.623); sim T0 = same ratio as the NG iteration (4,050/3,450)
const FM_NG = 0.623, T0_RATIO = T0_SIM / 3450;
const tStat = (P, D, pr = 1) => { const Ti = Math.cbrt(P * P * pr * pr * 2 * 1.225 * Math.PI * D * D / 4); return { ideal: Ti, fm: Ti * FM_NG ** (2 / 3) }; };
const sigVTBD = 288.15 / (273.15 + 31);   // VTBD 31 °C, sea-level pressure
const CRUISE_C = L({ ias_kt: 100, h_ft: 3000, gamma_deg: 0 }, 'kt CAS, ft', ['LD6'], 'ต่ำ', true, 'สภาพ trim ของซิม: 100 KCAS (ไม่ใช่ 110 แบบ NG) เพราะ polar จากการร่อนใบพัดหมุนฟรีของโครงรุ่นเดิมทำให้ซิมวันนี้ต้องใช้คันเร่ง 0.96 (da40_180) และ 1.20 (da40d) ที่ 110 KCAS — ดู ld_polar_opts.mjs และ §05.12');
const card180 = rd('ld_card_da40_180_m1200.json')?.res, cardD = rd('ld_card_da40d_m1150.json')?.res;
function classicAirframe(v) {
  return {
    wing: {
      S: L(S_C, 'm2', ['LD6'], 'สูง', false, '13.54 m² (145.7 sq ft) [LD6 p.1-6]; ค่าใน AFM รุ่นเดิมต่างจาก NG (13.244) — ดู §05.12'),
      b: L(B_C, 'm', ['LD6'], 'สูง', false, 'รวม winglet ≈ 11.94 m (39 ft 2 in) [LD6 p.1-6]'),
      MAC: L(MAC_C, 'm', ['LD6'], 'สูง', false, '[LD6 p.1-6]'),
      AR: L(10.53, '-', ['LD6'], 'สูง', false, '[LD6 p.1-6]'),
    },
    geometry: { length: L(8.01, 'm', ['LD6'], 'สูง', false, '26 ft 3 in [LD6 p.1-6]'), span: L(B_C, 'm', ['LD6'], 'สูง', false, '[LD6 p.1-6]') },
    inertia: (() => { const I = inC(v.trainKg); return {
      Ixx: L(Math.round(I.Ixx), 'kg m2', ['LM15', 'LM8'], 'ต่ำ', true, `ค่าประมาณ Roskam radii single_prop × มวลฝึก ${v.trainKg} kg, b 11.94 m, L 8.01 m (lm_inertia, ±30 %)`),
      Iyy: L(Math.round(I.Iyy), 'kg m2', ['LM15', 'LM8'], 'ต่ำ', true, 'เช่นเดียวกับ Ixx'),
      Izz: L(Math.round(I.Izz), 'kg m2', ['LM15', 'LM8'], 'ต่ำ', true, 'เช่นเดียวกับ Ixx'),
      ref_mass: L(v.trainKg, 'kg', ['LD6'], 'ต่ำ', true, 'มวลฝึก (ค่าประมาณ) ที่ CG อ้างอิง 2.47 m DAT') }; })(),
  };
}
function classicAeroRef() {
  return { S: L(S_C, 'm2', ['LD6'], 'สูง', false, 'พื้นที่อ้างอิง = พื้นที่ปีก AFM รุ่นเดิม'), b: L(B_C, 'm', ['LD6'], 'สูง', false, ''), c: L(MAC_C, 'm', ['LD6'], 'สูง', false, 'MAC') };
}
function classicSpeedsCommon() {
  return {
    VNO_kt: L(129, 'kt IAS', ['LD1'], 'สูง', false, '[LD1 p.6, p.13–14]'),
    VNE_kt: L(178, 'kt IAS', ['LD1'], 'สูง', false, '[LD1 p.6, p.13–14]'),
    VFE: L({ TO: 108, LDG: 91 }, 'kt IAS', ['LD1', 'LD6'], 'สูง', false, '[LD1 p.6][LD6 p.2-3]'),
    ias_cas: L(C_TAB, 'kt IAS -> kt CAS', ['LD6', 'LD8'], 'ต่ำ', true, 'ค่าประมาณ (ld_iascas.mjs): KCAS(0°) = KIAS(60°)/√2 จากตาราง stall ตามมุมเอียงที่ 1,150 kg [LD6 p.5-8] (อ่านค่ามุมเอียงได้ไม่ชัด) → ช่วงใกล้ stall IAS อ่านต่ำกว่า CAS 4–5 kt; ตรวจกับ VREF/1.3 ได้ใกล้เคียง; เหนือ 76–79 KIAS ถือว่า IAS = CAS'),
    crosswind_demonstrated_kt: L(20, 'kt', ['LD4'], 'กลาง', false, 'DA40 XLT (IO-360) 20 kt [LD4]'),
  };
}
const flapDets = (cl, vfe) => L([
  { name: 'UP', flap_deg: 0, VFE_kt: null, dCL0: 0, dCD0: 0, dCm0: 0, CLmax: cl.UP },
  { name: 'TO', flap_deg: 20, VFE_kt: vfe.TO, dCL0: 0.52, dCD0: 0.008, dCm0: -0.06, CLmax: cl.TO },
  { name: 'LDG', flap_deg: 42, VFE_kt: vfe.LDG, dCL0: 0.75, dCD0: 0.035, dCm0: -0.10, CLmax: cl.LDG },
], '-', ['LD1', 'LD6', 'LM10'], 'ต่ำ', true, 'มุมแฟลปเท่ากับ NG [LD1 p.7]; VFE รุ่นเดิม 108/91 KIAS; dCL0/dCD0/dCm0 ใช้ของ NG (แฟลปเดียวกัน); CLmax จาก VS รุ่นเดิม (ดู CLmax_target)');
function legacyLeaves(fit, P, T0, cl, label) {
  const o = {};
  if (fit) {
    const pl = fit.legacy.propulsion, al = fit.legacy.aero;
    o.propulsion = { legacy: L({ P, eta: pl.eta, T0: pl.T0, idle: 0 }, '-', ['LM0', 'LD4', 'LD6'], 'ต่ำ', true, `ค่าประมาณ lm_legacy_fit static (${label}): T0 = ${T0_RATIO.toFixed(3)} × แรงขับสถิตโมเมนตัม×FM 0.623 (สัดส่วนเดียวกับ iteration ของ NG §05.9) แล้วหา Vc = ${rr(pl.eta * P / pl.T0, 1)} m/s ให้ ROC ตรงเป้า; eta_sim ${pl.eta}${pl.eta > 0.95 ? ' (> 0.95: พารามิเตอร์รูปทรง ดู §05.12)' : ''}`, 'engine') };
    o.aero = { legacy: L({ CL0: al.CL0, CLa: al.CLa, CLflap: al.CLflap, CDflap: CDFLAP_SIM, CDgear: 0, Cm0: al.Cm0, Cma: al.Cma, Cmflap: al.Cmflap, aStall: al.aStall, aStallFlap: al.aStallFlap, CD0: al.CD0, K: al.K }, '-', ['LM0', 'LD6'], 'ต่ำ', true,
      `ค่าประมาณ lm_legacy_fit (${label}): polar ของซิมจากการร่อนของรุ่นนี้; aStall/aStallFlap แก้หาให้ CLmax 1 g = ${cl.UP} (UP) / ${cl.LDG} (LDG); ค่าอื่นจาก NG`) };
  } else {
    o.propulsion = { legacy: L({ P, eta: 0.9, T0, idle: 0 }, '-', ['LM0'], 'ต่ำ', true, 'ชั่วคราวก่อน fit', 'engine') };
    o.aero = { legacy: L({ CL0: 0.34, CLa: 5.45, CLflap: 0.75, CDflap: CDFLAP_SIM, CDgear: 0, Cm0: 0.02, Cma: -1.6, Cmflap: -0.1, CD0: 0.048, K: 0.082 }, '-', ['LM0'], 'ต่ำ', true, 'ชั่วคราวก่อน fit (ไม่มี aStall ให้ buildAC แก้หาจาก CLmax_target)') };
  }
  return o;
}
function currentModel(c, mass, label) {
  if (!c) return undefined;
  return { performance: L({ mass_kg: mass, VSR_kcas: { UP: rr(c.stall.UP.VSR_cas, 1), TO: rr(c.stall.TO.VSR_cas, 1), LDG: rr(c.stall.LDG.VSR_cas, 1) }, Vy_kt: rr(c.climb.Vy_kt, 1), ROC_fpm: Math.round(c.climb.ROCmax_fpm), glide: { V_kt: rr(c.glide.zeroThrust.Vbg_kt, 1), LD: rr(c.glide.zeroThrust.LD, 2) }, takeoff_m: { flap: c.takeoff.flap, ground: Math.round(c.takeoff.groundRoll_m), d50ft: Math.round(c.takeoff.dist50ft_m) }, landing_m: { asIs: Math.round(c.landing.asIs.total_m), maxBrake: Math.round(c.landing.maxBrake.total_m) }, trim: { cruise_thr: rr(c.trim.cruise.thr, 3), approach_thr: rr(c.trim.approach.thr, 3) } }, 'kt, fpm, -, m', ['LM0'], 'สูง', false, `ผล lm_card ${label} ที่ MTOW กับซิม commit cabf0f0 (regression ของซิมวันนี้ ไม่ใช่ค่าเครื่องจริง)`),
    approach: L(rd3(c.modes.approach), 'rad/s, -, s', ['LM0'], 'สูง', false, 'โหมดเชิงเส้นของซิมวันนี้ที่ approach แฟลป LDG γ −3° (MTOW)'),
    cruise: L(rd3(c.modes.cruise), 'rad/s, -, s', ['LM0'], 'สูง', false, 'โหมดเชิงเส้นของซิมวันนี้ที่ 110 KCAS 3,000 ft (MTOW)') };
}

// ── da40_180: DA 40 / DA 40 CS / XLS / XLT, Lycoming IO-360-M1A, MTOM 1,200 kg (MÄM 40-227)
const V180 = { mtow: 1200, trainKg: 1050, vs: { UP: 53, TO: 52, LDG: 52 } };
const CL180 = C_TAB ? clmaxC(V180.mtow, V180.vs) : { UP: 1.58, TO: 1.6, LDG: 1.65 };
const P180 = 134200, TS180 = tStat(P180, 1.80), T0_180 = Math.round(T0_RATIO * TS180.fm);
const fit180L = legacyLeaves(fit180, P180, T0_180, CL180, 'da40_180');
const v180 = {
  _inherits: L('da40ng', '-', [], 'สูง', false, 'DA 40 / DA 40 CS / XLS / XLT เครื่อง Lycoming IO-360-M1A (TCDS Section A) โครงเดียวกับ NG ต่างที่เครื่องยนต์ ใบพัด มวล ความเร็วจำกัด และปีกตาม AFM รุ่นเดิม; ค่าที่ไม่ได้ระบุในบล็อกนี้รับจาก da40ng (ดูรายการที่ยังไม่ยืนยันใน §05.12)'),
  airframe: {
    identity: L({ manufacturer: 'Diamond Aircraft Industries (TC holder: Diamond Aircraft Industries Inc., Canada)', model: 'DA 40', variant: 'DA 40 (CS) / DA 40 XLS / XLT, MÄM 40-227 (MTOM 1200 kg)', engine: 'Textron Lycoming IO-360-M1A, 4 สูบนอน หัวฉีด', propeller: 'MT-Propeller MTV-12-B/180-17, 3 ใบ constant speed', seats: 4, category: 'normal (utility ≤ 980 kg)', tc_ref: 'EASA TCDS EASA.IM.A.022 Issue 24 (Section A)' }, '-', ['LD1', 'LD5'], 'สูง', false, 'โรงเรียนการบินพลเรือนไทยมี DA 40 CS 7 ลำ [LS1][LS18]; ถ้าไม่ได้ทำ MÄM 40-227 ใช้ MTOM 1,150 kg, VA 108 KIAS และ elevator 23/15°'),
    weights: {
      MTOW: L(1200, 'kg', ['LD1', 'LD5'], 'สูง', false, '2,646 lb กับ MÄM 40-227; มาตรฐาน 1,150 kg (2,535 lb); utility 980 kg [LD1 p.6]'),
      MLW: L(1150, 'kg', ['LD1'], 'กลาง', false, 'MLM 1,092 หรือ 1,150 kg ตามรุ่นย่อยใน TCDS [LD1 p.6]'),
      MRW: L(1200, 'kg', ['LD1'], 'ต่ำ', true, 'ค่าประมาณ: ไม่พบ ramp mass แยกใน TCDS Section A จึงใช้ = MTOM'),
      MZFW: L(1200, 'kg', ['LD1'], 'ต่ำ', true, 'ค่าประมาณ: ไม่พบขีดจำกัด MZFM ใน TCDS Section A จึงใช้ = MTOM'),
      min_flight_mass: L(850, 'kg', ['LD6'], 'ต่ำ', true, 'ค่าประมาณ: มวลต่ำสุดในตารางความเร็ว/สมรรถนะของ AFM [LD6 §3, §5]'),
      BEW_typical: L(792, 'kg', ['LD4'], 'กลาง', false, 'น้ำหนักเปล่ารุ่น XLT ไม่รวมอุปกรณ์เสริม [LD4]; เครื่อง CS รุ่นเก่ามักหนักกว่า'),
      max_fuel_usable: L(rr(152.2 * 0.72, 1), 'kg', ['LD1'], 'สูง', false, '152.2 l (40.2 USgal) AVGAS × 0.72 kg/l; ถังพิสัยไกล 189.2 l = 136 kg [LD1 p.5]'),
      useful_load: L(1200 - 792, 'kg', ['LD4'], 'กลาง', false, 'MTOM − น้ำหนักเปล่า XLT [LD4]'),
      training_mass: L({ kg: 1050, crew_kg: 170, fuel_l: 75, empty_kg: 825 }, 'kg', ['LD6'], 'ต่ำ', true, 'ค่าประมาณ: เปล่า ~825 kg + ครูและศิษย์ 170 kg + AVGAS 75 l (54 kg) ≈ 1,050 kg'),
    },
    cg: {
      LEMAC: L(LEMAC_C, 'm DAT', ['LD6'], 'ต่ำ', true, 'ค่าประมาณ ld_geom.mjs จาก MAC 1.121 m และขอบหน้าปีก; ไม่มีค่าใน AFM'),
      MAC: L(MAC_C, 'm', ['LD6'], 'สูง', false, '[LD6 p.1-6]'),
      envelope: L([[850, 2.40, 2.59], [980, 2.40, 2.59], [1200, 2.48, 2.59]], '[kg, m DAT fwd, m DAT aft]', ['LD1'], 'สูง', false, 'หน้า 2.40 m ถึง 980 kg แล้วเชิงเส้นถึง 2.48 m ที่ 1,200 kg; หลัง 2.59 m (2.55 m เมื่อมีถังพิสัยไกล) [LD1 p.6]; จุด 850 kg เพื่อให้ครอบมวลต่ำสุดที่ประมาณ'),
      ref: L({ m_DAT: 2.47, pct_mac: pctC }, 'm DAT', ['LD1'], 'ต่ำ', true, 'ใช้ CG อ้างอิงเดียวกับ NG (2.47 m DAT) เพื่อให้ตำแหน่งล้อและเครื่องยนต์ใน FRD ใช้ร่วมกันได้'),
    },
    ...classicAirframe(V180),
  },
  speeds: {
    VS0_kt: L(52, 'kt IAS', ['LD6', 'LD4'], 'กลาง', false, 'แฟลป LDG 1,200 kg ปีกระดับ [LD6 p.5-8]; โบรชัวร์ XLT "stall landing 52 KIAS" [LD4]; 49 KIAS ที่ 1,150 kg'),
    VS1_kt: L(53, 'kt IAS', ['LD6'], 'กลาง', false, 'แฟลป UP 1,200 kg [LD6 p.5-8]; 52 KIAS ที่ 1,150 kg, 47 KIAS ที่ 980 kg'),
    VY_kt: L(67, 'kt IAS', ['LD6'], 'ต่ำ', false, 'ความเร็วไต่หลังวิ่งขึ้น แฟลป T/O กำลังเต็ม 1,200 kg [LD6 p.5-13] (เทียบ Vy แฟลป T/O ของ NG); ไต่แบบ cruise climb แฟลป UP 76 KIAS [LD6 p.5-15]'),
    VR_kt: L(59, 'kt IAS', ['LD6'], 'กลาง', false, 'ความเร็วยกล้อโดยประมาณตามขั้นตอนวิ่งขึ้น แฟลป T/O [LD6 p.5-10]'),
    VAPP_kt: L(73, 'kt IAS', ['LD6', 'LD8'], 'ต่ำ', false, 'แฟลป LDG 1,200 kg (71 KIAS ที่ 1,150 kg) [LD6 p.3-4][LD8]; การจับคู่คอลัมน์ในสำเนา AFM อ่านไม่ชัด'),
    VREF_kt: L(73, 'kt IAS', ['LD6', 'LD8'], 'ต่ำ', false, 'เท่ากับ VAPP ข้างบน; แฟลป UP 73 KIAS ที่ 1,150 kg [LD8]'),
    VG_kt: L(76, 'kt IAS', ['LD6'], 'สูง', false, 'best glide แฟลป UP ใบพัดหมุนฟรี 1,200 kg; 73/68/60 KIAS ที่ 1,150/1,000/850 kg [LD6 p.3-28]'),
    VA_kt: L({ 1036: 94, 1200: 111 }, 'kt IAS', ['LD1', 'LD6'], 'สูง', false, 'MÄM 40-227: 94 KIAS ถึง 1,036 kg, 111 KIAS เหนือกว่านั้น; มาตรฐาน 94 (≤ 980 kg) / 108 KIAS [LD1 p.6][LD6 p.2-3]'),
    stall_table: L({ axes: { mass_kg: [980, 1150, 1200], flap: ['UP', 'TO', 'LDG'] }, data: [[47, 52, 53], [44, 51, 52], [42, 49, 52]], bank_deg: 0 }, 'kt IAS', ['LD6', 'LD8'], 'กลาง', false, 'ปีกระดับ idle [LD6 p.5-8] (DA 40 D ใช้ค่าเดียวกัน [LD8])'),
    ...classicSpeedsCommon(),
  },
  performance: {
    ROC_SL_fpm: L(780, 'fpm', ['LD4'], 'กลาง', false, 'XLT MTOM 1,200 kg ISA MSL [LD4] (ไม่ระบุแฟลป); หน้าเว็บระบุว่า XLT มาตรฐานใช้ใบพัด Hartzell 2 ใบโลหะ (MT 3 ใบเป็นตัวเลือก) ขณะที่บัตรใช้ MTV-12-B/180-17 ตาม TCDS EASA (§05.12)'),
    cruise_table: L([{ h_ft: 0, load_pct: 100, ktas: 142 }, { h_ft: 6000, load_pct: 75, ktas: 137 }], 'ft, %, kt TAS', ['LD4'], 'กลาง', false, 'max cruise MSL กำลังต่อเนื่องสูงสุด 142 KTAS; 75 % ที่ 6,000 ft 137 KTAS [LD4]'),
    glide: L({ speed_kt: 76, ratio: 8.8 }, 'kt IAS, -', ['LD6'], 'กลาง', false, 'แฟลป UP ใบพัดหมุนฟรี 8.8 (1.45 NM/1,000 ft); ใบพัดหยุด 10.3 [LD6 p.3-28]'),
    takeoff: L({ ground_roll_m: 305, over50ft_m: 450 }, 'm', ['LD4'], 'กลาง', false, 'XLT MTOM ISA MSL [LD4] (หน้าเว็บเขียนว่า take-off obstacle ไม่ระบุความสูง ถือเป็น 50 ft ตามบท 5 ของ AFM); แฟลป T/O; XLT ใบพัด Hartzell 2 ใบเป็นมาตรฐาน'),
    landing: L({ ground_roll_m: 290, over50ft_m: 620 }, 'm', ['LD4', 'LD6'], 'กลาง', false, 'XLT MTOM ISA MSL แฟลป LDG [LD4]; แฟลป UP 471/775 m ที่ 1,150 kg [LD6 p.5-21]'),
    fuel: L({ fuel: 'AVGAS 100LL', usable_l: { standard: 152.2, long_range: 189.2 }, ff_lph_65pct: 31 }, 'l, l/h', ['LD1', 'LD4'], 'สูง', false, '[LD1 p.5][LD4]'),
  },
  propulsion: {
    layout: L([{ id: 1, pos: [2.22, 0, 0.05], axis: [1, 0, 0], type: 'piston', model: 'Lycoming IO-360-M1A', prop_sense: 1 }], 'm FRD', ['LD1'], 'ต่ำ', true, 'ตำแหน่งดุมใช้ของ NG (ค่าประมาณ); เครื่องขับตรงไม่มีเกียร์'),
    ...fit180L.propulsion,
  },
  piston: {
    identity: L({ model: 'Textron Lycoming IO-360-M1A', kind: 'fuel_injected', displacement_L: 5.92, cylinders: 4, tcds: 'FAA 1E10' }, '-', ['LD1', 'LD6'], 'สูง', false, '4 สูบนอน ระบายความร้อนด้วยอากาศ ขับใบพัดตรง [LD1 p.4]'),
    ratings: L({ P_rated: P180, rpm_rated: 2700, P_mcp: Math.round(P180 * 2400 / 2700), rpm_mcp: 2400, rpm_redline: 2700, rpm_overspeed: null, rpm_idle: null, takeoff_time_limit_s: null }, 'W, rpm', ['LD1', 'LD4'], 'กลาง', true, '180 hp ที่ 2,700 rpm [LD4]; รอบสูงสุด take-off 2,700, ต่อเนื่อง 2,400 rpm [LD1 p.4]; P_mcp ค่าประมาณ ∝ rpm'),
    altitude: L({ model: 'gagg_ferrar', critical_alt_m: 0, max_operating_alt_m: 5000 }, '-', ['LM12', 'LD5'], 'กลาง', true, 'เครื่องดูดอากาศธรรมชาติ P/P0 = 1.132σ − 0.132 (Gagg–Ferrar, ค่าประมาณ); ความสูงสาธิตสูงสุด 5,000 m [LD5]'),
    power_map: L({ axes: { rpm: [2400, 2700] }, data: [Math.round(P180 * 2400 / 2700), P180] }, 'W (คันเร่งสุด SL)', ['LD1', 'LD4'], 'ต่ำ', true, 'ค่าประมาณ: กำลังเต็มคันเร่งที่ SL ∝ rpm; ไม่มีตาราง MAP–rpm ที่เปิดอ่านได้'),
    fuel: L({ fuel: 'AVGAS 100LL', bsfc_g_per_kWh: { 65: Math.round(31 * 0.72 / (0.65 * P180 / 1000) * 1000) }, ff_table: [[65, 31]] }, 'g/kWh, [load %, l/h]', ['LD4'], 'กลาง', true, 'BSFC คำนวณจาก 31 l/h ที่ 65 % [LD4] × 0.72 kg/l'),
    dynamics: L({ tau_throttle_s: 0.2, I_engine: null, friction_torque: null }, 's, kg m2, N m', ['LM12'], 'ต่ำ', true, 'ค่าประมาณ: เครื่องดูดอากาศธรรมชาติตอบสนองเร็วกว่าดีเซลเทอร์โบ'),
    fadec: L('none: throttle (MAP) + propeller rpm lever + mixture', '-', ['LD6'], 'สูง', false, 'ไม่มี FADEC: คันเร่ง คันรอบใบพัด และคันส่วนผสม [LD6 §7]'),
  },
  propeller: {
    identity: {
      model: L('MT-Propeller MTV-12-B/180-17', '-', ['LD1', 'LD16'], 'สูง', false, 'EASA P.013 [LD1 p.4–5][LD16]; ใบไม้หุ้มคอมโพสิต 3 ใบ hub ไฮดรอลิก right-hand tractor [LD16 p.6–10]'),
      diameter: L(1.80, 'm', ['LD1', 'LD16'], 'สูง', false, '1,800 mm [LD1 p.5]; ช่วงที่รับรอง 152–210 cm [LD16 p.6]'),
      massComplete: L(20, 'kg', ['LD16'], 'กลาง', false, 'ราว 20 kg สำหรับ configuration constant speed ของ MTV-12 (ไม่ระบุรายรุ่น) [LD16 p.6]; ใบพัดตระกูลนี้รับได้ 168 kW ที่ 2,800 rpm [LD16 p.7] (NG: MTV-6 ราว 14 kg)'),
    },
    inertia: { Ip: L(1.8, 'kg m2', ['LD16'], 'ต่ำ', true, 'ค่าประมาณ: สเกลจาก Ip 1.4 kg m² ของใบพัด NG ด้วยมวล 20/14 และรัศมี (0.90/0.95)²') },
    engineInterface: {
      maxShaftPower: L(134.2, 'kW', ['LD4'], 'กลาง', false, '180 hp'),
      rpmGoverned: L(2700, 'rpm', ['LD1'], 'สูง', false, 'take-off [LD1 p.4]'),
      rpmTransientLimit: L(2700, 'rpm', ['LD1'], 'ต่ำ', true, 'ค่าประมาณ: ไม่พบค่าผ่อนผัน overspeed ใช้ redline'),
      gearRatio: L(1, '-', ['LD1'], 'สูง', false, 'ขับตรง'),
    },
    governor: {
      betaFlightIdle: L(10.5, 'deg @0.75R', ['LD1'], 'สูง', false, 'low pitch 10.5° [LD1 p.5]'),
      betaHigh: L(30, 'deg @0.75R', ['LD1'], 'สูง', false, 'high pitch 30° [LD1 p.5]'),
      rpmOverspeed: L(2700, 'rpm', ['LD1'], 'ต่ำ', true, 'ค่าประมาณ = redline'),
    },
    checks: {
      staticThrustISA: L(rr(TS180.fm / 1000, 2), 'kN', ['LM0'], 'ต่ำ', true, `ค่าประมาณ: โมเมนตัม ${rr(TS180.ideal / 1000, 2)} kN × FM^(2/3) ด้วย FM 0.623 ของ BEM ใบพัด NG (ตารางไร้มิติ CT/CP รับจาก NG)`),
      staticThrustVTBD31C: L(rr(tStat(P180, 1.80, 1.132 * sigVTBD - 0.132).fm * Math.cbrt(sigVTBD) / 1000, 2), 'kN', ['LM0'], 'ต่ำ', true, 'ค่าประมาณ 31 °C: กำลัง × (1.132σ − 0.132) และ ρ ลดลง (σ 0.947)'),
      momentumIdealStaticISA: L(rr(TS180.ideal / 1000, 2), 'kN', ['LM0'], 'กลาง', false, '(P² · 2ρA)^(1/3), D 1.80 m, 134.2 kW'),
    },
  },
  controls: { surfaces: {
    elevator: L({ travel_deg: { up: 18, down: 16 }, tol: null, rate_dps: null, actuator_tau_s: null }, 'deg', ['LD1'], 'สูง', false, 'MTOM 1,200 kg (MÄM 40-227) 18/16°; มาตรฐาน 23±1/15±1°, ถังพิสัยไกล 23/16° [LD1 p.7]'),
    rudder: L({ travel_deg: { left: 29, right: 31 }, tol: '±1', rate_dps: null, actuator_tau_s: null }, 'deg', ['LD1'], 'สูง', false, 'มาตรฐาน; ถังพิสัยไกลหรือ rudder ใหญ่ 24/26° [LD1 p.7]'),
  },
  pitch: { stops: L({ teu: 18, ted: 16 }, 'deg', ['LD1'], 'สูง', false, 'MÄM 40-227 (MTOM 1,200 kg) 18/16° [LD1 p.7]') },
  yaw: { stops: L({ left: 29, right: 31, max: 29 }, 'deg', ['LD1'], 'สูง', false, 'มาตรฐาน 29/31° [LD1 p.7]; max = min(left, right)') } },
  interference: { slipstream: { diskDiameter: L(1.80, 'm', ['LD1'], 'สูง', false, 'MTV-12-B/180-17 [LD1 p.5]') }, groundEffect: { A: L(10.53, '-', ['LD6'], 'สูง', false, 'AR ปีกรุ่นเดิม [LD6 p.1-6]') } },
  aero: {
    ref: classicAeroRef(),
    static_long: { CLmax_target: L(CL180, '-', ['LD6', 'LM2'], 'ต่ำ', true, `CLmax 1 g ที่ 1,200 kg จาก VS ${V180.vs.UP}/${V180.vs.TO}/${V180.vs.LDG} KIAS → ${kcasC('UP', 53)}/${kcasC('TO', 52)}/${kcasC('LDG', 52)} KCAS (ตาราง ld_iascas รุ่นเดิม) ด้วย clmaxFromStall (min, n_z 0.95); สูงกว่า NG ราว 15 % — ดูความขัดแย้ง §05.12`) },
    flaps: { detents: flapDets(CL180, { TO: 108, LDG: 91 }) },
    ...fit180L.aero,
  },
  validation: {
    takeoff_test: L({ flap: 'TO', VR_kt: kcasC('TO', 59), theta_deg: 8 }, 'kt CAS, deg', ['LD6'], 'กลาง', true, 'VR ≈ 59 KIAS [LD6 p.5-10] → KCAS ด้วยตาราง TO รุ่นเดิม; มุมเงย 8° ค่าประมาณ'),
    trim_targets: { approach: L({ ias_kt: Math.round(kcasC('LDG', 73)), h_m: 300, gamma_deg: -3 }, 'kt CAS, m, deg', ['LD6'], 'ต่ำ', true, 'VREF 73 KIAS แฟลป LDG → KCAS'), cruise: CRUISE_C },
    ...(card180 ? { currentModel: currentModel(card180, 1200, 'da40_180') } : {}),
  },
};

// ── da40d: DA 40 D, TAE 125-01 / TAE 125-02-99, MTOM 1,150 kg
const VD = { mtow: 1150, trainKg: 1060, vs: { UP: 52, TO: 51, LDG: 49 } };
const CLD = C_TAB ? clmaxC(VD.mtow, VD.vs) : { UP: 1.6, TO: 1.62, LDG: 1.7 };
const PD = 99000, TSD = tStat(PD, 1.87), T0_D = Math.round(T0_RATIO * TSD.fm);
const fitDL = legacyLeaves(fitD, PD, T0_D, CLD, 'da40d');
const vD = {
  _inherits: L('da40ng', '-', [], 'สูง', false, 'DA 40 D (TDI) เครื่องดีเซล TAE 125 (TCDS Section B) โครงรุ่นเดิม; ค่าที่ไม่ได้ระบุในบล็อกนี้รับจาก da40ng (ดู §05.12)'),
  airframe: {
    identity: L({ manufacturer: 'Diamond Aircraft Industries (TC holder: Diamond Aircraft Industries Inc., Canada)', model: 'DA 40 D', variant: 'DA 40 D (TDI), MTOM 1150 kg', engine: 'Thielert / Technify TAE 125-01 หรือ TAE 125-02-99 turbo-diesel, FADEC คันเดียว', propeller: 'MT-Propeller MTV-6-A/187-129, 3 ใบ constant speed', seats: 4, category: 'normal (utility ≤ 980 kg)', tc_ref: 'EASA TCDS EASA.IM.A.022 Issue 24 (Section B); engine EASA E.055' }, '-', ['LD1', 'LD5', 'LD11'], 'สูง', false, 'โรงเรียนการบินพลเรือนไทยมี DA 40 D 9 ลำ [LS1][LS18]'),
    weights: {
      MTOW: L(1150, 'kg', ['LD1', 'LD5'], 'สูง', false, '2,535 lb; utility 980 kg [LD1 p.14]'),
      MLW: L(1150, 'kg', ['LD1', 'LD8'], 'กลาง', false, 'MLM 1,092 หรือ 1,150 kg ตามรุ่นย่อย [LD1 p.14]; handout ใช้ 1,150 kg [LD8]'),
      MRW: L(1150, 'kg', ['LD1'], 'ต่ำ', true, 'ค่าประมาณ = MTOM (ไม่พบ ramp mass แยก)'),
      MZFW: L(1150, 'kg', ['LD1'], 'ต่ำ', true, 'ค่าประมาณ = MTOM (ไม่พบ MZFM ใน TCDS Section B)'),
      min_flight_mass: L(850, 'kg', ['LD6'], 'ต่ำ', true, 'ค่าประมาณ: มวลต่ำสุดในตาราง AFM โครงเดียวกัน'),
      BEW_typical: L(830, 'kg', ['LD8'], 'ต่ำ', false, 'น้ำหนักเปล่าทั่วไป [LD8]'),
      max_fuel_usable: L(rr(106.0 * 0.80, 1), 'kg', ['LD1'], 'สูง', false, '106.0 l (28 USgal) Jet A-1 × 0.80 kg/l; ถังพิสัยไกล 147.6 l = 118 kg [LD1 p.13]'),
      useful_load: L(1150 - 830, 'kg', ['LD8'], 'ต่ำ', false, 'MTOM − น้ำหนักเปล่าทั่วไป'),
      training_mass: L({ kg: 1060, crew_kg: 170, fuel_l: 75, empty_kg: 830 }, 'kg', ['LD8'], 'ต่ำ', true, 'ค่าประมาณ: 830 + 170 + Jet A-1 75 l (60 kg) ≈ 1,060 kg'),
    },
    cg: {
      LEMAC: L(LEMAC_C, 'm DAT', ['LD6'], 'ต่ำ', true, 'ค่าประมาณ ld_geom.mjs (โครงรุ่นเดิม)'),
      MAC: L(MAC_C, 'm', ['LD6'], 'สูง', false, '[LD6 p.1-6]'),
      envelope: L([[850, 2.40, 2.59], [980, 2.40, 2.59], [1150, 2.46, 2.59]], '[kg, m DAT fwd, m DAT aft]', ['LD1', 'LD8'], 'สูง', false, 'หน้า 2.40 m ถึง 980 kg แล้วเชิงเส้นถึง 2.46 m ที่ 1,150 kg; หลัง 2.59 m (2.55 m ถังพิสัยไกล) [LD1 p.14]'),
      ref: L({ m_DAT: 2.47, pct_mac: pctC }, 'm DAT', ['LD1'], 'ต่ำ', true, 'CG อ้างอิงเดียวกับ NG'),
    },
    ...classicAirframe(VD),
  },
  speeds: {
    VS0_kt: L(49, 'kt IAS', ['LD8', 'LD6'], 'กลาง', false, 'แฟลป LDG 1,150 kg; 42 KIAS ที่ 980 kg [LD8][LD6 p.5-8]'),
    VS1_kt: L(52, 'kt IAS', ['LD8', 'LD6'], 'กลาง', false, 'แฟลป UP 1,150 kg; 47 KIAS ที่ 980 kg'),
    VY_kt: L(66, 'kt IAS', ['LD8'], 'ต่ำ', false, 'ความเร็วไต่หลังวิ่งขึ้น แฟลป T/O [LD8]; cruise climb แฟลป UP 73 KIAS'),
    VR_kt: L(59, 'kt IAS', ['LD8'], 'กลาง', false, '[LD8]'),
    VAPP_kt: L(71, 'kt IAS', ['LD8'], 'กลาง', false, 'แฟลป LDG 1,150 kg; แฟลป UP 73 KIAS [LD8]'),
    VREF_kt: L(71, 'kt IAS', ['LD8'], 'กลาง', false, 'handout เรียกว่า VREF [LD8]'),
    VG_kt: L(73, 'kt IAS', ['LD6'], 'ต่ำ', true, 'ค่าประมาณ: best glide ของโครงรุ่นเดิม 1,150 kg [LD6 p.3-28]; ใบพัดดีเซลหมุนฟรีอาจต่างกัน'),
    VA_kt: L({ 980: 94, 1150: 108 }, 'kt IAS', ['LD1'], 'สูง', false, '[LD1 p.13–14]'),
    stall_table: L({ axes: { mass_kg: [980, 1150], flap: ['UP', 'TO', 'LDG'] }, data: [[47, 52], [44, 51], [42, 49]], bank_deg: 0 }, 'kt IAS', ['LD8', 'LD6'], 'กลาง', false, '[LD8] ตรงกับ [LD6 p.5-8]'),
    ...classicSpeedsCommon(),
    crosswind_demonstrated_kt: L(20, 'kt', ['LD4'], 'ต่ำ', true, 'ค่าประมาณ: ใช้ค่าของโครงรุ่นเดิม (XLT 20 kt [LD4]); ยังไม่พบค่าของ DA 40 D'),
  },
  performance: {
    ROC_SL_fpm: L(550, 'fpm', ['LD14'], 'ต่ำ', true, 'ค่าประมาณ: นักบินอ่านจากกราฟ AFM ≈ 500 fpm ถึง 6,000 ft, 450 fpm ที่ 7,000 ft ที่ MTOM [LD14] → ต่อลงถึงระดับน้ำทะเล (+≈ 85 fpm จากกำลังที่ต้องใช้เพิ่มตาม 1/√σ, เครื่อง turbo flat-rated)'),
    cruise_table: L([{ h_ft: 0, load_pct: 70, ktas: 115 }, { h_ft: 6000, load_pct: 70, ktas: 121 }, { h_ft: 10000, load_pct: 70, ktas: 127 }], 'ft, %, kt TAS', ['LD8', 'LD14'], 'ต่ำ', false, '6,000 ft [LD8]; SL และ FL100 อ่านจากกราฟโดยนักบิน (รุ่น 1.7) [LD14]'),
    glide: L({ speed_kt: 73, ratio: 8.8 }, 'kt IAS, -', ['LD6'], 'ต่ำ', true, 'ค่าประมาณ: ใช้ของโครงรุ่นเดิม 1,150 kg (ใบพัด Lycoming หมุนฟรี) [LD6 p.3-28]'),
    takeoff: L({ ground_roll_m: Math.round(640 * 397 / 590), over50ft_m: 640 }, 'm', ['LD8', 'LD4'], 'ต่ำ', true, 'ระยะข้ามสิ่งกีดขวาง 50 ft 640 m SL ISA 1,150 kg [LD8]; ระยะวิ่ง ≈ 640 × (397/590 ของ NG [LD4]) เป็นค่าประมาณ'),
    landing: L({ ground_roll_m: 290, over50ft_m: 620 }, 'm', ['LD4'], 'ต่ำ', true, 'ค่าประมาณ: ใช้ของ XLT (โครงเดียวกัน 1,200 kg) [LD4]'),
    fuel: L({ fuel: 'Jet A-1 / Jet A', usable_l: { standard: 106.0, long_range: 147.6 }, ff_lph_70pct: 18.9, ff_lph_100pct: 30.3 }, 'l, l/h', ['LD1', 'LD8', 'LD14'], 'กลาง', false, '[LD1 p.13]; ≈ 5 USgal/h ที่ 70 % [LD8][LD14]; ≈ 8 USgal/h กำลังเต็ม [LD14]'),
  },
  propulsion: {
    layout: L([{ id: 1, pos: [2.22, 0, 0.05], axis: [1, 0, 0], type: 'piston', model: 'TAE 125-02-99', prop_sense: 1 }], 'm FRD', ['LD1'], 'ต่ำ', true, 'ตำแหน่งดุมใช้ของ NG (ค่าประมาณ)'),
    ...fitDL.propulsion,
  },
  piston: {
    identity: L({ model: 'TAE 125-02-99 (เดิม TAE 125-01)', kind: 'turbo_diesel', displacement_L: 1.991, cylinders: 4, tcds: 'EASA E.055' }, '-', ['LD11', 'LD1'], 'สูง', false, 'TAE 125-01: 1.689 l น้ำหนักแห้ง 134 kg; TAE 125-02-99: 1.991 l น้ำหนักแห้ง 153 kg; เกียร์ทด 1:1.689 ทั้งสองรุ่น [LD11 p.6]; เปลี่ยน -01 เป็น -02-99 ด้วย MÄM 40-256 + OSB D4-061 [LD1 p.17]'),
    ratings: L({ P_rated: PD, rpm_rated: 2300, P_mcp: PD, rpm_mcp: 2300, rpm_redline: 2300, rpm_overspeed: null, rpm_idle: null, takeoff_time_limit_s: null }, 'W, rpm (ใบพัด)', ['LD11', 'LD1', 'LD8'], 'สูง', false, '99 kW (135 hp) ที่ 3,900 rpm เพลาข้อเหวี่ยง ≈ 2,300 rpm ใบพัด ทั้ง take-off และต่อเนื่อง [LD11][LD8]; TCDS เครื่องบินจำกัด 2,300 rpm ใบพัด [LD1 p.12]'),
    altitude: L({ model: 'table', critical_alt_m: 1830, max_operating_alt_m: 5000, table: { axes: { h_ft: [0, 6000, 8000, 10000, 16000] }, data: [1.0, 1.0, 0.9, 0.8, 0.7] } }, '-, ft, สัดส่วนกำลังสูงสุด', ['LD14', 'LD5'], 'ต่ำ', true, 'ค่าประมาณ: นักบินอ่านจากกราฟ AFM ของรุ่น 1.7 l ว่ากำลังสูงสุดได้ 100 % ถึง FL60, 90 % ที่ FL80, 80 % ที่ FL100 และคง 70 % ได้ถึง FL160 [LD14] (เทอร์โบที่คงกำลังได้ถึงราว 6,000 ft ไม่ใช่ flat-rated ถึงระดับสูงแบบ AE300 ตามที่ฉบับแรกตั้งไว้); ใช้กับ -02-99 จนกว่าจะได้ AFM บท 5; ความสูงสาธิต 5,000 m [LD5]'),
    power_map: L({ axes: { load_pct: [0, 100] }, data: [0, PD] }, 'W', ['LD8'], 'กลาง', true, 'FADEC: กำลัง = load % × 99 kW (เชิงเส้น ค่าประมาณ)'),
    fuel: L({ fuel: 'Jet A-1', bsfc_g_per_kWh: { 70: Math.round(18.9 * 0.80 / (0.70 * 99) * 1000), 100: Math.round(30.3 * 0.80 / 99 * 1000) }, ff_table: [[70, 18.9], [100, 30.3]] }, 'g/kWh, [load %, l/h]', ['LD8', 'LD14'], 'ต่ำ', true, 'BSFC คำนวณจากอัตราสิ้นเปลืองที่นักบินรายงาน × 0.80 kg/l'),
    fadec: L({ lever_to_load: 'load % = 100 × lever (single power lever)', rpm_schedule: [[100, 2300]] }, '[load %, rpm]', ['LD8'], 'ต่ำ', false, 'FADEC คันเดียวคุมทั้งกำลังและรอบ; ยืนยันได้เฉพาะ 2,300 rpm ที่ 100 % [LD8]'),
  },
  propeller: {
    identity: {
      model: L('MT-Propeller MTV-6-A/187-129', '-', ['LD1'], 'สูง', false, '[LD1 p.12–13]'),
      diameter: L(1.87, 'm', ['LD1'], 'สูง', false, '1,870 mm [LD1 p.13]'),
    },
    engineInterface: {
      maxShaftPower: L(99, 'kW', ['LD11'], 'สูง', false, '[LD11 p.6]'),
      rpmGoverned: L(2300, 'rpm', ['LD1', 'LD11'], 'สูง', false, 'take-off และต่อเนื่อง 2,300 rpm ใบพัด [LD1 p.12]; 3,900 rpm เพลาข้อเหวี่ยง / 1.689 [LD11 p.6]'),
      rpmTransientLimit: L(2500, 'rpm', ['LD2'], 'ต่ำ', true, 'ค่าประมาณ: ไม่ได้เปิด AFM DA 40 D บท 2 จึงใช้ค่า overspeed ของ NG (2,500 rpm ≤ 20 s [LD2 p.2-6]) ที่ใบพัด MTV-6 รับได้ [LD9 p.8]'),
      gearRatio: L(1.689, '-', ['LD11'], 'สูง', false, 'เกียร์ทด 1:1.689 [LD11 p.6]'),
    },
    governor: {
      betaFlightIdle: L(12, 'deg @0.75R', ['LD1'], 'สูง', false, 'low pitch 12° [LD1 p.13]'),
      betaHigh: L(28, 'deg @0.75R', ['LD1'], 'สูง', false, 'high pitch 28° [LD1 p.13]'),
      rpmOverspeed: L(2500, 'rpm', ['LD2', 'LD9'], 'ต่ำ', true, 'ค่าประมาณ: ใช้ค่า overspeed ของ NG เพราะไม่ได้เปิด AFM DA 40 D บท 2'),
    },
    checks: {
      staticThrustISA: L(rr(TSD.fm / 1000, 2), 'kN', ['LM0'], 'ต่ำ', true, `ค่าประมาณ: โมเมนตัม ${rr(TSD.ideal / 1000, 2)} kN × FM^(2/3) ด้วย FM 0.623 ของ BEM ใบพัด NG`),
      staticThrustVTBD31C: L(rr(TSD.fm * Math.cbrt(sigVTBD) / 1000, 2), 'kN', ['LM0'], 'ต่ำ', true, 'ค่าประมาณ 31 °C: เครื่อง flat-rated กำลังคงที่ แรงขับ ∝ σ^(1/3)'),
      momentumIdealStaticISA: L(rr(TSD.ideal / 1000, 2), 'kN', ['LM0'], 'กลาง', false, '(P² · 2ρA)^(1/3), D 1.87 m, 99 kW'),
    },
  },
  controls: { surfaces: {
    elevator: L({ travel_deg: { up: 23, down: 15 }, tol: { up: '±1', down: '±1' }, rate_dps: null, actuator_tau_s: null }, 'deg', ['LD1'], 'สูง', false, 'มาตรฐาน; ถังพิสัยไกล 23/16° [LD1 p.14–15]'),
    rudder: L({ travel_deg: { left: 29, right: 31 }, tol: '±1', rate_dps: null, actuator_tau_s: null }, 'deg', ['LD1'], 'สูง', false, 'มาตรฐาน; ถังพิสัยไกลหรือ rudder ใหญ่ 24/26° [LD1 p.14–15]'),
  },
  pitch: { stops: L({ teu: 23, ted: 15 }, 'deg', ['LD1'], 'สูง', false, 'มาตรฐาน 23/15° (ถังพิสัยไกล 23/16°) [LD1 p.14]') },
  yaw: { stops: L({ left: 29, right: 31, max: 29 }, 'deg', ['LD1'], 'สูง', false, 'มาตรฐาน 29/31° [LD1 p.14–15]; max = min(left, right)') } },
  interference: { slipstream: { diskDiameter: L(1.87, 'm', ['LD1'], 'สูง', false, 'MTV-6-A/187-129 [LD1 p.13]') }, groundEffect: { A: L(10.53, '-', ['LD6'], 'สูง', false, 'AR ปีกรุ่นเดิม [LD6 p.1-6]') } },
  aero: {
    ref: classicAeroRef(),
    static_long: { CLmax_target: L(CLD, '-', ['LD8', 'LD6', 'LM2'], 'ต่ำ', true, `CLmax 1 g ที่ 1,150 kg จาก VS 52/51/49 KIAS → ${kcasC('UP', 52)}/${kcasC('TO', 51)}/${kcasC('LDG', 49)} KCAS (ld_iascas รุ่นเดิม) ด้วย clmaxFromStall (min, n_z 0.95)`) },
    flaps: { detents: flapDets(CLD, { TO: 108, LDG: 91 }) },
    ...fitDL.aero,
  },
  validation: {
    takeoff_test: L({ flap: 'TO', VR_kt: kcasC('TO', 59), theta_deg: 8 }, 'kt CAS, deg', ['LD8'], 'กลาง', true, 'VR 59 KIAS [LD8] → KCAS ด้วยตาราง TO รุ่นเดิม'),
    trim_targets: { approach: L({ ias_kt: Math.round(kcasC('LDG', 71)), h_m: 300, gamma_deg: -3 }, 'kt CAS, m, deg', ['LD8'], 'กลาง', true, 'VREF 71 KIAS แฟลป LDG → KCAS'), cruise: CRUISE_C },
    ...(cardD ? { currentModel: currentModel(cardD, 1150, 'da40d') } : {}),
  },
};

const types = { da40ng: ng, da40_180: v180, da40d: vD };
// review 2026-11-18: every est:true leaf carries the word ค่าประมาณ in its note (owner rule 3); the method follows in the note
const labelEst = o => { if (o && typeof o === 'object' && 'v' in o && 'src' in o) { if (o.est && !/ค่าประมาณ/.test(o.note || '')) o.note = 'ค่าประมาณ: ' + (o.note || 'ไม่ระบุวิธี'); } else if (o && typeof o === 'object') Object.values(o).forEach(labelEst); };
labelEst(types);

// ───────────────────────── output ─────────────────────────
const CATS = ['airframe', 'speeds', 'performance', 'propulsion', 'piston', 'propeller', 'aero', 'controls', 'gear', 'interference', 'wind', 'input', 'validation', 'numerics', '_na', '_inherits'];
function blocks() {
  let s = '';
  for (const [id, t] of Object.entries(types)) {
    s += `\n#### ${id}\n`;
    for (const c of CATS) if (t[c] !== undefined) s += '\n```json\n' + JSON.stringify({ [id]: { [c]: t[c] } }, null, 1) + '\n```\n';
  }
  return s;
}
const txt = blocks();
fs.mkdirSync(OUTDIR, { recursive: true });
fs.writeFileSync(new URL('ld_json_blocks.md', OUTDIR), txt);
if (!process.argv.includes('--dry')) {
  const md = fs.readFileSync(TOPIC, 'utf8');
  const a = md.indexOf('<!-- LD-JSON-START -->'), b = md.indexOf('<!-- LD-JSON-END -->');
  if (a < 0 || b < 0) { console.error('markers not found in 05-da40.md'); process.exit(1); }
  fs.writeFileSync(TOPIC, md.slice(0, a) + '<!-- LD-JSON-START -->\n' + txt + '\n' + md.slice(b));
}
let n = 0; const cnt = o => { if (o && typeof o === 'object' && 'v' in o && 'src' in o) n++; else if (o && typeof o === 'object') Object.values(o).forEach(cnt); };
cnt(types);
console.log(`ld_json: ${Object.keys(types).join(', ')} — ${n} leaves, ${txt.length} chars${process.argv.includes('--dry') ? ' (dry)' : ' → 05-da40.md'}`);
