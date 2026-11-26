// r_json.mjs; สร้างบล็อก JSON ของ atr72_600 (หัวข้อ 3.1) จากค่าที่สรุปในไฟล์หัวข้อ แล้วตรวจรูปแบบ leaf
// ใช้: node r_json.mjs > blocks.md   (พิมพ์ 4 บล็อก ```json แต่ละบล็อกมีคีย์บนสุด atr72_600 คีย์เดียว)
const Lf = (v, u, scope, src, conf, est, note) => ({ v, u, scope, src, conf, est, note });
const A = 'aircraft', E = 'engine', P = 'propeller', G = 'gear';

const b1 = { atr72_600: {
  _na: { v: ['turbofan.*', 'aero.spin_reference.*', 'aero.mach.CD_wave_table', 'gear.certification.part23_limit_descent', 'gear.certification.part23_wing_lift_ratio', 'gear.certification.part23_min_load_factors', 'gear.certification.part23_reserve_drop_factor', 'wind.fFactor.trainerExcessTW', 'wind.wake.trainerRollControl', 'validation.typicalModes.*'], u: '-', scope: A, src: [], conf: 'สูง', est: false, note: 'เทอร์โบพร็อปสองเครื่องยนต์ CS-25: ไม่มีเทอร์โบแฟน, ไม่รับรอง spin, MMO 0.55 จึงไม่ต้องมีตาราง wave drag, เกณฑ์ Part 23 และค่าของเครื่องฝึก/แบบอ้างอิงอื่นใช้ไม่ได้' },
  airframe: {
    identity: Lf({ manufacturer: 'ATR (GIE Avions de Transport Régional)', model: 'ATR 72-212A', variant: '"600 version" = Major Modification 5948 (CS-25 Amdt 3)', engine: '2 × Pratt & Whitney Canada PW127M (PW127N/PW127XT-M เป็นตัวเลือก)', propeller: 'Hamilton Sundstrand (ปัจจุบัน Collins) 568F-1, 6 ใบ คอมโพสิต', seats: '74 สูงสุดตามการรับรอง (78 ด้วย Mod 7289/10001); Bangkok Airways 70', icao_type: 'AT76',
      operatorsDMK: ['Bangkok Airways (PG): ATR 72-600 10 ลำ + สั่ง 12 (ส.ค. 2025); เส้นทาง Koh Samui–Don Mueang 3 เที่ยว/วันด้วย ATR72 ตั้งแต่ 29 ต.ค. 2023 (สถานะปี 2026 ยังไม่ยืนยัน)', 'Nok Air (DD): เคยใช้ ATR 72-500 ปี 2014 รับช่วงเส้นทาง Nok Mini/SGA ซึ่งมีฐานที่ DMK; ฝูงบิน ส.ค. 2025 เหลือ 737-800 เท่านั้น', 'โดยรวม ATR 72 ที่ DMK พบน้อย (ราว 1 % ของเที่ยวบิน, ค่าประมาณจากรอบที่ 5)'] },
      '-', A, ['R1', 'R13', 'R37', 'R38', 'R39', 'R41'], 'กลาง', false, 'ตัวตนของแบบสูง; สถานะผู้ให้บริการที่ DMK ปี 2026 ยังไม่ยืนยัน'),
    weights: {
      MTW: Lf({ WV00: 21170, WV09: 22170, WV10: 22180, WV20: 22670, WV30: 22670, WV40: 22970, WV50: 23170 }, 'kg', A, ['R1'], 'สูง', false, 'Maximum ramp weight ตาม weight variant ของ Mod 6852 (TCDS III.13.b); ค่าที่สายการบินไทยใช้: ไม่พบในแหล่งสาธารณะ'),
      MTOW: Lf({ WV00: 21000, WV09: 21999, WV10: 22000, WV20: 22500, WV30: 22500, WV40: 22800, WV50: 23000 }, 'kg', A, ['R1', 'R4', 'R5'], 'สูง', false, 'factsheet: basic 22,800 kg (50,265 lb) = WV40, option 23,000 kg (50,705 lb) = WV50; brochure PW127XT-M ใช้ 23,000 kg'),
      MLW: Lf({ WV00: 21000, WV09: 21850, WV10: 21850, WV20: 22350, WV30: 22350, WV40: 22350, WV50: 22350 }, 'kg', A, ['R1', 'R4'], 'สูง', false, 'factsheet basic 22,350 kg (49,272 lb)'),
      MZFW: Lf({ WV00: 20000, WV09: 20500, WV10: 20000, WV20: 20300, WV30: 20500, WV40: 20800, WV50: 21000 }, 'kg', A, ['R1', 'R4'], 'สูง', false, 'WV10 (20,000) ต่ำกว่า WV09 (20,500) ตามที่พิมพ์ใน TCDS'),
      OEW: Lf({ tech_spec: 13010, typical_in_service_PW127M: 13450, typical_in_service_PW127XT: 13750 }, 'kg', A, ['R4', 'R5'], 'สูง', false, 'ค่าตามเอกสารผู้ผลิต; OEW จริงของแต่ละสายการบินต่างกัน'),
      max_fuel: Lf(5000, 'kg', A, ['R1', 'R4'], 'สูง', false, 'TCDS: เติมปกติด้วย pre-selector 5,000 kg, high level 5,050 kg (6,360 L), unusable 30 kg'),
    },
    cg: {
      MAC: Lf(2.34, 'm', A, ['R4', 'R26', 'R27'], 'ต่ำ', true, 'ค่าประมาณจาก S 61 m², b 27.05 m และ taper 0.50 แบบสี่เหลี่ยมคางหมู (r_aero_modes.mjs); MAC จริงอยู่ใน Weight and Balance Manual ที่ไม่เผยแพร่'),
      LEMAC_x: Lf(11.9, 'm STA', A, [], 'ต่ำ', true, 'ไม่พบในแหล่งสาธารณะ; ประมาณจาก CG ของ build-up (STA 12.5 m ที่ 21 t) ลบ 25 % MAC'),
      fwd_limit_pctMAC: Lf(20.8, '%MAC', A, ['R7'], 'กลาง', false, 'ขอบเขตที่ TOW 20.36 t ของ B-22816 (-600) ตามรายงาน GE235; ขอบหน้าเปลี่ยนตามน้ำหนัก (AFM); NTSB AAR-96/01 ให้ช่วง 10–39 % สำหรับ 72-212 ปี 1994'),
      aft_limit_pctMAC: Lf(37.0, '%MAC', A, ['R7', 'R10'], 'กลาง', false, 'ที่ TOW 20.36 t (GE235); NTSB ให้ 39 % (72-212)'),
      ref_pctMAC: Lf(25, '%MAC', A, ['R7'], 'สูง', false, 'นิยามจุดอ้างอิงตาม schema (รายงาน GE235 ใช้ %MAC เช่นกัน)'),
    },
    inertia: {
      ref_mass: Lf(21000, 'kg', A, [], 'ต่ำ', true, 'มวลที่ใช้คำนวณ build-up'),
      Ixx: Lf(265800, 'kg m2', A, ['R24'], 'ต่ำ', true, 'build-up 12 ชิ้นส่วน (r_aero_modes.mjs); ค่า GE791 ผ่าน Wolfram 289,900 ใกล้เคียง (+9 %)'),
      Iyy: Lf(789800, 'kg m2', A, ['R24'], 'ต่ำ', true, 'build-up; ขัดแย้งกับค่า GE791 ผ่าน Wolfram 298,400 (มวลอ้างอิงไม่ระบุ); เลือก build-up เพราะ Iyy ≈ Ixx ไม่สอดคล้องกับลำตัว 27 m และหาง T หนัก (ดูหัวข้อความขัดแย้ง)'),
      Izz: Lf(1002000, 'kg m2', A, ['R24'], 'ต่ำ', true, 'build-up; GE791 ผ่าน Wolfram 573,600'),
      Ixz: Lf(33400, 'kg m2', A, [], 'ต่ำ', true, 'build-up (FRD, หางตั้งและแพนหางสูงอยู่เหนือ CG); GE791 ผ่าน Wolfram ให้ 0'),
      radii: Lf({ Rx: 0.263, Ry: 0.451, Rz: 0.51 }, '-', A, [], 'ต่ำ', true, 'Roskam: R = 2k/b, 2k/L, 2k/e; b 27.05, L 27.17, e = (b+L)/2; ถ้าใช้ค่า GE791 ที่มวล 21,217 kg ได้ Rx 0.273, Ry 0.276, Rz 0.384'),
    },
    wing: {
      S: Lf(61.0, 'm2', A, ['R4', 'R5'], 'สูง', false, '657 ft²'),
      b: Lf(27.05, 'm', A, ['R4', 'R28'], 'สูง', false, "88 ft 9 in"),
      MAC: Lf(2.34, 'm', A, [], 'ต่ำ', true, 'ดู airframe.cg.MAC'),
      AR: Lf(12.0, '-', A, ['R4'], 'สูง', false, 'b²/S = 11.995'),
      taper: Lf(0.50, '-', A, ['R26', 'R27'], 'ต่ำ', true, 'แหล่งขัดแย้ง: 0.419 (Seeckt) และ 0.59 (Nita) เลือกค่ากลาง'),
      sweep_c4_deg: Lf(1.0, 'deg', A, ['R26'], 'ต่ำ', true, 'Seeckt: 0° ปีกใน 1° ปีกนอก "based on the original ATR 72"; ค่า 25° ในสไลด์ Nita เป็นข้อความเพี้ยน'),
      dihedral_deg: Lf(0.0, 'deg', A, ['R26'], 'ต่ำ', true, 'Seeckt ระบุ 0° "as for the original ATR 72" (ยังไม่ยืนยัน); ผล dihedral ที่ใช้ใน Clβ (−0.07) รวมผลปีกสูงแล้ว ห้ามนับซ้ำ'),
      incidence_deg: Lf(1.0, 'deg', A, [], 'ต่ำ', true, 'ไม่พบในแหล่งสาธารณะ; ย้อนจาก CL0 ปีกสะอาด 0.229 ที่ α_body 0 และ α0 ของ NACA 43018 ราว −1.2°'),
      twist_deg: Lf(-2.0, 'deg', A, [], 'ต่ำ', true, 'ไม่พบในแหล่งสาธารณะ; ค่าทั่วไปของปีกตรง AR สูง'),
      airfoil: Lf({ root: 'RA 1843 (NACA 43018 mod)', tip: 'RA 1343 (NACA 43013 mod)' }, '-', A, ['R19', 'R10', 'R27'], 'สูง', false, 'NTSB: "modified NACA 43XXX 5 digit series", non-laminar'),
    },
    tail: {
      S_h: Lf(11.73, 'm2', A, ['R27'], 'กลาง', false, 'Nita (คอลัมน์ original) 11.7 m²'),
      l_h: Lf(13.6, 'm', A, ['R22', 'R27'], 'ต่ำ', true, 'FlightGear htailarm 44.58 ft = 13.59 m; Nita 13.565 m (redesign)'),
      S_v: Lf(12.48, 'm2', A, ['R27'], 'กลาง', false, 'Nita (original) 12.5 m²'),
      l_v: Lf(13.6, 'm', A, ['R22'], 'ต่ำ', true, 'FlightGear vtailarm 44.57 ft'),
      b_h: Lf(7.31, 'm', A, [], 'ต่ำ', true, 'สมมติ AR_h ≈ 4.55'),
      b_v: Lf(3.87, 'm', A, ['R26'], 'ต่ำ', true, 'จาก AR_v 1.2 ของ Seeckt (ค่าที่เลือกในงานออกแบบ)'),
    },
  },
  speeds: {
    VMO_kt: Lf(250, 'kt IAS', A, ['R12', 'R21'], 'สูง', false, 'ATSB AO-2014-032: "maximum operating speed (VMO) of the aircraft of 250 kt"'),
    MMO: Lf(0.55, 'Mach', A, ['R21'], 'ต่ำ', false, 'จากชุดบัตรทบทวนของผู้ใช้ (ไม่เป็นทางการ)'),
    VLE_kt: Lf(185, 'kt IAS', A, ['R21'], 'ต่ำ', false, 'บัตรทบทวน "Blue 185" (ตีความว่าเป็น VLE)'),
    VLO_kt: Lf({ extension: 170, retraction: 160 }, 'kt IAS', A, ['R21'], 'ต่ำ', false, 'บัตรทบทวน'),
    VFE: Lf({ '15': 185, '30': 150 }, 'kt IAS', A, ['R10', 'R21'], 'กลาง', false, 'flaps 15: NTSB (ATR 72-212) flap overspeed warning > 185 KIAS; flaps 30: บัตรทบทวน 150 kt (ต่ำ); FCOM conservative speeds F15 150, F30 135 kt ไม่ใช่ VFE'),
    VA_kt: Lf(175, 'kt IAS', A, ['R21'], 'ต่ำ', false, 'บัตรทบทวน; max rough air 180 kt'),
    VSR: Lf({ axes: { mass_kg: [14000, 16000, 18000, 20000, 21000, 22000, 22350, 23000], flap: ['0', '15', '30'] },
      data: [[96.2, 80.4, 72.0], [102.9, 86.0, 77.0], [109.1, 91.2, 81.7], [115.0, 96.1, 86.1], [117.8, 98.5, 88.2], [120.6, 100.8, 90.3], [121.6, 101.6, 91.0], [123.3, 103.1, 92.3]] },
      'kt CAS', A, ['R4', 'R9', 'R14', 'R16', 'R31'], 'ต่ำ', true, 'ย้อนจาก VREF 106 kt @20.4 t (BEA) และ 113 KIAS @MLW (factsheet) = 1.23 VSR30 ได้ CLmax30 2.675; V2min 116 KCAS @22.8 t = 1.13 VSR15 ได้ CLmax15 2.146 (ขอบล่าง ถ้า V2 ถูก VMCA จำกัด); CLmax0 1.50 สมมติ (r_speeds_clmax.mjs)'),
    VmLB: Lf({ axes: { mass_kg: [14000, 16000, 18000, 20000, 21000, 22000, 22350, 23000], flap: ['0', '15'] },
      data: [[113.5, 94.9], [121.4, 101.5], [128.7, 107.6], [135.7, 113.5], [139.0, 116.3], [142.3, 119.0], [143.4, 119.9], [145.5, 121.7]] },
      'kt CAS', A, ['R14', 'R16'], 'ต่ำ', true, 'VmLB = 1.18 VSR (FCOM 2.02, AvioConsult); ค่าสภาวะปกติ ไม่รวม icing; flaps 0 ขึ้นกับ CLmax0 ที่สมมติ'),
    VREF_kt: Lf({ axes: { mass_kg: [14000, 16000, 18000, 20000, 21000, 22000, 22350, 23000] }, data: [98.0, 98.0, 100.5, 105.9, 108.5, 111.1, 112.0, 113.6] },
      'kt CAS', A, ['R9', 'R4', 'R14', 'R17'], 'กลาง', true, 'flaps 30: VREF = VmHB30 = max(1.23 VSR30, VMCL 98 kt); ยึดกับ BEA 106 kt @20.4 t; VMCL เป็นขั้นต่ำเมื่อมวล < 17.1 t'),
    VAPP_rule: Lf('VAPP = max(VmHB30 + WF, VMCL); WF = max(1/3 headwind, full gust), สูงสุด 15 kt', '-', A, ['R16', 'R17'], 'กลาง', false, 'สำเนา FCOM ไม่เป็นทางการ + ATR safety conference'),
    takeoff_typical: Lf({ flap: '15', mass_kg: 22800, V1: 113, VR: 113, V2: 116 }, 'kt CAS', A, ['R4', 'R7'], 'ต่ำ', true, 'V2 116 KCAS (V2min @MTOW, factsheet) สูง; V1 = VR 113 เป็นค่าประมาณ (GE235 บันทึก V1 114 kt ที่ 20.36 t ซึ่งบอกว่า VR ของ ATR ถูกจำกัดด้วย VMCA มากกว่าด้วย stall)'),
    VMCG_kt: Lf(92, 'kt CAS', A, ['R14'], 'ต่ำ', true, 'ไม่พบตัวเลขในแหล่งสาธารณะ; AFM กำหนดที่ RTO ของอีกเครื่องยนต์; ค่าประมาณ ≈ VMCA − 9 kt; ATR 72-500 บนทางวิ่งกว้าง 14 m +5 kt'),
    VMCA_kt: Lf(101, 'kt CAS', A, ['R4', 'R14', 'R30'], 'ต่ำ', true, 'ไม่พบตัวเลข (แผนภูมิใน AFM LIM.3); ขอบบน 116/1.10 = 105.5 kt จาก V2min ≥ 1.10 VMCA; RTO อีกเครื่อง, bank 5°'),
    VMCL_kt: Lf(98, 'kt CAS', A, ['R14'], 'กลาง', false, '"98 kt CAS for both Flaps 30 and 15" (AFM LIM.3 ผ่าน AvioConsult), อีกเครื่องที่ GA power'),
    crosswind_demonstrated_kt: Lf(35, 'kt', A, ['R21', 'R16'], 'ต่ำ', false, 'บัตรทบทวน "Maximum crosswind TO/LDG 35 kt" (ไม่ระบุ gust/steady); ตาราง AP ใน FCOM: crosswind 17 kt, headwind 29, tailwind 10'),
    icao_approach_category: Lf('B', '-', A, ['R33'], 'สูง', true, 'VREF ที่ MLW ≈ 112 kt อยู่ในช่วง 91–120 kt (14 CFR 97.3); คำนวณจากนิยาม'),
  },
  performance: {
    TOFL_MTOW_ISA_SL: Lf({ '22800_basic': 1279, '23000_option': 1304 }, 'm', A, ['R4', 'R5'], 'สูง', false, 'PW127M, flaps 15 (สันนิษฐาน), take-off field length; 4,196 / 4,278 ft; โบรชัวร์เก่า (2012) 1,333/1,367 m'),
    LFL_MLW_ISA_SL: Lf(915, 'm', A, ['R4', 'R5'], 'สูง', false, '"EASA Air Ops" (3,002 ft) = ระยะจริง/0.7 สำหรับ turboprop; โบรชัวร์เก่า 1,067 m'),
    landing_distance_actual_MLW: Lf(640, 'm', A, ['R5', 'R36'], 'กลาง', true, '0.7 × 915 m (CAT.POL.A.230 turbo-propeller 70 %); 2,101 ft'),
    ROC_initial_fpm: Lf(1355, 'fpm', A, ['R4'], 'สูง', false, 'ISA SL MTOW, 170 KCAS; 6.88 m/s'),
    service_ceiling_ft: Lf(25000, 'ft', A, ['R13', 'R21', 'R43'], 'สูง', false, 'maximum operating altitude 25,000 ft (7,620 m); OEI net ceiling 95 % MTOW ISA+10 = 10,000 ft (PW127M) / 9,800 ft (XT-M)'),
    cruise_Mach: Lf(0.44, 'Mach', A, ['R4'], 'กลาง', true, '275 KTAS ที่ FL170 สมมติ (a = 323 m/s); factsheet ระบุ "Optimum FL"'),
    cruise_TAS_kt: Lf({ max_cruise_PW127M: 275, max_cruise_XT_FL200: 270 }, 'kt TAS', A, ['R4', 'R5'], 'สูง', false, '95 % MTOW ISA'),
    range_km: Lf(1404, 'km', A, ['R4'], 'สูง', false, '758 NM with max pax (PW127M); XT 683 NM'),
    max_fuel_kg: Lf(5000, 'kg', A, ['R4', 'R1'], 'สูง', false, ''),
    tests: Lf({ V2min_MTOW_kt: 116, VREF_landing_kt: 113, climb_speed_KCAS: 170, time_to_FL170_min: 17.5, cruise_FF_kg_h: 762, block_200NM_fuel_kg: 638, block_200NM_min: 61, approach_torque_pct_3deg: 25, approach_torque_pct_ATSB: 22 }, 'mixed', A, ['R4', 'R9', 'R8'], 'สูง', false, 'ค่าที่ใช้เป็นเป้าตรวจโมเดล (ดูกรณีทดสอบ T-R)'),
  },
} };

