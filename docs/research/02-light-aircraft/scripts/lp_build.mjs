#!/usr/bin/env node
// lp_build.mjs — LP: assemble the leaf cards pc9m, pc7mk2 (_inherits pc9m), t6a, t6c (_inherits t6a) from the public
// facts and derived numbers in lp_cards.mjs, fit aero.legacy / propulsion.legacy with lm_legacy_fit (01-methods §01.8),
// and write the ```json blocks for 07-turboprop-trainers.md.
//   node scripts/lp_build.mjs [--md scripts/out/lp_json_blocks.md] [--json scripts/out/lp_cards.json]
// trainer_r2 is added by lp_trainer.mjs (needs lm_card results). Run from the repo root. Node >= 18, no dependencies.
import fs from 'node:fs';
import path from 'node:path';
import { HERE, isObj, isLeaf, resolveType, isMainModule } from './lm_lib.mjs';
import { legacyFit } from './lm_legacy_fit.mjs';
import { PUB, R1, r1leaf, L, setp, derive, derivs, geoFor, KT, FT, LB, HP, G0, IN } from './lp_cards.mjs';
import { perfAll } from './lp_perf.mjs';

const r = (x, n = 3) => (typeof x === 'number' ? +x.toFixed(n) : x);
const E = (v, u, src, note = '', o = {}) => L(v, u, src, { conf: 'ต่ำ', est: true, note: ('ค่าประมาณ: ' + note).trim(), ...o });
const H = (v, u, src, note = '', o = {}) => L(v, u, src, { conf: 'สูง', est: false, note, ...o });
const M = (v, u, src, note = '', o = {}) => L(v, u, src, { conf: 'กลาง', est: false, note, ...o });
function adopt(card, p, why = '', o = {}) {
  const l = r1leaf(p); if (!l) throw new Error('no R1 leaf ' + p);
  setp(card, p, { v: o.v ?? l.v, u: o.u ?? l.u, scope: o.scope ?? l.scope, src: (s => (s.length ? s : ['R1:params-trainer.json']))([...(l.src || []).map(s => 'R1:' + s), ...(o.src || [])]), conf: o.conf ?? 'ต่ำ', est: true,
    note: (`ค่าประมาณ: ใช้ค่าคลาสของเครื่องฝึกรอบที่ 1 (ฮาร์ดแวร์คลาสเดียวกัน)` + (why ? '; ' + why : '')).trim() });
}
const C = 'LP27';   // this topic's scripts (lp_cards / lp_build / lp_check)
// D3 (19 Nov 2026): training_mass = {kg, empty_kg, crew_kg, fuel_kg, fuel_l}; empty_kg = airframe.weights.BEW_typical of the card
function tmLeaf(tm, src, rho, mtow) {
  return E({ kg: tm.kg, empty_kg: tm.empty_kg, crew_kg: tm.crew_kg, fuel_kg: tm.fuel_kg, fuel_l: tm.fuel_l }, 'kg (fuel_l L)', src,
    `empty_kg = airframe.weights.BEW_typical (${tm.empty_kg} kg) + ครูและศิษย์ 2 × 95 kg (รวมร่มชูชีพและอุปกรณ์ ค่าประมาณ) + เชื้อเพลิงครึ่งถัง ${tm.fuel_l} L = ${tm.fuel_kg} kg (${rho}); การเทียบ TCDS/POH ใช้ MTOW ${r(mtow, 1)} kg`);
}

