#!/usr/bin/env node
// lt_json.mjs — builds the JSON blocks of 06-da42.md (types da42ng, da42_tae125, da42_vi) from published values and from
// the outputs of the LM/LT estimation scripts, then splices them into the topic file between
//   <!-- LT-JSON-START --> … <!-- LT-JSON-END -->
//   node scripts/lt_json.mjs          -> writes scripts/out/lt_json_blocks.md and updates ../06-da42.md
//   node scripts/lt_json.mjs --dry    -> only writes scripts/out/lt_json_blocks.md
// Inputs (run first): out/lt_geom.json (lt_geom.mjs), out/lt_polar.json (lt_polar.mjs); optional out/lt_fit_<id>.json
// (lt_run.mjs fit) for aero.legacy / propulsion.legacy. Derivatives: lm_derivs.estimate (ค่าประมาณจากรูปทรง §01.3).
// Every leaf {v,u,scope,src,conf,est,note} (schema-ext-r2 §1). Source codes refer to 06-da42.md §06.13.
import fs from 'node:fs';
import { geoFromCard, estimate, tauFlap } from './lm_derivs.mjs';
import { PROPS, bem } from './lm_prop.mjs';
import { loadType, iasCas } from './lm_lib.mjs';
import { normaliseScopes } from './lc_cardfix.mjs';   // shared D4 scope rule (lm_lib.expectedScope), read-only use
const OUT = new URL('./out/', import.meta.url), TOPIC = new URL('../06-da42.md', import.meta.url);
const rd = f => { try { return JSON.parse(fs.readFileSync(new URL(f, OUT), 'utf8')); } catch { return null; } };
const geom = rd('lt_geom.json'), pol = rd('lt_polar.json');
if (!geom || !pol) { console.error('run lt_geom.mjs and lt_polar.mjs first'); process.exit(1); }
const fit = { da42ng: rd('lt_fit_da42ng.json'), da42_tae125: rd('lt_fit_da42_tae125.json'), da42_vi: rd('lt_fit_da42_vi.json') };
// optional (19 Nov 2026): OEI/ROC model (lt_oei_ceiling.mjs), test table (lt_tests.mjs), sim card result (lt_run.mjs card)
const ceil = rd('lt_oei_ceiling.json'), LTT = rd('lt_tests.json'), cardNG = rd('lt_card_da42ng.json');
const r = (x, n = 4) => (typeof x === 'number' ? +x.toPrecision(n) : x);
const L = (v, u, src, conf, est, note, scope = 'aircraft') => ({ v, u, scope, src, conf, est, note });
const KT = 0.514444, G0 = 9.80665, DEG = Math.PI / 180, RAD = 180 / Math.PI;
const W = geom.wing, T = geom.tail, I = geom.inertia.training, CG_REF = I.x_cg;
const FRDx = xDAT => r(CG_REF - xDAT, 3);   // m DAT (aft +) → FRD x (fwd +) about the reference CG

// ───────────────────────── da42ng (main card) ─────────────────────────
const ng = {};
ng.airframe = {
  identity: L({ manufacturer: 'Diamond Aircraft Industries GmbH (Austria)', model: 'DA 42 NG', variant: 'DA 42 NG มาตรฐาน (MTOM 1,900 kg, ไม่มี MÄM 42-600)', engine: '2 × Austro Engine E4-B (AE300) turbo-diesel, EECU/FADEC คันเดียวต่อเครื่อง', propeller: '2 × mt-Propeller MTV-6-R-C-F/CF187-129, 3 ใบ constant speed feathering, หมุนตามเข็ม (CW) ทั้งสองข้าง', seats: 4, category: 'normal', tc_ref: 'EASA TCDS EASA.A.005 Issue 44 (30 Aug 2024) Section C; AFM Doc 7.01.15-E' }, '-', ['LT1', 'LT2'], 'สูง', false, 'ปีกต่ำ composite หาง T ล้อสามล้อพับเก็บได้ (ไฮดรอลิก) [LT1][LT5 p.7-14]; โรงเรียนไทย 5 ลำ (CATC, BAC, BATC 2, AAT) เลข 42.N/42.NW [LS1]'),
  weights: {
    MTOW: L(1900, 'kg', ['LT1', 'LT2'], 'สูง', false, '4,189 lb มาตรฐาน; 1,999 kg (4,407 lb) เมื่อทำ MÄM 42-659 + MÄM 42-678 (DA42-VI ส่วนใหญ่) และ 2,001 kg กับ OÄM 42-260 [LT1 C Note 12]'),
    MLW: L(1805, 'kg', ['LT1', 'LT2'], 'สูง', false, '3,979 lb; 1,900 kg กับ MÄM 42-659, 1,999 kg กับ +42-678; ลงจอดที่ 1,805–1,900 kg เป็นขั้นตอนผิดปกติ [LT2 p.2-16]'),
    MRW: L(1908, 'kg', ['LT2'], 'กลาง', false, 'AFM ให้มวลบนลานจอดเกิน MTOM ได้ 8 kg (18 lb) [LT2 p.2-17]'),
    MZFW: L(1765, 'kg', ['LT1', 'LT2'], 'สูง', false, '3,891 lb; 1,835 kg กับ MÄM 42-659 [LT1]'),
    min_flight_mass: L(1510, 'kg', ['LT2'], 'สูง', false, '3,329 lb [LT2 p.2-16]'),
    BEW_typical: L(1415, 'kg', ['LT10'], 'กลาง', false, 'สเปก AOPA 2010: empty 3,119 lb (ไม่มีอุปกรณ์เสริม); DA42-VI โบรชัวร์ 1,420 kg [LT6]; เครื่องจริงพร้อมอุปกรณ์หนักกว่า (เครื่องในสไลด์โรงเรียน 3,339 lb = 1,515 kg [LT9])'),
    max_fuel_usable: L(151, 'kg', ['LT1', 'LT6'], 'สูง', false, 'ถังหลัก usable 189.2 l (50 US gal) × Jet A-1 0.80 kg/l [LM19]; ถัง auxiliary เพิ่ม 100 l (80 kg) รวม 289 l (231 kg) [LT1 9.1][LT6 p.19]'),
    useful_load: L(485, 'kg', ['LT10'], 'กลาง', false, 'MTOM 1,900 − empty 1,415 kg (AOPA 2010: useful 1,070 lb) [LT10]'),
    training_mass: L({ kg: 1752, empty_kg: 1450, crew_kg: 170, fuel_kg: 132, fuel_l: 165 }, 'kg', ['LT2', 'LT10'], 'ต่ำ', true, 'ค่าประมาณ: empty_kg 1,450 kg = BEW_typical 1,415 kg (สเปก AOPA ไม่มีอุปกรณ์เสริม [LT10]) + อุปกรณ์ของโรงเรียนราว 35 kg (เครื่องจริงพร้อมอุปกรณ์หนักกว่า เช่น 1,515 kg ในสไลด์ [LT9]); ครูฝึกและศิษย์ 2 × 85 kg; Jet A-1 165 l × 0.80 kg/l = 132 kg; รวม 1,752 kg อยู่ในช่วง 1,510–1,900 kg (แถบความเร็ว ≤1,900 kg)'),
  },
  cg: {
    datum: L('ระนาบ datum อยู่หน้าจุดหน้าสุดของ root rib ของ stub wing 2.196 m (86.46 in); ปรับระดับด้วยพื้นห้องสัมภาระหน้า', '-', ['LT1', 'LT2'], 'สูง', false, '[LT2 p.2-18][LT1 item 15/17]'),
    LEMAC: L(W.LEMAC_mDAT, 'm DAT', ['LT2'], 'ต่ำ', true, `ค่าประมาณ (lt_geom.mjs): ขอบหน้า root 2.196 m + LE sweep 1° × y_MAC ${W.y_MAC} m ของปีกเรียวตรงเทียบเท่า (${r(W.LEMAC_mDAT / 0.0254, 4)} in)`),
    MAC: L(1.271, 'm', ['LT2'], 'สูง', false, '4 ft 2 in [LT2 p.1-5]'),
    envelope: L([[1510, 2.357, 2.460], [1700, 2.387, 2.480], [1900, 2.418, 2.480]], 'kg, m DAT', ['LT1', 'LT2'], 'สูง', false, 'แถว [มวล, หน้าสุด, หลังสุด] เชิงเส้นระหว่างจุด: หน้าสุด 2.357 m (92.80 in) ที่ 1,510 kg ถึง 2.418 m (95.20 in) ที่ 1,900 kg (2.434 m ที่ 1,999 kg กับ MÄM 42-678); หลังสุด 2.460 m ที่ 1,510 kg ถึง 2.480 m (97.64 in) ที่ ≥1,700 kg; คิดเป็น 8.6–13.4 % (หน้า) และ 16.7–18.3 % (หลัง) MAC เมื่อใช้ airframe.cg.LEMAC (leaf est) [LT2 p.2-18][LT1 C.III.14]'),
    ref: L({ m_DAT: r(CG_REF, 4), pct_mac: r(I.cg_pct, 3) }, 'm DAT', ['LT2'], 'ต่ำ', true, 'ค่าประมาณ: CG ของมวลฝึก 1,752 kg จาก component build-up (lt_geom.mjs) ใกล้กลางช่วง 2.395–2.480 m ใช้เป็นจุดกำเนิด FRD และ inertia'),
  },
  inertia: {
    Ixx: L(I.Ixx, 'kg m2', ['LM15', 'LT1'], 'ต่ำ', true, 'ค่าประมาณ component build-up (เครื่องยนต์ 2 × 245 kg ที่ y ±1.70 m, ปีก, ลำตัว, ล้อ, ลูกเรือ, เชื้อเพลิงในปีก) lt_geom.mjs'),
    Iyy: L(I.Iyy, 'kg m2', ['LM15'], 'ต่ำ', true, 'ค่าประมาณ component build-up'),
    Izz: L(I.Izz, 'kg m2', ['LM15'], 'ต่ำ', true, 'ค่าประมาณ component build-up'),
    Ixz: L(I.Ixz, 'kg m2', ['LM15'], 'ต่ำ', true, 'ค่าประมาณ (บวก: เครื่องยนต์อยู่หน้าและต่ำกว่า CG เล็กน้อย, หางอยู่หลังและสูง)'),
    ref_mass: L(I.m, 'kg', ['LM15'], 'ต่ำ', true, 'มวลฝึก (training_mass) ที่ CG อ้างอิง'),
    radii: L(I.radii, '-', ['LM15'], 'ต่ำ', true, `ค่าประมาณ Roskam radii ที่ได้กลับจาก build-up (b 13.42, L 8.56 m); ไม่ใช้ค่าคลาส twin_prop (C310 ถังปลายปีก Rx 0.544 จะให้ Ixx ${geom.inertia.compare_class.twin_prop_C310.Ixx} kg m² สูงเกินจริง ~3.7 เท่า) §01.4`),
    method: L('component build-up (Roskam Part V ch.10) ที่มวลฝึก; ที่ MTOM 1,901 kg ได้ Ixx 6,729, Iyy 3,307, Izz 9,906 kg m²; เปล่า 1,450 kg 5,387 / 3,277 / 8,529', '-', ['LM15'], 'ต่ำ', true, 'มวลและตำแหน่งชิ้นส่วนเป็นค่าประมาณ ±25 %; น้ำมันในปีกเพิ่ม Ixx เร็วกว่ามวล'),
  },
  wing: {
    S: L(16.29, 'm2', ['LT1', 'LT2'], 'สูง', false, '175.3 sq ft [LT2 p.1-5]'),
    b: L(13.42, 'm', ['LT1', 'LT2'], 'สูง', false, '44 ft; 13.55 m รวม anti-collision light [LT2 p.1-5]'),
    MAC: L(1.271, 'm', ['LT2'], 'สูง', false, '[LT2 p.1-5]'),
    AR: L(11.06, '-', ['LT2'], 'สูง', false, '[LT2 p.1-5]'),
    taper: L(W.taper, '-', ['LT2'], 'ต่ำ', true, `ค่าประมาณ: ปีกเรียวตรงเทียบเท่าที่ให้ S, b, MAC ตาม AFM: c_root ${W.c_root} m, c_tip ${W.c_tip} m (ปีกจริงมี center wing ช่วงในแล้วเรียว)`),
    sweep_c4_deg: L(W.sweep_c4_deg, 'deg', ['LT2'], 'ต่ำ', true, 'ค่าประมาณจาก LE sweep 1° [LT2 p.1-5] กับ taper เทียบเท่า'),
    dihedral_deg: L(5, 'deg', ['LT2'], 'สูง', false, '[LT2 p.1-5]'),
    incidence_deg: L(1.0, 'deg', ['LM0'], 'ต่ำ', true, 'ค่าประมาณ: ไม่พบในเอกสารเผยแพร่ ใช้ค่าเดียวกับบัตร DA40 (หัวข้อ 05) เพื่อ trim เท่านั้น'),
    twist_deg: L(-2, 'deg', ['LM10'], 'ต่ำ', true, 'ค่าประมาณ washout ทั่วไปของปีก GA'),
    airfoil: L('Wortmann FX 63-137/20-W4', '-', ['LT2'], 'สูง', false, '[LT2 p.1-5] (ตระกูลเดียวกับ DA40)'),
    position: L('low', '-', ['LT1'], 'สูง', false, 'ปีกต่ำ'),
    x_c4_root: L(geom.fus.x_c4_root_from_nose, 'm', ['LT2'], 'ต่ำ', true, 'ค่าประมาณ: ระยะจากจมูกถึง c/4 ของ root (จมูกที่ −0.10 m DAT ค่าประมาณ)'),
  },
  tail: {
    S_h: L(2.35, 'm2', ['LT2'], 'สูง', false, '25.3 sq ft [LT2 p.1-6]'),
    b_h: L(T.b_h, 'm', ['LT2'], 'ต่ำ', true, 'ค่าประมาณ: AR หางระดับ 4.6'),
    l_h: L(T.l_h, 'm', ['LT1'], 'ต่ำ', true, `ค่าประมาณ: c/4 MAC ปีก ${W.x_c4MAC_mDAT} → c/4 หางระดับ ${T.x_c4h} m DAT (หาง T บนครีบ, ความยาวทั้งลำ 8.56 m [LT1]); V_H ${T.VH}`),
    S_v: L(2.43, 'm2', ['LT2'], 'สูง', false, '26.2 sq ft [LT2 p.1-6]'),
    b_v: L(T.b_v, 'm', ['LT1'], 'ต่ำ', true, 'ค่าประมาณจากความสูงเครื่อง 2.49 m [LT1]'),
    l_v: L(T.l_v, 'm', ['LT1'], 'ต่ำ', true, `ค่าประมาณ: c/4 MAC ครีบที่ ${T.x_c4v} m DAT; V_V ${T.VV}`),
    z_v: L(T.z_v, 'm', ['LT1'], 'ต่ำ', true, 'ค่าประมาณ: ความสูงของจุดศูนย์กลางแรงครีบเหนือแกนลำตัว'),
    h_h: L(T.h_h, 'm', ['LT1'], 'ต่ำ', true, 'ค่าประมาณ: หาง T สูงกว่าระนาบคอร์ดปีก ~1.75 m'),
    tailcone_depth: L(0.40, 'm', ['LT1'], 'ต่ำ', true, 'ค่าประมาณ'),
    airfoil_h: L('ไม่เผยแพร่', '-', ['LT2'], 'ต่ำ', true, 'ไม่พบใน AFM'),
    airfoil_v: L('ไม่เผยแพร่', '-', ['LT2'], 'ต่ำ', true, 'ไม่พบใน AFM'),
    incidence_h_deg: L(-1.1, 'deg', ['LT2'], 'สูง', false, 'เทียบแกนตามยาว [LT2 p.1-6]'),
  },
  surfaces: {
    elevator: L({ area_m2: 0.66, chord_ratio: 0.30, span_fraction: 1.0 }, '-', ['LT2'], 'กลาง', true, 'พื้นที่จาก AFM [LT2 p.1-6]; chord_ratio ค่าประมาณจากสัดส่วนพื้นที่ 0.28'),
    aileron: L({ area_m2: 0.66, chord_ratio: 0.25, span_fraction: [0.75, 0.97] }, '-', ['LT2'], 'กลาง', true, 'พื้นที่รวมสองข้าง 0.66 m² [LT2 p.1-5]; chord_ratio และตำแหน่งช่วงปีกเป็นค่าประมาณที่ให้พื้นที่ 0.654 m²'),
    rudder: L({ area_m2: 0.78, chord_ratio: 0.35, span_fraction: 0.9 }, '-', ['LT2'], 'กลาง', true, 'พื้นที่ [LT2 p.1-6]; อื่น ๆ ค่าประมาณ'),
    flap: L({ area_m2: 2.18, chord_ratio: 0.22, span_fraction: [0.09, 0.75], kind: 'สองชิ้น (center wing + outer wing) ไฟฟ้า 3 ตำแหน่ง' }, '-', ['LT2', 'LT5'], 'กลาง', true, 'พื้นที่รวม 2.18 m² [LT2 p.1-6]; สองชิ้นต่อข้าง [LT5 p.7-5]; chord/span ค่าประมาณ'),
    trim_tab: L({ elevator: 'tab ปรับด้วย Bowden cable', rudder: 'tab ปรับด้วย Bowden cable' }, '-', ['LT5'], 'สูง', false, '[LT5 p.7-4]; พื้นที่ไม่เผยแพร่'),
  },
  geometry: {
    length: L(8.56, 'm', ['LT1', 'LT2'], 'สูง', false, '28 ft 1 in'),
    span: L(13.42, 'm', ['LT1'], 'สูง', false, '13.55 m รวมไฟ ACL [LT2]; หน้าเว็บ Diamond ระบุ 14.55 m ซึ่งขัดกับ TCDS (§06.12)'),
    height: L(2.49, 'm', ['LT1'], 'สูง', false, '8 ft 2 in'),
    wheelbase: L(1.735, 'm', ['LT2'], 'สูง', false, '5 ft 8 in [LT2 p.1-6]'),
    main_track: L(2.95, 'm', ['LT2'], 'สูง', false, '9 ft 8 in [LT2 p.1-6]'),
    prop_clearance: L(0.30, 'm', ['LT1'], 'ต่ำ', true, 'ค่าประมาณระยะปลายใบพัดถึงพื้นขณะจอด'),
    eye_pos_FRD: L([FRDx(2.0), -0.30, -0.80], 'm FRD', ['LT1'], 'ต่ำ', true, 'ค่าประมาณ: ตานักบินที่นั่งซ้ายที่ x ≈ 2.0 m DAT, 0.30 m ซ้าย, 0.80 m เหนือ CG'),
    eye_height_static: L(1.85, 'm', ['LT1'], 'ต่ำ', true, 'ค่าประมาณ ความสูงตาเหนือพื้นขณะจอด'),
    fuselage_width: L(1.20, 'm', ['LT1'], 'ต่ำ', true, 'ค่าประมาณ'),
    fuselage_height: L(1.30, 'm', ['LT1'], 'ต่ำ', true, 'ค่าประมาณ'),
    engine_y: L(1.70, 'm', ['LT2'], 'ต่ำ', true, 'ค่าประมาณระยะแกนใบพัดจากแนวกลางลำ (ใบพัด 1.87 m กับลำตัวกว้าง ~1.2 m และ track 2.95 m [LT2]); ใช้คำนวณโมเมนต์ OEI'),
  },
};

