// orev_recompute.mjs — independent reviewer (topic 3.9): recompute every equation-based test value
// of 09-afcs-autoland.md with closed forms where possible and an RK4 integrator otherwise.
// Run: node orev_recompute.mjs   (Node >= 18, no dependencies)
const FT = 0.3048, KT = 1852 / 3600, DEG = Math.PI / 180;
const tg = Math.tan(3 * DEG);
const f = (x, n = 2) => (+x).toFixed(n);
const out = [];
const P = (...a) => { const s = a.join(' '); out.push(s); console.log(s); };

// --- A. ILS geometry (T-O-01). locDist: report table and repo 15-geo.js (orev_geo.mjs) ---
P('== A. LOC dot (T-O-01) ==');
for (const [id, d, rdhFt] of [['21R', 4001.8, 54], ['03L', 4014.0, 55], ['21L', 3382.6, 53], ['21R repo', 4003.4, 54]]) {
  const half = Math.atan(105 / d) / DEG, dot = half / 2;
  P(`${id}: width ${f(2 * half, 3)} deg, 1 dot ${f(dot, 4)} deg, uA/deg ${f(75 / dot, 1)}, 1/4 dot at THR ${f(Math.tan(dot / 4 * DEG) * d, 2)} m, GP origin ${f(rdhFt * FT / tg, 1)} m`);
}
P(`1/3 dot on 21R = ${f(0.7514 / 3, 3)} deg; 25 uA = ${f(25 / 75, 3)} dot; GS 1 dot ICAO 0.12*3 = ${f(0.36, 2)} deg; FAA 1.4/4 = ${f(1.4 / 4, 3)} deg`);

// --- B. Wheel path (T-O-02) ---
P('\n== B. wheel path on 21R (aim 314.1 m, RDH 54 ft) ==');
const aim = 54 * FT / tg;
const TY = { b737: { H: 4.237, vg: 142.1 }, a320: { H: 4.88, vg: 133.6 }, a330: { H: 8.56, vg: 140 }, atr: { H: 2.3, vg: 117 } };
for (const [k, T] of Object.entries(TY)) {
  T.sw = aim - T.H / tg;
  P(`${k}: wheels over THR ${f(54 * FT - T.H, 3)} m (${f((54 * FT - T.H) / FT, 1)} ft), wheel GPI ${f(T.sw, 1)} m, s(400 ft) ${f(T.sw - 400 * FT / tg, 0)} m, s(350) ${f(T.sw - 350 * FT / tg, 0)}, s(200) ${f(T.sw - 200 * FT / tg, 0)}, s(100) ${f(T.sw - 100 * FT / tg, 0)}`);
}

// --- C. Flare laws, closed form (lag 0) ---
P('\n== C. flare closed forms ==');
// L1v (737): hdot = -(h+hB)/tau, tau = (hF+hB)/(VG tan g)
function L1v(vgKt, hFft = 50, hBft = 12) {
  const vg = vgKt * KT, hF = hFft * FT, hB = hBft * FT, tau = (hF + hB) / (vg * tg);
  const tTD = tau * Math.log((hF + hB) / hB);
  return { tau, tTD, sink: hB / tau, hF, dsTD: vg * tTD, vg };
}
const b = L1v(142.1);
const sF737 = TY.b737.sw - b.hF / tg;
P(`737 142.1 kt: tau ${f(b.tau, 4)} s, flare ${f(b.tTD, 3)} s, sink ${f(b.sink, 4)} m/s (${f(b.sink / FT * 60, 1)} fpm), sF ${f(sF737, 1)} m, sTD ${f(sF737 + b.dsTD, 1)} m (${f((sF737 + b.dsTD) / FT, 0)} ft)`);
// L1 prior art K = 0.205, hB = 12 ft; flare where VG tan g = K (h+hB)
for (const kt of [110, 125, 140]) {
  const vg = kt * KT, K = 0.205, hB = 12 * FT, hF = vg * tg / K - hB, t = Math.log((hF + hB) / hB) / K;
  const sF = TY.b737.sw - hF / tg, sTD = sF + vg * t;
  // V*tau const law tuned to 42 ft
  const v = L1v(kt, 42), sF2 = TY.b737.sw - v.hF / tg;
  P(`${kt} kt prior art: hF ${f(hF / FT, 2)} ft (${f(hF, 2)} m), TD from THR ${f(sTD / FT, 0)} ft (${f(sTD, 1)} m), from wheel GPI ${f((sTD - TY.b737.sw) / FT, 0)} ft; V*tau=const 42 ft: TD from THR ${f((sF2 + v.dsTD) / FT, 0)} ft (${f(sF2 + v.dsTD, 1)} m)`);
}
// L2 (Airbus FBW): hF = clamp(4|hdot|, 45 ft, 60 ft), tau = hF/(|hdot|-c), hdot = -h/tau - c
function L2(vgKt, c = 2.5 * FT) {
  const vg = vgKt * KT, hd = vg * tg, hF = Math.min(60 * FT, Math.max(45 * FT, 4 * hd)), tau = hF / (hd - c);
  const tTD = tau * Math.log((hF + c * tau) / (c * tau));
  return { vg, hd, hF, tau, tTD, hB: c * tau, dsTD: vg * tTD };
}
for (const [k, kt] of [['a320', 133.6], ['a330', 140]]) {
  const r = L2(kt), sF = TY[k].sw - r.hF / tg;
  P(`${k} ${kt} kt: VS ${f(r.hd / FT * 60, 1)} fpm, hF ${f(r.hF / FT, 2)} ft, tau ${f(r.tau, 3)} s, hB-equiv ${f(r.hB, 2)} m, flare ${f(r.tTD, 3)} s, sF ${f(sF, 1)} m, sTD ${f(sF + r.dsTD, 1)} m (${f((sF + r.dsTD) / FT, 0)} ft)`);
}
P(`T-O-05 hF(VS): ${[400, 709, 750, 800, 1000].map(v => `${v}->${f(Math.min(60, Math.max(45, v / 15)), 2)} ft/${f(Math.min(60, Math.max(45, v / 15)) * FT, 2)} m/${f(v * FT / 60, 2)} m/s`).join(', ')}`);

