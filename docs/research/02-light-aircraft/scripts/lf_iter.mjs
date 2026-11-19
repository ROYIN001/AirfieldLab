#!/usr/bin/env node
// lf_iter.mjs — sensitivity / iteration of the ESTIMATED test conditions and values of the c152 card in today's sim:
// takeoff rotation (VR, theta), max level speed with the glide polar vs POH, glide-ratio choice (FAA 9.11 vs POH axis 9.72).
// Run from the repo root: node <this folder>/lf_iter.mjs → scripts/out/lf_iter.json
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadType } from './lm_lib.mjs';
import { buildAC, applyAC, loadSim, takeoffTest, trim, climbSweep, glideSweep } from './lm_card.mjs';
import { legacyFit } from './lm_legacy_fit.mjs';
import { compute } from './lf_calc.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const FT = 0.3048;
const M = await loadSim();
const card = loadType('c152');
const out = { takeoff: [], vmax: {}, glideChoice: {} };
const MT = 757.5;
let ac = buildAC(card, { mass: MT }); let restore = applyAC(M, ac);
for (const [VR, th] of [[52, 10], [50, 10], [50, 12], [48, 12], [52, 12], [46, 14]]) {
  const t = takeoffTest(M, { f: 0.361, VR, theta: th }); out.takeoff.push({ VR, theta: th, roll: +t.groundRoll_m.toFixed(1), d50: +t.dist50ft_m.toFixed(1), VLOF: +t.V_LOF_kt.toFixed(1), V50: +t.V50_kt.toFixed(1) });
}
// max level speed (full throttle) at SL and 8000 ft: bisection on trim throttle = 1
const vmax = h => { let lo = 60, hi = 140; for (let k = 0; k < 40; k++) { const m = 0.5 * (lo + hi); const t = trim(M, new M.Aircraft(), { ias: m, h, flaps: 0, gear: 1 }); if (t.thr > 1) hi = m; else lo = m; } return 0.5 * (lo + hi); };
const rhoR = h => M.atmosphere(M.FIELD.elev + h, 0).rho / 1.225;
for (const hft of [0, 3000, 8000]) { const h = Math.max(30, hft * FT), v = vmax(h); out.vmax[hft] = { keas: +v.toFixed(1), ktas: +(v / Math.sqrt(rhoR(h))).toFixed(1) }; }
restore();
// glide ratio choice: refit with E = 9.72 (POH chart axis) and compare Vmax/Vy
const C = compute();
const card2 = JSON.parse(JSON.stringify(card)); card2.performance.glide.v.ratio = 9.722; delete card2.aero.legacy; delete card2.propulsion.legacy;
const f2 = legacyFit(card2, { mode: 'static', T0: C.prop.static.T0_N });
restore = applyAC(M, f2.ac);
out.glideChoice.E972 = { legacy: f2.legacy, vmaxSL: vmax(30), climb: climbSweep(M, { h: 30, v0: 50, v1: 90, step: 2, flaps: 0, gear: 1 }), glide: glideSweep(M, { h: 3000 * FT, v0: 50, v1: 80, step: 1, thr: 0 }) };
restore();
fs.writeFileSync(path.join(HERE, 'out', 'lf_iter.json'), JSON.stringify(out, (k, v) => (typeof v === 'number' ? +v.toPrecision(5) : v), 1));
console.log(JSON.stringify(out.takeoff)); console.log('vmax', JSON.stringify(out.vmax));
const g = out.glideChoice.E972; console.log('E9.72: vmaxSL', g.vmaxSL.toFixed(1), 'Vy', g.climb.Vy_kt.toFixed(1), 'ROC', g.climb.ROCmax_fpm.toFixed(0), 'glide', g.glide.Vbg_kt.toFixed(1), g.glide.LD.toFixed(2), 'eta', g.legacy.propulsion.eta);
