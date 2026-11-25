#!/usr/bin/env node
// lm_card.mjs — map a merged round-2 type card onto today's AirfieldLab `AC` object and fly it in the
// CURRENT simulator (test/harness.mjs). Library + CLI. Node >= 18, no dependencies.
//
//   node scripts/lm_card.mjs <typeId> [--mass kg] [--config approach|cruise|…] [--flapmap lift|deflection]
//                            [--json] [--quick] [--no-ground] [--trace]
//   (run from the repo root; ROOT = $AIRFIELDLAB_ROOT or the repo root four levels up)
//
// Library:
//   buildAC(card, opts)  -> object with exactly the fields of AC in src/20-flight.js:100-118 (no Iinv)
//                           opts: {mass, config, flapMap, trace: []}  (trace receives one row per field)
//   applyAC(M, ac)       -> mutates the harness AC in place, recomputes AC.Iinv; returns restore()
//   cardInfo(card, ac)   -> test conditions read from the card (detent map, Vy, VR, cruise, IAS->CAS …)
//   runCard(M, ac, info, opts) -> stall / trim / climb / glide / modes / takeoff / landing results
//   trim, trimThr, linearise, modes, stallTest, climbSweep, glideSweep, takeoffTest, landingTest
// The numerical procedures are rewrites of round-1 v10_perf.mjs / v10_modes.mjs / v10_timeresp.mjs
// (same control laws and step sizes), so the trainer_r1 fixture reproduces round-1's published numbers.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { HERE, loadType, val, leaf, isObj, isMainModule, trainingMass, iasCas, LANDING_ALIASES } from './lm_lib.mjs';
import { clmaxFromStall, toSimPolar } from './lm_polar.mjs';
import { inertiaFromRadii, RADII } from './lm_inertia.mjs';

export const ROOT = process.env.AIRFIELDLAB_ROOT || decodeURIComponent(new URL('../../../../', import.meta.url).pathname).replace(/\/$/, '');
const KT = 0.514444, FT = 0.3048, G0 = 9.80665, DEG = Math.PI / 180, RAD = 180 / Math.PI, RHO0 = 1.225;
const LB = 0.45359237, HP = 745.69987;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

export async function loadSim(root = ROOT) {
  const { M } = await import(pathToFileURL(path.join(root, 'test', 'harness.mjs')).href);
  return M;
}

// Fields of AC, src/20-flight.js lines 100-118 (commit cabf0f0), in source order.
export const AC_FIELDS = ['m', 'Ixx', 'Iyy', 'Izz', 'Ixz', 'S', 'b', 'c',
  'CL0', 'CLa', 'CLq', 'CLadot', 'CLde', 'CLflap', 'CD0', 'K', 'CDflap', 'CDgear',
  'CYb', 'CYdr', 'CYr', 'Clb', 'Clp', 'Clr', 'Clda', 'Cldr',
  'Cm0', 'Cma', 'Cmq', 'Cmadot', 'Cmde', 'Cmflap', 'Cnb', 'Cnp', 'Cnr', 'Cnda', 'Cndr',
  'aStall', 'aStallFlap', 'P', 'eta', 'T0', 'idle', 'deUp', 'deDn', 'daMax', 'drMax', 'gear', 'Vref', 'Vapp', 'Vs0'];
export const DERIV_NAMES = ['CLq', 'CLadot', 'CLde', 'CD0', 'K', 'CYb', 'CYdr', 'CYr', 'Clb', 'Clp', 'Clr', 'Clda', 'Cldr', 'Cmq', 'Cmadot', 'Cmde', 'Cnb', 'Cnp', 'Cnr', 'Cnda', 'Cndr'];
export const LEGACY_AERO = ['CL0', 'CLa', 'CLflap', 'CDflap', 'CDgear', 'Cm0', 'Cma', 'Cmflap', 'aStall', 'aStallFlap'];
// Round-1 trainer (= today's AC) — last-resort defaults, always flagged in the trace.
export const AC_R1 = {
  m: 2250, Ixx: 2600, Iyy: 7300, Izz: 9200, Ixz: 120, S: 16.3, b: 10.2, c: 1.65,
  CL0: 0.25, CLa: 4.8, CLq: 7.5, CLadot: 1.6, CLde: 0.35, CLflap: 0.55, CD0: 0.024, K: 0.062, CDflap: 0.050, CDgear: 0.020,
  CYb: -0.60, CYdr: 0.15, CYr: 0.20, Clb: -0.085, Clp: -0.47, Clr: 0.11, Clda: 0.16, Cldr: 0.012,
  Cm0: 0.045, Cma: -0.72, Cmq: -12.5, Cmadot: -4.5, Cmde: -1.15, Cmflap: -0.10,
  Cnb: 0.075, Cnp: -0.055, Cnr: -0.14, Cnda: -0.010, Cndr: -0.072, aStall: 17.0, aStallFlap: -2.5,
  P: 700e3, eta: 0.80, T0: 11500, idle: 0.045, deUp: 22 * DEG, deDn: 15 * DEG, daMax: 20 * DEG, drMax: 25 * DEG,
  gear: [{ b: [2.30, 0, 1.36], k: 5.2e4, c: 5.0e3, stroke: 0.22, steer: true },
    { b: [-0.35, -1.55, 1.38], k: 1.25e5, c: 1.25e4, stroke: 0.25, brake: true },
    { b: [-0.35, 1.55, 1.38], k: 1.25e5, c: 1.25e4, stroke: 0.25, brake: true }],
  Vref: 88, Vapp: 95, Vs0: 71,
};
// Defaults that are not round-1 copies (documented in 01-methods.md §01.1, table "ค่าเริ่มต้น").
export const DEFAULTS = {
  eta: 0.80, idle: 0.02, figureOfMerit: 0.55, gearStaticFrac: 0.30, gearZeta: 0.60, noseLoadFrac: 0.15,
  strokeNose: 0.20, strokeMain: 0.20, VrefOverVs0: 1.3, VappMinusVref: 5, Ixz_over_Ixx: 0.0,
};

// ───────────────────────── card helpers ─────────────────────────
const CLEAN_KEYS = ['clean', 'cruise', '0', 'UP', 'up', 'retracted'];
/** v[first key of order that holds a number]. Not strict: else the first numeric key, marked fallback (the trace flags it).
 *  strict (every clean lookup, R2-07): null instead, so a flap-down value never stands in for the clean one. */
export function pickCfg(v, order, { strict = false } = {}) {
  if (typeof v === 'number') return { v, key: null };
  if (isObj(v)) {
    for (const k of order) if (k != null && typeof v[k] === 'number') return { v: v[k], key: k };
    if (strict) return null;
    const k0 = Object.keys(v).find(k => typeof v[k] === 'number');
    if (k0 != null) return { v: v[k0], key: k0, fallback: true };
  }
  return null;
}

/** Flap detents of a card, sorted by deflection: [{name, deg, dCL0, dCD0, dCm0, CLmax, VFE}] */
export function detents(card) {
  const d = val(card, 'aero.flaps.detents');
  let out = [];
  if (Array.isArray(d) && d.length) out = d.map(x => ({ name: String(x.name), deg: +x.flap_deg, dCL0: x.dCL0, dCD0: x.dCD0, dCm0: x.dCm0, CLmax: x.CLmax, VFE: x.VFE_kt }));
  else {
    const cl0 = val(card, 'aero.static_long.CL0'), vfe = val(card, 'speeds.VFE');
    const keys = isObj(cl0) ? Object.keys(cl0) : isObj(vfe) ? ['0', ...Object.keys(vfe)] : [];
    const deg = k => (CLEAN_KEYS.includes(k) ? 0 : /^-?\d+(\.\d+)?$/.test(k) ? +k : k === 'landing' || k === 'full' || k === 'LDG' ? 99 : NaN);
    out = [...new Set(keys)].map(k => ({ name: k, deg: deg(k) })).filter(x => !Number.isNaN(x.deg));
    if (isObj(cl0)) { const c = pickCfg(cl0, CLEAN_KEYS, { strict: true }); for (const x of out) if (typeof cl0[x.name] === 'number' && c) x.dCL0 = cl0[x.name] - c.v; }
  }
  out.sort((a, b) => a.deg - b.deg);
  if (!out.length || out[0].deg !== 0) out.unshift({ name: '0', deg: 0, dCL0: 0 });
  // no detent data but a landing-flap stall speed or AC.CLflap exists: add a generic full-flap point (f = 1)
  if (out.length === 1 && (typeof val(card, 'speeds.VS0_kt') === 'number' || typeof val(card, 'aero.legacy')?.CLflap === 'number')) out.push({ name: 'full', deg: 1 });
  return out;
}

/**
 * Map real detents to the continuous AC.flaps 0..1.
 * 'lift' (default): f = dCL0(detent)/dCL0(full)  — CL is linear in f in the sim, so lift per detent is exact.
 * 'deflection': f = deg/deg_full. Falls back to 'deflection' when dCL0 is missing.
 */
export function flapMap(dets, mode = 'lift') {
  const full = dets[dets.length - 1];
  const useLift = mode === 'lift' && dets.every(x => typeof x.dCL0 === 'number') && full.dCL0 > 0;
  return dets.map(x => ({ ...x, f: dets.length === 1 ? 0 : useLift ? x.dCL0 / full.dCL0 : (full.deg > 0 ? x.deg / full.deg : 0), mode: useLift ? 'lift' : 'deflection' }));
}

/** IAS -> CAS (kt) for a detent name, from speeds.ias_cas; identity when absent. Returns {f, inv, has}.
 *  Moved to lm_lib.mjs on 19 Nov 2026 (lm_lib.validate needs it); re-exported here so existing imports keep working. */
export { iasCas };

