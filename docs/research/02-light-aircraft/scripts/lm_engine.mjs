#!/usr/bin/env node
// lm_engine.mjs — piston / turbo-diesel engine model for the piston.* leaves (01-methods.md §01.6). Library + CLI.
//   altitude lapse:  gagg_ferrar  P/P0 = σ − (1 − σ)/7.55                                  (Gagg & Farrar 1934)
//                    ind_friction P = Pr·[(1+f)·(MAP/MAPr)·(N/Nr)·√(T0/T) − f·(N/Nr)²]      (NACA R-190 + constant friction)
//                    turbo_flat   P = Pr up to crit_alt, then gagg_ferrar on σ/σ_crit
//   fuel:            FF = BSFC·P ; fitBsfc(rows) from a POH cruise table (%BHP, fuel flow)
//   dynamics:        first-order MAP/power lag τ, shaft  I_e·dω/dt = Q_eng − Q_prop
//   FADEC (AE300):   single lever → load % → power demand and prop-rpm schedule
//   node scripts/lm_engine.mjs            -> lapse table 0–14,000 ft ISA for the three models + example engines
import { isMainModule } from './lm_lib.mjs';
export const HP = 745.69987, FT = 0.3048, INHG = 3386.389, LBH = 0.45359237 / 3600, G_PER_KWH = 1 / 3.6e6 * 1000;
export function isa(h_m, dT = 0) { const T = 288.15 - 0.0065 * h_m, p = 101325 * Math.pow(T / 288.15, 5.25588); return { T: T + dT, p, rho: p / (287.05287 * (T + dT)), sigma: p / (287.05287 * (T + dT)) / 1.225, delta: p / 101325, theta: (T + dT) / 288.15 }; }

export function lapseGaggFerrar(sigma) { return sigma - (1 - sigma) / 7.55; }
/** full-throttle power fraction, naturally aspirated, MAP = p_amb·(MAPr/p0); f = friction / rated brake power */
export function powerIndFriction({ delta, theta, rpmFrac = 1, mapFrac = null, f = 0.10 }) {
  const m = mapFrac ?? delta;                       // full throttle: MAP scales with ambient pressure
  return (1 + f) * m * rpmFrac / Math.sqrt(theta) - f * rpmFrac * rpmFrac;
}
export function lapseTurboFlat(sigma, sigmaCrit) { return sigma >= sigmaCrit ? 1 : lapseGaggFerrar(sigma / sigmaCrit); }
export function lapse(model, h_m, dT = 0, opt = {}) {
  const a = isa(h_m, dT);
  if (model === 'gagg_ferrar') return lapseGaggFerrar(a.sigma);
  if (model === 'ind_friction') return powerIndFriction({ delta: a.delta, theta: a.theta, f: opt.f ?? 0.10 });
  if (model === 'turbo_flat') return lapseTurboFlat(a.sigma, isa(opt.crit_alt_m ?? 0).sigma);
  throw new Error('unknown model ' + model);
}
/** BSFC (g/kWh) from POH cruise rows [{pct, ff, unit:'gph'|'lph'|'kgh', fuel:'avgas'|'jet'}] for rated power P_rated_W */
export const FUEL_DENSITY = { avgas: 0.72, jet: 0.80 };   // kg/l at 15 °C (typical: ASTM D910 / D1655 ranges, est)
export function fitBsfc(rows, P_rated_W) {
  const pts = rows.map(r => { const l = r.unit === 'gph' ? r.ff * 3.78541 : r.unit === 'lph' ? r.ff : null; const kgh = r.unit === 'kgh' ? r.ff : l * FUEL_DENSITY[r.fuel ?? 'avgas']; return { pct: r.pct, bsfc: kgh * 1000 / (r.pct / 100 * P_rated_W / 1000) }; });
  const mean = pts.reduce((s, p) => s + p.bsfc, 0) / pts.length;
  return { pts, mean_g_per_kWh: mean, mean_lb_per_hp_h: mean / 1000 / 0.45359237 * HP / 1000 };
}
/** shaft dynamics step: returns new omega (rad/s) */
export function shaftStep({ omega, Qeng, Qprop, I, dt }) { return omega + (Qeng - Qprop) / I * dt; }
/** first-order power lag */
export function lagStep(x, target, tau, dt) { return x + (target - x) * (1 - Math.exp(-dt / tau)); }
/** AE300-style FADEC: lever 0..1 → load % (linear, est) and prop rpm schedule [[load%, rpm]] */
export function fadec(lever, { schedule = [[0, 1800], [100, 2300]], P_rated_W = 123.5e3, availFrac = 1 } = {}) {
  const load = Math.min(100 * lever, 100 * availFrac);
  let i = 0; while (i < schedule.length - 2 && load > schedule[i + 1][0]) i++;
  const [l0, r0] = schedule[i], [l1, r1] = schedule[i + 1];
  return { load, P_W: load / 100 * P_rated_W, rpm: r0 + (load - l0) / (l1 - l0) * (r1 - r0) };
}

