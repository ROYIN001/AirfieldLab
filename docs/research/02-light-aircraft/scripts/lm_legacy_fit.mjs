#!/usr/bin/env node
// lm_legacy_fit.mjs — choose propulsion.legacy {P, eta, T0, idle} and aero.legacy (CD0, K, aStall, aStallFlap) so a type
// flies in TODAY's code (src/20-flight.js) close to its POH stall speeds, Vy/ROC and best glide (01-methods.md §01.8).
//   node scripts/lm_legacy_fit.mjs <typeId> [--mode static|vy] [--T0 N] [--json]      (run from the repo root)
// Targets (all at MTOW, SL ISA, from the card): speeds.VS1_kt / VS0_kt (→ CLmax via lm_polar), performance.glide
// {speed_kt, ratio}, performance.ROC_SL_fpm (+ speeds.VY_kt for mode vy). KIAS are converted with speeds.ias_cas.
// mode 'static' (default): T0 = --T0 or the card / propeller (lm_prop, momentum), fit Vc = ηP/T0 to the ROC target
//   alone; speeds.VY_kt is not needed (R2-06) and only reported.
// mode 'vy': fit T0 and Vc together so the sim's best-rate speed AND ROC match (T0 then loses its static meaning), inside
//   FIT_BOUNDS: T0 within [0.7, 1.3] × the static T0 and η = Vc·T0/P within [0.5, 1.5]. When no pair inside the bounds
//   gives the target Vy, the static fit is kept and fit.vy = {ok: false, reach_kt} gives the Vy range the bounds allow.
// checkFit flies the stall with lm_card.stallAt, the same test (start speed, gear) as lm_card.runCard (R2-06).
import path from 'node:path';
import { loadType, val, leaf, isObj, isMainModule } from './lm_lib.mjs';
import { buildAC, applyAC, cardInfo, loadSim, climbSweep, glideSweep, stallAt, takeoffTest, iasCas, flapMap, detents } from './lm_card.mjs';
import { polarFromGlide, toSimPolar, vsrTarget } from './lm_polar.mjs';
const KT = 0.514444, FT = 0.3048, G0 = 9.80665, RHO0 = 1.225;

const kcas = (card, p, det = '0') => { const l = leaf(card, p); if (!l || typeof l.v !== 'number') return null; return /IAS/i.test(l.u || '') ? iasCas(card, det).f(l.v) : l.v; };
/** quasi-steady ROC (m/s) of the sim's force model at SL, clean, gear state g (no thrust-angle terms) */
export function rocModel(ac, V, { T0, Vc }, gear = 0) {
  const W = ac.m * G0, q = 0.5 * RHO0 * V * V, CL = W / (q * ac.S);
  const D = q * ac.S * (ac.CD0 + ac.CDgear * gear + ac.K * (CL - 0.15) ** 2), T = T0 * Vc / Math.sqrt(V * V + Vc * Vc);
  return (T - D) * V / W;
}
function bestRate(ac, th, gear, v0 = 25, v1 = 90) { let best = { V: 0, roc: -1e9 }; for (let V = v0; V <= v1; V += 0.05) { const r = rocModel(ac, V, th, gear); if (r > best.roc) best = { V, roc: r }; } return best; }
/** Bounds of mode vy (R2-06). T0: × the static T0 (--T0 or buildAC); the converged vy fits of the round sit at 0.75–1.14
 *  (demo_light 0.75, c172s 0.80, c152 0.79, t6a 1.06, pc9m 1.14) and the DA40 NG takeoff calibration at 1.17 (05-da40 §05.9).
 *  eta = Vc·T0/P: the accepted static fits of every card lie at 0.86–1.34 (07 §07.0: η > 1 is a shape parameter of the
 *  thrust law, not a propeller efficiency); 0.5 is the low end of a climbing propeller. Before the bounds c172r ran to
 *  T0 0.3 × static with Vc at the 400 m/s search limit (η 2.95, ROC −188 fpm). */
export const FIT_BOUNDS = { T0: [0.7, 1.3], eta: [0.5, 1.5] };

