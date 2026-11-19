#!/usr/bin/env node
// lm_polar.mjs — CLmax from POH stall speeds and a drag polar (CD0, K, Oswald e) from POH glide / cruise / climb data,
// with uncertainty. Library + CLI. Node >= 18, no dependencies. Methods and sources: 01-methods.md §01.5.
//
//   clmaxFromStall({mass, S, vs_kcas, kind, nzAtVmin, h_m, cg})   1-g CLmax (trimmed, at the CG the POH speed is for)
//   cgShiftCLmax({CLmax, x_from, x_to, lt})                         trimmed CLmax at another CG (tail-load balance)
//   polarFromGlide({mass, S, v_kcas, E})                            CD0, K from best-glide speed and ratio
//   fitPolar(points)                                                weighted least squares CD = CD0 + K CL² with covariance
//   pointFromCruise({mass, S, ktas, h_m, isaDev, P_W, eta})         (CL, CD) from a cruise power point
//   pointFromClimb({mass, S, kcas, h_m, P_W, eta, roc_fpm})         (CL, CD) from a full-power climb point
//   toSimPolar({CD0, K})                                            sim form CD0s + Ks (CL − 0.15)² with same (L/D)max and CL*
//   montecarlo(fn, spec, n)                                         spread of any result over input uncertainties
//   node scripts/lm_polar.mjs <typeId> [--json]    |   node scripts/lm_polar.mjs --selftest
import path from 'node:path';
import { HERE, loadType, val, leaf, isObj, isMainModule } from './lm_lib.mjs';

export const G0 = 9.80665, RHO0 = 1.225, KT = 0.514444, FT = 0.3048, HP = 745.69987, LB = 0.45359237;
export const CL_SIM_OFFSET = 0.15;   // src/20-flight.js:185  K·(CL − 0.15)²
// ISA troposphere density (kg/m3) at geopotential height h (m), ISA deviation dT (K) at constant pressure
export function rhoISA(h = 0, dT = 0) { const T0 = 288.15 - 0.0065 * h; const p = 101325 * Math.pow(T0 / 288.15, 5.25588); return p / (287.05287 * (T0 + dT)); }

/**
 * 1-g CLmax from a published stall speed.
 * vs_kcas: calibrated airspeed (convert KIAS with the POH airspeed-calibration table first). Below ~10,000 ft and
 * 100 kt CAS = EAS within 0.1 kt, so q = ½ρ0 V_CAS².
 * kind '1g'  : the speed is already a 1-g stall speed (V_SR, 14 CFR 23.2110 after amendment 23-64 allows either).
 * kind 'min' : the speed is the minimum speed of a 1 kt/s entry (old 14 CFR 23.49 / 23.201; AC 23-8C). At that point
 *              the load factor is below 1, so CLmax_1g = 2 m g nz / (ρ0 S Vmin²); nzAtVmin default 0.95, range 0.90–1.00.
 * cg: optional {x_from, x_to, lt} (m, x positive aft) to move the result from the POH (forward) CG to another CG.
 */
export function clmaxFromStall({ mass, S, vs_kcas, kind = '1g', nzAtVmin = 0.95, cg = null }) {
  const V = vs_kcas * KT, W = mass * G0, q = 0.5 * RHO0 * V * V;
  const CLapp = W / (q * S);                       // apparent CL assuming nz = 1 at that speed
  const nz = kind === 'min' ? nzAtVmin : 1;
  let CLmax_1g = CLapp * nz;
  const V1g_kcas = kind === 'min' ? vs_kcas / Math.sqrt(nz) : vs_kcas;
  let shifted = null;
  if (cg) { shifted = cgShiftCLmax({ CLmax: CLmax_1g, ...cg }); CLmax_1g = shifted; }
  return { CLmax_1g, CLapparent: CLapp, nz, V1g_kcas, kind, cgShifted: !!cg };
}
/** trimmed CLmax at x_to from the value at x_from: CLtrim = CLwb (1 + (x_cg − x_ac)/l_t) + Cmac c/l_t ⇒ ΔCL ≈ CLmax (x_to − x_from)/l_t */
export function cgShiftCLmax({ CLmax, x_from, x_to, lt }) { return CLmax * (1 + (x_to - x_from) / lt); }
/** stall speed (KCAS) for a CLmax at another mass / bank: V = √(2 m g n / (ρ0 S CLmax)) */
export function stallSpeed({ mass, S, CLmax, n = 1 }) { return Math.sqrt(2 * mass * G0 * n / (RHO0 * S * CLmax)) / KT; }

