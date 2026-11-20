// j_json.mjs — builds the JSON parameter blocks of หัวข้อ 3.6 (one top-level key per block) and validates leaf shape.
// Output: j_json_out.md (markdown ```json blocks) — pasted into the section file.
import fs from 'fs';
const L = (v, u, scope, src, conf, est, note) => ({ v, u, scope, src, conf, est, note });
const E = 'engine', A = 'aircraft', S = 'sim';
// ---------- shared spool / idle / reverser defaults (round 1 structure; est) ----------
const spool = (o = {}) => ({
  thrustExp_k: L(2, '-', E, ['J23', 'J23'], 'กลาง', true, 'F = Fidle + (Frated - Fidle) n^k ตาม JSBSim FGTurbine; คงค่ารอบที่ 1'),
  tau2_s: L(o.tau2 ?? 0.35, 's', E, ['J19'], 'ต่ำ', true, 'ค่าคงที่เวลาสัญญาณเล็กของ N2 ปรับในรอบที่ 1 (f5_spool_tune.mjs)'),
  Racc_pctps: L(o.Racc ?? 18, '%N2/s', E, ['J13', 'J19'], 'ต่ำ', true, o.RaccNote ?? 'ขีดอัตราเร่ง N2 สูงสุด เลือกให้ FI ถึง 95% ≤ 5 s ตาม 14 CFR 33.73(b) (j_spool.mjs)'),
  accShape_a: L(6, '-', E, ['J23'], 'ต่ำ', true, 'รูปร่าง accel schedule 1/(1 + a(1 - ñ)^3)'),
  Rdec_pctps: L(o.Rdec ?? 16, '%N2/s', E, ['J19'], 'ต่ำ', true, 'ขีดอัตราลด N2'),
  altExp: L(1, '-', E, ['J19'], 'ต่ำ', true, 'ตัวคูณอัตรา δt^e ตามความสูง'),
  tauFan_s: L(o.tauF ?? 0.25, 's', E, ['J19'], 'ต่ำ', true, o.tauFNote ?? 'lag ของพัดลม'),
  idleFrac0: L(o.idle0 ?? 0.05, '-', E, ['J23', 'J8'], 'ต่ำ', true, 'net idle ต่อ F00 ที่ static SL (EEDB 7% เป็นจุดทดสอบ ไม่ใช่ idle จริง)'),
  idleMach0: L(0.5, '-', E, ['J23'], 'ต่ำ', true, 'Mach ที่ net idle = 0'),
});
const rev = (type, src, conf, note, o = {}) => ({
  revType: L({ type }, '-', E, src, conf, false, note),
  rev_c0: L(0.30, '-', E, ['J18', 'J22'], 'ต่ำ', true, 'Frev = F00 (c0 + c1 M)[ρi + (1 - ρi)φ] ปรับจาก LDF ของ AC 91-79B ในรอบที่ 1'),
  rev_c1: L(1.0, '1/Mach', E, ['J18'], 'ต่ำ', true, 'ดู rev_c0'),
  rev_uMax: L(0.70, '-', E, ['J22'], 'ต่ำ', true, 'thrust demand สูงสุดในโหมด reverse'),
  rev_idleFrac: L(0.10, '-', E, ['J20'], 'ต่ำ', true, 'reverse idle ให้แรงน้อยมาก (FAA AFH)'),
  rev_deploy_s: L(o.dep ?? 2.0, 's', E, ['J44', 'J17'], 'ต่ำ', true, o.depNote ?? 'เวลาจาก stowed ถึง deployed (ไม่พบในแหล่งสาธารณะ) REV สีเขียวที่ s ≥ 0.9 = 1.8 s'),
  rev_stow_s: L(o.stow ?? 2.5, 's', E, ['J17'], 'ต่ำ', true, 'เวลาจาก deployed ถึง stowed (ค่าประมาณ)'),
});
// ---------- per-class engine data ----------
const C7B26 = {
  F00: L(116990, 'N', E, ['J1', 'J9'], 'สูง', false, 'take-off 11,699 daN (26,300 lbf) EASA E.004 III.6; EEDB 8CM065 = 117.0 kN'),
  MCT: L(115210, 'N', E, ['J1'], 'สูง', false, 'max continuous 11,521 daN (25,900 lbf)'),
  bpr: L(5.1, '-', E, ['J9', 'J28'], 'กลาง', false, 'EEDB 8CM065 (7B26/3) 5.1'),
  opr: L(27.7, '-', E, ['J9'], 'กลาง', false, 'EEDB 8CM065'),
  ffLTO: L([1.213, 0.986, 0.331, 0.108], 'kg/s', E, ['J9', 'J8'], 'กลาง', false, 'TO/CO/App/Idle (100/85/30/7%) EEDB 8CM065 ผ่าน OpenAP; EASA เตือนว่าไม่ใช่ข้อมูลเปรียบเทียบ fuel efficiency'),
  ffQuad: L([0.0425, 0.6716, 0.2828], '-', E, ['J9'], 'กลาง', true, 'FF/FF_TO = c0 + c1 x + c2 x^2 (x = F/F00) least squares ผ่าน 4 จุด EEDB, max|res| 0.0048 (j_ratings.mjs)'),
  eedbUid: L('8CM065', '-', E, ['J8', 'J9'], 'สูง', false, 'CFM56-7B26/3; 7B26E = 11CM072 ค่าเดียวกัน'),
  N1_100_rpm: L(5175, 'rpm', E, ['J1'], 'สูง', true, 'คำนวณ 5,382 rpm ÷ 1.04 (N1 สูงสุด 104%)'),
  N1_max_pct: L(104, '%N1', E, ['J1'], 'สูง', false, '5,382 rpm'),
  N2_100_rpm: L(14460, 'rpm', E, ['J1'], 'สูง', true, '15,183 rpm ÷ 1.05'),
  N2_max_pct: L(105, '%N2', E, ['J1'], 'สูง', false, '15,183 rpm'),
  EGT_limits_C: L({ takeoff: 950, maxContinuous: 925, start: 725, transientTO_20s: 960 }, 'degC', E, ['J1'], 'สูง', false, 'EGT แสดงผล (T49.5) E.004 IV.1.1'),
  Tflat_C: L(30, 'degC', E, ['J26'], 'กลาง', false, 'flat rate 30 °C (ISA+15) ตาม Aircraft Commerce; TCDS เขียนเพียง "Sea level corner point conditions"'),
  kT_perK: L(0.0065, '1/K', E, ['J33'], 'ต่ำ', true, 'จาก ATSB AO-2014-162: assumed temp 35 เป็น 51 °C ทำให้ N1 93.1 เป็น 88.4% ถ้า F ∝ N1^2–2.5 ได้ 0.0062–0.0076/K (j_ratings.mjs)'),
  mass_dry_kg: L(2386, 'kg', E, ['J1'], 'สูง', false, 'SAC; DAC 2,431; E 2,395'),
  fan_diameter_m: L(1.549, 'm', E, ['J28', 'J26'], 'กลาง', false, '61 in'),
  length_m: L(2.508, 'm', E, ['J1'], 'สูง', false, 'E.004 III.4'),
  N1_GI_pct: L(20, '%N1', E, ['J23'], 'ต่ำ', true, 'สำหรับ N1 display; ไม่พบค่าจริงในแหล่งสาธารณะ'),
  N2_GI_pct: L(58, '%N2', E, ['J43', 'J1'], 'ต่ำ', false, 'ground min idle 58% N2 เมื่อ TAT < 52 °C (66% เมื่อร้อนกว่า) สอดคล้อง N2 ต่ำสุดใน icing 58.8% ของ TCDS'),
  N2_FI_pct: L(61, '%N2', E, ['J54'], 'ต่ำ', true, 'flight min idle (ค่าประมาณ รอบที่ 1)'),
  N2_AI_pct: L(72, '%N2', E, ['J43'], 'ต่ำ', false, 'approach idle "72 – 79%" N2 ใช้ขอบล่าง (เอกสารฝึกอบรมไม่เป็นทางการ)'),
  ...spool(),
  ...rev('cascade (translating sleeve + blocker doors, fan stream)', ['J1', 'J28'], 'กลาง', 'Boeing reverser P/N 315A2295; "blocker doors and cascade vanes"'),
};
const C7B27 = {
  inherits: L({ from: 'CFM56_7B26_class' }, '-', E, ['J1'], 'สูง', false, 'ฮาร์ดแวร์เดียวกัน ต่างที่ rating'),
  F00: L(121430, 'N', E, ['J1', 'J9'], 'สูง', false, '12,143 daN (27,300 lbf); EEDB 8CM066 121.4 kN'),
  MCT: L(115210, 'N', E, ['J1'], 'สูง', false, '11,521 daN'),
  bpr: L(5.1, '-', E, ['J9'], 'กลาง', false, 'EEDB 8CM066 (7B27 เดิม 3CM034 = 5.0)'),
  opr: L(29.0, '-', E, ['J9'], 'กลาง', false, 'EEDB 8CM066'),
  ffLTO: L([1.293, 1.031, 0.343, 0.110], 'kg/s', E, ['J9'], 'กลาง', false, 'EEDB 8CM066'),
  ffQuad: L([0.0448, 0.6081, 0.3404], '-', E, ['J9'], 'กลาง', true, 'max|res| 0.0102'),
};
const C7B24 = {
  inherits: L({ from: 'CFM56_7B26_class' }, '-', E, ['J1'], 'สูง', false, 'ฮาร์ดแวร์เดียวกัน ต่างที่ rating'),
  F00: L(107650, 'N', E, ['J1', 'J9'], 'สูง', false, '10,765 daN (24,200 lbf)'),
  MCT: L(101420, 'N', E, ['J1'], 'สูง', false, '10,142 daN'),
  bpr: L(5.3, '-', E, ['J9', 'J28'], 'กลาง', false, 'EEDB 8CM064'),
  opr: L(25.6, '-', E, ['J9'], 'กลาง', false, 'EEDB 8CM064'),
  ffLTO: L([1.086, 0.895, 0.308, 0.103], 'kg/s', E, ['J9'], 'กลาง', false, 'EEDB 8CM064'),
};
const C5B6 = {
  F00: L(104530, 'N', E, ['J5', 'J9'], 'สูง', false, '23,500 lbf (10,453 daN) FAA E37NE; EEDB 8CM057 104.5 kN'),
  MCT: L(90080, 'N', E, ['J5'], 'สูง', false, '20,250 lbf (9,008 daN)'),
  bpr: L(5.9, '-', E, ['J9'], 'กลาง', false, 'EEDB 8CM057 (5B6/3); /P = 6.0'),
  opr: L(24.3, '-', E, ['J9'], 'กลาง', false, 'EEDB 8CM057'),
  ffLTO: L([0.965, 0.800, 0.279, 0.095], 'kg/s', E, ['J9'], 'กลาง', false, 'EEDB 8CM057 (5B6/3)'),
  ffQuad: L([0.0455, 0.7480, 0.2059], '-', E, ['J9'], 'กลาง', true, 'max|res| 0.0010'),
  eedbUid: L('8CM057', '-', E, ['J9'], 'สูง', false, 'CFM56-5B6/3; /P = 3CM028'),
  N1_100_rpm: L(5000, 'rpm', E, ['J5'], 'สูง', true, '5,200 rpm ÷ 1.04 (N1 สูงสุดทุกรุ่น 5B)'),
  N1_max_pct: L(104, '%N1', E, ['J5'], 'สูง', false, '5,200 rpm'),
  N2_100_rpm: L(14460, 'rpm', E, ['J5'], 'กลาง', true, 'ช่อง 5B ใน E37NE เป็น "- -" จึงอนุมานว่า 15,183 rpm = 105%'),
  N2_max_pct: L(105, '%N2', E, ['J5'], 'กลาง', false, 'อนุมานจาก "- -"'),
  EGT_limits_C: L({ takeoff: 950, maxContinuous: 915, start: 725 }, 'degC', E, ['J5', 'J27'], 'กลาง', false, 'SAC; รุ่น /P จริงต่ำกว่าค่าแสดง 10 °C (Note 17) redline /P 940'),
  Tflat_C: L(45, 'degC', E, ['J5', 'J27'], 'สูง', false, 'Note 4: Std + 30 °C (45 °C, 113 °F) สำหรับ -5B6, -5B6/P, -5B6/2P, -5B6/3; MCT 25 °C'),
  kT_perK: L(0.0065, '1/K', E, ['J33'], 'ต่ำ', true, 'ใช้ค่าเดียวกับ 7B (ไม่มีข้อมูลรายรุ่น)'),
  mass_dry_kg: L(2455.2, 'kg', E, ['J5'], 'สูง', false, '/P 5,412.9 lb; /2P 2,500.6 kg'),
  fan_diameter_m: L(1.735, 'm', E, ['J27'], 'ต่ำ', true, '68.3 in ซึ่งแหล่งระบุให้ CFM56-5A; สมมติว่า 5B ใช้พัดลมขนาดเดียวกัน'),
  N1_GI_pct: L(18.9, '%N1', E, ['J24'], 'ต่ำ', true, 'FlightGear idlen1 (ค่าของโมเดลเปิด)'),
  N2_GI_pct: L(59.4, '%N2', E, ['J24'], 'ต่ำ', true, 'FlightGear idlen2'),
  N2_FI_pct: L(61, '%N2', E, ['J54'], 'ต่ำ', true, 'ค่าประมาณ'),
  N2_AI_pct: L(69, '%N2', E, ['J55'], 'ต่ำ', true, 'ค่าประมาณรอบที่ 1'),
  ...spool(),
  ...rev('pivoting door (4 doors, fan stream)', ['J40', 'J22'], 'กลาง', 'AD F-2001-361R1: "all 4 thrust reverser pivot doors" (CFM56-5A บน A320 nacelle ตระกูลเดียวกัน)'),
};
const C5B4 = {
  inherits: L({ from: 'CFM56_5B6_class' }, '-', E, ['J5'], 'สูง', false, 'ฮาร์ดแวร์ 5B เดียวกัน'),
  F00: L(120100, 'N', E, ['J5', 'J9'], 'สูง', false, '27,000 lbf (12,010 daN); EEDB 3CM026/8CM055'),
  MCT: L(108400, 'N', E, ['J5'], 'สูง', false, '24,370 lb (10,840 daN)'),
  bpr: L(5.7, '-', E, ['J9'], 'กลาง', false, 'EEDB 8CM055 (5B4/3); /P = 5.9'),
  opr: L(27.3, '-', E, ['J9'], 'กลาง', false, 'EEDB 8CM055'),
  ffLTO: L([1.142, 0.939, 0.316, 0.102], 'kg/s', E, ['J9'], 'กลาง', false, 'EEDB 8CM055'),
  Tflat_C: L(45, 'degC', E, ['J5'], 'สูง', false, 'Std + 30 °C; รุ่น /P1, /2P1, /3B1 ถึง 50 °C'),
};
const C5B3 = {
  inherits: L({ from: 'CFM56_5B6_class' }, '-', E, ['J5'], 'สูง', false, 'ฮาร์ดแวร์ 5B เดียวกัน'),
  F00: L(142340, 'N', E, ['J5', 'J9'], 'สูง', false, '32,000 lbf (14,234 daN); EEDB 3CM025 142.35 kN'),
  MCT: L(129400, 'N', E, ['J5'], 'สูง', false, '29,090 lb (12,940 daN)'),
  bpr: L(5.4, '-', E, ['J9'], 'กลาง', false, 'EEDB 8CM054 (5B3/3); /P = 5.6'),
  opr: L(32.6, '-', E, ['J9'], 'กลาง', false, 'EEDB 8CM054'),
  ffLTO: L([1.462, 1.153, 0.369, 0.113], 'kg/s', E, ['J9'], 'กลาง', false, 'EEDB 8CM054'),
  ffQuad: L([0.0404, 0.5622, 0.3899], '-', E, ['J9'], 'กลาง', true, 'max|res| 0.0113'),
  Tflat_C: L(30, 'degC', E, ['J5', 'J27'], 'สูง', false, 'Std + 15 °C (5B3/P, /2P, /3)'),
};
const CL26 = {
  F00: L(120640, 'N', E, ['J3', 'J2', 'J9'], 'สูง', false, '27,120 lbf (12,064 daN); EEDB 20CM089 120.6 kN'),
  MCT: L(118680, 'N', E, ['J3'], 'สูง', false, '26,680 lb (11,868 daN), flat 25 °C'),
  bpr: L(11.1, '-', E, ['J9'], 'กลาง', false, 'EEDB 20CM089'),
  opr: L(33.3, '-', E, ['J9'], 'กลาง', false, 'EEDB 20CM089'),
  ffLTO: L([0.861, 0.710, 0.244, 0.091], 'kg/s', E, ['J9'], 'กลาง', false, 'EEDB 20CM089'),
  ffQuad: L([0.0571, 0.6742, 0.2689], '-', E, ['J9'], 'กลาง', true, 'max|res| 0.0002'),
  eedbUid: L('20CM089', '-', E, ['J9'], 'สูง', false, 'LEAP-1A26/26E1'),
  N1_100_rpm: L(3856, 'rpm', E, ['J2'], 'สูง', false, 'E.110 IV.2.1'),
  N1_max_pct: L(101, '%N1', E, ['J2', 'J3'], 'สูง', false, '3,894 rpm'),
  N2_100_rpm: L(16645, 'rpm', E, ['J2', 'J3'], 'สูง', false, '"100% core speed = 16,645 RPM"'),
  N2_max_pct: L(116.5, '%N2', E, ['J2', 'J3'], 'สูง', false, '19,391 rpm'),
  EGT_limits_C: L({ takeoff: 1060, maxContinuous: 1025, start: 750, transient30s: 1065 }, 'degC', E, ['J2', 'J4'], 'สูง', false, 'start 800 หลัง S/B 73-0034'),
  Tflat_C: L(44, 'degC', E, ['J3'], 'กลาง', false, 'FAA E00089EN Rev 1: 1A26 flat 111 °F (44 °C); 1A26E1 49 °C; รุ่นอื่น Std+15'),
  kT_perK: L(0.0065, '1/K', E, ['J33'], 'ต่ำ', true, 'ไม่มีข้อมูลรายรุ่น'),
  mass_kg: L(2990, 'kg', E, ['J2', 'J4'], 'สูง', false, 'รวม fluids (G01); G02 ขึ้นไป 3,008 kg'),
  fan_diameter_m: L(1.981, 'm', E, ['J29'], 'กลาง', false, '78 in'),
  length_m: L(3.328, 'm', E, ['J2'], 'สูง', false, 'E.110 III.4'),
  goAround: L({ GA_le_TO: true, MCT_le_GA: true }, '-', E, ['J2'], 'สูง', false, '"available Go-Around thrust is less than or equal to rated Take-Off thrust"'),
  N1_GI_pct: L(18, '%N1', E, ['J54'], 'ต่ำ', true, 'รอบที่ 1'),
  N2_GI_pct: L(57, '%N2', E, ['J54'], 'ต่ำ', true, 'รอบที่ 1 (FlightGear ใช้ 59.4 ซึ่งคัดลอกจาก CFM56)'),
  N2_FI_pct: L(59, '%N2', E, ['J54'], 'ต่ำ', true, 'รอบที่ 1'),
  N2_AI_pct: L(68, '%N2', E, ['J55'], 'ต่ำ', true, 'รอบที่ 1'),
  ...spool({ Rdec: 15, tauF: 0.30, idle0: 0.045, tauFNote: 'พัดลมใหญ่ 78 in จึง lag มากกว่า CFM56' }),
  ...rev('cascade (translating, Aircelle/Safran)', ['J2', 'J30'], 'สูง', 'E.110 Note VI.5 P/N BDL0011-12-0 / BDL0051-12-0; Safran "Cascade thrust reversers"'),
};
const CL32 = {
  inherits: L({ from: 'LEAP_1A26_class' }, '-', E, ['J2'], 'สูง', false, 'ตระกูล LEAP-1A เดียวกัน'),
  F00: L(143050, 'N', E, ['J3', 'J9'], 'สูง', false, '32,160 lbf (14,305 daN); EEDB 20CM090 (1A35A/33/33B2/32/30) 143.1 kN'),
  MCT: L(140960, 'N', E, ['J3'], 'สูง', false, '31,690 lb (14,096 daN)'),
  bpr: L(10.5, '-', E, ['J9'], 'กลาง', false, 'EEDB 20CM090'),
  opr: L(38.5, '-', E, ['J9'], 'กลาง', false, 'EEDB 20CM090'),
  ffLTO: L([1.062, 0.869, 0.284, 0.098], 'kg/s', E, ['J9'], 'กลาง', false, 'EEDB 20CM090'),
  ffQuad: L([0.0452, 0.6498, 0.3052], '-', E, ['J9'], 'กลาง', true, 'max|res| 0.0003'),
  Tflat_C: L(30, 'degC', E, ['J3'], 'กลาง', false, 'Std + 15 °C; 1A33 ตาราง "- -" เท่ากับ 1A35A แต่ Note 5 ว่า 1A33 "higher thrust rating" (ขัดแย้ง)'),
};
const CT772B = {
  F00: L(316300, 'N', E, ['J6'], 'สูง', false, 'net take-off 316.3 kN (71,100 lbf); equivalent bare engine 320.3 kN (72,000 lbf) = EEDB rated output'),
  F00bare: L(320300, 'N', E, ['J6', 'J9'], 'สูง', false, 'ใช้คำนวณ TSFC จาก EEDB'),
  MCT: L(282700, 'N', E, ['J6'], 'สูง', false, '63,560 lbf'),
  bpr: L(5.0, '-', E, ['J31', 'J9'], 'กลาง', false, 'RR poster ผ่าน Wikipedia 5.0; EEDB 14RR071 5.03'),
  opr: L(36.3, '-', E, ['J9'], 'กลาง', false, 'EEDB 14RR071'),
  ffLTO: L([3.139, 2.530, 0.821, 0.270], 'kg/s', E, ['J9'], 'กลาง', false, 'EEDB 14RR071 (Trent 772)'),
  ffQuad: L([0.0431, 0.6153, 0.3386], '-', E, ['J9'], 'กลาง', true, 'max|res| 0.0047'),
  eedbUid: L('14RR071', '-', E, ['J9'], 'กลาง', false, '"Trent 772" ใน OpenAP; ไม่แยก 772B'),
  spools: L(3, '-', E, ['J32', 'J6'], 'สูง', false, 'three-spool; โมเดลใช้ N2 ของโมเดล = HP (N3) และ N1 = LP'),
  N1_100_rpm: L(3900, 'rpm', E, ['J6'], 'สูง', false, 'LP; N2(IP) 100% = 7,000 rpm; N3(HP) 100% = 10,611 rpm'),
  N1_max_pct: L(99.0, '%N1', E, ['J6'], 'สูง', false, 'take-off 5 min; MCT 98.2%'),
  N3_max_pct: L(100.0, '%N3', E, ['J6'], 'สูง', false, 'HP take-off; MCT 99.1%; IP 103.3%'),
  TGT_limits_C: L({ takeoff: 900, maxContinuous: 850, start: 700, overtemp20s: 920 }, 'degC', E, ['J6'], 'สูง', false, 'Trent ใช้ TGT ไม่ใช่ EGT'),
  Tflat_C: L(30, 'degC', E, ['J6'], 'กลาง', true, 'อนุมานจาก Note VI.12 (772B ต่างจาก 772 เมื่อ > ISA+15)'),
  hotBump_max: L(0.054, '-', E, ['J6'], 'สูง', false, 'Note VI.12: 772B-60 เพิ่มแรงขับ take-off เมื่อ > ISA+15 °C หรือ 610–2,440 m สูงสุด 5.4%; โมเดล: Θ = 1 - kT·ΔT + min(0.054, kT·ΔT)'),
  kT_perK: L(0.0065, '1/K', E, ['J33'], 'ต่ำ', true, 'ไม่มีข้อมูลรายรุ่น'),
  mass_dry_kg: L(6160, 'kg', E, ['J6'], 'สูง', false, 'ไม่รวม fluids และ nacelle EBU'),
  fan_diameter_m: L(2.47, 'm', E, ['J31'], 'กลาง', false, '97.4 in'),
  length_m: L(5.639, 'm', E, ['J6'], 'สูง', false, 'spinner ถึงท้าย CNA'),
  N1_GI_pct: L(22.7, '%N1', E, ['J25'], 'ต่ำ', true, 'FlightGear idlen1'),
  N2_GI_pct: L(62.4, '%N2', E, ['J25'], 'ต่ำ', true, 'FlightGear idlen2 (ใช้เป็น HP ของโมเดล)'),
  N2_FI_pct: L(64, '%N2', E, ['J25'], 'ต่ำ', true, 'ค่าประมาณ'),
  N2_AI_pct: L(72, '%N2', E, ['J25'], 'ต่ำ', true, 'ค่าประมาณ'),
  ...spool({ Racc: 17, Rdec: 14, tauF: 0.40, RaccNote: 'เลือก 17 ให้ FI ถึง 95% = 4.85 s (16 ได้ 5.07 s เกิน 33.73(b))', tauFNote: 'พัดลม 2.47 m (ค่าประมาณ)' }),
  ...rev('cascade in C-duct (fan stream)', ['J41', 'J6'], 'ต่ำ', 'FAA AD 2005: "the C-duct of the thrust reverser on Rolls-Royce engines"; TRU อยู่ใน engine DIS; ชนิดละเอียดไม่พบในแหล่งสาธารณะ', { dep: 2.5, stow: 3.0, depNote: 'ค่าประมาณ (เครื่องใหญ่กว่า)' }),
};
// ---------- per-type common leaves ----------
const reverserB = { cancel_kt: L(30.87, 'm/s', A, ['J21', 'J44', 'J28'], 'สูง', false, '60 kt: "On the 737, reverser cancellation speed is 60 knots"'),
  interlock: L({ wowOrRA_ft: 10, forwardLeverAtIdle: true, powerAboveRevIdleWhen: 'sleeves >= 90% (REV green)', amberBand: [0.1, 0.9] }, '-', A, ['J44', 'J28'], 'กลาง', false, 'RA < 10 ft หรือ air/ground; REV amber 10–90%, green > 90%') };
