#!/usr/bin/env node
// lf_json.mjs — build the c152 data card (schema-ext-r2 leaves) from lf_calc + lf_fit results and write the JSON blocks
// into ../11-c152.md between <!-- LF_JSON_BEGIN --> and <!-- LF_JSON_END --> (only that part of the file is replaced).
// Order to rebuild: lf_calc.mjs → lf_json.mjs → lf_fit.mjs → lm_card.mjs c152 --json > out/lf_card.json → lf_json.mjs → lm_merge --type c152 → lf_tests.mjs
// Run from the repo root: node <this folder>/lf_json.mjs [--print]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { F, compute, derivs, iasToCas, LB, IN, FT, KT, HP } from './lf_calc.mjs';
import { fitPolar, pointFromCruise } from './lm_polar.mjs';
import { isMainModule } from './lm_lib.mjs';
import { normaliseScopes, testsLeaf, stickForceBand } from './lc_cardfix.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MD = path.join(HERE, '..', '11-c152.md');
const rd = f => { try { return JSON.parse(fs.readFileSync(path.join(HERE, 'out', f), 'utf8')); } catch { return null; } };
const r = (x, n = 4) => (typeof x === 'number' ? +x.toPrecision(n) : x);
const L = (v, u, src, conf, est, note = '', scope = 'aircraft') => ({ v, u, scope, src, conf, est, note });
const E = (v, u, src, note, conf = 'ต่ำ', scope = 'aircraft') => L(v, u, src, conf, true, 'ค่าประมาณ: ' + note, scope);

