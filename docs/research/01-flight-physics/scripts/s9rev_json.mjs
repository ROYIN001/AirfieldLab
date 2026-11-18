import fs from 'fs';
const t = fs.readFileSync(process.argv[2], 'utf8');
const blocks = [...t.matchAll(/```json\n([\s\S]*?)```/g)].map(m => m[1]);
console.log('json blocks', blocks.length);
const keys = ['v','u','scope','src','conf','est','note'];
const scopes = new Set(['aircraft','engine','propeller','gear','environment','sim']);
for (const b of blocks) {
  let o; try { o = JSON.parse(b); } catch (e) { console.log('PARSE FAIL', e.message); continue; }
  console.log('parsed OK, top keys', Object.keys(o));
  const walk = (x, p) => {
    if (x && typeof x === 'object' && !Array.isArray(x) && 'v' in x && 'src' in x) {
      const ks = Object.keys(x);
      const miss = keys.filter(k => !ks.includes(k)), extra = ks.filter(k => !keys.includes(k));
      if (miss.length || extra.length) console.log('LEAF KEYS', p, miss, extra);
      if (!scopes.has(x.scope)) console.log('SCOPE', p, x.scope);
      if (!['สูง','กลาง','ต่ำ'].includes(x.conf)) console.log('CONF', p, x.conf);
      if (typeof x.est !== 'boolean') console.log('EST', p, x.est);
      const refs = t.match(/\[9-(\d+)\]/g);
      return 1;
    }
    let n = 0; if (x && typeof x === 'object') for (const k in x) n += walk(x[k], p + '.' + k); return n;
  };
  console.log('leaves', walk(o, ''));
}
