import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Joins every src/NN-*.js (in name order) into the /*__APP__*/ marker of src/template.html.
export function assemble() {
  const dir = new URL('./src/', import.meta.url);
  const files = fs.readdirSync(dir).filter((f) => /^\d\d-.*\.js$/.test(f)).sort();
  const js = files.map((f) => `// ==== ${f} ====\n` + fs.readFileSync(new URL(f, dir), 'utf8')).join('\n');
  const tpl = fs.readFileSync(new URL('template.html', dir), 'utf8');
  if (!tpl.includes('/*__APP__*/')) throw new Error('marker missing');
  return { html: tpl.replace('/*__APP__*/', () => js), js, tpl, files };
}

// node build.mjs → dist/index.html plus the data files (importing this module only assembles)
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { html, files } = assemble();
  fs.mkdirSync(new URL('./dist/', import.meta.url), { recursive: true });
  fs.writeFileSync(new URL('./dist/index.html', import.meta.url), html);
  for (const f of fs.readdirSync(new URL('./data/', import.meta.url))) fs.copyFileSync(new URL('./data/' + f, import.meta.url), new URL('./dist/' + f, import.meta.url));
  console.log('built dist/index.html', (html.length / 1024).toFixed(0) + ' KB from', files.join(', '));
}
