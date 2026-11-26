// hrev_a330.mjs — ผู้ตรวจอิสระ หัวข้อ 3.4 (A330-300): คำนวณซ้ำค่าที่ได้จากสมการโดยไม่ import สคริปต์ของผู้เขียน
// รัน: node hrev_a330.mjs  (Node >= 18, ไม่มี dependency)
const g = 9.80665, KT = 0.514444, FT = 0.3048, LB = 0.45359237, D2R = Math.PI / 180, R = 287.053, rho0 = 1.225, LBF = 4.4482216152605, PSI = 6894.757;
const f = (x, d = 3) => +x.toFixed(d);
const out = (k, v) => console.log(k.padEnd(46), typeof v === 'object' ? JSON.stringify(v) : v);
// ISA (troposphere + lower stratosphere)
function isa(h, dT = 0) {
  let T, p;
  if (h <= 11000) { T = 288.15 - 0.0065 * h; p = 101325 * (T / 288.15) ** (g / (R * 0.0065)); }
  else { T = 216.65; p = 22632.06 * Math.exp(-g * (h - 11000) / (R * T)); }
  T += dT; return { T, p, rho: p / (R * T), a: Math.sqrt(1.4 * R * T) };
}
const S = 361.6, b = 60.3, c = 7.27, L = 63.66;
const CLMAX = { CONF0: 1.26, CONF1: 1.80, 'CONF1+F': 2.10, CONF2: 2.24, CONF3: 2.32, FULL: 2.45 };
const vs = (m, cl, rho = rho0, s = S) => Math.sqrt(2 * m * g / (rho * s * cl)) / KT;
const CLat = (m, Vkt, s = S, rho = rho0) => m * g / (0.5 * rho * (Vkt * KT) ** 2 * s);

console.log('== 1. units ==');
out('lb: 242000/187000/171000/212000/174000', [242000, 187000, 171000, 212000, 174000].map(x => f(x / LB, 0)));
out('fuel kg, lb, USgal', [f(97530 * 0.785, 0), f(97530 * 0.785 / LB, 0), f(97530 / 3.785411784, 0)]);
out('S ft2, MAC in, AR, AR_jenk', [f(S / FT ** 2, 0), f(c / 0.0254, 1), f(b * b / S, 3), f(58 * 58 / 363.1, 3)]);
out('VMO, VFE FULL, VFE1, VLE m/s', [f(330 * KT, 2), f(180 * KT, 2), f(240 * KT, 2), f(250 * KT, 2)]);
out('VFE 215/205/196/186 m/s', [215, 205, 196, 186].map(v => f(v * KT, 1)));
out('235 mph m/s, kt; 204 kt m/s', [f(235 * 0.44704, 2), f(235 * 0.44704 / KT, 1), f(204 * KT, 2)]);
out('68500 lb kN; 223 psi kPa', [f(68500 * LB * g / 1000, 1), f(223 * PSI / 1000, 0)]);
out('ceiling 12500 m ft; 150 lbf N; 30 ft m', [f(12500 / FT, 0), f(150 * LBF, 0), f(30 * FT, 2)]);
out('FG k/c conversions', [137570.4, 53914.5, 53871.1, 39957.3].map(x => f(x * LBF / FT, 0)));
out('FG inertia kg m2 (slug ft2 -> )', [2375399, 5004014, 4408984].map(x => f(x * 14.5939029 * FT * FT, 0)));
out('FG emptywt kg; B747 kg', [f(214000 * LB, 0), f(523816 * LB, 0)]);
out('B747 I kg m2', [1.82e7, 3.31e7, 4.97e7, -970000].map(x => f(x * 14.5939029 * FT * FT, 0)));
out('WRAP 89.9/73/71.5 m/s -> kt; 8.82 m/s fpm', [f(89.9 / KT, 1), f(73 / KT, 1), f(71.5 / KT, 1), f(77.8 / KT, 1), f(102.1 / KT, 1), f(8.82 / 0.00508, 0)]);
out('Trent 71100 lbf kN', f(71100 * LBF / 1000, 1));

