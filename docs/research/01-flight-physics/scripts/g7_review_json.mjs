// Review: extract ```json blocks from sec-07-gear.md, JSON.parse, check leaf shape
import fs from 'fs';
const f = process.argv[2] || 'docs/research/01-flight-physics/sec-07-gear.md';
const md = fs.readFileSync(f, 'utf8');
const blocks = [...md.matchAll(/```json\n([\s\S]*?)```/g)].map(m => m[1]);
console.log('blocks', blocks.length);
const keys = ['v','u','scope','src','conf','est','note'];
const scopes = new Set(['aircraft','engine','propeller','gear','environment','sim']);
let leaves = 0, bad = 0;
const walk = (o, p) => {
  if (o && typeof o === 'object' && 'v' in o && 'u' in o) {
    leaves++;
    const ks = Object.keys(o);
    const miss = keys.filter(k => !(k in o)), extra = ks.filter(k => !keys.includes(k));
    const errs = [];
    if (miss.length) errs.push('missing ' + miss);
    if (extra.length) errs.push('extra ' + extra);
    if (!scopes.has(o.scope)) errs.push('scope ' + o.scope);
    if (!Array.isArray(o.src)) errs.push('src not array');
    if (!['สูง','กลาง','ต่ำ'].includes(o.conf)) errs.push('conf ' + o.conf);
    if (typeof o.est !== 'boolean') errs.push('est');
    if (typeof o.note !== 'string') errs.push('note');
    if (o.est === false && o.src.length === 0) errs.push('est false but no src');
    if (errs.length) { bad++; console.log(p, errs.join('; ')); }
    return;
  }
  if (o && typeof o === 'object') for (const k in o) walk(o[k], p + '.' + k);
};
blocks.forEach((b, i) => { try { const j = JSON.parse(b); walk(j, 'b' + i); } catch (e) { console.log('PARSE FAIL', i, e.message); } });
console.log('leaves', leaves, 'bad', bad);