export function buildCard() {
  const C = compute(), g = C.geom, w = C.weights, leg = rd('lf_legacy.json'), card0 = rd('lf_card.json');
  const m = w.MTOW, cgref = C.cg.ref_m;
  // FRD positions relative to the reference CG (34.0 in DAT): x_FRD = (x_ref − x_DAT)
  const xFRD = st_in => r((C.cg.ref_in - st_in) * IN, 4);
  const card = { c152: {} }; const c = card.c152;

  // ───────── airframe
  c.airframe = {
    identity: L({ manufacturer: 'Cessna Aircraft Company (Reims Aviation สร้าง F152 ในฝรั่งเศส)', model: '152', variant: '152 / 152 II (+ A152 Aerobat ไม่รวม); บัตรนี้รวม C150H เป็นหัวข้อย่อย §11.10', engine: 'Lycoming O-235-L2C 110 hp @ 2,550 rpm (S/N 15279406–15285594; รุ่นหลัง O-235-N2C 108 hp)', propeller: 'McCauley 1A103/TCM6958 fixed pitch 2 ใบ 67.5–69 in', seats: 2, category: 'utility (spin อนุญาต แฟลปขึ้น)', tc_ref: 'FAA TCDS 3A19 Section IX (Model 152, approved 16 Mar 1977)' }, '-', ['LF2', 'LF1', 'LF4', 'LS1'], 'สูง', false, 'ทะเบียนไทย 9 ก.ค. 2026 (LS1): C152 2 ลำที่ AAT (S/N 15282285, 15283733 = รุ่นปี 1979, 1980 เครื่อง L2C ตามช่วง S/N ของ TCDS) และ 1 ลำที่ Premium Airlines (S/N 15285690 = รุ่นปี 1983 เครื่อง O-235-N2C 108 hp); C150H 1 ลำที่ Thai Flying Club (S/N 15068931); ผลิต 1977–1985 รวม 7,584 ลำ (LF4)'),
    weights: {
      MTOW: L(r(m, 5), 'kg', ['LF1', 'LF2'], 'สูง', false, '1,670 lb (POH p1-5, TCDS)'),
      MLW: L(r(w.MLW, 5), 'kg', ['LF1'], 'สูง', false, '1,670 lb เท่ากับ MTOW (p1-5)'),
      MRW: L(r(w.MRW, 5), 'kg', ['LF1', 'LF2'], 'สูง', false, 'ramp 1,675 lb (S/N 15282032 ขึ้นไป)'),
      BEW_typical: L(r(w.BEW, 4), 'kg', ['LF1'], 'กลาง', false, 'standard empty weight 1,109 lb (152) / 1,142 lb (152 II) จาก Information Manual p1-5 ไม่ใช่ของลำใดลำหนึ่ง'),
      max_fuel_usable: L(r(w.fuel_std_usable_kg, 4), 'kg', ['LF1', 'LM4'], 'สูง', false, `ถังมาตรฐาน 24.5 US gal (${r(w.fuel_std_usable_L, 3)} L) × 6 lb/gal; ถังพิสัยไกล 37.5 gal = ${r(w.fuel_lr_usable_kg, 4)} kg`),
      useful_load: L(r(F.useful_lb * LB, 4), 'kg', ['LF1'], 'สูง', false, '566 lb (152) / 533 lb (152 II)'),
      // D3 (19 Nov 2026): object {kg, empty_kg, crew_kg, fuel_kg, fuel_l}; empty_kg = BEW_typical
      training_mass: E({ kg: r(w.training_mass, 5), empty_kg: r(w.BEW, 4), crew_kg: 160, fuel_kg: r(w.trainFuelGal * 6 * LB, 4), fuel_l: r(w.trainFuelGal * 3.785411784, 3) }, 'kg (fuel_l: L)', ['LF1', 'LF0'],
        `empty_kg = BEW_typical 503.0 kg (IM p1-5) + ครู 85 kg + ศิษย์ 75 kg + เชื้อเพลิง ${w.trainFuelGal} US gal (75.7 L, 54.4 kg ที่ 6 lb/gal) = ${r(w.training_mass, 5)} kg (${r(w.training_mass_lb, 4)} lb); สองคน + ถังมาตรฐานเต็มได้ ${r(w.full_std_fuel_two_adults_kg, 4)} kg ยังไม่เกิน MTOW; การเทียบ POH ใช้ --mass 757.5`),
    },
    cg: {
      datum: L('front face of firewall (STA 0.0)', '-', ['LF2', 'LF1'], 'สูง', false, 'ระยะ m DAT บวกไปทางท้าย'),
      LEMAC: E(r(g.LEMAC_m, 4), 'm DAT', ['LF2', 'LF0'], `${r(g.LEMAC_in, 3)} in: TCDS 3A19 และ POH ไม่ให้ MAC/LEMAC; ถังน้ำมัน C172S อยู่ +48.0 in โดย LEMAC +25.9 in (ถังอยู่หลัง LEMAC 22.1 in) จึงตั้ง LEMAC ของ C152 = ถัง +42.0 − 22.1 in`),
      MAC: E(r(g.MAC, 4), 'm', ['LF0'], `${r(g.MAC_in, 3)} in จากปีกเรียวเทียบ (taper 0.70) ที่มี S 159.5 ft² และ b 10.16 m`),
      envelope: L(C.cg.envelope.map(([a, b2, c2]) => [r(a, 5), r(b2, 4), r(c2, 4)]), 'kg, m DAT', ['LF1', 'LF2'], 'สูง', false, `ขอบ CG จาก POH/TCDS ไม่ใช่ค่าประมาณ: หน้า 31.0 in ที่ ≤ 1,350 lb เชิงเส้นถึง 32.65 in ที่ 1,670 lb; หลัง 36.5 in ทุกน้ำหนัก; ข้อมูลประกอบเป็น %MAC (คำนวณจาก LEMAC/MAC ข้างบนซึ่งติด est: true) หน้า ${C.cg.envelope_pct[0][1]}–${C.cg.envelope_pct[1][1]} % หลัง ${C.cg.envelope_pct[0][2]} %`),
      ref: E({ m_DAT: r(cgref, 4), in_DAT: C.cg.ref_in, pct_mac: r(C.cg.ref_pct, 3) }, 'm DAT, %MAC', ['LF0', 'LF1'], 'CG อ้างอิงของ FRD และ inertia เลือกเอง 34.0 in (กลางช่วงที่ MTOW 32.65–36.5 in)', 'กลาง'),
    },
    inertia: {
      Ixx: E(r(C.inertia.tm80163.Ixx, 4), 'kg m2', ['LM5', 'LF0'], 'รัศมีไจเรชันของเครื่องคลาส C172 ที่วัดในการบินทดสอบ NASA TM-80163 (Rx 0.235) × MTOW, b 10.16 m (วิธีเดียวกับบัตร 04); ค่าคลาส single_prop ให้ ' + Math.round(C.inertia.class_single_prop.Ixx)),
      Iyy: E(r(C.inertia.tm80163.Iyy, 4), 'kg m2', ['LM5', 'LF0'], 'Ry 0.324 × MTOW, L 7.235 m; ค่าคลาสให้ ' + Math.round(C.inertia.class_single_prop.Iyy)),
      Izz: E(r(C.inertia.tm80163.Izz, 4), 'kg m2', ['LM5', 'LF0'], 'Rz 0.364; ค่าคลาสให้ ' + Math.round(C.inertia.class_single_prop.Izz)),
      Ixz: E(r(C.inertia.Ixz, 3), 'kg m2', ['LM5', 'LF0'], 'สัดส่วน Ixz/Ixx = 123/1,395 ของ TM-80163'),
      ref_mass: L(r(m, 5), 'kg', ['LF0'], 'กลาง', false, 'inertia สเกลตามมวลด้วยรัศมีคงที่ (I ∝ m)'),
      radii: E(C.inertia.radii_tm80163, '-', ['LM5', 'LM0'], 'Roskam Rx/Ry/Rz จาก TM-80163; ค่าคลาส single_prop 0.257/0.357/0.404 ของหัวข้อ 01 เป็นทางเลือก'),
      method: E('radii_from_flight_test_class', '-', ['LM0'], 'ไม่มี inertia ที่วัดของ C152 เผยแพร่; ความไม่แน่นอน ±30 % (หัวข้อ 01 §01.4)', 'กลาง'),
    },
    wing: {
      S: L(r(g.S, 5), 'm2', ['LF1'], 'สูง', false, '159.5 ft² (POH Fig 1-1); Wikipedia ปัดเป็น 160 ft²; wing loading 10.5 lb/ft² (p1-5)'),
      b: L(r(g.b, 5), 'm', ['LF3', 'LF4'], 'กลาง', false, '400 in = 33 ft 4 in (service manual ผ่านสำเนาบล็อก และ Wikipedia); POH 1980 ฉบับ OCR อ่านค่า standard tip ไม่ชัด'),
      MAC: E(r(g.MAC, 4), 'm', ['LF0'], 'ดู airframe.cg.MAC'),
      AR: L(r(g.AR, 4), '-', ['LF0'], 'สูง', false, 'b²/S'),
      taper: E(0.7, '-', ['LF0', 'LM0'], 'ปีกคอร์ดคงที่ช่วงใน + เรียวช่วงนอก เทียบเป็นปีกเรียวเดียว (เหมือนบัตร 04)'),
      sweep_c4_deg: E(0, 'deg', ['LF0'], 'ปีกตรงไม่มีมุมกวาด ตามรูปสามด้านของ POH (LF1 Fig 1-1)'),
      dihedral_deg: E(1.73, 'deg', ['LM0'], '1°44′ ค่าเดียวกับบัตร 04 (ปีกตระกูลเดียวกัน ยังไม่พบเอกสารปฐมภูมิ)'),
      incidence_deg: E(1.5, 'deg', ['LF0'], 'ยังไม่พบเอกสารปฐมภูมิ (ค่าเดียวกับบัตร 04)'),
      twist_deg: E(-3, 'deg', ['LF0'], 'washout 3° (ค่าเดียวกับบัตร 04)'),
      airfoil: L('NACA 2412', '-', ['LF11'], 'ต่ำ', false, 'Wikipedia "Cessna 150" ระบุ NACA 2412 โดยไม่อ้างแหล่ง; Wikipedia "Cessna 152" (LF4) ไม่ระบุแพนอากาศ; รายการ Lednicer เปิดอ่านแถว Cessna ไม่ได้ (ตรวจทาน 2026-11-19)'),
      position: L('high', '-', ['LF1'], 'สูง', false, 'ปีกสูงมีเสาค้ำ'),
      x_c4_root: E(r((g.LEMAC_in + 0.25 * g.MAC_in + 30) * IN, 3), 'm', ['LF0'], 'ระยะจากปลาย spinner (~30 in หน้า datum) ถึง c/4 MAC'),
    },
    tail: {
      S_h: E(r(g.tail.S_h, 3), 'm2', ['LF3', 'LM5', 'LF0'], 'ช่วงหาง 120 in (service manual) × คอร์ดเฉลี่ย 0.95 m ของหางคลาส C172 (TM-80163: 3.35 m² บน 3.45 m)'),
      b_h: L(r(g.tail.b_h, 4), 'm', ['LF3'], 'กลาง', false, 'tail span 120.00 in (สำเนาบล็อกของ service manual)'),
      l_h: E(r(g.tail.l_h, 3), 'm', ['LM5', 'LF0'], 'แขนหาง 4.36 m ของคลาส C172 (TM-80163) × ความยาว 7.235/8.205'),
      S_v: E(r(g.tail.S_v, 3), 'm2', ['LM5', 'LF0'], 'ครีบ+rudder: คลาส C172 1.04–1.53 m² × 0.92 (สัดส่วนพื้นที่ปีก)'),
      b_v: E(g.tail.b_v, 'm', ['LF0'], 'ความสูงครีบเหนือแกนลำตัว (ความสูงเครื่อง 2.59 m − ฐาน ~1.0 m)'),
      l_v: E(r(g.tail.l_v, 3), 'm', ['LF0'], 'ใช้ค่าเดียวกับ l_h (ครีบและหางระดับอยู่ตำแหน่งเดียวกันตามยาว)'),
      z_v: E(0.85, 'm', ['LF0'], 'ศูนย์กลางแรงของครีบเหนือแกน x'),
      airfoil_h: E('symmetric (ไม่ทราบรุ่น)', '-', ['LF0'], 'ไม่มีข้อมูล'),
      airfoil_v: E('symmetric (ไม่ทราบรุ่น)', '-', ['LF0'], 'ไม่มีข้อมูล'),
      incidence_h_deg: E(0, 'deg', ['LF0'], 'ไม่มีข้อมูล ผลรวมอยู่ใน Cm0'),
    },
    surfaces: {
      elevator: E({ area_m2: r(g.tail.S_h * 0.42 * 0.95, 3), chord_ratio: 0.42, span_fraction: 0.95 }, 'm2, -, -', ['LM0', 'LF0'], 'chord ratio 0.42 ตามหัวข้อ 01'),
      aileron: E({ area_m2: 0.70, chord_ratio: 0.25, span_fraction: [0.55, 0.97] }, 'm2 (ข้างละ), -, สัดส่วนครึ่งช่วงปีก', ['LM0', 'LF0'], 'ชนิดของ aileron (เช่น Frise) ยังไม่ได้ยืนยันจากแหล่ง; พื้นที่สเกลจากบัตร 04 (0.81 m²) ด้วยพื้นที่ปีก'),
      rudder: E({ area_m2: 0.52, chord_ratio: 0.42, span_fraction: 0.9 }, 'm2, -, -', ['LM0', 'LF0'], 'S_v × 0.42 × 0.9'),
      flap: L({ type: 'single-slotted', span_fraction: [0.12, 0.55], detents_deg: [0, 10, 20, 30] }, '-, สัดส่วนครึ่งช่วงปีก, deg', ['LF10', 'LF2', 'LF1'], 'กลาง', true, 'single-slot (LF10 p9), 0–30° (TCDS); ขั้น 0/10/20/30 ตาม POH; ช่วงตามปีกเป็นค่าประมาณ'),
      trim_tab: E({ chord_ratio: 0.25, location: 'elevator ขวา (ค่าประมาณ)' }, '-', ['LF2', 'LF10', 'LF0'], 'manual trim tab (LF10 p3); TCDS ให้แค่ระยะเคลื่อน'),
    },
    geometry: {
      length: L(r(F.length_in * IN, 4), 'm', ['LF3'], 'กลาง', false, '284.84 in ตาม service manual; Wikipedia ให้ 24 ft 1 in (7.34 m) ต่าง 1.4 % (ดู §11.13)'),
      span: L(r(g.b, 5), 'm', ['LF3', 'LF4'], 'กลาง', false, '33 ft 4 in'),
      height: L(r(g.height, 4), 'm', ['LF3', 'LF4'], 'กลาง', false, '102 in สูงสุด (ล้อหน้ายุบ มีไฟ beacon) = 8 ft 6 in'),
      wheelbase: L(r(g.wheelbase, 4), 'm', ['LF1'], 'สูง', false, '58 in (POH Fig 1-1)'),
      main_track: L(r(g.track, 4), 'm', ['LF3'], 'กลาง', false, '91.28 in (service manual ผ่านสำเนาบล็อก)'),
      prop_clearance: E(0.30, 'm', ['LF1', 'LF0'], 'POH Fig 1-1 ฉบับ OCR อ่านได้แค่ "12" (น่าจะ 12 in ≈ 0.30 m) ต้องยืนยัน'),
      eye_pos_FRD: E([-0.05, -0.24, -0.35], 'm FRD', ['LF2', 'LF0'], 'ที่นั่ง +39 in (TCDS) ตาอยู่ราว +36 in DAT ⇒ x = (34.0 − 36) in ≈ −0.05 m; y ที่นั่งซ้าย; z เหนือ CG 0.35 m'),
      eye_height_static: E(1.45, 'm', ['LF0'], 'CG สูงจากพื้น ~1.10 m + 0.35 m'),
      fuselage_width: E(0.98, 'm', ['LF0'], 'ห้องโดยสารสองที่นั่ง (ใช้ใน lm_derivs)'),
      fuselage_height: E(1.25, 'm', ['LF0'], 'ใช้ใน lm_derivs'),
    },
  };

  // ───────── validation (needed by lm_derivs / lm_card)
  c.validation = {
    classification: { hqClassCategory: L({ class: 'I', approachLanding: 'C', cruiseClimb: 'B', takeoff: 'C' }, '-', ['R1:V8'], 'สูง', false, 'MIL-F-8785C Class I (เครื่องเล็กเบา) ตามรอบที่ 1') },
    procedures: { v50MinFactor_singleEngine: L(1.2, '× VS1', ['LM3'], 'กลาง', false, `14 CFR 23.51(b)(2) ฉบับ 2011 p. 201 (เครื่องยนต์เดียว: ความเร็วที่ 50 ft ไม่ต่ำกว่า 1.20 VS1; ผู้ตรวจทานแก้จาก 23.53 ที่อ้างเดิม) C152 รับรองตาม CAR 3 ที่ไม่มีข้อนี้ จึงใช้เป็นเกณฑ์ตรวจเท่านั้น; POH ใช้ 54 KIAS ที่ 50 ft แฟลป 10 = ${r(iasToCas('10', F.kias.V50_short), 3)} KCAS = ${r(iasToCas('10', F.kias.V50_short) / F.vs.fwd['10'][1], 3)} × VS (46 KCAS แฟลป 10)`) },
    trim_targets: {
      cruise: L({ ias_kt: 90, h_ft: 3000 }, 'kt CAS, ft', ['LF1', 'LF0'], 'กลาง', false, 'ใกล้ 2,200–2,300 rpm (59–66 %) ที่ 2,000 ft 91–96 KTAS ใน Fig 5-7; เลือก 90 KCAS เพราะซิมวันนี้กับ polar จาก glide บินระดับได้สูงสุดราว 94 KEAS ที่ 3,000 ft (ดู §11.9)'),
      approach: L({ ias_kt: r(iasToCas('30', F.kias.VAPP), 3), h_m: 300, gamma_deg: -3 }, 'kt CAS, m, deg', ['LF1', 'LF0'], 'กลาง', false, 'normal approach แฟลป 30 กลางช่วง 55–65 KIAS = 60 KIAS → 61 KCAS'),
    },
    stall_test: L({ '0': 65, '10': 62, '20': 60, '30': 58 }, 'kt EAS', ['LF0'], 'กลาง', false, 'ความเร็วเริ่ม ≈ 1.35 VS (KCAS) ของแต่ละขั้น'),
    takeoff_test: L({ flap: '10', VR_kt: 52, theta_deg: 12 }, '-, kt CAS, deg', ['LF1', 'LF0'], 'กลาง', true, 'ค่าประมาณ: แฟลป 10 ตาม Fig 5-4; ยกล้อหน้า 50 KIAS (p4-8) → 52 KCAS ที่แฟลป 10; θ 12° เลือกเอง (เหมือนบัตร 04; ผลการเลือกดู lf_iter)'),
  };

  // ───────── derivatives from lm_derivs on the card so far (+ C172 flight/estimate ratio)
  const D = derivs(card.c152);
  const body = k => ({ cruise: r(D.cruise.body[k], 4), approach: r(D.approach.body[k], 4) });
  const corr = k => { const q = D.ratio[k]?.ratio; return { cruise: r(D.cruise.body[k] * q, 4), approach: r(D.approach.body[k] * q, 4) }; };
  const pf = [...F.cruise_2000ft.map(p => pointFromCruise({ mass: w.MTOW, S: g.S, ktas: p.ktas, h_m: 2000 * FT, P_W: p.pct / 100 * F.engine.hp * HP, eta: 0.80 }))];
  const cruisePolar = fitPolar(pf.map(p => ({ CL: p.CL, CD: p.CD })));
  const derNote = k => `lm_derivs × อัตราส่วนบินจริง/ประมาณของคลาส C172 (TM-80163) ${r(D.ratio[k].ratio, 3)}; ค่าดิบ ${r(D.cruise.body[k], 3)}`;
  const deriv = {};
  const UNIT = k => (['CLq', 'CLadot', 'Cmq', 'Cmadot'].includes(k) ? '1/rad (c/2V)' : ['CYr', 'Clp', 'Clr', 'Cnp', 'Cnr'].includes(k) ? '1/rad (b/2V)' : '1/rad');
  for (const k of ['CLq', 'CLadot', 'CYdr', 'CYr', 'Clr', 'Cldr', 'Cmadot', 'Cnp', 'Cnda']) deriv[k] = E(body(k), UNIT(k), ['LM0', 'LF0'], 'lm_derivs จากรูปทรงในบัตร (cruise 90 KCAS / approach 61 KCAS)');
  for (const k of ['CLde', 'CYb', 'Clb', 'Clp', 'Clda', 'Cmq', 'Cmde', 'Cnb', 'Cnr', 'Cndr']) deriv[k] = E(corr(k), UNIT(k), ['LM0', 'LM5', 'LF0'], derNote(k));
  deriv.CD0 = E({ cruise: r(cruisePolar.CD0, 4), glide_windmill: r(C.polar.glide_faa.CD0, 4) }, '-', ['LF1', 'LF6', 'LF0'], `polar พาราโบลา CD = CD0 + K CL²: glide (ใบพัดหมุนฟรี) จาก 60 KIAS (60 KCAS) และ L/D 9.114; cruise จาก 5 จุดของ Fig 5-7 ที่ 2,000 ft (η 0.80 ค่าประมาณ)`);
  deriv.K = E({ cruise: r(cruisePolar.K, 4), glide_windmill: r(C.polar.glide_faa.K, 4) }, '-', ['LF1', 'LF6', 'LF0'], `glide e ${r(C.polar.glide_faa.e, 3)}; cruise e ${r(1 / (Math.PI * g.AR * cruisePolar.K), 3)} (fit กำลังสองน้อยที่สุด ช่วง CL แคบ จึงไม่แม่น)`);
  const order = ['CLq', 'CLadot', 'CLde', 'CD0', 'K', 'CYb', 'CYdr', 'CYr', 'Clb', 'Clp', 'Clr', 'Clda', 'Cldr', 'Cmq', 'Cmadot', 'Cmde', 'Cnb', 'Cnp', 'Cnr', 'Cnda', 'Cndr'];
  const st = D.cruise.static, CLa = st.CLalpha * D.ratio.CLalpha.ratio, Cma = -CLa * (st.h_n - C.cg.ref_pct / 100);
  // clean Cm0 so that elevator trim is −2° (TEU) at 95 KCAS (ค่าประมาณ, same rule as card 04)
  const Vc = 95 * KT, CLc = 2 * w.MTOW * 9.80665 / (1.225 * g.S * Vc * Vc), CL0 = 0.25, ac = (CLc - CL0) / CLa, Cmde = corr('Cmde').cruise;
  const Cm0 = -Cma * ac - Cmde * (-2 * Math.PI / 180);
  const dets = C.stall.detents;
  c.aero = {
    ref: { S: L(r(g.S, 5), 'm2', ['LF1'], 'สูง', false, '159.5 ft²'), b: L(r(g.b, 5), 'm', ['LF3', 'LF4'], 'กลาง', false, ''), c: E(r(g.MAC, 4), 'm', ['LF0'], 'MAC ประมาณ 58.0 in') },
    derivatives: Object.fromEntries(order.map(k => [k, deriv[k]])),
    static_long: {
      CL0: E(Object.fromEntries(dets.map(d => [d.name, r(CL0 + d.dCL0, 4)])), '-', ['LC9', 'LF0'], 'clean 0.25 ตามตาราง JSBSim c172 (ปีก NACA 2412 เดียวกัน, บัตร 04) + ΔCL0 ของแฟลป = ΔCLmax จาก POH Fig 5-3 (สมมติมุม stall เท่ากันทุกขั้น; 20° interpolate)'),
      CLalpha: E(r(CLa, 4), '1/rad', ['LM0', 'LM5', 'LF0'], `lm_derivs ${r(st.CLalpha, 4)} × 1.009 (อัตราส่วนบินจริง/ประมาณของ C172); AR 6.97 ต่ำกว่า C172 (7.48) จึงต่ำกว่า 5.17 ของ TM-80163`),
      Cm0: E(Object.fromEntries(dets.map(d => [d.name, r(Cm0 + d.dCm0, 4)])), '-', ['LF0', 'LC9'], 'clean: ตั้งให้ elevator trim −2° ที่ 95 KCAS MTOW CG อ้างอิง; ΔCm0 ของแฟลปจากตาราง JSBSim c172r (บัตร 04)'),
      Cmalpha: E(r(Cma, 4), '1/rad', ['LM0', 'LF0'], `−CLα (h_n − h): h_n ${r(st.h_n * 100, 3)} %MAC จาก lm_derivs, h ${r(C.cg.ref_pct, 3)} %MAC; static margin ${r((st.h_n - C.cg.ref_pct / 100) * 100, 3)} %`),
      CLmax_target: L(Object.fromEntries(dets.map(d => [d.name, d.CLmax])), '-', ['LF1', 'LM0'], 'กลาง', false, 'CLmax 1 g แบบ trim ที่ MTOW CG หน้าสุด คำนวณจาก Fig 5-3 (KCAS 48/46/43 ที่แฟลป 0/10/30, ความเร็วต่ำสุด nz 0.95) ไม่ใช่ค่าประมาณสำหรับแฟลป 0/10/30; แฟลป 20° ได้จากการ interpolate (ประมาณระหว่าง 10 และ 30); CG หลังสุดให้ 1.388/1.589/1.748'),
      alpha_CLmax: E(card0?.res?.stall ? Object.fromEntries(Object.entries(card0.res.stall).map(([k, s]) => [k, r(s.alpha_deg ?? s.alpha ?? NaN, 4)]).filter(([, v]) => Number.isFinite(v))) : { '0': 15.2, '30': 13.9 }, 'deg', ['LF0', 'LM0'], 'มุมปะทะที่ CLmax ในการทดสอบ stall 1 kt/s ของซิม (lm_card) กับค่า legacy ที่ fit แล้ว'),
    },
    flaps: {
      detents: E(dets.map(d => ({ name: d.name, flap_deg: d.flap_deg, ...(d.VFE_kt ? { VFE_kt: d.VFE_kt } : {}), dCL0: d.dCL0, dCD0: d.dCD0, dCm0: d.dCm0, CLmax: d.CLmax, f_lift: d.f_lift })), '-, deg, kt IAS', ['LF1', 'LF2', 'LC9', 'LF0'], 'CLmax จาก POH (20° interpolate); dCL0 = ΔCLmax; dCD0/dCm0 ใช้ค่าของบัตร 04 (JSBSim c172r) เพราะแฟลป single-slot ตระกูลเดียวกัน; f_lift = AC.flaps ของแต่ละขั้น; VFE 85 KIAS ทุกขั้น'),
      transition_time_s: E(8, 's', ['LF0'], '0→30° (POH ไม่ระบุเวลา; มอเตอร์ไฟฟ้า สวิตช์แบบ preselect ไม่มี — ปุ่มกดค้าง)'),
    },
    gear_drag: { dCD0: L(0, '-', ['LM0'], 'สูง', false, 'ล้อตายตัว: แรงต้านรวมใน CD0') },
    large_beta: { CY_crossflow: E(0.47, '-', ['LF0'], 'พื้นที่ด้านข้าง ~7.0 m² × CD 1.0 / S 14.8 m²') },
    strip_wing: {
      taper: E(0.7, '-', ['LF0'], 'เหมือน airframe.wing.taper'), dihedral_eff: E(1.73, 'deg', ['LM0'], 'ปีกสูงเพิ่ม Clb เอง'), washout: E(3, 'deg', ['LF0'], 'เหมือนบัตร 04'), aileron_span_frac: E([0.55, 0.97], '-', ['LM0'], 'เท่ากับ airframe.surfaces.aileron.span_fraction (สัดส่วนครึ่งช่วงปีกแบบเดียวกับบัตร 04 ไม่มีแบบวาดของ C152)'),
    },
    stall_warning: {
      min_margin: L(5, 'kt', ['LF10', 'LF1', 'LM3'], 'กลาง', false, 'แตรลม (pneumatic) ดังก่อน stall 5–10 kt (LF10 p29, LF1 p4-18); 14 CFR 23.207(c) เดิมกำหนด ≥ 5 kt'),
      alpha_warn_5kt: E({ '0': r(((CLmax_at(dets, '0') * (48 / 53) ** 2) - CL0) / CLa * 180 / Math.PI, 4), '30': r(((CLmax_at(dets, '30') * (43 / 48) ** 2) - CL0 - dets[3].dCL0) / CLa * 180 / Math.PI, 4) }, 'deg', ['LF0'], 'α ที่ VS + 5 kt จาก CLmax และ CLα ในบัตร (โมเดลเชิงเส้น)'),
      alpha_warn_design: E({ '0': r(((CLmax_at(dets, '0') * (48 / 53) ** 2) - CL0) / CLa * 180 / Math.PI - 0.7, 4), '30': r(((CLmax_at(dets, '30') * (43 / 48) ** 2) - CL0 - dets[3].dCL0) / CLa * 180 / Math.PI - 0.7, 4) }, 'deg', ['LF0', 'LC10'], 'ต่ำกว่า alpha_warn_5kt 0.7° ตามระยะเผื่อของรอบที่ 1'),
    },
    spin_reference: {
      IYMP: E(r((C.inertia.tm80163.Ixx - C.inertia.tm80163.Iyy) / (w.MTOW * g.b * g.b), 3), '-', ['LF0'], '(Ixx − Iyy)/(m b²) จาก inertia ในบัตร'),
      recovery_turns_max: L(1, 'turn', ['LF1', 'LM3'], 'กลาง', false, 'spin อนุญาต (utility); POH p4-19: spin 2 รอบฟื้นใน ¼–½ รอบ, spin นานอาจถึง 1 รอบหรือกว่า; 1 รอบเสียความสูง ≥ 1,000 ft; ฟื้นให้เสร็จ ≥ 4,000 ft AGL'),
    },
  };
  if (leg) c.aero.legacy = E(leg.legacy.aero, '-, 1/rad, deg', ['LM0', 'LF0'], `lm_legacy_fit (lf_fit.mjs โหมด static, T0 จาก BEM ${leg.legacy.propulsion.T0} N): polar รูปแบบซิมจาก glide 60 KCAS L/D 9.114; aStall/aStallFlap แก้หาให้ CLmax 1 g ตรง POH; ค่าอื่นจากบัตร (AC.flaps 0–1 = 0–30°)`, 'กลาง');

  // ───────── interference (round-1 paths, type specific)
  c.interference = {
    downwash: {
      deda: E(r(st.deda, 3), '-', ['LM0'], 'lm_derivs (DATCOM 4.4.1)'), eps0: E(0, 'rad', ['LF0'], 'รวมใน Cm0'), l_t: E(r(g.tail.l_h, 3), 'm', ['LF0'], 'ดู airframe.tail.l_h'),
      VH: E(r(g.tail.VH, 3), '-', ['LF0'], 'S_h l_h/(S c) จากค่าประมาณข้างบน (C172 0.605)'), a_t: E(r(st.CLaH, 4), '1/rad', ['LM0'], 'lm_derivs'), eta_t: E(0.9, '-', ['LM0'], 'ค่าเริ่มต้นของหัวข้อ 01'),
      CLadot: E(r(D.approach.body.CLadot, 4), '1/(rad·c/2V)', ['LM0'], 'lm_derivs'), Cmadot: E(r(D.approach.body.Cmadot, 4), '1/(rad·c/2V)', ['LM0'], 'lm_derivs'),
    },
    groundEffect: {
      rMac: E([r((C.cg.ref_in - (g.LEMAC_in + 0.25 * g.MAC_in)) * IN, 3), r(0.42 * g.b / 2, 3), -0.85], 'm (FRD จาก CG, y ใช้ ±)', ['LF0'], 'x จาก c/4 MAC; y ตำแหน่ง MAC ตามช่วงปีกของปีกเรียว 0.7; z ปีกสูงเหนือ CG ~0.85 m'),
      CLa_w: E(r(st.CLaW, 4), '1/rad', ['LM0'], 'lm_derivs (ปีกล้วน)'), A: L(r(g.AR, 4), '-', ['LF0'], 'สูง', false, ''),
      rEps: E({ a: 3.99, m: 0.652 }, '-', ['LC10'], 'สูตร fit ของรอบที่ 1 (VLM) ใช้ซ้ำ'),
    },
    slipstream: {
      diskDiameter: L(r(F.prop.D_in[1] * IN, 4), 'm', ['LF2'], 'สูง', false, '69 in (ต่ำสุด 67.5 in)'),
      hubPos: E([r((C.cg.ref_in - F.prop.arm_in) * IN, 3), 0, 0], 'm (FRD จาก CG)', ['LF2', 'LF0'], 'น้ำหนักใบพัดอยู่ที่ −36.5 in (TCDS) ใช้เป็นตำแหน่งระนาบใบพัด; แนวแรงขับที่ระดับ CG'),
      sense: L(1, '-', ['LC8'], 'กลาง', false, 'Lycoming direct drive หมุนตามเข็มนาฬิกาเมื่อมองจากห้องนักบิน (PHAK)'),
      finArea: E(r(g.tail.S_v, 3), 'm2', ['LF0'], 'ดู airframe.tail.S_v'), finArm: E(r(g.tail.l_v, 3), 'm', ['LF0'], 'ใช้ค่าเดียวกับ l_h (ครีบและหางระดับอยู่ตำแหน่งเดียวกันตามยาว)'),
      finLiftSlope: E(r(st.CLaV, 4), '1/rad', ['LM0'], 'lm_derivs'), eta_v: E(0.9, '-', ['LM0'], 'ค่าเริ่มต้นของหัวข้อ 01'),
    },
  };

  // ───────── speeds
  const vaK = F.kias.VA, vaC = F.kcas.VA;
  c.speeds = {
    VS0_kt: L(43, 'kt CAS', ['LF1'], 'สูง', false, 'แฟลป 30 power off 1,670 lb CG หน้าสุด (Fig 5-3: 35 KIAS); CG หลังสุด 41 KCAS (31 KIAS); หน้าสเปก "stall flaps down 43 kt CAS"'),
    VS1_kt: L(48, 'kt CAS', ['LF1'], 'สูง', false, 'แฟลปขึ้น CG หน้าสุด (40 KIAS); CG หลังสุด 46 KCAS (36 KIAS)'),
    VX_kt: L(55, 'kt IAS', ['LF1'], 'สูง', false, 'SL ถึง 10,000 ft (p4-3)'),
    VY_kt: L(67, 'kt IAS', ['LF1'], 'สูง', false, 'SL; 61 KIAS ที่ 10,000 ft (p4-3, Fig 5-5)'),
    VR_kt: L(50, 'kt IAS', ['LF1'], 'กลาง', false, 'normal takeoff ยกล้อหน้าที่ 50 KIAS (p4-8); short field 54 KIAS ที่ 50 ft แฟลป 10'),
    VAPP_kt: L(60, 'kt IAS', ['LF1'], 'กลาง', false, `D1 (บัตรเป็นเจ้าของ; 08 ops.final และ 09 Vapp อ้างค่านี้): normal approach แฟลป 30 55–65 KIAS (POH p4-3) ใช้กลางช่วง 60 KIAS = ${r(iasToCas('30', 60), 3)} KCAS (${r(iasToCas('30', 60) * KT, 3)} m/s); POH บอกว่าความเร็วในหัวข้อ 4 อิงน้ำหนักสูงสุด 1,670 lb และใช้ได้กับทุกน้ำหนักที่ต่ำกว่า จึงเป็นค่าเดียวกันที่ training_mass 717.5 kg; VAPP ≥ VREF 54 KIAS; แฟลปขึ้น 60–70 KIAS`),
    VAPP_short_kt: L(54, 'kt IAS', ['LF1'], 'สูง', false, 'short field แฟลป 30 (p4-3; ตารางลงจอด p5-19 ที่ 50 ft)'),
    VREF_kt: L(54, 'kt IAS', ['LF1'], 'กลาง', false, `D1: POH ไม่ใช้คำว่า VREF; ใช้ความเร็วที่ 50 ft ของ short field landing 54 KIAS (55 KCAS = ${r(C.perf.vref_over_vs0, 3)} VS0 CAS) ที่ 1,670 lb และใช้ค่าเดียวกันที่ training_mass 717.5 kg ตามที่ POH ให้ใช้กับทุกน้ำหนักที่ต่ำกว่า; ข้อมูลประกอบ: 1.3 VS0 ที่ training_mass (43 KCAS × √(m/MTOW)) = ${r(1.3 * 43 * Math.sqrt(w.training_mass / w.MTOW), 3)} KCAS`),
    VG_kt: L(60, 'kt IAS', ['LF1', 'LF5'], 'สูง', false, 'maximum glide แฟลปขึ้น (p3-3, Fig 3-1) = 60 KCAS'),
    VA_kt: L({ '1350': vaK[1350], '1500': vaK[1500], '1670': vaK[1670] }, 'kt IAS', ['LF1', 'LF2'], 'สูง', false, `lb → KIAS (KCAS ${vaC[1670]}/${vaC[1500]}/${vaC[1350]} ที่ 1,670/1,500/1,350 lb)`),
    VNO_kt: L(111, 'kt IAS', ['LF1', 'LF2'], 'สูง', false, '108 KCAS'),
    VNE_kt: L(149, 'kt IAS', ['LF1', 'LF2'], 'สูง', false, '145 KCAS'),
    VFE: L({ '10': 85, '20': 85, '30': 85 }, 'kt IAS', ['LF1', 'LF2'], 'สูง', false, '85 KIAS = 87 KCAS ทุกขั้น (white arc 35–85 KIAS)'),
    ias_cas: L(F.ias_cas, 'KIAS → KCAS', ['LF1', 'LF5'], 'สูง', false, 'Fig 5-1 (LF1 p5-8 อ่านจาก OCR, ตรวจกับ LF5 p5-7) แฟลป 0 / 10 / 30 ระบบ static ปกติ; แฟลป 10 และ 30 มีถึง 85 KIAS (84 / 87 KCAS); ตาราง 20° ไม่มี (lm_card ใช้ตารางแฟลป 0 แทนเมื่อไม่มีคีย์); ใกล้ stall KCAS สูงกว่า KIAS 6–8 kt (ตาราง stall Fig 5-3 ให้ 40 KIAS = 48 KCAS ต่างจาก Fig 5-1 ที่ให้ 46)'),
    stall_table: L({ cg_fwd: F.stall_bank.fwd, cg_aft: F.stall_bank.aft, bank_deg: F.stall_bank.bank, cell: '[KIAS, KCAS]' }, 'kt', ['LF1'], 'สูง', false, 'Fig 5-3 1,670 lb power off'),
    stall_warning_margin_kt: L(5, 'kt', ['LF10', 'LF1'], 'กลาง', false, 'แตร 5–10 kt ก่อน stall'),
    stall_altitude_loss_ft: L(160, 'ft', ['LF1'], 'สูง', false, 'Fig 5-3 note: อาจเสียความสูงถึง 160 ft (49 m) ระหว่าง stall และการแก้'),
    crosswind_demonstrated_kt: L(12, 'kt', ['LF1'], 'สูง', false, 'p4-3 และ Fig 5-2; ไม่ใช่ขีดจำกัด'),
    icao_approach_category: L('A', '-', ['LF0'], 'สูง', false, 'Vat = 1.3 VS0 = 56 KCAS < 91 kt'),
  };

  // ───────── performance
  const p = C.perf, ftm = x => r(x * FT, 4);
  c.performance = {
    ROC_SL_fpm: L(715, 'fpm', ['LF1'], 'สูง', false, `1,670 lb SL ISA (หน้าสเปก); Fig 5-5 ที่ 15 °C interpolate ได้ ${r(p.isa_check.roc_15C, 4)}`),
    ROC_table: L({ axes: { PA_ft: F.roc_table.PA_ft, OAT_C: F.roc_table.OAT_C }, kias: F.roc_table.kias, data: F.roc_table.data }, 'fpm', ['LF1'], 'สูง', false, `Fig 5-5 1,670 lb แฟลปขึ้น คันเร่งเต็ม mixture lean ตามที่กำหนด (kias = ความเร็วไต่ต่อแถว); POH มีคอลัมน์ 20 และ 40 °C ไม่มี 30 °C; VTBD 35 °C ≈ ${p.vtbd35.roc_fpm} fpm (${r(p.vtbd35.roc_fpm * FT / 60, 3)} m/s) และ 30 °C ≈ ${p.vtbd30.roc_fpm} fpm จากการ interpolate ที่ SL (ดู vtbd_hot_day)`),
    service_ceiling_ft: L(14700, 'ft', ['LF1'], 'สูง', false, 'หน้าสเปก'),
    cruise_table: L([...F.cruise_2000ft.map(q => ({ alt_ft: 2000, rpm: q.rpm, power: q.pct + ' %', ktas: q.ktas, gph: q.gph })), { alt_ft: 0, power: 'max', ktas: 110 }, { alt_ft: 8000, power: '75 %', ktas: 107 }], 'ft, rpm, -, kt TAS, US gal/h', ['LF1'], 'กลาง', false, 'Fig 5-7 แถว 2,000 ft อุณหภูมิมาตรฐาน (อ่านจาก OCR) และจุดสรุปหน้าสเปก'),
    glide: E({ speed_kt: 60, ratio: r(F.glide.ratio_faa, 4) }, 'kt IAS, -', ['LF1', 'LF6', 'LF5'], 'ความเร็วจาก POH p3-3 (60 KIAS = 60 KCAS); ratio จาก FAA 1.5 NM ต่อ 1,000 ft สำหรับ C152/C172; แกนกราฟ Fig 3-1 ของ POH แบ่ง 1.6 NM ต่อ 1,000 ft (ถ้าเส้นเป็นแนวทแยงจะได้ 9.72) ดู §11.13', 'กลาง'),
    takeoff: L({ ground_roll_m: ftm(F.to.gr_ft), over50ft_m: ftm(F.to.d50_ft) }, 'm', ['LF1'], 'สูง', false, '725 / 1,340 ft MTOW SL ISA ลมสงบ ผิวแห้ง (short field แฟลป 10 คันเร่งเต็มก่อนปล่อยเบรก)'),
    landing: L({ ground_roll_m: ftm(F.ldg.gr_ft), over50ft_m: ftm(F.ldg.d50_ft) }, 'm', ['LF1'], 'สูง', false, '475 / 1,200 ft แฟลป 30 power off เบรกสุด 54 KIAS ที่ 50 ft'),
    takeoff_table: L({ axes: { PA_ft: F.to_table.PA_ft, OAT_C: F.to_table.OAT_C }, roll_ft: F.to_table.roll_ft, total50_ft: F.to_table.total50_ft }, 'ft', ['LF1', 'LF5'], 'สูง', false, `Fig 5-4 (LF1 p5-11) 1,670 lb แฟลป 10 short field; มีคอลัมน์ 30 และ 40 °C; VTBD 35 °C ≈ ${p.vtbd35.to_gr_ft} / ${p.vtbd35.to_50_ft} ft (${ftm(p.vtbd35.to_gr_ft)} / ${ftm(p.vtbd35.to_50_ft)} m); ค่าแก้ลมและผิวหญ้าดู performance.corrections (LF5 p5-10)`),
    landing_table: L({ axes: { PA_ft: F.ldg_table.PA_ft, OAT_C: F.ldg_table.OAT_C }, roll_ft: F.ldg_table.roll_ft, total50_ft: F.ldg_table.total50_ft }, 'ft', ['LF1', 'LF5'], 'สูง', false, `Landing Distance p5-19 (Fig 5-10 ตามสารบัญและข้อความของ LF1; หัวรูปฉบับ OCR อ่านเป็น 5-11) แฟลป 30 power off เบรกสุด 54 KIAS ที่ 50 ft; มีคอลัมน์ 30 และ 40 °C; VTBD 35 °C ≈ ${p.vtbd35.ldg_gr_ft} / ${p.vtbd35.ldg_50_ft} ft (${ftm(p.vtbd35.ldg_gr_ft)} / ${ftm(p.vtbd35.ldg_50_ft)} m); ค่าแก้ลม ผิวหญ้า และแฟลปขึ้นดู performance.corrections`),
    corrections: L({ headwind_pct_per_kt: r(F.corrections.headwind_pct_per_kt, 4), tailwind_pct_per_kt: F.corrections.tailwind_pct_per_kt, tailwind_max_kt: F.corrections.tailwind_max_kt, grass_to_pct_of_roll: F.corrections.grass_to_pct_of_roll, grass_ldg_pct_of_roll: F.corrections.grass_ldg_pct_of_roll, flaps_up_ldg_pct: F.corrections.flaps_up_ldg_pct }, '% ต่อ kt, kt, %', ['LF5', 'LF1'], 'สูง', false, 'หมายเหตุใต้ตารางวิ่งขึ้นและลงจอด: ลมปะทะลดระยะ 10 % ต่อทุก 9 kt, ลมส่ง (ไม่เกิน 10 kt) เพิ่ม 10 % ต่อทุก 2 kt (LF5 p5-10, p5-18; ใน LF1 OCR ตกตัวเลข); ทางวิ่งหญ้าแห้งเพิ่มระยะเท่ากับ 15 % (วิ่งขึ้น) / 45 % (ลงจอด) ของค่า ground roll; ลงจอดแฟลปขึ้นเผื่อระยะเพิ่ม 35 % (LF1 p5-19)'),
    fuel: L({ usable_L: r(C.weights.fuel_std_usable_L, 4), usable_kg: r(C.weights.fuel_std_usable_kg, 4), usable_LR_L: r(C.weights.fuel_lr_usable_L, 4), ff_75pct_gph: 6.1, ff_47pct_gph: 3.9 }, 'L, kg, US gal/h', ['LF1'], 'สูง', false, 'ถังมาตรฐาน 24.5 gal / พิสัยไกล 37.5 gal ใช้ได้; อัตราสิ้นเปลืองจาก Fig 5-7'),
    vtbd_hot_day: E({ to_roll_ft: p.vtbd35.to_gr_ft, to_50_ft: p.vtbd35.to_50_ft, ldg_roll_ft: p.vtbd35.ldg_gr_ft, ldg_50_ft: p.vtbd35.ldg_50_ft, roc_fpm: p.vtbd35.roc_fpm, to_roll_m: ftm(p.vtbd35.to_gr_ft), to_50_m: ftm(p.vtbd35.to_50_ft), ldg_roll_m: ftm(p.vtbd35.ldg_gr_ft), ldg_50_m: ftm(p.vtbd35.ldg_50_ft), at30C: p.vtbd30 }, 'ft, fpm, m', ['LF1', 'LF0'], 'interpolate ตาราง POH ที่ PA 0 ft (VTBD 9 ft) OAT 35 °C ระหว่างคอลัมน์ 30 และ 40 °C; MTOW ลมสงบ', 'กลาง'),
  };

  // ───────── propulsion, piston, propeller
  const pr = C.prop;
  c.propulsion = {
    layout: E([{ id: 1, pos: [r((C.cg.ref_in - F.prop.arm_in) * IN, 3), 0, 0], axis: [1, 0, 0], type: 'piston', model: 'Lycoming O-235-L2C', prop_sense: 1 }], 'm FRD', ['LF2', 'LC8', 'LF0'], 'ตำแหน่งใบพัดจากแขนน้ำหนักใบพัด −36.5 in (TCDS)', 'กลาง'),
  };
  if (leg) c.propulsion.legacy = E(leg.legacy.propulsion, 'W, -, N, -', ['LM0', 'LF0'], `lm_legacy_fit โหมด static: T0 = แรงขับสถิต BEM (${pr.static.rpm.toFixed(0)} rpm) แล้ว fit Vc ให้ ROC 715 fpm; idle 0 เพราะ polar จาก glide รวมแรงต้านใบพัดแล้ว`, 'กลาง');
  c.piston = {
    identity: L({ model: 'O-235-L2C', kind: 'carb', displacement_L: r(C.engine.disp_L, 4), cylinders: 4, tcds: 'FAA E-223' }, '-', ['LF1', 'LF7'], 'สูง', false, '233.3 in³ 4 สูบนอน ระบายความร้อนด้วยอากาศ direct drive; น้ำหนักแห้ง 249 lb (113 kg) ตาม LF7 (ทุติยภูมิ)', 'engine'),
    ratings: {
      P_rated: L(r(C.engine.P_rated_W, 5), 'W', ['LF2', 'LF1'], 'สูง', false, '110 hp @ 2,550 rpm (alternate rating ของ L2C ที่ 115 hp/2,700); O-235-N2C 108 hp = 80.5 kW', 'engine'),
      rpm_rated: L(2550, 'rpm', ['LF2'], 'สูง', false, '', 'engine'),
      P_mcp: L(r(C.engine.P_rated_W, 5), 'W', ['LF2'], 'สูง', false, 'ไม่มีพิกัด takeoff แยก', 'engine'),
      rpm_redline: L(2550, 'rpm', ['LF1'], 'สูง', false, 'tach green 1,900–2,350 SL, –2,450 ที่ 4,000 ft, –2,550 ที่ 8,000 ft', 'engine'),
      rpm_idle: E(650, 'rpm', ['LF0'], 'ยังไม่ได้อ่านค่าจาก POH', 'ต่ำ', 'engine'),
      takeoff_time_limit_s: L('unlimited', 's', ['LF2'], 'สูง', false, 'TCDS ให้ 2,550 rpm สำหรับทุกการใช้งาน', 'engine'),
    },
    altitude: E({ model: 'ind_friction', f: 0.1 }, '-', ['LM17', 'LM0'], `ข้อเสนอของหัวข้อ 01 สำหรับวันร้อน: SL 35 °C เหลือ ${r(C.engine.lapse_ind_friction.SL_35C, 3)}, 8,000 ft ISA ${r(C.engine.lapse_ind_friction.ft8000, 3)}`, 'กลาง', 'engine'),
    fuel: E({ fuel: 'avgas 100LL (100/100LL)', bsfc_g_per_kWh: Math.round(C.engine.bsfc.mean_g_per_kWh), density_kg_L: 0.72 }, '-, g/kWh, kg/L', ['LF1', 'LF0'], 'BSFC เฉลี่ยจาก 5 แถวของ Fig 5-7 (2,000 ft, recommended lean) สมมติ % power ตามตาราง', 'กลาง', 'engine'),
    dynamics: E({ tau_throttle_s: 0.2, I_engine: 1.0, friction_torque: 'f 0.10 ของกำลังพิกัดที่รอบพิกัด' }, 's, kg m2, -', ['LF0', 'LM0'], 'เครื่องเล็กกว่า IO-360 (บัตร 04 ใช้ 1.7 kg m²)', 'ต่ำ', 'engine'),
  };
  c.propeller = {
    identity: {
      kind: L('fixed', '-', ['LF2'], 'สูง', false, '', 'propeller'), model: L('McCauley 1A103/TCM6958', '-', ['LF2', 'LF1'], 'สูง', false, 'TCDS เขียน 1A103/TCM; POH p1-3 เขียนเต็ม 1A103/TCM6958', 'propeller'),
      nBlades: L(2, '-', ['LF1'], 'สูง', false, '', 'propeller'), diameter: L(r(pr.D, 4), 'm', ['LF2'], 'สูง', false, '69 in (ต่ำสุด 67.5 in)', 'propeller'),
      sense: L(1, '-', ['LC8'], 'กลาง', false, 'ตามเข็มนาฬิกามองจากห้องนักบิน', 'propeller'),
      massComplete: L(r(pr.mass_kg, 3), 'kg', ['LF2'], 'สูง', false, '23.2 lb ที่ arm −36.5 in (TCDS)', 'propeller'),
      hubPosition: E([r((C.cg.ref_in - F.prop.arm_in) * IN, 3), 0, 0], 'm (FRD จาก CG)', ['LF2', 'LF0'], 'ดู propulsion.layout', 'ต่ำ', 'propeller'),
      thrustAxis: E([1, 0, 0], '-', ['LF0'], 'ไม่มีข้อมูลมุมเอียงเครื่อง', 'ต่ำ', 'propeller'),
    },
    fixed: {
      pitch_in: L(58, 'in', ['LF1', 'LF12', 'LF0'], 'กลาง', false, 'จากรหัส 6958 (POH p1-3) = 69 in × pitch 58 in ตามแบบแผนการตั้งชื่อของ McCauley (เหมือนที่หัวข้อ 01 อ่าน 7660); TCDS เขียนแค่ 1A103/TCM และตารางเสียงของ CAA NZ (LF12) มีใบ 1A102/TCM6955 (pitch 55 in) สำหรับ 152 ด้วย จึงอาจมีหลาย pitch ในฝูงจริง', 'propeller'),
      beta75_deg: L(r(pr.beta75_deg, 4), 'deg', ['LF0'], 'กลาง', true, 'ค่าประมาณ: atan(58/(0.75π·69)) โดยสมมติว่า pitch 58 in วัดที่ 75 % ของรัศมีและใบบิดแบบ helical (รูปใบจริงไม่เปิดเผย; ใช้ใน BEM ของ lm_prop)', 'propeller'),
      static_rpm_range: L(F.engine.static_rpm, 'rpm', ['LF2', 'LF1'], 'สูง', false, 'คันเร่งเต็ม carb heat off mixture lean ที่รอบสูงสุด', 'propeller'),
    },
    engineInterface: { maxShaftPower: L(r(C.engine.P_rated_W / 1000, 4), 'kW', ['LF2'], 'สูง', false, '110 hp', 'propeller'), gearRatio: L(1, '-', ['LF1'], 'สูง', false, 'direct drive', 'propeller') },
    bladeGeometry: {
      hubRadiusRatio: E(0.15, 'r/R', ['LM0'], 'lm_prop', 'ต่ำ', 'propeller'),
      chordOverD: E({ axes: { x: pr.cx }, data: pr.chordOverD }, 'c/D', ['LM0', 'LF0'], `แบบใบ GA ของ lm_prop × ${r(pr.chordScale, 4)} ให้รอบสถิต 2,330 rpm (กลางช่วง TCDS); ก่อนปรับ BEM ได้ ${Math.round(pr.rpm_before_cal)} rpm`, 'ต่ำ', 'propeller'),
      twistDesignJ: L(r(F.prop.pitch_in / F.prop.D_in[1], 4), '-', ['LF0'], 'กลาง', true, 'ค่าประมาณ: สมมติใบบิดแบบ helical ที่ pitch เรขาคณิตคงที่ ได้ J ออกแบบ = pitch/D = 58/69 (รูปใบจริงไม่เปิดเผย; ใช้ใน BEM ของ lm_prop)', 'propeller'),
      activityFactor: E(Math.round(90 * pr.chordScale / 1.083), '-', ['LM0'], 'สเกลจากใบ 76×60 ของหัวข้อ 01 (≈ 90 ที่ chord ×1.083)', 'ต่ำ', 'propeller'),
    },
    section: {
      liftSlope: E(5.655, '1/rad', ['LM0'], 'คล้าย Clark Y (lm_prop)', 'ต่ำ', 'propeller'), alpha0: E(-3.5, 'deg', ['LM0'], 'lm_prop', 'ต่ำ', 'propeller'),
      alphaStallPos: E(14, 'deg', ['LM0'], 'lm_prop', 'ต่ำ', 'propeller'), alphaStallNeg: E(-10, 'deg', ['LM0'], 'lm_prop', 'ต่ำ', 'propeller'),
      cd0: E(0.01, '-', ['LM0'], 'lm_prop', 'ต่ำ', 'propeller'), kcd: E(0.012, '-', ['LM0'], 'lm_prop', 'ต่ำ', 'propeller'), stallDelayFactor: E(3, '-', ['LM0'], 'Snel', 'ต่ำ', 'propeller'),
    },
    tables: {
      CT: E({ axes: { J: pr.table.J }, data: pr.table.CT }, '-', ['LM0', 'LF0'], 'BEM (lm_prop) หลังปรับ chord', 'ต่ำ', 'propeller'),
      CP: E({ axes: { J: pr.table.J }, data: pr.table.CP }, '-', ['LM0', 'LF0'], 'BEM; ตรวจ cruise 2,400 rpm 101 KTAS 2,000 ft ดูดกำลัง ' + r(pr.cruise_check.P_abs_pct, 3) + ' % (POH 75 %)', 'ต่ำ', 'propeller'),
    },
    inertia: {
      Ip: E(r(pr.Ip_est, 3), 'kg m2', ['LF2', 'LF0'], 'สเกลจากบัตร 04 (1.4 kg m², 76 in ~14 kg) ด้วยมวล 10.5 kg และ D²', 'ต่ำ', 'propeller'),
      IreflectedEngine: E(0.2, 'kg m2', ['LF0'], 'เพลาข้อเหวี่ยง O-235 (บัตร 04 ใช้ 0.3 กับ IO-360)', 'ต่ำ', 'propeller'),
    },
    checks: {
      staticThrustISA: E(r(pr.static.T0_N / 1000, 3), 'kN', ['LM0', 'LF0'], `BEM ${Math.round(pr.static.rpm)} rpm FM ${r(pr.FM, 3)} (${Math.round(pr.static.T0_N / 4.44822)} lbf)`, 'ต่ำ', 'propeller'),
      staticThrustVTBD31C: E(r(pr.staticHot35C.T0_N / 1000, 3), 'kN', ['LM0', 'LF0'], `ISA+20 (35 °C) ${Math.round(pr.staticHot35C.rpm)} rpm`, 'ต่ำ', 'propeller'),
      momentumIdealStaticISA: L(r(pr.T_ideal_FM1 / 1000, 3), 'kN', ['LF0'], 'กลาง', false, 'FM = 1 ที่กำลังที่ใบพัดดูดตอนสถิต', 'propeller'),
      peakEfficiency: E(r(pr.peak.eta, 3), '-', ['LM0'], `BEM ที่ J ≈ ${r(pr.peak.J, 2)}`, 'ต่ำ', 'propeller'),
    },
  };

  // ───────── controls
  const tv = F.travel;
  c.controls = {
    architecture: L({ pitch: 'reversible (cable)', roll: 'reversible (cable)', yaw: 'reversible (cable) + nose-wheel steering ผ่านแป้น rudder', trim: 'tab' }, '-', ['LF10', 'LF2'], 'กลาง', false, 'manual elevator trim tab (LF10 p3); ไม่มี aileron/rudder trim'),
    surfaces: {
      elevator: L({ travel_deg: { up: tv.elev.up, down: tv.elev.down }, rate_dps: 70, actuator_tau_s: 0 }, 'deg, deg/s, s', ['LF2', 'LC10'], 'สูง', false, 'travel_deg อ่านตรงจาก TCDS 3A19 (up 25° ±1, down 18° ±1) ไม่ใช่ค่าประมาณ; rate_dps 70 เป็นค่าสมมติของรอบที่ 1 สำหรับมือคน; actuator_tau_s 0 เพราะต่อด้วยสลิงตรง'),
      aileron: L({ travel_deg: { up: tv.ail.up, down: tv.ail.down }, rate_dps: 80, actuator_tau_s: 0 }, 'deg, deg/s, s', ['LF2', 'LC10'], 'สูง', false, 'travel_deg จาก TCDS: up 20° ±2, down 15° ±1 วัดจาก droop 1° (ไม่ใช่ค่าประมาณ); rate_dps 80 เป็นค่าสมมติของรอบที่ 1 สำหรับมือคน'),
      rudder: L({ travel_deg: { left: tv.rud, right: tv.rud }, rate_dps: 60, actuator_tau_s: 0 }, 'deg, deg/s, s', ['LF2', 'LF3', 'LC10'], 'สูง', false, 'travel_deg จาก TCDS: 23° (+0/−2) วัดตั้งฉากกับแนวบานพับ = 20°30′ วัดขนาน waterline (service manual) ไม่ใช่ค่าประมาณ; rate_dps 60 เป็นค่าสมมติของรอบที่ 1 สำหรับมือคน'),
      flap: L({ travel_deg: { up: 0, down: tv.flap }, rate_dps: r(30 / 8, 3), actuator_tau_s: 0 }, 'deg, deg/s, s', ['LF2', 'LF0'], 'สูง', false, 'travel_deg 0–30° ±2 จาก TCDS (ไม่ใช่ค่าประมาณ); rate_dps เป็นค่าสมมติ 30° ใน ~8 s (ยังไม่มีเวลาของแฟลปจาก POH)'),
      trim_tab: L({ travel_deg: { up: tv.tab.up, down: tv.tab.down } }, 'deg', ['LF2'], 'สูง', false, 'up 10° ±1, down 20° ±1'),
    },
    trim: {
      kind: L('manual wheel + elevator tab', '-', ['LF10'], 'กลาง', false, 'ไม่มี electric trim'),
      range_deg: L({ tab_up: tv.tab.up, tab_down: tv.tab.down }, 'deg', ['LF2'], 'สูง', false, ''),
      rate_dps: E(1, 'deg/s', ['LF0'], 'สำหรับปุ่มคีย์บอร์ดของซิม (ล้อหมุนด้วยมือจริง)'),
    },
    pitch: {
      architecture: L({ kind: 'reversible', input: 'force' }, '-', ['LF10'], 'กลาง', false, 'สลิง'),
      S_e: E(r(g.tail.S_h * 0.42 * 0.95, 3), 'm2', ['LM0', 'LF0'], 'S_h × 0.42 × 0.95'), c_e: E(r(0.42 * 0.95, 3), 'm', ['LF0'], '0.42 × คอร์ดเฉลี่ยหาง 0.95 m'),
      eta_t: E(0.9, '-', ['LM0'], 'ค่าเริ่มต้น η_h'), a_t: E(r(st.CLaH, 4), '1/rad', ['LM0'], 'lm_derivs'), tau_e: E(r(st.tauE, 3), '-', ['LM0'], 'lm_derivs'),
      l_t: E(r(g.tail.l_h, 3), 'm', ['LF0'], 'เท่ากับ airframe.tail.l_h (แขนหางของ TM-80163 ย่อตามความยาวลำตัว)'), deda: E(r(st.deda, 3), '-', ['LM0'], 'lm_derivs (DATCOM)'),
      tab_max: L(20, 'deg', ['LF2'], 'สูง', false, 'up 10 / down 20'),
      stops: L({ teu: tv.elev.up, ted: tv.elev.down }, 'deg', ['LF2'], 'สูง', false, 'TCDS'),
    },
    roll: {
      architecture: L({ kind: 'reversible', input: 'force' }, '-', ['LF10'], 'กลาง', false, ''),
      S_a_each: E(0.70, 'm2', ['LF0'], 'ดู airframe.surfaces.aileron'), c_a: E(0.35, 'm', ['LF0'], '0.25 × คอร์ด ~1.4 m'),
      stops: L({ up: tv.ail.up, down: tv.ail.down, max_mean: 17.5 }, 'deg', ['LF2'], 'สูง', false, 'TCDS'),
    },
    yaw: {
      architecture: L({ kind: 'reversible', input: 'force' }, '-', ['LF10'], 'กลาง', false, 'pedal ต่อกับ rudder และล้อหน้า'),
      S_r: E(0.52, 'm2', ['LF0'], 'ดู airframe.surfaces.rudder'), c_r: E(0.4, 'm', ['LF0'], 'คอร์ดเฉลี่ยของ rudder = 0.42 × คอร์ดครีบเฉลี่ยราว 0.95 m (S_v 1.28 m² / ความสูง ~1.35 m)'),
      stops: L({ max: tv.rud }, 'deg', ['LF2'], 'สูง', false, 'ตั้งฉากกับแนวบานพับ'),
    },
  };

  // ───────── gear
  const hp = 1.10, xn = r((C.cg.ref_in - (48.5 - F.wheelbase_in)) * IN, 3), xm = r((C.cg.ref_in - 48.5) * IN, 3);
  const Wn = w.MTOW * 9.80665 * (-xm) / (xn - xm), Wm = (w.MTOW * 9.80665 - Wn) / 2, dstat = 0.045, kmain = Wm / dstat;
  c.gear = {
    layout: L('tricycle_fixed', '-', ['LF10'], 'สูง', false, 'ล้อหลัก tubular spring steel ล้อหน้า oleo เลี้ยวได้'),
    geometry: {
      nose_contact_body_extended: E([xn, 0, hp], 'm FRD', ['LF1', 'LF0'], 'แกนล้อหลักสมมติที่ +48.5 in DAT (ค่าประมาณ) แล้วล้อหน้าอยู่หน้า 58 in (wheelbase จาก POH); z = ความสูง CG'),
      main_contact_body_extended: E([[xm, -r(g.track / 2, 4), hp], [xm, r(g.track / 2, 4), hp]], 'm FRD', ['LF3', 'LF0'], `track 91.28 in; ล้อหลังหลัง CG ${r(-xm, 3)} m ⇒ โหลดล้อหน้า ${r(100 * Wn / (w.MTOW * 9.80665), 3)} % ที่ CG อ้างอิง`),
      cg_height_parked: E(hp, 'm', ['LF0'], 'ต่ำกว่า C172 (1.30 m ในบัตร 04) ตามความสูงเครื่อง 2.59 m เทียบ 2.72 m'),
    },
    strut_main: {
      kind: L('spring_leg', '-', ['LF10', 'LF3'], 'สูง', false, 'tubular spring steel'),
      spring: E({ k_vertical: Math.round(kmain), k_lateral: Math.round(0.6 * kmain), damping_ratio: 0.25, static_deflection: dstat }, 'N/m, N/m, -, m', ['LF0'], `k = N/δ: โหลดล้อหลักละ ${Math.round(Wm)} N ที่ MTOW, δ สถิต 0.045 m; ζ 0.25 (ขาสปริงเหล็กหน่วงน้อย; ค่าเดียวกับบัตร 04)`),
      stroke: E(0.13, 'm', ['LF0'], 'ระยะยุบใช้งาน'),
      c_linear: E(Math.round(2 * 0.25 * Math.sqrt(kmain * Wm / 9.80665)), 'N s/m', ['LF0'], '2ζ√(kN/g)'),
    },
    strut_nose: {
      kind: L('oleo', '-', ['LF10', 'LF3'], 'สูง', false, 'air/oil shock strut; เติมลม 20 psi ตอนยืดสุด (service manual)'),
      stroke: E(0.11, 'm', ['LF0'], 'ระยะยุบใช้งานของ oleo ล้อหน้า เลือกให้ใกล้บัตร 04 (C172S) ลดตามขนาดเครื่อง ไม่มีข้อมูลของ C152'),
      c_linear: E(Math.round(2 * 0.6 * Math.sqrt((Wn / 0.035) * Wn / 9.80665)), 'N s/m', ['LF0'], `ζ 0.6, k = ${Math.round(Wn)} N / 0.035 m`),
    },
    tyre_main: {
      size: L({ size: '15x6.00-6 (6.00-6)', ply: 4 }, '-', ['LF3'], 'กลาง', false, 'มาตรฐาน; ทางเลือก 6.00-6 แรงดัน 21 psi'),
      operating_pressure: L(29, 'psi', ['LF3'], 'กลาง', false, '15x6.00-6 4 ply'),
      outside_diameter: E(0.381, 'm', ['LF3'], '15 in ตามรหัสยาง'), section_width: E(0.152, 'm', ['LF3'], '6.00 in ตามรหัสยาง 15x6.00-6'),
      rolling_radius: E(0.18, 'm', ['LF0'], 'รัศมีภายใต้โหลด'),
    },
    tyre_nose: {
      size: L({ size: '5.00-5', ply: 4 }, '-', ['LF3'], 'กลาง', false, ''),
      operating_pressure: L(30, 'psi', ['LF3'], 'กลาง', false, ''),
      outside_diameter: E(0.355, 'm', ['LF0'], '~14 in สำหรับ 5.00-5'),
    },
    brakes: { antiskid: L(0, 'bool', ['LF10'], 'สูง', false, 'ไม่มี anti-skid; disc brake ไฮดรอลิกด้านในของล้อหลักแต่ละข้าง ควบคุมด้วย toe brake') },
    steering: {
      mode: L({ type: 'pedal_linked', caster_with_diff_brake: true }, '-', ['LF10'], 'สูง', false, 'rudder pedal ต่อกับล้อหน้า; เบรกแยกเลี้ยวได้มากกว่า'),
      pedal_max: L(F.steering.pedal, 'deg', ['LF10'], 'กลาง', false, 'ประมาณ 8.5° แต่ละข้าง (POH section 7 ฉบับ OCR)'),
      caster_max: L(F.steering.brakes, 'deg', ['LF10'], 'ต่ำ', false, 'ถึง ~30° ด้วยเบรก (OCR อ่านเป็น "300")'),
      min_turn_radius_m: L(r(g.turn_radius_m, 3), 'm', ['LF1', 'LF10'], 'สูง', false, '24 ft 8 in จากจุดหมุนถึงปลายปีกด้านนอก'),
    },
    certification: {
      part23_limit_descent: L({ formula: 'V = 4.4 (W/S)^0.25 fps, 7..10', WS_lb_ft2: r(p.part23_descent.WS, 4), V_fps: r(p.part23_descent.V_fps, 3), V_mps: r(p.part23_descent.V_mps, 3) }, 'fps', ['LM3'], 'กลาง', false, '14 CFR 23.473(d) เดิม (ก่อน Amendment 23-64) C152 รับรองตาม CAR 3 (TCDS 3A19) ซึ่งมีเกณฑ์ภาระล้อของตัวเอง เลขข้อใน CAR 3 ยังไม่ได้ตรวจ จึงใช้สูตร Part 23 เป็นเกณฑ์ทดสอบ hard landing เท่านั้น'),
      part23_wing_lift_ratio: L(0.667, '-', ['LM3'], 'กลาง', false, '23.473(e) เดิม'),
      part23_min_load_factors: L({ inertia: 2.67, ground_reaction: 2 }, 'g', ['LM3'], 'กลาง', false, '23.473(g) เดิม'),
      part23_reserve_drop_factor: L(1.44, 'x drop height', ['LM3'], 'กลาง', false, '23.727 เดิม'),
    },
  };

  // ───────── wind + input
  const legA = leg?.legacy?.aero;
  const daMaxRad = 17.5 * Math.PI / 180, clda = corr('Clda').cruise;
  let excess = null;
  if (leg) { const lp = leg.legacy.propulsion, V = iasToCas('30', 60) * KT, q = 0.5 * 1.225 * V * V, W = w.MTOW * 9.80665, CL = W / (q * g.S), Vc = lp.eta * lp.P / lp.T0;
    const T = lp.T0 * Vc / Math.sqrt(V * V + Vc * Vc), Dd = q * g.S * (legA.CD0 + legA.CDflap + legA.K * (CL - 0.15) ** 2); excess = (T - Dd) / W; }
  c.wind = {
    wake: {
      b0_over_b: L(0.7854, '-', ['LC10'], 'กลาง', false, 'π/4 ปีกวงรี'),
      trainerRollControl: E({ Clda: clda, daMax_deg: 17.5, ClMax: r(clda * daMaxRad, 3) }, '-', ['LF2', 'LF0'], 'อำนาจการม้วนสูงสุด Clda × da_max เทียบกับโมเมนต์จาก wake'),
    },
  };
  if (excess != null) c.wind.fFactor = { trainerExcessTW: E(r(excess, 3), '-', ['LF0'], '(T − D)/W ที่ approach แฟลป 30 61 KCAS คันเร่งเต็ม MTOW จากค่า legacy (เกณฑ์ F-factor windshear)') };
  c.input = { keyboard: {
    interim_trim_rate_elevator: E(0.5, 'deg/s', ['LC10'], 'ค่าของรอบที่ 1'),
    flap_notches: E(dets.map(d => d.f_lift), 'สัดส่วน AC.flaps', ['LF1', 'LF0'], 'ขั้น 0/10/20/30° แปลงด้วย flapMap แบบ lift'),
  } };

  // ───────── _na
  const naNot = ['turboprop.*', 'turbofan.*', 'propeller.engineInterface.rpmGoverned', 'propeller.engineInterface.rpmTransientLimit', 'propeller.engineInterface.flightIdleShaftPower', 'propeller.governor.*', 'propeller.betaReverse.*', 'propeller.feathered.*',
    'gear.strut_main.p_static', 'gear.strut_main.piston_area', 'gear.strut_main.ratio_static_to_extended', 'gear.strut_main.ratio_compressed_to_extended', 'gear.strut_main.polytropic_n_dynamic', 'gear.strut_main.polytropic_n_static', 'gear.strut_main.Kh_compression', 'gear.strut_main.Kr_rebound', 'gear.strut_main.seal_friction_ratio',
    'gear.brakes.antiskid_efficiency', 'gear.brakes.antiskid_efficiency_measured', 'gear.brakes.antiskid_slip_setpoint', 'gear.certification.part25_limit_descent', 'gear.certification.part25_friction_cap',
    'controls.reference_types.*', 'controls.roll.tab_max', 'controls.roll.trim_rate', 'controls.yaw.tab_max', 'controls.yaw.trim_rate', 'controls.pitch.derived_check', 'interference.groundEffect.tablesCheck',
    'wind.discreteGust.cfr25_341_Fg', 'wind.wake.leaders', 'numerics.*', 'validation.typicalModes.*', 'validation.currentModel.*', 'otherSims.*'];
  const naLater = ['aero.static_long.alpha_star', 'aero.static_long.alpha_star_neg', 'aero.static_long.a1', 'aero.static_long.CL_sep_at_alpha_star', 'aero.static_long.CDmax_90', 'aero.static_long.dCD_sep', 'aero.static_long.CmX', 'aero.static_long.table_clean',
    'aero.elevator_fade.*', 'aero.separation_dynamics.*', 'aero.buffet.*', 'aero.spin_reference.alpha_spin', 'aero.spin_reference.turn_rate', 'aero.spin_reference.omega_hat', 'aero.spin_reference.descent_trainer',
    'aero.strip_wing.kp_roll', 'aero.strip_wing.tau_aileron',
    'interference.slipstream.hubRadius', 'interference.slipstream.kappa', 'interference.slipstream.immersionH', 'interference.slipstream.immersionV', 'interference.slipstream.kSwirl', 'interference.slipstream.zSwirl', 'interference.slipstream.blownSpanFactor', 'interference.slipstream.blownArea', 'interference.slipstream.kBlown', 'interference.slipstream.k_deda_power',
    'propeller.section.stallBlendM', 'propeller.section.Mdd', 'propeller.tables.CNmu', 'propeller.tables.CMmu',
    'controls.pitch.gearing', 'controls.pitch.Ch0', 'controls.pitch.Ch_alpha', 'controls.pitch.Ch_delta', 'controls.pitch.Ch_tab', 'controls.pitch.trim_rate_flaps_down', 'controls.pitch.trim_rate_flaps_up', 'controls.pitch.breakout', 'controls.pitch.friction', 'controls.pitch.centring_spring', 'controls.pitch.rate_limit',
    'controls.roll.gearing', 'controls.roll.Ch_delta', 'controls.roll.Ch_alpha', 'controls.roll.breakout', 'controls.roll.rate_limit',
    'controls.yaw.gearing', 'controls.yaw.Ch_delta', 'controls.yaw.Ch_beta', 'controls.yaw.slipstream_q_ratio', 'controls.yaw.breakout', 'controls.yaw.rate_limit',
    'gear.strut_nose.p_static', 'gear.strut_nose.piston_area', 'gear.strut_nose.ratio_static_to_extended', 'gear.strut_nose.ratio_compressed_to_extended', 'gear.strut_nose.Kh_compression', 'gear.strut_nose.Kr_rebound',
    'gear.tyre_main.rated_load', 'gear.tyre_main.rated_pressure', 'gear.tyre_main.k_vertical', 'gear.tyre_main.c_vertical', 'gear.tyre_main.cornering_stiffness_coef', 'gear.tyre_main.relaxation_length', 'gear.tyre_main.k_longitudinal', 'gear.tyre_main.mu_peak_dry', 'gear.tyre_main.mu_skid_ratio_dry', 'gear.tyre_main.mu_skid_ratio_wet', 'gear.tyre_main.wheel_inertia',
    'gear.tyre_nose.rated_load', 'gear.tyre_nose.rated_pressure', 'gear.tyre_nose.k_vertical', 'gear.tyre_nose.c_vertical', 'gear.tyre_nose.cornering_stiffness_coef', 'gear.tyre_nose.relaxation_length',
    'gear.brakes.force_limit_ratio', 'gear.brakes.pressure_rise_rate', 'gear.brakes.heat_sink_mass', 'gear.brakes.heat_sink_cool_tau', 'gear.brakes.fade_start_temp', 'gear.brakes.fade_full_temp',
    'gear.steering.steer_rate', 'gear.steering.shimmy_lag', 'wind.wake.rc_over_b'];
  if (excess == null) naLater.push('wind.fFactor.trainerExcessTW');
  c._na = L([...naNot, ...naLater], '-', [], 'สูง', false,
    'ไม่ใช้กับแบบนี้ (กลุ่มแรก ' + naNot.length + ' รายการ): เครื่องลูกสูบใบพัด fixed pitch ไม่มี turboprop/turbofan, governor, feather, reverse; ล้อหลักเป็นขาสปริงเหล็ก (ไม่มี oleo); ไม่มี anti-skid; ไม่ใช่ Part 25; ไม่มี aileron/rudder trim; controls.reference_types และ wind.wake.leaders เป็นค่าของเครื่องโดยสาร; derived_check/tablesCheck/numerics/typicalModes/currentModel เป็นค่าของตัวซิมหรือเครื่องฝึกรอบที่ 1; otherSims เป็นของหัวข้อ 03. '
    + 'เลื่อนไปทำเมื่อจำเป็น (กลุ่มที่สอง ' + naLater.length + ' รายการ): โมเดลแยกตัวหลัง stall, buffet, spin, slipstream ละเอียด, hinge moment/แรงที่คัน, ยางและเบรกละเอียด ไม่มีข้อมูลสาธารณะของ C152; ถ้าต้องใช้ให้ยืมค่าบัตร 04 (C172S) ที่สเกลแล้ว แล้วติดป้ายค่าประมาณ (ดูงานที่แนะนำ §11.15)');
  // gap 16 (19 Nov 2026): performance.tests = the rows of the T-LF table (11.12), from scripts/out/lf_tests.json
  const LFT = rd('lf_tests.json');
  if (LFT) c.performance.tests = testsLeaf(LFT.tests, { src: ['LF1', 'LF2', 'LF5', 'LF6', 'LF8', 'R1:V8'],
    note: 'แถวเดียวกับตาราง T-LF ในหัวข้อ 11.12 สร้างโดย lf_json.mjs จาก scripts/out/lf_tests.json (รัน lf_tests.mjs ก่อน); ค่าคาดหวังมาจาก POH/TCDS/MIL-F-8785C/ฟิสิกส์ตามช่อง origin; tolerance ที่ผู้เขียนตั้งเองบอกไว้ในช่อง tolerance ของแถวนั้น; current_model คือผลของบัตรในฟิสิกส์วันนี้' });
  // gap 18: stick force per g target band from the card's n/α at cruise (lf_card.json), requirement-derived
  const nA = card0?.res?.modes?.cruise?.nAlpha;
  if (nA) c.validation.stick_force_targets = E(stickForceBand({ nAlpha: nA, nL: 4.4, W_lb: 1670 }), 'lbf/g, N/g, g/rad, lbf, lbf/kt, N/kt', ['R1:C12', 'LM3', 'LC14', 'LF1', 'LF0'],
    `ไม่ใช่ค่าที่วัดจาก C152 แต่เป็นแถบเป้าหมายจากเกณฑ์ MIL-F-8785C Level 1 แบบ wheel (controls.requirements.mil8785c_fs_per_g_wheel_L1 ของรอบที่ 1) ด้วย n/α ${r(nA, 3)} g/rad ของบัตรที่ cruise 90 KCAS MTOW และ nL 4.4 (utility category ของ 152) กับพื้นขั้นต่ำของ 14 CFR 23.155 (แรง ≥ 20 lbf); แรงต่อ kt ขั้นต่ำ 1 lbf ต่อ 6 kt ยืมจาก 14 CFR 25.173(c); ซิมวันนี้ไม่มีแบบจำลองแรงที่คันบังคับ จึงทดสอบไม่ได้`);
  // D4: scope by category
  normaliseScopes(c);
  return { card, C, D, cruisePolar, Cm0, Cma, CLa };
}

