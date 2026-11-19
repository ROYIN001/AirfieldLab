import fs from 'fs';
const md = fs.readFileSync(process.argv[2], 'utf8');
const blocks = [...md.matchAll(/```json\n([\s\S]*?)```/g)].map(m => m[1]);
console.log('blocks', blocks.length);
const scopes = new Set(['aircraft','engine','propeller','gear','environment','sim']);
const keys = ['v','u','scope','src','conf','est','note'];
for (const b of blocks) {
  let j; try { j = JSON.parse(b); console.log('parse OK'); } catch (e) { console.log('PARSE ERR', e.message); continue; }
  let n = 0;
  const walk = (o, p) => {
    if (o && typeof o === 'object' && 'v' in o && 'scope' in o) {
      n++;
      const ks = Object.keys(o);
      const miss = keys.filter(k => !ks.includes(k)), extra = ks.filter(k => !keys.includes(k));
      if (miss.length || extra.length) console.log('KEYS', p, miss, extra);
      if (!scopes.has(o.scope)) console.log('SCOPE', p, o.scope);
      if (!['สูง','กลาง','ต่ำ'].includes(o.conf)) console.log('CONF', p, o.conf);
      if (!Array.isArray(o.src)) console.log('SRC', p);
      if (typeof o.est !== 'boolean') console.log('EST', p);
      if (o.est === false && o.src.length === 0) console.log('UNSOURCED non-est', p);
      if (o.v && o.v.axes) { // check table dims
        const ax = Object.values(o.v.axes);
        const d = o.v.data;
        if (ax.length === 2) { if (d.length !== ax[0].length || d.some(r => r.length !== ax[1].length)) console.log('DIM', p, d.length, ax[0].length, d.map(r=>r.length)); }
        else if (ax.length === 1 && d.length !== ax[0].length) console.log('DIM1', p);
      }
      console.log(' leaf', p, JSON.stringify(o.v).slice(0,60), o.u, o.scope, o.conf, o.est, JSON.stringify(o.src));
      return;
    }
    if (o && typeof o === 'object') for (const k of Object.keys(o)) walk(o[k], p + '.' + k);
  };
  walk(j, '');
  console.log('leaves', n);
}
