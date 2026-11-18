// y_json.mjs — builds the JSON parameter blocks of 07-flight-controls.md (topic 3.7) and validates them.
// Run: node y_json.mjs > blocks.md   (prints ```json blocks, one top-level key each)
const LB = 4.448222, IN = 0.0254, PSI = 6894.757, KT = 0.514444, DAN = 10;
const L = (v, u, scope, src, conf, est, note) => ({ v, u, scope, src, conf, est, note });
const A = 'aircraft', S = 'sim', E = 'environment';
const r = (x, n = 3) => Math.round(x * 10 ** n) / 10 ** n;

const b737 = { controls: {
  architecture: L({ pitch: 'feel', roll: 'feel', yaw: 'feel', trim: 'ths' }, '-', A, ['Y7', 'Y14'], 'สูง', false, 'PCU ไฮดรอลิก irreversible ทุกแกน + feel unit; stabilizer ปรับด้วยมอเตอร์ไฟฟ้า/สายเคเบิล (trim wheel); manual reversion ผ่าน tab ของ elevator และ aileron'),
  hydraulics: L({ nominal_Pa: r(3000 * PSI, 0), A: ['aileron', 'elevator', 'rudder_main_PCU', 'landing_gear', 'nosewheel_steering'], B: ['aileron', 'elevator', 'rudder_main_PCU', 'trailing_edge_flaps'], standby: ['rudder_standby_PCU'] }, 'Pa; รายการพื้นบังคับ', A, ['Y7', 'Y14'], 'สูง', false, 'ราว 2,950 to 3,000 psi (NTSB AAR-99/01 §1.6.2 ของ 737-300; NSIA 2015/01 ของ 737-800: PCU 3,000 psi). รายการเป็นส่วนที่ NTSB ระบุ; การแบ่ง flight spoiler A/B, ground spoiler (A) และ LE devices (B, standby สำรอง) ไม่ได้ยืนยันในรอบนี้'),
  surfaces: {
    elevator: L({ travel_deg: { up: 22.2, down: 19.3 }, rate_dps: 50, actuator_tau_s: 0.05, hydraulic_systems: ['A', 'B'] }, 'deg, deg/s, s', A, ['Y14', 'Y15', 'Y6'], 'ต่ำ', true, 'อัตรา 50°/s จาก NSIA (สูง); มุมจากโมเดล FlightGear 737-800YV (−0.336/+0.3875 rad, ทิศ up/down ตีความเอง); tau เลือกเอง; ขับด้วย PCU สองตัว'),
    stabilizer: L({ travel_deg: { LE_up: 4.2, LE_down: 12.9 }, units: { min: -0.2, max: 16.9, neutral: 4 }, rate_dps: { main_elec_flaps_up: 0.2, main_elec_flaps_down: 0.4, ap_flaps_up: 0.09, ap_flaps_down: 0.27, speed_trim_flaps_down: 0.27 }, actuator_tau_s: 0, hydraulic_systems: [] }, 'deg, units, deg/s', A, ['Y2', 'Y3', 'Y1', 'Y6', 'Y16'], 'กลาง', false, '1 unit = 1° (ช่วงรวม 17.1° = 17.1 units, 0° = 4 units ตาม KNKT); flaps-up main electric 0.2°/s (JATR, สูง); flaps-down 0.4 และ AP 0.09/0.27 จากคำตอบของ P. Lemme (กลาง); STS flaps-down 0.27 (FAA, สูง); jackscrew ขับด้วยมอเตอร์ไฟฟ้าและสายเคเบิลจาก trim wheel'),
    aileron: L({ travel_deg: { up: 20.5, down: 15.5 }, rate_dps: 50, actuator_tau_s: 0.05, hydraulic_systems: ['A', 'B'] }, 'deg, deg/s, s', A, ['Y15', 'Y7'], 'ต่ำ', true, 'มุมจากตาราง aileron ของโมเดล 737-800YV (−0.358/+0.271 rad ที่ wheel เต็ม); อัตราและ tau เลือกเท่า elevator เพราะไม่พบ'),
    roll_spoiler: L({ travel_deg: { up: 33 }, inboard_up_deg: 38, rate_dps: 55, actuator_tau_s: 0.05, panels_per_wing: 4, hydraulic_systems: ['A', 'B'] }, 'deg, deg/s, s', A, ['Y15', 'Y16'], 'ต่ำ', true, 'flight spoiler 4 แผ่นต่อปีก; 33° ที่ wheel เต็มและ speedbrake เต็ม, แผ่นในสุด clip 38° ในโมเดล; อัตรา = 33° ใน 0.6 s ของโมเดล'),
    ground_spoiler: L({ panels_per_wing: 2, rate_dps: 55, hydraulic_systems: ['A'] }, '-, deg/s', A, ['Y15'], 'ต่ำ', true, 'มุมเต็มไม่พบในแหล่งสาธารณะ; โมเดลขยับจาก 0 ถึง 1 ใน 0.6 s; จำนวนแผ่นและระบบ A ยังไม่ยืนยัน'),
    rudder: L({ travel_deg: { left: 26, right: 26 }, pedal_stop_deg: 28, rate_dps: { dual_slide: 66, primary_only: 33 }, actuator_tau_s: 0.05, pcu_force_N: r(5900 * LB, 0), hydraulic_systems: ['A', 'B', 'standby'] }, 'deg, deg/s, s, N', A, ['Y7', 'Y9', 'Y8'], 'สูง', false, '737-300 (NTSB AAR-99/01 p.26; Boeing p.29) ใช้กับ -800 (กลาง); PCU 5,900 lbf; tau เลือกเอง (est)'),
  },
  trim: {
    stabilizer_units_to_deg: L({ offset_units: 4, deg_per_unit: 1, sign: 'delta_s_deg = 4 - units; บวก = LE up = ก้มหัว' }, 'deg/unit', A, ['Y2', 'Y4'], 'สูง', false, 'KNKT §1.6.5.3: 0° = 4 units; ช่วง 4.2° LE up ถึง 12.9° LE down; ET302: 0 nose down ถึง 17 nose up'),
    electric_limits_units: L({ flaps_up: [3.9, 14.5], flaps_down: [-0.2, 16.9] }, 'units', A, ['Y6', 'Y2'], 'ต่ำ', true, 'flaps up จากข้อความ Lemme ("about 3.9 degrees to 14.5 degrees" ตีความเป็น units); flaps down ใช้ช่วงกลไกเพราะไม่พบ'),
    speed_trim: L({ rate_dps_flaps_down: 0.27, envelope: '100 kt ถึง M0.60, ไม่เร็วกว่า 10 s หลัง liftoff, 5 s หลังปล่อยสวิตช์ trim, AP off' }, 'deg/s', A, ['Y1', 'Y16'], 'กลาง', false, 'อัตรา 0.27 จาก FAA (สูง); เงื่อนไขจากบันทึกทุติยภูมิ (ต่ำ)'),
    mach_trim: L({ active_above_M: 0.615, acts_on: 'elevator neutral shift (ไม่ใช่ stabilizer)' }, 'Mach', A, ['Y14', 'Y16', 'Y5'], 'สูง', false, 'NSIA §1.16.7.4'),
    manual_rate_dps: L(0.1, 'deg/s', A, ['Y4', 'Y3'], 'ต่ำ', true, 'จำนวนรอบ trim wheel ต่อ unit ไม่พบในแหล่งสาธารณะ; เลือกครึ่งหนึ่งของ main electric flaps-up เพื่อให้ช้ากว่าไฟฟ้า; แรงที่ wheel สูงมากเมื่อ stab mistrim ที่ความเร็วสูง (ET302, JATR)'),
    rudder: L({ range_deg: 16, rate_dps: 0.5 }, 'deg, deg/s', A, ['Y7'], 'กลาง', false, '737-300 (AAR-99/01 pp.27-28); ใช้กับ -800'),
  },
  feel: {
    elevator_feel_computer: L({ p_base_Pa: r(180 * PSI, 0), p_max_Pa: r(1400 * PSI, 0), efsm_supply_Pa: r(850 * PSI, 0), EFS_force_factor: 2, EFSM_force_factor: 4, EFSM_alpha_deg: [8, 11], inputs: ['q_elevator_pitot', 'stabilizer_position'] }, 'Pa, -, deg', A, ['Y5', 'Y6'], 'กลาง', false, '180 psi base, 1,400 psi max, EFSM 850 psi, EFS ×2, EFSM ×4 ที่ AoA 8 to 11° (อ้าง AMM 22/27 ผ่าน Satcom Guru); EFSM เป็นของ MAX'),
    pitch_gradient: L({ Fbo_N: r(4 * LB, 1), Kmax_N_per_deg_elevator: 60.62, kq_Pa_per_Pa: 0.06511, q_sat_Pa: 18750 }, 'N, N/deg, -', A, ['Y4', 'Y5'], 'ต่ำ', true, 'F = Fbo + Kmax·(p/1400)·|δe|, p = clamp(180 + kq·q̄, 180, 1400) psi; kq ใน psi/Pa; คาลิเบรตให้ 110 lb ที่ 340 KCAS เมื่อ δe 7.8° (ET302) ด้วย y_controls.mjs'),
    pedal: L({ breakout_N: r(9 * LB, 1), full_N: r(70 * LB, 0), travel_m: r(4 * IN, 4), m_per_deg_rudder: r(IN / 6.5, 5), gradient_N_per_m: 2671, beyond_stop_N_per_m: r(300 * LB / IN, 0) }, 'N, m', A, ['Y7', 'Y9'], 'สูง', false, '737-300: 9 to 70 lb, 4 in, 1 in ต่อ 6.5°; หลัง blowdown/jam ราว 300 lb ต่อ in; รูปเชิงเส้นเป็น est'),
    wheel: L({ breakout_N: 13, full_N: 110 }, 'N', A, ['Y30', 'Y7'], 'ต่ำ', true, 'ไม่พบในแหล่งสาธารณะ; เลือกให้อยู่ในขอบ 25.143 (50 lb สองมือ) และน้อยกว่าแรง manual reversion 40 lb'),
    manual_reversion_forces: L({ roll_initiate_N: r(40 * LB, 0), pitch_initiate_N: r(60 * LB, 0), rudder: 'ไม่มี manual reversion ใช้ standby PCU' }, 'N', A, ['Y7'], 'สูง', false, 'NTSB AAR-99/01 fn39/40 (737-300): 40 lb ที่ wheel เริ่ม roll, 60 lb ที่ column เริ่ม pitch'),
    ap_override: L({ cws_N: r(10 * LB, 1), single_ch_N: r(25 * LB, 0), dual_ch_N: r(50 * LB, 0) }, 'N', A, ['Y7', 'Y14'], 'สูง', false, 'CWS 10 lb (AAR-99/01 §1.6.3.1), override >25 lb ช่องเดียว, >50 lb สองช่อง (NSIA fn3)'),
  },
  yaw_damper: L({ authority_deg: 3, rate_dps: 50, kind: 'series (ไม่ขยับ pedal)' }, 'deg, deg/s', A, ['Y7', 'Y9', 'Y13'], 'กลาง', false, '737-300 (AAR-99/01 p.28); บันทึกทุติยภูมิของ NG ให้ราว ±2.5°'),
  spoiler_mixing: {
    roll: L({ axes: { wheel_norm: [0, 0.149, 0.23, 0.483, 0.69, 0.839, 0.954, 1] }, data: [0, 0, 3.09, 10.07, 17.96, 25.82, 32.54, 33.02] }, 'deg (spoiler ฝั่งขึ้น)', A, ['Y15', 'Y16'], 'ต่ำ', true, 'ตาราง low ของ 737-800YV; spoiler เริ่มเมื่อ wheel ราว 10 to 13° (0.126 to 0.149 ของ wheel เต็ม); ฝั่งตรงข้ามอยู่ที่ 0'),
    speedbrake: L({ axes: { lever: [0, 0.65, 1] }, data: [0, 25, 33], detents: ['DOWN', 'ARMED', 'FLIGHT DETENT', 'UP'], ground_auto: 'RA < 10 ft และ main wheel spin-up > 60 kt' }, 'deg', A, ['Y15', 'Y16'], 'ต่ำ', true, 'lever 0.65 = flight detent (ตีความ) ให้ 25°; ห้ามใช้ในอากาศต่ำกว่า 1,000 ft RA (บันทึกทุติยภูมิ)'),
  },
  rudder_limiter: L({ kind: 'pressure_reducer', classic: { full_Pa: r(3000 * PSI, 0), reduced_Pa: r(1000 * PSI, 0), active: 'สูงกว่า 1,000 ft AGL ขาขึ้น / 700 ft AGL ขาลง' }, ng: 'ตามความเร็ว (ค่าไม่พบ)', blowdown_qb_Pa: 4726, stop_deg: 26 }, 'Pa, deg', A, ['Y7', 'Y12', 'Y13', 'Y9'], 'ต่ำ', true, 'δmax = 26·min(1, (p/p_full)·qb/q̄); qb คาลิเบรตให้ 21° ที่ 190 KCAS β 0 (Boeing: 14 to 21°); แหล่งขัดกัน 1,000 psi (NTSB) กับ 1,800 psi (บล็อก)'),
  pitch: {
    architecture: L({ kind: 'feel', input: 'force' }, '-', A, ['Y7'], 'สูง', false, 'irreversible + feel computer'),
    stops: L({ teu: 22.2, ted: 19.3 }, 'deg', A, ['Y15'], 'ต่ำ', true, 'เหมือน surfaces.elevator'),
    rate_limit: L(50, 'deg/s', A, ['Y14'], 'สูง', false, 'NSIA 2015/01'),
    trim_rate_flaps_up: L(0.2, 'deg/s', A, ['Y3'], 'สูง', false, 'stabilizer main electric (ไม่ใช่ tab)'),
    trim_rate_flaps_down: L(0.4, 'deg/s', A, ['Y6'], 'กลาง', false, 'stabilizer main electric'),
    breakout: L(r(4 * LB, 1), 'N', A, ['Y34'], 'ต่ำ', true, 'ไม่พบ; เลือก 4 lb'),
  },
  roll: {
    architecture: L({ kind: 'feel', input: 'force' }, '-', A, ['Y7'], 'สูง', false, 'aileron PCU + flight spoiler'),
    stops: L({ max: 20.5 }, 'deg', A, ['Y15'], 'ต่ำ', true, 'aileron up สูงสุดในโมเดล'),
    rate_limit: L(50, 'deg/s', A, ['Y14'], 'ต่ำ', true, 'ไม่พบ; ใช้เท่า elevator'),
    breakout: L(13, 'N', A, ['Y34'], 'ต่ำ', true, 'ไม่พบ; เลือก 3 lbf'),
  },
  yaw: {
    architecture: L({ kind: 'feel', input: 'force' }, '-', A, ['Y7'], 'สูง', false, 'main PCU + standby PCU, ไม่มี manual reversion'),
    stops: L({ max: 26 }, 'deg', A, ['Y7'], 'สูง', false, '737-300'),
    rate_limit: L(66, 'deg/s', A, ['Y7', 'Y9'], 'สูง', false, '33 เมื่อ primary slide อย่างเดียว'),
    trim_rate: L(0.5, 'deg/s', A, ['Y7'], 'กลาง', false, 'ช่วง ±16°'),
    breakout: L(r(9 * LB, 1), 'N', A, ['Y7'], 'กลาง', true, 'ใช้ปลายล่างของ feel unit 9 lb เป็น breakout (ตีความ)'),
  },
} };

