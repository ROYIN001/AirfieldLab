#!/usr/bin/env node
// Round 3 (airliners): write schema.md, a per-category table of every parameter path with the value of each
// aircraft type side by side, from the params-*.json files written by r3_merge.mjs and its merge-report.json.
// Pure Node >= 18, no dependencies.
//
// usage: node r3_schema.mjs [--dir <folder with params-*.json and merge-report.json>] [--out <schema.md>]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const DIR = path.resolve(opt('--dir', path.join(HERE, '..')));
const OUT = path.resolve(opt('--out', path.join(DIR, 'schema.md')));

const TYPES = [
  ['atr72_600', 'ATR 72-600'], ['b737_800', '737-800'], ['a320ceo', 'A320ceo'], ['a320neo', 'A320neo'],
  ['a321ceo', 'A321ceo'], ['a321neo', 'A321neo'], ['a330_300', 'A330-300'],
];
const TOPIC = { R: 1, B: 2, L: 3, H: 4, D: 5, J: 6, Y: 7, Z: 8, O: 9, K: 10 };
const TOPIC_FILE = {
  1: '01-atr72-600.md', 2: '02-b737-800.md', 3: '03-a320-a321.md', 4: '04-a330-300.md', 5: '05-airport-geometry.md',
  6: '06-jet-engines.md', 7: '07-flight-controls.md', 8: '08-fbw-laws.md', 9: '09-afcs-autoland.md', 10: '10-fctm-technique.md',
};
const CAT_TH = {
  _na: 'หมวดที่ไม่ใช้กับแบบนั้น', airframe: 'โครงสร้าง น้ำหนัก CG และเรขาคณิต', aero: 'อากาศพลศาสตร์', interference: 'ผลกระทบระหว่างชิ้นส่วน (downwash, ground effect)',
  speeds: 'ความเร็วอ้างอิงและความเร็วจำกัด', performance: 'สมรรถนะอ้างอิง', propulsion: 'การจัดวางเครื่องยนต์', turbofan: 'เครื่องยนต์เทอร์โบแฟน',
  turboprop: 'เครื่องยนต์เทอร์โบพร็อป', propeller: 'ใบพัด', gear: 'ล้อ ยาง เบรก และการเลี้ยว', wind: 'ลมและ wake', controls: 'ระบบบังคับการบิน',
  afcs: 'autopilot, flight director, autothrust, autoland', ops: 'เทคนิคการบินมาตรฐาน (FCTM)', validation: 'ค่าตรวจโมเดล', numerics: 'ตัวเลข', input: 'อินพุต', otherSims: 'ซิมตัวอื่น',
};

const read = f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
const isObj = o => o && typeof o === 'object' && !Array.isArray(o);
const isLeaf = o => isObj(o) && 'v' in o && 'scope' in o;
function* walk(o, p = '') {
  if (isLeaf(o)) { yield [p, o]; return; }
  if (!isObj(o)) return;
  for (const [k, v] of Object.entries(o)) if (k !== '_meta' && k !== '_inherits') yield* walk(v, p ? `${p}.${k}` : k);
}
const num = x => (Number.isInteger(x) ? String(x) : String(Number(x.toPrecision(5))));
function fmt(v, depth = 0) {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'number') return num(v);
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) {
    if (v.length > 6) return `อาร์เรย์ ${v.length} ค่า`;
    return '[' + v.map(x => fmt(x, depth + 1)).join(', ') + ']';
  }
  if (isObj(v)) {
    if ('axes' in v || 'data' in v) {
      const count = o => (Array.isArray(o) ? o.reduce((s, x) => s + count(x), 0) : isObj(o) ? Object.values(o).reduce((s, x) => s + count(x), 0) : 1);
      return `ตาราง ${count(v.data ?? [])} ค่า`;
    }
    if (depth > 1) return '{…}';
    return Object.entries(v).map(([k, x]) => `${k} ${fmt(x, depth + 1)}`).join('; ');
  }
  return String(v);
}
const cell = (s, max = 60) => {
  s = String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
};
const topicsOf = leaf => [...new Set((leaf.src || []).map(s => TOPIC[String(s).replace(/^R\d:.*/, '')[0]]).filter(Boolean))];

const params = {}, leaves = {};
for (const [id] of TYPES) {
  params[id] = read(`params-${id.replace(/_/g, '-')}.json`);
  leaves[id] = new Map(walk(params[id]));
}
const common = new Map(walk(read('params-common-airliner.json')));
const report = read('merge-report.json');

