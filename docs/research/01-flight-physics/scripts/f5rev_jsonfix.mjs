// Section 5 review: targeted fixes inside the json block of sec-05 (labels, wrong N2 100% value, provenance notes); keeps one-leaf-per-line format
import fs from 'fs';
const file = process.argv[2]; const md = fs.readFileSync(file, 'utf8');
const m = md.match(/```json\n([\s\S]*?)```/); const J = JSON.parse(m[1]);
const T = J.turbofan, E7 = T.engines.CFM56_7B27_class, E5 = T.engines.CFM56_5B4_class, EL = T.engines.LEAP_1A26_class;
E5.N2_100_rpm = { v: 14460, u: 'rpm', scope: 'engine', src: ['F14'], conf: 'ต่ำ', est: true,
  note: 'ยังไม่ยืนยัน; ค่าประมาณโดยสมมติว่าแกน HP เท่ากับ CFM56-7B (E.004: 15183 rpm = 105% จึง 100% ≈ 14460 rpm); ฉบับก่อนใส่ 15183 ซึ่งเป็นรอบสูงสุด 105% ไม่ใช่ 100%' };
for (const e of [E7, E5, EL]) if (e.N2_AI_pct) e.N2_AI_pct.note += '; ผลของ high-speed idle ใน F18 ยังไม่ยืนยันซ้ำในการตรวจ';
E7.kT_perK.note += ' (ตัวเลขใน F12 ยังไม่ได้เปิดยืนยันซ้ำในการตรวจ)';
T.idleAndLTO.LTO_pct.note = '40 CFR 1031.140(e) Table 1 (LTO Test Cycles: 100/85/30/7% ที่ 0.7/2.2/4.0/26.0 นาที; สอดคล้อง ICAO Annex 16 Vol II) เป็นจุดทดสอบไอเสีย ไม่ใช่ค่า idle จริง';
T.reverser.revSpool_target_s.note = 'reverse idle -> max reverse ~3 s เป็นสมมติฐานของงานจำลอง ไม่ใช่ค่าวัด (ยังไม่ได้เปิด F29 ยืนยันซ้ำในการตรวจ); โมเดลให้ 4.6 s';
T.reverser.LDF_AC91_79B.note = 'Table 3-1 คอลัมน์ turbojet; RwyCC 5 = grooved/PFC (RwyCC 5 smooth = 2.6/2.2)';
T.sim.testFixture_A320class.note = 'ค่าสมมติสำหรับ test; จาก AC 25-32 มีเฉพาะ mu RCC3 = 0.163, RCC1 = 0.083 (Table 2), 7 s ที่ 98% ของ VAPP และ VTD = 0.96 VAPP; mu แห้ง 0.40, RCC5 0.25, RCC2 0.12 และค่าโครงเครื่องบินเป็นค่าสมมติ';
T.sim.vmcFixture_JSBSim737.note = 'จาก JSBSim 737.xml/CFM56.xml (ค่าเดาจากข้อมูลสาธารณะ) ใช้ทดสอบสูตร; 737.xml ประกาศ GPL ในส่วนหัว ใช้ตัวเลขเป็นข้อเท็จจริงได้ ห้ามคัดลอกไฟล์';
T.lapse.takeoffModel.note = 'ใช้กับ take-off/go-around/ไต่ต้น; สัมประสิทธิ์ยืนยันจากโค้ด OpenAP; ข้อความ ±1% ถึง M 0.4 มาจากบทคัดย่อ (ยังไม่ได้เปิดยืนยันซ้ำในการตรวจ)';
// every est:true leaf must carry the label in its note
let n = 0;
(function walk(o) { for (const v of Object.values(o)) { if (v && typeof v === 'object' && 'v' in v && 'scope' in v) {
  if (v.est === true && !/ค่าประมาณ|ยังไม่ยืนยัน/.test(v.note)) { v.note = 'ค่าประมาณ: ' + v.note; n++; } } else if (v && typeof v === 'object') walk(v); } })(J);
const isLeaf = (o) => o && typeof o === 'object' && 'v' in o && 'scope' in o;
function ser(o, ind) { const pad = ' '.repeat(ind);
  const parts = Object.entries(o).map(([k, v]) => pad + ' ' + JSON.stringify(k) + ': ' + (isLeaf(v) ? JSON.stringify(v) : ser(v, ind + 1)));
  return '{\n' + parts.join(',\n') + '\n' + pad + '}'; }
const txt = ser(J, 0); JSON.parse(txt);
fs.writeFileSync(file, md.replace(m[1], txt + '\n'));
console.log('labelled', n);
