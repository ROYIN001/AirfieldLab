// u2_ktable.mjs — immersion fractions kH(rs), kV(rs) on a regular grid + check of single-point swirl height z_sw
const zThr = 0.06, zHT = 0.30, zFin = 0.34;
const cHT = (y) => 1.25 - 0.53 * (y / 1.85), cFin = (h) => 1.55 - 0.75 * (h / 1.75);
const integ = (f, a, b, n = 400) => { if (b <= a) return 0; let s = 0; const h = (b - a) / n; for (let i = 0; i < n; i++) s += f(a + (i + 0.5) * h) * h; return s; };
const Sh = 2 * integ(cHT, 0.2, 1.85), Sv = integ(cFin, 0, 1.75);
const rsAx = [0.3, 0.5, 0.7, 0.8, 0.9, 1.0, 1.1, 1.22];
const kH = rsAx.map((rs) => { const d = zHT - zThr; const w = rs > d ? Math.sqrt(rs * rs - d * d) : 0; return +(2 * integ(cHT, 0.2, Math.min(w, 1.85)) / Sh).toFixed(3); });
const kV = rsAx.map((rs) => +(integ(cFin, 0, Math.max(0, Math.min(1.75, rs - (zFin - zThr)))) / Sv).toFixed(3));
console.log(JSON.stringify({ rsAx, kH, kV }));
// swirl: chord-weighted mean vs single height z_sw
const R = 1.22, rHub = 0.25;
for (const [V, T, vi] of [[0, 11500, 32.56], [41.16, 8783, 14.5], [56.6, 7501, null], [51.0, 1973, 3.4]]) {
  const rho = 1.16, A = Math.PI * R * R, v = vi ?? 0.5 * (-V + Math.sqrt(V * V + 2 * T / (rho * A)));
  const Vs = V + 2 * v, rs = R * Math.sqrt((V + v) / (V + 2 * v)), C = 3342 / (Math.PI * rho * (V + v) * (R * R - rHub * rHub));
  const hImm = Math.max(0, Math.min(1.75, rs - 0.28));
  const mean = integ((h) => cFin(h) * Math.atan(C / ((0.28 + h) * Vs)), 0, hImm) / integ(cFin, 0, hImm);
  console.log(`V ${V} : mean swirl ${(mean * 57.2958).toFixed(1)} deg, single z 0.55 m: ${(Math.atan(C / (0.55 * Vs)) * 57.2958).toFixed(1)} deg`);
}
