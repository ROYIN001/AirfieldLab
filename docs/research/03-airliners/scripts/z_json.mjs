// z_json.mjs — AirfieldLab round 3, topic 3.8 (prefix Z): builds the ```json blocks of 08-fbw-laws.md
// (one top-level key per block, every leaf {v,u,scope,src,conf,est,note}) and checks them.
// Run: node z_json.mjs > z_json_out.md   (Node >= 18). Ref ids Z.. are listed in 08-fbw-laws.md.
const L = (v, u, src, conf, est, note, scope = 'aircraft') => ({ v, u, scope, src, conf, est, note });
const S = 'สูง', M = 'กลาง', W = 'ต่ำ';
const kt = (x) => +(x * 0.514444).toFixed(3);

const a320ceo = { a320ceo: { controls: { fbw: {
  computers: L({ pitch_roll: '2 ELAC + 3 SEC', yaw: '2 FAC (rudder ต่อ pedal ทางกล)', air_data: '3 ADIRU; ELAC ใช้ AoA เฉลี่ยของ ADR1/ADR2' }, '-', ['Z13', 'Z1', 'Z7'], S, false, 'คอมพิวเตอร์ทั้งหมดทำงานพร้อมกัน'),
  update_rate_hz: L(240, 'Hz', ['Z14', 'Z39'], W, true, 'คาบจริงของ ELAC ไม่พบในแหล่งสาธารณะ; ใช้ขั้นฟิสิกส์ 240 Hz ของ AirfieldLab', 'sim'),
  normal_law: {
    pitch: {
      command: L('C_star_nz_integral', '-', ['Z1', 'Z2', 'Z12', 'Z8'], S, false, 'คันสั่ง load factor (สูง); รูป C* = dnz + (Vco/g)q และ integral เป็นค่าประมาณตาม Z12'),
      stick_to_dnz: L({ clean: { pull_full: 1.5, push_full: -2.0 }, slats_flaps: { pull_full: 1.0, push_full: -1.0 } }, 'g (เทียบ 1 g)', ['Z1', 'Z11', 'Z22', 'Z19'], S, true, 'ปลายช่วงจากขีด nz (สูง); ระหว่างกลางเชิงเส้นตามคัน (ค่าประมาณ)'),
      Vco: L(121.9, 'm/s', ['Z17', 'Z12'], M, true, '400 ft/s = 237 kt; FBW A32NX ใช้ 100 m/s (Z19)'),
      gains: L({ Kp: 0.06, Ki: 0.20, qbar0: 8000, sched_min: 0.3, sched_max: 4 }, 'rad/g, rad/(g s), Pa, -, -', ['Z39'], W, true, 'เลือกด้วยต้นแบบ z_fbw_proto.mjs; gain คูณ clamp(qbar0/qbar, 0.3, 4)'),
      path_hold: L({ Kg: 1.0, Kgi: 0.2, dnz_max: 0.3 }, '1/s, 1/s2, g', ['Z1', 'Z39'], W, true, 'ถือ gamma เมื่อคันกลางและ |phi| <= 33 deg (Z1: maintains the flight path); Kg 2.0 แกว่ง'),
      bank_compensation_max: L(33, 'deg', ['Z32', 'Z33', 'Z19'], M, false, 'nz_ref = cos(theta)/cos(min(|phi|, 33 deg))'),
      autotrim_nz_window: L([0.5, 1.3], 'g', ['Z33', 'Z19'], M, false, '1.3 g จาก Z33; ขอบล่าง 0.5 g และ FBW ใช้ 1.25 g (Z19)'),
      autotrim_bank_max: L(33, 'deg', ['Z33'], M, false, 'FBW A32NX ใช้ 30 deg (Z19)'),
      autotrim_freeze_RA: L(15.24, 'm', ['Z25', 'Z26'], W, false, '50 ft RA: THS ตรึงเมื่อเข้า flare'),
      autotrim_gain_Kt: L(0.5, '1/s', ['Z39'], W, true, 'อัตรา THS = clamp(Kt*de, rate max ของ controls.trim หัวข้อ 7)'),
      autotrim_inhibit: L({ alpha_prot: 'no_nose_up', hsp: 'frozen', direct_law: 'off', abnormal_phase1: 'off' }, '-', ['Z7', 'Z22', 'Z32', 'Z3'], S, false, 'D-AXLA: ถึง alpha prot หยุด nose-up trim'),
      ths_autotrim_nose_up_limit: L(-11, 'deg', ['Z7', 'Z19'], M, false, 'BEA D-AXLA: THS ถึง nose-up stop -11 deg; ตรวจเครื่องหมายกับ controls.trim (หัวข้อ 7)'),
    },
    flare_mode: {
      engage_RA: L(15.24, 'm', ['Z8', 'Z19', 'Z25'], S, false, '50 ft RA: จำค่า theta'),
      blend_RA: L([15.24, 9.144], 'm', ['Z8'], S, false, '50 ถึง 30 ft: เทอม nz ถูกแทนด้วยเทอม theta (Habsheim 1988)'),
      nose_down_target: L(-2, 'deg', ['Z8', 'Z19', 'Z25'], M, false, 'จาก 30 ft ลด theta อ้างอิงไป -2 deg; FCOM ceo บางฉบับไม่เขียนแล้ว (Z25)'),
      nose_down_time: L(8, 's', ['Z8', 'Z19'], M, false, 'rate = (max(-2, theta_memo) + 2)/8 deg/s'),
      gains: L({ K_theta: 0.8, K_q: 1.0, stick_theta_deg: 10 }, '1/s, -, deg', ['Z39'], W, true, 'e = (V/g)(K_theta (theta - theta_cmd) + K_q theta_dot); w = clamp((50 - RA_ft)/20, 0, 1)'),
    },
    ground_mode: {
      stick_to_elevator: L('direct', '-', ['Z28', 'Z33'], W, false, 'ไม่มี auto-trim บนพื้น'),
      blend_after_liftoff: L(5, 's', ['Z28', 'Z33'], W, false, 'ผสมกฎ ground กับกฎ nz 5 s หลังล้อพ้นพื้น'),
      transition_logic_model: L({ to_flight: 'airborne && (theta > 8 deg || RA > 121.9 m)', to_ground: 'onGround && theta < 2.5 deg for 5 s' }, '-', ['Z21'], W, false, 'ตรรกะในโมเดล FBW A32NX (RA 400 ft)'),
    },
    roll: {
      p_cmd_max: L(15, 'deg/s', ['Z1', 'Z20'], S, false, '0.2618 rad/s ที่คันสุด แปรตามคันเชิงเส้น'),
      bank_limits: L({ neutral_spiral: 33, full_stick: 67, aoa_prot: 45, hsp: 40 }, 'deg', ['Z1'], S, false, 'ปล่อยคันเกิน 33 deg กลับมา 33 deg; HSP ปล่อยคันกลับ 0 deg'),
      bank_return_rate: L({ at_33: 0, at_limit: 15, limit_plus_5: 20 }, 'deg/s', ['Z20', 'Z39'], W, true, 'เชิงเส้นระหว่างจุด; HSP: 0 ที่ 0 deg ถึง 15 ที่ 40 deg (Z20)'),
      gains: L({ wn: 2.0, zeta: 0.8, Ki_over_Kphi: 0.5, ref_window_deg: 1 }, 'rad/s, -, -, deg', ['Z39'], W, true, 'pole placement กับ Lp, Lu ที่คำนวณใหม่ทุกขั้น'),
      turn_coordination: L('r_cmd = g tan(phi)/V; beta -> 0', '-', ['Z13', 'Z28'], M, true, 'กฎจริงมีเป้า roll rate, sideslip, bank (Z13); สมการเป็นค่าประมาณ'),
      ap_disconnect_bank: L(45, 'deg', ['Z1'], S, false, 'autopilot ตัดเมื่อเอียงเกิน 45 deg'),
    },
  },
  protections: {
    nz_limits: L({ clean: [-1.0, 2.5], slats_flaps: [0.0, 2.0] }, 'g', ['Z1', 'Z11', 'Z22'], S, false, 'คงอยู่ใน alternate law'),
    g_load_ecam: L([0.7, 1.4], 'g', ['Z22'], M, false, 'ECAM G LOAD เมื่ออยู่นอกช่วงนาน > 2 s'),
    pitch_limits: L({ nose_up_conf0_3: 30, nose_up_conf0_3_low_speed: 25, nose_up_full: 25, nose_up_full_low_speed: 20, nose_down: -15 }, 'deg', ['Z1', 'Z22', 'Z31', 'Z32'], M, false, '30/-15 สูง (Z1); ค่าความเร็วต่ำ กลาง; นิยามความเร็วต่ำไม่พบ'),
    pitch_limit_gain: L(0.5, '1/s', ['Z39'], W, true, 'dnz <= (V/g) K (theta_max - theta)'),
    fd_removal: L({ up: 25, down: -13, restore_up: 22, restore_down: -10 }, 'deg', ['Z1', 'Z22'], M, false, '25/13 จาก Z1; ค่าคืน 22/10 จาก Z22'),
    alpha_rule: L({ CL_amax_over_CLmax: 0.873, aprot_below_amax: 3.0, afloor_below_amax: 2.5 }, '-, deg, deg', ['Z7', 'Z8', 'Z39'], W, true, 'ผูกกับเส้นโค้งแรงยกของโมเดล: Vamax/VS1g 1.07 (D-AXLA) และระยะห่างจาก Habsheim'),
    alpha_anchor_1988_conf3: L({ aprot: 14.5, amax: 17.5, afloor: 15.0 }, 'deg', ['Z8'], S, false, 'A320-111 มาตรฐานปี 1988; afloor ทำงานเมื่อ RA > 100 ft'),
    alpha_anchor_us1549_conf2: L({ amax: 17.5, alpha_touchdown: [13, 14] }, 'deg', ['Z30', 'Z6'], M, false, 'A320-214 ปี 2009 อ้างผ่านฟอรัม'),
    alpha_floor_fcom: L({ CONF0: 9.5, CONF1: 15, CONF2: 15, CONF3: 14, FULL: 13 }, 'deg', ['Z22'], M, false, 'ค่า FCOM ผ่าน FBW docs; ไม่ตรงกับ alpha ของโมเดล ใช้ alpha_rule แทนในการจำลอง'),
    alpha_floor_logic: L({ active: 'lift-off ถึง RA 30.48 m ขาลง', mach_max: 0.6, stick_deg_with_prot: 14 }, '-, Mach, deg', ['Z22', 'Z26', 'Z8'], M, false, 'สั่ง TOGA ผ่าน A/THR (หัวข้อ 9)'),
    alpha_mode_logic: L({ entry_lead_s: 0.5, exit_stick: -0.5, exit_fwd_time_s: 0.5, threshold_rate_limit_degps: 1, takeoff_aprot_eq_amax_s: 5 }, 's, -, s, deg/s, s', ['Z21', 'Z26', 'Z39'], W, true, 'latch ตาม Z26; ค่าออกจากโหมดไม่พบในแหล่งสาธารณะ; rate 1 deg/s และ 5 s จากโมเดล Z21'),
    alpha_mode_gains: L({ kA: 4, kAa: 5, kAd: 0.15 }, '-', ['Z39'], W, true, 'eA = kA nzA (a - acmd) + kAa nzA a_dot + kAd (Vco/g) theta_dot'),
    ap_disconnect_alpha_margin: L(1.0, 'deg', ['Z26'], W, false, 'AP ตัดที่ alpha prot + 1 deg'),
    hsp: L({ dV_on: kt(6), dM_on: 0.01, dV_nd_zero: kt(16), dM_nd_zero: 0.04, dV_ap_off: kt(15), dM_ap_off: 0.04 }, 'm/s, Mach', ['Z22', 'Z13', 'Z31', 'Z32'], M, false, 'VMO+6 kt/MMO+0.01 เริ่ม; อำนาจ ND เป็นศูนย์ราว VMO+16 kt/MMO+0.04; AP ตัด VMO+15 kt; Z22 มีที่เขียน +0.015'),
    hsp_model: L({ tau_pred_s: 8, dnz_slope_g_per_mps: +(0.075 / 0.514444).toFixed(4), dnz_max: 0.75 }, 's, g/(m/s), g', ['Z39', 'Z32'], W, true, 'dnz_max 0.75 g = 1.75 g รวม (A330 FCTM ผ่าน Z32); slope 0.075 g/kt'),
    stall_warning_alpha_landing: L(23, 'deg', ['Z7'], S, false, 'ใช้ใน alternate/direct; normal law ไม่จำเป็นต้องเตือน (Z9)'),
  },
  alternate_law: {
    pitch: L('nz_demand; nz limits kept; no pitch attitude protection', '-', ['Z1'], S, false, 'ALT ของ A320'),
    low_speed_stability_onset: L([kt(5), kt(10)], 'm/s', ['Z1', 'Z31'], S, false, '5-10 kt เหนือ stall warning: nose-down ค่อยเป็นค่อยไป ดึงชนะได้'),
    high_speed_stability: L('nose_up_demand_above_VMO_MMO_overridable', '-', ['Z1', 'Z23', 'Z31'], M, false, 'แทน HSP'),
    roll: L('direct', '-', ['Z1', 'Z23'], S, false, 'ไม่มี bank angle protection และ turn coordination'),
    yaw_damper_authority: L(5, 'deg', ['Z1'], S, false, '+-5 deg rudder'),
    gear_down_to_direct: L(true, '-', ['Z7', 'Z23'], S, false, 'ALT law + ล้อลง (AP off) = pitch direct'),
    triggers: L({ reduced_prot: ['2 ADR', 'both ELAC', '1 elevator', '1 sidestick', '2 IR', 'ELAC1+G or Y hyd', 'ELAC2+B hyd', 'all spoilers or 3 SEC', 'THS jam', 'G+Y hyd'], no_prot: ['3 ADR', 'both SFCC slat channels', 'G+B hyd'] }, '-', ['Z23', 'Z7'], M, false, 'รายการจาก FBW docs; ELAC ปฏิเสธ ADR > 1 ตัว (Z7 สูง)'),
  },
  direct_law: {
    pitch: L('stick_to_elevator; max deflection f(CG, config)', '-', ['Z1', 'Z31', 'Z33'], S, false, ''),
    autotrim: L(false, '-', ['Z7', 'Z3'], S, false, 'PFD: USE MAN PITCH TRIM'),
    roll_rate_max: L({ clean: 30, slats: 25 }, 'deg/s', ['Z31'], W, false, 'ใช้ตั้งตัวคูณอำนาจ roll ใน direct law'),
    triggers: L(['3 IR', 'RA fail with gear down', 'ALT law + gear down'], '-', ['Z23', 'Z7'], M, false, ''),
  },
  abnormal_attitude: {
    triggers: L({ bank_deg: 125, pitch_up_deg: 50, pitch_down_deg: -30, alpha_max_deg: 40, alpha_min_deg: -10, ias_min: kt(60), ias_max: kt(440), mach_max: 0.91 }, 'deg, m/s, Mach', ['Z23', 'Z2', 'Z21'], M, false, 'alpha 30-40 deg และ ias ต่ำ 60-90 kt ตาม theta (Z23); ใช้ค่าในโมเดล Z21'),
    effect: L('ALT2 with max roll authority; no autotrim in phase 1', '-', ['Z2', 'Z7', 'Z23'], S, false, 'หลังกู้คืน pitch/yaw อยู่ใน alternate law'),
  },
  mechanical_backup: L({ pitch: 'THS trim wheel', yaw: 'rudder pedals' }, '-', ['Z13', 'Z23', 'Z32'], M, false, 'ไม่ได้ออกแบบให้ลงจอดในสภาพนี้'),
  sidestick: {
    travel: L({ pitch: 16, roll: 20 }, 'deg', ['Z32', 'Z1'], M, false, 'ตรงกับ controls.inceptors.sidestick ของหัวข้อ 7'),
    breakout: L(4.89, 'N', ['Z27'], W, false, '1.1 lbf'),
    force_at_stop: L({ pitch: 100.1, roll_out: 24.9, roll_in: 34.7 }, 'N', ['Z27'], W, false, '22.5 / 5.6 / 7.8 lbf'),
    gradient: L({ pitch: 5.949, roll_out: 1.001, roll_in: 1.490 }, 'N/deg', ['Z27', 'Z39'], W, true, '(F_stop - breakout)/travel'),
    ap_override: L({ pitch: 50, roll: 35 }, 'N', ['Z1'], S, false, 'แรงดันผ่าน solenoid detent ขณะ AP ทำงาน (5/3.5 daN)'),
    dual_input_threshold: L(2, 'deg', ['Z1'], S, false, ''),
    takeover_latch: L(40, 's', ['Z1'], S, false, ''),
  },
} } } };