// union of paths per category
const union = new Map();
for (const [id] of TYPES) for (const [p, l] of leaves[id]) {
  if (!union.has(p)) union.set(p, { u: l.u, scope: l.scope, topics: new Set() });
  topicsOf(l).forEach(t => union.get(p).topics.add(t));
}
const cats = [...new Set([...union.keys()].map(p => p.split('.')[0]))];
const ORDER = Object.keys(CAT_TH);
cats.sort((a, b) => (ORDER.indexOf(a) + 1 || 99) - (ORDER.indexOf(b) + 1 || 99));

const L = [];
L.push('# ภาคผนวก: schema พารามิเตอร์รายแบบของรอบที่ 3', '');
L.push('← [กลับไปหน้ารวมรอบที่ 3](../03-airliners.md) · [schema ส่วนขยาย](schema-ext.md) · [schema ของรอบที่ 1](../01-flight-physics/schema.md)', '');
L.push('ไฟล์นี้สร้างอัตโนมัติ (สคริปต์ `scripts/r3_schema.mjs`) จากไฟล์ `params-*.json` ซึ่ง `scripts/r3_merge.mjs` รวมมาจากบล็อก JSON ในไฟล์หัวข้อทั้ง 10 ไฟล์ ' +
  'ค่าทุกตัวมาจากไฟล์หัวข้อ ถ้าจะแก้ค่าให้แก้ที่ไฟล์หัวข้อ แล้วรันสองสคริปต์นี้ใหม่ตามลำดับ (`node scripts/r3_merge.mjs --dir . --out .` แล้ว `node scripts/r3_schema.mjs`)', '');
L.push('รูปแบบของพารามิเตอร์หนึ่งตัวเหมือนรอบที่ 1 คือ `{v, u, scope, src, conf, est, note}` หมวดที่รอบที่ 3 เพิ่ม (airframe, speeds, performance, propulsion, controls.architecture, controls.fbw, afcs, ops) อธิบายไว้ใน [schema-ext.md](schema-ext.md)', '');
L.push('วิธีอ่านตาราง: ค่าที่ขึ้นต้นด้วย ≈ คือ **ค่าประมาณ** (`est: true`) ค่าที่ไม่มีเครื่องหมายมาจากเอกสารหรือคำนวณตรงจากเอกสาร · "—" คือแบบนั้นไม่มีพารามิเตอร์นี้ · "ตาราง n ค่า" คือ lookup table ให้ดูค่าเต็มในไฟล์ JSON · ข้อความยาวถูกตัดด้วย … ความเชื่อมั่น แหล่ง และหมายเหตุของแต่ละค่าอยู่ในไฟล์ `params-<แบบ>.json` และในไฟล์หัวข้อ', '');

// summary per type
L.push('## จำนวนพารามิเตอร์ต่อแบบ', '');
L.push('| แบบ | ไฟล์ | พารามิเตอร์ | ค่าประมาณ | ความเชื่อมั่น สูง / กลาง / ต่ำ | path ของรอบที่ 1 ที่เติมแล้ว | ไม่ใช้กับแบบนี้ (n/a) | ยังขาด |', '|---|---|---|---|---|---|---|---|');
for (const [id, name] of TYPES) {
  const ls = [...leaves[id].values()];
  const est = ls.filter(l => l.est).length;
  const c = k => ls.filter(l => l.conf === k).length;
  const cov = report.coverage?.[id] || {};
  const file = `params-${id.replace(/_/g, '-')}.json`;
  L.push(`| ${name} | [${file}](${file}) | ${ls.length} | ${est} | ${c('สูง')} / ${c('กลาง')} / ${c('ต่ำ')} | ${cov.filled ?? '—'} / ${cov.r1 ?? '—'} | ${cov.na ?? '—'} | ${cov.missing?.length ?? '—'} |`);
}
const cl = [...common.values()];
L.push(`| ใช้ร่วม (common_airliner) | [params-common-airliner.json](params-common-airliner.json) | ${cl.length} | ${cl.filter(l => l.est).length} | ${['สูง', 'กลาง', 'ต่ำ'].map(k => cl.filter(l => l.conf === k).length).join(' / ')} | — | — | — |`);
L.push('', 'แบบ A320neo, A321ceo และ A321neo สืบค่าจาก A320ceo ผ่าน `_inherits` แล้วเขียนทับเฉพาะค่าที่ต่างกัน ไฟล์ params รายแบบเป็นค่าหลังสืบทอดแล้ว', '');

