import fs from 'fs';
const md = fs.readFileSync(process.argv[2],'utf8');
const blocks=[...md.matchAll(/```json\n([\s\S]*?)```/g)].map(m=>m[1]);
console.log('blocks',blocks.length);
const scopes=new Set(['aircraft','engine','propeller','gear','environment','sim']);
for(const b of blocks){ let j; try{ j=JSON.parse(b);}catch(e){console.log('PARSE ERR',e.message);continue;}
 const walk=(o,p)=>{ if(o&&typeof o==='object'&&'v' in o){ const keys=Object.keys(o).sort().join(','); if(keys!=='conf,est,note,scope,src,u,v') console.log('KEYS',p,keys); if(!scopes.has(o.scope)) console.log('SCOPE',p,o.scope); if(!['สูง','กลาง','ต่ำ'].includes(o.conf)) console.log('CONF',p,o.conf); if(typeof o.est!=='boolean') console.log('EST',p); if(!Array.isArray(o.src)) console.log('SRC',p); return;} for(const k in o) walk(o[k],p+'.'+k); };
 walk(j,''); console.log('ok parse');}
