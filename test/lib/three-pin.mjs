// three.js r186, pinned for test/shots.mjs. The page loads these files from jsDelivr through the import map in
// src/template.html; the screenshot harness serves them from a local cache instead, so a run does not depend on the
// CDN and always renders against the same bytes. Hashes are SHA-256 of the files served at
// https://cdn.jsdelivr.net/npm/three@0.186.0/<path> (the npm package three@0.186.0, MIT licence), taken 2026-11-22.
// test/shots.test.mjs checks that this list covers every three.js file the page imports.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const THREE_VERSION = '0.186.0';
export const THREE_CDN = `https://cdn.jsdelivr.net/npm/three@${THREE_VERSION}/`;
export const THREE_FILES = {
  'build/three.module.js': '9052042d676cb0fdc1ddfefe193053f34b7ac0513a616fdac4535d49987812ea',
  'build/three.core.js': '9edde002b066a9a05676a6127f67735b62baf399bdea529f2f7e31657da769e6',
  'examples/jsm/controls/OrbitControls.js': '3d79d07ecb686b4e5d93232eedab255331c1beef711e13164eaa1f68655a5f2b',
  'examples/jsm/utils/BufferGeometryUtils.js': '9fb63427ce6641fa14fd0baff9cc4d1b5f9c3d85fd084bf2e90e803c44ec1797',
};

const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

// Makes sure <dir>/<path> holds every pinned file with the pinned hash, downloading what is missing or wrong.
// Returns { [CDN URL]: local file }. Throws if a download does not match its hash.
export async function ensureThree(dir) {
  const map = {};
  for (const [rel, hash] of Object.entries(THREE_FILES)) {
    const file = path.join(dir, rel), url = THREE_CDN + rel;
    if (!fs.existsSync(file) || sha256(fs.readFileSync(file)) !== hash) {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`three.js: ${url} answered ${r.status}`);
      const buf = Buffer.from(await r.arrayBuffer());
      if (sha256(buf) !== hash) throw new Error(`three.js: ${url} does not match its pinned SHA-256`);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, buf);
    }
    map[url] = file;
  }
  return map;
}