const b2 = { atr72_600: {
  aero: {
    ref: { S: Lf(61.0, 'm2', A, ['R4'], 'สูง', false, ''), b: Lf(27.05, 'm', A, ['R4'], 'สูง', false, ''), c: Lf(2.34, 'm', A, [], 'ต่ำ', true, 'MAC ประมาณ (taper 0.50)') },
    static_long: {
      CL0: Lf({ '0': 0.229, '15': 0.973, '30': 1.502 }, '-', A, ['R4', 'R9'], 'ต่ำ', true, 'α วัดจากแกนลำตัว; = CLmax − CLα·α_CLmax (r_speeds_clmax.mjs)'),
      CLalpha: Lf({ approach: 5.6, cruise: 6.0 }, '1/rad', A, ['R22'], 'ต่ำ', true, 'Helmbold+หาง ได้ 5.93 (M 0.17) และ 6.41 (M 0.45); FlightGear ≈ 5.2; เลือก 5.6/6.0'),
      CLmax_target: Lf({ '0': 1.50, '15': 2.146, '30': 2.675 }, '-', A, ['R4', 'R9', 'R22'], 'ต่ำ', true, 'flaps 30 จาก VREF (กลาง), flaps 15 จาก V2min (ขอบล่าง), clean สมมติ (FlightGear 1.62 ที่ 18°)'),
      alpha_CLmax: Lf({ '0': 13, '15': 12, '30': 12 }, 'deg', A, ['R10', 'R11'], 'ต่ำ', true, 'α ลำตัว; vane AOA ของ stick shaker 15.9–18.1° (clean) สูงกว่าเพราะ upwash ที่หัววัด'),
      Cm0: Lf(0.074, '-', A, [], 'ต่ำ', true, 'ให้ trim ที่ δe = 0 ใน cruise CL 0.467 กับ Cmα −1.74 (r_legacy.mjs)'),
      Cmalpha: Lf({ approach: -1.74, cruise: -1.81 }, '1/rad', A, [], 'ต่ำ', true, 'Cmα = −CLα (h_n − 0.25); h_n ≈ 0.55–0.56 MAC จากหาง V_H 1.12 ลบผลลำตัว/nacelle/ใบพัด (r_aero_modes.mjs)'),
    },
    flaps: {
      detents: Lf([{ name: '0', flap_deg: 0, slat_deg: 0, VFE_kt: null, dCL0: 0, dCD0: 0, dCm0: 0, CLmax: 1.50 }, { name: '15', flap_deg: 15, slat_deg: 0, VFE_kt: 185, dCL0: 0.744, dCD0: 0.020, dCm0: -0.018, CLmax: 2.146 }, { name: '30', flap_deg: 30, slat_deg: 0, VFE_kt: 150, dCL0: 1.273, dCD0: 0.052, dCm0: -0.031, CLmax: 2.675 }],
        'mixed', A, ['R4', 'R9', 'R10', 'R21', 'R27'], 'ต่ำ', true, 'แฟลป double-slotted ไม่มี slat (Nita); flap_deg = ชื่อ detent (ยังไม่ยืนยันมุมจริง); dCD0 flaps 30 = 0.072 − gear 0.020 จากการ fit แรงบิด approach 25 %; flaps 15 dCD0 ประมาณ'),
      transition_time_s: Lf({ '0-15': 8, '15-30': 8 }, 's', A, [], 'ต่ำ', true, 'ไม่พบในแหล่งสาธารณะ'),
    },
    spoilers: {
      ground_dCL: Lf(0, '-', A, [], 'ต่ำ', true, 'ATR 72 มี roll spoiler ข้างละหนึ่งแผ่น ไม่มี ground spoiler/speedbrake (ยังไม่ได้ยืนยันจากเอกสาร flight controls ในรอบนี้; หัวข้อ 7)'),
      ground_dCD: Lf(0, '-', A, [], 'ต่ำ', true, 'ดู ground_dCL'),
      roll_Cl_per_rad: Lf(0.05, '1/rad', A, [], 'ต่ำ', true, 'ส่วนเพิ่มของ roll spoiler ต่อมุม aileron เทียบเท่า (สมมติ)'),
    },
    gear_drag: { dCD0: Lf(0.020, '-', A, [], 'ต่ำ', true, 'ค่าประมาณทั่วไป; ใช้ร่วมกับ flap30 dCD0 0.052 ให้ผลรวม 0.072') },
    derivatives: {
      CD0: Lf(0.030, '-', A, ['R4', 'R22', 'R27'], 'ต่ำ', true, 'จาก cruise 762 kg/h @275 KTAS + psfc 0.46–0.50 ได้ 0.028–0.034; ROC 1,355 fpm ได้ 1,350 ที่ 0.030 (r_perf_wake.mjs)'),
      K: Lf({ clean: 0.0313, landing: 0.040 }, '-', A, ['R29'], 'ต่ำ', true, 'clean: e = 0.85 ที่ AR 12 (preprint, Nita e 0.85); landing: e ≈ 0.66 (สมมติ)'),
      CLq: Lf({ approach: 8.50, cruise: 9.01 }, '1/(rad·c/2V)', A, [], 'ต่ำ', true, '2 a_t η V_H'),
      CLadot: Lf({ approach: 1.98, cruise: 2.28 }, '1/(rad·c/2V)', A, [], 'ต่ำ', true, '2 a_t η V_H dε/dα'),
      CLde: Lf({ approach: 0.329, cruise: 0.348 }, '1/rad', A, [], 'ต่ำ', true, 'a_t η (S_h/S) τ_e, τ_e 0.45'),
      CYb: Lf(-0.714, '1/rad', A, [], 'ต่ำ', true, 'fin a_v 3.0 + ลำตัว −0.10'),
      CYdr: Lf(0.276, '1/rad', A, [], 'ต่ำ', true, 'a_v (S_v/S) τ_r, τ_r 0.45'),
      CYr: Lf(0.617, '1/(rad·b/2V)', A, [], 'ต่ำ', true, '−2 CYβ_v l_v/b'),
      Clb: Lf(-0.143, '1/rad', A, [], 'ต่ำ', true, 'dihedral/ปีกสูง −0.07 + fin −0.073'),
      Clp: Lf(-0.60, '1/(rad·b/2V)', A, [], 'ต่ำ', true, 'strip theory −0.73 ลดด้วยผลปลายปีก'),
      Clr: Lf({ approach: 0.447, cruise: 0.162 }, '1/(rad·b/2V)', A, [], 'ต่ำ', true, 'CL/4 + fin'),
      Clda: Lf(0.18, '1/rad', A, ['R10'], 'ต่ำ', true, 'aileron ±14° (NTSB) + roll spoiler'),
      Cldr: Lf(0.033, '1/rad', A, [], 'ต่ำ', true, 'CYδr z_v/b'),
      Cmq: Lf({ approach: -54.4, cruise: -57.6 }, '1/(rad·c/2V)', A, [], 'ต่ำ', true, '−2.2 a_t η V_H l_h/c̄ (V_H 1.12, l_h/c̄ 5.8 ใหญ่กว่าเจ็ต)'),
      Cmadot: Lf({ approach: -11.5, cruise: -13.2 }, '1/(rad·c/2V)', A, [], 'ต่ำ', true, '−2 a_t η V_H (l_h/c̄) dε/dα'),
      Cmde: Lf({ approach: -1.91, cruise: -2.03 }, '1/rad', A, [], 'ต่ำ', true, '−V_H a_t η τ_e (δe บวก = ขอบท้ายลง)'),
      Cnb: Lf(0.225, '1/rad', A, [], 'ต่ำ', true, 'fin 0.309 − ลำตัว 0.084'),
      Cnp: Lf({ approach: -0.195, cruise: -0.052 }, '1/(rad·b/2V)', A, [], 'ต่ำ', true, '−CL/8 + fin'),
      Cnr: Lf(-0.33, '1/(rad·b/2V)', A, [], 'ต่ำ', true, '−2 a_v V_V l_v/b − 0.02'),
      Cnda: Lf({ approach: -0.030, cruise: -0.009 }, '1/rad', A, [], 'ต่ำ', true, '−0.1 CL Clδa (adverse yaw)'),
      Cndr: Lf(-0.139, '1/rad', A, [], 'ต่ำ', true, '−CYδr l_v/b'),
    },
    stall_warning: {
      vane_aoa: Lf({ shaker: { '0': 15.9, '15': 16.3, '0_icing': 11.2, '15_icing': 12.5 }, pusher: { '0': 20.0, '15': 20.0, '0_icing': 15.3, '15_icing': 16.4 }, shaker_normal_NTSB_1994: 18.1 }, 'deg (vane)', A, ['R11', 'R10'], 'กลาง', false, 'ตาราง 1.6-7/1.6-8 ของ GE791 (การจับคู่คอลัมน์ต้องตรวจกับ PDF); NTSB 1994: 18.1° ปกติ ลดเป็น 11.2° (cruise icing) และ 12.5° (flaps 15 หรือ 10 นาทีหลังวิ่งขึ้น); pusher ดันคันบังคับไป 8° nose down'),
      min_margin: Lf(13, 'kt', A, [], 'ต่ำ', true, 'shaker ราว 1.13–1.15 VSR (ทั่วไปของ CS-25.207: เตือนก่อน stall อย่างน้อย 5 kt หรือ 5 %); ค่าที่เลือก'),
    },
    legacy: Lf({ CL0: 0.229, CLa: 5.6, CLflap: 1.273, CDflap: 0.0754, CDgear: 0.020, Cm0: 0.074, Cma: -1.74, Cmflap: -0.0311, aStall: 16.77, aStallFlap: -0.36, flapMap: { '0': 0, '15': 0.584, '30': 1 }, CD0: 0.030, K: 0.0313, K_CL_offset: 0 },
      'ตามนิยาม AC (deg สำหรับ aStall)', A, ['R4', 'R9'], 'ต่ำ', true, 'AC.flaps 1 = flaps 30; aStall/aStallFlap หาโดย bisection ให้ CLmax ของ stallBlend (M 55) = 1.50 และ 2.675 (flaps 15 ได้ 2.18); Cm0/Cmflap ให้ trim δe 0 ที่ cruise และ approach; CDflap ให้ CD รวม 0.2096 ที่ CL 1.64 ด้วยเทอม K(CL−0)²; ตั้ง offset 0.15 ของโค้ดเป็น 0 (r_legacy.mjs)'),
  },
  interference: {
    downwash: {
      deda: Lf({ approach: 0.233, cruise: 0.253 }, '-', A, [], 'ต่ำ', true, '2 a_w/(π A) × 0.85 (หาง T อยู่สูงพ้น wake)'),
      eps0: Lf(0.02, 'rad', A, [], 'ต่ำ', true, 'ไม่พบ; ประมาณจาก CL0 ปีก'),
      l_t: Lf(13.6, 'm', A, ['R22', 'R27'], 'ต่ำ', true, ''),
      VH: Lf(1.12, '-', A, ['R27'], 'ต่ำ', true, 'S_h l_h /(S c̄) = 11.73·13.6/(61·2.34)'),
      a_t: Lf({ approach: 4.00, cruise: 4.24 }, '1/rad', A, [], 'ต่ำ', true, 'Helmbold AR_h 4.56 sweep 6°'),
      eta_t: Lf(0.95, '-', A, [], 'ต่ำ', true, 'หาง T อยู่เหนือ slipstream'),
      CLadot: Lf(1.98, '1/(rad·c/2V)', A, [], 'ต่ำ', true, 'approach'),
      Cmadot: Lf(-11.5, '1/(rad·c/2V)', A, [], 'ต่ำ', true, 'approach'),
    },
    slipstream: {
      diskDiameter: Lf(3.93, 'm', P, ['R4', 'R15'], 'สูง', false, '12.9 ft'),
      hubRadius: Lf(0.40, 'm', P, [], 'ต่ำ', true, 'ไม่พบ; spinner ประมาณ'),
      hubPos: Lf([[4.3, -4.05, -0.3], [4.3, 4.05, -0.3]], 'm (FRD จาก CG)', A, ['R4'], 'ต่ำ', true, 'y ±4.05 จากระยะ 8.10 m ใน factsheet (ตีความว่าเป็นระยะห่างแนวแกนใบพัด); x จากระนาบใบพัด STA ≈ 8.2 m (ประมาณ)'),
      sense: Lf(1, '-', P, ['R15'], 'กลาง', false, 'FCOM: "clockwise" ทั้งสองเครื่องยนต์ (ไม่ใช่ counter-rotating); ถือว่ามองจากด้านหลัง ทำให้เครื่องยนต์ซ้าย (หมายเลข 1) เป็น critical engine'),
      blownArea: Lf(16.3, 'm2', A, [], 'ต่ำ', true, '2 × 0.8 D × คอร์ดเฉลี่ย 2.6 m (ส่วนปีกและแฟลปหลังใบพัด ≈ 27 % ของ S)'),
      blownSpanFactor: Lf(0.8, 'D', A, [], 'ต่ำ', true, 'การหดตัวของ slipstream ที่ปีก'),
      immersionH: Lf(0.0, '-', A, [], 'ต่ำ', true, 'หาง T อยู่สูงพ้น slipstream ในการบินปกติ'),
      immersionV: Lf(0.15, '-', A, [], 'ต่ำ', true, 'ส่วนล่างของ fin อาจโดน swirl'),
    },
  },
} };