export function buildMain(id, d) {
  const T6 = id === 't6a', P = T6 ? PUB.t6a : PUB.pc9m, P9 = PUB.pc9m, dd = T6 ? d.t6a : d.pc9m;
  const card = {};
  const s = (p, l) => setp(card, p, l);
  const SRC = T6 ? ['LP5'] : ['LP2'];
  const MTOW = T6 ? P.MTOW : P9.MTOW;
  const xcg = dd.cgref.x;                                    // m DAT of the reference CG
  const fr = xDat => r(xcg - xDat, 3);                       // m DAT → FRD x (forward positive)

  // ── airframe ──
  s('airframe.identity', T6
    ? M({ manufacturer: 'Raytheon/Hawker Beechcraft, ปัจจุบัน Textron Aviation Defense', model: 'Model 3000 (T-6A Texan II)', variant: 'T-6A (ห้องนักบินแบบเข็ม)', engine: 'P&WC PT6A-68 flat rated 1,100 shp', propeller: 'Hartzell HC-E4A-2 + 4× E9612, 2.46 m', seats: 2, category: 'normal/aerobatic (FAR 23)', tc_ref: 'EASA TCDS IM.A.636 (Model 3000, PM series); FAA type certificate ตาม 14 CFR 23 + special conditions (ยื่นขอ 15 Jan 1996 [LP6]; วันออก TC ยังไม่ได้ตรวจกับเอกสาร FAA)' }, '-', ['LP5', 'LP6', 'LP14'], 'TCDS ของ EASA ครอบคลุม Model 3000 รุ่นส่งออก (MTOW 6,900 lb) ค่าที่เป็นของ T-6A โดยเฉพาะมาจากเอกสารฝึกและ fact sheet')
    : H({ manufacturer: 'Pilatus Aircraft Ltd', model: 'PC-9 M', variant: 'PC-9(M)', engine: 'P&WC PT6A-62 flat rated 950 shp (708 kW)', propeller: 'Hartzell HC-D4N-2A/-2F + 4× D9512A(K), 2.44 m', seats: 2, category: 'acrobatic/utility (FAR 23)', tc_ref: 'FOCA TCDS F 56-32 Issue 4 (2008)' }, '-', ['LP2']));
  if (T6) {
    s('airframe.weights.MTOW', M(r(MTOW, 1), 'kg', ['LP21', 'LP14', 'LB16'], '6,500 lb; TCDS ของ EASA (รุ่น PM series) ให้ 6,900 lb ซึ่งเป็นค่าของ T-6C'));
    s('airframe.weights.MLW', M(r(MTOW, 1), 'kg', ['LP21'], '6,500 lb (เท่า MTOW)'));
    s('airframe.weights.MRW', L(r(P.MRW, 1), 'kg', ['LP20'], { conf: 'ต่ำ', note: '6,550 lb จาก flashcard [LP20] (แหล่งทุติยภูมิ)' }));
    s('airframe.weights.MZFW', L(r(P.MZFW, 1), 'kg', ['LP20'], { conf: 'ต่ำ', note: '5,500 lb จาก flashcard [LP20]' }));
    s('airframe.weights.BEW_typical', M(r(P.BEW, 1), 'kg', ['LP14', 'LP21'], '4,707 lb (Wikipedia อ้าง fact sheet); flashcard ให้ 4,900 lb'));
    s('airframe.weights.max_fuel_usable', H(dd.fuel_kg, 'kg', ['LP5', 'LP21'], '1,100 lb (498.95 kg) ตาม TCDS ข้อ A.III.2 = เติมจุดเดียว (SPR) [LP21]; TCDS ข้อ A.III.9.1 ให้ 2 × 90 gal = 180 gal (681.37 L ≈ 545 kg ที่ 0.80 kg/L ≈ 1,200 lb) ตรงกับการเติมทางปีก 1,200 lb [LP21] — TCDS ให้สองค่า บัตรใช้ 1,100 lb'));
  } else {
    s('airframe.weights.MTOW', H(P9.MTOW, 'kg', ['LP2'], 'acrobatic; utility (มี underwing stores) 3,200 kg'));
    s('airframe.weights.MLW', H(P9.MLW, 'kg', ['LP2'], 'acrobatic; utility 3,100 kg'));
    s('airframe.weights.MRW', H(P9.MRW, 'kg', ['LP2'], 'acrobatic; utility 3,210 kg'));
    s('airframe.weights.MZFW', H(P9.MZFW, 'kg', ['LP2'], ''));
    s('airframe.weights.BEW_typical', M(P9.BEW, 'kg', ['LP13'], 'น้ำหนักเปล่า 1,725 kg (Jane\'s ผ่าน Wikipedia)'));
    s('airframe.weights.max_fuel_usable', H(d.pc9m.fuel_kg, 'kg', ['LP2'], '518 L × 0.806 kg/L (ถังในปีก)'));
  }
  s('airframe.weights.useful_load', L(r(MTOW - (T6 ? P.BEW : P9.BEW), 1), 'kg', [C, ...SRC], { conf: 'กลาง', note: 'MTOW − BEW' }));
  s('airframe.weights.training_mass', tmLeaf(dd.tm, [C, ...(T6 ? ['LP14', 'LP21'] : ['LP13', 'LP2'])], T6 ? 'Jet A 0.80 kg/L' : '0.806 kg/L ตาม TCDS', MTOW));

  s('airframe.cg.datum', T6 ? H('F.S. 0 อยู่หน้า firewall 118.1 in (3.000 m)', '-', ['LP5'], 'firewall อยู่ที่ F.S. 118.1 in ⇒ datum อยู่หน้า firewall 3.000 m เท่ากับของ Pilatus') : H('3,000 mm หน้า firewall', '-', ['LP2']));
  s('airframe.cg.MAC', T6 ? E(P9.MAC, 'm', ['LP2', C], 'TCDS ของ T-6 ไม่ให้ MAC; ใช้ของ PC-9 M เพราะช่วงปีกและพื้นที่ปีกเท่ากัน (10.19 m, 16.28 m²)') : H(P9.MAC, 'm', ['LP2']));
  s('airframe.cg.LEMAC', T6 ? E(P9.LEMAC, 'm DAT', ['LP2', C], 'สมมติเท่า PC-9 M (3,872.5 mm หลัง datum) ใช้แปลง F.S. เป็น %MAC เท่านั้น') : H(P9.LEMAC, 'm DAT', ['LP2'], '3,872.5 mm'));
  if (T6) s('airframe.cg.envelope', M(d.t6a.cg_env, 'kg, m DAT', ['LP5'], 'gear down, fuelled: fwd F.S. 164.67 in @5,850 lb, 165.45 in @6,900–6,950 lb; aft 169.35 in ถึง 6,950 lb (zero fuel: 164.80–169.22 in ≤ 5,850 lb) ≈ ' + d.t6a.cg_env_pct.map(x => `${x[1]}–${x[2]} %MAC`).join(', ') + ' (ถ้า LEMAC เท่า PC-9); ตารางนี้เป็นของ PM series (6,900 lb) ใช้กับ T-6A เป็นค่าใกล้เคียง'));
  else s('airframe.cg.envelope', H(d.pc9m.cg_env, 'kg, m DAT', ['LP2'], 'acrobatic: ≤2,250 kg 22–30 %MAC, 2,350 kg 25–30 %MAC (gear up/down); utility ≤2,350 kg 22–30, 3,200 kg 23–28 %MAC'));
  s('airframe.cg.ref', E({ x: r(xcg, 4), pct_mac: dd.cgref.pct }, 'm DAT', [C, ...SRC], `CG อ้างอิงของ FRD และ inertia = ${dd.cgref.pct} %MAC (กลางช่วง envelope)`));
  s('airframe.inertia.ref_mass', E(r(MTOW, 1), 'kg', [C], 'inertia ข้างล่างคิดที่ MTOW; buildAC สเกลตามมวลด้วยรัศมีไจเรชันคงที่'));
  const I = dd.I;
  s('airframe.inertia.Ixx', E(Math.round(I.Ixx), 'kg m2', ['LM15', C], `Roskam radii คลาส trainer_turboprop Rx ${d.radii.Rx} (01-methods §01.4); ตรวจไขว้ด้วย component build-up ของ PC-9 M ได้ ${d.pc9m.I_buildup.Ixx} ที่ MTOW เชื้อเพลิงเต็ม`));
  s('airframe.inertia.Iyy', E(Math.round(I.Iyy), 'kg m2', ['LM15', C], `Ry ${d.radii.Ry}; build-up ${d.pc9m.I_buildup.Iyy}`));
  s('airframe.inertia.Izz', E(Math.round(I.Izz), 'kg m2', ['LM15', C], `Rz ${d.radii.Rz}; build-up ${d.pc9m.I_buildup.Izz}`));
  s('airframe.inertia.Ixz', E(0, 'kg m2', [C], 'ไม่มีข้อมูล; แกนลำตัวของเครื่องปีกต่ำ Ixz เล็ก'));
  s('airframe.inertia.radii', E({ Rx: d.radii.Rx, Ry: d.radii.Ry, Rz: d.radii.Rz }, '-', ['LM15'], 'ค่าเฉลี่ยคลาส trainer_turboprop จาก JSBSim pc7 และ t6texan2 (n = 2, leave-one-out ผิด 42–91 %)'));
  s('airframe.inertia.method', E('Roskam radii (class trainer_turboprop) + ตรวจด้วย component build-up', '-', ['LM15', C], 'ความไม่แน่นอน ±30 % ต่อแกน'));

  const Sw = T6 ? P.S : P9.S;
  s('airframe.wing.S', T6 ? M(P.S, 'm2', ['LP7'], '175.3 ft² (Textron); Wikipedia ให้ 177.5 ft² (16.49 m²) ขัดกัน') : M(P9.S, 'm2', ['LP13', 'LP10'], '16.29 m² (175.3 ft²); แผ่นแบบของ Pilatus ให้ 16.28 m²'));
  s('airframe.wing.b', T6 ? H(P.b, 'm', ['LP5'], '33 ft 5 in') : M(P9.b, 'm', ['LP10'], '33 ft 5 in จากแผ่นแบบของ Pilatus; Wikipedia ให้ 10.125 m (33 ft 3 in) ขัดกัน'));
  s('airframe.wing.MAC', T6 ? E(P9.MAC, 'm', ['LP2'], 'ใช้ของ PC-9 M') : H(P9.MAC, 'm', ['LP2']));
  s('airframe.wing.AR', L(r(dd.AR, 3), '-', [C], { note: 'b²/S' }));
  s('airframe.wing.taper', E(r(dd.taper, 3), '-', [C], `แก้จาก S, b, MAC ของปีกสี่เหลี่ยมคางหมู: c_root ${r(dd.c_root, 2)} m, c_tip ${r(dd.c_tip, 2)} m`));
  s('airframe.wing.sweep_c4_deg', E(0, 'deg', [C], 'ปีกตรง ไม่มีข้อมูลตัวเลข'));
  s('airframe.wing.dihedral_deg', E(6, 'deg', [C], 'ไม่พบตัวเลขสาธารณะ; เลือกให้ Clβ ใกล้ค่าคลาส (ความเชื่อมั่นต่ำ)'));
  s('airframe.wing.incidence_deg', E(1, 'deg', [C], 'ไม่มีข้อมูล'));
  s('airframe.wing.twist_deg', E(-3, 'deg', ['R1:A1', C], 'washout เท่ารอบที่ 1'));
  s('airframe.wing.airfoil', L({ root: 'PIL15M825', tip: 'PIL12M850' }, '-', ['LP24'], { conf: T6 ? 'กลาง' : 'ต่ำ', est: !T6, note: T6 ? 'หน้าตัดของ Pilatus หนา 15 % / 12 %' : 'ค่าประมาณ: รายการระบุของ T-6 ซึ่งใช้ปีกตระกูล PC-9; ยังไม่ได้ยืนยันกับ PC-9 M' }));
  s('airframe.wing.position', L('low', '-', SRC, { note: 'ปีกต่ำ' }));
  s('airframe.wing.x_c4_root', E(r(geoFor(id, d).fus.x_c4_root, 3), 'm DAT', [C], 'c/4 ของ MAC (ใช้แทนโคนปีกใน lm_derivs)'));
  s('airframe.tail.S_h', E(3.0, 'm2', ['LP10', 'LP11', 'LP25', C], 'จากช่วงหางระดับ 3.66 m กับ AR_h 4.5; JSBSim pc7 (Aeromatic) ให้ 2.82 m²; รอบที่ 1 ถอยได้ 2.96 m²'));
  s('airframe.tail.b_h', M(3.66, 'm', ['LP10', 'LP11'], '12 ft 2 in จากแผ่นแบบ 1:25 ของ Pilatus (ป้ายอ่านจาก PC-7 MKX ซึ่งใช้โครงตระกูลเดียวกัน)'));
  s('airframe.tail.l_h', E(4.9, 'm', [C], 'c/4 MAC ปีก (4.29 m DAT) ถึง c/4 MAC หางระดับ (~9.2 m DAT) ประมาณจากความยาวลำ 10.14 m'));
  s('airframe.tail.S_v', E(2.0, 'm2', ['LP25', C], 'รวม rudder ไม่รวม dorsal/ventral fin; JSBSim pc7 1.66 m²; รอบที่ 1 2.06 m²'));
  s('airframe.tail.b_v', E(1.7, 'm', [C], 'ความสูงครีบจากความสูงเครื่อง 3.26 m'));
  s('airframe.tail.l_v', E(4.7, 'm', [C], 'แขนโมเมนต์หางดิ่ง'));
  s('airframe.tail.z_v', E(0.8, 'm', [C], 'ระยะ c/4 MAC หางดิ่งเหนือแกนลำตัว'));
  s('airframe.tail.airfoil_h', E('ไม่ทราบ (สมมาตร)', '-', [C], 'ไม่มีแหล่งสาธารณะ'));
  s('airframe.tail.airfoil_v', E('ไม่ทราบ (สมมาตร)', '-', [C], 'ไม่มีแหล่งสาธารณะ'));
  s('airframe.tail.incidence_h_deg', E(0, 'deg', [C], 'ไม่มีข้อมูล'));
  s('airframe.surfaces.elevator', E({ area_m2: 1.1, chord_ratio: 0.40, span_fraction: 1 }, 'm2, -', ['R1:params-trainer.json', C], 'เท่ารอบที่ 1'));
  s('airframe.surfaces.aileron', E({ area_m2: 0.65, chord_ratio: 0.25, span_fraction: [0.55, 0.97] }, 'm2, -', ['R1:params-trainer.json', C], 'ต่อข้าง; span_fraction เป็นสัดส่วนครึ่งช่วงปีก'));
  s('airframe.surfaces.rudder', E({ area_m2: 0.85, chord_ratio: 0.40, span_fraction: 1 }, 'm2, -', ['R1:params-trainer.json', C], 'เท่ารอบที่ 1'));
  s('airframe.surfaces.flap', E({ kind: T6 ? 'single-slotted? (ไม่ยืนยัน)' : 'split (ไม่ยืนยัน)', chord_ratio: 0.25, span_fraction: [0.12, 0.55] }, '-', [C], 'ไม่มีแบบสาธารณะ'));
  s('airframe.surfaces.trim_tab', T6 ? H({ elevator_tab: true, rudder_tab: true, aileron: 'biased centering spring (ไม่มี tab)' }, '-', ['LP5']) : H({ elevator_tab: true, rudder_trim_tab: true, rudder_anti_flettner: true, aileron_fixed_tab: true }, '-', ['LP2']));
  s('airframe.geometry.length', T6 ? H(P.L, 'm', ['LP5'], '33 ft 4 in') : M(P9.L, 'm', ['LP13'], '33 ft 3 in'));
  s('airframe.geometry.span', T6 ? H(P.b, 'm', ['LP5']) : M(P9.b, 'm', ['LP10']));
  s('airframe.geometry.height', T6 ? H(P.H, 'm', ['LP5'], '10 ft 8 in') : M(P9.H, 'm', ['LP10', 'LP13'], '10 ft 8 in'));
  s('airframe.geometry.wheelbase', T6 ? H(P.wheelbase, 'm', ['LP5'], '7 ft 7 in') : M(2.31, 'm', ['LP10', 'LP9'], '7 ft 7 in (ตัวเลขในแผ่นแบบไม่มีป้าย จับคู่กับ TCDS ของ T-6)'));
  s('airframe.geometry.main_track', T6 ? H(P.track, 'm', ['LP5'], '8 ft 4 in') : M(2.54, 'm', ['LP10', 'LP9'], '8 ft 4 in'));
  s('airframe.geometry.fuselage_width', T6 ? H(P.fusW, 'm', ['LP5'], '38 in') : M(P9.fusW, 'm', ['LP10', 'LP11'], '3 ft 2 in'));
  s('airframe.geometry.fuselage_height', E(1.5, 'm', [C], 'รวมหลังคาครอบห้องนักบิน'));
  s('airframe.geometry.prop_clearance', E(0.25, 'm', [C], 'ไม่มีข้อมูล'));
  const seat = P9.seats[0];
  s('airframe.geometry.eye_pos_FRD', E([fr(seat), 0, -0.95], 'm FRD', ['LP2', C], `ที่นั่งหน้า ${T6 ? '(สมมติตำแหน่งเท่า PC-9 M)' : ''} 4,061 mm DAT; ที่นั่งเรียงหน้า-หลัง y = 0; ตาสูงกว่า CG 0.95 m`));
  s('airframe.geometry.eye_height_static', E(2.2, 'm', [C], 'CG สูง 1.25 m + 0.95 m'));

  // ── aero ──
  const D = derivs(id, d, MTOW, 200, T6 ? 105 : 95);
  const dc = D.out.cruise, da = D.out.approach;
  s('aero.ref.S', T6 ? M(P.S, 'm2', ['LP7']) : M(P9.S, 'm2', ['LP13']));
  s('aero.ref.b', T6 ? H(P.b, 'm', ['LP5']) : M(P9.b, 'm', ['LP10']));
  s('aero.ref.c', T6 ? E(P9.MAC, 'm', ['LP2'], 'MAC ของ PC-9 M') : H(P9.MAC, 'm', ['LP2'], 'MAC'));
  const names = ['CLq', 'CLadot', 'CLde', 'CYb', 'CYdr', 'CYr', 'Clb', 'Clp', 'Clr', 'Clda', 'Cldr', 'Cmq', 'Cmadot', 'Cmde', 'Cnb', 'Cnp', 'Cnr', 'Cnda', 'Cndr'];
  const lowConf = new Set(['Cnb', 'Cnr', 'Clda', 'Cnda', 'Cnp', 'Clr']);
  for (const n of names) s('aero.derivatives.' + n, E({ cruise: r(dc.body[n], 4), approach: r(da.body[n], 4) }, '1/rad', ['LM10', 'LM11', 'LM12', C], `lm_derivs จากรูปทรงประมาณ (cruise 200 kt, approach ${da.V_kt} kt, MTOW) แกนลำตัว; รอบที่ 1 = ${r1leaf('aero.derivatives.' + n)?.v ?? '–'}${lowConf.has(n) ? '; สูตรนี้ผิด 14–160 % ในการตรวจของ 01-methods' : ''}`));
  const pol = d.t6a.polar;
  s('aero.derivatives.CD0', E({ clean: r(pol.CD0, 5) }, '-', [C, 'LP16', 'LP19', 'LP20'], `polar พาราโบลา (รอบ CL 0) จากการร่อน T-6: 125 KIAS ที่ ~6,000 lb, sink 1,100–1,350 fpm ⇒ L/D ${d.t6a.glideLD.central} (ช่วง ${d.t6a.glideLD.low}–${d.t6a.glideLD.high}); รวมแรงต้านใบพัด feather; ค่า clean ไม่รวมใบพัดจากความเร็วสูงสุด ≈ ${d.cruise.pc9m_276_2000ft.CD0_clean}–${d.cruise.t6a_270_1000ft.CD0_clean}`));
  s('aero.derivatives.K', E({ clean: r(pol.K, 5) }, '-', [C], `e = ${r(pol.e, 3)}; lm_derivs ให้ e ${r(dc.e, 3)} (ไม่รวมใบพัด)`));
  s('aero.static_long.CL0', E({ UP: 0.25, TO: 0.55, LDG: 0.80 }, '-', ['R1:A1', C], 'CL ที่ α 0 (แกนลำตัว) ปีก PIL15 โค้ง α0L ≈ −2° กับ incidence 1°; แฟลปตาม aero.flaps.detents'));
  s('aero.static_long.CLalpha', E(r(dc.static.CLalpha, 3), '1/rad', ['LM10', C], `lm_derivs ทั้งลำ (ปีก ${r(dc.static.CLaW, 2)}, หาง ${r(dc.static.CLaH, 2)}, dε/dα ${r(dc.static.deda, 3)}); รอบที่ 1 = 4.8`));
  s('aero.static_long.Cm0', E({ UP: 0.045, TO: -0.005, LDG: -0.055 }, '-', ['R1:A1', C], 'เท่ารอบที่ 1 (CG 25 %MAC); ไม่มีข้อมูล trim สาธารณะ'));
  s('aero.static_long.Cmalpha', E(r(dc.static.Cmalpha, 3), '1/rad', ['LM10', 'LM12', C], `CG ${dd.cgref.pct} %MAC, h_n ${r(dc.static.h_n, 3)}, static margin ${r(dc.static.static_margin, 3)}; รอบที่ 1 = −0.72`));
  const CLs = d.stallCL;
  if (T6) s('aero.static_long.CLmax_target', E({ UP: CLs.t6a_UP.CLmax_1g, LDG: CLs.t6a_LDG.CLmax_1g }, '-', ['LP29', 'LM1', C], `จาก VS1/VS0 82/74 KIAS ที่ 6,300 lb ISA SL [LP29] โดยถือ KIAS = KCAS (ไม่มี PEC สาธารณะ ดู speeds.ias_cas) และนิยามความเร็วต่ำสุด nz 0.95 ⇒ CL ปรากฏ ${CLs.t6a_UP.CLapp}/${CLs.t6a_LDG.CLapp}; แทนค่าเดิมที่ยืม CLmax ของ PC-9 M (${CLs.pc9m_UP.CLmax_1g}/${CLs.pc9m_LDG.CLmax_1g}) (ตรวจความครบถ้วน 19 พ.ย. 2026)`, { conf: 'กลาง' }));
  else s('aero.static_long.CLmax_target', M({ UP: CLs.pc9m_UP.CLmax_1g, LDG: CLs.pc9m_LDG.CLmax_1g }, '-', ['LP2', 'LM1', C], `จาก TCDS 77/69 KCAS ที่ 2,350 kg (ความเร็วต่ำสุด, nz 0.95 ⇒ CL ปรากฏ ${CLs.pc9m_UP.CLapp}/${CLs.pc9m_LDG.CLapp}); PC-9 รุ่นแรก 79/70 kt EAS ที่ 2,250 kg ให้ ${CLs.pc9_UP.CLmax_1g}/${CLs.pc9_LDG.CLmax_1g}`));
  const CU = T6 ? CLs.t6a_UP : CLs.pc9m_UP, CD = T6 ? CLs.t6a_LDG : CLs.pc9m_LDG;
  s('aero.flaps.detents', E([
    { name: 'UP', flap_deg: 0, VFE_kt: null, dCL0: 0, dCD0: 0, dCm0: 0, CLmax: CU.CLmax_1g },
    { name: 'TO', flap_deg: 23, VFE_kt: 150, dCL0: 0.30, dCD0: 0.020, dCm0: -0.05, CLmax: r((CU.CLmax_1g + CD.CLmax_1g) / 2 + 0.03, 4) },
    { name: 'LDG', flap_deg: 50, VFE_kt: 150, dCL0: 0.55, dCD0: 0.060, dCm0: -0.10, CLmax: CD.CLmax_1g }],
    '-', [...SRC, T6 ? 'LP29' : 'LP2', C], `ชื่อขั้น UP/TO/LDG ตามคู่มือ (D6); มุมแฟลป 23°/50° และ VFE 150 kt จาก TCDS; CLmax ของ UP/LDG จากความเร็ว stall ${T6 ? 'ของ T-6A [LP29]' : 'ของ PC-9 M [LP2]'}; dCL0/dCD0/dCm0 และ CLmax ของ TO เป็นค่าประมาณ (dCL0 ของ LDG เท่ารอบที่ 1 = 0.55)`));
  s('aero.flaps.transition_time_s', E(6, 's', [C], 'ไม่มีข้อมูล; เท่าเวลาล้อ 6 s ของ T-6 [LP21]'));
  s('aero.gear_drag.dCD0', E(0.020, '-', ['R1:A1', C], 'เท่ารอบที่ 1; ไม่มีข้อมูลรายแบบ'));
  s('aero.static_long.alpha_star_neg', E({ UP: 13, LDG: 9 }, 'deg', ['R1:A1'], 'เท่ารอบที่ 1'));
  for (const p of ['aero.static_long.a1', 'aero.static_long.CL_sep_at_alpha_star', 'aero.static_long.CDmax_90', 'aero.static_long.dCD_sep', 'aero.static_long.CmX',
    'aero.elevator_fade.alpha_t_star', 'aero.elevator_fade.a_t', 'aero.elevator_fade.floor', 'aero.separation_dynamics.tau1', 'aero.separation_dynamics.tau2', 'aero.large_beta.CY_crossflow',
    'aero.strip_wing.kp_roll', 'aero.buffet.vertical_filter', 'aero.buffet.lateral_filter', 'aero.buffet.rms_full'])
    adopt(card, p, p.endsWith('CDmax_90') ? 'AR เท่ากัน (6.38)' : p.includes('tau') ? 'คอร์ดเท่ากัน 1.65 m' : '');
  s('aero.strip_wing.taper', E(r(dd.taper, 3), '-', [C], 'เท่า airframe.wing.taper'));
  s('aero.strip_wing.dihedral_eff', E(6, 'deg', [C], 'เท่า airframe.wing.dihedral_deg'));
  s('aero.strip_wing.washout', E(3, 'deg', ['R1:A1'], 'เท่ารอบที่ 1'));
  s('aero.strip_wing.tau_aileron', E(0.26, '-', ['R1:A1'], 'เท่ารอบที่ 1 (ปรับใหม่เมื่อ Clda ของบัตรนี้ถูกใช้)'));
  s('aero.strip_wing.aileron_span_frac', E([0.55, 0.97], '-', [C], 'ไม่มีแบบสาธารณะ'));
  s('aero.stall_warning.min_margin', T6 ? M({ shaker_kt: [5, 10], natural_buffet_kt: 3 }, 'kt', ['LP19', 'LP20'], 'stick shaker 5–10 kt เหนือ stall (15–16 AOA units), buffet ธรรมชาติราว 3 kt เหนือ stall; แหล่งทุติยภูมิ') : E(5, 'kt', ['R1:A22'], '14 CFR 23.207(c) ก่อน amdt 23-64'));
  s('aero.buffet.onset_margin_kt', T6 ? L(3, 'kt', ['LP19'], { conf: 'ต่ำ', note: 'natural stall warning ~3 kt เหนือ stall ชัดเมื่อไม่ประสานแป้น' }) : E(3, 'kt', ['LP19'], 'ใช้ค่าของ T-6'));
  s('aero.spin_reference.alpha_spin', E([35, 50], 'deg', [C, 'LP19'], 'T-6: AOA ≥ 18 units ระหว่าง spin (หน่วย AOA ไม่ใช่องศา); ช่วงองศาประมาณจากเครื่องปีกต่ำของ NASA ที่ปรับลงเพราะ spin ของ T-6 ชัน (ความเร็ว 120–135 KIAS)'));
  s('aero.spin_reference.turn_rate', L(d.spin.turn_rate_dps, 'deg/s', ['LP19', 'LP20'], { conf: 'ต่ำ', note: T6 ? '2–3 s ต่อรอบ (360°/3 s ถึง 360°/2 s)' : 'ค่าประมาณ: ใช้ค่าของ T-6 (2–3 s ต่อรอบ [LP19]) เป็นค่าคลาส เพราะไม่มีข้อมูล spin สาธารณะของ PC-9 M', est: !T6 }));
  s('aero.spin_reference.omega_hat', E(d.spin.omega_hat, '-', [C, 'LP19'], 'Ω b/(2V) ที่ 15,000 ft, 120–135 KIAS, 2–3 s ต่อรอบ'));
  s('aero.spin_reference.descent_trainer', L(d.spin.descent_fpm, 'fpm', ['LP19', 'LP20'], { conf: 'ต่ำ', est: !T6, note: (T6 ? '' : 'ค่าประมาณ: ใช้ค่าของ T-6 เป็นค่าคลาส; ') + '400–500 ft ต่อรอบ ที่ 2–3 s ต่อรอบ (400 ft/3 s ถึง 500 ft/2 s)' }));
  s('aero.spin_reference.IYMP', E(r((I.Ixx - I.Iyy) / (MTOW * P.b * P.b) , 4), '-', [C], '(Ixx − Iyy)/(m b²) จาก inertia ประมาณ'));
  s('aero.spin_reference.recovery_turns_max', M(T6 ? { aggravated_limit_turns: 2, recovery_alt_loss_ft_per_turn: 500, dive_recovery_ft: [1500, 2000] } : 1.5, T6 ? 'turn, ft' : 'turn', T6 ? ['LP18', 'LP19'] : ['R1:params-trainer.json'], T6 ? 'spin เกิน 2 รอบ (aggravated) ห้าม; เสียความสูงราว 500 ft ต่อรอบระหว่างกู้ + 1,500–2,000 ft ดึงออกจากดิ่ง; ห้าม spin ต่ำกว่า 10,000 ft หรือสูงกว่า 22,000 ft PA' : 'FAR 23.221 (acrobatic): กู้ได้ภายใน 1.5 รอบ'));

  // ── interference ──
  s('interference.downwash.deda', E(r(dc.static.deda, 3), '-', ['LM10', C], 'DATCOM ผ่าน lm_derivs'));
  s('interference.downwash.eps0', E(0, 'rad', ['R1:params-trainer.json'], 'เท่ารอบที่ 1'));
  s('interference.downwash.l_t', E(4.9, 'm', [C], 'เท่า airframe.tail.l_h'));
  s('interference.downwash.VH', E(r(dc.static.VH, 3), '-', [C], 'S_h l_t/(S c)'));
  s('interference.downwash.a_t', E(r(dc.static.CLaH, 2), '1/rad', ['LM10', C], 'หางระดับ AR 4.5'));
  s('interference.downwash.eta_t', E(0.9, '-', ['R1:U11', 'R1:U17'], 'เท่ารอบที่ 1'));
  s('interference.downwash.CLadot', E(r(dc.body.CLadot, 3), '1/(rad·c/2V)', ['LM10', C]));
  s('interference.downwash.Cmadot', E(r(dc.body.Cmadot, 3), '1/(rad·c/2V)', ['LM10', C]));
  s('interference.groundEffect.rMac', E([r((dd.cgref.pct - 25) / 100 * P9.MAC, 3), r(dd.yMAC, 2), 0.3], 'm FRD (y ใช้ ±)', [C], 'c/4 ของ MAC เทียบ CG อ้างอิง; ปีกต่ำ z +0.3 m'));
  s('interference.groundEffect.CLa_w', E(r(dc.static.CLaW, 2), '1/rad', ['LM10', C]));
  s('interference.groundEffect.A', L(r(dd.AR, 3), '-', [C], { note: 'b²/S' }));
  adopt(card, 'interference.groundEffect.rEps', 'AR 6.37 เท่ารอบที่ 1 (6.38)');
  adopt(card, 'interference.groundEffect.tablesCheck', 'AR เท่ากัน');
  s('interference.slipstream.diskDiameter', T6 ? H(P.propD, 'm', ['LP5'], '97 in') : H(P9.propD, 'm', ['LP2'], '95–96 in'));
  s('interference.slipstream.hubRadius', E(0.25, 'm', ['R1:params-trainer.json'], 'เท่ารอบที่ 1', { scope: 'propeller' }));
  const hub = [r(xcg - 0.45, 2), 0, -0.05];
  s('interference.slipstream.hubPos', E(hub, 'm FRD', [C], 'ระนาบใบพัดสมมติที่ 0.45 m DAT (datum อยู่ใกล้ปลาย spinner)'));
  s('interference.slipstream.sense', H(1, '-', ['LP5'], 'หมุนตามเข็มนาฬิกาเมื่อมองจากด้านเครื่องยนต์ (จากด้านหลัง)', { scope: 'propeller', conf: T6 ? 'สูง' : 'กลาง' }));
  for (const p of ['kappa', 'immersionH', 'immersionV', 'kSwirl', 'zSwirl', 'finLiftSlope', 'eta_v', 'blownSpanFactor', 'kBlown', 'k_deda_power']) adopt(card, 'interference.slipstream.' + p);
  s('interference.slipstream.finArea', E(2.0, 'm2', [C], 'เท่า airframe.tail.S_v'));
  s('interference.slipstream.finArm', E(4.7, 'm', [C], 'เท่า airframe.tail.l_v'));
  s('interference.slipstream.blownArea', E(r((0.9 * (T6 ? P.propD : P9.propD) - (T6 ? P.fusW : P9.fusW)) * dd.c_root, 2), 'm2', [C], '(0.9 D − ความกว้างลำตัว) × คอร์ดโคน'));

  // ── propeller ──
  s('propeller.identity.kind', H('constant_speed_feathering', '-', SRC, '', { scope: 'propeller' }));
  s('propeller.identity.model', T6 ? H('Hartzell HC-E4A-2 / E9612', '-', ['LP5'], '', { scope: 'propeller' }) : H('Hartzell HC-D4N-2A หรือ -2F / D9512A(K)', '-', ['LP2'], '', { scope: 'propeller' }));
  s('propeller.identity.nBlades', H(4, '-', SRC, '', { scope: 'propeller' }));
  s('propeller.identity.diameter', T6 ? H(P.propD, 'm', ['LP5'], '97 in', { scope: 'propeller' }) : H(P9.propD, 'm', ['LP2'], 'สูงสุด 96 in ต่ำสุด 95 in', { scope: 'propeller' }));
  s('propeller.identity.sense', H(1, '-', T6 ? ['LP5'] : ['LP2', 'R1:params-trainer.json'], T6 ? 'clockwise viewed from engine side' : 'PT6A ใบพัดหมุนตามเข็มเมื่อมองจากด้านหลัง (ตามรอบที่ 1)', { scope: 'propeller', conf: T6 ? 'สูง' : 'กลาง' }));
  if (T6) adopt(card, 'propeller.identity.massComplete', 'ใบพัดคนละรุ่น (E9612)'); else adopt(card, 'propeller.identity.massComplete', 'ใบพัดรุ่นเดียวกัน HC-D4N/D9512', { conf: 'กลาง' });
  s('propeller.identity.hubPosition', E(hub, 'm FRD', [C], 'เท่า interference.slipstream.hubPos'));
  s('propeller.identity.thrustAxis', E([1, 0, 0], '-', [C], 'ไม่มีข้อมูล right/down thrust'));
  const Pkw = T6 ? r(1100 * HP / 1e3, 1) : 708;
  s('propeller.engineInterface.maxShaftPower', H(Pkw, 'kW', SRC, T6 ? '1,100 shp take-off = max continuous' : '950 shp take-off = max continuous', { scope: 'engine' }));
  s('propeller.engineInterface.rpmGoverned', H(2000, 'rpm', SRC, '', { scope: 'engine' }));
  s('propeller.engineInterface.rpmTransientLimit', H(T6 ? 2200 : 2205, 'rpm', SRC, '20 s', { scope: 'engine' }));
  adopt(card, 'propeller.engineInterface.gearRatio', T6 ? 'PT6A-68 ใช้ power turbine รอบใกล้เคียง (ไม่ยืนยัน)' : 'PT6A-62 รุ่นเดียวกัน', { conf: T6 ? 'ต่ำ' : 'กลาง' });
  adopt(card, 'propeller.engineInterface.flightIdleShaftPower');
  for (const p of ['bladeGeometry.hubRadiusRatio', 'bladeGeometry.chordOverD', 'bladeGeometry.twistDesignJ', 'bladeGeometry.activityFactor', 'section.liftSlope', 'section.alpha0', 'section.alphaStallPos',
    'section.alphaStallNeg', 'section.stallBlendM', 'section.cd0', 'section.kcd', 'section.Mdd', 'section.stallDelayFactor', 'tables.CT', 'tables.CP', 'tables.CNmu', 'tables.CMmu', 'inertia.Ip', 'inertia.IreflectedEngine',
    'governor.kGov', 'governor.pitchRateMax', 'governor.rpmOverspeed', 'governor.oilMinRpm', 'governor.featherRate', 'feathered.bladePlanformArea', 'feathered.CDfeathered', 'checks.peakEfficiency'])
    adopt(card, 'propeller.' + p, T6 ? 'BEM ของใบ 2.44 m ใช้กับใบ 2.46 m ของ T-6 เป็นค่าประมาณ' : 'BEM ของรอบที่ 1 สร้างสำหรับ HC-D4N/D9512 2.44 m รุ่นเดียวกัน');
  s('propeller.governor.betaFlightIdle', T6 ? E(d.prop.beta75_minPitch_pc9m, 'deg @0.75R', ['LP2', C], 'ไม่มีข้อมูล T-6; ใช้ของ PC-9 M', { scope: 'propeller' }) : H(d.prop.beta75_minPitch_pc9m, 'deg @0.75R', ['LP2', C], 'min pitch 14° ที่สถานี 30 in แปลงเป็น 0.75R ด้วย tanβ ∝ 1/r', { scope: 'propeller' }));
  s('propeller.governor.betaFeather', T6 ? E(d.prop.beta75_feather, 'deg @0.75R', ['LP2', C], 'ใช้ของ PC-9 M', { scope: 'propeller' }) : H(d.prop.beta75_feather, 'deg @0.75R', ['LP2', C], 'feather 86° ที่สถานี 30 in', { scope: 'propeller' }));
  s('propeller.betaReverse.reverseAvailable', H(false, '-', SRC, 'ไม่มี reverse/beta บนพื้น (เครื่องฝึก)', { scope: 'propeller', conf: 'กลาง' }));
  const T0ideal = T6 ? d.T0.t6a_ideal : d.T0.pc9m_ideal, T055 = T6 ? d.T0.t6a_FM055 : d.T0.pc9m_FM055;
  s('propeller.checks.momentumIdealStaticISA', L(r(T0ideal / 1000, 2), 'kN', [C], { scope: 'propeller', note: `(2ρA)^(1/3) P^(2/3), D ${T6 ? P.propD : P9.propD} m, ${Pkw} kW` }));
  s('propeller.checks.staticThrustISA', E(r(T055 / 1000, 2), 'kN', [C], 'ทฤษฎีโมเมนตัม FM 0.55 (ค่าเริ่มต้นของ lm_card); BEM ของรอบที่ 1 ที่ 700 kW ได้ 12.36 kN (FM 0.58)', { scope: 'propeller' }));
  s('propeller.checks.staticThrustVTBD31C', E(r(T055 / 1000 * Math.pow(1.160 / 1.225, 1 / 3), 2), 'kN', [C], 'สเกล ρ^(1/3) ที่ 31 °C (ρ 1.160) กำลังเต็มเพราะ flat rating', { scope: 'propeller' }));

  // ── turboprop ──
  const tp = (p, l) => s('turboprop.' + p, l);
  tp('ratings.P_rated', H(Math.round(Pkw * 1000), 'W', SRC, T6 ? '1,100 shp (เครื่องยนต์ thermodynamic 1,250 shp ตาม TCDS เครื่องยนต์ [R1:E3])' : '950 shp flat rated (thermodynamic 1,150 shp [LP12])', { scope: 'engine' }));
  tp('ratings.T_flat_C', T6 ? E(42.4, 'degC', ['R1:E3'], 'flat rating ของ PT6A-68 ที่พิกัดเครื่องยนต์ 932 kW; ที่ 820 kW ของ T-6 น่าจะได้กำลังเต็มถึงอุณหภูมิสูงกว่านี้', { scope: 'engine' }) : M(37, 'degC', ['R1:E1'], 'PT6A-62 flat rated ถึง 37 °C', { scope: 'engine' }));
  adopt(card, 'turboprop.ratings.rating_basis', '', { conf: 'กลาง' });
  adopt(card, 'turboprop.ratings.install_loss_frac');
  tp('ratings.Np_max_rpm', H(2000, 'rpm', SRC, '', { scope: 'engine' }));
  tp('ratings.Np_transient_rpm', H(T6 ? 2200 : 2205, 'rpm', SRC, '20 s', { scope: 'engine' }));
  tp('ratings.Q_lim', T6 ? E(d.Q.t6a_fromP_Nm, 'N m', [C, 'LP5'], 'P/ω ที่ 1,100 shp, 2,000 rpm (2,889 lb ft); ห้องนักบินแสดงเป็น % torque (100 % = take-off) [LP18]', { scope: 'engine' }) : H(d.Q.pc9m_TCDS_Nm, 'N m', ['LP3', 'LP2'], '2,495 lb ft (67.4 psi) ที่ 2,000 rpm = 950 shp', { scope: 'engine' }));
  tp('ratings.Ng_100pct_rpm', H(37468, 'rpm', SRC, '', { scope: 'engine' }));
  tp('ratings.Ng_max_pct', H(104, '%', SRC, '', { scope: 'engine' }));
  tp('ratings.ITT_max_C', H(T6 ? 820 : 800, 'degC', SRC, T6 ? 'transient 821–870 °C 20 s [LP18]' : 'max cruise 775 °C; transient 870 °C 20 s', { scope: 'engine' }));
  tp('ratings.ITT_start_C', H(1000, 'degC', SRC, '5 s', { scope: 'engine' }));
  tp('ratings.takeoff_time_limit_s', H('ไม่จำกัด (take-off = max continuous)', 's', SRC, '', { scope: 'engine' }));
  tp('steady_map.Ng_GI_pct', T6 ? M(60.5, '%', ['LP18', 'LP5'], 'ground idle 60–61 % N1 (pressurization) [LP18]; TCDS: ต่ำสุด 51 %', { scope: 'engine' }) : H(56, '%', ['LP3'], 'idle ต่ำสุด 56 % N1 (PC-9 TCDS)', { scope: 'engine' }));
  tp('steady_map.Ng_FI_pct', T6 ? M(67, '%', ['LP18'], 'N1 idle ต่ำสุดในอากาศ 67 % (บนพื้น 60–61 %) [LP18]; PMU คง Np 80 % ที่ PCL idle เหนือ 10,000 ft pressure altitude [LP19]', { scope: 'engine' }) : E(68, '%', ['R1:params-trainer.json'], 'เท่ารอบที่ 1', { scope: 'engine' }));
  for (const p of ['steady_map.Ng0_pct', 'steady_map.kMap', 'steady_map.Pc_frac_vs_Ngc', 'steady_map.nITT', 'steady_map.ITTc_vs_Pc', 'dynamics.tauAcc_s', 'dynamics.rAcc_pct_s', 'dynamics.tauDec_s', 'dynamics.rDec_pct_s',
    'dynamics.tauITT_s', 'dynamics.kITTacc', 'airframe_coupling.I_gg', 'airframe_coupling.gg_rotation_rel_prop', 'fuel.psfc']) adopt(card, 'turboprop.' + p, p === 'fuel.psfc' ? 'ตัวยึดตำแหน่ง; T-6 อัตราการไหลสูงสุด 799 PPH [LP18]' : '');
  adopt(card, 'turboprop.dynamics.cert_accel_FI_to_95pct_max_s', '14 CFR 33.73 ใช้กับเครื่องยนต์ทุกแบบ', { conf: 'กลาง' });
  tp('airframe_coupling.spin', M(1, '-', SRC, 'ใบพัดหมุนตามเข็มจากด้านหลัง ⇒ แรงบิดปฏิกิริยาม้วนซ้าย สอดคล้องกับ roll-off ซ้ายที่ torque > 60 % ของ T-6 [LP19]'));
  tp('airframe_coupling.thrust_axis_body', E([1, 0, 0], '-', [C], 'ไม่มีข้อมูล'));
  const flat = T6 ? 46 : 37, PtoW = Pkw;
  const Pvs = [15, 25, 31, 34, 37, 38, 40, 45].map(t => Math.round(t <= flat ? PtoW : PtoW * (1 - 0.0135 * (t - flat))));
  tp('derived_vtbd.P_avail_vs_OAT_SL', E({ axes: { OAT_C: [15, 25, 31, 34, 37, 38, 40, 45] }, data: Pvs }, 'kW', ['R1:E1', C], `flat rating ถึง ${flat} °C แล้วลด 1.35 %/°C (ความชันเดียวกับตารางรอบที่ 1)${T6 ? '; T-6: 820 kW ต่ำกว่าพิกัดเครื่องยนต์ 932 kW จึงคาดว่า flat ถึงราว 46 °C' : ''}`, { scope: 'engine' }));
  tp('derived_vtbd.P_avail_static_grid', E((r1leaf('turboprop.derived_vtbd.P_avail_static_grid').v.data ? { axes: r1leaf('turboprop.derived_vtbd.P_avail_static_grid').v.axes, data: r1leaf('turboprop.derived_vtbd.P_avail_static_grid').v.data.map(row => row.map(x => Math.round(Math.min(PtoW, x * (T6 ? 932 / 700 : 708 / 700))))) } : null), 'kW', ['R1:E1', C], T6 ? 'ตารางรอบที่ 1 × 932/700 แล้วตัดที่ 820 kW' : 'ตารางรอบที่ 1 × 708/700', { scope: 'engine' }));
  if (T6) s('turboprop.reference_engines.PT6A-68', { ...r1leaf('turboprop.reference_engines.PT6A-68'), src: ['R1:E3'], note: 'EASA TCDS IM.E.038 (พิกัดเครื่องยนต์); ใน T-6 จำกัด 1,100 shp' });
  else s('turboprop.reference_engines.PT6A-62', { ...r1leaf('turboprop.reference_engines.PT6A-62'), src: ['R1:E1', 'R1:E2'], note: 'EASA TCDS IM.E.078; เครื่องยนต์ของ PC-9 M' });

  // ── propulsion ──
  s('propulsion.layout', E([{ id: 1, pos: hub, axis: [1, 0, 0], type: 'turboprop', model: T6 ? 'PT6A-68' : 'PT6A-62', prop_sense: 1 }], 'm FRD', [...SRC, C], 'pos = interference.slipstream.hubPos (ระนาบใบพัดสมมติที่ 0.45 m DAT); แกนแรงขับตามแกนลำตัว (ไม่มีข้อมูล right/down thrust); รุ่นเครื่องยนต์และทิศหมุนใบพัดจาก TCDS', { conf: 'กลาง' }));

  // ── speeds ── (completeness check 19 Nov 2026: one unit per type — Pilatus kt CAS (TCDS), T-6 kt IAS (AOPA [LP29], training
  // material); speeds.ias_cas identity (est); VREF/VAPP at training_mass (D1); VX from lp_perf.mjs; stall_altitude_loss_ft (class est))
  const PF = d.perf, V = d.vref[id], ALC = d.altLossCoef;
  const kc = (v, src, note, conf = 'สูง') => L(v, 'kt CAS', src, { conf, note });
  const idTable = (top, u) => E({ UP: [[50, 50], [top, top]], TO: [[50, 50], [150, 150]], LDG: [[50, 50], [150, 150]] }, u, [C],
    'ไม่มีตาราง PEC (KIAS → KCAS) สาธารณะ ใช้ IAS = CAS ทุกแฟลป (identity) เพื่อให้ lm_card/lm_merge แปลงหน่วยได้; ' + (T6
      ? 'ความเร็วทุกค่าของบัตร t6a/t6c เป็น kt IAS; VS 82/74 KIAS ของ [LP29] ต่ำกว่าค่าที่คิดจาก CL ของ PC-9 M ราว 3 kt (84.9/76.1 kt ที่ 6,300 lb) ซึ่งอาจเป็น PEC ของ T-6 ที่ความเร็วต่ำ (ยังไม่ยืนยัน)'
      : 'TCDS ของ Pilatus ให้ความเร็วเป็น KCAS บัตร pc9m/pc7mk2 จึงเก็บทุกค่าเป็น kt CAS; หัวข้อ 08/09 ที่อ้างเป็น KIAS ถือเท่ากันจนกว่าจะมี PEC'));
  const altLoss = vs1 => Math.round(ALC.mean * vs1 * vs1 / 10) * 10;
  const altLossLeaf = (vs1, u) => E(altLoss(vs1), 'ft', [C, 'LC2', 'LF1', 'LG5'], `ไม่มีค่าใน TCDS/เอกสารสาธารณะ; สัดส่วน h/VS1² ของ POH เครื่องฝึกลูกสูบ (C172S 230 ft/53 KCAS [LC2], C152 160 ft/48 KCAS [LF1], P2006T 180 ft/66 KIAS [LG5]) เฉลี่ย ${ALC.mean} ft/kt² (ช่วง ${ALC.lo}–${ALC.hi}) × VS1 ${vs1} ${u} ที่ MTOW² ⇒ ${altLoss(vs1)} ft (${Math.round(altLoss(vs1) * FT)} m; ช่วง ${Math.round(ALC.lo * vs1 * vs1)}–${Math.round(ALC.hi * vs1 * vs1)} ft) สำหรับ stall ปีกระดับแล้วแก้แบบปกติ; ไม่รวม spin`);
  if (T6) {
    const A = P.aopa, f63 = x => r(x * Math.sqrt(MTOW / d.t6a.m_pub), 1);
    s('speeds.VS1_kt', M(A.VS1, 'kt IAS', ['LP29'], `แฟลป UP ล้อขึ้น idle ที่ 6,300 lb (2,858 kg) ISA SL: ตารางสเปกของผู้ผลิตใน AOPA Pilot (ส.ค. 1997) [LP29] (ผลคำนวณของผู้ผลิต); ที่ MTOW 6,500 lb = ${d.t6a.VS1} kt (สเกล √W); ค่าเดิมของบัตรจาก CL ของ PC-9 M = ${d.t6a.pc9mCL_check.VS1_6300} kt ที่ 6,300 lb; JSBSim t6texan2 82.4 KCAS ที่ 6,000 lb`));
    s('speeds.VS0_kt', M(A.VS0, 'kt IAS', ['LP29'], `แฟลป LDG ล้อลง idle ที่ 6,300 lb ISA SL [LP29]; ที่ MTOW 6,500 lb = ${d.t6a.VS0} kt (สเกล √W); ค่าเดิมจาก CL ของ PC-9 M = ${d.t6a.pc9mCL_check.VS0_6300} kt ที่ 6,300 lb`));
    s('speeds.VX_kt', E(Math.round(PF.t6a.MTOW.Vx_card_kcas), 'kt IAS', [C, 'LP30', 'LP29'], `ไม่มีค่าสาธารณะ; lp_perf.mjs (ใบพัด BEM ของรอบที่ 1 + polar clean): มุมไต่สูงสุดของโมเดลที่ ${PF.t6a.MTOW.Vx_model_keas} kt ต่ำกว่า 1.2 VS1 จึงใช้ 1.2 VS1 = ${PF.t6a.MTOW.Vx_card_kcas} kt ที่ MTOW ตาม 14 CFR 23.65(a)(4) [LP30] (γ ${PF.t6a.MTOW.gamma_at_Vx_card_deg}° เทียบสูงสุด ${PF.t6a.MTOW.gamma_max_deg}°); ที่มวลฝึก ${PF.t6a.training_mass.Vx_card_kcas} kt; IAS = CAS`));
    s('speeds.VR_kt', L(A.VR, 'kt IAS', ['LP29', 'LP15'], { conf: 'กลาง', note: 'VR 85 KIAS ที่ 6,300 lb [LP29]; คู่มือฝึก: takeoff 85 KIAS แฟลป TO pitch 7–10° [LP15]' }));
    s('speeds.VY_kt', L(A.VY, 'kt IAS', ['LP29', 'LP15', 'LP20'], { conf: 'กลาง', note: `VY 140 KIAS ที่ 6,300 lb ISA SL ในตารางสเปกของผู้ผลิต [LP29]; คู่มือฝึกใช้ 140 KIAS เป็นความเร็วไต่หลังขึ้น (140/160/180 KIAS) [LP15][LP20]; โมเดลไต่ BEM ของ lp_perf.mjs ให้ Vy ${PF.t6a.m6300.Vy_keas} kt ที่ 6,300 lb (+${r(PF.t6a.m6300.Vy_keas - A.VY, 1)} kt)` }));
    s('speeds.VG_kt', M(125, 'kt IAS', ['LP16', 'LP19', 'LP20'], 'best glide clean (ใบพัด feather จำลองด้วย torque 4–6 %); ล้อลง 105 KIAS'));
    s('speeds.VREF_kt', E(V.VREF, 'kt IAS', [C, 'LP29', 'LP21'], `1.3 VS0 ที่มวลฝึก ${r(dd.training_mass, 0)} kg (D1): VS0 74 KIAS ที่ 6,300 lb [LP29] × √(${dd.training_mass}/${d.t6a.m_pub}) = ${V.VS0_tm} kt ⇒ ${V.VREF_exact}; on-speed AOA = 1.3 Vs [LP21]; ที่ MTOW 6,500 lb = ${d.icao.t6a} kt; kt IAS = kt CAS (speeds.ias_cas)`));
    s('speeds.VAPP_kt', L(V.VAPP, 'kt IAS', ['LP20', 'LP29', 'LP23'], { conf: 'กลาง', note: `final แฟลป LDG 100 KIAS (flashcard [LP20]; รายงานบินของ AOPA "100 on final" [LP29]) ไม่ระบุมวล บัตรใช้เป็นค่าที่มวลฝึก ${r(dd.training_mass, 0)} kg (D1; VAPP/VREF = ${r(V.VAPP / V.VREF_exact, 3)}); แฟลป TO 105, ไม่มีแฟลป 110 KIAS [LP20]; คู่มือ ATC: approach เฉลี่ย 110 kt [LP23]; ลดราว 1 kt ต่อเชื้อเพลิง 100 lb ที่ใช้ไป [LP21]; แก้มวลเป็น MTOW ≈ ${V.VAPP_at_MTOW} kt; kt IAS = kt CAS (speeds.ias_cas)` }));
    s('speeds.VA_kt', H(227, 'kt IAS', ['LP5', 'LP20'], 'manoeuvring (สมมาตร); asymmetric 177 KIAS'));
    s('speeds.VNE_kt', H(316, 'kt IAS', ['LP5', 'LP18', 'LP30'], 'VMO 316 KIAS / MMO 0.67; เครื่องเทอร์ไบน์ใช้ VMO/MMO แทน VNE/VNO ตาม 14 CFR 23.1505(c) [LP30] จึงไม่มี VNO (อยู่ใน _na); max turbulence penetration 195 KIAS [LP20] เป็นค่าการปฏิบัติ ไม่ใช่ VNO'));
    s('speeds.VFE', H({ TO: 150, LDG: 150 }, 'kt IAS', ['LP5', 'LP18', 'LP29']));
    s('speeds.VLE_kt', H(150, 'kt IAS', ['LP5', 'LP29'])); s('speeds.VLO_kt', H(150, 'kt IAS', ['LP18', 'LP29'], 'gear and/or flaps 150 KIAS'));
    const ms = [6000, 6300, 6500, 6900], sc = (v, lb) => r(v * Math.sqrt(lb / A.m_lb), 1);
    s('speeds.stall_table', E({ mass_lb: ms, UP: ms.map(lb => sc(A.VS1, lb)), LDG: ms.map(lb => sc(A.VS0, lb)) }, 'kt IAS', ['LP29', C], 'แถว 6,300 lb = 82/74 KIAS จาก [LP29] (ข้อเท็จจริง); น้ำหนักอื่นสเกล √W; ปีกระดับ idle; ไม่มีตารางตามมุมเอียงสาธารณะ (ที่มุมเอียง φ คูณ 1/√cos φ)', { conf: 'กลาง' }));
    s('speeds.stall_warning_margin_kt', M([5, 10], 'kt', ['LP19', 'LP20'], 'stick shaker'));
    s('speeds.stall_altitude_loss_ft', altLossLeaf(d.t6a.VS1, 'kt IAS'));
    s('speeds.crosswind_demonstrated_kt', M(A.xwind, 'kt', ['LP29'], 'maximum demonstrated crosswind 24 kt ในตารางสเปกของผู้ผลิต (6,300 lb) [LP29]; ขีดจำกัดการปฏิบัติของผู้ใช้ (แห้ง 25 kt, เปียก 10, น้ำแข็ง 5, touch-and-go 20, ลมท้ายวิ่งขึ้น 10) [LP18] ย้ายไปหัวข้อ 08 ops.crosswind_limits'));
    s('speeds.icao_approach_category', E('B', '-', [C, 'LP29'], `1.3 VS0 ที่ MTOW 6,500 lb = 1.3 × ${d.t6a.VS0} = ${d.icao.t6a} kt (91–120 kt)`));
    s('speeds.ias_cas', idTable(320, 'kt IAS → kt CAS'));
  } else {
    const vy = Math.round(PF.pc9m.MTOW.Vy_keas * d.vyBias);
    s('speeds.VS1_kt', kc(77, ['LP2'], '2,350 kg acrobatic, แฟลปขึ้น; utility 3,200 kg 93 KCAS; PC-9 (EAS) 79 kt ที่ 2,250 kg'));
    s('speeds.VS0_kt', kc(69, ['LP2'], 'แฟลปลง (ล้อลง); utility 85 KCAS; PC-9 70 kt EAS'));
    s('speeds.VA_kt', M(205, 'kt CAS', ['LP2'], 'ที่ 2,350 kg; 170 kt ที่ 1,650 kg (TCDS ไม่ระบุชนิดความเร็ว; PC-9 TCDS ใช้ EAS)'));
    s('speeds.VNE_kt', M(320, 'kt CAS', ['LP2', 'LP30'], 'VMO ถึง 15,000 ft; MMO 0.65; เครื่องเทอร์ไบน์ใช้ VMO/MMO แทน VNE/VNO ตาม 14 CFR 23.1505(c) [LP30] จึงไม่มี VNO (อยู่ใน _na)'));
    s('speeds.VFE', M({ TO: 150, LDG: 150 }, 'kt CAS', ['LP2'], 'VFE = VLO 150 kt'));
    s('speeds.VLO_kt', M(150, 'kt CAS', ['LP2']));
    s('speeds.VLE_kt', E(150, 'kt CAS', ['LP2'], 'TCDS ไม่ระบุ VLE; ใช้ VLO'));
    s('speeds.VREF_kt', E(V.VREF, 'kt CAS', [C, 'LP2'], `1.3 VS0 ที่มวลฝึก ${r(dd.training_mass, 0)} kg (D1): VS0 69 KCAS ที่ 2,350 kg [LP2] × √(${dd.training_mass}/2,350) = ${V.VS0_tm} ⇒ ${V.VREF_exact}; ที่ MTOW ${d.icao.pc9m} kt`));
    s('speeds.VAPP_kt', E(V.VAPP, 'kt CAS', [C], `VREF + 5 kt ที่มวลฝึก ${r(dd.training_mass, 0)} kg แฟลป LDG ล้อลง (D1); แก้มวลเป็น MTOW ≈ ${V.VAPP_at_MTOW} kt`));
    s('speeds.VX_kt', E(Math.round(PF.pc9m.MTOW.Vx_card_kcas), 'kt CAS', [C, 'LP30'], `ไม่มีค่าสาธารณะ; lp_perf.mjs (ใบพัด BEM HC-D4N ของรอบที่ 1 + polar clean): มุมไต่สูงสุดของโมเดลที่ ${PF.pc9m.MTOW.Vx_model_keas} kt ต่ำกว่า 1.2 VS1 จึงใช้ 1.2 VS1 = ${PF.pc9m.MTOW.Vx_card_kcas} kt ที่ MTOW ตาม 14 CFR 23.65(a)(4) [LP30] (γ ${PF.pc9m.MTOW.gamma_at_Vx_card_deg}° เทียบสูงสุด ${PF.pc9m.MTOW.gamma_max_deg}°); ที่มวลฝึก ${PF.pc9m.training_mass.Vx_card_kcas} kt`));
    s('speeds.VR_kt', E(78, 'kt CAS', [C], 'ไม่มีค่าสาธารณะ; ≈ 1.05 × VS แฟลป TO (ประมาณ 74 kt)'));
    s('speeds.VY_kt', E(vy, 'kt CAS', [C, 'LP29'], `ไม่มีค่าสาธารณะ; lp_perf.mjs ให้ Vy ${PF.pc9m.MTOW.Vy_keas} kt ที่ MTOW (${PF.pc9m.training_mass.Vy_keas} ที่มวลฝึก) คูณ ${d.vyBias} ซึ่งเป็นอัตราส่วน VY 140 KIAS ของ T-6A [LP29] ต่อ Vy ของโมเดลเดียวกันที่ 6,300 lb (${PF.t6a.m6300.Vy_keas}) ⇒ ${vy} kt; ค่าเดิม 125 kt (สเกล √(W/S) จาก T-6) ต่ำไป; เส้น ROC แบน: ±10 kt เสีย ROC < 2 %`));
    s('speeds.VG_kt', E(d.pc9m.glideV, 'kt CAS', [C], 'จาก polar คลาส (CL* ' + r(Math.sqrt(pol.CD0 / pol.K), 3) + ') ที่ 2,350 kg'));
    s('speeds.stall_table', H({ acrobatic_2350kg: { UP: 77, LDG: 69 }, utility_3200kg: { UP: 93, LDG: 85 } }, 'kt CAS', ['LP2'], 'PC-9 (F 56-22): 2,250 kg 79/70 kt EAS; PC-9/B 2,500 kg 83/74 kt'));
    s('speeds.stall_warning_margin_kt', E(5, 'kt', ['R1:A22'], '14 CFR 23.207 (เท่ารอบที่ 1)'));
    s('speeds.stall_altitude_loss_ft', altLossLeaf(77, 'kt CAS'));
    s('speeds.icao_approach_category', E('A', '-', [C], `1.3 VS0 = ${d.icao.pc9m} kt (< 91 kt)`));
    s('speeds.ias_cas', idTable(320, 'kt IAS → kt CAS'));
  }

  // ── performance ── (completeness check 19 Nov 2026: AOPA spec table [LP29] for the T-6A distances; VTBD hot-day tables from the
  // lp_perf.mjs factors (ค่าประมาณ); pc9m/pc7mk2 distances from the lm_card runs are added by lp_check.mjs)
  const hot = PF[id].hot, OAT = hot.map(h => h.oat_C);
  const rocTable = (roc0, note) => E({ h_ft: 9, oat_C: OAT, ROC_fpm: hot.map(h => Math.round(roc0 * h.ROC_fpm_MTOW / hot[0].ROC_fpm_MTOW / 10) * 10), ROC_ms: hot.map(h => r(roc0 * h.ROC_fpm_MTOW / hot[0].ROC_fpm_MTOW * FT / 60, 1)) }, 'fpm (m/s)', [C, ...(T6 ? ['LP23'] : ['LP12', 'LP13'])],
    `ความสูงสนาม VTBD 9 ft; ROC_SL_fpm (${roc0} fpm) × อัตราส่วน ROC ของโมเดลไต่ BEM (lp_perf.mjs) ที่ OAT นั้นต่อ 15 °C (กำลังเต็มเพราะ flat rating ถึง ${T6 ? 46 : 37} °C); ไม่มีตาราง POH สาธารณะ; ${note}`);
  if (T6) {
    const A = P.aopa, ft2m = x => Math.round(x * FT), kW2 = (MTOW / d.t6a.m_pub) ** 2, kW1 = MTOW / d.t6a.m_pub;
    s('performance.ROC_SL_fpm', L(3100, 'fpm', ['LP23'], { conf: 'ต่ำ', note: `climb rate เฉลี่ยในคู่มือ ATC (ไม่ระบุน้ำหนัก/ความเร็ว) ใช้เป็นเป้า fit ที่ MTOW (15.7 m/s); ตารางสเปกของผู้ผลิต 1997: 4,000 fpm (20.3 m/s) ที่ 6,300 lb SL ISA [LP29] (ผู้เขียนบินได้เฉลี่ยราว 3,600 fpm ถึง 15,000 ft); GlobalSecurity: initial > 4,500 fpm [LP22]; โมเดลไต่ BEM ของ lp_perf.mjs (ไม่ fit) ให้ ${PF.t6a.MTOW.ROC_fpm} fpm ที่ MTOW และ ${PF.t6a.m6300.ROC_fpm} ที่ 6,300 lb — ค่า 4,000 ต้องการกำลังส่วนเกินมากกว่าโมเดล ${Math.round((A.ROC / PF.t6a.m6300.ROC_fpm - 1) * 100)} % (ดู §07.13)` }));
    s('performance.ROC_table', rocTable(3100, 'มวล MTOW'));
    s('performance.service_ceiling_ft', H(31000, 'ft', ['LP5', 'LP6'], 'ความสูงปฏิบัติการสูงสุด (9,449 m); ตารางสเปก 1997 ให้ service ceiling 35,000 ft [LP29]'));
    s('performance.cruise_table', M([{ h_ft: 1000, ktas: 270, power: 'max', mass_lb: 6000, src: 'LB16' }, { h_ft: 0, ktas: 310, power: 'max', mass_lb: 6300, src: 'LP29', note: 'max level speed SL ผลคำนวณของผู้ผลิต 1997 ขัดกับ 270 KTAS ของ fact sheet' }, { h_ft: null, ktas: 280, note: 'cruise (Wikipedia)', src: 'LP14' }], 'ft, kt TAS', ['LB16', 'LP29', 'LP14'], 'ความเร็วสูงสุดบินระดับ 270 KTAS (139 m/s) ที่ 1,000 ft [LB16] ใช้ fit polar clean ใน lp_perf.mjs; 310 kt ของ [LP29] สูงกว่า 15 % (ดู §07.13)'));
    s('performance.glide', E({ speed_kt: d.t6a.glideV_MTOW, ratio: d.t6a.glideLD.central }, 'kt IAS', ['LP16', 'LP19', 'LP20', C], `125 KIAS ที่ ~6,000 lb สเกลเป็น MTOW; L/D จาก sink 1,100–1,350 fpm ที่ 3,000–9,000 ft ได้ ${d.t6a.glideLD.low}–${d.t6a.glideLD.high} (ใบพัด feather/แรงขับศูนย์)`));
    s('performance.takeoff', M({ ground_roll_m: ft2m(A.TO_gr_ft), over50ft_m: ft2m(A.TO50_ft), mass_kg: d.t6a.m_pub }, 'm', ['LP29', 'LP22'], `1,400 / 2,000 ft ที่ 6,300 lb ISA SL ลมสงบ แฟลป TO (ตารางสเปกของผู้ผลิต [LP29]); สเกลเป็น MTOW 6,500 lb ด้วย (W/W0)² ⇒ ${Math.round(ft2m(A.TO_gr_ft) * kW2)} / ${Math.round(ft2m(A.TO50_ft) * kW2)} m (performance.takeoff_table); takeoff distance 1,775 ft (541 m) ของ [LP22] ไม่ระบุนิยามและน้ำหนัก`));
    s('performance.landing', M({ ground_roll_m: ft2m(A.LD_gr_ft), over50ft_m: ft2m(A.LD50_ft), mass_kg: d.t6a.m_pub, min_runway_rule: 'ground roll + 500 ft หรือ 4,000 ft' }, 'm', ['LP29', 'LP18'], '1,900 / 2,400 ft ที่ 6,300 lb ISA SL ลมสงบ แฟลป LDG [LP29]; เกณฑ์ความยาวทางวิ่งขั้นต่ำของผู้ใช้ ground roll + 500 ft หรือ 4,000 ft (1,219 m) [LP18] ไม่ใช่ระยะ POH'));
    s('performance.takeoff_table', E({ mass_kg: r(MTOW, 1), h_ft: 9, oat_C: OAT, ground_roll_m: hot.map(h => Math.round(ft2m(A.TO_gr_ft) * kW2 * h.takeoff_factor)), over50ft_m: hot.map(h => Math.round(ft2m(A.TO50_ft) * kW2 * h.takeoff_factor)) }, 'm', ['LP29', C],
      `จุด 15 °C = [LP29] (6,300 lb) × (6,500/6,300)²; 31/35 °C คูณตัวคูณวันร้อนของ lp_perf.mjs 1/(σ·T/T_ISA) = ${hot.map(h => h.takeoff_factor).join('/')} (แรงขับ BEM ที่ 0.7 V_LOF, กำลังเต็มเพราะ flat rating); ไม่มีตาราง POH สาธารณะ`));
    s('performance.landing_table', E({ mass_kg: r(MTOW, 1), h_ft: 9, oat_C: OAT, ground_roll_m: hot.map(h => Math.round(ft2m(A.LD_gr_ft) * kW1 * h.landing_factor)), over50ft_m: hot.map(h => Math.round(ft2m(A.LD50_ft) * kW1 * h.landing_factor)) }, 'm', ['LP29', C],
      `จุด 15 °C = [LP29] (6,300 lb) × 6,500/6,300 (V² ∝ W); 31/35 °C คูณ 1/σ = ${hot.map(h => h.landing_factor).join('/')} (ความเร็วจริงสูงขึ้นที่ IAS เท่าเดิม); ไม่มีตาราง POH สาธารณะ`));
    s('performance.fuel', M({ usable_lb: 1100, max_ff_pph: 799, range_nm: 900 }, 'lb, pph, nm', ['LP21', 'LP18', 'LP14'], '499 kg, 362 kg/h, 1,667 km'));
  } else {
    s('performance.ROC_SL_fpm', L(4090, 'fpm', ['LP12', 'LP13'], { conf: 'ต่ำ', note: `best ROC ที่ระดับน้ำทะเล 20.8 m/s (โบรชัวร์/Jane's ไม่ระบุน้ำหนัก); โมเดลไต่ BEM ของ lp_perf.mjs ให้ ${PF.pc9m.MTOW.ROC_fpm} fpm ที่ MTOW และ ${PF.pc9m.training_mass.ROC_fpm} ที่มวลฝึก ${r(dd.training_mass, 0)} kg จึงน่าเป็นค่าที่น้ำหนักฝึก; ใช้เป็นเป้า fit ที่ MTOW ตามเดิม (ดู §07.13)` }));
    s('performance.ROC_table', rocTable(4090, 'มวลเดียวกับ ROC_SL_fpm (ไม่ระบุ)'));
    s('performance.service_ceiling_ft', H(25000, 'ft', ['LP2'], 'ความสูงปฏิบัติการสูงสุด 7,620 m (Jane\'s ผ่าน Wikipedia ให้เพดาน 37,990 ft)'));
    s('performance.cruise_table', L([{ h_ft: 2000, ktas: 276, power: 'max' }, { h_ft: 20000, ktas: 301, power: 'max' }], 'ft, kt TAS', ['LP12'], { conf: 'ต่ำ', note: 'max level speed ISA (ข้อความโบรชัวร์ที่เผยแพร่ซ้ำ) 142/155 m/s' }));
    s('performance.glide', E({ speed_kt: d.pc9m.glideV, ratio: d.t6a.glideLD.central }, 'kt CAS', [C], 'ใช้ polar ของ T-6 (ปีกตระกูลเดียวกัน) ที่ 2,350 kg; ไม่มีค่าสาธารณะของ PC-9 M'));
    s('performance.fuel', M({ usable_L: 518, usable_kg: d.pc9m.fuel_kg, endurance_h: { '2000ft_120KIAS': 2.45, '25000ft_120KIAS': 4.0 } }, 'L, kg, h', ['LP2', 'LP12'], 'endurance รวมสำรอง 100 nm'));
  }

  // ── controls ──
  const tr = T6 ? PUB.t6a.travel : P9.travel;
  s('controls.architecture', M({ pitch: 'reversible', roll: 'reversible', yaw: 'reversible', trim: T6 ? 'tab (elevator, rudder) + aileron biased spring + rudder trim aid device' : 'tab' }, '-', SRC, T6 ? 'T-6 มี Trim Aid Device ช่วย trim rudder อัตโนมัติ (ทำงานเมื่อ weight off wheels เหนือ 80 KIAS [LP21])' : 'กลไกสาย/ก้าน'));
  s('controls.surfaces.elevator', H({ travel_deg: { up: tr.elevator.up, down: tr.elevator.down }, rate_dps: null, actuator_tau_s: null }, 'deg', SRC, '±1°; ระบบกลไก ไม่มี actuator'));
  s('controls.surfaces.aileron', H({ travel_deg: { up: tr.aileron.up, down: tr.aileron.down } }, 'deg', SRC, 'differential'));
  s('controls.surfaces.rudder', H({ travel_deg: { left: tr.rudder.left, right: tr.rudder.right } }, 'deg', SRC, T6 ? 'ห้ามใช้ rudder เต็มเหนือ 150 KIAS [LP18]' : ''));
  s('controls.surfaces.flap', H({ travel_deg: { TO: 23, LDG: 50 } }, 'deg', SRC, 'สองขั้น'));
  s('controls.surfaces.trim_tab', H({ elevator_tab: tr.elevator_tab, rudder_tab: tr.rudder_tab }, 'deg', SRC, T6 ? 'aileron trim = biased centering spring' : 'aileron fixed tab ±5° (ปรับบนพื้น)'));
  s('controls.surfaces.speedbrake', H({ travel_deg: T6 ? 67.5 : 70 }, 'deg', SRC, T6 ? 'speedbrake ใต้ลำตัว; flashcard ให้ 70°' : 'airbrake; ใช้ได้ถึง VMO'));
  s('controls.trim', M({ kind: T6 ? 'electric (elevator, rudder, aileron spring bias)' : 'electric/manual (ไม่ยืนยัน)', elevator_tab_deg: tr.elevator_tab, rudder_tab_deg: tr.rudder_tab }, 'deg', SRC, 'ระยะ tab จาก TCDS; ชนิดตัวขับไม่ยืนยัน'));
  s('controls.pitch.architecture', M({ kind: 'reversible', input: 'force' }, '-', SRC));
  for (const p of ['S_e', 'c_e', 'gearing', 'eta_t', 'Ch0', 'Ch_alpha', 'Ch_delta', 'Ch_tab', 'trim_rate_flaps_down', 'trim_rate_flaps_up', 'breakout', 'friction', 'centring_spring', 'rate_limit']) adopt(card, 'controls.pitch.' + p);
  s('controls.pitch.a_t', E(r(dc.static.CLaH, 2), '1/rad', ['LM10', C]));
  s('controls.pitch.tau_e', E(r(dc.static.tauE, 3), '-', ['LM10', C], 'cf/c 0.40 × ตัวคูณความหนืด 0.85'));
  s('controls.pitch.l_t', E(4.9, 'm', [C]));
  s('controls.pitch.deda', E(r(dc.static.deda, 3), '-', ['LM10', C]));
  s('controls.pitch.tab_max', H(Math.max(tr.elevator_tab.up, tr.elevator_tab.down), 'deg', SRC, `elevator tab ขึ้น ${tr.elevator_tab.up}° ลง ${tr.elevator_tab.down}°`));
  s('controls.pitch.stops', H({ teu: tr.elevator.up, ted: tr.elevator.down }, 'deg', SRC));
  s('controls.roll.architecture', M({ kind: 'reversible', input: 'force' }, '-', SRC));
  for (const p of ['S_a_each', 'c_a', 'gearing', 'Ch_delta', 'Ch_alpha', 'trim_rate', 'breakout', 'rate_limit']) adopt(card, 'controls.roll.' + p);
  s('controls.roll.tab_max', T6 ? H(0, 'deg', ['LP5'], 'ไม่มี aileron tab; trim ด้วย biased centering spring') : H(5, 'deg', ['LP2'], 'fixed tab ±5° (ปรับบนพื้น ไม่ใช่ trim)'));
  s('controls.roll.stops', H({ max: tr.aileron.up, up: tr.aileron.up, down: tr.aileron.down }, 'deg', SRC));
  s('controls.yaw.architecture', M({ kind: 'reversible', input: 'force' }, '-', SRC, T6 ? '+ trim aid device (rudder trim อัตโนมัติตามกำลัง/ความเร็ว)' : ''));
  for (const p of ['S_r', 'c_r', 'gearing', 'Ch_delta', 'Ch_beta', 'slipstream_q_ratio', 'trim_rate', 'breakout', 'rate_limit']) adopt(card, 'controls.yaw.' + p);
  s('controls.yaw.tab_max', H(Math.max(tr.rudder_tab.left, tr.rudder_tab.right), 'deg', SRC, `rudder trim tab ขวา ${tr.rudder_tab.right}° ซ้าย ${tr.rudder_tab.left}°`));
  s('controls.yaw.stops', H({ max: 24 }, 'deg', SRC, '±24°'));

  // ── gear ──
  s('gear.layout', H('tricycle_retract', '-', SRC));
  s('gear.retract', L({ time_s: 6, VLO_kt: 150, VLE_kt: 150 }, 's, kt', T6 ? ['LP21', 'LP5'] : ['LP2', 'LP21'], { conf: T6 ? 'ต่ำ' : 'ต่ำ', est: !T6, note: T6 ? 'เวลาเก็บ/กางล้อ 6 s (flashcard)' : 'ค่าประมาณ: เวลา 6 s ของ T-6; VLO 150 kt จาก TCDS' }));
  const wb = T6 ? P.wheelbase : 2.31, track = T6 ? P.track : 2.54, fn = 0.12, hp = 1.25;
  const xn = r((1 - fn) * wb, 3), xm = r(-fn * wb, 3);
  s('gear.geometry.nose_contact_body_extended', E([xn, 0, hp + 0.08], 'm FRD', [C, ...SRC], `wheelbase ${wb} m, โหลดล้อหน้า ${fn * 100} % (ค่าประมาณ), CG จอดสูง ${hp} m, ช่วงยืด 0.08 m`));
  s('gear.geometry.main_contact_body_extended', E([[xm, -track / 2, hp + 0.10], [xm, track / 2, hp + 0.10]], 'm FRD', [C, ...SRC], `track ${track} m`));
  s('gear.geometry.cg_height_parked', E(hp, 'm', [C], 'รอบที่ 1 1.30 m'));
  s('gear.strut_main.kind', E('oleo', '-', [C], 'oleo-pneumatic (ไม่ยืนยันชนิดย่อย)', { scope: 'gear' }));
  s('gear.strut_nose.kind', E('oleo', '-', [C], '', { scope: 'gear' }));
  for (const p of ['stroke', 'p_static', 'piston_area', 'ratio_static_to_extended', 'ratio_compressed_to_extended', 'polytropic_n_dynamic', 'polytropic_n_static', 'Kh_compression', 'Kr_rebound', 'c_linear', 'seal_friction_ratio']) adopt(card, 'gear.strut_main.' + p, T6 ? 'มวลมากกว่ารอบที่ 1 ราว 31 % ควรสเกล piston_area' : '');
  for (const p of ['stroke', 'p_static', 'piston_area', 'ratio_static_to_extended', 'ratio_compressed_to_extended', 'Kh_compression', 'Kr_rebound', 'c_linear']) adopt(card, 'gear.strut_nose.' + p);
  if (T6) {
    const Nm = MTOW * G0 * (1 - fn) / 2, Nn = MTOW * G0 * fn;
    s('gear.tyre_main.size', H({ size: '20x4.4', type: 'VII (high pressure)' }, '-', ['LP5'], 'CMM 133-590075-0045', { scope: 'gear' }));
    s('gear.tyre_main.operating_pressure', L([225, 185], 'psi', ['LP21'], { scope: 'gear', conf: 'ต่ำ', note: 'ยางแรงดันสูง 225 ± 5 หรือยางแรงดันต่ำ 185 ± 5 psi (flashcard)' }));
    s('gear.tyre_main.rated_pressure', E(225, 'psi', ['LP21'], 'ไม่มีตาราง TRA; ใช้แรงดันใช้งาน', { scope: 'gear' }));
    s('gear.tyre_main.rated_load', E(Math.round(Nm / 0.7), 'N', [C], `โหลดสถิตต่อล้อ ${Math.round(Nm)} N ÷ 0.7`, { scope: 'gear' }));
    s('gear.tyre_main.outside_diameter', H(r(20 * IN, 3), 'm', ['LP5'], '20 in (ชื่อขนาด)', { scope: 'gear' }));
    s('gear.tyre_main.section_width', H(r(4.4 * IN, 3), 'm', ['LP5'], '4.4 in', { scope: 'gear' }));
    s('gear.tyre_main.k_vertical', E(Math.round(Nm / (0.25 * (20 - 12) / 2 * IN)), 'N/m', [C], 'ยุบสถิต ≈ 25 % ของความสูงหน้ายาง (OD 20 in, ขอบล้อ ~12 in ⇒ สูง 4 in)', { scope: 'gear' }));
    s('gear.tyre_main.rolling_radius', E(r(0.5 * 20 * IN - 0.01, 3), 'm', [C], 'r − δ/3', { scope: 'gear' }));
    s('gear.tyre_nose.size', H({ size: '16x4.4', type: 'VII' }, '-', ['LP5'], 'CMM 133-590075-0021', { scope: 'gear' }));
    s('gear.tyre_nose.operating_pressure', L(120, 'psi', ['LP21'], { scope: 'gear', conf: 'ต่ำ', note: '120 ± 5 psi (flashcard)' }));
    s('gear.tyre_nose.rated_pressure', E(120, 'psi', ['LP21'], 'ใช้แรงดันใช้งาน', { scope: 'gear' }));
    s('gear.tyre_nose.rated_load', E(Math.round(Nn / 0.7), 'N', [C], `โหลดสถิต ${Math.round(Nn)} N ÷ 0.7`, { scope: 'gear' }));
    s('gear.tyre_nose.outside_diameter', H(r(16 * IN, 3), 'm', ['LP5'], '16 in', { scope: 'gear' }));
    s('gear.tyre_nose.k_vertical', E(Math.round(Nn / (0.25 * (16 - 8) / 2 * IN)), 'N/m', [C], 'วิธีเดียวกับล้อหลัก', { scope: 'gear' }));
    for (const p of ['c_vertical', 'cornering_stiffness_coef', 'relaxation_length', 'k_longitudinal', 'mu_peak_dry', 'mu_skid_ratio_dry', 'mu_skid_ratio_wet', 'wheel_inertia']) adopt(card, 'gear.tyre_main.' + p);
    for (const p of ['c_vertical', 'cornering_stiffness_coef', 'relaxation_length']) adopt(card, 'gear.tyre_nose.' + p);
  } else {
    for (const p of ['size', 'rated_load', 'rated_pressure', 'operating_pressure', 'outside_diameter', 'section_width', 'k_vertical', 'c_vertical', 'cornering_stiffness_coef', 'relaxation_length', 'k_longitudinal', 'mu_peak_dry', 'mu_skid_ratio_dry', 'mu_skid_ratio_wet', 'rolling_radius', 'wheel_inertia'])
      adopt(card, 'gear.tyre_main.' + p, 'ไม่พบขนาดยางสาธารณะของ PC-9 M (TCDS บอกเพียงว่ามียางแรงดันสูง/ต่ำ [LP2])');
    for (const p of ['size', 'rated_load', 'rated_pressure', 'operating_pressure', 'outside_diameter', 'k_vertical', 'c_vertical', 'cornering_stiffness_coef', 'relaxation_length']) adopt(card, 'gear.tyre_nose.' + p, 'ไม่พบข้อมูลสาธารณะ');
  }
  for (const p of ['force_limit_ratio', 'pressure_rise_rate', 'heat_sink_mass', 'heat_sink_cool_tau', 'fade_start_temp', 'fade_full_temp']) adopt(card, 'gear.brakes.' + p);
  s('gear.brakes.antiskid', M(0, 'bool', SRC, 'ไม่มี antiskid (เครื่องฝึก; ไม่พบในเอกสาร)'));
  s('gear.steering.mode', T6 ? M({ type: 'pedal_linked', powered_NWS: true, caster_with_diff_brake: true }, '-', ['LP28', 'LP20', 'LP21'], 'nosewheel steering ไฮดรอลิก (ต้องการ 1,800 psi [LP20]) ±12° [LP28]; เลี้ยวแคบกว่านั้นปลด NWS แล้วใช้ rudder + เบรกแยกข้าง (ล้อหน้าหมุนอิสระ)') : E({ type: 'castering_diff_brake' }, '-', [C], 'ไม่พบข้อมูลสาธารณะของ PC-9 M (ค่าประมาณว่าใช้ล้อหน้าอิสระ + เบรกแยกข้างแบบ PC-7)'));
  s('gear.steering.pedal_max', T6 ? M(12, 'deg', ['LP28', 'LP20'], 'NWS ±12° จากศูนย์กลาง (P-868 หน้า 4-8 [LP28]); flashcard [LP20] ให้ช่วง NWS 24° รวม ซึ่งตรงกัน') : E(0, 'deg', ['R1:G19', C], 'castering'));
  s('gear.steering.caster_max', T6 ? L(80, 'deg', ['LP21'], { conf: 'ต่ำ', note: 'flashcard [LP21] ให้ 160° รวม (80° ต่อข้าง) และเรียกว่า NWS range; ตีความเป็นช่วงหมุนอิสระเมื่อปลด NWS เพราะ [LP28][LP20] ให้ NWS ±12° (ยังไม่ยืนยัน)' }) : E(45, 'deg', ['R1:params-trainer.json'], 'เท่ารอบที่ 1'));
  adopt(card, 'gear.steering.steer_rate'); adopt(card, 'gear.steering.shimmy_lag');
  s('gear.certification.part23_limit_descent', M({ formula: 'V = 4.4 (W/S)^0.25 fps, 7..10 fps', W_S_lb_ft2: d.loading[T6 ? 't6a' : 'pc9m'].WS_lb_ft2, fps: 10, mps: 3.048 }, 'fps', ['R1:G3', C], '14 CFR 23.473(d); W/S สูงพอให้ได้ค่าสูงสุด 10 fps'));
  adopt(card, 'gear.certification.part23_wing_lift_ratio', '', { conf: 'กลาง' }); adopt(card, 'gear.certification.part23_min_load_factors', '', { conf: 'กลาง' }); adopt(card, 'gear.certification.part23_reserve_drop_factor', '', { conf: 'กลาง' });

  // ── wind / input / validation ──
  s('wind.wake.b0_over_b', L(0.7854, '-', ['R1:W19'], { note: 'π/4 (แรงยกแบบวงรี)' }));
  adopt(card, 'wind.wake.rc_over_b');
  s('wind.wake.trainerRollControl', E({ Clda: r(da.body.Clda, 4), daMax_deg: r(0.5 * (tr.aileron.up + tr.aileron.down), 1), ClMax: r(da.body.Clda * 0.5 * (tr.aileron.up + tr.aileron.down) * Math.PI / 180, 4) }, '-, deg', ['LM10', ...SRC, C], 'อำนาจม้วนสูงสุด Clda × ค่าเฉลี่ยมุม aileron'));
  s('validation.classification.hqClassCategory', M({ class: 'I', approachLanding: 'C', cruiseClimb: 'B', takeoff: 'C', aerobatics: 'A' }, '-', ['R1:V7', 'R1:V10', 'R1:C12'], 'MIL-F-8785C: primary trainer = Class I; ผาดแผลง/spin = Category A'));
  s('validation.procedures.v50MinFactor_singleEngine', L(1.2, '× VS1', ['R1:V17'], { note: '14 CFR 23.53 (ก่อน amdt 23-64)' }));
  s('input.keyboard.interim_trim_rate_elevator', E(0.5, 'deg/s', ['R1:params-trainer.json'], 'เท่ารอบที่ 1'));
  return card;
}

