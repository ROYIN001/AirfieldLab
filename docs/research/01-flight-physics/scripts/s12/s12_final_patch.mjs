// Final-pass patch for sec-12: add JSON leaves, test T-S-13, refs S30 and S8 licence URL.
import fs from 'node:fs';
const f = process.argv[2];
let s = fs.readFileSync(f, 'utf8');
const rep = (a, b) => { if (!s.includes(a)) throw new Error('missing: ' + a.slice(0, 60)); s = s.replace(a, b); };
rep(`   "gearSpringExponentDefault"`, `   "elevatorTrimModel": {"v": {"mode": "additive to elevator deflection", "limits": ["elevator_trim_limit", "elevator_trim_up_limit", "elevator_trim_down_limit"], "scaling": "elevator_trim_elasticity_table(qbar_psf), default 0.0:1.0"}, "u": "deg", "scope": "aircraft", "src": ["S20"], "conf": "สูง", "est": false, "note": "MSFS 2020 [AIRPLANE_GEOMETRY] trim บวกเข้ามุม elevator และลดตาม qbar ได้"},
   "gearSpringExponentDefault"`);
rep(`   "enginePartThrust"`, `   "inputModel": {"v": {"modes": ["mouse", "keyboard", "orientation", "touch", "joystick"], "perMode": ["sensitivity", "exponential", "mixYawRoll", "mixYawRollQuantity"], "keyboard": ["rollIncrement", "pitchIncrement", "yawIncrement", "throttleIncrement", "recenterRatio"], "joystick": ["deadZoneUp", "deadZoneDown"], "trim": ["elevatorTrimMin", "elevatorTrimMax", "elevatorTrimStep"]}, "u": "-", "scope": "sim", "src": ["S26"], "conf": "ต่ำ", "est": false, "note": "ชื่อฟิลด์จาก typings ชุมชน ไม่มีค่าตัวเลข"},
   "enginePartThrust"`);
rep(`   "stepCostNode"`, `   "trimKind": {"v": {"options": ["tab", "ths"], "trainer": "tab"}, "u": "-", "scope": "aircraft", "src": ["S30", "S15", "S20"], "conf": "กลาง", "est": true, "note": "tab = ตำแหน่งพักของคันเลื่อน; ths = มุมหางเปลี่ยน โมเมนต์บวกเพิ่ม elevator ยังมีระยะครบ"},
   "stepCostNode"`);
rep(`| T-S-08 | trim เป็นตำแหน่งพัก ไม่กินระยะคัน | DIRECT, trim −5°`, `| T-S-08 | trim เป็นตำแหน่งพัก ไม่กินระยะคัน | DIRECT, \`trim.kind = tab\`, trim −5°`);
rep(`| T-S-09 |`, `| T-S-13 | trim แบบ stabilizer (THS) ไม่กินระยะ elevator | DIRECT, \`trim.kind = ths\`, $\\Delta i_h$ = −1°, α และ $\\bar q$ คงที่, คัน y = ±1 | δe ดันสุด +15.0°, ดึงสุด −22.0° (± 0.1°); $\\Delta C_m = C_{m_{i_h}}\\Delta i_h$ (± 1e-9) | [S30, p. 6-12], [S20] | ยังไม่มีฟีเจอร์ |
| T-S-09 |`);
rep(`8. [S8] JSBSim, *Aeromatic* https://jsbsim.sourceforge.net/aeromatic2.html (repo https://github.com/JSBSim-Team/aeromatic ซึ่ง GitHub แสดงเป็น AGPL-3.0)`, `8. [S8] JSBSim, *Aeromatic* https://jsbsim.sourceforge.net/aeromatic2.html และ repo https://github.com/JSBSim-Team/aeromatic (ไฟล์ LICENSE: GNU AGPL v3, https://raw.githubusercontent.com/JSBSim-Team/aeromatic/master/LICENSE)`);
rep(`29. [S29]`, `30. [S30] FAA, *Pilot's Handbook of Aeronautical Knowledge* FAA-H-8083-25C, Ch. 6 Flight Controls, pp. 6-10–6-12 (Trim Tabs, Adjustable Stabilizer) https://www.faa.gov/sites/faa.gov/files/08_phak_ch6.pdf — ปฐมภูมิ · US Government work (public domain) · อ้างและสรุปได้เต็มที่
29. [S29]`);
fs.writeFileSync(f, s);
const j = JSON.parse(s.match(/```json\n([\s\S]*?)```/)[1]);
fs.writeFileSync(new URL('./s12_params.json', import.meta.url), JSON.stringify(j, null, 1));
let n = 0; (function w(o) { for (const k in o) { const v = o[k]; if (v && typeof v === 'object' && 'v' in v && 'scope' in v) n++; else if (v && typeof v === 'object') w(v); } })(j);
console.log('ok leaves', n, 'bytes', Buffer.byteLength(s));
