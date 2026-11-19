#!/usr/bin/env node
// ld_iter.mjs — iteration of the ESTIMATED legacy values for the DA40 cards (05-da40.md §05.9).
// Only estimated leaves are varied: aero.legacy.CDflap (= detent LDG dCD0) and propulsion.legacy.T0 (lm_prop BEM estimate).
// For each candidate: lm_legacy_fit (glide polar + Vc refit to ROC) then fly the sim at MTOW: stall, climb, glide,
// takeoff (flap T/O, VR, 8°), approach trim (76 KCAS, flap LDG, -3°).  Run from the repo root:
//   node scripts/ld_iter.mjs <typeId> [--T0 3450,3800,4100] [--cdf 0.05,0.035]   -> out/ld_iter_<id>.json
import fs from 'node:fs';
import { loadType } from './lm_lib.mjs';
import { legacyFit, checkFit } from './lm_legacy_fit.mjs';
import { loadSim, applyAC, trim, cardInfo } from './lm_card.mjs';
const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const id = args[0] || 'da40ng';
const T0s = opt('--T0', '3450,3800,4100').split(',').map(Number), CDFs = opt('--cdf', '0.05,0.035').split(',').map(Number);
const M = await loadSim(), rows = [];
for (const cdf of CDFs) for (const T0 of T0s) {
  const card = structuredClone(loadType(id));
  if (card.aero?.legacy?.v) card.aero.legacy.v.CDflap = cdf;
  const fit = legacyFit(card, { mode: 'static', T0 });
  const r = await checkFit(M, card, fit);
  const restore = applyAC(M, fit.ac), info = cardInfo(card, fit.ac), dl = info.dets.at(-1);
  const ap = trim(M, new M.Aircraft(), { ias: 76, h: 300, flaps: dl.f, gear: 1, gammaDeg: -3 });
  const cr = trim(M, new M.Aircraft(), { ias: 110, h: 914.4, flaps: 0, gear: 1, gammaDeg: 0 });
  restore();
  rows.push({ CDflap: cdf, T0, eta_sim: fit.legacy.propulsion.eta, Vc: +(fit.legacy.propulsion.eta * fit.legacy.propulsion.P / T0).toFixed(1),
    CD0: fit.legacy.aero.CD0, K: fit.legacy.aero.K, ROC: Math.round(r.climb.ROCmax_fpm), Vy: +r.climb.Vy_kt.toFixed(1),
    glide: [+r.glide.Vbg_kt.toFixed(1), +r.glide.LD.toFixed(2)], to_roll: Math.round(r.takeoff?.groundRoll_m), to_50: Math.round(r.takeoff?.dist50ft_m),
    thr_app: +ap.thr.toFixed(3), thr_cru: +cr.thr.toFixed(3) });
  console.log(JSON.stringify(rows.at(-1)));
}
fs.writeFileSync(new URL(`./out/ld_iter_${id}.json`, import.meta.url), JSON.stringify(rows, null, 1));
console.log(`wrote scripts/out/ld_iter_${id}.json`);