function CLmax_at(dets, name) { return dets.find(d => d.name === name).CLmax; }

// split by category into blocks and write between markers
export function blocks(card) {
  const id = 'c152', c = card[id];
  const groups = [['airframe', ['airframe']], ['aero', ['aero']], ['interference', ['interference']], ['speeds', ['speeds']], ['performance', ['performance']],
    ['propulsion + piston + propeller', ['propulsion', 'piston', 'propeller']], ['controls', ['controls']], ['gear', ['gear']], ['wind + input + validation', ['wind', 'input', 'validation']], ['_na', ['_na']]];
  const leafLine = (k, v, ind) => `${ind}"${k}": ${JSON.stringify(v)}`;
  const isLeaf = o => o && typeof o === 'object' && 'v' in o && 'scope' in o;
  const ser = (o, ind) => Object.entries(o).map(([k, v]) => isLeaf(v) ? leafLine(k, v, ind) : `${ind}"${k}": {\n${ser(v, ind + ' ')}\n${ind}}`).join(',\n');
  return groups.map(([title, keys]) => { const sub = {}; for (const k of keys) if (c[k]) sub[k] = c[k]; return `**บล็อก ${title}**\n\n\`\`\`json\n{\n "${id}": {\n${ser(sub, '  ')}\n }\n}\n\`\`\``; }).join('\n\n');
}

if (isMainModule(import.meta.url)) {
  const { card } = buildCard();
  const txt = blocks(card);
  for (const b of txt.match(/```json\n([\s\S]*?)```/g)) JSON.parse(b.slice(8, -3));   // fail loudly on a bad block
  if (process.argv.includes('--print')) console.log(txt);
  const md = fs.readFileSync(MD, 'utf8');
  const a = md.indexOf('<!-- LF_JSON_BEGIN -->'), b = md.indexOf('<!-- LF_JSON_END -->');
  if (a < 0 || b < 0) { console.error('markers LF_JSON_BEGIN/END not found in 11-c152.md'); process.exit(1); }
  fs.writeFileSync(MD, md.slice(0, a) + '<!-- LF_JSON_BEGIN -->\n' + txt + '\n' + md.slice(b));
  fs.writeFileSync(path.join(HERE, 'out', 'lf_card_object.json'), JSON.stringify(card));
  console.log('lf_json: wrote', txt.match(/```json/g).length, 'blocks into 11-c152.md');
}