/** sub-variant cards: only what differs from the parent */
export function buildPC7(d) {
  const c = {}, s = (p, l) => setp(c, p, l), P = PUB.pc7mk2, S = ['LP1'];
  s('_inherits', { v: 'pc9m', u: '-', scope: 'aircraft', src: [], conf: 'สูง', est: false, note: 'PC-7 MkII ใช้โครงสร้าง PC-9: TCDS F 56-25 ให้ MAC 1,650 mm, LEMAC 3,872.5 mm, datum, ตำแหน่งที่นั่ง, เชื้อเพลิง 540 L และระยะพื้นบังคับเท่า PC-9 M ทุกค่า; ต่างที่เครื่องยนต์ PT6A-25C, น้ำหนัก และความเร็ว' });
  s('airframe.identity', H({ manufacturer: 'Pilatus Aircraft Ltd', model: 'PC-7 MkII', variant: 'PC-7 MkII (MSN 101–689, 765–999); MSN 690–764 และ 1000+ = PC-7 MKX (MTOW 2,350 kg)', engine: 'P&WC PT6A-25C 700 shp (522 kW)', propeller: 'Hartzell HC-D4N-2D/-2E + 4× D9512A(K), 2.44 m', seats: 2, category: 'acrobatic/utility (FAR 23)', tc_ref: 'FOCA TCDS F 56-25 Issue 10 (2025)' }, '-', S));
  s('airframe.weights.MTOW', H(P.MTOW, 'kg', S, 'acrobatic; stores 2,700 kg; PC-7 MKX 2,350 kg'));
  s('airframe.weights.MLW', H(P.MLW, 'kg', S)); s('airframe.weights.MRW', H(P.MRW, 'kg', S)); s('airframe.weights.MZFW', H(P.MZFW, 'kg', S));
  s('airframe.weights.BEW_typical', M(P.BEW, 'kg', ['LP9'], '3,682 lb (fact sheet)'));
  s('airframe.weights.useful_load', L(P.MTOW - P.BEW, 'kg', ['LP27', 'LP1', 'LP9'], { note: 'MTOW − BEW' }));
  s('airframe.weights.training_mass', tmLeaf(d.pc7mk2.tm, ['LP27', 'LP9', 'LP1'], '0.806 kg/L', P.MTOW));
  s('airframe.cg.envelope', H(d.pc9m.cg_env.slice(0, 1).concat([[2350, 4.285, 4.3675]]), 'kg, m DAT', S, '≤2,250 kg 22–30 %MAC; 2,350 kg (MKX) 25–30 %MAC; stores 2,700 kg 22.5–29, 2,850 kg 23–28'));
  s('airframe.inertia.ref_mass', E(P.MTOW, 'kg', ['LP27'], 'inertia ของ pc9m สเกลด้วยรัศมีไจเรชันคงที่ (ลดลง 4 %); ค่า Ixx … ของ pc9m ถูกคูณ 2,250/2,350 โดย buildAC'));
  s('airframe.inertia.Ixx', E(Math.round(d.pc9m.I.Ixx * P.MTOW / 2350), 'kg m2', ['LM15', 'LP27'], 'Roskam radii คลาส trainer_turboprop ที่ 2,250 kg'));
  s('airframe.inertia.Iyy', E(Math.round(d.pc9m.I.Iyy * P.MTOW / 2350), 'kg m2', ['LM15', 'LP27'], 'เหมือนกัน'));
  s('airframe.inertia.Izz', E(Math.round(d.pc9m.I.Izz * P.MTOW / 2350), 'kg m2', ['LM15', 'LP27'], 'เหมือนกัน'));
  s('aero.static_long.CLmax_target', M({ UP: d.stallCL.pc7mk2_UP.CLmax_1g, LDG: d.stallCL.pc7mk2_LDG.CLmax_1g }, '-', ['LP9', 'LM1', 'LP27'], `จาก fact sheet 75/67 KCAS (สมมติที่ 2,250 kg) ⇒ CL ปรากฏ ${d.stallCL.pc7mk2_UP.CLapp}/${d.stallCL.pc7mk2_LDG.CLapp}`));
  s('speeds.VS1_kt', M(75, 'kt CAS', ['LP9'], 'แฟลปและล้อขึ้น; fact sheet ไม่ระบุน้ำหนัก (สมมติ 2,250 kg)'));
  s('speeds.VS0_kt', M(67, 'kt CAS', ['LP9'], 'แฟลปและล้อลง'));
  s('speeds.VA_kt', M(210, 'kt CAS', S, 'ที่ 2,250 kg; 200 kt เมื่อมี stores'));
  s('speeds.VNE_kt', M(300, 'kt CAS', S, 'VMO ถึง 15,000 ft; MMO 0.60; fact sheet: 300 KCAS'));
  const PF = d.perf, V = d.vref.pc7mk2, hot = PF.pc7mk2.hot, vy = Math.round(PF.pc7mk2.MTOW.Vy_keas * d.vyBias), al = Math.round(d.altLossCoef.mean * 75 * 75 / 10) * 10;
  s('speeds.VREF_kt', E(V.VREF, 'kt CAS', ['LP27', 'LP9'], `1.3 VS0 ที่มวลฝึก ${r(d.pc7mk2.training_mass, 0)} kg (D1): VS0 67 KCAS ที่ 2,250 kg [LP9] × √(${d.pc7mk2.training_mass}/2,250) = ${V.VS0_tm} ⇒ ${V.VREF_exact}; ที่ MTOW ${d.icao.pc7mk2} kt`));
  s('speeds.VAPP_kt', E(V.VAPP, 'kt CAS', ['LP27'], `VREF + 5 kt ที่มวลฝึก แฟลป LDG ล้อลง (D1); แก้มวลเป็น MTOW ≈ ${V.VAPP_at_MTOW} kt`));
  s('speeds.VX_kt', E(Math.round(PF.pc7mk2.MTOW.Vx_card_kcas), 'kt CAS', ['LP27', 'LP30'], `ไม่มีค่าสาธารณะ; lp_perf.mjs: มุมไต่สูงสุดของโมเดลที่ ${PF.pc7mk2.MTOW.Vx_model_keas} kt ≤ 1.2 VS1 จึงใช้ 1.2 VS1 = ${PF.pc7mk2.MTOW.Vx_card_kcas} kt ที่ MTOW ตาม 14 CFR 23.65(a)(4) [LP30] (γ ${PF.pc7mk2.MTOW.gamma_at_Vx_card_deg}° เทียบสูงสุด ${PF.pc7mk2.MTOW.gamma_max_deg}°); ที่มวลฝึก ${PF.pc7mk2.training_mass.Vx_card_kcas} kt`));
  s('speeds.VR_kt', E(76, 'kt CAS', ['LP27'], 'ไม่มีค่าสาธารณะ'));
  s('speeds.VY_kt', E(vy, 'kt CAS', ['LP27', 'LP29'], `ไม่มีค่าสาธารณะ; lp_perf.mjs ให้ Vy ${PF.pc7mk2.MTOW.Vy_keas} kt ที่ MTOW × ${d.vyBias} (อัตราส่วน VY ของ T-6A [LP29] ต่อโมเดลเดียวกัน) ⇒ ${vy} kt; ค่าเดิม 120 kt (เดาจากกำลังที่ต่ำกว่า) ต่ำไป; เส้น ROC แบน`));
  s('speeds.VG_kt', E(d.pc7mk2.glideV, 'kt CAS', ['LP27'], 'polar คลาสที่ 2,250 kg'));
  s('speeds.stall_table', M({ '2250kg': { UP: 75, LDG: 67 } }, 'kt CAS', ['LP9'], 'fact sheet ไม่ระบุน้ำหนัก บัตรถือว่าเป็น MTOW 2,250 kg'));
  s('speeds.stall_altitude_loss_ft', E(al, 'ft', ['LP27', 'LC2', 'LF1', 'LG5'], `วิธีเดียวกับ pc9m: ${d.altLossCoef.mean} ft/kt² × (VS1 75 KCAS)² = ${al} ft (${Math.round(al * FT)} m; ช่วง ${Math.round(d.altLossCoef.lo * 75 * 75)}–${Math.round(d.altLossCoef.hi * 75 * 75)} ft)`));
  s('speeds.icao_approach_category', E('A', '-', ['LP27'], `1.3 VS0 = ${d.icao.pc7mk2} kt`));
  s('performance.ROC_SL_fpm', M(2840, 'fpm', ['LP9'], `ISA SL 14.4 m/s (fact sheet ไม่ระบุน้ำหนัก บัตรถือว่าเป็น MTOW 2,250 kg); โมเดลไต่ BEM ของ lp_perf.mjs ให้ ${PF.pc7mk2.MTOW.ROC_fpm} fpm ที่ MTOW (${r((PF.pc7mk2.MTOW.ROC_fpm / 2840 - 1) * 100, 1)} %)`));
  s('performance.ROC_table', E({ h_ft: 9, oat_C: hot.map(h => h.oat_C), ROC_fpm: hot.map(h => Math.round(2840 * h.ROC_fpm_MTOW / hot[0].ROC_fpm_MTOW / 10) * 10), ROC_ms: hot.map(h => r(2840 * h.ROC_fpm_MTOW / hot[0].ROC_fpm_MTOW * FT / 60, 1)) }, 'fpm (m/s)', ['LP9', 'LP27'], 'ความสูงสนาม VTBD 9 ft; 2,840 fpm × อัตราส่วน ROC ของโมเดลไต่ BEM (lp_perf.mjs) ที่ OAT นั้นต่อ 15 °C (PT6A-25C flat rated กว้าง กำลังเต็ม); ไม่มีตาราง POH สาธารณะ'));
  s('performance.cruise_table', M([{ h_ft: 0, ktas: 242, power: 'max' }, { h_ft: 10000, ktas: 251, power: 'max' }], 'ft, kt TAS', ['LP9'], 'max level cruise 124/129 m/s'));
  s('performance.glide', E({ speed_kt: d.pc7mk2.glideV, ratio: d.t6a.glideLD.central }, 'kt CAS', ['LP27'], 'polar คลาสของ T-6'));
  s('performance.fuel', M({ usable_L: 518, usable_kg: d.pc9m.fuel_kg, range_nm: 810 }, 'L, kg, nm', ['LP1', 'LP9']));
  s('propulsion.layout', E([{ id: 1, pos: [r(4.285 - 0.45, 2), 0, -0.05], axis: [1, 0, 0], type: 'turboprop', model: 'PT6A-25C', prop_sense: 1 }], 'm FRD', ['LP1', 'LP27'], 'pos จาก CG อ้างอิงของ pc9m กับระนาบใบพัดสมมติที่ 0.45 m DAT; รุ่นเครื่องยนต์และทิศหมุนจาก TCDS F 56-25', { conf: 'กลาง' }));
  s('propeller.identity.model', H('Hartzell HC-D4N-2D หรือ -2E / D9512A(K)', '-', S, '', { scope: 'propeller' }));
  s('propeller.engineInterface.maxShaftPower', H(522, 'kW', S, '700 shp (thermodynamic 850 shp [LP9])', { scope: 'engine' }));
  s('propeller.engineInterface.rpmGoverned', L(2040, 'rpm', S, { scope: 'engine', conf: 'สูง', note: 'TCDS F 56-25 Issue 10 หน้า 1 (ตรวจทานแล้ว); transient 2,205 rpm 2 s; PC-9 M ใช้ 2,000' }));
  s('propeller.engineInterface.rpmTransientLimit', H(2205, 'rpm', S, 'max acceleration 2 s', { scope: 'engine' }));
  s('propeller.governor.betaFlightIdle', H(d.prop.beta75_minPitch_pc7mk2, 'deg @0.75R', ['LP1', 'LP27'], 'min pitch 16° ที่สถานี 30 in', { scope: 'propeller' }));
  s('turboprop.ratings.P_rated', H(522000, 'W', S, '700 shp', { scope: 'engine' }));
  s('turboprop.ratings.T_flat_C', E(45, 'degC', ['LP9', 'LP27'], 'thermodynamic 850 shp/flat 700 shp ⇒ กำลังเต็มถึงอุณหภูมิสูง (ไม่มีตัวเลข)', { scope: 'engine' }));
  s('turboprop.ratings.Np_max_rpm', L(2040, 'rpm', S, { scope: 'engine', conf: 'สูง', note: 'ดู propeller.engineInterface.rpmGoverned' }));
  s('turboprop.ratings.Q_lim', H(Math.round(d.Q.pc7mk2_fromP_Nm), 'N m', S, '49.7 psi; P/ω ที่ 522 kW, 2,040 rpm', { scope: 'engine' }));
  s('turboprop.ratings.ITT_max_C', H(790, 'degC', S, 'max acceleration 850 °C 2 s', { scope: 'engine' }));
  s('turboprop.ratings.ITT_start_C', H(1090, 'degC', S, '2 s (PT6A-25C)', { scope: 'engine' }));
  s('turboprop.derived_vtbd.P_avail_vs_OAT_SL', E({ axes: { OAT_C: [15, 25, 31, 34, 37, 38, 40, 45] }, data: [522, 522, 522, 522, 522, 522, 522, 522] }, 'kW', ['LP9', 'LP27'], 'flat rating กว้าง (850 → 700 shp)', { scope: 'engine' }));
  s('turboprop.derived_vtbd.P_avail_static_grid', E(null ?? { axes: { alt_ft: [0, 5000, 10000] }, data: [522, 522, 480] }, 'kW', ['LP27'], 'หยาบ: flat ถึงราว 8,000 ft ISA', { scope: 'engine' }));
  s('turboprop.reference_engines.PT6A-62', { v: 'ไม่ใช้ (PC-7 MkII ใช้ PT6A-25C)', u: '-', scope: 'engine', src: ['LP1'], conf: 'สูง', est: false, note: 'แทนค่าที่สืบทอดจาก pc9m' });
  return c;
}

