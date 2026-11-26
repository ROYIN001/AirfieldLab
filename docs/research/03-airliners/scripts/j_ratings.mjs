// j_ratings.mjs — ratings, rotor speeds, flat-rating slope, VTBD hot-day thrust, TSFC and fuel-flow fits.
// Run: node j_ratings.mjs   (imports j_lib.mjs in the same folder)
import { LBF, KT, FT, isa, lapseBY, flatTheta, ratedThrust, ENG, ffInterp, fmt } from './j_lib.mjs';
const out = (...a) => console.log(...a);

out('== 1. Rating unit checks (TCDS daN or lbf -> N, lbf)');
const R = [ // [name, value, unit] as printed in the TCDS
  ['CFM56-7B24 TO (E.004)', 10765, 'daN'], ['CFM56-7B26 TO (E.004)', 11699, 'daN'], ['CFM56-7B27 TO (E.004)', 12143, 'daN'],
  ['CFM56-7B26/27 MCT (E.004)', 11521, 'daN'],
  ['CFM56-5B3/P TO (E37NE)', 32000, 'lbf'], ['CFM56-5B4/P TO (E37NE)', 27000, 'lbf'], ['CFM56-5B6/P TO (E37NE)', 23500, 'lbf'],
  ['LEAP-1A26 TO (E00089EN)', 27120, 'lbf'], ['LEAP-1A32/35A TO (E00089EN)', 32160, 'lbf'],
  ['Trent 772B-60 net TO (E.042)', 71100, 'lbf'], ['Trent 772B-60 bare TO (E.042)', 72000, 'lbf'],
];
for (const [n, v, u] of R) {
  const N = u === 'daN' ? v * 10 : v * LBF;
  out(`${n}: ${v} ${u} = ${fmt(N / 1000, 2)} kN = ${fmt(N / LBF, 0)} lbf`);
}

out('\n== 2. 100 % rotor speeds from TCDS limits (rpm at limit / limit %)');
const S = [['CFM56-7B N1', 5382, 104], ['CFM56-7B N2', 15183, 105], ['CFM56-5B N1', 5200, 104], ['CFM56-5B N2 (inferred)', 15183, 105],
  ['LEAP-1A N1', 3894, 101], ['LEAP-1A N2', 19391, 116.5]];
for (const [n, rpm, pct] of S) out(`${n}: ${rpm}/${pct}% -> 100% = ${fmt(rpm / (pct / 100), 0)} rpm`);

out('\n== 3. Flat-rating slope kT from ATSB AO-2014-162 (737-838): assumed temp 35 -> 51 C, N1 93.1 -> 88.4 %');
const r = 88.4 / 93.1;
for (const n of [2.0, 2.3, 2.5]) { const Fr = r ** n; out(`F ~ N1^${n}: F51/F35 = ${fmt(Fr, 4)}, kT = ${fmt((1 - Fr) / 16, 5)} /K`); }

out('\n== 4. VTBD take-off thrust per engine (field 9 ft, QNH 1008 hPa) — static and M 0.2');
// pressure at field: QNH 1008 hPa, elevation 2.7 m -> p = 1008*(1-2.25577e-5*2.7)^5.25588
const pField = 100800 * Math.pow(1 - 2.25577e-5 * 2.7, 5.25588);
for (const oat of [15, 30, 35.8, 38]) {
  const T = oat + 273.15, amb = { T, p: pField, delta: pField / 101325 }, a = Math.sqrt(1.4 * 287.05287 * T), M = 70 / a; // 70 m/s ~ 136 kt
  const row = Object.entries(ENG).map(([k, E]) => `${k.replace('_class', '')} ${fmt(flatTheta(E, oat), 4)} / ${fmt(ratedThrust(E, amb, 0) / E.F00, 4)} / ${fmt(ratedThrust(E, amb, M) / E.F00, 4)}`);
  out(`OAT ${oat} C (delta ${fmt(amb.delta, 4)}, M(70 m/s) ${fmt(M, 4)}): Theta / F_static/F00 / F(70 m/s)/F00`); row.forEach(s => out('   ' + s));
}