console.log('\n== 2. CLmax anchors ==');
out('Jenk Vapp136@179t CL (S361.6); x1.23^2', [f(CLat(179000, 136), 4), f(CLat(179000, 136) * 1.23 ** 2, 3)]);
out('if Vapp=VLS+5 -> CLmax', f(CLat(179000, 131) * 1.23 ** 2, 3));
out('Jenk V2 144@217t CL (361.6), x1.13^2; S363.1 x1.2^2', [f(CLat(217000, 144), 4), f(CLat(217000, 144) * 1.13 ** 2, 3), f(CLat(217000, 144, 363.1) * 1.44, 3)]);
out('Jenk Vapp CL S363.1 x1.3^2', f(CLat(179000, 136, 363.1) * 1.69, 3));
out('TSB V2 162@222.7t CL, x1.13^2', [f(CLat(222700, 162), 4), f(CLat(222700, 162) * 1.13 ** 2, 3)]);
out('cat C bound CLmax FULL > (VAT 141=1.23VS @187t)', f(CLat(187000, 141 / 1.23), 4));
out('CONF0 1.316 cos29.7/cos25', f(1.316 * Math.cos(29.7 * D2R) / Math.cos(25 * D2R), 4));

console.log('\n== 3. speed tables ==');
const masses = [130000, 150000, 170000, 187000, 210000, 242000];
for (const k of Object.keys(CLMAX)) out('VS1g ' + k, masses.map(m => f(vs(m, CLMAX[k]), 2)));
out('VLS CONF3 1.23', masses.map(m => f(1.23 * vs(m, CLMAX.CONF3), 2)));
out('VLS FULL 1.23', masses.map(m => f(1.23 * vs(m, CLMAX.FULL), 2)));
out('VAPP FULL', masses.map(m => f(1.23 * vs(m, CLMAX.FULL) + 5, 2)));
out('VAPP CONF3', masses.map(m => f(1.23 * vs(m, CLMAX.CONF3) + 5, 2)));
out('VLS FULL 179t', f(1.23 * vs(179000, CLMAX.FULL), 2));
for (const m of [180000, 200000, 222700, 242000]) out('V2min 1.13VS1g ' + m + ' 1+F/2/3', ['CONF1+F', 'CONF2', 'CONF3'].map(k => f(1.13 * vs(m, CLMAX[k]), 2)));
const V2t = 1.13 * 1.03 * vs(242000, CLMAX.CONF2);
out('V2 typical 1.13*1.03 VS1g CONF2 242t; VR, V1', [f(V2t, 2), f(V2t - 5, 2), f(V2t - 8.5, 2)]);
out('TSB V2/VS1g(1+F)@222.7t', f(162 / vs(222700, CLMAX['CONF1+F']), 4));
const VAPP = 1.23 * vs(187000, CLMAX.FULL) + 5;
out('VAPP187, VFE FULL - VAPP', [f(VAPP, 2), f(180 - VAPP, 2)]);

console.log('\n== 4. hot day + wake ==');
const rhoHot = 101325 / (R * 308.15);
const TAShot = VAPP * Math.sqrt(rho0 / rhoHot);
out('rho35C, VAPP TAS hot', [f(rhoHot, 4), f(TAShot, 2)]);
const b0 = Math.PI * b / 4;
const G = (m, Vtas_kt, rho) => m * g / (rho * Vtas_kt * KT * b0);
const G_isa = G(187000, VAPP, rho0), G_hot_sameTAS = G(187000, VAPP, rhoHot), G_hot_CAS = G(187000, TAShot, rhoHot), G_mtow = G(242000, V2t, rho0);
out('b0', f(b0, 3));
out('Gamma0 ISA, w0, t(b0)', [f(G_isa, 1), f(G_isa / (2 * Math.PI * b0), 3), f(b0 / (G_isa / (2 * Math.PI * b0)), 1)]);
out('Gamma0 35C with TAS=144 (author)', [f(G_hot_sameTAS, 1), f(G_hot_sameTAS / (2 * Math.PI * b0), 3)]);
out('Gamma0 35C with CAS 144 -> TAS', [f(G_hot_CAS, 1), f(G_hot_CAS / (2 * Math.PI * b0), 3)]);
out('Gamma0 MTOW V2 156.5 ISA', [f(G_mtow, 1), f(G_mtow / (2 * Math.PI * b0), 3)]);
out('RECAT 3/4/5/7 NM @140 kt s', [3, 4, 5, 7].map(n => f(n * 1852 / (140 * KT), 1)));

