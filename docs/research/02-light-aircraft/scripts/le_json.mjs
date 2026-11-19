// le_json.mjs — build the ```json data blocks of the c172r card (topic 10, code LE) from le_calc (POH numbers) and
// le_fit (legacy fit), write scripts/out/le_json_blocks.md and splice them into ../10-c172r.md between the markers
// <!-- LE-JSON-BEGIN --> and <!-- LE-JSON-END -->.   Run from the repo root:  node <this folder>/le_json.mjs
// The card is a variant card: "_inherits": c172s. Only the leaves that differ from the C172S card (or that the 172R
// documents give separately) are written here; everything else (wing, tail, derivatives, controls, gear) is inherited.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compute, POH, OLD } from './le_calc.mjs';
import { PROPS } from './lm_prop.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TOPIC = path.join(HERE, '..', '10-c172r.md');
const r = (x, d = 3) => +(+x).toFixed(d);
const L = (v, u, src, conf, est, note, scope = 'aircraft') => ({ v, u, scope, src, conf, est, note });
const C = compute();
let FIT = null;
try { FIT = JSON.parse(fs.readFileSync(path.join(HERE, 'out', 'le_legacy.json'), 'utf8')); } catch { /* first pass: no fit yet */ }

const blocks = [];
const add = (title, obj) => blocks.push({ title, obj: { c172r: obj } });