export function legacyFit(card, { mode = 'static', T0 = null, bounds = FIT_BOUNDS } = {}) {
  const mt = val(card, 'airframe.weights.MTOW'); const trace = [];
  const ac = buildAC(card, { mass: mt, trace });
  const notes = [];
  // 1) glide → sim polar, idle 0
  const gl = val(card, 'performance.glide'), glu = leaf(card, 'performance.glide')?.u || '';
  if (isObj(gl) && gl.speed_kt && gl.ratio) {
    const v = /IAS/i.test(glu) ? iasCas(card, '0').f(gl.speed_kt) : gl.speed_kt;
    const sp = toSimPolar(polarFromGlide({ mass: ac.m, S: ac.S, v_kcas: v, E: gl.ratio }));
    ac.CD0 = sp.CD0; ac.K = sp.K; ac.idle = 0; notes.push(`polar from glide ${v.toFixed(1)} KCAS E ${gl.ratio}: CD0s ${sp.CD0.toFixed(4)} Ks ${sp.K.toFixed(4)}; idle 0 (POH glide is at idle, windmilling)`);
  } else notes.push('no performance.glide: polar kept from buildAC');
  // 2) climb → T0, Vc. R2-06: mode static needs only the ROC target; mode vy also needs speeds.VY_kt and stays in FIT_BOUNDS
  const Vy = kcas(card, 'speeds.VY_kt'), roc = val(card, 'performance.ROC_SL_fpm');
  const retract = /retract/.test(String(val(card, 'gear.layout') || ''));
  const gear = retract ? 0 : 1;
  let th = { T0: T0 ?? ac.T0, Vc: ac.eta * ac.P / ac.T0 }, vy = null;
  if (typeof roc === 'number') {
    const target = roc * FT / 60, T0s = th.T0;
    // Vc so that the model's best ROC = target (ROC rises with Vc at fixed T0); hit = the bracket edge was reached (no root inside)
    const fitVc = (T0v, lo0 = 5, hi0 = 400) => { let lo = lo0, hi = hi0; for (let k = 0; k < 60; k++) { const m = 0.5 * (lo + hi); if (bestRate(ac, { T0: T0v, Vc: m }, gear).roc > target) hi = m; else lo = m; }
      const Vc = 0.5 * (lo + hi), e = 1e-9 * hi0; return { Vc, hit: hi0 - Vc < e ? 'hi' : Vc - lo0 < e ? 'lo' : null }; };
    if (mode === 'vy' && Vy) {
      const Vt = Vy * KT, [k0, k1] = bounds.T0, band = T0v => [bounds.eta[0] * ac.P / T0v, bounds.eta[1] * ac.P / T0v];
      const at = T0v => { const f = fitVc(T0v, ...band(T0v)); return { T0: T0v, ...f, V: bestRate(ac, { T0: T0v, Vc: f.Vc }, gear).V }; };
      // scan the T0 band; keep the points where the ROC target is met with η inside the band. On that set Vy falls as T0
      // rises (more static thrust at the same ROC makes the law more power-like); outside it Vy is not monotonic (c172r)
      const N = 24, pts = [...Array(N + 1)].map((_, i) => at(T0s * (k0 + (k1 - k0) * i / N))).filter(p => !p.hit);
      const j = pts.findIndex((p, i) => i > 0 && (pts[i - 1].V - Vt) * (p.V - Vt) <= 0 && p.T0 - pts[i - 1].T0 < T0s * (k1 - k0) / N * 1.001);
      if (j > 0) {
        let lo = pts[j - 1].T0, hi = pts[j].T0;   // larger T0 at fixed ROC moves Vy down
        for (let k = 0; k < 40; k++) { const m = 0.5 * (lo + hi); if (at(m).V > Vt) lo = m; else hi = m; }
        th.T0 = 0.5 * (lo + hi); th.Vc = fitVc(th.T0, ...band(th.T0)).Vc;
        vy = { ok: true, T0_ratio: th.T0 / T0s };
      } else {
        const reach = pts.length ? [Math.min(...pts.map(p => p.V)) / KT, Math.max(...pts.map(p => p.V)) / KT] : null;
        vy = { ok: false, reach_kt: reach };
        th.Vc = fitVc(th.T0).Vc;
        notes.push(`WARNING vy: no solution with T0 ${k0}–${k1} × ${T0s.toFixed(0)} N and eta ${bounds.eta[0]}–${bounds.eta[1]}: target Vy ${Vy.toFixed(1)} KCAS, reachable ${reach ? reach.map(v => v.toFixed(1)).join('–') + ' KCAS' : 'none (ROC not reached)'}; static fit kept`);
      }
    } else {
      if (mode === 'vy') notes.push('WARNING vy: no speeds.VY_kt on the card; static fit kept');
      const f = fitVc(th.T0); th.Vc = f.Vc;
      if (f.hit) notes.push(`WARNING Vc at the search limit (${f.hit}): ROC ${roc} fpm not reachable with T0 ${th.T0.toFixed(0)} N`);
    }
    notes.push(`climb fit (${mode}${vy && !vy.ok ? ' → static' : ''}): target Vy ${Vy ? Vy.toFixed(1) + ' KCAS' : '– (not on the card)'} ROC ${roc} fpm → T0 ${th.T0.toFixed(0)} N, Vc ${th.Vc.toFixed(1)} m/s`);
  } else notes.push('no performance.ROC_SL_fpm: thrust kept from buildAC');
  ac.T0 = th.T0; ac.eta = th.Vc * th.T0 / ac.P;
  if (ac.eta > 0.95) notes.push(`WARNING eta ${ac.eta.toFixed(2)} > 0.95: P too low for the sim's thrust law at this ROC`);
  return { ac, notes, trace, vy, bounds: mode === 'vy' ? bounds : null, targets: { VS1: kcas(card, 'speeds.VS1_kt'), VS0: kcas(card, 'speeds.VS0_kt', flapMap(detents(card)).at(-1).name), Vy, roc, glide: gl }, gear,
    legacy: { propulsion: { P: ac.P, eta: +ac.eta.toFixed(4), T0: Math.round(ac.T0), idle: ac.idle }, aero: { CD0: +ac.CD0.toFixed(5), K: +ac.K.toFixed(5), CL0: ac.CL0, CLa: ac.CLa, CLflap: ac.CLflap, CDflap: ac.CDflap, CDgear: ac.CDgear, Cm0: ac.Cm0, Cma: ac.Cma, Cmflap: ac.Cmflap, aStall: ac.aStall, aStallFlap: ac.aStallFlap } } };
}
/** fly the fitted AC in the sim and compare with the targets */
export async function checkFit(M, card, fit) {
  const restore = applyAC(M, fit.ac), info = cardInfo(card, fit.ac), ac = fit.ac, out = {};
  // R2-06: the same stall test as lm_card.runCard (start validation.stall_test or 1.35 Vs, gear up only clean + retractable),
  // so lc_fit / le_fit / lf_fit report the Vmin that lc_tests / le_tests / lf_tests use (was: start at 1.5 × the POH VS)
  out.stall_clean = stallAt(M, ac, info, info.dets[0]); out.stall_full = stallAt(M, ac, info, info.dets.at(-1));
  const vs1 = out.stall_clean.VSR_eas;
  out.climb = climbSweep(M, { h: 30, v0: 2 * Math.round(0.6 * vs1), v1: 2 * Math.round(2.4 * vs1 / 2), step: 1, flaps: 0, gear: fit.gear });
  out.glide = glideSweep(M, { h: 3000 * FT, v0: Math.round(1.05 * vs1), v1: Math.round(2.2 * vs1), step: 1, thr: ac.idle });
  if (info.takeoff.VR) out.takeoff = takeoffTest(M, { f: info.takeoff.f, VR: info.takeoff.VR, theta: info.takeoff.theta });
  restore();
  return out;
}

