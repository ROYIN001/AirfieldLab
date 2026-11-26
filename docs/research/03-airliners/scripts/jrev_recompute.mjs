// jrev_recompute.mjs — independent reviewer recomputation of หัวข้อ 3.6 test expectations (does NOT import j_lib.mjs).
// Equations re-typed from round 1 sec 5.3/5.5/5.7 and หัวข้อ 3.6 3.6.4; B&Y coefficients checked against OpenAP thrust.py.
const LBF = 4.4482216152605, KT = 1852 / 3600, FT = 0.3048, g0 = 9.80665, R = 287.05287;
const f = (x, n = 4) => Number(x).toFixed(n);
function atm(h, dT = 0) { const T0 = 288.15, L = 0.0065, Ts = T0 - L * h, p = 101325 * (Ts / T0) ** (g0 / (R * L)), T = Ts + dT;
  return { T, p, d: p / 101325, rho: p / (R * T), a: Math.sqrt(1.4 * R * T) }; }
function BY(M, d, B) { const G = 0.0606 * B + 0.6337, A = -0.4327 * d * d + 1.3855 * d + 0.0472,
  Z = 0.9106 * d ** 3 - 1.7736 * d * d + 1.8697 * d, X = 0.1377 * d ** 3 - 0.4374 * d * d + 1.3003 * d;
  return A - 0.377 * (1 + B) / Math.sqrt((1 + 0.82 * B) * G) * Z * M + (0.23 + 0.19 * Math.sqrt(B)) * X * M * M; }
const E = { // F00 N, bpr, Tflat C, bump
  '7B24': [107650, 5.3, 30, 0], '7B26': [116990, 5.1, 30, 0], '7B27': [121430, 5.1, 30, 0], '5B6': [104530, 5.9, 45, 0], '5B4': [120100, 5.7, 45, 0],
  '5B3': [142340, 5.4, 30, 0], '1A26': [120640, 11.1, 44, 0], '1A32': [143050, 10.5, 30, 0], 'T772B': [316300, 5.0, 30, 0.054] };
const kT = 0.0065;
const th = (k, oat) => { const [, , Tf, b] = E[k]; const o = Math.max(0, oat - Tf); return Math.min(1, 1 - kT * o + Math.min(b, kT * o)); };
const rated = (k, a, M) => E[k][0] * BY(Math.min(M, 0.45), a.d, E[k][1]) * th(k, a.T - 273.15);
const out = console.log;
out('== unit conversions'); out(`27120 lbf = ${f(27120 * LBF, 1)} N; 32160 lbf = ${f(32160 * LBF, 1)}; 23500 = ${f(23500 * LBF, 1)}; 27000 = ${f(27000 * LBF, 1)}; 32000 = ${f(32000 * LBF, 1)}; 71100 = ${f(71100 * LBF, 0)}; 72000 = ${f(72000 * LBF, 0)}; 63560 = ${f(63560 * LBF, 0)}; 11521 daN = ${f(115210 / LBF, 0)} lbf; 60 kt = ${f(60 * KT, 3)} m/s; 70 kt = ${f(70 * KT, 3)} m/s`);
out('== T-J-03'); for (const k of ['7B26', '5B6', '1A26', '1A32', 'T772B']) out(`${k}: Θ38 ${f(th(k, 38))} Θ45 ${f(th(k, 45))} Θ35.8 ${f(th(k, 35.8))}`);
out(`Trent full-thrust limit OAT = ${f(30 + 0.054 / kT, 2)} C`);
// field pressure: QNH 1008 hPa reduced to 2.7 m with ISA lapse
const pf = 100800 * (1 - 0.0065 * 2.7 / 288.15) ** (g0 / (R * 0.0065));
out('== T-J-04 field p = ' + f(pf, 1) + ' Pa, delta ' + f(pf / 101325, 5));
for (const k of ['7B26', '5B6', '1A26', 'T772B']) { const a = { T: 308.95, d: pf / 101325 }; out(`${k}: F_static ${f(rated(k, a, 0), 0)} N`); }
out('== T-J-05'); const a1k = atm(1000 * FT); for (const B of [5.1, 5.9, 11.1]) out(`BPR ${B}: SL M0.2 ${f(BY(0.2, 1, B))}, 1000 ft M0.2 ${f(BY(0.2, a1k.d, B))}`);
out('== 3.6.4 table (70 m/s)'); for (const oat of [30, 35.8, 38]) { const a = { T: oat + 273.15, d: pf / 101325 }, M = 70 / Math.sqrt(1.4 * R * a.T);
  out(`OAT ${oat}: ` + Object.keys(E).map(k => `${k} ${f(rated(k, a, 0) / E[k][0])}/${f(rated(k, a, M) / E[k][0])}`).join('  ')); }
