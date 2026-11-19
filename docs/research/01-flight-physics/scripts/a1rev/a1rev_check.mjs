// A1 review: independent recomputation of buffet filter peaks/RMS and spin descent estimates
const g0 = 9.80665, DEG = Math.PI / 180;
// ---------- buffet ----------
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function gaussF(r) { let u = 0; while (u === 0) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); }
function simulate(modes, T, dt, seed) {
  const r = rng(seed), n = Math.round(T / dt), s = modes.map(() => [0, 0]), y = new Float64Array(n);
  for (let k = 0; k < n; k++) { let o = 0; modes.forEach((m, i) => { const u = gaussF(r) / Math.sqrt(dt); const st = s[i]; const ydd = m.w0 * m.w0 * (u - st[0]) - (m.w0 / m.Q) * st[1]; st[1] += ydd * dt; st[0] += st[1] * dt; o += m.G * st[0]; }); y[k] = o; }
  return y;
}
function welchPeak(y, dt, seg) { // Hann-window Welch, returns peak frequency
  const N = seg, nseg = Math.floor(y.length / N) * 2 - 1, P = new Float64Array(N / 2);
  for (let k = 0; k < nseg; k++) { const off = k * N / 2; for (let f = 1; f < N / 2; f++) { let re = 0, im = 0; for (let i = 0; i < N; i++) { const w = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (N - 1)); const v = y[off + i] * w; const ph = 2 * Math.PI * f * i / N; re += v * Math.cos(ph); im -= v * Math.sin(ph); } P[f] += re * re + im * im; } }
  let best = 1; for (let f = 2; f < N / 2; f++) if (P[f] > P[best]) best = f; return best / (N * dt);
}
const rms = y => Math.sqrt(y.reduce((a, v) => a + v * v, 0) / y.length);
const dt = 1 / 240, out = {};
const sig1 = (w0, Q) => Math.sqrt(w0 * Q / 2);   // RMS of unit-gain filter driven by unit-intensity white noise
const vert = [{ w0: 75.92, Q: 8.28 }];
const lat = [{ w0: 36.43, Q: 4.19, H: 0.02 }, { w0: 64.71, Q: 11.99, H: 0.01 }];
vert[0].G = 0.05 * g0 / sig1(75.92, 8.28);
// lateral: keep H0 ratio 2:1, scale so total RMS = 0.016 g
const latVar1 = lat.reduce((a, m) => a + (m.H ** 2) * m.w0 * m.Q / 2, 0), kLat = 0.016 * g0 / Math.sqrt(latVar1);
lat.forEach(m => m.G = kLat * m.H);
out.analytic = {
  vert_fn_Hz: +(75.92 / 2 / Math.PI).toFixed(2), vert_peak_Hz: +(75.92 / 2 / Math.PI * Math.sqrt(1 - 1 / (2 * 8.28 ** 2))).toFixed(2),
  lat1_fn_Hz: +(36.43 / 2 / Math.PI).toFixed(2), lat1_peak_Hz: +(36.43 / 2 / Math.PI * Math.sqrt(1 - 1 / (2 * 4.19 ** 2))).toFixed(2),
  lat2_fn_Hz: +(64.71 / 2 / Math.PI).toFixed(2),
  sigma_unit_vert: +sig1(75.92, 8.28).toFixed(2), rms_vert_H0_0p05_g: +(0.05 * sig1(75.92, 8.28) / g0).toFixed(3),
  G_vert_SI: +vert[0].G.toFixed(4),
};
const yv = simulate(vert, 60, dt, 3), yl = simulate(lat, 60, dt, 3), yl1 = simulate([lat[0]], 60, dt, 3);
out.sim60s = { rms_az_g: +(rms(yv) / g0).toFixed(4), rms_ay_g: +(rms(yl) / g0).toFixed(4),
  peak_az_Hz_seg1024: +welchPeak(yv, dt, 1024).toFixed(2), peak_ay_Hz_seg1024: +welchPeak(yl, dt, 1024).toFixed(2), peak_ay_mode1only_Hz: +welchPeak(yl1, dt, 1024).toFixed(2) };