function speedCAS(card, p, detName) {
  const l = leaf(card, p); if (!l || typeof l.v !== 'number') return null;
  const isIAS = /IAS/i.test(l.u || '');
  const tab = iasCas(card, detName);
  return { kcas: isIAS ? tab.f(l.v) : l.v, raw: l.v, u: l.u, converted: isIAS && tab.has };
}

// CL of the sim's blended stall model for alpha (rad), elevator from Cm trim, out of ground effect.
// simStallBlend / simTrimDe / simCLtrim copy stallBlend and the CL / Cm lines of Aircraft.deriv (src/20-flight.js)
// with q = adot = beta = 0 and phiGE = 1; lm_selftest T-LM-32 checks them against the pinned simulator (sim-snapshot.json):
// CL and the stall blend directly, the Cm line through a zero pitch acceleration at the simTrimDe elevator.
export function simStallBlend(alpha, a0) {
  const M = 55, e1 = Math.exp(-M * (alpha - a0)), e2 = Math.exp(M * (alpha + a0));
  return (1 + e1 + e2) / ((1 + e1) * (1 + e2));
}
/** elevator (rad) that zeroes the sim's pitching moment at α (rad), flap fraction f, clamped to the stops */
export function simTrimDe(ac, f, alpha) {
  const a0 = (ac.aStall + ac.aStallFlap * f) * DEG, sig = simStallBlend(alpha, a0);
  const cmNoDe = ac.Cm0 + ac.Cmflap * f + ac.Cma * alpha - sig * 0.25 * Math.max(0, alpha - a0);
  return clamp(-cmNoDe / ac.Cmde, -ac.deUp, ac.deDn);
}
export function simCLtrim(ac, f, alpha) {
  const a0 = (ac.aStall + ac.aStallFlap * f) * DEG, sig = simStallBlend(alpha, a0);
  const de = simTrimDe(ac, f, alpha);
  const CLlin = ac.CL0 + ac.CLflap * f + ac.CLa * alpha + ac.CLde * de;
  const sa = Math.sin(alpha), ca = Math.cos(alpha);
  return (1 - sig) * CLlin + sig * 2 * Math.sign(alpha) * sa * sa * ca;
}
export function simCLmax(ac, f) {
  let best = { CL: -9, alpha: 0 };
  for (let a = 0; a <= 30; a += 0.02) { const CL = simCLtrim(ac, f, a * DEG); if (CL > best.CL) best = { CL, alpha: a }; }
  return best;
}
/** blend centre a0 (deg) so that the sim's trimmed 1-g CLmax equals target at flap fraction f */
export function solveStallCentre(ac, f, target) {
  let lo = 5, hi = 30; const tmp = { ...ac, aStallFlap: 0 };
  for (let i = 0; i < 50; i++) { const mid = (lo + hi) / 2; tmp.aStall = mid; if (simCLmax(tmp, f).CL > target) hi = mid; else lo = mid; }
  return (lo + hi) / 2;
}