out('== T-J-07 / kT'); const r = 88.4 / 93.1;
for (const n of [2, 2.3, 2.5]) { const F = r ** n; out(`n ${n}: F51/F35 ${f(F)}; kT rel. F(35) (1-F)/16 = ${f((1 - F) / 16, 5)}; kT in model form (Tflat 30) = (1-F)/(21-5F) = ${f((1 - F) / (21 - 5 * F), 5)}`); }
out(`model ratio ${f(th('7B26', 51) / th('7B26', 35))}`);
out('== T-J-08/09'); const ff = { '1A26': [0.861, 0.71, 0.244, 0.091], '7B26': [1.213, 0.986, 0.331, 0.108] }; const X = [0.07, 0.3, 0.85, 1];
const lin = (k, x) => { const y = [ff[k][3], ff[k][2], ff[k][1], ff[k][0]]; for (let i = 1; i < 4; i++) if (x <= X[i]) return y[i - 1] + (y[i] - y[i - 1]) * (x - X[i - 1]) / (X[i] - X[i - 1]); };
out(`1A26 ff(.3) ${f(lin('1A26', .3))} ff(.5) ${f(lin('1A26', .5))} ff(1) ${f(lin('1A26', 1))}; 7B26 ff(.5) ${f(lin('7B26', .5))}`);
const ts = (fft, F) => fft / F * 1e6; out(`TSFC 7B26 ${f(ts(1.213, 116990), 3)} 1A26 (F00) ${f(ts(0.861, 120640), 3)} (EEDB 120.6) ${f(ts(0.861, 120600), 3)} ratio ${f(ts(0.861, 120640) / ts(1.213, 116990), 4)}; 7B26 lb/lbf/h ${f(1.213 * 3600 / 0.45359237 / (116990 / LBF), 4)}`);
out(`TSFC others: 7B24 ${f(ts(1.086, 107650), 2)} 7B27 ${f(ts(1.293, 121430), 2)} 5B6 ${f(ts(0.965, 104530), 2)} 5B4 ${f(ts(1.142, 120100), 2)} 5B3 ${f(ts(1.462, 142340), 2)} 1A32 ${f(ts(1.062, 143050), 2)} Trent(bare) ${f(ts(3.139, 320300), 2)}`);
out('== T-J-16 reverse (35 C SL)'); const a35 = atm(0, 20);
for (const [t, k, m] of [['737', '7B26', 66360], ['A320ceo', '5B6', 64500], ['A320neo', '1A26', 67400], ['A321neo', '1A32', 79200], ['A330', 'T772B', 187000]]) {
  const fr = kt => { const M = kt * KT / a35.a; return 2 * E[k][0] * (0.3 + M) * (0.1 + 0.9 * 0.7); };
  const fi = kt => { const M = kt * KT / a35.a; return 2 * E[k][0] * (0.3 + M) * 0.1; };
  out(`${t}: 130 kt ${f(fr(130) / 1e3, 1)} kN (${f(fr(130) / (m * g0), 3)} g); 100 kt ${f(fr(100) / 1e3, 1)}; cancel ${f(fr(t === '737' ? 60 : 70) / 1e3, 1)}; rev idle 130 ${f(fi(130) / 1e3, 1)}`); }