const b3 = { atr72_600: {
  propulsion: {
    layout: Lf([{ id: 1, pos: [4.3, -4.05, -0.3], pos_STA: [8.2, -4.05, null], axis: [1, 0, 0], type: 'turboprop', model: 'PW127M', prop: '568F-1' }, { id: 2, pos: [4.3, 4.05, -0.3], pos_STA: [8.2, 4.05, null], axis: [1, 0, 0], type: 'turboprop', model: 'PW127M', prop: '568F-1', note: 'propeller brake (hotel mode)' }],
      'm FRD / m STA', A, ['R1', 'R4', 'R15', 'R16'], 'ต่ำ', true, 'ระนาบใบพัดเป็นค่าประมาณ; hotel mode ใช้ propeller brake ซึ่งตามแบบทั่วไปอยู่ที่เครื่องยนต์หมายเลข 2 (ขวา); เอกสารที่อ่านไม่ระบุข้าง'),
    legacy: Lf({ P: 3692000, eta: 0.957, T0: 76955, idle: 0.02 }, 'W, -, N, -', A, ['R3', 'R4'], 'ต่ำ', true, 'ทั้งลำ (สองเครื่อง) ที่ NTO 2×1,846 kW; T0 = 2 × แรงขับสถิต FM 0.75; eta เป็นพารามิเตอร์ fit ให้ T(V2) ตรง momentum (ไม่ใช่ประสิทธิภาพจริง) (r_engine_prop.mjs)'),
  },
  turboprop: {
    ratings: {
      P_rated: Lf({ NTO: 1846000, RTO: 2051000, MCT: 1864000, CLB: 1635000, CRZ: 1590000 }, 'W', E, ['R3', 'R4', 'R15'], 'สูง', false, 'shp: NTO 2,475, RTO 2,750, MCT 2,500, CLB 2,192, CRZ 2,132; CLB/CRZ ที่ Np 82 %'),
      T_flat_C: Lf({ NTO: 39, RTO: 39, MCT: 48 }, 'degC', E, ['R3'], 'สูง', false, 'PW127M (PW127N 44/44/48)'),
      rating_basis: Lf({ pressure_Pa: 101325, static: true, bleed: 'ไม่ระบุ', note: 'TCDS: kW ที่เพลาออก' }, '-', E, ['R3'], 'กลาง', false, ''),
      install_loss_frac: Lf(0, '-', A, [], 'ต่ำ', true, 'ไม่พบ'),
      Np_max_rpm: Lf(1212, 'rpm', E, ['R3'], 'สูง', false, 'ขีดจำกัด output shaft (TCDS); Np 100 % = 1,200 rpm ตาม FCOM (R15)'),
      Np_100pct_rpm: Lf(1200, 'rpm', E, ['R15'], 'กลาง', false, 'FCOM 1.16 (สำเนาไม่เป็นทางการ); 82 % = 984 rpm'),
      Np_transient_rpm: Lf({ '20s': 1296, '5s': 1440 }, 'rpm', E, ['R3'], 'สูง', false, ''),
      Q_lim: Lf(17354, 'N m', E, ['R3'], 'สูง', false, '= 106.3 % ของ 100 % TQ 16,325 N m (12,038 lbf ft); transient 20 s 19,578 N m = 120 %'),
      Q_100pct: Lf(16321, 'N m', E, ['R3', 'R15', 'R7'], 'สูง', true, 'RTO 2,051 kW / (2π·1200/60); ตรงกับ 17,354/1.063 ภายใน 0.03 %'),
      Ng_100pct_rpm: Lf(33457, 'rpm', E, ['R3', 'R15'], 'ต่ำ', true, 'อนุมานว่า red line NH 102.7 % = 34,360 rpm (TCDS MTO); NL 100 % ≈ 27,706 rpm (104.2 % = 28,870)'),
      Ng_max_pct: Lf(102.7, '%', E, ['R15'], 'กลาง', false, 'NH red mark; NL 104.2 %'),
      ITT_max_C: Lf({ NTO: 765, RTO: 800, MCT: 800, transient20s: 840 }, 'degC', E, ['R3', 'R15'], 'สูง', false, 'hotel mode alert 715 °C'),
      ITT_start_C: Lf(950, 'degC', E, ['R3'], 'สูง', false, '5 s'),
      takeoff_time_limit_s: Lf(300, 's', E, ['R3'], 'สูง', false, '600 s เมื่อ OEI (Note 2)'),
    },
    steady_map: {
      Ng_GI_pct: Lf(63, '%', E, ['R15'], 'ต่ำ', true, 'ไม่พบ; ใกล้ขอบล่าง green arc NH 62 %'),
      Ng_FI_pct: Lf(70, '%', E, [], 'ต่ำ', true, 'ไม่พบ'),
      kMap: Lf(2.7, '-', E, ['R44'], 'ต่ำ', true, 'ใช้รูปแผนที่ของรอบที่ 1 (PT6A) ไปก่อน'),
    },
    dynamics: {
      cert_accel_FI_to_95pct_max_s: Lf(5, 's', E, ['R34'], 'สูง', false, '14 CFR 33.73(b)'),
      tauAcc_s: Lf(0.8, 's', E, ['R44'], 'ต่ำ', true, 'เครื่องใหญ่กว่า PT6A: เพิ่มจาก 0.6 s ของรอบที่ 1'),
      rAcc_pct_s: Lf(8, '%Ng/s', E, ['R44'], 'ต่ำ', true, 'ให้เวลาจาก FI ถึง 95 % ราว 4–5 s'),
    },
    atpcs: Lf({ arm_torque_pct: 46.2, arm_PLA_deg: 49, trigger_torque_pct: 18.5, delay_s: 2.15, uptrim: 'เครื่องที่เหลือเพิ่มจาก NTO 90 % เป็น RTO 100 % TQ (+10 %)', feather_beta_deg: 78, interlock: 'ห้าม feather สองเครื่องพร้อมกัน' }, 'mixed', E, ['R7', 'R15'], 'สูง', false, 'GE235 1.6.4 + FCOM (FCOM ระบุ arm > 46 %, trigger < 18 %)'),
    airframe_coupling: {
      spin: Lf(1, '-', A, ['R15'], 'กลาง', false, 'ทั้งสองเครื่อง clockwise'),
      thrust_axis_body: Lf([1, 0, 0], '-', A, [], 'ต่ำ', true, 'ไม่พบมุม toe/tilt'),
    },
    fuel: { psfc: Lf(0.48, 'lb/(hp h)', E, ['R4'], 'ต่ำ', true, 'สมมติในช่วง 0.46–0.50 ให้ cruise 762 kg/h สอดคล้องกับ CD0 0.030') },
    beta_reverse: {
      blade_angle_FI_deg: Lf(null, 'deg', P, [], 'ต่ำ', true, 'ไม่พบในแหล่งสาธารณะ'),
      reverse_available: Lf(true, 'bool', E, ['R16'], 'สูง', false, 'ใช้ reverse ตั้งแต่ touchdown, คืน GI ต่ำกว่า ~40 kt'),
    },
  },
  propeller: {
    identity: {
      nBlades: Lf(6, '-', P, ['R4', 'R15'], 'สูง', false, 'คอมโพสิตทั้งใบ (FAA special conditions 1995)'),
      diameter: Lf(3.93, 'm', P, ['R4', 'R15'], 'สูง', false, '12.9 ft'),
      sense: Lf(1, '-', P, ['R15'], 'กลาง', false, 'clockwise ทั้งสองเครื่อง'),
      massComplete: Lf(180, 'kg', P, ['R15'], 'กลาง', false, 'FCOM 1.16'),
      hubPosition: Lf([[4.3, -4.05, -0.3], [4.3, 4.05, -0.3]], 'm (FRD จาก CG)', A, ['R4'], 'ต่ำ', true, 'ดู interference.slipstream.hubPos'),
      thrustAxis: Lf([1, 0, 0], '-', A, [], 'ต่ำ', true, ''),
    },
    engineInterface: {
      maxShaftPower: Lf(2051, 'kW', E, ['R3'], 'สูง', false, 'RTO'),
      rpmGoverned: Lf({ TO: 1200, CLB_CRZ: 984 }, 'rpm', E, ['R15', 'R16'], 'กลาง', false, 'Np 100 % / 82 %; ขั้นต่ำ fuel governing 70.8 % = 850 rpm'),
      rpmTransientLimit: Lf(1296, 'rpm', E, ['R3'], 'สูง', false, '20 s; 1,440 rpm 5 s'),
      gearRatio: Lf(16.68, '-', E, ['R22'], 'ต่ำ', true, 'จาก FlightGear prop_hs568f.xml; TCDS ไม่ระบุ'),
      flightIdleShaftPower: Lf(null, 'kW', E, [], 'ต่ำ', true, 'ไม่พบ'),
    },
    inertia: { Ip: Lf(104, 'kg m2', P, ['R15', 'R22'], 'ต่ำ', true, '6 ใบ × 22 kg ที่ k = 0.45 R (สมมติ) จากมวล 180 kg; FlightGear 146 kg m²') },
    governor: {
      rpmOverspeed: Lf(1224, 'rpm', P, ['R15'], 'กลาง', false, 'threshold แรก 102 %; ที่สอง 106 % = 1,272 rpm'),
      betaFeather: Lf(78.5, 'deg (β_ref)', P, ['R15', 'R7'], 'กลาง', false, 'GE235 บันทึก 78° ตอน feather; สถานีอ้างอิงไม่ระบุ'),
      featherRate: Lf(20, 'deg/s', P, [], 'ต่ำ', true, 'ไม่พบ'),
    },
    betaReverse: {
      reverseAvailable: Lf(true, '-', P, ['R16'], 'สูง', false, ''),
      betaReverseMax: Lf(-14, 'deg (β_ref)', P, ['R15'], 'กลาง', false, 'ช่วง β_ref −14° ถึง 78.5°'),
    },
    checks: {
      staticThrustISA: Lf(38.5, 'kN', P, [], 'ต่ำ', true, 'ต่อเครื่อง NTO, momentum + FM 0.75 (FM 0.70–0.80 ได้ 36.7–40.2 kN); 8,650 lbf'),
      staticThrustVTBD31C: Lf(37.8, 'kN', P, [], 'ต่ำ', true, 'ต่อเครื่อง NTO ที่ 31 °C (ยังอยู่ใต้ flat rating 39 °C)'),
      momentumIdealStaticISA: Lf(46.6, 'kN', P, [], 'สูง', true, '(2ρA P²)^(1/3), P 1,846 kW, A 12.13 m²'),
      peakEfficiency: Lf(0.88, '-', P, [], 'ต่ำ', true, 'momentum×0.90 ที่ cruise J 2.2'),
      CP_static_NTO: Lf(0.201, '-', P, [], 'สูง', true, 'P/(ρ n³ D⁵) ที่ 1,200 rpm'),
      tipMach_static: Lf(0.726, '-', P, [], 'สูง', true, 'π n D / a ที่ ISA SL'),
    },
  },
} };

