import fs from 'fs';
const md = fs.readFileSync(process.argv[2], 'utf8');
const blocks = [...md.matchAll(/```json\n([\s\S]*?)```/g)].map(m => m[1]);
console.log('json blocks', blocks.length);
for (const b of blocks) {
  let j; try { j = JSON.parse(b); console.log('PARSE OK'); } catch (e) { console.log('PARSE FAIL', e.message); continue; }
  console.log('top keys', Object.keys(j));
  const keys = ['v','u','scope','src','conf','est','note'];
  const scopes = new Set(['aircraft','engine','propeller','gear','environment','sim']);
  let n = 0;
  const walk = (o, p) => {
    if (o && typeof o === 'object' && !Array.isArray(o) && 'v' in o) {
      n++;
      const ks = Object.keys(o);
      const miss = keys.filter(k => !ks.includes(k)), extra = ks.filter(k => !keys.includes(k));
      const bad = [];
      if (miss.length) bad.push('miss ' + miss);
      if (extra.length) bad.push('extra ' + extra);
      if (!scopes.has(o.scope)) bad.push('scope ' + o.scope);
      if (!['สูง','กลาง','ต่ำ'].includes(o.conf)) bad.push('conf ' + o.conf);
      if (typeof o.est !== 'boolean') bad.push('est ' + o.est);
      if (bad.length) console.log('BAD', p, bad.join('; '));
      if (process.argv[3]) console.log(p, JSON.stringify(o.v), '|', o.u, '|', o.scope, '|', o.src, '|', o.conf, '|', o.est);
      return;
    }
    if (o && typeof o === 'object') for (const k of Object.keys(o)) walk(o[k], p + '.' + k);
  };
  walk(j, '');
  console.log('leaves', n);
}