const a320neo = { a320neo: { controls: { fbw: { normal_law: { flare_mode: {
  engage_RA: L(15.24, 'm', ['Z25'], W, false, 'A320neo ใช้ flare mode เหมือน ceo (ฟอรัม); ค่าอื่นสืบจาก a320ceo'),
} } } } } };

const a321ceo = { a321ceo: { controls: { fbw: { normal_law: {
  flare_mode: { engage_RA: L(15.24, 'm', ['Z25'], W, false, 'FCOM A321ceo ตามที่ยกในฟอรัม: THS ตรึงที่ 50 ft; เขียนทับค่าจาก a321neo') },
  pitch: { autotrim_freeze_RA: L(15.24, 'm', ['Z25'], W, false, '50 ft RA') },
} } } } };

const a321neo = { a321neo: { controls: { fbw: { normal_law: {
  flare_mode: {
    engage_RA: L(30.48, 'm', ['Z25'], W, false, '100 ft RA (FCOM A321neo ตามที่ยกในฟอรัม)'),
    ground_thrust_effect_compensation: L(false, '-', ['Z25'], W, false, 'The flare law does not compensate the ground or thrust effect'),
  },
  pitch: { autotrim_freeze_RA: L(30.48, 'm', ['Z25'], W, false, '100 ft RA') },
} } } } };

