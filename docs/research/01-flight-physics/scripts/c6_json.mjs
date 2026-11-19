// Section 6: build the "controls" parameter JSON (validated by JSON.parse)
const L = (v, u, scope, src, conf, est, note) => ({ v, u, scope, src, conf, est, note });
const J = { controls: {
  pitch: {
    architecture: L({ kind: 'reversible', input: 'force' }, '-', 'aircraft', ['C23', 'C15'], 'สูง', true, 'เครื่องฝึก: กลไก reversible + trim tab; 737 ใช้ kind feel, A320 ใช้ kind fbw'),
    S_e: L(1.10, 'm2', 'aircraft', ['C17'], 'ต่ำ', true, 'พื้นที่ elevator หลังบานพับ ประมาณจาก S_h 2.96 m2 ที่ถอยจาก CLde และเทียบช่วง 1.4–2.5 m2 ของเครื่องใน KU-FRL-351'),
    c_e: L(0.30, 'm', 'aircraft', ['C17'], 'ต่ำ', true, 'คอร์ดเฉลี่ยหลังบานพับ'),
    gearing: L(2.40, 'rad/m', 'aircraft', [], 'ต่ำ', true, 'คันดึงสุด 160 mm = -22 deg, ดันสุด 109 mm = +15 deg'),
    eta_t: L(0.90, '-', 'aircraft', [], 'กลาง', true, 'อัตราส่วนความดันพลวัตที่หาง'),
    a_t: L(3.9, '1/rad', 'aircraft', [], 'กลาง', true, 'ความชันแรงยกหาง AR ราว 4.5'),
    tau_e: L(0.55, '-', 'aircraft', ['C16'], 'กลาง', true, 'elevator effectiveness; NACA 721 ให้ 0.67 ที่ cf/c 0.40 (ไม่รวมการสูญเสียจริง)'),
    l_t: L(5.42, 'm', 'aircraft', [], 'กลาง', true, 'ถอยจาก (Cmde/CLde)*cbar ของ AC'),
    deda: L(0.36, '-', 'aircraft', [], 'กลาง', true, 'ถอยจาก Cmadot/Cmq ของ AC'),
    Ch0: L(0, '-', 'aircraft', [], 'ต่ำ', true, 'รวม i_t - eps0; ปรับร่วมกับ tab'),
    Ch_alpha: L(-0.1146, '1/rad', 'aircraft', ['C15', 'C17'], 'ต่ำ', true, '-0.0020/deg; plain elevator -0.0025 ถึง -0.003/deg'),
    Ch_delta: L(-0.3438, '1/rad', 'aircraft', ['C15', 'C16', 'C17'], 'ต่ำ', true, '-0.0060/deg; plain -0.007 ถึง -0.0085/deg ลดด้วย balance'),
    Ch_tab: L(-0.2005, '1/rad', 'aircraft', ['C16'], 'ต่ำ', true, '-0.0035/deg ลำดับเดียวกับตัวอย่าง NACA 721 (-0.0032/deg)'),
    tab_max: L(20, 'deg', 'aircraft', [], 'ต่ำ', true, 'ต้องใช้ +12.9 (71 kt แฟลปลง) ถึง -4.7 (230 kt) เผื่อ CG'),
    trim_rate_flaps_down: L(1.0, 'deg/s', 'aircraft', [], 'ต่ำ', true, 'tab; ≈ 5.6 kt/s ของความเร็ว trim ที่ 95 kt, ลดแรง ≈ 0.8 lbf/s'),
    trim_rate_flaps_up: L(0.5, 'deg/s', 'aircraft', [], 'ต่ำ', true, 'tab; ≈ 11 kt/s ที่ 150 kt, ลดแรง ≈ 1.0 lbf/s'),
    breakout: L(4.45, 'N', 'aircraft', ['C19', 'C20'], 'ต่ำ', true, '1 lbf; C150 วัดได้ 2.2–4.4 N ด้านดึง'),
    friction: L(4.45, 'N', 'aircraft', ['C18', 'C19'], 'ต่ำ', true, 'Coulomb; GA วัดได้ถึง ~6 lbf (elevator) จึงเป็นค่าเบา'),
    centring_spring: L({ Kc: 60, qFade: 400 }, 'N/rad, Pa', 'aircraft', [], 'ต่ำ', true, 'ใช้เฉพาะ qbar ต่ำ ไม่ให้คันห้อยบนพื้น'),
    float_lag: L(0.05, 's', 'sim', ['C14'], 'กลาง', true, 'lag ของ stick-free equilibrium; รักษางบ time delay Level 1'),
    stops: L({ teu: 22, ted: 15 }, 'deg', 'aircraft', [], 'กลาง', false, 'ค่าเดิม AC.deUp/deDn'),
    rate_limit: L(70, 'deg/s', 'aircraft', [], 'ต่ำ', true, 'ค่าเดิม; กลไกจริงจำกัดด้วยมือนักบิน'),
    derived_check: L({ Fs_per_g_N: 39.7, grad_95kt_N_per_kt: 0.63, SM_fixed: 0.150, SM_free: 0.099, free_elevator_factor: 0.817 }, 'mixed', 'aircraft', [], 'กลาง', true, 'ผลคำนวณ c6_hinge.mjs สำหรับยืนยันการ implement')
  },
  roll: {
    architecture: L({ kind: 'reversible', input: 'force' }, '-', 'aircraft', ['C31'], 'สูง', true, 'ATR 72 aileron ก็เป็นแบบนี้ (geared balance tab)'),
    S_a_each: L(0.65, 'm2', 'aircraft', ['C17'], 'ต่ำ', true, 'KU-FRL-351: 0.54–0.65 m2 ต่อข้างในเครื่องเล็ก'),
    c_a: L(0.25, 'm', 'aircraft', ['C17'], 'ต่ำ', true, ''),
    gearing: L(3.88, 'rad/m', 'aircraft', [], 'ต่ำ', true, '±20 deg ต่อ stick ±90 mm'),
    Ch_delta: L(-0.1719, '1/rad', 'aircraft', [], 'ต่ำ', true, '-0.0030/deg (Frise/balance) ให้ 24.9 lbf ที่ aileron เต็ม 95 kt'),
    Ch_alpha: L(-0.0573, '1/rad', 'aircraft', [], 'ต่ำ', true, '-0.0010/deg; ผลรวมสองข้างหักล้างกันเมื่อสมมาตร'),
    tab_max: L(10, 'deg', 'aircraft', [], 'ต่ำ', true, 'aileron trim เพื่อแรงบิดเครื่อง (6.4 lbf ที่ 80 kt กำลังเต็ม > 5 lbf)'),
    trim_rate: L(1.0, 'deg/s', 'aircraft', [], 'ต่ำ', true, ''),
    breakout: L(3.0, 'N', 'aircraft', ['C18', 'C19'], 'ต่ำ', true, 'GA friction aileron > 2 lbf'),
    stops: L({ max: 20 }, 'deg', 'aircraft', [], 'กลาง', false, 'ค่าเดิม AC.daMax'),
    rate_limit: L(80, 'deg/s', 'aircraft', [], 'ต่ำ', true, 'ค่าเดิม')
  },
  yaw: {
    architecture: L({ kind: 'reversible', input: 'force' }, '-', 'aircraft', ['C23'], 'สูง', true, '737 rudder เป็น kind feel (feel and centering unit) [C25]'),
    S_r: L(0.85, 'm2', 'aircraft', [], 'ต่ำ', true, ''),
    c_r: L(0.32, 'm', 'aircraft', [], 'ต่ำ', true, ''),
    gearing: L(4.85, 'rad/m', 'aircraft', [], 'ต่ำ', true, '±25 deg ต่อ pedal ±90 mm'),
    Ch_delta: L(-0.3438, '1/rad', 'aircraft', [], 'ต่ำ', true, '-0.0060/deg; 2.6 lbf/deg ที่ 95 kt'),
    Ch_beta: L(-0.1146, '1/rad', 'aircraft', [], 'ต่ำ', true, '-0.0020/deg ใช้ beta ที่หางดิ่ง'),
    slipstream_q_ratio: L([1.0, 2.0], '-', 'aircraft', [], 'ต่ำ', true, 'ช่วงของ qbar_v/qbar ตอนกำลังเต็ม รอผลหัวข้อ slipstream'),
    tab_max: L(15, 'deg', 'aircraft', ['C18'], 'ต่ำ', true, 'rudder trim สำหรับ P-factor/swirl'),
    trim_rate: L(1.5, 'deg/s', 'aircraft', [], 'ต่ำ', true, ''),
    breakout: L(13.3, 'N', 'aircraft', ['C14'], 'กลาง', true, '3 lbf อยู่ในช่วง 1–7 lbf ของ MIL-F-8785 Class II-C'),
    stops: L({ max: 25 }, 'deg', 'aircraft', [], 'กลาง', false, 'ค่าเดิม AC.drMax'),
    rate_limit: L(60, 'deg/s', 'aircraft', [], 'ต่ำ', true, 'ค่าเดิม')
  },
  reference_types: {
    b737_rudder_rate: L({ dual: 66, primaryOnly: 33 }, 'deg/s', 'aircraft', ['C25'], 'กลาง', false, '737-300 main rudder PCU'),
    b737_rudder_pedal_force_full: L(311, 'N', 'aircraft', ['C25'], 'กลาง', false, '≈ 70 lbf ที่ rudder เต็ม; blowdown 14–21 deg'),
    b737_yaw_damper_authority: L(3, 'deg', 'aircraft', ['C25'], 'กลาง', false, 'series yaw damper ไม่ขยับ pedal'),
    b737max_stab_rate_flaps_down: L(0.27, 'deg/s', 'aircraft', ['C24'], 'สูง', false, 'อัตรา Speed Trim/MCAS แฟลปลง'),
    atr72_aileron: L({ maxDeflection: 14, wheelForceDesignMax_lbf: 60, apRateMonitor: 3.6 }, 'deg, lbf, deg/s', 'aircraft', ['C31'], 'สูง', false, 'ไม่มีไฮดรอลิก, geared balance tab')
  },
  requirements: {
    part23_force_limits: L({ temporary: { pitch_stick: 60, roll_stick: 30, pitch_wheel2: 75, roll_wheel2: 50, pitch_wheel1: 50, roll_wheel1: 25, yaw: 150 }, prolonged: { pitch: 10, roll: 5, yaw: 20 } }, 'lbf', 'sim', ['C1', 'C11'], 'สูง', false, '14 CFR 23.143(c) Amdt 23-50; ASTM F3173-23 Table 1 ใช้ค่าเดียวกัน'),
    part25_force_limits: L({ short2: { pitch: 75, roll: 50 }, short1: { pitch: 50, roll: 25 }, shortYaw: 150, long: { pitch: 10, roll: 5, yaw: 20 } }, 'lbf', 'sim', ['C8'], 'สูง', false, '14 CFR 25.143(d)'),
    part23_maneuver_force_min: L({ wheel: { perWeight: 0.01, min: 20, cap: 50 }, stick: { perWeight: 1 / 140, min: 15, cap: 35 } }, 'lbf (W in lbf)', 'sim', ['C2', 'C11'], 'สูง', false, '23.155: แรงถึง limit load factor'),
    mil8785c_fs_per_g_centre_stick: L({ L1: { maxNum: 240, maxCap: 28.0, maxFloorNum: 56, minNum: 21, minFloor: 3.0 }, L2: { maxNum: 360, maxCap: 42.5, maxFloorNum: 85, minNum: 18, minFloor: 3.0 }, L3: { max: 56.0, minNum: 12, minFloor: 2.0 } }, 'lbf/g', 'sim', ['C12', 'C13'], 'กลาง', false, 'max = min(num/(n/alpha), cap) แต่ไม่ต่ำกว่า floorNum/(nL-1); min = max(minNum/(nL-1), floor)'),
    mil8785c_fs_per_g_wheel_L1: L({ maxNum: 500, maxCap: 120, maxFloorNum: 120, minNum: 35, minFloor: 6.0 }, 'lbf/g', 'sim', ['C12'], 'กลาง', false, 'Level 1 wheel'),
    force_per_deflection_min_catA: L({ stickOrWheel_lbf_per_in: 5.0, sidestick_lbf_per_deg: 2.0 }, 'mixed', 'sim', ['C12'], 'กลาง', false, 'MIL-F-8785C 3.2.2.2.2'),
    speed_stability_return: L({ part23: 0.10, part25_cruise: 0.075, part25_other: 0.10, maxForceConsidered_lbf: 40 }, 'fraction', 'sim', ['C4', 'C9'], 'สูง', false, '23.173(b), 25.173(b)'),
    part25_min_speed_gradient: L(0.1667, 'lbf/kt', 'sim', ['C9'], 'สูง', false, '1 lbf ต่อ 6 kt'),
    time_delay_levels: L([0.10, 0.20, 0.25], 's', 'sim', ['C14'], 'สูง', false, 'MIL-F-8785C 3.5.3 Level 1/2/3'),
    surface_lag_levels: L({ L12_catAC: 30, L12_catB: 45, L3: 60 }, 'deg', 'sim', ['C14'], 'กลาง', false, 'MIL-F-8785B 3.5.3 (อ้างผ่าน DOT/FAA/AR-07/47)'),
    pedal_breakout: L({ classIIC: [1, 7], classIIL_III: [1, 14] }, 'lbf', 'sim', ['C14'], 'กลาง', false, 'MIL-F-8785 / 8785B 3.5.2.1; ค่าบน x2 ที่ Level 3')
  },
  input: {
    force_full_scale: L({ pitch: 267, roll: 133, yaw: 667 }, 'N', 'sim', ['C1'], 'กลาง', true, 'โปรไฟล์สมจริง = ขีดชั่วคราว 23.143; โปรไฟล์ง่ายใช้ครึ่งหนึ่ง'),
    deadzone_gamepad: L(0.08, '-', 'sim', ['C28'], 'ต่ำ', true, 'สเปกไม่กำหนด dead zone'),
    deadzone_touch: L(0.04, '-', 'sim', [], 'ต่ำ', true, ''),
    expo: L(0.5, '-', 'sim', [], 'ต่ำ', true, 'f(u) = (1-e)u + e u^3'),
    keyboard_force_ramp: L({ up: 45, release: 180, max: 89 }, 'N/s, N/s, N', 'sim', [], 'ต่ำ', true, 'กดค้าง ≈ 10 lbf/s ถึง 20 lbf'),
    auto_trim_ref_force: L(4.45, 'N', 'sim', [], 'ต่ำ', true, 'แรงที่ auto-trim ใช้อัตราเต็ม'),
    force_display_marks: L({ pitch: [10, 40, 60], roll: [5, 30], yaw: [20, 150] }, 'lbf', 'sim', ['C1', 'C4'], 'สูง', false, 'ขีดบนแถบแสดงแรง'),
    trim_alert: L({ force_lbf: 2, hold_s: 3 }, 'lbf, s', 'sim', [], 'ต่ำ', true, 'แสดง "ต้อง trim"')
  }
} };
const s = JSON.stringify(J, null, 1); JSON.parse(s); console.log(s);