const b4 = { atr72_600: {
  gear: {
    strut_main: { stroke: Lf(0.35, 'm', G, ['R8', 'R32'], 'ต่ำ', true, 'จากพลังงาน 10 fps ที่ MLW, η_s 0.8, load factor 1.5 (r_perf_wake.mjs); ระยะยุบจริงไม่พบ') },
    tyre_main: {
      size: Lf('32x8.8R16 16 ply', '-', G, ['R25'], 'กลาง', false, 'ร้านค้าระบุ "Suitable for Use With: ATR 72 (MLG)"; อีกหน้าระบุ P/N เดียวกันเป็น H34x10.0R16 14 ply (ขัดแย้ง)'),
      rated_load: Lf(57827, 'N', G, ['R23'], 'ต่ำ', true, '13,000 lb จากแถว 32x8.8 bias 14 ply ของ Goodyear (ไม่ระบุ application)'),
      operating_pressure: Lf(120, 'psi', G, [], 'ต่ำ', true, 'ไม่พบในแหล่งสาธารณะ; 8.3 bar'),
      outside_diameter: Lf(0.813, 'm', G, ['R25'], 'สูง', false, '32 in ตามชื่อขนาด'),
      section_width: Lf(0.224, 'm', G, ['R25'], 'สูง', false, '8.8 in'),
      static_load_MTOW: Lf(51877, 'N', G, [], 'กลาง', true, '(1 − 0.08) W/4 ที่ 23 t = 11,662 lbf (0.90 ของ 13,000 lb)'),
    },
    tyre_nose: {
      size: Lf('450x190-5', '-', G, [], 'ต่ำ', true, 'สมมติ; ไม่พบแหล่งที่ระบุขนาดยางหน้าของ ATR 72'),
      rated_load: Lf(16014, 'N', G, ['R23'], 'ต่ำ', true, '3,600 lb (Goodyear 459M08-2, 75 psi)'),
      outside_diameter: Lf(0.455, 'm', G, ['R23'], 'ต่ำ', true, '17.52–18.31 in'),
    },
    brakes: {
      antiskid: Lf(true, 'bool', A, ['R16'], 'กลาง', false, 'มี antiskid; ตัวเลขในแบบทดสอบ smartcockpit ไม่ระบุคำตอบที่ถูก จึงไม่ใช้'),
      autobrake: Lf(false, 'bool', A, ['R16'], 'กลาง', false, 'FCOM สั่ง "max braking" ด้วยแป้น; ไม่พบระบบ autobrake'),
      emergency_brake_note: Lf('ห้ามดันคัน EMER BRAKE เลย notch เมื่อความเร็ว > 60 kt', '-', A, ['R16'], 'กลาง', false, ''),
      max_tyre_ground_speed_kt: Lf(165, 'kt GS', G, ['R21'], 'ต่ำ', false, 'บัตรทบทวน'),
    },
    steering: {
      mode: Lf('tiller (hand wheel); การเลี้ยวด้วยแป้นยังไม่ยืนยัน', '-', A, ['R16'], 'กลาง', false, ''),
      pedal_max: Lf(null, 'deg', A, [], 'ต่ำ', true, 'ไม่พบ'),
      tiller_max: Lf(60, 'deg', A, [], 'ต่ำ', true, 'ไม่พบ; แบบทดสอบมีตัวเลือก ±60/70/80° โดยไม่บอกคำตอบ'),
      caster_max: Lf(91, 'deg', A, [], 'ต่ำ', true, 'ไม่พบ; ใช้เป็นขีดจำกัดตอนลาก (ตัวเลือก ±81/91/101° ในแบบทดสอบ)'),
    },
    certification: {
      part25_limit_descent: Lf(3.05, 'm/s', A, ['R8', 'R32'], 'สูง', false, '600 ft/min = 10 fps ที่ MLW; reserve 720 ft/min = 12 fps (25.723)'),
      tail_clearance: Lf({ strut_extended_deg: 8.0, strut_compressed_deg: 5.9 }, 'deg', A, ['R9', 'R8'], 'สูง', false, 'มุม pitch ที่หางแตะพื้น; tail bumper ป้องกันถ้า sink ที่ touchdown ≤ 5 ft/s (FCOM)'),
    },
  },
  wind: {
    wake: {
      b0_over_b: Lf(0.785, '-', A, [], 'สูง', true, 'π/4 (ปีกรูปไข่)'),
      rc_over_b: Lf(0.05, '-', A, [], 'ต่ำ', true, 'ค่าทั่วไป'),
      leaders: Lf({ icao_wtc: 'M', recat_eu: 'E (Lower Medium)', Gamma0_landing_m2s: 146.2, w0_landing_ms: 1.10, Gamma0_takeoff_m2s: 145.2, b0_m: 21.25 }, 'kg, m, kt, m2/s, m/s', A, ['R35'], 'กลาง', true, 'ICAO M (7–136 t); RECAT-EU E อนุมานจากตาราง; Γ0 = W/(ρ V b0) ที่ MLW/VREF 112 kt และ MTOW/V2 116 kt (r_perf_wake.mjs)'),
    },
  },
  validation: {
    reference_modes: {
      approach_F30_111kt_20t: Lf({ short_period: { wn: [0.96, 1.55], zeta: [0.59, 0.63] }, phugoid: { T_s: [30.8, 31.0], zeta: [0.065, 0.11] }, dutch_roll: { wn: [1.05, 1.35], zeta: [0.15, 0.19], note: 'ไม่มี yaw damper' }, roll_tau_s: [0.53, 0.57], spiral_T2_s: [15.2, 16.3] }, 'rad/s, -, s', A, [], 'ต่ำ', true, 'eigenvalue ของโมเดลเชิงเส้นที่ประมาณเอง ช่วงค่า = inertia build-up กับค่า GE791 (r_aero_modes.mjs); ไม่ใช่ข้อมูลทดสอบบินจริง'),
      cruise_275KTAS_FL170_21t: Lf({ short_period: { wn: [1.71, 2.79], zeta: [0.49, 0.53] }, phugoid: { T_s: 71.6, zeta: [0.067, 0.076] }, dutch_roll: { wn: [1.71, 2.23], zeta: [0.12, 0.15] }, roll_tau_s: [0.38, 0.40], spiral: 'เกือบเป็นกลาง (τ ≈ 365 s)' }, 'rad/s, -, s', A, [], 'ต่ำ', true, 'เช่นเดียวกัน'),
    },
    trim_targets: {
      approach_3deg: Lf({ mass_kg: 20400, VAPP_kt: 111, flap: '30', gear: 'down', torque_pct: 25, theta_deg: -1.5, theta_range_FCTM: [-2.5, 1.0], alpha_deg: 1.4, dTorque_per_deg_slope: 5 }, 'mixed', A, ['R9', 'R8', 'R17'], 'กลาง', false, 'FCTM ผ่าน BEA: torque 25 % ±5 %/1°, pitch −2.5…+1°; ATSB: ~22 % ที่ 21.7 t; ATR: −1.4° ในตัวอย่าง'),
      touchdown: Lf({ flare_height_ft: 20, power: 'flight idle', theta_deg: [3, 6], tailstrike_deg: 8.0 }, 'mixed', A, ['R8', 'R9', 'R16'], 'กลาง', false, 'ATSB VH-FVZ touchdown 6°; BEA: หางแตะ 5.9° (strut ยุบ) ถึง 8°'),
      climb_V2: Lf({ mass_kg: 22800, flap: '15', V2_kt: 116, alpha_deg: 7.2 }, 'mixed', A, ['R4'], 'ต่ำ', true, 'α จากโมเดล'),
    },
  },
} };

