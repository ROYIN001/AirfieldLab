// Cost of candidate additions per deriv call: 20-strip wing (blade-element-like strip loop) and a bilinear 2-D table lookup.
const now = () => Number(process.hrtime.bigint()) / 1e3;
const NS = 20, y = new Float64Array(NS), c = new Float64Array(NS), out = new Float64Array(6);
for (let i = 0; i < NS; i++) { y[i] = -5.1 + 10.2 * (i + 0.5) / NS; c[i] = 1.65; }
const clTab = new Float64Array(64); for (let i = 0; i < 64; i++) clTab[i] = Math.sin(i / 10);
function strips(u, v, w, p, q, r) {
  let F = 0, L = 0, N = 0;
  for (let i = 0; i < NS; i++) { const wl = w + p * y[i], ul = u - r * y[i]; const a = Math.atan2(wl, ul); const V2 = ul * ul + wl * wl;
    const t = Math.min(62.999, Math.max(0, (a + 0.3) * 60)), k = t | 0, f = t - k; const cl = clTab[k] + (clTab[k + 1] - clTab[k]) * f;
    const dL = 0.6 * V2 * c[i] * 0.51 * cl; F += dL; L -= dL * y[i]; N += dL * 0.01 * y[i]; }
  out[0] = F; out[1] = L; out[2] = N; return out;
}
const J = [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2], B = [15, 20, 25, 30, 35, 40, 45, 50];
const T = J.map((j, i) => B.map((b, k) => Math.sin(i + k)));
function bilin(xs, ys, tab, x, yv) { let i = 0; while (i < xs.length - 2 && x > xs[i + 1]) i++; let k = 0; while (k < ys.length - 2 && yv > ys[k + 1]) k++;
  const fx = Math.min(1, Math.max(0, (x - xs[i]) / (xs[i + 1] - xs[i]))), fy = Math.min(1, Math.max(0, (yv - ys[k]) / (ys[k + 1] - ys[k])));
  return (tab[i][k] * (1 - fx) + tab[i + 1][k] * fx) * (1 - fy) + (tab[i][k + 1] * (1 - fx) + tab[i + 1][k + 1] * fx) * fy; }
function bench(name, fn, n = 2e6) { for (let i = 0; i < 1e5; i++) fn(i); const t0 = now(); let s = 0; for (let i = 0; i < n; i++) s += fn(i); const dt = (now() - t0) / n; return { name, 'µs/call': +dt.toFixed(4), sink: s > 0 }; }
console.table([
  bench('20-strip wing loop (atan2 + table)', (i) => strips(50, 0.5, 3 + (i & 7) * 0.1, 0.1, 0.02, 0.05)[0]),
  bench('bilinear CT(J, beta) lookup 12x8', (i) => bilin(J, B, T, (i & 255) / 120, 15 + (i & 31))),
]);