/** best glide: CL_bg = 2W/(ρ0 S V²); parabolic polar ⇒ CD0 = CL_bg/(2E), K = 1/(2 E CL_bg); e = 1/(π AR K) */
export function polarFromGlide({ mass, S, v_kcas, E, AR = null }) {
  const CL = 2 * mass * G0 / (RHO0 * S * (v_kcas * KT) ** 2);
  const CD0 = CL / (2 * E), K = 1 / (2 * E * CL);
  return { CL, CD0, K, e: AR ? 1 / (Math.PI * AR * K) : null };
}
/** level cruise point: D = η P / V_TAS, CL = W/(qS), CD = D/(qS) */
export function pointFromCruise({ mass, S, ktas, h_m = 0, isaDev = 0, P_W, eta }) {
  const rho = rhoISA(h_m, isaDev), V = ktas * KT, q = 0.5 * rho * V * V;
  return { CL: mass * G0 / (q * S), CD: eta * P_W / V / (q * S), V, rho };
}
/** steady climb point (small γ): D = η P / V − W·ROC/V ; uses TAS from CAS at h */
export function pointFromClimb({ mass, S, kcas, h_m = 0, isaDev = 0, P_W, eta, roc_fpm }) {
  const rho = rhoISA(h_m, isaDev), V = kcas * KT * Math.sqrt(RHO0 / rho), q = 0.5 * rho * V * V, W = mass * G0;
  const sg = roc_fpm * FT / 60 / V, cg = Math.sqrt(1 - sg * sg);
  return { CL: W * cg / (q * S), CD: (eta * P_W / V - W * sg) / (q * S), V, rho };
}
/** weighted LS CD = CD0 + K CL². points [{CL, CD, sd}] (sd default 1). returns {CD0, K, cov, rms} */
export function fitPolar(points) {
  let a11 = 0, a12 = 0, a22 = 0, b1 = 0, b2 = 0;
  for (const p of points) { const w = 1 / (p.sd ?? 1) ** 2, x = p.CL * p.CL; a11 += w; a12 += w * x; a22 += w * x * x; b1 += w * p.CD; b2 += w * x * p.CD; }
  const det = a11 * a22 - a12 * a12;
  const CD0 = (a22 * b1 - a12 * b2) / det, K = (a11 * b2 - a12 * b1) / det;
  const res = points.map(p => p.CD - CD0 - K * p.CL * p.CL), rms = Math.sqrt(res.reduce((s, r) => s + r * r, 0) / points.length);
  const s2 = points.length > 2 ? res.reduce((s, r, i) => s + r * r / (points[i].sd ?? 1) ** 2, 0) / (points.length - 2) : NaN;
  return { CD0, K, cov: [[s2 * a22 / det, -s2 * a12 / det], [-s2 * a12 / det, s2 * a11 / det]], rms, n: points.length };
}
/** physical polar → sim form with the same (L/D)max and CL at (L/D)max (sim drag K·(CL − 0.15)², src/20-flight.js:185) */
export function toSimPolar({ CD0, K }, c = CL_SIM_OFFSET) {
  const CLs = Math.sqrt(CD0 / K), E = 1 / (2 * Math.sqrt(CD0 * K));
  if (CLs <= c) throw new Error(`CL* ${CLs.toFixed(3)} ≤ ${c}: cannot map`);
  const Ks = 1 / (2 * E * (CLs - c)), CD0s = Ks * (CLs * CLs - c * c);
  return { CD0: CD0s, K: Ks, Emax: E, CLstar: CLs };
}
/** sim-form polar → (L/D)max and CL_star */
export function simPolarEmax({ CD0, K }, c = CL_SIM_OFFSET) { const CLs = Math.sqrt(CD0 / K + c * c); return { CLstar: CLs, Emax: 1 / (2 * K * (CLs - c)) }; }

