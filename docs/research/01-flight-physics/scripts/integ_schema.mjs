// Build docs/research/01-flight-physics/schema.md and params-trainer.json from the section files.
import fs from 'fs';
const [dir, outDir] = process.argv.slice(2);
const SEC = [
  ['01-aero.md', 'aero', 1, 'อากาศพลศาสตร์ stall และ spin'],
  ['02-interference.md', 'interference', 2, 'downwash lag, ground effect, slipstream'],
  ['03-propeller.md', 'propeller', 3, 'ใบพัด'],
  ['04-turboprop.md', 'turboprop', 4, 'เทอร์โบพร็อปคลาส PT6A'],
  ['05-turbofan.md', 'turbofan', 5, 'เทอร์โบแฟน'],
  ['06-controls.md', 'controls', 6, 'ระบบบังคับ'],
  ['07-gear.md', 'gear', 7, 'ล้อและพื้น'],
  ['08-wind.md', 'wind', 8, 'ลม ความปั่นป่วน microburst wake'],
  ['09-numerics.md', 'numerics', 9, 'วิธีเชิงตัวเลข'],
  ['10-validation.md', 'validation', 10, 'การตรวจความสมจริง'],
  ['11-input.md', 'input', 11, 'อินพุต'],
  ['12-other-sims.md', 'otherSims', 12, 'ซิมตัวอื่น'],
];
const perType = new Set(['aircraft', 'engine', 'propeller', 'gear']);
const merged = {}; const rows = {}; const stats = {};
const fmt = (v) => {
  if (typeof v === 'number') return String(+v.toPrecision(6));
  if (typeof v === 'string' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) { const s = JSON.stringify(v); return s.length > 48 ? s.slice(0, 45) + '…]' : s; }
  if (v && typeof v === 'object') {
    if (v.axes) return 'ตาราง ' + Object.entries(v.axes).map(([k, a]) => `${k}[${Array.isArray(a) ? a.length : '?'}]`).join(' × ');
    const s = JSON.stringify(v); return s.length > 48 ? s.slice(0, 45) + '…}' : s;
  }
  return String(v);
};
const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
for (const [file, key, no] of SEC) {
  const p = dir + '/' + file; if (!fs.existsSync(p)) continue;
  const s = fs.readFileSync(p, 'utf8');
  const blocks = [...s.matchAll(/```json\n([\s\S]*?)\n```/g)].map(m => m[1]);
  rows[key] = []; stats[key] = { aircraft: 0, engine: 0, propeller: 0, gear: 0, environment: 0, sim: 0, est: 0, total: 0 };
  for (const b of blocks) {
    let j; try { j = JSON.parse(b); } catch (e) { console.error('JSON error', file, e.message); continue; }
    if (Object.keys(j).length !== 1 || !(key in j)) continue;
    merged[key] = j[key];
    const walk = (o, path) => {
      if (o && typeof o === 'object' && !Array.isArray(o)) {
        if ('v' in o && ('u' in o || 'scope' in o)) {
          rows[key].push({ path: path.slice(1), ...o });
          stats[key][o.scope] = (stats[key][o.scope] || 0) + 1; stats[key].total++; if (o.est) stats[key].est++;
          return;
        }
        for (const k in o) walk(o[k], path + '.' + k);
      }
    };
    walk(j[key], '');
  }
}
let md = `# ภาคผนวก: schema พารามิเตอร์ของรอบที่ 1

← [กลับไปหน้ารวมรอบที่ 1](../01-flight-physics.md)

ไฟล์นี้สร้างอัตโนมัติจากบล็อก JSON ของทั้ง 12 หัวข้อ (สคริปต์ \`scripts/integ_schema.mjs\`) ค่าทุกตัวมาจากไฟล์หัวข้อนั้น ถ้าแก้ค่าให้แก้ที่ไฟล์หัวข้อแล้วสร้างไฟล์นี้ใหม่ ไฟล์ [params-trainer.json](params-trainer.json) รวมบล็อก JSON ทั้งหมดไว้ในอ็อบเจกต์เดียวสำหรับให้โค้ดอ่าน

## รูปแบบของพารามิเตอร์หนึ่งตัว (leaf)

| ฟิลด์ | ความหมาย |
|---|---|
| \`v\` | ค่า เป็นตัวเลข อาร์เรย์ หรือตาราง \`{"axes": {...}, "data": [...]}\` |
| \`u\` | หน่วย (SI เป็นหลัก เช่น \`m\`, \`kg\`, \`N\`, \`rad\`, \`1/rad\`; ตารางหรือค่าไร้หน่วยใช้ \`-\`) |
| \`scope\` | \`aircraft\`, \`engine\`, \`propeller\`, \`gear\` = ต้องเติมรายแบบเครื่องบินในรอบ 2–3 · \`environment\` = สภาพแวดล้อม ใช้ร่วมทุกแบบ · \`sim\` = ค่าตั้งของเครื่องจำลอง |
| \`src\` | รหัสแหล่งอ้างอิงในไฟล์หัวข้อ เช่น \`["G6"]\` |
| \`conf\` | ความเชื่อมั่น \`สูง\` / \`กลาง\` / \`ต่ำ\` |
| \`est\` | \`true\` = ค่าประมาณ (ออกแบบหรือคำนวณเอง ไม่ได้มาจากเอกสารโดยตรง) |
| \`note\` | หมายเหตุภาษาไทย |

## จำนวนพารามิเตอร์ตามหมวด

| หมวด (key) | หัวข้อ | aircraft | engine | propeller | gear | environment | sim | รวม | ค่าประมาณ |
|---|---|---|---|---|---|---|---|---|---|
`;
let tot = { aircraft: 0, engine: 0, propeller: 0, gear: 0, environment: 0, sim: 0, total: 0, est: 0 };
for (const [file, key, no, th] of SEC) {
  const s = stats[key]; if (!s) continue;
  md += `| \`${key}\` | [${no}. ${th}](${file}) | ${s.aircraft} | ${s.engine} | ${s.propeller} | ${s.gear} | ${s.environment} | ${s.sim} | ${s.total} | ${s.est} |\n`;
  for (const k in tot) tot[k] += s[k] || 0;
}
md += `| **รวม** | | ${tot.aircraft} | ${tot.engine} | ${tot.propeller} | ${tot.gear} | ${tot.environment} | ${tot.sim} | ${tot.total} | ${tot.est} |\n\n`;
md += `ค่าในคอลัมน์ "ค่าเครื่องฝึก" เป็นค่าของเครื่องฝึกเทอร์โบพร็อปสมมติของ AirfieldLab (หรือค่าตัวอย่างของแบบอ้างอิง เช่น CFM56 ในหมวด turbofan) ไม่ใช่ข้อมูลของเครื่องบินแบบใดแบบหนึ่ง\n\n`;
for (const [file, key, no, th] of SEC) {
  const r = rows[key]; if (!r) continue;
  md += `## \`${key}\` — [หัวข้อ ${no}. ${th}](${file})\n\n`;
  const a = r.filter(x => perType.has(x.scope)), b = r.filter(x => !perType.has(x.scope));
  const table = (list) => {
    let t = `| path | หน่วย | scope | ค่าเครื่องฝึก | ค่าประมาณ | ความเชื่อมั่น | แหล่ง |\n|---|---|---|---|---|---|---|\n`;
    for (const x of list) t += `| \`${esc(x.path)}\` | ${esc(x.u)} | ${x.scope} | ${esc(fmt(x.v))} | ${x.est ? 'ใช่' : ''} | ${esc(x.conf)} | ${esc((x.src || []).join(', '))} |\n`;
    return t + '\n';
  };
  if (a.length) md += `### ต้องเติมรายแบบเครื่องบิน (${a.length})\n\n` + table(a);
  if (b.length) md += `### ใช้ร่วม: สภาพแวดล้อมและค่าตั้งเครื่องจำลอง (${b.length})\n\n` + table(b);
}
fs.writeFileSync(outDir + '/schema.md', md);
fs.writeFileSync(outDir + '/params-trainer.json', JSON.stringify({
  _meta: { note: 'รวมบล็อก JSON ของรอบที่ 1 (docs/research/01-flight-physics/*.md) สร้างอัตโนมัติ ห้ามแก้ไฟล์นี้ด้วยมือ', leaf: '{v,u,scope,src,conf,est,note}', generated: process.argv[4] || '' },
  ...merged }, null, 1) + '\n');
console.log(JSON.stringify(tot));