const atr = { controls: {
  architecture: L({ pitch: 'reversible', roll: 'reversible', yaw: 'reversible', trim: 'tab' }, '-', A, ['Y18', 'Y17'], 'สูง', false, 'ทุกพื้นบังคับเป็นกลไก (cable, pulley, push-pull rod) ยกเว้น roll spoiler ที่ใช้ไฮดรอลิก'),
  pitch: {
    architecture: L({ kind: 'reversible', input: 'force' }, '-', A, ['Y18'], 'สูง', false, 'elevator ซ้ายขวาต่อกันผ่าน pitch uncoupling mechanism'),
    S_e: L(3.5, 'm2', A, ['R1:C17'], 'ต่ำ', true, '0.30 × S_h 11.73 m² (หัวข้อ 3.1)'),
    c_e: L(0.48, 'm', A, ['Y34'], 'ต่ำ', true, '0.30 × คอร์ดเฉลี่ยหางระดับราว 1.6 m'),
    gearing: L(3.717, 'rad/m', A, ['Y19'], 'ต่ำ', true, 'อัตราทด elevator/column 23/11.25 = 2.04 rad/rad หารแขนด้ามจับ 0.55 m (สมมติ)'),
    Ch_delta: L(-0.0519, '1/rad', A, ['Y19', 'Y18'], 'ต่ำ', true, 'ค่ายังผล (รวม spring/geared tab) คาลิเบรตให้ full nose-up 23° ที่ 154 kt ใช้ 50 daN (y_controls.mjs)'),
    Ch_alpha: L(-0.0173, '1/rad', A, ['Y34'], 'ต่ำ', true, 'สัดส่วน 1/3 ของ Ch_delta ตามแนวรอบที่ 1'),
    stops: L({ teu: 23, ted: 13 }, 'deg', A, ['Y19'], 'สูง', false, 'ATSB second interim p.2'),
    rate_limit: L(60, 'deg/s', A, ['Y18'], 'ต่ำ', true, 'ไม่มี actuator; จำกัดเพื่อเสถียรภาพเชิงตัวเลขของอินพุต'),
    breakout: L(20, 'N', A, ['Y34'], 'ต่ำ', true, 'ไม่พบ'),
    trim_rate_flaps_up: L(0.5, 'deg/s', A, ['Y17'], 'ต่ำ', true, 'ไม่พบ (อัตรา tab); เลือกให้ทั้งช่วงใช้ราว 20 to 30 s'),
    trim_rate_flaps_down: L(0.5, 'deg/s', A, ['Y17'], 'ต่ำ', true, 'ไม่พบ'),
  },
  roll: {
    architecture: L({ kind: 'reversible', input: 'force' }, '-', A, ['Y17'], 'สูง', false, 'ไม่มีไฮดรอลิกที่ aileron; geared balance tab'),
    S_a_each: L(1.5, 'm2', A, ['Y34'], 'ต่ำ', true, 'ประมาณจากแปลนปีก'),
    c_a: L(0.45, 'm', A, ['Y34'], 'ต่ำ', true, 'ราว 0.25 ของคอร์ดปลายปีก'),
    gearing: L(1.197, 'rad/m', A, ['Y17'], 'ต่ำ', true, 'aileron/wheel 14/65 = 0.2154 rad/rad หารรัศมี wheel 0.18 m (สมมติ)'),
    Ch_delta: L(-0.0667, '1/rad', A, ['Y17'], 'ต่ำ', true, 'ค่ายังผลรวม balance tab; ให้ full aileron ที่ VMO 250 KCAS = 60 lb ที่ wheel (เกณฑ์ออกแบบ < 60 lb)'),
    tab_max: L(4, 'deg', A, ['Y17'], 'สูง', false, 'balance tab ±4° ที่ aileron ±14°'),
    stops: L({ max: 14 }, 'deg', A, ['Y17'], 'สูง', false, 'aileron ±14°, wheel ±65°'),
    breakout: L(13, 'N', A, ['Y34'], 'ต่ำ', true, 'ไม่พบ; เลือก 3 lbf'),
    rate_limit: L(80, 'deg/s', A, ['Y17'], 'ต่ำ', true, 'ไม่มี actuator'),
  },
  yaw: {
    architecture: L({ kind: 'reversible', input: 'force' }, '-', A, ['Y18'], 'สูง', false, 'rudder กลไก + TLU'),
    stops: L({ max: 27 }, 'deg', A, ['Y17'], 'สูง', false, 'low-speed mode (ATR 72-212); ใช้กับ -600 (กลาง)'),
    S_r: L(3.7, 'm2', A, ['Y34'], 'ต่ำ', true, '0.30 × S_v 12.48 m²'),
    c_r: L(0.6, 'm', A, ['Y34'], 'ต่ำ', true, 'ประมาณ'),
    rate_limit: L(60, 'deg/s', A, ['Y17'], 'ต่ำ', true, 'ไม่มี actuator'),
    breakout: L(40, 'N', A, ['Y34'], 'ต่ำ', true, 'ไม่พบ'),
  },
  mech: {
    pitch_uncoupling: L({ each_column_N: [500, 550], total_differential_N: [1000, 1100] }, 'N', A, ['Y18'], 'สูง', false, '50 to 55 daN ต่อคันในทิศตรงข้ามพร้อมกัน; ผลต่างรวม 100 to 110 daN'),
    column_travel_deg: L({ up: 11.25, down: 6.75, stop_up: 13.25, stop_down: 8.75 }, 'deg', A, ['Y19'], 'สูง', false, 'ATSB second interim p.2'),
    wheel_travel_deg: L(65, 'deg', A, ['Y17'], 'สูง', false, '±65°'),
    cable_tension_N: L([200, 250], 'N', A, ['Y17'], 'สูง', false, 'tension regulator 20 to 25 daN'),
    stick_pusher_column_deg: L(8, 'deg', A, ['Y17'], 'สูง', false, 'pusher ดัน column ไป 8° nose-down'),
  },
  surfaces: {
    roll_spoiler: L({ travel_deg: { up: 57 }, rate_dps: 60, actuator_tau_s: 0.08, panels_per_wing: 1, hydraulic_systems: ['hydraulic (สีไม่ยืนยัน)'] }, 'deg, deg/s, s', A, ['Y17', 'Y18'], 'กลาง', true, 'มุมจาก NTSB (สูง); อัตราและ tau เลือกเอง'),
  },
  spoiler_mixing: {
    roll: L({ threshold_aileron_deg: 2.5, gain_deg_per_deg: 4.957, max_deg: 57 }, 'deg', A, ['Y17'], 'สูง', false, 'δsp = 57·(δa − 2.5)/11.5 สำหรับ aileron ขาขึ้น > 2.5°'),
  },
  rudder_limiter: L({ kind: 'TLU', low_speed_deg: 27, high_speed_deg: 3, to_high_above_kt: 185, to_low_below_kt: 180, stroke_auto_s: 15, stroke_manual_s: 30 }, 'deg, kt, s', A, ['Y17', 'Y21', 'Y22'], 'สูง', false, 'NTSB: ราว 3° ต่อข้างเหนือ 185 KIAS; AAIB: กลับ low speed เมื่อ ADC < 180 kt, stroke 15 s (auto) / 30 s (manual)'),
  feel: {
    wheel_force_design_max_N: L(r(60 * LB, 0), 'N', A, ['Y17'], 'สูง', false, 'ออกแบบให้ < 60 lb'),
  },
  trim: {
    kinds: L({ pitch: 'electric elevator trim tab (normal + standby)', roll: 'electric on left aileron balance tab', yaw: 'rudder trim tab' }, '-', A, ['Y17'], 'กลาง', false, 'อัตราและช่วงไม่พบในแหล่งสาธารณะ'),
  },
  reference_types: {
    atr72_ap_aileron_rate_monitor: L(3.6, 'deg/s', A, ['Y17'], 'สูง', false, 'AP disconnect เมื่ออัตรา aileron เกิน'),
  },
} };