console.log('\n== 5. QF72 cruise ==');
const A = isa(37000 * FT), V = 0.82 * A.a, q = 0.5 * A.rho * V * V, CLc = 185280 * g / (q * S);
const qc = A.p * ((1 + 0.2 * 0.82 ** 2) ** 3.5 - 1), CAS = Math.sqrt(7 * 101325 / rho0 * ((qc / 101325 + 1) ** (2 / 7) - 1));
out('FL370 p, rho, a', [f(A.p, 0), f(A.rho, 4), f(A.a, 2)]);
out('TAS kt, q Pa, CL, EAS kt, CAS kt', [f(V / KT, 1), f(q, 0), f(CLc, 4), f(Math.sqrt(2 * q / rho0) / KT, 1), f(CAS / KT, 1)]);
const beta = Math.sqrt(1 - 0.82 ** 2);
out('CL0(M0.82) for alpha 2.5 w/ CLa 6.654; /(1/beta)', [f(CLc - 6.654 * 2.5 * D2R, 4), f((CLc - 6.654 * 2.5 * D2R) * beta, 4)]);
const CDc = 0.022 + 0.041 * CLc * CLc + 0.0002;
out('CD, L/D, drag kN', [f(CDc, 4), f(CLc / CDc, 2), f(q * S * CDc / 1000, 1)]);

console.log('\n== 6. Korn Mcrit / wave drag ==');
const Lam = 29.7 * D2R, mc = cl => 0.95 / Math.cos(Lam) - 0.11 / Math.cos(Lam) ** 2 - 0.1 * cl / Math.cos(Lam) ** 3 - 0.108;
const Mc = mc(0.5);
out('Mcrit CL0.5', f(Mc, 4));
out('CDw table M .74 .78 .80 .82 .84 .86 .88', [0.74, 0.78, 0.8, 0.82, 0.84, 0.86, 0.88].map(M => f(20 * Math.max(0, M - Mc) ** 4, 5)));
out('M at CDw=0.002 (Mcrit+0.1)', f(Mc + 0.1, 4));

console.log('\n== 7. build-up spot checks ==');
const ARw = b * b / S, lam = 0.251, tanL2 = Math.tan(Lam) - 4 / ARw * 0.25 * (1 - lam) / (1 + lam);
const helm = (AR, M, tanLh, k = 0.95) => { const B = Math.sqrt(1 - M * M); return 2 * Math.PI * AR / (2 + Math.sqrt((AR * B / k) ** 2 * (1 + tanLh ** 2 / B ** 2) + 4)); };
const aw = helm(ARw, 0.21, tanL2);
const tanL2t = Math.tan(30 * D2R) - 4 / 4.98 * 0.25 * (1 - 0.36) / (1 + 0.36);
const at = helm(4.98, 0.21, tanL2t);
out('a_w M0.21, a_t M0.21', [f(aw, 3), f(at, 3)]);
const VH = 72.9 * 28.6 / (S * c), VV = 45.2 * 27.5 / (S * b);
out('V_H, V_V', [f(VH, 4), f(VV, 4)]);
const CLa = aw + 0.9 * at * 72.9 / S * (1 - 0.278);
out('CLa (deda 0.278, eta 0.9)', f(CLa, 3));
out('Cma @28% (hn 0.470)', f(-5.072 * (0.47 - 0.28), 4));
out('Cma cruise @28% (hn 0.441, CLa 6.654)', f(-6.654 * (0.441 - 0.28), 4));
const CLq = 2 * 0.9 * at * VH;
out('CLq=2 eta a_t VH; CLadot; Cmadot', [f(CLq, 3), f(CLq * 0.278, 3), f(-CLq * 0.278 * 28.6 / c, 3)]);
out('Cmq tail only; x1.1', [f(-CLq * 28.6 / c, 2), f(-CLq * 28.6 / c * 1.1, 2)]);
const CLde = 0.9 * at * 0.5 * 72.9 / S;
out('CLde (tau .5), Cmde, CLih, Cmih', [f(CLde, 4), f(-CLde * 28.6 / c, 4), f(2 * CLde, 4), f(-2 * CLde * 28.6 / c, 4)]);
out('CLa vs Mach (wing+tail, deda/Mach not modelled) M0.2..0.86', [0.2, 0.4, 0.5, 0.6, 0.7, 0.76, 0.8, 0.82, 0.86].map(M => f(helm(ARw, M, tanL2), 3)));