// ── 1. inheritance, _na, identity, weights, CG, inertia, geometry ──
add('รุ่นย่อย, _na, airframe', {
  _inherits: L('c172s', '-', [], 'สูง', false, 'โครงลำ ปีก หาง พื้นบังคับ ล้อ และระยะเคลื่อนเหมือน 172S ตาม TCDS 3A12 (172R กับ 172S อยู่ใน TCDS ฉบับเดียวกัน ค่าระยะเคลื่อนเท่ากันทุกตัว) บัตรนี้ใส่เฉพาะค่าที่ต่าง: เครื่องยนต์ 160 hp ที่ 2,400 rpm ใบพัด 1C235/LFA7570, น้ำหนัก, CG, ความเร็ว, สมรรถนะ และค่า fit ของซิม'),
  _na: L(['turboprop.*', 'turbofan.*', 'propeller.engineInterface.rpmGoverned', 'propeller.engineInterface.rpmTransientLimit', 'propeller.engineInterface.flightIdleShaftPower', 'propeller.governor.*', 'propeller.betaReverse.*', 'propeller.feathered.*',
    'gear.strut_main.p_static', 'gear.strut_main.piston_area', 'gear.strut_main.ratio_static_to_extended', 'gear.strut_main.ratio_compressed_to_extended', 'gear.strut_main.polytropic_n_dynamic', 'gear.strut_main.polytropic_n_static', 'gear.strut_main.Kh_compression', 'gear.strut_main.Kr_rebound', 'gear.strut_main.seal_friction_ratio',
    'gear.brakes.antiskid_efficiency', 'gear.brakes.antiskid_efficiency_measured', 'gear.brakes.antiskid_slip_setpoint', 'gear.certification.part25_limit_descent', 'gear.certification.part25_friction_cap',
    'controls.reference_types.*', 'controls.roll.tab_max', 'controls.roll.trim_rate', 'controls.yaw.tab_max', 'controls.yaw.trim_rate', 'controls.pitch.derived_check', 'interference.groundEffect.tablesCheck',
    'wind.discreteGust.cfr25_341_Fg', 'wind.wake.leaders', 'numerics.*', 'validation.typicalModes.*', 'validation.currentModel.*', 'otherSims.*'], '-', ['LC0', 'LE0'], 'สูง', false,
    'รายการเดียวกับ c172s (เหตุผลเดียวกัน: เครื่องลูกสูบใบพัด fixed pitch ไม่มี governor/feather/reverse; ขาหลักสปริงเหล็กไม่มีพารามิเตอร์ oleo; ไม่มี anti-skid; ไม่ใช่ Part 25; มี trim เฉพาะ elevator tab ตาม TCDS 3A12; ค่าตรวจและค่าตัวซิมไม่ใช่ข้อมูลรายแบบ; otherSims เป็นของหัวข้อ 03) ต้องเขียนซ้ำเพราะ leaf _na ของรุ่นย่อยแทนที่ของ c172s ทั้งก้อน · leaf รอบที่ 1 ระดับลึกที่ไม่มีข้อมูลสาธารณะของ 172R (แรงที่คัน hinge moment ใบพัดรายละเอียด buffet spin) ใช้ค่าของ c172s ที่สืบทอดมา ถ้าต้องแยกรายแบบให้เลื่อนไปทำเมื่อจำเป็น'),
  airframe: {
    identity: L({ manufacturer: 'Cessna Aircraft Company', model: '172R', variant: 'Skyhawk (รวม NAV III G1000 ของ 172R ที่ผลิตภายหลัง)', engine: 'Lycoming IO-360-L2A 160 hp @ 2,400 rpm (พิกัดตาม TCDS ของเครื่องบิน)', propeller: 'McCauley 1C235/LFA7570 fixed pitch 2 ใบ 74–75 in', seats: 4, category: 'normal / utility', tc_ref: 'FAA TCDS 3A12 Model 172R (s/n 17280001 ขึ้นไป, TC แก้ไข 21 มิ.ย. 1996)' }, '-', ['LE1', 'LE2'], 'สูง', false,
      'ไทย: C172R 5 ลำ (CATC 3 ที่หัวหิน VTPH, BAC 2) และ FNPT แบบ C172R 3 เครื่อง (CATC 1, BAC 2) [LS1, LS2]; 172R ที่ติด kit MK172-72-01 ได้ 180 hp/2,700 rpm ใบพัด 1A170E/JHA7660 MTOW 2,550 lb = เท่ากับ c172s'),
    older_variants: L(Object.fromEntries(Object.entries(OLD).map(([id, o]) => [id, { years: o.years, engine: o.engine, P_kW: C.old[id].P_kW, rpm: o.rpm, prop: o.prop, prop_D_m: C.old[id].prop_D_m, static_rpm: o.static_rpm,
      MTOW_kg: C.old[id].MTOW_kg, flap_max_deg: o.flap_max_deg, VNE_kias: o.VNE_kias, VNO_kias: o.VNO_kias, VA_kias: o.VA_kias, VFE_kias: o.VFE_kias, cg_fwd_mtow_pctMAC: C.old[id].cg_fwd_mtow_pctMAC, cg_aft_pctMAC: C.old[id].cg_aft_pctMAC,
      spec: o.spec }])), '-, kW, rpm, m, kg, deg, kt IAS, %MAC, ft, fpm', ['LE1', 'LE4', 'LE5', 'LB9', 'LB10', 'LS1'], 'กลาง', false,
      'รุ่นเก่า O-320 คาร์บูเรเตอร์ที่ ATO ไทยมี 5 ลำ (AAT M+N, TIF M+N, BAC P) [LS1]: ข้อมูล TCDS 3A12 (สูง) และหน้า spec ของ POH (172N [LE4] สูง; 172P ผ่านหัวข้อ 03 [LB9, LB10] สูง; 172M จาก 172guide [LE5] ต่ำ ความเร็ว stall ของหน้า 172M อ่านไม่ได้จึงไม่ใส่) · ความเร็วจำกัดของ 172M ใน v เป็นชุด s/n ต้น (17260759–17265684) ซึ่งตรงกับ 172M ของ AAT (17265202) และ TIF (17260826) ในทะเบียน [LS1]; 172N ของทั้งสองสถาบันเป็นรุ่น 1977–79 (VNE 160) · ไม่ทำบัตรแยก ถ้าจะบินในซิมให้ใช้ c172r แล้วแก้ P, MTOW, แฟลปสุด (40° ของ M/N) ตาม §10.10'),
    weights: {
      MTOW: L(C.geom.MTOW_kg, 'kg', ['LE1', 'LE2'], 'สูง', false, '2,450 lb normal; utility 2,100 lb (952.5 kg) เมื่อใช้ POH/AFM 172RPHUS ทุกฉบับหรือ 172RPHAUS-00 ถึง -03 และ 2,200 lb (997.9 kg) เมื่อใช้ 172RPHAUS-04 ขึ้นไปหรือ 172RPHBUS [LE1 Section Model 172R]'),
      MLW: L(C.geom.MTOW_kg, 'kg', ['LE1', 'LE2'], 'สูง', false, '2,450 lb เท่า MTOW'),
      MRW: L(C.geom.ramp_kg, 'kg', ['LE1', 'LE2'], 'สูง', false, '2,457 lb'),
      BEW_typical: L(C.geom.BEW_kg, 'kg', ['LE2'], 'กลาง', false, `1,639 lb standard empty weight (IM p ii, Feb 2000); 172guide ให้ 1,699 lb (${C.geom.BEW_alt_kg} kg) น่าจะเป็นฉบับปรับปรุงที่อุปกรณ์มากขึ้น ต่างกันรายลำ`),
      max_fuel_usable: L(C.geom.fuel_usable_kg, 'kg', ['LE1', 'LE2'], 'สูง', false, `53 US gal ใช้ได้ (${C.geom.fuel_usable_L} L) จาก 56 gal ที่ 6.0 lb/gal; ถังปีก 2 × 28 gal ที่ 48.0 in DAT`),
      useful_load: L(C.geom.useful_kg, 'kg', ['LE2'], 'กลาง', false, '818 lb (IM p ii); utility 468 lb; 172guide 758 lb'),
      training_mass: L(C.training.total_kg, 'kg', ['LE0', 'LE2'], 'ต่ำ', true, `ค่าประมาณ (กฎเดียวกับ c172s): BEW 743.4 kg + ครู 85 kg + ศิษย์ 75 kg + เชื้อเพลิง 35 gal (95.3 kg) = ${C.training.total_kg} kg (${C.training.total_lb} lb); การเทียบ POH ใช้ --mass ${C.geom.MTOW_kg}`),
    },
    cg: {
      envelope: L(C.cg.normal, 'kg, m DAT', ['LE1', 'LE2'], 'สูง', false, `normal: หน้า 35.0 in (${C.cg.normal_pctMAC.fwd_low} %MAC) ที่ ≤1,950 lb เชิงเส้นถึง 40.0 in (${C.cg.normal_pctMAC.fwd_mtow} %MAC) ที่ 2,450 lb; หลัง 47.3 in (${C.cg.normal_pctMAC.aft} %MAC) ทุกน้ำหนัก; utility หน้า 36.5 in ที่ 2,100 lb (POH 172RPHUS หรือ 172RPHAUS-00..-03) หรือ 37.5 in ที่ 2,200 lb (172RPHAUS-04 ขึ้นไปหรือ 172RPHBUS) หลัง 40.5 in; datum = ผิวหน้าส่วนล่างของ firewall, LEMAC 25.9 in, MAC 58.8 in (เท่ากับ 172S) · CG อ้างอิงของบัตร 42.0 in (27.4 %MAC) สืบทอดจาก c172s และอยู่ในช่วงทุกน้ำหนัก`),
    },
    inertia: {
      Ixx: L(C.inertia.MTOW_TM.Ixx, 'kg m2', ['LM5', 'LE0'], 'ต่ำ', true, 'ค่าประมาณ: radii ของเครื่องคลาส C172 ที่วัดใน TM-80163 (Rx 0.235) กับมวล 1,111.3 kg, b 11.00 m (เหมือน c172s)'),
      Iyy: L(C.inertia.MTOW_TM.Iyy, 'kg m2', ['LM5', 'LE0'], 'ต่ำ', true, 'ค่าประมาณ: Ry 0.324, L 8.28 m (27 ft 2 in ตาม IM 172R)'),
      Izz: L(C.inertia.MTOW_TM.Izz, 'kg m2', ['LM5', 'LE0'], 'ต่ำ', true, 'ค่าประมาณ: Rz 0.364'),
      Ixz: L(C.inertia.MTOW_TM.Ixz, 'kg m2', ['LM5', 'LE0'], 'ต่ำ', true, 'ค่าประมาณ: 123 kg m2 ของ TM-80163 คูณ m/837.9'),
      ref_mass: L(C.geom.MTOW_kg, 'kg', ['LE1'], 'สูง', false, 'MTOW 2,450 lb; lm_card คูณ inertia ด้วย m/ref_mass'),
    },
    geometry: {
      length: L(C.geom.length_m, 'm', ['LE2'], 'กลาง', false, '27 ft 2 in (IM 172R Fig 1-1); บัตร c172s ใช้ 26 ft 11 in (8.205 m) จาก IM 172S ต่างกัน 3 in น่าจะเป็นวิธีวัด (spinner) ไม่ใช่โครงลำต่างกัน'),
      height: L(C.geom.height_max_m, 'm', ['LE2'], 'กลาง', false, '8 ft 11 in "MAX" (IM 172R Fig 1-1, รวมเสาอากาศ/ไฟบนหาง) ต่างจาก 2.36 m ในบัตร c172s ดู §10.13'),
    },
  },
});