out(`T-J-15: 737 ${f((130 - 60) * KT / 2, 3)} s, Airbus ${f((130 - 70) * KT / 2, 3)} s; T-J-14 green ${0.9 * 2} / ${0.9 * 2.5} s`);
out('== T-J-17/18 (35 C SL)');
const IN = 0.0254; const geo = { '737': [(625 - 540) * IN, 193 * IN, 2.7 - ((0.64 + 0.48) / 2 + 2.06 / 2)], 'A32x': [18.849 - 14.3962788, 5.755, 0.19249 + 1.04768], 'A330': [0.48086 + 2.7034, 9.40138, 0.25204 + 1.89664] };
for (const [t, k, gk, S, c, b, vk] of [['737', '7B26', '737', 124.6, 4.17, 34.32, 145], ['A320ceo', '5B6', 'A32x', 122.6, 4.1935, 34.10, 135], ['A320neo', '1A26', 'A32x', 122.6, 4.1935, 35.80, 135], ['A321neo', '1A32', 'A32x', 122.6, 4.1935, 35.80, 140], ['A330', 'T772B', 'A330', 361.6, 7.26, 60.3, 140]]) {
  const V = vk * KT, M = V / a35.a, q = 0.5 * a35.rho * V * V, [x, y, z] = geo[gk];
  const Fnf = E[k][0] * BY(M, a35.d, E[k][1]), Ff = rated(k, a35, M);
  // r x F with F=[F,0,0]: M = [y*0 - z*0, z*F - x*0, x*0 - y*F]
  out(`${t}: pos [${f(x, 3)}, ${f(y, 3)}, ${f(z, 3)}] F no-flat ${f(Fnf / 1e3, 1)} kN, with Θ(35C)=${f(th(k, 35), 4)} ${f(Ff / 1e3, 1)} kN | My ${f(2 * z * Fnf / 1e3, 1)} -> ${f(2 * z * Ff / 1e3, 1)} kN m, dCm ${f(2 * z * Fnf / (q * S * c), 4)} -> ${f(2 * z * Ff / (q * S * c), 4)} | N(right eng only) ${f(-y * Fnf / 1e3, 1)} -> ${f(-y * Ff / 1e3, 1)}, dCn ${f(y * Fnf / (q * S * b), 4)} -> ${f(y * Ff / (q * S * b), 4)}`);
}
out(`glide-path thrust 737 65 t L/D 8.5: ${f(65000 * g0 * (1 / 8.5 - Math.sin(3 * Math.PI / 180)) / 1e3, 1)} kN`);
out('== T-J-19 legacy fits');
for (const [t, k] of [['b737_800', '7B26'], ['a320ceo', '5B6'], ['a320neo', '1A26'], ['a321ceo', '5B3'], ['a321neo', '1A32'], ['a330_300', 'T772B']]) {
  const B = E[k][1]; let best = [1e9, 0];
  for (let Vc = 40; Vc <= 200; Vc += 0.05) { let e = 0; for (let V = 0; V <= 90; V += 1) e += (Vc / Math.hypot(V, Vc) - BY(V / 340.294, 1, B)) ** 2; if (e < best[0]) best = [e, Vc]; }
  const Vc = best[1]; let mx = 0; for (let V = 0; V <= 90; V += 1) mx = Math.max(mx, Math.abs(Vc / Math.hypot(V, Vc) - BY(V / 340.294, 1, B)));
  const T0 = 2 * E[k][0]; out(`${t}: T0 ${T0} Vc ${f(Vc, 1)} P ${f(T0 * Vc / 0.8, 0)} maxErr ${f(mx)}; thrustAvail(70)/T0 ${f(Vc / Math.hypot(70, Vc))} vs BY ${f(BY(70 / 340.294, 1, B))}`);
}
out('== T-J-20 MCT/F00'); for (const [n, m, t] of [['7B26', 115210, 116990], ['5B6', 90080, 104530], ['1A26', 118680, 120640], ['1A32', 140960, 143050], ['T772B', 282700, 316300]]) out(`${n} ${f(m / t, 4)}`);
out('== 3.6.5 B&Y SL M0.4'); for (const B of [5.1, 11.1, 10.5, 5.0]) out(`BPR ${B}: ${f(BY(0.4, 1, B))}`); const c35 = atm(35000 * FT); out(`35 kft d ${f(c35.d)}; BY M0.8 BPR5.3 ${f(BY(0.8, c35.d, 5.3))} BPR5.9 ${f(BY(0.8, c35.d, 5.9))}`);