export function buildT6C(d) {
  const c = {}, s = (p, l) => setp(c, p, l), P = PUB.t6c, S = ['LP8', 'LP7'];
  s('_inherits', { v: 't6a', u: '-', scope: 'aircraft', src: [], conf: 'สูง', est: false, note: 'T-6C = T-6B (ห้องนักบินกระจก HUD, HOTAS) + hardpoint ใต้ปีก; โครงสร้าง เครื่องยนต์ ใบพัดเดียวกับ T-6A [LP14]; ผู้ใช้ทางทหารในไทยใช้รุ่นส่งออกของ T-6C' });
  s('airframe.identity', M({ manufacturer: 'Textron Aviation Defense', model: 'Model 3000 (T-6C Texan II)', variant: 'T-6C (glass cockpit, 2 จุดติดถังภายนอก)', engine: 'P&WC PT6A-68A 1,100 shp', propeller: 'Hartzell HC-E4A-2 + 4× E9612, 2.46 m', seats: 2, category: 'normal/aerobatic', tc_ref: 'EASA TCDS IM.A.636 (Model 3000 PM series)' }, '-', ['LP8', 'LP5']));
  s('airframe.weights.MTOW', H(r(P.MTOW, 1), 'kg', ['LP8', 'LP5'], '6,900 lb; LP7 ให้ 8,300 lb เมื่อมี stores'));
  s('airframe.weights.MLW', H(r(P.MLW, 1), 'kg', ['LP8', 'LP5'], '6,900 lb'));
  s('airframe.weights.MRW', H(r(P.MRW, 1), 'kg', ['LP5'], '6,950 lb'));
  s('airframe.weights.MZFW', H(r(P.MZFW, 1), 'kg', ['LP5'], '5,850 lb'));
  s('airframe.weights.BEW_typical', M(r(P.BEW, 1), 'kg', ['LP8'], '5,150 lb (LP7: 5,170 lb)'));
  s('airframe.weights.useful_load', L(r(P.MTOW - P.BEW, 1), 'kg', ['LP27', 'LP8'], { note: 'MTOW − BEW' }));
  s('airframe.weights.training_mass', tmLeaf(d.t6c.tm, ['LP27', 'LP8', 'LP21'], 'Jet A 0.80 kg/L', P.MTOW));
  s('airframe.cg.envelope', H(d.t6a.cg_env, 'kg, m DAT', ['LP5'], 'ตารางของ Model 3000 PM series ตรงกับน้ำหนัก T-6C'));
  s('airframe.inertia.ref_mass', E(r(P.MTOW, 1), 'kg', ['LP27'], 'inertia ของ t6a × 6,900/6,500'));
  for (const k of ['Ixx', 'Iyy', 'Izz']) s('airframe.inertia.' + k, E(Math.round(d.t6a.I[k] * 6900 / 6500), 'kg m2', ['LM15', 'LP27'], 'Roskam radii ที่ 6,900 lb'));
  const PF = d.perf, V = d.vref.t6c, A = PUB.t6a.aopa, hot = PF.t6c.hot, m0 = d.t6a.m_pub, kW2 = (P.MTOW / m0) ** 2, kW1 = P.MTOW / m0, ft2m = x => Math.round(x * FT);
  const al = Math.round(d.altLossCoef.mean * d.t6c.VS1 ** 2 / 10) * 10;
  s('speeds.VS1_kt', E(d.t6c.VS1, 'kt IAS', ['LP29', 'LP27'], '82 KIAS ที่ 6,300 lb [LP29] สเกล √W เป็น MTOW 6,900 lb', { conf: 'กลาง' }));
  s('speeds.VS0_kt', E(d.t6c.VS0, 'kt IAS', ['LP29', 'LP27'], '74 KIAS ที่ 6,300 lb [LP29] สเกล √W เป็น MTOW 6,900 lb', { conf: 'กลาง' }));
  s('speeds.VX_kt', E(Math.round(PF.t6c.MTOW.Vx_card_kcas), 'kt IAS', ['LP27', 'LP30'], `lp_perf.mjs: 1.2 VS1 ที่ MTOW 6,900 lb = ${PF.t6c.MTOW.Vx_card_kcas} kt (มุมไต่สูงสุดของโมเดลที่ ${PF.t6c.MTOW.Vx_model_keas} kt) ตาม 14 CFR 23.65(a)(4) [LP30]; ที่มวลฝึก ${PF.t6c.training_mass.Vx_card_kcas} kt`));
  s('speeds.VREF_kt', E(V.VREF, 'kt IAS', ['LP27', 'LP29'], `1.3 VS0 ที่มวลฝึก ${r(d.t6c.training_mass, 0)} kg (D1): 74 KIAS ที่ 6,300 lb [LP29] × √(${d.t6c.training_mass}/${m0}) = ${V.VS0_tm} ⇒ ${V.VREF_exact}; ที่ MTOW ${d.icao.t6c} kt`));
  s('speeds.VAPP_kt', E(V.VAPP, 'kt IAS', ['LP27', 'LP20', 'LP31'], `final 100 KIAS ของ T-6A [LP20] × √(${d.t6c.training_mass}/${d.t6a.training_mass}) = ${V.VAPP_exact} ที่มวลฝึก (D1; VAPP/VREF = ${r(V.VAPP / V.VREF_exact, 3)}); รายงานบิน T-6C ของ AOPA 2021: short final 110 KIAS, touchdown 100 [LP31]; แก้มวลเป็น MTOW ≈ ${V.VAPP_at_MTOW} kt`));
  s('speeds.stall_altitude_loss_ft', E(al, 'ft', ['LP27', 'LC2', 'LF1', 'LG5'], `วิธีเดียวกับ t6a: ${d.altLossCoef.mean} ft/kt² × (VS1 ${d.t6c.VS1} kt ที่ MTOW)² = ${al} ft (${Math.round(al * FT)} m)`));
  s('speeds.icao_approach_category', E('B', '-', ['LP27'], `1.3 VS0 ที่ MTOW = ${d.icao.t6c} kt`));
  const roc = Math.round(3100 * PF.t6c.MTOW.ROC_fpm / PF.t6a.MTOW.ROC_fpm / 10) * 10;
  s('performance.ROC_SL_fpm', E(roc, 'fpm', ['LP23', 'LP27'], `3,100 fpm ของ t6a (MTOW 6,500 lb) × อัตราส่วน ROC ของโมเดลไต่ BEM (lp_perf.mjs) ที่ 6,900/6,500 lb (${PF.t6c.MTOW.ROC_fpm}/${PF.t6a.MTOW.ROC_fpm}) = ${roc} fpm (${r(roc * FT / 60, 1)} m/s); ค่าเดิม 2,850 (ลด 8 % ตามน้ำหนัก); รายงาน AOPA 2021 เห็น 4,000 fpm ไม่ทราบน้ำหนัก [LP31]`));
  s('performance.ROC_table', E({ h_ft: 9, oat_C: hot.map(h => h.oat_C), ROC_fpm: hot.map(h => Math.round(roc * h.ROC_fpm_MTOW / hot[0].ROC_fpm_MTOW / 10) * 10), ROC_ms: hot.map(h => r(roc * h.ROC_fpm_MTOW / hot[0].ROC_fpm_MTOW * FT / 60, 1)) }, 'fpm (m/s)', ['LP27'], 'ความสูงสนาม VTBD 9 ft MTOW; ROC_SL_fpm × อัตราส่วน ROC ของ lp_perf.mjs ที่ OAT นั้นต่อ 15 °C'));
  s('performance.takeoff', E({ ground_roll_m: Math.round(ft2m(A.TO_gr_ft) * kW2), over50ft_m: Math.round(ft2m(A.TO50_ft) * kW2) }, 'm', ['LP29', 'LP27'], '1,400 / 2,000 ft ของ T-6A ที่ 6,300 lb [LP29] × (6,900/6,300)² (แรงขับเท่ากัน) ที่ MTOW 6,900 lb ISA SL', { conf: 'กลาง' }));
  s('performance.landing', E({ ground_roll_m: Math.round(ft2m(A.LD_gr_ft) * kW1), over50ft_m: Math.round(ft2m(A.LD50_ft) * kW1) }, 'm', ['LP29', 'LP27'], '1,900 / 2,400 ft ของ T-6A ที่ 6,300 lb [LP29] × 6,900/6,300 (V² ∝ W) ที่ MLW 6,900 lb ISA SL', { conf: 'กลาง' }));
  s('performance.takeoff_table', E({ mass_kg: r(P.MTOW, 1), h_ft: 9, oat_C: hot.map(h => h.oat_C), ground_roll_m: hot.map(h => Math.round(ft2m(A.TO_gr_ft) * kW2 * h.takeoff_factor)), over50ft_m: hot.map(h => Math.round(ft2m(A.TO50_ft) * kW2 * h.takeoff_factor)) }, 'm', ['LP29', 'LP27'], `performance.takeoff × ตัวคูณวันร้อนของ lp_perf.mjs ${hot.map(h => h.takeoff_factor).join('/')}`));
  s('performance.landing_table', E({ mass_kg: r(P.MTOW, 1), h_ft: 9, oat_C: hot.map(h => h.oat_C), ground_roll_m: hot.map(h => Math.round(ft2m(A.LD_gr_ft) * kW1 * h.landing_factor)), over50ft_m: hot.map(h => Math.round(ft2m(A.LD50_ft) * kW1 * h.landing_factor)) }, 'm', ['LP29', 'LP27'], `performance.landing × 1/σ = ${hot.map(h => h.landing_factor).join('/')}`));
  s('performance.fuel', M({ usable_L: 681.37, range_nm: 884, ferry_range_nm: 1382 }, 'L, nm', ['LP5', 'LP8'], 'range ไม่มีถังภายนอก 884 nm; ferry (ถัง 2 ใบ) 1,382 nm; usable_L = 2 × 90 gal ตาม TCDS ข้อ A.III.9.1 (ข้อ A.III.2 ให้ 1,100 lb ดู t6a.airframe.weights.max_fuel_usable)'));
  s('propulsion.layout', E([{ id: 1, pos: [r(4.252 - 0.45, 2), 0, -0.05], axis: [1, 0, 0], type: 'turboprop', model: 'PT6A-68A', prop_sense: 1 }], 'm FRD', ['LP8', 'LP27'], 'pos จาก CG อ้างอิงของ t6a กับระนาบใบพัดสมมติที่ 0.45 m DAT; รุ่นเครื่องยนต์ PT6A-68A ตาม product card [LP8]', { conf: 'กลาง' }));
  return c;
}