// ── 2. aero (only POH-derived polar and the legacy fit; static/dynamic/control derivatives inherited) ──
const aero = {
  derivatives: {
    CD0: L({ cruise: C.cleanPolar.CD0, glide_windmill: C.glide.CD0 }, '-', ['LE2', 'LE3', 'LC4', 'LE0'], 'ต่ำ', true, `ค่าประมาณ: cruise จาก 80 % (128 hp) 8,000 ft 122 KTAS (มี speed fairing) ที่ 2,450 lb, η 0.80 (สมมติ เท่ากับบัตร c172s), e 0.75; ตรงกับ ${C.cruiseTableRatio.n} จุดของ Fig 5-8 ภายใน ${r((C.cruiseTableRatio.min - 1) * 100, 0)} ถึง +${r((C.cruiseTableRatio.max - 1) * 100, 0)} %; glide จาก 65 KIAS (${C.glide.vbg_kcas} KCAS) L/D 9.11 (1.5 NM/1,000 ft); c172s 0.033 / 0.0508`),
    K: L({ cruise: C.cleanPolar.K, glide_windmill: C.glide.K }, '-', ['LE2', 'LE3', 'LC4', 'LE0'], 'ต่ำ', true, `ค่าประมาณ: cruise e 0.75 AR 7.48; glide e ${C.glide.e} (รวมแรงต้านใบพัดหมุนฟรี)`),
  },
};
if (FIT) aero.legacy = L({ CD0: FIT.legacy.aero.CD0, K: FIT.legacy.aero.K, CL0: FIT.legacy.aero.CL0, CLa: FIT.legacy.aero.CLa, CLflap: FIT.legacy.aero.CLflap, CDflap: FIT.legacy.aero.CDflap, CDgear: FIT.legacy.aero.CDgear,
  Cm0: FIT.legacy.aero.Cm0, Cma: FIT.legacy.aero.Cma, Cmflap: FIT.legacy.aero.Cmflap, aStall: r(FIT.legacy.aero.aStall, 2), aStallFlap: r(FIT.legacy.aero.aStallFlap, 2) }, '-, 1/rad, deg', ['LM0', 'LE0'], 'กลาง', true,
  `ค่าประมาณ: lm_legacy_fit โหมด static (le_fit.mjs): polar รูปแบบซิมจาก glide 65 KIAS L/D 9.11 ที่ 2,450 lb; aStall/aStallFlap แก้หาให้ CLmax 1 g ตรง CLmax ของบัตร (สืบทอดจาก c172s ซึ่งตรง stall ของ 172R ภายใน 0.2 %); CL0/CLa/flap/Cm จากบัตร c172s (AC.flaps 0–1 = 0–30°)`);
add('aero (เฉพาะส่วนที่ต่างจาก c172s)', { aero });

