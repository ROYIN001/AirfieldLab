// brev_b737.mjs — independent reviewer re-computation for 02-b737-800.md (round 3, topic 3.2).
// Written from the equations stated in the report, not copied from b_*.mjs. Run: node brev_b737.mjs
const g = 9.80665, KT = 1852 / 3600, LB = 0.45359237, IN = 0.0254, FT = 0.3048, DEG = Math.PI / 180, LBF = 4.4482216152605;
const R = 287.05287, GAM = 1.4;
const r = (x, n = 3) => Number(x.toFixed(n));
const out = {};
// ---- USSA-1976 troposphere (h geopotential ≈ geometric below 11 km for this check)
const isa = (h, dT = 0) => { const T0 = 288.15 - 0.0065 * h; const p = 101325 * Math.pow(T0 / 288.15, g / (0.0065 * R)); const T = T0 + dT; return { p, T, rho: p / (R * T), a: Math.sqrt(GAM * R * T) }; };
const rho0 = isa(0).rho;
out.rho0 = r(rho0, 4);
// ---- 1. unit conversions (T-B-25)
out.kg = Object.fromEntries([174900, 174700, 174200, 172500, 155500, 146300, 144000, 138300, 136000, 91300, 143654].map(x => [x, r(x * LB, 1)]));
// ---- 2. Vref fits (T-B-01..03)
const S = 124.6, b = 34.32, bW = 35.79, c = 4.17, A = b * b / S;
const fit = pts => pts.reduce((s, [m, v]) => s + v * Math.sqrt(m), 0) / pts.reduce((s, [m]) => s + m, 0);
const k40 = fit([[76400, 149], [66400, 139]]), k30 = fit([[144000 * LB, 143]]);
out.k40 = r(k40, 5); out.k30 = r(k30, 5);
out.Vref40_76400 = r(k40 * Math.sqrt(76400), 2); out.Vref40_66400 = r(k40 * Math.sqrt(66400), 2); out.Vref30_65317 = r(k30 * Math.sqrt(65317), 2);
const CLat = k => 2 * g / (rho0 * S * (k * KT) ** 2);
const CLmax40 = CLat(k40) * 1.23 ** 2, CLmax30 = CLat(k30) * 1.23 ** 2;
out.CLref = { 40: r(CLat(k40)), 30: r(CLat(k30)) }; out.CLmax = { 40: r(CLmax40), 30: r(CLmax30) };
const VS = (m, CL) => Math.sqrt(2 * m * g / (rho0 * S * CL)) / KT;
// flap manoeuvre speeds: Vman = Vref40(60 t) + add = 1.33 VS1g(flap)
const v40_60 = k40 * Math.sqrt(60000);
const CLman = add => 2 * 60000 * g / (rho0 * S * ((v40_60 + add) / 1.33 * KT) ** 2);
const CLm = { 0: CLman(70), 1: CLman(50), 5: CLman(30), 15: CLman(20), 30: CLmax30, 40: CLmax40 };
CLm[2] = CLm[1] + (CLm[5] - CLm[1]) * (2 - 1) / 4; CLm[10] = (CLm[5] + CLm[15]) / 2; CLm[25] = CLm[15] + (CLm[30] - CLm[15]) * 10 / 15;
out.CLmax_all = Object.fromEntries(Object.entries(CLm).map(([k, v]) => [k, r(v)]));
out.VS1g_60t = Object.fromEntries(Object.entries(CLm).map(([k, v]) => [k, r(VS(60000, v), 1)]));
out.VS1g_66361 = Object.fromEntries(Object.entries(CLm).map(([k, v]) => [k, r(VS(66361, v), 1)]));
out.VS1g_79015 = Object.fromEntries(Object.entries(CLm).map(([k, v]) => [k, r(VS(79015, v), 1)]));
out.VSR_F5_76400 = r(VS(76400, CLm[5]), 2); out.V2_over_VSR_F5 = r(158 / VS(76400, CLm[5]), 3); out.V2_over_VSR_F1 = r(158 / VS(76400, CLm[1]), 3);
out.Vref_MLW = { 30: r(k30 * Math.sqrt(66361), 1), 40: r(k40 * Math.sqrt(66361), 1) };
out.Vref_tbl = [40000, 45000, 50000, 55000, 60000, 65000, 66361, 70000, 75000, 79015].map(m => [m, r(k30 * Math.sqrt(m), 1), r(k40 * Math.sqrt(m), 1)]);
// ---- 3. lift slope (Helmbold / Raymer 12.6) and tail
const lam = 0.278, L4 = 25 * DEG;
const tanc2 = (Ar, t4, l) => t4 - (1 / Ar) * (1 - l) / (1 + l);
const helm = (Ar, tc2, M, F) => { const B2 = 1 - M * M; return 2 * Math.PI * Ar * F / (2 + Math.sqrt(4 + (Ar * Ar * B2 / 0.9025) * (1 + tc2 * tc2 / B2))); };
const aw = M => helm(A, tanc2(A, Math.tan(L4), lam), M, 0.98);
const Sh = 32.4, Ah = 5.54, lh = 17.68, eta = 0.9;
const at = M => helm(Ah, tanc2(Ah, Math.tan(30 * DEG), 0.186), M, 1.0);
const hH = 5.565 - 2.4;
const KA = 1 / A - 1 / (1 + Math.pow(A, 1.7)), Kl = (10 - 3 * lam) / 7, KH = (1 - hH / b) / Math.cbrt(2 * lh / b);
const deda = M => 4.44 * Math.pow(KA * Kl * KH * Math.sqrt(Math.cos(L4)), 1.19) * aw(M) / aw(0);
const VH = Sh * lh / (S * c);
const atot = M => aw(M) + at(M) * eta * Sh / S * (1 - deda(M));
out.aero = { A: r(A), aw02: r(aw(0.2)), aw0785: r(aw(0.785)), at02: r(at(0.2)), deda02: r(deda(0.2)), deda0785: r(deda(0.785)), VH: r(VH), atot02: r(atot(0.2)), atot05: r(atot(0.5)), atot0785: r(atot(0.785)) };
// ---- 4. approach CL, CL0, alpha_CLmax, legacy Cm0
const a = atot(0.2);
const CLapp = (k, m) => 2 * m * g / (rho0 * S * ((k * Math.sqrt(m) + 5) * KT) ** 2);
const CL30 = CLapp(k30, 60000), CL40 = CLapp(k40, 60000);
const CL0_30 = CL30 - a * 5.4 * DEG, CL0_40 = CL40 - a * 4.4 * DEG;
out.app = { CL30: r(CL30), CL40: r(CL40), CL30_45t: r(CLapp(k30, 45000)), CL30_MLW: r(CLapp(k30, 66361)), CL0_30: r(CL0_30), CL0_40: r(CL0_40), V30p5: r(k30 * Math.sqrt(60000) + 5, 1), V40p5: r(k40 * Math.sqrt(60000) + 5, 1) };
const CL0 = { 0: 0.2, 40: CL0_40 }; const fr = { 1: 0.1, 2: 0.15, 5: 0.27, 10: 0.4, 15: 0.52, 25: 0.68 };
for (const [d, x] of Object.entries(fr)) CL0[d] = 0.2 + x * (CL0_40 - 0.2); CL0[30] = CL0_30;
out.CL0 = Object.fromEntries(Object.entries(CL0).map(([k, v]) => [k, r(v)]));
out.alphaCLmax = Object.fromEntries(Object.keys(CLm).map(d => [d, r((CLm[d] - CL0[d]) / a / DEG, 1)]));
// ---- 5. cruise trim and drag (T-B-11), L/D max (T-B-12), wave drag (T-B-13)
const atm350 = isa(35000 * FT);
const Vc = 0.785 * atm350.a, qc = 0.5 * atm350.rho * Vc * Vc, CLc = 65000 * g / (qc * S);
const cs = Math.cos(L4);
const Mcrit = CL => 0.95 / cs - 0.12 / cs ** 2 - 0.1 * CL / cs ** 3 - 0.108;
const dCDw = (M, CL) => 20 * Math.max(0, M - Mcrit(CL)) ** 4;
const CDc = 0.019 + 0.042 * CLc * CLc + dCDw(0.785, CLc);
out.cruise = { rho: r(atm350.rho, 5), a: r(atm350.a, 2), CL: r(CLc), alpha_deg: r((CLc - 0.2) / atot(0.785) / DEG, 2), drag_kN: r(CDc * qc * S / 1000, 2), LD: r(CLc / CDc, 2) };
out.LDmax = r(0.5 / Math.sqrt(0.019 * 0.042), 2); out.CL_LDmax = r(Math.sqrt(0.019 / 0.042), 3);
out.Mcrit05 = r(Mcrit(0.5), 4); out.wave = [0.7, 0.76, 0.78, 0.785, 0.8, 0.82, 0.84].map(M => [M, r(dCDw(M, 0.5), 6)]);
// ---- 6. approach drag, thrust (T-B-10)
const dCD0 = d => 0.059 * Math.sin(d * DEG) ** 2 / Math.sin(40 * DEG) ** 2 + (d > 0 ? 0.003 : 0);
const Kd = d => 1 / (1 / 0.042 + Math.PI * A * 0.0026 * d);
const CD30 = 0.019 + dCD0(30) + 0.017 + Kd(30) * CL30 ** 2, CD40 = 0.019 + dCD0(40) + 0.017 + Kd(40) * CL40 ** 2;
const T = (CL, CD) => 60000 * g * (CD / CL * Math.cos(3 * DEG) - Math.sin(3 * DEG)) / 1000;
out.approach = { CD30: r(CD30, 4), LD30: r(CL30 / CD30, 2), T30_kN: r(T(CL30, CD30), 1), CD40: r(CD40, 4), LD40: r(CL40 / CD40, 2), T40_kN: r(T(CL40, CD40), 1), dCD0_30: r(dCD0(30), 4), dCD0_40: r(dCD0(40), 4), K30: r(Kd(30), 4), K40: r(Kd(40), 4) };
out.gear_MairBirdsall = r(79000 * g / S * 3.16e-5 * Math.pow(79000, -0.215), 4);
out.flap_McCormick40 = r(0.9 * Math.pow(0.15, 1.38) * 0.15 * Math.sin(40 * DEG) ** 2, 5);
// legacy Cm0/Cmflap (Cm = 0 at de = 0, out of ground effect where the code term -0.06(1-phiGE) vanishes)
const acr = (CLc - 0.2) / atot(0.785);
out.legacy = { Cm0: r(1.0 * acr, 3), Cmflap: r(1.0 * 4.4 * DEG - 1.0 * acr, 3), Cm0_author_minus_correct: r(0.104 - acr, 3) };
// ---- 7. inertia (T-B-14)
const wol = { m: 58094.312, Ixx: 1866711, Iyy: 3394953, Izz: 5097558, Ixz: 149140 }, Lf = 39.47, e = (b + Lf) / 2;
const Rx = 2 * Math.sqrt(wol.Ixx / wol.m) / b, Ry = 2 * Math.sqrt(wol.Iyy / wol.m) / Lf, Rz = 2 * Math.sqrt(wol.Izz / wol.m) / e;
const I = m => ({ Ixx: m * (Rx * b / 2) ** 2, Iyy: m * (Ry * Lf / 2) ** 2, Izz: m * (Rz * e / 2) ** 2, Ixz: wol.Ixz * m / wol.m });
out.radii = { Rx: r(Rx), Ry: r(Ry), Rz: r(Rz) };
out.I_MLW = Object.fromEntries(Object.entries(I(66361)).map(([k, v]) => [k, Math.round(v)]));
out.jsb_SI = [562000, 1.473e6, 1.894e6, 8000].map(x => Math.round(x * 14.593903 * FT * FT));
// ---- 8. modes: approximate formulas AND full 4x4 linear models (T-B-15..18)
function eig4(Am) { // eigenvalues of 4x4 via characteristic polynomial + Durand-Kerner
  const n = 4; const M = Am.map(r => r.slice());
  // Faddeev-LeVerrier
  let Mk = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
  const cf = [1]; let ck = 1;
  const mul = (X, Y) => X.map((row, i) => Y[0].map((_, j) => row.reduce((s, _, k) => s + X[i][k] * Y[k][j], 0)));
  let AM = mul(M, Mk);
  for (let k = 1; k <= n; k++) {
    if (k > 1) { const t = Mk.map((row, i) => row.map((v, j) => AM[i][j] + (i === j ? cf[k - 1] : 0))); Mk = t; AM = mul(M, Mk); }
    const tr = AM.reduce((s, row, i) => s + row[i], 0); cf.push(-tr / k);
  }
  // roots of x^4 + cf1 x^3 + ...
  let z = [[0.4, 0.9], [-0.3, 0.7], [0.2, -1.1], [-0.6, -0.4]];
  const cmul = (p, q) => [p[0] * q[0] - p[1] * q[1], p[0] * q[1] + p[1] * q[0]], cdiv = (p, q) => { const d = q[0] * q[0] + q[1] * q[1]; return [(p[0] * q[0] + p[1] * q[1]) / d, (p[1] * q[0] - p[0] * q[1]) / d]; };
  const poly = x => cf.reduce((acc, c) => [acc[0] * 1, acc[1]] && [cmul(acc, x)[0] + c, cmul(acc, x)[1]], [0, 0]);
  for (let it = 0; it < 500; it++) z = z.map((zi, i) => { let den = [1, 0]; z.forEach((zj, j) => { if (j !== i) den = cmul(den, [zi[0] - zj[0], zi[1] - zj[1]]); }); const d = cdiv(poly(zi), den); return [zi[0] - d[0], zi[1] - d[1]]; });
  return z;
}
const desc = z => { const wn = Math.hypot(z[0], z[1]); return { re: r(z[0], 4), im: r(z[1], 4), wn: r(wn), zeta: r(-z[0] / wn), T: z[1] !== 0 ? r(2 * Math.PI / Math.abs(z[1]), 2) : null, tau: z[1] === 0 ? r(-1 / z[0], 2) : null }; };
const D = { CLa: 5.26, CLq: 8.0, CLad: 2.2, Cma: -1.0, Cmq: -37.4, Cmad: -9.2, CYb: -0.87, CYr: 0.43, Cnb: 0.167, Cnr: -0.272, Clp: -0.50, Clb: -0.247, Clr: 0.383, Cnp: -0.181, K: 0.0383, CD: 0.1545 };
function modes(m, V, rho, In, d, gam0 = -3 * DEG, alpha0 = 5.4 * DEG) {
  const q = 0.5 * rho * V * V, qS = q * S, CL = m * g * Math.cos(gam0) / qS;
  // approx
  const Ma = qS * c * d.Cma / In.Iyy, Za = -qS * (d.CLa + d.CD) / m, Mq = qS * c * c * d.Cmq / (2 * V * In.Iyy), Mad = qS * c * c * d.Cmad / (2 * V * In.Iyy);
  const wsp = Math.sqrt(-Ma + Za * Mq / V), zsp = -(Mq + Mad + Za / V) / (2 * wsp);
  const Nb = qS * b * d.Cnb / In.Izz, Nr = qS * b * b * d.Cnr / (2 * V * In.Izz), Yb = qS * d.CYb / m, Lp = qS * b * b * d.Clp / (2 * V * In.Ixx);
  const wdr = Math.sqrt(Nb + Yb * Nr / V), zdr = -(Nr + Yb / V) / (2 * wdr);
  const approx = { sp_wn: r(wsp), sp_zeta: r(zsp), dr_wn: r(wdr), dr_zeta: r(zdr), tauR: r(-1 / Lp, 2), ph_T: r(Math.PI * Math.SQRT2 * V / g, 1), ph_zeta: r(d.CD / CL / Math.SQRT2, 3) };
  // full longitudinal (stability axes, states u, alpha, q, theta), thrust independent of speed
  const CDa = 2 * d.K * CL * d.CLa;
  const Xu = -2 * d.CD * qS / (m * V), Xa = (CL - CDa) * qS / m, Zu = -2 * CL * qS / (m * V), Zad = -d.CLad * qS * c / (2 * m * V), Zq = -d.CLq * qS * c / (2 * m * V);
  const den = V - Zad;
  const Alon = [
    [Xu, Xa, 0, -g * Math.cos(gam0)],
    [Zu / den, Za / den, (V + Zq) / den, -g * Math.sin(gam0) / den],
    [Mad * Zu / den, Ma + Mad * Za / den, Mq + Mad * (V + Zq) / den, -Mad * g * Math.sin(gam0) / den],
    [0, 0, 1, 0]];
  const ev = eig4(Alon).sort((p, q2) => Math.hypot(...q2) - Math.hypot(...p));
  // full lateral (body axes at alpha0, states beta, p, r, phi), inertia coupling with Ixz
  const th0 = alpha0 + gam0, Yp = 0, Yr = qS * b * d.CYr / (2 * m * V);
  const Lb = qS * b * d.Clb, Lpp = qS * b * b * d.Clp / (2 * V), Lr = qS * b * b * d.Clr / (2 * V);
  const Nbb = qS * b * d.Cnb, Np = qS * b * b * d.Cnp / (2 * V), Nrr = qS * b * b * d.Cnr / (2 * V);
  // stability-axis derivatives rotated to body axes approximately ignored: derivatives taken as body-axis values
  const G = In.Ixx * In.Izz - In.Ixz * In.Ixz, i11 = In.Izz / G, i13 = In.Ixz / G, i33 = In.Ixx / G;
  const Lrow = [Lb, Lpp, Lr], Nrow = [Nbb, Np, Nrr];
  const pd = Lrow.map((v, k) => i11 * v + i13 * Nrow[k]), rd = Lrow.map((v, k) => i13 * v + i33 * Nrow[k]);
  const Alat = [
    [Yb / V, Yp / V + Math.sin(alpha0), Yr / V - Math.cos(alpha0), g * Math.cos(th0) / V],
    [pd[0], pd[1], pd[2], 0],
    [rd[0], rd[1], rd[2], 0],
    [0, 1, Math.tan(th0), 0]];
  const el = eig4(Alat);
  return { CL: r(CL), approx, lon_full: ev.map(desc), lat_full: el.map(desc) };
}
out.modes_app = modes(60000, 142.06 * KT, rho0, I(60000), D);
out.modes_app_ge_off_fullCD = 'see lon_full/lat_full';
out.spiral_crit = r(D.Clb * D.Cnr - D.Clr * D.Cnb, 4);
// ---- 9. VMCA (yaw balance), wake, tyres, stroke, %MAC, speeds
const yEng = 0.282 * b / 2;
const vmca = (Cndr, dr = 26 * DEG, Tn = 117e3) => Math.sqrt(2 * 1.1 * Tn * yEng / (rho0 * S * b * Math.abs(Cndr) * dr)) / KT;
out.vmca = { y: r(yEng), C0118: r(vmca(0.118), 1), C020: r(vmca(0.2), 1), limit_25149c_F5_MTOW: r(1.13 * VS(79015, CLm[5]), 1), V2min_45t_F5: r(1.13 * VS(45000, CLm[5]), 1) };
const atm1000 = (() => { const T = 304.15 - 0.0065 * 304.8; const p = isa(304.8).p; return { T, p, rho: p / (R * T), rho_31_at_1000: p / (R * 304.15) }; })();
out.rho_1000ft = { field31_lapse: r(atm1000.rho, 4), oat31_at_1000: r(atm1000.rho_31_at_1000, 4) };
const wake = (m, span, Vkt, rho) => { const b0 = Math.PI / 4 * span, G0 = m * g / (rho * Vkt * KT * b0); return { b0: r(b0, 2), G0: r(G0, 1), w0: r(G0 / (2 * Math.PI * b0), 3) }; };
out.wake = { W_MLW: wake(66361, bW, 142, 1.1262), noW_MLW: wake(66361, b, 142, 1.1262), W_60_SL: wake(60000, bW, 142.1, rho0) };
out.tyre = { main_ratio: r(174700 * 0.93 / 4 / 44700, 3), nose_ratio: r(174700 * 0.07 / 2 / 9650, 3), main_N: Math.round(44700 * LBF), nose_N: Math.round(9650 * LBF), kPa214: r(214 * 6.894757, 1), kPa200: r(200 * 6.894757, 1), kPa205: r(205 * 6.894757, 1), kPa185: r(185 * 6.894757, 1), mph225_mps: r(225 * 0.44704, 2) };
out.stroke = r((10 * FT) ** 2 / (2 * 9.81 * 0.8 * 1.5) - (0.47 / 0.8) * 0.08 + IN, 4);
out.static_defl_main_MLW = r(66361 * g * 0.93 / 2 / (120000 * LBF / FT), 4);
out.pctMAC = { 658.26: r((658.26 - 627.1) / 155.8 * 100, 3), 666.05: r((666.05 - 627.1) / 155.8 * 100, 3) };
out.TO_79015 = [152, 155, 158].map(v => r(v * Math.sqrt(79015 / 76400), 1));
out.LD_actual = { 1655: r(1655 * 0.6, 0), 1630: r(1630 * 0.6, 0) };
out.cat = v => v;
const cat = v => (v < 91 ? 'A' : v < 121 ? 'B' : v < 141 ? 'C' : v < 166 ? 'D' : 'E');
out.categories = { b142: cat(142), vref40: cat(k40 * Math.sqrt(66361)), vref30: cat(k30 * Math.sqrt(66361)) };
out.conv = { VMO: r(340 * KT, 1), VLE: r(320 * KT, 1), VLO: r(270 * KT, 1), VLOr: r(235 * KT, 1), VFE250: r(250 * KT, 1), VFE162: r(162 * KT, 1), ft41000: r(41000 * FT, 0), T26300_kN: r(26300 * LBF / 1000, 1), psi3000_MPa: r(3000 * 6.894757e-3, 2), fpm2415: r(12.27 / FT * 60, 0), kt_865: r(86.5 / KT, 1), kt_754: r(75.4 / KT, 1), kt_77: r(77 / KT, 1) };
console.log(JSON.stringify(out, null, 1));
