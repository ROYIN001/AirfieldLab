// Section 11: builds the parameter JSON block (one leaf per line; validated by JSON.parse)
const L = (v, u, scope, src, conf, est, note) => ({ v, u, scope, src, conf, est, note });
const J = { input: {
  gamepad: {
    standard_layout: L({ buttons: 17, axes: 4, axis_range: [-1, 1], button_range: [0, 1], axes1_back_sign: 1 }, '-', 'sim', ['I1'], 'สูง', false, 'axes[1] บวก = ดึงกลับ = y บวก ไม่ต้องกลับเครื่องหมาย'),
    poll_per_frame: L(1, 'ครั้ง/เฟรม', 'sim', ['I1', 'I6'], 'สูง', false, 'getGamepads() ก่อน fl.advance'),
    permissions_policy_default: L({ allowlist: '*', chrome_since: 103 }, '-', 'sim', ['I1', 'I4', 'I5'], 'สูง', false, 'iframe ข้ามโดเมนใช้ได้เว้นแต่หน้าแม่ปิด'),
    max_effect_duration: L(5000, 'ms', 'sim', ['I1'], 'สูง', false, 'ค่าที่สเปกแนะนำ'),
  },
  shaping: {
    deadzone_gamepad_stick: L(0.08, 'สัดส่วนช่วงแกน', 'sim', ['I7', 'I12'], 'ต่ำ', true, 'scaled radial เท่าหัวข้อ 6'),
    deadzone_flightstick: L(0.03, 'สัดส่วนช่วงแกน', 'sim', ['I12'], 'ต่ำ', true, 'axial'),
    deadzone_pedals: L(0.03, 'สัดส่วนช่วงแกน', 'sim', [], 'ต่ำ', true, 'axial'),
    deadzone_trigger_rudder: L(0.05, 'สัดส่วนช่วงแกน', 'sim', ['I7'], 'ต่ำ', true, 'กับผลต่าง RT−LT'),
    outer_deadzone: L(0.02, 'สัดส่วนช่วงแกน', 'sim', ['I11'], 'ต่ำ', true, 'extremity'),
    lever_end_deadzone: L({ idle: 0.02, full: 0.02 }, 'สัดส่วนช่วงคันโยก', 'sim', [], 'ต่ำ', true, ''),
    deadzone_auto: L({ k_noise: 1.5, margin: 0.02, min: 0.03, max: 0.25 }, '-', 'sim', [], 'ต่ำ', true, 'จากช่วงพัก 2 s'),
    xinput_reference: L({ left_stick: 0.2395, right_stick: 0.2652, trigger: 0.1176 }, 'สัดส่วนช่วงแกน', 'sim', ['I7', 'I8'], 'สูง', false, '7849/32767, 8689/32767, 30/255'),
    flightgear_default_deadband: L(0.1, 'สัดส่วนช่วงแกน', 'sim', ['I12'], 'สูง', false, ''),
    expo_default: L({ gamepad: 0.5, flightstick: 0.3, pedals: 0.3, trigger_rudder: 0.3, touch: 0.5 }, '-', 'sim', [], 'ต่ำ', true, 'out = (1−e)x + e x³'),
    expo_range: L([0, 0.9], '-', 'sim', [], 'ต่ำ', true, ''),
    xplane_max_curve: L({ half_input: 0.5, output: 0.1, equivalent_power: 3.32 }, '-', 'sim', ['I9'], 'กลาง', false, 'เลขชี้กำลังคำนวณเอง'),
    one_euro: L({ min_cutoff_Hz: 2, beta: 2, d_cutoff_Hz: 1, enable_if_noise_gt: 0.01 }, 'Hz, s, Hz, -', 'sim', ['I18'], 'ต่ำ', true, 'd_cutoff ตามบทความ ค่าอื่นเลือกให้ lag ≤ 0.05 s'),
    lag_budget: L(0.1, 's', 'sim', [], 'กลาง', false, 'จากหัวข้อ 6.5.1'),
  },
  keyboard: {
    ramp_pitch: L({ up: 0.5, back: 2.5, cap: 1 }, '1/s, 1/s, -', 'sim', [], 'ต่ำ', true, '≈ 1.1 g/s ที่ 95 kt DIRECT'),
    ramp_roll: L({ up: 1.0, back: 3.0, cap: 1 }, '1/s, 1/s, -', 'sim', [], 'ต่ำ', true, ''),
    ramp_rudder: L({ up: 1.0, back: 2.0, cap: 1 }, '1/s, 1/s, -', 'sim', [], 'ต่ำ', true, ''),
    fine_factor: L(0.5, '-', 'sim', [], 'ต่ำ', true, 'Shift ค้าง: คูณอัตราและเพดาน'),
    current_ramp_reference: L({ pitch_up: 2.0, roll_up: 2.5, rudder_up: 2.5, back: 5.0, throttle: 0.35 }, '1/s', 'sim', [], 'สูง', false, '90-app.js:361-364'),
    throttle_rate: L(0.35, '1/s', 'sim', ['I14'], 'กลาง', false, 'คงเดิม'),
    flightgear_reference: L({ stick_step_per_press: 0.05, trim_step_per_repeat: 0.001, TRIM_RATE_per_s: 0.045, throttle_step_per_repeat: 0.01, flap_steps: 3, full_brake_time_s: 0.5 }, 'หน่วยควบคุม', 'sim', ['I14', 'I15'], 'สูง', false, ''),
    os_key_repeat: L([2.5, 30], 'Hz', 'sim', ['I23'], 'สูง', false, 'ห้ามผูก ramp กับ repeat'),
    brake_key_rise: L(0.5, 's', 'sim', ['I15'], 'กลาง', false, ''),
    interim_trim_rate_elevator: L(0.5, 'deg/s', 'aircraft', [], 'ต่ำ', true, 'ของ trimDe ก่อนมี tab (หัวข้อ 6)'),
    flap_notches: L([0, 0.5, 1], 'สัดส่วน AC.flaps', 'aircraft', [], 'ต่ำ', true, 'UP/T-O/LDG'),
    keymap_default: L({ pitch: [['KeyW', 'ArrowUp', 'Numpad8'], ['KeyS', 'ArrowDown', 'Numpad2']], roll: [['KeyA', 'ArrowLeft', 'Numpad4'], ['KeyD', 'ArrowRight', 'Numpad6']], rudder: [['KeyQ', 'Numpad0'], ['KeyE', 'NumpadEnter']], centre: ['Numpad5'], throttle: [['Minus', 'PageDown', 'Numpad3'], ['Equal', 'PageUp', 'Numpad9']], trim_pitch: [['BracketLeft', 'Home', 'Numpad7'], ['BracketRight', 'End', 'Numpad1']], trim_rudder: [['Comma'], ['Period']], flaps: [['KeyV'], ['KeyF']], gear: ['KeyG'], brake_both: ['KeyB'], brake_left: ['KeyZ'], brake_right: ['KeyX'], parking_brake: ['Shift+KeyB'], fine: ['ShiftLeft', 'ShiftRight'], camera: ['KeyC'], take_control: ['KeyT'], pause: ['KeyP'], restart: ['KeyR'] }, 'KeyboardEvent.code', 'sim', ['I14', 'I19'], 'ต่ำ', true, 'คู่ [ลบ, บวก]: ดัน/ดึง, ซ้าย/ขวา, ลด/เพิ่ม, หัวลง/หัวขึ้น, เก็บ/กาง'),
  },
  devices: {
    storage: L({ key: 'afl-input-v1', schema_version: 1 }, '-', 'sim', [], 'สูง', true, 'ผ่าน store (90-app.js:5)'),
    wizard: L({ rest_capture_s: 2, move_threshold: 0.5, sweep_capture_s: 4 }, 's, -, s', 'sim', ['I9'], 'ต่ำ', true, ''),
    arbitration_hold: L(0.5, 's', 'sim', [], 'ต่ำ', true, 'แหล่งที่ขยับล่าสุดคุมช่อง'),
    device_hints: L({
      '044f:b108': { name: 'T.Flight Hotas X', axes: { roll: 0, pitch: 1, throttle: 2, rudder: 3 } },
      '044f:b679': { name: 'T-Rudder', axes: { brakeR: 0, brakeL: 1, rudder: 2 }, toe_rest: 1, rudder_power: 2 },
      '06a3:0763': { name: 'Saitek Pro Flight Rudder Pedals', axes: { brakeL: 0, brakeR: 1, rudder: 2 }, toe_rest: -1, rudder_power: 2 } }, 'vendor:product', 'sim', ['I16', 'I26'], 'ต่ำ', false, 'ลำดับแกนจาก FlightGear ใช้เป็นคำใบ้ให้ wizard เท่านั้น'),
  },
  haptics: {
    update_period: L(0.1, 's', 'sim', ['I1'], 'ต่ำ', true, 'เท่าหัวข้อ 1.6'),
    effect_duration: L(120, 'ms', 'sim', ['I1'], 'ต่ำ', true, ''),
    mix: L({ buffet_strong: 1, buffet_weak: 0.5, runway_weak_at_30mps: 0.15, td_sink_zero_fpm: 100, td_sink_full_fpm: 700, td_min: 0.15, td_duration_ms: 150 }, '-', 'sim', [], 'ต่ำ', true, ''),
    user_gain: L({ default: 0.7, range: [0, 1] }, '-', 'sim', [], 'ต่ำ', true, ''),
    android_vibrate_touchdown: L(40, 'ms', 'sim', ['I2'], 'ต่ำ', true, 'Chrome Android เท่านั้น'),
  },
  touch: {
    stick_radius_current: L(50, 'px', 'sim', [], 'สูง', false, '90-app.js:346'),
    deadzone: L(0.04, 'สัดส่วนรัศมี', 'sim', [], 'ต่ำ', true, 'เท่าหัวข้อ 6'),
    origin_mode: L({ default: 'floating' }, '-', 'sim', [], 'ต่ำ', true, ''),
    square_gate: L({ enabled: 1 }, '-', 'sim', [], 'ต่ำ', true, ''),
  },
  mouse: {
    yoke_gain_K: L(4, 'คันเต็มต่อความกว้างหน้าต่าง', 'sim', ['I17'], 'ต่ำ', true, 'ตีความจาก factor 4.0 (ยังไม่ยืนยัน)'),
    wheel_trim_step: L(0.001, 'หน่วย trim ต่อคลิก', 'sim', ['I17'], 'กลาง', false, ''),
  },
  browser: {
    reserved_shortcuts_chrome: L({ outside_fullscreen: ['Ctrl/Cmd+T', 'Ctrl/Cmd+W', 'Ctrl/Cmd+N', 'Ctrl/Cmd+Shift+T', 'Ctrl/Cmd+Shift+W', 'Ctrl/Cmd+Shift+N'] }, '-', 'sim', ['I22'], 'สูง', false, ''),
  },
} };
const groups = Object.entries(J.input).map(([g, o]) => `  "${g}": {\n` + Object.entries(o).map(([k, v]) => `    "${k}": ${JSON.stringify(v)}`).join(",\n") + "\n  }");
const s = `{\n "input": {\n${groups.join(",\n")}\n }\n}`; JSON.parse(s); console.log(s);