// ── 3. speeds ──
add('speeds', { speeds: {
  VS0_kt: L(47, 'kt CAS', ['LE3', 'LE2'], 'สูง', false, 'แฟลป 30 power off 2,450 lb (Fig 5-3 ทั้ง CG หน้าและหลัง; IM p ii); KIAS 33 (ขอบล่าง white arc) ซึ่ง POH บอกว่าเป็นค่าโดยประมาณ'),
  VS1_kt: L(52, 'kt CAS', ['LE3'], 'สูง', false, 'แฟลป 0 power off 2,450 lb CG หน้าสุด (Fig 5-3, KIAS 44 = ขอบล่าง green arc); หน้า spec (IM p ii) และ 172guide ให้ 51 KCAS = ค่า CG หลังสุด'),
  VX_kt: L(60, 'kt IAS', ['LE2'], 'สูง', false, 'SL (62 KCAS); 65 KIAS ที่ 10,000 ft (IM p4-5)'),
  VY_kt: L(79, 'kt IAS', ['LE2', 'LE3'], 'สูง', false, `SL (${C.speedsCAS.VY_79} KCAS); 71 KIAS ที่ 10,000 ft; ตาราง Fig 5-6 ลดจาก 79 ถึง 69 KIAS ที่ 12,000 ft`),
  VR_kt: L(51, 'kt IAS', ['LE3'], 'สูง', false, `short field แฟลป 10 lift-off 51 KIAS (${C.speedsCAS.VR_51_f10} KCAS) และ 57 KIAS ที่ 50 ft (Fig 5-5); normal takeoff ยกล้อหน้าที่ 55 KIAS (IM p4-15)`),
  VAPP_kt: L(65, 'kt IAS', ['LE2'], 'กลาง', false, `normal approach แฟลป 30 60–70 KIAS ใช้กลางช่วง (${C.speedsCAS.VAPP_65_f30} KCAS); แฟลปขึ้น 65–75 KIAS`),
  VAPP_short_kt: L(62, 'kt IAS', ['LE2', 'LE3'], 'สูง', false, `short field แฟลป 30 (${C.speedsCAS.VREF_62_f30} KCAS)`),
  VREF_kt: L(62, 'kt IAS', ['LE3'], 'สูง', false, 'ความเร็วที่ 50 ft ของ Fig 5-11 (short field แฟลป 30); แฟลปขึ้น +7 KIAS'),
  VG_kt: L(65, 'kt IAS', ['LE2', 'LE3'], 'สูง', false, `2,450 lb แฟลปขึ้น (${C.speedsCAS.VG_65} KCAS) IM p3-3, Fig 3-1`),
  VA_kt: L({ 1600: 82, 2000: 92, 2450: 99 }, 'kt IAS', ['LE2', 'LE1'], 'สูง', false, 'lb → KIAS (KCAS 82/91/97) IM p2-4; TCDS 99 KIAS (97 KCAS)'),
  VNO_kt: L(129, 'kt IAS', ['LE2', 'LE1'], 'สูง', false, '126 KCAS'),
  VNE_kt: L(163, 'kt IAS', ['LE2', 'LE1'], 'สูง', false, '160 KCAS (ตาราง Fig 5-1 ไปถึง 160 KIAS = 154 KCAS เท่านั้น ดู §10.13)'),
  VFE: L({ 10: 110, 20: 85, 30: 85 }, 'kt IAS', ['LE2', 'LE1'], 'สูง', false, 'แฟลป 10° 110 KIAS (108 KCAS), 10–30° 85 KIAS (84 KCAS); TCDS ระบุเฉพาะ 85 KIAS'),
  ias_cas: L(POH.iasCas, 'KIAS → KCAS', ['LE3'], 'กลาง', false, 'Fig 5-1 normal static source, power for level flight (p5-9); อ่านจาก OCR จับคู่คอลัมน์ตามลำดับ; ต่างจากตารางของ 172S ที่ความเร็วต่ำ (แฟลป 30 ที่ 40 KIAS: 47 vs 50 KCAS)'),
  // review 2026-11-19: the next three leaves were inherited from c172s with 172S sources; same values, now with the 172R documents
  stall_warning_margin_kt: L(5, 'kt', ['LE2', 'LM3'], 'สูง', false, 'แตรเตือน stall ดัง 5–10 kt ก่อน stall ทุก configuration (IM p4-30); ใช้ขอบล่าง 5 kt ซึ่งเป็นค่าต่ำสุดตาม 14 CFR 23.207 เดิม'),
  stall_altitude_loss_ft: L(230, 'ft', ['LE3'], 'สูง', false, 'หมายเหตุของ Fig 5-3 (p5-12): เสียความสูงตอนแก้ stall ได้ถึง 230 ft (70 m)'),
  crosswind_demonstrated_kt: L(15, 'kt', ['LE2'], 'สูง', false, 'ลมขวางตรงที่สาธิตแล้ว 15 kt (7.7 m/s) ทั้งวิ่งขึ้นและลงจอด (IM p4-5, p4-33) ไม่ใช่ข้อจำกัด'),
  stall_table: L({ cg_fwd: POH.stall.fwd, cg_aft: POH.stall.aft, bank_deg: [0, 30, 45, 60], cell: '[KIAS, KCAS]' }, 'kt', ['LE3'], 'กลาง', false, `Fig 5-3 2,450 lb power off (p5-12); ข้อความ OCR สลับตำแหน่ง ผู้วิจัยจัดเข้าช่องตามลำดับคอลัมน์และตรวจว่าทุกช่องตรง V0/√cos φ ภายใน ${C.stallTableCheck.maxDev_kt} kt; บล็อกที่ความเร็วสูงกว่าถือเป็น CG หน้าสุด; KIAS เป็นค่าโดยประมาณตาม POH`),
} });