// ─── _na (round-1 per-type paths that do not apply) ───
export function naLeaf(id) {
  const T6 = id === 't6a';
  const list = ['turbofan.*', 'controls.reference_types.*', 'validation.typicalModes.*', 'gear.certification.part25_limit_descent', 'gear.certification.part25_friction_cap',
    'wind.discreteGust.cfr25_341_Fg', 'wind.wake.leaders', 'numerics.contact.*', 'aero.static_long.table_clean', 'controls.pitch.derived_check',
    'propeller.betaReverse.betaGroundIdle', 'propeller.betaReverse.betaReverseMax', 'propeller.betaReverse.reverseRpmMax', 'propeller.betaReverse.reverseCTstatic', 'turboprop.beta_reverse.*',
    'gear.brakes.antiskid_efficiency', 'gear.brakes.antiskid_efficiency_measured', 'gear.brakes.antiskid_slip_setpoint',
    'validation.currentModel.approach95', 'validation.currentModel.cruise155',
    'otherSims.jsbsim.gearSideForcePacejkaDefaults', 'otherSims.jsbsim.c172xTrimCruise100kcas3000ft', 'otherSims.jsbsim.c172xTrimApproach65kcas1000ftFlap30', 'otherSims.yasim.*', 'otherSims.xplane.*', 'otherSims.msfs.*', 'otherSims.geofs.*', 'otherSims.airfieldlab.*',
    'aero.stall_warning.alpha_warn_design', 'aero.static_long.alpha_CLmax', 'aero.static_long.alpha_star', 'aero.stall_warning.alpha_warn_5kt', 'wind.fFactor.trainerExcessTW',
    T6 ? 'turboprop.reference_engines.PT6A-62' : 'turboprop.reference_engines.PT6A-68',
    'speeds.VNO_kt', ...(T6 ? [] : ['speeds.crosswind_demonstrated_kt']),
    'turboprop.reference_engines.PT6A-60A', 'turboprop.reference_engines.PT6A-52', 'turboprop.reference_engines.PT6A-68B_C_D_T'];
  return list;
}