// ── aero ──
const DET = [
  { name: 'UP', flap_deg: 0, VFE_kt: null, dCL0: 0, dCD0: 0, dCm0: 0, CLmax: geom.clmax.ng_1900.UP.CLmax_1g },
  { name: 'APP', flap_deg: 20, VFE_kt: 133, dCL0: 0.30, dCD0: 0.012, dCm0: -0.03, CLmax: geom.clmax.ng_1900.APP.CLmax_1g },
  { name: 'LDG', flap_deg: 42, VFE_kt: 113, dCL0: 0.60, dCD0: 0.045, dCm0: -0.06, CLmax: geom.clmax.ng_1900.LDG.CLmax_1g },
];
const CL0c = 0.35, Cm0c = -0.02;
ng.aero = {
  ref: { S: L(16.29, 'm2', ['LT2'], 'สูง', false, ''), b: L(13.42, 'm', ['LT2'], 'สูง', false, ''), c: L(1.271, 'm', ['LT2'], 'สูง', false, 'MAC') },
  flaps: {
    detents: L(DET, '-', ['LT1', 'LT2', 'LT11'], 'ต่ำ', true, 'มุมแฟลป 0/20/42° [LT1]; VFE KIAS [LT2 p.2-4]; CLmax จาก VS (1,900 kg, KIAS→KCAS, nz 0.95, lt_geom.mjs) ความเชื่อมั่นกลาง; dCL0/dCD0/dCm0 ค่าประมาณ (ไม่พบข้อมูล)'),
    transition_time_s: L({ 'UP-APP': 4, 'APP-LDG': 5 }, 's', ['LT5'], 'ต่ำ', true, 'ค่าประมาณ: AFM บอกว่าแฟลปไฟฟ้าวิ่งเองจนถึงตำแหน่ง แต่ไม่ให้เวลา [LT5 p.7-6]'),
  },
  gear_drag: { dCD0: L(0.012, '-', ['LM12'], 'ต่ำ', true, 'ค่าประมาณ ΔCD0 ล้อลง (ล้อพับได้ 3 ล้อ บนพื้นที่ปีก 16.29 m²) แบบ Raymer §12.5') },
  static_long: {
    CL0: L({ UP: CL0c, APP: CL0c + 0.30, LDG: CL0c + 0.60 }, '-', ['LT2'], 'ต่ำ', true, 'ค่าประมาณ: CL ที่ α ลำตัว 0 (ปีก FX 63-137 โค้งมาก incidence ~1°)'),
    CLalpha: null,   // filled from lm_derivs below
    CLmax_target: L({ UP: DET[0].CLmax, APP: DET[1].CLmax, LDG: DET[2].CLmax }, '-', ['LT2', 'LT11', 'LM1'], 'กลาง', true, '1 g trim ที่ CG ตามตาราง (ไม่ระบุ) 1,900 kg: VS1 69 / VS(APP) 65 / VS0 62 KIAS → KCAS (ตาราง ias_cas) → nz 0.95 (lm_polar §01.5)'),
    Cm0: L({ UP: Cm0c, APP: Cm0c - 0.03, LDG: Cm0c - 0.06 }, '-', ['LT2'], 'ต่ำ', true, 'ค่าประมาณ (ไม่มีข้อมูล) เลือกให้ trim ได้ในช่วงระยะ elevator ตาม TCDS'),
    Cmalpha: null,
  },
};

// ── speeds ──
const ias = geom.ias_cas.ng;
ng.speeds = {
  VS0_kt: L(62, 'kt IAS', ['LT2', 'LT11'], 'สูง', false, 'ปลาย white arc [LT2 p.2-5] = VS0 ที่ MTOM 1,900 kg แฟลป LDG ล้อลง idle; ตาราง stall 62 KIAS [LT11]; ≈ 60 KCAS'),
  VS1_kt: L(69, 'kt IAS', ['LT2', 'LT10'], 'สูง', false, 'ปลาย green arc [LT2 p.2-5]; สเปก AOPA VS1 69 [LT10]; ตาราง stall (ผู้ใช้ทำ) 68 [LT11] ล้อขึ้น'),
  VX_kt: L(77, 'kt IAS', ['LT9', 'LT11'], 'ต่ำ', false, 'จากสไลด์โรงเรียน (DA42-VI) และ flashcard; AFM 4A.2 ของ NG เปิดไม่ได้; AOPA 2010 พิมพ์ "VX and VY 90" [LT10]'),
  VY_kt: L(90, 'kt IAS', ['LT9', 'LT10', 'LT11'], 'กลาง', false, 'สามแหล่งทุติยภูมิตรงกัน (90 KIAS ≤1,900 kg, 92 KIAS >1,900 kg ของ DA42-VI [LT9]); โมเดล lt_polar ให้ ROC สูงสุดที่ 90 KCAS'),
  VR_kt: L(76, 'kt IAS', ['LT9', 'LT11'], 'ต่ำ', false, 'สไลด์/flashcard 76 KIAS; สเปก AOPA 2010 ให้ 80 KIAS [LT10]; แฟลป UP'),
  VAPP_kt: L(84, 'kt IAS', ['LT9'], 'ต่ำ', false, 'ความเร็ว approach แฟลป APP ขั้นต่ำ 84 KIAS (43.2 m/s) ที่มวลฝึก 1,752 kg ซึ่งอยู่ในแถบ ≤1,900 kg [LT9]; แถบ >1,900 kg 88 KIAS; AOPA ref approach 85 KIAS [LT10]; บัตรเป็นเจ้าของค่านี้ (D1) หัวข้อ 08 และ 09 อ้างจากที่นี่'),
  VREF_kt: L(84, 'kt IAS', ['LT9'], 'ต่ำ', false, 'final approach แฟลป LDG ขั้นต่ำ 84 KIAS (43.2 m/s) ที่มวลฝึก 1,752 kg (แถบ ≤1,900 kg) [LT9]; แถบ >1,900 kg 86 KIAS; ≈ 1.4 VS0 ของ 1,900 kg (60 KCAS); AFM ให้ค่าเดียวกับ VAPP จึง VAPP = VREF (D1)'),
  VG_kt: L(85, 'kt IAS', ['LT2'], 'ต่ำ', true, 'ค่าประมาณ: ความเร็วร่อนดีที่สุดสองเครื่องดับใบพัด feather จาก polar (lt_polar 87 KCAS ที่ 1,900 kg) ไม่พบใน AFM ที่เปิดได้'),
  VA_kt: L({ '1700': 112, '1800': 119, '1900': 122 }, 'kt IAS', ['LT2', 'LT1'], 'สูง', false, 'vO (operating manoeuvring) ตามมวล ≤1,700 / 1,700–1,800 / >1,800 kg [LT2 p.2-4]; TCDS ให้ VA 114 / 121 / 125 KEAS [LT1 C.III.10]'),
  VNO_kt: L(151, 'kt IAS', ['LT2'], 'สูง', false, '155 KEAS [LT1]'),
  VNE_kt: L(188, 'kt IAS', ['LT2'], 'สูง', false, '192 KEAS [LT1]'),
  VLE_kt: L(188, 'kt IAS', ['LT2'], 'สูง', false, '192 KEAS [LT1]'),
  VLO_kt: L({ extend: 188, retract: 152 }, 'kt IAS', ['LT2'], 'สูง', false, 'vLOE / vLOR [LT2 p.2-4]; emergency extension ≤152 KIAS [LT2 p.2-27]; TCDS VLO 155 KEAS'),
  VFE: L({ APP: 133, LDG: 113 }, 'kt IAS', ['LT2'], 'สูง', false, 'TCDS 135 / 110 KEAS [LT1]'),
  VMCA_kt: L(76, 'kt IAS', ['LT2', 'LT1'], 'สูง', false, 'red radial [LT2 p.2-4, 2-5]; TCDS 75 KEAS (70 KEAS กับ MÄM 42-600) [LT1 C.III.10]; เงื่อนไข 14 CFR/CS 23.149: กำลัง takeoff เครื่องที่เหลือ เอียงไม่เกิน 5° [LT17]'),
  VYSE_kt: L(85, 'kt IAS', ['LT2'], 'สูง', false, 'blue radial [LT2 p.2-5, 3-5]'),
  VXSE_kt: L(82, 'kt IAS', ['LT16'], 'ต่ำ', true, 'ค่าประมาณ: AFM NG ที่เปิดได้ไม่มี VXSE (Horlings ชี้ว่า AFM DA 42 ไม่นิยาม [LT8]); DA42 TDI ตามสเปก AOPA 77 KIAS [LT16] บวกผลต่าง VYSE (85 − 82); ซิมควรคำนวณเอง (T-LT-28)'),
  VSSE_kt: L(85, 'kt IAS', ['LT8', 'LT17'], 'ต่ำ', true, 'ค่าประมาณ: AFM มีแต่นิยาม (p.1-8) ไม่มีตัวเลข [LT2][LT8]; เสนอให้ซิมใช้ไม่ต่ำกว่า VYSE 85 KIAS (≥ VMCA + 9 kt) สำหรับการฝึกดับเครื่องโดยเจตนา'),
  ias_cas: L({ UP: [[68, 67], ...ias.UP], APP: [[65, 65], ...ias.APP], LDG: [[62, 60], ...ias.LDG] }, 'kt IAS → kt CAS', ['LT1', 'LT2', 'LT6', 'LT11'], 'ต่ำ', true, 'ค่าประมาณ: ตารางสอบเทียบใน AFM บทที่ 5 เป็นกราฟ จึงสร้างจากคู่ TCDS (KEAS ≈ KCAS ที่ความสูงต่ำ) กับ AFM (KIAS): UP 76→75, 151→155, 152→155, 188→192; APP 133→135; LDG 113→110 และ 64 KIAS ≈ 62 KCAS ของ DA42-VI; จุดต่ำสุดของแต่ละแฟลปเป็นการต่อเส้น (lt_geom.mjs)'),
  stall_table: L({ axes: { mass_kg: [1510, 1700, 1900, 1999], flap: ['UP', 'APP', 'LDG'] }, data: [[61, 58, 54], [64, 62, 59], [68, 65, 62], [72, 68, 64]] }, 'kt IAS', ['LT11', 'LT2'], 'ต่ำ', false, 'มุมเอียง 0° idle ล้อขึ้นที่ UP ล้อลงที่ APP/LDG; จาก flashcard ผู้ใช้ (ทุติยภูมิ) สอดคล้องกับ arc ของ AFM ที่ 1,900 kg (62/69) ภายใน 1 kt; ค่า 1,999 kg เป็นของ DA42-VI/MÄM 42-678'),
  stall_warning_margin_kt: L(5, 'kt', ['LT4', 'LM1'], 'ต่ำ', true, 'ค่าประมาณ: เกณฑ์ขั้นต่ำ 5 kt (CS/14 CFR 23.207 เดิม); รายงาน NZ CAA ระบุว่ารุ่น L360 ไม่ถึง 5 kt ที่ CG หน้า [LT4 p.7]'),
  crosswind_demonstrated_kt: L(25, 'kt', ['LT10', 'LT6'], 'กลาง', false, 'สเปก AOPA 2010 ของ DA42 NG "max demonstrated crosswind 25 kt" [LT10]; โบรชัวร์ DA42-VI 25 kt / 46 km/h [LT6 p.19]; ค่าใน AFM NG บทที่ 4/5 เปิดไม่ได้ (§06.12); DA 42 TDI 20 kt [LT16]'),
  icao_approach_category: L('A', '-', ['LT2'], 'สูง', false, 'Vat = 1.3 × VS0 (60 KCAS) = 78 kt < 91 kt'),
};
// gap 18 (19 Nov 2026): speeds.stall_altitude_loss_ft. No DA42 AFM page that can be read gives the height lost between the stall
// and the recovery, so the card uses the class value of topic 05 (ld_vx.mjs): POH/AFM loss ÷ VS1² (KCAS) of the c172s, c152 and
// p2006t cards, mean coefficient × VS1² (KCAS) at the training mass, rounded to 10 ft (ค่าประมาณ).
const SAL = (() => {
  const cls = {};
  for (const id of ['c172s', 'c152', 'p2006t']) {
    try {
      const c = loadType(id), ls = c.speeds?.VS1_kt, la = c.speeds?.stall_altitude_loss_ft;
      const row0 = Object.keys(c.speeds?.ias_cas?.v ?? {})[0], vs = /CAS/.test(ls.u) ? ls.v : iasCas(c, row0).f(ls.v);
      cls[id] = { loss_ft: la.v, src: la.src, VS1_kcas: r(vs, 3), coef: la.v / vs ** 2 };
    } catch (e) { console.warn('stall_altitude_loss class value:', id, e.message); }
  }
  const cs = Object.values(cls).map(x => x.coef), mean = cs.reduce((a, b) => a + b, 0) / cs.length;
  const rnd = (c, vs) => Math.round(c * vs * vs / 10) * 10;
  return { cls, mean, at: vs => ({ loss_ft: rnd(mean, vs), min_ft: rnd(Math.min(...cs), vs), max_ft: rnd(Math.max(...cs), vs), VS1_kcas: r(vs, 3) }) };
})();
const tblInterp = (rows, x) => { let i = 1; while (i < rows.length - 1 && rows[i][0] < x) i++; const a = rows[i - 1], b = rows[i]; return a[1] + (x - a[0]) / (b[0] - a[0]) * (b[1] - a[1]); };
function stallLossLeaf(vs1Kias, rows, m0, mT, label) {
  const vs = tblInterp(rows, vs1Kias) * Math.sqrt(mT / m0), o = SAL.at(vs), C = Object.entries(SAL.cls);
  const src = [...new Set(C.flatMap(([, x]) => x.src || [])), 'LM0'];
  return L(o.loss_ft, 'ft', src, 'ต่ำ', true, `ค่าประมาณแบบค่าคลาส (วิธีเดียวกับ DA40 หัวข้อ 05): AFM ${label} ที่เปิดได้ไม่ให้ความสูงที่เสียระหว่าง stall และการแก้ จึงหารค่าที่ POH/AFM ให้ด้วย VS1² (KCAS) ของ ${C.map(([k, x]) => `${k} ${x.loss_ft} ft (VS1 ${x.VS1_kcas} KCAS) [${(x.src || []).join(', ')}]`).join(', ')} ได้สัมประสิทธิ์เฉลี่ย ${r(SAL.mean, 3)} ft/kt² แล้วคูณ VS1² ที่มวลฝึก ${mT.toLocaleString('en-US')} kg (VS1 ${o.VS1_kcas} KCAS สเกลจาก ${vs1Kias} KIAS ที่ ${m0.toLocaleString('en-US')} kg ด้วย √m) = ${o.loss_ft} ft (${Math.round(o.loss_ft * 0.3048)} m); ช่วงตามสัมประสิทธิ์ต่ำสุด–สูงสุด ${o.min_ft}–${o.max_ft} ft; stall ปีกระดับ สองเครื่อง ไม่รวมกรณีกำลังไม่สมมาตร`);
}
ng.speeds.stall_altitude_loss_ft = stallLossLeaf(69, [[68, 67], ...ias.UP], 1900, 1752, 'DA42 NG');