// ───────────────────────── buildAC ─────────────────────────
export function buildAC(card, opts = {}) {
  const tr = opts.trace || [];
  const T = (field, value, from, rule, flag = '') => { tr.push({ field, value, from, rule, flag }); return value; };
  const ac = {};
  const cfgOrder = [opts.config, 'approach', ...LANDING_ALIASES, 'cruise', 'clean'];   // same landing names as POINT_CFG.approach

  // mass and inertia (training_mass: number or the D3 object {kg, empty_kg, crew_kg, fuel_kg}, lm_lib.trainingMass)
  const tm = trainingMass(card), mtow = val(card, 'airframe.weights.MTOW');
  const tmv = tm?.kg;
  if (opts.mass) ac.m = T('m', +opts.mass, '--mass', 'ตัวเลือก CLI');
  else if (typeof tmv === 'number') ac.m = T('m', tmv, 'airframe.weights.training_mass' + (tm.form === 'object' ? '.kg' : ''), 'ตรง');
  else if (typeof mtow === 'number') ac.m = T('m', mtow, 'airframe.weights.MTOW', 'ไม่มี training_mass ใช้ MTOW', 'default');
  else ac.m = T('m', AC_R1.m, 'AC_R1', 'ไม่มีข้อมูลมวล', 'R1');

  const S = val(card, 'aero.ref.S') ?? val(card, 'airframe.wing.S');
  const b = val(card, 'aero.ref.b') ?? val(card, 'airframe.wing.b') ?? val(card, 'airframe.geometry.span');
  const c = val(card, 'aero.ref.c') ?? val(card, 'airframe.wing.MAC');
  ac.S = T('S', S ?? AC_R1.S, S != null ? 'aero.ref.S | airframe.wing.S' : 'AC_R1', 'ตรง', S == null ? 'R1' : '');
  ac.b = T('b', b ?? AC_R1.b, b != null ? 'aero.ref.b | airframe.wing.b' : 'AC_R1', 'ตรง', b == null ? 'R1' : '');
  ac.c = T('c', c ?? AC_R1.c, c != null ? 'aero.ref.c | airframe.wing.MAC' : 'AC_R1', 'ตรง', c == null ? 'R1' : '');

  const In = name => val(card, 'airframe.inertia.' + name);
  const refM = In('ref_mass');
  if (typeof In('Ixx') === 'number' && typeof In('Iyy') === 'number' && typeof In('Izz') === 'number') {
    const s = typeof refM === 'number' ? ac.m / refM : 1;
    for (const k of ['Ixx', 'Iyy', 'Izz']) ac[k] = T(k, In(k) * s, 'airframe.inertia.' + k, typeof refM === 'number' ? `× m/ref_mass = ${s.toFixed(3)} (รัศมีไจเรชันคงที่)` : 'ตรง (ไม่มี ref_mass)');
    ac.Ixz = T('Ixz', (typeof In('Ixz') === 'number' ? In('Ixz') : 0) * s, typeof In('Ixz') === 'number' ? 'airframe.inertia.Ixz' : 'ค่าเริ่มต้น 0', typeof In('Ixz') === 'number' ? 'สเกลเหมือน Ixx' : 'แกนลำตัว GA มี Ixz เล็ก', typeof In('Ixz') === 'number' ? '' : 'default');
  } else {
    const L = val(card, 'airframe.geometry.length');
    let radii = In('radii'), from = 'airframe.inertia.radii', flag = '';
    if (!isObj(radii)) { radii = RADII[guessClass(card)]; from = `common_light.methods.radii.${guessClass(card)}`; flag = 'default'; }
    if (L && ac.b) {
      const I = inertiaFromRadii({ m: ac.m, b: ac.b, L, ...radii });
      for (const k of ['Ixx', 'Iyy', 'Izz']) ac[k] = T(k, I[k], from, 'Roskam: I = m (R·ℓ/2)²', flag);
      ac.Ixz = T('Ixz', 0, 'ค่าเริ่มต้น 0', 'ไม่มีข้อมูล', 'default');
    } else for (const k of ['Ixx', 'Iyy', 'Izz', 'Ixz']) ac[k] = T(k, AC_R1[k] * ac.m / AC_R1.m, 'AC_R1 × m/2250', 'ไม่มี length หรือ inertia', 'R1');
  }

  // detents and legacy static aero
  const dets = flapMap(detents(card), opts.flapMap || 'lift');
  const leg = val(card, 'aero.legacy') || {};
  const sl = n => val(card, 'aero.static_long.' + n);
  const fullName = dets[dets.length - 1].name;
  // review 2026-11-18: with no flap data the only detent is the clean one (dCL0 = 0); do not take it as the full-flap
  // increment (that silently set CLflap = 0 instead of falling back to R1 and flagging it)
  const fullDet = dets.length > 1 ? dets[dets.length - 1] : {};
  const atKey = (o, k) => (isObj(o) && typeof o[k] === 'number' ? o[k] : null);
  const cleanOf = o => pickCfg(o, CLEAN_KEYS, { strict: true })?.v ?? null;   // R2-07: no flap-down value as the clean one

  const take = (field, legacyVal, fallbacks) => {
    if (typeof legacyVal === 'number') return T(field, legacyVal, 'aero.legacy.' + field, 'ตรง');
    for (const [v, from, rule] of fallbacks) if (typeof v === 'number' && Number.isFinite(v)) return T(field, v, from, rule, 'fallback');
    return T(field, AC_R1[field], 'AC_R1', 'ไม่มีข้อมูล ใช้ค่าเครื่องฝึกรอบที่ 1', 'R1');
  };
  const CL0o = sl('CL0'), Cm0o = sl('Cm0');
  ac.CL0 = take('CL0', leg.CL0, [[cleanOf(CL0o), 'aero.static_long.CL0 (clean)', 'ค่า clean']]);
  ac.CLa = take('CLa', leg.CLa, [[cleanOf(sl('CLalpha')), 'aero.static_long.CLalpha', 'ค่า clean']]);
  ac.CLflap = take('CLflap', leg.CLflap, [[atKey(CL0o, fullName) != null && cleanOf(CL0o) != null ? atKey(CL0o, fullName) - cleanOf(CL0o) : null, `aero.static_long.CL0[${fullName}] − clean`, 'ΔCL0 ของแฟลปสุด'], [fullDet.dCL0, 'aero.flaps.detents[full].dCL0', 'ΔCL0 ของแฟลปสุด']]);
  const fullDCD = fullDet.dCD0;
  ac.CDflap = take('CDflap', leg.CDflap, [[fullDCD, 'aero.flaps.detents[full].dCD0', 'CD เพิ่มที่แฟลปสุด (f = 1)']]);
  const retract = /retract/.test(String(val(card, 'gear.layout') || ''));
  ac.CDgear = take('CDgear', leg.CDgear, [[retract ? val(card, 'aero.gear_drag.dCD0') : 0, retract ? 'aero.gear_drag.dCD0' : 'ล้อตายตัว', retract ? 'ตรง' : 'ล้อตายตัว: แรงต้านล้อรวมใน CD0 จึงตั้ง CDgear = 0']]);
  ac.Cm0 = take('Cm0', leg.Cm0, [[cleanOf(Cm0o), 'aero.static_long.Cm0 (clean)', 'ค่า clean']]);
  ac.Cma = take('Cma', leg.Cma, [[cleanOf(sl('Cmalpha')), 'aero.static_long.Cmalpha', 'ค่า clean']]);
  ac.Cmflap = take('Cmflap', leg.Cmflap, [[atKey(Cm0o, fullName) != null && cleanOf(Cm0o) != null ? atKey(Cm0o, fullName) - cleanOf(Cm0o) : null, `aero.static_long.Cm0[${fullName}] − clean`, 'ΔCm0 ของแฟลปสุด'], [fullDet.dCm0, 'aero.flaps.detents[full].dCm0', 'ΔCm0']]);

  // linear derivatives
  for (const n of DERIV_NAMES) {
    if ((n === 'CD0' || n === 'K') && typeof leg[n] === 'number') { T(n, ac[n] = leg[n], 'aero.legacy.' + n, 'ตรง (รูปแบบของซิม K·(CL − 0.15)²)'); continue; }
    const v = val(card, 'aero.derivatives.' + n);
    const polar = n === 'CD0' || n === 'K';
    const p = polar ? pickCfg(v, CLEAN_KEYS, { strict: true }) : pickCfg(v, cfgOrder);   // R2-07 review: the polar only from a clean key
    if (p) T(n, ac[n] = p.v, 'aero.derivatives.' + n + (p.key ? `.${p.key}` : ''), p.key ? `เลือก config "${p.key}"` : 'ตรง', p.fallback ? 'fallback' : '');
    else {
      const est = opts.derivEstimates?.[n];
      if (typeof est === 'number') T(n, ac[n] = est, 'lm_derivs (ประมาณจากรูปทรง)', 'ค่าประมาณ', 'est');
      else T(n, ac[n] = AC_R1[n], 'AC_R1', 'ไม่มีข้อมูล ใช้ค่าเครื่องฝึกรอบที่ 1', 'R1');
    }
  }

  // physical parabolic polar (aero.derivatives.CD0/K about CL = 0) → sim form about CL 0.15, same (L/D)max and CL*
  if (typeof leg.CD0 !== 'number' && typeof leg.K !== 'number') {
    const pc = pickCfg(val(card, 'aero.derivatives.CD0'), CLEAN_KEYS, { strict: true }), pk = pickCfg(val(card, 'aero.derivatives.K'), CLEAN_KEYS, { strict: true });
    if (pc && pk) { const sp = toSimPolar({ CD0: pc.v, K: pk.v });
      T('CD0', ac.CD0 = sp.CD0, 'aero.derivatives.CD0 + K', `แปลงเป็นรูปแบบซิม: (L/D)max ${sp.Emax.toFixed(2)} และ CL* ${sp.CLstar.toFixed(3)} คงเดิม`, 'converted');
      T('K', ac.K = sp.K, 'aero.derivatives.CD0 + K', 'Ks = 1/(2E(CL* − 0.15))', 'converted'); }
  }

  // control travel (needed before the stall-centre solve). Review 19 Nov 2026 (gap 2, decision D2): the cards keep the leaf at
  // controls.surfaces.<s> with the angles in v.travel_deg (schema-ext-r2 §5); the old leaf path controls.surfaces.<s>.travel_deg
  // is still read as a fallback. Before this fix only the old path was read, so every card silently flew with the R1 travel.
  const el = travelOf(card, 'elevator'), ai = travelOf(card, 'aileron'), ru = travelOf(card, 'rudder');
  ac.deUp = T('deUp', el?.up != null ? el.up * DEG : AC_R1.deUp, el ? el.from + '.up' : 'AC_R1', 'deg → rad (de ลบ = ขอบท้ายขึ้น)', el?.up != null ? '' : 'R1');
  ac.deDn = T('deDn', el?.down != null ? el.down * DEG : AC_R1.deDn, el ? el.from + '.down' : 'AC_R1', 'deg → rad', el?.down != null ? '' : 'R1');
  ac.daMax = T('daMax', ai && ai.up != null && ai.down != null ? 0.5 * (ai.up + ai.down) * DEG : ai && (ai.up ?? ai.down) != null ? (ai.up ?? ai.down) * DEG : AC_R1.daMax,
    ai ? ai.from : 'AC_R1', 'da = ค่าเฉลี่ยของสองข้าง ½(up + down) ให้ตรงนิยาม Clda ต่อ rad ของ da เฉลี่ย', ai && (ai.up ?? ai.down) != null ? '' : 'R1');
  ac.drMax = T('drMax', ru && (ru.left ?? ru.right) != null ? Math.min(ru.left ?? ru.right, ru.right ?? ru.left) * DEG : AC_R1.drMax,
    ru ? ru.from : 'AC_R1', 'ซิมจำกัดสมมาตร ±drMax จึงใช้ min(left, right)', ru && (ru.left ?? ru.right) != null ? '' : 'R1');

  // stall: blend centre from CLmax targets when aero.legacy lacks it
  const clmaxT = det => {
    const t = sl('CLmax_target'); const nm = det.name;
    if (isObj(t)) { if (typeof t[nm] === 'number') return [t[nm], `aero.static_long.CLmax_target.${nm}`]; if (det.deg === 0 && cleanOf(t) != null) return [cleanOf(t), 'aero.static_long.CLmax_target (clean)']; if (det === dets[dets.length - 1] && typeof (t.landing ?? t.full) === 'number') return [t.landing ?? t.full, 'aero.static_long.CLmax_target.landing']; }
    if (typeof det.CLmax === 'number') return [det.CLmax, 'aero.flaps.detents.CLmax'];
    const vs = det.deg === 0 ? speedCAS(card, 'speeds.VS1_kt', det.name) : det === dets[dets.length - 1] ? speedCAS(card, 'speeds.VS0_kt', det.name) : null;
    const mt = typeof mtow === 'number' ? mtow : ac.m;
    if (vs) return [clmaxFromStall({ mass: mt, S: ac.S, vs_kcas: vs.kcas, kind: 'min' }).CLmax_1g, `speeds.${det.deg === 0 ? 'VS1' : 'VS0'}_kt → lm_polar (MTOW, CAS, min-speed → 1 g)`];
    return null;
  };
  if (typeof leg.aStall === 'number' && typeof leg.aStallFlap === 'number') {
    T('aStall', ac.aStall = leg.aStall, 'aero.legacy.aStall', 'ตรง'); T('aStallFlap', ac.aStallFlap = leg.aStallFlap, 'aero.legacy.aStallFlap', 'ตรง');
  } else {
    const c0 = clmaxT(dets[0]), c1 = dets.length > 1 ? clmaxT(dets[dets.length - 1]) : null;
    if (typeof leg.aStall === 'number') T('aStall', ac.aStall = leg.aStall, 'aero.legacy.aStall', 'ตรง');
    else if (c0) T('aStall', ac.aStall = +solveStallCentre(ac, 0, c0[0]).toFixed(2), c0[1], `แก้หา a0 ให้ CLmax 1 g (trim) ของซิม = ${c0[0].toFixed(3)}`, 'solved');
    else T('aStall', ac.aStall = AC_R1.aStall, 'AC_R1', 'ไม่มีข้อมูล', 'R1');
    const f1 = dets.length > 1 ? dets[dets.length - 1].f : 1;
    if (typeof leg.aStallFlap === 'number') T('aStallFlap', ac.aStallFlap = leg.aStallFlap, 'aero.legacy.aStallFlap', 'ตรง');
    else if (c1 && f1 > 0) T('aStallFlap', ac.aStallFlap = +((solveStallCentre(ac, f1, c1[0]) - ac.aStall) / f1).toFixed(2), c1[1], `แก้หา a0(f=1) ให้ CLmax = ${c1[0].toFixed(3)}`, 'solved');
    else T('aStallFlap', ac.aStallFlap = AC_R1.aStallFlap, 'AC_R1', 'ไม่มีข้อมูล', 'R1');
  }

  // propulsion
  const pl = val(card, 'propulsion.legacy') || {};
  const nEng = Array.isArray(val(card, 'propulsion.layout')) ? val(card, 'propulsion.layout').length : 1;
  const Prated = val(card, 'piston.ratings.P_rated') ?? val(card, 'propeller.engineInterface.maxShaftPower');
  const Pr = typeof Prated === 'number' ? (Prated < 5000 ? Prated * 1000 : Prated) : null;   // tolerate kW
  ac.P = typeof pl.P === 'number' ? T('P', pl.P, 'propulsion.legacy.P', 'ตรง') : Pr ? T('P', Pr * nEng, 'piston.ratings.P_rated × จำนวนเครื่อง', 'กำลังพิกัดที่ระดับน้ำทะเล', 'fallback') : T('P', AC_R1.P, 'AC_R1', 'ไม่มีข้อมูล', 'R1');
  ac.eta = typeof pl.eta === 'number' ? T('eta', pl.eta, 'propulsion.legacy.eta', 'ตรง') : T('eta', DEFAULTS.eta, 'DEFAULTS.eta', 'ประสิทธิภาพใบพัดช่วงไต่ (ค่าประมาณ)', 'default');
  if (typeof pl.T0 === 'number') ac.T0 = T('T0', pl.T0, 'propulsion.legacy.T0', 'ตรง');
  else {
    const D = val(card, 'propeller.identity.diameter');
    if (typeof D === 'number') {
      const A = Math.PI * D * D / 4;
      const rpmS = val(card, 'propeller.fixed.static_rpm_range'), rpmR = val(card, 'piston.ratings.rpm_rated');
      const pFrac = Array.isArray(rpmS) && typeof rpmR === 'number' ? 0.5 * (rpmS[0] + rpmS[1]) / rpmR : 1;
      const T0 = nEng * Math.pow(DEFAULTS.figureOfMerit * (ac.P / nEng) * pFrac * Math.sqrt(2 * RHO0 * A), 2 / 3);
      ac.T0 = T('T0', T0, 'propeller.identity.diameter + กำลัง', `โมเมนตัม: T = (FM·P·√(2ρA))^(2/3), FM ${DEFAULTS.figureOfMerit}, P×${pFrac.toFixed(2)} (รอบสถิต/รอบพิกัด)`, 'est');
    } else ac.T0 = T('T0', AC_R1.T0 * ac.P / AC_R1.P, 'AC_R1 × P/700 kW', 'ไม่มีข้อมูลใบพัด', 'R1');
  }
  ac.idle = typeof pl.idle === 'number' ? T('idle', pl.idle, 'propulsion.legacy.idle', 'ตรง') : T('idle', DEFAULTS.idle, 'DEFAULTS.idle', 'แรงขับ idle ของลูกสูบใกล้ศูนย์ (ค่าประมาณ)', 'default');

  // gear (legacy linear spring-damper, 3 struts: nose steer, left/right main brake)
  ac.gear = legacyGear(card, ac, T);

  // reference speeds (sim "IAS" is EAS ≈ CAS below 200 kt; feed CAS)
  const full = dets[dets.length - 1].name;
  const vs0 = speedCAS(card, 'speeds.VS0_kt', full);
  ac.Vs0 = vs0 ? T('Vs0', Math.round(vs0.kcas), 'speeds.VS0_kt', vs0.converted ? `KIAS ${vs0.raw} → KCAS ด้วย speeds.ias_cas แล้วปัด` : `${vs0.u}; ปัดเป็น kt เต็ม`) : T('Vs0', AC_R1.Vs0, 'AC_R1', 'ไม่มีข้อมูล', 'R1');
  const vref = speedCAS(card, 'speeds.VREF_kt', full);
  ac.Vref = vref ? T('Vref', Math.round(vref.kcas), 'speeds.VREF_kt', vref.converted ? 'KIAS → KCAS' : vref.u) : T('Vref', Math.round(DEFAULTS.VrefOverVs0 * ac.Vs0), 'Vs0', '1.3 VS0 (14 CFR 23 เดิม / AFH)', 'default');
  const vapp = speedCAS(card, 'speeds.VAPP_kt', full);
  ac.Vapp = vapp ? T('Vapp', Math.round(vapp.kcas), 'speeds.VAPP_kt', vapp.converted ? 'KIAS → KCAS' : vapp.u) : T('Vapp', ac.Vref + DEFAULTS.VappMinusVref, 'Vref', 'Vref + 5 kt (ค่าประมาณ)', 'default');

  const out = {}; for (const k of AC_FIELDS) out[k] = ac[k];
  return out;
}

