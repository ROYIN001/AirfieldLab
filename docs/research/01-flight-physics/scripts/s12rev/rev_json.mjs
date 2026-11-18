import fs from 'fs';
const f = process.argv[2];
const t = fs.readFileSync(f,'utf8');
const blocks = [...t.matchAll(/```json\n([\s\S]*?)```/g)].map(m=>m[1]);
console.log('blocks', blocks.length);
const scopes = new Set(['aircraft','engine','propeller','gear','environment','sim']);
const keys = ['v','u','scope','src','conf','est','note'];
for (const b of blocks) {
  let j; try { j = JSON.parse(b); console.log('parse OK'); } catch(e) { console.log('PARSE FAIL', e.message); continue; }
  let n=0;
  const walk=(o,p)=>{ if (o && typeof o==='object' && !Array.isArray(o) && 'v' in o) { n++;
      const k=Object.keys(o); const miss=keys.filter(x=>!k.includes(x)), extra=k.filter(x=>!keys.includes(x));
      if (miss.length||extra.length) console.log('KEYS',p,miss,extra);
      if(!scopes.has(o.scope)) console.log('SCOPE',p,o.scope);
      if(!['สูง','กลาง','ต่ำ'].includes(o.conf)) console.log('CONF',p,o.conf);
      if(typeof o.est!=='boolean') console.log('EST',p);
      if(!Array.isArray(o.src)||!o.src.length) console.log('SRC',p);
      return; }
    for (const [k,v] of Object.entries(o)) walk(v,p+'.'+k); };
  walk(j,''); console.log('leaves',n);
}
