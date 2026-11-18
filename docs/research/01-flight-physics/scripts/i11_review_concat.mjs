// Section 11 review: does the proposed 25-input.js (md code with `export` removed) load after 10/15/20 in one scope?
import fs from 'fs';
const S = 'src/';
const base = ['10-atmo.js', '15-geo.js', '20-flight.js'].map((f) => fs.readFileSync(S + f, 'utf8')).join('\n');
const inp = fs.readFileSync(new URL('./i11_review_mdcode.mjs', import.meta.url), 'utf8').replace(/^export /gm, '');
const tryLoad = (code, label) => { try { new Function(code + '\nreturn { shapeAxis, keyRamp, clamp };')(); console.log(label, 'OK'); } catch (e) { console.log(label, 'FAIL:', e.constructor.name, e.message); } };
tryLoad(base + '\n' + inp, 'as written:');
tryLoad(base + '\n' + inp.replace(/^const clamp = .*$/m, ''), 'without its clamp line:');
// same results with the src clamp?
const M = new Function(base + '\n' + inp.replace(/^const clamp = .*$/m, '') + '\nreturn { shapeAxis, dzRadial, keyRamp };')();
console.log('T-I-01 f(0.5) =', M.shapeAxis(0.5, { dz: 0.08, expo: 0.5 }).toFixed(4), ' f(0.1) =', M.shapeAxis(0.1, { dz: 0.08, expo: 0.5 }).toFixed(4));
