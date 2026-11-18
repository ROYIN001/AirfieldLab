// Section 5: build the "turbofan" parameter JSON (validated by JSON.parse round-trip)
const P = (v, u, scope, src, conf, est, note) => ({ v, u, scope, src, conf, est, note });
const eng = (o) => shorten(o.short, {
  F00: P(o.F00, 'N', 'engine', o.F00src, 'สูง', false, o.F00note),
  bpr: P(o.bpr, '-', 'engine', ['F10'], o.bprConf || 'กลาง', false, o.bprNote),
  opr: P(o.opr, '-', 'engine', ['F10'], 'กลาง', false, 'OPR จาก EEDB'),
  ffLTO: P(o.ff, 'kg/s', 'engine', ['F10'], 'กลาง', false, 'FF ต่อเครื่องที่ TO/CO/App/Idle (100/85/30/7%) จาก EEDB'),
  N1_100_rpm: P(o.n1, 'rpm', 'engine', o.nSrc, o.nConf, o.nEst, o.n1note),
  N2_100_rpm: P(o.n2, 'rpm', 'engine', o.nSrc, o.nConf, o.nEst, o.n2note),
  N1_GI_pct: P(o.n1gi, '%N1', 'engine', ['F16'], 'ต่ำ', true, 'แสดงผลเท่านั้น; PW1100G-JM min N1 GI = 17.4% ของ N1 สูงสุด'),
  Tflat_C: P(o.tflat, 'degC', 'engine', o.tflatSrc, o.tflatConf, o.tflatEst, o.tflatNote),
  kT_perK: P(0.0075, '1/K', 'engine', ['F12'], 'ต่ำ', true, 'Raymer 0.75%/K ผ่าน Schulz (ช่วงวัด 0.43-0.92%/K)'),
  N2_GI_pct: P(o.gi, '%N2', 'engine', ['F16', 'F14', 'F19'], 'ต่ำ', true, 'ground idle; เทียบ PW1100G 55.6%, CFM56-7B icing 58.8%, JSBSim 60%'),
  N2_FI_pct: P(o.gi + 2, '%N2', 'engine', ['F16'], 'ต่ำ', true, 'floor ในอากาศ'),
  N2_AI_pct: P(o.ai, '%N2', 'engine', ['F18'], 'ต่ำ', true, 'floor เมื่อแฟลปลงจอดหรือล้อลง; AI->95% = 3.0 s'),
  idleFrac0: P(o.idle, '-', 'engine', ['F19', 'F10'], 'ต่ำ', true, 'net idle/F00 ที่ static SL; JSBSim 4.36%, OpenAP 7%'),
  idleMach0: P(0.5, '-', 'engine', ['F19'], 'ต่ำ', true, 'Mach ที่ net idle = 0 (เชิงเส้น, พื้น -0.2)'),
  thrustExp_k: P(2, '-', 'engine', ['F19'], 'กลาง', true, 'F = Fidle + (Frated-Fidle) n^k แบบ JSBSim'),
  tau2_s: P(o.tau, 's', 'engine', ['F17'], 'ต่ำ', true, 'ปรับให้ 40%->TO ตรง NASA C-MAPSS'),
  Racc_pctps: P(o.racc, '%N2/s', 'engine', ['F1', 'F17'], 'ต่ำ', true, 'ปรับให้ FI->95% = 4.6 s (< 5 s)'),
  accShape_a: P(6, '-', 'engine', ['F19'], 'ต่ำ', true, 'รูปแบบ (1-n)^3 จาก JSBSim, a ปรับใหม่'),
  Rdec_pctps: P(o.rdec, '%N2/s', 'engine', ['F17'], 'ต่ำ', true, 'TO->10% ใน 2.3 s'),
  altExp: P(1.0, '-', 'engine', ['F17'], 'ต่ำ', true, 'อัตราคูณ delta_t^e; fit อัตราส่วน rise time ของ NASA'),
  tauFan_s: P(o.tauF, 's', 'engine', [], 'ต่ำ', true, 'lag ของพัดลม'),
  revType: P({ type: o.revType }, '-', 'engine', o.revSrc, 'กลาง', false, o.revNote),
  rev_c0: P(0.30, '-', 'engine', ['F23', 'F25'], 'ต่ำ', true, 'ปรับให้อัตราส่วนระยะตรง LDF ของ AC 91-79B'),
  rev_c1: P(1.0, '1/Mach', 'engine', ['F21', 'F25'], 'ต่ำ', true, 'ได้ผลมากขึ้นที่ความเร็วสูง'),
  rev_uMax: P(0.70, '-', 'engine', ['F25'], 'ต่ำ', true, 'max reverse ~0.37 F00 ที่ 130 kt'),
  rev_idleFrac: P(0.10, '-', 'engine', ['F21'], 'ต่ำ', true, 'FAA AFH: idle reverse ให้แรงน้อยมาก'),
  rev_deploy_s: P(2.0, 's', 'engine', ['F6', 'F22', 'F25'], 'ต่ำ', true, 'ไม่รวม 1 s ของนักบิน (AC 25-32)'),
  rev_stow_s: P(2.5, 's', 'engine', [], 'ต่ำ', true, 'ไม่มีแหล่งที่เปิดได้'),
});
const SHARED = ['kT_perK','N2_GI_pct','N2_FI_pct','N2_AI_pct','idleFrac0','idleMach0','thrustExp_k','tau2_s','Racc_pctps','accShape_a','Rdec_pctps','altExp','tauFan_s','rev_c0','rev_c1','rev_uMax','rev_idleFrac','rev_deploy_s','rev_stow_s'];
const KEEP = ['F00','bpr','opr','ffLTO','N1_100_rpm','N2_100_rpm','N1_GI_pct','Tflat_C','N2_GI_pct','N2_FI_pct','N2_AI_pct','idleFrac0','Rdec_pctps','tauFan_s','revType'];
function shorten(flag, o) { if (!flag) return o; const r = { inherits: P({ from: 'CFM56_7B27_class' }, '-', 'engine', [], 'กลาง', true, 'พารามิเตอร์ที่ไม่ได้ระบุในชุดนี้ใช้ค่าและที่มาเดียวกับ CFM56_7B27_class') };
  for (const k of KEEP) { r[k] = o[k]; if (['N2_GI_pct','N2_FI_pct','N2_AI_pct','idleFrac0','Rdec_pctps','tauFan_s','N1_GI_pct'].includes(k)) r[k].note = 'วิธีเดียวกับ CFM56_7B27_class'; } return r; }