console.log('\n== 8. inertia ==');
const e = (b + L) / 2;
for (const m of [130000, 170000, 187000, 205500, 242000]) out('I ' + m, [m * (0.305 * b / 2) ** 2, m * (0.466 * L / 2) ** 2, m * (0.549 * e / 2) ** 2].map(x => +x.toPrecision(4)));
out('187t slug ft2 (1e6)', [187000 * (0.305 * b / 2) ** 2, 187000 * (0.466 * L / 2) ** 2, 187000 * (0.549 * e / 2) ** 2].map(x => f(x / (14.5939029 * FT * FT) / 1e6, 2)));
out('FG radii Rx Ry Rz', [f(Math.sqrt(3221000 / 97069) / (b / 2), 3), f(Math.sqrt(6785000 / 97069) / (L / 2), 3), f(Math.sqrt(5978000 / 97069) / (e / 2), 3)]);
const b747 = 211.5 * FT; out('B747 Rx (b 64.47)', f(Math.sqrt(24676000 / 237600) / (b747 / 2), 3));
out('Ixz stab axes at alpha 5 deg (Ixx,Izz 187t)', f(0.5 * (187000 * (0.305 * b / 2) ** 2 - 187000 * (0.549 * e / 2) ** 2) * Math.sin(2 * 5 * D2R), 0));

console.log('\n== 9. approach trim FULL 187 t ==');
{ const V_ = VAPP * KT, q_ = 0.5 * rho0 * V_ * V_, gam = -3 * D2R, CL = 187000 * g * Math.cos(gam) / (q_ * S);
  const CL0F = 1.001, CLad = 5.072 * D2R, al = (CL - CL0F) / CLad, CD = 0.022 + 0.05 + 0.0452 * CL * CL + 0.014;
  const T = q_ * S * CD + 187000 * g * Math.sin(gam);
  out('CL, alpha, theta, CD, L/D, T kN, T/W, sink fpm', [f(CL, 4), f(al, 3), f(al - 3, 3), f(CD, 4), f(CL / CD, 3), f(T / 1000, 2), f(T / (187000 * g), 4), f(V_ * Math.sin(3 * D2R) / 0.00508, 1)]);
  const CLb = 187000 * g / (q_ * S), alb = (CLb - CL0F) / CLad, CDb = 0.022 + 0.05 + 0.0452 * CLb * CLb + 0.014;
  out('L=W variant: CL, alpha, CD, T kN', [f(CLb, 4), f(alb, 3), f(CDb, 4), f((q_ * S * CDb - 187000 * g * Math.sin(3 * D2R)) / 1000, 2)]);
  out('legacy drag K(CL-0.15)^2 at CL: CD', f(0.022 + 0.05 + 0.014 + 0.041 * (CL - 0.15) ** 2, 4));
  // short-period approximation (stick fixed) at approach for cross-check
  const Iyy = 187000 * (0.466 * L / 2) ** 2, m = 187000;
  const Za = -q_ * S * (5.072 + CD) / m, Ma = q_ * S * c * (-0.963) / Iyy, Mq = q_ * S * c * (-24.0) * c / (2 * V_) / Iyy, Mad = q_ * S * c * (-6.06) * c / (2 * V_) / Iyy;
  const wn2 = Za * Mq / V_ - Ma, wn = Math.sqrt(wn2), z = -(Mq + Mad + Za / V_) / (2 * wn);
  const nalpha = q_ * S * 5.072 / (m * g);
  out('SP approx approach wn, zeta, n/alpha, CAP', [f(wn, 3), f(z, 3), f(nalpha, 3), f(wn2 / nalpha, 3)]);
  out('Lanchester approach s', f(Math.PI * Math.SQRT2 * V_ / g, 2));
}
{ // cruise short period approx
  const m = 185280, Iyy = m * (0.466 * L / 2) ** 2, Za = -q * S * (6.654 + CDc) / m, Ma = q * S * c * (-1.072) / Iyy, Mq = q * S * c * (-30.2) * c / (2 * V) / Iyy, Mad = q * S * c * (-10.18) * c / (2 * V) / Iyy;
  const wn2 = Za * Mq / V - Ma, wn = Math.sqrt(wn2), z = -(Mq + Mad + Za / V) / (2 * wn), nalpha = q * S * 6.654 / (m * g);
  out('SP approx cruise wn, zeta, n/alpha, CAP', [f(wn, 3), f(z, 3), f(nalpha, 3), f(wn2 / nalpha, 4)]);
  out('Lanchester cruise s', f(Math.PI * Math.SQRT2 * V / g, 2));
}
out('DR period 2pi/wd approach, cruise', [f(2 * Math.PI / (0.5 * Math.sqrt(1 - 0.027 ** 2)), 2), f(2 * Math.PI / (0.656 * Math.sqrt(1 - 0.041 ** 2)), 2)]);
out('spiral T1/2 = ln2/0.037, ln2/0.012', [f(Math.LN2 / 0.037, 1), f(Math.LN2 / 0.012, 1)]);