const reverserA = (src = ['J45', 'J39']) => ({ cancel_kt: L(36.01, 'm/s', A, src, 'กลาง', false, '70 kt: ห้าม max reverse ต่ำกว่านี้ idle reverse ใช้ได้ถึงหยุด (สำเนาไม่เป็นทางการ)'),
  interlock: L({ wow: 'main gear', forwardLeverAtIdle: true, autoIdleWhileUnstowed: true }, '-', A, ['J39'], 'กลาง', false, 'Safety First #14: design protection กันการเคลื่อนในอากาศ, FADEC Auto Idle ขณะไม่ stow') });
const aiB = L({ approachIdleWhen: 'flaps >= 15 (landing) OR thermal anti-ice ON (in air)', groundIdleAfterTouchdown_s: 4, below15000ft_fallback: 'AI if signal lost' }, '-', A, ['J43', 'J54'], 'ต่ำ', true, 'เงื่อนไขจากเอกสารฝึกอบรมไม่เป็นทางการ; หน่วงหลังแตะพื้น 4 s เป็นค่าประมาณ');
const aiA = L({ approachIdleWhen: 'gear down OR CONF 3/FULL (in air)', minIdle: 'ground (fwd) or in flight gear up and not CONF3/FULL', reverseIdle: 'slightly higher than forward idle', groundIdleAfterTouchdown_s: 4 }, '-', A, ['J42'], 'กลาง', true, 'สรุปจาก FCOM ทางอ้อม; หน่วง 4 s เป็นค่าประมาณ');
const layout = (cls, x, y, z, sta, src, conf, note, ax = [1, 0, 0]) => L([
  { id: 1, pos: [x, -y, z], posSTA: [sta, -y], axis: ax, type: 'turbofan', model: cls },
  { id: 2, pos: [x, y, z], posSTA: [sta, y], axis: ax, type: 'turbofan', model: cls }], 'm FRD', A, src, conf, true, note);
