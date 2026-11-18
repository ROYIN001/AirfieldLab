import fs from 'fs';
const t = fs.readFileSync(process.argv[2], 'utf8');
const blocks = [...t.matchAll(/```json\n([\s\S]*?)```/g)].map(m => m[1]);
console.log('blocks', blocks.length);
for (const b of blocks) {
  let j; try { j = JSON.parse(b); console.log('parse OK'); } catch (e) { console.log('PARSE ERR', e.message); continue; }
  const keys = ['v','u','scope','src','conf','est','note'];
  const scopes = ['aircraft','engine','propeller','gear','environment','sim'];
  const walk = (o, p) => {
    if (o && typeof o === 'object' && 'v' in o && 'scope' in o) {
      const k = Object.keys(o);
      const miss = keys.filter(x => !k.includes(x)), extra = k.filter(x => !keys.includes(x));
      if (miss.length || extra.length) console.log(p, 'miss', miss, 'extra', extra);
      if (!scopes.includes(o.scope)) console.log(p, 'bad scope', o.scope);
      if (!['สูง','กลาง','ต่ำ'].includes(o.conf)) console.log(p, 'bad conf', o.conf);
      if (typeof o.est !== 'boolean') console.log(p, 'est not bool');
      if (!Array.isArray(o.src)) console.log(p, 'src not array');
      return;
    }
    for (const [k, v] of Object.entries(o)) { if (v && typeof v === 'object') walk(v, p + '.' + k); else console.log(p+'.'+k, 'NOT LEAF', v); }
  };
  walk(j, '');
  let n=0; const cnt=(o)=>{ if (o && typeof o==='object' && 'v' in o && 'scope' in o) {n++; return;} for (const v of Object.values(o)) if (v && typeof v==='object') cnt(v);}; cnt(j); console.log('leaves', n);
}