const a320 = { controls: {
  architecture: L({ pitch: 'fbw', roll: 'fbw', yaw: 'feel', trim: 'ths' }, '-', A, ['Y24', 'Y27', 'Y25'], 'สูง', false, 'yaw ของ A320ceo เชื่อม pedal กับ rudder ทางกล + FAC (yaw damper, trim, RTL); THS มี trim wheel กลไกสำรอง'),
  hydraulics: L({ nominal_Pa: r(3000 * PSI, 0), aileron: ['B', 'G'], elevator_L: ['B', 'G'], elevator_R: ['B', 'Y'], rudder: ['G', 'B', 'Y'], ths_motors: ['G', 'Y'], spoilers: { '1': 'G', '2': 'Y', '3': 'B', '4': 'Y', '5': 'G' } }, 'Pa; ระบบต่อพื้นบังคับ', A, ['Y28'], 'กลาง', false, 'จากโมเดล FlyByWire A32NX (GPL-3.0) ที่อิง FCOM; spoiler 3 = B โดยนัย'),
  surfaces: {
    elevator: L({ travel_deg: { up: 30, down: 17 }, rate_dps: 40, actuator_tau_s: 0.06, hydraulic_systems: ['B', 'G', 'Y'] }, 'deg, deg/s, s', A, ['Y24'], 'กลาง', true, 'มุมจาก KNKT (สูง); อัตรา/tau ไม่พบ เลือกเอง'),
    ths: L({ travel_deg: { nose_up: 13.5, nose_down: 4 }, rate_dps: 0.17, hydraulic_systems: ['G', 'Y'] }, 'deg, deg/s', A, ['Y24', 'Y26'], 'กลาง', true, 'มุมจาก KNKT (สูง); อัตราเป็นค่าเฉลี่ยที่ AF447 (A330) บันทึกจาก 3° ถึง 13° ใน 1 นาที ใช้แทนเพราะไม่พบของ A320 (ต่ำ)'),
    aileron: L({ travel_deg: { up: 25, down: 25 }, rate_dps: 40, actuator_tau_s: 0.06, hydraulic_systems: ['B', 'G'] }, 'deg, deg/s, s', A, ['Y28'], 'ต่ำ', true, '±25 จากค่าคงที่ใน ElacComputer_data.cpp; อัตรา/tau เลือกเอง'),
    roll_spoiler: L({ panels: [2, 3, 4, 5], rate_dps: 35, actuator_tau_s: 0.06 }, '-, deg/s, s', A, ['Y28'], 'ต่ำ', true, 'มุมสูงสุดของโหมด roll ไม่พบ; 35 ในโมเดลน่าจะเป็น rate limit (ตีความ)'),
    ground_spoiler: L({ panels: [1, 2, 3, 4, 5], travel_deg: { up: 50 }, speedbrake_panels: [2, 3, 4], speedbrake_max_deg: 40 }, 'deg', A, ['Y28'], 'กลาง', true, 'โมเดล SEC: ground −50°, speedbrake lever เต็ม −40°'),
    rudder: L({ travel_deg: { left: 25, right: 25 }, rate_dps: 40, actuator_tau_s: 0.06, hydraulic_systems: ['G', 'B', 'Y'] }, 'deg, deg/s, s', A, ['Y28', 'Y27'], 'กลาง', true, 'มุม 25° ที่ ≤ 160 kt จากตาราง RTL; อัตรา/tau เลือกเอง'),
  },
  rudder_limiter: L({ axes: { kcas: [100, 160, 200, 240, 320, 380, 400] }, data: [25, 25, 14.5, 8.8, 4.8, 3.4, 3.4] }, 'deg', A, ['Y28', 'Y24', 'Y27'], 'กลาง', false, 'ตาราง FAC ของ FlyByWire; สอดคล้องกับ ECAM "RUD WITH CARE ABV 160 KT" ใน KNKT'),
  spoiler_mixing: {
    speedbrake: L({ axes: { lever: [0, 0.05, 0.051, 0.5, 1.0] }, data: [0, 0, 2, 25, 40] }, 'deg', A, ['Y28'], 'กลาง', false, 'SecComputer_data.cpp (ค่าลบในโค้ด = ขึ้น)'),
  },
  yaw_damper: L({ alternate_law_authority_deg: 5 }, 'deg', A, ['Y24'], 'สูง', false, 'KNKT §1.6.5.2: alternate law yaw damper ±5°'),
  trim: {
    rudder: L({ range_deg: 20, rate_dps: 1 }, 'deg, deg/s', A, ['Y28'], 'ต่ำ', true, '±20 จากค่าคงที่ใน FacComputer_data.cpp (ตีความ); อัตราไม่พบ เลือก 1°/s'),
  },
  inceptors: {
    sidestick: L({ breakout_N: { pitch: 50, roll: 35 }, travel_deg: { pitch: 16, roll: 20 }, dual_input_threshold_deg: 2 }, 'N, deg', A, ['Y24'], 'กลาง', true, 'breakout 5/3.5 daN และ dual input 2° จาก KNKT (สูง); travel อนุมานจากค่าที่บันทึกสูงสุด −16° pitch, −20° roll (กลาง); กฎการบินอยู่ที่ controls.fbw (หัวข้อ 8)'),
  },
} };

