// orev2_crosscheck.mjs — second independent reviewer pass (topic 3.9, 2026-11-18).
// Re-derives every equation-based expected value of T-O-01..T-O-08, T-O-11, T-O-14, T-O-17, T-O-20, T-O-21
// with methods different from the author's and the first reviewer's scripts:
//  - flare: explicit time stepping of hdot_cmd (dt = 1e-4 s) instead of closed forms
//  - normal quantiles: Simpson integration of the normal pdf tail + bisection (no Acklam, no erfc)
const KT = 1852 / 3600, FT = 0.3048, DEG = Math.PI / 180, G0 = 9.80665, LBF = 4.4482216152605;
const tg = Math.tan(3 * DEG), out = [];
const p = (...a) => { const s = a.join(' '); out.push(s); console.log(s); };

p('== T-O-01 LOC dot (locDist = LDA/runway length + LOC beyond far end) ==');
for (const [id, d] of [['21R', 3700 + 301.8], ['03L', 3700 + 314.0], ['21L', 3150 + 232.6]]) {
  const half = Math.atan(105 / d) / DEG;
  p(`${id}: locDist ${d.toFixed(1)} m, width ${(2 * half).toFixed(3)} deg, 1 dot ${(half / 2).toFixed(4)} deg, 1/4 dot at THR ${(d * Math.tan(half / 8 * DEG)).toFixed(2)} m`);
}
const dot21R = Math.atan(105 / 4001.8) / DEG / 2;
p(`T-O-17: 1/4 dot 21R = ${(dot21R / 4).toFixed(4)} deg = ${(75 / 4).toFixed(2)} uA; T-O-22: 25 uA = ${(25 / 75).toFixed(3)} dot = ${(25 / 75 * dot21R).toFixed(3)} deg`);

p('== T-O-02 wheel path, RDH 54 ft, 3 deg ==');
const RDH = 54 * FT, H = { b737: 4.237, a320: 4.88, a330: 8.56, atr: 2.3 };
const wheel = {};
for (const [k, h] of Object.entries(H)) {
  const thr = RDH - h, gpi = thr / tg; wheel[k] = gpi;
  p(`${k}: over THR ${thr.toFixed(3)} m (${(thr / FT).toFixed(1)} ft), wheel GPI ${gpi.toFixed(1)} m, s(400ft) ${(gpi - 400 * FT / tg).toFixed(0)} m, s(350) ${(gpi - 350 * FT / tg).toFixed(0)}, s(200) ${(gpi - 200 * FT / tg).toFixed(0)}, s(100) ${(gpi - 100 * FT / tg).toFixed(0)}`);
}

// generic stepping flare: hdot_cmd = -(h + hB)/tau, perfect tracking, constant ground speed V
function flare(V, hF, tau, hB, sGPI, marks = []) {
  let h = hF, s = sGPI - hF / tg, t = 0; const dt = 1e-4, sF = s, hit = {};
  while (h > 0) { const hd = -(h + hB) / tau; for (const m of marks) if (hit[m] === undefined && h <= m) hit[m] = [t, s]; h += hd * dt; s += V * dt; t += dt; }
  return { sF, sTD: s, t, sink: (0 + hB) / tau, hit };
}
p('== T-O-03 737 L1v at 142.1 kt ==');
{ const V = 142.1 * KT, hF = 50 * FT, hB = 12 * FT, tau = (hF + hB) / (V * tg);
  const r = flare(V, hF, tau, hB, wheel.b737, [27 * FT]);
  p(`tau ${tau.toFixed(4)} s, flare ${r.t.toFixed(3)} s, sink ${r.sink.toFixed(4)} m/s (${(r.sink / FT * 60).toFixed(1)} fpm), sF ${r.sF.toFixed(1)}, sTD ${r.sTD.toFixed(1)} m (${(r.sTD / FT).toFixed(0)} ft), RETARD(27ft) t ${r.hit[27 * FT][0].toFixed(3)} s s ${r.hit[27 * FT][1].toFixed(0)} m`); }