// ── 4. performance ──
const nofair = 'ทุกค่ารวมหน้า spec เป็นความเร็วของเครื่องที่ติด speed fairing (หมายเหตุของ IM p iii และ Fig 5-8) ลบราว 2 kt ถ้าไม่มี';
add('performance', { performance: {
  ROC_SL_fpm: L(720, 'fpm', ['LE2', 'LE3'], 'สูง', false, '2,450 lb SL ISA (IM p ii); interpolate Fig 5-6 ที่ 15 °C ได้ 721 fpm'),
  ROC_table: L({ axes: { PA_ft: POH.roc.PA, OAT_C: POH.roc.OAT }, kias: POH.roc.kias, data: POH.roc.fpm }, 'fpm', ['LE3'], 'สูง', false, `Fig 5-6 2,450 lb แฟลปขึ้น คันเร่งเต็ม (p5-15); leaned เหนือ 3,000 ft; null = ไม่มีข้อมูล; VTBD 35 °C ≈ ${C.hot[35].roc_fpm} fpm`),
  service_ceiling_ft: L(13500, 'ft', ['LE2'], 'สูง', false, `IM p ii; extrapolate คอลัมน์ ISA ของ Fig 5-6 ได้ 100 fpm ที่ ${C.ceilings.service_100fpm_ft} ft`),
  cruise_table: L([{ alt_ft: 8000, power: '80 %', ktas: 122, note: 'หน้า spec (IM p ii) มี speed fairing (ไม่มี ≈ 120)' }, { alt_ft: 0, power: 'max', ktas: 123, note: 'หน้า spec มี speed fairing' },
    ...[...POH.cruiseISA, ...POH.cruiseISA2].map(([pa, rpm, pct, ktas, gph]) => ({ alt_ft: pa, rpm, power: `${pct} %`, ktas, gph, isa: 0 }))], 'ft, rpm, -, kt TAS, US gal/h', ['LE2', 'LE3'], 'กลาง', false,
    `จุดสรุป p ii และคอลัมน์ ISA ของ Fig 5-8 ทั้งสองแผ่น (p5-17 2,000–6,000 ft และ p5-18 8,000–12,000 ft, 2,450 lb recommended lean) ${nofair}; IM p4-27: 80 % ที่ SL/4,000/8,000 ft = 113/117/122 KTAS; 80 % ที่ 8,000 ft ใช้ 2,400 rpm (แผ่น 2)`),
  glide: L({ speed_kt: 65, ratio: C.glide.E }, 'kt IAS, -', ['LE2', 'LE3', 'LC4'], 'ต่ำ', true, 'ความเร็ว 65 KIAS จาก POH (สูง); อัตราร่อน 9.1 = rule of thumb 1.5 NM ต่อ 1,000 ft สำหรับ C152 และ C172 ของ FAA AFS-920 18-05 เพราะกราฟ Fig 3-1 (แกน 0–12,000 ft × 0–20 NM) อ่านเป็นตัวเลขไม่ได้ (ค่าประมาณ)'),
  takeoff: L({ ground_roll_m: C.hot[15].to_roll_m, over50ft_m: C.hot[15].to_50_m }, 'm', ['LE2', 'LE3'], 'สูง', false, 'short field แฟลป 10 2,450 lb SL ISA ลมสงบผิวแห้ง: 945 / 1,685 ft (IM p ii, Fig 5-5)'),
  landing: L({ ground_roll_m: C.hot[15].ldg_roll_m, over50ft_m: C.hot[15].ldg_50_m }, 'm', ['LE2', 'LE3'], 'สูง', false, 'short field แฟลป 30 62 KIAS เบรกสุด: 550 / 1,295 ft (IM p ii, Fig 5-11)'),
  takeoff_table: L({ axes: { PA_ft: POH.to.PA, OAT_C: POH.to.OAT }, roll_ft: POH.to.roll, total50_ft: POH.to.total }, 'ft', ['LE3'], 'กลาง', false, `Fig 5-5 short field 2,450 lb แฟลป 10 lift-off 51 KIAS 57 KIAS ที่ 50 ft (p5-14); แถว 5,000 ft OCR เพี้ยนบางช่อง; null = POH เว้นไว้ (ไต่ได้น้อย); VTBD 35 °C: ${C.hot[35].to_roll_ft} / ${C.hot[35].to_50_ft} ft`),
  landing_table: L({ axes: { PA_ft: POH.ldg.PA, OAT_C: POH.ldg.OAT }, roll_ft: POH.ldg.roll, total50_ft: POH.ldg.total }, 'ft', ['LE3'], 'กลาง', false, `Fig 5-11 2,450 lb แฟลป 30 62 KIAS (p5-21); null = OCR อ่านไม่ได้; ลมหน้า −10 %/9 kt, ลมหลัง +10 %/2 kt, หญ้าแห้ง +45 % ของ ground roll, แฟลปขึ้น +7 KIAS และ +35 %; VTBD 35 °C: ${C.hot[35].ldg_roll_ft} / ${C.hot[35].ldg_50_ft} ft`),
  fuel: L({ usable_L: C.geom.fuel_usable_L, usable_kg: C.geom.fuel_usable_kg, range_80pct_8000ft_nm: 580, endurance_80pct_h: 4.8, range_60pct_10000ft_nm: 687, endurance_60pct_h: 6.6, bsfc_g_per_kWh: C.bsfc.g_per_kWh }, 'L, kg, NM, h, g/kWh', ['LE2', 'LE3', 'LE0'], 'สูง', false,
    `p ii: 53 gal ใช้ได้ เครื่องติด speed fairing (ระยะเปลี่ยนตาม); ระยะรวมเชื้อเพลิง start/taxi/takeoff/climb และสำรอง 45 นาที ตาม Fig 5-9 p5-19; BSFC เฉลี่ย ${C.bsfc.lb_per_hp_h} lb/(hp h) จาก ${C.bsfc.n} จุดของ Fig 5-8 ทั้งสองแผ่น (คำนวณ)`),
  tests: L([
    { id: 'T-LE-05', case: 'stall_f0', conditions: '2,450 lb, CG หน้าสุด, idle, แฟลป 0, ปีกระดับ, ลด 1 kt/s', quantity: 'VS1 KCAS (Vmin)', expected: 52, tolerance: 3 },
    { id: 'T-LE-06', case: 'stall_f10', conditions: 'เหมือน stall_f0 แฟลป 10', quantity: 'VS KCAS', expected: 50, tolerance: 3 },
    { id: 'T-LE-07', case: 'stall_f30', conditions: 'เหมือน stall_f0 แฟลป 30', quantity: 'VS0 KCAS', expected: 47, tolerance: 3 },
    { id: 'T-LE-08', case: 'climb_SL', conditions: '2,450 lb, SL ISA, คันเร่งเต็ม, แฟลป 0', quantity: 'ROC สูงสุด fpm / Vy KCAS', expected: [720, 78.1], tolerance: [100, 3] },
    { id: 'T-LE-10', case: 'climb_8000', conditions: '2,450 lb, 8,000 ft ISA, คันเร่งเต็ม, แฟลป 0', quantity: 'ROC สูงสุด fpm', expected: C.rocISA[4][2], tolerance: 100 },
    { id: 'T-LE-11', case: 'glide', conditions: '2,450 lb, 3,000 ft ISA, แรงขับศูนย์, แฟลป 0', quantity: 'VG KCAS / L/D (ค่าประมาณ)', expected: [C.speedsCAS.VG_65, C.glide.E], tolerance: [3, 0.5] },
    { id: 'T-LE-12/13', case: 'takeoff_SL', conditions: 'short field แฟลป 10, 2,450 lb, SL 15 °C, ลมสงบ, ทางแห้ง', quantity: 'ground roll m / ถึง 50 ft m', expected: [C.hot[15].to_roll_m, C.hot[15].to_50_m], tolerance: ['5 %', '10 %'] },
    { id: 'T-LE-14', case: 'takeoff_VTBD_35C', conditions: 'เหมือน takeoff_SL แต่ OAT 35 °C', quantity: 'ground roll m / ถึง 50 ft m', expected: [C.hot[35].to_roll_m, C.hot[35].to_50_m], tolerance: ['10 %', '10 %'] },
    { id: 'T-LE-15/16', case: 'landing_SL', conditions: 'short field แฟลป 30, 62 KIAS ที่ 50 ft, power off, เบรกสุด, 2,450 lb, SL 15 °C', quantity: 'ถึงหยุดจาก 50 ft m / ground roll m', expected: [C.hot[15].ldg_50_m, C.hot[15].ldg_roll_m], tolerance: ['10 %', '10 %'] },
    { id: 'T-LE-17', case: 'vmax_SL', conditions: '2,450 lb, SL ISA, คันเร่งเต็ม, บินระดับ (มี speed fairing)', quantity: 'KTAS', expected: 123, tolerance: 3 },
    { id: 'T-LE-18', case: 'cruise_8000_80pct', conditions: '2,450 lb, 8,000 ft ISA, 2,400 rpm 80 % (มี speed fairing)', quantity: 'KTAS ที่กำลังนี้ (ซิมวันนี้ตรวจว่าคันเร่ง ≤ 1)', expected: 122, tolerance: 3 },
  ], '-', ['LE2', 'LE3', 'LE0'], 'สูง', false, 'จุดเป้าจาก POH สำหรับเทสต์อัตโนมัติ (รายละเอียดและผลของซิมวันนี้ใน §10.12); expected ตามลำดับ quantity; tolerance เป็นหน่วยเดียวกับ expected หรือ %; glide ratio เป็นค่าประมาณ (1.5 NM/1,000 ft)'),
  vtbd_hot_day: L({ to_roll_ft: C.hot[35].to_roll_ft, to_50_ft: C.hot[35].to_50_ft, ldg_roll_ft: C.hot[35].ldg_roll_ft, ldg_50_ft: C.hot[35].ldg_50_ft, roc_fpm: C.hot[35].roc_fpm,
    to_roll_m: C.hot[35].to_roll_m, to_50_m: C.hot[35].to_50_m, ldg_roll_m: C.hot[35].ldg_roll_m, ldg_50_m: C.hot[35].ldg_50_m, oat30: { to_roll_ft: C.hot[30].to_roll_ft, to_50_ft: C.hot[30].to_50_ft, roc_fpm: C.hot[30].roc_fpm } }, 'ft, fpm, m', ['LE3', 'LE0'], 'กลาง', true,
    'interpolate ตาราง POH ที่ PA 0 ft (VTBD 9 ft) OAT 35 °C 2,450 lb ลมสงบ (ค่าประมาณจากการ interpolate); วิ่งขึ้นยาวขึ้น 16 % ROC ลดลง 9 % เทียบ ISA'),
} });

