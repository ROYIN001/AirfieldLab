// Keeps test/shots.mjs runnable from the repository and in CI (plan B8): no absolute paths of the machine it was
// first written on, and the pinned three.js files (test/lib/three-pin.mjs) are the version and the files the page
// imports, so the harness never falls back to a file it does not hold.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assemble } from '../build.mjs';
import { THREE_VERSION, THREE_CDN, THREE_FILES } from './lib/three-pin.mjs';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const { js, tpl } = assemble();

test('no machine-specific absolute paths under test/', () => {
  const bad = /\/home\/claude|\/opt\/npm-tools|\/opt\/node-tools|\/opt\/pw-browsers|\/usr\/bin\/google-chrome|\/home\/user\//;
  const hits = fs.readdirSync(DIR, { recursive: true }).filter((f) => /\.(mjs|js|json)$/.test(f))
    .filter((f) => f !== 'shots.test.mjs' && bad.test(fs.readFileSync(path.join(DIR, f), 'utf8')));
  assert.deepEqual(hits, [], `absolute paths in ${hits.join(', ')}`);
});

test('the pinned three.js is the version in the import map', () => {
  const im = JSON.parse(tpl.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]).imports;
  assert.equal(im.three, THREE_CDN + 'build/three.module.js');
  assert.equal(im['three/addons/'], THREE_CDN + 'examples/jsm/');
  assert.match(THREE_VERSION, /^\d+\.\d+\.\d+$/);
});

test('every three.js file the page imports is pinned with a SHA-256', () => {
  const addons = [...js.matchAll(/from 'three\/addons\/([^']+)'/g)].map((m) => 'examples/jsm/' + m[1]);
  assert.ok(addons.length >= 2, `${addons.length} addon imports found`);
  // three.module.js imports ./three.core.js (r160 and later)
  for (const f of ['build/three.module.js', 'build/three.core.js', ...addons]) assert.ok(f in THREE_FILES, `${f} is not pinned`);
  for (const [f, h] of Object.entries(THREE_FILES)) assert.match(h, /^[0-9a-f]{64}$/, f);
});