p('== T-O-04 patent prior art K = 0.205, hB 12 ft ==');
for (const kt of [110, 125, 140]) {
  const V = kt * KT, tau = 1 / 0.205, hB = 12 * FT, hF = V * tg * tau - hB;
  const r = flare(V, hF, tau, hB, wheel.b737);
  const tau2 = (42 * FT + hB) / (V * tg), r2 = flare(V, 42 * FT, tau2, hB, wheel.b737);
  p(`${kt} kt: hF ${(hF / FT).toFixed(2)} ft, TD ${(r.sTD / FT).toFixed(0)} ft from THR (${((r.sTD - wheel.b737) / FT).toFixed(0)} ft from wheel GPI); Vtau-const 42 ft: TD ${(r2.sTD / FT).toFixed(0)} ft`);
}

p('== T-O-05 / T-O-06 Airbus (FBW form) ==');
const hFab = (fpm) => Math.min(60, Math.max(45, fpm / 15)) * FT;
p('hF(VS): ' + [400, 709, 750, 800, 1000].map(v => `${v}->${(hFab(v) / FT).toFixed(2)} ft/${hFab(v).toFixed(2)} m`).join(', '));
for (const [k, kt] of [['a320', 133.6], ['a330', 140]]) {
  const V = kt * KT, vs = V * tg, fpm = vs / FT * 60, hF = hFab(fpm), tau = hF / (vs - 2.5 * FT), hB = 2.5 * FT * tau;
  const r = flare(V, hF, tau, hB, wheel[k], [30 * FT, 10 * FT]);
  p(`${k} ${kt} kt: VS ${fpm.toFixed(1)} fpm, hF ${(hF / FT).toFixed(2)} ft (${hF.toFixed(3)} m), tau ${tau.toFixed(3)} s, flare ${r.t.toFixed(3)} s, sink ${r.sink.toFixed(3)}, sF ${r.sF.toFixed(1)}, sTD ${r.sTD.toFixed(1)} m; 30 ft at s ${r.hit[30 * FT][1].toFixed(0)}, 10 ft at s ${r.hit[10 * FT][1].toFixed(0)}; straight-line 30 ft s ${(wheel[k] - 30 * FT / tg).toFixed(0)}, 10 ft s ${(wheel[k] - 10 * FT / tg).toFixed(0)}`);
}
p(`737 straight-line 27 ft s ${(wheel.b737 - 27 * FT / tg).toFixed(0)}`);

p('== T-O-07 LAND after 1.2 s below 400 ft ==');
p([600, 709, 800, 1000].map(v => `${v} fpm -> ${(400 - v / 60 * 1.2).toFixed(1)} ft`).join(', '));

p('== T-O-08 737 RETARD = min(t(27 ft), 2.5 s) ==');
for (const kt of [130, 142.1, 155]) {
  const V = kt * KT, hF = 50 * FT, hB = 12 * FT, tau = (hF + hB) / (V * tg), r = flare(V, hF, tau, hB, wheel.b737, [27 * FT]);
  p(`${kt} kt: t(27ft) ${r.hit[27 * FT][0].toFixed(3)} s -> RETARD ${Math.min(2.5, r.hit[27 * FT][0]).toFixed(3)} s`);
}

