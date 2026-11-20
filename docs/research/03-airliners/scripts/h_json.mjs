// h_json.mjs — หัวข้อ 3.4: สร้างบล็อก JSON ของ a330_300 (คีย์บนสุดคีย์เดียว) จากค่าที่คำนวณใน h_*.mjs และค่าจากแหล่ง
// รัน: node h_json.mjs > h_json_out.md ; ทุก leaf = {v,u,scope,src,conf,est,note}
const L = (v, u, scope, src, conf, est, note = '') => ({ v, u, scope, src, conf, est, note });
const D2R = Math.PI / 180, f = (x, d = 4) => +x.toFixed(d);
// legacy Cm0/Cmflap (trim ที่ elevator 0): clean 250 kt SL 185.3 t และ FULL ที่ α 5.74°
const Cma = -0.963, aClean = (185280 * 9.80665 / (0.5 * 1.225 * (250 * 0.514444) ** 2 * 361.6) - 0.116) / 0.0885;
const Cm0 = -Cma * aClean * D2R, Cmflap = -Cm0 - Cma * 5.74 * D2R;
const conf = ['CONF0', 'CONF1', 'CONF1+F', 'CONF2', 'CONF3', 'FULL'];
const CLMAX = [1.26, 1.80, 2.10, 2.24, 2.32, 2.45], ASTAR = [14.05, 20.0, 20.0, 19.5, 18.5, 17.5], CL0 = [0.116, 0.129, 0.429, 0.614, 0.782, 1.001];
const DCD0 = [0, 0.004, 0.010, 0.020, 0.030, 0.050], EFF = [null, 0.78, 0.75, 0.72, 0.72, 0.70], VFE = [null, 240, 215, 196, 186, 180];
const byConf = arr => Object.fromEntries(conf.map((c, i) => [c, arr[i]]));
const masses = [130000, 150000, 170000, 187000, 210000, 242000];
const vs = (m, cl) => +(Math.sqrt(2 * m * 9.80665 / (1.225 * 361.6 * cl)) / 0.514444).toFixed(1);
const VS1g = { axes: { mass_kg: masses, flap: conf }, data: masses.map(m => CLMAX.map(cl => vs(m, cl))) };
const VLS = { axes: { mass_kg: masses, flap: ['CONF3', 'FULL'] }, data: masses.map(m => [+(1.23 * vs(m, 2.32)).toFixed(1), +(1.23 * vs(m, 2.45)).toFixed(1)]) };
const VAPP = { axes: { mass_kg: masses, flap: ['CONF3', 'FULL'] }, data: VLS.data.map(r => r.map(v => +(v + 5).toFixed(1))) };
const out = { a330_300: {
  _na: L(['propeller.*', 'turboprop.*', 'interference.slipstream.*', 'aero.spin_reference.*', 'gear.certification.part23_limit_descent', 'gear.certification.part23_wing_lift_ratio', 'gear.certification.part23_min_load_factors', 'gear.certification.part23_reserve_drop_factor', 'wind.fFactor.trainerExcessTW', 'wind.wake.trainerRollControl', 'validation.procedures.v50MinFactor_singleEngine', 'validation.currentModel.*', 'validation.typicalModes.*'], '-', 'aircraft', [], 'สูง', false, 'เจ็ตสองเครื่องยนต์ไม่มีใบพัดและ slipstream; ไม่จำลอง spin; การรับรองล้อเป็น Part 25; ค่าเฉพาะของเครื่องฝึกไม่ใช้ ให้ใช้ validation.reference_modes และ validation.trim_targets แทน'),
  airframe: {
    identity: L({ manufacturer: 'Airbus S.A.S.', model: 'A330-300', variant: 'A330-343 (ATSB: AirAsia X ใช้ A330-343X; HS-XTC เป็น A330-343E)', engine: 'Rolls-Royce Trent 772B-60 (Trent 700) สองเครื่อง', icao: 'A333', seats: { XJ_P_E: [12, 365], XJ_total: 377, XJ_all_economy: 367, XJ_C18_Y345_from_Dec2025: 363, airbus_typical: '250-290', max_exit: 440 }, operatorsDMK: [{ airline: 'Thai AirAsia X (XJ/TAX)', fleet: { wikipedia_2025_08: 11, capa_2024_12_31: 10 }, base: 'DMK' }] }, '-', 'aircraft', ['H10', 'H27', 'H28', 'H9', 'H11', 'H2', 'H3'], 'กลาง', false, 'รุ่นเครื่องยนต์ของฝูงบินไทยอนุมานจากกลุ่ม AirAsia X (ATSB) และ TCDS ที่ให้ A330-343 ใช้ Trent 768-60/772B-60/772C-60; รุ่น 772B-60 ของ HS-XT* ยังไม่ยืนยันรายลำ; จำนวนลำต่างกันตามวันที่ (หัวข้อรอบ 5 เขียน 6 ลำที่ยังบิน)'),
    weights: {
      MTW: L({ WV000: 212900, WV022: 233900, WV052: 233900, WV054: 235900, WV080: 238900, WV081: 242900, WV083: 240900 }, 'kg', 'aircraft', ['H1'], 'สูง', false, 'Maximum ramp weight; AC 2-1-1 Jul 01/23 มี 37 WV ของ A330-300'),
      MTOW: L({ WV000: 212000, WV022: 233000, WV052: 233000, WV054: 235000, WV080: 238000, WV081: 242000, WV083: 240000 }, 'kg', 'aircraft', ['H1', 'H3'], 'สูง', false, 'WV081 533,519 lb; WV000 467,380 lb'),
      MLW: L({ WV000: 174000, WV022: 187000, WV052: 187000, WV054: 187000, WV080: 187000, WV081: 187000, WV083: 187000 }, 'kg', 'aircraft', ['H1'], 'สูง', false, '187,000 kg = 412,264 lb; OpenAP 188,000 (ขัดแย้ง ใช้ AC)'),
      MZFW: L({ WV000: 164000, WV022: 175000, WV052: 175000, WV054: 173000, WV080: 175000, WV081: 171000, WV083: 173000 }, 'kg', 'aircraft', ['H1'], 'สูง', false, 'WV082 และ WV055 เป็น dynamic payload (171 ถึง 175 t และ 173 ถึง 175 t)'),
      OEW: L({ jenkinson_1999: 118189, openap: 122780 }, 'kg', 'aircraft', ['H5', 'H12'], 'กลาง', false, 'ค่าในหนังสือ/ฐานข้อมูล ไม่ใช่ของ Thai AirAsia X'),
      default_sim: L({ MTW: 242900, MTOW: 242000, MLW: 187000, MZFW: 171000 }, 'kg', 'aircraft', ['H1', 'H3', 'H29'], 'ต่ำ', true, 'เลือก WV081 (MTOW 242 t ตาม Facts & Figures; ตัวเลือก 242 t ส่งมอบครั้งแรกปี 2015) เพราะไม่พบ WV ของ Thai AirAsia X; MLW 187 t เป็นค่าสูงสุดของ A330-300 (WV022, 031, 033, 035, 039, 051 ถึง 056, 058, 080 ถึง 083)'),
      max_fuel: L({ usable_L: 97530, kg_at_0p785: 76561 }, 'L, kg', 'aircraft', ['H1'], 'สูง', false, '25,765 US gal; Jenkinson 98,250 L; OpenAP mfc 139,000 (หน่วยไม่ระบุ ขัดแย้ง ไม่ใช้)'),
      min_weight: L(121000, 'kg', 'aircraft', ['H20'], 'ต่ำ', false, 'การ์ดทบทวนนักบิน (สำเนาไม่เป็นทางการ)'),
    },
    cg: {
      LEMAC_x: L(28.95, 'm STA', 'aircraft', ['D4', 'H2'], 'ต่ำ', true, 'ไม่พบในแหล่งสาธารณะ; = CG อ้างอิง 30.77 m STA ของหัวข้อ 5 (ล้อหน้ารับ 8 %) − 0.25 × 7.27 (h_speeds_perf.mjs)'),
      MAC: L(7.27, 'm', 'aircraft', ['H2', 'H5', 'H12'], 'สูง', false, 'TCDS (ส่วน A330-200 ปีกเดียวกัน) "MAC: 7,270m" = 286.2 in; Jenkinson/OpenAP 7.26'),
      datum: L({ A330_200_fwd_of_nose_m: 6.382, A330_300: null }, 'm', 'aircraft', ['H2'], 'กลาง', false, 'TCDS ส่วน A330-200 "Station 0.0, located 6,382 meters forward of aeroplane nose"; ส่วน A330-300 อ่านไม่ได้'),
      fwd_limit_pctMAC: L({ TSB_CGHLM_takeoff_221t: 23.8, AF447_takeoff_233t_A330_203: 23.3 }, '%MAC', 'aircraft', ['H6', 'H7'], 'กลาง', false, 'เป็น CG จริงในรายงาน ไม่ใช่ขีดจำกัด; TCDS ให้ "Refer to approved AFM"; ซอง CG ไม่พบในแหล่งสาธารณะ'),
      aft_limit_pctMAC: L({ AF447_cruise_205t: 28.7, QF72_cruise_185t_refdist: 28.2 }, '%MAC', 'aircraft', ['H7', 'H8'], 'กลาง', false, 'CG จริงในรายงาน (QF72 ใช้คำว่า reference distance); ขีดจำกัดท้ายไม่พบ'),
      ref_pctMAC: L(25, '%MAC', 'aircraft', ['H2'], 'สูง', true, 'ข้อตกลงรอบที่ 3; กรณีทดสอบพลวัตใช้ 28 %'),
    },
    inertia: {
      ref_mass: L(187000, 'kg', 'aircraft', ['H1'], 'ต่ำ', true, 'MLW'),
      Ixx: L(15810000, 'kg m2', 'aircraft', ['L23', 'L13', 'H17'], 'ต่ำ', true, 'm (Rx b/2)², Rx 0.305, b 60.30 (h_inertia.mjs); ±25 %'),
      Iyy: L(41140000, 'kg m2', 'aircraft', ['L23', 'L13'], 'ต่ำ', true, 'm (Ry L/2)², Ry 0.466, L 63.66; ถ้าใช้ Ry ระดับ B747 (~0.35 ถึง 0.39) จะต่ำลง 30 ถึง 45 %'),
      Izz: L(54130000, 'kg m2', 'aircraft', ['L23', 'L13'], 'ต่ำ', true, 'm (Rz e/2)², Rz 0.549, e = (b + L)/2'),
      Ixz: L(0, 'kg m2', 'aircraft', ['H16', 'H17'], 'ต่ำ', true, 'แกนตัวเครื่อง (FG A330 0; JSBSim B747 −970,000 slug ft²); แกน stability ที่ α 5°: −3.33e6'),
      radii: L({ Rx: 0.305, Ry: 0.466, Rz: 0.549 }, '-', 'aircraft', ['L23', 'L13', 'L45', 'H17'], 'ต่ำ', true, 'รัศมีของ A320 (หัวข้อ 3) ใช้กับขนาด A330; B747 JSBSim Rx 0.287 ถึง 0.316 สนับสนุน Rx; FG A330 (0.191/0.263/0.253, Izz < Iyy) ตัดทิ้ง'),
      source_values: L({ fg_a330_empty: { m: 97069, Ixx: 3221000, Iyy: 6785000, Izz: 5978000 }, jsbsim_b747: { m_empty: 237600, Ixx: 24676000, Iyy: 44877000, Izz: 67384000, Ixz: -1315000 } }, 'kg, kg m2', 'aircraft', ['H16', 'H17'], 'ต่ำ', false, 'แปลงจาก slug ft² และ lb'),
    },
    wing: {
      S: L(361.6, 'm2', 'aircraft', ['H12', 'H16', 'H5'], 'สูง', false, '3,892 ft²; Jenkinson 363.1'),
      b: L(60.3, 'm', 'aircraft', ['H3', 'H2'], 'สูง', false, '197 ft 10 in (รวม winglet); Jenkinson 58.0 (ไม่รวม)'),
      MAC: L(7.27, 'm', 'aircraft', ['H2'], 'สูง', false, ''),
      AR: L({ geometric_b60p3: 10.056, jenkinson: 9.26 }, '-', 'aircraft', ['H5'], 'สูง', true, 'b²/S'),
      taper: L(0.251, '-', 'aircraft', ['H5'], 'กลาง', false, ''),
      sweep_c4_deg: L(29.7, 'deg', 'aircraft', ['H5', 'H12'], 'สูง', false, ''),
      dihedral_deg: L(5.0, 'deg', 'aircraft', ['L13'], 'ต่ำ', true, 'ไม่พบ; ใช้ระดับเดียวกับ A320 (5.1° ใน FBW cfg)'),
      incidence_deg: L(1.03, 'deg', 'aircraft', ['H16'], 'ต่ำ', false, 'ค่าใน FlightGear metrics'),
      twist_deg: L(null, 'deg', 'aircraft', ['H12'], 'ต่ำ', true, 'ไม่พบในแหล่งสาธารณะ'),
      airfoil: L({ tc_avg: 0.11, type: 'supercritical' }, '-', 'aircraft', ['H12', 'H13'], 'กลาง', false, 'OpenAP t/c 0.11; drag.py ถือว่าเป็น supercritical (kappa 0.95)'),
      flap: L({ type: 'Fowler (S2 = slotted ช่องเดียวตาม Jenkinson; OpenAP เขียน double-slotted) + slats', span_ratio: 0.665, cf_c: 0.15, Sf_S: 0.15, lambda_f: 0.9 }, '-', 'aircraft', ['H5', 'H12', 'H25'], 'กลาง', false, 'ชนิดแฟลปขัดแย้งระหว่างแหล่ง (ดูส่วนความขัดแย้ง)'),
    },
    tail: {
      S_h: L(72.9, 'm2', 'aircraft', ['H5'], 'กลาง', false, 'span 19.06 m, AR 4.98, taper 0.36, sweep 30°; FG 222 ft² (20.6 m²) ผิดลำดับ'),
      l_h: L(28.6, 'm', 'aircraft', ['H5'], 'กลาง', false, 'V_H = 0.793'),
      b_h: L(19.06, 'm', 'aircraft', ['H5'], 'กลาง', false, ''),
      S_v: L(45.2, 'm2', 'aircraft', ['H5'], 'กลาง', false, 'height 8.45 m, AR 1.58, taper 0.35, sweep 45°; FG 496 ft² (46.1 m²)'),
      l_v: L(27.5, 'm', 'aircraft', ['H5'], 'กลาง', false, 'V_V = 0.057'),
      b_v: L(8.45, 'm', 'aircraft', ['H5'], 'กลาง', false, ''),
    },
  },
  aero: {
    ref: { S: L(361.6, 'm2', 'aircraft', ['H12'], 'สูง', false, ''), b: L(60.3, 'm', 'aircraft', ['H3'], 'สูง', false, ''), c: L(7.27, 'm', 'aircraft', ['H2'], 'สูง', false, '') },
    static_long: {
      CL0: L(byConf(CL0), '-', 'aircraft', ['H8', 'H6', 'H5'], 'ต่ำ', true, 'CONF0 ยึดกับ QF72 (α 2.5° ที่ M0.82) แล้วคูณ β; CONF อื่น = CLmax + 0.10 − CLα α* (h_aero_modes.mjs)'),
      CLalpha: L({ M0p21: 5.072, M0p82: 6.654 }, '1/rad', 'aircraft', ['H5'], 'ต่ำ', true, 'DATCOM ทั้งลำ (ปีก 4.563, หาง 3.885, dε/dα 0.278)'),
      CLmax_target: L(byConf(CLMAX), '-', 'aircraft', ['H5', 'H6', 'H4'], 'ต่ำ', true, 'FULL จาก Jenkinson Vapp 136 kt = VLS ที่ 179 t; CONF2 จาก V2 144 kt = 1.13 VS1g ที่ 217 t; CONF0 = A320 × cosΛ; ที่เหลือแทรกค่า; S 361.6'),
      alpha_star: L(byConf(ASTAR), 'deg', 'aircraft', ['H6', 'H8'], 'ต่ำ', true, 'รูปแบบ A320 แล้วเลื่อน +2° ให้ตรงจุด lift-off ของ TSB (152 kt, 13.7°)'),
      alpha_CLmax: L(byConf(ASTAR), 'deg', 'aircraft', ['H6'], 'ต่ำ', true, 'เท่ากับ alpha_star ในแบบจำลองนี้'),
      Cmalpha: L({ approach_cg28: -0.963, cruise_M0p82_cg28: -1.072 }, '1/rad', 'aircraft', ['H5'], 'ต่ำ', true, 'Cmα = −CLα (h_n − h_cg)'),
      neutral_point_pctMAC: L({ M0p21: 47.0, M0p82: 44.1 }, '%MAC', 'aircraft', ['H5'], 'ต่ำ', true, 'build-up DATCOM แบบย่อ'),
    },
    flaps: {
      detents: L(conf.map((c, i) => ({ name: c, slat_deg: null, flap_deg: [0, 0, 8, 14, 22, 32][i], VFE_kt: VFE[i], dCL0: f(CL0[i] - CL0[0], 3), dCD0: DCD0[i], dCm0: null, CLmax: CLMAX[i] })), 'deg, kt IAS, -', 'aircraft', ['H20', 'H16'], 'ต่ำ', true, 'VFE จากการ์ดทบทวน (240/215/196/186/180; CONF2* 205 สำหรับวิ่งขึ้น) conf กลาง; มุมแฟลปไม่พบในแหล่งปฐมภูมิ (ค่าในตารางเป็นค่าประมาณ ไม่ยืนยัน); FG ใช้แฟลปเต็ม 35° สแลตเต็ม 27°'),
      transition_time_s: L({ flaps_full_travel: 30, slats_full_travel: 20 }, 's', 'aircraft', ['H16'], 'ต่ำ', false, 'จากอัตราใน FG: แฟลป 35° ÷ 1.1667°/s, สแลต 27° ÷ 1.35°/s'),
    },
    polar: {
      CD0_clean: L(0.022, '-', 'aircraft', ['H12', 'H15'], 'กลาง', false, 'OpenAP (Sun et al.); FG 0.0125'),
      K_by_flap: L(Object.fromEntries(conf.map((c, i) => [c, i === 0 ? 0.041 : f(1 / (Math.PI * 10.056 * EFF[i]), 4)])), '-', 'aircraft', ['H12', 'L21'], 'ต่ำ', true, 'clean 0.041 (OpenAP e 0.773); แฟลปใช้ e ตามรูปแบบ A320'),
      dCD0_by_flap: L(byConf(DCD0), '-', 'aircraft', ['L21', 'H13'], 'ต่ำ', true, 'รูปแบบ A320 ของหัวข้อ 3; สูตร OpenAP drag.py ให้เพียง 0.002/0.0022/0.0026/0.0034/0.0048 (ต่ำเกิน)'),
    },
    gear_drag: { dCD0: L(0.014, '-', 'aircraft', ['H12', 'H13'], 'กลาง', false, 'OpenAP; สูตร Mair & Birdsall ใน drag.py ที่ MTOW 242 t ได้ 0.0144; FG 0.0175') },
    mach: {
      Mcrit: L({ CL0p5: 0.764 }, '-', 'aircraft', ['H13', 'H12'], 'ต่ำ', true, 'Korn: 0.95/cosΛ − 0.11/cos²Λ − 0.1 CL/cos³Λ − 0.108'),
      MDD: L(0.864, '-', 'aircraft', ['H13'], 'ต่ำ', true, 'ΔCDw = 0.002 ที่ M = Mcrit + 0.1; MMO 0.86'),
      CD_wave_table: L({ axes: { mach: [0.74, 0.78, 0.80, 0.82, 0.84, 0.86, 0.88] }, data: [0, 0, 0.00004, 0.0002, 0.00068, 0.00173, 0.00367] }, '-', 'aircraft', ['H13'], 'ต่ำ', true, 'ที่ CL 0.5: 20 (M − Mcrit)^4'),
      CLalpha_vs_Mach: L({ axes: { mach: [0.2, 0.4, 0.5, 0.6, 0.7, 0.76, 0.8, 0.82, 0.86] }, data: [5.065, 5.274, 5.45, 5.694, 6.035, 6.308, 6.529, 6.654, 6.943] }, '1/rad', 'aircraft', ['H5'], 'ต่ำ', true, 'DATCOM Helmbold กับ β'),
    },
    derivatives: {
      CLq: L({ approach: 5.55, cruise: 6.98 }, '1/rad (c/2V)', 'aircraft', ['H5'], 'ต่ำ', true, '2 η a_t V_H'),
      CLadot: L({ approach: 1.54, cruise: 2.59 }, '1/rad (c/2V)', 'aircraft', ['H5'], 'ต่ำ', true, 'CLq dε/dα'),
      CLde: L({ approach: 0.352, cruise: 0.443 }, '1/rad', 'aircraft', ['H5'], 'ต่ำ', true, 'τe 0.50'),
      CD0: L(0.022, '-', 'aircraft', ['H12'], 'กลาง', false, 'clean'),
      K: L(0.041, '-', 'aircraft', ['H12'], 'กลาง', false, 'clean'),
      CYb: L({ approach: -0.505, cruise: -0.547 }, '1/rad', 'aircraft', ['H5'], 'ต่ำ', true, 'FG −0.609'),
      CYp: L({ approach: 0.040, cruise: 0.064 }, '1/rad (b/2V)', 'aircraft', ['H5'], 'ต่ำ', true, ''),
      CYr: L({ approach: 0.314, cruise: 0.350 }, '1/rad (b/2V)', 'aircraft', ['H5'], 'ต่ำ', true, ''),
      CYdr: L({ approach: 0.196, cruise: 0.220 }, '1/rad', 'aircraft', ['H5'], 'ต่ำ', true, 'τr 0.58 (ปรับให้ VMCA ≈ 122 kt)'),
      Clb: L({ approach: -0.201, cruise: -0.176 }, '1/rad', 'aircraft', ['H5'], 'ต่ำ', true, 'FG −0.1'),
      Clp: L({ approach: -0.483, cruise: -0.638 }, '1/rad (b/2V)', 'aircraft', ['H5'], 'ต่ำ', true, 'FG −0.46'),
      Clr: L({ approach: 0.265, cruise: 0.145 }, '1/rad (b/2V)', 'aircraft', ['H5'], 'ต่ำ', true, ''),
      Clda: L({ approach: 0.135, cruise: 0.180 }, '1/rad', 'aircraft', ['H5'], 'ต่ำ', true, 'aileron ช่วง 0.66 ถึง 0.97 ของครึ่งปีก (ประมาณ) ไม่รวม spoiler'),
      Cldr: L({ approach: 0.0115, cruise: 0.0186 }, '1/rad', 'aircraft', ['H5'], 'ต่ำ', true, ''),
      Cmq: L({ approach: -24.0, cruise: -30.2 }, '1/rad (c/2V)', 'aircraft', ['H5'], 'ต่ำ', true, 'FG −37.2'),
      Cmadot: L({ approach: -6.06, cruise: -10.18 }, '1/rad (c/2V)', 'aircraft', ['H5'], 'ต่ำ', true, ''),
      Cmde: L({ approach: -1.387, cruise: -1.744 }, '1/rad', 'aircraft', ['H5'], 'ต่ำ', true, '−CLde l_h/c'),
      CLih: L({ approach: 0.705 }, '1/rad', 'aircraft', ['H5'], 'ต่ำ', true, 'THS'),
      Cmih: L({ approach: -2.773 }, '1/rad', 'aircraft', ['H5'], 'ต่ำ', true, 'THS'),
      Cnb: L({ approach: 0.046, cruise: 0.064 }, '1/rad', 'aircraft', ['H5'], 'ต่ำ', true, 'FG 0.139'),
      Cnp: L({ approach: -0.150, cruise: -0.091 }, '1/rad (b/2V)', 'aircraft', ['H5'], 'ต่ำ', true, ''),
      Cnr: L({ approach: -0.197, cruise: -0.171 }, '1/rad (b/2V)', 'aircraft', ['H5'], 'ต่ำ', true, 'FG −0.3'),
      Cnda: L({ approach: -0.031, cruise: -0.013 }, '1/rad', 'aircraft', ['H5'], 'ต่ำ', true, ''),
      Cndr: L({ approach: -0.091, cruise: -0.101 }, '1/rad', 'aircraft', ['H5', 'H20'], 'ต่ำ', true, 'เครื่องหมายตามโค้ด (rudder บวก = จมูกซ้าย)'),
    },
    legacy: L({ CL0: 0.116, CLa: 5.072, CLflap: 0.885, CDflap: 0.05, CDgear: 0.014, CD0: 0.022, K: 0.041, Cm0: f(Cm0), Cma: -0.963, Cmflap: f(Cmflap), aStall: 16.59, aStallFlap: 4.16, flapMap: { CONF0: 0, CONF1: 0.015, 'CONF1+F': 0.354, CONF2: 0.563, CONF3: 0.753, FULL: 1 }, CLq: 5.55, CLadot: 1.54, CLde: 0.352, Cmq: -24.0, Cmadot: -6.06, Cmde: -1.387 }, 'ตามนิยาม AC (deg สำหรับ aStall)', 'aircraft', ['H5', 'H12', 'H8'], 'ต่ำ', true, 'AC.flaps 1 = FULL; aStall/aStallFlap หาให้ max ของ blend (M 55) = CLmax CONF0/FULL; legacy ให้ CLmax CONF1 1.28 แทน 1.80 (สแลตแสดงไม่ได้); Cm0/Cmflap ให้ trim ที่ elevator 0 ทั้ง clean 250 kt และ FULL α 5.74°'),
  },
  interference: {
    downwash: {
      deda: L({ approach: 0.278, cruise: 0.371 }, '-', 'aircraft', ['H5'], 'ต่ำ', true, 'DATCOM'),
      l_t: L(28.6, 'm', 'aircraft', ['H5'], 'กลาง', false, ''),
      VH: L(0.793, '-', 'aircraft', ['H5'], 'กลาง', true, 'S_h l_h/(S c)'),
      a_t: L(3.885, '1/rad', 'aircraft', ['H5'], 'ต่ำ', true, 'DATCOM AR 4.98'),
      eta_t: L(0.9, '-', 'aircraft', ['L21'], 'ต่ำ', true, 'ค่าตั้งต้นเดียวกับหัวข้อ 3'),
      CLadot: L(1.54, '1/rad', 'aircraft', ['H5'], 'ต่ำ', true, ''),
      Cmadot: L(-6.06, '1/rad', 'aircraft', ['H5'], 'ต่ำ', true, ''),
    },
    groundEffect: { CLa_w: L(4.563, '1/rad', 'aircraft', ['H5'], 'ต่ำ', true, 'ปีกอย่างเดียว M 0.21'), A: L(10.056, '-', 'aircraft', ['H12', 'H3'], 'สูง', true, 'b²/S') },
  },
  speeds: {
    VMO_kt: L(330, 'kt CAS', 'aircraft', ['H12', 'H5'], 'กลาง', false, 'OpenAP และ Jenkinson; TCDS ให้ "Refer to AFM"'),
    MMO: L(0.86, '-', 'aircraft', ['H12', 'H5'], 'กลาง', false, 'VD/MD 365 kt/0.93 (Jenkinson)'),
    VLE_kt: L({ kt: 250, mach: 0.55 }, 'kt CAS', 'aircraft', ['H20'], 'ต่ำ', false, 'การ์ดทบทวน (สำเนาไม่เป็นทางการ)'),
    VLO_kt: L({ extension: 250, retraction: 250, mach: 0.55 }, 'kt CAS', 'aircraft', ['H20'], 'ต่ำ', false, 'การ์ดทบทวน'),
    VFE: L({ CONF1: 240, 'CONF1+F': 215, 'CONF2_takeoff': 205, CONF2: 196, CONF3: 186, FULL: 180 }, 'kt CAS', 'aircraft', ['H20'], 'กลาง', false, 'การ์ดทบทวน อ้าง FCOM; ไม่พบเอกสารปฐมภูมิ'),
    VS1g: L(VS1g, 'kt CAS', 'aircraft', ['H5', 'H6'], 'ต่ำ', true, 'sqrt(2 m g/(ρ0 S CLmax)), S 361.6, ISA SL, CAS ≈ EAS (h_speeds_perf.mjs)'),
    VLS: L(VLS, 'kt CAS', 'aircraft', ['H5', 'L9'], 'ต่ำ', true, '1.23 VS1g; ที่ 179 t FULL = 136.0 kt = Vapp ของ Jenkinson'),
    VAPP_kt: L(VAPP, 'kt CAS', 'aircraft', ['L9'], 'ต่ำ', true, 'VLS + 5 (A/THR on, ลมสงบ)'),
    V2_kt: L({ axes: { mass_kg: [180000, 200000, 222700, 242000], flap: ['CONF1+F', 'CONF2', 'CONF3'] }, data: [[1.13, 1.13, 1.13].map((k, i) => +(k * vs(180000, [2.10, 2.24, 2.32][i])).toFixed(1)), [1.13, 1.13, 1.13].map((k, i) => +(k * vs(200000, [2.10, 2.24, 2.32][i])).toFixed(1)), [1.13, 1.13, 1.13].map((k, i) => +(k * vs(222700, [2.10, 2.24, 2.32][i])).toFixed(1)), [1.13, 1.13, 1.13].map((k, i) => +(k * vs(242000, [2.10, 2.24, 2.32][i])).toFixed(1))] }, 'kt CAS', 'aircraft', ['H22', 'H6'], 'ต่ำ', true, 'V2min = 1.13 VS1g; V2 ใช้งานจริงสูงกว่าได้ (TSB 162 kt = 1.216 VS1g ที่ 222.7 t บนทางวิ่ง 4,000 m)'),
    takeoff_typical: L({ mass_kg: 242000, flap: 'CONF2', V1: 148, VR: 151.5, V2: 156.5, TSB_CGHLM_222t_CONF1F: { V1: 156, VR: 157, V2: 162 } }, 'kt CAS', 'aircraft', ['H6', 'H22'], 'ต่ำ', true, 'V2 = 1.13 × 1.03 VS1g (ค่าประมาณ), VR = V2 − 5, V1 = VR − 3.5 (ค่าประมาณ); จุด TSB เป็นค่าจริงแต่ใช้ FLEX'),
    VMCG_kt: L(120, 'kt CAS', 'aircraft', ['H24', 'H20'], 'ต่ำ', true, 'ไม่พบในแหล่งสาธารณะ; ≈ VMCA − 2 kt ตามความต่างของ A320 (หัวข้อ 3)'),
    VMCA_kt: L(122, 'kt CAS', 'aircraft', ['H24', 'H20'], 'ต่ำ', true, 'ไม่พบ; ≈ VMCL 125 − 3 kt; build-up τr 0.58 ให้ 122.2 kt ที่แรงขับ 0.85 × 316.3 kN, rudder 30°, y_e 9.40 m'),
    VMCL_kt: L(125, 'kt CAS', 'aircraft', ['H20'], 'ต่ำ', false, 'การ์ดทบทวน (สำเนาไม่เป็นทางการ)'),
    crosswind_demonstrated_kt: L({ takeoff_incl_gust: 32, landing_incl_gust: 40 }, 'kt', 'aircraft', ['H20'], 'ต่ำ', false, '"Take Off 32 kt (gust included)", "Landing 40 kt (gust included) MAX demonstrated" ตามการ์ดทบทวน; ไม่พบ AFM'),
    tailwind_limit_kt: L({ takeoff_landing: 15, autoland: 10 }, 'kt', 'aircraft', ['H20'], 'ต่ำ', false, 'ขีดจำกัดทั่วไปที่ ≤ 11,000 ft'),
    icao_approach_category: L('C', '-', 'aircraft', ['H4'], 'สูง', false, 'Airbus ME1911189; VAT < 141 kt (แบบจำลองให้ VLS FULL ที่ 187 t = 139.0 kt)'),
  },
  performance: {
    TOFL_MTOW_ISA_SL: L({ est_242t_trent772b: 2737, jenkinson_217t_cf6: 2320 }, 'm', 'aircraft', ['H5', 'J6'], 'ต่ำ', true, '2,320 × (242/217)² × (300/316.3) (h_speeds_perf.mjs) = 8,979 ft; Jenkinson ISA+20 2,680 m, 5,000 ft 3,840 m; AC 3-3 เป็นกราฟอ่านไม่ได้'),
    LFL_MLW_ISA_SL: L({ est_187t: 1672, jenkinson_179t: 1600 }, 'm', 'aircraft', ['H5'], 'ต่ำ', true, 'certified (×1.667); สเกลตามน้ำหนัก 1,600 × 187/179 = 5,484 ft'),
    landing_distance_actual_MLW: L({ est_187t: 1003, est_179t: 960 }, 'm', 'aircraft', ['H5', 'H23'], 'ต่ำ', true, 'LFL/1.667 (จาก 50 ft ถึงหยุด)'),
    ROC_initial_fpm: L(1736, 'fpm', 'aircraft', ['H14'], 'ต่ำ', false, 'WRAP cl_vs_avg_pre_cas 8.82 m/s (ค่าสถิติ ADS-B ไม่ใช่สมรรถนะสูงสุด)'),
    service_ceiling_ft: L(41010, 'ft', 'aircraft', ['H12', 'H2'], 'กลาง', false, 'OpenAP 12,500 m; TCDS ส่วน A330-200 FL 414.5'),
    cruise_Mach: L({ typical: 0.82, wrap_mean: 0.81 }, '-', 'aircraft', ['H8', 'H12', 'H14'], 'กลาง', false, 'QF72 M0.82 ที่ FL370'),
    range_km: L(11750, 'km', 'aircraft', ['H3'], 'สูง', false, '6,350 nm (Airbus)'),
    max_fuel_kg: L(76561, 'kg', 'aircraft', ['H1'], 'สูง', false, '97,530 L × 0.785'),
    load_factor_limits: L({ clean: [-1, 2.5], flaps: [0, 2.0] }, 'g', 'aircraft', ['H20', 'H34'], 'กลาง', false, 'การ์ดทบทวน; ตรงกับค่าต่ำสุดของ 14 CFR 25.337 (W > 50,000 lb: +2.5, −1.0) และ 25.345 (แฟลป +2.0)'),
    tests: L({ wrap_takeoff_distance_km: 1.86, wrap_liftoff_mps: 89.9, wrap_final_approach_mps: 73.0, wrap_touchdown_mps: 71.5, wrap_braking_distance_km: 1.48, wrap_braking_decel_mps2: -1.2 }, 'km, m/s, m/s2', 'aircraft', ['H14'], 'กลาง', false, 'ค่ามัธยฐานจาก ADS-B (OpenAP WRAP) เป็นความเร็วพื้น/อากาศรวมลม ไม่ใช่ค่าที่รับรอง'),
  },
  validation: {
    reference_modes: {
      est_approach_FULL_187t: L({ mass_kg: 187000, V_kt: 144.0, CG_pctMAC: 28, sp_wn: 0.586, sp_zeta: 0.688, CAP: 0.102, ph_T_s: 43.4, ph_zeta: 0.007, dr_wn: 0.500, dr_zeta: 0.027, dr_T_s: 12.6, roll_tau_s: 0.99, spiral_T_half_s: 18.9 }, 'kg, kt, rad/s, -, s', 'aircraft', ['H5', 'L23', 'L13'], 'ต่ำ', true, 'โครงเครื่องเปล่า ไม่มี FBW และ yaw damper (h_aero_modes.mjs)'),
      est_cruise_M082_FL370: L({ mass_kg: 185280, sp_wn: 0.931, sp_zeta: 0.51, CAP: 0.064, ph_T_s: 121.8, ph_zeta: 0.031, dr_wn: 0.656, dr_zeta: 0.041, dr_T_s: 9.6, roll_tau_s: 0.83, spiral_T_half_s: 57.8 }, 'kg, rad/s, -, s', 'aircraft', ['H8', 'H5'], 'ต่ำ', true, 'โครงเครื่องเปล่า สภาพของ QF72'),
    },
    trim_targets: {
      approach_FULL_VAPP_187t: L({ mass_kg: 187000, V_kt: 144.0, gamma_deg: -3, alpha_deg: 5.74, theta_deg: 2.74, CL: 1.509, CD: 0.189, thrust_total_kN: 133.7, sink_fpm: 763 }, 'kg, kt, deg, -, kN, fpm', 'aircraft', ['H5', 'H6'], 'ต่ำ', true, 'ไม่พบมุม pitch ขณะ approach ของ A330 ในแหล่งสาธารณะ'),
      cruise_QF72: L({ mass_kg: 185280, FL: 370, mach: 0.82, CAS_kt: 270, CL: 0.493, alpha_deg: 2.5, alpha_range_src: [2, 3], q_Pa: 10196, drag_total_kN: 118.5 }, 'kg, -, kt, deg, Pa, kN', 'aircraft', ['H8'], 'กลาง', true, 'α 2 ถึง 3° จาก ATSB (สูง); CL และแรงต้านเป็นค่าคำนวณ'),
      V2_CONF2_242t: L({ CL: 1.754, alpha_deg: 12.88, L_over_D: 9.89, OEI_gradient_pct: 3.22 }, '-, deg, %', 'aircraft', ['H22', 'J6'], 'ต่ำ', true, 'V2 = 1.13 VS1g, แรงขับเครื่องเดียว 316.3 kN'),
    },
    anchors: {
      TSB_C_GHLM_A330_343: L({ mass_kg: 221200, CG_pctMAC: 23.8, conf: 'CONF1+F', FLEX_C: 48, V1: 156, VR: 157, V2: 162, rotation_start_kt: 133, pitch_rate_dps: 2.81, tailstrike_pitch_deg: 10.4, liftoff_kt: 152, liftoff_pitch_deg: 13.7 }, 'kg, %MAC, °C, kt, deg/s, deg', 'aircraft', ['H6'], 'สูง', false, 'หมุนก่อน VR 24 kt ทำให้หางแตะ'),
      QF72_A330_303: L({ mass_kg: 185280, cg_refdist_pct: 28.2, FL: 370, mach: 0.82, CAS_kt: 270, alpha_deg: [2, 3], elevator_deg: { nose_up: 30, nose_down: 15 }, ths_deg: { nose_up: 14, nose_down: 2 } }, 'kg, %, kt, deg', 'aircraft', ['H8'], 'สูง', false, 'ATSB AO-2008-070'),
      AF447_A330_203: L({ takeoff_mass_kg: 232757, takeoff_cg_pct: 23.3, event_mass_kg: 205500, event_cg_pct: 28.7, sw_margin_M0p8_deg: 1.5, buffet_free_below_nz: 1.3 }, 'kg, %MAC, deg, g', 'aircraft', ['H7'], 'สูง', false, 'A330-200 (ปีกเดียวกัน ลำตัวสั้นกว่า)'),
    },
  },
  gear: {
    strut_main: {
      k_linear: L(2007689, 'N/m', 'gear', ['H16'], 'ต่ำ', false, 'FG 137,570 lbf/ft ต่อขา (bogie); ยุบนิ่ง 0.42 m ที่ 187 t (h_gear.mjs)'),
      c_linear: L(786823, 'N s/m', 'gear', ['H16'], 'ต่ำ', false, '53,915 lbf/(ft/s); ζ 0.95 ที่ 187 t'),
    },
    strut_nose: {
      k_linear: L(786190, 'N/m', 'gear', ['H16'], 'ต่ำ', false, '53,871 lbf/ft'),
      c_linear: L(583133, 'N s/m', 'gear', ['H16'], 'ต่ำ', false, '39,957 lbf/(ft/s); ζ 2.7 (หน่วงเกินมาก ควรลด)'),
    },
    tyre_main: {
      size: L({ size: '1400x530R23', type: 'radial', ply: [32, 36], count: 8, per_leg: 4 }, '-', 'gear', ['H18', 'H5'], 'สูง', false, 'ทางเลือก bias 54x21.0-23 32PR; A330neo WV251t ใช้ 40PR; bogie 4 ล้อต่อขา'),
      rated_load: L({ size: '54x21.0-23 36PR', N: 304700 }, 'N', 'gear', ['H19'], 'กลาง', false, '68,500 lb; ไม่พบค่าของ 1400x530R23'),
      rated_pressure: L({ size: '54x21.0-23 36PR', kPa: 1538 }, 'kPa', 'gear', ['H19'], 'กลาง', false, '223 psi'),
      operating_pressure: L({ est_MRW_242t: 1412 }, 'kPa', 'gear', ['H19', 'H1'], 'ต่ำ', true, '205 psi (14.1 bar) = 223 psi × ภาระต่อยาง 62,922 lb / 68,500 lb (ล้อหลักรับ 94 %, ค่าประมาณ)'),
      outside_diameter: L(1.40, 'm', 'gear', ['H18'], 'สูง', true, 'จากชื่อขนาด 1400 mm; bias 54 in = 1.37 m'),
      section_width: L(0.53, 'm', 'gear', ['H18'], 'สูง', true, '530 mm'),
      speed_rating: L(105.05, 'm/s', 'gear', ['H18'], 'สูง', false, '235 mph'),
      limit_ground_speed: L(104.95, 'm/s', 'gear', ['H20'], 'ต่ำ', false, '204 kt GS (การ์ดทบทวน)'),
    },
    tyre_nose: {
      size: L({ size: '1050x395R16', type: 'radial', ply: 28, count: 2 }, '-', 'gear', ['H18'], 'สูง', false, ''),
      outside_diameter: L(1.05, 'm', 'gear', ['H18'], 'สูง', true, ''),
      section_width: L(0.395, 'm', 'gear', ['H18'], 'สูง', true, ''),
    },
    brakes: {
      type: L({ braked_wheels: 8, nose_braked: false, material: 'carbon' }, '-', 'aircraft', ['H16', 'H5', 'H30'], 'กลาง', true, 'Honeywell Carbenix ระบุ A330/A340 เป็นแพลตฟอร์มที่ใช้ได้ (วัสดุ carbon); ผู้ผลิตเบรกของลำ Thai AirAsia X ไม่พบ; จำนวนล้อเบรกเป็นค่าที่อนุมาน (ล้อหน้าไม่มีเบรกเป็นปกติของแบบนี้)'),
      max_temp_takeoff: L({ fans_off: 300 }, '°C', 'aircraft', ['H20'], 'ต่ำ', false, 'การ์ดทบทวน'),
    },
    steering: {
      mode: L('hydraulic nose wheel steering (tiller + rudder pedals)', '-', 'aircraft', ['D6'], 'กลาง', true, 'มุมสูงสุด 72° (65° ในรุ่นที่ลดมุม) เป็นของหัวข้อ 5 ใน airframe.geometry.turning'),
      tiller_max: L({ angle_deg: 72 }, 'deg', 'aircraft', ['D6'], 'กลาง', false, 'อ้างเลขเดียวกับหัวข้อ 5; การลดมุมตามความเร็วไม่พบ (ใช้รูปแบบ A320 ชั่วคราว)'),
      pedal_max: L({ angle_deg: 6, note: 'ค่า A320 ชั่วคราว' }, 'deg', 'aircraft', ['L15', 'L16'], 'ต่ำ', true, 'ไม่พบของ A330'),
      deflated_tyre_limits: L({ one_deflated_turn_kt: 7, two_deflated_same_gear_turn_kt: 3, two_deflated_nws_max_deg: 30 }, 'kt, deg', 'aircraft', ['H20'], 'ต่ำ', false, 'การ์ดทบทวน'),
    },
  },
  wind: {
    wake: {
      b0_over_b: L(0.7854, '-', 'aircraft', ['R1:W19'], 'สูง', false, 'π/4 ปีกวงรี'),
      leaders: L({ A330_300_MLW: { mass_kg: 187000, span_m: 60.3, Vapp_kt: 144.0, Gamma0_ISA_m2ps: 426.7, w0_ISA_mps: 1.434, Gamma0_35C_m2ps: 456.3, w0_35C_mps: 1.534 }, A330_300_MTOW_V2: { mass_kg: 242000, V_kt: 156.5, Gamma0_ISA_m2ps: 508.2, w0_ISA_mps: 1.708 } }, 'kg, m, kt, m2/s, m/s', 'aircraft', ['R1:W19', 'H1'], 'กลาง', true, 'Γ0 = m g/(ρ V b0); ρ 35 °C SL 1.1455 (h_speeds_perf.mjs)'),
      category: L({ ICAO: 'H', RECAT_EU: 'CAT-B Upper Heavy', FAA_CWT: 'B', FAA_SRS: 'III', ARC: '4E', ADG: 'V', APC: 'C' }, '-', 'aircraft', ['H21', 'H4', 'H32', 'H33'], 'สูง', false, 'ICAO Heavy เพราะ MTOM ≥ 136,000 kg (Doc 4444); FAA JO 7360.1J: "A333 Fixed-wing 2J/H Heavy B III 8"'),
    },
  },
} };
// ตรวจ leaf
let n = 0, bad = [];
const walk = (o, p) => { if (o && typeof o === 'object' && !Array.isArray(o)) { if ('v' in o && 'u' in o && 'conf' in o) { n++; const k = Object.keys(o).join(','); if (k !== 'v,u,scope,src,conf,est,note') bad.push(p); if (!p.endsWith('_na') && (!o.src || o.src.length === 0)) bad.push(p + ' (src ว่าง)'); return; } for (const k in o) walk(o[k], p ? p + '.' + k : k); } };
walk(out, '');
// พิมพ์แบบ leaf ละบรรทัด
const lines = ['{', ' "a330_300": {'];
const emit = (o, ind) => { const ks = Object.keys(o); ks.forEach((k, i) => { const v = o[k], comma = i < ks.length - 1 ? ',' : ''; if (v && typeof v === 'object' && 'v' in v && 'conf' in v) lines.push(`${' '.repeat(ind)}"${k}": ${JSON.stringify(v)}${comma}`); else { lines.push(`${' '.repeat(ind)}"${k}": {`); emit(v, ind + 1); lines.push(`${' '.repeat(ind)}}${comma}`); } }); };
emit(out.a330_300, 2); lines.push(' }', '}');
const txt = lines.join('\n'); JSON.parse(txt);
console.log(txt);
console.error('leaves', n, 'bad', bad, 'Cm0', f(Cm0), 'Cmflap', f(Cmflap), 'aClean', f(aClean, 2));
