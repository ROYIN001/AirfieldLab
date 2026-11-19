// The whole page script. build.mjs joins every src/NN-*.js into one <script type="module">; the physics tests only
// evaluate the pure files, so this test parses the assembled module (a syntax error anywhere, or a top-level name
// declared in two files, stops the page before it draws anything) and checks the wiring between the scripts and the
// template: the import map is valid JSON and every element id the scripts look up exists.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { assemble } from '../build.mjs';

const { html, js, tpl } = assemble();
const mod = html.match(/<script type="module">([\s\S]*?)<\/script>/);

test('one module script in the page', () => {
  assert.ok(mod && html.split('<script type="module">').length === 2);
});

test('the page module parses: no syntax error, no name declared twice', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'afl-page-')), file = path.join(dir, 'page.mjs');
  fs.writeFileSync(file, mod[1]);
  let err = '';
  try { execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' }); } catch (e) { err = String(e.stderr || e.message); }
  fs.rmSync(dir, { recursive: true, force: true });
  let where = '';
  const at = err.match(/page\.mjs:(\d+)/);
  if (at) {   // name the source file and its line from the "// ==== NN-file.js ====" markers
    const lines = mod[1].split('\n'), n = +at[1];
    for (let i = n - 1; i >= 0; i--) { const m = lines[i].match(/^\/\/ ==== (\S+) ====$/); if (m) { where = ` (${m[1]} line ${n - i - 1})`; break; } }
  }
  assert.equal(err, '', err.split('\n').filter((l) => /Error|page\.mjs/.test(l)).slice(0, 3).join(' | ') + where);
});

test('the import map is valid JSON with three and three/addons/', () => {
  const im = tpl.match(/<script type="importmap">([\s\S]*?)<\/script>/);
  const o = JSON.parse(im[1]);
  assert.ok(o.imports && o.imports.three && o.imports['three/addons/']);
});

test('every element id the scripts use exists in the template, none twice', () => {
  const list = [...tpl.matchAll(/\bid="([^"]+)"/g)].map((x) => x[1]), ids = new Set(list);
  const used = new Set([...js.matchAll(/\$\('#([\w-]+)/g), ...js.matchAll(/getElementById\('([\w-]+)'\)/g), ...js.matchAll(/querySelector(?:All)?\('#([\w-]+)/g)].map((x) => x[1]));
  const missing = [...used].filter((id) => !ids.has(id)), twice = list.filter((id, i) => list.indexOf(id) !== i);
  assert.ok(used.size > 30, `${used.size} ids found in the scripts`);
  assert.deepEqual(missing, [], `ids used but not in the template: ${missing.join(', ')}`);
  assert.deepEqual(twice, [], `ids repeated in the template: ${twice.join(', ')}`);
});