// class coefficient for the stall altitude loss (gap 18): POH values of round-2 piston trainers, h / VS1² (ft/kt²)
const ALT_LOSS_POH = [{ id: 'c172s', ft: 230, vs1: 53, src: 'LC2' }, { id: 'c152', ft: 160, vs1: 48, src: 'LF1' }, { id: 'p2006t', ft: 180, vs1: 66, src: 'LG5' }];
export function buildAll() {
  const d = derive();
  d.perf = perfAll();
  d.vyBias = r(PUB.t6a.aopa.VY / d.perf.t6a.m6300.Vy_keas, 4);      // T-6A public VY / lp_perf Vy at the same mass
  const ks = ALT_LOSS_POH.map(o => o.ft / o.vs1 ** 2);
  d.altLossCoef = { mean: r(ks.reduce((a, b) => a + b, 0) / ks.length, 4), lo: r(Math.min(...ks), 4), hi: r(Math.max(...ks), 4), rows: ALT_LOSS_POH };
  const cards = { pc9m: buildMain('pc9m', d), t6a: buildMain('t6a', d), pc7mk2: buildPC7(d), t6c: buildT6C(d) };
  return { d, cards };
}

// ─── legacy fit and lm_card-derived leaves are added by lp_check.mjs (it needs the resolved cards) ───