// ── 5. propulsion, piston, propeller, slipstream ──
const prop = C.prop, cs = prop.chordScale, GA_CD = PROPS.fixed_76x60.cD, GA_CX = PROPS.fixed_76x60.cx;
add('propulsion, piston, propeller', {
  propulsion: {
    layout: L([{ id: 1, pos: [1.905, 0, 0], axis: [1, 0, 0], type: 'piston', model: 'Lycoming IO-360-L2A (160 hp @ 2,400 rpm)', prop_sense: 1 }], 'm FRD', ['LE1', 'LC8', 'LC0'], 'กลาง', true, 'ตำแหน่งดุมใบพัดเหมือน c172s (ค่าประมาณ); ใบพัดหมุนตามเข็มเมื่อมองจากห้องนักบิน'),
    ...(FIT ? { legacy: L({ P: FIT.legacy.propulsion.P, eta: FIT.legacy.propulsion.eta, T0: FIT.legacy.propulsion.T0, idle: FIT.legacy.propulsion.idle }, 'W, -, N, -', ['LM0', 'LE0'], 'กลาง', true,
      `ค่าประมาณ: lm_legacy_fit โหมด static (le_fit.mjs): T0 = แรงขับสถิต BEM ${prop.static.T0_N} N ของใบพัด 75×70 ที่ 2,115 rpm แล้ว fit Vc ให้ ROC 720 fpm; idle 0 เพราะ polar จาก glide รวมแรงต้านใบพัดแล้ว`) } : {}),
  },
  piston: {
    identity: L({ model: 'IO-360-L2A', kind: 'fuel_injected', displacement_L: 5.916, cylinders: 4, tcds: 'FAA 1E10 / EASA IM.E.032' }, '-', ['LM21', 'LE1'], 'สูง', false, 'เครื่องรุ่นเดียวกับ 172S แต่ TCDS ของเครื่องบินจำกัดรอบ 2,400 rpm = พิกัดหลัก 119 kW ของ IM.E.032'),
    ratings: {
      P_rated: L(C.geom.P_W, 'W', ['LE1', 'LE2', 'LM21'], 'สูง', false, '160 BHP @ 2,400 rpm (EASA IM.E.032 พิกัดหลัก 119 kW @ 2,400)'),
      rpm_rated: L(2400, 'rpm', ['LE1', 'LE2'], 'สูง', false, 'รอบสูงสุด (tach red line); green arc 1,900–2,400'),
      P_mcp: L(C.geom.P_W, 'W', ['LE2'], 'สูง', false, 'ไม่มีจำกัดเวลา takeoff'),
      rpm_redline: L(2400, 'rpm', ['LE1', 'LE2'], 'สูง', false, ''),
    },
    fuel: L({ fuel: 'avgas 100LL (100/100LL)', bsfc_g_per_kWh: C.bsfc.g_per_kWh, density_kg_L: 0.72 }, '-, g/kWh, kg/L', ['LE3', 'LE0'], 'กลาง', false, `BSFC ${C.bsfc.lb_per_hp_h} lb/(hp h) (ช่วง ${C.bsfc.min}–${C.bsfc.max}) = GPH × 6.0 lb / (%BHP × 160 hp) เฉลี่ย ${C.bsfc.n} จุดคอลัมน์ ISA ของ Fig 5-8 แผ่น 1–2 (recommended lean)`),
  },
  propeller: {
    identity: {
      model: L('McCauley 1C235/LFA7570', '-', ['LE1'], 'สูง', false, 'TCDS 3A12 172R ฐาน; spinner dwg 0550236'),
      diameter: L(C.geom.prop_D_m, 'm', ['LE1', 'LE2'], 'สูง', false, '75 in (ต่ำสุด 74 in = 1.880 m)'),
    },
    fixed: {
      pitch_in: L(70, 'in', ['LE1', 'LC6'], 'กลาง', false, 'จากรหัส 7570 = 75 in × 70 in (แบบแผนชื่อรุ่นของ McCauley เหมือนที่บัตร c172s ใช้กับ 7660)'),
      beta75_deg: L(prop.beta75_deg, 'deg', ['LE0'], 'กลาง', false, 'atan(70/(0.75π·75))'),
      static_rpm_range: L([2065, 2165], 'rpm', ['LE1', 'LE2'], 'สูง', false, 'คันเร่งเต็ม อยู่กับที่ mixture leaned for max rpm; ไม่มี tolerance เพิ่ม'),
    },
    engineInterface: { maxShaftPower: L(C.geom.P_kW, 'kW', ['LE1'], 'สูง', false, '160 hp') },
    bladeGeometry: {
      chordOverD: L({ axes: { x: GA_CX }, data: GA_CD.map(c => r(c * cs, 4)) }, 'c/D', ['LM0', 'LE0'], 'ต่ำ', true, `ค่าประมาณ: รูปใบ GA ของ lm_prop × ${cs} (ปรับให้รอบสถิต 2,115 rpm กลางช่วง TCDS ที่ 160 hp/2,400 rpm)`),
      twistDesignJ: L(r(70 / 75, 3), '-', ['LE0'], 'กลาง', false, 'pitch เรขาคณิตคงที่ = helical ที่ J = p/D'),
    },
    tables: {
      CT: L({ axes: { J: prop.table.map(t => t[0]) }, data: prop.table.map(t => t[1]) }, '-', ['LM0', 'LE0'], 'ต่ำ', true, 'BEM lm_prop (ค่าประมาณ ใบ 75×70 เชือกใบปรับแล้ว) ที่ 2,100 rpm ISA SL'),
      CP: L({ axes: { J: prop.table.map(t => t[0]) }, data: prop.table.map(t => t[2]) }, '-', ['LM0', 'LE0'], 'ต่ำ', true, 'ค่าประมาณ: BEM lm_prop ชุดเดียวกับ CT; η สูงสุด ' + prop.peakEta + ' ที่ J ≈ 0.9'),
    },
    checks: {
      staticThrustISA: L(r(prop.static.T0_N / 1000, 2), 'kN', ['LM0', 'LE0'], 'ต่ำ', true, `ค่าประมาณ: BEM ${prop.static.rpm} rpm FM ${prop.static.FM} (${prop.static.T0_lbf} lbf); ช่วง TCDS 2,065–2,165 rpm ให้ ${prop.static_range.rpm2065_T0_N}–${prop.static_range.rpm2165_T0_N} N`),
      staticThrustVTBD31C: L(r(prop.staticISA20.T0_N / 1000, 2), 'kN', ['LM0', 'LE0'], 'ต่ำ', true, `ค่าประมาณ: BEM ที่ ISA+20 (35 °C) ${prop.staticISA20.rpm} rpm`),
      momentumIdealStaticISA: L(r(prop.momentumIdealStatic_N / 1000, 2), 'kN', ['LE0'], 'กลาง', false, `FM = 1 ที่กำลังที่ดูด ${prop.static.P_hp} hp, A = π·0.9525²`),
      peakEfficiency: L(prop.peakEta, '-', ['LM0', 'LE0'], 'ต่ำ', true, 'ค่าประมาณ: BEM ที่ J ≈ 0.9'),
      levelFlight: L({ v123kt_rpm: prop.at123.rpm, v123kt_eta: prop.at123.eta, cruise80_8000ft_rpm: prop.cruise80_8000.rpm, vmax_clean_polar_kt: prop.vmax_SL_clean_polar_kt,
        poh_cruise_absorb_ratio: [Math.min(...prop.cruiseAbsorb.map(x => x.ratio)), Math.max(...prop.cruiseAbsorb.map(x => x.ratio))] }, 'rpm, -, kt TAS', ['LM0', 'LE0', 'LE3'], 'ต่ำ', true,
        'ค่าประมาณ: ตรวจใบพัด BEM: ที่จุด cruise ของ Fig 5-8 (rpm และ KTAS ตาม POH) ใบพัดดูดกำลัง 0.90–0.95 เท่าของ %BHP × 160 hp (8,000 ft 2,400 rpm 122 KTAS: 120 vs 128 hp) และ คันเร่งเต็มบินระดับ SL ที่ 123 KTAS ต้องการรอบเกิน 2,400 rpm เล็กน้อย และ polar สะอาดให้ความเร็วสูงสุด 130 kt (POH 123) แสดงว่า CD0 cruise หรือ η ของ BEM สูง/ต่ำไปราว 5 %'),
    },
  },
  interference: { slipstream: { diskDiameter: L(C.geom.prop_D_m, 'm', ['LE1'], 'สูง', false, '75 in') } },
});