// per category counts
L.push('## จำนวนพารามิเตอร์ตามหมวด', '');
L.push('| หมวด | ความหมาย | ' + TYPES.map(t => t[1]).join(' | ') + ' |', '|---|---|' + TYPES.map(() => '---|').join(''));
for (const c of cats) {
  const row = TYPES.map(([id]) => {
    const ls = [...leaves[id]].filter(([p]) => p === c || p.startsWith(c + '.'));
    const e = ls.filter(([, l]) => l.est).length;
    return ls.length ? `${ls.length} (≈${e})` : '—';
  });
  L.push(`| \`${c}\` | ${CAT_TH[c] || ''} | ${row.join(' | ')} |`);
}
L.push('', 'ตัวเลขในวงเล็บคือจำนวนค่าประมาณ', '');

// coverage of round-1 per-type paths
L.push('## path รายแบบของรอบที่ 1 ที่ยังไม่มีค่า', '');
L.push('รอบที่ 1 กำหนด path ที่ต้องเติมรายแบบไว้ 384 path ส่วนใหญ่ที่ยังขาดเป็นโครงสร้างที่ออกแบบมาสำหรับเครื่องฝึกขนาดเล็ก ' +
  '(เช่น hinge moment ของคันบังคับแบบสายเคเบิล, รายละเอียดยางและโช้คแบบหนึ่งล้อ, ค่าของซิมตัวอื่น) หรือเป็น path ของรุ่นเครื่องยนต์แบบคลาสใน `turbofan.engines` ' +
  'ซึ่งรอบที่ 3 เก็บค่าจริงไว้ใต้ชื่อของเครื่องยนต์แต่ละรุ่นแทน ตารางนี้นับตามกลุ่ม path สองระดับแรก', '');
const groups = new Map();
for (const [id] of TYPES) for (const p of report.coverage?.[id]?.missing || []) {
  const g = p.split('.').slice(0, 2).join('.');
  if (!groups.has(g)) groups.set(g, {});
  groups.get(g)[id] = (groups.get(g)[id] || 0) + 1;
}
L.push('| กลุ่ม path | ' + TYPES.map(t => t[1]).join(' | ') + ' |', '|---|' + TYPES.map(() => '---|').join(''));
for (const [g, n] of [...groups].sort((a, b) => a[0].localeCompare(b[0])))
  L.push(`| \`${g}\` | ${TYPES.map(([id]) => n[id] || '—').join(' | ')} |`);
L.push('');

// per category tables
for (const c of cats) {
  const paths = [...union.keys()].filter(p => p === c || p.startsWith(c + '.')).sort();
  const tset = new Set(); paths.forEach(p => union.get(p).topics.forEach(t => tset.add(t)));
  const links = [...tset].sort((a, b) => a - b).map(t => `[3.${t}](${TOPIC_FILE[t]})`).join(', ');
  L.push(`## \`${c}\` ${CAT_TH[c] || ''} (${paths.length})`, '');
  if (links) L.push(`หัวข้อที่ให้ค่า: ${links}`, '');
  L.push('| path | หน่วย | ' + TYPES.map(t => t[1]).join(' | ') + ' |', '|---|---|' + TYPES.map(() => '---|').join(''));
  for (const p of paths) {
    const rel = p === c ? p : p.slice(c.length + 1);
    const vals = TYPES.map(([id]) => {
      const l = leaves[id].get(p);
      if (!l) return '—';
      return cell((l.est ? '≈' : '') + fmt(l.v), 48);
    });
    L.push(`| \`${cell(rel, 70)}\` | ${cell(union.get(p).u ?? '', 16)} | ${vals.join(' | ')} |`);
  }
  L.push('');
}

// common
L.push(`## ค่าที่ใช้ร่วมทุกแบบ (common_airliner) (${common.size})`, '');
L.push('| path | หน่วย | ค่า | ความเชื่อมั่น | แหล่ง |', '|---|---|---|---|---|');
for (const [p, l] of [...common].sort((a, b) => a[0].localeCompare(b[0])))
  L.push(`| \`${cell(p, 70)}\` | ${cell(l.u ?? '', 16)} | ${cell((l.est ? '≈' : '') + fmt(l.v), 70)} | ${l.conf} | ${(l.src || []).join(', ')} |`);
L.push('');

fs.writeFileSync(OUT, L.join('\n'));
console.log('wrote', OUT, Math.round(fs.statSync(OUT).size / 1024), 'KB,', union.size, 'paths,', cats.length, 'categories,', common.size, 'common');