const legacy = (P, T0, idle, note) => L({ P, eta: 0.8, T0, idle }, 'W, -, N, -', S, ['J11', 'J10'], 'ต่ำ', true, note);
const blocks = {
  b737_800: { turbofan: { engines: { CFM56_7B26_class: C7B26, CFM56_7B27_class: C7B27, CFM56_7B24_class: C7B24 },
      engine_default: L('CFM56_7B26_class', '-', A, ['J9', 'J37', 'J38'], 'กลาง', false, 'OpenAP default; TK1951 และ I-NEOT ใช้ 7B26; ฝูง Thai Lion/Nok ไม่พบ dash number'),
      reverser: reverserB, idleAndLTO: { AI_select: aiB } },
    propulsion: { layout: layout('CFM56_7B26_class', 2.159, 4.902, 1.11, 16.485, ['J23', 'J48', 'J47'], 'ต่ำ', 'x,y จาก JSBSim 737 (engine 85 in หน้า AERORP, y 193 in; Jenkinson y = 0.282·b/2 = 4.84 m); z = ความสูง CG 2.7 m − ศูนย์ nacelle 1.59 m; STA จาก 25%MAC 18.644 (หัวข้อ 5)'),
      legacy: legacy(27873000, 233980, 0.05, 'Vc = 95.3 m/s ทำให้ thrustAvail(V) ตรง B&Y BPR 5.1 ที่ SL ภายใน 0.042 ช่วง 0–90 m/s (j_layout.mjs); T0 = 2 × 116,990 N') } },
  a320ceo: { turbofan: { engines: { CFM56_5B6_class: C5B6, CFM56_5B4_class: C5B4 },
      engine_default: L('CFM56_5B6_class', '-', A, ['J35', 'J9'], 'กลาง', false, 'Thai AirAsia HS-ABI = A320-216 CFM56-5B6 (ASN); A320-214 = 5B4'),
      reverser: reverserA(), idleAndLTO: { AI_select: aiA } },
    propulsion: { layout: layout('CFM56_5B6_class', 4.453, 5.755, 1.24, 11.857, ['J24', 'J47'], 'กลาง', 'FlightGear A320 (engine x 14.396, CG 25%MAC 18.849, z −1.048 vs 0.192 m); STA = 16.310 − 4.453; ติดตั้ง pitch 2.2°, toe 1° ใน FG ไม่ได้ใส่ (axis ตรง)'),
      legacy: legacy(24251000, 209060, 0.05, 'Vc 92.8 m/s, T0 = 2 × 104,530 N (5B6), max err 0.043') } },
  a320neo: { turbofan: { engines: { LEAP_1A26_class: CL26 },
      engine_default: L('LEAP_1A26_class', '-', A, ['J9'], 'กลาง', false, 'A320-251N = LEAP-1A26 (OpenAP); รุ่นของ Thai AirAsia ไม่ยืนยัน (อาจเป็น 1A26E1)'),
      reverser: reverserA(), idleAndLTO: { AI_select: aiA } },
    propulsion: { layout: layout('LEAP_1A26_class', 4.453, 5.755, 1.24, 11.857, ['J24', 'J47'], 'ต่ำ', 'FlightGear ใช้ตำแหน่งเดียวกับ CFM; LEAP จริงยื่นไปหน้าและสูงกว่า (ไม่พบในแหล่งสาธารณะ)'),
      legacy: legacy(25214000, 241280, 0.045, 'Vc 83.6 m/s (BPR 11.1 ลดเร็วกว่า), T0 = 2 × 120,640 N, max err 0.046') } },
  a321ceo: { turbofan: { engines: { CFM56_5B3_class: C5B3 },
      engine_default: L('CFM56_5B3_class', '-', A, ['J9'], 'กลาง', false, 'A321-211 = CFM56-5B3/P หรือ /2P (TCDS ผ่านหัวข้อ 3)'),
      reverser: reverserA(), idleAndLTO: { AI_select: aiA } },
    propulsion: { layout: layout('CFM56_5B3_class', 4.453, 5.755, 1.24, 16.125, ['J24', 'J47'], 'ต่ำ', 'ใช้ตำแหน่งเทียบ 25%MAC เท่า A320 (ปีกเดียวกัน); STA = 20.578 − 4.453'),
      legacy: legacy(30148000, 284680, 0.05, 'T0 = 2 × 142,340 N; ใช้ Vc 84.3 m/s ของ a321neo? ไม่ใช่: ดูหมายเหตุในเนื้อหา (Vc 92.8 ตาม BPR 5.4)') } },
  a321neo: { turbofan: { engines: { LEAP_1A32_class: CL32 },
      engine_default: L('LEAP_1A32_class', '-', A, ['J9', 'J3'], 'กลาง', false, 'A321-251N(X) = LEAP-1A32; -253N = 1A33'),
      reverser: reverserA(), idleAndLTO: { AI_select: aiA } },
    propulsion: { layout: layout('LEAP_1A32_class', 4.453, 5.755, 1.24, 16.125, ['J24', 'J47'], 'ต่ำ', 'เหมือน a321ceo'),
      legacy: legacy(30148000, 286100, 0.045, 'Vc 84.3 m/s, T0 = 2 × 143,050 N, max err 0.046') } },
  a330_300: { turbofan: { engines: { TRENT_772B_class: CT772B },
      engine_default: L('TRENT_772B_class', '-', A, ['J32', 'J7', 'J34'], 'กลาง', false, 'AirAsia X A330-343 = Trent 772B-60 (ATSB); A330-343 อาจเป็น 768-60/772B-60/772C-60 ตาม TCDS'),
      reverser: reverserA(['J45']), idleAndLTO: { AI_select: aiA } },
    propulsion: { layout: layout('TRENT_772B_class', 3.184, 9.401, 2.149, null, ['J25'], 'ต่ำ', 'FlightGear A330-300-RR (engine x −2.703, CG 0.481, AERORP 1.481 จึงได้ 4.18 m ถ้าอ้าง AERORP); z ขัดกับความสูง CG 3.6 m ของหัวข้อ 5 (ดูความขัดแย้ง); STA ไม่มีเพราะไม่มี LEMAC'),
      legacy: legacy(75596000, 632600, 0.05, 'Vc 95.6 m/s, T0 = 2 × 316,300 N, max err 0.042') } },
};
// fix a321ceo legacy (computed below with BPR 5.4)
import { lapseBY } from './j_lib.mjs';
{ let best = null; for (let Vc = 40; Vc <= 200; Vc += 0.1) { let e = 0; for (let V = 0; V <= 90; V += 2) e += (Vc / Math.hypot(V, Vc) - lapseBY(V / 340.294, 1, 5.4)) ** 2; if (!best || e < best.e) best = { Vc, e }; }
  const T0 = 2 * 142340, P = Math.round(T0 * best.Vc / 0.8 / 1000) * 1000;
  blocks.a321ceo.propulsion.legacy = legacy(P, T0, 0.05, `Vc ${best.Vc.toFixed(1)} m/s (B&Y BPR 5.4), T0 = 2 × 142,340 N`);
  console.log('a321ceo legacy', P, best.Vc.toFixed(1)); }