const J = { turbofan: {
  engines: {
    CFM56_7B27_class: eng({ F00: 121400, F00src: ['F10', 'F14'], F00note: 'EEDB UID 8CM066 (CFM56-7B27/3) 121.4 kN; EASA TCDS E.004: take-off 12143 daN',
      bpr: 5.1, bprNote: 'EEDB 8CM066 = 5.1 (รุ่นแรก 3CM034 = 5.0)', opr: 29.0, ff: [1.293, 1.031, 0.343, 0.110],
      n1: 5175, n2: 14460, nSrc: ['F14'], nConf: 'กลาง', nEst: true, n1note: 'คำนวณกลับจาก TCDS E.004: N1 max 5382 rpm = 104%', n2note: 'คำนวณกลับจาก TCDS E.004: N2 max 15183 rpm = 105%',
      tflat: 30, tflatSrc: [], tflatConf: 'ต่ำ', tflatEst: true, tflatNote: 'ยังไม่ยืนยัน: TCDS E.004 ระบุแค่ sea level corner point ไม่ระบุอุณหภูมิ; ใช้ ISA+15 เป็นค่าเริ่มต้น',
      n1gi: 20, gi: 59, ai: 69, idle: 0.05, tau: 0.35, racc: 18, rdec: 16, tauF: 0.25, revType: 'cascade (translating sleeve, fan stream)', revSrc: ['F14', 'F21'], revNote: 'TCDS E.004 Note 7: Boeing thrust reverser P/N 315A2295; FAA AFH: cascade กลับเฉพาะ fan air' }),
    CFM56_5B4_class: eng({ short: true, F00: 120100, F00src: ['F10'], F00note: 'EEDB UID 8CM055 (CFM56-5B4/3) 120.1 kN; รุ่น -5B4 เดิม (2CM014) 117.9 kN',
      bpr: 5.7, bprNote: 'EEDB 8CM055 = 5.7 (2CM014 = 5.9)', opr: 27.3, ff: [1.142, 0.939, 0.316, 0.102],
      n1: 5000, n2: 15183, nSrc: [], nConf: 'ต่ำ', nEst: true, n1note: 'ยังไม่ยืนยัน (ไม่ได้เปิด TCDS CFM56-5B) ใช้แสดงผลเท่านั้น', n2note: 'ยังไม่ยืนยัน ใช้ค่าเดียวกับ -7B เป็นตัวยึด',
      tflat: 30, tflatSrc: [], tflatConf: 'ต่ำ', tflatEst: true, tflatNote: 'ยังไม่ยืนยัน',
      n1gi: 20, gi: 59, ai: 69, idle: 0.05, tau: 0.35, racc: 18, rdec: 16, tauF: 0.25, revType: 'pivoting door (CFM56-5B per Mahmood et al.)', revSrc: ['F25'], revNote: 'Mahmood et al. ศึกษา pivoting door บนเครื่องคล้าย CFM56-5B; ยืนยันเฉพาะงานวิจัย' }),
    LEAP_1A26_class: eng({ short: true, F00: 120600, F00src: ['F10', 'F15'], F00note: 'EEDB UID 20CM089 (LEAP-1A26) 120.6 kN; TCDS E.110 มีค่า take-off 12064 daN ในตาราง (จับคู่รุ่นจาก EEDB)',
      bpr: 11.1, bprNote: 'EEDB 20CM089 = 11.1', opr: 33.3, ff: [0.861, 0.710, 0.244, 0.091],
      n1: 3856, n2: 16645, nSrc: ['F15'], nConf: 'สูง', nEst: false, n1note: 'TCDS E.110: 100% N1 = 3856 rpm (max 101%)', n2note: 'TCDS E.110: 100% N2 = 16645 rpm (max 116.5%)',
      tflat: 30, tflatSrc: [], tflatConf: 'ต่ำ', tflatEst: true, tflatNote: 'ยังไม่ยืนยัน; เทียบ PW1127G-JM ที่ TCDS ระบุ take-off flat rating 47 C',
      n1gi: 18, gi: 57, ai: 68, idle: 0.045, tau: 0.35, racc: 18, rdec: 15, tauF: 0.30, revType: 'cascade (translating sleeve)', revSrc: ['F15'], revNote: 'TCDS E.110 Note 5: Aircelle thrust reverser systems' }),
  },
  lapse: {
    takeoffModel: P({ name: 'Bartel-Young 2008 eq.11-14', validMach: [0, 0.45] }, '-', 'environment', ['F11', 'F10'], 'กลาง', false, 'ใช้กับ take-off/go-around/ไต่ต้น; ผู้เขียนอ้าง ±1% ถึง M 0.4'),
    BY_A: P([-0.4327, 1.3855, 0.0472], '-', 'environment', ['F10', 'F11'], 'กลาง', false, 'A(d) = a0 d^2 + a1 d + a2, d = p/p0'),
    BY_Z: P([0.9106, -1.7736, 1.8697], '-', 'environment', ['F10', 'F11'], 'กลาง', false, 'Z(d) = z0 d^3 + z1 d^2 + z2 d'),
    BY_X: P([0.1377, -0.4374, 1.3003], '-', 'environment', ['F10', 'F11'], 'กลาง', false, 'X(d) = x0 d^3 + x1 d^2 + x2 d'),
    BY_lin: P([0.377, 0.82], '-', 'environment', ['F10', 'F11'], 'กลาง', false, 'พจน์ M: 0.377(1+BPR)/sqrt((1+0.82 BPR) G0)'),
    BY_quad: P([0.23, 0.19], '-', 'environment', ['F10', 'F11'], 'กลาง', false, 'พจน์ M^2: (0.23 + 0.19 sqrt(BPR))'),
    BY_G0fit: P([0.0606, 0.6337], '-', 'environment', ['F10'], 'ต่ำ', true, 'G0 = 0.0606 BPR + 0.6337 (OpenAP fit ของ Fig. 5 ใน B&Y)'),
    howeHighMach: P({ axes: { band: ['BPR3-6', 'BPR8'], coef: ['k1', 'k2', 'k3', 'k4'] }, data: [[0.88, -0.016, -0.3, 0], [0.89, -0.014, -0.3, 0.005]] }, '-', 'environment', ['F12'], 'ต่ำ', false, 'Howe 2000 สำหรับ 0.4<M<0.9: tau=(k1+k2 BPR+(k3+k4 BPR)M) sigma^s, s=0.7 (h<11 km), 1 (h>11 km); ใช้เมื่อต้องบินระดับ cruise เท่านั้น'),
    tempModel: P({ form: 'F = Fflat*(1 - kT*max(0, OAT - Tflat))' }, '-', 'environment', ['F12', 'F16'], 'กลาง', true, 'ห้ามใช้ sigma^n ที่ความสูงต่ำกับเครื่อง flat-rated'),
  },
  idleAndLTO: {
    LTO_pct: P({ takeoff: 100, climb: 85, approach: 30, idle: 7 }, '% rated', 'environment', ['F8'], 'สูง', false, '40 CFR 1031.140 Table 1 (สอดคล้อง ICAO Annex 16 Vol II) เป็นจุดทดสอบไอเสีย ไม่ใช่ค่า idle จริง'),
    LTO_time_min: P({ takeoff: 0.7, climb: 2.2, approach: 4.0, idle: 26.0 }, 'min', 'environment', ['F8'], 'สูง', false, 'time in mode'),
    AI_select: P({ flapsAtLeast: 'landing', orGearDown: true, holdAfterTouchdown_s: 4 }, '-', 'sim', [], 'ต่ำ', true, 'ตรรกะเลือก approach idle; hold หลังแตะพื้นเป็นค่าประมาณ'),
  },
  cert: {
    accel_FI_to_95pct_s: P(5, 's', 'environment', ['F1'], 'สูง', false, '14 CFR 33.73(b): static, จาก fixed min flight idle (หรือ <=15%) ถึง 95% rated ใน 5 s'),
    lever_full_travel_s: P(1, 's', 'environment', ['F1', 'F6'], 'สูง', false, '33.73(a) และ 33.97(a): เลื่อนคันโยกสุดช่วงใน 1 s'),
    GA_thrust_available_at_s: P(8, 's', 'environment', ['F2'], 'สูง', false, '14 CFR 25.119: แรงขับที่มีหลังเริ่มเลื่อนคันโยกจาก min flight idle 8 s ใช้คิด landing climb'),
    landing_climb_gradient: P(0.032, '-', 'environment', ['F2'], 'สูง', false, '25.119: 3.2% ทุกเครื่องทำงาน ที่ VREF'),
    reverse_credit: P({ accelStopDry: false, accelStopWet: true, landingAFM: 'means other than wheel brakes if safe, reliable, consistent, no exceptional skill' }, '-', 'environment', ['F3', 'F4'], 'สูง', false, '25.109(f), 25.125(c)(3)'),
    reverser_test_cycles: P({ fromFlightIdle: 175, fromTakeoff: 25, holdAtMaxReverse_s: 60, groundOnlyHold_s: 30 }, '-', 'environment', ['F6'], 'สูง', false, '14 CFR 33.97(b) ผ่าน 25.934'),
    Vmc_limits: P({ maxBank_deg: 5, VmcMax_over_VSR: 1.13, rudderForce_lbf: 150, VMCG_lateral_ft: 30 }, '-', 'environment', ['F7'], 'สูง', false, '14 CFR 25.149(b)-(e)'),
  },
  reverser: {
    cancel_kt: P(60, 'kt', 'aircraft', ['F24', 'F25'], 'กลาง', false, 'B737: reverser cancellation 60 kt (FAA lessons learned); Mahmood: ยกเลิกช่วง 80-60 kt; Airbus 70 kt ยังไม่ยืนยัน'),
    pilotAction_min_s: P(1, 's', 'sim', ['F22'], 'สูง', false, 'AC 25-32 para 10.1.3: การกระทำของนักบินอย่างน้อย 1 s'),
    interlock: P({ wow: 'main gear', forwardLeverAtIdle: true, powerAboveRevIdleWhenDeployedAtLeast: 0.9 }, '-', 'sim', ['F22'], 'กลาง', true, 'AC 25-32 para 10.1.4 ให้รวม interlock และ spin-up; ค่า 0.9 เป็นค่าประมาณ'),
    LDF_AC91_79B: P({ axes: { RwyCC: [6, 5, 4, 3, 2, 1], col: ['noReverse', 'withReverse'] }, data: [[1.67, 1.67], [2.3, 1.92], [2.8, 2.3], [3.2, 2.5], [4.0, 2.9], [5.1, 3.4]] }, '-', 'environment', ['F23'], 'สูง', false, 'Table 3-1 (RwyCC 5 ใช้ค่า grooved/PFC) ใช้เป็นเป้าตรวจอัตราส่วนระยะ'),
  },
  sim: {
    testFixture_A320class: P({ m_kg: 62000, S_m2: 122.6, CDground: 0.10, nEng: 2, Vapp_kt: 135, Vtd_over_Vapp: 0.96, airDistance_s: 7, muBrake: { dry: 0.40, RCC5: 0.25, RCC3: 0.163, RCC2: 0.12, RCC1: 0.083 } }, 'mixed', 'sim', ['F22'], 'ต่ำ', true, 'ค่าสมมติสำหรับ test เท่านั้น ไม่ใช่ข้อมูลเครื่องบินจริง; mu RCC3/RCC1 และ 7 s, 0.96 จาก AC 25-32'),
    vmcFixture_JSBSim737: P({ S_m2: 108.79, b_m: 28.86, Cn_dr_perRad: -0.20, dr_max_rad: 0.35, yEngine_m: 4.90, F00_N: 88964, bpr: 5.9 }, 'mixed', 'sim', ['F19'], 'ต่ำ', true, 'จาก JSBSim 737.xml/CFM56.xml ซึ่งผู้สร้างระบุว่าเป็นค่าเดาจากข้อมูลสาธารณะ ใช้ทดสอบสูตรเท่านั้น'),
  },
} };
const s = JSON.stringify(J); JSON.parse(s);
import fs from 'fs';
// compact-ish pretty print: one leaf per line
const lines = JSON.stringify(J, (k, v) => v, 1);
let txt = JSON.stringify(J, null, 2).replace(/\{\n\s+"v": ([\s\S]*?)\n\s+\}/g, (m) => m.replace(/\n\s*/g, ' '));
JSON.parse(txt); fs.writeFileSync(new URL('./f5_params.json', import.meta.url), txt); console.log(txt.length, 'chars'); 
