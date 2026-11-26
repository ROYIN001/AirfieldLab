// hrev_a330_modes.mjs — ผู้ตรวจอิสระ (รอบที่ 3 หัวข้อ 4): คำนวณโหมดพลวัตซ้ำจากค่าใน JSON ของบัตร (ไม่ใช้ฟังก์ชัน build ของผู้เขียน)
// ตรวจ T-H-09, T-H-10, T-H-22 และตาราง 3.4.12.2 (รวม roll τ ที่การตรวจรอบก่อนยังไม่ได้ตรวจ)
// สมการ: แบบเชิงเส้นแยกแกนในแกน stability (Etkin/Nelson) ใช้ค่าอนุพันธ์จาก JSON ของบัตรโดยตรง
// รัน: node hrev_a330_modes.mjs
const g = 9.80665, KT = 0.514444, D2R = Math.PI / 180;
const S = 361.6, b = 60.3, c = 7.27;
// ── ตัวแก้ค่าเฉพาะ: QR แบบ Hessenberg อย่างง่ายผ่านพหุนามลักษณะเฉพาะ + Durand–Kerner ──
function charPoly(A) { // Faddeev–LeVerrier
  const n = A.length, I = A.map((r, i) => r.map((_, j) => +(i === j)));
  let M = I.map(r => r.slice()); const cf = [1];
  for (let k = 1; k <= n; k++) {
    const AM = A.map((r, i) => r.map((_, j) => r.reduce((s, _x, l) => s + A[i][l] * M[l][j], 0)));
    const ck = -AM.reduce((s, r, i) => s + r[i], 0) / k; cf.push(ck);
    M = AM.map((r, i) => r.map((v, j) => v + (i === j ? ck : 0)));
  }
  return cf;
}
const cm = (a, b2) => [a[0] * b2[0] - a[1] * b2[1], a[0] * b2[1] + a[1] * b2[0]];
const cd = (a, b2) => { const d = b2[0] ** 2 + b2[1] ** 2; return [(a[0] * b2[0] + a[1] * b2[1]) / d, (a[1] * b2[0] - a[0] * b2[1]) / d]; };
function roots(cf) {
  const n = cf.length - 1; let z = Array.from({ length: n }, (_, k) => [0.4 * Math.cos(2.1 * k + 0.3), 0.9 * Math.sin(2.1 * k + 0.3)]);
  for (let it = 0; it < 2000; it++) {
    z = z.map((zi, i) => {
      let p = [1, 0]; for (let k = 1; k <= n; k++) p = [cm(p, zi)[0] + cf[k], cm(p, zi)[1]];
      let den = [1, 0]; z.forEach((zj, j) => { if (j !== i) den = cm(den, [zi[0] - zj[0], zi[1] - zj[1]]); });
      const d = cd(p, den); return [zi[0] - d[0], zi[1] - d[1]];
    });
  }
  return z;
}
const mode = r => { const wn = Math.hypot(r[0], r[1]); return { re: +r[0].toFixed(5), im: +r[1].toFixed(5), wn: +wn.toFixed(4), zeta: +(-r[0] / wn).toFixed(4), T_s: Math.abs(r[1]) > 1e-6 ? +(2 * Math.PI / Math.abs(r[1])).toFixed(2) : null }; };
// ── ISA ──
function isa(h) { const T = 288.15 - 0.0065 * Math.min(h, 11000); let p = 101325 * (T / 288.15) ** 5.25588; if (h > 11000) p *= Math.exp(-g * (h - 11000) / (287.053 * 216.65)); const Tt = h > 11000 ? 216.65 : T; return { rho: p / (287.053 * Tt), a: Math.sqrt(1.4 * 287.053 * Tt), p }; }
// ── ค่าจาก JSON ของบัตร ──
const I187 = { Ixx: 1.581e7, Iyy: 4.114e7, Izz: 5.413e7 };
const Iat = m => ({ Ixx: I187.Ixx * m / 187000, Iyy: I187.Iyy * m / 187000, Izz: I187.Izz * m / 187000 });
const D = {
  approach: { CLa: 5.072, Cma: -0.963, Cmq: -24.0, Cmadot: -6.06, CLq: 5.55, CLadot: 1.54,
    CYb: -0.505, CYp: 0.040, CYr: 0.314, Clb: -0.201, Clp: -0.483, Clr: 0.265, Cnb: 0.046, Cnp: -0.150, Cnr: -0.197 },
  cruise: { CLa: 6.654, Cma: -1.072, Cmq: -30.2, Cmadot: -10.18, CLq: 6.98, CLadot: 2.59,
    CYb: -0.547, CYp: 0.064, CYr: 0.350, Clb: -0.176, Clp: -0.638, Clr: 0.145, Cnb: 0.064, Cnp: -0.091, Cnr: -0.171 },
};
function run(name, d, rho, V, m, CL, CD, CDa, alpha, withZq) {
  const q = 0.5 * rho * V * V, I = Iat(m);
  // ── ตามยาว (แกน stability, สถานะ u, w, q, θ) ──
  const Xu = -2 * CD * q * S / (m * V), Xw = (CL - CDa) * q * S / (m * V);
  const Zu = -2 * CL * q * S / (m * V), Zw = -(d.CLa + CD) * q * S / (m * V);
  const Zwd = -d.CLadot * c * q * S / (2 * m * V * V), Zq = withZq ? -d.CLq * c * q * S / (2 * m * V) : 0;
  const Mw = d.Cma * q * S * c / (I.Iyy * V), Mwd = d.Cmadot * c * c * q * S / (2 * I.Iyy * V * V), Mq = d.Cmq * c * c * q * S / (2 * I.Iyy * V);
  const k1 = 1 / (1 - Zwd);
  const Alon = [[Xu, Xw, 0, -g], [Zu * k1, Zw * k1, (V + Zq) * k1, 0],
    [Mwd * Zu * k1, Mw + Mwd * Zw * k1, Mq + Mwd * (V + Zq) * k1, 0], [0, 0, 1, 0]];
  const lon = roots(charPoly(Alon)).filter(r => r[1] >= 0).map(mode).sort((x, y) => y.wn - x.wn);
  const nAl = d.CLa * q * S / (m * g);
  // ── ด้านข้าง: inertia แปลงเป็นแกน stability ที่ α ──
  const ca = Math.cos(alpha), sa = Math.sin(alpha);
  const Ixs = I.Ixx * ca * ca + I.Izz * sa * sa, Izs = I.Ixx * sa * sa + I.Izz * ca * ca, Ixz = (I.Ixx - I.Izz) * sa * ca; // body Ixz = 0
  const Lb = q * S * b * d.Clb / Ixs, Lp = q * S * b * b * d.Clp / (2 * Ixs * V), Lr = q * S * b * b * d.Clr / (2 * Ixs * V);
  const Nb = q * S * b * d.Cnb / Izs, Np = q * S * b * b * d.Cnp / (2 * Izs * V), Nr = q * S * b * b * d.Cnr / (2 * Izs * V);
  // Ixz ในสมการ: L = Ixx p' − Ixz r', N = Izz r' − Ixz p'  (Etkin, Ixz = ∫xz dm)
  // ข้อตกลงเครื่องหมาย: ที่นี่ Ixz_stab = (Ixx − Izz) sinα cosα (ลบเมื่อ Izz > Ixx) ตามที่ผู้เขียนใช้; ตรวจทั้งสองเครื่องหมายเพื่อดูความไว
  const lat = sgn => {
    const J = sgn * Ixz, den = 1 - J * J / (Ixs * Izs);
    const P = (Lx, Nx) => [(Lx + J / Ixs * Nx) / den, (Nx + J / Izs * Lx) / den];
    const [Lbp, Nbp] = P(Lb, Nb), [Lpp, Npp] = P(Lp, Np), [Lrp, Nrp] = P(Lr, Nr);
    const Yb = q * S * d.CYb / m, Yp = q * S * b * d.CYp / (2 * m * V), Yr = q * S * b * d.CYr / (2 * m * V);
    const A = [[Yb / V, Yp / V, -(1 - Yr / V), g * Math.cos(0) / V], [Lbp, Lpp, Lrp, 0], [Nbp, Npp, Nrp, 0], [0, 1, 0, 0]];
    const r = roots(charPoly(A));
    const dr = r.filter(x => x[1] > 0.05).map(mode)[0];
    const reals = r.filter(x => Math.abs(x[1]) <= 0.05).map(x => x[0]).sort((x, y) => x - y);
    return { dr, roll_tau_s: +(-1 / reals[0]).toFixed(3), spiral_lambda: +reals[1].toFixed(4), spiral_T_s: +(Math.log(2) / Math.abs(reals[1])).toFixed(1) };
  };
  const roll1 = -1 / (q * S * b * b * d.Clp / (2 * Ixs * V));
  console.log(`\n== ${name} ==  V ${(V / KT).toFixed(1)} kt TAS, q ${q.toFixed(0)} Pa, CL ${CL.toFixed(4)}, α ${(alpha / D2R).toFixed(2)}°`);
  console.log(' short period', lon[0], ' CAP', +(lon[0].wn ** 2 / nAl).toFixed(4), ' n/α', +nAl.toFixed(3));
  console.log(' phugoid     ', lon[lon.length - 1]);
  console.log(' lateral (Ixz_stab sign as author)', JSON.stringify(lat(1)));
  console.log(' lateral (Ixz_stab opposite sign)  ', JSON.stringify(lat(-1)));
  console.log(' lateral (Ixz = 0)                 ', JSON.stringify((() => { const save = Ixz; return lat(0); })()));
  console.log(' roll τ single-DOF −1/Lp (Ixx_stab)', +roll1.toFixed(3), ' (Ixx body)', +(-1 / (q * S * b * b * d.Clp / (2 * I.Ixx * V))).toFixed(3));
}
// approach FULL 187 t: VAPP = 1.23 VS1g + 5 (CLmax 2.45) = 143.99 kt; CL ตาม L = W (เหมือนสคริปต์โหมดของผู้เขียน) และ CD ตามโมเดลต่อ CONF
{
  const m = 187000, Vkt = 1.23 * Math.sqrt(2 * m * g / (1.225 * S * 2.45)) / KT + 5, V = Vkt * KT, q = 0.5 * 1.225 * V * V;
  const CL = m * g / (q * S), K = 0.0452, CD = 0.022 + 0.050 + 0.014 + K * CL * CL, CDa = 2 * K * CL * 5.072;
  const alpha = (CL - 1.001) / (5.072 * D2R) * D2R;
  run('approach FULL 187 t (no Zq)', D.approach, 1.225, V, m, CL, CD, CDa, alpha, false);
  run('approach FULL 187 t (with Zq = CLq term)', D.approach, 1.225, V, m, CL, CD, CDa, alpha, true);
}
// cruise QF72: 185,280 kg, FL370, M0.82, α 2.5°
{
  const at = isa(37000 * 0.3048), m = 185280, V = 0.82 * at.a, q = 0.5 * at.rho * V * V, CL = m * g / (q * S);
  const tc = 0.11, cs = Math.cos(29.7 * D2R), Mcrit = 0.95 / cs - tc / cs ** 2 - 0.1 * CL / cs ** 3 - 0.108;
  const CD = 0.022 + 0.041 * CL * CL + 20 * Math.max(0, 0.82 - Mcrit) ** 4, CDa = 2 * 0.041 * CL * 6.654;
  run('cruise M0.82 FL370 185.3 t (no Zq)', D.cruise, at.rho, V, m, CL, CD, CDa, 2.5 * D2R, false);
  run('cruise M0.82 FL370 185.3 t (with Zq)', D.cruise, at.rho, V, m, CL, CD, CDa, 2.5 * D2R, true);
}

