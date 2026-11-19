#!/usr/bin/env node
// lm_legacy_fit.mjs — choose propulsion.legacy {P, eta, T0, idle} and aero.legacy (CD0, K, aStall, aStallFlap) so a type
// flies in TODAY's code (src/20-flight.js) close to its POH stall speeds, Vy/ROC and best glide (01-methods.md §01.8).
//   node scripts/lm_legacy_fit.mjs <typeId> [--mode static|vy] [--json]      (run from the repo root)
// Targets (all at MTOW, SL ISA, from the card): speeds.VS1_kt / VS0_kt (→ CLmax via lm_polar), performance.glide
// {speed_kt, ratio}, speeds.VY_kt + performance.ROC_SL_fpm. KIAS are converted with speeds.ias_cas.
// mode 'static' (default): T0 from the propeller (lm_prop / momentum), fit Vc = ηP/T0 to ROC at Vy.
// mode 'vy': fit T0 and Vc together so the sim's best-rate speed AND ROC match (T0 then loses its static meaning).
import path from 'node:path';
import { loadType, val, leaf, isObj, isMainModule } from './lm_lib.mjs';
import { buildAC, applyAC, cardInfo, loadSim, climbSweep, glideSweep, stallTest, takeoffTest, iasCas, flapMap, detents } from './lm_card.mjs';
import { polarFromGlide, toSimPolar } from './lm_polar.mjs';
const KT = 0.514444, FT = 0.3048, G0 = 9.80665, RHO0 = 1.225;

const kcas = (card, p, det = '0') => { const l = leaf(card, p); if (!l || typeof l.v !== 'number') return null; return /IAS/i.test(l.u || '') ? iasCas(card, det).f(l.v) : l.v; };
/** quasi-steady ROC (m/s) of the sim's force model at SL, clean, gear state g (no thrust-angle terms) */
export function rocModel(ac, V, { T0, Vc }, gear = 0) {
  const W = ac.m * G0, q = 0.5 * RHO0 * V * V, CL = W / (q * ac.S);
  const D = q * ac.S * (ac.CD0 + ac.CDgear * gear + ac.K * (CL - 0.15) ** 2), T = T0 * Vc / Math.sqrt(V * V + Vc * Vc);
  return (T - D) * V / W;
}
function bestRate(ac, th, gear, v0 = 25, v1 = 90) { let best = { V: 0, roc: -1e9 }; for (let V = v0; V <= v1; V += 0.05) { const r = rocModel(ac, V, th, gear); if (r > best.roc) best = { V, roc: r }; } return best; }