/**
 * Control-surface travel in degrees: {up, down} (elevator, aileron, flap) or {left, right} (rudder), plus `from` (the path read).
 * D2 (19 Nov 2026): leaf controls.surfaces.<s> with v.travel_deg first; the old leaf path controls.surfaces.<s>.travel_deg as a
 * fallback. A plain number means a symmetric travel (±n). Returns null when the card has neither.
 */
export function travelOf(card, s) {
  const sym = (n, from) => ({ up: n, down: n, left: n, right: n, from });
  const v = val(card, `controls.surfaces.${s}`);
  if (isObj(v) && v.travel_deg != null) {
    if (typeof v.travel_deg === 'number') return sym(v.travel_deg, `controls.surfaces.${s}.v.travel_deg`);
    if (isObj(v.travel_deg)) return { ...v.travel_deg, from: `controls.surfaces.${s}.v.travel_deg` };
  }
  const o = val(card, `controls.surfaces.${s}.travel_deg`);
  if (typeof o === 'number') return sym(o, `controls.surfaces.${s}.travel_deg (path เดิม)`);
  if (isObj(o)) return { ...o, from: `controls.surfaces.${s}.travel_deg (path เดิม)` };
  return null;
}

function guessClass(card) {
  const lay = val(card, 'propulsion.layout'); const n = Array.isArray(lay) ? lay.length : 1;
  const kind = Array.isArray(lay) ? lay[0]?.type : null;
  if (kind === 'turboprop' && n === 1) return 'trainer_turboprop';
  return n > 1 ? 'twin_prop' : 'single_prop';
}

function legacyGear(card, ac, T) {
  const g = n => val(card, 'gear.' + n);
  const gl = g('legacy');
  if (Array.isArray(gl) && gl.length === 3) { T('gear', gl, 'gear.legacy', 'ตรง (override ของ AC.gear)'); return gl.map(x => ({ ...x, b: [...x.b] })); }
  const W = ac.m * G0;
  let pn = g('geometry.nose_contact_body_extended'), pm = g('geometry.main_contact_body_extended');
  let from = 'gear.geometry.*_contact_body_extended', flag = '';
  if (!(Array.isArray(pn) && Array.isArray(pm))) {
    const wb = val(card, 'airframe.geometry.wheelbase'), tr = val(card, 'airframe.geometry.main_track');
    const fn = DEFAULTS.noseLoadFrac, hp = g('geometry.cg_height_parked') ?? 1.0;
    if (typeof wb === 'number' && typeof tr === 'number') {
      pn = [(1 - fn) * wb, 0, hp]; pm = [[-fn * wb, -tr / 2, hp], [-fn * wb, tr / 2, hp]]; from = 'airframe.geometry.wheelbase/main_track'; flag = 'est';
    } else { T('gear', AC_R1.gear, 'AC_R1', 'ไม่มีข้อมูลล้อ', 'R1'); return AC_R1.gear.map(x => ({ ...x, b: [...x.b] })); }
  }
  const xm = pm[0][0], xn = pn[0];
  const Nn = W * (-xm) / (xn - xm), Nm = (W - Nn) / 2;
  const strut = (s, N, dStroke) => {
    const sp = g(`strut_${s}.spring`) || {};
    const stroke = g(`strut_${s}.stroke`) ?? sp.max_deflection ?? dStroke;
    const k = sp.k_vertical ?? N / (sp.static_deflection ?? DEFAULTS.gearStaticFrac * stroke);
    const zeta = sp.damping_ratio ?? DEFAULTS.gearZeta;
    const c = 2 * zeta * Math.sqrt(k * N / G0);
    return { k, c, stroke, d: N / k, src: { k: sp.k_vertical != null ? 'k_vertical' : sp.static_deflection != null ? 'N/static_deflection' : `N/(${DEFAULTS.gearStaticFrac}·stroke)`, zeta: sp.damping_ratio != null ? 'damping_ratio' : `ζ ${DEFAULTS.gearZeta}` } };
  };
  const sn = strut('nose', Nn, DEFAULTS.strokeNose), sm = strut('main', Nm, DEFAULTS.strokeMain);
  const hp = g('geometry.cg_height_parked');
  const zN = typeof hp === 'number' && !Array.isArray(g('geometry.nose_contact_body_extended')) ? hp + sn.d : pn[2];
  const zM = typeof hp === 'number' && !Array.isArray(g('geometry.main_contact_body_extended')) ? hp + sm.d : pm[0][2];
  const gear = [
    { b: [pn[0], 0, zN], k: sn.k, c: sn.c, stroke: sn.stroke, steer: true },
    { b: [pm[0][0], pm[0][1], zM], k: sm.k, c: sm.c, stroke: sm.stroke, brake: true },
    { b: [pm[1][0], pm[1][1], zM], k: sm.k, c: sm.c, stroke: sm.stroke, brake: true },
  ];
  T('gear', gear, from, `N_nose = W·(−x_m)/(x_n − x_m) = ${Nn.toFixed(0)} N; k: ${sn.src.k}/${sm.src.k}; c = 2ζ√(k N/g) (${sn.src.zeta})`, flag);
  return gear;
}

// ───────────────────────── applyAC ─────────────────────────
export function applyAC(M, ac) {
  const A = M.AC, old = {};
  for (const k of AC_FIELDS) old[k] = A[k];
  old.Iinv = A.Iinv;
  for (const k of AC_FIELDS) if (ac[k] !== undefined) A[k] = k === 'gear' ? ac.gear.map(g => ({ ...g, b: [...g.b] })) : ac[k];
  const { Ixx, Iyy, Izz, Ixz } = A, Gd = Ixx * Izz - Ixz * Ixz;            // as src/20-flight.js:119-122
  A.Iinv = [Izz / Gd, 0, Ixz / Gd, 0, 1 / Iyy, 0, Ixz / Gd, 0, Ixx / Gd];
  return () => { for (const k of AC_FIELDS) A[k] = old[k]; A.Iinv = old.Iinv; };
}

// ───────────────────────── per-point derivative sets (R2-07) ─────────────────────────
// aero.derivatives.<n> may be keyed by configuration ({cruise, approach}); buildAC picks ONE value per field (opts.config,
// else 'approach' first), so before R2-07 runCard linearised the cruise point with the approach set. runCard now swaps in
// the set of each linearisation point around its modes() call. Order per point: the point's own key, then its synonyms
// (approach: the landing names of lm_lib LANDING_ALIASES; the 14 cards keyed by config today use cruise/approach only);
// a field with none of them keeps the value of the AC that runCard was given. CD0/K are left out: buildAC takes the
// polar from aero.legacy or the clean/cruise value at every point (flap and gear drag are CDflap/CDgear).
export const POINT_CFG = { cruise: ['cruise', 'clean', '0', 'UP', 'up', 'retracted'], approach: ['approach', ...LANDING_ALIASES] };
/** {cruise: {field: value}, approach: {...}, keys: {cruise: {field: key}, ...}} for the config-keyed aero.derivatives of a card */
export function derivSets(card) {
  const out = { cruise: {}, approach: {}, keys: { cruise: {}, approach: {} } };
  for (const n of DERIV_NAMES) {
    if (n === 'CD0' || n === 'K') continue;
    const v = val(card, 'aero.derivatives.' + n);
    if (!isObj(v)) continue;
    for (const [pt, order] of Object.entries(POINT_CFG)) {
      const k = order.find(x => typeof v[x] === 'number');
      if (k != null) { out[pt][n] = v[k]; out.keys[pt][n] = k; }
    }
  }
  return out;
}
/** run fn with the fields of `set` written into the harness AC, then put the old values back (inertia untouched) */
export function withDerivs(M, set, fn) {
  const keep = {}; for (const k of Object.keys(set || {})) { keep[k] = M.AC[k]; M.AC[k] = set[k]; }
  try { return fn(); } finally { Object.assign(M.AC, keep); }
}

