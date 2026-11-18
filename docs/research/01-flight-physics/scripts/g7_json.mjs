// Section 7: builds the "gear" parameter JSON (validated by JSON.parse). Run: node g7_json.mjs > g7_params.json
const P = (v, u, scope, src, conf, est, note) => ({ v, u, scope, src, conf, est, note });
const j = { gear: {
  geometry: {
    nose_contact_body_extended: P([2.30, 0, 1.454], 'm FRD', 'aircraft', [], 'ต่ำ', true, 'ล้อหน้าเมื่อยืดสุด; z +0.094 m จาก AC.gear เพื่อให้ CG จอดสูง 1.30 m เท่าเดิม'),
    main_contact_body_extended: P([[-0.35, -1.55, 1.506], [-0.35, 1.55, 1.506]], 'm FRD', 'aircraft', [], 'ต่ำ', true, 'z +0.126 m จาก AC.gear'),
    cg_height_parked: P(1.30, 'm', 'aircraft', [], 'ต่ำ', true, 'ใช้ตรวจ turnover'),
  },
  strut_main: {
    stroke: P(0.25, 'm', 'gear', ['G3', 'G4'], 'ต่ำ', true, 'drop 10 fps, L = 2/3: ใช้ 88%, n_g 2.32'),
    p_static: P(300, 'psi', 'gear', [], 'ต่ำ', true, '2.07 MPa; A = W_st/p_static'),
    piston_area: P(0.00463, 'm2', 'gear', [], 'ต่ำ', true, 'bore 77 mm'),
    ratio_static_to_extended: P(2.5, '-', 'gear', [], 'ต่ำ', true, 'พรีโหลด 0.4 W_st'),
    ratio_compressed_to_extended: P(8, '-', 'gear', [], 'ต่ำ', true, 'V_ext/V_comp; จุดจอด ~69% ของ stroke'),
    polytropic_n_dynamic: P(1.12, '-', 'gear', ['G8'], 'กลาง', false, 'NACA 1154'),
    polytropic_n_static: P(1.0, '-', 'gear', ['G8'], 'กลาง', true, 'ยุบช้า'),
    Kh_compression: P(4000, 'N/(m/s)^2', 'gear', ['G8'], 'ต่ำ', true, 'ρA_h^3/(2(C_d A_n)^2) ปรับให้ n_g ต่ำสุดที่ ≤ 88% stroke'),
    Kr_rebound: P(48000, 'N/(m/s)^2', 'gear', [], 'ต่ำ', true, '12 เท่าของ K_h'),
    c_linear: P(2000, 'N s/m', 'gear', [], 'ต่ำ', true, 'ทำให้ ṡ เรียบรอบจุดสมดุล'),
    seal_friction_ratio: P(0, '-', 'gear', ['G8'], 'ต่ำ', true, 'NACA 1154 ตั้งเป็นศูนย์; เปิดได้ 0.02-0.05'),
  },
  strut_nose: {
    stroke: P(0.20, 'm', 'gear', [], 'ต่ำ', true, 'drop 10 fps: n_g 2.98 ที่ 89%'),
    p_static: P(300, 'psi', 'gear', [], 'ต่ำ', true, 'bore 42 mm'),
    piston_area: P(0.00141, 'm2', 'gear', [], 'ต่ำ', true, ''),
    ratio_static_to_extended: P(2.5, '-', 'gear', [], 'ต่ำ', true, ''),
    ratio_compressed_to_extended: P(8, '-', 'gear', [], 'ต่ำ', true, ''),
    Kh_compression: P(1600, 'N/(m/s)^2', 'gear', [], 'ต่ำ', true, ''),
    Kr_rebound: P(19000, 'N/(m/s)^2', 'gear', [], 'ต่ำ', true, ''),
    c_linear: P(1000, 'N s/m', 'gear', [], 'ต่ำ', true, ''),
  },
  tyre_main: {
    size: P({ size: '6.50-8', type: 'III', ply: 8 }, '-', 'gear', ['G18'], 'กลาง', true, 'โหลดสถิต 2,150 lb = 68% ของพิกัด'),
    rated_load: P(14012, 'N', 'gear', ['G18'], 'สูง', false, '3,150 lb'),
    rated_pressure: P(75, 'psi', 'gear', ['G18'], 'สูง', false, ''),
    operating_pressure: P(60, 'psi', 'gear', ['G18'], 'ต่ำ', true, 'ลดตามสัดส่วนโหลดแล้วปัดขึ้น; V_P = 70 kt'),
    outside_diameter: P(0.495, 'm', 'gear', ['G18'], 'สูง', false, '19.5 in'),
    section_width: P(0.168, 'm', 'gear', ['G18'], 'สูง', false, '6.6 in'),
    k_vertical: P(320000, 'N/m', 'gear', ['G9'], 'ต่ำ', true, 'TN 4110 eq.24 ได้ ~315 kN/m (OCR ไม่ชัด)'),
    c_vertical: P(3500, 'N s/m', 'gear', [], 'ต่ำ', true, 'ζ ≈ 0.1'),
    cornering_stiffness_coef: P(3.2, '1/rad', 'gear', ['G9'], 'ต่ำ', true, 'TN 4110 eq.82: 119 lb/deg ที่ 9.5 kN; JSBSim 7.7/rad'),
    relaxation_length: P(0.30, 'm', 'gear', ['G9'], 'ต่ำ', true, 'TN 4110 eq.43 ให้ 0.24-0.35 m'),
    k_longitudinal: P(246000, 'N/m', 'gear', ['G9'], 'ต่ำ', true, 'TN 4110 eq.52: 1.2 p d'),
    mu_peak_dry: P(0.8, '-', 'gear', ['G12', 'G19'], 'กลาง', false, 'TN D-8455: 0.78; JSBSim: 0.8'),
    mu_skid_ratio_dry: P(0.75, '-', 'gear', [], 'ต่ำ', true, ''),
    mu_skid_ratio_wet: P(0.5, '-', 'gear', ['G11'], 'ต่ำ', true, 'reverted rubber (เชิงคุณภาพ)'),
    rolling_radius: P(0.235, 'm', 'gear', ['G9'], 'ต่ำ', true, 'r - δ/3'),
    wheel_inertia: P(0.33, 'kg m2', 'gear', [], 'ต่ำ', true, 'ยาง+ล้อ+จาน ~13 kg'),
  },
  tyre_nose: {
    size: P({ size: '5.00-5', type: 'III', ply: 6 }, '-', 'gear', ['G18'], 'กลาง', true, 'โหลดสถิต 655 lb'),
    rated_load: P(5716, 'N', 'gear', ['G18'], 'สูง', false, '1,285 lb'),
    rated_pressure: P(50, 'psi', 'gear', ['G18'], 'สูง', false, ''),
    operating_pressure: P(45, 'psi', 'gear', [], 'ต่ำ', true, 'V_P 60 kt'),
    outside_diameter: P(0.354, 'm', 'gear', ['G18'], 'สูง', false, '14.0 in'),
    k_vertical: P(160000, 'N/m', 'gear', ['G9'], 'ต่ำ', true, 'สเกลตามขนาด'),
    c_vertical: P(1200, 'N s/m', 'gear', [], 'ต่ำ', true, ''),
    cornering_stiffness_coef: P(3.2, '1/rad', 'gear', ['G9'], 'ต่ำ', true, ''),
    relaxation_length: P(0.22, 'm', 'gear', ['G9'], 'ต่ำ', true, ''),
  },
  brakes: {
    force_limit_ratio: P(0.6, '-', 'gear', [], 'ต่ำ', true, 'F_b,max/W_st ต่อข้าง (T_max ≈ 1,350 N m); ล็อกบนแห้งไม่ได้ ล็อกได้บนเปียก > 36 kt'),
    pressure_rise_rate: P(2.5, '1/s', 'gear', [], 'ต่ำ', true, 'เท่าโค้ดเดิม'),
    antiskid: P(0, 'bool', 'aircraft', [], 'กลาง', true, 'เครื่องฝึก 0, airliner 1'),
    antiskid_efficiency: P({ on_off: 0.30, quasi_modulating: 0.50, fully_modulating: 0.80 }, '-', 'aircraft', ['G6', 'G13'], 'สูง', false, '25.109(c)(2); ตรงกับตัวคูณ 0.375/0.625 ของ AC 25-32'),
    antiskid_efficiency_measured: P({ dry: 0.94, wet: 0.80 }, '-', 'aircraft', ['G12'], 'กลาง', false, 'ระบบ slip-ratio control ของ NASA'),
    antiskid_slip_setpoint: P(0.15, '-', 'aircraft', ['G12'], 'กลาง', false, '0.13-0.18, 10-12 Hz'),
    heat_sink_mass: P(6.0, 'kg', 'gear', [], 'ต่ำ', true, 'เหล็กต่อเบรก; หยุดเต็มแรงจาก 80 kt ร้อนขึ้น ~275 K'),
    heat_sink_cool_tau: P(900, 's', 'gear', [], 'ต่ำ', true, ''),
    fade_start_temp: P(400, 'degC', 'gear', [], 'ต่ำ', true, ''),
    fade_full_temp: P(700, 'degC', 'gear', [], 'ต่ำ', true, ''),
  },
  steering: {
    mode: P({ type: 'pedal_linked', caster_with_diff_brake: true }, '-', 'aircraft', [], 'ต่ำ', true, 'แป้น + caster เมื่อเบรกแยกข้าง'),
    pedal_max: P(12, 'deg', 'aircraft', ['G19'], 'ต่ำ', true, 'c172p 10°; R = 12.5 m'),
    caster_max: P(45, 'deg', 'aircraft', [], 'ต่ำ', true, ''),
    steer_rate: P(60, 'deg/s', 'aircraft', [], 'ต่ำ', true, 'ปัจจุบัน 50'),
    shimmy_lag: P(0.05, 's', 'aircraft', [], 'ต่ำ', true, 'แทน shimmy damper'),
  },
  surface: {
    rolling_mu: P({ paved: 0.02, gravel: 0.04, grass: 0.10 }, '-', 'environment', ['G21', 'G19'], 'ต่ำ', false, 'FlightGear materials, JSBSim c172p'),
    friction_factor: P({ paved: 1.0, gravel: 0.5, grass: 0.7 }, '-', 'environment', ['G21'], 'ต่ำ', false, ''),
    wet_mu_max_coeffs: P({ axes: { psi: [50, 100, 200, 300], term: ['a3', 'a2', 'a1', 'a0'] }, data: [[-0.0350, 0.306, -0.851, 0.883], [-0.0437, 0.320, -0.805, 0.804], [-0.0331, 0.252, -0.658, 0.692], [-0.0401, 0.263, -0.611, 0.614]] }, 'μ = a3 x^3 + a2 x^2 + a1 x + a0, x = V_gs[kt]/100', 'environment', ['G6'], 'สูง', false, '25.109(c)(1); interpolate ตามความดัน'),
    rwycc_wheel_braking_mu: P({ rwycc6_factor_of_dry: 0.9, rwycc5: '25.109(c) x efficiency', rwycc4: 0.20, rwycc3: 0.16, rwycc2_factor_of_rwycc5: 0.5, rwycc2_cap: 0.16, rwycc2_at_or_above_085VP: 0.05, rwycc1: 0.08 }, '-', 'environment', ['G13', 'G15'], 'สูง', false, 'ค่าที่ได้จริงกับ antiskid fully modulating (AC 25-32 Table 2); EASA ใช้ 0.07 กับน้ำแข็ง'),
    wet_grooved_mu_max_coeffs: P({ axes: { psi: [50, 100, 200, 300], term: ['a5', 'a4', 'a3', 'a2', 'a1', 'a0'] }, data: [[0.1470, -1.050, 2.673, -2.683, 0.403, 0.859], [0.1106, -0.813, 2.130, -2.200, 0.317, 0.807], [0.0498, -0.398, 1.140, -1.285, 0.140, 0.701], [0.0314, -0.247, 0.703, -0.779, -0.00954, 0.614]] }, 'μ = Σ a_k x^k, x = V_gs[kt]/100', 'environment', ['G6'], 'กลาง', false, '25.109(d)(2) grooved/PFC (หรือ 70% ของ μ แห้ง); เลขชี้กำลังอ่านจาก LII'),
    wet_depth_threshold: P(3, 'mm', 'environment', ['G14', 'G15', 'G16'], 'สูง', false, '≤ 3 mm = RWYCC 5; > 3 mm = RWYCC 2'),
    hydroplaning_k_rolling: P(9, 'kt/sqrt(psi)', 'environment', ['G10', 'G13'], 'สูง', false, 'ยางหมุน'),
    hydroplaning_k_nonrotating: P(7.7, 'kt/sqrt(psi)', 'environment', ['G11'], 'กลาง', false, 'ยางไม่หมุน'),
    hydroplaning_onset_factor: P(0.85, '-', 'environment', ['G13', 'G15'], 'สูง', false, ''),
    mu_hydroplaning: P(0.05, '-', 'environment', ['G10', 'G13'], 'สูง', false, 'ใช้กับแรงด้านข้างด้วย'),
  },
  certification: {
    part23_limit_descent: P({ formula: 'V = 4.4 (W/S)^0.25 fps, 7..10 fps', trainer_fps: 10, trainer_mps: 3.048 }, 'fps', 'aircraft', ['G3'], 'สูง', false, '23.473(d) ฉบับ 2016'),
    part23_wing_lift_ratio: P(0.667, '-', 'aircraft', ['G3', 'G4'], 'สูง', false, ''),
    part23_min_load_factors: P({ inertia: 2.67, ground_reaction: 2.0 }, 'g', 'aircraft', ['G3'], 'สูง', false, ''),
    part23_reserve_drop_factor: P(1.44, 'x drop height', 'aircraft', ['G5'], 'สูง', false, 'ความเร็ว x1.2'),
    part25_limit_descent: P({ design_landing_weight_fps: 10, design_takeoff_weight_fps: 6, reserve_fps: 12 }, 'fps', 'aircraft', ['G1', 'G2'], 'สูง', false, 'lift ≤ W'),
    part25_friction_cap: P(0.8, '-', 'aircraft', ['G1'], 'สูง', false, '25.473(e)'),
  },
  sim: {
    strut_state_in_rk4: P(1, 'bool', 'sim', [], 'กลาง', true, 'x[13..15]'),
    tyre_lateral_state_in_rk4: P(1, 'bool', 'sim', [], 'กลาง', true, 'y ใน x[16..18], x_b ใน x[19..21], clamp หลังทุก step'),
    lateral_damping: P(9900, 'N s/m', 'sim', [], 'ต่ำ', true, 'ζ ≈ 0.5 กับ k_y ≈ 101 kN/m'),
    hard_landing_fpm: P({ inspect: 600, damage: 720, crash: 900 }, 'fpm', 'sim', ['G3', 'G5'], 'ต่ำ', true, '10 fps, 12 fps, เกณฑ์ crash เดิม'),
  },
} };
// one leaf parameter per line, groups indented
function ser(o, ind) {
  const isLeaf = (x) => x && typeof x === 'object' && 'v' in x && 'scope' in x;
  const keys = Object.keys(o);
  return '{\n' + keys.map((k, i) => ind + '  ' + JSON.stringify(k) + ': ' + (isLeaf(o[k]) ? JSON.stringify(o[k]) : ser(o[k], ind + '  ')) + (i < keys.length - 1 ? ',' : '')).join('\n') + '\n' + ind + '}';
}
const out = ser(j, '');
JSON.parse(out);
console.log(out);