// ---------- spin ----------
const m = 2250, S = 16.3, b = 10.2, rho = 1.225, W = m * g0, CD0 = 0.045, CDmax = 1.40, dCDX = 0.20;
const CDsep = a => CD0 + dCDX * Math.cos(a) ** 2 + (CDmax - CD0) * Math.sin(a) ** 2; // X = 0 branch (proposed, clean)
const CLsep = a => 0.5 * CDmax * Math.sin(2 * a); // flat-plate part only (A-term ~0 at these alpha, check below)
const fpm = v => v / 0.3048 * 60;
const rows = [];
for (const aD of [40, 43, 45, 50, 53, 55, 60]) { const a = aD * DEG, CD = CDsep(a); rows.push({ aD, CD: +CD.toFixed(3), Vd_D: +Math.sqrt(2 * W / (rho * S * CD)).toFixed(1), fpm_D: Math.round(fpm(Math.sqrt(2 * W / (rho * S * CD)))) }); }
out.spin_trainer_D_eq_W = rows;
// TP-2644 airplane: 1530-1538 lb, 98.11 ft2, span 24.46 ft, 145-208 deg/s, SL density slug/ft3
const tp = { W: 1535, S: 98.11, b: 24.46, rho: 0.0023769 };
const Vtp = c => Math.sqrt(2 * tp.W / (tp.rho * tp.S * c));
const oh = (rateDeg, V, bb) => rateDeg * DEG * bb / (2 * V);
out.tp2644 = {
  CD_043: +CDsep(43 * DEG).toFixed(3), CD_053: +CDsep(53 * DEG).toFixed(3),
  Vd_CD_fts: [Vtp(CDsep(53 * DEG)), Vtp(CDsep(43 * DEG))].map(v => +v.toFixed(0)),
  Vd_CR_1p0_1p2_fts: [Vtp(1.2), Vtp(1.0)].map(v => +v.toFixed(0)),
  ohat_range_CD: [oh(145, Vtp(CDsep(43 * DEG)), tp.b), oh(208, Vtp(CDsep(53 * DEG)), tp.b)].map(v => +v.toFixed(3)),
  ohat_range_CR: [oh(145, Vtp(1.0), tp.b), oh(208, Vtp(1.2), tp.b)].map(v => +v.toFixed(3)),
};
// trainer turn rate from omega_hat range and D=W descent at alpha 43-53
const VdLo = Math.sqrt(2 * W / (rho * S * CDsep(53 * DEG))), VdHi = Math.sqrt(2 * W / (rho * S * CDsep(43 * DEG)));
const ohLo = out.tp2644.ohat_range_CD[0], ohHi = out.tp2644.ohat_range_CR[1];
out.trainer_from_ohat = { ohat: [ohLo, ohHi], Vd_ms: [+VdLo.toFixed(1), +VdHi.toFixed(1)], fpm: [Math.round(fpm(VdLo)), Math.round(fpm(VdHi))],
  rate_degs: [ohLo * 2 * VdLo / b / DEG, ohHi * 2 * VdHi / b / DEG].map(v => +v.toFixed(0)),
  ft_per_turn: [Math.PI * b / ohHi / 0.3048, Math.PI * b / ohLo / 0.3048].map(v => +v.toFixed(0)),
  s_per_turn_at_ohat_0p30_0p42_VdLo: [2 * Math.PI / (0.42 * 2 * VdLo / b), 2 * Math.PI / (0.30 * 2 * VdLo / b)].map(v => +v.toFixed(2)) };
// Old method (C_R) for comparison at 40-60 deg using full proposed curve (from run_static clean): CR 1.114..1.291
out.CR_method_Vd = [1.291, 1.114].map(c => +Math.sqrt(2 * W / (rho * S * c)).toFixed(1));
// spin radius check: L = m Omega^2 R
out.spin_radius_m = (() => { const a = 45 * DEG, V = Math.sqrt(2 * W / (rho * S * CDsep(a))), L = 0.5 * rho * V * V * S * 0.85, Om = 170 * DEG; return +(L / (m * Om * Om)).toFixed(2); })();
console.log(JSON.stringify(out, null, 1));