console.log('\n== 10. TSB lift-off / V2 CONF2 / OEI ==');
out('TSB CL_req 221.2t 152kt; model 0.429+CLa*13.7', [f(CLat(221200, 152), 4), f(0.429 + 5.072 * D2R * 13.7, 4), f((0.429 + 5.072 * D2R * 13.7) / CLat(221200, 152), 4)]);
out('CL0 check CONF* = CLmax+0.1-CLa a*', Object.fromEntries([['CONF1', 20], ['CONF1+F', 20], ['CONF2', 19.5], ['CONF3', 18.5], ['FULL', 17.5]].map(([k, a]) => [k, f(CLMAX[k] + 0.1 - 5.072 * D2R * a, 3)])));
{ const CL = 2.24 / 1.13 ** 2, CD = 0.022 + 0.020 + 0.0440 * CL * CL, al = (CL - 0.614) / (5.072 * D2R);
  const Wt = 242000 * g;
  out('V2 CONF2: CL, alpha, CD, L/D', [f(CL, 4), f(al, 3), f(CD, 4), f(CL / CD, 3)]);
  out('OEI grad % static 316.3 kN; +0.005', [f((316300 / Wt - CD / CL) * 100, 3), f((316300 / Wt - (CD + 0.005) / CL) * 100, 3)]);
  out('OEI grad % with 0.85 lapse (as VMCA case)', [f((0.85 * 316300 / Wt - CD / CL) * 100, 3), f((0.85 * 316300 / Wt - (CD + 0.005) / CL) * 100, 3)]);
  out('lapse factor needed for 2.4% (no extra / +0.005)', [f((0.024 + CD / CL) * Wt / 316300, 3), f((0.024 + (CD + 0.005) / CL) * Wt / 316300, 3)]);
}

console.log('\n== 11. VMCA build-up check ==');
{ const N = 0.85 * 316300 * 9.40, dr = 30 * D2R;
  for (const Cndr of [-0.091, -0.101]) { const qv = N / (S * b * Math.abs(Cndr) * dr); out('VMCA Cndr ' + Cndr + ' (kt EAS)', f(Math.sqrt(2 * qv / rho0) / KT, 1)); }
  out('scale static (1/0.85), +10%', [f(122.2 / Math.sqrt(0.85), 1), f(122.2 / Math.sqrt(0.85) * Math.sqrt(1.1), 1)]);
  out('1.13 VSR 1+F 242t', f(1.13 * vs(242000, CLMAX['CONF1+F']), 1));
}

