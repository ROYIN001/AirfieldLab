#!/usr/bin/env node
// lt_polar.mjs — DA42 NG drag polar from published cruise points + Oswald e from Raymer (lm_derivs eq. 19), then checks
// against the published climb rates (both engines and OEI) with BEM thrust (lt_geom.json).  06-da42.md §06.6.2.
//   node scripts/lt_polar.mjs  -> scripts/out/lt_polar.json
// Inputs: AOPA 2010 flight test and spec [LT10], DA42-VI brochure [LT6]; propeller efficiency from lm_prop BEM (ค่าประมาณ).
import fs from 'node:fs';
import { pointFromCruise, polarFromGlide, toSimPolar, simPolarEmax, rhoISA } from './lm_polar.mjs';
const KT = 0.514444, G0 = 9.80665, FT = 0.3048, S = 16.29, AR = 13.42 ** 2 / 16.29;
const geom = JSON.parse(fs.readFileSync(new URL('./out/lt_geom.json', import.meta.url), 'utf8'));
const r = (x, n = 4) => +(+x).toPrecision(n);
const e = 1.78 * (1 - 0.045 * AR ** 0.68) - 0.64, K = 1 / (Math.PI * AR * e);   // Raymer eq. 12.48 (ค่าประมาณ)
const etaAt = (curve, ktas) => { const c = curve; let i = 1; while (i < c.length - 1 && c[i].KTAS < ktas) i++; const a = c[i - 1], b = c[i]; return a.eta + (ktas - a.KTAS) / (b.KTAS - a.KTAS) * (b.eta - a.eta); };
const TAt = (curve, ktas) => { const c = curve; let i = 1; while (i < c.length - 1 && c[i].KTAS < ktas) i++; const a = c[i - 1], b = c[i]; return a.T_N + (ktas - a.KTAS) / (b.KTAS - a.KTAS) * (b.T_N - a.T_N); };
const curve = geom.prop.ng_e4_187;
// cruise points (mass is an assumption where the source does not state it: ค่าประมาณ)
const pts = [
  { id: 'AOPA 2010 flight test 92% 8000 ft +2 °C 176 KTAS', mass: 1750, ktas: 176, h_ft: 8000, oat: 2, P_W: 2 * 0.92 * 123.5e3, src: 'LT10' },
  { id: 'AOPA 2010 spec 75% 12,500 ft 171 KTAS (MTOM 1900 assumed)', mass: 1900, ktas: 171, h_ft: 12500, oat: null, P_W: 2 * 0.75 * 123.5e3, src: 'LT10' },
  { id: 'AOPA 2010 spec 80% 8,000 ft 162 KTAS (MTOM 1900 assumed)', mass: 1900, ktas: 162, h_ft: 8000, oat: null, P_W: 2 * 0.80 * 123.5e3, src: 'LT10' },
];
const res = pts.map(p => {
  const h = p.h_ft * FT, Tisa = 288.15 - 0.0065 * h - 273.15, dT = p.oat == null ? 0 : p.oat - Tisa;
  const eta = etaAt(curve, p.ktas) * 0.98;          // 2 % installation/spinner-nacelle loss (ค่าประมาณ)
  const c = pointFromCruise({ mass: p.mass, S, ktas: p.ktas, h_m: h, isaDev: dT, P_W: p.P_W, eta });
  return { ...p, isaDev: r(dT, 3), eta: r(eta, 3), CL: r(c.CL), CD: r(c.CD), CD0: r(c.CD - K * c.CL * c.CL) };
});
const CD0 = res.reduce((s, x) => s + x.CD0, 0) / res.length;
// both-engine climb check: SL ISA MTOM 1900, Vy 90 KIAS and VYSE 85 KIAS converted with the card's KIAS→KCAS pairs (lt_geom ias_cas,
// flaps UP: 89.9 / 84.6 KCAS), full power (BEM thrust). Reviewer fix 2026-11-18: the first version used 91.4 / 86.5 KCAS here.
const casUP = x => { const p = geom.ias_cas.ng.UP.slice().sort((a, b) => a[0] - b[0]); let i = 0; while (i < p.length - 2 && x > p[i + 1][0]) i++; return p[i][1] + (x - p[i][0]) * (p[i + 1][1] - p[i][1]) / (p[i + 1][0] - p[i][0]); };
const climb = (mass, kcas, nEng, extraCD = 0) => {
  const V = kcas * KT, q = 0.5 * 1.225 * V * V, CL = mass * G0 / (q * S), CD = CD0 + K * CL * CL + extraCD, D = q * S * CD;
  const T = nEng * TAt(curve, kcas), roc = (T - D) * V / (mass * G0);
  return { kcas, CL: r(CL), CD: r(CD), D_N: Math.round(D), T_N: Math.round(T), roc_fpm: Math.round(roc / FT * 60) };
};
const dCDfeather = geom.prop.drag.dCD_feathered_onS, dCDtrim = 0.002;   // rudder/aileron trim drag at zero sideslip (ค่าประมาณ)
const both = climb(1900, +casUP(90).toFixed(1), 2), oei = climb(1900, +casUP(85).toFixed(1), 1, dCDfeather + dCDtrim);
const sweep = []; for (let v = 70; v <= 110; v += 2) sweep.push(climb(1900, v, 2));
const sweepOei = []; for (let v = 70; v <= 100; v += 2) sweepOei.push({ ...climb(1900, v, 1, dCDfeather + dCDtrim) });
// required thrust shortfall to match the published climb (AOPA spec 1180 / 210 fpm)
const need = (c, roc) => Math.round(c.T_N - (c.D_N + 1900 * G0 * roc * FT / 60 / (c.kcas * KT)));
// best glide with both propellers feathered (est): parabolic polar + 2 × feathered ΔCD
const CD0g = CD0 + 2 * dCDfeather, Emax = 1 / (2 * Math.sqrt(CD0g * K)), CLs = Math.sqrt(CD0g / K), Vbg = Math.sqrt(2 * 1900 * G0 / (1.225 * S * CLs)) / KT;
const out = {
  oswald: { AR: r(AR), e: r(e, 3), K: r(K) }, cruise: res, CD0_mean: r(CD0), CD0_spread: [r(Math.min(...res.map(x => x.CD0))), r(Math.max(...res.map(x => x.CD0)))],
  climb_both_SL_1900: both, climb_oei_SL_1900: oei, thrust_excess_vs_POH_N: { both: need(both, 1180), oei: need(oei, 210) },
  best_climb_model: sweep.reduce((a, b) => (b.roc_fpm > a.roc_fpm ? b : a)), best_oei_model: sweepOei.reduce((a, b) => (b.roc_fpm > a.roc_fpm ? b : a)),
  glide_feathered_1900: { CD0: r(CD0g), Emax: r(Emax, 3), CLstar: r(CLs, 3), Vbg_kcas: r(Vbg, 3) },
  sim_form: toSimPolar({ CD0, K }), sim_form_check: simPolarEmax(toSimPolar({ CD0, K })),
};
fs.writeFileSync(new URL('./out/lt_polar.json', import.meta.url), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