// ── 6. gear certification, wind, validation targets ──
const vt = {
  trim_targets: { approach: L({ ias_kt: 66, h_m: 300, gamma_deg: -3 }, 'kt CAS, m, deg', ['LE2', 'LE0'], 'กลาง', false, 'normal approach แฟลป 30 65 KIAS ≈ 65.5 KCAS') },
  takeoff_test: L({ flap: '10', VR_kt: FIT?.takeoff_VR_kcas ?? 51, theta_deg: FIT?.takeoff_theta_deg ?? 12 }, '-, kt CAS, deg', ['LE3', 'LE0'], 'กลาง', true,
    'short field: lift-off 51 KIAS ≈ 55.7 KCAS ตามตาราง (ค่าสอบเทียบใช้กับการบินระดับ); VR และ θ ของการทดสอบเลือกตามวิธีของ c172s ปรับตาม √(มวล) (ค่าประมาณ)'),
};
add('gear, wind, validation', {
  gear: { certification: { part23_limit_descent: L({ formula: 'V = 4.4 (W/S)^0.25 fps, 7..10', WS_lb_ft2: C.part23.WS_lb_ft2, V_fps: C.part23.Vdesc_fps, V_mps: C.part23.Vdesc_mps }, 'fps', ['LM3', 'LE0'], 'กลาง', false, `14 CFR 23.473(d) เดิม กับ W/S ${C.part23.WS_lb_ft2} lb/ft² (IM: 14.1)`) } },
  ...(FIT?.excessTW != null ? { wind: { fFactor: { trainerExcessTW: L(FIT.excessTW, '-', ['LE0'], 'ต่ำ', true, 'ค่าประมาณ: (T − D)/W ที่ approach แฟลป 30 คันเร่งเต็ม (โมเดล legacy ของบัตร)') } } } : {}),
  validation: vt,
});