// ───────────────────────── card → test conditions ─────────────────────────
export function cardInfo(card, ac, opts = {}) {
  const dets = flapMap(detents(card), opts.flapMap || 'lift');
  const full = dets[dets.length - 1];
  const retract = /retract/.test(String(val(card, 'gear.layout') || ''));
  const sp = (p, det) => speedCAS(card, p, det)?.kcas ?? null;
  const tt = n => val(card, `validation.trim_targets.${n}`);
  const cr = tt('cruise'), ap = tt('approach'), to = val(card, 'validation.takeoff_test');
  const clean = dets[0].name;   // R2-07: the card's own clean detent name (was '0', which iasCas only met by the first-row fallback on UP cards)
  const vne = sp('speeds.VNE_kt', clean), vno = sp('speeds.VNO_kt', clean);
  const toDet = isObj(to) && to.flap != null ? dets.find(d => d.name === String(to.flap)) : dets[0];
  return {
    dets, retract,
    ias2cas: name => iasCas(card, name),
    Vy: sp('speeds.VY_kt', clean), Vx: sp('speeds.VX_kt', clean), VS1: sp('speeds.VS1_kt', clean), VS0: sp('speeds.VS0_kt', full.name),
    vmax: vne ?? (vno ? vno * 1.2 : 2.3 * ac.Vs0),
    cruise: isObj(cr) && cr.ias_kt ? { ias: cr.ias_kt, h: (cr.h_ft ?? 3000) * FT } : { ias: Math.round(0.85 * (vno ?? 1.9 * ac.Vs0)), h: 3000 * FT, est: true },
    approach: isObj(ap) && ap.ias_kt ? { ias: ap.ias_kt, h: (ap.h_m ?? 300), gammaDeg: ap.gamma_deg ?? -3 } : { ias: ac.Vapp, h: 300, gammaDeg: -3 },
    takeoff: { f: toDet?.f ?? 0, name: toDet?.name ?? clean, VR: (isObj(to) && to.VR_kt) || sp('speeds.VR_kt', toDet?.name ?? clean) || null, theta: (isObj(to) && to.theta_deg) || 10, mode: (isObj(to) && to.mode) || 'r1', rate: (isObj(to) && to.rate_dps) || 5 },
    stallStart: isObj(val(card, 'validation.stall_test')) ? val(card, 'validation.stall_test') : null,
    derivSets: derivSets(card),
  };
}

// ───────────────────────── numerics (rewritten from round-1 v10_modes / v10_perf) ─────────────────────────
const e2q = (f, t, p) => { const cr = Math.cos(f / 2), sr = Math.sin(f / 2), cp = Math.cos(t / 2), sp = Math.sin(t / 2), cy = Math.cos(p / 2), sy = Math.sin(p / 2);
  return [cr * cp * cy + sr * sp * sy, sr * cp * cy - cr * sp * sy, cr * sp * cy + sr * cp * sy, cr * cp * sy - sr * sp * cy]; };
const q2R = ([w, x, y, z]) => [1 - 2 * (y * y + z * z), 2 * (x * y - w * z), 2 * (x * z + w * y), 2 * (x * y + w * z), 1 - 2 * (x * x + z * z), 2 * (y * z - w * x), 2 * (x * z - w * y), 2 * (y * z + w * x), 1 - 2 * (x * x + y * y)];
const Rv = (R, v) => [R[0] * v[0] + R[1] * v[1] + R[2] * v[2], R[3] * v[0] + R[4] * v[1] + R[5] * v[2], R[6] * v[0] + R[7] * v[1] + R[8] * v[2]];
const RTv = (R, v) => [R[0] * v[0] + R[3] * v[1] + R[6] * v[2], R[1] * v[0] + R[4] * v[1] + R[7] * v[2], R[2] * v[0] + R[5] * v[1] + R[8] * v[2]];

