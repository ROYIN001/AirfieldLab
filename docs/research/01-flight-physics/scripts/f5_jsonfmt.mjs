// Section 5: re-serialise f5_params2.json with one leaf per line (compact)
import fs from 'fs';
const J = JSON.parse(fs.readFileSync(new URL('./f5_params2.json', import.meta.url), 'utf8'));
const isLeaf = (o) => o && typeof o === 'object' && 'v' in o && 'scope' in o;
function ser(o, ind) { const pad = ' '.repeat(ind);
  const parts = Object.entries(o).map(([k, v]) => pad + ' ' + JSON.stringify(k) + ': ' + (isLeaf(v) ? JSON.stringify(v) : ser(v, ind + 1)));
  return '{\n' + parts.join(',\n') + '\n' + pad + '}'; }
const txt = ser(J, 0); JSON.parse(txt); fs.writeFileSync(new URL('./f5_params3.json', import.meta.url), txt); console.log(Buffer.byteLength(txt));