// hypothetical test target (ตัวเลขสมมติ — NOT a real aircraft) used by T-LM-19…21 to verify the fitting procedure
export const DEMO = { demo_light: {
  airframe: { weights: { MTOW: { v: 1100, u: 'kg', scope: 'aircraft', src: ['LM0'], conf: 'ต่ำ', est: true, note: 'ตัวเลขสมมติสำหรับทดสอบ' } }, wing: { S: { v: 16.2, u: 'm2', scope: 'aircraft', src: ['LM0'], conf: 'ต่ำ', est: true, note: 'สมมติ' }, b: { v: 11.0, u: 'm', scope: 'aircraft', src: ['LM0'], conf: 'ต่ำ', est: true, note: 'สมมติ' }, MAC: { v: 1.49, u: 'm', scope: 'aircraft', src: ['LM0'], conf: 'ต่ำ', est: true, note: 'สมมติ' } } },
  piston: { ratings: { P_rated: { v: 134e3, u: 'W', scope: 'engine', src: ['LM0'], conf: 'ต่ำ', est: true, note: 'สมมติ' } } },
  propulsion: { legacy: { v: { P: 134e3, eta: 0.8, T0: 3500, idle: 0.02 }, u: 'W,-,N,-', scope: 'engine', src: ['LM0'], conf: 'ต่ำ', est: true, note: 'ค่าเริ่มก่อน fit (T0 จาก lm_prop คลาส C172S)' } },
  aero: { legacy: { v: { CL0: 0.30, CLa: 5.0, CLflap: 0.60, CDflap: 0.045, CDgear: 0, Cm0: 0.04, Cma: -0.85, Cmflap: -0.10 }, u: '-', scope: 'aircraft', src: ['LM0'], conf: 'ต่ำ', est: true, note: 'สมมติ' } },
  controls: { surfaces: { elevator: { travel_deg: { v: { up: 28, down: 23 }, u: 'deg', scope: 'aircraft', src: ['LM22'], conf: 'สูง', est: false, note: 'แบบ C172S' } } } },
  speeds: { VS1_kt: { v: 48, u: 'kt CAS', scope: 'aircraft', src: ['LM0'], conf: 'ต่ำ', est: true, note: 'สมมติ' }, VS0_kt: { v: 42, u: 'kt CAS', scope: 'aircraft', src: ['LM0'], conf: 'ต่ำ', est: true, note: 'สมมติ' },
    VY_kt: { v: 74, u: 'kt CAS', scope: 'aircraft', src: ['LM0'], conf: 'ต่ำ', est: true, note: 'สมมติ' }, VR_kt: { v: 55, u: 'kt CAS', scope: 'aircraft', src: ['LM0'], conf: 'ต่ำ', est: true, note: 'สมมติ' }, VAPP_kt: { v: 65, u: 'kt CAS', scope: 'aircraft', src: ['LM0'], conf: 'ต่ำ', est: true, note: 'สมมติ' } },
  performance: { ROC_SL_fpm: { v: 730, u: 'fpm', scope: 'aircraft', src: ['LM0'], conf: 'ต่ำ', est: true, note: 'สมมติ' }, glide: { v: { speed_kt: 68, ratio: 9.0 }, u: 'kt CAS, -', scope: 'aircraft', src: ['LM0'], conf: 'ต่ำ', est: true, note: 'สมมติ' } },
  gear: { layout: { v: 'tricycle_fixed', u: '-', scope: 'gear', src: ['LM0'], conf: 'ต่ำ', est: true, note: 'สมมติ' } },
} };