/** body-axis state y = [u v w p q r phi theta psi] -> dy/dt through Aircraft.deriv */
export function f9(ac, y, h) {
  const [u, v, w, p, q, r, ph, th, ps] = y, Q = e2q(ph, th, ps), R = q2R(Q), vn = Rv(R, [u, v, w]);
  const s = Float64Array.from([0, 0, -h, ...vn, ...Q, p, q, r]), o = new Float64Array(13);
  ac.deriv(s, o);
  const ab = RTv(R, [o[3], o[4], o[5]]);
  const t = Math.tan(th), c = Math.cos(th);
  return [ab[0] - (q * w - r * v), ab[1] - (r * u - p * w), ab[2] - (p * v - q * u), o[10], o[11], o[12],
    p + (q * Math.sin(ph) + r * Math.cos(ph)) * t, q * Math.cos(ph) - r * Math.sin(ph), (q * Math.sin(ph) + r * Math.cos(ph)) / c];
}
export function solve(A, b) {
  const n = b.length, W = A.map((r, i) => [...r, b[i]]);
  for (let k = 0; k < n; k++) { let p = k; for (let i = k + 1; i < n; i++) if (Math.abs(W[i][k]) > Math.abs(W[p][k])) p = i;
    [W[k], W[p]] = [W[p], W[k]];
    for (let i = k + 1; i < n; i++) { const f = W[i][k] / W[k][k]; for (let j = k; j <= n; j++) W[i][j] -= f * W[k][j]; } }
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) { let s = W[i][n]; for (let j = i + 1; j < n; j++) s -= W[i][j] * x[j]; x[i] = s / W[i][i]; }
  return x;
}
const newton3 = (res, x, it = 40, relax = 1) => {
  for (let k = 0; k < it; k++) { const r0 = res(x), J = [[], [], []];
    for (let j = 0; j < 3; j++) { const xp = x.slice(); xp[j] += 1e-6; const r1 = res(xp); for (let i = 0; i < 3; i++) J[i][j] = (r1[i] - r0[i]) / 1e-6; }
    const dx = solve(J, r0.map(v => -v)); x = x.map((v, i) => v + relax * dx[i]); if (Math.hypot(...dx) < 1e-12) break; }
  return x;
};
/** wings-level trim with flight-path angle given: unknowns alpha, de, thr (v10_modes.trim) */
export function trim(M, ac, { ias, h, flaps = 0, gear = 0, gammaDeg = 0 }) {
  ac.flaps = flaps; ac.gearPos = gear; ac.adot = 0;
  const rho = M.atmosphere(M.FIELD.elev + h, ac.isaDev).rho, V = ias * KT / Math.sqrt(rho / RHO0), g = gammaDeg * DEG;
  const res = x => { ac.de = x[1]; ac.thr = x[2]; const a = x[0]; const fy = f9(ac, [V * Math.cos(a), 0, V * Math.sin(a), 0, 0, 0, 0, a + g, 0], h); return [fy[0], fy[2], fy[4]]; };
  const x = newton3(res, [4 * DEG, -2 * DEG, 0.4], 30); res(x);
  return { ias, V, alpha: x[0], de: x[1], thr: x[2], theta: x[0] + g, gamma: g, y0: [V * Math.cos(x[0]), 0, V * Math.sin(x[0]), 0, 0, 0, 0, x[0] + g, 0], h, rho };
}
/** steady trim with throttle fixed: unknowns alpha, de, gamma (v10_perf.trimThr) */
export function trimThr(M, ias, thr, flaps, gear, h) {
  const ac = new M.Aircraft(); ac.flaps = flaps; ac.gearPos = gear; ac.thr = thr; ac.adot = 0;
  const rho = M.atmosphere(M.FIELD.elev + h, 0).rho, V = ias * KT / Math.sqrt(rho / RHO0);
  const res = x => { ac.de = x[1]; const [al, , g] = x; const fy = f9(ac, [V * Math.cos(al), 0, V * Math.sin(al), 0, 0, 0, 0, al + g, 0], h); return [fy[0], fy[2], fy[4]]; };
  const x = newton3(res, [3 * DEG, -2 * DEG, 0], 40, 0.7);
  return { ias, V, alpha: x[0] * RAD, de: x[1] * RAD, gamma: x[2] * RAD, theta: (x[0] + x[2]) * RAD, roc_fpm: V * Math.sin(x[2]) / FT * 60, LoverD: -1 / Math.tan(x[2]) };
}
export function linearise(M, ac, T, { adot = true } = {}) {
  const y0 = T.y0, n = 9, A = [...Array(n)].map(() => new Array(n).fill(0)), eps = [1e-3, 1e-3, 1e-3, 1e-5, 1e-5, 1e-5, 1e-5, 1e-5, 1e-5];
  for (let j = 0; j < n; j++) { const yp = y0.slice(), ym = y0.slice(); yp[j] += eps[j]; ym[j] -= eps[j];
    const fp = f9(ac, yp, T.h), fm = f9(ac, ym, T.h); for (let i = 0; i < n; i++) A[i][j] = (fp[i] - fm[i]) / (2 * eps[j]); }
  if (!adot) return A;
  ac.adot = 1e-4; const fp = f9(ac, y0, T.h); ac.adot = -1e-4; const fm = f9(ac, y0, T.h); ac.adot = 0;
  const B = fp.map((v, i) => (v - fm[i]) / 2e-4);
  const [u, , w] = y0, V2 = u * u + w * w, c = [-w / V2, 0, u / V2, 0, 0, 0, 0, 0, 0];
  const E = [...Array(n)].map((_, i) => [...Array(n)].map((_, j) => (i === j ? 1 : 0) - B[i] * c[j]));
  const Ae = [...Array(n)].map(() => new Array(n).fill(0));
  for (let j = 0; j < n; j++) { const col = solve(E, A.map(r => r[j])); for (let i = 0; i < n; i++) Ae[i][j] = col[i]; }
  return Ae;
}
export function eig4(A) { // Faddeev-LeVerrier characteristic polynomial + Durand-Kerner roots
  const n = A.length, I = (i, j) => (i === j ? 1 : 0); let Mk = A.map(r => r.map(() => 0)); const c = new Array(n + 1).fill(0); c[n] = 1;
  for (let k = 1; k <= n; k++) {
    const AM = A.map(r => r.map((_, j) => r.reduce((s, a, l) => s + a * Mk[l][j], 0)));
    Mk = AM.map((r, i) => r.map((v, j) => v + c[n - k + 1] * I(i, j)));
    const AMk = A.map((r, i) => r.reduce((s, a, l) => s + a * Mk[l][i], 0)); c[n - k] = -AMk.reduce((s, v) => s + v, 0) / k;
  }
  const P = (zr, zi) => { let pr = 1, pi = 0; for (let k = n - 1; k >= 0; k--) { const t = pr * zr - pi * zi + c[k]; pi = pr * zi + pi * zr; pr = t; } return [pr, pi]; };
  let z = [...Array(n)].map((_, k) => [0.4 * Math.cos(2.4 * k + 0.3) + 0.1, 0.9 * Math.sin(2.4 * k + 0.3)]);
  for (let it = 0; it < 2000; it++) {
    let d = 0;
    z = z.map((zk, k) => { const [pr, pi] = P(...zk); let qr = 1, qi = 0;
      z.forEach((zj, j) => { if (j !== k) { const dr = zk[0] - zj[0], di = zk[1] - zj[1]; const t = qr * dr - qi * di; qi = qr * di + qi * dr; qr = t; } });
      const m = qr * qr + qi * qi, wr = (pr * qr + pi * qi) / m, wi = (pi * qr - pr * qi) / m; d = Math.max(d, Math.hypot(wr, wi)); return [zk[0] - wr, zk[1] - wi]; });
    if (d < 1e-13) break;
  }
  return z.map(([re, im]) => ({ re, im: Math.abs(im) < 1e-9 ? 0 : im }));
}
const sub = (A, idx) => idx.map(i => idx.map(j => A[i][j]));
export function modes(M, cond, opt) {
  const ac = new M.Aircraft(); const T = trim(M, ac, cond);
  const A = linearise(M, ac, T, opt);
  const lon = eig4(sub(A, [0, 2, 4, 7])), lat = eig4(sub(A, [1, 3, 5, 6]));
  const osc = l => ({ wn: Math.hypot(l.re, l.im), zeta: -l.re / Math.hypot(l.re, l.im), T: 2 * Math.PI / Math.abs(l.im), t2: Math.LN2 / Math.abs(l.re), grows: l.re > 0 });
  const cplx = L => L.filter(l => l.im > 0).map(osc).sort((a, b) => b.wn - a.wn), real = L => L.filter(l => l.im === 0).sort((a, b) => a.re - b.re);
  const lc = cplx(lon), lr = real(lon), la = cplx(lat), ar = real(lat);
  const out = { trim: { V_kt: T.V / KT, alpha_deg: T.alpha * RAD, theta_deg: T.theta * RAD, de_deg: T.de * RAD, thr: T.thr } };
  if (lc.length === 2) { out.sp = lc[0]; out.ph = lc[1]; } else { out.sp = { real: lr.slice(0, 2).map(l => l.re) }; out.ph = lc[0] ?? { real: lr.slice(2).map(l => l.re) }; }
  out.dr = la[0] ?? { real: ar.map(l => l.re) };
  if (ar.length >= 2) { out.roll = { lam: ar[0].re, tau: -1 / ar[0].re }; const s = ar[ar.length - 1].re; out.spiral = { lam: s, t2: Math.LN2 / Math.abs(s), grows: s > 0 }; }
  // n/alpha and CAP from the model's own lift slope at trim
  const d0 = {}, d1 = {}, a0 = T.alpha, V = T.V, h = T.h;
  const st = (a, d) => { const Q = e2q(0, a, 0), R = q2R(Q); const s = Float64Array.from([0, 0, -h, ...Rv(R, [V * Math.cos(a), 0, V * Math.sin(a)]), ...Q, 0, 0, 0]); d.wow = [0, 0, 0]; d.load = [0, 0, 0]; ac.deriv(s, new Float64Array(13), d); };
  st(a0 + 1e-4, d1); st(a0 - 1e-4, d0);
  const CLa = (d1.CL - d0.CL) / 2e-4, nAlpha = 0.5 * T.rho * V * V * M.AC.S * CLa / (M.AC.m * G0);
  out.nAlpha = nAlpha; if (out.sp.wn) out.CAP = out.sp.wn ** 2 / nAlpha;
  return out;
}

const dtS = 1 / 240;
/** start a trimmed Aircraft at the origin (v10_timeresp.startTrimmed) */
export function startTrimmed(M, c) {
  const ac = new M.Aircraft(); const T = trim(M, ac, c); const [, , , , , , ph, th] = T.y0;
  const Q = e2q(ph, th, 0); const sg = Math.sin(th - T.alpha), cg = Math.cos(th - T.alpha);
  ac.x.set([0, 0, -T.h, T.V * cg, 0, -T.V * sg, ...Q, 0, 0, 0]);
  Object.assign(ac.cmd, { de: T.de, da: 0, dr: 0, thr: T.thr, flaps: c.flaps, gear: c.gear, brake: 0 });
  ac.de = T.de; ac.thr = T.thr; ac.flaps = c.flaps; ac.gearPos = c.gear; ac.updateAir(0);
  return { ac, T };
}
/** CAS (kt) from TAS (m/s) at sim height h (isentropic, USSA-1976 pressure) */
export function casFromTas(M, V, h, isaDev = 0) {
  const atm = M.atmosphere(M.FIELD.elev + h, isaDev), p0 = 101325, a0 = 340.294;
  const Mach = V / atm.a, qc = atm.p * (Math.pow(1 + 0.2 * Mach * Mach, 3.5) - 1);
  return a0 * Math.sqrt(5 * (Math.pow(qc / p0 + 1, 2 / 7) - 1)) / KT;
}
/**
 * 1-g stall at idle, 1 kt/s, wings level (v10_perf §1). Speeds are the sim's EAS ("ias") and CAS.
 * Project stall comparison (R2-04, common_light.methods.stall_nz_at_vmin): VSR (= V at CLmax / √nz at CLmax, 14 CFR
 * 25.103) is the number compared with a POH/AFM stall speed, as lm_polar.vsrTarget(VS_POH KCAS) = VS_POH/√0.95.
 * Vmin and the fields at Vmin are reported for the record only: in today's sim Vmin usually comes 1.2–2.6 s after the CL
 * break of the Beard–McLain blend (nz_Vmin 0.19–0.79 in 75 of the 76 standard-start runs of 22 Nov 2026; ct4 LDG reaches
 * Vmin at CLmax) and moves 0.6–3.4 kt with the start speed, while VSR moves less than 0.03 kt.
 * nz is the lift load factor at CLmax (kept under its old name); nz_Vmin, CL_Vmin, alpha_Vmin_deg, t_Vmin at Vmin.
 */
