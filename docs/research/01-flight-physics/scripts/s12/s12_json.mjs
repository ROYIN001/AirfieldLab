// s12_json.mjs - builds the otherSims parameter JSON for section 12 (validated by JSON.parse round trip)
import fs from 'fs';
const P = (v, u, scope, src, conf, est, note) => ({ v, u, scope, src, conf, est, note });
const j = { otherSims: {
  jsbsim: {
    version: P([1, 3, 3], 'major.minor.patch', 'sim', ['S7'], 'สูง', false, 'รุ่นบน PyPI ที่ติดตั้งและรันจริง 2026-11-18 (ออก 2026-10-16)'),
    defaultDt: P(1 / 120, 's', 'sim', ['S2'], 'สูง', false, 'dT เริ่มต้นใน FGFDMExec ตั้งใหม่ได้ด้วย set_dt'),
    defaultIntegrators: P({ rotationalRate: 'RectEuler', translationalRate: 'AdamsBashforth2', rotationalPosition: 'RectEuler', translationalPosition: 'AdamsBashforth3' }, '-', 'sim', ['S2'], 'สูง', false, 'ค่าเริ่มต้นใน FGPropagate เปลี่ยนได้ทาง simulation/integrator/*'),
    tableOutOfRange: P({ mode: 'clamp', extrapolate: false }, '-', 'sim', ['S3'], 'สูง', false, 'FGTable คืนค่าขอบตาราง ไม่ extrapolate'),
    gearSideForcePacejkaDefaults: P({ B_stiffness: 0.06, C_shape: 2.8, D_peak: 'static_friction', E_curvature: 1.03 }, '-', 'gear', ['S5'], 'สูง', false, 'ค่าเริ่มต้นของ magic formula ใน FGLGear (มุมไถลเป็นองศา)'),
    actuatorFeatures: P(['rate_limit (incr/decr)', 'lag', 'deadband_width', 'hysteresis_width', 'bias', 'delay'], '-', 'sim', ['S6'], 'สูง', false, 'องค์ประกอบ FGActuator ใช้เป็นต้นแบบ actuator ของเรา'),
    propellerTables: P(['C_THRUST(J)', 'C_POWER(J)', 'CT_MACH', 'CP_MACH', 'p_factor', 'sense', 'cp_factor', 'ct_factor'], '-', 'propeller', ['S4'], 'สูง', false, 'โครงสร้างข้อมูลใบพัดของ JSBSim (ตารางเป็นรายเครื่อง)'),
    c172xTrimCruise100kcas3000ft: P({ alpha_deg: 0.585, elevator_pos_deg: 5.392, pitchTrimCmd: 0.2295, throttle: 0.793, rpm: 2453, weight_lb: 2480, dh_10s_ft: 0.077 }, 'deg, -, rpm, lb, ft', 'aircraft', ['S7', 'S29'], 'กลาง', true, 'ผลรันโมเดลเปิด c172x (GPL) ไม่ใช่ข้อมูลบินจริง elevator บวก = ขอบท้ายลง'),
    c172xTrimApproach65kcas1000ftFlap30: P({ alpha_deg: 2.037, theta_deg: -0.963, elevator_pos_deg: 2.264, throttle: 0.514, rpm: 1591, hdot_fpm: -350 }, 'deg, -, rpm, fpm', 'aircraft', ['S7', 'S29'], 'กลาง', true, 'gamma -3 deg; ใช้ตรวจว่าสภาพแวดล้อม oracle ติดตั้งถูก'),
    costPerStep_c172x_native: P(15.3, 'us/step', 'sim', ['S29'], 'กลาง', true, 'Python loop + C++ ที่ 120 Hz บนเครื่อง cloud นี้ (544 เท่าเวลาจริง)'),
    wasmBundleBytes: P(1588236, 'byte', 'sim', ['S9'], 'สูง', false, '@0x62/jsbsim-wasm 1.2.4-beta.4 ไฟล์ .wasm (LGPL-2.1) ยังไม่ได้รันทดสอบ'),
  },
  yasim: {
    solverUnknowns: P(['dragFactor', 'liftRatio', 'cruiseAoA', 'tailIncidence', 'approachElevator'], '-', 'sim', ['S12'], 'สูง', false, 'Airplane::solveAirplane ปรับ 5 ตัวให้ cruise สมดุลแรงและโมเมนต์ และ approach สมดุลแรงยกและโมเมนต์'),
    propEtaC: P(0.85, '-', 'propeller', ['S12'], 'สูง', false, 'ประสิทธิภาพสูงสุดคงที่ของโมเดลใบพัด YASim'),
    propLambdaPeak: P(0.6687, '-', 'propeller', ['S12'], 'สูง', false, '5^(-1/4) อัตราส่วน J/J0 ที่ประสิทธิภาพสูงสุด'),
    gearStaticFrictionDefault: P(0.8, '-', 'gear', ['S11'], 'สูง', false, 'sfric ค่าเริ่มต้น'),
    gearDynamicFrictionDefault: P(0.7, '-', 'gear', ['S11'], 'สูง', false, 'dfric ค่าเริ่มต้น'),
    groundEffectShape: P({ form: 'Fz_extra = Fz_aero * k_ge * (b - h)/b', activeBelow: 'h < b' }, '-', 'sim', ['S12'], 'สูง', false, 'Model::calcForces คูณแรงแนวดิ่งเชิงเส้นตามความสูงเทียบ span'),
    wingSegmentLength: P({ segmentLength: 'mean chord', minSegmentsIfTwisted: 8 }, '-', 'sim', ['S12'], 'สูง', false, 'Wing.cpp แบ่ง strip ยาวประมาณหนึ่ง mean chord'),
    flightgearModelHz: P(120, 'Hz', 'sim', ['S13'], 'สูง', false, 'fgdata defaults.xml'),
  },
  xplane: {
    maxElementsPerSide: P(10, '-', 'aircraft', ['S14'], 'สูง', false, 'ต่อปีกหรือ stabilizer ต่อข้าง'),
    minCyclesPerSecond: P(15, 'Hz', 'sim', ['S14'], 'กลาง', false, 'หน้า How X-Plane Works ระบุ "at least 15 times per second"'),
    minFrameRate: P(20, 'fps', 'sim', ['S17'], 'สูง', false, 'คู่มือ X-Plane 12: physics และ rendering วิ่งต่อเฟรม ขั้นต่ำ 20 fps'),
    tireRollingCoeffGuidance: P({ airlinerFighter: 0.008, generalAviation: 0.016, cub: 0.040 }, '-', 'gear', ['S15'], 'กลาง', false, 'คำแนะนำของผู้พัฒนา X-Plane 12'),
  },
  msfs: {
    windTunnelIterations: P(100, '-', 'sim', ['S19'], 'สูง', false, 'รอบปรับพารามิเตอร์พื้นผิวให้ตรงเป้าสมรรถนะ'),
    stallDefStartRatio: P(0.9, '-', 'aircraft', ['S18'], 'สูง', false, 'สัดส่วนของ stall AoA ที่กระแสเริ่มแยก'),
    stallDefEndRatio: P(1.1, '-', 'aircraft', ['S18'], 'สูง', false, 'แยกสมบูรณ์'),
    stallDefCurvePower: P(0.8, '-', 'aircraft', ['S18'], 'สูง', false, 'เลขชี้กำลังของเส้นการแยก'),
    stallTipAddIncidence: P(2.0, 'deg', 'aircraft', ['S18'], 'สูง', false, 'เพิ่ม stall AoA ที่ปลายปีก'),
    gearSpringExponentDefault: P(16, '-', 'gear', ['S22'], 'กลาง', false, 'เลขชี้กำลังสปริงไม่เชิงเส้นของ contact point'),
  },
  geofs: {
    airfoilPartFields: P(['area | liftFactor+dragFactor', 'stallIncidence', 'zeroLiftIncidence', 'span', 'chord', 'aspectRatio', 'efficiencyFactor', 'forceDirection'], '-', 'aircraft', ['S26'], 'ต่ำ', false, 'จาก typings ชุมชน ไม่ใช่เอกสารทางการ'),
    enginePartThrust: P({ unit: 'N', model: 'constant static thrust x throttle', altitudeLapse: 'linear to zeroThrustAltitude' }, '-', 'engine', ['S26'], 'ต่ำ', false, 'ลดเชิงเส้นตามความสูงถึง zeroThrustAltitude'),
  },
  airfieldlab: {
    oracleTolerance: P({ h_m: 0.05, V_mps: 0.01, theta_deg: 0.05, phi_deg: 0.1, rate_dps: 0.5 }, 'm, m/s, deg, deg/s', 'sim', ['S29'], 'กลาง', true, 'เกณฑ์ T-S-01/02 ตั้งจากผลจริง x3-5 (AB3 240 Hz)'),
    oracleMeasuredMaxErr240HzAB3: P({ h_m: 0.004, V_mps: 0.00095, alpha_deg: 0.0123, theta_deg: 0.0137, phi_deg: 0.0393, psi_deg: 0.0113, p_dps: 0.207, q_dps: 0.050, r_dps: 0.020 }, 'm, m/s, deg, deg/s', 'sim', ['S29'], 'สูง', true, 'JS RK4 240 Hz เทียบ JSBSim 1.3.3 AB3 240 Hz ไม่มี alpha-dot 25 s'),
    oracleMeasuredMaxErrAdot: P({ h_m: 0.0095, alpha_deg: 0.040, theta_deg: 0.048, q_dps: 0.117 }, 'm, deg, deg/s', 'sim', ['S29'], 'สูง', true, 'alpha-dot แบบกรองตัวเลข 50 ms ของเรา เทียบ alphadot เชิงวิเคราะห์ของ JSBSim'),
    stepCostNode: P(3.7, 'us/step', 'sim', ['S29'], 'กลาง', true, 'Node 22.23.5 หลัง warm-up, RK4 + updateAir (5 deriv ต่อ step)'),
  },
} };
const out = ['{', ' "otherSims": {'];
const groups = Object.entries(j.otherSims);
groups.forEach(([g, leaves], gi) => {
  out.push(`  ${JSON.stringify(g)}: {`);
  const ls = Object.entries(leaves);
  ls.forEach(([k, v], li) => out.push(`   ${JSON.stringify(k)}: ${JSON.stringify(v).replace(/,"/g, ', "').replace(/":/g, '": ')}${li < ls.length - 1 ? ',' : ''}`));
  out.push(`  }${gi < groups.length - 1 ? ',' : ''}`);
});
out.push(' }', '}');
const s = out.join('\n');
JSON.parse(s);
fs.writeFileSync(process.argv[2] || 's12_params.json', s);
console.log(s.length, 'chars ok');
