#!/usr/bin/env node
// lf_card.mjs — run lm_card's evaluation for the c152 card with a WORKAROUND for an lm_card mapping bug:
// buildAC reads control travel from the path controls.surfaces.<s>.travel_deg, but schema-ext-r2 puts the leaf at
// controls.surfaces.<s> with v = {travel_deg:{...}, rate_dps, actuator_tau_s}; val() stops at the leaf, so every card falls
// back to the round-1 travel (elevator 22/15, aileron 20, rudder 25 deg). patchTravel() applies the card's TCDS travel.
//   node <this folder>/lf_card.mjs [--mass kg] [--unpatched] [--json]   (run from the repo root) → scripts/out/lf_card_patched.json
import fs from 'node:fs';
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

export async function run({ mass = 757.5, patched = true, id = 'c152' } = {}) {
  const card = loadType(id), trace = [];
  const ac = buildAC(card, { mass, trace });
  const log = patched ? patchTravel(ac, card) : [];
  const M = await loadSim(); const restore = applyAC(M, ac);
  const info = cardInfo(card, ac);
  const res = runCard(M, ac, info, {});
  restore();
  return { type: id, mass, patched, patchLog: log, ac, res };
}

if (isMainModule(import.meta.url)) {
  const a = process.argv.slice(2), opt = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
  const r = await run({ mass: +opt('--mass', 757.5), patched: !a.includes('--unpatched') });
  const s = JSON.stringify(r, (k, v) => (typeof v === 'number' ? +v.toPrecision(6) : v), 1);
  fs.writeFileSync(path.join(HERE, 'out', `lf_card_${r.patched ? 'patched' : 'unpatched'}${r.mass === 757.5 ? '' : '_m' + Math.round(r.mass)}.json`), s);
  if (a.includes('--json')) console.log(s);
  else {
    const x = r.res, f = (v, n = 1) => (v == null ? '–' : (+v).toFixed(n));
    console.log(`lf_card c152 m ${r.mass} patched ${r.patched} ${r.patchLog.join(', ')}`);
    for (const [k, s2] of Object.entries(x.stall)) console.log(`stall ${k}: VSR ${f(s2.VSR_cas)} KCAS (KIAS ${f(s2.VSR_kias)}) Vmin ${f(s2.Vmin_eas)} CLmax ${f(s2.CLmax, 3)} alpha ${f(s2.alpha_deg)} de_end ${f(s2.de_end_deg)}`);
    console.log(`climb Vy ${f(x.climb.Vy_kt)} ROC ${f(x.climb.ROCmax_fpm, 0)} Vx ${f(x.climb.Vx_kt)} | glide ${f(x.glide.zeroThrust.Vbg_kt)} L/D ${f(x.glide.zeroThrust.LD, 2)}`);
    for (const [k, t] of Object.entries(x.trim)) console.log(`trim ${k}: ias ${f(t.ias_kt)} alpha ${f(t.alpha_deg, 2)} theta ${f(t.theta_deg, 2)} de ${f(t.de_deg, 2)} thr ${f(t.thr, 3)}`);
    for (const [k, m] of Object.entries(x.modes)) console.log(`modes ${k}: SP ${f(m.sp?.wn, 3)}/${f(m.sp?.zeta, 3)} PH T ${f(m.ph?.T, 1)} z ${f(m.ph?.zeta, 3)} DR ${f(m.dr?.wn, 3)}/${f(m.dr?.zeta, 3)} tauR ${f(m.roll_tau, 3)} spiral t2 ${f(m.spiral?.t2, 1)} ${m.spiral?.grows ? 'div' : 'conv'} CAP ${f(m.CAP, 3)}`);
    console.log(`takeoff VR ${x.takeoff.VR}: roll ${f(x.takeoff.groundRoll_m, 0)} m, 50 ft ${f(x.takeoff.dist50ft_m, 0)} m, VLOF ${f(x.takeoff.V_LOF_kt)} V50 ${f(x.takeoff.V50_kt)}`);
    for (const [k, l] of Object.entries(x.landing)) console.log(`landing ${k}: total ${f(l.total_m, 0)} air ${f(l.air_m, 0)} ground ${f(l.ground_m, 0)} Vtd ${f(l.vtd_kt)} ias50 ${f(l.ias50_kt)}`);
  }
}