// ── write ──
// compact layout: one leaf per line (as the other topic files), nested groups indented
const isLeafObj = o => o && typeof o === 'object' && !Array.isArray(o) && 'v' in o && 'scope' in o;
const fmt = (o, ind = 1) => {
  const pad = ' '.repeat(ind), keys = Object.keys(o);
  return '{\n' + keys.map((k, i) => pad + JSON.stringify(k) + ': ' + (isLeafObj(o[k]) ? JSON.stringify(o[k]) : fmt(o[k], ind + 1)) + (i < keys.length - 1 ? ',' : '')).join('\n') + '\n' + ' '.repeat(ind - 1) + '}';
};
const md = blocks.map(b => `**${b.title}**\n\n\`\`\`json\n${fmt(b.obj)}\n\`\`\``).join('\n\n');
for (const b of blocks) JSON.parse(fmt(b.obj));   // self-check: the compact text is valid JSON
fs.mkdirSync(path.join(HERE, 'out'), { recursive: true });
fs.writeFileSync(path.join(HERE, 'out', 'le_json_blocks.md'), md + '\n');
if (fs.existsSync(TOPIC)) {
  const t = fs.readFileSync(TOPIC, 'utf8'), A = '<!-- LE-JSON-BEGIN -->', B = '<!-- LE-JSON-END -->';
  const i = t.indexOf(A), j = t.indexOf(B);
  if (i >= 0 && j > i) { fs.writeFileSync(TOPIC, t.slice(0, i + A.length) + '\n' + md + '\n' + t.slice(j)); console.log('spliced into 10-c172r.md'); }
  else console.log('markers not found: blocks only in scripts/out/le_json_blocks.md');
}
console.log(`blocks ${blocks.length}, fit ${FIT ? 'yes' : 'no'}`);
