#!/usr/bin/env node
// ld_tools.mjs — runs the LM estimation tools for the DA40 cards and stores their outputs for ld_json.mjs (05-da40.md).
//   node scripts/ld_tools.mjs derivs     -> out/ld_derivs.json   (lm_derivs da40ng --json; ค่าประมาณจากรูปทรง §01.3)
//   node scripts/ld_tools.mjs inertia    -> out/ld_inertia.json  (Roskam radii single_prop §01.4, training mass and MTOW)
//   node scripts/ld_tools.mjs fit <id> [--mode static|vy] -> out/ld_fit_<id>.json (lm_legacy_fit --json §01.8)
//   node scripts/ld_tools.mjs card <id> [extra lm_card args] -> out/ld_card_<id>.json (lm_card --json)
// Workaround noted in 05-da40.md §05.12: lm_inertia CLI reads airframe.weights.training_mass only as a number, our leaf
// is {kg,…} (lm_card accepts both), so inertia is computed here with the library function and an explicit mass.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { inertiaFromRadii, RADII } from './lm_inertia.mjs';
const HERE = new URL('./', import.meta.url), OUT = new URL('./out/', import.meta.url);
const run = (script, args) => execFileSync(process.execPath, [new URL(script, HERE).pathname, ...args], { encoding: 'utf8', maxBuffer: 64e6, cwd: process.env.AIRFIELDLAB_ROOT || decodeURIComponent(new URL('../../../../', import.meta.url).pathname).replace(/\/$/, '') });
const save = (f, o) => { fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(new URL(f, OUT), typeof o === 'string' ? o : JSON.stringify(o, null, 1)); console.log('wrote scripts/out/' + f); };
const [cmd, id, ...rest] = process.argv.slice(2);
if (cmd === 'derivs') save('ld_derivs.json', run('lm_derivs.mjs', [id || 'da40ng', '--json']));
else if (cmd === 'inertia') {
  const R = RADII.single_prop, o = { radii: { Rx: R.Rx, Ry: R.Ry, Rz: R.Rz }, cls: 'single_prop' };
  for (const [k, m] of [['ng', 1150], ['ng_mtow', 1310], ['classic', 1050], ['classic_mtow', 1200]]) {
    const b = k.startsWith('ng') ? 11.63 : 11.94, L = k.startsWith('ng') ? 8.06 : 8.01;
    o[k] = { m, b, L, ...inertiaFromRadii({ m, b, L, Rx: R.Rx, Ry: R.Ry, Rz: R.Rz }) };
  }
  save('ld_inertia.json', o);
} else if (cmd === 'fit') save(`ld_fit_${id}.json`, run('lm_legacy_fit.mjs', [id, '--json', ...rest]));
else if (cmd === 'card') save(`ld_card_${id}${rest.includes('--mass') ? '_m' + rest[rest.indexOf('--mass') + 1] : ''}.json`, run('lm_card.mjs', [id, '--json', ...rest]));
else { console.error('usage: ld_tools.mjs derivs|inertia|fit <id>|card <id>'); process.exit(2); }