// เติม src ของค่าประมาณที่คำนวณจากข้อมูลที่อ้างได้ (ข้อมูลขาเข้า) และ note ที่ขาด; ค่าที่เป็นข้อสมมติล้วนคง src ว่าง
const GEO = ['R4', 'R22', 'R27'];
const SRC = {
  'airframe.cg.LEMAC_x': ['R4'], 'airframe.inertia.ref_mass': ['R1'], 'airframe.inertia.Ixz': ['R24'], 'airframe.inertia.radii': ['R24'],
  'airframe.wing.MAC': ['R4', 'R26', 'R27'], 'airframe.tail.b_h': ['R27'], 'aero.ref.c': ['R4', 'R26', 'R27'],
  'aero.static_long.Cm0': ['R4', 'R9'], 'aero.static_long.Cmalpha': GEO, 'aero.gear_drag.dCD0': ['R9'],
  'interference.slipstream.blownArea': ['R4'], 'turboprop.ratings.install_loss_frac': ['R3'],
  'gear.tyre_main.static_load_MTOW': ['R1'], 'gear.tyre_nose.size': ['R23'],
};
for (const k of ['CLq', 'CLadot', 'CLde', 'CYb', 'CYdr', 'CYr', 'Clb', 'Clp', 'Clr', 'Cldr', 'Cmq', 'Cmadot', 'Cmde', 'Cnb', 'Cnp', 'Cnr', 'Cnda', 'Cndr']) SRC['aero.derivatives.' + k] = GEO;
for (const k of ['deda', 'eps0', 'a_t', 'eta_t', 'CLadot', 'Cmadot']) SRC['interference.downwash.' + k] = GEO;
for (const k of ['staticThrustISA', 'staticThrustVTBD31C', 'momentumIdealStaticISA', 'peakEfficiency', 'CP_static_NTO', 'tipMach_static']) SRC['propeller.checks.' + k] = ['R3', 'R4'];
const NOTE = {
  'interference.downwash.l_t': 'FlightGear 44.58 ft (13.59 m), Nita 13.565 m; ค่าที่เลือก',
  'propeller.identity.thrustAxis': 'สมมติแกนแรงขับขนานแกน x ของลำตัว; มุมติดตั้งเครื่องยนต์จริงไม่พบ',
};
const getP = (o, p) => p.split('.').reduce((a, k) => a && a[k], o);
const findLeaf = p => { const b = [b1, b2, b3, b4].find(x => getP(x.atr72_600, p)); if (!b) throw new Error('no leaf ' + p); return getP(b.atr72_600, p); };
for (const [p, s] of Object.entries(SRC)) { const l = findLeaf(p); if (!l.src.length) l.src = [...s]; }
for (const [p, n] of Object.entries(NOTE)) { const l = findLeaf(p); if (!l.note) l.note = n; }

