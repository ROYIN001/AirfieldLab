// Reviewer (หัวข้อ 3.3) — unit conversions, inertia, wake, ground roll, steering, H-arm, wave drag, polar, trim
const KT = 0.514444, g = 9.80665, LB = 0.45359237, IN = 0.0254, FT = 0.3048, SLUGFT2 = 1.3558179, PSI = 6.894757;
const r = (x, n = 3) => +x.toFixed(n);
console.log('--- units ---');
console.log('73500 kg lb', r(73500 / LB, 0), '64500', r(64500 / LB, 0), '60500', r(60500 / LB, 0), '79000', r(79000 / LB, 0), '67400', r(67400 / LB, 0), '97000', r(97000 / LB, 0), '79200', r(79200 / LB, 0), '77800', r(77800 / LB, 0));
console.log('MAC 165.10 in', r(165.10 * IN, 4), 'LEMAC 700.85 in', r(700.85 * IN, 4), 'LEMAC-100in', r(600.85 * IN, 4), 'CG25 H', r((700.85 + 0.25 * 165.10) * IN, 4));
console.log('H-arm test 18.850 ->', r((18.850 - 17.8016) / 0.041935, 3), '%');
console.log('VMO 350kt', r(350 * KT, 1), '195 kt', r(195 * KT, 1), '225 mph', r(225 * 0.44704, 1), '20kt', r(20 * KT, 2), '40kt', r(40 * KT, 2), '80kt', r(80 * KT, 2), '130kt', r(130 * KT, 2));
console.log('39100 ft', r(39100 * FT, 0), '39000', r(39000 * FT, 0), '25000', r(25000 * FT, 0));
console.log('psi 193', r(193 * PSI, 0), '200', r(200 * PSI, 0), '195', r(195 * PSI, 0), '199', r(199 * PSI, 0), '13.3 bar?', r(193 * PSI / 100, 2));
console.log('lb 46700 N', r(46700 * LB * g, 0), '14200', r(14200 * LB * g, 0));
console.log('fuel L*0.785', [24209, 23859, 23740, 24050, 23700, 23490, 32943].map(L => r(L * 0.785, 0)).join(' '));
console.log('NM 3500 km', r(3500 * 1.852, 0), 'fpm 2500 m/s', r(2500 * FT / 60, 2));
console.log('S 1320 ft2 m2', r(1320 * FT * FT, 2), 'FBW 1317.47', r(1317.47 * FT * FT, 2), 'AR 34.1', r(34.1 ** 2 / 122.6, 3), 'AR 35.8', r(35.8 ** 2 / 122.6, 3));
console.log('spring 59785 lbf/ft', r(59785 * LB * g / FT, 0), 'damp 23957', r(23957 * LB * g / FT, 0), 'nose 30935.5', r(30935.5 * LB * g / FT, 0), '16978.5', r(16978.5 * LB * g / FT, 0));
console.log('--- inertia ---');
const src = { jsb: [111000, 942877, 2.78892e6, 3.59757e6, 111.3 * FT], fbw: [93697, 989005, 2453714, 3166138, 117.454 * FT], fg: [80431, 611903, 1735389, 1401293, 117.26 * FT] };
const L320 = 37.57;
for (const [k, [w, ixx, iyy, izz, bb]] of Object.entries(src)) {
  const m = w * LB, Ix = ixx * SLUGFT2, Iy = iyy * SLUGFT2, Iz = izz * SLUGFT2;
  for (const b of [34.1, bb]) { const e = (b + L320) / 2;
    console.log(k, 'm', r(m, 0), 'I', r(Ix, 0), r(Iy, 0), r(Iz, 0), 'b', r(b, 2), 'Rx', r(2 * Math.sqrt(Ix / m) / b), 'Ry', r(2 * Math.sqrt(Iy / m) / L320), 'Rz', r(2 * Math.sqrt(Iz / m) / e), '(Ixx+Iyy)/Izz', r((Ix + Iy) / Iz)); }
}
const I = (m, b, L, R = [0.305, 0.466, 0.549]) => [m * (R[0] * b / 2) ** 2, m * (R[1] * L / 2) ** 2, m * (R[2] * (b + L) / 4) ** 2].map(x => r(x / 1e6, 3));
console.log('A320ceo MLW', I(64500, 34.1, 37.57), '60t', I(60000, 34.1, 37.57), 'MTOW', I(73500, 34.1, 37.57));
console.log('A320neo MLW', I(67400, 35.8, 37.57), 'A321neo MLW', I(79200, 35.8, 44.51), 'A321ceo', I(75500, 34.1, 44.51));
{ const [x, , z] = I(64500, 34.1, 37.57); console.log('Izz/(Ixx+Iyy)', r(z / (x + I(64500, 34.1, 37.57)[1]), 3), 'Ixz_s', r(0.5 * (x - z) * 1e6 * Math.sin(2 * 4.5 * Math.PI / 180), 0)); }
console.log('--- wake ---');
const wake = (m, b, V, rho) => { const b0 = Math.PI / 4 * b, G = m * g / (rho * V * KT * b0); return [r(G, 1), r(G / (2 * Math.PI * b0), 3)]; };
for (const c of [[64500, 34.1, 133.5], [64500, 35.8, 133.5], [67400, 35.8, 136.4], [79200, 35.8, 143], [75500, 34.1, 145.5], [75500, 34.1, 145.6]]) console.log(c, wake(...c, 1.225), wake(...c, 1.1262));
// rho at 1000 ft, 31 C: ISA p
const p1000 = 101325 * (1 - 2.25577e-5 * 304.8) ** 5.25588; console.log('rho 1000ft 31C', r(p1000 / (287.053 * (273.15 + 31)), 4), 'rho SL 31C', r(101325 / (287.053 * 304.15), 4));
console.log('--- ground roll s = V td + V^2/2a ---');
for (const V of [130, 120]) for (const [a, td] of [[1.7, 4], [3.0, 2]]) console.log(V, a, td, r(V * KT * td + (V * KT) ** 2 / (2 * a), 0));
console.log('50ft/tan3', r(15.24 / Math.tan(3 * Math.PI / 180), 1), 'sink 133.5', r(133.5 * KT * Math.sin(3 * Math.PI / 180) / FT * 60, 0), '143.3', r(143.3 * KT * Math.sin(3 * Math.PI / 180) / FT * 60, 0));
console.log('LFL*0.6', 1440 * 0.6, 1600 * 0.6, 1580 * 0.6, '1440 m ft', r(1440 / FT, 0));
console.log('--- steering ---');
const till = v => v <= 20 ? 75 : v >= 80 ? 0 : 75 * (80 - v) / 60, ped = v => v <= 40 ? 6 : v >= 130 ? 0 : 6 * (130 - v) / 90;
console.log([0, 20, 50, 80].map(till), [0, 40, 85, 130].map(ped));
console.log('--- wave drag (OpenAP) ---');
const sw = 25 * Math.PI / 180, c = Math.cos(sw); const Mc = cl => 0.95 / c - 0.12 / c ** 2 - 0.1 * cl / c ** 3 - 0.108;
console.log('Mcrit CL0.5', r(Mc(0.5), 4), [0.7, 0.74, 0.78, 0.8, 0.82, 0.84, 0.86].map(M => r(20 * Math.max(0, M - Mc(0.5)) ** 4, 5)).join(' '), 'MDD', r(Mc(0.5) + Math.pow(0.002 / 20, 0.25), 4));
console.log('--- polar ---');
const CD0 = 0.0182, K = 0.0386; console.log('L/Dmax', r(1 / (2 * Math.sqrt(CD0 * K)), 2), 'CL*', r(Math.sqrt(CD0 / K), 3));
const KF = 1 / (Math.PI * 9.485 * 0.70); const CLa = 2 * 64500 * g / (1.225 * 122.6 * (133.5 * KT) ** 2); const CDa = CD0 + 0.05 + 0.017 + KF * CLa ** 2;
console.log('KFULL', r(KF, 4), 'CL app', r(CLa, 3), 'CD', r(CDa, 4), 'L/D', r(CLa / CDa, 2), 'T = W(sin g + cos g /LD)?', r(64500 * g * (CDa / CLa * Math.cos(3 * Math.PI / 180) - Math.sin(3 * Math.PI / 180)) / 1000, 1), 'kN');
// L/Dmax FULL gear down
{ const cd0 = CD0 + 0.05 + 0.017; console.log('L/Dmax FULL gear', r(1 / (2 * Math.sqrt(cd0 * KF)), 2)); }
// cruise
{ const T = 218.808, a = Math.sqrt(1.4 * 287.053 * T), p = 23842; const q = 0.7 * p * 0.78 ** 2; const CLc = 65000 * g / (q * 122.6); console.log('cruise q', r(q, 0), 'CL', r(CLc, 3), 'TAS kt', r(0.78 * a / KT, 1)); }