export async function tests(M) {
  const card = DEMO.demo_light, fit = legacyFit(card, { mode: 'static' }), r = await checkFit(M, card, fit);
  const fv = legacyFit(card, { mode: 'vy' }), rv = await checkFit(M, card, fv);
  // T-LM-34 (R2-06): static needs no speeds.VY_kt; vy stays inside FIT_BOUNDS or keeps the static fit and says so
  const noVy = structuredClone(card); delete noVy.speeds.VY_kt;
  const fn = legacyFit(noVy, { mode: 'static' });
  const far = structuredClone(card); far.speeds.VY_kt.v = 90;            // no T0/η inside the bounds gives Vy 90 at ROC 730
  const ff = legacyFit(far, { mode: 'vy' });
  const ft = legacyFit(card, { mode: 'static', T0: 3000 });
  return [
    { id: 'T-LM-19', what: 'legacy fit demo: V_SR clean KCAS (target 48/√0.95 = 49.2)', got: r.stall_clean.VSR_cas, exp: 49.2, tol: 1.0 },
    { id: 'T-LM-19', what: 'legacy fit demo: V_SR full flap KCAS (target 42/√0.95 = 43.1)', got: r.stall_full.VSR_cas, exp: 43.1, tol: 1.0 },
    { id: 'T-LM-20', what: 'legacy fit demo (static): sim ROC fpm (target 730)', got: r.climb.ROCmax_fpm, exp: 730, tol: 40 },
    { id: 'T-LM-20', what: 'legacy fit demo (static): sim Vy kt (limitation, POH 74)', got: r.climb.Vy_kt, exp: 66, tol: 2 },
    { id: 'T-LM-20', what: 'legacy fit demo (vy): sim Vy kt (target 74)', got: rv.climb.Vy_kt, exp: 74, tol: 2 },
    { id: 'T-LM-21', what: 'legacy fit demo: glide L/D at idle 0 (target 9.0)', got: r.glide.LD, exp: 9.0, tol: 0.15 },
    { id: 'T-LM-21', what: 'legacy fit demo: best glide speed kt (target 68)', got: r.glide.Vbg_kt, exp: 68, tol: 2 },
    { id: 'T-LM-34', what: 'static fit without speeds.VY_kt: |Δeta| vs with VY', got: Math.abs(fn.legacy.propulsion.eta - fit.legacy.propulsion.eta), exp: 0, tol: 0 },
    { id: 'T-LM-34', what: 'vy fit demo: T0 / static T0 inside FIT_BOUNDS.T0 (0.747)', got: fv.legacy.propulsion.T0 / fit.legacy.propulsion.T0, exp: 0.747, tol: 0.01 },
    { id: 'T-LM-34', what: 'vy fit, Vy 90 unreachable: ok false and static T0 kept (T0 − static)', got: ff.vy?.ok === false ? ff.legacy.propulsion.T0 - fit.legacy.propulsion.T0 : NaN, exp: 0, tol: 0 },
    { id: 'T-LM-34', what: 'static fit with T0 3000 N: T0 used', got: ft.legacy.propulsion.T0, exp: 3000, tol: 0 },
  ];
}