const a330 = { a330_300: { controls: { fbw: {
  computers: L({ pitch_roll: '3 PRIM (FCPC) + 2 SEC (FCSC)', yaw: 'กลไก (รุ่นหลัง FBW)', air_data: '3 ADIRU; FCPC ใช้ AoA เฉลี่ย AOA1/AOA2 หลังแก้ไข' }, '-', ['Z3', 'Z4', 'Z13'], S, false, ''),
  update_rate_hz: L(240, 'Hz', ['Z39'], W, true, 'เหมือน a320ceo', 'sim'),
  normal_law: {
    pitch: {
      command: L('C_star_nz_integral', '-', ['Z2', 'Z12'], S, false, 'คันสั่ง load factor (BEA AF447 หน้า 38)'),
      stick_to_dnz: L({ clean: { pull_full: 1.5, push_full: -2.0 }, slats_flaps: { pull_full: 1.0, push_full: -1.0 } }, 'g (เทียบ 1 g)', ['Z32', 'Z11'], M, true, '2.5/-1 g clean, 2/0 g slat/flap (A330/340 FCTM)'),
      Vco: L(121.9, 'm/s', ['Z17'], W, true, 'เหมือน a320ceo'),
      gains: L({ Kp: 0.06, Ki: 0.20, qbar0: 8000, sched_min: 0.3, sched_max: 4 }, 'rad/g, rad/(g s), Pa, -, -', ['Z39'], W, true, 'ยังไม่ได้ทดสอบกับข้อมูล A330; ต้องรันกรณีทดสอบซ้ำ'),
      path_hold: L({ Kg: 1.0, Kgi: 0.2, dnz_max: 0.3 }, '1/s, 1/s2, g', ['Z39'], W, true, 'เหมือน a320ceo'),
      bank_compensation_max: L(33, 'deg', ['Z32'], M, false, 'A330/340 FCTM'),
      autotrim_nz_window: L([0.5, 1.3], 'g', ['Z33'], W, false, 'เหมือน a320ceo'),
      autotrim_bank_max: L(33, 'deg', ['Z33'], W, false, ''),
      autotrim_inhibit: L({ alpha_prot: 'no_nose_up', hsp: 'frozen', direct_law: 'off', abnormal: 'off' }, '-', ['Z2', 'Z3', 'Z32'], M, false, 'abnormal attitude: ไม่มี auto-trim (Z2)'),
    },
    flare_mode: {
      engage_RA: L(30.48, 'm', ['Z29', 'Z33'], W, false, '100 ft RA'),
      transition_time: L(2, 's', ['Z33'], W, false, 'flight ไป flare และ flare ไป ground ช่วงละ 2 s'),
      nose_down_target: L(-2, 'deg', ['Z39'], W, true, 'ไม่พบรายละเอียดของ A330; ใช้ค่าของ A320 ชั่วคราว'),
      nose_down_time: L(8, 's', ['Z39'], W, true, 'เหมือนข้างบน'),
    },
    ground_mode: { blend_after_liftoff: L(5, 's', ['Z33'], W, false, 'อ้าง SmartCockpit A330 ผ่าน Wikipedia') },
    roll: {
      p_cmd_max: L(15, 'deg/s', ['Z1', 'Z39'], W, true, 'ค่า A320; ของ A330 ไม่พบในแหล่งสาธารณะ'),
      bank_limits: L({ neutral_spiral: 33, full_stick: 67, aoa_prot: 45, hsp: 45 }, 'deg', ['Z32'], M, false, 'A330/340 FCTM: 67 deg ลดเป็น 45 deg เมื่อ HSP'),
      gains: L({ wn: 2.0, zeta: 0.8, Ki_over_Kphi: 0.5, ref_window_deg: 1 }, 'rad/s, -, -, deg', ['Z39'], W, true, ''),
    },
  },
  protections: {
    nz_limits: L({ clean: [-1.0, 2.5], slats_flaps: [0.0, 2.0] }, 'g', ['Z32', 'Z3', 'Z11'], S, false, ''),
    pitch_limits: L({ nose_up: 30, nose_up_low_speed: 25, nose_down: -15 }, 'deg', ['Z32'], M, false, 'A330/340 FCTM'),
    alpha_rule: L({ CL_amax_over_CLmax: 0.873, aprot_below_amax: 3.0, afloor_below_amax: 2.5 }, '-, deg, deg', ['Z39'], W, true, 'alpha จริงของ A330 ไม่พบ; ใช้กฎเดียวกับ A320'),
    stall_warning_alpha_max: L(23, 'deg', ['Z3', 'Z2'], S, false, 'ระดับสูงสุดที่ Mach ต่ำ ลดลงเมื่อ Mach สูงขึ้น (AF447)'),
    alpha_speed_sensitivity: L({ cruise: kt(25), approach: kt(5) }, 'm/s per deg', ['Z2'], S, false, '25 kt ต่อ 1 deg ที่ cruise, 5 kt ต่อ 1 deg ที่ approach'),
    hsp: L({ dV_on: kt(6), dM_on: 0.01, dV_nd_zero: kt(16), dM_nd_zero: 0.04 }, 'm/s, Mach', ['Z32', 'Z22'], W, false, 'FCTM: at/above VMO/MMO; ใช้ +6 kt แบบ A320'),
    hsp_dnz_max: L(0.75, 'g', ['Z32'], M, false, 'nose-up สูงสุด 1.75 g'),
  },
  alternate_law: {
    alt1_roll: L('normal', '-', ['Z2', 'Z33'], S, false, 'ALT1: roll normal, protections ลดลง'),
    alt2_roll: L('direct', '-', ['Z2'], S, false, 'ALT2: aileron และ spoiler สั่งตรง'),
    stall_warning_speed_factor: L(1.03, 'VS1g', ['Z32'], M, false, 'แทน high AoA protection'),
    airspeed_drop_trigger: L({ dCAS: kt(30), dt: 1 }, 'm/s, s', ['Z2'], S, false, 'CAS ที่โหวตตก > 30 kt ใน 1 s เข้า ALT2'),
  },
  direct_law: { autotrim: L(false, '-', ['Z3'], S, false, 'Autotrim was not available in direct law') },
  abnormal_attitude: { triggers: L({ bank_deg: 125 }, 'deg', ['Z2'], S, false, 'ตัวอย่างเงื่อนไขจาก BEA; อื่น ๆ ใช้ของ a320ceo') },
  sidestick: { travel: L({ pitch: 16, roll: 20 }, 'deg', ['Z32'], M, false, 'A330/340 FCTM') },
} } } };