export function tests() {
  const a8 = isa(8000 * FT);
  const ae = fitBsfc([{ pct: 100, ff: 35, unit: 'lph', fuel: 'jet' }, { pct: 60, ff: 19, unit: 'lph', fuel: 'jet' }], 123.5e3);
  return [
    { id: 'T-LM-14', what: 'Gagg-Ferrar P/P0 at 8000 ft ISA', got: lapseGaggFerrar(a8.sigma), exp: 0.7577, tol: 0.001 },
    { id: 'T-LM-14', what: 'ind_friction (f 0.10) P/P0 at 8000 ft ISA', got: powerIndFriction({ delta: a8.delta, theta: a8.theta }), exp: 0.7406, tol: 0.001 },
    { id: 'T-LM-14', what: 'ind_friction = 1 at SL ISA rated', got: powerIndFriction({ delta: 1, theta: 1 }), exp: 1, tol: 1e-9 },
    { id: 'T-LM-15', what: 'AE300 BSFC @100% from factsheet g/kWh', got: ae.pts[0].bsfc, exp: 226.7, tol: 1 },
    { id: 'T-LM-15', what: 'AE300 BSFC @60% from factsheet g/kWh', got: ae.pts[1].bsfc, exp: 205.1, tol: 1 },
    { id: 'T-LM-16', what: 'hot day VTBD 35 °C SL: Gagg-Ferrar P/P0', got: lapseGaggFerrar(isa(3, 35 - 15).sigma), exp: 0.9262, tol: 0.002 },   // exp recomputed in review 2026-11-18 (σ 0.93484 at 3 m, ISA+20)
  ];
}

if (isMainModule(import.meta.url)) {
  const f = (x, n = 3) => (+x).toFixed(n);
  console.log('h ft    sigma   gagg_ferrar  ind_friction(f=.10)  ind_friction(f=.15)  turbo_flat(crit 8000 ft, est)');
  for (let h = 0; h <= 14000; h += 2000) { const a = isa(h * FT); console.log(`${String(h).padEnd(7)} ${f(a.sigma, 4)}  ${f(lapse('gagg_ferrar', h * FT))}        ${f(lapse('ind_friction', h * FT))}                ${f(lapse('ind_friction', h * FT, 0, { f: 0.15 }))}                ${f(lapse('turbo_flat', h * FT, 0, { crit_alt_m: 8000 * FT }))}`); }
  console.log('\nVTBD hot day (9 ft, OAT 35 °C):', f(lapse('gagg_ferrar', 3, 20), 4), 'gagg_ferrar;', f(lapse('ind_friction', 3, 20), 4), 'ind_friction');
  console.log('AE300 BSFC from factsheet fuel flow:', JSON.stringify(fitBsfc([{ pct: 100, ff: 35, unit: 'lph', fuel: 'jet' }, { pct: 60, ff: 19, unit: 'lph', fuel: 'jet' }], 123.5e3)));
  console.log('FADEC lever 0.6 (schedule est):', JSON.stringify(fadec(0.6)));
}
