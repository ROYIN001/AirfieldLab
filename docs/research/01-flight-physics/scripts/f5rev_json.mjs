// Section 5 review: extract json blocks, parse, check leaf shape/scope/units
import fs from 'fs';
const md = fs.readFileSync(process.argv[2], 'utf8');
const blocks = [...md.matchAll(/```json\n([\s\S]*?)```/g)].map(m => m[1]);
const scopes = new Set(['aircraft','engine','propeller','gear','environment','sim']);
const keys = ['v','u','scope','src','conf','est','note'];
let nLeaf = 0; const bad = [];
for (const b of blocks) { let J; try { J = JSON.parse(b); } catch (e) { console.log('PARSE FAIL', e.message); continue; }
  (function walk(o, p) { if (o && typeof o === 'object' && !Array.isArray(o)) {
    if ('v' in o && 'scope' in o) { nLeaf++; const ks = Object.keys(o);
      if (ks.length !== 7 || !keys.every(k => ks.includes(k))) bad.push(p + ' keys ' + ks);
      if (!scopes.has(o.scope)) bad.push(p + ' scope ' + o.scope);
      if (!['สูง','กลาง','ต่ำ'].includes(o.conf)) bad.push(p + ' conf ' + o.conf);
      if (typeof o.est !== 'boolean') bad.push(p + ' est');
      if (!Array.isArray(o.src)) bad.push(p + ' src');
      for (const s of o.src) if (!new RegExp('\\[' + s + '\\]').test(md.split('### 5.13')[1])) bad.push(p + ' src missing in refs ' + s);
      if (o.est === true && !/ค่าประมาณ|ยังไม่ยืนยัน/.test(o.note)) bad.push(p + ' est w/o label: ' + o.note);
      return; }
    for (const [k, v] of Object.entries(o)) walk(v, p + '.' + k); } })(J, '');
}
console.log('blocks', blocks.length, 'leaves', nLeaf); console.log(bad.join('\n'));