export function fmt(obj, ind = 0) {    // pretty print: one leaf per line
  const pad = ' '.repeat(ind);
  if (isLeaf(obj)) return JSON.stringify(obj);
  const ks = Object.keys(obj);
  return '{\n' + ks.map((k, i) => `${pad} ${JSON.stringify(k)}: ${fmt(obj[k], ind + 1)}${i < ks.length - 1 ? ',' : ''}`).join('\n') + `\n${pad}}`;
}
export function blocksMd(cards, order = ['pc9m', 'pc7mk2', 't6a', 't6c', 'trainer_r2']) {
  const out = [];
  for (const id of order) {
    const c = cards[id]; if (!c) continue;
    const cats = Object.keys(c);
    const head = cats.filter(k => k.startsWith('_'));
    const groups = [['_meta+airframe', [...head, 'airframe']], ['aero', ['aero']], ['interference', ['interference']], ['speeds+performance', ['speeds', 'performance']],
      ['propulsion+turboprop+propeller', ['propulsion', 'turboprop', 'propeller']], ['controls', ['controls']], ['gear', ['gear']], ['wind+validation+input', ['wind', 'validation', 'input']]];
    const used = new Set();
    for (const [name, ks] of groups) {
      const sub = {}; for (const k of ks) if (c[k]) { sub[k] = c[k]; used.add(k); }
      if (!Object.keys(sub).length) continue;
      out.push(`\`${id}\` · ${name}\n\n\`\`\`json\n${fmt({ [id]: sub })}\n\`\`\`\n`);
    }
    const rest = cats.filter(k => !used.has(k));
    if (rest.length) { const sub = {}; for (const k of rest) sub[k] = c[k]; out.push(`\`${id}\` · อื่น ๆ\n\n\`\`\`json\n${fmt({ [id]: sub })}\n\`\`\`\n`); }
  }
  return out.join('\n');
}

if (isMainModule(import.meta.url)) {
  const { cards } = buildAll();
  const args = process.argv.slice(2), opt = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
  if (opt('--json')) fs.writeFileSync(opt('--json'), JSON.stringify(cards, null, 1));
  if (opt('--md')) fs.writeFileSync(opt('--md'), blocksMd(cards));
  for (const [id, c] of Object.entries(cards)) { let n = 0; (function w(o) { if (isLeaf(o)) { n++; return; } if (isObj(o)) for (const k in o) w(o[k]); })(c); console.log(id, n, 'leaves'); }
}