out('\n== 5. TSFC from EEDB at LTO points (g/(kN s)) and FF ratios');
for (const [k, E] of Object.entries(ENG)) {
  const xs = [1, 0.85, 0.30, 0.07], t = E.ff.map((f, i) => f / (E.F00 * xs[i] / 1000) * 1000);
  const Fref = E.F00bare || E.F00;
  out(`${k}: TO ${fmt(E.ff[0] / (Fref / 1000) * 1000, 2)} | CO ${fmt(t[1], 2)} | App ${fmt(t[2], 2)} | Idle ${fmt(t[3], 2)} g/kN/s; idle/TO ${fmt(E.ff[3] / E.ff[0], 3)} app/TO ${fmt(E.ff[2] / E.ff[0], 3)}`);
}
out('TSFC 7B26 TO in lb/(lbf h): ' + fmt(1.213 / 116990 * 3600 * LBF / 0.45359237 , 4));

out('\n== 6. Quadratic fit FF/FF_TO = c0 + c1 x + c2 x^2 through the 4 EEDB points (least squares)');
function lsq(xs, ys) { // 3x3 normal equations
  const S = Array.from({ length: 3 }, () => [0, 0, 0, 0]);
  xs.forEach((x, i) => { const p = [1, x, x * x]; for (let a = 0; a < 3; a++) { for (let b = 0; b < 3; b++) S[a][b] += p[a] * p[b]; S[a][3] += p[a] * ys[i]; } });
  for (let i = 0; i < 3; i++) { for (let j = i + 1; j < 3; j++) { const f = S[j][i] / S[i][i]; for (let k = i; k < 4; k++) S[j][k] -= f * S[i][k]; } }
  const c = [0, 0, 0]; for (let i = 2; i >= 0; i--) { let s = S[i][3]; for (let k = i + 1; k < 3; k++) s -= S[i][k] * c[k]; c[i] = s / S[i][i]; } return c;
}
for (const [k, E] of Object.entries(ENG)) {
  const xs = [0.07, 0.30, 0.85, 1.0], ys = [E.ff[3], E.ff[2], E.ff[1], E.ff[0]].map(v => v / E.ff[0]);
  const c = lsq(xs, ys), res = xs.map((x, i) => c[0] + c[1] * x + c[2] * x * x - ys[i]);
  out(`${k}: c = [${c.map(v => fmt(v, 4)).join(', ')}], max|res| = ${fmt(Math.max(...res.map(Math.abs)), 4)}; FF(50%) lin ${fmt(ffInterp(E, 0.5), 4)} kg/s quad ${fmt(E.ff[0] * (c[0] + c[1] * 0.5 + c[2] * 0.25), 4)} kg/s`);
}

out('\n== 7. Lapse cross-checks');
const cr = isa(35000 * FT);
for (const [n, bpr, Fcr, Fmax] of [['CFM56-7B24 (OpenAP cruise_thrust)', 5.3, 24376, 107650], ['CFM56-5B4 (OpenAP cruise_thrust)', 5.9, 22241, 117900]]) {
  out(`${n}: data ${fmt(Fcr / Fmax, 4)} vs B&Y(M0.8, 35kft, out of range) ${fmt(lapseBY(0.8, cr.delta, bpr), 4)}`);
}
for (const bpr of [5.1, 5.9, 11.1, 10.5, 5.0]) out(`BPR ${bpr}: B&Y SL M0.4 ${fmt(lapseBY(0.4, 1, bpr), 4)} vs Poll&Schumann 0.97*(0.825-0.018*BPR) ${fmt(0.97 * (0.825 - 0.018 * bpr), 4)}; B&Y SL M0.2 ${fmt(lapseBY(0.2, 1, bpr), 4)}; 3000 ft M0.25 ${fmt(lapseBY(0.25, isa(3000 * FT).delta, bpr), 4)}`);
