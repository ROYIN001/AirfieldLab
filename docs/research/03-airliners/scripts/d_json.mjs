// d_json.mjs — builds the JSON parameter blocks of topic 3.5 (prefix D) and prints them as Markdown ```json blocks.
// Every leaf: {v,u,scope,src,conf,est,note}. Run: node d_json.mjs > blocks.md
const L = (v, u, scope, src, conf, est, note) => ({ v, u, scope, src, conf, est, note });
const A = 'aircraft', G = 'gear', E = 'environment';
const turning = (max, eff, R, srcMax, confMax, noteR) => ({
  steering_angle_max: L(max, 'deg', G, srcMax, confMax, false, 'มุมล้อหน้าสูงสุด (powered steering)'),
  steering_angle_effective: L(eff, 'deg', G, srcMax, confMax, typeof eff === 'number' && srcMax.includes('D2'), 'มุมใช้งานจริงสำหรับรัศมีต่ำสุด (Airbus: max effective; Boeing: max − 3° tyre slip)'),
  min_radius_R3: L(R.R3, 'm', A, ['D6', 'D2'], 'ต่ำ', true, 'ล้อหน้า R3 = WB/sin θe; ' + noteR),
  min_radius_R4: L(R.R4, 'm', A, ['D6', 'D2'], 'ต่ำ', true, 'ปลายปีก R4 = hypot(d + b/2, Δx_tip), d = WB/tan θe; ' + noteR),
  min_radius_R5: L(R.R5, 'm', A, ['D6', 'D2'], 'ต่ำ', true, 'จมูก R5 = hypot(d, จมูกถึง MG); ' + noteR),
  min_radius_R6: L(R.R6, 'm', A, ['D6', 'D2'], 'ต่ำ', true, 'ท้ายลำตัวบนแนวกลาง R6 = hypot(d, MG ถึงท้าย); ปลายแพนหางอาจไกลกว่า; ' + noteR),
});
const out = [];
// ---------------- b737_800 ----------------
out.push({ b737_800: {
  airframe: { geometry: {
    length: L(39.47, 'm', A, ['D1'], 'สูง', false, '129 ft 6 in (ACAPS 1.3)'),
    span: L({ winglets: 35.79, no_winglets: 34.32 }, 'm', A, ['D37', 'B4'], 'สูง', false, '117 ft 5 in / 112 ft 7 in; ฝูงบินดอนเมืองควรเป็นรุ่น winglets ต้องยืนยันรายลำ'),
    height_tail: L({ OEW: 12.62, MTW: 12.37 }, 'm', A, ['D1'], 'สูง', false, 'ACAPS 2.3.2 จุด J: 41 ft 5 in / 40 ft 7 in, nominal ±3 in'),
    fuselage_width: L(3.73, 'm', A, ['D32'], 'กลาง', false, 'Jenkinson Data A Table 2'),
    wheelbase: L(15.596, 'm', A, ['D28'], 'กลาง', false, '614 in ในโมเดล FlightGear 737-800YV (≈15.6 m); ACAPS 2.2 เป็นภาพ'),
    main_track: L(5.715, 'm', A, ['D28', 'D32'], 'กลาง', false, '225 in กึ่งกลางล้อถึงกึ่งกลางล้อ; Jenkinson 5.7 m'),
    nose_to_nosegear: L(4.089, 'm STA', A, ['D28'], 'ต่ำ', false, '161 in จากจมูกในโมเดล'),
    nose_to_maingear: L(19.685, 'm STA', A, ['D28'], 'กลาง', false, '775 in; ล้อหลักอยู่ที่ 51.3 %MAC; สอดคล้องกับ [D3] (X 16.87 m) ภายใน 0.33 m'),
    eye_pos_STA: L(2.489, 'm STA', A, ['D28', 'D3'], 'ต่ำ', false, '98 in; y −20 in (−0.508 m) ที่นั่งซ้าย'),
    eye_pos_FRD: L([16.154, -0.508, -0.935], 'm FRD', A, ['D28', 'D3'], 'ต่ำ', true, 'x,y จากโมเดล; z ตั้งให้ตาสูงกว่าล้อหลักต่ำสุด (โช้คยืด) 3.84 m ตามที่ถอดจาก [D3]; โมเดลเดิม z −1.427 (สูงเกิน 0.48 m)'),
    eye_height_static: L(3.6, 'm', A, ['D3', 'D1'], 'ต่ำ', true, 'B 3.84 m ลบการยุบโช้คราว 0.2 m; ±0.3 m (11.8 ft)'),
    gsAntenna_pos_STA: L(1.50, 'm STA', A, ['D3', 'D28'], 'ต่ำ', true, 'สายอากาศอยู่หน้าล้อหลักต่ำสุด (H − H3)/tan3° = 18.03 m บนพื้น (18.19 m ตามแกนลำตัวที่ pitch 3.2°)'),
    eye_to_gsAntenna_vertical: L(1.433, 'm', A, ['D3'], 'กลาง', false, 'ระยะทางเดิน H2 = 4.7 ft (eye path ถึง ILS beam); จุดต่อจุด H4 − H3 = 4.9 ft (1.49 m)'),
    eye_to_maingear_vertical: L(4.785, 'm', A, ['D3'], 'กลาง', false, 'H4 = 15.7 ft ตาเหนือล้อ ที่ VREF flaps 30, 3°, FD pitch 3.2°, winglets; ไม่มี winglets 15.9 ft ที่ 3.4°'),
    eye_to_maingear_horizontal: L(16.87, 'm', A, ['D3'], 'กลาง', true, '(H1 − H4)/tan3° บนพื้น; ความละเอียด ±0.6 m; ตามแกนลำตัว A = 17.11 m; โมเดล 17.20 m'),
    approach_visual: L({ theta_deg: 3, pitch_deg: 3.2, H: 4.237, H1: 5.669, H2: 1.433, H3: 3.292, H4: 4.785 }, 'm (pitch deg)', A, ['D3'], 'กลาง', false, 'VREF flaps 30 winglets: 13.9/18.6/4.7/10.8/15.7 ft; no-winglet 14.2/18.8/4.7/11.0/15.9 ft pitch 3.4°; flaps 40 VREF+5 winglets (m): H 3.5 H1 5.0 H2 1.5 H3 2.5 H4 4.1 pitch 0.9°; การตั้งชื่อ H2/H3 เป็นการตีความหัวคอลัมน์'),
    turning: turning(78, 75, { R3: 16.15, R4: 22.63, R5: 20.13, R6: 20.22 }, ['D33', 'D2'], 'กลาง', 'WB 15.60, T 5.72, b 35.79, Δx_tip 5.0 (est), d_turning.mjs'),
    clearances: {
      engine_nacelle: L({ OEW: 0.64, MTW: 0.48 }, 'm', A, ['D1'], 'สูง', false, 'ACAPS 2.3.2 จุด D: 2 ft 1 in / 1 ft 7 in'),
      wingtip: L({ OEW: 3.91, MTW: 3.66 }, 'm', A, ['D1'], 'สูง', false, 'ACAPS 2.3.2 จุด E: 12 ft 10 in / 12 ft 0 in'),
      tail_at_rotation: L({ gear_extended: 11.0, gear_compressed: 9.6 }, 'deg', A, ['D15', 'D28'], 'กลาง', true, 'โช้คยืด 11.0° จาก TSIB (สูง); โช้คยุบ 9.6° ค่าประมาณจากช่วงยุบ 16 in ที่คาน 16.31 m (ต่ำ)'),
    },
    icao_code: L('4C', '-', A, ['L46', 'D37'], 'กลาง', true, 'letter C จาก span 24 ถึง < 36 m; number 4 จาก ARFL > 1800 m (หัวข้อ 2)'),
    faa_adg: L('III', '-', A, ['D26', 'D37'], 'สูง', false, 'span 79 ถึง < 118 ft และหาง 30 ถึง < 45 ft; Boeing ARC D-III'),
    ground_attitude: L(0.3, 'deg', A, ['D28'], 'ต่ำ', true, 'จากความต่าง z ของจุดสัมผัสล้อหน้า/หลักในโมเดล ถ้ายุบเท่ากัน; ให้โค้ดคำนวณเองจากสปริง'),
  } },
  gear: { geometry: {
    ref_cg: L({ STA: 18.644, pctMAC: 25, LEMAC_STA: 17.654, MAC: 3.958 }, 'm STA', A, ['D28', 'B3'], 'กลาง', true, 'AERORP 734 in "25% MAC" ในโมเดล; MAC 155.81 in ตาม TCDS (หัวข้อ 2); แนวตั้ง = z 0 ของโมเดล (CG เปล่า)'),
    nose_contact_body_extended: L([14.554, 0, 2.815], 'm FRD', A, ['D28'], 'ต่ำ', true, 'จุดล่างยางเมื่อโช้คยืด; แปลงจาก in ในโมเดล'),
    main_contact_body_extended: L([[-1.041, -2.857, 2.895], [-1.041, 2.857, 2.895]], 'm FRD', A, ['D28'], 'กลาง', true, 'ล้อหลักซ้าย/ขวา (ล้อคู่แต่ละข้างรวมเป็นจุดเดียว)'),
    cg_height_parked: L(2.7, 'm', A, ['D28'], 'ต่ำ', true, '2.895 m เมื่อโช้คยืด ลบการยุบราว 0.2 m'),
    tail_contact_body: L([-17.349, 0, -0.275], 'm FRD', A, ['D28', 'D15'], 'ต่ำ', true, 'tail skid x จากโมเดล (1417 in); z ตั้งให้หางแตะที่ 11.0° เมื่อโช้คยืด (โมเดลเดิมให้ 8.9°)'),
  } },
} });
// ---------------- a320ceo ----------------
out.push({ a320ceo: {
  airframe: { geometry: {
    length: L(37.57, 'm', A, ['D9', 'D8'], 'สูง', false, '123 ft 3 in'),
    span: L({ sharklet: 35.80, wingtip_fence: 34.10 }, 'm', A, ['D9', 'D8'], 'สูง', false, '117 ft 5 in / 111 ft 10 in; ฝูงบิน A320ceo ของ Thai AirAsia มีทั้งสองแบบ ต้องยืนยันรายลำ'),
    height_tail: L(11.76, 'm', A, ['D9'], 'สูง', false, '38 ft 7 in'),
    fuselage_width: L(3.95, 'm', A, ['D32'], 'กลาง', false, 'Jenkinson Data A Table 1'),
    wheelbase: L(12.64, 'm', A, ['D27', 'D32', 'D6'], 'กลาง', false, 'FBW 41.47 ft; Jenkinson 12.63; ASDA − TODA ใน [D6] 12.7'),
    main_track: L(7.60, 'm', A, ['D32'], 'กลาง', false, 'Jenkinson; ค่า y ของ FBW (±14 ft) ไม่ใช่ track จริง'),
    nose_to_nosegear: L(5.069, 'm STA', A, ['D27'], 'กลาง', false, '44.07 − 27.44 ft'),
    nose_to_maingear: L(17.709, 'm STA', A, ['D27'], 'กลาง', false, '44.07 + 14.03 ft; ล้อหลักที่ 58.4 %MAC'),
    eye_pos_STA: L(2.38, 'm STA', A, ['D27'], 'กลาง', true, 'FBW cameras.cfg eyepoint 43.72 ft + กล้อง Pilot −2.274 m (การตีความของผู้เขียน); y −0.57 m'),
    eye_pos_FRD: L([13.930, -0.570, -2.098], 'm FRD', A, ['D27', 'D14'], 'กลาง', true, 'CG อ้างอิง 25 %MAC (STA 16.310) และแนวตั้ง datum FBW (= ความสูง CG); ตาเหนือล้อหลัก 5.09 m ตรงกับ [D4] ที่ pitch ≈ 3.3°'),
    eye_height_static: L(4.81, 'm', A, ['D27'], 'กลาง', true, 'ตา 6.88 ft เหนือ datum ที่สูง 8.89 ft ขณะจอด (15.8 ft)'),
    eye_to_gsAntenna_vertical: L(1.86, 'm', A, ['D4'], 'กลาง', true, 'ระยะทางเดิน H1 − H (eye path ถึง ILS beam)'),
    eye_to_maingear_vertical: L(5.96, 'm', A, ['D4'], 'สูง', false, 'H4 19.5 ft; CONF FULL, MLW, VREF+5, CG 30 %, 3°; ฉบับ 2021: 6.06'),
    eye_to_maingear_horizontal: L(14.88, 'm', A, ['D4'], 'กลาง', true, '(H1 − H4)/tan3°; FBW geometry ให้ 15.04 ที่ pitch 3°'),
    approach_visual: L({ theta_deg: 3, H: 4.88, H1: 6.74, H2: 1.86, H4: 5.96 }, 'm', A, ['D4', 'D5'], 'สูง', false, 'ft: 16.0/22.1/–/19.5; Airbus ไม่ระบุ pitch; ฉบับ 2021: H 5.00 H1 6.84 H4 6.06'),
    turning: turning(75, 71.8, { R3: 13.31, R4: 22.36, R5: 18.19, R6: 20.29 }, ['D6'], 'สูง', 'WB 12.64, T 7.60, b 35.80, Δx_tip 3.65 (FBW), d_turning.mjs'),
    clearances: {
      tail_at_rotation: L({ gear_extended: 13.5, gear_compressed: 11.7 }, 'deg', A, ['L34', 'D20'], 'สูง', false, 'Safety First #05 ผ่านหัวข้อ 3'),
    },
    icao_code: L({ MTOW_upto_73t5: '3C', MTOW_above_73t5: '4C' }, '-', A, ['D7'], 'สูง', false, 'Airbus ME1911189 Issue 4.0'),
    faa_adg: L('III', '-', A, ['D7', 'D26'], 'สูง', false, 'AAC C'),
    ground_attitude: L(-0.2, 'deg', A, ['D27'], 'ต่ำ', false, 'static_pitch ของ FBW (โมเดล)'),
  } },
  gear: { geometry: {
    ref_cg: L({ STA: 16.310, pctMAC: 25, LEMAC_STA: 15.262, MAC: 4.1935 }, 'm STA', A, ['D14', 'L3'], 'สูง', true, 'LEMAC Sta 700.85 in, datum 100 in หน้าจมูก, MAC 165.10 in (FAA TCDS A28NM); CG เปล่าของ FBW 16.304 m'),
    nose_contact_body_extended: L([11.241, 0, 2.911], 'm FRD', A, ['D27', 'D14'], 'กลาง', true, 'FBW point.0 (z −9.55 ft จาก datum)'),
    main_contact_body_extended: L([[-1.399, -3.80, 2.996], [-1.399, 3.80, 2.996]], 'm FRD', A, ['D27', 'D32'], 'กลาง', true, 'x,z จาก FBW point.1/2; y = track/2 ของ Jenkinson'),
    cg_height_parked: L(2.71, 'm', A, ['D27'], 'กลาง', false, 'static_cg_height 8.89 ft ของ FBW'),
    tail_contact_body: L([-17.849, 0, -0.953], 'm FRD', A, ['D27', 'D20'], 'ต่ำ', true, 'x จากจุดขูดหาง FBW (z −68 ft); z ตั้งให้หางแตะที่ 13.5° เมื่อโช้คยืด (FBW เดิม −1.250 ให้ 14.5°)'),
  } },
} });
out.push({ a320neo: {
  airframe: { geometry: {
    span: L({ sharklet: 35.80 }, 'm', A, ['D9'], 'สูง', false, '117 ft 5 in'),
    eye_to_gsAntenna_vertical: L(1.85, 'm', A, ['D4'], 'กลาง', true, 'H1 − H'),
    eye_to_maingear_vertical: L(6.04, 'm', A, ['D4'], 'สูง', false, 'H4 19.8 ft; ฉบับ 2021: 6.36'),
    eye_to_maingear_horizontal: L(14.88, 'm', A, ['D4'], 'กลาง', true, '(6.82 − 6.04)/tan3°'),
    approach_visual: L({ theta_deg: 3, H: 4.97, H1: 6.82, H2: 1.85, H4: 6.04 }, 'm', A, ['D4', 'D5'], 'สูง', false, 'ft 16.3/22.4/–/19.8; ฉบับ 2021: H 5.33 H1 7.14 H4 6.36'),
    icao_code: L('3C', '-', A, ['D7'], 'สูง', false, 'Airbus ME1911189'),
  } },
} });
// ---------------- a321neo (full) and a321ceo (diffs) ----------------
// หัวข้อ 3.3 owns _inherits: a320neo <- a320ceo, a321neo <- a320neo, a321ceo <- a321neo.
// So a321neo must carry the full A321 geometry and a321ceo only what differs.
const A321 = {
  airframe: { geometry: {
    length: L(44.51, 'm', A, ['D9'], 'สูง', false, '146 ft 0 in'),
    span: L({ sharklet: 35.80 }, 'm', A, ['D9'], 'สูง', false, '117 ft 5 in; ปีกเดียวกับ A320neo'),
    height_tail: L(11.76, 'm', A, ['D9'], 'สูง', false, '38 ft 7 in'),
    fuselage_width: L(3.95, 'm', A, ['D32'], 'กลาง', false, 'Jenkinson'),
    wheelbase: L(16.90, 'm', A, ['D32', 'D6'], 'กลาง', false, 'ASDA − TODA ใน [D6] 16.9; จากส่วนต่อลำตัว 16.91'),
    main_track: L(7.60, 'm', A, ['D32'], 'กลาง', false, 'Jenkinson'),
    nose_to_nosegear: L(5.07, 'm STA', A, ['D27', 'L8'], 'ต่ำ', true, 'เท่ากับ A320 เพราะส่วนต่อ 4.27 m อยู่หลังล้อหน้า (ทำให้ wheelbase ได้ 16.91)'),
    nose_to_maingear: L(21.98, 'm STA', A, ['D27', 'L8'], 'กลาง', true, 'A320 17.709 + 4.27'),
    eye_pos_STA: L(2.38, 'm STA', A, ['D27'], 'กลาง', true, 'ห้องนักบินเดียวกับ A320'),
    eye_pos_FRD: L([18.198, -0.570, -2.098], 'm FRD', A, ['D27', 'L3', 'L8'], 'ต่ำ', true, 'CG อ้างอิง 25 %MAC STA 20.578 (LEMAC 19.53 ประมาณโดยหัวข้อ 3)'),
    eye_height_static: L(4.81, 'm', A, ['D27'], 'ต่ำ', true, 'สมมติเท่า A320'),
    eye_to_gsAntenna_vertical: L(1.90, 'm', A, ['D4'], 'กลาง', true, 'H1 − H'),
    eye_to_maingear_vertical: L(5.70, 'm', A, ['D4'], 'สูง', false, 'H4 18.7 ft; ฉบับ 2021: 6.11'),
    eye_to_maingear_horizontal: L(19.27, 'm', A, ['D4'], 'กลาง', true, '(6.71 − 5.70)/tan3°'),
    approach_visual: L({ theta_deg: 3, H: 4.81, H1: 6.71, H2: 1.90, H4: 5.70 }, 'm', A, ['D4', 'D5'], 'สูง', false, 'ft 15.8/22.0/–/18.7; ฉบับ 2021: H 5.25 H1 7.12 H4 6.11'),
    turning: turning(75, { low: 69.2, high: 73.1 }, { R3: { at_69_2: 18.08, at_73_1: 17.66 }, R4: { at_69_2: 24.59, at_73_1: 23.32 }, R5: { at_69_2: 22.90, at_73_1: 22.57 }, R6: { at_69_2: 23.43, at_73_1: 23.11 } }, ['D6'], 'สูง', 'WB 16.90, T 7.60, b 35.80, Δx_tip 3.65 (est); [D6] ให้มุมใช้งานสองค่าโดยไม่อธิบาย'),
    clearances: {
      tail_at_rotation: L({ gear_extended: 11.4, gear_compressed: 9.7 }, 'deg', A, ['L35', 'D21'], 'กลาง', true, 'ค่าของ A321ceo จาก AAIB 5/2001 ผ่านหัวข้อ 3 ใช้แทนจนกว่าจะพบค่าของ A321neo'),
    },
    icao_code: L('4C', '-', A, ['D7'], 'สูง', false, 'Airbus ME1911189'),
    faa_adg: L('III', '-', A, ['D7'], 'สูง', false, 'AAC C หรือ D ตาม MLW'),
    ground_attitude: L(-0.2, 'deg', A, ['D27'], 'ต่ำ', true, 'ไม่มีค่าเฉพาะของ A321 จึงใช้ static_pitch ของ A320 ใน FBW; ใส่ไว้เพื่อไม่ให้สืบค่าผ่าน a320neo โดยไม่ตั้งใจ'),
  } },
  gear: { geometry: {
    ref_cg: L({ STA: 20.578, pctMAC: 25, LEMAC_STA: 19.53, MAC: 4.1935 }, 'm STA', A, ['L3', 'L8'], 'ต่ำ', true, 'LEMAC ประมาณโดยหัวข้อ 3 (A320 + 4.27 m)'),
    nose_contact_body_extended: L([15.510, 0, 2.911], 'm FRD', A, ['D27', 'L8'], 'ต่ำ', true, 'z เท่า A320'),
    main_contact_body_extended: L([[-1.400, -3.80, 2.996], [-1.400, 3.80, 2.996]], 'm FRD', A, ['D27', 'D32'], 'ต่ำ', true, 'z เท่า A320 (ขาล้อจริงของ A321 ต่างเล็กน้อย ต้องยืนยัน)'),
    cg_height_parked: L(2.71, 'm', A, ['D27'], 'ต่ำ', true, 'สมมติเท่า A320'),
    tail_contact_body: L([-20.521, 0, -0.859], 'm FRD', A, ['D27', 'D21'], 'ต่ำ', true, 'จุดหาง A320 + ส่วนต่อหน้า 4.27 และหลัง 2.67 m; z ตั้งให้แตะที่ 11.4° เมื่อโช้คยืด; 9.7° เมื่อยุบเทียบเท่าการยุบ 0.59 m'),
  } },
};
out.push({ a321neo: A321 });
out.push({ a321ceo: {
  airframe: { geometry: {
    span: L({ sharklet: 35.80, wingtip_fence: 34.10 }, 'm', A, ['D9', 'D8'], 'สูง', false, 'ปีกเดียวกับ A320ceo (มีทั้งแบบ sharklet และ wingtip fence)'),
    eye_to_gsAntenna_vertical: L(1.89, 'm', A, ['D4'], 'กลาง', true, 'H1 − H'),
    eye_to_maingear_vertical: L(5.87, 'm', A, ['D4'], 'สูง', false, 'H4 19.2 ft'),
    eye_to_maingear_horizontal: L(19.27, 'm', A, ['D4'], 'กลาง', true, '(6.88 − 5.87)/tan3°; geometry ให้ 19.36 ที่ pitch 2.5°'),
    approach_visual: L({ theta_deg: 3, H: 4.99, H1: 6.88, H2: 1.89, H4: 5.87 }, 'm', A, ['D4', 'D5'], 'สูง', false, 'ft 16.4/22.6/–/19.2; ฉบับ 2021 เท่ากัน'),
    clearances: {
      tail_at_rotation: L({ gear_extended: 11.4, gear_compressed: 9.7 }, 'deg', A, ['L35', 'D21'], 'สูง', false, 'AAIB 5/2001 ผ่านหัวข้อ 3'),
    },
  } },
} });
// ---------------- a330_300 ----------------
out.push({ a330_300: {
  airframe: { geometry: {
    length: L(63.66, 'm', A, ['D10'], 'สูง', false, '208 ft'),
    span: L(60.30, 'm', A, ['D10'], 'สูง', false, "197 ft 10 in"),
    height_tail: L(16.79, 'm', A, ['D10'], 'สูง', false, '55 ft'),
    fuselage_width: L(5.64, 'm', A, ['D32'], 'กลาง', false, 'Jenkinson'),
    wheelbase: L(25.40, 'm', A, ['D32', 'D6'], 'กลาง', false, 'ถึงศูนย์ bogie; ASDA − TODA ใน [D6] 25.4'),
    main_track: L(10.70, 'm', A, ['D32'], 'กลาง', false, 'Jenkinson'),
    nose_to_nosegear: L(7.4, 'm STA', A, ['D4', 'D11'], 'ต่ำ', true, 'จมูกถึง MG 32.8 − WB 25.4; ±1 m; ต้องยืนยันด้วย AC 2-2-0'),
    nose_to_maingear: L(32.8, 'm STA', A, ['D4'], 'ต่ำ', true, 'ตา STA 3.4 (ประมาณ) + ระยะตาถึงล้อหลังสุด 30.0 − ครึ่งระยะเพลา bogie 1.0 (ประมาณ)'),
    eye_pos_STA: L(3.4, 'm STA', A, ['D27', 'D32'], 'ต่ำ', true, 'ขยายตำแหน่งตา A320 (2.38) ตามสัดส่วนลำตัว 5.64/3.95'),
    eye_pos_FRD: L([27.37, -0.8, -3.90], 'm FRD', A, ['D4'], 'ต่ำ', true, 'CG อ้างอิงสมมติให้ล้อหน้ารับ 8 % (x_MG = −0.08·WB); z_MG 4.1 m และ B 8.0 m (ประมาณ)'),
    eye_height_static: L(6.5, 'm', A, ['D4'], 'ต่ำ', true, 'ไม่พบ; ประมาณจาก B 7.7 ถึง 8.2 m ลบการยืดโช้คและ bogie'),
    eye_to_gsAntenna_vertical: L(2.78, 'm', A, ['D4'], 'กลาง', true, 'H1 − H'),
    eye_to_maingear_vertical: L(9.77, 'm', A, ['D4'], 'สูง', false, 'H4 32.0 ft; ฉบับ 2021: 9.24'),
    eye_to_maingear_horizontal: L(29.96, 'm', A, ['D4'], 'กลาง', true, '(11.34 − 9.77)/tan3° ถึงล้อหลังสุดของ bogie; ฉบับ 2021: 30.15'),
    approach_visual: L({ theta_deg: 3, H: 8.56, H1: 11.34, H2: 2.78, H4: 9.77 }, 'm', A, ['D4', 'D5'], 'สูง', false, 'ft 28.1/37.2/–/32.0; ฉบับ 2021: H 8.05 H1 10.82 H4 9.24'),
    turning: turning({ full: 72, reduced: 65 }, { full: 67.8, reduced: 62.1 }, { R3: { full: 27.43, reduced: 28.74 }, R4: { full: 41.73, reduced: 44.73 }, R5: { full: 34.40, reduced: 35.45 }, R6: { full: 32.55, reduced: 33.66 } }, ['D6'], 'สูง', 'WB 25.40, T 10.70, b 60.30, จมูกถึง MG 32.8 (est), Δx_tip 10 (est); TSC 13-3 ให้ pivot 46.8 ft turn radius 97.3 ft'),
    clearances: {
      tail_at_rotation: L({ event_oleos_almost_compressed: 10.4 }, 'deg', A, ['D17'], 'กลาง', false, 'ค่าจากเหตุการณ์ C-GHLM ไม่ใช่ขีดจำกัดเรขาคณิตที่ผู้ผลิตประกาศ'),
    },
    icao_code: L('4E', '-', A, ['D7'], 'สูง', false, 'Airbus ME1911189'),
    faa_adg: L('V', '-', A, ['D7', 'D26'], 'สูง', false, 'AAC C'),
  } },
  gear: { geometry: {
    ref_cg: L({ STA: 30.77, pctMAC: 25 }, 'm STA', A, ['D4'], 'ต่ำ', true, 'ไม่พบ LEMAC/MAC; สมมติล้อหน้ารับ 8 % ที่ CG อ้างอิง'),
    nose_contact_body_extended: L([23.368, 0, 4.0], 'm FRD', A, ['D32'], 'ต่ำ', true, 'x = x_MG + WB; z ประมาณ'),
    main_contact_body_extended: L([[-2.032, -5.35, 4.1], [-2.032, 5.35, 4.1]], 'm FRD', A, ['D32'], 'ต่ำ', true, 'ศูนย์ bogie สี่ล้อ; ล้อหลังของ bogie ต่ำสุดในอากาศ (หัวข้อ 4 จำลอง bogie)'),
    cg_height_parked: L(3.6, 'm', A, ['D10'], 'ต่ำ', true, 'สัดส่วนจาก A320 (2.71 m) ตามความสูงลำตัว'),
  } },
} });
// ---------------- atr72_600 ----------------
out.push({ atr72_600: {
  airframe: { geometry: {
    length: L(27.166, 'm', A, ['D12'], 'กลาง', false, '89 ft 1.5 in; ป้ายในภาพผู้เขียนจับคู่เอง'),
    span: L(27.050, 'm', A, ['D12'], 'กลาง', false, '88 ft 9 in'),
    height_tail: L(7.65, 'm', A, ['D12'], 'กลาง', false, '25 ft 1 in'),
    wheelbase: L(10.77, 'm', A, ['D12'], 'กลาง', false, '35 ft 4 in'),
    main_track: L(4.10, 'm', A, ['D12'], 'กลาง', false, '13 ft 5 in'),
    nose_to_nosegear: L(2.9, 'm STA', A, ['D12'], 'ต่ำ', true, 'ไม่พบ; ประมาณจากภาพด้านข้าง ±0.4 m'),
    nose_to_maingear: L(13.7, 'm STA', A, ['D12'], 'ต่ำ', true, 'จมูกถึง NG บวก WB'),
    eye_pos_STA: L(2.6, 'm STA', A, ['D12'], 'ต่ำ', true, 'ไม่พบ; ±0.3 m'),
    eye_pos_FRD: L([10.24, -0.45, -0.85], 'm FRD', A, ['D12'], 'ต่ำ', true, 'CG อ้างอิงสมมติล้อหน้ารับ 8 %; z_MG 1.8, B 2.65 (ประมาณ)'),
    eye_height_static: L(2.5, 'm', A, ['D12'], 'ต่ำ', true, 'ไม่พบ; ±0.3 m'),
    eye_to_gsAntenna_vertical: L(0.89, 'm', A, ['D12'], 'ต่ำ', true, 'สมมติสายอากาศในจมูก ต่ำกว่าตา 1.0 m หน้าตา 2.1 m'),
    eye_to_maingear_vertical: L(2.65, 'm', A, ['D19'], 'ต่ำ', true, 'pitch approach ≈ 0° (FCTM: 2.5° ก้มถึง 1° เงย)'),
    eye_to_maingear_horizontal: L(11.1, 'm', A, ['D12'], 'ต่ำ', true, '13.7 − 2.6'),
    approach_visual: L({ theta_deg: 3, pitch_deg: 0, H: 2.3, H1: 3.2, H2: 0.9, H4: 2.65 }, 'm (pitch deg)', A, ['D19', 'D12'], 'ต่ำ', true, 'ค่าประมาณทั้งหมด H1 ช่วง 2.7 ถึง 3.7 m'),
    turning: turning(60, 57, { R3: 12.84, R4: 20.52, R5: 15.38, R6: 15.18 }, ['D31'], 'ต่ำ', 'มุมเลี้ยวไม่พบ (FlightGear ตั้ง 70°) ใช้ 60/57 (est); WB 10.77, T 4.10, b 27.05'),
    clearances: {
      tail_at_rotation: L({ gear_extended: 8.0, gear_compressed: 5.9 }, 'deg', A, ['D19', 'D18'], 'สูง', false, 'BEA F-OZKN §3.1'),
      propeller_tip: L(0.835, 'm', A, ['D12'], 'ต่ำ', false, 'ตัวเลข 2 ft 8.9 in ในภาพ factsheet ที่ไม่มีป้าย ผู้เขียนตีความว่าเป็นระยะปลายใบพัดถึงพื้น'),
    },
    icao_code: L('3C', '-', A, ['L46', 'D12'], 'ต่ำ', true, 'letter C จาก span; number 3 ถ้า ARFL < 1800 m (ยืนยันกับหัวข้อ 1)'),
    faa_adg: L('III', '-', A, ['D26'], 'กลาง', true, 'span 88.7 ft (III), หาง 25.1 ft (II)'),
  } },
  gear: { geometry: {
    ref_cg: L({ STA: 12.84, pctMAC: 25 }, 'm STA', A, ['D12'], 'ต่ำ', true, 'ไม่พบ LEMAC (TCDS: Refer to Weight and Balance Manual); สมมติล้อหน้ารับ 8 %'),
    nose_contact_body_extended: L([9.91, 0, 1.75], 'm FRD', A, ['D12'], 'ต่ำ', true, 'ประมาณ'),
    main_contact_body_extended: L([[-0.86, -2.05, 1.80], [-0.86, 2.05, 1.80]], 'm FRD', A, ['D12'], 'ต่ำ', true, 'ประมาณ'),
    cg_height_parked: L(1.65, 'm', A, ['D12'], 'ต่ำ', true, 'ประมาณ'),
  } },
} });
// ---------------- common_airliner.visual ----------------
out.push({ common_airliner: { visual: {
  papi_unit_settings_deg: L([2.5, 2.8333, 3.1667, 3.5], 'deg', E, ['D40', 'D24'], 'สูง', false, 'PAPI 3° มาตรฐาน 2°30′, 2°50′, 3°10′, 3°30′ (หน่วยนอกถึงในตามที่ repo ใช้)'),
  on_slope_band_deg: L({ lower: 2.8333, upper: 3.1667 }, 'deg', E, ['D24', 'D23'], 'สูง', false, '2 ขาว 2 แดง'),
  meht_angle_M_deg: L({ icao_tc_B_minus_2arcmin: 2.8, stac_check_theta_minus_10arcmin: 2.8333 }, 'deg', E, ['D23', 'D24'], 'กลาง', false, 'TC: M = B − 2′ = 2°48′; STAC ใช้ θ − 10′ = 2°50′ ในการตรวจ; repo ใช้ 2°50′'),
  icao_wheel_clearance_table: L({ axes: { ewh_upper_m: [3, 5, 8, 14] }, data: [[6, 3], [9, 4], [9, 5], [9, 6]] }, 'm', E, ['D24', 'D23', 'D25'], 'สูง', false, 'โครงสร้าง ICAO Annex 14 Table 5-2: [desired, minimum] wheel clearance over threshold ต่อกลุ่ม EWH (< 3, 3 ถึง < 5, 5 ถึง < 8, 8 ถึง < 14 m); อ่านผ่าน STAC §5.3.2'),
  canada_tp312_groups: L({ axes: { ewh_upper_m: [3, 7.5, 14] }, data: [[6, 3, 6], [9, 4.5, 12], [9, 6, 20]] }, 'm', E, ['D23'], 'สูง', false, '[desired WTH, minimum WTH, MEHT] ของ AP/P1, P2, P3'),
  faa_visual_tch_height_groups: L({ axes: { group: [1, 2, 3, 4] }, data: [[3.048, 12.19], [4.572, 13.72], [6.096, 15.24], [7.62, 22.86]] }, 'm', E, ['D22'], 'สูง', false, '[cockpit-to-wheel, VTCH]: ≤10 ft/40 ft, 15/45, 20/50, >25/75 ft; tolerance +5/−20 ft (HG1-2), +5/−15 ft (HG3-4)'),
  faa_papi_gs_colocation_tol: L({ same_distance_tol: 9.144, hg4_extra: 91.44 }, 'm', E, ['D22'], 'สูง', false, '±30 ft ของ virtual source ของ GS; Height Group 4 เพิ่ม 300 ft (+50/−0 ft)'),
  ils_tch_typical: L({ nominal: 15.24, min: 12.19, max: 18.29 }, 'm', E, ['D23'], 'กลาง', false, '50 ft ปกติ ช่วง 40 ถึง 60 ft (Transport Canada)'),
  vtbd_papi_distance_est: L({ '03L': 440, '21R': 405, '03R': 390, '21L': 395 }, 'm', E, ['D35', 'D36', 'D40'], 'ต่ำ', true, 'MEHT/tan 2°50′ ปัด 5 m ตาม repo; ถ้าใช้ 2°48′: 447.8/407.7/394.8/397.7 m; AIP ไม่ประกาศระยะ'),
  vtbd_meht: L({ '03L': 21.90, '21R': 19.94, '03R': 19.31, '21L': 19.45 }, 'm', E, ['D35', 'D36'], 'สูง', false, '71.85/65.42/63.35/63.81 ft'),
  vtbd_ils_rdh: L({ '03L': 16.76, '21R': 16.46, '03R': 15.24, '21L': 16.15 }, 'm', E, ['D35', 'D36'], 'สูง', false, '55/54/53 ft ILS; 03R RNP TCH 50 ft เป็นค่าสมมติของ repo (ต่ำ)'),
  vtbd_harmonisation_offset_needed: L({ '03L': 6.30, '21R': 4.77, '03R': 5.20, '21L': 4.55 }, 'm', E, ['D35', 'D23'], 'ต่ำ', true, '(D_PAPI − RDH/tan3°)·tan3°: ระยะตาเหนือ beam ที่ทำให้ PAPI ตรงกับ ILS; เครื่องจริงมี 0.9 ถึง 2.8 m'),
} } });
// Printer: one leaf per line (compact inside the leaf), nested objects indented by one space per level.
const isLeaf = (o) => o && typeof o === "object" && !Array.isArray(o) && "v" in o && "conf" in o;
const pr = (o, ind) => isLeaf(o) ? JSON.stringify(o)
  : "{\n" + Object.keys(o).map((k) => ind + " " + JSON.stringify(k) + ": " + pr(o[k], ind + " ")).join(",\n") + "\n" + ind + "}";
for (const b of out) console.log("```json\n" + pr(b, "") + "\n```\n");