// ── ส่วนเพิ่ม: กรณี "ใส่ค่าในโค้ดตรง ๆ" — src/20-flight.js ใช้ Cl/Cn กับอัตรา p, r ในแกนตัวเครื่อง (body) และ AC.Ixz ของแกนตัวเครื่อง
// ถ้าคัดลอก derivative (ซึ่งผู้เขียนคิดในแกน stability) ไปใส่ AC ตรง ๆ พร้อม Ixz = 0 ตาม JSON จะได้ระบบนี้
function bodyNaive(name, d, rho, V, m, alpha, theta) {
  const q = 0.5 * rho * V * V, I = Iat(m);
  const Lb = q * S * b * d.Clb / I.Ixx, Lp = q * S * b * b * d.Clp / (2 * I.Ixx * V), Lr = q * S * b * b * d.Clr / (2 * I.Ixx * V);
  const Nb = q * S * b * d.Cnb / I.Izz, Np = q * S * b * b * d.Cnp / (2 * I.Izz * V), Nr = q * S * b * b * d.Cnr / (2 * I.Izz * V);
  const Yb = q * S * d.CYb / m, Yp = q * S * b * d.CYp / (2 * m * V), Yr = q * S * b * d.CYr / (2 * m * V);
  const A = [[Yb / V, Yp / V + Math.sin(alpha), Yr / V - Math.cos(alpha), g * Math.cos(theta) / V], [Lb, Lp, Lr, 0], [Nb, Np, Nr, 0], [0, 1, Math.tan(theta), 0]];
  const r = roots(charPoly(A));
  const dr = r.filter(x => x[1] > 0.05).map(mode)[0];
  const reals = r.filter(x => Math.abs(x[1]) <= 0.05).map(x => x[0]).sort((x, y) => x - y);
  console.log(`\n== ${name}: derivative ในแกน stability ใส่เป็นแกน body ตรง ๆ, Ixz_body = 0 ==`);
  console.log(' ', JSON.stringify({ dr, roll_tau_s: +(-1 / reals[0]).toFixed(3), spiral_lambda: +reals[1].toFixed(4) }));
}
// แปลง derivative stability → body (หมุนรอบแกน y ด้วย α): [L_b; N_b] = [[cα, −sα],[sα, cα]] [L_s; N_s], [p_s; r_s] = [[cα, sα],[−sα, cα]] [p_b; r_b]
function toBody(d, a) {
  const ca = Math.cos(a), sa = Math.sin(a);
  const Ls = { b: d.Clb, p: d.Clp, r: d.Clr }, Ns = { b: d.Cnb, p: d.Cnp, r: d.Cnr };
  // moment coefficients in stability axes as function of body rates: p_s = ca p + sa r, r_s = −sa p + ca r
  const Ls_pb = Ls.p * ca - Ls.r * sa, Ls_rb = Ls.p * sa + Ls.r * ca, Ns_pb = Ns.p * ca - Ns.r * sa, Ns_rb = Ns.p * sa + Ns.r * ca;
  return { ...d,
    Clb: ca * Ls.b - sa * Ns.b, Cnb: sa * Ls.b + ca * Ns.b,
    Clp: ca * Ls_pb - sa * Ns_pb, Clr: ca * Ls_rb - sa * Ns_rb,
    Cnp: sa * Ls_pb + ca * Ns_pb, Cnr: sa * Ls_rb + ca * Ns_rb,
    CYp: d.CYp * ca - d.CYr * sa, CYr: d.CYp * sa + d.CYr * ca };
}
function bodyProper(name, d, rho, V, m, alpha, theta) {
  const db = toBody(d, alpha); const q = 0.5 * rho * V * V, I = Iat(m);
  const Ixz = 0; // body
  const Lb = q * S * b * db.Clb / I.Ixx, Lp = q * S * b * b * db.Clp / (2 * I.Ixx * V), Lr = q * S * b * b * db.Clr / (2 * I.Ixx * V);
  const Nb = q * S * b * db.Cnb / I.Izz, Np = q * S * b * b * db.Cnp / (2 * I.Izz * V), Nr = q * S * b * b * db.Cnr / (2 * I.Izz * V);
  const Yb = q * S * db.CYb / m, Yp = q * S * b * db.CYp / (2 * m * V), Yr = q * S * b * db.CYr / (2 * m * V);
  const A = [[Yb / V, Yp / V + Math.sin(alpha), Yr / V - Math.cos(alpha), g * Math.cos(theta) / V], [Lb, Lp, Lr, 0], [Nb, Np, Nr, 0], [0, 1, Math.tan(theta), 0]];
  const r = roots(charPoly(A));
  const dr = r.filter(x => x[1] > 0.05).map(mode)[0];
  const reals = r.filter(x => Math.abs(x[1]) <= 0.05).map(x => x[0]).sort((x, y) => x - y);
  console.log(`== ${name}: แปลง derivative เป็นแกน body ก่อน (Ixz_body = 0) ==`);
  console.log(' ', JSON.stringify({ dr, roll_tau_s: +(-1 / reals[0]).toFixed(3), spiral_lambda: +reals[1].toFixed(4) }), ' body derivs', JSON.stringify(Object.fromEntries(['Clb', 'Cnb', 'Clp', 'Clr', 'Cnp', 'Cnr'].map(k => [k, +db[k].toFixed(4)]))));
}
{
  const m = 187000, Vkt = 1.23 * Math.sqrt(2 * m * g / (1.225 * S * 2.45)) / KT + 5, V = Vkt * KT, q = 0.5 * 1.225 * V * V, CL = m * g / (q * S);
  const alpha = (CL - 1.001) / (5.072 * D2R) * D2R, theta = alpha - 3 * D2R;
  bodyNaive('approach FULL 187 t', D.approach, 1.225, V, m, alpha, theta);
  bodyProper('approach FULL 187 t', D.approach, 1.225, V, m, alpha, theta);
  const at = isa(37000 * 0.3048), mc = 185280, Vc = 0.82 * at.a;
  bodyNaive('cruise M0.82 FL370', D.cruise, at.rho, Vc, mc, 2.5 * D2R, 2.5 * D2R);
  bodyProper('cruise M0.82 FL370', D.cruise, at.rho, Vc, mc, 2.5 * D2R, 2.5 * D2R);
}
