#!/usr/bin/env node
// lg_card.mjs — run lm_card's evaluation of the p2006t card (12-p2006t.md §12.9).
// 19 Nov 2026 (decision D2): lm_card.buildAC now reads controls.surfaces.<s>.v.travel_deg, so the card's TCDS travel
// (stabilator 15 up / 4 down, aileron ½(20 + 17) = 18.5, rudder 26) reaches the sim directly; the former patchTravel()
// workaround and the --unpatched option were removed (the numbers did not change).
//   node <this folder>/lg_card.mjs [--mass kg] [--json] [--quick]   (run from the repo root)
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadType, isMainModule } from './lm_lib.mjs';
import { buildAC, applyAC, cardInfo, runCard, loadSim } from './lm_card.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const R2D = 180 / Math.PI;

export async function run({ mass, id = 'p2006t', quick = false, noGround = false } = {}) {
  const card = loadType(id, { dir: path.join(HERE, '..') }), trace = [];
  const ac = buildAC(card, { mass, trace });
  const travel = `deUp ${+(ac.deUp * R2D).toFixed(2)} deDn ${+(ac.deDn * R2D).toFixed(2)} daMax ${+(ac.daMax * R2D).toFixed(2)} drMax ${+(ac.drMax * R2D).toFixed(2)} (จากบัตร)`;
  const M = await loadSim(); applyAC(M, ac);
  const info = cardInfo(card, ac);
  const res = runCard(M, ac, info, { quick, noGround });
  return { type: id, travel, ac, res };
}

if (isMainModule(import.meta.url)) {
  const a = process.argv.slice(2), opt = k => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : undefined; };
  const out = await run({ mass: opt('--mass') ? +opt('--mass') : undefined, quick: a.includes('--quick'), noGround: a.includes('--no-ground') });
  if (a.includes('--json')) console.log(JSON.stringify(out, (k, v) => (typeof v === 'number' ? +v.toPrecision(6) : v), 1));
  else {
    const f = (v, n = 1) => (v == null || Number.isNaN(v) ? '–' : (+v).toFixed(n)), R = out.res;
    console.log(`# lg_card p2006t m ${out.ac.m} kg travel ${out.travel}`);
    for (const [k, s] of Object.entries(R.stall)) console.log(`stall ${k}: f ${f(s.f, 3)} gear ${s.gear} V_SR ${f(s.VSR_cas)} KCAS / ${f(s.VSR_kias)} KIAS, Vmin ${f(s.Vmin_eas)} KEAS / ${f(s.Vmin_kias)} KIAS, CLmax ${f(s.CLmax, 3)}, alpha ${f(s.alpha_deg)}, nz ${f(s.nz, 3)}, de_end ${f(s.de_end_deg ?? s.de_end)}`);
    if (R.climb) console.log(`climb Vy ${f(R.climb.Vy_kt)} kt ROC ${f(R.climb.ROCmax_fpm, 0)} fpm Vx ${f(R.climb.Vx_kt)}; glide idle ${f(R.glide.idle.Vbg_kt)} kt L/D ${f(R.glide.idle.LD, 2)}`);
    for (const [k, t] of Object.entries(R.trim || {})) console.log(`trim ${k}: ${f(t.ias_kt)} kt alpha ${f(t.alpha_deg, 2)} theta ${f(t.theta_deg, 2)} de ${f(t.de_deg, 2)} thr ${f(t.thr, 3)}`);
    for (const [k, m] of Object.entries(R.modes || {})) console.log(`modes ${k}: SP ${f(m.sp?.wn, 3)}/${f(m.sp?.zeta, 3)} PH T ${f(m.ph?.T, 1)}/${f(m.ph?.zeta, 3)} DR ${f(m.dr?.wn, 3)}/${f(m.dr?.zeta, 3)} tauR ${f(m.roll_tau, 3)} spiral ${m.spiral ? (m.spiral.grows ? 'div ' : 'conv ') + f(m.spiral.t2, 1) : '–'} CAP ${f(m.CAP, 2)}`);
    if (R.takeoff) console.log(`takeoff flap ${R.takeoff.flap} VR ${R.takeoff.VR}: GR ${f(R.takeoff.groundRoll_m, 0)} m, 50 ft ${f(R.takeoff.dist50ft_m, 0)} m, V50 ${f(R.takeoff.V50_kt)}`);
    for (const [k, l] of Object.entries(R.landing || {})) console.log(`landing ${k}: ${l.failed ? 'FAILED' : `50 ft→stop ${f(l.total_m, 0)} m (air ${f(l.air_m, 0)}, ground ${f(l.ground_m, 0)}), Vtd ${f(l.vtd_kt)}`}`);
  }
}