export function legacyFit(card, { mode = 'static', T0 = null } = {}) {
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
  // 2) climb → T0, Vc
  const Vy = kcas(card, 'speeds.VY_kt'), roc = val(card, 'performance.ROC_SL_fpm');
  const retract = /retract/.test(String(val(card, 'gear.layout') || ''));
  const gear = retract ? 0 : 1;
  let th = { T0: T0 ?? ac.T0, Vc: ac.eta * ac.P / ac.T0 };
  if (Vy && typeof roc === 'number') {
    const target = roc * FT / 60, Vt = Vy * KT;
    const fitVc = T0v => { let lo = 5, hi = 400; for (let k = 0; k < 60; k++) { const m = 0.5 * (lo + hi); if (bestRate(ac, { T0: T0v, Vc: m }, gear).roc > target) hi = m; else lo = m; } return 0.5 * (lo + hi); };
    if (mode === 'vy') {
      let lo = 0.3 * th.T0, hi = 3 * th.T0;   // larger T0 at fixed ROC moves Vy down
      for (let k = 0; k < 40; k++) { const m = 0.5 * (lo + hi), Vc = fitVc(m), b = bestRate(ac, { T0: m, Vc }, gear); if (b.V > Vt) lo = m; else hi = m; }
      th.T0 = 0.5 * (lo + hi);
    }
    th.Vc = fitVc(th.T0);
    notes.push(`climb fit (${mode}): target Vy ${Vy.toFixed(1)} KCAS ROC ${roc} fpm → T0 ${th.T0.toFixed(0)} N, Vc ${th.Vc.toFixed(1)} m/s`);
  } else notes.push('no VY/ROC target: thrust kept from buildAC');
  ac.T0 = th.T0; ac.eta = th.Vc * th.T0 / ac.P;
  if (ac.eta > 0.95) notes.push(`WARNING eta ${ac.eta.toFixed(2)} > 0.95: P too low for the sim's thrust law at this ROC`);
  return { ac, notes, trace, targets: { VS1: kcas(card, 'speeds.VS1_kt'), VS0: kcas(card, 'speeds.VS0_kt', flapMap(detents(card)).at(-1).name), Vy, roc, glide: gl }, gear,
    legacy: { propulsion: { P: ac.P, eta: +ac.eta.toFixed(4), T0: Math.round(ac.T0), idle: ac.idle }, aero: { CD0: +ac.CD0.toFixed(5), K: +ac.K.toFixed(5), CL0: ac.CL0, CLa: ac.CLa, CLflap: ac.CLflap, CDflap: ac.CDflap, CDgear: ac.CDgear, Cm0: ac.Cm0, Cma: ac.Cma, Cmflap: ac.Cmflap, aStall: ac.aStall, aStallFlap: ac.aStallFlap } } };
}
/** fly the fitted AC in the sim and compare with the targets */
export async function checkFit(M, card, fit) {
  const restore = applyAC(M, fit.ac), info = cardInfo(card, fit.ac), ac = fit.ac, out = {};
  const dets = info.dets, d0 = dets[0], d1 = dets[dets.length - 1];
  for (const [k, d, g] of [['clean', d0, fit.gear], ['full', d1, 1]]) { const vs = Math.sqrt(2 * ac.m * G0 / (RHO0 * ac.S * 1.6)) / KT; out['stall_' + k] = stallTest(M, { ias0: Math.round(1.5 * (k === 'clean' ? fit.targets.VS1 ?? vs : fit.targets.VS0 ?? vs)), flaps: d.f, gear: g }); }
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
  return [
    { id: 'T-LM-19', what: 'legacy fit demo: V_SR clean KCAS (target 48/√0.95 = 49.2)', got: r.stall_clean.VSR_cas, exp: 49.2, tol: 1.0 },
    { id: 'T-LM-19', what: 'legacy fit demo: V_SR full flap KCAS (target 42/√0.95 = 43.1)', got: r.stall_full.VSR_cas, exp: 43.1, tol: 1.0 },
    { id: 'T-LM-20', what: 'legacy fit demo (static): sim ROC fpm (target 730)', got: r.climb.ROCmax_fpm, exp: 730, tol: 40 },
    { id: 'T-LM-20', what: 'legacy fit demo (static): sim Vy kt (limitation, POH 74)', got: r.climb.Vy_kt, exp: 66, tol: 2 },
    { id: 'T-LM-20', what: 'legacy fit demo (vy): sim Vy kt (target 74)', got: rv.climb.Vy_kt, exp: 74, tol: 2 },
    { id: 'T-LM-21', what: 'legacy fit demo: glide L/D at idle 0 (target 9.0)', got: r.glide.LD, exp: 9.0, tol: 0.15 },
    { id: 'T-LM-21', what: 'legacy fit demo: best glide speed kt (target 68)', got: r.glide.Vbg_kt, exp: 68, tol: 2 },
  ];
}

if (isMainModule(import.meta.url)) {
  const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
  const id = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--mode');
  if (!id) { console.error('usage: node lm_legacy_fit.mjs <typeId|demo_light> [--mode static|vy] [--json]'); process.exit(2); }
  const card = id === 'demo_light' ? DEMO.demo_light : loadType(id);
  const fit = legacyFit(card, { mode: opt('--mode', 'static') }), M = await loadSim(), r = await checkFit(M, card, fit);
  const f = (x, n = 1) => (x == null ? '–' : (+x).toFixed(n));
  if (args.includes('--json')) console.log(JSON.stringify({ type: id, legacy: fit.legacy, notes: fit.notes, targets: fit.targets, check: r }, (k, v) => (typeof v === 'number' ? +v.toPrecision(5) : v), 1));
  else {
    console.log(`# lm_legacy_fit ${id} (mode ${opt('--mode', 'static')})`); fit.notes.forEach(n => console.log('  ' + n));
    console.log('aero.legacy', JSON.stringify(fit.legacy.aero)); console.log('propulsion.legacy', JSON.stringify(fit.legacy.propulsion));
    const T = fit.targets;
    console.log(`stall clean V_SR ${f(r.stall_clean.VSR_cas)} KCAS, Vmin ${f(r.stall_clean.Vmin_eas)} (POH min-speed target ${f(T.VS1)}), full V_SR ${f(r.stall_full.VSR_cas)}, Vmin ${f(r.stall_full.Vmin_eas)} (target ${f(T.VS0)})`);
    console.log(`climb Vy ${f(r.climb.Vy_kt)} kt ROC ${f(r.climb.ROCmax_fpm, 0)} fpm (target ${f(T.Vy)} / ${T.roc}); glide ${f(r.glide.Vbg_kt)} kt L/D ${f(r.glide.LD, 2)} (target ${JSON.stringify(T.glide)})`);
    if (r.takeoff) console.log(`takeoff ground roll ${f(r.takeoff.groundRoll_m, 0)} m, 50 ft ${f(r.takeoff.dist50ft_m, 0)} m`);
  }
}
