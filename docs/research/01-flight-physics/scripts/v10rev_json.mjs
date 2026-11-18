// v10rev_json.mjs: extract ```json blocks from sec-10, parse, check leaf schema
import fs from 'fs';
const f = process.argv[2];
const md = fs.readFileSync(f, 'utf8');
const blocks = [...md.matchAll(/```json\n([\s\S]*?)```/g)].map(m => m[1]);
console.log('json blocks:', blocks.length);
const KEYS = ['v','u','scope','src','conf','est','note'], SC = new Set(['aircraft','engine','propeller','gear','environment','sim']);
blocks.forEach((b, i) => {
  let j; try { j = JSON.parse(b); } catch (e) { console.log('PARSE ERROR block', i, e.message); return; }
  let n = 0; const bad = [];
  const walk = (o, p) => { if (o && typeof o === 'object' && 'v' in o && 'src' in o) { n++;
      const ks = Object.keys(o); const miss = KEYS.filter(k => !ks.includes(k)), extra = ks.filter(k => !KEYS.includes(k));
      if (miss.length || extra.length) bad.push(p + ' keys miss=' + miss + ' extra=' + extra);
      if (!SC.has(o.scope)) bad.push(p + ' scope=' + o.scope);
      if (!['สูง','กลาง','ต่ำ'].includes(o.conf)) bad.push(p + ' conf=' + o.conf);
      if (typeof o.est !== 'boolean') bad.push(p + ' est');
      if (!Array.isArray(o.src)) bad.push(p + ' src not array');
      return; }
    if (o && typeof o === 'object') for (const k of Object.keys(o)) walk(o[k], p + '.' + k); };
  walk(j, '');
  console.log('block', i, 'leaves', n, 'issues', bad.length); bad.forEach(x => console.log('  ', x));
  const srcs = new Set(); const w2 = o => { if (o && typeof o === 'object') { if (Array.isArray(o.src)) o.src.forEach(s => srcs.add(s)); for (const k in o) w2(o[k]); } }; w2(j);
  console.log('src ids used:', [...srcs].sort().join(' '));
});
// test IDs defined vs cited
const defined = new Set([...md.matchAll(/^\| (T-V-\d+) \|/gm)].map(m => m[1]));
const cited = new Set([...md.matchAll(/T-V-(\d+)/g)].map(m => 'T-V-' + m[1].padStart(2, '0')));
console.log('defined', [...defined].join(' ')); console.log('cited-not-defined', [...cited].filter(x => !defined.has(x)).join(' ') || 'none');
// ranges like "T-V-01 ถึง 06"
const refs = new Set([...md.matchAll(/\[(V\d+)[^\]]*\]/g)].flatMap(m => m[0].slice(1, -1).split(/,\s*/).map(s => s.split(' ')[0])));
const listed = new Set([...md.matchAll(/^\d+\. \[(V\d+)\]/gm)].map(m => m[1]));
console.log('cited refs not in list', [...refs].filter(r => /^V\d+$/.test(r) && !listed.has(r)).join(' ') || 'none');
console.log('listed refs never cited in text', [...listed].filter(r => ![...md.matchAll(new RegExp('\\[[^\\]]*\\b' + r + '\\b[^\\]]*\\]', 'g'))].some(m => !/^\d+\. /.test(md.slice(md.lastIndexOf('\n', m.index) + 1, m.index + 1)))).join(' ') || 'none');