p('== T-O-11 quantiles by Simpson tail integration ==');
const pdf = (x) => Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
const tail = (z) => { const n = 20000, b = z + 15, h = (b - z) / n; let s = pdf(z) + pdf(b); for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * pdf(z + i * h); return s * h / 3; };
const zq = (pr) => { let lo = 0, hi = 10; for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; tail(m) > pr ? lo = m : hi = m; } return (lo + hi) / 2; };
const Z = { 1e-5: zq(1e-5), 1e-6: zq(1e-6), 1e-7: zq(1e-7), 1e-8: zq(1e-8) };
p('z: ' + Object.entries(Z).map(([k, v]) => `${k} ${v.toFixed(4)}`).join(', '));
const z6 = Z[1e-6];
p(`sigma_x <= ${((823 - 60) / 2 / z6).toFixed(2)} m (mean ${((823 + 60) / 2).toFixed(1)}); AC20-57A sigma_x <= ${(1500 * FT / 4).toFixed(2)} m, sigma_y <= ${(27 * FT / 2).toFixed(3)} m; sigma_sink <= ${((10 * FT - 0.76) / z6).toFixed(3)} m/s`);
for (const [k, tr] of [['737', 5.715], ['A320', 7.6], ['A330', 10.7], ['ATR', 4.1]]) p(`${k}: sigma_y <= ${((21.3 - tr / 2 - 0.3) / z6).toFixed(3)} m`);

p('== T-O-14 wind components, 21R true course 208.72 ==');
for (const [d, s] of [[209, 20], [250, 25], [270, 24], [30, 12], [200, 40], [180, 40]]) {
  const a = (d - 208.72) * DEG; p(`${d}/${s}: HW ${(s * Math.cos(a)).toFixed(2)} XW ${(s * Math.sin(a)).toFixed(2)}`);
}

p('== T-O-20 gains and engine lag ==');
for (const [k, m, Tmax] of [['b737', 60000, 2 * 26300 * LBF], ['a320', 64500, 2 * 27000 * LBF], ['a330', 185000, 2 * 71100 * LBF]])
  p(`${k}: Tmax ${(Tmax / 1000).toFixed(1)} kN, Kp ${(2 * 0.8 * 0.15 * m * KT / Tmax).toFixed(4)} Tmax/kt, Ki ${(0.0225 * m * KT / Tmax).toFixed(5)} Tmax/(kt s)`);
p(`first-order lag 1.5 s reaches 95 % at ${(1.5 * Math.log(20)).toFixed(3)} s`);

p('== T-O-21 trainer (h_F = clamp(2.4*sink, 4.5, 9) m, hdot = -(0.22 + h/2.4)) ==');
for (const [kt, h] of [[75, 1.0], [88, 1.37]]) {
  const V = kt * KT, sink = V * tg, hF = Math.min(9, Math.max(4.5, 2.4 * sink)), gpi = (RDH - h) / tg;
  const r = flare(V, hF, 2.4, 0.22 * 2.4, gpi);
  p(`${kt} kt H ${h}: hF ${hF.toFixed(3)} m (${(hF / FT).toFixed(1)} ft), sTD ${r.sTD.toFixed(0)} m, sink ${r.sink.toFixed(3)} m/s`);
}

p('== JSON unit spot checks ==');
p([['25 kt', 25 * KT], ['20 kt', 20 * KT], ['15 kt', 15 * KT], ['35 kt', 35 * KT], ['30 kt', 30 * KT], ['29 kt', 29 * KT], ['17 kt', 17 * KT], ['10 kt', 10 * KT], ['40 kt', 40 * KT], ['84 kt', 84 * KT], ['8 kt', 8 * KT]].map(([a, b]) => `${a}=${b.toFixed(4)}`).join(' '));
p([1500, 800, 400, 350, 2000, 200, 160, 250, 500, 600, 100, 50, 30, 20, 10, 9200, 1000, 2700, 3000, 70, 27, 12].map(f => `${f}ft=${(f * FT).toFixed(3)}`).join(' '));
p(`360 fpm=${(360 * FT / 60).toFixed(4)} m/s, 10 ft/s=${(10 * FT).toFixed(4)}, 2.4 ft/s=${(2.4 * FT).toFixed(4)}, 0.7 ft/s=${(0.7 * FT).toFixed(4)}, 2.5 ft/s=${(2.5 * FT).toFixed(4)}`);
import fs from 'fs';
fs.writeFileSync(new URL('./orev2_crosscheck_out.txt', import.meta.url), out.join('\n') + '\n');
