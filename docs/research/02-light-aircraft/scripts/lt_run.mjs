#!/usr/bin/env node
// lt_run.mjs — legacy fit + current-sim check for the DA42 cards (06-da42.md §06.9).  Run from the repo root:
//   node scripts/lt_run.mjs fit  [id ...] [--cdf 0.045] [--cdg 0.012]   -> out/lt_fit_<id>.json  (lm_legacy_fit 'static' + checkFit)
//   node scripts/lt_run.mjs card [id ...]                               -> out/lt_card_<id>.json (lm_card runCard at MTOW)
//   node scripts/lt_run.mjs iter [id] [--cdf a,b] [--cdg a,b]           -> out/lt_iter_<id>.json (vary ESTIMATED CDflap/CDgear only)
// T0 = static thrust of BOTH propellers from lm_prop BEM (lt_geom.mjs, ค่าประมาณ); Vc is fitted to the POH ROC at VY (gear up).
// Only estimated leaves are varied (aero.legacy.CDflap, CDgear); POH numbers are targets, never inputs to tune.
import fs from 'node:fs';
import { loadType } from './lm_lib.mjs';
import { legacyFit, checkFit } from './lm_legacy_fit.mjs';
import { loadSim, applyAC, buildAC, cardInfo, runCard, simCLmax, trim } from './lm_card.mjs';
// Control travel: lm_card (fixed 19 Nov 2026, decision D2) reads controls.surfaces.<s>.v.travel_deg from the card, so the DA42 TCDS
// travel [LT1] (elevator up 15.5 / down 13, aileron ½(25+15) = 20, rudder min(27, 29) = 27) reaches buildAC without any patch.
// aero.legacy.Cma (ค่าประมาณ): the target is the TDI flight test [LT15] Cmα −0.50…−0.57 → midpoint −0.535 (completeness review gap 22).
// lm_derivs (geometry, 13.9 %MAC) gives −1.75, which cannot reach CLmax with Cmδe −1.21 and 15.5° up elevator; the earlier −1.10
// was the largest |Cmα| that still reaches CLmax (closest to geometry). −0.535 also reaches CLmax in UP and LDG (§06.6.4, §06.9.1).
// --cma x overrides for experiments.
const CMA_FIT = +(process.argv.includes('--cma') ? process.argv[process.argv.indexOf('--cma') + 1] : -0.535);
const args = process.argv.slice(2), cmd = args[0] || 'fit';
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const ids = args.slice(1).filter((a, i, A) => !a.startsWith('--') && !(A[i - 1] || '').startsWith('--'));
const IDS = ids.length ? ids : ['da42ng', 'da42_tae125', 'da42_vi'];
const geom = JSON.parse(fs.readFileSync(new URL('./out/lt_geom.json', import.meta.url), 'utf8'));
const T0of = { da42ng: geom.prop.T0_total.ng, da42_tae125: geom.prop.T0_total.tdi, da42_vi: geom.prop.T0_total.vi };
const DEG = Math.PI / 180, r = (x, n = 4) => (x == null || !isFinite(x) ? null : +(+x).toPrecision(n));
const save = (f, o) => { fs.writeFileSync(new URL('./out/' + f, import.meta.url), JSON.stringify(o, null, 1)); console.log('wrote scripts/out/' + f); };
const M = await loadSim();

function fitOne(id, { cdf = null, cdg = null } = {}) {
  const card = structuredClone(loadType(id));
  const lg = card.aero?.legacy?.v;
  if (lg && cdf != null) lg.CDflap = cdf;
  if (lg && cdg != null) lg.CDgear = cdg;
  if (lg) { lg.Cma = CMA_FIT; delete lg.aStall; delete lg.aStallFlap; }   // re-solve the stall centre with the DA42 elevator travel
  return { card, fit: legacyFit(card, { mode: 'static', T0: T0of[id] }) };
}
function alphaInfo(card, ac) {
  const info = cardInfo(card, ac), dU = info.dets[0], dL = info.dets.at(-1);
  const mU = simCLmax(ac, dU.f), mL = simCLmax(ac, dL.f);
  // α (body) where the linear CL reaches CLmax·(VS/(VS+m))², VS = 1-g stall CAS from the sim CLmax at MTOW
  const vs = CL => Math.sqrt(2 * ac.m * 9.80665 / (1.225 * ac.S * CL)) / 0.514444;
  const aAt = (CLmax, f, m) => { const v = vs(CLmax), CLw = CLmax * (v / (v + m)) ** 2; return (CLw - ac.CL0 - ac.CLflap * f) / ac.CLa / DEG; };
  return {
    alpha_star: { UP: r(ac.aStall, 3), LDG: r(ac.aStall + ac.aStallFlap, 3) },
    alpha_CLmax: { UP: r(mU.alpha, 3), LDG: r(mL.alpha, 3) }, CLmax_sim: { UP: r(mU.CL, 3), LDG: r(mL.CL, 3) },
    alpha_warn_5kt: { UP: r(aAt(mU.CL, dU.f, 5), 3), LDG: r(aAt(mL.CL, dL.f, 5), 3) },
    alpha_warn_design: { UP: r(aAt(mU.CL, dU.f, 7), 3), LDG: r(aAt(mL.CL, dL.f, 7), 3) },
    flapNotches: info.dets.map(d => r(d.f, 3)),
  };
}
const brief = (c, fit) => ({
  VS1_target: r(fit.targets.VS1, 3), VS0_target: r(fit.targets.VS0, 3),
  stall_clean: { VSR_eas: r(c.stall_clean?.VSR_eas, 3), Vmin_eas: r(c.stall_clean?.Vmin_eas, 3) },
  stall_full: { VSR_eas: r(c.stall_full?.VSR_eas, 3), Vmin_eas: r(c.stall_full?.Vmin_eas, 3) },
  climb: { Vy_kt: r(c.climb?.Vy_kt, 3), ROCmax_fpm: Math.round(c.climb?.ROCmax_fpm ?? NaN) },
  glide: { Vbg_kt: r(c.glide?.Vbg_kt, 3), LD: r(c.glide?.LD, 3) },
  takeoff: c.takeoff ? { groundRoll_m: Math.round(c.takeoff.groundRoll_m), dist50ft_m: Math.round(c.takeoff.dist50ft_m) } : null,
});

