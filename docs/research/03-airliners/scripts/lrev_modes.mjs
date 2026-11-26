// Reviewer (หัวข้อ 3.3): independent linear-mode check using the derivative VALUES printed in the report
// (not the author's build-up), Nelson-type dimensional derivatives, own eigen solver (Newton identities + Durand-Kerner).
const g = 9.80665, KT = 0.514444, D = Math.PI / 180;
function charpoly(A) { // Newton identities: p_k = trace(A^k)
  const n = A.length, mul = (X, Y) => X.map((r, i) => Y[0].map((_, j) => r.reduce((s, v, k) => s + v * Y[k][j], 0)));
  let P = A, p = []; for (let k = 1; k <= n; k++) { p.push(P.reduce((s, r, i) => s + r[i], 0)); P = mul(P, A); }
  const c = [1]; for (let k = 1; k <= n; k++) { let s = p[k - 1]; for (let i = 1; i < k; i++) s += c[i] * p[k - 1 - i]; c.push(-s / k); }
  return c;
}
function roots(c) { const n = c.length - 1; let z = Array.from({ length: n }, (_, k) => [0.3 * Math.cos(2 * Math.PI * k / n + 0.4) + 0.05, 0.3 * Math.sin(2 * Math.PI * k / n + 0.4)]);
  const mul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]], div = (a, b) => { const d = b[0] ** 2 + b[1] ** 2; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; };
  for (let it = 0; it < 5000; it++) z = z.map((zi, i) => { let v = [c[0], 0]; for (let k = 1; k <= n; k++) v = [mul(v, zi)[0] + c[k], mul(v, zi)[1]]; let den = [1, 0]; z.forEach((zj, j) => { if (j !== i) den = mul(den, [zi[0] - zj[0], zi[1] - zj[1]]); }); const d = div(v, den); return [zi[0] - d[0], zi[1] - d[1]]; });
  return z; }
const desc = r => { const wn = Math.hypot(...r); return { re: +r[0].toFixed(4), im: +r[1].toFixed(4), wn: +wn.toFixed(3), zeta: +(-r[0] / wn).toFixed(3), T: r[1] ? +(2 * Math.PI / Math.abs(r[1])).toFixed(2) : null }; };
function lon(c) { const { m, V, rho, S, cb, Iyy, CL, CD, CLa, CDa, Cma, Cmq, Cmad, CLad } = c; const q = 0.5 * rho * V * V;
  const Xu = -2 * CD * q * S / (m * V), Xw = (CL - CDa) * q * S / (m * V), Zu = -2 * CL * q * S / (m * V), Zw = -(CLa + CD) * q * S / (m * V);
  const Zwd = -CLad * cb * q * S / (2 * m * V * V), Mw = Cma * q * S * cb / (Iyy * V), Mwd = Cmad * cb * cb * q * S / (2 * Iyy * V * V), Mq = Cmq * cb * cb * q * S / (2 * Iyy * V);
  const k = 1 / (1 - Zwd);
  const A = [[Xu, Xw, 0, -g], [Zu * k, Zw * k, V * k, 0], [Mwd * Zu * k, Mw + Mwd * Zw * k, Mq + Mwd * V * k, 0], [0, 0, 1, 0]];
  const r = roots(charpoly(A)).map(desc).filter(x => x.im >= 0).sort((a, b) => b.wn - a.wn);
  const nA = CLa * q * S / (m * g); return { sp: r[0], ph: r[r.length - 1], CAP: +(r[0].wn ** 2 / nA).toFixed(3) }; }