// --- D. RK4 kinematic sim with optional first-order lag on hdot (T-O-03, T-O-06, T-O-21) ---
function sim({ vgKt, sw, hFfn, mk, lag = 0, h0ft = 150, retardFt = null, retardDt = null }) {
  const vg = vgKt * KT, dt = 0.0005;
  let h = h0ft * FT, hd = -vg * tg, s = sw - h / tg, t = 0, mode = 'APP', law = null, tF = 0, sF = 0, hF = 0, tR = null, sR = null;
  const deriv = (h, hd, cmd) => [hd, lag > 0 ? (cmd - hd) / lag : 0];
  while (h > 0 && t < 200) {
    if (mode === 'APP' && h <= hFfn(-hd)) { mode = 'F'; law = mk(h, -hd); tF = t; sF = s; hF = h; }
    if (mode === 'F' && tR === null && ((retardFt != null && h <= retardFt * FT) || (retardDt != null && t - tF >= retardDt))) { tR = t - tF; sR = s; }
    const cmdAt = (hh) => (mode === 'F' ? law(hh) : -vg * tg);
    if (lag > 0) {
      const k1 = deriv(h, hd, cmdAt(h)), k2 = deriv(h + k1[0] * dt / 2, hd + k1[1] * dt / 2, cmdAt(h + k1[0] * dt / 2));
      const k3 = deriv(h + k2[0] * dt / 2, hd + k2[1] * dt / 2, cmdAt(h + k2[0] * dt / 2)), k4 = deriv(h + k3[0] * dt, hd + k3[1] * dt, cmdAt(h + k3[0] * dt));
      h += (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]) * dt / 6; hd += (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]) * dt / 6;
    } else { hd = cmdAt(h); h += hd * dt; }
    s += vg * dt; t += dt;
  }
  return { hFft: hF / FT, sF, sTD: s, tFl: t - tF, sink: -hd, tR, sR };
}
const rep = (tag, r) => P(`${tag}: hF ${f(r.hFft, 1)} ft, sF ${f(r.sF, 0)}, TD s ${f(r.sTD, 0)} m, flare ${f(r.tFl, 2)} s, sink ${f(r.sink, 3)} m/s (${f(r.sink / FT * 60, 0)} fpm)` + (r.tR != null ? `, retard ${f(r.tR, 2)} s at s ${f(r.sR, 0)}` : ''));
P('\n== D. kinematic sims (RK4 for lag) ==');
for (const lag of [0, 1]) {
  const v = L1v(142.1);
  rep(`737 L1v lag${lag}`, sim({ vgKt: 142.1, sw: TY.b737.sw, hFfn: () => 50 * FT, mk: () => (h) => -(h + 12 * FT) / v.tau, lag, retardFt: 27, retardDt: 2.5 }));
  for (const [k, kt] of [['a320', 133.6], ['a330', 140]]) {
    rep(`${k} L2 lag${lag}`, sim({ vgKt: kt, sw: TY[k].sw, hFfn: (hd) => Math.min(60 * FT, Math.max(45 * FT, 4 * hd)), mk: (h, hd) => { const tau = h / (hd - 2.5 * FT); return (hh) => -hh / tau - 2.5 * FT; }, lag, retardFt: 30 }));
    rep(`${k} L2 lag${lag} (10 ft)`, sim({ vgKt: kt, sw: TY[k].sw, hFfn: (hd) => Math.min(60 * FT, Math.max(45 * FT, 4 * hd)), mk: (h, hd) => { const tau = h / (hd - 2.5 * FT); return (hh) => -hh / tau - 2.5 * FT; }, lag, retardFt: 10 }));
  }
}
// trainer (code: hF = clamp(2.4*max(sink,1.5), 4.5, 9) m, hdot = -(0.22 + h/2.4)); wheel ~1.37 m below CG (AC.gear z)
for (const [kt, H] of [[75, 1.0], [88, 1.37], [95, 1.37]]) {
  const sw = aim - H / tg;
  rep(`trainer ${kt} kt H ${H}`, sim({ vgKt: kt, sw, hFfn: (hd) => Math.min(9, Math.max(4.5, 2.4 * Math.max(hd, 1.5))), mk: () => (h) => -(0.22 + h / 2.4) }));
}