// ── performance ──
const HOT = (288.15 / 308.15) ** -1.33;   // VTBD 35 °C (ISA+20) at SL: s ∝ σ^(−4/3) (lift at VR ∝ ρ, static thrust at constant power ∝ ρ^(1/3)), ค่าประมาณ
ng.performance = {
  ROC_SL_fpm: L(1180, 'fpm', ['LT10'], 'กลาง', false, 'สเปก AOPA 2010 (DA42 NG, MTOM 1,900 kg, SL, สองเครื่อง) [LT10]; DA42-VI 1,114 fpm ที่ 1,999 kg [LT6]'),
  oei: L({ ROC_SL_fpm: 210, VYSE_kt_IAS: 85, critical_engine: 'left', service_ceiling_ft: null, note_vi: { service_ceiling_ft: 16000, absolute_ceiling_ft: 17500 } }, 'fpm, kt, ft', ['LT10', 'LT5', 'LT6'], 'กลาง', false, 'OEI 210 fpm SL (AOPA spec NG) [LT10]; เครื่องซ้ายเป็น critical engine (AFM DA 42 p.5-23) [LT5]; เพดาน OEI ของ NG ไม่พบ ส่วน DA42-VI 16,000 ft (50 fpm) / 17,500 ft [LT6]; เงื่อนไข AFM: เครื่องที่เหลือ MAX, ใบพัดที่ดับ feather, แฟลป UP, ล้อขึ้น, zero sideslip [LT5 p.5-23]; การตรวจว่า 210 fpm กับเพดาน 16,000 ft ของ VI สอดคล้องกันหรือไม่อยู่ที่ performance.oei_ceiling_model และ §06.4.1'),
  service_ceiling_ft: L(18000, 'ft', ['LT1', 'LT2'], 'สูง', false, 'ความสูงปฏิบัติการสูงสุด (ข้อจำกัด) 18,000 ft PA ไม่ใช่เพดานทางสมรรถนะ'),
  cruise_table: L([{ h_ft: 8000, isa_dev: 2.85, power_pct: 92, ktas: 176, ff_lph_each: 31.0, src: 'flight test' }, { h_ft: 12500, power_pct: 75, ktas: 171, ff_lph_each: 24.6 }, { h_ft: 8000, power_pct: 80, ktas: 162, ff_lph_each: 26.5 }], 'ft, %, kt TAS, l/h', ['LT10'], 'กลาง', false, 'AOPA 2010: ทดสอบบิน 92 % 8,000 ft +2 °C 176 KTAS 8.2 gph/เครื่อง; สเปก 75 % 12,500 ft 171 kt 6.5 gph; 80 % 8,000 ft 162 kt 7.0 gph (มวลไม่ระบุ)'),
  glide: L({ speed_kt: r(pol.glide_feathered_1900.Vbg_kcas, 3), ratio: r(pol.glide_feathered_1900.Emax, 3) }, 'kt CAS, -', ['LT10', 'LM12'], 'ต่ำ', true, 'ค่าประมาณ: ไม่พบใน AFM ที่เปิดได้; จาก polar ของ cruise (CD0 0.0316, e 0.73) + ใบพัด feather สองข้าง ที่ 1,900 kg (lt_polar.mjs)'),
  takeoff: L({ ground_roll_m: 458, over50ft_m: 733 }, 'm', ['LT10'], 'กลาง', false, 'สเปก AOPA 2010: 1,503 ft / 2,405 ft (พิมพ์ "kt") MTOM SL ISA สันนิษฐาน; DA42-VI short-field 375 / 649 m ที่ 1,999 kg [LT6]'),
  landing: L({ ground_roll_m: 366, over50ft_m: 594 }, 'm', ['LT10'], 'กลาง', false, 'สเปก AOPA 2010: 1,200 ft / 1,950 ft; DA42-VI 387 / 647 m [LT6]'),
  takeoff_table: L({ vtbd_hot_estimate: { OAT_C: 35, elev_ft: 9, ground_roll_m: Math.round(458 * HOT), over50ft_m: Math.round(733 * HOT), factor: r(HOT, 4) } }, 'm', ['LT10', 'LM12'], 'ต่ำ', true, 'ค่าประมาณ: AFM ให้เป็นกราฟ (เปิดไม่ได้); สเกลระยะ ISA ด้วย σ^-1.33 (แรงยกที่ VR ∝ ρ, แรงขับใบพัดที่กำลังคงที่ ∝ ρ^(1/3)) ที่ 35 °C σ 0.935 โดยสมมติ AE300 turbo รักษากำลัง 100 %'),
  fuel: L({ fuel: 'Jet A-1 / Jet A / TS-1 / JP-8', ff_60pct_total_lph: 39.4, bsfc_g_per_kWh: { '100': 227, '92': 219, '60': 213 } }, 'l/h, g/kWh', ['LT6', 'LT10', 'LM19'], 'กลาง', false, 'BSFC คำนวณด้วย Jet A-1 0.80 kg/l (ค่ากลางของหัวข้อ 01): 100 % 227 g/kWh จาก 35 l/h ของ factsheet [LM19]; 92 % 219 g/kWh จาก 8.2 gph/เครื่อง ที่บินทดสอบ [LT10]; 60 % 213 g/kWh จาก 39.4 l/h รวมสองเครื่องของ DA42-VI [LT6] (factsheet ให้ 19 l/h = 205 g/kWh [LM19])'),
};

// gap 16 (19 Nov 2026): tables at SL with a 35 °C point (VTBD hot day). The NG AFM chapter 5 (graphs) cannot be opened, so the
// 35 °C points are estimates: ROC from the analytic model of lt_oei_ceiling.mjs (k_η calibrated to the published SL ISA values),
// landing distance scaled by 1/σ (same IAS, TAS² ∝ 1/σ). gap 22: the OEI ceiling reconciliation of lt_oei_ceiling.mjs.
const SIG35 = 288.15 / 308.15;
ng.performance.landing_table = L({ vtbd_hot_estimate: { OAT_C: 35, elev_ft: 9, ground_roll_m: Math.round(366 / SIG35), over50ft_m: Math.round(594 / SIG35), factor: r(1 / SIG35, 4) } }, 'm', ['LT10', 'LM12'], 'ต่ำ', true,
  `ค่าประมาณ: AFM NG บทที่ 5 (กราฟ) เปิดไม่ได้; สเกลระยะ ISA ของสเปก AOPA ที่ 1,900 kg (366 / 594 m [LT10]) ด้วย 1/σ = ${r(1 / SIG35, 4)} (IAS เท่าเดิม ⇒ TAS² ∝ 1/σ, แรงหน่วงเท่าเดิม) ที่ 35 °C ระดับน้ำทะเล (σ ${r(SIG35, 3)})`);
if (ceil?.aeo) {
  const A = ceil.aeo, N = ceil.ng;
  ng.performance.ROC_table = L({ h_ft: 0, mass_kg: 1900, OAT_C: [15, 25, 35], aeo_fpm: [1180, A.ng_1900.isa10_fpm, A.ng_1900.isa20_fpm], oei: { OAT_C: [15, 35], fpm: [210, N.ng_1900_SL_MAX_isa20_fpm] },
    training_mass_1752kg: { OAT_C: [15, 35], aeo_fpm: [A.ng_1752.isa_fpm, A.ng_1752.isa20_fpm], oei_fpm_ISA: N.ng_1752_SL_MAX_fpm } }, 'fpm', ['LT10', 'LM12', 'LM0'], 'ต่ำ', true,
    `ค่าประมาณ: AFM NG บทที่ 5 (กราฟ ROC) เปิดไม่ได้; จุด 15 °C (ISA) ที่ 1,900 kg เป็นค่าตีพิมพ์ 1,180 / 210 fpm [LT10]; จุดอื่นคำนวณด้วยแบบจำลองมวลจุด scripts/lt_oei_ceiling.mjs (polar lt_polar, η จาก BEM × k_η ที่ปรับให้ตรงค่า ISA: สองเครื่อง ${A.kEta_cal_1180fpm}, OEI ${ceil.kEta_cal_210fpm}, กำลัง MAX 123.5 kW ต่อเครื่อง flat-rated ไม่ลดตามความหนาแน่นที่ SL); ผลคือวันร้อน 35 °C แทบไม่ลด ROC ที่ระดับน้ำทะเล (ต่างจากเครื่องยนต์ไม่มี turbo) ตรวจไขว้ DA42-VI 1,999 kg ได้ ${A.vi_1999_check.isa_fpm} fpm เทียบ 1,114 fpm [LT6]`);
}
if (ceil) {
  const T = ceil.vi_ceiling_by_mass_isa, Nd = ceil.needed_for_16000ft, row = m => T.find(x => x.mass_kg === m);
  const perK = r((row(1900).SL_MAX_fpm - 50) / (row(1900)['isa+0_ft'] / 1000), 2);
  ng.performance.oei_ceiling_model = L({
    kEta_cal: ceil.kEta_cal_210fpm,
    vi_service_ceiling_ft: Object.fromEntries(T.map(x => [String(x.mass_kg), { 'ISA-10': x['isa-10_ft'], ISA: x['isa+0_ft'], 'ISA+10': x['isa+10_ft'], 'ISA+20': x['isa+20_ft'] }])),
    vi_absolute_ceiling_ft_ISA: Object.fromEntries(T.map(x => [String(x.mass_kg), x.abs_isa_ft])),
    vi_SL_OEI_fpm_ISA_MAX: Object.fromEntries(T.map(x => [String(x.mass_kg), x.SL_MAX_fpm])),
    vi_16000ft_needs: { mass_kg: Nd.mass_for_16000ft_kg, or_CD0_at_1999kg: Nd.cd0_for_16000ft_at_1999kg, CD0_reduction_pct: Nd.cd0_reduction_pct, or_kEta_at_1999kg: Nd.kEta_for_16000ft_at_1999kg },
    ng_service_ceiling_ft_ISA: { '1752': ceil.ng.ng_1752_ft, '1900': ceil.ng.ng_1900_ft },
  }, 'ft, fpm, kg', ['LT10', 'LT6', 'LM12', 'LM0'], 'ต่ำ', true,
  `ค่าประมาณ (scripts/lt_oei_ceiling.mjs แบบจำลองมวลจุด ไม่ใช่ซิม): ROC = (k_η·η·P − D·V)/W สูงสุดตาม TAS; polar lt_polar + ΔCD ใบพัด feather 0.0014 + trim 0.002; η จาก BEM ของใบพัด 1.87 m (NG) และ 1.90 m (VI) × k_η ${ceil.kEta_cal_210fpm} ที่ปรับให้ NG 1,900 kg SL ISA เครื่องที่เหลือ MAX = 210 fpm [LT10]; เพดานใช้ MCP 114 kW คงที่ถึง 16,000 ft แล้วลด ∝ σ^1.1 [LT6]; ผล: VI ที่ 1,999 kg ได้เพดาน OEI ${row(1999)['isa+0_ft']} ft ISA ไม่ใช่ 16,000 ft; 16,000 ft ได้เมื่อมวล ≈ ${Nd.mass_for_16000ft_kg} kg หรือเมื่อ CD0 ต่ำกว่า ${Nd.cd0_reduction_pct} % หรือ k_η ${Nd.kEta_for_16000ft_at_1999kg} (η ดีกว่า NG ~6 %); ROC OEI ลดเฉลี่ยราว ${perK} fpm ต่อ 1,000 ft จึงไวต่อส่วนเผื่อที่ SL มาก สรุป: ตัวเลขทั้งสองสอดคล้องกันได้ถ้าเพดานในโบรชัวร์เป็นของมวลราว 1,900 kg (หัวตาราง "MTOM, ISA" ไม่ระบุมวล)`);
}

// ── propulsion, piston, propeller ──
const xProp = 0.95, yE = 1.70, zT = 0.15;
ng.propulsion = {
  layout: L([{ id: 1, side: 'left', pos: [FRDx(xProp), -yE, zT], axis: [1, 0, 0], type: 'piston', model: 'Austro E4-B (AE300) + MTV-6-R-C-F/CF187-129', prop_sense: 1 },
    { id: 2, side: 'right', pos: [FRDx(xProp), yE, zT], axis: [1, 0, 0], type: 'piston', model: 'Austro E4-B (AE300) + MTV-6-R-C-F/CF187-129', prop_sense: 1 }], 'm FRD', ['LT1', 'LT2'], 'กลาง', true,
    'ใบพัดหมุน CW (มองจากหลัง) ทั้งสองข้าง [LT1 C.III.7] ⇒ เครื่องซ้ายเป็น critical engine [LT5 p.5-23]; ตำแหน่งดุมใบพัด (x 0.95 m DAT, y ±1.70 m, ต่ำกว่า CG 0.15 m) เป็นค่าประมาณ'),
  critical_engine: L('left', '-', ['LT5'], 'สูง', false, 'AFM DA 42 p.5-23: "left-hand engine is the critical engine" (ทิศหมุนใบพัดเดียวกันใน NG [LT1])'),
};
ng.piston = {
  identity: L({ model: 'Austro Engine E4-B (AE300)', kind: 'turbo_diesel', displacement_L: 1.991, cylinders: 4, tcds: 'EASA TCDS E.200' }, '-', ['LT12', 'LT1'], 'สูง', false, 'เกียร์ทด 1:1.69, มวลแห้ง 185 kg [LT12 p.5]; E4-C เมื่อทำ MÄM 42-600 [LT1]', 'engine'),
  ratings: L({ P_rated: 123500, rpm_rated: 2300, P_mcp: 114000, rpm_mcp: 2100, rpm_redline: 2300, rpm_overspeed: 2500, overspeed_time_s: 20, takeoff_time_limit_s: 300, rpm_idle: null }, 'W, rpm, s', ['LT1', 'LT2'], 'สูง', false, 'Take-off 100 % = 123.5 kW (168 PS หรือ 166 hp แบบ SAE) 5 นาทีที่ 2,300 rpm ใบพัด; MCP 92 % = 114 kW ที่ 2,100 rpm [LT2 p.2-6][LT1 C.III.5]; รอบ idle ไม่พบ', 'engine'),
  altitude: L({ model: 'turbo_flat', critical_alt_m: 4877, note_power: 'MCP' }, '-', ['LT6'], 'ต่ำ', true, 'ค่าประมาณ: โบรชัวร์ DA42-VI ให้ "max cruise 16,000 ft, MCP" จึงสันนิษฐานว่า MCP 92 % ยังได้ถึง 16,000 ft; กำลัง take-off ที่ความสูงไม่ทราบ; ตารางกำลังตามความสูงอยู่ใน AFM บทที่ 5', 'engine'),
  power_map: L({ axes: { load_pct: [0, 60, 75, 92, 100] }, data: [0, 74100, 92625, 113620, 123500] }, 'W', ['LT2'], 'กลาง', false, 'FADEC: load % × 123.5 kW (เชิงเส้นตามนิยาม load ของ AE300)', 'engine'),
  fuel: L({ fuel: 'Jet A-1', bsfc_g_per_kWh: { '100': 227, '92': 219, '60': 213 }, density_kg_per_l: 0.80 }, 'g/kWh', ['LM19', 'LT10', 'LT6'], 'กลาง', false, 'ดู performance.fuel', 'engine'),
  dynamics: L({ tau_throttle_s: 0.5, I_engine: 0.3, friction_torque: null }, 's, kg m2', ['LM19'], 'ต่ำ', true, 'ค่าประมาณตาม §01.6.2 (FADEC + turbo lag); I_engine = ส่วนหมุนของเครื่องสะท้อนผ่านเกียร์ 1.69² (ไม่รวมใบพัด)', 'engine'),
  fadec: L({ lever_to_load: 'load % = ตำแหน่งคันเร่ง 0–100 %', rpm_schedule: null, feather: 'ENGINE MASTER OFF → ใบพัด feather' }, '-', ['LT2', 'LT8'], 'กลาง', false, 'ตาราง load → rpm ไม่พบใน AFM ที่เปิดได้ (MCP 92 % ที่ 2,100 rpm, take-off 100 % ที่ 2,300 rpm [LT2]); การดับเครื่องด้วย ENGINE MASTER ทำให้ใบพัด feather [LT8 §3.1.5.4]', 'engine'),
};
const P187 = { ...PROPS.cs3_190, D: 1.87 };
const Jg = [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0], Bg = [10, 15, 20, 25, 30, 35, 40];
const CT = [], CP = [];
for (const J of Jg) { const rt = [], rp = []; for (const b of Bg) { const s = bem(P187, J, { beta75: b * DEG, n: 2300 / 60 }); rt.push(r(s.CT, 3)); rp.push(r(s.CP, 3)); } CT.push(rt); CP.push(rp); }
const pg = geom.prop, pd = pg.drag;
ng.propeller = {
  identity: {
    kind: L('constant_speed_feathering', '-', ['LT1'], 'สูง', false, 'feather 81°, low pitch 12°, start lock 15° ที่ 0.75R [LT1][LT2 p.2-9]', 'propeller'),
    model: L('mt-Propeller MTV-6-R-C-F/CF187-129', '-', ['LT1', 'LT2'], 'สูง', false, 'EASA TCDS P.094 [LT14]; DA42-VI: MTV-6-R-C-F/CF190-69', 'propeller'),
    nBlades: L(3, '-', ['LT1'], 'สูง', false, '', 'propeller'),
    diameter: L(1.87, 'm', ['LT1', 'LT2'], 'สูง', false, '187 cm', 'propeller'),
    sense: L(1, '-', ['LT1'], 'สูง', false, 'CW มองจากหลังทั้งสองเครื่อง (ไม่ใช่ counter-rotating)', 'propeller'),
    massComplete: L(17.5, 'kg', ['LT14'], 'กลาง', false, 'TCDS P.094 Issue 04 ให้มวลโดยประมาณ 17.5 kg สำหรับแบบ constant speed + feather (ไม่ขึ้นกับเส้นผ่านศูนย์กลาง) [LT14]; ผู้ตรวจแก้จาก 14 kg', 'propeller'),
    hubPosition: L([[FRDx(xProp), -yE, zT], [FRDx(xProp), yE, zT]], 'm FRD', ['LT2'], 'ต่ำ', true, 'ซ้าย, ขวา (ค่าประมาณ)', 'propeller'),
    thrustAxis: L([1, 0, 0], '-', ['LT2'], 'ต่ำ', true, 'ค่าประมาณ: ไม่พบมุม toe/tilt ของเครื่องยนต์', 'propeller'),
  },
  engineInterface: {
    maxShaftPower: L(123.5, 'kW', ['LT1'], 'สูง', false, 'ต่อเครื่อง (5 นาที)', 'propeller'),
    rpmGoverned: L(2300, 'rpm', ['LT1', 'LT2'], 'สูง', false, 'take-off; MCP 2,100 rpm', 'propeller'),
    rpmTransientLimit: L(2500, 'rpm', ['LT2'], 'สูง', false, 'overspeed สูงสุด 20 s [LT2 p.2-6]', 'propeller'),
    gearRatio: L(1.69, '-', ['LT12'], 'สูง', false, 'เพลาข้อเหวี่ยง 3,880 rpm : ใบพัด 2,300 rpm', 'propeller'),
  },
  bladeGeometry: {
    hubRadiusRatio: L(0.18, 'r/R', ['LM0', 'LM24'], 'ต่ำ', true, 'ค่าประมาณ lm_prop cs3', 'propeller'),
    chordOverD: L({ axes: { x: PROPS.cs3_190.cx }, data: PROPS.cs3_190.cD.map(c => r(c * 0.85, 3)) }, 'c/D', ['LM0', 'LM24'], 'ต่ำ', true, 'ค่าประมาณ lm_prop cs3 (×0.85 ของแบบ 2 ใบ)', 'propeller'),
    twistDesignJ: L(0.95, '-', ['LM0', 'LM24'], 'ต่ำ', true, 'helical twist ที่ J 0.95', 'propeller'),
    activityFactor: L(77, '-', ['LM0', 'LM24'], 'ต่ำ', true, 'ค่าประมาณจาก chordOverD (AF = 10⁵/16 ∫ c/D x³ dx)', 'propeller'),
  },
  section: {
    liftSlope: L(r(PROPS.cs3_190.cla, 3), '1/rad', ['LM0', 'LM24'], 'ต่ำ', true, '0.9 × 2π', 'propeller'),
    alpha0: L(-3, 'deg', ['LM0', 'LM24'], 'ต่ำ', true, 'ค่าเริ่มต้น lm_prop สำหรับ section ใบพัด Clark-Y/ARA-D (MT ไม่เผยแพร่ section)', 'propeller'), alphaStallPos: L(14, 'deg', ['LM0', 'LM24'], 'ต่ำ', true, 'ค่าเริ่มต้น lm_prop', 'propeller'), alphaStallNeg: L(-10, 'deg', ['LM0', 'LM24'], 'ต่ำ', true, 'ค่าเริ่มต้น lm_prop', 'propeller'),
    stallBlendM: L(25, '1/rad', ['LM0', 'LM24'], 'ต่ำ', true, 'ค่าเริ่มต้น lm_prop (Beard–McLain)', 'propeller'), cd0: L(0.010, '-', ['LM0', 'LM24'], 'ต่ำ', true, 'ค่าเริ่มต้น lm_prop (ใบไม้คอมโพสิตผิวเรียบ)', 'propeller'), kcd: L(0.012, '-', ['LM0', 'LM24'], 'ต่ำ', true, 'ค่าเริ่มต้น lm_prop: cd = cd0 + kcd (α − α_cdmin)²', 'propeller'),
    Mdd: L(0.78, '-', ['LM0', 'LM24'], 'ต่ำ', true, 'ค่าเริ่มต้น lm_prop (ปลายใบ 1.87 m ที่ 2,300 rpm M ≈ 0.66 ต่ำกว่า Mdd)', 'propeller'), stallDelayFactor: L(3, '-', ['LM0', 'LM24'], 'ต่ำ', true, 'Snel', 'propeller'),
  },
  tables: {
    CT: L({ axes: { J: Jg, beta75_deg: Bg }, data: CT }, '-', ['LM0', 'LM24'], 'ต่ำ', true, 'ค่าประมาณ BEM (lm_prop) D 1.87 m 2,300 rpm SL', 'propeller'),
    CP: L({ axes: { J: Jg, beta75_deg: Bg }, data: CP }, '-', ['LM0', 'LM24'], 'ต่ำ', true, 'ค่าประมาณ BEM (lm_prop)', 'propeller'),
  },
  inertia: {
    Ip: L(1.7, 'kg m2', ['LT14'], 'ต่ำ', true, 'ค่าประมาณ: 3 ใบ composite ~4 kg ที่รัศมีไจเรชัน ~0.35 m + ดุม', 'propeller'),
    IreflectedEngine: L(0.3, 'kg m2', ['LT12'], 'ต่ำ', true, 'ค่าประมาณ ส่วนหมุนเครื่องผ่านเกียร์ 1.69²', 'propeller'),
  },
  governor: {
    kGov: L(1, 'deg/s per rpm', ['LT20'], 'ต่ำ', true, 'ค่าของรอบที่ 1', 'propeller'),
    pitchRateMax: L(10, 'deg/s', ['LT20'], 'ต่ำ', true, 'ค่าประมาณ (ดุมไฮดรอลิก MT ช้ากว่าเทอร์โบพร็อป)', 'propeller'),
    rpmOverspeed: L(2500, 'rpm', ['LT2'], 'สูง', false, '20 s', 'propeller'),
    oilMinRpm: L(1300, 'rpm', ['LT9'], 'ต่ำ', true, 'start-lock latch ทำงานที่ ~1,300 rpm [LT9]; ใช้เป็นรอบต่ำสุดที่ governor ยังคุมได้ (ค่าประมาณ)', 'propeller'),
    betaFlightIdle: L(12, 'deg @0.75R', ['LT1', 'LT2'], 'สูง', false, 'low pitch stop (MÄM 42-600: 13°)', 'propeller'),
    betaFeather: L(81, 'deg @0.75R', ['LT1', 'LT2'], 'สูง', false, '±1° (MÄM 42-600: 80°)', 'propeller'),
    featherRate: L(8, 'deg/s', ['LT2'], 'ต่ำ', true, 'ค่าประมาณ (ไม่พบเวลา feather)', 'propeller'),
    betaStartLock: L(15, 'deg @0.75R', ['LT1', 'LT2'], 'สูง', false, '±1°', 'propeller'),
  },
  feathered: {
    bladePlanformArea: L(r(pd.solidity * pd.disk_m2, 3), 'm2', ['LM0', 'LM24'], 'ต่ำ', true, `ค่าประมาณ: solidity ${pd.solidity} × พื้นที่จาน ${pd.disk_m2} m²`, 'propeller'),
    CDfeathered: L(0.10, '-', ['LM12'], 'ต่ำ', true, `ค่าประมาณตาม Raymer: D/q ≈ 0.1 σ A (feather) = ${pd.DoverQ_feathered_m2} m² (ΔCD ${pd.dCD_feathered_onS} ต่อเครื่องบนพื้นที่ปีก); windmilling ≈ 0.8 σ A = ${pd.DoverQ_windmill_m2} m²`, 'propeller'),
  },
  checks: {
    staticThrustISA: L(r(pg.ng_e4_187[0].T_N / 1000, 3), 'kN', ['LM0', 'LM24'], 'ต่ำ', true, `ต่อเครื่อง BEM 123.5 kW 2,300 rpm β75 ${pg.ng_e4_187[0].beta75}° FM ${pg.ng_e4_187[0].FM}`, 'propeller'),
    staticThrustVTBD31C: L(r(pg.ng_e4_187[0].T_N / 1000 * Math.cbrt(288.15 / 304.15), 3), 'kN', ['LM0', 'LM24'], 'ต่ำ', true, 'ค่าประมาณ ρ^(1/3) ที่กำลังคงที่ (turbo รักษากำลัง)', 'propeller'),
    momentumIdealStaticISA: L(r(Math.pow(123500 * Math.sqrt(2 * 1.225 * pd.disk_m2), 2 / 3) / 1000, 3), 'kN', ['LT20'], 'สูง', false, 'ทฤษฎีโมเมนตัม FM = 1', 'propeller'),
    peakEfficiency: L(0.89, '-', ['LM0', 'LM24'], 'ต่ำ', true, 'BEM ที่ ~175 KTAS', 'propeller'),
  },
};

