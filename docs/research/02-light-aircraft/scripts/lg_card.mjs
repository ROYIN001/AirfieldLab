#!/usr/bin/env node
// lg_card.mjs — run lm_card's evaluation of the p2006t card with the control-travel WORKAROUND (same as lf_card.mjs of topic 11):
// lm_card.buildAC reads control travel at the path controls.surfaces.<s>.travel_deg, but schema-ext-r2 cards (this one included)
// put the leaf at controls.surfaces.<s> with v = {travel_deg:{...}}; val() stops at the leaf, so every card silently falls back to
// the round-1 travel (elevator 22/15, aileron 20, rudder 25 deg). patchTravel() applies the card's TCDS travel
// (stabilator 15 up / 4 down, aileron 20/17 → mean 18.5, rudder 26).
//   node <this folder>/lg_card.mjs [--mass kg] [--unpatched] [--json] [--quick]   (run from the repo root)
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadType, val, isObj, isMainModule } from './lm_lib.mjs';
import { buildAC, applyAC, cardInfo, runCard, loadSim } from './lm_card.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEG = Math.PI / 180;

export function patchTravel(ac, card) {
  const t = s => { const v = val(card, `controls.surfaces.${s}`); return isObj(v) && isObj(v.travel_deg) ? v.travel_deg : null; };
  const el = t('elevator'), ai = t('aileron'), ru = t('rudder'), log = [];
  if (el) { ac.deUp = el.up * DEG; ac.deDn = el.down * DEG; log.push(`deUp ${el.up} deDn ${el.down}`); }
  if (ai) { ac.daMax = 0.5 * (ai.up + ai.down) * DEG; log.push(`daMax ${0.5 * (ai.up + ai.down)}`); }
  if (ru) { ac.drMax = Math.min(ru.left, ru.right) * DEG; log.push(`drMax ${Math.min(ru.left, ru.right)}`); }
  return log;
}

export async function run({ mass, patched = true, id = 'p2006t', quick = false, noGround = false } = {}) {
  const card = loadType(id, { dir: path.join(HERE, '..') }), trace = [];
  const ac = buildAC(card, { mass, trace });
  const log = patched ? patchTravel(ac, card) : [];
  const M = await loadSim(); applyAC(M, ac);
  const info = cardInfo(card, ac);
  const res = runCard(M, ac, info, { quick, noGround });
  return { type: id, patched, patchLog: log, ac, res };
}

if (isMainModule(import.meta.url)) {
  const a = process.argv.slice(2), opt = k => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : undefined; };
  const out = await run({ mass: opt('--mass') ? +opt('--mass') : undefined, patched: !a.includes('--unpatched'), quick: a.includes('--quick'), noGround: a.includes('--no-ground') });
  if (a.includes('--json')) console.log(JSON.stringify(out, (k, v) => (typeof v === 'number' ? +v.toPrecision(6) : v), 1));
  else {
    const f = (v, n = 1) => (v == null || Number.isNaN(v) ? '–' : (+v).toFixed(n)), R = out.res;
    console.log(`# lg_card p2006t m ${out.ac.m} kg ${out.patched ? 'patched: ' + out.patchLog.join(', ') : 'UNPATCHED (R1 travel)'}`);
    for (const [k, s] of Object.entries(R.stall)) console.log(`stall ${k}: f ${f(s.f, 3)} gear ${s.gear} V_SR ${f(s.VSR_cas)} KCAS / ${f(s.VSR_kias)} KIAS, Vmin ${f(s.Vmin_eas)} KEAS / ${f(s.Vmin_kias)} KIAS, CLmax ${f(s.CLmax, 3)}, alpha ${f(s.alpha_deg)}, nz ${f(s.nz, 3)}, de_end ${f(s.de_end_deg ?? s.de_end)}`);
    if (R.climb) console.log(`climb Vy ${f(R.climb.Vy_kt)} kt ROC ${f(R.climb.ROCmax_fpm, 0)} fpm Vx ${f(R.climb.Vx_kt)}; glide idle ${f(R.glide.idle.Vbg_kt)} kt L/D ${f(R.glide.idle.LD, 2)}`);
    for (const [k, t] of Object.entries(R.trim || {})) console.log(`trim ${k}: ${f(t.ias_kt)} kt alpha ${f(t.alpha_deg, 2)} theta ${f(t.theta_deg, 2)} de ${f(t.de_deg, 2)} thr ${f(t.thr, 3)}`);
    for (const [k, m] of Object.entries(R.modes || {})) console.log(`modes ${k}: SP ${f(m.sp?.wn, 3)}/${f(m.sp?.zeta, 3)} PH T ${f(m.ph?.T, 1)}/${f(m.ph?.zeta, 3)} DR ${f(m.dr?.wn, 3)}/${f(m.dr?.zeta, 3)} tauR ${f(m.roll_tau, 3)} spiral ${m.spiral ? (m.spiral.grows ? 'div ' : 'conv ') + f(m.spiral.t2, 1) : '–'} CAP ${f(m.CAP, 2)}`);
    if (R.takeoff) console.log(`takeoff flap ${R.takeoff.flap} VR ${R.takeoff.VR}: GR ${f(R.takeoff.groundRoll_m, 0)} m, 50 ft ${f(R.takeoff.dist50ft_m, 0)} m, V50 ${f(R.takeoff.V50_kt)}`);
    for (const [k, l] of Object.entries(R.landing || {})) console.log(`landing ${k}: ${l.failed ? 'FAILED' : `50 ft→stop ${f(l.total_m, 0)} m (air ${f(l.air_m, 0)}, ground ${f(l.ground_m, 0)}), Vtd ${f(l.vtd_kt)}`}`);
  }
}