if (cmd === 'fit') {
  for (const id of IDS) {
    const cdf = opt('--cdf', null), cdg = opt('--cdg', null);
    const { card, fit } = fitOne(id, { cdf: cdf == null ? null : +cdf, cdg: cdg == null ? null : +cdg });
    const chk = await checkFit(M, card, fit);
    const a = alphaInfo(card, fit.ac);
    save(`lt_fit_${id}.json`, { id, T0_BEM: T0of[id], legacy: fit.legacy, notes: fit.notes, targets: fit.targets, check: brief(chk, fit),
      alpha: { alpha_star: a.alpha_star, alpha_CLmax: a.alpha_CLmax, alpha_warn_5kt: a.alpha_warn_5kt, alpha_warn_design: a.alpha_warn_design, CLmax_sim: a.CLmax_sim },
      gear: fit.ac.gear, flapNotches: a.flapNotches, trace_defaults: fit.trace.filter(t => /R1|default/i.test(JSON.stringify(t))).slice(0, 40) });
    console.log(id, JSON.stringify(brief(chk, fit)), fit.notes.join(' | '));
  }
} else if (cmd === 'card') {
  for (const id of IDS) {
    const card = structuredClone(loadType(id)), mt = card.airframe.weights.MTOW.v, trace = [];
    if (card.aero?.legacy?.v) card.aero.legacy.v.Cma = CMA_FIT;
    const ac = buildAC(card, { mass: mt, trace }), info = cardInfo(card, ac);
    const restore = applyAC(M, ac);
    const res = runCard(M, ac, info, {});
    // extra: Vy climb at VY with gear down (for reference) and approach trim at VREF flap LDG
    restore();
    save(`lt_card_${id}.json`, { id, mass: mt, info: { dets: info.dets, Vy: info.Vy, VS1: info.VS1, VS0: info.VS0, cruise: info.cruise, approach: info.approach, takeoff: info.takeoff },
      res, r1defaults: trace.filter(t => /R1/.test(JSON.stringify(t))).map(t => t.field || t[0] || t) });
    const s = res.stall;
    console.log(id, 'stall', Object.entries(s).map(([k, v]) => `${k}:${v.VSR_kias?.toFixed?.(1)}KIAS/${v.VSR_cas?.toFixed?.(1)}`).join(' '),
      '| climb Vy', res.climb?.Vy_kt?.toFixed(1), 'ROC', Math.round(res.climb?.ROCmax_fpm), '| glide', res.glide?.idle?.Vbg_kt?.toFixed(1), res.glide?.idle?.LD?.toFixed(2),
      '| TO', Math.round(res.takeoff?.groundRoll_m), Math.round(res.takeoff?.dist50ft_m), '| LDG', JSON.stringify(res.landing?.asIs ? { roll: Math.round(res.landing.asIs.groundRoll_m ?? res.landing.asIs.roll_m ?? NaN), d50: Math.round(res.landing.asIs.dist50ft_m ?? NaN) } : null),
      '| trim cruise de', res.trim?.cruise?.de?.toFixed?.(2), 'thr', res.trim?.cruise?.thr?.toFixed?.(3), '| app de', res.trim?.approach?.de?.toFixed?.(2), 'thr', res.trim?.approach?.thr?.toFixed?.(3));
  }
} else if (cmd === 'iter') {
  const id = IDS[0], rows = [];
  const CDFs = opt('--cdf', '0.045').split(',').map(Number), CDGs = opt('--cdg', '0.012').split(',').map(Number);
  for (const cdf of CDFs) for (const cdg of CDGs) {
    const { card, fit } = fitOne(id, { cdf, cdg });
    const chk = await checkFit(M, card, fit);
    const restore = applyAC(M, fit.ac), info = cardInfo(card, fit.ac), dl = info.dets.at(-1);
    const ap = trim(M, new M.Aircraft(), { ias: info.approach.ias, h: 300, flaps: dl.f, gear: 1, gammaDeg: -3 });
    restore();
    rows.push({ CDflap: cdf, CDgear: cdg, ...brief(chk, fit), thr_app: r(ap.thr, 3), eta: fit.legacy.propulsion.eta });
    console.log(JSON.stringify(rows.at(-1)));
  }
  save(`lt_iter_${id}.json`, rows);
}