function lat(c) { const { m, V, rho, S, b, Ixx, Izz, al, CYb, CYp, CYr, Clb, Clp, Clr, Cnb, Cnp, Cnr } = c; const q = 0.5 * rho * V * V;
  const Ix = Ixx * Math.cos(al) ** 2 + Izz * Math.sin(al) ** 2, Iz = Ixx * Math.sin(al) ** 2 + Izz * Math.cos(al) ** 2, Ixz = (Ixx - Izz) * Math.sin(al) * Math.cos(al);
  const L = [Clb * q * S * b / Ix, Clp * q * S * b * b / (2 * Ix * V), Clr * q * S * b * b / (2 * Ix * V)], N = [Cnb * q * S * b / Iz, Cnp * q * S * b * b / (2 * Iz * V), Cnr * q * S * b * b / (2 * Iz * V)];
  const d = 1 - Ixz * Ixz / (Ix * Iz), Lp = L.map((x, i) => (x + Ixz / Ix * N[i]) / d), Np = N.map((x, i) => (x + Ixz / Iz * L[i]) / d);
  const A = [[CYb * q * S / (m * V), CYp * q * S * b / (2 * m * V * V), CYr * q * S * b / (2 * m * V * V) - 1, g / V], [Lp[0], Lp[1], Lp[2], 0], [Np[0], Np[1], Np[2], 0], [0, 1, 0, 0]];
  const r = roots(charpoly(A)).map(desc); const dr = r.filter(x => x.im > 0.05)[0], re = r.filter(x => Math.abs(x.im) <= 0.05).sort((a, b) => a.re - b.re);
  return { dr, roll_tau: +(-1 / re[0].re).toFixed(3), spiral: re[1].re, spiral_T: +(Math.log(2) / Math.abs(re[1].re)).toFixed(1) }; }
const base = { m: 64500, V: 133.5 * KT, rho: 1.225, S: 122.6, cb: 4.1935, b: 34.1 };
// A320 approach FULL, CG 30 %, values exactly as printed in the report tables / JSON
const K = 1 / (Math.PI * 9.485 * 0.70);
const appLon = { ...base, Iyy: 4.946e6, CL: 1.786, CD: 0.2381, CLa: 5.302, CDa: 2 * K * 1.786 * 5.302, Cma: -1.115, Cmq: -34.59, Cmad: -9.18, CLad: 2.19 };
const appLat = { ...base, Ixx: 1.749e6, Izz: 6.248e6, al: 4.5 * D, CYb: -0.719, CYp: 0.090, CYr: 0.503, Clb: -0.204, Clp: -0.509, Clr: 0.335, Cnb: 0.113, Cnp: -0.203, Cnr: -0.327 };
console.log('A320 approach lon', JSON.stringify(lon(appLon)));
console.log('A320 approach lat', JSON.stringify(lat(appLat)));
// cruise M0.78 FL350 65 t
const rhoc = 0.37956, Vc = 0.78 * 296.54, Kc = 0.0386, CLc = 0.512;
const cruLon = { m: 65000, V: Vc, rho: rhoc, S: 122.6, cb: 4.1935, Iyy: 4.985e6, CL: CLc, CD: 0.0182 + Kc * CLc ** 2 + 0.0006, CLa: 6.826, CDa: 2 * Kc * CLc * 6.826, Cma: -1.201, Cmq: -42.53, Cmad: -14.87, CLad: 3.54 };
const cruLat = { m: 65000, V: Vc, rho: rhoc, S: 122.6, b: 34.1, Ixx: 1.763e6, Izz: 6.297e6, al: 2.68 * D, CYb: -0.777, CYp: 0.119, CYr: 0.559, Clb: -0.176, Clp: -0.664, Clr: 0.179, Cnb: 0.141, Cnp: -0.125, Cnr: -0.296 };
console.log('A320 cruise lon', JSON.stringify(lon(cruLon)));
console.log('A320 cruise lat', JSON.stringify(lat(cruLat)));
// Sensitivity: vertical-tail term sign in Cnp / CYp (tail term size ~ 0.050 / 0.097 at approach)
for (const [lab, dCnp, dCYp] of [['Cnp tail term zero (Roskam-like small)', +0.028, -0.055], ['Cnp tail term sign flipped (geometric)', +0.099, -0.194]]) {
  console.log('sens', lab, JSON.stringify(lat({ ...appLat, Cnp: appLat.Cnp + dCnp, CYp: appLat.CYp + dCYp })));
}
