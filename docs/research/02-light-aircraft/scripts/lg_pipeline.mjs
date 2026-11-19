#!/usr/bin/env node
// lg_pipeline.mjs — rebuild every p2006t output in order (12-p2006t.md, code LG). Run from the repo root:
//   node <this folder>/lg_pipeline.mjs
// Steps: lg_calc → lg_json (no derivs/legacy) → lg_iter (tail fit) → lg_json → lm_derivs → lg_json → lm_legacy_fit (fresh) → lg_json
//        → lg_card --json → lg_iter --modes → lg_json → lg_card --json (training mass, 1,180 kg, 1,230 kg) → lg_tune → lg_json → lg_tests
//        → lg_json → lm_merge --type p2006t --coverage --dry → lg_json (the travel patch step was removed 19 Nov 2026, D2)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url)), OUT = path.join(HERE, 'out');
const node = (args, outFile) => {
  const t0 = Date.now();
  const res = execFileSync(process.execPath, args.map(a => (a.endsWith('.mjs') ? path.join(HERE, a) : a)), { encoding: 'utf8', maxBuffer: 64 << 20 });
  if (outFile) fs.writeFileSync(path.join(OUT, outFile), res);
  console.log(`✓ ${args.join(' ')}${outFile ? ' > out/' + outFile : ''} (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
  return res;
};
for (const f of ['lg_derivs.json', 'lg_legacy.json', 'lg_card.json', 'lg_card_1180.json', 'lg_iter.json', 'lg_tests.json']) fs.rmSync(path.join(OUT, f), { force: true });
node(['lg_calc.mjs']);
node(['lg_json.mjs']);
node(['lg_iter.mjs']);
node(['lg_json.mjs']);
node(['lm_derivs.mjs', 'p2006t', '--json'], 'lg_derivs.json');
node(['lg_json.mjs']);
node(['lm_legacy_fit.mjs', 'p2006t', '--json'], 'lg_legacy.json');
node(['lg_json.mjs']);
node(['lg_card.mjs', '--json'], 'lg_card.json');
node(['lg_iter.mjs', '--modes']);
node(['lg_json.mjs']);
node(['lg_card.mjs', '--json'], 'lg_card.json');
node(['lg_card.mjs', '--json', '--mass', '1180'], 'lg_card_1180.json');
node(['lg_card.mjs', '--json', '--mass', '1230'], 'lg_card_1230.json');
node(['lg_tune.mjs']);
node(['lg_json.mjs']);   // validation.stick_force_targets needs lg_card_1180.json; lg_tests reads it from the card (T-LG-25)
node(['lg_tests.mjs']);
node(['lg_json.mjs']);
console.log(node(['lm_merge.mjs', '--type', 'p2006t', '--coverage', '--dry']).split('\n').slice(-12).join('\n'));
node(['lg_json.mjs']);
console.log(fs.readFileSync(path.join(OUT, 'lg_tests.md'), 'utf8'));