const common = { common_airliner: { fbw: {
  cert_nz_limits: L({ clean: [-1.0, 2.5], high_lift: [0.0, 2.0] }, 'g', ['Z11'], S, false, 'FAA special condition ของ FBW g-limiting (EMB-550) ใช้เป็นเกณฑ์ทั่วไป', 'environment'),
  high_incidence_cert: L({ vmin_entry_rate: kt(1), icing_decel_max: kt(2), sw_margin_pct: 3, sw_margin: kt(3), full_back_stick_s: 3, turn_bank_deg: 30 }, 'm/s/s, m/s/s, %, m/s, s, deg', ['Z9', 'Z10'], S, false, 'A321neo XLR special conditions: ใช้ตั้งกรณีทดสอบ alpha protection', 'environment'),
  time_delay_budget: L(0.10, 's', ['Z36'], M, false, 'งบหน่วงเวลา Level 1 จากรอบที่ 1 หัวข้อ 6; ขั้น 240 Hz = 4.167 ms', 'sim'),
  input_mapping: L({ stick_units: '[-1, 1] หลัง deadzone + expo', expo_gamepad: 0.5, keyboard_ramp_up_per_s: 0.5, keyboard_centre_per_s: 2.5 }, '-', ['Z36'], M, false, 'ค่าจาก input ของรอบที่ 1 หัวข้อ 11', 'sim'),
} } };

