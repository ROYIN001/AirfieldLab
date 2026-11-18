// rrev_atr72_modes.mjs — ผู้ตรวจทาน: คำนวณโหมดพลวัตแบบอิสระ (Nelson ch.4–5, stability axes, Ixz แบบ primed)
// ใช้ derivative ในตาราง 3.1.5.6 และ inertia สองชุดของส่วน 3.1.3; ไม่ใช้โค้ดของผู้วิจัย
const KT = 1852 / 3600, G = 9.80665;
const S = 61, b = 27.05, c = 2.339;
function charpoly(A) { const n = A.length; let M = A.map(r => r.map(() => 0)); const cs = [1];
  for (let k = 1; k <= n; k++) { const AM = A.map((r, i) => r.map((_, j) => r.reduce((s, _a, l) => s + A[i][l] * M[l][j], 0)));
    M = AM.map((r, i) => r.map((v, j) => v + (i === j ? cs[k - 1] : 0)));
    const AMk = A.map((r, i) => r.map((_, j) => r.reduce((s, _a, l) => s + A[i][l] * M[l][j], 0)));
    cs.push(-AMk.reduce((s, r, i) => s + r[i], 0) / k); }
  return cs; }
function roots(cs) { // Durand–Kerner
  const n = cs.length - 1; const a = cs.map(x => x / cs[0]); let z = Array.from({ length: n }, (_, k) => ({ re: Math.cos(2 * Math.PI * k / n + 0.4) * 1.3, im: Math.sin(2 * Math.PI * k / n + 0.4) * 1.3 }));
  const mul = (p, q) => ({ re: p.re * q.re - p.im * q.im, im: p.re * q.im + p.im * q.re }), sub = (p, q) => ({ re: p.re - q.re, im: p.im - q.im }), div = (p, q) => { const d = q.re * q.re + q.im * q.im; return { re: (p.re * q.re + p.im * q.im) / d, im: (p.im * q.re - p.re * q.im) / d }; };
  for (let it = 0; it < 2000; it++) z = z.map((zi, i) => { let pv = { re: 1, im: 0 }; for (let k = 1; k <= n; k++) pv = { re: mul(pv, zi).re + a[k], im: mul(pv, zi).im };
      let den = { re: 1, im: 0 }; z.forEach((zj, j) => { if (j !== i) den = mul(den, sub(zi, zj)); }); return sub(zi, div(pv, den)); });
  return z; }
const desc = z => z.map(r => { const wn = Math.hypot(r.re, r.im); return Math.abs(r.im) > 1e-6 ? { wn: +wn.toFixed(3), zeta: +(-r.re / wn).toFixed(3), T: +(2 * Math.PI / Math.abs(r.im)).toFixed(1) } : { real: +r.re.toFixed(4), tau: +(-1 / r.re).toFixed(2) }; });
function run(name, m, Vkt, rho, d, I, gamDeg, CD, CL) {
  const V = Vkt * KT, q = 0.5 * rho * V * V, qS = q * S;
  // longitudinal [u, w(α·V), q, θ]; Xu, Zu ไม่รวมผลแรงขับต่อความเร็ว (power-off approx) และรวมแบบ P = const (T = P/V)
  const th0 = gamDeg * Math.PI / 180 + 0; // body ~ flight path for small α (stability axes)
  const Xu = -2 * CD * qS / (m * V) - (CD * qS + m * G * Math.sin(th0)) / (m * V) * 1; // P const: dT/dV = -T/V, T ≈ D + W sinγ
  const Zu = -2 * CL * qS / (m * V);
  const Xa = (CL - d.CDa) * qS / m, Za = -(d.CLa + CD) * qS / m;
  const k = c / (2 * V), Iy = I.Iyy;
  const Ma = d.Cma * qS * c / Iy, Mad = d.Cmad * k * qS * c / Iy, Mq = d.Cmq * k * qS * c / Iy;
  const Zad = -d.CLad * k * qS / m, Zq = -d.CLq * k * qS / m;
  const den = 1 - Zad / V;
  // state x = [u, α, q, θ]
  const A = [
    [Xu, Xa, 0, -G * Math.cos(th0)],
    [Zu / (V * den), Za / (V * den), (1 + Zq / V) / den, -G * Math.sin(th0) / (V * den)],
    [0, 0, 0, 0], [0, 0, 1, 0]];
  A[2] = [Mad * A[1][0], Ma + Mad * A[1][1], Mq + Mad * A[1][2], Mad * A[1][3]];
  const lon = desc(roots(charpoly(A)));
  // lateral [β, p, r, φ]
  const kb = b / (2 * V), qSb = qS * b;
  const Yb = d.CYb * qS / m, Yr = d.CYr * kb * qS / m;
  let Lb = d.Clb * qSb / I.Ixx, Lp = d.Clp * kb * qSb / I.Ixx, Lr = d.Clr * kb * qSb / I.Ixx;
  let Nb = d.Cnb * qSb / I.Izz, Np = d.Cnp * kb * qSb / I.Izz, Nr = d.Cnr * kb * qSb / I.Izz;
  const g1 = 1 - I.Ixz ** 2 / (I.Ixx * I.Izz);
  const P = (L, N) => [(L + I.Ixz / I.Ixx * N) / g1, (N + I.Ixz / I.Izz * L) / g1];
  [Lb, Nb] = P(Lb, Nb); [Lp, Np] = P(Lp, Np); [Lr, Nr] = P(Lr, Nr);
  const B = [[Yb / V, 0, Yr / V - 1, G * Math.cos(th0) / V], [Lb, Lp, Lr, 0], [Nb, Np, Nr, 0], [0, 1, Math.tan(th0), 0]];
  const lat = desc(roots(charpoly(B)));
  return { name, lon, lat };
}
const dApp = { CLa: 5.6, CDa: 2 * 0.040 * 1.64 * 5.6, Cma: -1.74, Cmad: -11.5, Cmq: -54.4, CLad: 1.98, CLq: 8.5, CYb: -0.714, CYr: 0.617, Clb: -0.143, Clp: -0.60, Clr: 0.447, Cnb: 0.225, Cnp: -0.195, Cnr: -0.33 };
const dCru = { CLa: 6.0, CDa: 2 * 0.0313 * 0.467 * 6.0, Cma: -1.81, Cmad: -13.2, Cmq: -57.6, CLad: 2.28, CLq: 9.01, CYb: -0.714, CYr: 0.617, Clb: -0.143, Clp: -0.60, Clr: 0.162, Cnb: 0.225, Cnp: -0.052, Cnr: -0.33 };
const IB = { Ixx: 265800, Iyy: 789800, Izz: 1002000, Ixz: 33400 }, IG = { Ixx: 289900, Iyy: 298400, Izz: 573600, Ixz: 0 };
const rhoFL170 = 0.72183;
const res = [
  run('approach F30 111 kt 20.4 t, I build-up', 20400, 111, 1.225, dApp, IB, -3, 0.2096, 1.64),
  run('approach, I GE791', 20400, 111, 1.225, dApp, IG, -3, 0.2096, 1.64),
  run('cruise 275 KTAS FL170 21 t, I build-up', 21000, 275, rhoFL170, dCru, IB, 0, 0.0368, 0.467),
  run('cruise, I GE791', 21000, 275, rhoFL170, dCru, IG, 0, 0.0368, 0.467),
];
console.log(JSON.stringify(res, null, 1));