export function stallTest(M, { ias0, h = 3000 * FT, flaps, gear, rate = 1.0 }) {
  const { AC } = M;
  const { ac, T } = startTrimmed(M, { ias: ias0, h, flaps, gear, gammaDeg: 0 }); const a = ac.air;
  let thC = a.theta, deI = T.de, vmin = 1e9, clmax = 0, rec = {}, atMin = {}, tSat = 0; const t0 = ac.t, i0 = a.ias / KT;
  ac.cmd.thr = 0;
  while (ac.t - t0 < 70) {
    const tgt = i0 - (ac.t - t0) * rate, err = a.ias / KT - tgt;
    thC += (0.25 * DEG * err + 0.6 * DEG * rate) * dtS;
    const e = thC - a.theta; deI = clamp(deI - 0.6 * e * dtS, -AC.deUp, AC.deDn);
    ac.cmd.de = clamp(deI - 2.0 * e + 0.85 * a.q, -AC.deUp, AC.deDn);
    ac.cmd.da = clamp(1.25 * (0 - a.phi) - 0.28 * a.p, -AC.daMax, AC.daMax); ac.cmd.dr = -1.6 * a.beta;
    ac.step(dtS);
    const nz = a.CL * a.qbar * AC.S / (AC.m * G0);
    if (a.CL > clmax) { clmax = a.CL; rec = { V_CLmax_eas: a.ias / KT, V_CLmax_cas: casFromTas(M, a.V, a.h), nz, alpha_deg: a.alpha * RAD, t: ac.t - t0, rate: (i0 - a.ias / KT) / (ac.t - t0) }; }
    if (a.ias / KT < vmin) { vmin = a.ias / KT; atMin = { nz_Vmin: nz, CL_Vmin: a.CL, alpha_Vmin_deg: a.alpha * RAD, t_Vmin: ac.t - t0 }; }
    tSat = ac.de <= -AC.deUp + 1e-3 ? tSat + dtS : 0;
    if ((tSat > 1 && a.q < -2 * DEG) || a.alpha > 25 * DEG) break;
  }
  return { CLmax: clmax, ...rec, VSR_eas: rec.V_CLmax_eas / Math.sqrt(rec.nz), VSR_cas: rec.V_CLmax_cas / Math.sqrt(rec.nz), Vmin_eas: vmin, ...atMin, de_end_deg: ac.de * RAD, ias0 };
}
/** Start speed (KEAS) of the stall test at detent d: validation.stall_test[d.name], else 1.35 × the sim's trimmed 1-g stall speed. */
export function stallStartIAS(ac, info, d) {
  const s = info.stallStart?.[d.name];
  if (s) return s;
  const cl = simCLmax(ac, d.f).CL;
  return Math.round(1.35 * Math.sqrt(2 * ac.m * G0 / (RHO0 * ac.S * cl)) / KT);
}
/** The stall test of detent d exactly as runCard flies it (gear up only for the clean detent of a retractable type), with KIAS. */
export function stallAt(M, ac, info, d) {
  const gear = info.retract && d.f === 0 ? 0 : 1;
  const r = stallTest(M, { ias0: stallStartIAS(ac, info, d), flaps: d.f, gear });
  const tab = info.ias2cas(d.name);
  return { f: +d.f.toFixed(4), gear, ...r, VSR_kias: tab.has ? tab.inv(r.VSR_cas) : null, Vmin_kias: tab.has ? tab.inv(r.Vmin_eas) : null };
}
const parabolicPeak = (rows, key, xk = 'ias') => {
  let i = rows.reduce((bi, r, j) => (r[key] > rows[bi][key] ? j : bi), 0);
  if (i === 0 || i === rows.length - 1) return { x: rows[i][xk], y: rows[i][key], i, edge: true };
  const [a, b, c] = [rows[i - 1], rows[i], rows[i + 1]], h = b[xk] - a[xk];
  const den = a[key] - 2 * b[key] + c[key]; const dx = den !== 0 ? 0.5 * h * (a[key] - c[key]) / den : 0;
  return { x: b[xk] + dx, y: b[key] - 0.25 * (a[key] - c[key]) * dx / h, i, grid: b[xk], gridY: b[key] };
};
export function climbSweep(M, { h = 30, v0, v1, step = 2, flaps = 0, gear = 0 }) {
  const rows = []; for (let v = v0; v <= v1 + 1e-9; v += step) rows.push(trimThr(M, v, 1, flaps, gear, h));
  const best = parabolicPeak(rows, 'roc_fpm'), steep = parabolicPeak(rows, 'gamma');
  const atVy = rows[best.i];
  return { Vy_kt: best.x, ROCmax_fpm: best.y, Vy_grid_kt: best.grid, ROC_grid_fpm: best.gridY, Vx_kt: steep.x, gammaMax_deg: steep.y, atVy, edge: !!best.edge };
}
export function glideSweep(M, { h = 3000 * FT, v0, v1, step = 1, thr = 0 }) {
  const rows = []; for (let v = v0; v <= v1 + 1e-9; v += step) rows.push(trimThr(M, v, thr, 0, 0, h));
  const best = parabolicPeak(rows, 'LoverD');
  return { Vbg_kt: best.x, LD: best.y, Vbg_grid_kt: best.grid, LD_grid: best.gridY, sink_fpm: -rows[best.i].roc_fpm, edge: !!best.edge };
}
/**
 * Take-off to 50 ft wheel height, SL, calm: brakes on, full throttle 3 s, release, elevator 0 until IAS >= VR.
 * mode 'r1' (default; round-1 v10_perf §4, T-LM-07 590 m, and every card whose VR/θ/thrust was fitted with it): at VR an
 *   attitude command ramps from the ground attitude at 3 deg/s to theta (PI law); lift-off = first step with no wheel in
 *   contact and IAS > 0.5 VR. The PI elevator builds up only as the ramp error grows, so the nose wheel leaves 1.1–3.1 s
 *   after VR and the mains unload during the ramp at θ 1.9–8.3°, CL 0.82–1.15 (far below CLmax): V_LOF = VR + 5–19 kt and does
 *   not depend on theta once theta exceeds that attitude (R2-19).
 * mode 'rate' (R2-19, opt-in: validation.takeoff_test.mode / rate_dps): at VR a pitch-rate command of `rate` deg/s
 *   (PI on q, so the elevator winds up until the nose wheel lifts) until theta, then the same attitude hold as 'r1';
 *   lift-off = both main wheels unloaded. rate 5 deg/s is an estimate (ค่าประมาณ), not a sourced value.
 * Both modes return the state at nose-wheel lift and at lift-off (θ, α, q, δe, CL, ground-effect factor φGE).
 */
export function takeoffTest(M, { f = 0, VR, theta = 10, mode = 'r1', rate = 5, isaDev = 0 }) {
  const { AC } = M, byRate = mode === 'rate';
  if (!byRate && mode !== 'r1') throw new Error(`takeoffTest: unknown mode ${mode}`);
  const ac = new M.Aircraft(); if (isaDev) ac.isaDev = isaDev; ac.setParked(0, 0, 0); for (let i = 0; i < 240 * 5; i++) ac.step(dtS);
  ac.cmd.flaps = ac.flaps = f; ac.cmd.thr = 1; for (let i = 0; i < 240 * 3; i++) ac.step(dtS);
  ac.cmd.brake = 0; const a = ac.air, n0 = ac.x[0], t0 = ac.t; let thC = null, deI = 0, lo = null, d50 = null, rot = null, nose = null, hold = false;
  const snap = () => ({ s: ac.x[0] - n0, t: ac.t - t0, ias: a.ias / KT, theta: a.theta * RAD, alpha: a.alpha * RAD, q: a.q * RAD, de: ac.de * RAD, CL: a.CL, phiGE: a.phiGE });
  const attitude = () => { const e = thC - a.theta; deI = clamp(deI - 0.6 * e * dtS, -AC.deUp, AC.deDn); return clamp(deI - 2.5 * e + 0.85 * a.q, -AC.deUp, AC.deDn); };
  while (ac.t - t0 < 120 && d50 == null) {
    if (a.ias / KT >= VR) {
      if (!rot) rot = snap();
      if (!byRate) { if (thC == null) thC = a.theta; thC = Math.min(theta * DEG, thC + 3 * DEG * dtS); ac.cmd.de = attitude(); }
      else if (!hold) {
        const eq = rate * DEG - a.q; deI = clamp(deI - 20 * eq * dtS, -AC.deUp, AC.deDn); ac.cmd.de = clamp(deI - 4 * eq, -AC.deUp, AC.deDn);
        if (a.theta + 0.3 * a.q >= theta * DEG) { hold = true; thC = theta * DEG; deI = clamp(ac.de - 0.85 * a.q + 2.5 * (thC - a.theta), -AC.deUp, AC.deDn); }
      } else ac.cmd.de = attitude();
    }
    else ac.cmd.de = 0;
    ac.cmd.dr = clamp(1.4 * (a.psi - 0) + 0.6 * a.r, -AC.drMax, AC.drMax); ac.cmd.steer = a.wow[0] ? clamp(-ac.cmd.dr / AC.drMax, -1, 1) * 10 * DEG : 0;
    ac.cmd.da = clamp(1.25 * (0 - a.phi) - 0.28 * a.p, -AC.daMax, AC.daMax);
    ac.step(dtS);
    if (rot && !nose && !a.wow[0]) nose = snap();
    if (!lo && (byRate ? !(a.wow[1] || a.wow[2]) : !a.onGround) && a.ias / KT > 0.5 * VR) lo = snap();
    if (lo && a.hWheel >= 50 * FT) d50 = { s: ac.x[0] - n0, t: ac.t - t0, ias: a.ias / KT };
  }
  return { VR, groundRoll_m: lo?.s ?? null, tLiftoff_s: lo?.t ?? null, V_LOF_kt: lo?.ias ?? null, dist50ft_m: d50?.s ?? null, V50_kt: d50?.ias ?? null,
    mode, ...(byRate ? { rate_dps: rate } : {}), tVRtoNose_s: rot && nose ? nose.t - rot.t : null, V_nose_kt: nose?.ias ?? null, tVRtoLOF_s: rot && lo ? lo.t - rot.t : null,
    theta_LOF_deg: lo?.theta ?? null, alpha_LOF_deg: lo?.alpha ?? null, q_LOF_dps: lo?.q ?? null, de_LOF_deg: lo?.de ?? null, CL_LOF: lo?.CL ?? null, phiGE_LOF: lo?.phiGE ?? null };
}
/** autoland from the standard approach, calm, oatC 15; distance from 50 ft wheel height to stop (v10_perf §5) */
export function landingTest(M, { maxBrake = false, dist = 5500 } = {}) {
  const f = new M.Flight({ wind: M.SCENARIOS.calm, pilot: 'ap', seed: 5, oatC: 15, dist }); let s50 = null;
  if (maxBrake) { const up = f.ap.update.bind(f.ap); f.ap.update = dt2 => { const c = up(dt2); if (f.ac.air.wow[0]) c.brake = 1; return c; }; }
  while (f.ac.t < 400 && !f.ev.done && !f.crashed) { f.tick(f.dt); const a = f.ac.air; if (s50 == null && a.hWheel < 50 * FT) s50 = { s: a.s, ias: a.ias / KT }; }
  if (!f.ev.td || f.ev.stopS == null || !s50) return { failed: true, crashed: f.crashed };
  return { ias50_kt: s50.ias, vtd_kt: f.ev.td.ias, sinkTD_fpm: f.ev.td.vsFpm, td_s: f.ev.td.s, air_m: f.ev.td.s - s50.s, ground_m: f.ev.stopS - f.ev.td.s, total_m: f.ev.stopS - s50.s };
}

