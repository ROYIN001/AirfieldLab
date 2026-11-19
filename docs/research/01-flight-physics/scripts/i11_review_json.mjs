// Section 11 review: extract every ```json block from the section, JSON.parse it, check leaf shape
import fs from 'fs';
const md = fs.readFileSync(process.argv[2] || 'docs/research/01-flight-physics/sec-11-input.md', 'utf8');
const blocks = [...md.matchAll(/```json\n([\s\S]*?)```/g)].map((m) => m[1]);
const KEYS = ['v', 'u', 'scope', 'src', 'conf', 'est', 'note'];
const SCOPES = ['aircraft', 'engine', 'propeller', 'gear', 'environment', 'sim'];
blocks.forEach((b, i) => {
  let o; try { o = JSON.parse(b); } catch (e) { console.log('block', i, 'PARSE ERROR', e.message); return; }
  console.log('block', i, 'parses OK; top keys', Object.keys(o));
  if (!o.input) return;
  let n = 0; const bad = [];
  const walk = (node, path) => {
    if (node && typeof node === 'object' && 'v' in node && 'u' in node) {
      n++;
      const ks = Object.keys(node);
      if (ks.length !== KEYS.length || !KEYS.every((k) => ks.includes(k))) bad.push(path + ' keys ' + ks);
      if (!SCOPES.includes(node.scope)) bad.push(path + ' scope ' + node.scope);
      if (!['สูง', 'กลาง', 'ต่ำ'].includes(node.conf)) bad.push(path + ' conf ' + node.conf);
      if (typeof node.est !== 'boolean') bad.push(path + ' est');
      if (!Array.isArray(node.src)) bad.push(path + ' src');
      if (node.src.length === 0 && node.est === false) bad.push(path + ' no src and est=false');
      return;
    }
    for (const [k, v] of Object.entries(node)) walk(v, path + '.' + k);
  };
  walk(o.input, 'input');
  console.log('leaves', n, 'problems', bad);
});
