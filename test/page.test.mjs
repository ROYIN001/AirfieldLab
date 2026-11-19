// The whole page script. build.mjs joins every src/NN-*.js into one <script type="module">; the other tests only
// evaluate the pure files, so this one parses the assembled module (a syntax error anywhere, or a top-level name
// declared in two files, stops the page before it draws anything) and checks the wiring between the scripts and
// the template: the import map is valid JSON and every element id the scripts look up exists.
import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';
import { assemble } from '../build.mjs';
import { check, done } from './lib/check.mjs';

const { html, js, tpl } = assemble();
const mod = html.match(/<script type="module">([\s\S]*?)<\/script>/);
check('one module script in the page', !!mod && html.split('<script type="module">').length === 2);

// parse it as a module, the way the browser does (strict, top-level names unique across all files)
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'afl-page-')), file = path.join(dir, 'page.mjs');
fs.writeFileSync(file, mod ? mod[1] : '');
let err = '';
try { execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' }); } catch (e) { err = String(e.stderr || e.message); }
fs.rmSync(dir, { recursive: true, force: true });
let where = '';
const at = err.match(/page\.mjs:(\d+)/);
if (at) {   // name the source file and its line from the "// ==== NN-file.js ====" markers
  const lines = (mod ? mod[1] : '').split('\n'), n = +at[1];
  for (let i = n - 1; i >= 0; i--) { const m = lines[i].match(/^\/\/ ==== (\S+) ====$/); if (m) { where = ` (${m[1]} line ${n - i - 1})`; break; } }
}
check('the page module parses: no syntax error, no name declared twice', !err, err ? err.split('\n').filter((l) => /Error|page\.mjs/.test(l)).slice(0, 3).join(' | ') + where : '');

// the import map
const im = tpl.match(/<script type="importmap">([\s\S]*?)<\/script>/);
let imOk = false; try { const o = JSON.parse(im[1]); imOk = !!(o.imports && o.imports.three && o.imports['three/addons/']); } catch (e) { /* reported below */ }
check('the import map is valid JSON with three and three/addons/', imOk);

// element ids: every id looked up in the scripts exists in the template, and no id is used twice
const idList = [...tpl.matchAll(/\bid="([^"]+)"/g)].map((x) => x[1]), ids = new Set(idList);
const used = new Set([...js.matchAll(/\$\('#([\w-]+)/g), ...js.matchAll(/getElementById\('([\w-]+)'\)/g), ...js.matchAll(/querySelector(?:All)?\('#([\w-]+)/g)].map((x) => x[1]));
const missing = [...used].filter((id) => !ids.has(id)), twice = idList.filter((id, i) => idList.indexOf(id) !== i);
check(`every element id the scripts use exists in the template (${used.size} ids)`, used.size > 50 && !missing.length, missing.join(', '));
check('no element id appears twice in the template', !twice.length, twice.join(', '));
done();