if (isMainModule(import.meta.url)) {
  const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
  const id = args.find((a, i) => !a.startsWith('--') && !['--mode', '--T0'].includes(args[i - 1]));
  const T0 = opt('--T0', null) == null ? null : +opt('--T0');
  if (!id || (T0 != null && !(T0 > 0))) { console.error('usage: node lm_legacy_fit.mjs <typeId|demo_light> [--mode static|vy] [--T0 N] [--json]'); process.exit(2); }
  const card = id === 'demo_light' ? DEMO.demo_light : loadType(id);
  const fit = legacyFit(card, { mode: opt('--mode', 'static'), T0 }), M = await loadSim(), r = await checkFit(M, card, fit);
  const f = (x, n = 1) => (x == null ? '–' : (+x).toFixed(n));
  if (args.includes('--json')) console.log(JSON.stringify({ type: id, legacy: fit.legacy, notes: fit.notes, targets: fit.targets, vy: fit.vy, check: r }, (k, v) => (typeof v === 'number' ? +v.toPrecision(5) : v), 1));
  else {
    console.log(`# lm_legacy_fit ${id} (mode ${opt('--mode', 'static')})`); fit.notes.forEach(n => console.log('  ' + n));
    console.log('aero.legacy', JSON.stringify(fit.legacy.aero)); console.log('propulsion.legacy', JSON.stringify(fit.legacy.propulsion));
    const T = fit.targets;
    console.log(`stall clean V_SR ${f(r.stall_clean.VSR_cas)} KCAS (target VS1/√0.95 ${f(T.VS1 && vsrTarget(T.VS1))}; Vmin ${f(r.stall_clean.Vmin_eas)}, nz at Vmin ${f(r.stall_clean.nz_Vmin, 2)}), full V_SR ${f(r.stall_full.VSR_cas)} (target ${f(T.VS0 && vsrTarget(T.VS0))}; Vmin ${f(r.stall_full.Vmin_eas)}, nz at Vmin ${f(r.stall_full.nz_Vmin, 2)})`);
    console.log(`climb Vy ${f(r.climb.Vy_kt)} kt ROC ${f(r.climb.ROCmax_fpm, 0)} fpm (target ${f(T.Vy)} / ${T.roc}); glide ${f(r.glide.Vbg_kt)} kt L/D ${f(r.glide.LD, 2)} (target ${JSON.stringify(T.glide)})`);
    if (r.takeoff) console.log(`takeoff ground roll ${f(r.takeoff.groundRoll_m, 0)} m, 50 ft ${f(r.takeoff.dist50ft_m, 0)} m`);
  }
}