const a330 = { controls: {
  architecture: L({ pitch: 'fbw', roll: 'fbw', yaw: 'feel', trim: 'ths' }, '-', A, ['Y25'], 'กลาง', false, 'รุ่นพื้นฐานใช้ rudder กลไก รุ่น enhanced ใช้ rudder FBW (ATSB fn25); 3 PRIM + 2 SEC'),
  surfaces: {
    elevator: L({ travel_deg: { up: 30, down: 15 } }, 'deg', A, ['Y25'], 'สูง', false, 'ATSB AO-2008-070 §1.6.3'),
    ths: L({ travel_deg: { nose_up: 14, nose_down: 2 }, rate_dps: 0.17 }, 'deg, deg/s', A, ['Y25', 'Y26'], 'กลาง', true, 'มุมจาก ATSB (สูง); อัตราเฉลี่ย AF447 จาก 3° ถึง 13° ใน 1 นาที (est)'),
  },
} };

const common = { controls: {
  requirements: {
    part25_force_limits_N: L({ short_two_hands: { pitch: r(75 * LB, 0), roll: r(50 * LB, 0) }, short_one_hand: { pitch: r(50 * LB, 0), roll: r(25 * LB, 0) }, short_yaw: r(150 * LB, 0), long_term: { pitch: r(10 * LB, 1), roll: r(5 * LB, 1), yaw: r(20 * LB, 1) } }, 'N', S, ['Y30'], 'สูง', false, '14 CFR 25.143(d): 75/50, 50/25, 150, 10/5/20 lbf'),
    part25_out_of_trim: L({ mistrim_s_at_normal_rate: 3, g_range: [-1, 2.5], recovery_g: 1.5, max_force_N: r(125 * LB, 0) }, 's, g, N', S, ['Y31'], 'สูง', false, '14 CFR 25.255'),
    fstd_dynamic_tolerance: L({ force_N: r(2 * LB, 1), force_pct: 10, T_P0_pct: 10 }, 'N, %', S, ['Y32'], 'สูง', false, '14 CFR Part 60 App. A: dynamic ±2 lb หรือ ±10%; T(P0) ±10%'),
  },
  actuator_model: L({ form: 'first-order lag + rate limit + position limit', update: 'exact นอก RK4 ทุกก้าว 240 Hz' }, '-', S, ['R1:C14', 'R1:C17'], 'กลาง', true, 'ดูสมการใน 3.7.6'),
  force_cue_marks_N: L({ pitch: [44.5, 222.4, 333.6], roll: [22.2, 111.2, 222.4], yaw: [89.0, 667.2] }, 'N', S, ['Y30'], 'สูง', false, 'ขีดบนแถบแรง = long-term, one hand, two hands ของ 25.143(d)'),
} };

const blocks = [['b737_800', b737], ['atr72_600', atr], ['a320ceo', a320], ['a330_300', a330], ['common_airliner', common]];
let n = 0;
for (const [id, body] of blocks) {
  const isLeaf = o => o && typeof o === 'object' && !Array.isArray(o) && 'v' in o && 'scope' in o;
  const fmt = (o, ind) => isLeaf(o) ? JSON.stringify(o) : '{\n' + Object.entries(o).map(([k, v]) => ' '.repeat(ind + 1) + JSON.stringify(k) + ': ' + fmt(v, ind + 1)).join(',\n') + '\n' + ' '.repeat(ind) + '}';
  const txt = fmt({ [id]: body }, 0);
  JSON.parse(txt);
  const count = (o) => (o && typeof o === 'object' && 'v' in o && 'scope' in o) ? 1 : (o && typeof o === 'object' ? Object.values(o).reduce((a, x) => a + count(x), 0) : 0);
  n += count(body);
  console.log('```json\n' + txt + '\n```\n');
}
console.error('leaves', n);