// ---------- validate ----------
let leaves = 0;
function walk(o, path) {
  if (o && typeof o === 'object' && 'v' in o && 'u' in o) {
    const keys = Object.keys(o).join(','); if (keys !== 'v,u,scope,src,conf,est,note') throw new Error('bad leaf ' + path + ' ' + keys);
    if (!['สูง', 'กลาง', 'ต่ำ'].includes(o.conf)) throw new Error('bad conf ' + path); if (!o.src.length) throw new Error('empty src ' + path); leaves++; return; }
  for (const [k, v] of Object.entries(o)) walk(v, path + '.' + k);
}
let md = '';
const isLeaf = o => o && typeof o === 'object' && 'v' in o && 'u' in o;
function ser(o, ind) { // one leaf per line
  if (isLeaf(o)) return JSON.stringify(o);
  const pad = ' '.repeat(ind + 1), ents = Object.entries(o).map(([k, v]) => pad + JSON.stringify(k) + ': ' + ser(v, ind + 1));
  return '{\n' + ents.join(',\n') + '\n' + ' '.repeat(ind) + '}';
}
const perType = {};
for (const [t, b] of Object.entries(blocks)) { walk(b, t); const txt = ser({ [t]: b }, 0); JSON.parse(txt); perType[t] = txt; md += '```json\n' + txt + '\n```\n\n'; }
fs.writeFileSync(new URL('./j_json_pertype.json', import.meta.url), JSON.stringify(Object.fromEntries(Object.entries(perType).map(([k, v]) => [k, v.length]))));
fs.writeFileSync(new URL('./j_json_out.md', import.meta.url), md);
console.log('leaves', leaves, 'bytes', md.length);
