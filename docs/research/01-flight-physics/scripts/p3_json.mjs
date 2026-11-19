// Builds the section-3 parameter JSON (valid JSON, every leaf {v,u,scope,src,conf,est,note}).
import fs from 'fs';
import { prop } from './p3_bem.mjs';
const t = JSON.parse(fs.readFileSync(new URL('./p3_tables_step02.json', import.meta.url)));
const pf = JSON.parse(fs.readFileSync(new URL('./p3_pfactor_table.json', import.meta.url)));
const L = (v, u, scope, src, conf, est, note) => ({ v, u, scope, src, conf, est, note });
const r4 = (a) => a.map(r => r.map(x => +x.toFixed(4)));
const out = { propeller: {
  identity: {
    nBlades: L(4, '-', 'propeller', ['P3'], 'สูง', false, 'ใบพัด 4 ใบแบบ Hartzell HC-D4N (TCDS EASA IM.P.133)'),
    diameter: L(2.44, 'm', 'propeller', ['P3'], 'กลาง', true, 'เลือกให้อยู่ในช่วง 218.4-243.8 cm ของใบ D9512 ใน TCDS; ค่าเดิมของรอบนี้'),
    sense: L(1, '-', 'propeller', ['P3', 'P14', 'P1'], 'สูง', false, '+1 = หมุนตามเข็มนาฬิกาเมื่อมองจากด้านหลัง (right-hand, เวกเตอร์ความเร็วเชิงมุมของใบพัด = +x ใน FRD); -1 = กลับทิศ'),
    massComplete: L(68.9, 'kg', 'propeller', ['P3'], 'สูง', false, 'น้ำหนักประมาณสูงสุดของใบพัดทั้งชุด HC-D4N-2/D9512 ตาม TCDS'),
    hubPosition: L([3.94, 0, -0.06], 'm (FRD จาก CG)', 'aircraft', ['P16'], 'ต่ำ', true, 'จากตำแหน่งใบพัดในโมเดลสามมิติ src/70-aircraft.js:183 โดยสมมติว่าจุดกำเนิดโมเดลคือ CG'),
    thrustAxis: L([1, 0, 0], '-', 'aircraft', ['P16'], 'ต่ำ', true, 'ไม่มี right/down thrust ติดตั้ง (ไม่พบแหล่งสำหรับเครื่องสมมติ)'),
  },
  engineInterface: {
    maxShaftPower: L(708, 'kW', 'engine', ['P4'], 'สูง', false, 'PT6A-62 take-off = max continuous 708 kW, flat rated ถึง 37 °C (TCDS EASA IM.E.078)'),
    rpmGoverned: L(2000, 'rpm', 'engine', ['P4'], 'สูง', false, 'N2 steady limit 2000 rpm (90.7%)'),
    rpmTransientLimit: L(2205, 'rpm', 'engine', ['P4'], 'สูง', false, 'N2 transient 2205 rpm (100%)'),
    gearRatio: L(15.07, '-', 'engine', ['P4'], 'สูง', false, 'คำนวณจาก TCDS: power turbine 30145 rpm ที่ใบพัด 2000 rpm'),
    flightIdleShaftPower: L(20, 'kW', 'engine', [], 'ต่ำ', true, 'สมมติฐานสำหรับคำนวณแรงขับที่ flight idle; ให้หัวข้อเครื่องยนต์ยืนยัน'),
  },
  bladeGeometry: {
    hubRadiusRatio: L(0.18, 'r/R', 'propeller', [], 'ต่ำ', true, 'รัศมี spinner/โคนใบ'),
    chordOverD: L({ axes: { x: prop.cx }, data: prop.cD }, 'c/D', 'propeller', [], 'ต่ำ', true, 'รูปทรงใบสมมติ ให้ activity factor ≈ 100 ต่อใบ, solidity ที่ 0.75R = 0.181'),
    twistDesignJ: L(1.1, '-', 'propeller', [], 'ต่ำ', true, 'บิดตาม atan(Jd/(πx)) อ้างอิงที่ 0.75R; บิดรวม 41° จาก 0.2R ถึงปลายใบ'),
    activityFactor: L(100, '-', 'propeller', [], 'ต่ำ', true, 'AF = (1e5/16)∫(c/D)x³dx ต่อใบ'),
  },
  section: {
    liftSlope: L(5.78, '1/rad', 'propeller', [], 'กลาง', true, '0.92·2π ก่อนแก้ Prandtl-Glauert (จำกัด M ≤ 0.8)'),
    alpha0: L(-3.0, 'deg', 'propeller', [], 'ต่ำ', true, 'มุมยกศูนย์ของหน้าตัดโค้ง (cambered)'),
    alphaStallPos: L(14, 'deg', 'propeller', [], 'ต่ำ', true, 'ปรับเทียบให้แรงขับสถิตที่ 31 °C ≈ AC.T0; ไวมาก (±1° → ±1.5 kN)'),
    alphaStallNeg: L(-11, 'deg', 'propeller', [], 'ต่ำ', true, ''),
    stallBlendM: L(10, '1/rad', 'propeller', [], 'ต่ำ', true, 'ความชันของ sigmoid ผสม flat plate'),
    cd0: L(0.0085, '-', 'propeller', [], 'ต่ำ', true, ''),
    kcd: L(0.010, '-', 'propeller', [], 'ต่ำ', true, 'cd = cd0 + kcd (cl - 0.35)^2'),
    Mdd: L(0.80, '-', 'propeller', [], 'ต่ำ', true, 'drag rise 20(M-Mcrit)^4, Mcrit = Mdd - (0.1/80)^(1/3)'),
    stallDelayFactor: L(3, '-', 'propeller', ['P10'], 'ต่ำ', true, 'Δcl = 3(c/r)²(cl_lin - cl) แบบ Snel; CCBlade ใช้ Du-Selig ที่โครงสร้างเดียวกัน; สัมประสิทธิ์ 3 ยังไม่ยืนยันจากต้นฉบับ'),
  },
  tables: {
    CT: L({ axes: { J: t.J, beta75_deg: t.beta75 }, data: r4(t.CT) }, '-', 'propeller', ['P10'], 'ต่ำ', true, 'BEM + Prandtl tip loss (สคริปต์ p3_bem.mjs), ρ=1.225, 2000 rpm; ช่อง J=0/β≥55° อยู่นอกช่วงที่ BEM หาคำตอบได้; runtime ควรใช้ตารางละเอียด ΔJ=0.1, Δβ=5°'),
    CP: L({ axes: { J: t.J, beta75_deg: t.beta75 }, data: r4(t.CP) }, '-', 'propeller', ['P10'], 'ต่ำ', true, 'C_P = P/(ρn³D⁵) = 2πC_Q'),
    CNmu: L({ axes: { J: pf.J, beta75_deg: pf.beta75 }, data: pf.CN_mu }, '-', 'propeller', ['P6'], 'ต่ำ', true, 'dC_N/dμ, C_N = F_inplane/(ρn²D⁴), μ = V_inplane/(nD); BEM แยกมุมแอซิมัท induction คงที่; ไม่รวม sidewash ของ Ribner'),
    CMmu: L({ axes: { J: pf.J, beta75_deg: pf.beta75 }, data: pf.CM_mu }, '-', 'propeller', ['P6'], 'ต่ำ', true, 'dC_Mpf/dμ, C_Mpf = M_pfactor/(ρn²D⁵); เครื่องหมายตาม sense'),
  },
  inertia: {
    Ip: L(14, 'kg m2', 'propeller', ['P2', 'P3'], 'ต่ำ', true, 'ช่วงที่เป็นไปได้ 10.8 (JSBSim prop_PT6.xml) ถึง 20 (ประมาณจากมวล 68.9 kg ใน TCDS)'),
    IreflectedEngine: L(0, 'kg m2', 'engine', [], 'ต่ำ', true, 'ความเฉื่อยของ power turbine สะท้อนผ่านเกียร์ (×15.07²) ไม่มีข้อมูล; ทดสอบความไวด้วย +5'),
  },
  governor: {
    kGov: L(1.0, 'deg/s per rpm', 'propeller', ['P1'], 'กลาง', false, 'กฎเดียวกับ JSBSim FGPropeller.cpp:345 (Pitch -= dRPM*dt)'),
    pitchRateMax: L(20, 'deg/s', 'propeller', ['P8'], 'ต่ำ', true, 'อนุมานจากเวลา feather 3-10 s ของ FAA (ช่วง ~70° → 7-23 °/s)'),
    oilMinRpm: L(200, 'rpm', 'propeller', ['P1'], 'กลาง', false, 'ต่ำกว่านี้ปั๊มน้ำมัน governor ไม่ทำงาน (JSBSim)'),
    betaFlightIdle: L(10, 'deg @0.75R', 'propeller', ['P8', 'P9'], 'ต่ำ', true, 'low-pitch stop; FAA fig 7-3 10-12°; C208 TCDS แปลงเป็น 0.75R ได้ 8.9-11.4°'),
    betaFeather: L(81, 'deg @0.75R', 'propeller', ['P8', 'P9'], 'กลาง', true, 'C208 TCDS แปลงเป็น 0.75R ได้ 80.8-81.3°; FAA 85-90° (ไม่ระบุสถานี)'),
    featherRate: L(15, 'deg/s', 'propeller', ['P8', 'P1'], 'ต่ำ', true, 'feather ใน ~5 s (FAA 3-10 s; JSBSim ~5 s)'),
  },
  betaReverse: {
    reverseAvailable: L(false, '-', 'propeller', ['P3'], 'กลาง', true, 'รุ่น -2 ไม่มี beta feedback และไม่อนุมัติ reverse; ATR ฯลฯ ในรอบหลังต้องตั้ง true'),
    betaGroundIdle: L(0, 'deg @0.75R', 'propeller', ['P8'], 'ต่ำ', true, 'ใช้เมื่อ reverseAvailable เท่านั้น'),
    betaReverseMax: L(-15, 'deg @0.75R', 'propeller', ['P7', 'P9'], 'ต่ำ', true, 'AFH: PT6 ประมาณ -11° (ไม่ระบุสถานี); C208 TCDS แปลงได้ -15.6/-20.7°'),
    reverseRpmMax: L(1825, 'rpm', 'engine', ['P9'], 'ต่ำ', true, 'อ้างอิงเชิงเปรียบเทียบจาก C208 (PT6A-114) max reverse 1825 rpm 1 นาที'),
    reverseCTstatic: L(-0.088, '-', 'propeller', [], 'ต่ำ', true, 'BEM สถิตแบบ mirrored annuli ที่ β=-15°: T ≈ -3.35 kN ที่ 1825 rpm, 136 kW; ที่ V>0 ทฤษฎีโมเมนตัมใช้ไม่ได้'),
  },
  feathered: {
    bladePlanformArea: L(0.66, 'm2', 'propeller', [], 'ต่ำ', true, 'B∫c dr ของรูปทรงใบสมมติ'),
    CDfeathered: L(0.06, '-', 'propeller', [], 'ต่ำ', true, 'แรงต้านใบที่ feather (หยุดหมุน) อิงพื้นที่ใบ: D = q·S_b·C_D'),
  },
  sim: {
    tableStepJ: L(0.1, '-', 'sim', [], 'กลาง', true, 'ความคลาดเคลื่อน bilinear < 2% เทียบ BEM ตรง'),
    tableStepBeta: L(5, 'deg', 'sim', [], 'กลาง', true, ''),
    useRealtimeBEM: L(false, '-', 'sim', [], 'สูง', true, 'BEM ตรงใช้ ~0.48 ms/ครั้ง × 960 ครั้ง/วินาทีจำลอง → ช้าเกิน; ใช้ตาราง'),
  },
  checks: {
    staticThrustISA: L(12.4, 'kN', 'propeller', [], 'ต่ำ', true, 'ผล BEM ที่ 700 kW, 2000 rpm, ρ=1.225, β75≈26.8°, FM≈0.58'),
    staticThrustVTBD31C: L(11.55, 'kN', 'propeller', [], 'ต่ำ', true, 'ρ=1.160, β75≈28.5°, FM≈0.54; ใกล้ AC.T0 = 11.5 kN'),
    momentumIdealStaticISA: L(17.77, 'kN', 'propeller', [], 'สูง', true, '(2ρA)^(1/3)P^(2/3), D=2.44 m, 700 kW'),
    peakEfficiency: L(0.88, '-', 'propeller', [], 'ต่ำ', true, 'สูงสุดของตารางที่ β75 30-40°, J 1.3-1.9'),
  },
} };
const s = JSON.stringify(out, null, 1);
JSON.parse(s);
fs.writeFileSync(new URL('./p3_params.json', import.meta.url), s);
console.log(s.length, 'chars OK');
// compact pretty print: numeric arrays on one line
let pretty = JSON.stringify(out, null, 2).replace(/\[\s*([-0-9.eE,\s]+?)\s*\]/g, (m, inner) => '[' + inner.split(',').map(x => x.trim()).join(', ') + ']');
pretty = pretty.replace(/\[\s*(\[[^\[\]]*\](?:,\s*\[[^\[\]]*\])*)\s*\]/g, (m, inner) => '[' + inner.replace(/\],\s*\[/g, '], [') + ']');
JSON.parse(pretty);
fs.writeFileSync(new URL('./p3_params_pretty.json', import.meta.url), pretty);
console.log('pretty', pretty.split('\n').length, 'lines');
// leaf-per-line serializer; 2-D tables get one row per line
function ser(x, ind) {
  const pad = ' '.repeat(ind);
  if (x && typeof x === 'object' && !Array.isArray(x) && 'v' in x && 'u' in x) {
    const rest = { u: x.u, scope: x.scope, src: x.src, conf: x.conf, est: x.est, note: x.note };
    const restS = JSON.stringify(rest).slice(1, -1).replace(/,"/g, ', "').replace(/":/g, '": ');
    const v = x.v;
    if (v && typeof v === 'object' && Array.isArray(v.data) && Array.isArray(v.data[0])) {
      const rows = v.data.map(r => pad + '      ' + JSON.stringify(r).replace(/,/g, ', ')).join(',\n');
      return `{"v": {"axes": ${JSON.stringify(v.axes).replace(/,/g, ', ').replace(/":/g, '": ')},\n${pad}    "data": [\n${rows}]},\n${pad}  ${restS}}`;
    }
    return `{"v": ${JSON.stringify(v).replace(/,/g, ', ').replace(/":/g, '": ')}, ${restS}}`;
  }
  const keys = Object.keys(x);
  return '{\n' + keys.map((k, i) => pad + '  ' + JSON.stringify(k) + ': ' + ser(x[k], ind + 2) + (i < keys.length - 1 ? ',' : '')).join('\n') + '\n' + pad + '}';
}
const compact = ser(out, 0);
JSON.parse(compact);
fs.writeFileSync(new URL('./p3_params_compact.json', import.meta.url), compact);
console.log('compact', compact.split('\n').length, 'lines');