// seeded normal random numbers (reproducible Monte Carlo)
export function rng(seed = 12345) { let s = seed >>> 0; const u = () => ((s = (1664525 * s + 1013904223) >>> 0) + 0.5) / 4294967296; return () => Math.sqrt(-2 * Math.log(u())) * Math.cos(2 * Math.PI * u()); }
/** spec: {name: [mean, sd]} ; fn(sample) -> {k: number} ; returns {k: {mean, sd, p05, p95}} */
export function montecarlo(fn, spec, n = 2000, seed = 7) {
  const r = rng(seed), acc = {};
  for (let i = 0; i < n; i++) {
    const s = {}; for (const [k, v] of Object.entries(spec)) s[k] = Array.isArray(v) ? v[0] + v[1] * r() : v;
    const o = fn(s); for (const [k, v] of Object.entries(o)) if (Number.isFinite(v)) (acc[k] ??= []).push(v);
  }
  const out = {};
  for (const [k, a] of Object.entries(acc)) { a.sort((x, y) => x - y); const m = a.reduce((s, x) => s + x, 0) / a.length; out[k] = { mean: m, sd: Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1)), p05: a[Math.floor(0.05 * a.length)], p95: a[Math.floor(0.95 * a.length)] }; }
  return out;
}

// ───────── card driver ─────────
function kcasOf(card, p, det) {
  const l = leaf(card, p); if (!l || typeof l.v !== 'number') return null;
  if (!/IAS/i.test(l.u || '')) return l.v;
  const t = val(card, 'speeds.ias_cas');
  if (isObj(t) && t.axes && Array.isArray(t.data)) {
    const fl = (t.axes.flap || t.axes.flaps || []).map(String), ki = t.axes.KIAS || t.axes.kias; let j = fl.indexOf(String(det)); if (j < 0) j = 0;
    const row = Array.isArray(t.data[0]) ? t.data[j] : t.data; let i = 0; while (i < ki.length - 2 && l.v > ki[i + 1]) i++;
    return row[i] + (l.v - ki[i]) / (ki[i + 1] - ki[i]) * (row[i + 1] - row[i]);
  }
  return l.v;   // no table: IAS used as CAS (flagged by caller)
}
export function polarCard(card) {
  const m = val(card, 'airframe.weights.MTOW'), S = val(card, 'aero.ref.S') ?? val(card, 'airframe.wing.S'), b = val(card, 'aero.ref.b') ?? val(card, 'airframe.wing.b');
  const out = { mass: m, S, AR: b && S ? b * b / S : null, stall: {}, polar: null };
  const dets = val(card, 'aero.flaps.detents'); const full = Array.isArray(dets) && dets.length ? dets[dets.length - 1].name : 'full';
  for (const [k, p, det] of [['clean', 'speeds.VS1_kt', '0'], ['full', 'speeds.VS0_kt', full]]) {
    const v = kcasOf(card, p, det); if (v && m && S) out.stall[k] = { vs_kcas: v, ...clmaxFromStall({ mass: m, S, vs_kcas: v, kind: 'min' }), range_nz_0p90_1p00: [clmaxFromStall({ mass: m, S, vs_kcas: v, kind: 'min', nzAtVmin: 0.90 }).CLmax_1g, clmaxFromStall({ mass: m, S, vs_kcas: v, kind: 'min', nzAtVmin: 1.0 }).CLmax_1g] };
  }
  const gl = val(card, 'performance.glide'), gs = leaf(card, 'performance.glide');
  if (isObj(gl) && gl.speed_kt && gl.ratio && m && S) {
    out.polar = polarFromGlide({ mass: m, S, v_kcas: gl.speed_kt, E: gl.ratio, AR: out.AR });
    out.polar.mc = montecarlo(s => { const p = polarFromGlide({ mass: m, S, v_kcas: s.v, E: s.E, AR: out.AR }); return { CD0: p.CD0, K: p.K, e: p.e }; }, { v: [gl.speed_kt, 1.5], E: [gl.ratio, 0.05 * gl.ratio] });
    out.polar.sim = toSimPolar(out.polar); out.polar.note = `glide from performance.glide (${gs.u}); speed treated as CAS`;
  }
  return out;
}

