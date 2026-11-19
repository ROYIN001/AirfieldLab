#!/usr/bin/env node
// ld_tools.mjs — runs the LM estimation tools for the DA40 cards and stores their outputs for ld_json.mjs (05-da40.md).
//   node scripts/ld_tools.mjs derivs     -> out/ld_derivs.json   (lm_derivs da40ng --json; ค่าประมาณจากรูปทรง §01.3)
//   node scripts/ld_tools.mjs inertia    -> out/ld_inertia.json  (Roskam radii single_prop §01.4, training mass and MTOW)
//   node scripts/ld_tools.mjs fit <id> [--mode static|vy] -> out/ld_fit_<id>.json (lm_legacy_fit --json §01.8)
//   node scripts/ld_tools.mjs card <id> [--mass kg] -> out/ld_card_<id>[_m<kg>].json  (lm_card library run, same JSON as
//                                lm_card --json: {type, ac, trace, res})
// card (19 Nov 2026, D1): speeds.VREF_kt / VAPP_kt of the card hold the values at airframe.weights.training_mass. When
//   --mass differs from training_mass, Vref/Vapp of the run come from speeds.approach_table (row LDG, linear in mass,
//   held at the last row above its range, e.g. NG 1,310 kg → 1,280 kg row = MLW) converted to KCAS with speeds.ias_cas,
//   plus the card's VAPP − VREF; the trace gets a row 'Vref/Vapp (ld_tools)'. Travel comes from the card (D2, lm_card).
// inertia uses the library function with explicit masses (training mass and MTOM of each airframe).
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
else if (cmd === 'card') {
  const { loadType, val, isObj, iasCas, trainingMassKg } = await import('./lm_lib.mjs');
  const { loadSim, buildAC, applyAC, cardInfo, runCard } = await import('./lm_card.mjs');
  const mass = rest.includes('--mass') ? +rest[rest.indexOf('--mass') + 1] : null;
  const card = loadType(id), trace = [];
  const ac = buildAC(card, { mass, trace });
  const tm = trainingMassKg(card), at = val(card, 'speeds.approach_table');
  if (mass && Math.abs(mass - tm) > 0.5 && isObj(at) && Array.isArray(at.axes?.mass_kg)) {
    const xs = at.axes.mass_kg, fl = (at.axes.flap || ['LDG']).map(String), j = Math.max(0, fl.indexOf('LDG') >= 0 ? fl.indexOf('LDG') : fl.length - 1);
    const row = Array.isArray(at.data[0]) ? at.data[j] : at.data, m = Math.min(Math.max(mass, xs[0]), xs.at(-1));
    let i = 0; while (i < xs.length - 2 && m > xs[i + 1]) i++;
    const kias = row[i] + (row[i + 1] - row[i]) * (m - xs[i]) / (xs[i + 1] - xs[i]);
    const dv = (val(card, 'speeds.VAPP_kt') ?? 0) - (val(card, 'speeds.VREF_kt') ?? 0);
    const kcas = iasCas(card, fl[j] ?? 'LDG').f(kias);
    ac.Vref = Math.round(kcas); ac.Vapp = Math.round(kcas + dv);
    trace.push({ field: 'Vref/Vapp (ld_tools)', value: [ac.Vref, ac.Vapp], from: 'speeds.approach_table', rule: `LDG ${kias.toFixed(1)} KIAS ที่ ${m} kg (run ${mass} kg) → KCAS; VAPP − VREF ${dv} kt` });
  }
  const M = await loadSim(); applyAC(M, ac);
  const res = runCard(M, ac, cardInfo(card, ac));
  save(`ld_card_${id}${mass ? '_m' + mass : ''}.json`, JSON.stringify({ type: id, ac, trace, res }, (k, v) => (typeof v === 'number' ? +v.toPrecision(6) : v), 1));
}
else { console.error('usage: ld_tools.mjs derivs|inertia|fit <id>|card <id>'); process.exit(2); }