// ── controls ──
ng.controls = {
  architecture: L({ pitch: 'reversible', roll: 'reversible', yaw: 'reversible', trim: 'tab' }, '-', ['LT5'], 'สูง', false, 'aileron, elevator, แฟลป ผ่าน push rod; rudder ผ่านสายเคเบิล; trim tab ผ่าน Bowden cable [LT5 p.7-4]'),
  surfaces: {
    elevator: L({ travel_deg: { up: 15.5, down: 13 }, rate_dps: null, actuator_tau_s: null, variable_stop_up_deg: 13 }, 'deg', ['LT1', 'LT4', 'LT9'], 'สูง', false, 'TCDS up 15.5 ± 0.5°, down 13 ± 1° [LT1]; variable elevator stop (ไฟฟ้า) จำกัดการเชิดที่กำลังสูงเพื่อผ่านเกณฑ์ stall [LT4 p.5] เหลือ ~13° [LT9]'),
    aileron: L({ travel_deg: { up: 25, down: 15 } }, 'deg', ['LT1'], 'สูง', false, 'up 25 ± 2°, down 15 +2/−0° [LT1]'),
    rudder: L({ travel_deg: { left: 27, right: 29 } }, 'deg', ['LT1'], 'สูง', false, '±1° [LT1]; ซิมวันนี้ใช้ค่าสมมาตร min = 27°'),
    flap: L({ travel_deg: { APP: 20, LDG: 42 } }, 'deg', ['LT1'], 'สูง', false, 'APP 20 +4/−2°, LDG 42 +3/−1° [LT1]'),
    trim_tab: L({ elevator: { nose_up: 28, nose_down: 25 }, rudder: { right: 45, left: 41 } }, 'deg', ['LT1'], 'สูง', false, '±5° / ±3° [LT1 C.III.16]; DA 42 รุ่นแรก elevator tab NU 58° และ rudder tab 30/29° [LT1 A.III.16]'),
  },
  trim: L({ elevator: 'ล้อ trim ด้วยมือ (tab)', rudder: 'ปุ่ม/ล้อ trim rudder (tab) สำคัญมากเมื่อ OEI', aileron: 'ไม่มี' }, '-', ['LT5', 'LT1'], 'กลาง', false, 'ช่วงมุม tab ดู surfaces.trim_tab'),
  pitch: {
    architecture: L({ kind: 'reversible', input: 'force' }, '-', ['LT5'], 'สูง', false, 'push rod'),
    S_e: L(0.66, 'm2', ['LT2'], 'สูง', false, ''), c_e: L(0.20, 'm', ['LT2'], 'ต่ำ', true, 'ค่าประมาณ 0.66 m² / ช่วงหาง 3.29 m'),
    gearing: L(2.0, 'rad/m', ['LT20'], 'ต่ำ', true, 'ค่าประมาณ: elevator 28.5° ตลอดช่วงคัน ~0.25 m'),
    eta_t: L(0.95, '-', ['LM10'], 'ต่ำ', true, 'หาง T อยู่นอก wake และนอก slipstream ของเครื่องบนปีก'),
    a_t: null, tau_e: null,
    l_t: L(T.l_h, 'm', ['LT1'], 'ต่ำ', true, 'เท่ากับ airframe.tail.l_h'), deda: null,
    Ch0: L(0, '-', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'), Ch_alpha: L(-0.1146, '1/rad', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'), Ch_delta: L(-0.3438, '1/rad', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'), Ch_tab: L(-0.2005, '1/rad', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'),
    tab_max: L(28, 'deg', ['LT1'], 'สูง', false, 'NU 28°, ND 25°'),
    trim_rate_flaps_down: L(2, 'deg/s', ['LT20'], 'ต่ำ', true, 'ค่าประมาณอัตรา tab เทียบเท่าของล้อ trim มือ (คีย์บอร์ดซิม)'), trim_rate_flaps_up: L(2, 'deg/s', ['LT20'], 'ต่ำ', true, 'เหมือนกัน'),
    breakout: L(4.45, 'N', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'), friction: L(4.45, 'N', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'),
    centring_spring: L({ Kc: 60, qFade: 400 }, 'N/rad, Pa', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'),
    stops: L({ teu: 15.5, ted: 13, teu_power_limited: 13 }, 'deg', ['LT1', 'LT9'], 'สูง', false, 'TCDS; variable elevator stop ~13° ที่กำลังสูง'),
    rate_limit: L(70, 'deg/s', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'),
  },
  roll: {
    architecture: L({ kind: 'reversible', input: 'force' }, '-', ['LT5'], 'สูง', false, 'push rod'),
    S_a_each: L(0.33, 'm2', ['LT2'], 'สูง', false, 'ครึ่งหนึ่งของ 0.66 m²'), c_a: L(0.22, 'm', ['LT2'], 'ต่ำ', true, 'ค่าประมาณ'),
    gearing: L(3.5, 'rad/m', ['LT20'], 'ต่ำ', true, 'ค่าประมาณ'), Ch_delta: L(-0.1719, '1/rad', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'), Ch_alpha: L(-0.0573, '1/rad', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'),
    breakout: L(3, 'N', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'), stops: L({ up: 25, down: 15, mean: 20 }, 'deg', ['LT1'], 'สูง', false, 'TCDS'), rate_limit: L(80, 'deg/s', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'),
  },
  yaw: {
    architecture: L({ kind: 'reversible', input: 'force' }, '-', ['LT5'], 'สูง', false, 'สายเคเบิล'),
    S_r: L(0.78, 'm2', ['LT2'], 'สูง', false, ''), c_r: L(0.45, 'm', ['LT2'], 'ต่ำ', true, 'ค่าประมาณ'),
    gearing: L(4.85, 'rad/m', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'), Ch_delta: L(-0.3438, '1/rad', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'), Ch_beta: L(-0.1146, '1/rad', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'),
    slipstream_q_ratio: L([1, 1], '-', ['LT2'], 'ต่ำ', true, 'เครื่องอยู่บนปีก ครีบไม่อยู่ใน slipstream'),
    tab_max: L(45, 'deg', ['LT1'], 'สูง', false, 'rudder trim RH 45° / LH 41°'), trim_rate: L(3, 'deg/s', ['LT20'], 'ต่ำ', true, 'ค่าประมาณ (คีย์บอร์ดซิม)'),
    breakout: L(13.3, 'N', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'), stops: L({ left: 27, right: 29 }, 'deg', ['LT1'], 'สูง', false, 'TCDS'), rate_limit: L(60, 'deg/s', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'),
  },
};

// ── gear ──
const xMain = 2.75, xNoseW = xMain - 1.735, hCG = 1.0;
const Wmtow = 1900 * G0, noseFrac = (xMain - 2.418) / 1.735, mainStatic = Wmtow * (1 - (xMain - 2.48) / 1.735) / 2, noseStatic = Wmtow * noseFrac;
ng.gear = {
  layout: L('tricycle_retract', '-', ['LT5'], 'สูง', false, 'ไฮดรอลิก (ปั๊มไฟฟ้า + accumulator); ล้อหลักพับเข้าใน center wing ล้อหน้าพับไปข้างหน้า [LT5 p.7-14]'),
  retract: L({ time_s: 8, time_range_s: [6, 10], VLO_kt: { extend: 188, retract: 152 }, VLE_kt: 188, emergency: 'ปล่อยแรงดัน ล้อลงด้วยแรงโน้มถ่วง ≤152 KIAS' }, 's, kt IAS', ['LT5', 'LT2', 'LT9'], 'กลาง', true, 'ค่าประมาณเฉพาะเวลาเก็บล้อ: AFM ให้เวลาลงล้อ 6–10 s [LT5 p.7-14][LT9] แต่ไม่ระบุเวลาเก็บล้อ จึงใช้ 8 s (กลางช่วงเวลาลงล้อ); ความเร็ว VLO/VLE จาก AFM [LT2]'),
  geometry: {
    nose_contact_body_extended: L([FRDx(xNoseW), 0, hCG + 0.05], 'm FRD', ['LT2'], 'ต่ำ', true, `ค่าประมาณ: ล้อหลักที่ ${xMain} m DAT, wheelbase 1.735 m [LT2]; สูง CG ~${hCG} m`),
    main_contact_body_extended: L([[FRDx(xMain), -1.475, hCG + 0.08], [FRDx(xMain), 1.475, hCG + 0.08]], 'm FRD', ['LT2'], 'ต่ำ', true, 'track 2.95 m [LT2]; x และ z ค่าประมาณ'),
    cg_height_parked: L(hCG, 'm', ['LT1'], 'ต่ำ', true, 'ค่าประมาณ (ปีกต่ำ)'),
  },
  strut_main: {
    kind: L('trailing_link_oleo', '-', ['LT5'], 'กลาง', true, 'AFM: struts เป็น "air-oil assemblies" [LT5 p.7-14]; รูปแบบ trailing link อ่านจากภาพเครื่อง (ค่าประมาณ)'),
    stroke: L(0.15, 'm', ['LT20'], 'ต่ำ', true, 'ค่าประมาณ (ที่ล้อ)'),
    p_static: L(250, 'psi', ['LT20'], 'ต่ำ', true, 'ค่าประมาณ'),
    piston_area: L(r(mainStatic / (250 * 6894.76), 3), 'm2', ['LT20'], 'ต่ำ', true, `ค่าประมาณเทียบเท่าที่ล้อ: แรงสถิต ${Math.round(mainStatic)} N/ล้อ ที่ MTOM CG หลัง ÷ p_static`),
    ratio_static_to_extended: L(2.5, '-', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'), ratio_compressed_to_extended: L(8, '-', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'),
    polytropic_n_dynamic: L(1.12, '-', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'), polytropic_n_static: L(1.0, '-', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'),
    Kh_compression: L(Math.round(4000 * mainStatic / 9600), 'N/(m/s)^2', ['LT20'], 'ต่ำ', true, 'สเกลค่ารอบที่ 1 ตามแรงสถิต'),
    Kr_rebound: L(Math.round(48000 * mainStatic / 9600), 'N/(m/s)^2', ['LT20'], 'ต่ำ', true, 'สเกลตามแรงสถิต'),
    c_linear: L(Math.round(2000 * mainStatic / 9600), 'N s/m', ['LT20'], 'ต่ำ', true, 'สเกลตามแรงสถิต'),
    seal_friction_ratio: L(0, '-', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'),
  },
  strut_nose: {
    kind: L('oleo', '-', ['LT5'], 'กลาง', true, 'air-oil [LT5 p.7-14]; มี shimmy damper [LT5 p.7-15]'),
    stroke: L(0.12, 'm', ['LT20'], 'ต่ำ', true, 'ค่าประมาณ'), p_static: L(250, 'psi', ['LT20'], 'ต่ำ', true, 'ค่าประมาณ'),
    piston_area: L(r(noseStatic / (250 * 6894.76), 3), 'm2', ['LT20'], 'ต่ำ', true, `แรงสถิต ${Math.round(noseStatic)} N ที่ MTOM CG หน้า`),
    ratio_static_to_extended: L(2.5, '-', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'), ratio_compressed_to_extended: L(8, '-', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'),
    Kh_compression: L(Math.round(1600 * noseStatic / 2870), 'N/(m/s)^2', ['LT20'], 'ต่ำ', true, 'สเกลตามแรงสถิต'), Kr_rebound: L(Math.round(19000 * noseStatic / 2870), 'N/(m/s)^2', ['LT20'], 'ต่ำ', true, 'สเกลตามแรงสถิต'),
    c_linear: L(Math.round(1000 * noseStatic / 2870), 'N s/m', ['LT20'], 'ต่ำ', true, 'สเกลตามแรงสถิต'),
  },
  tyre_main: {
    size: L({ size: '15x6.0-6', ply: 6, speed_mph: 120 }, '-', ['LT2', 'LT1'], 'สูง', false, '[LT2 p.1-6]'),
    rated_load: L(Math.round(mainStatic * 1.07), 'N', ['LT20'], 'ต่ำ', true, 'ค่าประมาณ: ≥ แรงสถิตที่ MTOM × 1.07 (ไม่พบ data book)'),
    rated_pressure: L(60, 'psi', ['LT20'], 'ต่ำ', true, 'ค่าประมาณ'), operating_pressure: L(55, 'psi', ['LT20'], 'ต่ำ', true, 'ค่าประมาณ (AFM บทที่ 8 ไม่ได้เปิด)'),
    outside_diameter: L(0.381, 'm', ['LT2'], 'สูง', false, '15 in'), section_width: L(0.152, 'm', ['LT2'], 'สูง', false, '6.0 in'),
    k_vertical: L(200000, 'N/m', ['LT20'], 'ต่ำ', true, 'ค่าประมาณ'), c_vertical: L(2000, 'N s/m', ['LT20'], 'ต่ำ', true, 'ค่าประมาณ'),
    cornering_stiffness_coef: L(3.2, '1/rad', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'), relaxation_length: L(0.25, 'm', ['LT20'], 'ต่ำ', true, 'ค่าประมาณ'),
    k_longitudinal: L(150000, 'N/m', ['LT20'], 'ต่ำ', true, 'ค่าประมาณ'), mu_peak_dry: L(0.8, '-', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'),
    mu_skid_ratio_dry: L(0.75, '-', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'), mu_skid_ratio_wet: L(0.5, '-', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'),
    rolling_radius: L(0.18, 'm', ['LT2'], 'ต่ำ', true, 'ค่าประมาณ'), wheel_inertia: L(0.12, 'kg m2', ['LT20'], 'ต่ำ', true, 'ค่าประมาณ'),
  },
  tyre_nose: {
    size: L({ size: '5.00-5', ply: 10, speed_mph: 120 }, '-', ['LT2', 'LT1'], 'สูง', false, '[LT2 p.1-6]'),
    rated_load: L(Math.round(noseStatic * 1.5), 'N', ['LT20'], 'ต่ำ', true, 'ค่าประมาณ (10 PR)'), rated_pressure: L(70, 'psi', ['LT20'], 'ต่ำ', true, 'ค่าประมาณ'),
    operating_pressure: L(60, 'psi', ['LT20'], 'ต่ำ', true, 'ค่าประมาณ'), outside_diameter: L(0.355, 'm', ['LT20'], 'ต่ำ', true, 'ค่าประมาณ 5.00-5'),
    k_vertical: L(130000, 'N/m', ['LT20'], 'ต่ำ', true, 'ค่าประมาณ'), c_vertical: L(1000, 'N s/m', ['LT20'], 'ต่ำ', true, 'ค่าประมาณ'),
    cornering_stiffness_coef: L(3.2, '1/rad', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'), relaxation_length: L(0.22, 'm', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'),
  },
  brakes: {
    kind: L('hydraulic disc, toe brakes ทั้งสองที่นั่งหน้า, parking brake; differential braking ใช้เลี้ยวแคบ', '-', ['LT9'], 'กลาง', true, 'ไม่พบใน AFM ส่วนที่เปิดได้; สไลด์โรงเรียนกล่าวถึง differential braking [LT9]'),
    force_limit_ratio: L(0.6, '-', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'), pressure_rise_rate: L(2.5, '1/s', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'),
    antiskid: L(0, 'bool', ['LT5'], 'สูง', false, 'ไม่มี anti-skid'), heat_sink_mass: L(2, 'kg', ['LT20'], 'ต่ำ', true, 'ค่าประมาณต่อล้อ'),
    heat_sink_cool_tau: L(600, 's', ['LT20'], 'ต่ำ', true, 'ค่าประมาณ'), fade_start_temp: L(400, 'degC', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'), fade_full_temp: L(700, 'degC', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'),
  },
  steering: {
    mode: L({ type: 'pedal_linked', caster_with_diff_brake: true }, '-', ['LT5', 'LT9'], 'กลาง', false, 'ล้อหน้าเลี้ยวตาม pedal ตลอดระยะ [LT5 p.7-15]; เกินจากนั้นใช้ differential brake [LT9]'),
    pedal_max: L(30, 'deg', ['LT9'], 'ต่ำ', false, '±30° [LT9]'), caster_max: L(52, 'deg', ['LT9'], 'ต่ำ', false, 'ถึง 52° เมื่อใช้ differential braking [LT9]'),
    steer_rate: L(60, 'deg/s', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'), shimmy_lag: L(0.05, 's', ['LT20'], 'ต่ำ', true, 'มี shimmy damper [LT5 p.7-15]'),
  },
  certification: {
    part23_limit_descent: L({ formula: 'V = 4.4 (W/S)^0.25 fps, 7..10 fps', da42ng_fps: r(4.4 * Math.pow(4189 / 175.3, 0.25), 3) }, 'fps', ['LT20'], 'สูง', false, 'W/S 23.9 lb/ft² ที่ MTOM (14 CFR 23.473 เดิม; ฐาน JAR-23 ของ DA42 [LT1])'),
    part23_wing_lift_ratio: L(0.667, '-', ['LT20'], 'สูง', false, '23.473'), part23_min_load_factors: L({ inertia: 2.67, ground_reaction: 2 }, 'g', ['LT20'], 'สูง', false, '23.473'),
    part23_reserve_drop_factor: L(1.44, 'x drop height', ['LT20'], 'สูง', false, '23.727'),
  },
  legacy: null,
};

// ── interference / wind / input / validation (round-1 per-type leaves) ──
ng.interference = {
  downwash: { deda: null, eps0: null, l_t: L(T.l_h, 'm', ['LT1'], 'ต่ำ', true, 'เท่ากับ tail.l_h'), VH: L(T.VH, '-', ['LT2'], 'ต่ำ', true, 'S_h l_h / (S c̄)'), a_t: null, eta_t: L(0.95, '-', ['LM10'], 'ต่ำ', true, 'หาง T'), CLadot: null, Cmadot: null },
  groundEffect: {
    rMac: L([FRDx(W.x_c4MAC_mDAT), W.y_MAC, 0.11], 'm (FRD จาก CG, y ใช้ ±)', ['LT2'], 'ต่ำ', true, 'c/4 MAC ปีก; ปีกต่ำกว่า CG ~0.11 m (ค่าประมาณ)'),
    CLa_w: null, A: L(11.06, '-', ['LT2'], 'สูง', false, ''),
    rEps: L({ a: 3.99, m: 0.652 }, '-', ['LT20'], 'ต่ำ', true, 'รอบที่ 1; หาง T สูงจากพื้นมาก ผลของพื้นต่อ downwash ที่หางน้อยกว่าเครื่องหางต่ำ'),
  },
  slipstream: {
    diskDiameter: L(1.87, 'm', ['LT1'], 'สูง', false, ''), hubRadius: L(0.17, 'm', ['LT2'], 'ต่ำ', true, 'ค่าประมาณรัศมี spinner'),
    hubPos: L([[FRDx(xProp), -yE, zT], [FRDx(xProp), yE, zT]], 'm (FRD จาก CG)', ['LT2'], 'ต่ำ', true, 'สองเครื่อง ซ้าย/ขวา'),
    sense: L(1, '-', ['LT1'], 'สูง', false, 'CW ทั้งคู่'), kappa: L(0.43, '-', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'),
    immersionH: L({ axes: { rs_m: [0.3, 0.5, 0.7, 0.9, 1.1] }, data: [0, 0, 0, 0, 0] }, '-', ['LT1'], 'ต่ำ', true, 'หาง T อยู่เหนือและอยู่ระหว่าง slipstream ของสองเครื่อง จึงไม่จุ่ม (ค่าประมาณ)'),
    immersionV: L({ axes: { rs_m: [0.3, 0.5, 0.7, 0.9, 1.1] }, data: [0, 0, 0, 0, 0] }, '-', ['LT1'], 'ต่ำ', true, 'ครีบอยู่กลางลำ ห่างแกนใบพัด 1.70 m > รัศมี slipstream'),
    kSwirl: L(0.5, '-', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'), zSwirl: L(0.55, 'm', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'),
    finArea: L(2.43, 'm2', ['LT2'], 'สูง', false, ''), finArm: L(T.l_v, 'm', ['LT1'], 'ต่ำ', true, 'ค่าประมาณ: c/4 ของครีบ (7.25 m DAT, lt_geom) ลบ c/4 MAC'), finLiftSlope: null,
    eta_v: L(0.95, '-', ['LM10'], 'ต่ำ', true, 'ค่าประมาณ: ครีบอยู่กลางลำตัว นอก slipstream ของเครื่องบนปีก'), blownSpanFactor: L(0.9, 'D', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'),
    blownArea: L(2.4, 'm2', ['LT2'], 'ต่ำ', true, 'ต่อเครื่อง: 0.9 × 1.87 m × คอร์ดที่ y 1.7 m (~1.43 m)'),
    kBlown: L(0.5, '-', ['LT20'], 'ต่ำ', true, 'รอบที่ 1; สำคัญกับ OEI: ปีกข้างเครื่องที่ทำงานได้แรงยกเพิ่ม → ม้วนไปทางเครื่องดับ'),
    k_deda_power: L(0, '-', ['LT2'], 'ต่ำ', true, 'หาง T ไม่อยู่ใน slipstream'),
  },
};
ng.wind = {
  fFactor: { trainerExcessTW: null },
  wake: { b0_over_b: L(0.7854, '-', ['LT20'], 'สูง', false, 'π/4 ปีกวงรี'), rc_over_b: L({ default: 0.035, min: 0.02, max: 0.06 }, '-', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'), trainerRollControl: null },
};
ng.input = {
  keyboard: { interim_trim_rate_elevator: L(0.5, 'deg/s', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'), flap_notches: null },
};
ng.validation = {
  classification: { hqClassCategory: L({ class: 'I', approachLanding: 'C', cruiseClimb: 'B', takeoff: 'C' }, '-', ['LT20'], 'กลาง', true, 'MIL-F-8785C class I (เครื่องเบา < ~6,000 lb) ตามรอบที่ 1') },
  procedures: { v50MinFactor_singleEngine: L({ VS1_factor: 1.2, VMC_factor: 1.1 }, '× VS1, × VMC', ['LT20', 'LM1'], 'สูง', false, 'เครื่องหลายเครื่องยนต์: V50 ≥ max(1.2 VS1, 1.1 VMC) (14 CFR 23.51 เดิม)') },
  trim_targets: {
    cruise: L({ ias_kt: 135, h_ft: 6000, gamma_deg: 0 }, 'kt, ft, deg', ['LT10'], 'ต่ำ', true, 'สภาพ cruise ฝึกบิน (ราว 75 %) ค่าประมาณ'),
    approach: L({ ias_kt: 84, h_ft: 1000, gamma_deg: -3 }, 'kt, ft, deg', ['LT9'], 'ต่ำ', true, 'VREF แฟลป LDG ล้อลง'),
  },
  takeoff_test: L({ flap: 'UP', VR_kt: 76, theta_deg: 9 }, 'kt IAS, deg', ['LT9'], 'ต่ำ', true, 'normal take-off แฟลป UP; มุมเงย 9° ค่าประมาณ'),
  stall_test: L({ UP: 85, APP: 80, LDG: 76 }, 'kt', ['LM1'], 'ต่ำ', true, 'ความเร็วเริ่มการทดสอบ ~1.25 VS'),
  reference_modes: L({ source: 'Londono 2009 (DA42 TDI, ERAU) ไม่ได้รายงานความถี่โหมด; derivative บินจริงอยู่ที่ §06.6', available: false }, '-', ['LT15'], 'กลาง', false, 'ไม่พบโหมดพลวัตที่เผยแพร่ของ DA42'),
};

// ───────────── derivatives (lm_derivs estimate, ค่าประมาณ) ─────────────
const wrap = card => new Proxy({}, { get: () => undefined });   // placeholder (not used)
function asLoaded(card) { return card; }
const flags = [], geo = geoFromCard(asLoaded(ng), flags);
geo.cg_frac = I.cg_pct / 100;
const mT = 1752, Vc = 135 * KT, Va = 84 * KT;
const CLc = 2 * mT * G0 / (1.225 * 16.29 * Vc * Vc), CLa_ = 2 * mT * G0 / (1.225 * 16.29 * Va * Va);
const dC = estimate(geo, { CL: CLc, M: Vc / 340, alpha: (CLc - CL0c) / 5.2, CD0: pol.CD0_mean });
const dA = estimate(geo, { CL: CLa_, M: Va / 340, alpha: (CLa_ - CL0c - 0.6) / 5.2, CD0: pol.CD0_mean + 0.057 });
const D = {}, names = ['CLq', 'CLadot', 'CLde', 'CYb', 'CYdr', 'CYr', 'Clb', 'Clp', 'Clr', 'Clda', 'Cldr', 'Cmq', 'Cmadot', 'Cmde', 'Cnb', 'Cnp', 'Cnr', 'Cnda', 'Cndr'];
// flight-test comparison (Londono 2009, DA42 TDI, output-error time domain; per rad; sign converted to AC convention where needed)
const FT_ = { Cmq: -11.36, Cmde: -0.58, CYb: -0.31, Clda: 0.19, Cnr: -0.087, Cndr: -0.053, Cnb: 0.049 };
for (const n of names) {
  const c = dC.body[n], a = dA.body[n];
  const ft = FT_[n] != null ? `; บินจริง DA42 TDI (Londono 2009, OE-time, แปลงเครื่องหมายตาม AC) ${FT_[n]}` : '';
  D[n] = L({ cruise: r(c, 4), approach: r(a, 4) }, '1/rad', ['LM10', 'LM13', 'LT15'], 'ต่ำ', true, `ค่าประมาณ lm_derivs (แกนลำตัว, cruise 135 kt / approach 84 kt แฟลป LDG, CG ${r(I.cg_pct, 3)} %MAC)${ft}`);
}
D.CD0 = L(r(pol.CD0_mean, 4), '-', ['LT10', 'LM12'], 'ต่ำ', true, `polar พาราโบลา (clean ล้อขึ้น) จาก cruise 3 จุด ช่วง ${pol.CD0_spread.join('–')} (lt_polar.mjs)`);
D.K = L(r(pol.oswald.K, 4), '-', ['LM12'], 'ต่ำ', true, `1/(π A e), e ${pol.oswald.e} (Raymer eq. 12.48)`);
ng.aero.derivatives = D;
ng.aero.static_long.CLalpha = L(r(dC.static.CLalpha, 4), '1/rad', ['LM10', 'LT15'], 'กลาง', true, `ค่าประมาณ lm_derivs (ทั้งลำ); บินจริง DA42 TDI ที่ α ≈ 0: 4.84–5.50 /rad (Londono 2009 [LT15] p.81)`);
// gap 22 (19 Nov 2026): the target Cmα is the flight-test value [LT15]; the geometry estimate stays in the note for comparison
ng.aero.static_long.Cmalpha = L(-0.535, '1/rad', ['LT15', 'LM10'], 'กลาง', true, `ค่าประมาณ: จุดกลางของค่าบินทดสอบ DA42 TDI −0.50 ถึง −0.57 /rad (Londono 2009 [LT15] Table 22, output-error) ซึ่ง CG ของการทดสอบไม่ระบุ จึงใช้เป็นค่าเป้าที่ CG อ้างอิง ${r(I.cg_pct, 3)} %MAC ได้เพียงโดยประมาณ; ค่าจากรูปทรง (lm_derivs) ที่ CG อ้างอิงได้ ${r(dC.static.Cmalpha, 4)} /rad (h_n ${r(dC.static.h_n, 3)}, static margin ${r(dC.static.static_margin, 3)}) มากกว่าบินจริง ~3 เท่า เก็บไว้เทียบเท่านั้น; Cmq และ Cmδe ยังเป็นค่าจากรูปทรงเพราะค่าบินทดสอบ Cmδe −0.58 ทำให้ซิม stall แฟลป LDG และหมุนตัวขึ้นไม่ได้ภายใน elevator 15.5° (§06.6.4)`);
ng.aero.static_long.alpha_CLmax = null;
// round-1 aero leaves (static_long extras, strip wing, stall warning, …)
const tauA = tauFlap(0.25), KLL = dC.static.KLL;
Object.assign(ng.aero.static_long, {
  alpha_star: null, alpha_star_neg: L({ UP: 13, LDG: 9 }, 'deg', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'),
  a1: L(22, '1/rad', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'),
  CL_sep_at_alpha_star: L({ UP: r(0.70 * DET[0].CLmax, 3), LDG: r(0.66 * DET[2].CLmax, 3) }, '-', ['LT20'], 'ต่ำ', true, 'สัดส่วนเดียวกับรอบที่ 1 (0.70/0.66 ของ CLmax)'),
  CDmax_90: L(r(1.11 + 0.018 * 11.06 + 0.12, 3), '-', ['LT20'], 'ต่ำ', true, '1.11 + 0.018 AR + หาง/ลำตัว 0.12 (สูตรรอบที่ 1)'),
  dCD_sep: L(0.2, '-', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'),
  CmX: L(-0.12, '-', ['LT20', 'LT4'], 'ต่ำ', true, 'รอบที่ 1; DA42 ผ่านเกณฑ์ stall ด้วย variable elevator stop ที่กำลังสูง [LT4] จึงควรมี pitch break ลงหัว'),
});
ng.aero.elevator_fade = { alpha_t_star: L(25, 'deg', ['LT20'], 'ต่ำ', true, 'หาง T อยู่นอก wake ที่ α ปกติ; wake ถึงหางที่ α สูงกว่าเครื่องหางต่ำ (ค่าประมาณ)'), a_t: L(10, '1/rad', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'), floor: L(0.35, '-', ['LT20'], 'ต่ำ', true, 'รอบที่ 1') };
ng.aero.separation_dynamics = { tau1: L(r(0.4 * 1.271 / 1.65, 3), 's', ['LT20'], 'ต่ำ', true, 'สเกลรอบที่ 1 ด้วย c̄'), tau2: L(r(0.2 * 1.271 / 1.65, 3), 's', ['LT20'], 'ต่ำ', true, 'สเกลด้วย c̄') };
ng.aero.large_beta = { CY_crossflow: L(0.45, '-', ['LT20'], 'ต่ำ', true, 'รอบที่ 1') };
ng.aero.strip_wing = {
  taper: L(W.taper, '-', ['LT2'], 'ต่ำ', true, 'ปีกเรียวตรงเทียบเท่า'), dihedral_eff: L(5, 'deg', ['LT2'], 'สูง', false, ''), washout: L(2, 'deg', ['LM10'], 'ต่ำ', true, 'ค่าประมาณ'),
  kp_roll: L(r(KLL, 3), '-', ['LM10'], 'กลาง', true, 'ตัวแก้ lifting line K_LL (สมการ 01.3-9) ที่ A 11.06'), tau_aileron: L(r(tauA, 3), '-', ['LM10'], 'ต่ำ', true, 'thin airfoil × 0.85 ที่ cf/c 0.25'),
  aileron_span_frac: L([0.75, 0.97], '-', ['LT2'], 'ต่ำ', true, 'ค่าประมาณ'),
};
ng.aero.stall_warning = { min_margin: L(5, 'kt', ['LM1'], 'สูง', false, 'เกณฑ์ 23.207'), alpha_warn_5kt: null, alpha_warn_design: null };
ng.aero.buffet = {
  vertical_filter: L({ w0: 75.92, Q: 8.28 }, 'rad/s,-', ['LT20'], 'ต่ำ', true, 'รอบที่ 1 (ไม่มีข้อมูล DA42)'),
  lateral_filter: L({ w0: [36.43, 64.71], Q: [4.19, 11.99], gain_ratio: [2, 1] }, 'rad/s,-,-', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'),
  rms_full: L({ az: 0.05, ay: 0.016 }, 'g', ['LT20'], 'ต่ำ', true, 'รอบที่ 1'),
};
ng.interference.downwash.deda = L(r(dC.static.deda, 3), '-', ['LM10'], 'ต่ำ', true, 'DATCOM (หาง T สูง h_H 1.75 m)');
ng.interference.downwash.eps0 = L(r(2 * CL0c / (Math.PI * 11.06) * (1 - 0.3), 3), 'rad', ['LM10'], 'ต่ำ', true, 'ε0 ≈ 2 CL0/(πA) × 0.7 (หาง T สูง)');
ng.interference.downwash.a_t = L(r(dC.static.CLaH, 3), '1/rad', ['LM10'], 'ต่ำ', true, 'CLα หางระดับ (A_h 4.6)');
ng.interference.downwash.CLadot = L(r(dA.body.CLadot, 3), '1/(rad·c/2V)', ['LM10'], 'ต่ำ', true, 'lm_derivs approach');
ng.interference.downwash.Cmadot = L(r(dA.body.Cmadot, 3), '1/(rad·c/2V)', ['LM10'], 'ต่ำ', true, 'lm_derivs approach');
ng.interference.groundEffect.CLa_w = L(r(dC.static.CLaW, 3), '1/rad', ['LM10'], 'กลาง', true, 'CLα ปีก DATCOM A 11.06');
ng.interference.slipstream.finLiftSlope = L(r(dC.static.CLaV, 3), '1/rad', ['LM10'], 'ต่ำ', true, 'lm_derivs');
ng.controls.pitch.a_t = L(r(dC.static.CLaH, 3), '1/rad', ['LM10'], 'ต่ำ', true, 'Helmbold, A_h 4.6 (lm_derivs)');
ng.controls.pitch.tau_e = L(r(dC.static.tauE, 3), '-', ['LM10'], 'ต่ำ', true, 'จาก chord ratio elevator 0.28 (0.66/2.35 m²) ตาม DATCOM ใน lm_derivs');
ng.controls.pitch.deda = L(r(dC.static.deda, 3), '-', ['LM10'], 'ต่ำ', true, 'สูตร DATCOM ของ lm_derivs กับหาง T สูง 1.75 m เหนือปีก');
ng.wind.wake.trainerRollControl = L({ Clda: r(dA.body.Clda, 3), daMax_deg: 20, ClMax: r(dA.body.Clda * 20 * DEG, 3) }, '-', ['LM10', 'LT1'], 'ต่ำ', true, 'อำนาจม้วนสูงสุด (ค่าประมาณ) ใช้เทียบกับ wake vortex');
// excess T/W at approach (both engines full) for the wind-shear F-factor
{ const V = 84 * KT, q = 0.5 * 1.225 * V * V, CL = 1900 * G0 / (q * 16.29), CD = pol.CD0_mean + 0.045 + 0.012 + pol.oswald.K * CL * CL;
  const Tav = 2 * 2330; ng.wind.fFactor.trainerExcessTW = L(r((Tav - q * 16.29 * CD) / (1900 * G0), 3), '-', ['LT10', 'LM0'], 'ต่ำ', true, `(T − D)/W ที่ 84 kt แฟลป LDG ล้อลง เต็มกำลังสองเครื่อง MTOM (T ${Tav} N จาก BEM, CD ${r(CD, 3)})`); }

// gap 20 (19 Nov 2026): validation.stick_force_targets — a requirement band, not a DA42 measurement (the sim has no stick-force
// model). The DA42 has a centre stick [LT5 p.7-4], so the round-1 MIL-F-8785C Level 1 centre-stick rule
// (controls.requirements.mil8785c_fs_per_g_centre_stick [R1:C12]) and the 14 CFR 23.155 stick floor W/140 (15–35 lbf) [LM3] apply.
function stickBandStick({ nAlpha, nL, W_lb }) {
  const dn = nL - 1, LBF = 4.4482216, q = (x, n = 1) => +x.toFixed(n);
  const milMax = Math.max(Math.min(240 / nAlpha, 28), 56 / dn), milMin = Math.max(21 / dn, 3);
  const p23Force = Math.min(Math.max(W_lb / 140, 15), 35), p23Min = p23Force / dn, lo = Math.max(milMin, p23Min), hi = milMax;
  return { controller: 'centre_stick', fs_per_g_lbf: { min: q(lo), max: q(hi) }, fs_per_g_N: { min: q(lo * LBF, 0), max: q(hi * LBF, 0) },
    nAlpha_cruise_g_per_rad: q(nAlpha, 2), nL, mil_L1_centre_stick_lbf: { min: q(milMin), max: q(milMax) },
    part23_155_force_lbf: q(p23Force), part23_155_min_gradient_lbf: q(p23Min), fs_per_kt_min_lbf: 0.167, fs_per_kt_min_N: q(0.167 * LBF, 2) };
}
{ const nA = cardNG?.res?.modes?.cruise?.nAlpha;
  if (nA) { const sb = stickBandStick({ nAlpha: nA, nL: 3.8, W_lb: 1900 / 0.45359237 });
    ng.validation.stick_force_targets = L(sb, 'lbf/g, N/g, g/rad, lbf, lbf/kt, N/kt', ['R1:C12', 'LM3', 'LC14', 'LT2', 'LT5'], 'ต่ำ', true,
      `ค่าประมาณ: ไม่ใช่ค่าที่วัดจาก DA42 แต่เป็นแถบเป้าหมายจากเกณฑ์ MIL-F-8785C Level 1 แบบ centre stick (สูตรของ controls.requirements.mil8785c_fs_per_g_centre_stick รอบที่ 1 [R1:C12]: ขีดบน min(240/(n/α), 28) แต่ไม่ต่ำกว่า 56/(nL − 1), ขีดล่าง max(21/(nL − 1), 3)) ด้วย n/α ${sb.nAlpha_cruise_g_per_rad} g/rad ของบัตรที่ cruise 135 KIAS 6,000 ft MTOM 1,900 kg (lm_card) และ nL 3.8 (normal category [LT2]) กับพื้นขั้นต่ำจาก 14 CFR 23.155 แบบ stick (แรงถึง limit load ≥ W/140 = ${sb.part23_155_force_lbf} lbf ⇒ ≥ ${sb.part23_155_min_gradient_lbf} lbf/g) [LM3]; แรงต่อ kt ขั้นต่ำ 1 lbf ต่อ 6 kt ตาม 14 CFR 25.173(c) ใช้เป็นแนวทาง [LC14]; DA42 ใช้ control stick [LT5 p.7-4]; ซิมยังไม่มีแบบจำลองแรงที่คัน (T-LT-31)`); } }

// legacy (from lt_run.mjs fit, if present)
const legacyOf = (f, id) => {
  if (!f) return null;
  return {
    aero: L({ ...f.legacy.aero }, '-', ['LM1', 'LT2', 'LT10'], 'ต่ำ', true, `fit ของ lm_legacy_fit + lt_run.mjs (${id}): CD0/K รูปแบบซิม จาก glide ที่ประมาณจาก polar cruise; aStall/aStallFlap แก้ให้ CLmax ตรงเป้าด้วย elevator 15.5°; Cma −0.535 = จุดกลางค่าบินทดสอบ DA42 TDI −0.50…−0.57 [LT15] ตาม aero.static_long.Cmalpha (เดิม −1.10 คือ |Cmα| มากที่สุดที่ยัง stall ได้ภายใน elevator 15.5°; lm_derivs −1.75); CDgear ล้อพับ`),
    propulsion: L({ ...f.legacy.propulsion }, 'W, -, N, -', ['LT10', 'LM0'], 'ต่ำ', true, `T0 จาก BEM (สองเครื่อง), Vc ปรับให้ ROC สูงสุดของซิม = POH (${id}); idle 0 เพราะ polar ไม่รวมแรงต้านใบพัด`),
  };
};
{ const lg = legacyOf(fit.da42ng, 'da42ng'); if (lg) { ng.aero.legacy = lg.aero; ng.propulsion.legacy = lg.propulsion; }
  if (fit.da42ng?.alpha) { ng.aero.static_long.alpha_star = L(fit.da42ng.alpha.alpha_star, 'deg', ['LM1'], 'ต่ำ', true, 'จุดกลาง Beard–McLain ที่ buildAC แก้หา (= aStall, aStall + aStallFlap)');
    ng.aero.static_long.alpha_CLmax = L(fit.da42ng.alpha.alpha_CLmax, 'deg', ['LM1'], 'ต่ำ', true, 'α ที่ CLmax trim ของซิม (lm_card simCLmax)');
    ng.aero.stall_warning.alpha_warn_5kt = L(fit.da42ng.alpha.alpha_warn_5kt, 'deg', ['LM1'], 'ต่ำ', true, 'α ที่ VS + 5 kt (ซิม)');
    ng.aero.stall_warning.alpha_warn_design = L(fit.da42ng.alpha.alpha_warn_design, 'deg', ['LM1'], 'ต่ำ', true, 'α ที่ VS + 7 kt (กลางช่วง 5–10 kt)'); }
  if (fit.da42ng?.gear) ng.gear.legacy = L(fit.da42ng.gear, 'AC.gear', ['LT2'], 'ต่ำ', true, 'รูปแบบ AC.gear ของซิม (ค่าประมาณจาก gear.geometry + strut)');
  if (fit.da42ng?.flapNotches) ng.input.keyboard.flap_notches = L(fit.da42ng.flapNotches, 'สัดส่วน AC.flaps', ['LT1'], 'ต่ำ', true, 'UP / APP / LDG ตาม flapMap lift'); }

// _na
ng._na = L([
  'turbofan.*', 'turboprop.*', 'numerics.*', 'otherSims.*', 'aero.static_long.table_clean', 'aero.spin_reference.*',
  'interference.groundEffect.tablesCheck', 'propeller.tables.CNmu', 'propeller.tables.CMmu', 'propeller.betaReverse.*',
  'propeller.engineInterface.flightIdleShaftPower', 'controls.pitch.derived_check', 'controls.reference_types.*',
  'controls.roll.tab_max', 'controls.roll.trim_rate', 'gear.brakes.antiskid_efficiency', 'gear.brakes.antiskid_efficiency_measured',
  'gear.brakes.antiskid_slip_setpoint', 'gear.certification.part25_limit_descent', 'gear.certification.part25_friction_cap',
  'wind.discreteGust.cfr25_341_Fg', 'wind.wake.leaders', 'validation.typicalModes.*', 'validation.currentModel.*',
], '-', 'aircraft', ['LT1'], 'สูง', false,
  'turbofan/turboprop: เครื่องลูกสูบดีเซล · numerics: ค่าของตัวซิม · otherSims.*: หัวข้อ 03 (LB) เป็นเจ้าของ path otherSims · table_clean: ตัวอย่างรูปแบบที่คำนวณจากพารามิเตอร์ได้ · spin_reference: DA42 เป็น normal category ห้าม spin [LT2 p.2-19] ไม่มีข้อมูล spin · groundEffect.tablesCheck, pitch.derived_check: ค่าตรวจจากสูตรรอบที่ 1 · CNmu/CMmu: BEM ของ lm_prop ไม่คำนวณแรงในกระแสเอียง (งาน P2) · betaReverse: ไม่มี reverse · flightIdleShaftPower: แนวคิดเทอร์โบพร็อป · reference_types: เครื่องโดยสาร · aileron ไม่มี trim tab [LT1] · ไม่มี anti-skid · ไม่ใช่ Part 25 · wake.leaders: เครื่องโดยสาร · typicalModes/currentModel: ค่าของเครื่องฝึกรอบที่ 1');
ng._na = { v: ng._na.v, u: '-', scope: 'aircraft', src: ['LT1'], conf: 'สูง', est: false, note: ng._na.scope };

// ───────────────────────── da42_tae125 (DA 42 "TDI") ─────────────────────────
const t = {
  _inherits: { v: 'da42ng', u: '-', scope: 'aircraft', src: [], conf: 'สูง', est: false, note: 'DA 42 รุ่นแรก (TCDS Section A) เครื่อง TAE 125-01 / -02-99 / -02-114 เลขเครื่อง 42.0xx–42.4xx; ในไทย CATC 4 BAC 1 [LS1]; ใส่เฉพาะค่าที่ต่างจาก NG' },
  airframe: {
    identity: L({ manufacturer: 'Diamond Aircraft Industries GmbH (Austria)', model: 'DA 42', variant: 'DA 42 "TDI" / Twin Star (MÄM 42-088 MTOM 1,785 kg)', engine: '2 × Technify (Thielert) TAE 125-01 Centurion 1.7 หรือ TAE 125-02-99 (MÄM 42-198)', propeller: '2 × MTV-6-A-C-F/CF187-129 3 ใบ CW', seats: 4, category: 'normal', tc_ref: 'EASA TCDS EASA.A.005 Section A; AFM Doc 7.01.05-E' }, '-', ['LT1', 'LT3'], 'สูง', false, 'เครื่องในไทยเลข 42.197/198/216/311/407 [LS1]'),
    weights: {
      MTOW: L(1785, 'kg', ['LT1', 'LT16'], 'สูง', false, '3,935 lb กับ MÄM 42-088 (มาตรฐาน 1,700 kg) [LT1 A Note 6]; สมมติว่าเครื่องในไทยทำ MÄM แล้ว (ไม่ยืนยัน)'),
      MLW: L(1700, 'kg', ['LT1', 'LT16'], 'สูง', false, '3,748 lb (1,785 kg กับ OÄM 42-195)'),
      MZFW: L(1650, 'kg', ['LT1'], 'สูง', false, '1,674 กับ OÄM 42-188; 1,730 กับ +OÄM 42-195'),
      BEW_typical: L(1250, 'kg', ['LT16', 'LT15'], 'กลาง', false, 'สเปก AOPA 2006 2,750 lb [LT16]; เครื่องทดสอบ ERAU 2,804 lb [LT15]'),
      useful_load: L(535, 'kg', ['LT16'], 'กลาง', false, '1,785 − 1,250'),
      training_mass: L({ kg: 1600, empty_kg: 1290, crew_kg: 170, fuel_kg: 140, fuel_l: 175 }, 'kg', ['LT16'], 'ต่ำ', true, 'ค่าประมาณ: empty_kg 1,290 kg = BEW_typical 1,250 kg (สเปก AOPA 2006 [LT16]) + อุปกรณ์ของโรงเรียนราว 40 kg; ครูและศิษย์ 2 × 85 kg; Jet A-1 175 l × 0.80 kg/l = 140 kg; รวม 1,600 kg (แถบความเร็ว ≤1,700 kg)'),
    },
    cg: { envelope: L([[1250, 2.35, 2.42], [1468, 2.35, 2.464], [1600, 2.371, 2.49], [1785, 2.40, 2.49]], 'kg, m DAT', ['LT1'], 'สูง', false, 'หน้า 2.35 m ถึง 1,468 kg → 2.40 m ที่ 1,785 kg; หลัง 2.42 m ที่ 1,250 kg → 2.49 m ที่ ≥1,600 kg [LT1 A.III.14]') },
    inertia: {
      Ixx: L(r(geom.inertia.tdi_mtow.Ixx * 1600 / geom.inertia.tdi_mtow.m), 'kg m2', ['LM15'], 'ต่ำ', true, 'ค่าประมาณ build-up (เครื่อง TAE 134 kg เบากว่า E4) สเกลตามมวล'),
      Iyy: L(r(geom.inertia.tdi_mtow.Iyy * 1600 / geom.inertia.tdi_mtow.m), 'kg m2', ['LM15'], 'ต่ำ', true, 'ค่าประมาณ build-up สเกลตามมวล'),
      Izz: L(r(geom.inertia.tdi_mtow.Izz * 1600 / geom.inertia.tdi_mtow.m), 'kg m2', ['LM15'], 'ต่ำ', true, 'ค่าประมาณ build-up สเกลตามมวล'),
      ref_mass: L(1600, 'kg', ['LM15'], 'ต่ำ', true, 'มวลฝึกโดยประมาณ (ว่าง ~1,280 + ลูกเรือ + เชื้อเพลิง)'),
    },
  },
  aero: {
    flaps: { detents: L(DET.map((d, i) => ({ ...d, VFE_kt: [null, 137, 111][i], CLmax: [geom.clmax.tdi_1785.UP.CLmax_1g, geom.clmax.tdi_1785.APP.CLmax_1g, geom.clmax.tdi_1785.LDG.CLmax_1g][i] })), '-', ['LT1', 'LT3', 'LT5'], 'ต่ำ', true, 'VFE 137/111 KIAS [LT3]; CLmax จากตาราง stall AFM (1,785 kg 64/61/57 KIAS) [LT5 p.5-8]; อื่น ๆ เหมือน NG') },
    static_long: { CLmax_target: L({ UP: geom.clmax.tdi_1785.UP.CLmax_1g, APP: geom.clmax.tdi_1785.APP.CLmax_1g, LDG: geom.clmax.tdi_1785.LDG.CLmax_1g }, '-', ['LT5'], 'กลาง', true, 'จาก VS ของ AFM (KIAS ≈ KCAS ใกล้ stall: ค่าประมาณ), nz 0.95') },
  },
  speeds: {
    VS0_kt: L(57, 'kt IAS', ['LT5'], 'สูง', false, '1,785 kg แฟลป LDG [LT5 p.5-8]; สเปก AOPA 56 [LT16]'),
    VS1_kt: L(64, 'kt IAS', ['LT5'], 'สูง', false, '1,785 kg UP [LT5]; AOPA 62 (1,700 kg) [LT16]'),
    VX_kt: L(79, 'kt IAS', ['LT5'], 'ต่ำ', false, 'AFM 4A.2 >1,700 kg (77 ≤1,700) การจับแถวตารางเป็นการอนุมาน [LT5 p.4A-3]; AOPA พิมพ์ VX 86 (น่าจะเป็น cruise climb) [LT16]'),
    VY_kt: L(79, 'kt IAS', ['LT5', 'LT16'], 'กลาง', false, 'แฟลป UP >1,700 kg (77 ≤1,700) [LT5]; AOPA VY 79 [LT16]'),
    climb_basis: L({ VX: { flap: 'UP', mass_kg: 1785 }, VY: { flap: 'UP', mass_kg: 1785 } }, '-, kg', ['LT5'], 'ต่ำ', false, 'โครงแบบและมวลของ speeds.VX_kt และ VY_kt (R2-08): ทั้งคู่แฟลป UP แถว >1,700 kg ถึง MTOM 1,785 kg ของ AFM 4A.2 [LT5] (การจับแถวตารางเป็นการอนุมาน); ที่มวลฝึก 1,600 kg ใช้แถว ≤1,700 kg = 77 KIAS ในหัวข้อ 08 และ 09 (แก้มวล)'),
    VR_kt: L(72, 'kt IAS', ['LT5', 'LT16'], 'กลาง', false, '>1,700 kg (70 ≤1,700) [LT5]; AOPA 72 [LT16]'),
    VAPP_kt: L(82, 'kt IAS', ['LT5'], 'ต่ำ', false, 'final approach ขั้นต่ำ 82 KIAS (42.2 m/s) เท่ากันทั้งแถบ ≤1,700 และ >1,700 kg จึงใช้ได้ที่มวลฝึก 1,600 kg [LT5 p.4A-3]; ข้อความที่สกัดจากตาราง 4A.2 แถวปน การจับแถวเป็นการอนุมาน (§06.12); บัตรเป็นเจ้าของค่านี้ (D1)'),
    VREF_kt: L(76, 'kt IAS', ['LT5'], 'ต่ำ', false, 'แถวความเร็วต่ำสุดแฟลป LDG ของตาราง 4A.2 ที่แถบ ≤1,700 kg (มวลฝึก 1,600 kg) 76 KIAS (39.1 m/s); แถบ >1,700 kg 78 KIAS [LT5 p.4A-3]; การจับแถวเป็นการอนุมาน; ≈ 1.4 VS0 ที่ 1,600 kg; VAPP 82 ≥ VREF 76 (D1)'),
    VA_kt: L({ '1542': 120, '1785': 126 }, 'kt IAS', ['LT3'], 'สูง', false, 'กับ MÄM 42-088 [LT3 p.2-4]'),
    VNO_kt: L(155, 'kt IAS', ['LT3'], 'สูง', false, ''), VNE_kt: L(194, 'kt IAS', ['LT3'], 'สูง', false, '192 KEAS [LT1]'),
    VLE_kt: L(194, 'kt IAS', ['LT3'], 'สูง', false, ''), VLO_kt: L({ extend: 194, retract: 156 }, 'kt IAS', ['LT3'], 'สูง', false, ''),
    VFE: L({ APP: 137, LDG: 111 }, 'kt IAS', ['LT3'], 'สูง', false, ''),
    VMCA_kt: L(68, 'kt IAS', ['LT3', 'LT1'], 'สูง', false, '68 KEAS (72 กับ OÄM 42-252 / TAE 125-02-114) [LT1]'),
    VYSE_kt: L(82, 'kt IAS', ['LT3', 'LT5'], 'สูง', false, 'blue radial [LT3 p.2-6]'),
    VXSE_kt: L(77, 'kt IAS', ['LT16'], 'ต่ำ', false, 'สเปก AOPA 2006 [LT16]; ไม่อยู่ใน AFM 1.5 [LT8]'),
    VSSE_kt: L(82, 'kt IAS', ['LT8'], 'ต่ำ', true, 'ค่าประมาณ = VYSE (AFM ไม่ให้ตัวเลข [LT8])'),
    crosswind_demonstrated_kt: L(20, 'kt', ['LT16'], 'กลาง', false, 'สเปก AOPA 2006 (จาก POH DA 42 1,785 kg) "max demonstrated crosswind 20 kt" [LT16]; NG/VI 25 kt'),
    ias_cas: L({ UP: [[62, 62], ...geom.ias_cas.tdi.UP.slice(1)], APP: [[59, 59], ...geom.ias_cas.tdi.APP], LDG: [[55, 55], ...geom.ias_cas.tdi.LDG] }, 'kt IAS → kt CAS', ['LT1', 'LT3'], 'ต่ำ', true, 'คู่ TCDS (KEAS) กับ AFM 7.01.05 (KIAS); จุดใกล้ stall สมมติ KCAS = KIAS (ค่าประมาณ)'),
    stall_table: L({ axes: { mass_kg: [1400, 1700, 1785], flap: ['UP', 'APP', 'LDG'], bank_deg: [0, 30, 45, 60] }, data: [[[56, 60, 68, 83], [53, 58, 65, 78], [49, 53, 61, 75]], [[62, 67, 76, 92], [59, 64, 72, 87], [55, 60, 68, 84]], [[64, 69, 78, 95], [61, 66, 74, 90], [57, 62, 70, 86]]] }, 'kt IAS', ['LT5'], 'กลาง', false, 'AFM 5.3.4 idle [LT5 p.5-8] (ข้อความสกัดสับสน การจับล้อขึ้น/ลงเป็นการอนุมาน)'),
  },
  performance: {
    ROC_SL_fpm: L(1060, 'fpm', ['LT16'], 'กลาง', false, 'สเปก AOPA 2006 (POH 3,935 lb) [LT16]'),
    oei: L({ ROC_SL_fpm: 160, VYSE_kt_IAS: 82, critical_engine: 'left', service_ceiling_ft: 10000 }, 'fpm, kt, ft', ['LT16', 'LT5'], 'กลาง', false, '[LT16]; เงื่อนไข AFM p.5-23 [LT5]'),
    cruise_table: L([{ h_ft: 10000, power_pct: 80, ktas: 156, ff_lph_each: 23.8 }, { h_ft: 10000, power_pct: 60, ktas: 138, ff_lph_each: 16.7 }, { h_ft: 10000, power_pct: 50, ktas: 127, ff_lph_each: 13.6 }], 'ft, %, kt TAS, l/h', ['LT16'], 'กลาง', false, 'AOPA 2006'),
    takeoff: L({ ground_roll_m: 427, over50ft_m: 691 }, 'm', ['LT16'], 'กลาง', false, '1,401 / 2,267 ft SL std MTOW [LT16]'),
    landing: L({ ground_roll_m: 397, over50ft_m: 710 }, 'm', ['LT16'], 'กลาง', false, '1,302 / 2,329 ft [LT16]'),
    glide: L({ speed_kt: 82, ratio: 13.0 }, 'kt CAS, -', ['LM12'], 'ต่ำ', true, 'ค่าประมาณจาก polar NG สเกลมวล 1,785 kg'),
  },
  propulsion: {
    layout: L([{ id: 1, side: 'left', pos: [FRDx(xProp), -yE, zT], axis: [1, 0, 0], type: 'piston', model: 'TAE 125 + MTV-6-A-C-F/CF187-129', prop_sense: 1 }, { id: 2, side: 'right', pos: [FRDx(xProp), yE, zT], axis: [1, 0, 0], type: 'piston', model: 'TAE 125 + MTV-6-A-C-F/CF187-129', prop_sense: 1 }], 'm FRD', ['LT1'], 'กลาง', true, 'CW ทั้งคู่; เครื่องซ้าย critical [LT5]'),
  },
  piston: {
    identity: L({ model: 'Technify (Thielert) TAE 125-01 / -02-99', kind: 'turbo_diesel', displacement_L: 1.689, cylinders: 4, tcds: 'EASA TCDS E.055' }, '-', ['LT13', 'LT1'], 'สูง', false, '-01: 1,689 cm³; -02-99: 1,991 cm³; เกียร์ 1:1.689; มวลแห้ง 134 kg [LT13]', 'engine'),
    ratings: L({ P_rated: 99000, rpm_rated: 2300, P_mcp: 99000, rpm_mcp: 2300, rpm_redline: 2300, takeoff_time_limit_s: null }, 'W, rpm', ['LT3', 'LT13', 'LT1'], 'สูง', false, '99 kW (135 DIN-hp) ที่ 2,300 rpm ทั้ง take-off และต่อเนื่อง [LT3]', 'engine'),
    altitude: L({ model: 'turbo_flat', critical_alt_m: null }, '-', ['LT13'], 'ต่ำ', true, 'ค่าประมาณ: turbo + FADEC; ตารางกำลังตามความสูงอยู่ใน AFM บทที่ 5', 'engine'),
  },
  propeller: {
    identity: { model: L('mt-Propeller MTV-6-A-C-F/CF187-129', '-', ['LT1'], 'สูง', false, 'low pitch 12°, feather 81°, start lock 15° [LT1 A.III.7]', 'propeller') },
    engineInterface: { maxShaftPower: L(99, 'kW', ['LT3'], 'สูง', false, '', 'propeller'), gearRatio: L(1.689, '-', ['LT13'], 'สูง', false, '', 'propeller') },
    checks: { staticThrustISA: L(r(pg.tdi_99kW_187[0].T_N / 1000, 3), 'kN', ['LM0', 'LM24'], 'ต่ำ', true, 'BEM ต่อเครื่อง 99 kW', 'propeller') },
  },
  controls: { surfaces: { trim_tab: L({ elevator: { nose_up: 58, nose_down: 25 }, rudder: { right: 30, left: 29 } }, 'deg', ['LT1'], 'สูง', false, 'DA 42 มาตรฐาน; rudder tab RH 45 / LH 41 กับ OÄM 42-252 [LT1 A.III.16]') } },
  validation: { takeoff_test: L({ flap: 'UP', VR_kt: 72, theta_deg: 9 }, 'kt IAS, deg', ['LT5', 'LT16'], 'ต่ำ', true, 'VR 72 KIAS (>1,700 kg) [LT5 p.4A-3, LT16]; มุมเงย 9° ค่าประมาณเดียวกับ NG'),
    stall_test: L({ UP: 80, APP: 76, LDG: 72 }, 'kt', ['LM1'], 'ต่ำ', true, 'ความเร็วเริ่มการทดสอบ ~1.25 VS ของ TDI') },
};
{ const lg = legacyOf(fit.da42_tae125, 'da42_tae125'); if (lg) { t.aero.legacy = lg.aero; t.propulsion.legacy = lg.propulsion; } }
t.speeds.stall_altitude_loss_ft = stallLossLeaf(64, [[62, 62], ...geom.ias_cas.tdi.UP.slice(1)], 1785, 1600, 'DA 42 (TAE 125)');

// ───────────────────────── da42_vi (DA 42 NG + MÄM 42-600) ─────────────────────────
const vi = {
  _inherits: { v: 'da42ng', u: '-', scope: 'aircraft', src: [], conf: 'สูง', est: false, note: 'DA42-VI = ชื่อการค้าของ DA 42 NG ที่ทำ MÄM 42-600 [LT1 C.VI Note 13]; ทะเบียนไทยแยกไม่ได้ [LS17]; ใส่เฉพาะค่าที่ต่าง' },
  airframe: {
    identity: L({ manufacturer: 'Diamond Aircraft Industries GmbH (Austria)', model: 'DA 42 NG (DA42-VI)', variant: 'MÄM 42-600 (+ MÄM 42-659/678 MTOM 1,999 kg)', engine: '2 × Austro E4-C (AE300)', propeller: '2 × MTV-6-R-C-F/CF190-69 3 ใบ CW', seats: 4, category: 'normal', tc_ref: 'EASA.A.005 Section C; AFM Doc 7.01.16' }, '-', ['LT1', 'LT6'], 'สูง', false, 'ฝาครอบ/nacelle และ rudder ใหม่ [LT6 p.13]'),
    weights: { MTOW: L(1999, 'kg', ['LT1', 'LT6'], 'สูง', false, 'กับ MÄM 42-659 + 42-678 (ปกติของ VI) [LT6]'), MLW: L(1999, 'kg', ['LT1'], 'สูง', false, ''), MZFW: L(1835, 'kg', ['LT1'], 'สูง', false, ''), BEW_typical: L(1420, 'kg', ['LT6'], 'กลาง', false, 'ไม่มีอุปกรณ์เสริม'),
      training_mass: L({ kg: 1752, empty_kg: 1450, crew_kg: 170, fuel_kg: 132, fuel_l: 165 }, 'kg', ['LT6', 'LT10'], 'ต่ำ', true, 'ค่าประมาณ: มวลฝึกเดียวกับ da42ng เพื่อให้ VREF/VAPP อยู่แถบ ≤1,900 kg: empty_kg 1,450 kg = BEW_typical 1,420 kg (โบรชัวร์ VI [LT6]) + อุปกรณ์ของโรงเรียนราว 30 kg; ครูและศิษย์ 2 × 85 kg; Jet A-1 165 l × 0.80 kg/l = 132 kg') },
    cg: { envelope: L([[1510, 2.357, 2.460], [1700, 2.387, 2.480], [1900, 2.418, 2.480], [1999, 2.434, 2.480]], 'kg, m DAT', ['LT1'], 'สูง', false, 'หน้า 2.434 m ที่ 1,999 kg; กับ OÄM 42-199 + MÄM 42-600 หลังสุด 2.460 m ที่ ≥1,510 kg [LT1 C.III.14]') },
  },
  speeds: {
    VMCA_kt: L(71, 'kt IAS', ['LT9', 'LT1'], 'กลาง', false, 'TCDS 70 KEAS กับ MÄM 42-600 [LT1]; red radial 71 KIAS (สไลด์ VI) [LT9]; flashcard 71 UP / 68 APP [LT11]'),
    VY_kt: L(92, 'kt IAS', ['LT9'], 'ต่ำ', false, '>1,900 kg (90 ≤1,900) [LT9]'),
    VAPP_kt: L(84, 'kt IAS', ['LT9'], 'ต่ำ', false, 'approach แฟลป APP ขั้นต่ำ 84 KIAS (43.2 m/s) ที่มวลฝึก 1,752 kg (แถบ ≤1,900 kg) จากสไลด์ของเครื่อง DA42-VI [LT9]; แถบ >1,900 kg ถึง 1,999 kg 88 KIAS; บัตรเป็นเจ้าของค่านี้ (D1)'),
    VREF_kt: L(84, 'kt IAS', ['LT9'], 'ต่ำ', false, 'final approach แฟลป LDG ขั้นต่ำ 84 KIAS ที่มวลฝึก 1,752 kg (แถบ ≤1,900 kg) [LT9]; แถบ >1,900 kg 86 KIAS; VAPP = VREF (D1)'),
    VA_kt: L({ '1700': 112, '1800': 119, '1999': 122 }, 'kt IAS', ['LT1', 'LT2'], 'กลาง', true, 'ค่าประมาณเฉพาะแถบ >1,800 kg: TCDS ให้ VA 125 KEAS สำหรับมวลเกิน 1,800 kg ซึ่งครอบคลุมถึง MTOM 1,999 kg (MÄM 42-659/678) [LT1 C.III.10]; แปลงเป็น 122 KIAS ด้วยคู่ของ AFM NG (vO 122 KIAS ที่ >1,800 kg [LT2 p.2-4]) เพราะ AFM ของ DA42-VI (7.01.16) เปิดไม่ได้; ≤1,700 kg 112 และ ≤1,800 kg 119 KIAS เหมือน NG'),
    VS0_kt: L(64, 'kt IAS', ['LT11', 'LT6'], 'กลาง', false, '1,999 kg; 62 KCAS ตามโบรชัวร์ [LT6]'),
    VS1_kt: L(72, 'kt IAS', ['LT11'], 'ต่ำ', false, '1,999 kg (flashcard)'),
    crosswind_demonstrated_kt: L(25, 'kt', ['LT6'], 'กลาง', false, '25 kt / 46 km/h [LT6 p.19]'),
  },
  performance: {
    ROC_SL_fpm: L(1114, 'fpm', ['LT6'], 'กลาง', false, 'MTOM 1,999 kg ISA [LT6 p.19]'),
    oei: L({ ROC_SL_fpm: null, service_ceiling_ft: 16000, absolute_ceiling_ft: 17500, critical_engine: 'left' }, 'ft', ['LT6'], 'กลาง', false, 'เพดาน OEI 16,000 ft (50 fpm) และ absolute 17,500 ft ใต้หัวตาราง "MTOM, ISA" [LT6 p.19] ซึ่งไม่ระบุมวลของค่านี้ และไม่มี ROC OEI ที่ SL; การตรวจความสอดคล้องกับ 210 fpm ของ NG อยู่ที่ da42ng performance.oei_ceiling_model และ §06.4.1'),
    takeoff: L({ ground_roll_m: 375, over50ft_m: 649 }, 'm', ['LT6'], 'กลาง', false, 'short-field MSL MTOM ISA [LT6]'),
    landing: L({ ground_roll_m: 387, over50ft_m: 647 }, 'm', ['LT6'], 'กลาง', false, '[LT6]; หน้าเว็บอีกแห่งให้ ground roll 340 m [LT7]'),
    cruise_table: L([{ h_ft: 16000, power_pct: 92, ktas: 190 }, { h_ft: 16000, power_pct: 92, ktas: 197, tow_kg: 1760 }, { h_ft: 16000, power_pct: 75, ktas: 175, ff_lph_total: 49.2 }, { h_ft: 18000, power_pct: 50, ktas: 141, ff_lph_total: 33.3 }], 'ft, %, kt TAS, l/h', ['LT6'], 'กลาง', false, 'โบรชัวร์ [LT6 p.19 และหน้าพิสัย]: MCP 16,000 ft 190 KTAS (หัวตาราง MTOM ISA) และ 197 KTAS ที่ TOW 1,760 kg; 75 % 175 KTAS 49.2 l/h รวม; 50 % FL180 141 KTAS 33.3 l/h รวม'),
  },
  piston: { identity: L({ model: 'Austro Engine E4-C (AE300)', kind: 'turbo_diesel', displacement_L: 1.991, cylinders: 4, tcds: 'EASA TCDS E.200' }, '-', ['LT1', 'LT12'], 'สูง', false, 'MCP 2,300 rpm กับ MÄM 42-600 [LT1 C.III.5]', 'engine'),
    ratings: L({ P_rated: 123500, rpm_rated: 2300, P_mcp: 114000, rpm_mcp: 2300, rpm_redline: 2300 }, 'W, rpm', ['LT1'], 'สูง', false, 'MCP 92 % ที่ 2,300 rpm', 'engine') },
  propeller: {
    identity: { model: L('mt-Propeller MTV-6-R-C-F/CF190-69', '-', ['LT1'], 'สูง', false, 'low pitch 13°, feather 80°, start lock 15° [LT1]', 'propeller'), diameter: L(1.90, 'm', ['LT1'], 'สูง', false, '1,900 mm', 'propeller') },
    governor: { betaFlightIdle: L(13, 'deg @0.75R', ['LT1'], 'สูง', false, '', 'propeller'), betaFeather: L(80, 'deg @0.75R', ['LT1'], 'สูง', false, '', 'propeller') },
    checks: { staticThrustISA: L(r(pg.vi_e4_190[0].T_N / 1000, 3), 'kN', ['LM0', 'LM24'], 'ต่ำ', true, 'BEM ต่อเครื่อง', 'propeller') },
  },
  controls: { surfaces: { trim_tab: L({ elevator: { nose_up: 28, nose_down: 25 }, rudder: { right: 43, left: 39 } }, 'deg', ['LT1'], 'สูง', false, 'MÄM 42-600 (48/36 กับ MÄM 42-885) [LT1]') } },
};
{ const lg = legacyOf(fit.da42_vi, 'da42_vi'); if (lg) { vi.aero = { legacy: lg.aero }; vi.propulsion = { legacy: lg.propulsion }; } }

// ── reviewer fix 2026-11-18: every est:true leaf must say how it was estimated (schema-ext-r2 §1 / owner rule 3) ──
const R1M = 'ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42';
const TYRE = sz => `ค่าประมาณโดยวิจารณญาณ: ลดจากค่ายางของเครื่องฝึกรอบที่ 1 [LT20] (ยางใหญ่กว่า มวล 2,250 kg) ตามขนาดยาง ${sz} และแรงสถิต; ไม่พบ data book ของยาง`;
const EST_NOTE = {
  'airframe.tail.tailcone_depth': 'ค่าประมาณจากสัดส่วนภาพด้านข้างของเครื่อง (ลำตัวสูง ~1.30 m เรียวลงเหลือ ~0.40 m ที่โคนหาง) ไม่มีแบบเผยแพร่',
  'airframe.tail.airfoil_h': 'ค่าประมาณ: ไม่พบใน AFM/TCDS (สตริงบอกสถานะ ไม่ใช้คำนวณ); โมเดลใช้ CLα หางจากสูตร Helmbold แทน',
  'airframe.tail.airfoil_v': 'ค่าประมาณ: ไม่พบใน AFM/TCDS (สตริงบอกสถานะ ไม่ใช้คำนวณ); โมเดลใช้ CLα ครีบจาก lm_derivs แทน',
  'airframe.geometry.fuselage_width': 'ค่าประมาณจากห้องโดยสาร 4 ที่นั่งสองแถวแบบเดียวกับ DA40 และสัดส่วนภาพด้านหน้า (ไม่มีแบบเผยแพร่)',
  'airframe.geometry.fuselage_height': 'ค่าประมาณจากสัดส่วนภาพด้านข้างเทียบความสูงเครื่อง 2.49 m [LT1] (ไม่มีแบบเผยแพร่)',
  'aero.strip_wing.taper': 'ค่าประมาณ: ปีกเรียวตรงเทียบเท่าที่ให้ S, b, MAC ตาม AFM [LT2] (lt_geom.mjs)',
  'aero.strip_wing.washout': 'ค่าประมาณ: washout ทั่วไปของปีก GA (ไม่เผยแพร่) เท่ากับ airframe.wing.twist_deg −2°',
  'aero.strip_wing.aileron_span_frac': 'ค่าประมาณ: ตำแหน่งที่ทำให้พื้นที่ aileron สองข้างบนปีกเรียวเทียบเท่า = 0.654 m² ใกล้ 0.66 m² ของ AFM [LT2] ด้วย chord ratio 0.25 (lt_geom.mjs)',
  'aero.stall_warning.alpha_warn_5kt': 'ค่าประมาณ: α ของซิมที่ VS + 5 kt คำนวณจาก CLmax ของซิมที่ MTOM (lt_run.mjs alphaInfo)',
  'controls.pitch.trim_rate_flaps_up': 'ค่าประมาณ: เท่ากับ trim_rate_flaps_down (อัตรา tab เทียบเท่าของล้อ trim มือเมื่อกดคีย์ค้างในซิม)',
  'controls.roll.c_a': 'ค่าประมาณ: chord ratio 0.25 × คอร์ดเฉลี่ย ~0.89 m ในช่วง 75–97 % ของครึ่งปีกเรียวเทียบเท่า (lt_geom.mjs)',
  'controls.roll.gearing': 'ค่าประมาณ: aileron เฉลี่ย 20° (0.349 rad) ต่อการเลื่อนคัน ~0.10 m (รอบที่ 1 ใช้ ±90 mm [LT20])',
  'controls.yaw.c_r': 'ค่าประมาณ: พื้นที่ rudder 0.78 m² [LT2] ÷ ความสูง rudder ~1.7 m (ภาพด้านข้าง)',
  'controls.yaw.trim_rate': 'ค่าประมาณ: อัตราเทียบเท่าของล้อ trim rudder ให้ tab ถึง 45° ในราว 15 s เมื่อกดคีย์ค้างในซิม',
  'gear.geometry.cg_height_parked': 'ค่าประมาณจากภาพด้านข้างของเครื่องปีกต่ำ (ไม่มีแบบเผยแพร่); ใช้คำนวณมุม tip-back ≈ 17° ใน §06.8',
  'gear.strut_main.stroke': 'ค่าประมาณ: ราว 60 % ของระยะยุบล้อหลักของเครื่องฝึกรอบที่ 1 (0.25 m [LT20]) ตามมวลที่เบากว่า วัดที่ล้อ',
  'gear.strut_main.p_static': 'ค่าประมาณ: แรงดันสถิตทั่วไปของ oleo เครื่องเบา (รอบที่ 1 ใช้ 300 psi [LT20]); piston_area คิดจากแรงสถิต ÷ ค่านี้ จึงไม่เปลี่ยนแรงสถิต',
  'gear.strut_nose.stroke': 'ค่าประมาณ: ราว 60 % ของระยะยุบล้อหน้าของเครื่องฝึกรอบที่ 1 (0.20 m [LT20])',
  'gear.strut_nose.p_static': 'ค่าประมาณ: แรงดันสถิตทั่วไปของ oleo เครื่องเบา (รอบที่ 1 ใช้ 300 psi [LT20]); piston_area คิดจากแรงสถิต ÷ ค่านี้',
  'gear.tyre_main.rated_pressure': TYRE('15x6.0-6'), 'gear.tyre_main.k_vertical': TYRE('15x6.0-6'), 'gear.tyre_main.c_vertical': TYRE('15x6.0-6'),
  'gear.tyre_main.relaxation_length': TYRE('15x6.0-6'), 'gear.tyre_main.k_longitudinal': TYRE('15x6.0-6'),
  'gear.tyre_main.rolling_radius': 'ค่าประมาณ: รัศมีนอก 15 in / 2 = 0.19 m ลบการยุบของยางราว 1 cm',
  'gear.tyre_main.wheel_inertia': 'ค่าประมาณ: ยาง + ล้อ + จานเบรก ~6 kg ที่รัศมีไจเรชัน ~0.14 m (รอบที่ 1 ใช้ 0.33 kg m² สำหรับล้อ ~13 kg [LT20])',
  'gear.tyre_nose.rated_load': 'ค่าประมาณ: 1.5 × แรงสถิตล้อหน้าที่ MTOM CG หน้า (ยาง 10 PR มีภาระพิกัดสูงกว่าที่ใช้)',
  'gear.tyre_nose.rated_pressure': TYRE('5.00-5'), 'gear.tyre_nose.operating_pressure': TYRE('5.00-5'), 'gear.tyre_nose.k_vertical': TYRE('5.00-5'), 'gear.tyre_nose.c_vertical': TYRE('5.00-5'),
  'gear.tyre_nose.outside_diameter': 'ค่าประมาณ: เส้นผ่านศูนย์กลางนอกของยางขนาด 5.00-5 ราว 14 in (0.355 m)',
  'gear.brakes.heat_sink_mass': 'ค่าประมาณ: จานเบรกเหล็กต่อล้อ ~2 kg ของล้อ 6 in (รอบที่ 1 ใช้ 6 kg สำหรับเครื่อง 2,250 kg [LT20])',
  'gear.brakes.heat_sink_cool_tau': 'ค่าประมาณ: จานเล็กกว่าของรอบที่ 1 (900 s [LT20]) จึงเย็นเร็วกว่า',
  'propeller.identity.hubPosition': 'ค่าประมาณ: ซ้าย, ขวา = propulsion.layout (ดุมที่ x 0.95 m DAT, y ±1.70 m, ต่ำกว่า CG 0.15 m จากภาพสามด้าน)',
  'interference.slipstream.hubPos': 'ค่าประมาณ: ซ้าย, ขวา = propulsion.layout (จากภาพสามด้าน)',
  'validation.trim_targets.approach': 'ค่าประมาณ: สภาพ approach ที่ VREF 84 KIAS [LT9] แฟลป LDG ล้อลง เส้นร่อน 3°',
  'propeller.governor.featherRate': 'ค่าประมาณ (ไม่พบเวลา feather ในเอกสารที่เปิดได้): 8 °/s ให้ใบพัดไปจาก low pitch 12° ถึง feather 81° ในราว 9 s',
  'propeller.section.stallDelayFactor': 'ค่าประมาณ: ตัวคูณ stall delay แบบ Snel ค่าเริ่มต้นของ lm_prop',
  'interference.downwash.eta_t': 'ค่าประมาณ: หาง T อยู่นอก wake และ slipstream ที่ α ปกติ จึงใช้ 0.95 (ช่วงทั่วไป 0.9–1.0)',
  'interference.slipstream.hubRadius': 'ค่าประมาณรัศมี spinner จากภาพ (~0.17 m ≈ 0.18 R ตาม hubRadiusRatio)',
};
function explainEst(o, p = []) {
  if (o && typeof o === 'object' && !Array.isArray(o) && 'v' in o && 'scope' in o) {
    if (o.est) {
      const key = p.join('.'), n = String(o.note || '').trim();
      if (EST_NOTE[key]) o.note = EST_NOTE[key];
      else if (/^(ค่าของ)?รอบที่ 1/.test(n)) o.note = R1M + n.replace(/^(ค่าของ)?รอบที่ 1/, '');
      else if (/^สเกล(ค่า)?(รอบที่ 1 )?ตามแรงสถิต$/.test(n)) o.note = 'ค่าประมาณ: สเกลค่ารอบที่ 1 [LT20] ด้วยอัตราส่วนแรงสถิตต่อล้อของ DA42 ต่อของเครื่องฝึกรอบที่ 1';
      else if (!n.includes('ค่าประมาณ')) o.note = 'ค่าประมาณ: ' + n;
    }
    return;
  }
  if (o && typeof o === 'object' && !Array.isArray(o)) for (const k of Object.keys(o)) explainEst(o[k], [...p, k]);
}
for (const c of [ng, t, vi]) explainEst(c);
// D4 (19 Nov 2026): scope by category through lm_lib.expectedScope (gear → gear, propeller → propeller, interference.slipstream.* → round 1)
for (const c of [ng, t, vi]) normaliseScopes(c);
// gap 16 (19 Nov 2026): performance.tests from scripts/out/lt_tests.json (same rows as the table in §06.11)
if (LTT?.tests) ng.performance.tests = L(LTT.tests.map(x => ({ case: x.id, conditions: x.cond, quantity: x.qty, expected: x.exp, tolerance: x.tol, origin: x.src, current_model: x.cur, pass: x.pass, note: x.note || undefined })),
  'ตามช่อง quantity ของแต่ละแถว', ['LT1', 'LT2', 'LT5', 'LT6', 'LT10', 'LT16', 'LM0'], 'กลาง', false,
  `จุดเป้าสำหรับทดสอบอัตโนมัติ ${LTT.n} กรณี (ตาราง §06.11 สร้างจาก scripts/lt_tests.mjs) ผ่าน ${LTT.pass} กรณีกับซิมปัจจุบัน${LTT.unsupported ? `, ไม่รองรับในซิมวันนี้ ${LTT.unsupported} กรณี` : ''}; แถวที่ expected มาจากการคำนวณระบุไว้ในช่อง origin`);

// ───────────────────────── emit ─────────────────────────
const strip = o => { if (Array.isArray(o)) return o.map(strip); if (o && typeof o === 'object') { const x = {}; for (const [k, v] of Object.entries(o)) if (v !== null && v !== undefined) x[k] = strip(v); return x; } return o; };
const block = (id, part) => '```json\n' + JSON.stringify({ [id]: strip(part) }, null, 1) + '\n```\n';
const cats = ['airframe', 'aero', 'speeds', 'performance', 'propulsion', 'piston', 'propeller', 'controls', 'gear', 'interference', 'wind', 'input', 'validation'];
let md = `<!-- สร้างโดย scripts/lt_json.mjs จาก out/lt_geom.json, out/lt_polar.json, out/lt_fit_*.json (อย่าแก้ด้วยมือ ให้แก้สคริปต์แล้วรันใหม่) -->\n\n#### da42ng\n\n`;
for (const c of cats) if (ng[c]) md += block('da42ng', { [c]: ng[c] }) + '\n';
md += block('da42ng', { _na: ng._na }) + '\n#### da42_tae125\n\n' + block('da42_tae125', t) + '\n#### da42_vi\n\n' + block('da42_vi', vi);
fs.writeFileSync(new URL('lt_json_blocks.md', OUT), md);
if (!process.argv.includes('--dry')) {
  const txt = fs.readFileSync(TOPIC, 'utf8'), a = txt.indexOf('<!-- LT-JSON-START -->'), b = txt.indexOf('<!-- LT-JSON-END -->');
  if (a < 0 || b < 0) { console.error('markers not found'); process.exit(1); }
  fs.writeFileSync(TOPIC, txt.slice(0, a) + '<!-- LT-JSON-START -->\n' + md + txt.slice(b));
}
console.log(`wrote scripts/out/lt_json_blocks.md (${md.length} chars); derivative flags: ${flags.join(' | ') || 'none'}`);
console.log(JSON.stringify({ static: Object.fromEntries(Object.entries(dC.static).map(([k, v]) => [k, r(v, 4)])), cruise: Object.fromEntries(names.map(n => [n, r(dC.body[n], 3)])), approach: Object.fromEntries(names.map(n => [n, r(dA.body[n], 3)])) }));
