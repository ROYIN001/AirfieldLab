// Attitude kinematics q̇ = ½ q ⊗ [0, ω]: RK4 (as in Aircraft.step) vs first-order exponential map (JSBSim eBuss1) vs explicit Euler.
// ω(t) is a time-varying "rolling-pull" profile; reference = RK4 at 100 kHz. Also norm drift of RK4 without renormalisation.
const qmul = (a, b) => [a[0]*b[0]-a[1]*b[1]-a[2]*b[2]-a[3]*b[3], a[0]*b[1]+a[1]*b[0]+a[2]*b[3]-a[3]*b[2], a[0]*b[2]-a[1]*b[3]+a[2]*b[0]+a[3]*b[1], a[0]*b[3]+a[1]*b[2]-a[2]*b[1]+a[3]*b[0]];
const qexp = (v) => { const th = Math.hypot(...v); if (th < 1e-15) return [1, v[0]/2, v[1]/2, v[2]/2]; const s = Math.sin(th/2)/th; return [Math.cos(th/2), v[0]*s, v[1]*s, v[2]*s]; };
const norm = (q) => { const n = Math.hypot(...q); return q.map((v) => v / n); };
const w = (t) => [1.75 * Math.sin(1.2 * t), 0.5 + 0.3 * Math.cos(0.7 * t), 0.2 * Math.sin(2.1 * t)]; // rad/s: up to 100°/s roll
const f = (q, t) => { const W = w(t); return qmul(q, [0, W[0], W[1], W[2]]).map((v) => 0.5 * v); };
function rk4(dt, T, renorm = true) { let q = [1, 0, 0, 0], t = 0; const n = Math.round(T / dt); for (let i = 0; i < n; i++) {
  const k1 = f(q, t), k2 = f(q.map((v, j) => v + 0.5 * dt * k1[j]), t + dt / 2), k3 = f(q.map((v, j) => v + 0.5 * dt * k2[j]), t + dt / 2), k4 = f(q.map((v, j) => v + dt * k3[j]), t + dt);
  q = q.map((v, j) => v + dt / 6 * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j])); if (renorm) q = norm(q); t += dt; } return q; }
function expmap(dt, T, mid = false) { let q = [1, 0, 0, 0], t = 0; const n = Math.round(T / dt); for (let i = 0; i < n; i++) { const W = w(mid ? t + dt / 2 : t); q = qmul(q, qexp(W.map((v) => v * dt))); t += dt; } return q; }
function euler(dt, T) { let q = [1, 0, 0, 0], t = 0; const n = Math.round(T / dt); for (let i = 0; i < n; i++) { const d = f(q, t); q = norm(q.map((v, j) => v + dt * d[j])); t += dt; } return q; }
const ang = (a, b) => { const e = qmul([a[0], -a[1], -a[2], -a[3]], b); return 2 * Math.asin(Math.min(1, Math.hypot(e[1], e[2], e[3]))) * 180 / Math.PI; };
const T = 60, ref = rk4(1e-5, T);
const rows = [];
for (const hz of [60, 120, 240, 1000]) { const dt = 1 / hz;
  rows.push({ hz, 'RK4+norm err (deg)': ang(rk4(dt, T), ref).toExponential(2), 'exp-map ω(t) err': ang(expmap(dt, T), ref).toExponential(2), 'exp-map ω(t+dt/2) err': ang(expmap(dt, T, true), ref).toExponential(2), 'Euler+norm err': ang(euler(dt, T), ref).toExponential(2), '|q|-1 RK4 no renorm': (Math.hypot(...rk4(dt, T, false)) - 1).toExponential(2) }); }
console.table(rows);