/** Run the whole evaluation for an AC already applied to M. */
export function runCard(M, ac, info, opts = {}) {
  const out = { stall: {}, trim: {}, climb: null, glide: {}, modes: {}, takeoff: null, landing: {} };
  // 1) stall per detent (idle, 1 kt/s); clean with gear up when retractable
  for (const d of info.dets) out.stall[d.name] = stallAt(M, ac, info, d);
  if (opts.quick) return out;
  const vs1 = out.stall[info.dets[0].name].VSR_eas;
  // 2) climb at SL (h 30 m), full throttle, clean; 3) glide zero thrust and idle, clean, 3000 ft
  const v0 = Math.max(2 * Math.ceil(0.55 * vs1), 2 * Math.round(1.02 * vs1 / 2)), v1 = 2 * Math.round(Math.min(info.vmax, 2.3 * vs1) / 2);
  out.climb = climbSweep(M, { h: 30, v0, v1, step: 2, flaps: 0, gear: info.retract ? 0 : 1 });
  for (const [k, thr] of [['zeroThrust', 0], ['idle', ac.idle]]) {
    const g0 = Math.round(1.02 * vs1), g1 = Math.round(Math.min(info.vmax, 2.0 * vs1));
    out.glide[k] = glideSweep(M, { h: 3000 * FT, v0: g0, v1: g1, step: 1, thr });
  }
  // trims: Vy climb (full throttle), cruise (level), approach (flaps full, gear down, gamma -3)
  const Vy = info.Vy ?? Math.round(out.climb.Vy_kt);
  const y = trimThr(M, Vy, 1, 0, info.retract ? 0 : 1, 30);
  out.trim.Vy_climb = { ias_kt: Vy, alpha_deg: y.alpha, theta_deg: y.theta, de_deg: y.de, thr: 1, gamma_deg: y.gamma, roc_fpm: y.roc_fpm };
  const cr = { ias: info.cruise.ias, h: info.cruise.h, flaps: 0, gear: info.retract ? 0 : 1, gammaDeg: 0 };
  const ap = { ias: info.approach.ias, h: info.approach.h, flaps: 1, gear: 1, gammaDeg: info.approach.gammaDeg };
  for (const [k, c] of [['cruise', cr], ['approach', ap]]) {
    const set = info.derivSets?.[k] ?? {};   // R2-07: each point with its own config-keyed derivatives
    const m = withDerivs(M, set, () => modes(M, c, { adot: true }));
    out.trim[k] = { ias_kt: c.ias, h_m: c.h, ...m.trim };
    const pick = o => (o && o.wn ? { wn: o.wn, zeta: o.zeta, T: o.T } : o);
    out.modes[k] = { sp: pick(m.sp), ph: pick(m.ph), dr: pick(m.dr), roll_tau: m.roll?.tau, spiral: m.spiral ? { lam: m.spiral.lam, t2: m.spiral.t2, grows: m.spiral.grows } : null, nAlpha: m.nAlpha, CAP: m.CAP,
      derivSet: Object.keys(set).length ? k : null };
  }
  if (opts.noGround) return out;
  // 4) takeoff, 5) landing
  const VR = info.takeoff.VR ?? Math.round(1.05 * out.stall[info.takeoff.name ?? info.dets[0].name].VSR_eas);
  out.takeoff = { flap: info.takeoff.name, ...takeoffTest(M, { f: info.takeoff.f, VR, theta: info.takeoff.theta, mode: info.takeoff.mode, rate: info.takeoff.rate }) };
  for (const [k, mb] of [['asIs', false], ['maxBrake', true]]) out.landing[k] = landingTest(M, { maxBrake: mb });
  return out;
}

// ───────────────────────── CLI ─────────────────────────
function fmtTable(id, ac, res, trace) {
  const f = (v, n = 1) => (v == null || Number.isNaN(v) ? '–' : (+v).toFixed(n));
  const L = [];
  L.push(`# lm_card ${id}: m ${f(ac.m, 0)} kg, S ${ac.S} m2, b ${ac.b} m, P ${f(ac.P / 1000, 0)} kW, T0 ${f(ac.T0, 0)} N, idle ${ac.idle}`);
  if (trace) { L.push('\n## mapping'); for (const r of trace) L.push(`${r.field.padEnd(10)} ${typeof r.value === 'number' ? (+r.value.toPrecision(5)) : JSON.stringify(r.value).slice(0, 60)}  ← ${r.from}  [${r.rule}]${r.flag ? ' (' + r.flag + ')' : ''}`); }
  L.push('\n## stall (idle, 1 kt/s, 3000 ft, wings level)');
  L.push('detent  f      gear  V_SR KEAS  V_SR KCAS  V_SR KIAS  Vmin KEAS  CLmax   alpha   nz     rate kt/s  de_end  nz@Vmin  Vmin−CLmax s');
  for (const [k, s] of Object.entries(res.stall)) L.push(`${k.padEnd(7)} ${f(s.f, 3).padEnd(6)} ${String(s.gear).padEnd(5)} ${f(s.VSR_eas).padEnd(10)} ${f(s.VSR_cas).padEnd(10)} ${f(s.VSR_kias).padEnd(10)} ${f(s.Vmin_eas).padEnd(10)} ${f(s.CLmax, 3).padEnd(7)} ${f(s.alpha_deg).padEnd(7)} ${f(s.nz, 3).padEnd(6)} ${f(s.rate, 2).padEnd(10)} ${f(s.de_end_deg).padEnd(7)} ${f(s.nz_Vmin, 3).padEnd(8)} ${f(s.t_Vmin - s.t, 2)}`);
  if (res.climb) {
    L.push(`\n## climb SL full throttle clean: Vy ${f(res.climb.Vy_kt)} kt (grid ${res.climb.Vy_grid_kt}), ROC ${f(res.climb.ROCmax_fpm, 0)} fpm (grid ${f(res.climb.ROC_grid_fpm, 0)}), Vx ${f(res.climb.Vx_kt)} kt, gamma max ${f(res.climb.gammaMax_deg, 2)} deg`);
    for (const [k, g] of Object.entries(res.glide)) L.push(`glide ${k}: Vbg ${f(g.Vbg_kt)} kt, L/D ${f(g.LD, 2)} (grid ${f(g.LD_grid, 2)}), sink ${f(g.sink_fpm, 0)} fpm`);
    L.push('\n## trim                ias kt  alpha   theta   de      thr/gamma');
    for (const [k, t] of Object.entries(res.trim)) L.push(`${k.padEnd(20)} ${f(t.ias_kt).padEnd(7)} ${f(t.alpha_deg, 2).padEnd(7)} ${f(t.theta_deg, 2).padEnd(7)} ${f(t.de_deg, 2).padEnd(7)} ${t.thr != null ? f(t.thr, 3) : ''} ${t.gamma_deg != null ? 'γ ' + f(t.gamma_deg, 2) + '° ROC ' + f(t.roc_fpm, 0) : ''}`);
    L.push('\n## linear modes        SP wn/zeta     phugoid T/zeta   DR wn/zeta      tauR    spiral t½ (s)  CAP');
    for (const [k, m] of Object.entries(res.modes)) L.push(`${k.padEnd(20)} ${f(m.sp?.wn, 3)}/${f(m.sp?.zeta, 3)}    ${f(m.ph?.T, 1)}/${f(m.ph?.zeta, 3)}       ${f(m.dr?.wn, 3)}/${f(m.dr?.zeta, 3)}     ${f(m.roll_tau, 3)}   ${m.spiral ? (m.spiral.grows ? 'div ' : 'conv ') + f(m.spiral.t2, 1) : '–'}      ${f(m.CAP, 3)}`);
  }
  if (res.takeoff) L.push(`\n## takeoff (flap ${res.takeoff.flap}, VR ${res.takeoff.VR} kt): ground roll ${f(res.takeoff.groundRoll_m, 0)} m, 50 ft ${f(res.takeoff.dist50ft_m, 0)} m, V_LOF ${f(res.takeoff.V_LOF_kt)} kt, V50 ${f(res.takeoff.V50_kt)} kt`);
  for (const [k, l] of Object.entries(res.landing || {})) L.push(`landing ${k}: ${l.failed ? 'FAILED' : `from 50 ft ${f(l.total_m, 0)} m (air ${f(l.air_m, 0)}, ground ${f(l.ground_m, 0)}), Vtd ${f(l.vtd_kt)} kt, sink ${f(l.sinkTD_fpm, 0)} fpm`}`);
  return L.join('\n');
}

const isMain = isMainModule(import.meta.url);
if (isMain) {
  const args = process.argv.slice(2);
  const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
  const flag = k => args.includes(k);
  const id = args.find((a, i) => !a.startsWith('--') && !['--mass', '--config', '--flapmap', '--dir'].includes(args[i - 1]));
  if (!id) { console.error('usage: node lm_card.mjs <typeId> [--mass kg] [--config c] [--flapmap lift|deflection] [--json] [--quick] [--no-ground] [--trace]'); process.exit(2); }
  const card = loadType(id, { dir: opt('--dir', path.join(HERE, '..')) });
  const trace = [];
  const ac = buildAC(card, { mass: opt('--mass'), config: opt('--config'), flapMap: opt('--flapmap', 'lift'), trace });
  const M = await loadSim();
  applyAC(M, ac);
  const info = cardInfo(card, ac, { flapMap: opt('--flapmap', 'lift') });
  const res = runCard(M, ac, info, { quick: flag('--quick'), noGround: flag('--no-ground') });
  if (flag('--json')) console.log(JSON.stringify({ type: id, ac, trace, res }, (k, v) => (typeof v === 'number' ? +v.toPrecision(6) : v), 1));
  else console.log(fmtTable(id, ac, res, flag('--trace') ? trace : null));
}