const blocks = [a320ceo, a320neo, a321ceo, a321neo, a330, common];
let total = 0;
const isLeaf = (o) => o && typeof o === 'object' && 'v' in o && 'u' in o && 'scope' in o && 'src' in o;
function walk(o, path) {
  if (isLeaf(o)) {
    const keys = Object.keys(o).sort().join(',');
    if (keys !== 'conf,est,note,scope,src,u,v') throw new Error('bad leaf ' + path + ' ' + keys);
    if (!Array.isArray(o.src) || !o.src.length) throw new Error('empty src ' + path);
    if (![S, M, W].includes(o.conf)) throw new Error('bad conf ' + path);
    total++; return;
  }
  for (const [k, v] of Object.entries(o)) walk(v, path + '.' + k);
}
const md = [];
for (const b of blocks) {
  if (Object.keys(b).length !== 1) throw new Error('top-level keys');
  const before = total; walk(b, ''); const n = total - before;
  const fmt = (o, ind) => isLeaf(o) ? JSON.stringify(o) : '{\n' + Object.entries(o).map(([k, v]) => ind + ' ' + JSON.stringify(k) + ': ' + fmt(v, ind + ' ')).join(',\n') + '\n' + ind + '}';
  const txt = fmt(b, '');   // leaves on one line each
  JSON.parse(txt);
  md.push({ key: Object.keys(b)[0], n, txt });
}
for (const m of md) console.log(`<!-- ${m.key}: ${m.n} leaf -->\n\`\`\`json\n${m.txt}\n\`\`\`\n`);
console.error('blocks', md.length, 'leaves', total, md.map(m => `${m.key}:${m.n}`).join(' '));