console.log('\n== 12. field lengths ==');
{ const tofl = 2320 * (242 / 217) ** 2 * (300 / 316.3), lfl = 1600 * 187 / 179, Vtd = (1.23 * vs(187000, CLMAX.FULL) - 3) * KT;
  out('TOFL m ft; -15%/+15%', [f(tofl, 1), f(tofl / FT, 0), f(tofl * 0.85, 0), f(tofl * 1.15, 0)]);
  out('LFL m ft; actual 187/179', [f(lfl, 1), f(lfl / FT, 0), f(lfl / 1.667, 1), f(1600 / 1.667, 1)]);
  out('Vtd kt, roll 1.7, 3.0; decel for roll 1003-300', [f(Vtd / KT, 2), f(Vtd ** 2 / 3.4, 0), f(Vtd ** 2 / 6, 0), f(Vtd ** 2 / (2 * (lfl / 1.667 - 300)), 2)]);
}

console.log('\n== 13. tyre + strut ==');
{ const per = 242900 * 0.94 / 8 / LB; out('per tyre lb, ratio, p psi, kPa, bar', [f(per, 0), f(per / 68500, 4), f(223 * per / 68500, 1), f(223 * per / 68500 * PSI / 1000, 0), f(223 * per / 68500 * PSI / 1e5, 2)]);
  const km = 137570.4 * LBF / FT, cm = 53914.5 * LBF / FT, kn = 53871.1 * LBF / FT, cn = 39957.3 * LBF / FT;
  for (const [mainShare, tag] of [[0.94, '94/6'], [0.92, '92/8']]) for (const m of [187000, 242000]) {
    const mm = m * mainShare / 2, mn = m * (1 - mainShare);
    out(`strut ${tag} ${m / 1000}t: main dx, zeta, fn | nose dx, zeta`, [f(mm * g / km, 3), f(cm / (2 * Math.sqrt(km * mm)), 3), f(Math.sqrt(km / mm) / (2 * Math.PI), 3), f(mn * g / kn, 3), f(cn / (2 * Math.sqrt(kn * mn)), 3)]);
  }
  const mm = 187000 * 0.94 / 2, mn = 187000 * 0.06;
  out('c for zeta 0.6 nose/main (94/6)', [f(1.2 * Math.sqrt(kn * mn), 0), f(1.2 * Math.sqrt(km * mm), 0)]);
}

console.log('\n== 14. LEMAC / tail volume ==');
out('LEMAC = 30.77 - 0.25*7.27', f(30.77 - 0.25 * 7.27, 3));

console.log('\n== 15. legacy blend (code stallBlend M = 55, out of ground effect) ==');
{ const sb = (a, a0) => { const M = 55, e1 = Math.exp(-M * (a - a0)), e2 = Math.exp(M * (a + a0)); return (1 + e1 + e2) / ((1 + e1) * (1 + e2)); };
  const L = { CL0: 0.116, CLa: 5.072, CLflap: 0.885, aStall: 16.59, aStallFlap: 4.16 };
  const peak = fl => { let best = -1, at = 0; for (let ad = 0; ad <= 30; ad += 0.005) { const a = ad * D2R, s = sb(a, (L.aStall + L.aStallFlap * fl) * D2R); const CL = (1 - s) * (L.CL0 + L.CLflap * fl + L.CLa * a) + s * 2 * Math.sin(a) ** 2 * Math.cos(a); if (CL > best) { best = CL; at = ad; } } return [f(best, 3), f(at, 2)]; };
  for (const fl of [0, 0.015, 0.354, 0.563, 0.753, 1]) out('flaps ' + fl + ' CLmax, alpha', peak(fl));
  out('flapMap fractions', [0.129, 0.429, 0.614, 0.782].map(x => f((x - 0.116) / 0.885, 4)));
  out('trim alpha clean (Cm0/Cma), FULL ((Cm0+Cmflap)/Cma) deg', [f(0.0722 / 0.963 / D2R, 2), f((0.0722 + 0.0243) / 0.963 / D2R, 2)]);
}