// ───────── self-test on the current sim (truth known) ─────────
export async function selftest() {
  const { loadSim } = await import('./lm_card.mjs');
  const M = await loadSim(); const { AC } = M; const out = {};
  // truth: sim polar CD0 0.024, K 0.062 about CL 0.15 → Emax 16.46 at CL* 0.640
  const truth = simPolarEmax(AC);
  // "POH" best glide measured on the sim by lm_card.glideSweep (zero thrust): Vbg, L/D
  const { glideSweep } = await import('./lm_card.mjs');
  const g = glideSweep(M, { h: 3000 * FT, v0: 82, v1: 150, step: 1, thr: 0 });
  const pg = polarFromGlide({ mass: AC.m, S: AC.S, v_kcas: g.Vbg_kt * Math.sqrt(1), E: g.LD, AR: AC.b * AC.b / AC.S });
  out.glide = { Vbg_kt: g.Vbg_kt, LD: g.LD, truthEmax: truth.Emax, truthCLstar: truth.CLstar, fitCLstar: pg.CL, back: toSimPolar(pg) };
  return out;
}

const isMain = isMainModule(import.meta.url);
if (isMain) {
  const args = process.argv.slice(2);
  // no top-level await here: selftest() imports lm_card.mjs, which imports this module; awaiting at top level would
  // deadlock the circular import (review 2026-11-18), so run it after this module has finished evaluating
  if (args.includes('--selftest')) selftest().then(r => console.log(JSON.stringify(r, null, 1)));
  else {
    const id = args.find(a => !a.startsWith('--'));
    if (!id) { console.error('usage: node lm_polar.mjs <typeId> [--json] | --selftest'); process.exit(2); }
    const r = polarCard(loadType(id));
    console.log(JSON.stringify(r, (k, v) => (typeof v === 'number' ? +v.toPrecision(5) : v), 1));
  }
}

/** T-LM tests (need the harness M) */
export async function tests(M) {
  const out = [];
  out.push({ id: 'T-LM-08', what: 'CLmax from 71.9 kt, 2250 kg, 16.3 m2 (1 g)', got: clmaxFromStall({ mass: 2250, S: 16.3, vs_kcas: 71.9 }).CLmax_1g, exp: 1.615, tol: 0.01 });   // exp = 2·2250·g/(ρ0·16.3·(71.9 kt)²) (review 2026-11-18; was 1.617)
  out.push({ id: 'T-LM-08', what: 'min-speed 68.4 kt with nz 0.95 → V1g kt', got: clmaxFromStall({ mass: 2250, S: 16.3, vs_kcas: 68.4, kind: 'min', nzAtVmin: 0.949 }).V1g_kcas, exp: 70.2, tol: 0.3 });
  // T-LM-09: physical polar CD0 0.030, K 0.050 → sim form → sim glide must give E = 1/(2√(CD0 K)) = 12.91 at CL* 0.775
  const { applyAC, glideSweep, AC_R1 } = await import('./lm_card.mjs');
  const sp = toSimPolar({ CD0: 0.030, K: 0.050 });
  const restore = applyAC(M, { ...AC_R1, CD0: sp.CD0, K: sp.K });
  const g = glideSweep(M, { h: 3000 * FT, v0: 82, v1: 140, step: 1, thr: 0 });
  restore();
  out.push({ id: 'T-LM-09', what: 'sim glide L/D after toSimPolar (target 12.91)', got: g.LD, exp: 12.91, tol: 0.05 });
  const CLbg = 2 * 2250 * G0 / (RHO0 * 16.3 * (g.Vbg_kt * KT) ** 2);
  out.push({ id: 'T-LM-09', what: 'sim CL at best glide (target 0.775)', got: CLbg, exp: 0.775, tol: 0.01 });
  const pg = polarFromGlide({ mass: 2250, S: 16.3, v_kcas: g.Vbg_kt, E: g.LD });
  out.push({ id: 'T-LM-09', what: 'polarFromGlide recovers CD0 0.030', got: pg.CD0, exp: 0.030, tol: 0.0005 });
  return out;
}
