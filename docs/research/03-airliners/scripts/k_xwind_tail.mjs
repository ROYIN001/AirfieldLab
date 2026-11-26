// k_xwind_tail.mjs — crosswind crab/sideslip, bank-contact estimate and tail-strike margins (topic 3.10, prefix K).
const D = 180 / Math.PI, KT = 0.514444;
const r = (x, n = 1) => Math.round(x * 10 ** n) / 10 ** n;
const out = [];
// 1) Crab angle for wings-level, zero-sideslip approach: psi_c = asin(Vxw / TAS)
for (const [lab, V] of [['A320 VAPP 133.5', 133.5], ['737 Vref30+5 142', 142.05], ['ATR 106', 106], ['A321neo 144.2', 144.2]])
  out.push(`${lab}: crab 10 kt ${r(Math.asin(10 / V) * D)}°, 20 kt ${r(Math.asin(20 / V) * D)}°, 30 kt ${r(Math.asin(30 / V) * D)}°, 38 kt ${r(Math.asin(38 / V) * D)}°`);
// 2) Steady sideslip (zero crab): yaw balance Cnb*b + Cndr*dr = 0 ; side force CY = (CYb - CYdr*Cnb/Cndr) b ; bank sin(phi) = -CY/CL
function slip({ CYb, CYdr, Cnb, Cndr, CL, V }, xw) {
  const b = Math.asin(xw / V), dr = -Cnb * b / Cndr, CY = CYb * b + CYdr * dr;
  return { beta: b * D, dr: dr * D, phi: Math.asin(Math.min(1, Math.abs(CY) / CL)) * D, CYeff: CY / b };
}
const A320 = { CYb: -0.719, CYdr: 0.235, Cnb: 0.113, Cndr: -0.121, CL: 1.786, V: 133.5 }; // topic 3 approach derivs
const B738 = { CYb: -0.87, CYdr: 0.23, Cnb: 0.167, Cndr: -0.118, CL: 1.444, V: 142.05 };   // topic 2
for (const [lab, p] of [['A320 (topic-3 derivs)', A320], ['737-800 (topic-2 derivs)', B738]]) for (const xw of [10, 20, 30]) {
  const s = slip(p, xw);
  out.push(`${lab} sideslip ${xw} kt: beta ${r(s.beta)}°, rudder ${r(s.dr)}°, bank ${r(s.phi)}°, CY_eff ${r(s.CYeff, 3)}/rad`);
}
// Airbus FOBN (K4): 10 kt -> 3° bank, 30 kt -> ~9° bank at MLW -> implied CY_eff
for (const [xw, phi] of [[10, 3], [30, 9]]) {
  const b = Math.asin(xw / 133.5);
  out.push(`Airbus FOBN ${xw} kt -> ${phi}° bank implies |CY_eff| = ${r(A320.CL * Math.sin(phi / D) / b, 2)}/rad (CL ${A320.CL})`);
}
// 3) Static bank-to-contact estimate about the downwind main-wheel contact: phi = asin(h / (y - track/2))
// 737-800: nacelle min clearance 0.48-0.64 m [D1], engine y 4.902 m (topic 6), track 5.715 m [D28]; winglet tip clearance 3.66-3.91 m, semi-span 17.9 m
const tr = 5.715 / 2;
for (const h of [0.48, 0.64]) out.push(`737-800 nacelle h ${h} m: static bank to contact ${r(Math.asin(h / (4.902 - tr)) * D)}°`);
for (const h of [3.66, 3.91]) out.push(`737-800 wingtip h ${h} m: static bank to contact ${r(Math.asin(h / (35.79 / 2 - tr)) * D)}°`);
// 4) Tail-strike margins at touchdown (pitch limit with gear compressed minus typical TD pitch)
const T = [
  ['737-800', 2.4, 2.5, 9.0, 11.0], // approach F30 Vref+5 [K31], flare +2..3 [K15][K16], limits JTSB 9 compressed [K15], TSIB 11 extended [K18] (JTSB 11.5)
  ['A320', 2.5, 4.0, 11.7, 13.5],   // approach est, flare increment ~4° (FCOM via AAIB G-DHJH [K57]), limits SF#05 [K8]
  ['A321', 2.4, 4.2, 9.7, 11.2],    // FCOM 806/1 + BEA F-GTAT: Vapp 2.4, TD 6.6, limits 9.7/11.2 [K20][K27] (AAIB 2001: 11.4 [K19])
  ['ATR 72-600', -0.75, 4.5, 5.9, 8.0], // approach -2.5..+1 [K22], TD 3-6 (topic 1), limits BEA [K22]
];
for (const [n, app, dflare, comp, ext] of T) {
  const td = app + dflare;
  out.push(`${n}: approach ${app}° + flare ${dflare}° = TD ${r(td)}°; margin to compressed limit ${r(comp - td)}°, to extended ${r(ext - td)}°`);
}
// 5) Pitch sensitivity to speed at constant flight path: d(alpha)/dV = -2 CL/(V CLa) (rad per m/s)
for (const [n, CL, Vkt, CLa] of [['737-800 F30', 1.444, 142.05, 5.257], ['A320 FULL', 1.786, 133.5, 5.302], ['A321 FULL', 1.80, 143.3, 5.317]]) {
  const dadV = 2 * CL / (Vkt * CLa) * D; // deg per kt (V in kt cancels)
  out.push(`${n}: dθ/dV ≈ ${r(dadV, 3)}°/kt -> 5 kt slow = +${r(5 * dadV, 2)}°, 10 kt slow = +${r(10 * dadV, 2)}°`);
}
// Rules of thumb: Boeing 10 kt slower = ~3° higher (K10); FCTM approach attitude -1° per 5 kt above Vref+5 (K31); A321 -5 kt = -1.3° clearance (K27)
out.push(`rules: Boeing 0.30°/kt (K10), FCTM 0.20°/kt (K31), A321 FCOM 0.26°/kt (K27)`);
console.log(out.join('\n'));
