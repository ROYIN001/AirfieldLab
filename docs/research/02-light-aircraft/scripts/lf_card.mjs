#!/usr/bin/env node
// lf_card.mjs — run lm_card's evaluation for the c152 card in today's sim (no code change to the sim).
// D2 (19 Nov 2026): lm_card.travelOf now reads the card's TCDS travel from controls.surfaces.<s>.v.travel_deg, so the
// former patchTravel() workaround of this file is gone (it set the same values: deUp 25°, deDn 18°, daMax 17.5°, drMax 23°).
//   node <this folder>/lf_card.mjs [--mass kg] [--json]   (run from the repo root) → scripts/out/lf_card.json
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadType, isMainModule } from './lm_lib.mjs';
import { buildAC, applyAC, cardInfo, runCard, loadSim } from './lm_card.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const RAD = 180 / Math.PI;

export async function run({ mass = 757.5, id = 'c152' } = {}) {
  const card = loadType(id), trace = [];
  const ac = buildAC(card, { mass, trace });
  const travel = { deUp: ac.deUp * RAD, deDn: ac.deDn * RAD, daMax: ac.daMax * RAD, drMax: ac.drMax * RAD };
  const M = await loadSim(); const restore = applyAC(M, ac);
  const info = cardInfo(card, ac);
  const res = runCard(M, ac, info, {});
  restore();
  return { type: id, mass, travel_deg: travel, ac, res };
}

if (isMainModule(import.meta.url)) {
  const a = process.argv.slice(2), opt = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
  const r = await run({ mass: +opt('--mass', 757.5) });
  const s = JSON.stringify(r, (k, v) => (typeof v === 'number' ? +v.toPrecision(6) : v), 1);
  fs.writeFileSync(path.join(HERE, 'out', `lf_card${r.mass === 757.5 ? '' : '_m' + Math.round(r.mass)}.json`), s);
  if (a.includes('--json')) console.log(s);
  else {
    const x = r.res, f = (v, n = 1) => (v == null ? '–' : (+v).toFixed(n));
    console.log(`lf_card c152 m ${r.mass} travel (deg) ${Object.entries(r.travel_deg).map(([k, v]) => `${k} ${f(v)}`).join(', ')}`);
    for (const [k, s2] of Object.entries(x.stall)) console.log(`stall ${k}: VSR ${f(s2.VSR_cas)} KCAS (KIAS ${f(s2.VSR_kias)}) Vmin ${f(s2.Vmin_eas)} CLmax ${f(s2.CLmax, 3)} alpha ${f(s2.alpha_deg)} de_end ${f(s2.de_end_deg)}`);
    console.log(`climb Vy ${f(x.climb.Vy_kt)} ROC ${f(x.climb.ROCmax_fpm, 0)} Vx ${f(x.climb.Vx_kt)} | glide ${f(x.glide.zeroThrust.Vbg_kt)} L/D ${f(x.glide.zeroThrust.LD, 2)}`);
    for (const [k, t] of Object.entries(x.trim)) console.log(`trim ${k}: ias ${f(t.ias_kt)} alpha ${f(t.alpha_deg, 2)} theta ${f(t.theta_deg, 2)} de ${f(t.de_deg, 2)} thr ${f(t.thr, 3)}`);
    for (const [k, m] of Object.entries(x.modes)) console.log(`modes ${k}: SP ${f(m.sp?.wn, 3)}/${f(m.sp?.zeta, 3)} PH T ${f(m.ph?.T, 1)} z ${f(m.ph?.zeta, 3)} DR ${f(m.dr?.wn, 3)}/${f(m.dr?.zeta, 3)} tauR ${f(m.roll_tau, 3)} spiral t2 ${f(m.spiral?.t2, 1)} ${m.spiral?.grows ? 'div' : 'conv'} CAP ${f(m.CAP, 3)}`);
    console.log(`takeoff VR ${x.takeoff.VR}: roll ${f(x.takeoff.groundRoll_m, 0)} m, 50 ft ${f(x.takeoff.dist50ft_m, 0)} m, VLOF ${f(x.takeoff.V_LOF_kt)} V50 ${f(x.takeoff.V50_kt)}`);
    for (const [k, l] of Object.entries(x.landing)) console.log(`landing ${k}: total ${f(l.total_m, 0)} air ${f(l.air_m, 0)} ground ${f(l.ground_m, 0)} Vtd ${f(l.vtd_kt)} ias50 ${f(l.ias50_kt)}`);
  }
}