// ตรวจ leaf
let nLeaf = 0, bad = [];
const KEYS = ['v', 'u', 'scope', 'src', 'conf', 'est', 'note'];
function walk(o, p) { for (const [k, v] of Object.entries(o)) { const q = p ? p + '.' + k : k;
  if (v && typeof v === 'object' && 'v' in v && 'u' in v && 'scope' in v) { nLeaf++; const ks = Object.keys(v); if (ks.length !== 7 || !KEYS.every(x => ks.includes(x))) bad.push(q); if (!['สูง', 'กลาง', 'ต่ำ'].includes(v.conf)) bad.push(q + ' conf'); if (!Array.isArray(v.src)) bad.push(q + ' src'); if (v.src.length === 0 && !q.endsWith('_na') && v.est !== true) bad.push(q + ' empty src non-est'); }
  else if (v && typeof v === 'object' && !Array.isArray(v)) walk(v, q); else bad.push(q + ' (not a leaf)'); } }
for (const b of [b1, b2, b3, b4]) walk(b.atr72_600, 'atr72_600');
const isLeaf = v => v && typeof v === 'object' && !Array.isArray(v) && 'v' in v && 'u' in v && 'scope' in v;
const pp = (o, ind = '') => { const ks = Object.keys(o); return '{\n' + ks.map((k, n) => ind + '  ' + JSON.stringify(k) + ': ' + (isLeaf(o[k]) ? JSON.stringify(o[k]) : pp(o[k], ind + '  ')) + (n < ks.length - 1 ? ',' : '')).join('\n') + '\n' + ind + '}'; };
const fmt = b => '```json\n' + pp(b) + '\n```\n';
if (process.argv[2] === 'check') { console.log('leaves', nLeaf, 'bad', bad); }
else { for (const b of [b1, b2, b3, b4]) process.stdout.write(fmt(b) + '\n'); console.error('leaves', nLeaf, 'bad', bad.length ? bad : 'none'); }