// --- E. 737 RETARD trigger (T-O-08) ---
P('\n== E. 737 RETARD (min of 27 ft and 2.5 s) ==');
for (const kt of [130, 142.1, 155]) { const v = L1v(kt); const t27 = v.tau * Math.log((50 + 12) / (27 + 12)); P(`${kt} kt: tau ${f(v.tau, 3)} s, t(27 ft) ${f(t27, 3)} s -> RETARD at ${f(Math.min(t27, 2.5), 3)} s`); }

// --- F. LAND height (T-O-07) ---
P('\n== F. LAND engagement ==');
for (const vs of [600, 709, 800, 1000]) P(`VS ${vs}: ${f(400 - vs * 1.2 / 60, 1)} ft (${f((400 - vs * 1.2 / 60) * FT, 1)} m)`);

// --- G. normal quantiles by bisection on erfc (independent of Acklam) ---
function erfc(x) { // Numerical Recipes erfcc (Chebyshev), rel. err < 1.2e-7
  const z = Math.abs(x), t = 1 / (1 + 0.5 * z);
  const r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
  return x >= 0 ? r : 2 - r;
}
const Q = (z) => 0.5 * erfc(z / Math.SQRT2);
const zq = (p) => { let lo = 0, hi = 10; for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (Q(m) > p) lo = m; else hi = m; } return (lo + hi) / 2; };
P('\n== G. quantiles and sigma limits ==');
const z6 = zq(1e-6);
P(`z: 1e-5 ${f(zq(1e-5), 3)}, 1e-6 ${f(z6, 3)}, 1e-7 ${f(zq(1e-7), 3)}, 1e-8 ${f(zq(1e-8), 3)}`);
P(`sigma_x <= ${f((823 - 60) / 2 / z6, 2)} m (mean ${f((823 + 60) / 2, 1)}); AC20-57A sigma_x <= ${f(1500 * FT / 4, 2)} m, sigma_y <= ${f(27 * FT / 2, 3)} m; sigma_sink <= ${f((10 * FT - 0.76) / z6, 3)} m/s`);
for (const [k, tr] of [['737', 5.715], ['A320', 7.6], ['A330', 10.7], ['ATR', 4.1]]) P(`${k}: sigma_y <= ${f((21.3 - tr / 2 - 0.3) / z6, 3)} m`);

// --- H. wind components on 21R (T-O-14) ---
P('\n== H. winds on 21R course 208.72 ==');
const LIM = { a320: [30, 20, 10], b737: [25, 20, 15], b737_xw25: [25, 25, 15], a330: [35, 20, 10] };
for (const [d, sp] of [[209, 20], [250, 25], [270, 24], [30, 12], [180, 40], [200, 40]]) {
  const a = (d - 208.72) * DEG, hw = sp * Math.cos(a), xw = sp * Math.sin(a);
  const ok = Object.fromEntries(Object.entries(LIM).map(([k, L]) => [k, (hw >= 0 ? hw <= L[0] : -hw <= L[2]) && Math.abs(xw) <= L[1]]));
  P(`${d}/${sp}: HW ${f(hw, 2)} XW ${f(xw, 2)} -> ${JSON.stringify(ok)}`);
}

// --- I. unit conversions used in JSON ---
P('\n== I. conversions ==');
P(['kt', ...[10, 15, 17, 20, 25, 29, 30, 35, 40, 64, 84].map(k => `${k}=${f(k * KT, 4)}`)].join(' '));
P(['ft', ...[9200, 1000, 2500, 600, 500, 250, 160, 100, 80, 50, 20, 10].map(k => `${k}=${f(k * FT, 3)}`)].join(' '));
P(`360 fpm = ${f(360 * FT / 60, 4)} m/s; 2.4 ft/s = ${f(2.4 * FT, 4)}; 0.7 ft/s = ${f(0.7 * FT, 4)}; 12 ft = ${f(12 * FT, 4)} m; 8 kt/100ft = ${f(8 * KT, 4)} m/s per 30.48 m`);
